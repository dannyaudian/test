/* Commercial filing trail · Frontman → Admin → KA/KC/ABH/OM → Finance HO */
  var HO_FILE_STEPS=[
    {id:'draft', role:'frontman', label:'Frontman'},
    {id:'submitted', role:'admin', label:'Administration'},
    {id:'ka', role:'mgmt', seat:'ka', label:'Head of Administration'},
    {id:'kc', role:'mgmt', seat:'kc', label:'Branch Head'},
    {id:'abh', role:'mgmt', seat:'abh', label:'Area Business Head'},
    {id:'om', role:'mgmt', seat:'om', label:'Operation Manager'},
    {id:'ho', role:'finance', label:'Finance HO'}
  ];
  var HO_FILE_NEXT={draft:'submitted',submitted:'ka',ka:'kc',kc:'abh',abh:'om',om:'ho'};
  var HO_FILE_BACK={submitted:'draft',ka:'submitted',kc:'ka',abh:'kc',om:'abh',ho:'om'};
  FAST.HO_FILE_KEY='fast.ho.file';
  var hoFilePick='st-bsd';
  function hoFileRows(){
    return (FAST.HO_APPR||[]).filter(function(r){ return r.live; });
  }
  function hoFileRow(id){
    return (FAST.HO_APPR||[]).filter(function(r){ return r.id===id; })[0]||hoFileRows()[0];
  }
  function hoFileStore(){
    return (FAST.load && FAST.load(FAST.HO_FILE_KEY))||{};
  }
  function hoFileSave(states){
    if(FAST.save) FAST.save({states:states}, FAST.HO_FILE_KEY);
  }
  function hoFileState(id){
    var st=(hoFileStore().states||{})[id];
    if(st && st.step) return st;
    return {step:'draft', times:{}, comment:''};
  }
  function hoFileStep(id){
    var st=hoFileState(id);
    if(st.step==='rejected') return 'rejected';
    var ho=FAST.hoApprDecision && FAST.hoApprDecision(id);
    if(ho==='approved') return 'ho';
    if(ho==='returned') return 'om';
    if(ho==='rejected') return 'rejected';
    return st.step||'draft';
  }
  function hoFileStepMeta(step){
    if(step==='rejected') return {id:'rejected', role:'frontman', label:'Rejected'};
    return HO_FILE_STEPS.filter(function(s){ return s.id===step; })[0]||HO_FILE_STEPS[0];
  }
  function nowLbl(){
    try{
      return new Date().toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
    }catch(e){ return 'Now'; }
  }
  function hoFileReason(row){
    if(row.type==='sales' && row.fromPay==='Leasing') return 'Customer cancelled the leasing application. Branch requests cash.';
    if(row.type==='sales') return 'Customer switched to leasing after a cash booking.';
    return 'Customer moved the facility to another lessor.';
  }
  function hoFileGates(row){
    if(row.type==='sales' && row.toPay==='Cash'){
      return [
        ['ok','Cash billing gate','≥30% of funds received · not waived by this filing','Still required'],
        ['ok','Cash delivery gate','Paid in full · not waived','Still required'],
        ['ok','This filing','HO posts the method after the branch chain','Last seat']
      ];
    }
    if(row.type==='sales'){
      return [
        ['ok','Leasing billing gate','Full DP from B2B + e-PO · not waived','Still required'],
        ['ok','Leasing delivery gate','Signed contract · not waived','Still required'],
        ['ok','e-PO','Required after the method change','Still required']
      ];
    }
    return [
      ['ok','Incoming lessor','PT Sentosa Auto Finance · new e-PO still required','Still required'],
      ['ok','Full DP / signature','HO does not waive either gate','Still required'],
      ['ok','This filing','Partner change only','Last seat']
    ];
  }
  function pathHtml(step, done){
    return HO_FILE_STEPS.map(function(s,i){
      var cur=s.id===step && !done;
      var ok=done || HO_FILE_STEPS.findIndex(function(x){ return x.id===step; })>i;
      if(step==='approved') ok=true;
      var cls=cur?'on':ok?'ok':'';
      return (i?'<span>→</span>':'')+'<b data-step="'+s.id+'" class="'+cls+'">'+s.label+'</b>';
    }).join('');
  }
  function chainHtml(row, st){
    var step=st.step;
    var ho=FAST.hoApprDecision && FAST.hoApprDecision(row.id);
    var times=st.times||{};
    function item(id, label){
      var on=step===id && ho!=='approved' && ho!=='rejected';
      var done=!!times[id] || ho==='approved' || (HO_FILE_STEPS.findIndex(function(s){ return s.id===id; }) < HO_FILE_STEPS.findIndex(function(s){ return s.id===step; }));
      if(id==='ho' && (ho==='approved'||step==='ho')) done=ho==='approved';
      var cls=on?'now':(done?'on':'');
      var val=on?(id==='ho'?'Awaiting HO':'Now'):(times[id]||(done?'Done':'Pending'));
      if(ho==='approved' && id==='ho') val='HO approved';
      if(ho==='rejected' && id==='ho') val='HO rejected';
      return '<li class="'+cls+'"><span>'+label+'</span><b>'+val+'</b></li>';
    }
    return HO_FILE_STEPS.map(function(s){ return item(s.id, s.label); }).join('');
  }
  function cardsHtml(row){
    if(row.type==='sales'){
      return '<div class="card"><p class="k">From</p><p class="v" style="font-size:18px">'+row.fromPay+'</p><p class="n">Current method</p></div>'+
        '<div class="card"><p class="k">To</p><p class="v" style="font-size:18px">'+row.toPay+'</p><p class="n">Requested method</p></div>'+
        '<div class="card"><p class="k">Lessor</p><p class="v" style="font-size:16px">'+(row.partner||'—')+'</p><p class="n">Unchanged until HO posts</p></div>'+
        '<div class="card"><p class="k">Desk</p><p class="v" style="font-size:18px">Finance HO last</p><p class="n">Not the leasing book</p></div>';
    }
    return '<div class="card"><p class="k">From lessor</p><p class="v" style="font-size:16px">'+row.fromPartner+'</p><p class="n">Current</p></div>'+
      '<div class="card"><p class="k">To lessor</p><p class="v" style="font-size:16px">'+row.toPartner+'</p><p class="n">Incoming</p></div>'+
      '<div class="card"><p class="k">Method</p><p class="v" style="font-size:18px">Leasing</p><p class="n">Unchanged</p></div>'+
      '<div class="card"><p class="k">New e-PO</p><p class="v" style="font-size:18px">Still required</p><p class="n">Not waived</p></div>';
  }
  function fieldsHtml(row){
    return '<div class="frow locked"><i class="own s">S</i><span class="lab">SPK</span><span class="val">'+(row.spk||'—')+'</span><span class="src">Source</span></div>'+
      '<div class="frow locked"><i class="own s">S</i><span class="lab">Sales Order</span><span class="val">'+row.so+'</span><span class="src">Linked</span></div>'+
      '<div class="frow locked"><i class="own f">F</i><span class="lab">Buyer · unit</span><span class="val">'+(row.buyer||'')+' · '+row.unit+'</span><span class="src">'+row.cabang+'</span></div>'+
      '<div class="frow locked"><i class="own f">F</i><span class="lab">Request</span><span class="val">'+row.kind+'</span><span class="src">Commercial filing</span></div>';
  }
  function gatesHtml(row){
    return hoFileGates(row).map(function(g){
      return '<li><span class="mark ok">✓</span><div>'+g[1]+'<span class="why">'+g[2]+'</span></div><span class="tag stop">'+g[3]+'</span></li>';
    }).join('');
  }
  function footHtml(row, st){
    var role=typeof currentRole!=='undefined'?currentRole:'frontman';
    var step=st.step;
    var ho=FAST.hoApprDecision && FAST.hoApprDecision(row.id);
    if(ho==='approved') return '<p class="hint">HO already posted. Commercial gates were not waived.</p>';
    if(ho==='rejected') return '<p class="hint">HO rejected. Existing method / lessor stands.</p>';
    var need=hoFileStepMeta(step);
    if(role==='frontman'){
      if(step!=='draft') return '<p class="hint">Submitted. Watch the trail — Administration is next, then KA · KC · ABH · OM · Finance HO.</p><button type="button" class="btn ghost" data-go="beranda">← My Transactions</button>';
      return '<p class="hint">Submit on this SO. Do not open Exceptions.</p><button type="button" class="btn" data-ho-file-act="submit">Submit filing</button>';
    }
    if(role==='admin'){
      if(step==='draft') return '<p class="hint">Frontman has not submitted yet. Do not retype.</p>';
      if(step!=='submitted') return '<p class="hint">Pack already checked. Chain is with '+(need.label)+'.</p>';
      return '<p class="hint">Check the pack. You do not post the method or partner.</p><button type="button" class="btn" data-ho-file-act="verify">Mark pack checked</button>';
    }
    if(role==='mgmt'){
      var seat=typeof mgmtSeat!=='undefined'?mgmtSeat:'ka';
      if(need.role!=='mgmt') return '<p class="hint">This seat is not up. Current: '+need.label+'.</p>';
      if(need.seat!==seat) return '<p class="hint">Switch the Management seat to '+need.label+' — same SO, not the Engine queue.</p>';
      return '<label class="ho-appr-note" style="flex:1;margin:0">Comment (required to return or reject)<textarea data-ho-file-comment rows="2" placeholder="Why approve, return, or reject"></textarea></label>'+
        '<button type="button" class="btn" data-ho-file-act="approve">Approve · send on</button>'+
        '<button type="button" class="btn ghost" data-ho-file-act="return">Return</button>'+
        '<button type="button" class="btn ghost" data-ho-file-act="reject">Reject</button>';
    }
    if(role==='finance'){
      return '<p class="hint">Post on the Approvals desk.</p><button type="button" class="btn" data-ho-file-to-ho>Open Approvals →</button>';
    }
    return '';
  }
  function applyHoFile(){
    var rows=hoFileRows();
    document.querySelectorAll('[data-ho-file-pill]').forEach(function(el){
      var seat=typeof mgmtSeat!=='undefined'?mgmtSeat:'ka';
      var n=rows.filter(function(r){ var st=hoFileState(r.id); return st.step===seat; }).length;
      el.textContent=String(n);
    });
    var list=document.querySelector('[data-ho-file-list]');
    if(list){
      list.innerHTML=rows.map(function(r){
        var st=hoFileState(r.id);
        var meta=hoFileStepMeta(st.step);
        var ho=FAST.hoApprDecision && FAST.hoApprDecision(r.id);
        var tag=ho==='approved'?'ok':(st.step==='draft'?'wait':'hold');
        var lab=ho==='approved'?'HO posted':meta.label;
        return '<button type="button" class="order-card" data-go="ho_file" data-ho-file-pick="'+r.id+'">'+
          '<div class="thumb">'+(r.type==='partner'?'LSR':(r.fromPay==='Leasing'?'L→C':'C→L'))+'</div>'+
          '<div class="meta"><p class="oid">'+r.so+' · '+r.cabang+'</p><strong class="oname">'+r.kind+' · '+(r.buyer||r.unit)+'</strong>'+
          '<p class="spec">Not Approval Engine. Current seat: '+lab+'.</p>'+
          '<div class="row2"><span class="tag '+tag+'">'+lab+'</span><span class="amt">'+r.unit+'</span></div>'+
          '<p class="cta">Open same SO →</p></div></button>';
      }).join('')||'<p class="hint">No live filings.</p>';
    }
    var seatN=document.querySelector('[data-ho-file-chain-n]');
    if(seatN){
      var seat=typeof mgmtSeat!=='undefined'?mgmtSeat:'ka';
      var n=rows.filter(function(r){ return hoFileState(r.id).step===seat; }).length;
      seatN.textContent=n+' on this seat';
    }
    var row=hoFileRow(hoFilePick);
    if(!row) return;
    var st=hoFileState(row.id);
    var ho=FAST.hoApprDecision && FAST.hoApprDecision(row.id);
    var step=ho==='approved'?'approved':st.step;
    var set=function(sel, html, text){
      document.querySelectorAll(sel).forEach(function(el){
        if(html!=null) el.innerHTML=html;
        else el.textContent=text;
      });
    };
    set('[data-ho-file-kicker]', null, (row.spk||'')+' · commercial filing · not Approval Engine');
    set('[data-ho-file-title]', null, row.kind+' · '+row.unit);
    set('[data-ho-file-lead]', null, 'SO '+row.so+' · '+row.cabang+' · '+(row.buyer||'')+'. Same trail to Finance HO. '+hoFileReason(row)+' Commercial gates stay non-waivable.');
    var path=document.querySelector('[data-ho-file-path]');
    if(path) path.innerHTML=pathHtml(st.step, ho==='approved');
    var note=document.querySelector('[data-ho-file-note]');
    if(note){
      var meta=hoFileStepMeta(st.step);
      note.textContent=ho==='approved'
        ? 'HO posted. Cash 30% / paid in full and leasing DP / signature / e-PO were not waived.'
        : (hoFileReason(row)+' Now: '+meta.label+'. Not the Approval Engine.');
      note.className='exc-note '+(ho==='approved'?'ok':'warn');
    }
    var cards=document.querySelector('[data-ho-file-cards]');
    if(cards) cards.innerHTML=cardsHtml(row);
    var fields=document.querySelector('[data-ho-file-fields]');
    if(fields) fields.innerHTML=fieldsHtml(row);
    var gates=document.querySelector('[data-ho-file-gates]');
    if(gates) gates.innerHTML=gatesHtml(row);
    var body=document.querySelector('[data-ho-file-body]');
    if(body) body.innerHTML='<p class="ho-note">'+row.reason+'</p>';
    var chain=document.querySelector('[data-ho-file-chain]');
    if(chain) chain.innerHTML=chainHtml(row, st);
    var foot=document.querySelector('[data-ho-file-foot]');
    if(foot) foot.innerHTML=footHtml(row, st);
    document.querySelectorAll('[data-ho-file-admin-row]').forEach(function(tr){
      var id=tr.getAttribute('data-ho-file-admin-row');
      var s=hoFileState(id);
      tr.hidden=s.step!=='submitted';
    });
    document.querySelectorAll('[data-ho-file-home]').forEach(function(card){
      var id=card.getAttribute('data-ho-file-home');
      var s=hoFileState(id);
      var tag=card.querySelector('[data-ho-file-home-tag]');
      var spec=card.querySelector('[data-ho-file-home-spec]');
      var meta=hoFileStepMeta(s.step);
      if(tag){
        tag.textContent=meta.label;
        tag.className='tag '+(s.step==='draft'?'wait':'hold');
      }
      if(spec) spec.textContent=s.step==='draft'?'Action: submit commercial filing on this SO':'On chain · '+meta.label+' · same SO to Finance HO';
    });
  }
  function hoFileAct(act){
    var row=hoFileRow(hoFilePick);
    if(!row) return;
    var states=hoFileStore().states||{};
    var st=hoFileState(row.id);
    var role=typeof currentRole!=='undefined'?currentRole:'frontman';
    if(act==='submit'){
      if(role!=='frontman'||st.step!=='draft') return;
      st.step='submitted';
      st.times=st.times||{};
      st.times.draft=nowLbl();
      states[row.id]=st;
      hoFileSave(states);
      if(typeof toast==='function') toast('Filing submitted on this SO. Administration checks the pack next.');
    } else if(act==='verify'){
      if(role!=='admin'||st.step!=='submitted') return;
      st.step='ka';
      st.times=st.times||{};
      st.times.submitted=nowLbl();
      states[row.id]=st;
      hoFileSave(states);
      if(typeof toast==='function') toast('Pack checked. Head of Administration is next — still this SO, not the Engine.');
    } else if(act==='approve'||act==='return'||act==='reject'){
      if(role!=='mgmt') return;
      var need=hoFileStepMeta(st.step);
      var seat=typeof mgmtSeat!=='undefined'?mgmtSeat:'ka';
      if(need.seat!==seat){
        if(typeof toast==='function') toast('Switch to '+need.label+' on this SO.');
        return;
      }
      var box=document.querySelector('[data-ho-file-comment]');
      var comment=((box&&box.value)||'').trim();
      if((act==='return'||act==='reject') && !comment){
        if(typeof toast==='function') toast('Add a comment to return or reject.');
        if(box) box.focus();
        return;
      }
      st.times=st.times||{};
      st.comment=comment;
      if(act==='approve'){
        st.times[st.step]=nowLbl();
        st.step=HO_FILE_NEXT[st.step]||'ho';
        states[row.id]=st;
        hoFileSave(states);
        if(st.step==='ho'){
          if(typeof toast==='function') toast('OM approved. Switch to Finance HO — Approvals desk, same filing.');
        } else if(typeof toast==='function') toast('Approved. Next seat stays on this Sales Order.');
      } else if(act==='return'){
        st.step=HO_FILE_BACK[st.step]||'draft';
        states[row.id]=st;
        hoFileSave(states);
        if(typeof toast==='function') toast('Returned on the same trail.');
      } else {
        st.step='rejected';
        states[row.id]=st;
        hoFileSave(states);
        if(typeof toast==='function') toast('Rejected. Existing method / lessor stands. Not a gate waiver.');
      }
    }
    applyHoFile();
    if(typeof applyFinanceHo==='function') applyFinanceHo();
  }
  document.addEventListener('click',function(e){
    var pick=e.target.closest('[data-ho-file-pick]');
    if(pick){
      hoFilePick=pick.getAttribute('data-ho-file-pick')||hoFilePick;
      if(pick.getAttribute('data-go')==='ho_file' && typeof show==='function') show('ho_file');
    }
    var toHo=e.target.closest('[data-ho-file-to-ho]');
    if(toHo){
      if(typeof applyRole==='function') applyRole('finance');
      if(FAST.hoOpen) FAST.hoOpen({view:'appr', pick:hoFilePick});
      if(typeof show==='function') show('finance_ho');
      return;
    }
    var act=e.target.closest('[data-ho-file-act]');
    if(act){
      hoFileAct(act.getAttribute('data-ho-file-act'));
    }
  });
  FAST.hoFileOpen=function(id){ if(id) hoFilePick=id; };
  FAST.hoFileStep=hoFileStep;
  FAST.hoFileState=hoFileState;
  FAST.applyHoFile=applyHoFile;
  FAST.HO_FILE_CASE={
    file_sales:{pick:'st-bsd'},
    file_sales_cash:{pick:'st-bks'},
    file_partner:{pick:'lp-tng'},
    ho_file:{pick:null},
    ho_chain:{view:'chain'}
  };
  Object.defineProperty(FAST,'hoFilePick',{ get:function(){ return hoFilePick; } });
  applyHoFile();

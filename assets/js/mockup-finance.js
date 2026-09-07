/* Finance HO · buku B2B leasing */
  var HO_NOW=new Date('2026-09-07T12:00:00+07:00').getTime();
  var DAY=86400000;
  function hoIdr(n){
    n=Math.round(n||0);
    if(n>=1e9) return 'Rp '+(n/1e9).toFixed(1)+'bn';
    if(n>=1e6) return 'Rp '+Math.round(n/1e6).toLocaleString('en-US')+'m';
    return 'Rp '+n.toLocaleString('id-ID');
  }
  function hoDays(from, to){
    if(!from) return null;
    return Math.max(0, Math.round(((to||HO_NOW)-from)/DAY));
  }
  function hoBand(d){
    if(d==null) return -1;
    if(d<=7) return 0;
    if(d<=14) return 1;
    if(d<=30) return 2;
    return 3;
  }
  function hoMedian(arr){
    if(!arr.length) return null;
    var a=arr.slice().sort(function(x,y){ return x-y; });
    var m=Math.floor(a.length/2);
    return a.length%2?a[m]:Math.round((a[m-1]+a[m])/2);
  }
  var HO_BOOK=[
    { id:'2101', live:false, cabang:'Kelapa Gading', unit:'Innova Zenix', debitur:'PT Danapura Logistik', so:'4500092101', spk:'SPK/26/KLD/00210', finance:329600000, dpLabel:'Rp 82.400.000', kwt:'KWT/26/KLD/008201', bucket:'billed', paperlessAt:HO_NOW-18*DAY, kwtAt:HO_NOW-17*DAY, note:'Paperless 21 Aug · receipt live · partner has not settled' },
    { id:'1888', live:false, cabang:'BSD', unit:'Fortuner 2.8', debitur:'PT Danapura Armada', so:'4500091888', spk:'SPK/26/BSD/00188', finance:412500000, dpLabel:'Rp 103.125.000', kwt:'KWT/26/BSD/007188', bucket:'billed', paperlessAt:HO_NOW-41*DAY, kwtAt:HO_NOW-40*DAY, note:'Aging 41 days · above the 14-day SLA' },
    { id:'2033', live:false, cabang:'Serpong', unit:'Alphard', debitur:'PT Danapura Utama', so:'4500092033', spk:'SPK/26/SRP/00203', finance:891000000, dpLabel:'Rp 222.750.000', kwt:'KWT/26/SRP/008033', bucket:'billed', paperlessAt:HO_NOW-6*DAY, kwtAt:HO_NOW-6*DAY, note:'Newly billed · still inside SLA' },
    { id:'1750', live:false, cabang:'Pondok Indah', unit:'Rush GR Sport', debitur:'CV Danapura Niaga', so:'4500091750', spk:'SPK/26/PDI/00175', finance:221400000, dpLabel:'Rp 55.350.000', kwt:'KWT/26/PDI/006750', bucket:'lunas', paperlessAt:HO_NOW-31*DAY, kwtAt:HO_NOW-30*DAY, lunasAt:HO_NOW-19*DAY, note:'Settled 19 days after paperless' },
    { id:'1620', live:false, cabang:'Bekasi', unit:'Avanza 1.5', debitur:'PT Danapura Retail', so:'4500091620', spk:'SPK/26/BKS/00162', finance:168800000, dpLabel:'Rp 42.200.000', kwt:'KWT/26/BKS/006162', bucket:'lunas', paperlessAt:HO_NOW-52*DAY, kwtAt:HO_NOW-51*DAY, lunasAt:HO_NOW-25*DAY, note:'Settled in 27 days · outside SLA' },
    { id:'1944', live:false, cabang:'Cilandak', unit:'Camry HV', debitur:'PT Danapura Utama', so:'4500091944', spk:'SPK/26/CLD/00194', finance:445000000, dpLabel:'Rp 111.250.000', kwt:'', bucket:'unbilled', ready:true, note:'Pack + DP + e-PO complete · Administration has not sent paperless' },
    { id:'1812', live:false, cabang:'Depok', unit:'Raize 1.0', debitur:'PT Danapura Armada', so:'4500091812', spk:'SPK/26/DPK/00181', finance:198700000, dpLabel:'Rp 49.675.000', kwt:'', bucket:'unbilled', ready:false, hold:'Leasing e-PO not issued', note:'Full DP in · paperless held on e-PO (not a DP waiver)' }
  ];
  function hoParseAmt(label){
    var row=(FAST.B2B_SO||[]).filter(function(x){ return x.id===label || x.so===label; })[0];
    if(!row) return 0;
    var n=String(row.financeLabel||'').replace(/[^\d]/g,'');
    return Number(n)||0;
  }
  function hoLiveRows(){
    if(!window.FAST || !FAST.b2bLoad) return [];
    var s=FAST.b2bLoad();
    return (FAST.B2B_SO||[]).map(function(meta){
      var u=s.units[meta.id]||{};
      var flow=FAST.b2bDerive(u);
      var billed=!!u.paperlessSent && !u.lunas;
      var lunas=!!u.lunas;
      var ready=typeof FAST.b2bAdminCanBill==='function' && FAST.b2bAdminCanBill(u) && !u.paperlessSent;
      var finance=hoParseAmt(meta.id);
      var paper=u.paperlessAt||null;
      var kwt=u.kwtAt||null;
      var lun=u.lunasAt||null;
      var bucket=lunas?'lunas':(billed?'billed':'unbilled');
      var hold='';
      if(bucket==='unbilled' && !ready){
        if(u.backflow) hold='Document backflow';
        else if(!u.signedContract) hold='Contract not signed';
        else if(!u.dpReceived) hold='Full DP not received';
        else if(!FAST.b2bEpoOk(u)) hold='E-PO / OM decision';
        else hold='Frontman billing pack';
      }
      var note=lunas?'Settlement recorded on this SO':(billed?(u.kwtIssued?('Receipt '+meta.kwt+' · waiting for partner settlement'):'Paperless sent · receipt not issued'):(ready?'Ready for Administration to bill':hold));
      return {
        id:meta.id, live:true, cabang:'Cilandak', unit:meta.unit, debitur:'PT Danapura Utama',
        so:meta.so, spk:'SPK/26/CLD/00421', finance:finance, dpLabel:meta.dpLabel, kwt:meta.kwt,
        bucket:bucket, ready:ready, hold:hold, note:note, flow:flow,
        paperlessAt:paper, kwtAt:kwt, lunasAt:lun
      };
    });
  }
  function hoPortfolio(){
    return hoLiveRows().concat(HO_BOOK);
  }
  function hoAgingDays(row){
    if(row.bucket==='lunas') return hoDays(row.paperlessAt, row.lunasAt);
    if(row.bucket==='billed') return hoDays(row.paperlessAt, HO_NOW);
    return null;
  }
  var hoView='all';
  var hoPick=null;
  function hoPos(row){
    var age=hoAgingDays(row);
    if(row.bucket==='lunas') return {cls:'lunas', text:'Settled'};
    if(row.bucket==='billed') return {cls:age>14?'late':'billed', text:age>14?'Billed · SLA':'Billed, unpaid'};
    if(row.ready) return {cls:'ready', text:'Ready to bill'};
    return {cls:'hold', text:row.hold||'Unbilled'};
  }
  function hoRowHtml(row){
    var age=hoAgingDays(row);
    var pos=hoPos(row);
    var ageTxt=age==null?'—':age+' days';
    var kwt=row.bucket==='unbilled'?'—':(row.kwt||'Awaiting issue');
    return '<tr data-ho-row="'+row.id+'">'+
      '<td><b>'+row.so+'</b><span class="sub">'+row.cabang+' · '+row.spk+(row.live?' · live':'')+'</span></td>'+
      '<td>'+row.debitur+'<span class="sub">'+row.unit+'</span></td>'+
      '<td>'+hoIdr(row.finance)+'</td>'+
      '<td><span class="ho-pos '+pos.cls+'">'+pos.text+'</span></td>'+
      '<td class="'+(age>14?'ho-age late':'')+'">'+ageTxt+'</td>'+
      '<td>'+kwt+'</td>'+
      '</tr>';
  }
  function hoDossier(row){
    if(!row){
      return '<p>Select a ledger row. The dossier stays in the HO portal — it does not open Frontman, Administration, or Management screens.</p>';
    }
    var age=hoAgingDays(row);
    var pos=hoPos(row);
    var steps=[
      ['SPK', true],
      ['SO', true],
      ['Paperless', row.bucket!=='unbilled' || !!row.paperlessAt],
      ['Receipt', !!(row.kwt && row.bucket!=='unbilled')],
      ['Settled', row.bucket==='lunas']
    ];
    var stepHtml=steps.map(function(s){ return '<i class="'+(s[1]?'on':'')+'">'+s[0]+'</i>'; }).join('');
    return '<p class="ho-line"><span>Sales Order</span><b>'+row.so+'</b></p>'+
      '<p class="ho-line"><span>SPK</span><b>'+row.spk+'</b></p>'+
      '<p class="ho-line"><span>Branch</span><b>'+row.cabang+(row.live?' · live from Cilandak':'')+'</b></p>'+
      '<p class="ho-line"><span>Debtor</span><b>'+row.debitur+'</b></p>'+
      '<p class="ho-line"><span>Unit</span><b>'+row.unit+'</b></p>'+
      '<p class="ho-line"><span>Financed</span><b>'+hoIdr(row.finance)+'</b></p>'+
      '<p class="ho-line"><span>Required B2B DP</span><b>'+(row.dpLabel||'—')+'</b></p>'+
      '<p class="ho-line"><span>Status</span><b>'+pos.text+(age!=null?' · '+age+' days':'')+'</b></p>'+
      '<p class="ho-line"><span>Receipt</span><b>'+(row.kwt||'Not issued')+'</b></p>'+
      '<div class="ho-steps">'+stepHtml+'</div>'+
      '<p class="ho-note">'+row.note+'. Finance HO does not bill and does not waive DP or signature — branch Administration runs paperless.</p>';
  }

  var HO_APPR_SEATS=[
    {id:'ka', label:'Head of Administration'},
    {id:'kc', label:'Branch Head'},
    {id:'abh', label:'Area Business Head'},
    {id:'om', label:'Operation Manager'}
  ];
  var HO_APPR=[
    { id:'pa-cld', type:'price', kind:'Price adjustment', topic:'Karoseri', pay:'Cash', so:'4500090421', cabang:'Cilandak', unit:'Hiace Premio',
      fromOtr:548000000, toOtr:566500000, delta:18500000,
      reason:'Branch filed a karoseri box-body add-on after the SO was priced at stock OTR. Customer ordered a cargo body. This is an OTR posting, not a B2B leasing settlement. Head of Administration, Branch Head, ABH, and OM already approved.',
      chain:{ka:'4 Sep 09:10',kc:'4 Sep 11:02',abh:'5 Sep 08:40',om:'5 Sep 15:18'} },
    { id:'pa-pdi', type:'price', kind:'Price adjustment', topic:'Open off-the-road', pay:'Cash', so:'4500091750', cabang:'Pondok Indah', unit:'Rush GR Sport',
      fromOtr:276750000, toOtr:268200000, delta:-8550000,
      reason:'Open off-the-road / chassis price so accessories can be fitted at the body shop. OTR tax pack is unbundled. Not the leasing book. Prior seats already approved.',
      chain:{ka:'5 Sep 08:22',kc:'5 Sep 10:45',abh:'5 Sep 14:11',om:'6 Sep 09:30'} },
    { id:'cb-kld', type:'cancel', kind:'Cancel billing', pay:'Leasing', so:'4500092101', cabang:'Kelapa Gading', unit:'Innova Zenix', billed:329600000, kwt:'KWT/26/KLD/008201',
      reason:'Duplicate paperless. The same SO was billed twice after a retry. Cancel the second billing and return AR. Last-seat posting — not the leasing settlement dashboard.',
      chain:{ka:'1 Sep 10:12',kc:'1 Sep 11:40',abh:'2 Sep 09:05',om:'2 Sep 14:22'} },
    { id:'cb-bsd', type:'cancel', kind:'Cancel billing', pay:'Leasing', so:'4500091888', cabang:'BSD', unit:'Fortuner 2.8', billed:412500000, kwt:'KWT/26/BSD/007188',
      reason:'Paperless posted to the wrong SO. Partner has not paid. Cancel billing, restore AR Open on this SO, rebill the correct SO.',
      chain:{ka:'28 Aug 16:02',kc:'29 Aug 09:18',abh:'29 Aug 13:44',om:'1 Sep 08:50'} },
    { id:'pa-gdg', type:'price', kind:'Price adjustment', topic:'Karoseri', pay:'Cash', so:'4500092101', cabang:'Kelapa Gading', unit:'Innova Zenix',
      fromOtr:412000000, toOtr:419800000, delta:7800000,
      reason:'Rear spoiler and side-step karoseri package after booking. Chain already approved; HO recorded the OTR lift.',
      chain:{ka:'28 Aug 09:40',kc:'28 Aug 13:12',abh:'29 Aug 08:55',om:'29 Aug 16:04'}, done:'approved' },
    { id:'cb-srp', type:'cancel', kind:'Cancel billing', pay:'Leasing', so:'4500092033', cabang:'Serpong', unit:'Alphard', billed:891000000, kwt:'KWT/26/SRP/008033',
      reason:'Customer asked to unwind a premature paperless before partner settlement. Chain already approved; HO records the cancel.',
      chain:{ka:'3 Sep 11:20',kc:'3 Sep 15:01',abh:'4 Sep 09:33',om:'4 Sep 16:10'}, done:'approved' }
  ];
  FAST.HO_APPR_KEY='fast.ho.appr';
  var hoApprPick=null;
  function hoApprStore(){
    return (window.FAST && FAST.load && FAST.load(FAST.HO_APPR_KEY))||{};
  }
  function hoApprHo(row){
    var st=(hoApprStore().states||{})[row.id];
    return st||row.done||'open';
  }
  function hoApprOpen(){
    return HO_APPR.filter(function(r){ return hoApprHo(r)==='open'; });
  }
  function hoApprPos(st){
    if(st==='approved') return {cls:'lunas', text:'HO approved'};
    if(st==='returned') return {cls:'hold', text:'Returned'};
    if(st==='rejected') return {cls:'late', text:'HO rejected'};
    return {cls:'uncleared', text:'Awaiting HO'};
  }
  function hoApprIsPrice(row){ return row && row.type==='price'; }
  function hoIdrFine(n){
    return 'Rp '+Math.round(n||0).toLocaleString('id-ID');
  }
  function hoSignedIdr(n){
    n=Math.round(n||0);
    return (n<0?'−':'+')+hoIdrFine(Math.abs(n));
  }
  function hoApprAmtHtml(row){
    if(hoApprIsPrice(row)) return hoSignedIdr(row.delta)+'<span class="sub">'+(row.topic||'OTR change')+'</span>';
    return hoIdr(row.billed)+'<span class="sub">Billed</span>';
  }
  function hoApprRowHtml(row){
    var st=hoApprHo(row);
    var pos=hoApprPos(st);
    var sub=hoApprIsPrice(row)?(row.topic||'OTR change'):(row.kwt||'Receipt');
    return '<tr data-ho-appr-row="'+row.id+'">'+
      '<td><b>'+row.kind+'</b><span class="sub">'+sub+'</span></td>'+
      '<td><b>'+row.so+'</b><span class="sub">'+row.cabang+' · '+row.unit+'</span></td>'+
      '<td>'+hoApprAmtHtml(row)+'</td>'+
      '<td>KA · KC · ABH · OM</td>'+
      '<td><span class="ho-pos '+pos.cls+'">'+pos.text+'</span></td>'+
      '</tr>';
  }
  function hoApprDossier(row){
    if(!row){
      return '<p>Select a filing. Price adjustment (karoseri, open off-the-road) and cancel billing are last-seat Finance HO postings after KA · KC · ABH · OM. This desk is not the B2B leasing book and not the Approval Engine. Not a DP, signature, 30%, or paid-in-full waiver.</p>';
    }
    var st=hoApprHo(row);
    var pos=hoApprPos(st);
    var price=hoApprIsPrice(row);
    var chain=HO_APPR_SEATS.map(function(s){
      return '<li class="on"><span>'+s.label+'</span><b>Approved · '+(row.chain[s.id]||'—')+'</b></li>';
    }).join('')+'<li class="'+(st==='open'?'now':'on')+'"><span>Finance HO</span><b>'+pos.text+'</b></li>';
    var ph=price?'Why approve, return, or reject the price adjustment':'Why cancel, return, or reject';
    var approveLab=price?'Approve adjustment':'Approve cancel';
    var actions=st==='open'
      ? '<label class="ho-appr-note">HO comment (required to return or reject)<textarea data-ho-appr-comment rows="2" placeholder="'+ph+'"></textarea></label>'+
        '<div class="ho-appr-acts">'+
        '<button type="button" class="ho-act" data-ho-appr-act="approve" data-ho-appr-id="'+row.id+'">'+approveLab+'</button>'+
        '<button type="button" class="ho-act ghost" data-ho-appr-act="return" data-ho-appr-id="'+row.id+'">Return to chain</button>'+
        '<button type="button" class="ho-act stop" data-ho-appr-act="reject" data-ho-appr-id="'+row.id+'">Reject</button>'+
        '</div>'
      : '<p class="ho-note">HO decision already recorded. '+(price?'Price adjustment is a finance posting on OTR —':'Billing cancel is a finance posting —')+' not a commercial gate waiver.</p>';
    var extra=price
      ? '<p class="ho-line"><span>Topic</span><b>'+(row.topic||'OTR change')+'</b></p>'+
        '<p class="ho-line"><span>From OTR</span><b>'+hoIdrFine(row.fromOtr)+'</b></p>'+
        '<p class="ho-line"><span>To OTR</span><b>'+hoIdrFine(row.toOtr)+'</b></p>'+
        '<p class="ho-line"><span>Delta</span><b>'+hoSignedIdr(row.delta)+'</b></p>'
      : '<p class="ho-line"><span>Billed</span><b>'+hoIdr(row.billed)+'</b></p>'+
        '<p class="ho-line"><span>Receipt</span><b>'+row.kwt+'</b></p>';
    return '<p class="ho-line"><span>Type</span><b>'+row.kind+'</b></p>'+
      '<p class="ho-line"><span>Desk</span><b>Last-seat posting · not B2B leasing</b></p>'+
      '<p class="ho-line"><span>Sales Order</span><b>'+row.so+'</b></p>'+
      '<p class="ho-line"><span>Branch · unit</span><b>'+row.cabang+' · '+row.unit+'</b></p>'+
      (row.pay?'<p class="ho-line"><span>Purchase method</span><b>'+row.pay+'</b></p>':'')+
      extra+
      '<p class="ho-line"><span>HO status</span><b>'+pos.text+'</b></p>'+
      '<p class="ho-note">'+row.reason+'</p>'+
      '<ol class="ho-chain">'+chain+'</ol>'+actions;
  }
  function hoRenderAppr(){
    var open=hoApprOpen();
    if(!hoApprPick && HO_APPR.length) hoApprPick=(open[0]||HO_APPR[0]).id;
    setTextSafe('[data-ho-kpi="appr-n"]', String(open.length));
    setTextSafe('[data-ho-n="appr"]', String(open.length));
    setTextSafe('[data-ho-appr-n]', String(open.length));
    var list=document.querySelector('[data-ho-appr-list]');
    if(list) list.innerHTML=HO_APPR.map(hoApprRowHtml).join('');
    document.querySelectorAll('[data-ho-appr-row]').forEach(function(b){
      b.setAttribute('aria-current', b.getAttribute('data-ho-appr-row')===hoApprPick?'true':'false');
    });
    var row=HO_APPR.filter(function(r){ return r.id===hoApprPick; })[0];
    var copy=document.querySelector('[data-ho-appr-copy]');
    if(copy) copy.innerHTML=hoApprDossier(row);
  }
  function setTextSafe(sel, val){
    document.querySelectorAll(sel).forEach(function(el){ el.textContent=val; });
  }
  function hoDecideAppr(id, act){
    var row=HO_APPR.filter(function(r){ return r.id===id; })[0];
    if(!row || hoApprHo(row)!=='open') return;
    var box=document.querySelector('[data-ho-appr-comment]');
    var comment=((box&&box.value)||'').trim();
    if((act==='return'||act==='reject') && !comment){
      if(typeof toast==='function') toast('Add a comment to return or reject.');
      if(box) box.focus();
      return;
    }
    var next=act==='approve'?'approved':act==='return'?'returned':'rejected';
    var store=hoApprStore();
    var states=store.states||{};
    states[id]=next;
    if(window.FAST && FAST.save) FAST.save({states:states}, FAST.HO_APPR_KEY);
    if(typeof toast==='function'){
      var price=hoApprIsPrice(row);
      toast(act==='approve'
        ? (price
          ? 'Price adjustment approved. OTR posting may proceed. Not a DP, signature, or 30% waiver.'
          : 'Cancel billing approved. AR reopened. Not a DP, signature, or 30% waiver.')
        : act==='return'
          ? 'Returned to the KA · KC · ABH · OM chain with comment.'
          : (price
            ? 'Price adjustment rejected. Existing OTR stands.'
            : 'Cancel billing rejected. Existing billing stands.'));
    }
    applyFinanceHo();
  }

  function applyFinanceHo(){
    var host=document.getElementById('finance_ho');
    if(!host) return;
    var onAppr=hoView==='appr';
    host.setAttribute('data-ho-mode', onAppr?'appr':'book');
    document.querySelectorAll('[data-ho-book-only]').forEach(function(el){ el.hidden=onAppr; });
    document.querySelectorAll('[data-ho-appr-only]').forEach(function(el){ el.hidden=!onAppr; });
    var all=hoPortfolio();
    var unbilled=all.filter(function(r){ return r.bucket==='unbilled'; });
    var billed=all.filter(function(r){ return r.bucket==='billed'; });
    var lunas=all.filter(function(r){ return r.bucket==='lunas'; });
    var ready=unbilled.filter(function(r){ return r.ready; });
    var hold=unbilled.filter(function(r){ return !r.ready; });
    var aging=billed.filter(function(r){ return (hoAgingDays(r)||0)>14; });
    var leadVals=lunas.map(function(r){ return hoAgingDays(r); }).filter(function(d){ return d!=null; });
    var sumU=unbilled.reduce(function(a,r){ return a+r.finance; },0);
    var sumB=billed.reduce(function(a,r){ return a+r.finance; },0);
    var sumA=aging.reduce(function(a,r){ return a+r.finance; },0);
    var med=hoMedian(leadVals);
    var avg=leadVals.length?Math.round(leadVals.reduce(function(a,b){ return a+b; },0)/leadVals.length):null;
    function setText(sel, val){
      document.querySelectorAll(sel).forEach(function(el){ el.textContent=val; });
    }
    setText('[data-ho-kpi="unbilled-n"]', String(unbilled.length));
    setText('[data-ho-kpi="unbilled-rp"]', hoIdr(sumU)+' financed · paperless not sent');
    setText('[data-ho-kpi="billed-n"]', String(billed.length));
    setText('[data-ho-kpi="billed-rp"]', hoIdr(sumB)+' waiting for partner settlement');
    setText('[data-ho-kpi="lead-days"]', med==null?'—':String(med));
    setText('[data-ho-kpi="lead-days-2"]', med==null?'—':med+' days');
    setText('[data-ho-kpi="lead-avg"]', avg==null?'—':avg+' days');
    setText('[data-ho-kpi="aging-n"]', String(aging.length));
    setText('[data-ho-kpi="aging-n-2"]', aging.length+' SOs · '+hoIdr(sumA));
    setText('[data-ho-kpi="aging-rp"]', hoIdr(sumA)+' over 14 days');
    setText('[data-ho-n="unbilled"]', String(unbilled.length));
    setText('[data-ho-n="billed"]', String(billed.length));
    setText('[data-ho-ready-n]', String(ready.length));
    setText('[data-ho-hold-n]', String(hold.length));
    setText('[data-ho-open-n]', String(billed.length));
    var bands=[0,0,0,0];
    billed.concat(lunas).forEach(function(r){
      var b=hoBand(hoAgingDays(r));
      if(b>=0) bands[b]++;
    });
    var max=Math.max.apply(null, bands.concat([1]));
    bands.forEach(function(n,i){
      document.querySelectorAll('[data-ho-bar="'+i+'"]').forEach(function(el){ el.style.width=Math.round(n/max*100)+'%'; });
      setText('[data-ho-bar-n="'+i+'"]', String(n));
    });
    var listFilter=hoView==='unbilled'?unbilled:hoView==='billed'?billed:hoView==='lead'?billed.concat(lunas):all;
    if(hoView==='lead'){
      listFilter=listFilter.slice().sort(function(a,b){ return (hoAgingDays(b)||0)-(hoAgingDays(a)||0); });
    }
    var labels={all:'All leasing SOs',unbilled:'Unbilled to leasing',billed:'Billed, unpaid',lead:'Lead time & aging',appr:'Cancel billing & price adjustment · awaiting Finance HO'};
    var lab=document.querySelector('[data-ho-filter-label]');
    if(lab) lab.textContent=labels[hoView]||labels.all;
    document.querySelectorAll('[data-rail="finance"] button[data-go="finance_ho"]').forEach(function(b){
      var j=b.getAttribute('data-ho-jump')||'all';
      var onAppr=hoView==='appr';
      var thisAppr=j==='appr';
      b.setAttribute('aria-current', (thisAppr===onAppr)?'true':'false');
    });
    document.querySelectorAll('[data-ho-tabs] [data-ho-view]').forEach(function(b){
      b.setAttribute('aria-current', b.getAttribute('data-ho-view')===hoView?'true':'false');
    });
    document.querySelectorAll('.ho-metrics [data-ho-view]').forEach(function(b){
      b.setAttribute('aria-current', b.getAttribute('data-ho-view')===hoView?'true':'false');
    });
    document.querySelectorAll('[data-ho-panel="board"]').forEach(function(el){ el.hidden=hoView==='lead'||hoView==='appr'; });
    document.querySelectorAll('[data-ho-panel="lead"]').forEach(function(el){ el.hidden=hoView!=='lead'; });
    document.querySelectorAll('[data-ho-panel="appr"]').forEach(function(el){ el.hidden=hoView!=='appr'; });
    var list=document.querySelector('[data-ho-list]');
    if(list) list.innerHTML=listFilter.map(hoRowHtml).join('')||'<tr><td colspan="6">No SOs in this filter.</td></tr>';
    var ageList=document.querySelector('[data-ho-aging-list]');
    if(ageList){
      var open=billed.slice().sort(function(a,b){ return (hoAgingDays(b)||0)-(hoAgingDays(a)||0); });
      ageList.innerHTML=open.map(hoRowHtml).join('')||'<tr><td colspan="6">No open bills.</td></tr>';
    }
    document.querySelectorAll('[data-ho-row]').forEach(function(b){
      b.setAttribute('aria-current', b.getAttribute('data-ho-row')===hoPick?'true':'false');
    });
    var row=all.filter(function(r){ return r.id===hoPick; })[0];
    var copy=document.querySelector('[data-ho-detail-copy]');
    if(copy) copy.innerHTML=hoDossier(row);
    hoRenderAppr();
    var bar=document.querySelector('#mockup .urlbar');
    var root=document.getElementById('mockup');
    if(bar && root && root.classList.contains('finance-portal')){
      if(hoView==='unbilled') bar.textContent='ho.fast.id/leasing/unbilled';
      else if(hoView==='billed') bar.textContent='ho.fast.id/leasing/billed-unpaid';
      else if(hoView==='appr') bar.textContent='ho.fast.id/approvals';
      else if(hoView==='lead') bar.textContent='ho.fast.id/leasing/leadtime';
      else bar.textContent='ho.fast.id/leasing';
    }
  }
  function bindFinanceHo(){
    document.querySelectorAll('[data-ho-view]').forEach(function(b){
      b.addEventListener('click',function(){
        hoView=b.getAttribute('data-ho-view')||'all';
        applyFinanceHo();
      });
    });
    var host=document.getElementById('finance_ho');
    if(host) host.addEventListener('click',function(e){
      var act=e.target.closest('[data-ho-appr-act]');
      if(act){
        hoDecideAppr(act.getAttribute('data-ho-appr-id'), act.getAttribute('data-ho-appr-act'));
        return;
      }
      var ap=e.target.closest('[data-ho-appr-row]');
      if(ap){
        hoApprPick=ap.getAttribute('data-ho-appr-row');
        applyFinanceHo();
        return;
      }
      var rowEl=e.target.closest('[data-ho-row]');
      if(!rowEl) return;
      hoPick=rowEl.getAttribute('data-ho-row');
      applyFinanceHo();
    });
    window.addEventListener('fast-session', function(){ applyFinanceHo(); });
  }
  bindFinanceHo();
  applyFinanceHo();
  FAST.hoSetView=function(v){ hoView=v||'all'; applyFinanceHo(); };
  FAST.hoOpen=function(opt){
    opt=opt||{};
    hoView=opt.view||'appr';
    if(opt.pick) hoApprPick=opt.pick;
  };
  FAST.HO_CASE={
    ho_appr:{view:'appr'},
    ho_karoseri:{view:'appr', pick:'pa-cld'},
    ho_otr:{view:'appr', pick:'pa-pdi'},
    ho_cancel:{view:'appr', pick:'cb-kld'}
  };
  Object.defineProperty(FAST,'hoView',{ get:function(){ return hoView; } });

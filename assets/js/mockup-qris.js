/* Company QRIS → Open KWT. Cap Rp 10.000.000 per barcode; larger amounts = several slices. */
  var QRIS_MAX=10000000;
  var QRIS_ID='QRIS-CLD-00426-1';
  var QRIS_NMID='ID1020020004128';
  var QRIS_KWT='KWT/26/CLD/009301';
  var QRIS_AMT=3000000;

  function qrisPaid(){
    var s=window.FAST && FAST.load ? FAST.load(FAST.BF_KEY) : null;
    return !!(s && s.paid);
  }
  function qrisState(){
    var s=(window.FAST && FAST.load && FAST.load(FAST.QRIS_KEY))||{};
    if(qrisPaid()) return {status:'active', amount:s.amount||QRIS_AMT, kind:s.kind||'booking'};
    return {status:s.status||'none', amount:s.amount||QRIS_AMT, kind:s.kind||'booking'};
  }
  function pad6(n){ return ('000000'+n).slice(-6); }
  function sliceKwt(i){ return 'KWT/26/CLD/'+pad6(9220+i); }
  function sliceQrisId(i){ return 'QRIS-CLD-00418-'+(3+i); }
  function sliceState(){
    var s=(window.FAST && FAST.load && FAST.load(FAST.SLICE_KEY))||{};
    return {
      target:Number(s.target||50000000),
      paid:Number(s.paid||0),
      status:s.status||'none',
      openAmount:Number(s.openAmount||QRIS_MAX),
      receipts:s.receipts||[]
    };
  }
  function sliceNeed(){
    var st=sliceState();
    return Math.max(0, st.target-st.paid);
  }
  function sliceCount(){
    return Math.ceil((sliceState().target||QRIS_MAX)/QRIS_MAX);
  }
  function mintCompanyQris(kind, amount){
    if(kind==='slice'){ mintQrisSlice(); return; }
    if(qrisPaid()){ toast('Booking fee receipt already Active.'); return; }
    amount=Number(amount||QRIS_AMT);
    if(!amount){ toast('Enter QRIS amount first.'); return; }
    if(amount>QRIS_MAX){
      toast('QRIS max Rp 10.000.000 per barcode. Generate the next slice after this one is Active.');
      return;
    }
    var prev=qrisState();
    if(prev.status==='open'){
      if(window.FAST && FAST.save) FAST.save({status:'open', kind:kind||'booking', amount:amount, qris:QRIS_ID, kwt:QRIS_KWT}, FAST.QRIS_KEY);
      toast('Open receipt still '+QRIS_KWT+' · company QRIS only.');
      applyOpenQris();
      return;
    }
    if(window.FAST && FAST.save) FAST.save({status:'open', kind:kind||'booking', amount:amount, qris:QRIS_ID, nmid:QRIS_NMID, kwt:QRIS_KWT}, FAST.QRIS_KEY);
    toast('Company QRIS generated. Open booking-fee receipt '+QRIS_KWT+' is in Administration.');
    applyOpenQris();
  }
  function mintQrisSlice(){
    var st=sliceState();
    var need=Math.max(0, st.target-st.paid);
    if(!need){ toast('QRIS slices for this target are complete. Use VA for any remainder on the request.'); applySliceQris(); return; }
    if(st.status==='open'){
      toast('Open slice still '+sliceKwt(st.receipts.length)+'. Scan or void it first.');
      applySliceQris();
      return;
    }
    var amt=Math.min(QRIS_MAX, need);
    var i=st.receipts.length;
    if(window.FAST && FAST.save) FAST.save({
      status:'open', target:st.target, paid:st.paid, receipts:st.receipts,
      openAmount:amt, openIdx:i
    }, FAST.SLICE_KEY);
    toast('Company QRIS slice '+(i+1)+' of '+Math.ceil(st.target/QRIS_MAX)+' · Open '+sliceKwt(i)+' · '+formatRp(amt));
    applySliceQris();
  }
  function voidCompanyQris(){
    var st=qrisState();
    if(st.status!=='open'){ toast('No Open booking QRIS to void.'); return; }
    if(window.FAST && FAST.save) FAST.save({status:'voided'}, FAST.QRIS_KEY);
    toast('Open QRIS voided. Frontman must generate company QRIS again. SO still held.');
    applyOpenQris();
  }
  function voidQrisSlice(){
    var st=sliceState();
    if(st.status!=='open'){ toast('No Open QRIS slice to void.'); return; }
    if(window.FAST && FAST.save) FAST.save({status:'voided', target:st.target, paid:st.paid, receipts:st.receipts}, FAST.SLICE_KEY);
    toast('This QRIS slice was voided. Generate the company barcode again. Posted slices stay Active.');
    applySliceQris();
  }
  function activateOpenQris(amount){
    if(window.FAST && FAST.save) FAST.save({status:'active', amount:Number(amount||qrisState().amount||QRIS_AMT)}, FAST.QRIS_KEY);
    applyOpenQris();
  }
  function settleQrisSlice(){
    var st=sliceState();
    if(st.status!=='open'){ toast('Generate company QRIS for this slice first.'); return; }
    var i=st.receipts.length;
    var amt=st.openAmount||QRIS_MAX;
    var rec={kwt:sliceKwt(i), qris:sliceQrisId(i), amount:amt};
    var receipts=st.receipts.concat([rec]);
    var paid=st.paid+amt;
    var ar=Math.max(0, 181750000-paid);
    if(window.FAST && FAST.save){
      FAST.save({status:'none', target:st.target, paid:paid, receipts:receipts, openAmount:0}, FAST.SLICE_KEY);
      FAST.save({ar:ar, arLabel:formatRp(ar), receipt:rec.kwt, channel:'QRIS', paid:ar===0});
    }
    toast('Slice Active '+rec.kwt+' · '+formatRp(amt)+'. '+(paid>=st.target?'Target met.':'Generate the next company QRIS.'));
    applySliceQris();
    if(typeof applyLive==='function') applyLive();
    show(currentRole==='cust'?'customer_detail':'cashless');
  }
  function applyOpenQris(){
    var st=qrisState();
    var open=st.status==='open';
    var voided=st.status==='voided';
    var active=st.status==='active';
    var live=open||voided;

    document.querySelectorAll('[data-qris-open-row]').forEach(function(el){ el.hidden=!open; });
    document.querySelectorAll('[data-qris-void-row]').forEach(function(el){ el.hidden=!voided; });
    document.querySelectorAll('[data-qris-admin]').forEach(function(el){ el.hidden=!open; });
    document.querySelectorAll('[data-bf-kwt-snapshot]').forEach(function(el){ el.hidden=live; });
    document.querySelectorAll('[data-qris-id]').forEach(function(el){
      el.textContent=QRIS_ID+' · NMID '+QRIS_NMID+' · FAST Outlet Cilandak';
    });

    var waitBf=document.querySelector('[data-qris-wait="booking"]');
    var readyBf=document.querySelector('[data-qris-ready="booking"]');
    if(waitBf) waitBf.hidden = active || open;
    if(readyBf) readyBf.hidden = !(open && !active);

    var dgQris=document.querySelector('[data-dg="qris"]');
    if(dgQris){
      dgQris.disabled=false;
      dgQris.style.opacity='';
      var hint=dgQris.querySelector('[data-ch-hint]');
      if(hint && payJobId!=='booking' && payJobId!=='agya'){
        hint.textContent='Max Rp 10.000.000 per barcode · repeat until the amount is met';
      }
    }
    if(typeof filterAdminBook==='function') filterAdminBook();
  }
  function applySliceQris(){
    var st=sliceState();
    var total=Math.max(1, Math.ceil(st.target/QRIS_MAX));
    var done=st.receipts.length;
    var need=Math.max(0, st.target-st.paid);
    var open=st.status==='open';
    var voided=st.status==='voided';
    var amt=open?st.openAmount:Math.min(QRIS_MAX, need||QRIS_MAX);
    var i=done;
    var kwt=sliceKwt(i);
    var qid=sliceQrisId(i);

    document.querySelectorAll('[data-qris-target]').forEach(function(b){
      b.classList.toggle('on', Number(b.getAttribute('data-qris-target'))===st.target);
    });
    document.querySelectorAll('[data-qris-slice-progress]').forEach(function(el){
      el.textContent=done+' / '+total+' Active · posted '+formatRp(st.paid)+' · remaining '+formatRp(need);
    });
    var wait=document.querySelector('[data-qris-slice-wait]');
    var ready=document.querySelector('[data-qris-slice-ready]');
    var fin=document.querySelector('[data-qris-slice-done]');
    if(wait){
      wait.hidden = open || !need;
      wait.textContent='Generate company QRIS · slice '+(done+1)+' of '+total+' · '+formatRp(amt);
    }
    if(ready) ready.hidden=!open;
    if(fin) fin.hidden=!!need;
    document.querySelectorAll('[data-qris-slice-amt]').forEach(function(el){ el.textContent=formatRp(amt); });
    document.querySelectorAll('[data-qris-slice-id]').forEach(function(el){
      el.textContent=qid+' · NMID '+QRIS_NMID+' · FAST Outlet Cilandak';
    });
    document.querySelectorAll('[data-qris-slice-kwt]').forEach(function(el){ el.textContent=kwt; });
    var scan=document.querySelector('[data-qris-slice-scan]');
    if(scan) scan.setAttribute('data-amount', String(amt));
    document.querySelectorAll('[data-qris-slice-open-row]').forEach(function(el){ el.hidden=!open; });
    document.querySelectorAll('[data-qris-slice-void-row]').forEach(function(el){ el.hidden=!voided; });
    document.querySelectorAll('[data-qris-slice-admin]').forEach(function(el){ el.hidden=!open; });

    var box=document.getElementById('qrisSliceDocs');
    if(box){
      box.innerHTML=st.receipts.map(function(r){
        return '<div class="doc"><b>'+r.kwt+'</b><p class="meta">QRIS slice · '+formatRp(r.amount)+' · '+r.qris+'</p><span class="tag ok">Active</span></div>';
      }).join('');
    }
    var slot=document.getElementById('newReceiptSlot');
    if(slot){
      if(open){
        slot.className='doc';
        slot.innerHTML='<b>'+kwt+'</b><p class="meta">Open slice '+(done+1)+' of '+total+' · '+formatRp(amt)+'</p><span class="tag wait">Open</span>';
      } else if(voided){
        slot.className='doc miss';
        slot.innerHTML='<b>'+kwt+'</b><p class="meta">Cancelled slice · generate again</p><span class="tag stop">Cancelled</span>';
      } else if(!need){
        slot.className='doc';
        slot.innerHTML='<b>QRIS target met</b><p class="meta">'+done+' Active slices · '+formatRp(st.paid)+'</p><span class="tag ok">Active</span>';
      } else {
        slot.className='doc miss';
        slot.innerHTML='<b>Next QRIS slice</b><p class="meta">Max Rp 10.000.000 · '+(done+1)+' of '+total+'</p><span class="tag mute">Pending</span>';
      }
    }
    if(typeof filterAdminBook==='function') filterAdminBook();
  }

  document.querySelectorAll('[data-qris-gen]').forEach(function(b){
    b.addEventListener('click',function(){
      var kind=b.getAttribute('data-qris-gen')||'booking';
      if(kind==='slice') mintQrisSlice();
      else mintCompanyQris(kind, QRIS_AMT);
    });
  });
  document.querySelectorAll('[data-qris-target]').forEach(function(b){
    b.addEventListener('click',function(){
      var t=Number(b.getAttribute('data-qris-target')||50000000);
      var st=sliceState();
      if(st.status==='open'){ toast('Void or scan the Open slice before changing the target.'); return; }
      if(st.paid>t){ toast('Already posted '+formatRp(st.paid)+'. Pick a larger target or use VA.'); return; }
      if(window.FAST && FAST.save) FAST.save({target:t, paid:st.paid, receipts:st.receipts, status:'none'}, FAST.SLICE_KEY);
      applySliceQris();
    });
  });
  document.addEventListener('click',function(e){
    var v=e.target.closest('[data-qris-void]');
    if(!v) return;
    e.preventDefault();
    e.stopPropagation();
    if(v.getAttribute('data-qris-void')==='slice') voidQrisSlice();
    else voidCompanyQris();
  });
  applyOpenQris();
  applySliceQris();
  window.addEventListener('fast-session', function(){ applyOpenQris(); applySliceQris(); });

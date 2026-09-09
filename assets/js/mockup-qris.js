/* Company QRIS → Open KWT (Admin-controlled instrument) */
  var QRIS_ID='QRIS-CLD-00418-3';
  var QRIS_NMID='ID1020020004128';
  var QRIS_KWT='KWT/26/CLD/009220';

  function qrisPaid(){
    var s=window.FAST && FAST.load ? FAST.load() : null;
    return !!(s && s.paid);
  }
  function qrisState(){
    var s=(window.FAST && FAST.load && FAST.load(FAST.QRIS_KEY))||{};
    if(qrisPaid()) return {status:'active', amount:s.amount||100000000, kind:s.kind||'request'};
    return {status:s.status||'none', amount:s.amount||100000000, kind:s.kind||'request'};
  }
  function mintCompanyQris(kind, amount){
    if(qrisPaid()){ toast('Receipt already Active. AR already moved.'); return; }
    amount=Number(amount||0);
    if(!amount){ toast('Enter QRIS amount first.'); return; }
    var prev=qrisState();
    if(prev.status==='open'){
      if(window.FAST && FAST.save) FAST.save({status:'open', kind:kind, amount:amount, qris:QRIS_ID, kwt:QRIS_KWT}, FAST.QRIS_KEY);
      toast('Open receipt still '+QRIS_KWT+' · amount updated. Company QRIS only.');
      applyOpenQris();
      return;
    }
    if(window.FAST && FAST.save) FAST.save({status:'open', kind:kind, amount:amount, qris:QRIS_ID, nmid:QRIS_NMID, kwt:QRIS_KWT}, FAST.QRIS_KEY);
    toast('Company QRIS generated. Open receipt '+QRIS_KWT+' is now in Administration.');
    applyOpenQris();
  }
  function voidCompanyQris(){
    var st=qrisState();
    if(st.status!=='open'){ toast('No Open company QRIS to void.'); return; }
    if(window.FAST && FAST.save) FAST.save({status:'voided'}, FAST.QRIS_KEY);
    toast('Open QRIS voided. Frontman must generate company QRIS again. AR unchanged.');
    applyOpenQris();
  }
  function activateOpenQris(amount){
    if(window.FAST && FAST.save) FAST.save({status:'active', amount:Number(amount||qrisState().amount||100000000)}, FAST.QRIS_KEY);
    applyOpenQris();
  }
  function applyOpenQris(){
    var st=qrisState();
    var open=st.status==='open';
    var voided=st.status==='voided';
    var active=st.status==='active';
    var amt=formatRp(st.amount||100000000);

    document.querySelectorAll('[data-qris-open-row]').forEach(function(el){ el.hidden=!open; });
    document.querySelectorAll('[data-qris-void-row]').forEach(function(el){ el.hidden=!voided; });
    document.querySelectorAll('[data-qris-admin]').forEach(function(el){ el.hidden=!open; });
    document.querySelectorAll('[data-qris-id]').forEach(function(el){
      el.textContent=QRIS_ID+' · NMID '+QRIS_NMID+' · FAST Outlet Cilandak';
    });

    var waitReq=document.querySelector('[data-qris-wait="request"]');
    var readyReq=document.querySelector('[data-qris-ready="request"]');
    if(waitReq) waitReq.hidden = active || (open && st.kind==='request');
    if(readyReq) readyReq.hidden = !(open && st.kind==='request');

    var otherReady=document.querySelector('[data-cash-qris-ready]');
    if(otherReady && st.kind==='open'){
      otherReady.hidden=!open;
      var label=document.getElementById('cashQrisLabel');
      var pay=document.getElementById('cashQrisPay');
      if(label) label.textContent=amt;
      if(pay) pay.setAttribute('data-amount', String(st.amount||0));
    }

    var slot=document.getElementById('newReceiptSlot');
    if(slot){
      if(active || qrisPaid()){
        var ch=((window.FAST && FAST.load && FAST.load())||{}).channel||'QRIS';
        slot.className='doc';
        slot.innerHTML='<b>'+QRIS_KWT+'</b><p class="meta">Payment · '+ch+' · '+amt+'</p><span class="tag ok">Active</span><button class="btn ghost" style="width:100%;margin-top:10px">Download PDF</button>';
        var db=slot.querySelector('button');
        if(db) db.addEventListener('click',function(){ if(typeof downloadReceipt==='function') downloadReceipt(QRIS_KWT); toast('E-receipt PDF downloaded.'); });
      } else if(open){
        slot.className='doc';
        slot.innerHTML='<b>'+QRIS_KWT+'</b><p class="meta">Open · company QRIS '+QRIS_ID+' · '+amt+'</p><span class="tag wait">Open</span>';
      } else if(voided){
        slot.className='doc miss';
        slot.innerHTML='<b>'+QRIS_KWT+'</b><p class="meta">Cancelled · regenerate company QRIS</p><span class="tag stop">Cancelled</span>';
      } else {
        slot.className='doc miss';
        slot.innerHTML='<b>Next receipt</b><p class="meta">Open KWT when company QRIS is generated. Active only after Banking API.</p><span class="tag mute">Pending</span>';
      }
    }

    document.querySelectorAll('[data-qris-open-row] .num').forEach(function(el){
      if(open) el.textContent=amt;
    });

    if(typeof filterAdminBook==='function') filterAdminBook();
  }

  document.querySelectorAll('[data-qris-gen]').forEach(function(b){
    b.addEventListener('click',function(){
      var kind=b.getAttribute('data-qris-gen')||'request';
      mintCompanyQris(kind, kind==='request'?100000000:0);
    });
  });
  document.addEventListener('click',function(e){
    var v=e.target.closest('[data-qris-void]');
    if(!v) return;
    e.preventDefault();
    e.stopPropagation();
    voidCompanyQris();
  });
  applyOpenQris();
  window.addEventListener('fast-session', applyOpenQris);

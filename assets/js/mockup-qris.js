/* Company QRIS → Open KWT. Cap Rp 10.000.000 · booking fee only. */
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
  function mintCompanyQris(kind, amount){
    if(qrisPaid()){ toast('Booking fee receipt already Active.'); return; }
    amount=Number(amount||QRIS_AMT);
    if(!amount){ toast('Enter QRIS amount first.'); return; }
    if(amount>QRIS_MAX){
      toast('QRIS max Rp 10.000.000. Use VA, CDM, or EDC for settlement.');
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
  function voidCompanyQris(){
    var st=qrisState();
    if(st.status!=='open'){ toast('No Open company QRIS to void.'); return; }
    if(window.FAST && FAST.save) FAST.save({status:'voided'}, FAST.QRIS_KEY);
    toast('Open QRIS voided. Frontman must generate company QRIS again. SO still held.');
    applyOpenQris();
  }
  function activateOpenQris(amount){
    if(window.FAST && FAST.save) FAST.save({status:'active', amount:Number(amount||qrisState().amount||QRIS_AMT)}, FAST.QRIS_KEY);
    applyOpenQris();
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
      var ok=typeof qrisJobOk==='function'?qrisJobOk():false;
      dgQris.disabled=!ok;
      dgQris.style.opacity=ok?'':'0.55';
      var hint=dgQris.querySelector('[data-ch-hint]');
      if(hint && !ok) hint.textContent='QRIS max Rp 10.000.000 · booking fee only. Use VA.';
    }

    if(typeof filterAdminBook==='function') filterAdminBook();
  }

  document.querySelectorAll('[data-qris-gen]').forEach(function(b){
    b.addEventListener('click',function(){
      mintCompanyQris(b.getAttribute('data-qris-gen')||'booking', QRIS_AMT);
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

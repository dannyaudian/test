/* Konversi SO, Digiroom, settle cashless */
  function runSoConvert(){
    var overlay=document.getElementById('soflow');
    var status=document.getElementById('soStatus');
    var steps=overlay?overlay.querySelectorAll('[data-step]'):[];
    if(!overlay){ show('so'); return; }
    overlay.hidden=false;
    steps.forEach(function(li){ li.className=''; });
    var labels=['Checking receipt against Yaris minimum…','Copying buyer, STNK, unit, PO area pricing…','Issuing Sales Order number…','Linking receipt to SPK and SO…'];
    var i=0;
    function tick(){
      if(i>0) steps[i-1].className='done';
      if(i<steps.length){
        steps[i].className='on';
        if(status) status.textContent=labels[i];
        i++;
        setTimeout(tick, 380);
      } else {
        overlay.hidden=true;
        toast('Booking fee met. SPK converted to SO 4500091426.');
        show('so');
      }
    }
    tick();
  }
  function settleBooking(channel){
    if(window.FAST && FAST.save) FAST.save({paid:true,spk:'SPK/26/CLD/00426',so:'4500091426',channel:channel,receipt:'KWT/26/CLD/009301'}, FAST.BF_KEY);
    applyBooking();
    applySpkDraft();
    if(currentRole==='cust'){
      toast('Yaris booking fee paid. Receipt KWT/26/CLD/009301. Branch opening Sales Order.');
      show('customer_booking');
      return;
    }
    applyRole('frontman');
    runSoConvert();
  }
  document.querySelectorAll('[data-bf-pay]').forEach(function(b){
    b.addEventListener('click',function(){ settleBooking(b.getAttribute('data-bf-pay')); });
  });
  function showDg(panel, meta){
    var home=document.querySelector('[data-dg-home]');
    if(home) home.hidden = panel!=='home';
    document.querySelectorAll('[data-dg-panel]').forEach(function(p){
      p.hidden = p.getAttribute('data-dg-panel')!==panel;
    });
    var j=currentJob();
    var n=currentDgAmount();
    var amt=n?formatRp(n):(j.locked?j.amount:'enter amount first');
    if(panel==='va'){
      dgVaBank=meta||dgVaBank||'BCA';
      var wait=document.getElementById('dgVaHint');
      var ready=document.getElementById('dgVaReadyHint');
      var no=document.getElementById('dgVaNo');
      if(wait) wait.textContent=j.locked
        ? ('VA '+dgVaBank+' · salesperson request '+j.amount+' is already locked. Issue the number.')
        : ('Enter the amount, then issue VA '+dgVaBank+'. This is a virtual account transfer, not QRIS.');
      if(ready) ready.textContent='Transfer to VA '+dgVaBank+' · '+amt+'.';
      if(no) no.textContent=(j.va&&j.va[dgVaBank])||j.va.BCA;
      refreshDgInstruments();
    }
    if(panel==='qris'){
      refreshDgInstruments();
    }
    if(panel==='app'){
      var hint=document.getElementById('dgAppHint');
      if(hint) hint.textContent='Opening '+(meta||'myBCA')+' · '+j.kind+' '+amt+'.';
    }
  }
  document.querySelectorAll('[data-dg]').forEach(function(b){
    b.addEventListener('click',function(){
      showDg(b.getAttribute('data-dg'), b.getAttribute('data-bank')||b.getAttribute('data-app'));
    });
  });
  document.querySelectorAll('[data-dg-pay]').forEach(function(b){
    b.addEventListener('click',function(){
      var ch=b.getAttribute('data-dg-pay');
      var n=currentDgAmount();
      if(!n){ toast('Enter payment amount first.'); return; }
      if(payJobId==='booking') settleBooking(ch);
      else runPayflow(ch, n);
    });
  });
  var amtInp=document.querySelector('#digiroom [data-pay-amount-input]');
  if(amtInp){
    amtInp.addEventListener('input',function(){
      if(currentJob().locked) return;
      dgQrisReady=false;
      dgVaReady=false;
      var j=currentJob();
      var n=parseRp(amtInp.value);
      if(j.max && n>j.max){
        amtInp.value=String(j.max);
        toast('Capped at '+formatRp(j.max)+'.');
      }
      syncPayAmount();
      refreshDgInstruments();
    });
  }
  document.querySelectorAll('[data-qris-show]').forEach(function(b){
    b.addEventListener('click',function(){
      if(b.getAttribute('data-qris-show')==='cash'){
        var inp=document.getElementById('cashQrisAmt');
        var n=parseRp(inp&&inp.value);
        if(n>81750000) n=81750000;
        if(!n){ toast('Enter QRIS amount first.'); return; }
        var label=document.getElementById('cashQrisLabel');
        var pay=document.getElementById('cashQrisPay');
        var box=document.querySelector('[data-cash-qris-ready]');
        if(label) label.textContent=formatRp(n);
        if(pay) pay.setAttribute('data-amount', String(n));
        if(box) box.hidden=false;
        return;
      }
      var n=currentDgAmount();
      if(!n){ toast('Enter payment amount first.'); return; }
      dgQrisReady=true;
      refreshDgInstruments();
    });
  });
  document.querySelectorAll('[data-va-issue]').forEach(function(b){
    b.addEventListener('click',function(){
      var n=currentDgAmount();
      if(!n){ toast('Enter payment amount first.'); return; }
      dgVaReady=true;
      var j=currentJob();
      var no=document.getElementById('dgVaNo');
      if(no) no.textContent=(j.va&&j.va[dgVaBank])||j.va.BCA;
      var ready=document.getElementById('dgVaReadyHint');
      if(ready) ready.textContent='Transfer to VA '+dgVaBank+' · '+formatRp(n)+'.';
      refreshDgInstruments();
    });
  });
  function setCashQrisMode(mode){
    document.querySelectorAll('[data-cash-amt]').forEach(function(b){
      b.classList.toggle('on', b.getAttribute('data-cash-amt')===mode);
    });
    var req=document.querySelector('[data-cash-qris-request]');
    var open=document.querySelector('[data-cash-qris-open]');
    if(req) req.hidden = mode!=='request';
    if(open) open.hidden = mode!=='open';
    var ready=document.querySelector('[data-cash-qris-ready]');
    if(ready && mode!=='open') ready.hidden=true;
  }
  document.querySelectorAll('[data-cash-amt]').forEach(function(b){
    b.addEventListener('click',function(){ setCashQrisMode(b.getAttribute('data-cash-amt')); });
  });

  function applyLive(){
    if(!window.FAST || !FAST.load) return;
    var s=FAST.load();
    if(!s || !s.paid) return;
    var bar=document.getElementById('liveSync');
    var msg=document.getElementById('syncMsg');
    if(bar) bar.hidden=false;
    if(msg) msg.textContent=(s.channel||'Cashless')+' · '+(s.receipt||'KWT/26/CLD/009220')+' · AR Open '+(s.arLabel||'Rp 81.750.000')+'. Delivery '+(s.ar===0?'unlocked':'still awaiting paid in full')+'.';
    document.querySelectorAll('[data-live="ar"]').forEach(function(el){ el.textContent=s.arLabel||'Rp 81.750.000'; });
    document.querySelectorAll('[data-live="ar-short"]').forEach(function(el){
      var ar=typeof s.ar==='number'?s.ar:81750000;
      var jt=ar===0?'0':(ar/1000000).toLocaleString('id-ID',{maximumFractionDigits:2});
      el.innerHTML=jt+'<span style="font-size:14px;font-weight:500"> Jt</span>';
    });
    document.querySelectorAll('[data-live="avail"]').forEach(function(el){ el.textContent=s.ar===0?'Rp 0':'Rp 81.750.000'; });
    document.querySelectorAll('[data-live="payhint"]').forEach(function(el){
      el.textContent=s.ar===0?'100% paid · cash delivery unlocked':'83.2% paid · cashless in this transaction';
    });
    var barFill=document.querySelector('#transaksi .bar i');
    if(barFill) barFill.style.width=s.ar===0?'100%':'83.2%';
  }
  applyLive();
  applyExcAlamat();
  applyExcNama();
  applyExcEpo();
  applyBooking();
  applySpkDraft();
  applyDelivery();
  applyGi();
  applyB2b();
  applyHandoverCust();
  applyCustPayScene();
  applyAfi();
  applyDewiProc();
  syncRoleChrome();
  syncMgmtSeat();
  if(window.FAST && FAST.renderMaster) FAST.renderMaster();
  window.addEventListener('fast-session', function(){ applyLive(); applyExcAlamat(); applyExcNama(); applyExcEpo(); applyBooking(); applySpkDraft(); applyDelivery(); applyGi(); applyB2b(); applyAfi(); applyDewiProc(); applyHandoverCust(); applyCustPayScene(); applyMgmtInbox(); if(window.FAST && FAST.renderMaster) FAST.renderMaster(); });

  var channelMeta={
    qris:{title:'QRIS'},
    cdm:{title:'Branch CDM'},
    edc:{title:'Debit EDC'},
    brilink:{title:'BRILink'},
    va:{title:'Virtual Account'},
    app:{title:'Bank App'},
    link:{title:'Digiroom'}
  };
  document.addEventListener('keydown',function(e){
    if(e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    var n=parseInt(e.key,10);
    if(!n) return;
    var cash=document.getElementById('cashless');
    var book=document.getElementById('booking');
    var order=['qris','cdm','link','edc'];
    if(cash && cash.classList.contains('on') && n>=1 && n<=4){
      if(currentRole==='cust' && order[n-1]==='edc') return;
      showCashPanel(order[n-1]);
    }
    if(book && book.classList.contains('on') && n>=1 && n<=4) showBfPanel(order[n-1]);
  });
  function settle(channel, amount){
    amount=Number(amount||0);
    var ar=Math.max(0, 181750000-amount);
    var label=formatRp(ar);
    var slot=document.getElementById('newReceiptSlot');
    if(slot){
      slot.className='doc';
      slot.innerHTML='<b>KWT/26/CLD/009220</b><p class="meta">Payment · '+(channelMeta[channel]?channelMeta[channel].title:'Cashless')+' · '+formatRp(amount)+'</p><span class="tag ok">Active</span><button class="btn ghost" style="width:100%;margin-top:10px">Download PDF</button>';
      var db=slot.querySelector('button');
      if(db) db.addEventListener('click',function(){ downloadReceipt('KWT/26/CLD/009220'); toast('E-receipt PDF downloaded.'); });
    }
    if(window.FAST && FAST.save){
      FAST.save({paid:true,ar:ar,arLabel:label,receipt:'KWT/26/CLD/009220',channel:(channelMeta[channel]||{}).title||channel});
    }
    toast(ar===0?'Paid in full. E-receipt issued. Cash delivery unlocked.':'Payment of '+formatRp(amount)+' received. Invoice updated on home.');
    show(currentRole==='cust'?'customer_detail':'cashless');
  }
  function runPayflow(channel, amount){
    var overlay=document.getElementById('payflow');
    var status=document.getElementById('pfStatus');
    var steps=overlay?overlay.querySelectorAll('[data-step]'):[];
    if(!overlay){ settle(channel, amount); return; }
    overlay.hidden=false;
    steps.forEach(function(li){ li.className=''; });
    var labels=currentRole==='cust'
      ? ['Checking invoice…','Confirming payment…','Issuing payment proof…','Updating order…']
      : ['Reading SPK & AR Open…','Verifying Banking API…','Issuing e-receipt…','Updating home…'];
    var i=0;
    function tick(){
      if(i>0) steps[i-1].className='done';
      if(i<steps.length){
        steps[i].className='on';
        if(status) status.textContent=labels[i];
        i++;
        setTimeout(tick, 400);
      } else {
        overlay.hidden=true;
        settle(channel, amount);
      }
    }
    tick();
  }
  document.querySelectorAll('[data-pay]').forEach(function(b){
    b.addEventListener('click',function(){
      var ch=b.getAttribute('data-pay');
      if(ch==='edc' && currentRole==='cust') return;
      runPayflow(ch, Number(b.getAttribute('data-amount')||100000000));
    });
  });
  document.querySelectorAll('.journey a').forEach(function(a){
    a.addEventListener('click',function(e){
      var id=(a.getAttribute('href')||'').split('#')[1];
      if(!id || !document.getElementById(id)) return;
      e.preventDefault();
      if(id==='customer'||id==='customer_detail'||id==='digiroom'||id==='bukti_serah'||id==='order_calya'||id==='shop_home'||id==='shop_akun'||id==='tagihan_customer'||id==='e_kuitansi'||id==='customer_booking'||id==='customer_booking_qris') applyRole('cust');
      else if(currentRole==='mgmt' && id==='beranda') id='dashboard';
      else if(currentRole==='admin' && id==='beranda') id='admin_spk';
      else if(currentRole==='admin' && id==='cashless') id='admin_pay';
      else if(ADMIN_BOOK[id]||id==='verifikasi'||id==='admin_book') applyRole('admin');
      else if(id==='beranda'||id==='transaksi'||id==='spk'||id==='spk_baru'||id==='quot'||id==='so'||id==='so2'||id==='proses'||id==='booking') applyRole('frontman');
      show(id);
    });
  });
  var hash=(location.hash||'').replace('#','');
  if(hash==='admin_tx') hash='admin_spk';
  if(hash && (document.getElementById(hash) || ADMIN_BOOK[hash])){
    if(screenRole[hash]) applyRole(screenRole[hash]);
    show(hash, {explicit:true});
  }
  window.addEventListener('hashchange', function(){
    var h=(location.hash||'').replace('#','');
    if(h==='admin_tx') h='admin_spk';
    if(h && (document.getElementById(h) || ADMIN_BOOK[h])){
      if(screenRole[h]) applyRole(screenRole[h]);
      show(h, {explicit:true});
    }
  });


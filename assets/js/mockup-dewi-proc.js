/* Jejak proses Dewi + delivery Agus */
  function procSteps(){
    return [
    {id:'spk',label:'SPK'},
    {id:'quot',label:'Quotation'},
    {id:'so',label:'SO'},
    {id:'afi_d',label:'AFI'},
    {id:'do',label:'DO'},
    {id:'bill_d',label:'Billing'},
    {id:'kirim_d',label:'Delivery'},
    {id:'stnk_d',label:'STNK'}
    ];
  }
  function qtData(){ return (window.FAST && FAST.load ? FAST.load(FAST.QT_KEY) : null) || {rev:1,stale:false,afi:false,dof:false}; }
  function bfPaid(){ var s=window.FAST && FAST.load ? FAST.load(FAST.BF_KEY) : null; return !!(s && s.paid); }
  function applyDewiProc(){
    var paid=bfPaid();
    var q=qtData();
    var rev=q.rev||1;
    var soRev=q.soRev||1;
    var stale=!!q.stale;
    var y=q.otrYaris||296800000;
    var a=q.otrAgya||175900000;
    document.querySelectorAll('[data-qt-rev]').forEach(function(el){ el.textContent=String(rev); });
    document.querySelectorAll('[data-so-rev]').forEach(function(el){ el.textContent=String(soRev); });
    document.querySelectorAll('[data-qt-otr="yaris"]').forEach(function(el){ el.textContent=formatRp(y); });
    document.querySelectorAll('[data-qt-otr="agya"]').forEach(function(el){ el.textContent=formatRp(a); });
    document.querySelectorAll('[data-qt-fresh]').forEach(function(el){ el.hidden=stale; });
    document.querySelectorAll('[data-qt-stale]').forEach(function(el){ el.hidden=!stale; });
    document.querySelectorAll('[data-so-stale]').forEach(function(el){ el.hidden=!(paid && stale); });
    var ready=document.querySelector('[data-so-ready]');
    if(ready) ready.hidden=!paid || stale;
    var qtPush=document.querySelector('[data-qt-push]');
    if(qtPush) qtPush.hidden=!stale;
    var so2tag=document.querySelector('[data-so2-tag]');
    if(so2tag){
      so2tag.textContent=stale?'QT berubah · SO Agya harus ikut harga baru':'Booking belum · SO tertahan';
      so2tag.className='tag '+(stale?'hold':'mute');
    }
    document.querySelectorAll('[data-afi-d-wait]').forEach(function(el){ el.hidden=paid && !stale; });
    document.querySelectorAll('[data-afi-need-so]').forEach(function(el){ el.hidden=paid; });
    document.querySelectorAll('[data-afi-need-qt]').forEach(function(el){ el.hidden=!paid || !stale; });
    document.querySelectorAll('[data-afi-d-open]').forEach(function(el){ el.hidden=!paid || stale || !!q.afi; });
    document.querySelectorAll('[data-afi-d-sent]').forEach(function(el){ el.hidden=!q.afi || stale; });
    document.querySelectorAll('[data-dewi-afi-done]').forEach(function(el){ el.hidden=!q.afi || stale; });
    document.querySelectorAll('[data-do-wait]').forEach(function(el){ el.hidden=!!q.afi && !stale; });
    document.querySelectorAll('[data-do-open]').forEach(function(el){ el.hidden=!q.afi || stale || !!q.dof; });
    document.querySelectorAll('[data-do-sent]').forEach(function(el){ el.hidden=!q.dof || stale; });
    document.querySelectorAll('[data-bill-need-do]').forEach(function(el){ el.hidden=!!q.dof; });
    document.querySelectorAll('[data-bill-has-do]').forEach(function(el){ el.hidden=!q.dof; });
    var billDo=document.querySelector('[data-bill-do]');
    if(billDo) billDo.textContent=q.dof?'Issued':'Pending';
    var stnkAfi=document.querySelector('[data-stnk-afi]');
    if(stnkAfi){
      stnkAfi.classList.toggle('done', !!q.afi);
      var t=stnkAfi.querySelector('.t');
      if(t) t.textContent=q.afi?'Submission sent':'Awaiting SO / submission';
    }
    if(window.FAST && FAST.renderLineage) FAST.renderLineage({payJob:payJobId, screen:(document.querySelector('.screen.on')||{}).id});
  }
  document.querySelectorAll('[data-qt-revise]').forEach(function(b){
    b.addEventListener('click',function(){
      var q=qtData();
      if(window.FAST && FAST.save) FAST.save({
        rev:(q.rev||1)+1,
        stale:true,
        otrYaris:298400000,
        otrAgya:177200000
      }, FAST.QT_KEY);
      applyDewiProc();
      toast('Quotation berubah. SO Yaris dan SO Agya harus ikut harga baru.');
    });
  });
  document.querySelectorAll('[data-qt-push]').forEach(function(b){
    b.addEventListener('click',function(){
      var q=qtData();
      if(window.FAST && FAST.save) FAST.save({stale:false, soRev:q.rev||1}, FAST.QT_KEY);
      applyDewiProc();
      toast('Semua SO terkait mengikuti quotation rev '+(q.rev||1)+'. SO Yaris diperbarui. SO Agya memakai OTR baru saat booking meet.');
    });
  });
  document.querySelectorAll('[data-dewi-afi]').forEach(function(b){
    b.addEventListener('click',function(){
      if(!bfPaid()){ toast('SO Yaris belum terbuka. Booking fee dulu.'); return; }
      if(qtData().stale){ toast('Refresh SO dari quotation dulu.'); return; }
      if(window.FAST && FAST.save) FAST.save({afi:true}, FAST.QT_KEY);
      applyDewiProc();
      toast('AFI terkirim. Data STNK dari SPK. Lanjut DO.');
    });
  });
  document.querySelectorAll('[data-dewi-do]').forEach(function(b){
    b.addEventListener('click',function(){
      if(!qtData().afi){ toast('AFI dulu sebelum DO.'); return; }
      if(window.FAST && FAST.save) FAST.save({dof:true}, FAST.QT_KEY);
      applyDewiProc();
      toast('DO/26/CLD/01426 terbit. Billing menunggu ≥30%.');
    });
  });
  function applyDelivery(){
    var s=window.FAST && FAST.load ? FAST.load(FAST.DEL_KEY) : null;
    var sent=!!(s && s.requested);
    document.querySelectorAll('[data-del-open]').forEach(function(el){ el.hidden=sent; });
    document.querySelectorAll('[data-del-sent]').forEach(function(el){ el.hidden=!sent; });
    document.querySelectorAll('[data-del-spec]').forEach(function(el){ el.textContent=sent?'Menunggu jadwal armada · Deliverable 3':'Tindakan: ajukan pengiriman'; });
    document.querySelectorAll('[data-del-tag]').forEach(function(el){ el.textContent=sent?'Request terkirim':'Siap kirim'; el.className='tag '+(sent?'wait':'ok'); });
  }

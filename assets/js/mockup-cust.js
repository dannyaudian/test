/* Skenario bayar customer + serah terima */
  function getCustPayScene(){
    var live=window.FAST && FAST.load ? FAST.load() : null;
    if(live && live.paid && live.ar===0) return 'paid';
    var s=window.FAST && FAST.load ? FAST.load(FAST.CUST_PAY_KEY) : null;
    var scene=s && s.scene;
    if(scene==='request'||scene==='open'||scene==='both') return scene;
    return 'both';
  }
  function applyCustPayScene(){
    var scene=getCustPayScene();
    var paid=scene==='paid';
    var showReq=!paid && (scene==='both'||scene==='request');
    var showOpen=!paid && (scene==='both'||scene==='open');
    payJobs.open.max=showReq?81750000:181750000;
    document.querySelectorAll('[data-cust-pay]').forEach(function(el){
      var k=el.getAttribute('data-cust-pay');
      if(k==='request') el.hidden=!showReq;
      else if(k==='open') el.hidden=!showOpen;
      else if(k==='none'||k==='paid') el.hidden=!paid;
    });
    document.querySelectorAll('[data-cust-pay-scene]').forEach(function(b){
      var key=b.getAttribute('data-cust-pay-scene');
      b.setAttribute('aria-pressed', (!paid && key===scene)?'true':'false');
    });
    var openMax=formatRp(payJobs.open.max);
    document.querySelectorAll('[data-cust-open-max]').forEach(function(el){
      el.textContent='Maks. '+openMax;
    });
    document.querySelectorAll('[data-cust-open-copy]').forEach(function(el){
      el.textContent=showReq
        ? 'Tidak memakai tagihan salesman. Anda isi nominal, lalu scan QRIS atau terbitkan VA. Maksimum sisa di luar request.'
        : 'Tidak ada penagihan Frontman. Lunasi AR Open sendiri lewat QRIS atau VA. Isi nominal sampai maksimum sisa.';
    });
    var lead=document.querySelector('[data-cust-pay-lead]');
    if(lead){
      if(paid) lead.textContent='Lunas. Tidak ada penagihan Frontman atau pelunasan cashless yang menunggu.';
      else if(scene==='request') lead.textContent='Hanya proses 1: bayar penagihan salesman. Nominal dikunci. Pelunasan cashless tidak tampil.';
      else if(scene==='open') lead.textContent='Hanya proses 2: pelunasan cashless. Isi nominal sendiri. Tidak ada tagihan Frontman.';
      else lead.textContent='Dua jalur terpisah: bayar tagihan salesman bila ada, atau lunasi sendiri lewat cashless.';
    }
    var spec=document.querySelector('[data-cust-list-spec]');
    var tag=document.querySelector('[data-cust-list-tag]');
    var cta=document.querySelector('[data-cust-list-cta]');
    if(spec){
      if(paid) spec.textContent='Lunas · lacak pengiriman dan dokumen';
      else if(scene==='request') spec.textContent='Ada penagihan salesman Rp 100.000.000 · pelunasan cashless tidak dibuka';
      else if(scene==='open') spec.textContent='Tidak ada request Frontman · lunasi sendiri sisa AR Open';
      else spec.textContent='Ada penagihan salesman + sisa bisa dilunasi cashless';
    }
    if(tag){
      tag.textContent=paid?'Lunas':'Menunggu bayar';
      tag.className=paid?'tag ok':'tag hold';
    }
    if(cta) cta.textContent=paid?'Lacak pengiriman →':'Lacak & bayar →';
    var payLi=document.querySelector('[data-cust-track-pay]');
    var shipLi=document.querySelector('[data-cust-track-ship]');
    var docLi=document.querySelector('[data-cust-track-doc]');
    function setMs(el, state, sub){
      if(!el) return;
      el.classList.remove('done','now');
      if(state) el.classList.add(state);
      var m=el.querySelector('.m');
      if(m) m.textContent=state==='done'?'✓':(state==='now'?'•':'•');
      var t=el.querySelector('.t');
      if(t && sub) t.textContent=sub;
    }
    if(paid){
      setMs(payLi,'done','AR Open Rp 0 · kuitansi baru terbit');
      setMs(shipLi,'now','Antrian kirim terbuka setelah lunas');
      setMs(docLi,null,'STNK & BPKB setelah pengajuan cabang');
    } else {
      setMs(payLi,'now', showReq && showOpen
        ? 'Sisa tagihan masih terbuka — pilih penagihan Frontman atau pelunasan cashless'
        : (showReq?'Menunggu bayar penagihan Frontman Rp 100.000.000':'Menunggu pelunasan cashless — isi nominal sendiri'));
      setMs(shipLi,null,'Tertahan sampai lunas · bukan ruang gelap');
      setMs(docLi,null,'STNK & BPKB setelah pelunasan dan pengajuan cabang');
    }
    if(!paid && payJobId==='open') applyPayLockUI();
  }
  document.querySelectorAll('[data-cust-pay-scene]').forEach(function(b){
    b.addEventListener('click',function(){
      var scene=b.getAttribute('data-cust-pay-scene');
      if(window.FAST && FAST.save) FAST.save({scene:scene}, FAST.CUST_PAY_KEY);
      applyCustPayScene();
      toast(scene==='request'?'Skenario: hanya penagihan Frontman.':scene==='open'?'Skenario: hanya pelunasan cashless.':'Skenario: ada request + sisa cashless.');
    });
  });
  function applyHandoverCust(){
    var s=window.FAST && FAST.load ? FAST.load() : null;
    var paid=!!(s && s.paid && s.ar===0);
    var lock=document.querySelector('[data-ho-lock]');
    var ready=document.querySelector('[data-ho-ready]');
    if(lock) lock.hidden=paid;
    if(ready) ready.hidden=!paid;
  }
  var delBtn=document.querySelector('[data-del-submit]');
  if(delBtn) delBtn.addEventListener('click',function(){
    if(window.FAST && FAST.save) FAST.save({requested:true,spk:'SPK/26/CLD/00425'}, FAST.DEL_KEY);
    applyDelivery();
    toast('Request delivery terkirim. Jadwal armada dilanjutkan di Deliverable 3.');
  });
  document.querySelectorAll('#gi [data-drop]').forEach(function(b){
    b.addEventListener('click',function(){
      var kind=b.getAttribute('data-drop');
      var patch={};
      patch[kind]=true;
      if(window.FAST && FAST.save) FAST.save(patch, FAST.GI_KEY);
      else {
        b.classList.add('on');
        applyGi();
      }
    });
  });
  var giSubmit=document.querySelector('[data-gi-submit]');
  if(giSubmit) giSubmit.addEventListener('click',function(){
    var s=window.FAST && FAST.load ? FAST.load(FAST.GI_KEY)||{} : {};
    if(!s.foto||!s.vin||!s.bstkb){
      toast('Pasang foto serah terima, foto VIN, dan scan BSTKB dulu.');
      return;
    }
    if(window.FAST && FAST.save) FAST.save({gi:'submitted',spk:'SPK/26/CLD/00424'}, FAST.GI_KEY);
    applyGi();
    toast('Bukti GI masuk antrean Administrasi. Customer belum melihat paket.');
  });
  var giOk=document.querySelector('[data-gi-approve]');
  if(giOk) giOk.addEventListener('click',function(){
    var st=window.FAST && FAST.load ? (FAST.load(FAST.GI_KEY)||{}).gi : '';
    if(st!=='submitted' && st!=='approved'){
      toast('Salesman belum mengirim bukti.');
      return;
    }
    if(window.FAST && FAST.save) FAST.save({gi:'approved'}, FAST.GI_KEY);
    applyGi();
    toast('GI disetujui. Paket bukti yang sama bisa diunduh pelanggan — bukan CCTV dealer.');
  });
  var giBack=document.querySelector('[data-gi-return]');
  if(giBack) giBack.addEventListener('click',function(){
    if(window.FAST && FAST.save) FAST.save({gi:'returned'}, FAST.GI_KEY);
    applyGi();
    toast('Dikembalikan ke salesman. Lengkapi bukti serah terima.');
  });
  document.querySelectorAll('[data-b2b-tab]').forEach(function(b){
    b.addEventListener('click',function(){
      var tab=b.getAttribute('data-b2b-tab');
      var viewTab={ringkas:'spk',so:'so',alur:'del',dokumen:'afi',tagih:'bill'};
      var hiace=document.getElementById('tx_hiace');
      if(hiace && viewTab[tab]) hiace.setAttribute('data-stage-view', viewTab[tab]);
      patchB2b(function(s){ s.tab=tab; });
    });
  });
  document.addEventListener('fast-stage-map', function(e){
    var tab=(e.detail&&e.detail.tab)||'ringkas';
    patchB2b(function(s){ s.tab=tab; });
  });
  document.querySelectorAll('[data-gi-stay]').forEach(function(b){
    b.addEventListener('click',function(){ toast('Tetap di SPK/26/CLD/00424. Antrean cabang dibuka dari list, bukan dari dalam GI ini.'); });
  });
  document.querySelectorAll('[data-b2b-stay]').forEach(function(b){
    b.addEventListener('click',function(){ toast('Tetap di SPK/26/CLD/00421. Volume area dibuka dari daftar, bukan dari dalam transaksi ini.'); });
  });
  document.querySelectorAll('[data-raize-npwp]').forEach(function(b){
    b.addEventListener('click',function(){
      b.classList.add('on');
      var sp=b.querySelector('span');
      if(sp) sp.textContent='Terpasang · NPWP Sarah · tetap di SPK/26/CLD/00423';
      toast('NPWP tercatat di SPK Sarah. Vault transaksi lain tidak dibuka.');
    });
  });
  document.querySelectorAll('[data-budi-bf]').forEach(function(b){
    b.addEventListener('click',function(){
      toast('Booking fee Zenix sudah kuitansi KWT/26/CLD/008731. Tidak membuka booking Dewi.');
    });
  });
  document.querySelectorAll('[data-b2b-so]').forEach(function(b){
    b.addEventListener('click',function(){
      patchB2b(function(s){
        s.selected=b.getAttribute('data-b2b-so');
        if(s.tab==='ringkas') s.tab='so';
      });
    });
  });
  document.querySelectorAll('[data-b2b-doc]').forEach(function(b){
    b.addEventListener('click',function(){
      var key=b.getAttribute('data-b2b-doc');
      patchB2b(function(s){
        var u=s.units[s.selected];
        u.docs=u.docs||{};
        u.docs[key]=true;
        if(FAST.b2bDocsComplete(u) && (u.backflow || u.status==='docs_requested')){
          u.status='docs_sent';
        }
      });
      toast('Dokumen leasing tersimpan di vault B2B.');
    });
  });
  var signedBtn=document.querySelector('[data-b2b-drop="signed"]');
  if(signedBtn) signedBtn.addEventListener('click',function(){
    var s=FAST.b2bLoad();
    var u=s.units[s.selected]||{};
    if(!u.contractFromLeasing){
      toast('Unduh kontrak dari leasing dulu, lalu unggah yang sudah TTD.');
      return;
    }
    patchB2b(function(st){
      st.units[st.selected].signedContract=true;
      st.units[st.selected].backflow=false;
      st.units[st.selected].status='ttd_uploaded';
    });
    toast('Kontrak TTD tercatat. Delivery gate membaca status ini.');
  });
  document.querySelectorAll('[data-b2b-bill]').forEach(function(b){
    b.addEventListener('click',function(){
      var key=b.getAttribute('data-b2b-bill');
      patchB2b(function(s){
        var u=s.units[s.selected];
        u.billing=u.billing||{};
        u.billing[key]=true;
      });
      toast('Bukti Frontman tersimpan.');
    });
  });
  var dlBtn=document.querySelector('[data-b2b-dl-contract]');
  if(dlBtn) dlBtn.addEventListener('click',function(){
    var s=FAST.b2bLoad();
    var u=s.units[s.selected]||{};
    if(!u.contractFromLeasing){
      toast('Leasing belum submit kontrak untuk SO ini.');
      return;
    }
    leasingContractPdf(b2bSoMeta(s.selected).so);
    patchB2b(function(st){ st.units[st.selected].contractDownloaded=true; });
    toast('Kontrak leasing diunduh. Minta customer TTD, lalu unggah kembali di Kerja Frontman.');
  });
  var resub=document.querySelector('[data-b2b-resubmit]');
  if(resub) resub.addEventListener('click',function(){
    var s=FAST.b2bLoad();
    var u=s.units[s.selected]||{};
    if(!FAST.b2bDocsComplete(u)){
      toast('Lengkapi dokumen yang diminta leasing dulu.');
      return;
    }
    patchB2b(function(st){
      var uu=st.units[st.selected];
      uu.backflow=false;
      uu.backflowReason='';
      uu.status='docs_sent';
    });
    toast('Paket dikirim ulang ke leasing. Backflow ditutup.');
  });
  var issue=document.querySelector('[data-b2b-issue-contract]');
  if(issue) issue.addEventListener('click',function(){
    var s=FAST.b2bLoad();
    var u=s.units[s.selected]||{};
    if(!FAST.b2bDocsComplete(u)){
      toast('Dokumen leasing belum lengkap. Minta Frontman unggah dulu, atau kembalikan.');
      return;
    }
    patchB2b(function(st){
      var uu=st.units[st.selected];
      uu.contractFromLeasing=true;
      uu.backflow=false;
      uu.status='contract_ready';
    });
    toast('Kontrak dari leasing terbit. Frontman bisa mengunduh.');
  });
  var markDp=document.querySelector('[data-b2b-mark-dp]');
  if(markDp) markDp.addEventListener('click',function(){
    patchB2b(function(st){
      st.units[st.selected].dpReceived=true;
      st.units[st.selected].status='dp_received';
    });
    toast('Status DP ditarik dari B2B. Billing gate membaca DP wajib yang sudah diterima.');
  });
  var markEpo=document.querySelector('[data-b2b-mark-epo]');
  if(markEpo) markEpo.addEventListener('click',function(){
    var s=FAST.b2bLoad();
    var u=s.units[s.selected]||{};
    if(!u.dpReceived){
      toast('Tarik full DP dari B2B dulu. E-PO mengikuti persetujuan total DP, nilai dibiayai, dan tenor.');
      return;
    }
    patchB2b(function(st){
      var uu=st.units[st.selected];
      uu.epoReceived=true;
      uu.status='epo_received';
    });
    toast('E-PO leasing tercatat: total DP customer, nilai dibiayai, dan tenor.');
  });
  var ret=document.querySelector('[data-b2b-return]');
  if(ret) ret.addEventListener('click',function(){
    patchB2b(function(st){
      var uu=st.units[st.selected];
      uu.backflow=true;
      uu.backflowReason='Kekurangan dokumen. Frontman lengkapi, kirim ulang ke leasing.';
      uu.status='docs_requested';
    });
    toast('Backflow: dikembalikan ke Frontman. Bukan waiver gate.');
  });
  var paper=document.querySelector('[data-b2b-paperless]');
  if(paper) paper.addEventListener('click',function(){
    var s=FAST.b2bLoad();
    var u=s.units[s.selected]||{};
    if(!FAST.b2bAdminCanBill(u)){
      var packOk=!!(u.dpReceived && FAST.b2bBillingComplete(u));
      if(packOk && !FAST.b2bEpoOk(u)){
        toast('Paket dan DP lengkap, e-PO belum. Ajukan billing tanpa e-PO ke Operation Manager.');
        show('exc_epo');
        return;
      }
      toast('Belum bisa menagih. Frontman harus unduh kontrak, unggah kontrak TTD, foto TTD, foto serah terima, dan BSTKB — plus full DP dari B2B dan e-PO leasing.');
      return;
    }
    patchB2b(function(st){
      st.units[st.selected].paperlessSent=true;
      st.units[st.selected].status='paperless_sent';
    });
    toast('Penagihan paperless terkirim ke leasing. Tidak ada cetak fisik.');
  });
  var kwtBtn=document.querySelector('[data-b2b-kwt]');
  if(kwtBtn) kwtBtn.addEventListener('click',function(){
    var s=FAST.b2bLoad();
    var u=s.units[s.selected]||{};
    var meta=b2bSoMeta(s.selected);
    if(!u.paperlessSent){
      toast('Kirim penagihan paperless dulu. Kuitansi ke leasing diterbitkan Administrasi.');
      return;
    }
    patchB2b(function(st){ st.units[st.selected].kwtIssued=true; });
    if(meta.kwt) downloadReceipt(meta.kwt);
    toast('Kuitansi penagihan ke leasing terbit: '+(meta.kwt||'KWT')+'.');
  });
  var lunasBtn=document.querySelector('[data-b2b-lunas]');
  if(lunasBtn) lunasBtn.addEventListener('click',function(){
    var s=FAST.b2bLoad();
    var u=s.units[s.selected]||{};
    if(!u.kwtIssued){
      toast('Terbitkan kuitansi penagihan ke leasing dulu.');
      return;
    }
    if(!u.epoReceived){
      toast('Pelunasan leasing butuh e-PO asli dari leasing. Putusan Operation Manager hanya membuka paperless.');
      return;
    }
    patchB2b(function(st){
      st.units[st.selected].lunas=true;
      st.units[st.selected].status='lunas';
    });
    toast('Pelunasan leasing tercatat pada SO ini.');
  });

  document.querySelectorAll('[data-bukti-pdf]').forEach(function(b){
    b.addEventListener('click',function(){
      buktiPdf();
      toast('Paket bukti serah terima PDF diunduh.');
    });
  });


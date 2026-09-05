(function(){

  var receipts={
    'KWT/26/CLD/008731':{no:'KWT/26/CLD/008731',status:'Aktif',type:'Booking fee',customer:'Budi Santoso',unit:'Innova Zenix · VIN ••41827',date:'28 Agu 2026, 16:30 WIB',method:'BCA Virtual Account',ref:'VA 8801 0418 0001',spk:'SPK/26/CLD/00418',so:'4500091238',billing:'Belum terbit',amount:'Rp 5.000.000',verify:'VFY-CLD-008731-B3M4'},
    'KWT/26/CLD/009115':{no:'KWT/26/CLD/009115',status:'Aktif',type:'Pelunasan tahap 1',customer:'Budi Santoso',unit:'Innova Zenix · VIN ••41827',date:'1 Sep 2026, 14:08 WIB',method:'BCA Virtual Account',ref:'VA 8801 0418 0002',spk:'SPK/26/CLD/00418',so:'4500091238',billing:'Belum terbit',amount:'Rp 300.000.000',verify:'VFY-CLD-009115-A7K2'},
    'KWT/26/CLD/009280':{no:'KWT/26/CLD/009280',status:'Aktif',type:'Pelunasan',customer:'Agus Hermawan',unit:'Avanza',date:'2 Sep 2026, 16:40 WIB',method:'BCA Virtual Account',ref:'VA 8801 0425 0002',spk:'SPK/26/CLD/00425',so:'4500091301',billing:'Terbit',amount:'Rp 225.400.000',verify:'VFY-CLD-009280-G4N8'},
    'KWT/26/CLD/009220':{no:'KWT/26/CLD/009220',status:'Aktif',type:'Pelunasan tahap 2',customer:'Budi Santoso',unit:'Innova Zenix · VIN ••41827',date:'3 Sep 2026, 09:41 WIB',method:'Cashless',ref:'PAY-CLD-00418-3',spk:'SPK/26/CLD/00418',so:'4500091238',billing:'Belum terbit',amount:'Rp 100.000.000',verify:'VFY-CLD-009220-R8P1'},
    'KWT/26/CLD/009301':{no:'KWT/26/CLD/009301',status:'Aktif',type:'Booking fee',customer:'Dewi Lestari',unit:'Yaris 1.5 G',date:'3 Sep 2026, 10:12 WIB',method:'Cashless',ref:'PAY-CLD-00426-1',spk:'SPK/26/CLD/00426',so:'Belum terbit',billing:'Belum terbit',amount:'Rp 3.000.000',verify:'VFY-CLD-009301-Y4R1'},
    'KWT/26/CLD/009410':{no:'KWT/26/CLD/009410',status:'Aktif',type:'Penagihan leasing',customer:'PT Danapura Multifinance',unit:'Hiace Premio · SO 4500091288',date:'4 Sep 2026, 11:20 WIB',method:'Paperless B2B',ref:'B2B-DP-1288',spk:'SPK/26/CLD/00421',so:'4500091288',billing:'Paperless',amount:'Rp 69.680.000',verify:'VFY-CLD-009410-L1H8'},
    'KWT/26/CLD/009411':{no:'KWT/26/CLD/009411',status:'Aktif',type:'Penagihan leasing',customer:'PT Danapura Multifinance',unit:'Hiace Premio · SO 4500091289',date:'4 Sep 2026, 11:21 WIB',method:'Paperless B2B',ref:'B2B-DP-1289',spk:'SPK/26/CLD/00421',so:'4500091289',billing:'Paperless',amount:'Rp 69.660.000',verify:'VFY-CLD-009411-L2H9'},
    'KWT/26/CLD/009412':{no:'KWT/26/CLD/009412',status:'Aktif',type:'Penagihan leasing',customer:'PT Danapura Multifinance',unit:'Hiace Premio · SO 4500091290',date:'4 Sep 2026, 11:22 WIB',method:'Paperless B2B',ref:'B2B-DP-1290',spk:'SPK/26/CLD/00421',so:'4500091290',billing:'Paperless',amount:'Rp 69.660.000',verify:'VFY-CLD-009412-L3H0'}
  };
  function pdfEscape(s){ return String(s).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)'); }
  function receiptPdf(r){
    var lines=['FAST — E-KUITANSI PEMBAYARAN',r.no,'Status: '+r.status+' · '+r.type,'Customer: '+r.customer,'Unit: '+r.unit,'Tanggal: '+r.date,'Metode: '+r.method,'Payment reference: '+r.ref,'Nomor SPK: '+r.spk,'Nomor SO: '+r.so,'Nomor billing: '+r.billing,'Nominal diterima: '+r.amount,'Kode verifikasi: '+r.verify,'Dokumen ini adalah e-kuitansi hasil pembayaran terverifikasi.'];
    var stream='BT\n/F1 12 Tf\n';
    lines.forEach(function(line,i){ stream += '1 0 0 1 50 '+(780-i*22)+' Tm ('+pdfEscape(line)+') Tj\n'; });
    stream += 'ET';
    var objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>','<< /Length '+stream.length+' >>\nstream\n'+stream+'\nendstream','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
    var pdf='%PDF-1.4\n', offsets=[0];
    objects.forEach(function(body,i){ offsets.push(pdf.length); pdf += (i+1)+' 0 obj\n'+body+'\nendobj\n'; });
    var xref=pdf.length;
    pdf += 'xref\n0 '+(objects.length+1)+'\n0000000000 65535 f \n';
    for(var i=1;i<offsets.length;i++) pdf += String(offsets[i]).padStart(10,'0')+' 00000 n \n';
    pdf += 'trailer << /Size '+(objects.length+1)+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF';
    return pdf;
  }
  function downloadReceipt(no){
    var r=receipts[no]||receipts['KWT/26/CLD/009115'];
    var a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([receiptPdf(r)],{type:'application/pdf'}));
    a.download=r.no.replace(/\//g,'-')+'.pdf';
    document.body.appendChild(a); a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },0);
  }
  function buktiPdf(){
    var lines=['FAST — PAKET BUKTI SERAH TERIMA','SPK/24/CLD/01990','SO 4500081990','Penerima: Budi Santoso','Unit: Calya G AT · VIN ••01990','Waktu: 2 Des 2024, 14:18 WIB','Geotag: -6.2731, 106.8072 · FAST Outlet Cilandak','Foto serah terima: ada','Foto VIN: cocok SO','Scan BSTKB: ada','Disetujui Administrasi. Vault FAST — bukan rekaman CCTV dealer.','Klaim serah terima tanpa paket ini tidak cukup.'];
    var stream='BT\n/F1 12 Tf\n';
    lines.forEach(function(line,i){ stream += '1 0 0 1 50 '+(780-i*22)+' Tm ('+pdfEscape(line)+') Tj\n'; });
    stream += 'ET';
    var objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>','<< /Length '+stream.length+' >>\nstream\n'+stream+'\nendstream','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
    var pdf='%PDF-1.4\n', offsets=[0];
    objects.forEach(function(body,i){ offsets.push(pdf.length); pdf += (i+1)+' 0 obj\n'+body+'\nendobj\n'; });
    var xref=pdf.length;
    pdf += 'xref\n0 '+(objects.length+1)+'\n0000000000 65535 f \n';
    for(var i=1;i<offsets.length;i++) pdf += String(offsets[i]).padStart(10,'0')+' 00000 n \n';
    pdf += 'trailer << /Size '+(objects.length+1)+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF';
    var a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([pdf],{type:'application/pdf'}));
    a.download='FAST-bukti-serah-Calya-01990.pdf';
    document.body.appendChild(a); a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },0);
  }
  function leasingContractPdf(so){
    var lines=['FAST — KONTRAK LEASING (salinan B2B)','Mitra: PT Danapura Multifinance','Debitur: PT Danapura Utama','SPK/26/CLD/00421','Sales Order '+so,'Unit: Hiace Premio','Status: disubmit leasing — unduhan Frontman','Bukan waiver delivery. TTD customer diunggah kembali di FAST.','Dokumen ini contoh PDF workspace, bukan merek lessor pihak ketiga.'];
    var stream='BT\n/F1 12 Tf\n';
    lines.forEach(function(line,i){ stream += '1 0 0 1 50 '+(780-i*22)+' Tm ('+pdfEscape(line)+') Tj\n'; });
    stream += 'ET';
    var objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>','<< /Length '+stream.length+' >>\nstream\n'+stream+'\nendstream','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
    var pdf='%PDF-1.4\n', offsets=[0];
    objects.forEach(function(body,i){ offsets.push(pdf.length); pdf += (i+1)+' 0 obj\n'+body+'\nendobj\n'; });
    var xref=pdf.length;
    pdf += 'xref\n0 '+(objects.length+1)+'\n0000000000 65535 f \n';
    for(var i=1;i<offsets.length;i++) pdf += String(offsets[i]).padStart(10,'0')+' 00000 n \n';
    pdf += 'trailer << /Size '+(objects.length+1)+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF';
    var a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([pdf],{type:'application/pdf'}));
    a.download='FAST-kontrak-leasing-'+so+'.pdf';
    document.body.appendChild(a); a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },0);
  }
  function isDownloadAction(el){ return /^Download/i.test((el.textContent||'').replace(/\s+/g,' ').trim()); }
  function receiptNoFrom(el){
    var box=el.closest('tr, .doc, .pad, .wa, .box')||el.parentElement;
    var m=(box?box.textContent:'').match(/KWT\/26\/CLD\/\d+/);
    return m?m[0]:'KWT/26/CLD/009115';
  }
  var screens=document.querySelectorAll('.screen');
  var navBtns=document.querySelectorAll('.rail button[data-go]');
  var goBtns=document.querySelectorAll('[data-go]');
  var toastEl=document.getElementById('toast');
  var toastTimer=null;
  function toast(msg){
    if(!toastEl) return;
    toastEl.textContent=msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer=setTimeout(function(){ toastEl.classList.remove('show'); }, 2800);
  }
  var payJobId='booking';
  var dgVaBank='BCA';
  var dgQrisReady=false;
  var dgVaReady=false;
  var payJobs={
    booking:{
      name:'Dewi Lestari',spk:'SPK/26/CLD/00426',unit:'Yaris 1.5 G',kind:'Booking fee',amount:'Rp 3.000.000',
      amountNum:3000000,max:3000000,locked:true,
      cdm:'0426 3000 01',brilink:'8810 0426 3000',
      va:{BCA:'8801 0426 0001',BRI:'0026 0426 0001',Mandiri:'8881 0426 0001'},
      back:'booking',
      lead:'Booking fee adalah payment request salesman. QRIS dan VA terkunci Rp 3.000.000.'
    },
    lunas:{
      name:'Budi Santoso',spk:'SPK/26/CLD/00418',unit:'Innova Zenix',kind:'Pelunasan tahap 2',amount:'Rp 100.000.000',
      amountNum:100000000,max:100000000,locked:true,
      cdm:'0418 1000 03',brilink:'8810 0418 0003',
      va:{BCA:'8801 0418 0003',BRI:'0026 0418 0003',Mandiri:'8881 0418 0003'},
      back:'cashless',
      lead:'Ada payment request salesman. Nominal QRIS dan VA terkunci Rp 100.000.000.'
    },
    open:{
      name:'Budi Santoso',spk:'SPK/26/CLD/00418',unit:'Innova Zenix',kind:'Pembayaran unit',amount:'Isi nominal',
      amountNum:0,max:81750000,locked:false,
      cdm:'0418 OPEN 01',brilink:'8810 0418 OPEN',
      va:{BCA:'8801 0418 8100',BRI:'0026 0418 8100',Mandiri:'8881 0418 8100'},
      back:'customer_detail',
      lead:'Tidak ada request untuk sisa ini. Isi nominal. QRIS menampilkan barcode; VA menerbitkan nomor rekening.'
    },
    dewi:{
      name:'Dewi Lestari',spk:'SPK/26/CLD/00426',unit:'Yaris 1.5 G',kind:'Pelunasan Yaris',amount:'Isi nominal',
      amountNum:0,max:299150000,locked:false,
      cdm:'0426 OPEN 01',brilink:'8810 0426 OPEN',
      va:{BCA:'8801 0426 8100',BRI:'0026 0426 8100',Mandiri:'8881 0426 8100'},
      back:'so',
      lead:'Pelunasan SO 4500091426. Isi nominal. QRIS tampil setelah angka; VA terbit setelah angka. EDC hanya Frontman di cabang.'
    },
    agya:{
      name:'Dewi Lestari',spk:'SPK/26/CLD/00426',unit:'Agya 1.2 G',kind:'Booking fee Agya',amount:'Rp 2.000.000',
      amountNum:2000000,max:2000000,locked:true,
      cdm:'0426 2000 02',brilink:'8810 0426 2000',
      va:{BCA:'8801 0426 0002',BRI:'0026 0426 0002',Mandiri:'8881 0426 0002'},
      back:'so2',
      lead:'Booking fee baris Agya. QRIS dan VA terkunci Rp 2.000.000. Tidak menimpa SO Yaris.'
    }
  };
  function formatRp(n){ return 'Rp '+Number(n||0).toLocaleString('id-ID'); }
  function parseRp(s){ var d=String(s||'').replace(/\D/g,''); return d?parseInt(d,10):0; }
  function currentJob(){ return payJobs[payJobId]||payJobs.booking; }
  function currentDgAmount(){
    var j=currentJob();
    if(j.locked) return j.amountNum;
    var inp=document.querySelector('#digiroom [data-pay-amount-input]');
    var n=parseRp(inp&&inp.value);
    if(j.max && n>j.max) n=j.max;
    return n;
  }
  function syncPayAmount(){
    var j=currentJob();
    var n=currentDgAmount();
    var label=j.locked?j.amount:(n?formatRp(n):'Isi nominal');
    document.querySelectorAll('[data-pay-amount]').forEach(function(el){ el.textContent=label; });
    document.querySelectorAll('[data-pay-amount-display]').forEach(function(el){ el.textContent=n?formatRp(n):'—'; });
    var inp=document.querySelector('#digiroom [data-pay-amount-input]');
    if(inp && j.locked) inp.value=String(j.amountNum);
  }
  function applyPayLockUI(){
    var j=currentJob();
    var locked=!!j.locked;
    document.querySelectorAll('[data-pay-locked]').forEach(function(el){ el.hidden=!locked; });
    document.querySelectorAll('[data-pay-open]').forEach(function(el){ el.hidden=locked; });
    var inp=document.querySelector('#digiroom [data-pay-amount-input]');
    if(inp){
      inp.readOnly=locked;
      inp.value=locked?String(j.amountNum):'';
    }
    document.querySelectorAll('[data-pay-max]').forEach(function(el){
      el.textContent='Maksimum '+formatRp(j.max)+(locked?'':' · sisa di luar request aktif');
    });
    var lead=document.querySelector('[data-pay-lead]');
    if(lead) lead.textContent=j.lead;
    dgQrisReady=locked;
    dgVaReady=locked;
    syncPayAmount();
    refreshDgInstruments();
  }
  function refreshDgInstruments(){
    var n=currentDgAmount();
    var qrisOn=dgQrisReady && n>0;
    var vaOn=dgVaReady && n>0;
    document.querySelectorAll('[data-qris-wait]').forEach(function(el){ el.hidden=qrisOn; });
    document.querySelectorAll('[data-qris-ready]').forEach(function(el){ el.hidden=!qrisOn; });
    document.querySelectorAll('[data-va-wait]').forEach(function(el){ el.hidden=vaOn; });
    document.querySelectorAll('[data-va-ready]').forEach(function(el){ el.hidden=!vaOn; });
  }
  function setPayJob(id){
    payJobId=payJobs[id]?id:'booking';
    var j=currentJob();
    document.querySelectorAll('[data-pay-name]').forEach(function(el){ el.textContent=j.name; });
    document.querySelectorAll('[data-pay-spk]').forEach(function(el){ el.textContent=j.spk; });
    document.querySelectorAll('[data-pay-unit]').forEach(function(el){ el.textContent=j.unit; });
    document.querySelectorAll('[data-pay-kind]').forEach(function(el){ el.textContent=j.kind; });
    document.querySelectorAll('[data-pay-cdm]').forEach(function(el){ el.textContent=j.cdm; });
    document.querySelectorAll('[data-pay-brilink]').forEach(function(el){ el.textContent=j.brilink; });
    var back=document.querySelector('[data-dg-back]');
    if(back){
      back.setAttribute('data-go', j.back);
      back.setAttribute('data-role', j.back==='customer_detail'?'cust':'frontman');
      back.textContent=j.back==='customer_detail'?'← Pesanan':'← Frontman';
    }
    var no=document.getElementById('dgVaNo');
    if(no) no.textContent=j.va.BCA;
    applyPayLockUI();
    showDg('home');
    if(window.FAST && FAST.renderLineage) FAST.renderLineage({payJob:payJobId, screen:(document.querySelector('.screen.on')||{}).id});
  }
  var ADMIN_BOOK={
    admin_spk:'spk',admin_qt:'qt',admin_so:'so',admin_do:'do',
    admin_afi:'afi',admin_bill:'bill',admin_leasing:'leasing',admin_kwt:'kwt',admin_pay:'pay',
    admin_tx:'spk'
  };
  var ADMIN_BOOK_META={
    spk:{title:'List SPK · Cilandak',lead:'Semua SPK cabang. Buka baris ke data SPK yang sama dengan Frontman.',back:'← List SPK'},
    qt:{title:'List quotation · Cilandak',lead:'Satu SPK = satu quotation. Satu baris quotation = satu SO. Revisi menarik semua SO terkait.',back:'← List quotation'},
    so:{title:'List Sales Order · Cilandak',lead:'SO dikonversi dari SPK/quotation. Bukan form baru.',back:'← List SO'},
    do:{title:'List Delivery Order · Cilandak',lead:'DO dari SO setelah AFI. Unit dan penerima dari SPK.',back:'← List DO'},
    afi:{title:'List AFI · Cilandak',lead:'Nama dan alamat STNK dari SPK. Jalur normal berpasangan dengan billing.',back:'← List AFI'},
    bill:{title:'List billing · Cilandak',lead:'Cash ≥30% in dan leasing full DP dari B2B. Non-waivable.',back:'← List billing'},
    leasing:{title:'List B2B leasing · Cilandak',lead:'DP wajib customer dari B2B. Frontman lengkapi data. Administrasi menagih paperless dan menerbitkan kuitansi ke leasing.',back:'← List leasing'},
    kwt:{title:'List kuitansi · Cilandak',lead:'Satu nomor kuitansi per pembayaran terverifikasi, tertaut SPK/SO.',back:'← List kuitansi'},
    pay:{title:'List pembayaran · Cilandak',lead:'Posted, request, pending, dan unmatched. Unmatched dicocokkan di Perlu saya.',back:'← List pembayaran'}
  };
  var ADMIN_RAIL_FROM={
    spk:'admin_spk',spk_baru:'admin_spk',tx_raize:'admin_spk',
    quot:'admin_qt',booking:'admin_qt',
    so:'admin_so',so2:'admin_so',transaksi:'admin_so',tx_hiace:'admin_leasing',
    do:'admin_do',delivery:'admin_do',gi:'admin_do',
    afi:'admin_afi',afi_d:'admin_afi',stnk_d:'admin_afi',tx_fortuner:'admin_afi',
    bill_d:'admin_bill',
    bayar:'admin_kwt',e_kuitansi:'admin_kwt',
    cashless:'admin_pay',request:'admin_pay'
  };
  var currentBookKey='spk';
  var adminReturn='admin_spk';
  var adminPayFilter='all';
  function activateAdminBook(key){
    currentBookKey=key;
    adminReturn='admin_'+key;
    document.querySelectorAll('#admin_book [data-book-panel]').forEach(function(p){
      p.hidden = p.getAttribute('data-book-panel')!==key;
    });
    var meta=ADMIN_BOOK_META[key]||ADMIN_BOOK_META.spk;
    var t=document.querySelector('[data-book-title]');
    var l=document.querySelector('[data-book-lead]');
    if(t) t.textContent=meta.title;
    if(l) l.textContent=meta.lead;
    filterAdminBook();
  }
  function filterAdminBook(){
    var q=((document.getElementById('adminBookSearch')||{}).value||'').toLowerCase();
    var panel=document.querySelector('#admin_book [data-book-panel="'+currentBookKey+'"]');
    if(!panel) return;
    var n=0,total=0;
    panel.querySelectorAll('tbody tr').forEach(function(row){
      total++;
      var on=!q||row.textContent.toLowerCase().indexOf(q)>-1;
      if(currentBookKey==='pay'){
        var st=row.getAttribute('data-admin-pay-status')||'';
        if(adminPayFilter!=='all' && st!==adminPayFilter) on=false;
      }
      if(on) n++;
      row.classList.toggle('is-hidden', !on);
    });
    var line=document.querySelector('[data-book-count]');
    if(line) line.innerHTML='<b>'+n+' dari '+total+'</b> · klik baris ke data Frontman yang sama';
  }
  document.addEventListener('click',function(e){
    var payF=e.target.closest('[data-admin-pay-filter]');
    if(!payF) return;
    e.preventDefault();
    adminPayFilter=payF.getAttribute('data-admin-pay-filter');
    document.querySelectorAll('[data-admin-pay-filter]').forEach(function(x){
      x.setAttribute('aria-pressed', x===payF?'true':'false');
    });
    if(currentBookKey!=='pay') activateAdminBook('pay');
    else filterAdminBook();
  });
  var activeTx=null;
  try { activeTx=sessionStorage.getItem('fast.mock.tx')||null; } catch(e) {}
  var LIST_SCREENS={
    beranda:1,admin_spk:1,admin_qt:1,admin_so:1,admin_do:1,admin_afi:1,admin_bill:1,
    admin_leasing:1,admin_kwt:1,admin_pay:1,admin_book:1,admin_tx:1,verifikasi:1,
    eskalasi:1,dashboard:1,mgmt_inbox:1,customer:1
  };
  function persistTx(tx){
    activeTx=tx||null;
    if(window.FAST) FAST.activeTx=activeTx;
    try {
      if(activeTx) sessionStorage.setItem('fast.mock.tx', activeTx);
      else sessionStorage.removeItem('fast.mock.tx');
    } catch(e) {}
  }
  function familyOf(tx){ return (window.FAST && FAST.txFamily)?FAST.txFamily(tx):tx; }
  function txOf(id){ return (window.FAST && FAST.screenTx)?FAST.screenTx(id, payJobId):null; }
  function hubOf(tx){ return (window.FAST && FAST.txHub && FAST.txHub(tx))||'beranda'; }
  function stayTarget(id, fromId){
    if(LIST_SCREENS[id]){
      if(id==='beranda'||id==='admin_spk'||id==='customer'||id==='dashboard'||id==='mgmt_inbox'||id==='verifikasi'||id==='eskalasi') persistTx(null);
      return id;
    }
    if(id==='proses'){
      var curP=activeTx||txOf(fromId);
      if(curP && familyOf(curP)!=='dewi') return hubOf(curP);
      persistTx('dewi');
      return 'proses';
    }
    var nextTx=txOf(id);
    var cur=activeTx||txOf(fromId);
    if(cur && nextTx && familyOf(cur)!==familyOf(nextTx)){
      if(id==='cashless'||id==='digiroom'||id==='booking'||id==='dokumen'||id==='request'||id==='afi'||id==='exc_alamat'||id==='transaksi'||id==='customer_detail'||id==='bukti_serah'||id==='gi'||id==='bayar'){
        return hubOf(cur);
      }
    }
    if(nextTx) persistTx(nextTx);
    return id;
  }
  function syncStayTabs(){
    var fam=familyOf(activeTx);
    var map={ringkas:'transaksi',bayar:'cashless',minta:'request',afi:'afi',dok:'dokumen',exc:'exc_alamat'};
    if(fam==='dewi' && (activeTx==='agya'||payJobId==='agya')){
      map={ringkas:'so2',bayar:'cashless',minta:'so2',afi:'quot',dok:'spk',exc:'spk'};
    } else if(fam==='dewi'){
      map={ringkas:'so',bayar:'cashless',minta:'so',afi:'afi_d',dok:'spk',exc:'spk'};
    }
    document.querySelectorAll('#cashless [data-stay-tab]').forEach(function(b){
      var k=b.getAttribute('data-stay-tab');
      if(map[k]) b.setAttribute('data-go', map[k]);
      if(k==='minta'||k==='exc') b.hidden=fam==='dewi';
    });
  }
  function show(id){
    var from=(document.querySelector('.screen.on')||{}).id;
    id=stayTarget(id, from);
    if(id==='admin_tx') id='admin_spk';
    if(currentRole==='mgmt' && id==='eskalasi') id='mgmt_inbox';
    var bookKey=ADMIN_BOOK[id];
    var screenId=bookKey?'admin_book':id;
    screens.forEach(function(s){ s.classList.toggle('on', s.id===screenId); });
    if(bookKey) activateAdminBook(bookKey);
    var railId=({
      customer_detail:'customer',order_aksesoris:'customer',order_calya:'customer',bukti_serah:'customer',
      tagihan_customer:'customer',e_kuitansi:'customer',
      transaksi:'beranda',bayar:'cashless',request:'beranda',dokumen:'beranda',cashless:'beranda',
      tx_hiace:'beranda',tx_raize:'beranda',tx_avanza:'beranda',tx_fortuner:'beranda',
      booking:'beranda',spk:'beranda',spk_baru:'beranda',quot:'beranda',so:'beranda',so2:'beranda',proses:'beranda',
      afi_d:'beranda',do:'beranda',bill_d:'beranda',kirim_d:'beranda',stnk_d:'beranda',
      delivery:'beranda',gi:'beranda',afi:'beranda',digiroom:'customer',
      exc_alamat:'eskalasi',exc_stnk:'eskalasi',exc_afi:'eskalasi'
    })[id]||id;
    if(currentRole==='admin'){
      if(id==='verifikasi'){ railId='verifikasi'; adminReturn='verifikasi'; }
      else if(id==='eskalasi'){ railId='eskalasi'; adminReturn='eskalasi'; }
      else if(id.indexOf('exc_')===0) railId='eskalasi';
      else railId='admin_spk';
      if(ADMIN_BOOK[id]) adminReturn=id;
    }
    if(currentRole==='mgmt'){
      if(id==='dashboard') railId='dashboard';
      else if(id==='mgmt_inbox'||id==='eskalasi'||id.indexOf('exc_')===0) railId='mgmt_inbox';
      else railId='dashboard';
    }
    navBtns.forEach(function(b){
      var rail=b.closest('[data-rail]');
      if(b.dataset.go===railId && rail && rail.hidden!==true) b.setAttribute('aria-current','true');
      else b.removeAttribute('aria-current');
    });
    document.querySelectorAll('.worktabs [data-go]').forEach(function(b){
      var tabOn=(id==='cashless'&&b.dataset.go==='cashless')||b.dataset.go===id;
      b.setAttribute('aria-current', tabOn ? 'true' : 'false');
    });
    document.querySelectorAll('.journey a').forEach(function(a){
      var href=(a.getAttribute('href')||'');
      var hid=href.split('#')[1]||'';
      var on=(hid==='beranda'&&(id==='beranda'||id==='admin_book'||ADMIN_BOOK[id]||id==='verifikasi'||id==='transaksi'||id.indexOf('tx_')===0||id==='dokumen'||id==='request'||id==='eskalasi'||id==='spk'||id==='spk_baru'||id==='quot'||id==='so'||id==='so2'||id==='proses'||id==='afi_d'||id==='do'||id==='bill_d'||id==='kirim_d'||id==='stnk_d'||id==='booking'||id==='delivery'||id==='gi'||id==='afi'||id.indexOf('exc_')===0))
        ||(hid==='proses'&&(id==='proses'||id==='spk'||id==='quot'||id==='so'||id==='so2'||id==='afi_d'||id==='do'||id==='bill_d'||id==='kirim_d'||id==='stnk_d'||id==='booking'))
        ||(hid==='cashless'&&(id==='cashless'||id==='bayar'||id==='admin_pay'||id==='admin_kwt'||id==='digiroom'))
        ||(hid==='customer'&&(id==='customer'||id==='customer_detail'||id==='tagihan_customer'||id==='e_kuitansi'||id==='digiroom'||id==='bukti_serah'||id.indexOf('order_')===0));
      a.classList.toggle('on', on);
      a.classList.toggle('pay', hid==='cashless');
    });
    var bar=document.querySelector('.urlbar');
    if(bar) bar.textContent=(id==='digiroom'?'digiroom.fast.id/beranda':'sam.fast.id/fast/'+id);
    if(history.replaceState) try { history.replaceState(null,'','#'+id); } catch(err) {}
    var cashBack=document.querySelector('#cashless [data-back]');
    if(cashBack){
      cashBack.setAttribute('data-go', currentRole==='cust'?'customer_detail':(currentRole==='admin'?'admin_pay':'beranda'));
      cashBack.textContent=currentRole==='cust'?'← Pesanan':(currentRole==='admin'?'← List pembayaran':'← Daftar');
    }
    document.querySelectorAll('[data-exc-back]').forEach(function(b){
      if(currentRole==='mgmt'){
        b.setAttribute('data-go','eskalasi');
        b.textContent='← Antrean';
      } else if(currentRole==='admin'){
        var to=adminReturn==='verifikasi'?'verifikasi':'eskalasi';
        b.setAttribute('data-go', to);
        b.textContent=to==='verifikasi'?'← Perlu saya':'← Pengecualian';
      } else {
        b.setAttribute('data-go','eskalasi');
        b.textContent='← Antrean';
      }
    });
    var strip=document.getElementById('adminStrip');
    if(strip){
      var adminHome=!!bookKey||id==='verifikasi'||id==='eskalasi'||id==='admin_book';
      strip.hidden=currentRole!=='admin'||adminHome;
      var homeBtn=strip.querySelector('[data-admin-home]');
      if(homeBtn){
        homeBtn.setAttribute('data-go', adminReturn||'admin_spk');
        if(adminReturn==='verifikasi') homeBtn.textContent='← Perlu saya';
        else if(adminReturn==='eskalasi') homeBtn.textContent='← Pengecualian';
        else {
          var bk=(adminReturn||'admin_spk').replace('admin_','');
          homeBtn.textContent=(ADMIN_BOOK_META[bk]&&ADMIN_BOOK_META[bk].back)||'← Buku cabang';
        }
      }
    }
    var adminPill=document.querySelector('[data-admin-pill]');
    if(adminPill){
      var need=document.querySelectorAll('#verifikasi tbody tr:not([hidden])').length;
      adminPill.textContent=String(need);
    }
    syncHomeBack();
    document.querySelectorAll('#cashless .worktabs, #cashless [data-go="transaksi"]').forEach(function(el){
      el.hidden=currentRole==='cust';
    });
    applyCashlessEdc();
    if(id==='booking') setPayJob('booking');
    if(id==='so2' && !payJobSticky) setPayJob('agya');
    if(id==='so'||id==='bill_d'||id==='kirim_d'||id==='afi_d'||id==='do'){
      if(!payJobSticky) setPayJob('dewi');
    }
    if(id==='cashless'){
      if(!payJobSticky){
        var fam=familyOf(activeTx);
        if(fam==='dewi') setPayJob(activeTx==='agya'?'agya':'dewi');
        else setPayJob('lunas');
      }
      setCashQrisMode('request');
    }
    payJobSticky=false;
    syncStayTabs();
    syncRoleChrome();
    syncMgmtSeat();
    applyExcAlamat();
    applyBooking();
    applySpkDraft();
    applyDelivery();
    applyGi();
    applyB2b();
    applyAfi();
    applyStnk();
    applyMgmtInbox();
    applyDewiProc();
    applyHandoverCust();
  }
  if(window.FAST && FAST.lineageInit) FAST.lineageInit(show);
  goBtns.forEach(function(b){ b.addEventListener('click',function(e){
    if(isDownloadAction(b)){ e.preventDefault(); downloadReceipt(receiptNoFrom(b)); toast('E-kuitansi PDF diunduh.'); return; }
    var fromFrontman=currentRole==='frontman';
    if(b.dataset.role) applyRole(b.dataset.role);
    if(b.dataset.txDots) persistTx(b.dataset.txDots);
    if(b.dataset.payJob){
      setPayJob(b.dataset.payJob);
      payJobSticky=true;
      if(b.dataset.go==='digiroom') toast(fromFrontman?'Tautan terkirim. Customer masuk ke beranda Digiroom.':'Pilih QRIS atau VA di Digiroom.');
    }
    if(b.dataset.afiExc) setAfiExcView(b.dataset.afiExc);
    if(b.dataset.b2bPick && window.FAST && FAST.b2bLoad){
      var pick=FAST.b2bLoad();
      pick.selected=b.dataset.b2bPick;
      FAST.save({units:pick.units, selected:pick.selected, tab:pick.tab||'alur'}, FAST.B2B_KEY);
    }
    show(b.dataset.go);
    if(b.dataset.scroll){
      var hold=document.getElementById(b.dataset.scroll);
      if(hold){
        hold.scrollIntoView({behavior:'smooth',block:'start'});
        return;
      }
    }
    window.scrollTo({top:document.querySelector('.app').offsetTop-20,behavior:'smooth'});
  }); });
  document.querySelectorAll('#mockup button').forEach(function(b){
    if(isDownloadAction(b) && !b.hasAttribute('data-go') && !b.hasAttribute('data-bukti-pdf')){
      b.addEventListener('click',function(){ downloadReceipt(receiptNoFrom(b)); toast('E-kuitansi PDF diunduh.'); });
      return;
    }
    if(b.hasAttribute('data-go') || b.classList.contains('roletab') || b.closest('.proc') || (b.closest('.seg') && b.closest('#jenisSeg'))) return;
    if(b.hasAttribute('data-bf') || b.hasAttribute('data-bf-pay') || b.hasAttribute('data-pay-link') || b.hasAttribute('data-dg') || b.hasAttribute('data-dg-pay') || b.hasAttribute('data-edc-device') || b.hasAttribute('data-cash') || b.hasAttribute('data-cash-amt') || b.hasAttribute('data-qris-show') || b.hasAttribute('data-va-issue')) return;
    if(b.hasAttribute('data-mgmt-act') || b.hasAttribute('data-mgmt-filter') || b.hasAttribute('data-admin-pay-filter') || b.hasAttribute('data-admin-home') || b.hasAttribute('data-mgmt-seat')) return;
    if(b.hasAttribute('data-spk-fill') || b.hasAttribute('data-spk-up') || b.hasAttribute('data-spk-step') || b.hasAttribute('data-spk-save') || b.hasAttribute('data-spk-reset') || b.hasAttribute('data-spk-same') || b.hasAttribute('data-spk-pay')) return;
    if(b.hasAttribute('data-b2b-tab') || b.hasAttribute('data-b2b-so') || b.hasAttribute('data-b2b-doc') || b.hasAttribute('data-b2b-drop') || b.hasAttribute('data-b2b-bill') || b.hasAttribute('data-b2b-dl-contract') || b.hasAttribute('data-b2b-paperless') || b.hasAttribute('data-b2b-kwt') || b.hasAttribute('data-b2b-lunas') || b.hasAttribute('data-b2b-resubmit') || b.hasAttribute('data-b2b-issue-contract') || b.hasAttribute('data-b2b-mark-dp') || b.hasAttribute('data-b2b-return') || b.hasAttribute('data-b2b-stay') || b.hasAttribute('data-raize-npwp') || b.hasAttribute('data-budi-bf')) return;
    if(b.hasAttribute('data-del-submit') || b.hasAttribute('data-gi-submit') || b.hasAttribute('data-gi-approve') || b.hasAttribute('data-gi-return') || b.hasAttribute('data-gi-stay') || b.hasAttribute('data-drop') || b.hasAttribute('data-bukti-pdf') || b.hasAttribute('data-afi-submit') || b.hasAttribute('data-afi-kind') || b.hasAttribute('data-afi-bill') || b.hasAttribute('data-afi-pair') || b.hasAttribute('data-afi-exc') || b.hasAttribute('data-exc-afi-submit') || b.hasAttribute('data-exc-afi-verify') || b.hasAttribute('data-exc-afi-approve') || b.hasAttribute('data-exc-afi-reject')) return;
    var label=(b.textContent||'').replace(/\s+/g,' ').trim();
    if(/^Bayar Rp/.test(label)){
      b.addEventListener('click',function(){ toast('Pembayaran terverifikasi. E-kuitansi baru siap diunduh.'); });
    } else if(/Kirim instruksi pembayaran|Kirim tagihan|Kirim pengingat/.test(label)){
      b.addEventListener('click',function(){ toast('Instruksi terkirim ke customer.'); });
    } else if(/Ajukan billing/.test(label)){
      b.addEventListener('click',function(){ toast('Billing gate cash lolos (≥30%). Permintaan billing dikirim.'); });
    } else if(/Buat SPK baru/.test(label)){
      b.addEventListener('click',function(){ toast('Draft SPK dibuat. Lengkapi data customer sekali di sumber.'); });
    } else if(/Cari transaksi/.test(label)){
      b.addEventListener('click',function(){
        var q=document.getElementById('txSearch');
        if(q){ q.focus(); show('beranda'); }
      });
    }
  });
  var seg=document.getElementById('jenisSeg');
  if(seg){ seg.querySelectorAll('button').forEach(function(b){ b.addEventListener('click',function(){
    seg.querySelectorAll('button').forEach(function(x){x.setAttribute('aria-pressed', x===b?'true':'false');});
  }); }); }

  var payJobSticky=false;
  var currentRole='frontman';
  var first={frontman:'beranda',admin:'admin_spk',mgmt:'mgmt_inbox',cust:'customer'};
  var mgmtSeat='ka';
  var MGMT_SEATS={
    ka:{label:'Kepala Administrasi',home:'mgmt_inbox'},
    kc:{label:'Kepala Cabang',home:'mgmt_inbox'},
    abh:{label:'Area Business Head',home:'dashboard'},
    om:{label:'Operation Manager',home:'mgmt_inbox'}
  };
  function syncMgmtSeat(){
    var meta=MGMT_SEATS[mgmtSeat]||MGMT_SEATS.ka;
    document.querySelectorAll('[data-mgmt-seat]').forEach(function(b){
      b.setAttribute('aria-pressed', b.getAttribute('data-mgmt-seat')===mgmtSeat?'true':'false');
    });
    document.querySelectorAll('[data-mgmt-label]').forEach(function(el){
      el.textContent='Management · '+meta.label;
    });
    document.querySelectorAll('[data-mgmt-title]').forEach(function(el){ el.textContent=meta.label; });
    var lead=document.querySelector('[data-mgmt-lead]');
    if(lead){
      var leads={
        ka:'Putusan exception waivable (alamat, pecah AFI/billing). 30% dan lunas tidak di-waive.',
        kc:'Eskalasi STNK aging cabang. Bukan tombol lunas. Volume cabang di tab Volume.',
        abh:'Pantau bottleneck area. Putusan tetap di Kepala Administrasi / Kepala Cabang.',
        om:'Pantau kirim dan Good Issue. Bukan Approval Engine.'
      };
      lead.textContent=leads[mgmtSeat]||leads.ka;
    }
    document.querySelectorAll('[data-mgmt-need]').forEach(function(el){
      var need=el.getAttribute('data-mgmt-need');
      el.hidden = currentRole!=='mgmt' || mgmtSeat!==need;
    });
  }
  var screenRole={beranda:'frontman',transaksi:'frontman',bayar:'frontman',request:'frontman',dokumen:'frontman',cashless:'frontman',tx_hiace:'frontman',tx_raize:'frontman',tx_avanza:'frontman',tx_fortuner:'frontman',spk:'frontman',spk_baru:'frontman',quot:'frontman',so:'frontman',so2:'frontman',proses:'frontman',afi_d:'frontman',do:'frontman',bill_d:'frontman',kirim_d:'frontman',stnk_d:'frontman',booking:'frontman',delivery:'frontman',afi:'frontman',gi:'frontman',digiroom:'cust',admin_book:'admin',admin_spk:'admin',admin_qt:'admin',admin_so:'admin',admin_do:'admin',admin_afi:'admin',admin_bill:'admin',admin_leasing:'admin',admin_kwt:'admin',admin_pay:'admin',admin_tx:'admin',verifikasi:'admin',dashboard:'mgmt',mgmt_inbox:'mgmt',eskalasi:'frontman',exc_alamat:'frontman',exc_afi:'frontman',exc_stnk:'frontman',customer:'cust',customer_detail:'cust',order_aksesoris:'cust',order_calya:'cust',bukti_serah:'cust',tagihan_customer:'cust',e_kuitansi:'cust'};
  document.querySelectorAll('[data-go="beranda"]').forEach(function(b){
    if(b.closest('[data-rail]') || b.hasAttribute('data-back')) return;
    b.setAttribute('data-home', b.closest('#bayar, #request') ? 'pay' : 'tx');
  });
  function syncHomeBack(){
    document.querySelectorAll('[data-home]').forEach(function(b){
      var kind=b.getAttribute('data-home');
      if(currentRole==='admin'){
        var dest=adminReturn||'admin_spk';
        if(kind==='pay') dest='admin_pay';
        else if(dest==='verifikasi'||dest==='eskalasi') dest=dest;
        else if(!ADMIN_BOOK[dest]) dest='admin_spk';
        b.setAttribute('data-go', dest);
        if(/Daftar|Transaksi saya|Buku|antrean|List|Perlu|Pengecualian|Cabang/i.test(b.textContent||'')){
          if(dest==='verifikasi') b.textContent='← Perlu saya';
          else if(dest==='eskalasi') b.textContent='← Pengecualian';
          else {
            var key=dest.replace('admin_','');
            b.textContent=(ADMIN_BOOK_META[key]&&ADMIN_BOOK_META[key].back)||'← Buku cabang';
          }
        }
      } else if(currentRole==='mgmt'){
        b.setAttribute('data-go','dashboard');
        if(/Daftar|Transaksi saya|Buku|antrean|List|Cabang/i.test(b.textContent||'')){
          b.textContent='← Cabang';
        }
      } else {
        b.setAttribute('data-go','beranda');
        if(/Buku/i.test(b.textContent||'')) b.textContent='← Daftar';
      }
    });
  }
  function syncRoleChrome(){
    document.querySelectorAll('[data-for]').forEach(function(el){
      el.hidden = el.getAttribute('data-for') !== currentRole;
    });
    document.querySelectorAll('[data-fm-only]').forEach(function(el){
      el.hidden = currentRole!=='frontman';
    });
  }
  function applyRole(role){
    currentRole=role;
    document.querySelectorAll('.roletab').forEach(function(x){x.setAttribute('aria-pressed', x.dataset.role===role?'true':'false');});
    document.querySelectorAll('[data-rail]').forEach(function(r){ r.hidden = r.dataset.rail!==role; });
    syncRoleChrome();
    applyCashlessEdc();
    syncMgmtSeat();
  }
  document.querySelectorAll('.roletab').forEach(function(t){
    t.addEventListener('click',function(){
      applyRole(t.dataset.role);
      var dest=t.dataset.role==='admin'?'admin_spk':first[t.dataset.role];
      if(t.dataset.role==='mgmt') dest=(MGMT_SEATS[mgmtSeat]||MGMT_SEATS.ka).home;
      show(dest);
      toast('Peran: '+(t.dataset.role==='mgmt'?(MGMT_SEATS[mgmtSeat]||MGMT_SEATS.ka).label:t.textContent.trim()));
    });
  });
  var hash=(location.hash||'').replace('#','');
  if(hash==='admin_tx') hash='admin_spk';
  if(hash && (document.getElementById(hash) || ADMIN_BOOK[hash])){
    if(screenRole[hash]) applyRole(screenRole[hash]);
    show(hash);
  }
  window.addEventListener('hashchange', function(){
    var h=(location.hash||'').replace('#','');
    if(h==='admin_tx') h='admin_spk';
    if(h && (document.getElementById(h) || ADMIN_BOOK[h])){
      if(screenRole[h]) applyRole(screenRole[h]);
      show(h);
    }
  });

  var orderFilter='all';
  function filterOrders(){
    var q=((document.getElementById('orderSearch')||{}).value||'').toLowerCase();
    document.querySelectorAll('#orderList .order-card').forEach(function(card){
      var st=card.getAttribute('data-order-status');
      var matchFilter=orderFilter==='all'||st===orderFilter;
      var matchQ=!q||card.textContent.toLowerCase().indexOf(q)>-1;
      card.classList.toggle('is-hidden', !(matchFilter&&matchQ));
    });
  }
  document.querySelectorAll('[data-order-filter]').forEach(function(b){
    b.addEventListener('click',function(){
      orderFilter=b.getAttribute('data-order-filter');
      document.querySelectorAll('[data-order-filter]').forEach(function(x){
        x.setAttribute('aria-pressed', x===b?'true':'false');
      });
      filterOrders();
    });
  });
  var orderSearch=document.getElementById('orderSearch');
  if(orderSearch) orderSearch.addEventListener('input', filterOrders);

  var txFilter='all';
  function filterTx(){
    var q=((document.getElementById('txSearch')||{}).value||'').toLowerCase();
    document.querySelectorAll('#txList .order-card').forEach(function(card){
      var st=card.getAttribute('data-tx-status');
      var act=card.getAttribute('data-tx-action')==='1';
      var match=txFilter==='all'||(txFilter==='action'&&act)||st===txFilter;
      var matchQ=!q||card.textContent.toLowerCase().indexOf(q)>-1;
      card.classList.toggle('is-hidden', !(match&&matchQ));
    });
  }
  document.querySelectorAll('[data-tx-filter]').forEach(function(b){
    b.addEventListener('click',function(){
      txFilter=b.getAttribute('data-tx-filter');
      document.querySelectorAll('.order-filters [data-tx-filter]').forEach(function(x){
        x.setAttribute('aria-pressed', x.getAttribute('data-tx-filter')===txFilter?'true':'false');
      });
      show('beranda');
      filterTx();
    });
  });
  var search=document.getElementById('txSearch');
  if(search) search.addEventListener('input', filterTx);

  document.addEventListener('input',function(e){
    if(e.target && e.target.id==='adminBookSearch') filterAdminBook();
  }, true);
  document.addEventListener('keyup',function(e){
    if(e.target && e.target.id==='adminBookSearch') filterAdminBook();
  }, true);
  var bookSearch=document.getElementById('adminBookSearch');
  if(bookSearch){
    ['input','keyup','change','search'].forEach(function(ev){
      bookSearch.addEventListener(ev, filterAdminBook);
    });
  }
  var lastBookQ='';
  setInterval(function(){
    var box=document.getElementById('admin_book');
    var q=document.getElementById('adminBookSearch');
    if(!box||!q||!box.classList.contains('on')) return;
    if(q.value===lastBookQ) return;
    lastBookQ=q.value;
    filterAdminBook();
  },200);

  var excFilter='all';
  function filterExc(){
    document.querySelectorAll('#excList .order-card').forEach(function(card){
      var kind=card.getAttribute('data-exc-kind');
      var match=excFilter==='all'||kind===excFilter;
      card.classList.toggle('is-hidden', !match);
    });
  }
  document.querySelectorAll('[data-exc-filter]').forEach(function(b){
    b.addEventListener('click',function(){
      excFilter=b.getAttribute('data-exc-filter');
      document.querySelectorAll('[data-exc-filter]').forEach(function(x){
        x.setAttribute('aria-pressed', x===b?'true':'false');
      });
      show('eskalasi');
      filterExc();
    });
  });

  function excAlamatState(){
    var s=window.FAST && FAST.load ? FAST.load() : null;
    return (s && s.excAlamat) || 'draft';
  }
  function applyExcAlamat(){
    var st=excAlamatState();
    var notes={
      draft:'Belum diajukan. Frontman kirim alasan dan bukti pengganti. SLA 4 jam mulai saat pengajuan masuk.',
      submitted:'Pengajuan masuk. Admin Cilandak cek bukti, lalu teruskan ke Kepala Administrasi.',
      verified:'Admin sudah cek. Kepala Administrasi memutuskan dengan syarat: alamat asli sebelum DO.',
      approved:'Disetujui dengan syarat. Document gate lolos bersyarat. Pelunasan cash tetap wajib sebelum delivery.',
      returned:'Dikembalikan untuk revisi. Lengkapi sesuai komentar Kepala Administrasi, lalu kirim ulang.',
      rejected:'Ditolak. Ikuti kelengkapan dokumen standar. Bukan waiver pelunasan.'
    };
    var tags={draft:'Menunggu pengajuan',submitted:'Menunggu Admin',verified:'Siap diputuskan',approved:'Disetujui bersyarat',returned:'Revisi',rejected:'Ditolak'};
    if(currentRole==='mgmt' && (st==='draft'||st==='submitted')) tags[st]='Siap diputuskan';
    var specs={
      draft:'Waivable · Frontman ajukan → Admin cek → Kepala Administrasi',
      submitted:'Waivable · Admin sedang cek bukti',
      verified:'Waivable · Kepala Administrasi memutuskan',
      approved:'Syarat: alamat asli sebelum DO · pelunasan tetap wajib',
      returned:'Revisi: lengkapi bukti, kirim ulang',
      rejected:'Ditolak · lengkapi dokumen standar'
    };
    var note=document.querySelector('[data-exc-note]');
    if(note){
      note.textContent=notes[st]||notes.draft;
      note.classList.toggle('warn', st!=='approved');
      note.classList.toggle('ok', st==='approved');
    }
    var order=['draft','submitted','verified','approved'];
    var idx=order.indexOf((st==='returned'||st==='rejected')?'draft':st);
    document.querySelectorAll('[data-exc-path] [data-step]').forEach(function(el){
      var step=el.getAttribute('data-step');
      var si=order.indexOf(step);
      el.classList.remove('on','ok');
      if(st==='approved' && si<=3) el.classList.add('ok');
      else if(si<idx) el.classList.add('ok');
      else if(si===idx) el.classList.add('on');
    });
    document.querySelectorAll('[data-exc-alamat-tag]').forEach(function(el){
      el.textContent=tags[st]||tags.draft;
      el.className='tag '+(st==='approved'?'ok':(st==='returned'||st==='rejected')?'stop':'hold');
    });
    document.querySelectorAll('[data-exc-alamat-spec]').forEach(function(el){ el.textContent=specs[st]||specs.draft; });
    var vault=document.getElementById('docAlamat');
    if(vault){
      var tag=vault.querySelector('.tag');
      var reuse=vault.querySelector('.reuse');
      var btn=vault.querySelector('[data-go="exc_alamat"]');
      if(st==='approved'){
        vault.classList.remove('miss');
        if(tag){ tag.className='tag ok'; tag.textContent='Lolos bersyarat'; }
        if(reuse) reuse.textContent='Syarat: alamat asli sebelum DO';
        if(btn) btn.textContent='Lihat keputusan';
      } else {
        vault.classList.add('miss');
        if(tag){ tag.className='tag hold'; tag.textContent='Perlu pembaruan'; }
        if(reuse) reuse.textContent='Waivable · Frontman';
        if(btn) btn.textContent='Ajukan exception';
      }
    }
    document.querySelectorAll('[data-exc-doc-gate]').forEach(function(li){
      var mark=li.querySelector('.mark');
      var why=li.querySelector('.why');
      var tag=li.querySelector('.tag');
      if(st==='approved'){
        if(mark){ mark.className='mark ok'; mark.textContent='✓'; }
        if(why) why.textContent='Exception disetujui · alamat asli sebelum DO';
        if(tag){ tag.className='tag ok'; tag.textContent='Bersyarat'; }
      } else {
        if(mark){ mark.className='mark no'; mark.textContent='!'; }
        if(why) why.textContent='5 dari 6 valid · bukti alamat kedaluwarsa · waivable';
        if(tag){ tag.className='tag hold'; tag.textContent='Exception'; }
      }
    });
    document.querySelectorAll('[data-exc-pill]').forEach(function(el){ el.textContent=(st==='approved'||st==='rejected')?'0':'1'; });
    renderMgmtLog('alamat');
  }
  function setExcAlamat(next, msg){
    if(window.FAST && FAST.save) FAST.save({excAlamat:next});
    applyExcAlamat();
    toast(msg);
  }
  document.querySelectorAll('[data-exc-submit]').forEach(function(b){
    b.addEventListener('click',function(){
      setExcAlamat('submitted','Pengajuan terkirim. Admin Cilandak akan cek bukti.');
    });
  });
  document.querySelectorAll('[data-exc-verify]').forEach(function(b){
    b.addEventListener('click',function(){
      if(excAlamatState()==='draft' || excAlamatState()==='returned'){
        toast('Frontman belum mengajukan. Minta pengajuan dulu.');
        return;
      }
      setExcAlamat('verified','Bukti dicek. Siap diputuskan Kepala Administrasi.');
    });
  });
  document.querySelectorAll('[data-exc-approve]').forEach(function(b){
    b.addEventListener('click',function(){
      var st=excAlamatState();
      if(st==='draft'||st==='returned'){
        toast('Belum ada pengajuan. Approval Engine tidak melewati pelunasan.');
        return;
      }
      setExcAlamat('approved','Disetujui dengan syarat. Document gate lolos. Delivery cash tetap menunggu lunas.');
    });
  });
  document.querySelectorAll('[data-exc-reject]').forEach(function(b){
    b.addEventListener('click',function(){
      setExcAlamat('returned','Dikembalikan ke Frontman. Lengkapi bukti alamat.');
    });
  });

  function escapeHtml(s){
    return String(s||'').replace(/[&<>"]/g,function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]); });
  }
  function fmtWhen(ts){
    try { return new Date(ts).toLocaleString('id-ID',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}); }
    catch(e){ return ''; }
  }
  function mgmtLogs(caseId){
    if(caseId==='alamat') return ((FAST.load()||{}).excLog)||[];
    if(caseId==='stnk') return ((FAST.load(FAST.STNK_KEY)||{}).stnkLog)||[];
    var s=afiData();
    if(caseId==='early'||(caseId==='afi'&&afiExcKind!=='nobill')) return s.logEarly||[];
    return s.logNobill||[];
  }
  function renderMgmtLog(caseId){
    var key=caseId==='afi'?(afiExcKind==='nobill'?'nobill':'early'):caseId;
    var ul=document.querySelector('[data-mgmt-log="'+(caseId==='early'||caseId==='nobill'?'afi':caseId)+'"]');
    if(caseId==='afi') ul=document.querySelector('[data-mgmt-log="afi"]');
    if(!ul) return;
    ul.innerHTML='';
    mgmtLogs(key).slice().reverse().forEach(function(it){
      var li=document.createElement('li');
      li.innerHTML='<i class="own p">K</i><div><b>'+escapeHtml(it.label)+'</b>'+(it.comment?': '+escapeHtml(it.comment):'')+'<time>'+fmtWhen(it.ts)+' · '+(it.by||'Kepala Cabang')+'</time></div>';
      ul.appendChild(li);
    });
  }
  function stnkState(){
    var s=window.FAST && FAST.load ? FAST.load(FAST.STNK_KEY) : null;
    return (s && s.stnk) || 'open';
  }
  function applyStnk(){
    var st=stnkState();
    var tags={open:'Menunggu Kepala Cabang',returned:'Revisi',approved:'Tindak lanjut dicatat',rejected:'Waiver ditolak'};
    var note=document.querySelector('#exc_stnk .exc-note');
    var notes={
      open:'Aging ≥15 hari naik sendiri. Setujui tindak lanjut biro jasa. Bukan tombol melewati pelunasan — unit ini sudah lunas.',
      returned:'Revisi: lengkapi update biro jasa sesuai komentar, lalu ajukan putusan lagi.',
      approved:'Tindak lanjut biro jasa dicatat. STNK tetap dipantau. Bukan waiver.',
      rejected:'Waiver ditolak. Tidak ada pengecualian pelunasan (sudah lunas). Pantau terbit STNK secara operasional.'
    };
    if(note){
      note.textContent=notes[st]||notes.open;
      note.classList.toggle('warn', st!=='approved');
      note.classList.toggle('ok', st==='approved');
    }
    document.querySelectorAll('[data-stnk-tag]').forEach(function(el){
      el.textContent=tags[st]||tags.open;
      el.className='tag '+(st==='approved'?'ok':(st==='returned'||st==='rejected')?'stop':'hold');
    });
    renderMgmtLog('stnk');
  }
  function mgmtCaseState(caseId){
    if(caseId==='alamat') return excAlamatState();
    if(caseId==='early') return afiExcSt('early');
    if(caseId==='nobill') return afiExcSt('nobill');
    if(caseId==='stnk'){
      var st=stnkState();
      return st==='open'?'verified':st;
    }
    return 'open';
  }
  function mgmtBucket(st){
    if(st==='returned') return 'revise';
    if(st==='approved'||st==='rejected') return 'done';
    return 'open';
  }
  function applyMgmtInbox(){
    var nOpen=0,nRev=0,nDone=0;
    document.querySelectorAll('#mgmtList .order-card').forEach(function(card){
      var id=card.getAttribute('data-mgmt-case');
      var st=mgmtCaseState(id);
      var bucket=mgmtBucket(st);
      card.setAttribute('data-mgmt-bucket', bucket);
      var owner=card.getAttribute('data-mgmt-owner')||'ka';
      if(mgmtSeat!=='abh' && owner!==mgmtSeat) return;
      if(bucket==='open') nOpen++;
      if(bucket==='revise') nRev++;
      if(bucket==='done') nDone++;
    });
    var line=document.querySelector('[data-mgmt-count]');
    if(line) line.innerHTML='<b>'+nOpen+' menunggu</b> · '+nRev+' revisi · '+nDone+' selesai';
    document.querySelectorAll('[data-mgmt-pill]').forEach(function(el){ el.textContent=String(nOpen+nRev); });
    filterMgmtInbox();
    renderMgmtLog('alamat');
    renderMgmtLog('afi');
    renderMgmtLog('stnk');
  }
  var mgmtFilter='all';
  function filterMgmtInbox(){
    document.querySelectorAll('#mgmtList .order-card').forEach(function(card){
      var b=card.getAttribute('data-mgmt-bucket')||'open';
      var owner=card.getAttribute('data-mgmt-owner')||'ka';
      var seatOk=mgmtSeat==='abh'||owner===mgmtSeat;
      var match=(mgmtFilter==='all'||b===mgmtFilter)&&seatOk;
      card.classList.toggle('is-hidden', !match);
    });
  }
  document.addEventListener('click',function(e){
    var payF=e.target.closest('[data-admin-pay-filter]');
    if(payF){
      adminPayFilter=payF.getAttribute('data-admin-pay-filter');
      document.querySelectorAll('[data-admin-pay-filter]').forEach(function(x){
        x.setAttribute('aria-pressed', x===payF?'true':'false');
      });
      if(currentBookKey!=='pay') activateAdminBook('pay');
      else filterAdminBook();
      return;
    }
    var f=e.target.closest('[data-mgmt-filter]');
    var seatBtn=e.target.closest('[data-mgmt-seat]');
    if(seatBtn){
      mgmtSeat=seatBtn.getAttribute('data-mgmt-seat')||'ka';
      applyRole('mgmt');
      syncMgmtSeat();
      show((MGMT_SEATS[mgmtSeat]||MGMT_SEATS.ka).home);
      applyMgmtInbox();
      toast('Kursi: '+(MGMT_SEATS[mgmtSeat]||MGMT_SEATS.ka).label);
      return;
    }
    if(f){
      mgmtFilter=f.getAttribute('data-mgmt-filter');
      document.querySelectorAll('[data-mgmt-filter]').forEach(function(x){
        x.setAttribute('aria-pressed', x===f?'true':'false');
      });
      show('mgmt_inbox');
      filterMgmtInbox();
      return;
    }
    var b=e.target.closest('[data-mgmt-act]');
    if(!b) return;
    decideMgmt(b.getAttribute('data-mgmt-case'), b.getAttribute('data-mgmt-act'));
  });
  function decideMgmt(caseId, act){
    var boxId=caseId==='afi'||caseId==='early'||caseId==='nobill'?'afi':caseId;
    var el=document.getElementById('mgmtComment-'+boxId);
    var comment=((el&&el.value)||'').trim();
    if((act==='revise'||act==='reject') && !comment){
      toast('Isi komentar untuk '+(act==='revise'?'revisi':'penolakan')+'.');
      if(el) el.focus();
      return;
    }
    var need=caseId==='stnk'?'kc':(String(caseId).indexOf('ops-')===0?'om':'ka');
    if(mgmtSeat!==need){
      toast('Putusan ini untuk '+(MGMT_SEATS[need]||{}).label+'. Ganti kursi Management.');
      return;
    }
    var labels={approve:'Setujui',revise:'Revisi',reject:'Tolak'};
    var next=act==='approve'?'approved':act==='revise'?'returned':'rejected';
    var entry={act:act,label:labels[act]||act,comment:comment,by:(MGMT_SEATS[mgmtSeat]||MGMT_SEATS.ka).label,ts:Date.now()};
    if(caseId==='alamat'){
      var log=((FAST.load()||{}).excLog)||[];
      log.push(entry);
      FAST.save({excAlamat:next,excLog:log});
      applyExcAlamat();
      toast(act==='approve'?'Disetujui dengan syarat. Pelunasan tetap wajib.':act==='revise'?'Diminta revisi. Frontman lengkapi sesuai komentar.':'Ditolak. Ikuti dokumen standar.');
    } else if(caseId==='stnk'){
      var slog=((FAST.load(FAST.STNK_KEY)||{}).stnkLog)||[];
      slog.push(entry);
      FAST.save({stnk:next==='approved'?'approved':next,stnkLog:slog}, FAST.STNK_KEY);
      applyStnk();
      toast(act==='approve'?'Tindak lanjut biro jasa dicatat. Bukan waiver.':act==='revise'?'Revisi: minta update Admin/biro jasa.':'Waiver ditolak. STNK tetap dipantau operasional.');
    } else {
      var kind=caseId==='nobill'||(caseId==='afi'&&afiExcKind==='nobill')?'nobill':'early';
      setAfiExcView(kind);
      var patch=kind==='nobill'?{excNobill:next,logNobill:(afiData().logNobill||[]).concat([entry])}:{excEarly:next,logEarly:(afiData().logEarly||[]).concat([entry])};
      saveAfi(patch);
      applyAfiExcPath();
      toast(act==='approve'?(kind==='nobill'?'Disetujui: billing tanpa AFI. 30% tidak di-waive.':'Disetujui: AFI sebelum billing. 30% tidak di-waive.'):act==='revise'?'Revisi pecah urutan. Lengkapi alasan.':'Ditolak. Pakai jalur billing + AFI bersama.');
    }
    if(el) el.value='';
    applyMgmtInbox();
  }

  var edcDevice='EDC-01';
  function showBfPanel(mode){
    document.querySelectorAll('#bfSeg [data-bf]').forEach(function(b){
      b.setAttribute('aria-pressed', b.getAttribute('data-bf')===mode?'true':'false');
    });
    document.querySelectorAll('[data-bf-panel]').forEach(function(p){
      p.classList.toggle('on', p.getAttribute('data-bf-panel')===mode);
    });
  }
  function showCashPanel(mode){
    if(currentRole==='cust' && mode==='edc') mode='qris';
    document.querySelectorAll('#cashSeg [data-cash]').forEach(function(b){
      b.setAttribute('aria-pressed', b.getAttribute('data-cash')===mode?'true':'false');
    });
    document.querySelectorAll('[data-cash-panel]').forEach(function(p){
      p.classList.toggle('on', p.getAttribute('data-cash-panel')===mode);
    });
  }
  function applyCashlessEdc(){
    var cust=currentRole==='cust';
    document.querySelectorAll('#cashless [data-cash="edc"], #cashless [data-cash-panel="edc"]').forEach(function(el){
      el.hidden=cust;
    });
    var note=document.querySelector('[data-cash-cust-note]');
    if(note) note.hidden=!cust;
    var title=document.querySelector('[data-cash-title]');
    if(title) title.textContent=cust
      ? 'Bayar di cabang: QRIS atau CDM'
      : (currentRole==='admin' ? 'Lihat pembayaran transaksi yang sama' : 'Terima di cabang atau kirim tautan');
    if(cust){
      var edcOn=document.querySelector('#cashSeg [data-cash="edc"][aria-pressed="true"]');
      if(edcOn) showCashPanel('qris');
    }
  }
  document.querySelectorAll('#bfSeg [data-bf]').forEach(function(b){
    b.addEventListener('click',function(){ showBfPanel(b.getAttribute('data-bf')); });
  });
  document.querySelectorAll('#cashSeg [data-cash]').forEach(function(b){
    b.addEventListener('click',function(){ showCashPanel(b.getAttribute('data-cash')); });
  });
  document.querySelectorAll('[data-edc-device]').forEach(function(b){
    b.addEventListener('click',function(){
      edcDevice=b.getAttribute('data-edc-device');
      var list=b.parentElement;
      list.querySelectorAll('[data-edc-device]').forEach(function(x){
        x.setAttribute('aria-pressed', x===b?'true':'false');
      });
      var panel=b.closest('[data-bf-panel], [data-cash-panel]');
      var hint=panel?panel.querySelector('.edc-hint'):null;
      var name=b.querySelector('b');
      if(hint) hint.textContent='Siap dorong ke '+(name?name.textContent:edcDevice);
    });
  });
  function draftData(){
    var d=window.FAST && FAST.load ? FAST.load(FAST.DRAFT_KEY) : null;
    return Object.assign({
      step:'pemesan', saved:false, sameStnk:false, cash:true,
      fields:{}, docs:{}
    }, d||{});
  }
  function draftSaved(){ return !!(draftData().saved); }
  function requiredDocs(d){
    var list=['ktp','kk','npwp','alamat'];
    if(!d.sameStnk) list.push('ktpStnk','alamatStnk','pernyataan');
    return list;
  }
  function docsReady(d){
    return requiredDocs(d).every(function(k){ return !!(d.docs&&d.docs[k]); });
  }
  function fieldsReady(group, d){
    var f=d.fields||{};
    if(group==='pemesan') return !!(f.nama&&f.nik&&f.hp&&f.alamat);
    if(group==='stnk') return !!(f.stnkNama&&f.stnkKota&&f.stnkAlamat);
    if(group==='unit') return !!(f.tipe&&f.warna);
    return false;
  }
  function poFromKota(kota){
    var k=(kota||'').toLowerCase();
    if(/depok/.test(k)) return {prov:'Jawa Barat',po:'Depok · PO-DPK',otr:'Rp 296.800.000',bf:'Rp 3.000.000 · master Yaris'};
    if(/jakarta/.test(k)) return {prov:'DKI Jakarta',po:'Jakarta Selatan · PO-JKT',otr:'Rp 302.400.000',bf:'Rp 3.000.000 · master Yaris'};
    if(kota) return {prov:'—',po:'Dari kota STNK',otr:'Mengikuti area PO',bf:'Dari master unit'};
    return {prov:'—',po:'—',otr:'Menunggu kota STNK',bf:'Dari master unit, setelah SPK'};
  }
  function applySpkDraft(){
    var d=draftData();
    var pem=fieldsReady('pemesan',d), st=fieldsReady('stnk',d), un=fieldsReady('unit',d), doc=docsReady(d);
    var nReq=requiredDocs(d).length;
    var nOk=requiredDocs(d).filter(function(k){ return d.docs&&d.docs[k]; }).length;
    var el;
    el=document.querySelector('[data-draft-pemesan]'); if(el) el.textContent=pem?'Lengkap':'Kosong';
    el=document.querySelector('[data-draft-stnk]'); if(el) el.textContent=st?'Lengkap':'Kosong';
    el=document.querySelector('[data-draft-unit]'); if(el) el.textContent=un?'Lengkap':'Kosong';
    el=document.querySelector('[data-draft-docs]'); if(el) el.textContent=nOk+' / '+nReq;
    var docCard=document.querySelector('[data-draft-docs-card]');
    if(docCard) docCard.classList.toggle('alert', !doc);
    document.querySelectorAll('#spk_baru .worktabs [data-spk-step]').forEach(function(b){
      b.setAttribute('aria-current', b.getAttribute('data-spk-step')===(d.step||'pemesan')?'true':'false');
    });
    document.querySelectorAll('[data-spk-panel]').forEach(function(p){
      p.hidden = p.getAttribute('data-spk-panel')!==(d.step||'pemesan');
    });
    document.querySelectorAll('#spk_baru [data-draft-f]').forEach(function(inp){
      var k=inp.getAttribute('data-draft-f');
      if(document.activeElement!==inp) inp.value=(d.fields&&d.fields[k])||'';
    });
    document.querySelectorAll('[data-spk-same]').forEach(function(b){
      var same=!!d.sameStnk;
      b.setAttribute('aria-pressed', (b.getAttribute('data-spk-same')==='1')===same?'true':'false');
    });
    document.querySelectorAll('[data-spk-pay]').forEach(function(b){
      var cash=d.cash!==false;
      b.setAttribute('aria-pressed', (b.getAttribute('data-spk-pay')==='cash')===cash?'true':'false');
    });
    var payHint=document.querySelector('[data-spk-pay-hint]');
    if(payHint) payHint.textContent=d.cash!==false
      ? 'Tunai: billing ≥30% dan delivery lunas, keduanya non-waivable. Belum ditagih di langkah ini.'
      : 'Leasing: DP wajib muncul di struktur harga SO dari B2B (read-only). Billing setelah full DP, delivery setelah TTD. Bukan diketik di SPK.';
    var sameHint=document.querySelector('[data-spk-same-hint]');
    if(sameHint) sameHint.textContent=d.sameStnk
      ? 'Nama STNK = pemesan. KTP/KK/alamat pemesan dipakai ulang. Pernyataan nama tidak wajib.'
      : 'Nama STNK berbeda: unggah KTP atas nama STNK, bukti alamat STNK, dan pernyataan di langkah 4.';
    var po=poFromKota((d.fields||{}).stnkKota);
    var poMap={prov:po.prov,po:po.po,otr:po.otr,bf:po.bf};
    Object.keys(poMap).forEach(function(k){
      document.querySelectorAll('[data-draft-po="'+k+'"]').forEach(function(inp){ inp.value=poMap[k]; });
    });
    document.querySelectorAll('[data-spk-doc]').forEach(function(box){
      var key=box.getAttribute('data-spk-doc');
      var on=!!(d.docs&&d.docs[key]);
      var need=requiredDocs(d).indexOf(key)>-1;
      box.classList.toggle('miss', !on);
      var tag=box.querySelector('.tag');
      var meta=box.querySelector('.meta');
      if(on){
        if(tag){ tag.className='tag ok'; tag.textContent='Valid'; }
        if(meta) meta.textContent='Di vault SPK · siap dipakai AFI';
      } else {
        if(tag){ tag.className=need?'tag stop':'tag mute'; tag.textContent=need?'Belum':'Opsional'; }
      }
      if(key==='pernyataan' || key==='ktpStnk' || key==='alamatStnk') box.hidden=!!d.sameStnk;
    });
    var save=document.querySelector('[data-spk-save]');
    var ready=pem&&st&&un&&doc;
    if(save) save.disabled=!ready;
    var hint=document.querySelector('[data-spk-save-hint]');
    if(hint){
      if(ready) hint.innerHTML='Siap disimpan. Sistem memberi nomor SPK. Booking fee ditagih <b>setelah</b> ini.';
      else hint.textContent='Masih kurang: '+(pem?'':'pemesan ')+(st?'':'STNK ')+(un?'':'unit ')+(doc?'':'dokumen')+'. Surat kuasa dan BSTKB bukan di sini.';
    }
    var paid=!!(window.FAST && FAST.load && FAST.load(FAST.BF_KEY) && FAST.load(FAST.BF_KEY).paid);
    document.querySelectorAll('[data-dewi-card]').forEach(function(card){
      card.setAttribute('data-go', paid?'so':(d.saved?'spk':'spk_baru'));
    });
    if(!paid){
      document.querySelectorAll('[data-dewi-oid]').forEach(function(oid){ oid.textContent=d.saved?'SPK/26/CLD/00426 · baru tersimpan':'Draft · belum nomor SPK'; });
      document.querySelectorAll('[data-dewi-spec]').forEach(function(spec){ spec.textContent=d.saved?'Tindakan: quotation → booking · Yaris & Agya tetap di SPK ini':'Tindakan: isi pemesan, STNK, unit, lalu unggah dokumen · Yaris + Agya di SPK yang sama'; });
      document.querySelectorAll('[data-dewi-tag]').forEach(function(tag){ tag.textContent=d.saved?'Belum bayar':'Isi dari awal'; tag.className='tag wait'; });
      document.querySelectorAll('[data-dewi-amt]').forEach(function(amt){ amt.textContent=d.saved?'OTR Depok':'Belum OTR'; });
      document.querySelectorAll('[data-dewi-cta]').forEach(function(cta){ cta.textContent=d.saved?'Data pemesan · STNK · unit →':'Input & unggah →'; });
    }
    if(window.FAST && FAST.renderLineage) FAST.renderLineage({payJob:payJobId, screen:(document.querySelector('.screen.on')||{}).id});
  }
  function saveDraft(patch){
    if(window.FAST && FAST.save) FAST.save(patch, FAST.DRAFT_KEY);
    applySpkDraft();
  }
  function applyBooking(){
    var s=window.FAST && FAST.load ? FAST.load(FAST.BF_KEY) : null;
    var paid=!!(s && s.paid);
    document.querySelectorAll('[data-bf-hide-paid]').forEach(function(el){ el.hidden=paid; });
    document.querySelectorAll('[data-bf-show-paid]').forEach(function(el){ el.hidden=!paid; });
    var block=document.querySelector('[data-so-block]');
    var ready=document.querySelector('[data-so-ready]');
    if(block) block.hidden=paid;
    if(ready) ready.hidden=!paid;
    document.querySelectorAll('[data-dewi-card]').forEach(function(card){ card.setAttribute('data-go', paid?'so':'spk'); });
    document.querySelectorAll('[data-dewi-oid]').forEach(function(oid){ oid.textContent=paid?'SO 4500091426 · dari SPK/26/CLD/00426':'SPK/26/CLD/00426 · baru tersimpan'; });
    document.querySelectorAll('[data-dewi-spec]').forEach(function(spec){ spec.textContent=paid?'Tindakan: SO Yaris → AFI → DO → billing · Agya di quotation yang sama':'Tindakan: quotation → booking cashless · Yaris & Agya di SPK ini'; });
    document.querySelectorAll('[data-dewi-tag]').forEach(function(tag){ tag.textContent=paid?'SO terbuka':'Belum bayar'; tag.className='tag '+(paid?'ok':'wait'); });
    document.querySelectorAll('[data-dewi-amt]').forEach(function(amt){ amt.textContent=paid?'AR Rp 299,15 Jt':'OTR Depok'; });
    document.querySelectorAll('[data-dewi-cta]').forEach(function(cta){ cta.textContent=paid?'Sales Order →':'Data pemesan · STNK · unit →'; });
    applyDewiProc();
    applySpkDraft();
  }
  document.querySelectorAll('[data-spk-step]').forEach(function(b){
    b.addEventListener('click',function(){ saveDraft({step:b.getAttribute('data-spk-step')}); });
  });
  document.querySelectorAll('[data-spk-fill]').forEach(function(b){
    b.addEventListener('click',function(){
      var kind=b.getAttribute('data-spk-fill');
      var d=draftData();
      var fields=Object.assign({}, d.fields||{});
      if(kind==='pemesan'){
        Object.assign(fields,{nama:'Dewi Lestari',nik:'3276••••••••0012',hp:'0812••••8831',email:'dewi.lestari@mail.test',alamat:'Jl. Cipete Raya No. 88, Kel. Cipete Selatan, Kec. Cilandak, Kota Jakarta Selatan 12410'});
        saveDraft({fields:fields,step:'stnk'});
        toast('Pemesan tersimpan di SPK. Lanjut nama dan alamat STNK.');
      } else if(kind==='stnk'){
        if(d.sameStnk){
          Object.assign(fields,{stnkNama:fields.nama||'Dewi Lestari',stnkKota:'Kota Jakarta Selatan',stnkAlamat:fields.alamat||'Jl. Cipete Raya No. 88, Jakarta Selatan'});
        } else {
          Object.assign(fields,{stnkNama:'Andi Pratama',stnkKota:'Kota Depok',stnkAlamat:'Jl. Raya Sawangan No. 17, Kel. Mampang, Kec. Pancoran Mas'});
        }
        saveDraft({fields:fields,step:'unit'});
        toast('Kota STNK mengisi area PO. OTR mengikuti area itu.');
      } else if(kind==='unit'){
        Object.assign(fields,{tipe:'Yaris 1.5 G CVT',warna:'Putih Metalik',tipe2:'Agya 1.2 G CVT · Hitam',aksesoris:'Kaca film full + karpet premium'});
        saveDraft({fields:fields,cash:true,step:'docs'});
        toast('Unit dari master. Booking fee belum ditagih.');
      }
    });
  });
  document.querySelectorAll('[data-spk-same]').forEach(function(b){
    b.addEventListener('click',function(){
      var same=b.getAttribute('data-spk-same')==='1';
      var patch={sameStnk:same};
      if(same){
        var f=Object.assign({}, draftData().fields||{});
        if(f.nama) f.stnkNama=f.nama;
        if(f.alamat) f.stnkAlamat=f.alamat;
        patch.fields=f;
      }
      saveDraft(patch);
    });
  });
  document.querySelectorAll('[data-spk-pay]').forEach(function(b){
    b.addEventListener('click',function(){
      saveDraft({cash:b.getAttribute('data-spk-pay')==='cash'});
    });
  });
  document.querySelectorAll('[data-spk-up]').forEach(function(b){
    b.addEventListener('click',function(){
      var key=b.getAttribute('data-spk-up');
      var docs=Object.assign({}, draftData().docs||{});
      docs[key]=true;
      if(key==='kkStnk') toast('KK pemesan dipakai ulang dari vault.');
      else toast('Dokumen masuk vault. Administrasi verifikasi, bukan unggah ulang.');
      saveDraft({docs:docs});
    });
  });
  document.querySelectorAll('[data-spk-save]').forEach(function(b){
    b.addEventListener('click',function(){
      var d=draftData();
      if(!(fieldsReady('pemesan',d)&&fieldsReady('stnk',d)&&fieldsReady('unit',d)&&docsReady(d))){
        toast('Lengkapi input dan unggah wajib dulu.');
        return;
      }
      saveDraft({saved:true,step:'docs'});
      toast('SPK/26/CLD/00426 tersimpan. Booking fee menyusul. Bukan ketik ulang di SO.');
      show('spk');
    });
  });
  document.querySelectorAll('[data-spk-reset]').forEach(function(b){
    b.addEventListener('click',function(){
      if(window.FAST && FAST.save){
        localStorage.removeItem(FAST.DRAFT_KEY);
      }
      applySpkDraft();
      toast('Draft dikosongkan. Isi dari awal lagi.');
    });
  });
  document.querySelectorAll('#spk_baru [data-draft-f]').forEach(function(inp){
    function persist(){
      var fields=Object.assign({}, draftData().fields||{});
      fields[inp.getAttribute('data-draft-f')]=inp.value.trim();
      saveDraft({fields:fields});
    }
    inp.addEventListener('change', persist);
    inp.addEventListener('blur', persist);
  });
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
    if(billDo) billDo.textContent=q.dof?'Terbit':'Menunggu';
    var stnkAfi=document.querySelector('[data-stnk-afi]');
    if(stnkAfi){
      stnkAfi.classList.toggle('done', !!q.afi);
      var t=stnkAfi.querySelector('.t');
      if(t) t.textContent=q.afi?'Pengajuan terkirim':'Menunggu SO / pengajuan';
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
  var afiKind='none';
  var afiExcKind='early';
  var afiKindLabel={none:'Standar · tanpa pilih nomor',pilih:'Pilih nomor',ganjil:'Plat ganjil',genap:'Plat genap'};
  function afiKindText(s){
    var labels={none:'Standar · tanpa pilih nomor',pilih:'Pilih nomor',ganjil:'Plat ganjil',genap:'Plat genap'};
    var k=(s&&s.kind)||'none';
    var label=labels[k]||labels.none;
    if(k==='pilih' && s && s.plate) label='Pilih nomor · '+s.plate;
    return label;
  }
  function afiData(){ return (window.FAST && FAST.load ? FAST.load(FAST.AFI_KEY) : null) || {}; }
  function afiExcSt(kind){
    var s=afiData();
    return (kind==='nobill' ? s.excNobill : s.excEarly) || 'draft';
  }
  function setAfiExcView(kind){
    afiExcKind=kind==='nobill'?'nobill':'early';
    document.querySelectorAll('#exc_afi [data-afi-exc]').forEach(function(b){
      b.classList.toggle('on', b.getAttribute('data-afi-exc')===afiExcKind);
    });
    document.querySelectorAll('[data-afi-exc-panel]').forEach(function(p){
      p.hidden = p.getAttribute('data-afi-exc-panel')!==afiExcKind;
    });
    var title=document.querySelector('[data-afi-exc-title]');
    var lead=document.querySelector('[data-afi-exc-lead]');
    var reason=document.getElementById('excAfiReason');
    if(title) title.textContent=afiExcKind==='nobill'?'Billing tanpa AFI':'AFI sebelum billing';
    if(lead) lead.textContent=afiExcKind==='nobill'
      ?'Budi Santoso · SPK/26/CLD/00418. Billing tanpa AFI. Data STNK tetap lengkap di SPK. Bukan waiver 30%.'
      :'Budi Santoso · SPK/26/CLD/00418. AFI dulu, billing menyusul. Data STNK dari SPK. Bukan waiver 30%.';
    if(reason && !reason.dataset.locked){
      reason.value=afiExcKind==='nobill'
        ?'Billing perlu terbit minggu ini untuk closing cabang. AFI menyusul. Nama dan alamat STNK sudah lengkap di SPK. Bukan melewati 30%.'
        :'Unit perlu proses STNK lebih dulu karena jadwal Samsat cabang. Billing tetap diajukan minggu ini. Bukan melewati 30%.';
    }
    applyAfiExcPath();
  }
  function applyAfiExcPath(){
    var st=afiExcSt(afiExcKind);
    var notes={
      draft:'Belum diajukan. Jelaskan kenapa urutan billing dan AFI harus dipecah.',
      submitted:'Pengajuan masuk. Admin Cilandak cek alasan, lalu teruskan ke Kepala Administrasi.',
      verified:'Admin sudah cek. Kepala Administrasi memutuskan pecah urutan.',
      approved:afiExcKind==='nobill'?'Disetujui. Billing boleh tanpa AFI. AFI tetap wajib menyusul. 30% tidak di-waive.':'Disetujui. AFI boleh sebelum billing. Billing tetap wajib. 30% tidak di-waive.',
      returned:'Revisi: lengkapi alasan sesuai komentar Kepala Cabang.',
      rejected:'Ditolak. Pakai jalur billing + AFI bersama. 30% tidak di-waive.'
    };
    var note=document.querySelector('[data-exc-afi-note]');
    if(note){
      note.textContent=notes[st]||notes.draft;
      note.classList.toggle('warn', st!=='approved');
      note.classList.toggle('ok', st==='approved');
    }
    var order=['draft','submitted','verified','approved'];
    var idx=order.indexOf((st==='returned'||st==='rejected')?'draft':st);
    document.querySelectorAll('[data-exc-afi-path] [data-step]').forEach(function(el){
      var si=order.indexOf(el.getAttribute('data-step'));
      el.classList.remove('on','ok');
      if(st==='approved' && si<=3) el.classList.add('ok');
      else if(si<idx) el.classList.add('ok');
      else if(si===idx) el.classList.add('on');
    });
    var tags={draft:'Menunggu pengajuan',submitted:'Menunggu Admin',verified:'Siap diputuskan',approved:'Disetujui',returned:'Revisi',rejected:'Ditolak'};
    if(currentRole==='mgmt' && (st==='draft'||st==='submitted')) tags[st]='Siap diputuskan';
    var sel=afiExcKind==='nobill'?'[data-afi-nobill-tag]':'[data-afi-early-tag]';
    document.querySelectorAll(sel).forEach(function(el){
      el.textContent=tags[st]||tags.draft;
      el.className='tag '+(st==='approved'?'ok':(st==='returned'||st==='rejected')?'stop':'hold');
    });
    renderMgmtLog('afi');
  }
  function applyAfi(){
    var s=afiData();
    var pair=!!s.pair;
    var afi=!!s.afi;
    var bill=!!s.bill;
    var done=pair||(afi&&bill);
    var early=afiExcSt('early');
    var nobill=afiExcSt('nobill');
    var canAfiOnly=!afi && !pair && (early==='approved' || bill);
    var canBillOnly=!bill && !pair && (nobill==='approved' || afi);
    document.querySelectorAll('[data-afi-open]').forEach(function(el){ el.hidden=done||afi; });
    document.querySelectorAll('[data-afi-sent]').forEach(function(el){ el.hidden=!done && !afi && !bill; });
    document.querySelectorAll('[data-afi-submit]').forEach(function(el){ el.hidden=!canAfiOnly; });
    document.querySelectorAll('[data-afi-bill]').forEach(function(el){ el.hidden=!canBillOnly; });
    document.querySelectorAll('[data-afi-pair]').forEach(function(el){ el.hidden=done||afi||bill; });
    document.querySelectorAll('[data-afi-admin]').forEach(function(el){ el.hidden=!afi && !pair; });
    document.querySelectorAll('[data-afi-cust-wait]').forEach(function(el){ el.hidden=afi||pair; });
    document.querySelectorAll('[data-afi-cust-sent]').forEach(function(el){ el.hidden=!(afi||pair); });
    var spec='Tindakan: ajukan billing + AFI bersama · data STNK dari SPK';
    var tag='Berpasangan';
    var tagCls='wait';
    var status='Berpasangan';
    var sentCopy='Billing dan AFI masuk berpasangan. Proses terbit STNK menyusul.';
    var billSrc='Diajukan bersama AFI';
    var billRule='Bersama AFI · data STNK SPK lengkap · ≥30%';
    var money='62,7% terbayar · data STNK lengkap di SPK · ajukan billing + AFI bersama';
    var hint='Belum ada exception. Pakai jalur berpasangan.';
    if(done||(afi&&bill)||pair){
      spec='Billing + AFI sudah diajukan';
      tag='Selesai'; tagCls='ok'; status='Masuk';
      billSrc='Billing diajukan · AFI memakai data SPK';
      billRule='AFI & billing masuk · ≥30% terpenuhi';
      money='Billing dan AFI sudah diajukan · delivery menunggu lunas';
    } else if(afi && !bill){
      spec='AFI masuk (exception) · billing menyusul';
      tag='AFI dulu'; tagCls='wait'; status='AFI dulu';
      sentCopy='AFI diajukan lebih dulu (exception). Billing belum.';
      billSrc='AFI masuk · billing belum';
      money='AFI sudah (exception) · billing masih menunggu';
    } else if(bill && !afi){
      spec='Billing masuk (exception) · AFI menyusul';
      tag='Billing dulu'; tagCls='wait'; status='Billing dulu';
      sentCopy='Billing diajukan tanpa AFI (exception). AFI belum.';
      billSrc='Billing diajukan · AFI belum';
      money='Billing sudah (exception) · AFI masih menunggu';
    }
    if(canAfiOnly) hint=bill?'Billing sudah (exception). Lanjutkan AFI.':'Exception AFI dulu disetujui. Tombol AFI saja terbuka.';
    if(canBillOnly) hint=afi?'AFI sudah (exception). Lanjutkan billing.':'Exception billing tanpa AFI disetujui. Tombol billing saja terbuka.';
    if(early==='submitted'||early==='verified') hint='Exception AFI dulu sedang diputuskan.';
    if(nobill==='submitted'||nobill==='verified') hint='Exception billing tanpa AFI sedang diputuskan.';
    document.querySelectorAll('[data-afi-spec]').forEach(function(el){ el.textContent=spec; });
    document.querySelectorAll('[data-afi-tag]').forEach(function(el){ el.textContent=tag; el.className='tag '+tagCls; });
    document.querySelectorAll('[data-afi-status]').forEach(function(el){ el.textContent=status; });
    document.querySelectorAll('[data-afi-sent-copy]').forEach(function(el){ el.textContent=sentCopy; });
    document.querySelectorAll('[data-afi-billing-src]').forEach(function(el){ el.textContent=billSrc; });
    document.querySelectorAll('[data-afi-bill-rule]').forEach(function(el){ el.textContent=billRule; });
    document.querySelectorAll('[data-afi-money-hint]').forEach(function(el){ el.textContent=money; });
    document.querySelectorAll('[data-afi-exc-hint]').forEach(function(el){ el.textContent=hint; });
    document.querySelectorAll('[data-afi-kind-out]').forEach(function(el){ el.textContent=afiKindText(s); });
    document.querySelectorAll('[data-afi-pair-gate]').forEach(function(li){
      var mark=li.querySelector('.mark');
      var why=li.querySelector('.why');
      var tg=li.querySelector('.tag');
      if(done||pair){
        if(mark){ mark.className='mark ok'; mark.textContent='✓'; }
        if(why) why.textContent='Billing dan AFI diajukan berpasangan · data STNK dari SPK';
        if(tg){ tg.textContent='Masuk'; tg.className='tag ok'; }
      } else if(afi && !bill){
        if(mark){ mark.className='mark ok'; mark.textContent='✓'; }
        if(why) why.textContent='Exception: AFI sebelum billing · billing menyusul';
        if(tg){ tg.textContent='AFI dulu'; tg.className='tag wait'; }
      } else if(bill && !afi){
        if(mark){ mark.className='mark ok'; mark.textContent='✓'; }
        if(why) why.textContent='Exception: billing tanpa AFI · AFI menyusul';
        if(tg){ tg.textContent='Billing dulu'; tg.className='tag wait'; }
      } else {
        if(mark){ mark.className='mark idle'; mark.textContent='•'; }
        if(why) why.textContent='Diajukan berpasangan. AFI dulu atau billing tanpa AFI = Approval Engine';
        if(tg){ tg.textContent='Berpasangan'; tg.className='tag mute'; }
      }
    });
    document.querySelectorAll('[data-afi-step="pair"]').forEach(function(el){
      el.classList.toggle('now', !done);
      el.classList.toggle('done', done);
    });
    var mile=document.querySelector('[data-afi-mile]');
    if(mile){
      mile.classList.toggle('done', afi||pair);
      var m=mile.querySelector('.m');
      if(m) m.textContent=(afi||pair)?'✓':'•';
    }
    document.querySelectorAll('[data-afi-early-tag]').forEach(function(el){
      var st=early;
      el.textContent=st==='approved'?'Disetujui':st==='returned'?'Dikembalikan':st==='draft'?'Menunggu pengajuan':'Dalam proses';
      el.className='tag '+(st==='approved'?'ok':st==='returned'?'stop':'hold');
    });
    document.querySelectorAll('[data-afi-nobill-tag]').forEach(function(el){
      var st=nobill;
      el.textContent=st==='approved'?'Disetujui':st==='returned'?'Dikembalikan':st==='draft'?'Menunggu pengajuan':'Dalam proses';
      el.className='tag '+(st==='approved'?'ok':st==='returned'?'stop':'hold');
    });
    applyAfiExcPath();
  }
  function plateVal(){
    var plateEl=document.getElementById('afiPlate');
    return (plateEl&&plateEl.value||'').trim();
  }
  function setAfiKind(kind){
    afiKind=kind||'none';
    document.querySelectorAll('[data-afi-kind]').forEach(function(b){
      b.classList.toggle('on', b.getAttribute('data-afi-kind')===afiKind);
    });
    var wrap=document.querySelector('[data-afi-plate-wrap]');
    if(wrap) wrap.hidden = afiKind!=='pilih';
    var hint=document.querySelector('[data-afi-kind-hint]');
    if(hint){
      hint.textContent=afiKind==='pilih'?'Tulis nomor yang diminta. Proses alokasi nomor menyusul.'
        :afiKind==='ganjil'?'Meminta plat ganjil. Proses menyusul.'
        :afiKind==='genap'?'Meminta plat genap. Proses menyusul.'
        :'Plat standar. Tidak memilih nomor, ganjil, atau genap.';
    }
  }
  document.querySelectorAll('[data-afi-kind]').forEach(function(b){
    b.addEventListener('click',function(){ setAfiKind(b.getAttribute('data-afi-kind')); });
  });
  document.querySelectorAll('#exc_afi [data-afi-exc]').forEach(function(b){
    b.addEventListener('click',function(){ setAfiExcView(b.getAttribute('data-afi-exc')); });
  });
  function saveAfi(extra){
    var payload=Object.assign({spk:'SPK/26/CLD/00418',kind:afiKind,plate:plateVal(),name:'Budi Santoso',addr:'Jl. Kemang Selatan VIII No. 12, Jakarta Selatan'}, extra);
    if(window.FAST && FAST.save) FAST.save(payload, FAST.AFI_KEY);
    applyAfi();
  }
  document.querySelectorAll('[data-afi-pair]').forEach(function(b){
    b.addEventListener('click',function(){
      if(afiKind==='pilih' && !plateVal()){ toast('Isi nomor yang diminta, atau pilih ganjil/genap/standar.'); return; }
      saveAfi({pair:true,afi:true,bill:true});
      toast('Billing dan AFI diajukan bersama. Data STNK dari SPK.');
    });
  });
  document.querySelectorAll('[data-afi-submit]').forEach(function(b){
    b.addEventListener('click',function(){
      if(afiExcSt('early')!=='approved' && !afiData().bill){ toast('AFI dulu butuh Approval Engine.'); show('exc_afi'); setAfiExcView('early'); return; }
      if(afiKind==='pilih' && !plateVal()){ toast('Isi nomor yang diminta dulu.'); return; }
      saveAfi({afi:true});
      toast('AFI diajukan sebelum billing (exception).');
    });
  });
  document.querySelectorAll('[data-afi-bill]').forEach(function(b){
    b.addEventListener('click',function(){
      if(afiExcSt('nobill')!=='approved' && !afiData().afi){ toast('Billing tanpa AFI butuh Approval Engine.'); show('exc_afi'); setAfiExcView('nobill'); return; }
      saveAfi({bill:true});
      toast('Billing diajukan tanpa AFI (exception). AFI menyusul.');
    });
  });
  function setAfiExc(next, msg){
    var patch=afiExcKind==='nobill'?{excNobill:next}:{excEarly:next};
    saveAfi(patch);
    toast(msg);
  }
  document.querySelectorAll('[data-exc-afi-submit]').forEach(function(b){
    b.addEventListener('click',function(){ setAfiExc('submitted','Pengajuan pecah urutan terkirim. Admin akan cek.'); });
  });
  document.querySelectorAll('[data-exc-afi-verify]').forEach(function(b){
    b.addEventListener('click',function(){
      if(afiExcSt(afiExcKind)==='draft'||afiExcSt(afiExcKind)==='returned'){ toast('Frontman belum mengajukan.'); return; }
      setAfiExc('verified','Alasan dicek. Siap diputuskan Kepala Administrasi.');
    });
  });
  document.querySelectorAll('[data-exc-afi-approve]').forEach(function(b){
    b.addEventListener('click',function(){
      var st=afiExcSt(afiExcKind);
      if(st==='draft'||st==='returned'){ toast('Belum ada pengajuan.'); return; }
      setAfiExc('approved', afiExcKind==='nobill'?'Disetujui: billing tanpa AFI. 30% tidak di-waive.':'Disetujui: AFI sebelum billing. 30% tidak di-waive.');
    });
  });
  document.querySelectorAll('[data-exc-afi-reject]').forEach(function(b){
    b.addEventListener('click',function(){ setAfiExc('returned','Dikembalikan. Pakai jalur berpasangan, atau ajukan ulang.'); });
  });
  function patchB2b(mut){
    if(!window.FAST || !FAST.b2bLoad) return;
    var s=FAST.b2bLoad();
    mut(s);
    FAST.save({units:s.units, selected:s.selected, tab:s.tab}, FAST.B2B_KEY);
  }
  function b2bSoMeta(id){
    var row=(FAST.B2B_SO||[]).filter(function(x){ return x.id===id; })[0];
    return row||{id:id, so:'450009'+id, unit:'Hiace Premio', amt:''};
  }
  function b2bFlowCopy(flow, u){
    if(u && u.backflow) return u.backflowReason||'Leasing mengembalikan. Lengkapi dokumen, kirim ulang.';
    var map={
      submitted:'Pengajuan sudah masuk ke leasing. Menunggu permintaan dokumen.',
      docs_requested:'Leasing meminta paket dokumen. Unggah di tab Dokumen, lalu kirim.',
      docs_sent:'Dokumen terkirim. Administrasi dapat menerbitkan kontrak dari leasing.',
      contract_ready:'Kontrak dari leasing siap. Sales mengunduh, customer TTD, sales unggah kembali.',
      ttd_uploaded:'Kontrak TTD tercatat. Delivery gate membaca status ini. DP wajib customer dari B2B membuka billing gate.',
      dp_received:'DP wajib dari B2B sudah diterima. Billing gate terbuka. Frontman lengkapi data; Administrasi menagih.',
      billing_ready:'Data penagihan lengkap. Administrasi kirim paperless dan terbitkan kuitansi ke leasing.',
      paperless_sent:'Penagihan paperless terkirim. Administrasi menerbitkan kuitansi ke leasing.',
      lunas:'Pelunasan leasing tercatat. Jejak SPK–SO–billing tetap sama.'
    };
    return map[flow]||map.submitted;
  }
  function b2bTagFor(flow, back){
    if(back) return {cls:'tag stop', text:'Dikembalikan'};
    var map={
      submitted:{cls:'tag mute', text:'Submit'},
      docs_requested:{cls:'tag wait', text:'Dokumen diminta'},
      docs_sent:{cls:'tag wait', text:'Dokumen terkirim'},
      contract_ready:{cls:'tag wait', text:'Kontrak siap'},
      ttd_uploaded:{cls:'tag ok', text:'TTD tercatat'},
      dp_received:{cls:'tag ok', text:'DP B2B diterima'},
      billing_ready:{cls:'tag wait', text:'Siap ditagih Admin'},
      paperless_sent:{cls:'tag ok', text:'Paperless'},
      lunas:{cls:'tag ok', text:'Lunas leasing'}
    };
    return map[flow]||{cls:'tag wait', text:'B2B'};
  }
  function applyB2b(){
    if(!window.FAST || !FAST.b2bLoad) return;
    var s=FAST.b2bLoad();
    var sum=FAST.b2bSummary();
    var selected=s.selected||'1288';
    var u=s.units[selected]||{};
    var flow=FAST.b2bDerive(u);
    var meta=b2bSoMeta(selected);
    var dpEl=document.querySelector('[data-b2b-dp-label]');
    var ttdEl=document.querySelector('[data-b2b-ttd-label]');
    var paperEl=document.querySelector('[data-b2b-paper-label]');
    if(dpEl) dpEl.textContent='DP diterima '+sum.dp+'/3';
    if(ttdEl) ttdEl.textContent='TTD '+sum.ttd+'/3';
    if(paperEl) paperEl.textContent='Kuitansi '+sum.kwt+'/3';
    document.querySelectorAll('[data-b2b-dp-wajib]').forEach(function(el){ el.textContent=meta.dpLabel||'—'; });
    var dpStatus=document.querySelector('[data-b2b-dp-status]');
    if(dpStatus) dpStatus.textContent=u.dpReceived?('Diterima '+ (meta.dpLabel||'') +' · billing gate terbuka'):('Wajib '+ (meta.dpLabel||'') +' · belum diterima');
    var dpIn=document.querySelector('[data-b2b-dp-in]');
    if(dpIn) dpIn.textContent=u.dpReceived?(meta.dpLabel||'Rp 0'):'Rp 0';
    var otr=document.querySelector('[data-b2b-otr]');
    if(otr) otr.textContent=meta.amt||'—';
    document.querySelectorAll('[data-b2b-otr]').forEach(function(el){ el.textContent=meta.amt||'—'; });
    document.querySelectorAll('[data-b2b-finance]').forEach(function(el){ el.textContent=meta.financeLabel||'—'; });
    document.querySelectorAll('[data-b2b-so-no]').forEach(function(el){ el.textContent=meta.so||'—'; });
    document.querySelectorAll('[data-b2b-so-unit]').forEach(function(el){ el.textContent=meta.unit||'Hiace Premio'; });
    var homeSpk=document.querySelector('[data-b2b-home-spk]');
    if(homeSpk){
      var ht=homeSpk.querySelector('[data-b2b-home-tag]');
      var hs=homeSpk.querySelector('[data-b2b-home-spec]');
      if(sum.back){
        if(ht){ ht.className='tag stop'; ht.textContent='Ada backflow'; }
        if(hs) hs.textContent='Lengkapi dokumen di SPK ini. DP wajib tetap di struktur harga tiap SO.';
      } else {
        if(ht){ ht.className='tag wait'; ht.textContent='B2B leasing'; }
        if(hs) hs.textContent='Tiga SO. DP wajib di struktur harga. Kerja Frontman dan penagihan Admin tetap di SPK ini.';
      }
    }
    var strip=document.querySelector('[data-b2b-dp-strip]');
    if(strip) strip.textContent='SO '+meta.so+' · DP wajib '+ (meta.dpLabel||'—') +'. QRIS/CDM/EDC cabang tidak mengganti angka B2B.';
    var kwtNo=document.querySelector('[data-b2b-kwt-no]');
    if(kwtNo) kwtNo.textContent=u.kwtIssued?('Kuitansi: '+(meta.kwt||'terbit')):'Kuitansi: belum terbit';
    var checks={
      dl:!!u.contractDownloaded,
      signed:!!u.signedContract,
      fotoTtd:!!(u.billing&&u.billing.fotoTtd),
      fotoSerah:!!(u.billing&&u.billing.fotoSerah),
      bstkb:!!(u.billing&&u.billing.bstkb),
      dp:!!u.dpReceived
    };
    var miss=[];
    var missMap={dl:'unduh kontrak',signed:'unggah kontrak TTD',fotoTtd:'foto TTD kontrak',fotoSerah:'foto serah terima',bstkb:'BSTKB',dp:'full DP dari B2B'};
    Object.keys(checks).forEach(function(k){
      var li=document.querySelector('[data-b2b-check="'+k+'"]');
      if(!li) return;
      var on=checks[k];
      var mark=li.querySelector('.mark');
      var tag=li.querySelector('.tag');
      if(mark){ mark.className='mark '+(on?'ok':'no'); mark.textContent=on?'✓':(missMap[k]?String({dl:1,signed:2,fotoTtd:3,fotoSerah:4,bstkb:5,dp:6}[k]):'–'); }
      if(tag){ tag.className='tag '+(on?'ok':'wait'); tag.textContent=on?'Ada':'Belum'; }
      if(!on) miss.push(missMap[k]);
    });
    var canBill=typeof FAST.b2bAdminCanBill==='function'?FAST.b2bAdminCanBill(u):false;
    var block=document.querySelector('[data-b2b-admin-block]');
    if(block){
      block.hidden=canBill||!!u.paperlessSent;
      block.textContent=miss.length?('Belum bisa ditagih. Kurang: '+miss.join(', ')+'.'):'';
    }
    var paperBtn=document.querySelector('[data-b2b-paperless]');
    if(paperBtn) paperBtn.disabled=!canBill || !!u.paperlessSent;
    var kwtOnly=document.querySelector('[data-b2b-kwt]');
    if(kwtOnly) kwtOnly.disabled=!u.paperlessSent || !!u.kwtIssued;
    document.querySelectorAll('[data-b2b-tab-role]').forEach(function(b){
      var need=b.getAttribute('data-b2b-tab-role');
      b.hidden = !(currentRole===need || currentRole==='mgmt');
    });
    var tab=s.tab||'ringkas';
    if(currentRole==='frontman' && tab==='tagih') tab='dokumen';
    if(currentRole==='admin' && tab==='dokumen') tab='tagih';
    document.querySelectorAll('[data-b2b-chrome]').forEach(function(el){ el.hidden = tab!=='ringkas'; });
    var hiace=document.getElementById('tx_hiace');
    if(hiace){
      var viewTab={ringkas:'spk',so:'so',alur:'del',dokumen:'bill',tagih:'bill'};
      if(viewTab[tab]) hiace.setAttribute('data-stage-view', viewTab[tab]);
    }
    var billCard=document.querySelector('[data-b2b-card="bill"]');
    var delCard=document.querySelector('[data-b2b-card="del"]');
    var paperCard=document.querySelector('[data-b2b-card="paper"]');
    if(billCard) billCard.classList.toggle('alert', sum.dp<3);
    if(delCard) delCard.classList.toggle('alert', sum.ttd<3);
    if(paperCard) paperCard.classList.toggle('alert', sum.kwt<3);
    var gateNote=document.querySelector('[data-b2b-gate-note]');
    if(gateNote){
      gateNote.textContent=sum.back
        ? 'Ada backflow. Frontman lengkapi data — bukan waiver TTD/DP. Approval Engine tidak dibuka.'
        : 'Frontman: unduh/unggah kontrak & bukti. Administrasi menagih hanya jika paket itu lengkap dan full DP B2B sudah dibayar.';
    }
    document.querySelectorAll('[data-b2b-tab]').forEach(function(b){
      b.setAttribute('aria-current', b.getAttribute('data-b2b-tab')===tab?'true':'false');
    });
    document.querySelectorAll('[data-b2b-panel]').forEach(function(p){
      p.hidden = p.getAttribute('data-b2b-panel')!==tab;
    });
    document.querySelectorAll('[data-b2b-so]').forEach(function(b){
      var id=b.getAttribute('data-b2b-so');
      var uu=s.units[id]||{};
      var ff=FAST.b2bDerive(uu);
      b.setAttribute('aria-current', id===selected?'true':'false');
      var tag=b.querySelector('[data-b2b-so-tag]');
      var m=b.querySelector('[data-b2b-so-meta]');
      var t=b2bTagFor(ff, uu.backflow);
      if(tag){ tag.className=t.cls; tag.textContent=t.text; }
      if(m) m.textContent=uu.backflow?(uu.backflowReason||'Backflow'):b2bFlowCopy(ff, uu);
    });
    document.querySelectorAll('[data-b2b-home]').forEach(function(card){
      var id=card.getAttribute('data-b2b-home');
      var uu=s.units[id]||{};
      var ff=FAST.b2bDerive(uu);
      var t=b2bTagFor(ff, uu.backflow);
      var tag=card.querySelector('[data-b2b-home-tag]');
      var spec=card.querySelector('[data-b2b-home-spec]');
      if(tag){ tag.className=t.cls; tag.textContent=t.text; }
      if(spec) spec.textContent=uu.backflow?'Backflow · lengkapi dokumen · kirim ulang':b2bFlowCopy(ff, uu);
    });
    document.querySelectorAll('[data-b2b-so-title]').forEach(function(el){ el.textContent='SO '+meta.so; });
    var now=document.querySelector('[data-b2b-now-copy]');
    if(now) now.textContent=b2bFlowCopy(flow, u);
    var banner=document.querySelector('[data-b2b-backflow]');
    if(banner){
      banner.hidden=!u.backflow;
      banner.textContent=u.backflow?(u.backflowReason||'Dikembalikan leasing.'):'';
      banner.classList.toggle('warn', !!u.backflow);
    }
    var path=document.querySelector('[data-b2b-path]');
    if(path){
      path.innerHTML='';
      var rank=FAST.B2B_FLOW.indexOf(flow==='backflow'?'docs_requested':flow);
      FAST.B2B_FLOW.forEach(function(step,i){
        if(i){
          var arr=document.createElement('span');
          arr.textContent='→';
          path.appendChild(arr);
        }
        var b=document.createElement('b');
        b.textContent=FAST.B2B_FLOW_LABEL[step];
        if(u.backflow && step==='docs_requested') b.className='back';
        else if(i<rank) b.className='done';
        else if(i===rank) b.className='on';
        path.appendChild(b);
      });
    }
    var docCopy={
      ktp:{off:'Ketuk untuk pasang KTP/identitas pengurus', on:'Terpasang · vault B2B'},
      npwp:{off:'Ketuk untuk pasang NPWP badan', on:'Terpasang · vault B2B'},
      siup:{off:'Ketuk untuk pasang NIB/SIUP', on:'Terpasang · vault B2B'},
      spk:{off:'Ketuk untuk pasang SPK/quotation', on:'Terpasang · SPK/26/CLD/00421'}
    };
    Object.keys(docCopy).forEach(function(k){
      var b=document.querySelector('[data-b2b-doc="'+k+'"]');
      if(!b) return;
      var on=!!(u.docs&&u.docs[k]);
      b.classList.toggle('on', on);
      var span=b.querySelector('span');
      if(span) span.textContent=on?docCopy[k].on:docCopy[k].off;
    });
    var signed=document.querySelector('[data-b2b-drop="signed"]');
    if(signed){
      signed.classList.toggle('on', !!u.signedContract);
      var sp=signed.querySelector('span');
      if(sp) sp.textContent=u.signedContract?'Terpasang · kontrak TTD customer · delivery gate membaca status ini':'Ketuk untuk pasang scan yang sudah ditandatangani';
    }
    var billCopy={
      bstkb:{off:'Ketuk untuk pasang scan BSTKB', on:'Terpasang · scan BSTKB'},
      fotoSerah:{off:'Ketuk untuk pasang foto serah terima', on:'Terpasang · geotag perangkat'},
      fotoTtd:{off:'Ketuk untuk pasang foto tanda tangan kontrak', on:'Terpasang · foto TTD kontrak'}
    };
    Object.keys(billCopy).forEach(function(k){
      var b=document.querySelector('[data-b2b-bill="'+k+'"]');
      if(!b) return;
      var on=!!(u.billing&&u.billing[k]);
      b.classList.toggle('on', on);
      var span=b.querySelector('span');
      if(span) span.textContent=on?billCopy[k].on:billCopy[k].off;
    });
    var dl=document.querySelector('[data-b2b-dl-contract]');
    if(dl){
      dl.disabled=!u.contractFromLeasing;
      dl.textContent=u.contractFromLeasing?'Unduh kontrak leasing':'Kontrak belum dari leasing';
    }
    ['1288','1289','1290'].forEach(function(id){
      var uu=s.units[id]||{};
      var ff=FAST.b2bDerive(uu);
      var t=b2bTagFor(ff, uu.backflow);
      var st=document.querySelector('[data-b2b-book-status="'+id+'"]');
      var tg=document.querySelector('[data-b2b-book-tag="'+id+'"]');
      if(st) st.textContent=uu.backflow?'Backflow': (FAST.B2B_FLOW_LABEL[ff]||ff);
      if(tg){ tg.className=t.cls; tg.textContent=t.text; }
      var dpCell=document.querySelector('[data-b2b-book-dp="'+id+'"]');
      var rowMeta=b2bSoMeta(id);
      if(dpCell) dpCell.textContent=rowMeta.dpLabel||'—';
      document.querySelectorAll('[data-b2b-kwt-row="'+id+'"]').forEach(function(row){ row.hidden=!uu.kwtIssued; });
    });
    if(window.FAST && FAST.renderLineage) FAST.renderLineage();
  }
  function applyGi(){
    var s=window.FAST && FAST.load ? FAST.load(FAST.GI_KEY) : null;
    s=s||{};
    var st=s.gi||'draft';
    var notes={
      draft:'Unggah foto serah terima, foto VIN, dan scan BSTKB. Geotag dan waktu tercatat di perangkat. Administrasi memeriksa, lalu menyetujui. Paket yang sama nanti di akun pelanggan — bukan CCTV dealer.',
      submitted:'Bukti masuk antrean Administrasi. Salesman tidak mencatat GI sendiri. Customer belum melihat paket sampai disetujui.',
      approved:'Good Issue disetujui. Unit tertutup di gudang. Paket bukti yang sama tersedia untuk pelanggan. STNK/BPKB memakai data yang sama.',
      returned:'Dikembalikan. Lengkapi foto, VIN, atau scan BSTKB, lalu kirim ulang.'
    };
    var tags={draft:'Good Issue',submitted:'Menunggu Admin',approved:'GI disetujui',returned:'Dikembalikan'};
    var specs={
      draft:'Tindakan: unggah foto, VIN, BSTKB + geotag',
      submitted:'Tindakan: pantau persetujuan Administrasi',
      approved:'GI tercatat · paket bukti di akun pelanggan',
      returned:'Lengkapi bukti, kirim ulang ke Administrasi'
    };
    var dropCopy={
      foto:{off:'Ketuk untuk pasang contoh · geotag 2 Sep 14:22',on:'Terpasang · 2 Sep 2026 14:22 WIB · −6.2731, 106.8072'},
      vin:{off:'Ketuk untuk pasang · cocokkan dengan SO',on:'Terpasang · VIN ••20424 cocok SO'},
      bstkb:{off:'Ketuk untuk pasang scan · nomor mengikuti VIN',on:'Terpasang · scan BSTKB'}
    };
    Object.keys(dropCopy).forEach(function(kind){
      var b=document.querySelector('#gi [data-drop="'+kind+'"]');
      if(!b) return;
      var on=!!s[kind];
      b.classList.toggle('on', on);
      var span=b.querySelector('span');
      if(span) span.textContent=on?dropCopy[kind].on:dropCopy[kind].off;
    });
    var vault=document.querySelector('[data-gi-vault]');
    if(vault) vault.hidden=st!=='approved';
    var note=document.querySelector('[data-gi-note]');
    if(note){
      note.textContent=notes[st]||notes.draft;
      note.classList.toggle('warn', st!=='approved');
      note.classList.toggle('ok', st==='approved');
    }
    document.querySelectorAll('[data-gi-tag]').forEach(function(el){
      el.textContent=tags[st]||tags.draft;
      el.className='tag '+(st==='approved'?'ok':st==='returned'?'stop':'wait');
    });
    document.querySelectorAll('[data-gi-spec]').forEach(function(el){ el.textContent=specs[st]||specs.draft; });
    document.querySelectorAll('[data-gi-status]').forEach(function(el){
      el.textContent=st==='approved'?'Tercatat':st==='submitted'?'Cek Admin':st==='returned'?'Dikembalikan':'Menunggu bukti';
    });
  }
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
      patchB2b(function(s){ s.tab=b.getAttribute('data-b2b-tab'); });
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
      toast('Belum bisa menagih. Frontman harus unduh kontrak, unggah kontrak TTD, foto TTD, foto serah terima, dan BSTKB — plus full DP dari B2B sudah dibayar.');
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

  function runSoConvert(){
    var overlay=document.getElementById('soflow');
    var status=document.getElementById('soStatus');
    var steps=overlay?overlay.querySelectorAll('[data-step]'):[];
    if(!overlay){ show('so'); return; }
    overlay.hidden=false;
    steps.forEach(function(li){ li.className=''; });
    var labels=['Membandingkan kuitansi dengan minimum Yaris…','Menyalin pemesan, STNK, unit, harga area PO…','Menerbitkan nomor Sales Order…','Menautkan kuitansi ke SPK dan SO…'];
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
        toast('Booking fee meet. SPK dikonversi ke SO 4500091426.');
        show('so');
      }
    }
    tick();
  }
  function settleBooking(channel){
    if(window.FAST && FAST.save) FAST.save({paid:true,spk:'SPK/26/CLD/00426',so:'4500091426',channel:channel,receipt:'KWT/26/CLD/009301'}, FAST.BF_KEY);
    applyRole('frontman');
    applyBooking();
    applySpkDraft();
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
    var amt=n?formatRp(n):(j.locked?j.amount:'isi nominal dulu');
    if(panel==='va'){
      dgVaBank=meta||dgVaBank||'BCA';
      var wait=document.getElementById('dgVaHint');
      var ready=document.getElementById('dgVaReadyHint');
      var no=document.getElementById('dgVaNo');
      if(wait) wait.textContent=j.locked
        ? ('VA '+dgVaBank+' · request salesman '+j.amount+' sudah terkunci. Terbitkan nomor.')
        : ('Isi nominal, lalu terbitkan VA '+dgVaBank+'. Ini transfer rekening virtual, bukan QRIS.');
      if(ready) ready.textContent='Transfer ke VA '+dgVaBank+' · '+amt+'.';
      if(no) no.textContent=(j.va&&j.va[dgVaBank])||j.va.BCA;
      refreshDgInstruments();
    }
    if(panel==='qris'){
      refreshDgInstruments();
    }
    if(panel==='app'){
      var hint=document.getElementById('dgAppHint');
      if(hint) hint.textContent='Membuka '+(meta||'myBCA')+' · '+j.kind+' '+amt+'.';
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
      if(!n){ toast('Isi nominal pembayaran dulu.'); return; }
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
        toast('Dibatasi '+formatRp(j.max)+'.');
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
        if(!n){ toast('Isi nominal QRIS dulu.'); return; }
        var label=document.getElementById('cashQrisLabel');
        var pay=document.getElementById('cashQrisPay');
        var box=document.querySelector('[data-cash-qris-ready]');
        if(label) label.textContent=formatRp(n);
        if(pay) pay.setAttribute('data-amount', String(n));
        if(box) box.hidden=false;
        return;
      }
      var n=currentDgAmount();
      if(!n){ toast('Isi nominal pembayaran dulu.'); return; }
      dgQrisReady=true;
      refreshDgInstruments();
    });
  });
  document.querySelectorAll('[data-va-issue]').forEach(function(b){
    b.addEventListener('click',function(){
      var n=currentDgAmount();
      if(!n){ toast('Isi nominal pembayaran dulu.'); return; }
      dgVaReady=true;
      var j=currentJob();
      var no=document.getElementById('dgVaNo');
      if(no) no.textContent=(j.va&&j.va[dgVaBank])||j.va.BCA;
      var ready=document.getElementById('dgVaReadyHint');
      if(ready) ready.textContent='Transfer ke VA '+dgVaBank+' · '+formatRp(n)+'.';
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
    if(msg) msg.textContent=(s.channel||'Cashless')+' · '+(s.receipt||'KWT/26/CLD/009220')+' · AR Open '+(s.arLabel||'Rp 81.750.000')+'. Delivery '+(s.ar===0?'terbuka':'masih menunggu lunas')+'.';
    document.querySelectorAll('[data-live="ar"]').forEach(function(el){ el.textContent=s.arLabel||'Rp 81.750.000'; });
    document.querySelectorAll('[data-live="ar-short"]').forEach(function(el){
      var ar=typeof s.ar==='number'?s.ar:81750000;
      var jt=ar===0?'0':(ar/1000000).toLocaleString('id-ID',{maximumFractionDigits:2});
      el.innerHTML=jt+'<span style="font-size:14px;font-weight:500"> Jt</span>';
    });
    document.querySelectorAll('[data-live="avail"]').forEach(function(el){ el.textContent=s.ar===0?'Rp 0':'Rp 81.750.000'; });
    document.querySelectorAll('[data-live="payhint"]').forEach(function(el){
      el.textContent=s.ar===0?'100% terbayar · delivery cash terbuka':'83,2% terbayar · cashless di transaksi ini';
    });
    var barFill=document.querySelector('#transaksi .bar i');
    if(barFill) barFill.style.width=s.ar===0?'100%':'83.2%';
  }
  applyLive();
  applyExcAlamat();
  applyBooking();
  applySpkDraft();
  applyDelivery();
  applyGi();
  applyB2b();
  applyHandoverCust();
  applyAfi();
  applyDewiProc();
  syncRoleChrome();
  syncMgmtSeat();
  window.addEventListener('fast-session', function(){ applyLive(); applyExcAlamat(); applyBooking(); applySpkDraft(); applyDelivery(); applyGi(); applyB2b(); applyAfi(); applyDewiProc(); applyHandoverCust(); applyMgmtInbox(); });

  var channelMeta={
    qris:{title:'QRIS'},
    cdm:{title:'CDM cabang'},
    edc:{title:'Debit EDC'},
    brilink:{title:'BRILink'},
    va:{title:'Virtual Account'},
    app:{title:'Aplikasi bank'},
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
      slot.innerHTML='<b>KWT/26/CLD/009220</b><p class="meta">Pembayaran · '+(channelMeta[channel]?channelMeta[channel].title:'Cashless')+' · '+formatRp(amount)+'</p><span class="tag ok">Aktif</span><button class="btn ghost" style="width:100%;margin-top:10px">Download PDF</button>';
      var db=slot.querySelector('button');
      if(db) db.addEventListener('click',function(){ downloadReceipt('KWT/26/CLD/009220'); toast('E-kuitansi PDF diunduh.'); });
    }
    if(window.FAST && FAST.save){
      FAST.save({paid:true,ar:ar,arLabel:label,receipt:'KWT/26/CLD/009220',channel:(channelMeta[channel]||{}).title||channel});
    }
    toast(ar===0?'Lunas. E-kuitansi terbit. Delivery cash terbuka.':'Pembayaran '+formatRp(amount)+' masuk. Tagihan di beranda ikut berkurang.');
    show(currentRole==='cust'?'customer_detail':'cashless');
  }
  function runPayflow(channel, amount){
    var overlay=document.getElementById('payflow');
    var status=document.getElementById('pfStatus');
    var steps=overlay?overlay.querySelectorAll('[data-step]'):[];
    if(!overlay){ settle(channel, amount); return; }
    overlay.hidden=false;
    steps.forEach(function(li){ li.className=''; });
    var labels=['Membaca SPK & AR Open…','Verifikasi Banking API…','Menerbitkan e-kuitansi…','Memperbarui beranda…'];
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
      if(id==='customer'||id==='customer_detail'||id==='digiroom'||id==='bukti_serah'||id==='order_calya') applyRole('cust');
      else if(currentRole==='mgmt' && id==='beranda') id='dashboard';
      else if(currentRole==='admin' && id==='beranda') id='admin_spk';
      else if(currentRole==='admin' && id==='cashless') id='admin_pay';
      else if(ADMIN_BOOK[id]||id==='verifikasi'||id==='admin_book') applyRole('admin');
      else if(id==='beranda'||id==='transaksi'||id==='spk'||id==='spk_baru'||id==='quot'||id==='so'||id==='so2'||id==='proses'||id==='booking') applyRole('frontman');
      show(id);
    });
  });
})();

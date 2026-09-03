(function(){

  var receipts={
    'KWT/26/CLD/009115':{no:'KWT/26/CLD/009115',status:'Aktif',type:'Pelunasan tahap 1',customer:'Budi Santoso',unit:'Innova Zenix · VIN ••41827',date:'1 Sep 2026, 14:08 WIB',method:'BCA Virtual Account',ref:'VA 8801 0418 0002',spk:'SPK/26/CLD/00418',so:'4500091238',billing:'Belum terbit',amount:'Rp 300.000.000',verify:'VFY-CLD-009115-A7K2'},
    'KWT/26/CLD/009220':{no:'KWT/26/CLD/009220',status:'Aktif',type:'Pelunasan tahap 2',customer:'Budi Santoso',unit:'Innova Zenix · VIN ••41827',date:'3 Sep 2026, 09:41 WIB',method:'Cashless',ref:'PAY-CLD-00418-3',spk:'SPK/26/CLD/00418',so:'4500091238',billing:'Belum terbit',amount:'Rp 100.000.000',verify:'VFY-CLD-009220-R8P1'},
    'KWT/26/CLD/009301':{no:'KWT/26/CLD/009301',status:'Aktif',type:'Booking fee',customer:'Dewi Lestari',unit:'Yaris 1.5 G',date:'3 Sep 2026, 10:12 WIB',method:'Cashless',ref:'PAY-CLD-00426-1',spk:'SPK/26/CLD/00426',so:'Belum terbit',billing:'Belum terbit',amount:'Rp 3.000.000',verify:'VFY-CLD-009301-Y4R1'}
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
  }
  function show(id){
    screens.forEach(function(s){ s.classList.toggle('on', s.id===id); });
    var railId=({
      customer_detail:'customer',order_aksesoris:'customer',order_calya:'customer',
      tagihan_customer:'customer',e_kuitansi:'customer',
      transaksi:'beranda',bayar:'cashless',request:'beranda',dokumen:'beranda',cashless:'beranda',
      tx_hiace:'beranda',tx_raize:'beranda',tx_avanza:'beranda',tx_fortuner:'beranda',
      booking:'beranda',spk:'beranda',quot:'beranda',so:'beranda',proses:'beranda',
      afi_d:'beranda',do:'beranda',bill_d:'beranda',kirim_d:'beranda',stnk_d:'beranda',
      delivery:'beranda',gi:'beranda',afi:'beranda',digiroom:'customer',
      exc_alamat:'eskalasi',exc_stnk:'eskalasi',exc_afi:'eskalasi'
    })[id]||id;
    if((id==='gi'||id==='delivery') && currentRole==='admin') railId='verifikasi';
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
      var on=(hid==='beranda'&&(id==='beranda'||id==='transaksi'||id.indexOf('tx_')===0||id==='dokumen'||id==='request'||id==='eskalasi'||id==='spk'||id==='quot'||id==='so'||id==='proses'||id==='afi_d'||id==='do'||id==='bill_d'||id==='kirim_d'||id==='stnk_d'||id==='booking'||id==='delivery'||id==='gi'||id==='afi'||id.indexOf('exc_')===0))
        ||(hid==='proses'&&(id==='proses'||id==='spk'||id==='quot'||id==='so'||id==='afi_d'||id==='do'||id==='bill_d'||id==='kirim_d'||id==='stnk_d'||id==='booking'))
        ||(hid==='cashless'&&(id==='cashless'||id==='bayar'||id==='digiroom'))
        ||(hid==='customer'&&(id==='customer'||id==='customer_detail'||id==='tagihan_customer'||id==='e_kuitansi'||id==='digiroom'||id.indexOf('order_')===0));
      a.classList.toggle('on', on);
      a.classList.toggle('pay', hid==='cashless');
    });
    var bar=document.querySelector('.urlbar');
    if(bar) bar.textContent=(id==='digiroom'?'digiroom.fast.id/beranda':'sam.fast.id/fast/'+id);
    if(history.replaceState) try { history.replaceState(null,'','#'+id); } catch(err) {}
    var cashBack=document.querySelector('#cashless [data-back]');
    if(cashBack){
      cashBack.setAttribute('data-go', currentRole==='cust'?'customer_detail':'beranda');
      cashBack.textContent=currentRole==='cust'?'← Pesanan':'← Daftar';
    }
    document.querySelectorAll('#cashless .worktabs, #cashless [data-go="transaksi"]').forEach(function(el){
      el.hidden=currentRole==='cust';
    });
    applyCashlessEdc();
    if(id==='booking') setPayJob('booking');
    if(id==='so'||id==='bill_d'||id==='kirim_d') setPayJob('dewi');
    if(id==='cashless'){ setPayJob('lunas'); setCashQrisMode('request'); }
    syncRoleChrome();
    applyExcAlamat();
    applyBooking();
    applyDelivery();
    applyGi();
    applyAfi();
  }
  goBtns.forEach(function(b){ b.addEventListener('click',function(e){
    if(isDownloadAction(b)){ e.preventDefault(); downloadReceipt(receiptNoFrom(b)); toast('E-kuitansi PDF diunduh.'); return; }
    var fromFrontman=currentRole==='frontman';
    if(b.dataset.role) applyRole(b.dataset.role);
    if(b.dataset.payJob){
      setPayJob(b.dataset.payJob);
      if(b.dataset.go==='digiroom') toast(fromFrontman?'Tautan terkirim. Customer masuk ke beranda Digiroom.':'Pilih QRIS atau VA di Digiroom.');
    }
    if(b.dataset.afiExc) setAfiExcView(b.dataset.afiExc);
    show(b.dataset.go); window.scrollTo({top:document.querySelector('.app').offsetTop-20,behavior:'smooth'});
  }); });
  document.querySelectorAll('#mockup button').forEach(function(b){
    if(isDownloadAction(b) && !b.hasAttribute('data-go')){
      b.addEventListener('click',function(){ downloadReceipt(receiptNoFrom(b)); toast('E-kuitansi PDF diunduh.'); });
      return;
    }
    if(b.hasAttribute('data-go') || b.classList.contains('roletab') || (b.closest('.seg') && b.closest('#jenisSeg'))) return;
    if(b.hasAttribute('data-bf') || b.hasAttribute('data-bf-pay') || b.hasAttribute('data-pay-link') || b.hasAttribute('data-dg') || b.hasAttribute('data-dg-pay') || b.hasAttribute('data-edc-device') || b.hasAttribute('data-cash') || b.hasAttribute('data-cash-amt') || b.hasAttribute('data-qris-show') || b.hasAttribute('data-va-issue')) return;
    if(b.hasAttribute('data-qt-revise') || b.hasAttribute('data-qt-push') || b.hasAttribute('data-dewi-afi') || b.hasAttribute('data-dewi-do')) return;
    if(b.hasAttribute('data-del-submit') || b.hasAttribute('data-gi-submit') || b.hasAttribute('data-gi-approve') || b.hasAttribute('data-gi-return') || b.hasAttribute('data-drop') || b.hasAttribute('data-afi-submit') || b.hasAttribute('data-afi-kind') || b.hasAttribute('data-afi-bill') || b.hasAttribute('data-afi-pair') || b.hasAttribute('data-afi-exc') || b.hasAttribute('data-exc-afi-submit') || b.hasAttribute('data-exc-afi-verify') || b.hasAttribute('data-exc-afi-approve') || b.hasAttribute('data-exc-afi-reject')) return;
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

  var currentRole='frontman';
  var first={frontman:'beranda',admin:'verifikasi',mgmt:'dashboard',cust:'customer'};
  var screenRole={beranda:'frontman',transaksi:'frontman',bayar:'frontman',request:'frontman',dokumen:'frontman',cashless:'frontman',tx_hiace:'frontman',tx_raize:'frontman',tx_avanza:'frontman',tx_fortuner:'frontman',spk:'frontman',quot:'frontman',so:'frontman',proses:'frontman',afi_d:'frontman',do:'frontman',bill_d:'frontman',kirim_d:'frontman',stnk_d:'frontman',booking:'frontman',delivery:'frontman',afi:'frontman',gi:'frontman',digiroom:'cust',verifikasi:'admin',dashboard:'mgmt',customer:'cust',customer_detail:'cust',order_aksesoris:'cust',order_calya:'cust',tagihan_customer:'cust',e_kuitansi:'cust'};
  function syncRoleChrome(){
    document.querySelectorAll('[data-for]').forEach(function(el){
      el.hidden = el.getAttribute('data-for') !== currentRole;
    });
  }
  function applyRole(role){
    currentRole=role;
    document.querySelectorAll('.roletab').forEach(function(x){x.setAttribute('aria-pressed', x.dataset.role===role?'true':'false');});
    document.querySelectorAll('[data-rail]').forEach(function(r){ r.hidden = r.dataset.rail!==role; });
    syncRoleChrome();
    applyCashlessEdc();
  }
  document.querySelectorAll('.roletab').forEach(function(t){
    t.addEventListener('click',function(){
      applyRole(t.dataset.role);
      show(first[t.dataset.role]);
      toast('Peran: '+t.textContent.trim());
    });
  });
  var hash=(location.hash||'').replace('#','');
  if(hash && document.getElementById(hash)){
    if(screenRole[hash]) applyRole(screenRole[hash]);
    show(hash);
  }

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
      returned:'Dikembalikan ke Frontman. Lengkapi bukti, lalu kirim ulang.'
    };
    var tags={draft:'Menunggu pengajuan',submitted:'Menunggu Admin',verified:'Siap diputuskan',approved:'Disetujui bersyarat',returned:'Dikembalikan'};
    var specs={
      draft:'Waivable · Frontman ajukan → Admin cek → Kepala Administrasi',
      submitted:'Waivable · Admin sedang cek bukti',
      verified:'Waivable · Kepala Administrasi memutuskan',
      approved:'Syarat: alamat asli sebelum DO · pelunasan tetap wajib',
      returned:'Lengkapi bukti, kirim ulang'
    };
    var note=document.querySelector('[data-exc-note]');
    if(note){
      note.textContent=notes[st]||notes.draft;
      note.classList.toggle('warn', st!=='approved');
      note.classList.toggle('ok', st==='approved');
    }
    var order=['draft','submitted','verified','approved'];
    var idx=order.indexOf(st==='returned'?'draft':st);
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
      el.className='tag '+(st==='approved'?'ok':st==='returned'?'stop':'hold');
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
    document.querySelectorAll('[data-exc-pill]').forEach(function(el){ el.textContent=st==='approved'?'0':'1'; });
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
      : 'Terima di cabang atau kirim tautan';
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
  function applyBooking(){
    var s=window.FAST && FAST.load ? FAST.load(FAST.BF_KEY) : null;
    var paid=!!(s && s.paid);
    document.querySelectorAll('[data-bf-hide-paid]').forEach(function(el){ el.hidden=paid; });
    document.querySelectorAll('[data-bf-show-paid]').forEach(function(el){ el.hidden=!paid; });
    var block=document.querySelector('[data-so-block]');
    var ready=document.querySelector('[data-so-ready]');
    if(block) block.hidden=paid;
    if(ready) ready.hidden=!paid;
    var card=document.querySelector('[data-dewi-card]');
    if(card) card.setAttribute('data-go', paid?'so':'spk');
    var oid=document.querySelector('[data-dewi-oid]');
    if(oid) oid.textContent=paid?'SO 4500091426 · dari SPK/26/CLD/00426':'SPK/26/CLD/00426 · baru tersimpan';
    var spec=document.querySelector('[data-dewi-spec]');
    if(spec) spec.textContent=paid?'Tindakan: SO → AFI → DO → billing':'Tindakan: SPK → quotation → booking cashless';
    var tag=document.querySelector('[data-dewi-tag]');
    if(tag){ tag.textContent=paid?'SO terbuka':'Belum bayar'; tag.className='tag '+(paid?'ok':'wait'); }
    var amt=document.querySelector('[data-dewi-amt]');
    if(amt) amt.textContent=paid?'AR Rp 299,15 Jt':'OTR Depok';
    var cta=document.querySelector('[data-dewi-cta]');
    if(cta) cta.textContent=paid?'Sales Order →':'Data pemesan · STNK · unit →';
    applyDewiProc();
  }
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
    document.querySelectorAll('[data-qt-rev]').forEach(function(el){ el.textContent=String(rev); });
    document.querySelectorAll('[data-qt-fresh]').forEach(function(el){ el.hidden=!!q.stale; });
    document.querySelectorAll('[data-qt-stale]').forEach(function(el){ el.hidden=!q.stale; });
    document.querySelectorAll('[data-so-stale]').forEach(function(el){ el.hidden=!(paid && q.stale); });
    var qtPush=document.querySelector('[data-qt-push]');
    if(qtPush) qtPush.hidden=!(paid && q.stale);
    document.querySelectorAll('[data-afi-d-wait]').forEach(function(el){ el.hidden=paid; });
    document.querySelectorAll('[data-afi-d-open]').forEach(function(el){ el.hidden=!paid || !!q.afi; });
    document.querySelectorAll('[data-afi-d-sent]').forEach(function(el){ el.hidden=!q.afi; });
    document.querySelectorAll('[data-dewi-afi-done]').forEach(function(el){ el.hidden=!q.afi; });
    document.querySelectorAll('[data-do-wait]').forEach(function(el){ el.hidden=!!q.afi; });
    document.querySelectorAll('[data-do-open]').forEach(function(el){ el.hidden=!q.afi || !!q.dof; });
    document.querySelectorAll('[data-do-sent]').forEach(function(el){ el.hidden=!q.dof; });
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
    document.querySelectorAll('[data-proc]').forEach(function(nav){
      var cur=nav.getAttribute('data-proc');
      if(cur==='booking') cur='quot';
      if(cur==='proses') cur='spk';
      nav.innerHTML='';
      procSteps().forEach(function(step){
        var b=document.createElement('button');
        b.type='button';
        b.textContent=step.label;
        var done=(step.id==='spk'||step.id==='quot') || (step.id==='so'&&paid) || (step.id==='afi_d'&&q.afi) || (step.id==='do'&&q.dof);
        if(step.id===cur) b.className='on';
        else if(done) b.className='done';
        b.addEventListener('click',function(){ show(step.id); });
        nav.appendChild(b);
      });
    });
  }
  document.querySelectorAll('[data-qt-revise]').forEach(function(b){
    b.addEventListener('click',function(){
      var q=qtData();
      if(window.FAST && FAST.save) FAST.save({rev:(q.rev||1)+1,stale:true}, FAST.QT_KEY);
      applyDewiProc();
      toast('Quotation berubah. Semua SO terkait harus ikut revisi.');
    });
  });
  document.querySelectorAll('[data-qt-push]').forEach(function(b){
    b.addEventListener('click',function(){
      if(window.FAST && FAST.save) FAST.save({stale:false}, FAST.QT_KEY);
      applyDewiProc();
      toast('SO 4500091426 mengikuti quotation terbaru. Baris Agya tetap SO terpisah.');
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
    var k=(s&&s.kind)||'none';
    var label=afiKindLabel[k]||afiKindLabel.none;
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
      returned:'Dikembalikan ke Frontman. Lengkapi alasan, atau pakai jalur billing + AFI bersama.'
    };
    var note=document.querySelector('[data-exc-afi-note]');
    if(note){
      note.textContent=notes[st]||notes.draft;
      note.classList.toggle('warn', st!=='approved');
      note.classList.toggle('ok', st==='approved');
    }
    var order=['draft','submitted','verified','approved'];
    var idx=order.indexOf(st==='returned'?'draft':st);
    document.querySelectorAll('[data-exc-afi-path] [data-step]').forEach(function(el){
      var si=order.indexOf(el.getAttribute('data-step'));
      el.classList.remove('on','ok');
      if(st==='approved' && si<=3) el.classList.add('ok');
      else if(si<idx) el.classList.add('ok');
      else if(si===idx) el.classList.add('on');
    });
    var tags={draft:'Menunggu pengajuan',submitted:'Menunggu Admin',verified:'Siap diputuskan',approved:'Disetujui',returned:'Dikembalikan'};
    var sel=afiExcKind==='nobill'?'[data-afi-nobill-tag]':'[data-afi-early-tag]';
    document.querySelectorAll(sel).forEach(function(el){
      el.textContent=tags[st]||tags.draft;
      el.className='tag '+(st==='approved'?'ok':st==='returned'?'stop':'hold');
    });
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
  function applyGi(){
    var s=window.FAST && FAST.load ? FAST.load(FAST.GI_KEY) : null;
    var st=(s && s.gi)||'draft';
    var notes={
      draft:'Unggah foto serah terima dan scan BSTKB. Administrasi memeriksa, lalu menyetujui Good Issue. Tracking armada lengkap menyusul di Deliverable 3.',
      submitted:'Bukti masuk antrean Administrasi. Salesman tidak mencatat GI sendiri.',
      approved:'Good Issue disetujui. Unit tertutup di gudang. STNK/BPKB memakai data yang sama.',
      returned:'Dikembalikan. Lengkapi foto atau scan BSTKB, lalu kirim ulang.'
    };
    var tags={draft:'Good Issue',submitted:'Menunggu Admin',approved:'GI disetujui',returned:'Dikembalikan'};
    var specs={
      draft:'Tindakan: unggah foto serah terima + scan BSTKB',
      submitted:'Tindakan: pantau persetujuan Administrasi',
      approved:'Good Issue tercatat · tidak ketik ulang VIN',
      returned:'Lengkapi bukti, kirim ulang ke Administrasi'
    };
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
  var delBtn=document.querySelector('[data-del-submit]');
  if(delBtn) delBtn.addEventListener('click',function(){
    if(window.FAST && FAST.save) FAST.save({requested:true,spk:'SPK/26/CLD/00425'}, FAST.DEL_KEY);
    applyDelivery();
    toast('Request delivery terkirim. Jadwal armada dilanjutkan di Deliverable 3.');
  });
  document.querySelectorAll('[data-drop]').forEach(function(b){
    b.addEventListener('click',function(){
      b.classList.add('on');
      var kind=b.getAttribute('data-drop');
      var span=b.querySelector('span');
      if(span) span.textContent=kind==='foto'?'Terpasang · foto serah terima 2 Sep 14:22':'Terpasang · scan BSTKB';
    });
  });
  var giSubmit=document.querySelector('[data-gi-submit]');
  if(giSubmit) giSubmit.addEventListener('click',function(){
    var foto=document.querySelector('[data-drop="foto"]');
    var scan=document.querySelector('[data-drop="bstkb"]');
    if(!foto||!scan||!foto.classList.contains('on')||!scan.classList.contains('on')){
      toast('Pasang foto serah terima dan scan BSTKB dulu.');
      return;
    }
    if(window.FAST && FAST.save) FAST.save({gi:'submitted',spk:'SPK/26/CLD/00424'}, FAST.GI_KEY);
    applyGi();
    toast('Bukti GI masuk antrean Administrasi.');
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
    toast('Good Issue disetujui. Tidak ada pengetikan ulang VIN atau customer.');
  });
  var giBack=document.querySelector('[data-gi-return]');
  if(giBack) giBack.addEventListener('click',function(){
    if(window.FAST && FAST.save) FAST.save({gi:'returned'}, FAST.GI_KEY);
    applyGi();
    toast('Dikembalikan ke salesman. Lengkapi bukti serah terima.');
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
  applyDelivery();
  applyGi();
  applyAfi();
  syncRoleChrome();
  window.addEventListener('fast-session', function(){ applyLive(); applyExcAlamat(); applyBooking(); applyDelivery(); applyGi(); applyAfi(); applyDewiProc(); });

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
      if(id==='customer'||id==='customer_detail'||id==='digiroom') applyRole('cust');
      else if(id==='beranda'||id==='transaksi'||id==='spk'||id==='quot'||id==='so'||id==='proses'||id==='booking') applyRole('frontman');
      show(id);
    });
  });
})();

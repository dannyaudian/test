/* Buku cabang admin */
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

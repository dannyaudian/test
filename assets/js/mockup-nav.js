/* Navigasi layar, peran, buku admin */
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
  window.FAST=window.FAST||{};
  FAST.toast=toast;
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
  function shopOrderNo(spk){
    var m=String(spk||'').match(/(\d{5,})$/);
    return m?'Pesanan FAST-'+m[1]:spk;
  }
  function applyPayLockUI(){
    var j=currentJob();
    var locked=!!j.locked;
    var shop=currentRole==='cust';
    document.querySelectorAll('[data-pay-locked]').forEach(function(el){ el.hidden=!locked; });
    document.querySelectorAll('[data-pay-open]').forEach(function(el){ el.hidden=locked; });
    var inp=document.querySelector('#digiroom [data-pay-amount-input]');
    if(inp){
      inp.readOnly=locked;
      inp.value=locked?String(j.amountNum):'';
    }
    document.querySelectorAll('[data-pay-max]').forEach(function(el){
      el.textContent='Maksimum '+formatRp(j.max)+(locked?'':' · sisa di luar permintaan aktif');
    });
    var lead=document.querySelector('[data-pay-lead]');
    if(lead){
      lead.textContent=shop
        ? (locked?'Ada permintaan bayar dari salesman. Nominal QRIS dan VA terkunci '+j.amount+'.':'Isi nominal. QRIS menampilkan barcode; VA menerbitkan nomor rekening.')
        : j.lead;
    }
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
    document.querySelectorAll('[data-pay-spk]').forEach(function(el){
      el.textContent=currentRole==='cust'?shopOrderNo(j.spk):j.spk;
    });
    document.querySelectorAll('[data-pay-kind]').forEach(function(el){
      el.textContent=currentRole==='cust'?(j.kind||'').replace(/tahap \d+/i,'').trim():j.kind;
    });
    document.querySelectorAll('[data-pay-unit]').forEach(function(el){ el.textContent=j.unit; });
    document.querySelectorAll('[data-pay-cdm]').forEach(function(el){ el.textContent=j.cdm; });
    document.querySelectorAll('[data-pay-brilink]').forEach(function(el){ el.textContent=j.brilink; });
    var back=document.querySelector('[data-dg-back]');
    if(back){
      if(currentRole==='cust'){
        back.setAttribute('data-go', 'customer_detail');
        back.setAttribute('data-role', 'cust');
        back.textContent='← Pesanan saya';
      } else {
        back.setAttribute('data-go', j.back);
        back.setAttribute('data-role', j.back==='customer_detail'?'cust':'frontman');
        back.textContent=j.back==='customer_detail'?'← Pesanan':'← Frontman';
      }
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
    eskalasi:1,dashboard:1,mgmt_inbox:1,customer:1,shop_home:1,shop_akun:1
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
  function stayTarget(id, fromId, explicit){
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
    if(explicit || LIST_SCREENS[fromId]){
      if(nextTx) persistTx(nextTx);
      return id;
    }
    if(cur && nextTx && familyOf(cur)!==familyOf(nextTx)){
      if(id==='cashless'||id==='digiroom'||id==='booking'||id==='dokumen'||id==='request'||id==='afi'||id==='exc_alamat'||id==='exc_nama'||id==='exc_epo'||id==='transaksi'||id==='customer_detail'||id==='bukti_serah'||id==='gi'||id==='bayar'){
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
      map={ringkas:'so',bayar:'cashless',minta:'so',afi:'afi_d',dok:'spk',exc:'exc_nama'};
    } else if(fam==='agus'){
      map={ringkas:'tx_avanza',bayar:'tx_avanza',minta:'tx_avanza',afi:'tx_avanza',dok:'tx_avanza',exc:'tx_avanza'};
    } else if(fam==='raize'){
      map={ringkas:'tx_raize',bayar:'tx_raize',minta:'tx_raize',afi:'tx_raize',dok:'tx_raize',exc:'tx_raize'};
    } else if(fam==='hiace'){
      map={ringkas:'tx_hiace',bayar:'tx_hiace',minta:'tx_hiace',afi:'tx_hiace',dok:'tx_hiace',exc:'exc_epo'};
    } else if(fam==='maria'){
      map={ringkas:'tx_fortuner',bayar:'tx_fortuner',minta:'tx_fortuner',afi:'tx_fortuner',dok:'tx_fortuner',exc:'exc_stnk'};
    } else if(fam==='fajar'){
      map={ringkas:'gi',bayar:'gi',minta:'gi',afi:'gi',dok:'gi',exc:'gi'};
    }
    document.querySelectorAll('#cashless [data-stay-tab]').forEach(function(b){
      var k=b.getAttribute('data-stay-tab');
      if(map[k]) b.setAttribute('data-go', map[k]);
      if(k==='minta'||k==='exc') b.hidden=fam==='dewi';
    });
  }
  function show(id, opts){
    opts=opts||{};
    var from=(document.querySelector('.screen.on')||{}).id;
    if(id==='shop_home') id='customer';
    id=stayTarget(id, from, opts.explicit);
    if(id==='shop_home') id='customer';
    if(id==='admin_tx') id='admin_spk';
    if(currentRole==='mgmt' && id==='eskalasi') id='mgmt_inbox';
    var bookKey=ADMIN_BOOK[id];
    var screenId=bookKey?'admin_book':id;
    screens.forEach(function(s){ s.classList.toggle('on', s.id===screenId); });
    var landed=document.getElementById(screenId);
    var sameFam=from && landed && familyOf(txOf(from)) && familyOf(txOf(from))===familyOf(txOf(screenId));
    if(landed && opts.stage){
      landed.setAttribute('data-stage-view', opts.stage);
    } else if(from && from!==screenId && !sameFam && landed){
      landed.removeAttribute('data-stage-view');
    }
    if(bookKey) activateAdminBook(bookKey);
    var railId=({
      shop_home:'customer',shop_akun:'shop_akun',
      customer_detail:'customer',order_aksesoris:'customer',order_calya:'customer',bukti_serah:'customer',
      tagihan_customer:'tagihan_customer',e_kuitansi:'e_kuitansi',
      transaksi:'beranda',bayar:'cashless',request:'beranda',dokumen:'beranda',cashless:'beranda',
      tx_hiace:'beranda',tx_raize:'beranda',tx_avanza:'beranda',tx_fortuner:'beranda',
      booking:'beranda',spk:'beranda',spk_baru:'beranda',quot:'beranda',so:'beranda',so2:'beranda',proses:'beranda',
      afi_d:'beranda',do:'beranda',bill_d:'beranda',kirim_d:'beranda',stnk_d:'beranda',
      delivery:'beranda',gi:'beranda',afi:'beranda',digiroom:'customer',
      exc_alamat:'eskalasi',exc_nama:'eskalasi',exc_epo:'eskalasi',exc_stnk:'eskalasi',exc_afi:'eskalasi'
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
        ||((hid==='customer'||hid==='shop_home')&&(id==='shop_home'||id==='shop_akun'||id==='customer'||id==='customer_detail'||id==='tagihan_customer'||id==='e_kuitansi'||id==='digiroom'||id==='bukti_serah'||id.indexOf('order_')===0));
      a.classList.toggle('on', on);
      a.classList.toggle('pay', hid==='cashless');
    });
    var bar=document.querySelector('.urlbar');
    if(bar){
      if(currentRole==='cust'){
        if(id==='digiroom') bar.textContent='pay.fast.id/checkout';
        else if(id==='cashless') bar.textContent='shop.fast.id/outlet-bayar';
        else if(id==='tagihan_customer') bar.textContent='shop.fast.id/bayar';
        else if(id==='e_kuitansi') bar.textContent='shop.fast.id/bukti-bayar';
        else if(id==='shop_akun') bar.textContent='shop.fast.id/akun';
        else if(id==='customer') bar.textContent='shop.fast.id/pesanan';
        else if(id==='customer_detail') bar.textContent='shop.fast.id/pesanan/FAST-00418';
        else bar.textContent='shop.fast.id/pesanan/'+id;
      } else {
        bar.textContent=(id==='digiroom'?'digiroom.fast.id/beranda':'sam.fast.id/fast/'+id);
      }
    }
    var shopTab=({
      shop_home:'orders', customer:'orders', customer_detail:'track', order_aksesoris:'orders',
      order_calya:'orders', bukti_serah:'orders', tagihan_customer:'pay', e_kuitansi:'pay',
      digiroom:'pay', cashless:'pay', shop_akun:'akun'
    })[id]||'orders';
    document.querySelectorAll('.shop-tabbar [data-shop-tab]').forEach(function(b){
      b.setAttribute('aria-current', b.getAttribute('data-shop-tab')===shopTab ? 'true' : 'false');
    });
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
    applyExcNama();
    applyExcEpo();
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
    applyCustPayScene();
    if(window.FAST && FAST.renderMaster) FAST.renderMaster();
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
    if(b.hasAttribute('data-b2b-tab') || b.hasAttribute('data-b2b-so') || b.hasAttribute('data-b2b-doc') || b.hasAttribute('data-b2b-drop') || b.hasAttribute('data-b2b-bill') || b.hasAttribute('data-b2b-dl-contract') || b.hasAttribute('data-b2b-paperless') || b.hasAttribute('data-b2b-kwt') || b.hasAttribute('data-b2b-lunas') || b.hasAttribute('data-b2b-resubmit') || b.hasAttribute('data-b2b-issue-contract') || b.hasAttribute('data-b2b-mark-dp') || b.hasAttribute('data-b2b-mark-epo') || b.hasAttribute('data-b2b-return') || b.hasAttribute('data-b2b-stay') || b.hasAttribute('data-raize-npwp') || b.hasAttribute('data-budi-bf')) return;
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
        om:'Billing tanpa e-PO leasing, plus pantau kirim dan Good Issue. DP dan TTD tidak di-waive.'
      };
      lead.textContent=leads[mgmtSeat]||leads.ka;
    }
    document.querySelectorAll('[data-mgmt-need]').forEach(function(el){
      var need=el.getAttribute('data-mgmt-need');
      el.hidden = currentRole!=='mgmt' || mgmtSeat!==need;
    });
  }
  var screenRole={beranda:'frontman',transaksi:'frontman',bayar:'frontman',request:'frontman',dokumen:'frontman',cashless:'frontman',tx_hiace:'frontman',tx_raize:'frontman',tx_avanza:'frontman',tx_fortuner:'frontman',spk:'frontman',spk_baru:'frontman',quot:'frontman',so:'frontman',so2:'frontman',proses:'frontman',afi_d:'frontman',do:'frontman',bill_d:'frontman',kirim_d:'frontman',stnk_d:'frontman',booking:'frontman',delivery:'frontman',afi:'frontman',gi:'frontman',digiroom:'cust',admin_book:'admin',admin_spk:'admin',admin_qt:'admin',admin_so:'admin',admin_do:'admin',admin_afi:'admin',admin_bill:'admin',admin_leasing:'admin',admin_kwt:'admin',admin_pay:'admin',admin_tx:'admin',verifikasi:'admin',dashboard:'mgmt',mgmt_inbox:'mgmt',eskalasi:'frontman',exc_alamat:'frontman',exc_nama:'frontman',exc_epo:'frontman',exc_afi:'frontman',exc_stnk:'frontman',shop_home:'cust',shop_akun:'cust',customer:'cust',customer_detail:'cust',order_aksesoris:'cust',order_calya:'cust',bukti_serah:'cust',tagihan_customer:'cust',e_kuitansi:'cust'};
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
    var app=document.querySelector('#mockup .app');
    if(app) app.classList.toggle('cust-shop', currentRole==='cust');
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

/* Filter list pesanan & transaksi */

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


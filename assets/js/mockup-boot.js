(function () {
  var host = document.getElementById('screenHost');
  var parts = [
    'mockup/screens/frontman-home.html',
    'mockup/screens/frontman-budi.html',
    'mockup/screens/frontman-hiace.html',
    'mockup/screens/frontman-raize.html',
    'mockup/screens/dewi-spk.html',
    'mockup/screens/dewi-quot.html',
    'mockup/screens/dewi-so.html',
    'mockup/screens/dewi-flow.html',
    'mockup/screens/digiroom.html',
    'mockup/screens/frontman-delivery.html',
    'mockup/screens/frontman-pay.html',
    'mockup/screens/eskalasi.html',
    'mockup/screens/exc-cases.html',
    'mockup/screens/dokumen.html',
    'mockup/screens/admin-book.html',
    'mockup/screens/admin-queue.html',
    'mockup/screens/mgmt.html',
    'mockup/screens/customer.html',
    'mockup/screens/cashless.html'
  ];
  var bookPanels = [
    'mockup/screens/admin-book/spk.html',
    'mockup/screens/admin-book/qt.html',
    'mockup/screens/admin-book/so.html',
    'mockup/screens/admin-book/do.html',
    'mockup/screens/admin-book/afi.html',
    'mockup/screens/admin-book/bill.html',
    'mockup/screens/admin-book/leasing.html',
    'mockup/screens/admin-book/kwt.html',
    'mockup/screens/admin-book/pay.html'
  ];
  var scripts = [
    'assets/js/mockup-pdf.js',
    'assets/js/mockup-jobs.js',
    'assets/js/mockup-nav.js',
    'assets/js/mockup-book.js',
    'assets/js/mockup-filters.js',
    'assets/js/mockup-exc.js',
    'assets/js/mockup-mgmt.js',
    'assets/js/mockup-draft.js',
    'assets/js/mockup-dewi-proc.js',
    'assets/js/mockup-afi.js',
    'assets/js/mockup-b2b.js',
    'assets/js/mockup-cust.js',
    'assets/js/mockup-pay.js'
  ];
  function get(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error(url + ' ' + r.status);
      return r.text();
    });
  }
  Promise.all(parts.map(get)).then(function (htmls) {
    if (host) host.outerHTML = htmls.join('\n');
    return Promise.all(bookPanels.map(get));
  }).then(function (panels) {
    var mount = document.getElementById('adminBookMount');
    if (mount) mount.outerHTML = panels.join('\n');
    return Promise.all(scripts.map(get));
  }).then(function (codes) {
    var body = codes.map(function (src) {
      return src.replace(/^\/\*[\s\S]*?\*\//, '');
    }).join('\n');
    var el = document.createElement('script');
    el.textContent = '(function(){\n' + body + '\n})();';
    document.body.appendChild(el);
  }).catch(function (err) {
    console.error(err);
    if (host) {
      host.innerHTML = '<p class="hint">Layar tidak termuat. Buka mockup lewat http:// (bukan file://).</p>';
    }
  });
})();

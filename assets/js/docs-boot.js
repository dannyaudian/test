(function () {
  var host = document.getElementById('docsHost');
  var parts = [
    'docs/sections/contoh.html',
    'docs/sections/s1.html',
    'docs/sections/s2.html',
    'docs/sections/d1.html',
    'docs/sections/d2.html',
    'docs/sections/d3.html',
    'docs/sections/d4.html',
    'docs/sections/s3.html',
    'docs/sections/s4.html',
    'docs/sections/s5.html',
    'docs/sections/s6.html',
    'docs/sections/s7.html',
    'docs/sections/s8.html',
    'docs/sections/s9.html'
  ];
  Promise.all(parts.map(function (p) {
    return fetch(p).then(function (r) {
      if (!r.ok) throw new Error(p + ' ' + r.status);
      return r.text();
    });
  })).then(function (htmls) {
    if (host) host.innerHTML = htmls.join('\n');
    function jump() {
      var id = (location.hash || '').replace('#', '');
      var t = id && document.getElementById(id);
      if (t) t.scrollIntoView();
    }
    jump();
    requestAnimationFrame(jump);
    setTimeout(jump, 80);
    var s = document.createElement('script');
    s.src = 'assets/js/main.js';
    s.onload = jump;
    document.body.appendChild(s);
  }).catch(function (err) {
    console.error(err);
    if (host) host.innerHTML = '<p>Dokumentasi tidak termuat. Buka lewat http:// (bukan file://).</p>';
  });
})();

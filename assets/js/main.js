(function () {
  var toggle = document.getElementById('navToggle');
  var side = document.getElementById('sidenav');
  if (toggle && side) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    side.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  var progress = document.querySelector('.read-progress i');
  function updateProgress() {
    if (!progress) return;
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    progress.style.width = (max > 0 ? (doc.scrollTop / max) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  function jumpToId(id) {
    if (!id) return false;
    var t = document.getElementById(id);
    if (!t) return false;
    t.scrollIntoView({ block: 'start' });
    return true;
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.length < 2 || href === '#') return;
    var id = href.slice(1);
    if (!document.getElementById(id)) return;
    e.preventDefault();
    if (history.replaceState) history.replaceState(null, '', href);
    jumpToId(id);
  });
  window.addEventListener('hashchange', function () {
    jumpToId((location.hash || '').replace('#', ''));
  });

  var toc = document.querySelector('#sidenav nav');
  if (!toc) return;
  var links = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]'));
  var map = {};
  links.forEach(function (a) {
    var id = a.getAttribute('href').slice(1);
    if (id) map[id] = a;
  });
  var targets = Object.keys(map).map(function (id) { return document.getElementById(id); }).filter(Boolean);
  function setCurrent() {
    var current = null;
    var best = -Infinity;
    targets.forEach(function (t) {
      var top = t.getBoundingClientRect().top;
      if (top <= 160 && top >= best) {
        best = top;
        current = t.id;
      }
    });
    links.forEach(function (a) { a.removeAttribute('aria-current'); });
    if (current && map[current]) map[current].setAttribute('aria-current', 'true');
  }
  window.addEventListener('scroll', setCurrent, { passive: true });
  setCurrent();
})();

/* Shared: reveal, tilt, nav, mobile sidebars, toasts */

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

window.showToast = function showToast(message) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('visible');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => el.classList.remove('visible'), 2600);
};

const revealEls = document.querySelectorAll('.reveal');
if (prefersReducedMotion()) {
  revealEls.forEach((el) => el.classList.add('visible'));
} else {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add('visible');
    }),
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => observer.observe(el));
}

if (!prefersReducedMotion()) {
  document.querySelectorAll('.tilt').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -14;
      card.style.transform = `perspective(600px) rotateX(${y}deg) rotateY(${x}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

const path = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.navbar__links a').forEach((a) => {
  const href = a.getAttribute('href') || '';
  if (href && path === href) a.classList.add('active');
});

function bindMobileSidebar(sidebar) {
  const toggle = document.getElementById('sidebarToggle');
  const overlay = document.getElementById('sidebarOverlay');
  if (!toggle || !sidebar) return;

  const setOpen = (open) => {
    sidebar.classList.toggle('open', open);
    overlay?.classList.toggle('is-visible', open);
    overlay?.toggleAttribute('hidden', !open);
    toggle.setAttribute('aria-expanded', String(open));
  };

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(!sidebar.classList.contains('open'));
  });

  overlay?.addEventListener('click', () => setOpen(false));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });

  sidebar.querySelectorAll('a, .role-btn').forEach((el) => {
    el.addEventListener('click', () => setOpen(false));
  });

  return { setOpen };
}

const docsSidebar = document.getElementById('docsSidebar') || document.querySelector('.docs-sidebar');
const docsSidebarApi = bindMobileSidebar(docsSidebar);

docsSidebar?.querySelectorAll('.docs-nav a').forEach((link) => {
  link.addEventListener('click', () => docsSidebarApi?.setOpen(false));
});

const docsNav = document.querySelectorAll('.docs-nav a');
if (docsNav.length) {
  const sections = Array.from(docsNav)
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          docsNav.forEach((a) => a.classList.remove('active'));
          const link = document.querySelector(`.docs-nav a[href="#${e.target.id}"]`);
          if (link) link.classList.add('active');
        }
      });
    },
    { rootMargin: '-20% 0px -70% 0px' }
  );
  sections.forEach((s) => sectionObserver.observe(s));
}

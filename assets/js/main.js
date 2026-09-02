/* ===== Shared JS: Reveal animations, tilt effect, sidebar toggle ===== */

// Reveal on scroll
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(
  (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } }),
  { threshold: 0.12 }
);
revealEls.forEach(el => observer.observe(el));

// 3-D tilt on cards
document.querySelectorAll('.tilt').forEach(card => {
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

// Highlight active nav link (strict match)
const path = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.navbar__links a').forEach(a => {
  const href = a.getAttribute('href') || '';
  if (href && path === href) a.classList.add('active');
});

// Docs sidebar toggle (mobile)
const sidebarToggle = document.getElementById('sidebarToggle');
const docsSidebar = document.querySelector('.docs-sidebar');
if (sidebarToggle && docsSidebar) {
  sidebarToggle.addEventListener('click', () => {
    docsSidebar.classList.toggle('open');
  });
  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (docsSidebar.classList.contains('open') &&
        !docsSidebar.contains(e.target) &&
        e.target !== sidebarToggle) {
      docsSidebar.classList.remove('open');
    }
  });
}

// Docs: Highlight active section in sidebar on scroll
const docsNav = document.querySelectorAll('.docs-nav a');
if (docsNav.length) {
  const sections = Array.from(docsNav)
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          docsNav.forEach(a => a.classList.remove('active'));
          const link = document.querySelector(`.docs-nav a[href="#${e.target.id}"]`);
          if (link) link.classList.add('active');
        }
      });
    },
    { rootMargin: '-20% 0px -70% 0px' }
  );
  sections.forEach(s => sectionObserver.observe(s));
}

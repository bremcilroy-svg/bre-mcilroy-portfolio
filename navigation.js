// Enhance the ordinary navigation links; they remain visible without JavaScript.
(() => {
  const nav = document.querySelector('[data-site-nav]');
  const toggle = document.querySelector('[data-nav-toggle]');
  if (!nav || !toggle) return;
  const header = toggle.closest('.header-inner');
  const mobile = window.matchMedia('(max-width: 800px)');
  function setOpen(open, returnFocus = false) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    nav.hidden = mobile.matches && !open;
    if (returnFocus) toggle.focus();
  }
  function syncViewport() {
    toggle.hidden = !mobile.matches;
    setOpen(false);
  }
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', event => {
    if (mobile.matches && event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobile.matches && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false, true);
    }
  });
  document.addEventListener('click', event => {
    if (mobile.matches && !header.contains(event.target)) setOpen(false);
  });
  mobile.addEventListener('change', syncViewport);
  header.classList.add('has-mobile-menu');
  syncViewport();
})();

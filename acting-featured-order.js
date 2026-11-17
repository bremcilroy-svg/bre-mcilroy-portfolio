/* Acting portfolio: featured order 08, 10, 15, 11. Keeps original video IDs. */
(() => {
  const preferred = ['8', '10', '15', '11'];
  const grid = document.querySelector('.acting-grid');
  if (grid) {
    const cards = [...grid.querySelectorAll(':scope > .acting-clip')];
    const byId = id => cards.find(card => card.querySelector(`[data-acting-id="${id}"]`));
    const ordered = [...preferred.map(byId).filter(Boolean), ...cards.filter(card => !preferred.includes(card.querySelector('[data-acting-id]')?.dataset.actingId))];
    grid.replaceChildren(...ordered);
  }
  // Existing viewer JS captures card order when it runs, so this script must load BEFORE acting.js.
  // Use a video still as a graceful fallback where poster images are missing.
  document.querySelectorAll('.acting-play').forEach(link => {
    const img = link.querySelector('img');
    if (!img) return;
    img.addEventListener('error', () => {
      img.hidden = true;
      const preview = document.createElement('video');
      preview.className = 'acting-video-fallback';
      preview.src = link.getAttribute('href') + '#t=0.2';
      preview.preload = 'metadata';
      preview.muted = true;
      preview.playsInline = true;
      preview.setAttribute('aria-hidden', 'true');
      preview.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;pointer-events:none';
      img.after(preview);
    }, {once:true});
    if (img.complete && img.naturalWidth === 0) img.dispatchEvent(new Event('error'));
  });
})();

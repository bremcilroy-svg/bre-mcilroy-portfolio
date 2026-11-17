/* Acting portfolio display order: original 08,10,15,11 become 01–04.
   Original file names/IDs stay unchanged for playback. Load before acting.js. */
(() => {
  'use strict';
  const grid = document.querySelector('.acting-grid');
  const featured = document.querySelector('.acting-feature-grid');
  if (!grid || !featured) return;
  const priority = ['8', '10', '15', '11'];
  const cards = [...grid.querySelectorAll(':scope > .acting-clip')];
  const idOf = card => card.querySelector('[data-acting-id]')?.dataset.actingId;
  const selected = priority.map(id => cards.find(card => idOf(card) === id)).filter(Boolean);
  const remaining = cards.filter(card => !priority.includes(idOf(card)) && idOf(card) !== '1');
  const originalOne = cards.find(card => idOf(card) === '1');
  const ordered = [...selected, ...remaining, ...(originalOne ? [originalOne] : [])];
  grid.replaceChildren(...ordered);

  function displayNumber(card, number) {
    const link = card.querySelector('[data-acting-id]');
    if (!link) return;
    const label = `Performance ${String(number).padStart(2, '0')}`;
    const heading = card.querySelector('.acting-clip-caption h3');
    if (heading) heading.textContent = label;
    link.dataset.actingTitle = label;
    const duration = card.querySelector('.acting-duration')?.textContent?.trim() || '';
    link.setAttribute('aria-label', `Watch ${label}${duration ? ', ' + duration : ''}`);
    const img = link.querySelector('img');
    if (img) img.alt = `Preview of Bre Lynn in ${label}.`;
  }
  ordered.forEach((card, i) => displayNumber(card, i + 1));

  // Copy the first four gallery cards into the featured section. Keep data-acting-id
  // as original clip identity, so the existing player continues to load correct files.
  featured.replaceChildren(...selected.map(card => {
    const copy = card.cloneNode(true);
    copy.classList.add('acting-feature-clip');
    return copy;
  }));

  // Video stills for broken preview JPEGs (on both gallery and featured cards).
  document.querySelectorAll('.acting-play').forEach(link => {
    const img = link.querySelector('img');
    if (!img) return;
    let replaced = false;
    const fallback = () => {
      if (replaced) return;
      replaced = true;
      img.hidden = true;
      const video = document.createElement('video');
      video.className = 'acting-video-fallback';
      video.src = link.getAttribute('href') + '#t=0.2';
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      video.setAttribute('aria-hidden', 'true');
      video.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;pointer-events:none';
      img.after(video);
    };
    img.addEventListener('error', fallback, { once: true });
    if (img.complete && img.naturalWidth === 0) fallback();
  });
})();

/* Temporary privacy safeguard for the public photography gallery.
   Remove these six candidate child portraits from the DOM before the gallery initializes.
   This is NOT a substitute for deleting the JPG files from GitHub. */
(() => {
  'use strict';
  const remove = new Set(['7','13','15','58','59','61']);
  const grid = document.querySelector('.photo-grid');
  if (!grid) return;
  grid.querySelectorAll('.photo-item').forEach(card => {
    const id = card.querySelector('[data-photo-id]')?.getAttribute('data-photo-id');
    if (remove.has(id)) card.remove();
  });
  const count = grid.querySelectorAll('.photo-item').length;
  const counter = document.querySelector('[data-photo-count]');
  if (counter) counter.textContent = `${count} photographs · All collections`;
  document.querySelectorAll('[data-photo-filter="milestones"]').forEach(btn => {
    btn.textContent = 'Family & Milestones';
  });
})();

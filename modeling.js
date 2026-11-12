// Bre Lynn's public portfolio. No uploads, private records, or browser storage.
(() => {
  const grid = document.querySelector('.model-grid');
  if (!grid) return;
  const figures = Array.from(grid.querySelectorAll('.model-item'));
  const links = figures.map(figure => figure.querySelector('[data-model-id]'));
  const filters = Array.from(document.querySelectorAll('[data-model-filter]'));
  const count = document.querySelector('[data-model-count]');
  const dialog = document.querySelector('.model-dialog');
  const image = dialog.querySelector('[data-model-viewer-image]');
  const error = dialog.querySelector('[data-model-image-error]');
  const heading = dialog.querySelector('#model-viewer-title');
  const category = dialog.querySelector('[data-model-viewer-category]');
  const position = dialog.querySelector('[data-model-viewer-position]');
  let activeLinks = links;
  let index = 0;
  let opener;
  let previousOverflow;

  function filterCollection(value) {
    figures.forEach(figure => { figure.hidden = value !== 'all' && figure.dataset.modelCategory !== value; });
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.modelFilter === value)));
    activeLinks = links.filter(link => !link.closest('.model-item').hidden);
    const button = filters.find(item => item.dataset.modelFilter === value);
    const label = button.childNodes[0].textContent.trim();
    count.textContent = `${activeLinks.length} ${activeLinks.length === 1 ? 'image' : 'images'} · ${label}`;
  }
  document.querySelector('.model-filters').hidden = false;
  filters.forEach(button => button.addEventListener('click', () => filterCollection(button.dataset.modelFilter)));
  if (typeof dialog.showModal !== 'function') return;

  function showImage(nextIndex) {
    index = (nextIndex + activeLinks.length) % activeLinks.length;
    const link = activeLinks[index];
    const figure = link.closest('.model-item');
    error.hidden = true;
    image.alt = link.querySelector('img').alt;
    image.src = link.href;
    heading.textContent = figure.querySelector('figcaption > span').textContent;
    category.textContent = figure.querySelector('figcaption > small').textContent;
    position.textContent = `${index + 1} of ${activeLinks.length}`;
  }
  image.addEventListener('error', () => { error.hidden = false; });
  document.querySelectorAll('[data-model-id]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      let nextIndex = activeLinks.findIndex(item => item.dataset.modelId === link.dataset.modelId);
      if (nextIndex < 0) {
        filterCollection('all');
        nextIndex = activeLinks.findIndex(item => item.dataset.modelId === link.dataset.modelId);
      }
      opener = link;
      showImage(nextIndex);
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      dialog.showModal();
      dialog.querySelector('[data-model-close]').focus();
    });
  });
  dialog.querySelector('[data-model-close]').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-model-prev]').addEventListener('click', () => showImage(index - 1));
  dialog.querySelector('[data-model-next]').addEventListener('click', () => showImage(index + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); showImage(index - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showImage(index + 1); }
  });
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    if (opener?.isConnected) opener.focus();
  });
})();

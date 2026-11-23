document.querySelectorAll("[data-print]").forEach(button => button.addEventListener("click", () => window.print()));

const musicSearch = document.querySelector('[data-music-search]');
if (musicSearch) {
  const input = document.querySelector('#song-search');
  const cards = Array.from(document.querySelectorAll('[data-song]'));
  const count = document.querySelector('#song-count');
  const empty = document.querySelector('[data-no-songs]');
  const normalize = value => value.toLowerCase().replace(/[’']/g, '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  const filter = () => {
    const query = normalize(input.value.trim());
    let visible = 0;
    for (const card of cards) {
      const matches = normalize(card.dataset.search).includes(query);
      card.hidden = !matches;
      if (matches) visible++;
    }
    count.textContent = `${visible} ${visible === 1 ? 'song' : 'songs'}${query ? ' found' : ''}`;
    empty.hidden = visible !== 0;
  };
  musicSearch.hidden = false;
  input.addEventListener('input', filter);
  document.querySelector('[data-clear-search]').addEventListener('click', () => {
    input.value = '';
    filter();
    input.focus();
  });
}

// Bre Lynn Photography — progressive enhancement; image links work without JS.
const photoGrid = document.querySelector('.photo-grid');
if (photoGrid) {
  const figures = Array.from(photoGrid.querySelectorAll('.photo-item'));
  const photoLinks = Array.from(photoGrid.querySelectorAll('[data-gallery-photo]'));
  const filters = Array.from(document.querySelectorAll('[data-photo-filter]'));
  const counter = document.querySelector('[data-photo-count]');
  const filterGroup = document.querySelector('.photo-filters');
  const dialog = document.querySelector('.photo-dialog');
  const image = dialog.querySelector('[data-viewer-image]');
  const title = dialog.querySelector('#photo-viewer-title');
  const category = dialog.querySelector('[data-viewer-category]');
  const position = dialog.querySelector('[data-viewer-position]');
  const directLink = dialog.querySelector('[data-viewer-link]');
  const imageError = dialog.querySelector('[data-viewer-error]');
  let currentItems = photoLinks;
  let currentIndex = 0;
  let opener = null;
  let savedOverflow = '';

  function applyFilter(value) {
    for (const figure of figures) figure.hidden = value !== 'all' && figure.dataset.photoCategory !== value;
    for (const button of filters) button.setAttribute('aria-pressed', String(button.dataset.photoFilter === value));
    currentItems = photoLinks.filter(link => !link.closest('.photo-item').hidden);
    const active = filters.find(button => button.dataset.photoFilter === value);
    const label = value === 'all' ? 'All collections' : active.textContent;
    counter.textContent = `${currentItems.length} ${currentItems.length === 1 ? 'photograph' : 'photographs'} · ${label}`;
  }

  filterGroup.hidden = false;
  for (const button of filters) button.addEventListener('click', () => applyFilter(button.dataset.photoFilter));

  if (typeof dialog.showModal === 'function') {
    function displayPhoto(index) {
      currentIndex = (index + currentItems.length) % currentItems.length;
      const link = currentItems[currentIndex];
      const sourceImage = link.querySelector('img');
      imageError.hidden = true;
      image.alt = sourceImage.alt;
      image.src = link.href;
      title.textContent = link.dataset.photoTitle;
      category.textContent = link.dataset.photoCategoryLabel;
      position.textContent = `${currentIndex + 1} of ${currentItems.length} · Photography by Bre McIlroy`;
      directLink.href = link.href;
    }
    image.addEventListener('error', () => { imageError.hidden = false; });
    for (const link of document.querySelectorAll('[data-gallery-photo]')) {
      link.addEventListener('click', event => {
        // Preserve opening a normal image link with Ctrl/Cmd or a new-tab gesture.
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        opener = link;
        let index = currentItems.findIndex(item => item.dataset.photoId === link.dataset.photoId);
        if (index < 0) { applyFilter('all'); index = currentItems.findIndex(item => item.dataset.photoId === link.dataset.photoId); }
        displayPhoto(index);
        savedOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        dialog.showModal();
        dialog.querySelector('[data-photo-close]').focus();
      });
    }
    dialog.querySelector('[data-photo-close]').addEventListener('click', () => dialog.close());
    dialog.querySelector('[data-photo-prev]').addEventListener('click', () => displayPhoto(currentIndex - 1));
    dialog.querySelector('[data-photo-next]').addEventListener('click', () => displayPhoto(currentIndex + 1));
    dialog.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); displayPhoto(currentIndex - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); displayPhoto(currentIndex + 1); }
    });
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => {
      document.body.style.overflow = savedOverflow;
      if (opener) opener.focus();
    });
  }
}

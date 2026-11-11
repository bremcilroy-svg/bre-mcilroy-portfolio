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

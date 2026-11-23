const extras = document.createElement('div');
extras.id = 'vault-room-extras';
extras.innerHTML = '<button type="button" class="vault-extras-toggle" aria-expanded="false" aria-controls="vault-extras-content">Room extras</button><div id="vault-extras-content"></div>';
document.body.append(extras);

const toggle = extras.querySelector('button');
const content = extras.querySelector('#vault-extras-content');
const extrasSelector = [
  '#pv11-journey', '#vu-launch', '#pv-castle-whisper',
  '.aca-heart-reverie', '.aca-moonlit-reflection', '.aca-owl-trail', '.aca-sunrise-glass'
].join(',');

function collectExtras() {
  const entries = document.body.querySelectorAll(':scope > :is(' + extrasSelector + ')');
  if (entries.length) content.append(...entries);
}

function setExpanded(expanded) {
  toggle.setAttribute('aria-expanded', String(expanded));
}

toggle.addEventListener('click', () => setExpanded(toggle.getAttribute('aria-expanded') !== 'true'));
extras.addEventListener('keydown', event => {
  if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true' && toggle.offsetWidth) {
    setExpanded(false);
    toggle.focus();
  }
});
document.addEventListener('pointerdown', event => {
  if (!extras.contains(event.target)) setExpanded(false);
});

collectExtras();
new MutationObserver(collectExtras).observe(document.body, { childList: true });

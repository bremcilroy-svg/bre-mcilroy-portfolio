const gate = document.querySelector('#academy-gate');
const scene = document.querySelector('.sky');
const letter = document.querySelector('#academy-letter');
const status = document.querySelector('#academy-gate-status');
const send = document.querySelector('#academy-letter-send');
const close = document.querySelector('#academy-letter-close');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let delivering = false;
let timer;

function openLetter() {
  if (delivering || letter.open) return;
  letter.showModal();
  send.focus();
}

function sealLetter() {
  if (delivering) return;
  delivering = true;
  letter.classList.add('is-sealing');
  close.disabled = send.disabled = true;
  timer = window.setTimeout(() => {
    letter.close();
    scene.classList.add('is-delivering');
    status.textContent = 'Gizmo’s pawprints light the way to the castle.';
    timer = window.setTimeout(() => location.assign(gate.href), reducedMotion.matches ? 400 : 2780);
  }, reducedMotion.matches ? 0 : 620);
}

gate.addEventListener('click', event => {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  openLetter();
});
close.addEventListener('click', sealLetter);
send.addEventListener('click', sealLetter);
letter.addEventListener('cancel', event => {
  event.preventDefault();
  sealLetter();
});
window.addEventListener('pageshow', event => {
  if (!event.persisted) return;
  window.clearTimeout(timer);
  delivering = false;
  scene.classList.remove('is-delivering');
  letter.classList.remove('is-sealing');
  close.disabled = send.disabled = false;
  status.textContent = '';
});

if (location.hash === '#welcome') {
  history.replaceState(history.state, '', location.pathname + location.search);
  openLetter();
}

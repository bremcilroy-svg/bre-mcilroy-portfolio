// Phase 3 is a progressive enhancement. It never changes game or owner authorization.
const $ = selector => document.querySelector(selector);
const scene = $('#living-scene');
const message = $('#living-message');
const puzzle = $('#living-puzzle');
const status = $('#living-puzzle-status');
const reward = $('#living-reward');
const input = $('#living-answer');
const room = $('#room');
const key = 'poetry-vault-living-library-v3';
const allowed = () => room && !room.hidden;
let lantern = false;
let walking = false;
let solved = false;
try { solved = localStorage.getItem(key) === 'unlocked'; } catch {}
function say(s) { if (allowed()) message.textContent = s; }
function showReward() { reward.hidden = false; puzzle.hidden = true; scene.classList.add('secret-open'); }
if (solved) showReward();
$('#living-lantern').addEventListener('click', () => {
  if (!allowed()) return;
  lantern = !lantern;
  scene.classList.toggle('lantern-lit', lantern);
  $('#living-lantern').setAttribute('aria-pressed', String(lantern));
  say(lantern ? 'In the warm light, five books shimmer. Their spines spell a promise: every voice matters.' : 'The lantern dims, and moonlight returns to the shelves.');
});
$('#living-whisper').addEventListener('click', () => {
  if (!allowed()) return;
  say('A whisper from the shelf: “The keeper of this library has four paws. Speak his name.”');
  puzzle.hidden = false;
  input.focus();
});
$('#living-drawer').addEventListener('click', () => {
  if (!allowed()) return;
  if (solved) { say('The drawer is open. Its secret belongs to every curious reader.'); showReward(); return; }
  puzzle.hidden = false;
  say('A tiny brass plate reads: “Only the guardian’s name will turn this key.”');
  input.focus();
});
$('#living-gizmo-walk').addEventListener('click', () => {
  if (!allowed() || walking) return;
  walking = true;
  scene.classList.remove('gizmo-crossing');
  void scene.offsetWidth;
  scene.classList.add('gizmo-crossing');
  say('Gizmo pads across the study, pauses by the drawer, and gives you a knowing blink.');
  setTimeout(() => { walking = false; scene.classList.remove('gizmo-crossing'); }, 2600);
});
function unlock() {
  if (!allowed()) return;
  if (input.value.trim().toLocaleLowerCase() === 'gizmo') {
    solved = true;
    try { localStorage.setItem(key, 'unlocked'); } catch {}
    status.textContent = 'The key turns. The drawer opens!';
    say('You found the Keeper’s Secret. Gizmo approves.');
    showReward();
  } else { status.textContent = 'The lock does not turn. Remember the guardian with four paws.'; }
}
$('#living-unlock').addEventListener('click', unlock);
input.addEventListener('keydown', event => { if (event.key === 'Enter') unlock(); });
$('#living-reset').addEventListener('click', () => {
  if (!allowed()) return;
  solved = false;
  try { localStorage.removeItem(key); } catch {}
  reward.hidden = true; puzzle.hidden = true; status.textContent = ''; input.value = '';
  scene.classList.remove('secret-open');
  say('The drawer closes softly. Its secret can be discovered again.');
});

/* Phase 6.2 — Gizmo Comes Alive. Additive: does not change auth, puzzles or saved data. */
(() => {
  const room = document.querySelector('#room');
  const scene = document.querySelector('#author-immersive');
  if (!room || !scene || document.querySelector('#ai62-controls')) return;
  const stage = scene.querySelector('.ai6-stage');
  const world = scene.querySelector('.ai6-world');
  const cat = scene.querySelector('.ai6-cat');
  const prompt = scene.querySelector('#ai6-prompt');
  const actions = scene.querySelector('.ai6-actions');
  if (!stage || !world || !cat || !prompt || !actions) return;
  scene.classList.add('ai62-active');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const controls = document.createElement('div');
  controls.id = 'ai62-controls';
  controls.className = 'ai62-controls';
  controls.setAttribute('aria-label', 'Gizmo activities');
  controls.innerHTML = '<button type="button" data-ai62="greet">🐾 Welcome home</button><button type="button" data-ai62="fetch">🐭 Throw mouse</button><button type="button" data-ai62="shelf">📚 Investigate shelf</button><button type="button" data-ai62="bed">🔥 Curl up by fire</button><button type="button" data-ai62="wake">☀ Wake Gizmo</button>';
  actions.append(controls);
  const mouse = document.createElement('span');
  mouse.className = 'ai62-mouse';
  mouse.textContent = '🐭';
  mouse.setAttribute('aria-hidden', 'true');
  world.append(mouse);
  const status = document.createElement('p');
  status.className = 'ai62-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.textContent = 'Gizmo is ready for an adventure. His favorite place is beside the fireplace.';
  controls.after(status);
  const buttons = [...controls.querySelectorAll('button')];
  const setStatus = text => { status.textContent = text; prompt.textContent = text; };
  const wait = ms => new Promise(resolve => window.setTimeout(resolve, reduced ? 0 : ms));
  let busy = false, sleeping = false, token = 0;
  function locate(x, y, duration = 950) {
    cat.style.setProperty('--ai62-left', x + '%');
    cat.style.setProperty('--ai62-bottom', y + '%');
    cat.style.setProperty('--ai62-speed', reduced ? '0ms' : duration + 'ms');
  }
  function setSleeping(value) {
    sleeping = value;
    cat.classList.toggle('ai62-sleeping', value);
  }
  function toggleBusy(value) {
    busy = value;
    buttons.forEach(b => b.disabled = value);
  }
  // The Phase 6.1 follow/nap buttons remain usable. Avoid competing animations.
  function stopFollow() {
    const follow = scene.querySelector('#ai61-follow');
    if (follow?.getAttribute('aria-pressed') === 'true') follow.click();
  }
  async function play(kind) {
    if (busy || room.hidden) return;
    toggleBusy(true);
    const run = ++token;
    try {
      if (kind === 'greet') {
        stopFollow(); setSleeping(false);
        locate(48, 15, 650);
        cat.classList.add('ai62-happy');
        setStatus('Gizmo runs to greet you! “You found my home. I knew you could do it!” ♡');
        await wait(1100);
        cat.classList.remove('ai62-happy');
      } else if (kind === 'fetch') {
        stopFollow(); setSleeping(false);
        mouse.classList.add('ai62-thrown');
        setStatus('Mouse spotted! Chief Gizmo is on the case!');
        await wait(350);
        cat.classList.add('ai62-running');
        locate(77, 16, 950);
        await wait(1050);
        mouse.classList.add('ai62-caught');
        setStatus('Caught it! Gizmo is bringing his mouse back.');
        locate(45, 15, 950);
        await wait(1050);
        mouse.classList.remove('ai62-thrown', 'ai62-caught');
        cat.classList.remove('ai62-running');
        setStatus('Good catch, Chief Gizmo! Throw it again whenever you like.');
      } else if (kind === 'shelf') {
        stopFollow(); setSleeping(false);
        cat.classList.add('ai62-running');
        locate(21, 21, 1050);
        setStatus('Gizmo trots toward the bookshelf to investigate.');
        await wait(1150);
        cat.classList.remove('ai62-running');
        setStatus('Gizmo sniffs the oldest books. “I think these stories know you.”');
      } else if (kind === 'bed') {
        stopFollow(); setSleeping(false);
        locate(82, 21, 1100);
        setStatus('Gizmo heads for his warm bed by the fireplace…');
        await wait(1150);
        setSleeping(true);
        setStatus('Gizmo curls up beside the fireplace. Home at last. ♡');
      } else if (kind === 'wake') {
        setSleeping(false);
        cat.classList.add('ai62-happy');
        setStatus('Gizmo wakes, stretches, and blinks his golden-green eyes.');
        await wait(750);
        cat.classList.remove('ai62-happy');
      }
    } finally {
      if (run === token) toggleBusy(false);
    }
  }
  controls.addEventListener('click', e => {
    const button = e.target.closest('button[data-ai62]');
    if (button) void play(button.dataset.ai62);
  });
  // Preserve Phase 6.1 interactions: if its follow/nap is used, clear our sleep pose.
  scene.querySelector('#ai61-follow')?.addEventListener('click', () => {setSleeping(false);});
  scene.querySelector('#ai61-nap')?.addEventListener('click', () => {setSleeping(false);});
  scene.querySelector('#ai6-reset')?.addEventListener('click', () => {
    if (!busy) {setSleeping(false); locate(58, 10, 550);}
  });
  // No perpetual animation loop, network calls, or writes to localStorage/Supabase.
  locate(58, 10, 0);
})();

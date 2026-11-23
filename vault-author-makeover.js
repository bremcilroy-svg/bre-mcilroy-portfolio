/* Phase 6.3 — mobile-first room makeover. Additive, no authentication or game state changes. */
(() => {
  const room = document.querySelector('#room');
  const scene = document.querySelector('#author-immersive');
  if (!room || !scene || document.querySelector('#ai63-tools')) return;
  const stage = scene.querySelector('.ai6-stage');
  const actions = scene.querySelector('.ai6-actions');
  const movement = scene.querySelector('.ai6-movement');
  const gizmoControls = scene.querySelector('#ai62-controls');
  if (!stage || !actions || !movement || !gizmoControls) return;
  scene.classList.add('ai63-ready');

  // Preserve all original button elements and event listeners when moving them.
  const tools = document.createElement('details');
  tools.id = 'ai63-tools';
  tools.className = 'ai63-tools';
  tools.innerHTML = '<summary>🐾 Gizmo’s activities <span class="ai63-summary-hint">Tap to open or close</span></summary><div class="ai63-tools-content"></div>';
  const contents = tools.querySelector('.ai63-tools-content');
  const follow = scene.querySelector('.ai61-cat-controls');
  if (follow) contents.append(follow);
  contents.append(gizmoControls);
  const status = scene.querySelector('.ai62-status');
  if (status) contents.append(status);
  scene.querySelector('.ai6-toolbar')?.insertAdjacentElement('afterend', tools);

  // A small set of quick actions makes the original content easier to find.
  const quick = document.createElement('nav');
  quick.className = 'ai63-quick';
  quick.setAttribute('aria-label', 'Explore more of the author’s room');
  quick.innerHTML = '<button type="button" data-ai63-go="journal">✒ Author’s Journal</button><button type="button" data-ai63-go="books">📚 The Book Collection</button><button type="button" data-ai63-go="gizmo">🐾 Gizmo’s Activities</button>';
  tools.insertAdjacentElement('afterend', quick);
  quick.addEventListener('click', e => {
    const button = e.target.closest('[data-ai63-go]');
    if (!button) return;
    const key = button.dataset.ai63Go;
    if (key === 'gizmo') {
      tools.open = true;
      tools.scrollIntoView({behavior: reduce() ? 'auto' : 'smooth', block: 'center'});
      return;
    }
    const target = key === 'journal' ? room.querySelector('.journal-invitation') : room.querySelector('#bookshelf');
    target?.scrollIntoView({behavior: reduce() ? 'auto' : 'smooth', block: 'start'});
  });

  // Extra atmosphere: all decorative, never blocks existing furniture hotspots.
  const world = scene.querySelector('.ai6-world');
  if (world) {
    const light = document.createElement('div');
    light.className = 'ai63-firelight';
    light.setAttribute('aria-hidden','true');
    world.append(light);
    const carpet = document.createElement('div');
    carpet.className = 'ai63-carpet';
    carpet.setAttribute('aria-hidden','true');
    world.append(carpet);
  }
  const intro = document.createElement('p');
  intro.className = 'ai63-help';
  intro.textContent = 'Explore with the arrows, tap glowing furniture, or open Gizmo’s activities below. Your original discoveries remain available.';
  scene.querySelector('.ai6-heading')?.append(intro);

  // Keep the roaming companion pill away from the on-screen controls on phones.
  // No changes to the guide script or its click handlers.
  function reduce() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  // Accessible hint for touch users without interfering with stage swipe movement.
  stage.setAttribute('aria-description','Use the movement buttons below or swipe inside the scene. Tap a glowing object to inspect it.');
})();

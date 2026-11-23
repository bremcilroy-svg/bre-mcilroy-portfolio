const view = document.querySelector('main .atmosphere-scene')
  || document.querySelector('body.academy-stone-scene:not(.academy-scene-observatory) main');

if (view) {
  const scenery = document.createElement('div');
  scenery.className = 'academy-view-photo';
  scenery.setAttribute('aria-hidden', 'true');
  view.prepend(scenery);
  view.classList.add('academy-look-view');

  const controls = document.createElement('div');
  controls.className = 'academy-view-controls';
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', 'Look around the castle room');
  controls.innerHTML = '<button type="button" data-look="-1">Look left</button><button type="button" data-look="0">Center view</button><button type="button" data-look="1">Look right</button>';
  if (view.matches('main')) view.append(controls);
  else view.after(controls);

  let offset = 0;
  let drag = null;
  function look(value) {
    offset = Math.max(-13, Math.min(13, value));
    view.style.setProperty('--castle-look-x', offset + '%');
  }

  controls.addEventListener('click', event => {
    const button = event.target.closest('button[data-look]');
    if (!button) return;
    const direction = Number(button.dataset.look);
    look(direction ? offset - direction * 6.5 : 0);
  });
  view.addEventListener('pointerdown', event => {
    // A walkable room owns pointer capture on its canvas; do not let this
    // background-pan listener replace capture on the 3D interaction surface.
    if (event.target.closest('#great-hall-3d-canvas, #moonlit-courtyard-3d-canvas')) return;
    if (event.button !== 0 || event.target.closest('a, button, input, label, select, textarea')) return;
    drag = { id: event.pointerId, x: event.clientX, offset };
    view.setPointerCapture(event.pointerId);
  });
  view.addEventListener('pointermove', event => {
    if (drag?.id === event.pointerId) look(drag.offset + (event.clientX - drag.x) * .07);
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    view.addEventListener(type, event => {
      if (drag?.id === event.pointerId) drag = null;
    });
  }
}

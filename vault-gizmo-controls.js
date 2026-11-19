const companion = document.querySelector('#pv-gizmo-companion');
if (companion) {
  const controls = document.createElement('div');
  controls.className = 'pvg-controls';
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', 'Gizmo controls');
  companion.append(controls);

  const buttons = '.pvg-rest, .pvg-sound, .pvg-recordings, .pvg-call, .pvg-mirror-call';
  function collectControls() {
    controls.append(...companion.querySelectorAll(':scope > :is(' + buttons + ')'));
  }

  collectControls();
  // The Heart Chamber and Mirror each add their own Call button after startup.
  new MutationObserver(collectControls).observe(companion, { childList: true });
}

/* Phase 4.1: Sir Gizmo's Watch Cat Patrol. Additive: no auth or Supabase changes. */
(() => {
  const room = document.querySelector('#room');
  if (!room || document.querySelector('#gizmo-watchcat')) return;
  const host = document.createElement('section');
  host.id = 'gizmo-watchcat';
  host.className = 'gizmo-watchcat';
  host.setAttribute('aria-label', 'Sir Gizmo watch cat games');
  host.innerHTML = `<div class="gw-head"><div><p class="eyebrow">PHASE 4.1 · SECURITY PATROL</p><h3>Sir Gizmo, Chief of Vault Security <span aria-hidden="true">🐾</span></h3><p>All visitors must pass the sniff inspection.</p></div><span class="gw-badge">✦ CHIEF GIZMO ✦</span></div>
    <div class="gw-stage" aria-label="Gizmo's play and patrol area"><div class="gw-shelf" aria-hidden="true">▥ &nbsp; ▤ &nbsp; ▥ &nbsp; ▤</div><div class="gw-mouse" aria-hidden="true">🐭</div><div class="gw-cat" role="img" aria-label="Gizmo, a gray and white cat with two gray spots beside his mouth"><div class="gw-cat-art"></div><span class="gw-collar">✦</span></div><div class="gw-floor"></div></div>
    <div class="gw-controls"><button type="button" data-gw="fetch">🐭 Throw the mouse</button><button type="button" data-gw="treat">🐟 Give a treat</button><button type="button" data-gw="patrol">🛡️ Patrol shelves</button><button type="button" data-gw="follow" aria-pressed="false">🐾 Follow me: Off</button><button type="button" data-gw="rest">☾ Rest</button></div>
    <p class="gw-message" role="status" aria-live="polite">Security status: on duty. Suspicious mice: 1.</p><p class="gw-count">Successful fetches: <strong id="gw-fetch-count">0</strong> · Treats enjoyed: <strong id="gw-treat-count">0</strong></p>`;
  const phase4 = room.querySelector('#gizmos-enchanted-library');
  if (phase4) phase4.insertAdjacentElement('afterend', host); else room.append(host);
  const stage = host.querySelector('.gw-stage');
  const cat = host.querySelector('.gw-cat');
  const mouse = host.querySelector('.gw-mouse');
  const art = host.querySelector('.gw-cat-art');
  const message = host.querySelector('.gw-message');
  const fetchCount = host.querySelector('#gw-fetch-count');
  const treatCount = host.querySelector('#gw-treat-count');
  const followButton = host.querySelector('[data-gw="follow"]');
  const source = phase4?.querySelector('.phase4-cat');
  if (source) {
    const svg = source.cloneNode(true);
    svg.removeAttribute('id');
    svg.removeAttribute('data-mood');
    svg.classList.remove('phase4-cat');
    svg.classList.add('gw-svg');
    svg.setAttribute('aria-hidden', 'true');
    // The original detailed SVG preserves Gizmo's two gray muzzle markings.
    art.append(svg);
  } else {
    art.textContent = '🐈';
    art.setAttribute('aria-hidden', 'true');
  }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let busy = false, follow = false, fetches = 0, treats = 0, position = 10;
  const delay = ms => new Promise(resolve => window.setTimeout(resolve, reduced ? 0 : ms));
  function move(to, duration = 900) {
    position = Math.max(5, Math.min(83, to));
    cat.style.transitionDuration = reduced ? '0ms' : `${duration}ms`;
    cat.style.left = `${position}%`;
  }
  async function action(kind) {
    if (busy || room.hidden) return;
    if (kind === 'follow') {
      follow = !follow;
      followButton.setAttribute('aria-pressed', String(follow));
      followButton.textContent = `🐾 Follow me: ${follow ? 'On' : 'Off'}`;
      message.textContent = follow ? 'Gizmo is ready to follow your pointer inside his play corner.' : 'Gizmo returns to guarding his shelves.';
      return;
    }
    busy = true;
    host.classList.add('gw-busy');
    try {
      if (kind === 'fetch') {
        mouse.classList.add('gw-thrown');
        message.textContent = 'Mouse spotted! Gizmo is on the case!';
        await delay(350); move(78, 1000); cat.classList.add('gw-running');
        await delay(1100); mouse.classList.add('gw-caught');
        message.textContent = 'Gizmo caught the mouse! Bringing it back…';
        move(10, 1100); await delay(1200);
        cat.classList.remove('gw-running'); mouse.classList.remove('gw-thrown', 'gw-caught');
        fetchCount.textContent = String(++fetches);
        message.textContent = `Good catch, Chief Gizmo! ${fetches} successful ${fetches === 1 ? 'fetch' : 'fetches'}. Throw it again!`;
      } else if (kind === 'treat') {
        message.textContent = 'A tasty treat for the hardest-working watch cat!';
        move(46, 700); await delay(800);
        cat.classList.add('gw-eating'); await delay(850); cat.classList.remove('gw-eating');
        treatCount.textContent = String(++treats);
        message.textContent = 'Crunch crunch! Gizmo approves. Security inspection complete.';
      } else if (kind === 'patrol') {
        message.textContent = 'Chief Gizmo is inspecting the suspicious bookshelves…';
        move(78, 1100); await delay(1200); move(28, 950); await delay(1000);
        message.textContent = 'Patrol complete. No intruders, just one very suspicious toy mouse.';
      } else if (kind === 'rest') {
        move(13, 650); await delay(700); cat.classList.add('gw-napping');
        message.textContent = 'The Chief is on a well-earned catnap. Tap another activity to wake him.';
      }
    } finally { busy = false; host.classList.remove('gw-busy'); }
  }
  host.querySelectorAll('[data-gw]').forEach(button => button.addEventListener('click', () => {
    if (busy) return;
    cat.classList.remove('gw-napping');
    void action(button.dataset.gw);
  }));
  stage.addEventListener('pointermove', event => {
    if (!follow || busy || room.hidden || event.pointerType === 'touch') return;
    const bounds = stage.getBoundingClientRect();
    move(((event.clientX - bounds.left) / bounds.width) * 100 - 8, 500);
  });
  // No timers or movement run while the visitor is on another page.
})();

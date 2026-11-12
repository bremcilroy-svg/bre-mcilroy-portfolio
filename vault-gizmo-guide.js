/* Phase 5 — Gizmo's Journey Home. Additive UI; never changes puzzle, gate, or Supabase state. */
(() => {
  'use strict';
  if (document.querySelector('#gizmo-guide')) return;
  const filename = location.pathname.split('/').pop() || 'poetry-vault-entrance.html';
  const chapters = [
    ['poetry-vault-entrance.html','The Entrance','Our journey begins here. Four chambers stand between us and home.','Choose the first chamber when you are ready.'],
    ['poetry-vault.html','The Heart Chamber','I hear memories whispering between these walls.','Look closely at the objects around you. Every detail might matter.'],
    ['poetry-vault-mirror.html','The Shattered Mirror','Some reflections hold more than they show.','Inspect what is broken, and notice what changes when you interact.'],
    ['poetry-vault-labyrinth.html','The Midnight Labyrinth','Stay close. We can find our way through the dark.','Observe the room carefully. A pattern may guide your next step.'],
    ['poetry-vault-dawn.html','The Door to Tomorrow','I can almost smell the sunlit pages of home.','Use the clues you have gathered, and take your time.'],
    ['poetry-vault-society.html','The Keepers’ Hall','The Keepers know the path. We must earn their trust.','Check your seals and discoveries before approaching the Fifth Door.'],
    ['poetry-vault-fifth-door.html','The Fifth Door','One more door. My favorite cushion is waiting beyond it.','The final challenge draws on what you have learned in your journey.'],
    ['poetry-vault-author-room.html','The Author’s Hidden Room','You found my home! Now, would you mind throwing my mouse?','Explore the author’s room, or visit my play corner for fetch and treats.']
  ];
  const index = chapters.findIndex(x => x[0] === filename);
  if (index < 0) return;
  const home = index === chapters.length - 1;
  const key = 'bre-poetry-vault-gizmo-guide-v1';
  let visited = [];
  try { const raw = JSON.parse(localStorage.getItem(key) || '{}'); visited = Array.isArray(raw.visited) ? raw.visited.filter(x => chapters.some(c => c[0] === x)) : []; } catch {}
  const room = document.querySelector('#room');
  const gate = document.querySelector('#gate');
  const authorizedHome = () => !home || (!!room && !room.hidden && (!gate || gate.hidden));
  const widget = document.createElement('aside');
  widget.id = 'gizmo-guide';
  widget.className = 'gg-guide';
  widget.setAttribute('aria-label','Gizmo, your escape room guide');
  widget.innerHTML = `<button type="button" class="gg-toggle" aria-expanded="false" aria-controls="gg-panel" aria-label="Talk to Gizmo, your guide">🐾 <span>Gizmo</span></button>
    <section class="gg-panel" id="gg-panel" hidden>
      <div class="gg-heading"><span class="gg-kicker">CHIEF GIZMO · YOUR GUIDE</span><button class="gg-close" type="button" aria-label="Close Gizmo guide">×</button></div>
      <div class="gg-character" aria-hidden="true"><svg viewBox="0 0 150 138" role="presentation"><path d="M26 65 25 11 52 37 Q76 27 100 37 L126 11 126 68 Q126 113 76 119 Q26 113 26 65Z" fill="#50545c" stroke="#30343b" stroke-width="3"/><path d="M30 43 32 22 47 39 M106 39 122 22 122 43" fill="#bb919f"/><path d="M69 46 83 46 88 89 76 103 64 88Z" fill="#f4f3ee"/><ellipse cx="51" cy="69" rx="16" ry="14" fill="#c9cd74" stroke="#30343b" stroke-width="3"/><ellipse cx="100" cy="69" rx="16" ry="14" fill="#c9cd74" stroke="#30343b" stroke-width="3"/><ellipse cx="51" cy="69" rx="4" ry="11" fill="#1b2022"/><ellipse cx="100" cy="69" rx="4" ry="11" fill="#1b2022"/><ellipse cx="76" cy="100" rx="33" ry="17" fill="#f2f0ec"/><ellipse cx="61" cy="103" rx="7" ry="5" fill="#676a70"/><ellipse cx="91" cy="103" rx="7" ry="5" fill="#676a70"/><path d="M69 91 83 91 76 101Z" fill="#1d2024"/><path d="M76 101 V109" stroke="#292b2d" stroke-width="2"/><path d="M52 103 20 95 M52 110 16 112 M100 103 132 95 M100 110 135 112" stroke="#e7e6e3" stroke-width="1.7"/><path d="M65 119 76 130 87 119" fill="#d6b475"/></svg></div>
      <p class="gg-place"></p><p class="gg-speech" role="status" aria-live="polite"></p>
      <div class="gg-actions"><button type="button" data-gg="hint">🔎 Gentle hint</button><button type="button" data-gg="pet">♡ Pet Gizmo</button><button type="button" data-gg="journey">🐾 Our journey</button></div>
      <p class="gg-progress"></p><p class="gg-footnote">Gizmo never unlocks a puzzle for you.</p>
    </section>`;
  document.body.append(widget);
  const toggle = widget.querySelector('.gg-toggle');
  const panel = widget.querySelector('.gg-panel');
  const speech = widget.querySelector('.gg-speech');
  const progress = widget.querySelector('.gg-progress');
  widget.querySelector('.gg-place').textContent = chapters[index][1];
  const recordVisit = () => {
    if (!authorizedHome()) return;
    if (!visited.includes(filename)) visited.push(filename);
    try { localStorage.setItem(key, JSON.stringify({visited})); } catch {}
  };
  const update = () => {
    recordVisit();
    const count = visited.filter(x => x !== 'poetry-vault-author-room.html').length;
    progress.textContent = home && authorizedHome() ? '🏅 Trusted Companion · You helped Gizmo home!' : `Places explored with Gizmo: ${count} of 7 on the journey home.`;
  };
  function setOpen(open) {
    if (open && !authorizedHome()) return;
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (open) { speech.textContent = chapters[index][2]; update(); }
  }
  toggle.addEventListener('click', () => setOpen(panel.hidden));
  widget.querySelector('.gg-close').addEventListener('click', () => setOpen(false));
  widget.querySelectorAll('[data-gg]').forEach(b => b.addEventListener('click', () => {
    if (!authorizedHome()) return;
    if (b.dataset.gg === 'hint') speech.textContent = chapters[index][3];
    if (b.dataset.gg === 'pet') speech.textContent = 'Prrrr. Gizmo gives you a slow blink. You are officially approved by security.';
    if (b.dataset.gg === 'journey') { update(); speech.textContent = home ? 'Home at last! Thank you for finding my favorite room.' : `We are in ${chapters[index][1]}. Follow the game’s own doors and clues to keep going. I’ll be waiting on the next page.`; }
  }));
  if (home && room) {
    // The author room starts hidden. Do not reveal the home achievement or dialog until its own gate permits access.
    const observer = new MutationObserver(() => {
      if (!authorizedHome()) { widget.hidden = true; setOpen(false); }
      else { widget.hidden = false; update(); }
    });
    observer.observe(room, {attributes:true,attributeFilter:['hidden']});
    widget.hidden = !authorizedHome();
  } else update();
})();

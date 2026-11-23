/* Phase 6.1 — additive study enhancements; no auth, storage, or puzzle mutations. */
(() => {
  const room = document.querySelector('#room');
  const scene = document.querySelector('#author-immersive');
  if (!room || !scene || document.querySelector('#ai61-details')) return;
  const stage = scene.querySelector('.ai6-stage');
  const world = scene.querySelector('.ai6-world');
  const cat = scene.querySelector('.ai6-cat');
  const prompt = scene.querySelector('#ai6-prompt');
  if (!stage || !world || !cat || !prompt) return;
  scene.classList.add('ai61-enabled');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const note = document.createElement('p');
  note.className = 'ai61-intro';
  note.textContent = 'New: Tap furniture to examine it up close, or use Explore to open its original discovery. Gizmo has a fireplace and a bed!';
  scene.querySelector('.ai6-heading')?.append(note);

  const hearth = document.createElement('div');
  hearth.className = 'ai61-hearth';
  hearth.setAttribute('aria-hidden', 'true');
  hearth.innerHTML = '<div class="ai61-mantel">✧</div><div class="ai61-fire">♨</div><div class="ai61-bed">GIZMO’S BED <span>♡</span></div>';
  world.append(hearth);

  const inspect = document.createElement('dialog');
  inspect.id = 'ai61-details';
  inspect.className = 'ai61-dialog';
  inspect.innerHTML = `<div class="ai61-dialog-inner"><button type="button" class="ai61-close" aria-label="Close inspection">×</button><p class="ai61-eyebrow">THE AUTHOR'S STUDY · A CLOSER LOOK</p><div class="ai61-symbol" aria-hidden="true"></div><h3 class="ai61-title"></h3><p class="ai61-description"></p><p class="ai61-gizmo"></p><div class="ai61-buttons"><button type="button" class="ai61-explore">Explore this object →</button><button type="button" class="ai61-back">Return to the room</button></div></div>`;
  scene.append(inspect);
  const details = {
    books: {icon:'▥',title:'The Forgotten Bookshelf',description:'A towering shelf holds stories waiting to be discovered. The journal of unwritten books is here.',gizmo:'Gizmo: “Some stories are still learning how to begin.”',selector:'.desk-items [data-discover="books"]'},
    letter: {icon:'✉',title:'The Writing Desk',description:'An old letter rests beside the author’s ink and paper. It carries a story worth reading.',gizmo:'Gizmo: “Careful with the letter. It means something.”',selector:'.desk-items [data-discover="letter"]'},
    music: {icon:'♫',title:'The Music Box',description:'The music box waits quietly. Inside are words that found another life as songs.',gizmo:'Gizmo: “I like this one. It makes the room feel warm.”',selector:'.desk-items [data-discover="music"]'},
    photography: {icon:'◈',title:'The Camera',description:'A camera catches the moments that words cannot always hold.',gizmo:'Gizmo: “Is this my good side?”',selector:'.desk-items [data-discover="photography"]'},
    drawer: {icon:'⚿',title:'The Locked Drawer',description:'A brass keyhole guards a secret. The original Living Library puzzle is waiting here.',gizmo:'Gizmo: “I know a secret. But you must solve it yourself.”',selector:'#living-drawer'}
  };
  let current = null;
  function openDetail(key){
    if (room.hidden || !details[key]) return;
    current = details[key];
    inspect.querySelector('.ai61-symbol').textContent = current.icon;
    inspect.querySelector('.ai61-title').textContent = current.title;
    inspect.querySelector('.ai61-description').textContent = current.description;
    inspect.querySelector('.ai61-gizmo').textContent = current.gizmo;
    if (typeof inspect.showModal === 'function') inspect.showModal();
    else inspect.setAttribute('open','');
    prompt.textContent = 'Gizmo waits while you inspect the ' + current.title.toLowerCase() + '.';
  }
  function close(){ if (inspect.open && typeof inspect.close === 'function') inspect.close(); else inspect.removeAttribute('open'); }
  inspect.querySelector('.ai61-close').addEventListener('click',close);
  inspect.querySelector('.ai61-back').addEventListener('click',close);
  inspect.addEventListener('click', e => { if (e.target === inspect) close(); });
  inspect.querySelector('.ai61-explore').addEventListener('click',()=>{
    const original = current && room.querySelector(current.selector);
    close();
    if (!original) {prompt.textContent = 'That discovery is still waiting below.';return;}
    original.click();
    if (current.selector === '#living-drawer') {
      room.querySelector('.living-library')?.scrollIntoView({behavior:reduced?'instant':'smooth',block:'center'});
    }
  });
  // Capture the original hotspot click before Phase 6 triggers the old discovery.
  // This keeps the original actions accessible through the Explore button.
  scene.querySelectorAll('.ai6-object[data-target]').forEach(button => {
    button.addEventListener('click',event => {
      if (room.hidden) return;
      const key=button.dataset.target;
      if (!details[key]) return;
      event.stopImmediatePropagation();
      openDetail(key);
    },true);
  });

  // Gizmo follows the camera position without timers, and relaxes at the fireplace.
  let rest = false;
  const catControls = document.createElement('div');
  catControls.className='ai61-cat-controls';
  catControls.innerHTML='<button type="button" id="ai61-follow" aria-pressed="true">🐾 Gizmo follows: On</button><button type="button" id="ai61-nap">☾ Send Gizmo to bed</button>';
  scene.querySelector('.ai6-actions')?.append(catControls);
  const followButton=catControls.querySelector('#ai61-follow');
  const napButton=catControls.querySelector('#ai61-nap');
  let follow=true;
  function refreshCat(){
    cat.classList.toggle('ai61-resting',rest);
    cat.classList.toggle('ai61-following',follow && !rest);
    const x=Number(world.style.getPropertyValue('--ai6-x'))||0;
    const z=Number(world.style.getPropertyValue('--ai6-z'))||0;
    cat.style.setProperty('--ai61-cat-x', `${Math.max(-22,Math.min(22,x*8))}px`);
    cat.style.setProperty('--ai61-cat-y', `${Math.max(-10,Math.min(10,z*2))}px`);
  }
  const watcher=new MutationObserver(refreshCat);
  watcher.observe(world,{attributes:true,attributeFilter:['style']});
  followButton.addEventListener('click',()=>{
    follow=!follow;rest=false;
    followButton.setAttribute('aria-pressed',String(follow));
    followButton.textContent=`🐾 Gizmo follows: ${follow?'On':'Off'}`;
    napButton.textContent='☾ Send Gizmo to bed';
    prompt.textContent=follow?'Gizmo trots along beside you.':'Gizmo stays near his favorite cushion.';
    refreshCat();
  });
  napButton.addEventListener('click',()=>{
    rest=!rest;
    if (rest) {follow=false;followButton.setAttribute('aria-pressed','false');followButton.textContent='🐾 Gizmo follows: Off';}
    napButton.textContent=rest?'☀ Wake Gizmo':'☾ Send Gizmo to bed';
    prompt.textContent=rest?'Gizmo curls up by the fireplace. Home at last. ♡':'Gizmo stretches and opens his golden-green eyes.';
    refreshCat();
  });
  scene.querySelector('#ai6-pet')?.addEventListener('click',()=>{
    if (rest) {rest=false;napButton.textContent='☾ Send Gizmo to bed';refreshCat();}
  });
  refreshCat();
})();

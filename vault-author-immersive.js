/* Phase 6 — additive hybrid navigable author's study. No authentication or puzzle state modifications. */
(() => {
  const room = document.getElementById('room');
  if (!room || document.getElementById('author-immersive')) return;
  const scene = document.createElement('section');
  scene.id = 'author-immersive';
  scene.className = 'ai6';
  scene.setAttribute('aria-label', 'Explore the Author’s Hidden Room');
  scene.innerHTML = `<div class="ai6-heading"><p class="eyebrow">PHASE VI · THE ROOM COMES ALIVE</p><h2>Step inside the Author’s Study</h2><p>Walk through the room with the arrows or WASD. Tap glowing objects to move closer and investigate. All your original discoveries are still below.</p></div>
    <div class="ai6-stage" tabindex="0" role="group" aria-label="Interactive Victorian study, use arrow keys or the movement controls">
      <div class="ai6-world"><div class="ai6-ceiling"></div><div class="ai6-back-wall"><div class="ai6-window"><span>☾</span></div><div class="ai6-picture">❦</div></div><div class="ai6-left-wall"></div><div class="ai6-right-wall"></div><div class="ai6-floor"></div>
        <button class="ai6-object ai6-books" data-target="books" data-x="-2" data-z="3" aria-label="Inspect the bookshelves"><span>▥</span><small>BOOKSHELF</small></button>
        <button class="ai6-object ai6-desk" data-target="letter" data-x="0" data-z="2" aria-label="Inspect the writing desk"><span>✉</span><small>WRITING DESK</small></button>
        <button class="ai6-object ai6-music" data-target="music" data-x="1.7" data-z="2.7" aria-label="Inspect the music box"><span>♫</span><small>MUSIC BOX</small></button>
        <button class="ai6-object ai6-camera" data-target="photography" data-x="2.5" data-z="3.8" aria-label="Inspect the camera"><span>◈</span><small>CAMERA</small></button>
        <button class="ai6-object ai6-drawer" data-target="drawer" data-x="-.6" data-z="2.5" aria-label="Inspect the locked drawer"><span>⚿</span><small>LOCKED DRAWER</small></button>
        <div class="ai6-cat" aria-label="Gizmo, gray and white cat with two gray spots beside his mouth" role="img">🐾<span class="ai6-cat-art"></span></div>
      </div><div class="ai6-vignette"></div><div class="ai6-crosshair" aria-hidden="true">✦</div>
      <div class="ai6-topline"><span>THE AUTHOR'S STUDY</span><span id="ai6-position">Entrance · Facing north</span></div>
      <div class="ai6-prompt" id="ai6-prompt" role="status" aria-live="polite">Gizmo: “You made it home! Come explore with me.”</div>
    </div>
    <div class="ai6-toolbar"><div class="ai6-movement" aria-label="Movement controls"><button type="button" data-move="forward" aria-label="Walk forward">↑</button><div><button type="button" data-move="left" aria-label="Step left">←</button><button type="button" data-move="back" aria-label="Step backward">↓</button><button type="button" data-move="right" aria-label="Step right">→</button></div></div><div class="ai6-actions"><button type="button" id="ai6-reset">↺ Return to entrance</button><button type="button" id="ai6-pet">♡ Pet Gizmo</button><button type="button" id="ai6-original">▣ Original discoveries ↓</button></div></div>
    <p class="ai6-footnote">A lightweight 3D-style perspective room with free movement and tap-to-inspect hotspots. Your original puzzles and journal remain fully available.</p>`;
  room.prepend(scene);
  const stage = scene.querySelector('.ai6-stage');
  const world = scene.querySelector('.ai6-world');
  const prompt = scene.querySelector('#ai6-prompt');
  const positionLabel = scene.querySelector('#ai6-position');
  const catArt = scene.querySelector('.ai6-cat-art');
  let x = 0, z = 0;
  let target = null;
  const sourceCat = room.querySelector('.phase4-cat');
  if (sourceCat) {
    const cat = sourceCat.cloneNode(true);
    cat.classList.remove('phase4-cat');
    cat.classList.add('ai6-cat-svg');
    cat.removeAttribute('data-mood');
    cat.setAttribute('aria-hidden', 'true');
    // Cloned SVG IDs can conflict with the original; namespace gradient IDs and their references.
    cat.querySelectorAll('[id]').forEach(node => {const old=node.id;const next='ai6-'+old;cat.querySelectorAll('*').forEach(el=>{for(const a of [...el.attributes]) if(a.value.includes('url(#'+old+')')) el.setAttribute(a.name,a.value.replaceAll('url(#'+old+')','url(#'+next+')'));});node.id=next;});
    catArt.append(cat);
  } else catArt.textContent='🐈';
  function render(){world.style.setProperty('--ai6-x', String(x));world.style.setProperty('--ai6-z',String(z));positionLabel.textContent=`${z>2?'Near the desk':z>0.7?'Inside the study':'Entrance'} · ${x<-.8?'Left aisle':x>.8?'Right aisle':'Center'}`;}
  function move(dx,dz){if(room.hidden)return;x=Math.max(-2.6,Math.min(2.6,Math.round((x+dx)*10)/10));z=Math.max(0,Math.min(3.7,Math.round((z+dz)*10)/10));render();prompt.textContent=z>2.5?'Gizmo: “Look closely. The furniture has secrets.”':'Gizmo pads along beside you. Tap a glowing object to inspect it.';}
  const actions={books:'books',letter:'letter',music:'music',photography:'photography'};
  function inspect(button){if(room.hidden)return;const name=button.querySelector('small')?.textContent||'object';x=Math.max(-2.6,Math.min(2.6,Number(button.dataset.x)||0));z=Math.max(0,Math.min(3.7,Number(button.dataset.z)||0));render();prompt.textContent=`Gizmo investigates the ${name.toLowerCase()} with you…`;
    const kind=button.dataset.target;
    // Trigger the ORIGINAL event handlers rather than duplicating puzzles or author content.
    if(actions[kind]){const original=room.querySelector(`.desk-items [data-discover="${actions[kind]}"]`)||room.querySelector(`[data-discover="${actions[kind]}"]`);if(original)original.click();}
    else if(kind==='drawer'){const original=room.querySelector('#living-drawer');if(original)original.click();else prompt.textContent='The drawer is waiting in the Living Library section below.';}
    stage.focus({preventScroll:true});
  }
  scene.querySelectorAll('.ai6-object').forEach(b=>b.addEventListener('click',()=>inspect(b)));
  scene.querySelectorAll('[data-move]').forEach(b=>b.addEventListener('click',()=>{const d={forward:[0,.45],back:[0,-.45],left:[-.45,0],right:[.45,0]}[b.dataset.move];move(...d);stage.focus({preventScroll:true});}));
  stage.addEventListener('keydown',e=>{if(e.target.closest('button,input,textarea'))return;const d={ArrowUp:[0,.45],w:[0,.45],W:[0,.45],ArrowDown:[0,-.45],s:[0,-.45],S:[0,-.45],ArrowLeft:[-.45,0],a:[-.45,0],A:[-.45,0],ArrowRight:[.45,0],d:[.45,0],D:[.45,0]}[e.key];if(d){e.preventDefault();move(...d);}});
  scene.querySelector('#ai6-reset').addEventListener('click',()=>{x=0;z=0;render();prompt.textContent='Gizmo: “Back at the entrance. Where shall we go?”';stage.focus({preventScroll:true});});
  scene.querySelector('#ai6-pet').addEventListener('click',()=>{prompt.textContent='Purrrrr! Gizmo rubs against your ankles. His two gray muzzle spots twitch happily.';scene.querySelector('.ai6-cat').classList.remove('ai6-petted');void scene.querySelector('.ai6-cat').offsetWidth;scene.querySelector('.ai6-cat').classList.add('ai6-petted');});
  scene.querySelector('#ai6-original').addEventListener('click',()=>room.querySelector('.study')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));
  // Touch swipe moves the camera; object taps still work independently.
  let touch=null;stage.addEventListener('touchstart',e=>{if(e.target.closest('button'))return;if(e.touches.length===1)touch={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});stage.addEventListener('touchend',e=>{if(!touch||!e.changedTouches.length)return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;touch=null;if(Math.max(Math.abs(dx),Math.abs(dy))<35)return;if(Math.abs(dx)>Math.abs(dy))move(dx>0?-.45:.45,0);else move(0,dy>0?.45:-.45);},{passive:true});
  render();
})();

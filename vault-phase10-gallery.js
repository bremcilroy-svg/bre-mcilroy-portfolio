/* Phase 10 — Additive photo gallery. Preserves all existing puzzles and owner data. */
(() => {
  'use strict';
  const room=document.querySelector('#room');
  if(!room||document.querySelector('#pv10-gallery'))return;
  const items=[
    ['memory1','pv10-memory-1.jpg','A colorful portrait together','A colorful moment'],
    ['memory2','pv10-memory-2.jpg','A tender moment on the couch','A quiet moment'],
    ['memory3','pv10-memory-3.jpg','Two friends at the laundromat','An adventure together'],
    ['memory4','pv10-memory-4.jpg','A smiling selfie together','A shared smile'],
    ['memory5','pv10-memory-5.jpg','A treasured holiday photograph','A holiday memory'],
    ['zebra','pv10-zebra.jpg','Enchanted zebra in a purple Victorian portrait','The Zebra Guardian'],
    ['wolf','pv10-wolf.jpg','Enchanted wolf in a purple Victorian portrait','The Wolf Guardian'],
    ['turtle','pv10-turtle.jpg','Sea turtle in a jeweled underwater portrait','The Ocean Guardian']
  ];
  const section=document.createElement('section');section.id='pv10-gallery';section.className='pv10';section.setAttribute('aria-labelledby','pv10-title');
  section.innerHTML='<div class="pv10-intro"><p class="eyebrow">PHASE X · THE AUTHOR’S GALLERY</p><h2 id="pv10-title">The Gallery of Precious Memories</h2><p>Some stories are written in ink. Others live in photographs. Tap a frame to look closer.</p></div><div class="pv10-wall" role="group" aria-label="Framed memories and animal guardians"></div><p class="pv10-note">Gizmo whispers: “Every picture holds a story.”</p><dialog id="pv10-viewer" aria-label="Enlarged gallery photograph"><div class="pv10-dialog-content"><button type="button" class="pv10-close" aria-label="Close enlarged photograph">× Close</button><img alt=""><p class="pv10-caption"></p><div class="pv10-controls"><button type="button" class="pv10-prev">← Previous</button><button type="button" class="pv10-next">Next →</button></div></div></dialog>';
  const anchor=room.querySelector('#pv94-guestbook')||room.querySelector('#pv93-mirror')||room.querySelector('#pv8-secret');
  if(anchor)anchor.insertAdjacentElement('afterend',section);else room.append(section);
  const wall=section.querySelector('.pv10-wall');let current=0;
  items.forEach(([id,src,alt,label],i)=>{
    const b=document.createElement('button');b.type='button';b.className='pv10-frame '+(i>=5?'pv10-animal':'pv10-memory');b.dataset.pv10=String(i);b.setAttribute('aria-label','Enlarge: '+label);
    const img=document.createElement('img');img.src=src;img.alt=alt;img.loading='lazy';img.decoding='async';
    const span=document.createElement('span');span.textContent=label;
    b.append(img,span);wall.append(b);
    b.addEventListener('click',()=>open(i));
  });
  const dialog=section.querySelector('#pv10-viewer'),large=dialog.querySelector('img'),caption=dialog.querySelector('.pv10-caption');
  function show(i){current=(i+items.length)%items.length;large.src=items[current][1];large.alt=items[current][2];caption.textContent=items[current][3];}
  function open(i){if(room.hidden)return;show(i);if(!dialog.open)dialog.showModal();}
  function close(){dialog.close();}
  dialog.querySelector('.pv10-close').addEventListener('click',close);
  dialog.querySelector('.pv10-prev').addEventListener('click',()=>show(current-1));
  dialog.querySelector('.pv10-next').addEventListener('click',()=>show(current+1));
  dialog.addEventListener('click',e=>{if(e.target===dialog)close()});
  dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();show(current-1)}if(e.key==='ArrowRight'){e.preventDefault();show(current+1)}});
  const world=room.querySelector('#author-immersive .ai6-world');
  if(world&&!world.querySelector('#pv10-wall-gallery')){
    const b=document.createElement('button');b.type='button';b.id='pv10-wall-gallery';b.setAttribute('aria-label','Inspect the Gallery of Precious Memories');
    b.innerHTML='<img src="pv10-zebra.jpg" alt=""><span>MEMORY GALLERY</span>';
    b.addEventListener('click',()=>{if(!room.hidden)section.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})});
    world.append(b);
  }
})();

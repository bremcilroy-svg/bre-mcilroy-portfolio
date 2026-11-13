/* Phase 9.1 — Additive keepsake cabinet for Gizmo's existing four discoveries. */
(() => {
  'use strict';
  const room = document.getElementById('room');
  const findings = document.getElementById('gizmo-secret-findings');
  if (!room || !findings || document.getElementById('pv91-cabinet')) return;
  const KEY = 'poetry-vault-gizmo-findings-v1';
  const treasures = [
    {icon:'🔖',name:'The Brass Bookmark',where:'The oldest bookshelf',detail:'A tiny paw print marks the brass. Perhaps Gizmo knows which story it belongs to.',line:'Some stories wait patiently for someone to return.'},
    {icon:'💌',name:'The Folded Letter',where:'The candlelit desk',detail:'A purple wax seal protects a note from the Keeper of Forgotten Words.',line:'A voice can be quiet and still deserve to be heard.'},
    {icon:'🗝️',name:'The Silver Key',where:'The velvet cushion',detail:'The little key catches the light. It is a keepsake, not the combination to Moose’s journal.',line:'Not every door is opened with a key.'},
    {icon:'🌙',name:'The Moonstone',where:'The moonlit window',detail:'A pale moonstone glows gently in the light from the study window.',line:'Even the darkest room remembers the moon.'}
  ];
  const cabinet = document.createElement('section');
  cabinet.id = 'pv91-cabinet';
  cabinet.className = 'pv91-cabinet';
  cabinet.setAttribute('aria-labelledby','pv91-title');
  cabinet.innerHTML = `<div class="pv91-heading"><p class="eyebrow">PHASE IX · THE LIBRARY OF LIVING SECRETS</p><h2 id="pv91-title">Gizmo's Treasure Cabinet</h2><p>The Chief of Vault Security has saved a special place for his discoveries. Every treasure you find in <em>Gizmo's Secret Findings</em> appears here.</p></div>
  <div class="pv91-main"><div class="pv91-display"><p class="pv91-shelf-title">THE KEEPER'S CABINET</p><div class="pv91-grid" id="pv91-grid" role="group" aria-label="Gizmo's collected treasures"></div><p class="pv91-progress" id="pv91-progress" role="status" aria-live="polite"></p><div class="pv91-meter" aria-hidden="true"><span id="pv91-meter-fill"></span></div></div>
  <div class="pv91-detail"><p class="eyebrow">A CLOSER LOOK</p><div id="pv91-detail" aria-live="polite"><h3>Choose a treasure</h3><p>Tap a discovered object to learn its story. Hidden objects are waiting for Gizmo to find them.</p></div><button id="pv91-find" type="button">🐾 Visit Gizmo's Secret Findings</button></div></div>
  <div id="pv91-reward" class="pv91-reward" hidden><span aria-hidden="true">✦ 🐾 ✦</span><h3>The Keeper's Four Treasures</h3><p>“Every forgotten word deserves a home. Every quiet voice deserves to be heard.”</p><p>Gizmo curls his tail around the collection. The cabinet is complete.</p></div><p class="pv91-note">Your discoveries are saved on this device, just like the original Gizmo mystery. These are fictional in-game keepsakes, not new poems by the author.</p>`;
  findings.insertAdjacentElement('afterend', cabinet);
  const $ = s => cabinet.querySelector(s);
  let selected = -1;
  const read = () => { try {const a=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(a)?[...new Set(a.filter(n=>Number.isInteger(n)&&n>=0&&n<4))]:[];}catch{return [];} };
  function render() {
    const found=read();
    const grid=$('#pv91-grid');
    grid.replaceChildren();
    treasures.forEach((t,i)=>{
      const yes=found.includes(i);
      const b=document.createElement('button');b.type='button';b.className='pv91-treasure';
      b.dataset.collected=String(yes);b.setAttribute('aria-label',yes?'Inspect '+t.name:'Undiscovered treasure '+(i+1));
      b.setAttribute('aria-pressed',String(selected===i&&yes));
      b.innerHTML=`<span class="pv91-item-icon" aria-hidden="true">${yes?t.icon:'✧'}</span><strong>${yes?t.name:'Hidden treasure'}</strong><small>${yes?'Collected':'Not yet discovered'}</small>`;
      b.addEventListener('click',()=>{if(room.hidden)return;selected=i;showDetail();renderButtons();});
      grid.append(b);
    });
    $('#pv91-progress').textContent=`${found.length} of 4 keepsakes collected`;
    $('#pv91-meter-fill').style.width=`${found.length*25}%`;
    $('#pv91-reward').hidden=found.length!==4;
    showDetail();
  }
  function renderButtons(){cabinet.querySelectorAll('.pv91-treasure').forEach((b,i)=>b.setAttribute('aria-pressed',String(selected===i&&read().includes(i))));}
  function showDetail(){
    const target=$('#pv91-detail');target.replaceChildren();
    if(selected<0){target.innerHTML='<h3>Choose a treasure</h3><p>Tap a discovered object to learn its story. Hidden objects are waiting for Gizmo to find them.</p>';return;}
    const t=treasures[selected],yes=read().includes(selected);
    const h=document.createElement('h3');h.textContent=yes?t.icon+' '+t.name:'✧ A hidden keepsake';target.append(h);
    const p=document.createElement('p');p.textContent=yes?t.detail:'Gizmo has not discovered this treasure yet. Visit his Secret Findings to search '+t.where.toLowerCase()+'.';target.append(p);
    if(yes){const quote=document.createElement('blockquote');quote.textContent='“'+t.line+'”';target.append(quote);}
  }
  $('#pv91-find').addEventListener('click',()=>{if(room.hidden)return;findings.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});});
  // Existing findings buttons update their storage synchronously; refresh after their click handlers finish.
  findings.addEventListener('click',e=>{if(e.target.closest('[data-gf],#gf-reset'))queueMicrotask(render);});
  window.addEventListener('storage',e=>{if(e.key===KEY||e.key===null)render();});
  window.addEventListener('pageshow',render);
  render();
})();

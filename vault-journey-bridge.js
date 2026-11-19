/* Phase 15.5: additive, progress-aware chapter doors. Does not write puzzle saves. */
(async()=>{
'use strict';
const path=location.pathname.split('/').pop();
const routes=['poetry-vault-entrance.html','poetry-vault.html','poetry-vault-mirror.html','poetry-vault-labyrinth.html','poetry-vault-dawn.html','poetry-vault-society.html','poetry-vault-fifth-door.html','poetry-vault-author-room.html'];
const titles=['Vault Entrance','Heart Chamber','Shattered Mirror','Midnight Labyrinth','Door to Tomorrow','Keepers’ Hall','Fifth Door','Author’s Study'];
const motifs=['❄️','❤️','🪞','🌙','🌅','🦉','🔮','👑'];
const whispers=['The snow owls guard the threshold.','Every letter carries a heartbeat.','Reflections hold their secrets.','The moon lights the hidden path.','A new dawn waits beyond the door.','The Keepers remember every story.','Four seals protect this passage.','The author keeps the final key.'];
const index=routes.indexOf(path);if(index<0)return;
let stats;
try{const mod=await import('./vault-society.js');stats=mod.societyStats;}catch(e){console.warn('Journey guide unavailable',e);const fallback=document.createElement('a');fallback.href='academy-royal-great-hall.html';fallback.textContent='♛ Return to the Royal Great Hall';fallback.setAttribute('aria-label','Return to the Academy Great Hall');fallback.style.cssText='position:fixed;bottom:12px;right:12px;z-index:9999;padding:12px 16px;border:2px solid #c6b9d9;border-radius:24px;background:#281c39;color:white;font:700 13px system-ui;text-decoration:none';document.body.append(fallback);return;}
const root=document.createElement('nav');root.id='pv155-bridge';root.setAttribute('aria-label','Castle passage');
root.innerHTML='<button type="button" class="pv155-open" aria-expanded="false">✦ Castle passage</button><div class="pv155-panel" hidden><p class="pv155-heading">THE POETRY VAULT</p><p class="pv155-location"></p><div class="pv155-links"></div><button type="button" class="pv192-map-toggle" aria-expanded="false">🗺 Castle map · All chambers</button><div class="pv192-map" hidden></div><p class="pv155-note">Your original puzzle progress remains saved in this browser.</p></div>';
document.body.append(root);
const toggle=root.querySelector('.pv155-open'),panel=root.querySelector('.pv155-panel'),links=root.querySelector('.pv155-links');
const mapToggle=root.querySelector('.pv192-map-toggle'),castleMap=root.querySelector('.pv192-map');
const castleReturn=document.createElement('a');castleReturn.href='academy-royal-great-hall.html';castleReturn.className='pv155-route';castleReturn.textContent='♛ Return to the Royal Great Hall';castleReturn.setAttribute('aria-label','Return to the Academy Royal Great Hall');root.querySelector('.pv155-panel').append(castleReturn);const registry=document.createElement('a');registry.href='academy-character-creator.html';registry.className='pv155-route';registry.textContent='✧ My Academy Character';root.querySelector('.pv155-panel').append(registry);try{const saved=JSON.parse(localStorage.getItem('amethyst-crescent-character-v1')||'null');if(saved&&typeof saved.name==='string'&&saved.name.trim()){const identity=document.createElement('p');identity.className='pv155-note';identity.textContent='✧ Traveling as '+saved.name.trim().slice(0,28);root.querySelector('.pv155-panel').insertBefore(identity,links)}}catch{}
mapToggle.addEventListener('click',()=>{const showing=castleMap.hidden;castleMap.hidden=!showing;mapToggle.setAttribute('aria-expanded',String(showing));if(showing)render();});
const overlay=document.createElement('div');overlay.id='pv155-transition';overlay.hidden=true;overlay.innerHTML='<div class="pv155-door left"></div><div class="pv155-door right"></div><span class="pv192-owl pv192-owl-left" aria-hidden="true">🦉</span><span class="pv192-owl pv192-owl-right" aria-hidden="true">🦉</span><p>Beyond the next door…</p>';document.body.append(overlay);
let travelling=false;window.addEventListener('pageshow',()=>{travelling=false;overlay.hidden=true;overlay.classList.remove('pv155-animate')});
function eligible(i,s){
 if(i<=1)return true;
 if(!s||!s.journey||!s.journey.storageAvailable)return false;
 if(i>=2&&i<=4)return s.journey.completed.slice(0,i-1).every(x=>x===true);
 if(i===5)return s.journey.allComplete;
 if(i===6)return s.journey.allComplete&&s.seals.length===4;
 return s.journey.allComplete&&s.seals.length===4&&s.society.fifth===true;
}
function lockReason(i,s){if(!s.journey.storageAvailable)return 'Saved progress is unavailable in this browser';if(i>=2&&i<=4)return 'Complete '+titles[i-1]+' to open this door';if(i===5)return 'Complete all four puzzle chambers';if(i===6)return s.journey.allComplete?'Collect all four chamber seals':'Complete all four chambers and collect their seals';if(i===7)return s.society.fifth?'Complete the required chambers and seals':'Complete the Fifth Door after earning all four seals';return 'Finish the preceding chapter';}
function go(i){if(travelling||i===index)return;let s;try{s=stats()}catch(e){console.warn('Cannot read puzzle progress',e);return;}if(!eligible(i,s)){render();return;}
 const travel=()=>{if(travelling)return;travelling=true;const gizmo=document.querySelector('#pv-gizmo-companion .pvg-speech');if(gizmo){gizmo.textContent='🐾 Gizmo is coming with you to '+titles[i]+'!';gizmo.hidden=false;}overlay.querySelector('p').textContent='✦ '+titles[i]+' awaits… ✦';overlay.hidden=false;overlay.classList.remove('pv155-animate');if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){void overlay.offsetWidth;overlay.classList.add('pv155-animate');}setTimeout(()=>{location.assign(routes[i]);},window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:650);};
 if(i>=2&&i<=4){const request=new CustomEvent('pv192:door-request',{detail:{destination:i,proceed:travel,handled:false}});document.dispatchEvent(request);if(!request.detail.handled){console.warn('Castle lock unavailable; passage remains closed.');return;}return;}
 travel();}
function render(){let s;try{s=stats()}catch(e){console.warn('Cannot read puzzle progress',e);s={journey:{completed:[],allComplete:false,storageAvailable:false},seals:[],society:{fifth:false}};}root.querySelector('.pv155-location').textContent='You are in: '+titles[index];links.replaceChildren();castleMap.replaceChildren();
 const heading=document.createElement('p');heading.textContent='✦ THE LIVING CASTLE ✦';heading.className='pv192-map-heading';castleMap.append(heading);
 for(let i=0;i<routes.length;i++){
  const ok=eligible(i,s),b=document.createElement('button');b.type='button';b.className='pv155-route pv192-map-door';b.disabled=!ok||i===index;
  if(i===index)b.setAttribute('aria-current','page');
  b.textContent=motifs[i]+' '+(i===index?'You are here · ':'')+titles[i]+(ok?'':' · Locked');if(!ok){const explanation=document.createElement('small');explanation.className='pv192-lock-reason';explanation.textContent=lockReason(i,s);b.append(explanation);}
  b.setAttribute('aria-label',titles[i]+(i===index?', current chamber':ok?', open passage':', locked'));
  b.title=ok?'Travel through the castle':lockReason(i,s);
  b.addEventListener('click',()=>go(i));castleMap.append(b);
 }
 const nextIndex=s.journey.completed.findIndex(done=>!done);const goal=document.createElement('section');goal.className='pv193-next-step';goal.setAttribute('aria-label','Your next story objective');const goalTitle=document.createElement('strong');goalTitle.textContent='✦ Your next chapter';const goalText=document.createElement('p');if(!s.journey.storageAvailable){goalText.textContent='Your progress cannot be read right now. You can still visit the entrance and Royal Great Hall.';}else if(nextIndex!==-1){goalText.textContent='Continue '+titles[nextIndex+1]+'. Explore the room, discover its clues, and complete the puzzle to unlock the next chapter.';}else if(s.seals.length<4){goalText.textContent='All four chambers are complete. Return to '+titles[sealIds.findIndex(id=>!s.seals.includes(id))+1]+' to collect the next missing seal ('+s.seals.length+' of 4 found).';}else if(!s.society.fifth){goalText.textContent='Your four seals are ready. Enter the Fifth Door to continue your story.';}else{goalText.textContent='The Author’s Study awaits. Your earned progress is preserved.';}goal.append(goalTitle,goalText);const sealIds=['heart','mirror','labyrinth','dawn'];const missingSeal=sealIds.findIndex(id=>!s.seals.includes(id));const target=nextIndex!==-1?nextIndex+1:s.seals.length<4?missingSeal+1:!s.society.fifth?6:7;if(eligible(target,s)&&target!==index){const action=document.createElement('button');action.type='button';action.className='pv155-route pv193-next-action';action.textContent='Continue to '+titles[target]+' →';action.addEventListener('click',()=>go(target));goal.append(action);}castleMap.append(goal);
 const progress=document.createElement('p');progress.className='pv192-progress';const finished=s.journey.completed.filter(Boolean).length;progress.textContent='Chambers completed: '+finished+' / 4 · Seals found: '+s.seals.length+' / 4';castleMap.append(progress);const whisper=document.createElement('p');whisper.className='pv192-whisper';whisper.textContent='✦ '+whispers[index];castleMap.append(whisper);
 const note=document.createElement('p');note.textContent=s.journey.storageAvailable?'The five fantasy realms remain in development. Existing chapter locks and saved puzzles are preserved.':'Saved progress is unavailable in this browser. Later chapter doors remain locked until progress can be verified.';note.className='pv192-map-note';castleMap.append(note);
 const options=[];
 if(index>0)options.push(index-1);
 if(index<routes.length-1)options.push(index+1);
 if(index>1)options.push(0);
 for(const i of [...new Set(options)]){
  const ok=eligible(i,s),button=document.createElement('button');button.type='button';button.className='pv155-route';button.disabled=!ok||i===index;
  button.textContent=(i<index?'← ':'Open door → ')+titles[i]+(ok?'':' · Locked');
  if(!ok)button.title=lockReason(i,s);
  button.addEventListener('click',()=>go(i));links.append(button);
 }
}
window.addEventListener('pageshow',()=>{if(!panel.hidden)render();});
window.addEventListener('storage',e=>{if(e.key&&e.key.startsWith('bre-poetry-vault')&&!panel.hidden)render();});
toggle.addEventListener('click',()=>{const show=panel.hidden;panel.hidden=!show;toggle.setAttribute('aria-expanded',String(show));if(show)render();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){panel.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.focus();}});
render();
})();

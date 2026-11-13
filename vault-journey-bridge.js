/* Phase 15.5: additive, progress-aware chapter doors. Does not write puzzle saves. */
(async()=>{
'use strict';
const path=location.pathname.split('/').pop();
const routes=['poetry-vault-entrance.html','poetry-vault.html','poetry-vault-mirror.html','poetry-vault-labyrinth.html','poetry-vault-dawn.html','poetry-vault-society.html','poetry-vault-fifth-door.html','poetry-vault-author-room.html'];
const titles=['Vault Entrance','Heart Chamber','Shattered Mirror','Midnight Labyrinth','Door to Tomorrow','Keepers’ Hall','Fifth Door','Author’s Study'];
const index=routes.indexOf(path);if(index<0)return;
let stats;
try{const mod=await import('./vault-society.js');stats=mod.societyStats;}catch(e){console.warn('Journey guide unavailable',e);return;}
const root=document.createElement('nav');root.id='pv155-bridge';root.setAttribute('aria-label','Castle passage');
root.innerHTML='<button type="button" class="pv155-open" aria-expanded="false">✦ Castle passage</button><div class="pv155-panel" hidden><p class="pv155-heading">THE POETRY VAULT</p><p class="pv155-location"></p><div class="pv155-links"></div><p class="pv155-note">Your original puzzle progress remains saved in this browser.</p></div>';
document.body.append(root);
const toggle=root.querySelector('.pv155-open'),panel=root.querySelector('.pv155-panel'),links=root.querySelector('.pv155-links');
const overlay=document.createElement('div');overlay.id='pv155-transition';overlay.hidden=true;overlay.innerHTML='<div class="pv155-door left"></div><div class="pv155-door right"></div><p>Beyond the next door…</p>';document.body.append(overlay);
let travelling=false;
function eligible(i,s){
 if(i<=1)return true;
 if(i>=2&&i<=4)return s.journey.completed[i-2]===true;
 if(i===5)return s.journey.allComplete;
 if(i===6)return s.journey.allComplete&&s.seals.length===4;
 return s.journey.allComplete&&s.seals.length===4&&s.society.fifth===true;
}
function go(i){if(travelling)return;const s=stats();if(!eligible(i,s)){render();return;}travelling=true;overlay.hidden=false;overlay.classList.remove('pv155-animate');void overlay.offsetWidth;overlay.classList.add('pv155-animate');setTimeout(()=>{location.assign(routes[i]);},650);}
function render(){const s=stats();root.querySelector('.pv155-location').textContent='You are in: '+titles[index];links.replaceChildren();
 const options=[];
 if(index>0)options.push(index-1);
 if(index<routes.length-1)options.push(index+1);
 if(index>1)options.push(0);
 for(const i of [...new Set(options)]){
  const ok=eligible(i,s),button=document.createElement('button');button.type='button';button.className='pv155-route';button.disabled=!ok;
  button.textContent=(i<index?'← ':'Open door → ')+titles[i]+(ok?'':' · Locked');
  if(!ok)button.title=i===6?'Finish all four chambers and earn four seals':i===7?'Complete the Fifth Door first':'Complete the preceding chamber first';
  button.addEventListener('click',()=>go(i));links.append(button);
 }
}
toggle.addEventListener('click',()=>{const show=panel.hidden;panel.hidden=!show;toggle.setAttribute('aria-expanded',String(show));if(show)render();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){panel.hidden=true;toggle.setAttribute('aria-expanded','false');}});
render();
})();

/* Phase 15.6 — Victorian combination locks for the three chapter doors.
   No changes to existing puzzle saves, chapter completions, or birthday lock. */
(async function(){
'use strict';
const pages=['poetry-vault.html','poetry-vault-mirror.html','poetry-vault-labyrinth.html','poetry-vault-dawn.html'];
const destinations=['poetry-vault-mirror.html','poetry-vault-labyrinth.html','poetry-vault-dawn.html','poetry-vault-society.html'];
const codes=['1231','0702','0215'];
const names=['The Shattered Mirror','The Midnight Labyrinth','The Door to Tomorrow'];
const here=location.pathname.split('/').pop(),chapter=pages.indexOf(here);
let stats;try{({societyStats:stats}=await import('./vault-society.js'));}catch(e){console.warn('Door lock unavailable',e);return;}
const completed=i=>{try{const j=stats().journey;return j.completed.slice(0,i+1).length===i+1&&j.completed.slice(0,i+1).every(x=>x===true);}catch{return false;}};
const unlocked=i=>{try{return sessionStorage.getItem('pv156-door-'+(i+2))==='yes';}catch{return false;}};
const mark=i=>{try{sessionStorage.setItem('pv156-door-'+(i+2),'yes');}catch{}};
let active=false;
function cinematic(url){const overlay=document.getElementById('pv155-transition');if(overlay){overlay.hidden=false;overlay.classList.remove('pv155-animate');void overlay.offsetWidth;overlay.classList.add('pv155-animate');}else document.body.classList.add('pv156-fade');setTimeout(()=>location.assign(url),650);}
function lock(i,proceed){if(active)return;active=true;
 const dialog=document.createElement('dialog');dialog.className='pv156-lock';dialog.setAttribute('aria-label','Victorian door combination lock');
 dialog.innerHTML='<form method="dialog"><p class="pv156-kicker">✦ THE POETRY VAULT ✦</p><h2></h2><p>Turn the four brass dials to open this door.</p><div class="pv156-wheels"></div><p class="pv156-status" role="status" aria-live="polite">The lock awaits your combination.</p><div class="pv156-actions"><button type="button" class="pv156-submit">Unlock the door</button><button value="cancel" class="pv156-cancel">Not yet</button></div></form>';
 dialog.querySelector('h2').textContent='Door '+(i+2)+' · '+names[i];
 const wheels=dialog.querySelector('.pv156-wheels');const digits=[0,0,0,0];
 digits.forEach((_,n)=>{const group=document.createElement('div');group.className='pv156-wheel';group.innerHTML='<button type="button" aria-label="Increase digit '+(n+1)+'">▲</button><output aria-label="Digit '+(n+1)+'">0</output><button type="button" aria-label="Decrease digit '+(n+1)+'">▼</button>';const buttons=group.querySelectorAll('button'),out=group.querySelector('output');const spin=d=>{digits[n]=(digits[n]+d+10)%10;out.textContent=digits[n];};buttons[0].addEventListener('click',()=>spin(1));buttons[1].addEventListener('click',()=>spin(-1));wheels.append(group);});
 dialog.querySelector('.pv156-submit').addEventListener('click',()=>{if(digits.join('')!==codes[i]){dialog.querySelector('.pv156-status').textContent='The brass lock refuses that combination. Try again.';return;}mark(i);dialog.close();proceed();});
 dialog.addEventListener('close',()=>{dialog.remove();active=false;});document.body.append(dialog);dialog.showModal();}
function gate(i,proceed){if(!completed(i))return;if(unlocked(i)){proceed();return;}lock(i,proceed);}
// Phase 19.2: the castle map requests the SAME lock used by physical doors.
document.addEventListener('pv192:door-request',e=>{
 const detail=e.detail;if(!detail||!Number.isInteger(detail.destination)||typeof detail.proceed!=='function')return;
 const i=detail.destination-2;if(i<0||i>2)return;
 detail.handled=true;gate(i,detail.proceed);
});
// Existing physical doors already invoke their original puzzle-completion dialogs.
// Intercept only the successful onward link; never replace the puzzle interaction.
document.addEventListener('click',e=>{
 const a=e.target.closest?.('#panel a[href]');if(!a||chapter<0||chapter>2)return;
 const target=new URL(a.href,location.href);if(target.origin!==location.origin||target.pathname.split('/').pop()!==destinations[chapter])return;
 if(!completed(chapter)){e.preventDefault();e.stopImmediatePropagation();return;}
 e.preventDefault();e.stopImmediatePropagation();gate(chapter,()=>cinematic(a.href));
},true);
// Castle Passage and castle-map buttons request this lock via pv192:door-request.
// Do not intercept their clicks a second time: the bridge owns navigation.
// Highlight existing exit links without touching puzzle data.
const panel=document.getElementById('panel');if(panel&&chapter>=0&&chapter<3){const decorate=()=>{panel.querySelectorAll('a[href]').forEach(a=>{try{if(new URL(a.href,location.href).pathname.split('/').pop()===destinations[chapter]&&completed(chapter))a.classList.add('pv156-door-link');}catch{}});};new MutationObserver(decorate).observe(panel,{childList:true,subtree:true});decorate();}
})();

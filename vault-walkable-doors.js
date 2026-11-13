/* Phase 15.6: connect existing 3D exit-door completion links to Castle Passage.
   Read-only progress checks; never modifies puzzle saves or door mechanics. */
(async function(){
'use strict';
const paths=['poetry-vault.html','poetry-vault-mirror.html','poetry-vault-labyrinth.html','poetry-vault-dawn.html'];
const destinations=['poetry-vault-mirror.html','poetry-vault-labyrinth.html','poetry-vault-dawn.html','poetry-vault-society.html'];
const labels=['Walk through to The Shattered Mirror','Walk through to The Midnight Labyrinth','Walk through to The Door to Tomorrow','Walk through to Keepers’ Hall'];
const here=location.pathname.split('/').pop();const chapter=paths.indexOf(here);if(chapter<0)return;
let societyStats;
try{({societyStats}=await import('./vault-society.js'));}catch(e){console.warn('Walkable door: progress check unavailable',e);return;}
const isComplete=()=>{try{return societyStats().journey.completed[chapter]===true;}catch{return false;}};
let moving=false;
function travel(destination){
 if(moving||!isComplete())return;
 moving=true;
 const overlay=document.getElementById('pv155-transition');
 if(overlay){overlay.hidden=false;overlay.classList.remove('pv155-animate');void overlay.offsetWidth;overlay.classList.add('pv155-animate');}
 else{document.body.classList.add('pv156-fade');}
 setTimeout(()=>location.assign(destination),650);
}
function decorate(){
 const panel=document.getElementById('panel');if(!panel)return;
 panel.querySelectorAll('a[href]').forEach(a=>{
  let dest;try{dest=new URL(a.href,location.href).pathname.split('/').pop();}catch{return;}
  if(dest!==destinations[chapter])return;
  // The destination is offered by the chapter's existing completion UI.
  // Do not change unrelated links in journals, help, or site navigation.
  if(!panel.querySelector('#finish-journal')&&!panel.querySelector('#finish-journey'))return;
  if(!isComplete())return;
  a.textContent='🚪 '+labels[chapter]+' →';a.classList.add('pv156-door-link');
 });
}
const panel=document.getElementById('panel');
if(panel){new MutationObserver(decorate).observe(panel,{childList:true,subtree:true});decorate();}
document.addEventListener('click',event=>{
 const anchor=event.target.closest?.('a[href]');if(!anchor||!panel?.contains(anchor))return;
 if(!anchor.classList.contains('pv156-door-link'))return;
 const url=new URL(anchor.href,location.href);
 if(url.origin!==location.origin||url.pathname.split('/').pop()!==destinations[chapter])return;
 if(!isComplete()){event.preventDefault();return;}
 event.preventDefault();travel(url.href);
},true);
})();

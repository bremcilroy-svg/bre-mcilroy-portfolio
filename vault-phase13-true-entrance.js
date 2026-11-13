/* Phase 13: The True Author's Study Entrance. Additive; access remains controlled by existing #room gate. */
(()=>{
'use strict';
function mount(){
 const room=document.querySelector('#room'),immersive=room?.querySelector('#author-immersive');
 if(!room||!immersive||document.querySelector('#pv13-door'))return;
 const door=document.createElement('section');
 door.id='pv13-door';
 door.innerHTML=`<div class="pv13-arch"><span class="pv13-crest" aria-hidden="true">✦</span><p class="pv13-eyebrow">Beyond the Fifth Door</p><h2>The Author's Study</h2><p>Every story leaves a door open. Step inside the room, discover the portraits, and follow Gizmo's secrets.</p><button id="pv13-enter" type="button">Open the Study Door <span aria-hidden="true">→</span></button><p class="pv13-small">Explore the study in 3D. Your original discoveries and puzzles remain available.</p></div>`;
 room.prepend(door);
 const panel=immersive.querySelector('#pv12-experience');
 let ready=false;
 const enter=door.querySelector('#pv13-enter');
 const setReady=()=>{
  const p=immersive.querySelector('#pv12-experience');
  ready=!!p&&!p.hidden&&!!p.querySelector('canvas');
  if(enter.disabled===ready)enter.disabled=!ready;
  const label=ready?'Open the Study Door →':'Preparing the study…';
  if(enter.textContent!==label)enter.textContent=label;
 };
 setReady();
 const obs=new MutationObserver(setReady);
 obs.observe(immersive,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']});
 const exit=document.createElement('button');
 exit.type='button';exit.id='pv13-exit';exit.textContent='← Leave the Study';
 exit.setAttribute('aria-label','Leave the 3D study and return to the Author’s Room');
 const exitToPage=()=>{
  document.body.classList.remove('pv13-inside');
  document.body.style.removeProperty('overflow');
  if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});
  door.scrollIntoView({block:'start',behavior:'instant'});
  enter.focus({preventScroll:true});
 };
 function enterRoom(){
  setReady();
  if(room.hidden){return;}
  if(!ready){
   const old=immersive.querySelector('.ai6-stage');
   old?.scrollIntoView({behavior:'smooth'});
   return;
  }
  const p=immersive.querySelector('#pv12-experience');
  if(!p.contains(exit))p.prepend(exit);
  document.body.classList.add('pv13-inside');
  document.body.style.overflow='hidden';
  // The existing Three.js renderer uses ResizeObserver on the viewport.
  requestAnimationFrame(()=>{window.dispatchEvent(new Event('resize'));p.querySelector('.pv12-viewport')?.focus({preventScroll:true});});
 }
 enter.addEventListener('click',enterRoom);
 exit.addEventListener('click',exitToPage);
 document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&document.body.classList.contains('pv13-inside')){
   if(document.querySelector('dialog[open]'))return;
   exitToPage();
  }
 });
 // Existing discovery button in the 3D scene should lead back to page instead of
 // scrolling content behind the immersive overlay.
 immersive.addEventListener('click',e=>{
  if(!document.body.classList.contains('pv13-inside'))return;
  const b=e.target.closest('#pv12-experience [data-action="original"]');
  if(!b)return;
  e.stopImmediatePropagation();
  exitToPage();
  setTimeout(()=>room.querySelector('.study')?.scrollIntoView({behavior:'smooth'}),40);
 },true);
 // Keep the 3D experience inside the accessible room gate.
 const gateObs=new MutationObserver(()=>{
  if(room.hidden&&document.body.classList.contains('pv13-inside'))exitToPage();
 });
 gateObs.observe(room,{attributes:true,attributeFilter:['hidden']});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
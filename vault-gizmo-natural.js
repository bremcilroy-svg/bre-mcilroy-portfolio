/* Gizmo's Heart Chamber walk/stop phase. No game state changes. */
(()=>{'use strict';
if(location.pathname.split('/').pop()!=='poetry-vault.html')return;
function start(){
 const host=document.querySelector('#pv-gizmo-companion');
 const img=host?.querySelector('#pvg-real-artwork');
 if(!host||!img)return;
 const walk='gizmo-real-walk.webp?v=3',idle='gizmo-idle.png?v=1';
 const still=new Image();still.src=idle;
 let stopTimer=0,walking=false;
 const isResting=()=>host.classList.contains('pvg-resting');
 function setWalking(on){
  if(on&&isResting())on=false;
  if(on===walking)return;
  walking=on;
  host.classList.toggle('pvg-natural-walking',on);
  img.src=on?walk:idle;
 }
 function step(direction){
  if(host.hidden||isResting())return;
  if(direction==='left')host.classList.add('pvg-facing-left');
  if(direction==='right')host.classList.remove('pvg-facing-left');
  setWalking(true);
  clearTimeout(stopTimer);
  stopTimer=setTimeout(()=>setWalking(false),520);
 }
 document.addEventListener('keydown',e=>{
  if(e.repeat===false||e.repeat===true){
   const k=e.key.toLowerCase();
   if(['a','arrowleft','d','arrowright','w','arrowup','s','arrowdown'].includes(k))
    step(['a','arrowleft'].includes(k)?'left':['d','arrowright'].includes(k)?'right':'forward');
  }
 },{passive:true});
 document.addEventListener('keyup',e=>{
  if(['a','arrowleft','d','arrowright','w','arrowup','s','arrowdown'].includes(e.key.toLowerCase())){
   clearTimeout(stopTimer);stopTimer=setTimeout(()=>setWalking(false),120);
  }
 },{passive:true});
 document.querySelectorAll('[data-move]').forEach(btn=>{
  const dir=btn.dataset.move==='left'?'left':btn.dataset.move==='right'?'right':'forward';
  btn.addEventListener('pointerdown',()=>step(dir),{passive:true});
  btn.addEventListener('pointerup',()=>{clearTimeout(stopTimer);stopTimer=setTimeout(()=>setWalking(false),160)},{passive:true});
  btn.addEventListener('pointercancel',()=>setWalking(false),{passive:true});
 });
 host.querySelector('.pvg-rest')?.addEventListener('click',()=>setWalking(false));
 img.addEventListener('error',()=>{host.classList.add('pvg-natural-image-error');},{passive:true});
 img.src=idle;
 host.classList.add('pvg-natural-ready');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

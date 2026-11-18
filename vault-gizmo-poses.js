/* Phase: King Gizmo sit -> sleep -> stretch -> follow. Heart Chamber only. */
(()=>{'use strict';
if(location.pathname.split('/').pop()!=='poetry-vault.html')return;
function init(){
 const host=document.getElementById('pv-gizmo-companion');
 const art=host?.querySelector('#pvg-real-artwork');
 const btn=host?.querySelector('.pvg-rest');
 if(!host||!art||!btn)return;
 const idle='gizmo-idle.png?v=1';
 const poses={sit:'gizmo-sit.png?v=1',sleep:'gizmo-sleep.png?v=1',stretch:'gizmo-stretch.png?v=1'};
 let token=0;
 function pose(src,state){
  art.src=src;host.dataset.gizmoPose=state;
  host.classList.add('pvg-pose-mode');
 }
 function sequence(){
  const n=++token;
  const resting=host.classList.contains('pvg-resting');
  if(resting){
   pose(poses.sit,'sitting');
   setTimeout(()=>{if(n===token&&host.classList.contains('pvg-resting'))pose(poses.sleep,'sleeping')},1200);
  }else{
   pose(poses.stretch,'stretching');
   setTimeout(()=>{if(n===token&&!host.classList.contains('pvg-resting')){pose(idle,'following');host.classList.remove('pvg-pose-mode')}},1100);
  }
 }
 // Run after the existing Rest/Follow handler toggles its state.
 btn.addEventListener('click',()=>setTimeout(sequence,0));
 // Preserve normal walk animation by releasing pose mode when player moves.
 document.querySelectorAll('[data-move]').forEach(b=>b.addEventListener('pointerdown',()=>{
  if(!host.classList.contains('pvg-resting')){++token;host.classList.remove('pvg-pose-mode');delete host.dataset.gizmoPose}
 },{passive:true}));
 document.addEventListener('keydown',e=>{
  if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase())&&!host.classList.contains('pvg-resting')){
   ++token;host.classList.remove('pvg-pose-mode');delete host.dataset.gizmoPose;
  }
 },{passive:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

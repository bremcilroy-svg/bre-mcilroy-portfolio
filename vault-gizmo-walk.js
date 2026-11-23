/* Gizmo's realistic Heart Chamber walking test. No puzzle/save changes. */
(()=>{'use strict';
if(location.pathname.split('/').pop()!=='poetry-vault.html')return;
function init(){
 const host=document.getElementById('pv-gizmo-companion');
 if(!host||host.dataset.realWalk)return;
 host.dataset.realWalk='1';
 const art=host.querySelector('.pvg-art'),cat=host.querySelector('.pvg-cat');
 if(!art||!cat)return;
 const img=document.createElement('img');
 img.className='pvg-real-walk';img.src='gizmo-walk.gif?v=1';
 img.alt='';img.decoding='async';
 art.replaceChildren(img);
 host.classList.add('pvg-real-companion');
 let x=0,target=0,frame=0,rest=false;
 const restButton=host.querySelector('.pvg-rest');
 restButton?.addEventListener('click',()=>{rest=!restButton.matches('[aria-pressed="false"]');},{passive:true});
 function move(dir){
  if(host.hidden||host.classList.contains('pvg-resting'))return;
  target=Math.max(-110,Math.min(110,target+dir*22));
  host.classList.toggle('pvg-real-left',dir<0);
  host.classList.add('pvg-real-moving');
  clearTimeout(host._walkStop);
  host._walkStop=setTimeout(()=>host.classList.remove('pvg-real-moving'),1100);
  if(!frame)frame=requestAnimationFrame(tick);
 }
 function tick(){
  frame=0;x+=(target-x)*.10;
  host.style.setProperty('--pvg-real-x',x.toFixed(1)+'px');
  if(Math.abs(target-x)>.5)frame=requestAnimationFrame(tick);
 }
 document.addEventListener('keydown',e=>{
  if(['ArrowLeft','a','A'].includes(e.key))move(-1);
  if(['ArrowRight','d','D'].includes(e.key))move(1);
 });
 document.querySelectorAll('[data-move="left"],[data-move="right"]').forEach(b=>
  b.addEventListener('pointerdown',()=>move(b.dataset.move==='left'?-1:1),{passive:true}));
 img.addEventListener('error',()=>{host.classList.remove('pvg-real-companion');art.textContent='🐈';});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
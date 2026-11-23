/* Phase 6: Bring the approved Gizmo into Shattered Mirror.
   Additive only; does not modify room puzzles, navigation or save data. */
(()=>{'use strict';
if(location.pathname.split('/').pop()!=='poetry-vault-mirror.html')return;
function init(){
 const host=document.querySelector('#pv-gizmo-companion');
 if(!host||host.classList.contains('pvg-mirror-ready'))return;
 const cat=host.querySelector('.pvg-cat'),rest=host.querySelector('.pvg-rest');
 if(!cat||!rest)return;
 const art=document.createElement('img');
 art.id='pvg-mirror-real';art.alt='';art.setAttribute('aria-hidden','true');
 art.src='gizmo-idle.png?v=1';cat.append(art);
 host.classList.add('pvg-mirror-ready');
 const call=document.createElement('button');
 call.type='button';call.className='pvg-mirror-call';call.textContent='🐾 Call Gizmo';
 host.append(call);
 const speech=host.querySelector('.pvg-speech');
 let token=0;
 const images={idle:'gizmo-idle.png?v=1',walk:'gizmo-real-walk.webp?v=3',
 sit:'gizmo-sit.png?v=1',sleep:'gizmo-sleep.png?v=1',
 stretch:'gizmo-stretch.png?v=1',front:'gizmo-front-call.png?v=1'};
 function show(p){art.src=images[p]}
 function say(s){if(!speech)return;speech.textContent=s;speech.hidden=false;
 const v=++token;setTimeout(()=>{if(v===token)speech.hidden=true},2600)}
 rest.addEventListener('click',()=>{
  const v=++token;
  if(host.classList.contains('pvg-resting')){
   show('sit');setTimeout(()=>{if(v===token&&host.classList.contains('pvg-resting'))show('sleep')},1000);
  }else{
   show('stretch');setTimeout(()=>{if(v===token&&!host.classList.contains('pvg-resting'))show('idle')},1050);
  }
 });
 call.addEventListener('click',()=>{
  if(host.classList.contains('pvg-resting')){say('A royal nap, love. Tap Follow first!');return}
  const v=++token;show('front');say('You called, love? 🐾💜');
  setTimeout(()=>{if(v===token&&!host.classList.contains('pvg-resting'))show('idle')},3200);
 });
 function move(){
  if(host.classList.contains('pvg-resting'))return;
  const v=++token;show('walk');
  setTimeout(()=>{if(v===token&&!host.classList.contains('pvg-resting'))show('idle')},550);
 }
 document.querySelectorAll('[data-move]').forEach(b=>b.addEventListener('pointerdown',move,{passive:true}));
 document.addEventListener('keydown',e=>{
  if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase()))move();
 },{passive:true});
 art.addEventListener('error',()=>{host.classList.add('pvg-mirror-error')});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

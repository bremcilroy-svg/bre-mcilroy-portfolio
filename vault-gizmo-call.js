/* King Gizmo Phase 5 — Call, front view, and a safer mobile control layout.
   Additive; never writes to puzzle progress, localStorage, or navigation. */
(()=>{'use strict';
if(location.pathname.split('/').pop()!=='poetry-vault.html')return;
function init(){
 const host=document.getElementById('pv-gizmo-companion');
 const art=host?.querySelector('#pvg-real-artwork');
 const rest=host?.querySelector('.pvg-rest');
 if(!host||!art||!rest)return;
 if(host.querySelector('.pvg-call'))return;
 const call=document.createElement('button');
 call.type='button';call.className='pvg-call';
 call.textContent='🐾 Call Gizmo';call.setAttribute('aria-label','Call Gizmo to face you');
 host.append(call);host.classList.add('pvg-call-ready');
 const front='gizmo-front-call.png?v=1';
 const idle='gizmo-idle.png?v=1';
 let timer=0,active=false;
 const speech=host.querySelector('.pvg-speech');
 const showMessage=()=>{
  if(!speech)return;
  speech.textContent='You called, love? 🐾💜';
  speech.hidden=false;
  setTimeout(()=>{if(speech.textContent==='You called, love? 🐾💜')speech.hidden=true},2500);
 };
 function restore(){
  if(!active)return;
  active=false;host.classList.remove('pvg-called');
  // If resting, return to the current sleep pose, otherwise to the still pose.
  art.src=host.classList.contains('pvg-resting')?'gizmo-sleep.png?v=1':idle;
  host.classList.remove('pvg-call-facing');
 }
 function summon(){
  clearTimeout(timer);
  // Do not interrupt a nap; a visitor can press Follow first.
  if(host.classList.contains('pvg-resting')){
   if(speech){speech.textContent='His Majesty is napping. Tap Follow to wake him!';speech.hidden=false}
   return;
  }
  active=true;host.classList.add('pvg-called','pvg-call-facing');
  host.classList.remove('pvg-facing-left');
  art.src=front;
  showMessage();
  timer=setTimeout(restore,3200);
 }
 call.addEventListener('click',summon);
 rest.addEventListener('click',()=>{clearTimeout(timer);active=false;host.classList.remove('pvg-called','pvg-call-facing')});
 document.querySelectorAll('[data-move]').forEach(btn=>btn.addEventListener('pointerdown',()=>{
  if(active){clearTimeout(timer);restore()}
 },{passive:true}));
 document.addEventListener('keydown',e=>{
  if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(e.key.toLowerCase())&&active){
   clearTimeout(timer);restore()
  }
 },{passive:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

/* Kimmi's Birthday — a story lock on the Phase 13 Study Door.
   This is a client-side puzzle, not authentication or an access-control replacement. */
(()=>{
'use strict';
function mount(){
 const room=document.querySelector('#room'),door=room?.querySelector('#pv13-door'),enter=door?.querySelector('#pv13-enter');
 if(!room||!door||!enter||document.querySelector('#pv-kimmi-lock'))return;
 const lock=document.createElement('div');lock.id='pv-kimmi-lock';
 lock.innerHTML=`<div class="pvk-calendar" aria-label="Calendar: Friday September 13, Kimmi's Birthday">
 <div class="pvk-calendar-top">SEPTEMBER <span>✦</span></div>
 <div class="pvk-calendar-day">FRIDAY</div><div class="pvk-calendar-date">13</div>
 <div class="pvk-calendar-note">Kimmi's Birthday <span aria-hidden="true">🎂</span></div>
 </div>
 <div class="pvk-panel"><p class="pvk-eyebrow">A memory unlocks the door</p>
 <h3>The Birthday Lock</h3><p>Four wheels guard the Author's Study. Turn each wheel until the date is remembered.</p>
 <div class="pvk-wheels" role="group" aria-label="Four-wheel birthday combination lock"></div>
 <button type="button" class="pvk-try">✦ Try the Combination</button>
 <p class="pvk-status" role="status" aria-live="polite">The wheels are waiting for a special date.</p></div>`;
 const arch=door.querySelector('.pv13-arch')||door;
 arch.insertBefore(lock,enter);
 const wheels=lock.querySelector('.pvk-wheels'),status=lock.querySelector('.pvk-status');
 const values=[null,null,null,null],buttons=[];
 let unlocked=false;
 for(let i=0;i<4;i++){
  const column=document.createElement('div');column.className='pvk-column';
  const up=document.createElement('button');up.type='button';up.className='pvk-spin';up.textContent='▲';up.setAttribute('aria-label','Increase digit '+(i+1));
  const digit=document.createElement('div');digit.className='pvk-digit';digit.setAttribute('aria-label','Digit '+(i+1)+': birthday cake');digit.textContent='🎂';
  const down=document.createElement('button');down.type='button';down.className='pvk-spin';down.textContent='▼';down.setAttribute('aria-label','Decrease digit '+(i+1));
  function spin(direction){
   if(unlocked)return;
   values[i]=values[i]===null?(direction>0?0:9):(values[i]+direction+10)%10;
   digit.textContent=String(values[i]);
   digit.setAttribute('aria-label','Digit '+(i+1)+': '+values[i]);
   status.textContent='The brass wheels click into place.';
  }
  up.addEventListener('click',()=>spin(1));down.addEventListener('click',()=>spin(-1));
  column.append(up,digit,down);wheels.append(column);buttons.push(up,down);
 }
 const tryButton=lock.querySelector('.pvk-try');
 function openLock(){
  if(values.join('')==='0913'){
   unlocked=true;lock.classList.add('pvk-unlocked');
   status.textContent='✦ Click! Kimmi’s birthday opens the way. The study door is yours.';
   tryButton.textContent='✓ Birthday remembered';
   tryButton.disabled=true;
   buttons.forEach(b=>b.disabled=true);
   enter.classList.remove('pvk-sealed');
   enter.setAttribute('aria-describedby','pvk-open-note');
   let note=document.getElementById('pvk-open-note');
   if(!note){note=document.createElement('span');note.id='pvk-open-note';note.className='pvk-sr';note.textContent='Birthday lock solved. Enter the study.';enter.after(note);}
   enter.scrollIntoView({block:'nearest',behavior:'smooth'});
   enter.focus({preventScroll:true});
  }else{
   status.textContent='The lock stays closed. Look at the calendar and try again.';
   lock.classList.remove('pvk-shake');void lock.offsetWidth;lock.classList.add('pvk-shake');
  }
 }
 tryButton.addEventListener('click',openLock);
 enter.classList.add('pvk-sealed');
 // Block the Phase 13 entrance handler until the birthday puzzle is solved.
 enter.addEventListener('click',e=>{
  if(!unlocked){e.preventDefault();e.stopImmediatePropagation();status.textContent='The door is sealed. Spin the birthday wheels first.';lock.scrollIntoView({behavior:'smooth',block:'center'});}
 },true);
 // Don't override the original owner access check or the existing Fifth Door gate.
 // Puzzle is intentionally reset each page visit.
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
else mount();
})();

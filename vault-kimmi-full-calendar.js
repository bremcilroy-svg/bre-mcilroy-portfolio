/* Full September calendar for Kimmi's Birthday. Additive to original lock. */
(()=>{
 'use strict';
 function mount(){
  const cal=document.querySelector('#pv-kimmi-lock .pvk-calendar');
  if(!cal || cal.dataset.fullMonth==='true')return false;
  cal.dataset.fullMonth='true';
  cal.setAttribute('aria-label',"September calendar. Friday the 13th is Kimmi's Birthday.");
  cal.innerHTML='';
  const header=document.createElement('div');header.className='pvk-calendar-top';
  header.innerHTML='<span>SEPTEMBER</span><span aria-hidden="true">✦</span>';
  cal.append(header);
  const grid=document.createElement('div');grid.className='pvk-month-grid';
  grid.setAttribute('role','grid');grid.setAttribute('aria-label','September, beginning on Sunday');
  for(const day of ['SUN','MON','TUE','WED','THU','FRI','SAT']){
   const h=document.createElement('span');h.className='pvk-weekday';h.textContent=day;h.setAttribute('role','columnheader');grid.append(h);
  }
  // September with Friday on the 13th begins on Sunday (e.g., 2024).
  for(let n=1;n<=35;n++){
   const cell=document.createElement('div');cell.className='pvk-date-cell';cell.setAttribute('role','gridcell');
   if(n<=30){
    const num=document.createElement('span');num.className='pvk-date-num';num.textContent=String(n);cell.append(num);
    if(n===13){
     cell.classList.add('pvk-birthday-date');cell.setAttribute('aria-label',"Friday September 13: Kimmi's Birthday");
     cell.setAttribute('title',"Kimmi's Birthday");
     const cake=document.createElement('span');cake.className='pvk-date-cake';cake.textContent='🎂';cake.setAttribute('aria-hidden','true');cell.append(cake);
    }
   }else{cell.classList.add('pvk-empty');cell.setAttribute('aria-hidden','true');}
   grid.append(cell);
  }
  cal.append(grid);
  const note=document.createElement('div');note.className='pvk-calendar-note';note.innerHTML="<span class='pvk-heart'>♥</span> Kimmi's Birthday <span aria-hidden='true'>🎂</span>";
  cal.append(note);
  return true;
 }
 function init(){
  if(mount())return;
  const observer=new MutationObserver(()=>{if(mount())observer.disconnect()});
  observer.observe(document.body,{childList:true,subtree:true});
  setTimeout(()=>observer.disconnect(),15000);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

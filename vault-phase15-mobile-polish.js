/* Phase 15: keep the birthday puzzle clear on small screens. */
(()=>{'use strict';
function start(){
 const puzzle=document.querySelector('#pv-kimmi-lock');
 if(!puzzle)return;
 const button=document.createElement('button');
 button.type='button';button.id='pv15-helpers';button.textContent='☰ Show helpers';
 button.setAttribute('aria-expanded','false');
 button.setAttribute('aria-label','Show Journey Map and Gizmo');
 document.body.append(button);
 let inView=false,expanded=false;
 const sync=()=>{
  const small=window.matchMedia('(max-width: 700px)').matches;
  document.body.classList.toggle('pv15-puzzle-visible',small&&inView);
  document.body.classList.toggle('pv15-helpers-open',small&&inView&&expanded);
  button.hidden=!(small&&inView);
  button.textContent=expanded?'✕ Hide helpers':'☰ Show helpers';
  button.setAttribute('aria-expanded',String(expanded));
 };
 button.addEventListener('click',()=>{expanded=!expanded;sync()});
 const observer=new IntersectionObserver(entries=>{inView=entries.some(e=>e.isIntersecting);if(!inView)expanded=false;sync()},{rootMargin:'-8% 0px -10% 0px',threshold:0});
 observer.observe(puzzle);
 window.addEventListener('resize',sync,{passive:true});
 // Close helper overlays when user returns to the lock.
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&expanded){expanded=false;sync()} });
 sync();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

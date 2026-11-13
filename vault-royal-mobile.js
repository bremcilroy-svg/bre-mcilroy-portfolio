/* Phase 15.2 repair: compact, accessible mobile study controls. No puzzle or save changes. */
(()=>{
 'use strict';
 function mount(){
  const panel=document.getElementById('pv12-experience');
  if(!panel||panel.dataset.royalMobile==='ready')return;
  const controls=panel.querySelector('.pv12-controls');
  const actions=panel.querySelector('.pv12-actions');
  const hud=panel.querySelector('.pv12-hud');
  if(!controls||!actions||!hud)return;
  panel.dataset.royalMobile='ready';
  const toggle=document.createElement('button');
  toggle.type='button';toggle.className='pvr-menu-toggle';
  toggle.textContent='✦ Explore';
  toggle.setAttribute('aria-expanded','false');
  toggle.setAttribute('aria-controls','pvr-actions-menu');
  actions.id='pvr-actions-menu';
  actions.before(toggle);
  function close(){panel.classList.remove('pvr-menu-open');toggle.setAttribute('aria-expanded','false');toggle.textContent='✦ Explore';}
  toggle.addEventListener('click',()=>{
   const opened=panel.classList.toggle('pvr-menu-open');
   toggle.setAttribute('aria-expanded',String(opened));
   toggle.textContent=opened?'✕ Close':'✦ Explore';
  });
  actions.addEventListener('click',e=>{if(e.target.closest('button'))close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&panel.classList.contains('pvr-menu-open')){close();e.stopPropagation();}},true);
  // Status is readable to screen readers, but disappears visually when idle.
  let timer;
  const reveal=()=>{
   hud.classList.add('pvr-hud-visible');
   clearTimeout(timer);
   timer=setTimeout(()=>hud.classList.remove('pvr-hud-visible'),3500);
  };
  const observer=new MutationObserver(reveal);
  observer.observe(hud,{childList:true,characterData:true,subtree:true});
  reveal();
  // Never move or recreate Gizmo; only adjust his position through CSS.
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();

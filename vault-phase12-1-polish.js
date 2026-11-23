/* Phase 12.1 — additive mobile usability improvements */
(()=>{
'use strict';
function init(){
 const panel=document.querySelector('#pv12-experience');
 if(!panel||panel.dataset.pv121==='ready')return;
 panel.dataset.pv121='ready';
 const intro=panel.querySelector('.pv12-intro');
 const viewport=panel.querySelector('.pv12-viewport');
 const hud=panel.querySelector('#pv12-hud');
 if(!intro||!viewport)return;
 // Dock the existing Journey Map in document flow, instead of covering movement controls.
 const journey=document.querySelector('#pv11-journey');
 if(journey){
  const dock=document.createElement('div');dock.className='pv121-journey-dock';
  intro.append(dock);dock.append(journey);
 }
 // Add an optional immersive viewing mode. Browser support varies.
 const actions=panel.querySelector('.pv12-actions');
 if(actions){
  const full=document.createElement('button');
  full.type='button';full.className='pv121-fullscreen';
  full.textContent='⛶ Expand room';
  full.setAttribute('aria-label','Expand the 3D room to full screen');
  actions.prepend(full);
  const sync=()=>{full.textContent=document.fullscreenElement?'⤢ Exit full screen':'⛶ Expand room'};
  document.addEventListener('fullscreenchange',sync);
  full.addEventListener('click',async()=>{
   try{
    if(document.fullscreenElement)await document.exitFullscreen();
    else if(viewport.requestFullscreen)await viewport.requestFullscreen();
    else if(hud)hud.textContent='Full screen is not available in this browser.';
   }catch{if(hud)hud.textContent='Your browser does not allow full screen here.';}
   sync();
  });
 }
 // Explain how to inspect portraits without duplicating or changing original photo click handlers.
 const hint=document.createElement('p');
 hint.className='pv121-hint';
 hint.textContent='Tip: Turn to face a picture, then tap directly on its frame. Use “Inspect what I’m facing” if it is centered.';
 viewport.insertAdjacentElement('afterend',hint);
 // Keep the original puzzles and gallery untouched. Improve button descriptions for screen readers.
 const names={left:'Turn left to see the memory wall',right:'Turn right to see the guardian wall',forward:'Walk toward the wall you are facing',backward:'Step backward'};
 for(const [action,label] of Object.entries(names)){
  const button=panel.querySelector('[data-action="'+action+'"]');
  if(button)button.setAttribute('aria-label',label);
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
// The phase 12 module loads asynchronously; wait for its panel without polling.
if(!document.querySelector('#pv12-experience')){
 const observer=new MutationObserver(()=>{if(document.querySelector('#pv12-experience')){observer.disconnect();init();}});
 observer.observe(document.documentElement,{subtree:true,childList:true});
 setTimeout(()=>observer.disconnect(),20000);
}
})();
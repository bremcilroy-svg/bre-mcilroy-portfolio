/* Cinematic entrance for existing Phase 13 door. No puzzle, gate, or save changes. */
(()=>{'use strict';
function init(){
 const button=document.getElementById('pv13-enter');
 if(!button)return;
 let bypass=false,playing=false;
 const overlay=document.createElement('div');overlay.id='pv-cinema';overlay.hidden=true;
 overlay.setAttribute('role','status');overlay.setAttribute('aria-label','Opening the Author’s Study doors');
 overlay.innerHTML='<div class="cinema-backdrop"></div><div class="cinema-light"></div><div class="cinema-doors"><div class="cinema-door"></div><div class="cinema-door"></div></div><div class="cinema-title">The Author’s Study<br><small style="font-size:.45em">Every story leaves a door open.</small></div><button type="button" class="cinema-skip">Skip animation →</button>';
 document.body.append(overlay);
 let finishTimer;
 const finish=()=>{if(!playing)return;playing=false;clearTimeout(finishTimer);overlay.hidden=true;overlay.classList.remove('opening');bypass=true;try{button.click()}finally{bypass=false}requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')))};
 overlay.querySelector('.cinema-skip').addEventListener('click',finish);
 button.addEventListener('click',e=>{
  if(bypass||playing||button.disabled)return;
  e.preventDefault();e.stopImmediatePropagation();playing=true;overlay.hidden=false;
  requestAnimationFrame(()=>requestAnimationFrame(()=>overlay.classList.add('opening')));
  finishTimer=setTimeout(finish,1900);
 },true);
 document.addEventListener('keydown',e=>{if(playing&&e.key==='Escape')finish()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

/* The Poetry Vault: final progressive polish. No puzzle answers or access gates changed. */
(()=>{'use strict';
 function ready(){
   // Move the existing helper toggle inside the birthday puzzle so it cannot
   // float over the lock or cover Kimmi's calendar on narrow phones.
   const lock=document.getElementById('pv-kimmi-lock');
   const helper=document.getElementById('pv15-helpers');
   if(lock&&helper&&helper.parentElement!==lock)lock.prepend(helper);
   // Preserve Phase 15's show/hide state logic; only change button placement.
   if(lock&&helper)helper.setAttribute('aria-controls','pv11-journey');
   // Escape key closes open helper panels without interfering with puzzle dialogs.
   document.addEventListener('keydown',e=>{
     if(e.key!=='Escape')return;
     const journey=document.querySelector('#pv11-journey .pv11-routes');
     if(journey&&!journey.hidden)document.querySelector('#pv11-journey .pv11-toggle')?.click();
   });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();

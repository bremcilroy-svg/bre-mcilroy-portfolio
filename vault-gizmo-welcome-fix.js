/* Gizmo welcome completion patch. Preserves existing game saves. */
(()=>{'use strict';
function init(){
 const panel=document.getElementById('pvg-welcome');if(!panel)return;
 const begin=panel.querySelector('.pvg-welcome-begin');
 const name=panel.querySelector('#pvg-guest-name');
 const error=panel.querySelector('.pvg-welcome-error');
 const narr=panel.querySelector('#pvg-narration');
 const voice=panel.querySelector('#pvg-voice');
 const enter=document.getElementById('enter-vault');
 const resume=document.getElementById('continue-game');
 let destination='enter';
 enter?.addEventListener('click',()=>{destination='enter'},true);
 resume?.addEventListener('click',()=>{if(!resume.disabled)destination='resume'},true);
 begin?.addEventListener('click',e=>{
  e.stopImmediatePropagation();
  const first=name.value.trim().replace(/\s+/g,' ');
  const valid=/^[\p{L}][\p{L}\p{M} '\-]{0,29}$/u.test(first);
  if(!valid){error.hidden=false;name.focus();return;}
  error.hidden=true;
  try{localStorage.setItem('pv_gizmo_guest_first_name_v1',first);
      localStorage.setItem('pv_gizmo_voice_v1',voice.value);
      localStorage.setItem('pv_gizmo_narration_v1',String(narr.checked));}catch{}
  window.speechSynthesis?.cancel();panel.close();
  if(destination==='resume'&&!resume.disabled){
   /* Resolve the saved chapter using the same journey helper as the entrance. */
   import('./vault-journey.js?v=20261112-entrance').then(({readJourney})=>{
     const journey=readJourney(key=>localStorage.getItem(key));
     window.location.assign((journey.hasProgress?journey.route:'poetry-vault.html')+'?resume=1');
   }).catch(()=>window.location.assign('poetry-vault.html?resume=1'));
  }else{window.location.assign(enter.getAttribute('href')||'poetry-vault.html');}
 },true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

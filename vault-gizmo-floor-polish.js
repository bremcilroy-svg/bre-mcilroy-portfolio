/* Heart Chamber placement-only polish; no save, puzzle or navigation changes. */
(()=>{'use strict';
if(location.pathname.split('/').pop()!=='poetry-vault.html')return;
function init(){
 const host=document.querySelector('#pv-gizmo-companion');
 if(!host)return;
 host.classList.add('pvg-floor-polished');
 // Hide while the chamber is not in play, and restore on entering.
 const play=document.querySelector('#play-ui');
 const update=()=>{host.classList.toggle('pvg-floor-preplay',!!play?.hidden)};
 update();
 if(play)new MutationObserver(update).observe(play,{attributes:true,attributeFilter:['hidden']});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

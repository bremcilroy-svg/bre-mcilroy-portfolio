/* Gizmo artwork visibility fix, Heart Chamber only. No game state changes. */
(()=>{'use strict';
if(location.pathname.split('/').pop()!=='poetry-vault.html')return;
function init(){
 const host=document.getElementById('pv-gizmo-companion');if(!host)return;
 const cat=host.querySelector('.pvg-cat');if(!cat)return;
 // Use a dedicated image that legacy art replacement scripts cannot overwrite.
 let image=host.querySelector('#pvg-real-artwork');
 if(!image){image=document.createElement('img');image.id='pvg-real-artwork';image.alt='';image.setAttribute('aria-hidden','true');cat.appendChild(image)}
 image.src='gizmo-real-walk.webp?v=3';
 host.classList.add('pvg-display-repaired');
 image.addEventListener('error',()=>{host.classList.add('pvg-art-load-error');const speech=host.querySelector('.pvg-speech');if(speech){speech.textContent='Gizmo artwork did not load. Check gizmo-real-walk.webp in GitHub.';speech.hidden=false;}},{once:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

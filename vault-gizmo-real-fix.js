/* Heart Chamber Gizmo realism patch: only artwork and placement; no puzzle/save changes. */
(()=>{'use strict';
if(location.pathname.split('/').pop()!=='poetry-vault.html')return;
function mount(){
 const host=document.querySelector('#pv-gizmo-companion');
 if(!host)return;
 const art=host.querySelector('.pvg-art');
 if(!art)return;
 const img=document.createElement('img');
 img.className='pvg-real-image';
 img.src='gizmo-real-walk.webp?v=2';
 img.alt='';img.decoding='async';
 img.addEventListener('error',()=>{
   host.classList.remove('pvg-real-fixed');
   console.warn('Gizmo animation missing: upload gizmo-real-walk.webp to the repository root.');
 });
 art.replaceChildren(img);
 host.classList.add('pvg-real-fixed');
 host.classList.remove('pvg-visible-original');
 host.style.removeProperty('--pvg-offset');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();

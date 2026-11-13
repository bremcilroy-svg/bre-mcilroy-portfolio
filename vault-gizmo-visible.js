/* Gizmo visibility fix: exact original Author's Room SVG as a standalone asset. */
(()=>{'use strict';
function mount(){
 const host=document.getElementById('pv-gizmo-companion');
 if(!host)return;
 const art=host.querySelector('.pvg-art');
 if(!art)return;
 const img=document.createElement('img');
 img.src='vault-gizmo-original.svg?v=2';
 img.alt='';img.decoding='async';img.width=78;img.height=88;
 img.className='pvg-original-img';
 img.addEventListener('error',()=>{img.remove();host.classList.remove('pvg-visible-original')});
 art.replaceChildren(img);
 host.classList.add('pvg-visible-original');
 // Remove old horizontal translation so he cannot wander off-screen.
 host.style.setProperty('--pvg-offset','0px');
 const bounds=()=>host.style.setProperty('--pvg-offset','0px');
 // Existing walking events may adjust the offset; clamp via CSS instead.
 window.addEventListener('pageshow',bounds,{passive:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();

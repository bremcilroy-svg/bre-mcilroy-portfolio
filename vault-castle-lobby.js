/* Castle lobby exploration: optional, accessible, and save-neutral. */
(()=>{'use strict';
const root=document.querySelector('#castle-lobby-explore');if(!root)return;
const scenes=[
 {name:'The Grand Entrance',description:'Silver banners frame the ruby and amethyst hall. Snow owls watch from the rafters.',detail:'The main gates open behind you.'},
 {name:'The Poetry Vault Door',description:'An ancient silver-trimmed door glows with icy blue light. The Heart Chamber lies beyond.',detail:'The door leads into the first escape room.'},
 {name:'The Owl Alcove',description:'A carved snow owl with sapphire eyes guards a quiet alcove. More Academy adventures will arrive later.',detail:'The Academy passage is not yet open.'}
];let index=1;
const name=root.querySelector('#castle-lobby-name'),desc=root.querySelector('#castle-lobby-description'),detail=root.querySelector('#castle-lobby-detail'),door=root.querySelector('#castle-lobby-open'),scene=root.querySelector('#castle-lobby-scene');
function render(){const s=scenes[index];name.textContent=s.name;desc.textContent=s.description;detail.textContent=s.detail;root.dataset.view=String(index);door.hidden=index!==1;root.querySelector('#castle-lobby-left').disabled=index===0;root.querySelector('#castle-lobby-right').disabled=index===2;scene.setAttribute('aria-label',s.name+'. '+s.description);}
function turn(step){index=Math.max(0,Math.min(2,index+step));render();}
root.querySelector('#castle-lobby-left').addEventListener('click',()=>turn(-1));
root.querySelector('#castle-lobby-right').addEventListener('click',()=>turn(1));
root.querySelector('#castle-lobby-center').addEventListener('click',()=>{index=1;render();});
scene.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();turn(e.key==='ArrowLeft'?-1:1)}if(e.key==='Enter'&&index===1)door.click();});
let start=null;scene.addEventListener('pointerdown',e=>{start={x:e.clientX,y:e.clientY,id:e.pointerId};});scene.addEventListener('pointerup',e=>{if(!start||start.id!==e.pointerId)return;const dx=e.clientX-start.x;if(Math.abs(dx)>55)turn(dx<0?1:-1);start=null;});scene.addEventListener('pointercancel',()=>{start=null;});
door.addEventListener('click',()=>{door.setAttribute('aria-busy','true');root.classList.add('castle-lobby-opening');setTimeout(()=>location.assign('poetry-vault.html'),matchMedia('(prefers-reduced-motion: reduce)').matches?0:400);});
render();
})();

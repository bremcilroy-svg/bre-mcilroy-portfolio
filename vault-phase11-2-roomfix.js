(() => {
'use strict';
const room=document.querySelector('#room'),stage=room?.querySelector('#author-immersive .ai6-stage'),world=stage?.querySelector('.ai6-world'),gallery=room?.querySelector('#pv10-gallery');
if(!stage||!world||!gallery||document.querySelector('#pv112-controls'))return;
document.querySelector('#pv11-memory-wall')?.remove();
const dialog=gallery.querySelector('#pv10-viewer');
if(dialog)document.body.append(dialog);
gallery.style.display='none';
const old=world.querySelector('#pv10-wall-gallery');if(old)old.style.display='none';
const items=[
['pv10-memory-1.jpg','Colorful portrait',0,'photo'],['pv10-memory-2.jpg','Tender memory',1,'photo'],['pv10-memory-3.jpg','Friends together',2,'photo'],
['pv10-memory-4.jpg','Smiling selfie',3,'photo'],['pv10-memory-5.jpg','Holiday memory',4,'photo'],
['pv10-zebra.jpg','Zebra guardian',5,'animal'],['pv10-wolf.jpg','Wolf guardian',6,'animal'],['pv10-turtle.jpg','Ocean guardian',7,'animal']
];
const sets=[items.slice(0,3),items.slice(3,5),items.slice(5)];
const wall=document.createElement('div');wall.id='pv112-wall';wall.innerHTML='<div class="pv112-wall-surface"></div><div class="pv112-pictures"></div>';
world.append(wall);
const controls=document.createElement('div');controls.id='pv112-controls';
controls.innerHTML='<p>Explore the portraits hanging in the study</p><div><button type="button" data-wall="prev">← Previous wall</button><button type="button" data-wall="home">Writing desk & Moose</button><button type="button" data-wall="next">Next wall →</button></div><p id="pv112-status" role="status"></p>';
stage.insertAdjacentElement('afterend',controls);
let view=-1;
function render(){
stage.classList.toggle('pv112-gallery-view',view!==-1);
const holder=wall.querySelector('.pv112-pictures');holder.replaceChildren();
if(view<0){controls.querySelector('#pv112-status').textContent='The original study: Moose, Gizmo, and the writing desk.';return;}
controls.querySelector('#pv112-status').textContent=['The Memory Wall · I','The Memory Wall · II','The Guardian Wall'][view]+' — tap a portrait to inspect it.';
for(const [src,label,i,type] of sets[view]){
const b=document.createElement('button');b.type='button';b.className='pv112-portrait '+type;b.setAttribute('aria-label','Inspect '+label);
const img=document.createElement('img');img.src=src;img.alt=label;b.append(img);
b.addEventListener('click',()=>gallery.querySelector('.pv10-frame[data-pv10="'+i+'"]')?.click());
holder.append(b);
}
}
controls.addEventListener('click',e=>{
const b=e.target.closest('button[data-wall]');if(!b)return;
if(b.dataset.wall==='home')view=-1;
else if(b.dataset.wall==='next')view=view<0?0:(view+1)%sets.length;
else view=view<0?sets.length-1:(view+sets.length-1)%sets.length;
render();
});
render();
})();
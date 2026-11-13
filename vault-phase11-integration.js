/* Phase 11.1 — additive route guide and memory wall. Does not alter gate or game saves. */
(()=>{
'use strict';
if(document.getElementById('pv11-journey'))return;
const path=location.pathname.split('/').pop()||'index.html';
const routes=[
 ['poetry-vault-entrance.html','Entrance','Begin the adventure'],
 ['poetry-vault.html','Four Chambers','Solve the original puzzles'],
 ['poetry-vault-society.html','Keepers’ Hall','Discover the hidden seals'],
 ['poetry-vault-fifth-door.html','Fifth Door','Open the unwritten chapter'],
 ['poetry-vault-author-room.html','Author’s Study','Explore the hidden room']
];
const css=(tag,cls,txt)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(txt)el.textContent=txt;return el};
const nav=css('nav','pv11-journey');nav.id='pv11-journey';nav.setAttribute('aria-label','Poetry Vault journey navigation');
const toggle=css('button','pv11-toggle','☰ Journey map');toggle.type='button';toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls','pv11-routes');
const list=css('div','pv11-routes');list.id='pv11-routes';list.hidden=true;
for(const [href,name,description] of routes){
 const a=css('a','pv11-route');a.href=href;
 const strong=css('strong','',name),small=css('small','',description);
 a.append(strong,small);
 if(path===href){a.setAttribute('aria-current','page');a.classList.add('pv11-current')}
 list.append(a);
}
const close=css('button','pv11-close','Close map ×');close.type='button';close.addEventListener('click',()=>{list.hidden=true;toggle.setAttribute('aria-expanded','false')});
list.append(close);nav.append(toggle,list);
toggle.addEventListener('click',()=>{list.hidden=!list.hidden;toggle.setAttribute('aria-expanded',String(!list.hidden))});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!list.hidden){list.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.focus()}});
document.body.append(nav);
const room=document.getElementById('room');
if(!room||path!=='poetry-vault-author-room.html')return;
const scene=room.querySelector('#author-immersive');
const gallery=room.querySelector('#pv10-gallery');
if(scene&&gallery&&!document.getElementById('pv11-memory-wall')){
 const section=css('section','pv11-memory-wall');section.id='pv11-memory-wall';
 section.setAttribute('aria-labelledby','pv11-wall-title');
 const eyebrow=css('p','pv11-eyebrow','THE AUTHOR’S STUDY · A WALL OF STORIES');
 const h=css('h3','', 'Portraits from the Vault');h.id='pv11-wall-title';
 const intro=css('p','', 'Gizmo has found a quiet wall where memories and guardians belong. Touch a portrait to look closer.');
 const wall=css('div','pv11-portraits');
 const data=[
  ['pv10-memory-1.jpg','A colorful portrait together',0,'memory'],
  ['pv10-memory-2.jpg','A tender moment on the couch',1,'memory'],
  ['pv10-memory-3.jpg','Friends at the laundromat',2,'memory'],
  ['pv10-memory-4.jpg','A smiling selfie together',3,'memory'],
  ['pv10-memory-5.jpg','A holiday memory',4,'memory'],
  ['pv10-zebra.jpg','Zebra guardian',5,'animal'],
  ['pv10-wolf.jpg','Wolf guardian',6,'animal'],
  ['pv10-turtle.jpg','Ocean turtle guardian',7,'animal turtle']
 ];
 for(const [src,alt,index,type] of data){
  const b=css('button','pv11-portrait '+type);b.type='button';b.setAttribute('aria-label','Inspect '+alt);
  const img=document.createElement('img');img.src=src;img.alt='';img.loading='lazy';img.decoding='async';
  b.append(img);b.addEventListener('click',()=>{
   if(room.hidden)return;
   const original=gallery.querySelector(`.pv10-frame[data-pv10="${index}"]`);
   if(original)original.click();
   else gallery.scrollIntoView({behavior:'smooth',block:'start'});
  });wall.append(b);
 }
 section.append(eyebrow,h,intro,wall);
 // A physical portrait wall adjoining the navigable study, not an overlay obscuring movement.
 scene.append(section);
}
if(!document.getElementById('pv11-finale')){
 const finale=css('section','pv11-finale');finale.id='pv11-finale';
 const h=css('h2','','The story continues beyond the door');
 const p=css('p','','You found your way through the library. Some words were hidden; others were waiting to be shared. Thank you for stepping into The Poetry Vault.');
 const links=css('div','pv11-finale-links');
 for(const [href,name] of [['poetry-vault-entrance.html','↺ Return to the entrance'],['poetry-vault-society.html','✧ Revisit the Keepers'],['index.html','✦ Explore Bre’s portfolio']]){
  const a=css('a','',name);a.href=href;links.append(a);
 }
 finale.append(h,p,links);
 room.append(finale);
}
})();
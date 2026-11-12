import * as THREE from './vault-three.module.js';
// Small transform animations work in both renderers. Reduced-motion settings
// apply immediately; saved states also restore immediately without replaying.
export function createRoomCinematics(){
 const jobs=new Map(),reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 function tween(key,read,write,to,duration=.8,instant=false){const from=read();if(instant||reduced()){jobs.delete(key);write(to);return;}jobs.set(key,{from,to,write,start:performance.now(),duration:duration*1000});}
 return{get active(){return jobs.size>0;},tween,tick(now){for(const [key,j]of jobs){const t=Math.min(1,(now-j.start)/j.duration),e=1-Math.pow(1-t,3);j.write(j.from+(j.to-j.from)*e);if(t===1)jobs.delete(key);}},door(scene,parts,x,z,direction=1,portal=true){
  const pivot=new THREE.Group();pivot.position.set(x,0,z);scene.add(pivot);scene.updateMatrixWorld(true);parts.forEach(mesh=>pivot.attach(mesh));
  if(portal){const glow=new THREE.Mesh(new THREE.PlaneGeometry(1.57,2.94),new THREE.MeshBasicMaterial({color:0xe4d4a7}));glow.position.set(x+.85,1.5,z+direction*.12);if(direction>0)glow.rotation.y=Math.PI;scene.add(glow);}
  return instant=>tween(pivot,()=>pivot.rotation.y,v=>pivot.rotation.y=v,-direction*1.28,1.1,instant);
 },book(scene,book,width=.85,depth=.65){
  // A separate paper spread and hinged cover sit above the existing binding.
  const spread=new THREE.Group();book.add(spread);spread.visible=false;
  for(const x of [-width*.39,width*.39]){const page=new THREE.Mesh(new THREE.BoxGeometry(width*.75,.022,depth*.9),new THREE.MeshStandardMaterial({color:0xe9d9b3,roughness:1}));page.position.set(x,.12,0);spread.add(page);}
  const hinge=new THREE.Group();hinge.position.set(-width*.5,.1,0);book.add(hinge);const lid=new THREE.Mesh(new THREE.BoxGeometry(width,.045,depth),new THREE.MeshStandardMaterial({color:0x743746,roughness:.8}));lid.position.x=width*.5;hinge.add(lid);
  return instant=>{spread.visible=true;tween(hinge,()=>hinge.rotation.z,v=>hinge.rotation.z=v,2.65,.9,instant);};
 }};
}
export function chapterEffect(kind='unlock'){
 document.body.dataset.cinematic=kind;document.body.classList.remove('vault-celebrate');
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches){void document.body.offsetWidth;document.body.classList.add('vault-celebrate');clearTimeout(chapterEffect.timer);chapterEffect.timer=setTimeout(()=>document.body.classList.remove('vault-celebrate'),1100);}
}

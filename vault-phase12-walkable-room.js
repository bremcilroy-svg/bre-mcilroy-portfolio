/* Phase 12 — Walkable Victorian study, progressive WebGL enhancement.
   Keeps existing original puzzles, journal, gate, and fallback room intact. */
(async()=>{
'use strict';
const room=document.querySelector('#room');
const immersive=room?.querySelector('#author-immersive');
if(!immersive||document.getElementById('pv12-experience'))return;
const fallback=immersive.querySelector('.ai6-stage');
const panel=document.createElement('section');
panel.id='pv12-experience';panel.hidden=true;
panel.setAttribute('aria-label','Walk inside the Victorian Author’s Study');
panel.innerHTML=`<div class="pv12-intro"><h3>Inside the Author’s Study</h3><p>Walk with the arrows, turn to look around, and tap a framed portrait or object to inspect it.</p></div>
<div class="pv12-viewport" tabindex="0" role="application" aria-label="First person Victorian study. Drag to look around, use movement buttons to walk."><div class="pv12-aim" aria-hidden="true">✦</div><div class="pv12-hud" id="pv12-hud" role="status">The library is waiting.</div></div>
<div class="pv12-controls"><div class="pv12-turn"><button type="button" data-action="left">↶ Turn left</button><button type="button" data-action="right">Turn right ↷</button></div><div class="pv12-walk"><button type="button" data-action="forward">↑ Walk</button><button type="button" data-action="backward">↓ Back</button></div></div>
<div class="pv12-actions"><button type="button" data-action="inspect">✦ Inspect what I'm facing</button><button type="button" data-action="reset">⌂ Return to doorway</button><button type="button" data-action="gizmo">🐾 Pet Gizmo</button><button type="button" data-action="original">Original discoveries ↓</button></div>
<p class="pv12-note">Drag inside the scene to turn your head. Tap a picture to enlarge it. If 3D isn't supported, the original interactive study remains available.</p>`;
const heading=immersive.querySelector('.ai6-heading');
heading?.insertAdjacentElement('afterend',panel);
let THREE;
try{THREE=await import('https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js');}
catch(e){console.warn('3D study unavailable; keeping original room.',e);return;}
const viewport=panel.querySelector('.pv12-viewport');
let renderer;
try{
renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.setSize(640,420,false);
viewport.prepend(renderer.domElement);
}catch(e){console.warn('WebGL unavailable; keeping original room.',e);return;}
const scene=new THREE.Scene();scene.background=new THREE.Color('#1c1220');scene.fog=new THREE.Fog('#1c1220',8,22);
const camera=new THREE.PerspectiveCamera(70,1,.07,40);
const state={x:0,z:3.7,yaw:0};
camera.rotation.order='YXZ';
const ambient=new THREE.HemisphereLight('#b8b1d4','#3e2531',1.5);scene.add(ambient);
const candleLight=new THREE.PointLight('#ffc28a',22,9,2);candleLight.position.set(-3,2.6,-3.4);scene.add(candleLight);
const moonLight=new THREE.PointLight('#99b6ff',15,10,2);moonLight.position.set(2.5,3,-4.7);scene.add(moonLight);
const materials={floor:new THREE.MeshStandardMaterial({color:'#58362e',roughness:.83}),wood:new THREE.MeshStandardMaterial({color:'#402523',roughness:.7}),gold:new THREE.MeshStandardMaterial({color:'#bd9259',metalness:.45,roughness:.42}),purple:new THREE.MeshStandardMaterial({color:'#3e2a42',roughness:.95}),wall:new THREE.MeshStandardMaterial({color:'#3b293e',roughness:1}),cream:new THREE.MeshStandardMaterial({color:'#d9bfa5',roughness:.9}),glass:new THREE.MeshBasicMaterial({color:'#576688'})};
const hit=[];
function box(w,h,dep,x,y,z,mat,rot=0){
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,dep),mat);
 mesh.position.set(x,y,z);mesh.rotation.y=rot;scene.add(mesh);return mesh;
}
function plane(w,h,x,y,z,mat,rot=0){
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);
 mesh.position.set(x,y,z);mesh.rotation.y=rot;scene.add(mesh);return mesh;
}
function texture(url){
 const t=new THREE.TextureLoader().load(url,()=>{},undefined,()=>{});
 t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
}
function framed(src,label,x,y,z,w,h,rot,action,embedded=false){
 const group=new THREE.Group();group.position.set(x,y,z);group.rotation.y=rot;
 const frame=new THREE.Mesh(new THREE.BoxGeometry(w+.16,h+.16,.12),materials.gold);frame.position.z=-.055;group.add(frame);
 const mat=new THREE.MeshBasicMaterial({map:texture(src),side:THREE.DoubleSide});
 const picture=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);picture.position.z=.025;group.add(picture);
 const back=new THREE.Mesh(new THREE.BoxGeometry(w+.25,h+.25,.035),materials.wood);back.position.z=-.13;group.add(back);
 scene.add(group);
 picture.userData={action,label};hit.push(picture);
 return group;
}
function objectLabel(text,x,y,z,rot,action,w=1.25,h=.43){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=160;
 const ctx=canvas.getContext('2d');ctx.fillStyle='#41273b';ctx.fillRect(0,0,512,160);
 ctx.strokeStyle='#d4a46b';ctx.lineWidth=9;ctx.strokeRect(5,5,502,150);
 ctx.fillStyle='#f5ddba';ctx.font='bold 40px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,80);
 const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;
 const m=plane(w,h,x,y,z,new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide}),rot);
 m.userData={action,label:text};hit.push(m);
}
function wall(w,h,d,x,y,z){box(w,h,d,x,y,z,materials.wall);}
box(12,.16,12,0,-.08,0,materials.floor);
box(12,.2,12,0,4.3,0,materials.wood);
wall(12,4.3,.25,0,2.15,-6);
wall(12,4.3,.25,0,2.15,6);
wall(.25,4.3,12,-6,2.15,0);
wall(.25,4.3,12,6,2.15,0);
// Victorian paneling, floor boards and molding.
for(let i=-5.6;i<=5.7;i+=1.2){
 box(.05,4,.1,i,2.1,-5.82,materials.wood);
 box(.05,4,.1,i,2.1,5.82,materials.wood);
 box(.1,4,.05,-5.82,2.1,i,materials.wood);
 box(.1,4,.05,5.82,2.1,i,materials.wood);
}
for(let i=-5.5;i<6;i+=.8)box(.025,.02,12,i,.01,0,materials.gold);
for(const z of [-5.81,5.81]){box(12,.16,.12,0,.6,z,materials.gold);box(12,.13,.12,0,3.92,z,materials.gold);}
for(const x of [-5.81,5.81]){box(.12,.16,12,x,.6,0,materials.gold);box(.12,.13,12,x,3.92,0,materials.gold);}
// Moonlit arched window, facing the entrance.
box(2.2,2.5,.12,1.6,2.75,-5.7,materials.gold);
plane(1.96,2.25,1.6,2.75,-5.61,materials.glass);
box(.07,2.3,.12,1.6,2.75,-5.54,materials.gold);
box(2.1,.07,.12,1.6,2.75,-5.54,materials.gold);
const moon=new THREE.Mesh(new THREE.SphereGeometry(.32,16,12),new THREE.MeshBasicMaterial({color:'#e6e7ce'}));
moon.position.set(1.95,3.2,-5.48);scene.add(moon);
// Shelves and books.
for(let level=0;level<4;level++){
 box(2.8,.12,.7,-3.85,.75+level*.75,-5.15,materials.wood);
 for(let j=0;j<12;j++){
  const palette=['#6c394a','#8c684e','#3d4e61','#62455f'];
  const mat=new THREE.MeshStandardMaterial({color:palette[(j+level)%4]});
  box(.13,.4+(j%3)*.08,.42,-5.05+j*.215,1.04+level*.75,-5.1,mat);
 }
}
box(3,.15,.9,-3.85,.47,-5.12,materials.wood);
objectLabel('BOOKS',-3.85,3.7,-5.0,0,'books',1.3,.42);
// Writing desk, chair and journal.
box(2.6,.19,1.2,0,.95,-2.6,materials.wood);
for(const x of [-1,1])for(const z of [-3,-2.2])box(.12,.9,.12,x,.45,z,materials.wood);
box(.7,.1,.5,.1,1.08,-2.6,materials.gold);
objectLabel('WRITING DESK',0,1.52,-2.55,0,'letter',1.6,.4);
box(.7,.08,.7,0,.48,-.7,materials.wood);
box(.7,1,.08,0,.95,-.98,materials.wood);
objectLabel('MUSIC BOX',4.1,1.6,-5.68,0,'music');
objectLabel('CAMERA',5.72,1.5,-1.7,-Math.PI/2,'photography');
objectLabel('LOCKED DRAWER',-.9,1.18,-2.01,0,'drawer',1.55,.35);
// Fireplace on right wall.
box(.45,2.4,2.4,5.65,1.2,1.1,materials.wood);
box(.14,1.2,1.25,5.37,.78,1.1,new THREE.MeshBasicMaterial({color:'#160c12'}));
box(.18,.2,2.7,5.3,2.3,1.1,materials.gold);
// Carpet.
const rug=new THREE.Mesh(new THREE.PlaneGeometry(3.5,4.2),new THREE.MeshStandardMaterial({color:'#633653',roughness:1,side:THREE.DoubleSide}));
rug.rotation.x=-Math.PI/2;rug.position.set(0,.025,.65);scene.add(rug);
// Portraits on actual side/back walls, including Moose (its original click opens original dialog).
const photos=[
 ['pv10-memory-1.jpg','Memory one',-5.65,2.35,3.1,.85,1.14,Math.PI/2,0],
 ['pv10-memory-2.jpg','Memory two',-5.65,2.45,1.5,.95,1.2,Math.PI/2,1],
 ['pv10-memory-3.jpg','Memory three',-5.65,2.3,-.2,.9,1.2,Math.PI/2,2],
 ['pv10-memory-4.jpg','Memory four',-5.65,2.3,-2.0,.9,1.2,Math.PI/2,3],
 ['pv10-memory-5.jpg','Memory five',-5.65,2.4,-3.7,.9,1.2,Math.PI/2,4],
 ['pv10-zebra.jpg','Zebra guardian',5.65,2.45,-3.4,1.1,1.38,-Math.PI/2,5],
 ['pv10-wolf.jpg','Wolf guardian',5.65,2.45,-1.2,1.1,1.38,-Math.PI/2,6],
 ['pv10-turtle.jpg','Turtle guardian',5.65,2.4,3.4,1.4,1.05,-Math.PI/2,7]
];
for(const [src,label,x,y,z,w,h,rot,i] of photos)framed(src,label,x,y,z,w,h,rot,'photo:'+i,true);
framed('vault-moose-0919-portrait.png','Moose and the secret heart',3.6,2.5,-5.65,1.1,1.38,0,'moose');
// Cat corner, original Gizmo button remains functional.
objectLabel('GIZMO 🐾',-3.7,1.15,5.66,Math.PI,'gizmo',1.45,.5);
const hud=panel.querySelector('#pv12-hud');
const raycaster=new THREE.Raycaster();
const pointer=new THREE.Vector2();
function look(){camera.position.set(state.x,1.67,state.z);camera.rotation.y=state.yaw;camera.rotation.x=0;}
function act(name){
 if(room.hidden)return;
 if(name.startsWith('photo:')){
  const index=name.split(':')[1];
  room.querySelector('.pv10-frame[data-pv10="'+index+'"]')?.click();
 }else if(name==='moose'){
  room.querySelector('#pv8-portrait')?.click();
 }else if(['books','letter','music','photography'].includes(name)){
  room.querySelector('.desk-items [data-discover="'+name+'"]')?.click();
 }else if(name==='drawer'){
  room.querySelector('#living-drawer')?.click();
  hud.textContent='The locked drawer is in the Living Library discoveries below.';
 }else if(name==='gizmo'){
  room.querySelector('#gizmo')?.click();
  hud.textContent='Gizmo purrs and follows you through the study.';
 }
}
function cast(x,y,activate=false){
 const bounds=renderer.domElement.getBoundingClientRect();
 pointer.set(((x-bounds.left)/bounds.width)*2-1,-((y-bounds.top)/bounds.height)*2+1);
 raycaster.setFromCamera(pointer,camera);
 const found=raycaster.intersectObjects(hit,false)[0];
 if(found&&found.distance<10){
  hud.textContent='Inspect: '+found.object.userData.label;
  if(activate)act(found.object.userData.action);
  return true;
 }
 if(activate)hud.textContent='Look toward a portrait or labeled object, then tap to inspect.';
 return false;
}
function step(n){
 const dx=-Math.sin(state.yaw)*n,dz=-Math.cos(state.yaw)*n;
 state.x=Math.max(-4.7,Math.min(4.7,state.x+dx));
 state.z=Math.max(-4.7,Math.min(4.7,state.z+dz));
 look();
 hud.textContent='You walk across the wooden floor.';
}
function inspect(){
 raycaster.setFromCamera(new THREE.Vector2(0,0),camera);
 const found=raycaster.intersectObjects(hit,false)[0];
 if(found&&found.distance<10)act(found.object.userData.action);
 else hud.textContent='Turn toward a framed portrait or object to inspect it.';
}
panel.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>{
 const action=button.dataset.action;
 if(action==='left')state.yaw+=Math.PI/9;
 if(action==='right')state.yaw-=Math.PI/9;
 if(action==='forward')step(.65);
 if(action==='backward')step(-.65);
 if(action==='reset'){state.x=0;state.z=3.7;state.yaw=0;hud.textContent='Back at the study doorway.';}
 if(action==='inspect')inspect();
 if(action==='gizmo')act('gizmo');
 if(action==='original')room.querySelector('.study')?.scrollIntoView({behavior:'smooth'});
 look();
}));
let drag=null;
renderer.domElement.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,moved:false,id:e.pointerId};renderer.domElement.setPointerCapture(e.pointerId);});
renderer.domElement.addEventListener('pointermove',e=>{
 if(!drag||drag.id!==e.pointerId)return;
 const dx=e.clientX-drag.x;
 if(Math.abs(dx)>2)drag.moved=true;
 state.yaw-=dx*.006;
 drag.x=e.clientX;drag.y=e.clientY;look();
});
renderer.domElement.addEventListener('pointerup',e=>{
 if(!drag)return;
 if(!drag.moved)cast(e.clientX,e.clientY,true);
 drag=null;
});
viewport.addEventListener('keydown',e=>{
 if(e.target.tagName==='BUTTON')return;
 if(e.key==='ArrowLeft'||e.key==='a'){state.yaw+=Math.PI/12;e.preventDefault();}
 if(e.key==='ArrowRight'||e.key==='d'){state.yaw-=Math.PI/12;e.preventDefault();}
 if(e.key==='ArrowUp'||e.key==='w'){step(.45);e.preventDefault();}
 if(e.key==='ArrowDown'||e.key==='s'){step(-.45);e.preventDefault();}
 if(e.key==='Enter'||e.key===' '){inspect();e.preventDefault();}
 look();
});
const resize=()=>{
 const width=Math.max(250,viewport.clientWidth);
 const height=Math.max(320,viewport.clientHeight);
 renderer.setSize(width,height,false);
 camera.aspect=width/height;camera.updateProjectionMatrix();
};
const observer=new ResizeObserver(resize);observer.observe(viewport);
look();panel.hidden=false;immersive.classList.add('pv12-ready');
resize();
let running=true;
const animate=()=>{if(!running)return;requestAnimationFrame(animate);if(!document.hidden&&!room.hidden)renderer.render(scene,camera);};
animate();
hud.textContent='Welcome to the study. Turn left for memories, right for guardians, or forward for Moose.';
})();
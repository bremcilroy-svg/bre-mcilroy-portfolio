import * as THREE from './vault-three.module.js';
import {createCanvasRenderer} from './vault-canvas.js';

// A self-contained room: local textures and no external network dependencies.
export function createMirrorRoom(container, {onTarget, onInspect, onReady, onFailure}) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111a24);
  scene.fog = new THREE.FogExp2(0x101925, .026);
  const camera = new THREE.PerspectiveCamera(64, 1, .06, 60);
  camera.position.set(0, 1.67, 5.8);
  let renderer;
  const probe=document.createElement('canvas');
  const gl=probe.getContext('webgl2',{antialias:true});
  if(gl){renderer=new THREE.WebGLRenderer({canvas:probe,context:gl,antialias:true,powerPreference:'high-performance'});}
  else renderer=createCanvasRenderer(THREE);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.4;
  container.appendChild(renderer.domElement);
  const canvas=renderer.domElement;
  canvas.id='room-canvas'; canvas.tabIndex=0;
  canvas.setAttribute('aria-label','The Shattered Mirror. W A S D to move, drag to look, E to inspect. Explore objects provides a non-spatial alternative.');
  const materials={};
  const phong=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.8,...extra});
  materials.wood=phong(0x69432b);materials.wall=phong(0x762d3d);materials.floor=phong(0x77533c);
  materials.paper=phong(0xe2d0a4);materials.gold=phong(0xb89a59,{metalness:.7,roughness:.33});
  materials.darkwood=phong(0x2e1b17);materials.black=phong(0x171317);materials.cream=phong(0xd6c6a3);
  materials.rug=phong(0x5b1729);materials.red=phong(0x74283f);materials.glass=phong(0x8193a4,{metalness:.3,roughness:.25,emissive:0x354d69,emissiveIntensity:.32});
  new THREE.TextureLoader().load('./vault-materials.jpg', image=>{
    const img=image.image, size=img.width/2;
    for (const [name,x,y,rx,ry] of [['wood',0,0,1,2],['wall',1,0,3,1.4],['floor',0,1,5,6],['paper',1,1,1,1]]){
      const c=document.createElement('canvas');c.width=c.height=512;
      c.getContext('2d').drawImage(img,x*size,y*size,size,size,0,0,512,512);
      const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(rx,ry);texture.anisotropy=renderer.capabilities.getMaxAnisotropy();
      materials[name].map=texture;materials[name].color.set(name==='wall'?0x718794:name==='floor'?0xa99c88:name==='wood'?0xa59886:0xffffff);materials[name].needsUpdate=true;
    }
    image.dispose();
  },undefined,()=>{});
  materials.gold.color.set(0xc4bba7);materials.rug.color.set(0x233a50);materials.red.color.set(0x35475b);materials.glass.emissive.set(0x52718b);
  const colliders=[], interactables=[], map=new Map();
  function box(w,h,d,x,y,z,mat,parent=scene,cast=true){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);mesh.castShadow=cast;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
  function cylinder(r1,r2,h,x,y,z,mat,parent=scene){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,16),mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
  function sphere(r,x,y,z,mat,parent=scene){const mesh=new THREE.Mesh(new THREE.SphereGeometry(r,12,8),mat);mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
  function collide(x,z,w,d){colliders.push({x,z,w:w/2+.24,d:d/2+.24});}

  scene.add(new THREE.HemisphereLight(0xb9cfed,0x263043,1.4));
  function lamp(x,y,z,color=0xbdd6ff,intensity=4,range=10){const l=new THREE.PointLight(color,intensity,range,1.4);l.position.set(x,y,z);scene.add(l);return l;}
  const fill=lamp(0,3.8,0,0xc7deff,20,16);fill.castShadow=true;fill.shadow.mapSize.set(1024,1024);
  const moon=new THREE.DirectionalLight(0x8ab4e5,2);moon.position.set(-5,6,4);scene.add(moon);
  const shell=[];
  shell.push(box(12,.2,14,0,-.1,0,materials.floor,scene,false));
  shell.push(box(12,.15,14,0,4.6,0,materials.darkwood,scene,false));
  for(const z of [-7,7])shell.push(box(12,4.6,.2,0,2.3,z,materials.wall,scene,false));
  for(const x of [-6,6])shell.push(box(.2,4.6,14,x,2.3,0,materials.wall,scene,false));
  for(const z of [-6.85,6.85]){shell.push(box(11.8,1.05,.1,0,.53,z,materials.wood));for(const y of [.12,1.07,4.27,4.42])shell.push(box(11.9,.045,.15,0,y,z,materials.gold));}
  for(const x of [-5.85,5.85]){shell.push(box(.1,1.05,13.8,x,.53,0,materials.wood));for(const y of [.12,1.07,4.27,4.42])shell.push(box(.15,.045,13.9,x,y,0,materials.gold));}
  shell.forEach(m=>m.renderOrder=-20);shell[0].renderOrder=-30;
  const rug=box(3.8,.025,10,0,.026,.1,materials.rug);rug.renderOrder=-10;
  for(const x of [-1.82,1.82])box(.045,.008,9.8,x,.045,.1,materials.gold).renderOrder=-9;
  for(const z of [-4.75,4.95])box(3.65,.008,.045,0,.045,z,materials.gold).renderOrder=-9;
  // Repeating silver columns and tall glass panels make a distinct gallery.
  function tallMirror(x,z,angle){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=angle;scene.add(g);
    box(2.05,3.2,.15,0,2.15,0,materials.darkwood,g).renderOrder=-6;box(1.72,2.9,.08,0,2.15,.1,materials.glass,g).renderOrder=-5;
    for(const bx of [-.95,.95]){box(.1,3.35,.18,bx,2.15,.15,materials.gold,g);box(.025,3.1,.025,bx*.9,2.15,.26,materials.cream,g);}
    for(const y of [.52,3.79])box(2.05,.13,.18,0,y,.15,materials.gold,g);
    const arch=new THREE.Mesh(new THREE.TorusGeometry(.82,.025,6,40,Math.PI),materials.cream);arch.position.set(0,2.42,.17);g.add(arch);
    for(const bx of [-.82,.82])box(.018,1.1,.018,bx,1.87,.17,materials.cream,g);
    cylinder(.095,.13,.15,0,3.96,.1,materials.gold,g);
  }
  for(const z of [-4.4,-1.5,1.4]){tallMirror(-5.75,z,Math.PI/2);tallMirror(5.75,z,-Math.PI/2);}
  for(const x of [-5.63,5.63])for(const z of [-5.9,-3,-.1,2.8]){cylinder(.18,.22,3.55,x,1.86,z,materials.wood);cylinder(.28,.28,.15,x,.13,z,materials.gold);cylinder(.27,.27,.17,x,3.7,z,materials.gold);}
  // Four low tables support the missing fragments.
  function pedestal(x,z,wide=false){box(wide?1.45:.9,.12,.85,x,1.05,z,materials.wood);for(const dx of [-.32,.32])for(const dz of [-.28,.28])box(.08,.99,.08,x+dx,.5,z+dz,materials.gold);collide(x,z,wide?1.6:1.05,1);}
  pedestal(-3.8,2.6);pedestal(3.8,2.6);pedestal(-4.15,-3.7,true);pedestal(4.15,-3.7,true);
  const flames=[];
  function candle(x,y,z,h=.35){cylinder(.07,.13,.06,x,y,z,materials.gold);cylinder(.023,.03,.2,x,y+.1,z,materials.gold);cylinder(.048,.048,h,x,y+.2+h/2,z,materials.cream);const f=sphere(.028,x,y+.23+h,z,new THREE.MeshBasicMaterial({color:0xffd9ac}));f.scale.y=2;flames.push(f);lamp(x,y+.3+h,z,0xffcca0,1.4,3.5);}
  for(const x of [-3.8,3.8])candle(x,1.13,2.35,.3);
  for(const x of [-4.15,4.15])candle(x,1.13,-3.95,.34);
  cylinder(.025,.025,.6,0,4.3,0,materials.gold);const chandelier=new THREE.Mesh(new THREE.TorusGeometry(.9,.035,8,40),materials.gold);chandelier.rotation.x=Math.PI/2;chandelier.position.set(0,3.98,0);scene.add(chandelier);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;candle(Math.sin(a)*.9,3.98,Math.cos(a)*.9,.14);}
  // Full-height silver frame and fractured glass. No live camera reflection is required.
  box(3.5,3.7,.18,0,2.15,-6.65,materials.darkwood);box(3.1,3.28,.12,0,2.15,-6.51,materials.glass);
  for(const x of [-1.71,1.71]){box(.15,3.9,.27,x,2.15,-6.45,materials.gold);box(.04,3.65,.04,x*.92,2.15,-6.27,materials.cream);}
  for(const y of [.25,4.05])box(3.55,.15,.27,0,y,-6.45,materials.gold);
  const fractures=new THREE.Group();scene.add(fractures);
  function crack(x1,y1,x2,y2){const len=Math.hypot(x2-x1,y2-y1),m=box(.022,len,.025,(x1+x2)/2,(y1+y2)/2,-6.27,materials.cream,fractures);m.rotation.z=-Math.atan2(x2-x1,y2-y1);}
  crack(-1.5,3.4,0,2.2);crack(0,2.2,1.5,2.8);crack(0,2.2,-.6,.6);crack(0,2.2,.8,3.7);crack(-.5,2.6,-1.45,1.9);crack(.5,2.4,1.4,1.2);
  collide(0,-6.55,3.5,.6);
  function textPlaque(text,w,h){const c=document.createElement('canvas');c.width=768;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#142431';ctx.fillRect(0,0,768,256);ctx.strokeStyle='#c8c0a7';ctx.lineWidth=5;ctx.strokeRect(12,12,744,232);ctx.fillStyle='#e5dfc7';ctx.textAlign='center';ctx.font='38px Georgia';ctx.fillText(text,384,145);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex}));}
  const revealed=new THREE.Group();scene.add(revealed);const word=textPlaque('O H C E',2.3,.7);word.position.set(0,2.2,-6.22);revealed.add(word);revealed.visible=false;
  // Entrance/exit mechanism: a gear recess set in dark oak.
  box(1.7,3.1,.18,0,1.55,6.75,materials.wood);for(const x of [-.94,.94])box(.12,3.3,.25,x,1.65,6.6,materials.gold);box(2,.12,.25,0,3.28,6.6,materials.gold);
  const gearRing=new THREE.Mesh(new THREE.TorusGeometry(.3,.035,8,32),materials.gold);gearRing.position.set(0,1.65,6.59);scene.add(gearRing);
  const gear=new THREE.Group();gear.position.set(0,1.65,6.54);scene.add(gear);const hub=new THREE.Mesh(new THREE.TorusGeometry(.2,.07,8,24),materials.gold);gear.add(hub);for(let i=0;i<12;i++){const a=i*Math.PI/6;const tooth=box(.07,.13,.04,Math.sin(a)*.27,Math.cos(a)*.27,0,materials.gold,gear);tooth.rotation.z=-a;}gear.visible=false;
  const plaque=textPlaque('THE SHATTERED MIRROR',3.3,.55);plaque.position.set(0,3.82,6.67);plaque.rotation.y=Math.PI;scene.add(plaque);
  function target(id,x,y,z,w=.8,h=.6,d=.8){const g=new THREE.Group();g.position.set(x,y,z);scene.add(g);const hit=box(w,h,d,0,0,0,new THREE.MeshBasicMaterial({visible:false}),g,false);hit.userData.id=id;interactables.push(hit);map.set(id,g);return g;}
  function fragment(id,x,z,angle){const g=target(id,x,1.2,z);g.rotation.y=angle;box(.48,.045,.45,0,0,0,materials.glass,g);box(.49,.06,.025,0,.015,-.23,materials.gold,g);box(.025,.06,.45,-.23,.015,0,materials.gold,g);const glint=lamp(x,1.42,z,0xc9edff,.8,2.3);}
  fragment('thorn',-3.8,2.7,.4);fragment('tear',3.8,2.7,-.4);fragment('veil',-4.15,-3.6,.7);fragment('ember',4.15,-3.6,-.3);
  target('mirror',0,2.1,-6.15,3.3,3.4,.4);target('door',0,1.5,6.5,1.8,3,.35);
  let yaw=0,pitch=-.025,active=false,paused=true,targetId=null,drag=null,last=performance.now(),distance=0;
  const keys=new Set(),hold=new Set(),tapUntil=new Map(),ray=new THREE.Raycaster(),center=new THREE.Vector2(0,0);
  function resized(){const rect=container.getBoundingClientRect();renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();}
  new ResizeObserver(resized).observe(container);resized();
  function movable(x,z){return Math.abs(x)<5.55&&Math.abs(z)<6.5&&!colliders.some(b=>Math.abs(x-b.x)<b.w&&Math.abs(z-b.z)<b.d);}
  const instructions = {'KeyW':'forward','ArrowUp':'forward','KeyS':'back','ArrowDown':'back','KeyA':'left','KeyD':'right','ArrowLeft':'turnLeft','ArrowRight':'turnRight'};
  window.addEventListener('keydown',e=>{canvas.dataset.lastInput=e.code;if(!active||paused||e.target.closest('dialog,input,select,textarea'))return;if(instructions[e.code]){e.preventDefault();keys.add(instructions[e.code]);if(!e.repeat)tapUntil.set(instructions[e.code],performance.now()+150);}if(e.code==='KeyE'&&targetId){e.preventDefault();onInspect(targetId);}});
  window.addEventListener('keyup',e=>keys.delete(instructions[e.code]));
  window.addEventListener('blur',()=>{keys.clear();hold.clear();drag=null;});
  document.addEventListener('visibilitychange',()=>{keys.clear();hold.clear();drag=null;});
  canvas.addEventListener('pointerdown',e=>{if(!active||paused)return;canvas.focus({preventScroll:true});drag={id:e.pointerId,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY};canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId||paused)return;yaw-=(e.clientX-drag.x)*.004;pitch-= (e.clientY-drag.y)*.003;pitch=Math.max(-.9,Math.min(.9,pitch));drag.x=e.clientX;drag.y=e.clientY;});
  canvas.addEventListener('pointerup',e=>{if(!drag||drag.id!==e.pointerId)return;const clicked=Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<7;drag=null;if(clicked){const r=canvas.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);const hit=ray.intersectObjects(interactables)[0];if(hit&&hit.distance<3.4)onInspect(hit.object.userData.id);}});
  canvas.addEventListener('pointercancel',()=>drag=null);
  document.querySelectorAll('[data-move]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();if(paused)return;hold.add(b.dataset.move);tapUntil.set(b.dataset.move,performance.now()+180);b.setPointerCapture(e.pointerId);});for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>hold.delete(b.dataset.move));});
  function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.05);last=now;
    if(active&&!paused){const pressed=k=>keys.has(k)||hold.has(k)||(tapUntil.get(k)||0)>now;yaw+=(Number(pressed('turnLeft'))-Number(pressed('turnRight')))*dt*1.4;let f=Number(pressed('forward'))-Number(pressed('back')),s=Number(pressed('right'))-Number(pressed('left'));const norm=Math.hypot(f,s)||1;const dx=(-Math.sin(yaw)*f+Math.cos(yaw)*s)/norm*dt*2.05,dz=(-Math.cos(yaw)*f-Math.sin(yaw)*s)/norm*dt*2.05;const px=camera.position.x,pz=camera.position.z;if(movable(px+dx,pz))camera.position.x+=dx;if(movable(camera.position.x,pz+dz))camera.position.z+=dz;distance+=Math.hypot(dx,dz);camera.position.y=1.67+(matchMedia('(prefers-reduced-motion: reduce)').matches?0:Math.sin(distance*8)*.012*(f||s?1:0));}
    camera.rotation.order='YXZ';camera.rotation.set(pitch,yaw,0);canvas.dataset.cameraPosition=JSON.stringify([camera.position.x,camera.position.z]);canvas.dataset.paused=String(paused);canvas.dataset.yaw=String(yaw);
    if(active&&!paused){ray.setFromCamera(center,camera);const hits=ray.intersectObjects(interactables);let current=hits[0]&&hits[0].distance<3.4?hits[0].object.userData.id:null;if(!current){let best=2.1;for(const [id,g]of map){const d=camera.position.distanceTo(g.position);if(d<best){current=id;best=d;}}}if(current!==targetId){targetId=current;onTarget(current);}}
    const t=now/1000;flames.forEach((f,i)=>{f.scale.y=1.8+Math.sin(t*5+i)*.15;});renderer.render(scene,camera);
  }
  requestAnimationFrame(frame);onReady(renderer.isCompatibility);
  return {restoreMirror(){fractures.visible=false;revealed.visible=true;materials.glass.emissiveIntensity=.6;},revealGear(){gear.visible=true;},start(){active=true;paused=false;canvas.focus({preventScroll:true});},pause(value){paused=value;keys.clear();hold.clear();tapUntil.clear();if(value){targetId=null;onTarget(null);}},collected(id){const g=map.get(id);if(g){g.visible=false;const i=interactables.findIndex(m=>m.userData.id===id);if(i>=0)interactables.splice(i,1);}},inspect(){if(targetId&&!paused)onInspect(targetId);},getPosition(){return{x:camera.position.x,z:camera.position.z};}};
}

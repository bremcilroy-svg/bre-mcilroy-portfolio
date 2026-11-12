import * as THREE from './vault-three.module.js';
import {createCanvasRenderer} from './vault-canvas.js';

// A self-contained room: local textures and no external network dependencies.
export function createRoom(container, {onTarget, onInspect, onReady, onFailure}) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x171019);
  scene.fog = new THREE.FogExp2(0x1a1015, .026);
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
  canvas.setAttribute('aria-label','The Heart Chamber. W A S D to move, drag to look, E to inspect. Explore objects provides a non-spatial alternative.');
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
      materials[name].map=texture;materials[name].color.set(name==='wall'?0xb28189:name==='floor'?0xa99c88:name==='wood'?0xa59886:0xffffff);materials[name].needsUpdate=true;
    }
    image.dispose();
  },undefined,()=>{});
  const colliders=[], interactables=[], map=new Map();
  function box(w,h,d,x,y,z,mat,parent=scene,cast=true){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);mesh.castShadow=cast;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
  function cylinder(r1,r2,h,x,y,z,mat,parent=scene){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,16),mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
  function sphere(r,x,y,z,mat,parent=scene){const mesh=new THREE.Mesh(new THREE.SphereGeometry(r,12,8),mat);mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
  function collide(x,z,w,d){colliders.push({x,z,w:w/2+.24,d:d/2+.24});}
  const hemi=new THREE.HemisphereLight(0xb8b1d1,0x4d2417,1.1);scene.add(hemi);
  const moon=new THREE.DirectionalLight(0x9fbcff,2.3);moon.position.set(-6,6,3);scene.add(moon);
  function lamp(x,y,z,color=0xffb86a,intensity=3,range=9){const light=new THREE.PointLight(color,intensity,range,1.6);light.position.set(x,y,z);scene.add(light);return light;}
  const keylight=lamp(0,3.8,-1,0xffc18a,22,14);keylight.castShadow=true;keylight.shadow.mapSize.set(1024,1024);keylight.shadow.bias=-.001;
  box(12,.2,14,0,-.1,0,materials.floor,scene,false);
  box(12,.18,14,0,4.6,0,materials.darkwood,scene,false);
  box(12,4.6,.2,0,2.3,-7,materials.wall,scene,false);box(12,4.6,.2,0,2.3,7,materials.wall,scene,false);
  box(.2,4.6,14,-6,2.3,0,materials.wall,scene,false);box(.2,4.6,14,6,2.3,0,materials.wall,scene,false);
  // Walnut wainscoting, gilded rails, and recessed wall panels.
  for(const z of [-6.86,6.86]){box(11.8,1.05,.1,0,.53,z,materials.wood);for(const y of [.12,1.07,4.23,4.4])box(11.9,.045,.16,0,y,z,materials.gold);for(let x=-5.5;x<6;x+=1.1)box(.035,.85,.14,x,.54,z,materials.gold);}
  for(const x of [-5.86,5.86]){box(.1,1.05,13.8,x,.53,0,materials.wood);for(const y of [.12,1.07,4.23,4.4])box(.16,.045,13.9,x,y,0,materials.gold);for(let z=-6.5;z<7;z+=1.1)box(.14,.85,.035,x,.54,z,materials.gold);}
  for(const mesh of scene.children)if(mesh.isMesh)mesh.renderOrder=-20;
  scene.children.find(m=>m.isMesh).renderOrder=-30;
  const rugStart=scene.children.length;
  // Woven ruby carpet with fine gold edging.
  box(5.4,.025,7.6,0,.025,-.4,materials.rug);
  for(const x of [-2.58,2.58])box(.045,.009,7.3,x,.043,-.4,materials.gold);
  for(const z of [-4.05,3.25])box(5.2,.009,.045,0,.043,z,materials.gold);
  for(let x=-2.3;x<2.5;x+=.45)for(let z=-3.8;z<3.3;z+=.6){const m=box(.035,.008,.16,x,.046,z,materials.red);m.rotation.y=.65;}
  for(const mesh of scene.children.slice(rugStart))if(mesh.isMesh)mesh.renderOrder=-10;
  // Tall bookcases, each filled with uneven leather-bound books.
  const spineColors=[0x543340,0x3b493f,0x73502d,0x2b3a4e,0x61352a,0x817352];
  function bookcase(x,z,rotation){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotation;scene.add(g);box(3.45,3.5,.18,0,1.85,-.27,materials.darkwood,g);for(const sx of [-1.75,1.75])box(.18,3.7,.7,sx,1.85,0,materials.wood,g);for(const y of [.2,.95,1.7,2.45,3.25,3.65]){box(3.6,.12,.75,0,y,0,materials.wood,g);box(3.6,.025,.025,0,y+.07,.39,materials.gold,g);}for(let row=0;row<4;row++){let bx=-1.58;for(let i=0;i<17;i++){const width=.1+((i*7+row*3)%5)*.025,height=.45+((i*3+row)%5)*.043;const mat=phong(spineColors[(row*3+i)%spineColors.length]);box(width,height,.36,bx+width/2,.29+row*.75+height/2,.12,mat,g);for(const yy of [.10,height-.08])box(width*.85,.012,.012,bx+width/2,.29+row*.75+yy,.307,materials.gold,g);bx+=width+.035;if(bx>1.5)break;}}return g;}
  bookcase(-5.48,-3.6,Math.PI/2);bookcase(5.48,-3.6,-Math.PI/2);bookcase(5.48,.4,-Math.PI/2);bookcase(-3.85,-6.5,0);bookcase(3.85,-6.5,0);
  collide(-5.5,-3.6,1,3.9);collide(5.5,-3.6,1,3.9);collide(5.5,.4,1,3.9);collide(-3.85,-6.5,3.9,1);collide(3.85,-6.5,3.9,1);
  // Fireplace, marble surround, grate, glowing coals, and candles.
  const stone=phong(0x8f8377);box(3.25,.24,1.2,0,.12,-6.32,stone);box(2.8,2,.8,0,1,-6.52,materials.black);
  for(const x of [-1.35,1.35])box(.35,1.65,.95,x,.95,-6.35,stone);
  box(3.2,.22,1.18,0,1.9,-6.3,stone);box(2.3,.19,.9,0,1.65,-6.42,stone);
  const ember=phong(0x883117,{emissive:0xe95a14,emissiveIntensity:2});for(let i=0;i<7;i++){const l=cylinder(.08,.08,.9,-.5+i*.16,.35,-6.07,materials.darkwood);l.rotation.z=.9;l.rotation.y=i*.7;sphere(.08,-.6+i*.2,.3,-6.03,ember);}
  const firelight=lamp(0,.65,-5.95,0xff732b,6,7);
  for(let x=-.9;x<=.9;x+=.3)box(.025,.5,.04,x,.5,-5.84,materials.black);
  collide(0,-6.3,3.2,1.4);
  const flames=[];
  function candle(x,y,z,h=.3){cylinder(.095,.13,.06,x,y,z,materials.gold);cylinder(.026,.04,.2,x,y+.1,z,materials.gold);cylinder(.052,.052,h,x,y+.2+h/2,z,materials.cream);const f=sphere(.032,x,y+.23+h,z,phong(0xffe8a1,{emissive:0xffae42,emissiveIntensity:3}));f.scale.y=2;flames.push(f);lamp(x,y+.24+h,z,0xffac64,1.3,3);}
  for(const x of [-1.12,1.12])candle(x,2.02,-6.24,.4);
  // Oval portrait and an ornate gilded mantel mirror.
  const mirror=new THREE.Mesh(new THREE.CircleGeometry(.74,48),materials.glass);mirror.position.set(0,3.05,-6.84);mirror.scale.y=1.18;scene.add(mirror);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.8,.055,8,64),materials.gold);rim.position.set(0,3.05,-6.81);rim.scale.y=1.18;scene.add(rim);
  // Moonlit arched window with curtains on the west wall.
  box(.1,2.45,2.6,-5.76,2.65,2,materials.glass);for(const z of [.65,2,3.35])box(.15,2.7,.08,-5.66,2.65,z,materials.gold);for(const y of [1.35,2.65,3.95])box(.15,.07,2.9,-5.66,y,2,materials.gold);
  const curtain=phong(0x492131,{roughness:1});for(const z of [.28,3.73])for(let i=0;i<5;i++){const c=cylinder(.16,.16,3.25,-5.47+i*.018,2.25,z+(i-2)*.11,curtain);c.scale.x=.7;}
  box(1.15,.18,3.2,-5.08,.61,2,materials.wood);box(.9,.18,2.9,-5.05,.78,2,materials.red);for(const z of [.6,3.4])box(.13,.6,.13,-5.04,.3,z,materials.wood);collide(-5.05,2,1.35,3.3);
  // Writing desk, chair, blotter, quill, lamp, and a locked heart diary.
  const deskX=0,deskZ=-2.45;box(3.25,.17,1.55,deskX,1.13,deskZ,materials.wood);for(const x of [-1.35,1.35])for(const z of [-3.02,-1.88]){box(.16,1.05,.16,x,.54,z,materials.wood);cylinder(.12,.07,.17,x,.18,z,materials.gold);}
  box(1.55,.35,1.25,0,.85,deskZ,materials.darkwood);box(1.48,.28,.08,0,.86,-1.77,materials.wood);cylinder(.045,.045,.04,0,.86,-1.7,materials.gold).rotation.x=Math.PI/2;
  box(1.8,.02,.9,0,1.23,deskZ,materials.red);collide(0,deskZ,3.4,1.7);
  box(.8,.15,.72,0,.6,-3.85,materials.wood);box(.8,.8,.12,0,1.02,-4.16,materials.wood);for(const x of [-.32,.32])for(const z of [-3.58,-4.1])box(.09,.57,.09,x,.28,z,materials.wood);collide(0,-3.85,1,1);
  candle(-1.13,1.24,-2.55,.31);cylinder(.07,.08,.14,1.12,1.29,-2.6,materials.black);const quill=box(.025,.5,.012,1.16,1.6,-2.6,materials.cream);quill.rotation.z=-.35;
  for(let i=0;i<3;i++)box(.48,.018,.59,.88+i*.03,1.24+i*.018,-2.06,materials.paper);
  // Side table with the rose letter and a velvet chair.
  cylinder(.68,.68,.12,-3.8,.95,-2.4,materials.wood);cylinder(.12,.22,.85,-3.8,.48,-2.4,materials.wood);collide(-3.8,-2.4,1.5,1.5);
  box(1,.2,1,-3.9,.55,-.7,materials.red);box(1,1.2,.17,-3.9,1.05,-1.14,materials.red);for(const x of [-4.3,-3.5])for(const z of [-1.05,-.35])box(.09,.45,.09,x,.23,z,materials.wood);collide(-3.9,-.7,1.2,1.3);
  // Chandelier: dark brass arms and a crown of warm candlelight.
  cylinder(.035,.035,.75,0,4.16,-.5,materials.gold);const chandelier=new THREE.Mesh(new THREE.TorusGeometry(.72,.045,8,32),materials.gold);chandelier.rotation.x=Math.PI/2;chandelier.position.set(0,3.72,-.5);scene.add(chandelier);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;candle(Math.sin(a)*.72,3.72,-.5+Math.cos(a)*.72,.18);}
  // Exit door and framed plaque.
  box(1.7,3,.16,0,1.5,6.76,materials.wood);for(const x of [-.92,.92])box(.14,3.2,.23,x,1.6,6.62,materials.gold);box(1.98,.14,.23,0,3.2,6.62,materials.gold);for(const y of [.75,2.15]){box(1.32,1.1,.06,0,y,6.64,materials.darkwood);for(const x of [-.65,.65])box(.025,1.08,.015,x,y,6.6,materials.gold);}sphere(.07,-.6,1.35,6.48,materials.gold);
  function textPlaque(text,w,h){const c=document.createElement('canvas');c.width=768;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#20181a';ctx.fillRect(0,0,768,256);ctx.strokeStyle='#b29762';ctx.lineWidth=5;ctx.strokeRect(12,12,744,232);ctx.fillStyle='#dfc794';ctx.textAlign='center';ctx.font='36px Georgia';ctx.fillText(text,384,145);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex}));}
  const plaque=textPlaque('THE HEART CHAMBER',2.7,.65);plaque.position.set(0,3.81,6.69);plaque.rotation.y=Math.PI;scene.add(plaque);
  // Readable gold-seal props. A separate hit area keeps touch interaction forgiving.
  function target(id,x,y,z,w=.65,h=.5,d=.65){const g=new THREE.Group();g.position.set(x,y,z);g.userData.id=id;scene.add(g);const hit=box(w,h,d,0,0,0,new THREE.MeshBasicMaterial({visible:false}),g,false);hit.userData.id=id;interactables.push(hit);map.set(id,g);return g;}
  function envelope(id,x,y,z,angle=0){const g=target(id,x,y,z);g.rotation.y=angle;box(.46,.025,.31,0,0,0,materials.paper,g);const flap=new THREE.Mesh(new THREE.ConeGeometry(.2,.18,3),materials.cream);flap.rotation.x=Math.PI;flap.scale.y=.13;flap.position.y=.02;g.add(flap);const seal=cylinder(.048,.048,.018,0,.033,0,materials.gold,g);g.userData.seal=seal;const glow=new THREE.PointLight(0xffcc82,.4,1.7);glow.position.set(0,.2,0);g.add(glow);}
  envelope('rose',-3.8,1.04,-2.35,.3);envelope('ribbon',5.1,1.85,.35,.7);envelope('moon',-5.05,.9,2,.2);envelope('key',.58,2.05,-6.12,-.3);
  const diary=target('diary',0,1.3,-2.15,1.1,.55,.9);box(.68,.11,.86,0,0,0,materials.red,diary);for(const x of [-.3,.3])box(.018,.009,.79,x,.061,0,materials.gold,diary);for(const z of [-.37,.37])box(.61,.009,.02,0,.061,z,materials.gold,diary);box(.15,.04,.18,.31,.04,.05,materials.gold,diary);const heart=sphere(.055,-.035,.09,0,materials.gold,diary);sphere(.055,.035,.09,0,materials.gold,diary);const tip=box(.085,.03,.085,0,.085,.05,materials.gold,diary);tip.rotation.y=Math.PI/4;
  target('door',0,1.5,6.5,1.7,2.8,.3);
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
    const t=now/1000;firelight.intensity=6+Math.sin(t*11)*.3+Math.sin(t*17)*.2;flames.forEach((f,i)=>{f.scale.y=1.8+Math.sin(t*5+i)*.15;});renderer.render(scene,camera);
  }
  requestAnimationFrame(frame);onReady(renderer.isCompatibility);
  return {start(){active=true;paused=false;canvas.focus({preventScroll:true});},pause(value){paused=value;keys.clear();hold.clear();tapUntil.clear();if(value){targetId=null;onTarget(null);}},collected(id){const g=map.get(id);if(g){g.visible=false;const i=interactables.findIndex(m=>m.userData.id===id);if(i>=0)interactables.splice(i,1);}},inspect(){if(targetId&&!paused)onInspect(targetId);},getPosition(){return{x:camera.position.x,z:camera.position.z};}};
}

import {SECRETS} from './vault-rewards.js?v=20261112-cinematic';
import {createRoomCinematics} from './vault-cinematics.js?v=20261112-cinematic';
import {createRoomMotion} from './vault-motion.js?v=20261112-cinematic';
import {LABYRINTH_WALLS} from './vault-labyrinth-state.js';
import * as THREE from './vault-three.module.js';
import {createCanvasRenderer} from './vault-canvas.js?v=20261112-cinematic';

// A self-contained room: local textures and no external network dependencies.
export function createLabyrinthRoom(container, {onTarget, onInspect, onReady, onFailure}) {
  const scene = new THREE.Scene();
  const cinema=createRoomCinematics();
  scene.background = new THREE.Color(0x181320);
  scene.fog = new THREE.FogExp2(0x1c1523, .026);
  const camera = new THREE.PerspectiveCamera(64, 1, .06, 60);
  camera.position.set(3.4, 1.67, 5.8);
  let renderer;
  const probe=document.createElement('canvas');
  const gl=probe.getContext('webgl2',{antialias:true});
  if(gl){renderer=new THREE.WebGLRenderer({canvas:probe,context:gl,antialias:true,powerPreference:'high-performance'});}
  else renderer=createCanvasRenderer(THREE);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.4));
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.4;
  container.appendChild(renderer.domElement);
  const canvas=renderer.domElement;
  canvas.id='room-canvas'; canvas.tabIndex=0;
  canvas.setAttribute('aria-label','The Midnight Labyrinth. W A S D to move, drag to look, E to inspect. Explore objects provides a non-spatial alternative.');
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
      materials[name].map=texture;materials[name].color.set(name==='wall'?0x80717d:name==='floor'?0xa99c88:name==='wood'?0xa59886:0xffffff);materials[name].needsUpdate=true;
    }
    image.dispose();
  },undefined,()=>{});
  materials.gold.color.set(0xc7a15e);materials.rug.color.set(0x3b263f);materials.red.color.set(0x35475b);materials.glass.emissive.set(0x52718b);
  const colliders=[], interactables=[], map=new Map();
  function box(w,h,d,x,y,z,mat,parent=scene,cast=true){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);mesh.castShadow=cast;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
  function cylinder(r1,r2,h,x,y,z,mat,parent=scene){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,renderer.isCompatibility?8:16),mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
  function sphere(r,x,y,z,mat,parent=scene){const mesh=new THREE.Mesh(new THREE.SphereGeometry(r,renderer.isCompatibility?8:12,renderer.isCompatibility?6:8),mat);mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
  function collide(x,z,w,d){colliders.push({x,z,w:w/2+.24,d:d/2+.24});}


  scene.add(new THREE.HemisphereLight(0xc2b2dc,0x453025,1.3));
  function lamp(x,y,z,color=0xffca8b,intensity=3,range=8){const l=new THREE.PointLight(color,intensity,range,1.5);l.position.set(x,y,z);scene.add(l);return l;}
  const fill=lamp(1,3.9,1,0xffd3a3,18,15);fill.castShadow=true;fill.shadow.mapSize.set(1024,1024);
  const moon=new THREE.DirectionalLight(0x9b9ddb,1.4);moon.position.set(-6,7,1);scene.add(moon);
  const floor=box(12,.2,14,0,-.1,0,materials.floor,scene,false);floor.renderOrder=-30;
  box(12,.15,14,0,4.6,0,materials.darkwood,scene,false).renderOrder=-20;
  for(const z of [-7,7])box(12,4.6,.2,0,2.3,z,materials.wall,scene,false).renderOrder=-20;
  for(const x of [-6,6])box(.2,4.6,14,x,2.3,0,materials.wall,scene,false).renderOrder=-20;
  for(const z of [-6.85,6.85]){box(11.8,1.05,.1,0,.53,z,materials.wood).renderOrder=-19;for(const y of [.12,1.07,4.25,4.42])box(11.9,.045,.14,0,y,z,materials.gold).renderOrder=-18;}
  for(const x of [-5.85,5.85]){box(.1,1.05,13.8,x,.53,0,materials.wood).renderOrder=-19;for(const y of [.12,1.07,4.25,4.42])box(.14,.045,13.9,x,y,0,materials.gold).renderOrder=-18;}
  // Actual alternating partitions: the open route goes right, left, then right.
  const occluders=[];
  for(const wall of LABYRINTH_WALLS){const {x,z,w,d}=wall;
    const solid=box(w,3.35,d,x,1.675,z,materials.wall);occluders.push(solid);collide(x,z,w,d);
    for(const side of [-1,1]){box(w,1.05,.08,x,.53,z+side*.19,materials.wood);for(const y of [.12,1.09,3.27])box(w,.045,.08,x,y,z+side*.24,materials.gold);for(let px=x-w/2+.5;px<x+w/2;px+=1.1)box(.04,2.1,.06,px,2.1,z+side*.22,materials.gold);}
    box(w+.12,.14,.55,x,3.4,z,materials.darkwood);
    for(const px of [x-w/2,x+w/2]){box(.19,3.55,.54,px,1.78,z,materials.wood);cylinder(.17,.23,.18,px,3.6,z,materials.gold);}
  }
  // Segmented plum runners mark the bends without creating a painted shortcut.
  for(const z of [5.2,1.5,-1.8,-5.1])box(9.7,.025,1.3,0,.026,z,materials.rug).renderOrder=-10;
  for(const [x,z]of [[3.7,3.5],[-3.7,-.1],[3.7,-3.3]])box(1.3,.025,3.2,x,.028,z,materials.rug).renderOrder=-9;
  const flames=[];
  function lantern(x,y,z){const g=new THREE.Group();g.position.set(x,y,z);scene.add(g);box(.24,.35,.24,0,0,0,materials.glass,g);for(const dx of [-.14,.14])for(const dz of [-.14,.14])box(.025,.44,.025,dx,0,dz,materials.gold,g);box(.36,.04,.36,0,-.23,0,materials.gold,g);box(.33,.08,.33,0,.25,0,materials.gold,g);const f=sphere(.035,0,-.04,0,new THREE.MeshBasicMaterial({color:0xffe7ac}),g);f.scale.y=2;flames.push(f);lamp(x,y,z,0xffb569,2.4,5);}
  for(const [x,z]of [[-3.8,5.5],[4.9,3.5],[-4.9,.4],[4.9,-2.6],[-2,-5.8]])lantern(x,2.25,z);
  for(const z of [4.9,1.55,-1.8,-5.1]){cylinder(.02,.02,.6,0,4.3,z,materials.gold);lantern(0,3.85,z);}
  function table(x,z,w=1.1){box(w,.12,.62,x,.95,z,materials.wood);for(const dx of [-w*.38,w*.38])for(const dz of [-.23,.23])box(.07,.9,.07,x+dx,.45,z+dz,materials.gold);collide(x,z,w,.7);}
  table(-3.8,5.65,1.5);table(-5,4.25);table(-4.5,1.5);table(4.3,-1.9);table(4.3,-4.8);table(-3.5,-5.65,1.8);
  // Shelf niches and gilt book spines line the inner archive turns.
  for(const [x,z]of [[-5.7,1.5],[5.7,-1.8],[-5.7,-5.1]]){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=x<0?Math.PI/2:-Math.PI/2;scene.add(g);box(1.5,2.7,.15,0,1.75,-.12,materials.darkwood,g);for(const y of [.45,1.2,1.95,2.7,3.1])box(1.6,.08,.45,0,y,0,materials.wood,g);for(let row=0;row<3;row++)for(let i=0;i<8;i++){const h=.42+(i%3)*.08;box(.12,h,.28,-.6+i*.17,.5+row*.75+h/2,.06,phong([0x423442,0x6b4c37,0x39483e,0x323b50][i%4]),g);}collide(x,z,.55,1.7);}
  // Readable clock face. Hour/minute hands are prebuilt so the CPU view updates too.
  const clockX=3.65,clockY=2.3,clockZ=-6.5;
  box(1.9,3.5,.6,clockX,1.75,-6.7,materials.wood);box(1.7,.12,.85,clockX,.12,-6.5,materials.gold);collide(clockX,-6.55,1.95,.85);
  const faceCanvas=document.createElement('canvas');faceCanvas.width=faceCanvas.height=512;const ctx=faceCanvas.getContext('2d');ctx.fillStyle='#d8c4a1';ctx.fillRect(0,0,512,512);ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='34px Georgia';ctx.fillStyle='#513e38';const roman=['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'];for(let i=0;i<12;i++){const a=i*Math.PI/6;ctx.fillText(roman[i],256+202*Math.sin(a),256-202*Math.cos(a));}
  const tex=new THREE.CanvasTexture(faceCanvas);tex.colorSpace=THREE.SRGBColorSpace;const face=new THREE.Mesh(new THREE.CircleGeometry(.79,48),new THREE.MeshBasicMaterial({map:tex}));face.position.set(clockX,clockY,clockZ+.08);scene.add(face);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.86,.06,8,56),materials.gold);ring.position.set(clockX,clockY,clockZ+.1);scene.add(ring);
  const hourHands=[],minuteHands=[];for(let i=0;i<12;i++){for(const [list,length,width,offset]of [[hourHands,.43,.05,.18],[minuteHands,.64,.025,.21]]){const g=new THREE.Group();g.position.set(clockX,clockY,clockZ+offset);g.rotation.z=-i*Math.PI/6;scene.add(g);box(width,length,.025,0,length/2,0,materials.darkwood,g);g.visible=i===0;list.push(g);}}
  sphere(.06,clockX,clockY,clockZ+.25,materials.gold);
  const gear=new THREE.Group();gear.position.set(clockX,1.05,clockZ+.28);scene.add(gear);const hub=new THREE.Mesh(new THREE.TorusGeometry(.22,.05,8,32),materials.gold);gear.add(hub);for(let i=0;i<12;i++){const a=i*Math.PI/6;const t=box(.06,.12,.03,Math.sin(a)*.27,Math.cos(a)*.27,0,materials.gold,gear);t.rotation.z=-a;}gear.visible=false;
  function textPlaque(text,w,h){const c=document.createElement('canvas');c.width=768;c.height=256;const cctx=c.getContext('2d');cctx.fillStyle='#231a29';cctx.fillRect(0,0,768,256);cctx.strokeStyle='#cbb17b';cctx.lineWidth=5;cctx.strokeRect(12,12,744,232);cctx.fillStyle='#ecddba';cctx.font='36px Georgia';cctx.textAlign='center';cctx.fillText(text,384,145);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t}));}
  const plaque=textPlaque('THE MIDNIGHT LABYRINTH',3,.6);plaque.position.set(0,3.9,-6.83);scene.add(plaque);
  const doorStart=scene.children.length;
  // Sunrise door and its earned emblem.
  box(1.65,3.15,.15,0,1.575,-6.75,materials.wood);for(const x of [-.91,.91])box(.12,3.35,.23,x,1.68,-6.63,materials.gold);box(1.98,.12,.23,0,3.35,-6.63,materials.gold);
  const sunrise=new THREE.Group();sunrise.position.set(0,1.9,-6.55);scene.add(sunrise);const sun=new THREE.Mesh(new THREE.CircleGeometry(.27,24,0,Math.PI),materials.gold);sunrise.add(sun);box(.8,.035,.03,0,0,0,materials.gold,sunrise);for(let i=0;i<5;i++){const a=(i+.5)*Math.PI/5;const t=box(.03,.15,.02,Math.cos(a)*.44,Math.sin(a)*.44,0,materials.gold,sunrise);t.rotation.z=a-Math.PI/2;}sunrise.visible=false;
  const openDoor=cinema.door(scene,scene.children.slice(doorStart).filter(m=>Math.abs(m.position.x)<.85&&m.position.y<3.2),-.825,-6.75,-1);
  // Forgiving hit areas and loose pages with visibly closed/open clasps.
  function target(id,x,y,z,w=.8,h=.6,d=.8){const g=new THREE.Group();g.position.set(x,y,z);scene.add(g);const hit=box(w,h,d,0,0,0,new THREE.MeshBasicMaterial({visible:false}),g,false);hit.userData.id=id;interactables.push(hit);map.set(id,g);return g;}
  const clasps=[];
  function paper(id,x,z,angle=0){const g=target(id,x,1.04,z);g.rotation.y=angle;box(.5,.025,.4,0,0,0,materials.paper,g);const clasp=box(.12,.04,.43,0,.035,0,materials.gold,g);clasps.push(clasp);return g;}
  paper('note',-3.8,5.55,.2);paper('ash',-5,4.25,-.2);paper('ivy',-4.5,1.5,.4);paper('star',4.3,-1.9,-.3);paper('bell',4.3,-4.8,.2);
  const ledger=target('ledger',-3.5,1.1,-5.6,1.4,.8,.9);box(.85,.14,.64,0,0,0,materials.red,ledger);for(const x of [-.39,.39])box(.02,.02,.57,x,.08,0,materials.gold,ledger);
  const openBook=cinema.book(scene,ledger,.85,.64);
  target('clock',clockX,2,clockZ+.45,1.8,3.4,.5);target('door',0,1.5,-6.45,1.8,3,.35);
  const sightRay=new THREE.Raycaster();
  function clearSight(id){const g=map.get(id);if(!g)return false;const direction=new THREE.Vector3().subVectors(g.position,camera.position),distance=direction.length();sightRay.set(camera.position,direction.normalize());const hit=sightRay.intersectObjects(occluders)[0];return !hit||hit.distance>=distance-.05;}
  function movable(x,z){return Math.abs(x)<5.55&&Math.abs(z)<6.5&&!colliders.some(b=>Math.abs(x-b.x)<b.w&&Math.abs(z-b.z)<b.d);}
  const secret=SECRETS[2],bookmark=target('secret',secret.x,secret.y,secret.z,.6,.45,.6);
  box(.16,.012,.43,0,0,0,materials.gold,bookmark);box(.06,.015,.36,0,.012,0,materials.paper,bookmark);
  const motion=createRoomMotion({canvas,camera,container,movable,interactables,map,onTarget,onInspect,clearSight,onStep:()=>document.dispatchEvent(new CustomEvent('vault-step'))});
  function resized(){const rect=container.getBoundingClientRect();renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();}
  new ResizeObserver(resized).observe(container);resized();
  let lastPausedRender=-Infinity;
  function frame(now){requestAnimationFrame(frame);motion.tick(now);cinema.tick(now);if(document.hidden)return;
    if(motion.paused&&!cinema.active&&now-lastPausedRender<350)return;lastPausedRender=now;
    const t=now/1000;flames.forEach((f,i)=>{f.scale.y=1.8+Math.sin(t*5+i)*.15;});renderer.render(scene,camera,cinema.active);
  }
  requestAnimationFrame(frame);onReady(renderer.isCompatibility);
  return {openDoor,openBook,installGear(){gear.visible=true;},setClock(hour,minute){hourHands.forEach((g,i)=>g.visible=i===hour%12);minuteHands.forEach((g,i)=>g.visible=i===minute/5);},wakeArchive(){clasps.forEach(m=>m.visible=false);},revealSunrise(){sunrise.visible=true;},...motion,collected(id){const g=map.get(id);if(g){g.visible=false;const i=interactables.findIndex(m=>m.userData.id===id);if(i>=0)interactables.splice(i,1);}}};
}

import {SECRETS} from './vault-rewards.js?v=20261112-cinematic';
import {createRoomCinematics} from './vault-cinematics.js?v=20261112-cinematic';
import {createRoomMotion} from './vault-motion.js?v=20261112-cinematic';
import * as THREE from './vault-three.module.js';
import {createCanvasRenderer} from './vault-canvas.js?v=20261112-cinematic';

// A self-contained room: local textures and no external network dependencies.
export function createDawnRoom(container, {onTarget, onInspect, onReady, onFailure}) {
  const scene = new THREE.Scene();
  const cinema=createRoomCinematics();
  scene.background = new THREE.Color(0x37372e);
  scene.fog = new THREE.FogExp2(0x4c4d3c, .026);
  const camera = new THREE.PerspectiveCamera(64, 1, .06, 60);
  camera.position.set(0, 1.67, 5.8);
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
  canvas.setAttribute('aria-label','The Door to Tomorrow. W A S D to move, drag to look, E to inspect. Explore objects provides a non-spatial alternative.');
  const materials={};
  const phong=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.8,...extra});
  materials.wood=phong(0x69432b);materials.wall=phong(0x762d3d);materials.floor=phong(0x77533c);
  materials.paper=phong(0xe2d0a4);materials.gold=phong(0xb89a59,{metalness:.7,roughness:.33});
  materials.darkwood=phong(0x2e1b17);materials.black=phong(0x171317);materials.cream=phong(0xd6c6a3);
  materials.rug=phong(0x5b1729);materials.red=phong(0x74283f);materials.glass=phong(0x8193a4,{metalness:.3,roughness:.25,emissive:0x354d69,emissiveIntensity:.32});
  new THREE.TextureLoader().load('./vault-materials.jpg', image=>{
    const img=image.image, size=img.width/2;
    for (const [name,x,y,rx,ry] of [['wood',0,0,1,2],['floor',0,1,5,6],['paper',1,1,1,1]]){
      const c=document.createElement('canvas');c.width=c.height=512;
      c.getContext('2d').drawImage(img,x*size,y*size,size,size,0,0,512,512);
      const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(rx,ry);texture.anisotropy=renderer.capabilities.getMaxAnisotropy();
      materials[name].map=texture;materials[name].color.set(name==='wall'?0x718794:name==='floor'?0xa99c88:name==='wood'?0xa59886:0xffffff);materials[name].needsUpdate=true;
    }
    image.dispose();
  },undefined,()=>{});
  materials.gold.color.set(0xd6b87a);materials.rug.color.set(0x496653);materials.red.color.set(0x35475b);materials.glass.emissive.set(0x52718b);
  materials.wall.color.set(0xddd4b8);materials.red.color.set(0x4a725a);
  const colliders=[], interactables=[], map=new Map();
  function box(w,h,d,x,y,z,mat,parent=scene,cast=true){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);mesh.castShadow=cast;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
  function cylinder(r1,r2,h,x,y,z,mat,parent=scene){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,renderer.isCompatibility?8:16),mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
  function sphere(r,x,y,z,mat,parent=scene){const mesh=new THREE.Mesh(new THREE.SphereGeometry(r,renderer.isCompatibility?8:12,renderer.isCompatibility?6:8),mat);mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
  function collide(x,z,w,d){colliders.push({x,z,w:w/2+.24,d:d/2+.24});}


  scene.add(new THREE.HemisphereLight(0xffedc5,0x597255,2.1));
  function lamp(x,y,z,color=0xffd8a0,intensity=3,range=10){const l=new THREE.PointLight(color,intensity,range,1.5);l.position.set(x,y,z);scene.add(l);return l;}
  const fill=lamp(0,3.9,-2,0xffe4ba,20,15);fill.castShadow=true;fill.shadow.mapSize.set(1024,1024);
  const sunLight=new THREE.DirectionalLight(0xffe5ac,2.5);sunLight.position.set(-3,6,-7);scene.add(sunLight);
  box(12,.2,14,0,-.1,0,materials.floor,scene,false).renderOrder=-30;
  box(12,.15,14,0,4.6,0,materials.cream,scene,false).renderOrder=-20;
  box(12,4.6,.2,0,2.3,-7,materials.wall,scene,false).renderOrder=-20;
  for(const x of [-6,6])box(.2,4.6,14,x,2.3,0,materials.wall,scene,false).renderOrder=-20;
  for(const x of [-3.45,3.45])box(5.1,4.6,.2,x,2.3,7,materials.wall,scene,false).renderOrder=-20;
  box(1.8,1.4,.2,0,3.9,7,materials.wall,scene,false).renderOrder=-20;
  for(const z of [-6.85,6.85])for(const [x,w]of(z<0?[[0,11.8]]:[[-3.45,5],[3.45,5]])){box(w,.95,.1,x,.48,z,materials.wood).renderOrder=-19;for(const y of [.12,1.01,4.3])box(w,.04,.15,x,y,z,materials.gold).renderOrder=-18;}
  for(const x of [-5.85,5.85]){box(.1,.95,13.8,x,.48,0,materials.wood).renderOrder=-19;for(const y of [.12,1.01,4.3])box(.15,.04,13.8,x,y,0,materials.gold).renderOrder=-18;}
  box(5.2,.025,7.9,0,.026,.1,materials.rug).renderOrder=-10;for(const x of [-2.5,2.5])box(.04,.008,7.7,x,.045,.1,materials.gold).renderOrder=-9;
  function landscape(){const c=document.createElement('canvas');c.width=768;c.height=768;const cx=c.getContext('2d'),g=cx.createLinearGradient(0,0,0,768);g.addColorStop(0,'#becdc9');g.addColorStop(.55,'#f8dfa4');g.addColorStop(1,'#9fb68a');cx.fillStyle=g;cx.fillRect(0,0,768,768);cx.fillStyle='#fff0b6';cx.beginPath();cx.arc(420,310,90,0,Math.PI*2);cx.fill();cx.fillStyle='#8ba681';cx.beginPath();cx.moveTo(0,540);cx.quadraticCurveTo(190,350,400,530);cx.quadraticCurveTo(610,430,768,525);cx.lineTo(768,768);cx.lineTo(0,768);cx.fill();cx.fillStyle='#587859';cx.beginPath();cx.moveTo(0,660);cx.quadraticCurveTo(220,490,450,650);cx.quadraticCurveTo(630,540,768,630);cx.lineTo(768,768);cx.lineTo(0,768);cx.fill();const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return new THREE.MeshBasicMaterial({map:t});}
  const gardenMaterial=landscape();
  // Soft garden views and ivory mullions around the conservatory.
  for(const x of [-5.74,5.74])for(const z of [-3.9,.1,3.8]){const g=new THREE.Group();g.position.set(x,2.6,z);g.rotation.y=x<0?Math.PI/2:-Math.PI/2;scene.add(g);const view=new THREE.Mesh(new THREE.PlaneGeometry(2.5,2.7),gardenMaterial);g.add(view);view.renderOrder=-6;for(const bx of [-1.3,0,1.3])box(.075,2.85,.1,bx,0,.06,materials.cream,g);for(const y of [-1.4,0,1.4])box(2.7,.075,.1,0,y,.06,materials.cream,g);}
  function table(x,z,w=1.5,d=.8){box(w,.13,d,x,1.04,z,materials.wood);for(const dx of [-w*.38,w*.38])for(const dz of [-d*.35,d*.35])box(.08,.98,.08,x+dx,.5,z+dz,materials.gold);collide(x,z,w,d);}
  table(-4,2.3);table(4,2.3);table(-4.6,-3.8);table(4.6,-3.8);table(0,-2.3,2.9,1.2);
  // Potted leaves and small flowers, sculpted from simple local meshes.
  const leafMat=phong(0x426f4c),flowerMat=phong(0xc4a1a0);
  function plant(x,z,h=1.3){cylinder(.25,.18,.42,x,.21,z,phong(0x876347));cylinder(.025,.035,h,x,.43+h/2,z,leafMat);for(let i=0;i<7;i++){const a=i*2.4,y=.55+i*h/8;const leaf=sphere(.19,x+Math.cos(a)*.2,y,z+Math.sin(a)*.2,leafMat);leaf.scale.set(.7,1.8,.6);leaf.rotation.z=Math.cos(a)*.6;}for(let i=0;i<4;i++){const a=i*Math.PI/2;sphere(.07,x+Math.cos(a)*.18,h+.45,z+Math.sin(a)*.18,flowerMat);}collide(x,z,.65,.65);}
  for(const [x,z]of[[-5.15,-5.3],[5.15,-5.3],[-5.2,4.8],[5.2,4.8],[-5.1,-1.7],[5.1,-1.7]])plant(x,z,1.0+(z<0?.4:0));
  const flames=[];function candle(x,y,z){cylinder(.1,.15,.05,x,y,z,materials.gold);cylinder(.045,.045,.3,x,y+.18,z,materials.cream);const f=sphere(.027,x,y+.36,z,new THREE.MeshBasicMaterial({color:0xffe9b4}));f.scale.y=2;flames.push(f);lamp(x,y+.4,z,0xffd29f,.7,3);}
  for(const x of [-1.1,1.1])candle(x,1.13,-2.35);
  cylinder(.025,.025,.6,0,4.3,1,materials.gold);const chandelier=new THREE.Mesh(new THREE.TorusGeometry(.8,.035,8,40),materials.gold);chandelier.rotation.x=Math.PI/2;chandelier.position.set(0,3.98,1);scene.add(chandelier);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;candle(Math.sin(a)*.8,3.98,1+Math.cos(a)*.8);}
  // Four square panes in a numbered two-by-two frame.
  const backdrop=new THREE.Mesh(new THREE.PlaneGeometry(3.45,3.45),gardenMaterial);backdrop.position.set(0,2.5,-6.67);backdrop.renderOrder=-6;scene.add(backdrop);
  for(const x of [-1.82,0,1.82])box(.1,3.75,.2,x,2.5,-6.44,materials.gold);for(const y of [.63,2.5,4.37])box(3.74,.1,.2,0,y,-6.44,materials.gold);
  const paneIds=['star','moon','horizon','sun'];
  function paneMaterial(id){const c=document.createElement('canvas');c.width=c.height=256;const cx=c.getContext('2d'),g=cx.createLinearGradient(0,0,0,256);g.addColorStop(0,{star:'#182844',moon:'#20334d',horizon:'#6b5274',sun:'#ca9b60'}[id]);g.addColorStop(1,{star:'#657894',moon:'#94a6b4',horizon:'#efba99',sun:'#f5dda4'}[id]);cx.fillStyle=g;cx.fillRect(0,0,256,256);cx.fillStyle='#f9eac0';cx.strokeStyle='#f9eac0';cx.lineWidth=6;if(id==='star'){cx.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,r=i%2?18:42;const x=128+Math.cos(a)*r,y=73+Math.sin(a)*r;i?cx.lineTo(x,y):cx.moveTo(x,y);}cx.closePath();cx.fill();}else if(id==='moon'){cx.beginPath();cx.arc(128,74,39,0,Math.PI*2);cx.fill();cx.fillStyle='#334b62';cx.beginPath();cx.arc(145,61,35,0,Math.PI*2);cx.fill();}else if(id==='sun'){cx.beginPath();cx.arc(128,74,38,0,Math.PI*2);cx.fill();}else{cx.beginPath();cx.arc(128,167,45,Math.PI,Math.PI*2);cx.stroke();}cx.fillStyle='#476b51';cx.beginPath();cx.moveTo(0,181);cx.quadraticCurveTo(70,147,135,181);cx.quadraticCurveTo(200,155,256,181);cx.lineTo(256,256);cx.lineTo(0,256);cx.fill();cx.strokeStyle='#dbca9b';cx.strokeRect(4,4,248,248);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return new THREE.MeshBasicMaterial({map:t});}
  const paneMats=Object.fromEntries(paneIds.map(id=>[id,paneMaterial(id)])),paneGroups=[];
  for(let slot=0;slot<4;slot++){const variants={};for(const id of paneIds){variants[id]=[];for(let turn=0;turn<4;turn++){const g=new THREE.Group();g.position.set(slot%2?.9:-.9,slot<2?3.4:1.6,-6.31);g.rotation.z=-turn*Math.PI/2;scene.add(g);const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1.65,1.65),paneMats[id]);g.add(mesh);g.visible=false;variants[id].push(g);}}paneGroups.push(variants);}
  function textPlaque(text,w,h){const c=document.createElement('canvas');c.width=768;c.height=256;const cx=c.getContext('2d');cx.fillStyle='#2a3d2d';cx.fillRect(0,0,768,256);cx.strokeStyle='#d9c790';cx.lineWidth=5;cx.strokeRect(12,12,744,232);cx.fillStyle='#f5e8bf';cx.textAlign='center';cx.font='37px Georgia';cx.fillText(text,384,145);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t}));}
  for(let i=0;i<4;i++){const label=textPlaque(String(i+1),.24,.15);label.position.set(i%2?.9:-.9,i<2?4.23:2.43,-6.24);scene.add(label);}
  const emblem=new THREE.Group();emblem.position.set(0,.43,-6.3);scene.add(emblem);const medal=new THREE.Mesh(new THREE.CircleGeometry(.19,24),materials.gold);emblem.add(medal);emblem.visible=false;
  const closedDoor=new THREE.Group();scene.add(closedDoor);box(1.76,3.2,.18,0,1.6,6.74,materials.wood,closedDoor);for(const x of [-.65,.65])box(.025,2.8,.025,x,1.6,6.6,materials.gold,closedDoor);sphere(.07,-.6,1.45,6.56,materials.gold,closedDoor);
  for(const x of [-.96,.96])box(.13,3.4,.25,x,1.7,6.6,materials.gold);box(2.05,.13,.25,0,3.4,6.6,materials.gold);
  const beyond=new THREE.Mesh(new THREE.PlaneGeometry(1.8,3.2),gardenMaterial);beyond.position.set(0,1.6,7.15);beyond.rotation.y=Math.PI;scene.add(beyond);
  const title=textPlaque('THE DOOR TO TOMORROW',3.4,.5);title.position.set(0,3.98,6.7);title.rotation.y=Math.PI;scene.add(title);
  function target(id,x,y,z,w=.8,h=.6,d=.8){const g=new THREE.Group();g.position.set(x,y,z);scene.add(g);const hit=box(w,h,d,0,0,0,new THREE.MeshBasicMaterial({visible:false}),g,false);hit.userData.id=id;interactables.push(hit);map.set(id,g);return g;}
  const clasps=[];function page(id,x,z,angle){const g=target(id,x,1.16,z);g.rotation.y=angle;box(.49,.025,.39,0,0,0,materials.paper,g);clasps.push(box(.1,.04,.4,0,.03,0,materials.gold,g));}
  page('seed',-4,2.3,.2);page('rain',4,2.3,-.2);page('leaf',-4.6,-3.8,.4);page('bloom',4.6,-3.8,-.3);
  const book=target('book',0,1.22,-2.25,1.4,.8,1);const cover=box(.88,.13,.7,0,0,0,materials.red,book);const bookSeal=box(.14,.035,.74,0,.085,0,materials.gold,book);const opened=new THREE.Group();book.add(opened);box(.73,.03,.62,-.37,.07,0,materials.paper,opened);box(.73,.03,.62,.37,.07,0,materials.paper,opened);opened.visible=false;
  target('window',0,2,-6.13,3.5,3.6,.4);target('door',0,1.5,6.5,1.8,3,.35);
  function movable(x,z){return Math.abs(x)<5.55&&Math.abs(z)<6.5&&!colliders.some(b=>Math.abs(x-b.x)<b.w&&Math.abs(z-b.z)<b.d);}
  const openDoor=cinema.door(scene,[closedDoor],-.85,6.75,1,false);
  const openBook=cinema.book(scene,book,.88,.7);
  const secret=SECRETS[3],bookmark=target('secret',secret.x,secret.y,secret.z,.6,.45,.6);
  box(.16,.012,.43,0,0,0,materials.gold,bookmark);box(.06,.015,.36,0,.012,0,materials.paper,bookmark);
  const motion=createRoomMotion({canvas,camera,container,movable,interactables,map,onTarget,onInspect,onStep:()=>document.dispatchEvent(new CustomEvent('vault-step'))});
  function resized(){const rect=container.getBoundingClientRect();renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();}
  new ResizeObserver(resized).observe(container);resized();
  let lastPausedRender=-Infinity;
  function frame(now){requestAnimationFrame(frame);motion.tick(now);cinema.tick(now);if(document.hidden)return;
    if(motion.paused&&!cinema.active&&now-lastPausedRender<350)return;lastPausedRender=now;
    const t=now/1000;flames.forEach((f,i)=>{f.scale.y=1.8+Math.sin(t*5+i)*.15;});renderer.render(scene,camera,cinema.active);
  }
  requestAnimationFrame(frame);onReady(renderer.isCompatibility);
  return {placeEmblem(){emblem.visible=true;},setPanels(slots,turns){paneGroups.forEach((variants,i)=>{for(const id of paneIds)variants[id].forEach((g,t)=>g.visible=slots[i]===id&&turns[id]===t);});},lightMorning(){clasps.forEach(m=>m.visible=false);materials.wall.color.set(0xf3e4bf);materials.rug.color.set(0x638366);sunLight.intensity=3.4;},unsealBook(instant=false){bookSeal.visible=false;cover.visible=false;opened.visible=false;openBook(instant);},openFinalDoor(instant=false){openDoor(instant);},...motion,collected(id){const g=map.get(id);if(g){g.visible=false;const i=interactables.findIndex(m=>m.userData.id===id);if(i>=0)interactables.splice(i,1);}}};
}

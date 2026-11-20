
import {SECRETS} from './vault-rewards.js?v=20261112-cinematic';
import {createRoomCinematics} from './vault-cinematics.js?v=20261112-cinematic';
import {createRoomMotion} from './vault-motion.js?v=20261112-cinematic';
import * as THREE from './vault-three.module.js';

import {createCanvasRenderer} from './vault-canvas.js?v=20261112-cinematic';

// A self-contained room: local textures and no external network dependencies.
export function createRoom(container, {onTarget, onInspect, onReady, onFailure}) {
  const scene = new THREE.Scene();
  const cinema=createRoomCinematics();
  scene.background = new THREE.Color(0x171019);
  scene.fog = new THREE.FogExp2(0x1a1015, .026);
  const camera = new THREE.PerspectiveCamera(64, 1, .06, 60);
  camera.position.set(0, 1.67, 5.8);
  let renderer;
  const probe=document.createElement('canvas');
  const gl=probe.getContext('webgl2',{antialias:true});
  if(gl){renderer=new THREE.WebGLRenderer({canvas:probe,context:gl,antialias:true,powerPreference:'high-performance'});}
  else renderer=createCanvasRenderer(THREE);
  // Cap rendering cost on small touch screens while retaining desktop detail.
  const compactDisplay=window.matchMedia('(max-width: 700px), (pointer: coarse)').matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compactDisplay ? 1.15 : 1.4));
  renderer.shadowMap.enabled=!renderer.isCompatibility;
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
  materials.rug=phong(0x5b1729);materials.red=phong(0x74283f,{roughness:.92});materials.glass=phong(0x9dc5e3,{metalness:.35,roughness:.16,emissive:0x45688c,emissiveIntensity:.42});
  // Richer physical finishes without increasing geometry or texture downloads.
  materials.wood.roughness=.57;materials.darkwood.roughness=.64;
  materials.wall.roughness=.92;materials.floor.roughness=.73;
  materials.gold.color.set(0xc3b7c8);materials.gold.metalness=.72;materials.gold.roughness=.29;
  materials.glass.color.set(0xb8dcf2);materials.glass.emissive.set(0x42698f);
  new THREE.TextureLoader().load('./vault-castle-materials.webp', image=>{
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
  function cylinder(r1,r2,h,x,y,z,mat,parent=scene){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,renderer.isCompatibility?8:16),mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
  function sphere(r,x,y,z,mat,parent=scene){const mesh=new THREE.Mesh(new THREE.SphereGeometry(r,renderer.isCompatibility?8:12,renderer.isCompatibility?6:8),mat);mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
  function collide(x,z,w,d){colliders.push({x,z,w:w/2+.24,d:d/2+.24});}
  const hemi=new THREE.HemisphereLight(0xd8e9ff,0x57405d,1.35);scene.add(hemi);
  const moon=new THREE.DirectionalLight(0xb6d8ff,2.15);moon.position.set(-6,6,3);scene.add(moon);
  function lamp(x,y,z,color=0xffb86a,intensity=3,range=9){const light=new THREE.PointLight(color,intensity,range,1.6);light.position.set(x,y,z);scene.add(light);return light;}
  const keylight=lamp(0,3.8,-1,0xffe2bd,26,15);keylight.castShadow=true;keylight.shadow.mapSize.set(compactDisplay ? 512 : 1024,compactDisplay ? 512 : 1024);keylight.shadow.bias=-.001;
  box(12,.2,14,0,-.1,0,materials.floor,scene,false);
  box(12,.18,14,0,4.6,0,materials.darkwood,scene,false);
  box(12,4.6,.2,0,2.3,-7,materials.wall,scene,false);box(12,4.6,.2,0,2.3,7,materials.wall,scene,false);
  box(.2,4.6,14,-6,2.3,0,materials.wall,scene,false);box(.2,4.6,14,6,2.3,0,materials.wall,scene,false);
  // Royal stone pilasters and silver tracery enrich the chamber without blocking
  // the walkable floor, letter locations, or existing interaction raycasts.
  const royalStone=phong(0x89879e,{metalness:.16,roughness:.68});
  const royalSilver=phong(0xb4c7dc,{metalness:.68,roughness:.28});
  const royalAmethyst=phong(0x72528d,{metalness:.22,roughness:.48});
  for(const x of [-5.73,5.73])for(const z of [-5.55,-2.75,.15,4.95]){
    box(.22,3.72,.25,x,2.18,z,royalStone);
    box(.36,.17,.42,x,4.09,z,royalSilver);
    box(.36,.17,.42,x,.36,z,royalSilver);
    box(.12,.95,.29,x,2.95,z,royalAmethyst);
  }
  // Silver crescent medallions above the fireplace and entrance doorway.
  for(const z of [-6.84,6.84]){
    const crest=new THREE.Mesh(new THREE.TorusGeometry(.31,.035,6,24,Math.PI*1.65),royalSilver);
    crest.position.set(0,3.88,z);crest.rotation.z=.45;scene.add(crest);
    sphere(.085,.35,3.91,z,royalAmethyst);
  }
  // The ceiling follows the room's long axis and frames the central chandelier.
  for(const x of [-4.7,-2.4,0,2.4,4.7]){
    box(.15,.16,13.7,x,4.43,0,materials.wood);
  }
  for(const z of [-5.5,-2.8,0,2.8,5.5]){
    box(11.7,.2,.18,0,4.41,z,materials.wood);
  }
  // Walnut wainscoting, gilded rails, and recessed wall panels.
  for(const z of [-6.86,6.86]){box(11.8,1.05,.1,0,.53,z,materials.wood);for(const y of [.12,1.07,4.23,4.4])box(11.9,.045,.16,0,y,z,materials.gold);for(let x=-5.5;x<6;x+=1.1)box(.035,.85,.14,x,.54,z,materials.gold);}
  for(const x of [-5.86,5.86]){box(.1,1.05,13.8,x,.53,0,materials.wood);for(const y of [.12,1.07,4.23,4.4])box(.16,.045,13.9,x,y,0,materials.gold);for(let z=-6.5;z<7;z+=1.1)box(.14,.85,.035,x,.54,z,materials.gold);}
  for(const mesh of scene.children)if(mesh.isMesh)mesh.renderOrder=-20;
  scene.children.find(m=>m.isMesh).renderOrder=-30;
  const rugStart=scene.children.length;
  // A woven runner establishes a clear path from the entry to the desk.
  const textile=document.createElement('canvas');
  textile.width=512;textile.height=768;
  const weave=textile.getContext('2d');
  weave.fillStyle='#492329';weave.fillRect(0,0,512,768);
  for(let y=0;y<768;y+=2){
    weave.fillStyle=y%6===0?'#ffffff0d':'#00000018';
    weave.fillRect(0,y,512,1);
  }
  for(const [inset,width,color] of [[12,3,'#aa8556'],[19,12,'#653d33'],[30,2,'#b58c5b'],[43,2,'#8f654b']]){
    weave.strokeStyle=color;weave.lineWidth=width;
    weave.strokeRect(inset,inset,512-2*inset,768-2*inset);
  }
  for(let y=92;y<720;y+=73)for(let x=78;x<470;x+=71){
    weave.save();weave.translate(x,y);weave.rotate(Math.PI/4);
    weave.strokeStyle='#a67357';weave.lineWidth=1.4;
    weave.strokeRect(-13,-13,26,26);weave.strokeRect(-7,-7,14,14);
    weave.restore();
  }
  const carpet=new THREE.CanvasTexture(textile);
  carpet.colorSpace=THREE.SRGBColorSpace;
  materials.rug.map=carpet;materials.rug.color.set(0xffffff);
  box(4.55,.025,9,0,.025,.65,materials.rug);
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
  const firelight=lamp(0,.65,-5.95,0xff8839,11,8);
  const flameMaterial=phong(0xf6ad4d,{emissive:0xff640f,emissiveIntensity:2.4});
  const hearthFlames=[];
  for(let i=0;i<7;i++){
    const flame=sphere(.105,(i-3)*.22,.43,-6.03+(i%2)*.12,flameMaterial);
    flame.scale.set(.8,1.8+(i%3)*.4,.65);
    flame.rotation.z=(i-3)*.09;
    hearthFlames.push(flame);
  }
  for(const x of [-1.52,1.52]){
    box(.48,.13,1.02,x,1.66,-6.32,stone);
    box(.48,.12,1.02,x,.31,-6.32,stone);
  }
  box(3.38,.07,1.25,0,2.05,-6.3,stone);
  for(let x=-.9;x<=.9;x+=.3)box(.025,.5,.04,x,.5,-5.84,materials.black);
  collide(0,-6.3,3.2,1.4);
  const flames=[];
  function candle(x,y,z,h=.3){cylinder(.095,.13,.06,x,y,z,materials.gold);cylinder(.026,.04,.2,x,y+.1,z,materials.gold);cylinder(.052,.052,h,x,y+.2+h/2,z,materials.cream);const f=sphere(.032,x,y+.23+h,z,phong(0xffe8a1,{emissive:0xffae42,emissiveIntensity:3}));f.scale.y=2;flames.push(f);lamp(x,y+.24+h,z,0xffac64,1.3,3);}
  for(const x of [-1.12,1.12])candle(x,2.02,-6.24,.4);
  // Oval portrait and an ornate gilded mantel mirror.
  const mirror=new THREE.Mesh(new THREE.CircleGeometry(.74,48),materials.glass);mirror.position.set(0,3.05,-6.84);mirror.scale.y=1.18;scene.add(mirror);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.8,.055,8,64),materials.gold);rim.position.set(0,3.05,-6.81);rim.scale.y=1.18;scene.add(rim);
  // The window sits deep in the wall, with moonlight beyond the leaded panes.
  const night=document.createElement('canvas');
  night.width=384;night.height=384;
  const view=night.getContext('2d');
  const sky=view.createLinearGradient(0,0,0,384);
  sky.addColorStop(0,'#172337');sky.addColorStop(1,'#557083');
  view.fillStyle=sky;view.fillRect(0,0,384,384);
  const glow=view.createRadialGradient(120,102,12,120,102,85);
  glow.addColorStop(0,'#e9eef5aa');glow.addColorStop(1,'#a7c3dd00');
  view.fillStyle=glow;view.fillRect(0,0,384,384);
  view.fillStyle='#e0e5ea';view.beginPath();view.arc(120,102,25,0,Math.PI*2);view.fill();
  for(const [base,color] of [[255,'#314959'],[306,'#233747'],[347,'#192935']]){
    view.fillStyle=color;view.beginPath();view.moveTo(0,384);
    for(let x=0;x<=384;x+=8) view.lineTo(x,base+18*Math.sin(x*.018+base)+7*Math.cos(x*.071));
    view.lineTo(384,384);view.fill();
  }
  const nightTexture=new THREE.CanvasTexture(night);
  nightTexture.colorSpace=THREE.SRGBColorSpace;
  const windowView=new THREE.Mesh(new THREE.PlaneGeometry(2.52,2.48),new THREE.MeshBasicMaterial({map:nightTexture}));
  windowView.rotation.y=Math.PI/2;windowView.position.set(-5.78,2.65,2);
  scene.add(windowView);
  for(const z of [.69,3.31])box(.25,2.8,.16,-5.68,2.65,z,materials.darkwood);
  for(const z of [1.55,2.45])box(.1,2.52,.045,-5.69,2.65,z,materials.gold);
  for(const y of [1.34,3.96])box(.32,.13,2.8,-5.65,y,2,materials.wood);
  for(const y of [2.15,3.14])box(.1,.045,2.6,-5.69,y,2,materials.gold);
  lamp(-5.1,2.6,2,0x9fcfff,8,8);
  const curtain=phong(0x492131,{roughness:1});for(const z of [.28,3.73])for(let i=0;i<5;i++){const c=cylinder(.16,.16,3.25,-5.47+i*.018,2.25,z+(i-2)*.11,curtain);c.scale.x=.7;}
  box(1.15,.18,3.2,-5.08,.61,2,materials.wood);box(.9,.18,2.9,-5.05,.78,2,materials.red);for(const z of [.6,3.4])box(.13,.6,.13,-5.04,.3,z,materials.wood);collide(-5.05,2,1.35,3.3);
  // Gothic silver detailing: all pieces remain against existing surfaces.
  // They do not introduce collisions or alter letter/diary interactions.
  const gothicSilver=phong(0xc1d2e0,{metalness:.73,roughness:.31});
  const gothicStone=phong(0x9b9caf,{roughness:.77});
  // Carved marble fireplace pilasters and a shallow crown above the mantel.
  for(const x of [-1.52,1.52]){
    box(.17,1.7,.14,x,1.08,-5.88,gothicStone);
    box(.28,.11,.2,x,1.92,-5.88,gothicSilver);
    box(.27,.11,.2,x,.28,-5.88,gothicSilver);
  }
  box(3.2,.075,.09,0,2.17,-5.85,gothicSilver);
  for(const x of [-1.15,-.57,0,.57,1.15]){
    const ornament=new THREE.Mesh(new THREE.OctahedronGeometry(.072,0),gothicSilver);
    ornament.position.set(x,2.26,-5.85);ornament.scale.y=1.65;scene.add(ornament);
  }
  // Gothic lancet-style window crown and silver mullion intersections.
  for(const z of [1.12,2,2.88]){
    const point=new THREE.Mesh(new THREE.ConeGeometry(.15,.27,4),gothicSilver);
    point.rotation.y=Math.PI/4;
    point.position.set(-5.61,4.04,z);
    scene.add(point);
  }
  for(const y of [2.15,3.14])for(const z of [1.55,2.45])
    sphere(.055,-5.57,y,z,gothicSilver);
  // Ornamental crown molding above the existing bookcases.
  // These positions match the existing five bookcase placements.
  for(const [x,z,alongZ] of [[-5.48,-3.6,true],[5.48,-3.6,true],[5.48,.4,true],[-3.85,-6.5,false],[3.85,-6.5,false]]){
    box(alongZ?.16:3.6,.13,alongZ?3.6:.16,x,3.76,z,gothicSilver);
    for(const offset of [-1.32,0,1.32]){
      const jewel=new THREE.Mesh(new THREE.OctahedronGeometry(.075,0),royalAmethyst);
      jewel.position.set(x+(alongZ?0:offset),3.82,z+(alongZ?offset:0));
      scene.add(jewel);
    }
  }
  // Writing desk, chair, blotter, quill, lamp, and a locked heart diary.
  const deskX=0,deskZ=-2.45;box(3.25,.17,1.55,deskX,1.13,deskZ,materials.wood);for(const x of [-1.35,1.35])for(const z of [-3.02,-1.88]){box(.16,1.05,.16,x,.54,z,materials.wood);cylinder(.12,.07,.17,x,.18,z,materials.gold);}
  box(1.55,.35,1.25,0,.85,deskZ,materials.darkwood);box(1.48,.28,.08,0,.86,-1.77,materials.wood);cylinder(.045,.045,.04,0,.86,-1.7,materials.gold).rotation.x=Math.PI/2;
  box(1.8,.02,.9,0,1.23,deskZ,materials.red);collide(0,deskZ,3.4,1.7);
  box(.8,.15,.72,0,.6,-3.85,materials.wood);box(.8,.8,.12,0,1.02,-4.16,materials.wood);for(const x of [-.32,.32])for(const z of [-3.58,-4.1])box(.09,.57,.09,x,.28,z,materials.wood);collide(0,-3.85,1,1);
  candle(-1.13,1.24,-2.55,.31);cylinder(.07,.08,.14,1.12,1.29,-2.6,materials.black);const quill=box(.025,.5,.012,1.16,1.6,-2.6,materials.cream);quill.rotation.z=-.35;
  for(let i=0;i<3;i++)box(.48,.018,.59,.88+i*.03,1.24+i*.018,-2.06,materials.paper);
  // Raised edge and paired drawer fronts give the desk usable proportions.
  for(const x of [-1.02,1.02]){
    box(.55,.28,.12,x,.94,-1.73,materials.darkwood);
    box(.48,.21,.04,x,.94,-1.66,materials.wood);
    sphere(.037,x,.96,-1.625,materials.gold);
  }
  for(const x of [-1.59,1.59])box(.055,.065,1.54,x,1.24,deskZ,materials.darkwood);
  box(3.21,.065,.055,0,1.24,deskZ-.73,materials.darkwood);
  // Side table with the rose letter and a velvet chair.
  cylinder(.68,.68,.12,-3.8,.95,-2.4,materials.wood);cylinder(.12,.22,.85,-3.8,.48,-2.4,materials.wood);collide(-3.8,-2.4,1.5,1.5);
  box(1,.2,1,-3.9,.55,-.7,materials.red);box(1,1.2,.17,-3.9,1.05,-1.14,materials.red);for(const x of [-4.3,-3.5])for(const z of [-1.05,-.35])box(.09,.45,.09,x,.23,z,materials.wood);collide(-3.9,-.7,1.2,1.3);
  // Fine royal furniture detailing, placed on existing furniture only.
  // No new colliders or interactable targets: original letters remain accessible.
  const inlay=phong(0xb9cbdc,{metalness:.76,roughness:.24});
  const velvetTrim=phong(0x9a6b91,{roughness:.91});
  // Silver filigree around the writing desk's front and edge.
  for(const x of [-1.47,1.47])box(.028,.24,.04,x,.91,-1.64,inlay);
  for(const y of [.77,1.04])box(3.02,.022,.045,0,y,-1.635,inlay);
  for(const x of [-1.12,1.12])sphere(.045,x,.9,-1.602,inlay);
  // Carved apron and silver rim on the rose-letter side table.
  cylinder(.71,.71,.035,-3.8,1.025,-2.4,inlay);
  cylinder(.52,.52,.06,-3.8,.855,-2.4,materials.darkwood);
  // Upholstered chair edging and a crest on its back.
  for(const x of [-4.36,-3.44]){
    box(.045,.14,.86,x,.61,-.7,inlay);
    box(.05,1.05,.05,x,1.08,-1.14,materials.wood);
  }
  box(.84,.04,.05,-3.9,1.64,-1.14,inlay);
  box(.76,.05,.05,-3.9,1.48,-1.04,velvetTrim);
  // Small royal amethyst jewel on the chair crest.
  sphere(.075,-3.9,1.59,-1.04,royalAmethyst);
  // Chandelier: dark brass arms and a crown of warm candlelight.
  cylinder(.035,.035,.75,0,4.16,-.5,materials.gold);const chandelier=new THREE.Mesh(new THREE.TorusGeometry(.72,.045,8,32),materials.gold);chandelier.rotation.x=Math.PI/2;chandelier.position.set(0,3.72,-.5);scene.add(chandelier);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;candle(Math.sin(a)*.72,3.72,-.5+Math.cos(a)*.72,.18);}
  // Icy crystal pendants on the existing chandelier, kept lightweight for mobile.
  const crystal=phong(0xc3e7f6,{metalness:.2,roughness:.14,transparent:true,opacity:.83,emissive:0x3a6688,emissiveIntensity:.22});
  for(let i=0;i<8;i++){
    const angle=i*Math.PI/4;
    const drop=new THREE.Mesh(new THREE.OctahedronGeometry(.075,0),crystal);
    drop.position.set(Math.sin(angle)*.7,3.48,-.5+Math.cos(angle)*.7);
    drop.scale.y=2.15;scene.add(drop);
  }
  const doorStart=scene.children.length;
  // Exit door and framed plaque.
  box(1.7,3,.16,0,1.5,6.76,materials.wood);for(const x of [-.92,.92])box(.14,3.2,.23,x,1.6,6.62,materials.gold);box(1.98,.14,.23,0,3.2,6.62,materials.gold);for(const y of [.75,2.15]){box(1.32,1.1,.06,0,y,6.64,materials.darkwood);for(const x of [-.65,.65])box(.025,1.08,.015,x,y,6.6,materials.gold);}sphere(.07,-.6,1.35,6.48,materials.gold);
  const openDoor=cinema.door(scene,scene.children.slice(doorStart).filter(m=>Math.abs(m.position.x)<.85&&m.position.y<3.1),-.85,6.76,1);
  function textPlaque(text,w,h){const c=document.createElement('canvas');c.width=768;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#20181a';ctx.fillRect(0,0,768,256);ctx.strokeStyle='#b29762';ctx.lineWidth=5;ctx.strokeRect(12,12,744,232);ctx.fillStyle='#dfc794';ctx.textAlign='center';ctx.font='36px Georgia';ctx.fillText(text,384,145);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex}));}
  const plaque=textPlaque('THE HEART CHAMBER',2.7,.65);plaque.position.set(0,3.81,6.69);plaque.rotation.y=Math.PI;scene.add(plaque);
  // Readable gold-seal props. A separate hit area keeps touch interaction forgiving.
  function target(id,x,y,z,w=.65,h=.5,d=.65){const g=new THREE.Group();g.position.set(x,y,z);g.userData.id=id;scene.add(g);const hit=box(w,h,d,0,0,0,new THREE.MeshBasicMaterial({visible:false}),g,false);hit.userData.id=id;interactables.push(hit);map.set(id,g);return g;}
  function envelope(id,x,y,z,angle=0){const g=target(id,x,y,z);g.rotation.y=angle;box(.46,.025,.31,0,0,0,materials.paper,g);const flap=new THREE.Mesh(new THREE.ConeGeometry(.2,.18,3),materials.cream);flap.rotation.x=Math.PI;flap.scale.y=.13;flap.position.y=.02;g.add(flap);const seal=cylinder(.048,.048,.018,0,.033,0,materials.gold,g);g.userData.seal=seal;const glow=new THREE.PointLight(0xffcc82,.4,1.7);glow.position.set(0,.2,0);g.add(glow);}
  envelope('rose',-3.8,1.04,-2.35,.3);envelope('ribbon',5.1,1.85,.35,.7);envelope('moon',-5.05,.9,2,.2);envelope('key',.58,2.05,-6.12,-.3);
  const diary=target('diary',0,1.3,-2.15,1.1,.55,.9);box(.68,.11,.86,0,0,0,materials.red,diary);for(const x of [-.3,.3])box(.018,.009,.79,x,.061,0,materials.gold,diary);for(const z of [-.37,.37])box(.61,.009,.02,0,.061,z,materials.gold,diary);box(.15,.04,.18,.31,.04,.05,materials.gold,diary);const heart=sphere(.055,-.035,.09,0,materials.gold,diary);sphere(.055,.035,.09,0,materials.gold,diary);const tip=box(.085,.03,.085,0,.085,.05,materials.gold,diary);tip.rotation.y=Math.PI/4;
  target('door',0,1.5,6.5,1.7,2.8,.3);
  const openBook=cinema.book(scene,diary,.68,.86);
  function movable(x,z){return Math.abs(x)<5.55&&Math.abs(z)<6.5&&!colliders.some(b=>Math.abs(x-b.x)<b.w&&Math.abs(z-b.z)<b.d);}
  const secret=SECRETS[0],bookmark=target('secret',secret.x,secret.y,secret.z,.6,.45,.6);
  box(.16,.012,.43,0,0,0,materials.gold,bookmark);box(.06,.015,.36,0,.012,0,materials.paper,bookmark);
  const motion=createRoomMotion({canvas,camera,container,movable,interactables,map,onTarget,onInspect,onStep:()=>document.dispatchEvent(new CustomEvent('vault-step'))});
  // Support browsers without ResizeObserver and avoid a zero-height canvas
  // during page transitions or temporary layout changes.
  function resized(){
    const rect=container.getBoundingClientRect();
    if(rect.width<=0||rect.height<=0)return;
    renderer.setSize(rect.width,rect.height,false);
    camera.aspect=rect.width/rect.height;
    camera.updateProjectionMatrix();
  }
  if(typeof ResizeObserver==='function')new ResizeObserver(resized).observe(container);
  else window.addEventListener('resize',resized,{passive:true});
  resized();
  let lastPausedRender=-Infinity;
  function frame(now){requestAnimationFrame(frame);motion.tick(now);cinema.tick(now);if(document.hidden)return;
    if(motion.paused&&!cinema.active&&now-lastPausedRender<350)return;lastPausedRender=now;
    const t=now/1000;flames.forEach((f,i)=>{f.scale.y=1.8+Math.sin(t*5+i)*.15;});hearthFlames.forEach((f,i)=>{f.scale.y=1.8+(i%3)*.4+Math.sin(t*8+i)*.3;});firelight.intensity=11+Math.sin(t*11)*.6;renderer.render(scene,camera,cinema.active);
  }
  requestAnimationFrame(frame);onReady(renderer.isCompatibility);
  return {openDoor,openBook,...motion,collected(id){const g=map.get(id);if(g){g.visible=false;const i=interactables.findIndex(m=>m.userData.id===id);if(i>=0)interactables.splice(i,1);}}};
}

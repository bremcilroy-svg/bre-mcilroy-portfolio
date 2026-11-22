import * as THREE from './vault-three.module.js?v=academy-house-3d';
import {createCanvasRenderer} from './vault-canvas.js?v=academy-house-3d';
import {createRoyalRoomKit} from './academy-3d-architecture.js?v=academy-house-3d';
import {createPerspectiveView} from './vault-perspective.js?v=phase7-perspective';

(() => {
  'use strict';
  const house=document.body.dataset.house;
  const houses={
    amethyst:{name:'Amethyst',element:'Air',color:'#74489a',pale:'#ddcbf5',guardian:'Snow Owl',shape:'owl'},
    emberheart:{name:'Emberheart',element:'Fire',color:'#963b51',pale:'#f2bdc7',guardian:'Young Dragon',shape:'dragon'},
    frostveil:{name:'Frosttopaz',element:'Ice',color:'#377da3',pale:'#c6f0fb',guardian:'Gentle Frost Wolf',shape:'wolf'},
    silverthorn:{name:'Silverthorn',element:'Earth',color:'#766888',pale:'#e1ddec',guardian:'Silver Stag',shape:'stag'}
  };
  const config=houses[house];
  const main=document.querySelector('main'),header=main?.querySelector(':scope > header');
  if(!config||!main||!header)return;
  const stage=document.createElement('section');
  stage.className='academy-house-3d-stage';
  stage.setAttribute('aria-label',`Walkable ${config.name} House common room`);
  stage.innerHTML=`<canvas class="academy-house-3d-canvas" tabindex="0" aria-label="Walk around the ${config.name} common room. Use W A S D or arrow keys to move, drag or touch to look, V to change perspective, and E to inspect nearby objects."></canvas><p class="academy-house-3d-status" role="status" aria-live="polite">Preparing House ${config.name}…</p><div class="academy-house-3d-settings"><label>Graphics<select aria-label="${config.name} House graphics quality"><option value="high">High</option><option value="balanced">Balanced</option><option value="performance">Performance</option></select></label></div><div class="academy-house-3d-touch" aria-label="Touch movement controls"><div class="academy-house-3d-dpad"><button type="button" data-walk="forward" aria-label="Walk forward">↑</button><button type="button" data-walk="left" aria-label="Walk left">←</button><button type="button" data-walk="back" aria-label="Walk backward">↓</button><button type="button" data-walk="right" aria-label="Walk right">→</button></div><button type="button" data-inspect>Inspect</button></div>`;
  header.after(stage);
  const canvas=stage.querySelector('canvas'),status=stage.querySelector('[role="status"]'),qualitySelect=stage.querySelector('select');
  const scene=new THREE.Scene();scene.background=new THREE.Color('#111426');scene.fog=new THREE.Fog('#111426',16,34);
  const camera=new THREE.PerspectiveCamera(68,1,.08,60);
  const player={x:0,z:7.15,yaw:0,pitch:0};
  const room=new THREE.Group();scene.add(room);
  const kit=createRoyalRoomKit(THREE,room);
  const mat={
    stone:new THREE.MeshStandardMaterial({color:'#687187',roughness:.94}),pale:new THREE.MeshStandardMaterial({color:'#c5cedc',roughness:.8}),
    silver:new THREE.MeshStandardMaterial({color:'#dbe6f3',metalness:.6,roughness:.32}),
    house:new THREE.MeshStandardMaterial({color:config.color,roughness:.74}),housePale:new THREE.MeshStandardMaterial({color:config.pale,roughness:.7}),
    glass:new THREE.MeshStandardMaterial({color:'#72c9ed',emissive:'#3489b1',emissiveIntensity:.35,roughness:.2,side:THREE.DoubleSide}),
    wood:new THREE.MeshStandardMaterial({color:'#422d36',roughness:.83}),fire:new THREE.MeshBasicMaterial({color:'#ee9b65'}),
    gray:new THREE.MeshStandardMaterial({color:'#858c97',roughness:.95}),white:new THREE.MeshStandardMaterial({color:'#eff1f4',roughness:.97}),
    blue:new THREE.MeshBasicMaterial({color:'#50c4ff'}),black:new THREE.MeshBasicMaterial({color:'#141622'}),gold:new THREE.MeshStandardMaterial({color:'#c5a36c',metalness:.55,roughness:.4})
  };
  const box=(name,size,pos,material)=>{const m=kit.box({name,size,position:pos,material});m.castShadow=true;m.receiveShadow=true;return m;};
  const ball=(name,r,pos,material,parent=room)=>{const m=kit.sphere({name,size:[r,r,r],position:pos,material,parent});m.castShadow=true;return m;};
  const sceneItems=[];
  function item(name,id,pos){const g=new THREE.Group();g.name=name;g.position.set(...pos);g.userData.interactable=id;room.add(g);sceneItems.push({id,x:pos[0],z:pos[2]});return g;}
  scene.add(new THREE.HemisphereLight('#d9eaff','#2b2032',1.55));
  const moon=new THREE.DirectionalLight('#bfdfff',1.6);moon.position.set(-5,9,-4);scene.add(moon);
  for(const [x,z,color] of [[-5,-5,'#93dfff'],[5,-4,config.color],[0,5,'#c9adf0']]){const l=new THREE.PointLight(color,14,10,2);l.position.set(x,3,z);scene.add(l);}
  box('polished gray limestone common room floor',[15,.3,19],[0,-.18,0],mat.stone);
  box('rear medieval stone wall',[15,8,.65],[0,3.7,-9.55],mat.stone);
  box('west stone wall',[.65,8,19],[-7.55,3.7,0],mat.stone);
  box('east stone wall',[.65,8,19],[7.55,3.7,0],mat.stone);
  for(let i=0;i<7;i++){
    const x=-6+i*2;
    box('silver vaulted ceiling rib',[.16,6.7,.18],[x,5.6,-8.98],mat.pale);
    box('icy stained glass window',[1.05,3.5,.08],[x,3.7,-9.18],mat.glass);
    box('silver window mullion',[.08,3.7,.13],[x,3.7,-9.12],mat.silver);
  }
  // The open south arch is the room's visible entrance; collision keeps players inside.
  for(const x of [-5.3,5.3]){
    box('carved silver entrance pier',[.6,5.8,.7],[x,2.8,9],mat.pale);
    ball('amethyst pier cap',.42,[x,5.8,9],mat.housePale);
  }
  box('Gothic entrance arch keystone',[11,.48,.75],[0,5.85,9],mat.silver);
  // The central tables and hearth are detailed interactable props, with clear routes around them.
  const hearth=item('royal stone hearth','hearth',[-5.3,0,-4.8]);
  box('hearth stone surround',[2.1,2.5,.55],[-5.3,1.25,-4.5],mat.pale);
  box('warm hearth opening',[1.2,1.6,.12],[-5.3,1.1,-4.18],mat.wood);
  ball('soft firelight',[.34,.65,.06],[-5.3,1.1,-4.05],mat.fire);
  box('silver mantle',[2.5,.22,.78],[-5.3,2.65,-4.5],mat.silver);
  const table=item('shared house table','table',[0,0,-.15]);
  box('oak gathering table',[3.1,.22,1.7],[0,1.15,-.15],mat.wood);
  for(const x of [-1.25,1.25])for(const z of [-.7,.7])box('carved table leg',[.18,1.1,.18],[x,.55,z-.15],mat.silver);
  for(const x of [-2,2]){
    box('velvet common room bench',[1.15,.52,.6],[x,.46,-.15],mat.house);
    box('silver bench feet',[1.25,.12,.68],[x,.12,-.15],mat.silver);
  }
  const shelves=item('story and house bookcase','bookshelf',[5.5,0,-5.2]);
  box('carved bookcase',[1.7,3.6,.8],[5.5,1.8,-5.45],mat.wood);
  box('bookcase silver cornice',[1.95,.22,1],[5.5,3.72,-5.45],mat.silver);
  for(let level=0;level<3;level++)for(let n=0;n<5;n++)box('royal house book',[.19,.92,.42],[4.93+n*.28,.8+level*1.02,-4.99],n%2?mat.house:mat.housePale);
  // Each room keeps its own house colors and retains the other three elemental identities.
  const banners=[['Amethyst','#74489a','air'],['Emberheart','#963b51','fire'],['Frostveil','#377da3','ice'],['Silverthorn','#766888','earth']];
  banners.forEach(([name,color,element],i)=>{
    const x=i%2===0?-7.08:7.08,z=-5.5+Math.floor(i/2)*6.8,flagmat=new THREE.MeshStandardMaterial({color,roughness:.7}),face=x<0?1:-1;
    box(name+' silver flagpole',[.07,3.8,.07],[x,5.15,z],mat.silver);
    const flag=box(name+' '+element+' house flag',[.1,1.15,1.65],[x+face*.58,4.9,z],flagmat);flag.userData.houseBanner=name;
    ball(name+' silver crest star',.19,[x+face*.62,4.94,z],mat.silver);
  });
  const guardian=item(config.guardian, 'guardian',[-5.55,0,2.8]);
  const creatureMat=house==='emberheart'?mat.housePale:mat.white;
  ball(config.guardian+' body',.72,[0,.86,0],creatureMat,guardian).scale.multiply(new THREE.Vector3(1.35,.9,1.5));
  ball(config.guardian+' head',.48,[0,1.65,.12],creatureMat,guardian);
  for(const side of [-1,1]){
    ball(config.guardian+' icy blue eye',.095,[side*.2,1.72,.52],mat.blue,guardian);
    ball(config.guardian+' pupil',.04,[side*.2,1.72,.6],mat.black,guardian);
    const ear=new THREE.Mesh(new THREE.ConeGeometry(.16,.42,5),house==='emberheart'?mat.housePale:mat.white);
    ear.position.set(side*.28,2.05,.05);ear.rotation.z=-side*.2;guardian.add(ear);
  }
  const gizmo=item('Gizmo gray and white cat companion','gizmo',[4.2,0,3.4]);
  ball('Gizmo gray body',.42,[0,.36,0],mat.gray,gizmo).scale.multiply(new THREE.Vector3(1.35,.86,.9));
  ball('Gizmo white chest',.22,[0,.3,.31],mat.white,gizmo);
  ball('Gizmo gray head',.3,[0,.78,.13],mat.gray,gizmo);
  for(const side of [-1,1]){
    const ear=new THREE.Mesh(new THREE.ConeGeometry(.12,.27,5),mat.gray);ear.position.set(side*.18,1.03,.1);ear.rotation.z=-side*.25;gizmo.add(ear);
    ball('Gizmo blue-gray eye',.045,[side*.11,.8,.4],mat.blue,gizmo);
    ball('Gizmo white paw',.12,[side*.22,.13,.12],mat.white,gizmo);
  }
  const tail=new THREE.Mesh(new THREE.TorusGeometry(.32,.065,6,12,Math.PI*1.4),mat.gray);tail.rotation.y=Math.PI/2;tail.position.set(-.38,.54,-.05);gizmo.add(tail);
  const portal=item('open common room entrance','exit',[0,0,8.6]);
  box('silver threshold',[3.8,.12,.8],[0,.02,8.95],mat.silver);

  let renderer;
  const originalCanvas=canvas;
  try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'});}
  catch{try{renderer=createCanvasRenderer(THREE);stage.replaceChild(renderer.domElement,canvas);}catch(error){stage.dataset.unavailable='true';status.textContent='This browser cannot draw the walkable common room. All house stories and links remain available below.';console.warn('House common room 3D renderer unavailable',error);return;}}
  const renderCanvas=renderer.domElement;renderCanvas.className='academy-house-3d-canvas';renderCanvas.tabIndex=0;
  renderCanvas.setAttribute('aria-label',originalCanvas.getAttribute('aria-label'));
  const perspective=createPerspectiveView(THREE,{scene,camera,canvas:renderCanvas,getPose:()=>player,distance:3.1});
  const keys=new Set(),held=new Set();let drag=null,last=0,frameHandle=0,renderCount=0;
  const collides=(x,z)=>{
    if(Math.abs(x)>6.8||z < -8.9||z>8.85)return true;
    if(Math.abs(x)<1.9&&Math.abs(z+.15)<1.25)return true;
    if(Math.abs(x+5.3)<1.4&&Math.abs(z+4.8)<1.25)return true;
    if(Math.abs(x-5.5)<1.2&&Math.abs(z+5.2)<.8)return true;
    if(Math.hypot(x+5.55,z-2.8)<.78||Math.hypot(x-4.2,z-3.4)<.68)return true;
    return false;
  };
  function requestRender(){if(!frameHandle&&!document.hidden)frameHandle=requestAnimationFrame(frame);}
  function resize(){const r=stage.getBoundingClientRect(),w=Math.max(1,r.width),h=Math.max(260,r.height);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();requestRender();}
  function moveBy(f,side,speed){
    if(!f&&!side)return;const mag=Math.hypot(f,side);f/=mag;side/=mag;
    const fx=-Math.sin(player.yaw),fz=-Math.cos(player.yaw),rx=Math.cos(player.yaw),rz=-Math.sin(player.yaw);
    const nx=player.x+(rx*side+fx*f)*speed,nz=player.z+(rz*side+fz*f)*speed;
    if(!collides(nx,player.z))player.x=nx;if(!collides(player.x,nz))player.z=nz;
  }
  function move(dt){
    const f=Number(keys.has('w')||keys.has('arrowup')||held.has('forward'))-Number(keys.has('s')||keys.has('arrowdown')||held.has('back'));
    const side=Number(keys.has('d')||held.has('right'))-Number(keys.has('a')||held.has('left'));
    moveBy(f,side,3.1*Math.min(dt,.05));
  }
  function inspect(target){
    let id=target;
    if(!id){const nearest=sceneItems.map(item=>({...item,d:Math.hypot(item.x-player.x,item.z-player.z)})).sort((a,b)=>a.d-b.d)[0];id=nearest?.d<2.6?nearest.id:null;}
    if(id==='exit'){
      const nav=main.querySelector('nav');
      if(nav){nav.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});nav.querySelector('a')?.focus({preventScroll:true});}
      status.textContent='The entrance arch leads back to the Academy. Choose a castle destination below.';return;
    }
    const messages={guardian:`${config.guardian} welcomes you to House ${config.name}, the house of ${config.element}.`,gizmo:'Gizmo stretches, purrs, and stays close by your side.',hearth:'A gentle fire warms the stone hearth. Its light catches the silver trim.',table:'The shared table is ready for housemates and visiting friends.',bookshelf:`The bookcase holds the stories and traditions of House ${config.name}.`};
    status.textContent=messages[id]||'Move closer to the house guardian, Gizmo, the hearth, the table, or the bookcase to inspect it.';
  }
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
  function pointerClick(e){const r=renderCanvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height*2-1));look();ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects([room],true)[0];let node=hit?.object;while(node&&!node.userData.interactable)node=node.parent;if(node)inspect(node.userData.interactable);}
  function look(){perspective.update();}
  renderCanvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,moved:false};renderCanvas.setPointerCapture(e.pointerId);requestRender();});
  renderCanvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;if(Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)>6)drag.moved=true;player.yaw-=(e.clientX-drag.x)*.004;player.pitch=Math.max(-.48,Math.min(.48,player.pitch-(e.clientY-drag.y)*.003));drag.x=e.clientX;drag.y=e.clientY;requestRender();});
  renderCanvas.addEventListener('pointerup',e=>{if(!drag||drag.id!==e.pointerId)return;const clicked=!drag.moved;drag=null;if(clicked)pointerClick(e);requestRender();});
  renderCanvas.addEventListener('pointercancel',()=>drag=null);
  renderCanvas.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown'].includes(k)){e.preventDefault();keys.add(k);requestRender();}if(k==='e'){e.preventDefault();inspect();}});
  renderCanvas.addEventListener('keyup',e=>{keys.delete(e.key.toLowerCase());requestRender();});
  window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(e.target.closest('button,a,input,select,textarea'))return;if(['w','a','s','d','arrowup','arrowdown'].includes(k)){e.preventDefault();keys.add(k);requestRender();}if(k==='e')inspect();if(k==='v')requestRender();});
  window.addEventListener('keyup',e=>{keys.delete(e.key.toLowerCase());requestRender();});
  window.addEventListener('blur',()=>{keys.clear();held.clear();requestRender();});
  const touchStarts=new Map();
  for(const button of stage.querySelectorAll('[data-walk]')){
    button.addEventListener('pointerdown',e=>{e.preventDefault();held.add(button.dataset.walk);touchStarts.set(button,e.timeStamp);button.setPointerCapture(e.pointerId);requestRender();});
    button.addEventListener('pointerup',e=>{held.delete(button.dataset.walk);const start=touchStarts.get(button);touchStarts.delete(button);if(start!==undefined&&e.timeStamp-start<120){const moves={forward:[1,0],back:[-1,0],left:[0,-1],right:[0,1]};const [f,s]=moves[button.dataset.walk];moveBy(f,s,.18);}requestRender();});
    for(const type of ['pointercancel','lostpointercapture'])button.addEventListener(type,()=>{held.delete(button.dataset.walk);touchStarts.delete(button);requestRender();});
  }
  stage.querySelector('[data-inspect]').addEventListener('click',()=>inspect());
  const levels={high:1.5,balanced:1,performance:.72};let saved='high';try{const value=localStorage.getItem('bre-poetry-vault-heart-graphics-v1');if(Object.hasOwn(levels,value))saved=value;}catch{}
  function setQuality(value,save=true){const quality=Object.hasOwn(levels,value)?value:'high';qualitySelect.value=quality;renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,levels[quality]));if(save)try{localStorage.setItem('bre-poetry-vault-heart-graphics-v1',quality);}catch{}resize();}
  qualitySelect.addEventListener('change',()=>setQuality(qualitySelect.value));setQuality(saved,false);
  const toggle=document.querySelector('[data-perspective-toggle]');if(toggle){const observer=new MutationObserver(requestRender);observer.observe(toggle,{attributes:true,attributeFilter:['aria-pressed']});}
  document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();held.clear();last=0;}else requestRender();});
  const ro=new ResizeObserver(resize);ro.observe(stage);resize();
  function frame(now){frameHandle=0;if(document.hidden){last=0;return;}const dt=last?Math.min(.05,Math.max(0,(now-last)/1000)):0;last=now;move(dt);look();renderer.render(scene,camera);renderCount++;if(keys.size||held.size)frameHandle=requestAnimationFrame(frame);else last=0;}
  requestRender();
  let geometryCount=0;const geos=new Set();scene.traverse(o=>{if(o.geometry)geos.add(o.geometry);});geometryCount=geos.size;
  window.academyHouseRoom3D=Object.freeze({diagnostics:()=>({ready:true,house,perspective:perspective.mode,position:{x:player.x,z:player.z},yaw:player.yaw,renderCount,geometryCount,bannerCount:room.children.filter(o=>o.userData.houseBanner).length,renderer:renderCanvas.dataset.renderer||'webgl',actualWebGL:Boolean(renderer.isWebGLRenderer),quality:qualitySelect.value,companion:'Gizmo'}),inspect});
  status.textContent=`Walkable House ${config.name} common room · WASD or arrows to move · drag or touch to look · E to inspect.`;
})();

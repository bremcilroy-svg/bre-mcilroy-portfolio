import * as THREE from './vault-three.module.js?v=academy-observatory-3d';
import {createCanvasRenderer} from './vault-canvas.js?v=academy-observatory-3d';
import {createPerspectiveView} from './vault-perspective.js?v=phase7-perspective';

(() => {
  'use strict';
  const stage = document.querySelector('#observatory-3d-stage');
  const canvas = document.querySelector('#observatory-3d-canvas');
  const status = document.querySelector('#observatory-3d-status');
  if (!stage || !canvas || !status) return;
  const qualitySelect = stage.querySelector('#observatory-3d-quality');
  const qualityKey = 'bre-poetry-vault-heart-graphics-v1';

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#10172c');
  scene.fog = new THREE.Fog('#10172c', 15, 30);
  const camera = new THREE.PerspectiveCamera(68, 1, .08, 48);
  const player = {x:0,z:7.1,yaw:0,pitch:0};
  const materials = {
    stone:new THREE.MeshStandardMaterial({color:'#66738d',roughness:.9}),
    pale:new THREE.MeshStandardMaterial({color:'#bfc9dc',roughness:.72}),
    silver:new THREE.MeshStandardMaterial({color:'#d9e5f1',metalness:.62,roughness:.32}),
    amethyst:new THREE.MeshStandardMaterial({color:'#684585',roughness:.58}),
    ruby:new THREE.MeshStandardMaterial({color:'#873b57',roughness:.65}),
    frost:new THREE.MeshStandardMaterial({color:'#377da3',roughness:.7}),
    silverthorn:new THREE.MeshStandardMaterial({color:'#8b859f',roughness:.64}),
    glass:new THREE.MeshStandardMaterial({color:'#69bde8',emissive:'#267db0',emissiveIntensity:.42,roughness:.22,side:THREE.DoubleSide}),
    night:new THREE.MeshBasicMaterial({color:'#091225',side:THREE.DoubleSide}),
    gold:new THREE.MeshStandardMaterial({color:'#c8a568',metalness:.55,roughness:.38}),
    dark:new THREE.MeshStandardMaterial({color:'#211a29',roughness:.8}),
    catGray:new THREE.MeshStandardMaterial({color:'#858b98',roughness:.93}),
    catWhite:new THREE.MeshStandardMaterial({color:'#edf0f3',roughness:.95}),
    eye:new THREE.MeshBasicMaterial({color:'#42b9ff'}),
    black:new THREE.MeshBasicMaterial({color:'#111522'})
  };
  const room = new THREE.Group();
  scene.add(room);
  const boxes = [];
  function box(name, size, position, material, parent=room) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size),material);
    mesh.name=name;mesh.position.set(...position);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);boxes.push(mesh);return mesh;
  }
  function cylinder(name, top, bottom, height, position, material, parent=room, sides=12) {
    const mesh=new THREE.Mesh(new THREE.CylinderGeometry(top,bottom,height,sides),material);
    mesh.name=name;mesh.position.set(...position);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
  }
  function sphere(name,size,position,material,parent=room,segments=12){
    const mesh=new THREE.Mesh(new THREE.SphereGeometry(size,segments,Math.max(8,segments-2)),material);
    mesh.name=name;mesh.position.set(...position);mesh.castShadow=true;parent.add(mesh);return mesh;
  }

  scene.add(new THREE.HemisphereLight('#d9eaff','#211b2b',1.45));
  const moon=new THREE.DirectionalLight('#bfdfff',1.75);moon.position.set(-4,9,-5);scene.add(moon);
  for(const [x,z,color] of [[-5,-4,'#8ed9ff'],[5,-4,'#b784ea'],[0,5,'#e5a8bf']]){
    const light=new THREE.PointLight(color,16,9,2);light.position.set(x,3,z);scene.add(light);
  }
  const floor=cylinder('silver inlaid observatory floor',9.2,9.2,.28,[0,-.16,0],materials.stone,room,32);
  const innerFloor=cylinder('amethyst floor medallion',6.1,6.1,.035,[0,.005,0],materials.dark,room,32);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(5.8,.06,8,48),materials.silver);ring.rotation.x=Math.PI/2;ring.position.y=.04;room.add(ring);
  const wall=new THREE.Mesh(new THREE.CylinderGeometry(9,9,6,16,1,true),materials.stone);wall.position.y=2.85;wall.name='octagonal limestone observatory walls';room.add(wall);
  const dome=new THREE.Mesh(new THREE.SphereGeometry(8.98,24,12,0,Math.PI*2,0,Math.PI/2),materials.night);dome.position.y=5.8;dome.name='night sky dome';room.add(dome);
  for(let i=0;i<16;i++){
    const a=i*Math.PI/8,x=Math.sin(a)*8.78,z=Math.cos(a)*8.78;
    cylinder('silver wall buttress',.28,.38,6,[x,2.9,z],materials.pale,room,8);
    const pane=new THREE.Mesh(new THREE.PlaneGeometry(1.05,3.1),materials.glass);
    pane.position.set(x*.967,3.35,z*.967);pane.rotation.y=a;room.add(pane);
    const mullion=box('silver window mullion',[.07,3.1,.09],[x*.95,3.35,z*.95],materials.silver);
    mullion.rotation.y=a;
  }
  // The four established house colors remain visible around the observatory.
  for(const banner of [
    {name:'Amethyst House banner',color:materials.amethyst,p:[0,3.7,-8.55],size:[1.35,1.9,.12]},
    {name:'Emberheart House banner',color:materials.ruby,p:[8.55,3.7,0],size:[.12,1.9,1.35]},
    {name:'Frostveil House banner',color:materials.frost,p:[0,3.7,8.55],size:[1.35,1.9,.12]},
    {name:'Silverthorn House banner',color:materials.silverthorn,p:[-8.55,3.7,0],size:[.12,1.9,1.35]}
  ]){const flag=box(banner.name,banner.size,banner.p,banner.color);flag.userData.houseBanner=true;}
  // A clear central lane leaves room to approach the telescope and inspect it.
  cylinder('telescope dais',2.0,2.1,.34,[0,.15,-3.55],materials.amethyst,room,20);
  cylinder('silver telescope pedestal',.6,.85,1.25,[0,.92,-3.55],materials.silver,room,12);
  const tube=cylinder('royal brass telescope tube',.34,.28,2.25,[0,2.05,-3.55],materials.gold,room,16);
  tube.rotation.x=-.54;
  sphere('icy blue telescope lens',.3,[0,2.63,-3.05],materials.glass,room,12);
  for(const x of [-2.4,2.4]){
    const plinth=box('star chart cabinet',[1.6,1.35,.85],[x,.72,2.4],materials.dark);
    box('amethyst cabinet top',[1.85,.12,1.05],[x,1.45,2.4],materials.amethyst);
    for(const dx of [-.38,.38])sphere('silver drawer pull',.055,[x+dx,1.05,1.94],materials.silver,room,8);
  }
  // Constellation points follow the owl's perch, wing, and eye; the puzzle order stays in the existing UI.
  const starPositions=[[-4.2,5.4,-7],[-2.4,5.85,-7.1],[0,6.2,-7.1],[2.5,5.85,-7],[4.2,5.4,-6.8]];
  const stars=[];
  for(const [i,p] of starPositions.entries()){
    const star=sphere('icy constellation star '+(i+1),.095,p,materials.glass,room,8);stars.push(star);
  }
  const linePoints=starPositions.slice(0,4).map(([x,y,z])=>new THREE.Vector3(x,y,z));
  const constellation=new THREE.Line(new THREE.BufferGeometry().setFromPoints(linePoints),new THREE.LineBasicMaterial({color:'#b6eaff',transparent:true,opacity:.56}));room.add(constellation);
  const owl=new THREE.Group();owl.name='blue-eyed snowy owl companion';owl.position.set(-6.2,.95,-2.5);room.add(owl);
  sphere('owl white plumage',.62,[0,.38,0],materials.catWhite,owl,14);
  sphere('owl head',.43,[0,1.05,0],materials.catWhite,owl,14);
  for(const side of [-1,1]){
    sphere('snow owl blue eye',.11,[side*.19,1.12,.34],materials.eye,owl,10);
    sphere('snow owl pupil',.045,[side*.19,1.12,.43],materials.black,owl,8);
    const wing=sphere('owl silver wing',.31,[side*.5,.42,0],materials.pale,owl,10);wing.scale.set(.62,1.25,.65);
  }
  const beak=new THREE.Mesh(new THREE.ConeGeometry(.11,.25,5),materials.gold);beak.position.set(0,.88,.4);beak.rotation.x=Math.PI/2;owl.add(beak);
  cylinder('owl silver perch',.08,.13,2.2,[-6.2,.12,-2.5],materials.silver,room,8);
  // Gizmo stays beside the telescope, modeled with his familiar gray and white markings.
  const gizmo=new THREE.Group();gizmo.name='Gizmo gray and white companion';gizmo.position.set(2.9,.14,4.25);room.add(gizmo);
  const body=sphere('Gizmo gray body',.47,[0,.32,0],materials.catGray,gizmo,12);body.scale.set(1.2,.82,.8);
  sphere('Gizmo white chest',.25,[0,.24,.34],materials.catWhite,gizmo,10);
  sphere('Gizmo head',.32,[0,.72,.12],materials.catGray,gizmo,12);
  for(const side of [-1,1]){
    const ear=new THREE.Mesh(new THREE.ConeGeometry(.14,.31,5),materials.catGray);ear.position.set(side*.2,.99,.1);ear.rotation.z=-side*.28;gizmo.add(ear);
    sphere('Gizmo blue-gray eye',.045,[side*.12,.75,.4],materials.eye,gizmo,8);
    sphere('Gizmo white paw',.14,[side*.23,.12,.14],materials.catWhite,gizmo,8);
  }
  const tail=new THREE.Mesh(new THREE.TorusGeometry(.39,.075,6,14,Math.PI*1.35),materials.catGray);tail.rotation.y=Math.PI/2;tail.position.set(-.45,.55,-.04);gizmo.add(tail);

  let renderer;
  try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'});}
  catch{try{renderer=createCanvasRenderer(THREE);stage.replaceChild(renderer.domElement,canvas);}catch(error){stage.dataset.unavailable='true';status.textContent='The 3D observatory is unavailable here. Your original constellation room remains usable below.';console.warn('Observatory 3D renderer unavailable',error);return;}}
  const renderCanvas=renderer.domElement;
  renderCanvas.id='observatory-3d-canvas';renderCanvas.tabIndex=0;
  renderCanvas.setAttribute('aria-label','Walkable royal observatory. Use W A S D or arrow keys to move, drag to look around, and V to switch between first and third person.');
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.25));
  const perspective=createPerspectiveView(THREE,{scene,camera,canvas:renderCanvas,getPose:()=>player,distance:3.1});
  const dpad=stage.querySelector('.observatory-3d-touch');
  const keys=new Set(),held=new Set();
  let drag=null,last=0,frameHandle=0,renderCount=0;
  const collides=(x,z)=>{
    if(Math.hypot(x,z)>8.15)return true;
    if(Math.hypot(x,z+3.55)<1.48)return true;
    if(Math.abs(x)>1.25&&Math.abs(z-2.4)<.75)return true;
    return false;
  };
  function resize(){
    const r=stage.getBoundingClientRect(),w=Math.max(1,r.width),h=Math.max(260,r.height);
    renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();requestRender();
  }
  function move(dt){
    let f=Number(keys.has('w')||keys.has('arrowup')||held.has('forward'))-Number(keys.has('s')||keys.has('arrowdown')||held.has('back'));
    let side=Number(keys.has('d')||held.has('right'))-Number(keys.has('a')||held.has('left'));
    if(!f&&!side)return;
    const mag=Math.hypot(f,side);f/=mag;side/=mag;
    const speed=3.1*Math.min(dt,.05),fx=-Math.sin(player.yaw),fz=-Math.cos(player.yaw),rx=Math.cos(player.yaw),rz=-Math.sin(player.yaw);
    const nx=player.x+(rx*side+fx*f)*speed,nz=player.z+(rz*side+fz*f)*speed;
    if(!collides(nx,player.z))player.x=nx;
    if(!collides(player.x,nz))player.z=nz;
  }
  function look(){
    const p=renderCanvas.getBoundingClientRect();if(!p.width||!p.height)return;
    perspective.update();
  }
  function inspect(target){
    const telescope=stage.querySelector('#open-telescope');
    const distance=(x,z)=>Math.hypot(player.x-x,player.z-z);
    const nearby=target==='telescope'||(!target&&distance(0,-3.55)<2.7);
    if(target==='gizmo'||(!target&&distance(2.9,4.25)<2.4)){status.textContent='Gizmo gives a familiar purr beside the telescope. The constellation remains yours to discover.';return;}
    if(target==='owl'||(!target&&distance(-6.2,-2.5)<2.5)){status.textContent='The blue-eyed snow owl watches the sky from its silver perch.';return;}
    if(nearby&&telescope&&!telescope.hidden){telescope.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});telescope.focus({preventScroll:true});status.textContent='The telescope is ready. Open it to trace the constellation clue.';return;}
    status.textContent=target==='telescope'||!telescope||telescope.hidden?'Your class is not ready to use the telescope yet. Follow the Academy steps below.':'Move closer to the telescope, Gizmo, or the snow owl to inspect it.';
  }
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
  function pointerClick(e){
    const rect=renderCanvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-((e.clientY-rect.top)/rect.height*2-1));
    look();ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects([room],true).find(h=>h.object.name==='telescope dais'||h.object.parent?.name==='Gizmo gray and white companion'||h.object.parent?.name==='blue-eyed snowy owl companion');
    if(hit){const name=hit.object.name==='telescope dais'?'telescope':hit.object.parent.name.includes('Gizmo')?'gizmo':'owl';inspect(name);}
  }
  renderCanvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,moved:false};renderCanvas.setPointerCapture(e.pointerId);requestRender();});
  renderCanvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;if(Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)>6)drag.moved=true;player.yaw-=(e.clientX-drag.x)*.004;player.pitch=Math.max(-.48,Math.min(.48,player.pitch-(e.clientY-drag.y)*.003));drag.x=e.clientX;drag.y=e.clientY;requestRender();});
  renderCanvas.addEventListener('pointerup',e=>{if(!drag||drag.id!==e.pointerId)return;const clicked=!drag.moved;drag=null;if(clicked)pointerClick(e);requestRender();});
  renderCanvas.addEventListener('pointercancel',()=>drag=null);
  renderCanvas.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown'].includes(k)){e.preventDefault();keys.add(k);requestRender();}if(k==='e'){e.preventDefault();inspect();}});
  renderCanvas.addEventListener('keyup',e=>{keys.delete(e.key.toLowerCase());requestRender();});
  window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(e.target.closest('button,a,input,select,textarea'))return;if(['w','a','s','d','arrowup','arrowdown'].includes(k)){e.preventDefault();keys.add(k);requestRender();}if(k==='e')inspect();if(k==='v')requestRender();});
  window.addEventListener('keyup',e=>{keys.delete(e.key.toLowerCase());requestRender();});
  window.addEventListener('blur',()=>{keys.clear();held.clear();});
  for(const b of dpad.querySelectorAll('[data-walk]')){
    b.addEventListener('pointerdown',e=>{e.preventDefault();held.add(b.dataset.walk);b.setPointerCapture(e.pointerId);requestRender();});
    for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>{held.delete(b.dataset.walk);requestRender();});
  }
  for(const b of dpad.querySelectorAll('[data-turn]')){
    b.addEventListener('pointerdown',e=>{e.preventDefault();player.yaw+=Number(b.dataset.turn);b.setPointerCapture(e.pointerId);requestRender();});
  }
  const qualityLevels={high:1.5,balanced:1,performance:.72};
  function setQuality(value,save=true){
    const quality=Object.hasOwn(qualityLevels,value)?value:'high';
    if(qualitySelect)qualitySelect.value=quality;
    const ratio=Math.min(window.devicePixelRatio||1,qualityLevels[quality]);
    renderer.setPixelRatio(ratio);
    if(save){try{localStorage.setItem(qualityKey,quality);}catch{status.textContent='Graphics changed for this visit; browser storage is unavailable.';}}
    resize();requestRender();
  }
  let savedQuality='high';try{const value=localStorage.getItem(qualityKey);if(Object.hasOwn(qualityLevels,value))savedQuality=value;}catch{}
  if(qualitySelect){qualitySelect.value=savedQuality;qualitySelect.addEventListener('change',()=>setQuality(qualitySelect.value));}
  setQuality(savedQuality,false);
  if(!('ontouchstart' in window))stage.querySelector('.observatory-3d-touch').setAttribute('aria-label','Movement controls; also playable with WASD, arrow keys, mouse drag, or touch.');
  const perspectiveToggle=document.querySelector('[data-perspective-toggle]');
  if(perspectiveToggle){const perspectiveObserver=new MutationObserver(requestRender);perspectiveObserver.observe(perspectiveToggle,{attributes:true,attributeFilter:['aria-pressed']});}
  document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();held.clear();last=0;}else requestRender();});
  const ro=new ResizeObserver(resize);ro.observe(stage);resize();
  // This scene is static between player inputs. Keep requestAnimationFrame active
  // only while walking; an idle observatory should not redraw or burn mobile GPU.
  function frame(now){frameHandle=0;if(document.hidden){last=0;return;}const dt=last?Math.min(.05,Math.max(0,(now-last)/1000)):0;last=now;move(dt);look();renderer.render(scene,camera);renderCount++;if(keys.size||held.size)frameHandle=requestAnimationFrame(frame);else last=0;}
  function requestRender(){if(!frameHandle&&!document.hidden)frameHandle=requestAnimationFrame(frame);}
  requestRender();
  window.academyObservatory3D=Object.freeze({diagnostics:()=>({ready:true,perspective:perspective.mode,position:{x:player.x,z:player.z},yaw:player.yaw,draws:renderer.info?.render?.calls??null,renderCount,canvas:{width:renderCanvas.width,height:renderCanvas.height},compatibility:Boolean(renderer.isCompatibility),actualWebGL:Boolean(renderer.isWebGLRenderer),renderer:renderCanvas.dataset.renderer||'webgl',quality:qualitySelect?.value||'high',bannerCount:room.children.filter(o=>o.userData.houseBanner).length}),inspect});
  status.textContent='Walkable Owl Observatory · WASD or arrows to move · drag to look · E to approach the telescope.';
})();

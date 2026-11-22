import * as THREE from './vault-three.module.js?v=academy-discovery-3d';
import {createCanvasRenderer} from './vault-canvas.js?v=academy-discovery-3d';
import {createRoyalRoomKit} from './academy-3d-architecture.js?v=academy-discovery-3d';
import {createPerspectiveView} from './vault-perspective.js?v=phase7-perspective';

(()=>{
 'use strict';
 const kind=document.body.dataset.discoveryRoom,configs={
  wing:{title:'Enchanted East Wing',bg:'#171126',floor:'#51465d',wall:'#5f526e',trim:'#d8c9e5',glass:'#77c9ef',accent:'#8760a3'},
  library:{title:'Enchanted Library',bg:'#171126',floor:'#46324e',wall:'#493452',trim:'#cbb5dc',glass:'#75c9ed',accent:'#a474b7'}
 },c=configs[kind],main=document.querySelector('main'),header=main?.querySelector('header');
 if(!c||!main||!header)return;
 const stage=document.createElement('section');stage.className='academy-discovery-stage';stage.setAttribute('aria-label',`Walkable ${c.title}`);
 stage.innerHTML=`<canvas class="academy-discovery-canvas" tabindex="0" aria-label="Walk around the ${c.title}. Use W A S D or arrow keys to move, drag or touch to look, V to change perspective, and E to inspect objects."></canvas><p class="academy-discovery-status" role="status" aria-live="polite">Preparing ${c.title}…</p><div class="academy-discovery-quality"><label>Graphics<select aria-label="${c.title} graphics quality"><option value="high">High</option><option value="balanced">Balanced</option><option value="performance">Performance</option></select></label></div><div class="academy-discovery-controls" aria-label="Touch movement controls"><div class="academy-discovery-dpad"><button type="button" data-move="forward" aria-label="Walk forward">↑</button><button type="button" data-move="left" aria-label="Walk left">←</button><button type="button" data-move="back" aria-label="Walk backward">↓</button><button type="button" data-move="right" aria-label="Walk right">→</button></div><button type="button" data-inspect>Inspect</button></div>`;
 header.after(stage);
 const canvas=stage.querySelector('canvas'),status=stage.querySelector('[role=status]'),quality=stage.querySelector('select');
 const scene=new THREE.Scene();scene.background=new THREE.Color(c.bg);scene.fog=new THREE.Fog(c.bg,18,38);
 const camera=new THREE.PerspectiveCamera(68,1,.08,60),player={x:0,z:6.8,yaw:0,pitch:0},room=new THREE.Group();scene.add(room);
 const kit=createRoyalRoomKit(THREE,room),mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,...extra});
 const stone=mat(c.wall,{roughness:.94}),floor=mat(c.floor,{roughness:.86}),silver=mat(c.trim,{metalness:.55,roughness:.34}),glass=mat(c.glass,{emissive:c.glass,emissiveIntensity:.22,roughness:.22,side:THREE.DoubleSide}),wood=mat('#49323a'),plum=mat(c.accent),bookA=mat('#74435e'),bookB=mat('#45617c'),paper=mat('#e3d6c1');
 const box=(name,size,pos,material,parent=room)=>kit.box({name,size,position:pos,material,parent}),ball=(name,r,pos,material,parent=room)=>kit.sphere({name,size:[r,r,r],position:pos,material,parent}),targets=[];
 const target=(mesh,id)=>{mesh.userData.discovery=id;targets.push(mesh);return mesh;};
 scene.add(new THREE.HemisphereLight('#dbeaff','#2e2037',1.6));const sun=new THREE.DirectionalLight('#d6e9ff',1.8);sun.position.set(-5,9,-5);scene.add(sun);
 for(const [x,z]of[[-5,-4],[5,-4],[0,5]]){const l=new THREE.PointLight(c.glass,13,10,2);l.position.set(x,3,z);scene.add(l);}
 box('polished limestone floor',[17,.28,19],[0,-.16,0],floor);box('rear stone wall',[17,8,.55],[0,3.7,-9.55],stone);box('west stone wall',[.55,8,19],[-8.55,3.7,0],stone);box('east stone wall',[.55,8,19],[8.55,3.7,0],stone);
 for(let i=0;i<7;i++){const x=-6+i*2;box('silver vaulted ceiling rib',[.14,6.5,.18],[x,5.65,-8.95],silver);box('icy stained glass window',[1.05,3.35,.06],[x,3.55,-9.23],glass);box('window silver mullion',[.07,3.6,.11],[x,3.55,-9.14],silver);}
 if(kind==='wing'){
  for(const [id,x,color,label]of[['library',-4,'#74435e','Enchanted Library'],['observatory',0,c.glass,'Owl Observatory'],['chamber',4,'#963b51','Royal Heart Chamber']]){box('carved silver doorway',[3.05,5.8,.3],[x,2.9,-8.8],silver);const face=box(`${label} door`,[2.45,5.1,.2],[x,2.55,-8.55],mat(color));target(face,id);ball(`${label} amethyst crest`,.26,[x,4.35,-8.39],plum);}
  for(const x of [-7,-3,1,5,7]){box('carved arcade column',[.42,5.9,.46],[x,2.95,1.2],silver);ball('amethyst column capital',.28,[x,6,1.2],plum);}
  const owl=target(ball('snow owl head',.43,[-6,2,-3],paper),'owl');ball('snow owl body',.62,[-6,1.3,-3],paper);ball('snow owl jewel',.08,[-6,2,-2.58],plum,owl);
  for(const [x,color]of[[-6,'#74489a'],[6,'#377da3']]){box('house flagpole',[.08,3.2,.08],[x,4.25,3],silver);box('velvet house banner',[1.45,1.45,.08],[x-.55,4.45,3],mat(color));}
 }else{
  for(const x of[-7.5,7.5]){box('towering oak bookcase',[1.65,6.2,13],[x,3,-1],wood);for(let level=0;level<5;level++){box('silver library shelf',[1.85,.14,12.5],[x,1+level*1.15,-1],silver);for(let n=0;n<12;n++)box('colorful storybook',[.32,.82,.42],[x,1.52+level*1.15,-6.4+n*1.02],n%2?bookA:bookB);}}
  box('oak storyteller desk',[4,.25,2],[0,1.05,-3.2],wood);for(const x of[-1.7,1.7])box('desk carved leg',[.22,1,.22],[x,.5,-3.2],silver);
  target(box('silver-bound storybook',[.8,.18,.95],[-.8,1.27,-3.35],paper),'book');target(ball('amethyst lamp crystal',.25,[.9,1.62,-3.2],glass),'lamp');target(box('amethyst lamp base',[.6,.14,.42],[.9,1.25,-3.2],plum),'lamp');target(box('desk writing surface',[3.4,.08,1.7],[0,1.22,-3.2],wood),'desk');
 }
 let renderer;try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'});}catch{try{renderer=createCanvasRenderer(THREE);stage.replaceChild(renderer.domElement,canvas);}catch(error){stage.dataset.unavailable='true';status.textContent='This browser cannot draw the walkable room. The stories and navigation remain available below.';console.warn('Discovery room renderer unavailable',error);return;}}
 const viewCanvas=renderer.domElement;viewCanvas.className='academy-discovery-canvas';viewCanvas.tabIndex=0;viewCanvas.setAttribute('aria-label',canvas.getAttribute('aria-label'));
 const perspective=createPerspectiveView(THREE,{scene,camera,canvas:viewCanvas,getPose:()=>player,distance:3.2}),held=new Set(),keys=new Set();let drag=null,last=0,raf=0,renders=0;
 const collision=(x,z)=>Math.abs(x)>7.9||z < -8.95||z>8.7||(kind==='library'&&Math.abs(x)>6.15&&Math.abs(z)<5.3);
 function redraw(){if(!raf&&!document.hidden)raf=requestAnimationFrame(frame);}function resize(){const r=stage.getBoundingClientRect(),w=Math.max(1,r.width),h=Math.max(260,r.height);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();redraw();}
 function step(f,s,d){if(!f&&!s)return;const m=Math.hypot(f,s);f/=m;s/=m;const fx=-Math.sin(player.yaw),fz=-Math.cos(player.yaw),rx=Math.cos(player.yaw),rz=-Math.sin(player.yaw),nx=player.x+(rx*s+fx*f)*d,nz=player.z+(rz*s+fz*f)*d;if(!collision(nx,player.z))player.x=nx;if(!collision(player.x,nz))player.z=nz;}
 function move(dt){step(Number(keys.has('w')||keys.has('arrowup')||held.has('forward'))-Number(keys.has('s')||keys.has('arrowdown')||held.has('back')),Number(keys.has('d')||held.has('right'))-Number(keys.has('a')||held.has('left')),3.1*Math.min(dt,.05));}
 function discover(id){if(kind==='wing'){document.querySelector(`[data-room="${id}"]`)?.click();status.textContent=`${id==='library'?'The Enchanted Library':id==='observatory'?'The Owl Observatory':'The Royal Heart Chamber'} discovery opened below.`;}else{document.querySelector(`[data-object="${id}"]`)?.click();status.textContent=`${id==='book'?'The Silver-Bound Book':id==='lamp'?'The Amethyst Lamp':'The Storyteller’s Desk'} story opened below.`;}}
 const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();function inspectAt(x,y){const r=viewCanvas.getBoundingClientRect();ndc.set((x-r.left)/r.width*2-1,-((y-r.top)/r.height*2-1));perspective.update();ray.setFromCamera(ndc,camera);const hit=ray.intersectObjects(targets,false)[0];if(hit&&hit.distance<9)discover(hit.object.userData.discovery);}
 viewCanvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,moved:false};viewCanvas.setPointerCapture(e.pointerId);redraw();});
 viewCanvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;if(Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)>6)drag.moved=true;player.yaw-=(e.clientX-drag.x)*.004;player.pitch=Math.max(-.48,Math.min(.48,player.pitch-(e.clientY-drag.y)*.003));drag.x=e.clientX;drag.y=e.clientY;redraw();});
 viewCanvas.addEventListener('pointerup',e=>{if(!drag||drag.id!==e.pointerId)return;const click=!drag.moved;drag=null;if(click)inspectAt(e.clientX,e.clientY);redraw();});viewCanvas.addEventListener('pointercancel',()=>drag=null);
 const key=e=>e.key.toLowerCase(),movement=['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'];
 function inspectCenter(){const r=stage.getBoundingClientRect();inspectAt(r.left+r.width/2,r.top+r.height/2);}
 function down(e){const k=key(e);if(e.target?.closest?.('button,a,input,select,textarea'))return;if(movement.includes(k)){e.preventDefault();keys.add(k);redraw();}if(k==='e'){e.preventDefault();inspectCenter();}}
 function up(e){keys.delete(key(e));redraw();}window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',()=>{keys.clear();held.clear();redraw();});
 for(const b of stage.querySelectorAll('[data-move]')){const pointers=new Map();b.addEventListener('pointerdown',e=>{e.preventDefault();pointers.set(e.pointerId,performance.now());held.add(b.dataset.move);b.setPointerCapture(e.pointerId);redraw();});for(const type of['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,e=>{const started=pointers.get(e.pointerId);pointers.delete(e.pointerId);if(!pointers.size){held.delete(b.dataset.move);if(type==='pointerup'&&started!==undefined&&performance.now()-started<180){const v={forward:[1,0],back:[-1,0],left:[0,-1],right:[0,1]}[b.dataset.move];step(v[0],v[1],.16);}}redraw();});}
 stage.querySelector('[data-inspect]').addEventListener('click',inspectCenter);
 const levels={high:1.5,balanced:1,performance:.72};let saved='high';try{const q=localStorage.getItem('bre-poetry-vault-heart-graphics-v1');if(Object.hasOwn(levels,q))saved=q;}catch{}
 function setQuality(q,save=true){q=Object.hasOwn(levels,q)?q:'high';quality.value=q;renderer.setPixelRatio(Math.min(devicePixelRatio||1,levels[q]));if(save)try{localStorage.setItem('bre-poetry-vault-heart-graphics-v1',q);}catch{}resize();}quality.addEventListener('change',()=>setQuality(quality.value));
 const toggle=document.querySelector('[data-perspective-toggle]');if(toggle)new MutationObserver(redraw).observe(toggle,{attributes:true,attributeFilter:['aria-pressed']});document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();held.clear();last=0;}else redraw();});new ResizeObserver(resize).observe(stage);setQuality(saved,false);
 function frame(now){raf=0;if(document.hidden){last=0;return;}const dt=last?Math.min(.05,(now-last)/1000):0;last=now;move(dt);perspective.update();renderer.render(scene,camera);renders++;if(keys.size||held.size)raf=requestAnimationFrame(frame);else last=0;}
 let geometryCount=0;const geometry=new Set();scene.traverse(o=>{if(o.geometry)geometry.add(o.geometry);});geometryCount=geometry.size;redraw();status.textContent=`Walkable ${c.title} · WASD or arrows move · drag or touch to look · V changes view · E inspects.`;
 window.academyDiscoveryRoom3D=Object.freeze({diagnostics:()=>({ready:true,kind,perspective:perspective.mode,position:{x:player.x,z:player.z},geometryCount,interactableCount:targets.length,renderer:viewCanvas.dataset.renderer||'webgl',actualWebGL:Boolean(renderer.isWebGLRenderer),quality:quality.value,renderCount:renders}),inspect:discover});
})();

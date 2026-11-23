import * as THREE from './vault-three.module.js';
import {createPerspectiveView} from './vault-perspective.js?v=phase7-perspective';
// Time-based movement with buffered taps and short collision steps. Rendering
// speed never shortens a held input. No teleporting after tab/background pauses.
export function advancePosition(position,yaw,forward,side,seconds,movable){
 const magnitude=Math.hypot(forward,side)||1,dx=(-Math.sin(yaw)*forward+Math.cos(yaw)*side)/magnitude*seconds*2.05,dz=(-Math.cos(yaw)*forward-Math.sin(yaw)*side)/magnitude*seconds*2.05;
 const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.045));let walked=0;
 for(let i=0;i<steps;i++){const x=position.x,z=position.z;if(movable(position.x+dx/steps,position.z))position.x+=dx/steps;if(movable(position.x,position.z+dz/steps))position.z+=dz/steps;walked+=Math.hypot(position.x-x,position.z-z);}return walked;
}
export function createRoomMotion({canvas,camera,scene=camera.parent,container,movable,interactables,map,onTarget,onInspect,clearSight=()=>true,onStep=()=>{}}){
 let active=false,paused=true,yaw=0,pitch=-.025,last=performance.now(),lastTarget=-Infinity,targetId=null,drag=null,stepDistance=0;
 const player=new THREE.Vector3(camera.position.x,0,camera.position.z);
 const perspective=createPerspectiveView(THREE,{scene,camera,canvas,getPose:()=>({x:player.x,z:player.z,yaw,pitch})});
 const held=new Set(),taps=new Map(),movementPointers=new Set(),ray=new THREE.Raycaster(),center=new THREE.Vector2(),pointerNdc=new THREE.Vector2(),targetHits=[];
 const instructions={KeyW:'forward',ArrowUp:'forward',KeyS:'back',ArrowDown:'back',KeyA:'left',KeyD:'right',ArrowLeft:'turnLeft',ArrowRight:'turnRight'};
 function release(){held.clear();taps.clear();for(const pointers of movementPointers)pointers.clear();drag=null;last=performance.now();}
 function press(id){if(!active||paused||!id)return;held.add(id);taps.set(id,Math.max(taps.get(id)||0,.11));}
 function canReach(id){const object=id&&map.get(id);return !!(object&&Math.hypot(player.x-object.position.x,player.z-object.position.z)<3.4);}
 function canInspectTarget(id){const object=id&&map.get(id);return !!(active&&!paused&&!document.hidden&&object?.visible&&canReach(id)&&clearSight(id));}
 window.addEventListener('keydown',e=>{canvas.dataset.lastInput=e.code;if(!active||paused||e.target.closest('dialog,input,select,textarea,button,a'))return;const id=instructions[e.code];if(id){e.preventDefault();if(!e.repeat)press(id);}if(e.code==='KeyE'&&canInspectTarget(targetId)){e.preventDefault();onInspect(targetId);}});
 window.addEventListener('keyup',e=>held.delete(instructions[e.code]));window.addEventListener('blur',release);window.addEventListener('pagehide',release);document.addEventListener('visibilitychange',release);
 canvas.style.touchAction='none';
 canvas.addEventListener('pointerdown',e=>{if(!active||paused||drag)return;if(e.pointerType==='mouse'&&e.button!==0)return;canvas.focus({preventScroll:true});drag={id:e.pointerId,x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,moved:false};canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId||paused)return;if(Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)>=7)drag.moved=true;yaw-=(e.clientX-drag.x)*.0035;pitch=Math.max(-.85,Math.min(.85,pitch-(e.clientY-drag.y)*.0027));drag.x=e.clientX;drag.y=e.clientY;});
 canvas.addEventListener('pointerup',e=>{if(!drag||drag.id!==e.pointerId)return;const click=!paused&&active&&!document.hidden&&!drag.moved&&Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)<7;drag=null;if(click){const r=canvas.getBoundingClientRect();if(!r.width||!r.height||e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)return;pointerNdc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);perspective.update();ray.setFromCamera(pointerNdc,camera);targetHits.length=0;ray.intersectObjects(interactables,false,targetHits);const hit=targetHits[0],id=hit?.object.userData.id;if(hit&&canReach(id)&&map.get(id)?.visible&&clearSight(id))onInspect(id);}});
 canvas.addEventListener('pointercancel',e=>{if(drag?.id===e.pointerId)drag=null;});
 canvas.addEventListener('lostpointercapture',e=>{if(drag?.id===e.pointerId)drag=null;});
 document.querySelectorAll('[data-move]').forEach(b=>{const pointers=new Set();movementPointers.add(pointers);b.style.touchAction='none';b.addEventListener('pointerdown',e=>{if(!active||paused)return;e.preventDefault();pointers.add(e.pointerId);press(b.dataset.move);b.setPointerCapture(e.pointerId);});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,e=>{pointers.delete(e.pointerId);if(!pointers.size)held.delete(b.dataset.move);});b.addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();press(b.dataset.move);}});b.addEventListener('keyup',()=>{if(!pointers.size)held.delete(b.dataset.move);});window.addEventListener('blur',()=>pointers.clear());document.addEventListener('visibilitychange',()=>{if(document.hidden)pointers.clear();});});
 function tick(now){let dt=Math.min(.2,Math.max(0,(now-last)/1000));last=now;if(!active||paused||document.hidden){dt=0;}else{
  const duration=k=>held.has(k)?dt:Math.min(dt,taps.get(k)||0);const f=duration('forward')-duration('back'),s=duration('right')-duration('left');yaw+=(duration('turnLeft')-duration('turnRight'))*1.4;
  if(f||s){const durationMax=Math.max(Math.abs(f),Math.abs(s)),walked=advancePosition(player,yaw,f/durationMax,s/durationMax,durationMax,movable);stepDistance+=walked;if(stepDistance>.8){stepDistance%=.8;onStep();}}
  for(const [k,v]of taps)taps.set(k,Math.max(0,v-dt));
 }
 perspective.update();
 const positionData=JSON.stringify([player.x,player.z]),pausedData=String(paused),yawData=String(yaw);if(canvas.dataset.cameraPosition!==positionData)canvas.dataset.cameraPosition=positionData;if(canvas.dataset.paused!==pausedData)canvas.dataset.paused=pausedData;if(canvas.dataset.yaw!==yawData)canvas.dataset.yaw=yawData;
  if(active&&!paused&&!document.hidden&&now-lastTarget>90){lastTarget=now;if(targetId&&!map.get(targetId)?.visible){targetId=null;onTarget(null);}ray.setFromCamera(center,camera);targetHits.length=0;ray.intersectObjects(interactables,false,targetHits);const hit=targetHits[0];let current=hit&&canReach(hit.object.userData.id)&&map.get(hit.object.userData.id)?.visible&&clearSight(hit.object.userData.id)?hit.object.userData.id:null;
  if(!current){let best=2.1;for(const [id,g]of map){if(!g.visible)continue;const d=Math.hypot(player.x-g.position.x,player.z-g.position.z);if(d<best&&clearSight(id)){current=id;best=d;}}}if(current!==targetId){targetId=current;onTarget(current);}
 }return dt;
 }
 return{tick,start(){active=true;paused=false;release();perspective.update();canvas.focus({preventScroll:true});},pause(value){paused=value;release();if(value){targetId=null;onTarget(null);}else canvas.focus({preventScroll:true});},inspect(){if(canInspectTarget(targetId))onInspect(targetId);},getPosition(){return{x:player.x,z:player.z};},get perspective(){return perspective.mode;},setPerspective(mode){perspective.setMode(mode);},get paused(){return paused;}};
}

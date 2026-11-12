import * as THREE from './vault-three.module.js';
// Time-based movement with buffered taps and short collision steps. Rendering
// speed never shortens a held input. No teleporting after tab/background pauses.
export function advancePosition(position,yaw,forward,side,seconds,movable){
 const magnitude=Math.hypot(forward,side)||1,dx=(-Math.sin(yaw)*forward+Math.cos(yaw)*side)/magnitude*seconds*2.05,dz=(-Math.cos(yaw)*forward-Math.sin(yaw)*side)/magnitude*seconds*2.05;
 const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.045));let walked=0;
 for(let i=0;i<steps;i++){const x=position.x,z=position.z;if(movable(position.x+dx/steps,position.z))position.x+=dx/steps;if(movable(position.x,position.z+dz/steps))position.z+=dz/steps;walked+=Math.hypot(position.x-x,position.z-z);}return walked;
}
export function createRoomMotion({canvas,camera,container,movable,interactables,map,onTarget,onInspect,clearSight=()=>true,onStep=()=>{}}){
 let active=false,paused=true,yaw=0,pitch=-.025,last=performance.now(),lastTarget=-Infinity,targetId=null,drag=null,stepDistance=0;
 const held=new Set(),taps=new Map(),ray=new THREE.Raycaster(),center=new THREE.Vector2();
 const instructions={KeyW:'forward',ArrowUp:'forward',KeyS:'back',ArrowDown:'back',KeyA:'left',KeyD:'right',ArrowLeft:'turnLeft',ArrowRight:'turnRight'};
 function release(){held.clear();taps.clear();drag=null;last=performance.now();}
 function press(id){if(!active||paused||!id)return;held.add(id);taps.set(id,Math.max(taps.get(id)||0,.11));}
 window.addEventListener('keydown',e=>{canvas.dataset.lastInput=e.code;if(!active||paused||e.target.closest('dialog,input,select,textarea,button,a'))return;const id=instructions[e.code];if(id){e.preventDefault();if(!e.repeat)press(id);}if(e.code==='KeyE'&&targetId){e.preventDefault();onInspect(targetId);}});
 window.addEventListener('keyup',e=>held.delete(instructions[e.code]));window.addEventListener('blur',release);document.addEventListener('visibilitychange',release);
 canvas.addEventListener('pointerdown',e=>{if(!active||paused)return;canvas.focus({preventScroll:true});drag={id:e.pointerId,x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY};canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId||paused)return;yaw-=(e.clientX-drag.x)*.0035;pitch=Math.max(-.85,Math.min(.85,pitch-(e.clientY-drag.y)*.0027));drag.x=e.clientX;drag.y=e.clientY;});
 canvas.addEventListener('pointerup',e=>{if(!drag||drag.id!==e.pointerId)return;const click=Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)<7;drag=null;if(click){const r=canvas.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);const hit=ray.intersectObjects(interactables)[0];if(hit&&hit.distance<3.4&&clearSight(hit.object.userData.id))onInspect(hit.object.userData.id);}});canvas.addEventListener('pointercancel',()=>drag=null);
 document.querySelectorAll('[data-move]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();press(b.dataset.move);b.setPointerCapture(e.pointerId);});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>held.delete(b.dataset.move));b.addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();press(b.dataset.move);}});b.addEventListener('keyup',()=>held.delete(b.dataset.move));});
 function tick(now){let dt=Math.min(.2,Math.max(0,(now-last)/1000));last=now;if(!active||paused||document.hidden){dt=0;}else{
  const duration=k=>held.has(k)?dt:Math.min(dt,taps.get(k)||0);const f=duration('forward')-duration('back'),s=duration('right')-duration('left');yaw+=(duration('turnLeft')-duration('turnRight'))*1.4;
  if(f||s){const durationMax=Math.max(Math.abs(f),Math.abs(s)),walked=advancePosition(camera.position,yaw,f/durationMax,s/durationMax,durationMax,movable);stepDistance+=walked;if(stepDistance>.8){stepDistance%=.8;onStep();}}
  for(const [k,v]of taps)taps.set(k,Math.max(0,v-dt));
 }
 camera.rotation.order='YXZ';camera.rotation.set(pitch,yaw,0);camera.position.y=1.67;camera.updateMatrixWorld();
 canvas.dataset.cameraPosition=JSON.stringify([camera.position.x,camera.position.z]);canvas.dataset.paused=String(paused);canvas.dataset.yaw=String(yaw);
 if(active&&!paused&&now-lastTarget>90){lastTarget=now;ray.setFromCamera(center,camera);const hit=ray.intersectObjects(interactables)[0];let current=hit&&hit.distance<3.4&&clearSight(hit.object.userData.id)?hit.object.userData.id:null;
  if(!current){let best=2.1;for(const [id,g]of map){if(!g.visible)continue;const d=camera.position.distanceTo(g.position);if(d<best&&clearSight(id)){current=id;best=d;}}}if(current!==targetId){targetId=current;onTarget(current);}
 }return dt;
 }
 return{tick,start(){active=true;paused=false;release();canvas.focus({preventScroll:true});},pause(value){paused=value;release();if(value){targetId=null;onTarget(null);}else canvas.focus({preventScroll:true});},inspect(){if(targetId&&!paused)onInspect(targetId);},getPosition(){return{x:camera.position.x,z:camera.position.z};},get paused(){return paused;}};
}

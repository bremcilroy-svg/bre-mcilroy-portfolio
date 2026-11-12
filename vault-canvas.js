// Canvas compatibility renderer for browsers without WebGL. Uses the same room,
// camera, collision geometry, raycasting, and first-person controls as the GPU view.
export function createCanvasRenderer(THREE){
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{alpha:false});
 if(!ctx)throw new Error('No canvas renderer is available.');
 let width=1,height=1,lastRender=0,compiled=null,previousView='',lastStatic=0;
 const projection=new THREE.Matrix4(),cameraPosition=new THREE.Vector3();
 const textureCache=new Map();
 function texturePattern(texture){if(!texture?.image)return null;if(textureCache.has(texture))return textureCache.get(texture);try{const pattern=ctx.createPattern(texture.image,'repeat');textureCache.set(texture,pattern);return pattern;}catch{return null;}}
 function compile(scene){scene.updateMatrixWorld(true);const faces=[];
  function addFace(base,vertices,uv,depth=0){
    const edges=vertices.map((a,i)=>{const b=vertices[(i+1)%3];return Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);});
    const a=vertices[0],b=vertices[1],c=vertices[2],ux=b.x-a.x,uy=b.y-a.y,uz=b.z-a.z,vx=c.x-a.x,vy=c.y-a.y,vz=c.z-a.z;
    const area=Math.hypot(uy*vz-uz*vy,uz*vx-ux*vz,ux*vy-uy*vx)/2;
    if(area>.65&&Math.max(...edges)>1.5&&depth<4){const mid=vertices.map((a,i)=>{const b=vertices[(i+1)%3];return{x:(a.x+b.x)/2,y:(a.y+b.y)/2,z:(a.z+b.z)/2};});const um=uv?.map((a,i)=>{const b=uv[(i+1)%3];return{x:(a.x+b.x)/2,y:(a.y+b.y)/2};});
      for(const tri of [[0,3,5],[3,1,4],[5,4,2],[3,4,5]]){const vs=[...vertices,...mid],us=uv?[...uv,...um]:null;addFace(base,tri.map(i=>vs[i]),us?tri.map(i=>us[i]):null,depth+1);}return;
    }
    const center=vertices.reduce((r,v)=>({x:r.x+v.x/3,y:r.y+v.y/3,z:r.z+v.z/3}),{x:0,y:0,z:0});faces.push({...base,vertices,uv,center});
  }
  scene.traverse(mesh=>{
   if(!mesh.isMesh||!mesh.visible||mesh.material.visible===false)return;
   const geo=mesh.geometry,pos=geo.attributes.position,norm=geo.attributes.normal,uv=geo.attributes.uv,idx=geo.index;
   const getIndex=i=>idx?idx.getX(i):i;const total=idx?idx.count:pos.count;
   const point=new THREE.Vector3(),normalMatrix=new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
   for(let i=0;i<total;i+=3){let material=mesh.material;if(Array.isArray(material)){const group=geo.groups.find(g=>i>=g.start&&i<g.start+g.count);material=material[group?.materialIndex||0];}if(!material||material.visible===false)continue;
    const ids=[getIndex(i),getIndex(i+1),getIndex(i+2)];const vertices=ids.map(n=>{point.fromBufferAttribute(pos,n).applyMatrix4(mesh.matrixWorld);return{x:point.x,y:point.y,z:point.z};});
    const n=new THREE.Vector3().fromBufferAttribute(norm,ids[0]).applyMatrix3(normalMatrix).normalize();
    const center=vertices.reduce((r,v)=>({x:r.x+v.x/3,y:r.y+v.y/3,z:r.z+v.z/3}),{x:0,y:0,z:0});
    addFace({mesh,normal:n,material},vertices,uv?ids.map(id=>({x:uv.getX(id),y:uv.getY(id)})):null);
   }
 });return faces;}
 function drawTexture(face,p){const tex=face.material.map,pattern=texturePattern(tex);if(!pattern||!face.uv)return;
   const tw=tex.image.width,th=tex.image.height;
   const q=face.uv.map(v=>({x:v.x*tw*tex.repeat.x,y:(1-v.y)*th*tex.repeat.y}));
   const [a,b,c]=q,[A,B,C]=p;const det=a.x*(b.y-c.y)+b.x*(c.y-a.y)+c.x*(a.y-b.y);if(Math.abs(det)<.001)return;
   const tx=(A.x*(b.y-c.y)+B.x*(c.y-a.y)+C.x*(a.y-b.y))/det;
   const ty=(A.y*(b.y-c.y)+B.y*(c.y-a.y)+C.y*(a.y-b.y))/det;
   const ux=(A.x*(c.x-b.x)+B.x*(a.x-c.x)+C.x*(b.x-a.x))/det;
   const uy=(A.y*(c.x-b.x)+B.y*(a.x-c.x)+C.y*(b.x-a.x))/det;
   const vx=(A.x*(b.x*c.y-c.x*b.y)+B.x*(c.x*a.y-a.x*c.y)+C.x*(a.x*b.y-b.x*a.y))/det;
   const vy=(A.y*(b.x*c.y-c.x*b.y)+B.y*(c.x*a.y-a.x*c.y)+C.y*(a.x*b.y-b.x*a.y))/det;
   ctx.save();ctx.clip();ctx.transform(tx,ty,ux,uy,vx,vy);ctx.fillStyle=pattern;ctx.fillRect(-tw*8,-th*8,tw*20,th*20);ctx.restore();
 }
 function render(scene,camera){const now=performance.now();if(now-lastRender<80)return;camera.updateMatrixWorld();const sig=camera.matrixWorld.elements.map(v=>v.toFixed(3)).join(',');if(compiled&&sig===previousView&&now-lastStatic<700)return;previousView=sig;lastRender=now;lastStatic=now;
  if(!compiled)compiled=compile(scene);projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);camera.getWorldPosition(cameraPosition);
  ctx.fillStyle='#24171d';ctx.fillRect(0,0,width,height);const visible=[];
  for(const face of compiled){let hidden=false;for(let ancestor=face.mesh;ancestor;ancestor=ancestor.parent){if(!ancestor.visible){hidden=true;break;}}if(hidden)continue;
   const dx=cameraPosition.x-face.center.x,dy=cameraPosition.y-face.center.y,dz=cameraPosition.z-face.center.z;
   if(face.normal.x*dx+face.normal.y*dy+face.normal.z*dz<=0&&face.material.side!==THREE.DoubleSide)continue;
   let poly=face.vertices.map((v,i)=>{const p=new THREE.Vector4(v.x,v.y,v.z,1).applyMatrix4(projection);return {x:p.x,y:p.y,z:p.z,w:p.w,u:face.uv?.[i].x||0,v:face.uv?.[i].y||0};});
   // Clip triangles through the near plane, so floors and walls stay continuous.
   const output=[];for(let j=0;j<poly.length;j++){const a=poly[j],b=poly[(j+1)%poly.length],insideA=a.w>=.09,insideB=b.w>=.09;if(insideA)output.push(a);if(insideA!==insideB){const t=(.09-a.w)/(b.w-a.w),v={};for(const key of ['x','y','z','w','u','v'])v[key]=a[key]+(b[key]-a[key])*t;output.push(v);}}poly=output;if(poly.length<3)continue;
   for(let j=1;j<poly.length-1;j++){const tri=[poly[0],poly[j],poly[j+1]];const ps=tri.map(p=>({x:(p.x/p.w*.5+.5)*width,y:(-.5*p.y/p.w+.5)*height,z:p.w}));
    if(ps.every(v=>v.x<0)||ps.every(v=>v.x>width)||ps.every(v=>v.y<0)||ps.every(v=>v.y>height))continue;
    const area=Math.abs((ps[1].x-ps[0].x)*(ps[2].y-ps[0].y)-(ps[2].x-ps[0].x)*(ps[1].y-ps[0].y));if(area<.4)continue;
    visible.push({face:{...face,uv:tri.map(v=>({x:v.u,y:v.v}))},p:ps,d:ps.reduce((s,p)=>s+p.z,0)/3});
   }
  }
  visible.sort((a,b)=>(a.face.mesh.renderOrder-b.face.mesh.renderOrder)||(b.d-a.d));
  for(const {face,p,d}of visible){const m=face.material;ctx.beginPath();ctx.moveTo(p[0].x,p[0].y);ctx.lineTo(p[1].x,p[1].y);ctx.lineTo(p[2].x,p[2].y);ctx.closePath();const color=m.color?.clone()||new THREE.Color(0xffffff);
   // Warm ceiling and fire light, with cooler light from the west window.
   const f=face.center,n=face.normal;const light=Math.max(.36,Math.min(1.35,.54+n.y*.2+n.z*.12+Math.max(0,1-Math.hypot(f.x,f.z+2)/8)*.32));
   color.multiplyScalar(light);const fog=Math.min(.36,d*.014);color.lerp(new THREE.Color(0x21131a),fog);
   if(m.emissive?.getHex())color.add(m.emissive.clone().multiplyScalar(.25));ctx.fillStyle=`#${color.getHexString()}`;ctx.fill();
   if(m.map){drawTexture(face,p);ctx.fillStyle=`rgba(18,8,15,${Math.min(.7,.3+(1-light)*.3+fog)})`;ctx.fill();}
  }
  canvas.dataset.renderMs=String(Math.round(performance.now()-now));canvas.dataset.faceCount=String(visible.length);
 }
 return{domElement:canvas,shadowMap:{},capabilities:{getMaxAnisotropy:()=>1},setPixelRatio(){},setSize(w,h){width=Math.round(w);height=Math.round(h);canvas.width=width;canvas.height=height;lastStatic=0;},render,isCompatibility:true};
}

// Local low-cost renderer. Coplanar box faces remain quads; texture triangles
// overlap by a fraction of a pixel so antialiasing cannot reveal their edges.
export function createCanvasRenderer(THREE){
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{alpha:false});
 if(!ctx)throw new Error('No canvas renderer is available.');
 let width=1,height=1,entries=null,lastRender=-Infinity,lastView='',lastStill=0;
 const projection=new THREE.Matrix4(),eye=new THREE.Vector3(),point=new THREE.Vector3(),normalMatrix=new THREE.Matrix3();
 const patterns=new WeakMap(),fogColor=new THREE.Color(0x211b22),color=new THREE.Color();
 function compile(scene){const meshes=[];scene.traverse(mesh=>{
  if(!mesh.isMesh||mesh.material?.visible===false)return;
  const geo=mesh.geometry,pos=geo.attributes.position,norm=geo.attributes.normal,uv=geo.attributes.uv,idx=geo.index,faces=[];
  if(!pos||!norm)return;
  const index=i=>idx?idx.getX(i):i,total=idx?idx.count:pos.count;
  const vertex=i=>({x:pos.getX(i),y:pos.getY(i),z:pos.getZ(i),u:uv?.getX(i)||0,v:uv?.getY(i)||0});
  const isQuad=geo.type==='BoxGeometry'||geo.type==='PlaneGeometry';
  for(let i=0;i<total;){
   const mi=Array.isArray(mesh.material)?geo.groups.find(g=>i>=g.start&&i<g.start+g.count)?.materialIndex||0:0;
   const ids=isQuad&&i+5<total?[index(i),index(i+1),index(i+4),index(i+2)]:[index(i),index(i+1),index(i+2)];
   faces.push({vertices:ids.map(vertex),normal:new THREE.Vector3(norm.getX(ids[0]),norm.getY(ids[0]),norm.getZ(ids[0])),mi});i+=ids.length===4?6:3;
  }
  meshes.push({mesh,faces,matrix:[],world:[]});
 });return meshes;}
 function visible(mesh){for(let p=mesh;p;p=p.parent)if(!p.visible)return false;return true;}
 function worldFaces(entry){const {mesh}=entry,m=mesh.matrixWorld.elements;
  if(m.some((v,i)=>v!==entry.matrix[i])){entry.matrix=m.slice();normalMatrix.getNormalMatrix(mesh.matrixWorld);entry.world=entry.faces.map(face=>{
   const vertices=face.vertices.map(v=>{point.set(v.x,v.y,v.z).applyMatrix4(mesh.matrixWorld);return{x:point.x,y:point.y,z:point.z,u:v.u,v:v.v};});
   const center=vertices.reduce((a,v)=>({x:a.x+v.x/vertices.length,y:a.y+v.y/vertices.length,z:a.z+v.z/vertices.length}),{x:0,y:0,z:0});
   const n=face.normal.clone().applyMatrix3(normalMatrix).normalize();return{vertices,center,normal:n,mi:face.mi};
  });}return entry.world;
 }
 function clip(vertices){const out=[];for(let i=0;i<vertices.length;i++){const a=vertices[i],b=vertices[(i+1)%vertices.length],ia=a.w>=.09,ib=b.w>=.09;if(ia)out.push(a);if(ia!==ib){const t=(.09-a.w)/(b.w-a.w),v={};for(const k of ['x','y','z','w','u','v'])v[k]=a[k]+(b[k]-a[k])*t;out.push(v);}}return out;}
 function path(p,expand=0){const cx=p.reduce((n,v)=>n+v.x,0)/p.length,cy=p.reduce((n,v)=>n+v.y,0)/p.length;ctx.beginPath();p.forEach((v,i)=>{const d=Math.hypot(v.x-cx,v.y-cy)||1,x=v.x+(v.x-cx)/d*expand,y=v.y+(v.y-cy)/d*expand;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.closePath();}
 function textureTriangle(tex,p){let pattern=patterns.get(tex);if(!pattern){try{pattern=ctx.createPattern(tex.image,'repeat');patterns.set(tex,pattern);}catch{return;}}if(!pattern)return;
  const tw=tex.image.width,th=tex.image.height,q=p.map(v=>({x:v.u*tw*tex.repeat.x,y:(1-v.v)*th*tex.repeat.y}));
  const [a,b,c]=q,[A,B,C]=p,det=a.x*(b.y-c.y)+b.x*(c.y-a.y)+c.x*(a.y-b.y);if(Math.abs(det)<.001)return;
  const tx=(A.x*(b.y-c.y)+B.x*(c.y-a.y)+C.x*(a.y-b.y))/det,ty=(A.y*(b.y-c.y)+B.y*(c.y-a.y)+C.y*(a.y-b.y))/det;
  const ux=(A.x*(c.x-b.x)+B.x*(a.x-c.x)+C.x*(b.x-a.x))/det,uy=(A.y*(c.x-b.x)+B.y*(a.x-c.x)+C.y*(b.x-a.x))/det;
  const vx=(A.x*(b.x*c.y-c.x*b.y)+B.x*(c.x*a.y-a.x*c.y)+C.x*(a.x*b.y-b.x*a.y))/det,vy=(A.y*(b.x*c.y-c.x*b.y)+B.y*(c.x*a.y-a.x*c.y)+C.y*(a.x*b.y-b.x*a.y))/det;
  const minX=Math.min(...q.map(v=>v.x))-4,minY=Math.min(...q.map(v=>v.y))-4,maxX=Math.max(...q.map(v=>v.x))+4,maxY=Math.max(...q.map(v=>v.y))+4;
  ctx.save();path(p,.7);ctx.clip();ctx.transform(tx,ty,ux,uy,vx,vy);ctx.fillStyle=pattern;ctx.fillRect(minX,minY,maxX-minX,maxY-minY);ctx.restore();
 }
 function project(vertices){const e=projection.elements;return clip(vertices.map(v=>({x:e[0]*v.x+e[4]*v.y+e[8]*v.z+e[12],y:e[1]*v.x+e[5]*v.y+e[9]*v.z+e[13],z:e[2]*v.x+e[6]*v.y+e[10]*v.z+e[14],w:e[3]*v.x+e[7]*v.y+e[11]*v.z+e[15],u:v.u,v:v.v}))).map(v=>({x:(v.x/v.w*.5+.5)*width,y:(.5-v.y/v.w*.5)*height,w:v.w,u:v.u,v:v.v}));}
 function render(scene,camera,force=false){const now=performance.now();if(now-lastRender<32)return;camera.updateMatrixWorld();const sig=camera.matrixWorld.elements.map(v=>v.toFixed(4)).join(',');if(!force&&sig===lastView&&now-lastStill<120)return;lastView=sig;lastRender=now;lastStill=now;
  scene.updateMatrixWorld();if(!entries)entries=compile(scene);projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);camera.getWorldPosition(eye);
  ctx.fillStyle='#211a20';ctx.fillRect(0,0,width,height);const draw=[];
  for(const entry of entries){if(!visible(entry.mesh))continue;for(const face of worldFaces(entry)){
   const m=Array.isArray(entry.mesh.material)?entry.mesh.material[face.mi]:entry.mesh.material;if(!m||m.visible===false)continue;const n=face.normal,f=face.center;
   if(n.x*(eye.x-f.x)+n.y*(eye.y-f.y)+n.z*(eye.z-f.z)<=0&&m.side!==THREE.DoubleSide)continue;
   const p=project(face.vertices);if(p.length<3||p.every(v=>v.x<0)||p.every(v=>v.x>width)||p.every(v=>v.y<0)||p.every(v=>v.y>height))continue;
   const area=Math.abs((p[1].x-p[0].x)*(p[2].y-p[0].y)-(p[2].x-p[0].x)*(p[1].y-p[0].y));if(area<.6)continue;
   draw.push({m,p,n,f,order:entry.mesh.renderOrder,depth:p.reduce((s,v)=>s+v.w,0)/p.length});
  }}
  draw.sort((a,b)=>a.order-b.order||b.depth-a.depth);
  for(const {m,p,n,f,depth}of draw){const light=m.isMeshBasicMaterial?1:Math.max(.5,Math.min(1.2,.7+n.y*.16+n.z*.08+Math.max(0,1-Math.hypot(f.x,f.z+2)/9)*.2));const fog=Math.min(.22,depth*.009);
   color.copy(m.color||fogColor).multiplyScalar(light).lerp(fogColor,fog);if(m.emissive){const glow=(m.emissiveIntensity||0)*.12;color.r+=m.emissive.r*glow;color.g+=m.emissive.g*glow;color.b+=m.emissive.b*glow;}
   path(p,.35);ctx.globalAlpha=m.transparent?m.opacity:1;ctx.fillStyle='#'+color.getHexString();ctx.fill();
   if(m.map?.image){for(let i=1;i<p.length-1;i++)textureTriangle(m.map,[p[0],p[i],p[i+1]]);path(p,.35);ctx.fillStyle=`rgba(18,12,18,${Math.min(.45,(1-light)*.3+fog+.09)})`;ctx.fill();}ctx.globalAlpha=1;
  }
  canvas.dataset.renderMs=String(Math.round((performance.now()-now)*10)/10);canvas.dataset.faceCount=String(draw.length);canvas.dataset.renderer='canvas-quad-v2';
 }
 return{domElement:canvas,shadowMap:{},capabilities:{getMaxAnisotropy:()=>1},setPixelRatio(){},setSize(w,h){const scale=Math.min(1,1000/w,720/h);width=Math.max(1,Math.round(w*scale));height=Math.max(1,Math.round(h*scale));canvas.width=width;canvas.height=height;lastView='';lastStill=0;},render,isCompatibility:true};
}

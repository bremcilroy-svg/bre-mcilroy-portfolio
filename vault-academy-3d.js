/* Enchanted Academy: real 3D additions to the existing Three.js scene.
   Decorative meshes only. No puzzle or collision changes. */
export function installAcademyGreatHall(scene,THREE){
 if(scene.userData.academyGreatHall)return;
 scene.userData.academyGreatHall=true;
 const mat=(c,extra={})=>new THREE.MeshStandardMaterial({color:c,roughness:.68,...extra});
 const gold=mat(0xc49c65,{metalness:.6,roughness:.35});
 const purple=mat(0x50346d);
 const velvet=[0x51336e,0x743b4b,0x31545a,0x594375].map(c=>mat(c));
 const glow=mat(0xf8d9a3,{emissive:0xd9a4ff,emissiveIntensity:1.4});
 const addBox=(w,h,d,x,y,z,m)=>{
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
  mesh.position.set(x,y,z);scene.add(mesh);return mesh;
 };
 // Vaulted ceiling ribs — safely above walking height.
 for(const z of [-5,-2,1,4]){
  for(const x of [-4.9,4.9]){
   const rib=addBox(.09,.12,5.3,x,4.42,z,gold);
   rib.rotation.y=x>0?.08:-.08;
  }
  addBox(10.7,.1,.1,0,4.43,z,gold);
 }
 // Four vertical house banners, mounted high on rear wall.
 const houses=['✧','♜','☾','❀'];
 for(let i=0;i<4;i++){
  const x=-4.35+i*2.9,z=-6.79;
  addBox(1.08,1.35,.06,x,3.18,z,velvet[i]);
  addBox(1.17,.06,.13,x,3.91,z,gold);
  addBox(.8,.025,.09,x,2.49,z,gold);
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,256,256);ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillStyle='#f5dfb4';ctx.font='bold 132px Georgia,serif';ctx.fillText(houses[i],128,125);
  const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
  const emblem=new THREE.Mesh(new THREE.PlaneGeometry(.65,.65),new THREE.MeshBasicMaterial({map:tex,transparent:true,side:THREE.DoubleSide,depthWrite:false}));
  emblem.position.set(x,3.27,-6.735);scene.add(emblem);
 }
 // Floating spell lights: few meshes, mobile-friendly, no physics/collision.
 const orbs=[];
 const locations=[[-3.8,3.2,-3.8],[-2.5,3.65,.8],[3.5,3.3,-3.5],[4.3,3.7,2.3],[0,3.85,2.8]];
 locations.forEach(([x,y,z],i)=>{
  const orb=new THREE.Mesh(new THREE.SphereGeometry(.055,8,6),glow);
  orb.position.set(x,y,z);scene.add(orb);orbs.push({orb,y,phase:i*1.7});
 });
 // Academy crest above the exit door (keeps door itself untouched).
 const crest=addBox(1.1,.58,.08,0,3.75,6.65,purple);
 const crestTrim=addBox(1.2,.055,.1,0,4.06,6.64,gold);
 // Add a faint moonlit fill, but avoid heavy dynamic shadows.
 const academyLight=new THREE.PointLight(0x9c7ed4,.7,9,2);
 academyLight.position.set(0,3.6,0);scene.add(academyLight);
 return {tick(time){
  const t=time/1000;
  for(const {orb,y,phase} of orbs)orb.position.y=y+Math.sin(t*.75+phase)*.065;
 }};
}

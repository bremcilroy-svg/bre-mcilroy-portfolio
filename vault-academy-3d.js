/* Royal Castle Phase 3D. Decorative meshes only; original puzzles/colliders remain unchanged. */
export function installAcademyGreatHall(scene, THREE) {
  if(scene.userData.academyGreatHall) return scene.userData.academyGreatHall;
  const group=new THREE.Group();group.name='Royal Enchanted Academy';scene.add(group);
  const mat=(c,extra={})=>new THREE.MeshStandardMaterial({color:c,roughness:.62,...extra});
  const stone=mat(0x42354f),silver=mat(0xc3c8d7,{metalness:.72,roughness:.3}),purple=mat(0x502365),ruby=mat(0x8f2344),ice=mat(0x9bdfff,{emissive:0x3d9dc8,emissiveIntensity:.65}),white=mat(0xf1f5fc),dark=mat(0x15101f),eyes=mat(0x49c8ff,{emissive:0x1a8dc7,emissiveIntensity:1.5});
  const add=(g,m,x,y,z,parent=group)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);parent.add(o);return o};
  const beam=(w,h,d,x,y,z,m=stone,parent=group)=>add(new THREE.BoxGeometry(w,h,d),m,x,y,z,parent);
  // Wall arches, ribbed vault, silver capitals; all above head height or close to walls.
  for(const x of [-5.52,5.52]) for(const z of [-5.5,-2.5,.5,3.5,5.5]){
    beam(.35,2.2,.46,x,3.1,z);beam(.48,.15,.6,x,4.28,z,silver);beam(.48,.14,.6,x,1.95,z,silver);
  }
  for(const z of [-5.5,-2.5,.5,3.5,5.5]){
    beam(10.9,.12,.13,0,4.44,z,silver);
    for(const x of [-4.2,-2.1,0,2.1,4.2]){const r=beam(.09,.11,1.5,x,4.43,z+.7,purple);r.rotation.z=x*.012;}
  }
  for(const x of [-5.7,5.7])for(const z of [-4.5,-.7,3.1]){
    beam(.08,1.2,.1,x,2.8,z-1.1,silver);beam(.08,1.2,.1,x,2.8,z+1.1,silver);
    for(const s of [-1,1]){const p=beam(.09,.1,1.55,x,3.69,z+s*.54,silver);p.rotation.x=s*.46;}
    beam(.035,1.04,1.75,x,2.77,z,stone);
    const glass=beam(.04,.75,1.3,x,2.92,z,ice);glass.material=ice;
  }
  // Four heraldic banners on the far wall.
  const sigils=['✧','♜','☾','❀'];const banners=[purple,ruby,purple,ruby];
  sigils.forEach((s,i)=>{const x=-4.35+i*2.9;beam(1.08,1.28,.045,x,3.13,-6.75,banners[i]);beam(1.24,.07,.1,x,3.84,-6.7,silver);
    const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#e4e9f5';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 78px Georgia';ctx.fillText(s,64,66);
    const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;add(new THREE.PlaneGeometry(.68,.68),new THREE.MeshBasicMaterial({map:tx,transparent:true,side:THREE.DoubleSide}),x,3.15,-6.69);
  });
  // Silver crown over original door, not a new door or collider.
  beam(1.65,.06,.08,0,4.08,6.66,silver);for(let i=-2;i<=2;i++){const tip=add(new THREE.ConeGeometry(.11,.35,5),silver,i*.33,4.28,6.66);tip.rotation.z=Math.PI;}
  const owls=[];
  function owl(x,y,z,scale=1,phase=0){const root=new THREE.Group();root.position.set(x,y,z);root.scale.setScalar(scale);group.add(root);
    add(new THREE.SphereGeometry(.21,10,8),white,0,.12,0,root);add(new THREE.SphereGeometry(.17,10,8),white,0,.39,.01,root);
    for(const s of [-1,1]){add(new THREE.SphereGeometry(.056,8,6),eyes,s*.09,.41,.145,root);const wing=add(new THREE.SphereGeometry(.09,8,6),white,s*.19,.15,0,root);wing.scale.set(.55,1.65,.85);}
    const beak=add(new THREE.ConeGeometry(.047,.095,5),silver,0,.32,.17,root);beak.rotation.x=Math.PI/2;
    for(const s of [-1,1]){const ear=add(new THREE.ConeGeometry(.065,.15,5),white,s*.115,.56,0,root);ear.rotation.z=s*.3;}
    owls.push({root,phase,base:y});
  }
  // High perches keep the owls away from the player and interactive objects.
  [[-5.05,3.68,-4.7,.85],[5.05,3.68,-2.5,.8],[-5.05,3.68,.5,.85],[5.05,3.68,3.6,.85],[-3.9,4.0,6.35,.6],[3.9,4.0,6.35,.6],[-3.8,4.02,-6.3,.65],[3.8,4.02,-6.3,.65]].forEach((v,i)=>owl(...v,i*.85));
  const orbs=[];[[-4.5,3.8,-4],[-3,4,-1],[3,3.8,-3.6],[4.4,3.9,1.7],[-4.2,3.7,3.4],[1.2,4,2.5]].forEach(([x,y,z],i)=>{const o=add(new THREE.SphereGeometry(.065,8,6),ice,x,y,z);orbs.push({o,y,phase:i*1.2})});
  const light=new THREE.PointLight(0x9cbeff,.75,12,2);light.position.set(0,3.9,0);group.add(light);
  const tick=(ms)=>{const t=ms/1000;for(const v of orbs){v.o.position.y=v.y+Math.sin(t*.75+v.phase)*.075;}for(const o of owls){o.root.rotation.y=Math.sin(t*.4+o.phase)*.16;o.root.position.y=o.base+Math.sin(t*.6+o.phase)*.018;}};
  const controller={tick};scene.userData.academyGreatHall=controller;return controller;
}

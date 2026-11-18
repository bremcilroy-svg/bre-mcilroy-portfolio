/* Phase 3C: Enchanted Academy Hall. Visual additions only: no colliders, puzzle state or save edits. */
export function installAcademyGreatHall(scene, THREE) {
  if (scene.userData.academyGreatHall) return scene.userData.academyGreatHall;
  const group = new THREE.Group(); group.name = 'Academy Phase 3C'; scene.add(group);
  const mat = (color, extra={}) => new THREE.MeshStandardMaterial({color, roughness:.72, ...extra});
  const stone=mat(0x33283e), lilac=mat(0x6a4a82), gold=mat(0xcaa66e,{metalness:.55,roughness:.4}), moon=mat(0xc2b5de,{metalness:.2}), dark=mat(0x211b31);
  const glow=mat(0xffe6b8,{emissive:0xffbd78,emissiveIntensity:1.8});
  const mesh=(geo,m,x,y,z)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);group.add(o);return o;};
  const beam=(w,h,d,x,y,z,m=stone)=>mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z);
  // High architectural details stay outside the walkable volume.
  for(const x of [-5.38,5.38]){
    for(const z of [-5.2,-2.5,.2,2.9,5.3]){
      beam(.34,2.25,.45,x,3.05,z,stone);
      beam(.44,.12,.54,x,4.22,z,gold);
      beam(.44,.12,.54,x,1.91,z,gold);
    }
    beam(.16,.12,12.1,x,4.38,0,gold);
  }
  for(const z of [-5.2,-2.5,.2,2.9,5.3]){
    const crown=beam(10.7,.12,.14,0,4.48,z,gold);
    for(const x of [-4.1,-2.05,0,2.05,4.1]){
      const rib=beam(.09,.1,1.5,x,4.48,z+.72,lilac); rib.rotation.z=(x/4.1)*.06;
    }
  }
  // Side-wall pointed-arch motifs, made from narrow beams rather than heavy curved geometry.
  for(const x of [-5.22,5.22]) for(const z of [-4.1,-.4,3.3]){
    beam(.11,1.22,.11,x,2.88,z-1.05,gold);
    beam(.11,1.22,.11,x,2.88,z+1.05,gold);
    for(const sign of [-1,1]){
      const tip=beam(.11,.1,1.53,x,3.76,z+sign*.52,gold);
      tip.rotation.x=sign*.48;
    }
    beam(.04,1.15,1.75,x,2.87,z,dark);
    beam(.055,.05,1.65,x,3.53,z,moon);
  }
  // Academy banners above the rear wall, without hiding the existing puzzle props.
  const houses=[['✧',0x61427f],['♜',0x833e4f],['☾',0x2f5967],['❀',0x665284]];
  houses.forEach(([symbol,color],i)=>{
    const x=-4.35+i*2.9;
    beam(1.06,1.24,.045,x,3.19,-6.77,mat(color));
    beam(1.18,.065,.11,x,3.86,-6.72,gold);
    const c=document.createElement('canvas');c.width=c.height=128;
    const ctx=c.getContext('2d');ctx.fillStyle='#f7e5c7';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 77px Georgia';ctx.fillText(symbol,64,65);
    const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;
    mesh(new THREE.PlaneGeometry(.67,.67),new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.DoubleSide}),x,3.24,-6.725);
  });
  // Moonmere crescent above the exit door. Door collider and interaction untouched.
  const crest=mesh(new THREE.TorusGeometry(.36,.055,8,32,Math.PI*1.65),moon,0,3.82,6.58);
  crest.rotation.y=Math.PI;crest.rotation.z=.38;
  beam(1.25,.045,.06,0,4.3,6.58,gold);
  // Lightweight floating lights and spell sparks; no physics, collision, or shadow maps.
  const orbs=[];
  const points=[[-4.5,3.75,-4],[-3,3.95,-1],[3,3.75,-3.6],[4.4,3.9,1.7],[-4.2,3.7,3.4],[1.2,4.05,2.5],[0,4.05,-4.5]];
  points.forEach(([x,y,z],i)=>{
    const orb=mesh(new THREE.SphereGeometry(.065,8,6),glow,x,y,z);
    orbs.push({orb,y,phase:i*1.23});
  });
  const light=new THREE.PointLight(0xb79aff,.8,12,2);light.position.set(0,3.7,0);group.add(light);
  const tick=(time)=>{const t=time/1000;for(const {orb,y,phase} of orbs){orb.position.y=y+Math.sin(t*.7+phase)*.075;orb.scale.setScalar(.88+.14*Math.sin(t*1.8+phase));}};
  const controller={tick};scene.userData.academyGreatHall=controller;return controller;
}

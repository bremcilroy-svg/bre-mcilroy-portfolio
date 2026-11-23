/* Shared player view preference and low-cost royal avatar for walkable rooms.
 * The preference is deliberately separate from puzzle, chapter, and memory saves. */
export const PERSPECTIVE_KEY = 'amethyst-academy-player-perspective-v1';

export function readPerspective() {
  try { return localStorage.getItem(PERSPECTIVE_KEY) === 'third' ? 'third' : 'first'; }
  catch { return 'first'; }
}

function savedCharacter() {
  try {
    const value = JSON.parse(localStorage.getItem('amethyst-crescent-character-v1') || 'null');
    return value && typeof value === 'object' ? value : {};
  } catch { return {}; }
}

function makeAvatar(THREE, scene) {
  const character = savedCharacter();
  const houseColors = {
    amethyst: '#67428f', emberheart: '#8c2945',
    frostveil: '#2d638e', silverthorn: '#65527d'
  };
  const skinColors = {fair:'#f6d8c4',light:'#e8b99a',medium:'#c58c6b',tan:'#a66d4c',deep:'#6a402f'};
  const hairColors = {brown:'#4d302c',black:'#24232b',blonde:'#e5bc75',silver:'#c8cbd4',red:'#a44d36',purple:'#77518c'};
  const robe = new THREE.MeshStandardMaterial({color:houseColors[character.house] || '#67428f', roughness:.9});
  const trim = new THREE.MeshStandardMaterial({color:'#cbd8e8', metalness:.55, roughness:.35});
  const skin = new THREE.MeshStandardMaterial({color:skinColors[character.skin] || '#e8b99a', roughness:.9});
  const hair = new THREE.MeshStandardMaterial({color:hairColors[character.hair] || '#4d302c', roughness:.95});
  const group = new THREE.Group();
  group.name = 'royal player avatar';
  const add = (geometry, material, position, scale = [1,1,1], rotation = [0,0,0]) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position); mesh.scale.set(...scale); mesh.rotation.set(...rotation);
    mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh);
  };
  add(new THREE.CylinderGeometry(.2,.37,.94,10), robe, [0,.77,0]);
  add(new THREE.CylinderGeometry(.23,.21,.42,10), robe, [0,1.43,0]);
  add(new THREE.BoxGeometry(.54,.78,.08), robe, [0,1.05,.25]);
  for (const side of [-1,1]) {
    add(new THREE.CylinderGeometry(.07,.085,.66,7), robe, [side*.31,1.37,0], [1,1,1], [0,0,side*.12]);
    add(new THREE.BoxGeometry(.17,.25,.28), trim, [side*.14,.14,0]);
  }
  add(new THREE.SphereGeometry(.22,12,9), skin, [0,1.87,0], [1,.98,.94]);
  add(new THREE.SphereGeometry(.23,12,8), hair, [0,2.01,.015], [1,.47,1]);
  add(new THREE.TorusGeometry(.15,.025,6,14), trim, [0,2.12,0], [1,.55,1]);
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(.075), new THREE.MeshBasicMaterial({color:'#b991f0'}));
  gem.position.set(0,2.14,-.145); group.add(gem);
  group.visible = false;
  scene.add(group);
  return group;
}

export function createPerspectiveView(THREE, {scene, camera, canvas, getPose, distance = 3.25}) {
  let mode = readPerspective();
  const avatar = makeAvatar(THREE, scene);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'vault-perspective-toggle';
  button.dataset.perspectiveToggle = '';
  button.setAttribute('aria-pressed', String(mode === 'third'));
  button.style.cssText = 'position:fixed;top:calc(112px + env(safe-area-inset-top,0px));right:max(12px,env(safe-area-inset-right,0px));z-index:10030;min-height:44px;padding:9px 13px;border:1px solid #d6c5ec;border-radius:22px;background:#24182deF;color:#fff;font:600 13px system-ui,sans-serif;box-shadow:0 3px 12px #0008;cursor:pointer;touch-action:manipulation';
  document.body.append(button);
  const syncButtonVisibility = () => {
    let visible = Boolean(canvas?.isConnected);
    for (let node = canvas; visible && node && node !== document.body; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (node.hidden || style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') visible = false;
    }
    button.hidden = !visible;
  };
  const visibilityObserver = new MutationObserver(syncButtonVisibility);
  visibilityObserver.observe(document.body, {subtree:true, attributes:true, attributeFilter:['hidden']});
  const label = () => {
    button.textContent = mode === 'third' ? 'Switch to first person' : 'Switch to third person';
    button.setAttribute('aria-label', mode === 'third' ? 'Switch to first-person view' : 'Switch to third-person view');
    button.setAttribute('aria-pressed', String(mode === 'third'));
  };
  const setMode = value => {
    mode = value === 'third' ? 'third' : 'first';
    try { localStorage.setItem(PERSPECTIVE_KEY, mode); } catch {}
    label();
    update();
  };
  syncButtonVisibility();
  button.addEventListener('click', () => setMode(mode === 'first' ? 'third' : 'first'));
  window.addEventListener('keydown', event => {
    if (event.code !== 'KeyV' || event.repeat || event.target.closest('button,a,input,select,textarea,[role="dialog"]')) return;
    event.preventDefault(); setMode(mode === 'first' ? 'third' : 'first');
  });
  function update() {
    const pose = getPose();
    const yaw = Number.isFinite(pose.yaw) ? pose.yaw : 0;
    const pitch = Number.isFinite(pose.pitch) ? pose.pitch : 0;
    const x = Number.isFinite(pose.x) ? pose.x : 0;
    const z = Number.isFinite(pose.z) ? pose.z : 0;
    avatar.visible = mode === 'third';
    if (mode === 'third') {
      avatar.position.set(x, 0, z);
      avatar.rotation.y = yaw;
      camera.position.set(x + Math.sin(yaw) * distance, 1.9 + Math.sin(pitch) * .45, z + Math.cos(yaw) * distance);
    } else {
      camera.position.set(x, 1.67, z);
    }
    camera.rotation.order = 'YXZ';
    camera.rotation.set(pitch, yaw, 0);
    camera.updateMatrixWorld();
    if (canvas) canvas.dataset.perspective = mode;
  }
  label();
  update();
  return Object.freeze({update, get mode(){return mode;}, setMode});
}

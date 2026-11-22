import {
  BoxGeometry, BufferAttribute, BufferGeometry, CanvasTexture, Color, CylinderGeometry,
  DirectionalLight, DoubleSide, Fog, Group, HemisphereLight, LineBasicMaterial, LineSegments, Mesh,
  MeshBasicMaterial, MeshStandardMaterial, OctahedronGeometry, PerspectiveCamera,
  PlaneGeometry, PointLight, Points, PointsMaterial, Raycaster, Scene,
  SphereGeometry, SRGBColorSpace, TorusGeometry, Vector2, Vector3, WebGLRenderer
} from './vault-three.module.js?v=moonlit-courtyard-3d';
import { createRoyalRoomKit } from './academy-3d-architecture.js?v=1';

(() => {
  'use strict';
  const main = document.querySelector('body.academy-scene-court main');
  const fountain = document.getElementById('fountain-memories');
  if (!main || !fountain || main.querySelector('#moonlit-courtyard-3d-canvas')) return;

  const qualityKey = 'bre-poetry-vault-heart-graphics-v1';
  const qualityScale = { high: 1, balanced: .82, performance: .60 };
  const controls = document.createElement('section');
  controls.className = 'courtyard-3d-controls';
  controls.setAttribute('aria-label', 'Walkable Moonlit Courtyard controls');
  controls.innerHTML = '<div class="courtyard-3d-settings"><label for="courtyard-3d-quality">Graphics</label><select id="courtyard-3d-quality" aria-label="Courtyard graphics quality"><option value="high">High</option><option value="balanced">Balanced</option><option value="performance">Performance</option></select><button type="button" data-courtyard-view>Return to illustrated courtyard</button></div><p id="courtyard-3d-status" role="status" aria-live="polite">Preparing the Moonlit Courtyard…</p><div class="courtyard-3d-actions"><button type="button" data-inspect="fountain">Approach the Fountain</button><button type="button" data-inspect="gizmo">Visit Gizmo</button><button type="button" data-inspect="owl">Visit the Snow Owl</button></div></section>';
  main.append(controls);
  const status = controls.querySelector('#courtyard-3d-status');
  const qualitySelect = controls.querySelector('#courtyard-3d-quality');
  const viewButton = controls.querySelector('[data-courtyard-view]');
  let quality = 'high';
  try {
    const saved = localStorage.getItem(qualityKey);
    if (Object.hasOwn(qualityScale, saved)) quality = saved;
  } catch {}
  qualitySelect.value = quality;

  const canvas = document.createElement('canvas');
  canvas.id = 'moonlit-courtyard-3d-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.tabIndex = -1;
  main.prepend(canvas);
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' });
  } catch (error) {
    canvas.remove();
    controls.classList.add('courtyard-3d-unavailable');
    controls.querySelector('.courtyard-3d-settings').hidden = true;
    controls.querySelector('.courtyard-3d-actions').hidden = true;
    viewButton.hidden = true;
    status.textContent = '3D is unavailable in this browser. The illustrated courtyard and Fountain of Memories remain ready.';
    console.info('Moonlit Courtyard WebGL unavailable; retaining the existing experience.', error);
    return;
  }

  const scene = new Scene();
  scene.background = new Color('#11182b');
  scene.fog = new Fog('#11182b', 20, 48);
  const camera = new PerspectiveCamera(68, 1, .08, 72);
  camera.position.set(0, 1.68, 10.8);
  const ambient = new HemisphereLight('#d7eaff', '#211625', 1.55);
  scene.add(ambient);
  const moonlight = new DirectionalLight('#c8e8ff', 2.1);
  moonlight.position.set(-9, 16, -12);
  scene.add(moonlight);
  const lanternLights = [];
  for (const [x, z] of [[-10, -9], [10, -9], [-10, 9], [10, 9]]) {
    const lantern = new PointLight('#ffd9b1', 6, 9, 2);
    lantern.position.set(x, 4.2, z);
    scene.add(lantern);
    lanternLights.push(lantern);
  }
  const materials = {
    stone: new MeshStandardMaterial({ color: '#4b566b', roughness: .94 }),
    stoneLight: new MeshStandardMaterial({ color: '#8a96aa', roughness: .8 }),
    onyx: new MeshStandardMaterial({ color: '#16131e', roughness: .31, metalness: .58 }),
    silver: new MeshStandardMaterial({ color: '#d5e3f1', roughness: .26, metalness: .72 }),
    blueGlass: new MeshStandardMaterial({ color: '#83d9ff', roughness: .16, metalness: .08, emissive: '#1e5d83', emissiveIntensity: .85, side: DoubleSide }),
    purpleGlass: new MeshStandardMaterial({ color: '#aa7bec', roughness: .19, emissive: '#4d2678', emissiveIntensity: .72, side: DoubleSide }),
    rubyGlass: new MeshStandardMaterial({ color: '#cf5778', roughness: .2, emissive: '#5f1e38', emissiveIntensity: .62, side: DoubleSide }),
    amethyst: new MeshStandardMaterial({ color: '#a96bdf', roughness: .2, metalness: .12, emissive: '#54227d', emissiveIntensity: 1.05 }),
    water: new MeshBasicMaterial({ color: '#a9eaff', transparent: true, opacity: .78, side: DoubleSide }),
    waterDark: new MeshBasicMaterial({ color: '#8155c9', transparent: true, opacity: .68, side: DoubleSide }),
    darkWood: new MeshStandardMaterial({ color: '#2b2035', roughness: .9 }),
    leaf: new MeshStandardMaterial({ color: '#324d48', roughness: .97 }),
    rose: new MeshStandardMaterial({ color: '#a52f62', roughness: .65 }),
    catGray: new MeshStandardMaterial({ color: '#858b98', roughness: .94 }),
    catWhite: new MeshStandardMaterial({ color: '#eef0f3', roughness: .96 }),
    owlWhite: new MeshStandardMaterial({ color: '#edf5ff', roughness: .92 }),
    eyeBlue: new MeshBasicMaterial({ color: '#43baff' }),
    pupil: new MeshBasicMaterial({ color: '#0b1731' }),
    gold: new MeshStandardMaterial({ color: '#d4b47d', roughness: .4, metalness: .6 }),
    bannerGlow: new MeshStandardMaterial({ color: '#ddd1ed', roughness: .84, emissive: '#56416a', emissiveIntensity: .22 })
  };
  const kit = createRoyalRoomKit({ BoxGeometry, CylinderGeometry, SphereGeometry, Mesh }, scene);
  const interactables = [];
  const addBox = (name, position, size, material, interaction = null) => {
    const object = kit.box({ name, position, size, material });
    if (interaction) { object.userData.interaction = interaction; interactables.push(object); }
    return object;
  };
  const addCylinder = (name, position, height, radius, material, interaction = null) => {
    const object = kit.cylinder({ name, position, height, radius, material });
    if (interaction) { object.userData.interaction = interaction; interactables.push(object); }
    return object;
  };
  const addSphere = (name, parent, position, size, material, interaction = null) => {
    const object = kit.sphere({ name, parent, position, size, material });
    if (interaction) { object.userData.interaction = interaction; interactables.push(object); }
    return object;
  };

  // Broad flagstone paving with an inlaid silver crescent path.
  const ground = new Mesh(new PlaneGeometry(34, 34), materials.stone);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -.04;
  ground.name = 'Moonlit flagstone paving';
  scene.add(ground);
  const inlayPositions = [];
  for (let i = -12; i <= 12; i += 2) {
    inlayPositions.push(i, .012, -13, i, .012, 13, -13, .013, i, 13, .013, i);
  }
  const inlayGeometry = new BufferGeometry();
  inlayGeometry.setAttribute('position', new BufferAttribute(new Float32Array(inlayPositions), 3));
  scene.add(new LineSegments(inlayGeometry, new LineBasicMaterial({ color: '#9cb4ca', transparent: true, opacity: .18 })));

  // The courtyard keeps four open Gothic passages aligned with existing destinations.
  // Segment walls around each arch, leaving the routes physically traversable.
  for (const z of [-15, 15]) {
    for (const x of [-10.5, 10.5]) addBox('Fortified courtyard wall', [x, 4.1, z], [9, 8.2, .8], materials.stone);
  }
  for (const x of [-15, 15]) {
    for (const z of [-10.5, 10.5]) addBox('Fortified courtyard wall', [x, 4.1, z], [.8, 8.2, 9], materials.stone);
  }
  // Four corner towers echo Irish and British castle keeps with icy crown glass.
  for (const [x, z] of [[-14, -14], [14, -14], [-14, 14], [14, 14]]) {
    addCylinder('Round stone watchtower', [x, 4.25, z], 8.5, 1.7, materials.stoneLight);
    addCylinder('Silver tower crown', [x, 8.7, z], .3, 1.85, materials.silver);
    const roof = new Mesh(new CylinderGeometry(.02, 1.68, 3.2, 8), materials.darkWood);
    roof.position.set(x, 10.25, z);
    scene.add(roof);
    const glass = addBox('Icy tower lancet', [x > 0 ? x - .91 : x + .91, 5, z], [.08, 2.5, .5], materials.blueGlass, { id: 'glass', label: 'Icy-blue tower window' });
    glass.rotation.y = Math.PI / 4;
  }
  // Pale silver pillars and three jewel-window bands line the castle walls.
  for (const [x, z] of [[-11.8, -7], [-11.8, 0], [-11.8, 7], [11.8, -7], [11.8, 0], [11.8, 7], [-7, -11.8], [7, -11.8], [-7, 11.8], [7, 11.8]]) {
    addCylinder('Carved silver courtyard pier', [x, 3.6, z], 7.2, .36, materials.stoneLight);
    addCylinder('Pier capital', [x, 7.25, z], .28, .54, materials.silver);
  }
  for (const [x, z, rotation, material] of [
    [0, -14.55, 0, materials.blueGlass], [0, 14.55, 0, materials.rubyGlass],
    [-14.55, 0, Math.PI / 2, materials.purpleGlass], [14.55, 0, Math.PI / 2, materials.blueGlass]
  ]) {
    const window = addBox('Gothic jewel-glass arch window', [x, 5.4, z], [3.25, 4.2, .12], material, { id: 'glass', label: 'Icy-blue and amethyst stained glass' });
    window.rotation.y = rotation;
    const frame = addBox('Silver window surround', [x, 5.4, z + (rotation ? 0 : -.08)], [3.55, 4.5, .12], materials.silver);
    frame.rotation.y = rotation;
    window.position.z += rotation ? 0 : .09;
    addBox('Window crosspiece', [x, 5.4, z], [3.2, .12, .18], materials.silver);
  }

  const destinations = [
    { id: 'north-gate', label: 'Enter the Royal Great Hall', url: 'academy-royal-great-hall.html#royal-reception', position: [0, 1.6, -15.1], rotation: 0 },
    { id: 'east-gate', label: 'Explore the Royal Gardens', url: 'academy-royal-gardens.html', position: [15.1, 1.6, 0], rotation: Math.PI / 2 },
    { id: 'south-gate', label: 'Return to the Castle Grounds', url: 'amethyst-crescent-academy.html', position: [0, 1.6, 15.1], rotation: 0 },
    { id: 'west-gate', label: 'Visit the Four Houses Hall', url: 'academy-four-houses.html', position: [-15.1, 1.6, 0], rotation: Math.PI / 2 }
  ];
  for (const door of destinations) {
    const [x, y, z] = door.position;
    const side = door.rotation ? 'sideways' : 'front';
    const gate = new Group();
    gate.name = door.label;
    gate.position.set(x, y, z);
    gate.rotation.y = door.rotation;
    scene.add(gate);
    const arch = new Mesh(new TorusGeometry(2.3, .18, 8, 32, Math.PI), materials.silver);
    arch.position.set(0, 2.5, 0);
    arch.rotation.z = Math.PI;
    gate.add(arch);
    for (const offset of [-2.25, 2.25]) {
      const pier = kit.box({ name: 'Gothic gate pier', position: [offset, .95, 0], size: [.36, 2.2, .46], material: materials.stoneLight, parent: gate });
      pier.userData.interaction = { ...door, id: door.id };
      interactables.push(pier);
    }
    const lintel = kit.box({ name: 'Silver gate lintel', position: [0, 4.75, 0], size: [4.9, .2, .5], material: materials.silver, parent: gate });
    const doorPanel = kit.box({ name: side + ' passage sign', position: [0, 1.7, -.04], size: [2.95, 2.4, .12], material: materials.darkWood, parent: gate });
    doorPanel.userData.interaction = { ...door, label: door.label };
    interactables.push(doorPanel);
    const crystal = kit.sphere({ name: 'Gate amethyst seal', position: [0, 3.7, .12], size: [.27, .38, .14], material: materials.amethyst, parent: gate });
    crystal.userData.interaction = { ...door, label: door.label };
    interactables.push(crystal);
  }

  // House banners remain recognizable from their existing colours and elements.
  const houseFlags = [
    ['Amethyst', 'AIR', '#563879', '🌪'], ['Emberheart', 'FIRE', '#8e2948', '🔥'],
    ['Frosttopaz', 'WATER', '#205c8b', '🌊'], ['Silverthorn', 'EARTH', '#78619b', '🌳']
  ];
  houseFlags.forEach(([name, element, color, emblem], index) => {
    const side = index % 2 ? 1 : -1;
    const z = index < 2 ? -7.7 : 7.7;
    const x = side * 10.7;
    const cloth = document.createElement('canvas');
    cloth.width = 320; cloth.height = 260;
    const context = cloth.getContext('2d');
    const gradient = context.createLinearGradient(0, 0, 320, 0);
    gradient.addColorStop(0, color); gradient.addColorStop(.45, '#ffffff28'); gradient.addColorStop(1, '#080817a8');
    context.fillStyle = gradient; context.fillRect(0, 0, 320, 260);
    context.strokeStyle = '#d9e7f3'; context.lineWidth = 9; context.strokeRect(7, 7, 306, 246);
    context.textAlign = 'center'; context.textBaseline = 'middle'; context.fillStyle = '#fff';
    context.shadowColor = '#090514'; context.shadowBlur = 9;
    context.font = '70px Georgia, serif'; context.fillText(emblem, 160, 93);
    context.font = 'bold 28px Georgia, serif'; context.fillText(name, 160, 174);
    context.font = 'bold 18px system-ui'; context.fillText(element, 160, 218);
    const texture = new CanvasTexture(cloth); texture.colorSpace = SRGBColorSpace;
    const banner = new Mesh(new PlaneGeometry(1.6, 1.3), new MeshStandardMaterial({ map: texture, side: DoubleSide, roughness: .9 }));
    banner.position.set(x, 5.2, z); banner.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
    banner.userData.interaction = { id: 'banner', label: `${name} ${element} royal banner` };
    scene.add(banner); interactables.push(banner);
    addCylinder('Silver banner staff', [x, 5.2, z], 2.8, .055, materials.silver);
  });

  // Black-amethyst Fountain of Memories: a broad onyx basin with silver rims,
  // violet tiers, an amethyst crown, and light-cost flowing water ribbons.
  addCylinder('Fountain stepped onyx plinth', [0, .28, 0], .56, 2.4, materials.onyx, { id: 'fountain', label: 'The Fountain of Memories' });
  addCylinder('Fountain lower silver rim', [0, .6, 0], .12, 2.33, materials.silver);
  addCylinder('Fountain black basin', [0, .92, 0], .56, 2.18, materials.onyx);
  addCylinder('Fountain violet water surface', [0, 1.21, 0], .055, 1.92, materials.waterDark);
  addCylinder('Fountain upper bowl', [0, 1.68, 0], .22, 1.48, materials.onyx);
  addCylinder('Fountain amethyst water bowl', [0, 1.81, 0], .05, 1.27, materials.waterDark);
  addCylinder('Fountain carved stem', [0, 2.31, 0], .94, .34, materials.onyx);
  addCylinder('Silver stem collar', [0, 2.78, 0], .13, .46, materials.silver);
  addCylinder('Amethyst crown bowl', [0, 3.14, 0], .2, .76, materials.onyx);
  addCylinder('Crown bowl water', [0, 3.25, 0], .035, .6, materials.water);
  const crown = new Mesh(new OctahedronGeometry(.62, 0), materials.amethyst);
  crown.position.set(0, 4.05, 0); crown.name = 'Glowing amethyst fountain crown';
  crown.userData.interaction = { id: 'fountain', label: 'The Fountain of Memories' };
  scene.add(crown); interactables.push(crown);
  const streamGeometry = new CylinderGeometry(.055, .08, 1.12, 7, 1, true);
  const streams = [];
  for (let i = 0; i < 4; i++) {
    const angle = i * Math.PI / 2 + Math.PI / 4;
    const stream = new Mesh(streamGeometry, materials.water);
    stream.position.set(Math.sin(angle) * .65, 2.48, Math.cos(angle) * .65);
    stream.rotation.z = Math.sin(angle) * .4; stream.rotation.x = Math.cos(angle) * .4;
    scene.add(stream); streams.push(stream);
  }
  const ripples = [1.35, 1.55, 1.78].map((radius, index) => {
    const ring = new Mesh(new TorusGeometry(radius, .018, 5, 24), materials.water);
    ring.rotation.x = Math.PI / 2; ring.position.y = 1.34 + index * .008;
    scene.add(ring); return ring;
  });
  const plinthCrest = new Mesh(new OctahedronGeometry(.22, 0), materials.silver);
  plinthCrest.position.set(0, .38, 2.38); plinthCrest.scale.set(.85, 1.05, .35);
  scene.add(plinthCrest);

  // Quiet winter gardens: clipped hedges, ruby roses, lanterns and a blue-eyed owl.
  for (const [x, z] of [[-8, -4], [-8, 4], [8, -4], [8, 4], [-4, -9], [4, -9], [-4, 9], [4, 9]]) {
    addCylinder('Carved stone garden urn', [x, .28, z], .56, .72, materials.stoneLight);
    addCylinder('Silver urn lip', [x, .6, z], .1, .77, materials.silver);
    addSphere('Clipped winter-green hedge', scene, [x, 1.05, z], [1.05, .86, 1.05], materials.leaf);
    addSphere('Ruby garden rose', scene, [x + .3, 1.62, z - .08], [.21, .21, .21], materials.rose, { id: 'rose', label: 'A winter ruby rose' });
  }
  const owl = new Group(); owl.name = 'Snow owl with blue eyes'; owl.position.set(-6.3, .3, 1.2); scene.add(owl);
  addSphere('Snow owl body', owl, [0, .76, 0], [.62, .84, .48], materials.owlWhite, { id: 'owl', label: 'The blue-eyed snow owl' });
  addSphere('Snow owl head', owl, [0, 1.45, -.12], [.62, .58, .55], materials.owlWhite, { id: 'owl', label: 'The blue-eyed snow owl' });
  for (const x of [-.2, .2]) {
    addSphere('Owl blue eye', owl, [x, 1.48, -.5], [.17, .17, .08], materials.eyeBlue, { id: 'owl', label: 'The blue-eyed snow owl' });
    addSphere('Owl pupil', owl, [x, 1.48, -.57], [.07, .1, .04], materials.pupil);
  }
  addCylinder('Owl golden beak', [0, 1.28, -.49], .22, .08, materials.gold);
  for (const x of [-.18, .18]) addSphere('Snow owl ear plume', owl, [x, 1.75, .02], [.12, .32, .12], materials.owlWhite);

  const gizmo = new Group(); gizmo.name = 'Gizmo'; gizmo.position.set(5.8, .04, 2.2); scene.add(gizmo);
  addSphere('Gizmo gray body', gizmo, [0, .45, 0], [.72, .55, 1], materials.catGray, { id: 'gizmo', label: 'Gizmo, your gray-and-white companion' });
  addSphere('Gizmo white chest', gizmo, [0, .45, -.5], [.47, .47, .18], materials.catWhite, { id: 'gizmo', label: 'Gizmo, your gray-and-white companion' });
  addSphere('Gizmo face', gizmo, [0, .87, -.58], [.48, .43, .43], materials.catGray, { id: 'gizmo', label: 'Gizmo, your gray-and-white companion' });
  addSphere('Gizmo white muzzle', gizmo, [0, .69, -.9], [.32, .2, .14], materials.catWhite);
  for (const x of [-.22, .22]) {
    const ear = new Mesh(new CylinderGeometry(.02, .17, .35, 7), materials.catGray); ear.position.set(x, 1.2, -.57); gizmo.add(ear);
    addSphere('Gizmo bright eye', gizmo, [x * .56, .91, -.96], [.09, .09, .05], materials.eyeBlue, { id: 'gizmo', label: 'Gizmo, your gray-and-white companion' });
    addSphere('Gizmo pupil', gizmo, [x * .56, .91, -1.01], [.035, .065, .025], materials.pupil);
    addSphere('Gizmo white paw', gizmo, [x * 1.12, .12, .19], [.22, .15, .34], materials.catWhite);
  }
  const tail = new Mesh(new TorusGeometry(.32, .09, 7, 16, Math.PI * 1.5), materials.catGray);
  tail.position.set(.48, .72, .38); tail.rotation.y = Math.PI / 2; gizmo.add(tail);

  // Snow uses a single draw call and is removed in Performance/reduced-motion modes.
  const snowGeometry = new BufferGeometry();
  const snowPositions = new Float32Array(90 * 3);
  for (let i = 0; i < 90; i++) {
    snowPositions[i * 3] = (Math.random() - .5) * 29;
    snowPositions[i * 3 + 1] = Math.random() * 10 + .5;
    snowPositions[i * 3 + 2] = (Math.random() - .5) * 29;
  }
  snowGeometry.setAttribute('position', new BufferAttribute(snowPositions, 3));
  const snow = new Points(snowGeometry, new PointsMaterial({ color: '#d9f2ff', size: .055, transparent: true, opacity: .72, depthWrite: false }));
  snow.name = 'Soft moonlit snow'; scene.add(snow);

  // Existing memory buttons remain the source of truth. This scene mirrors their
  // current visible collection and delegates selection back to the original UI.
  const memoryGeometry = new OctahedronGeometry(.33, 0);
  const memoryMaterials = {
    ordinary: new MeshStandardMaterial({ color: '#bb8af0', emissive: '#7037b0', emissiveIntensity: .85, metalness: .12, roughness: .22 }),
    milestone: new MeshStandardMaterial({ color: '#f4d9ff', emissive: '#9e53dc', emissiveIntensity: 1.2, metalness: .2, roughness: .18 })
  };
  const memoryMeshes = [];
  function syncMemoryCrystals() {
    for (const mesh of memoryMeshes) scene.remove(mesh);
    memoryMeshes.length = 0;
    for (let i = interactables.length - 1; i >= 0; i--) {
      if (interactables[i].userData.interaction?.id === 'memory') interactables.splice(i, 1);
    }
    const buttons = [...document.querySelectorAll('#fountain-crystal-pool .fountain-crystal')].slice(0, 12);
    buttons.forEach((button, index) => {
      const angle = (index / Math.max(1, buttons.length)) * Math.PI * 2;
      const milestone = button.classList.contains('milestone-crystal');
      const crystal = new Mesh(memoryGeometry, memoryMaterials[milestone ? 'milestone' : 'ordinary']);
      crystal.name = button.getAttribute('aria-label') || 'Saved memory crystal';
      crystal.position.set(Math.sin(angle) * 3.25, 1.1 + index % 3 * .08, Math.cos(angle) * 3.25);
      crystal.userData.interaction = { id: 'memory', label: button.title || button.getAttribute('aria-label'), button };
      scene.add(crystal); interactables.push(crystal); memoryMeshes.push(crystal);
    });
  }
  const pool = document.getElementById('fountain-crystal-pool');
  const memoryObserver = new MutationObserver(syncMemoryCrystals);
  memoryObserver.observe(pool, { childList: true });
  syncMemoryCrystals();

  const qualityStatus = { high: 'High', balanced: 'Balanced', performance: 'Performance' };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let active = true;
  let yaw = 0;
  let pitch = 0;
  let drag = null;
  let navigating = false;
  const keys = new Set();
  const held = new Set();
  const raycaster = new Raycaster();
  const pointer = new Vector2();
  const forward = new Vector3();
  const right = new Vector3();
  const lastFrame = { time: 0 };
  const maxPixelRatio = () => Math.min(window.devicePixelRatio || 1, 2) * qualityScale[quality];
  function resize() {
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    renderer.setPixelRatio(maxPixelRatio());
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  function setQuality(value, persist = true) {
    if (!Object.hasOwn(qualityScale, value)) return;
    quality = value;
    qualitySelect.value = value;
    snow.visible = !reducedMotion && value !== 'performance';
    lanternLights.forEach((light, index) => { light.visible = value !== 'performance' || index < 2; });
    renderer.setPixelRatio(maxPixelRatio());
    resize();
    if (persist) {
      try { localStorage.setItem(qualityKey, value); }
      catch { status.textContent = 'Applied for this visit; this browser could not save the graphics preference.'; }
    }
    status.textContent = `Walk the Moonlit Courtyard · ${qualityStatus[value]} detail · WASD/arrows to move · drag to look · E to inspect.`;
  }
  function insideCourtyard(x, z) {
    if (Math.abs(x) > 14.6 || Math.abs(z) > 14.6) return false;
    // Keep visitors out of the basin and its central supports, while leaving an
    // accessible circle of reachable floating memory crystals around the edge.
    if (Math.hypot(x, z) < 2.52) return false;
    for (const [px, pz] of [[-11.8, -7], [-11.8, 0], [-11.8, 7], [11.8, -7], [11.8, 0], [11.8, 7], [-7, -11.8], [7, -11.8], [-7, 11.8], [7, 11.8]]) {
      if (Math.hypot(x - px, z - pz) < .62) return false;
    }
    return true;
  }
  function move(dt) {
    const direction = new Vector3();
    if (keys.has('w') || keys.has('arrowup') || held.has('forward')) direction.z += 1;
    if (keys.has('s') || keys.has('arrowdown') || held.has('back')) direction.z -= 1;
    if (keys.has('a') || held.has('left')) direction.x -= 1;
    if (keys.has('d') || held.has('right')) direction.x += 1;
    if (!direction.lengthSq()) return;
    direction.normalize();
    forward.set(-Math.sin(yaw), 0, -Math.cos(yaw));
    right.set(Math.cos(yaw), 0, -Math.sin(yaw));
    const speed = 3.35 * Math.min(dt, .05);
    const nextX = camera.position.x + (right.x * direction.x + forward.x * direction.z) * speed;
    const nextZ = camera.position.z + (right.z * direction.x + forward.z * direction.z) * speed;
    if (insideCourtyard(nextX, camera.position.z)) camera.position.x = nextX;
    if (insideCourtyard(camera.position.x, nextZ)) camera.position.z = nextZ;
    if (Math.abs(camera.position.z) > 13.8) {
      const target = destinations.find(item => item.id === (camera.position.z < 0 ? 'north-gate' : 'south-gate'));
      if (Math.abs(camera.position.x) < 2.2) navigate(target);
    }
    if (Math.abs(camera.position.x) > 13.8) {
      const target = destinations.find(item => item.id === (camera.position.x < 0 ? 'west-gate' : 'east-gate'));
      if (Math.abs(camera.position.z) < 2.2) navigate(target);
    }
  }
  function scrollToMemories() {
    fountain.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    document.getElementById('fountain-save-here')?.focus({ preventScroll: true });
    status.textContent = 'The fountain’s memory gallery is open below. Save a courtyard moment or select a crystal to revisit its room.';
  }
  function navigate(target) {
    if (!target || navigating) return;
    navigating = true;
    status.textContent = `${target.label}…`;
    location.href = target.url;
  }
  function interact(interaction) {
    if (!interaction) return;
    if (interaction.id === 'fountain') { scrollToMemories(); return; }
    if (interaction.id === 'memory') {
      interaction.button?.click();
      status.textContent = `${interaction.label || 'Memory'} selected. Add a note or revisit the saved room in the gallery below.`;
      return;
    }
    if (interaction.url) { navigate(interaction); return; }
    const messages = {
      gizmo: 'Gizmo pads beside the fountain, ready to accompany you through the Academy. His gray-and-white coat catches the moonlight.',
      owl: 'The blue-eyed snow owl watches over the courtyard beneath the icy glass towers.',
      banner: `${interaction.label} flies above the courtyard, carrying one of the Academy’s four elemental house colours.`,
      glass: `${interaction.label} gleams in the moonlight above the old stone archways.`,
      rose: 'A winter rose blooms beneath a silver lantern beside the flagstone path.'
    };
    status.textContent = messages[interaction.id] || interaction.label || 'You discover a quiet detail in the Moonlit Courtyard.';
  }
  function inspectNearest() {
    let closest = null;
    for (const object of interactables) {
      const interaction = object.userData.interaction;
      if (!interaction) continue;
      const point = new Vector3(); object.getWorldPosition(point);
      const distance = point.distanceTo(camera.position);
      if (distance <= (interaction.id === 'gate' ? 5.4 : interaction.id === 'memory' ? 4.4 : 4.5) && (!closest || distance < closest.distance)) closest = { interaction, distance };
    }
    if (closest) interact(closest.interaction);
    else status.textContent = 'Move closer to the fountain, an amethyst crystal, Gizmo, the owl, a house banner, or a silver archway to inspect it.';
  }
  function inspectAt(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -((event.clientY - rect.top) / rect.height * 2 - 1));
    camera.rotation.set(pitch, yaw, 0, 'YXZ');
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(interactables, true).find(item => item.distance <= 9);
    if (hit) interact(hit.object.userData.interaction);
  }
  function onPointerDown(event) {
    if (event.button !== 0 && event.pointerType !== 'touch') return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
    canvas.setPointerCapture(event.pointerId);
  }
  function onPointerMove(event) {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true;
    yaw -= dx * .004;
    pitch = Math.max(-.52, Math.min(.52, pitch - dy * .003));
    drag.x = event.clientX; drag.y = event.clientY;
  }
  function onPointerUp(event) {
    if (!drag || drag.id !== event.pointerId) return;
    if (!drag.moved) inspectAt(event);
    drag = null;
  }
  function onKeyDown(event) {
    const key = event.key.toLowerCase();
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown'].includes(key) && !event.target.closest('button,select,a,input,textarea')) {
      event.preventDefault(); keys.add(key);
    }
    if (!event.target.closest('button,select,a,input,textarea') && key === 'arrowleft') { yaw += .045; }
    if (!event.target.closest('button,select,a,input,textarea') && key === 'arrowright') { yaw -= .045; }
    if (key === 'e' && !event.target.closest('button,select,a,input,textarea')) inspectNearest();
  }
  function onKeyUp(event) { keys.delete(event.key.toLowerCase()); }
  function setView(is3d) {
    active = is3d;
    document.body.classList.toggle('academy-courtyard-3d-active', active);
    canvas.hidden = !active;
    viewButton.textContent = active ? 'Return to illustrated courtyard' : 'Enter the 3D courtyard';
    controls.querySelector('.courtyard-3d-actions').hidden = !active;
    touch.hidden = !active;
    if (active) resize();
    status.textContent = active
      ? `Walk the Moonlit Courtyard · ${qualityStatus[quality]} detail · WASD/arrows to move · drag to look · E to inspect.`
      : 'Illustrated courtyard view · the original Fountain of Memories and castle destinations remain available.';
  }
  viewButton.addEventListener('click', () => setView(!active));
  qualitySelect.addEventListener('change', () => setQuality(qualitySelect.value));
  controls.querySelectorAll('[data-inspect]').forEach(button => button.addEventListener('click', () => {
    const id = button.dataset.inspect;
    if (id === 'fountain') scrollToMemories();
    else {
      const object = interactables.find(item => item.userData.interaction?.id === id);
      interact(object?.userData.interaction || { id, label: id === 'gizmo' ? 'Gizmo' : 'Snow owl' });
    }
  }));
  const touch = document.createElement('div');
  touch.className = 'courtyard-3d-touch';
  touch.setAttribute('role', 'group'); touch.setAttribute('aria-label', 'Move through the Moonlit Courtyard');
  touch.innerHTML = '<button type="button" data-walk="forward" aria-label="Walk forward">↑</button><button type="button" data-walk="left" aria-label="Step left">←</button><button type="button" data-walk="back" aria-label="Walk backward">↓</button><button type="button" data-walk="right" aria-label="Step right">→</button>';
  main.append(touch);
  touch.addEventListener('pointerdown', event => {
    const button = event.target.closest('button[data-walk]');
    if (!button) return;
    event.preventDefault();
    const direction = button.dataset.walk;
    const pressedAt = performance.now();
    const startX = camera.position.x, startZ = camera.position.z;
    held.add(direction); button.setPointerCapture(event.pointerId);
    const stop = () => {
      held.delete(direction);
      if (performance.now() - pressedAt < 180 && Math.hypot(camera.position.x - startX, camera.position.z - startZ) < .025) {
        held.add(direction); move(.12); held.delete(direction);
      }
    };
    button.addEventListener('pointerup', stop, { once: true });
    button.addEventListener('pointercancel', stop, { once: true });
    button.addEventListener('lostpointercapture', stop, { once: true });
  });

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', () => { drag = null; });
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('blur', () => { keys.clear(); held.clear(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { keys.clear(); held.clear(); } });
  new ResizeObserver(resize).observe(main);

  const animate = () => {
    requestAnimationFrame(animate);
    if (!active || document.hidden) { lastFrame.time = 0; return; }
    const now = performance.now();
    const dt = lastFrame.time ? Math.min(.05, Math.max(0, (now - lastFrame.time) / 1000)) : 0;
    lastFrame.time = now;
    move(dt);
    camera.rotation.set(pitch, yaw, 0, 'YXZ');
    if (!reducedMotion && quality !== 'performance') {
      for (let i = 0; i < snowPositions.length / 3; i++) {
        let y = snowPositions[i * 3 + 1] - dt * 1.1;
        if (y < .15) y = 10.5 + (i % 7) * .12;
        snowPositions[i * 3 + 1] = y;
      }
      snowGeometry.attributes.position.needsUpdate = true;
      ripples.forEach((ring, index) => { ring.scale.setScalar(1 + Math.sin(now * .0012 + index) * .018); });
      streams.forEach((stream, index) => { stream.material.opacity = .66 + Math.sin(now * .0015 + index) * .12; });
      gizmo.rotation.y = Math.sin(now * .00045) * .05;
    }
    memoryMeshes.forEach((crystal, index) => { if (!reducedMotion) crystal.position.y = 1.1 + index % 3 * .08 + Math.sin(now * .0014 + index) * .09; });
    renderer.render(scene, camera);
  };
  setView(true);
  setQuality(quality, false);
  window.academyMoonlitCourtyard3D = Object.freeze({
    diagnostics: () => ({
      ready: true, quality, position: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
      yaw, pitch, canvas: { width: canvas.width, height: canvas.height }, pixelRatio: renderer.getPixelRatio(),
      draws: renderer.info.render.calls, geometries: renderer.info.memory.geometries,
      textures: renderer.info.memory.textures, memoryCrystals: memoryMeshes.length,
      motionReduced: reducedMotion, snow: snow.visible
    }),
    inspect: inspectNearest,
    dispose: () => { memoryObserver.disconnect(); renderer.dispose(); }
  });
  requestAnimationFrame(animate);
})();

import {
  BoxGeometry, BufferGeometry, BufferAttribute, CanvasTexture, CatmullRomCurve3, Color,
  CylinderGeometry, DirectionalLight, DoubleSide, Fog, Group, HemisphereLight, LineBasicMaterial, LineSegments,
  Mesh, MeshBasicMaterial, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry,
  PointLight, Raycaster, Scene, SphereGeometry, SRGBColorSpace, TorusGeometry, TubeGeometry, Vector2, Vector3,
  WebGLRenderer
} from './vault-three.module.js?v=castle-great-hall-3d';
import { createRoyalRoomKit } from './academy-3d-architecture.js?v=1';

(() => {
  'use strict';
  const main = document.querySelector('main');
  const hall = document.querySelector('.hall');
  const heading = document.querySelector('.heading');
  if (!main || !hall || !heading || hall.querySelector('canvas')) return;

  const status = document.createElement('p');
  status.id = 'great-hall-3d-status';
  status.className = 'great-hall-3d-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.textContent = 'Preparing the walkable Great Hall…';

  const settings = document.createElement('div');
  settings.className = 'great-hall-3d-settings';
  settings.innerHTML = '<label for="great-hall-quality">3D detail</label><select id="great-hall-quality" aria-label="Great Hall graphics quality"><option value="high">High</option><option value="balanced">Balanced</option><option value="performance">Performance</option></select><button type="button" id="great-hall-view">Return to illustrated view</button>';
  heading.append(settings, status);

  const qualitySelect = settings.querySelector('select');
  const viewButton = settings.querySelector('button');
  const gizmoButton = document.createElement('button');
  gizmoButton.type = 'button';
  gizmoButton.dataset.discovery = 'gizmo';
  gizmoButton.setAttribute('aria-pressed', 'false');
  gizmoButton.setAttribute('aria-controls', 'hall-reveal');
  gizmoButton.textContent = 'Visit Gizmo';
  document.querySelector('.discoveries')?.append(gizmoButton);
  gizmoButton.addEventListener('click', () => {
    const reveal = document.getElementById('hall-reveal');
    if (!reveal) return;
    reveal.textContent = 'Gizmo pads quietly beside the royal tapestry, his gray-and-white coat bright in the icy window light. He is ready to accompany you toward the Library doors.';
    reveal.hidden = false;
    hall.dataset.royalFocus = 'owl';
  });
  document.querySelector('.discoveries')?.addEventListener('click', event => {
    const selected = event.target.closest('button[data-discovery]');
    if (!selected) return;
    document.querySelectorAll('.discoveries button[data-discovery]').forEach(button =>
      button.setAttribute('aria-pressed', String(button === selected)));
  });
  const qualityKey = 'bre-poetry-vault-heart-graphics-v1';
  const scales = { high: 1, balanced: .82, performance: .60 };
  let quality = 'high';
  try {
    const saved = localStorage.getItem(qualityKey);
    if (Object.hasOwn(scales, saved)) quality = saved;
  } catch {}
  qualitySelect.value = quality;

  const canvas = document.createElement('canvas');
  canvas.id = 'great-hall-3d-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.tabIndex = -1;
  hall.prepend(canvas);

  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' });
  } catch (error) {
    canvas.remove();
    status.textContent = '3D is unavailable in this browser. The illustrated Great Hall and every existing discovery and passage remain ready.';
    settings.classList.add('great-hall-3d-unavailable');
    settings.querySelector('label').hidden = true;
    qualitySelect.hidden = true;
    viewButton.hidden = true;
    console.info('Great Hall 3D unavailable; retaining the existing room.', error);
    return;
  }

  const scene = new Scene();
  scene.background = new Color('#11192e');
  scene.fog = new Fog('#11192e', 18, 39);
  const camera = new PerspectiveCamera(72, 1, .08, 55);
  camera.position.set(0, 1.68, 7.6);
  const ambient = new HemisphereLight('#d8eaff', '#30233d', 1.65);
  scene.add(ambient);
  const moon = new DirectionalLight('#c4e7ff', 2.35);
  moon.position.set(-4, 8, -4);
  scene.add(moon);
  const warm = new PointLight('#ffd5b2', 13, 11, 2);
  warm.position.set(0, 5.2, 0);
  scene.add(warm);

  const mats = {
    stone: new MeshStandardMaterial({ color: '#26364e', roughness: .88 }),
    stoneLight: new MeshStandardMaterial({ color: '#899ab5', roughness: .72, metalness: .08 }),
    silver: new MeshStandardMaterial({ color: '#d6e4f1', roughness: .28, metalness: .7 }),
    purple: new MeshStandardMaterial({ color: '#563879', roughness: .7 }),
    velvet: new MeshStandardMaterial({ color: '#682449', roughness: .94 }),
    red: new MeshStandardMaterial({ color: '#8e2948', roughness: .92 }),
    blueGlass: new MeshStandardMaterial({ color: '#89ddff', roughness: .16, metalness: .08, emissive: '#215878', emissiveIntensity: .75, side: DoubleSide }),
    amethystGlass: new MeshStandardMaterial({ color: '#a47cdb', roughness: .18, emissive: '#442568', emissiveIntensity: .55, side: DoubleSide }),
    rubyGlass: new MeshStandardMaterial({ color: '#d45b79', roughness: .18, emissive: '#5e1b36', emissiveIntensity: .55, side: DoubleSide }),
    darkWood: new MeshStandardMaterial({ color: '#392642', roughness: .84 }),
    gold: new MeshStandardMaterial({ color: '#c5a46c', roughness: .42, metalness: .58 }),
    ivory: new MeshStandardMaterial({ color: '#e8e7ee', roughness: .72 }),
    catGray: new MeshStandardMaterial({ color: '#858b98', roughness: .92 }),
    catWhite: new MeshStandardMaterial({ color: '#edf0f3', roughness: .95 }),
    eyeBlue: new MeshBasicMaterial({ color: '#42b9ff' }),
    black: new MeshBasicMaterial({ color: '#10131e' })
  };
  const clickable = [];
  const roomKit = createRoyalRoomKit({ BoxGeometry, CylinderGeometry, SphereGeometry, Mesh }, scene);
  const addBox = (name, x, y, z, sx, sy, sz, material, discovery, url) => {
    const mesh = roomKit.box({ name, position: [x, y, z], size: [sx, sy, sz], material });
    mesh.userData.discovery = discovery;
    if (url) mesh.userData.url = url;
    if (discovery || url) clickable.push(mesh);
    return mesh;
  };
  const addCylinder = (x, y, z, h, material, radius = .34) =>
    roomKit.cylinder({ position: [x, y, z], height: h, radius, material });
  const addSphere = (parent, x, y, z, sx, sy, sz, material) =>
    roomKit.sphere({ position: [x, y, z], size: [sx, sy, sz], material, parent });

  // A broad, softly lit stone floor, vaulted ceiling and low-cost grid of silver inlays.
  const floor = new Mesh(new PlaneGeometry(18, 22), mats.stone);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, -1);
  scene.add(floor);
  const inlayPositions = [];
  for (let x = -8; x <= 8; x += 2) inlayPositions.push(x, .009, -12, x, .009, 10);
  for (let z = -11; z <= 9; z += 2) inlayPositions.push(-9, .009, z, 9, .009, z);
  const inlayGeometry = new BufferGeometry();
  inlayGeometry.setAttribute('position', new BufferAttribute(new Float32Array(inlayPositions), 3));
  scene.add(new LineSegments(inlayGeometry, new LineBasicMaterial({ color: '#8294ad', transparent: true, opacity: .24 })));
  const ceiling = new Mesh(new PlaneGeometry(18, 22), mats.stone);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, 7, -1);
  scene.add(ceiling);
  addBox('west stone wall', -9, 3.5, -1, .5, 7, 22, mats.stone);
  addBox('east stone wall', 9, 3.5, -1, .5, 7, 22, mats.stone);
  addBox('rear stone wall', 0, 3.5, -12, 18, 7, .5, mats.stone);
  addBox('entrance stone wall', 0, 3.5, 10, 18, 7, .5, mats.stone);

  // Repeated Gothic piers and ribs use shared geometries and no shadow maps.
  for (const z of [6, 2, -2, -6, -10]) {
    for (const x of [-7.65, 7.65]) {
      addCylinder(x, 3.1, z, 6.2, mats.stoneLight, .34);
      addBox('capital', x, 6.18, z, 1.1, .32, 1.1, mats.silver);
    }
  }
  const vaultedRibGeometry = new TorusGeometry(4.1, .09, 6, 24, Math.PI);
  for (const z of [5, 0, -5, -10]) {
    addBox('vaulted rib', 0, 6.76, z, 15.8, .12, .18, mats.silver);
    for (const x of [-7.6, -4, 0, 4, 7.6]) {
      const rib = new Mesh(vaultedRibGeometry, mats.silver);
      rib.rotation.z = Math.PI;
      rib.position.set(x, 3.05, z);
      rib.scale.set(1, .91, 1);
      scene.add(rib);
    }
  }

  // Far-wall stained glass: four jewel tones recall the established house colours.
  addBox('silver window frame', 0, 4.35, -11.68, 5.1, 4.55, .26, mats.silver, 'window');
  addBox('icy stained glass', -1.55, 4.35, -11.48, 1.72, 3.75, .07, mats.blueGlass, 'window');
  addBox('amethyst stained glass', .0, 4.35, -11.47, 1.22, 3.75, .07, mats.amethystGlass, 'window');
  addBox('ruby stained glass', 1.48, 4.35, -11.48, 1.52, 3.75, .07, mats.rubyGlass, 'window');
  addBox('silver window mullion', 0, 4.35, -11.35, .12, 3.95, .12, mats.silver);
  addBox('silver window mullion', 0, 4.35, -11.34, 4.85, .12, .12, mats.silver);
  const windowCrown = new Mesh(new TorusGeometry(2.35, .12, 8, 28, Math.PI), mats.silver);
  windowCrown.position.set(0, 6.42, -11.5);
  windowCrown.rotation.z = Math.PI;
  scene.add(windowCrown);

  // Royal tapestry panels sit on each side wall, framed in silver.
  for (const [x, z, material] of [[-8.67, -3, mats.red], [8.67, -3, mats.purple]]) {
    const panel = addBox('royal tapestry', x, 3.55, z, .12, 3.1, 2.45, material, 'tapestry');
    panel.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2;
    const crest = addBox('tapestry crescent', x + (x < 0 ? .08 : -.08), 4, z, .08, .85, .68, mats.gold, 'tapestry');
    crest.rotation.y = panel.rotation.y;
  }

  // Headmaster's silver and amethyst throne, directly beneath the stained glass.
  addBox('royal throne base', 0, .35, -8.1, 2.4, .7, 1.5, mats.silver, 'throne');
  addBox('amethyst throne seat', 0, 1.05, -8.35, 1.75, .35, 1.1, mats.purple, 'throne');
  addBox('carved throne back', 0, 2.45, -8.8, 1.9, 2.5, .35, mats.purple, 'throne');
  addBox('throne silver crest', 0, 3.82, -8.57, .85, .18, .2, mats.gold, 'throne');
  for (const x of [-.9, .9]) addCylinder(x, 1.6, -7.85, 1.25, mats.silver, .11);

  // Silver chain, crystal pendants and warm candle light; no costly animated shadows.
  const chain = new Mesh(new TorusGeometry(1.55, .035, 6, 32, Math.PI * 2), mats.silver);
  chain.rotation.x = Math.PI / 2;
  chain.position.set(0, 5.18, 0);
  scene.add(chain);
  const chandelier = new Group();
  chandelier.position.set(0, 4.95, 0);
  chandelier.userData.discovery = 'chandelier';
  scene.add(chandelier);
  clickable.push(chandelier);
  for (let i = 0; i < 8; i++) {
    const angle = i / 8 * Math.PI * 2;
    const crystal = roomKit.sphere({ parent: chandelier, position: [Math.cos(angle) * 1.45, -.38, Math.sin(angle) * 1.45], size: [.11, .11, .11], material: mats.blueGlass });
  }

  // Four silk house banners carry their original elements and royal colours.
  const flags = [
    ['Amethyst', 'AIR', '#563879', '🌪'], ['Emberheart', 'FIRE', '#8e2948', '🔥'],
    ['Frosttopaz', 'WATER', '#205c8b', '🌊'], ['Silverthorn', 'EARTH', '#78619b', '🌳']
  ];
  const flagGeometry = new PlaneGeometry(1.7, 1.4);
  flags.forEach(([name, element, color, emblem], i) => {
    const side = i % 2 ? 1 : -1;
    const z = i < 2 ? 5.7 : -5.8;
    const x = side * 7.95;
    const cloth = document.createElement('canvas');
    cloth.width = 384; cloth.height = 320;
    const paint = cloth.getContext('2d');
    const sheen = paint.createLinearGradient(0, 0, 384, 0);
    sheen.addColorStop(0, color); sheen.addColorStop(.45, '#ffffff28'); sheen.addColorStop(1, '#08081788');
    paint.fillStyle = sheen; paint.fillRect(0, 0, 384, 320);
    paint.strokeStyle = '#d8e6f3'; paint.lineWidth = 10; paint.strokeRect(8, 8, 368, 304);
    paint.strokeStyle = '#f7efff'; paint.lineWidth = 2; paint.strokeRect(20, 20, 344, 280);
    paint.textAlign = 'center'; paint.textBaseline = 'middle';
    paint.fillStyle = '#f8f1ff'; paint.shadowColor = '#080615'; paint.shadowBlur = 8;
    paint.font = '68px Georgia, serif'; paint.fillText(emblem, 192, 115);
    paint.font = 'bold 32px Georgia, serif'; paint.fillText(name, 192, 220);
    paint.font = 'bold 22px Georgia, serif'; paint.fillText(element, 192, 270);
    const textile = new CanvasTexture(cloth); textile.colorSpace = SRGBColorSpace;
    const banner = new Mesh(flagGeometry, new MeshStandardMaterial({ map: textile, roughness: .9, side: DoubleSide }));
    banner.position.set(x, 4.85, z); banner.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
    banner.name = name + ' silk flag'; banner.userData.discovery = 'tapestry';
    scene.add(banner); clickable.push(banner);
    addBox(name + ' flag pole', x, 5.6, z, .09, .12, 1.9, mats.silver);
  });

  // The east-wing doorway is a real navigable threshold; the matching HTML links remain.
  addBox('east wing door', 8.65, 2.15, 5.2, .13, 3.5, 2.7, mats.darkWood, null, 'academy-enchanted-east-wing.html');
  addBox('east wing door silver frame left', 8.53, 2.15, 3.72, .15, 3.9, .18, mats.silver);
  addBox('east wing door silver frame right', 8.53, 2.15, 6.68, .15, 3.9, .18, mats.silver);
  addBox('east wing door silver lintel', 8.53, 4.02, 5.2, .15, .18, 3.05, mats.silver);
  addBox('east wing door inset', 8.43, 2.12, 5.2, .08, 2.9, 2.2, mats.purple, null, 'academy-enchanted-east-wing.html');
  const doorHandle = roomKit.sphere({ name: 'East Wing silver door handle', position: [8.34, 1.7, 5.2], size: [.11, .11, .11], material: mats.gold });
  doorHandle.userData.url = 'academy-enchanted-east-wing.html';
  clickable.push(doorHandle);

  // A small companion model keeps Gizmo present in the walkable room.
  const gizmo = new Group();
  gizmo.name = 'Gizmo';
  gizmo.position.set(2.35, .05, -1.3);
  gizmo.userData.discovery = 'gizmo';
  addSphere(gizmo, 0, .38, 0, .55, .35, .75, mats.catGray);
  addSphere(gizmo, 0, .68, -.48, .4, .38, .38, mats.catGray);
  addSphere(gizmo, 0, .63, -.78, .28, .28, .16, mats.catWhite);
  for (const x of [-.27, .27]) {
    const ear = new Mesh(new CylinderGeometry(.03, .18, .38, 7), mats.catGray);
    ear.position.set(x, .99, -.52);
    ear.rotation.z = x < 0 ? .17 : -.17;
    gizmo.add(ear);
    addSphere(gizmo, x * .47, .7, -.9, .07, .07, .06, mats.eyeBlue);
    addSphere(gizmo, x * .47, .7, -.955, .028, .045, .02, mats.black);
  }
  addSphere(gizmo, 0, .48, -.92, .05, .04, .025, mats.red);
  for (const x of [-.31, .31]) addBox('Gizmo white paw', x, .12, .18, .21, .18, .28, mats.catWhite);
  const tailCurve = new CatmullRomCurve3([
    new Vector3(0, .38, .58), new Vector3(.2, .55, .94), new Vector3(.12, .96, 1.14), new Vector3(-.1, 1.15, .96)
  ]);
  const tail = new Mesh(new TubeGeometry(tailCurve, 12, .09, 7, false), mats.catGray);
  gizmo.add(tail);
  gizmo.traverse(object => { if (object.isMesh) object.userData.discovery = 'gizmo'; });
  scene.add(gizmo);
  clickable.push(gizmo.children.find(object => object.isMesh));

  const receiver = document.createElement('div');
  receiver.className = 'great-hall-3d-touch';
  receiver.setAttribute('role', 'group');
  receiver.setAttribute('aria-label', 'Walk through the Great Hall in 3D');
  receiver.innerHTML = '<button type="button" data-walk="forward" aria-label="Walk forward">↑</button><button type="button" data-walk="left" aria-label="Step left">←</button><button type="button" data-walk="back" aria-label="Walk backward">↓</button><button type="button" data-walk="right" aria-label="Step right">→</button>';
  main.append(receiver);

  const keys = new Set();
  const raycaster = new Raycaster();
  const pointer = new Vector2();
  let yaw = 0, pitch = 0, drag = null, active = true;
  const forward = new Vector3(), right = new Vector3();
  const held = new Set();
  const discoveryButtons = new Map([...document.querySelectorAll('[data-discovery]')].map(button => [button.dataset.discovery, button]));
  const reveal = document.getElementById('hall-reveal');
  const discoveryText = {
    gizmo: 'Gizmo pads quietly beside the royal tapestry, his gray-and-white coat bright in the icy window light. He is ready to accompany you toward the Library doors.',
    tapestry: 'The royal tapestry is woven in ruby red and deep amethyst. Silver threads form a crescent above a crown. It is an emblem of the Academy, not a puzzle lock.',
    window: 'The stained-glass window glows icy blue, purple, and red. When moonlight crosses the floor, the silver stars seem to shimmer.',
    throne: 'The throne is carved in silver and deep amethyst, beneath the crescent seal of the Academy. Here Headmaster Breezy receives honoured guests before their first royal quest.'
  };
  function focusDiscovery(id) {
    if (id === 'gizmo') {
      discoveryButtons.get('gizmo')?.click();
      return;
    }
    const button = discoveryButtons.get(id);
    if (button) button.click();
  }
  function resize() {
    const width = Math.max(1, window.innerWidth), height = Math.max(1, window.innerHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2) * scales[quality];
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  function setQuality(value) {
    if (!Object.hasOwn(scales, value)) return;
    quality = value;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2) * scales[value]);
    resize();
    try { localStorage.setItem(qualityKey, value); } catch { status.textContent = 'Applied for this visit; this browser could not save the graphics preference.'; }
    status.textContent = `Walkable Great Hall · ${value === 'high' ? 'High' : value === 'balanced' ? 'Balanced' : 'Performance'} detail · WASD or the arrows to walk · drag to look · E to inspect.`;
  }
  function move(dt) {
    const moving = new Vector3();
    if (keys.has('w') || keys.has('arrowup') || held.has('forward')) moving.z += 1;
    if (keys.has('s') || keys.has('arrowdown') || held.has('back')) moving.z -= 1;
    if (keys.has('a') || held.has('left')) moving.x -= 1;
    if (keys.has('d') || held.has('right')) moving.x += 1;
    if (!moving.lengthSq()) return;
    moving.normalize();
    forward.set(-Math.sin(yaw), 0, -Math.cos(yaw));
    right.set(Math.cos(yaw), 0, -Math.sin(yaw));
    const speed = 3.1 * Math.min(dt, .05);
    const dx = (right.x * moving.x + forward.x * moving.z) * speed;
    const dz = (right.z * moving.x + forward.z * moving.z) * speed;
    const nextX = camera.position.x + dx, nextZ = camera.position.z + dz;
    // Keep the wanderer within the hall and clear of the stone piers and throne.
    const clear = (x, z) => {
      if (Math.abs(x) > 8.05 || z < -11.45 || z > 9.35) return false;
      if (x > 7.45 && z > 3.5 && z < 6.9) return false;
      if (Math.abs(x) < 1.35 && z < -7.2 && z > -9.5) return false;
      for (const px of [-7.65, 7.65]) for (const pz of [6, 2, -2, -6, -10]) {
        if (Math.hypot(x - px, z - pz) < .62) return false;
      }
      return true;
    };
    if (clear(nextX, camera.position.z)) camera.position.x = nextX;
    if (clear(camera.position.x, nextZ)) camera.position.z = nextZ;
  }
  function onPointerDown(event) {
    if (event.button !== 0 && event.pointerType !== 'touch') return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
    canvas.setPointerCapture(event.pointerId);
  }
  function onPointerMove(event) {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true;
    yaw -= dx * .004;
    pitch = Math.max(-.48, Math.min(.48, pitch - dy * .003));
    drag.x = event.clientX;
    drag.y = event.clientY;
  }
  function onPointerUp(event) {
    if (!drag || drag.id !== event.pointerId) return;
    const moved = drag.moved;
    drag = null;
    if (!moved) inspectAt(event);
  }
  function inspectAt(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -((event.clientY - rect.top) / rect.height * 2 - 1));
    camera.rotation.set(pitch, yaw, 0, 'YXZ');
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(clickable, true)[0]?.object;
    if (!hit) return;
    if (raycaster.ray.origin.distanceTo(hit.point) > 8) return;
    const item = hit;
    let node = item;
    while (node && !node.userData.discovery && !node.userData.url) node = node.parent;
    if (!node) return;
    if (node.userData.url) { location.href = node.userData.url; return; }
    if (node.userData.discovery) focusDiscovery(node.userData.discovery);
  }
  function keyDown(event) {
    const key = event.key.toLowerCase();
    if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key) && !event.target.closest('button,select,a,input,textarea')) {
      event.preventDefault();
      keys.add(key);
    }
    if (key === 'arrowleft' && !event.target.closest('button,select,a,input,textarea')) yaw += .035;
    if (key === 'arrowright' && !event.target.closest('button,select,a,input,textarea')) yaw -= .035;
    if (key === 'e') {
      const nearby = clickable.map(object => {
        const point = new Vector3();
        object.getWorldPosition(point);
        return { object, point, distance: point.distanceTo(camera.position) };
      }).filter(item => item.distance < 2.8).sort((a, b) => a.distance - b.distance)[0];
      let target = nearby?.object;
      while (target && !target.userData.discovery && !target.userData.url) target = target.parent;
      if (target?.userData.url) location.href = target.userData.url;
      else if (target?.userData.discovery) focusDiscovery(target.userData.discovery);
      else status.textContent = 'No object is close enough to inspect. Walk toward the throne, stained glass, tapestries, or Gizmo.';
    }
  }
  function keyUp(event) { keys.delete(event.key.toLowerCase()); }
  function setView(is3d) {
    active = is3d;
    main.classList.toggle('academy-great-hall-3d-active', is3d);
    canvas.hidden = !is3d;
    receiver.hidden = !is3d;
    viewButton.textContent = is3d ? 'Return to illustrated view' : 'Enter the 3D Great Hall';
    status.textContent = is3d
      ? `Walkable Great Hall · ${quality === 'high' ? 'High' : quality === 'balanced' ? 'Balanced' : 'Performance'} detail · WASD or the arrows to walk · drag to look · E to inspect.`
      : 'Illustrated Great Hall view · all existing discoveries and passages remain available.';
    if (is3d) resize();
  }
  viewButton.addEventListener('click', () => setView(!active));
  qualitySelect.addEventListener('change', () => setQuality(qualitySelect.value));
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', () => { drag = null; });
  window.addEventListener('keydown', keyDown);
  window.addEventListener('keyup', keyUp);
  window.addEventListener('blur', () => { keys.clear(); held.clear(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { keys.clear(); held.clear(); } });
  receiver.addEventListener('pointerdown', event => {
    const button = event.target.closest('button[data-walk]');
    if (!button) return;
    event.preventDefault();
    const direction = button.dataset.walk;
    const pressedAt = performance.now();
    const startX = camera.position.x, startZ = camera.position.z;
    held.add(direction);
    button.setPointerCapture(event.pointerId);
    const stop = () => {
      held.delete(direction);
      // A brief tap can begin and end between rendered frames. Make it a small
      // deliberate step so touch controls work for tap users as well as holds.
      if (performance.now() - pressedAt < 180 && Math.hypot(camera.position.x - startX, camera.position.z - startZ) < .025) {
        held.add(direction);
        move(.12);
        held.delete(direction);
      }
    };
    button.addEventListener('pointerup', stop, { once: true });
    button.addEventListener('pointercancel', stop, { once: true });
    button.addEventListener('lostpointercapture', stop, { once: true });
  });
  window.addEventListener('resize', resize, { passive: true });
  if (window.ResizeObserver) new ResizeObserver(resize).observe(hall);

  const animate = () => {
    requestAnimationFrame(animate);
    if (!active || document.hidden) return;
    const now = performance.now();
    const dt = Math.min(.05, Math.max(0, (now - (animate.last || now)) / 1000));
    animate.last = now;
    move(dt);
    camera.rotation.set(pitch, yaw, 0, 'YXZ');
    renderer.render(scene, camera);
  };
  resize();
  setView(true);
  setQuality(quality);
  window.academyGreatHall3D = Object.freeze({
    diagnostics: () => ({
      ready: true, quality, position: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
      yaw, pitch, canvas: { width: canvas.width, height: canvas.height },
      pixelRatio: renderer.getPixelRatio(), draws: renderer.info.render.calls,
      geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures
    })
  });
  requestAnimationFrame(animate);
})();

const {test,expect}=require('@playwright/test');
const base='http://127.0.0.1:8765/';
const routes=['poetry-vault-entrance.html','academy-royal-great-hall.html','academy-four-houses.html','academy-house-amethyst.html','academy-house-emberheart.html','academy-house-frostveil.html','academy-house-silverthorn.html','academy-royal-backpack.html?house=amethyst'];
for(const route of routes){test('page loads: '+route,async({page})=>{const errors=[];page.on('pageerror',e=>errors.push(e.message));const response=await page.goto(base+route,{waitUntil:'domcontentloaded'});expect(response.status()).toBe(200);await page.waitForTimeout(500);expect(errors,'Runtime errors on '+route).toEqual([])})}
test('3D chamber initializes and each house portal can be entered',async({page})=>{const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'academy-royal-3d.html');await expect(page.locator('#renderCanvas')).toBeVisible();await expect(page.locator('#status')).toContainText('ready',{timeout:30000});const doors=[['Amethyst',-10.9,-2,'academy-house-amethyst.html'],['Emberheart',10.9,-2,'academy-house-emberheart.html'],['Frosttopaz',-10.9,5,'academy-house-frostveil.html'],['Silverthorn',10.9,5,'academy-house-silverthorn.html']];for(const [name,x,z] of doors){await page.evaluate(([x,z])=>{const scene=BABYLON.EngineStore.LastCreatedScene;if(!scene)throw Error('No Babylon scene');scene.activeCamera.position.x=x;scene.activeCamera.position.z=z;},[x,z]);await expect(page.getByRole('button',{name:new RegExp('Enter '+name)})).toBeVisible({timeout:5000})}await page.getByRole('button',{name:/Enter Silverthorn/}).click();await expect(page).toHaveURL(new RegExp('academy-house-silverthorn\\.html'));expect(errors).toEqual([])});
test('mobile directional controls render',async({page})=>{await page.setViewportSize({width:390,height:844});await page.goto(base+'academy-royal-3d.html');await expect(page.locator('[data-move="forward"]')).toBeVisible();await expect(page.locator('[data-move="left"]')).toBeVisible();await expect(page.locator('[data-move="back"]')).toBeVisible();await expect(page.locator('[data-move="right"]')).toBeVisible()});

test('backpack keeps each house gifts after reload and does not overwrite vault saves',async({page})=>{await page.goto(base+'academy-royal-backpack.html?house=amethyst');await page.evaluate(()=>{localStorage.removeItem('bre-royal-backpack-v1');localStorage.setItem('castle-test-vault-sentinel','keep-this')});await page.reload();await expect(page.locator('#house')).toHaveValue('amethyst');await page.locator('#open').click();await expect(page.locator('#items .item')).toHaveCount(6);await page.reload();await expect(page.locator('#items .item')).toHaveCount(6);await page.locator('#house').selectOption('emberheart');await expect(page.locator('#contents')).toBeHidden();await page.locator('#open').click();await expect(page.locator('#items .item')).toHaveCount(6);await page.reload();await page.locator('#house').selectOption('amethyst');await expect(page.locator('#items .item')).toHaveCount(6);expect(await page.evaluate(()=>localStorage.getItem('castle-test-vault-sentinel'))).toBe('keep-this')});

for(const [house,slug] of [['Amethyst','amethyst'],['Emberheart','emberheart'],['Frosttopaz','frostveil'],['Silverthorn','silverthorn']]){test('Gizmo and castle passages work in '+house+' bedroom',async({page})=>{await page.goto(base+'academy-house-'+slug+'.html');const room=page.locator('.royal-bedroom-backpack').first();await expect(room).toBeVisible();const summon=page.getByRole('button',{name:'Call Gizmo'}).first();await expect(summon).toBeVisible();await summon.click();const cat=page.locator('img.royal-room-cat').first();await expect(cat).toBeVisible();expect(await cat.evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);await page.getByRole('button',{name:'Dim the chandeliers'}).first().click();await expect(room.locator('.royal-scene')).toHaveClass(/royal-dimmed/);const passages=page.locator('nav.royal-room-passages').first();await expect(passages.getByRole('link',{name:/Great Hall/})).toHaveAttribute('href','academy-royal-great-hall.html');await expect(passages.getByRole('link',{name:/Castle Grounds/})).toHaveAttribute('href','academy-royal-castle-grounds.html');await expect(passages.getByRole('link',{name:/Four Houses/})).toHaveAttribute('href','academy-four-houses.html')})}
test('Poetry Vault entrance remains accessible without modifying existing save keys',async({page})=>{await page.goto(base+'poetry-vault-entrance.html');await page.evaluate(()=>localStorage.setItem('castle-test-preserved-save','original-value'));await page.reload();expect(await page.evaluate(()=>localStorage.getItem('castle-test-preserved-save'))).toBe('original-value');await expect(page.locator('a[href="poetry-vault.html"]').first()).toHaveCount(1)});

test('3D keyboard portal interaction opens the correct house',async({page})=>{await page.goto(base+'academy-royal-3d.html');await expect(page.locator('#status')).toContainText('ready',{timeout:30000});await page.evaluate(()=>{const scene=BABYLON.EngineStore.LastCreatedScene;scene.activeCamera.position.set(-10.9,1.75,-2)});await expect(page.getByRole('button',{name:/Enter Amethyst/})).toBeVisible();await page.keyboard.press('e');await expect(page).toHaveURL(/academy-house-amethyst\.html/)});
test('touch movement advances the player and stops on release',async({page},testInfo)=>{
 await page.setViewportSize({width:390,height:844});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'academy-royal-3d.html');
 await expect(page.locator('#status')).toContainText('ready',{timeout:30000});
 const inspect=()=>page.evaluate(()=>{
  const scene=BABYLON.EngineStore.LastCreatedScene,camera=scene?.activeCamera;
  return {position:camera?{x:camera.position.x,y:camera.position.y,z:camera.position.z}:null,
   cameraCollision:camera?.checkCollisions,sceneCollision:scene?.collisionsEnabled,
   button:document.querySelector('[data-move="forward"]')?.getBoundingClientRect().toJSON(),
   status:document.querySelector('#status')?.textContent};
 });
 const before=await inspect(),button=page.locator('[data-move="forward"]');
 await expect(button).toBeVisible();
 const bounds=await button.boundingBox();expect(bounds).not.toBeNull();
 await page.mouse.move(bounds.x+bounds.width/2,bounds.y+bounds.height/2);
 await page.mouse.down();
 let moving;
 try{
  await page.waitForTimeout(1000);
  moving=await inspect();
 }finally{await page.mouse.up()}
 await page.waitForTimeout(250);
 const stopped=await inspect();
 await page.waitForTimeout(500);
 const after=await inspect();
 await testInfo.attach('movement-diagnostics',{body:JSON.stringify({before,moving,stopped,after,errors},null,2),contentType:'application/json'});
 const distance=(a,b)=>Math.hypot(a.position.x-b.position.x,a.position.z-b.position.z);
 expect(distance(before,moving),'Holding the forward control should move the camera').toBeGreaterThan(.1);
 expect(distance(stopped,after),'Releasing the control should stop movement').toBeLessThan(.08);
});

test('3D castle walls block the player from walking outside',async({page})=>{await page.goto(base+'academy-royal-3d.html');await expect(page.locator('#status')).toContainText('ready',{timeout:30000});await page.evaluate(()=>{const scene=BABYLON.EngineStore.LastCreatedScene;const camera=scene.activeCamera;camera.position.set(0,1.75,10);camera.rotation.set(0,0,0)});await page.locator('#renderCanvas').focus();await page.keyboard.down('w');await page.waitForTimeout(1600);await page.keyboard.up('w');const position=await page.evaluate(()=>{const p=BABYLON.EngineStore.LastCreatedScene.activeCamera.position;return {x:p.x,z:p.z}});expect(position.z).toBeLessThan(11.8);expect(position.z).toBeGreaterThan(10)});

// Full chapter-route coverage is a prerequisite to a puzzle-solving playthrough.
for(const chapter of ['poetry-vault.html','poetry-vault-mirror.html','poetry-vault-labyrinth.html','poetry-vault-dawn.html','poetry-vault-society.html','poetry-vault-fifth-door.html','poetry-vault-author-room.html']){
  test('Poetry Vault chapter loads without a JavaScript crash: '+chapter,async({page})=>{
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    const response=await page.goto(base+chapter,{waitUntil:'domcontentloaded'});
    expect(response?.status(),chapter+' should exist').toBe(200);
    await expect(page.locator('body')).toBeVisible();
    await page.waitForTimeout(750);
    expect(errors,'JavaScript errors in '+chapter).toEqual([]);
  });
}

// Use a fresh browser context for each test: never manufacture puzzle completion or change real player saves.
test('new visitor cannot skip directly to the Fifth Door through castle passage',async({page})=>{
  await page.goto(base+'poetry-vault-entrance.html');
  const passage=page.locator('#pv155-bridge');
  await expect(passage).toBeVisible({timeout:15000});
  await passage.locator('.pv155-open').click();
  await passage.locator('.pv192-map-toggle').click();
  const fifth=passage.getByRole('button',{name:/Fifth Door, locked/});
  await expect(fifth).toBeDisabled();
  await expect(passage.locator('.pv192-progress')).toContainText('Seals found: 0 / 4');
  await expect(passage.getByRole('button',{name:/Author’s Study, locked/})).toBeDisabled();
});

test('castle passage closes with Escape without navigating or changing saves',async({page})=>{
  await page.goto(base+'poetry-vault-entrance.html');
  const passage=page.locator('#pv155-bridge');
  await expect(passage).toBeVisible({timeout:15000});
  await passage.locator('.pv155-open').click();
  await expect(passage.locator('.pv155-panel')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(passage.locator('.pv155-panel')).toBeHidden();
  await expect(page).toHaveURL(/poetry-vault-entrance\.html/);
});

test('fresh-player Fifth Door stays gated after reload',async({page})=>{
  await page.goto(base+'poetry-vault-fifth-door.html');
  await expect(page.locator('#gate')).toBeVisible();
  await expect(page.locator('#game')).toBeHidden();
  await page.reload();
  await expect(page.locator('#gate')).toBeVisible();
  await expect(page.locator('#game')).toBeHidden();
});

test('fresh-player chapter locks survive reload without losing castle passage',async({page})=>{
  await page.goto(base+'poetry-vault-entrance.html');
  for(let attempt=0;attempt<2;attempt++){
    const passage=page.locator('#pv155-bridge');
    await expect(passage).toBeVisible({timeout:15000});
    await passage.locator('.pv155-open').click();
    await passage.locator('.pv192-map-toggle').click();
    await expect(passage.getByRole('button',{name:/Fifth Door, locked/})).toBeDisabled();
    await expect(passage.getByRole('button',{name:/Author’s Study, locked/})).toBeDisabled();
    if(attempt===0)await page.reload();
  }
});

test('completed-chapter fixture solves Fifth Door puzzles through actual UI and reaches Author Study',async({page})=>{
  // Synthetic browser-only save states are normalized by the same game code as real saves.
  await page.addInitScript(()=>{
    const fixture={
      'bre-poetry-vault-heart-v1':{found:['rose','ribbon','moon','key'],drawerOpen:true,diaryOpen:true,completed:true},
      'bre-poetry-vault-mirror-v1':{found:['thorn','tear','veil','ember'],slots:['tear','ember','thorn','veil'],turns:{thorn:0,tear:0,veil:0,ember:0},restored:true,unlocked:true,completed:true},
      'bre-poetry-vault-labyrinth-v1':{noteRead:true,gearInstalled:true,hour:3,minute:0,clockSet:true,found:['ash','ivy','bell','star'],slots:['ivy','star','bell','ash'],unlocked:true,completed:true},
      'bre-poetry-vault-dawn-v1':{emblemPlaced:true,panels:['star','moon','horizon','sun'],turns:{star:0,moon:0,horizon:0,sun:0},lightAligned:true,found:['bloom','leaf','seed','rain'],book:['seed','rain','leaf','bloom'],unlocked:true,completed:true},
      'bre-poetry-vault-keepsakes-v1':{secrets:['heart','mirror','labyrinth','dawn']}
    };
    for(const [key,value] of Object.entries(fixture))if(localStorage.getItem(key)===null)localStorage.setItem(key,JSON.stringify(value));
  });
  await page.goto(base+'poetry-vault-fifth-door.html');
  await expect(page.locator('#game')).toBeVisible({timeout:15000});
  for(const seal of ['heart','mirror','labyrinth','dawn'])await page.locator('[data-seal="'+seal+'"]').click();
  await expect(page.locator('#step-2')).toHaveClass(/active/);
  for(const [dial,turns] of [[0,1],[1,3],[2,2]])for(let i=0;i<turns;i++)await page.locator('[data-dial="'+dial+'"]').click();
  await page.locator('#align').click();
  await expect(page.locator('#step-3')).toHaveClass(/active/);
  for(const word of ['LISTEN','REMEMBER','RELEASE','BEGIN'])await page.locator('[data-word="'+word+'"]').click();
  await expect(page.locator('#step-4')).toHaveClass(/active/);
  await expect(page.getByRole('link',{name:/Enter the Author/})).toBeVisible();
  await page.getByRole('link',{name:/Enter the Author/}).click();
  await expect(page).toHaveURL(/poetry-vault-author-room\.html/);
});

test('original chamber progress normalizes and survives a cross-chapter reload',async({page})=>{
  test.setTimeout(120000);
  await page.goto(base+'poetry-vault-entrance.html');
  const report=await page.evaluate(async()=>{
    const [{readJourney},{societyStats}]=await Promise.all([import('./vault-journey.js'),import('./vault-society.js')]);
    const read=()=>readJourney(key=>localStorage.getItem(key));
    const fresh=read();
    const stages=[
      ['bre-poetry-vault-heart-v1',{found:['rose','ribbon','moon','key'],drawerOpen:true,diaryOpen:true,completed:true}],
      ['bre-poetry-vault-mirror-v1',{found:['thorn','tear','veil','ember'],slots:['tear','ember','thorn','veil'],turns:{thorn:0,tear:0,veil:0,ember:0},restored:true,unlocked:true,completed:true}],
      ['bre-poetry-vault-labyrinth-v1',{noteRead:true,gearInstalled:true,hour:3,minute:0,clockSet:true,found:['ash','ivy','bell','star'],slots:['ivy','star','bell','ash'],unlocked:true,completed:true}],
      ['bre-poetry-vault-dawn-v1',{emblemPlaced:true,panels:['star','moon','horizon','sun'],turns:{star:0,moon:0,horizon:0,sun:0},lightAligned:true,found:['bloom','leaf','seed','rain'],book:['seed','rain','leaf','bloom'],unlocked:true,completed:true}]
    ];
    const progress=[];
    for(const [key,state] of stages){localStorage.setItem(key,JSON.stringify(state));progress.push(read().completed.filter(Boolean).length);}
    const beforeSeals=societyStats().seals.length;
    localStorage.setItem('bre-poetry-vault-keepsakes-v1',JSON.stringify({secrets:['heart','mirror','labyrinth','dawn']}));
    return {fresh:fresh.completed.filter(Boolean).length,progress,beforeSeals,afterSeals:societyStats().seals.length};
  });
  expect(report).toEqual({fresh:0,progress:[1,2,3,4],beforeSeals:0,afterSeals:4});
  await page.reload();
  const after=await page.evaluate(async()=>{
    const {societyStats}=await import('./vault-society.js');
    const s=societyStats();
    return {complete:s.journey.allComplete,seals:s.seals.length};
  });
  expect(after).toEqual({complete:true,seals:4});
  for (const [chapter, object] of [['mirror', 'thorn'], ['labyrinth', 'note'], ['dawn', 'window']]) {
    await page.goto(base + 'poetry-vault-' + chapter + '.html?resume=1', {waitUntil:'domcontentloaded'});
    if (await page.locator('#start').isVisible()) await page.locator('#start').click();
    await page.locator('#explore').click();
    await page.locator('[data-object="' + object + '"]').press('Enter');
    await expect(page.locator('#panel-title')).toBeFocused();
  }
  await page.goto(base+'poetry-vault-fifth-door.html');
  await expect(page.locator('#game')).toBeVisible({timeout:15000});
});

test('all four original chamber puzzle rules reject incorrect solutions and accept correct ones',async({page})=>{
 await page.goto(base+'poetry-vault-entrance.html');
 const result=await page.evaluate(async()=>{
  const [heart,mirror,labyrinth,dawn]=await Promise.all([
   import('./vault-state.js'),import('./vault-mirror-state.js'),import('./vault-labyrinth-state.js'),import('./vault-dawn-state.js')
  ]);
  const h=heart.normalizeState({found:heart.LETTERS,drawerOpen:true,diaryOpen:true,completed:true});
  const m=mirror.normalizeMirrorState({found:mirror.FRAGMENTS,slots:mirror.MIRROR_LAYOUT,turns:{thorn:0,tear:0,veil:0,ember:0},restored:true,unlocked:true,completed:true});
  const l=labyrinth.normalizeLabyrinthState({noteRead:true,gearInstalled:true,hour:3,minute:0,clockSet:true,found:labyrinth.PAGE_IDS,slots:labyrinth.LEDGER_ORDER,unlocked:true,completed:true});
  const d=dawn.normalizeDawnState({emblemPlaced:true,panels:dawn.PANEL_IDS,turns:{star:0,moon:0,horizon:0,sun:0},lightAligned:true,found:dawn.PAGE_IDS,book:dawn.BOOK_ORDER,unlocked:true,completed:true});
  return {
   heart:h.completed&&heart.canOpenDrawer(h,'3142')&&!heart.canOpenDrawer(h,'0000')&&heart.canOpenDiary(h,heart.DIARY_ORDER)&&!heart.canOpenDiary(h,[...heart.DIARY_ORDER].reverse()),
   mirror:m.completed&&mirror.isRestored(m.found,m.slots,m.turns)&&mirror.canAnswerReflection(m,'echo')&&!mirror.canAnswerReflection(m,'shadow'),
   labyrinth:l.completed&&labyrinth.canSetClock(l)&&labyrinth.canOpenLedger(l)&&!labyrinth.canSetClock({...l,hour:4})&&!labyrinth.isMazePassable(-2,3.1),
   dawn:d.completed&&dawn.panelsAligned(d)&&!dawn.panelsAligned({...d,turns:{...d.turns,star:1}})&&dawn.canOpenBook(d)&&!dawn.canOpenBook({...d,book:[...d.book].reverse()}),
   invalidHeart:heart.normalizeState({completed:true}).completed,
   invalidMirror:mirror.normalizeMirrorState({completed:true}).completed,
   invalidLabyrinth:labyrinth.normalizeLabyrinthState({completed:true}).completed,
   invalidDawn:dawn.normalizeDawnState({completed:true}).completed
  };
 });
 expect(result).toEqual({heart:true,mirror:true,labyrinth:true,dawn:true,invalidHeart:false,invalidMirror:false,invalidLabyrinth:false,invalidDawn:false});
});

test('walkable perimeter scene starts facing the gate and offers courtyard passage',async({page})=>{
 await page.goto(base+'academy-perimeter-3d.html');
 await expect(page.locator('#status')).toContainText('ready',{timeout:30000});
 const scene=await page.evaluate(()=>{
  const s=BABYLON.EngineStore.LastCreatedScene;
  const camera=s.activeCamera;
  return {forward:camera.getDirection(BABYLON.Axis.Z).z,
   north:s.getMeshByName('north perimeter privacy wall')?.checkCollisions,
   southLeft:s.getMeshByName('south perimeter left privacy wall')?.checkCollisions,
   southRight:s.getMeshByName('south perimeter right privacy wall')?.checkCollisions,
   east:s.getMeshByName('east perimeter privacy wall')?.checkCollisions,
   west:s.getMeshByName('west perimeter privacy wall')?.checkCollisions};
 });
 expect(scene.forward).toBeLessThan(-.9);
 for(const side of ['north','southLeft','southRight','east','west'])expect(scene[side]).toBe(true);
 const enter=page.locator('#enter');
 await expect(enter).toBeHidden();
 await page.evaluate(()=>{const s=BABYLON.EngineStore.LastCreatedScene;s.activeCamera.position.set(0,1.8,-29)});
 await expect(enter).toBeVisible({timeout:5000});
 await enter.click();
 await expect(page).toHaveURL(/academy-moonlit-courtyard[.]html/);
});

test('the royal invitation leads to walkable gates and retains a direct courtyard link',async({page})=>{
 await page.goto(base+'amethyst-crescent-academy.html');
 await expect(page.locator('#academy-gate')).toHaveAttribute('href','academy-perimeter-3d.html');
 await page.goto(base+'academy-perimeter-3d.html');
 await expect(page.getByRole('link',{name:'Enter Courtyard Directly'})).toHaveAttribute('href','academy-moonlit-courtyard.html');
});

test('royal perimeter contains four raised house flags and a collision-aware gate',async({page})=>{
 await page.goto(base+'academy-perimeter-3d.html');
 await expect(page.locator('#status')).toContainText('ready',{timeout:30000});
 const result=await page.evaluate(()=>{
  const scene=BABYLON.EngineStore.LastCreatedScene;
  return {flags:scene.meshes.filter(m=>m.name.endsWith('embroidered house flag')).length,
   poles:scene.meshes.filter(m=>m.name.includes('tall silver flagpole')).length,
   gateBlocker:scene.getMeshByName('closed wrought iron gate collision')?.checkCollisions,
   mainWall:scene.getMeshByName('palace front collision wall')?.checkCollisions,
   doorButton:!!document.querySelector('#enter-palace'),
   doors:scene.getTransformNodeByName('west royal entrance door hinge')&&scene.getTransformNodeByName('east royal entrance door hinge'),houses:['AMETHYST AIR','EMBERHEART FIRE','FROSTVEIL WATER','SILVERTHORN EARTH'].every(name=>scene.meshes.some(m=>m.name===name+' embroidered house flag'))};
 });
 expect(result.flags).toBe(4);expect(result.poles).toBe(4);expect(result.gateBlocker).toBe(true);expect(result.mainWall).toBe(true);expect(result.doorButton).toBe(true);expect(result.doors).toBeTruthy();expect(result.houses).toBe(true);
});

test('the perimeter keeps an illustrated castle fallback when WebGL is unavailable',async({page})=>{
 await page.route('https://cdn.babylonjs.com/babylon.js',route=>route.fulfill({contentType:'application/javascript',body:''}));
 await page.goto(base+'academy-perimeter-3d.html');
 await expect(page.locator('body')).toHaveClass(/no-webgl/);
 await expect(page.locator('#fallbackScene')).toBeVisible();
 await expect(page.locator('#touch')).toBeHidden();
 await expect(page.getByRole('link',{name:'Enter Courtyard Directly'})).toBeVisible();
});

test('the palace doors animate and lead to the existing Great Hall',async({page})=>{
 await page.goto(base+'academy-perimeter-3d.html');
 await expect(page.locator('#status')).toContainText('ready',{timeout:30000});
 await page.evaluate(()=>BABYLON.EngineStore.LastCreatedScene.activeCamera.position.set(0,1.8,2));
 const button=page.locator('#enter-palace');await expect(button).toBeVisible({timeout:5000});await button.click();
 await expect(page.locator('#status')).toContainText('doors open',{timeout:5000});
 await expect(page).toHaveURL(/academy-royal-great-hall[.]html#royal-reception/,{timeout:10000});
});

test('players can pass through the opened gates and reach the palace entrance',async({page})=>{
 await page.goto(base+'academy-perimeter-3d.html');
 await expect(page.locator('#status')).toContainText('ready',{timeout:30000});
 await page.evaluate(()=>BABYLON.EngineStore.LastCreatedScene.activeCamera.position.set(0,1.8,-29));
 const blocker=()=>page.evaluate(()=>BABYLON.EngineStore.LastCreatedScene.getMeshByName('closed wrought iron gate collision').checkCollisions);
 await expect.poll(blocker,{timeout:6000}).toBe(false);
 const moved=await page.evaluate(()=>{const c=BABYLON.EngineStore.LastCreatedScene.activeCamera;c.position.set(0,1.8,-33);c.moveWithCollisions(new BABYLON.Vector3(0,0,-2));return c.position.z});
 expect(moved).toBeLessThan(-34);
 await page.evaluate(()=>BABYLON.EngineStore.LastCreatedScene.activeCamera.position.set(0,1.8,2));
 await expect(page.locator('#enter-palace')).toBeVisible({timeout:5000});
 expect(await page.evaluate(()=>BABYLON.EngineStore.LastCreatedScene.getMeshByName('closed main entrance collision').checkCollisions)).toBe(true);
});

test('silver entrance gate opens when approached and closes when leaving',async({page})=>{
 await page.goto(base+'academy-perimeter-3d.html');
 await expect(page.locator('#status')).toContainText('ready',{timeout:30000});
 const read=()=>page.evaluate(()=>{
  const scene=BABYLON.EngineStore.LastCreatedScene;
  return [scene.getTransformNodeByName('west silver gate hinge')?.rotation.y,scene.getTransformNodeByName('east silver gate hinge')?.rotation.y];
 });
 const start=await read();
 expect(start.every(v=>typeof v==='number'&&Math.abs(v)<.2)).toBe(true);
 await page.evaluate(()=>BABYLON.EngineStore.LastCreatedScene.activeCamera.position.set(0,1.8,-29));
 await expect(page.locator('#enter')).toBeVisible({timeout:5000});
 await expect.poll(async()=>Math.abs((await read())[0]),{timeout:5000}).toBeGreaterThan(.7);
 const open=await read();
 expect(open[0]).toBeLessThan(-.7);
 expect(open[1]).toBeGreaterThan(.7);
 await page.evaluate(()=>BABYLON.EngineStore.LastCreatedScene.activeCamera.position.set(0,1.8,-18));
 await expect(page.locator('#enter')).toBeHidden();
 await expect.poll(async()=>Math.abs((await read())[0]),{timeout:5000}).toBeLessThan(.2);
});

test('Royal Chamber offers its Four Houses fallback when WebGL initialization fails', async ({page}) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('https://cdn.babylonjs.com/babylon.js', route => route.fulfill({
    contentType: 'application/javascript',
    body: 'window.BABYLON = { Engine: class { constructor() { throw new Error("WebGL not supported"); } } };'
  }));
  await page.goto(base + 'academy-royal-3d.html');
  await expect(page.locator('#status')).toContainText('3D graphics are unavailable');
  await expect(page.locator('#touch')).toBeHidden();
  await page.getByRole('link', {name: 'Explore the Four Houses'}).click();
  await expect(page).toHaveURL(/academy-four-houses[.]html/);
  expect(errors).toEqual([]);
});

test('Heart Chamber controls fit the viewport and move the player', async ({page}, testInfo) => {
  await page.goto(base + 'poetry-vault.html');
  await page.locator('#start').click();
  const canvas = page.locator('#room-canvas');
  const position = () => canvas.evaluate(element => JSON.parse(element.dataset.cameraPosition)[1]);
  const before = await position();
  const controls = ['#explore', '#journal', '#hint', '#help', '.aca-threshold-door',
    '.aca-threshold-return', '.pvg-call', '.aca-chest-easy', '.aca-chest-secret'];
  if (testInfo.project.use.hasTouch) controls.push('[data-move="forward"]', '[data-move="turnRight"]');
  for (const selector of controls) {
    const control = page.locator(selector);
    await expect(control).toBeVisible();
    expect(await control.evaluate(element => {
      const {left, top, width, height} = element.getBoundingClientRect();
      return element.contains(document.elementFromPoint(left + width / 2, top + height / 2));
    }), selector + ' should be within reach').toBe(true);
  }
  if (testInfo.project.use.hasTouch) {
    await page.locator('[data-move="forward"]').tap();
    const yaw = () => canvas.evaluate(element => Number(element.dataset.yaw));
    const initialYaw = await yaw();
    await page.locator('[data-move="turnRight"]').tap();
    await expect.poll(yaw).toBeLessThan(initialYaw - .04);
  } else {
    await canvas.press('w');
  }
  await expect.poll(position).toBeLessThan(before - .06);
  if (testInfo.project.name === 'android-chromium') {
    const cdp = await page.context().newCDPSession(page);
    const settings = page.locator('#settings-button');
    for (const [viewport, insets] of [
      [{width:390,height:844},{top:40,right:0,left:0,bottom:25}],
      [{width:664,height:390},{top:0,right:36,left:36,bottom:20}]
    ]) {
      await page.setViewportSize(viewport);
      await cdp.send('Emulation.setSafeAreaInsetsOverride', {insets});
      await expect.poll(() => settings.evaluate((element,insets) => {
        const rect=element.getBoundingClientRect();
        return rect.top>=insets.top && rect.right<=innerWidth-insets.right;
      },insets)).toBe(true);
    }
  }
});

test('Heart Chamber scenery batches keep the diary and exit playable', async ({page}) => {
  test.setTimeout(120000);
  await page.addInitScript(() => {
    // Count only this room's instanced WebGL draws. Canvas fallback uses the same puzzles.
    const gl = window.WebGL2RenderingContext?.prototype;
    if (!gl) return;
    const draw = gl.drawElementsInstanced;
    gl.drawElementsInstanced = function (...args) {
      if (this.canvas.id === 'room-canvas') this.canvas.dataset.instanced = 'true';
      return draw.apply(this, args);
    };
  });
  await page.goto(base + 'poetry-vault.html');
  await page.locator('#start').click();
  const canvas = page.locator('#room-canvas');
  await expect(canvas).toBeVisible();
  if (await canvas.evaluate(element => Boolean(element.getContext('webgl2')))) {
    await expect(canvas).toHaveAttribute('data-instanced', 'true', {timeout: 30000});
  }

  await page.locator('#explore').click();
  await page.locator('[data-object="rose"]').press('Enter');
  await expect(page.locator('#panel-title')).toBeFocused();
  await page.locator('#collect').press('Enter');
  await expect(page.locator('#panel-title')).toBeFocused();
  for (const letter of ['ribbon', 'moon', 'key']) {
    await page.locator('[data-object="' + letter + '"]').click();
    await page.locator('#collect').click();
  }
  await page.locator('[data-object="diary"]').click();
  await page.locator('#lock-code').fill('3142');
  await page.locator('#code-form button').click();
  for (const symbol of ['moon', 'ribbon', 'rose', 'key']) {
    await page.locator('[data-symbol="' + symbol + '"]').click();
  }
  await page.locator('#unlock-diary').click();
  await expect(page.locator('#panel-title')).toContainText('The heart remembers');
  await page.locator('#close-panel').click();
  await page.locator('#explore').click();
  await page.locator('[data-object="door"]').click();
  await page.getByRole('link', {name: /Enter The Shattered Mirror/}).click();
  await expect(page).toHaveURL(/poetry-vault-mirror\.html\?resume=1/, {timeout: 30000});
  await expect(page.locator('#objective')).toContainText('Find the four mirror fragments');
});

test('Heart Chamber graphics choices resize the WebGL buffer and preserve the save', async ({page}) => {
  test.setTimeout(120000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base + 'poetry-vault.html');
  await page.locator('#start').click();
  const canvas = page.locator('#room-canvas');
  await expect(canvas).toBeVisible();
  const saveKey = 'bre-poetry-vault-heart-v1';
  const save = {found: ['rose'], drawerOpen: false, diaryOpen: false, completed: false};
  await page.evaluate(({saveKey, save}) => localStorage.setItem(saveKey, JSON.stringify(save)), {saveKey, save});
  await page.reload();
  await expect(canvas).toBeVisible();

  await page.locator('#settings-button').click();
  const quality = page.getByLabel('Heart Chamber graphics');
  await expect(quality).toHaveValue('high');
  const readBuffer = () => canvas.evaluate(element => {
    const rect = element.getBoundingClientRect();
    return {width: element.width, height: element.height, cssWidth: rect.width, cssHeight: rect.height};
  });
  if (await canvas.evaluate(element => Boolean(element.getContext('webgl2')))) {
    await expect(quality).toBeEnabled();
    const high = await readBuffer();
    const expected = scale => Math.floor(high.width * scale);
    for (const [option, scale] of [['balanced', .82], ['performance', .60]]) {
      await quality.selectOption(option);
      await expect.poll(async () => Math.abs((await readBuffer()).width - expected(scale))).toBeLessThanOrEqual(1);
      const actual = await readBuffer();
      expect(actual.cssWidth).toBe(high.cssWidth);
      expect(actual.cssHeight).toBe(high.cssHeight);
    }
    await page.reload();
    await expect(canvas).toBeVisible();
    await page.locator('#settings-button').click();
    await expect(quality).toHaveValue('performance');
    await expect.poll(async () => Math.abs((await readBuffer()).width - expected(.60))).toBeLessThanOrEqual(1);
    await quality.selectOption('high');
    await expect.poll(async () => (await readBuffer()).width).toBe(high.width);
    const restoredWidth = await canvas.evaluate(async element => {
      const context = element.getContext('webgl2');
      const extension = context.getExtension('WEBGL_lose_context');
      if (!extension) return null;
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('WebGL context did not restore')), 15000);
        element.addEventListener('webglcontextrestored', () => {
          clearTimeout(timer);
          requestAnimationFrame(() => resolve(context.drawingBufferWidth));
        }, {once: true});
        element.addEventListener('webglcontextlost', event => {
          event.preventDefault();
          setTimeout(() => extension.restoreContext(), 100);
        }, {once: true});
        extension.loseContext();
      });
    });
    if (restoredWidth !== null) expect(restoredWidth).toBe(high.width);
  } else {
    await expect(quality).toBeDisabled();
  }
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), saveKey)).toEqual(save);
  await page.locator('#close-panel').click();
  await page.locator('#start').click();
  await page.locator('#explore').click();
  await page.locator('[data-object="rose"]').click();
  await expect(page.locator('#collect')).toHaveText('Return to objects');
  if (await page.evaluate(() => matchMedia('(pointer: coarse)').matches)) {
    await page.locator('#close-panel').click();
    const controls = ['#settings-button', '.pvg-sound', '#explore', '#journal', '#hint', '#help',
      '[data-move="forward"]', '[data-move="turnRight"]', '.aca-chest-easy', '.aca-chest-secret',
      '.aca-threshold-door', '.aca-threshold-return'];
    for (const viewport of [{width: 839, height: 412}, {width: 664, height: 390}]) {
      await page.setViewportSize(viewport);
      for (const selector of controls) {
        const control = page.locator(selector);
        await expect(control).toBeVisible();
        await expect.poll(() => control.evaluate(element => {
          const {x, y, width, height} = element.getBoundingClientRect();
          return element.contains(document.elementFromPoint(x + width / 2, y + height / 2));
        }), selector + ' should be reachable in landscape').toBe(true);
      }
    }
  }
  expect(errors).toEqual([]);
});


test('Courtyard saving protects more than thirty legacy Fountain memories', async ({page}) => {
  const key = 'amethyst-academy-fountain-memories-v1';
  const legacy = JSON.stringify(Array.from({length: 33}, (_, index) => ({
    id: 'legacy-' + index, title: 'Legacy memory ' + index,
    path: 'academy-royal-great-hall.html', date: '2026-01-01', note: 'Saved note ' + index,
    ...(index === 0 ? {milestone: 'earned'} : {})
  })));
  await page.addInitScript(({key, legacy}) => {
    if (localStorage.getItem(key) === null) localStorage.setItem(key, legacy);
  }, {key, legacy});
  await page.goto(base + 'academy-moonlit-courtyard.html', {waitUntil: 'domcontentloaded'});
  await expect(page.locator('.fountain-crystal')).toHaveCount(30);
  await expect(page.locator('.milestone-crystal')).toHaveCount(1);
  await page.locator('#fountain-save-here').click();
  await expect(page.locator('#fountain-count')).toContainText('Legacy memories protected');
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(legacy);
  await page.reload({waitUntil: 'domcontentloaded'});
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(legacy);
});

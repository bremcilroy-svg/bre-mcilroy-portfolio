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
test('touch movement advances the player and stops on release',async({page})=>{await page.setViewportSize({width:390,height:844});await page.goto(base+'academy-royal-3d.html');await expect(page.locator('#status')).toContainText('ready',{timeout:30000});const before=await page.evaluate(()=>{const p=BABYLON.EngineStore.LastCreatedScene.activeCamera.position;return {x:p.x,z:p.z}});const button=page.locator('[data-move="forward"]');const bounds=await button.boundingBox();expect(bounds).not.toBeNull();await page.mouse.move(bounds.x+bounds.width/2,bounds.y+bounds.height/2);await page.mouse.down();await page.waitForTimeout(500);await page.mouse.up();const after=await page.evaluate(()=>{const p=BABYLON.EngineStore.LastCreatedScene.activeCamera.position;return {x:p.x,z:p.z}});expect(Math.hypot(after.x-before.x,after.z-before.z)).toBeGreaterThan(.1)});

test('3D castle walls block the player from walking outside',async({page})=>{await page.goto(base+'academy-royal-3d.html');await expect(page.locator('#status')).toContainText('ready',{timeout:30000});await page.evaluate(()=>{const scene=BABYLON.EngineStore.LastCreatedScene;const camera=scene.activeCamera;camera.position.set(0,1.75,10);camera.rotation.set(0,0,0)});await page.locator('#renderCanvas').click({position:{x:30,y:30}});await page.keyboard.down('w');await page.waitForTimeout(1600);await page.keyboard.up('w');const position=await page.evaluate(()=>{const p=BABYLON.EngineStore.LastCreatedScene.activeCamera.position;return {x:p.x,z:p.z}});expect(position.z).toBeLessThan(11.8);expect(position.z).toBeGreaterThan(10)});

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
  await page.goto(base+'poetry-vault-fifth-door.html');
  await expect(page.locator('#game')).toBeVisible({timeout:15000});
});

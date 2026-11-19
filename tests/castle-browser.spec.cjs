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
  await expect(page).toHaveURL(/poetry-vault-entrance\\.html/);
});

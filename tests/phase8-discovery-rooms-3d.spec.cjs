const {test,expect}=require('@playwright/test');
const base='http://127.0.0.1:8765/';
const rooms=[
  {url:'academy-enchanted-east-wing.html',kind:'wing',quality:'Enchanted East Wing',inspect:'library',panel:'#wing-discovery',text:'The shelves rustle like leaves'},
  {url:'academy-enchanted-library.html',kind:'library',quality:'Enchanted Library',inspect:'book',panel:'#library-story',text:'silver-bound book opens'},
  {url:'academy-four-houses.html',kind:'houses',quality:'The Four Houses',inspect:'owl',panel:'#amethyst-story',text:'Under violet banners',extraDiscoveries:[['dragon','#ember-story','Ruby tapestries'],['wolf','#frost-story','icy-blue windows'],['deer','#silver-story','moonlit garden']]}
];

test('East Wing, Enchanted Library, and Four Houses are walkable 3D with saved perspective and intact discoveries',async({page},testInfo)=>{
  test.setTimeout(120000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
    localStorage.setItem('amethyst-academy-player-perspective-v1','first');
    localStorage.setItem('bre-poetry-vault-heart-graphics-v1','high');
    localStorage.setItem('discovery-room-preserve-sentinel','keep-progress');
  });
  let expected='first';
  for(const room of rooms){
    await page.goto(base+room.url);
    await page.waitForFunction(()=>window.academyDiscoveryRoom3D?.diagnostics().ready||document.querySelector('.academy-discovery-stage')?.dataset.unavailable==='true',null,{timeout:30000});
    const result=await page.evaluate(()=>window.academyDiscoveryRoom3D?.diagnostics()||null);
    expect(result?.ready).toBe(true);expect(result.kind).toBe(room.kind);expect(result.geometryCount).toBeGreaterThan(0);expect(result.meshCount).toBeGreaterThan(30);expect(result.meshCount).toBeLessThan(300);expect(result.interactableCount).toBeGreaterThanOrEqual(3);expect(['webgl','canvas-quad-v2']).toContain(result.renderer);expect(result.actualWebGL).toBe(result.renderer==='webgl');
    const stage=page.locator('.academy-discovery-stage'),canvas=stage.locator('canvas');
    await expect(stage).toBeVisible();await expect(page.getByRole('heading',{name:room.quality})).toBeVisible();
    if(expected==='first'){await page.getByRole('button',{name:'Switch to third-person view'}).click();expected='third';}
    await expect(canvas).toHaveAttribute('data-perspective',expected);
    if(testInfo.project.name==='desktop-chromium'){
      const before=await page.evaluate(()=>window.academyDiscoveryRoom3D.diagnostics().position.z);
      await canvas.focus();await page.keyboard.down('w');await page.waitForTimeout(300);await page.keyboard.up('w');
      expect(await page.evaluate(()=>window.academyDiscoveryRoom3D.diagnostics().position.z)).toBeLessThan(before-.12);
    }else{
      const forward=page.getByRole('button',{name:'Walk forward'});await expect(forward).toBeVisible();
      const [qualityBox,controlsBox]=await Promise.all([page.getByLabel(room.quality+' graphics quality').boundingBox(),page.locator('.academy-discovery-controls').boundingBox()]);
      expect(qualityBox.x+qualityBox.width<=controlsBox.x||controlsBox.x+controlsBox.width<=qualityBox.x||qualityBox.y+qualityBox.height<=controlsBox.y||controlsBox.y+controlsBox.height<=qualityBox.y).toBe(true);
      expect((await forward.boundingBox()).height).toBeGreaterThanOrEqual(44);
      const before=await page.evaluate(()=>window.academyDiscoveryRoom3D.diagnostics().position.z);await forward.tap();
      await expect.poll(()=>page.evaluate(()=>window.academyDiscoveryRoom3D.diagnostics().position.z)).toBeLessThan(before-.02);
    }
    await page.evaluate(id=>window.academyDiscoveryRoom3D.inspect(id),room.inspect);
    const panel=page.locator(room.panel);await expect(panel).toContainText(room.text);if(room.kind==='houses')await expect(panel).toBeVisible();
    for(const [id,selector,text]of room.extraDiscoveries||[]){await page.evaluate(value=>window.academyDiscoveryRoom3D.inspect(value),id);await expect(page.locator(selector)).toBeVisible();await expect(page.locator(selector)).toContainText(text);}
    expect(await page.evaluate(()=>localStorage.getItem('discovery-room-preserve-sentinel'))).toBe('keep-progress');
  }
  expect(await page.evaluate(()=>localStorage.getItem('amethyst-academy-player-perspective-v1'))).toBe('third');
  expect(errors).toEqual([]);
});

const {test,expect}=require('@playwright/test');
const base='http://127.0.0.1:8765/';
const houseByProject={
  'android-chromium':'academy-house-frostveil.html',
  'iphone-webkit':'academy-house-emberheart.html',
  'tablet-webkit':'academy-house-silverthorn.html'
};
const routes=['academy-house-amethyst.html','academy-house-emberheart.html','academy-house-frostveil.html','academy-house-silverthorn.html'];
const houseNames={amethyst:'Amethyst',emberheart:'Emberheart',frostveil:'Frosttopaz',silverthorn:'Silverthorn'};

test('four Academy house common rooms are walkable 3D and preserve house progress',async({page},testInfo)=>{
  test.setTimeout(120000);
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>{
    if(localStorage.getItem('amethyst-academy-player-perspective-v1')===null)localStorage.setItem('amethyst-academy-player-perspective-v1','first');
    if(localStorage.getItem('bre-poetry-vault-heart-graphics-v1')===null)localStorage.setItem('bre-poetry-vault-heart-graphics-v1','high');
    if(localStorage.getItem('amethyst-crescent-student-progress-sentinel')===null)localStorage.setItem('amethyst-crescent-student-progress-sentinel','keep-house-progress');
    if(localStorage.getItem('bre-poetry-vault-heart-v1')===null)localStorage.setItem('bre-poetry-vault-heart-v1',JSON.stringify({found:['rose'],completed:false,fixture:'preserve-this-save'}));
  });
  const pages=testInfo.project.name==='desktop-chromium'?routes:[houseByProject[testInfo.project.name]];
  let expected='first';
  for(const route of pages){
    await page.goto(base+route);
    await page.waitForFunction(()=>window.academyHouseRoom3D?.diagnostics().ready
      || document.querySelector('.academy-house-3d-stage')?.dataset.unavailable==='true',null,{timeout:30000});
    const result=await page.evaluate(()=>window.academyHouseRoom3D?.diagnostics()||null);
    expect(result?.ready).toBe(true);
    const house=route.match(/academy-house-(amethyst|emberheart|frostveil|silverthorn)/)[1];
    expect(result.house).toBe(house);
    expect(result.companion).toBe('Gizmo');
    expect(result.bannerCount).toBe(4);
    expect(result.starCount).toBe(60);
    expect(result.geometryCount).toBeGreaterThan(5);
    expect(result.geometryCount).toBeLessThan(55);
    expect(['webgl','canvas-quad-v2']).toContain(result.renderer);
    expect(result.actualWebGL).toBe(result.renderer==='webgl');
    await expect(page.getByRole('heading',{name:new RegExp(houseNames[house])}).first()).toBeVisible();
    await expect(page.locator('.academy-house-3d-stage')).toBeVisible();
    await expect(page.getByRole('navigation',{name:'Academy navigation'})).toBeVisible();
    await expect(page.getByRole('button',{name:'Discover the Common Room'})).toBeVisible();
    await expect(page.locator('#academy-gizmo-portrait')).toBeAttached();

    if(expected==='first'){
      await page.getByRole('button',{name:'Switch to third-person view'}).click();
      expected='third';
    }
    await expect(page.locator('.academy-house-3d-canvas')).toHaveAttribute('data-perspective',expected);
    if(route===pages[0]){
      await page.getByLabel(new RegExp(houseNames[house]+' House graphics quality')).selectOption('balanced');
      expect(await page.evaluate(()=>localStorage.getItem('bre-poetry-vault-heart-graphics-v1'))).toBe('balanced');
    }
    if(/android|iphone|tablet/i.test(testInfo.project.name)){
      const forward=page.getByRole('button',{name:'Walk forward'});
      await expect(forward).toBeVisible();
      const [qualityBox,controlsBox]=await Promise.all([
        page.getByLabel(new RegExp(houseNames[house]+' House graphics quality')).boundingBox(),
        page.locator('.academy-house-3d-touch').boundingBox()
      ]);
      expect(qualityBox.x+qualityBox.width<=controlsBox.x||controlsBox.x+controlsBox.width<=qualityBox.x
        ||qualityBox.y+qualityBox.height<=controlsBox.y||controlsBox.y+controlsBox.height<=qualityBox.y).toBe(true);
      expect((await forward.boundingBox()).height).toBeGreaterThanOrEqual(44);
      const before=await page.evaluate(()=>window.academyHouseRoom3D.diagnostics().position.z);
      await forward.tap();
      await expect.poll(()=>page.evaluate(()=>window.academyHouseRoom3D.diagnostics().position.z)).toBeLessThan(before-.02);
    }else{
      const canvas=page.locator('.academy-house-3d-canvas');
      const before=await page.evaluate(()=>window.academyHouseRoom3D.diagnostics().position.z);
      await canvas.evaluate(node=>node.focus());await page.keyboard.down('w');await page.waitForTimeout(300);await page.keyboard.up('w');
      // CI software rendering can schedule fewer movement frames during the
      // same held-key interval. Require a real forward step, not a fixed speed.
      await expect.poll(()=>page.evaluate(()=>window.academyHouseRoom3D.diagnostics().position.z)).toBeLessThan(before-.05);
    }
    await expect(page.getByRole('button',{name:'Discover the Common Room'})).toBeVisible();
    expect(await page.evaluate(()=>localStorage.getItem('amethyst-crescent-student-progress-sentinel'))).toBe('keep-house-progress');
    expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('bre-poetry-vault-heart-v1')).fixture)).toBe('preserve-this-save');
  }
  expect(await page.evaluate(()=>localStorage.getItem('amethyst-academy-player-perspective-v1'))).toBe('third');
  expect(errors).toEqual([]);
});

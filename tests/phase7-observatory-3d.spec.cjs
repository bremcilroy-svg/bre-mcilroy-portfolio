const {test, expect} = require('@playwright/test');
const base = 'http://127.0.0.1:8765/';

function seedIsolatedObservatory() {
  localStorage.setItem('amethyst-crescent-student-pass-v1', JSON.stringify({name:'Test Student',house:'amethyst'}));
  for (const stage of ['check-in','house-visit']) {
    localStorage.setItem('amethyst-first-day-v1:' + JSON.stringify(['amethyst','Test Student',stage]), 'true');
  }
  localStorage.setItem('amethyst-academy-player-perspective-v1','first');
  localStorage.setItem('bre-poetry-vault-heart-graphics-v1','high');
  localStorage.setItem('amethyst-crescent-student-progress-sentinel','keep-this-progress');
  localStorage.setItem('amethyst-academy-fountain-memories-v1', JSON.stringify([
    {id:'observatory-preserve-sentinel',title:'Existing earned memory',path:'academy-moonlit-courtyard.html',date:'2026-11-22',note:'Keep this',milestone:'courtyard-first-visit'}
  ]));
}

test('Owl Observatory 3D room preserves the constellation puzzle across emulated profiles', async ({page}, testInfo) => {
  test.setTimeout(90000);
  const errors=[];
  page.on('pageerror', error=>errors.push(error.message));
  await page.addInitScript(seedIsolatedObservatory);
  await page.goto(base+'academy-owl-observatory.html');
  await page.waitForFunction(()=>window.academyObservatory3D?.diagnostics().ready
    || document.querySelector('#observatory-3d-stage')?.dataset.unavailable==='true',null,{timeout:30000});
  const stage=page.locator('#observatory-3d-stage');
  const initial=await page.evaluate(()=>window.academyObservatory3D?.diagnostics()||null);
  expect(initial?.ready).toBe(true);
  expect(initial.bannerCount).toBe(4);
  expect(initial.canvas.width).toBeGreaterThan(0);
  expect(initial.canvas.height).toBeGreaterThan(0);
  // WebGL is reported only when the browser actually created the WebGL renderer;
  // CanvasRenderer remains an explicitly distinguishable 3D fallback.
  expect(['webgl','canvas-quad-v2']).toContain(initial.renderer);
  expect(initial.actualWebGL).toBe(initial.renderer==='webgl');
  await expect(page.locator('#open-telescope')).toBeVisible();
  await expect(page.getByRole('button',{name:'Switch to third-person view'})).toBeVisible();
  await page.getByRole('button',{name:'Switch to third-person view'}).click();
  await expect(page.locator('#observatory-3d-canvas')).toHaveAttribute('data-perspective','third');
  await page.getByRole('button',{name:'Switch to first-person view'}).click();
  await expect(page.locator('#observatory-3d-canvas')).toHaveAttribute('data-perspective','first');

  await page.getByLabel('Observatory graphics quality').selectOption('balanced');
  expect(await page.evaluate(()=>window.academyObservatory3D.diagnostics().quality)).toBe('balanced');
  await page.getByLabel('Observatory graphics quality').selectOption('performance');
  expect(await page.evaluate(()=>localStorage.getItem('bre-poetry-vault-heart-graphics-v1'))).toBe('performance');
  expect(await page.evaluate(()=>localStorage.getItem('amethyst-crescent-student-progress-sentinel'))).toBe('keep-this-progress');

  const before=await page.evaluate(()=>window.academyObservatory3D.diagnostics().position);
  if(/android|iphone|tablet/i.test(testInfo.project.name)) {
    const forward=page.getByRole('button',{name:'Walk forward'});
    await expect(forward).toBeVisible();
    await forward.tap();
  } else {
    const canvas=page.locator('#observatory-3d-canvas');
    await canvas.evaluate(node=>node.focus());
    await page.keyboard.down('w'); await page.waitForTimeout(400); await page.keyboard.up('w');
  }
  await expect.poll(()=>page.evaluate(()=>window.academyObservatory3D.diagnostics().position.z)).toBeLessThan(before.z-.02);
  if(testInfo.project.name==='desktop-chromium') {
    await page.keyboard.down('w'); await page.waitForTimeout(4800); await page.keyboard.up('w');
    const z=await page.evaluate(()=>window.academyObservatory3D.diagnostics().position.z);
    expect(z).toBeGreaterThan(-2.3); // the telescope dais blocks passage through its center
    expect(z).toBeLessThan(-1.25); // player can approach its edge to inspect the telescope
  }

  const beforeYaw=await page.evaluate(()=>window.academyObservatory3D.diagnostics().yaw);
  const canvas=page.locator('#observatory-3d-canvas');
  if(testInfo.project.name==='android-chromium') {
    const session=await page.context().newCDPSession(page);
    const rect=await canvas.boundingBox();
    await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:rect.x+rect.width*.5,y:rect.y+rect.height*.5}]});
    await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x:rect.x+rect.width*.62,y:rect.y+rect.height*.51}]});
    await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await session.detach();
  } else if(testInfo.project.name==='desktop-chromium') {
    const rect=await canvas.boundingBox();
    await page.mouse.move(rect.x+rect.width*.5,rect.y+rect.height*.5); await page.mouse.down();
    await page.mouse.move(rect.x+rect.width*.62,rect.y+rect.height*.51,{steps:4}); await page.mouse.up();
  }
  if(['android-chromium','desktop-chromium'].includes(testInfo.project.name)) {
    expect(Math.abs(await page.evaluate(()=>window.academyObservatory3D.diagnostics().yaw)-beforeYaw)).toBeGreaterThan(.1);
  }

  await page.getByRole('button',{name:'Look through the telescope'}).click();
  for(const star of ['Talons','Silver Wing','Owl’s Eye']) await page.getByRole('button',{name:new RegExp(star)}).click();
  await page.getByRole('button',{name:'Trace constellation'}).click();
  await expect(page.locator('#constellation-badge')).toBeVisible();
  const memories=await page.evaluate(()=>JSON.parse(localStorage.getItem('amethyst-academy-fountain-memories-v1')));
  expect(memories.find(memory=>memory.id==='observatory-preserve-sentinel')).toBeTruthy();
  expect(memories.filter(memory=>memory.milestone==='observatory-owl-constellation')).toHaveLength(1);
  expect(await page.evaluate(()=>localStorage.getItem('amethyst-crescent-student-progress-sentinel'))).toBe('keep-this-progress');
  await expect(page.locator('#observatory-3d-stage')).toBeVisible();
  expect(errors).toEqual([]);
});

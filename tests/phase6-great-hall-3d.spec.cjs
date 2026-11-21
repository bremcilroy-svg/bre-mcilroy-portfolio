const {test, expect} = require('@playwright/test');
const base = 'http://127.0.0.1:8765/';
const saveKey = 'bre-poetry-vault-heart-v1';
const qualityKey = 'bre-poetry-vault-heart-graphics-v1';

test('Royal Great Hall 3D scene renders, responds to movement/look and preserves the save', async ({page}, testInfo) => {
  test.setTimeout(90000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(({saveKey, qualityKey}) => {
    localStorage.setItem(saveKey, 'phase6-save-sentinel');
    localStorage.setItem(qualityKey, 'high');
  }, {saveKey, qualityKey});
  // Keep each Playwright project's configured device viewport (desktop, Pixel 7, iPhone 13, iPad).
  await page.goto(base + 'academy-royal-great-hall.html');

  const status = page.locator('#great-hall-3d-status');
  await expect(status).toBeVisible();
  const readiness = await page.waitForFunction(() => window.academyGreatHall3D?.diagnostics().ready
    ? {webgl: true}
    : document.querySelector('#great-hall-3d-status')?.textContent.includes('3D is unavailable')
      ? {webgl: false} : false, null, {timeout: 30000}).then(handle => handle.jsonValue());
  const isWebGL = readiness.webgl;

  if (!isWebGL) {
    expect(testInfo.project.name).not.toMatch(/chromium/);
    await expect(status).toContainText('illustrated Great Hall');
    await expect(page.getByRole('button', {name: 'Visit Gizmo'})).toBeVisible();
    await page.getByRole('button', {name: 'Visit Gizmo'}).click();
    await expect(page.getByRole('button', {name: 'Visit Gizmo'})).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#hall-reveal')).toContainText('Gizmo pads quietly');
    expect(errors).toEqual([]);
    return;
  }

  const canvas = page.locator('#great-hall-3d-canvas');
  await expect(canvas).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.academyGreatHall3D.diagnostics().draws)).toBeGreaterThan(15);
  const starting = await page.evaluate(() => window.academyGreatHall3D.diagnostics());
  expect(starting.geometries).toBeGreaterThan(10);
  expect(starting.canvas.width).toBeGreaterThan(0);
  expect(starting.canvas.height).toBeGreaterThan(0);

  if (testInfo.project.name.includes('android')) {
    const forward = page.getByRole('button', {name: 'Walk forward'});
    await expect(forward).toBeVisible();
    const beforeTouch = await page.evaluate(() => window.academyGreatHall3D.diagnostics().position);
    await forward.tap();
    await expect.poll(() => page.evaluate(() => window.academyGreatHall3D.diagnostics().position.z)).toBeLessThan(beforeTouch.z - .02);
  } else {
    const beforeWalk = await page.evaluate(() => window.academyGreatHall3D.diagnostics().position);
    await page.keyboard.down('w');
    await page.waitForTimeout(500);
    await page.keyboard.up('w');
    const afterWalk = await page.evaluate(() => window.academyGreatHall3D.diagnostics().position);
    expect(afterWalk.z).toBeLessThan(beforeWalk.z - .2);
  }

  const beforeLook = await page.evaluate(() => window.academyGreatHall3D.diagnostics().yaw);
  const bounds = await canvas.boundingBox();
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width / 2 + 75, bounds.y + bounds.height / 2 + 8, {steps: 5});
  await page.mouse.up();
  const afterLook = await page.evaluate(() => window.academyGreatHall3D.diagnostics().yaw);
  expect(Math.abs(afterLook - beforeLook)).toBeGreaterThan(.15);

  await page.getByLabel('Great Hall graphics quality').selectOption('balanced');
  const balanced = await page.evaluate(() => window.academyGreatHall3D.diagnostics());
  await page.getByLabel('Great Hall graphics quality').selectOption('performance');
  const performance = await page.evaluate(() => window.academyGreatHall3D.diagnostics());
  expect(starting.pixelRatio).toBeGreaterThan(balanced.pixelRatio);
  expect(balanced.pixelRatio).toBeGreaterThan(performance.pixelRatio);
  expect(await page.evaluate(key => localStorage.getItem(key), qualityKey)).toBe('performance');
  expect(await page.evaluate(key => localStorage.getItem(key), saveKey)).toBe('phase6-save-sentinel');

  await page.getByRole('button', {name: 'Return to illustrated view'}).click();
  await expect(canvas).toBeHidden();
  await expect(page.getByRole('button', {name: 'Enter the 3D Great Hall'})).toBeVisible();
  await page.getByRole('button', {name: 'Enter the 3D Great Hall'}).click();
  await expect(canvas).toBeVisible();
  await expect(page.locator('.royal-flag-gallery a')).toHaveCount(4);
  await expect(page.locator('a[href="poetry-vault-entrance.html"]').first()).toBeVisible();
  await page.getByRole('button', {name: 'Visit Gizmo'}).click();
  await expect(page.getByRole('button', {name: 'Visit Gizmo'})).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#hall-reveal')).toContainText('Gizmo pads quietly');

  const intervals = await page.evaluate(async () => {
    const samples = [];
    let last = performance.now();
    for (let i = 0; i < 90; i++) {
      await new Promise(requestAnimationFrame);
      const now = performance.now();
      samples.push(now - last);
      last = now;
    }
    return samples.sort((a, b) => a - b);
  });
  const runtime = await page.evaluate(() => ({
    sceneReadyMsSinceNavigation: Number(performance.now().toFixed(1)),
    jsHeapBytes: performance.memory?.usedJSHeapSize ?? null
  }));
  const report = {
    browser: testInfo.project.name,
    backend: 'WebGL renderer active; CI Chromium uses SwiftShader software rendering',
    runtime,
    settings: [starting, balanced, performance],
    frameIntervalMs: {median: intervals[44], p95: intervals[85]},
    note: 'CI/software-rendered timings are observations, not physical-device performance targets.'
  };
  console.log('PHASE6_GREAT_HALL_DIAGNOSTICS ' + JSON.stringify(report));
  await testInfo.attach('great-hall-3d-diagnostics.json', {body: Buffer.from(JSON.stringify(report, null, 2)), contentType: 'application/json'});
  expect(errors).toEqual([]);
});

test('Great Hall WebGL failure retains the illustrated room and all links', async ({page}) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {
      if (typeof type === 'string' && type.toLowerCase().startsWith('webgl')) return null;
      return original.call(this, type, ...args);
    };
  });
  await page.goto(base + 'academy-royal-great-hall.html');
  await expect(page.locator('#great-hall-3d-status')).toContainText('3D is unavailable');
  await expect(page.locator('.royal-reception')).toBeVisible();
  await expect(page.locator('.royal-flag-gallery a')).toHaveCount(4);
  await expect(page.locator('a[href="poetry-vault-entrance.html"]').first()).toBeVisible();
  await page.getByRole('button', {name: 'Visit Gizmo'}).click();
  await expect(page.getByRole('button', {name: 'Visit Gizmo'})).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#hall-reveal')).toContainText('Gizmo pads quietly');
  expect(await page.evaluate(key => localStorage.getItem(key), saveKey)).toBeNull();
  expect(errors).toEqual([]);
});

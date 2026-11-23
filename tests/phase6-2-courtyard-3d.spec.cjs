const {test, expect} = require('@playwright/test');
const base = 'http://127.0.0.1:8765/';
const memoryKey = 'amethyst-academy-fountain-memories-v1';
const progressKey = 'bre-poetry-vault-heart-v1';
const qualityKey = 'bre-poetry-vault-heart-graphics-v1';

function startingMemories() {
  return [
    {id: 'courtyard-test-ordinary', title: 'Moonlit courtyard visit', path: 'academy-royal-gardens.html', date: '2026-11-22', note: ''},
    {id: 'courtyard-test-milestone', title: 'Earned first chapter milestone', path: 'poetry-vault.html', date: '2026-11-21', note: 'Protected milestone note', milestone: 'heart-chamber-complete'}
  ];
}

test('Moonlit Courtyard 3D walk, touch, house details and Fountain memories', async ({page}, testInfo) => {
  test.setTimeout(90000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.addInitScript(({memoryKey, progressKey, qualityKey, memories}) => {
    if (localStorage.getItem(memoryKey) === null) localStorage.setItem(memoryKey, JSON.stringify(memories));
    if (localStorage.getItem(progressKey) === null) localStorage.setItem(progressKey, 'existing-puzzle-progress-sentinel');
    if (localStorage.getItem(qualityKey) === null) localStorage.setItem(qualityKey, 'high');
  }, {memoryKey, progressKey, qualityKey, memories: startingMemories()});
  await page.goto(base + 'academy-moonlit-courtyard.html');

  const status = page.locator('#courtyard-3d-status');
  await expect(status).toBeVisible();
  await page.waitForFunction(() => window.academyMoonlitCourtyard3D?.diagnostics().ready
    || document.querySelector('#courtyard-3d-status')?.textContent.includes('3D is unavailable'), null, {timeout: 30000});
  const ready = await page.evaluate(() => Boolean(window.academyMoonlitCourtyard3D?.diagnostics().ready));
  if (!ready) {
    expect(testInfo.project.name).not.toMatch(/chromium/);
    await expect(status).toContainText('illustrated courtyard');
    await expect(page.locator('#moonlit-courtyard-3d-canvas')).toHaveCount(0);
    await expect(page.locator('.royal-amethyst-fountain')).toBeVisible();
    await expect(page.locator('.royal-flag-gallery a')).toHaveCount(4);
    expect(await page.evaluate(key => localStorage.getItem(key), memoryKey)).toContain('courtyard-test-milestone');
    expect(await page.evaluate(key => localStorage.getItem(key), progressKey)).toBe('existing-puzzle-progress-sentinel');
    expect(errors).toEqual([]);
    return;
  }

  const canvas = page.locator('#moonlit-courtyard-3d-canvas');
  await expect(canvas).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.academyMoonlitCourtyard3D.diagnostics().draws)).toBeGreaterThan(30);
  const starting = await page.evaluate(() => window.academyMoonlitCourtyard3D.diagnostics());
  expect(starting.geometries).toBeGreaterThan(10);
  expect(starting.canvas.width).toBeGreaterThan(0);
  expect(starting.canvas.height).toBeGreaterThan(0);
  // First courtyard visit is an existing earned keepsake, in addition to the
  // two isolated seed memories provided above.
  expect(starting.memoryCrystals).toBe(3);
  expect(starting.motionReduced).toBe(true);
  expect(starting.snow).toBe(false);

  await page.getByRole('button', {name: 'Switch to third-person view'}).click();
  await expect(canvas).toHaveAttribute('data-perspective', 'third');
  expect(await page.evaluate(() => localStorage.getItem('amethyst-academy-player-perspective-v1'))).toBe('third');
  await page.getByRole('button', {name: 'Switch to first-person view'}).click();
  await expect(canvas).toHaveAttribute('data-perspective', 'first');

  if (/android|iphone|tablet/i.test(testInfo.project.name)) {
    const forward = page.getByRole('button', {name: 'Walk forward'});
    await expect(forward).toBeVisible();
    const before = await page.evaluate(() => window.academyMoonlitCourtyard3D.diagnostics().position);
    await forward.tap();
    await expect.poll(() => page.evaluate(() => window.academyMoonlitCourtyard3D.diagnostics().position.z)).toBeLessThan(before.z - .02);
    await expect.poll(() => forward.evaluate(element => {
      const r = element.getBoundingClientRect();
      return document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) === element;
    })).toBe(true);
    for (let step = 0; step < 14; step++) await forward.tap();
  } else {
    const before = await page.evaluate(() => window.academyMoonlitCourtyard3D.diagnostics().position);
    await page.locator('#moonlit-courtyard-3d-canvas').evaluate(element => element.focus());
    await page.keyboard.down('w');
    await page.waitForTimeout(450);
    await page.keyboard.up('w');
    const after = await page.evaluate(() => window.academyMoonlitCourtyard3D.diagnostics().position);
    expect(after.z).toBeLessThan(before.z - .2);
  }

  const beforeYaw = await page.evaluate(() => window.academyMoonlitCourtyard3D.diagnostics().yaw);
  const point = await page.evaluate(() => {
    const c = document.querySelector('#moonlit-courtyard-3d-canvas');
    const r = c.getBoundingClientRect();
    for (const fy of [.12, .25, .4, .58, .76, .9]) for (const fx of [.04, .16, .3, .5, .7, .84, .96]) {
      const x = r.left + r.width * fx, y = r.top + r.height * fy;
      if (document.elementFromPoint(x, y) === c) return {x, y};
    }
    return null;
  });
  expect(point, 'the scene should retain an open camera-look area').not.toBeNull();
  if (testInfo.project.name.includes('android')) {
    const session = await page.context().newCDPSession(page);
    await session.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{id: 1, x: point.x, y: point.y}]});
    await session.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{id: 1, x: point.x + 70, y: point.y + 7}]});
    await session.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
    await session.detach();
  } else {
    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    await page.mouse.move(point.x + 70, point.y + 7, {steps: 5});
    await page.mouse.up();
  }
  const afterYaw = await page.evaluate(() => window.academyMoonlitCourtyard3D.diagnostics().yaw);
  expect(Math.abs(afterYaw - beforeYaw)).toBeGreaterThan(.12);

  if (!/android|iphone|tablet/i.test(testInfo.project.name)) {
    await page.keyboard.down('w');
    await page.waitForTimeout(1450);
    await page.keyboard.up('w');
  }
  await page.evaluate(() => document.activeElement?.blur());
  const statusBeforeInspect = await page.locator('#courtyard-3d-status').textContent();
  await page.keyboard.press('e');
  await expect.poll(() => page.locator('#courtyard-3d-status').textContent()).not.toBe(statusBeforeInspect);
  await expect(page.locator('#courtyard-3d-status')).not.toContainText('Move closer');
  // The E key inspects the nearest object, which can be a rose or companion.
  // Select the corresponding Fountain crystal through its accessible control.
  await page.locator('#fountain-crystal-pool .fountain-crystal').first().click();
  await expect(page.locator('.fountain-crystal[aria-pressed="true"]')).toHaveCount(1);

  await page.getByLabel('Courtyard graphics quality').selectOption('balanced');
  const balanced = await page.evaluate(() => window.academyMoonlitCourtyard3D.diagnostics());
  await page.getByLabel('Courtyard graphics quality').selectOption('performance');
  const performance = await page.evaluate(() => window.academyMoonlitCourtyard3D.diagnostics());
  expect(starting.pixelRatio).toBeGreaterThan(balanced.pixelRatio);
  expect(balanced.pixelRatio).toBeGreaterThan(performance.pixelRatio);
  expect(await page.evaluate(key => localStorage.getItem(key), qualityKey)).toBe('performance');
  expect(await page.evaluate(key => localStorage.getItem(key), progressKey)).toBe('existing-puzzle-progress-sentinel');

  await expect(page.locator('.royal-flag-gallery a')).toHaveCount(4);
  for (const href of ['academy-royal-great-hall.html#royal-reception', 'academy-royal-gardens.html', 'amethyst-crescent-academy.html']) {
    await expect(page.locator(`.actions a[href="${href}"]`)).toHaveCount(1);
  }
  await page.getByRole('button', {name: 'Approach the Fountain'}).click();
  await expect(page.locator('#fountain-save-here')).toBeFocused();
  await page.locator('#fountain-save-here').click();
  await expect(page.locator('#fountain-count')).toContainText('4 / 30');
  await expect.poll(() => page.evaluate(() => window.academyMoonlitCourtyard3D.diagnostics().memoryCrystals)).toBe(4);
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), memoryKey);
  expect(saved).toHaveLength(4);
  expect(saved.find(memory => memory.id === 'courtyard-test-milestone')).toBeTruthy();
  expect(await page.evaluate(key => localStorage.getItem(key), progressKey)).toBe('existing-puzzle-progress-sentinel');
  const note = page.getByLabel('Memory note for The Moonlit Courtyard');
  await note.fill('Saved during the courtyard 3D regression test.');
  const saveNote = note.locator('xpath=..').locator('button').first();
  await saveNote.click();
  await expect(saveNote).toHaveText('✓ Saved');
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).find(memory => memory.title === 'The Moonlit Courtyard')?.note, memoryKey))
    .toBe('Saved during the courtyard 3D regression test.');

  const intervals = await page.evaluate(async () => {
    const samples = [];
    let last = performance.now();
    for (let i = 0; i < 60; i++) {
      await new Promise(requestAnimationFrame);
      const now = performance.now(); samples.push(now - last); last = now;
    }
    return samples.sort((a, b) => a - b);
  });
  const diagnostics = {
    profile: testInfo.project.name,
    backend: 'WebGL active in Playwright; CI Chromium is software rendered with SwiftShader',
    quality: {high: starting, balanced, performance},
    runtime: await page.evaluate(() => ({elapsedMs: Math.round(performance.now()), jsHeapBytes: performance.memory?.usedJSHeapSize ?? null})),
    frameIntervalMs: {median: intervals[29], p95: intervals[56]},
    note: 'Emulated profile and software-rendered frame samples are not physical-device performance measurements.'
  };
  console.log('COURTYARD_3D_DIAGNOSTICS ' + JSON.stringify(diagnostics));
  await testInfo.attach('moonlit-courtyard-3d-diagnostics.json', {body: Buffer.from(JSON.stringify(diagnostics, null, 2)), contentType: 'application/json'});

  await page.reload();
  await expect(page.locator('#courtyard-3d-status')).toContainText('Performance detail');
  expect(await page.evaluate(key => localStorage.getItem(key), progressKey)).toBe('existing-puzzle-progress-sentinel');
  const reloaded = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), memoryKey);
  expect(reloaded).toHaveLength(4);
  expect(reloaded.find(memory => memory.title === 'The Moonlit Courtyard')?.note).toBe('Saved during the courtyard 3D regression test.');
  expect(reloaded.find(memory => memory.id === 'courtyard-test-milestone')).toBeTruthy();
  expect(errors).toEqual([]);
});

test('Courtyard WebGL fallback keeps the Fountain memory collection working', async ({page}) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(({memoryKey, progressKey}) => {
    localStorage.setItem(memoryKey, JSON.stringify([{id: 'fallback-memory', title: 'Existing fallback memory', path: 'academy-royal-gardens.html', date: '2026-11-20', note: ''}]));
    localStorage.setItem(progressKey, 'fallback-progress-sentinel');
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {
      if (typeof type === 'string' && type.toLowerCase().startsWith('webgl')) return null;
      return original.call(this, type, ...args);
    };
  }, {memoryKey, progressKey});
  await page.goto(base + 'academy-moonlit-courtyard.html');
  await expect(page.locator('#courtyard-3d-status')).toContainText('3D is unavailable');
  await expect(page.locator('.royal-amethyst-fountain')).toBeVisible();
  await expect(page.locator('.royal-flag-gallery a')).toHaveCount(4);
  await expect(page.locator('.academy-gizmo')).toBeVisible();
  await page.locator('#fountain-save-here').click();
  // The courtyard's existing first-visit keepsake is added alongside the
  // seeded memory before the manually saved courtyard memory.
  await expect(page.locator('#fountain-count')).toContainText('3 / 30');
  const memories = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), memoryKey);
  expect(memories).toHaveLength(3);
  expect(memories.some(memory => memory.id === 'fallback-memory')).toBe(true);
  expect(await page.evaluate(key => localStorage.getItem(key), progressKey)).toBe('fallback-progress-sentinel');
  expect(errors).toEqual([]);
});

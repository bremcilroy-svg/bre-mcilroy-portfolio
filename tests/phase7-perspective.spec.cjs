const {test, expect} = require('@playwright/test');
const base = 'http://127.0.0.1:8765/';
const viewKey = 'amethyst-academy-player-perspective-v1';
const saveKeys = [
  'bre-poetry-vault-heart-v1', 'bre-poetry-vault-mirror-v1',
  'bre-poetry-vault-labyrinth-v1', 'bre-poetry-vault-dawn-v1'
];

function seedProgress({viewKey}) {
  const seeds = {
    'bre-poetry-vault-heart-v1': {found:['rose','ribbon','moon','key'],drawerOpen:true,diaryOpen:true,completed:true},
    'bre-poetry-vault-mirror-v1': {found:['thorn','tear','veil','ember'],slots:['tear','ember','thorn','veil'],turns:{thorn:0,tear:0,veil:0,ember:0},restored:true,unlocked:true,completed:true},
    'bre-poetry-vault-labyrinth-v1': {noteRead:true,gearInstalled:true,hour:3,minute:0,clockSet:true,found:['ash','ivy','bell','star'],slots:['ivy','star','bell','ash'],unlocked:true,completed:true},
    'bre-poetry-vault-dawn-v1': {emblemPlaced:true,panels:['star','moon','horizon','sun'],turns:{star:0,moon:0,horizon:0,sun:0},lightAligned:true,found:['seed','rain','leaf','bloom'],book:['seed','rain','leaf','bloom'],unlocked:true,completed:true}
  };
  for (const [key,value] of Object.entries(seeds)) if (localStorage.getItem(key) === null) localStorage.setItem(key, JSON.stringify(value));
  // Unlock the isolated author-room fixture with synthetic completed progress;
  // never touch a real profile or rewrite an existing save.
  if (localStorage.getItem('bre-poetry-vault-society-v1') === null) localStorage.setItem('bre-poetry-vault-society-v1', JSON.stringify({hints:[],clean:[],inscriptions:[],started:[],fifth:true}));
  if (localStorage.getItem('bre-poetry-vault-keepsakes-v1') === null) localStorage.setItem('bre-poetry-vault-keepsakes-v1', JSON.stringify({secrets:['heart','mirror','labyrinth','dawn']}));
  if (localStorage.getItem(viewKey) === null) localStorage.setItem(viewKey, 'first');
  if (localStorage.getItem('phase7-progress-sentinel') === null) localStorage.setItem('phase7-progress-sentinel', 'preserve-existing-progress');
}

test('Heart Chamber perspective toggle works with each emulated browser profile', async ({page}, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(seedProgress, {viewKey});
  await page.goto(base + 'poetry-vault.html?resume=1');
  const canvas = page.locator('#room-canvas');
  await expect(canvas).toBeVisible({timeout:30000});
  await expect(canvas).toHaveAttribute('data-perspective', 'first', {timeout:30000});
  const toggle = page.getByRole('button', {name:'Switch to third-person view'});
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(canvas).toHaveAttribute('data-perspective', 'third');
  await expect(page.getByRole('button', {name:'Switch to first-person view'})).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(key => localStorage.getItem(key), viewKey)).toBe('third');

  const position = () => canvas.evaluate(element => JSON.parse(element.dataset.cameraPosition));
  const before = await position();
  if (/android|iphone|tablet/i.test(testInfo.project.name)) {
    await page.getByRole('button', {name:'Move forward'}).tap();
  } else {
    await canvas.evaluate(element => element.focus());
    await page.keyboard.down('w'); await page.waitForTimeout(300); await page.keyboard.up('w');
  }
  await expect.poll(async () => {
    const after = await position();
    return Math.hypot(after[0]-before[0], after[1]-before[1]);
  }).toBeGreaterThan(.02);

  await page.reload();
  await expect(page.locator('#room-canvas')).toHaveAttribute('data-perspective', 'third', {timeout:30000});
  await page.getByRole('button', {name:'Switch to first-person view'}).click();
  await expect(page.locator('#room-canvas')).toHaveAttribute('data-perspective', 'first');
  expect(await page.evaluate(key => localStorage.getItem(key), 'phase7-progress-sentinel')).toBe('preserve-existing-progress');
  expect(errors).toEqual([]);
});

test('the four walkable Poetry Vault chapters share the saved perspective without changing puzzle saves', async ({page}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'The all-chapter camera loop runs in desktop Chromium; touch movement is covered in the profile matrix above.');
  await page.addInitScript(seedProgress, {viewKey});
  await page.goto(base + 'poetry-vault.html?resume=1');
  const before = await page.evaluate(() => ['bre-poetry-vault-heart-v1','bre-poetry-vault-mirror-v1','bre-poetry-vault-labyrinth-v1','bre-poetry-vault-dawn-v1'].map(key => localStorage.getItem(key)));
  let expected = 'first';
  for (const route of ['poetry-vault.html','poetry-vault-mirror.html','poetry-vault-labyrinth.html','poetry-vault-dawn.html']) {
    await page.goto(base + route + '?resume=1');
    const canvas = page.locator('#room-canvas');
    await expect(canvas).toBeVisible({timeout:30000});
    await expect(canvas).toHaveAttribute('data-perspective', expected, {timeout:30000});
    if (expected === 'first') await page.getByRole('button', {name:'Switch to third-person view'}).click();
    await expect(canvas).toHaveAttribute('data-perspective', 'third');
    expected = 'third';
    expect(await page.evaluate(key => localStorage.getItem(key), viewKey)).toBe('third');
  }
  const after = await page.evaluate(keys => keys.map(key => localStorage.getItem(key)), saveKeys);
  expect(after).toEqual(before);
});

test('the owner playable Study uses the same first- and third-person preference', async ({page}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Owner Study WebGL check runs in desktop Chromium.');
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(seedProgress, {viewKey});
  await page.goto(base + 'poetry-vault-author-room.html');
  const viewport = page.locator('.pv12-viewport');
  await expect(viewport).toBeVisible({timeout:30000});
  await expect.poll(async () => await page.getByRole('button', {name:'Switch to third-person view'}).count() > 0
    || await panelUnavailable(page), {timeout:40000}).toBe(true);
  if (await panelUnavailable(page)) {
    await expect(page.locator('.pv12-note')).toContainText('3D isn\'t supported');
    return;
  }
  const canvas = viewport.locator('canvas');
  await expect(page.getByRole('button', {name:'Switch to third-person view'})).toBeVisible({timeout:30000});
  await expect(canvas).toHaveAttribute('data-perspective','first');
  await page.getByRole('button', {name:'Switch to third-person view'}).click();
  await expect(canvas).toHaveAttribute('data-perspective','third');
  await page.getByRole('button', {name:'Switch to first-person view'}).click();
  await expect(canvas).toHaveAttribute('data-perspective','first');
  expect(await page.evaluate(key => localStorage.getItem(key), 'phase7-progress-sentinel')).toBe('preserve-existing-progress');
  expect(errors).toEqual([]);
});

async function panelUnavailable(page) {
  return page.locator('#pv12-experience[data-unavailable="true"]').count().then(count => count > 0);
}

const {test,expect}=require('@playwright/test');
const base='http://127.0.0.1:8765/';
test('Fifth Door puzzle sequence and Author Study navigation retain completion after reload',async({page},testInfo)=>{
 const browserErrors=[];page.on('pageerror',e=>browserErrors.push(e.message));
 const checkpoint=async(label)=>{const details=await page.evaluate(()=>({url:location.pathname,gate:document.querySelector('#gate')?.textContent?.slice(0,220),gameHidden:document.querySelector('#game')?.hidden,active:[1,2,3,4].filter(i=>document.querySelector('#step-'+i)?.classList.contains('active')),fifth:localStorage.getItem('bre-poetry-vault-fifth-v1')}));await testInfo.attach('fifth-door-'+label,{body:JSON.stringify({...details,browserErrors},null,2),contentType:'application/json'});};
 await page.goto(base+'poetry-vault-entrance.html');
 await page.evaluate(()=>{
  const states={
   'bre-poetry-vault-heart-v1':{found:['rose','ribbon','moon','key'],drawerOpen:true,diaryOpen:true,completed:true},
   'bre-poetry-vault-mirror-v1':{found:['thorn','tear','veil','ember'],slots:['tear','ember','thorn','veil'],turns:{thorn:0,tear:0,veil:0,ember:0},restored:true,unlocked:true,completed:true},
   'bre-poetry-vault-labyrinth-v1':{noteRead:true,gearInstalled:true,hour:3,minute:0,clockSet:true,found:['ash','ivy','bell','star'],slots:['ivy','star','bell','ash'],unlocked:true,completed:true},
   'bre-poetry-vault-dawn-v1':{emblemPlaced:true,panels:['star','moon','horizon','sun'],turns:{star:0,moon:0,horizon:0,sun:0},lightAligned:true,found:['bloom','leaf','seed','rain'],book:['seed','rain','leaf','bloom'],unlocked:true,completed:true},
   'bre-poetry-vault-keepsakes-v1':{secrets:['heart','mirror','labyrinth','dawn']}
  };
  for(const [key,value] of Object.entries(states))localStorage.setItem(key,JSON.stringify(value));
 });
 await page.goto(base+'poetry-vault-fifth-door.html');
 await checkpoint('initial');
 await expect(page.locator('#game')).toBeVisible({timeout:15000});
 await expect(page.locator('#step-1')).toHaveClass(/active/);
 for(const id of ['heart','mirror','labyrinth','dawn'])await page.locator('[data-seal="'+id+'"]').click();
 await checkpoint('seals');
 await expect(page.locator('#step-2')).toHaveClass(/active/);
 for(const [dial,count] of [[0,1],[1,3],[2,2]])for(let n=0;n<count;n++)await page.locator('[data-dial="'+dial+'"]').click();
 await page.locator('#align').click();
 await checkpoint('constellation');
 await expect(page.locator('#step-3')).toHaveClass(/active/);
 for(const word of ['LISTEN','REMEMBER','RELEASE','BEGIN'])await page.locator('[data-word="'+word+'"]').click();
 await checkpoint('epilogue');
 await expect(page.locator('#step-4')).toHaveClass(/active/);
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('bre-poetry-vault-fifth-v1')||'null')?.stage),{timeout:10000}).toBe(4);
 await page.reload();
 await checkpoint('after-reload');
 await expect(page.locator('#game')).toBeVisible();
 await expect(page.locator('#step-4')).toHaveClass(/active/);
 await page.getByRole('link',{name:/Enter the Author/}).click();
 await expect(page).toHaveURL(/poetry-vault-author-room[.]html/, {timeout:30000});
});

test('castle threshold keeps the return cinematic active after repeated activation', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'no-preference'});
  await page.goto(base + 'poetry-vault.html');
  await page.locator('#start').click();
  const returnDoor = page.getByRole('link', {name: 'Return through the door to the castle lobby'});
  await expect(returnDoor).toBeVisible();

  const transition = await returnDoor.evaluate(async link => {
    link.click();
    link.click();
    await Promise.resolve();
    const overlay = document.getElementById('pv155-transition');
    return {
      visible: !overlay.hidden,
      crossing: overlay.classList.contains('aca-crossing'),
      caption: overlay.querySelector('p').textContent
    };
  });
  expect(transition).toEqual({
    visible: true,
    crossing: true,
    caption: '✦ Returning to the castle lobby… ✦'
  });
  await expect(page).toHaveURL(/poetry-vault-entrance\.html$/);
});

test('castle map keeps keyboard focus while progress is unchanged and refreshes after completion', async ({page}) => {
  await page.goto(base + 'poetry-vault-entrance.html');
  await page.locator('.pv155-open').click();
  await page.locator('.pv192-map-toggle').click();
  const heart = page.getByRole('button', {name: 'Heart Chamber, open passage'});
  await heart.focus();
  const observed = await heart.evaluate(async button => {
    const list = document.querySelector('.pv192-map');
    let replacements = 0;
    const observer = new MutationObserver(records => {replacements += records.length;});
    observer.observe(list, {childList: true});
    await new Promise(resolve => setTimeout(resolve, 2300));
    observer.disconnect();
    return {focused: document.activeElement === button, replacements};
  });
  expect(observed).toEqual({focused: true, replacements: 0});

  await page.evaluate(() => localStorage.setItem('bre-poetry-vault-heart-v1', JSON.stringify({
    found: ['rose', 'ribbon', 'moon', 'key'], drawerOpen: true, diaryOpen: true, completed: true
  })));
  await expect(page.getByRole('button', {name: 'Shattered Mirror, open passage'})).toBeEnabled();
});

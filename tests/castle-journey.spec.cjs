const {test,expect}=require('@playwright/test');
const base='http://127.0.0.1:8765/';
test('Fifth Door puzzle sequence and Author Study navigation retain completion after reload',async({page})=>{
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
 await expect(page.locator('#game')).toBeVisible({timeout:15000});
 for(const id of ['heart','mirror','labyrinth','dawn'])await page.locator('[data-seal="'+id+'"]').click();
 await expect(page.locator('#step-2')).toHaveClass(/active/);
 for(const [dial,count] of [[0,1],[1,3],[2,2]])for(let n=0;n<count;n++)await page.locator('[data-dial="'+dial+'"]').click();
 await page.locator('#align').click();
 await expect(page.locator('#step-3')).toHaveClass(/active/);
 for(const word of ['LISTEN','REMEMBER','RELEASE','BEGIN'])await page.locator('[data-word="'+word+'"]').click();
 await expect(page.locator('#step-4')).toHaveClass(/active/);
 await page.reload();
 await expect(page.locator('#step-4')).toHaveClass(/active/);
 await page.getByRole('link',{name:/Enter the Author/}).click();
 await expect(page).toHaveURL(/poetry-vault-author-room[.]html/);
});

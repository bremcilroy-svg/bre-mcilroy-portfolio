/* Phase 5 diagnostic only. No gameplay state is written by this test.
 * Run with the existing Playwright suite and local server on port 8765.
 * Results are attached to each test; they are observations, not pass/fail FPS targets.
 */
const {test, expect} = require('@playwright/test');
const base = 'http://127.0.0.1:8765/';
const settings = ['high', 'balanced', 'performance'];
const key = 'bre-poetry-vault-heart-graphics-v1';
const profiles = [
  {name:'desktop-landscape', width:1280,height:820},
  {name:'phone-portrait',width:390,height:844},
  {name:'phone-landscape',width:844,height:390},
  {name:'tablet-portrait',width:768,height:1024},
  {name:'tablet-landscape',width:1024,height:768}
];
for (const profile of profiles) {
  test('Phase 5 Heart Chamber diagnostics: '+profile.name, async ({browser},testInfo) => {
    test.setTimeout(120000);
    const context=await browser.newContext({viewport:{width:profile.width,height:profile.height},reducedMotion:'reduce'});
    const page=await context.newPage();
    const results=[];
    try {
      for (const quality of settings) {
        await page.goto(base+'poetry-vault.html',{waitUntil:'domcontentloaded'});
        await page.evaluate(([storageKey,value])=>localStorage.setItem(storageKey,value),[key,quality]);
        await page.reload({waitUntil:'domcontentloaded'});
        await expect(page.locator('#start')).toBeEnabled({timeout:15000});
        await page.locator('#start').click();
        await page.waitForTimeout(1000);
        const metrics=await page.evaluate(async () => {
          const frames=[];
          let previous=performance.now();
          await new Promise(resolve=>{
            const end=previous+3000;
            function tick(now){
              frames.push(now-previous);
              previous=now;
              if(now<end)requestAnimationFrame(tick);else resolve();
            }
            requestAnimationFrame(tick);
          });
          frames.shift();
          frames.sort((a,b)=>a-b);
          const percentile=p=>frames[Math.min(frames.length-1,Math.floor((frames.length-1)*p))]??null;
          const canvas=document.querySelector('canvas[data-renderer], canvas');
          return {
            samples:frames.length,
            medianFrameMs:percentile(.5),
            p95FrameMs:percentile(.95),
            p99FrameMs:percentile(.99),
            maxFrameMs:frames.at(-1)??null,
            canvasRenderer:canvas?.dataset.renderer??null,
            lastRenderMs:canvas?.dataset.renderMs??null,
            lastFaceCount:canvas?.dataset.faceCount??null,
            jsHeapBytes:performance.memory?.usedJSHeapSize??null,
            viewport:{width:innerWidth,height:innerHeight},
            documentWidth:document.documentElement.scrollWidth,
            pageErrors:[]
          };
        });
        results.push({quality,...metrics});
      }
      await testInfo.attach('heart-chamber-phase5-'+profile.name+'.json',{
        body:JSON.stringify({profile,browser:testInfo.project.name,results},null,2),
        contentType:'application/json'
      });
      expect(results).toHaveLength(3);
      for(const result of results){
        expect(result.samples).toBeGreaterThan(20);
        expect(result.documentWidth).toBeLessThanOrEqual(result.viewport.width+12);
      }
    } finally {await context.close();}
  });
}

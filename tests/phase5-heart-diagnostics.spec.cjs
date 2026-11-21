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
for (const [index, profile] of profiles.entries()) {
  test('Phase 5 Heart Chamber diagnostics: '+profile.name, async ({page},testInfo) => {
    test.setTimeout(120000);
    // Keep the project’s touch, DPR and browser settings when changing orientation.
    await page.setViewportSize({width:profile.width,height:profile.height});
    await page.emulateMedia({reducedMotion:'reduce'});
    const results=[];
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('response',response=>{
      const type=response.request().resourceType();
      if(response.status()>=400 && response.url().startsWith(base) && ['script','stylesheet'].includes(type)){
        errors.push('Asset HTTP '+response.status()+': '+response.url());
      }
    });
    await page.goto(base+'poetry-vault.html',{waitUntil:'domcontentloaded'});
    await page.locator('#start').click();
    const canvas=page.locator('#room-canvas');
    await expect(canvas).toHaveAttribute('data-paused','false',{timeout:30000});
    const backend=await canvas.evaluate(element=>{
      if(element.dataset.renderer)return element.dataset.renderer;
      const gl=element.getContext('webgl2');
      if(!gl)return 'unavailable';
      const extension=gl.getExtension('WEBGL_debug_renderer_info');
      return extension?gl.getParameter(extension.UNMASKED_RENDERER_WEBGL):'WebGL 2';
    });
    const hasWebGL=await canvas.evaluate(element=>Boolean(element.getContext('webgl2')));
    const order=settings.map((_,i)=>settings[(i+index)%settings.length]);
    const qualityControl=page.getByLabel('Heart Chamber graphics');
    const saveBefore=await page.evaluate(()=>localStorage.getItem('bre-poetry-vault-heart-v1'));
    for (const quality of hasWebGL?order:[null]) {
      await page.locator('#settings-button').click();
      if(hasWebGL){
        await expect(qualityControl).toBeEnabled();
        await qualityControl.selectOption(quality);
        if(quality!=='high'||order[0]!=='high'){
          expect(await page.evaluate(k=>localStorage.getItem(k),key)).toBe(quality);
        }
      }else{
        await expect(qualityControl).toBeDisabled();
      }
      await page.locator('#close-panel').click();
      await expect(canvas).toHaveAttribute('data-paused','false');
      const metrics=await page.evaluate(async () => {
        const frames=[];
        let previous=performance.now();
        await new Promise(resolve=>{
          const end=previous+3000;
          function tick(now){
            frames.push(now-previous);
            previous=now;
            if(now<end||frames.length<5)requestAnimationFrame(tick);else resolve();
          }
          requestAnimationFrame(tick);
        });
        frames.shift();
        frames.sort((a,b)=>a-b);
        const percentile=p=>frames[Math.min(frames.length-1,Math.floor((frames.length-1)*p))]??null;
        const canvas=document.querySelector('#room-canvas');
        return {
          samples:frames.length,
          medianFrameMs:percentile(.5),
          p95FrameMs:percentile(.95),
          p99FrameMs:percentile(.99),
          maxFrameMs:frames.at(-1)??null,
          buffer:{width:canvas.width,height:canvas.height},
          devicePixelRatio,
          touch:navigator.maxTouchPoints>0,
          lastRenderMs:canvas?.dataset.renderMs??null,
          lastFaceCount:canvas?.dataset.faceCount??null,
          jsHeapBytes:performance.memory?.usedJSHeapSize??null,
          viewport:{width:innerWidth,height:innerHeight},
          documentWidth:document.documentElement.scrollWidth
        };
      });
      results.push({quality,...metrics});
      expect(await page.evaluate(()=>localStorage.getItem('bre-poetry-vault-heart-v1'))).toBe(saveBefore);
    }
    const report={profile,browser:testInfo.project.name,backend,hasWebGL,errors,results};
    await testInfo.attach('heart-chamber-phase5-'+profile.name+'.json',{
      body:JSON.stringify(report,null,2),
      contentType:'application/json'
    });
    expect(results).toHaveLength(hasWebGL?3:1);
    expect(errors,'Browser errors during graphics profiling').toEqual([]);
    for(const result of results){
      // A slow renderer is valid profiling data.
      expect(result.samples).toBeGreaterThan(0);
      expect(result.documentWidth).toBeLessThanOrEqual(result.viewport.width+12);
    }
  });
}

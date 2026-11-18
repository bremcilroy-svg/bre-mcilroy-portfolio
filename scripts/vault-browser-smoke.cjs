/* Browser-level smoke test: visit all Vault pages without altering real saves. */
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const pages=['poetry-vault-entrance.html','poetry-vault.html','poetry-vault-mirror.html','poetry-vault-labyrinth.html','poetry-vault-dawn.html','poetry-vault-society.html','poetry-vault-fifth-door.html','poetry-vault-author-room.html'];
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg','.woff2':'font/woff2','.json':'application/json'};
const server=http.createServer((req,res)=>{let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/+/, '')}catch{res.writeHead(400).end();return}if(!name)name='index.html';const full=path.resolve(name);if(!full.startsWith(process.cwd()+path.sep)){res.writeHead(403).end();return}fs.readFile(full,(err,data)=>{if(err){res.writeHead(404).end('Not found');return}res.writeHead(200,{'Content-Type':mime[path.extname(full)]||'application/octet-stream'}).end(data)})});
(async()=>{await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port+'/';let browser,failures=0;
try{browser=await chromium.launch({headless:true});for(const page of pages){const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const tab=await context.newPage();const errors=[];tab.on('pageerror',e=>errors.push(e.message));
tab.on('response',response=>{const url=response.url();if(url.startsWith(base)&&response.status()>=400&&/\.(?:js|css|html)(?:\?|$)/.test(url))errors.push('Missing page asset '+response.status()+' '+url.slice(base.length))});
const response=await tab.goto(base+page,{waitUntil:'domcontentloaded'});
await tab.waitForTimeout(2300);
if(response.status()!==200)errors.push('HTTP '+response.status());
if(!await tab.locator('body').count())errors.push('missing body');
if(page==='poetry-vault-entrance.html'){
 const enter=tab.locator('#enter-vault'),how=tab.locator('#how-to-play');
 if(!await enter.count()||!await how.count())errors.push('entrance controls missing');
 if(await how.count()&&await how.isDisabled())errors.push('How to Play never enabled');
 if(await tab.locator('#continue-game').isEnabled())errors.push('Fresh profile incorrectly offers Continue Game');
}
if(page==='poetry-vault.html'){
 if(!await tab.locator('#start').count())errors.push('Heart Chamber start missing');
 try{await tab.locator('#start').waitFor({state:'visible',timeout:10000});await tab.waitForFunction(()=>!document.querySelector('#start')?.disabled,null,{timeout:10000})}catch{errors.push('Heart Chamber start never enabled')}
}
if(['poetry-vault-mirror.html','poetry-vault-labyrinth.html','poetry-vault-dawn.html'].includes(page)){
 if(!await tab.locator('#start').count())errors.push('chapter start missing');
 if(await tab.locator('#start').isEnabled())errors.push('Fresh profile bypassed previous chapter gate');
}
if(page==='poetry-vault-fifth-door.html'){
 if(await tab.locator('#game').isVisible())errors.push('Fresh profile bypassed Fifth Door gate');
}
if(errors.length){failures++;console.error('FAIL',page,errors.slice(0,5))}else console.log('PASS',page);await context.close()}}finally{await browser?.close();server.close()}if(failures)process.exitCode=1})().catch(e=>{console.error(e);server.close();process.exitCode=1});

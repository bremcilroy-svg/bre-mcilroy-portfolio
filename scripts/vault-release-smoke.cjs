/* Release smoke checks: source integrity, syntax, local chapter assets. */
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const chapters=['poetry-vault-entrance.html','poetry-vault.html','poetry-vault-mirror.html','poetry-vault-labyrinth.html','poetry-vault-dawn.html','poetry-vault-society.html','poetry-vault-fifth-door.html','poetry-vault-author-room.html'];
let failures=0,checked=0;
function fail(message){console.error('FAIL:',message);failures++}
for(const file of chapters){
 if(!fs.existsSync(file)){fail('Missing chapter '+file);continue}
 const html=fs.readFileSync(file,'utf8');
 for(const match of html.matchAll(/<(?:script|link)\b[^>]*?\b(?:src|href)=["']([^"']+)["']/gi)){
  const url=match[1].split(/[?#]/)[0];if(!url||/^(https?:|\/\/|data:|#)/i.test(url))continue;
  const local=path.resolve(path.dirname(file),decodeURIComponent(url));
  if(!fs.existsSync(local))fail(file+' references missing '+url);else checked++;
 }
 if(!html.includes('</html>'))fail(file+' has no closing html tag');
}
const js=fs.readdirSync('.').filter(x=>x.endsWith('.js'));
for(const file of js){const run=cp.spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(run.status!==0)fail(file+' syntax: '+(run.stderr||run.error||'unknown error'));else checked++}
console.log('Smoke checks: '+checked+' checks, '+failures+' failures');
if(failures)process.exitCode=1;

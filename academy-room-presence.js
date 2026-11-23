/* Immersive chapter presence layer: follows actual first-person room interactions.
   No parallel movement system, fake hotspots, or changes to puzzle state. */
const themes={
 'poetry-vault.html':{name:'Heart Chamber',ambient:'The firelight warms the old library.',icon:'♥'},
 'poetry-vault-mirror.html':{name:'Shattered Mirror',ambient:'Cold silver light glimmers across the broken glass.',icon:'✧'},
 'poetry-vault-labyrinth.html':{name:'Midnight Labyrinth',ambient:'Lanternlight trembles along the passage.',icon:'☾'},
 'poetry-vault-dawn.html':{name:'Door to Tomorrow',ambient:'Soft morning light spills across the conservatory.',icon:'☀'}
};
function mount(){
 const theme=themes[location.pathname.split('/').pop()];
 const play=document.getElementById('play-ui'),scene=document.getElementById('scene'),interact=document.getElementById('interact'),prompt=document.getElementById('look-prompt');
 if(!theme||!play||!scene||!interact||!prompt||document.getElementById('aca-room-presence'))return;
 const hud=document.createElement('div');hud.id='aca-room-presence';hud.className='aca-room-presence';hud.hidden=true;
 hud.innerHTML='<div class="aca-presence-ambience" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="aca-presence-indicator" role="status" aria-live="polite"><span class="aca-presence-symbol"></span><span class="aca-presence-text"></span></div><button type="button" class="aca-presence-approach" hidden>✦ Inspect nearby object</button>';
 scene.insertAdjacentElement('afterend',hud);
 const text=hud.querySelector('.aca-presence-text'),symbol=hud.querySelector('.aca-presence-symbol'),approach=hud.querySelector('.aca-presence-approach');
 symbol.textContent=theme.icon;
 function update(){
  const active=!play.hidden&&getComputedStyle(play).display!=='none';
  hud.hidden=!active;if(!active)return;
  const nearby=!interact.disabled;
  hud.classList.toggle('aca-near-object',nearby);
  text.textContent=nearby?prompt.textContent.trim()||'An object catches your eye.':theme.ambient;
  approach.hidden=!nearby;
  approach.disabled=!nearby;
  if(nearby)approach.textContent=interact.textContent.trim()||'Inspect nearby object';
 }
 approach.addEventListener('click',()=>{if(!play.hidden&&!interact.disabled)interact.click()});
 const observer=new MutationObserver(update);
 observer.observe(play,{attributes:true,attributeFilter:['hidden','style','class']});
 observer.observe(interact,{attributes:true,attributeFilter:['disabled'],childList:true,subtree:true});
 observer.observe(prompt,{childList:true,characterData:true,subtree:true});
 document.addEventListener('visibilitychange',update);
 window.addEventListener('pageshow',update);
 update();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();

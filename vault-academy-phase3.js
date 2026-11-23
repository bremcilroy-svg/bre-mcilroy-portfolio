/* Phase 3 — visual playable-room dressing only.
 * Keeps existing room renderer, object coordinates and puzzle logic intact.
 */
(()=>{'use strict';
if(location.pathname.split('/').pop()!=='poetry-vault.html')return;
function init(){
 const vault=document.querySelector('#vault'),play=document.querySelector('#play-ui'),welcome=document.querySelector('#welcome');
 if(!vault||!play||!welcome||document.querySelector('#academy-great-hall'))return;
 document.body.classList.add('academy-p3');
 const hall=document.createElement('div');hall.id='academy-great-hall';hall.setAttribute('aria-hidden','true');
 hall.innerHTML='<div class="academy-ceiling"></div><div class="academy-house-flags"><span>☾</span><span>♜</span><span>❀</span><span>✧</span></div><span class="academy-light"></span><span class="academy-light"></span><span class="academy-light"></span><span class="academy-light"></span><p class="academy-caption">The Enchanted Academy · Initiation Hall</p>';
 // The existing play UI and HUD must remain above the decorative layer.
 play.after(hall);
 const heading=play.querySelector('.chapter-hud .eyebrow');
 if(heading)heading.textContent='I / The Academy Initiation';
 const prompt=play.querySelector('#look-prompt');
 if(prompt&&!prompt.textContent.trim())prompt.textContent='The four letters are your initiation clues.';
 const panel=document.querySelector('#panel');
 // Update only static chapter labels, never puzzle content or dialog handlers.
 const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content='#21162d';
 // Avoid touching canvas pointer events or game progress.
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

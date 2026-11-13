/* Gizmo's Whole-Vault Companion — additive, no puzzle/auth/save modifications */
(()=>{'use strict';
const names={
 'poetry-vault-entrance.html':'The Entrance',
 'poetry-vault.html':'The Heart Chamber',
 'poetry-vault-mirror.html':'The Shattered Mirror',
 'poetry-vault-labyrinth.html':'The Midnight Labyrinth',
 'poetry-vault-dawn.html':'The Door to Tomorrow',
 'poetry-vault-society.html':'The Keepers’ Hall',
 'poetry-vault-fifth-door.html':'The Fifth Door',
 'poetry-vault-author-room.html':'The Author’s Study'
};
const file=location.pathname.split('/').pop()||'poetry-vault-entrance.html';
if(!names[file])return;
function init(){
 if(document.querySelector('#pv-gizmo-companion'))return;
 const author=file==='poetry-vault-author-room.html';
 const room=document.querySelector('#room');
 const isAllowed=()=>!author||Boolean(room&&!room.hidden);
 const wrap=document.createElement('aside');wrap.id='pv-gizmo-companion';wrap.setAttribute('aria-label','Gizmo walking companion');
 wrap.innerHTML=`<button type="button" class="pvg-cat" aria-label="Pet Gizmo" title="Pet Gizmo"><span class="pvg-art" aria-hidden="true">🐈</span><span class="pvg-shadow" aria-hidden="true"></span></button><p class="pvg-speech" role="status" aria-live="polite" hidden></p><button class="pvg-rest" type="button" aria-pressed="false">🐾 Rest</button>`;
 document.body.append(wrap);
 const cat=wrap.querySelector('.pvg-cat'),art=wrap.querySelector('.pvg-art'),speech=wrap.querySelector('.pvg-speech'),rest=wrap.querySelector('.pvg-rest');
 const guide=document.querySelector('#gizmo-guide .gg-character svg');
 if(guide){const clone=guide.cloneNode(true);clone.setAttribute('aria-hidden','true');art.replaceChildren(clone)}
 let resting=false,hideSpeech;
 function talk(s){speech.textContent=s;speech.hidden=false;clearTimeout(hideSpeech);hideSpeech=setTimeout(()=>speech.hidden=true,3500)}
 function setVisibility(){wrap.hidden=!isAllowed();}
 const messages={
  'poetry-vault-entrance.html':'Our adventure begins! I’ll stay with you.',
  'poetry-vault.html':'I smell a secret letter nearby.',
  'poetry-vault-mirror.html':'Careful. Mirrors remember things.',
  'poetry-vault-labyrinth.html':'I’ll help you find the way.',
  'poetry-vault-dawn.html':'We’re almost there!',
  'poetry-vault-society.html':'The Keepers know my pawprints.',
  'poetry-vault-fifth-door.html':'One more door, then home.',
  'poetry-vault-author-room.html':'We made it to my favorite room!'
 };
 cat.addEventListener('click',()=>{if(!isAllowed())return;cat.classList.remove('pvg-pet');void cat.offsetWidth;cat.classList.add('pvg-pet');talk('Purrr! Gizmo loves you too. 💜')});
 rest.addEventListener('click',()=>{resting=!resting;wrap.classList.toggle('pvg-resting',resting);rest.setAttribute('aria-pressed',String(resting));rest.textContent=resting?'🐾 Follow':'🐾 Rest';talk(resting?'Gizmo curls up for a little rest.':'Gizmo is following again!')});
 // Companion pads left and right in response to actual visitor activity, but
 // never intercepts the room's pointer controls or changes game state.
 let target=0,position=0,lastMove=0,raf=0;
 function moveToward(x){if(resting||!isAllowed())return;target=Math.max(-46,Math.min(46,x));wrap.classList.add('pvg-walking');clearTimeout(lastMove);lastMove=setTimeout(()=>wrap.classList.remove('pvg-walking'),750);if(!raf)raf=requestAnimationFrame(animate)}
 function animate(){raf=0;position+=(target-position)*.17;wrap.style.setProperty('--pvg-offset',position+'px');wrap.classList.toggle('pvg-facing-left',target<position-2);if(Math.abs(target-position)>.6)raf=requestAnimationFrame(animate)}
 document.addEventListener('click',e=>{if(e.target.closest('#pv-gizmo-companion'))return;if(e.target.closest('button,[role="button"],a,.pv12-viewport,#scene,.ai6-stage'))moveToward((Math.random()-.5)*85)},{passive:true});
 document.addEventListener('keydown',e=>{if(['ArrowLeft','a','A'].includes(e.key))moveToward(-38);if(['ArrowRight','d','D'].includes(e.key))moveToward(38)},{passive:true});
 if(room){new MutationObserver(setVisibility).observe(room,{attributes:true,attributeFilter:['hidden']})}
 new MutationObserver(setVisibility).observe(document.body,{attributes:true,attributeFilter:['class']});
 setVisibility();
 // A brief welcome when the page is ready, without spoiling any clue.
 if(isAllowed())setTimeout(()=>{if(isAllowed()&&!resting)talk(messages[file])},1200);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

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
 wrap.innerHTML=`<button type="button" class="pvg-cat" aria-label="Pet Gizmo" title="Pet Gizmo"><span class="pvg-art" aria-hidden="true">🐈</span><span class="pvg-shadow" aria-hidden="true"></span></button><p class="pvg-speech" role="status" aria-live="polite" hidden></p><button class="pvg-rest" type="button" aria-pressed="false">🐾 Rest</button><button class="pvg-sound" type="button" aria-pressed="false" title="Toggle recorded cat sounds">🔇 Cat sounds</button><button class="pvg-recordings" type="button" aria-expanded="false" aria-controls="pvg-recording-panel">🎵 Recordings</button><div class="pvg-recording-panel" id="pvg-recording-panel" hidden><label>Meow audio <input class="pvg-meow-file" type="file" accept="audio/*"></label><label>Purr audio <input class="pvg-purr-file" type="file" accept="audio/*"></label><small>Use your own recordings. Files stay on your device and work for this page visit only.</small></div>`;
 document.body.append(wrap);
 const cat=wrap.querySelector('.pvg-cat'),art=wrap.querySelector('.pvg-art'),speech=wrap.querySelector('.pvg-speech'),rest=wrap.querySelector('.pvg-rest'),sound=wrap.querySelector('.pvg-sound'),recordings=wrap.querySelector('.pvg-recordings'),recordingPanel=wrap.querySelector('.pvg-recording-panel');
 const guide=document.querySelector('#gizmo-guide .gg-character svg');
 if(guide){const clone=guide.cloneNode(true);clone.setAttribute('aria-hidden','true');art.replaceChildren(clone)}
 let resting=false,hideSpeech,catSounds=false,lastSound=0,petCount=0;
 // Use recorded cat sounds only. No synthesized meows or robotic speech.
 // These audio files must be added before sounds can play.
 const sounds={meow:'audio/gizmo-meow.mp3',purr:'audio/gizmo-purr.mp3'};
 const clips={},recordedUrls={},unavailable=new Set();
 const soundKey='pv-gizmo-natural-audio-enabled';
 try{catSounds=localStorage.getItem(soundKey)==='yes'}catch{}
 sound.setAttribute('aria-pressed',String(catSounds));
 sound.textContent=catSounds?'🔊 Cat sounds':'🔇 Cat sounds';

 recordings.addEventListener('click',()=>{
   recordingPanel.hidden=!recordingPanel.hidden;
   recordings.setAttribute('aria-expanded',String(!recordingPanel.hidden));
 });
 for(const kind of ['meow','purr']){
   wrap.querySelector('.pvg-'+kind+'-file').addEventListener('change',e=>{
     const file=e.target.files?.[0];
     if(!file)return;
     if(!file.type.startsWith('audio/')){talk('Please choose an audio recording.');return;}
     if(recordedUrls[kind])URL.revokeObjectURL(recordedUrls[kind]);
     recordedUrls[kind]=URL.createObjectURL(file);
     if(clips[kind]){clips[kind].pause();delete clips[kind];}unavailable.delete(kind);
     talk(kind==='meow'?'Meow recording ready! 🐾':'Purr recording ready! 💜');
   });
 }
 window.addEventListener('pagehide',()=>{Object.values(recordedUrls).forEach(url=>URL.revokeObjectURL(url));});

 function playCatSound(kind){
   if(!catSounds||!isAllowed()||document.hidden||Date.now()-lastSound<4500)return;
   const src=recordedUrls[kind]||sounds[kind];if(!src||(!recordedUrls[kind]&&unavailable.has(kind)))return;
   const audio=clips[kind]||(clips[kind]=new Audio(src));
   audio.volume=kind==='purr'?.3:.42;
   audio.currentTime=0;
   lastSound=Date.now();
   audio.play().catch(()=>{
     if(!recordedUrls[kind])unavailable.add(kind);
     // Missing optional files must never interrupt Gizmo's dialogue or puzzle play.
   });
 }
 sound.addEventListener('click',()=>{
   catSounds=!catSounds;try{localStorage.setItem(soundKey,catSounds?'yes':'no')}catch{};sound.setAttribute('aria-pressed',String(catSounds));
   sound.textContent=catSounds?'🔊 Cat sounds':'🔇 Cat sounds';
   if(catSounds){lastSound=0;playCatSound('meow');}else{Object.values(clips).forEach(a=>{a.pause();a.currentTime=0;});}
 });

 // Keep Gizmo's rest/follow preference across castle chapters in this tab.
 const restKey='pv192-gizmo-rest';
 try{resting=sessionStorage.getItem(restKey)==='yes'}catch{};
 wrap.classList.toggle('pvg-resting',resting);
 rest.setAttribute('aria-pressed',String(resting));
 rest.textContent=resting?'🐾 Follow':'🐾 Rest';
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
 cat.addEventListener('click',()=>{if(!isAllowed())return;cat.classList.remove('pvg-pet');void cat.offsetWidth;cat.classList.add('pvg-pet');talk('Purrr! Gizmo loves you too. 💜');petCount++;playCatSound(petCount%4===0?'meow':'purr')});
 rest.addEventListener('click',()=>{resting=!resting;try{sessionStorage.setItem(restKey,resting?'yes':'no')}catch{};wrap.classList.toggle('pvg-resting',resting);rest.setAttribute('aria-pressed',String(resting));rest.textContent=resting?'🐾 Follow':'🐾 Rest';talk(resting?'Gizmo curls up for a little rest.':'Gizmo is following again!');if(!resting)playCatSound('meow')});
 // Companion pads left and right in response to actual visitor activity, but
 // never intercepts the room's pointer controls or changes game state.
 let target=0,position=0,lastMove=0,raf=0;
 function moveToward(x){if(resting||!isAllowed())return;target=Math.max(-46,Math.min(46,x));wrap.classList.add('pvg-walking');clearTimeout(lastMove);lastMove=setTimeout(()=>wrap.classList.remove('pvg-walking'),750);if(!raf)raf=requestAnimationFrame(animate)}
 function animate(){raf=0;position+=(target-position)*.17;wrap.style.setProperty('--pvg-offset',position+'px');wrap.classList.toggle('pvg-facing-left',target<position-2);if(Math.abs(target-position)>.6)raf=requestAnimationFrame(animate)}
 // Make Gizmo's movement intentional in every chapter, rather than random jumps.
 // On touch, mouse, or keyboard exploration he pads toward the visitor's direction.
 document.addEventListener('pointerdown',e=>{
  if(e.target.closest('#pv-gizmo-companion'))return;
  if(e.target.closest('dialog,[role="dialog"],input,textarea,select'))return;
  if(!e.target.closest('#scene,.pv12-viewport,.ai6-stage,[data-move]'))return;
  const control=e.target.closest('[data-move]');
  const dir=control?.dataset.move;
  if(dir==='left'||dir==='turnLeft')moveToward(-38);
  else if(dir==='right'||dir==='turnRight')moveToward(38);
  else moveToward(e.clientX<innerWidth/2?-24:24);
 },{passive:true});
 document.addEventListener('keydown',e=>{if(['ArrowLeft','a','A'].includes(e.key))moveToward(-38);if(['ArrowRight','d','D'].includes(e.key))moveToward(38)},{passive:true});
 if(room){new MutationObserver(setVisibility).observe(room,{attributes:true,attributeFilter:['hidden']})}
 new MutationObserver(setVisibility).observe(document.body,{attributes:true,attributeFilter:['class']});
 setVisibility();
 // A brief welcome when the page is ready, without spoiling any clue.
 if(isAllowed())setTimeout(()=>{if(isAllowed()&&!resting)talk(messages[file])},1200);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

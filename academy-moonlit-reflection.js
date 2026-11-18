/* Optional Moonlit Reflection: independent from the original four-fragment mirror puzzle. */
const KEY='aca-moonlit-reflection-v1';
function init(){
 const play=document.getElementById('play-ui');if(!play||document.getElementById('aca-moonlit-reflection'))return;
 const aside=document.createElement('aside');aside.id='aca-moonlit-reflection';aside.className='aca-moonlit-reflection';
 aside.innerHTML='<button type="button" class="aca-mirror-toggle" aria-expanded="false">🪞 Moonlit Reflection</button><div class="aca-mirror-panel" hidden><h2>The Enchanted Looking Glass</h2><p>Turn each shard until the silver moonlight meets at the center. Each shard rotates by a quarter-turn.</p><div class="aca-mirror-frame" role="group" aria-label="Four rotating mirror shards"></div><p class="aca-mirror-status" role="status" aria-live="polite"></p><div class="aca-mirror-actions"><button type="button" class="aca-mirror-hint">Hint</button><button type="button" class="aca-mirror-reset">Reset shards</button></div><p class="aca-mirror-note">An optional mirror secret. The original fragments, reflection answer, chapter unlock, and saves remain unchanged.</p></div>';
 document.body.append(aside);
 const toggle=aside.querySelector('.aca-mirror-toggle'),panel=aside.querySelector('.aca-mirror-panel'),frame=aside.querySelector('.aca-mirror-frame'),status=aside.querySelector('.aca-mirror-status');
 const initial=[1,3,2,1],goal=[0,0,0,0];let turns=[...initial],solved=false;
 try{solved=JSON.parse(localStorage.getItem(KEY)||'{}').solved===true}catch{}
 if(solved)turns=[...goal];
 function playing(){return !play.hidden&&getComputedStyle(play).display!=='none'}
 function render(){
  aside.hidden=!playing();if(aside.hidden)return;
  aside.classList.toggle('is-restored',solved);frame.replaceChildren();
  turns.forEach((t,i)=>{
   const button=document.createElement('button');button.type='button';button.className='aca-mirror-shard';
   button.setAttribute('aria-label','Rotate mirror shard '+(i+1)+'. Current quarter-turns: '+t);
   button.disabled=solved;
   const glass=document.createElement('span');glass.className='aca-mirror-glass';glass.textContent='✦';glass.style.transform='rotate('+(t*90)+'deg)';
   button.append(glass);
   button.addEventListener('click',()=>{if(!playing()||solved)return;turns[i]=(turns[i]+1)%4;
    if(turns.every((v,j)=>v===goal[j])){solved=true;status.textContent='🪞 The reflection is whole. Silver moonlight reveals: “You are more than the pieces you lost.”';try{localStorage.setItem(KEY,JSON.stringify({solved:true}))}catch{}}
    else status.textContent='The glass shifts. '+turns.filter(x=>x===0).length+' of 4 shards aligned.';render();
   });frame.append(button);
  });
  if(solved)status.textContent='🪞 The reflection is whole. “You are more than the pieces you lost.”';
 }
 toggle.addEventListener('click',()=>{if(!playing())return;panel.hidden=!panel.hidden;toggle.setAttribute('aria-expanded',String(!panel.hidden));render()});
 aside.querySelector('.aca-mirror-hint').addEventListener('click',()=>{status.textContent=solved?'The mirror remembers your reflection.':'Look at the star on each shard. All four must point upward.'});
 aside.querySelector('.aca-mirror-reset').addEventListener('click',()=>{turns=[...initial];solved=false;status.textContent='The glass has scattered again.';try{localStorage.removeItem(KEY)}catch{}render()});
 new MutationObserver(render).observe(play,{attributes:true,attributeFilter:['hidden','style','class']});render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();

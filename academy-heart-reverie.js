/* Optional Heart Chamber enchanted-heart puzzle. No chapter gate or save mutation. */
import {societyStats} from './vault-society.js';
const KEY='aca-heart-reverie-v1';
function init(){
 const play=document.getElementById('play-ui'),vault=document.getElementById('vault');if(!play||!vault||document.getElementById('aca-heart-reverie'))return;
 const panel=document.createElement('aside');panel.id='aca-heart-reverie';panel.className='aca-heart-reverie';
 panel.innerHTML='<button class="aca-heart-toggle" type="button" aria-expanded="false">♥ Enchanted Heart</button><div class="aca-heart-panel" hidden><h2>The Heart That Remembers</h2><p>The heart begins in shadow. Restore its four memories in the order of their journey.</p><div class="aca-heart-art" aria-hidden="true">♥</div><p class="aca-heart-progress" role="status"></p><div class="aca-heart-memories" role="group" aria-label="Choose a memory"></div><div class="aca-heart-controls"><button type="button" class="aca-heart-undo">Undo</button><button type="button" class="aca-heart-hint">Hint</button><button type="button" class="aca-heart-reset">Replay</button></div><p class="aca-heart-message" role="status" aria-live="polite"></p><p class="aca-heart-note">An optional chamber secret. Your original letters, diary, poems, and saved chapter progress are unchanged.</p></div>';
 document.body.append(panel);
 const toggle=panel.querySelector('.aca-heart-toggle'),body=panel.querySelector('.aca-heart-panel'),memories=panel.querySelector('.aca-heart-memories'),progress=panel.querySelector('.aca-heart-progress'),message=panel.querySelector('.aca-heart-message');
 const items=[{id:'spark',name:'The First Spark',clue:'Every connection begins somewhere.'},{id:'trust',name:'The Promise',clue:'A bond grows through trust.'},{id:'fracture',name:'The Heartbreak',clue:'Even a loved heart can crack.'},{id:'healing',name:'The Healing',clue:'After pain, the heart learns to beat again.'}];
 let chosen=[],won=false,hints=0;
 try{won=JSON.parse(localStorage.getItem(KEY)||'{}').won===true}catch{}
 if(won)chosen=[...items];
 function visible(){return !play.hidden&&getComputedStyle(play).display!=='none'}
 function render(){
  panel.hidden=!visible();if(panel.hidden)return;
  panel.classList.toggle('is-healed',won);
  progress.textContent=won?'The enchanted heart has been restored.':chosen.length+' of 4 memories placed';
  memories.replaceChildren();
  items.filter(x=>!chosen.some(y=>y.id===x.id)).forEach(x=>{
   const b=document.createElement('button');b.type='button';b.textContent=x.name;b.addEventListener('click',()=>{
    if(!visible()||won)return;chosen.push(x);
    if(chosen.length===4){
     if(chosen.every((v,i)=>v.id===items[i].id)){won=true;message.textContent='♥ The black heart blooms crimson. A secret of healing is revealed.';try{localStorage.setItem(KEY,JSON.stringify({won:true}))}catch{}}
     else{chosen=[];message.textContent='The heart trembles. These memories are out of order. Try again.'}
    }else message.textContent='Memory placed: '+x.name;
    render();
   });memories.append(b);
  });
  panel.querySelector('.aca-heart-undo').disabled=won||chosen.length===0;
  panel.querySelector('.aca-heart-reset').disabled=!won&&chosen.length===0;
 }
 toggle.addEventListener('click',()=>{if(!visible())return;body.hidden=!body.hidden;toggle.setAttribute('aria-expanded',String(!body.hidden));render()});
 panel.querySelector('.aca-heart-undo').addEventListener('click',()=>{chosen.pop();message.textContent='Last memory returned.';render()});
 panel.querySelector('.aca-heart-hint').addEventListener('click',()=>{message.textContent=items[Math.min(hints++,3)].clue});
 panel.querySelector('.aca-heart-reset').addEventListener('click',()=>{chosen=[];won=false;hints=0;message.textContent='The heart rests in shadow again.';try{localStorage.removeItem(KEY)}catch{}render()});
 const observer=new MutationObserver(render);observer.observe(play,{attributes:true,attributeFilter:['hidden','style','class']});
 render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();

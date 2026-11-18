/* Grand Crescent mechanism: optional in-room puzzle, never an access gate. */
import {societyStats} from './vault-society.js';
import {authorAccess} from './vault-author-state.js';
const sigils=[
 {id:'heart',icon:'♥',name:'Heart',clue:'Where the story first learned to feel.'},
 {id:'mirror',icon:'🪞',name:'Reflection',clue:'Where the self looked back.'},
 {id:'labyrinth',icon:'☾',name:'Moon',clue:'Where darkness tested the path.'},
 {id:'dawn',icon:'🌅',name:'Sunrise',clue:'Where tomorrow first appeared.'}
];
const key='aca-grand-crescent-v1';
function init(){
 const room=document.getElementById('room');if(!room||document.getElementById('aca-grand-crescent'))return;
 const section=document.createElement('section');section.id='aca-grand-crescent';section.className='aca-grand-crescent';
 section.setAttribute('aria-labelledby','aca-crescent-title');
 section.innerHTML='<p class="aca-crescent-kicker">AMETHYST CRESCENT ACADEMY · THE GRAND MYSTERY</p><h2 id="aca-crescent-title">The Grand Crescent Mechanism</h2><p>Four symbols, four chapters, one story. Place the sigils in the order their story unfolded.</p><p class="aca-crescent-status" role="status" aria-live="polite"></p><div class="aca-crescent-slots" aria-label="Crescent sequence"></div><div class="aca-crescent-choices" role="group" aria-label="Choose a sigil"></div><div class="aca-crescent-actions"><button type="button" class="aca-crescent-undo">Undo last</button><button type="button" class="aca-crescent-reset">Start over</button><button type="button" class="aca-crescent-hint">Hint</button></div><p class="aca-crescent-result" role="status" aria-live="polite"></p><p class="aca-crescent-note">An optional epilogue puzzle. It does not change existing access, birthday locks, Bre Pass, or chapter saves.</p>';
 const epilogue=document.getElementById('aca-headmaster-epilogue');
 if(epilogue)room.insertBefore(section,epilogue);else room.append(section);
 const status=section.querySelector('.aca-crescent-status'),slots=section.querySelector('.aca-crescent-slots'),choices=section.querySelector('.aca-crescent-choices'),result=section.querySelector('.aca-crescent-result');
 let selected=[],hintIndex=0,finished=false;
 function eligible(){
  if(room.hidden||getComputedStyle(room).display==='none')return false;
  try{return authorAccess(societyStats()).allowed===true}catch{return false}
 }
 function render(){
  const allowed=eligible();section.hidden=!allowed;if(!allowed)return;
  const stats=societyStats(),available=sigils.filter((s,i)=>stats.journey?.completed?.[i]===true);
  status.textContent=available.length+' of 4 chapter sigils revealed';
  slots.replaceChildren();choices.replaceChildren();
  for(let i=0;i<4;i++){
   const cell=document.createElement('div');cell.className='aca-crescent-slot';
   cell.textContent=selected[i]?selected[i].icon+' '+selected[i].name:'✧ '+(i+1);
   cell.setAttribute('aria-label','Position '+(i+1)+': '+(selected[i]?.name||'empty'));
   slots.append(cell);
  }
  available.filter(s=>!selected.some(v=>v.id===s.id)).forEach(s=>{
   const btn=document.createElement('button');btn.type='button';btn.textContent=s.icon+' '+s.name;btn.disabled=finished;
   btn.addEventListener('click',()=>{if(!eligible()||finished)return;selected.push(s);if(selected.length===4)check();render()});
   choices.append(btn);
  });
  section.querySelector('.aca-crescent-undo').disabled=finished||selected.length===0;
  section.querySelector('.aca-crescent-reset').disabled=selected.length===0&&!finished;
 }
 function check(){
  if(selected.map(s=>s.id).join(',')===sigils.map(s=>s.id).join(',')){
   finished=true;result.textContent='✦ The crescent glows. Love, reflection, night, and sunrise have become one story. Headmaster Breezy welcomes you, Storykeeper.';
   try{localStorage.setItem(key,JSON.stringify({completed:true}))}catch{}
  }else{
   result.textContent='The crescent flickers. The story is not in order yet. Try again.';
   selected=[]; // Never lock a visitor out for a wrong attempt.
  }
 }
 section.querySelector('.aca-crescent-undo').addEventListener('click',()=>{if(!eligible())return;selected.pop();result.textContent='';render()});
 section.querySelector('.aca-crescent-reset').addEventListener('click',()=>{if(!eligible())return;selected=[];finished=false;result.textContent='';render()});
 section.querySelector('.aca-crescent-hint').addEventListener('click',()=>{if(!eligible())return;result.textContent=sigils[hintIndex++%sigils.length].clue});
 try{finished=JSON.parse(localStorage.getItem(key)||'{}').completed===true}catch{}
 if(finished){selected=[...sigils];result.textContent='✦ The crescent remembers your completed story. You may reset to play again.'}
 const observer=new MutationObserver(render);observer.observe(room,{attributes:true,attributeFilter:['hidden','style','class']});
 render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();

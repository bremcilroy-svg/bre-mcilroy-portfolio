/* Keepers' Hall: immersive, first-person-style walkable alcove.
   Cosmetic exploration only. Original story and Fifth Door gates stay authoritative. */
import {societyStats} from './vault-society.js';
const relics=[
 {id:'heart',icon:'♥',name:'Crimson Heart',line:'Love was the beginning. The chamber remembers every letter.'},
 {id:'mirror',icon:'🪞',name:'Silver Mirror',line:'Reflection taught you to recognize the person beyond the broken glass.'},
 {id:'labyrinth',icon:'☾',name:'Moonstone',line:'Through the darkest corridors, the owl showed you another way.'},
 {id:'dawn',icon:'🌅',name:'Sunrise Window',line:'Beyond the final door, tomorrow found its first light.'}
];
const KEY='aca-keepers-hall-v1';
function init(){
 const host=document.querySelector('main');if(!host||document.getElementById('aca-keepers-hall'))return;
 const section=document.createElement('section');section.id='aca-keepers-hall';section.className='aca-keepers-hall';
 section.innerHTML='<p class="aca-hall-eyebrow">AMETHYST CRESCENT ACADEMY · KEEPERS’ HALL</p><h2>Walk the Hall of Remembrance</h2><p>Step into the royal hall. Move between its four alcoves, inspect the objects, and listen to the snow owl. The original chapter seals remain the true keys to the Fifth Door.</p><div class="aca-hall-viewport" role="group" aria-label="First-person exploration of the Keepers’ Hall"><div class="aca-hall-ceiling"></div><div class="aca-hall-back"><div class="aca-hall-window">☾<span>✦</span></div><div class="aca-hall-arch">✧</div></div><div class="aca-hall-floor"></div><div class="aca-hall-left"></div><div class="aca-hall-right"></div><div class="aca-hall-altar"><span class="aca-hall-relic" aria-hidden="true">♥</span><span class="aca-hall-altar-label">Crimson Heart</span></div><div class="aca-hall-owl" aria-hidden="true">🦉</div><div class="aca-hall-gizmo" aria-hidden="true">🐈</div><div class="aca-hall-vignette"></div></div><p class="aca-hall-position" role="status" aria-live="polite"></p><div class="aca-hall-controls"><button type="button" class="aca-hall-prev">← Walk left</button><button type="button" class="aca-hall-inspect">Inspect relic</button><button type="button" class="aca-hall-next">Walk right →</button><button type="button" class="aca-hall-owl-button">Ask the owl</button></div><p class="aca-hall-story" role="status" aria-live="polite"></p><p class="aca-hall-note">An immersive ceremonial scene. It does not change your saved puzzles, chapter unlocks, bookmarks, or Bre Pass.</p>';
 const door=host.querySelector('.door-panel');if(door)host.insertBefore(section,door);else host.append(section);
 let index=0,seen=[];try{const raw=JSON.parse(localStorage.getItem(KEY)||'{}');if(Array.isArray(raw.seen))seen=relics.map(r=>r.id).filter(id=>raw.seen.includes(id))}catch{}
 const viewport=section.querySelector('.aca-hall-viewport'),position=section.querySelector('.aca-hall-position'),story=section.querySelector('.aca-hall-story'),relic=section.querySelector('.aca-hall-relic'),label=section.querySelector('.aca-hall-altar-label');
 function complete(){try{return societyStats().journey?.completed||[]}catch{return []}}
 function render(){
  const r=relics[index],earned=complete()[index]===true;
  viewport.style.setProperty('--hall-step',String(index));
  relic.textContent=earned?r.icon:'✧';label.textContent=earned?r.name:'Veiled Relic';
  position.textContent='Alcove '+(index+1)+' of 4 · '+(earned?r.name:'An unrevealed chapter relic')+' · '+seen.length+' memories inspected';
  section.querySelector('.aca-hall-prev').disabled=index===0;
  section.querySelector('.aca-hall-next').disabled=index===3;
  section.querySelector('.aca-hall-inspect').disabled=!earned;
 }
 function move(n){index=Math.max(0,Math.min(3,index+n));story.textContent='You cross the silver-inlaid floor. Moonlight moves over the stone walls.';render()}
 section.querySelector('.aca-hall-prev').addEventListener('click',()=>move(-1));
 section.querySelector('.aca-hall-next').addEventListener('click',()=>move(1));
 section.querySelector('.aca-hall-inspect').addEventListener('click',()=>{
  if(complete()[index]!==true)return;
  const r=relics[index];story.textContent=r.line;
  if(!seen.includes(r.id)){seen.push(r.id);try{localStorage.setItem(KEY,JSON.stringify({seen}))}catch{}}
  if(seen.length===4)story.textContent+=' The four memories glow together. The Keepers honor your journey.';
  render();
 });
 section.querySelector('.aca-hall-owl-button').addEventListener('click',()=>{story.textContent=complete()[index]===true?'The snow owl tilts its icy-blue eyes toward the relic. “Look closely. Every story leaves a trace.”':'The owl whispers: “Finish this chapter before its memory can awaken.”'});
 section.addEventListener('keydown',e=>{if(e.target.tagName==='BUTTON'&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){e.preventDefault();move(e.key==='ArrowLeft'?-1:1)}});
 window.addEventListener('pageshow',render);window.addEventListener('storage',render);
 render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();

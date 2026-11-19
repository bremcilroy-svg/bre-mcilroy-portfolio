/* Amethyst Gateway: immersive exploration layered around the existing Fifth Door.
   Does not mutate original chapter, seal, stage or access state. */
import {societyStats} from './vault-society.js';
const relics=[
 {title:'Heart Pillar',icon:'♥',id:'heart',story:'Warm crimson light moves through the stone. The first memory was love.'},
 {title:'Reflection Pillar',icon:'🪞',id:'mirror',story:'Silver glass catches your reflection. You are more than the pieces you lost.'},
 {title:'Moon Pillar',icon:'☾',id:'labyrinth',story:'A snow owl watches from the moonlit arch. Even darkness holds a path.'},
 {title:'Dawn Pillar',icon:'🌅',id:'dawn',story:'Icy-blue light softens into gold. The morning is waiting beyond the door.'}
];
function mount(){
 const main=document.querySelector('main'),game=document.getElementById('game'),gate=document.getElementById('gate');if(!main||!game||!gate||document.getElementById('aca-amethyst-gateway'))return;
 const section=document.createElement('section');section.id='aca-amethyst-gateway';section.className='aca-amethyst-gateway';
 section.innerHTML='<p class="aca-gateway-kicker">AMETHYST CRESCENT ACADEMY · THE FIFTH DOOR</p><h2>Enter the Amethyst Gateway</h2><p>Stand within the royal chamber. Walk between the four seal pillars, examine their magic, and approach the great door. The original Fifth Door puzzles remain the keys to passage.</p><div class="aca-gateway-scene" role="img" aria-label="Perspective view inside a medieval royal chamber, with purple stone walls, silver pillars, amethyst door, icy-blue moonlight and a snow owl"><div class="aca-gateway-ceiling"></div><div class="aca-gateway-back"><div class="aca-gateway-door"><span>✦</span><span class="aca-gateway-lock">🔮</span></div></div><div class="aca-gateway-wall left"></div><div class="aca-gateway-wall right"></div><div class="aca-gateway-floor"></div><div class="aca-gateway-pillar"><span class="aca-gateway-symbol">♥</span><small class="aca-gateway-name">Heart Pillar</small></div><span class="aca-gateway-owl" aria-hidden="true">🦉</span><span class="aca-gateway-cat" aria-hidden="true">🐈</span><div class="aca-gateway-shade"></div></div><p class="aca-gateway-position" role="status"></p><div class="aca-gateway-controls"><button type="button" class="aca-gateway-left">← Walk left</button><button type="button" class="aca-gateway-inspect">Inspect pillar</button><button type="button" class="aca-gateway-right">Walk right →</button><button type="button" class="aca-gateway-door-button">Approach the door</button></div><p class="aca-gateway-message" role="status" aria-live="polite"></p><p class="aca-gateway-note">Exploration is optional. No new lock, code, or save requirement is added.</p>';
 main.insertBefore(section,gate);
 let index=0;
 const position=section.querySelector('.aca-gateway-position'),message=section.querySelector('.aca-gateway-message');
 function access(){try{const s=societyStats();return s.journey.allComplete&&s.seals.length===4}catch{return false}}
 function render(){
  const r=relics[index],unlocked=access();
  section.classList.toggle('is-eligible',unlocked);
  section.style.setProperty('--gateway-position',index);
  section.querySelector('.aca-gateway-symbol').textContent=r.icon;
  section.querySelector('.aca-gateway-name').textContent=r.title;
  position.textContent='Standing before '+r.title+' · Alcove '+(index+1)+' of 4';
  section.querySelector('.aca-gateway-left').disabled=index===0;
  section.querySelector('.aca-gateway-right').disabled=index===3;
 }
 function walk(dir){index=Math.max(0,Math.min(3,index+dir));message.textContent='Your footsteps echo across the silver-inlaid floor.';render()}
 section.querySelector('.aca-gateway-left').addEventListener('click',()=>walk(-1));
 section.querySelector('.aca-gateway-right').addEventListener('click',()=>walk(1));
 section.querySelector('.aca-gateway-inspect').addEventListener('click',()=>{const r=relics[index];let found=false;try{found=societyStats().seals.includes(r.id)}catch{}message.textContent=found?r.story:'The pillar remains dark. Complete its original chapter and find its hidden bookmark to awaken this seal.'});
 section.querySelector('.aca-gateway-door-button').addEventListener('click',()=>{
  if(!access()){message.textContent='The amethyst door is sealed. The original four chapters and their hidden bookmarks must be completed first.';gate.scrollIntoView({behavior:'smooth',block:'center'});return}
  message.textContent='The silver doors part. Your existing Fifth Door challenge awaits.';
  game.scrollIntoView({behavior:'smooth',block:'start'});
  const first=game.querySelector('#puzzle button:not(:disabled)');first?.focus({preventScroll:true});
 });
 section.addEventListener('keydown',e=>{if(e.target.tagName==='BUTTON'&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();walk(e.key==='ArrowLeft'?-1:1)}});
 window.addEventListener('pageshow',render);window.addEventListener('storage',render);render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();

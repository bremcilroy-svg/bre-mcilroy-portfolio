/* Crescent Sigil Ledger: read-only chapter rewards; never changes puzzle saves or gates. */
import {societyStats} from './vault-society.js';
const sigils=[
 {id:'heart',icon:'♥',title:'Heart Sigil',room:'Heart Chamber',hint:'Love begins the story.'},
 {id:'mirror',icon:'🪞',title:'Reflection Sigil',room:'Shattered Mirror',hint:'Look again to see what matters.'},
 {id:'labyrinth',icon:'☾',title:'Moon Sigil',room:'Midnight Labyrinth',hint:'Even night has a path.'},
 {id:'dawn',icon:'🌅',title:'Dawn Sigil',room:'Door to Tomorrow',hint:'A new day can begin.'}
];
function mount(){
 const host=document.querySelector('main');if(!host||document.getElementById('aca-sigil-ledger'))return;
 const section=document.createElement('section');section.id='aca-sigil-ledger';section.className='aca-sigil-ledger';
 section.setAttribute('aria-labelledby','aca-sigil-heading');
 section.innerHTML='<p class="aca-sigil-eyebrow">AMETHYST CRESCENT ACADEMY · THE GRAND MYSTERY</p><h2 id="aca-sigil-heading">The Crescent Sigil Ledger</h2><p>Each completed Poetry Vault chamber leaves its mark on your story. These are ceremonial symbols; your original puzzle locks and bookmarks still determine access.</p><p id="aca-sigil-count" role="status"></p><div class="aca-sigil-grid" id="aca-sigil-grid"></div><p class="aca-sigil-footnote">The final crescent mechanism is still being built. Your existing chapter progress is preserved.</p>';
 const door=host.querySelector('.door-panel');if(door)host.insertBefore(section,door);else host.append(section);
 const grid=section.querySelector('#aca-sigil-grid');
 function render(){
  let stats;try{stats=societyStats()}catch{section.querySelector('#aca-sigil-count').textContent='Your chapter progress is unavailable in this browser.';return}
  const earned=sigils.filter((s,i)=>stats.journey?.completed?.[i]===true);
  section.querySelector('#aca-sigil-count').textContent=earned.length+' of 4 chapter sigils revealed';
  grid.replaceChildren();
  sigils.forEach((s,i)=>{
   const found=stats.journey?.completed?.[i]===true;
   const card=document.createElement('article');card.className='aca-sigil-card'+(found?' is-earned':'');
   const emblem=document.createElement('span');emblem.className='aca-sigil-symbol';emblem.setAttribute('aria-hidden','true');emblem.textContent=found?s.icon:'✧';
   const name=document.createElement('h3');name.textContent=found?s.title:'Hidden Sigil';
   const info=document.createElement('p');info.textContent=found?s.hint:'Complete '+s.room+' to reveal its symbol.';
   const state=document.createElement('small');state.textContent=found?'Revealed':'Not yet revealed';
   card.append(emblem,name,info,state);grid.append(card);
  });
 }
 render();window.addEventListener('pageshow',render);window.addEventListener('storage',render);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();

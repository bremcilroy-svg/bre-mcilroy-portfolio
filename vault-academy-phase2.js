/* Phase 2: cinematic academy welcome. No game-state writes. */
(()=>{'use strict';
if(location.pathname.split('/').pop()!=='poetry-vault.html')return;
const PROFILE='bre-poetry-vault-academy-profile-v1';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function init(){
 const welcome=document.querySelector('#welcome'),copy=welcome?.querySelector('.welcome-copy');
 if(!welcome||!copy||welcome.dataset.academyP2)return;
 welcome.dataset.academyP2='true';document.body.classList.add('academy-p2');
 const eyebrow=copy.querySelector('.eyebrow'),chapter=copy.querySelector('.chapter-label'),title=copy.querySelector('#welcome-title'),intro=copy.querySelector('.intro'),description=copy.querySelector('.description'),caption=welcome.querySelector('.room-caption');
 if(eyebrow)eyebrow.textContent='THE ENCHANTED ACADEMY · THE POETRY VAULT';
 if(chapter)chapter.innerHTML='CHAPTER I <span>—</span> THE AWAKENING';
 if(title)title.innerHTML='Every story<br>begins with<br><em>magic.</em>';
 if(intro)intro.textContent='Beyond these doors, an ancient academy remembers your name.';
 if(description)description.innerHTML='Discover your supernatural identity, enter your house, and begin a journey through the original poetry of Bre McIlroy. The four sealed letters and their mysteries await inside.';
 if(caption)caption.innerHTML='<span class="ornament">✧</span><p>FOUR HOUSES. ONE DESTINY.</p><span>The castle remembers.</span>';
 const architecture=document.createElement('div');architecture.className='academy-p2-architecture';architecture.setAttribute('aria-hidden','true');
 architecture.innerHTML='<div class="academy-p2-window"></div><div class="academy-p2-banner">☾</div><div class="academy-p2-banner">✧</div><div class="academy-p2-banner">♜</div><div class="academy-p2-banner">❀</div><div class="academy-p2-stars"></div>';
 welcome.prepend(architecture);
 const identity=document.createElement('div');identity.className='academy-p2-identity';identity.hidden=true;identity.setAttribute('aria-live','polite');
 const actions=copy.querySelector('.welcome-actions');if(actions)actions.after(identity);
 function update(){
  let p;try{p=JSON.parse(localStorage.getItem(PROFILE)||'null')}catch{}
  if(!p||p.version!==1||!p.name||!p.role||!p.house){identity.hidden=true;return}
  identity.hidden=false;identity.innerHTML=`<span aria-hidden="true">${escape(p.houseSymbol||'✧')}</span><strong>${escape(p.name)}</strong><span>${escape(p.role)} · ${escape(p.house)}</span>`;
 }
 update();
 const modal=document.querySelector('#academy-modal');
 if(modal)modal.addEventListener('close',update);
 window.addEventListener('storage',e=>{if(e.key===PROFILE)update()});
 window.addEventListener('pageshow',update);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

/* Phase 18: accessible story portals. Additive, no progress or game navigation changes. */
(()=>{'use strict';const realms=[
 {title:'Princess Realm',symbol:'♛',scene:'A silver crown rests beside a velvet throne. Beyond the arched windows, icy-blue snow settles over the castle gardens.',hint:'Royal promises are remembered here.'},
 {title:'Basketball Realm',symbol:'🏀',scene:'Moonlight pools on a quiet court. The silver scoreboard glows softly above a ball waiting at center court.',hint:'Every great shot begins with courage.'},
 {title:'Toy Realm',symbol:'⭐',scene:'A whimsical storybook nursery sparkles with stars, colorful toy chests, and a tiny painted castle.',hint:'Friendship makes the adventure.'},
 {title:'Wolf Realm',symbol:'🐺',scene:'A snowy pine forest stretches beneath a silver moon. Pawprints lead toward a warm lantern in the distance.',hint:'Loyal hearts find their way home.'},
 {title:'Planet Realm',symbol:'🪐',scene:'A celestial observatory opens beneath a painted night sky. Five glowing planets drift beyond a silver telescope.',hint:'Curiosity opens a universe.'}
];
function init(){const gallery=document.getElementById('castle-gallery');if(!gallery||document.getElementById('realm-preview-dialog'))return;
 const cards=[...gallery.querySelectorAll('.cg-card')];cards.forEach((card,i)=>{if(!realms[i])return;const btn=document.createElement('button');btn.type='button';btn.className='realm-preview-button';btn.textContent='Peek through the portal';btn.setAttribute('aria-label','Preview '+realms[i].title);btn.addEventListener('click',()=>open(i));card.append(btn)});
 const dlg=document.createElement('dialog');dlg.id='realm-preview-dialog';dlg.setAttribute('aria-labelledby','realm-preview-title');dlg.innerHTML='<div class="realm-preview-inner"><button type="button" class="realm-close" aria-label="Close portal">×</button><p class="realm-eyebrow">A glimpse beyond the silver door</p><div class="realm-symbol" aria-hidden="true"></div><h2 id="realm-preview-title"></h2><p id="realm-preview-scene"></p><p id="realm-preview-hint"></p><p class="realm-preview-disclaimer">Story preview only — the original puzzle room remains unchanged.</p></div>';
 document.body.append(dlg);dlg.querySelector('.realm-close').addEventListener('click',()=>dlg.close());dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});
 function open(i){const r=realms[i];dlg.querySelector('.realm-symbol').textContent=r.symbol;dlg.querySelector('#realm-preview-title').textContent=r.title;dlg.querySelector('#realm-preview-scene').textContent=r.scene;dlg.querySelector('#realm-preview-hint').textContent=r.hint;if(typeof dlg.showModal==='function')dlg.showModal();else dlg.setAttribute('open','');}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

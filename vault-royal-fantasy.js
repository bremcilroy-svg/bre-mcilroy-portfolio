/* Additive royal fantasy decor. Does not change gate logic or existing saved progress. */
(()=>{'use strict';
const init=()=>{
 if(document.getElementById('royal-fantasy-panel'))return;
 const room=document.getElementById('room');if(!room)return;
 const panel=document.createElement('section');panel.id='royal-fantasy-panel';
 panel.setAttribute('aria-label','Royal fantasy observatory');
 panel.innerHTML=`<div class="rf-layout"><div><h2 class="rf-title">♛ The Royal Moonlit Observatory</h2><p class="rf-note">Beyond the medieval castle doors, a snow owl watches over a silver grandfather clock. Amethyst gems glow beneath the icy-blue moon.</p><div class="rf-owl" role="img" aria-label="Snow owl with icy blue eyes">🦉</div><div class="rf-gems" aria-hidden="true">◆ ✧ ◆</div></div><div class="rf-clock" aria-label="Grandfather clock"><div class="rf-clock-face"><div><small>Ⅻ · Ⅲ · Ⅵ · Ⅸ</small><br><strong id="rf-time">--:--</strong><br><small id="rf-date">Moonlit hours</small></div></div><div class="rf-pendulum" aria-hidden="true">◆</div></div></div><div class="rf-controls"><button type="button" id="rf-heart-button" aria-pressed="false"><span id="rf-heart" class="rf-heart" data-state="black" aria-hidden="true">♥</span> Transform the heart</button><button type="button" id="rf-owl-button">Hear the owl's message</button></div><p id="rf-message" class="rf-note" role="status" aria-live="polite">The castle keeps its secrets.</p>`;
 const study=room.querySelector('.study');if(study)study.insertAdjacentElement('afterend',panel);else room.prepend(panel);
 const time=panel.querySelector('#rf-time'),date=panel.querySelector('#rf-date');
 function tick(){const now=new Date();time.textContent=now.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});date.textContent=now.toLocaleDateString([], {month:'short',day:'numeric'});const key=now.getFullYear()+'-'+now.getMonth()+'-'+now.getDate()+'-'+now.getHours();if(now.getHours()%3===0&&now.getMinutes()===0&&lastChime!==key){lastChime=key;panel.querySelector('#rf-message').textContent='The third-hour bell shimmers; the snow owl gives a quiet hoot. ✧';}}
 let lastChime='';tick();const timer=setInterval(tick,15000);window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});
 let red=false;try{red=localStorage.getItem('rf-heart-red')==='true'}catch(_){};
 const heart=panel.querySelector('#rf-heart'),heartButton=panel.querySelector('#rf-heart-button');
 function updateHeart(){heart.dataset.state=red?'red':'black';heartButton.setAttribute('aria-pressed',String(red));panel.querySelector('#rf-message').textContent=red?'The heart glows red with enchanted love.':'The heart returns to black, holding its secrets.'}
 heart.dataset.state=red?'red':'black';heartButton.setAttribute('aria-pressed',String(red));
 heartButton.addEventListener('click',()=>{red=!red;try{localStorage.setItem('rf-heart-red',String(red))}catch(_){}updateHeart()});
 panel.querySelector('#rf-owl-button').addEventListener('click',()=>{panel.querySelector('#rf-message').textContent='Hoo-hoo… The snowy guardian watches over every story you carry.'});
};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

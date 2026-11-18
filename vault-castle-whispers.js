/* Castle whispers: optional, atmospheric, no clues or saved progress changes. */
(()=>{'use strict';
const messages={
'poetry-vault.html':['Some stories glow even when the candles fade.','The castle listens to every brave heartbeat.','An owl watches quietly from the rafters.'],
'poetry-vault-mirror.html':['A reflection is not the whole story.','The silver glass holds a thousand stars.','Snow-white wings brush the moonlit window.'],
'poetry-vault-labyrinth.html':['The night keeps its own kind of wonder.','An owl calls beyond the farthest archway.','Even the longest hallway remembers dawn.'],
'poetry-vault-dawn.html':['Morning carries what the stars have taught.','The first light paints the castle silver.','Some endings are doors in disguise.']};
const page=location.pathname.split('/').pop(),lines=messages[page];if(!lines)return;
function mount(){
const scene=document.getElementById('scene');if(!scene)return;
const whisper=document.createElement('aside');whisper.id='pv-castle-whisper';whisper.setAttribute('aria-label','Castle atmosphere');
const symbol=document.createElement('span');symbol.setAttribute('aria-hidden','true');symbol.textContent='🦉';
const label=document.createElement('span');label.textContent='The castle whispers…';
const text=document.createElement('p');text.textContent=lines[0];
const toggle=document.createElement('button');toggle.type='button';toggle.textContent='Hide whispers';toggle.setAttribute('aria-pressed','true');
whisper.append(symbol,label,text,toggle);document.body.append(whisper);
let index=0,enabled=true;
toggle.addEventListener('click',()=>{enabled=!enabled;toggle.setAttribute('aria-pressed',String(enabled));toggle.textContent=enabled?'Hide whispers':'Show whispers';text.hidden=!enabled;if(enabled)text.textContent=lines[index]});
const tick=()=>{if(!enabled||document.hidden||document.querySelector('dialog[open]')||document.getElementById('welcome')?.hidden===false)return;index=(index+1)%lines.length;text.textContent=lines[index];whisper.classList.remove('pv-whisper-pulse');void whisper.offsetWidth;whisper.classList.add('pv-whisper-pulse')};
const interval=setInterval(tick,24000);
window.addEventListener('pagehide',()=>clearInterval(interval),{once:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
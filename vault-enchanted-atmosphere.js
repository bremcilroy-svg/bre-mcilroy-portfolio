/* Gentle enchanted motes. Decorative, deterministic, no storage or audio. */
(()=>{'use strict';if(document.getElementById('pv-enchanted-atmosphere'))return;
const mount=()=>{if(!document.body||document.getElementById('pv-enchanted-atmosphere'))return;
const layer=document.createElement('div');layer.id='pv-enchanted-atmosphere';layer.setAttribute('aria-hidden','true');
const aura=document.createElement('div');aura.className='pv-aura';layer.append(aura);
const tones=['rgba(214,185,255,.85)','rgba(182,217,255,.8)','rgba(241,205,224,.72)','rgba(255,233,191,.7)'];
for(let i=0;i<22;i++){const mote=document.createElement('span');mote.className='pv-mote';
const n=k=>{const x=Math.sin((i+1)*k)*43758.5453;return x-Math.floor(x)};
mote.style.setProperty('--x',(5+n(12.9898)*90).toFixed(2)+'%');
mote.style.setProperty('--y',(7+n(78.233)*84).toFixed(2)+'%');
mote.style.setProperty('--size',(1.5+n(42.1)*2.7).toFixed(2)+'px');
mote.style.setProperty('--duration',(8+n(23.7)*10).toFixed(1)+'s');
mote.style.setProperty('--delay',(-n(51.9)*15).toFixed(1)+'s');
mote.style.setProperty('--drift',((n(11.2)-.5)*48).toFixed(1)+'px');
mote.style.setProperty('--tone',tones[i%tones.length]);layer.append(mote)}
document.body.append(layer);
};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();

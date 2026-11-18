/* Headmaster Breezy epilogue: visual story only; never changes game access or passes. */
(()=>{'use strict';const room=document.getElementById('room');if(!room)return;
const panel=document.createElement('section');panel.id='aca-headmaster-epilogue';panel.setAttribute('aria-labelledby','aca-headmaster-heading');
panel.style.cssText='max-width:760px;margin:25px auto;padding:24px;border:1px solid #bd9be5;border-radius:18px;background:linear-gradient(135deg,#352043,#1c152a);color:#f5eaff;text-align:center;box-shadow:0 0 25px #a67ad633';
const title=document.createElement('h2');title.id='aca-headmaster-heading';title.textContent='👑 A Message from Headmaster Breezy';title.style.margin='0 0 12px';
const message=document.createElement('p');message.textContent='You came here searching for answers. Every story mattered. Every choice brought you here.';message.style.cssText='line-height:1.7;margin:0 0 16px';
const button=document.createElement('button');button.type='button';button.textContent='Hear the Headmaster’s Farewell';button.style.cssText='padding:12px 18px;border-radius:28px;background:#66417f;color:white;border:1px solid #d9bff4;cursor:pointer;font:600 14px system-ui,sans-serif';
const note=document.createElement('p');note.textContent='The ceremonial Bre Pass presentation is planned. This scene does not issue or unlock a pass.';note.style.cssText='font:12px/1.5 system-ui,sans-serif;color:#d0bfdc;margin:14px 0 0';
panel.append(title,message,button,note);room.append(panel);
let shown=false;function sync(){panel.hidden=room.hidden||getComputedStyle(room).display==='none';}
button.addEventListener('click',()=>{shown=!shown;message.textContent=shown?'Welcome to the legacy of Amethyst Crescent Academy. The stories you carried here are the keys to all that comes next.':'You came here searching for answers. Every story mattered. Every choice brought you here.';button.textContent=shown?'Hear the Farewell Again ↺':'Hear the Headmaster’s Farewell';});
new MutationObserver(sync).observe(room,{attributes:true,attributeFilter:['hidden','style','class']});sync();
})();
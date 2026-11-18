/* Headmaster Breezy's ceremonial Bre Pass. Does not alter the existing access system. */
(()=>{'use strict';
const room=document.getElementById('room');if(!room)return;
const panel=document.createElement('section');panel.id='aca-headmaster-epilogue';panel.setAttribute('aria-labelledby','aca-headmaster-heading');
panel.style.cssText='max-width:760px;margin:25px auto;padding:24px;border:1px solid #bd9be5;border-radius:18px;background:linear-gradient(135deg,#352043,#1c152a);color:#f5eaff;text-align:center;box-shadow:0 0 25px #a67ad633';
const heading=document.createElement('h2');heading.id='aca-headmaster-heading';heading.textContent='👑 Headmaster Breezy’s Final Welcome';
const message=document.createElement('p');message.textContent='You came here searching for answers. Every story mattered. Every choice brought you here.';message.style.cssText='line-height:1.7';
const pass=document.createElement('div');pass.hidden=true;pass.setAttribute('role','group');pass.setAttribute('aria-label','Commemorative Bre Pass');pass.style.cssText='margin:18px auto;padding:25px 18px;max-width:390px;border:2px solid #d8d7e8;border-radius:20px;background:linear-gradient(130deg,#21182f,#61447b 55%,#2a203a);box-shadow:0 0 25px #b39de755';
const emblem=document.createElement('div');emblem.textContent='☾ 🦉 ✦';emblem.style.cssText='font-size:36px;color:#cce4ff';
const passTitle=document.createElement('h3');passTitle.textContent='AMETHYST CRESCENT ACADEMY';passTitle.style.cssText='letter-spacing:.12em;font-size:16px';
const passName=document.createElement('p');passName.textContent='BRE PASS · HONORARY STORYKEEPER';passName.style.cssText='font:700 14px system-ui,sans-serif;color:#e8d9ff';
const passCaption=document.createElement('p');passCaption.textContent='A ceremonial keepsake from Headmaster Breezy';passCaption.style.cssText='font:12px system-ui,sans-serif;color:#d9cbe9';
pass.append(emblem,passTitle,passName,passCaption);
const button=document.createElement('button');button.type='button';button.textContent='Receive Your Ceremonial Bre Pass';button.style.cssText='padding:12px 18px;border-radius:28px;background:#66417f;color:white;border:1px solid #d9bff4;cursor:pointer;font:600 14px system-ui,sans-serif';
const note=document.createElement('p');note.textContent='This is a commemorative pass presentation. Existing Bre Pass access and original locks are not changed.';note.style.cssText='font:12px/1.5 system-ui,sans-serif;color:#d0bfdc;margin:14px 0 0';
panel.append(heading,message,pass,button,note);room.append(panel);
button.addEventListener('click',()=>{if(room.hidden)return;pass.hidden=false;message.textContent='Welcome to the legacy of Amethyst Crescent Academy. Carry these stories with you wherever your journey leads.';button.textContent='Your Ceremonial Bre Pass Is Presented ✓';button.disabled=true;});
function sync(){panel.hidden=room.hidden||getComputedStyle(room).display==='none';if(panel.hidden){pass.hidden=true;button.disabled=false;button.textContent='Receive Your Ceremonial Bre Pass';message.textContent='You came here searching for answers. Every story mattered. Every choice brought you here.';}}
new MutationObserver(sync).observe(room,{attributes:true,attributeFilter:['hidden','style','class']});sync();
})();
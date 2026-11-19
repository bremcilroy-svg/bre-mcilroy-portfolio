/* Visual-only reward choreography for original chapter discoveries. */
(()=>{'use strict';
const moments={
 'The heart remembers.':['The diary awakens','heart'],
 'One chamber. Four discoveries.':['The mirror door opens','door'],
 'The words behind the glass.':['The reflection remembers','mirror'],
 'The second chamber remembers.':['The clockwork door opens','door'],
 'A small promise of morning.':['The archive awakens','moon'],
 'A path toward morning.':['The sunrise door opens','door'],
 'The last words, a new beginning.':['The final pages are free','dawn'],
 'The story continues with you.':['The dawn door opens','door']
};
function ready(){
 const title=document.getElementById('panel-title'),panel=document.getElementById('panel');
 if(!title||!panel)return;
 let last='',timer=0;
 const host=document.createElement('div');host.id='pv-discovery-moment';host.setAttribute('aria-hidden','true');document.body.append(host);
 const run=()=>{
  if(!panel.open)return;
  const key=title.textContent.trim();
  if(key===last)return;
  last=key;
  const item=moments[key];if(!item)return;
  host.replaceChildren();
  const halo=document.createElement('div');halo.className='pv-reveal-halo '+item[1];host.append(halo);
  const text=document.createElement('div');text.className='pv-reveal-caption';text.textContent='✦ '+item[0]+' ✦';host.append(text);
  for(let i=0;i<14;i++){const p=document.createElement('i');p.className='pv-reveal-star';p.style.setProperty('--a',i*360/14+'deg');p.style.setProperty('--r',80+i%3*23+'px');host.append(p)}
  host.classList.remove('pv-reveal-active');void host.offsetWidth;host.classList.add('pv-reveal-active');
  clearTimeout(timer);timer=setTimeout(()=>{host.classList.remove('pv-reveal-active');host.replaceChildren()},2600);
 };
 new MutationObserver(()=>{if(!panel.open)last='';else run()}).observe(panel,{attributes:true,attributeFilter:['open']});
 new MutationObserver(run).observe(title,{childList:true,characterData:true,subtree:true});
 panel.addEventListener('close',()=>{last='';host.classList.remove('pv-reveal-active');host.replaceChildren();clearTimeout(timer)});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
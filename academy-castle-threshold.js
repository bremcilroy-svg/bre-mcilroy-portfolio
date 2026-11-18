/* Castle threshold: in-world corridor attached to the existing guarded passage.
   Never navigates directly, never changes puzzle saves, and never bypasses locks. */
const chapters={
 'poetry-vault.html':'Heart Chamber',
 'poetry-vault-mirror.html':'Shattered Mirror',
 'poetry-vault-labyrinth.html':'Midnight Labyrinth',
 'poetry-vault-dawn.html':'Door to Tomorrow'
};
function init(){
 const name=chapters[location.pathname.split('/').pop()];
 const scene=document.getElementById('scene'),play=document.getElementById('play-ui'),bridge=document.getElementById('pv155-bridge'),overlay=document.getElementById('pv155-transition');
 if(!name||!scene||!play||!bridge||!overlay||document.getElementById('aca-threshold'))return;
 const threshold=document.createElement('div');threshold.id='aca-threshold';threshold.hidden=true;
 threshold.innerHTML='<button type="button" class="aca-threshold-door" aria-label="Approach the castle passage"><span class="aca-threshold-arch" aria-hidden="true"><span class="aca-threshold-crest">✦</span><span class="aca-threshold-seam"></span><span class="aca-threshold-knob">◆</span></span><span class="aca-threshold-caption">Approach the castle door</span></button><a class="aca-threshold-return" href="poetry-vault-entrance.html" aria-label="Return through the door to the castle lobby">↶ Return to lobby</a>';
 scene.insertAdjacentElement('afterend',threshold);
 const door=threshold.querySelector('button'),returnDoor=threshold.querySelector('.aca-threshold-return'),toggle=bridge.querySelector('.pv155-open'),panel=bridge.querySelector('.pv155-panel');
 function update(){const active=!play.hidden&&getComputedStyle(play).display!=='none';threshold.hidden=!active}
 returnDoor.addEventListener('click',e=>{if(threshold.hidden)return;e.preventDefault();const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;overlay.querySelector('p').textContent='✦ Returning to the castle lobby… ✦';overlay.hidden=false;overlay.classList.add('aca-crossing');setTimeout(()=>location.assign(returnDoor.href),reduce?0:500);});
 door.addEventListener('click',()=>{
  if(threshold.hidden)return;
  if(panel.hidden)toggle.click();
  const candidates=[...bridge.querySelectorAll('.pv155-links .pv155-route:not(:disabled)')];
  const onward=candidates.find(b=>b.textContent.includes('Open door'));
  (onward||candidates[0]||toggle).focus({preventScroll:true});
 });
 new MutationObserver(update).observe(play,{attributes:true,attributeFilter:['hidden','style','class']});update();
 // Enhance the EXISTING transition: the original route and combination lock still control when it opens.
 const corridor=document.createElement('div');corridor.className='aca-corridor';corridor.setAttribute('aria-hidden','true');
 corridor.innerHTML='<div class="aca-corridor-ceiling"></div><div class="aca-corridor-left"></div><div class="aca-corridor-right"></div><div class="aca-corridor-floor"></div><div class="aca-corridor-end">✦</div><div class="aca-corridor-light"></div>';
 overlay.prepend(corridor);
 const caption=overlay.querySelector('p');
 const watcher=new MutationObserver(()=>{
  if(!overlay.hidden&&overlay.classList.contains('pv155-animate')){overlay.classList.add('aca-crossing');if(caption)caption.setAttribute('aria-live','polite')}
  else overlay.classList.remove('aca-crossing');
 });
 watcher.observe(overlay,{attributes:true,attributeFilter:['hidden','class']});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();

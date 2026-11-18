import {ITEMS,readTreasures,claim,statsSafe,canEarn} from './academy-treasures.js';
const pages=['poetry-vault.html','poetry-vault-mirror.html','poetry-vault-labyrinth.html','poetry-vault-dawn.html'];
function init(){const chapter=pages.indexOf(location.pathname.split('/').pop());if(chapter<0)return;const scene=document.getElementById('scene'),play=document.getElementById('play-ui');if(!scene||!play)return;
 const host=document.createElement('aside');host.id='aca-chest-hunt';host.hidden=true;host.innerHTML='<div class="aca-chest-markers"><button class="aca-chest-easy" type="button" aria-label="Inspect an ordinary treasure chest">🧰</button><button class="aca-chest-secret" type="button" aria-label="Inspect a hidden royal chest">✦</button></div><section class="aca-chest-dialog" hidden aria-label="Treasure chest"><h2>Royal Treasure Chest</h2><p class="aca-chest-description"></p><p class="aca-chest-feedback" role="status" aria-live="polite"></p><div class="aca-chest-actions"><button class="aca-chest-claim" type="button">Open chest</button><button class="aca-chest-close" type="button">Close</button><a href="academy-royal-inventory.html">Royal inventory →</a></div></section>';
 scene.insertAdjacentElement('afterend',host);
 const dialog=host.querySelector('.aca-chest-dialog'),desc=host.querySelector('.aca-chest-description'),feedback=host.querySelector('.aca-chest-feedback'),open=host.querySelector('.aca-chest-claim'),easy=host.querySelector('.aca-chest-easy'),secret=host.querySelector('.aca-chest-secret');
 const items=ITEMS.filter(x=>x.chapter===chapter);
 let selected=null,previous=null;
 function update(){host.hidden=play.hidden||getComputedStyle(play).display==='none';const owned=readTreasures().owned;easy.classList.toggle('found',owned.includes(items[0].id));secret.classList.toggle('found',owned.includes(items[1].id))}
 function show(item){selected=item;previous=document.activeElement;dialog.hidden=false;const owned=readTreasures().owned.includes(item.id),allowed=canEarn(item,statsSafe());
 desc.textContent=item.chest==='secret'?'An enchanted chest hidden behind a royal crest. Complete this chamber and discover its original hidden bookmark to break the seal.':'A small silver chest tucked into the chamber. A gift for curious explorers.';
 feedback.textContent=owned?'Already collected: '+item.name:allowed?'A treasure glimmers inside.':'The chest is sealed until its requirements are met.';
 open.disabled=owned||!allowed;open.textContent=owned?'Collected':'Open chest';host.classList.add('is-open');host.querySelector('.aca-chest-close').focus();}
 easy.addEventListener('click',()=>show(items[0]));secret.addEventListener('click',()=>show(items[1]));
 open.addEventListener('click',()=>{if(!selected)return;const result=claim(selected.id);feedback.textContent=result.ok?(result.already?'Already collected: ':'Treasure earned! ')+selected.name:result.reason;open.disabled=true;update()});
 function close(){dialog.hidden=true;host.classList.remove('is-open');previous?.focus?.({preventScroll:true})}
 host.querySelector('.aca-chest-close').addEventListener('click',close);
 host.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dialog.hidden){e.preventDefault();close()}});
 new MutationObserver(update).observe(play,{attributes:true,attributeFilter:['hidden','style','class']});window.addEventListener('pageshow',update);update();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();

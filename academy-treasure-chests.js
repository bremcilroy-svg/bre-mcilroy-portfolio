import {ITEMS,readTreasures,claim,statsSafe,canEarn} from './academy-treasures.js';
import {TRIALS,solved,markSolved} from './academy-secret-trials.js';
const pages=['poetry-vault.html','poetry-vault-mirror.html','poetry-vault-labyrinth.html','poetry-vault-dawn.html'];
function init(){const chapter=pages.indexOf(location.pathname.split('/').pop());if(chapter<0)return;const scene=document.getElementById('scene'),play=document.getElementById('play-ui');if(!scene||!play)return;
 const host=document.createElement('aside');host.id='aca-chest-hunt';host.hidden=true;host.innerHTML='<div class="aca-chest-markers"><button class="aca-chest-easy" type="button" aria-label="Inspect an ordinary treasure chest">🧰</button><button class="aca-chest-secret" type="button" aria-label="Inspect a hidden royal chest">✦</button></div><section class="aca-chest-dialog" hidden aria-label="Treasure chest"><h2>Royal Treasure Chest</h2><p class="aca-chest-description"></p><p class="aca-chest-feedback" role="status" aria-live="polite"></p><div class="aca-chest-trial" hidden></div><div class="aca-chest-actions"><button class="aca-chest-claim" type="button">Open chest</button><button class="aca-chest-close" type="button">Close</button><a href="academy-royal-inventory.html">Royal inventory →</a></div></section>';
 scene.insertAdjacentElement('afterend',host);
 const dialog=host.querySelector('.aca-chest-dialog'),desc=host.querySelector('.aca-chest-description'),feedback=host.querySelector('.aca-chest-feedback'),open=host.querySelector('.aca-chest-claim'),easy=host.querySelector('.aca-chest-easy'),secret=host.querySelector('.aca-chest-secret');
 const items=ITEMS.filter(x=>x.chapter===chapter);
 let selected=null,previous=null,step=0;
 const trial=host.querySelector('.aca-chest-trial');
 function eligibleForTrial(){const st=statsSafe();return !!st?.journey.completed[chapter]&&st.seals.includes(['heart','mirror','labyrinth','dawn'][chapter])}
 function drawTrial(){trial.replaceChildren();const puzzle=TRIALS[chapter],stage=puzzle.steps[step];if(!stage){if(markSolved(chapter)){feedback.textContent='The royal mechanism opens! Your secret reward is ready.';trial.hidden=true;open.disabled=false;open.textContent='Claim secret treasure'}else feedback.textContent='Saving is unavailable. Please enable browser storage.';return}
  const heading=document.createElement('h3');heading.textContent=puzzle.title+' · Stage '+(step+1)+' of '+puzzle.steps.length;const clue=document.createElement('p');clue.textContent=stage.clue;const choices=document.createElement('div');choices.className='aca-trial-choices';const status=document.createElement('p');status.setAttribute('role','status');status.setAttribute('aria-live','polite');const hint=document.createElement('button');hint.type='button';hint.textContent='A gentle hint';hint.addEventListener('click',()=>{status.textContent=stage.hint});
  stage.options.forEach((label,i)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',()=>{if(i===stage.answer){step++;feedback.textContent='Correct! The mechanism turns.';drawTrial()}else status.textContent='The mechanism resists. Look at the clue and try again.'});choices.append(b)});
  trial.append(heading,clue,choices,hint,status);trial.hidden=false;
 }

 function update(){host.hidden=play.hidden||getComputedStyle(play).display==='none';const owned=readTreasures().owned;easy.classList.toggle('found',owned.includes(items[0].id));secret.classList.toggle('found',owned.includes(items[1].id))}
 function show(item){selected=item;previous=document.activeElement;dialog.hidden=false;trial.hidden=true;trial.replaceChildren();step=0;const owned=readTreasures().owned.includes(item.id),allowed=canEarn(item,statsSafe());
 desc.textContent=item.chest==='secret'?'An enchanted chest hidden behind a royal crest. Complete this chamber and discover its original hidden bookmark to break the seal.':'A small silver chest tucked into the chamber. A gift for curious explorers.';
 feedback.textContent=owned?'Already collected: '+item.name:allowed?'A treasure glimmers inside.':item.chest==='secret'&&eligibleForTrial()?'The enchanted lock awaits its sequence of riddles.':'The chest is sealed until its requirements are met.';
 if(item.chest==='secret'&&!owned&&eligibleForTrial()&&!solved(chapter))drawTrial();
 open.disabled=owned||!allowed;open.textContent=owned?'Collected':item.chest==='secret'?'Claim secret treasure':'Open chest';host.classList.add('is-open');host.querySelector('.aca-chest-close').focus();}
 easy.addEventListener('click',()=>show(items[0]));secret.addEventListener('click',()=>show(items[1]));
 open.addEventListener('click',()=>{if(!selected)return;const result=claim(selected.id);feedback.textContent=result.ok?(result.already?'Already collected: ':'Treasure earned! ')+selected.name:result.reason;open.disabled=true;update()});
 function close(){dialog.hidden=true;host.classList.remove('is-open');previous?.focus?.({preventScroll:true})}
 host.querySelector('.aca-chest-close').addEventListener('click',close);
 host.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dialog.hidden){e.preventDefault();close()}});
 new MutationObserver(update).observe(play,{attributes:true,attributeFilter:['hidden','style','class']});window.addEventListener('pageshow',update);update();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();

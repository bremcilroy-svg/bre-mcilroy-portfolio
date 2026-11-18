import {ITEMS,readTreasures,saveTreasures,statsSafe,canEarn,badges} from './academy-treasures.js';
const $=s=>document.querySelector(s);
function render(){const state=readTreasures(),stats=statsSafe();let name='Academy Adventurer';try{name=JSON.parse(localStorage.getItem('amethyst-crescent-character-v1')||'{}').name?.trim()||name}catch{}
 $('#avatar-name').textContent=name;
 $('#collection-count').textContent=state.owned.length+' of '+ITEMS.length+' royal treasures collected';
 const preview=$('#equipped-preview');preview.replaceChildren();
 for(const slot of ['head','neck','back','body']){const item=ITEMS.find(i=>i.id===state.equipped[slot]),box=document.createElement('div');box.className='equipped-slot';const label=document.createElement('strong');label.textContent=slot.toUpperCase();const value=document.createElement('span');value.textContent=item?item.icon+' '+item.name:'Empty';box.append(label,value);preview.append(box)}
 const grid=$('#inventory-grid');grid.replaceChildren();
 for(const item of ITEMS){const owned=state.owned.includes(item.id),eligible=canEarn(item,stats),equipped=state.equipped[item.slot]===item.id;
 const card=document.createElement('article');card.className='treasure-card '+(owned?'owned':'locked');
 const icon=document.createElement('div');icon.className='treasure-icon';icon.textContent=owned?item.icon:'🔒';
 const title=document.createElement('h3');title.textContent=owned?item.name:'Undiscovered treasure';
 const detail=document.createElement('p');detail.textContent=(owned?item.rarity+' · '+item.slot:'Mystery · '+item.rarity)+' · '+(item.chest==='easy'?'Explorer chest':item.chest==='secret'?'Secret chest':'Chapter milestone');
 const note=document.createElement('p');note.textContent=owned?'Collected':eligible?'Available to discover':'Not yet available';
 card.append(icon,title,detail,note);
 if(owned){const button=document.createElement('button');button.type='button';button.textContent=equipped?'Unequip':'Equip';button.addEventListener('click',()=>{const next=readTreasures();if(equipped)delete next.equipped[item.slot];else next.equipped[item.slot]=item.id;if(saveTreasures(next)){$('#treasure-status').textContent=(equipped?'Unequipped ':'Equipped ')+item.name;render()}else $('#treasure-status').textContent='Unable to save equipment in this browser.'});card.append(button)}
 grid.append(card)}
 const badgeGrid=$('#badge-grid');badgeGrid.replaceChildren();for(const badge of badges(stats,state)){const card=document.createElement('article');card.className='treasure-card '+(badge.earned?'owned':'locked');const icon=document.createElement('div');icon.className='treasure-icon';icon.textContent=badge.earned?badge.icon:'◇';const title=document.createElement('h3');title.textContent=badge.name;const note=document.createElement('p');note.textContent=badge.earned?'Badge earned':'Not yet earned';card.append(icon,title,note);badgeGrid.append(card)}
}
window.addEventListener('storage',render);window.addEventListener('pageshow',render);render();

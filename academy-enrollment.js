import {ITEMS,readTreasures,saveTreasures} from './academy-treasures.js';
const HOUSE_KEY='aca-house-v1',CHARACTER_KEY='amethyst-crescent-character-v1',WELCOME_KEY='aca-enrollment-welcome-v1';
const HOUSES=[['amethyst','🔮','House Amethyst','Wisdom through wonder','Enchanted Library'],['crimson','🌹','House Crimson Rose','Courage with compassion','Rose Court'],['moon','🐺','House Moonfang','Loyal beneath every moon','Moonlit Den'],['wonder','🗝️','House Wonderlight','Curiosity opens every door','Curious Parlor']];
const $=s=>document.querySelector(s),panel=$('#enrollment-panel'),status=$('#enrollment-status');
function get(key){try{return localStorage.getItem(key)}catch{return null}}
function set(key,value){try{localStorage.setItem(key,value);return true}catch{return false}}
function character(){try{const c=JSON.parse(get(CHARACTER_KEY)||'null');return c&&typeof c.name==='string'&&c.name.trim()?c:null}catch{return null}}
function house(){return HOUSES.find(h=>h[0]===get(HOUSE_KEY))}
function ready(){return !!house()&&!!character()&&get(WELCOME_KEY)==='true'}
function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n}
function link(label,href){const a=el('a',label,'button');a.href=href;return a}
function button(label,action){const b=el('button',label);b.type='button';b.addEventListener('click',action);return b}
function draw(){panel.replaceChildren();const h=house(),c=character(),welcomed=get(WELCOME_KEY)==='true';status.textContent='';
 if(!h){panel.append(el('div','🦉','crest'),el('h2','The House Placement Ceremony'),el('p','“Welcome, student,” says Headmaster Breezy. “Each house has its own magic. Follow the one that calls to you.”'));const choices=el('div',undefined,'choices');for(const [id,icon,name,motto,room] of HOUSES){const card=el('article',undefined,'choice');card.append(el('h3',icon+' '+name),el('p',motto),el('p','Common room: '+room),button('Join '+name,()=>{if(set(HOUSE_KEY,id))draw();else status.textContent='House selection could not be saved.'}));choices.append(card)}panel.append(choices,link('Explore the house rooms first','academy-houses.html'));return}
 if(!c){panel.append(el('div',h[1],'crest'),el('h2','Welcome to '+h[2]),el('p','Your house common room is '+h[4]+'. Gizmo leads you to the Character Atelier to create your Academy identity.'),link('Explore my house common room','academy-houses.html'),link('Create my Academy character →','amethyst-character-atelier.html'),el('p','Save your character with an Academy name in the Atelier, then return here.'));return}
 if(!welcomed){panel.append(el('div','🎒','crest'),el('h2','Your Academy Welcome Pack'),el('p','Welcome, '+c.name.trim()+' of '+h[2]+'! Headmaster Breezy presents your first Academy keepsakes.'),el('p','📓 Enchanted Academy Notebook · 🪪 Student ID · '+h[1]+' House Badge'));panel.append(button('Accept my welcome pack',()=>{if(!set(WELCOME_KEY,'true')){status.textContent='Unable to save your welcome pack in this browser.';return}draw()}));return}
 panel.append(el('div','🏰','crest'),el('h2','Enrollment Complete!'),el('p','Welcome back, '+c.name.trim()+'. Your house is '+h[2]+'. Gizmo is waiting at the first chapter.'),link('Enter the Poetry Vault →','poetry-vault-entrance.html'),link('Visit my common room','academy-houses.html'),link('Open Royal Inventory','academy-royal-inventory.html'));if(ready())panel.append(el('p','Your Academy enrollment is saved on this device. Returning students can enter the adventure directly.'));
}
draw();

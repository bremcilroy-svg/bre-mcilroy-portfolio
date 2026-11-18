import {readJourney,CHAPTER_ROUTES,CHAPTER_TITLES} from './vault-journey.js';
import {ITEMS,readTreasures,badges,statsSafe} from './academy-treasures.js';
const $=s=>document.querySelector(s),houseNames={amethyst:'🔮 House Amethyst',crimson:'🌹 House Crimson Rose',moon:'🐺 House Moonfang',wonder:'🗝️ House Wonderlight'};
function get(k){try{return localStorage.getItem(k)}catch{return null}}
let char=null;try{char=JSON.parse(get('amethyst-crescent-character-v1')||'null')}catch{}
const house=houseNames[get('aca-house-v1')],welcome=get('aca-enrollment-welcome-v1')==='true',ready=!!house&&!!char?.name?.trim()&&welcome;
$('#student-name').textContent=char?.name?.trim()||'Academy Adventurer';
$('#student-house').textContent=house||'Your house placement awaits.';
const journey=readJourney(get),completed=journey.completed.filter(Boolean).length;
$('#student-progress').textContent=completed+' of 4 original Poetry Vault chapters completed';
const chapters=$('#journey-chapters');for(let i=0;i<CHAPTER_TITLES.length;i++){const p=document.createElement('p'),a=document.createElement('a');a.href=CHAPTER_ROUTES[i];a.textContent=(journey.completed[i]?'✓ Completed · ':'◇ Chapter '+(i+1)+' · ')+CHAPTER_TITLES[i];p.append(a);chapters.append(p)}
const next=$('#student-next'),links=$('#student-links');function action(text,href){const a=document.createElement('a');a.className='button';a.textContent=text;a.href=href;links.append(a)}
if(!ready){next.textContent='Finish house placement, character creation, and the welcome ceremony before beginning your Academy journey.';action('Complete Enrollment →','academy-enrollment.html')}else if(!journey.allComplete){const i=journey.completed.findIndex(x=>!x);next.textContent='Your next adventure: '+CHAPTER_TITLES[i]+'.';action('Continue Adventure →',CHAPTER_ROUTES[i])}else{next.textContent='The original four chapters are complete. Visit the Keepers’ Hall for your next challenge.';action('Visit Keepers’ Hall →','poetry-vault-society.html')}
action('My House Common Room','academy-houses.html');action('Edit My Character','amethyst-character-atelier.html');
const treasure=readTreasures();$('#student-treasures').textContent=treasure.owned.length+' of '+ITEMS.length+' collectible treasures earned.';const earned=badges(statsSafe(),treasure).filter(b=>b.earned);$('#student-badges').textContent=earned.length+' royal badges earned'+(earned.length?': '+earned.map(b=>b.name).join(', '):'.');
window.addEventListener('pageshow',e=>{if(e.persisted)location.reload()});

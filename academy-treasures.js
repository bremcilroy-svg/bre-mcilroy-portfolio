/* Royal rewards: cosmetic collectibles only. Original chapter gates are authoritative. */
import {societyStats} from './vault-society.js';
import {solved} from './academy-secret-trials.js';
export const KEY='aca-royal-treasures-v1';
export const ITEMS=[
{id:'rose-ribbon',name:'Crimson Rose Ribbon',icon:'🎀',rarity:'Common',slot:'head',chapter:0,chest:'easy'},
{id:'heart-pendant',name:'Crimson Heart Necklace',icon:'♥',rarity:'Rare',slot:'neck',chapter:0,chest:'secret'},
{id:'silver-pin',name:'Silver Moon Hairpin',icon:'✧',rarity:'Common',slot:'head',chapter:1,chest:'easy'},
{id:'mirror-circlet',name:'Reflection Circlet',icon:'♕',rarity:'Rare',slot:'head',chapter:1,chest:'secret'},
{id:'owl-feather',name:'Snow Owl Feather',icon:'🪶',rarity:'Common',slot:'back',chapter:2,chest:'easy'},
{id:'moon-wings',name:'Moonstone Wings',icon:'🪽',rarity:'Epic',slot:'back',chapter:2,chest:'secret'},
{id:'dawn-charm',name:'Sunrise Charm',icon:'☀',rarity:'Rare',slot:'neck',chapter:3,chest:'easy'},
{id:'royal-cape',name:'Sunrise Royal Cape',icon:'🧥',rarity:'Epic',slot:'back',chapter:3,chest:'secret'},
{id:'owl-brooch',name:'Keeper’s Owl Brooch',icon:'🦉',rarity:'Epic',slot:'neck',chapter:4,chest:'milestone'},
{id:'amethyst-armor',name:'Amethyst Royal Armor',icon:'🛡',rarity:'Legendary',slot:'body',chapter:5,chest:'milestone'},
{id:'crescent-crown',name:'Legendary Crescent Crown',icon:'👑',rarity:'Legendary',slot:'head',chapter:6,chest:'milestone'},
{id:'aca-hoodie',name:'Academy Amethyst Hoodie',icon:'💜',rarity:'Common',slot:'body',chapter:0,chest:'merch',bonusOf:'rose-ribbon'},
{id:'aca-scarf',name:'Crescent Academy Scarf',icon:'🧣',rarity:'Rare',slot:'neck',chapter:1,chest:'merch',bonusOf:'mirror-circlet'},
{id:'aca-cap',name:'Silver Owl Academy Cap',icon:'🧢',rarity:'Common',slot:'head',chapter:2,chest:'merch',bonusOf:'owl-feather'},
{id:'aca-jacket',name:'Royal Academy Letterman Jacket',icon:'🧥',rarity:'Epic',slot:'body',chapter:3,chest:'merch',bonusOf:'royal-cape'}
];
export const BADGES=[
{id:'first-treasure',name:'Treasure Hunter',icon:'🗝',test:(s,owned)=>owned.length>=1},
{id:'four-chambers',name:'Keeper of the Four',icon:'🏰',test:s=>s.journey.allComplete},
{id:'secret-seeker',name:'Hidden Bookmarks',icon:'📜',test:s=>s.seals.length===4},
{id:'chest-master',name:'Royal Chest Collector',icon:'💎',test:(s,owned)=>ITEMS.filter(x=>x.chapter<4&&x.chest!=='merch').every(x=>owned.includes(x.id))},
{id:'fifth-door',name:'Amethyst Gatekeeper',icon:'🔮',test:s=>s.society.fifth===true&&s.journey.allComplete&&s.seals.length===4}
];
const ids=ITEMS.map(i=>i.id),slots=['head','neck','back','body'];
export function readTreasures(){let raw={};try{raw=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{}
 const owned=ids.filter(id=>Array.isArray(raw.owned)&&raw.owned.includes(id));
 // Players who opened these chests before merchandise launched keep their earned bonuses.
 for(const bonus of ITEMS.filter(x=>x.bonusOf)){if(owned.includes(bonus.bonusOf)&&!owned.includes(bonus.id))owned.push(bonus.id)}
 const equipped={};for(const slot of slots){const id=raw.equipped?.[slot];if(owned.includes(id)&&ITEMS.some(x=>x.id===id&&x.slot===slot))equipped[slot]=id}
 return {owned,equipped};}
export function saveTreasures(state){try{localStorage.setItem(KEY,JSON.stringify(state));window.dispatchEvent(new Event('aca:treasures-changed'));return true}catch{return false}}
export function statsSafe(){try{return societyStats()}catch{return null}}
export function canEarn(item,s){if(!s)return false;
 if(item.chest==='merch')return false; // Merchandise is awarded only as a bonus with its parent chest.
 if(item.chapter<4){if(item.chest==='easy')return true;return s.journey.completed[item.chapter]===true&&s.seals.includes(['heart','mirror','labyrinth','dawn'][item.chapter])&&solved(item.chapter);}
 if(item.chapter===4)return s.journey.allComplete&&s.seals.length===4;
 if(item.chapter===5)return s.society.fifth===true&&s.journey.allComplete&&s.seals.length===4;
 return false; // Finale reward reserved until verified author completion is integrated.
}
export function claim(id){const item=ITEMS.find(x=>x.id===id),s=statsSafe();if(!item||!canEarn(item,s))return {ok:false,reason:'This treasure has not been unlocked yet.'};const state=readTreasures();if(state.owned.includes(id))return {ok:true,already:true,item};state.owned.push(id);const bonus=ITEMS.filter(x=>x.bonusOf===id);for(const extra of bonus){if(!state.owned.includes(extra.id))state.owned.push(extra.id)}if(!saveTreasures(state))return {ok:false,reason:'Browser storage is unavailable.'};return {ok:true,item,bonus}}
export function badges(s=statsSafe(),state=readTreasures()){return BADGES.map(b=>({...b,earned:!!s&&b.test(s,state.owned)}))}

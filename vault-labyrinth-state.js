export const LABYRINTH_SAVE_KEY='bre-poetry-vault-labyrinth-v1';
export const PAGE_IDS=['ash','ivy','bell','star'];
export const PAGE_DATA={
 ash:{name:'Ash',date:'18 November 1896',iso:'1896-11-18',symbol:'❧',note:'The final inventory was carried to the archive after the leaves had fallen.'},
 ivy:{name:'Ivy',date:'6 February 1894',iso:'1894-02-06',symbol:'❦',note:'The earliest register was bound during a winter of long, quiet nights.'},
 bell:{name:'Bell',date:'21 March 1896',iso:'1896-03-21',symbol:'♧',note:'At the first spring bell, a new list of books was entered into the ledger.'},
 star:{name:'Star',date:'12 September 1895',iso:'1895-09-12',symbol:'✦',note:'A lantern was hung in the west passage when this page was written.'}
};
export const LEDGER_ORDER=[...PAGE_IDS].sort((a,b)=>PAGE_DATA[a].iso.localeCompare(PAGE_DATA[b].iso));
export function normalizeLabyrinthState(raw){
 const noteRead=raw?.noteRead===true;
 const gearInstalled=raw?.gearInstalled===true;
 const hour=Number.isInteger(raw?.hour)&&raw.hour>=1&&raw.hour<=12?raw.hour:12;
 const minute=Number.isInteger(raw?.minute)&&raw.minute>=0&&raw.minute<=55&&raw.minute%5===0?raw.minute:0;
 const clockSet=noteRead&&gearInstalled&&raw?.hour===3&&raw?.minute===0&&raw?.clockSet===true;
 const found=clockSet&&Array.isArray(raw?.found)?PAGE_IDS.filter(id=>raw.found.includes(id)):[];
 const used=new Set();const slots=Array.from({length:4},(_,i)=>{const id=raw?.slots?.[i];if(found.includes(id)&&!used.has(id)){used.add(id);return id;}return null;});
 const unlocked=clockSet&&found.length===4&&LEDGER_ORDER.every((id,i)=>slots[i]===id)&&raw?.unlocked===true;
 return {version:1,noteRead,gearInstalled,hour,minute,clockSet,found,slots,unlocked,completed:unlocked&&raw?.completed===true};
}
export function canSetClock(state){return state.noteRead&&state.gearInstalled&&state.hour===3&&state.minute===0;}
export function canOpenLedger(state){return state.clockSet&&state.found.length===4&&state.slots.length===4&&LEDGER_ORDER.every((id,i)=>state.slots[i]===id);}
export const LABYRINTH_WALLS=[{x:-2,z:3.1,w:7.6,d:.3},{x:2,z:-.2,w:7.6,d:.3},{x:-2,z:-3.4,w:7.6,d:.3}];
export function isMazePassable(x,z){return Math.abs(x)<5.55&&Math.abs(z)<6.5&&!LABYRINTH_WALLS.some(b=>Math.abs(x-b.x)<b.w/2+.24&&Math.abs(z-b.z)<b.d/2+.24);}

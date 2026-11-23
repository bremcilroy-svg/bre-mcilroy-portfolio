import {readJourney} from './vault-journey.js';
import {normalizeKeepsakes} from './vault-rewards.js';
export const SOCIETY_KEY='bre-poetry-vault-society-v1';
export const ROOMS=['Heart Chamber','Shattered Mirror','Midnight Labyrinth','Door to Tomorrow'];
const ids=['heart','mirror','labyrinth','dawn'];
const idFor=chapter=>Number.isInteger(chapter)&&chapter>=1&&chapter<=4?ids[chapter-1]:null;
export function societyRead(){
 let raw={};try{raw=JSON.parse(localStorage.getItem(SOCIETY_KEY)||'{}')||{};}catch{}
 const list=name=>Array.isArray(raw[name])?ids.filter(id=>raw[name].includes(id)):[];
 return {hints:list('hints'),clean:list('clean'),inscriptions:list('inscriptions'),started:list('started'),fifth:raw.fifth===true};
}
export function societyWrite(s){try{localStorage.setItem(SOCIETY_KEY,JSON.stringify(s));return true;}catch{return false;}}
// A tracked attempt must begin before any chapter puzzle progress exists.
// Loading an older partially/completely solved chapter cannot prove hint-free play.
export function societyBegin(chapter,fresh){const id=idFor(chapter);if(!id||!fresh)return;const s=societyRead();if(!s.started.includes(id)){s.started.push(id);societyWrite(s);}}
// A reset creates a new attempt. Earned achievements and bookmarks remain earned.
export function societyReset(chapter){const id=idFor(chapter);if(!id)return;const s=societyRead();s.hints=s.hints.filter(x=>x!==id);if(!s.started.includes(id))s.started.push(id);societyWrite(s);}
export function societyHint(chapter){const id=idFor(chapter);if(!id)return;const s=societyRead();if(!s.hints.includes(id))s.hints.push(id);societyWrite(s);}
export function societyComplete(chapter){const id=idFor(chapter);if(!id)return;const s=societyRead();if(s.started.includes(id)&&!s.hints.includes(id)&&!s.clean.includes(id)){s.clean.push(id);societyWrite(s);}}
export function societyInscribe(chapter){const id=idFor(chapter);if(!id)return;const s=societyRead();if(!s.inscriptions.includes(id)){s.inscriptions.push(id);societyWrite(s);}}
export function societyStats(){
 const j=readJourney(k=>localStorage.getItem(k)),s=societyRead();let b=normalizeKeepsakes(null);
 try{b=normalizeKeepsakes(JSON.parse(localStorage.getItem('bre-poetry-vault-keepsakes-v1')||'null'));}catch{}
 return {journey:j,society:s,bookmarks:b.secrets,seals:ids.filter((id,i)=>j.completed[i]&&b.secrets.includes(id)),achievements:ids.map((id,i)=>({id,room:ROOMS[i],complete:j.completed[i],bookmark:b.secrets.includes(id),clean:s.clean.includes(id),inscription:s.inscriptions.includes(id)||b.secrets.includes(id)}))};
}

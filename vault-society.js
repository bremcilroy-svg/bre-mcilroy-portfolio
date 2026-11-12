import {readJourney} from './vault-journey.js';
import {normalizeKeepsakes} from './vault-rewards.js';
export const SOCIETY_KEY='bre-poetry-vault-society-v1';
export const ROOMS=['Heart Chamber','Shattered Mirror','Midnight Labyrinth','Door to Tomorrow'];
const ids=['heart','mirror','labyrinth','dawn'];
export function societyRead(){let raw={};try{raw=JSON.parse(localStorage.getItem(SOCIETY_KEY)||'{}')||{};}catch{};return {hints:Array.isArray(raw.hints)?ids.filter(x=>raw.hints.includes(x)):[],clean:Array.isArray(raw.clean)?ids.filter(x=>raw.clean.includes(x)):[],inscriptions:Array.isArray(raw.inscriptions)?ids.filter(x=>raw.inscriptions.includes(x)):[],fifth:raw.fifth===true};}
export function societyWrite(s){try{localStorage.setItem(SOCIETY_KEY,JSON.stringify(s));}catch{}}
export function societyHint(chapter){const id=ids[chapter-1],s=societyRead();if(!s.hints.includes(id))s.hints.push(id);societyWrite(s);}
export function societyComplete(chapter){const id=ids[chapter-1],s=societyRead();if(!s.hints.includes(id)&&!s.clean.includes(id))s.clean.push(id);societyWrite(s);}
export function societyInscribe(chapter){const id=ids[chapter-1],s=societyRead();if(!s.inscriptions.includes(id))s.inscriptions.push(id);societyWrite(s);}
export function societyStats(){const j=readJourney(k=>localStorage.getItem(k)),s=societyRead();let b=normalizeKeepsakes(null);try{b=normalizeKeepsakes(JSON.parse(localStorage.getItem('bre-poetry-vault-keepsakes-v1')||'null'));}catch{};return {journey:j,society:s,bookmarks:b.secrets,seals:ids.filter((id,i)=>j.completed[i]&&b.secrets.includes(id)),achievements:ids.map((id,i)=>({id,room:ROOMS[i],complete:j.completed[i],bookmark:b.secrets.includes(id),clean:s.clean.includes(id),inscription:s.inscriptions.includes(id)}))};}

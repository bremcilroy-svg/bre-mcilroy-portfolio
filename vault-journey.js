import {normalizeKeepsakes} from './vault-rewards.js?v=20261112-cinematic';
// The title menu reads the existing chapter saves. It never writes or resets them.
import {SAVE_KEY,normalizeState} from './vault-state.js';
import {MIRROR_SAVE_KEY,normalizeMirrorState} from './vault-mirror-state.js';
import {LABYRINTH_SAVE_KEY,normalizeLabyrinthState} from './vault-labyrinth-state.js';
import {DAWN_SAVE_KEY,normalizeDawnState} from './vault-dawn-state.js';
export const CHAPTER_ROUTES=['poetry-vault.html','poetry-vault-mirror.html','poetry-vault-labyrinth.html','poetry-vault-dawn.html'];
export const CHAPTER_TITLES=['The Heart Chamber','The Shattered Mirror','The Midnight Labyrinth','The Door to Tomorrow'];
export function readJourney(read){
 const keys=[SAVE_KEY,MIRROR_SAVE_KEY,LABYRINTH_SAVE_KEY,DAWN_SAVE_KEY],normalizers=[normalizeState,normalizeMirrorState,normalizeLabyrinthState,normalizeDawnState];let storageAvailable=true;
 const saved=(key,normalize)=>{let raw=null;try{const text=read(key);try{raw=JSON.parse(text||'null');}catch{/* Malformed saves are treated as untouched. */}}catch{storageAvailable=false;}return normalize(raw);};
 const states=keys.map((key,i)=>saved(key,normalizers[i]));const bookmarks=saved('bre-poetry-vault-keepsakes-v1',normalizeKeepsakes).secrets.length;
 const [heart,mirror,labyrinth,dawn]=states;
 const touched=[heart.found.length>0||heart.drawerOpen||heart.diaryOpen||heart.completed,mirror.found.length>0||mirror.restored||mirror.unlocked||mirror.completed,labyrinth.noteRead||labyrinth.gearInstalled||labyrinth.clockSet||labyrinth.found.length>0||labyrinth.unlocked||labyrinth.completed,dawn.emblemPlaced||dawn.lightAligned||dawn.found.length>0||dawn.unlocked||dawn.completed];
 // Stop at the first unfinished chapter. Later saves never bypass an earlier
 // chapter's earned key, gear, or emblem, including after a chapter reset.
 const unfinished=states.findIndex(s=>!s.completed),chapter=unfinished===-1?3:unfinished;
 return{hasProgress:touched.some(Boolean)||bookmarks>0,chapter,route:CHAPTER_ROUTES[chapter],title:CHAPTER_TITLES[chapter],completed:states.map(s=>s.completed),poems:states.reduce((n,s,i)=>n+((i===0?s.diaryOpen:s.unlocked)?4:0),0),allComplete:unfinished===-1,storageAvailable};
}

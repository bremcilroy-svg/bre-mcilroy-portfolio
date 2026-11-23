export const MIRROR_SAVE_KEY='bre-poetry-vault-mirror-v1';
export const FRAGMENTS=['thorn','tear','veil','ember'];
export const MIRROR_LAYOUT=['tear','ember','thorn','veil'];
export const START_TURNS={thorn:3,tear:1,veil:1,ember:2};
export function isRestored(found,slots,turns){return found.length===4&&slots.length===4&&MIRROR_LAYOUT.every((id,i)=>slots[i]===id&&turns[id]===0);}
export function normalizeMirrorState(raw){
 const found=Array.isArray(raw?.found)?FRAGMENTS.filter(id=>raw.found.includes(id)):[];
 const used=new Set();const slots=Array.from({length:4},(_,i)=>{const id=raw?.slots?.[i];if(found.includes(id)&&!used.has(id)){used.add(id);return id;}return null;});
 const turns=Object.fromEntries(FRAGMENTS.map(id=>[id,Number.isInteger(raw?.turns?.[id])&&raw.turns[id]>=0&&raw.turns[id]<4?raw.turns[id]:START_TURNS[id]]));
 const restored=raw?.restored===true&&isRestored(found,slots,turns);
 const unlocked=restored&&raw?.unlocked===true;
 return {version:1,found,slots,turns,restored,unlocked,completed:unlocked&&raw?.completed===true};
}
export function canAnswerReflection(state,answer){return state.restored&&String(answer).trim().toUpperCase()==='ECHO';}

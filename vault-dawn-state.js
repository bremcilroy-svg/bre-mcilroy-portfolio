export const DAWN_SAVE_KEY='bre-poetry-vault-dawn-v1';
export const PANEL_IDS=['star','moon','horizon','sun'];
export const PANEL_NAMES={star:'Stars',moon:'Moon',horizon:'First light',sun:'Sunrise'};
export const START_TURNS={star:1,moon:2,horizon:3,sun:1};
export const PAGE_IDS=['bloom','leaf','seed','rain'];
export const PAGE_DATA={seed:{name:'Seed',symbol:'❦',clue:'Begin with the seed. I am the first page.'},rain:{name:'Rain',symbol:'☂',clue:'The rain arrives after the seed, before any leaf.'},leaf:{name:'Leaf',symbol:'❧',clue:'A leaf follows the rain, before the bloom.'},bloom:{name:'Bloom',symbol:'✿',clue:'The last page belongs to the bloom.'}};
export const BOOK_ORDER=['seed','rain','leaf','bloom'];
function slots(raw,allowed){const used=new Set();return Array.from({length:4},(_,i)=>{const id=raw?.[i];if(allowed.includes(id)&&!used.has(id)){used.add(id);return id;}return null;});}
export function panelsAligned(state){return state.emblemPlaced&&PANEL_IDS.every((id,i)=>state.panels[i]===id&&state.turns[id]===0);}
export function normalizeDawnState(raw){
 const emblemPlaced=raw?.emblemPlaced===true;
 const panels=slots(raw?.panels,PANEL_IDS);
 const turns=Object.fromEntries(PANEL_IDS.map(id=>[id,Number.isInteger(raw?.turns?.[id])&&raw.turns[id]>=0&&raw.turns[id]<4?raw.turns[id]:START_TURNS[id]]));
 const lightAligned=raw?.lightAligned===true&&panelsAligned({emblemPlaced,panels,turns});
 const found=lightAligned&&Array.isArray(raw?.found)?PAGE_IDS.filter(id=>raw.found.includes(id)):[];
 const book=slots(raw?.book,found);
 const unlocked=raw?.unlocked===true&&lightAligned&&found.length===4&&BOOK_ORDER.every((id,i)=>book[i]===id);
 return {version:1,emblemPlaced,panels,turns,lightAligned,found,book,unlocked,completed:unlocked&&raw?.completed===true};
}
export function canOpenBook(state){return state.lightAligned&&state.found.length===4&&BOOK_ORDER.every((id,i)=>state.book[i]===id);}

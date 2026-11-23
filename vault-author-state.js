export const AUTHOR_KEY='bre-poetry-vault-author-room-v1';
export const DISCOVERIES=['letter','books','music','photography'];
const seals=['heart','mirror','labyrinth','dawn'];
export function authorAccess(stats){
 const journey=stats?.journey;
 const story=journey?.allComplete===true && Array.isArray(journey.completed) && journey.completed.length===4 && journey.completed.every(x=>x===true);
 const hasSeals=Array.isArray(stats?.seals) && seals.every(x=>stats.seals.includes(x));
 return {story,hasSeals,fifth:stats?.society?.fifth===true,allowed:story&&hasSeals&&stats?.society?.fifth===true};
}
export function normalizeAuthor(raw){
 const seen=Array.isArray(raw?.seen)?DISCOVERIES.filter(x=>raw.seen.includes(x)):[];
 return {seen,kept:seen.length===DISCOVERIES.length && raw?.kept===true};
}
export function discoverAuthor(state,id){
 return normalizeAuthor({...state,seen:[...state.seen,id]});
}
export function bookmarkSVG(){return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="1400" viewBox="0 0 600 1400"><rect width="600" height="1400" fill="#1b1420"/><rect x="28" y="28" width="544" height="1344" rx="230" fill="none" stroke="#cba575" stroke-width="2"/><path d="M150 500Q225 460 300 500Q375 460 450 500V680Q375 640 300 680Q225 640 150 680ZM300 500V680" fill="none" stroke="#cba575" stroke-width="3"/><g text-anchor="middle" fill="#eadcca" font-family="Georgia,serif"><text x="300" y="340" font-size="26" letter-spacing="5">THE POETRY VAULT</text><text x="300" y="800" font-size="42">The Author’s Mark</text><text x="300" y="880" font-size="24">A room discovered.</text><text x="300" y="925" font-size="24">A story still unfolding.</text><text x="300" y="1120" font-size="26">Bre Lynn McIlroy</text></g></svg>`;}

export const LETTERS=['rose','ribbon','moon','key'];
export const DIARY_ORDER=['moon','ribbon','rose','key'];
export const SAVE_KEY='bre-poetry-vault-heart-v1';
export function normalizeState(raw){
  const found=Array.isArray(raw?.found)?LETTERS.filter(id=>raw.found.includes(id)):[];
  const drawerOpen=found.length===4&&raw?.drawerOpen===true;
  const diaryOpen=drawerOpen&&raw?.diaryOpen===true;
  return {version:1,found,drawerOpen,diaryOpen,completed:diaryOpen&&raw?.completed===true};
}
export function canOpenDrawer(state,code){return state.found.length===4&&String(code).trim()==='3142';}
export function canOpenDiary(state,order){return state.drawerOpen&&order.length===4&&DIARY_ORDER.every((id,i)=>order[i]===id);}

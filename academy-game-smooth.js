(()=>{"use strict";if(document.getElementById("academy-journey-dock"))return;const links=[["Royal Gates","amethyst-crescent-academy.html"],["Castle Grounds","academy-royal-castle-grounds.html"],["Royal Gardens","academy-royal-gardens.html"],["Courtyard","academy-moonlit-courtyard.html"],["Great Hall","academy-royal-great-hall.html"],["Four Houses","academy-four-houses.html"],["House Selection","academy-house-selection.html"],["Character Creator","academy-character-creator.html"],["Poetry Vault Entrance","poetry-vault-entrance.html"]];const here=location.pathname.split("/").pop()||"amethyst-crescent-academy.html";const dock=document.createElement("aside");dock.id="academy-journey-dock";dock.setAttribute("aria-label","Academy journey navigation");const toggle=document.createElement("button");toggle.type="button";toggle.id="academy-journey-toggle";toggle.textContent="♛ Castle Map";toggle.setAttribute("aria-expanded","false");toggle.setAttribute("aria-controls","academy-journey-panel");const panel=document.createElement("section");panel.id="academy-journey-panel";panel.hidden=true;const heading=document.createElement("strong");heading.textContent="Explore Amethyst Crescent";const nav=document.createElement("nav");nav.setAttribute("aria-label","Castle destinations");for(const [label,url] of links){const a=document.createElement("a");a.href=url;a.textContent=label;if(url===here)a.setAttribute("aria-current","page");nav.append(a)}const note=document.createElement("p");note.textContent="The map changes rooms only when you select a destination. Puzzle locks and saved progress remain controlled by the original game.";panel.append(heading,nav,note);
// Fountain of Memories: optional, browser-local keepsakes; never touches puzzle saves.
const memoryKey="amethyst-academy-fountain-memories-v1";
const saveMoment=document.createElement("button");saveMoment.type="button";saveMoment.textContent="💜 Save a Memory";saveMoment.setAttribute("aria-label","Save this room to the Fountain of Memories");saveMoment.style.cssText="display:block;margin:8px auto;padding:10px 14px;border:1px solid #c9a3e8;border-radius:12px;background:#352046;color:#fff;font:600 13px system-ui;cursor:pointer";
saveMoment.addEventListener("click",()=>{
 try{
  const room=(document.querySelector("h1")?.textContent||document.title||"Academy Adventure").trim().slice(0,90);
  const memories=JSON.parse(localStorage.getItem(memoryKey)||"[]");
  const safe=Array.isArray(memories)?memories.filter(m=>m&&typeof m.title==="string"):[];
  // Legacy collections can contain more than 30 stored memories. Never trim them just to save a new moment.
  if(safe.length>30){saveMoment.textContent="Legacy memories protected — manage memories at the fountain";return;}
  // Preserve earned milestone crystals when the 30-memory gallery fills.
  while(safe.length>=30){const oldestOrdinary=safe.findIndex(m=>!m.milestone);if(oldestOrdinary<0){saveMoment.textContent="Fountain full: all 30 memories are milestones";return;}safe.splice(oldestOrdinary,1);}
  safe.push({id:Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,7),title:room,path:location.pathname.split("/").pop()||"amethyst-crescent-academy.html",date:new Date().toISOString(),note:""});
  localStorage.setItem(memoryKey,JSON.stringify(safe));
  saveMoment.textContent="✓ Memory saved to the fountain";
  setTimeout(()=>saveMoment.textContent="💜 Save a Memory",2500);
 }catch(e){saveMoment.textContent="Memory unavailable in this browser"}
});
panel.append(saveMoment);
// Record only verified first visits to these rooms, never claim a puzzle was solved.
const firstVisitMilestones={
 "academy-moonlit-courtyard.html":"First Steps into the Moonlit Courtyard",
 "academy-royal-great-hall.html":"First Visit to the Royal Great Hall",
 "academy-four-houses.html":"Discovery of the Four Houses",
 "academy-royal-gardens.html":"First Visit to the Royal Gardens",
 "poetry-vault-entrance.html":"Discovery of the Hidden Poetry Vault"
};
const milestoneTitle=firstVisitMilestones[here];
if(milestoneTitle){try{
 const raw=JSON.parse(localStorage.getItem(memoryKey)||"[]");
 const memories=Array.isArray(raw)?raw.filter(m=>m&&typeof m.title==="string"):[];
 if(!memories.some(m=>m.milestone===here)&&memories.length<=30){
  while(memories.length>=30){const oldestOrdinary=memories.findIndex(m=>!m.milestone);if(oldestOrdinary<0)break;memories.splice(oldestOrdinary,1);}
  if(memories.length<30){
  memories.push({id:"milestone-"+here,title:milestoneTitle,path:here,date:new Date().toISOString(),note:"",milestone:here});
  localStorage.setItem(memoryKey,JSON.stringify(memories));
  try{sessionStorage.setItem("amethyst-fountain-new-milestone",here)}catch(e){}
  document.dispatchEvent(new CustomEvent("academy-fountain-milestone",{detail:{path:here,title:milestoneTitle}}));
  }
 }
}catch(e){/* Private browsing or unavailable storage: gameplay continues. */}}

dock.append(toggle,panel);const closeMap=(restoreFocus=false)=>{if(panel.hidden)return;panel.hidden=true;toggle.setAttribute("aria-expanded","false");if(restoreFocus)toggle.focus()};toggle.addEventListener("click",()=>{if(panel.hidden){panel.hidden=false;toggle.setAttribute("aria-expanded","true")}else closeMap()});document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!panel.hidden){e.preventDefault();closeMap(true)}});document.addEventListener("pointerdown",e=>{if(!panel.hidden&&!dock.contains(e.target))closeMap()});document.addEventListener("focusin",e=>{if(!panel.hidden&&!dock.contains(e.target))closeMap()});(document.getElementById("lobby-navigation")||document.body).append(dock)})();
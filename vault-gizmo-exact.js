/* Gizmo's exact Author's Room artwork — loads the same SVG source used there. */
(()=>{'use strict';
const source='vault-phase4.js';
function init(){
 const host=document.getElementById('pv-gizmo-companion');
 if(!host)return;
 const art=host.querySelector('.pvg-art');
 if(!art)return;
 // The Author's Room uses the original Phase 4 cat SVG. Reuse it directly,
 // including his signature gray muzzle spots, instead of substituting an emoji.
 fetch(source,{cache:'force-cache'}).then(r=>{if(!r.ok)throw Error('Source unavailable');return r.text()}).then(code=>{
  const match=code.match(/<svg class="phase4-cat"[\s\S]*?<\/svg>/);
  if(!match)return;
  const parsed=new DOMParser().parseFromString(match[0],'image/svg+xml');
  const svg=parsed.documentElement;
  if(svg.localName!=='svg'||parsed.querySelector('parsererror'))return;
  svg.removeAttribute('class');svg.removeAttribute('data-mood');
  svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
  // Unique paint IDs prevent collisions with the original on Author's page.
  const uid='pvg-exact-';
  svg.querySelectorAll('[id]').forEach(node=>node.id=uid+node.id);
  svg.querySelectorAll('*').forEach(node=>{
    for(const a of Array.from(node.attributes))if(a.value.includes('url(#'))node.setAttribute(a.name,a.value.replace(/url\(#([^)]+)\)/g,(_,id)=>`url(#${uid}${id})`));
  });
  art.replaceChildren(document.importNode(svg,true));
  host.classList.add('pvg-exact-art');
 }).catch(()=>{/* Original companion remains usable if network is offline. */});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

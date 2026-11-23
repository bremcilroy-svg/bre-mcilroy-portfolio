/* Phase 16.1: Owlkeeper's royal keepsake pass. Browser-only, not authentication. */
(()=>{'use strict';
const KEY='bre-poetry-vault-owl-pass-v1';
const room=document.getElementById('room');
if(!room)return;
const hasPass=()=>{try{return localStorage.getItem(KEY)==='earned';}catch{return false;}};
const savePass=()=>{try{localStorage.setItem(KEY,'earned');}catch{}};
const owner=()=>{const bar=document.getElementById('owner-session-bar');return !!bar&&!bar.hidden;};
const eligible=()=>!room.hidden;
let awarded=false,restoring=false;
const owl=`<svg viewBox="0 0 160 155" width="110" height="106" aria-hidden="true"><path d="M24 40L20 7 57 27Q80 15 103 27L140 7 136 40Q153 65 137 101Q119 139 80 145Q41 139 23 101Q7 65 24 40Z" fill="#3a244b" stroke="#e8bf7a" stroke-width="5"/><path d="M80 61Q57 37 31 57Q28 95 67 98L80 84L93 98Q132 95 129 57Q103 37 80 61Z" fill="#8b5a93" stroke="#e8bf7a" stroke-width="3"/><circle cx="54" cy="75" r="14" fill="#c9a3ff"/><circle cx="106" cy="75" r="14" fill="#c9a3ff"/><circle cx="54" cy="75" r="6" fill="#21172a"/><circle cx="106" cy="75" r="6" fill="#21172a"/><path d="M73 93L80 107 87 93Z" fill="#e8bf7a"/><path d="M60 118Q80 131 100 118" stroke="#e8bf7a" stroke-width="3" fill="none"/></svg>`;
function showPass(){
 if(!eligible())return;
 let card=document.getElementById('pv16-pass');
 if(!card){card=document.createElement('section');card.id='pv16-pass';card.setAttribute('aria-label','Owlkeeper royal vault pass');
 card.innerHTML=`<div class="pv16-pass-card"><div class="pv16-pass-top">✦ THE POETRY VAULT ✦</div><div class="pv16-pass-owl">${owl}</div><p class="pv16-pass-name">THE OWLKEEPER'S PASS</p><h3>Access to Bre's<br>Secret Vault</h3><p class="pv16-pass-footer">RUBY · AMETHYST · GOLD</p></div><p class="pv16-pass-note">Your royal keepsake is saved in this browser. The original castle journey is still required.</p><button type="button" id="pv16-pass-download">Save my owl pass ↓</button>`;
 const door=document.getElementById('pv13-door');(door||room).insertAdjacentElement('afterend',card);
 card.querySelector('#pv16-pass-download').addEventListener('click',()=>{
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1080" viewBox="0 0 720 1080"><rect width="720" height="1080" rx="45" fill="#301729"/><rect x="24" y="24" width="672" height="1032" rx="30" fill="none" stroke="#e8bf7a" stroke-width="8"/><text x="360" y="140" font-family="Georgia" font-size="28" letter-spacing="5" fill="#f0d2a0" text-anchor="middle">THE POETRY VAULT</text><g transform="translate(170 190) scale(2.375)">${owl.replace(/<svg[^>]*>/,'').replace('</svg>','')}</g><text x="360" y="660" font-family="Georgia" font-size="34" fill="#d9b2ff" text-anchor="middle">THE OWLKEEPER'S PASS</text><text x="360" y="760" font-family="Georgia" font-size="49" fill="#fff0d7" text-anchor="middle">Access to Bre's</text><text x="360" y="823" font-family="Georgia" font-size="49" fill="#fff0d7" text-anchor="middle">Secret Vault</text><text x="360" y="965" font-family="Georgia" font-size="22" fill="#e8bf7a" text-anchor="middle">RUBY · AMETHYST · GOLD</text></svg>`;
  const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));const a=document.createElement('a');a.href=url;a.download='breezy-owlkeeper-royal-vault-pass.svg';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
 });}
 if(card.hidden===eligible())card.hidden=!eligible();
}
function restore(){
 if(restoring||!eligible()||!(hasPass()||owner()))return;
 const lock=document.getElementById('pv-kimmi-lock');if(!lock||lock.classList.contains('pvk-unlocked'))return;
 restoring=true;
 // Use the original birthday-lock mechanics; do not change the access gate.
 const cols=[...lock.querySelectorAll('.pvk-column')];
 if(cols.length===4){[0,9,1,3].forEach((digit,i)=>{const down=cols[i].querySelectorAll('button')[1];// The wheel starts on cake; the first downward spin displays 9.
 const presses=(10-digit)%10+1;
 for(let n=0;n<presses;n++)down?.click();});
 // Verify actual display, correcting if needed rather than guessing wheel state.
 const target='0913';cols.forEach((col,i)=>{const out=col.querySelector('.pvk-digit');const up=col.querySelectorAll('button')[0];let tries=0;while(out?.textContent!==target[i]&&tries++<10)up?.click();});
 lock.querySelector('.pvk-try')?.click();
 if(lock.classList.contains('pvk-unlocked')){lock.classList.add('pv16-returning');showPass();}
 }
 restoring=false;
}
function sync(){if(!eligible())return;const lock=document.getElementById('pv-kimmi-lock');if(!lock)return;
 if(lock.classList.contains('pvk-unlocked')){
  if(!awarded){awarded=true;if(!hasPass()&&!owner())savePass();}
  if(hasPass()||owner())showPass();
 }else restore();}
const obs=new MutationObserver(sync);obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden']});
setTimeout(sync,0);document.addEventListener('click',e=>{if(e.target.closest?.('.pvk-try'))queueMicrotask(sync);},true);
})();

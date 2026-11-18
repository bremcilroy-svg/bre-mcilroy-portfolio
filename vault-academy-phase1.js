/* Academy Phase 1: optional profile wizard; NEVER writes existing puzzle saves. */
(()=>{'use strict';
if(location.pathname.split('/').pop()!=='poetry-vault.html')return;
const KEY='bre-poetry-vault-academy-profile-v1';
const questions=[
 {q:'An ancient door appears. What calls to you?',a:['The spell etched into its frame','The secrets whispered behind it','The moonlit path beside it','The light spilling through its cracks'],roles:['Witch','Vampire','Werewolf','Fairy']},
 {q:'Which gift would you protect above all?',a:['Knowledge','Loyalty','Freedom','Wonder'],roles:['Wizard','Werewolf','Heretic','Fairy']},
 {q:'A friend is trapped by an old curse. You…',a:['Study the curse and reverse it','Defend them against the danger','Make a daring bargain','Follow your instincts to a hidden answer'],roles:['Witch','Werewolf','Vampire','Heretic']},
 {q:'Choose the object that feels like yours.',a:['A spellbook','A silver moon pendant','A ruby locket','A star-filled vial'],roles:['Wizard','Werewolf','Vampire','Fairy']}
];
const roles=['Witch','Wizard','Vampire','Werewolf','Fairy','Heretic'];
const houses=[
 {name:'House Aetherveil',symbol:'✧',trait:'Curiosity and hidden knowledge'},
 {name:'House Emberthorn',symbol:'♜',trait:'Courage and fierce loyalty'},
 {name:'House Moonmere',symbol:'☾',trait:'Intuition and compassion'},
 {name:'House Starbloom',symbol:'❀',trait:'Creativity and transformation'}
];
let profile=null;try{const p=JSON.parse(localStorage.getItem(KEY)||'null');if(p&&p.version===1&&roles.includes(p.role))profile=p;}catch{}
let answers=[],step=0,chosen='',modal,launch;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(html){modal.querySelector('.academy-content').innerHTML=html;}
function controls(back,next,label='Continue'){return `<div class="academy-actions">${back?'<button type="button" class="academy-secondary" data-back>← Back</button>':''}<button type="button" class="academy-primary" data-next ${next?'':'disabled'}>${label} →</button></div>`;}
function showQuestion(){
 const x=questions[step];chosen=answers[step]??'';
 render(`<p class="academy-kicker">THE ENCHANTED ACADEMY · QUESTION ${step+1} OF ${questions.length}</p><h2>${x.q}</h2><div class="academy-options">${x.a.map((a,i)=>`<button type="button" class="academy-option" data-choice="${i}" aria-pressed="${chosen===String(i)}">${esc(a)}</button>`).join('')}</div>${controls(step>0,chosen!=='')}`);
 const root=modal.querySelector('.academy-content');
 root.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{chosen=b.dataset.choice;root.querySelectorAll('[data-choice]').forEach(v=>v.setAttribute('aria-pressed',String(v===b)));root.querySelector('[data-next]').disabled=false;});
 root.querySelector('[data-back]')?.addEventListener('click',()=>{step--;showQuestion()});
 root.querySelector('[data-next]').onclick=()=>{if(chosen==='')return;answers[step]=chosen;step++;if(step<questions.length)showQuestion();else showIdentity();};
}
function result(){
 const counts=Object.fromEntries(roles.map(r=>[r,0]));
 answers.forEach((a,i)=>{const r=questions[i].roles[Number(a)];if(r)counts[r]++});
 const rank=roles.map((r,i)=>({r,n:counts[r],i})).sort((a,b)=>b.n-a.n||a.i-b.i);
 const role=rank[0].r;
 const house=houses[(answers.reduce((sum,a,i)=>sum+(Number(a)+1)*(i+1),0))%houses.length];
 return {role,house};
}
function showIdentity(){
 const {role,house}=result();
 render(`<p class="academy-kicker">YOUR MAGICAL IDENTITY</p><div class="academy-crest" aria-hidden="true">${house.symbol}</div><h2>${esc(role)} · ${esc(house.name)}</h2><p>${esc(house.trait)}. Your answers have shaped your first identity.</p><p class="academy-note">These four original houses are a Phase 1 draft and can be renamed before we expand the academy.</p><label>Character name<input id="academy-name" maxlength="36" placeholder="Your magical name" autocomplete="nickname"></label><label>Character appearance<select id="academy-look"><option value="Moonlit">Moonlit — silver and violet</option><option value="Royal">Royal — burgundy and gold</option><option value="Woodland">Woodland — emerald and bronze</option><option value="Starlight">Starlight — midnight blue and pearl</option></select></label><div class="academy-actions"><button type="button" class="academy-secondary" data-back>← Retake last answer</button><button type="button" class="academy-primary" id="academy-save">Save my character →</button></div><p class="academy-note">This first character creator saves a name and appearance palette; a visual avatar builder comes in a later phase.</p>`);
 modal.querySelector('[data-back]').onclick=()=>{step=questions.length-1;showQuestion()};
 modal.querySelector('#academy-save').onclick=()=>{
  const name=modal.querySelector('#academy-name').value.trim().slice(0,36)||'The Wanderer';
  const look=modal.querySelector('#academy-look').value;
  profile={version:1,name,look,role,house:house.name,houseSymbol:house.symbol,answers:[...answers]};
  let saved=true;try{localStorage.setItem(KEY,JSON.stringify(profile))}catch{saved=false}
  showSaved(saved);
 };
}
function showSaved(saved=true){
 if(!profile)return;
 render(`<p class="academy-kicker">THE ACADEMY REGISTRY</p><div class="academy-crest">${esc(profile.houseSymbol||'✧')}</div><h2>Welcome, ${esc(profile.name)}</h2><p><strong>Role:</strong> ${esc(profile.role)}<br><strong>House:</strong> ${esc(profile.house)}<br><strong>Appearance:</strong> ${esc(profile.look)}</p><p>${saved?'Your character is saved in this browser.':'Your character is available for this visit, but this browser could not save it.'}</p><p class="academy-note">Your original Heart Chamber puzzles and progress are unchanged. This is the first layer of the new academy.</p><div class="academy-actions"><button class="academy-primary" id="academy-close-result">Return to the chamber →</button><button class="academy-secondary" id="academy-retake">Create a new character</button></div>`);
 modal.querySelector('#academy-close-result').onclick=()=>modal.close();
 modal.querySelector('#academy-retake').onclick=()=>{answers=[];step=0;showQuestion()};
 launch.textContent='✧ View my academy identity';
}
function init(){
 const actions=document.querySelector('.welcome-actions');
 if(!actions||document.querySelector('#academy-launch'))return;
 launch=document.createElement('button');launch.id='academy-launch';launch.type='button';launch.textContent=profile?'✧ View my academy identity':'✧ Take the Magical Assessment';actions.append(launch);
 modal=document.createElement('dialog');modal.id='academy-modal';modal.setAttribute('aria-label','Enchanted Academy character assessment');
 modal.innerHTML='<button class="academy-close" type="button" aria-label="Close academy assessment">×</button><div class="academy-content"></div>';
 document.body.append(modal);modal.querySelector('.academy-close').onclick=()=>modal.close();
 launch.onclick=()=>{if(profile)showSaved();else{answers=[];step=0;showQuestion()}modal.showModal();};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

/* Phase 4.2: Gizmo's Secret Findings. Client-side game, no database writes. */
(() => {
  const room = document.querySelector('#room');
  if (!room || document.querySelector('#gizmo-secret-findings')) return;
  const section = document.createElement('section');
  section.id = 'gizmo-secret-findings';
  section.className = 'gizmo-findings';
  section.setAttribute('aria-labelledby','gf-title');
  section.innerHTML = `<p class="eyebrow">PHASE 4.2 · THE KEEPER'S DISCOVERIES</p>
    <h2 id="gf-title">Gizmo's Secret Findings 🐾</h2>
    <p>Chief Gizmo has spotted four unusual things in the library. Help him inspect each hiding place and piece together a message from the Keeper of Forgotten Words.</p>
    <div class="gf-layout"><div class="gf-card"><h3>Inspect the library</h3>
      <div class="gf-grid" role="group" aria-label="Four secret hiding places">
        <button type="button" class="gf-spot" data-gf="0">📚 The oldest bookshelf</button>
        <button type="button" class="gf-spot" data-gf="1">🕯️ The candlelit desk</button>
        <button type="button" class="gf-spot" data-gf="2">🗝️ The velvet cushion</button>
        <button type="button" class="gf-spot" data-gf="3">🌙 The moonlit window</button>
      </div><p class="gf-status" id="gf-status" role="status" aria-live="polite">Gizmo is ready to investigate.</p>
      <button type="button" class="gf-reset" id="gf-reset">↺ Restart the mystery</button>
    </div><div class="gf-card"><h3>The Keeper's Collection</h3>
      <p class="gf-progress" id="gf-progress">0 of 4 discoveries found</p><div class="gf-bar" aria-hidden="true"><span id="gf-bar-fill"></span></div>
      <ol class="gf-finds" id="gf-finds"><li>Four secrets are waiting to be discovered.</li></ol>
      <div class="gf-reveal" id="gf-reveal" hidden><h3>✦ A Message from the Keeper ✦</h3>
        <p>“Every forgotten word deserves a home. Every quiet voice deserves to be heard.”</p>
        <p>Gizmo gives an approving blink. Security inspection complete. 💜</p></div>
      <p class="gf-note">Your progress is saved on this device. This is a fictional in-Vault mystery, not a new poem from the author.</p>
    </div></div>`;
  const patrol = room.querySelector('#gizmo-watchcat');
  const phase4 = room.querySelector('#gizmos-enchanted-library');
  if (patrol) patrol.insertAdjacentElement('afterend',section);
  else if (phase4) phase4.insertAdjacentElement('afterend',section);
  else room.append(section);
  const storageKey='poetry-vault-gizmo-findings-v1';
  const finds=[
    {name:'The Brass Bookmark',message:'Behind the oldest book, Gizmo finds a brass bookmark etched with a tiny paw print.'},
    {name:'The Folded Letter',message:'Under the desk blotter, Gizmo discovers a letter sealed with purple wax.'},
    {name:'The Silver Key',message:'Beneath the velvet cushion, Gizmo uncovers a small silver key.'},
    {name:'The Moonstone',message:'On the windowsill, Gizmo finds a moonstone glowing in the moonlight.'}
  ];
  let found=[];
  try {const saved=JSON.parse(localStorage.getItem(storageKey)||'[]');if(Array.isArray(saved))found=saved.filter(x=>Number.isInteger(x)&&x>=0&&x<finds.length);}catch{}
  found=[...new Set(found)];
  const status=section.querySelector('#gf-status'),progress=section.querySelector('#gf-progress'),bar=section.querySelector('#gf-bar-fill'),list=section.querySelector('#gf-finds'),reveal=section.querySelector('#gf-reveal');
  function save(){try{localStorage.setItem(storageKey,JSON.stringify(found));}catch{}}
  function render(){
    section.querySelectorAll('[data-gf]').forEach(button=>{const yes=found.includes(Number(button.dataset.gf));button.dataset.found=String(yes);button.setAttribute('aria-pressed',String(yes));button.title=yes?'Already discovered':'Inspect hiding place';});
    progress.textContent=`${found.length} of ${finds.length} discoveries found`;
    bar.style.width=`${found.length/finds.length*100}%`;
    list.replaceChildren();
    if(!found.length){const li=document.createElement('li');li.textContent='Four secrets are waiting to be discovered.';list.append(li);}
    else found.forEach(index=>{const li=document.createElement('li');li.textContent=finds[index].name;list.append(li);});
    reveal.hidden=found.length!==finds.length;
  }
  section.querySelectorAll('[data-gf]').forEach(button=>button.addEventListener('click',()=>{
    if(room.hidden)return;
    const index=Number(button.dataset.gf);
    if(found.includes(index)){status.textContent=`Gizmo already found ${finds[index].name.toLowerCase()} here. Try another spot!`;return;}
    found.push(index);save();render();status.textContent=finds[index].message;
    const patrolStatus=room.querySelector('#gizmo-watchcat .gw-message');
    if(patrolStatus)patrolStatus.textContent='Chief Gizmo discovered '+finds[index].name+'!';
    if(found.length===finds.length)status.textContent+=' All four discoveries found! The Keeper’s message is unlocked.';
  }));
  section.querySelector('#gf-reset').addEventListener('click',()=>{
    if(room.hidden)return;
    found=[];save();render();status.textContent='The clues have been hidden again. Gizmo is ready for another patrol.';
  });
  render();
})();

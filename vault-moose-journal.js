/* Phase 8: The Secret of 0919. Additive, visitor-facing journal puzzle. */
(() => {
  const room=document.querySelector('#room');
  const trigger=document.querySelector('#open-author-journal');
  if(!room||!trigger||document.querySelector('#pv8-secret'))return;
  const KEY='poetry-vault-moose-journal-unlocked-v1';
  const read=()=>{try{return sessionStorage.getItem(KEY)==='yes'}catch{return false}};
  const save=()=>{try{sessionStorage.setItem(KEY,'yes')}catch{}};
  let unlocked=read(), openingFromPuzzle=false;
  const portrait=document.createElement('section');
  portrait.id='pv8-secret';
  portrait.className='pv8-secret';
  portrait.innerHTML=`
    <div class="pv8-title"><p class="eyebrow">PHASE VIII · A SECRET IN THE STUDY</p><h2>The Secret of the Heart</h2><p>Gizmo has led you home. But another keeper holds a secret.</p></div>
    <div class="pv8-layout">
      <button type="button" id="pv8-portrait" class="pv8-portrait" aria-label="Inspect Moose's portrait and heart necklace">
        <img src="vault-moose-0919-portrait.png" alt="Moose in a jeweled Victorian portrait frame, wearing a purple heart necklace engraved with 0919" loading="lazy">
        <span>🫎 Inspect the portrait</span>
      </button>
      <div class="pv8-scroll"><p class="eyebrow">A riddle left beside the journal</p>
        <h3>The Secret of the Heart</h3>
        <p class="pv8-verse">Look who you followed in,<br>A hidden code will let you win.<br><br>
        Find a different animal who holds the key,<br>Unlock this journal and you will see.<br><br>
        A little glimpse inside my mind,<br>A secret waiting for you to find.<br><br>
        Look upon the walls, and take your time,<br>Find the date that fits this rhyme.</p>
        <p class="pv8-hint">🐾 Gizmo whispers: “I brought you here. Someone else holds the key.”</p>
      </div>
    </div>
    <div class="pv8-journal" id="pv8-journal">
      <div class="pv8-book-art" aria-hidden="true"><span class="pv8-book-name">The Author's<br>Journal</span><span class="pv8-chain"></span><span class="pv8-heart"><span>🫎</span></span></div>
      <div class="pv8-entry">
        <p class="eyebrow">The journal is sealed</p><h3 id="pv8-lock-title">A heart that guards a story</h3>
        <p id="pv8-lock-desc">Find the four-digit combination somewhere in the study. The lock itself offers no numbers.</p>
        <form id="pv8-form"><label for="pv8-code">Enter the four-digit combination</label><div class="pv8-code-row"><input id="pv8-code" type="text" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="off" placeholder="••••" required aria-describedby="pv8-status"><button type="submit">Unlock journal ♡</button></div></form>
        <p id="pv8-status" role="status" aria-live="polite"></p>
        <button type="button" id="pv8-open-unlocked" hidden>✦ Open the Author's Journal →</button>
      </div>
    </div>
    <dialog id="pv8-detail" aria-labelledby="pv8-detail-title"><div class="pv8-detail-body"><button type="button" id="pv8-detail-close" class="pv8-close">Close ×</button><h3 id="pv8-detail-title">Moose's Portrait</h3><img src="vault-moose-0919-portrait.png" alt="Close-up of Moose's purple heart necklace engraved 0919"><p>Gizmo purrs: “Some hearts carry the answers.”</p></div></dialog>`;
  const invitation=room.querySelector('.journal-invitation');
  const section=invitation?.closest('section');
  if(section)section.before(portrait);else room.append(portrait);
  const $=s=>portrait.querySelector(s);
  const form=$('#pv8-form'),status=$('#pv8-status'),code=$('#pv8-code'),open=$('#pv8-open-unlocked'),detail=$('#pv8-detail');
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  function update(){
    portrait.classList.toggle('pv8-unlocked',unlocked);
    form.hidden=unlocked;open.hidden=!unlocked;
    $('#pv8-lock-title').textContent=unlocked?'The heart has opened':'A heart that guards a story';
    $('#pv8-lock-desc').textContent=unlocked?'The journal is ready. Your poems and saved bookmarks remain unchanged.':'Find the four-digit combination somewhere in the study. The lock itself offers no numbers.';
    if(unlocked)status.textContent='✦ Click! The silver chain falls away. Gizmo gives an approving purr.';
  }
  update();
  // Capture the existing journal button before its original listener opens the dialog.
  // We leave the original listener untouched and only allow it through after unlocking.
  trigger.addEventListener('click',e=>{
    if(room.hidden)return;
    if(!unlocked){
      e.preventDefault();e.stopImmediatePropagation();
      portrait.scrollIntoView({behavior:reduced()?'auto':'smooth',block:'start'});
      status.textContent='The journal is locked. Search the room for a clue.';
      code.focus({preventScroll:true});
    }
  },true);
  form.addEventListener('submit',e=>{
    e.preventDefault();
    if(room.hidden)return;
    if(code.value.trim()==='0919'){
      unlocked=true;save();update();
      open.focus({preventScroll:true});
    }else{
      status.textContent='The heart stays closed. Look again at the walls.';
      code.value='';code.focus();
    }
  });
  open.addEventListener('click',()=>{if(!room.hidden&&unlocked)trigger.click()});
  $('#pv8-portrait').addEventListener('click',()=>{if(room.hidden)return;detail.showModal();$('#pv8-detail-close').focus()});
  $('#pv8-detail-close').addEventListener('click',()=>detail.close());
  detail.addEventListener('click',e=>{if(e.target===detail)detail.close()});
  // Put an inspectable portrait on the interactive wall, preserving original hotspots.
  const scene=room.querySelector('#author-immersive .ai6-world');
  if(scene&&!scene.querySelector('#pv8-wall-portrait')){
    const wall=document.createElement('button');
    wall.id='pv8-wall-portrait';wall.type='button';wall.className='pv8-wall-portrait';
    wall.setAttribute('aria-label','Inspect the moose portrait on the wall');
    wall.innerHTML='<img src="vault-moose-0919-portrait.png" alt=""><span>MOOSE PORTRAIT</span>';
    wall.addEventListener('click',()=>{if(room.hidden)return;portrait.scrollIntoView({behavior:reduced()?'auto':'smooth',block:'start'});detail.showModal()});
    scene.append(wall);
  }
})();

/* Phase 9.2 — The Whispering Bookshelf. Additive; no existing data is changed. */
(() => {
  'use strict';
  const room = document.getElementById('room');
  if (!room || document.getElementById('pv92-shelf')) return;
  const KEY = 'poetry-vault-whispering-books-v1';
  const books = [
    {title:'The Unspoken',symbol:'✒',color:'#67415c',whisper:'“Every story begins with someone brave enough to speak.”',fragment:'L',clue:'The first letter rests where the silence ends.'},
    {title:'The Midnight Garden',symbol:'☾',color:'#324d5b',whisper:'“Even in darkness, something beautiful can grow.”',fragment:'I',clue:'A moonlit path leads to the second letter.'},
    {title:'The Keeper’s Promise',symbol:'❦',color:'#59436d',whisper:'“What is remembered can never be entirely lost.”',fragment:'G',clue:'The third letter hides in a promise kept.'},
    {title:'A Heart of Paper',symbol:'♡',color:'#74414d',whisper:'“The heart knows which words belong to it.”',fragment:'H',clue:'The fourth letter rests beside the heart.'},
    {title:'The Last Lantern',symbol:'✧',color:'#6b583e',whisper:'“Some lights are carried by those who have survived the dark.”',fragment:'T',clue:'The last letter waits in the lantern’s glow.'}
  ];
  let found=[];let solved=false;
  try {const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&Array.isArray(s.found))found=[...new Set(s.found.filter(n=>Number.isInteger(n)&&n>=0&&n<books.length))];solved=s?.solved===true&&found.length===books.length;} catch {}
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify({found,solved}));}catch{}};
  const section=document.createElement('section');
  section.id='pv92-shelf';section.className='pv92';section.setAttribute('aria-labelledby','pv92-title');
  section.innerHTML=`<div class="pv92-head"><p class="eyebrow">PHASE IX · THE LIBRARY OF LIVING SECRETS</p><h2 id="pv92-title">The Whispering Bookshelf</h2><p>Five books have been waiting for you. Touch their spines, listen to their whispers, and piece together the word that wakes the shelf.</p></div>
    <div class="pv92-arch"><div class="pv92-stars" aria-hidden="true">✧　☾　✦　✧</div><div class="pv92-books" role="group" aria-label="Five enchanted books"></div><div class="pv92-ledge" aria-hidden="true"></div></div>
    <div class="pv92-bottom"><div class="pv92-whisper" aria-live="polite"><p class="eyebrow">THE BOOKS REMEMBER</p><h3 id="pv92-book-name">A quiet shelf</h3><p id="pv92-voice">Gizmo: “These books seem to know something. Try tapping one.”</p><p id="pv92-clue"></p></div><div class="pv92-puzzle"><p class="eyebrow">THE KEEPER'S WORD</p><h3>Gather the five letters</h3><p id="pv92-progress" role="status"></p><div id="pv92-letters" class="pv92-letters" aria-label="Letters discovered"></div><form id="pv92-form"><label for="pv92-answer">What word do the books spell, from left to right?</label><div class="pv92-answer-row"><input id="pv92-answer" type="text" maxlength="12" autocomplete="off" spellcheck="false" placeholder="The hidden word" required><button type="submit">Wake the shelf ✦</button></div></form><p id="pv92-status" role="status" aria-live="polite"></p><div id="pv92-reward" class="pv92-reward" hidden><strong>✦ The Keeper's Light ✦</strong><p>“A library is not merely where words are kept. It is where a little light is left on for anyone who needs to find their way home.”</p><p>Gizmo curls up beneath the glowing books. You have awakened the shelf.</p></div></div></div>
    <p class="pv92-note">This is a fictional puzzle written for the Vault. Your progress is stored in this browser. It does not alter your poetry, journal, or other puzzles.</p>`;
  const target=room.querySelector('#pv91-cabinet')||room.querySelector('#gizmo-secret-findings')||room.querySelector('#bookshelf');
  if(target)target.insertAdjacentElement('afterend',section);else room.append(section);
  const $=sel=>section.querySelector(sel);
  const shelf=$('.pv92-books');
  books.forEach((book,i)=>{const button=document.createElement('button');button.type='button';button.className='pv92-book';button.dataset.index=String(i);button.style.setProperty('--book',book.color);button.setAttribute('aria-label',`Inspect book ${i+1}: ${book.title}`);button.innerHTML=`<span class="pv92-glyph" aria-hidden="true">${book.symbol}</span><span class="pv92-spine-name">${book.title}</span><span class="pv92-book-number">0${i+1}</span>`;shelf.append(button);button.addEventListener('click',()=>{
    if(room.hidden)return;
    if(!found.includes(i)){found.push(i);found.sort((a,b)=>a-b);save();}
    $('#pv92-book-name').textContent=book.title;
    $('#pv92-voice').textContent=book.whisper;
    $('#pv92-clue').textContent=`A glowing letter appears: ${book.fragment}. ${book.clue}`;
    render();
  });});
  function render(){
    shelf.querySelectorAll('.pv92-book').forEach(button=>{const active=found.includes(Number(button.dataset.index));button.dataset.found=String(active);button.setAttribute('aria-pressed',String(active));});
    $('#pv92-progress').textContent=`${found.length} of ${books.length} enchanted books inspected`;
    const letters=$('#pv92-letters');letters.replaceChildren();books.forEach((book,i)=>{const span=document.createElement('span');span.textContent=found.includes(i)?book.fragment:'?';span.setAttribute('aria-label',found.includes(i)?`Letter ${i+1}: ${book.fragment}`:`Letter ${i+1}: hidden`);letters.append(span);});
    $('#pv92-form').hidden=solved;
    $('#pv92-reward').hidden=!solved;
    if(solved){section.classList.add('pv92-awake');$('#pv92-status').textContent='The bookshelf awakens. All five books glow softly.';}
  }
  $('#pv92-form').addEventListener('submit',event=>{event.preventDefault();if(room.hidden)return;if(found.length!==books.length){$('#pv92-status').textContent='The shelf is still sleeping. Inspect all five books first.';return;}
    if($('#pv92-answer').value.trim().toUpperCase()==='LIGHT'){solved=true;save();render();$('#pv92-reward').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});}else{$('#pv92-status').textContent='The books rustle. That is not the word they are whispering. Read the letters from left to right.';}
  });
  const world=room.querySelector('#author-immersive .ai6-world');
  if(world&&!world.querySelector('#pv92-wall-shelf')){const b=document.createElement('button');b.type='button';b.id='pv92-wall-shelf';b.className='pv92-wall-shelf';b.setAttribute('aria-label','Explore the whispering bookshelf');b.innerHTML='<span aria-hidden="true">📚 ✨</span><small>WHISPERING BOOKS</small>';b.addEventListener('click',()=>{if(room.hidden)return;section.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});});world.append(b);}
  render();
})();

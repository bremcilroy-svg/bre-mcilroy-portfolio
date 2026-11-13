/* Phase 7 — The Living Book. Additive, self-contained, no auth or puzzle changes. */
(() => {
  const room = document.getElementById('room');
  if (!room || document.getElementById('pv7-book')) return;
  const key = 'poetry-vault-living-book-page-v1';
  const total = 17; // Manuscript pages 1–17; PDF page 18 is the original cover.
  const toc = [
    'Afraid of Change · New Beginnings',
    'Playing with fire · Late Night Conversations',
    'Sold My Soul · A note from the poor',
    'Late night thoughts · or so I thought',
    'Not meant to be · I want to be loved',
    'Falling in Love · Don’t Leave Me',
    'Waiting for you · My Masterpiece',
    'I’ve been waiting for you · Wasn’t expect you',
    'Bonded for life · Self Love',
    'The Painter · Moving on',
    'Darkness · Stuck on the Sidelines',
    'Love is not a feeling',
    'My dear friend, Ana Rex Sia · broken hearted',
    'Never (part one)',
    'Never (continued)',
    'Never (conclusion)',
    'pure bliss'
  ];
  const imgPath = page => `vault-book-page-${String(page).padStart(2,'0')}.webp`;
  const safeRead = () => { try {const n=Number(localStorage.getItem(key));return Number.isInteger(n)&&n>=1&&n<=total?n:1;}catch{return 1;} };
  const safeSave = n => {try{localStorage.setItem(key,String(n));}catch{}};
  let page = safeRead();
  let hasOpened = false;
  const section = document.createElement('section');
  section.id = 'pv7-book';
  section.className = 'pv7-section section-wrap';
  section.setAttribute('aria-labelledby','pv7-title');
  section.innerHTML = `
    <div class="pv7-heading"><p class="eyebrow">PHASE VII · THE LIVING BOOK</p><h2 id="pv7-title">Love, Pain &amp; The Chaos in My Brain</h2><p>By Bre Lynn McIlroy · Your original poetry collection, preserved page by page.</p></div>
    <div class="pv7-cover-area"><button type="button" id="pv7-open" class="pv7-cover" aria-label="Open Love, Pain and The Chaos in My Brain"><img src="vault-book-page-18.webp" alt="Original book cover: a warm sunset scene of love and a cool blue swirling scene of chaos" loading="lazy"><span>✦ Open the book ✦</span></button><div class="pv7-invitation"><p class="pv7-script">Every story deserves to be heard.</p><p>Discover the poems that inspired this Vault. Turn each page, revisit your favorites, and return whenever you wish.</p><p class="pv7-warning"><strong>A note for readers:</strong> This collection includes experiences of abuse, sexual violence, self-harm, eating disorders, depression, and other difficult themes. Read at your own pace.</p><button type="button" id="pv7-continue">Open the Living Book →</button></div></div>
    <div class="pv7-reader" id="pv7-reader" hidden aria-label="Interactive poetry book reader">
      <div class="pv7-reader-head"><span class="pv7-kicker">THE LIVING BOOK · ORIGINAL MANUSCRIPT</span><button type="button" id="pv7-close">Close book ×</button></div>
      <div class="pv7-book-tools"><label for="pv7-toc">Find a page</label><select id="pv7-toc"></select><button type="button" id="pv7-zoom" aria-pressed="false">🔎 Enlarge page</button></div>
      <div class="pv7-paper-frame" id="pv7-paper-frame"><img id="pv7-paper" src="vault-book-page-01.webp" alt="Original manuscript page 1" loading="lazy"></div>
      <div class="pv7-pagination"><button type="button" id="pv7-prev">← Previous</button><span id="pv7-counter" role="status" aria-live="polite"></span><button type="button" id="pv7-next">Next →</button></div>
      <p class="pv7-saved" id="pv7-saved">Your place is saved on this device.</p><p><a href="vault-love-pain-chaos-original.pdf" target="_blank" rel="noopener">View the complete original PDF ↗</a></p>
    </div>`;
  const shelf = room.querySelector('#bookshelf');
  if (shelf) shelf.after(section);
  else room.append(section);
  const $ = sel => section.querySelector(sel);
  const reader = $('#pv7-reader');
  const paper = $('#pv7-paper');
  const tocSelect = $('#pv7-toc');
  tocSelect.innerHTML = toc.map((name,i)=>`<option value="${i+1}">Page ${i+1} · ${name.replaceAll('&','&amp;').replaceAll('<','&lt;')}</option>`).join('');
  function display(n, scroll=false){
    page=Math.max(1,Math.min(total,n));
    paper.src=imgPath(page);
    paper.alt=`Original manuscript page ${page} of ${total}: ${toc[page-1]}`;
    $('#pv7-counter').textContent=`Page ${page} of ${total}`;
    $('#pv7-prev').disabled=page===1;
    $('#pv7-next').disabled=page===total;
    tocSelect.value=String(page);
    safeSave(page);
    if(scroll) reader.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function open(){
    if(room.hidden) return;
    hasOpened=true;
    reader.hidden=false;
    section.classList.add('pv7-reading');
    display(page);
    reader.scrollIntoView({behavior:'smooth',block:'start'});
  }
  $('#pv7-open').addEventListener('click',open);
  $('#pv7-continue').addEventListener('click',open);
  $('#pv7-close').addEventListener('click',()=>{reader.hidden=true;section.classList.remove('pv7-reading');$('#pv7-open').focus({preventScroll:true});section.scrollIntoView({behavior:'smooth',block:'start'});});
  $('#pv7-prev').addEventListener('click',()=>display(page-1));
  $('#pv7-next').addEventListener('click',()=>display(page+1));
  tocSelect.addEventListener('change',()=>display(Number(tocSelect.value)));
  $('#pv7-zoom').addEventListener('click',()=>{const zoom=$('#pv7-paper-frame').classList.toggle('pv7-zoomed');$('#pv7-zoom').setAttribute('aria-pressed',String(zoom));$('#pv7-zoom').textContent=zoom?'↙ Fit page':'🔎 Enlarge page';});
  // Attach a new book hotspot without altering the existing Phase 6 furniture listeners.
  function attachStudyShortcut(){
    const scene=room.querySelector('#author-immersive');
    if(!scene || scene.querySelector('#pv7-room-book')) return false;
    const actions=scene.querySelector('.ai6-actions');
    if(actions){const b=document.createElement('button');b.id='pv7-room-book';b.type='button';b.textContent='📖 Read the poetry book';b.addEventListener('click',open);actions.append(b);}
    const world=scene.querySelector('.ai6-world');
    if(world){const b=document.createElement('button');b.id='pv7-world-book';b.type='button';b.className='pv7-world-book';b.innerHTML='<span>📖</span><small>THE LIVING BOOK</small>';b.setAttribute('aria-label','Open the poetry book on the shelf');b.addEventListener('click',open);world.append(b);}
    return true;
  }
  if(!attachStudyShortcut()){
    const watcher=new MutationObserver(()=>{if(attachStudyShortcut())watcher.disconnect();});
    watcher.observe(room,{childList:true,subtree:true});
  }
  // Keyboard navigation when the reader is open and focus is not in a control.
  reader.addEventListener('keydown',e=>{
    if(e.target.closest('select,button,a,input'))return;
    if(e.key==='ArrowLeft'){e.preventDefault();display(page-1);}
    if(e.key==='ArrowRight'){e.preventDefault();display(page+1);}
  });
  display(page);
})();

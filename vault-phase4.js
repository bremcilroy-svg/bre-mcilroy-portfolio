/* Phase 4: interactive additions. Does not modify owner verification or Supabase. */
const room=document.querySelector('#room');
if(room){
  const section=document.createElement('section');
  section.id='gizmos-enchanted-library';section.className='phase4';
  section.setAttribute('aria-labelledby','phase4-title');
  section.innerHTML=`<p class="eyebrow">PHASE IV · GIZMO'S ENCHANTED LIBRARY</p><h2 id="phase4-title">The library has a heartbeat.</h2><p>Meet Gizmo, guardian of forgotten words, and explore five stories still being written. Every interaction happens right here, without reloading the page.</p>
  <div class="phase4-layout"><div class="phase4-card"><h3>Gizmo's favorite corner</h3>
  <svg class="phase4-cat" data-mood="awake" viewBox="0 0 320 360" role="img" aria-label="Gray and white Gizmo with golden green eyes, a white nose stripe, black nose and two distinct gray spots beside his mouth">
  <defs><radialGradient id="p4fur"><stop stop-color="#787a7d"/><stop offset="1" stop-color="#373a40"/></radialGradient><linearGradient id="p4white" x2="0.6" y2="1"><stop stop-color="#fff"/><stop offset="1" stop-color="#d4d7d8"/></linearGradient></defs>
  <path d="M239 296 Q309 300 281 216" fill="none" stroke="#41434a" stroke-width="28" stroke-linecap="round"/><ellipse cx="159" cy="265" rx="105" ry="87" fill="url(#p4fur)"/><path d="M113 218 Q160 190 207 216 L195 330 Q159 353 118 330Z" fill="url(#p4white)"/>
  <path d="M64 126 L65 35 Q94 43 116 84 Q160 70 194 84 Q219 40 249 34 L246 134 Q258 208 181 240 L125 240 Q48 209 64 126Z" fill="url(#p4fur)" stroke="#34353c" stroke-width="3"/><path d="M73 105 L78 55 L109 94Z M202 93 L239 54 L235 109Z" fill="#ad8590"/>
  <path d="M147 98 Q160 89 173 99 L179 174 L160 210 L141 175Z" fill="url(#p4white)"/><ellipse cx="115" cy="146" rx="24" ry="20" fill="#c6c970" stroke="#25282c" stroke-width="4"/><ellipse cx="207" cy="146" rx="24" ry="20" fill="#c6c970" stroke="#25282c" stroke-width="4"/><ellipse cx="115" cy="146" rx="7" ry="17" fill="#171a1c"/><ellipse cx="207" cy="146" rx="7" ry="17" fill="#171a1c"/><circle cx="108" cy="139" r="4" fill="white"/><circle cx="200" cy="139" r="4" fill="white"/>
  <path d="M115 187 Q140 177 160 187 Q181 176 206 188 L200 218 Q161 243 120 217Z" fill="#f1f0eb"/>
  <!-- Two signature gray muzzle spots, one on either side of Gizmo's mouth. -->
  <ellipse cx="136" cy="207" rx="11" ry="8" fill="#63666a"/><ellipse cx="184" cy="207" rx="11" ry="8" fill="#63666a"/>
  <path d="M148 185 Q160 180 172 185 L160 199Z" fill="#191a1d"/><path d="M160 198 L160 211 M160 211 Q149 220 140 215 M160 211 Q173 220 182 215" stroke="#343438" stroke-width="2" fill="none" stroke-linecap="round"/>
  <g stroke="#eee" stroke-width="1.7"><path d="M130 202 L61 185 M130 211 L49 208 M131 217 L64 230 M190 202 L259 185 M190 211 L270 208 M189 217 L257 230"/></g><ellipse cx="100" cy="327" rx="38" ry="19" fill="#f1f0ee"/><ellipse cx="210" cy="327" rx="38" ry="19" fill="#f1f0ee"/>
  <g class="phase4-eyelids" fill="#5a5d61"><path d="M87 144 Q115 122 141 144 Q114 156 87 144Z"/><path d="M181 144 Q208 122 233 144 Q207 156 181 144Z"/></g></svg>
  <div class="phase4-controls"><button type="button" data-gizmo-action="pet">♡ Pet</button><button type="button" data-gizmo-action="stretch">🐾 Stretch</button><button type="button" data-gizmo-action="nap">☾ Nap</button><button type="button" data-gizmo-action="wake">✦ Wake up</button></div><p class="phase4-status" id="phase4-gizmo-message" role="status">Gizmo watches the library with his yellow-green eyes.</p></div>
  <div class="phase4-card"><h3>The Broken Princess Diaries</h3><div class="phase4-shelf" role="group" aria-label="Explore the five books"></div><div class="phase4-reader" id="phase4-reader" aria-live="polite"><h4>Choose a book</h4><p>Each book has its own story and symbolic cover.</p></div><a class="phase4-owner-link" href="poetry-vault-owner-studio.html">Owner: open my writing studio →</a></div></div>`;
  const anchor=room.querySelector('.living-library');if(anchor)anchor.insertAdjacentElement('afterend',section);else room.append(section);
  const cat=section.querySelector('.phase4-cat'),status=section.querySelector('#phase4-gizmo-message');
  const messages={pet:'Gizmo leans into your hand and blinks slowly. ♡',stretch:'Gizmo stretches his paws and arches his back.',nap:'Gizmo closes his eyes beside the books.',wake:'Gizmo wakes and watches over the library again.'};
  section.querySelectorAll('[data-gizmo-action]').forEach(button=>button.addEventListener('click',()=>{const action=button.dataset.gizmoAction;cat.dataset.mood=action==='nap'?'nap':action==='stretch'?'stretch':'awake';status.textContent=messages[action];}));
  const books=[
    ['Fairy God-Sister','♛','A Cinderella-inspired story of foster care, sisterhood, and the search for a safe home.'],
    ['Rain Black and the 7 Doctors','❄','A Snow White-inspired journey through mental health diagnoses and healing.'],
    ['The Beauty Within','🥀','A Beauty and the Beast retelling about reactive behavior and self-discovery.'],
    ['Escaping Wonderland','♠','An Alice in Wonderland-inspired story set in a psychiatric unit.'],
    ['Locked Away','♜','A Rapunzel-inspired story about a controlling mother and reclaiming freedom.']
  ];
  const shelf=section.querySelector('.phase4-shelf'),reader=section.querySelector('#phase4-reader');
  books.forEach(([title,symbol,description])=>{const button=document.createElement('button');button.type='button';button.className='phase4-book';button.setAttribute('aria-label','Open '+title);const icon=document.createElement('span');icon.className='glyph';icon.textContent=symbol;const label=document.createElement('span');label.className='book-name';label.textContent=title;button.append(icon,label);button.addEventListener('click',()=>{const heading=document.createElement('h4'),body=document.createElement('p'),footer=document.createElement('p');heading.textContent=title;body.textContent=description;footer.textContent='Coming soon · By Bre Lynn McIlroy';reader.replaceChildren(heading,body,footer);});shelf.append(button);});
}

import {getOwnerAuth} from './vault-owner-auth.js?v=20261112-login';
import {mountJournal} from './vault-author-journal.js?v=20261112-journal-crease';
import {societyStats} from './vault-society.js?v=20261112-phase7fix';
import {AUTHOR_KEY,DISCOVERIES,authorAccess,normalizeAuthor,discoverAuthor,bookmarkSVG} from './vault-author-state.js?v=20261112-author-bio';
import {series,welcome,connections,authorLetter} from './vault-author-content.js?v=20261112-author-bio';
const $=s=>document.querySelector(s), dialog=$('#discovery-dialog');
let closeJournal=()=>{};
let ownerVerified=false,ownerAuth=null;
let state=normalizeAuthor(null),storageOK=true,allowed=false,returnFocus=null;
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function read(){let raw;try{raw=localStorage.getItem(AUTHOR_KEY);storageOK=true;}catch{storageOK=false;return;}try{state=normalizeAuthor(JSON.parse(raw||'null'));}catch{state=normalizeAuthor(null);}}
function save(){try{localStorage.setItem(AUTHOR_KEY,JSON.stringify(state));storageOK=true;}catch{storageOK=false;}renderProgress();}
function renderProgress(){
 document.querySelectorAll('[data-discover]').forEach(el=>{const seen=state.seen.includes(el.dataset.discover);el.dataset.seen=String(seen);const status=el.querySelector('.discovery-status');if(status)status.textContent=seen?'Discovered ✓':'Open this discovery ↗';});
 const complete=state.seen.length===4;
 $('#mark-progress').textContent=complete?(state.kept?'Your keepsake is collected. You can download it again.':'All four desk discoveries found. Your keepsake is ready.'):`${state.seen.length} of 4 desk discoveries found. Explore all four to collect your bookmark.`;
 $('#download-mark').disabled=!complete;$('#download-mark').textContent=complete?'Download your bookmark ↓':'Discover all four objects';
 $('#save-status').textContent=storageOK?'Discoveries are saved in this browser.':'Browser storage is unavailable. Discoveries will last only while this page stays open.';
}
function refresh(){
 const access=authorAccess(societyStats());allowed=access.allowed||ownerVerified;closeJournal();
 $('#gate').hidden=allowed;$('#room').hidden=!allowed;
 if(!allowed){if(dialog.open)dialog.close();const message=!access.story?'The library is still holding a few pages for you. Complete all four original chambers to continue.':!access.hasSeals?'Find the hidden bookmark in each original chamber to earn all four seals.':'The last door is waiting. Complete the Fifth Door epilogue to enter the author’s study.';
 $('#gate-message').textContent=message;$('#gate-actions').innerHTML=`<a class="button" href="${!access.story?'poetry-vault-entrance.html':!access.hasSeals?'poetry-vault-society.html':'poetry-vault-fifth-door.html'}">${!access.story?'Continue your journey':!access.hasSeals?'Visit the Keepers’ Hall':'Approach the Fifth Door'} →</a>`;
 }renderProgress();
}
function show(eyebrow,title,html,trigger){
 if(!allowed)return;
 returnFocus=trigger||document.activeElement;$('#dialog-eyebrow').textContent=eyebrow;$('#dialog-title').textContent=title;$('#dialog-content').innerHTML=html;
 if(!dialog.open)dialog.showModal();$('#close-dialog').focus();
}
function discover(id,trigger){
 if(!allowed||!DISCOVERIES.includes(id))return;
 state=discoverAuthor(state,id);save();
if(id==='letter')show('Meet the Author','The Voice They Couldn’t Silence',`<figure class="author-portrait"><img src="bre-lynn-mcilroy-author.jpg" alt="Bre Lynn McIlroy wearing rainbow glasses and a black polka-dot dress."><figcaption>Bre Lynn McIlroy</figcaption></figure><p class="author-byline">By Bre Lynn McIlroy</p><div class="author-letter">${authorLetter.map((p,i)=>`<p>${[8,14,15].includes(i)?'<strong>'+escape(p)+'</strong>':escape(p)}</p>`).join('')}</div><p class="dialog-signature">— Bre Lynn McIlroy</p>`,trigger);
 if(id==='books')show('The journal on the desk',series.title,`<p>${escape(series.description)}</p><p>${series.books.length} planned books. A shelf for stories still taking shape.</p><a class="button" href="#bookshelf" id="view-shelf">Explore the planned books ↓</a>`,trigger);
 if(id==='music')show('The music box','Words that become songs.',`<p>Some creative threads lead beyond the written page. Explore Bre’s music and songwriting in the portfolio.</p><a class="button" href="music.html">Explore the music →</a>`,trigger);
 if(id==='photography')show('The camera','Stories in another light.',`<p>The author’s world reaches beyond words. Follow the light into Bre’s photography.</p><a class="button" href="photography.html">Explore the photography →</a>`,trigger);
 const shelf=$('#view-shelf');if(shelf)shelf.addEventListener('click',()=>dialog.close());
}
$('#series-title').textContent=series.title;$('#series-description').textContent=series.description;$('.series-byline').textContent=`By ${series.author} · ${series.books.length} planned books`;
const covers=['#543145','#293c39','#583e3a','#3e3455','#343a4b'];
$('#book-grid').innerHTML=series.books.map((book,i)=>`<article class="book-wrap"><button class="book book-cover-${i+1}" data-book="${escape(book.id)}" style="--cover:${covers[i%covers.length]}" aria-label="About planned book ${i+1}: ${escape(book.title)}"><span class="book-number">BOOK ${String(i+1).padStart(2,'0')}</span><span class="book-symbol" aria-hidden="true">${book.symbol}</span><h3>${escape(book.title)}</h3><span class="inspiration">${escape(book.inspiration)}</span><span class="book-author">BRE LYNN MCILROY</span></button><p class="book-caption">Planned · Discover this book ↗</p></article>`).join('');
$('#connections').innerHTML=connections.map(c=>`<a class="connection" href="${c.href}"><h3>${escape(c.title)}</h3><p>${escape(c.description)}</p><span>${escape(c.label)} →</span></a>`).join('');
document.querySelectorAll('[data-discover]').forEach(el=>el.addEventListener('click',()=>discover(el.dataset.discover,el)));
document.querySelectorAll('[data-book]').forEach(el=>el.addEventListener('click',()=>{if(!allowed)return;const i=series.books.findIndex(b=>b.id===el.dataset.book),book=series.books[i];state=discoverAuthor(state,'books');save();show(`Book ${i+1} · Planned`,book.title,`<p class="dialog-meta"><strong>Series</strong><br>${escape(series.title)}<br><br><strong>Fairy-tale inspiration</strong><br>${escape(book.inspiration)}</p><p>${escape(series.description)}</p><p>This book is planned. Story details and publication updates will be added as they are ready.</p>`,el);}));
$('#close-dialog').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{if(returnFocus?.isConnected&&allowed)returnFocus.focus({preventScroll:true});});
$('#download-mark').addEventListener('click',()=>{if(!allowed||state.seen.length!==4)return;state.kept=true;save();const url=URL.createObjectURL(new Blob([bookmarkSVG()],{type:'image/svg+xml'}));const a=document.createElement('a');a.href=url;a.download='the-authors-mark-bre-mcilroy.svg';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);});
read();refresh();window.addEventListener('pageshow',refresh);window.addEventListener('storage',event=>{if(event.key===AUTHOR_KEY||event.key===null)read();refresh();});document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});

mountJournal(()=>allowed).then(close=>{closeJournal=close;});

const ownerBar=document.querySelector('#owner-session-bar');
getOwnerAuth().then(auth=>{ownerAuth=auth;auth.access.subscribe(s=>{ownerVerified=s.owner;ownerBar.hidden=!s.owner;refresh();});}).catch(()=>{ownerVerified=false;refresh();});
document.querySelector('#owner-room-signout').addEventListener('click',async()=>{const b=document.querySelector('#owner-room-signout');b.disabled=true;ownerVerified=false;refresh();try{await ownerAuth?.signOut();}finally{b.disabled=false;}});

// Phase 2: Gizmo is a CSS-animated character modeled on the real cat's markings, not a photograph.
const gizmo=document.querySelector('#gizmo'),gizmoSays=document.querySelector('#gizmo-says');
const gizmoLines=['Prrr... Welcome to the library.','The best stories are the ones you make yourself.','A little curiosity opens every door.','Gizmo is guarding the unfinished chapters.','A nap on a manuscript counts as editing, right?'];
let gizmoClicks=0;
gizmo?.addEventListener('click',()=>{if(!allowed)return;gizmoClicks++;gizmo.classList.remove('gizmo-petted');void gizmo.offsetWidth;gizmo.classList.add('gizmo-petted');gizmoSays.textContent=gizmoLines[(gizmoClicks-1)%gizmoLines.length];});

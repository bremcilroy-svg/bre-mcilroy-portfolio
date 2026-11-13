/* Phase 9.4: The Keeper's Guestbook — moderated Supabase messages. */
(async()=>{
'use strict';
const room=document.getElementById('room');
if(!room||document.getElementById('pv94-guestbook'))return;
const section=document.createElement('section');
section.id='pv94-guestbook';section.className='pv94';
section.innerHTML=`<header class="pv94-head"><p class="eyebrow">PHASE IX · THE LIBRARY OF LIVING SECRETS</p><h2>✒ The Keeper's Guestbook</h2><p>Every visitor leaves a little echo. Leave a note for the Keeper; it will appear here only if approved.</p></header>
<div class="pv94-grid"><div class="pv94-panel"><h3>Leave your mark</h3><form id="pv94-form"><label for="pv94-name">Name or nickname</label><input id="pv94-name" maxlength="48" required autocomplete="nickname" placeholder="A wandering reader"><label for="pv94-message">Your message</label><textarea id="pv94-message" maxlength="500" rows="5" required placeholder="What did the Vault mean to you?"></textarea><div class="pv94-honey" aria-hidden="true"><label for="pv94-website">Leave blank</label><input id="pv94-website" tabindex="-1" autocomplete="off"></div><p class="pv94-fine">Please don't share private information. Messages are reviewed before publication. Submissions may be removed.</p><button id="pv94-submit" type="submit">Seal my message ✦</button><p id="pv94-status" role="status" aria-live="polite"></p></form></div>
<div class="pv94-panel"><h3>Echoes from the Library</h3><p>Messages the Keeper has chosen to share.</p><div id="pv94-list" aria-live="polite"><p>Opening the guestbook…</p></div><button type="button" id="pv94-refresh">↻ Refresh messages</button></div></div><p class="pv94-foot">This guestbook requires its Supabase table and security policies to be installed by the site owner.</p>`;
const anchor=room.querySelector('#pv93-mirror')||room.querySelector('#pv92-shelf')||room.querySelector('#pv91-cabinet');
if(anchor)anchor.insertAdjacentElement('afterend',section);else room.append(section);
const $=s=>section.querySelector(s);
let client=null;
const feedback=(t)=>{$('#pv94-status').textContent=t};
function entry(row){
const article=document.createElement('article');article.className='pv94-entry';
const name=document.createElement('strong');name.textContent=row.display_name;
const message=document.createElement('p');message.textContent=row.message;
article.append(name,message);return article;
}
async function load(){
const list=$('#pv94-list');list.textContent='Reading approved messages…';
if(!client){list.textContent='Guestbook connection unavailable. Please try again later.';return;}
const {data,error}=await client.from('vault_guestbook').select('id,display_name,message,created_at').eq('status','approved').order('created_at',{ascending:false}).limit(30);
list.replaceChildren();
if(error){list.textContent='The guestbook is not ready yet. The owner may still need to install its database setup.';return;}
if(!data?.length){list.textContent='No approved messages yet. Be the first to leave a note!';return;}
for(const row of data)list.append(entry(row));
}
$('#pv94-form').addEventListener('submit',async e=>{
e.preventDefault();if(room.hidden||!client)return;
if($('#pv94-website').value)return;
const name=$('#pv94-name').value.trim(),message=$('#pv94-message').value.trim();
if(name.length<2||name.length>48||message.length<5||message.length>500){feedback('Please use 2–48 characters for your name and 5–500 for your message.');return;}
const b=$('#pv94-submit');b.disabled=true;feedback('Sealing your message…');
try{
const {error}=await client.from('vault_guestbook').insert({display_name:name,message});
if(error)feedback('Your message could not be submitted. The guestbook may not be configured yet.');
else{$('#pv94-form').reset();feedback('✦ Your message has been delivered for review. It will not be public unless approved.');}
}catch{feedback('Connection problem. Please try again.');}
finally{b.disabled=false;}
});
$('#pv94-refresh').addEventListener('click',()=>{if(!room.hidden)load()});
try{
const cfg=await import('./vault-owner-config.js?v=20261112-login');
if(!window.supabase?.createClient){await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.onload=resolve;s.onerror=reject;document.head.append(s)})}
client=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_PUBLISHABLE_KEY,{auth:{storageKey:'bre-poetry-vault-owner-auth-v1',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'implicit'}});
await load();
}catch{feedback('Guestbook connection unavailable.');$('#pv94-list').textContent='The guestbook could not connect.';}
})();
/* Phase 9.4 moderation dashboard — existing verified owner access required. */
import {getOwnerAuth} from './vault-owner-auth.js?v=20261112-login';
import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY} from './vault-owner-config.js?v=20261112-login';
const $=s=>document.querySelector(s);
let client,authorized=false;
function status(s){$('#pv94-admin-status').textContent=s}
function createMessage(item){
const card=document.createElement('article');card.className='pv94-admin-item';
const title=document.createElement('h3');title.textContent=item.display_name;
const msg=document.createElement('p');msg.textContent=item.message;
const date=document.createElement('small');date.textContent=new Date(item.created_at).toLocaleString();
const controls=document.createElement('div');controls.className='pv94-admin-actions';
for(const [action,label] of [['approved','Approve ✓'],['rejected','Reject ×']]){
const b=document.createElement('button');b.type='button';b.textContent=label;
b.addEventListener('click',async()=>{
if(!authorized||!client)return;b.disabled=true;status('Saving decision…');
const {error}=await client.from('vault_guestbook').update({status:action}).eq('id',item.id).eq('status','pending');
if(error){status('Could not save decision. Check owner permissions.');b.disabled=false;return;}
status('Message '+(action==='approved'?'approved.':'rejected.'));await load();
});
controls.append(b);
}
card.append(title,date,msg,controls);return card;
}
async function load(){
if(!authorized||!client)return;
const list=$('#pv94-pending');list.textContent='Loading pending messages…';
const {data,error}=await client.from('vault_guestbook').select('id,display_name,message,created_at').eq('status','pending').order('created_at',{ascending:true}).limit(100);
list.replaceChildren();
if(error){status('Cannot load messages. Install the SQL setup and check owner permissions.');return;}
if(!data?.length){list.textContent='No messages awaiting approval.';return;}
for(const item of data)list.append(createMessage(item));
status(`${data.length} pending message${data.length===1?'':'s'} (up to 100 shown).`);
}
try{
const auth=await getOwnerAuth();
auth.access.subscribe(s=>{
authorized=s.owner;
$('#pv94-admin-gate').hidden=s.owner;
$('#pv94-admin-main').hidden=!s.owner;
if(!s.owner){$('#pv94-pending').replaceChildren();status(s.message);}
});
await auth.access.refresh();
if(auth.access.state.owner){
client=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{storageKey:'bre-poetry-vault-owner-auth-v1',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'implicit'}});
await load();
}
$('#pv94-admin-refresh').addEventListener('click',load);
}catch{status('Could not verify owner access. Please sign in and try again.');}

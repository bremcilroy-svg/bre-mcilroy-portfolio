import {OWNER_EMAIL,SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,OWNER_REDIRECT} from './vault-owner-config.js?v=20261112-login';
import {createOwnerAccess} from './vault-owner-access.js?v=20261112-login';
let promise=null;
function loadSDK(){return new Promise((resolve,reject)=>{if(window.supabase?.createClient){resolve(window.supabase);return;}const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';script.referrerPolicy='no-referrer';script.onload=()=>window.supabase?.createClient?resolve(window.supabase):reject(new Error('Sign-in library unavailable'));script.onerror=()=>reject(new Error('Sign-in library could not load'));document.head.append(script);});}
export function getOwnerAuth(){if(promise)return promise;promise=(async()=>{
 const sdk=await loadSDK();const client=sdk.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{storageKey:'bre-poetry-vault-owner-auth-v1',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'implicit'}});
 const access=createOwnerAccess(client,OWNER_EMAIL);let timer;
 client.auth.onAuthStateChange((event)=>{if(event==='SIGNED_OUT'){access.revoke();return;}clearTimeout(timer);timer=setTimeout(()=>access.refresh(),0);});
 const recheck=()=>{if(!document.hidden)access.refresh();};window.addEventListener('pageshow',recheck);document.addEventListener('visibilitychange',recheck);
 // Revoke a previously checked privilege before rechecking a backgrounded session.
 document.addEventListener('visibilitychange',()=>{if(document.hidden)access.revoke('Owner access will be rechecked when you return.');});
 setInterval(recheck,60000);await access.refresh();
 return {access,async sendLink(){return client.auth.signInWithOtp({email:OWNER_EMAIL,options:{shouldCreateUser:false,emailRedirectTo:OWNER_REDIRECT}});},async signOut(){access.revoke('Signing out…');const result=await client.auth.signOut({scope:'local'});if(result.error){access.revoke('Could not finish sign-out. Please retry.');return false;}access.revoke('Signed out on this device.');return true;}};
 })().catch(error=>{promise=null;throw error;});return promise;}

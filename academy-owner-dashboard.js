import {getOwnerAuth} from './vault-owner-auth.js?v=20261112-login';
import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY} from './vault-owner-config.js?v=20261112-login';
import {readJourney} from './vault-journey.js';
const status=document.getElementById('owner-status'),panel=document.getElementById('owner-panel');
function refreshLocal(){let j;try{j=readJourney(k=>localStorage.getItem(k))}catch{}document.getElementById('local-progress').textContent=j?'This browser: '+j.completed.filter(Boolean).length+' of 4 original chapters complete. This is not an Academy-wide student count.':'This browser progress is unavailable.'}
try{const auth=await getOwnerAuth();auth.access.subscribe(s=>{panel.hidden=!s.owner;status.textContent=s.owner?'Owner identity verified. Welcome to the Headmaster’s Office.':s.message;if(s.owner){document.getElementById('account-setup').textContent='Owner authentication uses the existing configured Supabase project. Student sign-in and cloud saves are separate features and still require configuration and testing.';refreshLocal()}});await auth.access.refresh()}catch{panel.hidden=true;status.textContent='Could not verify owner access. Return to Owner Login and retry.'}

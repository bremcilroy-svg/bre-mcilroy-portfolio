import {getOwnerAuth} from './vault-owner-auth.js?v=20261112-login';
const status=document.getElementById('dev-status');
const panel=document.getElementById('dev-panel');
try{
 const auth=await getOwnerAuth();
 auth.access.subscribe(s=>{
  panel.hidden=!s.owner;
  status.textContent=s.owner?'Verified owner access. Your testing hub is available.':s.message;
 });
 await auth.access.refresh();
}catch{
 status.textContent='Could not verify owner access. Return to Owner Login and retry.';
}

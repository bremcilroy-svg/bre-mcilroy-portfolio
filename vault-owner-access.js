// Only the Auth server and the database RPC can grant owner status.
export function createOwnerAccess(client,email,now=()=>Date.now()){
 let state={owner:false,pending:false,signedIn:false,message:'Sign in to verify owner access.'},generation=0;
 const listeners=new Set();const emit=()=>listeners.forEach(fn=>fn({...state}));
 function revoke(message='Signed out.'){generation++;state={owner:false,pending:false,signedIn:false,message};emit();}
 async function refresh(){const run=++generation;state={...state,owner:false,pending:true,message:'Verifying owner access…'};emit();
 const finish=value=>{if(run!==generation)return;state={pending:false,...value};emit();};
 try{const session=await client.auth.getSession();if(session.error)throw session.error;const saved=session.data?.session;
 if(!saved){finish({owner:false,signedIn:false,message:'Sign in to verify owner access.'});return;}
 if(!Number.isFinite(saved.expires_at)||saved.expires_at*1000<=now()){finish({owner:false,signedIn:false,message:'Your session expired. Please sign in again.'});return;}
 const result=await client.auth.getUser();if(result.error)throw result.error;const user=result.data?.user;
 if(!user?.id||user.is_anonymous===true||!user.email_confirmed_at||String(user.email||'').toLowerCase()!==email.toLowerCase()){finish({owner:false,signedIn:true,message:'This account does not have owner access.'});return;}
 const check=await client.rpc('vault_is_owner');if(check.error)throw check.error;
 finish({owner:check.data===true,signedIn:true,message:check.data===true?'Owner verified. Your private entrance is ready.':'This account does not have owner access.'});
 }catch{finish({owner:false,signedIn:true,message:'Owner access could not be verified. Check your connection and the Supabase setup, then retry.'});}}
 return {refresh,revoke,get state(){return {...state};},subscribe(fn){listeners.add(fn);fn({...state});return()=>listeners.delete(fn);}};
}

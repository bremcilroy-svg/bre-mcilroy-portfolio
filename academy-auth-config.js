/* Public client settings only. Never put service_role or private keys here. */
export const SUPABASE_URL='';
export const SUPABASE_ANON_KEY='';
export const configured=()=>/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(SUPABASE_URL)&&SUPABASE_ANON_KEY.length>30;

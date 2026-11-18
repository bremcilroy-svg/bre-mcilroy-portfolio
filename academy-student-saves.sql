-- Run in the Supabase SQL editor AFTER creating your project.
-- Each signed-in student can access only their own save row.
create table if not exists public.academy_student_saves (
 user_id uuid primary key references auth.users(id) on delete cascade,
 payload jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now(),
 constraint academy_save_size check (octet_length(payload::text) <= 1000000)
);
alter table public.academy_student_saves enable row level security;
revoke all on public.academy_student_saves from anon;
grant select,insert,update,delete on public.academy_student_saves to authenticated;
create policy "Students read their own saves" on public.academy_student_saves for select to authenticated using ((select auth.uid()) = user_id);
create policy "Students insert their own saves" on public.academy_student_saves for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Students update their own saves" on public.academy_student_saves for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Students delete their own saves" on public.academy_student_saves for delete to authenticated using ((select auth.uid()) = user_id);

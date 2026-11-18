-- Apply in the same Supabase project as the existing verified owner login.
-- Requires the existing public.vault_is_owner() function to be correctly implemented and secured.
create table if not exists public.academy_publications (
 id uuid primary key default gen_random_uuid(),
 kind text not null check (kind in ('announcement','event','house','reward')),
 title text not null check (char_length(title) between 1 and 100),
 body text not null check (char_length(body) between 1 and 5000),
 published boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.academy_publications enable row level security;
revoke all on public.academy_publications from anon,authenticated;
grant select on public.academy_publications to anon,authenticated;
grant insert,update,delete on public.academy_publications to authenticated;
create policy "Read published Academy content or owner drafts" on public.academy_publications
 for select to anon,authenticated using (published = true or (select public.vault_is_owner()));
create policy "Only verified owner creates Academy content" on public.academy_publications
 for insert to authenticated with check ((select public.vault_is_owner()));
create policy "Only verified owner edits Academy content" on public.academy_publications
 for update to authenticated using ((select public.vault_is_owner())) with check ((select public.vault_is_owner()));
create policy "Only verified owner deletes Academy content" on public.academy_publications
 for delete to authenticated using ((select public.vault_is_owner()));
-- Review function grants, owner identity and RLS in SQL Editor before activating.

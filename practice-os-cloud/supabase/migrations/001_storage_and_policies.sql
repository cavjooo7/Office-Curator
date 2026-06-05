-- Run after Prisma migrations.
-- Creates storage buckets and baseline row-level security helpers.

insert into storage.buckets (id, name, public)
values ('task-documents', 'task-documents', false)
on conflict (id) do nothing;

create table if not exists public.app_user_claims (
  auth_user_id uuid primary key,
  app_user_id text not null,
  role text not null,
  staff_id text,
  created_at timestamptz default now()
);

alter table public.app_user_claims enable row level security;

drop policy if exists "users can read own claims" on public.app_user_claims;
create policy "users can read own claims"
on public.app_user_claims for select
using (auth.uid() = auth_user_id);

drop policy if exists "authenticated task documents read" on storage.objects;
create policy "authenticated task documents read"
on storage.objects for select
to authenticated
using (bucket_id = 'task-documents');

drop policy if exists "authenticated task documents upload" on storage.objects;
create policy "authenticated task documents upload"
on storage.objects for insert
to authenticated
with check (bucket_id = 'task-documents');

drop policy if exists "authenticated task documents update" on storage.objects;
create policy "authenticated task documents update"
on storage.objects for update
to authenticated
using (bucket_id = 'task-documents')
with check (bucket_id = 'task-documents');

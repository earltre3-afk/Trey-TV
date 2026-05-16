create extension if not exists pgcrypto;

create table if not exists public.prescribe_me_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id text not null,
  title text,
  selected_moods text[] default '{}',
  selected_energy text,
  selected_content_types text[] default '{}',
  selected_moment_needs text[] default '{}',
  generated_recommendations jsonb not null default '[]'::jsonb,
  top_recommendation_id text,
  match_score integer default 0,
  is_saved boolean not null default false,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint prescribe_me_sessions_user_client_unique unique (user_id, client_id)
);

alter table public.prescribe_me_sessions enable row level security;

drop policy if exists "prescribe_select_own" on public.prescribe_me_sessions;
create policy "prescribe_select_own"
  on public.prescribe_me_sessions
  for select
  using (auth.uid() = user_id);

drop policy if exists "prescribe_insert_own" on public.prescribe_me_sessions;
create policy "prescribe_insert_own"
  on public.prescribe_me_sessions
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "prescribe_update_own" on public.prescribe_me_sessions;
create policy "prescribe_update_own"
  on public.prescribe_me_sessions
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "prescribe_delete_own" on public.prescribe_me_sessions;
create policy "prescribe_delete_own"
  on public.prescribe_me_sessions
  for delete
  using (auth.uid() = user_id);

create or replace function public.set_prescribe_me_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists prescribe_me_sessions_updated_at on public.prescribe_me_sessions;
create trigger prescribe_me_sessions_updated_at
before update on public.prescribe_me_sessions
for each row
execute function public.set_prescribe_me_updated_at();

create index if not exists prescribe_me_sessions_user_created_idx
  on public.prescribe_me_sessions (user_id, created_at desc);

-- Migration to define FWD GIF source of truth schemas: fwd_gifs and fwd_user_gif_library
-- Enables Row Level Security (RLS) for privacy.

-- 1. fwd_gifs
create table if not exists public.fwd_gifs (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete set null,
  public_profile_uid text,
  title text,
  caption text,
  gif_url text not null,
  poster_url text,
  mp4_url text,
  webp_url text,
  source text not null default 'fwd',
  source_external_id text,
  storage_path text,
  width int,
  height int,
  duration_ms int,
  file_size_bytes bigint,
  is_public boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. fwd_user_gif_library
create table if not exists public.fwd_user_gif_library (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  public_profile_uid text,
  gif_id uuid not null references public.fwd_gifs(id) on delete cascade,
  library_status text not null default 'saved' check (library_status in ('saved', 'recent', 'created', 'unsaved', 'favorite')),
  last_used_at timestamptz,
  saved_at timestamptz,
  created_at timestamptz default now(),
  constraint fwd_user_gif_library_user_gif_unique unique (user_id, gif_id)
);

-- Indexes for querying and sorting performance
create index if not exists idx_fwd_gifs_owner on public.fwd_gifs(owner_user_id);
create index if not exists idx_fwd_user_gif_library_user_status on public.fwd_user_gif_library(user_id, library_status);
create index if not exists idx_fwd_user_gif_library_user_used_at on public.fwd_user_gif_library(user_id, last_used_at desc);

-- RLS Enforcement
alter table public.fwd_gifs enable row level security;
alter table public.fwd_user_gif_library enable row level security;

-- Policies for fwd_gifs
drop policy if exists "fwd_gifs_read_policy" on public.fwd_gifs;
create policy "fwd_gifs_read_policy" on public.fwd_gifs
  for select using (
    is_public = true 
    or owner_user_id = auth.uid() 
    or exists (
      select 1 from public.fwd_user_gif_library 
      where fwd_user_gif_library.gif_id = id 
        and fwd_user_gif_library.user_id = auth.uid()
    )
  );

drop policy if exists "fwd_gifs_insert_policy" on public.fwd_gifs;
create policy "fwd_gifs_insert_policy" on public.fwd_gifs
  for insert with check (auth.uid() = owner_user_id);

drop policy if exists "fwd_gifs_update_policy" on public.fwd_gifs;
create policy "fwd_gifs_update_policy" on public.fwd_gifs
  for update using (auth.uid() = owner_user_id);

drop policy if exists "fwd_gifs_delete_policy" on public.fwd_gifs;
create policy "fwd_gifs_delete_policy" on public.fwd_gifs
  for delete using (auth.uid() = owner_user_id);

-- Policies for fwd_user_gif_library
drop policy if exists "fwd_user_gif_library_read" on public.fwd_user_gif_library;
create policy "fwd_user_gif_library_read" on public.fwd_user_gif_library
  for select using (auth.uid() = user_id);

drop policy if exists "fwd_user_gif_library_insert" on public.fwd_user_gif_library;
create policy "fwd_user_gif_library_insert" on public.fwd_user_gif_library
  for insert with check (auth.uid() = user_id);

drop policy if exists "fwd_user_gif_library_update" on public.fwd_user_gif_library;
create policy "fwd_user_gif_library_update" on public.fwd_user_gif_library
  for update using (auth.uid() = user_id);

drop policy if exists "fwd_user_gif_library_delete" on public.fwd_user_gif_library;
create policy "fwd_user_gif_library_delete" on public.fwd_user_gif_library
  for delete using (auth.uid() = user_id);

-- Permissions
grant select on public.fwd_gifs to anon, authenticated;
grant insert, update, delete on public.fwd_gifs to authenticated;

grant select on public.fwd_user_gif_library to anon, authenticated;
grant insert, update, delete on public.fwd_user_gif_library to authenticated;

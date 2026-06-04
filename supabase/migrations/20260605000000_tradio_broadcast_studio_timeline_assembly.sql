-- Migration to support production-grade Episode Timeline Assembly features.
-- Creates tables for episode assemblies with advanced RLS policies and triggers.

drop table if exists public.tradio_episode_assemblies cascade;

create table public.tradio_episode_assemblies (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete cascade,
  show_id uuid references public.tradio_shows(id) on delete cascade,
  episode_id uuid references public.tradio_show_episodes(id) on delete cascade,
  assembly_status text not null default 'queued' check (assembly_status in ('queued', 'assembling', 'completed', 'failed', 'canceled')),
  assembly_type text not null default 'preview' check (assembly_type in ('preview', 'review', 'final_candidate')),
  output_audio_url text,
  output_storage_path text,
  mime_type text default 'audio/mpeg',
  duration_seconds numeric,
  sample_rate integer,
  loudness_lufs numeric,
  peak_db numeric,
  block_count integer default 0,
  source_manifest jsonb not null default '{}'::jsonb,
  render_settings jsonb not null default '{}'::jsonb,
  render_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS Requirements:
alter table public.tradio_episode_assemblies enable row level security;

-- Policies:
-- - Owners can read/create/update/delete their own assemblies.
-- - Admins/owners can read and moderate all assemblies.
-- - Public listeners should not read draft or preview assemblies.
-- - Public listeners should only access final/published episode audio through the existing public episode playback path.

create policy "tradio_episode_assemblies_select"
  on public.tradio_episode_assemblies for select
  using (
    auth.uid() = owner_user_id
    or public.is_admin(auth.uid())
    or (
      assembly_type = 'final_candidate'
      and assembly_status = 'completed'
      and exists (
        select 1 from public.tradio_show_episodes e
        where e.id = episode_id and e.status = 'published'
      )
    )
  );

create policy "tradio_episode_assemblies_insert"
  on public.tradio_episode_assemblies for insert
  with check (auth.uid() = owner_user_id);

create policy "tradio_episode_assemblies_update"
  on public.tradio_episode_assemblies for update
  using (auth.uid() = owner_user_id or public.is_admin(auth.uid()))
  with check (auth.uid() = owner_user_id or public.is_admin(auth.uid()));

create policy "tradio_episode_assemblies_delete"
  on public.tradio_episode_assemblies for delete
  using (auth.uid() = owner_user_id or public.is_admin(auth.uid()));

-- Create trigger to automatically update updated_at timestamp
drop trigger if exists trg_tradio_episode_assemblies_updated_at on public.tradio_episode_assemblies;
create trigger trg_tradio_episode_assemblies_updated_at
  before update on public.tradio_episode_assemblies
  for each row execute function public.tradio_set_updated_at();

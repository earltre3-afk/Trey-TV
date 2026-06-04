-- Update or recreate tradio_voice_renders to add Pass 3 fields
-- Drops and recreates the draft voice renders table to support the advanced provider fields, statuses, error states, and metrics.
drop table if exists public.tradio_voice_renders cascade;

create table public.tradio_voice_renders (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete cascade,
  show_id uuid references public.tradio_shows(id) on delete cascade,
  episode_id uuid references public.tradio_show_episodes(id) on delete cascade,
  block_id uuid references public.tradio_show_blocks(id) on delete cascade,
  script_id uuid references public.tradio_show_scripts(id) on delete cascade,
  station_drop_id uuid references public.tradio_station_drops(id) on delete cascade,
  ad_slot_id uuid references public.tradio_ad_slots(id) on delete cascade,
  voice_provider text not null,
  provider_voice_id text,
  provider_model text,
  voice_name text,
  script_text text not null,
  audio_url text,
  storage_path text,
  mime_type text default 'audio/mpeg',
  duration_seconds numeric,
  render_status text not null default 'queued' check (render_status in ('queued', 'rendering', 'completed', 'failed', 'canceled')),
  render_error text,
  usage_metadata jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS Requirements:
alter table public.tradio_voice_renders enable row level security;

-- Policies:
-- 1. Owners can read/create/update/delete their own voice renders.
-- 2. Admins/owners can read and moderate all voice renders.
-- 3. Public listeners should not read draft voice renders directly unless the parent episode is published and the specific render is attached to a published public block.
-- 4. Draft renders must remain private to the owner and admins/owners.

create policy "tradio_voice_renders_select"
  on public.tradio_voice_renders for select
  using (
    auth.uid() = owner_user_id
    or public.is_admin(auth.uid())
    or (
      render_status = 'completed'
      and exists (
        select 1 from public.tradio_show_episodes e
        where e.id = episode_id and e.status = 'published'
      )
    )
  );

create policy "tradio_voice_renders_insert"
  on public.tradio_voice_renders for insert
  with check (auth.uid() = owner_user_id);

create policy "tradio_voice_renders_update"
  on public.tradio_voice_renders for update
  using (auth.uid() = owner_user_id or public.is_admin(auth.uid()))
  with check (auth.uid() = owner_user_id or public.is_admin(auth.uid()));

create policy "tradio_voice_renders_delete"
  on public.tradio_voice_renders for delete
  using (auth.uid() = owner_user_id or public.is_admin(auth.uid()));

-- Create trigger to automatically update updated_at timestamp
drop trigger if exists trg_tradio_voice_renders_updated_at on public.tradio_voice_renders;
create trigger trg_tradio_voice_renders_updated_at
  before update on public.tradio_voice_renders
  for each row execute function public.tradio_set_updated_at();

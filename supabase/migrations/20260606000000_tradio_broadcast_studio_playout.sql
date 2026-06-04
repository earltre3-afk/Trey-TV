-- Migration to support production-grade Broadcast Playout & Live Scheduling features.
-- Creates tables for channels, queue, playout events, and broadcast reviews with advanced RLS.

-- Drop existing tables if they exist to start fresh and clean
drop table if exists public.tradio_broadcast_reviews cascade;
drop table if exists public.tradio_playout_events cascade;
drop table if exists public.tradio_broadcast_queue cascade;
drop table if exists public.tradio_broadcast_channels cascade;

-- 1) tradio_broadcast_channels
create table public.tradio_broadcast_channels (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  slug text unique not null,
  description text,
  channel_type text not null default 'radio' check (channel_type in ('radio', 'artist_station', 'dj_station', 'producer_station', 'talk_station', 'discovery_station', 'event_station')),
  visibility text not null default 'public' check (visibility in ('public', 'private', 'unlisted')),
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'hidden', 'archived')),
  cover_art_url text,
  mood_tags text[] not null default '{}'::text[],
  genre_tags text[] not null default '{}'::text[],
  audience_tags text[] not null default '{}'::text[],
  creator_role text,
  stream_provider text,
  stream_url text,
  hls_url text,
  icecast_mount text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) tradio_broadcast_queue
create table public.tradio_broadcast_queue (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references public.tradio_broadcast_channels(id) on delete cascade,
  show_id uuid references public.tradio_shows(id) on delete cascade,
  episode_id uuid references public.tradio_show_episodes(id) on delete cascade,
  assembly_id uuid references public.tradio_episode_assemblies(id) on delete cascade,
  owner_user_id uuid references auth.users(id) on delete cascade,
  queue_status text not null default 'draft' check (queue_status in ('draft', 'pending_review', 'approved', 'scheduled', 'playing', 'completed', 'skipped', 'failed', 'canceled', 'archived')),
  scheduled_start_at timestamptz,
  scheduled_end_at timestamptz,
  timezone text not null default 'America/Chicago',
  sort_order integer not null default 0,
  repeat_policy text,
  is_live_slot boolean not null default false,
  is_replay_eligible boolean not null default true,
  rights_snapshot jsonb not null default '{}'::jsonb,
  readiness_snapshot jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) tradio_playout_events
create table public.tradio_playout_events (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references public.tradio_broadcast_channels(id) on delete cascade,
  queue_id uuid references public.tradio_broadcast_queue(id) on delete set null,
  show_id uuid references public.tradio_shows(id) on delete set null,
  episode_id uuid references public.tradio_show_episodes(id) on delete set null,
  assembly_id uuid references public.tradio_episode_assemblies(id) on delete set null,
  event_type text not null check (event_type in ('channel_started', 'episode_started', 'episode_completed', 'episode_skipped', 'episode_failed', 'stream_connected', 'stream_disconnected', 'listener_joined', 'listener_left')),
  event_status text not null default 'started',
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  listener_count_snapshot integer not null default 0,
  playback_position_seconds numeric,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 4) tradio_broadcast_reviews
create table public.tradio_broadcast_reviews (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references public.tradio_broadcast_channels(id) on delete cascade,
  queue_id uuid references public.tradio_broadcast_queue(id) on delete cascade,
  show_id uuid references public.tradio_shows(id) on delete cascade,
  episode_id uuid references public.tradio_show_episodes(id) on delete cascade,
  assembly_id uuid references public.tradio_episode_assemblies(id) on delete cascade,
  requester_user_id uuid references auth.users(id) on delete cascade,
  reviewer_user_id uuid references auth.users(id) on delete set null,
  review_status text not null default 'pending' check (review_status in ('pending', 'approved', 'rejected', 'needs_changes', 'canceled')),
  review_notes text,
  rights_notes text,
  technical_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS on all tables
alter table public.tradio_broadcast_channels enable row level security;
alter table public.tradio_broadcast_queue enable row level security;
alter table public.tradio_playout_events enable row level security;
alter table public.tradio_broadcast_reviews enable row level security;

-- ----------------------------------------------------
-- RLS Policies for tradio_broadcast_channels
-- ----------------------------------------------------

-- Public listeners can select active public channels
create policy "tradio_broadcast_channels_public_select"
  on public.tradio_broadcast_channels for select
  using (
    status = 'active'
    and visibility = 'public'
  );

-- Creators/Owners can do anything with their own channels, and Admins can manage everything
create policy "tradio_broadcast_channels_creator_all"
  on public.tradio_broadcast_channels for all
  using (
    auth.uid() = owner_user_id
    or public.is_admin(auth.uid())
  )
  with check (
    auth.uid() = owner_user_id
    or public.is_admin(auth.uid())
  );

-- ----------------------------------------------------
-- RLS Policies for tradio_broadcast_queue
-- ----------------------------------------------------

-- Public listeners can select only playing/scheduled/completed queue items on active public channels
create policy "tradio_broadcast_queue_public_select"
  on public.tradio_broadcast_queue for select
  using (
    queue_status in ('scheduled', 'playing', 'completed')
    and exists (
      select 1 from public.tradio_broadcast_channels c
      where c.id = channel_id
      and c.status = 'active'
      and c.visibility = 'public'
    )
  );

-- Owners and Admins can manage queue items
create policy "tradio_broadcast_queue_creator_all"
  on public.tradio_broadcast_queue for all
  using (
    auth.uid() = owner_user_id
    or public.is_admin(auth.uid())
  )
  with check (
    auth.uid() = owner_user_id
    or public.is_admin(auth.uid())
  );

-- ----------------------------------------------------
-- RLS Policies for tradio_playout_events
-- ----------------------------------------------------

-- Anyone can see playout events on active public channels
create policy "tradio_playout_events_public_select"
  on public.tradio_playout_events for select
  using (
    exists (
      select 1 from public.tradio_broadcast_channels c
      where c.id = channel_id
      and c.status = 'active'
      and c.visibility = 'public'
    )
  );

-- Owners and Admins can manage/insert playout events
create policy "tradio_playout_events_creator_all"
  on public.tradio_playout_events for all
  using (
    auth.uid() = (select owner_user_id from public.tradio_broadcast_channels c where c.id = channel_id)
    or public.is_admin(auth.uid())
  )
  with check (
    auth.uid() = (select owner_user_id from public.tradio_broadcast_channels c where c.id = channel_id)
    or public.is_admin(auth.uid())
  );

-- ----------------------------------------------------
-- RLS Policies for tradio_broadcast_reviews
-- ----------------------------------------------------

-- Creators can read their own requested reviews, and Admins can read/write everything
create policy "tradio_broadcast_reviews_select"
  on public.tradio_broadcast_reviews for select
  using (
    auth.uid() = requester_user_id
    or public.is_admin(auth.uid())
  );

create policy "tradio_broadcast_reviews_insert"
  on public.tradio_broadcast_reviews for insert
  with check (
    auth.uid() = requester_user_id
  );

create policy "tradio_broadcast_reviews_update"
  on public.tradio_broadcast_reviews for update
  using (
    public.is_admin(auth.uid())
  )
  with check (
    public.is_admin(auth.uid())
  );

create policy "tradio_broadcast_reviews_delete"
  on public.tradio_broadcast_reviews for delete
  using (
    public.is_admin(auth.uid())
  );

-- ----------------------------------------------------
-- Triggers for updated_at timestamps
-- ----------------------------------------------------

-- tradio_broadcast_channels updated_at
drop trigger if exists trg_tradio_broadcast_channels_updated_at on public.tradio_broadcast_channels;
create trigger trg_tradio_broadcast_channels_updated_at
  before update on public.tradio_broadcast_channels
  for each row execute function public.tradio_set_updated_at();

-- tradio_broadcast_queue updated_at
drop trigger if exists trg_tradio_broadcast_queue_updated_at on public.tradio_broadcast_queue;
create trigger trg_tradio_broadcast_queue_updated_at
  before update on public.tradio_broadcast_queue
  for each row execute function public.tradio_set_updated_at();

-- tradio_broadcast_reviews updated_at
drop trigger if exists trg_tradio_broadcast_reviews_updated_at on public.tradio_broadcast_reviews;
create trigger trg_tradio_broadcast_reviews_updated_at
  before update on public.tradio_broadcast_reviews
  for each row execute function public.tradio_set_updated_at();

-- ----------------------------------------------------
-- Indexes for performance
-- ----------------------------------------------------
create index if not exists idx_tradio_broadcast_channels_owner on public.tradio_broadcast_channels(owner_user_id);
create index if not exists idx_tradio_broadcast_channels_status_visibility on public.tradio_broadcast_channels(status, visibility);
create index if not exists idx_tradio_broadcast_queue_channel_sort on public.tradio_broadcast_queue(channel_id, sort_order);
create index if not exists idx_tradio_broadcast_queue_times on public.tradio_broadcast_queue(scheduled_start_at, scheduled_end_at);
create index if not exists idx_tradio_playout_events_channel_created on public.tradio_playout_events(channel_id, created_at);
create index if not exists idx_tradio_broadcast_reviews_requester on public.tradio_broadcast_reviews(requester_user_id);
create index if not exists idx_tradio_broadcast_reviews_assembly on public.tradio_broadcast_reviews(assembly_id);

-- Grant privileges for execute & execution environments
grant execute on function public.is_admin(uuid) to authenticated;
grant execute on function public.is_admin(uuid) to anon;

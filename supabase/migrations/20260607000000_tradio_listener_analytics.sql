-- Migration to support production-grade Tradio Listener Pulse and Analytics features.
-- Creates tables for follows, reactions, listening sessions, retention checkpoints, and daily aggregations.

-- Tables are created without dropping existing data.

-- 1) tradio_channel_follows
create table if not exists public.tradio_channel_follows (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references public.tradio_broadcast_channels(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  notification_preference text not null default 'none' check (notification_preference in ('none', 'all', 'live_only', 'replays_only')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(channel_id, user_id)
);

-- 2) tradio_broadcast_reactions
create table if not exists public.tradio_broadcast_reactions (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references public.tradio_broadcast_channels(id) on delete cascade,
  queue_id uuid references public.tradio_broadcast_queue(id) on delete cascade,
  show_id uuid references public.tradio_shows(id) on delete set null,
  episode_id uuid references public.tradio_show_episodes(id) on delete set null,
  assembly_id uuid references public.tradio_episode_assemblies(id) on delete set null,
  user_id uuid references auth.users(id) on delete cascade,
  reaction_type text not null check (reaction_type in ('fire', 'love', 'laugh', 'rewind', 'save_this', 'hard', 'smooth', 'surprise', 'salute')),
  playback_position_seconds numeric,
  is_live boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 3) tradio_broadcast_listening_sessions
create table if not exists public.tradio_broadcast_listening_sessions (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references public.tradio_broadcast_channels(id) on delete cascade,
  queue_id uuid references public.tradio_broadcast_queue(id) on delete set null,
  show_id uuid references public.tradio_shows(id) on delete set null,
  episode_id uuid references public.tradio_show_episodes(id) on delete set null,
  assembly_id uuid references public.tradio_episode_assemblies(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  anonymous_session_id text,
  playback_mode text not null default 'live' check (playback_mode in ('live', 'replay', 'preview')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  listen_duration_seconds numeric not null default 0,
  completion_rate numeric,
  last_playback_position_seconds numeric,
  device_type text,
  app_surface text,
  referrer_surface text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4) tradio_broadcast_retention_events
create table if not exists public.tradio_broadcast_retention_events (
  id uuid primary key default gen_random_uuid(),
  listening_session_id uuid references public.tradio_broadcast_listening_sessions(id) on delete cascade,
  channel_id uuid references public.tradio_broadcast_channels(id) on delete cascade,
  queue_id uuid references public.tradio_broadcast_queue(id) on delete set null,
  episode_id uuid references public.tradio_show_episodes(id) on delete set null,
  playback_position_seconds numeric not null,
  percent_complete numeric,
  event_type text not null check (event_type in ('start', 'heartbeat', 'pause', 'resume', 'seek', 'skip', 'complete', 'exit')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 5) tradio_channel_analytics_daily
create table if not exists public.tradio_channel_analytics_daily (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references public.tradio_broadcast_channels(id) on delete cascade,
  owner_user_id uuid references auth.users(id) on delete cascade,
  analytics_date date not null,
  total_listens integer not null default 0,
  unique_listeners integer not null default 0,
  total_listen_seconds numeric not null default 0,
  avg_listen_seconds numeric not null default 0,
  completion_rate numeric,
  replay_count integer not null default 0,
  live_listen_count integer not null default 0,
  follow_count integer not null default 0,
  reaction_count integer not null default 0,
  save_count integer not null default 0,
  peak_concurrent_listeners integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(channel_id, analytics_date)
);

-- Enable RLS on all tables
alter table public.tradio_channel_follows enable row level security;
alter table public.tradio_broadcast_reactions enable row level security;
alter table public.tradio_broadcast_listening_sessions enable row level security;
alter table public.tradio_broadcast_retention_events enable row level security;
alter table public.tradio_channel_analytics_daily enable row level security;

-- ----------------------------------------------------
-- RLS Policies for tradio_channel_follows
-- ----------------------------------------------------
create policy "tradio_channel_follows_select"
  on public.tradio_channel_follows for select
  using (
    auth.uid() = user_id 
    or public.is_admin(auth.uid())
    or exists (
      select 1 from public.tradio_broadcast_channels c
      where c.id = channel_id and c.owner_user_id = auth.uid()
    )
  );

create policy "tradio_channel_follows_insert"
  on public.tradio_channel_follows for insert
  with check (auth.uid() = user_id);

create policy "tradio_channel_follows_update"
  on public.tradio_channel_follows for update
  using (auth.uid() = user_id or public.is_admin(auth.uid()))
  with check (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "tradio_channel_follows_delete"
  on public.tradio_channel_follows for delete
  using (auth.uid() = user_id or public.is_admin(auth.uid()));

-- ----------------------------------------------------
-- RLS Policies for tradio_broadcast_reactions
-- ----------------------------------------------------
create policy "tradio_broadcast_reactions_select"
  on public.tradio_broadcast_reactions for select
  using (
    auth.uid() = user_id
    or public.is_admin(auth.uid())
    or exists (
      select 1 from public.tradio_broadcast_channels c
      where c.id = channel_id 
      and (c.status = 'active' and c.visibility = 'public')
    )
  );

create policy "tradio_broadcast_reactions_insert"
  on public.tradio_broadcast_reactions for insert
  with check (auth.uid() = user_id);

-- ----------------------------------------------------
-- RLS Policies for tradio_broadcast_listening_sessions
-- ----------------------------------------------------
create policy "tradio_broadcast_listening_sessions_select"
  on public.tradio_broadcast_listening_sessions for select
  using (
    auth.uid() = user_id
    or public.is_admin(auth.uid())
    or exists (
      select 1 from public.tradio_broadcast_channels c
      where c.id = channel_id and c.owner_user_id = auth.uid()
    )
  );

create policy "tradio_broadcast_listening_sessions_insert"
  on public.tradio_broadcast_listening_sessions for insert
  with check (auth.uid() = user_id);

create policy "tradio_broadcast_listening_sessions_update"
  on public.tradio_broadcast_listening_sessions for update
  using (auth.uid() = user_id or public.is_admin(auth.uid()))
  with check (auth.uid() = user_id or public.is_admin(auth.uid()));

-- ----------------------------------------------------
-- RLS Policies for tradio_broadcast_retention_events
-- ----------------------------------------------------
create policy "tradio_broadcast_retention_events_select"
  on public.tradio_broadcast_retention_events for select
  using (
    public.is_admin(auth.uid())
    or exists (
      select 1 from public.tradio_broadcast_listening_sessions s
      where s.id = listening_session_id and s.user_id = auth.uid()
    )
  );

create policy "tradio_broadcast_retention_events_insert"
  on public.tradio_broadcast_retention_events for insert
  with check (
    public.is_admin(auth.uid())
    or exists (
      select 1 from public.tradio_broadcast_listening_sessions s
      where s.id = listening_session_id and s.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------
-- RLS Policies for tradio_channel_analytics_daily
-- ----------------------------------------------------
create policy "tradio_channel_analytics_daily_select"
  on public.tradio_channel_analytics_daily for select
  using (
    auth.uid() = owner_user_id
    or public.is_admin(auth.uid())
    or exists (
      select 1 from public.tradio_broadcast_channels c
      where c.id = channel_id and c.status = 'active' and c.visibility = 'public'
    )
  );

-- ----------------------------------------------------
-- Triggers for updated_at timestamps
-- ----------------------------------------------------
drop trigger if exists trg_tradio_channel_follows_updated_at on public.tradio_channel_follows;
create trigger trg_tradio_channel_follows_updated_at
  before update on public.tradio_channel_follows
  for each row execute function public.tradio_set_updated_at();

drop trigger if exists trg_tradio_broadcast_listening_sessions_updated_at on public.tradio_broadcast_listening_sessions;
create trigger trg_tradio_broadcast_listening_sessions_updated_at
  before update on public.tradio_broadcast_listening_sessions
  for each row execute function public.tradio_set_updated_at();

drop trigger if exists trg_tradio_channel_analytics_daily_updated_at on public.tradio_channel_analytics_daily;
create trigger trg_tradio_channel_analytics_daily_updated_at
  before update on public.tradio_channel_analytics_daily
  for each row execute function public.tradio_set_updated_at();

-- ----------------------------------------------------
-- Indexes for performance
-- ----------------------------------------------------
create index if not exists idx_tradio_channel_follows_user on public.tradio_channel_follows(user_id);
create index if not exists idx_tradio_broadcast_reactions_channel on public.tradio_broadcast_reactions(channel_id, reaction_type);
create index if not exists idx_tradio_broadcast_listening_sessions_channel on public.tradio_broadcast_listening_sessions(channel_id, started_at);
create index if not exists idx_tradio_broadcast_retention_events_session on public.tradio_broadcast_retention_events(listening_session_id);
create index if not exists idx_tradio_channel_analytics_daily_date on public.tradio_channel_analytics_daily(analytics_date);

-- Migration to support production-grade Tradio Live Mic and Host Co-Host Call-Ins.
-- Creates tables for sessions, participants, call requests, sfx drops, sfx events, and mic events.

-- 1) tradio_live_mic_sessions
create table if not exists public.tradio_live_mic_sessions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.tradio_live_rooms(id) on delete cascade,
  channel_id uuid references public.tradio_broadcast_channels(id) on delete cascade,
  queue_id uuid references public.tradio_broadcast_queue(id) on delete set null,
  show_id uuid references public.tradio_shows(id) on delete set null,
  episode_id uuid references public.tradio_show_episodes(id) on delete set null,
  host_user_id uuid references auth.users(id) on delete cascade,
  session_status text not null default 'pending' check (session_status in ('pending', 'live', 'paused', 'ended', 'failed', 'archived')),
  provider text not null default 'livekit',
  provider_room_name text,
  provider_session_id text,
  mic_mode text not null default 'host_only' check (mic_mode in ('host_only', 'host_plus_cohost', 'call_in_queue', 'open_stage_locked')),
  background_audio_mode text not null default 'duck_on_host' check (background_audio_mode in ('duck_on_host', 'pause_on_host', 'keep_full_volume', 'host_between_blocks')),
  recording_enabled boolean not null default false,
  max_speakers integer not null default 4,
  max_callers_waiting integer not null default 25,
  metadata jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) tradio_live_mic_participants
create table if not exists public.tradio_live_mic_participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.tradio_live_mic_sessions(id) on delete cascade,
  room_id uuid references public.tradio_live_rooms(id) on delete cascade,
  channel_id uuid references public.tradio_broadcast_channels(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  anonymous_session_id text,
  participant_role text not null default 'listener' check (participant_role in ('host', 'cohost', 'caller', 'listener', 'moderator', 'admin')),
  participant_status text not null default 'waiting' check (participant_status in ('waiting', 'invited', 'approved', 'live', 'muted', 'removed', 'declined', 'left')),
  provider_participant_id text,
  display_name text,
  mic_enabled boolean not null default false,
  is_muted_by_host boolean not null default false,
  is_muted_self boolean not null default true,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) tradio_live_call_requests
create table if not exists public.tradio_live_call_requests (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.tradio_live_mic_sessions(id) on delete cascade,
  room_id uuid references public.tradio_live_rooms(id) on delete cascade,
  channel_id uuid references public.tradio_broadcast_channels(id) on delete cascade,
  queue_id uuid references public.tradio_broadcast_queue(id) on delete set null,
  requester_user_id uuid references auth.users(id) on delete set null,
  anonymous_session_id text,
  request_status text not null default 'pending' check (request_status in ('pending', 'approved', 'rejected', 'canceled', 'expired', 'completed')),
  request_note text,
  host_decision_user_id uuid references auth.users(id) on delete set null,
  decision_reason text,
  playback_position_seconds numeric,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4) tradio_live_sfx_drops
create table if not exists public.tradio_live_sfx_drops (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete cascade,
  channel_id uuid references public.tradio_broadcast_channels(id) on delete cascade,
  room_id uuid references public.tradio_live_rooms(id) on delete set null,
  title text not null,
  audio_url text,
  storage_path text,
  sfx_type text not null default 'drop' check (sfx_type in ('drop', 'applause', 'airhorn', 'riser', 'impact', 'tag', 'transition', 'custom')),
  visibility text not null default 'private' check (visibility in ('public', 'private', 'shared')),
  duration_seconds numeric,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5) tradio_live_sfx_events
create table if not exists public.tradio_live_sfx_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.tradio_live_mic_sessions(id) on delete cascade,
  room_id uuid references public.tradio_live_rooms(id) on delete cascade,
  channel_id uuid references public.tradio_broadcast_channels(id) on delete cascade,
  sfx_drop_id uuid references public.tradio_live_sfx_drops(id) on delete set null,
  triggered_by_user_id uuid references auth.users(id) on delete set null,
  playback_position_seconds numeric,
  event_status text not null default 'triggered' check (event_status in ('triggered', 'played', 'failed', 'canceled')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 6) tradio_live_mic_events
create table if not exists public.tradio_live_mic_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.tradio_live_mic_sessions(id) on delete cascade,
  room_id uuid references public.tradio_live_rooms(id) on delete cascade,
  channel_id uuid references public.tradio_broadcast_channels(id) on delete cascade,
  participant_id uuid references public.tradio_live_mic_participants(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null check (event_type in ('session_started', 'session_paused', 'session_resumed', 'session_ended', 'host_joined', 'cohost_invited', 'cohost_joined', 'caller_requested', 'caller_approved', 'caller_rejected', 'caller_joined', 'participant_muted', 'participant_unmuted', 'participant_removed', 'sfx_triggered', 'provider_error')),
  event_status text not null default 'recorded' check (event_status in ('recorded', 'processed', 'failed')),
  playback_position_seconds numeric,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Enable RLS on all tables
alter table public.tradio_live_mic_sessions enable row level security;
alter table public.tradio_live_mic_participants enable row level security;
alter table public.tradio_live_call_requests enable row level security;
alter table public.tradio_live_sfx_drops enable row level security;
alter table public.tradio_live_sfx_events enable row level security;
alter table public.tradio_live_mic_events enable row level security;

-- ----------------------------------------------------
-- RLS Policies for tradio_live_mic_sessions
-- ----------------------------------------------------
create policy "tradio_live_mic_sessions_select"
  on public.tradio_live_mic_sessions for select
  using (
    host_user_id = auth.uid()
    or public.is_admin(auth.uid())
    or exists (
      select 1 from public.tradio_live_rooms r
      where r.id = room_id
      and r.visibility = 'public'
    )
  );

create policy "tradio_live_mic_sessions_manage"
  on public.tradio_live_mic_sessions for all
  using (
    host_user_id = auth.uid()
    or public.is_admin(auth.uid())
    or exists (
      select 1 from public.tradio_live_rooms r
      where r.id = room_id
      and (r.owner_user_id = auth.uid() or exists (
        select 1 from public.tradio_broadcast_channels c
        where c.id = r.channel_id
        and c.owner_user_id = auth.uid()
      ))
    )
  );

-- ----------------------------------------------------
-- RLS Policies for tradio_live_mic_participants
-- ----------------------------------------------------
create policy "tradio_live_mic_participants_select"
  on public.tradio_live_mic_participants for select
  using (
    user_id = auth.uid()
    or public.is_admin(auth.uid())
    or exists (
      select 1 from public.tradio_live_mic_sessions s
      where s.id = session_id
      and s.host_user_id = auth.uid()
    )
    or exists (
      select 1 from public.tradio_live_rooms r
      where r.id = room_id
      and r.visibility = 'public'
    )
  );

create policy "tradio_live_mic_participants_insert"
  on public.tradio_live_mic_participants for insert
  with check (
    (auth.uid() = user_id or (auth.uid() is null and user_id is null))
    and exists (
      select 1 from public.tradio_live_mic_sessions s
      where s.id = session_id
      and s.session_status = 'live'
    )
  );

create policy "tradio_live_mic_participants_manage"
  on public.tradio_live_mic_participants for all
  using (
    user_id = auth.uid()
    or public.is_admin(auth.uid())
    or exists (
      select 1 from public.tradio_live_mic_sessions s
      where s.id = session_id
      and s.host_user_id = auth.uid()
    )
  );

-- ----------------------------------------------------
-- RLS Policies for tradio_live_call_requests
-- ----------------------------------------------------
create policy "tradio_live_call_requests_select"
  on public.tradio_live_call_requests for select
  using (
    requester_user_id = auth.uid()
    or public.is_admin(auth.uid())
    or exists (
      select 1 from public.tradio_live_mic_sessions s
      where s.id = session_id
      and s.host_user_id = auth.uid()
    )
  );

create policy "tradio_live_call_requests_insert"
  on public.tradio_live_call_requests for insert
  with check (
    (
      (auth.uid() = requester_user_id and auth.uid() is not null)
      or 
      (auth.uid() is null and requester_user_id is null and anonymous_session_id is not null)
    )
    and exists (
      select 1 from public.tradio_live_mic_sessions s
      where s.id = session_id
      and s.session_status = 'live'
      and s.mic_mode = 'call_in_queue'
    )
  );

create policy "tradio_live_call_requests_manage"
  on public.tradio_live_call_requests for all
  using (
    requester_user_id = auth.uid()
    or public.is_admin(auth.uid())
    or exists (
      select 1 from public.tradio_live_mic_sessions s
      where s.id = session_id
      and s.host_user_id = auth.uid()
    )
  );

-- ----------------------------------------------------
-- RLS Policies for tradio_live_sfx_drops
-- ----------------------------------------------------
create policy "tradio_live_sfx_drops_select"
  on public.tradio_live_sfx_drops for select
  using (
    owner_user_id = auth.uid()
    or visibility = 'public'
    or visibility = 'shared'
    or public.is_admin(auth.uid())
  );

create policy "tradio_live_sfx_drops_manage"
  on public.tradio_live_sfx_drops for all
  using (
    owner_user_id = auth.uid()
    or public.is_admin(auth.uid())
  );

-- ----------------------------------------------------
-- RLS Policies for tradio_live_sfx_events
-- ----------------------------------------------------
create policy "tradio_live_sfx_events_select"
  on public.tradio_live_sfx_events for select
  using (
    triggered_by_user_id = auth.uid()
    or public.is_admin(auth.uid())
    or exists (
      select 1 from public.tradio_live_mic_sessions s
      where s.id = session_id
      and s.host_user_id = auth.uid()
    )
  );

create policy "tradio_live_sfx_events_insert"
  on public.tradio_live_sfx_events for insert
  with check (
    triggered_by_user_id = auth.uid()
    or public.is_admin(auth.uid())
    or exists (
      select 1 from public.tradio_live_mic_sessions s
      where s.id = session_id
      and s.host_user_id = auth.uid()
    )
  );

-- ----------------------------------------------------
-- RLS Policies for tradio_live_mic_events
-- ----------------------------------------------------
create policy "tradio_live_mic_events_select"
  on public.tradio_live_mic_events for select
  using (
    user_id = auth.uid()
    or public.is_admin(auth.uid())
    or exists (
      select 1 from public.tradio_live_mic_sessions s
      where s.id = session_id
      and s.host_user_id = auth.uid()
    )
  );

create policy "tradio_live_mic_events_insert"
  on public.tradio_live_mic_events for insert
  with check (
    user_id = auth.uid()
    or public.is_admin(auth.uid())
    or exists (
      select 1 from public.tradio_live_mic_sessions s
      where s.id = session_id
      and s.host_user_id = auth.uid()
    )
  );

-- ----------------------------------------------------
-- Performance Indexes for Pass 8 Tables
-- ----------------------------------------------------
create index if not exists tradio_live_mic_sessions_room_idx on public.tradio_live_mic_sessions (room_id);
create index if not exists tradio_live_mic_sessions_channel_idx on public.tradio_live_mic_sessions (channel_id);
create index if not exists tradio_live_mic_sessions_status_idx on public.tradio_live_mic_sessions (session_status);

create index if not exists tradio_live_mic_participants_session_idx on public.tradio_live_mic_participants (session_id);
create index if not exists tradio_live_mic_participants_user_idx on public.tradio_live_mic_participants (user_id);
create index if not exists tradio_live_mic_participants_role_status_idx on public.tradio_live_mic_participants (participant_role, participant_status);

create index if not exists tradio_live_call_requests_session_idx on public.tradio_live_call_requests (session_id);
create index if not exists tradio_live_call_requests_requester_idx on public.tradio_live_call_requests (requester_user_id);
create index if not exists tradio_live_call_requests_status_idx on public.tradio_live_call_requests (request_status);

create index if not exists tradio_live_sfx_drops_owner_idx on public.tradio_live_sfx_drops (owner_user_id);
create index if not exists tradio_live_sfx_drops_visibility_idx on public.tradio_live_sfx_drops (visibility);

create index if not exists tradio_live_sfx_events_session_idx on public.tradio_live_sfx_events (session_id);
create index if not exists tradio_live_mic_events_session_idx on public.tradio_live_mic_events (session_id);

-- ----------------------------------------------------
-- Triggers for updated_at fields
-- ----------------------------------------------------
drop trigger if exists tradio_set_updated_at_mic_sessions on public.tradio_live_mic_sessions;
create trigger tradio_set_updated_at_mic_sessions
  before update on public.tradio_live_mic_sessions
  for each row execute function public.tradio_set_updated_at();

drop trigger if exists tradio_set_updated_at_mic_participants on public.tradio_live_mic_participants;
create trigger tradio_set_updated_at_mic_participants
  before update on public.tradio_live_mic_participants
  for each row execute function public.tradio_set_updated_at();

drop trigger if exists tradio_set_updated_at_call_requests on public.tradio_live_call_requests;
create trigger tradio_set_updated_at_call_requests
  before update on public.tradio_live_call_requests
  for each row execute function public.tradio_set_updated_at();

drop trigger if exists tradio_set_updated_at_sfx_drops on public.tradio_live_sfx_drops;
create trigger tradio_set_updated_at_sfx_drops
  before update on public.tradio_live_sfx_drops
  for each row execute function public.tradio_set_updated_at();

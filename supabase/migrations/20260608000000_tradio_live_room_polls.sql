-- Migration to support production-grade Tradio Live Room and Polls features.
-- Creates tables for live rooms, live chat messages, live polls, options, votes, and moderation reports.

-- 1) tradio_live_rooms
create table if not exists public.tradio_live_rooms (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references public.tradio_broadcast_channels(id) on delete cascade,
  queue_id uuid references public.tradio_broadcast_queue(id) on delete set null,
  show_id uuid references public.tradio_shows(id) on delete set null,
  episode_id uuid references public.tradio_show_episodes(id) on delete set null,
  owner_user_id uuid references auth.users(id) on delete cascade,
  room_status text not null default 'open' check (room_status in ('open', 'paused', 'locked', 'ended', 'archived')),
  visibility text not null default 'public' check (visibility in ('public', 'private', 'unlisted')),
  title text,
  pinned_message_id uuid, -- Reference to tradio_live_chat_messages(id) will be conceptual or verified client-side to avoid mutual cascade lockouts
  slow_mode_seconds integer not null default 5,
  chat_enabled boolean not null default true,
  polls_enabled boolean not null default true,
  reactions_enabled boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) tradio_live_chat_messages
create table if not exists public.tradio_live_chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.tradio_live_rooms(id) on delete cascade,
  channel_id uuid references public.tradio_broadcast_channels(id) on delete cascade,
  queue_id uuid references public.tradio_broadcast_queue(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  anonymous_session_id text,
  sender_role text not null default 'listener' check (sender_role in ('listener', 'creator', 'host', 'admin', 'system')),
  message_text text not null,
  message_type text not null default 'chat' check (message_type in ('chat', 'shoutout', 'host_note', 'system', 'moderation_notice')),
  playback_position_seconds numeric,
  is_pinned boolean not null default false,
  is_highlighted boolean not null default false,
  moderation_status text not null default 'visible' check (moderation_status in ('visible', 'hidden', 'flagged', 'removed', 'pending_review')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) tradio_live_polls
create table if not exists public.tradio_live_polls (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.tradio_live_rooms(id) on delete cascade,
  channel_id uuid references public.tradio_broadcast_channels(id) on delete cascade,
  queue_id uuid references public.tradio_broadcast_queue(id) on delete set null,
  creator_user_id uuid references auth.users(id) on delete cascade,
  question text not null,
  poll_status text not null default 'draft' check (poll_status in ('draft', 'active', 'closed', 'hidden', 'archived')),
  allow_multiple boolean not null default false,
  show_results_mode text not null default 'after_vote' check (show_results_mode in ('always', 'after_vote', 'after_close', 'never')),
  opens_at timestamptz,
  closes_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4) tradio_live_poll_options
create table if not exists public.tradio_live_poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid references public.tradio_live_polls(id) on delete cascade,
  option_text text not null,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 5) tradio_live_poll_votes
create table if not exists public.tradio_live_poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid references public.tradio_live_polls(id) on delete cascade,
  option_id uuid references public.tradio_live_poll_options(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  anonymous_session_id text,
  room_id uuid references public.tradio_live_rooms(id) on delete cascade,
  channel_id uuid references public.tradio_broadcast_channels(id) on delete cascade,
  queue_id uuid references public.tradio_broadcast_queue(id) on delete set null,
  playback_position_seconds numeric,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 6) tradio_live_moderation_reports
create table if not exists public.tradio_live_moderation_reports (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.tradio_live_rooms(id) on delete cascade,
  message_id uuid references public.tradio_live_chat_messages(id) on delete set null,
  reported_user_id uuid references auth.users(id) on delete set null,
  reporter_user_id uuid references auth.users(id) on delete set null,
  anonymous_session_id text,
  reason text not null,
  report_status text not null default 'pending' check (report_status in ('pending', 'reviewed', 'dismissed', 'action_taken')),
  moderator_user_id uuid references auth.users(id) on delete set null,
  moderation_notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS on all tables
alter table public.tradio_live_rooms enable row level security;
alter table public.tradio_live_chat_messages enable row level security;
alter table public.tradio_live_polls enable row level security;
alter table public.tradio_live_poll_options enable row level security;
alter table public.tradio_live_poll_votes enable row level security;
alter table public.tradio_live_moderation_reports enable row level security;

-- ----------------------------------------------------
-- RLS Policies for tradio_live_rooms
-- ----------------------------------------------------
create policy "tradio_live_rooms_select"
  on public.tradio_live_rooms for select
  using (
    owner_user_id = auth.uid()
    or public.is_admin(auth.uid())
    or exists (
      select 1 from public.tradio_broadcast_channels c
      where c.id = channel_id
      and c.status = 'active'
      and c.visibility = 'public'
    )
  );

create policy "tradio_live_rooms_insert"
  on public.tradio_live_rooms for insert
  with check (
    auth.uid() = owner_user_id
    or public.is_admin(auth.uid())
  );

create policy "tradio_live_rooms_update"
  on public.tradio_live_rooms for update
  using (
    auth.uid() = owner_user_id
    or public.is_admin(auth.uid())
  )
  with check (
    auth.uid() = owner_user_id
    or public.is_admin(auth.uid())
  );

create policy "tradio_live_rooms_delete"
  on public.tradio_live_rooms for delete
  using (
    auth.uid() = owner_user_id
    or public.is_admin(auth.uid())
  );

-- ----------------------------------------------------
-- RLS Policies for tradio_live_chat_messages
-- ----------------------------------------------------
create policy "tradio_live_chat_messages_select"
  on public.tradio_live_chat_messages for select
  using (
    user_id = auth.uid()
    or public.is_admin(auth.uid())
    or (
      moderation_status = 'visible'
      and exists (
        select 1 from public.tradio_live_rooms r
        where r.id = room_id
        and r.visibility = 'public'
        and exists (
          select 1 from public.tradio_broadcast_channels c
          where c.id = r.channel_id
          and c.status = 'active'
          and c.visibility = 'public'
        )
      )
    )
  );

create policy "tradio_live_chat_messages_insert"
  on public.tradio_live_chat_messages for insert
  with check (
    (auth.uid() = user_id or (auth.uid() is null and user_id is null))
    and exists (
      select 1 from public.tradio_live_rooms r
      where r.id = room_id
      and r.room_status = 'open'
      and r.chat_enabled = true
    )
  );

create policy "tradio_live_chat_messages_update"
  on public.tradio_live_chat_messages for update
  using (
    public.is_admin(auth.uid())
    or exists (
      select 1 from public.tradio_live_rooms r
      where r.id = room_id
      and r.owner_user_id = auth.uid()
    )
  )
  with check (
    public.is_admin(auth.uid())
    or exists (
      select 1 from public.tradio_live_rooms r
      where r.id = room_id
      and r.owner_user_id = auth.uid()
    )
  );

create policy "tradio_live_chat_messages_delete"
  on public.tradio_live_chat_messages for delete
  using (
    public.is_admin(auth.uid())
    or exists (
      select 1 from public.tradio_live_rooms r
      where r.id = room_id
      and r.owner_user_id = auth.uid()
    )
  );

-- ----------------------------------------------------
-- RLS Policies for tradio_live_polls
-- ----------------------------------------------------
create policy "tradio_live_polls_select"
  on public.tradio_live_polls for select
  using (
    creator_user_id = auth.uid()
    or public.is_admin(auth.uid())
    or (
      poll_status != 'draft'
      and exists (
        select 1 from public.tradio_live_rooms r
        where r.id = room_id
        and exists (
          select 1 from public.tradio_broadcast_channels c
          where c.id = r.channel_id
          and c.status = 'active'
          and c.visibility = 'public'
        )
      )
    )
  );

create policy "tradio_live_polls_insert"
  on public.tradio_live_polls for insert
  with check (
    auth.uid() = creator_user_id
    or public.is_admin(auth.uid())
  );

create policy "tradio_live_polls_update"
  on public.tradio_live_polls for update
  using (
    auth.uid() = creator_user_id
    or public.is_admin(auth.uid())
  )
  with check (
    auth.uid() = creator_user_id
    or public.is_admin(auth.uid())
  );

create policy "tradio_live_polls_delete"
  on public.tradio_live_polls for delete
  using (
    auth.uid() = creator_user_id
    or public.is_admin(auth.uid())
  );

-- ----------------------------------------------------
-- RLS Policies for tradio_live_poll_options
-- ----------------------------------------------------
create policy "tradio_live_poll_options_select"
  on public.tradio_live_poll_options for select
  using (
    exists (
      select 1 from public.tradio_live_polls p
      where p.id = poll_id
    )
  );

create policy "tradio_live_poll_options_all"
  on public.tradio_live_poll_options for all
  using (
    exists (
      select 1 from public.tradio_live_polls p
      where p.id = poll_id
      and (p.creator_user_id = auth.uid() or public.is_admin(auth.uid()))
    )
  );

-- ----------------------------------------------------
-- RLS Policies for tradio_live_poll_votes
-- ----------------------------------------------------
create policy "tradio_live_poll_votes_select"
  on public.tradio_live_poll_votes for select
  using (
    user_id = auth.uid()
    or public.is_admin(auth.uid())
    or exists (
      select 1 from public.tradio_live_rooms r
      where r.id = room_id
      and r.owner_user_id = auth.uid()
    )
  );

create policy "tradio_live_poll_votes_insert"
  on public.tradio_live_poll_votes for insert
  with check (
    (auth.uid() = user_id or (auth.uid() is null and user_id is null))
    and exists (
      select 1 from public.tradio_live_polls p
      where p.id = poll_id
      and p.poll_status = 'active'
      and exists (
        select 1 from public.tradio_live_rooms r
        where r.id = p.room_id
        and r.polls_enabled = true
      )
    )
  );

-- Unique index to prevent duplicate voting on the same option by the same user or anonymous session
create unique index if not exists tradio_live_poll_votes_user_uniq_idx 
  on public.tradio_live_poll_votes (poll_id, option_id, user_id) 
  where user_id is not null;

create unique index if not exists tradio_live_poll_votes_anon_uniq_idx 
  on public.tradio_live_poll_votes (poll_id, option_id, anonymous_session_id) 
  where anonymous_session_id is not null;

-- ----------------------------------------------------
-- RLS Policies for tradio_live_moderation_reports
-- ----------------------------------------------------
create policy "tradio_live_moderation_reports_select"
  on public.tradio_live_moderation_reports for select
  using (
    reporter_user_id = auth.uid()
    or public.is_admin(auth.uid())
    or exists (
      select 1 from public.tradio_live_rooms r
      where r.id = room_id
      and r.owner_user_id = auth.uid()
    )
  );

create policy "tradio_live_moderation_reports_insert"
  on public.tradio_live_moderation_reports for insert
  with check (
    (auth.uid() = reporter_user_id or (auth.uid() is null and reporter_user_id is null))
  );

create policy "tradio_live_moderation_reports_update"
  on public.tradio_live_moderation_reports for update
  using (
    public.is_admin(auth.uid())
    or exists (
      select 1 from public.tradio_live_rooms r
      where r.id = room_id
      and r.owner_user_id = auth.uid()
    )
  )
  with check (
    public.is_admin(auth.uid())
    or exists (
      select 1 from public.tradio_live_rooms r
      where r.id = room_id
      and r.owner_user_id = auth.uid()
    )
  );

-- ----------------------------------------------------
-- Triggers for updated_at fields
-- ----------------------------------------------------
drop trigger if exists tradio_set_updated_at_live_rooms on public.tradio_live_rooms;
create trigger tradio_set_updated_at_live_rooms
  before update on public.tradio_live_rooms
  for each row execute function public.tradio_set_updated_at();

drop trigger if exists tradio_set_updated_at_live_chat_messages on public.tradio_live_chat_messages;
create trigger tradio_set_updated_at_live_chat_messages
  before update on public.tradio_live_chat_messages
  for each row execute function public.tradio_set_updated_at();

drop trigger if exists tradio_set_updated_at_live_polls on public.tradio_live_polls;
create trigger tradio_set_updated_at_live_polls
  before update on public.tradio_live_polls
  for each row execute function public.tradio_set_updated_at();

drop trigger if exists tradio_set_updated_at_live_moderation_reports on public.tradio_live_moderation_reports;
create trigger tradio_set_updated_at_live_moderation_reports
  before update on public.tradio_live_moderation_reports
  for each row execute function public.tradio_set_updated_at();

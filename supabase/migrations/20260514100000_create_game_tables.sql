-- Trey TV Games: all tables for rooms, sessions, queue, friends, requests

create table if not exists public.game_rooms (
  id                uuid primary key default gen_random_uuid(),
  room_code         text not null unique,
  game_type         text not null check (game_type in ('spades', 'blackjack', 'bullshit')),
  status            text not null default 'waiting' check (status in ('waiting', 'active', 'ended', 'abandoned')),
  host_user_id      text not null,
  host_display_name text not null,
  max_players       integer not null default 4,
  current_players   integer not null default 1,
  is_private        boolean not null default false,
  target_score      integer not null default 500,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  last_activity_at  timestamptz not null default now()
);

create table if not exists public.game_room_players (
  id             uuid primary key default gen_random_uuid(),
  room_id        uuid not null references public.game_rooms(id) on delete cascade,
  user_id        text not null,
  display_name   text not null,
  seat_index     integer not null,
  team_index     integer,
  is_bot         boolean not null default false,
  is_ready       boolean not null default false,
  is_connected   boolean not null default true,
  is_host        boolean not null default false,
  joined_at      timestamptz not null default now(),
  last_seen_at   timestamptz not null default now(),
  unique (room_id, seat_index)
);

create table if not exists public.game_sessions (
  id                uuid primary key default gen_random_uuid(),
  room_id           uuid not null references public.game_rooms(id) on delete cascade,
  game_type         text not null check (game_type in ('spades', 'blackjack', 'bullshit')),
  status            text not null default 'active' check (status in ('active', 'ended')),
  current_turn_seat integer,
  round_number      integer not null default 1,
  phase             text,
  state_json        jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists public.game_moves (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid not null references public.game_sessions(id) on delete cascade,
  player_id    text not null,
  seat_index   integer not null,
  move_type    text not null,
  move_payload jsonb,
  move_number  integer not null,
  created_at   timestamptz not null default now()
);

create table if not exists public.game_queue_entries (
  id              uuid primary key default gen_random_uuid(),
  user_id         text not null,
  display_name    text not null,
  game_type       text not null check (game_type in ('spades', 'blackjack', 'bullshit')),
  mode            text not null default 'public' check (mode in ('public', 'friends', 'solo')),
  status          text not null default 'searching' check (status in ('searching', 'matched', 'cancelled')),
  matched_room_id uuid references public.game_rooms(id) on delete set null,
  party_id        text,
  enqueued_at     timestamptz not null default now(),
  last_seen_at    timestamptz not null default now(),
  matched_at      timestamptz
);

create table if not exists public.game_friends (
  id                   uuid primary key default gen_random_uuid(),
  user_id              text not null,
  friend_user_id       text not null,
  friend_display_name  text not null,
  created_at           timestamptz not null default now(),
  unique (user_id, friend_user_id)
);

create table if not exists public.game_requests (
  id                  uuid primary key default gen_random_uuid(),
  from_user_id        text not null,
  from_display_name   text not null,
  to_user_id          text not null,
  to_display_name     text,
  game_type           text not null check (game_type in ('spades', 'blackjack', 'bullshit')),
  room_id             uuid references public.game_rooms(id) on delete set null,
  room_code           text,
  message             text,
  status              text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'expired', 'cancelled')),
  created_at          timestamptz not null default now(),
  responded_at        timestamptz,
  expires_at          timestamptz not null default (now() + interval '24 hours')
);

-- Indexes for common query patterns
create index if not exists idx_game_rooms_status        on public.game_rooms(status);
create index if not exists idx_game_rooms_code          on public.game_rooms(room_code);
create index if not exists idx_grp_room_id              on public.game_room_players(room_id);
create index if not exists idx_grp_user_id              on public.game_room_players(user_id);
create index if not exists idx_game_sessions_room       on public.game_sessions(room_id);
create index if not exists idx_game_moves_session       on public.game_moves(session_id);
create index if not exists idx_queue_user_status        on public.game_queue_entries(user_id, status);
create index if not exists idx_queue_game_status        on public.game_queue_entries(game_type, status);
create index if not exists idx_requests_to_user         on public.game_requests(to_user_id, status);

-- RLS: game tables use custom user IDs (guest-compatible), not Supabase auth
-- Allow all operations — auth enforcement is handled at the app layer
alter table public.game_rooms           enable row level security;
alter table public.game_room_players    enable row level security;
alter table public.game_sessions        enable row level security;
alter table public.game_moves           enable row level security;
alter table public.game_queue_entries   enable row level security;
alter table public.game_friends         enable row level security;
alter table public.game_requests        enable row level security;

create policy "game_rooms_open"         on public.game_rooms           for all using (true) with check (true);
create policy "game_room_players_open"  on public.game_room_players    for all using (true) with check (true);
create policy "game_sessions_open"      on public.game_sessions        for all using (true) with check (true);
create policy "game_moves_open"         on public.game_moves           for all using (true) with check (true);
create policy "game_queue_entries_open" on public.game_queue_entries   for all using (true) with check (true);
create policy "game_friends_open"       on public.game_friends         for all using (true) with check (true);
create policy "game_requests_open"      on public.game_requests        for all using (true) with check (true);

-- Grant PostgREST access (anon role must have table-level grants for schema cache)
grant all on public.game_rooms           to anon, authenticated, service_role;
grant all on public.game_room_players    to anon, authenticated, service_role;
grant all on public.game_sessions        to anon, authenticated, service_role;
grant all on public.game_moves           to anon, authenticated, service_role;
grant all on public.game_queue_entries   to anon, authenticated, service_role;
grant all on public.game_friends         to anon, authenticated, service_role;
grant all on public.game_requests        to anon, authenticated, service_role;

-- PASS SPADES-3: local draft only.
-- Secure shared Spades backend foundation for one web + TV game system.
--
-- DO NOT APPLY REMOTELY until reviewed. This migration is additive:
-- - adds real-user identity columns to existing game_room_players
-- - creates Spades-specific public/private state tables
-- - enables RLS on every new table
-- - drafts restrictive policies for authenticated participants
--
-- Current uncertainty:
-- - Existing game_* tables currently have open prototype policies. This draft
--   does not remove or weaken those policies because that requires a separate
--   compatibility review.
-- - Service role bypasses RLS in Supabase. The "service role can process"
--   requirement is satisfied by server-side Edge Function use of the service
--   role key, not by broad client policies.

-- ---------------------------------------------------------------------------
-- Existing room-player identity additions.
-- ---------------------------------------------------------------------------

alter table public.game_room_players
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null,
  add column if not exists public_profile_uid text,
  add column if not exists identity_source text not null default 'legacy',
  add column if not exists tv_device_session_id uuid,
  add column if not exists avatar_url text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'game_room_players_identity_source_check'
      and conrelid = 'public.game_room_players'::regclass
  ) then
    alter table public.game_room_players
      add constraint game_room_players_identity_source_check
      check (identity_source in ('supabase_auth', 'tv_device_session', 'bot', 'legacy'));
  end if;
end $$;

create index if not exists idx_grp_auth_user_room
  on public.game_room_players(room_id, auth_user_id)
  where auth_user_id is not null;

create index if not exists idx_grp_public_profile_uid
  on public.game_room_players(public_profile_uid)
  where public_profile_uid is not null;

-- ---------------------------------------------------------------------------
-- Spades public game state.
-- ---------------------------------------------------------------------------

create table if not exists public.spades_games (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.game_rooms(id) on delete cascade,
  session_id uuid references public.game_sessions(id) on delete set null,
  status text not null default 'waiting'
    check (status in ('waiting', 'active', 'completed', 'abandoned')),
  phase text not null default 'waiting'
    check (phase in ('waiting', 'bidding', 'playing', 'round_end', 'game_over', 'abandoned')),
  dealer_seat integer check (dealer_seat is null or dealer_seat between 0 and 3),
  lead_seat integer check (lead_seat is null or lead_seat between 0 and 3),
  current_turn_seat integer check (current_turn_seat is null or current_turn_seat between 0 and 3),
  round_number integer not null default 1 check (round_number >= 1),
  hand_number integer not null default 1 check (hand_number >= 1),
  target_score integer not null default 500 check (target_score between 100 and 1000),
  spades_broken boolean not null default false,
  team_scores jsonb not null default '[0,0]'::jsonb,
  team_bags jsonb not null default '[0,0]'::jsonb,
  team_round_bids jsonb not null default '[0,0]'::jsonb,
  team_round_tricks jsonb not null default '[0,0]'::jsonb,
  current_trick jsonb not null default '[]'::jsonb,
  public_state jsonb not null default '{}'::jsonb
    check (
      not (public_state ?| array[
        'hand',
        'hands',
        'privateHand',
        'privateHands',
        'encrypted_or_private_hand',
        'encryptedOrPrivateHand'
      ])
    ),
  public_state_version bigint not null default 0 check (public_state_version >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (room_id)
);

create index if not exists idx_spades_games_room_id
  on public.spades_games(room_id);

create index if not exists idx_spades_games_status_phase
  on public.spades_games(status, phase);

create index if not exists idx_spades_games_current_turn
  on public.spades_games(current_turn_seat)
  where current_turn_seat is not null;

-- ---------------------------------------------------------------------------
-- Spades players: denormalized game-seat projection for stable Spades joins.
-- ---------------------------------------------------------------------------

create table if not exists public.spades_players (
  id uuid primary key default gen_random_uuid(),
  spades_game_id uuid not null references public.spades_games(id) on delete cascade,
  room_player_id uuid not null references public.game_room_players(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  public_profile_uid text,
  seat_index integer not null check (seat_index between 0 and 3),
  team_index integer not null check (team_index in (0, 1)),
  display_name text not null check (char_length(display_name) between 1 and 64),
  avatar_url text,
  status text not null default 'joined'
    check (status in ('joined', 'ready', 'playing', 'disconnected', 'left', 'bot')),
  is_bot boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (spades_game_id, seat_index),
  unique (spades_game_id, room_player_id)
);

create index if not exists idx_spades_players_game
  on public.spades_players(spades_game_id, seat_index);

create index if not exists idx_spades_players_user
  on public.spades_players(user_id, spades_game_id)
  where user_id is not null;

-- ---------------------------------------------------------------------------
-- Private hands. Do not expose this table broadly. Public projection must use
-- card counts only for opponents.
-- ---------------------------------------------------------------------------

create table if not exists public.spades_private_hands (
  id uuid primary key default gen_random_uuid(),
  spades_game_id uuid not null references public.spades_games(id) on delete cascade,
  spades_player_id uuid not null references public.spades_players(id) on delete cascade,
  owner_user_id uuid references auth.users(id) on delete set null,
  owner_public_profile_uid text,
  encrypted_or_private_hand jsonb not null default '[]'::jsonb,
  card_count integer not null default 0 check (card_count between 0 and 13),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (spades_game_id, spades_player_id)
);

create index if not exists idx_spades_private_hands_owner
  on public.spades_private_hands(owner_user_id, spades_game_id)
  where owner_user_id is not null;

create index if not exists idx_spades_private_hands_game
  on public.spades_private_hands(spades_game_id);

-- ---------------------------------------------------------------------------
-- Server-accepted action ledger.
-- ---------------------------------------------------------------------------

create table if not exists public.spades_actions (
  id uuid primary key default gen_random_uuid(),
  spades_game_id uuid not null references public.spades_games(id) on delete cascade,
  spades_player_id uuid references public.spades_players(id) on delete set null,
  action_type text not null
    check (action_type in ('bid', 'play_card', 'next_round', 'leave_room', 'heartbeat')),
  action_payload jsonb not null default '{}'::jsonb
    check (
      not (action_payload ?| array[
        'hand',
        'hands',
        'privateHand',
        'privateHands',
        'encrypted_or_private_hand',
        'encryptedOrPrivateHand'
      ])
    ),
  server_sequence bigint not null check (server_sequence >= 1),
  accepted boolean not null default true,
  rejection_reason text,
  created_at timestamptz not null default now(),
  unique (spades_game_id, server_sequence)
);

create index if not exists idx_spades_actions_game_sequence
  on public.spades_actions(spades_game_id, server_sequence);

create index if not exists idx_spades_actions_player
  on public.spades_actions(spades_player_id, created_at);

-- ---------------------------------------------------------------------------
-- Spades room chat scoped to the shared game.
-- ---------------------------------------------------------------------------

create table if not exists public.spades_chat_messages (
  id uuid primary key default gen_random_uuid(),
  spades_game_id uuid not null references public.spades_games(id) on delete cascade,
  spades_player_id uuid not null references public.spades_players(id) on delete cascade,
  message text not null check (char_length(message) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists idx_spades_chat_game_created
  on public.spades_chat_messages(spades_game_id, created_at);

-- ---------------------------------------------------------------------------
-- Optional audit tables for replay and scoring.
-- ---------------------------------------------------------------------------

create table if not exists public.spades_tricks (
  id uuid primary key default gen_random_uuid(),
  spades_game_id uuid not null references public.spades_games(id) on delete cascade,
  round_number integer not null check (round_number >= 1),
  trick_number integer not null check (trick_number between 1 and 13),
  lead_seat integer not null check (lead_seat between 0 and 3),
  winning_seat integer check (winning_seat is null or winning_seat between 0 and 3),
  cards_json jsonb not null default '[]'::jsonb,
  completed_at timestamptz,
  unique (spades_game_id, round_number, trick_number)
);

create table if not exists public.spades_score_events (
  id uuid primary key default gen_random_uuid(),
  spades_game_id uuid not null references public.spades_games(id) on delete cascade,
  round_number integer not null check (round_number >= 1),
  team_index integer not null check (team_index in (0, 1)),
  bid integer not null check (bid between 0 and 13),
  tricks integer not null check (tricks between 0 and 13),
  bags_before integer not null check (bags_before >= 0),
  bags_after integer not null check (bags_after >= 0),
  score_delta integer not null,
  score_after integer not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_spades_score_events_game_round
  on public.spades_score_events(spades_game_id, round_number);

-- ---------------------------------------------------------------------------
-- RLS helper functions.
--
-- REVIEW BEFORE APPLYING:
-- These predicates are SECURITY DEFINER to avoid recursive RLS lookups when
-- policies on spades_players need to answer "is this caller in the same game?"
-- They expose only booleans, set a fixed search_path including pg_temp, and
-- revoke PUBLIC execute.
-- A later hardening pass should consider moving them into a non-exposed schema.
-- ---------------------------------------------------------------------------

create or replace function public.is_spades_game_participant(p_spades_game_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.spades_players sp
    where sp.spades_game_id = p_spades_game_id
      and sp.user_id = (select auth.uid())
      and sp.is_bot = false
      and sp.status in ('joined', 'ready', 'playing', 'disconnected')
  );
$$;

create or replace function public.is_spades_player_owner(p_spades_player_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.spades_players sp
    where sp.id = p_spades_player_id
      and sp.user_id = (select auth.uid())
      and sp.is_bot = false
  );
$$;

revoke all on function public.is_spades_game_participant(uuid) from public, anon;
revoke all on function public.is_spades_player_owner(uuid) from public, anon;
grant execute on function public.is_spades_game_participant(uuid) to authenticated;
grant execute on function public.is_spades_player_owner(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- RLS enablement and grants.
-- ---------------------------------------------------------------------------

alter table public.spades_games enable row level security;
alter table public.spades_players enable row level security;
alter table public.spades_private_hands enable row level security;
alter table public.spades_actions enable row level security;
alter table public.spades_chat_messages enable row level security;
alter table public.spades_tricks enable row level security;
alter table public.spades_score_events enable row level security;

revoke all on public.spades_games from anon, authenticated;
revoke all on public.spades_players from anon, authenticated;
revoke all on public.spades_private_hands from anon, authenticated;
revoke all on public.spades_actions from anon, authenticated;
revoke all on public.spades_chat_messages from anon, authenticated;
revoke all on public.spades_tricks from anon, authenticated;
revoke all on public.spades_score_events from anon, authenticated;

grant select on public.spades_games to authenticated;
grant select on public.spades_players to authenticated;
grant select on public.spades_private_hands to authenticated;
grant select on public.spades_actions to authenticated;
grant select on public.spades_chat_messages to authenticated;
grant select on public.spades_tricks to authenticated;
grant select on public.spades_score_events to authenticated;

-- ---------------------------------------------------------------------------
-- RLS policies.
-- ---------------------------------------------------------------------------

drop policy if exists "spades_games_members_read" on public.spades_games;
create policy "spades_games_members_read"
  on public.spades_games
  for select
  to authenticated
  using (public.is_spades_game_participant(id));

-- Direct writes to spades_games are intentionally not granted to authenticated.
-- Server-authoritative Edge Functions should use service role and validate
-- commands before writing.

drop policy if exists "spades_players_members_read" on public.spades_players;
create policy "spades_players_members_read"
  on public.spades_players
  for select
  to authenticated
  using (public.is_spades_game_participant(spades_game_id));

drop policy if exists "spades_private_hands_owner_read" on public.spades_private_hands;
create policy "spades_private_hands_owner_read"
  on public.spades_private_hands
  for select
  to authenticated
  using (owner_user_id = (select auth.uid()));

-- No authenticated INSERT/UPDATE/DELETE policies for private hands. Server only.

drop policy if exists "spades_actions_members_read" on public.spades_actions;
create policy "spades_actions_members_read"
  on public.spades_actions
  for select
  to authenticated
  using (
    public.is_spades_game_participant(spades_game_id)
    and (accepted = true or public.is_spades_player_owner(spades_player_id))
  );

-- Direct inserts are intentionally not granted for actions. Client calls should
-- go through server-authoritative command wrappers so server_sequence,
-- accepted/rejected status, turn ownership, and legal-card checks cannot be
-- spoofed from a browser or TV WebView.
drop policy if exists "spades_actions_own_insert" on public.spades_actions;

drop policy if exists "spades_chat_members_read" on public.spades_chat_messages;
create policy "spades_chat_members_read"
  on public.spades_chat_messages
  for select
  to authenticated
  using (public.is_spades_game_participant(spades_game_id));

drop policy if exists "spades_chat_own_insert" on public.spades_chat_messages;
-- Direct chat inserts are also withheld in this draft. Use spades-chat-send so
-- membership, rate limits, and future moderation can be enforced server-side.

drop policy if exists "spades_tricks_members_read" on public.spades_tricks;
create policy "spades_tricks_members_read"
  on public.spades_tricks
  for select
  to authenticated
  using (public.is_spades_game_participant(spades_game_id));

drop policy if exists "spades_score_events_members_read" on public.spades_score_events;
create policy "spades_score_events_members_read"
  on public.spades_score_events
  for select
  to authenticated
  using (public.is_spades_game_participant(spades_game_id));

-- No anon grants or anon policies are added. TV token flow must call server-side
-- Edge Functions/API wrappers, which validate the token and use service role
-- internally. Do not let TV WebView query these tables directly with anon.

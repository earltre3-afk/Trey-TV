-- ================================================
-- TRUNO — Trey TV's original card game schema
-- Migration: 20260518051800_truno_game_tables.sql
-- ================================================

-- ROOMS
CREATE TABLE IF NOT EXISTS public.truno_rooms (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code       text NOT NULL UNIQUE,
  host_user_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  room_type       text NOT NULL DEFAULT 'standard' CHECK (room_type IN ('standard', 'tournament', 'club')),
  visibility      text NOT NULL DEFAULT 'public'   CHECK (visibility IN ('public', 'private')),
  status          text NOT NULL DEFAULT 'open'     CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  max_players     int  NOT NULL DEFAULT 4 CHECK (max_players BETWEEN 2 AND 8),
  current_players int  NOT NULL DEFAULT 1,
  rule_set        jsonb NOT NULL DEFAULT '{}',
  settings        jsonb NOT NULL DEFAULT '{}',
  club_id         uuid,
  tournament_id   uuid,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS truno_rooms_visibility_status_idx ON public.truno_rooms (visibility, status);
CREATE INDEX IF NOT EXISTS truno_rooms_code_idx             ON public.truno_rooms (room_code);

-- ROOM PLAYERS
CREATE TABLE IF NOT EXISTS public.truno_room_players (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id     uuid NOT NULL REFERENCES public.truno_rooms(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  display_name text NOT NULL DEFAULT 'Anonymous',
  avatar_url   text,
  seat_index   int  NOT NULL DEFAULT 0,
  status       text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'ready', 'playing', 'disconnected', 'left')),
  is_ai        boolean NOT NULL DEFAULT false,
  score        int     NOT NULL DEFAULT 0,
  cards_in_hand int   NOT NULL DEFAULT 0,
  joined_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS truno_room_players_room_id_idx ON public.truno_room_players (room_id);

-- GAME SESSIONS
CREATE TABLE IF NOT EXISTS public.truno_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id         uuid NOT NULL REFERENCES public.truno_rooms(id) ON DELETE CASCADE,
  status          text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  current_player_index int NOT NULL DEFAULT 0,
  direction       int  NOT NULL DEFAULT 1, -- 1 forward, -1 reverse
  current_color   text,
  draw_stack      int  NOT NULL DEFAULT 0,
  deck_state      jsonb NOT NULL DEFAULT '[]',
  discard_pile    jsonb NOT NULL DEFAULT '[]',
  started_at      timestamptz NOT NULL DEFAULT now(),
  ended_at        timestamptz,
  winner_user_id  uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS truno_sessions_room_id_idx ON public.truno_sessions (room_id);

-- TOURNAMENTS
CREATE TABLE IF NOT EXISTS public.truno_tournaments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title               text NOT NULL,
  description         text,
  image_url           text,
  status              text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'registering', 'live', 'completed', 'cancelled')),
  prize_pool          int  NOT NULL DEFAULT 0,
  entry_fee           int  NOT NULL DEFAULT 0,
  max_players         int  NOT NULL DEFAULT 64,
  registered_players  int  NOT NULL DEFAULT 0,
  starts_at           timestamptz NOT NULL,
  ends_at             timestamptz,
  rule_set            jsonb NOT NULL DEFAULT '{}',
  settings            jsonb NOT NULL DEFAULT '{}',
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS truno_tournaments_status_starts_at_idx ON public.truno_tournaments (status, starts_at);

-- TOURNAMENT ENTRIES
CREATE TABLE IF NOT EXISTS public.truno_tournament_entries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id   uuid NOT NULL REFERENCES public.truno_tournaments(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status          text NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'eliminated', 'finalist', 'winner')),
  final_rank      int,
  registered_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, user_id)
);

CREATE INDEX IF NOT EXISTS truno_tournament_entries_tournament_id_idx ON public.truno_tournament_entries (tournament_id);

-- CLUBS
CREATE TABLE IF NOT EXISTS public.truno_clubs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name            text NOT NULL,
  description     text,
  image_url       text,
  tags            text[]  NOT NULL DEFAULT '{}',
  visibility      text    NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'invite_only')),
  member_count    int     NOT NULL DEFAULT 1,
  online_count    int     NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS truno_clubs_visibility_online_idx ON public.truno_clubs (visibility, online_count DESC);

-- PLAYER STATS
CREATE TABLE IF NOT EXISTS public.truno_player_stats (
  user_id       uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  text NOT NULL DEFAULT 'Anonymous',
  avatar_url    text,
  rank_key      text NOT NULL DEFAULT 'rookie',
  xp            int  NOT NULL DEFAULT 0,
  total_games   int  NOT NULL DEFAULT 0,
  wins          int  NOT NULL DEFAULT 0,
  losses        int  NOT NULL DEFAULT 0,
  truno_calls   int  NOT NULL DEFAULT 0, -- times called TRUNO
  cards_played  int  NOT NULL DEFAULT 0,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================

ALTER TABLE public.truno_rooms            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.truno_room_players     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.truno_sessions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.truno_tournaments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.truno_tournament_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.truno_clubs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.truno_player_stats     ENABLE ROW LEVEL SECURITY;

-- Public rooms: readable by anyone
CREATE POLICY IF NOT EXISTS "truno_rooms_public_read"
  ON public.truno_rooms FOR SELECT
  USING (visibility = 'public' OR host_user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "truno_rooms_insert"
  ON public.truno_rooms FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND host_user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "truno_rooms_update_host"
  ON public.truno_rooms FOR UPDATE
  USING (host_user_id = auth.uid());

-- Room players
CREATE POLICY IF NOT EXISTS "truno_room_players_read"
  ON public.truno_room_players FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "truno_room_players_insert"
  ON public.truno_room_players FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY IF NOT EXISTS "truno_room_players_update_own"
  ON public.truno_room_players FOR UPDATE
  USING (user_id = auth.uid());

-- Sessions: readable by room participants
CREATE POLICY IF NOT EXISTS "truno_sessions_read"
  ON public.truno_sessions FOR SELECT
  USING (true);

-- Tournaments: public read
CREATE POLICY IF NOT EXISTS "truno_tournaments_read"
  ON public.truno_tournaments FOR SELECT
  USING (true);

-- Tournament entries: users can read own and insert own
CREATE POLICY IF NOT EXISTS "truno_tournament_entries_read_own"
  ON public.truno_tournament_entries FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "truno_tournament_entries_insert"
  ON public.truno_tournament_entries FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Clubs: public read
CREATE POLICY IF NOT EXISTS "truno_clubs_read"
  ON public.truno_clubs FOR SELECT
  USING (visibility = 'public');

-- Player stats: own profile writable, all readable
CREATE POLICY IF NOT EXISTS "truno_player_stats_read"
  ON public.truno_player_stats FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "truno_player_stats_upsert"
  ON public.truno_player_stats FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "truno_player_stats_update"
  ON public.truno_player_stats FOR UPDATE
  USING (user_id = auth.uid());

-- Allow TRUNO in the shared Trey TV Games room/session/queue/request tables.
-- Dedicated truno_* tables are created in a later migration.

ALTER TABLE public.game_rooms
  DROP CONSTRAINT IF EXISTS game_rooms_game_type_check,
  ADD CONSTRAINT game_rooms_game_type_check
    CHECK (game_type IN ('spades', 'blackjack', 'bullshit', 'truno'));

ALTER TABLE public.game_sessions
  DROP CONSTRAINT IF EXISTS game_sessions_game_type_check,
  ADD CONSTRAINT game_sessions_game_type_check
    CHECK (game_type IN ('spades', 'blackjack', 'bullshit', 'truno'));

ALTER TABLE public.game_queue_entries
  DROP CONSTRAINT IF EXISTS game_queue_entries_game_type_check,
  ADD CONSTRAINT game_queue_entries_game_type_check
    CHECK (game_type IN ('spades', 'blackjack', 'bullshit', 'truno'));

ALTER TABLE public.game_requests
  DROP CONSTRAINT IF EXISTS game_requests_game_type_check,
  ADD CONSTRAINT game_requests_game_type_check
    CHECK (game_type IN ('spades', 'blackjack', 'bullshit', 'truno'));

-- PASS SPADES-4 local-only fixtures.
--
-- Intended use:
-- 1. Start a disposable local Supabase database.
-- 2. Apply existing repo migrations locally only.
-- 3. Apply this fixture file locally only.
-- 4. Run supabase/tests/spades_rls_local_test.sql.
--
-- Do not run against remote Supabase.

begin;

set local role postgres;

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-00000000a001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'spades-a@example.test',
    crypt('local-only-password', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-00000000b002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'spades-b@example.test',
    crypt('local-only-password', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-00000000c003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'spades-c@example.test',
    crypt('local-only-password', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  )
on conflict (id) do nothing;

insert into public.game_rooms (
  id,
  room_code,
  game_type,
  status,
  host_user_id,
  host_display_name,
  max_players,
  current_players,
  is_private,
  target_score,
  created_at,
  updated_at,
  last_activity_at
)
values (
  '10000000-0000-0000-0000-000000000001',
  'SP4TST',
  'spades',
  'active',
  '00000000-0000-0000-0000-00000000a001',
  'Spades A',
  4,
  2,
  true,
  500,
  now(),
  now(),
  now()
)
on conflict (id) do nothing;

insert into public.game_room_players (
  id,
  room_id,
  user_id,
  display_name,
  seat_index,
  team_index,
  is_bot,
  is_ready,
  is_connected,
  is_host,
  joined_at,
  last_seen_at,
  auth_user_id,
  public_profile_uid,
  identity_source
)
values
  (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-00000000a001',
    'Spades A',
    0,
    0,
    false,
    true,
    true,
    true,
    now(),
    now(),
    '00000000-0000-0000-0000-00000000a001',
    'spades-a',
    'supabase_auth'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-00000000b002',
    'Spades B',
    1,
    1,
    false,
    true,
    true,
    false,
    now(),
    now(),
    '00000000-0000-0000-0000-00000000b002',
    'spades-b',
    'supabase_auth'
  )
on conflict (id) do nothing;

insert into public.spades_games (
  id,
  room_id,
  status,
  phase,
  current_turn_seat,
  public_state,
  public_state_version
)
values (
  '30000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'active',
  'playing',
  0,
  '{"note":"public only"}'::jsonb,
  1
)
on conflict (id) do nothing;

insert into public.spades_players (
  id,
  spades_game_id,
  room_player_id,
  user_id,
  public_profile_uid,
  seat_index,
  team_index,
  display_name,
  status,
  is_bot
)
values
  (
    '40000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-00000000a001',
    'spades-a',
    0,
    0,
    'Spades A',
    'playing',
    false
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-00000000b002',
    'spades-b',
    1,
    1,
    'Spades B',
    'playing',
    false
  )
on conflict (id) do nothing;

insert into public.spades_private_hands (
  id,
  spades_game_id,
  spades_player_id,
  owner_user_id,
  owner_public_profile_uid,
  encrypted_or_private_hand,
  card_count
)
values
  (
    '50000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-00000000a001',
    'spades-a',
    '["AS","KH"]'::jsonb,
    2
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-00000000b002',
    'spades-b',
    '["2C","3D"]'::jsonb,
    2
  )
on conflict (id) do nothing;

insert into public.spades_actions (
  id,
  spades_game_id,
  spades_player_id,
  action_type,
  action_payload,
  server_sequence,
  accepted
)
values (
  '60000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000001',
  'bid',
  '{"bid":3}'::jsonb,
  1,
  true
)
on conflict (id) do nothing;

insert into public.spades_chat_messages (
  id,
  spades_game_id,
  spades_player_id,
  message,
  created_at
)
values (
  '70000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000001',
  'local fixture public chat',
  now()
)
on conflict (id) do nothing;

commit;

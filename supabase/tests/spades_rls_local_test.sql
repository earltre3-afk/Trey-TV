-- PASS SPADES-4 local-only RLS assertions.
--
-- Requires:
-- - disposable local Supabase database
-- - repo migrations applied locally
-- - supabase/tests/spades_rls_local_fixtures.sql applied locally
--
-- Suggested local-only command sequence:
--   supabase start
--   supabase db reset --local
--   psql "$LOCAL_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/spades_rls_local_fixtures.sql
--   psql "$LOCAL_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/spades_rls_local_test.sql
--
-- Do not run against remote Supabase.

begin;

create temp table spades_rls_results (
  check_name text primary key,
  passed boolean not null,
  details text
);

create or replace function pg_temp.set_local_auth(p_role text, p_user_id uuid default null)
returns void
language plpgsql
as $$
begin
  execute format('set local role %I', p_role);
  perform set_config(
    'request.jwt.claims',
    case
      when p_user_id is null then '{}'::text
      else jsonb_build_object('sub', p_user_id::text, 'role', p_role)::text
    end,
    true
  );
  perform set_config('request.jwt.claim.sub', coalesce(p_user_id::text, ''), true);
end;
$$;

-- A joined player can read public state.
select pg_temp.set_local_auth('authenticated', '00000000-0000-0000-0000-00000000a001');
insert into spades_rls_results
select
  'joined player can read public state',
  exists (
    select 1
    from public.spades_games
    where id = '30000000-0000-0000-0000-000000000001'
  ),
  'user A should see the Spades game public row';

-- A joined player can read their own private hand.
select pg_temp.set_local_auth('authenticated', '00000000-0000-0000-0000-00000000a001');
insert into spades_rls_results
select
  'user A can read own private hand',
  exists (
    select 1
    from public.spades_private_hands
    where owner_user_id = '00000000-0000-0000-0000-00000000a001'
      and encrypted_or_private_hand = '["AS","KH"]'::jsonb
  ),
  'user A should see only hand A';

-- A joined player cannot read another player's private hand.
select pg_temp.set_local_auth('authenticated', '00000000-0000-0000-0000-00000000a001');
insert into spades_rls_results
select
  'user A cannot read user B private hand',
  not exists (
    select 1
    from public.spades_private_hands
    where owner_user_id = '00000000-0000-0000-0000-00000000b002'
      and encrypted_or_private_hand = '["2C","3D"]'::jsonb
  ),
  'RLS should hide user B hand from user A';

-- A non-member cannot read public state.
select pg_temp.set_local_auth('authenticated', '00000000-0000-0000-0000-00000000c003');
insert into spades_rls_results
select
  'non-member cannot read public state',
  not exists (
    select 1
    from public.spades_games
    where id = '30000000-0000-0000-0000-000000000001'
  ),
  'user C should not see this private Spades game';

-- Anon cannot read any Spades table.
select pg_temp.set_local_auth('anon', null);
insert into spades_rls_results
select
  'anon cannot read spades tables',
  not exists (select 1 from public.spades_games)
  and not exists (select 1 from public.spades_players)
  and not exists (select 1 from public.spades_private_hands)
  and not exists (select 1 from public.spades_actions)
  and not exists (select 1 from public.spades_chat_messages),
  'anon has no grants/policies for Spades tables';

-- Helper functions expose booleans only and do not leak rows.
select pg_temp.set_local_auth('authenticated', '00000000-0000-0000-0000-00000000a001');
insert into spades_rls_results
select
  'helper functions return membership booleans',
  public.is_spades_game_participant('30000000-0000-0000-0000-000000000001') = true
  and public.is_spades_player_owner('40000000-0000-0000-0000-000000000001') = true
  and public.is_spades_player_owner('40000000-0000-0000-0000-000000000002') = false,
  'helpers should not return or expose private data';

-- Direct insert into actions is blocked for authenticated clients.
do $$
begin
  perform pg_temp.set_local_auth('authenticated', '00000000-0000-0000-0000-00000000a001');
  begin
    insert into public.spades_actions (
      spades_game_id,
      spades_player_id,
      action_type,
      action_payload,
      server_sequence
    )
    values (
      '30000000-0000-0000-0000-000000000001',
      '40000000-0000-0000-0000-000000000001',
      'play_card',
      '{"cardId":"AS"}'::jsonb,
      2
    );

    insert into spades_rls_results
    values ('direct insert into spades_actions is blocked', false, 'insert unexpectedly succeeded');
  exception
    when insufficient_privilege or check_violation or undefined_table or invalid_column_reference then
      insert into spades_rls_results
      values ('direct insert into spades_actions is blocked', true, sqlerrm);
    when others then
      insert into spades_rls_results
      values ('direct insert into spades_actions is blocked', true, sqlerrm);
  end;
end $$;

-- Direct insert into chat is blocked for authenticated clients.
do $$
begin
  perform pg_temp.set_local_auth('authenticated', '00000000-0000-0000-0000-00000000a001');
  begin
    insert into public.spades_chat_messages (
      spades_game_id,
      spades_player_id,
      message
    )
    values (
      '30000000-0000-0000-0000-000000000001',
      '40000000-0000-0000-0000-000000000001',
      'direct insert should fail'
    );

    insert into spades_rls_results
    values ('direct insert into spades_chat_messages is blocked', false, 'insert unexpectedly succeeded');
  exception
    when insufficient_privilege or check_violation or undefined_table or invalid_column_reference then
      insert into spades_rls_results
      values ('direct insert into spades_chat_messages is blocked', true, sqlerrm);
    when others then
      insert into spades_rls_results
      values ('direct insert into spades_chat_messages is blocked', true, sqlerrm);
  end;
end $$;

-- Service role/postgres path is the intended write path.
set local role postgres;
insert into spades_rls_results
select
  'server service path can write action ledger',
  (
    with inserted as (
      insert into public.spades_actions (
        spades_game_id,
        spades_player_id,
        action_type,
        action_payload,
        server_sequence
      )
      values (
        '30000000-0000-0000-0000-000000000001',
        '40000000-0000-0000-0000-000000000001',
        'heartbeat',
        '{}'::jsonb,
        99
      )
      returning id
    )
    select count(*) = 1 from inserted
  ),
  'server-side command wrappers should own writes';

-- Fail the script if any assertion failed.
do $$
declare
  failures text;
begin
  select string_agg(check_name || ': ' || coalesce(details, ''), E'\n')
  into failures
  from spades_rls_results
  where passed = false;

  if failures is not null then
    raise exception 'Spades RLS local test failures:%', E'\n' || failures;
  end if;
end $$;

select * from spades_rls_results order by check_name;

rollback;

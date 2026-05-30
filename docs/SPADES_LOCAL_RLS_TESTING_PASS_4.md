# Spades Local RLS Testing Pass 4

Date: 2026-05-28

## A. Local-Only Scope

PASS SPADES-4 creates a local validation layer for the shared Spades backend foundation.

This pass did not:

- rebuild the APK
- touch Android packaging
- change download paths
- touch Trey-I onboarding
- redesign UI
- wire TV Spades UI
- deploy Edge Functions
- apply migrations to remote Supabase
- weaken RLS
- expose private hands

Supabase CLI is installed locally:

- Installed: `2.95.4`
- Latest notice from CLI: `2.101.0` available

The repo has a minimal `supabase/config.toml` with a `project_id`, so local Supabase workflows are available if Docker/local services are started later. They were not started in this pass.

## B. Migration Dry Review

Reviewed:

- `supabase/migrations/20260528210000_create_spades_secure_state.sql`

Result: still local-draft safe, but not remote-ready until the SQL fixtures are run against a disposable local database and advisors pass.

Confirmed:

- additive only
- no `TRUNCATE`
- no destructive `DELETE`
- no table or column drops
- `DROP POLICY IF EXISTS` appears only for idempotent policy replacement
- RLS enabled on all new `spades_*` tables
- no anon grants or anon policies
- helper functions use `set search_path = public, pg_temp`
- helper functions return booleans only
- no direct authenticated writes to `spades_private_hands`
- no direct authenticated writes to `spades_actions`
- no direct authenticated writes to `spades_chat_messages`
- action/chat/private writes are reserved for server-authoritative command code

Conceptual policy compile notes:

- Policies rely on `auth.uid()` via helper functions.
- Helpers are `SECURITY DEFINER` to avoid recursive RLS on `spades_players`.
- Helpers must remain tiny and boolean-only.
- `spades_private_hands` remains in `public`; strict RLS is drafted, but a non-exposed schema remains the stronger future boundary.

## C. RLS Test Scenarios

Created local SQL fixtures to cover:

- user A can read their own private hand
- user A cannot read user B's private hand
- joined player can read public state
- non-member cannot read public state
- anon cannot read any Spades table
- direct insert into `spades_actions` is blocked
- direct insert into `spades_chat_messages` is blocked
- server/postgres command path can write the action ledger
- helper functions return boolean membership/ownership answers only

Suggested local-only command sequence:

```bash
supabase start
supabase db reset --local
supabase db advisors --local --type security --level warn
psql "$LOCAL_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/spades_rls_local_fixtures.sql
psql "$LOCAL_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/spades_rls_local_test.sql
```

Alternative CLI-native test direction:

```bash
supabase test db
```

The current fixtures are plain SQL assertions rather than pgTAP tests, so `psql` is the intended first runner.

## D. SQL Fixtures Created

Created:

- `supabase/tests/spades_rls_local_fixtures.sql`
- `supabase/tests/spades_rls_local_test.sql`

The fixture file creates disposable local auth users, one room, two joined Spades players, one Spades game, two private hand rows, one action row, and one chat row.

The test file simulates `authenticated` and `anon` contexts with local JWT claim settings, then records assertion results in a temp table and raises if any assertion fails.

Important: these files are local-only. They intentionally contain fixed UUIDs and test email addresses for repeatable disposable database runs.

## E. Function Transaction Design

All write commands should use server-side service role access inside Edge Functions only. Clients must send commands, never table patches.

### `spades-room-create`

Inputs:

- optional `displayName`
- optional `targetScore`
- Supabase Auth bearer token, or future validated `tvDeviceToken`

Auth:

- resolve Supabase user with `auth.getUser(token)`
- for `tvDeviceToken`, validate hashed token server-side and resolve a real user/profile before proceeding

Tables touched:

- `game_rooms`
- `game_room_players`
- `spades_games`
- `spades_players`

Transaction:

- create one `game_rooms` row
- create host `game_room_players` row
- create one `spades_games` row
- create host `spades_players` row
- commit and return caller-safe projection

Validation:

- real user required
- target score allowed range
- no guest/random local IDs for shared multiplayer

Failures:

- unauthorized
- invalid identity
- invalid target score
- room creation conflict

No-private-hand guarantee:

- no hands are created or returned until game start/deal command exists
- response uses caller-safe projection helper

### `spades-room-join`

Inputs:

- `joinCode`
- optional `displayName`
- bearer token or future validated `tvDeviceToken`

Tables touched:

- `game_rooms`
- `game_room_players`
- `spades_games`
- `spades_players`

Transaction:

- lock room row by join code
- confirm status allows joining
- confirm user is not already seated or reuse existing membership
- assign open seat/team
- update `current_players`
- create `spades_players` row
- commit and return caller-safe projection

Validation:

- join code exists
- room not full
- real user identity
- seat uniqueness

Failures:

- room not found
- room full
- already joined
- identity invalid

No-private-hand guarantee:

- projection includes only caller private section, which is empty before deal
- other players are public summaries only

### `spades-room-state`

Inputs:

- `roomId`
- bearer token or future validated `tvDeviceToken`

Tables touched:

- `game_rooms`
- `game_room_players`
- `spades_games`
- `spades_players`
- caller row in `spades_private_hands`
- public rows in `spades_actions`, `spades_chat_messages`, optional audit tables

Transaction boundary:

- read-only; no mutation required
- may use a repeatable read transaction later if projection assembly needs snapshot consistency

Validation:

- caller is room participant
- caller controls exactly one non-bot seat

Failures:

- unauthorized
- room not found
- not a participant
- private hand unavailable for active game

No-private-hand guarantee:

- load only caller private hand by `owner_user_id`
- never select all `encrypted_or_private_hand` rows for projection assembly
- run `assertNoPrivateHandLeak` on public projection before response

### `spades-action-submit`

Inputs:

- `roomId`
- `actionType`
- `actionPayload`
- bearer token or future validated `tvDeviceToken`

Tables touched:

- `game_rooms`
- `game_room_players`
- `spades_games`
- `spades_players`
- caller row in `spades_private_hands`
- `spades_actions`
- possibly `spades_tricks`
- possibly `spades_score_events`

Transaction:

- lock `spades_games` row for update
- resolve caller player/seat
- validate phase, turn, and action shape
- for bids: validate bid range and bidding phase
- for card play: load caller hand only, validate card ownership and legal play
- mutate caller private hand only
- mutate public trick/score/turn state
- append action ledger row with server sequence
- commit and return caller-safe projection

Failures:

- unauthorized
- not a participant
- invalid payload
- not your turn
- illegal action
- stale/duplicate command
- private state unavailable

No-private-hand guarantee:

- only caller hand is loaded for legality checks
- response includes caller hand only after mutation
- action payload check rejects obvious private-hand keys

### `spades-chat-send`

Inputs:

- `roomId`
- `message`
- bearer token or future validated `tvDeviceToken`

Tables touched:

- `spades_games`
- `spades_players`
- `spades_chat_messages`

Transaction:

- confirm membership
- validate message length/content
- insert chat row server-side
- return caller-safe projection or chat append result

Failures:

- unauthorized
- not a participant
- invalid message
- rate limited
- moderation rejected

No-private-hand guarantee:

- chat rows never include card IDs or private hand fields
- direct client inserts remain blocked

### `spades-room-leave`

Inputs:

- `roomId`
- bearer token or future validated `tvDeviceToken`

Tables touched:

- `game_room_players`
- `spades_players`
- `spades_games`
- `spades_actions`

Transaction:

- lock caller membership and game row
- mark membership disconnected/left
- append leave action
- if game cannot continue, mark game abandoned or trigger bot/substitution policy
- commit and return caller-safe projection

Failures:

- unauthorized
- not a participant
- room not found
- game already over

No-private-hand guarantee:

- no private hand rows are returned to other players
- leave action payload contains no cards/hands

## F. Projection Test Additions

Expanded:

- `src/features/games/spades/shared/spadesProjection.test.ts`

Added source-controlled tests for:

- public projection rejects `privateHands` key
- public projection rejects `hands` key
- caller projection includes only caller hand
- caller projection never includes other hands
- action response shape cannot include `privateHands`
- chat projection cannot include card data

The repo still has no root `test` script, so these are not executable by the package scripts yet. They are compile-time/source-controlled test functions for the future test harness.

## G. What Remains Before Remote Migration

Before any remote migration:

- run the SQL fixtures against a disposable local Supabase database
- run `supabase db advisors --local --type security`
- resolve any advisor findings about `SECURITY DEFINER`, RLS, exposed tables, or grants
- decide whether to move helpers/private hands into a non-exposed schema
- implement and locally test server-authoritative Edge Function transactions
- add a real JS/TS test runner or pgTAP harness
- update generated Supabase database types after migration validation
- keep TV UI wiring blocked until command APIs are proven

## H. Recommended SPADES-5

Recommended PASS SPADES-5:

- run local Supabase stack in a disposable environment
- apply migrations locally only
- run `supabase db advisors --local`
- execute `supabase/tests/spades_rls_local_fixtures.sql`
- execute `supabase/tests/spades_rls_local_test.sql`
- convert SQL assertions into `supabase test db`/pgTAP if desired
- fix only Spades-specific SQL/RLS findings
- keep remote migration blocked unless local RLS assertions pass cleanly

## Validation

Validation commands for this pass:

- `npm run build`
- `npm run lint`
- `npx tsc --noEmit --pretty false`

Results are recorded in the final PASS SPADES-4 report.

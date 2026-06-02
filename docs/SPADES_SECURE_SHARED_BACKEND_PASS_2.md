# Spades Secure Shared Backend Pass 2

Date: 2026-05-28

## Scope

PASS SPADES-2 defines the secure shared backend design for one Spades game system across Trey TV web and StreamingBox/TV.

This pass does not apply migrations and does not change runtime code.

- No APK rebuild.
- No Android packaging changes.
- No download path changes.
- No Trey-I onboarding changes.
- No auth behavior changes.
- No RLS changes applied.
- No fake game state added.
- No second disconnected Spades game created.

Supabase docs checked for this design:

- `https://supabase.com/docs/guides/database/postgres/row-level-security`
- `https://supabase.com/docs/guides/api/securing-your-api`
- `https://supabase.com/docs/guides/functions`
- `https://supabase.com/docs/guides/functions/secrets`
- `https://supabase.com/changelog?tags=breaking-change`

Key current guidance used:

- Enable RLS on exposed tables.
- Grants and RLS are separate controls.
- Use explicit grants with minimum privileges.
- Use `TO authenticated` policies with ownership predicates instead of broad policies.
- Treat service-role/secret keys as server-only because they bypass RLS.
- Avoid public `SECURITY DEFINER` functions unless tightly controlled and revoked from `PUBLIC`.
- Do not rely on user-editable JWT/user metadata for authorization.

## PASS 1 Baseline Finding

The repo currently has one partially real web Spades implementation and one separate TV mock Spades screen.

The shared web implementation already has:

- `game_rooms`
- `game_room_players`
- `game_sessions`
- `game_moves`
- `game_queue_entries`
- `game_requests`
- real Spades rules in `src/features/games/lib/spades/spadesEngine.ts`

But it is not secure enough for real cross-app multiplayer because:

- `game_sessions.state_json` can contain all four private hands.
- Game RLS currently uses open policies.
- Client code can write replacement state.
- Guest/local IDs can enter shared multiplayer.
- TV activation identity is not bridged into Spades.

## Design Decision

Use the existing generic `game_*` room system as the shared room/invite foundation, then add Spades-specific authoritative state tables.

Do not create `tv_spades_*` tables.
Do not fork TV Spades into a second game.
Do not keep private hands inside `game_sessions.state_json`.

The shared source of truth should be:

- Generic room and membership records in `public.game_rooms` and `public.game_room_players`.
- Spades public match state in `public.spades_games`.
- Spades private hand state in `public.spades_player_hands` with strict RLS, or in a non-exposed internal schema if the project adopts one.
- Spades accepted move ledger in `public.spades_moves`.
- Optional trick history and score snapshots in `public.spades_tricks` and `public.spades_score_events`.

## Proposed Additive Schema

This is design SQL only. Do not apply in this pass.

### Room Identity Additions

Keep existing `game_rooms` and `game_room_players`, but add real-user identity columns rather than replacing existing text columns immediately.

```sql
alter table public.game_room_players
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null,
  add column if not exists public_profile_uid text,
  add column if not exists identity_source text not null default 'legacy'
    check (identity_source in ('supabase_auth', 'tv_device_session', 'bot', 'legacy')),
  add column if not exists tv_device_session_id uuid,
  add column if not exists avatar_url text;

create index if not exists idx_grp_auth_user_room
  on public.game_room_players(room_id, auth_user_id)
  where auth_user_id is not null;
```

Rationale:

- Existing rows stay compatible.
- Real multiplayer can require `auth_user_id` while old solo/prototype rows remain readable for migration.
- TV players can resolve to the same `auth_user_id` as web users.
- Bot seats remain explicit with `identity_source = 'bot'`.

### Public Spades Game State

```sql
create table if not exists public.spades_games (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.game_rooms(id) on delete cascade,
  session_id uuid references public.game_sessions(id) on delete set null,
  status text not null default 'waiting'
    check (status in ('waiting', 'bidding', 'playing', 'round_end', 'game_over', 'abandoned')),
  phase text not null default 'waiting',
  round_number integer not null default 1,
  target_score integer not null default 500,
  dealer_seat integer,
  lead_seat integer,
  current_turn_seat integer,
  spades_broken boolean not null default false,
  team_scores jsonb not null default '[0,0]'::jsonb,
  team_bags jsonb not null default '[0,0]'::jsonb,
  team_round_bids jsonb not null default '[0,0]'::jsonb,
  team_round_tricks jsonb not null default '[0,0]'::jsonb,
  current_trick jsonb not null default '[]'::jsonb,
  last_trick_winner integer,
  public_state_version integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(room_id)
);

create index if not exists idx_spades_games_room_id
  on public.spades_games(room_id);

create index if not exists idx_spades_games_turn
  on public.spades_games(status, current_turn_seat);
```

This table contains only public or table-visible state:

- phase
- current turn
- scores
- bids
- trick cards already played
- card counts can be derived from hand rows or stored in a public projection

It must not contain all private hands.

### Private Hands

Option A, public schema with strict RLS:

```sql
create table if not exists public.spades_player_hands (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.spades_games(id) on delete cascade,
  room_id uuid not null references public.game_rooms(id) on delete cascade,
  room_player_id uuid not null references public.game_room_players(id) on delete cascade,
  auth_user_id uuid references auth.users(id) on delete set null,
  seat_index integer not null check (seat_index between 0 and 3),
  hand_json jsonb not null default '[]'::jsonb,
  card_count integer not null default 0,
  updated_at timestamptz not null default now(),
  unique(game_id, seat_index),
  unique(game_id, room_player_id)
);

create index if not exists idx_spades_hands_auth_user
  on public.spades_player_hands(auth_user_id, game_id)
  where auth_user_id is not null;
```

Option B, preferred if a non-exposed schema is adopted:

- Put private hand rows in `app_private.spades_player_hands`.
- Expose only server/API wrappers and safe projections.
- Do not add `app_private` to exposed schemas.

Option B gives a cleaner boundary, but Option A can be acceptable if RLS and grants are strict.

### Move Ledger

```sql
create table if not exists public.spades_moves (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.spades_games(id) on delete cascade,
  room_id uuid not null references public.game_rooms(id) on delete cascade,
  room_player_id uuid references public.game_room_players(id) on delete set null,
  auth_user_id uuid references auth.users(id) on delete set null,
  seat_index integer not null check (seat_index between 0 and 3),
  move_number bigint not null,
  move_type text not null check (move_type in ('bid', 'play_card', 'next_round', 'leave', 'heartbeat')),
  move_payload jsonb not null default '{}'::jsonb,
  accepted boolean not null default true,
  rejection_reason text,
  created_at timestamptz not null default now(),
  unique(game_id, move_number)
);

create index if not exists idx_spades_moves_game_created
  on public.spades_moves(game_id, created_at);
```

Move numbers should be assigned server-side in a transaction.

### Trick And Score Audit

```sql
create table if not exists public.spades_tricks (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.spades_games(id) on delete cascade,
  round_number integer not null,
  trick_number integer not null,
  lead_seat integer not null,
  winning_seat integer,
  cards_json jsonb not null default '[]'::jsonb,
  completed_at timestamptz,
  unique(game_id, round_number, trick_number)
);

create table if not exists public.spades_score_events (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.spades_games(id) on delete cascade,
  round_number integer not null,
  team_index integer not null check (team_index in (0, 1)),
  bid integer not null,
  tricks integer not null,
  bags_before integer not null,
  bags_after integer not null,
  score_delta integer not null,
  score_after integer not null,
  created_at timestamptz not null default now()
);
```

These rows support replay, disputes, analytics, and future stats without exposing hands.

## RLS Design

### General Principles

- Keep RLS enabled on every public game table.
- Remove open `for all using (true)` policies for real multiplayer paths.
- Grant only the privileges each role needs.
- Prefer `TO authenticated` with explicit ownership/participant predicates.
- Avoid `anon` writes to game state.
- Keep service-role operations in server code only.

### Helper Predicate

Design helper:

```sql
create or replace function public.is_game_room_participant(p_room_id uuid)
returns boolean
language sql
stable
security invoker
as $$
  select exists (
    select 1
    from public.game_room_players grp
    where grp.room_id = p_room_id
      and grp.auth_user_id = (select auth.uid())
      and grp.is_connected = true
  );
$$;
```

This function is `security invoker`, so it should respect normal access rules. If performance or access requires a `security definer` function later, put it outside exposed schemas, revoke default `EXECUTE`, and grant only required roles.

### Game Rooms

Read:

- Public waiting rooms can be listed if `is_private = false`.
- Private rooms can be read only by participants or exact server-side join-code lookup.

Write:

- Authenticated users can create rooms with themselves as host.
- Participants can update only safe presence fields.
- Game status changes should happen through server command wrappers.

### Game Room Players

Read:

- Participants can read players in their rooms.
- Public lobby projections may expose display name, avatar, seat, team, host, bot status.

Write:

- Insert through server command wrapper for create/join.
- Direct client update limited to own presence fields if allowed:
  - `is_connected`
  - `last_seen_at`
  - maybe `is_ready`

No client should be able to change:

- `auth_user_id`
- `seat_index`
- `team_index`
- `is_bot`
- `is_host`

### Spades Games

Read:

- Participants can read their room's public Spades game row.

Write:

- Direct writes should be server-only.
- Clients submit commands, not state patches.

### Spades Player Hands

Read:

- A player can read only their own hand row:
  - `auth_user_id = auth.uid()`
- Opponent rows should expose only `card_count` through public projection, not `hand_json`.

Write:

- Server-only command path.
- Clients never update `hand_json` directly.

### Spades Moves

Read:

- Participants can read accepted public move history.
- Rejected moves should be visible to the submitting user and server/admin only.

Write:

- Insert through server command wrapper.
- If direct insert is allowed later, RLS must enforce:
  - caller owns `auth_user_id`
  - caller controls `seat_index` in that room
  - move type is allowed
  - payload is syntactically valid

Even with RLS, rule validation should remain server-side because RLS is not a full Spades rules engine.

## Server Command API

Both web and TV should call the same command API.

Recommended commands:

- `spades.createRoom`
- `spades.joinRoomByCode`
- `spades.getRoom`
- `spades.startGame`
- `spades.bid`
- `spades.playCard`
- `spades.nextRound`
- `spades.leaveRoom`
- `spades.heartbeat`

Every command must:

1. Resolve identity.
2. Confirm the player controls the room seat.
3. Validate room and game phase.
4. Validate turn ownership for bid/play.
5. Validate bid range or legal card.
6. Apply move in one transaction.
7. Store public state and private hand mutations separately.
8. Append accepted or rejected move audit.
9. Return caller-safe projection only.

## Transaction Model

Use a single transaction per accepted game command.

For `playCard`:

1. Lock `spades_games` row for update.
2. Load caller's `spades_player_hands` row.
3. Check `current_turn_seat`.
4. Check card is in caller hand.
5. Check legal Spades rules.
6. Remove card from caller hand.
7. Append card to public current trick.
8. Resolve trick if four cards are present.
9. Score round if hands are empty.
10. Increment `public_state_version`.
11. Insert `spades_moves`.
12. Return projection.

This prevents two clients from playing over the same turn.

## Caller-Safe Projection

The API response should be shaped like this:

```ts
type SpadesProjection = {
  room: {
    id: string;
    code: string;
    status: string;
    gameType: "spades";
    targetScore: number;
  };
  me: {
    userId: string;
    roomPlayerId: string;
    seatIndex: number;
    teamIndex: 0 | 1;
  };
  players: Array<{
    roomPlayerId: string;
    seatIndex: number;
    teamIndex: 0 | 1;
    displayName: string;
    avatarUrl: string | null;
    isBot: boolean;
    isHost: boolean;
    isConnected: boolean;
    cardCount: number;
    bid: number | null;
    tricksWon: number;
  }>;
  game: {
    id: string;
    phase: "waiting" | "bidding" | "playing" | "round_end" | "game_over";
    roundNumber: number;
    currentTurnSeat: number | null;
    leadSeat: number | null;
    spadesBroken: boolean;
    teamScores: [number, number];
    teamBags: [number, number];
    teamRoundBids: [number, number];
    teamRoundTricks: [number, number];
    currentTrick: Array<{ seatIndex: number; cardId: string }>;
    version: number;
  };
  private: {
    hand: string[];
    legalCards: string[];
    legalBids: number[];
  };
};
```

Only `private.hand` changes per caller.

## Identity Bridge

### Web

Web should use the Supabase Auth user resolved by `useSupabaseSession()` and profile hydration.

Shared room operations must use:

- `auth_user_id = auth.uid()`
- display name/avatar from `profiles`
- public profile UID from `profiles.public_profile_uid` if available

### TV

TV should use the activated session token when present.

Recommended path:

1. TV activation stores an access token in local/native session storage.
2. TV Spades sends that token to the same Spades command API.
3. Server validates token with Supabase Auth.
4. Server resolves `auth_user_id` and profile.
5. Server performs the command.

If a separate `tvDeviceToken` is introduced:

1. Store only a hashed token server-side.
2. Validate token in server code.
3. Resolve token to `auth_user_id`.
4. Never let the token directly query Supabase tables from the browser/WebView.

Guest IDs are allowed only for solo/offline play and must be blocked from shared room commands.

## Realtime Strategy

Use either polling or Supabase Realtime for public projections, but never broadcast private hands.

Recommended first implementation:

- Keep polling for `spades.getRoom` every 1-2 seconds for stability.
- Add Realtime later for public tables:
  - `spades_games`
  - `spades_moves`
  - `game_room_players`
- Do not put `spades_player_hands` in a realtime publication available to all clients.

If private hand changes need fast updates, clients should refetch caller projection after a public version change.

## Migration Strategy

PASS SPADES-3 should create a draft migration file only after this design is accepted.

Safe migration order:

1. Add identity columns to `game_room_players`.
2. Add `spades_games`, `spades_player_hands`, `spades_moves`, `spades_tricks`, `spades_score_events`.
3. Enable RLS immediately on all new public tables.
4. Add grants and policies.
5. Add command API wrappers.
6. Add tests that prove opponent hands are not visible.
7. Wire web Spades to command API.
8. Wire TV Spades to command API.
9. Retire direct client writes to `game_sessions.state_json` for Spades.

Do not drop legacy game table columns in the first secure migration.

## Required Tests

Database/API tests:

- Anonymous user cannot read or write Spades private hands.
- Authenticated non-participant cannot read room state for private room.
- Participant can read public projection.
- Participant can read only own hand.
- Participant cannot update `hand_json` directly.
- Participant cannot submit a bid for another seat.
- Participant cannot play out of turn.
- Participant cannot play a card not in hand.
- Participant cannot play an illegal suit when able to follow suit.
- TV token resolves to the same `auth_user_id` as web session.
- Web and TV joining the same code land in the same `game_rooms` row.

Client tests:

- Web create room, TV join by code.
- TV create room, web join by code.
- Same players, turns, scores, and bids appear on both clients.
- Opponent hands render as card counts only.
- D-pad can bid, select legal card, play card, open menu, and leave.

## PASS SPADES-3 Recommendation

PASS SPADES-3 should draft the additive migration and server command contract, but still avoid rebuilding the APK.

Recommended PASS SPADES-3 outputs:

- A migration draft under `supabase/migrations/` or a reviewed SQL draft under `docs/` if migration application is not approved.
- A TypeScript DTO file for shared Spades projections.
- A server command API design file or scaffold.
- Unit tests for rule validation and private-hand projection.

Do not wire TV UI until private-hand protection and command authority are in place.

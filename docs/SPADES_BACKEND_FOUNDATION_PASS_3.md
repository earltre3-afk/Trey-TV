# Spades Backend Foundation Pass 3

Date: 2026-05-28

## Scope

PASS SPADES-3 created local-only backend foundation files for one shared Spades system across Trey TV web and StreamingBox/TV.

This pass did not:

- rebuild the APK
- touch Android packaging
- change download paths
- touch Trey-I onboarding
- redesign UI
- wire the TV Spades UI
- deploy Edge Functions
- run Supabase migrations against remote
- weaken existing RLS
- expose private card hands
- create a second disconnected Spades game

Source of truth used: `docs/SPADES_SECURE_SHARED_BACKEND_PASS_2.md`.

## A. Migration Files Created

Created local migration draft:

- `supabase/migrations/20260528210000_create_spades_secure_state.sql`

The draft is additive only. It adds identity columns to `game_room_players` and creates:

- `public.spades_games`
- `public.spades_players`
- `public.spades_private_hands`
- `public.spades_actions`
- `public.spades_chat_messages`
- `public.spades_tricks`
- `public.spades_score_events`

No existing `game_*` table is dropped or destructively changed.

## B. Edge Function Skeletons Created

Created local-only Supabase Edge Function scaffolds:

- `supabase/functions/_shared/spadesCommand.ts`
- `supabase/functions/spades-room-create/index.ts`
- `supabase/functions/spades-room-join/index.ts`
- `supabase/functions/spades-room-state/index.ts`
- `supabase/functions/spades-action-submit/index.ts`
- `supabase/functions/spades-chat-send/index.ts`
- `supabase/functions/spades-room-leave/index.ts`

The skeletons parse JSON safely, handle CORS/options, support Supabase Auth bearer token resolution, represent the future `tvDeviceToken` path without trusting it client-side, and return no private hands. They return `not_implemented` until SPADES-4 wires the authoritative transaction/game-engine path.

## C. Shared Types Created

Created shared contracts:

- `src/features/games/spades/shared/spadesTypes.ts`

Includes:

- `SpadesGamePhase`
- `SpadesRoomStatus`
- `SpadesSeat`
- `SpadesPublicState`
- `SpadesPrivateHandProjection`
- `SpadesCallerProjection`
- `SpadesActionType`
- `SpadesActionPayload`
- `SpadesCommandResponse`
- `SpadesSyncMode`

The public projection contract carries player card counts and public trick/score state only. It does not include full hands.

## D. Projection Helpers Created

Created projection helper:

- `src/features/games/spades/shared/spadesProjection.ts`

Functions:

- `buildPublicSpadesProjection`
- `buildCallerSpadesProjection`
- `redactPrivateHands`
- `assertNoPrivateHandLeak`
- `validateSpadesActionPayload`
- `representOutOfTurnRejection`
- `seatFromNumber`
- `emptyPublicState`

## E. Private-Hand Leak Prevention

Private hands are separated into `spades_private_hands` in the migration draft. The TypeScript projection layer intentionally distinguishes:

- public state: room, game phase, scores, trick cards already played, player card counts
- caller private state: only the caller's hand, legal cards, and legal bids

`assertNoPrivateHandLeak` rejects public projection objects that include private-hand-shaped keys such as `hand`, `hands`, `privateHand`, `privateHands`, `encrypted_or_private_hand`, or `encryptedOrPrivateHand`.

Created local projection tests:

- `src/features/games/spades/shared/spadesProjection.test.ts`

Covered cases:

- public projection does not include private hands
- caller projection includes only caller hand
- other players' hands are redacted
- invalid action shape is rejected
- out-of-turn rejection is represented in command contract
- TV token sync mode is represented but still requires a real server-resolved user id

The repo has no root `test` script, so these tests were created but not executed by an existing runner.

## F. RLS Assumptions

The migration draft enables RLS on every new Spades table and adds no anon grants or anon policies.

Draft policy intent:

- authenticated members can read public Spades state for games they joined
- authenticated users can read only their own private hand row
- authenticated users can insert actions only as their own Spades player
- authenticated users can insert chat only as their own Spades player
- service role remains server-side only for command processing
- TV token flow must go through Edge Function wrappers, not direct anon table access

Important review note: the draft helper predicates use controlled `SECURITY DEFINER` functions to avoid recursive RLS lookups on `spades_players`. They set a fixed `search_path`, revoke `PUBLIC`/`anon` execution, and grant execution only to `authenticated`, but this should receive explicit database-security review before applying.

Open RLS review item: `spades_actions_own_insert` is intentionally narrow but may still be removed in SPADES-4 if all action writes are kept server-only.

## G. What Was Intentionally Not Deployed

Nothing was deployed.

Not run:

- `supabase db push`
- `supabase migration up`
- `supabase functions deploy`
- any APK build command
- any Android Gradle command

No remote database or production route was changed.

## H. What Needs Review Before Migration Push

Before any migration is applied:

- review `SECURITY DEFINER` helper functions and decide whether to move them to a non-exposed schema
- verify `game_room_players` identity additions against existing data and policies
- decide whether `spades_actions` direct authenticated insert should remain or become service-role-only
- add migration tests for anon denial, nonparticipant denial, participant read, own-hand-only read, and direct private-hand write denial
- confirm Edge Function transaction model for room create/join/action submit
- decide whether private hands should stay in `public.spades_private_hands` with strict RLS or move to an `app_private` schema
- generate/update typed Supabase database types after migration review

## I. Recommended PASS SPADES-4

Recommended PASS SPADES-4 scope:

- review and harden the migration draft
- add local database/RLS tests where project tooling supports them
- implement server-authoritative transaction logic in the Edge Function skeletons
- integrate the existing `spadesEngine` without letting clients patch full game state
- validate Supabase Auth and TV activation/device-token identity bridge server-side
- return real caller-safe projections from `spades-room-state`
- keep TV UI wiring for a later pass after command APIs are proven

## Validation

`npm run build`:

- Passed after rerun with a longer timeout.
- First attempt timed out at about 124 seconds.
- Vite reported existing warnings about large chunks and a dynamic/static import overlap in interactive stories.

`npm run lint`:

- Failed.
- `npm run lint -- --quiet` shows 11 errors, all inside existing generated backup output under `.vercel-pass4h5-backup-20260527172517`.
- The errors are missing lint rule definitions in generated `.mjs` files, not new Spades files.

`npx tsc --noEmit --pretty false`:

- Failed with existing unrelated errors.
- Main groups: `PostCard` missing `busyAction`/`setBusyAction`, existing game table fetcher option type mismatches, interactive-stories/prescribe-me fetcher option mismatches, natural ability generated type mismatches, Trey-I/onboarding Supabase type mismatches, and settings/natural ability typing.
- No TypeScript errors were reported for the new `src/features/games/spades/shared/*` files.

## Result

PASS SPADES-3 is safe to review for SPADES-4, but not safe to apply remotely yet.

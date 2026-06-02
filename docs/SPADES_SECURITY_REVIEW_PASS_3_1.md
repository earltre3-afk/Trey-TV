# Spades Security Review Pass 3.1

Date: 2026-05-28

## Scope

PASS SPADES-3.1 reviewed and locally hardened the Spades backend foundation created in PASS SPADES-3.

This pass did not rebuild the APK, touch Android packaging, change download paths, touch Trey-I onboarding, redesign UI, wire TV Spades UI, deploy Edge Functions, apply remote migrations, weaken RLS, or expose private hands.

Reviewed files:

- `supabase/migrations/20260528210000_create_spades_secure_state.sql`
- `supabase/functions/_shared/spadesCommand.ts`
- `supabase/functions/spades-room-create/index.ts`
- `supabase/functions/spades-room-join/index.ts`
- `supabase/functions/spades-room-state/index.ts`
- `supabase/functions/spades-action-submit/index.ts`
- `supabase/functions/spades-chat-send/index.ts`
- `supabase/functions/spades-room-leave/index.ts`
- `src/features/games/spades/shared/spadesProjection.ts`
- `src/features/games/spades/shared/spadesProjection.test.ts`

## A. Migration Safety Review

Result: locally safer after hardening, but still not ready to apply remotely without DB advisor/local RLS tests.

Confirmed:

- Additive only.
- No `TRUNCATE`.
- No destructive `DELETE`.
- No table/column drops.
- `DROP POLICY IF EXISTS` is present only to make local policy replacement idempotent.
- New tables all enable RLS.
- No anon grants or anon policies are added.
- Existing `game_*` tables are not loosened.
- Existing open prototype `game_*` policies are not changed in this pass.

New tables:

- `spades_games`
- `spades_players`
- `spades_private_hands`
- `spades_actions`
- `spades_chat_messages`
- `spades_tricks`
- `spades_score_events`

Hardening added in this pass:

- `spades_games.public_state` now has a top-level JSON key guard against obvious private-hand keys.
- `spades_actions.action_payload` now has the same top-level JSON key guard.
- Direct authenticated inserts into `spades_actions` and `spades_chat_messages` were removed from the draft grants/policies so command writes stay server-authoritative.

## B. SECURITY DEFINER Helper Review

Reviewed helpers:

- `public.is_spades_game_participant(uuid)`
- `public.is_spades_player_owner(uuid)`

Result: acceptable as a draft pattern only because they return booleans, have no dynamic SQL, do not expose private rows, and are now more tightly documented. They should still receive DB security review before remote application.

Confirmed:

- Return type is `boolean`.
- They do not return cards, hands, rows, JSON, or private state.
- They do not accept table names, column names, SQL snippets, or other dynamic identifiers.
- They scope checks to `(select auth.uid())`.
- They exclude bots from ownership checks.
- They are used only for membership/ownership predicates.
- `PUBLIC` and `anon` execute are revoked.
- `authenticated` execute is granted explicitly.

Hardening added:

- `set search_path = public` became `set search_path = public, pg_temp`.
- Comments now explain why `SECURITY DEFINER` is used: to avoid recursive RLS lookups on `spades_players` policies.

Remaining helper risk:

- Supabase guidance treats `SECURITY DEFINER` as sensitive because it bypasses RLS with the function owner privileges. These helpers are intentionally tiny, but a safer long-term option is moving them into a non-exposed schema or replacing them after local advisor testing.

## C. RLS Risk Notes

Current draft posture:

- `spades_games`: participant read only; no direct authenticated writes.
- `spades_players`: participant read only.
- `spades_private_hands`: owner read only; no direct authenticated writes.
- `spades_actions`: participant read; no direct authenticated insert/update/delete after this pass.
- `spades_chat_messages`: participant read; no direct authenticated insert/update/delete after this pass.
- `spades_tricks`: participant read only.
- `spades_score_events`: participant read only.

Key risks still requiring review:

- Existing generic `game_*` tables have prototype-era open policies. This migration does not weaken them, but SPADES-4 should not rely on those open policies for secure multiplayer.
- `public_state` and `action_payload` guards catch obvious top-level private-hand keys only. They are defense in depth, not a replacement for server projection tests.
- Service role must remain server-only in Edge Functions.
- `spades_private_hands` remains in `public` with strict RLS. Moving private hands to a non-exposed schema remains the stronger future boundary.

## D. Private-Hand Protection Review

Result: projection layer is aligned with the Pass 2 design.

Confirmed:

- `buildPublicSpadesProjection` returns room, public game state, and public player summaries only.
- Public player summaries expose `cardCount`, not hand arrays.
- `buildCallerSpadesProjection` includes only the caller's private hand in `projection.private.hand`.
- Other players' private hands are not returned in caller projections.
- `assertNoPrivateHandLeak` scans public projection areas for private-hand-shaped keys.
- `redactPrivateHands` removes private-hand-shaped keys recursively.
- Cross-app private card storage is not reusing `game_sessions.state_json`.

Test hardening added:

- `testPublicProjectionRejectsPrivateHandKeysInGameState` verifies public projection construction rejects a future accidental `privateHands` field in game state.

Limit:

- The test file compiles with the repo but is not executed by a root test script because the repo currently has no `test` script.

## E. Edge Function Skeleton Review

Result: safe as local skeletons; not yet sufficient for production commands.

Confirmed:

- No functions are deployed.
- Service role key is read only from server-side function environment.
- No hardcoded secrets.
- Supabase Auth bearer token path calls `auth.getUser(token)` server-side.
- `tvDeviceToken` path is represented but not trusted as a resolved user.
- Functions return `not_implemented`, not fake success.
- Responses do not include private hands.
- Action submit accepts only known action names and validates payload object shape.
- TODOs call out server-side membership, transaction, turn, legal move, and caller-safe projection requirements.

Not yet implemented:

- real room membership checks inside the skeletons
- duplicate command detection
- turn/order validation
- legal-card validation
- transaction locking
- game engine integration
- caller-safe DB projection assembly

## F. Changes Made

Modified:

- `supabase/migrations/20260528210000_create_spades_secure_state.sql`
- `src/features/games/spades/shared/spadesProjection.test.ts`

Created:

- `docs/SPADES_SECURITY_REVIEW_PASS_3_1.md`

Specific hardening:

- added `pg_temp` to SECURITY DEFINER helper `search_path`
- removed direct authenticated insert grants for actions and chat
- removed direct action/chat insert policy creation from the draft
- added JSON key guards for public state and action payload
- added a projection leak test for accidental private-hand keys in game state

## G. Remaining Risks

- Remote migration is not safe until local DB/advisor/RLS tests verify the policies against real Postgres behavior.
- `SECURITY DEFINER` helpers are still a sensitive pattern, even though these return booleans only.
- Existing `game_*` open policies still need a compatibility-aware hardening pass before real multiplayer launch.
- Top-level JSON key guards do not detect deeply nested private-hand keys.
- Edge Functions still need real transaction implementation and must keep service role server-side.
- TV device token validation is not implemented yet and must not be trusted client-side.

## H. SPADES-4 Remote Migration Decision

Safe to proceed to SPADES-4 implementation planning: yes.

Safe to apply this migration remotely immediately: no.

Recommended SPADES-4 before remote migration:

- run local Supabase DB/advisor checks if available
- add RLS tests for anon denial, nonparticipant denial, participant public read, own-hand-only private read, and direct private/action/chat write denial
- consider moving helper functions and/or private hands into a non-exposed schema
- implement Edge Function command transactions locally before exposing clients to the new tables

## Validation

`npm run build`:

- Passed.
- Existing Vite warnings remain for chunk size and interactive-stories dynamic/static import overlap.

`npm run lint`:

- Passed with warnings.
- Warnings are existing React refresh/hooks and unused eslint-disable warnings.

`npx tsc --noEmit --pretty false`:

- Failed with existing unrelated errors.
- Main groups remain feed `busyAction`/`setBusyAction`, game fetcher option typing, interactive-stories/prescribe-me fetcher typing, natural ability generated Supabase type mismatches, Trey-I/onboarding Supabase type mismatches, and settings/natural ability typing.
- No new Spades projection/test TypeScript errors were reported.

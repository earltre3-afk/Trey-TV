# Spades Cross-App Sync Pass 1

Date: 2026-05-28

## Scope Guardrails

PASS SPADES-1 was inspection, planning, and safe validation only.

- No APK rebuild was performed.
- No Android packaging files were intentionally changed.
- No download path was changed.
- No Trey-I onboarding work was performed.
- No auth behavior was changed.
- No RLS was changed.
- No migrations were run.
- No fake second Spades game was created.

PASS 4I remains the locked Android TV working APK baseline:

- APK: `public/downloads/trey-tv-streamingbox-debug.apk`
- Package id: `com.treytv.streamingbox`
- SHA256: `727C3BC9D17FA20E1DCFA174C181E5D5B0B01961D55D16C9578603B39A29628F`

## Files Inspected

Main Trey TV web Spades and game room:

- `src/routes/games.spades.tsx`
- `src/routes/games.index.tsx`
- `src/routes/games.tsx`
- `src/features/games/GameRoomRouteMount.tsx`
- `src/features/games/GameRoomModule.tsx`
- `src/features/games/components/GameRoomHome.tsx`
- `src/features/games/components/spades/SpadesTable.tsx`
- `src/features/games/components/lounge/CreateJoinModals.tsx`
- `src/features/games/components/lounge/RoomLobby.tsx`
- `src/features/games/components/lounge/QueueScreen.tsx`
- `src/features/games/components/lounge/FriendInviteCenter.tsx`
- `src/features/games/components/lounge/GameRequestsInbox.tsx`
- `src/features/games/hooks/useRealtimeRoom.ts`
- `src/features/games/hooks/useChat.ts`
- `src/features/games/lib/spades/spadesEngine.ts`
- `src/features/games/lib/services/identity.ts`
- `src/features/games/lib/services/roomService.ts`
- `src/features/games/lib/services/matchmakingService.ts`
- `src/features/games/lib/services/socialService.ts`
- `src/features/games/lib/services/chatService.ts`
- `src/features/games/lib/gameBackend.ts`
- `src/features/games/README.md`

TV shell and StreamingBox Spades:

- `apps/trey-tv-web/src/App.tsx`
- `apps/trey-tv-web/src/pages/Index.tsx`
- `apps/trey-tv-web/src/components/AppLayout.tsx`
- `apps/trey-tv-web/src/features/tv-shell/TVContext.tsx`
- `apps/trey-tv-web/src/features/tv-shell/mockData.ts`
- `apps/trey-tv-web/src/features/tv-shell/screens/GamesScreen.tsx`
- `apps/trey-tv-web/src/features/tv-shell/screens/SpadesScreen.tsx`
- `apps/trey-tv-web/src/features/tv-shell/screens/ActivationScreen.tsx`
- `apps/trey-tv-web/src/features/tv-shell/hooks/useFocusGrid.ts`
- `apps/trey-tv-web/src/features/tv-shell/components/FocusManager.tsx`
- `apps/trey-tv-web/src/features/tv-shell/components/TVFrame.tsx`
- `apps/trey-tv-tv/app/src/main/java/com/treytv/tv/ui/screens/WebShellScreen.kt`
- `apps/trey-tv-tv/app/src/main/java/com/treytv/tv/data/TreySessionStore.kt`
- `apps/trey-tv-tv/app/src/main/java/com/treytv/tv/data/LiveTreyTvApiService.kt`

Supabase and identity/backend surface:

- `supabase/migrations/20260514100000_create_game_tables.sql`
- `supabase/migrations/20260518013000_add_truno_game_type.sql`
- `supabase/migrations/20260518051800_truno_game_tables.sql`
- `supabase/migrations/20260520235620_tv_device_sessions.sql`
- `supabase/migrations/20260528120000_tv_device_pairing.sql`
- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts`
- `src/lib/supabase.ts`
- `src/lib/supabase-browser.ts`
- `src/lib/supabase-session.tsx`
- `src/lib/auth.tsx`
- `src/lib/tv/tv-api.server.ts`
- `api/tv/device/start.ts`
- `api/tv/device/status.ts`
- `api/tv/device/approve.ts`
- `src/routes/tv.activate.tsx`

## Current Implementation Status

### Main/Web Spades

Main Trey TV Spades is partially real and partially unsafe for final multiplayer sync.

What is real:

- `/games/spades` mounts `GameRoomRouteMount` with `initialView="spades"`.
- `SpadesTable` supports local solo mode and server room mode.
- `spadesEngine.ts` contains actual Spades rules for deck deal, bidding, legal card selection, trick resolution, scoring, bags, round advance, and bot moves.
- `GameRoomModule` supports creating rooms, joining by code, lobbies, queue, invites, inbox, and direct solo launch.
- `roomService.ts` writes shared room/session/move rows to Supabase tables.
- `RoomLobby` uses Supabase realtime `postgres_changes` for lobby/player/session changes.
- `useRealtimeRoom` polls shared session rows every 2 seconds and records moves.

What is not production-ready:

- Multiplayer state is stored as full `state_json` in `game_sessions`.
- Full `state_json` includes every player's hand.
- If clients can read `game_sessions.state_json`, private hands are exposed.
- Move validation is client-driven. Any client can write a new session state through the current client service layer.
- The current game RLS policy is open for all operations.
- Guest/local IDs are still allowed through `getOrCreateIdentity()`.
- `recordMove()` uses a client-side move counter, not a canonical server-side sequence.
- `useRealtimeRoom` is polling-based, despite README language that mentions per-room realtime channels.

### TV/StreamingBox Spades

TV Spades is currently a separate mock visual screen.

Evidence:

- `apps/trey-tv-web/src/features/tv-shell/screens/GamesScreen.tsx` routes the Spades game tile to the TV shell screen `spades`.
- `apps/trey-tv-web/src/features/tv-shell/screens/SpadesScreen.tsx` contains static `hand` and `chat` arrays.
- The TV Spades screen hardcodes scores, bids, player names, stakes, chat, tournament copy, and center-table cards.
- It does not import `spadesEngine.ts`.
- It does not call `roomService.ts`.
- It does not read or write `game_rooms`, `game_room_players`, `game_sessions`, or `game_moves`.
- It does not join by room code.
- It does not receive turns, scores, hands, invites, or room state from the main Trey TV Spades backend.

Conclusion: TV Spades is a polished mock/playable-looking shell, not the same game system as main web Spades yet.

## Current Game State Location

Main web Spades:

- Solo mode state lives in React component state inside `LocalSpades`.
- Multiplayer mode state lives in `public.game_sessions.state_json`.
- Room membership lives in `public.game_rooms` and `public.game_room_players`.
- Moves are appended to `public.game_moves`.
- Queue and social/invite records live in `public.game_queue_entries`, `public.game_friends`, and `public.game_requests`.

TV Spades:

- State is local React `useState` selection only for the highlighted mock card.
- The displayed hand, chat, scores, bids, player list, and table state are hardcoded constants in `SpadesScreen.tsx`.

## Backend And Source-Of-Truth Findings

Existing shared game tables:

- `game_rooms`
- `game_room_players`
- `game_sessions`
- `game_moves`
- `game_queue_entries`
- `game_friends`
- `game_requests`

Tables searched for but not found as implemented Spades-specific source-of-truth tables:

- `spades_rooms`
- `game_state`
- `multiplayer_rooms`
- `game_invites`
- `user_game_stats`
- dedicated `spades_*` tables

Nearby related backend:

- `tv_device_sessions` exists for TV device session storage, with RLS enabled and no anon/authenticated grants.
- `tv_device_pairing` exists for device-code activation. It is service-role-only by design, with RLS enabled and no public policies.
- `api/tv/device/start.ts`, `status.ts`, and `approve.ts` use service-role wrappers for activation and token handoff.

Important security finding:

`20260514100000_create_game_tables.sql` enables RLS on the game tables but then creates open policies:

- `for all using (true) with check (true)`
- `grant all ... to anon, authenticated, service_role`

This is acceptable only as an early prototype. It is not acceptable for shared real multiplayer with private hands, authenticated identities, scores, or invite integrity.

## Source-Of-Truth Recommendation

There should be one shared Spades system. Do not create a second disconnected TV game.

Recommended source of truth:

- Reuse the existing shared room model as the base: `game_rooms`, `game_room_players`, `game_sessions`, `game_moves`, `game_requests`.
- Add hardened Spades-specific tables or fields only where the generic model cannot safely represent private state.
- Move authoritative game mutation to server-side wrappers or database functions.
- Treat the main Spades engine as the rule implementation, but do not trust client-produced final state.

Recommended shape:

1. Keep `game_rooms` as the shared room/invite-code table.
2. Keep `game_room_players` as shared room membership and seat assignment.
3. Keep `game_moves` as the append-only move ledger.
4. Replace full-client-readable `game_sessions.state_json` for Spades with a safe public projection plus private per-player hand rows.
5. Expose room state through server wrappers/RPCs that return different projections depending on the requesting user/TV session.

Additive schema proposal for PASS SPADES-2 or later, not applied in this pass:

- `spades_games`
  - `id`
  - `room_id`
  - `session_id`
  - `status`
  - `phase`
  - `round_number`
  - `dealer_seat`
  - `lead_seat`
  - `current_turn_seat`
  - `spades_broken`
  - `target_score`
  - `team_scores`
  - `team_bags`
  - `team_round_bids`
  - `team_round_tricks`
  - `public_state_json`
  - `created_at`
  - `updated_at`

- `spades_player_hands`
  - `game_id`
  - `room_player_id`
  - `user_id`
  - `seat_index`
  - `hand_json`
  - `card_count`
  - `updated_at`

- `spades_tricks`
  - `id`
  - `game_id`
  - `round_number`
  - `trick_number`
  - `lead_seat`
  - `winning_seat`
  - `cards_json`
  - `completed_at`

- `spades_moves`
  - `id`
  - `game_id`
  - `room_id`
  - `session_id`
  - `room_player_id`
  - `user_id`
  - `seat_index`
  - `move_number`
  - `move_type`
  - `move_payload`
  - `accepted`
  - `rejection_reason`
  - `created_at`

The exact schema can be refined, but the critical rule is this: private hand data must not live in a client-readable all-player JSON blob.

## Identity Bridge Recommendation

Current web identity:

- `GameRoomRouteMount` uses `useAuth()`.
- If a non-guest user exists, it passes `user.uid`, display name, handle, public profile UID, and avatar into `GameRoomModule`.
- If not, `identity.ts` falls back to `localStorage` guest IDs like `guest-...`.

Current TV identity:

- The TV shell has a device activation flow.
- `ActivationScreen.tsx` calls `https://tv.treytrizzy.com/api/tv/device/start`.
- The TV polls `status` and stores `trey_tv_token` in localStorage when approved.
- Native Android has `TreySessionStore` and `LiveTreyTvApiService` surfaces for device-code status/token storage.
- Current TV Spades does not consume that identity for Spades.

Recommendation:

- Prefer Supabase Auth session when available.
- For TV, use the approved TV activation token/session when present.
- If the TV cannot safely expose/use a Supabase browser session directly, use server-side API wrappers that accept a TV device/session token and resolve it to the real Supabase `user_id`.
- Do not use random local IDs for real multiplayer.
- Keep guest/local IDs only for solo/offline play, never for shared rooms, scores, invites, or turn authority.

If using `tvDeviceToken` or `device_code`-derived session:

- Add server-side Edge Function or API wrappers for Spades operations.
- Validate the TV token server-side against `tv_device_sessions` or the active pairing/session table.
- Resolve `user_id` and profile display fields server-side.
- Perform room create, join, bid, play-card, heartbeat, and leave operations through those wrappers.
- Return only the caller-safe Spades projection.

## Security And RLS Notes

Do not weaken RLS. The next pass should strengthen it.

Current risk areas:

- Open game table RLS allows broad read/write access.
- `game_sessions.state_json` exposes all hands.
- Client services write state directly.
- `game_moves` does not enforce turn order or seat ownership.
- `game_room_players.user_id` is `text`, which allows guest IDs and bot IDs mixed with real user IDs.

Recommended security direction:

- Keep RLS enabled.
- Replace open `using (true)` write policies with ownership/participant policies.
- Use `auth.uid()` for real web users.
- Use service-role server wrappers only where needed for TV token resolution.
- Do not expose service-role keys to TV or browser clients.
- Use server-side move validation for bid/play-card/start/next-round.
- Restrict private hand rows so only the owning player, or a validated server function, can read them.
- Keep public room metadata readable enough for join-code UX, but protect private rooms and player-specific data.

## Private-Hand Protection

Required before real cross-app multiplayer:

- Never send all four hands to every client.
- Store each hand in a per-player private row or encrypted/private payload.
- Return public state with only card counts for opponents.
- Return the current user's hand only after verifying the user controls that seat.
- For TV, resolve the active TV session to a real user before returning hand data.
- Bots can be server-owned seats; their hands should still not be included in public client payloads unless the server needs to render them for a local solo/offline mode.

## D-Pad And TV Control Notes

Existing TV shell:

- TV shell has D-pad focus infrastructure in `useFocusGrid.ts`, `FocusManager.tsx`, and focusable buttons.
- `SpadesScreen.tsx` is visually TV-safe but uses static state.

Existing main Spades:

- `SpadesTable.tsx` already imports `useTvRemoteInput` and `useTvRemoteMode`.
- It supports BACK, MENU, LEFT/RIGHT card selection, SELECT to bid/play, and SELECT for round/game-over actions.
- This can become the shared TV gameplay control model once TV uses the same backend/state projection.

Recommendation:

- Do not duplicate rules in `apps/trey-tv-web`.
- Add a TV-safe Spades client adapter that consumes the same backend projection as web.
- Keep D-pad actions mapped to the same commands: create room, join code, ready/start, bid, select card, play card, chat quick action, leave table.
- Use larger hit targets and deterministic focus order for TV.

## Recommended Sync Architecture

Shared flow:

1. Web or TV creates a Spades room through a server-validated API.
2. Backend creates `game_rooms` and host `game_room_players` rows.
3. Backend returns room code and caller-safe room projection.
4. Web or TV joins by room code through the same API.
5. Backend validates identity, assigns seat, and returns room/player projection.
6. Starting the game creates a Spades session/game and deals private hands server-side.
7. Clients subscribe or poll for public room/game projection.
8. Player actions are submitted as commands, not full replacement state.
9. Backend validates seat ownership, phase, turn, legal bid/card, and applies the move.
10. Backend writes move ledger, updates public state, updates private hand rows, and emits/publishes changes.
11. Web and TV render the same room, turns, scores, and join codes from the same backend state.

Client surfaces:

- Main web can continue using `GameRoomModule` and `SpadesTable`, but should receive a safe projection rather than full `SpadesState`.
- TV shell should replace the mock `SpadesScreen` data with the same projection and command APIs.
- Both clients should share DTOs/types for room summary, player seats, public Spades state, private hand, legal actions, and move results.

## Current Blockers To Shared Sync

- TV Spades is disconnected mock UI.
- Main web Spades still allows local solo/guest identity for shared room creation.
- Existing game table RLS is open.
- Full Spades state includes private hands in one JSON blob.
- Client code mutates `game_sessions.state_json` directly.
- No server-authoritative move validator exists for Spades.
- TV activation token is stored, but TV Spades does not currently use it to resolve a real player.
- Root TypeScript currently fails, including current Spades fetcher typing and unrelated onboarding/feed/natural-ability issues.

## Validation Results

Commands run:

- `npm run build`
- `npm run lint`
- `npx eslint . --quiet`
- `npx tsc --noEmit --pretty false`

Build result:

- `npm run build` passed.
- Vite warnings observed:
  - `src/features/interactive-stories/lib/playthroughs.ts` is both dynamically and statically imported.
  - Some chunks are larger than 500 kB after minification.

Lint result:

- `npm run lint` failed: 266 problems, 11 errors, 255 warnings.
- Actual blocking errors from `npx eslint . --quiet` are in `.vercel-pass4h5-backup-20260527172517/output/...`.
- The lint errors are missing-rule errors inside a checked-in/generated Vercel backup output folder, not new Spades implementation errors.
- Numerous existing warnings remain across `.claude/worktrees` and root source files.

TypeScript result:

- `npx tsc --noEmit --pretty false` failed.
- Spades-related error:
  - `src/features/games/components/spades/SpadesTable.tsx(64,46)` has a server function/fetcher call shape mismatch: object literal includes `state`, but the inferred type expects a TanStack-style required fetcher data options object.
- Related game errors:
  - `src/features/games/components/bullshit/BullshitTable.tsx` has the same fetcher call-shape issue and rank typing issues.
- Unrelated existing errors include:
  - `src/components/feed/PostCard.tsx` missing `busyAction` / `setBusyAction`.
  - `src/features/interactive-stories/lib/storyEngine.ts` fetcher call-shape issue.
  - `src/features/prescribe-me/PrescribeMeApp.tsx` fetcher call-shape and variable order issues.
  - `src/lib/tests/naturalAbilityStorage.ts` missing generated Supabase types for `natural_ability_results`.
  - `src/lib/trey-i/vertex.server.ts` missing `AIResult`, implicit `any`, and undefined `answers`.
  - `src/routes/__root.tsx` and onboarding routes have generated Supabase type mismatches for onboarding tables.
  - `src/routes/settings.tsx` natural ability indexing errors.

No unrelated issues were fixed in this pass.

## Recommended PASS SPADES-2 Scope

PASS SPADES-2 should be a backend design and safety pass before UI wiring.

Recommended scope:

1. Decide whether to harden existing generic `game_*` tables or add Spades-specific private-state tables.
2. Draft additive migration only; do not replace the working TV APK.
3. Define server-side Spades command API:
   - create room
   - join by code
   - start game
   - get room projection
   - bid
   - play card
   - leave/heartbeat
4. Define TV identity resolver:
   - Supabase Auth session first
   - TV activation/session token fallback through service-role server wrapper
   - no random local IDs for shared multiplayer
5. Define RLS policies for room membership, moves, public projections, and private hands.
6. Add tests for:
   - private hand visibility
   - seat ownership
   - invalid turn rejection
   - invalid card rejection
   - same room code joining from web and TV identity paths
7. Only after backend shape is approved, wire TV `SpadesScreen` to the shared API in PASS SPADES-3.

Do not begin TV UI replacement until the shared backend and private-hand protection are settled.

# Social Universe Wiring — Requirements & Audit

**Project:** TREY-TV-ANTIGRAVITY  
**Branch:** `lovable-shell-backend-wiring`  
**Audit date:** 2026-05-10  
**Scope:** Google auth, profiles, follows, inbox/messages, comments, reactions, notifications

---

## Audit Summary by Feature Area

### 1. Google Authentication

**Current state: PARTIALLY WIRED — mock session layer still active**

| Item | Status | Detail |
|------|--------|--------|
| `useAuth` (hooks/use-auth.ts) | ✅ Real | Supabase `getSession` + `onAuthStateChange` — returns real Supabase `User` |
| `AuthProvider` (lib/auth.tsx) | ⚠️ Mock | Lovable mock session layer — `signIn(role)` builds a fake `SessionUser` from `mock-data.ts`; `role` stored in localStorage |
| `SupabaseSessionProvider` (lib/supabase-session.tsx) | ✅ Real | Wraps `supabase.auth.onAuthStateChange`; exposes `isRealAdmin` from `admin_users` table |
| `useCurrentUser` (hooks/use-current-user.ts) | ✅ Real | Fetches real `profiles` row by `auth.uid()`; falls back to `mock-data.ts` `currentUser` if not signed in |
| `CurrentUserSync.tsx` | ✅ Real | Pushes real Supabase profile into Lovable `AuthProvider` |
| Google OAuth in `login.tsx` | ⚠️ Partial | Calls `lovable.auth.signInWithOAuth("google", ...)` — uses Lovable Cloud auth wrapper, not direct `supabase.auth.signInWithOAuth`. Works in Lovable Cloud; behavior in standalone Cloudflare Workers deployment needs verification |
| Email/password login | ✅ Real | Calls `supabase.auth.signInWithPassword` directly |
| `/signup` route | ✅ Redirects | Redirects to `/login` — correct |
| Post-auth redirect | ✅ Real | `sessionStorage.getItem("treytv_post_auth_redirect")` — standard pattern |
| New Google user → onboarding | ❌ Not wired | No `onAuthStateChange` handler routes new users to `/onboarding`. A new Google sign-in lands on `/` regardless of `onboarding_completed` status |
| Dual Supabase client | ⚠️ Risk | `src/integrations/supabase/client.ts` (Lovable-generated, uses `VITE_SUPABASE_PUBLISHABLE_KEY`) and `src/lib/supabase-browser.ts` (project-standard, uses `VITE_SUPABASE_ANON_KEY`) both exist. `login.tsx` and `supabase-session.tsx` use the Lovable client; all real hooks use `supabase-browser.ts`. Both point to the same project but are separate instances |

**Key gap:** New users who sign in with Google are not routed to onboarding. The `onboarding_completed` field on `profiles` is never checked after auth.

---

### 2. Profiles

**Current state: MOSTLY REAL**

| Item | Status | Detail |
|------|--------|--------|
| `useProfile(publicUid)` | ✅ Real | SELECT by `public_profile_uid`; returns `id, public_profile_uid, display_name, username, avatar_url, banner_url, bio, location, created_at, profile_accent_color` |
| `useCurrentUser()` | ✅ Real | SELECT by `auth.uid()`; maps to `SessionUser`; falls back to mock if not signed in |
| `ProfilePageShell` | ✅ Real | Prop-driven; no direct Supabase queries in components |
| `u.$uid.tsx` routing | ✅ Real | Routes by `public_profile_uid`; resolves `viewerRole` from auth session |
| `edit-profile.tsx` | ✅ Real | Writes `display_name, username, bio, location, profile_accent_color` |
| Username uniqueness | ✅ DB-enforced | `profiles.username` has `UNIQUE` constraint + format check `^[a-z0-9_]{3,30}$` |
| Username search | ❌ Not wired | No user search by username or display name in any route or hook |
| Profile visibility (`profile_visibility`) | ⚠️ Partial | Column exists in schema; not read in `useProfile` or `ProfilePageShell` — all profiles treated as public |
| `profiles.role` | ✅ Read | Used in `useCurrentUser` for `isAdmin`/`isCreator` gating |
| `profiles.is_creator` | ✅ Banned | Correctly excluded from all queries |
| `profiles.age` / `date_of_birth` | ✅ Banned | Not queried anywhere |
| Normal user vs creator modules | ✅ Real | `ProfilePageShell` renders `NormalUserProfileModules` or `CreatorProfileModules` based on `profileType` |
| Owner controls | ✅ Real | `ProfileOwnerControls` vs `PublicProfileControls` based on `viewerRole` |
| Follower/following counts | ❌ Not wired | `profiles.follower_count` and `profiles.following_count` exist in schema but are not read; `ProfileStatsBar` uses mock stats from `SessionUser.stats` |

---

### 3. Follows / Friends / Connections

**Current state: PARTIALLY REAL — optimistic writes work; read path has mock contamination**

| Item | Status | Detail |
|------|--------|--------|
| `follow-store.tsx` | ⚠️ Partial | DB reads: SELECT from `follows` JOIN `profiles` on sign-in ✅. DB writes: INSERT/DELETE `follows` for real profile IDs ✅. Mock contamination: seeds from `mock-data.ts creators[]`; merges local mock follows with DB follows |
| `follows` table | ✅ Real | `(follower_id, following_id)` PK; `follows_not_self` constraint; RLS: public SELECT, authenticated INSERT/DELETE own rows |
| Follow/unfollow toggle | ✅ Real | Optimistic update + DB write; rollback on error; self-follow guard |
| Real profile ID detection | ⚠️ Fragile | `isRealProfileId` checks `PUBLIC_UID_RE = /^\d{10,}$/` — matches `public_profile_uid` format. But `toggle()` receives `c.id` which is `public_profile_uid`, then resolves to `profiles.id` (UUID) via a SELECT. This is correct but the regex guard is on `public_profile_uid`, not `profiles.id` |
| Friends model | ✅ Clarified | Trey TV uses **one-way follows** (not mutual friends). `friend_requests` table exists in schema but is not used in ANTIGRAVITY. "Friends" in UI = mutual follows (both follow each other) — not enforced at DB level |
| Followers/following surfaces | ❌ Not wired | No route or component lists followers or following for a profile |
| User search by username | ❌ Not wired | `ensureFromHandle` in `messages-store.tsx` does a single-row lookup by `username` but there is no general search UI |
| `bumpWatch` / `topThree` | ⚠️ Local only | `watchScore` is localStorage-only; `topThree` is derived from local mock follows only |
| SEED contamination | ⚠️ Active | `FollowProvider` seeds from `creators.slice(0, 3)` — mock creators appear in followed list for all users |

---

### 4. Inbox / Messages

**Current state: PARTIALLY REAL — send/receive works; several surfaces still mock**

| Item | Status | Detail |
|------|--------|--------|
| `messages-store.tsx` | ⚠️ Partial | DB fetch: SELECT `direct_messages` JOIN `profiles` on sign-in ✅. DB send: INSERT `direct_messages` for UUID thread IDs ✅. DB mark-read: UPDATE `read_at` ✅. Mock contamination: seeds from `mock-data.ts creators[]`; SEED_THREADS/SEED_MSGS shown before sign-in |
| `direct_messages` table | ✅ Real | `sender_id, recipient_id, body, read_at, created_at`; RLS: SELECT own, INSERT as sender, UPDATE `read_at` as recipient |
| `message_type` column | ⚠️ Schema gap | `messages-store.tsx` inserts `message_type: "text"` but the RESTORE migration (`20260427172000`) does not include `message_type`. May cause insert error if column doesn't exist in live DB |
| Unread count | ✅ Real | Derived from `status !== "read"` on messages from `"them"` — works for DB messages |
| `markRead` | ✅ Real | UPDATE `read_at` on `direct_messages` where `sender_id = peerId AND recipient_id = me AND read_at IS NULL` |
| Starting a conversation | ⚠️ Partial | `ensureFromHandle(handle)` does a Supabase lookup by `username` but falls back to `mock-data.ts creators[]` first |
| New conversation sheet | ⚠️ Unknown | `NewConversationSheet` component exists — not audited; likely uses mock data for user search |
| Activity tab in inbox | ❌ Mock | Hardcoded `activity[]` array from `mock-data.ts creators[]` |
| Requests tab in inbox | ❌ Mock | Hardcoded `requests[]` from `creators.slice(2, 5)` |
| Online status | ❌ Mock | `peer.online` is hardcoded; no realtime presence |
| Typing indicator | ❌ Mock | `peerTyping` is a `setTimeout` simulation |
| Message reactions | ❌ Mock | `toast("reaction sent")` only |
| Voice notes | ❌ Mock | `toast.success("Voice note sent")` only |

---

### 5. Comments

**Current state: PARTIALLY REAL — reads and writes work for UUID post IDs; mock contamination for non-UUID posts**

| Item | Status | Detail |
|------|--------|--------|
| `comments-store.tsx` | ⚠️ Partial | DB fetch: SELECT `user_post_comments` JOIN `profiles` (as `creator_id`) for UUID post IDs ✅. DB write: INSERT `user_post_comments` for UUID post IDs ✅. DB delete: DELETE by `id` for UUID post IDs ✅. Mock: SEED comments for non-UUID post IDs; localStorage for non-UUID posts |
| `user_post_comments` table | ✅ Real | `post_id, creator_id, parent_comment_id, body, moderation_status, deleted_at`; RLS: public SELECT, authenticated INSERT/UPDATE/DELETE own rows |
| Comment author mapping | ✅ Real | Fetches `profiles` via `creator_id` FK; maps to `{ name, handle, avatar }` |
| `public_profile_uid` linking | ⚠️ Missing | Comment author `handle` is `username`, not `public_profile_uid`. No link from comment author to `/u/{public_profile_uid}` |
| Comment likes | ❌ Local only | `toggleLike` is local state only — no `user_post_comment_likes` table wired |
| Comment edit | ❌ Local only | `edit()` updates local state only — no DB UPDATE |
| `moderation_status` filter | ✅ Real | SELECT filters `moderation_status = 'visible'` and `deleted_at IS NULL` |
| Nested comments (replies) | ✅ Schema | `parent_comment_id` exists; `byPost()` returns flat list — nesting is UI-only |
| `isMine` check | ⚠️ Fragile | Compares `c.author.handle === currentUser.handle` — works when `currentUser` is real; fails when `currentUser` falls back to mock |

**Direct answer: Comments ARE partially wired.** Reads and writes work for real UUID post IDs. Mock contamination exists for non-UUID (mock) post IDs. Comment likes and edits are local-only.

---

### 6. Reactions

**Current state: REAL for post reactions; LOCAL-ONLY for activity tracking**

| Item | Status | Detail |
|------|--------|--------|
| `use-supabase-reactions.ts` | ✅ Real | SELECT count + current user reaction from `user_post_reactions`; optimistic toggle with DELETE + INSERT; rollback on error |
| `user_post_reactions` table | ✅ Real | `post_id, user_id, reaction_type`; UNIQUE `(post_id, user_id, reaction_type)`; RLS: public SELECT, authenticated INSERT/DELETE own rows |
| Reaction type mapping | ✅ Real | Lovable keys (`fire, gem, crown, dead, cinematic`) map to Supabase types (`like, love, wow, laugh, sad`); bidirectional mapping |
| `activity-store.tsx` | ❌ Local only | `setReaction`, `toggleSave`, `logShare` — all localStorage only; separate from `use-supabase-reactions` |
| Reaction counts | ✅ Real | COUNT query on `user_post_reactions` per `post_id` |
| Current user reaction state | ✅ Real | SELECT by `post_id + user_id` |
| `angry` reaction type | ⚠️ Unmapped | Supabase schema allows `angry` but no Lovable key maps to it |
| Reaction on non-UUID posts | ⚠️ Untested | `useSupabaseReactions` is called with any `postId`; will silently return 0 count for non-UUID IDs |

**Direct answer: Post reactions ARE wired to Supabase.** `use-supabase-reactions.ts` is real. `activity-store.tsx` is a separate local-only layer for the user's own activity feed — it is intentionally not wired to `notifications`.

---

### 7. Notifications

**Current state: REVERTED TO MOCK — was wired, then replaced with localStorage store**

| Item | Status | Detail |
|------|--------|--------|
| `use-notifications.ts` | ❌ Mock | Re-exports from `notifications-store.ts` which is a `useSyncExternalStore` over localStorage. The Supabase `notifications` table is NOT queried |
| `notifications-store.ts` | ❌ Mock | Pure localStorage store; seeds from `mock-data.ts creators[]`; `markRead`, `markAllRead`, `remove`, `clearAll`, `add` all operate on local state only |
| `notifications` table | ✅ Schema exists | `user_id, actor_id, type, message, read_at, created_at, post_id, comment_id, video_id, metadata`; RLS: SELECT/UPDATE own rows |
| `NotificationsPopover.tsx` | ❌ Mock | Consumes `useNotifications()` which is now the mock store |
| Follow notification | ❌ Not generated | No trigger or server function writes a `new_follower` notification when `follows` INSERT fires |
| Message notification | ❌ Not generated | No trigger writes a notification on `direct_messages` INSERT |
| Comment notification | ❌ Not generated | No trigger writes a notification on `user_post_comments` INSERT |
| Reaction notification | ❌ Not generated | No trigger writes a notification on `user_post_reactions` INSERT |
| Browser writes notifications | ✅ Intentionally blocked | Per hard rules: browser INSERT is not used; notifications are server-side trigger only |

**Note:** The checkpoint doc says notifications were wired to Supabase, but the current code shows `use-notifications.ts` re-exports from `notifications-store.ts` which is a mock localStorage store. The Supabase wiring was replaced or reverted. This must be re-wired.

---

### 8. Remaining Mock / Local Pieces

| Feature | Location | Status | Action |
|---------|----------|--------|--------|
| Auth session layer | `lib/auth.tsx` | Mock `signIn(role)` + localStorage | Replace with real Supabase session; keep `AuthProvider` shape |
| New user → onboarding routing | `login.tsx` / `__root.tsx` | Not wired | Add `onboarding_completed` check post-auth |
| Google OAuth | `login.tsx` | Uses `lovable.auth` wrapper | Verify works in Cloudflare Workers; may need direct `supabase.auth.signInWithOAuth` |
| Notifications | `notifications-store.ts` | Mock localStorage | Re-wire to `notifications` table |
| Follow seed data | `follow-store.tsx` | Seeds from `mock-data.ts` | Remove SEED; show empty state for unauthenticated users |
| Message seed data | `messages-store.tsx` | Seeds from `mock-data.ts` | Remove SEED_THREADS/SEED_MSGS; show empty state |
| Inbox activity tab | `inbox.tsx` | Hardcoded mock array | Wire to `notifications` table (type: `post_liked`, `post_commented`, `user_followed`) |
| Inbox requests tab | `inbox.tsx` | Hardcoded mock array | Wire to `friend_requests` table or remove |
| Comment likes | `comments-store.tsx` | Local state only | Wire to `user_post_comment_likes` table (if exists) or keep local |
| Comment edit | `comments-store.tsx` | Local state only | Wire UPDATE to `user_post_comments` |
| User search | None | Not implemented | Add username/display_name search for new conversations and follow discovery |
| Follower/following lists | None | Not implemented | Add to profile page |
| Profile follower/following counts | `ProfileStatsBar` | Uses mock `SessionUser.stats` | Wire to `profiles.follower_count` / `profiles.following_count` or COUNT query |
| `bumpWatch` / `topThree` | `follow-store.tsx` | Local only | Keep local — intentional |
| Online presence | `messages-store.tsx` | Mock | Keep mock — realtime out of scope |
| Typing indicator | `inbox.tsx` | Mock setTimeout | Keep mock — realtime out of scope |
| Feed creators strip | `mock-data.ts` | Mock | Separate lane — not social universe |
| `activity-store.tsx` | Local only | Intentional | Keep local — user's own action log, not notification inbox |

---

## Supabase Tables Involved

| Table | RLS | Browser access | Notes |
|-------|-----|----------------|-------|
| `profiles` | Enabled | SELECT (public), UPDATE own | `is_creator` banned; `age` banned |
| `follows` | Enabled | SELECT (public), INSERT/DELETE own | `follower_id = auth.uid()` enforced |
| `direct_messages` | Enabled | SELECT own, INSERT as sender, UPDATE `read_at` as recipient | `message_type` column may not exist |
| `user_post_comments` | Enabled | SELECT (public), INSERT/UPDATE/DELETE own | `creator_id = auth.uid()` enforced |
| `user_post_reactions` | Enabled | SELECT (public), INSERT/DELETE own | `user_id = auth.uid()` enforced |
| `notifications` | Enabled | SELECT/UPDATE own | Browser INSERT intentionally blocked; server triggers write |
| `friend_requests` | Enabled | SELECT own, INSERT as requester, UPDATE as addressee | Not currently used in ANTIGRAVITY |
| `user_top_three_friends` | Enabled | SELECT (public), all own | Not currently used in ANTIGRAVITY |

---

## Hard Rules (carry forward)

1. Do not use `profiles.is_creator` — column does not exist in current schema.
2. Do not use `profiles.age`.
3. Do not expose `date_of_birth` unless a specific safe DOB flow requires it.
4. Do not expose service-role keys to browser.
5. Do not commit `.env` or secrets.
6. Do not touch `.claude/`.
7. Keep Lovable UI as visual source of truth — no redesign.
8. Do not touch Watch Now / Guide unless explicitly requested.
9. Do not touch Creator/admin publishing pipeline unless explicitly requested.
10. Terminal validation only: `pnpm tsc --noEmit` and `pnpm build`.

---

## What Must Not Be Touched

- `src/routes/watch.$id.tsx` — Watch Now
- `src/lib/guide-store.tsx` — Guide
- `src/lib/admin/post-queue.server.ts` — Admin pipeline
- `src/lib/creator-studio/upload.server.ts` — Cloudflare upload
- `src/lib/trey-i/` — All Trey-I server functions
- `src/routes/onboarding.voice.tsx` — Trey-I onboarding (Phase 4 lane)
- `src/components/ai/TreyIWidget.tsx` — Separate future lane
- `.claude/` — Local output, never committed

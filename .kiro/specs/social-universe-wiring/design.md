# Social Universe Wiring — Design

## Recommended Implementation Order

Priority is determined by: (1) user-visible correctness, (2) data integrity risk, (3) dependency order.

```
P1 — Notifications re-wire (unblocks all social feedback loops)
P2 — Remove mock seed contamination from follows + messages
P3 — New user → onboarding routing post-auth
P4 — Comment edit wired to DB
P5 — Follower/following counts on profile
P6 — User search (username/display_name)
P7 — Follower/following list surfaces on profile
P8 — Dual Supabase client consolidation (risk reduction, not user-visible)
```

Items intentionally deferred (keep mock):
- Online presence / typing indicators (realtime out of scope)
- Message reactions (out of scope)
- Voice notes (out of scope)
- Inbox requests tab (friend_requests not used)
- Comment likes (no `user_post_comment_likes` table confirmed)
- `bumpWatch` / `topThree` (local-only by design)
- Feed creators strip (separate lane)

---

## P1 — Notifications Re-Wire

### Problem
`use-notifications.ts` re-exports from `notifications-store.ts` which is a pure
localStorage mock. The `notifications` Supabase table exists and has RLS policies
but is not queried.

### Design

Replace `notifications-store.ts` with a real Supabase hook. Keep the `NotificationItem`
type shape identical so `NotificationsPopover.tsx` requires no changes.

**New `src/hooks/use-notifications.ts`** (replaces re-export):
```typescript
// SELECT from notifications table, ordered by created_at desc, limit 50
// UPDATE read_at for markRead / markAllRead
// No browser INSERT — server triggers write notifications
// Map DB row → NotificationItem shape
```

DB columns used:
```
id, user_id, actor_id, type, message, read_at, created_at, post_id, metadata
```

Actor profile join (for `who` field):
```sql
actor:profiles!notifications_actor_id_fkey(display_name, username, avatar_url)
```

Type mapping (DB → NotificationItem.kind):
```
new_follower     → "follow"
user_followed    → "follow"
post_liked       → "like"
like_on_video    → "like"
post_commented   → "comment"
comment_on_video → "comment"
reply_to_comment → "comment"
post_saved       → "boost"
```

Fallback: if `type` is unrecognized, map to `"trey"`.

`unreadCount`: `notifications.filter(n => !n.read_at).length`

`markRead(id)`: UPDATE `read_at = now()` WHERE `id = id AND user_id = auth.uid()`

`markAllRead()`: UPDATE `read_at = now()` WHERE `user_id = auth.uid() AND read_at IS NULL`

**`notifications-store.ts`**: Keep file but empty it to a stub that throws a clear
error if accidentally imported. The real hook is `use-notifications.ts`.

**Files changed:**
- `src/hooks/use-notifications.ts` — replace re-export with real Supabase hook
- `src/lib/notifications-store.ts` — stub (or delete if no other imports)

**Files NOT changed:**
- `src/components/layout/NotificationsPopover.tsx` — consumes `useNotifications()` unchanged
- `src/routes/notifications.tsx` — remains ComingSoonPage stub

### RLS
`notifications` table: SELECT/UPDATE own rows (`user_id = auth.uid()`).
Browser never INSERTs — server-side triggers write notifications.

### Notification triggers (server-side, not browser)
The following DB triggers should exist (or be added via migration) to generate
notifications automatically:

| Action | Trigger table | Notification type |
|--------|--------------|-------------------|
| Follow INSERT | `follows` | `user_followed` |
| Comment INSERT | `user_post_comments` | `post_commented` |
| Reaction INSERT | `user_post_reactions` | `post_liked` |
| DM INSERT | `direct_messages` | (no notification type confirmed — out of scope for now) |

These triggers are server-side only. The browser never writes to `notifications`.
If triggers don't exist in the live DB, notifications will be empty but the hook
will not error. Trigger creation is a separate migration task.

---

## P2 — Remove Mock Seed Contamination

### Problem
`follow-store.tsx` seeds from `creators.slice(0, 3)` and merges local mock follows
with DB follows. `messages-store.tsx` seeds from `SEED_THREADS`/`SEED_MSGS` from
`mock-data.ts creators[]`.

### Design — follow-store.tsx

Remove `SEED` constant and `localFollowed` state entirely.
Replace with DB-only follows for authenticated users, empty state for guests.

```typescript
// Before: const SEED = creators.slice(0, 3).map(...)
// After: no seed; localFollowed removed

// Before: followed = merge(dbFollowed, localFollowed)
// After: followed = [...dbFollowed.values()]

// isFollowing: dbFollowed.has(handle) only
```

`bumpWatch` and `topThree` can remain local-only (they are intentional local features).
Remove the `localFollowed` state that was seeded from mock data.
Keep `dbFollowed` Map as the single source of truth for follow state.

**Files changed:** `src/lib/follow-store.tsx`

### Design — messages-store.tsx

Remove `SEED_PEERS`, `SEED_THREADS`, `SEED_MSGS` constants.
Show empty thread list for unauthenticated users (already gated: `outThreads = supabaseUser ? threads : []`).
Remove localStorage persistence of mock threads/messages (keep only for non-UUID threads if needed).

Also: remove `message_type: "text"` from the INSERT payload — this column may not
exist in the live `direct_messages` table (not in the RESTORE migration). If it does
exist, it can be added back after confirming the schema.

**Files changed:** `src/lib/messages-store.tsx`

---

## P3 — New User → Onboarding Routing

### Problem
New users who sign in with Google (or email) are not routed to `/onboarding` if
`profiles.onboarding_completed = false`. They land on `/` regardless.

### Design

Add a post-auth check in `__root.tsx` or `login.tsx`:

After successful auth, check `profiles.onboarding_completed` for the signed-in user.
If `false` (or profile row doesn't exist yet), redirect to `/onboarding`.

**Option A — in `login.tsx` `postAuthRedirect()`:**
```typescript
// After signInWithPassword or Google OAuth success:
const { data: profile } = await supabase
  .from("profiles")
  .select("onboarding_completed, public_profile_uid")
  .eq("id", user.id)
  .maybeSingle();

if (!profile || !profile.onboarding_completed) {
  nav({ to: "/onboarding" });
  return;
}
// else: use stored redirect or "/"
```

**Option B — in `__root.tsx` as a route guard:**
Add a `beforeLoad` or `useEffect` that checks `onboarding_completed` on every
navigation for authenticated users who haven't completed onboarding.

Option A is simpler and less risky. Option B is more robust but touches the root layout.

**Recommended: Option A** — check in `login.tsx` only, not a global guard.
This avoids touching `__root.tsx` and keeps the change isolated.

**Files changed:** `src/routes/login.tsx`

---

## P4 — Comment Edit Wired to DB

### Problem
`edit()` in `comments-store.tsx` updates local state only. No DB UPDATE is called.

### Design

```typescript
const edit: Ctx["edit"] = async (id, text) => {
  const comment = items.find(c => c.id === id);
  if (!comment || !isUUID(comment.postId)) {
    // local-only for mock posts
    setItems(s => s.map(c => c.id === id ? { ...c, text: text.trim(), editedAt: Date.now() } : c));
    return;
  }
  // Optimistic update
  setItems(s => s.map(c => c.id === id ? { ...c, text: text.trim(), editedAt: Date.now() } : c));
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from("user_post_comments")
    .update({ body: text.trim() })
    .eq("id", id);
  if (error) {
    console.error("Failed to edit comment:", error);
    // Rollback: re-fetch comments for the post
    fetchCommentsForPost(comment.postId);
  }
};
```

RLS: `creator_id = auth.uid()` — only the comment author can UPDATE.

**Files changed:** `src/lib/comments-store.tsx`

---

## P5 — Follower/Following Counts on Profile

### Problem
`ProfileStatsBar` uses `SessionUser.stats` which has hardcoded mock values.
`profiles.follower_count` and `profiles.following_count` exist in schema but are
not read by `useProfile` or `useCurrentUser`.

### Design

Add `follower_count` and `following_count` to the `useProfile` SELECT:
```typescript
.select("..., follower_count, following_count")
```

Pass through `ProfileData` → `ProfileStatsBar`.

**Note:** `profiles.follower_count` is a denormalized counter. It may be stale if
no trigger maintains it. A safer alternative is a COUNT query on `follows`:
```sql
SELECT COUNT(*) FROM follows WHERE following_id = profiles.id  -- followers
SELECT COUNT(*) FROM follows WHERE follower_id = profiles.id   -- following
```

Use the denormalized column first; add a note that it requires a DB trigger to stay
accurate. If the column is always 0, fall back to COUNT query.

**Files changed:** `src/hooks/use-profile.ts`, `src/components/profile/ProfileTypes.ts`,
`src/components/profile/ProfileStatsBar.tsx`

---

## P6 — User Search

### Problem
No user search by username or display name exists. `ensureFromHandle` in
`messages-store.tsx` does a single exact-match lookup but there is no search UI.

### Design

Add a `useUserSearch(query: string)` hook:
```typescript
// SELECT id, public_profile_uid, display_name, username, avatar_url
// FROM profiles
// WHERE username ILIKE '%query%' OR display_name ILIKE '%query%'
// LIMIT 10
// Only fires when query.length >= 2
```

Use in:
1. `NewConversationSheet` — search before starting a DM
2. A future "Find people" surface on the following/followers page

**Files changed:** `src/hooks/use-user-search.ts` (new), `src/components/inbox/NewConversationSheet.tsx`

---

## P7 — Follower/Following List Surfaces

### Problem
No route or component lists followers or following for a profile.

### Design

Add a `useFollowList(profileId: string, direction: "followers" | "following")` hook:
```typescript
// followers: SELECT follower:profiles!follows_follower_id_fkey(...) WHERE following_id = profileId
// following: SELECT following:profiles!follows_following_id_fkey(...) WHERE follower_id = profileId
// LIMIT 50
```

Surface in `ProfileStatsBar` — clicking follower/following count opens a sheet or
navigates to a list. Keep within existing Lovable UI structure.

**Files changed:** `src/hooks/use-follow-list.ts` (new), profile components

---

## P8 — Dual Supabase Client Consolidation

### Problem
Two Supabase clients exist:
1. `src/integrations/supabase/client.ts` — Lovable-generated; uses `VITE_SUPABASE_PUBLISHABLE_KEY`
2. `src/lib/supabase-browser.ts` — project-standard; uses `VITE_SUPABASE_ANON_KEY`

`login.tsx` and `supabase-session.tsx` use client #1.
All real hooks (`use-auth.ts`, `use-profile.ts`, `follow-store.tsx`, etc.) use client #2.

Both point to the same Supabase project but are separate singleton instances.
This means auth state changes in one client are not automatically reflected in the other.

### Design

**Option A (preferred):** Make `src/lib/supabase-browser.ts` the single canonical client.
Update `login.tsx` and `supabase-session.tsx` to import from `@/lib/supabase-browser`.
Keep `src/integrations/supabase/client.ts` as a re-export shim for backward compatibility.

**Option B:** Keep both clients but ensure they share the same auth storage key
(both use `localStorage` with the same key by default in `@supabase/supabase-js`).
This is the current de-facto behavior — both clients share the same localStorage
session because Supabase uses a fixed storage key. Risk: if either client refreshes
the token, the other may not pick it up immediately.

**Recommended: Option A** — consolidate to `supabase-browser.ts`.
This is a low-risk refactor with high correctness benefit.

**Files changed:** `src/routes/login.tsx`, `src/lib/supabase-session.tsx`,
`src/integrations/supabase/client.ts` (shim)

---

## Files Likely Involved (by priority)

| Priority | File | Change type |
|----------|------|-------------|
| P1 | `src/hooks/use-notifications.ts` | Replace re-export with real hook |
| P1 | `src/lib/notifications-store.ts` | Stub or delete |
| P2 | `src/lib/follow-store.tsx` | Remove mock seed |
| P2 | `src/lib/messages-store.tsx` | Remove mock seed; remove `message_type` |
| P3 | `src/routes/login.tsx` | Add onboarding_completed check |
| P4 | `src/lib/comments-store.tsx` | Wire edit() to DB UPDATE |
| P5 | `src/hooks/use-profile.ts` | Add follower_count, following_count |
| P5 | `src/components/profile/ProfileTypes.ts` | Add count fields to ProfileData |
| P5 | `src/components/profile/ProfileStatsBar.tsx` | Use real counts |
| P6 | `src/hooks/use-user-search.ts` | New hook |
| P6 | `src/components/inbox/NewConversationSheet.tsx` | Wire search |
| P7 | `src/hooks/use-follow-list.ts` | New hook |
| P8 | `src/routes/login.tsx` | Switch to supabase-browser client |
| P8 | `src/lib/supabase-session.tsx` | Switch to supabase-browser client |
| P8 | `src/integrations/supabase/client.ts` | Shim re-export |

---

## Files NOT Changed (protected)

| File | Reason |
|------|--------|
| `src/routes/watch.$id.tsx` | Watch Now — protected |
| `src/lib/guide-store.tsx` | Guide — protected |
| `src/lib/admin/post-queue.server.ts` | Admin pipeline — protected |
| `src/lib/creator-studio/upload.server.ts` | Cloudflare upload — protected |
| `src/lib/trey-i/` (all files) | Trey-I server functions — protected |
| `src/routes/onboarding.voice.tsx` | Phase 4 lane — protected |
| `src/components/ai/TreyIWidget.tsx` | Future lane — protected |
| `.claude/` | Local output — never touched |
| `src/components/layout/NotificationsPopover.tsx` | Consumes hook unchanged |
| `src/routes/notifications.tsx` | ComingSoonPage stub — unchanged |

---

## Security Notes

| Area | Rule |
|------|------|
| `notifications` INSERT | Browser never INSERTs — server triggers only |
| `follows` INSERT/DELETE | `follower_id = auth.uid()` enforced by RLS |
| `direct_messages` INSERT | `sender_id = auth.uid()` enforced by RLS |
| `user_post_comments` INSERT/UPDATE/DELETE | `creator_id = auth.uid()` enforced by RLS |
| `user_post_reactions` INSERT/DELETE | `user_id = auth.uid()` enforced by RLS |
| `profiles` UPDATE | Only own row; privilege fields blocked by DB trigger |
| Service-role key | Never in browser; only in `.server.ts` files |
| `profiles.is_creator` | Never queried |
| `profiles.age` / `date_of_birth` | Never queried |

---

## Rollback Plan

Each priority item is independently reversible:

| Item | Rollback |
|------|----------|
| P1 notifications | `git checkout HEAD -- src/hooks/use-notifications.ts src/lib/notifications-store.ts` |
| P2 mock seed removal | `git checkout HEAD -- src/lib/follow-store.tsx src/lib/messages-store.tsx` |
| P3 onboarding routing | `git checkout HEAD -- src/routes/login.tsx` |
| P4 comment edit | `git checkout HEAD -- src/lib/comments-store.tsx` |
| P5 profile counts | `git checkout HEAD -- src/hooks/use-profile.ts src/components/profile/ProfileTypes.ts src/components/profile/ProfileStatsBar.tsx` |
| P6 user search | `git rm src/hooks/use-user-search.ts && git checkout HEAD -- src/components/inbox/NewConversationSheet.tsx` |
| P7 follow lists | `git rm src/hooks/use-follow-list.ts` |
| P8 client consolidation | `git checkout HEAD -- src/routes/login.tsx src/lib/supabase-session.tsx src/integrations/supabase/client.ts` |

All rollbacks are single-file or small-set operations. No database migrations are
required for any of these items — all changes are browser-side code only.

# Social Universe Wiring — Tasks

## Task Overview

| # | Task | Priority | Files | Risk |
|---|------|----------|-------|------|
| 1 | Re-wire notifications to Supabase | P1 | 2 | Low |
| 2 | Remove mock seed from follow-store | P2 | 1 | Low |
| 3 | Remove mock seed from messages-store | P2 | 1 | Low |
| 4 | New user → onboarding routing | P3 | 1 | Low |
| 5 | Wire comment edit to DB | P4 | 1 | Low |
| 6 | Wire follower/following counts to profile | P5 | 3 | Low |
| 7 | Add user search hook + wire to NewConversationSheet | P6 | 2 | Low |
| 8 | Add follower/following list hook | P7 | 1 | Low |
| 9 | Consolidate dual Supabase client | P8 | 3 | Medium |

Each task is independently committable. Complete in order — later tasks do not
depend on earlier ones except where noted.

---

## Task 1 — Re-wire Notifications to Supabase

### Files involved
- `src/hooks/use-notifications.ts` — **replace re-export with real hook**
- `src/lib/notifications-store.ts` — **stub (keep file, empty implementation)**

### What to implement

`use-notifications.ts` currently re-exports from `notifications-store.ts`.
Replace with a direct Supabase hook that:
1. SELECTs from `notifications` WHERE `user_id = auth.uid()` ORDER BY `created_at DESC` LIMIT 50
2. JOINs `actor:profiles!notifications_actor_id_fkey(display_name, username, avatar_url)` for the `who` field
3. Maps DB rows to `NotificationItem` shape (keep type identical — `NotificationsPopover.tsx` must not change)
4. Exposes `markRead(id)`, `markAllRead()` — UPDATE `read_at = now()`
5. Returns `loading: boolean` and `unreadCount: number`
6. Returns empty array (not mock data) when user is not signed in

Type mapping (DB `type` → `NotificationItem.kind`):
```
new_follower, user_followed → "follow"
post_liked, like_on_video   → "like"
post_commented, comment_on_video, reply_to_comment → "comment"
post_saved                  → "boost"
(anything else)             → "trey"
```

`notifications-store.ts`: Replace body with a single comment:
```typescript
// Replaced by src/hooks/use-notifications.ts — do not import this file.
export {};
```

### Acceptance criteria
- [ ] `use-notifications.ts` queries `notifications` table directly (no re-export)
- [ ] `NotificationsPopover.tsx` requires zero changes
- [ ] Unauthenticated users see empty notifications (no mock data)
- [ ] `markRead` and `markAllRead` UPDATE `read_at` in Supabase
- [ ] `unreadCount` reflects real unread rows
- [ ] `pnpm tsc --noEmit` → zero errors
- [ ] `pnpm build` → zero errors

### Security boundary
- SELECT/UPDATE own rows only (`user_id = auth.uid()`)
- No browser INSERT — server triggers write notifications
- No service-role key

### Visual preservation rule
`NotificationsPopover.tsx` is not modified. The notification popover looks and
behaves identically — only the data source changes from localStorage to Supabase.

### Terminal validation
```bash
pnpm tsc --noEmit
pnpm build

# Confirm notifications-store is no longer the real implementation
rg "useSyncExternalStore|localStorage.*notification|STORAGE_KEY.*notif" src/lib/notifications-store.ts
# expected: 0 matches (file is now a stub)

# Confirm use-notifications queries Supabase
rg "from.*notifications|notifications.*select" src/hooks/use-notifications.ts
# expected: matches showing Supabase query
```

### Rollback
```bash
git checkout HEAD -- src/hooks/use-notifications.ts src/lib/notifications-store.ts
```

---

## Task 2 — Remove Mock Seed from follow-store

### Files involved
- `src/lib/follow-store.tsx` — **remove SEED, localFollowed state, mock merge**

### What to implement

1. Remove `SEED` constant (seeded from `creators.slice(0, 3)`)
2. Remove `localFollowed` state and all its `useState`/`useEffect`/`localStorage` logic
3. Remove `import { creators } from "@/lib/mock-data"` if no longer needed
4. Replace `followed` memo: `[...dbFollowed.values()]` (DB only)
5. Replace `isFollowing`: `dbFollowed.has(handle)` only
6. Keep `bumpWatch` and `topThree` — these are intentional local features; they can
   operate on `dbFollowed` values instead of `localFollowed`
7. Show empty list for unauthenticated users (already gated by `supabaseUser` check)

The `toggle()` function already handles real profile IDs correctly — no change needed
to the write path.

### Acceptance criteria
- [ ] No `SEED` constant in `follow-store.tsx`
- [ ] No `localFollowed` state
- [ ] No `creators` import from `mock-data.ts` (unless used elsewhere in file)
- [ ] Unauthenticated users see empty followed list
- [ ] `pnpm tsc --noEmit` → zero errors
- [ ] `pnpm build` → zero errors

### Security boundary
No change to write path. RLS unchanged.

### Visual preservation rule
Follow button behavior unchanged. Profile follow/unfollow unchanged.
The only visible change: mock creators no longer appear in the followed list for
unauthenticated users.

### Terminal validation
```bash
pnpm tsc --noEmit
pnpm build

rg "SEED|localFollowed|creators.*slice" src/lib/follow-store.tsx
# expected: 0 matches
```

### Rollback
```bash
git checkout HEAD -- src/lib/follow-store.tsx
```

---

## Task 3 — Remove Mock Seed from messages-store

### Files involved
- `src/lib/messages-store.tsx` — **remove SEED_PEERS, SEED_THREADS, SEED_MSGS; remove message_type**

### What to implement

1. Remove `SEED_PEERS`, `SEED_THREADS`, `SEED_MSGS` constants
2. Remove `import { creators } from "@/lib/mock-data"` if no longer needed
3. In the hydration `useEffect`: if no localStorage data, initialize with empty arrays
   (not SEED data)
4. Remove `message_type: "text"` from the INSERT payload in `send()` — this column
   may not exist in the live `direct_messages` table
5. Keep localStorage persistence for non-UUID threads (user-created local threads
   before a real peer ID is resolved)

### Acceptance criteria
- [ ] No `SEED_PEERS`, `SEED_THREADS`, `SEED_MSGS` in `messages-store.tsx`
- [ ] No `creators` import from `mock-data.ts` (unless used elsewhere)
- [ ] `message_type` removed from INSERT payload
- [ ] Unauthenticated users see empty inbox
- [ ] `pnpm tsc --noEmit` → zero errors
- [ ] `pnpm build` → zero errors

### Security boundary
No change to RLS. INSERT still gated on `supabaseUser`.

### Visual preservation rule
Inbox UI unchanged. Empty state already exists in `inbox.tsx`.

### Terminal validation
```bash
pnpm tsc --noEmit
pnpm build

rg "SEED_PEERS|SEED_THREADS|SEED_MSGS|message_type" src/lib/messages-store.tsx
# expected: 0 matches
```

### Rollback
```bash
git checkout HEAD -- src/lib/messages-store.tsx
```

---

## Task 4 — New User → Onboarding Routing

### Files involved
- `src/routes/login.tsx` — **add onboarding_completed check in postAuthRedirect**

### What to implement

In `postAuthRedirect()`, after a successful sign-in (email or Google), check
`profiles.onboarding_completed` for the signed-in user:

```typescript
const postAuthRedirect = async () => {
  // Get current user from the Supabase client used in login.tsx
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile || !profile.onboarding_completed) {
      nav({ to: "/onboarding" });
      return;
    }
  }
  let next: string | null = null;
  try { next = sessionStorage.getItem("treytv_post_auth_redirect"); sessionStorage.removeItem("treytv_post_auth_redirect"); } catch {}
  nav({ to: (next as any) || "/" });
};
```

Note: `login.tsx` currently uses `supabase` from `@/integrations/supabase/client`.
This is acceptable for now (P8 consolidation is a separate task).

### Acceptance criteria
- [ ] New users (onboarding_completed = false) are redirected to `/onboarding` after sign-in
- [ ] Existing users (onboarding_completed = true) are redirected to stored path or `/`
- [ ] Demo quick-login buttons are unaffected (they call `signIn(role)` directly, not `postAuthRedirect`)
- [ ] `pnpm tsc --noEmit` → zero errors
- [ ] `pnpm build` → zero errors

### Security boundary
SELECT own profile only (`eq("id", user.id)`). No service-role key.

### Visual preservation rule
Login page UI unchanged. Only the redirect behavior changes for new users.

### Terminal validation
```bash
pnpm tsc --noEmit
pnpm build
```

### Rollback
```bash
git checkout HEAD -- src/routes/login.tsx
```

---

## Task 5 — Wire Comment Edit to DB

### Files involved
- `src/lib/comments-store.tsx` — **wire edit() to DB UPDATE**

### What to implement

Replace the local-only `edit()` with an optimistic DB UPDATE:

```typescript
const edit: Ctx["edit"] = async (id, text) => {
  const comment = items.find(c => c.id === id);
  if (!comment) return;
  // Optimistic update
  setItems(s => s.map(c => c.id === id ? { ...c, text: text.trim(), editedAt: Date.now() } : c));
  if (!isUUID(comment.postId)) return; // local mock post — no DB write
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from("user_post_comments")
    .update({ body: text.trim() })
    .eq("id", id);
  if (error) {
    console.error("Failed to edit comment:", error);
    fetchCommentsForPost(comment.postId); // rollback via re-fetch
  }
};
```

### Acceptance criteria
- [ ] `edit()` calls DB UPDATE for UUID post comments
- [ ] `edit()` remains local-only for non-UUID (mock) post comments
- [ ] Optimistic update applied before DB call
- [ ] Re-fetch on error (rollback)
- [ ] `pnpm tsc --noEmit` → zero errors
- [ ] `pnpm build` → zero errors

### Security boundary
UPDATE own rows only — RLS enforces `creator_id = auth.uid()`.

### Visual preservation rule
Comment edit UI unchanged. Only the persistence behavior changes.

### Terminal validation
```bash
pnpm tsc --noEmit
pnpm build
```

### Rollback
```bash
git checkout HEAD -- src/lib/comments-store.tsx
```

---

## Task 6 — Wire Follower/Following Counts to Profile

### Files involved
- `src/hooks/use-profile.ts` — add `follower_count`, `following_count` to SELECT
- `src/components/profile/ProfileTypes.ts` — add count fields to `ProfileData`
- `src/components/profile/ProfileStatsBar.tsx` — use real counts

### What to implement

1. `use-profile.ts`: Add `follower_count, following_count` to the SELECT query.
   Add to `SupabaseProfile` type.

2. `ProfileTypes.ts`: Add optional `followerCount?: number` and `followingCount?: number`
   to `ProfileData` (or `ProfileStats`).

3. `ProfileStatsBar.tsx`: Use `profile.followerCount` / `profile.followingCount` when
   available; fall back to existing mock stats if null/undefined.

4. `u.$uid.tsx`: Pass counts through `ProfileData` when building from `useProfile`.

### Acceptance criteria
- [ ] `useProfile` SELECT includes `follower_count, following_count`
- [ ] `ProfileStatsBar` shows real counts when available
- [ ] Falls back gracefully when counts are null/0
- [ ] `pnpm tsc --noEmit` → zero errors
- [ ] `pnpm build` → zero errors

### Security boundary
SELECT only. No writes. RLS: profiles are publicly readable.

### Visual preservation rule
`ProfileStatsBar` structure unchanged. Only the data source for counts changes.

### Terminal validation
```bash
pnpm tsc --noEmit
pnpm build
```

### Rollback
```bash
git checkout HEAD -- src/hooks/use-profile.ts src/components/profile/ProfileTypes.ts src/components/profile/ProfileStatsBar.tsx
```

---

## Task 7 — Add User Search Hook + Wire to NewConversationSheet

### Files involved
- `src/hooks/use-user-search.ts` — **new file**
- `src/components/inbox/NewConversationSheet.tsx` — **wire search**

### What to implement

`use-user-search.ts`:
```typescript
// SELECT id, public_profile_uid, display_name, username, avatar_url
// FROM profiles
// WHERE (username ILIKE '%query%' OR display_name ILIKE '%query%')
//   AND id != auth.uid()  -- exclude self
// LIMIT 10
// Debounce: only fire when query.length >= 2
// Return: { results, loading }
```

`NewConversationSheet.tsx`: Replace any mock creator list with `useUserSearch` results.
When a user is selected, call `openThread(peer)` from `useMessages()`.

### Acceptance criteria
- [ ] `use-user-search.ts` queries `profiles` by username/display_name ILIKE
- [ ] Results exclude the current user
- [ ] Only fires for query length >= 2
- [ ] `NewConversationSheet` shows real search results
- [ ] Selecting a result opens a DM thread
- [ ] `pnpm tsc --noEmit` → zero errors
- [ ] `pnpm build` → zero errors

### Security boundary
SELECT only. RLS: profiles are publicly readable.
No service-role key. No `profiles.is_creator` / `profiles.age` / `date_of_birth`.

### Visual preservation rule
`NewConversationSheet` UI structure preserved. Only the data source changes.

### Terminal validation
```bash
pnpm tsc --noEmit
pnpm build

# Confirm no forbidden fields
rg "is_creator|profiles\.age|date_of_birth" src/hooks/use-user-search.ts
# expected: 0 matches
```

### Rollback
```bash
git rm src/hooks/use-user-search.ts
git checkout HEAD -- src/components/inbox/NewConversationSheet.tsx
```

---

## Task 8 — Add Follower/Following List Hook

### Files involved
- `src/hooks/use-follow-list.ts` — **new file**

### What to implement

```typescript
// useFollowList(profileId: string, direction: "followers" | "following")
// followers: SELECT follower:profiles!follows_follower_id_fkey(id, public_profile_uid, display_name, username, avatar_url)
//            FROM follows WHERE following_id = profileId LIMIT 50
// following: SELECT following:profiles!follows_following_id_fkey(id, public_profile_uid, display_name, username, avatar_url)
//            FROM follows WHERE follower_id = profileId LIMIT 50
// Return: { profiles, loading }
```

This hook is created now for use in a future profile followers/following surface.
No UI wiring is required in this task — the hook is spec-complete and ready to use.

### Acceptance criteria
- [ ] `use-follow-list.ts` exists and exports `useFollowList`
- [ ] Queries `follows` with correct FK alias for direction
- [ ] Returns `{ profiles, loading }`
- [ ] `pnpm tsc --noEmit` → zero errors
- [ ] `pnpm build` → zero errors

### Security boundary
SELECT only. RLS: follows are publicly readable.

### Terminal validation
```bash
pnpm tsc --noEmit
pnpm build
```

### Rollback
```bash
git rm src/hooks/use-follow-list.ts
```

---

## Task 9 — Consolidate Dual Supabase Client

### Files involved
- `src/routes/login.tsx` — switch to `supabase-browser.ts`
- `src/lib/supabase-session.tsx` — switch to `supabase-browser.ts`
- `src/integrations/supabase/client.ts` — make a re-export shim

### What to implement

1. `src/integrations/supabase/client.ts`: Replace the singleton factory with a
   re-export from `supabase-browser.ts`:
   ```typescript
   export { createBrowserClient as supabase } from "@/lib/supabase-browser";
   // or: export const supabase = createBrowserClient();
   ```
   Keep the `Database` type export from `./types` unchanged.

2. `src/routes/login.tsx`: Replace `import { supabase } from "@/integrations/supabase/client"`
   with `import { createBrowserClient } from "@/lib/supabase-browser"` and use
   `createBrowserClient()` inline.

3. `src/lib/supabase-session.tsx`: Same replacement.

### Acceptance criteria
- [ ] Only one Supabase client singleton exists (`supabase-browser.ts`)
- [ ] `login.tsx` uses `supabase-browser.ts` client
- [ ] `supabase-session.tsx` uses `supabase-browser.ts` client
- [ ] `integrations/supabase/client.ts` re-exports from `supabase-browser.ts`
- [ ] `pnpm tsc --noEmit` → zero errors
- [ ] `pnpm build` → zero errors

### Security boundary
No change to auth behavior. Same anon key used by both clients.

### Visual preservation rule
No UI changes. Auth behavior unchanged.

### Terminal validation
```bash
pnpm tsc --noEmit
pnpm build

# Confirm no duplicate client creation
rg "createClient.*SUPABASE" src/integrations/supabase/client.ts
# expected: 0 matches (shim only)
```

### Rollback
```bash
git checkout HEAD -- src/routes/login.tsx src/lib/supabase-session.tsx src/integrations/supabase/client.ts
```

---

## Validation Checklist (run after all tasks)

```bash
# TypeScript
pnpm tsc --noEmit
# expected: zero errors

# Build
pnpm build
# expected: ✓ built in N.NNs

# No forbidden profile fields in social files
rg "profiles\.is_creator|is_creator|profiles\.age|date_of_birth" \
  src/lib/follow-store.tsx \
  src/lib/messages-store.tsx \
  src/lib/comments-store.tsx \
  src/hooks/use-notifications.ts \
  src/hooks/use-user-search.ts \
  src/hooks/use-follow-list.ts
# expected: 0 matches

# No service-role key in browser files
rg "SERVICE_ROLE|service_role" \
  src/lib/follow-store.tsx \
  src/lib/messages-store.tsx \
  src/lib/comments-store.tsx \
  src/hooks/use-notifications.ts
# expected: 0 matches

# No mock seed data in social stores
rg "SEED|creators\.slice|mock-data" \
  src/lib/follow-store.tsx \
  src/lib/messages-store.tsx
# expected: 0 matches

# .claude/ not staged
git status --short | grep ".claude"
# expected: ?? .claude/ (untracked only)
```

---

## Commit Sequence

Each task should be committed separately for clean rollback:

```bash
git commit -m "Re-wire notifications to Supabase"
git commit -m "Remove mock seed from follow-store"
git commit -m "Remove mock seed from messages-store"
git commit -m "Route new users to onboarding after sign-in"
git commit -m "Wire comment edit to Supabase"
git commit -m "Wire follower/following counts to profile"
git commit -m "Add user search hook and wire to NewConversationSheet"
git commit -m "Add follow list hook"
git commit -m "Consolidate dual Supabase client"
```

Stage specific files only — no `git add .`.

---

## Deferred / Out of Scope

| Feature | Reason deferred |
|---------|----------------|
| Notification DB triggers | Requires migration; separate task |
| Online presence | Realtime out of scope |
| Typing indicators | Realtime out of scope |
| Message reactions | Out of scope |
| Voice notes | Out of scope |
| Inbox requests tab | `friend_requests` table not used in ANTIGRAVITY |
| Comment likes | No `user_post_comment_likes` table confirmed |
| Feed creators strip | Separate lane |
| `bumpWatch` / `topThree` | Intentionally local |
| TreyIWidget | Separate future lane |
| Gemini Live | Out of scope |
| Watch Now / Guide | Protected — do not touch |
| Creator/admin pipeline | Protected — do not touch |

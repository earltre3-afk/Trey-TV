# Tasks — Wire Comments to Supabase

Complete in order. Do not start a task until the previous one is recorded done.
Terminal validation only — no browser checks, no screenshots, no Playwright.

---

## T-1 Confirm schema and RLS

**Files:** `C:\Users\info\TREY-TV-RESTORE-599\supabase\migrations\20260501235000_user_social_posts.sql`,
`20260502070000_social_engagement_depth.sql`

**Work:** Confirm the following against the migration files:
- Table: `user_post_comments`
- Columns: `id`, `post_id`, `creator_id`, `parent_comment_id`, `body`, `created_at`, `moderation_status`, `deleted_at`
- FK: `creator_id → auth.users.id`; `post_id → user_posts.id`
- RLS SELECT: `using (true)` — public read
- RLS INSERT: `to authenticated with check (creator_id = auth.uid())`
- RLS DELETE: `to authenticated using (creator_id = auth.uid())`
- No `author_id` column — the author FK is `creator_id`

**Acceptance criteria:**
- [ ] All columns confirmed
- [ ] RLS policies confirmed
- [ ] `creator_id` confirmed as the author FK (not `author_id`)

**Visual preservation:** Read-only. No changes.
**Terminal validation:** Not applicable.
**Rollback risk:** None.

---

## T-2 Confirm existing `CommentsProvider` public API

**Files:** `src/lib/comments-store.tsx`, `src/components/feed/PostCard.tsx`

**Work:** Confirm the exact interface `PostCard` consumes from `useComments()`:
- `byPost(postId: string): Comment[]`
- `add(postId: string, text: string, parentId?: string): void`
- `remove(id: string): void`
- `edit(id: string, text: string): void`
- `toggleLike(id: string): void`
- `isMine(c: Comment): boolean`

Confirm the `Comment` type shape. Confirm `PostCard` does not read any internal
store state directly — only through these six functions.

**Acceptance criteria:**
- [ ] All six functions confirmed as the complete API surface
- [ ] `Comment` type confirmed (id, postId, parentId, author, text, likes, likedByMe, createdAt, editedAt)
- [ ] `PostCard` has no direct access to store internals

**Visual preservation:** Read-only. No changes.
**Terminal validation:** Not applicable.
**Rollback risk:** None.

---

## T-3 Confirm UUID guard logic for mock post IDs

**Files:** `src/routes/index.tsx`

**Work:** Confirm that mock posts (`mockPosts` from `mock-data.ts`) have non-UUID IDs
(`"1"`, `"2"`, `"3"`) and that real DB posts have UUID-shaped IDs. The UUID regex
`/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i` must correctly
distinguish them.

**Acceptance criteria:**
- [ ] Mock post IDs confirmed as non-UUID strings
- [ ] Real DB post IDs confirmed as UUID strings (from `usePosts` mapping in `index.tsx`)
- [ ] UUID regex confirmed as sufficient guard

**Visual preservation:** Read-only. No changes.
**Terminal validation:** Not applicable.
**Rollback risk:** None.

---

## T-4 Replace `src/lib/comments-store.tsx` internals

**Files:** `src/lib/comments-store.tsx`

**Work:** Rewrite the provider internals per design.md. Keep identical:
- `Comment` type export
- `CommentsProvider` export
- `useComments()` export
- All six function signatures in `Ctx`

New internals:
- `dbComments: Record<string, Comment[]>` — real comments keyed by postId
- `fetched: Set<string>` — tracks which postIds have been fetched
- `localItems: Comment[]` — mock/localStorage fallback (keep SEED)
- UUID guard on every operation
- `byPost`: triggers fetch for UUID postIds not yet in `fetched`; returns local for non-UUID
- `add`: DB insert for UUID+signed-in; local for non-UUID or signed-out
- `remove`: DB delete for UUID+signed-in; local for non-UUID
- `toggleLike`, `edit`: local-only in all cases
- `isMine`: compare against `supabaseUser.id` for DB comments; `currentUser.handle` for local

Join for author data in SELECT:
```
creator:profiles!user_post_comments_creator_id_fkey(
  public_profile_uid, display_name, username, avatar_url
)
```

Filter: `moderation_status = 'visible'` and `deleted_at is null`

**Acceptance criteria:**
- [ ] `Comment` type is unchanged
- [ ] `Ctx` interface is unchanged
- [ ] `useComments()` export is unchanged
- [ ] UUID guard present on `byPost`, `add`, `remove`
- [ ] No banned columns selected (`metadata`, `deleted_at` not exposed to UI)
- [ ] `creator_id` not exposed in the mapped `Comment` object
- [ ] `toggleLike` and `edit` remain local-only
- [ ] Optimistic insert: comment appears immediately, removed on DB error
- [ ] Optimistic delete: comment disappears immediately, restored on DB error
- [ ] `pnpm tsc --noEmit` passes

**Visual preservation:** `PostCard` is not touched. Comment UI renders identically.
**Terminal validation:** `pnpm tsc --noEmit` must pass before proceeding to T-5.
**Rollback risk:** Medium — single file change. Restore from git to revert instantly.

---

## T-5 Validate no banned fields exposed

**Files:** `src/lib/comments-store.tsx`

**Work:** Inspect the new implementation:
- Confirm `creator_id` (internal UUID) is not in the mapped `Comment.author` object
- Confirm `metadata` is not read or forwarded
- Confirm `deleted_at` is not read or forwarded
- Confirm `moderation_status` is used only as a filter, not exposed

**Acceptance criteria:**
- [ ] `creator_id` not in `Comment` shape
- [ ] `metadata` not referenced in the mapped output
- [ ] `deleted_at` not referenced in the mapped output

**Visual preservation:** Inspection only. No changes unless a violation is found.
**Terminal validation:** Re-run `pnpm tsc --noEmit` if any correction is made.
**Rollback risk:** None if no changes needed.

---

## T-6 Validate no UI files changed

**Files:** All files except `src/lib/comments-store.tsx`

**Work:** Confirm the git diff contains changes only to `src/lib/comments-store.tsx`.
No other file should be modified.

**Acceptance criteria:**
- [ ] `src/components/feed/PostCard.tsx` is unmodified
- [ ] `src/routes/__root.tsx` is unmodified (beyond any prior tasks)
- [ ] `src/routes/index.tsx` is unmodified
- [ ] No RESTORE component is imported anywhere in the diff

**Visual preservation:** Confirms zero UI changes.
**Terminal validation:** `git diff --name-only` should show only `comments-store.tsx`.
**Rollback risk:** None.

---

## T-7 Run `pnpm tsc --noEmit`

```
cd C:\Users\info\TREY-TV-ANTIGRAVITY
pnpm tsc --noEmit
```

**Acceptance criteria:**
- [ ] Zero errors
- [ ] If errors: fix only in `comments-store.tsx`, re-run before proceeding

**Visual preservation:** Not applicable.
**Terminal validation:** This is the validation.
**Rollback risk:** None from running the check.

---

## T-8 Run `pnpm build`

```
cd C:\Users\info\TREY-TV-ANTIGRAVITY
pnpm build
```

**Acceptance criteria:**
- [ ] Build completes with zero errors
- [ ] If errors: fix only in `comments-store.tsx`, re-run before proceeding

**Visual preservation:** Not applicable.
**Terminal validation:** This is the validation.
**Rollback risk:** None from running the check.

---

## T-9 Confirm signed-out path does not crash

**Files:** `src/lib/comments-store.tsx`, `src/components/feed/PostCard.tsx`

**Work:** Code review only — no browser check.

Trace the signed-out path:
1. `PostCard` form `onSubmit` checks `isGuest` → calls `toast` + `nav` → returns early
2. `add()` in the store is never called for signed-out users on UUID posts
3. Confirm the store's `add()` also has its own guard: if UUID post and no session, no-op

**Acceptance criteria:**
- [ ] `PostCard` signed-out guard confirmed present (already exists)
- [ ] Store `add()` has secondary guard for UUID posts without session
- [ ] No unhandled promise rejection path exists

**Visual preservation:** Code review only. No changes unless a gap is found.
**Terminal validation:** `pnpm tsc --noEmit` if any correction is made.
**Rollback risk:** Low.

---

## T-10 Update steering docs

**Files:** `.kiro/steering/migration-map.md`

**Work:**
- Move "Comments" from 🟡 Mock to ✅ Real in `migration-map.md`
- Note that comment likes and edit remain local-only

---

## Definition of Done

All of the following must be true before this task is closed:
1. `pnpm tsc --noEmit` passes
2. `pnpm build` passes
3. `Comment` type and `useComments()` API are unchanged
4. `PostCard.tsx` is unmodified
5. UUID guard present — mock posts still use localStorage
6. Real UUID posts fetch from `user_post_comments`
7. Signed-in insert writes to DB with optimistic update
8. Signed-in delete removes from DB with optimistic update
9. No banned fields exposed (`creator_id`, `metadata`, `deleted_at`)
10. Steering docs updated

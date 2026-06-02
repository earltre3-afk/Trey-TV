# Tasks — Wire Follow/Unfollow to Supabase

Complete in order. Do not start a task until the previous one is recorded done.
Terminal validation only — no browser checks, no screenshots, no Playwright.

---

## T-1 Confirm schema and RLS

**Files:** `C:\Users\info\TREY-TV-RESTORE-599\supabase\migrations\20260427133000_trey_tv_social_platform.sql`

**Work:** Confirm against the migration:

- Table: `follows`
- Columns: `follower_id`, `following_id`, `created_at`
- Primary key: `(follower_id, following_id)` — no separate `id` column
- Both FKs reference `public.profiles(id)` (not `auth.users` directly)
- `profiles.id = auth.users.id` — so `auth.uid()` is the correct `follower_id`
- Constraint: `follows_not_self` — `follower_id <> following_id`
- RLS SELECT: `using (true)` — public read
- RLS ALL: `using (auth.uid() = follower_id) with check (auth.uid() = follower_id)`

**Acceptance criteria:**

- [ ] No `id` column — PK is composite `(follower_id, following_id)`
- [ ] Both FKs confirmed as `profiles(id)`
- [ ] RLS `for all` confirmed (covers insert + delete in one policy)
- [ ] Self-follow constraint confirmed

**Visual preservation:** Read-only. No changes.
**Terminal validation:** Not applicable.
**Rollback risk:** None.

---

## T-2 Confirm `useFollow` public API and all call sites

**Files:** `src/lib/follow-store.tsx`, `src/routes/u.$uid.tsx`,
`src/routes/channel.$handle.tsx`, `src/routes/explore.tsx`

**Work:**

- Confirm the full `Ctx` interface: `followed`, `isFollowing`, `toggle`, `bumpWatch`, `topThree`
- Confirm `toggle()` return type is `boolean`
- Confirm what `id` value each call site passes to `toggle()`:
  - `u.$uid.tsx`: `uid` (URL param = `public_profile_uid`)
  - `channel.$handle.tsx`: `creator.uid` (`public_profile_uid`)
  - `explore.tsx`: `c.id` (mock string from `creators[]`)
- Confirm `isFollowing` is keyed by `handle` string

**Acceptance criteria:**

- [ ] Full `Ctx` interface documented
- [ ] `toggle()` return type confirmed as `boolean`
- [ ] `id` values at each call site confirmed
- [ ] `public_profile_uid` guard regex `^\d{10,}$` confirmed as sufficient to distinguish real from mock IDs

**Visual preservation:** Read-only. No changes.
**Terminal validation:** Not applicable.
**Rollback risk:** None.

---

## T-3 Replace `src/lib/follow-store.tsx` internals

**Files:** `src/lib/follow-store.tsx`

**Work:** Rewrite the provider internals per design.md. Keep identical:

- `FollowedCreator` type export
- `FollowProvider` export
- `useFollow()` export
- Full `Ctx` interface and all five members

New internals:

- `dbFollowed: Set<string>` — handles of DB-confirmed follows
- `localFollowed: FollowedCreator[]` — mock/localStorage follows (keep SEED)
- On mount (signed-in): fetch all follows for `auth.uid()`, join profiles for `username`, populate `dbFollowed`
- `isFollowing(handle)`: check both `dbFollowed` and `localFollowed`
- `toggle(c)`:
  - Real profile + signed-in: optimistic update → resolve `profiles.id` from `public_profile_uid` → INSERT or DELETE → revert on error
  - Real profile + signed-out: toast + nav to `/onboarding`, return `false`
  - Mock id: update `localFollowed` (existing behavior)
- `followed` array: merge `dbFollowed` into `FollowedCreator[]` shape + `localFollowed`
- `bumpWatch`, `topThree`: local-only, unchanged behavior

**Acceptance criteria:**

- [ ] `FollowedCreator` type unchanged
- [ ] `Ctx` interface unchanged
- [ ] `useFollow()` export unchanged
- [ ] `toggle()` still returns `boolean`
- [ ] `public_profile_uid` guard present
- [ ] Optimistic update with revert on error
- [ ] Signed-out path: toast + redirect, no crash, returns `false`
- [ ] `bumpWatch` and `topThree` remain local-only
- [ ] No `follower_id`/`following_id` UUIDs exposed in `FollowedCreator` shape
- [ ] `pnpm tsc --noEmit` passes

**Visual preservation:** `follow-store.tsx` internals only. No consuming file changes. Zero visual risk.
**Terminal validation:** `pnpm tsc --noEmit` must pass before proceeding to T-4.
**Rollback risk:** Medium — single file change. `git checkout src/lib/follow-store.tsx` reverts instantly.

---

## T-4 Validate no UI files changed

**Files:** All files except `src/lib/follow-store.tsx`

**Work:** Confirm the git diff contains changes only to `src/lib/follow-store.tsx`.

**Acceptance criteria:**

- [ ] `src/routes/u.$uid.tsx` unmodified
- [ ] `src/routes/channel.$handle.tsx` unmodified
- [ ] `src/routes/explore.tsx` unmodified
- [ ] No RESTORE component imported anywhere in the diff

**Terminal validation:** `git diff --name-only` should show only `follow-store.tsx`.
**Visual preservation:** Confirms zero UI changes.
**Rollback risk:** None.

---

## T-5 Validate no banned fields exposed

**Files:** `src/lib/follow-store.tsx`

**Work:** Confirm:

- `follower_id` UUID is not in `FollowedCreator` or any returned object
- `following_id` UUID is not in `FollowedCreator` or any returned object
- Only `handle`, `name`, `avatar`, `followedAt`, `watchScore` are in `FollowedCreator`

**Acceptance criteria:**

- [ ] No UUID FK columns in the public-facing `FollowedCreator` shape

**Terminal validation:** `pnpm tsc --noEmit` if any correction is made.
**Visual preservation:** Inspection only.
**Rollback risk:** None if no changes needed.

---

## T-6 Run `pnpm tsc --noEmit`

```
cd C:\Users\info\TREY-TV-ANTIGRAVITY
pnpm tsc --noEmit
```

**Acceptance criteria:**

- [ ] Zero errors
- [ ] If errors: fix only in `follow-store.tsx`, re-run before proceeding

**Terminal validation:** This is the validation.
**Visual preservation:** Not applicable.
**Rollback risk:** None from running the check.

---

## T-7 Run `pnpm build`

```
cd C:\Users\info\TREY-TV-ANTIGRAVITY
pnpm build
```

**Acceptance criteria:**

- [ ] Build completes with zero errors
- [ ] If errors: fix only in `follow-store.tsx`, re-run before proceeding

**Terminal validation:** This is the validation.
**Visual preservation:** Not applicable.
**Rollback risk:** None from running the check.

---

## T-8 Confirm signed-out path does not crash (code review)

**Files:** `src/lib/follow-store.tsx`

**Work:** Code review only — no browser check.

Trace the signed-out path through `toggle()`:

1. `isRealProfile(c.id)` is true
2. `!isSignedIn` → toast("Sign up to follow") + nav to `/onboarding` + return `false`
3. No DB call is made
4. No unhandled promise rejection

**Acceptance criteria:**

- [ ] Signed-out guard present before any async DB call
- [ ] Returns `false` without throwing
- [ ] No `await` before the signed-out check

**Terminal validation:** `pnpm tsc --noEmit` if any correction is made.
**Visual preservation:** Code review only.
**Rollback risk:** Low.

---

## T-9 Update steering docs

**Files:** `.kiro/steering/migration-map.md`, `.kiro/steering/file-map.md`

**Work:**

- Move "Follow state" from 🟡 Mock to ✅ Real in `migration-map.md`
- Note table: `follows`, validation: tsc ✅ build ✅
- Update `follow-store.tsx` label in `file-map.md`

---

## Definition of Done

All of the following must be true before this task is closed:

1. `pnpm tsc --noEmit` passes
2. `pnpm build` passes
3. `Ctx` interface and `useFollow()` export unchanged
4. `toggle()` still returns `boolean`
5. Real profiles (`public_profile_uid`) write to `follows` table
6. Mock profiles fall back to localStorage
7. Signed-out path: toast + redirect, no crash
8. Optimistic update with revert on error
9. No UUID FKs exposed in `FollowedCreator`
10. Only `follow-store.tsx` in the diff
11. Steering docs updated

# Tasks — Replace mock-data.currentUser with Real Supabase Profile

Complete in order. Do not start a task until the previous one is recorded done.

---

## T-1 Confirm SessionUser / currentUser shape compatibility

**Files:** `src/lib/mock-data.ts`, `src/lib/auth.tsx`

**Work:**
- Confirm every field read from `currentUser` across the 17 consuming files exists in `SessionUser`
- Confirm `SessionUser` has `updateUser(patch: Partial<SessionUser>)` exposed via `useAuth()` from `@/lib/auth`
- Confirm no consumer reads a banned field (`is_creator`, `age`, `date_of_birth`, `email`, `phone`)

**Acceptance criteria:**
- [ ] All consumed fields (`name`, `handle`, `uid`, `avatar`, `banner`, `bio`, `location`, `link`, `verified`, `stats`) exist in `SessionUser`
- [ ] `updateUser` is in `AuthCtx` and callable from a child of `<AuthProvider>`
- [ ] No banned field is read by any consumer

**Visual preservation:** Read-only audit. No files changed.
**TypeScript/build:** Not applicable — no code changes.
**Rollback risk:** None.

---

## T-2 Create `src/hooks/use-current-user.ts`

**Files:** `src/hooks/use-current-user.ts` (new)

**Work:** Implement per design.md:
- Import `useAuth` from `@/hooks/use-auth` (Supabase) for `user.id` and `isSignedIn`
- Import `createBrowserClient` from `@/lib/supabase-browser`
- Import `currentUser` from `@/lib/mock-data` as fallback
- Import `SessionUser` type from `@/lib/auth`
- If `!isSignedIn`: return `currentUser` immediately, no fetch
- Fetch `profiles` where `id = user.id`, selecting only safe columns:
  `id, public_profile_uid, display_name, username, avatar_url, banner_url, bio, location, created_at, role, verification_type, is_verified, verified_creator, profile_accent_color`
- While loading or on error or missing row: return `currentUser`
- On success: return mapped `SessionUser` per field mapping table in design.md
- Return type must be `SessionUser` — never `null`

**Acceptance criteria:**
- [ ] Return type is `SessionUser` (not nullable)
- [ ] Signed-out path returns `currentUser` without any fetch
- [ ] Loading and error paths return `currentUser`
- [ ] No banned column appears in the `.select()` string (`is_creator`, `age`, `date_of_birth`, `email`, `phone`)
- [ ] `pnpm tsc --noEmit` passes after this file is added

**Visual preservation:** New file only. No component or route changes. Zero visual risk.
**TypeScript/build:** `pnpm tsc --noEmit` must pass before proceeding to T-3.
**Rollback risk:** Low — deleting this file fully reverts.

---

## T-3 Create `src/components/CurrentUserSync.tsx`

**Files:** `src/components/CurrentUserSync.tsx` (new)

**Work:** Implement the zero-render bridge component:
- Import `useCurrentUser` from `@/hooks/use-current-user`
- Import `useAuth` from `@/lib/auth` (mock AuthProvider) for `updateUser`
- Import `currentUser` from `@/lib/mock-data` for the guard check
- In a `useEffect` keyed on the fetched profile's `uid`: call `updateUser(realProfile)` only when `realProfile.uid !== currentUser.uid` (i.e. real data has arrived, not the mock fallback)
- Return `null`

**Acceptance criteria:**
- [ ] Component renders `null` — no DOM output
- [ ] `updateUser` is only called when real profile data is present (guard on `uid`)
- [ ] `updateUser` is never called with the mock fallback
- [ ] `pnpm tsc --noEmit` passes after this file is added

**Visual preservation:** Renders nothing. Zero visual risk.
**TypeScript/build:** `pnpm tsc --noEmit` must pass before proceeding to T-4.
**Rollback risk:** Low — removing from `__root.tsx` fully reverts.

---

## T-4 Mount `<CurrentUserSync />` in `src/routes/__root.tsx`

**Files:** `src/routes/__root.tsx`

**Work:**
- Add one import: `import { CurrentUserSync } from "@/components/CurrentUserSync"`
- Add one JSX element: `<CurrentUserSync />` directly inside `<AuthProvider>` in `RootComponent`
- Make no other changes to this file

**Acceptance criteria:**
- [ ] `<CurrentUserSync />` appears exactly once in `RootComponent`
- [ ] No existing provider, component, or element is moved, wrapped, or removed
- [ ] Diff is exactly: +1 import line, +1 JSX element

**Visual preservation:** `CurrentUserSync` renders `null`. No visual change possible.
**TypeScript/build:** Run both after this step — both must pass before proceeding:
```
pnpm tsc --noEmit
pnpm build
```
**Rollback risk:** Low — remove the import and JSX element to fully revert.

---

## T-5 Validate no banned profile fields are queried

**Files:** `src/hooks/use-current-user.ts`

**Work:** Inspect the `.select()` string in the new hook. Confirm none of the following appear:
`is_creator`, `age`, `date_of_birth`, `email`, `phone`, `onboarding_answers`, or any column not in the safe list from requirements FR-5.

**Acceptance criteria:**
- [ ] `.select()` string contains only safe columns
- [ ] No banned field name appears anywhere in the file

**Visual preservation:** Inspection only. No changes unless a banned field is found.
**TypeScript/build:** Re-run `pnpm tsc --noEmit` if any correction is made.
**Rollback risk:** None if no changes needed.

---

## T-6 Validate no UI files changed beyond `__root.tsx`

**Files:** All files in `src/components/` and `src/routes/` except `__root.tsx` and the two new files

**Work:** Confirm the git diff contains changes only to:
- `src/hooks/use-current-user.ts` (new)
- `src/components/CurrentUserSync.tsx` (new)
- `src/routes/__root.tsx` (one import + one JSX element)

No other file should appear in the diff.

**Acceptance criteria:**
- [ ] Exactly 3 files in the diff
- [ ] None of the 17 `currentUser`-consuming files are modified
- [ ] `src/lib/mock-data.ts` is unmodified
- [ ] `src/lib/auth.tsx` is unmodified

**Visual preservation:** Confirms zero UI changes.
**TypeScript/build:** Not applicable — inspection only.
**Rollback risk:** None.

---

## T-7 Run `pnpm tsc --noEmit`

```
cd C:\Users\info\TREY-TV-ANTIGRAVITY
pnpm tsc --noEmit
```

**Acceptance criteria:**
- [ ] Zero errors
- [ ] If errors exist: fix only in the two new files, re-run before proceeding

**Visual preservation:** Not applicable.
**Rollback risk:** None from running the check.

---

## T-8 Run `pnpm build`

```
cd C:\Users\info\TREY-TV-ANTIGRAVITY
pnpm build
```

**Acceptance criteria:**
- [ ] Build completes with zero errors
- [ ] If errors exist: fix only in the two new files, re-run before proceeding

**Visual preservation:** Not applicable.
**Rollback risk:** None from running the check.

---

## T-9 Confirm BottomNav / AppHeader / SideMenu receive real data

**Dev server:** `pnpm dev` → http://localhost:3000 with a signed-in Supabase session

**Work:** Verify that `updateUser()` propagating through `@/lib/auth` reaches the three
layout components that use `user ?? currentUser` or `currentUser` directly:

- `BottomNav` (`src/components/layout/BottomNav.tsx`) — profile avatar + link to `/u/$uid`
- `AppHeader` (`src/components/layout/AppHeader.tsx`) — avatar + link to `/u/$uid`
- `SideMenu` (`src/components/layout/SideMenu.tsx`) — name, handle, avatar in profile card

**Acceptance criteria:**
- [ ] BottomNav avatar shows real `avatar_url` (or mock if null in DB)
- [ ] BottomNav profile link navigates to `/u/${real_public_profile_uid}`
- [ ] AppHeader avatar shows real avatar
- [ ] SideMenu shows real `display_name` and `username`
- [ ] No console errors
- [ ] No layout shift or flash

**Visual preservation:** Layout must be identical — only data values change.
**TypeScript/build:** Already validated in T-7/T-8.
**Rollback risk:** If any check fails, remove `<CurrentUserSync />` from `__root.tsx`.

---

## T-10 Confirm signed-out fallback uses mock `currentUser`

**Dev server:** http://localhost:3000 in incognito (no session)

**Acceptance criteria:**
- [ ] Feed renders normally
- [ ] BottomNav shows mock avatar, links to mock UID
- [ ] AppHeader shows mock avatar
- [ ] SideMenu shows mock name/handle
- [ ] No console errors from `useCurrentUser` or `CurrentUserSync`
- [ ] Visual output identical to pre-change state

**Visual preservation:** Must be pixel-identical to current signed-out state.
**TypeScript/build:** Already validated in T-7/T-8.
**Rollback risk:** If any check fails, remove `<CurrentUserSync />` from `__root.tsx`.

---

## T-11 Update steering docs

**Files:** `.kiro/steering/migration-map.md`, `.kiro/steering/file-map.md`

- Move "Current user profile" from 🟡 Mock to ✅ Real in `migration-map.md`
- Add `use-current-user.ts` (REAL) and `CurrentUserSync.tsx` to hooks/components sections of `file-map.md`

---

## Definition of Done

All of the following must be true before this task is closed:
1. `pnpm tsc --noEmit` passes
2. `pnpm build` passes
3. Signed-out: mock fallback renders, no crash, visually identical to today
4. Signed-in: real `display_name`, `username`, `avatar_url`, `public_profile_uid` visible in BottomNav / AppHeader / SideMenu
5. No banned columns queried
6. Exactly 3 files changed (2 new + `__root.tsx`)
7. Steering docs updated

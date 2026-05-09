# Tasks — Wire Edit Profile to Supabase

Complete in order. Do not start a task until the previous one is recorded done.
Terminal validation only — no browser checks, no screenshots, no Playwright.

---

## T-1 Confirm schema and RLS

**Files:** `C:\Users\info\TREY-TV-RESTORE-599\supabase\migrations\20260427133000_trey_tv_social_platform.sql`,
`20260429183000_trey_tv_public_private_social_streaming.sql`

**Work:** Confirm:
- `profiles.id = auth.users.id` (PK is the auth UID)
- `display_name`, `username`, `bio`, `location` exist in the base migration
- `username` has UNIQUE constraint
- `profile_accent_color` — not in RESTORE migrations; the live app's `use-current-user.ts`
  already selects it, so it exists in the live DB. Confirm the column name used in
  `use-current-user.ts` is `profile_accent_color` (not `profile_theme_color`)
- RLS `"Users manage own profile"` covers ALL operations with `auth.uid() = id`
- `public_profile_uid`, `role`, `verification_type`, `is_verified`, `verified_creator`
  must NOT be in the UPDATE payload

**Acceptance criteria:**
- [ ] Safe writable columns confirmed: `display_name`, `username`, `bio`, `location`, `profile_accent_color`
- [ ] `username` UNIQUE constraint confirmed
- [ ] RLS `for all` confirmed — covers UPDATE
- [ ] Banned columns confirmed as excluded from UPDATE

**Visual preservation:** Read-only. No changes.
**Terminal validation:** Not applicable.
**Rollback risk:** None.

---

## T-2 Confirm `edit-profile.tsx` current `save()` behavior

**Files:** `src/routes/edit-profile.tsx`

**Work:** Confirm:
- `save()` is currently synchronous
- It calls `updateUser()` from `useAuth()` (`@/lib/auth`) — mock only
- It calls `toast.success()` then navigates
- `draft` contains: `name`, `handle`, `bio`, `location`, `link`, `avatar`, `banner`, `accent`
- `avatar` and `banner` are set via `URL.createObjectURL()` — local blob URLs
- No existing import of `useAuth` from `@/hooks/use-auth`

**Acceptance criteria:**
- [ ] `save()` confirmed as synchronous with no DB call
- [ ] Blob URL behavior for avatar/banner confirmed
- [ ] No existing Supabase import in this file

**Visual preservation:** Read-only. No changes.
**Terminal validation:** Not applicable.
**Rollback risk:** None.

---

## T-3 Modify `src/routes/edit-profile.tsx`

**Files:** `src/routes/edit-profile.tsx`

**Work:** Make the minimal changes per design.md:

1. Add import: `import { useAuth as useSupabaseAuth } from "@/hooks/use-auth"`
2. Add import: `import { createBrowserClient } from "@/lib/supabase-browser"`
3. Inside `EditProfile()`, add: `const { user: supabaseUser } = useSupabaseAuth()`
4. Make `save` an async function
5. If `supabaseUser` exists (signed-in path):
   - Attempt `supabase.from("profiles").update({...}).eq("id", supabaseUser.id)`
   - On error code `"23505"`: `toast("Username already taken — try another")`, return (no `updateUser`, no nav)
   - On other error: `toast("Failed to save profile")`, return (no `updateUser`, no nav)
   - On DB success: call `updateUser()` with draft values, then `toast.success("Profile published ✨")`, then navigate
6. If no `supabaseUser` (signed-out path):
   - Call `updateUser()` (existing mock behavior)
   - `toast.success("Profile published ✨")`
   - Navigate

**Fields in UPDATE payload — exactly these five, nothing else:**
```ts
{
  display_name: draft.name,
  username: draft.handle,
  bio: draft.bio,
  location: draft.location,
  profile_accent_color: draft.accent,
}
```

**Fields NOT in payload:** `avatar_url`, `banner_url`, `website_url`, `public_profile_uid`,
`role`, `verification_type`, `is_verified`, `verified_creator`, `id`

**Acceptance criteria:**
- [ ] DB write runs before `updateUser()` for signed-in users
- [ ] `updateUser()` is NOT called if the DB write fails
- [ ] DB write only runs when `supabaseUser` is present
- [ ] UPDATE payload contains exactly the five safe fields
- [ ] No banned field in the UPDATE payload
- [ ] Username conflict (error code `"23505"`) shows specific toast, no `updateUser`, no navigation
- [ ] Other DB error shows generic toast, no `updateUser`, no navigation
- [ ] Signed-out path: `updateUser()` runs, DB skipped, success toast, navigate
- [ ] No JSX changes — only the `save` function and two imports are modified
- [ ] `pnpm tsc --noEmit` passes

**Visual preservation:** Only `save()` function and imports change. Zero JSX changes.
**Terminal validation:** `pnpm tsc --noEmit` must pass before proceeding to T-4.
**Rollback risk:** Low — revert `save()` to synchronous form and remove two imports.

---

## T-4 Validate no banned fields in UPDATE payload

**Files:** `src/routes/edit-profile.tsx`

**Work:** Inspect the `.update({...})` call. Confirm none of the following appear:
`avatar_url`, `banner_url`, `website_url`, `public_profile_uid`, `role`,
`verification_type`, `is_verified`, `verified_creator`, `is_creator`, `age`,
`date_of_birth`, `id`

**Acceptance criteria:**
- [ ] UPDATE payload contains only: `display_name`, `username`, `bio`, `location`, `profile_accent_color`

**Terminal validation:** `pnpm tsc --noEmit` if any correction is made.
**Visual preservation:** Inspection only.
**Rollback risk:** None if no changes needed.

---

## T-5 Validate no other files changed

**Files:** All files except `src/routes/edit-profile.tsx`

**Work:** Confirm the git diff contains changes only to `src/routes/edit-profile.tsx`.

**Acceptance criteria:**
- [ ] Exactly one file in the diff
- [ ] No RESTORE component imported

**Terminal validation:** `git diff --name-only` should show only `edit-profile.tsx`.
**Visual preservation:** Confirms zero UI changes elsewhere.
**Rollback risk:** None.

---

## T-6 Run `pnpm tsc --noEmit`

```
cd C:\Users\info\TREY-TV-ANTIGRAVITY
pnpm tsc --noEmit
```

**Acceptance criteria:**
- [ ] Zero errors
- [ ] If errors: fix only in `edit-profile.tsx`, re-run before proceeding

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
- [ ] If errors: fix only in `edit-profile.tsx`, re-run before proceeding

**Terminal validation:** This is the validation.
**Visual preservation:** Not applicable.
**Rollback risk:** None from running the check.

---

## T-8 Confirm signed-out path does not crash (code review)

**Files:** `src/routes/edit-profile.tsx`

**Work:** Code review only — no browser check.

Trace the signed-out path through `save()`:
1. `supabaseUser` is `null` → DB write block is skipped entirely
2. `updateUser()` runs (mock — always safe for signed-out)
3. `toast.success()` fires
4. Navigation proceeds
5. No unhandled promise rejection

**Acceptance criteria:**
- [ ] `supabaseUser` null-check gates the entire DB block
- [ ] `updateUser()` is called in the signed-out path (mock behavior preserved)
- [ ] No crash path exists for signed-out users

**Terminal validation:** `pnpm tsc --noEmit` if any correction is made.
**Visual preservation:** Code review only.
**Rollback risk:** Low.

---

## T-9 Update steering docs

**Files:** `.kiro/steering/migration-map.md`, `.kiro/steering/file-map.md`

**Work:**
- Move "Edit profile" from 🔴 Not Started to ✅ Real in `migration-map.md`
- Note: text fields only (`display_name`, `username`, `bio`, `location`, `profile_accent_color`); avatar/banner upload out of scope
- Note: tsc ✅ build ✅, no browser validation
- Strike item 4 from priority order

---

## Definition of Done

All of the following must be true before this task is closed:
1. `pnpm tsc --noEmit` passes
2. `pnpm build` passes
3. Signed-in: DB write runs first; `updateUser()` only called on DB success
4. Signed-out: `updateUser()` runs, DB skipped, no crash
5. Banned fields absent from UPDATE payload
6. Username conflict shows specific toast, no navigation
7. Signed-out: mock update runs, DB skipped, no crash
8. Only `edit-profile.tsx` in the diff
9. No JSX changes in `edit-profile.tsx`
10. Steering docs updated

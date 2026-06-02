# Tasks: Default Profile Layout System for New Users

**Project:** Trey TV Antigravity  
**Date:** 2026-05-09

---

## Pre-commit note

The WIP is already written and TypeScript/build pass. There is one required fix before committing. After the fix, the commit is clean.

---

## Task 1 — Fix `is_creator` stale reference

**Files involved:**

- `src/hooks/use-profile.ts`
- `src/routes/u.$uid.tsx`

**What to do:**

In `src/hooks/use-profile.ts`, remove `is_creator: boolean` from `SupabaseProfile`:

```ts
// Remove this line:
is_creator: boolean;
```

In `src/routes/u.$uid.tsx`:

1. Remove the JSDoc comment line `*   - If dbProfile.is_creator === true → "creator"` (line ~19).
2. Replace the `isCreatorProfile` expression:

```ts
// BEFORE:
const isCreatorProfile =
  dbProfile.is_creator || (isOwnProfile && (role === "creator" || role === "admin"));

// AFTER:
const isCreatorProfile = isOwnProfile && (role === "creator" || role === "admin");
```

**Acceptance criteria:**

- `is_creator` does not appear in `use-profile.ts`.
- `dbProfile.is_creator` does not appear in `u.$uid.tsx`.
- `pnpm tsc --noEmit` passes with zero errors.
- No visual change — `dbProfile.is_creator` was always `undefined` at runtime (column not in SELECT).

**Security boundary:**

- `profiles.is_creator` column does not exist — removing the reference is a correctness fix, not a security change.

**Visual preservation rule:**

- No JSX changes. No layout changes. No styling changes.

**Terminal validation only:**

```
pnpm tsc --noEmit
```

**Rollback risk:** None. The expression was already effectively `false || (isOwnProfile && ...)` since `dbProfile.is_creator` was always `undefined`.

---

## Task 2 — Commit the spec

**Files involved:**

- `.kiro/specs/default-profile-layout-system/` (new directory)

**What to do:**

```
git add .kiro/specs/default-profile-layout-system
git commit -m "Add default profile layout system spec"
```

**Acceptance criteria:**

- Spec directory committed with `requirements.md`, `design.md`, `tasks.md`.

**Rollback risk:** None. Spec files only.

---

## Task 3 — Commit the implementation

**Files involved:**

- `src/hooks/use-profile.ts` (fix from Task 1)
- `src/routes/u.$uid.tsx` (fix from Task 1 + ProfilePageShell wiring)
- `src/components/profile/` (all 12 new files)

**What to do:**

```
git add src/hooks/use-profile.ts
git add src/routes/u.$uid.tsx
git add src/components/profile/
git commit -m "Add reusable profile layout system for all user types"
```

**Acceptance criteria:**

- All 12 `src/components/profile/` files committed.
- `src/routes/u.$uid.tsx` committed with `is_creator` fix applied.
- `src/hooks/use-profile.ts` committed with `is_creator` removed from type.
- `pnpm tsc --noEmit` passes.
- `pnpm build` passes.

**Security boundary:**

- No Supabase queries added beyond what `useProfile` already does.
- No service-role key. No `profiles.is_creator`. No `profiles.age`.

**Visual preservation rule:**

- Profile page layout, styling, and behavior are preserved from the existing Lovable design.
- No Lovable components replaced.

**Terminal validation only:**

```
pnpm tsc --noEmit
pnpm build
git log --oneline -3
```

**Rollback risk:** Low. Revert `u.$uid.tsx` to the previous version. The `src/components/profile/` directory can remain — it is not imported anywhere else.

---

## Task 4 — Verify no impact on Creator/admin pipeline

**What to do:**

```
grep -rn "is_creator" src/routes/u.\$uid.tsx
grep -rn "is_creator" src/hooks/use-profile.ts
grep -rn "is_creator" src/components/profile/
```

All three greps must return no matches.

**Acceptance criteria:**

- `is_creator` absent from all profile system files.
- `profiles.age` absent from all profile system files.
- `date_of_birth` absent from all profile system files.
- Creator Studio routes, admin routes, and Watch Now/Guide routes are unchanged.

**Terminal validation only:**

```
grep -rn "is_creator" src/routes/u.\$uid.tsx
grep -rn "is_creator" src/hooks/use-profile.ts
grep -rn "is_creator" src/components/profile/
git diff --name-only HEAD~1
```

**Rollback risk:** None. Verification only.

---

## Completion Checklist

- [ ] Task 1: `is_creator` removed from `use-profile.ts` and `u.$uid.tsx` — `tsc` passes
- [ ] Task 2: Spec committed
- [ ] Task 3: Implementation committed — `tsc` + `build` pass
- [ ] Task 4: Verification — `is_creator` absent, pipeline untouched

---

## Files in the Commit

### Modified:

- `src/hooks/use-profile.ts` — remove `is_creator: boolean` from `SupabaseProfile`
- `src/routes/u.$uid.tsx` — remove `dbProfile.is_creator` reference, wire `ProfilePageShell`

### New (`src/components/profile/`):

- `ProfileTypes.ts`
- `ProfilePageShell.tsx`
- `ProfileBanner.tsx`
- `ProfileIdentityCard.tsx`
- `ProfileStatsBar.tsx`
- `ProfileActionBar.tsx`
- `ProfileOwnerControls.tsx`
- `PublicProfileControls.tsx`
- `ProfileSectionCard.tsx`
- `NormalUserProfileModules.tsx`
- `CreatorProfileModules.tsx`
- `index.ts`

---

## What Is Not Touched

| File                                  | Status    |
| ------------------------------------- | --------- |
| `src/hooks/use-creator-studio.ts`     | Unchanged |
| `src/hooks/use-creator-submit.ts`     | Unchanged |
| `src/hooks/use-creator-post-queue.ts` | Unchanged |
| `src/hooks/use-admin-post-queue.ts`   | Unchanged |
| `src/lib/admin/post-queue.server.ts`  | Unchanged |
| All Creator Studio routes             | Unchanged |
| All admin routes                      | Unchanged |
| Watch Now / Guide routes              | Unchanged |

---

## Future Work (out of scope for this spec)

- Wire real follower/post/watch-hour stats from Supabase into `ProfileData.stats`
- Wire real episode data in `CreatorProfileModules` from `use-creator-studio.ts`
- Wire real "Frequently watched together" from `follows` table
- Avatar / banner upload in Edit Profile
- Profile completion percentage from real field coverage
- Real analytics data in `ProfileOwnerControls`

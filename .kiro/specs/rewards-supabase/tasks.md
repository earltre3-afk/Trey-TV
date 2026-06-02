# Tasks: Rewards — Supabase Wiring

**Project:** Trey TV Antigravity  
**Date:** 2026-05-09  
**Prerequisite:** requirements.md and design.md approved.

---

## Task 1 — Preserve hardcoded values as rollback target

**Files involved:**

- `src/routes/rewards.tsx`

**What to do:**
Add comment blocks in `rewards.tsx` immediately above the three hardcoded value lines and the `transactions` array:

```ts
// MOCK FALLBACK — restore these if useRewards() is reverted
// const points = user?.rewards?.points ?? 12480;
// const tier = user?.rewards?.tier ?? "GOLD";
// const uid = user?.uid ?? "0000000000000000";
// const transactions = [ ...5 items... ];
// Quick stats: "+3,240", "1,800", "12d"
```

Do not change any logic.

**Acceptance criteria:**

- Comment blocks exist above the relevant lines.
- No logic changed.
- `pnpm tsc --noEmit` passes.
- `pnpm build` passes.

**Visual preservation:** No UI change. Additive comments only.

**Rollback risk:** None.

**Terminal validation:**

```
pnpm tsc --noEmit
pnpm build
```

---

## Task 2 — Define internal types and pure helper functions

**Files involved:**

- `src/hooks/use-rewards.ts` (new file)

**What to do:**
Create `src/hooks/use-rewards.ts` with only types and pure helper functions — no React, no Supabase calls yet.

Include:

1. `BalanceRow` type (internal, unexported)
2. `EventRow` type (internal, unexported)
3. `RewardTransaction` type (exported)
4. `UseRewardsReturn` type (exported)
5. `TIER_LABELS` constant and `toTier(level)` function
6. `EVENT_TITLES` constant and `toTitle(eventType)` function
7. `timeAgo(iso)` function

Export only `RewardTransaction`, `UseRewardsReturn`, and the three helper functions.

**Acceptance criteria:**

- File compiles with zero TypeScript errors.
- No React imports, no Supabase imports.
- `pnpm tsc --noEmit` passes.

**Visual preservation:** No UI change. New file, nothing imports it yet.

**Rollback risk:** None.

**Terminal validation:**

```
pnpm tsc --noEmit
```

---

## Task 3 — Implement `useRewards()` hook

**Files involved:**

- `src/hooks/use-rewards.ts`
- `src/hooks/use-current-user.ts` (read-only reference)
- `src/lib/supabase-browser.ts` (read-only reference)

**What to do:**
Add the `useRewards()` hook to `src/hooks/use-rewards.ts`:

1. Import `useState`, `useEffect` from React.
2. Import `useCurrentUser` from `@/hooks/use-current-user`.
3. Import `supabase` from `@/lib/supabase-browser`.
4. Implement the hook per design.md §3a:
   - If `user` is null: return zero/empty state, no Supabase call.
   - Parallel fetch: `community_credit_balances` (`.maybeSingle()`) + `community_credit_events` (limit 20, status=approved).
   - If balance row is null: use zero defaults.
   - On any error: use zero defaults, no crash, no alert.
   - Map results using `toTier()`, `toTitle()`, `timeAgo()`.
5. Export `useRewards` as named export.

**Acceptance criteria:**

- Hook compiles with zero TypeScript errors.
- Signed-out path returns zero state without calling Supabase.
- `pnpm tsc --noEmit` passes.
- `pnpm build` passes.

**Visual preservation:** No UI change. Hook not yet consumed.

**Rollback risk:** Low. New file, nothing imports it yet.

**Terminal validation:**

```
pnpm tsc --noEmit
pnpm build
```

---

## Task 4 — Wire `useRewards()` and `useCurrentUser()` into `rewards.tsx`

**Files involved:**

- `src/routes/rewards.tsx`
- `src/hooks/use-rewards.ts` (read-only)
- `src/hooks/use-current-user.ts` (read-only)

**What to do:**
Make five targeted replacements in `rewards.tsx`:

1. Add imports:

   ```ts
   import { useRewards } from "@/hooks/use-rewards";
   import { useCurrentUser } from "@/hooks/use-current-user";
   ```

2. Inside `Rewards()`, add:

   ```ts
   const { balance, tier, streakDays, lifetimeEarned, lifetimeSpent, transactions } = useRewards();
   const currentUser = useCurrentUser();
   ```

3. Replace:

   ```ts
   // before:
   const points = user?.rewards?.points ?? 12480;
   const tier = user?.rewards?.tier ?? "GOLD";
   const uid = user?.uid ?? "0000000000000000";
   // after:
   const points = balance;
   // tier already from hook
   const uid = currentUser?.public_profile_uid ?? currentUser?.id ?? "0000000000000000";
   ```

4. Remove the hardcoded `const transactions = [...]` array (it is now from the hook).

5. Replace quick stats hardcoded values:
   - `"+3,240"` → `` `+${lifetimeEarned.toLocaleString()}` ``
   - `"1,800"` → `lifetimeSpent.toLocaleString()`
   - `"12d"` → `` `${streakDays}d` ``

Do not change any JSX structure, class names, or layout.

**Acceptance criteria:**

- `points`, `tier`, `uid` read from real Supabase data when signed in.
- `transactions` list renders real events (or empty list if none).
- Quick stats show real lifetime/streak values.
- Signed-out: all values are zero/empty, no crash.
- Gift sending and perk redemption still fire `toast.success(...)` unchanged.
- `pnpm tsc --noEmit` passes.
- `pnpm build` passes.

**Visual preservation:** No structural, layout, or style changes to `rewards.tsx`. The rewards card, gift section, perks section, and history section look identical. If no balance record exists in Supabase, points show `0` and transactions list is empty — correct behavior, not a regression.

**Rollback risk:** Medium. Rollback: remove the two new imports and hook calls, uncomment the mock fallback blocks from Task 1.

**Terminal validation:**

```
pnpm tsc --noEmit
pnpm build
```

---

## Task 5 — Final cleanup and verification

**Files involved:**

- `src/hooks/use-rewards.ts`
- `src/routes/rewards.tsx`

**What to do:**

1. Remove any unused imports from both files.
2. Confirm `user?.rewards` references are fully replaced (no dangling `user?.rewards?.points` or `user?.rewards?.tier`).
3. Confirm mock fallback comment blocks are still present in `rewards.tsx`.
4. Run full type check and build.

**Acceptance criteria:**

- Zero TypeScript errors: `pnpm tsc --noEmit`.
- Clean production build: `pnpm build`.
- No unused imports in modified files.
- No remaining `user?.rewards` references.
- Mock fallback comment block still present.

**Visual preservation:** No UI change.

**Rollback risk:** None. Cleanup only.

**Terminal validation:**

```
pnpm tsc --noEmit
pnpm build
```

---

## Summary Table

| #   | Task                           | Files                | Risk   | Validation  |
| --- | ------------------------------ | -------------------- | ------ | ----------- |
| 1   | Preserve mock as rollback      | rewards.tsx          | None   | tsc + build |
| 2   | Types and pure helpers         | use-rewards.ts (new) | None   | tsc         |
| 3   | Implement useRewards() hook    | use-rewards.ts       | Low    | tsc + build |
| 4   | Wire hook into rewards.tsx     | rewards.tsx          | Medium | tsc + build |
| 5   | Final cleanup and verification | both                 | None   | tsc + build |

All tasks are sequential. Do not start a task until the previous task's validation passes.

---

## Do Not Touch

- Gift sending logic (remains `toast.success(...)`)
- Perk redemption logic (remains `toast.success(...)`)
- `giftPacks` and `perks` hardcoded arrays (remain as-is)
- Creator strip (remains `mock-data.ts creators`)
- Any RESTORE UI components
- `community_rewards`, `community_badges`, `user_badges`, `reward_redemptions` tables (out of scope this phase)

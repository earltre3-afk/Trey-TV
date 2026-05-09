# Tasks: Creator Studio — Read-Only Dashboard Wiring

**Project:** Trey TV Antigravity  
**Date:** 2026-05-09  
**Prerequisite:** requirements.md and design.md approved.

---

## Task 1 — Define internal types and pure helper functions

**Files involved:**
- `src/hooks/use-creator-studio.ts` (new file)

**What to do:**
Create `src/hooks/use-creator-studio.ts` with only types and pure helper functions — no React, no Supabase calls yet.

Include:
1. `ChannelRow`, `ShowRow`, `EpisodeRow` internal types (unexported)
2. `CreatorStudioData` type (exported)
3. `publishStatusToSubmissionStatus(s: string): SubmissionStatus` — pure function
4. `episodeToSubmission(ep: EpisodeRow, shows: ShowRow[]): Submission` — pure function

Import `Submission` and `SubmissionStatus` from `@/lib/submissions-store` (type-only import).

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

## Task 2 — Implement `useCreatorStudio()` hook

**Files involved:**
- `src/hooks/use-creator-studio.ts`
- `src/hooks/use-current-user.ts` (read-only reference)
- `src/lib/supabase-browser.ts` (read-only reference)

**What to do:**
Add the `useCreatorStudio()` hook:

1. Import `useState`, `useEffect` from React.
2. Import `supabase` from `@/lib/supabase-browser`.
3. Import `useCurrentUser` from `@/hooks/use-current-user` (for `user.id` presence check only).
4. On mount:
   - Call `supabase.auth.getUser()` to get the authenticated email (see design.md §4).
   - If no email: return empty state.
   - Query `channels` with `.eq('owner_email', email).in('status', ['draft','active']).maybeSingle()`.
   - If no channel: `isApprovedCreator = false`, return.
   - Parallel fetch `shows` and `episodes` for `channel.id` (see design.md §3a).
   - Map episodes → `Submission[]` using `episodeToSubmission()`.
   - Set state.
5. On any error: empty state, no crash, no alert.
6. Export `useCreatorStudio` as named export.

**Acceptance criteria:**
- Hook compiles with zero TypeScript errors.
- Signed-out path returns empty state without querying `channels`.
- Non-creator signed-in path returns `isApprovedCreator: false`.
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

## Task 3 — Wire access gate in `CreatorStudioLayout`

**Files involved:**
- `src/components/layout/CreatorStudioLayout.tsx`
- `src/hooks/use-creator-studio.ts` (read-only)

**What to do:**
1. Add import: `import { useCreatorStudio } from '@/hooks/use-creator-studio';`
2. Inside `CreatorStudioLayout`, add: `const { isApprovedCreator } = useCreatorStudio();`
3. Replace: `if (!isApprovedCreator)` — change the source from `useAuth().isApprovedCreator` to the hook's value.
4. Keep `isGuest` check and redirect from `useAuth()` unchanged.
5. Keep `creatorStatus` from `useAuth()` for the `CreatorGate` component (it still needs a status string for copy).

**Acceptance criteria:**
- Non-creator signed-in users see `CreatorGate` (unchanged UI).
- Signed-out users redirect to `/login` (unchanged).
- Approved creators (channel exists in Supabase) see the studio layout.
- `pnpm tsc --noEmit` passes.
- `pnpm build` passes.

**Visual preservation:** `CreatorGate` UI, studio top bar, and nav rail are structurally unchanged. The only change is the boolean source for the gate condition.

**Rollback risk:** Medium. Rollback: revert `isApprovedCreator` source back to `useAuth()`, remove the hook import.

**Terminal validation:**
```
pnpm tsc --noEmit
pnpm build
```

---

## Task 4 — Wire `creator-studio.index.tsx` to real data

**Files involved:**
- `src/routes/creator-studio.index.tsx`
- `src/hooks/use-creator-studio.ts` (read-only)

**What to do:**
1. Add import: `import { useCreatorStudio } from '@/hooks/use-creator-studio';`
2. Inside `CreatorStudioDashboard`, add: `const { submissions } = useCreatorStudio();`
3. Remove (or keep unused): `const { submissions } = useSubmissions();` — replace with the hook's `submissions`.
4. `pending`, `approved`, `needsChanges`, `top` derivations remain unchanged — they operate on the `submissions` array.
5. `myName` and `channelHandle` remain from `useAuth()` — no change.
6. Metric cards (Views, Watch Time, etc.) remain hardcoded — no change.

**Acceptance criteria:**
- Dashboard shows real episode counts for pending/approved/needs_changes.
- Best performer shows real episode title (or `—` if none).
- Recent submissions snapshot shows real episodes.
- Empty state renders correctly when no episodes exist.
- `pnpm tsc --noEmit` passes.
- `pnpm build` passes.

**Visual preservation:** No structural changes. Metric cards, quick actions, today's channel section, and channel link strip are unchanged.

**Rollback risk:** Low. Revert: swap `useCreatorStudio()` back to `useSubmissions()`, remove import.

**Terminal validation:**
```
pnpm tsc --noEmit
pnpm build
```

---

## Task 5 — Wire `creator-studio.submissions.tsx` to real data

**Files involved:**
- `src/routes/creator-studio.submissions.tsx`
- `src/hooks/use-creator-studio.ts` (read-only)

**What to do:**
1. Add import: `import { useCreatorStudio } from '@/hooks/use-creator-studio';`
2. Replace: `const store = useSubmissions()` → `const { submissions } = useCreatorStudio()`
3. Replace: `const mine = user ? store.byCreator(user.uid) : store.submissions` → `const mine = submissions`
4. Replace the `store.remove(id)` call in `bulkDelete` and `RowActions` with: `toast('Delete not available in this version')` (no write this phase).
5. Keep `STATUS_LABEL`, `STATUS_TONE` imports from `submissions-store` — still needed for rendering.
6. Keep all filter, search, grid/list, and bulk select logic unchanged.

**Acceptance criteria:**
- Submissions page shows real episodes from Supabase.
- Filter chips count real episodes by status.
- Delete button shows toast instead of removing (no crash).
- Empty state renders when no episodes exist.
- `pnpm tsc --noEmit` passes.
- `pnpm build` passes.

**Visual preservation:** No structural changes to the submissions page UI.

**Rollback risk:** Low. Revert: swap back to `useSubmissions()`, restore `store.remove()` call.

**Terminal validation:**
```
pnpm tsc --noEmit
pnpm build
```

---

## Task 6 — Wire `creator-studio.analytics.tsx` episode table

**Files involved:**
- `src/routes/creator-studio.analytics.tsx`
- `src/hooks/use-creator-studio.ts` (read-only)

**What to do:**
1. Add import: `import { useCreatorStudio } from '@/hooks/use-creator-studio';`
2. Replace: `const store = useSubmissions()` → `const { episodes } = useCreatorStudio()`
3. Replace the `episodes` derivation:
   ```ts
   // before:
   const episodes = useMemo(() =>
     store.submissions.filter(s => s.status === 'approved' || s.status === 'published' || s.status === 'scheduled').slice(0, 8)
   , [store.submissions]);
   // after:
   const episodes = useMemo(() =>
     episodes.filter(ep => ep.publish_status === 'published').slice(0, 8)
   , [episodes]);
   ```
   Note: rename the local variable to avoid shadowing — use `studioEpisodes` from the hook.
4. Episode table rows: use `ep.id`, `ep.title`, `ep.season_number`, `ep.episode_number` directly.
5. Sparkline values remain randomly generated — no change.
6. All other analytics sections (overview metrics, traffic sources, Trey-I insights, hourly chart) remain hardcoded.

**Acceptance criteria:**
- Episode performance table shows real published episodes.
- Empty state row renders when no published episodes exist.
- All other analytics sections unchanged.
- `pnpm tsc --noEmit` passes.
- `pnpm build` passes.

**Visual preservation:** No structural changes to the analytics page.

**Rollback risk:** Low. Revert: swap back to `useSubmissions()`.

**Terminal validation:**
```
pnpm tsc --noEmit
pnpm build
```

---

## Task 7 — Wire fans page follower count

**Files involved:**
- `src/routes/creator-studio.fans.tsx`
- `src/hooks/use-current-user.ts` (read-only)

**What to do:**
1. Add import: `import { useCurrentUser } from '@/hooks/use-current-user';`
2. Inside `FansPage`, add: `const currentUser = useCurrentUser();`
3. Replace the `Total Fans` metric card value:
   ```ts
   // before: value="32.7K"
   // after:
   value={currentUser?.follower_count != null ? currentUser.follower_count.toLocaleString() : '—'}
   ```
4. Fan list, segments, search, and sheet panel remain mock — no other changes.

**Acceptance criteria:**
- Total Fans metric shows real follower count from `profiles`.
- Fan list remains mock (no regression).
- `pnpm tsc --noEmit` passes.
- `pnpm build` passes.

**Visual preservation:** Only the Total Fans number changes. All other UI is unchanged.

**Rollback risk:** None. One-line revert.

**Terminal validation:**
```
pnpm tsc --noEmit
pnpm build
```

---

## Task 8 — Final cleanup and verification

**Files involved:**
- All modified files

**What to do:**
1. Remove unused imports from all modified files (e.g., `useSubmissions` if fully replaced).
2. Confirm `submissions-store.tsx` is byte-for-byte unchanged.
3. Confirm no `profiles.is_creator` queries anywhere in new code.
4. Run full type check and build.

**Acceptance criteria:**
- Zero TypeScript errors: `pnpm tsc --noEmit`.
- Clean production build: `pnpm build`.
- No unused imports in modified files.
- `submissions-store.tsx` unchanged.
- No `is_creator` column queries.

**Visual preservation:** No UI change.

**Rollback risk:** None. Cleanup only.

**Terminal validation:**
```
pnpm tsc --noEmit
pnpm build
```

---

## Summary Table

| # | Task | Files | Risk | Validation |
|---|---|---|---|---|
| 1 | Types and pure helpers | use-creator-studio.ts (new) | None | tsc |
| 2 | Implement useCreatorStudio() hook | use-creator-studio.ts | Low | tsc + build |
| 3 | Wire access gate in CreatorStudioLayout | CreatorStudioLayout.tsx | Medium | tsc + build |
| 4 | Wire dashboard index | creator-studio.index.tsx | Low | tsc + build |
| 5 | Wire submissions page | creator-studio.submissions.tsx | Low | tsc + build |
| 6 | Wire analytics episode table | creator-studio.analytics.tsx | Low | tsc + build |
| 7 | Wire fans follower count | creator-studio.fans.tsx | None | tsc + build |
| 8 | Final cleanup and verification | all | None | tsc + build |

All tasks are sequential. Do not start a task until the previous task's validation passes.

---

## Do Not Touch

- `src/lib/submissions-store.tsx` — preserved as-is; mock data remains available for rollback
- `src/routes/creator-studio.edit.tsx` — upload wiring out of scope
- `src/routes/creator-studio.submit.tsx` — submission form wiring out of scope
- `src/routes/creator-studio.channel.tsx` — channel edit writes out of scope
- `src/routes/creator-studio.schedule.tsx` — out of scope
- `src/routes/creator-studio.interactions.tsx` — out of scope
- `src/routes/creator-studio.settings.tsx` — out of scope
- `src/routes/creator-studio.rewards.tsx` — out of scope
- Any RESTORE UI components

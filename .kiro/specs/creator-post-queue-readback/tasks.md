# Tasks: Creator Studio — Post Queue Read-back / Status Display

**Project:** Trey TV Antigravity  
**Date:** 2026-05-09

---

## Task 1 — Create `src/hooks/use-creator-post-queue.ts`

**Files involved:**
- `src/hooks/use-creator-post-queue.ts` (new file)

**What to do:**
Create the hook as specified in design.md §2. Key points:
- SELECT: `id, edit_project_id, title, description, thumbnail_url, episode_number, stream_uid, visibility, approval_status, created_at, updated_at`
- Do NOT select `admin_notes`
- Gate on `isApprovedCreator` from `useCreatorStudio()`
- `(supabase as any)` cast — consistent with existing codebase pattern
- Non-fatal on error — returns `{ queueRows: [], loading: false }`

**Acceptance criteria:**
- File exists at `src/hooks/use-creator-post-queue.ts`.
- `admin_notes` does not appear anywhere in the file.
- Hook returns `{ queueRows: QueueRow[], loading: boolean }`.
- When `isApprovedCreator` is false, no Supabase query is made and `queueRows` is `[]`.
- `QueueRow` type is exported.
- `pnpm tsc --noEmit` passes with zero new errors.

**Security boundary:**
- No `admin_notes` in SELECT — never fetched, never in memory.
- Uses anon/user Supabase client only — no service-role key.
- Gated on `isApprovedCreator` (which uses `channels.owner_email` + auth email — same gate as rest of Creator Studio).
- `profiles.is_creator` not referenced.

**Visual preservation rule:**
- New file only. No UI changes.

**Terminal validation only:**
```
pnpm tsc --noEmit
```

**Rollback risk:** None. New file, not imported anywhere yet.

---

## Task 2 — Add `queueRowToSubmission` and merge logic to `creator-studio.submissions.tsx`

**Files involved:**
- `src/routes/creator-studio.submissions.tsx`

**What to do:**

1. Add import at the top of the file:
```ts
import { useCreatorPostQueue, type QueueRow } from '@/hooks/use-creator-post-queue';
```

2. Add `queueRowToSubmission` as a module-level function (outside the component, not exported) — full shape in design.md §3.

3. Inside `SubmissionsPage`, add the hook call after the existing `useCreatorStudio()` call:
```ts
const { queueRows } = useCreatorPostQueue();
```

4. Replace `const mine = submissions;` with the merge `useMemo` from design.md §4.

**Acceptance criteria:**
- `const mine = submissions` is replaced by the merge `useMemo`.
- Queue rows with a matching `edit_project_id` replace the corresponding episode-derived submission.
- Episode-derived submissions with no matching queue row are still shown.
- `approval_status` values from queue rows render correctly via existing `STATUS_LABEL` and `STATUS_TONE`.
- Filter chip counts update to reflect real queue row statuses.
- `admin_feedback` is `''` for all queue-derived rows — the existing conditional `{s.admin_feedback && ...}` renders nothing.
- `pnpm tsc --noEmit` passes with zero new errors.
- `pnpm build` succeeds.

**Security boundary:**
- `admin_notes` is never fetched or displayed — confirmed by absence from `QueueRow` type and SELECT query.
- No service-role key.
- No status writes — read-only display only.

**Visual preservation rule:**
- No JSX changes to `SubmissionsPage`, `SubmissionCard`, `SubmissionRow`, or `RowActions`.
- No new UI elements, no new badge styles, no layout changes.
- The only changes are: one import line, one module-level function, one hook call, one `useMemo` replacement.

**Terminal validation only:**
```
pnpm tsc --noEmit
pnpm build
```

**Rollback risk:** Low. Removing the import, the `queueRowToSubmission` function, the hook call, and restoring `const mine = submissions` fully reverts to prior behavior. The hook file can remain.

---

## Task 3 — Verify build and confirm `admin_notes` is not exposed

**Files involved:**
- `src/hooks/use-creator-post-queue.ts` (read-only)
- `src/routes/creator-studio.submissions.tsx` (read-only)

**What to do:**
Run validation commands and confirm security properties.

```
pnpm tsc --noEmit
pnpm build
```

Then confirm:
```
grep -n "admin_notes" src/hooks/use-creator-post-queue.ts
grep -n "admin_notes" src/routes/creator-studio.submissions.tsx
```

Both greps must return no matches.

**Acceptance criteria:**
- `pnpm tsc --noEmit` exits with code 0.
- `pnpm build` completes successfully.
- `admin_notes` does not appear in either changed file.
- `profiles.is_creator` does not appear in either changed file.
- No service-role key referenced in either changed file.
- `git diff --name-only` shows only `src/hooks/use-creator-post-queue.ts` (new) and `src/routes/creator-studio.submissions.tsx` (modified).

**Security boundary:**
- Confirm `admin_notes` absent from all new/modified code.
- Confirm no service-role key.

**Visual preservation rule:**
- No UI files other than `creator-studio.submissions.tsx` modified.
- Confirm with `git diff --name-only`.

**Terminal validation only:**
```
pnpm tsc --noEmit
pnpm build
git diff --name-only
grep -n "admin_notes" src/hooks/use-creator-post-queue.ts
grep -n "admin_notes" src/routes/creator-studio.submissions.tsx
```

**Rollback risk:** None. Verification only.

---

## Completion Checklist

- [ ] Task 1: `use-creator-post-queue.ts` created — `tsc` passes
- [ ] Task 2: Merge logic added to `submissions.tsx` — `tsc` passes, `build` passes
- [ ] Task 3: Final verification — zero errors, `admin_notes` absent, only two files changed

---

## What Is Not Touched

| File | Status |
|---|---|
| `src/lib/submissions-store.tsx` | Unchanged — preserved as local rollback layer |
| `src/hooks/use-creator-studio.ts` | Unchanged |
| `src/hooks/use-creator-submit.ts` | Unchanged |
| `src/routes/creator-studio.edit.tsx` | Unchanged |
| `src/routes/creator-studio.submit.tsx` | Unchanged |
| `src/routes/creator-studio.submitted.tsx` | Unchanged |
| Any migration SQL | Not applicable — table and RLS already exist |

---

## Future Work (out of scope for this spec)

- Realtime subscription on `creator_post_queue` for live status updates
- Admin review UI (requires service-role server function)
- Queue row UPDATE when creator resubmits after `needs_changes`
- Unique DB constraint on `creator_post_queue(creator_id, edit_project_id)`
- Displaying `admin_notes` to creators (requires explicit product decision and RLS review)

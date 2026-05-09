# Tasks: Admin Review UI — creator_post_queue

**Project:** Trey TV Antigravity  
**Date:** 2026-05-09

---

## Task 1 — Create `src/lib/admin/post-queue.server.ts`

**Files involved:**
- `src/lib/admin/post-queue.server.ts` (new file)

**What to do:**
Create the server function file as specified in design.md §2. Contains:
- `AdminQueueItem` and `AdminQueueItemDetail` types (exported)
- `verifyAdmin(accessToken)` — internal helper, checks `profiles.role = 'admin'`
- `getAdminClient()` — internal helper, reads `SUPABASE_SERVICE_ROLE_KEY` from `process.env`
- `getAdminPostQueue` — list SELECT, no `admin_notes`
- `getAdminPostQueueItem` — detail SELECT, includes `admin_notes`
- `reviewAdminPostQueue` — UPDATE with full validation

**Acceptance criteria:**
- `SUPABASE_SERVICE_ROLE_KEY` is read only inside `createServerFn` handlers via `process.env` — never in a `VITE_*` var.
- `ADMIN_EMAILS` is read only inside `createServerFn` handlers via `process.env` — never in a `VITE_*` var.
- `verifyAdmin` authenticates with the normal auth client first, then checks `profiles.role = 'admin'` or `ADMIN_EMAILS` — the service-role client is never constructed before `verifyAdmin` returns.
- `verifyAdmin` does not use `profiles.is_creator`.
- `getAdminPostQueue` SELECT does not include `admin_notes`.
- `getAdminPostQueueItem` SELECT includes `admin_notes`.
- `reviewAdminPostQueue` throws when `approvalStatus` is `'rejected'` or `'needs_changes'` and `adminNotes` is empty.
- `reviewAdminPostQueue` throws when `approvalStatus` is `'approved'` and any required field is missing.
- `reviewAdminPostQueue` throws when admin is approving their own content.
- `reviewAdminPostQueue` UPDATEs `creator_edit_projects.status` when `edit_project_id` is present: `approved→published`, `rejected→rejected`, `needs_changes→ready`, `pending→submitted`.
- Publishing to public episodes/posts is NOT performed — `creator_edit_projects.status = 'published'` is the extent of the side effect.
- `pnpm tsc --noEmit` passes with zero new errors.

**Security boundary:**
- `verifyAdmin` runs server-side — cannot be bypassed by browser `isAdmin` / `localStorage`.
- Service-role client constructed only after `verifyAdmin` passes.
- `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_EMAILS` never in routes or hooks — only in `src/lib/admin/post-queue.server.ts`.
- Admin cannot approve own content — enforced in server function, not just UI.
- `admin_notes` not returned by `getAdminPostQueue` (list) — only by `getAdminPostQueueItem` (detail).

**Visual preservation rule:**
- New file only. No UI changes.

**Terminal validation only:**
```
pnpm tsc --noEmit
```

**Rollback risk:** None. New file, not imported anywhere yet.

---

## Task 2 — Create `src/hooks/use-admin-post-queue.ts`

**Files involved:**
- `src/hooks/use-admin-post-queue.ts` (new file)

**What to do:**
Create the hook as specified in design.md §3. Gated on `useAuth().isAdmin`. Calls `getAdminPostQueue` on mount. Exposes `{ items, loading, reload }`.

**Acceptance criteria:**
- When `isAdmin` is false, no server function call is made and `items` is `[]`.
- `reload()` re-fetches the list.
- On server function error: `items` is `[]`, no crash.
- `pnpm tsc --noEmit` passes with zero new errors.

**Security boundary:**
- Uses `supabase.auth.getSession()` to get `access_token` — passes it to the server function for server-side admin verification.
- No service-role key in this file.

**Visual preservation rule:**
- New file only. No UI changes.

**Terminal validation only:**
```
pnpm tsc --noEmit
```

**Rollback risk:** None. New file, not imported anywhere yet.

---

## Task 3 — Wire `admin.content-approval.tsx` to real data

**Files involved:**
- `src/routes/admin.content-approval.tsx`

**What to do:**
1. Add imports: `useAdminPostQueue`, `getAdminPostQueue` (for action calls), `reviewAdminPostQueue`, `AdminQueueItem` type, `createBrowserClient`.
2. Add `queueItemToSubmission` pure function at module level (design.md §4).
3. Replace `const store = useSubmissions()` with `const { items, loading, reload } = useAdminPostQueue()`.
4. Add `const submissions = useMemo(() => items.map(queueItemToSubmission), [items])`.
5. Update `stats` and `filtered` to use `submissions` instead of `store.submissions`.
6. Replace the three inline button handlers (Approve, Needs Changes, Reject) with async calls to `reviewAdminPostQueue`, followed by `reload()`.
7. The feedback dialog's "Send" button passes `feedbackText` as `adminNotes`.

**Acceptance criteria:**
- `useSubmissions()` is no longer called in this file.
- Approve button calls `reviewAdminPostQueue` with `approvalStatus: 'approved'` and `adminNotes: ''`.
- Needs Changes button calls `reviewAdminPostQueue` with `approvalStatus: 'needs_changes'` and `adminNotes: feedbackText`.
- Reject button calls `reviewAdminPostQueue` with `approvalStatus: 'rejected'` and `adminNotes: feedbackText`.
- On server function error: `toast.error(err.message)`.
- On success: `toast.success(...)` + `reload()`.
- Filter chips and stat tiles update from real queue data.
- `pnpm tsc --noEmit` passes with zero new errors.
- `pnpm build` succeeds.

**Security boundary:**
- `access_token` obtained from `supabase.auth.getSession()` — passed to server function.
- No service-role key in this file.
- Admin identity verified server-side in `reviewAdminPostQueue`.

**Visual preservation rule:**
- No JSX changes to the card grid, filter chips, stat tiles, search bar, or feedback dialog.
- The only changes are: imports, one hook replacement, one `useMemo` addition, three button handler replacements.

**Terminal validation only:**
```
pnpm tsc --noEmit
pnpm build
```

**Rollback risk:** Low. Restore `useSubmissions()` and the original `store.*` button handlers. The new imports and `queueItemToSubmission` function can be removed.

---

## Task 4 — Wire `admin.content-approval.$id.tsx` to real data

**Files involved:**
- `src/routes/admin.content-approval.$id.tsx`

**What to do:**
1. Add imports: `getAdminPostQueueItem`, `reviewAdminPostQueue`, `createBrowserClient`.
2. Add a `useEffect` on mount that calls `getAdminPostQueueItem({ queueId: id })` and populates `internal` state with `admin_notes`.
3. Replace `store.approve()` / `store.requestChanges()` / `store.reject()` calls with `reviewAdminPostQueue` calls.
4. On success: `navigate({ to: '/admin/content-approval' })`.
5. The `sub` variable still comes from `store.get(id)` as a fallback for the metadata display panel — this is acceptable since the detail page is navigated to from the list, and the store may have a local copy. If `store.get(id)` returns null, show the "not found" state.

**Acceptance criteria:**
- On mount, `admin_notes` is loaded from the server and pre-fills the "Internal admin note" textarea.
- Approve button calls `reviewAdminPostQueue` with `approvalStatus: 'approved'`.
- Request Changes button calls `reviewAdminPostQueue` with `approvalStatus: 'needs_changes'` and `feedback` as `adminNotes`.
- Reject button calls `reviewAdminPostQueue` with `approvalStatus: 'rejected'` and `feedback` as `adminNotes`.
- On server function error: `toast.error(err.message)`.
- On success: navigate back to `/admin/content-approval`.
- `pnpm tsc --noEmit` passes with zero new errors.
- `pnpm build` succeeds.

**Security boundary:**
- `access_token` from `supabase.auth.getSession()`.
- No service-role key in this file.
- Admin identity verified server-side.

**Visual preservation rule:**
- No JSX changes to the checklist, notes textareas, action bar, or metadata panel.
- The only changes are: imports, one `useEffect` addition, action handler replacements.

**Terminal validation only:**
```
pnpm tsc --noEmit
pnpm build
```

**Rollback risk:** Low. Remove the `useEffect` and restore `store.*` action calls.

---

## Task 5 — Verify build and confirm service-role key not in client bundle

**Files involved:**
- All changed files (read-only verification)

**What to do:**
```
pnpm tsc --noEmit
pnpm build
git diff --name-only
```

Then confirm secrets are not in routes or hooks:
```
grep -rn "SUPABASE_SERVICE_ROLE_KEY" src/routes/
grep -rn "SUPABASE_SERVICE_ROLE_KEY" src/hooks/
grep -rn "VITE_SUPABASE_SERVICE_ROLE" src/
grep -rn "ADMIN_EMAILS" src/routes/
grep -rn "ADMIN_EMAILS" src/hooks/
```

All five greps must return no matches.

**Acceptance criteria:**
- `pnpm tsc --noEmit` exits with code 0.
- `pnpm build` completes successfully.
- `SUPABASE_SERVICE_ROLE_KEY` does not appear in any route or hook file.
- `VITE_SUPABASE_SERVICE_ROLE` does not appear anywhere in `src/`.
- `ADMIN_EMAILS` does not appear in any route or hook file.
- `profiles.is_creator` does not appear in any new or modified file.
- `git diff --name-only` shows only the four expected files changed plus the two new files.

**Security boundary:**
- Confirm service-role key is server-function-only.

**Visual preservation rule:**
- No UI files other than the two admin routes modified.

**Terminal validation only:**
```
pnpm tsc --noEmit
pnpm build
git diff --name-only
grep -rn "SUPABASE_SERVICE_ROLE_KEY" src/routes/
grep -rn "SUPABASE_SERVICE_ROLE_KEY" src/hooks/
grep -rn "VITE_SUPABASE_SERVICE_ROLE" src/
grep -rn "ADMIN_EMAILS" src/routes/
grep -rn "ADMIN_EMAILS" src/hooks/
```

**Rollback risk:** None. Verification only.

---

## Completion Checklist

- [ ] Task 1: `post-queue.server.ts` created — `tsc` passes
- [ ] Task 2: `use-admin-post-queue.ts` created — `tsc` passes
- [ ] Task 3: `admin.content-approval.tsx` wired — `tsc` + `build` pass
- [ ] Task 4: `admin.content-approval.$id.tsx` wired — `tsc` + `build` pass
- [ ] Task 5: Final verification — service-role key not in routes/hooks

---

## What Is Not Touched

| File | Status |
|---|---|
| `src/lib/submissions-store.tsx` | Unchanged — still used by creator-facing submit flow |
| `src/hooks/use-creator-post-queue.ts` | Unchanged |
| `src/hooks/use-creator-submit.ts` | Unchanged |
| `src/routes/creator-studio.submissions.tsx` | Unchanged |
| `src/routes/creator-studio.submit.tsx` | Unchanged |
| `src/routes/creator-studio.edit.tsx` | Unchanged |
| Watch Now / Guide routes | Unchanged |
| Any migration SQL | Not applicable — table and RLS already exist |

---

## Environment Variable Setup (before implementation)

Add to `.env.local` (never commit):
```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_EMAILS=admin@example.com,owner@example.com
```

Add to Cloudflare Workers secrets for production:
```
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put ADMIN_EMAILS
```

Neither variable uses a `VITE_*` prefix. Both are accessed only inside `createServerFn` handlers via `process.env`.

---

## Future Work (out of scope for this spec)

- Episode publishing to public feed after approval (separate lane)
- Creator notification on approval/rejection (server-side trigger)
- Admin user management / role assignment UI
- Cloudflare Stream video preview in admin review
- Scheduling approved episodes

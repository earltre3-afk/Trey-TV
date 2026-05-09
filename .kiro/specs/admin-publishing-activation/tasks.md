# Tasks — Admin Publishing Activation

## Overview

All changes are confined to `src/lib/admin/post-queue.server.ts`.
No new files. No UI changes. No Watch Now / Guide / Feed writes.

---

## Task 1 — Verify episodes.edit_project_id uniqueness

**Goal:** Determine whether the live `episodes` table has a UNIQUE constraint on
`edit_project_id` so the correct UPSERT strategy can be chosen.

**Files involved:**
- `C:\Users\info\TREY-TV-RESTORE-599\supabase\migrations\` (reference — read only)
- `src/lib/admin/post-queue.server.ts` (no change in this task)

**Steps:**
1. Search reference migrations for `episodes` table DDL and any `UNIQUE` constraint
   on `edit_project_id`.
2. If constraint exists → use `upsert({ onConflict: "edit_project_id" })`.
3. If constraint does not exist → use SELECT-then-INSERT-or-UPDATE pattern.
4. Document the finding as a comment in the implementation task.

**Acceptance criteria:**
- The idempotency strategy is confirmed before any code is written.
- No code changes in this task.

**Security boundary:** Read-only inspection. No writes.

**Visual preservation:** N/A.

**Terminal validation:** N/A (research task).

**Rollback risk:** None.

---

## Task 2 — Extend queue SELECT to include missing fields

**Goal:** The existing `reviewAdminPostQueue` SELECT fetches
`id, creator_id, edit_project_id, channel_id, show_id, episode_number, title, stream_uid, is_plus_content`.
The episode UPSERT also needs `description`, `thumbnail_url`, `visibility`, `scheduled_at`.

**Files involved:**
- `src/lib/admin/post-queue.server.ts`

**Steps:**
1. In `reviewAdminPostQueue`, extend the `.select(...)` string to include
   `description, thumbnail_url, visibility, scheduled_at`.
2. Update the local `queue` variable type annotation (or `as any` cast) to reflect
   the additional fields.

**Acceptance criteria:**
- `pnpm tsc --noEmit` passes.
- `pnpm build` passes.
- No other behavior changes.

**Security boundary:**
- Change is inside `reviewAdminPostQueue` server function only.
- `verifyAdmin()` already runs before this SELECT.
- No new env vars. No browser exposure.

**Visual preservation:**
- Admin UI routes are not modified. No visual change.

**Terminal validation:**
```
pnpm tsc --noEmit
pnpm build
```

**Rollback risk:** Low. SELECT-only change. If it fails tsc, revert the select string.

---

## Task 3 — Implement episode UPSERT on approval

**Goal:** After the existing `creator_post_queue` and `creator_edit_projects` updates
succeed, UPSERT into `episodes` when `approvalStatus === "approved"`.

**Files involved:**
- `src/lib/admin/post-queue.server.ts`

**Steps:**
1. Inside the `reviewAdminPostQueue` handler, after the existing two UPDATE calls,
   add an `if (data.approvalStatus === "approved")` block.
2. Build `episodePayload` using the field mapping from `requirements.md`.
3. Apply publish status logic:
   - `scheduled_at` is future → `publish_status = "scheduled"`, `published_at = null`
   - otherwise → `publish_status = "published"`, `published_at = now()`
4. Apply access type logic:
   - `episode_number <= 2` → `access_type = "free"` (forced)
   - otherwise → `is_plus_content ? "locked" : "free"`
5. Execute UPSERT using the strategy confirmed in Task 1.
6. On UPSERT error, attempt rollback (see Task 4) then throw.

**Acceptance criteria:**
- `pnpm tsc --noEmit` passes.
- `pnpm build` passes.
- Approving a queue item with `approvalStatus = "approved"` triggers the UPSERT block.
- Rejecting or requesting changes does NOT enter the UPSERT block.
- Episode 1 and 2 always produce `access_type = "free"`.
- A queue item with a future `scheduled_at` produces `publish_status = "scheduled"`.
- A queue item with null `scheduled_at` produces `publish_status = "published"`.

**Security boundary:**
- UPSERT uses `getAdminClient()` (service-role). Never exposed to browser.
- `verifyAdmin()` runs before any write.
- `profiles.is_creator` not used.
- Admin self-approval check already in place.

**Visual preservation:**
- `admin.content-approval.tsx` and `admin.content-approval.$id.tsx` are not modified.
- Admin review UI appearance is unchanged.
- Watch Now, Guide, Feed are not touched.

**Terminal validation:**
```
pnpm tsc --noEmit
pnpm build
```

**Rollback risk:** Medium.
- If the UPSERT throws a runtime error, the queue row may be stuck at `"approved"`
  without an episode. This is handled by Task 4 (rollback logic).
- If tsc fails, revert the added block. The existing approval flow is unaffected.

---

## Task 4 — Implement rollback on episode UPSERT failure

**Goal:** If the episode UPSERT fails after `approval_status` has been set to
`"approved"`, revert `creator_post_queue.approval_status` to `"pending"` and
`creator_edit_projects.status` to `"submitted"`, then throw the original error.

**Files involved:**
- `src/lib/admin/post-queue.server.ts`

**Steps:**
1. In the UPSERT error handler (from Task 3), add:
   ```
   await supabase.from("creator_post_queue")
     .update({ approval_status: "pending", admin_notes: null })
     .eq("id", data.queueId)
   await supabase.from("creator_edit_projects")
     .update({ status: "submitted" })
     .eq("id", queue.edit_project_id)
   throw new Error("Publishing failed: " + episodeError.message)
   ```
2. The revert is best-effort. If the revert itself fails, the original episode error
   is still thrown (do not swallow it).

**Acceptance criteria:**
- `pnpm tsc --noEmit` passes.
- `pnpm build` passes.
- If the UPSERT fails, the server function throws an error (not `{ ok: true }`).
- The admin UI receives the error and can display it (existing error handling in
  `admin.content-approval.$id.tsx` is sufficient).

**Security boundary:**
- Rollback writes use the same service-role client.
- No new env vars. No browser exposure.

**Visual preservation:**
- Admin UI routes are not modified.

**Terminal validation:**
```
pnpm tsc --noEmit
pnpm build
```

**Rollback risk:** Low. The rollback block only runs on UPSERT failure. If the revert
writes fail, the error is still surfaced to the admin. The admin can retry approval,
which will re-attempt the UPSERT (idempotent by `edit_project_id`).

---

## Task 5 — Update migration-map.md and file-map.md steering docs

**Goal:** Record the new publishing activation behavior in the project's steering
documents so future agents have accurate context.

**Files involved:**
- `.kiro/steering/migration-map.md`
- `.kiro/steering/file-map.md`

**Steps:**
1. In `migration-map.md`, move "Admin Publishing Activation" from the "Not Started"
   section to the "Real" section with the following entry:
   ```
   | Admin Publishing Activation | `src/lib/admin/post-queue.server.ts` |
   `episodes` — UPSERT on approval; idempotent on `edit_project_id`;
   rollback on failure; first-two-free enforced; scheduled_at logic applied;
   service-role only; tsc ✅ build ✅ |
   ```
2. In `file-map.md`, update the `admin/post-queue.server.ts` entry to note that
   `reviewAdminPostQueue` now also UPSERTs into `episodes` on approval.

**Acceptance criteria:**
- Both steering files updated.
- No code changes in this task.

**Security boundary:** Documentation only.

**Visual preservation:** N/A.

**Terminal validation:** N/A.

**Rollback risk:** None.

---

## Execution Order

```
Task 1 (verify constraint) → Task 2 (extend SELECT) → Task 3 (UPSERT) → Task 4 (rollback) → Task 5 (docs)
```

Tasks 2, 3, and 4 are sequential (each builds on the previous).
Task 1 must complete before Task 3 begins.
Task 5 can run after Task 4.

---

## Do Not Do

- Do not modify `watch-data.ts`
- Do not modify `guide-store.tsx`
- Do not modify `feed-store.tsx`
- Do not modify `index.tsx` (Watch Now route)
- Do not modify `guide.tsx`
- Do not modify `watch.$id.tsx`
- Do not write to `user_posts` table
- Do not modify `admin.content-approval.tsx` or `admin.content-approval.$id.tsx`
- Do not add any `VITE_` prefixed env var
- Do not use `profiles.is_creator`
- Do not run browser validation, Playwright, or screenshots

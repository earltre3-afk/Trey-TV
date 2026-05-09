# Design — Admin Publishing Activation

## Architecture Overview

Publishing activation is a single-file change: extend `reviewAdminPostQueue` in
`src/lib/admin/post-queue.server.ts` to UPSERT into the `episodes` table when
`approvalStatus === "approved"`. No new files, no new routes, no UI changes.

```
Admin clicks Approve
       │
       ▼
reviewAdminPostQueue (createServerFn, server-only)
       │
       ├─ verifyAdmin()          ← auth + role check, throws if not admin
       ├─ validate inputs        ← existing validation unchanged
       ├─ fetch queue row        ← existing SELECT unchanged
       ├─ validate approval      ← existing business rule checks unchanged
       │
       ├─ UPDATE creator_post_queue.approval_status = "approved"
       ├─ UPDATE creator_edit_projects.status = "published"
       │
       └─ UPSERT episodes        ← NEW: publish the episode
              │
              ├─ success → return { ok: true }
              └─ failure → revert queue + project status → throw
```

---

## File Changes

### Modified: `src/lib/admin/post-queue.server.ts`

Only the `reviewAdminPostQueue` handler body changes. All existing exports, types,
`verifyAdmin`, `getAdminClient`, `getAdminPostQueue`, and `getAdminPostQueueItem`
are unchanged.

**What changes inside the handler:**

After the existing `creator_post_queue` and `creator_edit_projects` updates succeed,
add an episode UPSERT block that runs only when `data.approvalStatus === "approved"`.

---

## Episode UPSERT Logic

```
if (data.approvalStatus === "approved") {
  const now = new Date().toISOString()
  const isScheduled = queue.scheduled_at && new Date(queue.scheduled_at) > new Date()
  const accessType = (queue.episode_number <= 2) ? "free"
                   : queue.is_plus_content ? "locked" : "free"

  const episodePayload = {
    edit_project_id:  queue.edit_project_id,   // idempotency key
    creator_id:       queue.creator_id,
    channel_id:       queue.channel_id,
    show_id:          queue.show_id,
    episode_number:   queue.episode_number,
    season_number:    1,
    title:            queue.title,
    description:      queue.description ?? null,
    thumbnail_url:    queue.thumbnail_url ?? null,
    video_provider:   "cloudflare_stream",
    video_asset_id:   queue.stream_uid,
    video_status:     "ready",
    publish_status:   isScheduled ? "scheduled" : "published",
    access_type:      accessType,
    visibility:       queue.visibility,
    scheduled_at:     queue.scheduled_at ?? null,
    published_at:     isScheduled ? null : now,
    updated_at:       now,
  }

  // UPSERT on edit_project_id (requires unique constraint on episodes.edit_project_id)
  // If no unique constraint: SELECT first, then INSERT or UPDATE
  const { error: episodeError } = await supabase
    .from("episodes")
    .upsert(episodePayload, { onConflict: "edit_project_id" })

  if (episodeError) {
    // Rollback: revert queue and project status
    await supabase.from("creator_post_queue")
      .update({ approval_status: "pending", admin_notes: null })
      .eq("id", data.queueId)
    await supabase.from("creator_edit_projects")
      .update({ status: "submitted" })
      .eq("id", queue.edit_project_id)
    throw new Error("Publishing failed: " + episodeError.message)
  }
}
```

**Note on `onConflict`:** If the `episodes` table does not have a unique constraint on
`edit_project_id`, the implementation must use a SELECT-then-INSERT-or-UPDATE pattern
instead of `upsert`. The tasks section covers verifying this constraint.

---

## Queue Row Fetch — Additional Fields Needed

The existing SELECT in `reviewAdminPostQueue` fetches:
```
id, creator_id, edit_project_id, channel_id, show_id, episode_number,
title, stream_uid, is_plus_content
```

The UPSERT also needs: `description`, `thumbnail_url`, `visibility`, `scheduled_at`.

The SELECT must be extended to include these four fields. No other change to the fetch.

---

## Rollback Design

The rollback is best-effort. The sequence is:

1. UPDATE `creator_post_queue.approval_status = "approved"` ✓
2. UPDATE `creator_edit_projects.status = "published"` ✓
3. UPSERT `episodes` — if this fails:
   - Attempt revert: `creator_post_queue.approval_status = "pending"`
   - Attempt revert: `creator_edit_projects.status = "submitted"`
   - Throw the original episode error

If the revert itself fails, the original episode error is still thrown. The admin UI
will show an error. The admin can retry the approval, which will re-attempt the UPSERT
(idempotent by `edit_project_id`).

This is acceptable because:
- The queue row being stuck at `"approved"` without an episode is a recoverable state
- Retry is safe due to idempotency
- No data is permanently lost

---

## Idempotency

The `edit_project_id` column on `episodes` must be unique. Two paths:

**Path A (preferred):** A `UNIQUE` constraint exists on `episodes.edit_project_id`.
Use `supabase.from("episodes").upsert(payload, { onConflict: "edit_project_id" })`.

**Path B (fallback):** No unique constraint. Use:
```
SELECT id FROM episodes WHERE edit_project_id = queue.edit_project_id LIMIT 1
→ if found: UPDATE episodes SET ... WHERE id = found.id
→ if not found: INSERT INTO episodes ...
```

The implementation task must verify which path applies by inspecting the live schema
or reference migrations before writing code.

---

## Publish Status Logic

| `scheduled_at` value | `publish_status` | `published_at` |
|----------------------|-----------------|----------------|
| null | `"published"` | `now()` |
| past timestamp | `"published"` | `now()` |
| future timestamp | `"scheduled"` | null |

---

## Access Type Logic

| `episode_number` | `is_plus_content` | `access_type` |
|-----------------|-------------------|---------------|
| 1 or 2 | any | `"free"` (forced) |
| 3+ | false | `"free"` |
| 3+ | true | `"locked"` |

The approval gate already blocks `is_plus_content = true` for episodes 1 and 2,
so the forced `"free"` in the mapping is a defense-in-depth measure.

---

## Security Boundaries

| Boundary | Enforcement |
|----------|-------------|
| Service-role key | Only in `getAdminClient()`, server-side, no `VITE_` prefix |
| Admin verification | `verifyAdmin()` called before any write |
| Browser admin gate | Visual-only (`isAdmin` in `useAuth`) — not used for writes |
| `profiles.is_creator` | Not queried anywhere in this flow |
| Self-approval | Existing check: `queue.creator_id === adminUser.id` throws |
| RLS bypass | Service-role client bypasses RLS on `episodes` table |

---

## What Is NOT Changed

| Area | Reason |
|------|--------|
| `watch-data.ts` | Static mock — Watch Now reads from here, not Supabase |
| `guide-store.tsx` | localStorage — Guide reads from here, not Supabase |
| `feed-store.tsx` | localStorage — Feed reads from here, not Supabase |
| `index.tsx` | Watch Now route — no Supabase query added |
| `guide.tsx` | Guide route — no Supabase query added |
| `watch.$id.tsx` | Reads from `submissions-store` — not changed |
| `user_posts` table | Social feed posts — not the target for video episodes |
| Admin UI routes | `admin.content-approval.tsx`, `admin.content-approval.$id.tsx` — unchanged |
| `use-creator-studio.ts` | Already reads episodes via SELECT — no change needed |

---

## Type Safety

The `episodes` UPSERT uses `(supabase as any).from("episodes")` consistent with the
existing pattern in `post-queue.server.ts` (which already uses `as any` casts for all
Supabase queries due to missing generated types). No new type imports required.

If generated Supabase types are added in a future lane, the `as any` casts can be
removed at that time.

---

## No New Files

This feature requires zero new files:
- No new server function file
- No new hook
- No new route
- No new component

The entire change is inside the existing `reviewAdminPostQueue` handler.

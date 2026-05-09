# Design — Admin Publishing Activation

## Architecture Overview

Single-file change: extend `reviewAdminPostQueue` in
`src/lib/admin/post-queue.server.ts` to INSERT or UPDATE `episodes` when
`approvalStatus === "approved"`. No new files, no new routes, no UI changes.

```
Admin clicks Approve
       │
       ▼
reviewAdminPostQueue (createServerFn, server-only)
       │
       ├─ verifyAdmin()                    ← auth + role check
       ├─ validate inputs                  ← unchanged
       ├─ fetch queue row                  ← extended SELECT (see below)
       ├─ validate approval rules          ← unchanged
       │
       ├─ UPDATE creator_post_queue        ← approval_status = "approved"
       ├─ UPDATE creator_edit_projects     ← status = "published"
       │
       └─ publishEpisode()                 ← NEW: INSERT or UPDATE episodes
              │
              ├─ SELECT episodes WHERE show_id + video_asset_id
              ├─ found  → UPDATE episode row
              ├─ not found → INSERT new episode row
              │
              ├─ success → return { ok: true }
              └─ failure → revert queue + project → throw
```

---

## File Changes

### Modified: `src/lib/admin/post-queue.server.ts`

Only the `reviewAdminPostQueue` handler body changes. All existing exports, types,
`verifyAdmin`, `getAdminClient`, `getAdminPostQueue`, and `getAdminPostQueueItem`
are unchanged.

---

## Queue SELECT — Additional Fields Needed

The existing SELECT fetches:
```
id, creator_id, edit_project_id, channel_id, show_id, episode_number,
title, stream_uid, is_plus_content
```

The episode write also needs: `description`, `thumbnail_url`, `scheduled_at`.

Extend the SELECT string to include these three fields.

---

## Idempotency Strategy

`episodes.edit_project_id` does not exist (confirmed: no migration adds it).
The only UNIQUE constraint on `episodes` is `(show_id, slug)`.

**Strategy: SELECT-then-INSERT-or-UPDATE on `(show_id, video_asset_id)`**

```
SELECT id FROM episodes
WHERE show_id = queue.show_id
  AND video_asset_id = queue.stream_uid
LIMIT 1
```

- Row found → UPDATE that row (re-approval is safe, idempotent)
- No row found → INSERT new row

No `ON CONFLICT` clause. No `upsert()` call.

---

## Slug Derivation

`episodes` requires a non-null `slug` with a UNIQUE constraint on `(show_id, slug)`.

```
function slugify(title: string): string {
  return title.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70)
}
```

On INSERT, attempt `slugify(queue.title)` first. If that slug already exists for the
same `show_id` (detected by the INSERT error or a pre-check), append `-{episode_number}`:
`slugify(queue.title) + "-" + queue.episode_number`.

On UPDATE, do not change the existing slug.

---

## admin_publish_override Required

The DB trigger `zz_episodes_enforce_publish_readiness` blocks `publish_status = 'published'`
unless `audio_status IN ('cleared','approved')`, `ai_disclosure_completed = true`,
`rights_confirmed = true`, `video_status = 'ready'`, channel active, and metadata complete.

At approval time, most of these fields will not be set. The trigger provides an explicit
bypass: `admin_publish_override = true`. When set, the trigger skips all checks and
auto-sets `published_at`.

The episode payload must always include:
```
admin_publish_override: true,
admin_publish_override_by: adminUser.id,
admin_publish_override_at: now,
```

---

## Episode Payload

```typescript
const now = new Date().toISOString()
const isScheduled = !!queue.scheduled_at && new Date(queue.scheduled_at) > new Date()
const accessType = (queue.episode_number <= 2) ? "free"
                 : queue.is_plus_content ? "locked" : "free"
const slug = slugify(queue.title)

const episodePayload = {
  channel_id:                  queue.channel_id,
  show_id:                     queue.show_id,
  episode_number:              queue.episode_number,
  season_number:               1,
  title:                       queue.title,
  slug,                        // INSERT only; not updated on re-approval
  description:                 queue.description ?? null,
  thumbnail_url:               queue.thumbnail_url ?? null,
  video_thumbnail_url:         queue.thumbnail_url ?? null,
  video_provider:              "cloudflare_stream",
  video_asset_id:              queue.stream_uid,
  video_status:                "ready",
  publish_status:              isScheduled ? "scheduled" : "published",
  access_type:                 accessType,
  scheduled_at:                queue.scheduled_at ?? null,
  // published_at set automatically by trigger when admin_publish_override = true
  admin_publish_override:      true,
  admin_publish_override_by:   adminUser.id,
  admin_publish_override_at:   now,
  updated_at:                  now,
}
```

---

## INSERT vs UPDATE Logic

```typescript
// Check for existing episode
const { data: existing } = await (supabase as any)
  .from("episodes")
  .select("id, slug")
  .eq("show_id", queue.show_id)
  .eq("video_asset_id", queue.stream_uid)
  .maybeSingle()

let episodeError: unknown = null

if (existing) {
  // UPDATE — do not change slug
  const { error } = await (supabase as any)
    .from("episodes")
    .update({ ...episodePayload, slug: undefined })  // omit slug on update
    .eq("id", existing.id)
  episodeError = error
} else {
  // INSERT — include slug; handle slug collision by appending episode_number
  const { error } = await (supabase as any)
    .from("episodes")
    .insert(episodePayload)
  if (error && error.code === "23505") {
    // Unique violation on (show_id, slug) — retry with episode_number suffix
    const { error: retryError } = await (supabase as any)
      .from("episodes")
      .insert({ ...episodePayload, slug: `${slug}-${queue.episode_number}` })
    episodeError = retryError
  } else {
    episodeError = error
  }
}
```

---

## Rollback on Episode Failure

If `episodeError` is non-null after the INSERT/UPDATE attempt:

```typescript
// Best-effort revert
await (supabase as any)
  .from("creator_post_queue")
  .update({ approval_status: "pending", admin_notes: null })
  .eq("id", data.queueId)

if (queue.edit_project_id) {
  await (supabase as any)
    .from("creator_edit_projects")
    .update({ status: "submitted" })
    .eq("id", queue.edit_project_id)
}

throw new Error("Publishing failed: " + (episodeError as any).message)
```

The revert is best-effort. If it fails, the original episode error is still thrown.
The admin UI surfaces the error. Retry is safe (idempotent by `show_id + video_asset_id`).

---

## Publish Status Logic

| `scheduled_at` | `publish_status` | `published_at` |
|----------------|-----------------|----------------|
| null | `"published"` | set by trigger (override path) |
| past timestamp | `"published"` | set by trigger (override path) |
| future timestamp | `"scheduled"` | null (set when scheduler fires) |

---

## Access Type Logic

| `episode_number` | `is_plus_content` | `access_type` |
|-----------------|-------------------|---------------|
| 1 or 2 | any | `"free"` (forced; DB trigger also enforces) |
| 3+ | false | `"free"` |
| 3+ | true | `"locked"` |

---

## Security Boundaries

| Boundary | Enforcement |
|----------|-------------|
| Service-role key | Only in `getAdminClient()`, server-side, no `VITE_` prefix |
| Admin verification | `verifyAdmin()` called before any write |
| Browser admin gate | Visual-only — not used for writes |
| `profiles.is_creator` | Not queried |
| Self-approval | Existing check: `queue.creator_id === adminUser.id` throws |
| RLS bypass | Service-role client bypasses RLS on `episodes` |

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
| `user_posts` | Social feed posts — not the target for video episodes |
| Admin UI routes | `admin.content-approval.tsx`, `admin.content-approval.$id.tsx` — unchanged |

---

## No New Files

Zero new files required. The entire change is inside `reviewAdminPostQueue` in
`src/lib/admin/post-queue.server.ts`.

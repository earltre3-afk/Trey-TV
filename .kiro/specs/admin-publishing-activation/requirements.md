# Requirements — Admin Publishing Activation

## Feature Goal

When an admin approves a `creator_post_queue` item, the approved video must become
publicly playable content in Trey TV. Currently, approval only updates
`creator_post_queue.approval_status` and `creator_edit_projects.status`. No public
content is created. This spec defines what must happen after approval.

---

## Schema Verification Results

All findings are from confirmed migration files in `TREY-TV-RESTORE-599/supabase/migrations/`.

### episodes table — confirmed columns

From `20260427203000_trey_tv_creator_content_structure.sql` (initial CREATE):

```
id                    uuid PK
channel_id            FK → channels
show_id               FK → shows
season_id             FK → seasons (nullable)
title                 text NOT NULL
slug                  text NOT NULL
description           text
season_number         integer DEFAULT 1
episode_number        integer NOT NULL
thumbnail_url         text
video_url             text
access_type           text DEFAULT 'free'  CHECK ('free','locked')
publish_status        text DEFAULT 'draft' CHECK ('draft','scheduled','published','archived')
scheduled_at          timestamptz
published_at          timestamptz
audio_status          text DEFAULT 'pending_review'
audio_source_declaration text
ai_disclosure_type    text DEFAULT 'none'
first_two_free_required boolean DEFAULT true
created_at / updated_at
```

From `20260428010000_trey_tv_vod_foundation.sql` (ALTER ADD):

```
video_provider        text DEFAULT 'none'  CHECK ('none','cloudflare_stream','bunny_stream','mux','manual_url')
video_asset_id        text   ← this is where stream_uid maps
video_playback_id     text
video_status          text DEFAULT 'not_uploaded'
video_hls_url         text
video_mp4_url         text
video_thumbnail_url   text
video_duration_seconds integer
```

From `20260428170000_trey_tv_cloudflare_direct_uploads.sql` (ALTER ADD):

```
cloudflare_direct_upload_id  text
video_creator_upload_notes   text
(+ other upload tracking columns)
```

From `20260428183000_trey_tv_publishing_readiness.sql` (ALTER ADD):

```
ai_disclosure_completed   boolean DEFAULT false
rights_confirmed          boolean DEFAULT false
admin_publish_override    boolean DEFAULT false
admin_publish_override_notes text
admin_publish_override_by    text
admin_publish_override_at    timestamptz
```

### CRITICAL FINDING: episodes.edit_project_id does NOT exist

`edit_project_id` appears only in `creator_post_queue` (as a FK to `creator_edit_projects`).
It is **never added to the `episodes` table** in any migration.

**Consequence:** The previous spec's idempotency strategy (ON CONFLICT on
`episodes.edit_project_id`) is invalid. That column does not exist.

### CRITICAL FINDING: DB trigger blocks naive publish_status = 'published'

`enforce_episode_publish_readiness` (trigger `zz_episodes_enforce_publish_readiness`)
fires BEFORE INSERT OR UPDATE on `episodes`. It raises an exception if
`publish_status = 'published'` and any of the following are not satisfied:

- `channel.status = 'active'`
- `video_status = 'ready'`
- `audio_status IN ('cleared', 'approved')`
- `ai_disclosure_completed = true`
- `rights_confirmed = true`
- `title`, `description`, `thumbnail_url`, `genre`, `mood_tags` all non-empty

**Exception:** If `admin_publish_override = true`, the trigger skips all checks and
sets `published_at = now()` automatically.

### CRITICAL FINDING: No unique constraint on episodes for idempotency

The only UNIQUE constraint on `episodes` is `(show_id, slug)`.
There is no unique constraint on `video_asset_id`, `cloudflare_direct_upload_id`,
or any field that maps directly from `creator_post_queue`.

### Idempotency field options

| Field                         | Unique constraint?    | Available in queue?                 |
| ----------------------------- | --------------------- | ----------------------------------- |
| `(show_id, slug)`             | YES                   | show_id YES, slug NO (not in queue) |
| `video_asset_id`              | NO                    | YES (= stream_uid)                  |
| `cloudflare_direct_upload_id` | NO (only an index)    | NO                                  |
| `edit_project_id`             | COLUMN DOES NOT EXIST | —                                   |

**Conclusion:** No single field in `creator_post_queue` maps to a unique-constrained
column on `episodes`. The safe idempotency strategy is:

```
SELECT id FROM episodes
WHERE show_id = queue.show_id
  AND video_asset_id = queue.stream_uid
LIMIT 1
```

If a row is found → UPDATE it.
If no row is found → INSERT a new row.

This is a SELECT-then-INSERT-or-UPDATE pattern. No `ON CONFLICT` clause.

---

## Confirmed Data Sources

| Surface                  | Data source                            | Supabase?    | Touch?        |
| ------------------------ | -------------------------------------- | ------------ | ------------- |
| Watch Now (`index.tsx`)  | `watch-data.ts` static arrays          | No           | No            |
| Guide (`guide.tsx`)      | `watch-data.ts` + localStorage         | No           | No            |
| Feed (`feed-store.tsx`)  | localStorage                           | No           | No            |
| `watch.$id.tsx`          | `submissions-store` (localStorage)     | No           | No            |
| Creator Studio dashboard | `episodes` via `use-creator-studio.ts` | Yes (SELECT) | Safe to write |

---

## Scope

**In scope:**

- Publishing activation: INSERT or UPDATE `episodes` on approval
- Field mapping from `creator_post_queue` → `episodes`
- Idempotency via SELECT-then-INSERT-or-UPDATE on `(show_id, video_asset_id)`
- Using `admin_publish_override = true` to bypass the DB readiness trigger
- Rollback if episode write fails after `approval_status` changed
- First-two-free rule preservation (enforced by DB trigger + field mapping)
- Scheduled vs. immediate publish logic

**Out of scope:**

- Watch Now / Guide / Feed (all static/localStorage — confirmed)
- `user_posts` table (social posts, not video episodes)
- Payouts, Stripe, revenue
- Edit Studio / export
- Browser validation / Playwright / screenshots
- Adding `edit_project_id` column to `episodes` (separate migration lane)

---

## DB Trigger: enforce_episode_publish_readiness

The trigger blocks `publish_status = 'published'` unless all readiness checks pass.
Admin publishing must use `admin_publish_override = true` to bypass these checks,
because at approval time:

- `audio_status` may still be `'pending_review'` (not yet cleared)
- `ai_disclosure_completed` may be false (creator did not complete in-app flow)
- `rights_confirmed` may be false
- `genre` and `mood_tags` may be empty (not collected in current queue schema)

Setting `admin_publish_override = true` is the correct and intended path for
admin-initiated publishing. The trigger explicitly supports this:

```sql
if coalesce(new.admin_publish_override, false) then
  if new.published_at is null then new.published_at := now(); end if;
  return new;
end if;
```

The `admin_publish_override_by` and `admin_publish_override_at` fields should be
populated with the admin's user ID and the current timestamp for audit purposes.

---

## DB Trigger: episodes_force_first_two_free

A separate trigger (`episodes_force_first_two_free`) fires BEFORE INSERT OR UPDATE
and forces `access_type = 'free'` for `episode_number IN (1, 2)`. This is a DB-level
guarantee. The field mapping must also enforce it as defense-in-depth.

---

## Field Mapping: creator_post_queue → episodes

| Queue field       | Episodes field                | Transform                                    |
| ----------------- | ----------------------------- | -------------------------------------------- |
| `title`           | `title`                       | direct                                       |
| `description`     | `description`                 | direct                                       |
| `stream_uid`      | `video_asset_id`              | direct                                       |
| `thumbnail_url`   | `thumbnail_url`               | direct                                       |
| `thumbnail_url`   | `video_thumbnail_url`         | direct (same value)                          |
| `channel_id`      | `channel_id`                  | direct                                       |
| `show_id`         | `show_id`                     | direct                                       |
| `episode_number`  | `episode_number`              | direct                                       |
| `creator_id`      | _(no creator_id on episodes)_ | not mapped                                   |
| `visibility`      | _(no visibility on episodes)_ | not mapped                                   |
| `is_plus_content` | `access_type`                 | `true → "locked"`, `false → "free"`          |
| `scheduled_at`    | `scheduled_at`                | direct                                       |
| `scheduled_at`    | `publish_status`              | future → `"scheduled"`, else → `"published"` |
| _(hardcoded)_     | `video_provider`              | `"cloudflare_stream"`                        |
| _(hardcoded)_     | `video_status`                | `"ready"`                                    |
| _(hardcoded)_     | `season_number`               | `1`                                          |
| _(hardcoded)_     | `admin_publish_override`      | `true`                                       |
| _(admin user id)_ | `admin_publish_override_by`   | `adminUser.id`                               |
| _(approval time)_ | `admin_publish_override_at`   | `now()`                                      |
| _(hardcoded)_     | `slug`                        | derived from `title` (slugify)               |

**Note on `slug`:** `episodes` has a UNIQUE constraint on `(show_id, slug)`. The slug
must be derived from `title` and must be unique within the show. If a slug collision
occurs on INSERT, the implementation must append the `episode_number` to disambiguate:
e.g., `"my-episode-title-3"`.

**Note on `creator_id`:** The `episodes` table (as created in migrations) does not have
a `creator_id` column. Ownership is tracked via `channel_id → channels.owner_email`.

**Note on `visibility`:** The `episodes` table does not have a `visibility` column.
Access is controlled by `access_type` (free/locked) and `publish_status`.

---

## Business Rules

### R1 — Publishing only on approval

Episode INSERT/UPDATE must only execute when `approvalStatus === "approved"`.

### R2 — First-two-free preserved

`episode_number <= 2` → force `access_type = "free"`. DB trigger also enforces this.

### R3 — Idempotency

Use SELECT on `(show_id, video_asset_id)` before writing. If found → UPDATE. If not → INSERT.

### R4 — Scheduled vs. immediate

Future `scheduled_at` → `publish_status = "scheduled"`. Otherwise → `publish_status = "published"`.

### R5 — Admin publish override required

Set `admin_publish_override = true` on the episode row to bypass the DB readiness trigger.
Populate `admin_publish_override_by` and `admin_publish_override_at` for audit trail.

### R6 — Rollback on episode failure

If the episode write fails after `approval_status` has been set to `"approved"`,
revert `creator_post_queue.approval_status` to `"pending"` and
`creator_edit_projects.status` to `"submitted"`, then throw the original error.

### R7 — Service-role required

`episodes` has RLS. Service-role client (`getAdminClient()`) must be used.
Service-role key must never appear in browser code or any `VITE_`-prefixed variable.

### R8 — Admin UI unchanged

`admin.content-approval.tsx` and `admin.content-approval.$id.tsx` are not modified.

### R9 — No Watch Now / Guide / Feed writes

Do not modify `watch-data.ts`, `guide-store.tsx`, `feed-store.tsx`, `index.tsx`, or `guide.tsx`.

### R10 — No user_posts write

`user_posts` is for social feed posts. Do not write to it as part of publishing.

---

## Security Requirements

1. Service-role key server-side only (no `VITE_` prefix).
2. Publishing executes inside `reviewAdminPostQueue` server function only.
3. `verifyAdmin()` runs before any write to `episodes`.
4. `localStorage` admin flag (`isAdmin`) does not gate any write path.
5. `profiles.is_creator` not queried or used.
6. Admin cannot approve their own content (existing check preserved).

---

## Validation

Terminal-only:

- `pnpm tsc --noEmit` — must pass with zero errors
- `pnpm build` — must produce a clean build

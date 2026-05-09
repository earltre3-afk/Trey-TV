# Requirements — Admin Publishing Activation

## Feature Goal

When an admin approves a `creator_post_queue` item, the approved video must become
publicly playable content in Trey TV. Currently, approval only updates
`creator_post_queue.approval_status` and `creator_edit_projects.status`. No public
content is created. This spec defines what must happen after approval.

---

## Confirmed Current State

| Area | Status |
|------|--------|
| `reviewAdminPostQueue` server function | Wired — updates queue + edit_projects only |
| `episodes` table (Supabase) | Exists — read by `use-creator-studio.ts` |
| Watch Now (`index.tsx`) | Static mock (`watch-data.ts`) — no Supabase reads |
| Guide (`guide.tsx`) | Static mock + localStorage — no Supabase reads |
| Feed (`feed-store.tsx`) | localStorage-only — no Supabase reads |
| `watch.$id.tsx` | Reads from `submissions-store` (localStorage) |
| Service-role key | Server-side only, no `VITE_` prefix |
| Admin verification | `verifyAdmin()` runs before `getAdminClient()` |

---

## Scope

**In scope:**
- Publishing activation: UPSERT into `episodes` table on approval
- Field mapping from `creator_post_queue` → `episodes`
- Idempotency: re-approving the same item must not create duplicate episodes
- Rollback behavior if the episode UPSERT fails after `approval_status` is set
- First-two-free rule preservation
- Scheduled vs. immediate publish logic

**Out of scope:**
- Watch Now / Guide integration (both are static mock — do not touch)
- Feed entry creation (feed is localStorage-only — do not touch)
- user_posts table (not the target for video episodes)
- Payouts, Stripe, revenue
- Edit Studio / export
- Browser validation / Playwright / screenshots

---

## Data Source Verdicts

### Watch Now
Reads exclusively from `src/lib/watch-data.ts` static arrays. No Supabase query.
**Do not touch.** Writing to `episodes` table will not affect Watch Now.

### Guide
Reads from `watch-data.ts` + `guide-store.tsx` (localStorage). No Supabase query.
**Do not touch.** Writing to `episodes` table will not affect Guide.

### Feed
`feed-store.tsx` is a localStorage-only `UserPost` store. No Supabase query.
**Do not touch.**

### episodes table
Read by `use-creator-studio.ts` (SELECT only) for Creator Studio dashboard and analytics.
**Safe to write.** Writing approved episodes here will make them visible in Creator Studio
analytics immediately without breaking any existing UI.

---

## Target Table: `episodes`

Confirmed columns (from reference project `lib/platform/types.ts` and `app/actions/creator-studio.ts`):

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK, generated |
| `show_id` | uuid | FK → shows |
| `channel_id` | uuid | FK → channels |
| `creator_id` | uuid | FK → profiles |
| `title` | text | required |
| `description` | text | nullable |
| `episode_number` | int | required |
| `season_number` | int | default 1 |
| `thumbnail_url` | text | nullable |
| `video_provider` | text | `"cloudflare_stream"` for Stream uploads |
| `video_asset_id` | text | = `stream_uid` from queue |
| `video_playback_id` | text | nullable (may be same as asset_id for Stream) |
| `video_hls_url` | text | nullable |
| `video_mp4_url` | text | nullable |
| `video_status` | text | set to `"ready"` on approval |
| `publish_status` | text | `"published"` or `"scheduled"` |
| `access_type` | text | `"free"` or `"locked"` |
| `visibility` | text | from queue `visibility` field |
| `scheduled_at` | timestamptz | nullable |
| `published_at` | timestamptz | set to `now()` on approval |
| `created_at` | timestamptz | auto |
| `updated_at` | timestamptz | auto |

**Idempotency key:** `edit_project_id` stored as a unique reference column on `episodes`
(or used as the ON CONFLICT target if a unique constraint exists). If no unique constraint
exists on `edit_project_id`, the implementation must SELECT first and UPDATE if found,
INSERT if not.

---

## Field Mapping: creator_post_queue → episodes

| Queue field | Episodes field | Transform |
|-------------|---------------|-----------|
| `title` | `title` | direct |
| `description` | `description` | direct |
| `stream_uid` | `video_asset_id` | direct |
| `thumbnail_url` | `thumbnail_url` | direct |
| `channel_id` | `channel_id` | direct |
| `show_id` | `show_id` | direct |
| `episode_number` | `episode_number` | direct |
| `creator_id` | `creator_id` | direct |
| `visibility` | `visibility` | direct |
| `is_plus_content` | `access_type` | `true → "locked"`, `false → "free"` |
| `scheduled_at` | `scheduled_at` | direct |
| `scheduled_at` | `publish_status` | future → `"scheduled"`, null/past → `"published"` |
| _(approval time)_ | `published_at` | `new Date().toISOString()` |
| _(hardcoded)_ | `video_provider` | `"cloudflare_stream"` |
| _(hardcoded)_ | `video_status` | `"ready"` |
| _(hardcoded)_ | `season_number` | `1` (default) |
| `edit_project_id` | `edit_project_id` | idempotency reference |

---

## Business Rules

### R1 — Publishing only on approval
Episode UPSERT must only execute when `approvalStatus === "approved"`. Rejection,
`needs_changes`, and `pending` must not touch the `episodes` table.

### R2 — First-two-free preserved
Episodes 1 and 2 must always have `access_type = "free"`. This is already enforced
in the approval gate (`reviewAdminPostQueue` throws if ep 1 or 2 has `is_plus_content`).
The field mapping must also enforce it: if `episode_number <= 2`, force `access_type = "free"`
regardless of `is_plus_content`.

### R3 — Idempotency
Re-approving the same queue item (e.g., after a rollback or retry) must not create a
duplicate episode. Use `edit_project_id` as the idempotency key. If an episode with
that `edit_project_id` already exists, UPDATE it. If not, INSERT.

### R4 — Scheduled vs. immediate
If `scheduled_at` is a future timestamp, set `publish_status = "scheduled"`.
Otherwise (null or past), set `publish_status = "published"` and `published_at = now()`.

### R5 — Rollback on episode failure
If the episode UPSERT fails after `approval_status` has been set to `"approved"`,
the server function must attempt to revert `creator_post_queue.approval_status` back
to `"pending"` and `creator_edit_projects.status` back to `"submitted"`. If the revert
also fails, the error must be thrown so the caller receives a failure response.
The admin UI must surface the error (existing error handling in the route is sufficient).

### R6 — Admin self-approval blocked
Already enforced: `queue.creator_id === adminUser.id` throws. No change needed.

### R7 — Service-role required
The `episodes` table has RLS. The service-role client (`getAdminClient()`) must be used
for the UPSERT. The service-role key must never appear in browser code or any file with
a `VITE_` prefix.

### R8 — Admin UI unchanged
The admin review UI (`admin.content-approval.tsx`, `admin.content-approval.$id.tsx`)
must not be modified. The publishing logic lives entirely inside `reviewAdminPostQueue`
in `post-queue.server.ts`.

### R9 — No Watch Now / Guide writes
Do not write to `watch-data.ts`, `guide-store.tsx`, or any static data file.
Do not add any Supabase query to `index.tsx` or `guide.tsx`.

### R10 — No user_posts write
The `user_posts` table is for social feed posts, not video episodes. Do not write
to `user_posts` as part of publishing activation.

---

## Security Requirements

1. Service-role key must remain server-side only (no `VITE_` prefix).
2. Publishing must execute inside `reviewAdminPostQueue` server function only.
3. `verifyAdmin()` must run before any write to `episodes`.
4. `localStorage` admin flag (`isAdmin`) must not gate any write path.
5. `profiles.is_creator` must not be queried or used.
6. Admin cannot approve their own content (existing check preserved).

---

## Validation

All validation is terminal-only:
- `pnpm tsc --noEmit` — must pass with zero errors
- `pnpm build` — must produce a clean build

No browser validation, no Playwright, no screenshots.

# Requirements: Creator Studio — Post Queue Read-back / Status Display

**Project:** Trey TV Antigravity  
**Date:** 2026-05-09  
**Scope:** Read-only `creator_post_queue` SELECT and status display inside the existing Lovable Creator Studio submissions surface. No writes, no admin UI, no redesign.

---

## 1. Goal

Approved creators can currently submit videos to `creator_post_queue`, but have no way to see the review status of those submissions inside the app. This spec wires a read-only SELECT of `creator_post_queue` rows into the existing `creator-studio.submissions.tsx` page so creators can see `approval_status` alongside their existing `creator_edit_projects` drafts.

---

## 2. Security Boundary — Non-Negotiable

| Rule                            | Detail                                                                                                                 |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Browser SELECT is allowed       | RLS: `creator_id = auth.uid() AND is_approved_creator_for_current_user()`                                              |
| No service-role key             | Anon/user Supabase client only                                                                                         |
| Creator identity via auth email | Same `channels.owner_email` gate already used in `useCreatorStudio`                                                    |
| `admin_notes` must not be shown | Column exists on `creator_post_queue` but is written by admins only — do not SELECT or display it in creator-facing UI |
| No status writes                | Creator cannot change `approval_status` — read-only                                                                    |
| `profiles.is_creator` not used  | Column does not exist in current schema                                                                                |

---

## 3. Schema Verification

### `creator_post_queue` — columns safe for creator display

| Column            | Safe to show creator? | Notes                                          |
| ----------------- | --------------------- | ---------------------------------------------- |
| `id`              | ✅                    | Queue row UUID                                 |
| `edit_project_id` | ✅                    | Links back to `creator_edit_projects`          |
| `channel_id`      | ✅                    | Creator's own channel                          |
| `show_id`         | ✅                    | Show reference                                 |
| `episode_number`  | ✅                    | Episode number                                 |
| `title`           | ✅                    | Creator-supplied title                         |
| `description`     | ✅                    | Creator-supplied description                   |
| `stream_uid`      | ✅                    | Creator's own video UID                        |
| `thumbnail_url`   | ✅                    | Creator-supplied thumbnail                     |
| `visibility`      | ✅                    | Creator-supplied visibility                    |
| `is_plus_content` | ✅                    | Creator-supplied flag                          |
| `scheduled_at`    | ✅                    | Creator-supplied schedule                      |
| `approval_status` | ✅                    | The primary display field                      |
| `created_at`      | ✅                    | Submission timestamp                           |
| `updated_at`      | ✅                    | Last update timestamp                          |
| `admin_notes`     | ❌ **Do not SELECT**  | Admin-internal field — not for creator display |

### `approval_status` values

| DB value          | Maps to `SubmissionStatus` | `STATUS_LABEL`     | `STATUS_TONE` |
| ----------------- | -------------------------- | ------------------ | ------------- |
| `'pending'`       | `'pending'`                | `"Pending Review"` | gold          |
| `'approved'`      | `'approved'`               | `"Approved"`       | green         |
| `'rejected'`      | `'rejected'`               | `"Rejected"`       | red           |
| `'needs_changes'` | `'needs_changes'`          | `"Needs Changes"`  | magenta       |

All four values map directly to existing `SubmissionStatus` values in `submissions-store.tsx`. No new status labels or tone classes are needed.

### RLS on `creator_post_queue` SELECT

```sql
using (creator_id = auth.uid() and public.is_approved_creator_for_current_user())
```

Browser SELECT is safe with the anon/user client. No service-role key required.

---

## 4. Functional Requirements

### FR-1: New `useCreatorPostQueue` hook

Create `src/hooks/use-creator-post-queue.ts`.

- Exposes: `queueRows: QueueRow[]`, `loading: boolean`.
- On mount: SELECT from `creator_post_queue` WHERE `creator_id = auth.uid()`, ordered by `created_at DESC`, limit 50.
- Do not SELECT `admin_notes`.
- If not signed in or not an approved creator: return `{ queueRows: [], loading: false }` — no error, no crash.
- On Supabase error: return `{ queueRows: [], loading: false }` — non-fatal.

```ts
type QueueRow = {
  id: string;
  edit_project_id: string | null;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  episode_number: number | null;
  stream_uid: string;
  visibility: string;
  approval_status: "pending" | "approved" | "rejected" | "needs_changes";
  created_at: string;
  updated_at: string;
};
```

### FR-2: Map `QueueRow` to `Submission` shape

Convert each `QueueRow` to a `Submission` for use in the existing submissions list UI. The mapping function is pure and not exported.

Key mappings:

- `content_id` ← `row.id` (queue row UUID, not `edit_project_id`)
- `status` ← `mapApprovalStatus(row.approval_status)`
- `title` ← `row.title`
- `thumbnail_url` ← `row.thumbnail_url ?? ''`
- `episode_number` ← `row.episode_number ?? 1`
- `created_at` / `updated_at` ← from row
- All other `Submission` fields: safe empty defaults (`''`, `[]`, `false`, `1`)
- `admin_feedback` ← `''` (never populated from queue — `admin_notes` is not fetched)

### FR-3: Merge queue rows into submissions list

In `creator-studio.submissions.tsx`, the submissions list currently comes from `useCreatorStudio().submissions` (derived from `episodes` table). Queue rows represent a different, newer data source.

Merge strategy:

- Load both: `useCreatorStudio().submissions` (episodes) and `useCreatorPostQueue().queueRows` (mapped to `Submission`).
- Deduplicate: if a queue row's `edit_project_id` matches a `creator_edit_projects`-derived submission's `content_id`, prefer the queue row (it has the real `approval_status`).
- If no match: include both independently.
- Sort merged list by `updated_at DESC`.

This merge happens inside `creator-studio.submissions.tsx` using `useMemo`.

### FR-4: No new UI components

The existing `SubmissionCard` and `SubmissionRow` components already render `STATUS_LABEL[s.status]` and `STATUS_TONE[s.status]`. Since `approval_status` values map directly to existing `SubmissionStatus` values, no new badge styles or card variants are needed.

The existing filter chips (`pending`, `approved`, `rejected`, `needs_changes`) already work — they will now show real counts from queue rows.

### FR-5: `admin_feedback` field

The `SubmissionCard` component renders `s.admin_feedback` if non-empty. Since `admin_notes` is not fetched, `admin_feedback` is always `''` for queue-derived rows. The existing conditional `{s.admin_feedback && ...}` handles this correctly — no change needed.

### FR-6: Graceful loading state

- While `useCreatorPostQueue` is loading, the submissions list shows whatever `useCreatorStudio().submissions` already provides (no blank flash).
- No new loading spinner. The existing empty state handles the zero-item case.

### FR-7: Visual preservation

- `creator-studio.submissions.tsx` layout, filter chips, toolbar, grid/list toggle, bulk action bar, and empty state are structurally unchanged.
- No new UI elements added.
- No Lovable component replaced.
- The only change to `submissions.tsx` is: import the new hook, merge the two data sources in `useMemo`.

### FR-8: `submissions-store.tsx` preserved

- `submissions-store.tsx` remains as the local optimistic/rollback layer.
- It is not deleted or modified.
- Queue rows are a separate data source layered on top.

---

## 5. Non-Functional Requirements

- **Build safety:** Every change must pass `pnpm tsc --noEmit` and `pnpm build`.
- **No browser validation:** No Playwright, no screenshots, no Read URL checks.
- **No new dependencies.**
- **No redesign.**
- **Rollback:** Remove the `useCreatorPostQueue` import and merge logic from `submissions.tsx`. The hook file can remain — it is not called if not imported.

---

## 6. Out of Scope

- `admin_notes` display
- Admin review UI
- `approval_status` writes
- Queue row UPDATE or DELETE
- Cloudflare Stream playback from `stream_uid`
- Edit Studio / export features
- Payments / Stripe / creator payouts
- Realtime subscription on `creator_post_queue`

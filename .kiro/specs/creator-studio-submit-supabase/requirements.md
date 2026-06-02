# Requirements: Creator Studio — Submission/Upload Metadata Wiring

**Project:** Trey TV Antigravity  
**Date:** 2026-05-09  
**Scope:** Draft episode metadata creation only. No video file upload, no Cloudflare Stream, no edit studio export, no payouts, no Stripe, no admin tools, no redesign.

---

## 1. Goal

Wire the "Save Draft" and "Submit for Admin Approval" actions in `creator-studio.submit.tsx` to write real episode metadata to Supabase. The existing Lovable form UI is unchanged. Approved creators can create and persist draft episode records without uploading a video file.

---

## 2. Critical Schema Finding: Two Tables, One Blocker

| Table                   | `stream_uid` | Browser INSERT safe?                   | Use for this phase? |
| ----------------------- | ------------ | -------------------------------------- | ------------------- |
| `creator_edit_projects` | nullable     | ✅ Yes                                 | ✅ **Target table** |
| `creator_post_queue`    | `NOT NULL`   | ❌ No — requires Cloudflare Stream UID | ❌ Out of scope     |

`creator_post_queue` requires a `stream_uid` (Cloudflare Stream UID) which is not available without a video upload. It cannot be used for metadata-only drafts.

`creator_edit_projects` has no such constraint and is the correct target for this phase.

---

## 3. Schema Verification

### Table: `public.creator_edit_projects`

| Column                | Type                     | Notes                                                                                                           |
| --------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `id`                  | `uuid` PK                | `gen_random_uuid()`                                                                                             |
| `creator_id`          | `uuid` FK → `auth.users` | NOT NULL — `auth.uid()`                                                                                         |
| `title`               | `text`                   | nullable                                                                                                        |
| `description`         | `text`                   | nullable                                                                                                        |
| `status`              | `text`                   | NOT NULL, default `'draft'` — enum: `draft / uploading / processing / ready / submitted / published / rejected` |
| `aspect_ratio`        | `text`                   | NOT NULL, default `'9:16'`                                                                                      |
| `stream_uid`          | `text`                   | nullable — not set in this phase                                                                                |
| `thumbnail_url`       | `text`                   | nullable                                                                                                        |
| `poster_time_seconds` | `numeric`                | default 0                                                                                                       |
| `trim_start_seconds`  | `numeric`                | default 0                                                                                                       |
| `trim_end_seconds`    | `numeric`                | nullable                                                                                                        |
| `utility_state`       | `jsonb`                  | default `'{}'` — used to store extra metadata (show, season, episode, tags, etc.)                               |
| `metadata`            | `jsonb`                  | default `'{}'` — additional metadata                                                                            |
| `created_at`          | `timestamptz`            | NOT NULL                                                                                                        |
| `updated_at`          | `timestamptz`            | NOT NULL, auto-updated by trigger                                                                               |

### RLS Policies on `creator_edit_projects`

| Operation | Policy                    |
| --------- | ------------------------- |
| SELECT    | `creator_id = auth.uid()` |
| INSERT    | `creator_id = auth.uid()` |
| UPDATE    | `creator_id = auth.uid()` |
| DELETE    | `creator_id = auth.uid()` |

All operations are browser-safe via the anon/user client. No service-role key needed.

### `creator_post_queue` — Out of Scope

`stream_uid text NOT NULL` blocks browser INSERT without a Cloudflare Stream UID. Do not attempt to write to this table in this phase.

### Metadata Storage Strategy

The `creator_edit_projects` table has `utility_state jsonb` and `metadata jsonb` columns for flexible extra data. The Lovable `Submission` shape has many fields not present as dedicated columns (`show_title`, `season_number`, `episode_number`, `category`, `tags`, `mood_tags`, `visibility`, `access_type`, `content_rating`, `language`, `policy_ack`, etc.). These are stored in `utility_state` as a JSON blob.

---

## 4. Functional Requirements

### FR-1: New `useCreatorSubmit()` hook

- Create `src/hooks/use-creator-submit.ts`.
- Exposes: `saveDraft(draft: Submission): Promise<string | null>`, `submitForReview(draft: Submission): Promise<boolean>`, `saving`.
- Signed-out / non-creator: operations are no-ops returning `null` / `false`.

### FR-2: Creator access check before write

- Before any INSERT or UPDATE, verify the user has an approved channel via `useCreatorStudio()` (already implemented).
- If no channel: return null/false, show `toast.error('Creator access required')`.
- Do not use `profiles.is_creator`.

### FR-3: Save draft

- `saveDraft(draft)`:
  - If `draft.content_id` starts with `'seed-'` or is a UUID not yet in Supabase: INSERT a new `creator_edit_projects` row.
  - If `draft.content_id` is a real Supabase UUID already saved: UPDATE the existing row.
  - Mapped fields:
    - `creator_id` = `auth.uid()`
    - `title` = `draft.title || null`
    - `description` = `draft.short_description || null`
    - `status` = `'draft'`
    - `thumbnail_url` = `draft.thumbnail_url || null`
    - `utility_state` = JSON blob of remaining Submission fields (see §5)
  - Returns the Supabase row `id` (UUID) on success, `null` on error.
  - On success: update the local `submissions-store` draft's `content_id` to the real Supabase UUID.
  - On error: `toast.error('Failed to save draft')`, return `null`.

### FR-4: Submit for review

- `submitForReview(draft)`:
  - Calls `saveDraft(draft)` first to ensure the row exists.
  - Then UPDATEs `status = 'submitted'` on the row.
  - Returns `true` on success, `false` on error.
  - On error: `toast.error('Failed to submit')`, return `false`.
  - On success: the existing `navigate({ to: '/creator-studio/submitted' })` call in the route proceeds unchanged.

### FR-5: Wire `creator-studio.submit.tsx`

- The `saveSilent()` function currently calls `store.updateDraft(d.content_id, d)` — add a call to `saveDraft(d)` after the local store update.
- The `onSubmit()` function currently calls `store.submit(d.content_id)` then navigates — replace with `submitForReview(d)` then navigate on success.
- The local `submissions-store` calls remain as the optimistic/local layer — they are not removed.
- No JSX changes.

### FR-6: Signed-out / non-creator graceful handling

- If `useCreatorStudio().isApprovedCreator` is false: hook operations are no-ops.
- The existing `LockedScreen` component in `submit.tsx` already handles the non-creator UI — no change needed.
- No crash, no browser alert.

### FR-7: Visual preservation

- `creator-studio.submit.tsx` layout, form sections, checklist, and sticky submit bar are structurally unchanged.
- `creator-studio.edit.tsx` is not modified.
- The only changes to `submit.tsx` are two function body additions (one line each in `saveSilent` and `onSubmit`).

### FR-8: No `creator_post_queue` writes

- Do not INSERT or UPDATE `creator_post_queue` in this phase.
- `stream_uid` is not set on any row.

### FR-9: No video file upload

- No `<input type="file">` wiring to Supabase Storage or Cloudflare Stream.
- `video_url` in the draft remains a local blob URL or empty string — not persisted to Supabase.

---

## 5. `utility_state` JSON Schema

The `utility_state` column stores the Lovable `Submission` fields that have no dedicated column:

```json
{
  "show_id": "string",
  "show_title": "string",
  "season_number": 1,
  "episode_number": 1,
  "episode_type": "Full Episode",
  "category": ["Music"],
  "tags": ["studio"],
  "mood_tags": ["Inspired"],
  "visibility": "public",
  "access_type": "free",
  "content_rating": "PG",
  "language": "English",
  "explicit_content": false,
  "is_trailer": false,
  "is_bonus": false,
  "is_finale": false,
  "is_premiere": false,
  "policy_ack": false,
  "full_description": "string",
  "viewer_context": "string",
  "what_to_know": "string",
  "why_it_matters": "string",
  "creator_note": "string",
  "scheduled_at": "string | null"
}
```

This is a write-once-read-back blob. It is not queried by column — it is read back as a whole and spread into the `Submission` shape when loading drafts.

---

## 6. Non-Functional Requirements

- **Build safety:** Every change must pass `pnpm tsc --noEmit` and `pnpm build`.
- **No browser validation:** No Playwright, no screenshots, no Read URL checks.
- **No new dependencies.**
- **No redesign:** No RESTORE UI components. No structural changes.
- **Rollback:** The `submissions-store.tsx` local layer remains intact. Removing the two hook calls in `submit.tsx` fully restores mock behavior.

---

## 7. Out of Scope

- Video file upload to Supabase Storage
- Cloudflare Stream direct upload URL generation
- `creator_post_queue` INSERT (requires `stream_uid`)
- Edit studio (`creator-studio.edit.tsx`) wiring
- Show creation (INSERT into `shows` table)
- Admin review workflow
- Payments / Stripe / creator payouts
- Loading saved drafts from Supabase on page mount (read-back of `creator_edit_projects` — future phase)

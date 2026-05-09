# Requirements: Creator Studio — creator_post_queue Wiring

**Project:** Trey TV Antigravity  
**Date:** 2026-05-09  
**Scope:** Wire `creator_post_queue` INSERT inside `submitForReview()` only. No edit studio export, no payouts, no Stripe, no admin review UI, no redesign.

---

## 1. Goal

When an approved creator submits a video for review, insert a row into `creator_post_queue` so the video enters the admin review and publishing pipeline. This is only possible now because `stream_uid` is stored in `creator_edit_projects` after a successful Cloudflare Stream upload.

The queue INSERT must never happen without a confirmed `stream_uid`. If `stream_uid` is absent, the submit flow degrades gracefully — the `creator_edit_projects` row is still updated to `status = 'submitted'`, but no queue row is created and no crash occurs.

---

## 2. Security Boundary — Non-Negotiable

| Rule | Detail |
|---|---|
| Browser INSERT is allowed | RLS permits INSERT with `creator_id = auth.uid()` and `approval_status = 'pending'` and `is_approved_creator_for_current_user()` |
| No service-role key in browser | The anon/user Supabase client is sufficient |
| Creator identity via auth email | `is_approved_creator_for_current_user()` checks `channels.owner_email = auth.jwt()->>'email'` — same pattern already used in `useCreatorStudio` |
| `stream_uid` guard | Queue INSERT is skipped entirely if `stream_uid` is null or empty — no partial rows |
| `approval_status` hardcoded | Always `'pending'` — never passed from user input |

---

## 3. Schema Verification

### `creator_post_queue` — confirmed columns

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, `gen_random_uuid()` | Auto-generated |
| `creator_id` | `uuid` | NOT NULL, FK `auth.users` | `auth.uid()` |
| `edit_project_id` | `uuid` | nullable, FK `creator_edit_projects` ON DELETE SET NULL | The `draftId` from upload |
| `channel_id` | `uuid` | nullable | From `useCreatorStudio().channel.id` |
| `show_id` | `uuid` | nullable | From `draft.show_id` (stored in `utility_state`) |
| `episode_number` | `integer` | nullable | From `draft.episode_number` |
| `title` | `text` | NOT NULL | From `draft.title` |
| `description` | `text` | nullable | From `draft.short_description` |
| `stream_uid` | `text` | NOT NULL | Read from `creator_edit_projects` row by `edit_project_id` |
| `thumbnail_url` | `text` | nullable | From `draft.thumbnail_url` |
| `visibility` | `text` | NOT NULL, default `'submitted'` | Mapped from `draft.visibility` |
| `is_plus_content` | `boolean` | NOT NULL, default `false` | `false` if `episode_number <= 2`, else `draft.access_type === 'subscribers'` |
| `scheduled_at` | `timestamptz` | nullable | From `draft.scheduled_at` when `visibility = 'scheduled'` |
| `approval_status` | `text` | NOT NULL, default `'pending'` | Always `'pending'` on INSERT |
| `admin_notes` | `text` | nullable | Not set on INSERT |
| `created_at` | `timestamptz` | NOT NULL | Auto |
| `updated_at` | `timestamptz` | NOT NULL | Auto via trigger |

### Visibility mapping

| `draft.visibility` | `creator_post_queue.visibility` |
|---|---|
| `'public'` | `'submitted'` |
| `'subscribers'` | `'submitted'` |
| `'private'` | `'private'` |
| `'scheduled'` | `'scheduled'` |
| anything else | `'submitted'` |

### DB constraint: `creator_post_queue_first_two_not_plus_check`

```sql
check (episode_number is null or episode_number not in (1, 2) or is_plus_content is false)
```

`is_plus_content` must be `false` when `episode_number` is 1 or 2. This is enforced in code before INSERT.

### RLS policies on `creator_post_queue`

| Operation | Policy |
|---|---|
| SELECT | `creator_id = auth.uid() AND is_approved_creator_for_current_user()` |
| INSERT | `creator_id = auth.uid() AND approval_status = 'pending' AND is_approved_creator_for_current_user()` |
| UPDATE | `creator_id = auth.uid() AND approval_status IN ('pending','needs_changes') AND is_approved_creator_for_current_user()` |

Browser INSERT is safe with the anon/user client. No service-role key required.

---

## 4. Functional Requirements

### FR-1: Queue INSERT inside `submitForReview()`

`useCreatorSubmit.submitForReview(draft)` currently:
1. Calls `saveDraft(draft)` → returns `rowId`
2. UPDATEs `creator_edit_projects.status = 'submitted'`
3. Returns `true`

After this change, step 2.5 is added between the status UPDATE and the return:

2.5. If `rowId` exists:
  - SELECT `stream_uid` from `creator_edit_projects` WHERE `id = rowId AND creator_id = userId`
  - If `stream_uid` is a non-empty string: INSERT into `creator_post_queue`
  - If `stream_uid` is null/empty: skip silently — no error, no crash

The queue INSERT is non-blocking for the submit flow. If it fails, `submitForReview()` still returns `true` (the `creator_edit_projects` update succeeded). A `toast.error` is shown only if the queue INSERT fails with an unexpected error.

### FR-2: `stream_uid` fetch before INSERT

Before inserting into `creator_post_queue`, read `stream_uid` from the `creator_edit_projects` row:

```ts
const { data: project } = await supabase
  .from('creator_edit_projects')
  .select('stream_uid')
  .eq('id', rowId)
  .eq('creator_id', userId)
  .maybeSingle();

const streamUid = project?.stream_uid?.trim() || null;
if (!streamUid) return true; // skip queue, not an error
```

This is the only safe source of `stream_uid`. It must not be passed from component state or URL params.

### FR-3: Queue INSERT payload

```ts
await supabase.from('creator_post_queue').insert({
  creator_id: userId,
  edit_project_id: rowId,
  channel_id: channel?.id ?? null,
  show_id: draft.show_id || null,
  episode_number: draft.episode_number > 0 ? draft.episode_number : null,
  title: draft.title.trim(),
  description: draft.short_description?.trim() || null,
  stream_uid: streamUid,
  thumbnail_url: draft.thumbnail_url || null,
  visibility: mapVisibility(draft.visibility),
  is_plus_content: isPlusContent(draft.episode_number, draft.access_type),
  scheduled_at: draft.visibility === 'scheduled' && draft.scheduled_at
    ? new Date(draft.scheduled_at).toISOString()
    : null,
  approval_status: 'pending',
});
```

### FR-4: `mapVisibility` helper

```ts
function mapVisibility(v: string): string {
  if (v === 'private') return 'private';
  if (v === 'scheduled') return 'scheduled';
  return 'submitted';
}
```

### FR-5: `isPlusContent` helper

```ts
function isPlusContent(episodeNumber: number, accessType: string): boolean {
  if (episodeNumber <= 2) return false;
  return accessType === 'subscribers';
}
```

### FR-6: Graceful handling — missing `stream_uid`

- If `stream_uid` is null or empty after the SELECT: skip queue INSERT, return `true`.
- No `toast.error`. No crash. The creator's `creator_edit_projects` row is still `status = 'submitted'`.
- This handles the case where a creator fills out metadata without uploading a video.

### FR-7: Graceful handling — queue INSERT error

- If the INSERT returns a Supabase error: `toast.error('Submission queued but review entry failed — contact support')`.
- `submitForReview()` still returns `true` (the draft was saved and status updated).
- The error is non-fatal to the submit flow.

### FR-9: Pre-insert duplicate check

Before inserting into `creator_post_queue`, SELECT to check whether a row already exists for the same `creator_id` and `edit_project_id`:

```ts
const { data: existing } = await supabase
  .from('creator_post_queue')
  .select('id')
  .eq('creator_id', userId)
  .eq('edit_project_id', rowId)
  .maybeSingle();

if (existing) return true; // already queued — skip silently
```

- If a row exists: skip the INSERT, return `true`, show no toast.
- If no row exists: proceed with the INSERT as specified in FR-3.
- This prevents duplicate queue rows from repeated submit clicks or repeated `submitForReview()` calls on the same `edit_project_id`.
- This is not a race-proof guarantee — no unique DB constraint exists yet. A future migration can add `UNIQUE (creator_id, edit_project_id)` to make it fully idempotent.

### FR-10: Visual preservation

- `creator-studio.submit.tsx` is not modified.
- `creator-studio.edit.tsx` is not modified.
- The submit button, checklist, and navigation to `/creator-studio/submitted` are unchanged.
- No new UI elements.

---

## 5. Non-Functional Requirements

- **Build safety:** Every change must pass `pnpm tsc --noEmit` and `pnpm build`.
- **No browser validation:** No Playwright, no screenshots, no Read URL checks.
- **No new dependencies.**
- **No redesign.**
- **Rollback:** Removing the queue INSERT block from `submitForReview()` fully restores prior behavior. The `creator_edit_projects` update path is untouched.

---

## 6. Out of Scope

- Admin review UI
- Queue row UPDATE or DELETE
- Unique DB constraint on `creator_post_queue(creator_id, edit_project_id)` — pre-insert SELECT check covers normal cases; constraint is future hardening
- `show_id` creation (INSERT into `shows`)
- Cloudflare Stream webhook / status polling
- Edit studio export features
- Payments / Stripe / creator payouts
- Loading queue rows back into the UI

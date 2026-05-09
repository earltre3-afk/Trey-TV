# Design: Creator Studio — creator_post_queue Wiring

**Project:** Trey TV Antigravity  
**Date:** 2026-05-09

---

## 1. Architecture Overview

```
creator-studio.submit.tsx
  └── onSubmit()
        └── submitForReview(draft)          ← MODIFIED (use-creator-submit.ts)
              ├── saveDraft(draft)           ← unchanged — returns rowId
              ├── UPDATE creator_edit_projects status='submitted'  ← unchanged
              ├── SELECT creator_edit_projects.stream_uid          ← NEW
              │     └── if null/empty → return true (skip queue)
              ├── SELECT creator_post_queue WHERE creator_id+edit_project_id  ← NEW
              │     └── if row exists → return true (skip duplicate)
              └── INSERT creator_post_queue                        ← NEW
                    ├── creator_id = auth.uid()
                    ├── edit_project_id = rowId
                    ├── channel_id = channel.id
                    ├── stream_uid = (from DB, never from state)
                    ├── title, description, show_id, episode_number
                    ├── visibility = mapVisibility(draft.visibility)
                    ├── is_plus_content = isPlusContent(ep, access_type)
                    ├── scheduled_at (if scheduled)
                    └── approval_status = 'pending'
```

One file changes. No new files. No route changes. No UI changes.

---

## 2. Modified File: `src/hooks/use-creator-submit.ts`

### 2.1 New pure helpers (module-level, not exported)

```ts
function mapVisibility(v: string): string {
  if (v === 'private') return 'private';
  if (v === 'scheduled') return 'scheduled';
  return 'submitted';
}

function isPlusContent(episodeNumber: number, accessType: string): boolean {
  if (episodeNumber <= 2) return false;
  return accessType === 'subscribers';
}
```

These are pure functions with no side effects. They are not exported — they are internal to the hook module.

### 2.2 Modified `submitForReview()`

Current implementation (abbreviated):

```ts
const submitForReview = async (draft: Submission): Promise<boolean> => {
  const rowId = await saveDraft(draft);
  if (!rowId) return false;

  const userId = await getUserId();
  if (!userId) return false;

  try {
    const supabase = createBrowserClient();
    const { error } = await (supabase as any)
      .from('creator_edit_projects')
      .update({ status: 'submitted', updated_at: new Date().toISOString() })
      .eq('id', rowId)
      .eq('creator_id', userId);

    if (error) { toast.error('Failed to submit'); return false; }
    return true;
  } catch {
    toast.error('Failed to submit');
    return false;
  }
};
```

New implementation — additions marked with `// NEW`:

```ts
const submitForReview = async (draft: Submission): Promise<boolean> => {
  const rowId = await saveDraft(draft);
  if (!rowId) return false;

  const userId = await getUserId();
  if (!userId) return false;

  try {
    const supabase = createBrowserClient();
    const { error } = await (supabase as any)
      .from('creator_edit_projects')
      .update({ status: 'submitted', updated_at: new Date().toISOString() })
      .eq('id', rowId)
      .eq('creator_id', userId);

    if (error) { toast.error('Failed to submit'); return false; }

    // NEW: attempt queue INSERT — non-blocking
    try {
      const { data: project } = await (supabase as any)
        .from('creator_edit_projects')
        .select('stream_uid')
        .eq('id', rowId)
        .eq('creator_id', userId)
        .maybeSingle();

      const streamUid: string | null = project?.stream_uid?.trim() || null;

      if (streamUid) {
        // duplicate check — skip if already queued for this edit project
        const { data: existing } = await (supabase as any)
          .from('creator_post_queue')
          .select('id')
          .eq('creator_id', userId)
          .eq('edit_project_id', rowId)
          .maybeSingle();

        if (!existing) {
          const epNum = draft.episode_number > 0 ? draft.episode_number : null;
          const { error: queueError } = await (supabase as any)
            .from('creator_post_queue')
            .insert({
              creator_id: userId,
              edit_project_id: rowId,
              channel_id: channel?.id ?? null,
              show_id: draft.show_id || null,
              episode_number: epNum,
              title: draft.title.trim(),
              description: draft.short_description?.trim() || null,
              stream_uid: streamUid,
              thumbnail_url: draft.thumbnail_url || null,
              visibility: mapVisibility(draft.visibility),
              is_plus_content: isPlusContent(draft.episode_number, draft.access_type),
              scheduled_at:
                draft.visibility === 'scheduled' && draft.scheduled_at
                  ? new Date(draft.scheduled_at).toISOString()
                  : null,
              approval_status: 'pending',
            });

          if (queueError) {
            toast.error('Submission queued but review entry failed — contact support');
          }
        }
      }
    } catch {
      // queue INSERT failure is non-fatal
    }

    return true;
  } catch {
    toast.error('Failed to submit');
    return false;
  }
};
```

### 2.3 `channel` availability

`channel` is already available in the hook via `useCreatorStudio()`:

```ts
const { channel, isApprovedCreator } = useCreatorStudio();
```

`channel.id` is used directly. No new hook calls needed.

---

## 3. Data Flow

```
User clicks "Submit for Admin Approval"
  │
  ▼
onSubmit() in creator-studio.submit.tsx
  │  (no change to this file)
  ▼
submitForReview(draft)
  │
  ├─ saveDraft(draft)
  │    └─ INSERT/UPDATE creator_edit_projects → rowId
  │
  ├─ UPDATE creator_edit_projects SET status='submitted'
  │    └─ on error → toast.error + return false
  │
  ├─ SELECT creator_edit_projects.stream_uid WHERE id=rowId
  │    └─ stream_uid null/empty → return true (no queue row)
  │
  ├─ SELECT creator_post_queue WHERE creator_id=userId AND edit_project_id=rowId
  │    └─ row exists → return true (already queued, no duplicate)
  │
  └─ INSERT creator_post_queue
       ├─ success → return true
       └─ error → toast.error (non-fatal) → return true
```

---

## 4. Type Safety

`creator_post_queue` is not in the generated Supabase types for this project (the table was added in a migration that post-dates the type generation). The INSERT uses `(supabase as any)` — the same pattern already used for `creator_edit_projects` throughout the codebase. This is consistent with the existing approach and avoids introducing a new type generation step.

The `stream_uid` value is typed as `string` after the null/empty guard. The `mapVisibility` and `isPlusContent` helpers are typed with explicit parameter and return types to satisfy `tsc --noEmit`.

---

## 5. Files Changed

| File | Change |
|---|---|
| `src/hooks/use-creator-submit.ts` | Add `mapVisibility`, `isPlusContent` helpers; extend `submitForReview()` with stream_uid SELECT + queue INSERT |

No other files are modified.

---

## 6. Rollback Plan

Remove the `// NEW: attempt queue INSERT` block from `submitForReview()` and the two helper functions. The `creator_edit_projects` update path is untouched and continues to work. The `creator_post_queue` table is unaffected (no rows written).

---

## 7. Validation

```
pnpm tsc --noEmit   # zero new errors
pnpm build          # clean build
```

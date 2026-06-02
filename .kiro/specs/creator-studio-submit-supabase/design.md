# Design: Creator Studio — Submission/Upload Metadata Wiring

**Project:** Trey TV Antigravity  
**Date:** 2026-05-09

---

## 1. Architecture Overview

```
creator-studio.submit.tsx
  ├── useCreatorStudio()        ← existing hook (isApprovedCreator, channel)
  ├── useSubmissions()          ← existing mock store (local optimistic layer — unchanged)
  └── useCreatorSubmit()        ← NEW hook (src/hooks/use-creator-submit.ts)
        ├── supabase-browser    ← existing client
        └── creator_edit_projects  ← INSERT + UPDATE (RLS: creator_id = auth.uid())
```

One new file. Two targeted additions to `creator-studio.submit.tsx`. No other files touched.

---

## 2. New Hook: `use-creator-submit.ts`

### Public interface

```ts
type UseCreatorSubmitReturn = {
  saveDraft: (draft: Submission) => Promise<string | null>;
  submitForReview: (draft: Submission) => Promise<boolean>;
  saving: boolean;
};
```

`Submission` is imported type-only from `@/lib/submissions-store`.

---

## 3. Data Flow

### 3a. `saveDraft(draft)`

```
saveDraft(draft) called
  → if saving: return null (debounce)
  → setSaving(true)
  → get auth user: supabase.auth.getUser()
  → if no user: setSaving(false), return null
  → isNewRow = draft.content_id starts with 'seed-' OR not a valid UUID format
  → payload = {
      creator_id: user.id,
      title: draft.title || null,
      description: draft.short_description || null,
      status: 'draft',
      thumbnail_url: draft.thumbnail_url || null,
      utility_state: buildUtilityState(draft),
    }
  → if isNewRow:
      supabase.from('creator_edit_projects').insert(payload).select('id').single()
      → on success: return row.id
      → on error: toast.error('Failed to save draft'), return null
  → else:
      supabase.from('creator_edit_projects')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', draft.content_id)
        .eq('creator_id', user.id)
      → on success: return draft.content_id
      → on error: toast.error('Failed to save draft'), return null
  → setSaving(false)
```

### 3b. `submitForReview(draft)`

```
submitForReview(draft) called
  → rowId = await saveDraft(draft)
  → if !rowId: return false
  → supabase.from('creator_edit_projects')
      .update({ status: 'submitted' })
      .eq('id', rowId)
      .eq('creator_id', user.id)
  → on success: return true
  → on error: toast.error('Failed to submit'), return false
```

---

## 4. `buildUtilityState(draft)` Helper

Pure function — no side effects:

```ts
function buildUtilityState(draft: Submission): Record<string, unknown> {
  return {
    show_id: draft.show_id,
    show_title: draft.show_title,
    season_number: draft.season_number,
    episode_number: draft.episode_number,
    episode_type: draft.episode_type,
    category: draft.category,
    tags: draft.tags,
    mood_tags: draft.mood_tags,
    visibility: draft.visibility,
    access_type: draft.access_type,
    content_rating: draft.content_rating,
    language: draft.language,
    explicit_content: draft.explicit_content,
    is_trailer: draft.is_trailer,
    is_bonus: draft.is_bonus,
    is_finale: draft.is_finale,
    is_premiere: draft.is_premiere,
    policy_ack: draft.policy_ack,
    full_description: draft.full_description,
    viewer_context: draft.viewer_context,
    what_to_know: draft.what_to_know,
    why_it_matters: draft.why_it_matters,
    creator_note: draft.creator_note,
    scheduled_at: draft.scheduled_at ?? null,
  };
}
```

### New Row Detection

```ts
function isNewRow(contentId: string): boolean {
  // seed IDs from submissions-store start with 'seed-'
  // real Supabase UUIDs match the UUID v4 pattern
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return contentId.startsWith("seed-") || !uuidPattern.test(contentId);
}
```

---

## 5. Internal Supabase Type

```ts
type EditProjectInsert = {
  creator_id: string;
  title: string | null;
  description: string | null;
  status: string;
  thumbnail_url: string | null;
  utility_state: Record<string, unknown>;
};
```

Internal only — not exported.

---

## 6. Changes to `creator-studio.submit.tsx`

Two targeted additions only:

### Addition 1 — `saveSilent()`

```ts
// before:
const saveSilent = () => store.updateDraft(d.content_id, d);

// after:
const saveSilent = () => {
  store.updateDraft(d.content_id, d);
  saveDraft(d); // fire-and-forget; errors handled inside hook
};
```

### Addition 2 — `onSubmit()`

```ts
// before (simplified):
const onSubmit = () => {
  if (!canSubmit) { toast.error(...); return; }
  store.updateDraft(d.content_id, d);
  store.submit(d.content_id);
  navigate({ to: '/creator-studio/submitted', search: { id: d.content_id } });
};

// after:
const onSubmit = async () => {
  if (!canSubmit) { toast.error(...); return; }
  store.updateDraft(d.content_id, d);
  store.submit(d.content_id);
  const ok = await submitForReview(d);
  if (ok || true) {  // navigate regardless — local store already updated
    navigate({ to: '/creator-studio/submitted', search: { id: d.content_id } as any });
  }
};
```

Note: navigation happens regardless of Supabase success — the local store is the source of truth for the UI. Supabase write is best-effort for this phase.

Add imports at top:

```ts
import { useCreatorSubmit } from "@/hooks/use-creator-submit";
```

Add inside `Form` component:

```ts
const { saveDraft, submitForReview } = useCreatorSubmit();
```

---

## 7. Files Changed

| File                                   | Change                                             |
| -------------------------------------- | -------------------------------------------------- |
| `src/hooks/use-creator-submit.ts`      | New file                                           |
| `src/routes/creator-studio.submit.tsx` | 1 import + 1 hook call + 2 function body additions |

No other files touched. `submissions-store.tsx`, `creator-studio.edit.tsx`, `use-creator-studio.ts` are untouched.

---

## 8. Rollback Plan

Remove the `useCreatorSubmit` import and the two additions from `submit.tsx`. The local `submissions-store` layer continues to work exactly as before. One-minute revert.

---

## 9. Validation

```
pnpm tsc --noEmit   # zero errors
pnpm build          # clean build
```

# Tasks: Creator Studio — creator_post_queue Wiring

**Project:** Trey TV Antigravity  
**Date:** 2026-05-09

---

## Task 1 — Add `mapVisibility` and `isPlusContent` helpers to `use-creator-submit.ts`

**Files involved:**

- `src/hooks/use-creator-submit.ts`

**What to do:**
Add two module-level pure functions before the `useCreatorSubmit` function body. Do not export them.

```ts
function mapVisibility(v: string): string {
  if (v === "private") return "private";
  if (v === "scheduled") return "scheduled";
  return "submitted";
}

function isPlusContent(episodeNumber: number, accessType: string): boolean {
  if (episodeNumber <= 2) return false;
  return accessType === "subscribers";
}
```

**Acceptance criteria:**

- Both functions exist in the module.
- `mapVisibility('public')` → `'submitted'`
- `mapVisibility('subscribers')` → `'submitted'`
- `mapVisibility('private')` → `'private'`
- `mapVisibility('scheduled')` → `'scheduled'`
- `isPlusContent(1, 'subscribers')` → `false`
- `isPlusContent(2, 'subscribers')` → `false`
- `isPlusContent(3, 'subscribers')` → `true`
- `isPlusContent(3, 'free')` → `false`
- `pnpm tsc --noEmit` passes with zero new errors.

**Security boundary:**

- Pure functions. No Supabase calls. No auth. No side effects.

**Visual preservation rule:**

- No UI changes. No JSX touched.

**Terminal validation only:**

```
pnpm tsc --noEmit
```

**Rollback risk:** None. Removing these two functions has no effect on existing behavior.

---

## Task 2 — Extend `submitForReview()` with `stream_uid` SELECT and queue INSERT

**Files involved:**

- `src/hooks/use-creator-submit.ts`

**What to do:**
After the `creator_edit_projects` status UPDATE succeeds (and before `return true`), add the following block:

```ts
// attempt queue INSERT — non-blocking
try {
  const { data: project } = await (supabase as any)
    .from("creator_edit_projects")
    .select("stream_uid")
    .eq("id", rowId)
    .eq("creator_id", userId)
    .maybeSingle();

  const streamUid: string | null = project?.stream_uid?.trim() || null;

  if (streamUid) {
    // duplicate check — skip if already queued for this edit project
    const { data: existing } = await (supabase as any)
      .from("creator_post_queue")
      .select("id")
      .eq("creator_id", userId)
      .eq("edit_project_id", rowId)
      .maybeSingle();

    if (!existing) {
      const epNum = draft.episode_number > 0 ? draft.episode_number : null;
      const { error: queueError } = await (supabase as any).from("creator_post_queue").insert({
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
          draft.visibility === "scheduled" && draft.scheduled_at
            ? new Date(draft.scheduled_at).toISOString()
            : null,
        approval_status: "pending",
      });

      if (queueError) {
        toast.error("Submission queued but review entry failed — contact support");
      }
    }
  }
} catch {
  // queue INSERT failure is non-fatal
}
```

The `channel` variable is already available from `useCreatorStudio()` at the top of the hook.

**Acceptance criteria:**

- When `stream_uid` is present on the `creator_edit_projects` row, a `creator_post_queue` row is inserted with `approval_status = 'pending'`.
- When `stream_uid` is null or empty, no queue INSERT is attempted and `submitForReview()` returns `true`.
- When a `creator_post_queue` row already exists for the same `creator_id` + `edit_project_id`, no second row is inserted and `submitForReview()` returns `true` silently.
- When the queue INSERT fails (Supabase error), `submitForReview()` still returns `true` and shows a non-fatal toast.
- `approval_status` is always `'pending'` — never derived from user input.
- `is_plus_content` is `false` when `episode_number` is 1 or 2 (satisfies DB constraint `creator_post_queue_first_two_not_plus_check`).
- `stream_uid` is read from the database row, not from component state or URL params.
- `pnpm tsc --noEmit` passes with zero new errors.
- `pnpm build` succeeds.

**Security boundary:**

- Uses `createBrowserClient()` with the authenticated user's session — same client used throughout the hook.
- RLS enforces `creator_id = auth.uid() AND approval_status = 'pending' AND is_approved_creator_for_current_user()` on INSERT.
- No service-role key. No server function. No `VITE_*` secrets.
- `stream_uid` is fetched from the DB row owned by `creator_id = userId` — cannot be spoofed via URL or state.
- `approval_status` is hardcoded to `'pending'` — not user-controlled.

**Visual preservation rule:**

- `creator-studio.submit.tsx` is not modified.
- The submit button, checklist, navigation to `/creator-studio/submitted`, and all form sections are unchanged.
- No new UI elements, no layout changes, no toast changes to the existing success/error flow.

**Terminal validation only:**

```
pnpm tsc --noEmit
pnpm build
```

**Rollback risk:** Low. The entire queue INSERT block is wrapped in a `try/catch` and is non-blocking. Removing the block restores prior behavior exactly. The `creator_edit_projects` update path is untouched.

---

## Task 3 — Verify build and type safety

**Files involved:**

- `src/hooks/use-creator-submit.ts` (read-only verification)

**What to do:**
Run both validation commands and confirm zero errors.

```
pnpm tsc --noEmit
pnpm build
```

**Acceptance criteria:**

- `pnpm tsc --noEmit` exits with code 0 and zero new TypeScript errors.
- `pnpm build` completes successfully.
- No `creator_post_queue` references exist in any file other than `src/hooks/use-creator-submit.ts`.
- No `stream_uid` is passed from component state, URL params, or any source other than the `creator_edit_projects` DB row.
- No service-role key or `CLOUDFLARE_*` env var is referenced in any browser-side file.

**Security boundary:**

- Confirm `creator_post_queue` INSERT only appears inside `submitForReview()` in `use-creator-submit.ts`.
- Confirm `approval_status: 'pending'` is hardcoded.

**Visual preservation rule:**

- No UI files modified. Confirm with `git diff --name-only` that only `src/hooks/use-creator-submit.ts` changed.

**Terminal validation only:**

```
pnpm tsc --noEmit
pnpm build
git diff --name-only
```

**Rollback risk:** None. This task is verification only.

---

## Completion Checklist

- [ ] Task 1: `mapVisibility` and `isPlusContent` helpers added — `tsc` passes
- [ ] Task 2: `submitForReview()` extended with stream_uid SELECT + queue INSERT — `tsc` passes, `build` passes
- [ ] Task 3: Final verification — zero errors, only `use-creator-submit.ts` changed

---

## What Is Not Touched

| File                                      | Status                                            |
| ----------------------------------------- | ------------------------------------------------- |
| `src/routes/creator-studio.submit.tsx`    | Unchanged                                         |
| `src/routes/creator-studio.edit.tsx`      | Unchanged                                         |
| `src/lib/creator-studio/upload.server.ts` | Unchanged                                         |
| `src/hooks/use-cloudflare-upload.ts`      | Unchanged                                         |
| `src/hooks/use-creator-studio.ts`         | Unchanged                                         |
| `src/lib/submissions-store.tsx`           | Unchanged                                         |
| Any migration SQL                         | Not applicable — table already exists in Supabase |

---

## Future Work (out of scope for this spec)

- Unique DB constraint on `(creator_id, edit_project_id)` in `creator_post_queue` — would make the duplicate check race-proof at the DB level
- Loading queue rows back into the Creator Studio submissions view
- Admin review UI for `creator_post_queue`
- Queue row UPDATE when creator resubmits after `needs_changes`

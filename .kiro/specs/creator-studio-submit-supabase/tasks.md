# Tasks: Creator Studio — Submission/Upload Metadata Wiring

**Project:** Trey TV Antigravity  
**Date:** 2026-05-09  
**Prerequisite:** requirements.md and design.md approved.

---

## Task 1 — Define internal types and pure helper functions

**Files involved:**
- `src/hooks/use-creator-submit.ts` (new file)

**What to do:**
Create `src/hooks/use-creator-submit.ts` with only types and pure helper functions — no React, no Supabase calls yet.

Include:
1. `EditProjectInsert` internal type (unexported)
2. `UseCreatorSubmitReturn` type (exported)
3. `isNewRow(contentId: string): boolean` — pure function (see design.md §4)
4. `buildUtilityState(draft: Submission): Record<string, unknown>` — pure function (see design.md §4)

Import `Submission` type-only from `@/lib/submissions-store`.

**Acceptance criteria:**
- File compiles with zero TypeScript errors.
- No React imports, no Supabase imports.
- `pnpm tsc --noEmit` passes.

**Visual preservation:** No UI change. New file, nothing imports it yet.

**Rollback risk:** None.

**Terminal validation:**
```
pnpm tsc --noEmit
```

---

## Task 2 — Implement `useCreatorSubmit()` hook

**Files involved:**
- `src/hooks/use-creator-submit.ts`
- `src/lib/supabase-browser.ts` (read-only reference)

**What to do:**
Add the `useCreatorSubmit()` hook:

1. Import `useState` from React.
2. Import `supabase` from `@/lib/supabase-browser`.
3. Implement `saveDraft(draft)` per design.md §3a:
   - Get auth user via `supabase.auth.getUser()`.
   - If no user: return `null`.
   - Use `isNewRow()` to decide INSERT vs UPDATE.
   - INSERT: `creator_edit_projects` with `creator_id`, `title`, `description`, `status: 'draft'`, `thumbnail_url`, `utility_state`.
   - UPDATE: same fields + `updated_at` on existing row.
   - Return row `id` on success, `null` on error with `toast.error`.
4. Implement `submitForReview(draft)` per design.md §3b:
   - Calls `saveDraft(draft)` first.
   - UPDATEs `status = 'submitted'` on the row.
   - Returns `true` / `false`.
5. Export `useCreatorSubmit` as named export.

**Acceptance criteria:**
- Hook compiles with zero TypeScript errors.
- Signed-out path returns `null` / `false` without querying Supabase.
- `pnpm tsc --noEmit` passes.
- `pnpm build` passes.

**Visual preservation:** No UI change. Hook not yet consumed.

**Rollback risk:** Low. New file, nothing imports it yet.

**Terminal validation:**
```
pnpm tsc --noEmit
pnpm build
```

---

## Task 3 — Wire `useCreatorSubmit()` into `creator-studio.submit.tsx`

**Files involved:**
- `src/routes/creator-studio.submit.tsx`
- `src/hooks/use-creator-submit.ts` (read-only)

**What to do:**
Make four targeted additions to `creator-studio.submit.tsx`:

1. Add import:
   ```ts
   import { useCreatorSubmit } from '@/hooks/use-creator-submit';
   ```

2. Inside the `Form` component, add:
   ```ts
   const { saveDraft, submitForReview } = useCreatorSubmit();
   ```

3. Update `saveSilent`:
   ```ts
   const saveSilent = () => {
     store.updateDraft(d.content_id, d);
     saveDraft(d); // fire-and-forget
   };
   ```

4. Update `onSubmit` to be `async` and call `submitForReview`:
   ```ts
   const onSubmit = async () => {
     if (!canSubmit) { toast.error("Complete the checklist to submit."); return; }
     if (seriesMode === "new" && newShow.title) {
       d.show_title = newShow.title; d.show_id = newShow.title.toLowerCase().replace(/\s+/g, "-");
     }
     store.updateDraft(d.content_id, d);
     store.submit(d.content_id);
     await submitForReview(d); // best-effort; navigation proceeds regardless
     navigate({ to: "/creator-studio/submitted", search: { id: d.content_id } as any });
   };
   ```

Do not change any JSX, form sections, checklist logic, or other function bodies.

**Acceptance criteria:**
- "Save Draft" button calls `saveDraft()` in addition to the local store update.
- "Submit for Admin Approval" button calls `submitForReview()` and navigates on completion.
- Signed-out / non-creator: hook is a no-op, navigation still proceeds via local store.
- No crash if Supabase write fails — toast fires and navigation proceeds.
- `pnpm tsc --noEmit` passes.
- `pnpm build` passes.

**Visual preservation:** No structural, layout, or style changes to `creator-studio.submit.tsx`. The form, checklist, sticky bar, and preview dialog are unchanged.

**Rollback risk:** Medium. Rollback: remove the import, the hook call, and revert `saveSilent` and `onSubmit` to their original one-liners.

**Terminal validation:**
```
pnpm tsc --noEmit
pnpm build
```

---

## Task 4 — Final cleanup and verification

**Files involved:**
- `src/hooks/use-creator-submit.ts`
- `src/routes/creator-studio.submit.tsx`

**What to do:**
1. Remove any unused imports from both files.
2. Confirm `submissions-store.tsx` is byte-for-byte unchanged.
3. Confirm `creator-studio.edit.tsx` is byte-for-byte unchanged.
4. Confirm no `creator_post_queue` INSERT anywhere in new code.
5. Confirm no `profiles.is_creator` queries in new code.
6. Run full type check and build.

**Acceptance criteria:**
- Zero TypeScript errors: `pnpm tsc --noEmit`.
- Clean production build: `pnpm build`.
- No unused imports.
- `submissions-store.tsx` and `creator-studio.edit.tsx` unchanged.
- No `creator_post_queue` writes.
- No `is_creator` queries.

**Visual preservation:** No UI change.

**Rollback risk:** None. Cleanup only.

**Terminal validation:**
```
pnpm tsc --noEmit
pnpm build
```

---

## Summary Table

| # | Task | Files | Risk | Validation |
|---|---|---|---|---|
| 1 | Types and pure helpers | use-creator-submit.ts (new) | None | tsc |
| 2 | Implement useCreatorSubmit() hook | use-creator-submit.ts | Low | tsc + build |
| 3 | Wire hook into creator-studio.submit.tsx | creator-studio.submit.tsx | Medium | tsc + build |
| 4 | Final cleanup and verification | both | None | tsc + build |

All tasks are sequential. Do not start a task until the previous task's validation passes.

---

## Do Not Touch

- `src/lib/submissions-store.tsx` — local optimistic layer, preserved as-is
- `src/routes/creator-studio.edit.tsx` — edit studio wiring out of scope
- `src/hooks/use-creator-studio.ts` — read-only hook, no changes needed
- `creator_post_queue` table — requires `stream_uid` (Cloudflare), out of scope
- `shows` table — show creation out of scope
- Any RESTORE UI components

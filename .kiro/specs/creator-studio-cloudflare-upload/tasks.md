# Tasks: Creator Studio — Cloudflare Stream Upload Wiring

**Project:** Trey TV Antigravity  
**Date:** 2026-05-09  
**Prerequisite:** requirements.md and design.md approved.

---

## Task 1 — Verify env var safety and add `.env.local` entries

**Files involved:**

- `.env.local` (local only — never commit)
- `wrangler.jsonc` (read-only — no changes needed)
- `vite.config.ts` (read-only — verify `envPrefix`)

**What to do:**

1. Confirm `vite.config.ts` has `envPrefix: ["VITE_", "NEXT_PUBLIC_"]` — `CLOUDFLARE_*` vars are not in either prefix and will not be injected into the client bundle.
2. Add to `.env.local` (do not commit):
   ```
   CLOUDFLARE_ACCOUNT_ID=your_account_id
   CLOUDFLARE_STREAM_API_TOKEN=your_api_token
   ```
3. Confirm `.env.local` is in `.gitignore`.
4. Do not add `CLOUDFLARE_*` to `wrangler.jsonc` — production secrets are set via `wrangler secret put`.

**Acceptance criteria:**

- `vite.config.ts` `envPrefix` confirmed — no `CLOUDFLARE_*` prefix match.
- `.env.local` has the two vars.
- `.env.local` is gitignored.
- No Cloudflare credentials in any committed file.

**Security boundary:** Cloudflare credentials exist only in `.env.local` (local) and Cloudflare Workers secrets (production). Never in source code, never in `VITE_*` vars.

**Visual preservation:** No UI change.

**Rollback risk:** None. No code changes.

**Terminal validation:**

```
# Verify envPrefix — no build step needed
grep -r "CLOUDFLARE" src/  # should return zero results after later tasks
```

---

## Task 2 — Create server function `upload.server.ts`

**Files involved:**

- `src/lib/creator-studio/upload.server.ts` (new file)
- `src/lib/supabase-browser.ts` (read-only reference)

**What to do:**
Create `src/lib/creator-studio/upload.server.ts` with the `requestDirectUpload` server function per design.md §2.

Key implementation rules:

1. Import `createServerFn` from `@tanstack/react-start`.
2. Import `supabase` from `@/lib/supabase-browser` (safe inside `createServerFn` — runs server-side).
3. Auth check: `supabase.auth.getUser()` — throw `'Sign in required'` if no user.
4. Creator check: query `channels` by `owner_email` — throw `'Creator access required'` if no channel.
5. Read `process.env.CLOUDFLARE_ACCOUNT_ID` and `process.env.CLOUDFLARE_STREAM_API_TOKEN` — throw `'Upload not configured'` if missing (no secret values in error message).
6. POST to Cloudflare `direct_upload` endpoint — throw `'Upload not available'` on any Cloudflare error.
7. INSERT `creator_edit_projects` row with `stream_uid`, `status: 'uploading'`, `creator_id` — non-blocking (catch silently).
8. Return `{ uploadURL, uid, expires, draftId }`.
9. Export `DirectUploadResponse` type.

**Acceptance criteria:**

- File compiles with zero TypeScript errors.
- `process.env.CLOUDFLARE_*` is only accessed inside `.handler()`.
- Return type contains no secrets.
- `pnpm tsc --noEmit` passes.
- `pnpm build` passes — confirms server code is not in client bundle.

**Security boundary:** `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_STREAM_API_TOKEN` are read only inside the `.handler()` callback. The build process strips this from the client bundle. Verify by checking that `pnpm build` succeeds and no `CLOUDFLARE_` string appears in the built client assets.

**Visual preservation:** No UI change. New file, nothing imports it yet.

**Rollback risk:** None. New file.

**Terminal validation:**

```
pnpm tsc --noEmit
pnpm build
```

---

## Task 3 — Create client hook `use-cloudflare-upload.ts`

**Files involved:**

- `src/hooks/use-cloudflare-upload.ts` (new file)
- `src/lib/creator-studio/upload.server.ts` (read-only)

**What to do:**
Create `src/hooks/use-cloudflare-upload.ts` per design.md §3:

1. Import `requestDirectUpload` and `DirectUploadResponse` from `@/lib/creator-studio/upload.server`.
2. Implement `requestUpload()`:
   - Calls `requestDirectUpload()`.
   - On error: `toast.error(err instanceof Error ? err.message : 'Upload failed')`, return `null`.
3. Implement `uploadFile(file, uploadURL, onProgress?)`:
   - Uses `XMLHttpRequest` with `PUT` method.
   - Sets `Content-Type` to `file.type || 'video/mp4'`.
   - Wires `xhr.upload.onprogress` to `onProgress`.
   - Resolves `true` on status 200, `false` otherwise.
   - On error: `toast.error('Upload failed')`, return `false`.
4. Expose `uploading` (true while either operation is in flight) and `progress` (0–100).
5. Export `useCloudflareUpload` as named export.

**Acceptance criteria:**

- Hook compiles with zero TypeScript errors.
- `requestUpload()` returns `null` on server function error without crashing.
- `pnpm tsc --noEmit` passes.
- `pnpm build` passes.

**Security boundary:** The hook never receives or stores the Cloudflare API token. It only receives `uploadURL`, `uid`, `expires`, `draftId` from the server function.

**Visual preservation:** No UI change. Hook not yet consumed.

**Rollback risk:** Low. New file.

**Terminal validation:**

```
pnpm tsc --noEmit
pnpm build
```

---

## Task 4 — Wire upload into `creator-studio.edit.tsx`

**Files involved:**

- `src/routes/creator-studio.edit.tsx`
- `src/hooks/use-cloudflare-upload.ts` (read-only)

**What to do:**
Make targeted changes to `creator-studio.edit.tsx` per design.md §4:

1. Add import:

   ```ts
   import { useCloudflareUpload } from "@/hooks/use-cloudflare-upload";
   ```

2. Inside `Studio` component, add:

   ```ts
   const { requestUpload, uploadFile } = useCloudflareUpload();
   const [streamUid, setStreamUid] = useState<string | null>(null);
   const [draftId, setDraftId] = useState<string | null>(null);
   ```

3. Replace `handleFile` with an `async` version that:
   - Sets `uploadState = 'uploading'`, `progress = 0`.
   - Calls `requestUpload()` — if null, sets `uploadState = 'error'`, returns.
   - Stores `uid` and `draftId` in state.
   - Calls `uploadFile(file, result.uploadURL, setProgress)`.
   - On failure: sets `uploadState = 'error'`, returns.
   - On success: sets `mediaUrl`, `uploadState = 'ready'`, fires `toast.success`.
   - Remove the `setInterval` progress simulation.

4. Update the "Next: Details" button `onClick` to pass `draftId`:
   ```ts
   navigate({ to: "/creator-studio/submit", search: { id: draftId ?? undefined } as any });
   ```

**Acceptance criteria:**

- File picker triggers real upload flow.
- Progress bar reflects real XHR upload progress.
- On Cloudflare error: `uploadState = 'error'`, existing error UI renders.
- On success: `uploadState = 'ready'`, existing ready UI renders.
- "Next: Details" passes `draftId` to submit page.
- `pnpm tsc --noEmit` passes.
- `pnpm build` passes.

**Security boundary:** No Cloudflare credentials in this file. The hook abstracts the server function call entirely.

**Visual preservation:** The upload UI (empty state, progress bar, processing state, ready state, error state) is structurally unchanged. The only behavioral change is that the progress bar reflects real upload progress instead of a simulated interval.

**Rollback risk:** Medium. Rollback: revert `handleFile` to the original `setInterval` simulation, remove the two new state vars, remove the import, revert the navigation call.

**Terminal validation:**

```
pnpm tsc --noEmit
pnpm build
```

---

## Task 5 — Final cleanup and verification

**Files involved:**

- All modified files

**What to do:**

1. Confirm no `CLOUDFLARE_` string appears in `src/` outside of `upload.server.ts`.
2. Confirm `upload.server.ts` only accesses `process.env.CLOUDFLARE_*` inside `.handler()`.
3. Confirm `submissions-store.tsx`, `use-creator-submit.ts`, `use-creator-studio.ts` are unchanged.
4. Confirm `creator_post_queue` is not referenced in any new code.
5. Run full type check and build.

**Acceptance criteria:**

- Zero TypeScript errors: `pnpm tsc --noEmit`.
- Clean production build: `pnpm build`.
- No `CLOUDFLARE_` references outside `upload.server.ts`.
- No `creator_post_queue` writes in new code.
- All previously wired files unchanged.

**Security boundary:** Final confirmation that no secrets leaked into client-side files.

**Visual preservation:** No UI change.

**Rollback risk:** None. Cleanup only.

**Terminal validation:**

```
pnpm tsc --noEmit
pnpm build
```

---

## Summary Table

| #   | Task                           | Files                          | Risk   | Validation   |
| --- | ------------------------------ | ------------------------------ | ------ | ------------ |
| 1   | Verify env var safety          | .env.local                     | None   | Manual check |
| 2   | Create server function         | upload.server.ts (new)         | Low    | tsc + build  |
| 3   | Create client hook             | use-cloudflare-upload.ts (new) | Low    | tsc + build  |
| 4   | Wire upload into edit page     | creator-studio.edit.tsx        | Medium | tsc + build  |
| 5   | Final cleanup and verification | all                            | None   | tsc + build  |

All tasks are sequential. Do not start a task until the previous task's validation passes.

---

## Do Not Touch

- `src/lib/submissions-store.tsx` — preserved as-is
- `src/hooks/use-creator-submit.ts` — no changes needed
- `src/hooks/use-creator-studio.ts` — no changes needed
- `creator_post_queue` table — still blocked until stream_uid exists; INSERT remains out of scope
- Edit studio export features — out of scope
- Any RESTORE UI components
- `wrangler.jsonc` — do not add secrets to this file; use `wrangler secret put` for production

# Requirements: Creator Studio — Cloudflare Stream Upload Wiring

**Project:** Trey TV Antigravity  
**Date:** 2026-05-09  
**Scope:** Cloudflare Stream direct upload URL creation and stream_uid capture only. No edit studio, no payouts, no Stripe, no admin tools, no redesign.

---

## 1. Goal

Allow approved creators to initiate a Cloudflare Stream direct upload from the Creator Studio edit page. The server generates a temporary upload URL without exposing the Cloudflare API token to the browser. After upload, the `stream_uid` is stored in `creator_edit_projects` so `creator_post_queue` can be used in a later phase.

---

## 2. Security Boundary — Non-Negotiable

| Rule                                   | Detail                                                                                |
| -------------------------------------- | ------------------------------------------------------------------------------------- |
| Cloudflare API token stays server-side | Never in `VITE_*` or `NEXT_PUBLIC_*` env vars                                         |
| Browser receives only                  | Temporary `uploadURL` (1h TTL) + `uid` + `expires` + `draftId`                        |
| Server function enforces auth          | Rejects unauthenticated and non-creator requests before calling Cloudflare            |
| No token in client bundle              | `createServerFn` handler code is stripped from the client bundle by the build process |
| Secrets not committed                  | `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_STREAM_API_TOKEN` in `.env.local` only        |

---

## 3. Platform Architecture: TanStack Start `createServerFn`

This project uses **TanStack Start** with **Cloudflare Workers**, not Next.js. There are no Next.js API routes. The correct mechanism for server-only logic is `createServerFn` from `@tanstack/react-start`.

- `createServerFn` handlers run server-side only. The build process replaces them with RPC stubs in the client bundle.
- Server-only env vars are accessed via `process.env` inside the handler (Cloudflare Workers injects bindings as `process.env` via the `nodejs_compat` flag, which is already set in `wrangler.jsonc`).
- `VITE_*` and `NEXT_PUBLIC_*` prefixes are exposed to the browser — Cloudflare secrets must use neither prefix.

**No existing server functions exist in this project.** This will be the first `createServerFn`.

---

## 4. Required Environment Variables

| Variable                      | Where set                                | Exposed to browser? |
| ----------------------------- | ---------------------------------------- | ------------------- |
| `CLOUDFLARE_ACCOUNT_ID`       | `.env.local` + Cloudflare Workers secret | ❌ Never            |
| `CLOUDFLARE_STREAM_API_TOKEN` | `.env.local` + Cloudflare Workers secret | ❌ Never            |

These must not use `VITE_` or `NEXT_PUBLIC_` prefixes. They are accessed only inside `createServerFn` handlers via `process.env`.

---

## 5. Schema Verification

### `creator_edit_projects` — stream_uid field

| Column       | Type    | Notes                                                        |
| ------------ | ------- | ------------------------------------------------------------ |
| `stream_uid` | `text`  | nullable — set after upload URL is created                   |
| `status`     | `text`  | `'uploading'` when upload URL is issued                      |
| `metadata`   | `jsonb` | stores `upload_status`, `upload_expires_at`, `playback_type` |

RLS: INSERT and UPDATE allowed for `creator_id = auth.uid()`.

### `creator_post_queue` — required fields (future phase)

| Column            | Constraint          | Notes                                               |
| ----------------- | ------------------- | --------------------------------------------------- |
| `stream_uid`      | `NOT NULL`          | Blocks INSERT until stream_uid exists               |
| `creator_id`      | `NOT NULL`          | `auth.uid()`                                        |
| `title`           | `NOT NULL`          | From submission metadata                            |
| `approval_status` | default `'pending'` | RLS: INSERT only with `approval_status = 'pending'` |

`creator_post_queue` INSERT remains out of scope for this phase. It becomes unblocked once `stream_uid` is stored in `creator_edit_projects`.

---

## 6. Cloudflare Direct Upload Response Shape

The server function returns to the browser:

```ts
type DirectUploadResponse = {
  uploadURL: string; // Temporary TUS upload endpoint (1h TTL)
  uid: string; // Cloudflare Stream video UID
  expires: string; // ISO timestamp of URL expiry
  draftId: string | null; // creator_edit_projects row id (if created)
};
```

The browser uses `uploadURL` to upload the video file directly to Cloudflare via the TUS protocol. The `uid` is the `stream_uid` to store.

---

## 7. Functional Requirements

### FR-1: Server function — `requestDirectUpload`

- Create `src/lib/creator-studio/upload.server.ts` with a `createServerFn` that:
  1. Verifies the user is authenticated via `supabase.auth.getUser()`.
  2. Verifies the user has an approved channel via `channels.owner_email = auth email`.
  3. Reads `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_STREAM_API_TOKEN` from `process.env`.
  4. If env vars missing: throws an error with message `'Upload not configured'` (no secret values in message).
  5. POSTs to `https://api.cloudflare.com/client/v4/accounts/{accountId}/stream/direct_upload` with 1h expiry and `maxDurationSeconds: 14400`.
  6. On Cloudflare error: throws with a safe generic message.
  7. On success: INSERTs a `creator_edit_projects` row with `status: 'uploading'`, `stream_uid: uid`, `creator_id: auth.uid()`.
  8. Returns `{ uploadURL, uid, expires, draftId }`.
- Signed-out: throws with `'Sign in required'`.
- Non-creator: throws with `'Creator access required'`.

### FR-2: Client-side upload hook — `useCloudflareUpload`

- Create `src/hooks/use-cloudflare-upload.ts`.
- Exposes: `requestUpload(): Promise<DirectUploadResponse | null>`, `uploadFile(file: File, uploadURL: string, onProgress?: (pct: number) => void): Promise<boolean>`, `uploading`, `progress`.
- `requestUpload()` calls the server function.
- `uploadFile()` uploads the file to `uploadURL` using `fetch` with `PUT` and `Content-Type: video/*` (TUS-compatible simple upload for files under Cloudflare's limit).
- On error: `toast.error(...)`, return `null` / `false`.
- Signed-out / non-creator: `requestUpload()` returns `null` (server function throws, caught here).

### FR-3: Wire upload into `creator-studio.edit.tsx`

- The edit page already has a file picker (`<input type="file">`) and upload state machine (`UploadState`).
- Replace the `// TODO: wire to real upload pipeline` comment in `handleFile()` with:
  1. Call `requestUpload()` to get the upload URL.
  2. If null: set `uploadState = 'error'`, return.
  3. Call `uploadFile(file, uploadURL, setProgress)`.
  4. On success: set `uploadState = 'ready'`, store `uid` in component state.
  5. On failure: set `uploadState = 'error'`.
- The existing progress bar, processing state, and ready state UI remain unchanged.

### FR-4: Pass `stream_uid` to submit flow

- After a successful upload, the `uid` (stream_uid) must be available when the user navigates to `/creator-studio/submit`.
- Store `uid` in the `creator_edit_projects` row (already done in FR-1 step 7).
- Pass `draftId` as the `?id=` search param when navigating to `/creator-studio/submit` (the edit page already navigates there via the "Next: Details" button).
- `useCreatorSubmit.saveDraft()` already handles UPDATE on existing rows by `content_id` — no change needed there.

### FR-5: `creator_post_queue` remains out of scope

- Do not INSERT into `creator_post_queue` in this phase.
- The `stream_uid` is now stored in `creator_edit_projects` — this unblocks `creator_post_queue` in a future phase.

### FR-6: Graceful handling

- Signed-out: server function throws, client catches, `toast.error('Sign in required')`, upload state resets.
- Non-creator: same pattern.
- Cloudflare not configured: `toast.error('Upload not available')`, upload state resets.
- Upload failure: `uploadState = 'error'`, existing error UI renders.

### FR-7: Visual preservation

- `creator-studio.edit.tsx` upload UI (empty state, progress bar, processing state, ready state, error state) is structurally unchanged.
- The only change is replacing the `// TODO` comment with real logic.
- No new UI elements added.

---

## 8. Non-Functional Requirements

- **Build safety:** Every change must pass `pnpm tsc --noEmit` and `pnpm build`.
- **No browser validation:** No Playwright, no screenshots, no Read URL checks.
- **No new dependencies:** TUS upload uses native `fetch`. No `tus-js-client` needed for simple uploads.
- **No redesign.**
- **Rollback:** Reverting `handleFile()` in `creator-studio.edit.tsx` to the `// TODO` comment fully restores prior behavior.

---

## 9. Out of Scope

- TUS resumable upload protocol (simple PUT upload is sufficient for this phase)
- Cloudflare Stream webhook / status polling
- `creator_post_queue` INSERT
- Edit studio export features
- Video playback after upload
- Cloudflare Stream thumbnail generation
- Admin tools
- Payments / Stripe / creator payouts

# Design: Creator Studio — Cloudflare Stream Upload Wiring

**Project:** Trey TV Antigravity  
**Date:** 2026-05-09

---

## 1. Architecture Overview

```
creator-studio.edit.tsx
  └── useCloudflareUpload()          ← NEW hook (src/hooks/use-cloudflare-upload.ts)
        ├── requestDirectUpload()    ← NEW server function (src/lib/creator-studio/upload.server.ts)
        │     ├── process.env        ← CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_STREAM_API_TOKEN (server-only)
        │     ├── supabase.auth      ← auth check (server-side)
        │     ├── channels           ← creator access check (server-side)
        │     ├── Cloudflare API     ← POST /stream/direct_upload
        │     └── creator_edit_projects ← INSERT with stream_uid + status:'uploading'
        └── uploadFile()             ← browser PUT to Cloudflare uploadURL (no token)

Security boundary: Cloudflare token never leaves the server function handler.
Browser only receives: uploadURL (temp), uid, expires, draftId.
```

Two new files. One targeted edit to `creator-studio.edit.tsx`.

---

## 2. Server Function: `upload.server.ts`

### File: `src/lib/creator-studio/upload.server.ts`

```ts
import { createServerFn } from '@tanstack/react-start';
import { supabase } from '@/lib/supabase-browser'; // server-side call is safe inside createServerFn

// Return type exposed to browser — no secrets
export type DirectUploadResponse = {
  uploadURL: string;
  uid: string;
  expires: string;
  draftId: string | null;
};

export const requestDirectUpload = createServerFn({ method: 'POST' })
  .handler(async (): Promise<DirectUploadResponse> => {
    // 1. Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) throw new Error('Sign in required');

    // 2. Creator access check
    const { data: channel } = await supabase
      .from('channels')
      .select('id')
      .eq('owner_email', user.email.toLowerCase())
      .in('status', ['draft', 'active'])
      .maybeSingle();
    if (!channel) throw new Error('Creator access required');

    // 3. Read server-only env vars
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
    const apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN?.trim();
    if (!accountId || !apiToken) throw new Error('Upload not configured');

    // 4. Request direct upload URL from Cloudflare
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const cfRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/direct_upload`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expiry: expires,
          maxDurationSeconds: 14400,
          meta: { creatorId: user.id, platform: 'trey_tv', playbackType: 'video_on_demand' },
        }),
      }
    );
    if (!cfRes.ok) throw new Error('Upload not available');
    const body = await cfRes.json() as { success: boolean; result?: { uid?: string; uploadURL?: string } };
    if (!body.success || !body.result?.uid || !body.result?.uploadURL) throw new Error('Upload not available');

    const { uid, uploadURL } = body.result;

    // 5. Create draft row in creator_edit_projects
    let draftId: string | null = null;
    try {
      const { data: draft } = await supabase
        .from('creator_edit_projects')
        .insert({ creator_id: user.id, status: 'uploading', stream_uid: uid, title: null, description: null })
        .select('id')
        .single();
      draftId = draft?.id ?? null;
    } catch { /* non-blocking */ }

    return { uploadURL, uid, expires, draftId };
  });
```

**Key security properties:**
- `process.env.CLOUDFLARE_*` is only read inside the `.handler()` — the build strips this from the client bundle.
- The return value contains only `uploadURL`, `uid`, `expires`, `draftId` — no token, no account ID.
- `supabase` used here is the browser client but called server-side inside `createServerFn` — this is safe because the handler runs on the server.

---

## 3. Client Hook: `use-cloudflare-upload.ts`

### File: `src/hooks/use-cloudflare-upload.ts`

```ts
export type DirectUploadResponse = { uploadURL: string; uid: string; expires: string; draftId: string | null };

type UseCloudflareUploadReturn = {
  requestUpload: () => Promise<DirectUploadResponse | null>;
  uploadFile: (file: File, uploadURL: string, onProgress?: (pct: number) => void) => Promise<boolean>;
  uploading: boolean;
  progress: number;
};
```

**`requestUpload()`:**
- Calls `requestDirectUpload()` (the server function).
- On error: `toast.error(err.message)`, return `null`.

**`uploadFile(file, uploadURL, onProgress)`:**
- Uses `XMLHttpRequest` (not `fetch`) to support upload progress events.
- `PUT` to `uploadURL` with `Content-Type: video/*`.
- `xhr.upload.onprogress` → `onProgress(Math.round(e.loaded / e.total * 100))`.
- On success (status 200): return `true`.
- On error: `toast.error('Upload failed')`, return `false`.

Note: `fetch` does not support upload progress in all environments. `XMLHttpRequest` is used specifically for the progress callback. This is the only place XHR is used.

---

## 4. Changes to `creator-studio.edit.tsx`

One targeted replacement in `handleFile()`:

```ts
// BEFORE (existing TODO):
setTimeout(() => {
  try {
    setMediaUrl(URL.createObjectURL(file));
  } catch {
    setMediaUrl(posts[0].media);
  }
  setUploadState("ready");
  toast.success("Media ready to edit");
}, 700);
// TODO: wire to real upload pipeline

// AFTER:
const result = await requestUpload();
if (!result) { setUploadState("error"); return; }
setStreamUid(result.uid);
setDraftId(result.draftId);
const ok = await uploadFile(file, result.uploadURL, setProgress);
if (!ok) { setUploadState("error"); return; }
try { setMediaUrl(URL.createObjectURL(file)); } catch { setMediaUrl(posts[0].media); }
setUploadState("ready");
toast.success("Media ready to edit");
```

Add two new state variables:
```ts
const [streamUid, setStreamUid] = useState<string | null>(null);
const [draftId, setDraftId] = useState<string | null>(null);
```

Update the "Next: Details" button navigation to pass `draftId`:
```ts
// before:
navigate({ to: "/creator-studio/submit", search: { id: undefined } as any })
// after:
navigate({ to: "/creator-studio/submit", search: { id: draftId ?? undefined } as any })
```

Add import:
```ts
import { useCloudflareUpload } from '@/hooks/use-cloudflare-upload';
```

Add inside `Studio` component:
```ts
const { requestUpload, uploadFile, uploading } = useCloudflareUpload();
```

Remove the `setInterval` progress simulation (replaced by real XHR progress).

---

## 5. Env Var Setup

### `.env.local` (never commit)
```
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_STREAM_API_TOKEN=your_api_token
```

### `wrangler.jsonc` (for production Cloudflare Workers deployment)
Secrets are set via `wrangler secret put CLOUDFLARE_ACCOUNT_ID` and `wrangler secret put CLOUDFLARE_STREAM_API_TOKEN` — not in the file itself.

### Verification
`vite.config.ts` uses `envPrefix: ["VITE_", "NEXT_PUBLIC_"]` — `CLOUDFLARE_*` vars are not prefixed with either, so they are never injected into the client bundle.

---

## 6. Files Changed

| File | Change |
|---|---|
| `src/lib/creator-studio/upload.server.ts` | New file — server function |
| `src/hooks/use-cloudflare-upload.ts` | New file — client hook |
| `src/routes/creator-studio.edit.tsx` | Replace `// TODO` in `handleFile()`, add 2 state vars, update navigation |

No other files touched. `submissions-store.tsx`, `use-creator-submit.ts`, `use-creator-studio.ts` are untouched.

---

## 7. Rollback Plan

Revert `handleFile()` in `creator-studio.edit.tsx` to the original `setInterval` simulation and `// TODO` comment. Remove the two new imports and state vars. The server function and hook files can remain — they are not called if `handleFile` doesn't invoke them.

---

## 8. Validation

```
pnpm tsc --noEmit   # zero errors
pnpm build          # clean build — confirms server function code is not in client bundle
```

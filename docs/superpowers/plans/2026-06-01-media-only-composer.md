# Media-only Composer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the bottom-nav **+** button open a media-first composer where a post is exactly one of {photo, ≤30s clip, user-created FWD GIF} + optional caption, uploaded to Supabase Storage and shown on the author's public profile.

**Architecture:** Upgrade the existing `src/components/feed/Composer.tsx` (media-required, optional caption, 30s enforcement, created-GIF only, upload-on-post), point the stub `/create` route at it, add a `feed-media` Storage bucket + a `uploadFeedMedia` helper, and extend `user_feed_posts` + `addPost` with `media_type`/`media_duration_ms`.

**Tech Stack:** React + TanStack Router, Supabase (Postgres + Storage), Supabase CLI migrations against the linked **Trizzy Hub** project, `node:test` for unit tests, Playwright for browser smoke.

Spec: `docs/superpowers/specs/2026-06-01-media-only-composer-design.md`

---

## File structure

- Create `supabase/migrations/20260601020000_feed_media_posts.sql` — `user_feed_posts` columns + `feed-media` bucket + Storage RLS.
- Create `src/lib/feed/mediaValidation.ts` — pure validation (type/size/caption) + DOM duration helper.
- Create `src/lib/feed/mediaValidation.test.ts` — `node:test` unit tests for the pure validators.
- Modify `src/lib/supabase-storage.ts` — add `uploadFeedMedia`.
- Modify `src/lib/feed-store.tsx` — extend `UserPost`, `addPost` input + insert + `loadPosts` mapping.
- Modify `src/components/fwd/FwdGifPicker.tsx` — add `restrictTab` prop.
- Modify `src/components/feed/Composer.tsx` — media-first rewrite.
- Modify `src/routes/create.tsx` — render the upgraded `Composer`.

---

## Task 1: Database migration — columns + feed-media bucket + RLS

**Files:**
- Create: `supabase/migrations/20260601020000_feed_media_posts.sql`

- [ ] **Step 1: Write the migration**

```sql
-- Media-only composer: post media columns + feed-media Storage bucket.
alter table public.user_feed_posts
  add column if not exists media_type text
    check (media_type is null or media_type in ('image', 'video', 'gif'));
alter table public.user_feed_posts
  add column if not exists media_duration_ms integer;

-- Public bucket for feed photos/clips (FWD GIFs keep their own hosted URLs).
insert into storage.buckets (id, name, public)
values ('feed-media', 'feed-media', true)
on conflict (id) do nothing;

-- Public read; authenticated users may write only under their own <user_id>/ prefix.
drop policy if exists "feed_media_public_read" on storage.objects;
create policy "feed_media_public_read"
  on storage.objects for select
  using (bucket_id = 'feed-media');

drop policy if exists "feed_media_owner_insert" on storage.objects;
create policy "feed_media_owner_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'feed-media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "feed_media_owner_update" on storage.objects;
create policy "feed_media_owner_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'feed-media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "feed_media_owner_delete" on storage.objects;
create policy "feed_media_owner_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'feed-media' and (storage.foldername(name))[1] = auth.uid()::text);
```

- [ ] **Step 2: Dry-run the push**

Run: `supabase db push --dry-run --linked`
Expected: lists `20260601020000_feed_media_posts.sql` as the only pending migration.

- [ ] **Step 3: Apply the migration**

Run: `printf 'y\n' | supabase db push --linked`
Expected: `Applying migration 20260601020000_feed_media_posts.sql...` then `Finished supabase db push.`

- [ ] **Step 4: Verify columns + bucket exist**

Run (replace `$KEY` with the value of `SUPABASE_SERVICE_ROLE_KEY` from `.env`):
```bash
APP=https://wcdwlqnfcsuaacbvdmgx.supabase.co
curl -s -o /dev/null -w "cols %{http_code}\n" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" \
  "$APP/rest/v1/user_feed_posts?select=media_type,media_duration_ms&limit=1"
curl -s -H "apikey: $KEY" -H "Authorization: Bearer $KEY" \
  "$APP/rest/v1/bucket?select=id" 2>/dev/null; echo
```
Expected: `cols 200` (columns resolve). Bucket existence is confirmed in the Task 8 browser smoke (upload succeeds).

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260601020000_feed_media_posts.sql
git commit -m "feat(feed): add user_feed_posts media columns + feed-media storage bucket"
```

---

## Task 2: Media validation utility (TDD)

**Files:**
- Create: `src/lib/feed/mediaValidation.ts`
- Test: `src/lib/feed/mediaValidation.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateMediaFile, validateCaption, MAX_CAPTION, MAX_IMAGE_BYTES, MAX_VIDEO_BYTES } from './mediaValidation';

test('accepts an image under the size cap', () => {
  const r = validateMediaFile({ type: 'image/png', size: 1000 });
  assert.deepEqual(r, { ok: true, kind: 'image' });
});

test('accepts a video under the size cap', () => {
  const r = validateMediaFile({ type: 'video/mp4', size: 1000 });
  assert.deepEqual(r, { ok: true, kind: 'video' });
});

test('rejects a non image/video type', () => {
  const r = validateMediaFile({ type: 'application/pdf', size: 10 });
  assert.equal(r.ok, false);
});

test('rejects an oversized image', () => {
  const r = validateMediaFile({ type: 'image/jpeg', size: MAX_IMAGE_BYTES + 1 });
  assert.equal(r.ok, false);
});

test('rejects an oversized video', () => {
  const r = validateMediaFile({ type: 'video/mp4', size: MAX_VIDEO_BYTES + 1 });
  assert.equal(r.ok, false);
});

test('caption: empty is allowed', () => {
  assert.deepEqual(validateCaption('   '), { ok: true });
});

test('caption: over max is rejected', () => {
  assert.equal(validateCaption('x'.repeat(MAX_CAPTION + 1)).ok, false);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test src/lib/feed/mediaValidation.test.ts`
Expected: FAIL — cannot find module `./mediaValidation`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/feed/mediaValidation.ts
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;       // 8 MB
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;      // 50 MB
export const MAX_VIDEO_DURATION_MS = 30_000;          // 30 s
export const MAX_CAPTION = 150;

export type PostMediaKind = 'image' | 'video';

export type MediaValidation =
  | { ok: true; kind: PostMediaKind }
  | { ok: false; error: string };

/** Validate a chosen file's MIME type + size. Duration is checked separately (needs the DOM). */
export function validateMediaFile(file: { type: string; size: number }): MediaValidation {
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  if (!isImage && !isVideo) {
    return { ok: false, error: 'Only photos and video clips are allowed.' };
  }
  if (isImage && file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: 'Image must be under 8MB.' };
  }
  if (isVideo && file.size > MAX_VIDEO_BYTES) {
    return { ok: false, error: 'Clip must be under 50MB.' };
  }
  return { ok: true, kind: isImage ? 'image' : 'video' };
}

export function validateCaption(text: string): { ok: true } | { ok: false; error: string } {
  if (text.trim().length > MAX_CAPTION) {
    return { ok: false, error: `Caption must be under ${MAX_CAPTION} characters.` };
  }
  return { ok: true };
}

/** Reads a video file's duration in ms via a hidden <video> element. Browser-only. */
export function getVideoDurationMs(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Math.round((v.duration || 0) * 1000));
    };
    v.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read the video file.'));
    };
    v.src = url;
  });
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test src/lib/feed/mediaValidation.test.ts`
Expected: PASS — all 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/feed/mediaValidation.ts src/lib/feed/mediaValidation.test.ts
git commit -m "feat(feed): media validation helpers (type/size/duration/caption)"
```

---

## Task 3: feed-media upload helper

**Files:**
- Modify: `src/lib/supabase-storage.ts` (append a new export)

- [ ] **Step 1: Add the helper**

Append after `uploadProfileMedia`:
```ts
export async function uploadFeedMedia(userId: string, file: File) {
  const supabase = createBrowserClient();
  const ext = extFromFile(file, file.type.startsWith("video/") ? "mp4" : "jpg");
  const path = `${userId}/${Date.now()}-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("feed-media").upload(path, file, {
    cacheControl: "3600",
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("feed-media").getPublicUrl(path);
  return { path, url: data.publicUrl };
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep "supabase-storage" || echo clean`
Expected: `clean`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase-storage.ts
git commit -m "feat(feed): uploadFeedMedia storage helper"
```

---

## Task 4: Extend UserPost + addPost + loadPosts

**Files:**
- Modify: `src/lib/feed-store.tsx`

- [ ] **Step 1: Add `mediaType` to the `UserPost` type**

In the `UserPost` type (after `media?: string;`) add:
```ts
  mediaType?: "image" | "video" | "gif";
```

- [ ] **Step 2: Extend the `addPost` input type**

In `type Ctx`, change the `addPost` input object to include:
```ts
    media?: string;
    mediaType?: UserPost["mediaType"];
    durationMs?: number;
```
(keep the existing `text`, `audience`, `tags`, `sourceType`, `gifFwdId`, `gifPosterUrl`, `gifTitle` fields)

- [ ] **Step 3: Set the new fields in `addPost`**

In `addPost`, destructure `mediaType` and `durationMs` from the input (alongside the existing fields), include `mediaType` on the optimistic `post` object, and add to the `.insert({...})` payload:
```ts
              media_type: mediaType ?? null,
              media_duration_ms: durationMs ?? null,
```

- [ ] **Step 4: Map the new fields in `loadPosts`**

In the `loadPosts` `.select(...)` string add `, media_type, media_duration_ms`, and in the row mapping add:
```ts
          mediaType: row.media_type ?? undefined,
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep "feed-store" || echo clean`
Expected: `clean`.

- [ ] **Step 6: Commit**

```bash
git add src/lib/feed-store.tsx
git commit -m "feat(feed): carry media_type + duration on posts"
```

---

## Task 5: FwdGifPicker `restrictTab` prop

**Files:**
- Modify: `src/components/fwd/FwdGifPicker.tsx`

- [ ] **Step 1: Add the prop + use it**

In `FwdGifPickerProps` add:
```ts
  restrictTab?: FwdGifLibraryTab;
```
Change the component signature to accept `restrictTab`, initialize state from it, and (when set) render only that tab:
```ts
export function FwdGifPicker({ open, onClose, onSelect, treyTvUid, context = "message", draft, restrictTab }: FwdGifPickerProps) {
  const [tab, setTab] = useState<FwdGifLibraryTab | "discover">(restrictTab ?? "saved");
```
Replace the tabs source with:
```ts
  const visibleTabs = restrictTab ? TABS.filter((t) => t.key === restrictTab) : TABS;
```
and map over `visibleTabs` instead of `TABS` in the tab bar.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep "FwdGifPicker" || echo clean`
Expected: `clean`.

- [ ] **Step 3: Commit**

```bash
git add src/components/fwd/FwdGifPicker.tsx
git commit -m "feat(fwd): FwdGifPicker restrictTab prop"
```

---

## Task 6: Media-first Composer

**Files:**
- Modify (full replace): `src/components/feed/Composer.tsx`

- [ ] **Step 1: Replace the component**

```tsx
import { Image as ImageIcon, Film, Sparkles as GifIcon, Globe, ChevronDown, Lock, Users, X, Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { currentUser } from "@/lib/mock-data";
import { useFeed } from "@/lib/feed-store";
import { useAuth } from "@/lib/auth";
import { useAuth as useSupabaseAuth } from "@/hooks/use-auth";
import { FwdGifPicker } from "@/components/fwd/FwdGifPicker";
import { uploadFeedMedia } from "@/lib/supabase-storage";
import {
  validateMediaFile, validateCaption, getVideoDurationMs,
  MAX_CAPTION, MAX_VIDEO_DURATION_MS,
} from "@/lib/feed/mediaValidation";

const AUDIENCES = [
  { id: "Everyone", label: "Everyone", icon: Globe },
  { id: "Followers", label: "Followers", icon: Users },
  { id: "Premium", label: "Premium", icon: Lock },
] as const;

type Draft =
  | { kind: "image" | "video"; file: File; previewUrl: string; durationMs?: number }
  | { kind: "gif"; url: string; gifFwdId: string | null; gifPosterUrl: string | null; gifTitle: string | null }
  | null;

export function Composer() {
  const navigate = useNavigate();
  const { addPost } = useFeed();
  const { isGuest, user } = useAuth();
  const { user: supabaseUser } = useSupabaseAuth();
  const avatarUrl = user?.avatar || currentUser.avatar;

  const [caption, setCaption] = useState("");
  const [audience, setAudience] = useState<(typeof AUDIENCES)[number]["id"]>("Everyone");
  const [audOpen, setAudOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(null);
  const [showFwdPicker, setShowFwdPicker] = useState(false);
  const [posting, setPosting] = useState(false);
  const imgRef = useRef<HTMLInputElement | null>(null);
  const vidRef = useRef<HTMLInputElement | null>(null);

  const clearDraft = () => {
    if (draft && (draft.kind === "image" || draft.kind === "video")) URL.revokeObjectURL(draft.previewUrl);
    setDraft(null);
  };
  const reset = () => { clearDraft(); setCaption(""); };

  const onFile = async (f: File | null) => {
    if (!f) return;
    const v = validateMediaFile(f);
    if (!v.ok) { toast.error(v.error); return; }
    if (v.kind === "video") {
      try {
        const durationMs = await getVideoDurationMs(f);
        if (durationMs > MAX_VIDEO_DURATION_MS) {
          toast.error("Clips must be 30 seconds or shorter.");
          return;
        }
        clearDraft();
        setDraft({ kind: "video", file: f, previewUrl: URL.createObjectURL(f), durationMs });
      } catch {
        toast.error("Could not read that video.");
      }
      return;
    }
    clearDraft();
    setDraft({ kind: "image", file: f, previewUrl: URL.createObjectURL(f) });
  };

  const handlePost = async () => {
    if (isGuest) { toast("Sign up to post"); navigate({ to: "/signup" }); return; }
    if (!draft) { toast.error("Add a photo, clip, or GIF first."); return; }
    const cap = validateCaption(caption);
    if (!cap.ok) { toast.error(cap.error); return; }

    setPosting(true);
    try {
      if (draft.kind === "gif") {
        addPost({
          text: caption.trim(), audience, media: draft.url, mediaType: "gif",
          sourceType: "fwd", gifFwdId: draft.gifFwdId, gifPosterUrl: draft.gifPosterUrl, gifTitle: draft.gifTitle,
        });
      } else {
        const uid = supabaseUser?.id;
        if (!uid) { toast.error("Sign in to post."); return; }
        const { url } = await uploadFeedMedia(uid, draft.file);
        addPost({
          text: caption.trim(), audience, media: url, mediaType: draft.kind,
          durationMs: draft.kind === "video" ? draft.durationMs : undefined,
        });
      }
      toast.success("Posted to your profile");
      reset();
      navigate({ to: "/u/$uid", params: { uid: user?.uid ?? currentUser.uid } });
    } catch (err) {
      console.error("Failed to post media:", err);
      toast.error("Upload failed — try again.");
    } finally {
      setPosting(false);
    }
  };

  const aud = AUDIENCES.find((a) => a.id === audience)!;
  const remaining = MAX_CAPTION - caption.length;

  return (
    <div className="mobile-edge-card rounded-none sm:rounded-3xl p-3 sm:p-4 glass neon-border relative overflow-hidden">
      <div className="relative flex items-start gap-3">
        <img src={avatarUrl} alt="" className="size-11 rounded-full object-cover shrink-0 conic-ring" />
        <div className="flex-1 min-w-0">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, MAX_CAPTION))}
            placeholder="Add a caption (optional)"
            rows={1}
            maxLength={MAX_CAPTION}
            className="w-full bg-transparent resize-none outline-none text-sm placeholder:text-muted-foreground leading-relaxed"
            aria-label="Caption"
          />
          {draft && (
            <div className="relative mt-2 rounded-xl overflow-hidden border border-white/10">
              {draft.kind === "video" ? (
                <video src={draft.previewUrl} controls className="w-full max-h-72 object-cover" />
              ) : draft.kind === "gif" ? (
                <img src={draft.url} alt="" className="w-full max-h-72 object-cover" />
              ) : (
                <img src={draft.previewUrl} alt="" className="w-full max-h-72 object-cover" />
              )}
              <button onClick={clearDraft} aria-label="Remove media"
                className="absolute top-2 right-2 size-7 grid place-items-center rounded-full bg-black/60 hover:bg-black/80 backdrop-blur">
                <X className="size-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
      <input ref={vidRef} type="file" accept="video/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />

      <div className="relative mt-3 flex items-center gap-2 flex-wrap">
        <button onClick={() => imgRef.current?.click()} className="px-3 py-2 rounded-xl glass text-xs flex items-center gap-1.5 hover:bg-white/5">
          <ImageIcon className="size-4" /> Photo
        </button>
        <button onClick={() => vidRef.current?.click()} className="px-3 py-2 rounded-xl glass text-xs flex items-center gap-1.5 hover:bg-white/5">
          <Film className="size-4" /> Clip
        </button>
        <button onClick={() => setShowFwdPicker(true)} className="px-3 py-2 rounded-xl glass text-xs flex items-center gap-1.5 hover:bg-white/5">
          <GifIcon className="size-4 text-primary" /> FWD GIF
        </button>
        <div className="relative">
          <button onClick={() => setAudOpen((s) => !s)} className="px-3 py-2 rounded-xl glass text-xs flex items-center gap-1.5 hover:bg-white/5">
            <aud.icon className="size-4" /> {aud.label} <ChevronDown className={`size-3 transition-transform ${audOpen ? "rotate-180" : ""}`} />
          </button>
          {audOpen && (
            <div className="absolute left-0 top-full mt-2 w-44 rounded-xl glass-strong border border-white/10 shadow-2xl p-1 z-30">
              {AUDIENCES.map((a) => (
                <button key={a.id} onClick={() => { setAudience(a.id); setAudOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-white/5 flex items-center gap-2 ${audience === a.id ? "text-primary font-semibold" : ""}`}>
                  <a.icon className="size-4" /> {a.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {caption.length > 0 && (
            <span className={`text-[11px] tabular-nums ${remaining < 20 ? "text-[oklch(0.78_0.24_15)]" : "text-muted-foreground"}`}>{remaining}</span>
          )}
          <button onClick={handlePost} disabled={!draft || posting}
            className="px-4 py-2 rounded-xl text-sm font-semibold border border-primary text-primary glow-gold hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:glow-none flex items-center gap-1.5">
            {posting && <Loader2 className="size-4 animate-spin" />} Post
          </button>
        </div>
      </div>

      <FwdGifPicker
        open={showFwdPicker}
        restrictTab="created"
        context="profile"
        treyTvUid={user?.uid ?? null}
        onClose={() => setShowFwdPicker(false)}
        onSelect={(gif) => {
          setShowFwdPicker(false);
          clearDraft();
          setDraft({ kind: "gif", url: gif.url, gifFwdId: gif.gif_id ?? null, gifPosterUrl: gif.preview_url ?? null, gifTitle: gif.title ?? null });
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep "feed/Composer" || echo clean`
Expected: `clean`.

- [ ] **Step 3: Commit**

```bash
git add src/components/feed/Composer.tsx
git commit -m "feat(feed): media-first composer (photo/30s clip/created GIF + caption)"
```

---

## Task 7: Point `/create` at the upgraded Composer

**Files:**
- Modify (full replace): `src/routes/create.tsx`

- [ ] **Step 1: Replace the route**

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useGoBack } from "@/hooks/use-go-back";
import { AppShell } from "@/components/layout/AppShell";
import { Composer } from "@/components/feed/Composer";

export const Route = createFileRoute("/create")({
  component: Create,
  head: () => ({ meta: [{ title: "Create — Trey TV" }] }),
});

function Create() {
  const goBack = useGoBack("/");
  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center">
          <button onClick={goBack} className="size-9 grid place-items-center rounded-full glass" aria-label="Back">
            <ArrowLeft className="size-4" />
          </button>
        </div>
        <Composer />
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep "routes/create" || echo clean`
Expected: `clean`.

- [ ] **Step 3: Commit**

```bash
git add src/routes/create.tsx
git commit -m "feat(feed): /create renders the media-first composer"
```

---

## Task 8: End-to-end verification

**Files:** none (verification only)

- [ ] **Step 1: Start the dev server (if not running)**

Run: `npm run dev` (background) and wait for `http://localhost:3000/` to return 200.

- [ ] **Step 2: Browser smoke (signed-in session required)**

Drive Playwright (signed-in context) to `http://localhost:3000/create` and verify:
- Post button is **disabled** with no media selected.
- Selecting a ≤30s video enables Post; a >30s video shows the toast "Clips must be 30 seconds or shorter." and is rejected.
- Selecting a photo enables Post.
- "FWD GIF" opens the picker showing **only** the Created tab.
- After posting a photo, the page navigates to `/u/<uid>` and the new post appears.

- [ ] **Step 3: Confirm Storage object + DB row**

Run (service-role key as `$KEY`):
```bash
APP=https://wcdwlqnfcsuaacbvdmgx.supabase.co
curl -s -H "apikey: $KEY" -H "Authorization: Bearer $KEY" \
  "$APP/rest/v1/user_feed_posts?select=id,media_type,media_url,media_duration_ms,body&order=created_at.desc&limit=1"
```
Expected: newest row has `media_type` set, `media_url` pointing at `…/storage/v1/object/public/feed-media/<user_id>/…`, and (for a clip) `media_duration_ms` ≤ 30000.

- [ ] **Step 4: Full typecheck of touched files**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep -E "feed/Composer|feed-store|supabase-storage|routes/create|FwdGifPicker|mediaValidation" || echo clean`
Expected: `clean`.

---

## Self-review notes
- **Spec coverage:** media-required (Task 6 Post-disabled), optional caption ≤150 (Task 2 + 6), photo/≤30s clip/created GIF (Task 6 + 5), Storage bucket + URL (Task 1 + 3 + 6), profile rendering (existing `loadPosts`, extended in Task 4), `/create` wiring (Task 7). All covered.
- **Out of scope (per spec):** friends-feed aggregation (#2), mood AI (#3) — not in this plan.
- **Type consistency:** `mediaType` (`'image'|'video'|'gif'`) is defined in Task 4 and used in Tasks 4/6; `validateMediaFile`/`validateCaption`/`getVideoDurationMs` defined in Task 2 and consumed in Task 6; `uploadFeedMedia` defined in Task 3, consumed in Task 6; `restrictTab` defined in Task 5, used in Task 6.

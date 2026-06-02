# Media-only Composer Upgrade — Design

Date: 2026-06-01
Status: Approved (design) — pending implementation plan
Sub-project 1 of 3 in the "user posts → friends feed → mood-aware Prescribe Me" initiative.

## Context

Pressing the **+** button on the mobile bottom nav (`CreateWheel`) taps through to the
`/create` route, which renders `src/components/feed/Composer.tsx`. Today the composer is
**text-required / media-optional**: `postSchema` requires 1–500 chars of body text, and an
image/video/GIF is optional. Media is stored as a **base64 data URL** in
`user_feed_posts.media_url`. `addPost` (`src/lib/feed-store.tsx`) inserts the row and the
profile page renders the user's own posts.

We want the inverse: a **media-first** post that is **only** a photo, a **≤30-second clip**,
or a **user-created FWD GIF**, with an optional caption. Media must move to **Supabase
Storage** (base64 cannot hold 30s video). Posts continue to land on the user's public
profile; surfacing them in friends' feeds is sub-project #2, and AI mood assessment +
Prescribe Me propagation is sub-project #3. This spec covers **only the composer + media
pipeline + data model**.

### Sibling sub-projects (out of scope here)
- **#2 Friends / Following news feed + post interactions** — aggregate posts from followed
  users (RLS for follower reads) into the For You "Following" tab + home. `useFeed` currently
  loads only the current user's own posts (`.eq("user_id", me)`), so this is a real build.
  Also includes **viewing & interacting with another user's posts**: clicking a public post
  on someone's profile opens a **post-detail popup** showing likes + comments and lets the
  viewer add a comment or reaction. Requires cross-user read RLS on public posts and
  cross-user comment/reaction writes (building on the existing `comments-store` +
  `use-supabase-reactions` infra).
- **#3 AI mood assessment + Prescribe Me** — Gemini 2.5 vision (`aiGenerateVisionJson`)
  scans each post's media + caption for mood; the moods of people you follow are aggregated
  into a social signal feeding their Prescribe Me. Each post row from this spec already
  carries the media URL + caption that #3 reads.

## Goals
- The + button (tap) → `/create` → media-first composer.
- A post requires exactly one media item: photo, ≤30s clip, or a created FWD GIF.
- Optional short caption (≤150 chars).
- Media stored in a `feed-media` Supabase Storage bucket; the post stores its URL + type.
- Post appears on the author's public profile (existing behavior preserved).

## Non-goals
- Friends-feed aggregation (#2), mood AI / Prescribe Me (#3).
- Multi-media carousels (single media per post).
- In-app camera capture / video trimming UI (user supplies a ≤30s clip; we validate, not edit).

## Approach

Approach **A** (approved): upgrade `Composer.tsx` in place and add a media pipeline.
Reuses the `/create` route, `addPost`, profile rendering, `PlusMenu`, and `FwdGifPicker`;
minimizes UI churn (per the project rule against unnecessary app-UI changes).

## UX / behavior (`src/components/feed/Composer.tsx`)
- **Media required.** The Post button is disabled until a media item is selected. Single
  slot — selecting new media replaces the current selection (with the existing remove "X").
- **Optional caption.** The textarea becomes an optional caption, max **150** chars
  (replaces the current required 500-char body). Placeholder: "Add a caption (optional)".
- **Three media sources** (via the existing PlusMenu → file input / FwdGifPicker):
  - **Photo** — `image/*`, ≤ 8 MB.
  - **Clip** — `video/*`, **≤ 30 s** (enforced) and ≤ 50 MB.
  - **FWD GIF** — `FwdGifPicker` restricted to the user's **created** library tab
    (`useFwdGifLibrary` "created"/mine tab); GIF already has a hosted URL.
- Keep the existing **audience** selector (Everyone / Followers / Premium) — drives #2 feed
  visibility — and the **recommendation tags** (feed recommendations / #3).

## Upload + post flow (on Post)
1. **Validate**: media present; caption length ≤150; if video, `duration ≤ 30s`; size/type caps.
2. **Upload** (photo/clip only): `supabase.storage.from('feed-media').upload('<user_id>/<uuid>.<ext>', file)`
   → resolve public URL. FWD GIFs skip upload (already hosted).
3. **`addPost`** with `{ media: url, mediaType, caption, durationMs, audience, tags, gifFwdId, gifPosterUrl, gifTitle }`.
4. **Insert** into `user_feed_posts` (new columns below) with the existing optimistic-prepend
   pattern; reconcile id/created_at from the returned row.

## Data model — migration on `user_feed_posts`
- `media_type text check (media_type in ('image','video','gif'))` — null allowed only for
  legacy rows; new posts always set it.
- `media_duration_ms integer` — clip length; null for image/gif.
- `body` is reused as the **optional caption** (no schema change; now nullable in practice).
- Existing columns reused: `media_url`, `gif_fwd_id`, `gif_poster_url`, `gif_title`,
  `audience`, `tags`, `metrics`.

## Storage — migration
- Create bucket **`feed-media`**, public read.
- RLS on `storage.objects`:
  - `SELECT`: public (anyone can read media for display).
  - `INSERT` / `UPDATE` / `DELETE`: `auth.role() = 'authenticated'` AND the object path's
    first segment equals `auth.uid()` (users write only under their own `<user_id>/` prefix).

## Validation / limits / errors
- Caption ≤ 150 chars (trim; empty allowed).
- Image ≤ 8 MB; video ≤ 30 s and ≤ 50 MB; reject any other MIME type.
- 30s enforcement: load the file into a hidden `<video>`, read `duration` on
  `loadedmetadata`, reject > 30 (toast).
- Upload failure → toast, keep the draft, do **not** insert the DB row.
- Guest → "Sign up to post" + redirect to `/signup` (existing behavior).

## Verification
- **Unit**: caption length, size cap, MIME-type guard, and 30s duration check.
- **Browser smoke**: post a photo; attempt a >30s clip (rejected with message); post a ≤30s
  clip; post a created FWD GIF. Confirm each appears on the author's profile, a `feed-media`
  Storage object exists under `<user_id>/`, and the `user_feed_posts` row has the correct
  `media_type` + `media_url` (or `gif_*`).

## Decisions / defaults
- One media item per post.
- Public-read `feed-media` bucket.
- Caption ≤150; image ≤8 MB; clip ≤30 s / ≤50 MB.
- Keep audience selector + recommendation tags.
- DB migration applied to the live **Trizzy Hub** project via the linked Supabase CLI
  (`supabase db push --linked`), consistent with prior migrations.

# Trey TV Live Music Review — Import-Ready Module

A production-hardened feature module for the existing Trey TV site. It includes:

- Music Review tab: Home, Submit, AI Pre-Check, Queue, Skip-the-Line, Live Room, Results, History, Profile
- Open Mic: queue, ephemeral audio, real chat/reactions, daily limits, auto-delete provisions
- Admin Panel: Dashboard, Queue Manager, Review Workbench, Open Mic Moderation, Settings
- Decorative email/report template
- Cash App Skip-the-Line tiers with manual admin confirmation
- Profile Music Review Scores with averages, category breakdowns, and perk provisions
- Production hardening docs and Supabase RLS migration skeleton

This module is meant to mount under Trey TV’s existing `/music-review` tab without touching unrelated parts of the host app.

## Important production notes

This export is safer than the Famous.ai raw export, but final safety depends on your real Trey TV Supabase project and role mapping.

Changed in this hardening pass:

- Removed hardcoded Famous.ai/databasepad Supabase credentials.
- Uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, or injected `window.__TREY_SUPABASE_CLIENT__`.
- Demo login/admin toggle is disabled in production unless explicitly enabled.
- Admin screens are blocked unless the current user is admin/owner.
- Cash App QR is included at `public/assets/payment/cashapp-qr.png`.
- Payment records remain `pending` and do not mark `priority_paid=true` until admin confirms.
- Audio buckets are treated as private and use signed URLs.
- Queue/Open Mic global mutations prefer server-side RPC helpers.
- Added `supabase/migrations/202605140001_music_review_rls_hardening.sql`.

## Folder layout

```text
src/features/music-review/
├─ MusicReviewModule.tsx
├─ components/
│  ├─ public/
│  ├─ admin/
│  └─ shared/
├─ hooks/useTreyAuth.ts
└─ lib/
   ├─ adminApi.ts
   ├─ env.ts
   ├─ queue/queueLib.ts
   ├─ open-mic/openMicLib.ts
   ├─ audio/upload.ts
   ├─ email/sendReviewEmail.ts
   ├─ types.ts
   └─ theme.ts
```

## Mount inside Trey TV

```tsx
import MusicReviewModule from "@/features/music-review/MusicReviewModule";

export default function MusicReviewTab() {
  return <MusicReviewModule />;
}
```

## Environment variables

Use `.env.example` at the project root.

```text
VITE_SUPABASE_URL=https://YOUR-TREY-TV-SUPABASE.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_TREY_TV_SUPABASE_ANON_KEY
VITE_CASHAPP_CASHTAG=
VITE_CASHAPP_QR_PATH=/assets/payment/cashapp-qr.png
VITE_ENABLE_MUSIC_REVIEW_DEMO_AUTH=false
VITE_ALLOW_PUBLIC_AUDIO_FALLBACK=false
```

## Host app integration

Provide the existing Trey TV user and Supabase client where possible:

```ts
window.__TREY_SUPABASE_CLIENT__ = existingTreyTvSupabaseClient;
window.__TREY_USER__ = {
  id: currentUser.id,
  email: currentUser.email,
  name: currentUser.displayName,
  isAdmin: currentUser.role === "admin" || currentUser.role === "owner",
};
```

Role helpers are exported from `hooks/useTreyAuth.ts`:

```ts
(isAdmin, canManageMusicReviews, canModerateOpenMic, canCompleteReviews);
```

## Admin API exports

Available from `lib/adminApi.ts`:

```ts
getMusicReviewSubmissions;
updateSubmissionStatus;
reorderReviewQueue;
markNowPlaying;
completeMusicReview;
sendMusicReviewEmail;
publishReviewToProfile;
getOpenMicQueue;
removeOpenMicSong;
skipOpenMicSong;
retryOpenMicCleanupAction;
updateMusicReviewSettings;
```

## Database and storage

Expected tables:

```text
music_review_submissions
music_review_queue
music_review_scores
music_review_comments
music_review_reactions
music_review_payments
open_mic_queue
open_mic_play_history
open_mic_daily_limits
music_review_email_logs
music_review_settings
```

Expected buckets:

```text
music-review-audio          private
music-review-cover-art      public or signed
open-mic-temp-audio         private, auto-delete after playback
open-mic-cover-art          public or signed
```

Apply/review:

```text
supabase/migrations/202605140001_music_review_rls_hardening.sql
```

## Cash App QR

The uploaded Cash App QR image is included and wired into the Skip the Line screen:

```text
public/assets/payment/cashapp-qr.png
```

Payment flow:

1. User selects $5, $10, or $15 tier.
2. Payment row is created with `status='pending'`.
3. QR is shown and Cash App deep link opens only if a public cashtag is configured.
4. Admin confirms receipt in the admin queue/payment workflow.
5. Only after admin confirmation should `priority_paid=true` be set.

## Open Mic

Rules preserved:

- 2 songs per user per day
- 10 songs max in queue
- audio plays in the room
- audio is deleted after playback by server/admin cleanup path
- metadata/history remains after deletion

Production-safe note: Open Mic finalization should be triggered by a trusted server function or admin action. The client-side cleanup fallback is disabled in production.

## Quick run

```bash
npm install
npm run dev
```

For isolated local preview only, set:

```text
VITE_ENABLE_MUSIC_REVIEW_DEMO_AUTH=true
VITE_ALLOW_PUBLIC_AUDIO_FALLBACK=true
```

Do not enable those flags in production.

## Build check

```bash
npm run build
```

Build passes after this hardening pass. The remaining chunk-size warning is a normal Vite bundle-size warning and does not block deployment.

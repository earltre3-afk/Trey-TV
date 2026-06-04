# Tradio Broadcast Studio Pass 4: Timeline Preview + Full Episode Audio Assembly

This document describes the design, implementation, database schemas, and audio splicing rules of **Tradio Timeline Assembler** (Pass 4) built directly into the Trey TV / Tradio codebase.

---

## 1. What Was Built
Tradio Broadcast Studio Pass 4 introduces a production-grade timeline assembler that bridges the gap between individual segment drafts and complete, master-quality radio/podcast show files.

Main achievements of this pass:
- **Episode Timeline Preview Screen:** Added an advanced timeline grid visualization where creators can audit, preview, and validate every segment of their episode.
- **Multilevel Timeline Validation Engine:** Categorizes readiness into grades from `draft-ready` all the way to `publish-ready`.
- **Server-Side Audio Assembler:** Processes full episode audio stitching server-side, utilizing system FFmpeg when available, or falling back safely to our pure-JS wave splicing engine.
- **Render Settings Panel:** Allows configuring outputs, target LUFS (-16 for standard podcast/broadcast previews), voice normalization, and silences.
- **Assembly History Logs:** Persists and lists past renders with detailed peak dBs, Loudness, and block manifests.

---

## 2. Timeline Manifest Architecture
To decouple visual UI states from backend audio rendering, the timeline is translated into a structured, linear `TimelineManifest`.

- **Manifest Items:** Hold IDs, sorted index pointers, start/end bounds, gains, fader cues, clearance codes, and private audio asset urls.
- **Sequential Accumulator:** Calculates start/end boundaries on-the-fly, ensuring the FFmpeg timelines are sample-accurate.

---

## 3. Audio Assembly Architecture
Audio processing occurs entirely server-side to guarantee performance, isolate keys, and prevent browser tab crashes during large audio decodes.

- **FFmpeg Pipeline:** When FFmpeg is installed, the backend downloads the manifest resources, translates crossfades and gains into complex audio filter graphs (`amix`, `loudnorm`, `afade`), and outputs a normalized `-16 LUFS` MP3.
- **Zero-Dependency Fallback Chime Synthesizer:** If FFmpeg is absent, the system generates a beautiful, valid wave-spliced audio preview file, ensuring developers are never blocked in sandbox or API-less testing environments.

---

## 4. Server-Side Processing & Storage Security
- **Strict Server boundaries:** Secret environment variables are loaded exclusively on node servers, and private storage buffers are uploaded using RLS-bypassing administrative credentials.
- **Authenticated signed links:** Output playback files are stored privately inside the `tradio` bucket and are resolved on-demand using 24-hour signed tokens.

---

## 5. Supabase Table & RLS Strategy

### Database Table: `tradio_episode_assemblies`
- `id` (uuid, primary key)
- `owner_user_id` (uuid, references `auth.users(id)`)
- `show_id` (uuid, references `tradio_shows(id)`)
- `episode_id` (uuid, references `tradio_show_episodes(id)`)
- `assembly_status` (text check: queued, assembling, completed, failed, canceled)
- `assembly_type` (text check: preview, review, final_candidate)
- `output_audio_url` (text, nullable)
- `output_storage_path` (text, nullable)
- `mime_type` (text, default `'audio/mpeg'`)
- `duration_seconds` (numeric, nullable)
- `sample_rate` (integer, nullable)
- `loudness_lufs` (numeric, nullable)
- `peak_db` (numeric, nullable)
- `block_count` (integer)
- `source_manifest` (jsonb)
- `render_settings` (jsonb)
- `render_error` (text, nullable)

### RLS Policies
- **Owners** have full read, write, and delete permissions on their own assemblies.
- **Admins & Owners** can moderate and view all generated preview candidates.
- **Public Listeners** can never access draft/preview assemblies; they only fetch completed `final_candidate` clips through public routes once the parent episode is published.

---

## 6. How Block Audio Sources Are Resolved
1. **Intro, Voiceover, Transition, Outro:** Resolves the attached completed voice render `media_url` or fails back to written script previews.
2. **Station Drop:** Resolves the custom generated ID station drop asset.
3. **Sponsor Ad:** Pulls from cleared ad read records or maps draft placeholders for preview candidate reviews.
4. **Music Songs:** Requires a cleared, authorized Tradio-native track. If unclear, the track is highlighted in the UI with a "Rights Issue" alert.
5. **Interview:** Requires uploaded media elements.
6. **Silence:** Generates exact millisecond silence gap frames.

---

## 7. Timeline Validation States
Validation is classified into 6 precise levels:
1. `draft-ready`: Basic rundown structure is established.
2. `script-ready`: Written scripts are filled for talk breaks.
3. `voice-ready`: Scripts have finished voice renders.
4. `timeline-preview-ready`: Free of missing audio, ready for preview splicing.
5. `review-ready`: Spliced preview is generated and cleared of rights issues.
6. `publish-ready`: High-status broadcast slot candidate cleared of all blockers.

---

## 8. Files Changed & Added

### New Files Created:
1. `src/tradio/components/tradio/types/broadcastAssemblyTypes.ts` — Typed declarations for manifest items and assembly records.
2. `src/tradio/components/tradio/services/broadcastAssemblyManifest.ts` — Timeline manifests compiler and grading validation checks.
3. `src/tradio/components/tradio/services/broadcastAssemblyStorage.ts` — Assembly uploads and signed URL retrievers.
4. `src/lib/trey-i/broadcastAssembly.server.ts` — Secure TanStack server endpoints for processing splicing.
5. `src/tradio/components/tradio/services/broadcastAssemblyService.ts` — Assembly operations manager.
6. `supabase/migrations/20260605000000_tradio_broadcast_studio_timeline_assembly.sql` — Database schema migration.

### Files Modified:
1. `src/tradio/components/tradio/screens/BroadcastStudioGateway.tsx` — Upgraded UI with Timeline Preview Screen, block cards, missing audio warning banners, render settings panel, and historical assemblies logs.

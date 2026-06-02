# Tradio: Show Foundation + Real AI Builder — Design

Date: 2026-06-01
Status: Approved (design) — pending implementation plan
**Sub-project 1 of 6** in the "Tradio hybrid live radio show" initiative.

## Context

Tradio's live-show surface today is a polished **simulation**, not a real system:
- `DJStudio.tsx` "Go Live" toggles a local `isLive` flag and plays a mock `playItem`; all data
  comes from `data.ts` mocks (`DJS`, `RADIO_SHOWS`, `BROADCAST_BLOCKS`, …).
- `ShowBuilder.tsx` "AI Show Builder" does **not** call AI — `generateShowPlan(form)` is a local
  hardcoded template function. Its "On-Air Simulation Deck" fakes VU meters (`Math.random`), fan
  chat (`CHAT_TEMPLATES`), and a 10×-speed segment ticker. Nothing persists.

The repo has the real ingredients: **Gemini 2.5** (`src/lib/trey-i/aiProvider.server.ts` +
`vertex.server.ts`, with the `aiGenerateJson` + `responseSchema` pattern), **LiveKit** (used by
watch-party), DJ/host **access gating** (`AccessGate`, `tradio_user_roles`), and a working
**legal-acceptance** flow.

### The full initiative (decomposition — chosen model: Hybrid)
A "hybrid" live radio show = a human host can broadcast live on mic **or** hand the desk to an
AI voice host; AI builds the show and assists throughout. Decomposed into 6 sub-projects:
1. **Show foundation + real AI builder** ← THIS SPEC (the "creator")
2. Live broadcast core (LiveKit audio room: host mic → listeners tune in live)
3. In-show real-time interaction (fan chat, song requests, polls)
4. AI voice host + handoff (TTS the AI segments, inject into the room)
5. AI live co-pilot (real-time script prompts, song suggestions, chat-sentiment reads)
6. Music in-broadcast + replays

This spec covers **only #1**. The On-Air simulation deck stays simulated until #2.

## Goals
- "Build Show With AI" calls **real Gemini 2.5** and returns a full lineup: segments with type,
  title, duration, description, host notes, and a **spoken host `script`** (teleprompter text) for
  talk segments.
- Shows **persist** to the database (create, save, list, load, delete), owned by the host.
- `ShowBuilder` and `DJStudio` read/write real shows instead of `data.ts` mocks.
- Robust: AI failure or invalid output never blocks the host — fall back to local generation.

## Non-goals (later sub-projects)
- Real live audio broadcast (#2), real chat/requests/polls (#3), AI voice host/TTS (#4), live
  co-pilot (#5), music playback + replays (#6).
- The On-Air simulation deck remains simulated.
- A real music catalog (song picks reference placeholders / free-text for now).

## Approach
Approach **A** (approved): extend `ShowBuilder` + `DJStudio` in place. Add an AI server function
and a `tradio_radio_shows` table; wire "Generate" → AI and "Save" → DB. Reuses the existing form,
`RadioShow`/`ShowSegment` model, and the timeline editor — minimal UI churn (per the project rule
against unnecessary app-UI changes).

## AI generation — `generateRadioShow` (server fn in `src/lib/trey-i/vertex.server.ts`)
- **Input** (from the ShowBuilder form): `showName`, `showLength` (min), `showMood`,
  `targetAudience`, `hostTone`, `musicSource`, `commercialBreaks`, `fanInteractionStyle`, and the
  include flags (`includeProducerBeatSpotlight`, `includeArtistPremiere`, `includeListenerRequests`).
- **Model**: Gemini 2.5 via `aiGenerateJson`, with a **`responseSchema`** that locks each segment's
  `type` to an `enum` of the 9 valid types
  (`intro | music-block | host-talk | fan-request | producer-spotlight | artist-premiere | commercial | poll | closing`)
  and `duration` to an integer (seconds).
- **Output**: `{ title: string, segments: Array<{ type, title, duration, description, hostNotes, script }> }`.
  `script` = the spoken host lines (teleprompter) for talk segments
  (intro/host-talk/closing/producer-spotlight/artist-premiere); empty for music-block/commercial/poll.
- **Server-side validation/coercion** (applies the Signal-Test lesson): coerce each segment `type`
  to the canonical set (case-insensitive; drop segments with an unrecognizable type), clamp
  `duration` to a sane range (e.g. 15–1800 s), and require ≥1 valid segment. On any failure
  (AI error, empty/invalid result) **fall back to the existing local `generateShowPlan(form)`** so
  the user always gets a usable plan.

## Persistence — migration `tradio_radio_shows`
Columns: `id uuid pk default gen_random_uuid()`, `user_id uuid not null references auth.users(id)
on delete cascade`, `title text not null`, `mood text`, `duration_min integer`,
`target_audience text`, `host_tone text`, `music_source text`,
`status text not null default 'draft' check (status in ('draft','template','scheduled','live','replay'))`,
`is_template boolean not null default false`, `ai_generated boolean not null default false`,
`segments jsonb not null default '[]'::jsonb`, `settings jsonb not null default '{}'::jsonb`
(holds `commercialBreaks`, `fanInteractionStyle`, include flags, `selectedStation`),
`created_at timestamptz default now()`, `updated_at timestamptz default now()` (+ updated_at
trigger reusing `public.tradio_set_updated_at`).

RLS:
- owner `SELECT`/`INSERT`/`UPDATE`/`DELETE` where `auth.uid() = user_id`;
- public `SELECT` where `is_template = true` (shared templates).
- Live/replay public visibility is added in #2.

Applied to the live **Trizzy Hub** project via the linked Supabase CLI (`supabase db push --linked`),
consistent with prior migrations.

## Service layer — `src/tradio/components/tradio/radioShowService.ts`
Supabase-or-local-fallback pattern (mirrors `accessRequestService.ts`):
- `generateShow(form)` → calls the `generateRadioShow` server fn; returns the validated `RadioShow`
  (or the local fallback) + a `source: 'ai' | 'local'` flag.
- `saveShow(show)` → upsert into `tradio_radio_shows` (owner = current user); returns the saved row.
- `listMyShows()` → the host's shows ordered by `updated_at` desc.
- `listTemplates()` → `is_template = true` shows.
- `getShow(id)`, `deleteShow(id)`.
All never throw; on missing-table/RLS/unconfigured Supabase, return a local/in-memory result with a
warning (same classification helper as the access-request service).

## UI wiring (in place)
- `ShowBuilder.tsx`:
  - "Generate Plan" → `generateShow(form)` (async; show a loading/generating state). Keep local
    `generateShowPlan` strictly as the fallback inside the service.
  - Segment cards render the new `script` (teleprompter) in addition to `hostNotes`.
  - "Save Show" → `saveShow(...)` (real persistence) instead of the local `setSaved` flag.
  - "Templates" and "Saved" tabs load from `listTemplates()` / `listMyShows()` instead of the
    `SHOW_TEMPLATES` / `RADIO_SHOWS` mocks (fall back to mocks only when the service reports it has
    no Supabase data).
- `DJStudio.tsx` "Shows" tab → `listMyShows()`.
- Keep the existing DJ/host `AccessGate` and the legal-acceptance flow unchanged.
- The On-Air simulation deck is left as-is (becomes real in #2).

## Error handling
- AI failure / invalid output → local `generateShowPlan` fallback; surface a subtle "used offline
  builder" note, never an error wall.
- DB unavailable / RLS / unconfigured → keep the generated plan in local state, warn that it wasn't
  saved remotely.
- Invalid AI segment types → coerced or dropped server-side before returning.

## Verification
- **`node:test`** unit tests for the segment coercion/validation helper (valid types pass; unknown
  types dropped; durations clamped; empty result triggers fallback).
- **`tsc --noEmit`** clean for touched files.
- **Browser smoke** (signed-in DJ/host): open the AI Show Builder → Generate → real segments with
  scripts render → Save → confirm a row in `tradio_radio_shows` (REST check) → reload the Saved tab
  and see it loaded from the DB.

## Decisions / defaults
- Segments stored as `jsonb` on the show row (matches the UI's in-memory `segments` array; flexible).
- AI `script` included for talk segments only.
- Templates are user-shared rows (`is_template = true`), not a separate table.
- Keep the simulation deck until #2.

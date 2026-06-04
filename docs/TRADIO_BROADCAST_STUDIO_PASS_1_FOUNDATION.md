# Tradio Broadcast Studio Pass 1: Foundation

This document details the architectural foundation, schema definitions, Row Level Security (RLS) models, service layers, and route gating implemented for Pass 1 of the **Tradio Broadcast Studio**.

---

## 1. System Overview
The **Tradio Broadcast Studio** is a premium co-pilot control room inside Trey TV / Tradio that allows approved creators (Artists, Producers, DJs/Hosts) and Admins to compile structured radio shows, design AI-guided timeline rundowns, edit scripts, schedule slots, and request broadcast clearances.

This system is fully structured with a real production database model (prefixed with `tradio_`) and is prepared for future AI narration and live mix integrations.

---

## 2. Database Schema (`supabase/migrations/`)

A new migration script was generated at `supabase/migrations/20260601040000_tradio_broadcast_studio.sql` that defines the following 8 database tables, indices, foreign keys, and RLS policies:

### 1. `tradio_shows`
Stores show configurations, styles, and format parameters.
* **Fields**: `id` (uuid), `owner_user_id` (uuid), `profile_id` (text), `public_profile_uid` (text), `trey_tv_uid` (text), `title` (text), `slug` (text), `description` (text), `show_type` (text), `mood_tags` (text[]), `genre_tags` (text[]), `audience_tags` (text[]), `visibility` (text), `status` (text), `cover_art_url` (text), `created_at`, `updated_at`.

### 2. `tradio_show_episodes`
Stores ordered episodes under each show lane.
* **Fields**: `id` (uuid), `show_id` (uuid), `owner_user_id` (uuid), `title` (text), `slug` (text), `description` (text), `episode_type` (text), `duration_target_seconds` (integer), `status` (text), `visibility` (text), `scheduled_at`, `published_at`, `created_at`, `updated_at`, `metadata` (jsonb).

### 3. `tradio_show_blocks`
Defines structured audio/voiceover segments inside an episode rundown.
* **Fields**: `id` (uuid), `episode_id` (uuid), `show_id` (uuid), `owner_user_id` (uuid), `block_type` (text), `title` (text), `description` (text), `script_text` (text), `media_url` (text), `asset_id` (text), `start_time_seconds` (int), `duration_seconds` (int), `sort_order` (int), `volume_level` (numeric), `fade_in_seconds` (numeric), `fade_out_seconds` (numeric), `approval_status` (text), `rights_status` (text), `metadata` (jsonb), `created_at`, `updated_at`.

### 4. `tradio_show_scripts`
Stores generated drafts and manual text inputs.
* **Fields**: `id` (uuid), `episode_id` (uuid), `block_id` (uuid), `owner_user_id` (uuid), `script_type` (text), `prompt_input` (text), `script_text` (text), `revision_number` (int), `status` (text), `metadata` (jsonb), `created_at`, `updated_at`.

### 5. `tradio_broadcast_slots`
Manages continuous program timing, timezone recurrences, and live room bookings.
* **Fields**: `id` (uuid), `show_id` (uuid), `episode_id` (uuid), `owner_user_id` (uuid), `start_time` (timestamptz), `end_time` (timestamptz), `timezone` (text), `recurrence_rule` (text), `status` (text), `visibility` (text), `created_at`, `updated_at`.

### 6. `tradio_station_drops`
Houses reusable creator voice over drops, identifiers, and SFX.
* **Fields**: `id` (uuid), `owner_user_id` (uuid), `show_id` (uuid), `title` (text), `script_text` (text), `audio_url` (text), `voice_provider` (text), `status` (text), `metadata` (jsonb), `created_at`, `updated_at`.

### 7. `tradio_ad_slots`
Injects commercial placements and sponsor scripts.
* **Fields**: `id` (uuid), `show_id` (uuid), `episode_id` (uuid), `owner_user_id` (uuid), `title` (text), `sponsor_name` (text), `script_text` (text), `media_url` (text), `slot_position` (text), `duration_seconds` (int), `status` (text), `metadata` (jsonb), `created_at`, `updated_at`.

### 8. `tradio_show_analytics`
Prepared fields for tracking future show listens, unique engagement, retention metrics, and skips.
* **Fields**: `id` (uuid), `show_id` (uuid), `episode_id` (uuid), `listens` (int), `unique_listeners` (int), `saves` (int), `likes` (int), `comments` (int), `replays` (int), `skips` (int), `completion_rate` (numeric), `avg_listen_seconds` (numeric), `segment_retention` (jsonb), `created_at`, `updated_at`.

---

## 3. Row Level Security (RLS) Strategy
To enforce creator privacy, copyrights, and secure admin control, strict RLS was enabled on all 8 tables:
1. **Public Read**: Anyone can query public, published shows and public, published episodes. Blocks, segments, and slots are readable by the public only if their parent items are published.
2. **Owner Access**: The authenticated creator owns their records (`auth.uid() = owner_user_id`). They can select, insert, update, or delete entries.
3. **Draft Privacy**: Unfinished drafts, scripts, drops, and analytics remain strictly invisible to other creators and public listeners.
4. **Moderator Access**: Admins and system owners check and clear content using `public.is_tradio_admin_or_owner()`.

---

## 4. Gated Role Access Model
Access validation checks the user's role parameters:
* **Fan / Listener**: Locked out from building shows. Can consume public broadcasts and replays. Shown a lock-state screen with a link to apply for broadcaster status.
* **Artist**: Can create and manage their own show lanes and track premiere drops once approved.
* **Producer**: Approved producers can curate beat showcases, instrumental reels, and vocal pitches.
* **DJ / Host**: Can schedule and host long-form mixed broadcasts.
* **Admin / Owner**: Absolute creation, editing, scheduling, and moderation privileges.

---

## 5. Service Layer Operations

The service layer at `src/tradio/components/tradio/services/broadcastService.ts` integrates direct Supabase calls with offline mock fallback handling:

* `listMyShows()`: Queries user's active broadcast lanes.
* `getShowById()`: Selects a single show lane.
* `createShow()` / `updateShow()`: Mutates shows.
* `listEpisodesForShow()` / `createEpisode()` / `updateEpisode()`: Fetches and updates episodes.
* `listBlocksForEpisode()` / `createBlock()` / `updateBlock()`: Resolves structured rundown blocks.
* `reorderEpisodeBlocks()`: Bulk upserts timeline orders.
* `deleteBlock()`: Removes segment.
* `validateEpisodeDraft()`: Performs a targeted readiness checklist check (verifies title, show-ownership, block-count, clearance clearances).
* `listBroadcastSlots()` / `createBroadcastSlot()`: timing configurations.

---

## 6. Future Co-Pilot Roadmap

The Broadcast Studio Pass 1 foundation is designed for seamless extension:
1. **AI Rundown Integration**: Generative engines read parent show metadata (mood tags, audience, preferences) and write directly into `tradio_show_blocks`.
2. **Script Generation**: Triggers block script generation matching the host mode (cinematic, cozy, hype) into `tradio_show_scripts`.
3. **AI Voice Rendering**: Plugs OpenAI/ElevenLabs adapters directly into `renderVoiceWithProvider`, writing binary audio streams to `tradio_voice_renders`.
4. **Audio Mixing**: A serverless orchestrator joins voice scripts, station drops, and music files using audio segment crossfading parameters.

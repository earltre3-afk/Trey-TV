# Tradio Broadcast Studio — Architectural Design

This document details the database schema, security model, and service abstractions for the premium **Tradio Broadcast Studio / AI Radio Show Builder** built inside the Trey TV / Tradio codebase.

---

## 1. Database Schema Overview

We have introduced ten new tables, fully prefixed with `tradio_`, designed to capture the structural layers of radio episodes, timeline blocks, AI scripts, voice rendering resources, sponsorships, clearances, and analytics.

The schema is created in migration file `supabase/migrations/20260603000000_tradio_broadcast_studio_tables.sql`.

```
                  +---------------------+
                  |    tradio_shows     |
                  +---------------------+
                             | (1:M)
                             v
                  +---------------------+
                  | tradio_show_episodes| <------+
                  +---------------------+        |
                             | (1:M)             |
                             v                   | (1:M)
                  +---------------------+        |
                  |  tradio_show_blocks | -------+
                  +---------------------+        |
                   /         |         \         |
                  /          |          \        |
                 v           v           v       |
        +------------+ +-----------+ +---------+ |
        |   scripts  | |  renders  | | ad_slots| |
        +------------+ +-----------+ +---------+ |
                                                 |
                                 +---------------+
                                 |
                                 v
                     +-----------------------+
                     | tradio_broadcast_slots|
                     +-----------------------+
```

### Table Definitions
1. **`tradio_shows`**: Exposes the high-level show lanes. Owned by a creator (`user_id`). Holds parameters like title, type, audience, host tone, and aesthetic mood.
2. **`tradio_show_episodes`**: Represents scheduled or published episode media objects under a show.
3. **`tradio_show_blocks`**: Granular segment records comprising the ordered timeline for an episode. Supports block types: `intro`, `station_drop`, `voiceover`, `song`, `ad`, `interview`, `producer_spotlight`, `artist_spotlight`, `submission_block`, `silence`, `transition`, `outro`.
4. **`tradio_show_scripts`**: Holds textual speech or descriptions for specific host blocks, with boolean flags tracking whether they were compiled by generative AI.
5. **`tradio_voice_renders`**: Links rendered audio recordings to a voice provider (e.g. ElevenLabs, OpenAI) to prevent re-generating static text.
6. **`tradio_station_drops`**: Stores premium audio station drops or sound effects (SFX) that hosts can trigger during transitions.
7. **`tradio_broadcast_slots`**: Tracks booked schedule slots, linking a show/episode to a specific live timezone, start time, end time, and recurrence state.
8. **`tradio_ad_slots`**: Tracks filled or empty mid-roll ad slots to coordinate commercial spacing.
9. **`tradio_music_submissions`**: Contains listener or artist tracks submitted for specific block spots, complete with verification of clearance status.
10. **`tradio_show_analytics`**: Prepares performance tracking, storing metrics such as completion rate, list clicks, skips, saves, comments, and segment retention.

---

## 2. Row Level Security (RLS) & Access Management

All tables utilize conservative PostgreSQL RLS policies to enforce privacy and honor our creator-privilege hierarchy:

* **Listener Access**: Listeners/Fans are granted read-only access (`SELECT`) *only* when the parent episode has a status of `'published'`. All drafts remain hidden from listeners.
* **Creator Security**: Creators (`user_id = auth.uid()`) can execute full CRUD operations on their own shows, episodes, blocks, scripts, and voice renders. They cannot modify shows owned by other creators.
* **Admin/Owner Escalation**: Moderation, publishing approvals, and network ad fill rights are granted to admins and system owners. This is checked securely using `public.is_admin(auth.uid())`.
* **Standard Verification Check**: To gain broadcast rights in the first place, users are gated by existing roles (`artist`, `producer`, `dj`, `admin`, `owner`) via our `AccessGate` component.

---

## 3. Front-End Interface Design

The control center is housed within `src/tradio/components/tradio/screens/BroadcastStudioGateway.tsx`. It features a dark, cinematic UI matching the Trey TV aesthetic with neon/purple accents and neon glows.

### Views
1. **Dashboard**: Shows existing broadcast lanes, programming options, and drafts.
2. **Create Show**: Custom parameters input form (Format, Host tone, Mood, Strategy) guiding the rundown generation.
3. **Show Detail**: Episode historical logs and button to launch a new episode flow.
4. **Create Episode**: Prompts for title and description; upon creation, it auto-initializes the timeline rundown.
5. **Episode Timeline Editor**: Interactive timeline drag-drop interface allowing creators to:
   - Reorder blocks (index-swapping with persistent DB updates).
   - Delete/edit individual blocks.
   - Refine host script and trigger generative AI script drafts.
   - Audition station drops and preview ad readings.
   - Perform a **Readiness Checklist check** to verify clearance, intro/outro blocks, and scripts before unlocking the Publish buttons.

---

## 4. AI & Voice Service Abstraction Layer

Services reside under `src/tradio/components/tradio/services/broadcastService.ts` to ensure provider neutrality:

### AI Core Functions
* **`generateShowRundown(input)`**: Builds a realistic, ordered segment timeline based on show format, mood, and parameters.
* **`generateHostScripts(input)`**: Crafts high-fidelity speech texts according to tone (cinematic, cozy, hype) and block notes.
* **`generateStationDrop(input)`**: Generates short station drop cues.
* **`generateAdRead(input)`**: Compiles short 30-second sponsor readings.
* **`suggestMusicBlocks(input)`**: Returns songs from the Tradio database matching the mood.
* **`validateShowReadiness(episodeId, blocks)`**: Synthesizes a readiness audit verifying intro/outro blocks, clearances, and missing transcripts.

### Voice Adapter Interface
```typescript
export interface VoiceProviderAdapter {
  id: string;
  name: string;
  renderVoice(text: string, voiceId: string): Promise<{
    audioUrl: string;
    durationSeconds: number;
    provider: string;
    metadata: Record<string, any>;
  }>;
}
```
We provide concrete mock-capable implementations for **OpenAI Voice TTS** and **ElevenLabs Premium**, allowing developers to drop in real API requests seamlessly as secret keys are made available.

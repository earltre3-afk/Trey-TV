# Tradio Broadcast Studio Pass 5: Broadcast Playout & Scheduling

This document details the production-grade design, architecture, and deployment strategy for **Tradio Broadcast Playout & Live Scheduling (Pass 5)** integrated into the Trey TV / Tradio ecosystem.

---

## 1. Executive Summary

Tradio Broadcast Playout introduces the production playout layer, closing the loop from an assembled episode timeline preview (compiled in Pass 4) to public schedule curation, admin-gated quality review, and global fan playback.

Approved creators can create customized broadcast channels (stations) and schedule their final-candidate assemblies into slot queues. Listeners can tune in to these channels to experience radio-style continuous file playout, perfectly synchronized with server-side broadcast slots, using the existing highly persistent, context-aware global audio player.

---

## 2. Broadcast Channel & Playout Architecture

Playout operates via a decoupled provider-agnostic adapter design. The architecture is split into three distinct layers:

1. **The Database (Supabase Schema & RLS)**: Governs state persistence, channels, slots, and review requests.
2. **Playout Resolution Engine (Server-Side)**: Resolves what track should be playing right now on any channel, signs the private audio URLs on the fly, and registers playout metric events.
3. **Playout Service (Client-Side)**: Interacts with the server, schedules times, updates statuses, and handles reordering.

---

## 3. Row Level Security (RLS) & Table Strategy

Every new database table is fully hardened with RLS. Public listeners can only see active public channels and completed scheduled playout queue rows:

### `tradio_broadcast_channels`

Stores metadata about the broadcast frequencies/slugs.

- **RLS**:
  - `Public Select`: Restricted to `status = 'active' AND visibility = 'public'`.
  - `Creator Access`: Can `SELECT`, `INSERT`, `UPDATE`, `DELETE` rows where `auth.uid() = owner_user_id`.
  - `Admin Access`: Full management capability via `public.is_admin(auth.uid())`.

### `tradio_broadcast_queue`

Stores the sequence of scheduled episodes for each channel.

- **RLS**:
  - `Public Select`: Allowed only for `scheduled`, `playing`, or `completed` slots on active public channels.
  - `Creator & Admin Access`: Full management for the respective owner/admin.

### `tradio_playout_events`

Audit logs of all listener joins, stream connections, skips, and play starts.

- **RLS**:
  - `Public Select`: View events on public active channels.
  - `Creator & Admin Access`: Insert and manage events.

### `tradio_broadcast_reviews`

Maintains records of administrative approvals, change requests, and rights compliance decisions.

- **RLS**:
  - `Select`: Restrict to requester or platform admins.
  - `Insert`: Restricted to requester.
  - `Update/Delete`: Gated exclusively to platform admins (`public.is_admin(auth.uid())`).

---

## 4. Review & Gated Scheduling Flow

To maintain high content quality and strict copyright/licensing protection, a multi-step review workflow is enforced:

1. **Candidate Compilation**: The creator assembles a `final_candidate` episode in Pass 4.
2. **Review Submission**: The creator submits the candidate for review, creating a row in `tradio_broadcast_reviews` with status `pending`.
3. **Compliance Audit**: Platform admins inspect:
   - Rights snapshot (verifying all songs are licensed, creator-owned, or tradio-native).
   - Readiness snapshot (ensuring assembly completed with zero rendering errors).
4. **Approval**: Once approved, the episode status updates to `scheduled` or `published`, making it eligible to be programmed on a channel's broadcast queue.

---

## 5. Queue & Scheduling Model

The queue supports:

- **Timezone Support**: Defaults to `America/Chicago` for standard clock coordination.
- **Playout Ordering**: Sorting via simple `sort_order` indexes.
- **Overlapping Protection**: Handled on the client/server-side to prevent scheduling conflicts.
- **Replay Eligibility Toggle**: Determines if an episode is archived as replayable or hidden after completion.

---

## 6. Global Player & MiniPlayer Integration

Rather than building a separate audio player (which would disrupt playback when navigating the app), Pass 5 integrates directly with the existing global `usePlayer()` context:

1. When a listener plays a channel, the playout service fetches the current now-playing item from `resolveNowPlayingServer()`.
2. It resolves the private signed assembly URL securely and feeds a generic `PlaybackItem` with `isLive: true` and `sourceType: "station"` to the player.
3. The persistent player continues playing the stream in the background while navigating other pages.
4. The global player's commercial-mastering EQ and tape saturation filters are fully applicable to the playout, matching premium radio delivery.

---

## 7. Stream Provider Strategy (Adapters)

Continuous stream playout supports a pluggable provider adapter layer. Six primary providers are defined:

1. `file_based_scheduled_playback`: Production-safe serverless path.
2. `hls`: HTTP Live Streaming playlists.
3. `icecast`: Classic mountpoints.
4. `liquidsoap`: Server-side scheduling and crossfades.
5. `external_stream_service`: Commercial relays.
6. `future_internal_stream`: Planned custom playout daemon.

### Serverless Playout Advisory

**CRITICAL**: Running an infinite, long-lived stream process (e.g. Icecast streaming, liquidsoap daemon) inside serverless runtimes (like Netlify or Vercel edge functions) is highly discouraged. They are subject to memory leaks, connection timeouts, and severe scaling costs.

- **The Recommended Path**: Use `file_based_scheduled_playback` (the default) as it scales infinitely at zero cost. For professional 24/7 continuous radio, host a lightweight Liquidsoap + Icecast container on a persistent VM (e.g., AWS EC2, fly.io) and direct the `stream_url` metadata in `tradio_broadcast_channels` to that stream endpoint!

---

## 8. Files Created & Modified

### Database Schema

- `supabase/migrations/20260606000000_tradio_broadcast_studio_playout.sql` (Creates channels, queue, review, event logging tables with RLS and updated_at triggers).

### Types & Services

- `src/tradio/components/tradio/types/broadcastPlayoutTypes.ts` (Core TypeScript types and enums).
- `src/tradio/components/tradio/services/broadcastPlayoutService.ts` (Client playout service with robust local mock fallbacks).
- `src/tradio/components/tradio/services/broadcastStreamProvider.ts` (pluggable stream adapters configuration).
- `src/tradio/components/tradio/services/broadcastStreamManifest.ts` (Playout metadata manifest mapper).

### Server Functions

- `src/lib/trey-i/broadcastPlayout.server.ts` (TanStack Server post functions using supabaseAdmin for secure scheduling, approvals, events logging, and private storage URL resolution).

### UI Screens

- `src/tradio/components/tradio/screens/BroadcastStudioGateway.tsx` (Complete integration of Channel Lists, Create Channel Flows, Channel detail dashboards, Admin review queues, Scheduling Modals, and live Playback triggers).

---

## 9. Recommended Next Pass

- **Pass 6: Live Audio Multiplexing & Co-Host Call-Ins**: Expand the playout system to support live mic interruptions and LiveKit-based concurrent co-host call-ins directly over scheduled background playlists.

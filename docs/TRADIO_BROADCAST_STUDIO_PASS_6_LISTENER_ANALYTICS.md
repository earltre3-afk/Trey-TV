# Tradio Broadcast Studio Pass 6: Listener Pulse & Analytics

This document details the production-grade design, tracking mechanics, and creator analytics dashboard implemented in **Tradio Listener Pulse & Analytics (Pass 6)** inside the Trey TV / Tradio ecosystem.

---

## 1. Executive Summary

Tradio Listener Pulse bridges public listener engagement with rich, privacy-safe creator insights. Fans can discover public channels, tune in, react in real time, follow stations, and listen to archived replays.

Under the hood, every playback event automatically provisions a secured `listening_session` that logs heartbeats every 30 seconds to feed the `retention_event` database checkpoints. Creators can access aggregate daily trend rollups with peak concurrent user metrics and actionable program optimization advice, ensuring professional broadcast analytics at zero scaling cost.

---

## 2. Public Listener Experience & Discovery

The station's details page is loaded with:

- **Tuning and Live State Counters**: Displaying live listening counts and total follower totals.
- **Save/Follow Toggle**: A Lucide-based `Heart` toggle button allowing users to bookmark stations.
- **Now Playing Hero Card**: Incorporating a live waveform representation of track performance.
- **Fast Reaction Bar**: Tap buttons for `fire`, `love`, `laugh`, `rewind`, `hard`, `smooth`, and `salute` to let listeners communicate vibes instantly.
- **Archived Replay Backlogs**: Mapped only to completed queue slots marked `is_replay_eligible = true`, allowing playback of historical recordings on demand.

---

## 3. Playback Tracking & Heartbeat Lifecycles

To prevent redundant, heavy write operations, a lightweight heartbeat model is enforced:

1. **Session Provisioning**: When tuning into a live channel or historical replay, `startChannelTracking()` is triggered. It generates an active `listening_session` row.
2. **Anonymous Fallbacks**: If the listener is not signed in, a secure, local client-side anonymous ID is generated (`localStorage`-cached) to preserve distinct unique visitor metrics without exposing raw profiles.
3. **Heartbeat Checkpoints**: During active streaming, a 30-second interval pushes a `heartbeat` retention event containing current playback offsets and completion percentages.
4. **Exiting and Completion**: Pausing, switching channels, or completing the broadcast finishes the session, setting `ended_at = now()` and recording the exit checkpoint.

---

## 4. Row Level Security (RLS) & Privacy Principles

Every new tracking and engagement table is securely locked down:

### `tradio_channel_follows`

- **RLS**: Select is restricted to the follower or the channel creator; insert/update/delete restricted to `auth.uid() = user_id`.

### `tradio_broadcast_reactions`

- **RLS**: Insert allowed for authenticated clients; select allowed for anyone to read aggregated recent pulses.

### `tradio_broadcast_listening_sessions` & `tradio_broadcast_retention_events`

- **RLS**: Strictly hidden from public select. Only the active listener can read/write their own session checkpoints, and platform admins have global diagnostic select. Raw visitor identity is never exposed to creators.

### `tradio_channel_analytics_daily`

- **RLS**: Shared publicly only for active public channels; full detail is restricted to channel owner (`auth.uid() = owner_user_id`) or platform admins.

---

## 5. Creator Analytics & Daily Rollups

### Daily Aggregation Rollup System

To maintain instant queries on dashboards without querying millions of raw retention heartbeats, a daily rollup service aggregates metrics into `tradio_channel_analytics_daily`:

- **Total Listens & Unique Listeners** (Distinct users or anonymous visitors)
- **Peak Concurrent Listeners** (Extracted from peak playout metrics)
- **Average Listening Times & Completion Rates**
- **Reactions, Saves, and Follow Totals**

Platform crons or manual click CTAs trigger the aggregation by executing `rollupChannelAnalyticsServer()`.

### Program Director Optimization CTAs

Dashboard analytics automatically assess the station's health:

- If the average completion rate is low (e.g., under 80%), the system raises a clear advisory message prompting the creator to adjust ad break counts, optimize script tone settings, or review locked segment sequences.

---

## 6. Files Created & Modified

### Database Migration

- `supabase/migrations/20260607000000_tradio_listener_analytics.sql`

### Types & Services

- `src/tradio/components/tradio/types/broadcastListenerTypes.ts` (TypeScript types and enums).
- `src/tradio/components/tradio/services/broadcastListenerService.ts` (Public discovery and follower pulse).
- `src/tradio/components/tradio/services/broadcastAnalyticsService.ts` (Creator analytics queries).
- `src/tradio/components/tradio/services/broadcastRealtimeService.ts` (Real-time changes sync).
- `src/tradio/components/tradio/services/broadcastPublicChannelService.ts` (Playout session tracking coordinator).

### Server Functions

- `src/lib/trey-i/broadcastAnalytics.server.ts` (TanStack server functions for secure tracking, reactions insertion, and aggregation rollups).

### UI Screens

- `src/tradio/components/tradio/screens/BroadcastStudioGateway.tsx` (Completed Follow Toggles, rate-limited Reaction bars, Replays playout, Peak concurrent displays, Daily rollups tables, and AI PD recommendations).

---

## 7. Recommended Next Pass

- **Pass 7: Interactive Chat & Live Polls**: Connect real-time chat overlays and interactive host polls directly onto scheduled stream timelines to complete the live participatory radio experience.

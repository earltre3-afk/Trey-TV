# Tradio Broadcast Studio Pass 8: Live Host Mic + Co-Host Call-Ins

This document provides a comprehensive technical overview and layout specifications of the newly implemented live microphone, co-host streaming seats, sound drops SFX board, and background audio ducking engine.

---

## 1. What Was Built
Tradio Broadcast Studio Pass 8 introduces production-ready, real-time live audio integration directly into the Tradio ecosystem. Broadcasters can speak live over or between scheduled lofi audio blocks, bring authorized co-hosts into virtual speaker seats, manage a queued caller list of listeners, trigger high-fidelity synthesized or media-backed sound effects, and log detailed interaction events without interrupting continuous background playout schedules.

---

## 2. Live Mic Architecture
The system employs a client-server-adapter topology designed for minimal streaming delay, resilience to disconnections, and strict security controls:

```text
+-----------------------+      RPC Commands       +------------------------+
|      Broadcaster      | ----------------------> |  TanStack Start Server  |
| (Host / Guest Stream) | <---------------------- |     (Supabase Admin)   |
+-----------------------+                         +------------------------+
            |                                                 |
            | WebRTC Audio Channels                           | Secures Tokens /
            v                                                 | Validates Seats
+-----------------------+                                     v
|  LiveKit SFX Server   | <===================================+
+-----------------------+
```

1. **Client Control Layer**: Connects microphone devices, processes local Web Audio synthesizer fallbacks, and listens to table updates.
2. **Serverless Orchestrator**: TanStack Start Server Functions act as security gatekeepers, validating database relationships, managing session status fields, and minting WebRTC room authorization keys.
3. **WebRTC Media Server**: Standardizes peer-to-peer live communication using the LiveKit network.

---

## 3. Provider Adapter Strategy
To prevent tight-coupling of UI components to specific vendors, all audio streams go through the `LiveAudioProvider` adapter interface. This enables seamless hot-swapping or custom provider configurations:

- **Supported Providers**: `livekit`, `daily`, `agora`, `external_webrtc`, and `local_dev_stub`.
- **Local Dev Stub Fallback**: Actively detects when environment configurations or hardware resources are missing. It spins up an automated virtual loop simulating participant connects, leaves, speaking states, and volume sweeps so developers can safely test the full interaction flow without external network dependencies.

---

## 4. LiveKit Environment Variables
To connect the live audio system to your active production LiveKit cloud or self-hosted server, supply the following credentials in your system configuration files:

```bash
LIVEKIT_URL="wss://your-livekit-server-domain.livekit.cloud"
LIVEKIT_API_KEY="APIxxxxxxxxxxxxx"
LIVEKIT_API_SECRET="SECxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

If these are not supplied, the interface automatically runs the `local_dev_stub` simulation mode and provides helpful system indicators.

---

## 5. Server-Side Token Security
All WebRTC participation keys are calculated server-side inside secure environment blocks. No private LiveKit secrets are ever sent to client browsers:
- **Host Tokens**: Minted only after checking that the user is the authenticated owner of the destination channel or has administrator roles. Includes room administration grants.
- **Participant / Caller Tokens**: Restricts grants to only publish/subscribe. Requires that a corresponding approved row exists in the `tradio_live_mic_participants` table. Non-approved listeners can never steal microphone streams or forge tokens.

---

## 6. Session, Participant, and Call Request Database Model
Six Postgres tables were created to model the state:

1. **`tradio_live_mic_sessions`**: Tracks active or archived host sessions, provider room IDs, mic configurations, and background audio ducking modes.
2. **`tradio_live_mic_participants`**: Tracks active or historical speaker rosters, volume levels, mute states, and connection roles.
3. **`tradio_live_call_requests`**: Holds listener request nodes, request logs, and host decisions.
4. **`tradio_live_sfx_drops`**: Stores reusable sound effects (e.g., airhorns, applause) for creators.
5. **`tradio_live_sfx_events`**: Logs when and where a drop was triggered on the broadcast timeline.
6. **`tradio_live_mic_events`**: Logs life-cycle triggers (join, leave, mute, unconfigured fallbacks) for analytics rollups.

---

## 7. SFX Board Design
Broadcasters have access to a live SFX Board panel. If dedicated cloud audio files are not assigned, the system leverages a custom client-side synthesizer using the browser's native Web Audio API:
- **Airhorn**: Generates three parallel sawtooth oscillators on slightly detuned frequencies for a classic brassy blast.
- **Applause**: Generates random white noise coupled to a sweeping bandpass filter and custom envelope to model clapping crowd acoustics.
- **Tension Riser**: Sweeps a sine wave oscillator exponentially from low to high frequency (150Hz to 1200Hz).
- **Broadcast Bell**: Plays a clean detuned dual-harmonic triangle wave.

---

## 8. Realtime Synchronization
Client components subscribe to changes on the newly added tables using Supabase Postgres streams:
- `tradio_live_mic_sessions` -> Syncs host configurations, mic modes, and background modes.
- `tradio_live_mic_participants` -> Keeps current active speaker listings and mute indicators synchronized for all listeners in real-time.
- `tradio_live_call_requests` -> Instant queues for the host when a listener requests a call-in.
- `tradio_live_sfx_events` -> Notifies listener layers to play back triggers.

---

## 9. Player/MiniPlayer Ducking Behavior
The Live Mic layer hooks directly into the persistent `PlayerContext` to control background broadcast audio:
- **`duck_on_host`**: When a host, co-host, or caller starts speaking, the player background volume dynamically transitions to `15%` of its original setting and restores to full volume once speaking ceases.
- **`pause_on_host`**: Pauses background audio playout entirely during host speech.
- **`keep_full_volume`**: Leaves the player volume unadjusted.

---

## 10. Moderation and Approval Flow
To maintain a safe, high-quality audio experience, no audience listener can speak without explicit approval:
1. Listener requests to call in by filling out a brief note.
2. Host reviews the request in the real-time queue.
3. If approved, the request status is set to `approved` and a speaker participant seat is allocated.
4. The approved listener receives a secure connection invitation and can connect their microphone.
5. The host can mute, unmute, or kick any speaker at any moment.

---

## 11. Analytics Hooks
Pass 8 extends the Listener Pulse analytics rollups with nine (9) new data trackers:
- `live_mic_session_count` — Total live sessions started.
- `call_request_count` — Total audience call-in requests submitted.
- `approved_call_count` — Total call-ins approved by hosts.
- `rejected_call_count` — Total call-ins declined.
- `cohost_count` — Volume of co-hosts participating.
- `average_call_duration` — Duration metrics of listener speech.
- `sfx_trigger_count` — Sound drops utilization.
- `mic_event_count` — Detailed life-cycle logs.
- `live_engagement_rate` — Aggregate listener participation metrics.

---

## 12. Prescribe Me Preparation
All session parameters are fully indexed and structured to pass metadata directly to the Prescribe Me recommendation engine, preserving channel ID, room ID, mood/genre tags, call-in activity metrics, sound drops utilization, and engagement intensity.

---

## 13. Known Local/Provider Limitations
- Real-time WebRTC audio streams require active LiveKit credentials. If not configured, the platform runs under the high-fidelity `local_dev_stub` simulation mode (including Web Audio API synthesizers and mock participant activity).
- Audio ducking is managed client-side in the player context.

---

## 14. Files Changed
- `src/tradio/components/tradio/screens/BroadcastStudioGateway.tsx` — Augmented with Live Mic controller panel, audio subscriptions, co-host seats, caller queues, SFX boards, and ducking event loops.
- `supabase/migrations/20260609000000_tradio_live_mic_call_ins.sql` — Real SQL database schema.
- `src/tradio/components/tradio/types/broadcastLiveMicTypes.ts` — TypeScript models and enumerations.
- `src/lib/trey-i/broadcastLiveMic.server.ts` — TanStack Start server functions.
- `src/tradio/components/tradio/services/broadcastLiveAudioProvider.ts` — Audio adapter and LiveKit backend connections.
- `src/tradio/components/tradio/services/broadcastLiveMicService.ts` — Client-side live mic API.
- `src/tradio/components/tradio/services/broadcastLiveMicRealtime.ts` — Supabase client subscriptions.
- `src/tradio/components/tradio/services/broadcastSfxService.ts` — SFX drops controller.

---

## 15. Validation Results
- **TypeScript Compiler (`pnpm tsc --noEmit`)**: 0 Errors.
- **Production Bundle (`pnpm build`)**: Compiled successfully.
- **Linter (`pnpm lint`)**: All Pass 8 files are clean.

---

## 16. Recommended Next Pass
- **Pass 9**: Implement recorded audio clip backfills and host podcast archiver logs to auto-publish completed live host sessions into public on-demand show backlogs.

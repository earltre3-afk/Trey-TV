# Tradio Unified Builder + Real-Time Live Console — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collapse Tradio's two duplicate broadcast paths into one Suite, and make the rich live console the real, real-time "manage show" panel after Go Live — with a unified host audio mix (mic + SFX + beds + AI), real call-in callers via LiveKit runtime permissions, and an auto-pilot show-clock that keeps the host on programming.

**Architecture:** The Broadcast Suite (`BroadcastStudioGateway`) is the single home for build → go live → manage. The mock `LiveShowDirectorConsole` is extracted to `screens/LiveShowConsole.tsx` and wired to the existing real backends: LiveKit (`useTradioLiveRoom`) for audio/listeners and Supabase realtime (`useTradioLiveInteraction`) for chat/requests/polls. All host audio is mixed in one Web Audio graph (`tradioHostMix.ts`) published as a single LiveKit track. Callers are listeners promoted to publish at runtime via `RoomServiceClient.updateParticipant`, coordinated through a new `tradio_live_call_requests` table. A pure `showRundown.ts` engine + `useShowRundown` hook auto-advances segments and triggers the AI host.

**Tech Stack:** React + TypeScript, TanStack Router, LiveKit (`livekit-client`, `livekit-server-sdk`), Supabase (realtime + Postgres), Web Audio API, `node:test` for unit tests, Tailwind, `lucide-react`, `sonner`.

**Spec:** `docs/superpowers/specs/2026-06-02-tradio-unified-builder-live-console-design.md`

---

## Conventions for this plan

- **Run a single test file:** `node --test <path-to-file>.test.ts`
  Run all new tests: `node --test src/lib/tradio/showRundown.test.ts src/lib/tradio/callerLogic.test.ts src/lib/tradio/liveSessionPolicy.test.ts`
  **IMPORTANT:** new `.test.ts` files MUST import local modules **with the `.ts` extension** (e.g. `from './showRundown.ts'`). Node 25's `node --test` strips types but does not resolve extensionless local imports. (The pre-existing `liveSessionPolicy.test.ts` uses extensionless imports and currently fails to resolve; Task 0 fixes it.)
- **Typecheck/build a change:** `npm run build` (Vite) — used as the integration check for UI tasks that have no unit test.
- **Lint:** `npm run lint`
- **Commit after every task.** Branch is `preview/smooth-nav-and-signal-test` (do NOT touch `main`). Per repo deploy rule: only commit locally; do not push/deploy.
- **Reconciliation note:** the spec named a `useTradioHostMix` hook. To avoid two LiveKit connections, the audio graph is implemented as a framework-free factory `createHostMix()` in `tradioHostMix.ts`, **used inside** `useTradioLiveRoom`; the new audio controls are exposed on the existing `LiveRoomState`. This satisfies the spec's intent (one host mix) without a competing hook.

---

## File map

**Create:**

- `src/lib/tradio/showRundown.ts` — pure rundown/pacing math
- `src/lib/tradio/showRundown.test.ts`
- `src/lib/tradio/callerLogic.ts` — pure caller status transitions + publish resolution
- `src/lib/tradio/callerLogic.test.ts`
- `src/lib/tradio/tradioHostMix.ts` — Web Audio mixing graph factory
- `src/lib/tradio/sfxAssets.ts` — SFX + music-bed asset registry
- `src/lib/tradio/tradioCaller.server.ts` — server handler granting/revoking caller publish
- `src/tradio/components/tradio/tradioCallerService.ts` — client CRUD for call requests
- `src/tradio/components/tradio/useShowRundown.ts` — rundown hook (wraps showRundown.ts)
- `src/tradio/components/tradio/useTradioCallers.ts` — realtime call-request hook
- `src/tradio/components/tradio/screens/LiveShowConsole.tsx` — the one live console (from `LiveShowDirectorConsole`)
- `supabase/migrations/<timestamp>_tradio_live_call_requests.sql`
- `public/tradio-sfx/*` and `public/tradio-beds/*` — bundled audio assets

**Modify:**

- `src/lib/tradio/liveSessionPolicy.test.ts` — fix import extension (Task 0)
- `src/tradio/components/tradio/useTradioLiveRoom.ts` — use `createHostMix`; expose SFX/bed/volume/analyser
- `src/tradio/components/tradio/screens/BroadcastStudioGateway.tsx` — remove mock role switcher; render `LiveShowConsole`; real role; `'golive'` deep-link
- `src/tradio/components/tradio/screens/DJStudio.tsx` — remove parallel go-live; deep-link buttons
- `src/tradio/components/tradio/Shell.tsx` — extend `broadcastStudio` view with `initialTab: 'golive'` plumbing (already passes `initialTab`)
- `src/tradio/components/tradio/LiveRoomModal.tsx` — listener "Call in / raise hand" button
- `src/server.ts` — register `/api/tradio/caller`

**Delete:**

- `src/tradio/components/tradio/screens/LiveShowDashboard.tsx`

---

## Task 0: Fix the existing test import so the test runner is green

**Files:**

- Modify: `src/lib/tradio/liveSessionPolicy.test.ts:3`

- [ ] **Step 1: Run the existing test to confirm it currently fails to resolve**

Run: `node --test src/lib/tradio/liveSessionPolicy.test.ts`
Expected: FAIL — `ERR_MODULE_NOT_FOUND ... liveSessionPolicy`

- [ ] **Step 2: Add the `.ts` extension to the import**

Change line 3 from:

```ts
import { resolveTradioShowPublish, tradioShowRoomName } from "./liveSessionPolicy";
```

to:

```ts
import { resolveTradioShowPublish, tradioShowRoomName } from "./liveSessionPolicy.ts";
```

- [ ] **Step 3: Run the test to verify it passes**

Run: `node --test src/lib/tradio/liveSessionPolicy.test.ts`
Expected: PASS — `tests 5 ... pass 5 ... fail 0`

- [ ] **Step 4: Commit**

```bash
git add src/lib/tradio/liveSessionPolicy.test.ts
git commit -m "test(tradio): fix liveSessionPolicy test import resolution"
```

---

# PHASE 1 — Consolidation + wire console to real backend

## Task 1: Extract the live console into its own file (no behavior change yet)

**Files:**

- Create: `src/tradio/components/tradio/screens/LiveShowConsole.tsx`
- Modify: `src/tradio/components/tradio/screens/BroadcastStudioGateway.tsx`

- [ ] **Step 1: Create `LiveShowConsole.tsx` by moving `LiveShowDirectorConsole`**

Cut the entire `LiveShowDirectorConsole` component (currently `BroadcastStudioGateway.tsx` lines ~166–669, the block starting with the `// ─── LIVE SHOW DIRECTOR CONSOLE ───` comment through its closing `};`) into the new file. Add the imports it uses at the top of the new file:

```tsx
import React, { useState, useEffect } from "react";
import {
  Clock,
  Mic2,
  Music,
  Phone,
  Volume2,
  Activity,
  Sliders,
  Zap,
  Radio,
  Users,
  Flame,
  MessageSquare,
  VolumeX,
} from "lucide-react";
import { GlassCard, Chip, Waveform } from "../ui";
import { IMG, type RadioShow } from "../data";
import { toast } from "sonner";

export const LiveShowConsole: React.FC<{
  show: RadioShow;
  onEndLive: () => void;
}> = ({ show, onEndLive }) => {
  // ...moved body unchanged...
};

export default LiveShowConsole;
```

Rename the component `LiveShowConsole` (was `LiveShowDirectorConsole`). Keep the body identical for now (still mock).

- [ ] **Step 2: Update `BroadcastStudioGateway.tsx` to import and use it**

Remove the now-moved component definition. Add at top with the other screen imports:

```tsx
import { LiveShowConsole } from "./LiveShowConsole";
```

Replace the JSX usage `<LiveShowDirectorConsole show={activeLiveShow} onEndLive={...} />` (around line 879) with:

```tsx
<LiveShowConsole
  show={activeLiveShow}
  onEndLive={() => {
    setActiveLiveShow(null);
    setIsBuildingShow(false);
  }}
/>
```

Remove now-unused imports from `BroadcastStudioGateway.tsx` that only the console used (e.g. `Phone`, `Activity`, `Sliders`, `VolumeX`, `MessageSquare` if not used elsewhere — let the lint step catch leftovers).

- [ ] **Step 3: Verify build + lint**

Run: `npm run build`
Expected: build succeeds (no missing-symbol errors).
Run: `npm run lint`
Expected: no new errors (fix any "unused import" in `BroadcastStudioGateway.tsx`).

- [ ] **Step 4: Commit**

```bash
git add src/tradio/components/tradio/screens/LiveShowConsole.tsx src/tradio/components/tradio/screens/BroadcastStudioGateway.tsx
git commit -m "refactor(tradio): extract LiveShowConsole from BroadcastStudioGateway"
```

---

## Task 2: Wire the console to the real backend (listeners, chat, requests, polls, AI host)

**Files:**

- Modify: `src/tradio/components/tradio/screens/LiveShowConsole.tsx`
- Modify: `src/tradio/components/tradio/screens/BroadcastStudioGateway.tsx`

The console must receive a live session and real data. We hoist the live hooks into `BroadcastStudioGateway` and pass them down (the gateway already owns `activeLiveShow`).

- [ ] **Step 1: In `BroadcastStudioGateway.tsx`, create a real session on Go Live**

Add imports:

```tsx
import { goLive, endLive } from "../tradioLiveService";
import { useTradioLiveRoom } from "../useTradioLiveRoom";
import { useTradioLiveInteraction } from "../useTradioLiveInteraction";
```

Add state + hooks near the other `useState`s in `BroadcastStudioGateway`:

```tsx
const [liveSessionId, setLiveSessionId] = useState<string | null>(null);
const live = useTradioLiveRoom({
  active: Boolean(liveSessionId),
  role: "host",
  sessionId: liveSessionId,
});
const interaction = useTradioLiveInteraction({ sessionId: liveSessionId });
```

Change the `ShowBuilder` `onGoLive` handler (around line 887) to actually start a session:

```tsx
<ShowBuilder
  onGoLive={async (show) => {
    const { session, error } = await goLive({
      showId: show.id ?? null,
      title: show.title,
      hostName: show.djName ?? "Host",
    });
    if (error || !session) {
      toast.error(error ?? "Could not go live.");
      return;
    }
    setLiveSessionId(session.id);
    setActiveLiveShow(show);
    toast.success(`Broadcasting LIVE with "${show.title}"!`);
  }}
  onBack={() => setIsBuildingShow(false)}
/>
```

Update the `Manage` button on scheduled shows (around line 1123) the same way — wrap its `setActiveLiveShow(...)` body to also `goLive(...)` and `setLiveSessionId`.

- [ ] **Step 2: Pass live data + a real end handler into the console**

Replace the `<LiveShowConsole ... />` usage with:

```tsx
<LiveShowConsole
  show={activeLiveShow}
  live={live}
  interaction={interaction}
  onEndLive={async () => {
    if (liveSessionId)
      await endLive({
        sessionId: liveSessionId,
        showId: activeLiveShow.id ?? null,
        peakListeners: live.listenerCount,
      });
    live.leave();
    setLiveSessionId(null);
    setActiveLiveShow(null);
    setIsBuildingShow(false);
  }}
/>
```

- [ ] **Step 3: In `LiveShowConsole.tsx`, accept the live props and replace mock data**

Update the props and imports:

```tsx
import type { LiveRoomState } from '../useTradioLiveRoom';
import type { LiveInteraction } from '../useTradioLiveInteraction';

export const LiveShowConsole: React.FC<{
  show: RadioShow;
  live: LiveRoomState;
  interaction: LiveInteraction;
  onEndLive: () => void;
}> = ({ show, live, interaction, onEndLive }) => {
```

Make these replacements in the body:

- **Chat:** delete the `chats` `useState` and the chat-simulator `useEffect`. Render from `interaction.chat` instead (`c.authorName || 'Listener'`, `c.body`). For the "FX FEED"/"SYSTEM" local notices, keep a small local `notices` state array appended on SFX/caller actions and render it merged above `interaction.chat`.
- **Listeners/peak:** in the top banner and any stat, use `live.listenerCount` (and a local `peakListeners` tracked with a `useEffect` raising on `live.listenerCount`, same as the old `LiveShowDashboard` did).
- **Mic mute:** wire the master-deck "Host Mic LIVE/MUTED" button to `live.micOn` / `live.toggleMic()` (was local `micMuted`).
- **AI host:** the segment teleprompter panel gets a "▶ AI read" button calling `live.aiSpeak(currentSegment.script ?? currentSegment.hostNotes ?? '', currentSegment.title)`, disabled when `live.aiSpeaking`.

Keep VU meters as-is for now (real levels come in Phase 2). Keep callers/auto-pitch panels as-is for now (real callers come in Phase 3; the auto-pitch panel is removed in Task 3).

- [ ] **Step 4: Verify build + manual smoke**

Run: `npm run build`
Expected: succeeds.
Manual: `npm run dev`, open Broadcast Suite → Build a show → Go Live. Confirm the console renders, the LIVE badge + listener count come from `live`, and the chat panel shows real chat (empty if no messages) rather than the fake simulated stream.

- [ ] **Step 5: Commit**

```bash
git add src/tradio/components/tradio/screens/LiveShowConsole.tsx src/tradio/components/tradio/screens/BroadcastStudioGateway.tsx
git commit -m "feat(tradio): wire live console to real LiveKit + Supabase backends"
```

---

## Task 3: Remove the "keep on key" auto-pitch panel (it was a misread; pacing handled in Phase 4)

**Files:**

- Modify: `src/tradio/components/tradio/screens/LiveShowConsole.tsx`

- [ ] **Step 1: Delete the Auto-Pitch Correction card and its state**

Remove the `autoPitch`, `vocalKey`, `vocalStrength` `useState`s and the entire "AUTO-PITCH CORRECTION & KEY ASSISTANT" `GlassCard` block in the right column. Also remove the per-caller "Voice Filter" autotune selector (`callerFilter` state + the filter `<button>` group) — callers keep only Take/Disconnect. (Real-time pitch correction is explicitly out of scope.)

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: succeeds, no unused-symbol errors.

- [ ] **Step 3: Commit**

```bash
git add src/tradio/components/tradio/screens/LiveShowConsole.tsx
git commit -m "refactor(tradio): drop auto-pitch panel from live console (out of scope)"
```

---

## Task 4: Make the Broadcast Suite the one home — remove the mock role switcher

**Files:**

- Modify: `src/tradio/components/tradio/screens/BroadcastStudioGateway.tsx`

The `AccessGate` (capability `create-broadcast`) already gates real access. The "Mock Gateway Portal Switcher" + `role` state are QA scaffolding driving lock states; replace with a fixed cleared role for the gated user.

- [ ] **Step 1: Remove the switcher UI and derive role from access**

Delete the entire "Dynamic role switch for QA preview" `<div>` block (the "Mock Gateway Portal Switcher", around lines 838–867). Replace the `role`/`accessStatus` mock state with a fixed cleared default:

```tsx
// Inside the gate the user is cleared; default to artist tooling.
const role: BroadcastRole = "artist";
const accessStatus: BroadcastAccessStatus = "Cleared";
```

Remove the `setRole`/`setAccessStatus` setters and the `useEffect` branch that set `accessStatus` from `role` (keep the `initialTab === 'builder'` branch). Remove the now-dead `role === 'fan'` "Apply For Access" form block (the gate handles unauthorized users).

- [ ] **Step 2: Verify build + lint**

Run: `npm run build` then `npm run lint`
Expected: succeed; remove any unused imports the lint flags (e.g. `Shield`, `CheckCircle` if now unused).

- [ ] **Step 3: Commit**

```bash
git add src/tradio/components/tradio/screens/BroadcastStudioGateway.tsx
git commit -m "refactor(tradio): remove mock role switcher; Suite is the one home"
```

---

## Task 5: Remove DJ Studio's parallel go-live and delete the basic dashboard

**Files:**

- Modify: `src/tradio/components/tradio/screens/DJStudio.tsx`
- Delete: `src/tradio/components/tradio/screens/LiveShowDashboard.tsx`

- [ ] **Step 1: Strip the parallel live machinery from `DJStudio.tsx`**

Remove these from `DJStudio.tsx`: the `goLive`/`endLive` import, `useTradioLiveRoom`/`useTradioLiveInteraction` imports + `live`/`interaction`/`liveSessionId`/`onAirShowId`/`pollQuestion`/`pollOptions` state, the `LiveShowDashboard` import, the `handleGoLive` function, and the entire `tab === 'broadcast'` live blocks that depend on `liveSessionId` (the `LiveShowDashboard` render, the AI Voice Host card, the `CoPilotPanel`, and the inline Live Room chat/requests/poll card).

- [ ] **Step 2: Repoint the buttons to the Suite**

Change the hero "Go Live" `PrimaryButton` to deep-link into the Suite live flow:

```tsx
<PrimaryButton onClick={() => onOpenBroadcastStudio?.("golive")}>
  <Radio className="h-4 w-4" /> Go Live
</PrimaryButton>
```

Keep "Open Broadcast Studio" and "Build Show With AI" as they are (`onOpenBroadcastStudio?.('builder')`). The `broadcast` tab now shows only the static "Active Broadcast Desk" + "Broadcast Blocks" preview cards (the non-live JSX that doesn't depend on `liveSessionId`). Keep the legal acceptance group only if still referenced; otherwise remove it with its state.

- [ ] **Step 3: Delete the basic dashboard**

```bash
git rm src/tradio/components/tradio/screens/LiveShowDashboard.tsx
```

- [ ] **Step 4: Verify no remaining references**

Run: `npm run build`
Expected: succeeds. If the build complains about `LiveShowDashboard` anywhere else, remove those imports.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor(tradio): remove DJ Studio parallel go-live; delete LiveShowDashboard"
```

---

## Task 6: Add the `'golive'` deep-link target

**Files:**

- Modify: `src/tradio/components/tradio/screens/BroadcastStudioGateway.tsx`

- [ ] **Step 1: Honor `initialTab === 'golive'`**

In the `useEffect` that reads `initialTab`, when it is `'golive'`, open the builder pre-staged on its live plan so the host can hit GO LIVE immediately:

```tsx
useEffect(() => {
  if (initialTab === "builder" || initialTab === "golive") {
    setIsBuildingShow(true);
  }
  // (role/accessStatus now fixed; nothing else to set)
}, [initialTab]);
```

(`ShowBuilder` always seeds a default `generatedShow`, so the GO LIVE button is immediately available. A dedicated "resume an already-live session" path is out of scope for this plan.)

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: succeeds.
Manual: from DJ Studio, click "Go Live" → lands in the Suite builder with GO LIVE ready.

- [ ] **Step 3: Commit**

```bash
git add src/tradio/components/tradio/screens/BroadcastStudioGateway.tsx
git commit -m "feat(tradio): add 'golive' deep-link into the Suite"
```

---

# PHASE 2 — Host broadcast bus (unified audio mix)

## Task 7: SFX/bed asset registry

**Files:**

- Create: `src/lib/tradio/sfxAssets.ts`
- Create: `public/tradio-sfx/` and `public/tradio-beds/` (audio files)

- [ ] **Step 1: Add bundled audio assets**

Place short royalty-free files (CC0 / public-domain; record the source in a `public/tradio-sfx/CREDITS.txt`):

- `public/tradio-sfx/airhorn.mp3`, `scratch.mp3`, `crowd-cheer.mp3`, `bass-drop.mp3`, `reverb-out.mp3`, `ai-drop.mp3`
- `public/tradio-beds/intro.mp3`, `outro.mp3`, `under.mp3`, `transition.mp3`

(If sourcing audio is blocked, create silent placeholder `.mp3`s so wiring is verifiable; note this in CREDITS.txt for later replacement.)

- [ ] **Step 2: Create the registry**

```ts
// src/lib/tradio/sfxAssets.ts
export interface SfxAsset {
  id: string;
  label: string;
  src: string;
}
export interface BedAsset {
  id: string;
  label: string;
  src: string;
  durationLabel: string;
}

export const SFX_ASSETS: SfxAsset[] = [
  { id: "airhorn", label: "Airhorn", src: "/tradio-sfx/airhorn.mp3" },
  { id: "scratch", label: "Scratch", src: "/tradio-sfx/scratch.mp3" },
  { id: "crowd", label: "Crowd Cheer", src: "/tradio-sfx/crowd-cheer.mp3" },
  { id: "drop", label: "Bass Drop", src: "/tradio-sfx/bass-drop.mp3" },
  { id: "reverb", label: "Reverb Out", src: "/tradio-sfx/reverb-out.mp3" },
  { id: "ai-drop", label: "AI Drop", src: "/tradio-sfx/ai-drop.mp3" },
];

export const BED_ASSETS: BedAsset[] = [
  { id: "intro", label: "Intro Bed", src: "/tradio-beds/intro.mp3", durationLabel: "30s" },
  { id: "outro", label: "Outro Bed", src: "/tradio-beds/outro.mp3", durationLabel: "45s" },
  { id: "under", label: "Under Bed", src: "/tradio-beds/under.mp3", durationLabel: "∞" },
  {
    id: "transition",
    label: "Transition",
    src: "/tradio-beds/transition.mp3",
    durationLabel: "8s",
  },
];
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/tradio/sfxAssets.ts public/tradio-sfx public/tradio-beds
git commit -m "feat(tradio): add SFX/music-bed asset registry"
```

---

## Task 8: The host mix graph factory

**Files:**

- Create: `src/lib/tradio/tradioHostMix.ts`

This is integration code over the Web Audio API (no meaningful unit test without a DOM AudioContext); verified by build + manual smoke. It owns one `AudioContext`, mixes mic + SFX + beds + AI into a `MediaStreamDestination`, and exposes an `AnalyserNode`.

- [ ] **Step 1: Implement `createHostMix`**

```ts
// src/lib/tradio/tradioHostMix.ts
import { SFX_ASSETS, BED_ASSETS } from "./sfxAssets.ts";

export interface HostMix {
  readonly stream: MediaStream;
  readonly analyser: AnalyserNode;
  setMicStream(stream: MediaStream | null): void;
  setMasterVolume(v: number): void; // 0..1 (mic + AI)
  setBedVolume(v: number): void; // 0..1
  playSfx(id: string): Promise<void>;
  playBed(id: string): Promise<void>;
  stopBed(): void;
  playAiBuffer(arrayBuffer: ArrayBuffer): Promise<AudioBufferSourceNode>;
  close(): Promise<void>;
}

export async function createHostMix(): Promise<HostMix> {
  const Ctx: typeof AudioContext =
    (window as any).AudioContext || (window as any).webkitAudioContext;
  const ctx = new Ctx();
  if (ctx.state === "suspended") await ctx.resume();

  const dest = ctx.createMediaStreamDestination();
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 256;

  // master = mic + AI; bed = music beds; sfx routes direct to dest.
  const master = ctx.createGain();
  master.gain.value = 0.85;
  const bed = ctx.createGain();
  bed.gain.value = 0.3;
  master.connect(dest);
  master.connect(analyser);
  bed.connect(dest);
  bed.connect(analyser);

  let micNode: MediaStreamAudioSourceNode | null = null;
  let bedSource: AudioBufferSourceNode | null = null;
  const bufferCache = new Map<string, AudioBuffer>();

  async function load(src: string): Promise<AudioBuffer> {
    const cached = bufferCache.get(src);
    if (cached) return cached;
    const res = await fetch(src);
    const arr = await res.arrayBuffer();
    const buf = await ctx.decodeAudioData(arr);
    bufferCache.set(src, buf);
    return buf;
  }

  return {
    stream: dest.stream,
    analyser,
    setMicStream(stream) {
      if (micNode) {
        try {
          micNode.disconnect();
        } catch {
          /* ignore */
        }
        micNode = null;
      }
      if (stream && stream.getAudioTracks().length) {
        micNode = ctx.createMediaStreamSource(stream);
        micNode.connect(master);
      }
    },
    setMasterVolume(v) {
      master.gain.value = Math.max(0, Math.min(1, v));
    },
    setBedVolume(v) {
      bed.gain.value = Math.max(0, Math.min(1, v));
    },
    async playSfx(id) {
      const asset = SFX_ASSETS.find((a) => a.id === id);
      if (!asset) return;
      const buf = await load(asset.src);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(dest);
      src.connect(analyser);
      src.start();
    },
    async playBed(id) {
      const asset = BED_ASSETS.find((a) => a.id === id);
      if (!asset) return;
      const buf = await load(asset.src);
      try {
        bedSource?.stop();
      } catch {
        /* ignore */
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = asset.id === "under";
      src.connect(bed);
      src.start();
      bedSource = src;
    },
    stopBed() {
      try {
        bedSource?.stop();
      } catch {
        /* ignore */
      }
      bedSource = null;
    },
    async playAiBuffer(arrayBuffer) {
      const buf = await ctx.decodeAudioData(arrayBuffer.slice(0));
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(master);
      src.start();
      return src;
    },
    async close() {
      try {
        bedSource?.stop();
      } catch {
        /* ignore */
      }
      try {
        micNode?.disconnect();
      } catch {
        /* ignore */
      }
      try {
        await ctx.close();
      } catch {
        /* ignore */
      }
    },
  };
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: succeeds (type-checks).

- [ ] **Step 3: Commit**

```bash
git add src/lib/tradio/tradioHostMix.ts
git commit -m "feat(tradio): host audio mixing graph (mic + sfx + beds + ai)"
```

---

## Task 9: Publish the host mix as the single LiveKit track

**Files:**

- Modify: `src/tradio/components/tradio/useTradioLiveRoom.ts`

Today the host publishes the raw mic and separately publishes AI voice. Replace both with the single mixed track from `createHostMix`.

- [ ] **Step 1: Extend `LiveRoomState`**

Add to the interface:

```ts
  playSfx: (id: string) => void;
  playBed: (id: string) => void;
  stopBed: () => void;
  setMasterVolume: (v: number) => void;
  setBedVolume: (v: number) => void;
  getAnalyser: () => AnalyserNode | null;
```

- [ ] **Step 2: Use the mix on the host path**

Add `import { createHostMix, type HostMix } from '@/lib/tradio/tradioHostMix';` and a ref `const mixRef = useRef<HostMix | null>(null);`.

In the connect effect, for `role === 'host'`, instead of `await room.localParticipant.setMicrophoneEnabled(true)`:

```ts
if (role === "host") {
  const mix = await createHostMix();
  mixRef.current = mix;
  // capture mic and route into the mix
  const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mix.setMicStream(micStream);
  const { LocalAudioTrack } = await import("livekit-client");
  const track = new LocalAudioTrack(mix.stream.getAudioTracks()[0]);
  aiTrackRef.current = track; // reuse existing ref as "the published track"
  await room.localParticipant.publishTrack(track);
  setMicOn(true);
}
```

- [ ] **Step 3: Route `toggleMic` and `aiSpeak` through the mix**

`toggleMic`: mute by setting master volume to 0 (and back to 0.85), since the published track is the mix:

```ts
const toggleMic = async () => {
  const mix = mixRef.current;
  if (role !== "host" || !mix) return;
  const next = !micOn;
  mix.setMasterVolume(next ? 0.85 : 0);
  setMicOn(next);
};
```

`aiSpeak`: replace the bespoke AudioContext/publish code with:

```ts
const aiSpeak = async (text: string, label?: string) => {
  const mix = mixRef.current;
  if (role !== "host" || !mix || !text.trim()) return;
  try {
    const res = await treyITts({ data: { text } });
    if (!res.audioBase64) {
      setError("AI voice isn't available right now.");
      return;
    }
    const bytes = Uint8Array.from(atob(res.audioBase64), (c) => c.charCodeAt(0));
    setAiSpeaking(true);
    setAiSegmentLabel(label ?? null);
    const src = await mix.playAiBuffer(bytes.buffer);
    aiSourceRef.current = src;
    src.onended = () => {
      setAiSpeaking(false);
      setAiSegmentLabel(null);
      aiSourceRef.current = null;
    };
  } catch (err) {
    setAiSpeaking(false);
    setAiSegmentLabel(null);
    setError((err as Error).message);
  }
};
```

- [ ] **Step 4: Add the new controls + analyser + teardown**

```ts
const playSfx = (id: string) => {
  void mixRef.current?.playSfx(id);
};
const playBed = (id: string) => {
  void mixRef.current?.playBed(id);
};
const stopBed = () => mixRef.current?.stopBed();
const setMasterVolume = (v: number) => mixRef.current?.setMasterVolume(v);
const setBedVolume = (v: number) => mixRef.current?.setBedVolume(v);
const getAnalyser = () => mixRef.current?.analyser ?? null;
```

In the cleanup function, add `void mixRef.current?.close(); mixRef.current = null;` and remove the old `audioCtxRef`/`destRef` bespoke teardown (those refs are no longer used). Return the new methods in the hook's return object.

- [ ] **Step 5: Verify build + manual smoke**

Run: `npm run build`
Expected: succeeds.
Manual: Go Live (host), confirm mic audio reaches a second browser tab joined as listener (existing `TradioLiveNowBar` "tune in"), and the mute button silences it.

- [ ] **Step 6: Commit**

```bash
git add src/tradio/components/tradio/useTradioLiveRoom.ts
git commit -m "feat(tradio): publish unified host mix as single LiveKit track"
```

---

## Task 10: Wire soundboard, beds, master deck, and real VU into the console

**Files:**

- Modify: `src/tradio/components/tradio/screens/LiveShowConsole.tsx`

- [ ] **Step 1: Drive the soundboard + beds from `live`**

Replace the soundboard's local `triggerSFX` with `live.playSfx(id)` plus a local notice append. Map the FX buttons to `SFX_ASSETS` (import from `@/lib/tradio/sfxAssets`). Add bed buttons mapped to `BED_ASSETS` calling `live.playBed(id)` / `live.stopBed()`.

- [ ] **Step 2: Master deck sliders → mix**

Wire the master-volume slider to `live.setMasterVolume(v/100)` and the audio-bed slider to `live.setBedVolume(v/100)`.

- [ ] **Step 3: Real VU meters from the analyser**

Replace the random VU `useEffect` with an animation loop reading the analyser:

```tsx
useEffect(() => {
  let raf = 0;
  const analyser = live.getAnalyser();
  if (!analyser) return;
  const data = new Uint8Array(analyser.frequencyBinCount);
  const tick = () => {
    analyser.getByteFrequencyData(data);
    const n = 12;
    const step = Math.floor(data.length / n) || 1;
    const bins = Array.from({ length: n }, (_, i) => {
      const v = data[i * step] ?? 0;
      return Math.round((v / 255) * 100);
    });
    setVuLeft(bins);
    setVuRight(bins.map((b) => Math.max(0, b - 6)));
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}, [live]);
```

- [ ] **Step 4: Verify build + manual smoke**

Run: `npm run build`
Expected: succeeds.
Manual: while live, click SFX → hear it in the listener tab; VU bars react to mic/SFX; sliders change levels.

- [ ] **Step 5: Commit**

```bash
git add src/tradio/components/tradio/screens/LiveShowConsole.tsx
git commit -m "feat(tradio): real soundboard, beds, master deck, and VU in live console"
```

---

# PHASE 3 — Real callers

## Task 11: Caller status logic (pure, TDD)

**Files:**

- Create: `src/lib/tradio/callerLogic.ts`
- Create: `src/lib/tradio/callerLogic.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/tradio/callerLogic.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import { nextCallerStatus, resolveCallerPublish, type CallerStatus } from "./callerLogic.ts";

test("pending -> on_air via take", () => {
  assert.equal(nextCallerStatus("pending", "take"), "on_air");
});
test("on_air -> ended via disconnect", () => {
  assert.equal(nextCallerStatus("on_air", "disconnect"), "ended");
});
test("pending -> ended via decline", () => {
  assert.equal(nextCallerStatus("pending", "decline"), "ended");
});
test("illegal transition keeps current status", () => {
  assert.equal(nextCallerStatus("ended", "take" as any), "ended");
});
test("only an on_air caller in a live session may publish", () => {
  assert.equal(resolveCallerPublish({ status: "on_air", sessionStatus: "live" }), true);
  assert.equal(resolveCallerPublish({ status: "pending", sessionStatus: "live" }), false);
  assert.equal(resolveCallerPublish({ status: "on_air", sessionStatus: "ended" }), false);
});
```

- [ ] **Step 2: Run it to verify failure**

Run: `node --test src/lib/tradio/callerLogic.test.ts`
Expected: FAIL — cannot find module `./callerLogic.ts`.

- [ ] **Step 3: Implement**

```ts
// src/lib/tradio/callerLogic.ts
export type CallerStatus = "pending" | "on_air" | "ended";
export type CallerAction = "take" | "disconnect" | "decline";

export function nextCallerStatus(current: CallerStatus, action: CallerAction): CallerStatus {
  if (current === "pending" && action === "take") return "on_air";
  if (current === "pending" && action === "decline") return "ended";
  if (current === "on_air" && action === "disconnect") return "ended";
  return current;
}

export function resolveCallerPublish(input: {
  status: CallerStatus;
  sessionStatus: "live" | "ended";
}): boolean {
  return input.status === "on_air" && input.sessionStatus === "live";
}
```

- [ ] **Step 4: Run it to verify pass**

Run: `node --test src/lib/tradio/callerLogic.test.ts`
Expected: PASS — `pass 5 ... fail 0`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/tradio/callerLogic.ts src/lib/tradio/callerLogic.test.ts
git commit -m "feat(tradio): caller status transition + publish resolution logic"
```

---

## Task 12: Call-requests table migration

**Files:**

- Create: `supabase/migrations/<timestamp>_tradio_live_call_requests.sql`

- [ ] **Step 1: Write the migration**

Use a timestamp prefix matching the repo's existing migration naming (e.g. `20260602120000_tradio_live_call_requests.sql`):

```sql
create table if not exists public.tradio_live_call_requests (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.tradio_live_sessions(id) on delete cascade,
  user_id uuid not null,
  caller_identity text not null,
  caller_name text,
  line_note text,
  status text not null default 'pending' check (status in ('pending','on_air','ended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tradio_live_call_requests enable row level security;

-- Anyone signed in can raise a hand for a session.
create policy "callers insert own" on public.tradio_live_call_requests
  for insert to authenticated with check (auth.uid() = user_id);

-- Everyone in the session can read the queue (so listeners see "on air").
create policy "callers read" on public.tradio_live_call_requests
  for select to authenticated using (true);

-- Host of the session can update status (take/disconnect/decline).
create policy "host updates callers" on public.tradio_live_call_requests
  for update to authenticated using (
    exists (select 1 from public.tradio_live_sessions s
            where s.id = session_id and s.host_user_id = auth.uid())
  );

alter publication supabase_realtime add table public.tradio_live_call_requests;
```

- [ ] **Step 2: Apply via the linked CLI (per repo rule — not MCP)**

Run: `supabase db push --linked`
Expected: migration applies to the **Trizzy Hub** project; `tradio_live_call_requests` appears.
(If `supabase` CLI is unavailable in this environment, leave the migration file committed and note in the task PR that it must be pushed by the operator.)

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations
git commit -m "feat(tradio): add tradio_live_call_requests table + RLS"
```

---

## Task 13: Caller client service + realtime hook

**Files:**

- Create: `src/tradio/components/tradio/tradioCallerService.ts`
- Create: `src/tradio/components/tradio/useTradioCallers.ts`

- [ ] **Step 1: Service (mirrors `tradioLiveInteractionService` patterns)**

```ts
// src/tradio/components/tradio/tradioCallerService.ts
import { isSupabaseConfigured, supabase } from "@/tradio/lib/supabaseClient";
import type { CallerStatus } from "@/lib/tradio/callerLogic";

export interface CallRequest {
  id: string;
  sessionId: string;
  userId: string;
  callerIdentity: string;
  callerName: string | null;
  lineNote: string | null;
  status: CallerStatus;
  createdAt: string;
}

const ok = isSupabaseConfigured && supabase;

function rowToCall(r: any): CallRequest {
  return {
    id: r.id,
    sessionId: r.session_id,
    userId: r.user_id,
    callerIdentity: r.caller_identity,
    callerName: r.caller_name,
    lineNote: r.line_note,
    status: r.status,
    createdAt: r.created_at,
  };
}

export async function listCallRequests(sessionId: string): Promise<CallRequest[]> {
  if (!ok) return [];
  const { data } = await supabase!
    .from("tradio_live_call_requests")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true })
    .limit(100);
  return (data ?? []).map(rowToCall);
}

export async function requestCall(input: {
  sessionId: string;
  callerIdentity: string;
  callerName?: string;
  lineNote?: string;
}): Promise<{ error: string | null }> {
  if (!ok) return { error: "Calling in needs Supabase." };
  const { data: u } = await supabase!.auth.getUser();
  const userId = u.user?.id;
  if (!userId) return { error: "Sign in to call in." };
  const { error } = await supabase!.from("tradio_live_call_requests").insert({
    session_id: input.sessionId,
    user_id: userId,
    caller_identity: input.callerIdentity,
    caller_name: input.callerName ?? null,
    line_note: input.lineNote ?? null,
    status: "pending",
  });
  return { error: error?.message ?? null };
}
```

- [ ] **Step 2: Realtime hook (mirrors `useTradioLiveInteraction`)**

```ts
// src/tradio/components/tradio/useTradioCallers.ts
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/tradio/lib/supabaseClient";
import { listCallRequests, type CallRequest } from "./tradioCallerService";

export function useTradioCallers(opts: { sessionId: string | null }) {
  const { sessionId } = opts;
  const [calls, setCalls] = useState<CallRequest[]>([]);
  const reload = useCallback(async () => {
    if (sessionId) setCalls(await listCallRequests(sessionId));
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId || !supabase) return;
    void reload();
    const ch = supabase
      .channel(`tradio-callers:${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tradio_live_call_requests",
          filter: `session_id=eq.${sessionId}`,
        },
        () => void reload(),
      )
      .subscribe();
    return () => {
      void supabase!.removeChannel(ch);
    };
  }, [sessionId, reload]);

  return { calls, reload };
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/tradio/components/tradio/tradioCallerService.ts src/tradio/components/tradio/useTradioCallers.ts
git commit -m "feat(tradio): caller request service + realtime hook"
```

---

## Task 14: Server endpoint to grant/revoke caller publish

**Files:**

- Create: `src/lib/tradio/tradioCaller.server.ts`
- Modify: `src/server.ts:63` (route registration area)

- [ ] **Step 1: Implement the handler (mirrors `livekit-token.server.ts` auth + config)**

```ts
// src/lib/tradio/tradioCaller.server.ts
import { RoomServiceClient } from "livekit-server-sdk";
import { getTreyIServiceClient } from "../trey-i/onboarding.server";
import { loadLiveKitConfig } from "../livekit-config.server";
import { tradioShowRoomName } from "./liveSessionPolicy";
import { nextCallerStatus, type CallerAction } from "./callerLogic";

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
function bearer(req: Request): string {
  return (req.headers.get("authorization") ?? "").match(/^Bearer\s+(.+)$/i)?.[1]?.trim() ?? "";
}
function httpUrl(url: string): string {
  if (url.startsWith("wss://")) return `https://${url.slice(6)}`;
  if (url.startsWith("ws://")) return `http://${url.slice(5)}`;
  return url;
}

export async function handleTradioCaller(request: Request, env: unknown): Promise<Response> {
  if (request.method === "OPTIONS") return json({});
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);

  let config;
  try {
    config = loadLiveKitConfig(env);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "LiveKit not configured." }, 503);
  }

  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const action = String(body.action || "") as CallerAction; // 'take' | 'disconnect' | 'decline'
    const requestId = String(body.requestId || "").trim();
    if (!requestId || !["take", "disconnect", "decline"].includes(action))
      return json({ error: "Bad request." }, 400);

    const supabase = getTreyIServiceClient();
    const token = bearer(request);
    const { data: authData } = await (supabase as any).auth.getUser(token);
    const hostId = authData?.user?.id;
    if (!hostId) return json({ error: "Unauthenticated." }, 401);

    // Load the call request + its session; verify caller of the action is the host.
    const { data: call } = await (supabase as any)
      .from("tradio_live_call_requests")
      .select("*")
      .eq("id", requestId)
      .maybeSingle();
    if (!call) return json({ error: "Call request not found." }, 404);
    const { data: session } = await (supabase as any)
      .from("tradio_live_sessions")
      .select("id, host_user_id, status")
      .eq("id", call.session_id)
      .maybeSingle();
    if (!session || session.host_user_id !== hostId) return json({ error: "Not the host." }, 403);

    const newStatus = nextCallerStatus(call.status, action);
    const canPublish = newStatus === "on_air" && session.status === "live";

    const svc = new RoomServiceClient(httpUrl(config.url), config.apiKey, config.apiSecret);
    const room = tradioShowRoomName(session.id);
    try {
      await svc.updateParticipant(room, call.caller_identity, undefined, {
        canPublish,
        canSubscribe: true,
        canPublishData: true,
      });
      if (!canPublish) {
        try {
          await svc.mutePublishedTrack(room, call.caller_identity, "", true);
        } catch {
          /* no track */
        }
      }
    } catch (err) {
      console.warn("[tradioCaller] updateParticipant failed", err);
      return json({ error: "Could not update caller audio permission." }, 502);
    }

    await (supabase as any)
      .from("tradio_live_call_requests")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", requestId);

    return json({ ok: true, status: newStatus, canPublish });
  } catch (err) {
    console.error("[tradioCaller] error", err);
    return json({ error: "Caller action failed." }, 500);
  }
}
```

- [ ] **Step 2: Register the route in `src/server.ts`**

Add the import near line 14:

```ts
import { handleTradioCaller } from "./lib/tradio/tradioCaller.server";
```

Add the route next to the LiveKit routes (after line 67):

```ts
if (url.pathname === "/api/tradio/caller") {
  return handleTradioCaller(request, env);
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: succeeds (confirm `updateParticipant`'s signature matches the installed `livekit-server-sdk`; if the SDK expects a `ParticipantPermission` object, adapt the 4th arg accordingly — check `node_modules/livekit-server-sdk` types).

- [ ] **Step 4: Commit**

```bash
git add src/lib/tradio/tradioCaller.server.ts src/server.ts
git commit -m "feat(tradio): server endpoint to grant/revoke caller publish"
```

---

## Task 15: Listener "Call in / raise hand" button

**Files:**

- Modify: `src/tradio/components/tradio/LiveRoomModal.tsx`

- [ ] **Step 1: Add the call-in control**

Import the service and add a button that inserts a request. The listener's LiveKit identity equals their `public_profile_uid` (see `resolveParticipant` in `livekit-token.server.ts`); fetch it from the profile, or fall back to the auth user id. Concretely:

```tsx
import { requestCall } from "./tradioCallerService";
import { supabase } from "./lib/supabaseClient";
import { toast } from "sonner";

async function handleCallIn(sessionId: string) {
  const { data } = await supabase!.auth.getUser();
  const user = data.user;
  if (!user) {
    toast.error("Sign in to call in.");
    return;
  }
  const { data: prof } = await supabase!
    .from("profiles")
    .select("public_profile_uid, display_name")
    .eq("id", user.id)
    .maybeSingle();
  const identity = (prof?.public_profile_uid as string) || user.id;
  const name = (prof?.display_name as string) || user.email?.split("@")[0] || "Listener";
  const { error } = await requestCall({ sessionId, callerIdentity: identity, callerName: name });
  toast[error ? "error" : "success"](error ?? "You raised your hand — waiting for the host.");
}
```

Render a "📞 Call in" button in the modal's action row, calling `handleCallIn(sessionId)`.

- [ ] **Step 2: Verify build + manual smoke**

Run: `npm run build`
Expected: succeeds.
Manual: in a listener tab, open the live room → "Call in" → toast success; row appears in `tradio_live_call_requests`.

- [ ] **Step 3: Commit**

```bash
git add src/tradio/components/tradio/LiveRoomModal.tsx
git commit -m "feat(tradio): listener call-in (raise hand) control"
```

---

## Task 16: Host caller queue — take/disconnect for real

**Files:**

- Modify: `src/tradio/components/tradio/screens/LiveShowConsole.tsx`
- Modify: `src/tradio/components/tradio/screens/BroadcastStudioGateway.tsx`

- [ ] **Step 1: Feed real callers into the console**

In `BroadcastStudioGateway`, add `import { useTradioCallers } from '../useTradioCallers';` and `const callers = useTradioCallers({ sessionId: liveSessionId });`. Pass `callers={callers.calls}` and a `sessionId={liveSessionId}` prop to `<LiveShowConsole>`. Extend the console's props with `callers: CallRequest[]` and `sessionId: string | null`.

- [ ] **Step 2: Replace mock caller state with real data + server actions**

In `LiveShowConsole`, delete the mock `callers`/`activeCaller` seed arrays. Derive:

```tsx
const pendingCallers = callers.filter((c) => c.status === "pending");
const onAirCaller = callers.find((c) => c.status === "on_air") ?? null;

async function callerAction(requestId: string, action: "take" | "disconnect" | "decline") {
  const { data } = await supabaseBrowser.auth.getSession();
  const tokenStr = data.session?.access_token ?? "";
  const res = await fetch("/api/tradio/caller", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(tokenStr ? { authorization: `Bearer ${tokenStr}` } : {}),
    },
    body: JSON.stringify({ requestId, action }),
  });
  if (!res.ok) {
    toast.error("Caller action failed.");
  }
}
```

(Import `createBrowserClient` from `@/lib/supabase-browser` as `supabaseBrowser` — same client `useTradioLiveRoom` uses for the token call.) Wire the "Take Call" button → `callerAction(c.id, 'take')`, "Disconnect" → `callerAction(onAirCaller.id, 'disconnect')`. Render `pendingCallers`/`onAirCaller` instead of the mock arrays. The host already auto-subscribes to the caller's published audio via the existing `TrackSubscribed` handler in `useTradioLiveRoom`.

- [ ] **Step 3: Listener side — enable mic when granted publish**

In `useTradioLiveRoom` (listener path), when the local participant's permissions change to `canPublish`, enable the mic so the caller is heard. Add after connect, for `role === 'listener'`:

```ts
room.on(RoomEvent.ParticipantPermissionsChanged, () => {
  const canPub = room.localParticipant.permissions?.canPublish;
  void room.localParticipant.setMicrophoneEnabled(Boolean(canPub));
});
```

- [ ] **Step 4: Verify build + manual smoke (two tabs)**

Run: `npm run build`
Expected: succeeds.
Manual: Host tab live; listener tab raises hand; host sees the pending caller; host "Take Call" → listener's mic enables and host hears them; "Disconnect" → caller muted, status `ended`.

- [ ] **Step 5: Commit**

```bash
git add src/tradio/components/tradio/screens/LiveShowConsole.tsx src/tradio/components/tradio/screens/BroadcastStudioGateway.tsx src/tradio/components/tradio/useTradioLiveRoom.ts
git commit -m "feat(tradio): real take/disconnect callers via LiveKit runtime permissions"
```

---

# PHASE 4 — Auto-pilot rundown engine

## Task 17: Rundown/pacing math (pure, TDD)

**Files:**

- Create: `src/lib/tradio/showRundown.ts`
- Create: `src/lib/tradio/showRundown.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/tradio/showRundown.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import { cumulativeStarts, pacingState, shouldAdvance } from "./showRundown.ts";

const segs = [{ duration: 60 }, { duration: 120 }, { duration: 30 }];

test("cumulative start offsets", () => {
  assert.deepEqual(cumulativeStarts(segs), [0, 60, 180]);
});
test("shouldAdvance when elapsed reaches segment duration", () => {
  assert.equal(shouldAdvance({ segments: segs, currentIndex: 0, elapsedInSegment: 60 }), true);
  assert.equal(shouldAdvance({ segments: segs, currentIndex: 0, elapsedInSegment: 59 }), false);
});
test("shouldAdvance false on last segment", () => {
  assert.equal(shouldAdvance({ segments: segs, currentIndex: 2, elapsedInSegment: 999 }), false);
});
test("pacing on-time when wall matches plan", () => {
  const p = pacingState({ segments: segs, currentIndex: 1, elapsedInSegment: 0, wallElapsed: 60 });
  assert.equal(p.status, "on-time");
  assert.equal(p.deltaSeconds, 0);
});
test("pacing behind when wall exceeds plan", () => {
  const p = pacingState({
    segments: segs,
    currentIndex: 1,
    elapsedInSegment: 30,
    wallElapsed: 120,
  });
  assert.equal(p.status, "behind");
  assert.equal(p.deltaSeconds, 30);
});
test("pacing ahead when wall is under plan", () => {
  const p = pacingState({ segments: segs, currentIndex: 1, elapsedInSegment: 0, wallElapsed: 40 });
  assert.equal(p.status, "ahead");
  assert.equal(p.deltaSeconds, -20);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test src/lib/tradio/showRundown.test.ts`
Expected: FAIL — cannot find module `./showRundown.ts`.

- [ ] **Step 3: Implement**

```ts
// src/lib/tradio/showRundown.ts
export interface RundownSegment {
  duration: number;
} // seconds

export function cumulativeStarts(segments: RundownSegment[]): number[] {
  const out: number[] = [];
  let acc = 0;
  for (const s of segments) {
    out.push(acc);
    acc += s.duration;
  }
  return out;
}

export function shouldAdvance(input: {
  segments: RundownSegment[];
  currentIndex: number;
  elapsedInSegment: number;
}): boolean {
  const { segments, currentIndex, elapsedInSegment } = input;
  if (currentIndex >= segments.length - 1) return false;
  return elapsedInSegment >= segments[currentIndex].duration;
}

export type PacingStatus = "on-time" | "behind" | "ahead";

export function pacingState(input: {
  segments: RundownSegment[];
  currentIndex: number;
  elapsedInSegment: number;
  wallElapsed: number;
}): { status: PacingStatus; deltaSeconds: number } {
  const starts = cumulativeStarts(input.segments);
  const plannedElapsed = (starts[input.currentIndex] ?? 0) + input.elapsedInSegment;
  const delta = Math.round(input.wallElapsed - plannedElapsed); // +behind, -ahead
  const status: PacingStatus = delta > 5 ? "behind" : delta < -5 ? "ahead" : "on-time";
  return { status, deltaSeconds: delta };
}
```

- [ ] **Step 4: Run to verify pass**

Run: `node --test src/lib/tradio/showRundown.test.ts`
Expected: PASS — `pass 6 ... fail 0`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/tradio/showRundown.ts src/lib/tradio/showRundown.test.ts
git commit -m "feat(tradio): pure show-rundown pacing + advance logic"
```

---

## Task 18: `useShowRundown` hook (timers + auto-pilot + AI trigger)

**Files:**

- Create: `src/tradio/components/tradio/useShowRundown.ts`

- [ ] **Step 1: Implement the hook**

```ts
// src/tradio/components/tradio/useShowRundown.ts
import { useEffect, useRef, useState, useCallback } from "react";
import { shouldAdvance, pacingState, type PacingStatus } from "@/lib/tradio/showRundown";
import type { ShowSegment } from "./data";

export interface ShowRundownState {
  currentIndex: number;
  elapsedInSegment: number;
  remainingInSegment: number;
  pacing: { status: PacingStatus; deltaSeconds: number };
  autoPilot: boolean;
  setAutoPilot: (v: boolean) => void;
  advance: () => void;
  extend: (seconds: number) => void;
}

export function useShowRundown(opts: {
  segments: ShowSegment[];
  active: boolean;
  onEnterSegment?: (segment: ShowSegment, index: number) => void;
}): ShowRundownState {
  const { segments, active, onEnterSegment } = opts;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsedInSegment, setElapsed] = useState(0);
  const [wallElapsed, setWall] = useState(0);
  const [autoPilot, setAutoPilot] = useState(true);
  const [extra, setExtra] = useState(0); // host-added seconds for current segment
  const enteredRef = useRef<number>(-1);

  const enterSegment = useCallback((index: number) => {
    setCurrentIndex(index);
    setElapsed(0);
    setExtra(0);
  }, []);

  // Fire onEnterSegment exactly once per segment entry.
  useEffect(() => {
    if (!active) return;
    if (enteredRef.current !== currentIndex) {
      enteredRef.current = currentIndex;
      const seg = segments[currentIndex];
      if (seg) onEnterSegment?.(seg, currentIndex);
    }
  }, [active, currentIndex, segments, onEnterSegment]);

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => {
      setElapsed((e) => e + 1);
      setWall((w) => w + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [active]);

  // Auto-advance.
  useEffect(() => {
    if (!active || !autoPilot) return;
    const effective = segments.map((s, i) =>
      i === currentIndex ? { duration: s.duration + extra } : { duration: s.duration },
    );
    if (shouldAdvance({ segments: effective, currentIndex, elapsedInSegment })) {
      enterSegment(currentIndex + 1);
    }
  }, [active, autoPilot, segments, currentIndex, elapsedInSegment, extra, enterSegment]);

  const curDur = (segments[currentIndex]?.duration ?? 0) + extra;
  const pacing = pacingState({ segments, currentIndex, elapsedInSegment, wallElapsed });

  return {
    currentIndex,
    elapsedInSegment,
    remainingInSegment: Math.max(0, curDur - elapsedInSegment),
    pacing,
    autoPilot,
    setAutoPilot,
    advance: () => enterSegment(Math.min(segments.length - 1, currentIndex + 1)),
    extend: (s) => setExtra((x) => x + s),
  };
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/tradio/components/tradio/useShowRundown.ts
git commit -m "feat(tradio): useShowRundown hook with auto-pilot + per-segment entry"
```

---

## Task 19: Drive the console's active segment from the rundown (auto-pilot + AI host)

**Files:**

- Modify: `src/tradio/components/tradio/screens/LiveShowConsole.tsx`

- [ ] **Step 1: Replace manual `activeSegmentIdx` with the rundown**

In `LiveShowConsole`, remove the local `activeSegmentIdx` state and use:

```tsx
const rundown = useShowRundown({
  segments: show.segments,
  active: live.connection === "connected",
  onEnterSegment: (seg) => {
    if (rundown.autoPilot && (seg.script || seg.hostNotes)) {
      void live.aiSpeak(seg.script ?? seg.hostNotes ?? "", seg.title);
    }
  },
});
const activeSegmentIdx = rundown.currentIndex;
const currentSegment =
  show.segments[activeSegmentIdx] ??
  ({ title: "Talk Break", type: "host-talk", hostNotes: "Vibe check.", duration: 120 } as any);
```

(Import `useShowRundown` from `../useShowRundown`.) Note: reference `rundown.autoPilot` inside `onEnterSegment` via a ref to avoid stale closure — capture `autoPilotRef` updated each render, or read `live`/auto-pilot through a ref. Simplest: gate the AI trigger on a `autoPilotRef.current` ref set in an effect.

- [ ] **Step 2: Replace the ◀ ▶ segment nav with rundown controls**

Wire the segment panel header to: an **Auto-pilot** toggle (`rundown.autoPilot` / `rundown.setAutoPilot`), a **Skip/Next** button (`rundown.advance`), and a **+1 min** button (`rundown.extend(60)`). Remove the old prev/next index buttons.

- [ ] **Step 3: Add the show-clock + pacing bar to the active-segment card**

```tsx
<div className="mt-3 flex items-center justify-between text-[11px] font-mono">
  <span className="text-white/50">−{Math.floor(rundown.remainingInSegment / 60)}:{String(rundown.remainingInSegment % 60).padStart(2, '0')} left in segment</span>
  <span className={
    rundown.pacing.status === 'behind' ? 'text-red-300'
    : rundown.pacing.status === 'ahead' ? 'text-cyan-300' : 'text-emerald-300'
  }>
    {rundown.pacing.status === 'on-time' ? 'ON TIME'
      : rundown.pacing.status === 'behind' ? `${rundown.pacing.deltaSeconds}s BEHIND`
      : `${Math.abs(rundown.pacing.deltaSeconds)}s AHEAD`}
  </span>
</div>
<div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
  <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all"
       style={{ width: `${Math.min(100, (rundown.elapsedInSegment / Math.max(1, currentSegment.duration)) * 100)}%` }} />
</div>
```

Keep the existing per-segment cues (`getSegmentCues`) and teleprompter `hostNotes` panel.

- [ ] **Step 4: Verify build + manual smoke**

Run: `npm run build`
Expected: succeeds.
Manual: Go Live → segments auto-advance at their durations; entering a segment with a script triggers the AI host read; toggling auto-pilot off stops advancing; "+1 min" and "Skip" work; pacing label flips to BEHIND when you linger.

- [ ] **Step 5: Commit**

```bash
git add src/tradio/components/tradio/screens/LiveShowConsole.tsx
git commit -m "feat(tradio): auto-pilot rundown + show-clock + AI host in live console"
```

---

## Task 20: Final pass — lint, full test run, manual end-to-end

- [ ] **Step 1: Run all unit tests**

Run: `node --test src/lib/tradio/liveSessionPolicy.test.ts src/lib/tradio/callerLogic.test.ts src/lib/tradio/showRundown.test.ts`
Expected: all pass, `fail 0`.

- [ ] **Step 2: Lint + build**

Run: `npm run lint` then `npm run build`
Expected: no errors.

- [ ] **Step 3: End-to-end manual (two browser tabs)**

1. Host: Broadcast Suite → Build a show → GO LIVE → lands in `LiveShowConsole`.
2. Listener tab: tune in via Live Now bar → hears host mic; chat/requests/polls work.
3. Host: trigger SFX/bed → listener hears them; VU reacts.
4. Listener: "Call in" → host sees pending caller → "Take Call" → two-way audio → "Disconnect".
5. Auto-pilot advances segments; AI host reads scripted segments; pacing label tracks; "End Broadcast" tears down cleanly (session `ended`, no console errors).
6. DJ Studio "Go Live" / "Build" buttons route into the Suite (no parallel panel).

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "chore(tradio): lint/build fixes and end-to-end polish for unified live console"
```

---

## Self-review notes (author)

- **Spec coverage:** §1 consolidation → Tasks 1,4,5,6; §2 unified console → Tasks 1,2,3; §3 broadcast bus → Tasks 7,8,9,10; §4 callers → Tasks 11–16; §5 auto-pilot rundown → Tasks 17,18,19; §6 error handling → graceful guards in hostMix/aiSpeak/callerAction; §7 testing → Tasks 0,11,17,20.
- **Out of scope confirmed:** no pitch correction (Task 3 removes the panel); desktop player/extension not touched.
- **Type consistency:** `CallerStatus`/`CallerAction` shared from `callerLogic.ts` by service, hook, and server; `LiveRoomState` additions consumed by `LiveShowConsole`; `RundownSegment.duration` aligns with `ShowSegment.duration` (seconds).
- **Open risk flagged in-task:** Task 14 Step 3 calls out verifying the exact `livekit-server-sdk` `updateParticipant` signature against the installed version before relying on it.

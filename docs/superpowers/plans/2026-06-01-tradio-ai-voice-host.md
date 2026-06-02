# Tradio AI Voice Host (per-segment read) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a live host tap "AI read" on a show's talk segment so the AI voice (Gemini TTS) reads that segment's script into the broadcast, mic auto-muted during the read.

**Architecture:** Browser-side TTS publish — `treyITts` returns WAV, decoded via Web Audio and published into the host's existing `tradio-show` LiveKit room as a `LocalAudioTrack`. Extend `useTradioLiveRoom` (host owns the room) with `aiSpeak`/`stopAi`; add host UI in DJStudio's Broadcast panel. No new tables/migration.

**Tech Stack:** `treyITts` (Gemini `gemini-2.5-flash-preview-tts` server fn), Web Audio API, `livekit-client` `LocalAudioTrack`, TanStack React, `node:test` via `npx tsx --test`.

Spec: `docs/superpowers/specs/2026-06-01-tradio-ai-voice-host-design.md`
Existing files reused: `src/lib/trey-i/tts.server.ts` (`treyITts`), `src/tradio/components/tradio/useTradioLiveRoom.ts` (#2), `src/tradio/components/tradio/radioShowService.ts` (`listMyShows`, #1), `src/tradio/components/tradio/data.ts` (`RadioShow`/`ShowSegment` with `script`).

---

## File structure
- Create `src/tradio/components/tradio/aiVoiceHost.ts` — pure `talkSegmentsWithScript`.
- Create `src/tradio/components/tradio/aiVoiceHost.test.ts` — `node:test`.
- Modify `src/tradio/components/tradio/useTradioLiveRoom.ts` — add `aiSpeak`/`stopAi`/`aiSpeaking`/`aiSegmentLabel`.
- Modify `src/tradio/components/tradio/screens/DJStudio.tsx` — AI Voice Host panel in the Broadcast tab.

---

## Task 1: Pure `talkSegmentsWithScript` (TDD)

**Files:** Create `src/tradio/components/tradio/aiVoiceHost.ts` + `aiVoiceHost.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { talkSegmentsWithScript } from './aiVoiceHost';
import type { RadioShow } from './data';

const show = {
  segments: [
    { id: '1', type: 'intro', title: 'Intro', duration: 60, script: 'Welcome in.' },
    { id: '2', type: 'music-block', title: 'Block', duration: 300, script: '' },
    { id: '3', type: 'host-talk', title: 'Talk', duration: 90, script: 'Here is the vibe.' },
    { id: '4', type: 'closing', title: 'Close', duration: 60 },                 // no script
    { id: '5', type: 'commercial', title: 'Ad', duration: 30, script: 'buy' },  // non-talk type
  ],
} as unknown as RadioShow;

test('returns only talk segments with a non-empty script', () => {
  const out = talkSegmentsWithScript(show);
  assert.deepEqual(out.map((s) => s.id), ['1', '3']);
});
test('handles null/empty show', () => {
  assert.deepEqual(talkSegmentsWithScript(null), []);
  assert.deepEqual(talkSegmentsWithScript({ segments: [] } as unknown as RadioShow), []);
});
```

- [ ] **Step 2: Run it (fails — module missing)** — Run: `npx tsx --test src/tradio/components/tradio/aiVoiceHost.test.ts` — Expected: FAIL.

- [ ] **Step 3: Implement `src/tradio/components/tradio/aiVoiceHost.ts`**

```ts
import type { RadioShow, ShowSegment } from './data';

const TALK_TYPES: ShowSegment['type'][] = ['intro', 'host-talk', 'closing', 'producer-spotlight', 'artist-premiere'];

/** Talk segments that carry a non-empty host script — the ones the AI voice can read. */
export function talkSegmentsWithScript(show: RadioShow | null | undefined): ShowSegment[] {
  if (!show?.segments) return [];
  return show.segments.filter(
    (s) => TALK_TYPES.includes(s.type) && typeof s.script === 'string' && s.script.trim().length > 0,
  );
}
```

- [ ] **Step 4: Run it (passes)** — Run: `npx tsx --test src/tradio/components/tradio/aiVoiceHost.test.ts` — Expected: 2 pass.
- [ ] **Step 5: Commit**

```bash
git add src/tradio/components/tradio/aiVoiceHost.ts src/tradio/components/tradio/aiVoiceHost.test.ts
git commit -m "feat(tradio): talkSegmentsWithScript helper for AI voice host"
```

---

## Task 2: AI-voice capability in `useTradioLiveRoom`

**Files:** Modify `src/tradio/components/tradio/useTradioLiveRoom.ts`

- [ ] **Step 1: Add the TTS import** (top of file, after the existing imports)

```ts
import { treyITts } from '@/lib/trey-i/tts.server';
```

- [ ] **Step 2: Extend the `LiveRoomState` interface** — add these members:

```ts
  aiSpeaking: boolean;
  aiSegmentLabel: string | null;
  aiSpeak: (text: string, label?: string) => Promise<void>;
  stopAi: () => void;
```

- [ ] **Step 3: Add state + refs** (inside the hook, next to the existing `useState`/`useRef` lines)

```ts
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [aiSegmentLabel, setAiSegmentLabel] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const destRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const aiTrackRef = useRef<any | null>(null);
  const aiSourceRef = useRef<AudioBufferSourceNode | null>(null);
```

- [ ] **Step 4: Extend the effect cleanup** — inside the existing `return () => { ... }` cleanup, BEFORE `setMicOn(false);`, add:

```ts
      try { aiSourceRef.current?.stop(); } catch { /* ignore */ }
      aiSourceRef.current = null;
      try { if (aiTrackRef.current && roomRef.current) roomRef.current.localParticipant.unpublishTrack(aiTrackRef.current); aiTrackRef.current?.stop?.(); } catch { /* ignore */ }
      aiTrackRef.current = null;
      try { void audioCtxRef.current?.close(); } catch { /* ignore */ }
      audioCtxRef.current = null; destRef.current = null;
      setAiSpeaking(false); setAiSegmentLabel(null);
```

- [ ] **Step 5: Add `aiSpeak` + `stopAi`** (after the existing `leave` function)

```ts
  const aiSpeak = async (text: string, label?: string) => {
    const room = roomRef.current;
    if (!room || role !== 'host' || !text.trim()) return;
    try {
      const res = await treyITts({ data: { text } });
      if (!res.audioBase64) { setError("AI voice isn’t available right now."); return; }

      if (!audioCtxRef.current) {
        const Ctx: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
        const ctx = new Ctx();
        const dest = ctx.createMediaStreamDestination();
        audioCtxRef.current = ctx;
        destRef.current = dest;
        const { LocalAudioTrack } = await import('livekit-client');
        const track = new LocalAudioTrack(dest.stream.getAudioTracks()[0]);
        aiTrackRef.current = track;
        await room.localParticipant.publishTrack(track);
      }

      const ctx = audioCtxRef.current!;
      const dest = destRef.current!;
      if (ctx.state === 'suspended') await ctx.resume();

      const bytes = Uint8Array.from(atob(res.audioBase64), (c) => c.charCodeAt(0));
      const buffer = await ctx.decodeAudioData(bytes.buffer);

      try { aiSourceRef.current?.stop(); } catch { /* ignore */ }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(dest);
      aiSourceRef.current = src;

      await room.localParticipant.setMicrophoneEnabled(false);
      setMicOn(false);
      setAiSpeaking(true);
      setAiSegmentLabel(label ?? null);
      src.onended = () => { setAiSpeaking(false); setAiSegmentLabel(null); aiSourceRef.current = null; };
      src.start();
    } catch (err) {
      setAiSpeaking(false); setAiSegmentLabel(null);
      setError((err as Error).message);
    }
  };

  const stopAi = () => {
    try { aiSourceRef.current?.stop(); } catch { /* ignore */ }
    aiSourceRef.current = null;
    setAiSpeaking(false);
    setAiSegmentLabel(null);
  };
```

- [ ] **Step 6: Extend the return** — change the final `return { ... }` to include the new members:

```ts
  return { connection, listenerCount, micOn, error, toggleMic, leave, aiSpeaking, aiSegmentLabel, aiSpeak, stopAi };
```

- [ ] **Step 7: Typecheck** — Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep "useTradioLiveRoom" || echo clean` — Expected: `clean`.
- [ ] **Step 8: Commit**

```bash
git add src/tradio/components/tradio/useTradioLiveRoom.ts
git commit -m "feat(tradio): AI voice host audio pipeline in useTradioLiveRoom (TTS -> published track)"
```

---

## Task 3: AI Voice Host panel in DJStudio Broadcast tab

**Files:** Modify `src/tradio/components/tradio/screens/DJStudio.tsx`

Context (already present from #1/#2): `live` (the host `useTradioLiveRoom` instance), `liveSessionId`, `myShows` (state set from `listMyShows()`), and `import type { RadioShow }`.

- [ ] **Step 1: Add imports + on-air-show state**

Add import:
```ts
import { talkSegmentsWithScript } from '../aiVoiceHost';
```
In the component, add:
```ts
  const [onAirShowId, setOnAirShowId] = useState<string>('');
```

- [ ] **Step 2: Render the panel** — inside the `{tab === 'broadcast' && (` block, add this `GlassCard` (rendered only when live), after the existing broadcast grid:

```tsx
          {liveSessionId && (
            <div className="px-4 sm:px-6 lg:px-10">
              <GlassCard className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-white">AI Voice Host</div>
                  {live.aiSpeaking && (
                    <button onClick={() => live.stopAi()} className="rounded-full border border-red-400/40 bg-red-500/15 px-3 py-1 text-[11px] font-bold text-red-200">
                      ■ Stop · {live.aiSegmentLabel ?? 'AI speaking'}
                    </button>
                  )}
                </div>
                <select
                  value={onAirShowId}
                  onChange={(e) => setOnAirShowId(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
                >
                  <option value="">Select a show to read…</option>
                  {(myShows ?? []).map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
                {(() => {
                  const show = (myShows ?? []).find((s) => s.id === onAirShowId) ?? null;
                  const segs = talkSegmentsWithScript(show);
                  if (!onAirShowId) return <div className="text-xs text-white/40">Pick a show to read its host scripts on air.</div>;
                  if (segs.length === 0) return <div className="text-xs text-white/40">This show has no AI host scripts.</div>;
                  return (
                    <div className="space-y-2">
                      {segs.map((seg) => (
                        <div key={seg.id} className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] p-2.5">
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold text-white">{seg.title}</div>
                            <div className="truncate text-[11px] text-white/45">{seg.script}</div>
                          </div>
                          <button
                            onClick={() => live.aiSpeak(seg.script!, seg.title)}
                            disabled={live.aiSpeaking}
                            className="shrink-0 rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-bold text-cyan-200 disabled:opacity-40"
                          >
                            ▶ AI read
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </GlassCard>
            </div>
          )}
```

- [ ] **Step 3: Typecheck** — Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep "screens/DJStudio" || echo clean` — Expected: `clean`.
- [ ] **Step 4: Commit**

```bash
git add src/tradio/components/tradio/screens/DJStudio.tsx
git commit -m "feat(tradio): DJStudio AI Voice Host panel (per-segment AI read)"
```

---

## Task 4: Verification

- [ ] **Step 1: Unit test** — Run: `npx tsx --test src/tradio/components/tradio/aiVoiceHost.test.ts` — Expected: 2/2 pass.
- [ ] **Step 2: Touched-files typecheck** — Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep -E "aiVoiceHost|useTradioLiveRoom|screens/DJStudio" || echo "ALL TOUCHED FILES CLEAN"` — Expected: `ALL TOUCHED FILES CLEAN`.
- [ ] **Step 3: Module-load smoke** (dev server running) — `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/src/tradio/components/tradio/aiVoiceHost.ts` and `.../useTradioLiveRoom.ts` — Expected: `200`.
- [ ] **Step 4: Manual smoke** (Gemini TTS key + LiveKit env, two browsers) — host live → pick a show → tap "AI read" on a talk segment → the listener in the other browser hears the AI voice read it; host mic muted during, restored after; **Stop** halts mid-read.

---

## Self-review notes
- **Spec coverage:** TTS-to-room pipeline (Task 2), per-segment host trigger + mic auto-mute/restore + Stop (Tasks 2/3), readable-segment selection (Task 1), host UI with show picker (Task 3), verification (Task 4). No migration (spec: code-only). Covered.
- **Out of scope:** auto-pilot sequencing, pre-rendered audio, voice picker, co-pilot (#5).
- **Type consistency:** `talkSegmentsWithScript` (Task 1) used in Task 3; `aiSpeak`/`stopAi`/`aiSpeaking`/`aiSegmentLabel` defined on `LiveRoomState` (Task 2) consumed in Task 3 via the existing `live` instance; reuses `myShows`/`listMyShows` (#1) + `liveSessionId`/`live` (#2) already in DJStudio; `treyITts({ data: { text } })` matches the server-fn call convention used by `judgeSignalTest`/`generateRadioShow`.
- **Env caveat:** needs the Gemini TTS key (`GEMINI_API_KEY`) + LiveKit env; degrades to a "not available" toast otherwise.
```

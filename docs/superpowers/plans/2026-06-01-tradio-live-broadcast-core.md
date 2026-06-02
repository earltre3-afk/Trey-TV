# Tradio Live Broadcast Core — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a DJ/host take a saved Tradio show live on mic via LiveKit; listeners tune in and hear the live audio with a real live listener count and on-air/ended state.

**Architecture:** Add a `tradio-show` room kind to the existing LiveKit token server (host publishes, listeners subscribe-only), a `tradio_live_sessions` table, a browser-side `tradioLiveService` (RLS-enforced go-live/end/discovery), a `useTradioLiveRoom` client hook (host mic / listener audio + presence), and wire DJStudio "Go Live" + a listener "LIVE / Listen Live" bar through the existing `PlayerContext`.

**Tech Stack:** LiveKit (`livekit-server-sdk` token + `livekit-client`), Supabase (Postgres + RLS via the linked Trizzy Hub CLI), TanStack React, `node:test` via `npx tsx --test`.

Spec: `docs/superpowers/specs/2026-06-01-tradio-live-broadcast-core-design.md`
Client reference pattern: `src/components/watch-party/PartyMic.tsx`.

---

## File structure
- Create `supabase/migrations/20260601040000_tradio_live_sessions.sql` — table + RLS.
- Create `src/lib/tradio/liveSessionPolicy.ts` — pure host/listener publish policy + room name.
- Create `src/lib/tradio/liveSessionPolicy.test.ts` — `node:test`.
- Modify `src/lib/livekit-token.server.ts` — `tradio-show` room kind + role-based publish.
- Create `src/tradio/components/tradio/tradioLiveService.ts` — goLive/endLive/listLiveNow/getLiveSession/updatePeakListeners (browser supabase).
- Create `src/tradio/components/tradio/useTradioLiveRoom.ts` — client hook (host mic / listener audio + count).
- Create `src/tradio/components/tradio/TradioLiveNowBar.tsx` — listener LIVE + Listen Live entry.
- Modify `src/tradio/components/tradio/screens/DJStudio.tsx` — Go Live / End Broadcast wired to real room.
- Modify `src/tradio/components/tradio/Shell.tsx` — mount `<TradioLiveNowBar />`.

---

## Task 1: Migration — `tradio_live_sessions`

**Files:** Create `supabase/migrations/20260601040000_tradio_live_sessions.sql`

- [ ] **Step 1: Write the migration**

```sql
-- Tradio live broadcast sessions (host mic -> listeners).
create table if not exists public.tradio_live_sessions (
  id uuid primary key default gen_random_uuid(),
  show_id uuid references public.tradio_radio_shows(id) on delete set null,
  host_user_id uuid not null references auth.users(id) on delete cascade,
  room_name text not null,
  status text not null default 'live' check (status in ('live','ended')),
  title text,
  host_name text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  peak_listeners integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_tradio_live_sessions_status on public.tradio_live_sessions(status);
create index if not exists idx_tradio_live_sessions_host on public.tradio_live_sessions(host_user_id);

alter table public.tradio_live_sessions enable row level security;

-- Anyone (incl. listeners) can see what's live; hosts manage their own rows.
drop policy if exists "tradio_live_sessions_select_live" on public.tradio_live_sessions;
create policy "tradio_live_sessions_select_live"
  on public.tradio_live_sessions for select
  using (status = 'live' or auth.uid() = host_user_id);

drop policy if exists "tradio_live_sessions_insert_own" on public.tradio_live_sessions;
create policy "tradio_live_sessions_insert_own"
  on public.tradio_live_sessions for insert
  with check (auth.uid() = host_user_id);

drop policy if exists "tradio_live_sessions_update_own" on public.tradio_live_sessions;
create policy "tradio_live_sessions_update_own"
  on public.tradio_live_sessions for update
  using (auth.uid() = host_user_id) with check (auth.uid() = host_user_id);
```

- [ ] **Step 2: Dry-run** — Run: `supabase db push --dry-run --linked` — Expected: lists `20260601040000_tradio_live_sessions.sql`.
- [ ] **Step 3: Apply** — Run: `printf 'y\n' | supabase db push --linked` — Expected: `Applying migration 20260601040000...` then `Finished`.
- [ ] **Step 4: Verify** (poll for schema-cache, service-role `$KEY`):
```bash
URL="https://wcdwlqnfcsuaacbvdmgx.supabase.co/rest/v1/tradio_live_sessions?select=id&limit=1"
for i in $(seq 1 12); do c=$(curl -s -o /dev/null -w "%{http_code}" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" "$URL"); echo "$c"; [ "$c" = "200" ] && break; sleep 5; done
```
Expected: `200`.
- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260601040000_tradio_live_sessions.sql
git commit -m "feat(tradio): tradio_live_sessions table + RLS"
```

---

## Task 2: Pure publish policy (TDD)

**Files:**
- Create `src/lib/tradio/liveSessionPolicy.ts`
- Test `src/lib/tradio/liveSessionPolicy.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveTradioShowPublish, tradioShowRoomName } from './liveSessionPolicy';

test('host of a live session can publish + subscribe', () => {
  const r = resolveTradioShowPublish({ session: { host_user_id: 'u1', status: 'live' }, userId: 'u1' });
  assert.deepEqual(r, { allowed: true, canPublish: true, canSubscribe: true });
});
test('non-host listener can subscribe but not publish', () => {
  const r = resolveTradioShowPublish({ session: { host_user_id: 'u1', status: 'live' }, userId: 'u2' });
  assert.deepEqual(r, { allowed: true, canPublish: false, canSubscribe: true });
});
test('ended session is not allowed', () => {
  const r = resolveTradioShowPublish({ session: { host_user_id: 'u1', status: 'ended' }, userId: 'u1' });
  assert.equal(r.allowed, false);
});
test('missing session is not allowed', () => {
  const r = resolveTradioShowPublish({ session: null, userId: 'u1' });
  assert.equal(r.allowed, false);
});
test('room name is keyed by session id', () => {
  assert.equal(tradioShowRoomName('abc'), 'tradio-show:abc');
});
```

- [ ] **Step 2: Run it (fails — module missing)** — Run: `npx tsx --test src/lib/tradio/liveSessionPolicy.test.ts` — Expected: FAIL.

- [ ] **Step 3: Implement `src/lib/tradio/liveSessionPolicy.ts`**

```ts
export type LiveSessionLite = { host_user_id: string; status: 'live' | 'ended' } | null;

export interface PublishResolution {
  allowed: boolean;     // may the user join the room at all?
  canPublish: boolean;  // host only
  canSubscribe: boolean;
}

/** Decide LiveKit grants for a tradio-show room: only the live session's host publishes. */
export function resolveTradioShowPublish(input: { session: LiveSessionLite; userId: string }): PublishResolution {
  const { session, userId } = input;
  if (!session || session.status !== 'live') {
    return { allowed: false, canPublish: false, canSubscribe: false };
  }
  const isHost = !!userId && session.host_user_id === userId;
  return { allowed: true, canPublish: isHost, canSubscribe: true };
}

export function tradioShowRoomName(sessionId: string): string {
  return `tradio-show:${sessionId}`;
}
```

- [ ] **Step 4: Run it (passes)** — Run: `npx tsx --test src/lib/tradio/liveSessionPolicy.test.ts` — Expected: 5 pass.
- [ ] **Step 5: Commit**

```bash
git add src/lib/tradio/liveSessionPolicy.ts src/lib/tradio/liveSessionPolicy.test.ts
git commit -m "feat(tradio): live-session publish policy helper"
```

---

## Task 3: `tradio-show` room kind in the token server

**Files:** Modify `src/lib/livekit-token.server.ts`

- [ ] **Step 1: Add the kind to the type + parser**

- In `type RoomKind`, add `| "tradio-show"`.
- In `roomKindFrom`, before the final `return "interactive-story";`, add:
```ts
  if (raw === "tradio-show" || raw === "tradio_show" || raw === "radio") return "tradio-show";
```
- Add the import at top: `import { resolveTradioShowPublish, tradioShowRoomName } from "./tradio/liveSessionPolicy";`

- [ ] **Step 2: Resolve the room** — in `resolveRoom`, add a branch (e.g. after the `watch-party` block):
```ts
  if (kind === "tradio-show") {
    const sessionId = cleanPart(body.sessionId, "session");
    return {
      kind,
      roomName: tradioShowRoomName(sessionId),
      dispatchAgent: false,
      metadata: { mode: "voice-room", storyId: null, beatId: null, pageId: null, projectId: null, userUid: participant.userUid },
    };
  }
```

- [ ] **Step 3: Role-based publish** — in `handleLiveKitToken`, alongside the existing watch-party permission block (after `let canPublish = true;`), add:
```ts
    if (room.kind === "tradio-show") {
      canPublish = false; // default to listener; only the host publishes
      try {
        const supabase = getTreyIServiceClient();
        const sessionId = String(body.sessionId || "").trim();
        if (sessionId) {
          const { data: session } = await (supabase as any)
            .from("tradio_live_sessions")
            .select("host_user_id, status")
            .eq("id", sessionId)
            .maybeSingle();
          const resolution = resolveTradioShowPublish({ session: session ?? null, userId: participant.userUid });
          if (!resolution.allowed) {
            return json({ error: "This live show isn't on air." }, 403);
          }
          canPublish = resolution.canPublish;
        }
      } catch (err) {
        console.warn("[LiveKit] tradio-show permission check failed:", err);
        canPublish = false; // fail safe: listener only
      }
    }
```
(`canSubscribe` stays `true` in the existing `addGrant` call — listeners subscribe.)

- [ ] **Step 4: Typecheck** — Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep "livekit-token" || echo clean` — Expected: `clean`.
- [ ] **Step 5: Commit**

```bash
git add src/lib/livekit-token.server.ts
git commit -m "feat(tradio): tradio-show LiveKit room kind (host publishes, listeners subscribe)"
```

---

## Task 4: `tradioLiveService` (browser supabase)

**Files:** Create `src/tradio/components/tradio/tradioLiveService.ts`

- [ ] **Step 1: Create the service**

```ts
import { isSupabaseConfigured, supabase } from '@/tradio/lib/supabaseClient';
import { handleMissingTradioTables } from './auth/tradioProfileBootstrap';
import { tradioShowRoomName } from '@/lib/tradio/liveSessionPolicy';

export interface LiveSession {
  id: string;
  showId: string | null;
  hostUserId: string;
  roomName: string;
  status: 'live' | 'ended';
  title: string | null;
  hostName: string | null;
  startedAt: string;
  peakListeners: number;
}

const rowToSession = (row: Record<string, any>): LiveSession => ({
  id: String(row.id),
  showId: row.show_id ?? null,
  hostUserId: row.host_user_id,
  roomName: row.room_name,
  status: row.status,
  title: row.title ?? null,
  hostName: row.host_name ?? null,
  startedAt: row.started_at,
  peakListeners: Number(row.peak_listeners ?? 0),
});

async function currentUserId(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function goLive(input: { showId: string | null; title: string; hostName: string }): Promise<{ session: LiveSession | null; error: string | null }> {
  if (!isSupabaseConfigured || !supabase) return { session: null, error: 'Live requires Supabase.' };
  const uid = await currentUserId();
  if (!uid) return { session: null, error: 'Sign in to go live.' };
  try {
    // Insert first to get the id, then set room_name = tradio-show:<id>.
    const { data: created, error: insErr } = await supabase
      .from('tradio_live_sessions')
      .insert({ show_id: input.showId, host_user_id: uid, room_name: 'pending', status: 'live', title: input.title, host_name: input.hostName })
      .select('*').single();
    if (insErr || !created) return { session: null, error: handleMissingTradioTables(insErr).message };
    const roomName = tradioShowRoomName(created.id);
    const { data: updated } = await supabase
      .from('tradio_live_sessions').update({ room_name: roomName }).eq('id', created.id).select('*').single();
    if (input.showId) await supabase.from('tradio_radio_shows').update({ status: 'live' }).eq('id', input.showId);
    return { session: rowToSession(updated ?? created), error: null };
  } catch (err) {
    return { session: null, error: handleMissingTradioTables(err).message };
  }
}

export async function endLive(input: { sessionId: string; showId: string | null; peakListeners: number }): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('tradio_live_sessions')
      .update({ status: 'ended', ended_at: new Date().toISOString(), peak_listeners: input.peakListeners })
      .eq('id', input.sessionId);
    if (input.showId) await supabase.from('tradio_radio_shows').update({ status: 'draft' }).eq('id', input.showId);
  } catch (err) {
    console.warn('[tradioLive] endLive failed', err);
  }
}

export async function listLiveNow(): Promise<LiveSession[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('tradio_live_sessions').select('*').eq('status', 'live').order('started_at', { ascending: false });
    if (error) return [];
    return (Array.isArray(data) ? data : []).map(rowToSession);
  } catch { return []; }
}

export async function updatePeakListeners(sessionId: string, count: number): Promise<void> {
  if (!isSupabaseConfigured || !supabase || count <= 0) return;
  try {
    // Best-effort: only raise the peak.
    const { data } = await supabase.from('tradio_live_sessions').select('peak_listeners').eq('id', sessionId).maybeSingle();
    const current = Number(data?.peak_listeners ?? 0);
    if (count > current) await supabase.from('tradio_live_sessions').update({ peak_listeners: count }).eq('id', sessionId);
  } catch { /* ignore */ }
}
```

- [ ] **Step 2: Typecheck** — Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep "tradioLiveService" || echo clean` — Expected: `clean`.
- [ ] **Step 3: Commit**

```bash
git add src/tradio/components/tradio/tradioLiveService.ts
git commit -m "feat(tradio): tradioLiveService (go live / end / discover / peak)"
```

---

## Task 5: `useTradioLiveRoom` client hook

**Files:** Create `src/tradio/components/tradio/useTradioLiveRoom.ts`

- [ ] **Step 1: Create the hook** (adapts `PartyMic.tsx`'s connect pattern)

```ts
import { useEffect, useRef, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase-browser';
import { updatePeakListeners } from './tradioLiveService';

type TokenResponse = { ok?: true; token?: string; livekitUrl?: string; roomName?: string; error?: string };
type Role = 'host' | 'listener';

export interface LiveRoomState {
  connection: 'idle' | 'connecting' | 'connected' | 'error';
  listenerCount: number;
  micOn: boolean;
  error: string | null;
  toggleMic: () => Promise<void>;
  leave: () => void;
}

/** Connects to a tradio-show LiveKit room. Host publishes mic; listener subscribes to audio. */
export function useTradioLiveRoom(opts: { active: boolean; role: Role; sessionId: string | null }): LiveRoomState {
  const { active, role, sessionId } = opts;
  const [connection, setConnection] = useState<LiveRoomState['connection']>('idle');
  const [listenerCount, setListenerCount] = useState(0);
  const [micOn, setMicOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const roomRef = useRef<any | null>(null);
  const audioElsRef = useRef<HTMLAudioElement[]>([]);

  useEffect(() => {
    if (!active || !sessionId) return;
    let cancelled = false;
    setConnection('connecting');

    (async () => {
      try {
        const supabase = createBrowserClient();
        const { data: sess } = await supabase.auth.getSession();
        const accessToken = sess.session?.access_token ?? '';
        const res = await fetch('/api/livekit/token', {
          method: 'POST',
          headers: { 'content-type': 'application/json', ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}) },
          body: JSON.stringify({ roomKind: 'tradio-show', sessionId }),
        });
        const payload = (await res.json()) as TokenResponse;
        if (!res.ok || !payload.ok || !payload.token || !payload.livekitUrl) {
          throw new Error(payload.error || `token failed (${res.status})`);
        }

        const { Room, RoomEvent, Track } = await import('livekit-client');
        const room = new Room({ adaptiveStream: true, dynacast: true });
        roomRef.current = room;

        const recount = () => {
          // For a listener, audience = remote (host + others) ; for the host, audience = remote listeners.
          const count = room.remoteParticipants.size;
          setListenerCount(count);
          if (role === 'host' && sessionId) void updatePeakListeners(sessionId, count);
        };

        room.on(RoomEvent.ParticipantConnected, recount);
        room.on(RoomEvent.ParticipantDisconnected, recount);
        room.on(RoomEvent.TrackSubscribed, (track: any) => {
          if (track.kind === Track.Kind.Audio) {
            const el = track.attach() as HTMLAudioElement;
            el.autoplay = true;
            (el as any).playsInline = true;
            document.body.appendChild(el);
            audioElsRef.current.push(el);
          }
        });
        room.on(RoomEvent.TrackUnsubscribed, (track: any) => { try { track.detach().forEach((el: HTMLMediaElement) => el.remove()); } catch { /* ignore */ } });

        await room.connect(payload.livekitUrl, payload.token);
        if (cancelled) { room.disconnect(); return; }

        if (role === 'host') {
          await room.localParticipant.setMicrophoneEnabled(true);
          setMicOn(true);
        }
        recount();
        setConnection('connected');
      } catch (err) {
        if (!cancelled) { setError((err as Error).message); setConnection('error'); }
      }
    })();

    return () => {
      cancelled = true;
      try { roomRef.current?.disconnect(); } catch { /* ignore */ }
      audioElsRef.current.forEach((el) => el.remove());
      audioElsRef.current = [];
      roomRef.current = null;
      setConnection('idle');
      setListenerCount(0);
      setMicOn(false);
    };
  }, [active, role, sessionId]);

  const toggleMic = async () => {
    const room = roomRef.current;
    if (!room || role !== 'host') return;
    try {
      const next = !micOn;
      await room.localParticipant.setMicrophoneEnabled(next);
      setMicOn(next);
    } catch (err) { setError((err as Error).message); }
  };

  const leave = () => {
    try { roomRef.current?.disconnect(); } catch { /* ignore */ }
  };

  return { connection, listenerCount, micOn, error, toggleMic, leave };
}
```

- [ ] **Step 2: Typecheck** — Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep "useTradioLiveRoom" || echo clean` — Expected: `clean`.
- [ ] **Step 3: Commit**

```bash
git add src/tradio/components/tradio/useTradioLiveRoom.ts
git commit -m "feat(tradio): useTradioLiveRoom hook (host mic / listener audio + presence)"
```

---

## Task 6: Wire DJStudio "Go Live" / "End Broadcast"

**Files:** Modify `src/tradio/components/tradio/screens/DJStudio.tsx`

- [ ] **Step 1: Imports + live state**

Add imports:
```ts
import { goLive, endLive } from '../tradioLiveService';
import { useTradioLiveRoom } from '../useTradioLiveRoom';
```
In the component, add:
```ts
  const [liveSessionId, setLiveSessionId] = useState<string | null>(null);
  const live = useTradioLiveRoom({ active: Boolean(liveSessionId), role: 'host', sessionId: liveSessionId });
```

- [ ] **Step 2: Replace the body of `handleGoLive`**

Replace the existing `handleGoLive` implementation with:
```ts
  const handleGoLive = async () => {
    const accepted = await recordBroadcastLegal(isLive ? 'end_broadcast' : 'go_live');
    if (!accepted) return;
    if (!isLive) {
      const { session, error } = await goLive({ showId: null, title: 'Live Desk', hostName: currentDJ.name });
      if (error || !session) { setIsLive(false); return; }
      setLiveSessionId(session.id);
      setIsLive(true);
    } else {
      if (liveSessionId) await endLive({ sessionId: liveSessionId, showId: null, peakListeners: live.listenerCount });
      live.leave();
      setLiveSessionId(null);
      setIsLive(false);
    }
  };
```
(Keep the rest of the component. `playItem(...)` may remain for the in-studio preview, or be removed — leaving it is harmless.)

- [ ] **Step 3: Show real on-air state + listener count**

In the live status pill area (where `isLive ? 'LIVE NOW' : 'STANDBY'` renders), append the live listener count when live:
```tsx
                    {isLive && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold text-white/70">
                        {live.listenerCount} listening{live.connection === 'connecting' ? ' · connecting…' : ''}
                      </span>
                    )}
```

- [ ] **Step 4: Typecheck** — Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep "DJStudio" || echo clean` — Expected: `clean`.
- [ ] **Step 5: Commit**

```bash
git add src/tradio/components/tradio/screens/DJStudio.tsx
git commit -m "feat(tradio): DJStudio Go Live publishes a real LiveKit broadcast"
```

---

## Task 7: Listener entry — `TradioLiveNowBar` + mount

**Files:**
- Create `src/tradio/components/tradio/TradioLiveNowBar.tsx`
- Modify `src/tradio/components/tradio/Shell.tsx`

- [ ] **Step 1: Create the bar**

```tsx
import { useEffect, useState } from 'react';
import { Radio, X } from 'lucide-react';
import { listLiveNow, type LiveSession } from './tradioLiveService';
import { useTradioLiveRoom } from './useTradioLiveRoom';

/** Shows a LIVE banner when a Tradio show is on air and lets the user tune in as a listener. */
export function TradioLiveNowBar() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [tunedSessionId, setTunedSessionId] = useState<string | null>(null);
  const live = useTradioLiveRoom({ active: Boolean(tunedSessionId), role: 'listener', sessionId: tunedSessionId });

  useEffect(() => {
    let active = true;
    const load = async () => { const s = await listLiveNow(); if (active) setSessions(s); };
    void load();
    const t = setInterval(load, 20000);
    return () => { active = false; clearInterval(t); };
  }, []);

  const top = sessions[0];
  if (!top && !tunedSessionId) return null;

  const tuned = tunedSessionId ? sessions.find((s) => s.id === tunedSessionId) ?? top : null;

  return (
    <div className="mx-4 mt-3 rounded-2xl border border-pink-500/30 bg-gradient-to-r from-pink-500/10 via-fuchsia-500/5 to-transparent p-3 sm:mx-6 lg:mx-10">
      <div className="flex items-center gap-3">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-pink-500" />
        </span>
        <Radio className="h-4 w-4 text-pink-300 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold text-white">{(tuned ?? top)?.title || 'Live on Tradio'}</div>
          <div className="truncate text-[11px] text-white/55">
            {(tuned ?? top)?.hostName || 'Host'} · {tunedSessionId ? (live.connection === 'connected' ? 'ON AIR · you are listening' : 'connecting…') : 'LIVE now'}
          </div>
        </div>
        {tunedSessionId ? (
          <button onClick={() => { live.leave(); setTunedSessionId(null); }} className="flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/5">
            <X className="h-3.5 w-3.5" /> Leave
          </button>
        ) : (
          <button onClick={() => top && setTunedSessionId(top.id)} className="rounded-full border border-pink-400/40 bg-pink-500/15 px-3 py-1.5 text-xs font-bold text-pink-100 hover:bg-pink-500/25">
            Listen Live
          </button>
        )}
      </div>
    </div>
  );
}

export default TradioLiveNowBar;
```

- [ ] **Step 2: Mount it in the Tradio shell**

In `Shell.tsx`, add the import near the other screen imports:
```ts
import { TradioLiveNowBar } from './TradioLiveNowBar';
```
Then render it just inside the main scroll container, immediately before `{renderScreen()}`:
```tsx
          <div ref={mainScrollRef} className="tradio-responsive-main flex-1 overflow-y-auto pb-[calc(13rem_+_env(safe-area-inset-bottom))] lg:pb-12">
            <TradioLiveNowBar />
            {renderScreen()}
          </div>
```

- [ ] **Step 3: Typecheck** — Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep -E "TradioLiveNowBar|tradio/components/tradio/Shell" || echo clean` — Expected: `clean`.
- [ ] **Step 4: Commit**

```bash
git add src/tradio/components/tradio/TradioLiveNowBar.tsx src/tradio/components/tradio/Shell.tsx
git commit -m "feat(tradio): listener LIVE bar (tune in to a live broadcast)"
```

---

## Task 8: Verification

- [ ] **Step 1: Unit tests** — Run: `npx tsx --test src/lib/tradio/liveSessionPolicy.test.ts` — Expected: 5/5 pass.
- [ ] **Step 2: Touched-files typecheck** — Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep -E "liveSessionPolicy|livekit-token|tradioLiveService|useTradioLiveRoom|TradioLiveNowBar|DJStudio|tradio/components/tradio/Shell" || echo "ALL TOUCHED FILES CLEAN"` — Expected: `ALL TOUCHED FILES CLEAN`.
- [ ] **Step 3: Module-load smoke** — with the dev server running, `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/src/tradio/components/tradio/useTradioLiveRoom.ts` and `.../tradioLiveService.ts` — Expected: `200` (Vite transforms with no import errors).
- [ ] **Step 4: Manual two-client smoke (requires LiveKit env creds)** — Host: open DJStudio (DJ/host role) → Go Live → ON AIR, mic publishing. Second browser (different user): the `TradioLiveNowBar` shows LIVE → Listen Live → hears the host; host's listener count increments. Host → End Broadcast → both tear down, bar disappears.

---

## Self-review notes
- **Spec coverage:** host mic broadcast (Tasks 3/5/6), listener tune-in + audio (Tasks 5/7), live count (Task 5 `listenerCount` + persisted peak Task 4), on-air/ended state + discovery (Tasks 1/4/7), token role-gating (Tasks 2/3), reuse of PlayerContext/LiveKit (uses existing token endpoint + livekit-client). Covered.
- **Out of scope:** chat (#3), AI voice host (#4), co-pilot (#5), music/replays (#6), dedicated listen page.
- **Type consistency:** `resolveTradioShowPublish`/`tradioShowRoomName` (Task 2) used in Task 3; `LiveSession`/`goLive`/`endLive`/`listLiveNow`/`updatePeakListeners` (Task 4) used in Tasks 5/6/7; `useTradioLiveRoom` (Task 5) used in Tasks 6/7.
- **Env caveat:** broadcasting requires `LIVEKIT_URL`/key/secret in the env; without them the token endpoint returns 503 and Go Live surfaces an error (no crash).

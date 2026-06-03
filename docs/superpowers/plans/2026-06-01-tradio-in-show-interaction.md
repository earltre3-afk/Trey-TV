# Tradio In-Show Interaction (Chat / Requests / Polls) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Real-time fan chat, song requests, and host-run polls during a live Tradio broadcast, delivered via Supabase Realtime and surfaced in a listener Live Room modal + the host's DJStudio Broadcast tab.

**Architecture:** Session-scoped Postgres tables (`tradio_live_*`) with Supabase Realtime subscriptions (the `music-review/ChatPanel` pattern), a `tradioLiveInteractionService` (supabase-or-fallback), a `useTradioLiveInteraction` hook owning one channel per session, and UI that layers interaction over the existing #2 audio connection.

**Tech Stack:** Supabase Realtime (`channel().on('postgres_changes').subscribe()`), Postgres + RLS via the linked Trizzy Hub CLI, TanStack React, `node:test` via `npx tsx --test`.

Spec: `docs/superpowers/specs/2026-06-01-tradio-in-show-interaction-design.md`
Reference pattern: `src/features/music-review/components/public/ChatPanel.tsx`.

---

## File structure

- Create `supabase/migrations/20260601050000_tradio_live_interaction.sql` — 4 tables + RLS.
- Create `src/tradio/components/tradio/liveInteractionLogic.ts` — pure `computePollTallies` + `nextRequestStatus`.
- Create `src/tradio/components/tradio/liveInteractionLogic.test.ts` — `node:test`.
- Create `src/tradio/components/tradio/tradioLiveInteractionService.ts` — chat/request/poll data ops.
- Create `src/tradio/components/tradio/useTradioLiveInteraction.ts` — realtime hook.
- Create `src/tradio/components/tradio/LiveRoomModal.tsx` — listener room (chat + request + poll).
- Modify `src/tradio/components/tradio/TradioLiveNowBar.tsx` — open the modal on "Listen Live".
- Modify `src/tradio/components/tradio/screens/DJStudio.tsx` — host interaction panel in the Broadcast tab.

---

## Task 1: Migration — interaction tables

**Files:** Create `supabase/migrations/20260601050000_tradio_live_interaction.sql`

- [ ] **Step 1: Write the migration**

```sql
-- In-show interaction for live Tradio sessions: chat, requests, polls.
create table if not exists public.tradio_live_chat (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.tradio_live_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_tradio_live_chat_session on public.tradio_live_chat(session_id);

create table if not exists public.tradio_live_requests (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.tradio_live_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  requester_name text,
  song_title text not null,
  artist text,
  message text,
  status text not null default 'pending' check (status in ('pending','queued','played','declined')),
  created_at timestamptz not null default now()
);
create index if not exists idx_tradio_live_requests_session on public.tradio_live_requests(session_id);

create table if not exists public.tradio_live_polls (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.tradio_live_sessions(id) on delete cascade,
  host_user_id uuid not null references auth.users(id) on delete cascade,
  question text not null,
  options jsonb not null default '[]'::jsonb,
  status text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz not null default now(),
  closed_at timestamptz
);
create index if not exists idx_tradio_live_polls_session on public.tradio_live_polls(session_id);

create table if not exists public.tradio_live_poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.tradio_live_polls(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  option_id text not null,
  created_at timestamptz not null default now(),
  unique (poll_id, user_id)
);
create index if not exists idx_tradio_live_poll_votes_poll on public.tradio_live_poll_votes(poll_id);

alter table public.tradio_live_chat enable row level security;
alter table public.tradio_live_requests enable row level security;
alter table public.tradio_live_polls enable row level security;
alter table public.tradio_live_poll_votes enable row level security;

-- Helper: is the current user the host of this session?
create or replace function public.tradio_is_session_host(p_session_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.tradio_live_sessions s where s.id = p_session_id and s.host_user_id = auth.uid());
$$;

-- Public read on all (live interactions are public).
drop policy if exists "tradio_live_chat_select" on public.tradio_live_chat;
create policy "tradio_live_chat_select" on public.tradio_live_chat for select using (true);
drop policy if exists "tradio_live_chat_insert" on public.tradio_live_chat;
create policy "tradio_live_chat_insert" on public.tradio_live_chat for insert with check (auth.uid() = user_id);

drop policy if exists "tradio_live_requests_select" on public.tradio_live_requests;
create policy "tradio_live_requests_select" on public.tradio_live_requests for select using (true);
drop policy if exists "tradio_live_requests_insert" on public.tradio_live_requests;
create policy "tradio_live_requests_insert" on public.tradio_live_requests for insert with check (auth.uid() = user_id);
drop policy if exists "tradio_live_requests_host_update" on public.tradio_live_requests;
create policy "tradio_live_requests_host_update" on public.tradio_live_requests for update
  using (public.tradio_is_session_host(session_id)) with check (public.tradio_is_session_host(session_id));

drop policy if exists "tradio_live_polls_select" on public.tradio_live_polls;
create policy "tradio_live_polls_select" on public.tradio_live_polls for select using (true);
drop policy if exists "tradio_live_polls_host_insert" on public.tradio_live_polls;
create policy "tradio_live_polls_host_insert" on public.tradio_live_polls for insert
  with check (auth.uid() = host_user_id and public.tradio_is_session_host(session_id));
drop policy if exists "tradio_live_polls_host_update" on public.tradio_live_polls;
create policy "tradio_live_polls_host_update" on public.tradio_live_polls for update
  using (public.tradio_is_session_host(session_id)) with check (public.tradio_is_session_host(session_id));

drop policy if exists "tradio_live_poll_votes_select" on public.tradio_live_poll_votes;
create policy "tradio_live_poll_votes_select" on public.tradio_live_poll_votes for select using (true);
drop policy if exists "tradio_live_poll_votes_insert" on public.tradio_live_poll_votes;
create policy "tradio_live_poll_votes_insert" on public.tradio_live_poll_votes for insert with check (auth.uid() = user_id);
drop policy if exists "tradio_live_poll_votes_update" on public.tradio_live_poll_votes;
create policy "tradio_live_poll_votes_update" on public.tradio_live_poll_votes for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

- [ ] **Step 2: Dry-run** — Run: `supabase db push --dry-run --linked` — Expected: lists `20260601050000_tradio_live_interaction.sql`.
- [ ] **Step 3: Apply** — Run: `printf 'y\n' | supabase db push --linked` — Expected: `Applying migration 20260601050000...` then `Finished`.
- [ ] **Step 4: Verify** (poll for schema cache, service-role `$KEY`):

```bash
for t in tradio_live_chat tradio_live_requests tradio_live_polls tradio_live_poll_votes; do
  for i in $(seq 1 10); do c=$(curl -s -o /dev/null -w "%{http_code}" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" "https://wcdwlqnfcsuaacbvdmgx.supabase.co/rest/v1/$t?select=id&limit=1"); [ "$c" = "200" ] && { echo "$t 200"; break; }; sleep 4; done
done
```

Expected: all four print `200`.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260601050000_tradio_live_interaction.sql
git commit -m "feat(tradio): live interaction tables (chat/requests/polls) + RLS"
```

---

## Task 2: Pure interaction logic (TDD)

**Files:**

- Create `src/tradio/components/tradio/liveInteractionLogic.ts`
- Test `src/tradio/components/tradio/liveInteractionLogic.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { computePollTallies, nextRequestStatus, type PollOption } from "./liveInteractionLogic";

const opts: PollOption[] = [
  { id: "a", label: "A" },
  { id: "b", label: "B" },
];

test("computePollTallies counts votes + percentages", () => {
  const t = computePollTallies(opts, [{ option_id: "a" }, { option_id: "a" }, { option_id: "b" }]);
  assert.deepEqual(t, [
    { optionId: "a", label: "A", count: 2, pct: 67 },
    { optionId: "b", label: "B", count: 1, pct: 33 },
  ]);
});
test("computePollTallies with no votes is 0%", () => {
  const t = computePollTallies(opts, []);
  assert.deepEqual(
    t.map((x) => x.pct),
    [0, 0],
  );
});
test("nextRequestStatus allows valid transitions", () => {
  assert.equal(nextRequestStatus("pending", "queue"), "queued");
  assert.equal(nextRequestStatus("pending", "decline"), "declined");
  assert.equal(nextRequestStatus("queued", "play"), "played");
  assert.equal(nextRequestStatus("queued", "decline"), "declined");
});
test("nextRequestStatus rejects invalid transitions", () => {
  assert.equal(nextRequestStatus("played", "queue"), null);
  assert.equal(nextRequestStatus("declined", "play"), null);
});
```

- [ ] **Step 2: Run it (fails)** — Run: `npx tsx --test src/tradio/components/tradio/liveInteractionLogic.test.ts` — Expected: FAIL (module missing).

- [ ] **Step 3: Implement `src/tradio/components/tradio/liveInteractionLogic.ts`**

```ts
export type PollOption = { id: string; label: string };
export type PollTally = { optionId: string; label: string; count: number; pct: number };
export type RequestStatus = "pending" | "queued" | "played" | "declined";
export type RequestAction = "queue" | "play" | "decline";

/** Count votes per option and compute integer percentages (of total votes). */
export function computePollTallies(
  options: PollOption[],
  votes: { option_id: string }[],
): PollTally[] {
  const total = votes.length;
  return options.map((o) => {
    const count = votes.filter((v) => v.option_id === o.id).length;
    const pct = total === 0 ? 0 : Math.round((count / total) * 100);
    return { optionId: o.id, label: o.label, count, pct };
  });
}

const TRANSITIONS: Record<RequestStatus, Partial<Record<RequestAction, RequestStatus>>> = {
  pending: { queue: "queued", decline: "declined" },
  queued: { play: "played", decline: "declined" },
  played: {},
  declined: {},
};

/** Returns the resulting status for an action, or null if the transition is not allowed. */
export function nextRequestStatus(
  current: RequestStatus,
  action: RequestAction,
): RequestStatus | null {
  return TRANSITIONS[current]?.[action] ?? null;
}
```

- [ ] **Step 4: Run it (passes)** — Run: `npx tsx --test src/tradio/components/tradio/liveInteractionLogic.test.ts` — Expected: 4 pass.
- [ ] **Step 5: Commit**

```bash
git add src/tradio/components/tradio/liveInteractionLogic.ts src/tradio/components/tradio/liveInteractionLogic.test.ts
git commit -m "feat(tradio): pure poll-tally + request-status logic"
```

---

## Task 3: `tradioLiveInteractionService`

**Files:** Create `src/tradio/components/tradio/tradioLiveInteractionService.ts`

- [ ] **Step 1: Create the service**

```ts
import { isSupabaseConfigured, supabase } from "@/tradio/lib/supabaseClient";
import { computePollTallies, type PollOption, type RequestStatus } from "./liveInteractionLogic";

export interface ChatMessage {
  id: string;
  userId: string;
  authorName: string | null;
  body: string;
  createdAt: string;
}
export interface SongRequest {
  id: string;
  userId: string;
  requesterName: string | null;
  songTitle: string;
  artist: string | null;
  message: string | null;
  status: RequestStatus;
  createdAt: string;
}
export interface LivePoll {
  id: string;
  sessionId: string;
  question: string;
  options: PollOption[];
  status: "open" | "closed";
}
export interface PollVote {
  option_id: string;
  user_id: string;
}

async function uid(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}
async function displayName(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  const m = data.user?.user_metadata as Record<string, unknown> | undefined;
  return (
    (m?.display_name as string) ||
    (m?.username as string) ||
    data.user?.email?.split("@")[0] ||
    "Listener"
  );
}

const ok = isSupabaseConfigured && supabase;

// ── Chat ──────────────────────────────────────────────────────────────────
export async function sendChat(sessionId: string, body: string): Promise<{ error: string | null }> {
  if (!ok) return { error: "Live chat needs Supabase." };
  const user = await uid();
  if (!user) return { error: "Sign in to chat." };
  const { error } = await supabase!.from("tradio_live_chat").insert({
    session_id: sessionId,
    user_id: user,
    author_name: await displayName(),
    body: body.trim(),
  });
  return { error: error?.message ?? null };
}
export async function listChat(sessionId: string): Promise<ChatMessage[]> {
  if (!ok) return [];
  const { data } = await supabase!
    .from("tradio_live_chat")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true })
    .limit(200);
  return (data ?? []).map((r: any) => ({
    id: r.id,
    userId: r.user_id,
    authorName: r.author_name,
    body: r.body,
    createdAt: r.created_at,
  }));
}

// ── Requests ──────────────────────────────────────────────────────────────
export async function submitRequest(input: {
  sessionId: string;
  songTitle: string;
  artist?: string;
  message?: string;
}): Promise<{ error: string | null }> {
  if (!ok) return { error: "Requests need Supabase." };
  const user = await uid();
  if (!user) return { error: "Sign in to request." };
  const { error } = await supabase!.from("tradio_live_requests").insert({
    session_id: input.sessionId,
    user_id: user,
    requester_name: await displayName(),
    song_title: input.songTitle.trim(),
    artist: input.artist?.trim() || null,
    message: input.message?.trim() || null,
  });
  return { error: error?.message ?? null };
}
export async function listRequests(sessionId: string): Promise<SongRequest[]> {
  if (!ok) return [];
  const { data } = await supabase!
    .from("tradio_live_requests")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true })
    .limit(200);
  return (data ?? []).map((r: any) => ({
    id: r.id,
    userId: r.user_id,
    requesterName: r.requester_name,
    songTitle: r.song_title,
    artist: r.artist,
    message: r.message,
    status: r.status,
    createdAt: r.created_at,
  }));
}
export async function setRequestStatus(requestId: string, status: RequestStatus): Promise<void> {
  if (!ok) return;
  await supabase!.from("tradio_live_requests").update({ status }).eq("id", requestId);
}

// ── Polls ─────────────────────────────────────────────────────────────────
export async function createPoll(input: {
  sessionId: string;
  question: string;
  options: PollOption[];
}): Promise<{ error: string | null }> {
  if (!ok) return { error: "Polls need Supabase." };
  const user = await uid();
  if (!user) return { error: "Sign in." };
  const { error } = await supabase!.from("tradio_live_polls").insert({
    session_id: input.sessionId,
    host_user_id: user,
    question: input.question.trim(),
    options: input.options,
    status: "open",
  });
  return { error: error?.message ?? null };
}
export async function closePoll(pollId: string): Promise<void> {
  if (!ok) return;
  await supabase!
    .from("tradio_live_polls")
    .update({ status: "closed", closed_at: new Date().toISOString() })
    .eq("id", pollId);
}
export async function getActivePoll(sessionId: string): Promise<LivePoll | null> {
  if (!ok) return null;
  const { data } = await supabase!
    .from("tradio_live_polls")
    .select("*")
    .eq("session_id", sessionId)
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    sessionId: data.session_id,
    question: data.question,
    options: Array.isArray(data.options) ? data.options : [],
    status: data.status,
  };
}
export async function votePoll(
  pollId: string,
  optionId: string,
): Promise<{ error: string | null }> {
  if (!ok) return { error: "Voting needs Supabase." };
  const user = await uid();
  if (!user) return { error: "Sign in to vote." };
  const { error } = await supabase!
    .from("tradio_live_poll_votes")
    .upsert(
      { poll_id: pollId, user_id: user, option_id: optionId },
      { onConflict: "poll_id,user_id" },
    );
  return { error: error?.message ?? null };
}
export async function listVotes(pollId: string): Promise<PollVote[]> {
  if (!ok) return [];
  const { data } = await supabase!
    .from("tradio_live_poll_votes")
    .select("option_id,user_id")
    .eq("poll_id", pollId);
  return (data ?? []) as PollVote[];
}

export { computePollTallies };
```

- [ ] **Step 2: Typecheck** — Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep "tradioLiveInteractionService" || echo clean` — Expected: `clean`.
- [ ] **Step 3: Commit**

```bash
git add src/tradio/components/tradio/tradioLiveInteractionService.ts
git commit -m "feat(tradio): tradioLiveInteractionService (chat/requests/polls data ops)"
```

---

## Task 4: `useTradioLiveInteraction` realtime hook

**Files:** Create `src/tradio/components/tradio/useTradioLiveInteraction.ts`

- [ ] **Step 1: Create the hook** (channel pattern from `ChatPanel.tsx`)

```ts
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/tradio/lib/supabaseClient";
import {
  sendChat,
  listChat,
  submitRequest,
  listRequests,
  setRequestStatus,
  createPoll,
  closePoll,
  getActivePoll,
  votePoll,
  listVotes,
  computePollTallies,
  type ChatMessage,
  type SongRequest,
  type LivePoll,
  type PollVote,
} from "./tradioLiveInteractionService";
import type { PollOption, PollTally, RequestStatus } from "./liveInteractionLogic";

export interface LiveInteraction {
  chat: ChatMessage[];
  requests: SongRequest[];
  activePoll: LivePoll | null;
  tallies: PollTally[];
  sendChat: (body: string) => Promise<{ error: string | null }>;
  submitRequest: (input: {
    songTitle: string;
    artist?: string;
    message?: string;
  }) => Promise<{ error: string | null }>;
  setRequestStatus: (requestId: string, status: RequestStatus) => Promise<void>;
  createPoll: (question: string, options: PollOption[]) => Promise<{ error: string | null }>;
  closePoll: () => Promise<void>;
  votePoll: (optionId: string) => Promise<{ error: string | null }>;
}

export function useTradioLiveInteraction(opts: { sessionId: string | null }): LiveInteraction {
  const { sessionId } = opts;
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [requests, setRequests] = useState<SongRequest[]>([]);
  const [activePoll, setActivePoll] = useState<LivePoll | null>(null);
  const [votes, setVotes] = useState<PollVote[]>([]);

  const reloadChat = useCallback(async () => {
    if (sessionId) setChat(await listChat(sessionId));
  }, [sessionId]);
  const reloadRequests = useCallback(async () => {
    if (sessionId) setRequests(await listRequests(sessionId));
  }, [sessionId]);
  const reloadPoll = useCallback(async () => {
    if (!sessionId) return;
    const poll = await getActivePoll(sessionId);
    setActivePoll(poll);
    setVotes(poll ? await listVotes(poll.id) : []);
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId || !supabase) return;
    void reloadChat();
    void reloadRequests();
    void reloadPoll();
    const ch = supabase
      .channel(`tradio-live:${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tradio_live_chat",
          filter: `session_id=eq.${sessionId}`,
        },
        () => void reloadChat(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tradio_live_requests",
          filter: `session_id=eq.${sessionId}`,
        },
        () => void reloadRequests(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tradio_live_polls",
          filter: `session_id=eq.${sessionId}`,
        },
        () => void reloadPoll(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tradio_live_poll_votes" },
        () => void reloadPoll(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [sessionId, reloadChat, reloadRequests, reloadPoll]);

  const tallies = activePoll ? computePollTallies(activePoll.options, votes) : [];

  return {
    chat,
    requests,
    activePoll,
    tallies,
    sendChat: (body) => sendChat(sessionId!, body),
    submitRequest: (input) => submitRequest({ sessionId: sessionId!, ...input }),
    setRequestStatus: (requestId, status) => setRequestStatus(requestId, status),
    createPoll: (question, options) => createPoll({ sessionId: sessionId!, question, options }),
    closePoll: async () => {
      if (activePoll) await closePoll(activePoll.id);
    },
    votePoll: (optionId) =>
      activePoll ? votePoll(activePoll.id, optionId) : Promise.resolve({ error: "No active poll" }),
  };
}
```

- [ ] **Step 2: Typecheck** — Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep "useTradioLiveInteraction" || echo clean` — Expected: `clean`.
- [ ] **Step 3: Commit**

```bash
git add src/tradio/components/tradio/useTradioLiveInteraction.ts
git commit -m "feat(tradio): useTradioLiveInteraction realtime hook"
```

---

## Task 5: Listener `LiveRoomModal` + open from the LIVE bar

**Files:**

- Create `src/tradio/components/tradio/LiveRoomModal.tsx`
- Modify `src/tradio/components/tradio/TradioLiveNowBar.tsx`

- [ ] **Step 1: Create the modal**

```tsx
import { useState } from "react";
import { X, Send, Radio, Music2 } from "lucide-react";
import { useTradioLiveInteraction } from "./useTradioLiveInteraction";

/** Full-screen listener room layered over the bar's existing audio connection. */
export function LiveRoomModal({
  sessionId,
  title,
  hostName,
  listenerCount,
  onClose,
}: {
  sessionId: string;
  title: string;
  hostName: string;
  listenerCount: number;
  onClose: () => void;
}) {
  const live = useTradioLiveInteraction({ sessionId });
  const [chatBody, setChatBody] = useState("");
  const [song, setSong] = useState("");
  const [artist, setArtist] = useState("");

  const send = async () => {
    if (!chatBody.trim()) return;
    const r = await live.sendChat(chatBody);
    if (!r.error) setChatBody("");
  };
  const request = async () => {
    if (!song.trim()) return;
    const r = await live.submitRequest({ songTitle: song, artist });
    if (!r.error) {
      setSong("");
      setArtist("");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#050508]/98 backdrop-blur-3xl animate-fade-in">
      <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col p-4">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-pink-500" />
            </span>
            <div className="min-w-0">
              <div className="truncate text-base font-black text-white">{title}</div>
              <div className="truncate text-[11px] text-white/55">
                {hostName} · ON AIR · {listenerCount} listening
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 place-items-center rounded-full border border-white/15 text-white/80 hover:bg-white/5"
          >
            <X className="size-4" />
          </button>
        </div>

        {live.activePoll && (
          <div className="mt-2 rounded-2xl border border-purple-400/30 bg-purple-500/10 p-3">
            <div className="text-sm font-bold text-white">{live.activePoll.question}</div>
            <div className="mt-2 space-y-1.5">
              {live.tallies.map((t) => (
                <button
                  key={t.optionId}
                  onClick={() => live.votePoll(t.optionId)}
                  className="relative block w-full overflow-hidden rounded-xl border border-white/10 px-3 py-2 text-left text-xs text-white"
                >
                  <span
                    className="absolute inset-y-0 left-0 bg-purple-500/25"
                    style={{ width: `${t.pct}%` }}
                  />
                  <span className="relative flex justify-between">
                    <span>{t.label}</span>
                    <span className="tabular-nums text-white/70">{t.pct}%</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3 flex-1 space-y-2 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.02] p-3">
          {live.chat.length === 0 ? (
            <div className="py-8 text-center text-sm text-white/40">
              Be the first to say something.
            </div>
          ) : (
            live.chat.map((c) => (
              <div key={c.id} className="text-sm">
                <span className="font-bold text-cyan-300">{c.authorName || "Listener"}</span>{" "}
                <span className="text-white/85">{c.body}</span>
              </div>
            ))
          )}
        </div>

        <div className="mt-2 flex items-center gap-2">
          <input
            value={chatBody}
            onChange={(e) => setChatBody(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Say something…"
            className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50"
          />
          <button
            onClick={send}
            className="grid size-9 place-items-center rounded-xl bg-cyan-500 text-black"
          >
            <Send className="size-4" />
          </button>
        </div>

        <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-2">
          <Music2 className="size-4 shrink-0 text-fuchsia-300" />
          <input
            value={song}
            onChange={(e) => setSong(e.target.value)}
            placeholder="Request a song"
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
          />
          <input
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Artist (optional)"
            className="min-w-0 w-28 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
          />
          <button
            onClick={request}
            className="shrink-0 rounded-xl border border-fuchsia-400/40 bg-fuchsia-500/15 px-3 py-1.5 text-xs font-bold text-fuchsia-100"
          >
            <Radio className="mr-1 inline size-3.5" />
            Request
          </button>
        </div>
      </div>
    </div>
  );
}

export default LiveRoomModal;
```

- [ ] **Step 2: Open it from the LIVE bar**

In `TradioLiveNowBar.tsx`: add `import { LiveRoomModal } from './LiveRoomModal';` and a `const [roomOpen, setRoomOpen] = useState(false);`. Change the "Listen Live" button's `onClick` from `() => top && setTunedSessionId(top.id)` to `() => { if (top) { setTunedSessionId(top.id); setRoomOpen(true); } }`. Change the "Leave" button's `onClick` to also `setRoomOpen(false)`. Before the component's closing `</div>` (the outer wrapper), render:

```tsx
{
  roomOpen && tunedSessionId && (
    <LiveRoomModal
      sessionId={tunedSessionId}
      title={(tuned ?? top)?.title || "Live on Tradio"}
      hostName={(tuned ?? top)?.hostName || "Host"}
      listenerCount={live.listenerCount}
      onClose={() => setRoomOpen(false)}
    />
  );
}
```

- [ ] **Step 3: Typecheck** — Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep -E "LiveRoomModal|TradioLiveNowBar" || echo clean` — Expected: `clean`.
- [ ] **Step 4: Commit**

```bash
git add src/tradio/components/tradio/LiveRoomModal.tsx src/tradio/components/tradio/TradioLiveNowBar.tsx
git commit -m "feat(tradio): listener Live Room modal (chat/request/poll over the live audio)"
```

---

## Task 6: Host interaction panel in DJStudio Broadcast tab

**Files:** Modify `src/tradio/components/tradio/screens/DJStudio.tsx`

- [ ] **Step 1: Imports + hook**

Add `import { useTradioLiveInteraction } from '../useTradioLiveInteraction';` and (if not present) `import { useState } from 'react';` is already imported. In the component, add (it already has `liveSessionId` from #2):

```ts
const interaction = useTradioLiveInteraction({ sessionId: liveSessionId });
const [pollQuestion, setPollQuestion] = useState("");
const [pollOptions, setPollOptions] = useState("Yes\nNo");
```

- [ ] **Step 2: Render the host panel** — inside the `{tab === 'broadcast' && (` block, add a new `GlassCard` after the existing "Active Broadcast Desk" / "Broadcast Blocks" grid, rendered only when live:

```tsx
{
  liveSessionId && (
    <div className="px-4 sm:px-6 lg:px-10">
      <GlassCard className="p-4 space-y-4">
        <div className="text-sm font-semibold text-white">Live Room</div>
        {/* Chat */}
        <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-2xl border border-white/8 bg-white/[0.02] p-3">
          {interaction.chat.length === 0 ? (
            <div className="py-4 text-center text-xs text-white/40">No chat yet.</div>
          ) : (
            interaction.chat.map((c) => (
              <div key={c.id} className="text-xs">
                <span className="font-bold text-cyan-300">{c.authorName || "Listener"}</span>{" "}
                <span className="text-white/80">{c.body}</span>
              </div>
            ))
          )}
        </div>
        {/* Request queue */}
        <div>
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-white/50">
            Request Queue
          </div>
          <div className="space-y-2">
            {interaction.requests
              .filter((r) => r.status !== "declined")
              .map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] p-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-white">
                      {r.songTitle}
                      {r.artist ? ` — ${r.artist}` : ""}
                    </div>
                    <div className="truncate text-[11px] text-white/45">
                      {r.requesterName || "Listener"} · {r.status}
                    </div>
                  </div>
                  {r.status === "pending" && (
                    <button
                      onClick={() => interaction.setRequestStatus(r.id, "queued")}
                      className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-2 py-1 text-[11px] font-bold text-cyan-200"
                    >
                      Queue
                    </button>
                  )}
                  {r.status === "queued" && (
                    <button
                      onClick={() => interaction.setRequestStatus(r.id, "played")}
                      className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-[11px] font-bold text-emerald-200"
                    >
                      Played
                    </button>
                  )}
                  <button
                    onClick={() => interaction.setRequestStatus(r.id, "declined")}
                    className="rounded-lg border border-white/10 px-2 py-1 text-[11px] text-white/60"
                  >
                    Decline
                  </button>
                </div>
              ))}
            {interaction.requests.filter((r) => r.status !== "declined").length === 0 && (
              <div className="text-xs text-white/40">No requests yet.</div>
            )}
          </div>
        </div>
        {/* Poll */}
        <div>
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-white/50">Poll</div>
          {interaction.activePoll ? (
            <div className="space-y-1.5">
              <div className="text-sm font-semibold text-white">
                {interaction.activePoll.question}
              </div>
              {interaction.tallies.map((t) => (
                <div
                  key={t.optionId}
                  className="relative overflow-hidden rounded-xl border border-white/10 px-3 py-1.5 text-xs text-white"
                >
                  <span
                    className="absolute inset-y-0 left-0 bg-purple-500/25"
                    style={{ width: `${t.pct}%` }}
                  />
                  <span className="relative flex justify-between">
                    <span>{t.label}</span>
                    <span className="tabular-nums text-white/70">
                      {t.count} · {t.pct}%
                    </span>
                  </span>
                </div>
              ))}
              <button
                onClick={() => interaction.closePoll()}
                className="mt-1 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold text-white/70"
              >
                Close poll
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Poll question"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
              />
              <textarea
                value={pollOptions}
                onChange={(e) => setPollOptions(e.target.value)}
                placeholder="One option per line"
                className="h-16 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
              />
              <button
                onClick={() => {
                  const opts = pollOptions
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .slice(0, 4)
                    .map((label, i) => ({ id: `o${i}`, label }));
                  if (pollQuestion.trim() && opts.length >= 2) {
                    interaction.createPoll(pollQuestion.trim(), opts);
                    setPollQuestion("");
                    setPollOptions("Yes\nNo");
                  }
                }}
                className="rounded-lg border border-purple-400/40 bg-purple-500/15 px-3 py-1.5 text-xs font-bold text-purple-100"
              >
                Launch poll
              </button>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck** — Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep "DJStudio" || echo clean` — Expected: `clean`.
- [ ] **Step 4: Commit**

```bash
git add src/tradio/components/tradio/screens/DJStudio.tsx
git commit -m "feat(tradio): DJStudio host live-room panel (chat/request queue/polls)"
```

---

## Task 7: Verification

- [ ] **Step 1: Unit tests** — Run: `npx tsx --test src/tradio/components/tradio/liveInteractionLogic.test.ts` — Expected: 4/4 pass.
- [ ] **Step 2: Touched-files typecheck** — Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep -E "liveInteractionLogic|tradioLiveInteractionService|useTradioLiveInteraction|LiveRoomModal|TradioLiveNowBar|DJStudio" || echo "ALL TOUCHED FILES CLEAN"` — Expected: `ALL TOUCHED FILES CLEAN`.
- [ ] **Step 3: Module-load smoke** (dev server running) — `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/src/tradio/components/tradio/useTradioLiveInteraction.ts` and `.../LiveRoomModal.tsx` — Expected: `200`.
- [ ] **Step 4: Manual two-client smoke** (LiveKit + Supabase env) — host live in DJStudio; listener opens the Live Room from the LIVE bar → sends chat (host sees it live) → requests a song (appears in host queue → host taps Played) → host launches a poll → listener votes → both tally bars update live.

---

## Self-review notes

- **Spec coverage:** tables + RLS (Task 1, host-only request/poll writes via `tradio_is_session_host`), pure tally/transition logic (Task 2), data ops (Task 3), realtime hook (Task 4), listener Live Room with chat/request/poll (Task 5), host chat feed + request queue + poll controls (Task 6), verification (Task 7). Covered.
- **Out of scope:** AI moderation, co-pilot (#5), reactions, replay, signed-out participation.
- **Type consistency:** `PollOption`/`RequestStatus`/`computePollTallies`/`nextRequestStatus` (Task 2) used in Tasks 3/4; service exports (`sendChat`, `listChat`, `submitRequest`, `listRequests`, `setRequestStatus`, `createPoll`, `closePoll`, `getActivePoll`, `votePoll`, `listVotes`, `ChatMessage`, `SongRequest`, `LivePoll`, `PollVote`) consumed by Task 4; `useTradioLiveInteraction` (Task 4) used in Tasks 5/6; `LiveRoomModal` (Task 5) consumed by `TradioLiveNowBar`; `liveSessionId` (from #2) reused in Task 6.
- **Env caveat:** realtime needs Supabase configured; broadcasting needs LiveKit creds (from #2).

```

```

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { creators } from "@/lib/mock-data";

export type MsgStatus = "sent" | "delivered" | "read";

export type Message = {
  id: string;
  threadId: string;
  from: "me" | "them";
  text: string;
  ts: number;
  status: MsgStatus;
  reactions?: string[];
};

export type Peer = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  verified?: "creator" | "user";
  online?: boolean;
};

type ThreadMeta = {
  id: string;            // peer handle
  peer: Peer;
  pinned?: boolean;
  lastReadAt: number;    // their lastReadAt for messages from me
  myLastReadAt: number;  // my lastReadAt for messages from them
};

type Ctx = {
  threads: ThreadMeta[];
  messagesOf: (threadId: string) => Message[];
  unreadOf: (threadId: string) => number;
  totalUnread: number;
  send: (threadId: string, text: string) => void;
  openThread: (peer: Peer) => string; // returns threadId
  markRead: (threadId: string) => void;
  ensureFromHandle: (handle: string) => string | null;
};

const C = createContext<Ctx | null>(null);
const KEY = "treytv_messages_v1";

const SEED_PEERS: Peer[] = creators.slice(0, 5).map((c, i) => ({
  id: c.id,
  name: c.name,
  handle: c.handle,
  avatar: c.avatar as unknown as string,
  verified: c.verified,
  online: i < 2,
}));

const now = Date.now();
const SEED_THREADS: ThreadMeta[] = SEED_PEERS.map((p, i) => ({
  id: p.handle,
  peer: p,
  pinned: i === 0,
  lastReadAt: 0,
  myLastReadAt: i > 1 ? now : 0,
}));

const SEED_MSGS: Message[] = [
  { id: "sm1", threadId: SEED_PEERS[0].handle, from: "them", text: "Yooo just watched the BTS — that lighting setup is unreal 🔥", ts: now - 1000 * 60 * 18, status: "read" },
  { id: "sm2", threadId: SEED_PEERS[0].handle, from: "me",   text: "Appreciate it 🙏 took 4 hours to dial the rig", ts: now - 1000 * 60 * 17, status: "read" },
  { id: "sm3", threadId: SEED_PEERS[0].handle, from: "them", text: "Reels swap? I'll plug your show on my channel tomorrow", ts: now - 1000 * 60 * 4, status: "read" },
  { id: "sm4", threadId: SEED_PEERS[1].handle, from: "them", text: "Just dropped a new beat — wanna preview?", ts: now - 1000 * 60 * 12, status: "read" },
  { id: "sm5", threadId: SEED_PEERS[2].handle, from: "them", text: "voice memo about the moodboard ✨", ts: now - 1000 * 60 * 60, status: "read" },
];

function uid() {
  return (typeof crypto !== "undefined" && crypto.randomUUID?.()) || `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function MessagesProvider({ children }: { children: ReactNode }) {
  const [threads, setThreads] = useState<ThreadMeta[]>(SEED_THREADS);
  const [messages, setMessages] = useState<Message[]>(SEED_MSGS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (Array.isArray(p.threads)) setThreads(p.threads);
        if (Array.isArray(p.messages)) setMessages(p.messages);
      }
    } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(KEY, JSON.stringify({ threads, messages })); } catch {}
  }, [threads, messages, hydrated]);

  const messagesOf: Ctx["messagesOf"] = (id) =>
    messages.filter((m) => m.threadId === id).sort((a, b) => a.ts - b.ts);

  const unreadOf: Ctx["unreadOf"] = (id) => {
    const t = threads.find((x) => x.id === id);
    if (!t) return 0;
    return messages.filter((m) => m.threadId === id && m.from === "them" && m.ts > t.myLastReadAt).length;
  };

  const totalUnread = useMemo(
    () => threads.reduce((s, t) => s + messages.filter((m) => m.threadId === t.id && m.from === "them" && m.ts > t.myLastReadAt).length, 0),
    [threads, messages]
  );

  const markRead: Ctx["markRead"] = (id) => {
    setThreads((s) => s.map((t) => t.id === id ? { ...t, myLastReadAt: Date.now() } : t));
  };

  const openThread: Ctx["openThread"] = (peer) => {
    setThreads((s) => s.find((t) => t.id === peer.handle) ? s : [{ id: peer.handle, peer, lastReadAt: 0, myLastReadAt: Date.now() }, ...s]);
    return peer.handle;
  };

  const ensureFromHandle: Ctx["ensureFromHandle"] = (handle) => {
    const existing = threads.find((t) => t.id === handle);
    if (existing) return existing.id;
    const c = creators.find((c) => c.handle === handle);
    if (!c) return null;
    const peer: Peer = { id: c.id, name: c.name, handle: c.handle, avatar: c.avatar as unknown as string, verified: c.verified, online: false };
    setThreads((s) => [{ id: handle, peer, lastReadAt: 0, myLastReadAt: Date.now() }, ...s]);
    return handle;
  };

  const send: Ctx["send"] = (threadId, text) => {
    if (!text.trim()) return;
    const id = uid();
    const ts = Date.now();
    setMessages((s) => [...s, { id, threadId, from: "me", text: text.trim(), ts, status: "sent" }]);
    // Simulate recipient receiving + reading + replying.
    setTimeout(() => {
      setMessages((s) => s.map((m) => m.id === id ? { ...m, status: "delivered" } : m));
    }, 600);
    setTimeout(() => {
      setMessages((s) => s.map((m) => m.id === id ? { ...m, status: "read" } : m));
      setThreads((s) => s.map((t) => t.id === threadId ? { ...t, lastReadAt: Date.now() } : t));
    }, 1800);
    // Simulated reply for demo realism (only first time after my send & if no reply already pending shortly).
    setTimeout(() => {
      const replies = ["🔥", "On it!", "Love that.", "Say less — I'm in.", "Drop the link!", "Catch you in DMs later 👀"];
      const text2 = replies[Math.floor(Math.random() * replies.length)];
      setMessages((s) => [...s, { id: uid(), threadId, from: "them", text: text2, ts: Date.now(), status: "read" }]);
    }, 2800);
  };

  return (
    <C.Provider value={{ threads, messagesOf, unreadOf, totalUnread, send, openThread, markRead, ensureFromHandle }}>
      {children}
    </C.Provider>
  );
}

export function useMessages() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useMessages must be inside <MessagesProvider>");
  return ctx;
}
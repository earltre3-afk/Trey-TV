import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { creators } from "@/lib/mock-data";
import { useAuth as useSupabaseAuth } from "@/hooks/use-auth";
import { createBrowserClient } from "@/lib/supabase-browser";
import { toast } from "sonner";

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
  id: string;            
  peer: Peer;
  pinned?: boolean;
  lastReadAt: number;    
  myLastReadAt: number;  
};

type Ctx = {
  threads: ThreadMeta[];
  messagesOf: (threadId: string) => Message[];
  unreadOf: (threadId: string) => number;
  totalUnread: number;
  send: (threadId: string, text: string) => void;
  openThread: (peer: Peer) => string;
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
  id: p.id,
  peer: p,
  pinned: i === 0,
  lastReadAt: 0,
  myLastReadAt: i > 1 ? now : 0,
}));

const SEED_MSGS: Message[] = [
  { id: "sm1", threadId: SEED_PEERS[0].id, from: "them", text: "Yooo just watched the BTS — that lighting setup is unreal 🔥", ts: now - 1000 * 60 * 18, status: "read" },
  { id: "sm2", threadId: SEED_PEERS[0].id, from: "me",   text: "Appreciate it 🙏 took 4 hours to dial the rig", ts: now - 1000 * 60 * 17, status: "read" },
  { id: "sm3", threadId: SEED_PEERS[0].id, from: "them", text: "Reels swap? I'll plug your show on my channel tomorrow", ts: now - 1000 * 60 * 4, status: "read" },
  { id: "sm4", threadId: SEED_PEERS[1].id, from: "them", text: "Just dropped a new beat — wanna preview?", ts: now - 1000 * 60 * 12, status: "read" },
  { id: "sm5", threadId: SEED_PEERS[2].id, from: "them", text: "voice memo about the moodboard ✨", ts: now - 1000 * 60 * 60, status: "read" },
];

function uid() {
  return (typeof crypto !== "undefined" && crypto.randomUUID?.()) || `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

export function MessagesProvider({ children }: { children: ReactNode }) {
  const [threads, setThreads] = useState<ThreadMeta[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const { user: supabaseUser } = useSupabaseAuth();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (Array.isArray(p.threads)) setThreads(p.threads);
        if (Array.isArray(p.messages)) setMessages(p.messages);
      } else {
        setThreads(SEED_THREADS);
        setMessages(SEED_MSGS);
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { 
      const localThreads = threads.filter(t => !isUUID(t.id));
      const localMsgs = messages.filter(m => !isUUID(m.threadId));
      localStorage.setItem(KEY, JSON.stringify({ threads: localThreads, messages: localMsgs })); 
    } catch {}
  }, [threads, messages, hydrated]);

  useEffect(() => {
    if (!supabaseUser) return;
    
    let mounted = true;
    const fetchConversations = async () => {
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from("direct_messages")
        .select(`
          id, sender_id, recipient_id, body, read_at, created_at,
          sender:sender_id ( id, display_name, username, avatar_url, verification_type ),
          recipient:recipient_id ( id, display_name, username, avatar_url, verification_type )
        `)
        .or(`sender_id.eq.${supabaseUser.id},recipient_id.eq.${supabaseUser.id}`)
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) {
        console.error("Failed to fetch DMs:", error);
        return;
      }

      if (mounted && data) {
        const peerThreads = new Map<string, ThreadMeta>();
        const dbMsgs: Message[] = [];

        for (const rawRow of data as any[]) {
          const row = rawRow;
          const isMeSender = row.sender_id === supabaseUser.id;
          const peerId = isMeSender ? row.recipient_id : row.sender_id;
          const peerProfile = isMeSender ? row.recipient : row.sender;

          if (!peerThreads.has(peerId)) {
            peerThreads.set(peerId, {
              id: peerId,
              peer: {
                id: peerProfile?.id || peerId,
                name: peerProfile?.display_name || "Unknown",
                handle: peerProfile?.username || "unknown",
                avatar: peerProfile?.avatar_url || "",
                verified: peerProfile?.verification_type === "creator" ? "creator" : "user",
              },
              lastReadAt: 0,
              myLastReadAt: 0,
            });
          }

          const tMeta = peerThreads.get(peerId)!;
          
          let status: MsgStatus = "delivered";
          if (row.read_at) status = "read";
          else if (isMeSender) status = "sent";

          dbMsgs.push({
            id: row.id,
            threadId: peerId,
            from: isMeSender ? "me" : "them",
            text: row.body,
            ts: new Date(row.created_at).getTime(),
            status,
          });
        }

        setThreads(prev => {
          const locals = prev.filter(t => !isUUID(t.id));
          return [...Array.from(peerThreads.values()), ...locals];
        });
        setMessages(prev => {
          const locals = prev.filter(m => !isUUID(m.threadId));
          return [...dbMsgs.sort((a,b) => a.ts - b.ts), ...locals];
        });
      }
    };

    fetchConversations();
    return () => { mounted = false; };
  }, [supabaseUser?.id]);

  const outThreads = supabaseUser ? threads : [];
  const outMessages = supabaseUser ? messages : [];

  const messagesOf: Ctx["messagesOf"] = (id) =>
    outMessages.filter((m) => m.threadId === id).sort((a, b) => a.ts - b.ts);

  const unreadOf: Ctx["unreadOf"] = (id) => {
    return outMessages.filter((m) => m.threadId === id && m.from === "them" && m.status !== "read").length;
  };

  const totalUnread = useMemo(
    () => outThreads.reduce((s, t) => s + outMessages.filter((m) => m.threadId === t.id && m.from === "them" && m.status !== "read").length, 0),
    [outThreads, outMessages]
  );

  const markRead: Ctx["markRead"] = async (id) => {
    if (!supabaseUser) return;
    setMessages(s => s.map(m => m.threadId === id && m.from === "them" ? { ...m, status: "read" } : m));
    setThreads(s => s.map(t => t.id === id ? { ...t, myLastReadAt: Date.now() } : t));

    if (isUUID(id)) {
      const supabase = createBrowserClient() as any;
      const { error } = await supabase
        .from("direct_messages")
        .update({ read_at: new Date().toISOString() })
        .eq("sender_id", id)
        .eq("recipient_id", supabaseUser.id)
        .is("read_at", null);
        
      if (error) console.error("Failed to mark read:", error);
    }
  };

  const openThread: Ctx["openThread"] = (peer) => {
    setThreads((s) => s.find((t) => t.id === peer.id) ? s : [{ id: peer.id, peer, lastReadAt: 0, myLastReadAt: Date.now() }, ...s]);
    return peer.id;
  };

  const ensureFromHandle: Ctx["ensureFromHandle"] = (handle) => {
    const existing = threads.find((t) => t.peer.handle === handle);
    if (existing) return existing.id;
    
    const c = creators.find((c) => c.handle === handle);
    if (c) {
      const peer: Peer = { id: c.id, name: c.name, handle: c.handle, avatar: c.avatar as string, verified: c.verified, online: false };
      setThreads((s) => [{ id: c.id, peer, lastReadAt: 0, myLastReadAt: Date.now() }, ...s]);
      return c.id;
    }

    if (supabaseUser) {
      const supabase = createBrowserClient();
      supabase.from("profiles").select("id, display_name, username, avatar_url, verification_type").eq("username", handle).single().then(({data}) => {
        if (data) {
          const p = data as any;
          const peer: Peer = {
            id: p.id,
            name: p.display_name || handle,
            handle: p.username || handle,
            avatar: p.avatar_url || "",
            verified: p.verification_type === "creator" ? "creator" : "user",
            online: false
          };
          setThreads(s => {
            const filtered = s.filter(t => t.id !== handle);
            return [{ id: peer.id, peer, lastReadAt: 0, myLastReadAt: Date.now() }, ...filtered];
          });
        }
      });
    }

    const tempPeer: Peer = { id: handle, name: handle, handle, avatar: "", online: false };
    setThreads((s) => [{ id: handle, peer: tempPeer, lastReadAt: 0, myLastReadAt: Date.now() }, ...s]);
    return handle;
  };

  const send: Ctx["send"] = async (threadId, text) => {
    if (!text.trim()) return;
    if (!supabaseUser) {
      toast.error("Please sign in to send messages");
      return;
    }

    const localId = uid();
    const ts = Date.now();
    setMessages((s) => [...s, { id: localId, threadId, from: "me", text: text.trim(), ts, status: "sent" }]);

    if (isUUID(threadId)) {
      const supabase = createBrowserClient() as any;
      const { data, error } = await supabase
        .from("direct_messages")
        .insert({
          sender_id: supabaseUser.id,
          recipient_id: threadId,
          body: text.trim(),
          message_type: "text"
        })
        .select("id")
        .single();

      if (error) {
        console.error("Failed to send message:", error);
        toast.error("Failed to send message");
        setMessages((s) => s.filter((m) => m.id !== localId));
      } else if (data) {
        setMessages((s) => s.map((m) => m.id === localId ? { ...m, id: (data as any).id, status: "delivered" } : m));
      }
    } else {
      setTimeout(() => setMessages((s) => s.map((m) => m.id === localId ? { ...m, status: "delivered" } : m)), 600);
      setTimeout(() => setMessages((s) => s.map((m) => m.id === localId ? { ...m, status: "read" } : m)), 1800);
    }
  };

  return (
    <C.Provider value={{ threads: outThreads, messagesOf, unreadOf, totalUnread, send, openThread, markRead, ensureFromHandle }}>
      {children}
    </C.Provider>
  );
}

export function useMessages() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useMessages must be inside <MessagesProvider>");
  return ctx;
}
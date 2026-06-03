import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { creators } from "@/lib/mock-data";
import { useAuth as useSupabaseAuth } from "@/hooks/use-auth";
import { useCurrentUser } from "@/hooks/use-current-user";
import { createBrowserClient } from "@/lib/supabase-browser";
import { createMessageMediaUrl, uploadMessageMedia } from "@/lib/supabase-storage";
import { toast } from "sonner";
import type { FwdGifPayload } from "@/lib/fwd/picker";

export type MsgStatus = "sent" | "delivered" | "read";

export type Message = {
  id: string;
  threadId: string;
  from: "me" | "them";
  text: string;
  ts: number;
  status: MsgStatus;
  reactions?: string[];
  // Ghost message — self-deletes if unread after expiresAt
  ghostExpiresAt?: number; // unix ms timestamp
  ghostLabel?: string; // "30s" | "5 min" | "1 Day"
  // Media
  mediaUrl?: string;
  mediaType?: "image" | "video";
  // Voice note
  voiceUrl?: string;
  voiceDuration?: number; // seconds
  // FWD GIF attachment
  isGif?: boolean;
  gifFwdId?: string;
  gifPosterUrl?: string;
  gifTitle?: string;
  // Collaboration proposals
  isCollabProposal?: boolean;
  collabType?: "Remix" | "Vocal Feature" | "Collab Track" | "Beat Production";
  collabPitch?: string;
  collabSplit?: number;
  collabBeatName?: string;
  collabStatus?: "pending" | "accepted" | "declined";
  // Scheduled replies
  isScheduledReply?: boolean;
  scheduledTime?: number;
  scheduledText?: string;
  scheduledStatus?: "pending" | "sent" | "cancelled";
};

export type Peer = {
  id: string;
  publicProfileUid?: string | null;
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
  sendGhost: (threadId: string, text: string, durationSecs: number, label: string) => void;
  sendMedia: (threadId: string, file: File) => Promise<void>;
  sendFwdGif: (threadId: string, gif: FwdGifPayload, text?: string) => Promise<void>;
  sendVoice: (threadId: string, blob: Blob, durationSecs: number) => Promise<void>;
  openThread: (peer: Peer) => string;
  markRead: (threadId: string) => void;
  ensureFromHandle: (handle: string) => string | null;
  sendCollabProposal: (
    threadId: string,
    input: {
      collabType: "Remix" | "Vocal Feature" | "Collab Track" | "Beat Production";
      pitch: string;
      split: number;
      beatName?: string;
    },
  ) => void;
  sendScheduledReply: (threadId: string, text: string, timeLabel: string, delayMs: number) => void;
  respondToCollab: (messageId: string, status: "accepted" | "declined") => void;
  cancelScheduledReply: (messageId: string) => void;
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
  {
    id: "sm1",
    threadId: SEED_PEERS[0].id,
    from: "them",
    text: "Yooo just watched the BTS — that lighting setup is unreal 🔥",
    ts: now - 1000 * 60 * 18,
    status: "read",
  },
  {
    id: "sm2",
    threadId: SEED_PEERS[0].id,
    from: "me",
    text: "Appreciate it 🙏 took 4 hours to dial the rig",
    ts: now - 1000 * 60 * 17,
    status: "read",
  },
  {
    id: "sm3",
    threadId: SEED_PEERS[0].id,
    from: "them",
    text: "Reels swap? I'll plug your show on my channel tomorrow",
    ts: now - 1000 * 60 * 4,
    status: "read",
  },
  {
    id: "sm4",
    threadId: SEED_PEERS[1].id,
    from: "them",
    text: "Just dropped a new beat — wanna preview?",
    ts: now - 1000 * 60 * 12,
    status: "read",
  },
  {
    id: "sm5",
    threadId: SEED_PEERS[2].id,
    from: "them",
    text: "voice memo about the moodboard ✨",
    ts: now - 1000 * 60 * 60,
    status: "read",
  },
];

function uid() {
  return (
    (typeof crypto !== "undefined" && crypto.randomUUID?.()) ||
    `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );
}

const isUUID = (str: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

const getSupabaseUserId = (user: { id?: string } | null | undefined): string | null =>
  user?.id && isUUID(user.id) ? user.id : null;

function parseCollabProposal(body: string) {
  const isCollab =
    body.startsWith("[COLLAB_PROPOSAL]") ||
    body.startsWith("[COLLAB_PROPOSAL_ACCEPTED]") ||
    body.startsWith("[COLLAB_PROPOSAL_DECLINED]");
  if (!isCollab) return null;

  let collabStatus: "pending" | "accepted" | "declined" = "pending";
  if (body.startsWith("[COLLAB_PROPOSAL_ACCEPTED]")) collabStatus = "accepted";
  if (body.startsWith("[COLLAB_PROPOSAL_DECLINED]")) collabStatus = "declined";

  // Parse collabType
  const typeMatch = body.match(/proposal for a (.*?)(!| Pitch:)/);
  const collabType = typeMatch ? typeMatch[1] : "song";

  // Parse pitch
  const pitchMatch = body.match(/Pitch: "(.*?)"/);
  const collabPitch = pitchMatch ? pitchMatch[1] : "";

  // Parse splits
  const splitMatch = body.match(/Splits: (.*?)(%| \|)/);
  const collabSplit = splitMatch ? Number(splitMatch[1]) : 50;

  // Parse beatName
  const beatMatch = body.match(/Beat: (.*?)$/);
  const collabBeatName = beatMatch ? beatMatch[1] : undefined;

  return {
    isCollabProposal: true,
    collabStatus,
    collabType: collabType as any,
    collabPitch,
    collabSplit,
    collabBeatName,
  };
}

function parseScheduledReply(body: string) {
  const isScheduled =
    body.startsWith("[SCHEDULED_REPLY]") ||
    body.startsWith("[SCHEDULED_REPLY_SENT]") ||
    body.startsWith("[SCHEDULED_REPLY_CANCELLED]");
  if (!isScheduled) return null;

  let scheduledStatus: "pending" | "sent" | "cancelled" = "pending";
  if (body.startsWith("[SCHEDULED_REPLY_SENT]")) scheduledStatus = "sent";
  if (body.startsWith("[SCHEDULED_REPLY_CANCELLED]")) scheduledStatus = "cancelled";

  const timeMatch = body.match(/\[time:\s*(\d+)\]/);
  const scheduledTime = timeMatch ? Number(timeMatch[1]) : Date.now();

  const textMatch = body.match(/:\s*"(.*?)"$/);
  const scheduledText = textMatch ? textMatch[1] : "";

  return {
    isScheduledReply: true,
    scheduledStatus,
    scheduledTime,
    scheduledText,
  };
}

export function MessagesProvider({ children }: { children: ReactNode }) {
  const [threads, setThreads] = useState<ThreadMeta[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const { user: supabaseUser } = useSupabaseAuth();
  const supabaseUserId = getSupabaseUserId(supabaseUser);
  const currentProfile = useCurrentUser();
  const storageKey = `${KEY}:${currentProfile.uid}`;

  const setupScheduledTimeout = useCallback(
    (msgId: string, threadId: string, text: string, delayMs: number) => {
      setTimeout(() => {
        setMessages((currentMsgs) => {
          const item = currentMsgs.find((m) => m.id === msgId);
          if (item && item.scheduledStatus === "pending") {
            const updated = currentMsgs.map((m) =>
              m.id === msgId ? { ...m, scheduledStatus: "sent" as const } : m,
            );
            const realId = uid();

            if (isUUID(threadId) && supabaseUserId) {
              const supabase = createBrowserClient() as any;
              const updatedBody = item.text.replace("[SCHEDULED_REPLY]", "[SCHEDULED_REPLY_SENT]");
              void supabase.from("direct_messages").update({ body: updatedBody }).eq("id", msgId);

              void supabase.from("direct_messages").insert({
                sender_id: supabaseUserId,
                recipient_id: threadId,
                body: text,
                message_type: "text",
              });
            }

            return [
              ...updated,
              {
                id: realId,
                threadId,
                from: "me",
                text,
                ts: Date.now(),
                status: "sent",
              },
            ];
          }
          return currentMsgs;
        });
      }, delayMs);
    },
    [supabaseUserId],
  );

  // Ghost message reaper — prune expired unread ghost messages every 5s
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      setMessages((prev) => {
        const hasExpired = prev.some(
          (m) => m.ghostExpiresAt && m.ghostExpiresAt <= now && m.status !== "read",
        );
        if (!hasExpired) return prev;
        return prev.filter(
          (m) => !(m.ghostExpiresAt && m.ghostExpiresAt <= now && m.status !== "read"),
        );
      });
    };
    const id = setInterval(tick, 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const scopedRaw = localStorage.getItem(storageKey);
      if (scopedRaw) {
        const p = JSON.parse(scopedRaw);
        if (Array.isArray(p.threads)) setThreads(p.threads);
        if (Array.isArray(p.messages)) setMessages(p.messages);
      } else if (raw) {
        const p = JSON.parse(raw);
        if (Array.isArray(p.threads)) setThreads(p.threads);
        if (Array.isArray(p.messages)) setMessages(p.messages);
      } else {
        setThreads(SEED_THREADS);
        setMessages(SEED_MSGS);
      }
    } catch {}
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const localMsgs = messages.filter((m) => !isUUID(m.id));
      localStorage.setItem(storageKey, JSON.stringify({ threads, messages: localMsgs }));
    } catch {}
  }, [threads, messages, hydrated, storageKey]);

  useEffect(() => {
    if (!supabaseUserId) return;

    let mounted = true;
    const fetchConversations = async () => {
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from("direct_messages")
        .select(
          `
          id, sender_id, recipient_id, body, message_type, media_url, media_type, voice_duration, ghost_expires_at, ghost_label, read_at, created_at, gif_fwd_id, gif_poster_url, gif_title,
          sender:sender_id ( id, public_profile_uid, display_name, username, avatar_url, verification_type ),
          recipient:recipient_id ( id, public_profile_uid, display_name, username, avatar_url, verification_type )
        `,
        )
        .or(`sender_id.eq.${supabaseUserId},recipient_id.eq.${supabaseUserId}`)
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
          const isMeSender = row.sender_id === supabaseUserId;
          const peerId = isMeSender ? row.recipient_id : row.sender_id;
          const peerProfile = isMeSender ? row.recipient : row.sender;

          if (!peerThreads.has(peerId)) {
            peerThreads.set(peerId, {
              id: peerId,
              peer: {
                id: peerProfile?.id || peerId,
                publicProfileUid: peerProfile?.public_profile_uid || null,
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

          const isGifMsg = row.message_type === "gif" || (row.gif_fwd_id != null && row.media_url);
          const resolvedMediaUrl = await createMessageMediaUrl(row.media_url);

          const collabProps = parseCollabProposal(row.body ?? "");
          const scheduledProps = parseScheduledReply(row.body ?? "");

          dbMsgs.push({
            id: row.id,
            threadId: peerId,
            from: isMeSender ? "me" : "them",
            text: row.body ?? "",
            ts: new Date(row.created_at).getTime(),
            status,
            ghostExpiresAt: row.ghost_expires_at
              ? new Date(row.ghost_expires_at).getTime()
              : undefined,
            ghostLabel: row.ghost_label ?? undefined,
            mediaUrl: row.message_type === "voice" ? undefined : resolvedMediaUrl,
            mediaType:
              row.media_type === "video"
                ? "video"
                : row.media_type === "image" || isGifMsg
                  ? "image"
                  : undefined,
            voiceUrl: row.message_type === "voice" ? resolvedMediaUrl : undefined,
            voiceDuration: row.voice_duration ? Number(row.voice_duration) : undefined,
            isGif: !!isGifMsg,
            gifFwdId: row.gif_fwd_id ?? undefined,
            gifPosterUrl: row.gif_poster_url ?? undefined,
            gifTitle: row.gif_title ?? undefined,
            ...collabProps,
            ...scheduledProps,
          });
        }

        setThreads((prev) => {
          const merged = new Map<string, ThreadMeta>();
          for (const t of Array.from(peerThreads.values())) merged.set(t.id, t);
          for (const t of prev) {
            if (!merged.has(t.id)) merged.set(t.id, t);
          }
          return Array.from(merged.values());
        });
        setMessages((prev) => {
          const localMsgs = prev.filter((m) => !isUUID(m.id));
          return [...dbMsgs.sort((a, b) => a.ts - b.ts), ...localMsgs];
        });

        // Resume loaded pending scheduled reply timeouts
        dbMsgs.forEach((m) => {
          if (m.isScheduledReply && m.scheduledStatus === "pending" && m.scheduledTime) {
            const delay = m.scheduledTime - Date.now();
            if (delay > 0) {
              setupScheduledTimeout(m.id, m.threadId, m.scheduledText || "", delay);
            } else {
              m.scheduledStatus = "sent";
            }
          }
        });
      }
    };

    fetchConversations();
    return () => {
      mounted = false;
    };
  }, [supabaseUserId, setupScheduledTimeout]);

  useEffect(() => {
    if (!supabaseUserId) return;

    const supabase = createBrowserClient() as any;
    const channel = supabase
      .channel(`direct_messages:${supabaseUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
          filter: `recipient_id=eq.${supabaseUserId}`,
        },
        async (payload: any) => {
          const row = payload.new;
          if (!row) return;

          const { data: peerProfile } = await supabase
            .from("profiles")
            .select("id, public_profile_uid, display_name, username, avatar_url, verification_type")
            .eq("id", row.sender_id)
            .maybeSingle();

          const peer: Peer = {
            id: row.sender_id,
            publicProfileUid: peerProfile?.public_profile_uid || null,
            name: peerProfile?.display_name || "Unknown",
            handle: peerProfile?.username || "unknown",
            avatar: peerProfile?.avatar_url || "",
            verified: peerProfile?.verification_type === "creator" ? "creator" : "user",
            online: true,
          };

          setThreads((prev) => {
            const existing = prev.find((t) => t.id === row.sender_id);
            if (existing) return prev.map((t) => (t.id === row.sender_id ? { ...t, peer } : t));
            return [{ id: row.sender_id, peer, lastReadAt: 0, myLastReadAt: 0 }, ...prev];
          });

          const isGifMsg = row.message_type === "gif" || (row.gif_fwd_id != null && row.media_url);
          const resolvedMediaUrl = await createMessageMediaUrl(row.media_url);
          setMessages((prev) =>
            prev.some((m) => m.id === row.id)
              ? prev
              : [
                  ...prev,
                  {
                    id: row.id,
                    threadId: row.sender_id,
                    from: "them",
                    text: row.body ?? "",
                    ts: new Date(row.created_at).getTime(),
                    status: row.read_at ? "read" : "delivered",
                    ghostExpiresAt: row.ghost_expires_at
                      ? new Date(row.ghost_expires_at).getTime()
                      : undefined,
                    ghostLabel: row.ghost_label ?? undefined,
                    mediaUrl: row.message_type === "voice" ? undefined : resolvedMediaUrl,
                    mediaType:
                      row.media_type === "video"
                        ? "video"
                        : row.media_type === "image" || isGifMsg
                          ? "image"
                          : undefined,
                    voiceUrl: row.message_type === "voice" ? resolvedMediaUrl : undefined,
                    voiceDuration: row.voice_duration ? Number(row.voice_duration) : undefined,
                    isGif: !!isGifMsg,
                    gifFwdId: row.gif_fwd_id ?? undefined,
                    gifPosterUrl: row.gif_poster_url ?? undefined,
                    gifTitle: row.gif_title ?? undefined,
                  },
                ],
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabaseUserId]);

  const outThreads = useMemo(() => (supabaseUserId ? threads : []), [supabaseUserId, threads]);
  const outMessages = useMemo(
    () => (supabaseUserId ? messages : []),
    [supabaseUserId, messages],
  );

  const messagesOf: Ctx["messagesOf"] = (id) =>
    outMessages.filter((m) => m.threadId === id).sort((a, b) => a.ts - b.ts);

  const unreadOf: Ctx["unreadOf"] = (id) => {
    return outMessages.filter((m) => m.threadId === id && m.from === "them" && m.status !== "read")
      .length;
  };

  const totalUnread = useMemo(
    () =>
      outThreads.reduce(
        (s, t) =>
          s +
          outMessages.filter((m) => m.threadId === t.id && m.from === "them" && m.status !== "read")
            .length,
        0,
      ),
    [outThreads, outMessages],
  );

  const markRead: Ctx["markRead"] = async (id) => {
    if (!supabaseUserId) return;
    setMessages((s) =>
      s.map((m) => (m.threadId === id && m.from === "them" ? { ...m, status: "read" } : m)),
    );
    setThreads((s) => s.map((t) => (t.id === id ? { ...t, myLastReadAt: Date.now() } : t)));

    if (isUUID(id)) {
      const supabase = createBrowserClient() as any;
      const { error } = await supabase
        .from("direct_messages")
        .update({ read_at: new Date().toISOString() })
        .eq("sender_id", id)
        .eq("recipient_id", supabaseUserId)
        .is("read_at", null);

      if (error) console.error("Failed to mark read:", error);
    }
  };

  const openThread: Ctx["openThread"] = (peer) => {
    setThreads((s) =>
      s.find((t) => t.id === peer.id)
        ? s
        : [{ id: peer.id, peer, lastReadAt: 0, myLastReadAt: Date.now() }, ...s],
    );
    return peer.id;
  };

  const ensureFromHandle: Ctx["ensureFromHandle"] = (handle) => {
    const existing = threads.find((t) => t.peer.handle === handle);
    if (existing) return existing.id;

    const c = creators.find((c) => c.handle === handle);
    if (c) {
      const peer: Peer = {
        id: c.id,
        name: c.name,
        handle: c.handle,
        avatar: c.avatar as string,
        verified: c.verified,
        online: false,
      };
      setThreads((s) => [{ id: c.id, peer, lastReadAt: 0, myLastReadAt: Date.now() }, ...s]);
      return c.id;
    }

    if (supabaseUserId) {
      const supabase = createBrowserClient();
      supabase
        .from("profiles")
        .select("id, public_profile_uid, display_name, username, avatar_url, verification_type")
        .eq("username", handle)
        .single()
        .then(({ data }) => {
          if (data) {
            const p = data as any;
            const peer: Peer = {
              id: p.id,
              publicProfileUid: p.public_profile_uid || null,
              name: p.display_name || handle,
              handle: p.username || handle,
              avatar: p.avatar_url || "",
              verified: p.verification_type === "creator" ? "creator" : "user",
              online: false,
            };
            setThreads((s) => {
              const filtered = s.filter((t) => t.id !== handle);
              return [{ id: peer.id, peer, lastReadAt: 0, myLastReadAt: Date.now() }, ...filtered];
            });
          }
        });
    }

    const tempPeer: Peer = { id: handle, name: handle, handle, avatar: "", online: false };
    setThreads((s) => [
      { id: handle, peer: tempPeer, lastReadAt: 0, myLastReadAt: Date.now() },
      ...s,
    ]);
    return handle;
  };

  const send: Ctx["send"] = async (threadId, text) => {
    if (!text.trim()) return;
    if (!supabaseUserId) {
      toast.error("Please sign in to send messages");
      return;
    }

    const localId = uid();
    const ts = Date.now();
    setMessages((s) => [
      ...s,
      { id: localId, threadId, from: "me", text: text.trim(), ts, status: "sent" },
    ]);

    if (isUUID(threadId)) {
      const supabase = createBrowserClient() as any;
      const { data, error } = await supabase
        .from("direct_messages")
        .insert({
          sender_id: supabaseUserId,
          recipient_id: threadId,
          body: text.trim(),
          message_type: "text",
        })
        .select("id")
        .single();

      if (error) {
        console.error("Failed to send message:", error);
        toast.error("Failed to send message");
        setMessages((s) => s.filter((m) => m.id !== localId));
      } else if (data) {
        setMessages((s) =>
          s.map((m) =>
            m.id === localId ? { ...m, id: (data as any).id, status: "delivered" } : m,
          ),
        );
      }
    } else {
      setTimeout(
        () =>
          setMessages((s) => s.map((m) => (m.id === localId ? { ...m, status: "delivered" } : m))),
        600,
      );
      setTimeout(
        () => setMessages((s) => s.map((m) => (m.id === localId ? { ...m, status: "read" } : m))),
        1800,
      );
    }
  };

  const legacySendGhost: Ctx["sendGhost"] = (threadId, text, durationSecs, label) => {
    if (!supabaseUserId) {
      toast.error("Please sign in to send messages");
      return;
    }
    const localId = uid();
    const ts = Date.now();
    const ghostExpiresAt = ts + durationSecs * 1000;
    setMessages((s) => [
      ...s,
      {
        id: localId,
        threadId,
        from: "me",
        text: text.trim() || `👻 Ghost message · ${label}`,
        ts,
        status: "sent",
        ghostExpiresAt,
        ghostLabel: label,
      },
    ]);
    setTimeout(
      () =>
        setMessages((s) => s.map((m) => (m.id === localId ? { ...m, status: "delivered" } : m))),
      600,
    );
    toast.success(`👻 Ghost message set to dissolve in ${label}`);
  };

  const legacySendMedia: Ctx["sendMedia"] = async (threadId, file) => {
    if (!supabaseUserId) {
      toast.error("Please sign in to send media");
      return;
    }
    const localId = uid();
    const ts = Date.now();
    const objectUrl = URL.createObjectURL(file);
    const mediaType: Message["mediaType"] = file.type.startsWith("video") ? "video" : "image";
    setMessages((s) => [
      ...s,
      {
        id: localId,
        threadId,
        from: "me",
        text: "",
        ts,
        status: "sent",
        mediaUrl: objectUrl,
        mediaType,
      },
    ]);
    setTimeout(
      () =>
        setMessages((s) => s.map((m) => (m.id === localId ? { ...m, status: "delivered" } : m))),
      800,
    );
    toast.success(`${mediaType === "video" ? "🎥" : "📸"} Media sent`);
  };

  const legacySendVoice: Ctx["sendVoice"] = async (threadId, blob, durationSecs) => {
    if (!supabaseUserId) {
      toast.error("Please sign in to send voice notes");
      return;
    }
    const localId = uid();
    const ts = Date.now();
    const voiceUrl = URL.createObjectURL(blob);
    const mins = Math.floor(durationSecs / 60);
    const secs = Math.floor(durationSecs % 60)
      .toString()
      .padStart(2, "0");
    const label = `🎙 Voice note · ${mins}:${secs}`;
    setMessages((s) => [
      ...s,
      {
        id: localId,
        threadId,
        from: "me",
        text: label,
        ts,
        status: "sent",
        voiceUrl,
        voiceDuration: durationSecs,
      },
    ]);
    setTimeout(
      () =>
        setMessages((s) => s.map((m) => (m.id === localId ? { ...m, status: "delivered" } : m))),
      600,
    );
    toast.success("🎙 Voice note sent");
  };

  const sendGhost: Ctx["sendGhost"] = (threadId, text, durationSecs, label) => {
    if (!supabaseUserId) {
      toast.error("Please sign in to send messages");
      return;
    }
    const localId = uid();
    const ts = Date.now();
    const ghostExpiresAt = ts + durationSecs * 1000;
    const body = text.trim() || `Ghost message · ${label}`;
    setMessages((s) => [
      ...s,
      {
        id: localId,
        threadId,
        from: "me",
        text: body,
        ts,
        status: "sent",
        ghostExpiresAt,
        ghostLabel: label,
      },
    ]);

    if (isUUID(threadId)) {
      void (async () => {
        const supabase = createBrowserClient() as any;
        const { data, error } = await supabase
          .from("direct_messages")
          .insert({
            sender_id: supabaseUserId,
            recipient_id: threadId,
            body,
            message_type: "ghost",
            ghost_expires_at: new Date(ghostExpiresAt).toISOString(),
            ghost_label: label,
          })
          .select("id")
          .single();

        if (error) {
          console.error("Failed to send ghost message:", error);
          toast.error("Ghost message failed");
          setMessages((s) => s.filter((m) => m.id !== localId));
        } else if (data) {
          setMessages((s) =>
            s.map((m) => (m.id === localId ? { ...m, id: data.id, status: "delivered" } : m)),
          );
        }
      })();
    } else {
      setTimeout(
        () =>
          setMessages((s) => s.map((m) => (m.id === localId ? { ...m, status: "delivered" } : m))),
        600,
      );
    }
    toast.success(`Ghost message set to dissolve in ${label}`);
  };

  const sendMedia: Ctx["sendMedia"] = async (threadId, file) => {
    if (!supabaseUserId) {
      toast.error("Please sign in to send media");
      return;
    }
    const localId = uid();
    const ts = Date.now();
    const objectUrl = URL.createObjectURL(file);
    const mediaType: Message["mediaType"] = file.type.startsWith("video") ? "video" : "image";
    setMessages((s) => [
      ...s,
      {
        id: localId,
        threadId,
        from: "me",
        text: "",
        ts,
        status: "sent",
        mediaUrl: objectUrl,
        mediaType,
      },
    ]);

    if (isUUID(threadId)) {
      try {
        const mediaPath = await uploadMessageMedia(supabaseUserId, file, "media");
        const supabase = createBrowserClient() as any;
        const { data, error } = await supabase
          .from("direct_messages")
          .insert({
            sender_id: supabaseUserId,
            recipient_id: threadId,
            body: "",
            message_type: mediaType,
            media_url: mediaPath,
            media_type: mediaType,
          })
          .select("id")
          .single();

        if (error) throw error;
        setMessages((s) =>
          s.map((m) => (m.id === localId ? { ...m, id: data.id, status: "delivered" } : m)),
        );
      } catch (error) {
        console.error("Failed to send media:", error);
        toast.error("Media failed");
        setMessages((s) => s.filter((m) => m.id !== localId));
        return;
      }
    } else {
      setTimeout(
        () =>
          setMessages((s) => s.map((m) => (m.id === localId ? { ...m, status: "delivered" } : m))),
        800,
      );
    }
    toast.success(`${mediaType === "video" ? "Video" : "Image"} sent`);
  };

  const sendFwdGif: Ctx["sendFwdGif"] = async (threadId, gif, text) => {
    if (!supabaseUserId) {
      toast.error("Please sign in to send with FWD");
      return;
    }
    const localId = uid();
    const ts = Date.now();
    const displayText = text?.trim() || gif.title || "";
    setMessages((s) => [
      ...s,
      {
        id: localId,
        threadId,
        from: "me",
        text: displayText,
        ts,
        status: "sent",
        mediaUrl: gif.url,
        mediaType: "image",
        isGif: true,
        gifFwdId: gif.gif_id || undefined,
        gifPosterUrl: gif.preview_url || undefined,
        gifTitle: gif.title || undefined,
      },
    ]);

    if (isUUID(threadId)) {
      try {
        const supabase = createBrowserClient() as any;
        const { data, error } = await supabase
          .from("direct_messages")
          .insert({
            sender_id: supabaseUserId,
            recipient_id: threadId,
            body: displayText || null,
            message_type: "gif",
            media_url: gif.url,
            media_type: "image",
            gif_fwd_id: gif.gif_id ?? null,
            gif_poster_url: gif.preview_url ?? null,
            gif_title: gif.title ?? null,
          })
          .select("id")
          .single();

        if (error) throw error;
        setMessages((s) =>
          s.map((m) => (m.id === localId ? { ...m, id: data.id, status: "delivered" } : m)),
        );
      } catch (err) {
        console.error("Failed to send FWD GIF:", err);
        toast.error("FWD GIF failed");
        setMessages((s) => s.filter((m) => m.id !== localId));
        return;
      }
    } else {
      setTimeout(
        () =>
          setMessages((s) => s.map((m) => (m.id === localId ? { ...m, status: "delivered" } : m))),
        800,
      );
    }

    toast.success("Sent with FWD");
  };

  const sendVoice: Ctx["sendVoice"] = async (threadId, blob, durationSecs) => {
    if (!supabaseUserId) {
      toast.error("Please sign in to send voice notes");
      return;
    }
    const localId = uid();
    const ts = Date.now();
    const voiceUrl = URL.createObjectURL(blob);
    const mins = Math.floor(durationSecs / 60);
    const secs = Math.floor(durationSecs % 60)
      .toString()
      .padStart(2, "0");
    const label = `Voice note · ${mins}:${secs}`;
    setMessages((s) => [
      ...s,
      {
        id: localId,
        threadId,
        from: "me",
        text: label,
        ts,
        status: "sent",
        voiceUrl,
        voiceDuration: durationSecs,
      },
    ]);

    if (isUUID(threadId)) {
      try {
        const voicePath = await uploadMessageMedia(supabaseUserId, blob, "voice");
        const supabase = createBrowserClient() as any;
        const { data, error } = await supabase
          .from("direct_messages")
          .insert({
            sender_id: supabaseUserId,
            recipient_id: threadId,
            body: label,
            message_type: "voice",
            media_url: voicePath,
            media_type: "audio",
            voice_duration: durationSecs,
          })
          .select("id")
          .single();

        if (error) throw error;
        setMessages((s) =>
          s.map((m) => (m.id === localId ? { ...m, id: data.id, status: "delivered" } : m)),
        );
      } catch (error) {
        console.error("Failed to send voice note:", error);
        toast.error("Voice note failed");
        setMessages((s) => s.filter((m) => m.id !== localId));
        return;
      }
    } else {
      setTimeout(
        () =>
          setMessages((s) => s.map((m) => (m.id === localId ? { ...m, status: "delivered" } : m))),
        600,
      );
    }
    toast.success("Voice note sent");
  };

  const sendCollabProposal: Ctx["sendCollabProposal"] = async (threadId, input) => {
    if (!supabaseUserId) {
      toast.error("Please sign in to send collaboration proposals");
      return;
    }

    const localId = uid();
    const ts = Date.now();
    const body = `[COLLAB_PROPOSAL] I've sent a proposal for a ${input.collabType}! Pitch: "${input.pitch}" | Splits: ${input.split}% | Beat: ${input.beatName || "None"}`;
    const newMsg: Message = {
      id: localId,
      threadId,
      from: "me",
      text: body,
      ts,
      status: "sent",
      isCollabProposal: true,
      collabType: input.collabType,
      collabPitch: input.pitch,
      collabSplit: input.split,
      collabBeatName: input.beatName,
      collabStatus: "pending",
    };

    setMessages((s) => [...s, newMsg]);
    toast.success("Collaboration proposal sent!");

    if (isUUID(threadId)) {
      try {
        const supabase = createBrowserClient() as any;
        const { data, error } = await supabase
          .from("direct_messages")
          .insert({
            sender_id: supabaseUserId,
            recipient_id: threadId,
            body,
            message_type: "text",
          })
          .select("id")
          .single();

        if (error) throw error;
        if (data?.id) {
          setMessages((s) =>
            s.map((m) =>
              m.id === localId ? { ...m, id: (data as any).id, status: "delivered" } : m,
            ),
          );
        }
      } catch (err) {
        console.error("Failed to persist collab proposal:", err);
        toast.error("Could not save collab proposal");
      }
    }
  };

  const respondToCollab: Ctx["respondToCollab"] = (messageId, status) => {
    setMessages((s) => s.map((m) => (m.id === messageId ? { ...m, collabStatus: status } : m)));
    if (status === "accepted") {
      toast.success("Proposal accepted! Collaboration room started.");
      setTimeout(() => {
        const replyId = uid();
        const responseMsg: Message = {
          id: replyId,
          threadId: messages.find((m) => m.id === messageId)?.threadId || "",
          from: "them",
          text: "Let's do it! That sounds like an awesome plan. Collab room is initialized!",
          ts: Date.now(),
          status: "delivered",
        };
        setMessages((s) => [...s, responseMsg]);
      }, 1500);
    } else {
      toast.error("Proposal declined.");
    }
  };

  const sendScheduledReply: Ctx["sendScheduledReply"] = (threadId, text, timeLabel, delayMs) => {
    if (!supabaseUserId) {
      toast.error("Please sign in to schedule a reply");
      return;
    }

    const localId = uid();
    const scheduledTime = Date.now() + delayMs;
    const newMsg: Message = {
      id: localId,
      threadId,
      from: "me",
      text: `[SCHEDULED_REPLY] Scheduled to send in ${timeLabel}: "${text}"`,
      ts: Date.now(),
      status: "sent",
      isScheduledReply: true,
      scheduledTime,
      scheduledText: text,
      scheduledStatus: "pending",
    };
    setMessages((s) => [...s, newMsg]);
    toast.success(`Reply scheduled for ${timeLabel}`);

    setupScheduledTimeout(localId, threadId, text, delayMs);
  };

  const cancelScheduledReply: Ctx["cancelScheduledReply"] = (messageId) => {
    setMessages((s) =>
      s.map((m) => (m.id === messageId ? { ...m, scheduledStatus: "cancelled" } : m)),
    );
    toast.error("Scheduled reply cancelled");
  };

  return (
    <C.Provider
      value={{
        threads: outThreads,
        messagesOf,
        unreadOf,
        totalUnread,
        send,
        sendGhost,
        sendMedia,
        sendFwdGif,
        sendVoice,
        openThread,
        markRead,
        ensureFromHandle,
        sendCollabProposal,
        respondToCollab,
        sendScheduledReply,
        cancelScheduledReply,
      }}
    >
      {children}
    </C.Provider>
  );
}

export function useMessages() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useMessages must be inside <MessagesProvider>");
  return ctx;
}

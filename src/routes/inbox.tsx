import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useEffect, useState, useCallback } from "react";
import { z } from "zod";
import {
  Heart, MessageCircle, UserPlus, Sparkles, Search, Send, Plus,
  Phone, Video, MoreHorizontal, Smile, Image as ImageIcon, Mic, Check,
  CheckCheck, ArrowLeft, Pin, Filter, Inbox as InboxIcon, Star, Wand2,
  Ghost, X, Timer,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { creators } from "@/lib/mock-data";
import { VerifiedBadge } from "@/components/brand/Badge";
import { toast } from "sonner";
import { useMessages } from "@/lib/messages-store";
import { NewConversationSheet } from "@/components/inbox/NewConversationSheet";
import { ChatOnboarding } from "@/components/inbox/ChatOnboarding";
import { PlusMenu } from "@/components/inbox/PlusMenu";
import { GhostMessagePopup } from "@/components/inbox/GhostMessagePopup";
import { NeonEmojiPicker } from "@/components/inbox/NeonEmojiPicker";

export const Route = createFileRoute("/inbox")({
  component: Inbox,
  validateSearch: (s: Record<string, unknown>) => z.object({ to: z.string().optional() }).parse(s),
  head: () => ({
    meta: [
      { title: "Inbox — Trey TV" },
      { name: "description", content: "Connect with creators and fans across Trey TV. DMs, activity, requests and Trey-I co-pilot." },
    ],
  }),
});

type Tab = "all" | "dms" | "requests" | "activity";

const activity = [
  { icon: Heart, color: "text-[oklch(0.65_0.24_15)]", who: creators[0], text: "liked your latest post", time: "2m" },
  { icon: UserPlus, color: "text-primary", who: creators[1], text: "started following you", time: "12m" },
  { icon: MessageCircle, color: "text-[oklch(0.82_0.15_215)]", who: creators[2], text: "commented: 'This is fire 🔥'", time: "1h" },
  { icon: Sparkles, color: "text-[oklch(0.7_0.25_340)]", who: creators[3], text: "prescribed your post to 124 fans", time: "3h" },
  { icon: Star, color: "text-primary", who: creators[4], text: "added you to their VIP list", time: "5h" },
];

const requests = creators.slice(2, 5).map((c, i) => ({
  who: c,
  msg: ["Hey, big fan — would love to collab on a track ✨", "Saw your last drop — interested in a feature?", "Is your management open right now?"][i],
}));

function fmtTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
function fmtAgo(ts: number) {
  if (!ts) return "";
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function Inbox() {
  const { to } = Route.useSearch();
  const { threads, messagesOf, unreadOf, totalUnread, send: sendMessage, sendGhost, sendMedia, sendVoice, markRead, ensureFromHandle } = useMessages();
  const [tab, setTab] = useState<Tab>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [peerTyping, setPeerTyping] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Composer overlay state
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showGhostPopup, setShowGhostPopup] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [ghostDraft, setGhostDraft] = useState("");
  // Voice recorder state
  const [recording, setRecording] = useState(false);
  const [recorderMs, setRecorderMs] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recorderChunksRef = useRef<Blob[]>([]);
  const recorderTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_VOICE_SECS = 20;

  // Open a thread when navigated with ?to=<handle>
  useEffect(() => {
    if (!to) return;
    const id = ensureFromHandle(to);
    if (id) setOpenId(id);
  }, [to, ensureFromHandle]);

  const filtered = useMemo(
    () => threads
      .filter((t) => t.peer.name.toLowerCase().includes(query.toLowerCase()) || t.peer.handle.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => {
        if (!!b.pinned !== !!a.pinned) return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
        const am = messagesOf(a.id); const bm = messagesOf(b.id);
        return (bm[bm.length - 1]?.ts ?? 0) - (am[am.length - 1]?.ts ?? 0);
      }),
    [threads, query, messagesOf]
  );
  const open = threads.find((t) => t.id === openId) ?? null;
  const thread = openId ? messagesOf(openId) : [];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [thread.length, openId]);

  // Mark thread read when opened or new messages arrive while open
  useEffect(() => {
    if (openId) markRead(openId);
  }, [openId, thread.length, markRead]);

  const onSend = () => {
    if (!openId || !draft.trim()) return;
    sendMessage(openId, draft);
    setDraft("");
    setTimeout(() => setPeerTyping(true), 600);
    setTimeout(() => setPeerTyping(false), 2800);
  };

  // Voice recorder logic — 20s max
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      recorderChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) recorderChunksRef.current.push(e.data); };
      mr.onstop = () => { stream.getTracks().forEach((t) => t.stop()); };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecorderMs(0);
      setRecording(true);
      recorderTimerRef.current = setInterval(() => {
        setRecorderMs((prev) => {
          if (prev >= MAX_VOICE_SECS * 1000 - 500) {
            stopAndSendVoice();
            return prev;
          }
          return prev + 500;
        });
      }, 500);
    } catch {
      toast.error("Microphone access denied");
    }
  }, [openId]);

  const stopAndSendVoice = useCallback(() => {
    const mr = mediaRecorderRef.current;
    if (!mr || mr.state === "inactive") return;
    mr.onstop = () => {
      mr.stream?.getTracks().forEach((t) => t.stop());
      if (recorderChunksRef.current.length && openId) {
        const blob = new Blob(recorderChunksRef.current, { type: "audio/webm" });
        const durSecs = recorderMs / 1000;
        sendVoice(openId, blob, durSecs);
      }
    };
    mr.stop();
    if (recorderTimerRef.current) clearInterval(recorderTimerRef.current);
    setRecording(false);
    setRecorderMs(0);
  }, [openId, recorderMs, sendVoice]);

  const cancelRecording = useCallback(() => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") {
      mr.onstop = () => mr.stream?.getTracks().forEach((t) => t.stop());
      mr.stop();
    }
    if (recorderTimerRef.current) clearInterval(recorderTimerRef.current);
    setRecording(false);
    setRecorderMs(0);
    toast("Voice note cancelled");
  }, []);

  const onPhotoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && openId) sendMedia(openId, file);
    e.target.value = "";
  }, [openId, sendMedia]);

  return (
    <AppShell wide>
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 lg:h-[calc(100dvh-7rem)]">
        {/* Conversation list */}
        <section className={`${openId ? "hidden lg:flex" : "flex"} flex-col rounded-3xl glass neon-border overflow-hidden`}>
          {/* Header */}
          <div className="px-4 pt-4 pb-3 border-b border-white/5 relative overflow-hidden holo-header space-y-3">
            <div className="absolute -top-10 -right-10 size-32 rounded-full bg-[radial-gradient(circle,oklch(0.7_0.25_340_/_0.4),transparent_70%)] blur-2xl pointer-events-none" />
            <div className="relative flex items-center justify-between gap-3">
              <div className="min-w-0 space-y-0.5">
                <div className="text-[10px] tracking-[0.3em] text-primary flex items-center gap-1.5">
                  <InboxIcon className="size-3" /> INBOX
                </div>
                <h1 className="text-2xl font-bold leading-none"><span className="text-gradient-gold">Connect</span></h1>
                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 truncate pt-0.5">
                  <span className="size-1.5 rounded-full bg-[oklch(0.78_0.18_150)] animate-presence inline-block shrink-0" />
                  {totalUnread} unread · {threads.filter((t) => t.peer.online).length} online
                </div>
              </div>
              <button onClick={() => setNewOpen(true)} aria-label="New conversation" className="shrink-0 size-11 grid place-items-center rounded-full send-btn-rocket tilt-press">
                <Plus className="size-5" />
              </button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 h-11 px-3.5 rounded-2xl glass border border-white/10 focus-within:border-primary/40">
              <Search className="size-4 text-muted-foreground shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search messages…"
                className="flex-1 min-w-0 bg-transparent text-sm focus:outline-none"
              />
              <button onClick={() => toast("Filters")} className="text-muted-foreground shrink-0" aria-label="Filters">
                <Filter className="size-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
              {([
                { id: "all", label: "All", n: 0 },
                { id: "dms", label: "Messages", n: totalUnread },
                { id: "requests", label: "Requests", n: requests.length },
                { id: "activity", label: "Activity", n: activity.length },
              ] as const).map((t) => {
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`relative h-8 px-3.5 rounded-full text-xs whitespace-nowrap transition tilt-press inline-flex items-center gap-1.5 ${
                      active ? "bg-primary/15 text-primary border border-primary/40 glow-gold" : "glass border border-white/10 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.label}
                    {t.n ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[oklch(0.7_0.25_340)] text-white">{t.n}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Online rail */}
          {tab !== "activity" && tab !== "requests" && (
            <div className="px-4 py-3 border-b border-white/5">
              <div className="text-[10px] tracking-[0.25em] text-muted-foreground mb-2">ACTIVE NOW</div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4">
                {creators.slice(0, 8).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      const id = ensureFromHandle(c.handle);
                      if (id) setOpenId(id);
                    }}
                    className="shrink-0 flex flex-col items-center gap-1.5 tilt-press w-[56px]"
                  >
                    <div className="relative size-12 rounded-full conic-ring">
                      <img src={c.avatar} className="size-12 rounded-full object-cover" alt="" />
                      <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-[oklch(0.78_0.18_150)] ring-2 ring-background animate-presence" />
                    </div>
                    <span className="text-[10px] truncate w-full text-center leading-none">{c.name.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Lists */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {(tab === "all" || tab === "dms") && (
              <ul className="px-2 py-2 space-y-0.5">
                {filtered.map((t, i) => {
                  const active = openId === t.id;
                  const msgs = messagesOf(t.id);
                  const last = msgs[msgs.length - 1];
                  const unread = unreadOf(t.id);
                  const preview = last
                    ? `${last.from === "me" ? "You: " : ""}${last.text}`
                    : "Say hi 👋";
                  return (
                    <li key={t.id} style={{ animationDelay: `${i * 35}ms` }} className="animate-rise">
                      <button
                        onClick={() => setOpenId(t.id)}
                        className={`thread-row w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left ${
                          active ? "thread-row-active" : "hover:bg-white/5 active:bg-white/[0.07]"
                        }`}
                      >
                        <div className="relative size-12 rounded-full conic-ring shrink-0">
                          <img src={t.peer.avatar} className="size-12 rounded-full object-cover" alt="" />
                          {t.peer.online && <span className="absolute bottom-0 right-0 size-3 rounded-full bg-[oklch(0.78_0.18_150)] ring-2 ring-background animate-presence" />}
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-sm font-semibold truncate flex items-center gap-1.5 min-w-0">
                              <span className="truncate">{t.peer.name}</span>
                              <VerifiedBadge kind={t.peer.verified} className="!size-3.5 shrink-0" />
                              {t.pinned && <Pin className="size-3 text-primary shrink-0" />}
                            </div>
                            <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">{last ? fmtAgo(last.ts) : ""}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-xs truncate ${unread ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                              {preview}
                            </p>
                            {unread ? (
                              <span className="size-5 grid place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground glow-gold shrink-0">{unread}</span>
                            ) : null}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
                {filtered.length === 0 && (
                  <li className="text-center text-sm text-muted-foreground py-12 px-4">
                    No conversations yet. Tap <Plus className="inline size-3.5" /> to start one.
                  </li>
                )}
              </ul>
            )}

            {tab === "requests" && (
              <ul className="px-3 py-3 space-y-2.5">
                {requests.map((r, i) => (
                  <li key={r.who.id} style={{ animationDelay: `${i * 50}ms` }} className="animate-rise rounded-2xl glass border border-white/10 p-3.5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="relative size-11 rounded-full conic-ring shrink-0">
                        <img src={r.who.avatar} className="size-11 rounded-full object-cover" alt="" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold flex items-center gap-1.5 truncate">
                          <span className="truncate">{r.who.name}</span>
                          <VerifiedBadge kind={r.who.verified} className="!size-3.5 shrink-0" />
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate">{r.msg}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => toast.success("Request accepted")} className="flex-1 h-9 rounded-xl text-xs font-semibold bg-primary text-primary-foreground glow-gold">Accept</button>
                      <button onClick={() => toast("Request dismissed")} className="flex-1 h-9 rounded-xl text-xs glass border border-white/10">Decline</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {tab === "activity" && (
              <ul className="px-3 py-3 space-y-2">
                {activity.map((a, i) => (
                  <li key={i} style={{ animationDelay: `${i * 40}ms` }} className="animate-rise rounded-2xl glass border border-white/10 p-3 flex items-center gap-3">
                    <div className="relative shrink-0">
                      <img src={a.who.avatar} className="size-11 rounded-full object-cover" alt="" />
                      <div className="absolute -bottom-1 -right-1 size-6 rounded-full bg-background grid place-items-center border border-white/10">
                        <a.icon className={`size-3.5 ${a.color}`} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm leading-snug"><span className="font-semibold">{a.who.name}</span> {a.text}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{a.time} ago</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Chat panel */}
        <section className={`${openId ? "flex" : "hidden lg:flex"} flex-col rounded-3xl glass neon-border overflow-hidden relative`}>
          {open ? (
            <>
              {/* Chat header */}
              <div className="p-3 md:p-4 border-b border-white/5 flex items-center gap-3">
                <button onClick={() => setOpenId(null)} className="lg:hidden size-9 grid place-items-center rounded-full hover:bg-white/5">
                  <ArrowLeft className="size-4" />
                </button>
                <div className="relative size-11 rounded-full conic-ring shrink-0">
                  <img src={open.peer.avatar} className="size-11 rounded-full object-cover" alt="" />
                  {open.peer.online && <span className="absolute bottom-0 right-0 size-3 rounded-full bg-[oklch(0.78_0.18_150)] ring-2 ring-background animate-presence" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold flex items-center gap-1">{open.peer.name} <VerifiedBadge kind={open.peer.verified} className="!size-3.5" /></div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    @{open.peer.handle} ·
                    {peerTyping ? (
                      <span className="inline-flex items-center gap-0.5 text-[oklch(0.85_0.2_340)]">
                        typing
                        <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                      </span>
                    ) : (
                      <span>{open.peer.online ? "Active now" : "Last seen recently"}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <IconBtn icon={Phone} onClick={() => toast("Calling…")} />
                  <IconBtn icon={Video} onClick={() => toast("Video call")} />
                  <IconBtn icon={MoreHorizontal} onClick={() => toast("Conversation options")} />
                </div>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar relative">
                {/* Ambient floating orbs */}
                <div aria-hidden className="chat-orb-1" style={{ top: "10%", left: "-60px" }} />
                <div aria-hidden className="chat-orb-2" style={{ bottom: "5%", right: "-80px" }} />
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,oklch(0.2_0.07_290_/_0.3),transparent_60%)]" />

                <div className="relative text-center py-2">
                  <div className="inline-block px-3 py-1 rounded-full glass-strong border border-white/10 text-[10px] tracking-[0.25em] text-muted-foreground">
                    TODAY · {thread.length} MESSAGES
                  </div>
                </div>

                {thread.map((m, i) => {
                  const mine = m.from === "me";
                  const prevSameSide = thread[i - 1]?.from === m.from;
                  const isGhost = !!m.ghostExpiresAt;
                  const hasMedia = !!m.mediaUrl;
                  const hasVoice = !!m.voiceUrl;
                  const timeLeft = isGhost ? Math.max(0, Math.ceil((m.ghostExpiresAt! - Date.now()) / 1000)) : 0;
                  return (
                    <div
                      key={m.id}
                      className={`relative flex items-end gap-2 ${mine ? "justify-end" : "justify-start"} animate-msg-pop group/msg`}
                      style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                    >
                      {!mine && !prevSameSide && (
                        <img src={open.peer.avatar} className="size-7 rounded-full object-cover ring-1 ring-white/10" alt="" />
                      )}
                      {!mine && prevSameSide && <div className="w-7 shrink-0" />}
                      <div className={`max-w-[70%] relative ${mine ? "items-end" : "items-start"} flex flex-col`}>
                        {/* Ghost message bubble */}
                        {isGhost && (
                          <div className="ghost-bubble">
                            <Ghost className="size-4" style={{ color: "oklch(0.82 0.16 85)", filter: "drop-shadow(0 0 8px oklch(0.82 0.16 85 / 0.8))" }} />
                            <span className="text-sm font-medium" style={{ color: "oklch(0.86 0.17 90)" }}>{m.text}</span>
                            <div className="ghost-timer-badge">
                              <Timer className="size-2.5" />
                              <span>{timeLeft}s left</span>
                            </div>
                          </div>
                        )}
                        {/* Media bubble */}
                        {hasMedia && (
                          <div className="rounded-2xl overflow-hidden border border-white/10" style={{ maxWidth: 220 }}>
                            {m.mediaType === "video" ? (
                              <video src={m.mediaUrl} controls className="w-full" style={{ maxHeight: 200 }} />
                            ) : (
                              <img src={m.mediaUrl} alt="media" className="w-full object-cover" style={{ maxHeight: 200 }} />
                            )}
                          </div>
                        )}
                        {/* Voice bubble */}
                        {hasVoice && (
                          <div className="voice-bubble">
                            <Mic className="size-4 shrink-0" style={{ color: "oklch(0.82 0.15 215)", filter: "drop-shadow(0 0 6px oklch(0.82 0.15 215 / 0.7))" }} />
                            <audio src={m.voiceUrl} controls className="voice-audio" />
                          </div>
                        )}
                        {/* Regular text bubble */}
                        {!isGhost && !hasMedia && !hasVoice && m.text && (
                          <div className={`px-3.5 py-2 text-sm leading-relaxed rounded-2xl ${
                            mine ? "msg-bubble-mine rounded-br-sm" : "msg-bubble-them rounded-bl-sm"
                          }`}>
                            <span className="relative z-[1]">{m.text}</span>
                          </div>
                        )}
                        {/* Hover quick reactions */}
                        <div className={`absolute -top-7 ${mine ? "right-0" : "left-0"} opacity-0 group-hover/msg:opacity-100 transition pointer-events-auto`}>
                          <div className="flex items-center gap-0.5 px-1.5 py-1 rounded-full glass-strong border border-white/10 shadow-[0_8px_24px_-8px_oklch(0_0_0_/_0.6)]">
                            {["❤️", "🔥", "😂", "👏", "💎"].map((e) => (
                              <button key={e} onClick={() => toast(`${e} reaction sent`)} className="size-6 grid place-items-center rounded-full hover:bg-white/10 hover:scale-125 transition text-xs">{e}</button>
                            ))}
                          </div>
                        </div>
                        {m.reactions && (
                          <div className={`absolute -bottom-2 ${mine ? "left-1" : "right-1"} px-1.5 py-0.5 rounded-full glass-strong border border-white/10 text-xs`}>
                            {m.reactions.join(" ")}
                          </div>
                        )}
                        <div className={`mt-1 flex items-center gap-1 text-[10px] text-muted-foreground ${mine ? "justify-end" : ""}`}>
                          <span>{fmtTime(m.ts)}</span>
                          {mine && (m.status === "read" ? <CheckCheck className="size-3 text-[oklch(0.82_0.15_215)]" /> : m.status === "delivered" ? <CheckCheck className="size-3" /> : <Check className="size-3" />)}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Peer typing bubble */}
                {peerTyping && (
                  <div className="flex items-end gap-2 justify-start animate-msg-pop">
                    <img src={open.peer.avatar} className="size-7 rounded-full object-cover" alt="" />
                    <div className="msg-bubble-them rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                      <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                    </div>
                  </div>
                )}
              </div>

              {/* AI suggestions */}
              <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar">
                {["🔥 I'm in", "Send the cut", "Let's hop on a call", "Drafting reply…"].map((s) => (
                  <button
                    key={s}
                    onClick={() => s.includes("Drafting") ? toast("Trey-I drafting reply…") : setDraft(s)}
                    className="shrink-0 px-3 py-1.5 rounded-full text-[11px] glass border border-white/10 hover:bg-white/5 flex items-center gap-1 tilt-press"
                  >
                    {s.includes("Drafting") && <Wand2 className="size-3 text-primary" />}
                    {s}
                  </button>
                ))}
              </div>

              {/* Composer */}
              <div className="p-3 border-t border-white/5 relative">
                {/* Hidden file input for photo/video */}
                <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={onPhotoSelect} />

                {/* Ghost draft input (shown above composer when ghost selected) */}
                {showGhostPopup && (
                  <GhostMessagePopup
                    onSelect={(secs, label) => {
                      if (openId) sendGhost(openId, draft || ghostDraft, secs, label);
                      setDraft(""); setGhostDraft(""); setShowGhostPopup(false);
                    }}
                    onClose={() => setShowGhostPopup(false)}
                  />
                )}

                {/* Emoji picker */}
                {showEmojiPicker && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 z-50 px-3">
                    <NeonEmojiPicker
                      onSelect={(emoji) => { setDraft((d) => d + emoji); setShowEmojiPicker(false); }}
                      onClose={() => setShowEmojiPicker(false)}
                    />
                  </div>
                )}

                {/* Plus menu */}
                {showPlusMenu && (
                  <PlusMenu
                    onGhostMessage={() => { setShowPlusMenu(false); setShowGhostPopup(true); }}
                    onPhoto={() => { setShowPlusMenu(false); fileInputRef.current?.click(); }}
                    onClose={() => setShowPlusMenu(false)}
                  />
                )}

                {recording ? (
                  <div className="flex items-center gap-3 rounded-2xl px-4 py-3 border border-[oklch(0.7_0.25_340_/_0.5)] bg-[linear-gradient(120deg,oklch(0.7_0.25_340_/_0.18),oklch(0.82_0.16_85_/_0.12))] glow-purple">
                    <span className="size-2.5 rounded-full bg-[oklch(0.65_0.24_15)] animate-glow-pulse" />
                    <span className="text-[11px] tracking-[0.2em] font-bold text-[oklch(0.85_0.2_340)]">REC {Math.floor(recorderMs / 1000)}s / {MAX_VOICE_SECS}s</span>
                    <div className="flex-1 flex items-center justify-center gap-0.5 h-6">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <span key={i} className="wave-bar" style={{ height: `${10 + (i % 5) * 4}px`, animationDelay: `${i * 60}ms`, animationDuration: `${0.7 + (i % 3) * 0.15}s` }} />
                      ))}
                    </div>
                    <button onClick={cancelRecording} className="px-2.5 h-8 rounded-lg text-[11px] font-semibold glass border border-white/10">Cancel</button>
                    <button onClick={stopAndSendVoice} className="size-9 grid place-items-center rounded-xl send-btn-rocket">
                      <Send className="size-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-end gap-2 rounded-2xl glass border border-white/10 px-3 py-2 focus-within:border-primary/50 transition">
                    <button
                      id="composer-plus"
                      onClick={() => { setShowEmojiPicker(false); setShowPlusMenu((v) => !v); }}
                      className={`tilt-press transition ${showPlusMenu ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                      aria-label="More options"
                    >
                      <Plus className="size-5" />
                    </button>
                    <button
                      id="composer-photo"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-muted-foreground hover:text-[oklch(0.82_0.15_215)] tilt-press transition"
                      aria-label="Attach photo or video"
                    >
                      <ImageIcon className="size-5" />
                    </button>
                    <button
                      id="composer-emoji"
                      onClick={() => { setShowPlusMenu(false); setShowEmojiPicker((v) => !v); }}
                      className={`tilt-press transition ${showEmojiPicker ? "text-primary" : "text-muted-foreground hover:text-[oklch(0.7_0.25_340)]"}`}
                      aria-label="Emoji picker"
                    >
                      <Smile className="size-5" />
                    </button>
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && onSend()}
                      placeholder={`Message ${open.peer.name.split(" ")[0]}…`}
                      className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground py-1"
                    />
                    {draft.trim() ? (
                      <button onClick={onSend} aria-label="Send" className="size-9 grid place-items-center rounded-xl send-btn-rocket">
                        <Send className="size-4" />
                      </button>
                    ) : (
                      <button
                        id="composer-mic"
                        onClick={startRecording}
                        aria-label="Record voice note"
                        className="size-9 grid place-items-center rounded-xl glass border border-white/10 tilt-press"
                      >
                        <Mic className="size-4 text-primary" />
                      </button>
                    )}
                  </div>
                )}
                <div className="text-[10px] text-muted-foreground text-center mt-1.5 flex items-center justify-center gap-1">
                  <Sparkles className="size-3 text-primary" /> End-to-end encrypted · Trey-I assist enabled
                </div>
              </div>
            </>
          ) : (
            <EmptyState onNew={() => setNewOpen(true)} />
          )}
        </section>
      </div>
      <NewConversationSheet
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onPicked={(id) => setOpenId(id)}
      />
      <ChatOnboarding />
    </AppShell>
  );
}

function IconBtn({ icon: Icon, onClick }: { icon: typeof Phone; onClick: () => void }) {
  return (
    <button onClick={onClick} className="size-9 grid place-items-center rounded-full hover:bg-white/5 tilt-press">
      <Icon className="size-4" />
    </button>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex-1 grid place-items-center p-8 text-center">
      <div className="max-w-sm space-y-3">
        <div className="relative mx-auto size-20 rounded-full conic-ring">
          <div className="size-20 rounded-full bg-background grid place-items-center">
            <MessageCircle className="size-8 text-primary" />
          </div>
        </div>
        <h2 className="text-xl font-bold"><span className="text-gradient-gold">Pick a thread</span></h2>
        <p className="text-sm text-muted-foreground">Connect with creators and fans across your network. Trey-I drafts replies, summarizes long DMs and surfaces hot collabs.</p>
        <button onClick={onNew} className="px-4 py-2 rounded-xl text-sm font-semibold border border-primary text-primary glow-gold tilt-press">Start a new conversation</button>
      </div>
    </div>
  );
}

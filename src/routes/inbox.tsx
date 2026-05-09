import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useEffect, useState } from "react";
import { z } from "zod";
import {
  Bell, Heart, MessageCircle, UserPlus, Sparkles, Search, Send, Plus,
  Phone, Video, MoreHorizontal, Smile, Image as ImageIcon, Mic, Check,
  CheckCheck, ArrowLeft, Pin, Filter, Inbox as InboxIcon, Star, Wand2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { creators } from "@/lib/mock-data";
import { VerifiedBadge } from "@/components/brand/Badge";
import { toast } from "sonner";
import { useMessages } from "@/lib/messages-store";

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
  const { threads, messagesOf, unreadOf, totalUnread, send: sendMessage, markRead, ensureFromHandle } = useMessages();
  const [tab, setTab] = useState<Tab>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

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
  };

  return (
    <AppShell wide>
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 lg:h-[calc(100dvh-7rem)]">
        {/* Conversation list */}
        <section className={`${openId ? "hidden lg:flex" : "flex"} flex-col rounded-3xl glass neon-border overflow-hidden`}>
          {/* Header */}
          <div className="p-4 border-b border-white/5 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 size-32 rounded-full bg-[radial-gradient(circle,oklch(0.7_0.25_340_/_0.4),transparent_70%)] blur-2xl" />
            <div className="relative flex items-center justify-between">
              <div>
                <div className="text-[10px] tracking-[0.3em] text-primary flex items-center gap-2"><InboxIcon className="size-3.5" /> INBOX</div>
                <h1 className="text-2xl font-bold mt-0.5"><span className="text-gradient-gold">Connect</span></h1>
                <div className="text-[11px] text-muted-foreground">{totalUnread} unread · {threads.filter((t) => t.peer.online).length} online now</div>
              </div>
              <button onClick={() => toast("New chat")} className="size-10 grid place-items-center rounded-full bg-primary text-primary-foreground glow-gold tilt-press">
                <Plus className="size-5" />
              </button>
            </div>

            {/* Search */}
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl glass border border-white/10 focus-within:border-primary/40">
              <Search className="size-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search creators, fans, messages…"
                className="flex-1 bg-transparent text-sm focus:outline-none"
              />
              <button onClick={() => toast("Filters")} className="text-muted-foreground"><Filter className="size-4" /></button>
            </div>

            {/* Tabs */}
            <div className="mt-3 flex gap-1 overflow-x-auto no-scrollbar">
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
                    className={`relative px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition tilt-press ${
                      active ? "bg-primary/15 text-primary border border-primary/40 glow-gold" : "glass border border-white/10 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.label}
                    {t.n ? (
                      <span className="ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[oklch(0.7_0.25_340)] text-white">{t.n}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Online rail */}
          {tab !== "activity" && tab !== "requests" && (
            <div className="px-3 py-3 border-b border-white/5">
              <div className="text-[10px] tracking-[0.2em] text-muted-foreground mb-2 px-1">ACTIVE NOW</div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar">
                {creators.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      const id = ensureFromHandle(c.handle);
                      if (id) setOpenId(id);
                    }}
                    className="shrink-0 flex flex-col items-center gap-1 tilt-press"
                  >
                    <div className="relative size-12 rounded-full conic-ring">
                      <img src={c.avatar} className="size-12 rounded-full object-cover" alt="" />
                      <span className="absolute bottom-0 right-0 size-3 rounded-full bg-[oklch(0.78_0.18_150)] ring-2 ring-background" />
                    </div>
                    <span className="text-[10px] truncate max-w-[60px]">{c.name.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Lists */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {(tab === "all" || tab === "dms") && (
              <ul className="p-2 space-y-1">
                {filtered.map((t, i) => {
                  const active = openId === t.id;
                  const msgs = messagesOf(t.id);
                  const last = msgs[msgs.length - 1];
                  const unread = unreadOf(t.id);
                  const preview = last
                    ? `${last.from === "me" ? "You: " : ""}${last.text}`
                    : "Say hi 👋";
                  return (
                    <li key={t.id} style={{ animationDelay: `${i * 40}ms` }} className="animate-rise">
                      <button
                        onClick={() => setOpenId(t.id)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-2xl text-left transition ${
                          active ? "bg-white/8 ring-1 ring-white/15" : "hover:bg-white/5"
                        }`}
                      >
                        <div className="relative size-12 rounded-full conic-ring shrink-0">
                          <img src={t.peer.avatar} className="size-12 rounded-full object-cover" alt="" />
                          {t.peer.online && <span className="absolute bottom-0 right-0 size-3 rounded-full bg-[oklch(0.78_0.18_150)] ring-2 ring-background" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-sm font-semibold truncate flex items-center gap-1">
                              {t.peer.name}
                              <VerifiedBadge kind={t.peer.verified} className="!size-3.5" />
                              {t.pinned && <Pin className="size-3 text-primary" />}
                            </div>
                            <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">{last ? fmtAgo(last.ts) : ""}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2 mt-0.5">
                            <p className={`text-xs truncate ${unread ? "text-foreground" : "text-muted-foreground"}`}>
                              {preview}
                            </p>
                            {unread ? (
                              <span className="size-5 grid place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground glow-gold">{unread}</span>
                            ) : null}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {tab === "requests" && (
              <ul className="p-3 space-y-2">
                {requests.map((r, i) => (
                  <li key={r.who.id} style={{ animationDelay: `${i * 60}ms` }} className="animate-rise rounded-2xl glass border border-white/10 p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative size-11 rounded-full conic-ring shrink-0">
                        <img src={r.who.avatar} className="size-11 rounded-full object-cover" alt="" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold flex items-center gap-1">{r.who.name} <VerifiedBadge kind={r.who.verified} className="!size-3.5" /></div>
                        <div className="text-[11px] text-muted-foreground truncate">{r.msg}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => toast.success("Request accepted")} className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground glow-gold">Accept</button>
                      <button onClick={() => toast("Request dismissed")} className="flex-1 py-1.5 rounded-lg text-xs glass border border-white/10">Decline</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {tab === "activity" && (
              <ul className="p-3 space-y-2">
                {activity.map((a, i) => (
                  <li key={i} style={{ animationDelay: `${i * 50}ms` }} className="animate-rise rounded-2xl glass border border-white/10 p-3 flex items-center gap-3">
                    <div className="relative">
                      <img src={a.who.avatar} className="size-11 rounded-full object-cover" alt="" />
                      <div className="absolute -bottom-1 -right-1 size-6 rounded-full bg-background grid place-items-center border border-white/10">
                        <a.icon className={`size-3.5 ${a.color}`} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm"><span className="font-semibold">{a.who.name}</span> {a.text}</div>
                      <div className="text-[11px] text-muted-foreground">{a.time} ago</div>
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
                  {open.peer.online && <span className="absolute bottom-0 right-0 size-3 rounded-full bg-[oklch(0.78_0.18_150)] ring-2 ring-background" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold flex items-center gap-1">{open.peer.name} <VerifiedBadge kind={open.peer.verified} className="!size-3.5" /></div>
                  <div className="text-[11px] text-muted-foreground">@{open.peer.handle} · {open.peer.online ? "Active now" : "Last seen recently"}</div>
                </div>
                <div className="flex items-center gap-1">
                  <IconBtn icon={Phone} onClick={() => toast("Calling…")} />
                  <IconBtn icon={Video} onClick={() => toast("Video call")} />
                  <IconBtn icon={MoreHorizontal} onClick={() => toast("Conversation options")} />
                </div>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar relative">
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,oklch(0.2_0.07_290_/_0.3),transparent_60%)]" />
                <div className="text-center text-[10px] tracking-[0.2em] text-muted-foreground py-2">TODAY</div>
                {thread.map((m, i) => {
                  const mine = m.from === "me";
                  const prevSameSide = thread[i - 1]?.from === m.from;
                  return (
                    <div key={m.id} className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"} animate-rise`}>
                      {!mine && !prevSameSide && (
                        <img src={open.peer.avatar} className="size-7 rounded-full object-cover" alt="" />
                      )}
                      {!mine && prevSameSide && <div className="w-7 shrink-0" />}
                      <div className={`max-w-[70%] relative ${mine ? "items-end" : "items-start"} flex flex-col`}>
                        {m.text && (
                          <div
                            className={`px-3.5 py-2 text-sm leading-relaxed rounded-2xl ${
                              mine
                                ? "bg-primary text-primary-foreground rounded-br-sm shadow-[0_0_18px_oklch(0.82_0.16_85_/_0.35)]"
                                : "glass border border-white/10 rounded-bl-sm"
                            }`}
                          >
                            {m.text}
                          </div>
                        )}
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
              <div className="p-3 border-t border-white/5">
                <div className="flex items-end gap-2 rounded-2xl glass border border-white/10 px-3 py-2 focus-within:border-primary/50 transition">
                  <button className="text-muted-foreground hover:text-primary"><Plus className="size-5" /></button>
                  <button className="text-muted-foreground hover:text-primary"><ImageIcon className="size-5" /></button>
                  <button className="text-muted-foreground hover:text-primary"><Smile className="size-5" /></button>
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onSend()}
                    placeholder={`Message ${open.peer.name.split(" ")[0]}…`}
                    className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground py-1"
                  />
                  {draft.trim() ? (
                    <button onClick={onSend} className="size-9 grid place-items-center rounded-xl bg-primary text-primary-foreground glow-gold tilt-press">
                      <Send className="size-4" />
                    </button>
                  ) : (
                    <button onClick={() => toast("Recording voice note…")} className="size-9 grid place-items-center rounded-xl glass border border-white/10 tilt-press">
                      <Mic className="size-4 text-primary" />
                    </button>
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground text-center mt-1.5 flex items-center justify-center gap-1">
                  <Sparkles className="size-3 text-primary" /> End-to-end encrypted · Trey-I assist enabled
                </div>
              </div>
            </>
          ) : (
            <EmptyState />
          )}
        </section>
      </div>
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

function EmptyState() {
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
        <button className="px-4 py-2 rounded-xl text-sm font-semibold border border-primary text-primary glow-gold">Start a new conversation</button>
      </div>
    </div>
  );
}

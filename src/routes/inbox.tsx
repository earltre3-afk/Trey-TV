import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useEffect, useState, useCallback } from "react";
import { z } from "zod";
import {
  ArrowLeft,
  Bell,
  Bot,
  CalendarClock,
  Check,
  CheckCheck,
  Crown,
  Flag,
  Filter,
  Ghost,
  Image as ImageIcon,
  Inbox as InboxIcon,
  Loader2,
  MessageCirclePlus,
  MessageCircle,
  Mic,
  MoreHorizontal,
  Phone,
  Pin,
  Plus,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Smile,
  Sparkles,
  Star,
  Timer,
  UserPlus,
  Video,
  Wand2,
  X,
  type LucideIcon,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Logo } from "@/components/brand/Logo";
import { creators, currentUser } from "@/lib/mock-data";
import { VerifiedBadge } from "@/components/brand/Badge";
import { toast } from "sonner";
import { useMessages } from "@/lib/messages-store";
import { NewConversationSheet } from "@/components/inbox/NewConversationSheet";
import { ChatOnboarding } from "@/components/inbox/ChatOnboarding";
import { PlusMenu } from "@/components/inbox/PlusMenu";
import { GhostMessagePopup } from "@/components/inbox/GhostMessagePopup";
import { NeonEmojiPicker } from "@/components/inbox/NeonEmojiPicker";
import { Tremoji } from "@/components/inbox/Tremoji";
import { useAuth } from "@/lib/auth";
import { useNotifications } from "@/lib/notifications-store";
import { createBrowserClient } from "@/lib/supabase-browser";
import { ProfilePictureLink } from "@/components/profile/ProfileAvatarLink";
import { FwdGifPicker } from "@/components/fwd/FwdGifPicker";
import { buildFwdGifDetailUrl, type FwdGifPayload } from "@/lib/fwd/picker";
import { useMarkFwdGifUsed } from "@/lib/fwd-gif-api";
import { getMutualFollows } from "@/lib/social-relationships";
import { generateSmartReplies, summarizeInboxThread } from "@/lib/trey-i/vertex.server";

export const Route = createFileRoute("/inbox")({
  component: Inbox,
  validateSearch: (s: Record<string, unknown>) => z.object({ to: z.string().optional() }).parse(s),
  head: () => ({
    meta: [
      { title: "Inbox - Trey TV" },
      { name: "description", content: "Premium TreyTV creator-network inbox for DMs, requests, AI assist, voice notes, and collaborations." },
    ],
  }),
});

type Tab = "all" | "priority" | "requests" | "collabs" | "activity" | "ai";

const activity = [
  { icon: Star, color: "text-primary", who: creators[0], text: "moved your post into their VIP watchlist", time: "2m" },
  { icon: UserPlus, color: "text-[oklch(0.82_0.15_215)]", who: creators[1], text: "started following your creator room", time: "12m" },
  { icon: MessageCircle, color: "text-[oklch(0.7_0.25_340)]", who: creators[2], text: "commented on your latest drop", time: "1h" },
  { icon: Sparkles, color: "text-[oklch(0.78_0.18_150)]", who: creators[3], text: "asked Trey-I for a collab summary", time: "3h" },
  { icon: Crown, color: "text-primary", who: creators[4], text: "unlocked a premium reply lane", time: "5h" },
];

const requests = creators.slice(2, 5).map((c, i) => ({
  who: c,
  msg: ["Big fan. Would love to build a collab room.", "Saw your last drop. Open to a feature?", "Is your management accepting pitches right now?"][i],
}));

const creatorMeta = [
  { role: "Music Producer", followers: "214K followers", tag: "Hot Collaborator", tone: "pink" as const },
  { role: "Artist", followers: "187K followers", tag: "Beat Maker", tone: "blue" as const },
  { role: "Creative Director", followers: "92K followers", tag: "Same Vibes", tone: "pink" as const },
  { role: "Producer", followers: "156K followers", tag: "Collab Ready", tone: "blue" as const },
  { role: "Vocalist", followers: "68K followers", tag: "Vocalist", tone: "pink" as const },
];

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

function isCollabText(text = "") {
  return /collab|feature|studio|cut|track|session|review|management/i.test(text);
}

function Inbox() {
  const { to } = Route.useSearch();
  const { user } = useAuth();
  const markUsed = useMarkFwdGifUsed();
  const { unreadCount } = useNotifications();

  const [mutualFollows, setMutualFollows] = useState<any[]>([]);
  const [loadingMutuals, setLoadingMutuals] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchMutuals = async () => {
      setLoadingMutuals(true);
      try {
        const dbMutuals = await getMutualFollows();
        if (cancelled) return;
        setMutualFollows(dbMutuals);
      } catch (err) {
        console.error("Error loading mutuals inside inbox:", err);
      } finally {
        if (!cancelled) setLoadingMutuals(false);
      }
    };
    if (user) {
      fetchMutuals();
    }
  }, [user]);

  const isMutual = useCallback((peer: any) => {
    if (!peer) return false;
    if (peer.handle === "chrishorizon" || peer.handle === "treyipicks") return true;
    if (peer.id === "chris" || peer.id === "treyi") return true;
    return mutualFollows.some((m) => m.username === peer.handle || m.id === peer.id);
  }, [mutualFollows]);

  const {
    threads,
    messagesOf,
    unreadOf,
    totalUnread,
    send: sendMessage,
    sendGhost,
    sendMedia,
    sendFwdGif,
    sendVoice,
    markRead,
    ensureFromHandle,
    sendCollabProposal,
    sendScheduledReply,
  } = useMessages();

  const [tab, setTab] = useState<Tab>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [peerTyping, setPeerTyping] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [smartSort, setSmartSort] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [aiDismissed, setAiDismissed] = useState<Record<string, boolean>>({});
  const [collabDismissed, setCollabDismissed] = useState<Record<string, boolean>>({});
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showGhostPopup, setShowGhostPopup] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFwdPicker, setShowFwdPicker] = useState(false);
  const [gifAttachment, setGifAttachment] = useState<FwdGifPayload | null>(null);

  const [ghostDraft, setGhostDraft] = useState("");
  const [matchedGroups, setMatchedGroups] = useState<any[]>([]);
  const [openGroup, setOpenGroup] = useState<any | null>(null);
  const [groupMessages, setGroupMessages] = useState<any[]>([]);
  const [groupDraft, setGroupDraft] = useState("");
  const [callRequests, setCallRequests] = useState<Record<string, string>>({});

  const [recording, setRecording] = useState(false);
  const [recorderMs, setRecorderMs] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recorderChunksRef = useRef<Blob[]>([]);
  const recorderTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_VOICE_SECS = 20;

  useEffect(() => {
    if (!to) return;
    const id = ensureFromHandle(to);
    if (id) setOpenId(id);
  }, [to, ensureFromHandle]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const loadGroups = async () => {
      const supabase = createBrowserClient() as any;
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) return;
      const { data, error } = await supabase
        .from("zodiac_group_members")
        .select("group_thread_id, source, joined_at, thread:zodiac_group_threads(id, group_type, group_key, group_name, group_description, zodiac_sign, city, interest_key, min_age, max_age)")
        .eq("user_id", userId)
        .is("left_at", null)
        .order("joined_at", { ascending: false })
        .limit(6);
      if (!cancelled && !error) setMatchedGroups(data ?? []);
    };
    loadGroups().catch(() => {});
    return () => { cancelled = true; };
  }, [user?.uid]);

  const leaveMatchedGroup = async (groupThreadId: string) => {
    const supabase = createBrowserClient() as any;
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return;
    const { error } = await supabase
      .from("zodiac_group_members")
      .update({ left_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("group_thread_id", groupThreadId);
    if (error) {
      toast.error("Could not leave group");
      return;
    }
    setMatchedGroups((groups) => groups.filter((g) => g.group_thread_id !== groupThreadId));
    if (openGroup?.id === groupThreadId) setOpenGroup(null);
    toast.success("Group removed from your inbox");
  };

  const loadGroupMessages = useCallback(async (group: any) => {
    const supabase = createBrowserClient() as any;
    const { data, error } = await supabase
      .from("zodiac_group_messages")
      .select("id, body, sender_id, created_at, sender:sender_id(id, public_profile_uid, display_name, username, avatar_url)")
      .eq("group_thread_id", group.id)
      .eq("moderation_status", "active")
      .order("created_at", { ascending: true })
      .limit(100);
    if (!error) setGroupMessages(data ?? []);
  }, []);

  const openMatchedGroup = useCallback((group: any) => {
    setOpenId(null);
    setOpenGroup(group);
    void loadGroupMessages(group);
  }, [loadGroupMessages]);

  useEffect(() => {
    if (!openGroup?.id) return;
    const supabase = createBrowserClient() as any;
    const channel = supabase
      .channel(`zodiac-group:${openGroup.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "zodiac_group_messages",
          filter: `group_thread_id=eq.${openGroup.id}`,
        },
        () => {
          void loadGroupMessages(openGroup);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadGroupMessages, openGroup]);

  const sendGroupMessage = async () => {
    if (!openGroup || !groupDraft.trim()) return;
    const supabase = createBrowserClient() as any;
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return toast.error("Please sign in to send messages");
    const text = groupDraft.trim();
    setGroupDraft("");
    const { error } = await supabase.from("zodiac_group_messages").insert({
      group_thread_id: openGroup.id,
      sender_id: userId,
      body: text,
    });
    if (error) {
      toast.error("Could not send group message");
      setGroupDraft(text);
      return;
    }
    await loadGroupMessages(openGroup);
  };

  const sendGroupFwdGif = async (gif: { title?: string | null; url: string }) => {
    if (!openGroup) return;
    const supabase = createBrowserClient() as any;
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return toast.error("Please sign in to send with FWD");
    const body = gif.title ? `FWD · ${gif.title}\n${gif.url}` : `FWD GIF\n${gif.url}`;
    const { error } = await supabase.from("zodiac_group_messages").insert({
      group_thread_id: openGroup.id,
      sender_id: userId,
      body,
    });
    if (error) return toast.error("FWD GIF failed");
    toast.success("Sent with FWD");
    await loadGroupMessages(openGroup);
  };

  const reportGroup = async (group: any, messageId?: string) => {
    const reason = window.prompt("What should moderation review?");
    if (!reason?.trim()) return;
    const supabase = createBrowserClient() as any;
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return;
    const { error } = await supabase.from("zodiac_group_reports").insert({
      reporter_id: userId,
      group_thread_id: group.id,
      message_id: messageId ?? null,
      reason: reason.trim(),
    });
    if (error) return toast.error("Could not submit report");
    toast.success("Report sent to moderation");
  };

  const blockGroupMember = async (group: any, blockedUserId: string) => {
    const supabase = createBrowserClient() as any;
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId || !blockedUserId || blockedUserId === userId) return;
    const { error } = await supabase.from("zodiac_group_blocks").upsert({
      blocker_id: userId,
      blocked_user_id: blockedUserId,
      group_thread_id: group.id,
    });
    if (error) return toast.error("Could not block member");
    toast.success("Member blocked in this group");
    await loadGroupMessages(group);
  };

  const stats = useMemo(() => {
    let priorityCount = 0;
    let collabsCount = 0;
    let aiCount = 0;

    threads.forEach((t) => {
      const msgs = messagesOf(t.id);
      const last = msgs.at(-1);
      const unread = unreadOf(t.id);
      const isMut = isMutual(t.peer);

      if (isMut) {
        if (t.pinned || unread > 1) priorityCount++;
        if (isCollabText(last?.text)) collabsCount++;
        if (unread > 0 || isCollabText(last?.text)) aiCount++;
      }
    });

    const onlineMutuals = threads.filter((t) => t.peer.online && isMutual(t.peer)).length;
    const nonMutualThreads = threads.filter((t) => !isMutual(t.peer));

    return {
      online: onlineMutuals,
      collabs: collabsCount,
      priority: priorityCount,
      requests: nonMutualThreads.length,
      totalMutualUnread: threads.reduce((acc, t) => isMutual(t.peer) ? acc + unreadOf(t.id) : acc, 0),
      totalNonMutualUnread: threads.reduce((acc, t) => !isMutual(t.peer) ? acc + unreadOf(t.id) : acc, 0),
    };
  }, [threads, messagesOf, unreadOf, isMutual]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = threads.filter((t) => {
      const msgs = messagesOf(t.id);
      const last = msgs.at(-1);
      const haystack = [t.peer.name, t.peer.handle, last?.text ?? ""].join(" ").toLowerCase();
      if (q && !haystack.includes(q)) return false;
      if (focusMode && unreadOf(t.id) === 0 && !t.pinned) return false;
      
      const isMut = isMutual(t.peer);
      if (tab === "all") return isMut;
      if (tab === "requests") return !isMut;
      if (tab === "priority") return isMut && (t.pinned || unreadOf(t.id) > 1);
      if (tab === "collabs") return isMut && isCollabText(last?.text);
      if (tab === "ai") return isMut && (unreadOf(t.id) > 0 || isCollabText(last?.text));
      return false;
    });

    return [...base].sort((a, b) => {
      const am = messagesOf(a.id).at(-1);
      const bm = messagesOf(b.id).at(-1);
      if (!smartSort) return (bm?.ts ?? 0) - (am?.ts ?? 0);
      const score = (id: string, pinned?: boolean, online?: boolean) =>
        (pinned ? 5000 : 0) + unreadOf(id) * 1000 + (online ? 75 : 0) + (messagesOf(id).at(-1)?.ts ?? 0) / 100000000;
      return score(b.id, b.pinned, b.peer.online) - score(a.id, a.pinned, a.peer.online);
    });
  }, [threads, query, tab, focusMode, smartSort, messagesOf, unreadOf, isMutual]);

  const open = threads.find((t) => t.id === openId) ?? null;
  const thread = openId ? messagesOf(openId) : [];
  const lastOpenMessage = thread.at(-1);
  const shouldShowCollab = !!open && !collabDismissed[open.id] && isCollabText(lastOpenMessage?.text);
  const shouldShowAi = !!open && !aiDismissed[open.id] && thread.length > 0;
  const profileUid = user?.uid ?? currentUser.uid;
  const profileAvatar = user?.avatar ?? currentUser.avatar;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [thread.length, openId]);

  useEffect(() => {
    if (openId) markRead(openId);
  }, [openId, thread.length, markRead]);

  const onSend = () => {
    if (!openId) return;
    if (!draft.trim() && !gifAttachment) {
      toast.error("Message cannot be blank");
      return;
    }
    if (gifAttachment) {
      void sendFwdGif(openId, gifAttachment, draft.trim() || undefined);
      markUsed.mutate({ id: gifAttachment.gif_id, gif_url: gifAttachment.url });
      setGifAttachment(null);
    } else {
      sendMessage(openId, draft);
    }
    setDraft("");
    setTimeout(() => setPeerTyping(true), 600);
    setTimeout(() => setPeerTyping(false), 2800);
  };

  const handleOpenFwd = useCallback(() => {
    if (!user) { toast.error("Please sign in to use FWD GIFs"); return; }
    setShowFwdPicker(true);
  }, [user]);

  const stopAndSendVoice = useCallback(() => {
    const mr = mediaRecorderRef.current;
    if (!mr || mr.state === "inactive") return;
    mr.onstop = () => {
      mr.stream?.getTracks().forEach((t) => t.stop());
      if (recorderChunksRef.current.length && openId) {
        const blob = new Blob(recorderChunksRef.current, { type: "audio/webm" });
        sendVoice(openId, blob, recorderMs / 1000);
      }
    };
    mr.stop();
    if (recorderTimerRef.current) clearInterval(recorderTimerRef.current);
    setRecording(false);
    setRecorderMs(0);
  }, [openId, recorderMs, sendVoice]);

  const startRecording = useCallback(async () => {
    if (!openId) {
      toast.error("Pick a conversation first");
      return;
    }
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
      toast.success("Recording voice note — tap again to stop");
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
  }, [openId, stopAndSendVoice]);

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

  const quickActions = [
    {
      label: "AI Summary",
      icon: Bot,
      onClick: () => {
        if (!open) {
          toast.error("Select a conversation to summarize");
          return;
        }
        const threadMsgs = messagesOf(open.id);
        if (threadMsgs.length === 0) {
          toast("No messages to summarize yet.");
          return;
        }
        toast.promise(
          (async () => {
            const payload = threadMsgs.map(m => ({
              from: m.from === "me" ? "Me" : open.peer.name,
              text: m.text || ""
            }));
            const res = await summarizeInboxThread({ data: { messages: payload, peerName: open.peer.name } });
            if (res.summary) {
              setDraft(res.summary);
              return res.summary;
            }
            throw new Error("Could not generate summary");
          })(),
          {
            loading: "Trey-I is reading the vibe...",
            success: (summary) => (
              <div className="flex flex-col gap-1 p-1">
                <div className="flex items-center gap-2 text-xs font-black tracking-widest text-[oklch(0.82_0.15_215)]">
                  <Bot className="size-4 animate-pulse" />
                  TREY-I THREAD SUMMARY
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">"{summary}"</p>
                <p className="text-[10px] text-muted-foreground">Summary added to your composer.</p>
              </div>
            ),
            error: "Failed to generate thread summary.",
          }
        );
      }
    },
    { label: "Schedule Reply", icon: CalendarClock, onClick: () => {
      if (!openId) {
        toast.error("Please select a conversation to schedule a reply.");
        return;
      }
      setShowScheduleModal(true);
    }},
    { label: "Create Collab", icon: UserPlus, onClick: () => {
      if (!openId) {
        toast.error("Please select a conversation to propose a collab.");
        return;
      }
      setShowCollabModal(true);
    }},
    { label: "Voice Note", icon: Mic, onClick: startRecording },
  ];

  const requestCall = useCallback(async (callType: "audio" | "video") => {
    if (!open) return;
    if (!user) {
      toast.error("Please sign in to call");
      return;
    }
    const hasMediaSupport =
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function" &&
      typeof window !== "undefined" &&
      window.isSecureContext;
    if (!hasMediaSupport) {
      toast.error("Calling needs a secure browser with microphone support. A call request was not sent.");
      return;
    }
    const supabase = createBrowserClient() as any;
    const { data: auth } = await supabase.auth.getUser();
    const callerId = auth.user?.id;
    if (!callerId) {
      toast.error("Please sign in to call");
      return;
    }
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(open.peer.id)) {
      toast.error("This conversation cannot receive browser calls yet.");
      return;
    }
    setCallRequests((s) => ({ ...s, [open.id]: "requested" }));
    const { error } = await supabase.from("call_requests").insert({
      caller_id: callerId,
      recipient_id: open.peer.id,
      thread_id: open.id,
      call_type: callType,
      status: "requested",
    });
    if (error) {
      setCallRequests((s) => {
        const next = { ...s };
        delete next[open.id];
        return next;
      });
      toast.error(error.message || "Could not request call");
      return;
    }
    toast.success(callType === "video" ? "Video call requested" : "Call requested");
  }, [open, user]);

  return (
    <AppShell wide>
      <div className="mx-auto flex max-w-[1480px] flex-col gap-4 px-3 sm:px-0">
        <InboxTopRail
          unread={stats.totalMutualUnread + unreadCount}
          online={stats.online}
          profileUid={profileUid}
          profileAvatar={profileAvatar}
          onSearch={() => document.getElementById("inbox-command-search")?.focus()}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(360px,430px)_1fr] lg:h-[calc(100dvh-10rem)]">
          <section className={`${openId || openGroup ? "hidden lg:flex" : "flex"} relative min-h-[calc(100dvh-12rem)] lg:min-h-0 flex-col overflow-hidden rounded-[32px] liquid-glass border border-white/10 shadow-[0_24px_90px_-45px_oklch(0.82_0.15_215_/_0.65)]`}>
            <div className="pointer-events-none absolute -left-20 top-20 opacity-[0.12] mix-blend-screen"><div className="chat-orb-1" /></div>
            <div className="pointer-events-none absolute -right-20 top-80 opacity-[0.12] mix-blend-screen"><div className="chat-orb-2" /></div>
            <div className="relative z-10 border-b border-white/10 p-4 sm:p-5">
              <InboxHero totalUnread={stats.totalMutualUnread} stats={stats} onCompose={() => setNewOpen(true)} />
              <SearchCommand value={query} onChange={setQuery} onAi={() => setTab("ai")} />
              <FilterPills tab={tab} onTab={setTab} stats={stats} />
            </div>

            {tab !== "activity" && tab !== "requests" && (
              <ActiveNowStrip
                onNote={() => toast("Your note is ready")}
                onPick={(handle) => {
                  const id = ensureFromHandle(handle);
                  if (id) { setOpenGroup(null); setOpenId(id); }
                }}
              />
            )}

            {tab !== "activity" && tab !== "requests" && (
              <SmartControls smartSort={smartSort} focusMode={focusMode} onSmartSort={setSmartSort} onFocus={setFocusMode} />
            )}

            <div className="flex-1 overflow-y-auto px-2 py-2 no-scrollbar">
              {matchedGroups.length > 0 && tab === "all" && (
                <MatchedGroupsList groups={matchedGroups} onOpen={openMatchedGroup} onLeave={leaveMatchedGroup} />
              )}
              {(tab === "all" || tab === "priority" || tab === "collabs" || tab === "ai" || tab === "requests") && (
                <ul className="space-y-2">
                  {filtered.map((t, i) => (
                    <ThreadCard
                      key={t.id}
                      thread={t}
                      last={messagesOf(t.id).at(-1)}
                      unread={unreadOf(t.id)}
                      active={openId === t.id}
                      ai={tab === "ai" || isCollabText(messagesOf(t.id).at(-1)?.text)}
                      index={i}
                      onClick={() => { setOpenGroup(null); setOpenId(t.id); }}
                    />
                  ))}
                  {filtered.length === 0 && <EmptyList onCompose={() => setNewOpen(true)} />}
                </ul>
              )}

              {tab === "activity" && <ActivityList />}
            </div>

            <QuickActionDock actions={quickActions} />
          </section>

          <section className={`${openId || openGroup ? "flex" : "hidden lg:flex"} min-h-[calc(100dvh-12rem)] lg:min-h-0 flex-col overflow-hidden rounded-[32px] liquid-glass border border-white/10 shadow-[0_24px_90px_-45px_oklch(0.7_0.25_340_/_0.55)]`}>
            {openGroup ? (
              <GroupChatPanel
                group={openGroup}
                messages={groupMessages}
                draft={groupDraft}
                onDraft={setGroupDraft}
                onSend={sendGroupMessage}
                onBack={() => setOpenGroup(null)}
                onReport={reportGroup}
                onBlock={blockGroupMember}
              />
            ) : open ? (
              <>
                <ThreadHeader
                  open={open}
                  peerTyping={peerTyping}
                  callStatus={callRequests[open.id]}
                  onBack={() => setOpenId(null)}
                  onAi={() => setAiDismissed((s) => ({ ...s, [open.id]: false }))}
                  onCall={requestCall}
                />
                <PinnedMessageBar open={open} last={lastOpenMessage} />

                <div ref={scrollRef} className="relative flex-1 overflow-y-auto p-4 sm:p-5 no-scrollbar">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(ellipse_at_top,oklch(0.82_0.15_215_/_0.13),transparent_62%)]" />
                  <div className="relative space-y-3">
                    <div className="text-center">
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold tracking-[0.24em] text-muted-foreground">
                        TODAY <span className="size-1 rounded-full bg-primary" /> {thread.length} MESSAGES
                      </span>
                    </div>

                    {thread.map((m, i) => (
                      <MessageRow key={m.id} message={m} open={open} previousFrom={thread[i - 1]?.from} index={i} />
                    ))}

                    {peerTyping && (
                      <div className="flex items-end gap-2 justify-start animate-msg-pop">
                        <ProfilePictureLink publicProfileUid={open.peer.publicProfileUid} label={`Open @${open.peer.handle}'s public profile`}>
                          <img src={open.peer.avatar} className="size-7 rounded-full object-cover" alt="" />
                        </ProfilePictureLink>
                        <div className="msg-bubble-them rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                          <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {shouldShowAi && (
                  <AiReplyPanel
                    messages={thread}
                    peerName={open.peer.name}
                    onClose={() => setAiDismissed((s) => ({ ...s, [open.id]: true }))}
                    onSend={(text) => setDraft(text)}
                  />
                )}

                {shouldShowCollab && (
                  <CollabPanel
                    open={open}
                    onClose={() => setCollabDismissed((s) => ({ ...s, [open.id]: true }))}
                    onStart={() => setShowCollabModal(true)}
                  />
                )}

                <Composer
                  draft={draft}
                  onDraft={setDraft}
                  onSend={onSend}
                  openName={open.peer.name}
                  recording={recording}
                  recorderMs={recorderMs}
                  maxSecs={MAX_VOICE_SECS}
                  onStartRecording={startRecording}
                  onStopRecording={stopAndSendVoice}
                  onCancelRecording={cancelRecording}
                  showPlusMenu={showPlusMenu}
                  showGhostPopup={showGhostPopup}
                  showEmojiPicker={showEmojiPicker}
                  onPlusMenu={setShowPlusMenu}
                  onGhostPopup={setShowGhostPopup}
                  onEmojiPicker={setShowEmojiPicker}
                  onGhostDraft={setGhostDraft}
                  fileInputRef={fileInputRef}
                  onPhotoSelect={onPhotoSelect}
                  onOpenFwd={handleOpenFwd}
                  gifAttachment={gifAttachment}
                  onRemoveGif={() => setGifAttachment(null)}
                  onSendGhost={(secs, label) => {
                    if (openId) sendGhost(openId, draft || ghostDraft, secs, label);
                    setDraft("");
                    setGhostDraft("");
                    setShowGhostPopup(false);
                  }}
                />
              </>
            ) : (
              <EmptyState onNew={() => setNewOpen(true)} />
            )}
          </section>
        </div>
      </div>

      <NewConversationSheet open={newOpen} onClose={() => setNewOpen(false)} onPicked={(id) => { setOpenGroup(null); setOpenId(id); }} />
      <FwdGifPicker
        context="message"
        open={showFwdPicker}
        treyTvUid={profileUid}
        draft={draft}
        onClose={() => setShowFwdPicker(false)}
        onSelect={(gif) => {
          setShowFwdPicker(false);
          if (openGroup) {
            void sendGroupFwdGif(gif);
          } else {
            setGifAttachment(gif);
          }
        }}
      />
      <ChatOnboarding />

      <CollabProposalModal
        isOpen={showCollabModal}
        onClose={() => setShowCollabModal(false)}
        peerName={open?.peer.name || ""}
        onSend={(input) => {
          if (openId) sendCollabProposal(openId, input);
        }}
      />

      <ScheduleReplyModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        peerName={open?.peer.name || ""}
        onSend={(text, timeLabel, delayMs) => {
          if (openId) sendScheduledReply(openId, text, timeLabel, delayMs);
        }}
      />
    </AppShell>
  );
}

function InboxTopRail({ unread, online, profileUid, profileAvatar, onSearch }: { unread: number; online: number; profileUid: string; profileAvatar: string; onSearch: () => void }) {
  return (
    <div className="hidden items-center justify-between gap-3 rounded-[28px] border border-white/10 bg-[rgba(8,17,31,.66)] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-[18px] lg:flex">
      <Link to="/" className="relative flex items-center gap-3" aria-label="Trey TV home">
        <Logo className="h-14 drop-shadow-[0_0_20px_oklch(0.82_0.16_85_/_0.55)]" />
        <span className="hidden text-[10px] font-bold tracking-[0.26em] text-muted-foreground xl:inline">CREATOR NETWORK</span>
      </Link>
      <div className="flex items-center gap-2">
        <StatusChip icon={ShieldCheck} label={`${online} online`} tone="blue" />
        <StatusChip icon={Crown} label="Gold lane" tone="gold" />
        <button onClick={onSearch} className="size-10 grid place-items-center rounded-2xl glass border border-white/10 hover:border-primary/40" aria-label="Search inbox">
          <Search className="size-4" />
        </button>
        <button onClick={() => toast("Notifications")} className="relative size-10 grid place-items-center rounded-2xl glass border border-white/10 hover:border-primary/40" aria-label="Notifications">
          <Bell className="size-4" />
          {unread > 0 && <span className="absolute right-2 top-2 size-2 rounded-full bg-[oklch(0.7_0.25_340)] shadow-[0_0_12px_oklch(0.7_0.25_340)]" />}
        </button>
        <Link to="/u/$uid" params={{ uid: profileUid }} className="relative size-10 rounded-full conic-ring" aria-label="Profile">
          <img src={profileAvatar || undefined} className="size-full rounded-full object-cover" alt="" />
        </Link>
      </div>
    </div>
  );
}

function InboxHero({ totalUnread, stats, onCompose }: { totalUnread: number; stats: { requests: number; priority: number; collabs: number }; onCompose: () => void }) {
  const counters = [
    { label: "Unread", value: totalUnread },
    { label: "Unknown", value: stats.requests },
    { label: "Priority", value: stats.priority },
  ];
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[oklch(0.7_0.25_340_/_0.4)] bg-[linear-gradient(135deg,oklch(0.05_0.02_250_/_0.92),oklch(0.12_0.06_285_/_0.68),oklch(0.08_0.04_230_/_0.76))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,.1),0_0_28px_-18px_oklch(0.82_0.15_215)] transition-all duration-500 hover:border-[oklch(0.7_0.25_340_/_0.6)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,.1),0_0_40px_-15px_oklch(0.7_0.25_340)] sm:rounded-[28px] sm:p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,oklch(0.82_0.16_85_/_0.15),transparent_50%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative flex items-start justify-between gap-2">
        <div className="flex min-w-0 gap-2.5">
          <div className="hidden size-11 shrink-0 place-items-center rounded-full border border-[oklch(0.7_0.25_340_/_0.5)] bg-[oklch(0.7_0.25_340_/_0.14)] text-[oklch(0.85_0.2_340)] shadow-[0_0_24px_-8px_oklch(0.7_0.25_340)] transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 sm:grid">
            <MessageCirclePlus className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[9px] font-bold tracking-[0.24em] text-primary">
              <InboxIcon className="size-2.5" /> INBOX
            </div>
            <h1 className="mt-1 text-xl font-black leading-tight sm:mt-2 sm:text-3xl">
              <span className="bg-[linear-gradient(110deg,#FFC857,#FF7A59,#FF4FD8,#8B5CF6,#48C8FF)] bg-clip-text text-transparent">Connect with your crew</span>
            </h1>
            <p className="mt-1 text-[11px] leading-snug text-muted-foreground sm:text-xs">Find creators and conversations that move you forward.</p>
          </div>
        </div>
        <button onClick={onCompose} className="send-btn-rocket inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-2.5 text-xs font-black text-primary-foreground shadow-[0_0_22px_oklch(0.82_0.16_85_/_0.4)] sm:h-11 sm:rounded-2xl sm:px-4 sm:text-sm">
          <Plus className="size-3.5" /> <span className="hidden sm:inline">Compose</span>
        </button>
      </div>
      <div className="relative mt-2.5 grid grid-cols-3 gap-1.5 sm:mt-4 sm:gap-2">
        {counters.map((c) => (
          <div key={c.label} className="rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-2 sm:rounded-2xl sm:p-3">
            <div className="text-base font-black tabular-nums sm:text-lg">{c.value}</div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:text-[10px]">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SearchCommand({ value, onChange, onAi }: { value: string; onChange: (v: string) => void; onAi: () => void }) {
  return (
    <div className="mt-2.5 flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 focus-within:border-primary/50 sm:mt-3 sm:h-12 sm:rounded-2xl">
      <Search className="size-3.5 shrink-0 text-muted-foreground sm:size-4" />
      <input
        id="inbox-command-search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search creators, messages..."
        className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground sm:text-sm"
      />
      <button onClick={onAi} className="grid size-7 place-items-center rounded-lg border border-primary/30 bg-primary/10 text-primary sm:size-8 sm:rounded-xl" aria-label="AI assist">
        <Wand2 className="size-3.5" />
      </button>
    </div>
  );
}

function FilterPills({ tab, onTab, stats }: { tab: Tab; onTab: (tab: Tab) => void; stats: { requests: number; priority: number; collabs: number; totalMutualUnread: number; totalNonMutualUnread: number } }) {
  const tabs: { id: Tab; label: string; count?: number; disabled?: boolean }[] = [
    { id: "ai", label: "AI Match" },
    { id: "all", label: "Online", count: stats.totalMutualUnread },
    { id: "collabs", label: "Collab Ready", count: stats.collabs },
    { id: "priority", label: "Same Vibes", count: stats.priority },
    { id: "requests", label: "Unknown", count: stats.requests },
    { id: "activity", label: "Activity", count: activity.length },
  ];
  return (
    <div className="-mx-1 mt-2.5 flex gap-1.5 overflow-x-auto px-1 pb-1 no-scrollbar sm:mt-3 sm:gap-2">
      {tabs.map((t) => {
        const active = tab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => !t.disabled && onTab(t.id)}
            className={`relative h-7 shrink-0 rounded-full border px-3 text-[11px] font-bold transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 sm:h-9 sm:px-3.5 sm:text-xs ${
              active ? "border-primary/50 bg-primary/15 text-primary shadow-[0_0_20px_-10px_oklch(0.82_0.16_85)]" : "border-white/10 bg-white/[0.04] text-muted-foreground hover:border-white/20 hover:text-foreground hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.3)]"
            } ${t.disabled ? "opacity-40" : ""}`}
          >
            {t.label}
            {!!t.count && <span className="ml-1 rounded-full bg-[oklch(0.7_0.25_340)] px-1 py-0.5 text-[8px] text-white sm:ml-1.5 sm:px-1.5 sm:text-[9px]">{t.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

function ActiveNowStrip({ onPick, onNote }: { onPick: (handle: string) => void; onNote: () => void }) {
  return (
    <div className="border-b border-white/10 px-3 py-2.5 sm:px-4 sm:py-3">
      <div className="mb-1.5 flex items-center justify-between">
        <div className="text-[9px] font-bold tracking-[0.22em] text-muted-foreground sm:text-[10px]">ACTIVE NOW</div>
        <button onClick={onNote} className="text-[10px] font-semibold text-primary sm:text-[11px]">Your Note</button>
      </div>
      <div className="-mx-3 flex gap-2.5 overflow-x-auto px-3 no-scrollbar sm:-mx-4 sm:gap-3 sm:px-4">
        {creators.slice(0, 9).map((c) => (
          <button key={c.id} onClick={() => onPick(c.handle)} className="group w-[48px] shrink-0 text-center transition-transform duration-300 hover:scale-110 hover:-translate-y-0.5 sm:w-[56px]">
            <div className="relative mx-auto size-10 rounded-full conic-ring transition-shadow duration-300 group-hover:shadow-[0_0_20px_-5px_oklch(0.82_0.16_85)] sm:size-11">
              <img src={c.avatar} className="size-10 rounded-full object-cover sm:size-11" alt="" />
              <span className="absolute bottom-0 right-0 size-2 rounded-full bg-[oklch(0.78_0.18_150)] ring-2 ring-background transition-transform duration-300 group-hover:scale-125" />
              <span className="absolute -right-0.5 top-0 rounded-full bg-background"><VerifiedBadge kind={c.verified} className="!size-3" /></span>
            </div>
            <span className="mt-0.5 block truncate text-[9px] sm:text-[10px]">{c.name.split(" ")[0]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SmartControls({ smartSort, focusMode, onSmartSort, onFocus }: { smartSort: boolean; focusMode: boolean; onSmartSort: (v: boolean) => void; onFocus: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
      <button onClick={() => onSmartSort(!smartSort)} className={`inline-flex h-9 items-center gap-2 rounded-2xl border px-3 text-xs font-bold ${smartSort ? "border-primary/40 bg-primary/10 text-primary" : "border-white/10 bg-white/[0.04] text-muted-foreground"}`}>
        <SlidersHorizontal className="size-3.5" /> Smart Sort
      </button>
      <button onClick={() => onFocus(!focusMode)} className={`inline-flex h-9 items-center gap-2 rounded-2xl border px-3 text-xs font-bold ${focusMode ? "border-[oklch(0.7_0.25_340_/_0.55)] bg-[oklch(0.7_0.25_340_/_0.14)] text-[oklch(0.85_0.2_340)]" : "border-white/10 bg-white/[0.04] text-muted-foreground"}`}>
        <Filter className="size-3.5" /> Focus
      </button>
    </div>
  );
}

function ThreadCard({ thread, last, unread, active, ai, index, onClick }: { thread: any; last: any; unread: number; active: boolean; ai: boolean; index: number; onClick: () => void }) {
  const priority = thread.pinned || unread > 1;
  const collab = isCollabText(last?.text);
  const hasVoice = !!last?.voiceUrl;
  const hasMedia = !!last?.mediaUrl;
  const preview = last ? `${last.from === "me" ? "You: " : ""}${last.text || (hasVoice ? "Voice note" : hasMedia ? "Media drop" : "Message")}` : "Say hi";
  return (
    <li style={{ animationDelay: `${index * 30}ms` }} className="animate-rise">
      <button
        onClick={onClick}
        className={`group relative w-full overflow-hidden rounded-2xl border p-2.5 text-left transition-all duration-300 hover:-translate-y-1 sm:rounded-[24px] sm:p-3 ${
          active
            ? "border-primary/60 bg-primary/[0.10] shadow-[0_0_24px_-14px_oklch(0.82_0.16_85)]"
            : unread
              ? "border-primary/35 bg-white/[0.05] hover:border-primary/50 hover:shadow-[0_8px_24px_-12px_oklch(0.82_0.16_85_/_0.3)]"
              : "border-white/10 bg-white/[0.035] hover:border-white/25 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.4)]"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(1_1_1_/_0.03),transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {priority && <span className="absolute inset-y-2.5 left-0 w-0.5 rounded-r-full bg-[linear-gradient(#FFC857,#7C3AED)]" />}
        <div className="flex gap-2.5 sm:gap-3">
          <ProfilePictureLink publicProfileUid={thread.peer.publicProfileUid} label={`Open @${thread.peer.handle}'s public profile`} className="relative size-10 shrink-0 rounded-full conic-ring sm:size-12">
            <img src={thread.peer.avatar} className="size-10 rounded-full object-cover sm:size-12" alt="" />
            {thread.peer.online && <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-[oklch(0.78_0.18_150)] ring-2 ring-background" />}
          </ProfilePictureLink>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-1.5">
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-1">
                  <span className="truncate text-[13px] font-black sm:text-sm">{thread.peer.name}</span>
                  <VerifiedBadge kind={thread.peer.verified} className="!size-3 shrink-0 sm:!size-3.5" />
                  {thread.pinned && <Pin className="size-2.5 shrink-0 text-primary" />}
                </div>
                <div className="truncate text-[10px] text-muted-foreground">@{thread.peer.handle}</div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-0.5">
                <span className="text-[9px] tabular-nums text-muted-foreground sm:text-[10px]">{last ? fmtAgo(last.ts) : ""}</span>
                {unread > 0 && <span className="grid min-w-4 place-items-center rounded-full bg-primary px-1 py-0.5 text-[9px] font-black text-primary-foreground shadow-[0_0_12px_oklch(0.82_0.16_85_/_0.4)] sm:min-w-5 sm:px-1.5 sm:text-[10px]">{unread}</span>}
              </div>
            </div>
            <p className={`mt-0.5 truncate text-[11px] sm:text-xs ${unread ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{preview}</p>
            {hasVoice && <Waveform duration={last.voiceDuration ?? 12} />}
            <div className="mt-1.5 flex flex-wrap gap-1">
              {priority && <MiniChip label="Priority" tone="violet" />}
              {collab && <MiniChip label="Collab" tone="gold" />}
              {ai && <MiniChip label="AI ready" tone="blue" />}
              {hasMedia && <MiniChip label="Media" tone="pink" />}
            </div>
          </div>
        </div>
      </button>
    </li>
  );
}

function ThreadHeader({
  open,
  peerTyping,
  callStatus,
  onBack,
  onAi,
  onCall,
}: {
  open: any;
  peerTyping: boolean;
  callStatus?: string;
  onBack: () => void;
  onAi: () => void;
  onCall: (callType: "audio" | "video") => void;
}) {
  return (
    <div className="border-b border-white/10 p-3 sm:p-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="lg:hidden size-10 grid place-items-center rounded-full glass border border-white/10" aria-label="Back">
          <ArrowLeft className="size-4" />
        </button>
        <ProfilePictureLink publicProfileUid={open.peer.publicProfileUid} label={`Open @${open.peer.handle}'s public profile`} className="relative size-12 shrink-0 rounded-full conic-ring">
          <img src={open.peer.avatar} className="size-12 rounded-full object-cover" alt="" />
          {open.peer.online && <span className="absolute bottom-0 right-0 size-3 rounded-full bg-[oklch(0.78_0.18_150)] ring-2 ring-background" />}
        </ProfilePictureLink>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-base font-black">{open.peer.name}</span>
            <VerifiedBadge kind={open.peer.verified} className="!size-4" />
            {open.pinned && <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-primary">Priority</span>}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="truncate">@{open.peer.handle}</span>
            <span className="size-1 rounded-full bg-muted-foreground" />
            {peerTyping ? <span className="text-[oklch(0.85_0.2_340)]">typing...</span> : <span>{open.peer.online ? "Active now" : "Last seen recently"}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <IconBtn icon={Phone} label={callStatus === "requested" ? "Call requested" : "Call"} onClick={() => onCall("audio")} />
          <IconBtn icon={Video} label="Video call" onClick={() => onCall("video")} />
          <IconBtn icon={Bot} label="AI tools" onClick={onAi} />
          <IconBtn icon={MoreHorizontal} label="More" onClick={() => toast("Conversation options")} />
        </div>
      </div>
      {callStatus === "requested" && (
        <div className="mt-3 rounded-2xl border border-primary/25 bg-primary/[0.08] px-3 py-2 text-xs font-semibold text-primary">
          Calling... request saved. They can answer from their inbox notification flow when realtime calling is available.
        </div>
      )}
    </div>
  );
}

function PinnedMessageBar({ open, last }: { open: any; last: any }) {
  const text = isCollabText(last?.text) ? "Current collab context detected. Keep the next reply focused and actionable." : "Pinned creator context is ready for this conversation.";
  return (
    <div className="border-b border-white/10 px-3 py-2 sm:px-4">
      <div className="flex items-center gap-3 rounded-2xl border border-primary/25 bg-primary/[0.08] px-3 py-2">
        <Pin className="size-4 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-bold">{text}</div>
          <div className="truncate text-[10px] text-muted-foreground">Linked to @{open.peer.handle}</div>
        </div>
      </div>
    </div>
  );
}

function MessageRow({ message, open, previousFrom, index }: { message: any; open: any; previousFrom?: string; index: number }) {
  const { respondToCollab, cancelScheduledReply } = useMessages();
  const mine = message.from === "me";
  const prevSameSide = previousFrom === message.from;
  const isGhost = !!message.ghostExpiresAt;
  const hasMedia = !!message.mediaUrl;
  const hasVoice = !!message.voiceUrl;
  const timeLeft = isGhost ? Math.max(0, Math.ceil((message.ghostExpiresAt - Date.now()) / 1000)) : 0;

  const isShare = message.text?.startsWith("[TTV_SHARE:");
  const shareData = useMemo(() => {
    if (!isShare || !message.text) return null;
    try {
      const content = message.text.slice(11, -1); // remove [TTV_SHARE: and ]
      const parts = content.split(":");
      
      // If it contains % (e.g. URI encoded), parse using the new robust way:
      if (content.includes("%")) {
        if (parts.length >= 4) {
          const type = decodeURIComponent(parts[0]);
          const postId = decodeURIComponent(parts[1]);
          const text = decodeURIComponent(parts[2]);
          const media = decodeURIComponent(parts[3] || "");
          return { type, postId, text, media: media || null };
        }
      }
      
      // Fallback for old format:
      if (parts.length >= 4) {
        const type = parts[0];
        const postId = parts[1];
        const media = parts[parts.length - 1];
        const text = parts.slice(2, parts.length - 1).join(":");
        return { type, postId, text, media: media || null };
      }
    } catch (e) {
      console.error("Failed to parse share message", e);
    }
    return null;
  }, [message.text, isShare]);

  return (
    <div className={`relative flex items-end gap-2 ${mine ? "justify-end" : "justify-start"} animate-msg-pop group/msg`} style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}>
      {!mine && !prevSameSide && (
        <ProfilePictureLink publicProfileUid={open.peer.publicProfileUid} label={`Open @${open.peer.handle}'s public profile`}>
          <img src={open.peer.avatar} className="size-7 rounded-full object-cover ring-1 ring-white/10" alt="" />
        </ProfilePictureLink>
      )}
      {!mine && prevSameSide && <div className="w-7 shrink-0" />}
      <div className={`relative flex max-w-[72%] flex-col ${mine ? "items-end" : "items-start"}`}>
        {message.isCollabProposal && (
          <div className="rounded-2xl border border-[oklch(0.65_0.22_300)] bg-[oklch(0.65_0.22_300_/_0.06)] p-4 shadow-xl max-w-[280px] space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-[oklch(0.78_0.22_300)]" />
              <div className="text-xs font-black tracking-wide text-[oklch(0.78_0.22_300)] uppercase">COLLAB PROPOSAL</div>
            </div>
            <div className="space-y-1 text-left">
              <div className="text-sm font-black text-white">{message.collabType}</div>
              <p className="text-xs text-slate-300 leading-relaxed italic">"{message.collabPitch}"</p>
            </div>
            <div className="flex justify-between border-t border-white/5 pt-2.5 text-[11px] gap-2">
              <div>
                <span className="text-zinc-500">Proposed Split:</span>{" "}
                <span className="font-bold text-white">{message.collabSplit}% / {100 - message.collabSplit}%</span>
              </div>
              {message.collabBeatName && (
                <div>
                  <span className="text-zinc-500">Beat:</span>{" "}
                  <span className="font-bold text-primary">{message.collabBeatName}</span>
                </div>
              )}
            </div>
            <div className="border-t border-white/5 pt-3">
              {message.collabStatus === "pending" ? (
                message.from === "me" ? (
                  <div className="text-center text-xs font-bold text-zinc-500 italic">Waiting for response...</div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => respondToCollab(message.id, "declined")}
                      className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] py-1.5 text-xs font-bold hover:bg-white/[0.08]"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => respondToCollab(message.id, "accepted")}
                      className="flex-1 rounded-lg bg-primary py-1.5 text-xs font-black text-primary-foreground hover:opacity-90"
                    >
                      Accept
                    </button>
                  </div>
                )
              ) : message.collabStatus === "accepted" ? (
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-400">
                  <Check className="size-4" /> Accepted
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-rose-400">
                  <X className="size-4" /> Declined
                </div>
              )}
            </div>
          </div>
        )}
        {message.isScheduledReply && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-xl max-w-[280px] space-y-3">
            <div className="flex items-center gap-2">
              <CalendarClock className="size-4 text-primary" />
              <div className="text-xs font-black tracking-wide text-primary uppercase">SCHEDULED REPLY</div>
            </div>
            <div className="space-y-1 text-left">
              <div className="text-xs font-bold text-zinc-400">To be sent:</div>
              <p className="text-sm font-medium text-slate-200">"{message.scheduledText}"</p>
            </div>
            <div className="border-t border-white/5 pt-2.5">
              {message.scheduledStatus === "pending" ? (
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[11px] font-bold text-zinc-500 italic flex items-center gap-1">
                    <Loader2 className="size-3 animate-spin" /> Pending queue...
                  </div>
                  <button
                    onClick={() => cancelScheduledReply(message.id)}
                    className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[11px] font-bold text-rose-300 hover:bg-rose-500/20"
                  >
                    Cancel
                  </button>
                </div>
              ) : message.scheduledStatus === "sent" ? (
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-400">
                  <Check className="size-3.5" /> Automatically Sent
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-rose-400">
                  <X className="size-3.5" /> Cancelled
                </div>
              )}
            </div>
          </div>
        )}
        {isGhost && (
          <div className="ghost-bubble">
            <Ghost className="size-4 text-primary" />
            <span className="text-sm font-medium">{message.text}</span>
            <div className="ghost-timer-badge"><Timer className="size-2.5" /><span>{timeLeft}s left</span></div>
          </div>
        )}
        {hasMedia && message.isGif && (
          <GifMessageCard
            gifUrl={message.mediaUrl!}
            posterUrl={message.gifPosterUrl}
            title={message.gifTitle}
            fwdGifId={message.gifFwdId}
          />
        )}
        {hasMedia && !message.isGif && (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]" style={{ maxWidth: 240 }}>
            {message.mediaType === "video" ? <video src={message.mediaUrl} controls className="w-full" style={{ maxHeight: 220 }} /> : <img src={message.mediaUrl} alt="media" className="w-full object-cover" style={{ maxHeight: 220 }} />}
          </div>
        )}
        {hasVoice && (
          <div className="voice-bubble">
            <Mic className="size-4 shrink-0 text-primary" />
            <Waveform duration={message.voiceDuration ?? 10} compact />
            <audio src={message.voiceUrl} controls className="voice-audio" />
          </div>
        )}
        {!message.isCollabProposal && !message.isScheduledReply && !isGhost && (!hasMedia || message.isGif) && !hasVoice && message.text?.trim() && (
          isShare && shareData ? (
            <Link
              to="/watch/$id"
              params={{ id: shareData.postId }}
              className="block w-full max-w-[280px] rounded-2xl border border-white/10 bg-[#05070D]/90 p-3 hover:border-primary/45 hover:scale-[1.02] transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)] group/share text-left"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="size-6 rounded-full conic-ring overflow-hidden flex items-center justify-center bg-primary/10">
                  <span className="text-[9px] font-bold text-primary">TTV</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-semibold text-primary truncate">SHARED POST</div>
                </div>
              </div>
              {shareData.media && (
                <div className="relative rounded-xl overflow-hidden aspect-video border border-white/5 mb-2 bg-black/40">
                  <img src={shareData.media} alt="" className="w-full h-full object-cover group-hover/share:scale-[1.05] transition-transform duration-500" />
                </div>
              )}
              <p className="text-xs text-foreground/90 line-clamp-3 leading-relaxed whitespace-pre-wrap">{shareData.text}</p>
              <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[9px] text-muted-foreground">
                <span>Tap to view post</span>
                <span className="text-primary font-bold">Watch Now →</span>
              </div>
            </Link>
          ) : (
            <div className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${mine ? "msg-bubble-mine rounded-br-sm" : "msg-bubble-them rounded-bl-sm"}`}>
              <span className="relative z-[1]">{message.text}</span>
            </div>
          )
        )}
        <div className={`absolute -top-8 ${mine ? "right-0" : "left-0"} opacity-0 transition-all duration-150 group-hover/msg:opacity-100 group-hover/msg:-translate-y-0.5`}>
          <div className="flex items-center gap-1 rounded-full border border-white/15 bg-[rgba(8,17,31,.92)] px-2 py-1.5 backdrop-blur-xl shadow-[0_4px_24px_-8px_oklch(0.7_0.25_340_/_0.4)]">
            {[
              { e: "❤️", label: "Love" }, { e: "🔥", label: "Fire" }, { e: "😂", label: "Laugh" },
              { e: "👏", label: "Clap" }, { e: "💎", label: "Gem" },
            ].map(({ e, label }) => (
              <button
                key={label}
                onClick={() => toast(`${label} reaction sent`)}
                className="tremoji-btn"
                aria-label={label}
              >
                <Tremoji emoji={e} label={label} size={28} />
              </button>
            ))}
          </div>
        </div>
        {message.reactions && (
          <div className={`absolute -bottom-3 ${mine ? "left-1" : "right-1"} flex items-center gap-1 rounded-full border border-white/10 bg-[rgba(8,17,31,.86)] px-1.5 py-1`}>
            {message.reactions.map((r: string, i: number) => (
              <Tremoji key={`${r}-${i}`} emoji={r} size={20} />
            ))}
          </div>
        )}
        <div className={`mt-1 flex items-center gap-1 text-[10px] text-muted-foreground ${mine ? "justify-end" : ""}`}>
          <span>{fmtTime(message.ts)}</span>
          {mine && (message.status === "read" ? <CheckCheck className="size-3 text-[oklch(0.82_0.15_215)]" /> : message.status === "delivered" ? <CheckCheck className="size-3" /> : <Check className="size-3" />)}
        </div>
      </div>
    </div>
  );
}

function GifMessageCard({ gifUrl, posterUrl, title, fwdGifId }: { gifUrl: string; posterUrl?: string; title?: string; fwdGifId?: string }) {
  const detailUrl = buildFwdGifDetailUrl(fwdGifId);
  return (
    <a
      href={detailUrl}
      target="_blank"
      rel="noreferrer"
      className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] cursor-pointer transition hover:border-primary/45"
      style={{ maxWidth: 240 }}
      aria-label="Open FWD GIF"
    >
      {posterUrl && <img src={posterUrl} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-30 blur-sm" />}
      <img src={gifUrl} alt={title ?? "FWD GIF"} className="relative w-full object-cover" style={{ maxHeight: 200 }} />
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
        <span className="rounded-full border border-white/20 bg-black/40 px-1.5 py-0.5 text-[9px] font-black tracking-[0.2em] text-primary">FWD</span>
        {title && <span className="truncate text-[10px] text-white/70 ml-2">{title}</span>}
      </div>
    </a>
  );
}

function AiReplyPanel({
  messages,
  peerName,
  onClose,
  onSend,
}: {
  messages: any[];
  peerName: string;
  onClose: () => void;
  onSend: (text: string) => void;
}) {
  const [chips, setChips] = useState<string[]>(["Send the cut", "I am in", "Let's lock a time"]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!messages || messages.length === 0) return;
    setLoading(true);
    const payload = messages.map(m => ({
      from: m.from === "me" ? "Me" : peerName,
      text: m.text || ""
    }));

    generateSmartReplies({ data: { messages: payload, peerName } })
      .then((res) => {
        if (res?.replies && res.replies.length > 0) {
          setChips(res.replies);
        }
      })
      .catch((err) => {
        console.error("Failed to generate smart replies:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [messages?.length, peerName]);

  return (
    <div className="border-t border-white/10 px-3 py-2">
      <div className="rounded-2xl border border-[oklch(0.82_0.15_215_/_0.35)] bg-[linear-gradient(135deg,oklch(0.82_0.15_215_/_0.12),oklch(0.7_0.25_340_/_0.10))] p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[oklch(0.82_0.15_215)]">
            {loading ? (
              <Loader2 className="size-3.5 animate-spin text-[oklch(0.82_0.15_215)]" />
            ) : (
              <Bot className="size-3.5" />
            )}
            AI Suggested Reply
          </div>
          <button onClick={onClose} className="size-7 grid place-items-center rounded-full hover:bg-white/10" aria-label="Close AI panel"><X className="size-3.5" /></button>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {chips.map((chip) => <button key={chip} onClick={() => onSend(chip)} className="h-8 shrink-0 rounded-full border border-white/10 bg-white/[0.06] px-3 text-xs font-semibold">{chip}</button>)}
          <button onClick={() => toast("Customize with Trey-I")} className="h-8 shrink-0 rounded-full bg-primary px-3 text-xs font-black text-primary-foreground">Customize</button>
        </div>
      </div>
    </div>
  );
}

function CollabPanel({ open, onClose, onStart }: { open: any; onClose: () => void; onStart: () => void }) {
  return (
    <div className="border-t border-white/10 px-3 py-2">
      <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/[0.08] p-3">
        <div className="flex -space-x-2">
          {[open.peer, ...creators.slice(0, 2)].map((p: any) => <img key={p.id} src={p.avatar} className="size-8 rounded-full border-2 border-background object-cover" alt="" />)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-black">Ready to collab?</div>
          <div className="truncate text-[11px] text-muted-foreground">Start a room with creator context attached.</div>
        </div>
        <button onClick={onStart} className="h-9 rounded-xl bg-primary px-3 text-xs font-black text-primary-foreground">Start</button>
        <button onClick={onClose} className="size-9 grid place-items-center rounded-xl border border-white/10 bg-white/[0.04]" aria-label="Dismiss collab"><X className="size-3.5" /></button>
      </div>
    </div>
  );
}

function Composer(props: {
  draft: string;
  onDraft: (v: string) => void;
  onSend: () => void;
  openName: string;
  recording: boolean;
  recorderMs: number;
  maxSecs: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onCancelRecording: () => void;
  showPlusMenu: boolean;
  showGhostPopup: boolean;
  showEmojiPicker: boolean;
  onPlusMenu: (v: boolean) => void;
  onGhostPopup: (v: boolean) => void;
  onEmojiPicker: (v: boolean) => void;
  onGhostDraft: (v: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onPhotoSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenFwd: () => void;
  gifAttachment: FwdGifPayload | null;
  onRemoveGif: () => void;
  onSendGhost: (secs: number, label: string) => void;
}) {
  const canSend = props.draft.trim().length > 0 || !!props.gifAttachment;
  return (
    <div className="relative border-t border-white/10 p-3 pb-[max(.75rem,env(safe-area-inset-bottom))]">
      <input ref={props.fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={props.onPhotoSelect} />
      {props.showGhostPopup && <GhostMessagePopup onSelect={props.onSendGhost} onClose={() => props.onGhostPopup(false)} />}
      {props.showEmojiPicker && (
        <div className="absolute bottom-full left-0 right-0 z-50 mb-2 px-3">
          <NeonEmojiPicker onSelect={(emoji) => { props.onDraft(props.draft + emoji); props.onEmojiPicker(false); }} onClose={() => props.onEmojiPicker(false)} />
        </div>
      )}
      {props.showPlusMenu && (
        <PlusMenu
          onGhostMessage={() => {
            if (!props.draft.trim()) {
              toast.error("Message cannot be blank");
              props.onPlusMenu(false);
              return;
            }
            props.onGhostDraft(props.draft);
            props.onPlusMenu(false);
            props.onGhostPopup(true);
          }}
          onFwd={() => { props.onPlusMenu(false); props.onOpenFwd(); }}
          onPhoto={() => { props.onPlusMenu(false); props.fileInputRef.current?.click(); }}
          onClose={() => props.onPlusMenu(false)}
        />
      )}

      {/* GIF attachment preview */}
      {props.gifAttachment && (
        <div className="mb-2 flex items-start gap-2 rounded-2xl border border-[oklch(0.78_0.18_150_/_0.4)] bg-[oklch(0.78_0.18_150_/_0.08)] p-2">
          <div className="relative shrink-0 overflow-hidden rounded-xl" style={{ width: 80, height: 60 }}>
            {props.gifAttachment.preview_url && (
              <img src={props.gifAttachment.preview_url} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-35 blur-sm" />
            )}
            <img
              src={props.gifAttachment.url}
              alt={props.gifAttachment.title ?? "FWD GIF"}
              className="relative h-full w-full object-cover"
            />
            <span className="absolute bottom-0.5 left-0.5 rounded-full border border-white/20 bg-black/60 px-1 py-0.5 text-[8px] font-black tracking-[0.2em] text-primary">FWD</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-[oklch(0.78_0.18_150)]">FWD GIF attached</p>
            {props.gifAttachment.title && <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{props.gifAttachment.title}</p>}
            <p className="mt-0.5 text-[10px] text-muted-foreground">Add a message or send as is</p>
          </div>
          <button
            onClick={props.onRemoveGif}
            className="grid size-7 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-muted-foreground hover:text-foreground"
            aria-label="Remove GIF"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {props.recording ? (
        <div className="flex items-center gap-3 rounded-2xl border border-[oklch(0.7_0.25_340_/_0.5)] bg-[linear-gradient(120deg,oklch(0.7_0.25_340_/_0.18),oklch(0.82_0.16_85_/_0.12))] px-4 py-3">
          <span className="size-2.5 rounded-full bg-[oklch(0.65_0.24_15)] animate-glow-pulse" />
          <span className="text-[11px] font-black tracking-[0.2em] text-[oklch(0.85_0.2_340)]">REC {Math.floor(props.recorderMs / 1000)}s / {props.maxSecs}s</span>
          <div className="flex h-6 flex-1 items-center justify-center gap-0.5">
            {Array.from({ length: 20 }).map((_, i) => <span key={i} className="wave-bar" style={{ height: `${10 + (i % 5) * 4}px`, animationDelay: `${i * 60}ms`, animationDuration: `${0.7 + (i % 3) * 0.15}s` }} />)}
          </div>
          <button onClick={props.onCancelRecording} className="h-8 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 text-[11px] font-semibold">Cancel</button>
          <button onClick={props.onStopRecording} className="size-9 grid place-items-center rounded-xl send-btn-rocket" aria-label="Send voice note"><Send className="size-4" /></button>
        </div>
      ) : (
        <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-2 focus-within:border-primary/40 focus-within:shadow-[0_0_16px_-6px_oklch(0.82_0.16_85_/_0.25)] transition-shadow duration-200">
          <ComposerButton active={props.showPlusMenu} icon={Plus} label="More options" onClick={() => { props.onEmojiPicker(false); props.onPlusMenu(!props.showPlusMenu); }} />
          <ComposerButton icon={ImageIcon} label="Attach media" onClick={() => props.fileInputRef.current?.click()} />
          <ComposerButton active={props.showEmojiPicker} icon={Smile} label="Emoji" onClick={() => { props.onPlusMenu(false); props.onEmojiPicker(!props.showEmojiPicker); }} />
          <button
            onClick={() => { props.onPlusMenu(false); props.onEmojiPicker(false); props.onOpenFwd(); }}
            className={[
              "grid size-8 place-items-center rounded-xl transition",
              props.gifAttachment
                ? "bg-[oklch(0.78_0.18_150_/_0.18)] text-[oklch(0.78_0.18_150)]"
                : "text-muted-foreground hover:bg-white/5 hover:text-primary",
            ].join(" ")}
            aria-label="FWD GIF"
            title="Add FWD GIF"
          >
            <Sparkles className="size-4" />
          </button>
          <input
            value={props.draft}
            onChange={(e) => props.onDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && props.onSend()}
            placeholder={props.gifAttachment ? "Add a message… (optional)" : `Message ${props.openName.split(" ")[0]}…`}
            className="min-w-0 flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
          />
          {canSend ? (
            <button
              onClick={props.onSend}
              aria-label="Send"
              className="size-10 grid place-items-center rounded-xl send-btn-rocket shadow-[0_0_20px_-6px_oklch(0.82_0.16_85_/_0.6)] active:scale-95 transition-transform"
            >
              <Send className="size-4" />
            </button>
          ) : (
            <button
              onClick={props.onStartRecording}
              aria-label="Record voice note"
              className="size-10 grid place-items-center rounded-xl border border-white/10 bg-white/[0.04] hover:border-primary/30 hover:shadow-[0_0_14px_-5px_oklch(0.82_0.16_85_/_0.3)] transition-all"
            >
              <Mic className="size-4 text-primary" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ComposerButton({ icon: Icon, label, active, onClick }: { icon: LucideIcon; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`grid size-8 place-items-center rounded-xl transition ${active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-primary"}`} aria-label={label}>
      <Icon className="size-4" />
    </button>
  );
}

function GroupChatPanel({
  group,
  messages,
  draft,
  onDraft,
  onSend,
  onBack,
  onReport,
  onBlock,
}: {
  group: any;
  messages: any[];
  draft: string;
  onDraft: (value: string) => void;
  onSend: () => void;
  onBack: () => void;
  onReport: (group: any, messageId?: string) => void;
  onBlock: (group: any, blockedUserId: string) => void;
}) {
  return (
    <>
      <div className="border-b border-white/10 p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="grid size-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] lg:hidden" aria-label="Back to inbox">
            <ArrowLeft className="size-4" />
          </button>
          <div className="grid size-11 shrink-0 place-items-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
            <MessageCircle className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-base font-black">{group.group_name}</div>
            <div className="truncate text-[11px] text-muted-foreground">{group.group_description ?? "Matched by Trey TV"}</div>
          </div>
          <button onClick={() => onReport(group)} className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-muted-foreground hover:text-foreground" aria-label="Report group">
            <Flag className="size-4" />
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <MiniChip label="Matched by Trey TV" tone="gold" />
          {group.zodiac_sign && <MiniChip label={group.zodiac_sign} tone="violet" />}
          {group.city && <MiniChip label={group.city} tone="blue" />}
          <MiniChip label="Age-safe group" tone="pink" />
        </div>
      </div>

      <div className="relative flex-1 overflow-y-auto p-4 sm:p-5 no-scrollbar">
        <div className="space-y-3">
          {messages.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-muted-foreground">
              This matched group is ready. Start the first conversation.
            </div>
          )}
          {messages.map((message) => {
            const sender = Array.isArray(message.sender) ? message.sender[0] : message.sender;
            return (
              <div key={message.id} className="group rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <div className="flex items-start gap-3">
                  <ProfilePictureLink publicProfileUid={sender?.public_profile_uid} label={`Open @${sender?.username || "member"}'s public profile`}>
                    <img src={sender?.avatar_url || ""} className="size-8 rounded-full bg-white/10 object-cover" alt="" />
                  </ProfilePictureLink>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-xs font-black">{sender?.display_name || sender?.username || "Member"}</span>
                      <span className="text-[10px] text-muted-foreground">{fmtAgo(new Date(message.created_at).getTime())}</span>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{message.body}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button onClick={() => onReport(group, message.id)} className="text-muted-foreground hover:text-foreground" aria-label="Report message">
                      <Flag className="size-3.5" />
                    </button>
                    <button onClick={() => onBlock(group, message.sender_id)} className="text-muted-foreground hover:text-foreground" aria-label="Block member">
                      <X className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-white/10 p-3 pb-[max(.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-2 focus-within:border-primary/40">
          <input
            value={draft}
            onChange={(event) => onDraft(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && !event.shiftKey && onSend()}
            placeholder={`Message ${group.group_name}`}
            className="min-w-0 flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button onClick={onSend} disabled={!draft.trim()} className="grid size-10 place-items-center rounded-xl send-btn-rocket disabled:opacity-50" aria-label="Send group message">
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </>
  );
}

function MatchedGroupsList({ groups, onOpen, onLeave }: { groups: any[]; onOpen: (group: any) => void; onLeave: (id: string) => void }) {
  return (
    <div className="mb-3 space-y-2 px-1">
      <div className="flex items-center gap-2 px-2 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
        <Sparkles className="size-3" /> Matched by Trey TV
      </div>
      {groups.map((membership) => {
        const group = Array.isArray(membership.thread) ? membership.thread[0] : membership.thread;
        if (!group) return null;
        const reason =
          group.group_type === "zodiac" ? "Based on your zodiac"
          : group.group_type === "cusp" ? "Based on your Cusp Soul badge"
          : group.city ? "Based on your city"
          : "Based on your interests";
        return (
          <div key={group.id} className="rounded-2xl border border-primary/20 bg-[linear-gradient(135deg,oklch(0.82_0.16_85/.09),oklch(0.65_0.22_300/.08),oklch(0.82_0.15_215/.07))] p-3">
            <div className="flex items-start gap-3">
              <button onClick={() => onOpen(group)} className="grid size-10 shrink-0 place-items-center rounded-xl border border-primary/30 bg-primary/10 text-primary" aria-label={`Open ${group.group_name}`}>
                <MessageCircle className="size-4" />
              </button>
              <button onClick={() => onOpen(group)} className="min-w-0 flex-1 text-left">
                <div className="truncate text-sm font-black">{group.group_name}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{reason}</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <MiniChip label="Matched by Trey TV" tone="gold" />
                  {group.zodiac_sign && <MiniChip label={group.zodiac_sign} tone="violet" />}
                  {group.city && <MiniChip label={group.city} tone="blue" />}
                </div>
              </button>
              <button onClick={() => onLeave(group.id)} className="grid size-8 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-muted-foreground hover:text-foreground" aria-label="Leave matched group">
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RequestsList({ onOpen }: { onOpen: (handle: string) => void }) {
  return (
    <ul className="space-y-2">
      {requests.map((r, i) => (
        <li key={r.who.id} style={{ animationDelay: `${i * 50}ms` }} className="animate-rise rounded-[24px] border border-white/10 bg-white/[0.04] p-3.5">
          <div className="flex items-center gap-3">
            <img src={r.who.avatar} className="size-11 rounded-full object-cover conic-ring" alt="" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-sm font-black"><span className="truncate">{r.who.name}</span><VerifiedBadge kind={r.who.verified} className="!size-3.5" /></div>
              <div className="truncate text-[11px] text-muted-foreground">{r.msg}</div>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => onOpen(r.who.handle)} className="h-9 flex-1 rounded-xl bg-primary text-xs font-black text-primary-foreground">Accept</button>
            <button onClick={() => toast("Request dismissed")} className="h-9 flex-1 rounded-xl border border-white/10 bg-white/[0.04] text-xs font-semibold">Decline</button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ActivityList() {
  return (
    <ul className="space-y-2">
      {activity.map((a, i) => (
        <li key={i} style={{ animationDelay: `${i * 40}ms` }} className="animate-rise flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.04] p-3">
          <div className="relative shrink-0">
            <img src={a.who.avatar} className="size-11 rounded-full object-cover" alt="" />
            <div className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full border border-white/10 bg-background">
              <a.icon className={`size-3.5 ${a.color}`} />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm leading-snug"><span className="font-black">{a.who.name}</span> {a.text}</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">{a.time} ago</div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function QuickActionDock({ actions }: { actions: { label: string; icon: LucideIcon; onClick: () => void }[] }) {
  return (
    <div className="hidden border-t border-white/10 p-2 lg:block">
      <div className="grid grid-cols-4 gap-1.5 rounded-2xl border border-white/10 bg-white/[0.035] p-1.5">
        {actions.map(({ label, icon: Icon, onClick }) => (
          <button key={label} onClick={onClick} className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold text-muted-foreground hover:bg-white/[0.06] hover:text-foreground">
            <Icon className="size-4 text-primary" />
            <span className="max-w-full truncate">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Waveform({ duration, compact = false }: { duration: number; compact?: boolean }) {
  return (
    <div className={`mt-2 flex items-center gap-1 ${compact ? "mt-0" : ""}`}>
      <div className="flex h-5 items-center gap-0.5">
        {Array.from({ length: compact ? 14 : 22 }).map((_, i) => <span key={i} className="w-0.5 rounded-full bg-primary/70" style={{ height: `${6 + (i % 5) * 3}px` }} />)}
      </div>
      <span className="text-[10px] font-semibold text-muted-foreground">{Math.max(1, Math.round(duration))}s</span>
    </div>
  );
}

function MiniChip({ label, tone }: { label: string; tone: "violet" | "gold" | "blue" | "pink" }) {
  const cls = {
    violet: "border-[oklch(0.65_0.22_300_/_0.45)] text-[oklch(0.78_0.22_300)] bg-[oklch(0.65_0.22_300_/_0.12)]",
    gold: "border-primary/45 text-primary bg-primary/10",
    blue: "border-[oklch(0.82_0.15_215_/_0.45)] text-[oklch(0.82_0.15_215)] bg-[oklch(0.82_0.15_215_/_0.10)]",
    pink: "border-[oklch(0.7_0.25_340_/_0.45)] text-[oklch(0.85_0.2_340)] bg-[oklch(0.7_0.25_340_/_0.10)]",
  }[tone];
  return <span className={`rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] ${cls}`}>{label}</span>;
}

function StatusChip({ icon: Icon, label, tone }: { icon: LucideIcon; label: string; tone: "blue" | "gold" }) {
  const cls = tone === "gold" ? "border-primary/30 text-primary bg-primary/10" : "border-[oklch(0.82_0.15_215_/_0.28)] text-[oklch(0.82_0.15_215)] bg-[oklch(0.82_0.15_215_/_0.08)]";
  return <span className={`inline-flex h-9 items-center gap-2 rounded-2xl border px-3 text-xs font-bold ${cls}`}><Icon className="size-3.5" /> {label}</span>;
}

function IconBtn({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="size-9 grid place-items-center rounded-full hover:bg-white/5 tilt-press" aria-label={label} title={label}><Icon className="size-4" /></button>;
}

function EmptyList({ onCompose }: { onCompose: () => void }) {
  return (
    <li className="liquid-hover overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,.05),rgba(0,183,255,.045),rgba(255,79,216,.03))] transition-all duration-500 sm:rounded-[26px]">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2.5 sm:px-4 sm:py-3">
        <div>
          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.24em] text-muted-foreground sm:text-[10px]">
            <Sparkles className="size-3 text-primary" /> Suggested for you
          </div>
          <div className="mt-0.5 text-[10px] text-muted-foreground">Curated by your activity</div>
        </div>
        <button onClick={onCompose} className="shrink-0 text-[11px] font-black text-primary">See all</button>
      </div>
      <div className="divide-y divide-white/[0.07]">
        {creators.map((c, i) => {
          const meta = creatorMeta[i % creatorMeta.length];
          return (
            <button key={c.id} onClick={onCompose} className="group flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-all duration-300 hover:translate-x-1 hover:bg-white/[0.06] sm:gap-3 sm:px-4 sm:py-3">
              <div className="relative size-10 shrink-0 rounded-full conic-ring transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_20px_-5px_oklch(0.82_0.16_85)] sm:size-12">
                <img src={c.avatar} className="size-10 rounded-full object-cover sm:size-12" alt="" />
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-[oklch(0.78_0.18_150)] ring-2 ring-background shadow-[0_0_10px_oklch(0.78_0.18_150)] transition-transform duration-300 group-hover:scale-125" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-1">
                  <span className="truncate text-sm font-black">{c.name}</span>
                  <VerifiedBadge kind={c.verified} className="!size-3.5 shrink-0" />
                </div>
                <div className="text-[10px] text-muted-foreground">@{c.handle} · {meta.role} · {meta.followers}</div>
              </div>
              <span className="grid size-8 shrink-0 place-items-center rounded-xl border border-primary/40 bg-primary/10 text-primary shadow-[0_0_16px_-10px_oklch(0.82_0.16_85)] transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 sm:size-9">
                <MessageCirclePlus className="size-4" />
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2.5 border-t border-primary/20 bg-primary/[0.06] px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
        <div className="grid size-9 place-items-center rounded-xl border border-[oklch(0.65_0.22_300_/_0.4)] bg-[oklch(0.65_0.22_300_/_0.12)] text-[oklch(0.82_0.22_300)] sm:size-10">
          <Bot className="size-4 sm:size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-black text-primary">Smart Match</div>
          <div className="truncate text-[10px] text-muted-foreground">12 more creators you'll vibe with</div>
        </div>
        <button onClick={onCompose} className="h-8 rounded-xl border border-primary/30 bg-primary/10 px-2.5 text-[11px] font-black text-primary sm:h-9 sm:px-3">View</button>
      </div>
    </li>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex-1 grid place-items-center p-8 text-center overflow-hidden">
      <div className="relative max-w-sm space-y-5">
        {/* Animated rings */}
        <div className="relative mx-auto size-28">
          <div className="absolute inset-0 rounded-full border border-primary/10 animate-ping opacity-30" style={{ animationDuration: "3s" }} />
          <div className="absolute inset-4 rounded-full border border-[oklch(0.82_0.15_215_/_0.15)] animate-ping opacity-25" style={{ animationDuration: "2.2s", animationDelay: "0.5s" }} />
          <div className="relative size-28 rounded-full bg-[radial-gradient(ellipse_at_60%_40%,oklch(0.82_0.16_85_/_0.12),oklch(0.7_0.25_340_/_0.08),transparent_70%)] border border-white/10 grid place-items-center">
            <div className="size-16 rounded-full bg-[radial-gradient(ellipse,oklch(0.82_0.16_85_/_0.2),transparent_70%)] border border-primary/25 grid place-items-center shadow-[0_0_40px_-10px_oklch(0.82_0.16_85_/_0.5)]">
              <MessageCircle className="size-8 text-primary" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-black">
            <span className="bg-[linear-gradient(110deg,oklch(0.82_0.16_85),oklch(0.7_0.25_340),oklch(0.82_0.15_215))] bg-clip-text text-transparent">Your next collab starts here</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">Pick a thread on the left or start a new conversation with a creator in your network.</p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onNew}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground glow-gold tilt-press"
          >
            <MessageCirclePlus className="size-4" />
            Start a new conversation
          </button>
          <p className="text-[10px] text-muted-foreground">or select a thread from the left panel</p>
        </div>
      </div>
    </div>
  );
}

function CollabProposalModal({
  isOpen,
  onClose,
  peerName,
  onSend,
}: {
  isOpen: boolean;
  onClose: () => void;
  peerName: string;
  onSend: (input: {
    collabType: "Remix" | "Vocal Feature" | "Collab Track" | "Beat Production";
    pitch: string;
    split: number;
    beatName?: string;
  }) => void;
}) {
  const [collabType, setCollabType] = useState<"Remix" | "Vocal Feature" | "Collab Track" | "Beat Production">("Collab Track");
  const [pitch, setPitch] = useState("");
  const [split, setSplit] = useState(50);
  const [beatName, setBeatName] = useState("None");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pitch.trim()) {
      toast.error("Please enter a short pitch message!");
      return;
    }
    onSend({ collabType, pitch, split, beatName: beatName === "None" ? undefined : beatName });
    onClose();
    setPitch("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <UserPlus className="size-5 text-primary" />
            <h3 className="text-lg font-black tracking-tight">Propose Collaboration</h3>
          </div>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-white/5" type="button"><X className="size-5 text-zinc-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-400">Collaboration Type</label>
            <select
              value={collabType}
              onChange={(e) => setCollabType(e.target.value as any)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-900 p-2.5 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="Collab Track">Collab Track</option>
              <option value="Vocal Feature">Vocal Feature</option>
              <option value="Remix">Remix</option>
              <option value="Beat Production">Beat Production</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-400">Pitch / Proposal message</label>
            <textarea
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              placeholder={`Pitch your collab idea to ${peerName}...`}
              className="mt-1 h-20 w-full rounded-xl border border-white/10 bg-zinc-900 p-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-400">Your Split (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={split}
                onChange={(e) => setSplit(Math.min(100, Math.max(0, Number(e.target.value))))}
                className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-900 p-2.5 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-400">Reference Beat</label>
              <select
                value={beatName}
                onChange={(e) => setBeatName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-900 p-2.5 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="None">No beat attached</option>
                <option value="Midnight Dream">Midnight Dream (120 BPM)</option>
                <option value="Neon Shadows">Neon Shadows (92 BPM)</option>
                <option value="Sunset Lullaby">Sunset Lullaby (84 BPM)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/10 bg-transparent py-2.5 text-sm font-bold hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-black text-primary-foreground hover:opacity-90"
            >
              Send Proposal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ScheduleReplyModal({
  isOpen,
  onClose,
  peerName,
  onSend,
}: {
  isOpen: boolean;
  onClose: () => void;
  peerName: string;
  onSend: (text: string, timeLabel: string, delayMs: number) => void;
}) {
  const [text, setText] = useState("");
  const [timeOption, setTimeOption] = useState<"10s" | "30s" | "1m" | "5m">("10s");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      toast.error("Please enter a reply message!");
      return;
    }

    const delayMap = {
      "10s": 10000,
      "30s": 30000,
      "1m": 60000,
      "5m": 300000,
    };

    onSend(text, timeOption, delayMap[timeOption]);
    onClose();
    setText("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <CalendarClock className="size-5 text-primary" />
            <h3 className="text-lg font-black tracking-tight">Schedule Automated Reply</h3>
          </div>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-white/5" type="button"><X className="size-5 text-zinc-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-400">Delay Time</label>
            <div className="mt-1.5 grid grid-cols-4 gap-2">
              {(["10s", "30s", "1m", "5m"] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setTimeOption(opt)}
                  className={`rounded-xl border py-2 text-xs font-bold transition-all ${
                    timeOption === opt
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-white/10 bg-zinc-900 text-zinc-400 hover:text-white"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-400">Reply Message</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Type automated message to send to ${peerName}...`}
              className="mt-1 h-24 w-full rounded-xl border border-white/10 bg-zinc-900 p-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/10 bg-transparent py-2.5 text-sm font-bold hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-black text-primary-foreground hover:opacity-90"
            >
              Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

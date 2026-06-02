import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  Calendar,
  Image as ImageIcon,
  MessageCirclePlus,
  Mic,
  Paperclip,
  Search,
  Send,
  Sparkles,
  Users,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { creators } from "@/lib/mock-data";
import { useMessages, type Peer } from "@/lib/messages-store";
import { VerifiedBadge } from "@/components/brand/Badge";
import { haptic } from "@/lib/haptics";

type Props = {
  open: boolean;
  onClose: () => void;
  onPicked: (threadId: string) => void;
};

const QUICK_PROMPTS = [
  {
    icon: Sparkles,
    text: "Loved your latest drop — open to a collab idea?",
    tone: "gold" as const,
  },
  {
    icon: Users,
    text: "Quick intro: I think you and I should connect on this.",
    tone: "violet" as const,
  },
  { icon: Zap, text: "Big fan of your work! Would love to connect.", tone: "blue" as const },
];

const CREATOR_META = [
  { role: "Music Producer", followers: "214K", tag: "Hot Collaborator", tone: "pink" as const },
  { role: "Artist", followers: "187K", tag: "Beat Maker", tone: "blue" as const },
  { role: "Creative Director", followers: "92K", tag: "Same Vibes", tone: "pink" as const },
  { role: "Producer", followers: "156K", tag: "Collab Ready", tone: "blue" as const },
  { role: "Vocalist", followers: "68K", tag: "Vocalist", tone: "pink" as const },
];

export function NewConversationSheet({ open, onClose, onPicked }: Props) {
  const { openThread, send } = useMessages();
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Peer | null>(null);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setPicked(null);
    setDraft("");
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = creators.map<Peer>((c) => ({
      id: c.id,
      name: c.name,
      handle: c.handle,
      avatar: c.avatar as unknown as string,
      verified: c.verified,
      online: true,
    }));
    if (!q) return list;
    return list.filter(
      (p) => p.name.toLowerCase().includes(q) || p.handle.toLowerCase().includes(q),
    );
  }, [query]);

  if (!open) return null;

  const startConvo = (peer: Peer) => {
    haptic("selection");
    setPicked(peer);
  };

  const confirm = () => {
    if (!picked) return;
    haptic("success");
    const id = openThread(picked);
    if (draft.trim()) send(id, draft.trim());
    onPicked(id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-stretch justify-center overflow-hidden bg-[rgba(0,0,0,.72)] px-2 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-[7rem] backdrop-blur-[18px] sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-full min-h-0 w-full max-w-[640px] flex-col overflow-hidden rounded-[24px] border border-[oklch(0.7_0.25_340_/_0.4)] bg-[linear-gradient(145deg,rgba(12,9,28,.92),rgba(7,18,33,.9),rgba(10,12,22,.94))] shadow-[0_0_50px_-28px_oklch(0.7_0.25_340),0_0_60px_-36px_oklch(0.82_0.15_215)] sm:h-auto sm:min-h-[min(800px,90dvh)] sm:rounded-[32px]"
        style={{ animation: "slide-up 0.32s cubic-bezier(0.2, 0.9, 0.2, 1.05)" }}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-6 size-52 rounded-full bg-[radial-gradient(circle,oklch(0.7_0.25_340_/_0.2),transparent_66%)] blur-3xl" />
          <div className="absolute -right-20 top-14 size-52 rounded-full bg-[radial-gradient(circle,oklch(0.82_0.15_215_/_0.18),transparent_66%)] blur-3xl" />
          <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary to-[oklch(0.82_0.15_215)]" />
        </div>

        {/* Header — compact on mobile */}
        <div className="relative flex items-center gap-3 p-4 pb-3 sm:gap-4 sm:p-5 sm:pb-4">
          <div className="grid size-10 shrink-0 place-items-center rounded-full border border-[oklch(0.7_0.25_340_/_0.5)] bg-[oklch(0.7_0.25_340_/_0.15)] text-[oklch(0.86_0.2_340)] shadow-[0_0_24px_-8px_oklch(0.7_0.25_340)] sm:size-12">
            <MessageCirclePlus className="size-5 sm:size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-primary sm:text-[10px]">
              New Conversation
            </div>
            <h2 className="mt-0.5 text-lg font-black leading-tight sm:mt-1 sm:text-2xl">
              <span className="bg-[linear-gradient(110deg,#FF4FD8,#FFC857,#FF7A59,#8B5CF6)] bg-clip-text text-transparent">
                {picked ? "Compose" : "Connect"}
              </span>
            </h2>
            {!picked && (
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                Find creators and conversations that move you forward.
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.055] text-foreground hover:bg-white/10 sm:size-10"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {!picked ? (
          <ConnectStep
            inputRef={inputRef}
            query={query}
            setQuery={setQuery}
            results={results}
            startConvo={startConvo}
          />
        ) : (
          <ComposeStep
            picked={picked}
            draft={draft}
            setDraft={setDraft}
            setPicked={setPicked}
            confirm={confirm}
          />
        )}
      </div>
    </div>
  );
}

function ConnectStep({
  inputRef,
  query,
  setQuery,
  results,
  startConvo,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  query: string;
  setQuery: (v: string) => void;
  results: Peer[];
  startConvo: (peer: Peer) => void;
}) {
  return (
    <>
      {/* Search */}
      <div className="relative px-4 sm:px-5">
        <div className="flex h-11 items-center gap-2 rounded-2xl border border-primary/30 bg-white/[0.05] px-3 shadow-[inset_0_1px_0_rgba(255,255,255,.06)] focus-within:border-[oklch(0.7_0.25_340_/_0.55)] sm:h-12">
          <Search className="size-4 shrink-0 text-primary" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people, @handles..."
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={() => setQuery("")}
            className="grid size-8 place-items-center rounded-full border border-[oklch(0.7_0.25_340_/_0.3)] bg-[oklch(0.7_0.25_340_/_0.1)] text-[oklch(0.85_0.2_340)]"
            aria-label="AI search"
          >
            <Sparkles className="size-3.5" />
          </button>
        </div>

        {/* Filter pills */}
        <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar sm:mt-3 sm:gap-2">
          {["AI Match", "Online", "Collab Ready", "Same Vibes", "Verified"].map((label, i) => (
            <button
              key={label}
              className={`h-7 shrink-0 rounded-full border px-3 text-[11px] font-bold sm:h-8 sm:text-xs ${i === 0 ? "border-[oklch(0.7_0.25_340_/_0.6)] bg-[oklch(0.7_0.25_340_/_0.14)] text-white shadow-[0_0_18px_-10px_oklch(0.7_0.25_340)]" : "border-white/10 bg-white/[0.04] text-muted-foreground"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Creator list */}
      <div className="relative mt-3 flex min-h-0 flex-1 flex-col px-4 pb-4 sm:mt-4 sm:px-5 sm:pb-5">
        <div className="mb-2 flex items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.28em] text-muted-foreground">
              <Sparkles className="size-3 text-primary" /> Suggested for you
            </div>
            <div className="mt-0.5 text-[10px] text-muted-foreground">Curated by your activity</div>
          </div>
          <button className="shrink-0 text-[11px] font-black text-primary">See all</button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.03] no-scrollbar sm:rounded-[22px]">
          {results.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No one matches "{query}"
            </div>
          ) : (
            results.map((p, i) => (
              <CreatorRow key={p.id} peer={p} index={i} onClick={() => startConvo(p)} />
            ))
          )}
          {/* Smart match footer */}
          <div className="flex items-center gap-2.5 border-t border-primary/20 bg-primary/[0.06] px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
            <div className="grid size-9 place-items-center rounded-xl border border-[oklch(0.65_0.22_300_/_0.4)] bg-[oklch(0.65_0.22_300_/_0.12)] text-[oklch(0.82_0.22_300)] sm:size-10">
              <Sparkles className="size-4 sm:size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-black text-primary">Smart Match</div>
              <div className="truncate text-[10px] text-muted-foreground">
                12 more creators you'll vibe with
              </div>
            </div>
            <button className="h-8 rounded-xl border border-primary/30 bg-primary/10 px-2.5 text-[11px] font-black text-primary sm:h-9 sm:px-3">
              View
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function CreatorRow({ peer, index, onClick }: { peer: Peer; index: number; onClick: () => void }) {
  const meta = CREATOR_META[index % CREATOR_META.length];
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2.5 border-b border-white/[0.07] px-3 py-2.5 text-left transition hover:bg-white/[0.04] sm:gap-3 sm:px-4 sm:py-3"
    >
      <div className="relative size-10 shrink-0 rounded-full conic-ring sm:size-12">
        <img src={peer.avatar} className="size-10 rounded-full object-cover sm:size-12" alt="" />
        <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-[oklch(0.78_0.18_150)] ring-2 ring-background shadow-[0_0_10px_oklch(0.78_0.18_150)]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1">
          <span className="truncate text-sm font-black">{peer.name}</span>
          <VerifiedBadge kind={peer.verified} className="!size-3.5 shrink-0" />
        </div>
        <div className="text-[10px] text-muted-foreground">
          @{peer.handle} · {meta.role} · {meta.followers}
        </div>
      </div>
      <span
        className={`hidden rounded-full border px-2 py-0.5 text-[9px] font-bold sm:inline-flex ${meta.tone === "blue" ? "border-[oklch(0.82_0.15_215_/_0.35)] bg-[oklch(0.82_0.15_215_/_0.08)] text-[oklch(0.82_0.15_215)]" : "border-[oklch(0.7_0.25_340_/_0.35)] bg-[oklch(0.7_0.25_340_/_0.08)] text-[oklch(0.85_0.2_340)]"}`}
      >
        {meta.tag}
      </span>
      <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-primary/40 bg-primary/10 text-primary shadow-[0_0_18px_-10px_oklch(0.82_0.16_85)] sm:size-10">
        <MessageCirclePlus className="size-4 sm:size-5" />
      </span>
    </button>
  );
}

function ComposeStep({
  picked,
  draft,
  setDraft,
  setPicked,
  confirm,
}: {
  picked: Peer;
  draft: string;
  setDraft: (v: string) => void;
  setPicked: (p: Peer | null) => void;
  confirm: () => void;
}) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4 no-scrollbar sm:gap-5 sm:px-5 sm:pb-5">
      {/* Recipient card */}
      <div className="flex items-center gap-3 rounded-2xl border border-primary/35 bg-[linear-gradient(120deg,oklch(0.7_0.25_340_/_0.12),rgba(255,255,255,.04),oklch(0.82_0.16_85_/_0.08))] p-3 shadow-[0_0_28px_-20px_oklch(0.82_0.16_85)]">
        <div className="relative size-11 shrink-0 rounded-full conic-ring sm:size-14">
          <img
            src={picked.avatar}
            className="size-11 rounded-full object-cover sm:size-14"
            alt=""
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1 text-sm font-black sm:text-base">
            <span className="min-w-0 truncate">{picked.name}</span>
            <VerifiedBadge kind={picked.verified} className="!size-3.5 shrink-0" />
          </div>
          <div className="truncate text-[11px] text-muted-foreground">@{picked.handle}</div>
        </div>
        <button
          onClick={() => setPicked(null)}
          className="h-8 shrink-0 rounded-xl border border-primary/30 bg-primary/10 px-2.5 text-[11px] font-black text-primary sm:h-9 sm:px-3"
        >
          Change
        </button>
      </div>

      {/* Quick starters */}
      <div>
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.28em] text-muted-foreground">
          <Wand2 className="size-3 text-primary" /> Trey-I quick starters
        </div>
        <div className="grid gap-2">
          {QUICK_PROMPTS.map((prompt) => {
            const Icon = prompt.icon;
            return (
              <button
                key={prompt.text}
                onClick={() => {
                  haptic("light");
                  setDraft(prompt.text);
                }}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left transition hover:border-primary/35 hover:bg-white/[0.06]"
              >
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-full border ${prompt.tone === "blue" ? "border-[oklch(0.82_0.15_215_/_0.4)] text-[oklch(0.82_0.15_215)]" : prompt.tone === "violet" ? "border-[oklch(0.65_0.22_300_/_0.4)] text-[oklch(0.78_0.22_300)]" : "border-primary/40 text-primary"}`}
                >
                  <Icon className="size-4" />
                </span>
                <span className="flex-1 text-xs font-medium leading-relaxed sm:text-sm">
                  {prompt.text}
                </span>
                <span className="text-lg font-black text-[oklch(0.85_0.2_340)]">&gt;</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Message box */}
      <div>
        <div className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-muted-foreground">
          First message (optional)
        </div>
        <div className="rounded-2xl border border-[oklch(0.7_0.25_340_/_0.35)] bg-white/[0.04] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,.06)]">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            placeholder={`Say hi to ${picked.name.split(" ")[0]}...`}
            className="w-full resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-muted-foreground"
          />
          <div className="mt-2 flex items-center gap-2">
            {[ImageIcon, Mic, Calendar, Wand2].map((Icon, i) => (
              <button
                key={i}
                className="grid size-8 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-muted-foreground hover:text-primary sm:size-9"
                aria-label="Composer tool"
              >
                <Icon className="size-3.5 sm:size-4" />
              </button>
            ))}
            <button
              onClick={confirm}
              className="ml-auto inline-flex h-10 items-center gap-2 rounded-xl border border-primary/45 bg-[linear-gradient(135deg,rgba(255,200,87,.14),rgba(255,176,0,.06))] px-4 text-sm font-black text-foreground shadow-[0_0_22px_-10px_oklch(0.82_0.16_85)] sm:h-11"
            >
              Send <Send className="size-4 text-primary" />
            </button>
          </div>
        </div>
      </div>

      {/* Action pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { icon: Paperclip, label: "Attach", tone: "pink" },
          { icon: Mic, label: "Voice", tone: "blue" },
          { icon: Calendar, label: "Schedule", tone: "violet" },
          { icon: Sparkles, label: "AI Refine", tone: "gold" },
        ].map(({ icon: Icon, label, tone }) => (
          <button
            key={label}
            className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[11px] font-bold sm:h-9 ${tone === "blue" ? "border-[oklch(0.82_0.15_215_/_0.35)] text-[oklch(0.82_0.15_215)]" : tone === "gold" ? "border-primary/35 text-primary" : "border-[oklch(0.7_0.25_340_/_0.35)] text-[oklch(0.85_0.2_340)]"}`}
          >
            <Icon className="size-3" /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}

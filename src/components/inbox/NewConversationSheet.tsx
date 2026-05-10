import { useEffect, useMemo, useRef, useState } from "react";
import { X, Search, Sparkles, MessageCirclePlus, Wand2, Users, Zap } from "lucide-react";
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
  { icon: Sparkles, label: "Collab pitch", text: "Hey! Loved your latest drop — would love to chat about a collab. Open to ideas?" },
  { icon: Wand2, label: "Trey-I intro", text: "Trey-I here — quick intro: I think you and I should connect on this idea ✨" },
  { icon: Zap, label: "Quick hi", text: "Hey 👋 just followed — big fan of your work." },
];

export function NewConversationSheet({ open, onClose, onPicked }: Props) {
  const { openThread, send } = useMessages();
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Peer | null>(null);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery(""); setPicked(null); setDraft("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = creators.map<Peer>((c) => ({
      id: c.id, name: c.name, handle: c.handle, avatar: c.avatar as unknown as string,
      verified: c.verified, online: false,
    }));
    if (!q) return list;
    return list.filter((p) => p.name.toLowerCase().includes(q) || p.handle.toLowerCase().includes(q));
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
      className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-6"
      style={{ background: "oklch(0 0 0 / 0.55)", backdropFilter: "blur(14px)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg max-h-[92dvh] rounded-t-3xl sm:rounded-3xl glass-strong neon-border overflow-hidden flex flex-col animate-msg-pop relative"
        style={{ animation: "slide-up 0.32s cubic-bezier(0.2, 0.9, 0.2, 1.05)" }}
      >
        {/* Holo aurora */}
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -top-24 -left-16 size-72 rounded-full bg-[radial-gradient(circle,oklch(0.7_0.25_340_/_0.45),transparent_70%)] blur-3xl" />
          <div className="absolute -bottom-24 -right-16 size-72 rounded-full bg-[radial-gradient(circle,oklch(0.78_0.18_215_/_0.4),transparent_70%)] blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        </div>

        {/* Header */}
        <div className="relative p-4 border-b border-white/5 flex items-center gap-3">
          <div className="size-10 rounded-xl grid place-items-center bg-gradient-to-br from-primary/30 to-[oklch(0.7_0.25_340_/_0.3)] border border-primary/30">
            <MessageCirclePlus className="size-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[9px] tracking-[0.3em] text-primary">NEW · CONVERSATION</div>
            <h2 className="text-lg font-bold leading-tight"><span className="text-gradient-gold">{picked ? "Compose" : "Connect with"}</span></h2>
          </div>
          <button onClick={onClose} className="size-9 grid place-items-center rounded-full glass border border-white/10 tilt-press" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>

        {!picked ? (
          <>
            {/* Search */}
            <div className="relative p-3">
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl glass border border-white/10 focus-within:border-primary/50 focus-within:glow-gold transition">
                <Search className="size-4 text-primary shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search people, @handles…"
                  className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-muted-foreground"><X className="size-4" /></button>
                )}
              </div>
            </div>

            {/* Suggested grid */}
            <div className="px-3 pb-1 flex items-center gap-1.5 text-[10px] tracking-[0.25em] text-muted-foreground">
              <Users className="size-3 text-primary" /> {query ? "MATCHES" : "SUGGESTED"} · {results.length}
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar p-3 pt-2">
              {results.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">No one matches "{query}"</div>
              ) : (
                <ul className="grid grid-cols-1 gap-2">
                  {results.map((p, i) => (
                    <li key={p.id} style={{ animationDelay: `${i * 35}ms` }} className="animate-rise">
                      <button
                        onClick={() => startConvo(p)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-2xl glass border border-white/10 hover:border-primary/40 hover:bg-white/5 transition tilt-press text-left"
                      >
                        <div className="relative size-12 rounded-full conic-ring shrink-0">
                          <img src={p.avatar} className="size-12 rounded-full object-cover" alt="" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold flex items-center gap-1 truncate">
                            {p.name}
                            <VerifiedBadge kind={p.verified} className="!size-3.5" />
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate">@{p.handle}</div>
                        </div>
                        <div className="size-8 rounded-full grid place-items-center bg-primary/15 border border-primary/30 text-primary">
                          <MessageCirclePlus className="size-4" />
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
            {/* Picked peer card */}
            <div className="flex items-center gap-3 p-3 rounded-2xl glass border border-primary/30 glow-gold">
              <div className="relative size-14 rounded-full conic-ring shrink-0">
                <img src={picked.avatar} className="size-14 rounded-full object-cover" alt="" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base font-semibold flex items-center gap-1 truncate">
                  {picked.name} <VerifiedBadge kind={picked.verified} className="!size-3.5" />
                </div>
                <div className="text-[11px] text-muted-foreground truncate">@{picked.handle}</div>
              </div>
              <button
                onClick={() => setPicked(null)}
                className="text-[11px] text-primary px-2 py-1 rounded-lg glass border border-white/10 tilt-press"
              >
                Change
              </button>
            </div>

            {/* Quick prompts */}
            <div>
              <div className="text-[10px] tracking-[0.25em] text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Wand2 className="size-3 text-primary" /> TREY-I QUICK STARTERS
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {QUICK_PROMPTS.map((qp) => (
                  <button
                    key={qp.label}
                    onClick={() => { haptic("light"); setDraft(qp.text); }}
                    className="flex items-center gap-2 p-2.5 rounded-xl glass border border-white/10 hover:border-primary/40 text-left tilt-press"
                  >
                    <qp.icon className="size-4 text-primary shrink-0" />
                    <span className="text-xs text-muted-foreground line-clamp-2">{qp.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Draft */}
            <div>
              <div className="text-[10px] tracking-[0.25em] text-muted-foreground mb-1.5">FIRST MESSAGE (OPTIONAL)</div>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                placeholder={`Say hi to ${picked.name.split(" ")[0]}…`}
                className="w-full p-3 rounded-2xl glass border border-white/10 focus:border-primary/50 focus:outline-none text-sm bg-transparent placeholder:text-muted-foreground resize-none"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="relative p-3 border-t border-white/5 flex items-center justify-between gap-2">
          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Sparkles className="size-3 text-primary" /> Encrypted · Trey-I assist
          </div>
          {picked && (
            <button
              onClick={confirm}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold tilt-press flex items-center gap-1.5"
            >
              <MessageCirclePlus className="size-4" />
              Start chat
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

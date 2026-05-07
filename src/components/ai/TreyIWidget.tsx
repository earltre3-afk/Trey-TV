import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Wand2, Heart, BarChart3, Mic, Image as ImageIcon } from "lucide-react";

type Msg = { id: string; from: "you" | "ai"; text: string; time: string };

const seed: Msg[] = [
  { id: "1", from: "ai", text: "Hey Trey 👋 I'm Trey-I — your creative co-pilot. Ask me to draft a caption, prescribe a vibe, or remix your last drop.", time: "now" },
];

const quick = [
  { icon: Wand2, label: "Caption my last post" },
  { icon: Heart, label: "Suggest a mood drop" },
  { icon: BarChart3, label: "What's trending tonight?" },
  { icon: ImageIcon, label: "Generate a thumbnail" },
];

export function TreyIWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>(seed);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, open]);

  const send = (raw?: string) => {
    const value = (raw ?? text).trim();
    if (!value) return;
    const youMsg: Msg = { id: crypto.randomUUID(), from: "you", text: value, time: "now" };
    setMsgs((m) => [...m, youMsg]);
    setText("");
    setTimeout(() => {
      setMsgs((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          from: "ai",
          text: aiReply(value),
          time: "now",
        },
      ]);
    }, 700);
  };

  return (
    <>
      {/* Floating launcher */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open Trey-I assistant"
        className={`fixed z-40 bottom-24 lg:bottom-6 right-4 lg:right-6 size-14 rounded-full grid place-items-center transition-all duration-500 hover:scale-110 active:scale-95 ${
          open ? "opacity-0 pointer-events-none scale-50" : "opacity-100"
        }`}
      >
        {/* Conic aurora halo */}
        <span aria-hidden className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85),oklch(0.7_0.25_340),oklch(0.65_0.22_300),oklch(0.82_0.15_215),oklch(0.82_0.16_85))] animate-conic-spin opacity-90 blur-[1px]" />
        <span aria-hidden className="absolute inset-0.5 rounded-full bg-background" />
        <span aria-hidden className="absolute inset-0 rounded-full bg-primary/30 blur-xl animate-glow-pulse" />
        <Sparkles className="relative size-6 text-primary drop-shadow-[0_0_8px_oklch(0.82_0.16_85_/_0.9)]" />
        <span className="absolute -top-1 -right-1 size-3 rounded-full bg-[oklch(0.7_0.25_340)] ring-2 ring-background animate-glow-pulse" />
      </button>

      {/* Panel */}
      <div
        className={`fixed z-50 bottom-24 lg:bottom-6 right-3 lg:right-6 w-[calc(100vw-1.5rem)] sm:w-[380px] max-h-[75vh] flex flex-col rounded-3xl glass-strong neon-border shadow-[0_30px_80px_-20px_oklch(0_0_0_/_0.8)] origin-bottom-right transition-all duration-300 ${
          open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-90 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="relative p-4 border-b border-white/5 overflow-hidden">
          <div className="absolute -top-10 -right-10 size-32 rounded-full bg-[radial-gradient(circle,oklch(0.7_0.25_340_/_0.5),transparent_70%)] blur-xl" />
          <div className="relative flex items-center gap-3">
            <div className="relative size-10 rounded-full conic-ring shrink-0">
              <div className="size-10 rounded-full grid place-items-center bg-background">
                <Sparkles className="size-5 text-primary" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold flex items-center gap-2">
                Trey-I
                <span className="text-[9px] tracking-widest text-primary px-1.5 py-0.5 rounded bg-primary/15 border border-primary/30">BETA</span>
              </div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-[oklch(0.78_0.18_150)] animate-glow-pulse" />
                Online · co-pilot for creators
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="size-8 grid place-items-center rounded-full hover:bg-white/5">
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {msgs.map((m) => (
            <div key={m.id} className={`flex ${m.from === "you" ? "justify-end" : "justify-start"} animate-rise`}>
              <div
                className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                  m.from === "you"
                    ? "bg-primary text-primary-foreground rounded-br-sm shadow-[0_0_18px_oklch(0.82_0.16_85_/_0.4)]"
                    : "glass border border-white/10 rounded-bl-sm"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        {msgs.length <= 2 && (
          <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar">
            {quick.map((q) => (
              <button
                key={q.label}
                onClick={() => send(q.label)}
                className="shrink-0 px-3 py-1.5 rounded-full text-[11px] glass border border-white/10 hover:bg-white/5 flex items-center gap-1.5 tilt-press"
              >
                <q.icon className="size-3 text-primary" />
                {q.label}
              </button>
            ))}
          </div>
        )}

        {/* Composer */}
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-2 rounded-2xl glass border border-white/10 px-3 py-2 focus-within:border-primary/50 transition">
            <button className="text-muted-foreground hover:text-primary"><Mic className="size-4" /></button>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask Trey-I anything…"
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
            />
            <button
              onClick={() => send()}
              disabled={!text.trim()}
              className={`size-8 grid place-items-center rounded-xl transition ${
                text.trim() ? "bg-primary text-primary-foreground glow-gold tilt-press" : "bg-white/5 text-muted-foreground"
              }`}
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function aiReply(input: string): string {
  const t = input.toLowerCase();
  if (t.includes("caption")) return "Try: 'Lights low, vibes high. Late nights only make sense at the studio. New drop loading…' 🎬✨";
  if (t.includes("mood") || t.includes("prescribe")) return "Tonight feels like a Late-Night Drive set. I can stitch a 4-track moodboard. Want me to send it to your Prescribe Me feed?";
  if (t.includes("trend")) return "Top movers right now: #StudioSessions (+184%), #LateNightDrops (+92%), and 'Aurora' filter. Wanna ride one?";
  if (t.includes("thumbnail") || t.includes("image")) return "Cooking up a 3-variant thumbnail pack — gold-noir, neon-purple, and aurora. ETA 12s. ⏳";
  return "On it. I'll line up a draft and ping you in your Inbox when it's ready.";
}

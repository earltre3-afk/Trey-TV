import { useEffect, useState } from "react";
import { Sparkles, MessageCircle, Wand2, ShieldCheck, ArrowRight, X } from "lucide-react";
import { haptic } from "@/lib/haptics";

const KEY = "treytv_chat_onboarding_v1";

const STEPS = [
  {
    icon: MessageCircle,
    accent: "oklch(0.82 0.16 85)",
    title: "Welcome to your Inbox",
    body: "Real-time DMs with creators and fans. Tap any chat to dive in — swipe back to return to the list.",
  },
  {
    icon: Wand2,
    accent: "oklch(0.7 0.25 340)",
    title: "Trey-I co-pilot",
    body: "Tap quick starters or let Trey-I draft replies, summarize long threads and spot collab opportunities.",
  },
  {
    icon: Sparkles,
    accent: "oklch(0.78 0.18 215)",
    title: "Send gifts in chat",
    body: "Reward creators with luxury gifts powered by your reward balance — from a single rose to a castle getaway.",
  },
  {
    icon: ShieldCheck,
    accent: "oklch(0.78 0.18 150)",
    title: "Private & secure",
    body: "Every message is encrypted end-to-end. Block, report or filter requests anytime from the inbox menu.",
  },
];

export function ChatOnboarding() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setOpen(true);
    } catch {}
  }, []);

  const close = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
    haptic("success");
    setOpen(false);
  };

  if (!open) return null;
  const s = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center p-4"
      style={{ background: "oklch(0 0 0 / 0.65)", backdropFilter: "blur(16px)" }}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl glass-strong neon-border overflow-hidden"
        style={{ animation: "slide-up 0.32s cubic-bezier(0.2, 0.9, 0.2, 1.05)" }}
      >
        {/* Aurora */}
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-80">
          <div
            className="absolute -top-24 -left-12 size-64 rounded-full blur-3xl"
            style={{
              background: `radial-gradient(circle, ${s.accent}, transparent 70%)`,
              opacity: 0.45,
            }}
          />
          <div className="absolute -bottom-24 -right-12 size-64 rounded-full bg-[radial-gradient(circle,oklch(0.7_0.25_340_/_0.35),transparent_70%)] blur-3xl" />
        </div>

        <button
          onClick={close}
          className="absolute top-3 right-3 z-10 size-8 grid place-items-center rounded-full glass border border-white/10 tilt-press"
          aria-label="Skip"
        >
          <X className="size-4" />
        </button>

        <div className="relative p-6 pt-10 text-center space-y-4">
          <div
            className="mx-auto size-20 rounded-2xl grid place-items-center border"
            style={{
              background: `linear-gradient(135deg, ${s.accent} 0%, transparent 100%)`,
              borderColor: s.accent,
              boxShadow: `0 0 40px ${s.accent}`,
            }}
          >
            <s.icon className="size-10 text-white drop-shadow" />
          </div>

          <div className="space-y-1.5">
            <div className="text-[10px] tracking-[0.3em] text-primary">
              STEP {step + 1} / {STEPS.length}
            </div>
            <h2 className="text-xl font-bold">
              <span className="text-gradient-gold">{s.title}</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed px-2">{s.body}</p>
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === step ? 24 : 8,
                  background: i === step ? "var(--color-primary)" : "oklch(1 0 0 / 0.2)",
                }}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => {
                haptic("light");
                close();
              }}
              className="flex-1 py-2.5 rounded-xl text-sm glass border border-white/10 tilt-press"
            >
              Skip
            </button>
            <button
              onClick={() => {
                haptic("selection");
                if (last) close();
                else setStep(step + 1);
              }}
              className="flex-[1.4] py-2.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold tilt-press flex items-center justify-center gap-1.5"
            >
              {last ? "Start chatting" : "Next"}
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { X, ChevronRight, ChevronLeft, Sparkles, Wand2, Brain, Heart, Zap, Cloud, Flame, Smile, Leaf, Star, Music, Film, Mic, Tv, Check } from "lucide-react";
import { prescribed } from "@/lib/mock-data";
import { VerifiedBadge } from "@/components/brand/Badge";

type Choice = { id: string; label: string; icon: React.ComponentType<{ className?: string }>; tint: string; tag: string };
type Question = { id: string; prompt: string; sub: string; choices: Choice[] };

const QUESTIONS: Question[] = [
  {
    id: "energy", prompt: "What's your energy right now?", sub: "Pick the wave you're riding",
    choices: [
      { id: "low", label: "Low & quiet", icon: Cloud, tint: "oklch(0.7 0.12 240)", tag: "chill" },
      { id: "medium", label: "Steady flow", icon: Leaf, tint: "oklch(0.78 0.18 150)", tag: "balanced" },
      { id: "high", label: "Buzzing", icon: Zap, tint: "oklch(0.82 0.16 85)", tag: "energetic" },
      { id: "wild", label: "On fire", icon: Flame, tint: "oklch(0.7 0.25 30)", tag: "intense" },
    ],
  },
  {
    id: "mood", prompt: "Which word fits your mood?", sub: "Trust the first instinct",
    choices: [
      { id: "happy", label: "Happy", icon: Smile, tint: "oklch(0.85 0.15 90)", tag: "uplift" },
      { id: "focused", label: "Focused", icon: Brain, tint: "oklch(0.75 0.18 215)", tag: "motivated" },
      { id: "in-love", label: "Soft heart", icon: Heart, tint: "oklch(0.72 0.22 350)", tag: "intimate" },
      { id: "starry", label: "Dreamy", icon: Star, tint: "oklch(0.7 0.22 290)", tag: "ethereal" },
    ],
  },
  {
    id: "format", prompt: "What format hits hardest tonight?", sub: "Choose your medium",
    choices: [
      { id: "video", label: "Video", icon: Film, tint: "oklch(0.7 0.22 300)", tag: "video" },
      { id: "music", label: "Music", icon: Music, tint: "oklch(0.82 0.15 215)", tag: "music" },
      { id: "live", label: "Live", icon: Tv, tint: "oklch(0.65 0.24 15)", tag: "live" },
      { id: "talk", label: "Talk / Pod", icon: Mic, tint: "oklch(0.78 0.14 50)", tag: "talk" },
    ],
  },
  {
    id: "depth", prompt: "How deep do you want to go?", sub: "Surface skim or full immersion",
    choices: [
      { id: "snack", label: "Quick hits", icon: Zap, tint: "oklch(0.82 0.16 85)", tag: "short" },
      { id: "session", label: "A real session", icon: Brain, tint: "oklch(0.75 0.18 215)", tag: "long" },
      { id: "background", label: "Background loop", icon: Cloud, tint: "oklch(0.7 0.12 240)", tag: "ambient" },
      { id: "binge", label: "Binge mode", icon: Flame, tint: "oklch(0.7 0.25 30)", tag: "binge" },
    ],
  },
  {
    id: "intent", prompt: "What do you actually need from this?", sub: "Be honest with yourself",
    choices: [
      { id: "escape", label: "Escape reality", icon: Star, tint: "oklch(0.7 0.22 290)", tag: "escape" },
      { id: "lift", label: "Lift my mood", icon: Smile, tint: "oklch(0.85 0.15 90)", tag: "uplift" },
      { id: "learn", label: "Learn something", icon: Brain, tint: "oklch(0.75 0.18 215)", tag: "growth" },
      { id: "feel", label: "Just feel something", icon: Heart, tint: "oklch(0.72 0.22 350)", tag: "emotional" },
    ],
  },
];

function pickRecommendations(answers: Record<string, Choice>) {
  const tags = new Set(Object.values(answers).map((c) => c.tag));
  const scored = prescribed.map((p) => {
    let score = 0;
    if (tags.has("music") && p.kind === "MUSIC") score += 3;
    if (tags.has("live") && p.kind === "LIVE") score += 3;
    if (tags.has("video") && p.kind === "VIDEO") score += 3;
    if (tags.has("talk") && p.kind === "VIDEO") score += 1;
    if (tags.has("motivated") && p.mood === "Motivated") score += 2;
    if (tags.has("chill") && p.mood === "Chill") score += 2;
    if (tags.has("ethereal") && p.mood === "Inspired") score += 2;
    if (tags.has("intense") && p.mood === "Motivated") score += 1;
    if (tags.has("uplift") && p.mood !== "Chill") score += 1;
    score += Math.random() * 0.5;
    return { p, score };
  });
  return scored.sort((a, b) => b.score - a.score).map((s) => s.p);
}

function summary(answers: Record<string, Choice>) {
  const labels = Object.values(answers).map((c) => c.label.toLowerCase());
  return labels.slice(0, 3).join(" · ");
}

export function PrescribeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Choice>>({});
  const [analyzing, setAnalyzing] = useState(false);
  const [done, setDone] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setStep(0); setAnswers({}); setAnalyzing(false); setDone(false);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);

  const total = QUESTIONS.length;
  const isLast = step === total - 1;
  const q = QUESTIONS[step];
  const selected = q ? answers[q.id] : undefined;
  const progress = analyzing || done ? 1 : Math.min(1, (step + (selected ? 0.5 : 0)) / total);

  const recs = useMemo(() => done ? pickRecommendations(answers) : [], [done, answers]);

  const handlePick = (choice: Choice) => {
    setAnswers((a) => ({ ...a, [q.id]: choice }));
    if (isLast) {
      setAnalyzing(true);
      setTimeout(() => { setAnalyzing(false); setDone(true); }, 1800);
    } else {
      setTimeout(() => setStep((s) => s + 1), 220);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Prescribe Me — mood quiz"
    >
      {/* Backdrop with animated aurora */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-xl"
      />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/3 -left-1/4 size-[60vmax] rounded-full opacity-40 blur-3xl animate-glow-pulse"
             style={{ background: "radial-gradient(circle, oklch(0.65 0.22 300 / 0.7), transparent 60%)" }} />
        <div className="absolute -bottom-1/3 -right-1/4 size-[60vmax] rounded-full opacity-40 blur-3xl animate-glow-pulse"
             style={{ background: "radial-gradient(circle, oklch(0.7 0.25 340 / 0.6), transparent 60%)", animationDelay: "1.2s" }} />
        <div className="absolute top-1/3 right-1/4 size-[40vmax] rounded-full opacity-30 blur-3xl animate-glow-pulse"
             style={{ background: "radial-gradient(circle, oklch(0.82 0.15 215 / 0.6), transparent 60%)", animationDelay: "0.6s" }} />
      </div>

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-white/10 bg-[linear-gradient(160deg,oklch(0.18_0.05_290_/_0.95),oklch(0.12_0.04_270_/_0.95))] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] animate-rise"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center gap-3 px-5 py-4 backdrop-blur-xl bg-black/30 border-b border-white/5">
          <div className="relative size-9 rounded-full grid place-items-center">
            <span className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,oklch(0.7_0.25_340),oklch(0.65_0.22_300),oklch(0.82_0.15_215),oklch(0.7_0.25_340))] animate-spin" style={{ animationDuration: "6s" }} />
            <span className="absolute inset-[2px] rounded-full bg-black/80" />
            <Wand2 className="relative size-4 text-[oklch(0.7_0.25_340)]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] tracking-[0.25em] text-[oklch(0.7_0.25_340)] font-bold">PRESCRIBE ME</div>
            <div className="text-sm font-semibold truncate">
              {done ? "Your prescription is ready" : analyzing ? "Trey-I is calibrating…" : `Question ${step + 1} of ${total}`}
            </div>
          </div>
          <button onClick={onClose} className="size-9 rounded-full grid place-items-center hover:bg-white/10 text-muted-foreground hover:text-foreground" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-5 pt-3">
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-500 ease-out"
              style={{
                width: `${progress * 100}%`,
                background: "linear-gradient(90deg, oklch(0.65 0.22 300), oklch(0.7 0.25 340), oklch(0.82 0.15 215))",
                boxShadow: "0 0 14px oklch(0.7 0.25 340 / 0.6)",
              }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="p-5 pb-7 min-h-[420px]">
          {!analyzing && !done && q && (
            <div key={q.id} className="space-y-5 animate-rise">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1 text-[10px] tracking-[0.3em] text-muted-foreground">
                  <Sparkles className="size-3 text-[oklch(0.7_0.25_340)]" /> {q.sub}
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-[linear-gradient(135deg,oklch(0.95_0.02_300),oklch(0.7_0.25_340))]">
                  {q.prompt}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {q.choices.map((c, i) => {
                  const Icon = c.icon;
                  const isOn = selected?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => handlePick(c)}
                      className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 active:scale-[0.97] ${
                        isOn ? "border-white/40 scale-[1.02]" : "border-white/10 hover:border-white/30 hover:-translate-y-0.5"
                      }`}
                      style={{
                        background: isOn
                          ? `linear-gradient(135deg, color-mix(in oklab, ${c.tint} 35%, transparent), color-mix(in oklab, ${c.tint} 8%, transparent))`
                          : `linear-gradient(135deg, color-mix(in oklab, ${c.tint} 12%, transparent), transparent)`,
                        boxShadow: isOn ? `0 0 30px -8px ${c.tint}` : undefined,
                        animationDelay: `${i * 60}ms`,
                      }}
                    >
                      <div
                        className="size-10 rounded-xl grid place-items-center mb-3 border border-white/10"
                        style={{ background: `color-mix(in oklab, ${c.tint} 25%, black)`, color: c.tint }}
                      >
                        <Icon className="size-5" />
                      </div>
                      <div className="text-sm font-semibold">{c.label}</div>
                      {isOn && (
                        <span className="absolute top-2 right-2 size-5 rounded-full grid place-items-center bg-white text-black">
                          <Check className="size-3" />
                        </span>
                      )}
                      <span className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ background: `radial-gradient(circle at 30% 0%, color-mix(in oklab, ${c.tint} 20%, transparent), transparent 60%)` }} />
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <ChevronLeft className="size-4" /> Back
                </button>
                <div className="flex items-center gap-1.5">
                  {QUESTIONS.map((_, i) => (
                    <span
                      key={i}
                      className={`size-1.5 rounded-full transition-all ${i === step ? "bg-[oklch(0.7_0.25_340)] w-5" : i < step ? "bg-white/40" : "bg-white/10"}`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => selected && (isLast ? handlePick(selected) : setStep((s) => s + 1))}
                  disabled={!selected}
                  className="flex items-center gap-1 text-xs text-[oklch(0.7_0.25_340)] hover:text-foreground disabled:opacity-30"
                >
                  {isLast ? "Prescribe" : "Next"} <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {analyzing && (
            <div className="flex flex-col items-center justify-center text-center gap-6 py-8 animate-fade-in">
              <div className="relative size-40">
                <div className="absolute inset-0 rounded-full animate-spin" style={{ background: "conic-gradient(from 0deg, oklch(0.7 0.25 340), oklch(0.65 0.22 300), oklch(0.82 0.15 215), oklch(0.7 0.25 340))", animationDuration: "3s", filter: "blur(2px)" }} />
                <div className="absolute inset-2 rounded-full bg-black/80 backdrop-blur" />
                <div className="absolute inset-6 rounded-full animate-spin" style={{ background: "conic-gradient(from 90deg, transparent, oklch(0.7 0.25 340 / 0.7), transparent)", animationDuration: "1.6s", animationDirection: "reverse" }} />
                <div className="absolute inset-0 grid place-items-center">
                  <Wand2 className="size-10 text-[oklch(0.7_0.25_340)] animate-glow-pulse" />
                </div>
                <div className="absolute -inset-4 rounded-full opacity-60 blur-2xl animate-glow-pulse" style={{ background: "radial-gradient(circle, oklch(0.7 0.25 340 / 0.6), transparent 70%)" }} />
              </div>
              <div className="space-y-2">
                <div className="text-lg font-bold">Reading your signal…</div>
                <div className="text-xs text-muted-foreground max-w-xs">
                  Mapping mood vectors, cross-referencing creators, tuning frequency.
                </div>
              </div>
              <div className="flex flex-col gap-1.5 text-[11px] text-muted-foreground">
                {["Mood vector locked", "Energy curve mapped", "Creator constellation aligned"].map((t, i) => (
                  <div key={t} className="flex items-center gap-2 animate-rise" style={{ animationDelay: `${i * 350}ms` }}>
                    <Check className="size-3 text-[oklch(0.78_0.18_150)]" /> {t}
                  </div>
                ))}
              </div>
            </div>
          )}

          {done && (
            <div className="space-y-5 animate-rise">
              <div className="text-center space-y-2">
                <div className="text-[10px] tracking-[0.3em] text-[oklch(0.7_0.25_340)]">YOUR PRESCRIPTION</div>
                <h2 className="text-2xl font-extrabold tracking-tight">Tonight you need…</h2>
                <p className="text-xs text-muted-foreground capitalize">{summary(answers)}</p>
              </div>

              <div className="space-y-3">
                {recs.map((p, i) => (
                  <div
                    key={p.id}
                    className="flex gap-3 rounded-2xl border border-white/10 p-3 bg-white/[0.03] hover:bg-white/[0.06] transition animate-rise"
                    style={{ animationDelay: `${i * 120}ms` }}
                  >
                    <div className="relative size-20 shrink-0 rounded-xl overflow-hidden">
                      <img src={p.media} alt="" className="size-full object-cover" />
                      <span className={`absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        p.kind === "LIVE" ? "bg-[oklch(0.65_0.24_15)] text-white" : p.kind === "MUSIC" ? "bg-[oklch(0.82_0.15_215)] text-black" : "bg-[oklch(0.65_0.22_300)] text-white"
                      }`}>{p.kind === "LIVE" ? "● LIVE" : p.kind}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      {i === 0 && <div className="text-[10px] tracking-[0.2em] text-[oklch(0.82_0.16_85)] mb-0.5">★ TOP MATCH</div>}
                      <div className="text-sm font-semibold truncate">{p.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                        {p.creator} <VerifiedBadge kind="creator" className="!size-3" />
                      </div>
                      <span className="mt-1.5 inline-block text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-muted-foreground">
                        {p.mood}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => { setStep(0); setAnswers({}); setDone(false); }}
                  className="flex-1 px-3 py-3 rounded-xl text-xs font-semibold border border-white/10 hover:bg-white/5"
                >
                  Retake
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-3 py-3 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-[oklch(0.7_0.25_340)] to-[oklch(0.82_0.15_215)] hover:opacity-90"
                >
                  Start watching
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

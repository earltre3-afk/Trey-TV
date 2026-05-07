import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mic, MicOff, ArrowLeft, Sparkles, Volume2, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/onboarding/voice")({
  component: VoiceOnboarding,
  head: () => ({
    meta: [
      { title: "Voice setup with Trey-I" },
      { name: "description", content: "Have a natural conversation with Trey-I to build your profile." },
    ],
  }),
});

type Step = { ai: string; field: keyof Profile; placeholder: string };
type Profile = { name: string; handle: string; bio: string; vibe: string };

const script: Step[] = [
  { ai: "Hey — I'm Trey-I. What should the world call you?", field: "name", placeholder: "Your name" },
  { ai: "Love that. Pick a handle people will tag.", field: "handle", placeholder: "@yourhandle" },
  { ai: "In one breath — what do you create?", field: "bio", placeholder: "I create…" },
  { ai: "Last one. What's tonight's vibe?", field: "vibe", placeholder: "Late-night studio energy" },
];

function VoiceOnboarding() {
  const nav = useNavigate();
  const { signIn, updateUser } = useAuth();
  const [step, setStep] = useState(0);
  const [listening, setListening] = useState(false);
  const [profile, setProfile] = useState<Profile>({ name: "", handle: "", bio: "", vibe: "" });
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);

  useEffect(() => { setDraft(""); }, [step]);

  const cur = script[step];
  const isLast = step === script.length - 1;

  const submit = () => {
    if (!draft.trim()) return;
    setProfile((p) => ({ ...p, [cur.field]: draft.trim() }));
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      if (isLast) {
        signIn("creator");
        updateUser({
          name: draft.trim() || "New Creator",
          handle: profile.handle || "newcreator",
          bio: profile.bio || draft.trim(),
        });
        nav({ to: "/" });
      } else {
        setStep((s) => s + 1);
      }
    }, 700);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 size-[70vmin] rounded-full bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85_/_0.45),oklch(0.7_0.25_340_/_0.4),oklch(0.65_0.22_300_/_0.4),oklch(0.82_0.15_215_/_0.4),oklch(0.82_0.16_85_/_0.45))] blur-3xl opacity-60 animate-conic-spin" />
      </div>

      <div className="relative max-w-[720px] mx-auto px-4 pt-6 pb-12">
        <div className="flex items-center justify-between">
          <Link to="/onboarding" className="size-9 grid place-items-center rounded-full liquid-glass border border-white/10">
            <ArrowLeft className="size-4" />
          </Link>
          <div className="text-[10px] tracking-[0.3em] text-primary">VOICE SETUP · {step + 1}/{script.length}</div>
          <div className="size-9" />
        </div>

        {/* Orb */}
        <div className="mt-12 grid place-items-center">
          <div className="relative size-48">
            <div aria-hidden className={`absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85),oklch(0.7_0.25_340),oklch(0.65_0.22_300),oklch(0.82_0.15_215),oklch(0.82_0.16_85))] ${listening ? "animate-conic-spin" : "opacity-60"} blur-md`} />
            <div className="absolute inset-2 rounded-full bg-background grid place-items-center liquid-glass border border-white/10">
              {thinking ? <Loader2 className="size-10 text-primary animate-spin" />
               : listening ? <Volume2 className="size-10 text-primary animate-glow-pulse" />
               : <Sparkles className="size-10 text-primary" />}
            </div>
            <div aria-hidden className="absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-glow-pulse" />
          </div>
        </div>

        <div className="mt-8 text-center space-y-2 animate-rise">
          <div className="text-xs tracking-widest text-muted-foreground">TREY-I SAYS</div>
          <p className="text-xl sm:text-2xl font-bold leading-snug">{cur.ai}</p>
        </div>

        {/* Transcript / typing fallback */}
        <div className="mt-8 mx-auto max-w-md">
          <div className="rounded-2xl liquid-glass border border-white/10 p-3 flex items-center gap-2 focus-within:border-primary/50 transition">
            <button
              onClick={() => setListening((v) => !v)}
              className={`size-10 rounded-full grid place-items-center transition ${listening ? "bg-primary text-primary-foreground glow-gold" : "bg-white/5 text-muted-foreground"}`}
              aria-label="Toggle mic"
            >
              {listening ? <Mic className="size-5" /> : <MicOff className="size-5" />}
            </button>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder={listening ? "Listening… (or type)" : cur.placeholder}
              className="flex-1 bg-transparent text-sm focus:outline-none px-1"
              autoFocus
            />
            <button onClick={submit} disabled={!draft.trim()} className={`px-3 h-9 rounded-xl text-xs font-semibold ${draft.trim() ? "bg-primary text-primary-foreground glow-gold" : "bg-white/5 text-muted-foreground"}`}>
              {isLast ? "Finish" : "Next"}
            </button>
          </div>
          <div className="mt-3 text-center text-[11px] text-muted-foreground">
            Voice powered by ElevenLabs (plug in later) · Your responses build your profile in real-time.
          </div>
        </div>

        {/* Progress chips */}
        <div className="mt-8 flex justify-center gap-1.5">
          {script.map((s, i) => (
            <span key={s.field} className={`h-1.5 rounded-full transition-all ${i <= step ? "w-8 bg-primary" : "w-3 bg-white/10"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

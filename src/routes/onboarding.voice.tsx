import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, ArrowLeft, Sparkles, Volume2, Loader2 } from "lucide-react";
import { startIntakeSession, profileSetupTurn } from "@/lib/trey-i/intake.server";
import { createBrowserClient } from "@/lib/supabase-browser";

export const Route = createFileRoute("/onboarding/voice")({
  component: VoiceOnboarding,
  head: () => ({
    meta: [
      { title: "Voice setup with Trey-I" },
      { name: "description", content: "Have a natural conversation with Trey-I to build your profile." },
    ],
  }),
});

type ConfirmedFields = {
  bio?: string;
  display_name?: string;
  location?: string;
  username?: string;
};

const INITIAL_MESSAGE = "Hey — I'm Trey-I. What should the world call you?";
const MAIN_FIELDS: Array<keyof ConfirmedFields> = ["display_name", "username", "bio", "location"];

function VoiceOnboarding() {
  const nav = useNavigate();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [assistantMessage, setAssistantMessage] = useState(INITIAL_MESSAGE);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [confirmedFields, setConfirmedFields] = useState<ConfirmedFields>({});
  const [error, setError] = useState<string | null>(null);
  const sessionStarted = useRef(false);

  // Obtain Supabase access token from the browser session
  useEffect(() => {
    let mounted = true;
    try {
      createBrowserClient()
        .auth.getSession()
        .then(({ data }) => {
          if (mounted && data.session?.access_token) {
            setAccessToken(data.session.access_token);
          }
        })
        .catch(() => {});
    } catch {}
    return () => {
      mounted = false;
    };
  }, []);

  // Create the intake session once we have an access token
  useEffect(() => {
    if (!accessToken || sessionStarted.current) return;
    sessionStarted.current = true;
    let mounted = true;
    setThinking(true);
    startIntakeSession({ data: { accessToken, intakeMethod: "ai_voice" } })
      .then((result) => {
        if (mounted) {
          setSessionId(result.sessionId);
          setThinking(false);
        }
      })
      .catch((err: unknown) => {
        if (mounted) {
          const message = err instanceof Error ? err.message : "Could not start setup. Please try again.";
          setError(message);
          setThinking(false);
          sessionStarted.current = false;
        }
      });
    return () => {
      mounted = false;
    };
  }, [accessToken]);

  const confirmedCount = MAIN_FIELDS.filter((f) => confirmedFields[f]).length;
  const isAtReview = !!confirmedFields.display_name && !!confirmedFields.username;

  const submit = async () => {
    const text = draft.trim();
    if (!text || thinking) return;

    if (!accessToken) {
      setError("Please sign in to use voice setup.");
      return;
    }

    if (!sessionId) {
      setError("Setup session is still starting. Please try again in a moment.");
      return;
    }

    setDraft("");
    setThinking(true);
    setError(null);

    try {
      const result = await profileSetupTurn({
        data: { accessToken, sessionId, transcript: text },
      });

      setAssistantMessage(result.assistant.message);
      setConfirmedFields(result.confirmedFields);

      if (result.switchToManual) {
        nav({ to: "/signup" });
        return;
      }

      if (result.complete) {
        if (!result.publicProfileUid) {
          setError("Your profile is saved, but your public link isn't ready yet. Please try finishing again.");
          setThinking(false);
          return;
        }
        window.location.href = `/u/${result.publicProfileUid}?tour=1`;
        return;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setThinking(false);
    }
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
          <div className="text-[10px] tracking-[0.3em] text-primary">VOICE SETUP · {confirmedCount}/4</div>
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
          <p className="text-xl sm:text-2xl font-bold leading-snug">{assistantMessage}</p>
        </div>

        {error && (
          <div className="mt-4 mx-auto max-w-md text-center text-sm text-red-400 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
            {error}
          </div>
        )}

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
              placeholder={listening ? "Listening… (or type)" : "Type your answer…"}
              className="flex-1 bg-transparent text-sm focus:outline-none px-1"
              autoFocus
            />
            <button
              onClick={submit}
              disabled={!draft.trim() || thinking}
              className={`px-3 h-9 rounded-xl text-xs font-semibold ${draft.trim() && !thinking ? "bg-primary text-primary-foreground glow-gold" : "bg-white/5 text-muted-foreground"}`}
            >
              {isAtReview ? "Finish" : "Next"}
            </button>
          </div>
          <div className="mt-3 text-center text-[11px] text-muted-foreground">
            Powered by Trey-I · Your responses build your profile in real-time.
          </div>
        </div>

        {/* Progress chips */}
        <div className="mt-8 flex justify-center gap-1.5">
          {MAIN_FIELDS.map((f) => (
            <span key={f} className={`h-1.5 rounded-full transition-all ${confirmedFields[f] ? "w-8 bg-primary" : "w-3 bg-white/10"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

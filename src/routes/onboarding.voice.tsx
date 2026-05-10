import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Keyboard, Mic, MicOff, Send, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { VoiceOrb, type VoiceState } from "@/components/onboarding/VoiceOrb";
import { startIntakeSession, profileSetupTurn } from "@/lib/trey-i/intake.server";
import { treyIElevenLabsSession } from "@/lib/trey-i/elevenlabs-session.server";
import { treyITts } from "@/lib/trey-i/tts.server";
import { createBrowserClient } from "@/lib/supabase-browser";

export const Route = createFileRoute("/onboarding/voice")({
  component: VoiceOnboarding,
  head: () => ({
    meta: [
      { title: "Build your profile with Trey-I — Trey TV" },
      { name: "description", content: "Premium voice setup with Trey-I, or build your Trey TV profile manually. Cinematic, fast, beautifully guided." },
      { property: "og:title", content: "Build your profile with Trey-I — Trey TV" },
      { property: "og:description", content: "Talk it out with Trey-I or fill the intake form. Either way, your Trey TV identity unlocks at the end." },
    ],
  }),
});

type ConfirmedFields = {
  bio?: string;
  display_name?: string;
  location?: string;
  username?: string;
};

type VoiceStatus = "idle" | "connecting" | "connected" | "listening" | "speaking" | "error" | "unavailable";

const INITIAL_MESSAGE = "Hey — I'm Trey-I. What should the world call you?";
const MAIN_FIELDS: Array<keyof ConfirmedFields> = ["display_name", "username", "bio", "location"];

function playAssistantAudio(text: string) {
  treyITts({ data: { text } })
    .then((result) => {
      if (!result.audioBase64) return;
      const bytes = Uint8Array.from(atob(result.audioBase64), (char) => char.charCodeAt(0));
      const blob = new Blob([bytes], { type: result.mimeType ?? "audio/wav" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => URL.revokeObjectURL(url);
      audio.onerror = () => URL.revokeObjectURL(url);
      audio.play().catch(() => {
        URL.revokeObjectURL(url);
      });
    })
    .catch(() => {});
}

function isElevenLabsActive(voiceStatus: VoiceStatus) {
  return voiceStatus === "connected" || voiceStatus === "listening" || voiceStatus === "speaking";
}

function VoiceOnboarding() {
  return (
    <ConversationProvider>
      <VoiceOnboardingInner />
    </ConversationProvider>
  );
}

function VoiceOnboardingInner() {
  const nav = useNavigate();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [assistantMessage, setAssistantMessage] = useState(INITIAL_MESSAGE);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const [confirmedFields, setConfirmedFields] = useState<ConfirmedFields>({});
  const [error, setError] = useState<string | null>(null);
  const sessionStarted = useRef(false);
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const processingTranscriptRef = useRef(false);
  const voiceStatusRef = useRef<VoiceStatus>("idle");

  const clearWatchdog = () => {
    if (watchdogRef.current !== null) {
      clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
  };

  const submitWithText = async (text: string) => {
    const transcript = text.trim();
    if (!transcript || thinking) return;

    if (!accessToken) {
      setError("Please sign in to use voice setup.");
      return;
    }

    if (!sessionId) {
      setError("Setup session is still starting. Please try again in a moment.");
      return;
    }

    setThinking(true);
    setError(null);

    try {
      const result = await profileSetupTurn({
        data: { accessToken, sessionId, transcript },
      });

      setAssistantMessage(result.assistant.message);
      if (!isElevenLabsActive(voiceStatusRef.current)) {
        playAssistantAudio(result.assistant.message);
      }
      setConfirmedFields(result.confirmedFields);

      if (result.switchToManual) {
        nav({ to: "/login" });
        return;
      }

      if (result.complete) {
        if (!result.publicProfileUid) {
          setError("Your profile is saved, but your public link isn't ready yet. Please try finishing again.");
          setThinking(false);
          return;
        }
        window.location.href = `/u/${result.publicProfileUid}?tour=1`;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setThinking(false);
    }
  };

  const submitFromVoice = async (text: string) => {
    if (processingTranscriptRef.current) return;
    processingTranscriptRef.current = true;
    try {
      await submitWithText(text);
    } finally {
      processingTranscriptRef.current = false;
    }
  };

  const conversation = useConversation({
    onConnect: () => {
      clearWatchdog();
      setVoiceStatus("connected");
      setError(null);
    },
    onDisconnect: (details) => {
      clearWatchdog();
      const reason = typeof details === "object" && details !== null && "reason" in details ? details.reason : undefined;
      if (reason === "error") {
        setVoiceStatus("error");
        setError("Voice disconnected. Type to continue or tap mic to retry.");
      } else {
        setVoiceStatus("idle");
        setError(null);
      }
    },
    onError: () => {
      clearWatchdog();
      setVoiceStatus("error");
      setError("Voice disconnected. Type to continue or tap mic to retry.");
    },
    onModeChange: (mode) => {
      if (mode.mode === "listening") setVoiceStatus("listening");
      else if (mode.mode === "speaking") setVoiceStatus("speaking");
    },
    onMessage: (message) => {
      const payload = message as { message?: unknown; role?: unknown };
      const text = typeof payload.message === "string" ? payload.message.trim() : "";
      if (!text) return;
      if (payload.role !== "user") {
        setAssistantMessage(text);
        return;
      }
      void submitFromVoice(text);
    },
  });

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

  useEffect(() => {
    voiceStatusRef.current = voiceStatus;
  }, [voiceStatus]);

  useEffect(() => {
    return () => {
      clearWatchdog();
      try {
        conversation.endSession();
      } catch {}
    };
  }, []);

  const confirmedCount = MAIN_FIELDS.filter((f) => confirmedFields[f]).length;
  const isAtReview = !!confirmedFields.display_name && !!confirmedFields.username;
  const progress = (confirmedCount / MAIN_FIELDS.length) * 100;

  const voiceActive = isElevenLabsActive(voiceStatus);
  const voiceBusy = voiceStatus === "connecting";
  const voiceState: VoiceState = thinking || voiceBusy ? "processing" : voiceActive ? "listening" : "idle";

  const submit = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    await submitWithText(text);
  };

  const startElevenLabsSession = async () => {
    if (voiceBusy) return;
    if (!accessToken) {
      setError("Please sign in to use voice setup.");
      return;
    }
    if (!sessionId) {
      setError("Setup session is still starting. Please try again in a moment.");
      return;
    }

    setVoiceStatus("connecting");
    setError(null);

    try {
      const result = await treyIElevenLabsSession({ data: { accessToken } }).catch(() => null);
      if (!result || !result.ok) {
        setVoiceStatus("unavailable");
        setError(result?.message ?? "Voice is unavailable. Type to continue.");
        return;
      }

      watchdogRef.current = setTimeout(() => {
        try {
          conversation.endSession();
        } catch {}
        setVoiceStatus("error");
        setError("Voice connection timed out. Type to continue or tap mic to retry.");
      }, 12_000);

      conversation.startSession({
        signedUrl: result.signedUrl,
        connectionType: "websocket",
      });
    } catch {
      clearWatchdog();
      setVoiceStatus("error");
      setError("Voice unavailable. Type to continue.");
    }
  };

  const stopElevenLabsSession = () => {
    clearWatchdog();
    try {
      conversation.endSession();
    } catch {}
    setVoiceStatus("idle");
    setError(null);
  };

  const toggleMic = () => {
    if (voiceBusy) return;
    if (voiceActive) {
      stopElevenLabsSession();
      return;
    }
    void startElevenLabsSession();
  };

  const micLabel = voiceBusy ? "Connecting" : voiceActive ? "Stop voice" : "Start voice";
  const inputPlaceholder = voiceActive || voiceBusy ? "Listening... (or type)" : "Type your answer...";

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Cinematic backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 size-[80vmin] rounded-full bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85_/_0.45),oklch(0.7_0.25_340_/_0.4),oklch(0.65_0.22_300_/_0.45),oklch(0.82_0.15_215_/_0.4),oklch(0.82_0.16_85_/_0.45))] blur-3xl opacity-60 animate-conic-spin" />
        <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="relative max-w-[720px] mx-auto px-4 pt-6 pb-12">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link to="/onboarding" className="size-9 grid place-items-center rounded-full liquid-glass border border-white/10">
            <ArrowLeft className="size-4" />
          </Link>
          <Logo className="h-7" />
          <div className="size-9" />
        </div>

        {/* Premium header */}
        <header className="mt-6 text-center space-y-3 animate-rise">
          <div className="text-[10px] tracking-[0.4em] text-primary">PROFILE CONCIERGE</div>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
            Build Your Trey TV Profile{" "}
            <span className="text-gradient-prescribe">With Trey-I</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Trey-I will guide you through your profile setup one question at a time.
            You review and confirm everything before it goes live.
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="inline-flex items-center gap-2 px-4 h-9 rounded-full text-sm font-semibold bg-primary text-primary-foreground glow-gold">
              <Mic className="size-4" /> Voice Setup
            </span>
            <button
              onClick={() => nav({ to: "/login" })}
              className="inline-flex items-center gap-2 px-4 h-9 rounded-full text-sm font-semibold liquid-glass border border-white/10"
            >
              <Keyboard className="size-4" /> Manual Form
            </button>
          </div>
        </header>

        {/* Gradient progress bar */}
        <div className="mt-7">
          <div className="flex items-center justify-between mb-2 text-[11px] uppercase tracking-widest text-muted-foreground">
            <span>VOICE SETUP · {confirmedCount}/{MAIN_FIELDS.length} fields</span>
            {isAtReview && <span className="text-primary">Ready to finish</span>}
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[oklch(0.82_0.16_85)] via-[oklch(0.7_0.25_340)] to-[oklch(0.82_0.15_215)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Voice module */}
        <section className="mt-6 rounded-3xl liquid-glass neon-border p-5 sm:p-6 relative overflow-hidden">
          <div className="absolute -top-24 -right-20 size-72 rounded-full bg-[oklch(0.7_0.25_340_/_0.25)] blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="text-[10px] tracking-[0.3em] text-primary mb-4">TREY-I VOICE MODULE</div>

            <div className="grid sm:grid-cols-[180px_1fr] gap-5 items-center">
              <div className="grid place-items-center">
                <VoiceOrb state={voiceState} size={160} />
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <div className="text-xs tracking-widest text-muted-foreground">TREY-I SAYS</div>
                <p className="text-xl sm:text-2xl font-bold leading-snug">{assistantMessage}</p>
                {error && (
                  <div className="text-sm text-red-400 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* Input row */}
            <div className="mt-5 rounded-2xl liquid-glass border border-white/10 p-2.5 flex items-center gap-2 focus-within:border-primary/50 transition">
              <button
                onClick={toggleMic}
                disabled={voiceBusy}
                className={`size-10 rounded-full grid place-items-center shrink-0 transition ${voiceActive ? "bg-primary text-primary-foreground glow-gold" : voiceBusy ? "bg-primary/70 text-primary-foreground" : "bg-white/5 text-muted-foreground"}`}
                aria-label={micLabel}
              >
                {voiceActive || voiceBusy ? <Mic className="size-4" /> : <MicOff className="size-4" />}
              </button>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder={inputPlaceholder}
                className="flex-1 bg-transparent text-sm focus:outline-none px-1 h-10"
                autoFocus
              />
              <button
                onClick={submit}
                disabled={!draft.trim() || thinking}
                className={`inline-flex items-center gap-1 h-10 px-4 rounded-xl text-xs font-bold shrink-0 ${draft.trim() && !thinking ? "bg-primary text-primary-foreground glow-gold" : "bg-white/5 text-muted-foreground"}`}
              >
                {isAtReview ? "Finish" : "Send"} <Send className="size-3" />
              </button>
            </div>

            <div className="mt-3 text-center text-[11px] text-muted-foreground">
              Powered by Trey-I · Your responses build your profile in real-time.
            </div>

            {/* Confirmed field chips */}
            {confirmedCount > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {MAIN_FIELDS.map((f) => {
                  const v = confirmedFields[f];
                  if (!v) return null;
                  return (
                    <span key={f} className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full bg-primary/10 border border-primary/30 text-xs">
                      <Sparkles className="size-3 text-primary" />
                      <span className="text-muted-foreground capitalize">{f.replace("_", " ")}:</span>
                      <span className="font-semibold max-w-[140px] truncate">{v}</span>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Progress dots */}
            <div className="mt-4 flex justify-center gap-1.5">
              {MAIN_FIELDS.map((f) => (
                <span key={f} className={`h-1.5 rounded-full transition-all ${confirmedFields[f] ? "w-8 bg-primary" : "w-3 bg-white/10"}`} />
              ))}
            </div>
          </div>
        </section>

        {/* Manual fallback link */}
        <div className="mt-5 text-center text-xs text-muted-foreground">
          Prefer a form?{" "}
          <button onClick={() => nav({ to: "/login" })} className="text-primary font-semibold hover:underline inline-flex items-center gap-1">
            Switch to manual setup <ArrowRight className="size-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

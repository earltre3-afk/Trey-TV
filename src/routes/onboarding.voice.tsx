import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Keyboard, Mic, MicOff, Send, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { VoiceOrb, type VoiceState } from "@/components/onboarding/VoiceOrb";
import { treyIElevenLabsSession } from "@/lib/trey-i/elevenlabs-session.server";
import { treyITts } from "@/lib/trey-i/tts.server";
import { saveOnboardingProfile, finalizeOnboarding } from "@/lib/trey-i/onboarding.server";
import { supabase } from "@/integrations/supabase/client";

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

// ─── Client-side state machine ────────────────────────────────────────────────
// Mirrors intake.server.ts so the conversation works without a Supabase session.
// Auth is only needed at the very end when saving the finished profile.

type Stage =
  | "ask_display_name" | "confirm_display_name"
  | "ask_username"     | "confirm_username"
  | "ask_bio"          | "confirm_bio"
  | "ask_location"     | "confirm_location"
  | "review"           | "complete";

type Fields  = { display_name?: string; username?: string; bio?: string; location?: string };
type Pending = { field?: keyof Fields; value?: string };

const MAIN_FIELDS: Array<keyof Fields> = ["display_name", "username", "bio", "location"];
const INITIAL_MESSAGE = "Hey — I'm Trey-I. What should the world call you?";

const yesRe  = /^(yes|yeah|yep|correct|right|that'?s right|looks good|sounds good|save it|confirm|confirmed|sure|ok|okay|please do)$/i;
const noRe   = /^(no|nope|nah|not quite|wrong|change it|try again)/i;
const skipRe = /^(skip|skip it|pass|no thanks|not now|later|next)$/i;

function normalizeUsername(v: string) {
  return v.toLowerCase()
    .replace(/^@/, "").replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "").slice(0, 30);
}

function buildReview(f: Fields) {
  const parts = [
    `display name: ${f.display_name}`,
    `username: @${f.username}`,
    ...(f.bio      ? [`bio: ${f.bio}`]           : []),
    ...(f.location ? [`location: ${f.location}`] : []),
  ];
  return `Here's your profile: ${parts.join(", ")}. Does this look right?`;
}

type Turn = { message: string; stage: Stage; fields: Fields; pending: Pending };

function clientTurn(stage: Stage, fields: Fields, pending: Pending, input: string): Turn {
  const t = input.trim();
  const stay = (msg: string): Turn => ({ message: msg, stage, fields, pending });

  if (stage === "ask_display_name") {
    if (yesRe.test(t) || noRe.test(t) || skipRe.test(t))
      return stay("Say the name you want people to see on Trey TV.");
    const name = t.replace(/^my name is\s+/i, "").replace(/^call me\s+/i, "").trim().slice(0, 50);
    if (name.length < 2) return stay("Say your profile name one more time for me.");
    return { message: `I heard "${name}". Is that spelled right?`, stage: "confirm_display_name", fields, pending: { field: "display_name", value: name } };
  }

  if (stage === "confirm_display_name") {
    if (yesRe.test(t) && pending.value)
      return { message: "Saved. What username do you want on Trey TV?", stage: "ask_username", fields: { ...fields, display_name: pending.value }, pending: {} };
    const rep = (noRe.test(t) ? t.replace(noRe, "") : t).trim();
    if (rep.length >= 2)
      return { message: `Got it. I heard "${rep.slice(0, 50)}". Is that spelled right?`, stage: "confirm_display_name", fields, pending: { field: "display_name", value: rep.slice(0, 50) } };
    return { message: "Say your profile name one more time.", stage: "ask_display_name", fields, pending: {} };
  }

  if (stage === "ask_username") {
    if (yesRe.test(t) || noRe.test(t) || skipRe.test(t))
      return stay("Say the username you want — letters, numbers, or underscores.");
    const u = normalizeUsername(t);
    if (!/^[a-z0-9_]{3,30}$/.test(u)) return stay("Use 3–30 lowercase letters, numbers, or underscores.");
    return { message: `${u} looks good. Should I save that as your username?`, stage: "confirm_username", fields, pending: { field: "username", value: u } };
  }

  if (stage === "confirm_username") {
    if (yesRe.test(t) && pending.value)
      return { message: "Username saved. Want to add a short bio? Say one now, or say skip.", stage: "ask_bio", fields: { ...fields, username: pending.value }, pending: {} };
    const u = normalizeUsername((noRe.test(t) ? t.replace(noRe, "") : t));
    if (u.length >= 3)
      return { message: `${u} looks good. Should I save that?`, stage: "confirm_username", fields, pending: { field: "username", value: u } };
    return { message: "Say the username one more time.", stage: "ask_username", fields, pending: {} };
  }

  if (stage === "ask_bio") {
    if (skipRe.test(t))
      return { message: "No bio for now. Want to add your location? Say it now, or say skip.", stage: "ask_location", fields, pending: {} };
    if (yesRe.test(t) || noRe.test(t)) return stay("Say the short bio you want, or say skip.");
    const bio = t.slice(0, 160);
    return { message: `I heard: "${bio}". Should I save it?`, stage: "confirm_bio", fields, pending: { field: "bio", value: bio } };
  }

  if (stage === "confirm_bio") {
    if (yesRe.test(t) && pending.value)
      return { message: "Bio saved. Want to add your location? Say it now, or say skip.", stage: "ask_location", fields: { ...fields, bio: pending.value }, pending: {} };
    if (skipRe.test(t))
      return { message: "No bio for now. Want to add your location? Say it now, or say skip.", stage: "ask_location", fields, pending: {} };
    const bio = (noRe.test(t) ? t.replace(noRe, "") : t).trim().slice(0, 160);
    if (bio)
      return { message: `Got it. "${bio}". Should I save it?`, stage: "confirm_bio", fields, pending: { field: "bio", value: bio } };
    return { message: "Say the bio one more time, or say skip.", stage: "ask_bio", fields, pending: {} };
  }

  if (stage === "ask_location") {
    if (skipRe.test(t))
      return { message: buildReview(fields), stage: "review", fields, pending: {} };
    if (yesRe.test(t) || noRe.test(t)) return stay("Say your location, or say skip.");
    const loc = t.slice(0, 50);
    return { message: `I heard "${loc}". Should I save that?`, stage: "confirm_location", fields, pending: { field: "location", value: loc } };
  }

  if (stage === "confirm_location") {
    if (yesRe.test(t) && pending.value) {
      const f = { ...fields, location: pending.value };
      return { message: buildReview(f), stage: "review", fields: f, pending: {} };
    }
    if (skipRe.test(t))
      return { message: buildReview(fields), stage: "review", fields, pending: {} };
    const loc = (noRe.test(t) ? t.replace(noRe, "") : t).trim().slice(0, 50);
    if (loc)
      return { message: `Got it. "${loc}". Should I save that?`, stage: "confirm_location", fields, pending: { field: "location", value: loc } };
    return { message: "Say your location one more time, or say skip.", stage: "ask_location", fields, pending: {} };
  }

  if (stage === "review") {
    if (yesRe.test(t))
      return { message: "Your profile is ready. Creating your account now…", stage: "complete", fields, pending: {} };
    return { message: "No problem. Let's run it back. What name should show on your profile?", stage: "ask_display_name", fields: {}, pending: {} };
  }

  return { message: "Your profile is ready.", stage: "complete", fields, pending: {} };
}

// ─── Voice helpers ────────────────────────────────────────────────────────────

type VoiceStatus = "idle" | "connecting" | "connected" | "listening" | "speaking" | "error" | "unavailable";

function isVoiceActive(s: VoiceStatus) {
  return s === "connected" || s === "listening" || s === "speaking";
}

function playAssistantAudio(text: string) {
  treyITts({ data: { text } })
    .then((result) => {
      if (!result.audioBase64) return;
      const bytes = Uint8Array.from(atob(result.audioBase64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: result.mimeType ?? "audio/wav" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => URL.revokeObjectURL(url);
      audio.onerror  = () => URL.revokeObjectURL(url);
      audio.play().catch(() => URL.revokeObjectURL(url));
    })
    .catch(() => {});
}

// ─── Components ───────────────────────────────────────────────────────────────

function VoiceOnboarding() {
  return (
    <ConversationProvider>
      <VoiceOnboardingInner />
    </ConversationProvider>
  );
}

function VoiceOnboardingInner() {
  const nav = useNavigate();

  // Optional: Supabase session token — used for voice and final save.
  // Guests (no session) can still run the full conversation; auth kicks in at completion.
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const [stage,   setStage]   = useState<Stage>("ask_display_name");
  const [fields,  setFields]  = useState<Fields>({});
  const [pending, setPending] = useState<Pending>({});
  const [assistantMessage, setAssistantMessage] = useState(INITIAL_MESSAGE);
  const [draft,   setDraft]   = useState("");
  const [thinking, setThinking] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const [error,   setError]   = useState<string | null>(null);

  const voiceStatusRef = useRef<VoiceStatus>("idle");
  const watchdogRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const processingRef  = useRef(false);

  const confirmedCount = MAIN_FIELDS.filter((f) => fields[f]).length;
  const isAtReview     = !!fields.display_name && !!fields.username;
  const progress       = (confirmedCount / MAIN_FIELDS.length) * 100;

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data }) => { if (data.session?.access_token) setAccessToken(data.session.access_token); })
      .catch(() => {});
  }, []);

  useEffect(() => { voiceStatusRef.current = voiceStatus; }, [voiceStatus]);

  const clearWatchdog = useCallback(() => {
    if (watchdogRef.current !== null) { clearTimeout(watchdogRef.current); watchdogRef.current = null; }
  }, []);

  // ── Core: advance the state machine ───────────────────────────────────────
  const advance = useCallback(async (input: string) => {
    const text = input.trim();
    if (!text || thinking || stage === "complete") return;
    if (processingRef.current) return;
    processingRef.current = true;
    setThinking(true);
    setError(null);

    try {
      const result = clientTurn(stage, fields, pending, text);
      setStage(result.stage);
      setFields(result.fields);
      setPending(result.pending);
      setAssistantMessage(result.message);

      if (!isVoiceActive(voiceStatusRef.current)) {
        playAssistantAudio(result.message);
      }

      if (result.stage !== "complete") return;

      // Persist fields regardless of auth state
      try { sessionStorage.setItem("treytv_voice_profile", JSON.stringify(result.fields)); } catch {}

      const token = accessToken ?? (await supabase.auth.getSession().then(({ data }) => data.session?.access_token ?? null).catch(() => null));

      if (token) {
        // Authenticated: save profile and finalize in one pass
        try {
          await saveOnboardingProfile({ data: { accessToken: token, fields: result.fields } });
          const { publicProfileUid } = await finalizeOnboarding({ data: { accessToken: token } });
          window.location.href = `/u/${publicProfileUid}?tour=1`;
          return;
        } catch (err) {
          // Save failed — roll back to review so the user can try again
          const msg = err instanceof Error ? err.message : "Could not save your profile. Please try again.";
          setError(msg);
          setStage("review");
          setAssistantMessage(buildReview(result.fields));
          return;
        }
      }

      // Guest: no session — trigger Google OAuth; callback will apply the stored profile
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (oauthErr) {
        setError("Could not start Google sign-in. Please try again.");
        setStage("review");
        setAssistantMessage(buildReview(result.fields));
      }
      // If OAuth succeeds, browser navigates away — no further state updates needed
    } finally {
      setThinking(false);
      processingRef.current = false;
    }
  }, [stage, fields, pending, thinking, accessToken]);

  const submit = useCallback(async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    await advance(text);
  }, [draft, advance]);

  // ── ElevenLabs (optional — requires an access token) ──────────────────────
  const conversation = useConversation({
    onConnect: () => { clearWatchdog(); setVoiceStatus("connected"); setError(null); },
    onDisconnect: (details) => {
      clearWatchdog();
      const reason = typeof details === "object" && details !== null && "reason" in details
        ? (details as { reason?: string }).reason : undefined;
      setVoiceStatus(reason === "error" ? "error" : "idle");
      if (reason === "error") setError("Voice disconnected. Type to continue or tap mic to retry.");
    },
    onError: () => { clearWatchdog(); setVoiceStatus("error"); setError("Voice disconnected. Type to continue."); },
    onModeChange: (mode) => {
      if (mode.mode === "listening") setVoiceStatus("listening");
      else if (mode.mode === "speaking") setVoiceStatus("speaking");
    },
    onMessage: (message) => {
      const payload = message as { message?: unknown; role?: unknown };
      const text = typeof payload.message === "string" ? payload.message.trim() : "";
      if (!text) return;
      if (payload.role !== "user") { setAssistantMessage(text); return; }
      void advance(text);
    },
  });

  useEffect(() => () => { clearWatchdog(); try { conversation.endSession(); } catch {} }, []);

  const startVoice = useCallback(async () => {
    if (!accessToken) {
      setError("Voice requires a signed-in account. Type your answers below — voice unlocks after you sign in.");
      return;
    }
    setVoiceStatus("connecting");
    setError(null);
    try {
      const result = await treyIElevenLabsSession({ data: { accessToken } }).catch(() => null);
      if (!result?.ok) {
        setVoiceStatus("unavailable");
        setError(result?.message ?? "Voice unavailable. Type to continue.");
        return;
      }
      watchdogRef.current = setTimeout(() => {
        try { conversation.endSession(); } catch {}
        setVoiceStatus("error");
        setError("Voice timed out. Type to continue or tap mic to retry.");
      }, 12_000);
      conversation.startSession({ signedUrl: result.signedUrl, connectionType: "websocket" });
    } catch {
      clearWatchdog();
      setVoiceStatus("error");
      setError("Voice unavailable. Type to continue.");
    }
  }, [accessToken, conversation, clearWatchdog]);

  const stopVoice = useCallback(() => {
    clearWatchdog();
    try { conversation.endSession(); } catch {}
    setVoiceStatus("idle");
    setError(null);
  }, [conversation, clearWatchdog]);

  const toggleMic = useCallback(() => {
    if (voiceStatus === "connecting") return;
    if (isVoiceActive(voiceStatus)) { stopVoice(); return; }
    void startVoice();
  }, [voiceStatus, startVoice, stopVoice]);

  const voiceActive = isVoiceActive(voiceStatus);
  const voiceBusy   = voiceStatus === "connecting";
  const voiceState: VoiceState =
    thinking || voiceBusy ? "processing"
    : voiceActive          ? "listening"
    : stage === "complete" ? "completed"
    : "idle";

  const micLabel         = voiceBusy ? "Connecting" : voiceActive ? "Stop voice" : "Start voice";
  const inputPlaceholder = voiceActive || voiceBusy ? "Listening… (or type)" : "Type your answer…";

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 size-[80vmin] rounded-full bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85_/_0.45),oklch(0.7_0.25_340_/_0.4),oklch(0.65_0.22_300_/_0.45),oklch(0.82_0.15_215_/_0.4),oklch(0.82_0.16_85_/_0.45))] blur-3xl opacity-60 animate-conic-spin" />
        <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="relative max-w-[720px] mx-auto px-4 pt-6 pb-12">
        <div className="flex items-center justify-between">
          <Link to="/onboarding" className="size-9 grid place-items-center rounded-full liquid-glass border border-white/10">
            <ArrowLeft className="size-4" />
          </Link>
          <Logo className="h-7" />
          <div className="size-9" />
        </div>

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

        <div className="mt-7">
          <div className="flex items-center justify-between mb-2 text-[11px] uppercase tracking-widest text-muted-foreground">
            <span>VOICE SETUP · {confirmedCount}/{MAIN_FIELDS.length} fields</span>
            {isAtReview && stage !== "complete" && <span className="text-primary">Ready to finish</span>}
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[oklch(0.82_0.16_85)] via-[oklch(0.7_0.25_340)] to-[oklch(0.82_0.15_215)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

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

            <div className="mt-5 rounded-2xl liquid-glass border border-white/10 p-2.5 flex items-center gap-2 focus-within:border-primary/50 transition">
              <button
                onClick={toggleMic}
                disabled={voiceBusy}
                aria-label={micLabel}
                className={`size-10 rounded-full grid place-items-center shrink-0 transition ${
                  voiceActive  ? "bg-primary text-primary-foreground glow-gold"
                  : voiceBusy  ? "bg-primary/70 text-primary-foreground"
                  : "bg-white/5 text-muted-foreground"
                }`}
              >
                {voiceActive || voiceBusy ? <Mic className="size-4" /> : <MicOff className="size-4" />}
              </button>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !thinking && void submit()}
                placeholder={inputPlaceholder}
                disabled={thinking || stage === "complete"}
                className="flex-1 bg-transparent text-sm focus:outline-none px-1 h-10 disabled:opacity-50"
                autoFocus
              />
              <button
                onClick={() => void submit()}
                disabled={!draft.trim() || thinking || stage === "complete"}
                className={`inline-flex items-center gap-1 h-10 px-4 rounded-xl text-xs font-bold shrink-0 ${
                  draft.trim() && !thinking && stage !== "complete"
                    ? "bg-primary text-primary-foreground glow-gold"
                    : "bg-white/5 text-muted-foreground"
                }`}
              >
                {isAtReview && stage !== "complete" ? "Finish" : "Send"} <Send className="size-3" />
              </button>
            </div>

            <div className="mt-3 text-center text-[11px] text-muted-foreground">
              Powered by Trey-I · Your responses build your profile in real-time.
            </div>

            {confirmedCount > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {MAIN_FIELDS.map((f) => {
                  const v = fields[f];
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

            <div className="mt-4 flex justify-center gap-1.5">
              {MAIN_FIELDS.map((f) => (
                <span key={f} className={`h-1.5 rounded-full transition-all ${fields[f] ? "w-8 bg-primary" : "w-3 bg-white/10"}`} />
              ))}
            </div>
          </div>
        </section>

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

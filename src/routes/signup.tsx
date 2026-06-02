import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Sparkles, Check, X, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CinematicBackdrop, GoogleIcon } from "./login";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({
    meta: [
      { title: "Sign Up — Trey TV" },
      {
        name: "description",
        content: "Create your free Trey TV account and start building your universe.",
      },
    ],
  }),
});

// ─── Password strength ─────────────────────────────────────────────────────────

type StrengthRule = { label: string; test: (pw: string) => boolean };

const RULES: StrengthRule[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "Uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "Number", test: (p) => /[0-9]/.test(p) },
];

function passwordStrength(pw: string): number {
  return RULES.filter((r) => r.test(pw)).length;
}

const STRENGTH_COLORS = ["bg-red-500", "bg-yellow-400", "bg-primary"];
const STRENGTH_LABELS = ["Too weak", "Getting there", "Strong"];

// ─── Friendly signup errors ────────────────────────────────────────────────────

function friendlySignupError(message: string): string {
  const m = message.toLowerCase();
  if (
    m.includes("already registered") ||
    m.includes("user already exists") ||
    m.includes("email_exists")
  )
    return "An account with that email already exists. Log in instead.";
  if (m.includes("weak password") || m.includes("password should be"))
    return "Choose a stronger password — at least 8 characters with a number.";
  if (m.includes("invalid email") || m.includes("unable to validate email"))
    return "That doesn't look like a valid email address.";
  if (m.includes("network") || m.includes("fetch"))
    return "Network error. Check your connection and try again.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Too many attempts. Wait a moment and try again.";
  return "Couldn't create your account. Please try again.";
}

// ─── Component ─────────────────────────────────────────────────────────────────

function SignupPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState(false);

  const strength = passwordStrength(pw);
  const pwMatch = pw && confirm ? pw === confirm : null;
  const canSubmit = email.trim() && strength >= 2 && pw === confirm && confirm.length > 0;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;

    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: pw,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error(friendlySignupError(error.message));
        return;
      }

      // If Supabase returned a session (e.g. auto-confirm is on in dev), go directly to onboarding
      if (data.session) {
        nav({ to: "/onboarding" });
        return;
      }

      // Normal flow: email confirmation required
      nav({ to: "/confirm-email", search: { email: email.trim() } });
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setBusy(false);
      toast.error("Google sign-in failed. Please try another method.");
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <CinematicBackdrop />

      <div className="relative max-w-[460px] mx-auto px-4 pt-6 pb-14">
        <Link
          to="/"
          className="size-9 grid place-items-center rounded-full liquid-glass border border-white/10"
        >
          <ArrowLeft className="size-4" />
        </Link>

        <div className="mt-6 text-center space-y-2 animate-rise">
          <Logo className="h-14 mx-auto" />
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-xs text-muted-foreground">
            Join Trey TV and start building your universe.
          </p>
        </div>

        {/* Google */}
        <div
          className="mt-6 space-y-3"
          style={{
            animationName: "rise",
            animationDuration: "300ms",
            animationTimingFunction: "ease-out",
            animationFillMode: "both",
            animationDelay: "60ms",
          }}
        >
          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            className="w-full h-11 rounded-xl text-sm font-semibold bg-white text-black hover:bg-white/90 transition flex items-center justify-center gap-2.5 tilt-press disabled:opacity-60"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="relative my-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 bg-background/40 text-[10px] tracking-[0.25em] text-muted-foreground">
                OR
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSignup}
          className="rounded-3xl liquid-glass border border-white/10 p-5 space-y-4 animate-rise"
          style={{ animationDelay: "100ms" }}
        >
          {/* Email */}
          <div>
            <div className="text-[10px] tracking-[0.2em] text-muted-foreground mb-1.5">EMAIL</div>
            <div className="flex items-center gap-2 rounded-xl glass border border-white/10 px-3 h-11 focus-within:border-primary/50 transition">
              <Mail className="size-4 shrink-0 text-muted-foreground" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                placeholder="you@trey.tv"
                className="flex-1 bg-transparent text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="text-[10px] tracking-[0.2em] text-muted-foreground mb-1.5">
              PASSWORD
            </div>
            <div className="flex items-center gap-2 rounded-xl glass border border-white/10 px-3 h-11 focus-within:border-primary/50 transition">
              <Lock className="size-4 shrink-0 text-muted-foreground" />
              <input
                value={pw}
                onChange={(e) => {
                  setPw(e.target.value);
                  setTouched(true);
                }}
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Create a strong password"
                className="flex-1 bg-transparent text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="text-muted-foreground hover:text-foreground shrink-0"
              >
                {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>

            {/* Strength bar */}
            {pw && (
              <div className="mt-2 space-y-1.5">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all ${i < strength ? STRENGTH_COLORS[strength - 1] : "bg-white/10"}`}
                    />
                  ))}
                </div>
                <p
                  className={`text-[10px] ${strength >= 2 ? "text-primary" : "text-muted-foreground"}`}
                >
                  {STRENGTH_LABELS[Math.max(0, strength - 1)] ?? "Too weak"}
                </p>
                <div className="space-y-0.5">
                  {RULES.map((rule) => {
                    const pass = rule.test(pw);
                    return (
                      <div
                        key={rule.label}
                        className={`flex items-center gap-1.5 text-[10px] ${pass ? "text-green-400" : "text-muted-foreground"}`}
                      >
                        {pass ? <Check className="size-3" /> : <X className="size-3 opacity-50" />}
                        {rule.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <div className="text-[10px] tracking-[0.2em] text-muted-foreground mb-1.5">
              CONFIRM PASSWORD
            </div>
            <div
              className={`flex items-center gap-2 rounded-xl glass border px-3 h-11 focus-within:border-primary/50 transition ${
                touched && confirm && pwMatch === false ? "border-red-500/50" : "border-white/10"
              }`}
            >
              <ShieldCheck
                className={`size-4 shrink-0 ${pwMatch === true ? "text-green-400" : "text-muted-foreground"}`}
              />
              <input
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  setTouched(true);
                }}
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Re-enter password"
                className="flex-1 bg-transparent text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="text-muted-foreground hover:text-foreground shrink-0"
              >
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {touched && confirm && pwMatch === false && (
              <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                <X className="size-3" /> Passwords don't match
              </p>
            )}
            {pwMatch === true && (
              <p className="text-[10px] text-green-400 mt-1 flex items-center gap-1">
                <Check className="size-3" /> Passwords match
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={busy || !canSubmit}
            className="w-full h-11 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold tilt-press flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Sparkles className="size-4" />
            {busy ? "Creating account…" : "Sign Up with Email"}
          </button>

          <p className="text-center text-xs text-muted-foreground pt-1">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </form>

        <p className="mt-4 text-center text-[10px] text-muted-foreground px-4">
          By signing up you agree to Trey TV's{" "}
          <a href="/legal/terms" className="underline hover:text-foreground">
            Terms
          </a>{" "}
          and{" "}
          <a href="/legal/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}

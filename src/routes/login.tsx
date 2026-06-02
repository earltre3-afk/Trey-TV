import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Log In — Trey TV" },
      { name: "description", content: "Log in to your Trey TV account." },
    ],
  }),
});

// ─── Friendly error messages ───────────────────────────────────────────────────

function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (
    m.includes("invalid login credentials") ||
    m.includes("invalid credentials") ||
    m.includes("wrong password")
  )
    return "That password is incorrect. Try again or use a magic link.";
  if (m.includes("email not confirmed") || m.includes("not confirmed"))
    return "Check your email to confirm your account before logging in.";
  if (
    m.includes("user not found") ||
    m.includes("no user found") ||
    m.includes("unable to validate")
  )
    return "We couldn't find an account with that email. Check the address or sign up.";
  if (m.includes("too many requests") || m.includes("rate limit"))
    return "Too many attempts. Wait a moment and try again.";
  if (m.includes("network") || m.includes("fetch"))
    return "Network error. Check your connection and try again.";
  return "Something went wrong. Please try again.";
}

// ─── Post-auth routing ─────────────────────────────────────────────────────────

export async function postAuthRedirect(nav: ReturnType<typeof useNavigate>, userId?: string) {
  if (userId) {
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("onboarding_completed, public_profile_uid")
      .eq("id", userId)
      .maybeSingle();

    if (!profile || !profile.onboarding_completed) {
      nav({ to: "/onboarding" });
      return;
    }

    let next: string | null = null;
    try {
      next = sessionStorage.getItem("treytv_post_auth_redirect");
      sessionStorage.removeItem("treytv_post_auth_redirect");
    } catch {}

    nav({
      to: (next as any) ?? (profile.public_profile_uid ? `/u/${profile.public_profile_uid}` : "/"),
    });
    return;
  }

  let next: string | null = null;
  try {
    next = sessionStorage.getItem("treytv_post_auth_redirect");
    sessionStorage.removeItem("treytv_post_auth_redirect");
  } catch {}

  nav({ to: (next as any) ?? "/" });
}

// ─── Component ─────────────────────────────────────────────────────────────────

function LoginPage() {
  const nav = useNavigate();
  const search: any = useSearch({ strict: false });
  const [email, setEmail] = useState(search?.email ?? "");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimEmail = email.trim();
    if (!trimEmail || !pw) {
      toast.error("Enter your email and password.");
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimEmail,
        password: pw,
      });
      if (error) {
        toast.error(friendlyAuthError(error.message));
        return;
      }
      await postAuthRedirect(nav, data.user?.id);
    } finally {
      setBusy(false);
    }
  };

  const handleMagicLink = async () => {
    const trimEmail = email.trim();
    if (!trimEmail) {
      toast.error("Enter your email address first.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: trimEmail,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        toast.error(friendlyAuthError(error.message));
        return;
      }
      setMagicSent(true);
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

  if (magicSent) {
    return <MagicLinkSentScreen email={email} onBack={() => setMagicSent(false)} />;
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <CinematicBackdrop />

      <div className="relative max-w-[460px] mx-auto px-4 pt-6 pb-12">
        <Link
          to="/"
          className="size-9 grid place-items-center rounded-full liquid-glass border border-white/10"
        >
          <ArrowLeft className="size-4" />
        </Link>

        <div className="mt-6 text-center space-y-2 animate-rise">
          <Logo className="h-14 mx-auto" />
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-xs text-muted-foreground">Log in to keep building your universe.</p>
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

        {/* Email form */}
        <form
          onSubmit={handlePasswordLogin}
          className="rounded-3xl liquid-glass border border-white/10 p-5 space-y-4 animate-rise"
          style={{ animationDelay: "100ms" }}
        >
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

          <div>
            <div className="text-[10px] tracking-[0.2em] text-muted-foreground mb-1.5">
              PASSWORD
            </div>
            <div className="flex items-center gap-2 rounded-xl glass border border-white/10 px-3 h-11 focus-within:border-primary/50 transition">
              <Lock className="size-4 shrink-0 text-muted-foreground" />
              <input
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
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
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <button
              type="submit"
              disabled={busy}
              className="w-full h-11 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold tilt-press flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              <Sparkles className="size-4" />
              {busy ? "Signing in…" : "Log In"}
            </button>

            <button
              type="button"
              onClick={handleMagicLink}
              disabled={busy}
              className="w-full h-11 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center justify-center gap-1.5 tilt-press disabled:opacity-60"
            >
              <Mail className="size-4" />
              Send Magic Link
            </button>
          </div>

          <p className="text-center text-xs text-muted-foreground pt-1">
            New here?{" "}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

// ─── Magic link sent screen ────────────────────────────────────────────────────

function MagicLinkSentScreen({ email, onBack }: { email: string; onBack: () => void }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      <CinematicBackdrop />
      <div className="relative max-w-[420px] w-full mx-auto px-4 py-10 text-center space-y-6 animate-rise">
        <Logo className="h-12 mx-auto" />

        <div className="rounded-3xl liquid-glass neon-border p-8 space-y-5">
          {/* Animated envelope graphic */}
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
            <div className="relative size-20 rounded-full border border-primary/30 bg-primary/5 flex items-center justify-center">
              <Mail className="size-9 text-primary" />
            </div>
            <div className="absolute -top-1 -right-1 size-5 rounded-full bg-primary flex items-center justify-center">
              <Sparkles className="size-3 text-primary-foreground" />
            </div>
          </div>

          <div>
            <p className="text-[10px] tracking-[0.35em] text-primary uppercase">Magic Link Sent</p>
            <h2 className="mt-1 text-xl font-bold">Check your inbox</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We sent a magic link to <span className="text-foreground font-medium">{email}</span>.
              Click the link in that email to log in instantly.
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-3 text-xs text-muted-foreground space-y-1">
            <p>• Check your spam folder if you don't see it</p>
            <p>• The link expires in 10 minutes</p>
            <p>• Click it from the same device for best results</p>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="w-full h-10 rounded-xl border border-white/15 text-sm text-muted-foreground hover:text-foreground hover:border-white/30 transition inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="size-4" /> Back to login
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Shared sub-components ─────────────────────────────────────────────────────

function CinematicBackdrop() {
  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none">
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 size-[70vmin] rounded-full bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85_/_0.4),oklch(0.7_0.25_340_/_0.35),oklch(0.65_0.22_300_/_0.4),oklch(0.82_0.15_215_/_0.35))] blur-3xl opacity-60 animate-conic-spin" />
      <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

// ─── Exported helper (used by signup.tsx) ─────────────────────────────────────
export { CinematicBackdrop, GoogleIcon };

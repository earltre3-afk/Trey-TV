import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({
    meta: [
      { title: "Log in — Trey TV" },
      { name: "description", content: "Log into your Trey TV account." },
    ],
  }),
});

function Login() {
  const nav = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  const [busy, setBusy] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const postAuthRedirect = async (userId?: string) => {
    if (userId) {
      const { data: profile } = await db
        .from("profiles")
        .select("onboarding_completed, public_profile_uid")
        .eq("id", userId)
        .maybeSingle();

      if (!profile || !profile.onboarding_completed) {
        nav({ to: "/onboarding" });
        return;
      }

      let next: string | null = null;
      try { next = sessionStorage.getItem("treytv_post_auth_redirect"); sessionStorage.removeItem("treytv_post_auth_redirect"); } catch {}
      nav({ to: (next as any) || (profile.public_profile_uid ? `/u/${profile.public_profile_uid}` : "/") });
      return;
    }

    // No userId — fall back to stored redirect or home
    let next: string | null = null;
    try { next = sessionStorage.getItem("treytv_post_auth_redirect"); sessionStorage.removeItem("treytv_post_auth_redirect"); } catch {}
    nav({ to: (next as any) || "/" });
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pw) return toast.error("Enter email and password");
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Signed in");
    await postAuthRedirect(data.user?.id);
  };

  const handleGoogle = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setBusy(false); toast.error("Google sign-in failed"); }
    // browser navigates away to Google — /auth/callback handles the rest
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 size-[70vmin] rounded-full bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85_/_0.4),oklch(0.7_0.25_340_/_0.35),oklch(0.65_0.22_300_/_0.4),oklch(0.82_0.15_215_/_0.35))] blur-3xl opacity-60 animate-conic-spin" />
      </div>

      <div className="relative max-w-[460px] mx-auto px-4 pt-6 pb-12">
        <Link to="/" className="size-9 grid place-items-center rounded-full liquid-glass border border-white/10"><ArrowLeft className="size-4" /></Link>

        <div className="mt-6 text-center">
          <Logo className="h-16 mx-auto" />
          <h1 className="mt-2 text-2xl font-bold">Welcome back</h1>
          <div className="text-xs text-muted-foreground">Log in to keep building your universe.</div>
        </div>

        <form onSubmit={handleEmailLogin} className="mt-6 rounded-3xl liquid-glass border border-white/10 p-5 space-y-4">
          <label className="block">
            <div className="text-[10px] tracking-[0.2em] text-muted-foreground mb-1">EMAIL</div>
            <div className="flex items-center gap-2 rounded-xl glass border border-white/10 px-3 h-10 focus-within:border-primary/50 transition">
              <Mail className="size-4 text-muted-foreground" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@trey.tv" className="flex-1 bg-transparent text-sm focus:outline-none" />
            </div>
          </label>
          <label className="block">
            <div className="text-[10px] tracking-[0.2em] text-muted-foreground mb-1">PASSWORD</div>
            <div className="flex items-center gap-2 rounded-xl glass border border-white/10 px-3 h-10 focus-within:border-primary/50 transition">
              <Lock className="size-4 text-muted-foreground" />
              <input value={pw} onChange={(e) => setPw(e.target.value)} type={showPw ? "text" : "password"} placeholder="••••••••" className="flex-1 bg-transparent text-sm focus:outline-none" />
              <button type="button" onClick={() => setShowPw((v) => !v)} className="text-muted-foreground hover:text-foreground">{showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
            </div>
          </label>
          <button type="submit" disabled={busy} className="w-full h-11 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold tilt-press flex items-center justify-center gap-1.5 disabled:opacity-60">
            <Sparkles className="size-4" /> {busy ? "Signing in…" : "Log in"}
          </button>
          <div className="relative my-1">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center"><span className="px-2 bg-background/40 text-[10px] tracking-[0.25em] text-muted-foreground">OR</span></div>
          </div>
          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            className="w-full h-11 rounded-xl text-sm font-semibold bg-white text-black hover:bg-white/90 transition flex items-center justify-center gap-2.5 tilt-press disabled:opacity-60"
          >
            <svg className="size-4" viewBox="0 0 48 48" aria-hidden>
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>
          <div className="text-center text-xs text-muted-foreground">
            New here? <Link to="/onboarding" className="text-primary font-semibold hover:underline">Start onboarding</Link>
          </div>
        </form>

      </div>
    </div>
  );
}

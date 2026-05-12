import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { supabase } from "@/integrations/supabase/client";
import { saveOnboardingProfile, finalizeOnboarding } from "@/lib/trey-i/onboarding.server";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

// ─── Post-auth routing ─────────────────────────────────────────────────────────
// Shared helper: checks profile completeness and redirects appropriately.
async function resolvePostAuthDestination(
  nav: ReturnType<typeof useNavigate>,
  userId: string,
  accessToken: string,
) {
  // If the user completed voice onboarding before auth, apply it now
  let voiceProfile: Record<string, unknown> | null = null;
  try {
    const raw = sessionStorage.getItem("treytv_voice_profile");
    if (raw) {
      voiceProfile = JSON.parse(raw) as Record<string, unknown>;
      sessionStorage.removeItem("treytv_voice_profile");
    }
  } catch {}

  if (voiceProfile?.display_name && voiceProfile?.username) {
    try {
      await saveOnboardingProfile({ data: { accessToken, fields: voiceProfile } });
      const { publicProfileUid } = await finalizeOnboarding({ data: { accessToken } });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      nav({ to: `/u/${publicProfileUid}` as any });
      return;
    } catch {
      // Fall through to normal routing
    }
  }

  // Check onboarding completion
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nav({ to: (next as any) ?? (profile.public_profile_uid ? `/u/${profile.public_profile_uid}` : "/") });
}

// ─── Component ─────────────────────────────────────────────────────────────────

function AuthCallback() {
  const nav = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);

      if (params.get("error")) {
        const desc = params.get("error_description") ?? "";
        if (desc.toLowerCase().includes("expired") || desc.toLowerCase().includes("invalid")) {
          setError("This link has expired or is invalid. Please request a new one.");
        } else {
          setError("Authentication failed. Please try logging in again.");
        }
        setTimeout(() => nav({ to: "/login" }), 3000);
        return;
      }

      const code = params.get("code");
      const tokenHash = params.get("token_hash");
      const otpType = params.get("type");
      let userId: string | undefined;
      let accessToken: string | undefined;

      if (tokenHash && otpType) {
        // Magic link / email OTP path
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error: verifyError } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: otpType as any });
        if (!verifyError && data.session) {
          userId = data.session.user.id;
          accessToken = data.session.access_token;
        } else {
          setError("This magic link has expired. Request a new one to log in.");
          setTimeout(() => nav({ to: "/login" }), 3000);
          return;
        }
      } else if (code) {
        const { data, error: codeError } = await supabase.auth.exchangeCodeForSession(code);
        if (!codeError && data.session) {
          userId = data.session.user.id;
          accessToken = data.session.access_token;
        } else {
          // Already exchanged by Supabase detectSessionInUrl — session is in storage
          const { data: { user } } = await supabase.auth.getUser();
          const { data: { session } } = await supabase.auth.getSession();
          if (user) userId = user.id;
          if (session) accessToken = session.access_token;
        }
      } else {
        // No code/token — check if a session already exists (e.g. hash-based OAuth)
        const { data: { user } } = await supabase.auth.getUser();
        const { data: { session } } = await supabase.auth.getSession();
        if (user) userId = user.id;
        if (session) accessToken = session.access_token;
      }

      if (!userId || !accessToken) {
        setError("We couldn't sign you in. Please try again.");
        setTimeout(() => nav({ to: "/login" }), 3000);
        return;
      }

      await resolvePostAuthDestination(nav, userId, accessToken);
    };

    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
        <BackdropGlow />
        <div className="relative max-w-sm w-full mx-auto px-6 text-center space-y-5">
          <Logo className="h-10 mx-auto" />
          <div className="rounded-3xl liquid-glass border border-red-500/20 p-8 space-y-4">
            <div className="size-12 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center mx-auto">
              <span className="text-red-400 text-xl font-bold">!</span>
            </div>
            <h2 className="text-lg font-bold">Link expired</h2>
            <p className="text-sm text-muted-foreground">{error}</p>
            <p className="text-xs text-muted-foreground">Redirecting you to login…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      <BackdropGlow />
      <div className="relative max-w-sm w-full mx-auto px-6 text-center space-y-5">
        <Logo className="h-10 mx-auto" />
        <div className="rounded-3xl liquid-glass neon-border p-8 space-y-4">
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
            <div className="relative size-16 rounded-full border border-primary/30 bg-background flex items-center justify-center">
              <Sparkles className="size-7 text-primary" />
            </div>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.35em] text-primary uppercase">Trey TV</p>
            <h2 className="mt-1 text-lg font-bold">Signing you in…</h2>
            <p className="mt-1 text-sm text-muted-foreground">Just a moment.</p>
          </div>
          <div className="size-5 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
        </div>
      </div>
    </div>
  );
}

function BackdropGlow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 size-[70vmin] rounded-full bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85_/_0.4),oklch(0.7_0.25_340_/_0.35),oklch(0.65_0.22_300_/_0.4),oklch(0.82_0.15_215_/_0.35))] blur-3xl opacity-55 animate-conic-spin" />
      <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}

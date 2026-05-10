import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { saveOnboardingProfile, finalizeOnboarding } from "@/lib/trey-i/onboarding.server";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const nav = useNavigate();

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);

      if (params.get("error")) {
        nav({ to: "/login" });
        return;
      }

      const code      = params.get("code");
      const tokenHash = params.get("token_hash");
      const otpType   = params.get("type");
      let userId: string | undefined;
      let accessToken: string | undefined;

      if (tokenHash && otpType) {
        // Magic link (email OTP) path — verify the token hash directly
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: otpType as any });
        if (!error && data.session) {
          userId      = data.session.user.id;
          accessToken = data.session.access_token;
        } else {
          nav({ to: "/login" });
          return;
        }
      } else if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && data.session) {
          userId      = data.session.user.id;
          accessToken = data.session.access_token;
        } else {
          // Already exchanged by Supabase detectSessionInUrl — session is in storage
          const { data: { user } }    = await supabase.auth.getUser();
          const { data: { session } } = await supabase.auth.getSession();
          if (user)    userId      = user.id;
          if (session) accessToken = session.access_token;
        }
      } else {
        const { data: { user } }    = await supabase.auth.getUser();
        const { data: { session } } = await supabase.auth.getSession();
        if (user)    userId      = user.id;
        if (session) accessToken = session.access_token;
      }

      if (!userId || !accessToken) {
        nav({ to: "/login" });
        return;
      }

      // If the user built their profile via voice onboarding before signing in,
      // apply the stored fields now and finalize — then go straight to their profile.
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
          // Save failed — fall through to normal routing
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;
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
      try {
        next = sessionStorage.getItem("treytv_post_auth_redirect");
        sessionStorage.removeItem("treytv_post_auth_redirect");
      } catch {}

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      nav({ to: (next as any) || (profile.public_profile_uid ? `/u/${profile.public_profile_uid}` : "/") });
    };

    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass border border-white/10 rounded-3xl px-10 py-8 text-center space-y-3">
        <div className="size-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">Signing you in…</p>
      </div>
    </div>
  );
}

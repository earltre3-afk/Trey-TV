import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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

      const code = params.get("code");
      let userId: string | undefined;

      if (code) {
        // PKCE code exchange — code may have already been consumed by detectSessionInUrl
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && data.session) {
          userId = data.session.user.id;
        } else {
          // Already exchanged by Supabase's detectSessionInUrl — session is in storage
          const { data: { user } } = await supabase.auth.getUser();
          if (user) userId = user.id;
        }
      } else {
        // Implicit / hash flow or session already established
        const { data: { user } } = await supabase.auth.getUser();
        if (user) userId = user.id;
      }

      if (!userId) {
        nav({ to: "/login" });
        return;
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
  // nav is stable from useNavigate — intentionally run once on mount
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

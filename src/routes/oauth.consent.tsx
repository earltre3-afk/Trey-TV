import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { OAuthAuthorizationDetails } from "@supabase/supabase-js";
import { ArrowLeft, Check, Loader2, ShieldCheck, Sparkles, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseSession } from "@/lib/supabase-session";

export const Route = createFileRoute("/oauth/consent")({
  component: OAuthConsentPage,
  head: () => ({
    meta: [
      { title: "Authorize FWD - Trey TV" },
      { name: "description", content: "Approve sign-in access for FWD using your Trey TV account." },
    ],
  }),
});

type ProfileSummary = {
  public_profile_uid: string | null;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

type Decision = "approve" | "deny";

const SCOPE_LABELS: Record<string, string> = {
  openid: "Confirm your Trey TV identity",
  email: "Share your email address",
  profile: "Share your public profile details",
  phone: "Share your phone number",
};

function OAuthConsentPage() {
  const nav = useNavigate();
  const search: any = useSearch({ strict: false });
  const { session, user, loading } = useSupabaseSession();
  const authorizationId = typeof search?.authorization_id === "string" ? search.authorization_id.trim() : "";
  const [details, setDetails] = useState<OAuthAuthorizationDetails | null>(null);
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<Decision | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const returnPath = useMemo(() => {
    const params = new URLSearchParams();
    if (authorizationId) params.set("authorization_id", authorizationId);
    return `/oauth/consent${params.toString() ? `?${params.toString()}` : ""}`;
  }, [authorizationId]);

  const scopes = useMemo(() => {
    const rawScope = details?.scope ?? "";
    return rawScope.split(/\s+/).map((scope) => scope.trim()).filter(Boolean);
  }, [details?.scope]);

  useEffect(() => {
    if (!authorizationId || loading) return;
    if (!session) {
      try {
        sessionStorage.setItem("treytv_post_auth_redirect", returnPath);
      } catch {}
      nav({ to: "/login" });
    }
  }, [authorizationId, loading, nav, returnPath, session]);

  useEffect(() => {
    if (!authorizationId || loading || !session) return;

    let alive = true;
    const activeSession = session;
    setDetailsLoading(true);
    setError("");

    async function loadAuthorization() {
      try {
        const [{ data, error: detailsError }, { data: profileData }] = await Promise.all([
          // This page is required by Supabase OAuth Server. Do not remove it while /oauth/consent is configured as the authorization path.
          supabase.auth.oauth.getAuthorizationDetails(authorizationId),
          supabase
            .from("profiles")
            .select("public_profile_uid, display_name, username, avatar_url")
            .eq("id", activeSession.user.id)
            .maybeSingle(),
        ]);

        if (!alive) return;

        if (detailsError) {
          setError(detailsError.message || "This sign-in request is no longer available.");
          setDetails(null);
          return;
        }

        if (!data) {
          setError("This sign-in request is missing or expired.");
          setDetails(null);
          return;
        }

        if ("redirect_url" in data) {
          window.location.assign(data.redirect_url);
          return;
        }

        setProfile((profileData as ProfileSummary | null) ?? null);
        setDetails(data);
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "Could not load this sign-in request.");
        setDetails(null);
      } finally {
        if (alive) setDetailsLoading(false);
      }
    }

    loadAuthorization();
    return () => {
      alive = false;
    };
  }, [authorizationId, loading, session]);

  async function handleDecision(decision: Decision) {
    if (!authorizationId || busy) return;
    setBusy(decision);
    setError("");

    try {
      const method =
        decision === "approve"
          ? supabase.auth.oauth.approveAuthorization
          : supabase.auth.oauth.denyAuthorization;
      const { data, error: consentError } = await method(authorizationId, { skipBrowserRedirect: true });

      if (consentError) {
        setError(consentError.message || "Could not complete this sign-in request.");
        return;
      }

      if (data?.redirect_url) {
        window.location.assign(data.redirect_url);
        return;
      }

      setError("Supabase did not return a redirect for this sign-in request.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not complete this sign-in request.");
    } finally {
      setBusy(null);
    }
  }

  if (!authorizationId) {
    return (
      <ConsentShell backHome>
        <ErrorState
          title="Sign-in request missing"
          message="This Trey TV sign-in request is missing or expired. Start again from FWD to continue."
        />
      </ConsentShell>
    );
  }

  if (loading || detailsLoading || !session || !details) {
    return (
      <ConsentShell>
        {error ? (
          <ErrorState title="Sign-in request unavailable" message={error} />
        ) : (
          <div className="rounded-[28px] liquid-glass neon-border p-7 text-center">
            <Loader2 className="mx-auto size-8 animate-spin text-primary" />
            <h1 className="mt-4 text-xl font-bold">Preparing Trey TV sign-in</h1>
            <p className="mt-2 text-sm text-muted-foreground">Checking your session and the FWD request.</p>
          </div>
        )}
      </ConsentShell>
    );
  }

  if (error) {
    return (
      <ConsentShell>
        <ErrorState title="Sign-in request unavailable" message={error} />
      </ConsentShell>
    );
  }

  const appName = details.client?.name || "FWD";
  const avatar = profile?.avatar_url || user?.user_metadata?.avatar_url || "";
  const displayName =
    profile?.display_name ||
    profile?.username ||
    user?.user_metadata?.full_name ||
    user?.email ||
    "Trey TV user";
  const profileHandle = profile?.username ? `@${profile.username}` : profile?.public_profile_uid ?? "Trey TV account";

  return (
    <ConsentShell>
      <section className="rounded-[30px] liquid-glass neon-border overflow-hidden">
        <div className="px-5 pt-7 pb-5 text-center sm:px-8">
          <Logo className="mx-auto h-14" />
          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.35em] text-primary">
            Continue with Trey TV
          </p>
          <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
            {appName} wants to sign in using Trey TV.
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Continue only if you trust this request. Trey TV will never share your password or private session.
          </p>
        </div>

        <div className="border-y border-white/10 bg-white/[0.035] px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/15 bg-black/40">
              {avatar ? (
                <img src={avatar} alt="" className="size-full object-cover" />
              ) : (
                <Sparkles className="size-5 text-primary" />
              )}
            </div>
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-bold">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{profileHandle}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email ?? details.user?.email}</p>
            </div>
          </div>
        </div>

        <div className="space-y-5 px-5 py-5 sm:px-8 sm:py-7">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Requesting app
                </p>
                <p className="mt-1 text-base font-bold">{appName}</p>
              </div>
              <ShieldCheck className="size-6 shrink-0 text-primary" />
            </div>
            {details.client?.uri ? (
              <p className="mt-2 truncate text-xs text-muted-foreground">{details.client.uri}</p>
            ) : null}
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Requested access
            </p>
            <div className="mt-3 space-y-2">
              {(scopes.length ? scopes : ["openid"]).map((scope) => (
                <div key={scope} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Check className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{SCOPE_LABELS[scope] ?? `Access: ${scope}`}</p>
                    <p className="text-xs text-muted-foreground">{scope}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handleDecision("approve")}
              disabled={!!busy}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground glow-gold transition active:scale-[0.98] disabled:opacity-60"
            >
              {busy === "approve" ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              Continue with Trey TV
            </button>
            <button
              type="button"
              onClick={() => handleDecision("deny")}
              disabled={!!busy}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 text-sm font-semibold transition hover:bg-white/[0.08] active:scale-[0.98] disabled:opacity-60"
            >
              {busy === "deny" ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />}
              Cancel
            </button>
          </div>
        </div>
      </section>
    </ConsentShell>
  );
}

function ErrorState({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-[28px] liquid-glass border border-red-400/25 p-7 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-2xl border border-red-400/25 bg-red-500/10 text-red-200">
        <X className="size-6" />
      </div>
      <h1 className="mt-4 text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      <Link
        to="/"
        className="mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-white/15 bg-white/[0.05] px-5 text-sm font-semibold transition hover:bg-white/[0.09]"
      >
        Back to Trey TV home
      </Link>
    </div>
  );
}

function ConsentShell({ children, backHome = false }: { children: React.ReactNode; backHome?: boolean }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-6 text-foreground sm:py-10">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(80%_55%_at_50%_-20%,oklch(0.82_0.16_85/.22),transparent_62%),radial-gradient(75%_50%_at_100%_10%,oklch(0.7_0.25_340/.16),transparent_66%),linear-gradient(180deg,transparent,oklch(0.05_0.01_260/.9))]"
      />
      <div className="relative mx-auto flex min-h-[calc(100svh-3rem)] w-full max-w-[640px] flex-col justify-center">
        {backHome ? null : (
          <Link
            to="/"
            aria-label="Back to Trey TV home"
            className="mb-4 grid size-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl transition hover:bg-white/[0.08]"
          >
            <ArrowLeft className="size-4" />
          </Link>
        )}
        {children}
      </div>
    </main>
  );
}

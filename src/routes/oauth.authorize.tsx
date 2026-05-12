import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Mail, ShieldCheck, User, X } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/Logo";
import { useSupabaseSession } from "@/lib/supabase-session";
import { approveOAuthAuthorization, validateOAuthAuthorizeRequest } from "@/lib/developers/oauth.server";

export const Route = createFileRoute("/oauth/authorize")({
  component: OAuthAuthorizePage,
  head: () => ({
    meta: [
      { title: "Authorize App — Trey TV" },
      { name: "description", content: "Authorize an app to use your Trey TV account." },
    ],
  }),
});

function OAuthAuthorizePage() {
  const nav = useNavigate();
  const search: any = useSearch({ strict: false });
  const { session, loading } = useSupabaseSession();
  const [app, setApp] = useState<any>(null);
  const [scopes, setScopes] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const params = useMemo(() => ({
    responseType: String(search?.response_type ?? ""),
    clientId: String(search?.client_id ?? ""),
    redirectUri: String(search?.redirect_uri ?? ""),
    scope: String(search?.scope ?? ""),
    state: String(search?.state ?? ""),
    codeChallenge: String(search?.code_challenge ?? ""),
    codeChallengeMethod: String(search?.code_challenge_method ?? ""),
  }), [search]);

  const currentFlowPath = useMemo(() => {
    const query = new URLSearchParams();
    Object.entries({
      response_type: params.responseType,
      client_id: params.clientId,
      redirect_uri: params.redirectUri,
      scope: params.scope,
      state: params.state,
      code_challenge: params.codeChallenge,
      code_challenge_method: params.codeChallengeMethod,
    }).forEach(([key, value]) => {
      if (value) query.set(key, value);
    });
    return `/oauth/authorize?${query.toString()}`;
  }, [params]);

  useEffect(() => {
    if (params.responseType && params.responseType !== "code") {
      setError("Trey TV currently supports response_type=code.");
      return;
    }
    if (!params.clientId || !params.redirectUri) {
      setError("Missing client_id or redirect_uri.");
      return;
    }
    validateOAuthAuthorizeRequest({
      data: { clientId: params.clientId, redirectUri: params.redirectUri, scope: params.scope },
    }).then((result) => {
      setApp(result.app);
      setScopes(result.requestedScopes);
      setError("");
    }).catch((err) => setError(err.message ?? "Could not validate OAuth request"));
  }, [params.clientId, params.redirectUri, params.scope, params.responseType]);

  useEffect(() => {
    if (loading || !app) return;
    if (!session) {
      try { sessionStorage.setItem("treytv_post_auth_redirect", currentFlowPath); } catch {}
      nav({ to: "/login" });
    }
  }, [loading, session, app, nav, currentFlowPath]);

  function redirectWith(values: Record<string, string>) {
    const url = new URL(params.redirectUri);
    Object.entries(values).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
    window.location.href = url.toString();
  }

  async function approve() {
    if (!session) return;
    setBusy(true);
    try {
      const result = await approveOAuthAuthorization({
        data: {
          accessToken: session.access_token,
          clientId: params.clientId,
          redirectUri: params.redirectUri,
          scope: params.scope,
          state: params.state,
          codeChallenge: params.codeChallenge,
          codeChallengeMethod: params.codeChallengeMethod,
        },
      });
      redirectWith({ code: result.code, state: params.state });
    } catch (err: any) {
      toast.error(err.message ?? "Could not authorize app");
    } finally {
      setBusy(false);
    }
  }

  function deny() {
    if (!params.redirectUri) {
      nav({ to: "/" });
      return;
    }
    redirectWith({ error: "access_denied", state: params.state });
  }

  if (error) {
    return (
      <OAuthShell>
        <div className="rounded-3xl liquid-glass border border-red-400/30 p-6 text-center">
          <X className="size-10 mx-auto text-red-300" />
          <h1 className="mt-3 text-2xl font-bold">OAuth request blocked</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Link to="/" className="mt-5 inline-flex h-10 px-4 rounded-xl liquid-glass border border-white/10 items-center">Go home</Link>
        </div>
      </OAuthShell>
    );
  }

  if (loading || !app || !session) {
    return <OAuthShell><div className="text-center text-sm text-muted-foreground">Preparing Trey TV authorization...</div></OAuthShell>;
  }

  return (
    <OAuthShell>
      <div className="rounded-[28px] liquid-glass neon-border p-6 sm:p-8">
        <div className="text-center">
          <Logo className="h-14 mx-auto" />
          <p className="mt-5 text-[10px] tracking-[0.35em] text-primary">SIGN IN WITH TREY TV</p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-black">Allow {app.app_name} to use your Trey TV account?</h1>
          <p className="mt-3 text-sm text-muted-foreground">{app.app_name} will not receive your Trey TV password.</p>
        </div>

        <div className="mt-6 rounded-2xl bg-white/[0.04] border border-white/10 p-4">
          <h2 className="font-bold">Requested permissions</h2>
          <div className="mt-3 space-y-2">
            <Permission show={scopes.includes("profile:read") || scopes.includes("public_uid:read")} icon={User} text="View your public Trey TV profile" />
            <Permission show={scopes.includes("email:read")} icon={Mail} text="View your email address" />
            <Permission show={scopes.includes("creator:read")} icon={ShieldCheck} text="View your creator status" />
            <Permission show={scopes.includes("verification:read")} icon={Check} text="View your gold verification status" />
          </div>
        </div>

        <div className="mt-6 grid sm:grid-cols-2 gap-3">
          <button disabled={busy} onClick={approve} className="h-12 rounded-xl bg-primary text-primary-foreground font-bold glow-gold disabled:opacity-50">
            Allow
          </button>
          <button disabled={busy} onClick={deny} className="h-12 rounded-xl liquid-glass border border-white/10 font-semibold">
            Deny
          </button>
        </div>
      </div>
    </OAuthShell>
  );
}

function Permission({ show, icon: Icon, text }: { show: boolean; icon: typeof User; text: string }) {
  if (!show) return null;
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="size-8 rounded-xl bg-primary/10 text-primary grid place-items-center"><Icon className="size-4" /></div>
      <span>{text}</span>
    </div>
  );
}

function OAuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen bg-background grid place-items-center px-4 py-10">
      <div aria-hidden className="fixed inset-0 pointer-events-none bg-[radial-gradient(70%_55%_at_50%_-10%,oklch(0.82_0.15_215/.2),transparent),radial-gradient(60%_45%_at_100%_20%,oklch(0.82_0.16_85/.12),transparent)]" />
      <Link to="/" className="fixed left-4 top-4 size-10 rounded-full liquid-glass border border-white/10 grid place-items-center"><ArrowLeft className="size-4" /></Link>
      <div className="relative w-full max-w-2xl">{children}</div>
    </main>
  );
}


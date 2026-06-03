import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/Logo";
import { useSupabaseSession } from "@/lib/supabase-session";
import {
  approveFwdOAuthAuthorization,
  validateFwdOAuthAuthorizeRequest,
} from "@/lib/fwd/oauth.server";

export const Route = createFileRoute("/api/fwd/oauth/authorize")({
  component: FwdOAuthAuthorizePage,
  head: () => ({
    meta: [
      { title: "Continue with Trey TV" },
      { name: "description", content: "Authorize FWD to use your Trey TV account." },
    ],
  }),
});

function FwdOAuthAuthorizePage() {
  const nav = useNavigate();
  const search: any = useSearch({ strict: false });
  const { session, loading } = useSupabaseSession();
  const [app, setApp] = useState<any>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const params = useMemo(
    () => ({
      clientId: String(search?.client_id ?? ""),
      redirectUri: String(search?.redirect_uri ?? ""),
      responseType: String(search?.response_type ?? ""),
      scope: String(search?.scope ?? ""),
      state: String(search?.state ?? ""),
    }),
    [search],
  );

  const currentFlowPath = useMemo(() => {
    const query = new URLSearchParams();
    Object.entries({
      client_id: params.clientId,
      redirect_uri: params.redirectUri,
      response_type: params.responseType || "code",
      scope: params.scope,
      state: params.state,
    }).forEach(([key, value]) => {
      if (value) query.set(key, value);
    });
    return `/api/fwd/oauth/authorize?${query.toString()}`;
  }, [params]);

  useEffect(() => {
    validateFwdOAuthAuthorizeRequest({
      data: {
        clientId: params.clientId,
        redirectUri: params.redirectUri,
        responseType: params.responseType || "code",
        scope: params.scope,
      },
    })
      .then(({ client }) => {
        setApp(client);
        setError("");
      })
      .catch((err) => {
        setApp(null);
        setError(err.message ?? "Could not validate FWD login request.");
      });
  }, [params.clientId, params.redirectUri, params.responseType, params.scope]);

  useEffect(() => {
    if (loading || !app) return;
    if (!session) {
      try {
        sessionStorage.setItem("treytv_post_auth_redirect", currentFlowPath);
      } catch {}
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
      const result = await approveFwdOAuthAuthorization({
        data: {
          accessToken: session.access_token,
          clientId: params.clientId,
          redirectUri: params.redirectUri,
          responseType: params.responseType || "code",
          scope: params.scope,
          state: params.state,
        },
      });
      redirectWith({ code: result.code, state: params.state });
    } catch (err: any) {
      toast.error(err.message ?? "Could not authorize FWD.");
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
      <BridgeShell>
        <div className="rounded-3xl liquid-glass border border-red-400/30 p-6 text-center">
          <X className="size-10 mx-auto text-red-300" />
          <h1 className="mt-3 text-2xl font-bold">FWD login blocked</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Link
            to="/"
            className="mt-5 inline-flex h-10 px-4 rounded-xl liquid-glass border border-white/10 items-center"
          >
            Go home
          </Link>
        </div>
      </BridgeShell>
    );
  }

  if (loading || !app || !session) {
    return (
      <BridgeShell>
        <div className="text-center text-sm text-muted-foreground">
          Preparing FWD authorization...
        </div>
      </BridgeShell>
    );
  }

  return (
    <BridgeShell>
      <div className="rounded-[28px] liquid-glass neon-border p-6 sm:p-8">
        <div className="text-center">
          <Logo className="h-14 mx-auto" />
          <p className="mt-5 text-[10px] tracking-[0.35em] text-primary">CONTINUE WITH TREY TV</p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-black">
            Allow FWD to use your Trey TV account?
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            FWD will not receive your Trey TV password or raw session.
          </p>
        </div>

        <div className="mt-6 rounded-2xl bg-white/[0.04] border border-white/10 p-4">
          <h2 className="font-bold">FWD can receive</h2>
          <div className="mt-3 space-y-2">
            <Permission icon={ShieldCheck} text="Your public Trey TV UID" />
            <Permission icon={Check} text="Your public display name, avatar, and profile link" />
          </div>
        </div>

        <div className="mt-6 grid sm:grid-cols-2 gap-3">
          <button
            disabled={busy}
            onClick={approve}
            className="h-12 rounded-xl bg-primary text-primary-foreground font-bold glow-gold disabled:opacity-50"
          >
            Allow
          </button>
          <button
            disabled={busy}
            onClick={deny}
            className="h-12 rounded-xl liquid-glass border border-white/10 font-semibold"
          >
            Deny
          </button>
        </div>
      </div>
    </BridgeShell>
  );
}

function Permission({ icon: Icon, text }: { icon: typeof Check; text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="size-8 rounded-xl bg-primary/10 text-primary grid place-items-center">
        <Icon className="size-4" />
      </div>
      <span>{text}</span>
    </div>
  );
}

function BridgeShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen bg-background grid place-items-center px-4 py-10">
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none bg-[radial-gradient(70%_55%_at_50%_-10%,oklch(0.82_0.15_215/.2),transparent),radial-gradient(60%_45%_at_100%_20%,oklch(0.82_0.16_85/.12),transparent)]"
      />
      <Link
        to="/"
        className="fixed left-4 top-4 size-10 rounded-full liquid-glass border border-white/10 grid place-items-center"
      >
        <ArrowLeft className="size-4" />
      </Link>
      <div className="relative w-full max-w-2xl">{children}</div>
    </main>
  );
}

import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, g as useSearch, L as Link } from "../_libs/tanstack__react-router.mjs";
import { L as Logo } from "./Logo-D0JEzEf4.mjs";
import { g as useSupabaseSession, s as supabase } from "./router-BtgGywEC.mjs";
import "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { az as LoaderCircle, S as Sparkles, l as ShieldCheck, k as Check, X, A as ArrowLeft } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "./trey-tv-logo-CG7PjBoN.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/zod.mjs";
import "node:crypto";
import "node:async_hooks";
import "../_libs/livekit__protocol.mjs";
import "../_libs/bufbuild__protobuf.mjs";
import "../_libs/livekit-server-sdk.mjs";
import "../_libs/jose.mjs";
import "node:buffer";
import "node:util";
import "node:fs";
import "node:path";
import "util";
import "crypto";
import "async_hooks";
import "stream";
const SCOPE_LABELS = {
  openid: "Confirm your Trey TV identity",
  email: "Share your email address",
  profile: "Share your public profile details",
  phone: "Share your phone number"
};
function OAuthConsentPage() {
  const nav = useNavigate();
  const search = useSearch({
    strict: false
  });
  const {
    session,
    user,
    loading
  } = useSupabaseSession();
  const authorizationId = typeof search?.authorization_id === "string" ? search.authorization_id.trim() : "";
  const [details, setDetails] = reactExports.useState(null);
  const [profile, setProfile] = reactExports.useState(null);
  const [error, setError] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(null);
  const [detailsLoading, setDetailsLoading] = reactExports.useState(false);
  const returnPath = reactExports.useMemo(() => {
    const params = new URLSearchParams();
    if (authorizationId) params.set("authorization_id", authorizationId);
    return `/oauth/consent${params.toString() ? `?${params.toString()}` : ""}`;
  }, [authorizationId]);
  const scopes = reactExports.useMemo(() => {
    const rawScope = details?.scope ?? "";
    return rawScope.split(/\s+/).map((scope) => scope.trim()).filter(Boolean);
  }, [details?.scope]);
  reactExports.useEffect(() => {
    if (!authorizationId || loading) return;
    if (!session) {
      try {
        sessionStorage.setItem("treytv_post_auth_redirect", returnPath);
      } catch {
      }
      nav({
        to: "/login"
      });
    }
  }, [authorizationId, loading, nav, returnPath, session]);
  reactExports.useEffect(() => {
    if (!authorizationId || loading || !session) return;
    let alive = true;
    const activeSession = session;
    setDetailsLoading(true);
    setError("");
    async function loadAuthorization() {
      try {
        const [{
          data,
          error: detailsError
        }, {
          data: profileData
        }] = await Promise.all([
          // This page is required by Supabase OAuth Server. Do not remove it while /oauth/consent is configured as the authorization path.
          supabase.auth.oauth.getAuthorizationDetails(authorizationId),
          supabase.from("profiles").select("public_profile_uid, display_name, username, avatar_url").eq("id", activeSession.user.id).maybeSingle()
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
        setProfile(profileData ?? null);
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
  async function handleDecision(decision) {
    if (!authorizationId || busy) return;
    setBusy(decision);
    setError("");
    try {
      const method = decision === "approve" ? supabase.auth.oauth.approveAuthorization : supabase.auth.oauth.denyAuthorization;
      const {
        data,
        error: consentError
      } = await method(authorizationId, {
        skipBrowserRedirect: true
      });
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
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ConsentShell, { backHome: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorState, { title: "Sign-in request missing", message: "This Trey TV sign-in request is missing or expired. Start again from FWD to continue." }) });
  }
  if (loading || detailsLoading || !session || !details) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ConsentShell, { children: error ? /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorState, { title: "Sign-in request unavailable", message: error }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[28px] liquid-glass neon-border p-7 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mx-auto size-8 animate-spin text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-4 text-xl font-bold", children: "Preparing Trey TV sign-in" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Checking your session and the FWD request." })
    ] }) });
  }
  if (error) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ConsentShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorState, { title: "Sign-in request unavailable", message: error }) });
  }
  const appName = details.client?.name || "FWD";
  const avatar = profile?.avatar_url || user?.user_metadata?.avatar_url || "";
  const displayName = profile?.display_name || profile?.username || user?.user_metadata?.full_name || user?.email || "Trey TV user";
  const profileHandle = profile?.username ? `@${profile.username}` : profile?.public_profile_uid ?? "Trey TV account";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ConsentShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-[30px] liquid-glass neon-border overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 pt-7 pb-5 text-center sm:px-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "mx-auto h-14" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 text-[10px] font-semibold uppercase tracking-[0.35em] text-primary", children: "Continue with Trey TV" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-3 text-3xl font-black leading-tight sm:text-4xl", children: [
        appName,
        " wants to sign in using Trey TV."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-3 max-w-md text-sm text-muted-foreground", children: "Continue only if you trust this request. Trey TV will never share your password or private session." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-y border-white/10 bg-white/[0.035] px-5 py-4 sm:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/15 bg-black/40", children: avatar ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: avatar, alt: "", className: "size-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-5 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-sm font-bold", children: displayName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-xs text-muted-foreground", children: profileHandle }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-xs text-muted-foreground", children: user?.email ?? details.user?.email })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 px-5 py-5 sm:px-8 sm:py-7", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-white/10 bg-black/20 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground", children: "Requesting app" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-base font-bold", children: appName })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "size-6 shrink-0 text-primary" })
        ] }),
        details.client?.uri ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 truncate text-xs text-muted-foreground", children: details.client.uri }) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground", children: "Requested access" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 space-y-2", children: (scopes.length ? scopes : ["openid"]).map((scope) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid size-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: SCOPE_LABELS[scope] ?? `Access: ${scope}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: scope })
          ] })
        ] }, scope)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => handleDecision("approve"), disabled: !!busy, className: "inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground glow-gold transition active:scale-[0.98] disabled:opacity-60", children: [
          busy === "approve" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-4" }),
          "Continue with Trey TV"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => handleDecision("deny"), disabled: !!busy, className: "inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 text-sm font-semibold transition hover:bg-white/[0.08] active:scale-[0.98] disabled:opacity-60", children: [
          busy === "deny" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" }),
          "Cancel"
        ] })
      ] })
    ] })
  ] }) });
}
function ErrorState({
  title,
  message
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[28px] liquid-glass border border-red-400/25 p-7 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto grid size-12 place-items-center rounded-2xl border border-red-400/25 bg-red-500/10 text-red-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-6" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-4 text-2xl font-bold", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: message }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-white/15 bg-white/[0.05] px-5 text-sm font-semibold transition hover:bg-white/[0.09]", children: "Back to Trey TV home" })
  ] });
}
function ConsentShell({
  children,
  backHome = false
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "relative min-h-screen overflow-hidden bg-background px-4 py-6 text-foreground sm:py-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "pointer-events-none fixed inset-0 bg-[radial-gradient(80%_55%_at_50%_-20%,oklch(0.82_0.16_85/.22),transparent_62%),radial-gradient(75%_50%_at_100%_10%,oklch(0.7_0.25_340/.16),transparent_66%),linear-gradient(180deg,transparent,oklch(0.05_0.01_260/.9))]" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto flex min-h-[calc(100svh-3rem)] w-full max-w-[640px] flex-col justify-center", children: [
      backHome ? null : /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", "aria-label": "Back to Trey TV home", className: "mb-4 grid size-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl transition hover:bg-white/[0.08]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }) }),
      children
    ] })
  ] });
}
export {
  OAuthConsentPage as component
};

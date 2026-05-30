import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, g as useSearch, L as Link } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { L as Logo } from "./Logo-D0JEzEf4.mjs";
import { g as useSupabaseSession } from "./router-BtgGywEC.mjs";
import { v as validateOAuthAuthorizeRequest, g as approveOAuthAuthorization } from "./oauth.server-_zjjG9eD.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { X, U as User, h as Mail, l as ShieldCheck, k as Check, A as ArrowLeft } from "../_libs/lucide-react.mjs";
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
function OAuthAuthorizePage() {
  const nav = useNavigate();
  const search = useSearch({
    strict: false
  });
  const {
    session,
    loading
  } = useSupabaseSession();
  const [app, setApp] = reactExports.useState(null);
  const [scopes, setScopes] = reactExports.useState([]);
  const [error, setError] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const params = reactExports.useMemo(() => ({
    responseType: String(search?.response_type ?? ""),
    clientId: String(search?.client_id ?? ""),
    redirectUri: String(search?.redirect_uri ?? ""),
    scope: String(search?.scope ?? ""),
    state: String(search?.state ?? ""),
    codeChallenge: String(search?.code_challenge ?? ""),
    codeChallengeMethod: String(search?.code_challenge_method ?? "")
  }), [search]);
  const currentFlowPath = reactExports.useMemo(() => {
    const query = new URLSearchParams();
    Object.entries({
      response_type: params.responseType,
      client_id: params.clientId,
      redirect_uri: params.redirectUri,
      scope: params.scope,
      state: params.state,
      code_challenge: params.codeChallenge,
      code_challenge_method: params.codeChallengeMethod
    }).forEach(([key, value]) => {
      if (value) query.set(key, value);
    });
    return `/oauth/authorize?${query.toString()}`;
  }, [params]);
  reactExports.useEffect(() => {
    if (params.responseType && params.responseType !== "code") {
      setError("Trey TV currently supports response_type=code.");
      return;
    }
    if (!params.clientId || !params.redirectUri) {
      setError("Missing client_id or redirect_uri.");
      return;
    }
    validateOAuthAuthorizeRequest({
      data: {
        clientId: params.clientId,
        redirectUri: params.redirectUri,
        scope: params.scope
      }
    }).then((result) => {
      setApp(result.app);
      setScopes(result.requestedScopes);
      setError("");
    }).catch((err) => setError(err.message ?? "Could not validate OAuth request"));
  }, [params.clientId, params.redirectUri, params.scope, params.responseType]);
  reactExports.useEffect(() => {
    if (loading || !app) return;
    if (!session) {
      try {
        sessionStorage.setItem("treytv_post_auth_redirect", currentFlowPath);
      } catch {
      }
      nav({
        to: "/login"
      });
    }
  }, [loading, session, app, nav, currentFlowPath]);
  function redirectWith(values) {
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
          codeChallengeMethod: params.codeChallengeMethod
        }
      });
      redirectWith({
        code: result.code,
        state: params.state
      });
    } catch (err) {
      toast.error(err.message ?? "Could not authorize app");
    } finally {
      setBusy(false);
    }
  }
  function deny() {
    if (!params.redirectUri) {
      nav({
        to: "/"
      });
      return;
    }
    redirectWith({
      error: "access_denied",
      state: params.state
    });
  }
  if (error) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(OAuthShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl liquid-glass border border-red-400/30 p-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-10 mx-auto text-red-300" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 text-2xl font-bold", children: "OAuth request blocked" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "mt-5 inline-flex h-10 px-4 rounded-xl liquid-glass border border-white/10 items-center", children: "Go home" })
    ] }) });
  }
  if (loading || !app || !session) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(OAuthShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-sm text-muted-foreground", children: "Preparing Trey TV authorization..." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(OAuthShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[28px] liquid-glass neon-border p-6 sm:p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "h-14 mx-auto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 text-[10px] tracking-[0.35em] text-primary", children: "SIGN IN WITH TREY TV" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-3 text-3xl sm:text-4xl font-black", children: [
        "Allow ",
        app.app_name,
        " to use your Trey TV account?"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-sm text-muted-foreground", children: [
        app.app_name,
        " will not receive your Trey TV password."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 rounded-2xl bg-white/[0.04] border border-white/10 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold", children: "Requested permissions" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Permission, { show: scopes.includes("profile:read") || scopes.includes("public_uid:read"), icon: User, text: "View your public Trey TV profile" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Permission, { show: scopes.includes("email:read"), icon: Mail, text: "View your email address" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Permission, { show: scopes.includes("creator:read"), icon: ShieldCheck, text: "View your creator status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Permission, { show: scopes.includes("verification:read"), icon: Check, text: "View your gold verification status" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid sm:grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: busy, onClick: approve, className: "h-12 rounded-xl bg-primary text-primary-foreground font-bold glow-gold disabled:opacity-50", children: "Allow" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: busy, onClick: deny, className: "h-12 rounded-xl liquid-glass border border-white/10 font-semibold", children: "Deny" })
    ] })
  ] }) });
}
function Permission({
  show,
  icon: Icon,
  text
}) {
  if (!show) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-8 rounded-xl bg-primary/10 text-primary grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-4" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: text })
  ] });
}
function OAuthShell({
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "relative min-h-screen bg-background grid place-items-center px-4 py-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "fixed inset-0 pointer-events-none bg-[radial-gradient(70%_55%_at_50%_-10%,oklch(0.82_0.15_215/.2),transparent),radial-gradient(60%_45%_at_100%_20%,oklch(0.82_0.16_85/.12),transparent)]" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "fixed left-4 top-4 size-10 rounded-full liquid-glass border border-white/10 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-full max-w-2xl", children })
  ] });
}
export {
  OAuthAuthorizePage as component
};

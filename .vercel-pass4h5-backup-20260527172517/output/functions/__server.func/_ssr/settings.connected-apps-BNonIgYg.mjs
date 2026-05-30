import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { L as Logo } from "./Logo-D0JEzEf4.mjs";
import { g as useSupabaseSession } from "./router-BtgGywEC.mjs";
import { e as listConnectedApps, f as revokeConnectedApp } from "./oauth.server-_zjjG9eD.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { A as ArrowLeft, l as ShieldCheck, aF as Trash2 } from "../_libs/lucide-react.mjs";
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
function ConnectedAppsPage() {
  const nav = useNavigate();
  const {
    session,
    loading
  } = useSupabaseSession();
  const [consents, setConsents] = reactExports.useState([]);
  const token = session?.access_token ?? "";
  reactExports.useEffect(() => {
    if (loading) return;
    if (!session) {
      try {
        sessionStorage.setItem("treytv_post_auth_redirect", "/settings/connected-apps");
      } catch {
      }
      nav({
        to: "/login"
      });
    }
  }, [loading, session, nav]);
  async function load() {
    if (!token) return;
    const result = await listConnectedApps({
      data: {
        accessToken: token
      }
    });
    setConsents(result.consents);
  }
  reactExports.useEffect(() => {
    void load().catch((error) => toast.error(error.message ?? "Could not load connected apps"));
  }, [token]);
  async function revoke(consentId) {
    await revokeConnectedApp({
      data: {
        accessToken: token,
        consentId
      }
    });
    toast.success("Access revoked");
    await load();
  }
  if (loading || !session) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen grid place-items-center text-sm text-muted-foreground", children: "Loading connected apps..." });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "fixed inset-0 pointer-events-none bg-[radial-gradient(70%_55%_at_50%_-10%,oklch(0.82_0.15_215/.18),transparent)]" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-5xl mx-auto px-4 sm:px-8 py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/settings", className: "size-10 rounded-full liquid-glass border border-white/10 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "h-12" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-8 rounded-[28px] liquid-glass neon-border p-6 sm:p-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] tracking-[0.35em] text-primary", children: "ACCOUNT SECURITY" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 text-4xl sm:text-5xl font-black", children: "Connected Apps" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-muted-foreground", children: "Review apps that can use your Trey TV identity and revoke access at any time." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mt-6 space-y-3", children: consents.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl liquid-glass border border-white/10 p-8 text-center text-sm text-muted-foreground", children: "No connected apps yet." }) : consents.map((consent) => {
        const app = Array.isArray(consent.developer_apps) ? consent.developer_apps[0] : consent.developer_apps;
        const revoked = Boolean(consent.revoked_at);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl liquid-glass border border-white/10 p-5 flex flex-wrap items-center gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-11 rounded-2xl bg-primary/10 text-primary grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "size-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold truncate", children: app?.app_name ?? "Developer App" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground truncate", children: [
              app?.website_url ?? "No website",
              " · Connected ",
              new Date(consent.granted_at).toLocaleDateString()
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex flex-wrap gap-1.5", children: (Array.isArray(consent.scopes) ? consent.scopes : []).map((scope) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-muted-foreground", children: scope }, scope)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { disabled: revoked, onClick: () => revoke(consent.id), className: "h-10 px-3 rounded-xl border border-red-400/30 text-red-300 text-xs inline-flex items-center gap-1.5 disabled:opacity-40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-3.5" }),
            " ",
            revoked ? "Revoked" : "Revoke Access"
          ] })
        ] }, consent.id);
      }) })
    ] })
  ] });
}
export {
  ConnectedAppsPage as component
};

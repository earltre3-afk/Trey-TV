import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { A as AdminShell } from "./AdminShell-DTn6ktTs.mjs";
import { b as useAuth$1, g as useSupabaseSession } from "./router-BtgGywEC.mjs";
import { h as listAdminDeveloperApps } from "./oauth.server-_zjjG9eD.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { bm as ShieldAlert } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "./AppShell-BWcCrjwR.mjs";
import "./Logo-D0JEzEf4.mjs";
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
function AdminDeveloperAppsPage() {
  const nav = useNavigate();
  const {
    isAdmin
  } = useAuth$1();
  const {
    session,
    loading
  } = useSupabaseSession();
  const [apps, setApps] = reactExports.useState([]);
  reactExports.useEffect(() => {
    if (!loading && !isAdmin) nav({
      to: "/"
    });
  }, [loading, isAdmin, nav]);
  reactExports.useEffect(() => {
    if (!session?.access_token || !isAdmin) return;
    listAdminDeveloperApps({
      data: {
        accessToken: session.access_token
      }
    }).then((result) => setApps(result.apps)).catch((error) => toast.error(error.message ?? "Could not load developer apps"));
  }, [session?.access_token, isAdmin]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminShell, { title: "Developer Apps", subtitle: "Review OAuth clients, app owners, scopes, and redirect URLs.", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl liquid-glass border border-primary/30 p-4 mb-5 flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "size-5 text-primary shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Admin controls are staged here for app review. Suspend/revoke workflows should write audit events before public launch." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: apps.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl liquid-glass border border-white/10 p-8 text-center text-sm text-muted-foreground", children: "No developer apps found." }) : apps.map((app) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl liquid-glass border border-white/10 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold", children: app.app_name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: app.client_id }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex flex-wrap gap-1.5", children: (Array.isArray(app.allowed_scopes) ? app.allowed_scopes : []).map((scope) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-2 py-0.5 rounded-full border border-white/10", children: scope }, scope)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-2 py-1 rounded-full border border-primary/30 text-primary capitalize", children: app.status })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 text-xs text-muted-foreground", children: [
        "Redirect URLs: ",
        (Array.isArray(app.redirect_uris) ? app.redirect_uris : []).join(", ") || "none"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/developers", className: "mt-3 inline-flex text-xs text-primary hover:underline", children: "Open developer portal" })
    ] }, app.id)) })
  ] });
}
export {
  AdminDeveloperAppsPage as component
};

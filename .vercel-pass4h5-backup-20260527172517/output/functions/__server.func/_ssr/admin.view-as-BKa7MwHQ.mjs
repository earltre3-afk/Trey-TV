import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { A as AdminShell } from "./AdminShell-DTn6ktTs.mjs";
import { b as useAuth$1 } from "./router-BtgGywEC.mjs";
import "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { j as Eye, U as User, t as Crown, l as ShieldCheck } from "../_libs/lucide-react.mjs";
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
function ViewAs() {
  const {
    isAdmin,
    setRole
  } = useAuth$1();
  const nav = useNavigate();
  if (!isAdmin) return null;
  const opts = [{
    role: "guest",
    label: "Guest (signed out)",
    icon: Eye
  }, {
    role: "user",
    label: "Normal user",
    icon: User
  }, {
    role: "creator",
    label: "Approved creator",
    icon: Crown
  }, {
    role: "admin",
    label: "Admin",
    icon: ShieldCheck
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminShell, { title: "View As", subtitle: "Preview the app from any perspective. Real permissions are unchanged.", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl liquid-glass border border-primary/30 p-4 mb-3 glow-gold text-xs text-primary", children: "Preview mode — your real admin role is preserved on the server." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-2 gap-3", children: opts.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
      setRole(o.role);
      nav({
        to: "/"
      });
    }, className: "p-4 rounded-2xl liquid-glass border border-white/10 hover:border-primary/40 transition flex items-center gap-3 text-left", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-10 rounded-xl bg-primary/15 text-primary grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(o.icon, { className: "size-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold", children: o.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: "Open the app as this role" })
      ] })
    ] }, o.role)) })
  ] });
}
export {
  ViewAs as component
};

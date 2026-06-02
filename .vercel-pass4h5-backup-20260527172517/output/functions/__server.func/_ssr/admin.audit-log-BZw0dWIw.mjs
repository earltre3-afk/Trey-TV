import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { A as AdminShell } from "./AdminShell-DTn6ktTs.mjs";
import { b as useAuth$1, s as supabase } from "./router-BtgGywEC.mjs";
import { b as useQuery } from "../_libs/tanstack__react-query.mjs";
import "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { D as History } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "./AppShell-BWcCrjwR.mjs";
import "./Logo-D0JEzEf4.mjs";
import "./trey-tv-logo-CG7PjBoN.mjs";
import "../_libs/tanstack__query-core.mjs";
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
function AuditLog() {
  const {
    isAdmin
  } = useAuth$1();
  if (!isAdmin) return null;
  const {
    data
  } = useQuery({
    queryKey: ["admin", "audit-log"],
    queryFn: async () => {
      const {
        data: data2
      } = await supabase.from("admin_audit_log").select("*").order("created_at", {
        ascending: false
      }).limit(200);
      return data2 ?? [];
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AdminShell, { title: "Audit Log", subtitle: "Every admin action, recorded.", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl liquid-glass border border-white/10 p-4 space-y-2", children: (data?.length ?? 0) === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground p-8 text-center flex flex-col items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "size-6 text-muted-foreground" }),
    "No admin actions logged yet."
  ] }) : data.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-2xl glass border border-white/10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: r.action }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground", children: new Date(r.created_at).toLocaleString() })
    ] }),
    r.target_type && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
      r.target_type,
      ": ",
      r.target_id
    ] }),
    r.reason && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] italic text-muted-foreground/80 mt-1", children: [
      '"',
      r.reason,
      '"'
    ] })
  ] }, r.id)) }) });
}
export {
  AuditLog as component
};

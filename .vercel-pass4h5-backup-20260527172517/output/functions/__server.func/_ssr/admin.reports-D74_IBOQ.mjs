import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { A as AdminShell } from "./AdminShell-DTn6ktTs.mjs";
import { b as useAuth$1, s as supabase } from "./router-BtgGywEC.mjs";
import { a as useQueryClient, b as useQuery } from "../_libs/tanstack__react-query.mjs";
import { l as logAdminAction } from "./admin-api-D2pvH5CQ.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { aT as Flag, k as Check, X } from "../_libs/lucide-react.mjs";
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
function ReportsAdmin() {
  const {
    isAdmin
  } = useAuth$1();
  const qc = useQueryClient();
  const [tab, setTab] = reactExports.useState("pending");
  if (!isAdmin) return null;
  const {
    data
  } = useQuery({
    queryKey: ["admin", "reports", tab],
    queryFn: async () => {
      let userReports = supabase.from("user_reports").select("*").order("created_at", {
        ascending: false
      }).limit(200);
      let groupReports = supabase.from("zodiac_group_reports").select("*, group:zodiac_group_threads(group_name, group_key)").order("created_at", {
        ascending: false
      }).limit(200);
      if (tab !== "all") {
        userReports = userReports.eq("status", tab);
        groupReports = groupReports.eq("status", tab);
      }
      const [users, groups] = await Promise.all([userReports, groupReports]);
      return [...(users.data ?? []).map((row) => ({
        ...row,
        report_table: "user_reports"
      })), ...(groups.data ?? []).map((row) => ({
        ...row,
        report_table: "zodiac_group_reports",
        target_type: row.message_id ? "zodiac_group_message" : "zodiac_group",
        target_id: row.message_id ?? row.group_thread_id
      }))].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  });
  const resolve = async (r, status) => {
    const reason = prompt(`Notes for ${status}:`) ?? "";
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    const table = r.report_table === "zodiac_group_reports" ? "zodiac_group_reports" : "user_reports";
    const {
      error
    } = await supabase.from(table).update({
      status,
      resolved_at: (/* @__PURE__ */ new Date()).toISOString(),
      resolved_by: user?.id
    }).eq("id", r.id);
    if (error) return toast.error(error.message);
    await logAdminAction({
      action: `report_${status}`,
      target_type: table,
      target_id: r.id,
      reason,
      metadata: {
        target_type: r.target_type,
        target_id: r.target_id
      }
    });
    toast.success(`Report ${status}`);
    qc.invalidateQueries({
      queryKey: ["admin", "reports"]
    });
  };
  const TABS = ["pending", "resolved", "dismissed", "all"];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminShell, { title: "Reports Center", subtitle: "Investigate and act on user reports.", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl liquid-glass border border-white/10 p-1.5 flex gap-1", children: TABS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTab(t), className: `flex-1 px-3 py-2 rounded-xl text-xs font-semibold capitalize ${tab === t ? "bg-primary/15 text-primary border border-primary/40" : "text-muted-foreground hover:bg-white/5 border border-transparent"}`, children: t }, t)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: (data?.length ?? 0) === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl liquid-glass border border-white/10 p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { className: "size-6" }),
      " No reports."
    ] }) : data.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 rounded-2xl liquid-glass border border-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[10px] tracking-[0.25em] px-2 py-0.5 rounded uppercase ${r.status === "pending" ? "bg-amber-400/10 text-amber-300" : r.status === "resolved" ? "bg-emerald-400/10 text-emerald-300" : "bg-white/5 text-muted-foreground"}`, children: r.status }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: new Date(r.created_at).toLocaleString() })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold mt-1", children: r.reason }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
          r.target_type,
          " · ",
          r.group?.group_name ?? r.target_id
        ] }),
        r.details && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-foreground/80 mt-1 line-clamp-3", children: r.details })
      ] }),
      r.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => resolve(r, "resolved"), className: "size-9 rounded-xl bg-primary/15 text-primary border border-primary/40 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => resolve(r, "dismissed"), className: "size-9 rounded-xl glass border border-white/10 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" }) })
      ] })
    ] }) }, r.id)) })
  ] });
}
export {
  ReportsAdmin as component
};

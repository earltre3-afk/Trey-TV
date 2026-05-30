import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { A as AdminShell } from "./AdminShell-DTn6ktTs.mjs";
import { b as useAuth$1, s as supabase } from "./router-BtgGywEC.mjs";
import { a as useQueryClient, b as useQuery } from "../_libs/tanstack__react-query.mjs";
import { l as logAdminAction } from "./admin-api-D2pvH5CQ.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { n as Settings } from "../_libs/lucide-react.mjs";
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
function PlatformSettings() {
  const {
    isAdmin
  } = useAuth$1();
  const qc = useQueryClient();
  if (!isAdmin) return null;
  const {
    data
  } = useQuery({
    queryKey: ["admin", "platform-settings"],
    queryFn: async () => {
      const {
        data: data2
      } = await supabase.from("platform_settings").select("*").order("key");
      return data2 ?? [];
    }
  });
  const toggle = async (key, current) => {
    const next = !(current === true);
    const {
      error
    } = await supabase.from("platform_settings").update({
      value: next,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("key", key);
    if (error) return toast.error(error.message);
    await logAdminAction({
      action: "platform_setting_changed",
      target_type: "platform_settings",
      target_id: key,
      metadata: {
        from: current,
        to: next
      }
    });
    toast.success("Updated");
    qc.invalidateQueries({
      queryKey: ["admin", "platform-settings"]
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AdminShell, { title: "Platform Settings", subtitle: "Toggle modules and platform-level controls.", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl liquid-glass border border-white/10 p-2 divide-y divide-white/5", children: (data ?? []).map((row) => {
    const isBool = row.value === true || row.value === false;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "size-4 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: row.key }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground truncate", children: JSON.stringify(row.value) })
      ] }),
      isBool && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toggle(row.key, row.value), className: `px-3 h-8 rounded-lg text-xs font-bold ${row.value ? "bg-primary text-primary-foreground glow-gold" : "glass border border-white/10 text-muted-foreground"}`, children: row.value ? "ON" : "OFF" })
    ] }, row.key);
  }) }) });
}
export {
  PlatformSettings as component
};

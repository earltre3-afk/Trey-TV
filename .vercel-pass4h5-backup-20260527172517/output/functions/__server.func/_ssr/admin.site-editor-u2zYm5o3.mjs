import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { A as AdminShell } from "./AdminShell-DTn6ktTs.mjs";
import { b as useAuth$1, s as supabase } from "./router-BtgGywEC.mjs";
import { a as useQueryClient, b as useQuery } from "../_libs/tanstack__react-query.mjs";
import { l as logAdminAction } from "./admin-api-D2pvH5CQ.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { bx as ScrollText, aG as Save } from "../_libs/lucide-react.mjs";
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
function SiteEditor() {
  const {
    isAdmin
  } = useAuth$1();
  const qc = useQueryClient();
  const [edits, setEdits] = reactExports.useState({});
  if (!isAdmin) return null;
  const {
    data
  } = useQuery({
    queryKey: ["admin", "site-blocks"],
    queryFn: async () => (await supabase.from("site_content_blocks").select("*").order("page")).data ?? []
  });
  const save = async (block) => {
    const e = edits[block.id] ?? {};
    const {
      error
    } = await supabase.from("site_content_blocks").update({
      title: e.title ?? block.title,
      body: e.body ?? block.body,
      status: "published",
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", block.id);
    if (error) return toast.error(error.message);
    await logAdminAction({
      action: "site_content_edited",
      target_type: "site_content_blocks",
      target_id: block.key
    });
    toast.success("Published");
    setEdits((p) => {
      const n = {
        ...p
      };
      delete n[block.id];
      return n;
    });
    qc.invalidateQueries({
      queryKey: ["admin", "site-blocks"]
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AdminShell, { title: "Live Site Editor", subtitle: "Edit platform copy. Changes go live on save.", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: (data ?? []).map((b) => {
    const e = edits[b.id] ?? {};
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-2xl liquid-glass border border-white/10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollText, { className: "size-4 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.25em] text-primary uppercase", children: b.page }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
          "/ ",
          b.key
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: e.title ?? b.title ?? "", onChange: (ev) => setEdits((p) => ({
        ...p,
        [b.id]: {
          ...p[b.id],
          title: ev.target.value
        }
      })), placeholder: "Title", className: "w-full bg-transparent text-sm font-bold border-b border-white/10 pb-1 focus:outline-none focus:border-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: e.body ?? b.body ?? "", onChange: (ev) => setEdits((p) => ({
        ...p,
        [b.id]: {
          ...p[b.id],
          body: ev.target.value
        }
      })), placeholder: "Body", rows: 3, className: "mt-2 w-full bg-transparent text-xs text-foreground/80 border border-white/10 rounded-xl p-2 focus:outline-none focus:border-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => save(b), className: "mt-2 px-3 h-9 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 glow-gold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "size-3.5" }),
        " Publish"
      ] })
    ] }, b.id);
  }) }) });
}
export {
  SiteEditor as component
};

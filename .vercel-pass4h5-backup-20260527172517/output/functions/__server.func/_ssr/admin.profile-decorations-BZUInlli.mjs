import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { A as AdminShell } from "./AdminShell-DTn6ktTs.mjs";
import { b as useAuth$1, s as supabase } from "./router-BtgGywEC.mjs";
import { a as useQueryClient, b as useQuery } from "../_libs/tanstack__react-query.mjs";
import { l as logAdminAction } from "./admin-api-D2pvH5CQ.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { P as Plus, o as Palette, aF as Trash2 } from "../_libs/lucide-react.mjs";
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
const TYPES = ["border", "frame", "glow", "banner", "badge"];
const RARITIES = ["common", "rare", "epic", "legendary"];
function Decorations() {
  const {
    isAdmin
  } = useAuth$1();
  const qc = useQueryClient();
  const [creating, setCreating] = reactExports.useState(false);
  const [form, setForm] = reactExports.useState({
    name: "",
    description: "",
    type: "border",
    rarity: "common",
    point_cost: 100,
    gold_only: false,
    creator_only: false
  });
  if (!isAdmin) return null;
  const {
    data
  } = useQuery({
    queryKey: ["admin", "decorations"],
    queryFn: async () => (await supabase.from("profile_decoration_items").select("*").order("rarity")).data ?? []
  });
  const refetch = () => qc.invalidateQueries({
    queryKey: ["admin", "decorations"]
  });
  const create = async () => {
    if (!form.name.trim()) return toast.error("Name required");
    const {
      data: row,
      error
    } = await supabase.from("profile_decoration_items").insert({
      ...form
    }).select().single();
    if (error) return toast.error(error.message);
    await logAdminAction({
      action: "decoration_created",
      target_type: "decoration",
      target_id: row.id
    });
    toast.success("Decoration created");
    setCreating(false);
    setForm({
      name: "",
      description: "",
      type: "border",
      rarity: "common",
      point_cost: 100,
      gold_only: false,
      creator_only: false
    });
    refetch();
  };
  const toggle = async (d) => {
    const {
      error
    } = await supabase.from("profile_decoration_items").update({
      enabled: !d.enabled
    }).eq("id", d.id);
    if (error) return toast.error(error.message);
    await logAdminAction({
      action: d.enabled ? "decoration_disabled" : "decoration_enabled",
      target_type: "decoration",
      target_id: d.id
    });
    refetch();
  };
  const remove = async (d) => {
    if (!confirm(`Delete "${d.name}"?`)) return;
    const {
      error
    } = await supabase.from("profile_decoration_items").delete().eq("id", d.id);
    if (error) return toast.error(error.message);
    await logAdminAction({
      action: "decoration_deleted",
      target_type: "decoration",
      target_id: d.id
    });
    toast.success("Deleted");
    refetch();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminShell, { title: "Profile Decorations", subtitle: "Borders, frames, glows, banners, badges.", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl liquid-glass border border-white/10 p-4", children: !creating ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setCreating(true), className: "w-full px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 glow-gold", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4" }),
      " New decoration"
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: form.name, onChange: (e) => setForm({
        ...form,
        name: e.target.value
      }), placeholder: "Name", className: "w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm outline-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: form.description, onChange: (e) => setForm({
        ...form,
        description: e.target.value
      }), placeholder: "Description", className: "w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm outline-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: form.type, onChange: (e) => setForm({
          ...form,
          type: e.target.value
        }), className: "px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm outline-none", children: TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t, children: t }, t)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: form.rarity, onChange: (e) => setForm({
          ...form,
          rarity: e.target.value
        }), className: "px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm outline-none", children: RARITIES.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: r, children: r }, r)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", value: form.point_cost, onChange: (e) => setForm({
          ...form,
          point_cost: Number(e.target.value)
        }), placeholder: "Cost", className: "px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm outline-none" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: form.gold_only, onChange: (e) => setForm({
            ...form,
            gold_only: e.target.checked
          }) }),
          " Gold only"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: form.creator_only, onChange: (e) => setForm({
            ...form,
            creator_only: e.target.checked
          }) }),
          " Creator only"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: create, className: "flex-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm glow-gold", children: "Create" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setCreating(false), className: "px-4 py-2 rounded-xl glass border border-white/10 text-sm", children: "Cancel" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-3", children: [
      (data?.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-full text-center text-sm text-muted-foreground p-6", children: "No decorations yet." }),
      (data ?? []).map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-2xl liquid-glass border border-white/10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Palette, { className: "size-4 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.25em] text-primary uppercase", children: d.rarity }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto text-xs font-bold text-primary", children: [
            d.point_cost,
            " pts"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold", children: d.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground line-clamp-2", children: d.description }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-1 mt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10", children: d.type }),
          d.gold_only && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-2 py-0.5 rounded bg-primary/15 text-primary", children: "gold" }),
          d.creator_only && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-2 py-0.5 rounded bg-primary/15 text-primary", children: "creator" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toggle(d), className: `flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold border ${d.enabled ? "border-emerald-400/40 text-emerald-300" : "border-white/10 text-muted-foreground"}`, children: d.enabled ? "Enabled" : "Disabled" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => remove(d), className: "size-8 grid place-items-center rounded-lg glass border border-rose-400/40 text-rose-300", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" }) })
        ] })
      ] }, d.id))
    ] })
  ] });
}
export {
  Decorations as component
};

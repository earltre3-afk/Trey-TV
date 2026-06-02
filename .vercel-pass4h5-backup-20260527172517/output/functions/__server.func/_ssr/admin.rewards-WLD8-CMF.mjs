import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { A as AdminShell } from "./AdminShell-DTn6ktTs.mjs";
import { b as useAuth$1, s as supabase } from "./router-BtgGywEC.mjs";
import { a as useQueryClient, b as useQuery } from "../_libs/tanstack__react-query.mjs";
import { l as logAdminAction } from "./admin-api-D2pvH5CQ.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { x as Gift, P as Plus, k as Check, X } from "../_libs/lucide-react.mjs";
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
function Rewards() {
  const {
    isAdmin
  } = useAuth$1();
  const qc = useQueryClient();
  const [creating, setCreating] = reactExports.useState(false);
  const [form, setForm] = reactExports.useState({
    action_key: "",
    description: "",
    points: 10,
    daily_cap: 0,
    lifetime_cap: 0
  });
  if (!isAdmin) return null;
  const {
    data: rules
  } = useQuery({
    queryKey: ["admin", "reward-rules"],
    queryFn: async () => (await supabase.from("reward_rules").select("*").order("action_key")).data ?? []
  });
  const {
    data: redemptions
  } = useQuery({
    queryKey: ["admin", "redemptions"],
    queryFn: async () => (await supabase.from("reward_redemptions").select("*").order("created_at", {
      ascending: false
    }).limit(100)).data ?? []
  });
  const refetchRules = () => qc.invalidateQueries({
    queryKey: ["admin", "reward-rules"]
  });
  const refetchRedeem = () => qc.invalidateQueries({
    queryKey: ["admin", "redemptions"]
  });
  const createRule = async () => {
    if (!form.action_key.trim()) return toast.error("Action key required");
    const payload = {
      action_key: form.action_key,
      description: form.description,
      points: form.points
    };
    if (form.daily_cap > 0) payload.daily_cap = form.daily_cap;
    if (form.lifetime_cap > 0) payload.lifetime_cap = form.lifetime_cap;
    const {
      data: row,
      error
    } = await supabase.from("reward_rules").insert(payload).select().single();
    if (error) return toast.error(error.message);
    await logAdminAction({
      action: "reward_rule_created",
      target_type: "reward_rule",
      target_id: row.id
    });
    toast.success("Rule created");
    setCreating(false);
    setForm({
      action_key: "",
      description: "",
      points: 10,
      daily_cap: 0,
      lifetime_cap: 0
    });
    refetchRules();
  };
  const toggleRule = async (r) => {
    const {
      error
    } = await supabase.from("reward_rules").update({
      enabled: !r.enabled
    }).eq("id", r.id);
    if (error) return toast.error(error.message);
    await logAdminAction({
      action: r.enabled ? "reward_rule_disabled" : "reward_rule_enabled",
      target_type: "reward_rule",
      target_id: r.id
    });
    refetchRules();
  };
  const updatePoints = async (r) => {
    const v = prompt("New point value:", String(r.points));
    if (v === null) return;
    const points = Number(v);
    if (Number.isNaN(points)) return toast.error("Invalid number");
    const {
      error
    } = await supabase.from("reward_rules").update({
      points
    }).eq("id", r.id);
    if (error) return toast.error(error.message);
    await logAdminAction({
      action: "reward_rule_updated",
      target_type: "reward_rule",
      target_id: r.id,
      metadata: {
        points
      }
    });
    refetchRules();
  };
  const reviewRedeem = async (r, status) => {
    const reason = status === "rejected" ? prompt("Rejection reason:") ?? "" : "";
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    const {
      error
    } = await supabase.from("reward_redemptions").update({
      status,
      reviewed_at: (/* @__PURE__ */ new Date()).toISOString(),
      reviewed_by: user?.id
    }).eq("id", r.id);
    if (error) return toast.error(error.message);
    if (status === "rejected") {
      await supabase.from("reward_ledger").insert({
        user_id: r.user_id,
        action_key: "redeem_refund",
        points: r.points_spent,
        source_type: "redemption",
        source_id: r.id,
        reason: "Rejected"
      });
    }
    await logAdminAction({
      action: `redemption_${status}`,
      target_type: "redemption",
      target_id: r.id,
      reason
    });
    toast.success(`Redemption ${status}`);
    refetchRedeem();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminShell, { title: "Rewards Control", subtitle: "Earning rules and redemption review.", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl liquid-glass border border-white/10 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-bold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "size-4 text-primary" }),
          " Earning rules"
        ] }),
        !creating && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setCreating(true), className: "px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground glow-gold flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-3" }),
          " New"
        ] })
      ] }),
      creating && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl glass border border-white/10 p-3 mb-3 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: form.action_key, onChange: (e) => setForm({
          ...form,
          action_key: e.target.value
        }), placeholder: "action_key (e.g. daily_login)", className: "w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm outline-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: form.description, onChange: (e) => setForm({
          ...form,
          description: e.target.value
        }), placeholder: "Description", className: "w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm outline-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", value: form.points, onChange: (e) => setForm({
            ...form,
            points: Number(e.target.value)
          }), placeholder: "Points", className: "px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm outline-none" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", value: form.daily_cap, onChange: (e) => setForm({
            ...form,
            daily_cap: Number(e.target.value)
          }), placeholder: "Daily cap", className: "px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm outline-none" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", value: form.lifetime_cap, onChange: (e) => setForm({
            ...form,
            lifetime_cap: Number(e.target.value)
          }), placeholder: "Lifetime cap", className: "px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm outline-none" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: createRule, className: "flex-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm glow-gold", children: "Create" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setCreating(false), className: "px-4 py-2 rounded-xl glass border border-white/10 text-sm", children: "Cancel" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        (rules ?? []).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-2xl glass border border-white/10 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold truncate", children: r.action_key }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground line-clamp-1", children: r.description })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => updatePoints(r), className: "text-xs font-bold text-primary px-2 py-1 rounded-lg hover:bg-primary/10", children: [
            "+",
            r.points,
            " pts"
          ] }),
          r.daily_cap && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
            "cap ",
            r.daily_cap,
            "/d"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toggleRule(r), className: `text-[10px] px-2 py-1 rounded ${r.enabled ? "bg-primary/15 text-primary" : "bg-white/5 text-muted-foreground"}`, children: r.enabled ? "ON" : "OFF" })
        ] }, r.id)),
        (rules?.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground text-center p-4", children: "No rules yet." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl liquid-glass border border-white/10 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold mb-3", children: "Redemption queue" }),
      (redemptions?.length ?? 0) === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground text-center p-6", children: "No redemptions yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: redemptions.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-2xl glass border border-white/10 flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold truncate", children: r.redemption_type }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: new Date(r.created_at).toLocaleString() })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-bold text-primary", children: [
          "−",
          r.points_spent,
          " pts"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground capitalize", children: r.status }),
        r.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => reviewRedeem(r, "fulfilled"), className: "size-8 rounded-lg bg-primary/15 text-primary border border-primary/40 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => reviewRedeem(r, "rejected"), className: "size-8 rounded-lg glass border border-rose-400/40 text-rose-300 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" }) })
        ] })
      ] }, r.id)) })
    ] })
  ] });
}
export {
  Rewards as component
};

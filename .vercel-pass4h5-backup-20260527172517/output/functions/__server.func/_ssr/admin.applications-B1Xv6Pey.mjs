import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { A as AdminShell } from "./AdminShell-DTn6ktTs.mjs";
import { b as useAuth$1, X as treyIGenerate, s as supabase } from "./router-BtgGywEC.mjs";
import { a as useQueryClient, b as useQuery } from "../_libs/tanstack__react-query.mjs";
import { l as logAdminAction } from "./admin-api-D2pvH5CQ.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { t as Crown, S as Sparkles, k as Check, X } from "../_libs/lucide-react.mjs";
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
const supabaseAny = supabase;
function Applications() {
  const {
    isAdmin
  } = useAuth$1();
  const qc = useQueryClient();
  const [aiSummaries, setAiSummaries] = reactExports.useState({});
  const [summarizing, setSummarizing] = reactExports.useState({});
  if (!isAdmin) return null;
  const {
    data
  } = useQuery({
    queryKey: ["admin", "creator-apps"],
    queryFn: async () => {
      const {
        data: data2
      } = await supabaseAny.from("creator_applications").select("*, profiles(uid)").eq("application_type", "creator").order("created_at", {
        ascending: false
      });
      return data2 ?? [];
    }
  });
  const review = async (id, userId, status) => {
    const reason = status !== "approved" ? prompt("Reason / notes:") ?? "" : "";
    const {
      error
    } = await supabase.from("creator_applications").update({
      status,
      review_notes: reason,
      reviewed_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", id);
    if (error) return toast.error(error.message);
    if (status === "approved") {
      await supabase.from("profiles").update({
        creator_status: "approved"
      }).eq("id", userId);
    } else if (status === "rejected") {
      await supabase.from("profiles").update({
        creator_status: "rejected"
      }).eq("id", userId);
    }
    await logAdminAction({
      action: `creator_application_${status}`,
      target_type: "creator_application",
      target_id: id,
      reason
    });
    toast.success(`Application ${status}`);
    qc.invalidateQueries({
      queryKey: ["admin", "creator-apps"]
    });
  };
  const summarize = async (app) => {
    setSummarizing((prev) => ({
      ...prev,
      [app.id]: true
    }));
    try {
      const prompt2 = `User ${app.user_id} applied for creator status.
Niche: ${app.niche}
Bio: ${app.bio}
Reason: ${app.reason}
Links: ${app.social_links?.join(", ") ?? "None"}`;
      const res = await treyIGenerate({
        data: {
          task: "admin_summary",
          prompt: prompt2
        }
      });
      if ("error" in res) throw new Error(res.error);
      if ("text" in res) {
        setAiSummaries((prev) => ({
          ...prev,
          [app.id]: res.text
        }));
      }
    } catch (err) {
      console.error(err);
      toast.error("AI summary failed");
    }
    setSummarizing((prev) => ({
      ...prev,
      [app.id]: false
    }));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AdminShell, { title: "Creator Applications", subtitle: "Approve, reject, or request more info.", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: (data?.length ?? 0) === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl liquid-glass border border-white/10 p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "size-6 text-muted-foreground" }),
    "No pending applications."
  ] }) : data.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 rounded-2xl liquid-glass border border-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.25em] text-primary", children: a.status.toUpperCase() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground", children: new Date(a.created_at).toLocaleDateString() })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-bold mt-1 truncate", children: [
        "User ",
        a.profiles?.uid || a.user_id.slice(0, 8),
        "…"
      ] }),
      a.niche && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
        "Niche: ",
        a.niche
      ] }),
      a.bio && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-foreground/80 mt-1 line-clamp-2", children: a.bio }),
      a.reason && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-1 italic", children: [
        '"',
        a.reason,
        '"'
      ] }),
      aiSummaries[a.id] && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 rounded-xl bg-[oklch(0.82_0.15_215/0.1)] border border-[oklch(0.82_0.15_215/0.3)] p-3 text-xs text-[oklch(0.82_0.15_215)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold flex items-center gap-1 mb-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-3" }),
          " AI Summary"
        ] }),
        aiSummaries[a.id]
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => summarize(a), disabled: summarizing[a.id], className: "text-[10px] px-2 py-1 rounded border border-white/10 bg-white/5 hover:bg-white/10 flex items-center gap-1 disabled:opacity-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-3" }),
        " ",
        summarizing[a.id] ? "Summarizing..." : "AI Summarize"
      ] }) })
    ] }),
    a.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => review(a.id, a.user_id, "approved"), className: "size-9 rounded-xl bg-primary/15 text-primary border border-primary/40 grid place-items-center hover:bg-primary/25", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => review(a.id, a.user_id, "rejected"), className: "size-9 rounded-xl bg-[oklch(0.65_0.24_15_/_0.15)] text-[oklch(0.65_0.24_15)] border border-[oklch(0.65_0.24_15_/_0.4)] grid place-items-center hover:bg-[oklch(0.65_0.24_15_/_0.25)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" }) })
    ] })
  ] }) }, a.id)) }) });
}
export {
  Applications as component
};

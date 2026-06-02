import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { A as AdminShell } from "./AdminShell-DTn6ktTs.mjs";
import { b as useAuth$1, s as supabase } from "./router-BtgGywEC.mjs";
import { a as useQueryClient, b as useQuery } from "../_libs/tanstack__react-query.mjs";
import { l as logAdminAction } from "./admin-api-D2pvH5CQ.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { as as BadgeCheck, k as Check, X } from "../_libs/lucide-react.mjs";
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
function verificationLinks(data) {
  return [data?.link_website, data?.link_instagram, data?.link_tiktok, data?.link_youtube, data?.link_spotify, data?.link_apple_music, data?.link_imdb, data?.link_linkedin, data?.link_press_1, data?.link_press_2, data?.link_press_3, data?.link_other].filter(Boolean);
}
function Verification() {
  const {
    isAdmin
  } = useAuth$1();
  const qc = useQueryClient();
  if (!isAdmin) return null;
  const {
    data
  } = useQuery({
    queryKey: ["admin", "verification-apps"],
    queryFn: async () => {
      const {
        data: data2
      } = await supabaseAny.from("creator_applications").select("*").eq("application_type", "verification").order("created_at", {
        ascending: false
      });
      return data2 ?? [];
    }
  });
  const review = async (id, userId, category, status) => {
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
        gold_verified: true,
        gold_verified_at: (/* @__PURE__ */ new Date()).toISOString(),
        verification_category: category
      }).eq("id", userId);
    }
    await logAdminAction({
      action: `verification_${status}`,
      target_type: "verification_application",
      target_id: id,
      reason
    });
    toast.success(`Verification ${status}`);
    qc.invalidateQueries({
      queryKey: ["admin", "verification-apps"]
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AdminShell, { title: "Gold Verification Review", subtitle: "Notable people, creators, businesses, and public figures.", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: (data?.length ?? 0) === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl liquid-glass border border-white/10 p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "size-6 text-primary" }),
    "No pending verification applications."
  ] }) : data.map((a) => {
    const v = a.verification_data ?? {};
    const category = v.applying_as ?? v.profile_title ?? "verification";
    const links = verificationLinks(v);
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 rounded-2xl liquid-glass border border-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] tracking-[0.25em] text-primary", children: [
            a.status.toUpperCase(),
            " - ",
            category
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground", children: new Date(a.created_at).toLocaleDateString() })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold mt-1 truncate", children: v.display_name || `User ${a.user_id.slice(0, 8)}...` }),
        v.recognition_description && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-foreground/80 mt-1", children: v.recognition_description }),
        v.why_gold_badge && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-1 italic", children: [
          '"',
          v.why_gold_badge,
          '"'
        ] }),
        links.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground mt-2 space-y-0.5", children: links.slice(0, 3).map((l, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: l, target: "_blank", rel: "noreferrer", className: "block truncate hover:text-primary", children: l }, i)) })
      ] }),
      a.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => review(a.id, a.user_id, category, "approved"), className: "size-9 rounded-xl bg-primary/15 text-primary border border-primary/40 grid place-items-center hover:bg-primary/25", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => review(a.id, a.user_id, category, "rejected"), className: "size-9 rounded-xl bg-[oklch(0.65_0.24_15_/_0.15)] text-[oklch(0.65_0.24_15)] border border-[oklch(0.65_0.24_15_/_0.4)] grid place-items-center hover:bg-[oklch(0.65_0.24_15_/_0.25)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" }) })
      ] })
    ] }) }, a.id);
  }) }) });
}
export {
  Verification as component
};

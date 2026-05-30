import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { b as useQuery } from "../_libs/tanstack__react-query.mjs";
import { b as useAuth$1, s as supabase } from "./router-BtgGywEC.mjs";
import { L as Logo } from "./Logo-D0JEzEf4.mjs";
import "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { A as ArrowLeft, r as ChevronRight, p as Shield, t as Crown, ay as CircleAlert, bs as CircleX, ax as CircleCheck, a9 as Clock, bt as FilePen, O as Search, aE as Info } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
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
import "./trey-tv-logo-CG7PjBoN.mjs";
const STATUS_CFG = {
  draft: {
    label: "Draft",
    color: "text-muted-foreground",
    bg: "bg-white/5",
    border: "border-white/20",
    icon: FilePen,
    borderCard: "border-white/10"
  },
  pending: {
    label: "Under Review",
    color: "text-[oklch(0.82_0.15_215)]",
    bg: "bg-[oklch(0.82_0.15_215_/_0.1)]",
    border: "border-[oklch(0.82_0.15_215_/_0.5)]",
    icon: Clock,
    borderCard: "border-[oklch(0.82_0.15_215_/_0.3)]"
  },
  approved: {
    label: "Approved",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/50",
    icon: CircleCheck,
    borderCard: "border-primary/30"
  },
  rejected: {
    label: "Not Approved",
    color: "text-[oklch(0.65_0.24_15)]",
    bg: "bg-[oklch(0.65_0.24_15_/_0.1)]",
    border: "border-[oklch(0.65_0.24_15_/_0.5)]",
    icon: CircleX,
    borderCard: "border-[oklch(0.65_0.24_15_/_0.25)]"
  },
  needs_more_info: {
    label: "More Info Needed",
    color: "text-[oklch(0.9_0.18_85)]",
    bg: "bg-[oklch(0.82_0.16_85_/_0.1)]",
    border: "border-[oklch(0.82_0.16_85_/_0.5)]",
    icon: CircleAlert,
    borderCard: "border-[oklch(0.82_0.16_85_/_0.3)]"
  }
};
function StatusBadge({
  status
}) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.pending;
  const Icon = cfg.icon;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${cfg.color} ${cfg.bg} border ${cfg.border}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-3" }),
    " ",
    cfg.label.toUpperCase()
  ] });
}
const VERIF_TIMELINE = [{
  key: "submitted",
  label: "Submitted",
  Icon: FilePen
}, {
  key: "pending",
  label: "Under Review",
  Icon: Search
}, {
  key: "needs_more_info",
  label: "More Info\nNeeded",
  Icon: Info
}, {
  key: "approved",
  label: "Approved",
  Icon: Shield
}, {
  key: "rejected",
  label: "Denied",
  Icon: CircleX
}];
const STATUS_TIMELINE_INDEX = {
  pending: 1,
  needs_more_info: 2,
  approved: 3,
  rejected: 4
};
function VerificationStatusTimeline({
  status
}) {
  const activeIdx = STATUS_TIMELINE_INDEX[status] ?? 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start pt-2", children: VERIF_TIMELINE.map((s, i) => {
    const isActive = i === activeIdx;
    const isDone = i < activeIdx;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `size-11 rounded-full border-2 grid place-items-center transition-all ${isActive ? "border-primary bg-primary/20 shadow-[0_0_16px_oklch(0.82_0.16_85_/_0.7)]" : isDone ? "border-[oklch(0.82_0.15_215)] bg-[oklch(0.82_0.15_215_/_0.2)]" : "border-white/15 bg-white/5"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(s.Icon, { className: `size-4 ${isActive ? "text-primary" : isDone ? "text-[oklch(0.82_0.15_215)]" : "text-muted-foreground"}` }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-[9px] text-center mt-1.5 leading-tight whitespace-pre-line font-medium ${isActive ? "text-primary" : isDone ? "text-[oklch(0.82_0.15_215)]" : "text-muted-foreground"}`, children: s.label })
      ] }),
      i < VERIF_TIMELINE.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px w-3 mt-5 shrink-0", style: {
        background: isDone ? "oklch(0.82 0.15 215)" : "oklch(1 0 0 / 0.1)"
      } })
    ] }, s.key);
  }) });
}
function VerificationCard({
  app,
  userAvatar,
  userName,
  userHandle
}) {
  const navigate = useNavigate();
  const cfg = STATUS_CFG[app.status] ?? STATUS_CFG.pending;
  const vData = app.verification_data;
  const displayName = vData?.display_name || userName;
  const handle = displayName ? `@${displayName.toLowerCase().replace(/\s+/g, "")}` : `@${userHandle}`;
  const profession = vData?.profile_title || vData?.applying_as || "";
  const submittedDate = new Date(app.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
  const updatedDate = app.updated_at ? new Date(app.updated_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }) : submittedDate;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl overflow-hidden border", style: {
    borderColor: "oklch(0.82 0.16 85 / 0.35)",
    background: "radial-gradient(ellipse 100% 60% at 50% 0%, oklch(0.18 0.07 85 / 0.4) 0%, oklch(0.10 0.03 85 / 0.8) 100%)"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center pt-5 pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "h-10 drop-shadow-[0_0_16px_oklch(0.82_0.16_85_/_0.7)]" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center pb-4 px-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-extrabold", children: [
        "Verification",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-transparent bg-clip-text bg-gradient-to-r from-primary via-[oklch(0.92_0.18_85)] to-primary", children: "Request Status" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Track your verification request." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-5 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-[oklch(0.82_0.16_85_/_0.4)] bg-[oklch(0.10_0.04_85_/_0.6)] p-3 flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: userAvatar, alt: "", className: "size-14 rounded-full object-cover border-2 border-primary shadow-[0_0_16px_oklch(0.82_0.16_85_/_0.5)]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-0.5 -right-0.5 size-5 rounded-full bg-primary border-2 border-[#02050B] grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "size-2.5 text-black", strokeWidth: 3 }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold truncate", children: displayName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: handle }),
          profession && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-primary mt-0.5", children: profession })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-[oklch(0.82_0.16_85_/_0.3)] bg-[oklch(0.10_0.04_85_/_0.5)] p-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-10 rounded-2xl border border-primary/40 bg-primary/15 grid place-items-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FilePen, { className: "size-5 text-primary" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-bold", children: [
              "Current Status:",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: STATUS_CFG[app.status]?.label ?? "Submitted" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "📅" }),
              " Submitted on ",
              submittedDate
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "size-3" }),
              " Last updated ",
              updatedDate
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px bg-white/5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VerificationStatusTimeline, { status: app.status })
      ] }),
      app.review_notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-2xl border p-3 ${cfg.bg} ${cfg.borderCard}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mb-1", children: "From our review team:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `text-xs italic leading-relaxed ${cfg.color}`, children: [
          '"',
          app.review_notes,
          '"'
        ] })
      ] }),
      (app.status === "draft" || app.status === "needs_more_info") && /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/apply/go-verification", className: "flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-sm text-black", style: {
        background: "linear-gradient(90deg, oklch(0.65_0.20_75), oklch(0.80_0.22_80))",
        boxShadow: "0 0 24px oklch(0.82 0.16 85 / 0.5)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FilePen, { className: "size-4" }),
        app.status === "draft" ? "Continue Application" : "Update & Resubmit"
      ] }),
      app.status === "approved" && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => navigate({
        to: "/"
      }), className: "w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2", style: {
        background: "linear-gradient(90deg, oklch(0.65_0.20_75), oklch(0.80_0.22_80))",
        boxShadow: "0 0 24px oklch(0.82 0.16 85 / 0.5)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "size-4 text-black" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-black", children: "Back to Trey TV" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => navigate({
        to: "/"
      }), className: "w-full py-3.5 rounded-2xl font-semibold text-sm border border-[oklch(0.82_0.15_215_/_0.4)] text-foreground flex items-center justify-center gap-2", style: {
        background: "oklch(0.15 0.06 215 / 0.5)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }),
        " Back to Profile"
      ] })
    ] })
  ] });
}
function CreatorCard({
  app
}) {
  useNavigate();
  const cfg = STATUS_CFG[app.status] ?? STATUS_CFG.pending;
  const title = app.channel_name || app.creator_name || "Creator Application";
  const sub = app.niche ? `Creator · ${app.niche}` : "Creator Application";
  const date = new Date(app.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-3xl liquid-glass border ${cfg.borderCard} p-5 space-y-4`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `size-11 rounded-2xl ${cfg.bg} border ${cfg.border} grid place-items-center shrink-0`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: `size-5 ${cfg.color}` }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-base truncate", children: title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-0.5", children: sub })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: app.status })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-2", children: [
          "Submitted ",
          date
        ] })
      ] })
    ] }),
    app.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl bg-[oklch(0.82_0.15_215_/_0.08)] border border-[oklch(0.82_0.15_215_/_0.2)] p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[oklch(0.82_0.15_215)] leading-relaxed", children: "Your application is in the queue. Our team reviews within 3–5 business days and will notify you by email and in-app." }) }),
    app.status === "approved" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl bg-primary/8 border border-primary/20 p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-primary font-medium leading-relaxed", children: "🎉 Congratulations! Your creator application has been approved. Welcome to the creator family." }) }),
    (app.status === "rejected" || app.status === "needs_more_info") && app.review_notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-2xl ${cfg.bg} border ${cfg.borderCard} p-3`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mb-1", children: "Feedback from our team:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `text-xs italic leading-relaxed ${cfg.color}`, children: [
        '"',
        app.review_notes,
        '"'
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      (app.status === "draft" || app.status === "needs_more_info") && /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/apply/content-creator", className: "flex-1 py-2.5 rounded-2xl bg-primary/15 border border-primary/40 text-primary text-xs font-bold text-center hover:bg-primary/25 transition flex items-center justify-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FilePen, { className: "size-3.5" }),
        app.status === "draft" ? "Continue Application" : "Update & Resubmit"
      ] }),
      app.status === "approved" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/creator-hub", className: "flex-1 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-bold text-center glow-gold hover-scale flex items-center justify-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "size-3.5" }),
        " Go to Creator Hub"
      ] })
    ] })
  ] });
}
function ApplicationsPage() {
  const {
    isGuest,
    user
  } = useAuth$1();
  const navigate = useNavigate();
  reactExports.useEffect(() => {
    if (isGuest) {
      try {
        sessionStorage.setItem("treytv_post_auth_redirect", "/applications");
      } catch {
      }
      navigate({
        to: "/login"
      });
    }
  }, [isGuest, navigate]);
  const {
    data: apps = [],
    isLoading
  } = useQuery({
    queryKey: ["my-applications"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("creator_applications").select("id, application_type, status, creator_name, channel_name, niche, review_notes, created_at, updated_at, verification_data").order("created_at", {
        ascending: false
      });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !isGuest
  });
  if (isGuest) return null;
  const userAvatar = user?.avatar ?? "";
  const userName = user?.name ?? "";
  const userHandle = user?.handle ?? "";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[#02050B] flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center gap-3 px-5 pt-[env(safe-area-inset-top)] pb-3 border-b border-white/5 sticky top-0 z-30 bg-[#02050B]/90 backdrop-blur-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate({
        to: "/"
      }), className: "size-9 grid place-items-center rounded-xl glass text-muted-foreground hover:text-foreground transition", "aria-label": "Go back", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "flex-1 text-center text-sm font-bold", children: "My Applications" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/apply", className: "size-9 grid place-items-center rounded-xl glass text-muted-foreground hover:text-primary transition", title: "New application", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 px-4 py-6 max-w-lg mx-auto w-full space-y-4", children: [
      isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3 py-16 text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "size-8 animate-pulse" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Loading applications…" })
      ] }),
      !isLoading && apps.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4 py-16 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-20 rounded-full bg-white/5 border border-white/10 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "size-9 text-muted-foreground" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold mb-1", children: "No Applications Yet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed", children: "Ready to share your voice with the world? Apply to create or request gold verification." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/apply", className: "mt-2 inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-black font-bold text-sm", style: {
          background: "linear-gradient(90deg, oklch(0.65_0.20_75), oklch(0.80_0.22_80))",
          boxShadow: "0 0 24px oklch(0.82 0.16 85 / 0.5)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "size-4" }),
          " Start an Application"
        ] })
      ] }),
      !isLoading && apps.map((app) => app.application_type === "verification" ? /* @__PURE__ */ jsxRuntimeExports.jsx(VerificationCard, { app, userAvatar, userName, userHandle }, app.id) : /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorCard, { app }, app.id))
    ] })
  ] });
}
export {
  ApplicationsPage as component
};

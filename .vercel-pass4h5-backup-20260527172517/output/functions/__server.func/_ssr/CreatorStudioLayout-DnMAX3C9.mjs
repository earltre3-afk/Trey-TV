import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, f as useLocation, L as Link } from "../_libs/tanstack__react-router.mjs";
import { A as AppShell } from "./AppShell-BWcCrjwR.mjs";
import { b as useAuth$1, k as currentUser } from "./router-BtgGywEC.mjs";
import { u as useCreatorStudio } from "./use-creator-studio-BkHsMg4r.mjs";
import { t as Crown, by as LayoutDashboard, an as Upload, b7 as Film, a5 as Users, aM as MessageSquare, c as ChartColumn, u as Gem, aY as Calendar, a2 as Tv, n as Settings, bP as TrendingDown, T as TrendingUp, i as Lock, S as Sparkles } from "../_libs/lucide-react.mjs";
const TONE = {
  gold: "from-[oklch(0.82_0.16_85_/_0.28)] to-transparent text-primary ring-primary/40",
  cyan: "from-[oklch(0.82_0.15_215_/_0.25)] to-transparent text-[oklch(0.82_0.15_215)] ring-[oklch(0.82_0.15_215_/_0.4)]",
  purple: "from-[oklch(0.65_0.22_300_/_0.25)] to-transparent text-[oklch(0.78_0.22_300)] ring-[oklch(0.65_0.22_300_/_0.4)]",
  magenta: "from-[oklch(0.7_0.25_340_/_0.25)] to-transparent text-[oklch(0.78_0.25_340)] ring-[oklch(0.7_0.25_340_/_0.4)]",
  green: "from-[oklch(0.78_0.18_150_/_0.22)] to-transparent text-[oklch(0.82_0.18_150)] ring-[oklch(0.78_0.18_150_/_0.4)]"
};
function CreatorMetricCard({
  label,
  value,
  delta,
  icon: Icon,
  tone = "gold",
  trend = "up",
  sub
}) {
  const TrendIcon = trend === "down" ? TrendingDown : TrendingUp;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative rounded-2xl p-4 glass ring-1 ${TONE[tone]} bg-gradient-to-br hover-lift overflow-hidden`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shimmer-sweep absolute inset-0 rounded-2xl pointer-events-none" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-start justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.2em] text-muted-foreground uppercase truncate", children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-2xl md:text-3xl font-bold tabular-nums", children: value }),
        delta && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `mt-1 text-xs flex items-center gap-1 ${trend === "down" ? "text-[oklch(0.78_0.24_15)]" : "text-[oklch(0.82_0.18_150)]"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendIcon, { className: "size-3" }),
          " ",
          delta
        ] }),
        sub && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-[11px] text-muted-foreground", children: sub })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-10 rounded-xl bg-white/10 grid place-items-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-5" }) })
    ] })
  ] });
}
function CreatorActionButton({
  icon: Icon,
  label,
  desc,
  to,
  onClick,
  accent = false
}) {
  const cls = `group relative rounded-2xl p-4 glass neon-border hover-lift tilt-press text-left overflow-hidden w-full ${accent ? "ring-1 ring-primary/40 glow-gold" : ""}`;
  const inner = /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-10 rounded-xl grid place-items-center bg-white/5 group-hover:scale-110 transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `size-5 ${accent ? "text-primary" : "text-foreground/80"}` }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-sm font-semibold", children: label }),
    desc && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground mt-0.5", children: desc })
  ] });
  if (to) return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to, className: cls, children: inner });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick, className: cls, children: inner });
}
const STATUS_TONE = {
  approved: "bg-[oklch(0.78_0.18_150_/_0.18)] text-[oklch(0.82_0.18_150)] border-[oklch(0.78_0.18_150_/_0.4)]",
  pending: "bg-[oklch(0.82_0.16_85_/_0.18)] text-primary border-primary/40",
  rejected: "bg-[oklch(0.65_0.24_15_/_0.18)] text-[oklch(0.78_0.24_15)] border-[oklch(0.65_0.24_15_/_0.4)]",
  not_applied: "bg-white/10 text-muted-foreground border-white/15",
  live: "bg-[oklch(0.65_0.24_15_/_0.2)] text-[oklch(0.85_0.22_15)] border-[oklch(0.65_0.24_15_/_0.5)]"
};
function CreatorStatusBadge({ status, label }) {
  const tone = STATUS_TONE[status] ?? STATUS_TONE.not_applied;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 text-[10px] tracking-[0.18em] px-2 py-1 rounded-full border font-semibold uppercase ${tone}`, children: [
    status === "approved" && /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "size-3" }),
    label ?? status.replace("_", " ")
  ] });
}
function SectionHeader({
  icon: Icon,
  title,
  action
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3 px-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold flex items-center gap-2", children: [
      Icon && /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-4 text-primary" }),
      " ",
      title
    ] }),
    action
  ] });
}
const NAV = [
  { to: "/creator-studio", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { to: "/creator-studio/edit", icon: Upload, label: "Upload & Edit" },
  { to: "/creator-studio/submissions", icon: Film, label: "Content" },
  { to: "/creator-studio/fans", icon: Users, label: "Fans" },
  { to: "/creator-studio/interactions", icon: MessageSquare, label: "Interactions" },
  { to: "/creator-studio/analytics", icon: ChartColumn, label: "Analytics" },
  { to: "/creator-studio/rewards", icon: Gem, label: "Rewards" },
  { to: "/creator-studio/schedule", icon: Calendar, label: "Schedule" },
  { to: "/creator-studio/channel", icon: Tv, label: "Channel" },
  { to: "/creator-studio/settings", icon: Settings, label: "Settings" }
];
function CreatorStudioLayout({
  title,
  subtitle,
  actions,
  children
}) {
  const { isGuest, isAdmin, creatorStatus, user } = useAuth$1();
  const { isApprovedCreator } = useCreatorStudio();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  reactExports.useEffect(() => {
    if (isGuest && !isAdmin) navigate({ to: "/login" });
  }, [isGuest, isAdmin, navigate]);
  if (isGuest && !isAdmin) return null;
  if (!isAdmin && !isApprovedCreator) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { wide: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorGate, { status: creatorStatus }) });
  }
  const profile = user ?? currentUser;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { wide: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-3xl glass neon-border p-5 md:p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-20 -right-20 size-72 rounded-full bg-[radial-gradient(circle,oklch(0.82_0.16_85_/_0.35),transparent_70%)] blur-2xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-24 -left-12 size-72 rounded-full bg-[radial-gradient(circle,oklch(0.7_0.25_340_/_0.3),transparent_70%)] blur-2xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex flex-col md:flex-row md:items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative size-14 rounded-2xl conic-ring shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: profile.avatar, className: "size-full rounded-2xl object-cover", alt: "" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[10px] tracking-[0.3em] text-primary mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "size-3.5" }),
            " CREATOR STUDIO"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl md:text-3xl font-bold text-gradient-gold truncate", children: title }),
          subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: subtitle })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorStatusBadge, { status: "approved", label: "Approved Creator" }),
          isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorStatusBadge, { status: "approved", label: "Admin override" }),
          actions
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "rounded-2xl glass neon-border p-1.5 overflow-x-auto no-scrollbar", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1 min-w-max", children: NAV.map((n) => {
      const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: n.to,
          className: `group flex items-center gap-2 px-3 py-2 rounded-xl text-sm whitespace-nowrap transition ${active ? "bg-primary/15 text-primary ring-1 ring-primary/40 glow-gold font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(n.icon, { className: "size-4" }),
            n.label
          ]
        },
        n.to
      );
    }) }) }),
    children
  ] }) });
}
function CreatorGate({ status }) {
  const navigate = useNavigate();
  const copy = {
    not_applied: {
      title: "Creator Studio is for approved creators",
      body: "Apply to join the Trey TV network and unlock the upload, edit studio, analytics, fans, and rewards tools.",
      cta: "Apply to become a Creator",
      to: "/apply/content-creator"
    },
    pending: {
      title: "Your creator application is in review",
      body: "Our team is reviewing your channel. You'll be notified the moment you're approved — usually within 48 hours.",
      cta: "View application status",
      to: "/apply/content-creator"
    },
    rejected: {
      title: "Your application needs updates",
      body: "We left feedback on your application. Update your channel details and submit again.",
      cta: "Update application",
      to: "/apply/content-creator"
    },
    approved: { title: "", body: "", cta: "", to: "/" }
  };
  const c = copy[status] ?? copy.not_applied;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid place-items-center min-h-[60vh] px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-md w-full rounded-3xl glass neon-border p-8 text-center overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-20 -right-20 size-56 rounded-full bg-[radial-gradient(circle,oklch(0.82_0.16_85_/_0.35),transparent_70%)] blur-2xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto size-16 rounded-2xl glass grid place-items-center glow-gold mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "size-7 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] tracking-[0.3em] text-primary mb-2 flex items-center justify-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "size-3.5" }),
        " CREATOR ACCESS"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-gradient-gold", children: c.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-2", children: c.body }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 inline-flex", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorStatusBadge, { status }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-col gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => navigate({ to: c.to }),
            className: "px-4 py-3 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold tilt-press",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "inline size-4 mr-1" }),
              " ",
              c.cta
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "px-4 py-3 rounded-xl text-sm font-semibold glass border border-white/10 hover:bg-white/5", children: "Back to Trey TV" })
      ] })
    ] })
  ] }) });
}
export {
  CreatorStudioLayout as C,
  SectionHeader as S,
  CreatorMetricCard as a,
  CreatorActionButton as b,
  CreatorStatusBadge as c
};

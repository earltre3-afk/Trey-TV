import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { A as AppShell } from "./AppShell-BWcCrjwR.mjs";
import { b as useAuth$1, a as useCurrentUser, u as useAuth, d as useRewards, R as REWARD_TIERS, e as creators, f as Coin, t as triggerCoinGift, r as recordUserTrace } from "./router-BtgGywEC.mjs";
import { u as useGoBack } from "./use-go-back-DIwqgoNo.mjs";
import { C as COIN_TIERS } from "./coin-tiers-5eGTJXk-.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { u as Gem, A as ArrowLeft, P as Plus, v as Copy, T as TrendingUp, w as Wallet, S as Sparkles, t as Crown, x as Gift, Z as Zap, y as ArrowUpRight, b as Heart } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "./Logo-D0JEzEf4.mjs";
import "./trey-tv-logo-CG7PjBoN.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
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
const perks = [{
  id: "p1",
  title: "Trey TV Pro · 1 month",
  cost: 2500,
  Icon: Crown
}, {
  id: "p2",
  title: "Aurora filter pack",
  cost: 600,
  Icon: Sparkles
}, {
  id: "p3",
  title: "Profile boost · 24h",
  cost: 900,
  Icon: Zap
}];
function Rewards() {
  const {
    user,
    isGuest
  } = useAuth$1();
  const currentUser = useCurrentUser();
  const {
    user: supabaseUser
  } = useAuth();
  if (isGuest) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { wide: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-20 rounded-full bg-primary/10 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Gem, { className: "size-10 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Trey TV Rewards" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground max-w-xs", children: "Sign in to view your wallet, earn points, and send gifts to creators." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/signup", className: "px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold glow-gold", children: "Create account" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "px-5 py-2.5 rounded-xl liquid-glass border border-white/15 font-semibold", children: "Log in" })
      ] })
    ] }) });
  }
  const {
    balance,
    tier,
    tierProgress,
    nextTier,
    nextTierAt,
    pointsToNextTier,
    lifetimeEarned,
    lifetimeSpent,
    streakDays,
    transactions,
    spend
  } = useRewards();
  const goBack = useGoBack("/");
  const [recipient, setRecipient] = reactExports.useState(null);
  const points = balance;
  const uid = currentUser?.uid ?? "0000000000000000";
  const saveRewardAction = async (input) => {
    if (!supabaseUser) return false;
    const result = await spend({
      points: input.points,
      eventType: input.type === "gift" ? "gift_sent" : "perk_redeemed",
      sourceType: input.type,
      sourceId: input.sourceId,
      metadata: {
        ...input.metadata,
        public_profile_uid: uid,
        source_id: input.sourceId
      }
    });
    if (!result.ok) {
      toast.error("Not enough rewards points");
      return false;
    }
    return true;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { wide: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: goBack, className: "size-9 grid place-items-center rounded-full liquid-glass border border-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.3em] text-primary", children: "REWARDS WALLET" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-bold", children: "Your Trey TV Rewards" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "size-9 grid place-items-center rounded-full liquid-glass border border-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group relative mx-auto w-full max-w-[520px] [perspective:1200px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_30%_20%,oklch(0.82_0.16_85_/_0.35),transparent_60%),radial-gradient(circle_at_70%_80%,oklch(0.7_0.25_340_/_0.35),transparent_60%)] blur-2xl opacity-80" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full rounded-3xl p-5 sm:p-6 overflow-hidden border border-primary/40 bg-[linear-gradient(135deg,oklch(0.22_0.08_85_/_0.9),oklch(0.14_0.05_60_/_0.95)_45%,oklch(0.18_0.08_300_/_0.9))] shadow-[0_30px_70px_-20px_oklch(0_0_0_/_0.85)] transition-transform duration-700 will-change-transform [transform-style:preserve-3d] group-hover:[transform:rotateX(6deg)_rotateY(-8deg)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_25%,oklch(1_0_0_/_0.18)_45%,transparent_60%)] translate-x-[-60%] group-hover:translate-x-[60%] transition-transform duration-[1400ms] ease-out" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "pointer-events-none absolute -inset-1 opacity-40 mix-blend-screen bg-[conic-gradient(from_120deg,oklch(0.82_0.16_85_/_0.5),oklch(0.7_0.25_340_/_0.5),oklch(0.65_0.22_300_/_0.5),oklch(0.82_0.15_215_/_0.5),oklch(0.82_0.16_85_/_0.5))] animate-conic-spin" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "pointer-events-none absolute -top-24 -right-20 size-64 rounded-full bg-primary/30 blur-3xl" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "pointer-events-none absolute -bottom-24 -left-20 size-64 rounded-full bg-[oklch(0.7_0.25_340_/_0.35)] blur-3xl" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "pointer-events-none absolute inset-0 opacity-[0.07] bg-[linear-gradient(oklch(1_0_0)_1px,transparent_1px),linear-gradient(90deg,oklch(1_0_0)_1px,transparent_1px)] bg-[size:22px_22px]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex flex-col gap-6 text-white [transform:translateZ(40px)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.35em] text-white/70", children: "TREY · TV" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-[11px] tracking-[0.28em] text-primary font-semibold drop-shadow-[0_0_8px_oklch(0.82_0.16_85_/_0.6)]", children: "REWARDS WALLET" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-11 rounded-md bg-[linear-gradient(135deg,oklch(0.88_0.16_85),oklch(0.6_0.15_55))] grid place-items-center shadow-[inset_0_1px_2px_oklch(1_0_0_/_0.6),0_4px_10px_oklch(0_0_0_/_0.4)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "size-8 rounded-sm border border-white/40 grid grid-cols-2 grid-rows-2 gap-px p-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-white/40" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-white/25" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-white/25" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-white/40" })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono text-sm sm:text-lg md:text-xl tracking-[0.22em] flex items-center gap-2 break-all", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-clip-text text-transparent bg-[linear-gradient(90deg,oklch(0.95_0.05_85),oklch(0.82_0.16_85),oklch(0.95_0.05_85))]", children: uid.replace(/(.{4})/g, "$1 ").trim() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
              navigator.clipboard?.writeText(uid);
              toast.success("UID copied");
            }, className: "text-white/70 hover:text-primary shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "size-3.5" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3 items-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] tracking-[0.22em] text-white/60", children: "MEMBER" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold uppercase tracking-wider truncate", children: user?.name ?? "Trey" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] tracking-[0.22em] text-white/60", children: "POINTS" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg sm:text-xl font-bold text-primary drop-shadow-[0_0_10px_oklch(0.82_0.16_85_/_0.8)]", children: points.toLocaleString() })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] tracking-[0.22em] text-white/60", children: "TIER" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base sm:text-lg font-bold bg-clip-text text-transparent bg-[linear-gradient(90deg,oklch(0.82_0.16_85),oklch(0.7_0.25_340))]", children: tier })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-[10px] tracking-[0.18em] text-white/65", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "LIFETIME EARNED ",
                lifetimeEarned.toLocaleString()
              ] }),
              nextTier ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                pointsToNextTier.toLocaleString(),
                " TO ",
                nextTier
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "TOP TIER" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 rounded-full bg-white/10 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full bg-[linear-gradient(90deg,oklch(0.78_0.18_150),oklch(0.82_0.16_85))]", style: {
              width: `${tierProgress}%`
            } }) })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-3", children: [{
      label: "Earned (30d)",
      value: `+${lifetimeEarned.toLocaleString()}`,
      Icon: TrendingUp,
      color: "oklch(0.78 0.18 150)"
    }, {
      label: "Spent (30d)",
      value: lifetimeSpent.toLocaleString(),
      Icon: Wallet,
      color: "oklch(0.7 0.25 340)"
    }, {
      label: "Streak",
      value: `${streakDays}d`,
      Icon: Sparkles,
      color: "oklch(0.82 0.16 85)"
    }].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl liquid-glass border border-white/10 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[10px] tracking-[0.2em] text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(s.Icon, { className: "size-3.5", style: {
          color: s.color
        } }),
        " ",
        s.label.toUpperCase()
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-lg font-bold", children: s.value })
    ] }, s.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl liquid-glass border border-white/10 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-bold flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "size-4 text-primary" }),
            " Member tiers"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Tiers are based on lifetime earned points, so Gold takes real time to reach." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-right text-xs text-muted-foreground", children: nextTierAt ? `${nextTierAt.toLocaleString()} pts unlocks ${nextTier}` : "Gold tier unlocked" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid md:grid-cols-4 gap-3", children: REWARD_TIERS.map((memberTier) => {
        const activeTier = tier === memberTier.id;
        const unlocked = lifetimeEarned >= memberTier.min;
        const colors = {
          WHITE: "oklch(0.92 0.02 250)",
          GREEN: "oklch(0.78 0.18 150)",
          RED: "oklch(0.65 0.24 15)",
          GOLD: "oklch(0.82 0.16 85)"
        };
        const color = colors[memberTier.id] ?? "oklch(0.82 0.16 85)";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-2xl border p-4 ${activeTier ? "bg-white/[0.06]" : "bg-white/[0.025]"} ${unlocked ? "border-white/15" : "border-white/5 opacity-70"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold", style: {
              color
            }, children: memberTier.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
              memberTier.min.toLocaleString(),
              "+"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground mt-1", children: memberTier.rank }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-3 space-y-1.5", children: memberTier.perks.map((perk) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "text-[11px] flex gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-3 shrink-0 mt-0.5", style: {
              color
            } }),
            " ",
            perk
          ] }, perk)) })
        ] }, memberTier.id);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl liquid-glass border border-white/10 p-5 relative overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "pointer-events-none absolute inset-0 admin-aurora opacity-40" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-bold flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "size-4 text-[oklch(0.7_0.25_340)]" }),
              " Send a coin gift"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/explore", className: "text-xs text-muted-foreground hover:text-foreground", children: "Find creators →" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 overflow-x-auto no-scrollbar pb-1", children: creators.slice(0, 5).map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setRecipient(c.handle ?? c.name), className: `shrink-0 flex flex-col items-center gap-1 w-16 transition ${recipient === (c.handle ?? c.name) ? "scale-105" : "opacity-80 hover:opacity-100"}`, style: {
            animation: `counter-up 0.4s ${i * 60}ms both`
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `size-12 rounded-full ${recipient === (c.handle ?? c.name) ? "conic-ring ring-neon-magenta" : "conic-ring"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: c.avatar, className: "size-full rounded-full object-cover", alt: "" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] truncate w-full text-center", children: c.name })
          ] }, c.id)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 grid grid-cols-5 gap-2", children: COIN_TIERS.map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: async () => {
            const saved = await saveRewardAction({
              type: "gift",
              points: t.cost,
              sourceId: recipient ?? "unselected",
              metadata: {
                gift: t.name,
                recipient
              }
            });
            if (!saved) return;
            triggerCoinGift(t, recipient ?? void 0);
            recordUserTrace({
              userUid: uid,
              action: "rewards.gift",
              targetType: "creator",
              targetId: recipient ?? "unselected",
              details: {
                gift: t.name,
                cost: t.cost
              }
            });
            toast.success(`${t.name} sent${recipient ? ` to @${recipient}` : ""} · −${t.cost} pts`);
          }, className: "group relative rounded-2xl liquid-glass border border-white/10 p-2.5 text-center hover-lift tilt-press", style: {
            animation: `counter-up 0.45s ${i * 70}ms both`
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid place-items-center mb-1 [perspective:600px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "transition-transform duration-500 group-hover:[transform:rotateY(180deg)] [transform-style:preserve-3d]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Coin, { tier: t, size: 42 }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold tracking-wider uppercase", children: t.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[9px] text-primary font-semibold", children: [
              t.cost.toLocaleString(),
              " pts"
            ] })
          ] }, t.id)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-[10px] text-muted-foreground text-center", children: "Tip: tap a creator above, then a coin to send a luxe gift burst." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl liquid-glass border border-white/10 p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-bold flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-4 text-primary" }),
            " Redeem perks"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/premium", className: "text-xs text-primary hover:underline", children: "Premium →" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: perks.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3 rounded-2xl glass border border-white/10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-10 rounded-xl grid place-items-center bg-primary/15 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(p.Icon, { className: "size-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: p.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
              p.cost.toLocaleString(),
              " pts"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: async () => {
            const saved = await saveRewardAction({
              type: "redeem",
              points: p.cost,
              sourceId: p.id,
              metadata: {
                title: p.title
              }
            });
            if (!saved) return;
            recordUserTrace({
              userUid: uid,
              action: "rewards.redeem",
              targetType: "perk",
              targetId: p.id,
              details: {
                title: p.title,
                cost: p.cost
              }
            });
            toast.success(`Redeemed: ${p.title}`);
          }, className: "px-3 h-8 rounded-lg text-xs font-semibold bg-primary text-primary-foreground glow-gold", children: "Redeem" })
        ] }, p.id)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl liquid-glass border border-white/10 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-bold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Gem, { className: "size-4 text-[oklch(0.82_0.15_215)]" }),
          " Reward history"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "text-xs text-muted-foreground hover:text-foreground", children: [
          "Export ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "inline size-3" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-white/5", children: transactions.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `size-8 rounded-lg grid place-items-center ${t.delta > 0 ? "bg-[oklch(0.78_0.18_150_/_0.15)] text-[oklch(0.78_0.18_150)]" : "bg-[oklch(0.7_0.25_340_/_0.15)] text-[oklch(0.7_0.25_340)]"}`, children: t.delta > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "size-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: t.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: t.when })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `font-mono text-sm font-bold ${t.delta > 0 ? "text-[oklch(0.78_0.18_150)]" : "text-[oklch(0.7_0.25_340)]"}`, children: [
          t.delta > 0 ? "+" : "",
          t.delta.toLocaleString()
        ] })
      ] }, t.id)) })
    ] })
  ] }) });
}
export {
  Rewards as component
};

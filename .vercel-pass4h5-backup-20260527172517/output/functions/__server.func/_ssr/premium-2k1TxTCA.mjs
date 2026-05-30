import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useGoBack } from "./use-go-back-DIwqgoNo.mjs";
import { A as AppShell } from "./AppShell-BWcCrjwR.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { A as ArrowLeft, u as Gem, S as Sparkles, Z as Zap, t as Crown, ai as Star, k as Check } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "./Logo-D0JEzEf4.mjs";
import "./trey-tv-logo-CG7PjBoN.mjs";
import "./router-BtgGywEC.mjs";
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
  icon: Sparkles,
  label: "Trey-I Pro: unlimited prescriptions, captions & remixes"
}, {
  icon: Zap,
  label: "Priority live streaming & 4K uploads"
}, {
  icon: Crown,
  label: "Verified Creator badge & profile glow"
}, {
  icon: Star,
  label: "Advanced analytics & growth coach"
}];
const tiers = [{
  name: "Monthly",
  price: "$9.99",
  period: "/mo",
  note: "Cancel anytime"
}, {
  name: "Annual",
  price: "$79",
  period: "/yr",
  note: "Save 34% · Most popular",
  featured: true
}, {
  name: "Founders",
  price: "$199",
  period: "/yr",
  note: "Lifetime perks · Limited"
}];
function Premium() {
  const goBack = useGoBack("/");
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 -mt-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: goBack, className: "inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }),
      " Back"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-3xl border border-[oklch(0.65_0.22_300_/_0.45)] p-6 lg:p-10 bg-[linear-gradient(135deg,oklch(0.25_0.1_300_/_0.6),oklch(0.18_0.05_270_/_0.6))] glow-purple", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "absolute -top-20 -right-20 size-72 rounded-full bg-[oklch(0.7_0.25_340_/_0.25)] blur-3xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "absolute -bottom-20 -left-20 size-72 rounded-full bg-primary/15 blur-3xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] tracking-[0.2em] uppercase border border-white/15 bg-white/5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Gem, { className: "size-3 text-[oklch(0.7_0.25_340)]" }),
          " Premium"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 text-3xl lg:text-5xl font-extrabold leading-tight bg-clip-text text-transparent bg-[linear-gradient(135deg,white,oklch(0.82_0.16_85),oklch(0.7_0.25_340))]", children: "Unlock the full Trey TV." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm text-muted-foreground max-w-prose", children: "Premium creators ship faster, look sharper, and grow louder. Get every Trey-I tool, deeper insights, and that signature glow." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "grid sm:grid-cols-2 gap-2", children: perks.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { style: {
      animationDelay: `${i * 60}ms`
    }, className: "animate-rise rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-9 grid place-items-center rounded-xl bg-primary/15 text-primary glow-gold", children: /* @__PURE__ */ jsxRuntimeExports.jsx(p.icon, { className: "size-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm", children: p.label })
    ] }, p.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-3 gap-3", children: tiers.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative rounded-2xl border p-4 ${t.featured ? "border-primary/50 bg-primary/5 glow-gold" : "border-white/10 glass"}`, children: [
      t.featured && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-2 left-3 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold", children: "BEST VALUE" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: t.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-baseline gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-bold", children: t.price }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: t.period })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground mt-1", children: t.note }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => toast.success(`${t.name} plan — added to checkout (demo)`), className: `mt-3 w-full py-2 rounded-xl text-sm font-semibold tilt-press ${t.featured ? "bg-primary text-primary-foreground" : "border border-white/15 hover:bg-white/5"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "inline size-4 mr-1" }),
        " Choose"
      ] })
    ] }, t.name)) })
  ] }) });
}
export {
  Premium as component
};

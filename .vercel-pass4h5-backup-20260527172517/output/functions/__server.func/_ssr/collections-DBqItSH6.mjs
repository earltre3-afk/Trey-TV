import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useGoBack } from "./use-go-back-DIwqgoNo.mjs";
import { A as AppShell } from "./AppShell-BWcCrjwR.mjs";
import { w as prescribed } from "./router-BtgGywEC.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { A as ArrowLeft, P as Plus, a8 as Bookmark, bq as Folder, i as Lock, a4 as Play } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__react-router.mjs";
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
const collections = [{
  name: "Late Night Vibes",
  count: 24,
  tint: "from-[oklch(0.25_0.1_300_/_0.6)] to-[oklch(0.18_0.05_270_/_0.4)]",
  private: false
}, {
  name: "Workout Fuel",
  count: 18,
  tint: "from-[oklch(0.25_0.12_85_/_0.5)] to-[oklch(0.18_0.05_60_/_0.4)]",
  private: false
}, {
  name: "Saved for later",
  count: 47,
  tint: "from-[oklch(0.22_0.08_215_/_0.55)] to-[oklch(0.18_0.05_240_/_0.4)]",
  private: true
}, {
  name: "Inspiration board",
  count: 9,
  tint: "from-[oklch(0.25_0.12_340_/_0.5)] to-[oklch(0.18_0.05_320_/_0.4)]",
  private: false
}];
function Collections() {
  const goBack = useGoBack("/");
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 -mt-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: goBack, className: "inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }),
        " Back"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => toast.success("New collection"), className: "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border border-primary/40 text-primary glow-gold tilt-press", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4" }),
        " New"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-3xl glass-strong border border-white/10 p-5 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "absolute -top-16 -right-16 size-56 rounded-full bg-primary/15 blur-3xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-12 grid place-items-center rounded-2xl bg-primary/15 text-primary glow-gold", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bookmark, { className: "size-6" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Your Collections" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Curated stacks of saved posts, episodes and prescriptions." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: collections.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => toast(`Opening "${c.name}"`), style: {
      animationDelay: `${i * 60}ms`
    }, className: `animate-rise relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 text-left p-3 bg-gradient-to-br ${c.tint} hover-lift`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Folder, { className: "size-6 text-white/80" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-3 left-3 right-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-semibold flex items-center gap-1", children: [
          c.name,
          " ",
          c.private && /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "size-3 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
          c.count,
          " items"
        ] })
      ] })
    ] }, c.name)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold uppercase tracking-wider text-muted-foreground", children: "Recently saved" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: prescribed.slice(0, 6).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-[3/4] rounded-xl overflow-hidden border border-white/10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: p.media, alt: "", className: "size-full object-cover", loading: "lazy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "absolute bottom-1.5 left-1.5 text-[10px] flex items-center gap-1 text-white/90", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "size-3 fill-white" }),
          " ",
          p.duration ?? "8:30"
        ] })
      ] }, p.id)) })
    ] })
  ] }) });
}
export {
  Collections as component
};

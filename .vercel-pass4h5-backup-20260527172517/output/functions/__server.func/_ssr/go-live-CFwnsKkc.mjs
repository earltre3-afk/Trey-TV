import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { A as AppShell } from "./AppShell-BWcCrjwR.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useGoBack } from "./use-go-back-DIwqgoNo.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { A as ArrowLeft, b3 as Camera, R as Radio, j as Eye, e as Mic, S as Sparkles, n as Settings, a5 as Users } from "../_libs/lucide-react.mjs";
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
function GoLive() {
  const [title, setTitle] = reactExports.useState("Studio Sessions Vol. 5");
  const goBack = useGoBack("/");
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 -mt-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: goBack, className: "inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }),
      " Back"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-[9/16] sm:aspect-video rounded-3xl overflow-hidden border border-[oklch(0.7_0.25_340_/_0.5)] bg-[radial-gradient(ellipse_at_top,oklch(0.2_0.08_340_/_0.4),transparent_60%),radial-gradient(ellipse_at_bottom,oklch(0.18_0.06_300_/_0.5),transparent_60%)] glow-magenta", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-24 mx-auto rounded-full bg-[oklch(0.7_0.25_340_/_0.15)] grid place-items-center animate-glow-pulse", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "size-10 text-[oklch(0.7_0.25_340)]" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs text-muted-foreground", children: "Camera preview" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-3 left-3 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 py-1 rounded-full text-[10px] font-bold bg-[oklch(0.7_0.25_340)] text-white animate-glow-pulse flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "size-3" }),
          " READY"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 py-1 rounded-full text-[10px] glass border border-white/10 flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "size-3" }),
          " 0 watching"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: title, onChange: (e) => setTitle(e.target.value), className: "w-full px-4 py-3 rounded-2xl glass border border-white/10 text-sm focus:outline-none focus:border-primary/50", placeholder: "Stream title" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-4 gap-2", children: [{
      icon: Camera,
      label: "Camera"
    }, {
      icon: Mic,
      label: "Mic"
    }, {
      icon: Sparkles,
      label: "Filters"
    }, {
      icon: Settings,
      label: "Setup"
    }].map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => toast(b.label), className: "rounded-2xl glass border border-white/10 py-3 flex flex-col items-center gap-1 hover:bg-white/5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(b.icon, { className: "size-5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: b.label })
    ] }, b.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl glass border border-white/10 p-4 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "size-5 text-[oklch(0.82_0.15_215)]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: "Audience" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Public · Anyone on Trey TV" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toast("Audience settings"), className: "text-xs text-primary", children: "Change" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => toast.success("You are LIVE — broadcasting to your audience"), className: "w-full py-4 rounded-2xl text-base font-bold bg-[oklch(0.7_0.25_340)] text-white glow-magenta hover-lift tilt-press flex items-center justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "size-5" }),
      " Start Broadcast"
    ] })
  ] }) });
}
export {
  GoLive as component
};

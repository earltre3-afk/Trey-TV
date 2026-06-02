import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { L as Logo } from "./Logo-D0JEzEf4.mjs";
import { a2 as Tv, bl as Download, bm as ShieldAlert } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "./trey-tv-logo-CG7PjBoN.mjs";
const TV_APP_APK_URL = "/downloads/trey-tv-streamingbox-debug.apk";
function DownloadTvApp() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "min-h-screen w-full bg-background text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-5 py-16 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "inline-flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "h-20" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 inline-flex items-center gap-2 rounded-full liquid-glass border border-white/15 px-3 py-1 text-[11px] tracking-[0.22em] text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tv, { className: "size-3.5 text-primary" }),
      "ANDROID TV / GOOGLE TV TEST BUILD"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display mt-6 text-4xl font-black leading-tight sm:text-6xl", children: "Download TV App" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 max-w-xl text-sm text-muted-foreground sm:text-base", children: "Install the current Trey TV debug build on Android TV, Google TV, or Fire Stick devices for internal testing." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: TV_APP_APK_URL, download: true, className: "mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground glow-gold sm:w-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "size-4" }),
      " Download TV App"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 w-full rounded-2xl liquid-glass neon-border p-5 text-left", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "mt-0.5 size-5 shrink-0 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-bold", children: "Test build only" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "This is a debug-signed build for Android TV / Google TV devices. You may need to allow installs from unknown sources on your device." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "mt-5 grid w-full gap-3 rounded-2xl border border-white/10 p-5 text-left text-sm sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "File" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-1 break-all font-mono text-xs", children: TV_APP_APK_URL })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Package" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-1 font-mono text-xs", children: "com.treytv.streamingbox" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Build date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-1", children: "May 27, 2026" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Size" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-1", children: "28,893,774 bytes" })
      ] })
    ] })
  ] }) });
}
export {
  DownloadTvApp as component
};

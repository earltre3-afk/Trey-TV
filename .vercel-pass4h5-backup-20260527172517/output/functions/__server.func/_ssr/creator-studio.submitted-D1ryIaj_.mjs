import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { g as useSearch, L as Link } from "../_libs/tanstack__react-router.mjs";
import { ax as CircleCheck, t as Crown, j as Eye, an as Upload, aj as ArrowRight } from "../_libs/lucide-react.mjs";
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
function Submitted() {
  const {
    id
  } = useSearch({
    from: "/creator-studio/submitted"
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "min-h-screen grid place-items-center px-4 bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-md w-full rounded-3xl glass neon-border p-8 text-center overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-20 -right-20 size-56 rounded-full bg-[radial-gradient(circle,oklch(0.78_0.18_150_/_0.4),transparent_70%)] blur-2xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-20 -left-20 size-56 rounded-full bg-[radial-gradient(circle,oklch(0.65_0.22_300_/_0.35),transparent_70%)] blur-2xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto size-16 rounded-2xl glass grid place-items-center glow-gold mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "size-8 text-[oklch(0.82_0.18_150)]" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] tracking-[0.3em] text-primary mb-1 flex items-center justify-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "size-3.5" }),
        " SUBMITTED"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-gradient-gold", children: "Off to the admins" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-2", children: "Your episode has been submitted for admin approval. You'll be notified when it's approved, rejected, or needs changes." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-col gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/creator-studio/submissions", className: "px-4 py-3 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold flex items-center justify-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "size-4" }),
          " View Submission Status"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/creator-studio/edit", className: "px-4 py-3 rounded-xl text-sm font-semibold glass border border-white/10 flex items-center justify-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "size-4" }),
          " Upload Another Episode"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/creator-hub", className: "px-4 py-3 rounded-xl text-sm font-semibold glass border border-white/10 flex items-center justify-center gap-2", children: [
          "Back to Creator Hub ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-4" })
        ] })
      ] }),
      id && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 text-[10px] text-muted-foreground", children: [
        "ID: ",
        id
      ] })
    ] })
  ] }) });
}
export {
  Submitted as component
};

import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { h as useParams } from "../_libs/tanstack__react-router.mjs";
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
const SharedEndingScreen = reactExports.lazy(async () => {
  const mod = await import("./PlaythroughsScreen-D6QZNspj.mjs").then((n) => n.B);
  return {
    default: mod.SharedEndingScreen
  };
});
function SharedEndingPage() {
  const {
    shareSlug
  } = useParams({
    from: "/games/interactive-stories/share/$shareSlug"
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-sans antialiased", style: {
    background: "#05070D",
    color: "#F8FAFC",
    minHeight: "100vh"
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen w-full flex items-center justify-center px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border px-6 py-5 text-center", style: {
    background: "rgba(8,17,31,0.78)",
    borderColor: "rgba(255,200,87,0.3)",
    boxShadow: "0 0 44px rgba(255,200,87,0.15), inset 0 1px 0 rgba(255,255,255,0.06)"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold tracking-[0.3em]", style: {
      color: "#FFC857"
    }, children: "TREY TV" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-base font-black", children: "Loading Shared Ending" })
  ] }) }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(SharedEndingScreen, { slug: shareSlug, onBack: () => window.history.back() }) }) });
}
export {
  SharedEndingPage as component
};

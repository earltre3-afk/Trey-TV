import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
const InteractiveStoriesPlayer = reactExports.lazy(() => import("./InteractiveStoriesPlayer-CADwtHbl.mjs"));
function InteractiveStoriesPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-sans antialiased", style: {
    background: "#05070D",
    color: "#F8FAFC",
    minHeight: "100vh"
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen w-full flex items-center justify-center px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border px-6 py-5 text-center", style: {
    background: "rgba(8,17,31,0.78)",
    borderColor: "rgba(168,85,247,0.3)",
    boxShadow: "0 0 44px rgba(168,85,247,0.18), inset 0 1px 0 rgba(255,255,255,0.06)"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold tracking-[0.3em]", style: {
      color: "#A855F7"
    }, children: "TREY TV" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-base font-black", children: "Loading Interactive Stories" })
  ] }) }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(InteractiveStoriesPlayer, { onBack: () => window.history.back() }) }) });
}
export {
  InteractiveStoriesPage as component
};

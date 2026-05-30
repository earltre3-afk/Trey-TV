import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
const TrunoModule = reactExports.lazy(() => import("./TrunoModule-DlyHvyhG.mjs"));
function TrunoPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-zinc-950", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold tracking-[0.3em] text-fuchsia-400 mb-2", children: "TRUNO" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-black text-white", children: "Loading…" })
  ] }) }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(TrunoModule, { initialView: "home", onExitToGames: () => window.history.back() }) });
}
export {
  TrunoPage as component
};

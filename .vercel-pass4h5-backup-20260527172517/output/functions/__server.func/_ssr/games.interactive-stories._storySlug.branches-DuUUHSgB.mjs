import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
const InteractiveStoriesPlayer = reactExports.lazy(() => import("./InteractiveStoriesPlayer-CADwtHbl.mjs"));
function StoryBranchesPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-sans antialiased", style: {
    background: "#05070D",
    color: "#F8FAFC",
    minHeight: "100vh"
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen grid place-items-center text-white", children: "Loading Branch Map" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(InteractiveStoriesPlayer, { initialView: "main", initialTab: "branches", onBack: () => window.history.back() }) }) });
}
export {
  StoryBranchesPage as component
};

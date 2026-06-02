import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { z as zodiacSymbol } from "./zodiac-BJiAMBSd.mjs";
import { S as Sparkles } from "../_libs/lucide-react.mjs";
function ZodiacBadge({
  sign,
  symbol,
  isCusp = false,
  cuspLabel,
  size = "md",
  showName
}) {
  if (!sign) return null;
  const dims = size === "lg" ? "size-20 text-4xl" : size === "sm" ? "size-9 text-lg" : "size-12 text-2xl";
  const shouldShowName = showName ?? size !== "sm";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "span",
      {
        className: `relative grid shrink-0 place-items-center rounded-full border ${dims} ${isCusp ? "border-[oklch(0.86_0.2_300/0.7)] bg-[radial-gradient(circle,oklch(0.86_0.2_300/0.22),oklch(0.82_0.16_85/0.13),transparent)] text-[oklch(0.9_0.18_92)] shadow-[0_0_28px_oklch(0.75_0.25_300/0.45)]" : "border-primary/50 bg-primary/10 text-primary shadow-[0_0_22px_oklch(0.82_0.16_85/0.32)]"}`,
        "aria-label": `${sign} zodiac badge`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inset-1 rounded-full border border-white/10" }),
          symbol ?? zodiacSymbol(sign)
        ]
      }
    ),
    shouldShowName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-sm font-black leading-tight", children: sign }),
      isCusp && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[oklch(0.9_0.18_92)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-3" }),
        " ",
        cuspLabel ?? "Cusp Soul"
      ] })
    ] })
  ] });
}
export {
  ZodiacBadge as Z
};

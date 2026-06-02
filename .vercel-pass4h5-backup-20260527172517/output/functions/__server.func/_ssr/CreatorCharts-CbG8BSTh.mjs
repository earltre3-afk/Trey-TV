import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
const RANGES = [
  { id: "7d", label: "7d" },
  { id: "30d", label: "30d" },
  { id: "90d", label: "90d" },
  { id: "all", label: "All" }
];
function RangePicker({ value, onChange }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex items-center gap-0.5 rounded-xl glass border border-white/10 p-0.5", children: RANGES.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      onClick: () => onChange(r.id),
      className: `px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${value === r.id ? "bg-primary/15 text-primary ring-1 ring-primary/40" : "text-muted-foreground hover:text-foreground"}`,
      children: r.label
    },
    r.id
  )) });
}
function useSeries(seed, length, base = 100, variance = 40) {
  return reactExports.useMemo(() => {
    let s = seed;
    return Array.from({ length }, () => {
      s = (s * 9301 + 49297) % 233280;
      const r = s / 233280;
      return Math.max(0, Math.round(base + (r - 0.4) * variance));
    });
  }, [seed, length, base, variance]);
}
function Sparkline({
  values,
  height = 56,
  stroke = "oklch(0.82 0.16 85)",
  fill = "oklch(0.82 0.16 85 / 0.2)"
}) {
  const w = 240;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const pts = values.map((v, i) => {
    const x = i / (values.length - 1 || 1) * w;
    const y = height - (v - min) / span * (height - 4) - 2;
    return [x, y];
  });
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const area = `${d} L ${w} ${height} L 0 ${height} Z`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: `0 0 ${w} ${height}`, className: "w-full h-full", preserveAspectRatio: "none", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: area, fill }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d, fill: "none", stroke, strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: pts[pts.length - 1][0], cy: pts[pts.length - 1][1], r: 2.5, fill: stroke })
  ] });
}
function MiniBars({ values, color = "oklch(0.82 0.16 85)" }) {
  const max = Math.max(...values, 1);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end gap-0.5 h-12", children: values.map((v, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "flex-1 rounded-sm",
      style: { height: `${v / max * 100}%`, background: color, opacity: 0.4 + v / max * 0.6 }
    },
    i
  )) });
}
export {
  MiniBars as M,
  RangePicker as R,
  Sparkline as S,
  useSeries as u
};

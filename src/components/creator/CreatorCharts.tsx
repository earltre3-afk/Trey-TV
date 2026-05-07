import { useMemo } from "react";

export type Range = "7d" | "30d" | "90d" | "all";
export const RANGES: { id: Range; label: string }[] = [
  { id: "7d", label: "7d" }, { id: "30d", label: "30d" },
  { id: "90d", label: "90d" }, { id: "all", label: "All" },
];

export function RangePicker({ value, onChange }: { value: Range; onChange: (r: Range) => void }) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-xl glass border border-white/10 p-0.5">
      {RANGES.map((r) => (
        <button
          key={r.id}
          onClick={() => onChange(r.id)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
            value === r.id ? "bg-primary/15 text-primary ring-1 ring-primary/40" : "text-muted-foreground hover:text-foreground"
          }`}
        >{r.label}</button>
      ))}
    </div>
  );
}

/** Deterministic pseudo-random series for design-time data. */
export function useSeries(seed: number, length: number, base = 100, variance = 40) {
  return useMemo(() => {
    let s = seed;
    return Array.from({ length }, () => {
      s = (s * 9301 + 49297) % 233280;
      const r = s / 233280;
      return Math.max(0, Math.round(base + (r - 0.4) * variance));
    });
  }, [seed, length, base, variance]);
}

export function Sparkline({
  values, height = 56, stroke = "oklch(0.82 0.16 85)", fill = "oklch(0.82 0.16 85 / 0.2)",
}: { values: number[]; height?: number; stroke?: string; fill?: string }) {
  const w = 240;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1 || 1)) * w;
    const y = height - ((v - min) / span) * (height - 4) - 2;
    return [x, y] as const;
  });
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const area = `${d} L ${w} ${height} L 0 ${height} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full h-full" preserveAspectRatio="none">
      <path d={area} fill={fill} />
      <path d={d} fill="none" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={2.5} fill={stroke} />
    </svg>
  );
}

export function MiniBars({ values, color = "oklch(0.82 0.16 85)" }: { values: number[]; color?: string }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-0.5 h-12">
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm"
          style={{ height: `${(v / max) * 100}%`, background: color, opacity: 0.4 + (v / max) * 0.6 }}
        />
      ))}
    </div>
  );
}

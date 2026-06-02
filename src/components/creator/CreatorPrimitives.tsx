import { Link } from "@tanstack/react-router";
import { Crown, type LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import type { ReactNode } from "react";

const TONE: Record<string, string> = {
  gold: "from-[oklch(0.82_0.16_85_/_0.28)] to-transparent text-primary ring-primary/40",
  cyan: "from-[oklch(0.82_0.15_215_/_0.25)] to-transparent text-[oklch(0.82_0.15_215)] ring-[oklch(0.82_0.15_215_/_0.4)]",
  purple:
    "from-[oklch(0.65_0.22_300_/_0.25)] to-transparent text-[oklch(0.78_0.22_300)] ring-[oklch(0.65_0.22_300_/_0.4)]",
  magenta:
    "from-[oklch(0.7_0.25_340_/_0.25)] to-transparent text-[oklch(0.78_0.25_340)] ring-[oklch(0.7_0.25_340_/_0.4)]",
  green:
    "from-[oklch(0.78_0.18_150_/_0.22)] to-transparent text-[oklch(0.82_0.18_150)] ring-[oklch(0.78_0.18_150_/_0.4)]",
};

export type Tone = keyof typeof TONE;

export function CreatorMetricCard({
  label,
  value,
  delta,
  icon: Icon,
  tone = "gold",
  trend = "up",
  sub,
}: {
  label: string;
  value: string;
  delta?: string;
  icon: LucideIcon;
  tone?: Tone;
  trend?: "up" | "down" | "flat";
  sub?: string;
}) {
  const TrendIcon = trend === "down" ? TrendingDown : TrendingUp;
  return (
    <div
      className={`relative rounded-2xl p-4 glass ring-1 ${TONE[tone]} bg-gradient-to-br hover-lift overflow-hidden`}
    >
      <div className="shimmer-sweep absolute inset-0 rounded-2xl pointer-events-none" />
      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase truncate">
            {label}
          </div>
          <div className="mt-1 text-2xl md:text-3xl font-bold tabular-nums">{value}</div>
          {delta && (
            <div
              className={`mt-1 text-xs flex items-center gap-1 ${trend === "down" ? "text-[oklch(0.78_0.24_15)]" : "text-[oklch(0.82_0.18_150)]"}`}
            >
              <TrendIcon className="size-3" /> {delta}
            </div>
          )}
          {sub && <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>}
        </div>
        <div className="size-10 rounded-xl bg-white/10 grid place-items-center shrink-0">
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}

export function CreatorActionButton({
  icon: Icon,
  label,
  desc,
  to,
  onClick,
  accent = false,
}: {
  icon: LucideIcon;
  label: string;
  desc?: string;
  to?: string;
  onClick?: () => void;
  accent?: boolean;
}) {
  const cls = `group relative rounded-2xl p-4 glass neon-border hover-lift tilt-press text-left overflow-hidden w-full ${accent ? "ring-1 ring-primary/40 glow-gold" : ""}`;
  const inner = (
    <>
      <div className="size-10 rounded-xl grid place-items-center bg-white/5 group-hover:scale-110 transition">
        <Icon className={`size-5 ${accent ? "text-primary" : "text-foreground/80"}`} />
      </div>
      <div className="mt-3 text-sm font-semibold">{label}</div>
      {desc && <div className="text-[11px] text-muted-foreground mt-0.5">{desc}</div>}
    </>
  );
  if (to)
    return (
      <Link to={to} className={cls}>
        {inner}
      </Link>
    );
  return (
    <button onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

const STATUS_TONE: Record<string, string> = {
  approved:
    "bg-[oklch(0.78_0.18_150_/_0.18)] text-[oklch(0.82_0.18_150)] border-[oklch(0.78_0.18_150_/_0.4)]",
  pending: "bg-[oklch(0.82_0.16_85_/_0.18)] text-primary border-primary/40",
  rejected:
    "bg-[oklch(0.65_0.24_15_/_0.18)] text-[oklch(0.78_0.24_15)] border-[oklch(0.65_0.24_15_/_0.4)]",
  not_applied: "bg-white/10 text-muted-foreground border-white/15",
  live: "bg-[oklch(0.65_0.24_15_/_0.2)] text-[oklch(0.85_0.22_15)] border-[oklch(0.65_0.24_15_/_0.5)]",
};

export function CreatorStatusBadge({ status, label }: { status: string; label?: string }) {
  const tone = STATUS_TONE[status] ?? STATUS_TONE.not_applied;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] tracking-[0.18em] px-2 py-1 rounded-full border font-semibold uppercase ${tone}`}
    >
      {status === "approved" && <Crown className="size-3" />}
      {label ?? status.replace("_", " ")}
    </span>
  );
}

export function SectionHeader({
  icon: Icon,
  title,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-3 px-1">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        {Icon && <Icon className="size-4 text-primary" />} {title}
      </h2>
      {action}
    </div>
  );
}

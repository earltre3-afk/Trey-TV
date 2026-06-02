import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import {
  BarChart3,
  TrendingUp,
  Eye,
  Heart,
  Users,
  Clock,
  Globe2,
  Play,
  ArrowUpRight,
  Filter,
} from "lucide-react";

export const Route = createFileRoute("/analytics")({
  component: Analytics,
  head: () => ({
    meta: [
      { title: "Analytics — Trey TV" },
      {
        name: "description",
        content: "Track watch time, growth, audience and revenue across your Trey TV channel.",
      },
    ],
  }),
});

const series = [22, 34, 28, 40, 52, 48, 60, 55, 72, 68, 84, 96, 88, 110];
const series2 = [10, 14, 18, 22, 30, 28, 38, 36, 50, 58, 64, 70, 80, 92];

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 100,
    h = 32;
  const max = Math.max(...data);
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-10" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`g-${color}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.5" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke={color} strokeWidth="1.6" points={points} />
      <polygon fill={`url(#g-${color})`} points={`0,${h} ${points} ${w},${h}`} />
    </svg>
  );
}

const stats = [
  {
    label: "Watch Hours",
    value: "184,210",
    delta: "+12.4%",
    color: "oklch(0.82 0.16 85)",
    icon: Clock,
    data: series,
  },
  {
    label: "Unique Viewers",
    value: "92,481",
    delta: "+8.7%",
    color: "oklch(0.82 0.15 215)",
    icon: Eye,
    data: series2,
  },
  {
    label: "Engagement Rate",
    value: "9.74%",
    delta: "+1.3%",
    color: "oklch(0.7 0.25 340)",
    icon: Heart,
    data: series,
  },
  {
    label: "New Followers",
    value: "8,412",
    delta: "+5.1%",
    color: "oklch(0.65 0.22 300)",
    icon: Users,
    data: series2,
  },
];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const bars = [42, 64, 50, 78, 96, 118, 88];

const top = [
  { title: "Late Night with Trey · S2 E14", views: "42.1K", mins: "32:14", lift: "+24%" },
  { title: "Studio Sessions · S1 E08", views: "18.7K", mins: "12:45", lift: "+11%" },
  { title: "City After Dark · S3 E22", views: "12.4K", mins: "08:32", lift: "+9%" },
  { title: "Late Night with Trey · S2 E13", views: "9.8K", mins: "28:02", lift: "+6%" },
];

const geo = [
  { country: "United States", pct: 42, color: "oklch(0.82 0.16 85)" },
  { country: "United Kingdom", pct: 18, color: "oklch(0.82 0.15 215)" },
  { country: "Canada", pct: 12, color: "oklch(0.7 0.25 340)" },
  { country: "Germany", pct: 9, color: "oklch(0.65 0.22 300)" },
  { country: "Other", pct: 19, color: "oklch(0.78 0.18 150)" },
];

function Analytics() {
  const maxBar = Math.max(...bars);
  return (
    <AppShell wide>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <div className="text-[10px] tracking-[0.3em] text-primary flex items-center gap-2">
              <BarChart3 className="size-3.5" /> ANALYTICS
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mt-1">
              <span className="text-gradient-gold">Channel Performance</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Last 14 days · Updated just now</p>
          </div>
          <div className="flex items-center gap-2">
            {["7d", "14d", "30d", "All"].map((r, i) => (
              <button
                key={r}
                className={`px-3 py-1.5 rounded-lg text-xs ${i === 1 ? "bg-primary/15 text-primary border border-primary/40 glow-gold" : "glass border border-white/10 text-muted-foreground hover:text-foreground"}`}
              >
                {r}
              </button>
            ))}
            <button className="size-9 grid place-items-center rounded-lg glass border border-white/10">
              <Filter className="size-4" />
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              style={{
                animationName: "rise",
                animationDuration: "300ms",
                animationTimingFunction: "ease-out",
                animationFillMode: "both",
                animationDelay: `${i * 80}ms`,
                boxShadow: `0 18px 50px -25px ${s.color}`,
              }}
              className="relative rounded-2xl glass neon-border p-4 hover-lift overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] tracking-[0.2em] text-muted-foreground">
                    {s.label.toUpperCase()}
                  </div>
                  <div className="mt-1 text-2xl font-bold tabular-nums">{s.value}</div>
                </div>
                <div
                  className="size-9 rounded-xl grid place-items-center"
                  style={{ background: `${s.color.replace(")", " / 0.15)")}` }}
                >
                  <s.icon className="size-4" style={{ color: s.color }} />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs" style={{ color: s.color }}>
                <ArrowUpRight className="size-3" /> {s.delta} vs prev
              </div>
              <div className="mt-1">
                <Sparkline data={s.data} color={s.color} />
              </div>
            </div>
          ))}
        </div>

        {/* Watch Time Chart */}
        <div className="rounded-3xl glass neon-border p-5 md:p-6 hover-lift">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-5">
            <div>
              <div className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" /> Watch Time This Week
              </div>
              <div className="text-xs text-muted-foreground">Total: 612 hours · Peak: Saturday</div>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-primary" /> Watch hours
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-[oklch(0.7_0.25_340)]" /> Live
              </span>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2 md:gap-4 h-48">
            {bars.map((b, i) => (
              <div key={days[i]} className="flex-1 flex flex-col items-center gap-2">
                <div className="relative w-full flex justify-center items-end h-full">
                  <div
                    style={{ height: `${(b / maxBar) * 100}%`, animationDelay: `${i * 70}ms` }}
                    className="w-full max-w-[44px] rounded-t-xl bg-gradient-to-t from-primary/40 to-primary shadow-[0_0_20px_oklch(0.82_0.16_85_/_0.5)] animate-rise relative overflow-hidden"
                  >
                    <span className="absolute inset-x-0 top-1 text-center text-[10px] font-bold text-primary-foreground">
                      {b}h
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground">{days[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Top content */}
          <div className="lg:col-span-2 rounded-3xl glass neon-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Play className="size-4 text-primary" /> Top Performing Episodes
              </h3>
              <button className="text-xs text-primary">See all</button>
            </div>
            <ul className="space-y-2">
              {top.map((t, i) => (
                <li
                  key={t.title}
                  style={{ animationDelay: `${i * 60}ms` }}
                  className="animate-rise flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition"
                >
                  <div className="text-xs tabular-nums text-primary font-bold w-6">#{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{t.title}</div>
                    <div className="text-[11px] text-muted-foreground">{t.mins} avg watch</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold tabular-nums">{t.views}</div>
                    <div className="text-[11px] text-[oklch(0.78_0.18_150)] flex items-center gap-1 justify-end">
                      <ArrowUpRight className="size-3" /> {t.lift}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Geo */}
          <div className="rounded-3xl glass neon-border p-5">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
              <Globe2 className="size-4 text-primary" /> Audience by Country
            </h3>
            <ul className="space-y-3">
              {geo.map((g, i) => (
                <li
                  key={g.country}
                  style={{ animationDelay: `${i * 70}ms` }}
                  className="animate-rise"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>{g.country}</span>
                    <span className="tabular-nums text-muted-foreground">{g.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full shimmer-sweep"
                      style={{
                        width: `${g.pct}%`,
                        background: `linear-gradient(90deg, ${g.color}, ${g.color.replace(")", " / 0.4)")})`,
                        boxShadow: `0 0 12px ${g.color}`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 pt-4 border-t border-white/5">
              <div className="text-[10px] tracking-[0.2em] text-muted-foreground mb-2">DEVICES</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { l: "Mobile", v: "68%" },
                  { l: "Web", v: "22%" },
                  { l: "TV", v: "10%" },
                ].map((d) => (
                  <div key={d.l} className="rounded-xl glass p-2">
                    <div className="text-base font-bold">{d.v}</div>
                    <div className="text-[10px] text-muted-foreground">{d.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

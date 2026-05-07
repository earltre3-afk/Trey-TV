import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CreatorStudioLayout } from "@/components/layout/CreatorStudioLayout";
import { CreatorMetricCard, SectionHeader } from "@/components/creator/CreatorPrimitives";
import { RangePicker, Sparkline, MiniBars, useSeries, type Range } from "@/components/creator/CreatorCharts";
import { useSubmissions } from "@/lib/submissions-store";
import { Eye, Clock, Users, Heart, TrendingUp, Wand2, Share2, Bookmark, Globe2, Compass, Search, Crown } from "lucide-react";

export const Route = createFileRoute("/creator-studio/analytics")({
  component: AnalyticsPage,
  head: () => ({ meta: [{ title: "Analytics — Creator Studio" }] }),
});

function AnalyticsPage() {
  const [range, setRange] = useState<Range>("30d");
  const length = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 120;
  const views = useSeries(7, length, 4200, 2200);
  const watch = useSeries(13, length, 320, 180);
  const followers = useSeries(31, length, 40, 30);
  const engagement = useSeries(47, length, 60, 25);

  const sources = [
    { id: "home", label: "Trey TV Home", pct: 38, icon: Crown },
    { id: "search", label: "Search", pct: 22, icon: Search },
    { id: "explore", label: "Explore / Recs", pct: 18, icon: Compass },
    { id: "external", label: "External / Shares", pct: 12, icon: Globe2 },
    { id: "channel", label: "Direct channel", pct: 10, icon: Eye },
  ];

  const store = useSubmissions();
  const episodes = useMemo(() =>
    store.submissions.filter((s) => s.status === "approved" || s.status === "published" || s.status === "scheduled").slice(0, 8)
  , [store.submissions]);
  const epSeries = useSeries(11, Math.max(episodes.length, 1) * 14, 200, 140);
  const hourly = useSeries(99, 24, 50, 50);

  return (
    <CreatorStudioLayout
      title="Analytics"
      subtitle="The numbers behind your network."
      actions={<RangePicker value={range} onChange={setRange} />}
    >
      <section>
        <SectionHeader icon={TrendingUp} title={`Overview · Last ${range === "all" ? "all time" : range}`} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricWithSpark label="Views" value={fmt(views.reduce((a, b) => a + b))} delta="+12.4%" icon={Eye} tone="cyan" series={views} />
          <MetricWithSpark label="Watch Time" value={`${Math.round(watch.reduce((a, b) => a + b) / 60)}h`} delta="+8.1%" icon={Clock} tone="purple" series={watch} />
          <MetricWithSpark label="Followers" value={`+${fmt(followers.reduce((a, b) => a + b))}`} delta="+22%" icon={Users} tone="magenta" series={followers} />
          <MetricWithSpark label="Engagement" value="9.7%" delta="+1.3%" icon={Heart} tone="gold" series={engagement} />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
          <CreatorMetricCard label="Saves" value="3,812" icon={Bookmark} tone="purple" />
          <CreatorMetricCard label="Shares" value="942" icon={Share2} tone="cyan" />
          <CreatorMetricCard label="Comments" value="1,247" icon={Users} tone="magenta" />
          <CreatorMetricCard label="Completion" value="62%" icon={Clock} tone="green" />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 rounded-3xl glass neon-border p-4 md:p-5">
          <SectionHeader icon={TrendingUp} title="Views over time" />
          <div className="h-40"><Sparkline values={views} height={140} /></div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>{length}d ago</span><span>today</span>
          </div>
        </div>

        <div className="rounded-3xl glass neon-border p-4 md:p-5">
          <SectionHeader icon={Globe2} title="Traffic sources" />
          <ul className="space-y-2.5">
            {sources.map((s) => (
              <li key={s.id} className="text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1.5"><s.icon className="size-3.5 text-primary" /> {s.label}</span>
                  <span className="tabular-nums text-muted-foreground">{s.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-[oklch(0.7_0.25_340)]" style={{ width: `${s.pct}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-3xl glass neon-border p-4 md:p-5">
        <SectionHeader icon={Wand2} title="Trey-I growth insights" />
        <ul className="grid md:grid-cols-2 gap-2">
          {[
            "BTS clips save 2.3× higher than full episodes — make a weekly series.",
            "Drop-off in first 8s. Open with your strongest moment.",
            "Returning fans peak 9–11pm local. Schedule premieres late.",
            "Top 10 fans drove 42% of last week's gifts. Reply to them.",
          ].map((tip, i) => (
            <li key={i} className="flex gap-3 p-3 rounded-2xl bg-white/5 ring-1 ring-white/10">
              <Wand2 className="size-4 text-primary shrink-0 mt-0.5" />
              <p className="text-sm">{tip}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl glass neon-border p-4 md:p-5">
        <SectionHeader icon={Eye} title="Episode performance" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
              <tr>
                <th className="text-left p-2">Episode</th>
                <th className="text-left p-2">Trend</th>
                <th className="text-right p-2">Views</th>
                <th className="text-right p-2">Avg Watch</th>
                <th className="text-right p-2">Completion</th>
                <th className="text-right p-2">Saves</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {episodes.map((e, i) => {
                const v = 8000 + (i * 3700) + (i % 3) * 1200;
                const series = useSeriesValue(i + 11, 14, 200, 140);
                return (
                  <tr key={e.content_id} className="hover:bg-white/5">
                    <td className="p-2 font-semibold truncate max-w-[200px]">{e.title || "Untitled"}</td>
                    <td className="p-2 w-32"><div className="h-8"><Sparkline values={series} height={28} /></div></td>
                    <td className="p-2 text-right tabular-nums">{fmt(v)}</td>
                    <td className="p-2 text-right tabular-nums">{Math.floor(8 + i)}:{String(10 + (i * 7) % 50).padStart(2, "0")}</td>
                    <td className="p-2 text-right tabular-nums">{55 + (i * 3) % 30}%</td>
                    <td className="p-2 text-right tabular-nums">{fmt(120 + i * 80)}</td>
                  </tr>
                );
              })}
              {episodes.length === 0 && (
                <tr><td colSpan={6} className="p-6 text-center text-muted-foreground text-sm">Publish episodes to see performance.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl glass neon-border p-4 md:p-5">
        <SectionHeader icon={Clock} title="When your fans watch" />
        <MiniBars values={useSeriesValue(99, 24, 50, 50)} />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>11pm</span>
        </div>
      </section>
    </CreatorStudioLayout>
  );
}

function MetricWithSpark(props: React.ComponentProps<typeof CreatorMetricCard> & { series: number[] }) {
  const { series, ...rest } = props;
  return (
    <div className="space-y-1">
      <CreatorMetricCard {...rest} />
      <div className="h-8 px-1"><Sparkline values={series} height={32} /></div>
    </div>
  );
}

// useSeries inline so multiple callers don't share refs
function useSeriesValue(seed: number, length: number, base: number, variance: number) {
  return useSeries(seed, length, base, variance);
}

function fmt(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

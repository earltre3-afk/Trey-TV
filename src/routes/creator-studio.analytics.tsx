import { createFileRoute } from "@tanstack/react-router";
import { CreatorStudioLayout } from "@/components/layout/CreatorStudioLayout";
import { CreatorMetricCard, SectionHeader } from "@/components/creator/CreatorPrimitives";
import { Eye, Clock, Users, Heart, TrendingUp, Wand2, Share2, Bookmark } from "lucide-react";

export const Route = createFileRoute("/creator-studio/analytics")({
  component: AnalyticsPage,
  head: () => ({ meta: [{ title: "Analytics — Creator Studio" }] }),
});

function AnalyticsPage() {
  return (
    <CreatorStudioLayout title="Analytics" subtitle="The numbers behind your network.">
      <section>
        <SectionHeader icon={TrendingUp} title="Overview · Last 30 days" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <CreatorMetricCard label="Views" value="184.2K" delta="+12.4%" icon={Eye} tone="cyan" />
          <CreatorMetricCard label="Watch Time" value="9,420h" delta="+8.1%" icon={Clock} tone="purple" />
          <CreatorMetricCard label="Followers Gained" value="+1,204" delta="+22%" icon={Users} tone="magenta" />
          <CreatorMetricCard label="Engagement" value="9.7%" delta="+1.3%" icon={Heart} tone="gold" />
          <CreatorMetricCard label="Saves" value="3,812" icon={Bookmark} tone="purple" />
          <CreatorMetricCard label="Shares" value="942" icon={Share2} tone="cyan" />
          <CreatorMetricCard label="Comments" value="1,247" icon={Users} tone="magenta" />
          <CreatorMetricCard label="Completion" value="62%" icon={Clock} tone="green" />
        </div>
      </section>

      <section className="rounded-3xl glass neon-border p-4 md:p-5">
        <SectionHeader icon={Wand2} title="Trey-I growth insights" />
        <ul className="space-y-2">
          {[
            "Behind-the-scenes clips save 2.3× higher than full episodes — turn them into a weekly series.",
            "Viewers drop off in the first 8 seconds. Open the next episode with your strongest moment.",
            "Returning fans are most active 9–11pm local. Schedule premieres late.",
            "Your Top 10 fans drove 42% of last week's gifts — reply to them this week.",
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
          <table className="w-full text-sm min-w-[600px]">
            <thead className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
              <tr><th className="text-left p-2">Episode</th><th className="text-right p-2">Views</th><th className="text-right p-2">Avg Watch</th><th className="text-right p-2">Completion</th><th className="text-right p-2">Saves</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                ["Late Night S2 E14", "42.1K", "11:24", "71%", "1,420"],
                ["Studio Sessions E8", "31.8K", "18:02", "65%", "980"],
                ["City After Dark Trailer", "28.4K", "1:08", "82%", "612"],
                ["Late Night S2 E13", "22.0K", "10:11", "59%", "540"],
              ].map((r, i) => (
                <tr key={i} className="hover:bg-white/5">
                  {r.map((c, j) => <td key={j} className={`p-2 tabular-nums ${j === 0 ? "font-semibold" : "text-right"}`}>{c}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </CreatorStudioLayout>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { CreatorStudioLayout } from "@/components/layout/CreatorStudioLayout";
import { SectionHeader, CreatorMetricCard } from "@/components/creator/CreatorPrimitives";
import { Users, Heart, Gem, TrendingUp, MessageSquare } from "lucide-react";
import { creators } from "@/lib/mock-data";

export const Route = createFileRoute("/creator-studio/fans")({
  component: FansPage,
  head: () => ({ meta: [{ title: "Fans — Creator Studio" }] }),
});

function FansPage() {
  return (
    <CreatorStudioLayout title="Your fans" subtitle="The people powering your channel.">
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <CreatorMetricCard label="Total Fans" value="32.7K" delta="+1.2K this week" icon={Users} tone="cyan" />
        <CreatorMetricCard label="Returning" value="68%" delta="+4%" icon={TrendingUp} tone="purple" />
        <CreatorMetricCard label="Top Supporter" value="@nightowl" sub="2,400 pts gifted" icon={Gem} tone="gold" />
        <CreatorMetricCard label="Most Engaged Group" value="Late Night fans" icon={Heart} tone="magenta" />
      </section>

      <section className="rounded-3xl glass neon-border p-4 md:p-5">
        <SectionHeader icon={Gem} title="Top fans" />
        <ul className="divide-y divide-white/5">
          {creators.map((c, i) => (
            <li key={c.id} className="flex items-center gap-3 py-3">
              <span className="text-xs tabular-nums text-muted-foreground w-6">#{i + 1}</span>
              <div className="relative size-10 rounded-full conic-ring shrink-0">
                <img src={c.avatar} className="size-10 rounded-full object-cover" alt="" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{c.name}</div>
                <div className="text-[11px] text-muted-foreground">@{c.handle} · {(2400 - i * 320)} pts gifted</div>
              </div>
              <span className="hidden md:inline text-[10px] tracking-[0.18em] px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/30 uppercase">Top fan</span>
              <button className="px-3 py-1.5 rounded-lg text-xs border border-primary text-primary hover:bg-primary/10 inline-flex items-center gap-1">
                <MessageSquare className="size-3.5" /> Message
              </button>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs text-muted-foreground text-center">More fan insights coming as your channel grows.</p>
    </CreatorStudioLayout>
  );
}

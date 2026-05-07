import { createFileRoute } from "@tanstack/react-router";
import { CreatorStudioLayout } from "@/components/layout/CreatorStudioLayout";
import { CreatorMetricCard, SectionHeader } from "@/components/creator/CreatorPrimitives";
import { Gem, Trophy, TrendingUp, Heart, Wallet } from "lucide-react";

export const Route = createFileRoute("/creator-studio/rewards")({
  component: RewardsPage,
  head: () => ({ meta: [{ title: "Rewards — Creator Studio" }] }),
});

function RewardsPage() {
  return (
    <CreatorStudioLayout title="Rewards & gifts" subtitle="Track support from your fans.">
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <CreatorMetricCard label="Total Gifts" value="2,340" delta="+18%" icon={Gem} tone="gold" />
        <CreatorMetricCard label="Points Received" value="12,480" sub="≈ $312 in tips" icon={Wallet} tone="cyan" />
        <CreatorMetricCard label="Top Supporter" value="@nightowl" sub="2,400 pts" icon={Trophy} tone="magenta" />
        <CreatorMetricCard label="Most Gifted Episode" value="Late Night E14" icon={Heart} tone="purple" />
      </section>

      <section className="rounded-3xl glass neon-border p-4 md:p-5">
        <SectionHeader icon={TrendingUp} title="Recent gift activity" />
        <ul className="divide-y divide-white/5">
          {[
            { who: "@nightowl", what: "500 pts · Glow Heart", ep: "Late Night S2 E14", ago: "2m" },
            { who: "@maya", what: "250 pts · Star Boost", ep: "Studio Sessions E8", ago: "1h" },
            { who: "@lena", what: "100 pts · Crown Tip", ep: "City After Dark Trailer", ago: "3h" },
            { who: "@zaybeats", what: "1,000 pts · Diamond", ep: "Late Night S2 E14", ago: "1d" },
          ].map((g, i) => (
            <li key={i} className="flex items-center gap-3 py-3">
              <div className="size-10 rounded-xl grid place-items-center bg-primary/10 text-primary ring-1 ring-primary/30"><Gem className="size-5" /></div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{g.who} <span className="text-muted-foreground font-normal">· {g.ago}</span></div>
                <div className="text-xs text-muted-foreground truncate">{g.what} · on {g.ep}</div>
              </div>
              <button className="px-3 py-1.5 rounded-lg text-xs border border-primary text-primary hover:bg-primary/10">Thank</button>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl glass neon-border p-4 md:p-5">
        <SectionHeader icon={Wallet} title="Payout status" />
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="rounded-2xl glass border border-white/10 p-3"><div className="text-xs text-muted-foreground">Pending rewards</div><div className="text-2xl font-bold text-primary">$312</div></div>
          <div className="rounded-2xl glass border border-white/10 p-3"><div className="text-xs text-muted-foreground">Lifetime earned</div><div className="text-2xl font-bold">$1,840</div></div>
          <div className="rounded-2xl glass border border-white/10 p-3"><div className="text-xs text-muted-foreground">Next payout</div><div className="text-2xl font-bold">Jun 1</div></div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">Payouts go out monthly once you hit $50. Connect a payout method in Settings.</p>
      </section>
    </CreatorStudioLayout>
  );
}

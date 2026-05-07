import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CreatorStudioLayout } from "@/components/layout/CreatorStudioLayout";
import { CreatorMetricCard, SectionHeader } from "@/components/creator/CreatorPrimitives";
import { RangePicker, Sparkline, useSeries, type Range } from "@/components/creator/CreatorCharts";
import { Gem, Trophy, TrendingUp, Heart, Wallet, Gift } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/creator-studio/rewards")({
  component: RewardsPage,
  head: () => ({ meta: [{ title: "Rewards — Creator Studio" }] }),
});

const GIFTS = [
  { id: "1", who: "@nightowl", what: "500 pts · Glow Heart", ep: "Late Night S2 E14", ago: "2m", thanked: false },
  { id: "2", who: "@maya", what: "250 pts · Star Boost", ep: "Studio Sessions E8", ago: "1h", thanked: false },
  { id: "3", who: "@lena", what: "100 pts · Crown Tip", ep: "City After Dark Trailer", ago: "3h", thanked: false },
  { id: "4", who: "@zaybeats", what: "1,000 pts · Diamond", ep: "Late Night S2 E14", ago: "1d", thanked: true },
];

function RewardsPage() {
  const [range, setRange] = useState<Range>("30d");
  const length = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 120;
  const giftSeries = useSeries(57, length, 80, 60);
  const [gifts, setGifts] = useState(GIFTS);

  const thank = (id: string) => {
    setGifts((g) => g.map((x) => x.id === id ? { ...x, thanked: true } : x));
    toast.success("Thank-you sent ✨");
  };

  return (
    <CreatorStudioLayout
      title="Rewards & gifts"
      subtitle="Track support from your fans."
      actions={<RangePicker value={range} onChange={setRange} />}
    >
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <CreatorMetricCard label="Total Gifts" value="2,340" delta="+18%" icon={Gem} tone="gold" />
        <CreatorMetricCard label="Points Received" value="12,480" sub="≈ $312 in tips" icon={Wallet} tone="cyan" />
        <CreatorMetricCard label="Top Supporter" value="@nightowl" sub="2,400 pts" icon={Trophy} tone="magenta" />
        <CreatorMetricCard label="Most Gifted" value="Late Night E14" icon={Heart} tone="purple" />
      </section>

      <section className="rounded-3xl glass neon-border p-4 md:p-5">
        <SectionHeader icon={TrendingUp} title={`Gifts over time · ${range}`} />
        <div className="h-40"><Sparkline values={giftSeries} height={140} stroke="oklch(0.78 0.25 340)" fill="oklch(0.78 0.25 340 / 0.18)" /></div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>{length}d ago</span><span>today</span>
        </div>
      </section>

      <section className="rounded-3xl glass neon-border p-4 md:p-5">
        <SectionHeader icon={Gift} title="Recent gift activity" />
        <ul className="divide-y divide-white/5">
          {gifts.map((g) => (
            <li key={g.id} className="flex items-center gap-3 py-3">
              <div className="size-10 rounded-xl grid place-items-center bg-primary/10 text-primary ring-1 ring-primary/30"><Gem className="size-5" /></div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{g.who} <span className="text-muted-foreground font-normal">· {g.ago}</span></div>
                <div className="text-xs text-muted-foreground truncate">{g.what} · on {g.ep}</div>
              </div>
              <button
                onClick={() => !g.thanked && thank(g.id)}
                disabled={g.thanked}
                className={`px-3 py-1.5 rounded-lg text-xs border ${g.thanked ? "border-white/10 text-muted-foreground" : "border-primary text-primary hover:bg-primary/10"}`}
              >{g.thanked ? "Thanked ✓" : "Thank"}</button>
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
        <div className="mt-3 h-2 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-[oklch(0.7_0.25_340)]" style={{ width: "62%" }} />
        </div>
        <p className="text-xs text-muted-foreground mt-2">$312 / $500 toward early payout. Connect a payout method in Settings.</p>
      </section>
    </CreatorStudioLayout>
  );
}

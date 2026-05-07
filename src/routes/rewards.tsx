import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Gem, Gift, Sparkles, Crown, TrendingUp, Wallet, Copy, Plus, ArrowUpRight, Heart, Zap } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/lib/auth";
import { creators } from "@/lib/mock-data";

export const Route = createFileRoute("/rewards")({
  component: Rewards,
  head: () => ({
    meta: [
      { title: "Rewards — Trey TV" },
      { name: "description", content: "Track Trey TV reward points, gift creators, redeem subscriptions and perks." },
    ],
  }),
});

const transactions = [
  { id: "t1", title: "Daily streak bonus", delta: +120, when: "Today" },
  { id: "t2", title: "Gifted Chris H. — Crown", delta: -800, when: "Yesterday" },
  { id: "t3", title: "Comment milestone (50)", delta: +200, when: "2d ago" },
  { id: "t4", title: "Subscription redeem · Pro", delta: -2500, when: "5d ago" },
  { id: "t5", title: "Watched 3hr · weekly bonus", delta: +400, when: "1w ago" },
];

const giftPacks = [
  { id: "g1", name: "Spark", emoji: "✨", cost: 50 },
  { id: "g2", name: "Fire", emoji: "🔥", cost: 200 },
  { id: "g3", name: "Crown", emoji: "👑", cost: 800 },
  { id: "g4", name: "Diamond", emoji: "💎", cost: 1500 },
];

const perks = [
  { id: "p1", title: "Trey TV Pro · 1 month", cost: 2500, Icon: Crown },
  { id: "p2", title: "Aurora filter pack", cost: 600, Icon: Sparkles },
  { id: "p3", title: "Profile boost · 24h", cost: 900, Icon: Zap },
];

function Rewards() {
  const { user } = useAuth();
  const points = user?.rewards?.points ?? 12480;
  const tier = user?.rewards?.tier ?? "GOLD";
  const uid = user?.uid ?? "0000000000000000";

  return (
    <AppShell wide>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Link to="/" className="size-9 grid place-items-center rounded-full liquid-glass border border-white/10"><ArrowLeft className="size-4" /></Link>
          <div className="text-center">
            <div className="text-[10px] tracking-[0.3em] text-primary">REWARDS WALLET</div>
            <h1 className="text-lg font-bold">Your Trey TV Rewards</h1>
          </div>
          <button className="size-9 grid place-items-center rounded-full liquid-glass border border-white/10"><Plus className="size-4" /></button>
        </div>

        {/* Big credit-card */}
        <div className="relative mx-auto w-full max-w-[520px] aspect-[1.586/1] rounded-3xl p-6 overflow-hidden border border-primary/40 bg-[linear-gradient(135deg,oklch(0.22_0.08_85_/_0.85),oklch(0.16_0.05_60_/_0.9)_45%,oklch(0.18_0.06_300_/_0.85))] shadow-[0_30px_70px_-20px_oklch(0_0_0_/_0.8)] glow-gold liquid-hover">
          <div aria-hidden className="absolute inset-0 bg-[linear-gradient(115deg,transparent_30%,oklch(1_0_0_/_0.1)_45%,transparent_60%)]" />
          <div aria-hidden className="absolute -top-20 -right-16 size-56 rounded-full bg-primary/30 blur-3xl" />
          <div aria-hidden className="absolute -bottom-20 -left-16 size-56 rounded-full bg-[oklch(0.7_0.25_340_/_0.3)] blur-3xl" />

          <div className="relative h-full flex flex-col justify-between text-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] tracking-[0.3em] text-white/70">TREY · TV</div>
                <div className="mt-0.5 text-[11px] tracking-[0.25em] text-primary font-semibold">REWARDS WALLET</div>
              </div>
              <div className="size-10 rounded-md bg-[linear-gradient(135deg,oklch(0.85_0.16_85),oklch(0.65_0.15_60))] grid place-items-center shadow-inner">
                <div className="size-7 rounded-sm border border-white/40 grid grid-cols-2 grid-rows-2 gap-px p-0.5">
                  <span className="bg-white/30" /><span className="bg-white/20" /><span className="bg-white/20" /><span className="bg-white/30" />
                </div>
              </div>
            </div>
            <div>
              <div className="font-mono text-base sm:text-xl tracking-[0.25em] flex items-center gap-2">
                {uid.replace(/(.{4})/g, "$1 ").trim()}
                <button onClick={() => { navigator.clipboard?.writeText(uid); toast.success("UID copied"); }} className="text-white/70 hover:text-primary"><Copy className="size-3.5" /></button>
              </div>
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <div className="text-[10px] tracking-[0.2em] text-white/60">MEMBER</div>
                  <div className="text-sm font-semibold uppercase tracking-wider">{user?.name ?? "Trey"}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] tracking-[0.2em] text-white/60">POINTS</div>
                  <div className="text-xl font-bold text-primary drop-shadow-[0_0_8px_var(--gold)]">{points.toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] tracking-[0.2em] text-white/60">TIER</div>
                  <div className="text-base font-bold bg-clip-text text-transparent bg-[linear-gradient(90deg,oklch(0.82_0.16_85),oklch(0.7_0.25_340))]">{tier}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Earned (30d)", value: "+3,240", Icon: TrendingUp, color: "oklch(0.78 0.18 150)" },
            { label: "Spent (30d)", value: "1,800", Icon: Wallet, color: "oklch(0.7 0.25 340)" },
            { label: "Streak", value: "12d", Icon: Sparkles, color: "oklch(0.82 0.16 85)" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl liquid-glass border border-white/10 p-3">
              <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-muted-foreground">
                <s.Icon className="size-3.5" style={{ color: s.color }} /> {s.label.toUpperCase()}
              </div>
              <div className="mt-1 text-lg font-bold">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Send a gift */}
          <section className="rounded-3xl liquid-glass border border-white/10 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold flex items-center gap-2"><Gift className="size-4 text-[oklch(0.7_0.25_340)]" /> Send a gift</h2>
              <Link to="/explore" className="text-xs text-muted-foreground hover:text-foreground">Find creators →</Link>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {creators.slice(0, 5).map((c) => (
                <button key={c.id} className="shrink-0 flex flex-col items-center gap-1 w-16">
                  <div className="size-12 rounded-full conic-ring"><img src={c.avatar} className="size-full rounded-full object-cover" alt="" /></div>
                  <div className="text-[10px] truncate w-full text-center">{c.name}</div>
                </button>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {giftPacks.map((g) => (
                <button key={g.id} onClick={() => toast.success(`Gifted ${g.name}!`)} className="rounded-2xl liquid-glass liquid-hover border border-white/10 p-3 text-center">
                  <div className="text-2xl">{g.emoji}</div>
                  <div className="text-[11px] font-semibold mt-1">{g.name}</div>
                  <div className="text-[10px] text-primary">{g.cost} pts</div>
                </button>
              ))}
            </div>
          </section>

          {/* Redeem */}
          <section className="rounded-3xl liquid-glass border border-white/10 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold flex items-center gap-2"><Sparkles className="size-4 text-primary" /> Redeem perks</h2>
              <Link to="/premium" className="text-xs text-primary hover:underline">Premium →</Link>
            </div>
            <div className="space-y-2">
              {perks.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-2xl glass border border-white/10">
                  <div className="size-10 rounded-xl grid place-items-center bg-primary/15 text-primary"><p.Icon className="size-4" /></div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{p.title}</div>
                    <div className="text-[11px] text-muted-foreground">{p.cost.toLocaleString()} pts</div>
                  </div>
                  <button onClick={() => toast.success(`Redeemed: ${p.title}`)} className="px-3 h-8 rounded-lg text-xs font-semibold bg-primary text-primary-foreground glow-gold">Redeem</button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* History */}
        <section className="rounded-3xl liquid-glass border border-white/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold flex items-center gap-2"><Gem className="size-4 text-[oklch(0.82_0.15_215)]" /> Reward history</h2>
            <button className="text-xs text-muted-foreground hover:text-foreground">Export <ArrowUpRight className="inline size-3" /></button>
          </div>
          <ul className="divide-y divide-white/5">
            {transactions.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className={`size-8 rounded-lg grid place-items-center ${t.delta > 0 ? "bg-[oklch(0.78_0.18_150_/_0.15)] text-[oklch(0.78_0.18_150)]" : "bg-[oklch(0.7_0.25_340_/_0.15)] text-[oklch(0.7_0.25_340)]"}`}>
                    {t.delta > 0 ? <Plus className="size-4" /> : <Heart className="size-4" />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.title}</div>
                    <div className="text-[11px] text-muted-foreground">{t.when}</div>
                  </div>
                </div>
                <div className={`font-mono text-sm font-bold ${t.delta > 0 ? "text-[oklch(0.78_0.18_150)]" : "text-[oklch(0.7_0.25_340)]"}`}>
                  {t.delta > 0 ? "+" : ""}{t.delta.toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Gem, Check, Crown, Sparkles, Zap, Star } from "lucide-react";
import { useGoBack } from "@/hooks/use-go-back";
import { AppShell } from "@/components/layout/AppShell";
import { toast } from "sonner";

export const Route = createFileRoute("/premium")({
  component: Premium,
  head: () => ({
    meta: [
      { title: "Trey TV Premium — Unlock Everything" },
      { name: "description", content: "Exclusive creator tools, AI insights and ad-free viewing on Trey TV Premium." },
    ],
  }),
});

const perks = [
  { icon: Sparkles, label: "Trey-I Pro: unlimited prescriptions, captions & remixes" },
  { icon: Zap, label: "Priority live streaming & 4K uploads" },
  { icon: Crown, label: "Verified Creator badge & profile glow" },
  { icon: Star, label: "Advanced analytics & growth coach" },
];

const tiers = [
  { name: "Monthly", price: "$9.99", period: "/mo", note: "Cancel anytime" },
  { name: "Annual", price: "$79", period: "/yr", note: "Save 34% · Most popular", featured: true },
  { name: "Founders", price: "$199", period: "/yr", note: "Lifetime perks · Limited" },
];

function Premium() {
  const goBack = useGoBack("/");
  return (
    <AppShell>
      <div className="space-y-6 -mt-2">
        <button onClick={goBack} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back
        </button>

        <div className="relative overflow-hidden rounded-3xl border border-[oklch(0.65_0.22_300_/_0.45)] p-6 lg:p-10 bg-[linear-gradient(135deg,oklch(0.25_0.1_300_/_0.6),oklch(0.18_0.05_270_/_0.6))] glow-purple">
          <div aria-hidden className="absolute -top-20 -right-20 size-72 rounded-full bg-[oklch(0.7_0.25_340_/_0.25)] blur-3xl" />
          <div aria-hidden className="absolute -bottom-20 -left-20 size-72 rounded-full bg-primary/15 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] tracking-[0.2em] uppercase border border-white/15 bg-white/5">
              <Gem className="size-3 text-[oklch(0.7_0.25_340)]" /> Premium
            </div>
            <h1 className="mt-3 text-3xl lg:text-5xl font-extrabold leading-tight bg-clip-text text-transparent bg-[linear-gradient(135deg,white,oklch(0.82_0.16_85),oklch(0.7_0.25_340))]">
              Unlock the full Trey TV.
            </h1>
            <p className="mt-3 text-sm text-muted-foreground max-w-prose">
              Premium creators ship faster, look sharper, and grow louder. Get every Trey-I tool, deeper insights, and that signature glow.
            </p>
          </div>
        </div>

        <ul className="grid sm:grid-cols-2 gap-2">
          {perks.map((p, i) => (
            <li key={p.label} style={{ animationDelay: `${i * 60}ms` }} className="animate-rise rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 flex items-start gap-3">
              <div className="size-9 grid place-items-center rounded-xl bg-primary/15 text-primary glow-gold">
                <p.icon className="size-4" />
              </div>
              <div className="text-sm">{p.label}</div>
            </li>
          ))}
        </ul>

        <div className="grid sm:grid-cols-3 gap-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative rounded-2xl border p-4 ${
                t.featured
                  ? "border-primary/50 bg-primary/5 glow-gold"
                  : "border-white/10 glass"
              }`}
            >
              {t.featured && (
                <span className="absolute -top-2 left-3 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">BEST VALUE</span>
              )}
              <div className="text-xs text-muted-foreground">{t.name}</div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-bold">{t.price}</span>
                <span className="text-xs text-muted-foreground">{t.period}</span>
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">{t.note}</div>
              <button
                onClick={() => toast.success(`${t.name} plan — added to checkout (demo)`)}
                className={`mt-3 w-full py-2 rounded-xl text-sm font-semibold tilt-press ${
                  t.featured ? "bg-primary text-primary-foreground" : "border border-white/15 hover:bg-white/5"
                }`}
              >
                <Check className="inline size-4 mr-1" /> Choose
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

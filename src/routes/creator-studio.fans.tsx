import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CreatorStudioLayout } from "@/components/layout/CreatorStudioLayout";
import { SectionHeader, CreatorMetricCard } from "@/components/creator/CreatorPrimitives";
import { Users, Heart, Gem, TrendingUp, MessageSquare, Search, X, Crown, Flame, Star, UserCheck } from "lucide-react";
import { creators } from "@/lib/mock-data";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { toast } from "sonner";

export const Route = createFileRoute("/creator-studio/fans")({
  component: FansPage,
  head: () => ({ meta: [{ title: "Fans — Creator Studio" }] }),
});

const SEGMENTS = [
  { id: "all", label: "All fans", icon: Users },
  { id: "top", label: "Top supporters", icon: Crown },
  { id: "new", label: "New this week", icon: Star },
  { id: "active", label: "Most engaged", icon: Flame },
  { id: "returning", label: "Returning", icon: UserCheck },
] as const;

type FanRow = {
  id: string; name: string; handle: string; avatar: string;
  pts: number; segment: typeof SEGMENTS[number]["id"]; joined: string; watched: number;
};

function FansPage() {
  const [seg, setSeg] = useState<typeof SEGMENTS[number]["id"]>("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<FanRow | null>(null);

  const fans: FanRow[] = useMemo(() => {
    const more = [...creators, ...creators];
    return more.map((c, i) => ({
      id: `${c.id}-${i}`,
      name: c.name,
      handle: c.handle,
      avatar: c.avatar,
      pts: 2400 - i * 180,
      segment: i < 3 ? "top" : i < 5 ? "new" : i < 7 ? "active" : "returning",
      joined: i < 5 ? "This week" : `${i - 1}w ago`,
      watched: 12 + i * 3,
    }));
  }, []);

  const filtered = fans
    .filter((f) => seg === "all" || f.segment === seg)
    .filter((f) => !q || `${f.name} ${f.handle}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <CreatorStudioLayout title="Your fans" subtitle="The people powering your channel.">
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <CreatorMetricCard label="Total Fans" value="32.7K" delta="+1.2K this week" icon={Users} tone="cyan" />
        <CreatorMetricCard label="Returning" value="68%" delta="+4%" icon={TrendingUp} tone="purple" />
        <CreatorMetricCard label="Top Supporter" value="@nightowl" sub="2,400 pts gifted" icon={Gem} tone="gold" />
        <CreatorMetricCard label="Most Engaged" value="Late Night fans" icon={Heart} tone="magenta" />
      </section>

      <div className="rounded-2xl glass neon-border p-3 flex flex-col md:flex-row gap-3 md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search fans by name or @handle…"
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
        </div>
      </div>

      <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1 py-1">
        {SEGMENTS.map((s) => {
          const active = seg === s.id;
          return (
            <button key={s.id} onClick={() => setSeg(s.id)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap transition flex items-center gap-1.5 ${
              active ? "bg-primary/15 text-primary border-primary/40 glow-gold" : "border-white/10 text-muted-foreground hover:text-foreground"
            }`}>
              <s.icon className="size-3.5" /> {s.label}
            </button>
          );
        })}
      </nav>

      <section className="rounded-3xl glass neon-border p-2 md:p-3">
        <SectionHeader icon={Gem} title={`${filtered.length} fans`} />
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">No fans match this filter.</div>
        )}
        <ul className="divide-y divide-white/5">
          {filtered.map((f, i) => (
            <li key={f.id} className="flex items-center gap-3 py-3 px-1">
              <span className="text-xs tabular-nums text-muted-foreground w-6 text-right">#{i + 1}</span>
              <button onClick={() => setOpen(f)} className="flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-90">
                <div className="relative size-10 rounded-full conic-ring shrink-0">
                  <img src={f.avatar} className="size-10 rounded-full object-cover" alt="" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{f.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">@{f.handle} · {f.pts} pts gifted · joined {f.joined}</div>
                </div>
              </button>
              {f.segment === "top" && <span className="hidden md:inline text-[10px] tracking-[0.18em] px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/30 uppercase">Top</span>}
              <button onClick={() => toast.success(`Thanked @${f.handle}`)} className="px-3 py-1.5 rounded-lg text-xs border border-primary text-primary hover:bg-primary/10 inline-flex items-center gap-1">
                <MessageSquare className="size-3.5" /> Thank
              </button>
            </li>
          ))}
        </ul>
      </section>

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent side="right" className="bg-background/95 backdrop-blur-xl border-l border-white/10 w-full sm:max-w-md">
          {open && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <div className="size-14 rounded-2xl conic-ring"><img src={open.avatar} className="size-14 rounded-2xl object-cover" alt="" /></div>
                <div className="min-w-0">
                  <div className="text-lg font-bold truncate">{open.name}</div>
                  <div className="text-xs text-muted-foreground">@{open.handle}</div>
                </div>
                <button onClick={() => setOpen(null)} className="ml-auto size-8 grid place-items-center rounded-lg hover:bg-white/5"><X className="size-4" /></button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Stat label="Pts gifted" value={String(open.pts)} />
                <Stat label="Watched" value={`${open.watched} eps`} />
                <Stat label="Joined" value={open.joined} />
              </div>
              <div className="rounded-2xl glass border border-white/10 p-3">
                <div className="text-[10px] tracking-[0.2em] text-primary mb-1">FAVORITE SHOWS</div>
                <div className="flex flex-wrap gap-1">
                  {["Late Night with Trey", "Studio Sessions"].map((s) => (
                    <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10">{s}</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => toast.success("Message sent")} className="flex-1 px-3 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold">Send message</button>
                <button onClick={() => toast.success("Gifted Glow Heart back")} className="px-3 py-2 rounded-xl text-sm font-semibold glass border border-primary/40 text-primary">Gift back</button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <p className="text-xs text-muted-foreground text-center">More fan insights coming as your channel grows.</p>
    </CreatorStudioLayout>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-2.5 text-center">
      <div className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground">{label}</div>
      <div className="text-sm font-bold mt-0.5">{value}</div>
    </div>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Wand2, ChevronRight, Film, Users, LayoutGrid, Clock, Brain, Heart, TrendingUp, Infinity, Zap, Leaf, Smile, Target, Star, Flame, Cloud } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { moods, prescribed } from "@/lib/mock-data";
import orb from "@/assets/prescribe-orb.jpg";
import { VerifiedBadge } from "@/components/brand/Badge";
import { PrescribeModal } from "@/components/prescribe/PrescribeModal";
import { recordUserTrace } from "@/lib/user-trace";
import { useAuth } from "@/lib/auth";
import { useUserPreferences } from "@/hooks/use-user-preferences";

export const Route = createFileRoute("/prescribe-me")({
  component: PrescribeMe,
  head: () => ({
    meta: [
      { title: "Prescribe Me — Trey TV" },
      { name: "description", content: "Tell Trey-I your vibe and get the perfect creators and content prescribed just for you." },
    ],
  }),
});

const iconMap = { Infinity, Zap, Leaf, Smile, Target, Star, Flame, Cloud } as const;
const moodColor: Record<string, string> = {
  purple: "text-[oklch(0.65_0.22_300)] border-[oklch(0.65_0.22_300_/_0.5)]",
  gold: "text-primary border-primary/50",
  cyan: "text-[oklch(0.82_0.15_215)] border-[oklch(0.82_0.15_215_/_0.5)]",
  magenta: "text-[oklch(0.7_0.25_340)] border-[oklch(0.7_0.25_340_/_0.5)]",
};
const cardTint: Record<string, string> = {
  Content: "from-[oklch(0.7_0.25_340_/_0.15)] to-transparent border-[oklch(0.7_0.25_340_/_0.4)]",
  Creators: "from-[oklch(0.82_0.15_215_/_0.15)] to-transparent border-[oklch(0.82_0.15_215_/_0.4)]",
  Categories: "from-[oklch(0.82_0.16_85_/_0.15)] to-transparent border-primary/40",
  Length: "from-[oklch(0.7_0.25_340_/_0.15)] to-transparent border-[oklch(0.7_0.25_340_/_0.4)]",
};

const prescribedWatchIds = ["e-mind-1", "e-late-1", "e-ctl-1", "e-mind-2", "e-late-2", "e-ctl-2", "e-cad-1", "e-comedy-1", "e-mind-3"];

function FilterCard({ icon: Icon, title, sub, kind, active, onClick }: { icon: typeof Film; title: string; sub: string; kind: keyof typeof cardTint; active?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-full p-3 rounded-2xl glass border bg-gradient-to-br ${cardTint[kind]} flex items-center gap-3 text-left hover:bg-white/[0.04] ${active ? "ring-1 ring-primary/50" : ""}`}>
      <div className="size-10 rounded-xl grid place-items-center bg-white/5">
        <Icon className="size-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground truncate">{sub}</div>
      </div>
      <ChevronRight className="size-4 text-muted-foreground" />
    </button>
  );
}

function PrescribeMe() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { preferences, updateSection } = useUserPreferences();
  const [active, setActive] = useState("all");
  const [quizOpen, setQuizOpen] = useState(false);
  const [contentType, setContentType] = useState("All");
  const [creatorFilter, setCreatorFilter] = useState("All Creators");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [lengthFilter, setLengthFilter] = useState("Any Length");
  useEffect(() => {
    const prefs = preferences.prescribe_preferences;
    if (typeof prefs.activeMood === "string") setActive(prefs.activeMood);
    if (typeof prefs.contentType === "string") setContentType(prefs.contentType);
    if (typeof prefs.creatorFilter === "string") setCreatorFilter(prefs.creatorFilter);
    if (typeof prefs.categoryFilter === "string") setCategoryFilter(prefs.categoryFilter);
    if (typeof prefs.lengthFilter === "string") setLengthFilter(prefs.lengthFilter);
  }, [preferences.prescribe_preferences]);

  const savePrescribePreference = (patch: Record<string, unknown>) => {
    void updateSection("prescribe_preferences", patch);
  };

  const cycle = (current: string, values: string[]) => values[(values.indexOf(current) + 1) % values.length] ?? values[0];
  const traceFilter = (title: string, value: string) => {
    recordUserTrace({ userUid: user?.uid ?? "", action: "prescribe.filter", targetType: "filter", targetId: title, details: { value } });
    toast.success(`${title}: ${value}`);
  };
  const displayItems = active === "all"
    ? prescribed.filter((p) => p.vibes?.includes("all"))
    : prescribed.filter((p) => p.vibes?.includes(active));

  return (
    <AppShell activeTab="prescribe">
      <div className="space-y-6">
        {/* Hero */}
        <div className="relative rounded-3xl overflow-hidden">
          <div className="flex items-center gap-3 p-4 pr-0">
            <div className="flex-1">
              <h1 className="text-3xl font-extrabold tracking-tight text-gradient-prescribe">
                PRESCRIBE ME <Sparkles className="inline size-5 text-[oklch(0.7_0.25_340)]" />
              </h1>
              <p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">
                Tell us your vibe. We'll curate the perfect creators & content for you.
              </p>
            </div>
            <img src={orb} alt="" className="size-32 object-cover rounded-2xl animate-fade-in" />
          </div>
        </div>

        {/* Mood pills */}
        <section>
          <div className="text-[11px] tracking-[0.2em] text-muted-foreground mb-3">HOW ARE YOU FEELING?</div>
          <div className="grid grid-cols-2 gap-2">
            {moods.map((m) => {
              const Icon = iconMap[m.icon as keyof typeof iconMap];
              const isActive = active === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => { setActive(m.id); savePrescribePreference({ activeMood: m.id }); }}
                  className={`flex items-center gap-2 px-3 py-3 rounded-2xl border glass transition ${moodColor[m.color]} ${isActive ? "bg-white/[0.06] shadow-[0_0_24px_-6px_currentColor]" : "hover:bg-white/[0.04]"}`}
                >
                  <Icon className="size-4" />
                  <span className="text-sm font-medium text-foreground">{m.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Filters */}
        <section>
          <div className="text-[11px] tracking-[0.2em] text-muted-foreground mb-3">CUSTOMIZE YOUR EXPERIENCE</div>
          <div className="grid grid-cols-2 gap-2">
            <FilterCard icon={Film} title="Content Type" sub={contentType} kind="Content" active={contentType !== "All"} onClick={() => {
              const next = cycle(contentType, ["All", "Videos", "Music", "Live", "Podcasts"]);
              setContentType(next); savePrescribePreference({ contentType: next }); traceFilter("Content Type", next);
            }} />
            <FilterCard icon={Users} title="Creators" sub={creatorFilter} kind="Creators" active={creatorFilter !== "All Creators"} onClick={() => {
              const next = cycle(creatorFilter, ["All Creators", "Following", "Verified", "New Creators"]);
              setCreatorFilter(next); savePrescribePreference({ creatorFilter: next }); traceFilter("Creators", next);
            }} />
            <FilterCard icon={LayoutGrid} title="Categories" sub={categoryFilter} kind="Categories" active={categoryFilter !== "All Categories"} onClick={() => {
              const next = cycle(categoryFilter, ["All Categories", "Music", "Film", "Lifestyle", "Live"]);
              setCategoryFilter(next); savePrescribePreference({ categoryFilter: next }); traceFilter("Categories", next);
            }} />
            <FilterCard icon={Clock} title="Length" sub={lengthFilter} kind="Length" active={lengthFilter !== "Any Length"} onClick={() => {
              const next = cycle(lengthFilter, ["Any Length", "Under 10 min", "10-30 min", "Long-form"]);
              setLengthFilter(next); savePrescribePreference({ lengthFilter: next }); traceFilter("Length", next);
            }} />
          </div>
        </section>

        {/* AI CTA */}
        <div className="rounded-3xl p-4 border border-[oklch(0.65_0.22_300_/_0.5)] bg-[linear-gradient(135deg,oklch(0.25_0.1_300_/_0.5),oklch(0.18_0.05_270_/_0.6))] glow-purple flex items-center gap-3">
          <div className="size-12 rounded-full border border-[oklch(0.7_0.25_340_/_0.6)] grid place-items-center bg-black/30">
            <Wand2 className="size-5 text-[oklch(0.7_0.25_340)]" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold tracking-wide">AI PRESCRIBE ME</div>
            <div className="text-xs text-muted-foreground">Let Trey-I analyze your vibe and prescribe the perfect content.</div>
          </div>
          <button onClick={() => { recordUserTrace({ userUid: user?.uid ?? "", action: "prescribe.open", targetType: "quiz" }); setQuizOpen(true); }} className="px-3 py-2 rounded-xl text-xs font-semibold border border-[oklch(0.7_0.25_340)] text-[oklch(0.7_0.25_340)] hover:bg-[oklch(0.7_0.25_340_/_0.1)] flex items-center gap-1">
            Get My Prescription <ChevronRight className="size-3" />
          </button>
        </div>

        {/* Prescribed cards */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-wide">YOUR PRESCRIBED FOR YOU</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[oklch(0.65_0.22_300_/_0.2)] text-[oklch(0.7_0.25_340)] border border-[oklch(0.65_0.22_300_/_0.5)]">Fresh Picks</span>
            </div>
            <button onClick={() => navigate({ to: "/explore" })} className="text-xs text-muted-foreground flex items-center gap-1">See all <ChevronRight className="size-3" /></button>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-3 px-3 pb-2">
            {displayItems.length === 0 && (
              <p className="text-sm text-muted-foreground py-4">No picks for this vibe yet. Try a different mood or select All Vibes.</p>
            )}
            {displayItems.map((p) => (
              <button key={p.id} onClick={() => navigate({ to: "/watch/$id", params: { id: prescribedWatchIds[Number(p.id.replace("p", "")) - 1] ?? "e-mind-1" } })} className="w-[180px] shrink-0 rounded-2xl glass border border-white/10 overflow-hidden text-left hover:border-primary/40 transition">
                <div className="relative">
                  <img src={p.media} alt="" className="w-full aspect-[4/5] object-cover" loading="lazy" />
                  <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    p.kind === "LIVE" ? "bg-[oklch(0.65_0.24_15)] text-white" : p.kind === "MUSIC" ? "bg-[oklch(0.82_0.15_215)] text-black" : "bg-[oklch(0.65_0.22_300)] text-white"
                  }`}>
                    {p.kind === "LIVE" ? "● LIVE" : p.kind}
                  </span>
                  {p.duration && (
                    <span className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded bg-black/60 border border-white/10">{p.duration}</span>
                  )}
                  {p.viewers && (
                    <span className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded bg-black/60 border border-white/10">{p.viewers}</span>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-sm font-semibold truncate">{p.title}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">{p.creator} <VerifiedBadge kind="creator" className="!size-3" /></div>
                  <span className={`mt-2 inline-block text-[10px] px-2 py-0.5 rounded-full border ${moodColor[p.moodColor]}`}>{p.mood}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Why */}
        <section className="rounded-3xl p-4 glass border border-white/10">
          <h3 className="text-center text-xs tracking-[0.2em] text-muted-foreground mb-4">WHY THIS WAS PRESCRIBED FOR YOU</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { icon: Brain, label: "Based on your watch history", color: "text-[oklch(0.65_0.22_300)]" },
              { icon: Heart, label: "Matches your current vibe", color: "text-primary" },
              { icon: TrendingUp, label: "Trending with creators you follow", color: "text-[oklch(0.82_0.15_215)]" },
            ].map((w) => (
              <div key={w.label} className="flex flex-col items-center gap-2">
                <div className="size-10 rounded-full grid place-items-center border border-white/10 bg-white/5">
                  <w.icon className={`size-5 ${w.color}`} />
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight">{w.label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <PrescribeModal open={quizOpen} onClose={() => setQuizOpen(false)} />
    </AppShell>
  );
}

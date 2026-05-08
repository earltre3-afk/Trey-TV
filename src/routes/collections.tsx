import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Bookmark, Plus, Folder, Lock, Play } from "lucide-react";
import { useGoBack } from "@/hooks/use-go-back";
import { AppShell } from "@/components/layout/AppShell";
import { prescribed } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/collections")({
  component: Collections,
  head: () => ({ meta: [{ title: "Collections — Trey TV" }] }),
});

const collections = [
  { name: "Late Night Vibes", count: 24, tint: "from-[oklch(0.25_0.1_300_/_0.6)] to-[oklch(0.18_0.05_270_/_0.4)]", private: false },
  { name: "Workout Fuel", count: 18, tint: "from-[oklch(0.25_0.12_85_/_0.5)] to-[oklch(0.18_0.05_60_/_0.4)]", private: false },
  { name: "Saved for later", count: 47, tint: "from-[oklch(0.22_0.08_215_/_0.55)] to-[oklch(0.18_0.05_240_/_0.4)]", private: true },
  { name: "Inspiration board", count: 9, tint: "from-[oklch(0.25_0.12_340_/_0.5)] to-[oklch(0.18_0.05_320_/_0.4)]", private: false },
];

function Collections() {
  return (
    <AppShell>
      <div className="space-y-6 -mt-2">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Back
          </Link>
          <button onClick={() => toast.success("New collection")} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border border-primary/40 text-primary glow-gold tilt-press">
            <Plus className="size-4" /> New
          </button>
        </div>

        <div className="relative rounded-3xl glass-strong border border-white/10 p-5 overflow-hidden">
          <div aria-hidden className="absolute -top-16 -right-16 size-56 rounded-full bg-primary/15 blur-3xl" />
          <div className="relative flex items-center gap-3">
            <div className="size-12 grid place-items-center rounded-2xl bg-primary/15 text-primary glow-gold"><Bookmark className="size-6" /></div>
            <div>
              <h1 className="text-2xl font-bold">Your Collections</h1>
              <p className="text-xs text-muted-foreground">Curated stacks of saved posts, episodes and prescriptions.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {collections.map((c, i) => (
            <button
              key={c.name}
              onClick={() => toast(`Opening "${c.name}"`)}
              style={{ animationDelay: `${i * 60}ms` }}
              className={`animate-rise relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 text-left p-3 bg-gradient-to-br ${c.tint} hover-lift`}
            >
              <Folder className="size-6 text-white/80" />
              <div className="absolute bottom-3 left-3 right-3">
                <div className="text-sm font-semibold flex items-center gap-1">{c.name} {c.private && <Lock className="size-3 text-muted-foreground" />}</div>
                <div className="text-[10px] text-muted-foreground">{c.count} items</div>
              </div>
            </button>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recently saved</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {prescribed.slice(0, 6).map((p) => (
              <div key={p.id} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-white/10">
                <img src={p.media} alt="" className="size-full object-cover" loading="lazy" />
                <span className="absolute bottom-1.5 left-1.5 text-[10px] flex items-center gap-1 text-white/90">
                  <Play className="size-3 fill-white" /> {p.duration ?? "8:30"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

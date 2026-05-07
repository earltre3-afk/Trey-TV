import { createFileRoute } from "@tanstack/react-router";
import { Search, TrendingUp, Flame, Music, Film, Mic2, Gamepad2, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { creators, posts } from "@/lib/mock-data";

export const Route = createFileRoute("/explore")({
  component: Explore,
  head: () => ({
    meta: [
      { title: "Explore — Trey TV" },
      { name: "description", content: "Discover trending creators, shows, and channels on Trey TV." },
    ],
  }),
});

const categories = [
  { icon: Music, label: "Music", color: "text-[oklch(0.7_0.25_340)]" },
  { icon: Film, label: "Shows", color: "text-primary" },
  { icon: Mic2, label: "Podcasts", color: "text-[oklch(0.82_0.15_215)]" },
  { icon: Gamepad2, label: "Gaming", color: "text-[oklch(0.65_0.22_300)]" },
  { icon: Sparkles, label: "Lifestyle", color: "text-[oklch(0.7_0.25_340)]" },
  { icon: Flame, label: "Trending", color: "text-primary" },
];

function Explore() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            placeholder="Search creators, shows, channels…"
            className="w-full pl-9 pr-4 py-3 rounded-2xl glass border border-white/10 text-sm focus:outline-none focus:border-primary/60"
          />
        </div>

        <section>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><TrendingUp className="size-4 text-primary" /> Trending categories</h2>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((c) => (
              <button key={c.label} className="p-4 rounded-2xl glass border border-white/10 flex flex-col items-center gap-2 hover:bg-white/5">
                <c.icon className={`size-6 ${c.color}`} />
                <span className="text-xs font-medium">{c.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold mb-3">Top creators</h2>
          <div className="grid grid-cols-2 gap-3">
            {creators.map((c) => (
              <div key={c.id} className="rounded-2xl glass border border-white/10 p-3 flex items-center gap-3">
                <img src={c.avatar} className="size-12 rounded-full object-cover ring-neon-gold" alt="" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{c.name}</div>
                  <div className="text-xs text-muted-foreground truncate">@{c.handle}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold mb-3">Hot right now</h2>
          <div className="grid grid-cols-2 gap-2">
            {posts.map((p) => (
              <div key={p.id} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10">
                <img src={p.media} alt="" className="size-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-xs font-medium">{p.creator.name}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

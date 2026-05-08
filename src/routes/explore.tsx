import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, TrendingUp, Flame, Music, Film, Mic2, Gamepad2, Sparkles, Play, Eye, Radio } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { creators, posts, prescribed } from "@/lib/mock-data";

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
  { icon: Music, label: "Music", color: "text-[oklch(0.7_0.25_340)]", bg: "bg-[oklch(0.7_0.25_340_/_0.1)]" },
  { icon: Film, label: "Shows", color: "text-primary", bg: "bg-primary/10" },
  { icon: Mic2, label: "Podcasts", color: "text-[oklch(0.82_0.15_215)]", bg: "bg-[oklch(0.82_0.15_215_/_0.1)]" },
  { icon: Gamepad2, label: "Gaming", color: "text-[oklch(0.65_0.22_300)]", bg: "bg-[oklch(0.65_0.22_300_/_0.1)]" },
  { icon: Sparkles, label: "Lifestyle", color: "text-[oklch(0.7_0.25_340)]", bg: "bg-[oklch(0.7_0.25_340_/_0.1)]" },
  { icon: Flame, label: "Trending", color: "text-primary", bg: "bg-primary/10" },
];

const filters = ["All", "Music", "Shows", "Live", "Podcasts", "Gaming", "Lifestyle", "New"];

function Explore() {
  const [active, setActive] = useState("All");
  const hero = posts[0];

  return (
    <AppShell wide>
      <div className="space-y-8">
        {/* Hero spotlight — desktop showcase */}
        <section className="hidden lg:block relative overflow-hidden rounded-[2rem] border border-white/10 glass">
          <div className="absolute inset-0">
            <img src={hero.media} alt="" className="size-full object-cover opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          </div>
          <div className="relative grid grid-cols-2 gap-8 p-10 min-h-[340px]">
            <div className="flex flex-col justify-center">
              <div className="text-[11px] tracking-[0.3em] text-primary font-semibold">FEATURED · TONIGHT</div>
              <h1 className="mt-3 text-4xl xl:text-5xl font-bold leading-tight">Discover the next wave of creators</h1>
              <p className="mt-4 text-base text-muted-foreground max-w-md">Trending shows, live channels and editor-picked drops — refreshed every hour.</p>
              <div className="mt-6 flex items-center gap-3">
                <button className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold glow-gold tilt-press flex items-center gap-2"><Play className="size-4 fill-current" /> Watch trailer</button>
                <Link to="/prescribe-me" className="px-5 py-2.5 rounded-full glass border border-white/15 font-semibold hover:bg-white/5">Prescribe me</Link>
              </div>
            </div>
            <div className="hidden xl:flex items-center justify-end">
              <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                {prescribed.slice(0, 4).map((p) => (
                  <div key={p.id} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group">
                    <img src={p.media} alt="" className="size-full object-cover transition group-hover:scale-105" />
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="text-[9px] tracking-widest text-primary">{p.kind}</div>
                      <div className="text-xs font-semibold truncate">{p.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Search + filters */}
        <div className="space-y-4">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              placeholder="Search creators, shows, channels…"
              className="w-full pl-11 pr-4 py-3 lg:py-4 rounded-2xl glass border border-white/10 text-sm lg:text-base focus:outline-none focus:border-primary/60"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-3 px-3">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs lg:text-sm font-semibold transition ${
                  active === f
                    ? "bg-primary text-primary-foreground glow-gold"
                    : "glass border border-white/10 text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <section>
          <h2 className="text-sm lg:text-base font-semibold mb-3 flex items-center gap-2"><TrendingUp className="size-4 text-primary" /> Trending categories</h2>
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 lg:gap-3">
            {categories.map((c) => (
              <button key={c.label} className={`group p-4 lg:p-5 rounded-2xl glass border border-white/10 flex flex-col items-center gap-2 lg:gap-3 hover:bg-white/5 hover-lift`}>
                <div className={`size-10 lg:size-12 rounded-xl grid place-items-center ${c.bg} ${c.color} transition group-hover:scale-110`}>
                  <c.icon className="size-5 lg:size-6" />
                </div>
                <span className="text-xs lg:text-sm font-medium">{c.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Top creators */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm lg:text-base font-semibold">Top creators</h2>
            <button className="text-xs text-primary hover:underline">See all</button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {creators.map((c) => (
              <Link
                to="/channel/$handle"
                params={{ handle: c.handle }}
                key={c.id}
                className="group rounded-2xl glass border border-white/10 p-4 flex flex-col items-center gap-3 hover-lift relative overflow-hidden"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-[radial-gradient(circle_at_50%_0%,oklch(0.82_0.16_85_/_0.15),transparent_70%)]" />
                <div className="relative size-16 lg:size-20 rounded-full conic-ring">
                  <img src={c.avatar} className="size-full rounded-full object-cover" alt="" />
                  {c.live && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-[oklch(0.65_0.24_15)] text-white animate-glow-pulse">LIVE</span>
                  )}
                </div>
                <div className="text-center min-w-0 w-full">
                  <div className="text-sm font-semibold truncate">{c.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">@{c.handle}</div>
                </div>
                <button className="text-[11px] px-3 py-1 rounded-full border border-primary/40 text-primary hover:bg-primary/10">Follow</button>
              </Link>
            ))}
          </div>
        </section>

        {/* Hot grid + side rail on desktop */}
        <section className="grid lg:grid-cols-[1fr_320px] gap-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm lg:text-base font-semibold flex items-center gap-2"><Flame className="size-4 text-[oklch(0.7_0.25_340)]" /> Hot right now</h2>
              <button className="text-xs text-primary hover:underline">More</button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-3">
              {[...posts, ...prescribed.map((p) => ({ id: p.id, media: p.media, creator: { name: p.creator } }))].map((p, i) => (
                <div key={`${p.id}-${i}`} className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 cursor-pointer">
                  <img src={p.media} alt="" className="size-full object-cover transition duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/50 backdrop-blur text-white">
                    <Eye className="size-3" /> {(Math.random() * 20).toFixed(1)}K
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <div className="text-xs font-semibold text-white truncate">{p.creator.name}</div>
                  </div>
                  <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition">
                    <div className="size-12 rounded-full bg-primary/90 grid place-items-center glow-gold">
                      <Play className="size-5 fill-primary-foreground text-primary-foreground" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Side rail — desktop */}
          <aside className="hidden lg:flex flex-col gap-4 sticky top-6 h-fit">
            <div className="rounded-3xl glass neon-border p-4">
              <h3 className="text-sm font-bold flex items-center gap-2 mb-3"><Radio className="size-4 text-[oklch(0.65_0.24_15)]" /> Live channels</h3>
              <ul className="space-y-3">
                {creators.slice(0, 4).map((c) => (
                  <li key={c.id} className="flex items-center gap-3">
                    <div className="relative size-10 rounded-lg overflow-hidden">
                      <img src={c.avatar} className="size-full object-cover" alt="" />
                      <span className="absolute inset-0 ring-2 ring-[oklch(0.65_0.24_15)] rounded-lg" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{c.name}</div>
                      <div className="text-[11px] text-muted-foreground">{(Math.random() * 5 + 1).toFixed(1)}K viewers</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl glass neon-border p-4">
              <h3 className="text-sm font-bold mb-3">Editor's picks</h3>
              <ul className="space-y-3">
                {prescribed.map((p) => (
                  <li key={p.id} className="flex items-center gap-3">
                    <div className="size-12 rounded-lg overflow-hidden shrink-0">
                      <img src={p.media} alt="" className="size-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] tracking-widest text-primary">{p.kind}</div>
                      <div className="text-sm font-semibold truncate">{p.title}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{p.creator}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </section>
      </div>
    </AppShell>
  );
}

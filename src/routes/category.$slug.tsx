import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Play, Eye, Flame, ArrowLeft, TrendingUp, Music, Film, Mic2, Gamepad2, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { posts, prescribed, creators } from "@/lib/mock-data";

const CATEGORIES: Record<string, { label: string; blurb: string; icon: any; accent: string }> = {
  music: { label: "Music", blurb: "Top tracks, live sessions and breakout artists.", icon: Music, accent: "oklch(0.7 0.25 340)" },
  shows: { label: "Shows", blurb: "Binge-worthy episodes and original series.", icon: Film, accent: "oklch(0.82 0.16 85)" },
  podcasts: { label: "Podcasts", blurb: "Conversations, interviews and deep dives.", icon: Mic2, accent: "oklch(0.82 0.15 215)" },
  gaming: { label: "Gaming", blurb: "Streams, highlights and playthroughs.", icon: Gamepad2, accent: "oklch(0.65 0.22 300)" },
  lifestyle: { label: "Lifestyle", blurb: "Fashion, travel, food and daily vibes.", icon: Sparkles, accent: "oklch(0.7 0.25 340)" },
  trending: { label: "Trending", blurb: "Everything blowing up across Trey TV right now.", icon: Flame, accent: "oklch(0.82 0.16 85)" },
};

export const Route = createFileRoute("/category/$slug")({
  beforeLoad: ({ params }) => {
    if (!CATEGORIES[params.slug.toLowerCase()]) throw notFound();
  },
  component: CategoryPage,
  head: ({ params }) => {
    const c = CATEGORIES[params.slug.toLowerCase()];
    return {
      meta: [
        { title: `${c?.label ?? "Category"} — Trey TV` },
        { name: "description", content: c?.blurb ?? "Explore popular videos by category." },
      ],
    };
  },
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const cat = CATEGORIES[slug.toLowerCase()];
  const Icon = cat.icon;

  // Build a popular video list deterministically from mock data
  const items = [
    ...prescribed.map((p, i) => ({
      id: p.id,
      title: p.title,
      creator: p.creator,
      media: p.media,
      kind: p.kind,
      views: `${(420 - i * 37).toFixed(0)}K`,
      duration: (p as any).duration ?? "LIVE",
    })),
    ...posts.map((p, i) => ({
      id: p.id,
      title: p.text.split("\n")[0].slice(0, 48),
      creator: p.creator.name,
      media: p.media,
      kind: "POST",
      views: `${(p.likes / 10).toFixed(0)}K`,
      duration: p.duration,
    })),
  ];

  const hero = items[0];
  const rest = items.slice(1);

  return (
    <AppShell wide>
      <div className="space-y-6">
        <Link to="/explore" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to Explore
        </Link>

        {/* Header */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 glass p-6 lg:p-10">
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{ background: `radial-gradient(circle at 20% 0%, ${cat.accent}, transparent 60%)` }}
          />
          <div className="relative flex items-center gap-4">
            <div className="size-14 lg:size-16 rounded-2xl grid place-items-center" style={{ background: `${cat.accent.replace(")", " / 0.15)")}`, color: cat.accent }}>
              <Icon className="size-7" />
            </div>
            <div>
              <div className="text-[11px] tracking-[0.3em] text-primary font-semibold flex items-center gap-2">
                <TrendingUp className="size-3" /> POPULAR · {cat.label.toUpperCase()}
              </div>
              <h1 className="text-2xl lg:text-4xl font-bold mt-1">{cat.label}</h1>
              <p className="text-sm lg:text-base text-muted-foreground mt-1 max-w-xl">{cat.blurb}</p>
            </div>
          </div>
        </section>

        {/* Hero pick */}
        <section className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 group cursor-pointer">
            <img src={hero.media} alt="" className="size-full object-cover transition group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary text-primary-foreground">#1 IN {cat.label.toUpperCase()}</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-white flex items-center gap-1"><Eye className="size-3" /> {hero.views}</span>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-5">
              <div className="text-[10px] tracking-widest text-primary">{hero.kind}</div>
              <div className="text-xl lg:text-2xl font-bold text-white mt-1">{hero.title}</div>
              <div className="text-xs text-white/70">{hero.creator} · {hero.duration}</div>
            </div>
            <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition">
              <div className="size-16 rounded-full bg-primary/90 grid place-items-center glow-gold">
                <Play className="size-7 fill-primary-foreground text-primary-foreground" />
              </div>
            </div>
          </div>

          <aside className="rounded-3xl glass neon-border p-4">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><Flame className="size-4 text-[oklch(0.7_0.25_340)]" /> Top creators in {cat.label}</h3>
            <ul className="space-y-3">
              {creators.slice(0, 4).map((c) => (
                <li key={c.id} className="flex items-center gap-3">
                  <img src={c.avatar} className="size-10 rounded-full object-cover ring-1 ring-white/15" alt="" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{c.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">@{c.handle}</div>
                  </div>
                  <Link to="/channel/$handle" params={{ handle: c.handle }} className="text-[11px] px-2.5 py-1 rounded-full border border-primary/40 text-primary hover:bg-primary/10">View</Link>
                </li>
              ))}
            </ul>
          </aside>
        </section>

        {/* Popular grid */}
        <section>
          <h2 className="text-base lg:text-lg font-semibold mb-3">Most popular in {cat.label}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {rest.concat(rest).map((p, i) => (
              <div key={`${p.id}-${i}`} className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 cursor-pointer">
                <img src={p.media} alt="" className="size-full object-cover transition duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 backdrop-blur text-white">
                  <Eye className="size-3" /> {p.views}
                </div>
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/60 text-white">{p.duration}</div>
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <div className="text-[10px] tracking-widest text-primary">{p.kind}</div>
                  <div className="text-sm font-semibold text-white truncate">{p.title}</div>
                  <div className="text-[11px] text-white/70 truncate">{p.creator}</div>
                </div>
                <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition">
                  <div className="size-12 rounded-full bg-primary/90 grid place-items-center glow-gold">
                    <Play className="size-5 fill-primary-foreground text-primary-foreground" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

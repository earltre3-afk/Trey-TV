import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Play, Eye, Flame, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { posts, prescribed, creators } from "@/lib/mock-data";
import { useGoBack } from "@/hooks/use-go-back";

export const Route = createFileRoute("/category/$slug")({
  component: CategoryPage,
  head: ({ params }) => ({
    meta: [
      { title: `${cap(params.slug)} — Popular on Trey TV` },
      {
        name: "description",
        content: `Most popular ${params.slug} videos and creators trending right now on Trey TV.`,
      },
      { property: "og:title", content: `${cap(params.slug)} — Popular on Trey TV` },
      {
        property: "og:description",
        content: `Discover the top ${params.slug} content on Trey TV.`,
      },
    ],
  }),
});

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const CATEGORY_META: Record<string, { label: string; tagline: string; tint: string }> = {
  music: {
    label: "Music",
    tagline: "Beats, drops and live sets dominating the charts.",
    tint: "oklch(0.7 0.25 340)",
  },
  shows: {
    label: "Shows",
    tagline: "Binge-worthy series and breakout episodes.",
    tint: "oklch(0.82 0.16 85)",
  },
  podcasts: {
    label: "Podcasts",
    tagline: "Voices, conversations and hot mic moments.",
    tint: "oklch(0.82 0.15 215)",
  },
  gaming: {
    label: "Gaming",
    tagline: "Top streams, plays and tournament highlights.",
    tint: "oklch(0.65 0.22 300)",
  },
  lifestyle: {
    label: "Lifestyle",
    tagline: "Fashion, food and the day-in-the-life drops.",
    tint: "oklch(0.7 0.25 340)",
  },
  trending: {
    label: "Trending",
    tagline: "Everything blowing up right now.",
    tint: "oklch(0.82 0.16 85)",
  },
};

function CategoryPage() {
  const { slug } = Route.useParams();
  const meta = CATEGORY_META[slug] ?? {
    label: cap(slug),
    tagline: "Top videos in this category.",
    tint: "oklch(0.82 0.16 85)",
  };
  const goBack = useGoBack("/explore");

  // Build a popular list — in real app would come from backend; here we synthesize stable scores per slug.
  const pool = [
    ...prescribed.map((p) => ({
      id: p.id,
      title: p.title,
      media: p.media,
      creator: p.creator,
      kind: p.kind,
      duration: p.duration ?? p.viewers ?? "—",
    })),
    ...posts.map((p) => ({
      id: p.id,
      title: p.text.split("\n")[0],
      media: p.media,
      creator: p.creator.name,
      kind: "VIDEO",
      duration: p.duration,
    })),
  ];
  const popular = pool
    .map((p, i) => ({ ...p, views: (((p.id.charCodeAt(0) + slug.length + i) * 137) % 950) + 50 }))
    .sort((a, b) => b.views - a.views);

  const topCreators = creators.slice(0, 4);

  return (
    <AppShell wide>
      <div className="space-y-6">
        <button
          onClick={goBack}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Back
        </button>

        {/* Hero */}
        <section
          className="relative overflow-hidden rounded-3xl glass neon-border p-6 lg:p-10"
          style={{
            background: `radial-gradient(circle at 20% 0%, color-mix(in oklab, ${meta.tint} 28%, transparent), transparent 60%), radial-gradient(circle at 90% 100%, color-mix(in oklab, ${meta.tint} 18%, transparent), transparent 60%)`,
          }}
        >
          <div
            className="text-[11px] tracking-[0.3em] font-semibold flex items-center gap-1.5"
            style={{ color: meta.tint }}
          >
            <Flame className="size-3.5" /> POPULAR · {meta.label.toUpperCase()}
          </div>
          <h1 className="mt-3 text-3xl lg:text-5xl font-bold leading-tight">
            Top {meta.label} on Trey TV
          </h1>
          <p className="mt-3 text-sm lg:text-base text-muted-foreground max-w-xl">{meta.tagline}</p>
        </section>

        {/* Top creators rail */}
        <section>
          <h2 className="text-sm lg:text-base font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="size-4" style={{ color: meta.tint }} /> Top{" "}
            {meta.label.toLowerCase()} creators
          </h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-3 px-3 pb-1">
            {topCreators.map((c) => (
              <Link
                key={c.id}
                to="/channel/$handle"
                params={{ handle: c.handle }}
                className="shrink-0 w-32 rounded-2xl glass border border-white/10 p-3 flex flex-col items-center gap-2 hover-lift"
              >
                <div className="size-14 rounded-full conic-ring">
                  <img src={c.avatar} alt="" className="size-full rounded-full object-cover" />
                </div>
                <div className="text-xs font-semibold truncate w-full text-center">{c.name}</div>
                <div className="text-[10px] text-muted-foreground truncate w-full text-center">
                  @{c.handle}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Popular grid */}
        <section>
          <h2 className="text-sm lg:text-base font-semibold mb-3">Most popular</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {popular.map((p, i) => (
              <Link
                key={`${p.id}-${i}`}
                to="/watch/$id"
                params={{ id: String(p.id) }}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10"
              >
                <img
                  src={p.media}
                  alt=""
                  className="size-full object-cover transition duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 backdrop-blur text-white">
                  <Eye className="size-3" /> {(p.views / 10).toFixed(1)}K
                </div>
                {i < 3 && (
                  <div className="absolute top-2 right-2 size-6 grid place-items-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold glow-gold">
                    {i + 1}
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <div className="text-[9px] tracking-widest" style={{ color: meta.tint }}>
                    {p.kind}
                  </div>
                  <div className="text-xs font-semibold text-white truncate">{p.title}</div>
                  <div className="text-[10px] text-white/70 truncate">{p.creator}</div>
                </div>
                <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition">
                  <div className="size-12 rounded-full bg-primary/90 grid place-items-center glow-gold">
                    <Play className="size-5 fill-primary-foreground text-primary-foreground" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

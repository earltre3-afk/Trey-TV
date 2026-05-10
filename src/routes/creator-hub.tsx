import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { currentUser, posts, creators } from "@/lib/mock-data";
import { VerifiedBadge } from "@/components/brand/Badge";
import {
  Crown, Upload, Radio, Wand2, Film, Music2, Mic, Calendar,
  TrendingUp, Eye, Heart, DollarSign, Users, Sparkles, ChevronRight, Plus, Play, Clock,
} from "lucide-react";

export const Route = createFileRoute("/creator-hub")({
  component: CreatorHub,
  head: () => ({
    meta: [
      { title: "Creator Hub — Trey TV" },
      { name: "description", content: "Manage your channel, shows, episodes and audience on Trey TV." },
    ],
  }),
});

const kpis = [
  { label: "Watch Hours", value: "184.2K", delta: "+12.4%", icon: Eye, tone: "cyan" },
  { label: "New Followers", value: "8,412", delta: "+5.1%", icon: Users, tone: "purple" },
  { label: "Engagement", value: "9.7%", delta: "+1.3%", icon: Heart, tone: "magenta" },
  { label: "Revenue (30d)", value: "$12,840", delta: "+18.6%", icon: DollarSign, tone: "gold" },
] as const;

const toneMap: Record<string, string> = {
  cyan: "from-[oklch(0.82_0.15_215_/_0.25)] to-transparent text-[oklch(0.82_0.15_215)] ring-[oklch(0.82_0.15_215_/_0.4)]",
  purple: "from-[oklch(0.65_0.22_300_/_0.25)] to-transparent text-[oklch(0.65_0.22_300)] ring-[oklch(0.65_0.22_300_/_0.4)]",
  magenta: "from-[oklch(0.7_0.25_340_/_0.25)] to-transparent text-[oklch(0.7_0.25_340)] ring-[oklch(0.7_0.25_340_/_0.4)]",
  gold: "from-[oklch(0.82_0.16_85_/_0.28)] to-transparent text-primary ring-primary/40",
};

const shows = [
  { id: "s1", title: "Late Night with Trey", season: 2, ep: 14, status: "Live Tonight", media: posts[0].media, color: "magenta" },
  { id: "s2", title: "Studio Sessions", season: 1, ep: 8, status: "New Episode", media: posts[1].media, color: "cyan" },
  { id: "s3", title: "City After Dark", season: 3, ep: 22, status: "Top 10", media: posts[2].media, color: "purple" },
];

const tools = [
  { icon: Film, label: "Upload Episode", desc: "Drop a new episode into a show" },
  { icon: Radio, label: "Go Live", desc: "Stream to your audience now" },
  { icon: Music2, label: "Drop a Track", desc: "Release audio to your channel" },
  { icon: Mic, label: "Record Podcast", desc: "Capture audio with Trey-I" },
  { icon: Wand2, label: "Trey-I Studio", desc: "AI thumbnails, clips, captions" },
  { icon: Calendar, label: "Schedule", desc: "Plan drops across the week" },
];

function CreatorHub() {
  const navigate = useNavigate();
  return (
    <AppShell wide>
      <div className="space-y-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl glass neon-border p-6 md:p-8 hover-lift">
          <div className="absolute -top-24 -right-24 size-72 rounded-full bg-[radial-gradient(circle,oklch(0.7_0.25_340_/_0.4),transparent_70%)] blur-2xl" />
          <div className="absolute -bottom-32 -left-16 size-80 rounded-full bg-[radial-gradient(circle,oklch(0.65_0.22_300_/_0.35),transparent_70%)] blur-2xl" />
          <div className="relative flex flex-col md:flex-row md:items-center gap-5">
            <div className="relative size-20 md:size-24 rounded-2xl conic-ring shrink-0">
              <img src={currentUser.avatar} className="size-full rounded-2xl object-cover" alt="" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] text-primary mb-1">
                <Crown className="size-3.5" /> CREATOR HUB
              </div>
              <h1 className="text-2xl md:text-4xl font-bold flex items-center gap-2 flex-wrap">
                <span className="text-gradient-gold">{currentUser.name}'s Network</span>
                <VerifiedBadge kind="creator" />
              </h1>
              <p className="text-sm text-muted-foreground mt-1">@{currentUser.handle} · {currentUser.stats.followers} followers · {currentUser.stats.posts} posts</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => navigate({ to: "/creator-studio/edit" })} className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground glow-gold hover-lift tilt-press flex items-center gap-2">
                <Upload className="size-4" /> Upload
              </button>
              <button onClick={() => navigate({ to: "/go-live" })} className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-[oklch(0.7_0.25_340)] text-[oklch(0.7_0.25_340)] hover-lift tilt-press flex items-center gap-2">
                <Radio className="size-4" /> Go Live
              </button>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {kpis.map((k, i) => (
            <div
              key={k.label}
              style={{ animationDelay: `${i * 80}ms` }}
              className={`relative rounded-2xl p-4 glass ring-1 ${toneMap[k.tone]} bg-gradient-to-br animate-rise hover-lift overflow-hidden`}
            >
              <div className="shimmer-sweep absolute inset-0 rounded-2xl" />
              <div className="relative flex items-start justify-between">
                <div>
                  <div className="text-[10px] tracking-[0.2em] text-muted-foreground">{k.label.toUpperCase()}</div>
                  <div className="mt-1 text-2xl md:text-3xl font-bold">{k.value}</div>
                  <div className="mt-1 text-xs flex items-center gap-1 opacity-90"><TrendingUp className="size-3" /> {k.delta}</div>
                </div>
                <div className="size-10 rounded-xl bg-white/10 grid place-items-center">
                  <k.icon className="size-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tools */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Sparkles className="size-4 text-primary" /> Studio Tools</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {tools.map((t, i) => {
              const toolDestinations: Record<string, string> = {
                "Upload Episode": "/creator-studio/edit",
                "Go Live": "/go-live",
                "Drop a Track": "/creator-studio/edit",
                "Record Podcast": "/creator-studio/edit",
                "Trey-I Studio": "/creator-studio/edit",
                "Schedule": "/creator-studio/edit",
              };
              const isStudio = t.label === "Trey-I Studio" || t.label === "Upload Episode";
              const onClick = () => navigate({ to: toolDestinations[t.label] as any });
              return (
                <button
                  key={t.label}
                  onClick={onClick}
                  style={{ animationDelay: `${i * 50}ms` }}
                  className={`group relative rounded-2xl p-4 glass neon-border hover-lift tilt-press text-left animate-rise overflow-hidden ${isStudio ? "ring-1 ring-primary/40 glow-gold" : ""}`}
                >
                  <div className="size-10 rounded-xl grid place-items-center bg-white/5 group-hover:scale-110 transition">
                    <t.icon className="size-5 text-primary" />
                  </div>
                  <div className="mt-3 text-sm font-semibold flex items-center gap-1">
                    {t.label}
                    {isStudio && <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary text-primary-foreground font-bold">OPEN</span>}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{t.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Shows / Seasons */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Film className="size-4 text-primary" /> Your Shows</h2>
            <button onClick={() => navigate({ to: "/creator-studio/edit" })} className="text-sm text-primary flex items-center gap-1"><Plus className="size-4" /> New show</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {shows.map((s, i) => (
              <article
                key={s.id}
                style={{ animationDelay: `${i * 80}ms` }}
                className="group relative rounded-3xl overflow-hidden glass neon-border hover-lift animate-rise"
              >
                <div className="relative aspect-[16/10] shimmer-sweep">
                  <img src={s.media} className="absolute inset-0 size-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <span className="absolute top-3 left-3 text-[10px] tracking-[0.18em] px-2 py-1 rounded-full bg-black/60 backdrop-blur border border-white/15">
                    SEASON {s.season} · EP {s.ep}
                  </span>
                  <span className="absolute top-3 right-3 text-[10px] tracking-[0.18em] px-2 py-1 rounded-full bg-primary/20 text-primary border border-primary/40 animate-glow-pulse">
                    {s.status}
                  </span>
                  <button onClick={() => navigate({ to: "/creator-studio/edit" })} className="absolute bottom-3 right-3 size-11 rounded-full grid place-items-center bg-white text-black shadow-[0_0_24px_oklch(1_0_0_/_0.4)] hover:scale-110 transition">
                    <Play className="size-5 fill-current" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-base">{s.title}</h3>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye className="size-3" /> 12.4K</span>
                    <span className="flex items-center gap-1"><Heart className="size-3" /> 1.2K</span>
                    <span className="flex items-center gap-1"><Clock className="size-3" /> 32:14</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Top Fans */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Users className="size-4 text-primary" /> Top Fans</h2>
            <button onClick={() => navigate({ to: "/analytics" })} className="text-sm text-primary flex items-center gap-1">View all <ChevronRight className="size-4" /></button>
          </div>
          <div className="rounded-3xl glass neon-border p-3 md:p-4">
            <ul className="divide-y divide-white/5">
              {creators.map((c, i) => (
                <li key={c.id} className="flex items-center gap-3 py-3 px-2 rounded-xl hover:bg-white/5 transition">
                  <span className="text-xs tabular-nums text-muted-foreground w-6">#{i + 1}</span>
                  <div className="relative size-10 rounded-full conic-ring shrink-0">
                    <img src={c.avatar} className="size-10 rounded-full object-cover" alt="" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold flex items-center gap-1">{c.name} <VerifiedBadge kind={c.verified} className="!size-3.5" /></div>
                    <div className="text-[11px] text-muted-foreground">@{c.handle}</div>
                  </div>
                  <div className="text-xs text-muted-foreground hidden md:block">{(98 - i * 7)}h watched</div>
                  <button onClick={() => navigate({ to: "/inbox" })} className="px-3 py-1.5 rounded-lg text-xs border border-primary text-primary hover:bg-primary/10">Message</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

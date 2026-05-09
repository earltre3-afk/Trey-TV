import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Star, Flame, TrendingUp, Sparkles, Radio, UserPlus } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { AppShell } from "@/components/layout/AppShell";
import { Composer } from "@/components/feed/Composer";
import { CreatorRail } from "@/components/feed/CreatorRail";
import { PostCard } from "@/components/feed/PostCard";
import { posts as mockPosts, creators, prescribed } from "@/lib/mock-data";
import { useFeed } from "@/lib/feed-store";
import { usePosts } from "@/hooks/use-posts";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Trey TV — Premium Creator Network" },
      { name: "description", content: "A futuristic creator-TV network. Watch shows, follow creators, and get mood-based picks with Prescribe Me." },
    ],
  }),
});

function Home() {
  const [tab, setTab] = useState("for-you");
  const { posts: userPosts } = useFeed();
  const { posts: dbPosts, loading: dbLoading } = usePosts();

  const mappedDbPosts = dbPosts.map(p => {
    const pAuthor = p.author || p.creator || {};
    return {
      id: p.id,
      creator: {
        id: pAuthor.public_profile_uid || p.id,
        name: pAuthor.display_name || pAuthor.username || "Anonymous",
        handle: pAuthor.username || "anonymous",
        avatar: pAuthor.avatar_url || creators[0].avatar,
        ring: "cyan" as const,
        verified: pAuthor.is_creator ? ("creator" as const) : ("user" as const),
      },
      timeAgo: formatDistanceToNowStrict(new Date(p.created_at), { addSuffix: false }),
      text: p.content || p.body || "",
      media: p.image_url || (p.media_urls && p.media_urls.length > 0 ? p.media_urls[0] : undefined),
      likes: p.likes_count || 0,
      comments: p.comments_count || 0,
      reshares: 0,
      saves: 0,
    };
  });

  const basePosts = mappedDbPosts.length > 0 ? mappedDbPosts : mockPosts;
  const merged = [...userPosts, ...basePosts];
  const filtered =
    tab === "following"
      ? merged.slice(0, 2 + userPosts.length)
      : tab === "latest"
        ? [...userPosts, ...[...basePosts].reverse()]
        : merged;

  const heading =
    tab === "following" ? "From creators you follow"
      : tab === "latest" ? "Latest drops"
      : "Recommended for you";

  return (
    <AppShell activeTab={tab} onTabChange={setTab} wide>
      {/* Desktop tabs strip */}
      <div className="hidden lg:flex items-center gap-2 mb-6">
        {[
          { id: "for-you", label: "For You" },
          { id: "following", label: "Following" },
          { id: "latest", label: "Latest" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              tab === t.id
                ? "bg-primary text-primary-foreground glow-gold"
                : "glass border border-white/10 text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
        <div className="ml-auto text-xs text-muted-foreground">Live network · {basePosts.length * 412} active viewers</div>
      </div>

      {/* Desktop: 3-col grid · Mobile: stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,640px)_320px] xl:grid-cols-[1fr_minmax(0,720px)_360px] lg:gap-8">
        {/* LEFT RAIL — desktop only · creators + quick actions */}
        <aside className="hidden lg:flex flex-col gap-4 sticky top-6 h-fit">
          <section className="rounded-3xl glass neon-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold flex items-center gap-2"><Radio className="size-4 text-[oklch(0.65_0.24_15)]" /> Live now</h3>
              <Link to="/explore" className="text-[11px] text-primary hover:underline">All</Link>
            </div>
            <ul className="space-y-2.5">
              {creators.filter((c) => c.live).concat(creators.slice(0, 3)).slice(0, 4).map((c) => (
                <li key={c.id + Math.random()} className="flex items-center gap-3">
                  <div className="relative size-10 rounded-full conic-ring shrink-0">
                    <img src={c.avatar} alt="" className="size-10 rounded-full object-cover" />
                    {c.live && <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-[oklch(0.65_0.24_15)] ring-2 ring-background animate-glow-pulse" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{c.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">@{c.handle}</div>
                  </div>
                  <button onClick={() => toast(`Followed ${c.name}`)} className="text-[11px] px-2.5 py-1 rounded-full border border-primary/40 text-primary hover:bg-primary/10">Follow</button>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl glass neon-border p-4">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-3"><Sparkles className="size-4 text-primary" /> Quick picks</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/prescribe-me" className="rounded-2xl glass border border-white/10 p-3 hover:bg-white/5">
                <div className="text-[10px] tracking-widest text-primary">PRESCRIBE</div>
                <div className="text-sm font-semibold mt-1">Mood mix</div>
              </Link>
              <Link to="/go-live" className="rounded-2xl glass border border-white/10 p-3 hover:bg-white/5">
                <div className="text-[10px] tracking-widest text-[oklch(0.65_0.24_15)]">GO LIVE</div>
                <div className="text-sm font-semibold mt-1">Stream now</div>
              </Link>
              <Link to="/create" className="rounded-2xl glass border border-white/10 p-3 hover:bg-white/5">
                <div className="text-[10px] tracking-widest text-[oklch(0.7_0.25_340)]">CREATE</div>
                <div className="text-sm font-semibold mt-1">New post</div>
              </Link>
              <Link to="/rewards" className="rounded-2xl glass border border-white/10 p-3 hover:bg-white/5">
                <div className="text-[10px] tracking-widest text-[oklch(0.82_0.15_215)]">REWARDS</div>
                <div className="text-sm font-semibold mt-1">12,480 pts</div>
              </Link>
            </div>
          </section>
        </aside>

        {/* CENTER — feed */}
        <div className="space-y-5 min-w-0">
          <Composer />
          <div className="lg:hidden"><CreatorRail /></div>

          <div className="flex items-center justify-between px-1">
            <h2 className="text-base lg:text-lg font-semibold flex items-center gap-2">
              <Star className="size-4 text-primary" /> {heading}
            </h2>
            <button onClick={() => toast("Loading more…")} className="text-sm text-primary hover:underline">See all</button>
          </div>

          <div className="space-y-5">
            {filtered.map((p, i) => (
              <PostCard key={p.id} post={p as any} index={i} />
            ))}
          </div>
        </div>

        {/* RIGHT RAIL — desktop only · trending + suggested */}
        <aside className="hidden lg:flex flex-col gap-4 sticky top-6 h-fit">
          <section className="rounded-3xl glass neon-border p-4">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-3"><Flame className="size-4 text-[oklch(0.7_0.25_340)]" /> Trending tonight</h3>
            <ul className="space-y-3">
              {[
                { tag: "#StudioSessions", up: "+184%" },
                { tag: "#LateNightDrops", up: "+92%" },
                { tag: "#AuroraFilter", up: "+71%" },
                { tag: "#NeonTalk", up: "+44%" },
                { tag: "#CityAfterDark", up: "+33%" },
              ].map((t, i) => (
                <li key={t.tag} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{t.tag}</div>
                    <div className="text-[11px] text-[oklch(0.78_0.18_150)] flex items-center gap-1"><TrendingUp className="size-3" /> {t.up}</div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl glass neon-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold flex items-center gap-2"><UserPlus className="size-4 text-primary" /> Suggested creators</h3>
              <Link to="/explore" className="text-[11px] text-primary hover:underline">More</Link>
            </div>
            <ul className="space-y-3">
              {creators.slice(1, 5).map((c) => (
                <li key={c.id} className="flex items-center gap-3">
                  <img src={c.avatar} alt="" className="size-9 rounded-full object-cover ring-1 ring-white/15" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{c.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">@{c.handle}</div>
                  </div>
                  <button onClick={() => toast(`Followed ${c.name}`)} className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 border border-primary/40 text-primary hover:bg-primary/20">+ Follow</button>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl glass neon-border p-4">
            <h3 className="text-sm font-bold mb-3">Tonight's prescriptions</h3>
            <div className="space-y-2">
              {prescribed.slice(0, 3).map((p) => (
                <Link to="/prescribe-me" key={p.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5">
                  <div className="size-12 rounded-lg overflow-hidden shrink-0">
                    <img src={p.media} alt="" className="size-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] tracking-widest text-primary">{p.kind}</div>
                    <div className="text-sm font-semibold truncate">{p.title}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}

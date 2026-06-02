import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Star, Flame, TrendingUp, Sparkles, Radio, UserPlus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Composer } from "@/components/feed/Composer";
import { CreatorRail } from "@/components/feed/CreatorRail";
import { PostCard } from "@/components/feed/PostCard";
import { posts, creators, prescribed } from "@/lib/mock-data";
import { useFeed } from "@/lib/feed-store";
import { toast } from "sonner";
import { useFollow } from "@/lib/follow-store";
import { useAuth } from "@/hooks/use-auth";
import { fetchSignalRecord } from "@/lib/tests/naturalAbilityStorage";
import { reRankFeedWithAI } from "@/lib/trey-i/vertex.server";

export const Route = createFileRoute("/for-you")({
  component: Home,
  head: () => ({
    meta: [
      { title: "For You · Trey TV" },
      { name: "description", content: "Your personalized creator feed on Trey TV." },
    ],
  }),
});

function Home() {
  const [tab, setTab] = useState("for-you");
  const { posts: userPosts } = useFeed();
  const { isFollowing } = useFollow();

  const { user } = useAuth();
  const [badge, setBadge] = useState<string | null>(null);
  const [rankedPosts, setRankedPosts] = useState<any[]>([]);
  const [ranking, setRanking] = useState(false);

  useEffect(() => {
    if (!user || !user.id) return;
    fetchSignalRecord(user.id).then((row) => {
      if (row) {
        setBadge(row.primary_ability);
      }
    });
  }, [user]);

  useEffect(() => {
    const rawList = [...userPosts, ...posts];
    if (!badge) {
      setRankedPosts(rawList);
      return;
    }
    setRanking(true);
    reRankFeedWithAI({ data: { posts: rawList, userBadge: badge, query: "" } })
      .then((res) => {
        if (res?.rankedIds && res.rankedIds.length > 0) {
          const map = new Map(rawList.map((p) => [String(p.id), p]));
          const ordered = res.rankedIds
            .map((id) => map.get(String(id)))
            .filter(Boolean) as any[];
          const seen = new Set(ordered.map((p) => p.id));
          for (const p of rawList) {
            if (!seen.has(p.id)) {
              ordered.push(p);
            }
          }
          setRankedPosts(ordered);
        } else {
          setRankedPosts(rawList);
        }
      })
      .catch((err) => {
        console.error("AI feed ranking failed, falling back:", err);
        setRankedPosts(rawList);
      })
      .finally(() => {
        setRanking(false);
      });
  }, [badge, userPosts]);

  const merged = tab === "for-you" ? (rankedPosts.length > 0 ? rankedPosts : [...userPosts, ...posts]) : [...userPosts, ...posts];
  const filtered =
    tab === "following"
      ? merged.filter((p) => {
          const isOwnPost = !p.creator || p.creator.handle === "trey";
          const isDbFollow = p.creator && isFollowing(p.creator.handle);
          const isDemoMode = typeof window !== "undefined" && (
            window.location.search.includes("demo=1") ||
            localStorage.getItem("treytv_demo") === "true" ||
            process.env.NODE_ENV === "development"
          );
          const isMockFollow = isDemoMode && p.creator && (p.creator.handle === "chrishorizon" || p.creator.handle === "treyipicks");
          return isOwnPost || isDbFollow || isMockFollow;
        })
      : tab === "latest"
        ? [...userPosts, ...[...posts].reverse()]
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
        <div className="ml-auto text-xs text-muted-foreground">Live network · {posts.length * 412} active viewers</div>
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
              {tab === "for-you" && badge && (
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300 ml-2 border border-amber-300/30 px-2 py-0.5 rounded-full bg-amber-500/10">
                  {badge} Vibe
                </span>
              )}
            </h2>
            {ranking ? (
              <span className="text-xs text-cyan-300 flex items-center gap-1.5 animate-pulse">
                <Sparkles className="size-3.5" /> Trey-I tuning...
              </span>
            ) : (
              <button onClick={() => toast("Loading more…")} className="text-sm text-primary hover:underline">See all</button>
            )}
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

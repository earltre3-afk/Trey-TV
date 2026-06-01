import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Home, Compass, Inbox, Bookmark, Plus,
  Play, Share2, UserPlus, UserCheck, BadgeCheck, Crown,
  Camera, Mic, Film, User, Check, Bell, Gift, MessageSquare,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useSubmissions, type Submission } from "@/lib/submissions-store";
import { useGoBack } from "@/hooks/use-go-back";
import { GiftPickerSheet } from "@/components/gifts/GiftPickerSheet";
import { GoldCheck } from "@/components/brand/Badge";
import { ChannelChatPanel } from "@/components/chat/ChannelChatPanel";
import { useSupabaseSession } from "@/lib/supabase-session";
import { createWatchParty } from "@/lib/watch-party/party.server";
import { Users } from "lucide-react";
import { isTreyOwnerHandle } from "@/lib/trey-owner";
import { toggleFollow as doToggleFollow, getSocialCounts, type SocialCounts } from "@/lib/social-relationships";
import { createBrowserClient } from "@/lib/supabase-browser";
import treyTvLogo from "@/assets/trey-tv-logo.png";
import staticHeroBg from "@/assets/lovable-hero-bg.jpg";
import fallPost1 from "@/assets/lovable-post1.jpg";
import fallPost2 from "@/assets/lovable-post2.jpg";
import fallPost3 from "@/assets/lovable-post3.jpg";
import fallPost4 from "@/assets/lovable-post4.jpg";
import fallPost5 from "@/assets/lovable-post5.jpg";

export const Route = createFileRoute("/channel/$handle")({
  component: ChannelPage,
  head: ({ params }) => ({
    meta: [
      { title: `@${params.handle} — Trey TV Creator Channel` },
      { name: "description", content: `Watch shows, episodes, and live moments from @${params.handle} on Trey TV.` },
      { property: "og:title", content: `@${params.handle} on Trey TV` },
    ],
  }),
});

const GOLD = "#FFC857";
const PURPLE = "#A855F7";
const FALL_POSTS = [fallPost1, fallPost2, fallPost3, fallPost4, fallPost5];
const TABS = ["Home", "Videos", "Series", "Playlists", "About"] as const;
type Tab = (typeof TABS)[number];

const PLAYLIST_ITEMS = [
  { I: Camera, label: "VLOGS", count: "24 VIDEOS" },
  { I: Crown, label: "MOTIVATION", count: "18 VIDEOS" },
  { I: Mic, label: "INTERVIEWS", count: "15 VIDEOS" },
  { I: Film, label: "BEHIND THE SCENES", count: "12 VIDEOS" },
];

const FALLBACK_SEASONS = [
  { id: "s1", title: "LATE NIGHTS\nIN ATL", count: "2 SEASONS", img: fallPost1 },
  { id: "s2", title: "ON GO\nDIARIES", count: "1 SEASON", img: fallPost2 },
  { id: "s3", title: "REAL TALKS\nWITH TREY", count: "3 SEASONS", img: fallPost3 },
  { id: "s4", title: "TREY DAY\nFRIDAYS", count: "2 SEASONS", img: fallPost4 },
];

const FALLBACK_POPULAR = [
  { id: "p1", duration: "12:45", title: "I Bought My Dream Car… Here's How It Went", img: fallPost5 },
  { id: "p2", duration: "15:32", title: "SURPRISING My Little Brother With His Dream…", img: fallPost2 },
  { id: "p3", duration: "18:20", title: "The Truth About Content Creation", img: fallPost3 },
  { id: "p4", duration: "22:17", title: "RAW CONVERSATION (No Filter)", img: fallPost4 },
];

function ChannelPage() {
  const { handle } = Route.useParams();
  const { user, isGuest } = useAuth();
  const store = useSubmissions();
  const goBack = useGoBack("/explore");

  const isOwnerChannel = isTreyOwnerHandle(handle);
  const isOwnChannel = user?.handle === handle;

  const publicEpisodes = useMemo<Submission[]>(() => {
    const visible = store.submissions.filter(
      (s) => s.status === "approved" || s.status === "published" || s.status === "scheduled"
    );
    const byThem = visible.filter((s) => s.creator_handle === handle);
    return byThem.length ? byThem : visible.slice(0, 6);
  }, [store.submissions, handle]);

  const featured = publicEpisodes[0];
  const trailer = publicEpisodes.find((s) => s.is_trailer || s.episode_type === "Trailer") ?? featured;

  const shows = useMemo(() => {
    const map = new Map<string, { id: string; title: string; episodes: Submission[] }>();
    publicEpisodes.forEach((e) => {
      const id = e.show_id || "misc";
      const title = e.show_title || "Singles & Specials";
      if (!map.has(id)) map.set(id, { id, title, episodes: [] });
      map.get(id)!.episodes.push(e);
    });
    return [...map.values()];
  }, [publicEpisodes]);

  const [tab, setTab] = useState<Tab>("Home");
  const [notify, setNotify] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [slide, setSlide] = useState(0);

  const [following, setFollowing] = useState(false);
  const [socialCounts, setSocialCounts] = useState<SocialCounts>({ followers: 0, following: 0 });
  const [creatorDbId, setCreatorDbId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const supabase = createBrowserClient();
        const { data: profileRow } = await (supabase as any)
          .from("profiles")
          .select("id")
          .eq("username", handle)
          .maybeSingle();
        if (!mounted) return;
        const dbId: string | null = profileRow?.id ?? null;
        setCreatorDbId(dbId);
        if (dbId) {
          const counts = await getSocialCounts(dbId);
          if (mounted) setSocialCounts(counts);
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser && authUser.id !== dbId) {
            const { data: followRow } = await (supabase as any)
              .from("follows")
              .select("id")
              .eq("follower_id", authUser.id)
              .eq("following_id", dbId)
              .maybeSingle();
            if (mounted) setFollowing(!!followRow);
          }
        }
      } catch (err) {
        console.error("Channel load error:", err);
      }
    }
    load();
    return () => { mounted = false; };
  }, [handle]);

  const fmt = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` :
    n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` :
    String(n);

  const handleFollowToggle = async () => {
    if (!creatorDbId) return;
    if (!user) { toast.error("Sign in to follow"); return; }
    const prev = following;
    setFollowing(!prev);
    setSocialCounts((c) => ({ ...c, followers: Math.max(0, c.followers + (prev ? -1 : 1)) }));
    const ok = await doToggleFollow(creatorDbId, prev);
    if (!ok) {
      setFollowing(prev);
      setSocialCounts((c) => ({ ...c, followers: Math.max(0, c.followers + (prev ? 1 : -1)) }));
    } else {
      toast.success(prev ? `Unfollowed @${handle}` : `Now following @${handle}`);
    }
  };

  const toggleWatch = (id: string, title?: string) => {
    setWatchlist((prev) => {
      const n = new Set(prev);
      if (n.has(id)) { n.delete(id); toast("Removed from Watchlist"); }
      else { n.add(id); toast(`Added${title ? ` "${title}"` : ""} to Watchlist`); }
      return n;
    });
  };

  const onShare = async () => {
    try { await navigator.share?.({ title: `@${handle} on Trey TV`, url: location.href }); }
    catch { await navigator.clipboard?.writeText(location.href); toast.success("Channel link copied"); }
  };

  const heroBg = trailer?.thumbnail_url || staticHeroBg;

  return (
    <div
      className="creator-channel-page min-h-screen text-white relative overflow-x-hidden"
      style={{ background: "#05070D" }}
    >
      {/* Ambient orbs */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(900px 500px at 85% -5%, rgba(168,85,247,0.18), transparent 60%)," +
            "radial-gradient(700px 400px at -5% 30%, rgba(0,183,255,0.12), transparent 60%)",
        }}
      />

      <div className="flex min-h-screen">
        {/* ── Desktop sidebar ──────────────────────────────── */}
        <aside className="hidden lg:flex flex-col items-center gap-1 w-[88px] xl:w-[104px] py-5 border-r border-white/5 shrink-0 sticky top-0 h-screen overflow-y-auto">
          <Link to="/" className="block w-16 h-12 mb-4 group">
            <img
              src={treyTvLogo}
              alt="Trey TV"
              className="w-full h-full object-contain transition-transform group-hover:scale-110"
              style={{ filter: "drop-shadow(0 0 12px rgba(255,200,87,0.5))" }}
            />
          </Link>
          <nav className="flex flex-col items-center gap-1 w-full">
            {([
              { I: Home, label: "Home", to: "/" },
              { I: Compass, label: "Discover", to: "/explore" },
              { I: Inbox, label: "Inbox", to: "/inbox" },
              { I: Bookmark, label: "Watchlist", to: "/" },
            ] as const).map(({ I, label, to }) => (
              <Link
                key={label}
                to={to}
                className="group flex flex-col items-center gap-1 w-full py-3 text-white/55 hover:text-white transition"
              >
                <span className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-white/25 transition">
                  <I className="w-[18px] h-[18px]" />
                </span>
                <span className="text-[10px] tracking-wide uppercase font-semibold">{label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* ── Main content ──────────────────────────────────── */}
        <main className="flex-1 min-w-0 pb-28 lg:pb-10">
          {/* ── HERO ─────────────────────────────────────── */}
          <section className="relative">
            <div className="relative min-h-[560px] md:min-h-[580px] lg:min-h-[640px] overflow-hidden">
              <img
                src={heroBg}
                alt=""
                loading="eager"
                className="absolute inset-0 w-full h-full object-cover object-top"
              />

              {/* gradient overlays */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(5,7,13,0) 25%, rgba(5,7,13,0.55) 65%, #05070D 100%)," +
                    "linear-gradient(90deg, rgba(5,7,13,0.92) 0%, rgba(5,7,13,0.55) 38%, rgba(5,7,13,0) 62%)",
                }}
              />
              {isOwnerChannel && (
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(circle at 15% 10%, oklch(0.82 0.16 85 / 0.22), transparent 55%)," +
                      "radial-gradient(circle at 85% 90%, oklch(0.7 0.25 340 / 0.18), transparent 55%)",
                  }}
                />
              )}

              {/* Top-right controls */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                <button
                  onClick={goBack}
                  className="size-10 rounded-full border border-white/15 bg-black/40 backdrop-blur flex items-center justify-center hover:bg-black/60 active:scale-95 transition"
                  aria-label="Back"
                >
                  <ArrowLeft className="size-4" />
                </button>
                <button
                  onClick={onShare}
                  className="size-10 rounded-full border border-white/15 bg-black/40 backdrop-blur flex items-center justify-center hover:bg-black/60 active:scale-95 transition"
                  aria-label="Share"
                >
                  <Share2 className="size-4" />
                </button>
                <button
                  onClick={() => setNotify((n) => !n)}
                  className={`size-10 rounded-full border backdrop-blur flex items-center justify-center active:scale-95 transition ${
                    notify
                      ? "border-[#FFC857]/50 bg-[#FFC857]/15 text-[#FFC857]"
                      : "border-white/15 bg-black/40"
                  }`}
                  aria-label="Notifications"
                >
                  <Bell className="size-4" />
                </button>
              </div>

              {/* Hero body */}
              <div className="relative z-[5] flex flex-col justify-end min-h-[560px] md:min-h-[580px] lg:min-h-[640px] px-5 md:px-10 lg:px-14 pb-8 pt-20">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                  <div className="max-w-xl">
                    {/* Logo / avatar */}
                    <div className="relative inline-block mb-3 group cursor-pointer animate-float">
                      {isOwnerChannel ? (
                        <>
                          <span
                            aria-hidden
                            className="absolute -inset-6 rounded-full opacity-70 blur-2xl animate-spin-slow"
                            style={{
                              background:
                                "conic-gradient(from 0deg, rgba(255,200,87,0.55), rgba(168,85,247,0.55), rgba(0,183,255,0.45), rgba(255,107,214,0.55), rgba(255,200,87,0.55))",
                            }}
                          />
                          <span
                            aria-hidden
                            className="absolute -inset-2 rounded-full opacity-60"
                            style={{
                              animation: "glow-pulse 2.4s ease-in-out infinite",
                              boxShadow:
                                "0 0 0 4px rgba(255,200,87,0.35), 0 0 0 8px rgba(255,200,87,0.15)",
                            }}
                          />
                          <img
                            src={treyTvLogo}
                            alt="Trey TV"
                            className="relative h-16 md:h-20 lg:h-24 w-auto transition-transform duration-500 group-hover:scale-110"
                            style={{
                              filter:
                                "drop-shadow(0 6px 18px rgba(0,0,0,0.7)) drop-shadow(0 0 22px rgba(255,200,87,0.6)) brightness(1.1) contrast(1.08) saturate(1.2)",
                            }}
                          />
                        </>
                      ) : (
                        <>
                          <span
                            aria-hidden
                            className="absolute -inset-1.5 rounded-full"
                            style={{
                              background:
                                "conic-gradient(from 0deg, #ff6bd6, #8b5cf6, #22d3ee, #FFC857, #ff6bd6)",
                              animation: "conic-spin 8s linear infinite",
                              filter: "blur(2px)",
                            }}
                          />
                          <img
                            src={user?.avatar || FALL_POSTS[0]}
                            alt={`@${handle}`}
                            className="relative size-20 md:size-24 rounded-full object-cover border-2 border-[#05070D]"
                            style={{
                              boxShadow:
                                "0 0 0 2px rgba(168,85,247,0.55), 0 0 28px rgba(168,85,247,0.55)",
                            }}
                          />
                        </>
                      )}
                    </div>

                    {/* Badge pill */}
                    <div
                      className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border mb-3"
                      style={{
                        background: "rgba(168,85,247,0.12)",
                        borderColor: "rgba(168,85,247,0.45)",
                      }}
                    >
                      <Crown className="w-3.5 h-3.5" style={{ color: GOLD }} />
                      <span
                        className="text-[10px] font-extrabold tracking-[0.18em] uppercase"
                        style={{ color: GOLD }}
                      >
                        {isOwnerChannel ? "Owner" : "Creator"}
                      </span>
                      <span className="text-[10px] font-bold tracking-[0.18em] text-white/80 uppercase">
                        Channel
                      </span>
                    </div>

                    <h1
                      className="font-display font-extrabold text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight"
                      style={{ textShadow: "0 6px 30px rgba(0,0,0,0.7)" }}
                    >
                      {isOwnerChannel ? "KING TREY" : `@${handle}`.toUpperCase()}
                    </h1>

                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="text-[13px] font-medium" style={{ color: PURPLE }}>
                        @{handle}
                      </span>
                      <GoldCheck size={18} />
                    </div>

                    <p className="mt-3 text-[13px] md:text-sm text-white/85 leading-relaxed">
                      {isOwnerChannel
                        ? "Content Creator • Entertainer • Story Teller\nNew episodes every week!"
                        : `Creator channel — follow for new content every week`}
                    </p>

                    {/* Stats */}
                    <div className="mt-5 flex items-center gap-7">
                      <div>
                        <div className="font-display font-extrabold text-2xl md:text-3xl tabular-nums">
                          {fmt(socialCounts.followers)}
                        </div>
                        <div className="text-[11px] uppercase tracking-wider text-white/60">
                          Followers
                        </div>
                      </div>
                      <div>
                        <div className="font-display font-extrabold text-2xl md:text-3xl">
                          {publicEpisodes.length || "—"}
                        </div>
                        <div className="text-[11px] uppercase tracking-wider text-white/60">
                          Videos
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-5 flex items-center flex-wrap gap-2.5">
                      <button
                        onClick={() => toast.success(`▶ ${trailer?.title || "Playing latest"}`)}
                        className="channel-primary-btn"
                      >
                        <Play className="w-4 h-4 fill-white" /> Play Latest
                      </button>

                      {!isOwnChannel && (
                        <button
                          onClick={handleFollowToggle}
                          className={`channel-secondary-btn ${
                            following ? "!border-[#A855F7]/60 !bg-[#A855F7]/15" : ""
                          }`}
                        >
                          {following ? (
                            <><UserCheck className="w-4 h-4" /> Following</>
                          ) : (
                            <><UserPlus className="w-4 h-4" /> Follow</>
                          )}
                        </button>
                      )}

                      <button onClick={onShare} className="channel-icon-btn" aria-label="Share">
                        <Share2 className="w-5 h-5" />
                      </button>

                      {!isOwnChannel && (
                        <button
                          onClick={() => setGiftOpen(true)}
                          className="channel-icon-btn"
                          aria-label="Send gift"
                        >
                          <Gift className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* About panel — desktop right column */}
                  <div className="hidden lg:block lg:w-[300px] xl:w-[340px] channel-panel p-5">
                    <div className="font-display font-bold text-base mb-2">
                      About {isOwnerChannel ? "King Trey" : `@${handle}`}
                    </div>
                    <p className="text-[13px] leading-relaxed text-white/80">
                      {isOwnerChannel ? (
                        <>
                          Bringing real life, raw conversations, and mad entertainment to{" "}
                          <span style={{ color: GOLD }}>Trey TV</span>. Welcome to the{" "}
                          <span style={{ color: GOLD }}>family</span>.
                        </>
                      ) : (
                        `Creator channel on Trey TV. Follow for new content every week.`
                      )}
                    </p>
                    <button
                      onClick={() => setTab("About")}
                      className="mt-4 inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-[12px] font-semibold transition active:scale-95"
                    >
                      More About ›
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── LIVE NOW (Pluto live channel mapped from handle) ─────────── */}
          {/* Local-dev only — disabled in prod via PLUTO_ENABLED flag. */}
          <section className="px-5 md:px-10 lg:px-14 mt-4">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/50 text-red-400 text-[10px] tracking-widest font-bold">
                <span className="size-1.5 rounded-full bg-red-400 animate-pulse" /> LIVE NOW
              </span>
              <span className="text-xs text-white/60">Live channel for @{handle}</span>
              <StartWatchPartyButton channelId={`ch-${handle}`} className="ml-auto" />
            </div>
            <div className="grid gap-3 lg:grid-cols-[1fr_360px]">
              <div className="aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black">
                <iframe
                  src={`/api/pluto/player?channel=${encodeURIComponent(handle)}`}
                  title={`@${handle} live`}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  className="size-full border-0"
                />
              </div>
              {/* Community chat (text only, AI-moderated by Trey-I) */}
              <ChannelChatPanel handle={handle} className="h-auto lg:h-full min-h-[360px]" />
            </div>
          </section>

          {/* ── TABS ─────────────────────────────────────── */}
          <div className="px-5 md:px-10 lg:px-14 mt-2">
            <div className="channel-tabs">
              {TABS.map((t) => (
                <button key={t} onClick={() => setTab(t)} className={tab === t ? "is-active" : ""}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* ── TAB CONTENT ──────────────────────────────── */}
          <div className="px-5 md:px-10 lg:px-14">

            {/* HOME */}
            {tab === "Home" && (
              <>
                {/* Latest Release */}
                <section className="mt-6">
                  <h2 className="font-display font-bold text-xl mb-3">Latest Release</h2>
                  <div className="relative channel-feature-card group">
                    <img
                      src={featured?.thumbnail_url || FALL_POSTS[0]}
                      alt=""
                      loading="lazy"
                      className="w-full h-[260px] md:h-[340px] lg:h-[400px] object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(90deg, rgba(5,7,13,0.88) 0%, rgba(5,7,13,0.55) 45%, rgba(5,7,13,0.1) 75%, transparent 100%)",
                      }}
                    />
                    <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end max-w-xl">
                      <div className="channel-eyebrow mb-2">
                        TREY <span className="text-white/85">ORIGINAL</span>
                      </div>
                      <h3 className="font-display font-extrabold text-3xl md:text-4xl lg:text-5xl leading-[0.95] mb-2">
                        {(featured?.show_title || featured?.title || "LATEST RELEASE").toUpperCase()}
                      </h3>
                      {featured && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-white/85 font-medium">{featured.title}</span>
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-extrabold tracking-wider"
                            style={{ background: PURPLE, color: "#fff" }}
                          >
                            NEW
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => toast.success(`▶ ${featured?.title || "Latest"}`)}
                          className="channel-primary-btn"
                        >
                          <Play className="w-4 h-4 fill-white" /> Watch Now
                        </button>
                        {featured && (
                          <button
                            onClick={() => toggleWatch(featured.content_id, featured.title)}
                            className={`size-10 rounded-full border flex items-center justify-center transition active:scale-95 ${
                              watchlist.has(featured.content_id)
                                ? "border-[#A855F7] bg-[#A855F7]/20"
                                : "border-white/25 bg-white/5 hover:bg-white/10"
                            }`}
                            aria-label="Watchlist"
                          >
                            {watchlist.has(featured.content_id) ? (
                              <Check className="size-4" />
                            ) : (
                              <Plus className="size-4" />
                            )}
                          </button>
                        )}
                      </div>
                      <div className="absolute bottom-5 right-6 flex gap-1.5">
                        {[0, 1, 2, 3].map((i) => (
                          <button
                            key={i}
                            onClick={() => setSlide(i)}
                            aria-label={`Slide ${i + 1}`}
                            className={`h-1.5 rounded-full transition-all ${
                              i === slide ? "w-6 bg-[#A855F7]" : "w-1.5 bg-white/35 hover:bg-white/60"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Seasons */}
                <section className="mt-8">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-display font-bold text-xl">Seasons</h2>
                    <button
                      className="text-sm font-semibold hover:underline"
                      style={{ color: PURPLE }}
                      onClick={() => setTab("Series")}
                    >
                      View All
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {(shows.length > 0
                      ? shows.slice(0, 4).map((sh, idx) => ({
                          id: sh.id,
                          title: sh.title.toUpperCase(),
                          count: `${sh.episodes.length} EPISODES`,
                          img: sh.episodes[0]?.thumbnail_url || FALL_POSTS[idx % 5],
                        }))
                      : FALLBACK_SEASONS
                    ).map((s) => (
                      <button
                        key={s.id}
                        onClick={() => toast(`Opening ${s.title.replace(/\n/g, " ")}`)}
                        className="channel-poster-card group text-left"
                      >
                        <img
                          src={s.img}
                          alt=""
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(180deg, transparent 35%, rgba(5,7,13,0.88) 100%)",
                          }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-3.5">
                          <h3 className="font-display font-extrabold text-lg leading-[0.95] whitespace-pre-line mb-1.5">
                            {s.title}
                          </h3>
                          <div
                            className="text-[10px] font-extrabold tracking-[0.18em] uppercase"
                            style={{ color: PURPLE }}
                          >
                            {s.count}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Popular Videos */}
                <section className="mt-8">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-display font-bold text-xl">Popular Videos</h2>
                    <button
                      className="text-sm font-semibold hover:underline"
                      style={{ color: PURPLE }}
                      onClick={() => setTab("Videos")}
                    >
                      View All
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {(publicEpisodes.length > 0
                      ? publicEpisodes.slice(0, 4).map((e, idx) => ({
                          id: e.content_id,
                          title: e.title || "Untitled",
                          img: e.thumbnail_url || FALL_POSTS[idx % 5],
                          duration: e.duration,
                        }))
                      : FALLBACK_POPULAR
                    ).map((v, idx) => (
                      <div
                        key={v.id}
                        className="group cursor-pointer"
                        onClick={() => toast(`▶ ${v.title}`)}
                      >
                        <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-video">
                          <img
                            src={v.img}
                            alt=""
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <span className="size-12 rounded-full bg-white/95 text-black flex items-center justify-center shadow-2xl">
                              <Play className="size-5 fill-black" />
                            </span>
                          </div>
                          {v.duration && (
                            <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/85 text-[10px] font-bold">
                              {v.duration}
                            </div>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleWatch(v.id, v.title); }}
                            className={`absolute top-1.5 right-1.5 size-7 rounded-full border flex items-center justify-center backdrop-blur transition active:scale-90 ${
                              watchlist.has(v.id)
                                ? "border-[#A855F7] bg-[#A855F7]/30"
                                : "border-white/30 bg-black/40 hover:bg-black/70"
                            }`}
                            aria-label="Watchlist"
                          >
                            {watchlist.has(v.id) ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
                          </button>
                        </div>
                        <h3 className="mt-2 text-[13px] font-semibold leading-snug line-clamp-2">
                          {v.title}
                        </h3>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Playlists */}
                <section className="mt-8 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-display font-bold text-xl">Playlists</h2>
                    <button
                      className="text-sm font-semibold hover:underline"
                      style={{ color: PURPLE }}
                      onClick={() => setTab("Playlists")}
                    >
                      View All
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {PLAYLIST_ITEMS.map((p) => (
                      <button
                        key={p.label}
                        onClick={() => toast(`Opening ${p.label} playlist`)}
                        className="relative rounded-xl overflow-hidden border border-white/10 hover-lift h-[88px] flex items-center gap-3 px-4 text-left active:scale-[0.98] transition"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(168,85,247,0.18) 0%, rgba(99,102,241,0.10) 100%)",
                        }}
                      >
                        <span
                          className="w-11 h-11 rounded-lg flex items-center justify-center"
                          style={{ background: "rgba(168,85,247,0.18)", border: "1px solid rgba(168,85,247,0.4)" }}
                        >
                          <p.I className="size-5" style={{ color: PURPLE }} />
                        </span>
                        <div>
                          <div className="font-extrabold text-sm tracking-wide">{p.label}</div>
                          <div className="text-[10px] font-bold tracking-[0.16em] uppercase text-white/55">
                            {p.count}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* VIDEOS */}
            {tab === "Videos" && (
              <section className="mt-6">
                {publicEpisodes.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-16 text-white/40">
                    <Film className="size-10 opacity-40" />
                    <p className="text-sm">No videos yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {publicEpisodes.map((e, idx) => (
                      <div key={e.content_id} className="group cursor-pointer" onClick={() => toast(`▶ ${e.title}`)}>
                        <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-video">
                          <img
                            src={e.thumbnail_url || FALL_POSTS[idx % 5]}
                            alt=""
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <span className="size-12 rounded-full bg-white/95 text-black flex items-center justify-center shadow-2xl">
                              <Play className="size-5 fill-black" />
                            </span>
                          </div>
                          {e.duration && (
                            <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/85 text-[10px] font-bold">
                              {e.duration}
                            </div>
                          )}
                          <button
                            onClick={(ev) => { ev.stopPropagation(); toggleWatch(e.content_id, e.title); }}
                            className={`absolute top-1.5 right-1.5 size-7 rounded-full border flex items-center justify-center backdrop-blur transition active:scale-90 ${
                              watchlist.has(e.content_id)
                                ? "border-[#A855F7] bg-[#A855F7]/30"
                                : "border-white/30 bg-black/40 hover:bg-black/70"
                            }`}
                            aria-label="Watchlist"
                          >
                            {watchlist.has(e.content_id) ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
                          </button>
                        </div>
                        <h3 className="mt-2 text-[13px] font-semibold leading-snug line-clamp-2">
                          {e.title || "Untitled"}
                        </h3>
                        <p className="mt-0.5 text-[11px] text-white/55">{e.show_title || ""}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* SERIES */}
            {tab === "Series" && (
              <section className="mt-6">
                {shows.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-16 text-white/40">
                    <Film className="size-10 opacity-40" />
                    <p className="text-sm">No series yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {shows.map((sh, idx) => (
                      <button
                        key={sh.id}
                        onClick={() => toast(`Opening ${sh.title}`)}
                        className="channel-poster-card group text-left"
                      >
                        <img
                          src={sh.episodes[0]?.thumbnail_url || FALL_POSTS[idx % 5]}
                          alt=""
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(180deg, transparent 35%, rgba(5,7,13,0.88) 100%)",
                          }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-3.5">
                          <h3 className="font-display font-extrabold text-lg leading-[0.95] mb-1.5">
                            {sh.title}
                          </h3>
                          <div
                            className="text-[10px] font-extrabold tracking-[0.18em] uppercase"
                            style={{ color: PURPLE }}
                          >
                            {sh.episodes.length} EPISODES
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* PLAYLISTS */}
            {tab === "Playlists" && (
              <section className="mt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {PLAYLIST_ITEMS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => toast(`Opening ${p.label} playlist`)}
                      className="relative rounded-xl overflow-hidden border border-white/10 hover-lift h-[88px] flex items-center gap-3 px-4 text-left active:scale-[0.98] transition"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(168,85,247,0.18) 0%, rgba(99,102,241,0.10) 100%)",
                      }}
                    >
                      <span
                        className="w-11 h-11 rounded-lg flex items-center justify-center"
                        style={{ background: "rgba(168,85,247,0.18)", border: "1px solid rgba(168,85,247,0.4)" }}
                      >
                        <p.I className="size-5" style={{ color: PURPLE }} />
                      </span>
                      <div>
                        <div className="font-extrabold text-sm tracking-wide">{p.label}</div>
                        <div className="text-[10px] font-bold tracking-[0.16em] uppercase text-white/55">
                          {p.count}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* ABOUT */}
            {tab === "About" && (
              <section className="mt-6 mb-4 max-w-2xl">
                <div className="channel-panel p-6 space-y-4">
                  <div>
                    <div className="channel-eyebrow mb-1">About</div>
                    <h2 className="font-display font-bold text-2xl mb-2">
                      {isOwnerChannel ? "King Trey" : `@${handle}`}
                    </h2>
                    <p className="text-sm text-white/80 leading-relaxed">
                      {isOwnerChannel
                        ? "Bringing real life, raw conversations, and mad entertainment to Trey TV. Welcome to the family."
                        : `Creator channel on Trey TV. Follow @${handle} for new content every week.`}
                    </p>
                  </div>
                  <div className="flex gap-8 pt-2 border-t border-white/8">
                    <div>
                      <div className="font-display font-extrabold text-2xl">{fmt(socialCounts.followers)}</div>
                      <div className="text-[11px] uppercase tracking-wider text-white/60">Followers</div>
                    </div>
                    <div>
                      <div className="font-display font-extrabold text-2xl">{publicEpisodes.length}</div>
                      <div className="text-[11px] uppercase tracking-wider text-white/60">Videos</div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>

      <GiftPickerSheet open={giftOpen} onClose={() => setGiftOpen(false)} recipient={handle} />
    </div>
  );
}

// "Start watch party" CTA next to LIVE NOW header. Authed users only.
function StartWatchPartyButton({ channelId, className }: { channelId: string; className?: string }) {
  const { session } = useSupabaseSession();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  if (!session?.access_token) {
    return (
      <Link
        to="/login"
        className={`text-xs px-3 py-1.5 rounded-full border border-white/15 hover:bg-white/5 inline-flex items-center gap-1.5 ${className ?? ""}`}
      >
        <Users className="size-3.5" />
        Sign in to host a party
      </Link>
    );
  }

  const onClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await createWatchParty({ data: { accessToken: session.access_token, channelId } });
      if (!res.ok) {
        toast.error(`Couldn't create party: ${res.error}`);
        return;
      }
      navigate({ to: "/watch-party/$id", params: { id: res.partyId } });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={`text-xs px-3 py-1.5 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 inline-flex items-center gap-1.5 disabled:opacity-50 ${className ?? ""}`}
    >
      <Users className="size-3.5" />
      {busy ? "Starting…" : "Start watch party"}
    </button>
  );
}

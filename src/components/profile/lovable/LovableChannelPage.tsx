import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Home,
  Compass,
  Radio,
  Inbox,
  Bookmark,
  Plus,
  ChevronDown,
  Share,
  MoreHorizontal,
  Play,
  UserPlus,
  UserCheck,
  BadgeCheck,
  Crown,
  Camera,
  Mic,
  Film,
  User,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { AvatarWithFallback } from "@/components/brand/DefaultAvatar";

import heroBg from "@/assets/lovable-hero-bg.jpg";
import portrait from "@/assets/lovable-profile-portrait.jpg";
import treyTvLogo from "@/assets/trey-tv-logo.png";
import post1 from "@/assets/lovable-post1.jpg";
import post2 from "@/assets/lovable-post2.jpg";
import post3 from "@/assets/lovable-post3.jpg";
import post4 from "@/assets/lovable-post4.jpg";
import post5 from "@/assets/lovable-post5.jpg";

const GOLD = "#FFC857";
const PURPLE = "#A855F7";

export interface LovableChannelProfile {
  uid: string;
  id?: string;
  name: string;
  handle: string;
  avatar?: string;
  banner?: string;
  bio?: string;
  followers?: number | string;
  posts?: number | string;
  views?: number | string;
  isVerified?: boolean;
  isFounder?: boolean;
}

const SIDE_NAV = [
  { I: Home, label: "Home" },
  { I: Compass, label: "Discover" },
  { I: Radio, label: "Live" },
  { I: Inbox, label: "Inbox" },
  { I: Bookmark, label: "Watchlist" },
  { I: Plus, label: "My List" },
];

const TABS = ["Home", "Videos", "Series", "Playlists", "Community", "About"];

const SEASONS = [
  { id: "s1", title: "LATE NIGHTS\nIN ATL", count: "2 SEASONS", img: post1 },
  { id: "s2", title: "ON GO\nDIARIES", count: "1 SEASON", img: post2 },
  { id: "s3", title: "REAL TALKS\nWITH TREY", count: "3 SEASONS", img: post3 },
  { id: "s4", title: "TREY DAY\nFRIDAYS", count: "2 SEASONS", img: post4 },
];

const POPULAR = [
  {
    id: "p1",
    len: "12:45",
    title: "I Bought My Dream Car… Here's How It Went",
    views: "128K views",
    ago: "3 days ago",
    img: post5,
  },
  {
    id: "p2",
    len: "15:32",
    title: "SURPRISING My Little Brother With His Dream…",
    views: "98K views",
    ago: "1 week ago",
    img: post2,
  },
  {
    id: "p3",
    len: "18:20",
    title: "The Truth About Content Creation",
    views: "210K views",
    ago: "2 weeks ago",
    img: post3,
  },
  {
    id: "p4",
    len: "22:17",
    title: "RAW CONVERSATION (No Filter)",
    views: "175K views",
    ago: "3 weeks ago",
    img: post4,
  },
];

const PLAYLISTS = [
  { I: Camera, label: "VLOGS", count: "24 VIDEOS" },
  { I: Crown, label: "MOTIVATION", count: "18 VIDEOS" },
  { I: Mic, label: "INTERVIEWS", count: "15 VIDEOS" },
  { I: Film, label: "BEHIND THE SCENES", count: "12 VIDEOS" },
];

export function LovableChannelPage({ profile }: { profile: LovableChannelProfile }) {
  const [activeNav, setActiveNav] = useState("Home");
  const [activeTab, setActiveTab] = useState("Home");
  const [following, setFollowing] = useState(false);
  const [followers, setFollowers] = useState(profile.followers ?? 0);
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [slide, setSlide] = useState(1);
  const seasons = profile.isFounder ? SEASONS : [];
  const popular = profile.isFounder ? POPULAR : [];

  const toggleFollow = () => {
    const next = !following;
    setFollowing(next);
    setFollowers((f) => typeof f === "number" ? Math.max(0, f + (next ? 1 : -1)) : f);
    toast(next ? `Following ${profile.name}` : "Unfollowed");
  };

  const toggleWatch = (id: string, title?: string) => {
    setWatchlist((prev) => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
        toast("Removed from Watchlist");
      } else {
        n.add(id);
        toast(`Added${title ? ` "${title.replace(/\n/g, " ")}"` : ""} to Watchlist`);
      }
      return n;
    });
  };

  const formatFollowers = (n: number | string) =>
    typeof n === "number" && n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : `${n}`;

  const onShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (
        typeof navigator !== "undefined" &&
        (navigator as Navigator & { share?: (d: ShareData) => Promise<void> }).share
      ) {
        await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share({
          title: profile.name,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast("Channel link copied 🔗");
      }
    } catch {
      /* user cancelled */
    }
  };

  const playLatest = () => toast("▶ Playing: Late Nights in ATL — S2 E5");

  return (
    <div
      className="min-h-screen text-white relative overflow-x-hidden"
      style={{ background: "#05070D" }}
    >
      <Toaster position="top-center" theme="dark" />
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
        {/* SIDEBAR */}
        <aside className="hidden md:flex flex-col items-center gap-1 w-[88px] lg:w-[104px] py-5 border-r border-white/5 shrink-0">
          <Link to="/" className="block w-16 h-12 mb-4 relative group">
            <img
              src={treyTvLogo}
              alt="Trey TV"
              className="w-full h-full object-contain transition-transform group-hover:scale-110"
              style={{ filter: "drop-shadow(0 0 12px rgba(255,200,87,0.5))" }}
            />
          </Link>

          <nav className="flex flex-col items-center gap-1 w-full">
            {SIDE_NAV.map(({ I, label }) => {
              const active = activeNav === label;
              return (
                <button
                  key={label}
                  onClick={() => {
                    setActiveNav(label);
                    toast(`${label}`);
                  }}
                  className={`group flex flex-col items-center gap-1 w-full py-3 transition ${active ? "text-white" : "text-white/55 hover:text-white"}`}
                >
                  <span
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border transition ${active ? "border-white/30 bg-white/10 shadow-[0_0_16px_rgba(168,85,247,0.45)]" : "border-white/10 group-hover:border-white/25"}`}
                  >
                    <I className="w-[18px] h-[18px]" />
                  </span>
                  <span className="text-[10px] tracking-wide uppercase font-semibold">{label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-4 flex flex-col items-center gap-1">
            <Link to="/" className="ring-pulse p-[2px] hover-scale">
            <AvatarWithFallback src={profile.avatar || portrait} alt="" name={profile.name} uid={profile.uid} size="sm" className="w-10 h-10 rounded-full object-cover" />
            </Link>
            <ChevronDown className="w-4 h-4 text-white/40" />
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 min-w-0 pb-28 md:pb-10">
          {/* HERO */}
          <section className="relative">
            <div className="relative min-h-[560px] md:min-h-[560px] lg:min-h-[620px] overflow-hidden">
              <img
                src={profile.banner || heroBg}
                alt=""
                loading="eager"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(5,7,13,0) 30%, rgba(5,7,13,0.55) 70%, #05070D 100%)," +
                    "linear-gradient(90deg, rgba(5,7,13,0.9) 0%, rgba(5,7,13,0.55) 35%, rgba(5,7,13,0) 60%)",
                }}
              />

              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                <button
                  onClick={onShare}
                  aria-label="Share channel"
                  className="w-10 h-10 rounded-full border border-white/15 bg-black/40 backdrop-blur flex items-center justify-center hover:bg-black/60 active:scale-95 transition"
                >
                  <Share className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toast("More options coming soon")}
                  aria-label="More"
                  className="w-10 h-10 rounded-full border border-white/15 bg-black/40 backdrop-blur flex items-center justify-center hover:bg-black/60 active:scale-95 transition"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              <div className="relative z-[5] flex flex-col justify-end min-h-[560px] md:min-h-[560px] lg:min-h-[620px] px-5 md:px-10 lg:px-14 pb-8 pt-20">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                  <div className="max-w-xl">
                    {/* === COOL LOGO FX === */}
                    <div
                      className="relative inline-block mb-3 group cursor-pointer animate-float-slow"
                      onClick={() => toast("👑 Welcome to Trey TV")}
                    >
                      {/* spinning conic halo */}
                      <span
                        aria-hidden
                        className="absolute -inset-6 rounded-full opacity-70 blur-2xl animate-spin-slow"
                        style={{
                          background:
                            "conic-gradient(from 0deg, rgba(255,200,87,0.55), rgba(168,85,247,0.55), rgba(0,183,255,0.45), rgba(255,107,214,0.55), rgba(255,200,87,0.55))",
                        }}
                      />
                      {/* gold pulse ring */}
                      <span
                        aria-hidden
                        className="absolute -inset-2 rounded-full gold-pulse opacity-60"
                      />
                      {/* logo */}
                      <img
                        src={treyTvLogo}
                        alt="Trey TV"
                        className="relative h-16 md:h-20 lg:h-24 w-auto transition-transform duration-500 group-hover:scale-110"
                        style={{
                          filter:
                            "drop-shadow(0 6px 18px rgba(0,0,0,0.7)) drop-shadow(0 0 22px rgba(255,200,87,0.6)) brightness(1.1) contrast(1.08) saturate(1.2)",
                        }}
                      />
                      {/* sweep sheen clipped to logo */}
                      <span
                        aria-hidden
                        className="absolute inset-0 pointer-events-none mix-blend-screen animate-scan-sweep"
                        style={{
                          background:
                            "linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.85) 50%, transparent 65%)",
                          WebkitMaskImage: `url(${treyTvLogo})`,
                          maskImage: `url(${treyTvLogo})`,
                          WebkitMaskRepeat: "no-repeat",
                          maskRepeat: "no-repeat",
                          WebkitMaskSize: "contain",
                          maskSize: "contain",
                          WebkitMaskPosition: "center",
                          maskPosition: "center",
                          filter: "blur(2px)",
                        }}
                      />
                    </div>

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
                        Creator
                      </span>
                      <span className="text-[10px] font-bold tracking-[0.18em] text-white/80 uppercase">
                        Channel
                      </span>
                    </div>

                    <h1
                      className="font-display font-extrabold text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight"
                      style={{ textShadow: "0 6px 30px rgba(0,0,0,0.7)" }}
                    >
                      {profile.name.toUpperCase()}
                    </h1>

                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="text-[13px] font-medium" style={{ color: PURPLE }}>
                        @{profile.handle}
                      </span>
                      {profile.isVerified && <BadgeCheck className="w-4 h-4 fill-[#A855F7] text-black" />}
                    </div>

                    <p className="mt-3 text-[13px] md:text-sm text-white/85 leading-relaxed">{profile.bio || "Creator channel is being built."}</p>

                    <div className="mt-5 flex items-center gap-7">
                      <div>
                        <div className="font-display font-extrabold text-2xl md:text-3xl tabular-nums">
                          {formatFollowers(followers)}
                        </div>
                        <div className="text-[11px] uppercase tracking-wider text-white/60">
                          Followers
                        </div>
                      </div>
                      <div>
                        <div className="font-display font-extrabold text-2xl md:text-3xl">{profile.views ?? "-"}</div>
                        <div className="text-[11px] uppercase tracking-wider text-white/60">
                          Views
                        </div>
                      </div>
                      <div>
                        <div className="font-display font-extrabold text-2xl md:text-3xl">{profile.posts ?? 0}</div>
                        <div className="text-[11px] uppercase tracking-wider text-white/60">
                          Videos
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center gap-2.5">
                      <button
                        onClick={playLatest}
                        className="group relative inline-flex items-center gap-2 px-5 h-12 rounded-full font-bold text-sm text-white overflow-hidden active:scale-95 hover:brightness-110 transition"
                        style={{
                          background:
                            "linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #6366f1 100%)",
                          boxShadow:
                            "0 0 0 1px rgba(255,255,255,0.18) inset, 0 10px 30px rgba(139,92,246,0.55), 0 0 24px rgba(168,85,247,0.55)",
                        }}
                      >
                        <Play className="w-4 h-4 fill-white" />
                        Play Latest Video
                      </button>
                      <button
                        onClick={toggleFollow}
                        className={`inline-flex items-center gap-2 px-5 h-12 rounded-full font-semibold text-sm border backdrop-blur transition active:scale-95 ${following ? "border-[#A855F7]/60 bg-[#A855F7]/15 text-white" : "border-white/25 bg-white/5 hover:bg-white/10"}`}
                      >
                        {following ? (
                          <>
                            <UserCheck className="w-4 h-4" /> Following
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" /> Follow
                          </>
                        )}
                      </button>
                      <button
                        onClick={onShare}
                        aria-label="Share"
                        className="w-12 h-12 rounded-full border border-white/25 bg-white/5 hover:bg-white/10 backdrop-blur flex items-center justify-center active:scale-95 transition"
                      >
                        <Share className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="lg:w-[300px] xl:w-[340px] panel p-5 reveal">
                    <div className="font-display font-bold text-base mb-2">About {profile.name}</div>
                    <p className="text-[13px] leading-relaxed text-white/80">{profile.bio || "Creator channel is being built."}</p>
                    <button
                      onClick={() => setActiveTab("About")}
                      className="mt-4 inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-[12px] font-semibold transition active:scale-95"
                    >
                      More About <span>›</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* TABS */}
          <div className="px-5 md:px-10 lg:px-14 mt-2">
            <div className="flex items-center gap-7 border-b border-white/10 overflow-x-auto">
              {TABS.map((t) => {
                const active = activeTab === t;
                return (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`relative pb-3 pt-1 text-sm font-semibold transition whitespace-nowrap ${active ? "text-white" : "text-white/55 hover:text-white"}`}
                  >
                    {t}
                    {active && (
                      <span
                        className="absolute -bottom-px left-0 right-0 h-[3px] rounded-full"
                        style={{ background: PURPLE, boxShadow: `0 0 12px ${PURPLE}` }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* LATEST RELEASE */}
          <section className="px-5 md:px-10 lg:px-14 mt-6">
            <h2 className="font-display font-bold text-xl mb-3">Latest Release</h2>
            {profile.isFounder ? (
            <div className="relative rounded-2xl overflow-hidden border border-white/10 group">
              <img
                src={post1}
                alt=""
                loading="lazy"
                decoding="async"
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
                <div
                  className="text-[11px] font-extrabold tracking-[0.22em] uppercase mb-2"
                  style={{ color: PURPLE }}
                >
                  TREY <span className="text-white/85">ORIGINAL</span>
                </div>
                <h3 className="font-display font-extrabold text-3xl md:text-4xl lg:text-5xl leading-[0.95] mb-2">
                  LATE NIGHTS
                  <br />
                  IN ATL
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-white/85 font-medium">S2 • E5 "The Aftermath"</span>
                  <span
                    className="px-1.5 py-0.5 rounded text-[10px] font-extrabold tracking-wider"
                    style={{ background: PURPLE, color: "#fff" }}
                  >
                    NEW
                  </span>
                </div>
                <p className="text-sm text-white/75 mb-4">
                  The night was lit… but the morning hit different.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={playLatest}
                    className="inline-flex items-center gap-2 px-4 h-10 rounded-full font-bold text-sm text-white active:scale-95 hover:brightness-110 transition"
                    style={{
                      background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
                      boxShadow: "0 8px 24px rgba(168,85,247,0.55)",
                    }}
                  >
                    <Play className="w-4 h-4 fill-white" /> Watch Now
                  </button>
                  <button
                    onClick={() => toggleWatch("latest", "Late Nights in ATL")}
                    aria-label="Add to watchlist"
                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition active:scale-95 ${watchlist.has("latest") ? "border-[#A855F7] bg-[#A855F7]/20" : "border-white/25 bg-white/5 hover:bg-white/10"}`}
                  >
                    {watchlist.has("latest") ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="absolute bottom-5 right-6 flex gap-1.5">
                  {[0, 1, 2, 3].map((i) => (
                    <button
                      key={i}
                      onClick={() => setSlide(i)}
                      aria-label={`Slide ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all ${i === slide ? "w-6 bg-[#A855F7]" : "w-1.5 bg-white/35 hover:bg-white/60"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            ) : (
              <div className="channel-panel rounded-2xl px-6 py-12 text-center text-white/70">
                First episode coming soon.
              </div>
            )}
          </section>

          {/* SEASONS */}
          <section className="px-5 md:px-10 lg:px-14 mt-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold text-xl">Seasons</h2>
              <button
                onClick={() => toast("All seasons coming soon")}
                className="text-sm font-semibold hover:underline"
                style={{ color: PURPLE }}
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {seasons.length > 0 ? seasons.map((s) => (
                <button
                  key={s.id}
                  onClick={() => toast(`Opening ${s.title.replace(/\n/g, " ")}`)}
                  className="group relative rounded-xl overflow-hidden border border-white/10 hover-lift cursor-pointer aspect-[4/5] text-left"
                >
                  <img
                    src={s.img}
                    alt=""
                    loading="lazy"
                    decoding="async"
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
              )) : (
                <div className="col-span-full rounded-xl border border-white/10 bg-white/[0.04] p-8 text-center text-sm text-white/60">
                  No seasons yet.
                </div>
              )}
            </div>
          </section>

          {/* POPULAR */}
          <section className="px-5 md:px-10 lg:px-14 mt-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold text-xl">Popular Videos</h2>
              <button
                onClick={() => toast("All videos coming soon")}
                className="text-sm font-semibold hover:underline"
                style={{ color: PURPLE }}
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {popular.length > 0 ? popular.map((v) => (
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
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="w-12 h-12 rounded-full bg-white/95 text-black flex items-center justify-center shadow-2xl">
                        <Play className="w-5 h-5 fill-black" />
                      </span>
                    </div>
                    <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/85 text-[10px] font-bold">
                      {v.len}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatch(v.id, v.title);
                      }}
                      className={`absolute top-1.5 right-1.5 w-7 h-7 rounded-full border flex items-center justify-center backdrop-blur transition active:scale-90 ${watchlist.has(v.id) ? "border-[#A855F7] bg-[#A855F7]/30" : "border-white/30 bg-black/40 hover:bg-black/70"}`}
                    >
                      {watchlist.has(v.id) ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <h3 className="mt-2 text-[13px] font-semibold leading-snug line-clamp-2">
                    {v.title}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-white/55">
                    {v.views} • {v.ago}
                  </p>
                </div>
              )) : (
                <div className="col-span-full rounded-xl border border-white/10 bg-white/[0.04] p-8 text-center text-sm text-white/60">
                  No uploads yet.
                </div>
              )}
            </div>
          </section>

          {/* PLAYLISTS */}
          <section className="px-5 md:px-10 lg:px-14 mt-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold text-xl">Playlists</h2>
              <button
                onClick={() => toast("All playlists coming soon")}
                className="text-sm font-semibold hover:underline"
                style={{ color: PURPLE }}
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {PLAYLISTS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => toast(`Opening ${p.label} playlist`)}
                  className="relative rounded-xl overflow-hidden border border-white/10 hover-lift cursor-pointer h-[88px] flex items-center gap-3 px-4 text-left active:scale-[0.98] transition"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(168,85,247,0.18) 0%, rgba(99,102,241,0.10) 100%)," +
                      "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.0))",
                  }}
                >
                  <span
                    className="w-11 h-11 rounded-lg flex items-center justify-center"
                    style={{
                      background: "rgba(168,85,247,0.18)",
                      border: "1px solid rgba(168,85,247,0.4)",
                    }}
                  >
                    <p.I className="w-5 h-5" style={{ color: PURPLE }} />
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
        </main>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-3 left-3 right-3 z-30">
        <div className="relative panel rounded-full px-3 h-16 flex items-center justify-between">
          {[
            { I: Home, label: "Home" },
            { I: Compass, label: "Discover" },
          ].map(({ I, label }) => {
            const active = activeNav === label;
            return (
              <button
                key={label}
                onClick={() => {
                  setActiveNav(label);
                  toast(label);
                }}
                className={`flex flex-col items-center gap-0.5 px-3 transition ${active ? "text-white" : "text-white/55"}`}
              >
                <I className="w-[18px] h-[18px]" />
                <span className="text-[10px] font-semibold">{label}</span>
              </button>
            );
          })}

          <button
            onClick={() => toast("👑 Welcome to Trey TV")}
            className="flex flex-col items-center -mt-7 active:scale-95 transition"
          >
            <div className="ring-pulse p-[3px] bg-[#05070D] rounded-full">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "radial-gradient(circle at 30% 25%, rgba(168,85,247,0.45), rgba(0,0,0,0.6))",
                }}
              >
                <img
                  src={treyTvLogo}
                  alt=""
                  className="w-10 h-10 object-contain"
                  style={{ filter: "drop-shadow(0 0 6px rgba(255,200,87,0.7))" }}
                />
              </div>
            </div>
          </button>

          {[
            { I: Inbox, label: "Inbox" },
            { I: User, label: "Profile" },
          ].map(({ I, label }) => {
            const active = activeNav === label;
            const onClickBtn =
              label === "Profile"
                ? undefined
                : () => {
                    setActiveNav(label);
                    toast(label);
                  };
            const inner = (
              <>
                <I className="w-[18px] h-[18px]" />
                <span className="text-[10px] font-semibold">{label}</span>
              </>
            );
            return label === "Profile" ? (
              <Link
                key={label}
                to="/"
                className="flex flex-col items-center gap-0.5 px-3 text-white/55 hover:text-white transition"
              >
                {inner}
              </Link>
            ) : (
              <button
                key={label}
                onClick={onClickBtn}
                className={`flex flex-col items-center gap-0.5 px-3 transition ${active ? "text-white" : "text-white/55"}`}
              >
                {inner}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

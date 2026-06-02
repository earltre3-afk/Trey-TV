import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { A as AppShell } from "./AppShell-BWcCrjwR.mjs";
import { a1 as Route$9, b as useAuth$1, E as useSubmissions, K as isTreyOwnerProfile, k as currentUser, a2 as portraitFallback, a0 as Toaster } from "./router-BtgGywEC.mjs";
import { h as heroBg, p as post1, a as post2, b as post3, c as post4, d as post5 } from "./lovable-post5-I8S4Bjy7.mjs";
import { u as useProfile, a as useRelationshipStatus, p as portrait } from "./lovable-profile-portrait-DJuAO-UE.mjs";
import { t as treyTvLogo } from "./trey-tv-logo-CG7PjBoN.mjs";
import "../_libs/react-dom.mjs";
import { u as useGoBack } from "./use-go-back-DIwqgoNo.mjs";
import "./index.mjs";
import { t as Crown, H as House, C as Compass, R as Radio, I as Inbox, a8 as Bookmark, P as Plus, ak as ChevronDown, bT as Share, aV as Ellipsis, as as BadgeCheck, a4 as Play, c4 as UserCheck, at as UserPlus, k as Check, b3 as Camera, e as Mic, b7 as Film, U as User } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "./Logo-D0JEzEf4.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/zod.mjs";
import "node:crypto";
import "node:async_hooks";
import "../_libs/livekit__protocol.mjs";
import "../_libs/bufbuild__protobuf.mjs";
import "../_libs/livekit-server-sdk.mjs";
import "../_libs/jose.mjs";
import "node:buffer";
import "node:util";
import "node:fs";
import "node:path";
import "util";
import "crypto";
import "async_hooks";
import "stream";
const NEON_ACCENTS = [
  { ring: "oklch(0.82_0.16_85)", glow: "oklch(0.82_0.16_85_/_0.25)" },
  // gold
  { ring: "oklch(0.7_0.25_340)", glow: "oklch(0.7_0.25_340_/_0.25)" },
  // magenta
  { ring: "oklch(0.82_0.15_215)", glow: "oklch(0.82_0.15_215_/_0.25)" },
  // cyan
  { ring: "oklch(0.78_0.18_150)", glow: "oklch(0.78_0.18_150_/_0.25)" },
  // green
  { ring: "oklch(0.65_0.22_300)", glow: "oklch(0.65_0.22_300_/_0.25)" }
  // purple
];
function seedIndex(seed) {
  if (!seed) return 0;
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) >>> 0;
  }
  return h % NEON_ACCENTS.length;
}
const SIZE_MAP = {
  xs: { wrapper: "size-6", icon: "size-3", border: "border" },
  sm: { wrapper: "size-8", icon: "size-4", border: "border" },
  md: { wrapper: "size-10", icon: "size-5", border: "border" },
  lg: { wrapper: "size-14", icon: "size-6", border: "border-2" },
  xl: { wrapper: "size-20", icon: "size-8", border: "border-2" },
  "2xl": { wrapper: "size-28", icon: "size-10", border: "border-2" }
};
function DefaultAvatar({
  name,
  uid,
  size = "md",
  className = "",
  shape = "circle"
}) {
  const seed = name ?? uid ?? "";
  const accent = NEON_ACCENTS[seedIndex(seed)];
  const { wrapper, icon, border } = SIZE_MAP[size];
  const radius = shape === "circle" ? "rounded-full" : "rounded-xl";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: `${wrapper} ${radius} ${border} flex items-center justify-center shrink-0 overflow-hidden ${className}`,
      style: {
        background: `radial-gradient(ellipse at 60% 30%, ${accent.glow}, oklch(0.13_0.02_270) 70%)`,
        borderColor: accent.ring,
        boxShadow: `0 0 12px -4px ${accent.glow}`
      },
      "aria-hidden": "true",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        User,
        {
          className: `${icon} opacity-60`,
          style: { color: accent.ring },
          strokeWidth: 1.5
        }
      )
    }
  );
}
function AvatarWithFallback({
  src,
  alt = "Profile photo",
  name,
  uid,
  size = "md",
  className = "",
  shape = "circle"
}) {
  const { wrapper } = SIZE_MAP[size];
  const radius = shape === "circle" ? "rounded-full" : "rounded-xl";
  if (src) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        src,
        alt,
        className: `${wrapper} ${radius} object-cover shrink-0 ${className}`
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DefaultAvatar, { name, uid, size, className, shape });
}
const GOLD = "#FFC857";
const PURPLE = "#A855F7";
const SIDE_NAV = [
  { I: House, label: "Home" },
  { I: Compass, label: "Discover" },
  { I: Radio, label: "Live" },
  { I: Inbox, label: "Inbox" },
  { I: Bookmark, label: "Watchlist" },
  { I: Plus, label: "My List" }
];
const TABS = ["Home", "Videos", "Series", "Playlists", "Community", "About"];
const SEASONS = [
  { id: "s1", title: "LATE NIGHTS\nIN ATL", count: "2 SEASONS", img: post1 },
  { id: "s2", title: "ON GO\nDIARIES", count: "1 SEASON", img: post2 },
  { id: "s3", title: "REAL TALKS\nWITH TREY", count: "3 SEASONS", img: post3 },
  { id: "s4", title: "TREY DAY\nFRIDAYS", count: "2 SEASONS", img: post4 }
];
const POPULAR = [
  {
    id: "p1",
    len: "12:45",
    title: "I Bought My Dream Car… Here's How It Went",
    views: "128K views",
    ago: "3 days ago",
    img: post5
  },
  {
    id: "p2",
    len: "15:32",
    title: "SURPRISING My Little Brother With His Dream…",
    views: "98K views",
    ago: "1 week ago",
    img: post2
  },
  {
    id: "p3",
    len: "18:20",
    title: "The Truth About Content Creation",
    views: "210K views",
    ago: "2 weeks ago",
    img: post3
  },
  {
    id: "p4",
    len: "22:17",
    title: "RAW CONVERSATION (No Filter)",
    views: "175K views",
    ago: "3 weeks ago",
    img: post4
  }
];
const PLAYLISTS = [
  { I: Camera, label: "VLOGS", count: "24 VIDEOS" },
  { I: Crown, label: "MOTIVATION", count: "18 VIDEOS" },
  { I: Mic, label: "INTERVIEWS", count: "15 VIDEOS" },
  { I: Film, label: "BEHIND THE SCENES", count: "12 VIDEOS" }
];
function LovableChannelPage({ profile }) {
  const [activeNav, setActiveNav] = reactExports.useState("Home");
  const [activeTab, setActiveTab] = reactExports.useState("Home");
  const [following, setFollowing] = reactExports.useState(false);
  const [followers, setFollowers] = reactExports.useState(profile.followers ?? 0);
  const [watchlist, setWatchlist] = reactExports.useState(/* @__PURE__ */ new Set());
  const [slide, setSlide] = reactExports.useState(1);
  const seasons = profile.isFounder ? SEASONS : [];
  const popular = profile.isFounder ? POPULAR : [];
  const toggleFollow = () => {
    const next = !following;
    setFollowing(next);
    setFollowers((f) => typeof f === "number" ? Math.max(0, f + (next ? 1 : -1)) : f);
    toast(next ? `Following ${profile.name}` : "Unfollowed");
  };
  const toggleWatch = (id, title) => {
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
  const formatFollowers = (n) => typeof n === "number" && n >= 1e3 ? `${(n / 1e3).toFixed(n % 1e3 === 0 ? 0 : 1)}K` : `${n}`;
  const onShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: profile.name,
          url
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast("Channel link copied 🔗");
      }
    } catch {
    }
  };
  const playLatest = () => toast("▶ Playing: Late Nights in ATL — S2 E5");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "min-h-screen text-white relative overflow-x-hidden",
      style: { background: "#05070D" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { position: "top-center", theme: "dark" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            "aria-hidden": true,
            className: "pointer-events-none fixed inset-0 -z-10",
            style: {
              background: "radial-gradient(900px 500px at 85% -5%, rgba(168,85,247,0.18), transparent 60%),radial-gradient(700px 400px at -5% 30%, rgba(0,183,255,0.12), transparent 60%)"
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-screen", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "hidden md:flex flex-col items-center gap-1 w-[88px] lg:w-[104px] py-5 border-r border-white/5 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "block w-16 h-12 mb-4 relative group", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: treyTvLogo,
                alt: "Trey TV",
                className: "w-full h-full object-contain transition-transform group-hover:scale-110",
                style: { filter: "drop-shadow(0 0 12px rgba(255,200,87,0.5))" }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex flex-col items-center gap-1 w-full", children: SIDE_NAV.map(({ I, label }) => {
              const active = activeNav === label;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => {
                    setActiveNav(label);
                    toast(`${label}`);
                  },
                  className: `group flex flex-col items-center gap-1 w-full py-3 transition ${active ? "text-white" : "text-white/55 hover:text-white"}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: `w-10 h-10 rounded-xl flex items-center justify-center border transition ${active ? "border-white/30 bg-white/10 shadow-[0_0_16px_rgba(168,85,247,0.45)]" : "border-white/10 group-hover:border-white/25"}`,
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(I, { className: "w-[18px] h-[18px]" })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] tracking-wide uppercase font-semibold", children: label })
                  ]
                },
                label
              );
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-col items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "ring-pulse p-[2px] hover-scale", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarWithFallback, { src: profile.avatar || portrait, alt: "", name: profile.name, uid: profile.uid, size: "sm", className: "w-10 h-10 rounded-full object-cover" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-4 h-4 text-white/40" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-1 min-w-0 pb-28 md:pb-10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "relative", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-h-[560px] md:min-h-[560px] lg:min-h-[620px] overflow-hidden", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: profile.banner || heroBg,
                  alt: "",
                  loading: "eager",
                  decoding: "async",
                  className: "absolute inset-0 w-full h-full object-cover object-top"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "absolute inset-0 pointer-events-none",
                  style: {
                    background: "linear-gradient(180deg, rgba(5,7,13,0) 30%, rgba(5,7,13,0.55) 70%, #05070D 100%),linear-gradient(90deg, rgba(5,7,13,0.9) 0%, rgba(5,7,13,0.55) 35%, rgba(5,7,13,0) 60%)"
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-4 right-4 flex items-center gap-2 z-10", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: onShare,
                    "aria-label": "Share channel",
                    className: "w-10 h-10 rounded-full border border-white/15 bg-black/40 backdrop-blur flex items-center justify-center hover:bg-black/60 active:scale-95 transition",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Share, { className: "w-4 h-4" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => toast("More options coming soon"),
                    "aria-label": "More",
                    className: "w-10 h-10 rounded-full border border-white/15 bg-black/40 backdrop-blur flex items-center justify-center hover:bg-black/60 active:scale-95 transition",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ellipsis, { className: "w-5 h-5" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative z-[5] flex flex-col justify-end min-h-[560px] md:min-h-[560px] lg:min-h-[620px] px-5 md:px-10 lg:px-14 pb-8 pt-20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-xl", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: "relative inline-block mb-3 group cursor-pointer animate-float-slow",
                      onClick: () => toast("👑 Welcome to Trey TV"),
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "span",
                          {
                            "aria-hidden": true,
                            className: "absolute -inset-6 rounded-full opacity-70 blur-2xl animate-spin-slow",
                            style: {
                              background: "conic-gradient(from 0deg, rgba(255,200,87,0.55), rgba(168,85,247,0.55), rgba(0,183,255,0.45), rgba(255,107,214,0.55), rgba(255,200,87,0.55))"
                            }
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "span",
                          {
                            "aria-hidden": true,
                            className: "absolute -inset-2 rounded-full gold-pulse opacity-60"
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "img",
                          {
                            src: treyTvLogo,
                            alt: "Trey TV",
                            className: "relative h-16 md:h-20 lg:h-24 w-auto transition-transform duration-500 group-hover:scale-110",
                            style: {
                              filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.7)) drop-shadow(0 0 22px rgba(255,200,87,0.6)) brightness(1.1) contrast(1.08) saturate(1.2)"
                            }
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "span",
                          {
                            "aria-hidden": true,
                            className: "absolute inset-0 pointer-events-none mix-blend-screen animate-scan-sweep",
                            style: {
                              background: "linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.85) 50%, transparent 65%)",
                              WebkitMaskImage: `url(${treyTvLogo})`,
                              maskImage: `url(${treyTvLogo})`,
                              WebkitMaskRepeat: "no-repeat",
                              maskRepeat: "no-repeat",
                              WebkitMaskSize: "contain",
                              maskSize: "contain",
                              WebkitMaskPosition: "center",
                              maskPosition: "center",
                              filter: "blur(2px)"
                            }
                          }
                        )
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: "inline-flex items-center gap-2 px-2.5 py-1 rounded-full border mb-3",
                      style: {
                        background: "rgba(168,85,247,0.12)",
                        borderColor: "rgba(168,85,247,0.45)"
                      },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "w-3.5 h-3.5", style: { color: GOLD } }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "span",
                          {
                            className: "text-[10px] font-extrabold tracking-[0.18em] uppercase",
                            style: { color: GOLD },
                            children: "Creator"
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold tracking-[0.18em] text-white/80 uppercase", children: "Channel" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "h1",
                    {
                      className: "font-display font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight break-words overflow-hidden",
                      style: { textShadow: "0 6px 30px rgba(0,0,0,0.7)", maxWidth: "100%", wordWrap: "break-word" },
                      children: profile.name.toUpperCase()
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-1.5 min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[13px] font-medium truncate", style: { color: PURPLE }, children: [
                      "@",
                      profile.handle
                    ] }),
                    profile.isVerified && /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "w-4 h-4 fill-[#A855F7] text-black shrink-0" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-[13px] md:text-sm text-white/85 leading-relaxed", children: profile.bio || "Creator channel is being built." }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex items-center gap-7", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display font-extrabold text-2xl md:text-3xl tabular-nums", children: formatFollowers(followers) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-wider text-white/60", children: "Followers" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display font-extrabold text-2xl md:text-3xl", children: profile.views ?? "-" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-wider text-white/60", children: "Views" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display font-extrabold text-2xl md:text-3xl", children: profile.posts ?? 0 }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-wider text-white/60", children: "Videos" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex items-center gap-2.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "button",
                      {
                        onClick: playLatest,
                        className: "group relative inline-flex items-center gap-2 px-5 h-12 rounded-full font-bold text-sm text-white overflow-hidden active:scale-95 hover:brightness-110 transition",
                        style: {
                          background: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #6366f1 100%)",
                          boxShadow: "0 0 0 1px rgba(255,255,255,0.18) inset, 0 10px 30px rgba(139,92,246,0.55), 0 0 24px rgba(168,85,247,0.55)"
                        },
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-4 h-4 fill-white" }),
                          "Play Latest Video"
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: toggleFollow,
                        className: `inline-flex items-center gap-2 px-5 h-12 rounded-full font-semibold text-sm border backdrop-blur transition active:scale-95 ${following ? "border-[#A855F7]/60 bg-[#A855F7]/15 text-white" : "border-white/25 bg-white/5 hover:bg-white/10"}`,
                        children: following ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "w-4 h-4" }),
                          " Following"
                        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "w-4 h-4" }),
                          " Follow"
                        ] })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: onShare,
                        "aria-label": "Share",
                        className: "w-12 h-12 rounded-full border border-white/25 bg-white/5 hover:bg-white/10 backdrop-blur flex items-center justify-center active:scale-95 transition",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Share, { className: "w-5 h-5" })
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:w-[300px] xl:w-[340px] panel p-5 reveal", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-display font-bold text-base mb-2", children: [
                    "About ",
                    profile.name
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[13px] leading-relaxed text-white/80", children: profile.bio || "Creator channel is being built." }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: () => setActiveTab("About"),
                      className: "mt-4 inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-[12px] font-semibold transition active:scale-95",
                      children: [
                        "More About ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "›" })
                      ]
                    }
                  )
                ] })
              ] }) })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 md:px-10 lg:px-14 mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-7 border-b border-white/10 overflow-x-auto", children: TABS.map((t) => {
              const active = activeTab === t;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => setActiveTab(t),
                  className: `relative pb-3 pt-1 text-sm font-semibold transition whitespace-nowrap ${active ? "text-white" : "text-white/55 hover:text-white"}`,
                  children: [
                    t,
                    active && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: "absolute -bottom-px left-0 right-0 h-[3px] rounded-full",
                        style: { background: PURPLE, boxShadow: `0 0 12px ${PURPLE}` }
                      }
                    )
                  ]
                },
                t
              );
            }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "px-5 md:px-10 lg:px-14 mt-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-bold text-xl mb-3", children: "Latest Release" }),
              profile.isFounder ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-2xl overflow-hidden border border-white/10 group", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "img",
                  {
                    src: post1,
                    alt: "",
                    loading: "lazy",
                    decoding: "async",
                    className: "w-full h-[260px] md:h-[340px] lg:h-[400px] object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "absolute inset-0",
                    style: {
                      background: "linear-gradient(90deg, rgba(5,7,13,0.88) 0%, rgba(5,7,13,0.55) 45%, rgba(5,7,13,0.1) 75%, transparent 100%)"
                    }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 p-6 md:p-8 flex flex-col justify-end max-w-xl", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: "text-[11px] font-extrabold tracking-[0.22em] uppercase mb-2",
                      style: { color: PURPLE },
                      children: [
                        "TREY ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/85", children: "ORIGINAL" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-display font-extrabold text-3xl md:text-4xl lg:text-5xl leading-[0.95] mb-2", children: [
                    "LATE NIGHTS",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                    "IN ATL"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-white/85 font-medium", children: 'S2 • E5 "The Aftermath"' }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: "px-1.5 py-0.5 rounded text-[10px] font-extrabold tracking-wider",
                        style: { background: PURPLE, color: "#fff" },
                        children: "NEW"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-white/75 mb-4", children: "The night was lit… but the morning hit different." }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "button",
                      {
                        onClick: playLatest,
                        className: "inline-flex items-center gap-2 px-4 h-10 rounded-full font-bold text-sm text-white active:scale-95 hover:brightness-110 transition",
                        style: {
                          background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
                          boxShadow: "0 8px 24px rgba(168,85,247,0.55)"
                        },
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-4 h-4 fill-white" }),
                          " Watch Now"
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: () => toggleWatch("latest", "Late Nights in ATL"),
                        "aria-label": "Add to watchlist",
                        className: `w-10 h-10 rounded-full border flex items-center justify-center transition active:scale-95 ${watchlist.has("latest") ? "border-[#A855F7] bg-[#A855F7]/20" : "border-white/25 bg-white/5 hover:bg-white/10"}`,
                        children: watchlist.has("latest") ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" })
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-5 right-6 flex gap-1.5", children: [0, 1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => setSlide(i),
                      "aria-label": `Slide ${i + 1}`,
                      className: `h-1.5 rounded-full transition-all ${i === slide ? "w-6 bg-[#A855F7]" : "w-1.5 bg-white/35 hover:bg-white/60"}`
                    },
                    i
                  )) })
                ] })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "channel-panel rounded-2xl px-6 py-12 text-center text-white/70", children: "First episode coming soon." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "px-5 md:px-10 lg:px-14 mt-8", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-bold text-xl", children: "Seasons" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => toast("All seasons coming soon"),
                    className: "text-sm font-semibold hover:underline",
                    style: { color: PURPLE },
                    children: "View All"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4", children: seasons.length > 0 ? seasons.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => toast(`Opening ${s.title.replace(/\n/g, " ")}`),
                  className: "group relative rounded-xl overflow-hidden border border-white/10 hover-lift cursor-pointer aspect-[4/5] text-left",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "img",
                      {
                        src: s.img,
                        alt: "",
                        loading: "lazy",
                        decoding: "async",
                        className: "absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: "absolute inset-0",
                        style: {
                          background: "linear-gradient(180deg, transparent 35%, rgba(5,7,13,0.88) 100%)"
                        }
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-0 left-0 right-0 p-3.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-extrabold text-lg leading-[0.95] whitespace-pre-line mb-1.5", children: s.title }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: "text-[10px] font-extrabold tracking-[0.18em] uppercase",
                          style: { color: PURPLE },
                          children: s.count
                        }
                      )
                    ] })
                  ]
                },
                s.id
              )) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-full rounded-xl border border-white/10 bg-white/[0.04] p-8 text-center text-sm text-white/60", children: "No seasons yet." }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "px-5 md:px-10 lg:px-14 mt-8", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-bold text-xl", children: "Popular Videos" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => toast("All videos coming soon"),
                    className: "text-sm font-semibold hover:underline",
                    style: { color: PURPLE },
                    children: "View All"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4", children: popular.length > 0 ? popular.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "group cursor-pointer",
                  onClick: () => toast(`▶ ${v.title}`),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-xl overflow-hidden border border-white/10 aspect-video", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "img",
                        {
                          src: v.img,
                          alt: "",
                          loading: "lazy",
                          decoding: "async",
                          className: "absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-12 h-12 rounded-full bg-white/95 text-black flex items-center justify-center shadow-2xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-5 h-5 fill-black" }) }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/85 text-[10px] font-bold", children: v.len }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          onClick: (e) => {
                            e.stopPropagation();
                            toggleWatch(v.id, v.title);
                          },
                          className: `absolute top-1.5 right-1.5 w-7 h-7 rounded-full border flex items-center justify-center backdrop-blur transition active:scale-90 ${watchlist.has(v.id) ? "border-[#A855F7] bg-[#A855F7]/30" : "border-white/30 bg-black/40 hover:bg-black/70"}`,
                          children: watchlist.has(v.id) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-3.5 h-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5" })
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-2 text-[13px] font-semibold leading-snug line-clamp-2", children: v.title }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 text-[11px] text-white/55", children: [
                      v.views,
                      " • ",
                      v.ago
                    ] })
                  ]
                },
                v.id
              )) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-full rounded-xl border border-white/10 bg-white/[0.04] p-8 text-center text-sm text-white/60", children: "No uploads yet." }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "px-5 md:px-10 lg:px-14 mt-8", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-bold text-xl", children: "Playlists" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => toast("All playlists coming soon"),
                    className: "text-sm font-semibold hover:underline",
                    style: { color: PURPLE },
                    children: "View All"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4", children: PLAYLISTS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => toast(`Opening ${p.label} playlist`),
                  className: "relative rounded-xl overflow-hidden border border-white/10 hover-lift cursor-pointer h-[88px] flex items-center gap-3 px-4 text-left active:scale-[0.98] transition",
                  style: {
                    background: "linear-gradient(135deg, rgba(168,85,247,0.18) 0%, rgba(99,102,241,0.10) 100%),linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.0))"
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: "w-11 h-11 rounded-lg flex items-center justify-center",
                        style: {
                          background: "rgba(168,85,247,0.18)",
                          border: "1px solid rgba(168,85,247,0.4)"
                        },
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(p.I, { className: "w-5 h-5", style: { color: PURPLE } })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-extrabold text-sm tracking-wide", children: p.label }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold tracking-[0.16em] uppercase text-white/55", children: p.count })
                    ] })
                  ]
                },
                p.label
              )) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "md:hidden fixed bottom-3 left-3 right-3 z-30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative panel rounded-full px-3 h-16 flex items-center justify-between", children: [
          [
            { I: House, label: "Home" },
            { I: Compass, label: "Discover" }
          ].map(({ I, label }) => {
            const active = activeNav === label;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => {
                  setActiveNav(label);
                  toast(label);
                },
                className: `flex flex-col items-center gap-0.5 px-3 transition ${active ? "text-white" : "text-white/55"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(I, { className: "w-[18px] h-[18px]" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold", children: label })
                ]
              },
              label
            );
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => toast("👑 Welcome to Trey TV"),
              className: "flex flex-col items-center -mt-7 active:scale-95 transition",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ring-pulse p-[3px] bg-[#05070D] rounded-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "w-14 h-14 rounded-full flex items-center justify-center",
                  style: {
                    background: "radial-gradient(circle at 30% 25%, rgba(168,85,247,0.45), rgba(0,0,0,0.6))"
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "img",
                    {
                      src: treyTvLogo,
                      alt: "",
                      className: "w-10 h-10 object-contain",
                      style: { filter: "drop-shadow(0 0 6px rgba(255,200,87,0.7))" }
                    }
                  )
                }
              ) })
            }
          ),
          [
            { I: Inbox, label: "Inbox" },
            { I: User, label: "Profile" }
          ].map(({ I, label }) => {
            const active = activeNav === label;
            const onClickBtn = label === "Profile" ? void 0 : () => {
              setActiveNav(label);
              toast(label);
            };
            const inner = /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(I, { className: "w-[18px] h-[18px]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold", children: label })
            ] });
            return label === "Profile" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              Link,
              {
                to: "/",
                className: "flex flex-col items-center gap-0.5 px-3 text-white/55 hover:text-white transition",
                children: inner
              },
              label
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: onClickBtn,
                className: `flex flex-col items-center gap-0.5 px-3 transition ${active ? "text-white" : "text-white/55"}`,
                children: inner
              },
              label
            );
          })
        ] }) })
      ]
    }
  );
}
const heroFallback = "/assets/lovable-hero-bg-3r999nyx.jpg";
function CreatorChannelRoute() {
  const {
    uid
  } = Route$9.useParams();
  const {
    user,
    isGuest
  } = useAuth$1();
  const {
    profile,
    loading
  } = useProfile(uid);
  const {
    status
  } = useRelationshipStatus(profile?.id || "");
  const submissions = useSubmissions();
  useGoBack(`/u/${uid}`);
  const [tab, setTab] = reactExports.useState("home");
  const [subscribed, setSubscribed] = reactExports.useState(false);
  const [giftOpen, setGiftOpen] = reactExports.useState(false);
  const [following, setFollowing] = reactExports.useState(false);
  const normalized = reactExports.useMemo(() => {
    if (!profile) {
      const isTreyProfile = isTreyOwnerProfile({
        uid
      });
      return {
        id: "",
        uid,
        name: isTreyProfile ? currentUser.name : loading ? "Loading channel" : "Creator channel unavailable",
        handle: isTreyProfile ? currentUser.handle : uid,
        avatar: isTreyProfile ? portraitFallback : "",
        banner: heroFallback,
        bio: isTreyProfile ? currentUser.bio : "This creator channel is not available yet.",
        location: isTreyProfile ? currentUser.location : "",
        website: isTreyProfile ? currentUser.link : "",
        instagram: "",
        tiktok: "",
        youtube: "",
        followers: isTreyProfile ? currentUser.stats.followers : 0,
        posts: isTreyProfile ? currentUser.stats.posts : 0,
        creator: isTreyProfile,
        verified: isTreyProfile
      };
    }
    const isCreator = profile.creator_status === "approved" || profile.role === "creator" || profile.role === "admin";
    return {
      id: profile.id,
      uid: profile.public_profile_uid,
      name: profile.display_name || profile.username || "Creator",
      handle: profile.username || "creator",
      avatar: profile.avatar_url || "",
      banner: profile.banner_url || heroFallback,
      bio: profile.bio || "Creator channel is being built.",
      location: profile.location || "",
      website: profile.link_url || "",
      instagram: profile.social_instagram || "",
      tiktok: profile.social_tiktok || "",
      youtube: profile.social_youtube || "",
      followers: profile.follower_count ?? 0,
      posts: profile.post_count ?? 0,
      creator: isCreator,
      verified: isCreator
    };
  }, [loading, profile, uid]);
  !isGuest && user?.uid === uid;
  following || Boolean(status?.is_following);
  const publicEpisodes = reactExports.useMemo(() => {
    if (!profile) return [];
    return submissions.submissions.filter((episode) => {
      const visible = episode.status === "approved" || episode.status === "published" || episode.status === "scheduled";
      const sameCreator = episode.creator_id === profile.public_profile_uid || episode.creator_id === profile.id || episode.creator_handle === profile.username;
      return visible && sameCreator;
    });
  }, [profile, submissions.submissions]);
  publicEpisodes.find((episode) => episode.is_trailer || episode.episode_type === "Trailer") ?? publicEpisodes[0];
  publicEpisodes.find((episode) => !episode.is_trailer) ?? publicEpisodes[0];
  reactExports.useMemo(() => buildShows(publicEpisodes), [publicEpisodes]);
  if (!normalized.creator) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { wide: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "creator-channel-page mx-auto max-w-xl py-12 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "channel-panel p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "mx-auto size-10 text-white/40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-4 text-2xl font-bold", children: "Creator channel unavailable" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-white/60", children: "This profile is not an approved creator channel yet." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/u/$uid", params: {
        uid
      }, className: "mt-5 inline-flex rounded-full bg-white px-5 py-2 text-sm font-bold text-black", children: "View Profile" })
    ] }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { wide: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "-mx-4 -mt-4 sm:-mx-6 lg:-mx-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LovableChannelPage, { profile: {
    uid: normalized.uid,
    id: normalized.id,
    name: normalized.name,
    handle: normalized.handle,
    avatar: normalized.avatar,
    banner: normalized.banner,
    bio: normalized.bio,
    followers: normalized.followers,
    posts: normalized.posts,
    views: "-",
    isVerified: normalized.verified,
    isFounder: isTreyOwnerProfile({
      uid: normalized.uid,
      username: normalized.handle
    })
  } }) }) });
}
function buildShows(episodes) {
  const map = /* @__PURE__ */ new Map();
  episodes.forEach((episode) => {
    const id = episode.show_id || "singles";
    const title = episode.show_title || "Singles and Specials";
    if (!map.has(id)) map.set(id, {
      id,
      title,
      episodes: []
    });
    map.get(id).episodes.push(episode);
  });
  return [...map.values()];
}
export {
  CreatorChannelRoute as component
};

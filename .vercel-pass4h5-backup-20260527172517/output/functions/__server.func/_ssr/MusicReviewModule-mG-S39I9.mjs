import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useAuth$1, g as useSupabaseSession } from "./router-BtgGywEC.mjs";
import { s as supabase } from "./supabase-BQ18xbNk.mjs";
import { p as Shield, A as ArrowLeft, B as Bell, s as LogOut, _ as Cloud, r as ChevronRight, e as Mic, c as ChartColumn, av as Brain, a5 as Users, aw as Trophy, t as Crown, Z as Zap, Y as Flame, u as Gem, ax as CircleCheck, an as Upload, d as Image, ay as CircleAlert, az as LoaderCircle, aA as PenTool, ag as SlidersVertical, ai as Star, aB as RotateCw, aC as PenLine, a9 as Clock, ap as Activity, aD as DollarSign, i as Lock, aE as Info, al as Award, a4 as Play, aF as Trash2, aG as Save, j as Eye, f as Send, aH as SkipForward, aI as TriangleAlert, aJ as Pause, aK as VolumeX, aL as Volume2, S as Sparkles, b as Heart, aM as MessageSquare, a0 as Music, U as User, aN as ShoppingBag } from "../_libs/lucide-react.mjs";
const StageBackground = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 -z-10 overflow-hidden pointer-events-none", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[#05070D]" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "absolute -top-32 -left-20 w-[60vw] h-[60vw] rounded-full opacity-30",
      style: {
        background: "radial-gradient(circle, rgba(0,183,255,0.35), transparent 60%)",
        filter: "blur(40px)"
      }
    }
  ),
  /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "absolute -bottom-40 -right-20 w-[55vw] h-[55vw] rounded-full opacity-25",
      style: {
        background: "radial-gradient(circle, rgba(168,85,247,0.3), transparent 60%)",
        filter: "blur(40px)"
      }
    }
  ),
  /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "absolute top-1/3 left-1/2 -translate-x-1/2 w-[80vw] h-[40vw] opacity-10",
      style: {
        background: "radial-gradient(ellipse, rgba(255,200,87,0.25), transparent 70%)",
        filter: "blur(60px)"
      }
    }
  ),
  /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "absolute inset-0 opacity-[0.04]",
      style: {
        backgroundImage: "linear-gradient(rgba(0,183,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,183,255,0.6) 1px, transparent 1px)",
        backgroundSize: "60px 60px"
      }
    }
  )
] });
const TreyLogo = ({ size = "md" }) => {
  const scale = size === "sm" ? "text-2xl" : size === "lg" ? "text-5xl" : "text-4xl";
  const sub = size === "sm" ? "text-[8px]" : "text-[10px]";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center select-none", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: `${scale} font-black tracking-tight leading-none`,
        style: { fontFamily: '"Impact","Anton","Bebas Neue",Arial,sans-serif' },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              style: {
                color: "#FFC857",
                textShadow: "0 0 18px rgba(255,200,87,0.55), 0 0 30px rgba(255,176,0,0.35)",
                WebkitTextStroke: "0.5px rgba(255,200,87,0.4)"
              },
              children: "TREY"
            }
          ),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              style: {
                color: "#00B7FF",
                textShadow: "0 0 18px rgba(0,183,255,0.6), 0 0 30px rgba(0,183,255,0.4)"
              },
              children: "TV"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `${sub} tracking-[0.65em] text-[#00B7FF] mt-0.5`,
        style: { textShadow: "0 0 10px rgba(0,183,255,0.5)" },
        children: "G A M E S"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `${sub} tracking-[0.45em] text-[#FFC857] mt-1`,
        style: { textShadow: "0 0 8px rgba(255,200,87,0.4)" },
        children: "— LIVE REVIEW —"
      }
    )
  ] });
};
const musicReviewEnv = {
  demoAuthEnabled: false,
  allowPublicAudioFallback: false,
  cashAppCashtag: "",
  cashAppQrPath: "/assets/payment/cashapp-qr.png"
};
function normalizeHostUser(hostUser) {
  if (!hostUser?.id) return null;
  const role = hostUser.role || "";
  return {
    id: String(hostUser.id),
    email: hostUser.email || "",
    name: hostUser.name || hostUser.username || "Artist",
    isAdmin: Boolean(hostUser.isAdmin || role === "admin" || role === "owner")
  };
}
function useTreyAuth() {
  const appAuth = useAuth$1();
  const supabaseSession = useSupabaseSession();
  const [demoUser, setDemoUser] = reactExports.useState(null);
  reactExports.useEffect(() => {
    return;
  }, []);
  const hostUser = typeof window !== "undefined" ? normalizeHostUser(window.__TREY_USER__) : null;
  const sessionUser = reactExports.useMemo(() => {
    if (hostUser) return hostUser;
    if (supabaseSession.user) {
      const metadata = supabaseSession.user.user_metadata;
      const name = typeof metadata?.name === "string" ? metadata.name : typeof metadata?.full_name === "string" ? metadata.full_name : supabaseSession.user.email?.split("@")[0] || "Artist";
      return {
        id: supabaseSession.user.id,
        email: supabaseSession.user.email || "",
        name,
        isAdmin: supabaseSession.isRealAdmin || supabaseSession.isOwner
      };
    }
    if (appAuth.user && !appAuth.isGuest) {
      return {
        id: appAuth.user.uid,
        email: "",
        name: appAuth.user.name || appAuth.user.handle || "Artist",
        isAdmin: appAuth.isAdmin
      };
    }
    return null;
  }, [
    appAuth.isAdmin,
    appAuth.isGuest,
    appAuth.user,
    demoUser,
    hostUser,
    supabaseSession.isOwner,
    supabaseSession.isRealAdmin,
    supabaseSession.user
  ]);
  const signInDemo = (name, email, asAdmin = false) => {
    return;
  };
  const signOut = async () => {
    try {
      await supabaseSession.signOutSupabase();
    } catch {
    }
    try {
      appAuth.signOut();
    } catch {
    }
    setDemoUser(null);
  };
  const toggleAdmin = () => {
    return;
  };
  const refresh = reactExports.useCallback(async () => {
  }, []);
  return {
    user: sessionUser,
    loading: supabaseSession.loading,
    signInDemo,
    signOut,
    toggleAdmin,
    refresh,
    demoAuthEnabled: musicReviewEnv.demoAuthEnabled
  };
}
const Header = ({ showBack, onBack, rightSlot }) => {
  const { user, signOut, demoAuthEnabled } = useTreyAuth();
  const [showSignIn, setShowSignIn] = reactExports.useState(false);
  const [name, setName] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-30 bg-[#05070D]/80 backdrop-blur-xl border-b border-[#1a2942]/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl mx-auto flex items-center justify-between px-4 pt-3 pb-3 relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12", children: showBack ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onBack,
          className: "w-10 h-10 rounded-2xl bg-[#0B1426] border border-[#1a2942] flex items-center justify-center text-[#F8FAFC] hover:border-[#00B7FF]/60 transition",
          "aria-label": "Back",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 18 })
        }
      ) : rightSlot ? null : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-1/2 -translate-x-1/2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TreyLogo, { size: "md" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        rightSlot,
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "relative w-10 h-10 rounded-full bg-[#0B1426] border border-[#1a2942] flex items-center justify-center text-[#F8FAFC] hover:border-[#00B7FF]/60 transition", "aria-label": "Notifications", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { size: 16 }) }),
        user ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: `w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold ${user.isAdmin ? "border-[#FFC857] text-[#FFC857]" : "border-[#00B7FF] text-[#00B7FF]"} bg-[#0B1426]`,
              "aria-label": "Account",
              children: user.name.charAt(0).toUpperCase()
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-0 mt-2 w-56 rounded-2xl bg-[#0B1426] border border-[#1a2942] shadow-xl p-3 hidden group-hover:block z-40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#F8FAFC] font-semibold truncate", children: user.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[#94A3B8] truncate", children: user.email }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-col gap-2", children: [
              demoAuthEnabled,
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: signOut, className: "flex items-center gap-2 text-xs text-[#EF4444]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { size: 12 }),
                " Sign out"
              ] })
            ] })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setShowSignIn(true),
            className: "px-3 py-2 rounded-2xl border border-[#00B7FF] text-[#00B7FF] text-xs font-semibold hover:bg-[#00B7FF]/10",
            children: "SIGN IN"
          }
        )
      ] })
    ] }) }),
    showSignIn && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 bg-[#05070D]/85 backdrop-blur-md flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#0B1426] to-[#08111F] border border-[#1a2942] p-6 shadow-[0_0_60px_-10px_rgba(0,183,255,0.4)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TreyLogo, { size: "sm" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#FFC857] text-xs tracking-[4px] text-center mb-3", children: "SIGN IN TO SUBMIT" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-[#1a2942] bg-[#05070D]/70 p-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#F8FAFC] font-bold", children: "Use your Trey TV account" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#94A3B8] text-sm mt-2 leading-relaxed", children: "Sign in through Trey TV to submit music, comment, and receive your review report. This import-safe module does not create demo accounts in production." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowSignIn(false), className: "w-full mt-3 text-xs text-[#94A3B8]", children: "Cancel" }),
      demoAuthEnabled
    ] }) })
  ] });
};
const BottomNav = ({ active, onNavigate }) => {
  const item = (key, icon, label) => {
    const isActive = active === key;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => onNavigate(key),
        className: `flex flex-col items-center justify-center gap-1 flex-1 py-1 ${isActive ? "text-[#00B7FF]" : "text-[#64748B]"}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: isActive ? "drop-shadow-[0_0_8px_rgba(0,183,255,0.6)]" : "", children: icon }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] tracking-wider", children: label })
        ]
      }
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "nav",
    {
      className: "fixed bottom-0 left-0 right-0 z-30 bg-[#05070D]/95 backdrop-blur-xl border-t border-[#1a2942]",
      style: { paddingBottom: "env(safe-area-inset-bottom)" },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl mx-auto flex items-end px-2 pt-2 pb-2 relative", children: [
        item("review", /* @__PURE__ */ jsxRuntimeExports.jsx(Music, { size: 20 }), "REVIEW"),
        item("profile", /* @__PURE__ */ jsxRuntimeExports.jsx(User, { size: 20 }), "MY PROFILE"),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => onNavigate("submit"),
            className: "w-16 h-16 -mt-6 rounded-full bg-[#0B1426] border-2 border-[#00B7FF] flex flex-col items-center justify-center text-[#00B7FF] shadow-[0_0_30px_-3px_rgba(0,183,255,0.7)]",
            "aria-label": "Submit",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { size: 20 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] mt-0.5 tracking-wider", children: "SUBMIT" })
            ]
          }
        ) }),
        item("leaderboard", /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { size: 20 }), "LEADERBOARD"),
        item("shop", /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { size: 20 }), "SHOP")
      ] })
    }
  );
};
const Waveform = ({
  playing = false,
  bars = 48,
  height = 56,
  gradient = ["#00B7FF", "#A855F7"],
  className = ""
}) => {
  const [seed, setSeed] = reactExports.useState(0);
  reactExports.useEffect(() => {
    if (!playing) return;
    const i = setInterval(() => setSeed((s) => s + 1), 180);
    return () => clearInterval(i);
  }, [playing]);
  const heights = Array.from({ length: bars }, (_, i) => {
    const base = Math.sin((i + seed) * 0.5) * 0.4 + 0.6;
    const noise = playing ? Math.sin(i * 1.7 + seed * 2.1) * 0.3 + 0.7 : 0.45;
    return Math.round(Math.max(0.15, Math.min(1, base * noise)) * 1e4) / 1e4;
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex items-center gap-[3px] ${className}`, style: { height }, children: heights.map((h, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "flex-1 rounded-full transition-all duration-200",
      style: {
        height: `${h * 100}%`,
        background: `linear-gradient(180deg, ${gradient[0]}, ${gradient[1]})`,
        boxShadow: playing ? `0 0 8px ${gradient[0]}80` : "none",
        opacity: playing ? 0.95 : 0.55
      }
    },
    i
  )) });
};
const Home = ({ onSubmit, onOpenMic, onQueue, onLive, onProfile, onSkipLine }) => {
  const [nowPlaying, setNowPlaying2] = reactExports.useState(null);
  const [queue, setQueue] = reactExports.useState([]);
  reactExports.useEffect(() => {
    const load = async () => {
      const { data: np } = await supabase.from("music_review_submissions").select("*").eq("status", "now_playing").limit(1).maybeSingle();
      setNowPlaying2(np);
      const { data: q } = await supabase.from("music_review_submissions").select("*").in("status", ["in_queue", "ai_prechecked"]).order("queue_position", { ascending: true, nullsFirst: false }).limit(4);
      setQueue(q || []);
    };
    load();
    const i = setInterval(load, 8e3);
    return () => clearInterval(i);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pt-4 pb-32 max-w-5xl mx-auto space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative overflow-hidden rounded-3xl border border-[#1a2942] bg-gradient-to-br from-[#0B1426] via-[#0a1830] to-[#08111F] p-5 md:p-8 shadow-[0_0_60px_-15px_rgba(0,183,255,0.5)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -right-10 top-0 w-60 h-60 opacity-30 pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full rounded-full", style: { background: "radial-gradient(circle, rgba(0,183,255,0.5), transparent 70%)", filter: "blur(20px)" } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-4xl md:text-6xl font-black leading-[0.95] text-[#F8FAFC]", children: [
          "LIVE MUSIC",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
            background: "linear-gradient(135deg, #00B7FF 0%, #A855F7 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }, children: "REVIEW" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-[#94A3B8] text-sm md:text-base max-w-md leading-relaxed", children: [
          "Real feedback. Live on air.",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          "Get heard. Get scored. Get seen."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex flex-col md:flex-row gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: onSubmit,
              className: "group relative flex items-center gap-3 px-5 py-4 rounded-2xl bg-gradient-to-r from-[#FFC857] to-[#FFB000] text-[#05070D] font-black tracking-wide shadow-[0_0_30px_-5px_rgba(255,200,87,0.7)] hover:scale-[1.02] active:scale-100 transition",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-[#05070D] flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Cloud, { size: 18, className: "text-[#FFC857]" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-left", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base", children: "SUBMIT YOUR SONG" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-normal opacity-80", children: "Start Your Review" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 20 })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: onOpenMic,
              className: "flex items-center gap-3 px-5 py-4 rounded-2xl border border-[#00B7FF]/60 bg-[#0B1426]/80 text-[#00B7FF] font-bold tracking-wide hover:bg-[#00B7FF]/10 transition",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { size: 18 }),
                "OPEN MIC ROOM",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 18 })
              ]
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onLive, className: "w-full text-left rounded-3xl border border-[#FFC857]/40 bg-gradient-to-r from-[#0B1426] to-[#101827] p-4 hover:border-[#FFC857] transition shadow-[0_0_25px_-10px_rgba(255,200,87,0.5)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFC857]/30 to-[#00B7FF]/20 flex items-center justify-center border border-[#FFC857]/40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { size: 20, className: "text-[#FFC857]" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#FFC857] text-[10px] tracking-[3px] font-bold", children: "NOW PLAYING" }),
        nowPlaying ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#F8FAFC] font-bold truncate", children: nowPlaying.song_title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[#00B7FF] text-xs truncate", children: [
            "by ",
            nowPlaying.artist_name
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#94A3B8] text-sm", children: "No live review right now — be first." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Waveform, { playing: !!nowPlaying, bars: 14, height: 32, className: "w-20" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl border border-[#1a2942] bg-[#0B1426]/60 p-5 backdrop-blur-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#00B7FF] text-[11px] tracking-[6px] text-center mb-4 font-bold", children: "• HOW IT WORKS •" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-4 gap-2 md:gap-4", children: [
        { n: 1, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { size: 20 }), title: "AI PRE-CHECK", sub: "Quality, vocals & content", color: "#00B7FF" },
        { n: 2, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 20 }), title: "JOIN THE QUEUE", sub: "Enter live queue", color: "#00B7FF" },
        { n: 3, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { size: 20 }), title: "LIVE REVIEW", sub: "Trey reviews it live", color: "#FFC857" },
        { n: 4, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { size: 20 }), title: "SCORE POSTED", sub: "Saved to your profile", color: "#00B7FF" }
      ].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "w-14 h-14 rounded-full flex items-center justify-center border-2",
              style: { borderColor: s.color, color: s.color, boxShadow: `0 0 18px -5px ${s.color}` },
              children: s.icon
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-1 -left-1 w-5 h-5 rounded-full bg-[#0B1426] border border-[#1a2942] text-[10px] flex items-center justify-center text-[#00B7FF] font-bold", children: s.n })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-[10px] md:text-xs font-bold text-[#F8FAFC] tracking-wide", children: s.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] md:text-[10px] text-[#94A3B8] mt-1 hidden md:block", children: s.sub })
      ] }, s.n)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onQueue, className: "text-left rounded-3xl border border-[#1a2942] bg-[#0B1426]/80 p-4 hover:border-[#00B7FF]/60 transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#F8FAFC] font-bold tracking-wide", children: "LIVE QUEUE" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 text-[#EF4444] text-[10px] font-bold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" }),
            " LIVE"
          ] })
        ] }),
        nowPlaying && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-[#FFC857]/60 p-2 mb-2 bg-[#0a1a2b]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#FFC857] text-[9px] tracking-[2px] font-bold", children: "NOW PLAYING" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#F8FAFC] font-semibold text-sm", children: nowPlaying.song_title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#00B7FF] text-xs", children: nowPlaying.artist_name })
        ] }),
        queue.length === 0 && !nowPlaying && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#94A3B8] text-xs py-4 text-center", children: "Queue is empty. Submit to be first." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: queue.slice(0, 4).map((q, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 py-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded-full bg-[#101827] flex items-center justify-center text-[#00B7FF] text-xs font-bold", children: i + 2 }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#F8FAFC] text-sm truncate", children: q.song_title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#94A3B8] text-xs truncate", children: q.artist_name })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#00B7FF] text-[10px] font-bold", children: i === 0 ? "UP NEXT" : "IN QUEUE" })
        ] }, q.id)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center justify-center gap-1 text-[#00B7FF] text-xs font-bold border-t border-[#1a2942] pt-2", children: [
          "VIEW FULL QUEUE ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 14 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onSkipLine, className: "text-left rounded-3xl border border-[#FFC857]/40 bg-gradient-to-br from-[#0B1426] to-[#101827] p-4 hover:border-[#FFC857] transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 20, className: "text-[#FFC857]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#FFC857] font-bold tracking-wide", children: "SKIP THE LINE" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#94A3B8] text-xs", children: "Get heard faster. Bigger impact." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: [
          { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 16 }), label: "QUICK PASS", sub: "Top of the queue", price: "$5", color: "#FFC857" },
          { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { size: 16 }), label: "HOT SEAT", sub: "Next up, guaranteed", price: "$10", color: "#A855F7" },
          { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Gem, { size: 16 }), label: "FRONT OF LINE", sub: "Priority + promo boost", price: "$15", color: "#00B7FF" }
        ].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-2.5 rounded-2xl border border-[#1a2942] bg-[#05070D]/40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-xl flex items-center justify-center", style: { background: `${t.color}20`, color: t.color, border: `1px solid ${t.color}40` }, children: t.icon }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#F8FAFC] font-bold text-sm", style: { color: t.color }, children: t.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#94A3B8] text-[10px]", children: t.sub })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#F8FAFC] font-black", children: t.price })
        ] }, t.label)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-[#FFC857] text-[#FFC857] font-bold text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 14 }),
          " UPGRADE NOW"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onProfile, className: "w-full text-left rounded-3xl border border-[#1a2942] bg-gradient-to-r from-[#0B1426] to-[#08111F] p-4 flex items-center gap-4 hover:border-[#A855F7]/60 transition", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-2xl flex items-center justify-center", style: { background: "linear-gradient(135deg,#A855F7,#00B7FF)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { size: 22, className: "text-white" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#F8FAFC] font-bold", children: "BUILD YOUR LEGACY." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#94A3B8] text-xs", children: "Climb the leaderboard, earn badges, become the next Featured Artist." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "text-[#94A3B8]", size: 20 })
    ] })
  ] });
};
const ALLOWED_AUDIO = ["audio/mpeg", "audio/wav", "audio/wave", "audio/x-wav", "audio/mp4", "audio/m4a", "audio/aac", "audio/x-m4a"];
const MAX_AUDIO_MB = 25;
const PRIVATE_AUDIO_BUCKETS = /* @__PURE__ */ new Set(["music-review-audio", "open-mic-temp-audio"]);
function validateAudio(file) {
  if (!ALLOWED_AUDIO.includes(file.type) && !/\.(mp3|wav|m4a|aac)$/i.test(file.name)) {
    return "Unsupported audio format. Use MP3, WAV, M4A, or AAC.";
  }
  if (file.size > MAX_AUDIO_MB * 1024 * 1024) {
    return `File too large. Max ${MAX_AUDIO_MB}MB.`;
  }
  return null;
}
function probeDuration(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement("audio");
    a.preload = "metadata";
    a.onloadedmetadata = () => {
      const d = a.duration || 0;
      URL.revokeObjectURL(url);
      resolve(d);
    };
    a.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };
    a.src = url;
  });
}
async function uploadFile(bucket, file, userId) {
  const ext = file.name.split(".").pop() || "bin";
  const safeExt = ext.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: PRIVATE_AUDIO_BUCKETS.has(bucket) ? "60" : "3600",
    upsert: false,
    contentType: file.type
  });
  if (error) throw error;
  const duration = file.type.startsWith("audio/") || /\.(mp3|wav|m4a|aac)$/i.test(file.name) ? await probeDuration(file) : 0;
  return {
    path,
    // Keep the field for compatibility. Audio buckets should use signed URLs.
    publicUrl: PRIVATE_AUDIO_BUCKETS.has(bucket) ? "" : supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl,
    size: file.size,
    duration: Math.round(duration)
  };
}
function getPublicUrl(bucket, path) {
  if (!path) return void 0;
  if (PRIVATE_AUDIO_BUCKETS.has(bucket) && true) {
    console.warn(`[Trey TV Music Review] Refused public URL fallback for private audio bucket: ${bucket}`);
    return void 0;
  }
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
async function getSignedAudioUrl(bucket, path, expiresInSec = 600) {
  if (!path) return void 0;
  try {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSec);
    if (!error && data?.signedUrl) return data.signedUrl;
    if (musicReviewEnv.allowPublicAudioFallback) ;
    console.warn(`[Trey TV Music Review] Signed URL failed for ${bucket}/${path}. Public fallback is disabled.`);
    return void 0;
  } catch {
    return void 0;
  }
}
function useSignedAudioUrl(bucket, path, expiresInSec = 600) {
  const [url, setUrl] = reactExports.useState(void 0);
  reactExports.useEffect(() => {
    let cancelled = false;
    let timer;
    const resolve = async () => {
      const u = await getSignedAudioUrl(bucket, path, expiresInSec);
      if (!cancelled) setUrl(u);
      timer = setTimeout(resolve, Math.max(3e4, expiresInSec * 800));
    };
    if (path) resolve();
    else setUrl(void 0);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [bucket, path, expiresInSec]);
  return url;
}
const GENRES = ["Hip-Hop", "R&B", "Pop", "Trap", "Afrobeats", "Drill", "Soul", "Rock", "EDM", "Country", "Other"];
const MOODS = ["Hype", "Smooth", "Emotional", "Dark", "Uplifting", "Romantic", "Aggressive", "Chill"];
const Submit = ({ onPrecheckReady }) => {
  const { user } = useTreyAuth();
  const [form, setForm] = reactExports.useState({
    song_title: "",
    artist_name: user?.name || "",
    genre: "",
    mood: "",
    explicit: false,
    note: "",
    rights: false,
    terms: false
  });
  const [audioFile, setAudioFile] = reactExports.useState(null);
  const [coverFile, setCoverFile] = reactExports.useState(null);
  const [error, setError] = reactExports.useState(null);
  const [stage, setStage] = reactExports.useState("idle");
  if (!user) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-10 max-w-md mx-auto text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-[#1a2942] bg-[#0B1426] p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#FFC857] text-sm tracking-[3px] mb-2", children: "SIGN IN REQUIRED" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-black text-[#F8FAFC]", children: "Sign in to submit your song" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#94A3B8] text-sm mt-3", children: "Your account email is used for your live review report." })
    ] }) });
  }
  const onAudioPick = (f) => {
    if (!f) return;
    const err = validateAudio(f);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setAudioFile(f);
  };
  const submit = async () => {
    setError(null);
    if (!form.song_title.trim()) return setError("Song title is required.");
    if (!form.artist_name.trim()) return setError("Artist name is required.");
    if (!audioFile) return setError("Please upload an audio file.");
    if (!form.rights) return setError("Please confirm you have rights to submit.");
    if (!form.terms) return setError("Please agree to the review terms.");
    setStage("uploading");
    try {
      const audio = await uploadFile("music-review-audio", audioFile, user.id);
      let cover = null;
      if (coverFile) {
        cover = await uploadFile("music-review-cover-art", coverFile, user.id);
      }
      const { data: sub, error: insErr } = await supabase.from("music_review_submissions").insert({
        user_id: user.id,
        user_email: user.email,
        song_title: form.song_title.trim(),
        artist_name: form.artist_name.trim(),
        genre: form.genre || null,
        mood: form.mood || null,
        explicit: form.explicit,
        note_to_reviewer: form.note || null,
        audio_storage_path: audio.path,
        cover_art_storage_path: cover?.path || null,
        audio_duration: audio.duration,
        file_size: audio.size,
        status: "pending",
        submitted_at: (/* @__PURE__ */ new Date()).toISOString()
      }).select().single();
      if (insErr || !sub) throw insErr || new Error("Failed to save submission");
      setStage("analyzing");
      const { data: ai } = await supabase.functions.invoke("music-review-ai-precheck", {
        body: {
          songTitle: form.song_title,
          artistName: form.artist_name,
          genre: form.genre,
          mood: form.mood,
          note: form.note
        }
      });
      if (!ai?.precheck) {
        setError("AI Pre-Check failed. You can still continue.");
        setStage("idle");
        return;
      }
      await supabase.from("music_review_submissions").update({
        ai_precheck_score: ai.precheck.total_score,
        ai_precheck_json: ai.precheck,
        status: "ai_prechecked"
      }).eq("id", sub.id);
      onPrecheckReady(sub.id, ai.precheck);
    } catch (e) {
      const errorMessage = e.message || "Submission failed";
      if (errorMessage.includes("Bucket not found") || errorMessage.includes("bucket")) {
        setError("Upload storage is being configured. Please try again shortly.");
        console.error("[Trey TV Music Review] Storage bucket error:", errorMessage);
      } else {
        setError(errorMessage);
      }
      setStage("idle");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pt-4 pb-40 md:pb-32 max-w-2xl mx-auto space-y-4", style: { paddingBottom: `calc(max(2.5rem, env(safe-area-inset-bottom)) + 120px)` }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#FFC857] text-[11px] tracking-[5px] font-bold", children: "STEP 1 OF 3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-black text-[#F8FAFC] mt-1", children: "Submit Your Song" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#94A3B8] text-sm mt-1", children: "Real review. Real score. Real exposure." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-[#1a2942] bg-[#0B1426]/80 p-4 md:p-5 space-y-4 backdrop-blur-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[#00B7FF] text-[11px] tracking-[3px] font-bold", children: "AUDIO FILE *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `mt-2 flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed ${audioFile ? "border-[#22C55E]/60 bg-[#22C55E]/5" : "border-[#1a2942] bg-[#05070D]/40"} cursor-pointer hover:border-[#00B7FF]/60 transition`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "audio/*,.mp3,.wav,.m4a,.aac", className: "hidden", onChange: (e) => onAudioPick(e.target.files?.[0]) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-2xl bg-[#0B1426] border border-[#1a2942] flex items-center justify-center text-[#00B7FF] shrink-0", children: audioFile ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 22, className: "text-[#22C55E]" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 22 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#F8FAFC] font-bold truncate", children: audioFile ? audioFile.name : "Tap to upload song" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[#94A3B8] text-xs", children: [
              "MP3, WAV, M4A, AAC — max ",
              MAX_AUDIO_MB,
              "MB"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[#00B7FF] text-[11px] tracking-[3px] font-bold", children: "SONG TITLE *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              value: form.song_title,
              onChange: (e) => setForm({ ...form, song_title: e.target.value }),
              className: "mt-2 w-full px-4 py-3 rounded-2xl bg-[#05070D] border border-[#1a2942] text-[#F8FAFC] focus:border-[#00B7FF] outline-none text-base",
              placeholder: "e.g. Rising Dreams"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[#00B7FF] text-[11px] tracking-[3px] font-bold", children: "ARTIST NAME *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              value: form.artist_name,
              onChange: (e) => setForm({ ...form, artist_name: e.target.value }),
              className: "mt-2 w-full px-4 py-3 rounded-2xl bg-[#05070D] border border-[#1a2942] text-[#F8FAFC] focus:border-[#00B7FF] outline-none text-base"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[#00B7FF] text-[11px] tracking-[3px] font-bold", children: "COVER ART (OPTIONAL)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "mt-2 flex items-center gap-3 p-3 rounded-2xl border border-[#1a2942] bg-[#05070D]/40 cursor-pointer hover:border-[#00B7FF]/60 transition", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*", className: "hidden", onChange: (e) => setCoverFile(e.target.files?.[0] || null) }),
          coverFile ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: URL.createObjectURL(coverFile), className: "w-12 h-12 rounded-xl object-cover border border-[#1a2942] shrink-0", alt: "" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-xl bg-[#0B1426] border border-[#1a2942] flex items-center justify-center text-[#94A3B8] shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { size: 20 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-w-0 text-[#94A3B8] text-sm truncate", children: coverFile ? coverFile.name : "Upload cover art" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[#00B7FF] text-[11px] tracking-[3px] font-bold", children: "GENRE" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: form.genre,
              onChange: (e) => setForm({ ...form, genre: e.target.value }),
              className: "mt-2 w-full px-4 py-3 rounded-2xl bg-[#05070D] border border-[#1a2942] text-[#F8FAFC] focus:border-[#00B7FF] outline-none text-base",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select" }),
                GENRES.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: g, children: g }, g))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[#00B7FF] text-[11px] tracking-[3px] font-bold", children: "MOOD / VIBE" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: form.mood,
              onChange: (e) => setForm({ ...form, mood: e.target.value }),
              className: "mt-2 w-full px-4 py-3 rounded-2xl bg-[#05070D] border border-[#1a2942] text-[#F8FAFC] focus:border-[#00B7FF] outline-none text-base",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select" }),
                MOODS.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: m, children: m }, m))
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[#00B7FF] text-[11px] tracking-[3px] font-bold", children: "NOTES TO REVIEWER (OPTIONAL)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            value: form.note,
            onChange: (e) => setForm({ ...form, note: e.target.value }),
            rows: 3,
            className: "mt-2 w-full px-4 py-3 rounded-2xl bg-[#05070D] border border-[#1a2942] text-[#F8FAFC] focus:border-[#00B7FF] outline-none resize-none text-base",
            placeholder: "Tell Trey what to listen for..."
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between p-3 rounded-2xl border border-[#1a2942] bg-[#05070D]/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#F8FAFC] font-semibold text-sm", children: "Explicit content" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#94A3B8] text-xs", children: "Mark if song contains explicit language" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: form.explicit, onChange: (e) => setForm({ ...form, explicit: e.target.checked }), className: "w-5 h-5 accent-[#00B7FF]" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-3 p-3 rounded-2xl border border-[#1a2942] cursor-pointer hover:bg-[#05070D]/40 transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: form.rights, onChange: (e) => setForm({ ...form, rights: e.target.checked }), className: "mt-1 w-4 h-4 accent-[#00B7FF] shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#94A3B8] text-xs leading-relaxed", children: "I confirm I own or have rights to submit this song for review. *" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-3 p-3 rounded-2xl border border-[#1a2942] cursor-pointer hover:bg-[#05070D]/40 transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: form.terms, onChange: (e) => setForm({ ...form, terms: e.target.checked }), className: "mt-1 w-4 h-4 accent-[#00B7FF] shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#94A3B8] text-xs leading-relaxed", children: "I agree to the Trey TV Live Review terms. *" })
      ] }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-3 md:p-4 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { size: 16, className: "mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: error })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: submit,
          disabled: stage !== "idle",
          className: "w-full py-4 rounded-2xl bg-gradient-to-r from-[#FFC857] to-[#FFB000] text-[#05070D] font-black tracking-wider shadow-[0_0_25px_-5px_rgba(255,200,87,0.7)] disabled:opacity-60 flex items-center justify-center gap-2 text-base hover:shadow-[0_0_35px_-5px_rgba(255,200,87,0.9)] transition",
          children: [
            stage === "uploading" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin", size: 18 }),
              " UPLOADING..."
            ] }),
            stage === "analyzing" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "animate-pulse", size: 18 }),
              " RUNNING AI PRE-CHECK..."
            ] }),
            stage === "idle" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              "RUN AI PRE-CHECK ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 18 })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-[#64748B] text-center", children: "AI pre-check is a quality estimate. Trey's live review is the official score." })
    ] })
  ] });
};
const PreCheckView = ({ precheck, songTitle, artistName, coverUrl, onSubmitToTrey, onRevise }) => {
  const cats = [
    { label: "Vocal Performance", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { size: 16 }), value: precheck.categories.vocal_performance, color: "#00B7FF" },
    { label: "Songwriting", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PenTool, { size: 16 }), value: precheck.categories.songwriting, color: "#00B7FF" },
    { label: "Mix Quality", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(SlidersVertical, { size: 16 }), value: precheck.categories.mix_quality, color: "#00B7FF" },
    { label: "Originality", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { size: 16 }), value: precheck.categories.originality, color: "#00B7FF" },
    { label: "Hit Potential", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 16 }), value: precheck.categories.hit_potential, color: "#00B7FF" },
    { label: "Replay Value", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCw, { size: 16 }), value: precheck.categories.replay_value, color: "#00B7FF" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pt-4 pb-32 max-w-3xl mx-auto space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-[#1a2942] bg-gradient-to-r from-[#0B1426] to-[#08111F] p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#00B7FF] text-[10px] tracking-[3px] font-bold mb-3", children: "NOW PLAYING" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        coverUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: coverUrl, alt: "", className: "w-20 h-20 rounded-2xl object-cover border border-[#FFC857]/40" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00B7FF]/20 to-[#A855F7]/20 border border-[#1a2942] flex items-center justify-center text-3xl text-[#00B7FF]", children: "♪" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#F8FAFC] font-black text-xl truncate", children: songTitle }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#94A3B8] truncate", children: artistName })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Waveform, { playing: true, bars: 20, height: 40, className: "w-28 hidden sm:flex" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-[#00B7FF]/40 bg-[#0B1426]/80 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-2xl bg-[#00B7FF]/10 border border-[#00B7FF]/40 flex items-center justify-center text-[#00B7FF] shadow-[0_0_20px_-5px_rgba(0,183,255,0.5)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { size: 22 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#F8FAFC] font-black text-xl", children: "AI PRE-CHECK" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#94A3B8] text-xs", children: "Honest feedback before you go live. Improve your chances." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#94A3B8] tracking-wider", children: "POWERED BY" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#00B7FF] font-bold tracking-wider", children: "TREY AI" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 grid grid-cols-1 md:grid-cols-2 gap-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#00B7FF] text-xs tracking-[3px] font-bold mb-3", children: "SCORE BREAKDOWN" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: cats.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[#F8FAFC] text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-6 h-6 rounded-lg bg-[#101827] border border-[#1a2942] flex items-center justify-center", style: { color: c.color }, children: c.icon }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: c.label })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[#F8FAFC] text-sm font-bold", children: [
                c.value,
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#94A3B8] text-xs", children: "/ 100" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 rounded-full bg-[#101827] overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full transition-all", style: { width: `${c.value}%`, background: "linear-gradient(90deg,#00B7FF,#A855F7)", boxShadow: `0 0 8px ${c.color}80` } }) })
          ] }, c.label)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-44 h-44 flex items-center justify-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full", style: { background: "conic-gradient(#FFC857 0%, #FFB000 " + precheck.total_score + "%, #101827 " + precheck.total_score + "% 100%)", filter: "blur(0px)", mask: "radial-gradient(circle, transparent 60%, black 62%)", WebkitMask: "radial-gradient(circle, transparent 60%, black 62%)" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center relative z-10", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#94A3B8] text-[10px] tracking-[3px] font-bold", children: "TOTAL SCORE" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-6xl font-black text-[#FFC857]", style: { textShadow: "0 0 25px rgba(255,200,87,0.6)" }, children: precheck.total_score }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#94A3B8] text-xs", children: "/100" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 w-full", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#00B7FF] text-xs font-bold tracking-wider", children: "CONFIDENCE LEVEL" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-sm font-bold ${precheck.confidence_level === "High" ? "text-[#22C55E]" : precheck.confidence_level === "Medium" ? "text-[#FFC857]" : "text-[#94A3B8]"}`, children: precheck.confidence_level }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-2 rounded-full bg-[#101827] overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-[#22C55E]", style: { width: `${precheck.confidence_pct}%` } }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[#94A3B8] text-xs", children: [
                precheck.confidence_pct,
                "%"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 w-full rounded-2xl bg-[#05070D]/60 border border-[#1a2942] p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#00B7FF] text-[11px] tracking-[2px] font-bold mb-1", children: "AI HONEST FEEDBACK" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#F8FAFC] text-sm leading-relaxed", children: precheck.summary })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-[#22C55E]/30 bg-[#22C55E]/5 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#22C55E] text-xs font-bold tracking-wider mb-2", children: "STRENGTHS" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1.5", children: precheck.strengths.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "text-[#F8FAFC] text-sm flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#22C55E]", children: "•" }),
          " ",
          s
        ] }, i)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-[#FFC857]/30 bg-[#FFC857]/5 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#FFC857] text-xs font-bold tracking-wider mb-2", children: "IMPROVEMENTS" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1.5", children: precheck.improvements.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "text-[#F8FAFC] text-sm flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#FFC857]", children: "•" }),
          " ",
          s
        ] }, i)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-[#22C55E]/40 bg-gradient-to-r from-[#22C55E]/10 to-transparent p-4 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { size: 22, className: "text-[#22C55E]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#00B7FF] text-xs tracking-wider font-bold", children: "RECOMMENDATION" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#22C55E] font-black text-lg", children: precheck.recommendation })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: onSubmitToTrey,
          className: "flex items-center justify-center gap-3 px-5 py-4 rounded-2xl bg-gradient-to-r from-[#FFC857] to-[#FFB000] text-[#05070D] font-black tracking-wider shadow-[0_0_30px_-5px_rgba(255,200,87,0.7)]",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 20 }),
            " SUBMIT TO TREY"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: onRevise,
          className: "flex items-center justify-center gap-3 px-5 py-4 rounded-2xl border border-[#1a2942] text-[#F8FAFC] font-bold hover:border-[#00B7FF]/60",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PenLine, { size: 18 }),
            " REVISE FIRST"
          ]
        }
      )
    ] })
  ] });
};
const tierBadge = (tier, paid) => {
  if (!paid || !tier) return null;
  const map = {
    quick: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 12 }), color: "#FFC857", label: "QUICK" },
    hot: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { size: 12 }), color: "#A855F7", label: "HOT" },
    front: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Gem, { size: 12 }), color: "#00B7FF", label: "FRONT" }
  };
  const m = map[tier];
  if (!m) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 py-0.5 rounded-lg text-[9px] font-bold flex items-center gap-1", style: { background: `${m.color}20`, color: m.color, border: `1px solid ${m.color}40` }, children: [
    m.icon,
    " ",
    m.label
  ] });
};
const Queue = ({ onLive, highlightUserId }) => {
  const [items, setItems] = reactExports.useState([]);
  const [nowPlaying, setNowPlaying2] = reactExports.useState(null);
  const load = async () => {
    const { data: np } = await supabase.from("music_review_submissions").select("*").eq("status", "now_playing").limit(1).maybeSingle();
    setNowPlaying2(np);
    const { data } = await supabase.from("music_review_submissions").select("*").in("status", ["in_queue", "ai_prechecked", "under_review"]).order("queue_position", { ascending: true, nullsFirst: false }).limit(50);
    setItems(data || []);
  };
  reactExports.useEffect(() => {
    load();
    const ch = supabase.channel("queue-public").on("postgres_changes", { event: "*", schema: "public", table: "music_review_submissions" }, () => load()).subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pt-4 pb-32 max-w-3xl mx-auto space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#FFC857] text-[10px] tracking-[4px] font-bold", children: "— LIVE QUEUE —" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-black text-[#F8FAFC] mt-1", children: "Up Next & Estimated Wait" })
    ] }),
    nowPlaying && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onLive, className: "w-full text-left rounded-3xl border-2 border-[#FFC857]/60 bg-gradient-to-r from-[#FFC857]/10 to-transparent p-4 shadow-[0_0_25px_-8px_rgba(255,200,87,0.6)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-2xl bg-[#0B1426] border border-[#FFC857]/40 flex items-center justify-center text-[#FFC857]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { size: 22 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#FFC857] text-[10px] tracking-[3px] font-bold", children: "NOW PLAYING — LIVE REVIEW" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#F8FAFC] font-bold text-lg truncate", children: nowPlaying.song_title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#00B7FF] text-xs truncate", children: nowPlaying.artist_name })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-[#EF4444] text-[10px] font-bold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" }),
        " LIVE"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      items.map((s, i) => {
        const isMe = highlightUserId && s.user_id === highlightUserId;
        const cover = getPublicUrl("music-review-cover-art", s.cover_art_storage_path);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-3 rounded-2xl border bg-[#0B1426]/80 p-3 ${isMe ? "border-[#00B7FF] shadow-[0_0_20px_-5px_rgba(0,183,255,0.6)]" : "border-[#1a2942]"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-7 h-7 rounded-full bg-[#101827] border border-[#1a2942] flex items-center justify-center text-[#00B7FF] text-xs font-bold", children: i + 2 }),
          cover ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: cover, alt: "", className: "w-12 h-12 rounded-xl object-cover border border-[#1a2942]" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-xl bg-[#101827] border border-[#1a2942] flex items-center justify-center text-[#00B7FF]", children: "♪" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#F8FAFC] font-semibold truncate", children: s.song_title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#94A3B8] text-xs truncate", children: s.artist_name })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            tierBadge(s.priority_tier, !!s.priority_paid),
            isMe && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-[#00B7FF] font-bold", children: "YOU" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-[#94A3B8] text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 10 }),
              " ~",
              Math.max(2, (i + 1) * 4),
              " min"
            ] })
          ] })
        ] }, s.id);
      }),
      items.length === 0 && !nowPlaying && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-10 text-[#94A3B8]", children: "Queue is empty. Submit your song to be first." })
    ] })
  ] });
};
const fmt = (s) => {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
};
const AudioPlayer = ({
  src,
  title,
  artist,
  coverUrl,
  autoPlay = false,
  showWaveform = true,
  onEnded,
  compact = false
}) => {
  const ref = reactExports.useRef(null);
  const [playing, setPlaying] = reactExports.useState(false);
  const [progress, setProgress] = reactExports.useState(0);
  const [duration, setDuration] = reactExports.useState(0);
  const [error, setError] = reactExports.useState(null);
  const [muted, setMuted] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setError(null);
    setProgress(0);
    setPlaying(false);
  }, [src]);
  reactExports.useEffect(() => {
    if (autoPlay && ref.current && src) {
      ref.current.play().then(() => setPlaying(true)).catch(() => {
      });
    }
  }, [autoPlay, src]);
  const toggle = async () => {
    const a = ref.current;
    if (!a || !src) return;
    try {
      if (playing) {
        a.pause();
        setPlaying(false);
      } else {
        await a.play();
        setPlaying(true);
      }
    } catch (e) {
      setError("Playback blocked. Tap play again.");
    }
  };
  const retry = () => {
    setError(null);
    if (ref.current) ref.current.load();
  };
  const seek = (e) => {
    if (!ref.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct2 = (e.clientX - rect.left) / rect.width;
    ref.current.currentTime = pct2 * duration;
  };
  const pct = duration ? progress / duration * 100 : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative rounded-3xl border border-[#1a2942] bg-gradient-to-b from-[#0B1426] to-[#08111F] ${compact ? "p-3" : "p-4 md:p-5"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "audio",
      {
        ref,
        src,
        preload: "metadata",
        onLoadedMetadata: (e) => setDuration(e.target.duration || 0),
        onTimeUpdate: (e) => setProgress(e.target.currentTime || 0),
        onEnded: () => {
          setPlaying(false);
          setProgress(0);
          onEnded?.();
        },
        onError: () => setError("Audio failed to load")
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 md:gap-4", children: [
      coverUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: coverUrl,
          alt: "",
          className: `${compact ? "w-14 h-14" : "w-20 h-20 md:w-24 md:h-24"} rounded-2xl object-cover border border-[#FFC857]/40 shadow-[0_0_20px_-5px_rgba(255,200,87,0.4)]`
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `${compact ? "w-14 h-14" : "w-20 h-20 md:w-24 md:h-24"} rounded-2xl bg-gradient-to-br from-[#00B7FF]/20 to-[#A855F7]/20 border border-[#1a2942] flex items-center justify-center`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#00B7FF] text-2xl", children: "♪" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        title && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-[#F8FAFC] truncate text-base md:text-lg", children: title }),
        artist && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#00B7FF] text-sm truncate", children: artist }),
        showWaveform && !compact && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Waveform, { playing, bars: 40, height: 36 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: toggle,
          disabled: !src,
          className: "w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#0B1426] border-2 border-[#00B7FF] flex items-center justify-center text-[#00B7FF] shadow-[0_0_25px_-3px_rgba(0,183,255,0.7)] hover:scale-105 active:scale-95 transition disabled:opacity-30",
          "aria-label": playing ? "Pause" : "Play",
          children: playing ? /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { size: 24 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 24, className: "ml-0.5" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-[#94A3B8] tabular-nums w-10", children: fmt(progress) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          onClick: seek,
          className: "flex-1 h-1.5 rounded-full bg-[#101827] cursor-pointer relative overflow-hidden",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "h-full rounded-full transition-all",
              style: {
                width: `${pct}%`,
                background: "linear-gradient(90deg,#FFC857,#FFB000)",
                boxShadow: "0 0 10px rgba(255,200,87,0.6)"
              }
            }
          )
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-[#94A3B8] tabular-nums w-10 text-right", children: fmt(duration) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            setMuted(!muted);
            if (ref.current) ref.current.muted = !muted;
          },
          className: "text-[#94A3B8] hover:text-[#00B7FF] transition",
          "aria-label": "Mute",
          children: muted ? /* @__PURE__ */ jsxRuntimeExports.jsx(VolumeX, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Volume2, { size: 16 })
        }
      )
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center gap-2 text-sm text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl px-3 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 14 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: retry, className: "flex items-center gap-1 text-[#00B7FF] hover:underline", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCw, { size: 12 }),
        " Retry"
      ] })
    ] })
  ] });
};
const ChatPanel = ({ roomType, refId }) => {
  const { user } = useTreyAuth();
  const [comments, setComments] = reactExports.useState([]);
  const [reactions, setReactions] = reactExports.useState({ like: 0, fire: 0, replay: 0 });
  const [body, setBody] = reactExports.useState("");
  const endRef = reactExports.useRef(null);
  const filterCol = roomType === "live" ? "submission_id" : "open_mic_item_id";
  const load = reactExports.useCallback(async () => {
    if (!refId) {
      setComments([]);
      setReactions({ like: 0, fire: 0, replay: 0 });
      return;
    }
    const { data } = await supabase.from("music_review_comments").select("*").eq("room_type", roomType).eq(filterCol, refId).eq("is_hidden", false).order("created_at", { ascending: true }).limit(200);
    setComments(data || []);
    const { data: r } = await supabase.from("music_review_reactions").select("reaction_type").eq("room_type", roomType).eq(filterCol, refId);
    const counts = { like: 0, fire: 0, replay: 0 };
    (r || []).forEach((x) => {
      if (x.reaction_type === "like") counts.like++;
      else if (x.reaction_type === "fire") counts.fire++;
      else if (x.reaction_type === "replay") counts.replay++;
    });
    setReactions(counts);
  }, [filterCol, refId, roomType]);
  reactExports.useEffect(() => {
    load();
    if (!refId) return;
    const ch = supabase.channel(`chat-${roomType}-${refId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "music_review_comments" }, () => load()).on("postgres_changes", { event: "INSERT", schema: "public", table: "music_review_reactions" }, () => load()).subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [load, roomType, refId]);
  reactExports.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments.length]);
  const send = async () => {
    if (!user || !body.trim() || !refId) return;
    await supabase.from("music_review_comments").insert({
      room_type: roomType,
      [filterCol]: refId,
      user_id: user.id,
      user_name: user.name,
      body: body.trim(),
      is_admin: user.isAdmin
    });
    setBody("");
  };
  const react = async (type) => {
    if (!user || !refId) return;
    await supabase.from("music_review_reactions").insert({
      room_type: roomType,
      [filterCol]: refId,
      user_id: user.id,
      reaction_type: type
    });
  };
  const aiSpark = async () => {
    if (!user?.isAdmin || !refId) return;
    const lines = [
      "Trey-I noticed strong hook replay value.",
      "Trey-I detected mix clarity issues around the vocal.",
      "Trey-I thinks the chorus is the strongest section.",
      "Trey-I suggests tightening the intro before final release."
    ];
    await supabase.from("music_review_comments").insert({
      room_type: roomType,
      [filterCol]: refId,
      user_id: null,
      user_name: "Trey-I",
      body: lines[Math.floor(Math.random() * lines.length)],
      is_ai_labeled: true
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-[#1a2942] bg-[#0B1426]/80 p-4 flex flex-col h-[520px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#F8FAFC] font-bold tracking-wide", children: "LISTENING ROOM" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-[#00B7FF] text-[10px] font-bold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-[#00B7FF] animate-pulse" }),
          " LIVE CHAT"
        ] })
      ] }),
      user?.isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: aiSpark, className: "flex items-center gap-1 text-[10px] text-[#A855F7] border border-[#A855F7]/40 rounded-lg px-2 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 10 }),
        " AI SPARK"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto space-y-2 pr-1", children: [
      comments.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-[#94A3B8] text-sm py-8", children: "Be the first to comment." }),
      comments.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-2xl p-2.5 ${c.is_ai_labeled ? "border border-[#A855F7]/40 bg-[#A855F7]/5" : c.is_admin ? "border border-[#FFC857]/40 bg-[#FFC857]/5" : "bg-[#05070D]/60"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", style: { color: c.is_ai_labeled ? "#A855F7" : c.is_admin ? "#FFC857" : "#00B7FF" }, children: c.user_name || "User" }),
          c.is_admin && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FFC857]/20 text-[#FFC857]", children: "HOST" }),
          c.is_ai_labeled && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#A855F7]/20 text-[#A855F7] flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 8 }),
            " AI"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#64748B] text-[10px] ml-auto", children: new Date(c.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#F8FAFC] text-sm mt-1", children: c.body })
      ] }, c.id)),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: endRef })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          value: body,
          onChange: (e) => setBody(e.target.value),
          onKeyDown: (e) => e.key === "Enter" && send(),
          placeholder: user ? "Say something…" : "Sign in to comment",
          disabled: !user,
          className: "flex-1 px-3 py-2 rounded-xl bg-[#05070D] border border-[#1a2942] text-[#F8FAFC] text-sm outline-none focus:border-[#00B7FF] disabled:opacity-50"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: send, disabled: !user || !body.trim(), className: "w-9 h-9 rounded-xl bg-[#00B7FF] text-[#05070D] flex items-center justify-center disabled:opacity-30", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { size: 14 }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => react("like"), disabled: !user, className: "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1a2942] text-[#F8FAFC] text-xs disabled:opacity-40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { size: 14, className: "text-[#EF4444]" }),
        " ",
        reactions.like
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => react("fire"), disabled: !user, className: "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1a2942] text-[#F8FAFC] text-xs disabled:opacity-40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { size: 14, className: "text-[#FFB000]" }),
        " ",
        reactions.fire
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => react("replay"), disabled: !user, className: "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1a2942] text-[#F8FAFC] text-xs disabled:opacity-40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 14, className: "text-[#00B7FF]" }),
        " ",
        reactions.replay
      ] })
    ] })
  ] });
};
const LiveRoom = () => {
  const [np, setNp] = reactExports.useState(null);
  const [queue, setQueue] = reactExports.useState([]);
  const [energy, setEnergy] = reactExports.useState(60);
  const load = async () => {
    const { data: n } = await supabase.from("music_review_submissions").select("*").eq("status", "now_playing").limit(1).maybeSingle();
    setNp(n);
    const { data: q } = await supabase.from("music_review_submissions").select("*").in("status", ["in_queue", "ai_prechecked"]).order("queue_position", { ascending: true, nullsFirst: false }).limit(8);
    setQueue(q || []);
  };
  reactExports.useEffect(() => {
    load();
    const ch = supabase.channel("live-room").on("postgres_changes", { event: "*", schema: "public", table: "music_review_submissions" }, () => load()).on("postgres_changes", { event: "INSERT", schema: "public", table: "music_review_comments" }, () => setEnergy((e) => Math.min(100, e + 4))).on("postgres_changes", { event: "INSERT", schema: "public", table: "music_review_reactions" }, () => setEnergy((e) => Math.min(100, e + 6))).subscribe();
    const decay = setInterval(() => setEnergy((e) => Math.max(20, e - 1)), 3e3);
    return () => {
      supabase.removeChannel(ch);
      clearInterval(decay);
    };
  }, []);
  const cover = getPublicUrl("music-review-cover-art", np?.cover_art_storage_path);
  const audio = useSignedAudioUrl("music-review-audio", np?.audio_storage_path);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pt-4 pb-32 max-w-6xl mx-auto space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 rounded-2xl border border-[#22C55E]/40 bg-[#22C55E]/5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { size: 14, className: "text-[#22C55E]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#22C55E] text-[10px] font-bold tracking-wider", children: "ROOM ENERGY" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-1.5 rounded-full bg-[#101827] overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-gradient-to-r from-[#22C55E] to-[#FFC857] transition-all", style: { width: `${energy}%` } }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#FFC857] text-[10px] tracking-[3px] font-bold", children: "— LIVE REVIEW —" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        np ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-[#FFC857]/40 bg-gradient-to-br from-[#0B1426] to-[#08111F] p-4 shadow-[0_0_40px_-15px_rgba(255,200,87,0.5)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-[#EF4444] text-[10px] font-bold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" }),
              " LIVE"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#FFC857] text-[10px] font-bold tracking-wider", children: "REVIEWING LIVE" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AudioPlayer, { src: audio, title: np.song_title, artist: np.artist_name, coverUrl: cover })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-[#1a2942] bg-[#0B1426] p-10 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#94A3B8]", children: "No live review in progress." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#64748B] text-xs mt-1", children: "Check back when Trey goes live." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-[#1a2942] bg-[#0B1426]/80 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#F8FAFC] font-bold tracking-wide mb-2", children: "UP NEXT" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            queue.slice(0, 5).map((q, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-2 rounded-2xl border border-[#1a2942] bg-[#05070D]/40", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded-full bg-[#101827] text-[#00B7FF] flex items-center justify-center text-xs font-bold", children: i + 1 }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#F8FAFC] text-sm font-semibold truncate", children: q.song_title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#94A3B8] text-xs truncate", children: q.artist_name })
              ] })
            ] }, q.id)),
            queue.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#94A3B8] text-sm text-center py-4", children: "Queue is empty." })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChatPanel, { roomType: "live", refId: np?.id || null })
    ] })
  ] });
};
async function rebuildReviewQueue() {
  try {
    const { error: error2 } = await supabase.rpc("rebuild_music_review_queue");
    if (!error2) return;
  } catch {
  }
  {
    console.warn("[Trey TV Music Review] Queue RPC missing. Direct client queue rebuild is disabled in production.");
    return;
  }
}
async function setNowPlaying(submissionId) {
  try {
    const { error } = await supabase.rpc("set_music_review_now_playing", { p_submission_id: submissionId });
    if (!error) return;
  } catch {
  }
  {
    console.warn("[Trey TV Music Review] set_music_review_now_playing RPC missing. Direct client mutation disabled in production.");
    return;
  }
}
const TIERS = [
  { id: "quick", label: "QUICK PASS", price: 5, sub1: "Move up the queue.", sub2: "Faster review placement.", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 26 }), color: "#FFC857", badge: "POPULAR" },
  { id: "hot", label: "HOT SEAT", price: 10, sub1: "Jump ahead in the queue.", sub2: "High-priority review.", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { size: 26 }), color: "#A855F7", badge: "" },
  { id: "front", label: "FRONT OF LINE", price: 15, sub1: "Near-immediate review.", sub2: "Get to the front.", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Gem, { size: 26 }), color: "#00B7FF", badge: "BEST VALUE" }
];
const SkipTheLine = ({ submissionId, onDone, onSkip }) => {
  const { user } = useTreyAuth();
  const [tier, setTier] = reactExports.useState("quick");
  const [loading, setLoading] = reactExports.useState(false);
  const [confirmed, setConfirmed] = reactExports.useState(false);
  const payWithCashApp = async () => {
    if (!user || !submissionId) return;
    setLoading(true);
    const t = TIERS.find((x) => x.id === tier);
    const ref = "CA-" + Math.random().toString(36).slice(2, 10).toUpperCase();
    await supabase.from("music_review_payments").insert({
      user_id: user.id,
      submission_id: submissionId,
      provider: "cashapp",
      tier: t.id,
      amount: t.price,
      currency: "USD",
      status: "pending",
      provider_reference: ref,
      confirmed_by_admin: false
    });
    const cashtag = (window.__TREY_CASHTAG__ || musicReviewEnv.cashAppCashtag || "").replace(/^\$/, "");
    if (cashtag) {
      window.open(`https://cash.app/$${cashtag}/${t.price}?note=${encodeURIComponent("TreyTV Live Review " + ref)}`, "_blank");
    }
    await supabase.from("music_review_submissions").update({
      priority_tier: t.id,
      priority_paid: false,
      // ONLY admin can flip to true after confirming
      payment_reference: ref,
      status: "in_queue"
    }).eq("id", submissionId);
    await rebuildReviewQueue();
    setLoading(false);
    setConfirmed(true);
  };
  const skipForStandard = async () => {
    if (!submissionId) {
      onSkip();
      return;
    }
    await supabase.from("music_review_submissions").update({ status: "in_queue" }).eq("id", submissionId);
    await rebuildReviewQueue();
    onSkip();
  };
  if (confirmed) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 pt-8 pb-32 max-w-md mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-[#22C55E]/40 bg-[#0B1426] p-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 mx-auto rounded-full bg-[#22C55E]/20 border border-[#22C55E]/40 flex items-center justify-center text-[#22C55E]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { size: 28 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#22C55E] text-xs tracking-[3px] font-bold mt-3", children: "PAYMENT INITIATED" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-black text-[#F8FAFC] mt-1", children: "Cash App Payment Started" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#94A3B8] text-sm mt-2 leading-relaxed", children: "Complete payment by scanning the QR code or using the Cash App link if configured. Priority placement is applied once admin confirms receipt." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onDone, className: "w-full mt-5 py-3 rounded-2xl bg-gradient-to-r from-[#FFC857] to-[#FFB000] text-[#05070D] font-black tracking-wider", children: "VIEW QUEUE" })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pt-4 pb-32 max-w-2xl mx-auto space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-3xl border border-[#1a2942] bg-gradient-to-br from-[#0B1426] via-[#0a1830] to-[#08111F] p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-4xl font-black leading-none", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#FFC857]", children: "SKIP" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#F8FAFC]", children: "THE LINE" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#94A3B8] mt-2 text-sm max-w-xs", children: "Get heard faster. More exposure. Bigger impact." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 18, className: "text-[#FFC857]" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#94A3B8] text-xs", children: "Priority placement in the live review queue." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-full bg-[#00B7FF]/10 border border-[#00B7FF]/40 flex items-center justify-center text-[#00B7FF]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 20 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Waveform, { playing: true, bars: 36, height: 36, className: "mt-4 opacity-60" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-[#00B7FF] text-[11px] tracking-[5px] font-bold", children: "• CHOOSE YOUR PRIORITY •" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: TIERS.map((t) => {
      const selected = tier === t.id;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setTier(t.id),
          className: `w-full text-left rounded-3xl border ${selected ? "border-2" : ""} bg-[#0B1426]/80 p-4 flex items-center gap-4 transition`,
          style: { borderColor: selected ? t.color : "#1a2942", boxShadow: selected ? `0 0 30px -10px ${t.color}` : "none" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-2xl flex items-center justify-center border", style: { background: `${t.color}15`, borderColor: `${t.color}50`, color: t.color }, children: t.icon }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-3xl font-black", style: { color: t.color }, children: [
                  "$",
                  t.price
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#F8FAFC] font-bold text-lg", children: t.label }),
                t.badge && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded-lg text-[10px] font-bold tracking-wider", style: { background: `${t.color}20`, color: t.color, border: `1px solid ${t.color}40` }, children: t.badge })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[#94A3B8] text-xs mt-1", children: [
                t.sub1,
                " ",
                t.sub2
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-6 h-6 rounded-full border-2 flex items-center justify-center ${selected ? "" : "border-[#94A3B8]"}`, style: { borderColor: selected ? t.color : void 0 }, children: selected && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3 h-3 rounded-full", style: { background: t.color } }) })
          ]
        },
        t.id
      );
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-[#00B7FF] text-[11px] tracking-[5px] font-bold pt-2", children: "• PAY WITH •" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-[#22C55E]/35 bg-[#06140D]/70 p-4 grid grid-cols-[112px_1fr] gap-4 items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl bg-white p-2 shadow-[0_0_25px_-6px_rgba(34,197,94,0.75)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: musicReviewEnv.cashAppQrPath, alt: "Cash App QR code for Trey TV Live Review priority payment", className: "w-24 h-24 object-contain rounded-xl" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#22C55E] text-xs font-black tracking-[3px]", children: "CASH APP QR" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#F8FAFC] font-bold mt-1", children: "Scan to pay the selected tier" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#94A3B8] text-xs mt-1 leading-relaxed", children: "After payment, admin confirms the receipt before priority placement is applied." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: payWithCashApp,
        disabled: loading || !submissionId,
        className: "w-full flex items-center gap-4 rounded-3xl border-2 border-[#22C55E] bg-[#22C55E]/5 p-4 shadow-[0_0_30px_-8px_rgba(34,197,94,0.6)] disabled:opacity-50",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-2xl bg-[#22C55E] flex items-center justify-center text-white font-black text-2xl", children: "$" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 text-left", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#22C55E] font-black tracking-wider", children: "PAY WITH CASH APP" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#94A3B8] text-xs", children: "Complete your payment and skip the line." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-[#94A3B8] text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 12 }),
            " Secure"
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-[#1a2942] bg-[#0B1426]/40 p-3 flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-full bg-[#00B7FF]/10 border border-[#00B7FF]/40 flex items-center justify-center text-[#00B7FF] flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { size: 14 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-[#94A3B8] leading-relaxed", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#F8FAFC] font-semibold mb-0.5", children: "Optional Priority Placement" }),
        "Skip The Line is optional and helps you get heard faster. All reviews are still real, unbiased, and based on quality."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: skipForStandard, className: "w-full py-3 rounded-2xl border border-[#1a2942] text-[#94A3B8] hover:border-[#00B7FF]/60 text-sm", children: [
      "No thanks, join the standard queue ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 14, className: "inline" })
    ] })
  ] });
};
const cat = (label, value, icon, color) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-[#1a2942] bg-[#0B1426] p-3 text-center", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto w-9 h-9 rounded-xl flex items-center justify-center", style: { background: `${color}15`, color }, children: icon }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#94A3B8] text-[10px] tracking-wider mt-2", children: label.toUpperCase() }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-black mt-0.5", style: { color }, children: value }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#64748B] text-[10px]", children: "/100" })
] });
const Results = ({ reviewId, onProfile }) => {
  const [r, setR] = reactExports.useState(null);
  reactExports.useEffect(() => {
    (async () => {
      const { data } = await supabase.from("music_review_scores").select("*").eq("id", reviewId).maybeSingle();
      setR(data);
    })();
  }, [reviewId]);
  if (!r) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-[#94A3B8] py-20", children: "Loading review…" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pt-4 pb-32 max-w-3xl mx-auto space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-3xl border border-[#1a2942] bg-gradient-to-br from-[#0B1426] via-[#0a1830] to-[#08111F] p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-0 bottom-0 opacity-20 pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Waveform, { playing: true, bars: 40, height: 120 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#FFC857] text-[11px] tracking-[5px] font-bold", children: "R E V I E W   C O M P L E T E" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-5xl md:text-6xl font-black text-[#F8FAFC] mt-1 leading-none", children: "GREAT WORK!" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[#94A3B8] mt-3 max-w-md text-sm", children: [
          "Your music was heard. Your talent stood out.",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          "Here's your Live Review results."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl border border-[#1a2942] bg-[#0B1426] p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#FFC857] text-[11px] tracking-[3px] font-bold", children: "REVIEWED SONG" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black text-[#F8FAFC] mt-1", children: r.song_title }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[#00B7FF] flex items-center gap-1 mt-0.5", children: [
          r.artist_name,
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 14 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 inline-block px-3 py-1.5 rounded-2xl border border-[#1a2942] text-[#94A3B8] text-[10px] tracking-wider", children: [
          "REVIEW DATE: ",
          new Date(r.created_at).toLocaleDateString().toUpperCase()
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center md:text-right md:border-l md:border-[#1a2942] md:pl-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#94A3B8] text-[10px] tracking-[3px] font-bold", children: "OVERALL SCORE" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-7xl font-black leading-none", style: { background: "linear-gradient(135deg,#00B7FF,#A855F7)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }, children: r.overall_score }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#94A3B8] text-[10px] tracking-[2px]", children: "OUT OF 100" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#FFC857] text-lg mt-1", children: "★ ★ ★ ★ ★" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-[#00B7FF] text-[11px] tracking-[6px] font-bold pt-2", children: "— A I   S C O R E   B R E A K D O W N —" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 md:grid-cols-6 gap-2", children: [
      cat("Vocals", r.vocals_score, /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { size: 16 }), "#00B7FF"),
      cat("Lyrics", r.lyrics_score, /* @__PURE__ */ jsxRuntimeExports.jsx(PenTool, { size: 16 }), "#A855F7"),
      cat("Mix", r.mix_score, /* @__PURE__ */ jsxRuntimeExports.jsx(SlidersVertical, { size: 16 }), "#FFC857"),
      cat("Originality", r.originality_score, /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { size: 16 }), "#00B7FF"),
      cat("Hit Potential", r.hit_potential_score, /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 16 }), "#A855F7"),
      cat("Marketability", r.marketability_score, /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { size: 16 }), "#FFC857")
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-[#1a2942] bg-[#0B1426] p-5 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#FFC857] text-[11px] tracking-[3px] font-bold", children: "REVIEW SUMMARY" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#F8FAFC] mt-2 leading-relaxed", children: r.written_summary })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:flex w-24 h-24 rounded-full bg-gradient-to-br from-[#A855F7]/30 to-[#00B7FF]/30 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { size: 36, className: "text-[#A855F7]" }) })
    ] }),
    r.strengths_json?.length || r.improvements_json?.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [
      r.strengths_json?.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-[#22C55E]/30 bg-[#22C55E]/5 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#22C55E] text-xs font-bold tracking-wider mb-2", children: "STRENGTHS" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1.5", children: r.strengths_json.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "text-[#F8FAFC] text-sm flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#22C55E]", children: "•" }),
          " ",
          s
        ] }, i)) })
      ] }) : null,
      r.improvements_json?.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-[#FFC857]/30 bg-[#FFC857]/5 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#FFC857] text-xs font-bold tracking-wider mb-2", children: "IMPROVEMENTS" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1.5", children: r.improvements_json.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "text-[#F8FAFC] text-sm flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#FFC857]", children: "•" }),
          " ",
          s
        ] }, i)) })
      ] }) : null
    ] }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-[#00B7FF] bg-[#0B1426] p-4 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-[#00B7FF] text-[#05070D] flex items-center justify-center font-black", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#00B7FF] text-[11px] tracking-[2px] font-bold", children: "YOUR SCORE HAS BEEN ADDED TO YOUR PROFILE" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#94A3B8] text-sm", children: "Find it anytime under Music Review Scores." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "text-[#00B7FF]" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onProfile, className: "w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-[#FFC857] text-[#FFC857] font-black tracking-widest", children: [
      "VIEW FULL REVIEW PROFILE ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 18 })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center text-xs text-[#64748B] pt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#FFC857] italic text-lg", children: "Trey" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#00B7FF] tracking-wider mt-1", children: "KEEP BUILDING. WE'RE WATCHING." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#94A3B8] mt-1", children: "— TREY TV LIVE REVIEW TEAM" })
    ] })
  ] });
};
const Profile = ({ onSubmit, onResults }) => {
  const { user } = useTreyAuth();
  const [scores, setScores] = reactExports.useState([]);
  reactExports.useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("music_review_scores").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setScores(data || []);
    })();
  }, [user]);
  if (!user) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-[#94A3B8] py-20", children: "Sign in to see your Music Review Scores." });
  }
  const totals = scores.length;
  const avg = totals ? scores.reduce((s, x) => s + x.overall_score, 0) / totals / 20 : 0;
  const cat2 = (k) => totals ? scores.reduce((s, x) => s + (x[k] || 0), 0) / totals / 20 : 0;
  const best = scores.reduce((b, x) => !b || x.overall_score > b.overall_score ? x : b, null);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pt-4 pb-32 max-w-3xl mx-auto space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-[#FFC857]/40 bg-gradient-to-br from-[#0B1426] to-[#08111F] p-4 flex items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-full border-2 border-[#FFC857] bg-[#0B1426] flex items-center justify-center text-[#FFC857] text-2xl font-black", children: user.name.charAt(0).toUpperCase() }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#F8FAFC] font-black text-xl truncate", children: user.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[#00B7FF] text-xs", children: [
          "@",
          user.name.toLowerCase().replace(/\s+/g, "")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mt-2 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#F8FAFC] font-bold", children: totals }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#94A3B8]", children: "REVIEWS" })
          ] }),
          best && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#FFC857] font-bold", children: best.overall_score }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#94A3B8]", children: "BEST" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-[#1a2942] bg-[#0B1426] p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#F8FAFC] font-black tracking-wide", children: "MUSIC REVIEW SCORES" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3 mt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-[#1a2942] bg-[#05070D]/40 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#94A3B8] text-[10px] tracking-[3px] font-bold", children: "AVERAGE REVIEW SCORE" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-6xl font-black text-[#00B7FF] mt-1 leading-none", style: { textShadow: "0 0 20px rgba(0,183,255,0.5)" }, children: avg.toFixed(2) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#FFC857] text-lg mt-1", children: "★ ★ ★ ★ ★" }),
          avg >= 4 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-2 text-[#A855F7] text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 16 }),
            " Elite Artist ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#94A3B8] text-xs", children: "Top 12%" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-[#1a2942] bg-[#05070D]/40 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#94A3B8] text-[10px] tracking-[3px] font-bold", children: "SCORE TREND" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Waveform, { playing: false, bars: 24, height: 80, className: "mt-2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#00B7FF] text-xs mt-1 text-right", children: avg.toFixed(2) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-[#1a2942] bg-[#0B1426] p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#F8FAFC] font-black tracking-wide", children: "CATEGORY AVERAGES" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 space-y-2.5", children: [
        { label: "SONGWRITING", key: "lyrics_score", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PenTool, { size: 14 }), color: "#FFC857" },
        { label: "VOCAL DELIVERY", key: "vocals_score", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { size: 14 }), color: "#00B7FF" },
        { label: "MIX / PRODUCTION", key: "mix_score", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(SlidersVertical, { size: 14 }), color: "#00B7FF" },
        { label: "HIT POTENTIAL", key: "hit_potential_score", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 14 }), color: "#FFC857" }
      ].map((c) => {
        const v = cat2(c.key);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[#F8FAFC]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-6 h-6 rounded-lg border border-[#1a2942] bg-[#101827] flex items-center justify-center", style: { color: c.color }, children: c.icon }),
              c.label
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", style: { color: c.color }, children: v.toFixed(2) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 rounded-full bg-[#101827] overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full", style: { width: `${v / 5 * 100}%`, background: c.color, boxShadow: `0 0 8px ${c.color}80` } }) })
        ] }, c.key);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-[#1a2942] bg-[#0B1426] p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#F8FAFC] font-black tracking-wide", children: "RECENT REVIEWS" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onSubmit, className: "text-[#00B7FF] text-xs font-bold", children: "SUBMIT NEW" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-2", children: [
        scores.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#94A3B8] text-sm py-6 text-center", children: "No reviews yet. Submit your first song." }),
        scores.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => onResults(s.id), className: "w-full flex items-center gap-3 p-2 rounded-2xl border border-[#1a2942] bg-[#05070D]/40 hover:border-[#00B7FF]/60 transition text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl bg-gradient-to-br from-[#00B7FF]/20 to-[#A855F7]/20 border border-[#1a2942] flex items-center justify-center text-[#00B7FF]", children: "♪" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#F8FAFC] font-semibold truncate", children: s.song_title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#94A3B8] text-xs", children: new Date(s.created_at).toLocaleDateString() })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[#FFC857] font-black flex items-center gap-1", children: [
            (s.overall_score / 20).toFixed(1),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { size: 12, fill: "currentColor" })
          ] })
        ] }, s.id))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onSubmit, className: "w-full mt-3 py-2.5 rounded-2xl border border-[#00B7FF]/40 text-[#00B7FF] text-sm font-bold tracking-wider", children: "SUBMIT NEW SONG" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: [
      { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 20 }), label: "VIP PASS", sub: "Lock in your VIP queue spot" },
      { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { size: 20 }), label: "HOT SEAT", sub: "Guaranteed live review" },
      { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Gem, { size: 20 }), label: "FEATURED ARTIST", sub: "Get seen by the community" }
    ].map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-[#A855F7]/30 bg-[#A855F7]/5 p-3 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto w-9 h-9 rounded-xl bg-[#A855F7]/15 border border-[#A855F7]/40 text-[#A855F7] flex items-center justify-center", children: p.icon }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#A855F7] text-[10px] tracking-wider font-bold mt-2", children: p.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#94A3B8] text-[10px] mt-1 leading-tight", children: p.sub })
    ] }, p.label)) })
  ] });
};
const OPEN_MIC_MAX_QUEUE = 10;
const OPEN_MIC_MAX_PER_DAY = 2;
async function getDailyCount(userId) {
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const { data } = await supabase.from("open_mic_daily_limits").select("submission_count").eq("user_id", userId).eq("date", today).maybeSingle();
  return data?.submission_count ?? 0;
}
async function incrementDailyCount(userId) {
  try {
    const { error } = await supabase.rpc("increment_open_mic_daily_count", { p_user_id: userId });
    if (!error) return;
  } catch {
  }
  {
    console.warn("[Trey TV Music Review] increment_open_mic_daily_count RPC missing. Client daily-limit mutation disabled in production.");
    return;
  }
}
async function getActiveQueueCount() {
  const { count } = await supabase.from("open_mic_queue").select("*", { count: "exact", head: true }).in("status", ["queued", "playing"]);
  return count ?? 0;
}
async function finalizeOpenMicItem(itemId) {
  try {
    const { data, error } = await supabase.rpc("finalize_open_mic_item", { p_item_id: itemId });
    if (!error) return { ok: true, cleanup_failed: Boolean(data?.cleanup_failed) };
  } catch {
  }
  {
    console.warn("[Trey TV Music Review] finalize_open_mic_item RPC missing. Client cleanup fallback disabled in production.");
    return { ok: false, error: "server_finalize_missing" };
  }
}
async function retryOpenMicCleanup(itemId) {
  const { data: item } = await supabase.from("open_mic_queue").select("audio_storage_path").eq("id", itemId).maybeSingle();
  if (!item?.audio_storage_path) return { ok: true };
  const { error } = await supabase.storage.from("open-mic-temp-audio").remove([item.audio_storage_path]);
  if (error) return { ok: false, error: error.message };
  await supabase.from("open_mic_queue").update({
    cleanup_failed: false,
    storage_deleted: true,
    audio_storage_path: null,
    file_deleted_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", itemId);
  return { ok: true };
}
const OpenMic = () => {
  const { user } = useTreyAuth();
  const [queue, setQueue] = reactExports.useState([]);
  const [playing, setPlaying] = reactExports.useState(null);
  const [dailyCount, setDailyCount] = reactExports.useState(0);
  const [error, setError] = reactExports.useState(null);
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [title, setTitle] = reactExports.useState("");
  const [file, setFile] = reactExports.useState(null);
  const finalizingRef = reactExports.useRef(/* @__PURE__ */ new Set());
  const load = reactExports.useCallback(async () => {
    const { data } = await supabase.from("open_mic_queue").select("*").in("status", ["queued", "playing"]).order("submitted_at", { ascending: true }).limit(20);
    setQueue(data || []);
    const cur = (data || []).find((x) => x.status === "playing") || null;
    setPlaying(cur);
    if (user) setDailyCount(await getDailyCount(user.id));
  }, [user]);
  reactExports.useEffect(() => {
    load();
    const ch = supabase.channel("open-mic").on("postgres_changes", { event: "*", schema: "public", table: "open_mic_queue" }, () => load()).subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [load]);
  reactExports.useEffect(() => {
    (async () => {
      if (playing) return;
      const next = queue.find((q) => q.status === "queued");
      if (!next) return;
      await supabase.from("open_mic_queue").update({
        status: "playing",
        started_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", next.id);
    })();
  }, [queue, playing]);
  const onEnded = async () => {
    if (!playing || finalizingRef.current.has(playing.id)) return;
    finalizingRef.current.add(playing.id);
    await finalizeOpenMicItem(playing.id);
  };
  const submit = async () => {
    setError(null);
    if (!user) return setError("Sign in to submit to Open Mic.");
    if (!title.trim()) return setError("Song title is required.");
    if (!file) return setError("Please upload your song.");
    const vErr = validateAudio(file);
    if (vErr) return setError(vErr);
    const count = await getDailyCount(user.id);
    if (count >= OPEN_MIC_MAX_PER_DAY) return setError(`Daily limit reached (${OPEN_MIC_MAX_PER_DAY}/day).`);
    const qCount = await getActiveQueueCount();
    if (qCount >= OPEN_MIC_MAX_QUEUE) return setError(`Open Mic queue is full (${OPEN_MIC_MAX_QUEUE}/${OPEN_MIC_MAX_QUEUE}). Try again soon.`);
    setSubmitting(true);
    try {
      const up = await uploadFile("open-mic-temp-audio", file, user.id);
      await supabase.from("open_mic_queue").insert({
        user_id: user.id,
        user_name: user.name,
        song_title: title.trim(),
        artist_name: user.name,
        audio_storage_path: up.path,
        audio_duration: up.duration,
        file_size: up.size,
        status: "queued",
        submitted_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      await incrementDailyCount(user.id);
      setTitle("");
      setFile(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };
  const audioUrl = useSignedAudioUrl("open-mic-temp-audio", playing?.audio_storage_path);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pt-4 pb-32 max-w-6xl mx-auto space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#A855F7] text-[11px] tracking-[5px] font-bold", children: "— OPEN MIC ROOM —" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-black text-[#F8FAFC] mt-1", children: "Play For The Community" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[#94A3B8] text-sm mt-1", children: [
        OPEN_MIC_MAX_QUEUE,
        " song queue. ",
        OPEN_MIC_MAX_PER_DAY,
        " submissions per artist per day."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr] gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        playing ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-[#A855F7]/40 bg-[#0B1426] p-3 shadow-[0_0_30px_-10px_rgba(168,85,247,0.6)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-[#A855F7] text-[10px] font-bold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-[#A855F7] animate-pulse" }),
              " PLAYING"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[#94A3B8] text-[10px]", children: [
              "from ",
              playing.user_name
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AudioPlayer, { src: audioUrl, title: playing.song_title, artist: playing.artist_name, autoPlay: true, onEnded, compact: true })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-[#1a2942] bg-[#0B1426] p-6 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { size: 32, className: "text-[#A855F7] mx-auto" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#94A3B8] mt-2 text-sm", children: "Waiting for next song…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-[#1a2942] bg-[#0B1426] p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#F8FAFC] font-bold tracking-wide", children: "QUEUE" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[#A855F7] text-xs font-bold", children: [
              queue.length,
              "/",
              OPEN_MIC_MAX_QUEUE
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            queue.filter((q) => q.status === "queued").map((q, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-2 rounded-2xl border border-[#1a2942] bg-[#05070D]/40", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded-full bg-[#101827] text-[#A855F7] flex items-center justify-center text-xs font-bold", children: i + 1 }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#F8FAFC] text-sm font-semibold truncate", children: q.song_title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#94A3B8] text-xs truncate", children: q.user_name })
              ] })
            ] }, q.id)),
            queue.filter((q) => q.status === "queued").length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#94A3B8] text-sm text-center py-4", children: "Queue is open. Submit yours." })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-[#A855F7]/40 bg-[#0B1426] p-4 space-y-3 h-fit", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#A855F7] font-bold tracking-wider", children: "SUBMIT TO OPEN MIC" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-[#94A3B8]", children: [
            dailyCount,
            "/",
            OPEN_MIC_MAX_PER_DAY,
            " today"
          ] })
        ] }),
        !user && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#94A3B8] text-sm", children: "Sign in to submit." }),
        user && dailyCount >= OPEN_MIC_MAX_PER_DAY && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#FFC857] text-sm bg-[#FFC857]/10 border border-[#FFC857]/30 rounded-2xl p-3", children: "You've hit your daily limit. Come back tomorrow to drop more." }),
        user && dailyCount < OPEN_MIC_MAX_PER_DAY && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: title, onChange: (e) => setTitle(e.target.value), placeholder: "Song title", className: "w-full px-3 py-2.5 rounded-xl bg-[#05070D] border border-[#1a2942] text-[#F8FAFC] outline-none focus:border-[#A855F7]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "audio/*,.mp3,.wav,.m4a,.aac", className: "hidden", onChange: (e) => setFile(e.target.files?.[0] || null) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-3 p-3 rounded-xl border-2 border-dashed cursor-pointer ${file ? "border-[#22C55E]/60 bg-[#22C55E]/5" : "border-[#1a2942]"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 18, className: "text-[#A855F7]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-[#F8FAFC] truncate flex-1", children: file ? file.name : `Upload audio (max ${MAX_AUDIO_MB}MB)` })
            ] })
          ] }),
          error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[#EF4444] text-xs bg-[#EF4444]/10 rounded-xl p-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { size: 14 }),
            " ",
            error
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: submit, disabled: submitting, className: "w-full py-3 rounded-2xl bg-gradient-to-r from-[#A855F7] to-[#00B7FF] text-white font-black tracking-wider disabled:opacity-50 flex items-center justify-center gap-2", children: submitting ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin", size: 16 }),
            " SUBMITTING"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { size: 16 }),
            " ADD TO QUEUE"
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-[#64748B] leading-relaxed border-t border-[#1a2942] pt-3", children: "Open Mic audio is auto-deleted after playback. A lightweight play record stays for history and moderation." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChatPanel, { roomType: "open_mic", refId: playing?.id || null })
    ] })
  ] });
};
const STATUS_MAP = {
  pending: { label: "Pending", color: "#94A3B8", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 12 }) },
  ai_prechecked: { label: "AI Pre-Checked", color: "#A855F7", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 12 }) },
  in_queue: { label: "In Queue", color: "#00B7FF", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 12 }) },
  now_playing: { label: "Now Playing", color: "#FFC857", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Music, { size: 12 }) },
  under_review: { label: "Under Review", color: "#FFC857", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Music, { size: 12 }) },
  review_complete: { label: "Review Complete", color: "#22C55E", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 12 }) },
  needs_revision: { label: "Needs Revision", color: "#FFC857", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { size: 12 }) },
  rejected: { label: "Removed", color: "#EF4444", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { size: 12 }) }
};
const History = ({ onResults }) => {
  const { user } = useTreyAuth();
  const [subs, setSubs] = reactExports.useState([]);
  const [scoresMap, setScoresMap] = reactExports.useState({});
  reactExports.useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("music_review_submissions").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setSubs(data || []);
      const { data: scores } = await supabase.from("music_review_scores").select("id, submission_id").eq("user_id", user.id);
      const map = {};
      (scores || []).forEach((s) => {
        map[s.submission_id] = s.id;
      });
      setScoresMap(map);
    })();
  }, [user]);
  if (!user) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-[#94A3B8] py-20", children: "Sign in to see your submissions." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pt-4 pb-32 max-w-3xl mx-auto space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#FFC857] text-[10px] tracking-[4px] font-bold", children: "— SUBMISSION HISTORY —" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-black text-[#F8FAFC] mt-1", children: "Your Submissions" })
    ] }),
    subs.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-[#94A3B8] py-10", children: "No submissions yet." }),
    subs.map((s) => {
      const st = STATUS_MAP[s.status] || STATUS_MAP.pending;
      const reviewId = scoresMap[s.id];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-[#1a2942] bg-[#0B1426] p-3 flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-11 h-11 rounded-xl bg-gradient-to-br from-[#00B7FF]/20 to-[#A855F7]/20 border border-[#1a2942] flex items-center justify-center text-[#00B7FF]", children: "♪" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#F8FAFC] font-semibold truncate", children: s.song_title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[#94A3B8] text-xs truncate", children: [
            s.artist_name,
            " • ",
            new Date(s.created_at).toLocaleDateString()
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1", style: { background: `${st.color}15`, color: st.color, border: `1px solid ${st.color}40` }, children: [
            st.icon,
            " ",
            st.label
          ] }),
          reviewId && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onResults(reviewId), className: "text-[#00B7FF] text-[10px] font-bold", children: "VIEW SCORE" })
        ] })
      ] }, s.id);
    })
  ] });
};
const AdminDashboard = ({ onQueue, onOpenMic, onSettings }) => {
  const [stats, setStats] = reactExports.useState({
    total: 0,
    pending: 0,
    inQueue: 0,
    completed: 0,
    paid: 0,
    openMicActive: 0,
    avgScore: 0
  });
  reactExports.useEffect(() => {
    const load = async () => {
      const [tot, pen, qu, comp, paid, om, scores] = await Promise.all([
        supabase.from("music_review_submissions").select("*", { count: "exact", head: true }),
        supabase.from("music_review_submissions").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("music_review_submissions").select("*", { count: "exact", head: true }).in("status", ["in_queue", "ai_prechecked"]),
        supabase.from("music_review_submissions").select("*", { count: "exact", head: true }).eq("status", "review_complete"),
        supabase.from("music_review_payments").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
        supabase.from("open_mic_queue").select("*", { count: "exact", head: true }).in("status", ["queued", "playing"]),
        supabase.from("music_review_scores").select("overall_score")
      ]);
      const avg = scores.data?.length ? scores.data.reduce((s, x) => s + x.overall_score, 0) / scores.data.length : 0;
      setStats({
        total: tot.count || 0,
        pending: pen.count || 0,
        inQueue: qu.count || 0,
        completed: comp.count || 0,
        paid: paid.count || 0,
        openMicActive: om.count || 0,
        avgScore: Math.round(avg)
      });
    };
    load();
    const i = setInterval(load, 5e3);
    return () => clearInterval(i);
  }, []);
  const card = (label, value, icon, color) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-[#1a2942] bg-[#0B1426] p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[#94A3B8] text-[10px] tracking-wider font-bold", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color }, children: icon }),
      " ",
      label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-black mt-1", style: { color }, children: value })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pt-4 pb-32 max-w-5xl mx-auto space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#FFC857] text-[10px] tracking-[4px] font-bold", children: "— ADMIN —" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-black text-[#F8FAFC]", children: "Music Review Dashboard" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onSettings, className: "px-3 py-2 rounded-2xl border border-[#1a2942] text-[#94A3B8] text-xs hover:border-[#00B7FF]/60", children: "Settings" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
      card("TOTAL SUBMISSIONS", stats.total, /* @__PURE__ */ jsxRuntimeExports.jsx(Music, { size: 14 }), "#00B7FF"),
      card("PENDING", stats.pending, /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 14 }), "#94A3B8"),
      card("IN QUEUE", stats.inQueue, /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { size: 14 }), "#FFC857"),
      card("COMPLETED", stats.completed, /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 14 }), "#22C55E"),
      card("PAID PRIORITY", stats.paid, /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 14 }), "#A855F7"),
      card("OPEN MIC ACTIVE", stats.openMicActive, /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { size: 14 }), "#A855F7"),
      card("AVG SCORE", stats.avgScore || "—", /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { size: 14 }), "#FFC857")
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onQueue, className: "text-left rounded-3xl border border-[#1a2942] bg-[#0B1426] p-5 hover:border-[#00B7FF]/60 transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#00B7FF] text-xs tracking-wider font-bold", children: "REVIEW QUEUE MANAGER" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#F8FAFC] font-bold mt-1", children: "Review, score & publish songs →" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onOpenMic, className: "text-left rounded-3xl border border-[#1a2942] bg-[#0B1426] p-5 hover:border-[#A855F7]/60 transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#A855F7] text-xs tracking-wider font-bold", children: "OPEN MIC MODERATION" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#F8FAFC] font-bold mt-1", children: "Manage Open Mic queue & cleanup →" })
      ] })
    ] })
  ] });
};
async function sendReviewEmail(opts) {
  const { data, error } = await supabase.functions.invoke("music-review-send-email", {
    body: {
      reviewId: opts.reviewId,
      songTitle: opts.songTitle,
      artistName: opts.artistName,
      overallScore: opts.overallScore,
      categories: opts.categories,
      summary: opts.summary,
      recipientEmail: opts.recipientEmail
    }
  });
  await supabase.from("music_review_email_logs").insert({
    user_id: opts.userId,
    submission_id: opts.submissionId,
    review_score_id: opts.reviewId,
    recipient_email: opts.recipientEmail,
    provider: "resend",
    status: data?.provider_status || (error ? "failed" : "preview_only"),
    provider_message_id: data?.provider_message_id || null,
    sent_at: (/* @__PURE__ */ new Date()).toISOString(),
    error_message: data?.error || error?.message || null
  });
  return { html: data?.html, status: data?.provider_status };
}
async function getMusicReviewSubmissions(filter) {
  let q = supabase.from("music_review_submissions").select("*").order("queue_position", { ascending: true, nullsFirst: false });
  const { data } = await q;
  return data || [];
}
async function updateSubmissionStatus(id, status, adminNotes) {
  const patch = { status, updated_at: (/* @__PURE__ */ new Date()).toISOString() };
  await supabase.from("music_review_submissions").update(patch).eq("id", id);
  await rebuildReviewQueue();
}
async function markNowPlaying(submissionId) {
  await setNowPlaying(submissionId);
}
async function completeMusicReview(input) {
  const s = input.scores;
  const overall = Math.round(
    (s.vocals_score + s.lyrics_score + s.mix_score + s.originality_score + s.hit_potential_score + s.replay_value_score + s.marketability_score) / 7
  );
  const { data: sub } = await supabase.from("music_review_submissions").select("song_title, artist_name").eq("id", input.submissionId).maybeSingle();
  const { data: score } = await supabase.from("music_review_scores").insert({
    submission_id: input.submissionId,
    user_id: input.userId,
    song_title: sub?.song_title,
    artist_name: sub?.artist_name,
    overall_score: overall,
    ...s,
    written_summary: input.written_summary,
    strengths_json: input.strengths,
    improvements_json: input.improvements,
    public_visible: input.publish
  }).select().single();
  await supabase.from("music_review_submissions").update({ status: "review_complete", reviewed_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", input.submissionId);
  return score;
}
async function sendMusicReviewEmail(reviewId) {
  const { data: r } = await supabase.from("music_review_scores").select("*").eq("id", reviewId).maybeSingle();
  if (!r) return { ok: false };
  const { data: sub } = await supabase.from("music_review_submissions").select("user_email").eq("id", r.submission_id).maybeSingle();
  const result = await sendReviewEmail({
    reviewId: r.id,
    submissionId: r.submission_id,
    userId: r.user_id,
    recipientEmail: sub?.user_email || "",
    songTitle: r.song_title,
    artistName: r.artist_name,
    overallScore: r.overall_score,
    categories: {
      vocals: r.vocals_score,
      lyrics: r.lyrics_score,
      mix: r.mix_score,
      originality: r.originality_score,
      hit_potential: r.hit_potential_score,
      marketability: r.marketability_score
    },
    summary: r.written_summary
  });
  return result;
}
async function removeOpenMicSong(id) {
  await supabase.from("open_mic_queue").update({ status: "removed" }).eq("id", id);
  await finalizeOpenMicItem(id);
}
async function skipOpenMicSong(id) {
  await supabase.from("open_mic_queue").update({ status: "skipped" }).eq("id", id);
  await finalizeOpenMicItem(id);
}
async function retryOpenMicCleanupAction(id) {
  return await retryOpenMicCleanup(id);
}
async function updateMusicReviewSettings(key, value) {
  const { data } = await supabase.from("music_review_settings").select("id").eq("key", key).maybeSingle();
  if (data) {
    await supabase.from("music_review_settings").update({ value_json: value, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("key", key);
  } else {
    await supabase.from("music_review_settings").insert({ key, value_json: value });
  }
}
const AdminQueue = ({ onReview }) => {
  const [subs, setSubs] = reactExports.useState([]);
  const [filter, setFilter] = reactExports.useState("all");
  const [search, setSearch] = reactExports.useState("");
  const load = async () => {
    const all = await getMusicReviewSubmissions();
    setSubs(all);
  };
  reactExports.useEffect(() => {
    load();
    const ch = supabase.channel("admin-queue").on("postgres_changes", { event: "*", schema: "public", table: "music_review_submissions" }, load).subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);
  const filtered = subs.filter((s) => {
    if (filter !== "all" && s.status !== filter) return false;
    if (search && !`${s.song_title} ${s.artist_name}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const confirmPayment = async (id) => {
    const { data } = await supabase.from("music_review_payments").select("id").eq("submission_id", id).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (data) await supabase.from("music_review_payments").update({ status: "confirmed", confirmed_by_admin: true }).eq("id", data.id);
    await supabase.from("music_review_submissions").update({ priority_paid: true }).eq("id", id);
    load();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pt-4 pb-32 max-w-6xl mx-auto space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-black text-[#F8FAFC]", children: "Queue Manager" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          value: search,
          onChange: (e) => setSearch(e.target.value),
          placeholder: "Search song or artist…",
          className: "flex-1 px-3 py-2 rounded-xl bg-[#05070D] border border-[#1a2942] text-[#F8FAFC] outline-none focus:border-[#00B7FF]"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: filter, onChange: (e) => setFilter(e.target.value), className: "px-3 py-2 rounded-xl bg-[#05070D] border border-[#1a2942] text-[#F8FAFC] outline-none", children: ["all", "pending", "ai_prechecked", "in_queue", "now_playing", "under_review", "review_complete", "needs_revision", "rejected"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s, children: s.replace(/_/g, " ") }, s)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-[#1a2942] bg-[#0B1426] overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[40px_1fr_120px_120px_180px] gap-2 px-3 py-2 text-[10px] text-[#94A3B8] tracking-wider font-bold border-b border-[#1a2942]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "#" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "SONG" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "STATUS" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "PRIORITY" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "ACTIONS" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "divide-y divide-[#1a2942]", children: [
        filtered.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[40px_1fr_120px_120px_180px] gap-2 px-3 py-2 items-center text-sm hover:bg-[#101827]/40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#00B7FF] font-bold", children: s.queue_position ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#F8FAFC] font-semibold truncate", children: s.song_title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[#94A3B8] text-xs truncate", children: [
              s.artist_name,
              " • AI ",
              s.ai_precheck_score ?? "—"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-[#FFC857]", children: s.status }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px]", children: s.priority_tier ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: s.priority_paid ? "text-[#22C55E]" : "text-[#FFC857]", children: [
            s.priority_tier.toUpperCase(),
            " ",
            s.priority_paid ? "PAID" : "UNCONFIRMED"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#94A3B8]", children: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { title: "Set Now Playing", onClick: () => markNowPlaying(s.id), className: "w-7 h-7 rounded-lg bg-[#FFC857]/15 border border-[#FFC857]/40 text-[#FFC857] flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 12 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { title: "Open Review", onClick: () => onReview(s.id), className: "w-7 h-7 rounded-lg bg-[#00B7FF]/15 border border-[#00B7FF]/40 text-[#00B7FF] flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PenLine, { size: 12 }) }),
            s.priority_tier && !s.priority_paid && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { title: "Confirm Payment", onClick: () => confirmPayment(s.id), className: "w-7 h-7 rounded-lg bg-[#22C55E]/15 border border-[#22C55E]/40 text-[#22C55E] flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { size: 12 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { title: "Remove", onClick: () => updateSubmissionStatus(s.id, "rejected"), className: "w-7 h-7 rounded-lg bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444] flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 12 }) })
          ] })
        ] }, s.id)),
        filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-10 text-center text-[#94A3B8] text-sm", children: "No submissions match." })
      ] })
    ] })
  ] });
};
const CATS = [
  { key: "vocals_score", label: "VOCALS" },
  { key: "lyrics_score", label: "LYRICS / SONGWRITING" },
  { key: "mix_score", label: "MIX / PRODUCTION" },
  { key: "originality_score", label: "ORIGINALITY" },
  { key: "hit_potential_score", label: "HIT POTENTIAL" },
  { key: "replay_value_score", label: "REPLAY VALUE" },
  { key: "marketability_score", label: "MARKETABILITY" }
];
const AdminWorkbench = ({ submissionId, onDone }) => {
  const [sub, setSub] = reactExports.useState(null);
  const [scores, setScores] = reactExports.useState({
    vocals_score: 85,
    lyrics_score: 85,
    mix_score: 85,
    originality_score: 85,
    hit_potential_score: 85,
    replay_value_score: 85,
    marketability_score: 85
  });
  const [summary, setSummary] = reactExports.useState("");
  const [strengths, setStrengths] = reactExports.useState("");
  const [improvements, setImprovements] = reactExports.useState("");
  const [adminNotes, setAdminNotes] = reactExports.useState("");
  const [emailHtml, setEmailHtml] = reactExports.useState(null);
  const [status, setStatus] = reactExports.useState(null);
  const [savedReview, setSavedReview] = reactExports.useState(null);
  reactExports.useEffect(() => {
    (async () => {
      const { data } = await supabase.from("music_review_submissions").select("*").eq("id", submissionId).maybeSingle();
      setSub(data);
      if (data?.admin_notes) setAdminNotes(data.admin_notes);
      if (data?.ai_precheck_json) {
        const p = data.ai_precheck_json;
        setSummary(p.summary || "");
        setStrengths((p.strengths || []).join("\n"));
        setImprovements((p.improvements || []).join("\n"));
      }
    })();
  }, [submissionId]);
  const overall = Math.round(Object.values(scores).reduce((s, x) => s + x, 0) / Object.values(scores).length);
  const audio = useSignedAudioUrl("music-review-audio", sub?.audio_storage_path);
  const cover = getPublicUrl("music-review-cover-art", sub?.cover_art_storage_path);
  if (!sub) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-[#94A3B8] py-10", children: "Loading..." });
  const saveDraft = async () => {
    await supabase.from("music_review_submissions").update({ admin_notes: adminNotes, status: "under_review" }).eq("id", submissionId);
    setStatus("Draft saved");
  };
  const finalize = async (publish) => {
    const review = await completeMusicReview({
      submissionId,
      userId: sub.user_id,
      scores,
      written_summary: summary,
      strengths: strengths.split("\n").filter(Boolean),
      improvements: improvements.split("\n").filter(Boolean),
      publish
    });
    setSavedReview(review);
    setStatus(`Review saved (${overall}/100)${publish ? " • Published to profile" : ""}`);
  };
  const sendEmail = async () => {
    if (!savedReview) return;
    const res = await sendMusicReviewEmail(savedReview.id);
    setEmailHtml("html" in res ? res.html || null : null);
    setStatus(`Email ${"status" in res ? res.status : "not sent"}`);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pt-4 pb-32 max-w-6xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-[#1a2942] bg-[#0B1426] p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#FFC857] text-[10px] tracking-wider font-bold", children: "REVIEWING" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black text-[#F8FAFC]", children: sub.song_title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#00B7FF] text-sm", children: sub.artist_name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[#94A3B8] text-xs mt-1", children: [
            "Genre: ",
            sub.genre || "—",
            " • Mood: ",
            sub.mood || "—",
            " • AI Pre-Check: ",
            sub.ai_precheck_score ?? "—",
            "/100"
          ] }),
          sub.note_to_reviewer && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-sm text-[#94A3B8] bg-[#05070D]/60 rounded-2xl p-2 border border-[#1a2942]", children: [
            "Note: ",
            sub.note_to_reviewer
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AudioPlayer, { src: audio, title: sub.song_title, artist: sub.artist_name, coverUrl: cover }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            value: adminNotes,
            onChange: (e) => setAdminNotes(e.target.value),
            rows: 4,
            placeholder: "Private admin notes…",
            className: "w-full px-3 py-2 rounded-2xl bg-[#0B1426] border border-[#1a2942] text-[#F8FAFC] outline-none focus:border-[#00B7FF]"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-[#1a2942] bg-[#0B1426] p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#F8FAFC] font-bold tracking-wide mb-3", children: "SCORE THE TRACK" }),
          CATS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#94A3B8] tracking-wider font-bold", children: c.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#FFC857] font-black", children: scores[c.key] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "range",
                min: 0,
                max: 100,
                value: scores[c.key],
                onChange: (e) => setScores({ ...scores, [c.key]: parseInt(e.target.value) }),
                className: "w-full accent-[#00B7FF]"
              }
            )
          ] }, c.key)),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-[#FFC857]/40 bg-[#FFC857]/5 p-3 text-center mt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#FFC857] text-[10px] tracking-wider font-bold", children: "OVERALL SCORE" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-5xl font-black text-[#FFC857]", children: overall })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            value: summary,
            onChange: (e) => setSummary(e.target.value),
            rows: 3,
            placeholder: "Written summary (will appear in email & profile)",
            className: "w-full px-3 py-2 rounded-2xl bg-[#0B1426] border border-[#1a2942] text-[#F8FAFC] outline-none focus:border-[#00B7FF]"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            value: strengths,
            onChange: (e) => setStrengths(e.target.value),
            rows: 3,
            placeholder: "Strengths (one per line)",
            className: "w-full px-3 py-2 rounded-2xl bg-[#0B1426] border border-[#22C55E]/30 text-[#F8FAFC] outline-none focus:border-[#22C55E]"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            value: improvements,
            onChange: (e) => setImprovements(e.target.value),
            rows: 3,
            placeholder: "Improvements (one per line)",
            className: "w-full px-3 py-2 rounded-2xl bg-[#0B1426] border border-[#FFC857]/30 text-[#F8FAFC] outline-none focus:border-[#FFC857]"
          }
        ),
        status && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-[#22C55E]/40 bg-[#22C55E]/10 text-[#22C55E] text-sm p-2.5 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 14 }),
          " ",
          status
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: saveDraft, className: "flex items-center justify-center gap-2 py-3 rounded-2xl border border-[#1a2942] text-[#94A3B8] hover:border-[#00B7FF]/60", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { size: 14 }),
            " SAVE DRAFT"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => finalize(true), className: "flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-[#FFC857] to-[#FFB000] text-[#05070D] font-black", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 14 }),
            " COMPLETE + PUBLISH"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => finalize(false), className: "flex items-center justify-center gap-2 py-3 rounded-2xl border border-[#A855F7]/40 text-[#A855F7]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 14 }),
            " COMPLETE PRIVATE"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: sendEmail, disabled: !savedReview, className: "flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#00B7FF] text-[#05070D] font-black disabled:opacity-40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { size: 14 }),
            " SEND EMAIL"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onDone, className: "w-full py-2 rounded-2xl border border-[#1a2942] text-[#94A3B8] text-sm", children: "← Back to Queue" })
      ] })
    ] }),
    emailHtml && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#94A3B8] text-xs tracking-wider mb-2", children: "EMAIL PREVIEW" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("iframe", { srcDoc: emailHtml, className: "w-full h-[800px] rounded-3xl border border-[#1a2942] bg-white", title: "Email preview" })
    ] })
  ] });
};
const AdminOpenMic = () => {
  const [items, setItems] = reactExports.useState([]);
  const [history, setHistory] = reactExports.useState([]);
  const load = async () => {
    const { data: q } = await supabase.from("open_mic_queue").select("*").order("submitted_at", { ascending: true }).limit(50);
    setItems(q || []);
    const { data: h } = await supabase.from("open_mic_play_history").select("*").order("created_at", { ascending: false }).limit(20);
    setHistory(h || []);
  };
  reactExports.useEffect(() => {
    load();
    const ch = supabase.channel("admin-om").on("postgres_changes", { event: "*", schema: "public", table: "open_mic_queue" }, load).subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);
  const clearQueue = async () => {
    for (const item of items.filter((x) => x.status === "queued")) {
      await removeOpenMicSong(item.id);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pt-4 pb-32 max-w-5xl mx-auto space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-black text-[#F8FAFC]", children: "Open Mic Moderation" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-[#1a2942] bg-[#0B1426] p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#A855F7] font-bold tracking-wider", children: "CURRENT QUEUE" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: clearQueue, className: "text-xs text-[#EF4444] border border-[#EF4444]/40 rounded-lg px-2 py-1", children: "CLEAR QUEUE" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        items.filter((x) => ["queued", "playing"].includes(x.status)).map((x) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-2 rounded-2xl border border-[#1a2942] bg-[#05070D]/40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#A855F7] text-[10px] font-bold uppercase", children: x.status }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#F8FAFC] text-sm font-semibold truncate", children: x.song_title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#94A3B8] text-xs truncate", children: x.user_name })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { title: "Skip", onClick: () => skipOpenMicSong(x.id), className: "w-7 h-7 rounded-lg bg-[#FFC857]/15 border border-[#FFC857]/40 text-[#FFC857] flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SkipForward, { size: 12 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { title: "Remove", onClick: () => removeOpenMicSong(x.id), className: "w-7 h-7 rounded-lg bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444] flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 12 }) })
        ] }, x.id)),
        items.filter((x) => ["queued", "playing"].includes(x.status)).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-[#94A3B8] py-6", children: "Queue is empty." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-[#1a2942] bg-[#0B1426] p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#A855F7] font-bold tracking-wider mb-3", children: "CLEANUP STATUS" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        items.filter((x) => x.cleanup_failed).map((x) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-2 rounded-2xl border border-[#EF4444]/40 bg-[#EF4444]/5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 14, className: "text-[#EF4444]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#F8FAFC] text-sm truncate", children: x.song_title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#94A3B8] text-xs", children: "Cleanup failed" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => retryOpenMicCleanupAction(x.id).then(load), className: "flex items-center gap-1 text-[#00B7FF] text-xs border border-[#00B7FF]/40 rounded-lg px-2 py-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCw, { size: 10 }),
            " RETRY"
          ] })
        ] }, x.id)),
        items.filter((x) => x.cleanup_failed).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#94A3B8] text-xs", children: "All clean ✓" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-[#1a2942] bg-[#0B1426] p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#A855F7] font-bold tracking-wider mb-3", children: "RECENTLY PLAYED (audio auto-deleted)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: history.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#94A3B8] text-xs w-32 truncate", children: new Date(h.created_at).toLocaleString() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 text-[#F8FAFC] truncate", children: h.song_title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-[#22C55E]", children: h.storage_deleted ? "DELETED ✓" : "PENDING" })
      ] }, h.id)) })
    ] })
  ] });
};
const KEYS = [
  { key: "open_mic_max_queue", label: "Max Open Mic queue size", type: "number", def: 10 },
  { key: "open_mic_max_per_day", label: "Max Open Mic submissions per user / day", type: "number", def: 2 },
  { key: "max_audio_file_mb", label: "Max audio file size (MB)", type: "number", def: 25 },
  { key: "max_audio_duration_sec", label: "Max audio duration (sec)", type: "number", def: 420 },
  { key: "allow_anonymous_listen", label: "Allow signed-out users to listen", type: "bool", def: true },
  { key: "ai_listener_enabled", label: "AI Listener feedback enabled", type: "bool", def: true },
  { key: "ai_listener_public", label: "AI feedback is public", type: "bool", def: true }
];
const AdminSettings = () => {
  const [vals, setVals] = reactExports.useState({});
  const [saved, setSaved] = reactExports.useState(false);
  reactExports.useEffect(() => {
    (async () => {
      const { data } = await supabase.from("music_review_settings").select("*");
      const map = {};
      (data || []).forEach((r) => {
        map[r.key] = r.value_json;
      });
      KEYS.forEach((k) => {
        if (map[k.key] === void 0) map[k.key] = k.def;
      });
      setVals(map);
    })();
  }, []);
  const save = async () => {
    for (const k of KEYS) await updateMusicReviewSettings(k.key, vals[k.key]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2e3);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pt-4 pb-32 max-w-2xl mx-auto space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-black text-[#F8FAFC]", children: "Settings" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-[#1a2942] bg-[#0B1426] p-4 space-y-3", children: [
      KEYS.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 py-2 border-b border-[#1a2942] last:border-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#F8FAFC] font-semibold text-sm", children: k.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#94A3B8] text-[10px] tracking-wider", children: k.key })
        ] }),
        k.type === "bool" ? /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: !!vals[k.key], onChange: (e) => setVals({ ...vals, [k.key]: e.target.checked }), className: "w-5 h-5 accent-[#00B7FF]" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "number",
            value: vals[k.key] ?? "",
            onChange: (e) => setVals({ ...vals, [k.key]: parseInt(e.target.value) || 0 }),
            className: "w-24 px-3 py-1.5 rounded-xl bg-[#05070D] border border-[#1a2942] text-[#F8FAFC] text-right outline-none focus:border-[#00B7FF]"
          }
        )
      ] }, k.key)),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: save, className: "w-full mt-3 py-3 rounded-2xl bg-gradient-to-r from-[#FFC857] to-[#FFB000] text-[#05070D] font-black tracking-wider flex items-center justify-center gap-2", children: saved ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 16 }),
        " SAVED"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { size: 16 }),
        " SAVE SETTINGS"
      ] }) })
    ] })
  ] });
};
const MusicReviewModule = ({ initialRoute = "home" }) => {
  const { user } = useTreyAuth();
  const [route, setRoute] = reactExports.useState(initialRoute);
  const [history, setHistory] = reactExports.useState([]);
  const [precheck, setPrecheck] = reactExports.useState(null);
  const [reviewId, setReviewId] = reactExports.useState(null);
  const [submissionForReview, setSubmissionForReview] = reactExports.useState(null);
  const go = (r) => {
    setHistory((h) => [...h, route]);
    setRoute(r);
  };
  const back = () => {
    setRoute(history[history.length - 1] || "home");
    setHistory((h) => h.slice(0, -1));
  };
  const onBottomNav = (key) => {
    if (key === "review") go("home");
    if (key === "profile") go("profile");
    if (key === "submit") go("submit");
    if (key === "leaderboard") go("queue");
    if (key === "shop") go("skipline");
  };
  const isAdminRoute = route.startsWith("admin");
  const adminAllowed = Boolean(user?.isAdmin);
  const bottomKey = route === "home" ? "review" : route === "profile" ? "profile" : route === "submit" ? "submit" : route === "queue" ? "leaderboard" : route === "skipline" ? "shop" : "review";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen text-[#F8FAFC]", style: { background: "#05070D" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(StageBackground, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Header,
      {
        showBack: route !== "home" && route !== "admin",
        onBack: back,
        rightSlot: user?.isAdmin ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => go(isAdminRoute ? "home" : "admin"), className: "px-3 py-2 rounded-2xl border border-[#FFC857]/60 text-[#FFC857] text-[10px] font-bold tracking-wider flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 12 }),
          " ",
          isAdminRoute ? "EXIT ADMIN" : "ADMIN"
        ] }) : null
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { children: [
      isAdminRoute && !adminAllowed && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-12 max-w-md mx-auto text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-[#EF4444]/40 bg-[#0B1426] p-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[#EF4444] text-xs tracking-[4px] font-bold", children: "ADMIN ACCESS REQUIRED" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-black text-[#F8FAFC] mt-2", children: "Music Review Admin is protected" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#94A3B8] text-sm mt-2", children: "Connect this module to Trey TV owner/admin role checks before enabling production admin actions." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => go("home"), className: "mt-5 px-5 py-3 rounded-2xl border border-[#00B7FF]/50 text-[#00B7FF] text-sm font-bold", children: "Back to Review" })
      ] }) }),
      !isAdminRoute && route === "home" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Home,
        {
          onSubmit: () => go("submit"),
          onOpenMic: () => go("openmic"),
          onQueue: () => go("queue"),
          onLive: () => go("live"),
          onProfile: () => go("profile"),
          onSkipLine: () => go("skipline")
        }
      ),
      !isAdminRoute && route === "submit" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Submit,
        {
          onPrecheckReady: (submissionId, data) => {
            setPrecheck({ submissionId, data, songTitle: "", artistName: user?.name || "" });
            go("precheck");
          }
        }
      ),
      !isAdminRoute && route === "precheck" && precheck && /* @__PURE__ */ jsxRuntimeExports.jsx(
        PreCheckView,
        {
          submissionId: precheck.submissionId,
          precheck: precheck.data,
          songTitle: precheck.songTitle || "Your Song",
          artistName: precheck.artistName,
          onSubmitToTrey: () => go("skipline"),
          onRevise: () => go("submit")
        }
      ),
      !isAdminRoute && route === "queue" && /* @__PURE__ */ jsxRuntimeExports.jsx(Queue, { onLive: () => go("live"), highlightUserId: user?.id }),
      !isAdminRoute && route === "live" && /* @__PURE__ */ jsxRuntimeExports.jsx(LiveRoom, {}),
      !isAdminRoute && route === "skipline" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        SkipTheLine,
        {
          submissionId: precheck?.submissionId || null,
          onDone: () => go("queue"),
          onSkip: () => go("queue")
        }
      ),
      !isAdminRoute && route === "results" && reviewId && /* @__PURE__ */ jsxRuntimeExports.jsx(Results, { reviewId, onProfile: () => go("profile") }),
      !isAdminRoute && route === "profile" && /* @__PURE__ */ jsxRuntimeExports.jsx(Profile, { onSubmit: () => go("submit"), onResults: (id) => {
        setReviewId(id);
        go("results");
      } }),
      !isAdminRoute && route === "openmic" && /* @__PURE__ */ jsxRuntimeExports.jsx(OpenMic, {}),
      !isAdminRoute && route === "history" && /* @__PURE__ */ jsxRuntimeExports.jsx(History, { onResults: (id) => {
        setReviewId(id);
        go("results");
      } }),
      adminAllowed && route === "admin" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        AdminDashboard,
        {
          onQueue: () => go("admin-queue"),
          onOpenMic: () => go("admin-openmic"),
          onSettings: () => go("admin-settings")
        }
      ),
      adminAllowed && route === "admin-queue" && /* @__PURE__ */ jsxRuntimeExports.jsx(AdminQueue, { onReview: (id) => {
        setSubmissionForReview(id);
        go("admin-review");
      } }),
      adminAllowed && route === "admin-review" && submissionForReview && /* @__PURE__ */ jsxRuntimeExports.jsx(AdminWorkbench, { submissionId: submissionForReview, onDone: () => go("admin-queue") }),
      adminAllowed && route === "admin-openmic" && /* @__PURE__ */ jsxRuntimeExports.jsx(AdminOpenMic, {}),
      adminAllowed && route === "admin-settings" && /* @__PURE__ */ jsxRuntimeExports.jsx(AdminSettings, {})
    ] }),
    !isAdminRoute && /* @__PURE__ */ jsxRuntimeExports.jsx(BottomNav, { active: bottomKey, onNavigate: onBottomNav })
  ] });
};
export {
  MusicReviewModule as M
};

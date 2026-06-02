import { j as jsxRuntimeExports, r as reactExports, R as React__default } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { i as identityFromTreyUser, g as getOrCreateIdentity, a as getActiveSession, F as FriendInviteCenter, T as TreyBrandMark, s as setDisplayName, f as findRoomByCode, j as joinRoomByCode, b as getRoomPlayers, M as MatchScreen, S as SUIT_DISPLAY, c as createRoom, l as listActiveRooms, d as clearAbandoned, e as closeRoom, h as isGameBackendEnabled, k as MAX_PLAYERS_BY_GAME, m as leaveRoom, n as fillSeatsWithBots, o as startGameSession, u as useRealtimeRoom, p as placeBid, q as botBid, r as playCard, t as botPlay, v as newSpadesGame, w as startNextRound, x as newBlackjackGame, y as nextHand, z as doubleDown, A as stand, B as hit, C as placeBet, D as botClaim, E as makeClaim, G as botShouldCall, H as callBullshit, I as passChallenge, J as newBullshitGame, K as legalCards, L as handValue } from "./MatchScreen-D5c34u8-.mjs";
import { A as Assets } from "../_libs/pixi.js.mjs";
import { s as supabase } from "./supabase-BQ18xbNk.mjs";
import { t as treyTvLogo } from "./trey-tv-logo-CG7PjBoN.mjs";
import { u as useTvRemoteMode, a as useTvRemoteInput } from "./useTvRemoteInput-3UKI_f2s.mjs";
import { A as ArrowLeft, az as LoaderCircle, b0 as RefreshCw, bD as Server, ap as Activity, a5 as Users, l as ShieldCheck, aF as Trash2, b9 as Gamepad2, at as UserPlus, I as Inbox, aE as Info, n as Settings, S as Sparkles, bE as Spade, r as ChevronRight, bo as KeyRound, Z as Zap, bF as Wifi, aw as Trophy, bG as Shuffle, bH as BookOpen, t as Crown, aO as Bot, bI as Layers, b as Heart, br as Diamond, bJ as Club, ax as CircleCheck, a9 as Clock, X, f as Send, h as Mail, k as Check, v as Copy, a4 as Play, i as Lock, G as Globe, bK as ToggleRight, bL as ToggleLeft, aj as ArrowRight, bM as ArrowUpDown, aB as RotateCw, aM as MessageSquare, $ as Smile, Y as Flame } from "../_libs/lucide-react.mjs";
function InteractiveStoriesSection() {
  const navigate = useNavigate();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative px-4 sm:px-6 lg:px-2 py-10 lg:py-14 max-w-7xl mx-auto overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "aria-hidden": true, className: "pointer-events-none absolute inset-0 overflow-hidden rounded-[40px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[80%] rounded-full blur-3xl opacity-[0.06]",
          style: { background: "radial-gradient(ellipse, #A855F7 0%, #7C3AED 30%, transparent 70%)" }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute -right-24 top-1/3 w-80 h-80 rounded-full blur-3xl opacity-[0.07]",
          style: { background: "radial-gradient(circle, #FFC857, transparent 70%)" }
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative mb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3",
            style: {
              background: "rgba(168,85,247,0.08)",
              border: "1px solid rgba(168,85,247,0.3)"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "size-3.5", style: { color: "#A855F7" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-black tracking-[0.22em]", style: { color: "#A855F7" }, children: "STORY MODE · CHOICES · ENDINGS" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-3xl sm:text-4xl font-black tracking-tight text-[#F8FAFC]", children: [
          "Interactive",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              style: {
                background: "linear-gradient(90deg, #A855F7, #FFC857)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              },
              children: "Stories"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm sm:text-base text-[#94A3B8] max-w-lg leading-relaxed", children: "Play cinematic stories where every choice changes the outcome." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => navigate({ to: "/games/interactive-stories" }),
          className: "hidden sm:flex items-center gap-2 shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-colors",
          style: {
            background: "rgba(168,85,247,0.08)",
            border: "1px solid rgba(168,85,247,0.25)",
            color: "#C084FC"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "View All Stories" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-3.5" })
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => navigate({ to: "/games/interactive-stories/$storySlug", params: { storySlug: "switch-kicks" } }),
        className: "group relative block w-full overflow-hidden rounded-[28px] text-left transition-transform duration-300 ease-out hover:-translate-y-1 active:scale-[0.99]",
        style: {
          background: "linear-gradient(160deg, #0A1628 0%, #0D0B1F 60%, #060D18 100%)",
          border: "1px solid rgba(168,85,247,0.25)",
          boxShadow: "0 0 0 1px rgba(168,85,247,0.08), 0 16px 48px -12px rgba(168,85,247,0.3)"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              "aria-hidden": true,
              className: "pointer-events-none absolute inset-0 rounded-[28px] opacity-0 group-hover:opacity-100 transition-opacity duration-500",
              style: { boxShadow: "inset 0 0 40px rgba(168,85,247,0.12), 0 0 0 1px rgba(168,85,247,0.4)" }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              "aria-hidden": true,
              className: "absolute top-0 left-6 right-6 h-px",
              style: { background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.6), transparent)" }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full sm:w-[280px] lg:w-[320px] shrink-0 overflow-hidden", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-[4/3] sm:aspect-auto sm:h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: "/interactive-stories/scenes/twins_cover.png",
                  alt: "Switch Kicks — Twin brothers",
                  className: "h-full w-full object-cover",
                  style: { objectPosition: "center 25%" },
                  loading: "lazy"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-transparent to-[#0D0B1F] hidden sm:block" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-[#0D0B1F] to-transparent sm:hidden" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "absolute top-4 left-4 flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] font-black tracking-[0.2em] shadow-lg",
                  style: {
                    background: "rgba(168,85,247,0.85)",
                    boxShadow: "0 0 20px rgba(168,85,247,0.5)"
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-3" }),
                    "FEATURED STORY · COMEDY-DRAMA"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 p-6 sm:p-8 flex flex-col justify-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl sm:text-3xl font-black tracking-tight text-[#F8FAFC]", children: "Switch Kicks" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm leading-relaxed text-[#94A3B8] max-w-md", children: "Twin brothers. One school day. One switch that turns football, ballet, romance, and consequences into a full-blown mess." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 flex flex-wrap gap-2", children: ["Choice-Based", "Voice Cast", "Saved Playthroughs", "Shareable Endings"].map((chip) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide",
                  style: {
                    background: "rgba(168,85,247,0.1)",
                    border: "1px solid rgba(168,85,247,0.25)",
                    color: "#C084FC"
                  },
                  children: chip
                },
                chip
              )) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "span",
                  {
                    onClick: (event) => {
                      event.stopPropagation();
                      navigate({ to: "/games/interactive-stories/$storySlug/play", params: { storySlug: "switch-kicks" } });
                    },
                    className: "inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition-transform group-hover:scale-105",
                    style: {
                      background: "linear-gradient(135deg, #A855F7, #7C3AED)",
                      color: "#fff",
                      boxShadow: "0 8px 24px -4px rgba(168,85,247,0.4)"
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "size-4 fill-current" }),
                      "Play Switch Kicks"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    onClick: (event) => {
                      event.stopPropagation();
                      navigate({ to: "/games/interactive-stories/$storySlug/playthroughs", params: { storySlug: "switch-kicks" } });
                    },
                    className: "inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold",
                    style: {
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.6)"
                    },
                    children: "My Playthroughs"
                  }
                )
              ] })
            ] })
          ] })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => navigate({ to: "/games/interactive-stories/$storySlug", params: { storySlug: "the-god-ram" } }),
        className: "group relative w-full overflow-hidden rounded-[28px] text-left transition-transform duration-300 ease-out hover:-translate-y-1",
        style: {
          background: "linear-gradient(135deg, #0A1220 0%, #080E18 100%)",
          border: "1px solid rgba(255,200,87,0.15)"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center gap-4 p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "shrink-0 size-[60px] rounded-2xl grid place-items-center text-[28px] leading-none select-none",
              style: {
                background: "radial-gradient(circle at 35% 30%, rgba(255,200,87,0.2), rgba(255,200,87,0.04) 70%)",
                border: "1px solid rgba(255,200,87,0.3)",
                boxShadow: "0 0 24px rgba(255,200,87,0.2)",
                color: "#FFC857",
                fontFamily: "Georgia, 'Times New Roman', serif"
              },
              children: "𓁢"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black tracking-[0.2em] mb-1",
                style: {
                  background: "rgba(255,200,87,0.08)",
                  border: "1px solid rgba(255,200,87,0.25)",
                  color: "#FFC857"
                },
                children: "URBAN FANTASY · MYTHOLOGY"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-black tracking-tight text-[#F8FAFC]", children: "The God Ram" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-[#94A3B8] leading-relaxed max-w-lg", children: "A Memphis boy wakes the sleeping gods and becomes the door between forgotten power and a throne built on erasure." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex flex-wrap gap-1.5", children: ["Mythic Choices", "Voice Cast", "Divine Stats", "Multiple Endings"].map((chip) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: "rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide",
                style: {
                  background: "rgba(255,200,87,0.06)",
                  border: "1px solid rgba(255,200,87,0.18)",
                  color: "rgba(255,200,87,0.7)"
                },
                children: chip
              },
              chip
            )) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 flex items-center gap-2 sm:flex-col sm:gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "span",
              {
                onClick: (event) => {
                  event.stopPropagation();
                  navigate({ to: "/games/interactive-stories/$storySlug/play", params: { storySlug: "the-god-ram" } });
                },
                className: "inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold",
                style: {
                  background: "rgba(255,200,87,0.1)",
                  border: "1px solid rgba(255,200,87,0.25)",
                  color: "#FFC857"
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "size-3 fill-current" }),
                  "Play"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                onClick: (event) => {
                  event.stopPropagation();
                  navigate({ to: "/games/interactive-stories/$storySlug", params: { storySlug: "the-god-ram" } });
                },
                className: "inline-flex items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-bold",
                style: {
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.4)"
                },
                children: "Story Details"
              }
            )
          ] })
        ] })
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sm:hidden mt-5 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => navigate({ to: "/games/interactive-stories" }),
        className: "flex items-center gap-2 text-[11px] font-bold",
        style: { color: "#C084FC" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "View All Interactive Stories" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-3.5" })
        ]
      }
    ) })
  ] });
}
async function acceptRequest(id) {
  const { data } = await supabase.from("game_requests").update({ status: "accepted", responded_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id).select().single();
  return data || null;
}
async function declineRequest(id) {
  await supabase.from("game_requests").update({ status: "declined", responded_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id);
}
async function cancelOutgoingRequest(id) {
  await supabase.from("game_requests").update({ status: "cancelled", responded_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id);
}
const TRUNO_IMG = "https://d64gsuwffb70l.cloudfront.net/6a05312f4c99412b68631f27_1778727630972_8f322cdb.jpg";
const HERO_IMG = "https://d64gsuwffb70l.cloudfront.net/6a05312f4c99412b68631f27_1778727630972_8f322cdb.jpg";
const SPADES_IMG = "https://d64gsuwffb70l.cloudfront.net/6a05312f4c99412b68631f27_1778727649027_a4667a90.jpg";
const BLACKJACK_IMG = "https://d64gsuwffb70l.cloudfront.net/6a05312f4c99412b68631f27_1778727686341_bb8e9241.png";
const BULLSHIT_IMG = "https://d64gsuwffb70l.cloudfront.net/6a05312f4c99412b68631f27_1778727706155_8618acfd.jpg";
const GameRoomHome = ({
  onLaunchSolo,
  onCreateRoom,
  onJoinRoom,
  onAdmin,
  onLegend,
  displayName,
  userId,
  onEditName,
  onJoinQueue,
  onOpenFriends,
  onOpenInbox
}) => {
  const navigate = useNavigate();
  const [queueCounts, setQueueCounts] = reactExports.useState({ spades: 0, blackjack: 0, bullshit: 0, truno: 0 });
  const [inboxCount, setInboxCount] = reactExports.useState(0);
  reactExports.useEffect(() => {
    return;
  }, [userId]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full text-white pb-20 relative overflow-hidden", style: { background: "#05070D" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-events-none absolute inset-0 opacity-60", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[140px]", style: { background: "radial-gradient(circle, rgba(0,183,255,0.25) 0%, transparent 70%)" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full blur-[140px]", style: { background: "radial-gradient(circle, rgba(168,85,247,0.22) 0%, transparent 70%)" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full blur-[140px]", style: { background: "radial-gradient(circle, rgba(255,200,87,0.10) 0%, transparent 70%)" } })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky top-0 z-30 backdrop-blur-2xl border-b", style: { background: "rgba(5,7,13,0.75)", borderColor: "rgba(0,183,255,0.20)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TreyBrandMark, { size: 34, glow: true, className: "shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-px bg-white/10 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "w-9 h-9 rounded-2xl flex items-center justify-center relative shrink-0",
          style: { background: "linear-gradient(135deg,#00B7FF,#A855F7)", boxShadow: "0 0 24px rgba(0,183,255,0.55), inset 0 1px 0 rgba(255,255,255,0.3)" },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Gamepad2, { size: 16 })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.3em] font-bold", style: { color: "#00B7FF" }, children: "GAME ROOM" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm md:text-base font-black leading-tight tracking-tight", children: "Private Lounge" })
      ] }),
      displayName && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: onEditName,
          className: "text-xs px-3 py-1.5 rounded-xl border hover:bg-white/5 hidden sm:flex items-center gap-1.5 transition",
          style: { borderColor: "rgba(0,183,255,0.3)", color: "#94A3B8" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" }),
            displayName
          ]
        }
      ),
      onOpenFriends && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onOpenFriends, className: "p-2 rounded-xl hover:bg-white/5 transition", title: "Friends", children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { size: 18 }) }),
      onOpenInbox && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onOpenInbox, className: "p-2 rounded-xl hover:bg-white/5 transition relative", title: "Game Requests", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Inbox, { size: 18 }),
        inboxCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "absolute -top-1 -right-1 text-[9px] font-black px-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full",
            style: { background: "#FFC857", color: "#05070D", boxShadow: "0 0 10px rgba(255,200,87,0.7)" },
            children: inboxCount > 9 ? "9+" : inboxCount
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onLegend, className: "p-2 rounded-xl hover:bg-white/5 transition", title: "Suit legend", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { size: 18 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onAdmin, className: "p-2 rounded-xl hover:bg-white/5 transition", title: "Admin", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { size: 18 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => navigate({ to: "/" }),
          className: "hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/5",
          title: "Back to Home",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 14 }),
            " Back to Home"
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-7xl mx-auto px-4 md:px-6 pt-6 md:pt-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => navigate({ to: "/" }),
          className: "mb-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black text-slate-200 backdrop-blur-md transition hover:bg-white/[0.08] sm:hidden",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 14 }),
            " Back to Home"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "relative rounded-[32px] overflow-hidden border trey-table-rim",
          style: { borderColor: "rgba(0,183,255,0.4)", boxShadow: "0 0 80px rgba(0,183,255,0.18), inset 0 1px 0 rgba(255,255,255,0.06)" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: HERO_IMG, alt: "", className: "w-full h-full object-cover" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0", style: { background: "linear-gradient(180deg, rgba(5,7,13,0.4) 0%, rgba(5,7,13,0.55) 50%, rgba(5,7,13,0.92) 100%)" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0", style: { background: "linear-gradient(90deg, rgba(5,7,13,0.85) 0%, rgba(5,7,13,0.35) 50%, rgba(5,7,13,0.6) 100%)" } })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-4 top-20 hidden sm:block pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-40 h-44", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: "/assets/games/cards/trey-tv-luxury/card-back.png",
                alt: "",
                className: "absolute w-24 rounded-xl trey-card-depth",
                style: {
                  right: `${i * 28}px`,
                  top: `${i * 16}px`,
                  transform: `rotate(${(i - 1) * 11}deg)`,
                  opacity: 0.82
                },
                draggable: false
              },
              i
            )) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative p-6 md:p-12 min-h-[440px] md:min-h-[520px] flex flex-col justify-end", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "inline-flex self-start items-center gap-2 text-[10px] tracking-[0.3em] font-bold mb-4 px-3 py-1.5 rounded-full backdrop-blur-md",
                  style: { background: "rgba(0,183,255,0.12)", border: "1px solid rgba(0,183,255,0.4)", color: "#00B7FF" },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 12 }),
                    " CINEMATIC GAME LOUNGE"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-4xl md:text-7xl font-black leading-[0.95] tracking-tight", children: [
                "Trey TV",
                /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { background: "linear-gradient(90deg,#00B7FF 0%,#A855F7 60%,#FFC857 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }, children: "Game Room" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm md:text-lg text-slate-300 mt-4 max-w-xl leading-relaxed", children: "Classic card games with a Trey TV twist. Real engines, real scoring, live multiplayer rooms with the custom Trey TV deck." }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 mt-7", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => onCreateRoom("spades"),
                    className: "px-6 py-3.5 rounded-2xl font-black text-sm tracking-wide flex items-center gap-2 transition hover:scale-[1.03] active:scale-95",
                    style: { background: "linear-gradient(90deg,#00B7FF,#A855F7)", boxShadow: "0 0 32px rgba(0,183,255,0.5), inset 0 1px 0 rgba(255,255,255,0.25)" },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Spade, { size: 16 }),
                      " Play Spades",
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 16 })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => onCreateRoom(),
                    className: "px-6 py-3.5 rounded-2xl font-bold text-sm tracking-wide border flex items-center gap-2 backdrop-blur-xl transition hover:bg-white/10",
                    style: { borderColor: "rgba(255,200,87,0.55)", color: "#FFC857", background: "rgba(255,200,87,0.08)" },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 16 }),
                      " Create Private Room"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: onJoinRoom,
                    className: "px-6 py-3.5 rounded-2xl font-bold text-sm tracking-wide border flex items-center gap-2 backdrop-blur-xl transition hover:bg-white/5",
                    style: { borderColor: "rgba(255,255,255,0.15)", color: "#F8FAFC", background: "rgba(255,255,255,0.04)" },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { size: 16 }),
                      " Join by Code"
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3 md:gap-6 mt-8 max-w-2xl", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 14 }), label: "Live Engines", value: "3 Games", color: "#00B7FF" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Wifi, { size: 14 }), label: "Realtime Sync", value: "Multiplayer", color: "#A855F7" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { size: 14 }), label: "Flagship", value: "Spades 500", color: "#FFC857" })
              ] })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-3 mt-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(QuickAction, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 18 }), label: "Create Private Room", sub: "Invite friends with a 6-char code", color: "#00B7FF", onClick: () => onCreateRoom() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(QuickAction, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { size: 18 }), label: "Join by Code", sub: "Enter a room code your friend shared", color: "#FFC857", onClick: onJoinRoom }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(QuickAction, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Shuffle, { size: 18 }), label: "Play Truno", sub: "Match colors. Call TRUNO. Own the table.", color: "#D946EF", onClick: () => navigate({ to: "/games/truno" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(QuickAction, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { size: 18 }), label: "Interactive Stories", sub: "Switch Kicks and The God Ram", color: "#D8B4FE", onClick: () => navigate({ to: "/games/interactive-stories" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 18, className: "text-amber-300" }), label: "Featured", sub: "Flagship Game" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          onClick: () => onCreateRoom("spades"),
          className: "relative rounded-[28px] overflow-hidden border cursor-pointer group transition hover:-translate-y-0.5",
          style: { borderColor: "rgba(0,183,255,0.5)", boxShadow: "0 0 60px rgba(0,183,255,0.22)" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: SPADES_IMG, alt: "", className: "w-full h-full object-cover opacity-70 group-hover:opacity-85 group-hover:scale-105 transition-all duration-700" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0", style: { background: "linear-gradient(90deg, rgba(5,7,13,0.96) 0%, rgba(5,7,13,0.55) 55%, rgba(5,7,13,0.2) 100%)" } })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative p-6 md:p-10 min-h-[220px] md:min-h-[280px] flex flex-col justify-end", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.3em] font-bold", style: { color: "#00B7FF" }, children: "FLAGSHIP · 4 PLAYERS · TEAMS" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-4xl md:text-6xl font-black mt-2 tracking-tight", children: "Spades" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm md:text-base text-slate-300 mt-2 max-w-md leading-relaxed", children: [
                "Live 4-player tables, full bidding, real bag scoring. Trump suit: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", style: { color: "#00B7FF" }, children: "Blades" }),
                "."
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mt-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Pill, { children: "Bid · Book · Bag" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Pill, { children: "Teams of 2" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Pill, { children: "To 500 Points" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex flex-wrap gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "span",
                  {
                    className: "inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black tracking-wide",
                    style: { background: "linear-gradient(90deg,#00B7FF,#A855F7)", boxShadow: "0 0 24px rgba(0,183,255,0.45)" },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Spade, { size: 14 }),
                      " Create Spades Room"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      onLaunchSolo("spades");
                    },
                    className: "inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold border",
                    style: { borderColor: "rgba(255,255,255,0.2)", color: "#F8FAFC", background: "rgba(255,255,255,0.05)" },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { size: 14 }),
                      " Solo vs Bots"
                    ]
                  }
                )
              ] })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(InteractiveStoriesSection, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { size: 18, className: "text-cyan-300" }), label: "Choose Game", sub: "Public queue · invite friends · private room" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          GameCard,
          {
            title: "Spades",
            tag: "TRICK-TAKING · 4P",
            desc: "Team strategy. Bids, books, and pressure.",
            color: "#00B7FF",
            img: SPADES_IMG,
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Spade, { size: 16 }),
            needs: 4,
            waiting: queueCounts.spades,
            onJoinQueue: onJoinQueue ? () => onJoinQueue("spades") : void 0,
            onInvite: onOpenFriends,
            onCreate: () => onCreateRoom("spades"),
            onSolo: () => onLaunchSolo("spades")
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          GameCard,
          {
            title: "Blackjack",
            tag: "SOLO TABLE · 1P",
            desc: "Beat the dealer in the neon lounge.",
            color: "#FFC857",
            img: BLACKJACK_IMG,
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { size: 16 }),
            needs: 1,
            waiting: queueCounts.blackjack,
            onJoinQueue: onJoinQueue ? () => onJoinQueue("blackjack") : void 0,
            onInvite: onOpenFriends,
            onCreate: () => onCreateRoom("blackjack"),
            onSolo: () => onLaunchSolo("blackjack")
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          GameCard,
          {
            title: "Bullshit",
            tag: "BLUFFING · 3-4P",
            desc: "Call the bluff before the table flips.",
            color: "#A855F7",
            img: BULLSHIT_IMG,
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 16 }),
            needs: 4,
            waiting: queueCounts.bullshit,
            onJoinQueue: onJoinQueue ? () => onJoinQueue("bullshit") : void 0,
            onInvite: onOpenFriends,
            onCreate: () => onCreateRoom("bullshit"),
            onSolo: () => onLaunchSolo("bullshit")
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TrunoGameCard, { onClick: () => navigate({ to: "/games/truno" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 18, className: "text-purple-300" }), label: "How It Works", sub: "Three steps to the table" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3", children: [
        { n: "01", t: "Create or Join", d: "Spin up a private room or enter a friend's 6-character code.", c: "#00B7FF" },
        { n: "02", t: "Fill the Table", d: "Bots auto-fill empty seats so you start fast — no waiting.", c: "#A855F7" },
        { n: "03", t: "Play Live", d: "Realtime sync. Reconnect anytime — your seat is saved.", c: "#FFC857" }
      ].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "rounded-3xl p-5 border backdrop-blur-md transition hover:-translate-y-0.5",
          style: { background: "rgba(8,17,31,0.65)", borderColor: s.c + "30", boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 0 30px ${s.c}10` },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-black tracking-tight", style: { color: s.c, textShadow: `0 0 16px ${s.c}80` }, children: s.n }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px flex-1", style: { background: `linear-gradient(90deg, ${s.c}60, transparent)` } })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-black text-lg", children: s.t }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-400 mt-1.5 leading-relaxed", children: s.d })
          ]
        },
        s.n
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SectionTitle,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Spade, { size: 14, className: "text-cyan-300" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { size: 14, className: "text-rose-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Diamond, { size: 14, className: "text-amber-300" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Club, { size: 14, className: "text-emerald-400" })
          ] }),
          label: "Custom Trey TV Deck",
          sub: "Cinematic suits, accurate rules"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "rounded-3xl border p-5 md:p-6 backdrop-blur-md",
          style: { background: "rgba(8,17,31,0.65)", borderColor: "rgba(168,85,247,0.3)", boxShadow: "0 0 40px rgba(168,85,247,0.10)" },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0",
                style: { background: "rgba(168,85,247,0.18)", border: "1px solid rgba(168,85,247,0.4)" },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 20, className: "text-purple-300" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-black text-base md:text-lg", children: "Suit Identity, Reimagined" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs md:text-sm text-slate-300 mt-1.5 leading-relaxed", children: [
                "Spades use the ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-cyan-300", children: "Blades" }),
                " suit, Hearts use ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-rose-300", children: "Soul" }),
                ", Diamonds use ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-amber-300", children: "Crowns" }),
                ", and Clubs use ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-emerald-300", children: "Sparks" }),
                ". Gameplay rules stay 100% accurate — just the artwork is cinematic."
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-2 mt-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SuitChip, { name: "Blades", plays: "Spades", color: "#00B7FF" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SuitChip, { name: "Soul", plays: "Hearts", color: "#F472B6" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SuitChip, { name: "Crowns", plays: "Diamonds", color: "#FFC857" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SuitChip, { name: "Sparks", plays: "Clubs", color: "#22C55E" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: onLegend,
                  className: "mt-5 text-xs px-4 py-2 rounded-full font-bold inline-flex items-center gap-1.5",
                  style: { background: "rgba(168,85,247,0.2)", border: "1px solid rgba(168,85,247,0.45)", color: "#C4A6FF" },
                  children: [
                    "View Full Legend ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 12 })
                  ]
                }
              )
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-slate-500 mt-10 text-center max-w-md mx-auto leading-relaxed", children: "Free-play entertainment only. No real-money wagering, deposits, withdrawals, or cash prizes." })
    ] })
  ] });
};
const Stat = ({ icon, label, value, color }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl p-3 backdrop-blur-md border trey-glass-panel", style: { borderColor: color + "30" }, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-[10px] tracking-widest font-bold", style: { color }, children: [
    icon,
    " ",
    label.toUpperCase()
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm md:text-base font-black mt-1 truncate", children: value })
] });
const SectionTitle = ({ icon, label, sub }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 md:mt-14 mb-4 flex items-end justify-between gap-3", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.3em] font-bold text-slate-500", children: sub.toUpperCase() }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-2xl md:text-3xl font-black flex items-center gap-2 tracking-tight", children: [
      icon,
      " ",
      label
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px flex-1 max-w-xs", style: { background: "linear-gradient(90deg, transparent, rgba(0,183,255,0.4), transparent)" } })
] });
const Pill = ({ children }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "span",
  {
    className: "text-[10px] tracking-wider font-bold px-2.5 py-1 rounded-full backdrop-blur-md",
    style: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#CBD5E1" },
    children
  }
);
const SuitChip = ({ name, plays, color }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl p-2.5 border", style: { background: "rgba(5,7,13,0.6)", borderColor: color + "40" }, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-black", style: { color }, children: name }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-slate-400", children: [
    "plays as ",
    plays
  ] })
] });
const QuickAction = ({ icon, label, sub, color, onClick }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  "button",
  {
    onClick,
    className: "rounded-2xl p-4 border text-left cursor-pointer hover:bg-white/[0.04] transition-all hover:-translate-y-0.5 backdrop-blur-md group",
    style: { borderColor: color + "35", boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04)` },
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-xl flex items-center justify-center", style: { background: color + "18", border: "1px solid " + color + "40", color }, children: icon }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-black text-sm", children: label })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 16, className: "text-slate-500 group-hover:translate-x-0.5 transition" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-slate-400 mt-1.5 ml-10", children: sub })
    ]
  }
);
const GameCard = ({ title, tag, desc, color, img, icon, needs, waiting, onCreate, onSolo, onJoinQueue, onInvite }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  "div",
  {
    className: "rounded-[26px] overflow-hidden border transition-all hover:-translate-y-1 group backdrop-blur-md trey-game-tile-surface",
    style: { background: "rgba(8,17,31,0.7)", borderColor: color + "50", boxShadow: `0 0 40px ${color}20, inset 0 1px 0 rgba(255,255,255,0.05)` },
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-40 overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: img, alt: "", className: "w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0", style: { background: `linear-gradient(180deg, transparent 0%, rgba(8,17,31,0.4) 50%, rgba(8,17,31,0.98) 100%)` } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute top-3 left-3 text-[10px] tracking-[0.25em] font-black px-2.5 py-1 rounded-md backdrop-blur-md",
            style: { background: color + "25", color, border: "1px solid " + color + "60" },
            children: tag
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute bottom-3 right-3 w-10 h-10 rounded-2xl flex items-center justify-center backdrop-blur-md",
            style: { background: color + "20", border: "1px solid " + color + "60", color, boxShadow: `0 0 18px ${color}40` },
            children: icon
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "absolute top-3 right-3 inline-flex items-center gap-1.5 text-[10px] font-black px-2 py-1 rounded-full backdrop-blur-md",
            style: { background: "rgba(5,7,13,0.7)", border: "1px solid " + color + "55", color },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full animate-pulse", style: { background: color, boxShadow: `0 0 6px ${color}` } }),
              waiting,
              " waiting"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-4 left-4 h-20 w-28 pointer-events-none opacity-90 group-hover:translate-y-[-3px] transition-transform duration-500", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: "/assets/games/cards/trey-tv-luxury/card-back.png",
            alt: "",
            className: "absolute h-20 rounded-lg trey-card-depth",
            style: {
              left: `${i * 18}px`,
              transform: `rotate(${(i - 1) * 9}deg)`,
              boxShadow: `0 8px 16px rgba(0,0,0,0.45), 0 0 16px ${color}22`
            },
            draggable: false
          },
          i
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-black text-2xl tracking-tight", children: title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] font-bold text-slate-500 mt-1.5", children: [
            "Needs ",
            needs,
            "P"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-400 mb-4 mt-1 leading-relaxed", children: desc }),
        onJoinQueue && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: onJoinQueue,
            className: "w-full text-xs font-black px-3 py-2.5 rounded-2xl transition hover:brightness-110 inline-flex items-center justify-center gap-2 mb-2",
            style: { background: `linear-gradient(90deg, ${color}, ${color}CC)`, color: "#05070D", boxShadow: `0 0 24px ${color}55` },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 13 }),
              " Join Queue"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          onInvite && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: onInvite,
              className: "flex-1 text-[11px] font-bold px-2 py-2 rounded-full border transition hover:bg-white/5 inline-flex items-center justify-center gap-1.5",
              style: { borderColor: color + "50", color },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { size: 11 }),
                " Invite"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: onCreate,
              className: "flex-1 text-[11px] font-bold px-2 py-2 rounded-full border transition hover:bg-white/5",
              style: { borderColor: "rgba(255,255,255,0.15)", color: "#CBD5E1" },
              children: "Private Room"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: onSolo,
              className: "flex-1 text-[11px] font-bold px-2 py-2 rounded-full border transition hover:bg-white/5",
              style: { borderColor: "rgba(255,255,255,0.12)", color: "#94A3B8" },
              children: "Solo"
            }
          )
        ] })
      ] })
    ]
  }
);
const TrunoGameCard = ({ onClick }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  "div",
  {
    onClick,
    className: "rounded-[26px] overflow-hidden border transition-all hover:-translate-y-1 group backdrop-blur-md cursor-pointer",
    style: {
      background: "rgba(8,17,31,0.7)",
      borderColor: "#D946EF50",
      boxShadow: "0 0 40px #D946EF20, inset 0 1px 0 rgba(255,255,255,0.05)"
    },
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-40 overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: TRUNO_IMG, alt: "Truno", className: "w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0", style: { background: "linear-gradient(180deg, transparent 0%, rgba(8,17,31,0.4) 50%, rgba(8,17,31,0.98) 100%)" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute top-3 left-3 text-[10px] tracking-[0.25em] font-black px-2.5 py-1 rounded-md backdrop-blur-md",
            style: { background: "#D946EF25", color: "#D946EF", border: "1px solid #D946EF60" },
            children: "COLOR MATCH · 2-8P"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute top-3 right-3 text-[10px] tracking-[0.25em] font-black px-2.5 py-1 rounded-md backdrop-blur-md",
            style: { background: "rgba(5,7,13,0.7)", color: "#D946EF", border: "1px solid #D946EF55" },
            children: "🆕 NEW"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute bottom-3 right-3 w-10 h-10 rounded-2xl flex items-center justify-center backdrop-blur-md text-lg",
            style: { background: "#D946EF20", border: "1px solid #D946EF60", boxShadow: "0 0 18px #D946EF40" },
            children: "🌀"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-black text-2xl tracking-tight", children: "Truno" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold text-slate-500 mt-1.5", children: "2–8 Players" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-400 mb-4 mt-1 leading-relaxed", children: "Trey TV's original card game. Match colors, stack action cards, and call TRUNO when you're down to one." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            className: "w-full text-xs font-black px-3 py-2.5 rounded-2xl transition hover:brightness-110 inline-flex items-center justify-center gap-2",
            style: {
              background: "linear-gradient(90deg, #D946EF, #A855F7)",
              color: "#fff",
              boxShadow: "0 0 24px #D946EF55"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Shuffle, { size: 13 }),
              " Play Truno"
            ]
          }
        )
      ] })
    ]
  }
);
const CARD_BACK_URL = "/assets/games/cards/trey-tv-luxury/card-back.png";
let _sharedBack = null;
let _backLoading = null;
async function loadCardBack() {
  if (_sharedBack) return _sharedBack;
  if (_backLoading) return _backLoading;
  _backLoading = Assets.load(CARD_BACK_URL).then((t) => {
    _sharedBack = t;
    return t;
  }).catch(() => null);
  return _backLoading;
}
const SUIT_DIRS = {
  S: "blades",
  H: "soul",
  D: "flame",
  C: "keys"
};
function cardIdToUrl(cardId) {
  if (!cardId || cardId.length < 2) return null;
  const suit = cardId.slice(-1).toUpperCase();
  const rank = cardId.slice(0, -1).toUpperCase();
  const dir = SUIT_DIRS[suit];
  if (!dir) return null;
  return `/assets/games/cards/trey-tv-luxury/${dir}/${rank}${suit}.png`;
}
async function loadCardFaces(cardIds) {
  const result = /* @__PURE__ */ new Map();
  const toLoad = cardIds.filter((id) => cardIdToUrl(id) !== null);
  await Promise.all(
    toLoad.map(async (id) => {
      const url = cardIdToUrl(id);
      try {
        const t = await Assets.load(url);
        result.set(id, t);
      } catch {
      }
    })
  );
  return result;
}
const BOT_PROFILES = [
  {
    name: "Aaliyah",
    skin: "#C17F4C",
    hair: "#2a1206",
    hairStyle: "afro",
    bgFrom: "#3d1a50",
    bgTo: "#1a0a2a",
    ring: "#FFC857"
  },
  {
    name: "Marcus",
    skin: "#3E2010",
    hair: "#0a0808",
    hairStyle: "short",
    bgFrom: "#081828",
    bgTo: "#020810",
    ring: "#00B7FF"
  },
  {
    name: "Jamal",
    skin: "#8B5E3C",
    hair: "#160804",
    hairStyle: "natural",
    bgFrom: "#082018",
    bgTo: "#020a08",
    ring: "#22D3EE"
  },
  {
    name: "Zion",
    skin: "#C8954A",
    hair: "#1e0a32",
    hairStyle: "mohawk",
    bgFrom: "#1a0a3a",
    bgTo: "#0a0520",
    ring: "#A855F7"
  },
  {
    name: "Nova",
    skin: "#E8B98A",
    hair: "#1a0616",
    hairStyle: "long",
    bgFrom: "#2a0a1a",
    bgTo: "#120508",
    ring: "#EC4899"
  },
  {
    name: "Drei",
    skin: "#4A2610",
    hair: "#0a1a0c",
    hairStyle: "braids",
    bgFrom: "#081a0c",
    bgTo: "#020a04",
    ring: "#22C55E"
  },
  {
    name: "Lyric",
    skin: "#C99A6E",
    hair: "#1e0806",
    hairStyle: "waves",
    bgFrom: "#2a0c06",
    bgTo: "#140402",
    ring: "#F97316"
  },
  {
    name: "Sage",
    skin: "#2E1408",
    hair: "#0a1208",
    hairStyle: "locs",
    bgFrom: "#0a1a0a",
    bgTo: "#040a04",
    ring: "#84CC16"
  },
  {
    name: "Dealer",
    skin: "#8B7355",
    hair: "#1a1206",
    hairStyle: "short",
    bgFrom: "#1a1206",
    bgTo: "#0a0804",
    ring: "#FFC857"
  },
  {
    name: "Player",
    skin: "#C17F4C",
    hair: "#0a0a0a",
    hairStyle: "short",
    bgFrom: "#081828",
    bgTo: "#020810",
    ring: "#00B7FF"
  }
];
function getBotProfile(name) {
  const found = BOT_PROFILES.find((p) => p.name === name);
  if (found) return found;
  const hash = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return BOT_PROFILES[hash % BOT_PROFILES.length];
}
const SIZES = {
  // 'sm' = opponent seats
  sm: { dim: "clamp(46px, 12vw, 56px)", namePx: "clamp(9px, 2.4vw, 12px)", statusPx: "clamp(8px, 2vw, 10px)" },
  // 'md' = user/player seat
  md: { dim: "clamp(54px, 14vw, 66px)", namePx: "clamp(10px, 2.7vw, 13px)", statusPx: "clamp(9px, 2.2vw, 11px)" },
  // 'lg' = dealer (Blackjack)
  lg: { dim: "clamp(50px, 13vw, 60px)", namePx: "clamp(10px, 2.5vw, 12px)", statusPx: "clamp(8px, 2.2vw, 10px)" }
};
function renderHairSvg(style, hair) {
  switch (style) {
    case "afro":
      return /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M11 31C8 20 14 9 25 8c2-5 12-6 16-1 11 1 17 10 14 23-4-6-10-9-23-9-12 0-18 4-21 10Z", fill: hair });
    case "short":
      return /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M16 26C16 13 25 8 33 8c9 0 16 6 16 18-8-5-22-6-33 0Z", fill: hair });
    case "natural":
      return /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 29C10 16 18 7 32 7s22 9 20 22c-10-8-28-8-40 0Z", fill: hair });
    case "mohawk":
      return /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M27 5c4-2 8-2 11 0l-1 25H26L27 5Z", fill: hair });
    case "long":
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M14 57C8 36 12 8 32 8s24 28 18 49H14Z", fill: hair }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M16 29C19 14 43 14 48 29c-10-7-22-8-32 0Z", fill: "rgba(255,255,255,0.10)" })
      ] });
    case "braids":
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M15 26C17 13 24 8 32 8s15 5 17 18c-8-5-25-5-34 0Z", fill: hair }),
        [18, 24, 30, 36, 42].map((x) => /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x, y: "13", width: "4", height: "34", rx: "2", fill: hair }, x))
      ] });
    case "waves":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "path",
        {
          d: "M13 25 Q18 13 25 22 Q31 30 38 22 Q44 13 51 25 L51 13 Q42 7 32 7 Q22 7 13 13 Z",
          fill: hair
        }
      );
    case "locs":
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M15 27C17 14 24 8 32 8s15 6 17 19c-8-6-25-6-34 0Z", fill: hair }),
        [18, 25, 32, 39, 46].map((x, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x, y: 14 + i % 2 * 2, width: "5", height: "32", rx: "2.5", fill: hair }, x))
      ] });
    default:
      return /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M16 26C17 14 25 8 32 8c9 0 15 6 16 18-8-5-23-5-32 0Z", fill: hair });
  }
}
function BotAvatarSvg({ profile }) {
  const uid = reactExports.useId().replace(/:/g, "_");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      viewBox: "0 0 64 64",
      width: "100%",
      height: "100%",
      xmlns: "http://www.w3.org/2000/svg",
      style: { display: "block" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("defs", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("radialGradient", { id: `bg_${uid}`, cx: "45%", cy: "35%", r: "75%", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: profile.bgFrom }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: profile.bgTo })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: `skin_${uid}`, x1: "22", y1: "18", x2: "44", y2: "55", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "#fff6e8", stopOpacity: "0.28" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "36%", stopColor: profile.skin }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "#140806", stopOpacity: "0.46" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: `suit_${uid}`, x1: "18", y1: "50", x2: "47", y2: "64", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "#0c1628" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "#05070d" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("filter", { id: `soft_${uid}`, x: "-20%", y: "-20%", width: "140%", height: "140%", children: /* @__PURE__ */ jsxRuntimeExports.jsx("feDropShadow", { dx: "0", dy: "5", stdDeviation: "4", floodColor: "#000", floodOpacity: "0.55" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("clipPath", { id: `clip_${uid}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "32", cy: "32", r: "31.5" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { clipPath: `url(#clip_${uid})`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "32", cy: "32", r: "32", fill: `url(#bg_${uid})` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "18", cy: "14", r: "18", fill: "#fff", opacity: "0.09" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M13 64c2-11 10-17 19-17s17 6 19 17H13Z", fill: `url(#suit_${uid})`, filter: `url(#soft_${uid})` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M23 49h18l-3 10H26l-3-10Z", fill: profile.skin, opacity: "0.92" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { filter: `url(#soft_${uid})`, children: [
            renderHairSvg(profile.hairStyle, profile.hair),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "path",
              {
                d: "M19 32c0-12 5-20 13-20s13 8 13 20c0 11-5 20-13 20S19 43 19 32Z",
                fill: `url(#skin_${uid})`
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M20 31c1-8 5-14 12-14s11 6 12 14c-7-4-16-4-24 0Z", fill: profile.hair, opacity: "0.88" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M25 35c2-1 4-1 6 0M34 35c2-1 4-1 6 0", stroke: "#120806", strokeWidth: "1.5", strokeLinecap: "round", opacity: "0.62" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "28", cy: "38", r: "1.35", fill: "#080606" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "37", cy: "38", r: "1.35", fill: "#080606" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M32 38.5c-1.2 2.8-1.1 4.1 1 4.4", stroke: "#2a120c", strokeWidth: "1", strokeLinecap: "round", fill: "none", opacity: "0.45" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M28 46c2.6 1.7 5.4 1.7 8 0", stroke: "#2a0d0d", strokeWidth: "1.2", strokeLinecap: "round", fill: "none", opacity: "0.7" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M21 27c4-5 8-7 12-7", stroke: "#fff", strokeWidth: "1.4", strokeLinecap: "round", opacity: "0.12" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M6 54C18 58 45 58 58 54v10H6V54Z", fill: "#000", opacity: "0.18" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "32", cy: "32", r: "31", fill: "none", stroke: profile.ring, strokeWidth: "1", strokeOpacity: "0.16" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "32", cy: "32", r: "30.5", fill: "none", stroke: profile.ring, strokeWidth: "1.8", strokeOpacity: "0.62" })
      ]
    }
  );
}
const TURN_COLOR = "#FFC857";
const GamePlayerSeat = ({
  displayName,
  avatarUrl,
  publicProfileUid,
  isBot = false,
  isCurrentTurn = false,
  isDealer = false,
  bid,
  tricks,
  cardCount,
  accentColor = "#00B7FF",
  size = "md",
  position,
  winFlash = false
}) => {
  const sz = SIZES[size];
  const ringColor = isCurrentTurn ? TURN_COLOR : accentColor;
  const borderWidth = isCurrentTurn ? 3 : 1.5;
  const ringGlow = isCurrentTurn ? `0 0 16px ${TURN_COLOR}CC, 0 0 32px ${TURN_COLOR}60` : `0 0 10px ${accentColor}50`;
  const initials = displayName.split(" ").map((w) => w[0] ?? "").join("").slice(0, 2).toUpperCase();
  const botProfile = isBot ? getBotProfile(displayName) : void 0;
  const profileHref = !isBot && publicProfileUid ? `/u/${encodeURIComponent(publicProfileUid)}` : null;
  const Wrapper = profileHref ? "a" : "div";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Wrapper,
    {
      ...profileHref ? { href: profileHref, onClick: (event) => event.stopPropagation() } : {},
      "data-game-player-seat": true,
      "data-seat-name": displayName,
      "data-seat-bot": isBot ? "true" : "false",
      "data-seat-position": position,
      style: {
        textDecoration: "none",
        cursor: profileHref ? "pointer" : "default",
        pointerEvents: profileHref ? "auto" : "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        userSelect: "none"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative", flexShrink: 0, width: sz.dim, height: sz.dim }, children: [
          isCurrentTurn && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "neon-ring-soft", "aria-hidden": true }),
          isCurrentTurn && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "neon-ring", "aria-hidden": true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              style: {
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                border: winFlash ? `2px solid transparent` : `${borderWidth}px solid ${ringColor}`,
                boxShadow: winFlash ? void 0 : isCurrentTurn ? void 0 : ringGlow,
                background: winFlash ? `conic-gradient(from 0deg, oklch(0.92 0.18 88), oklch(0.84 0.14 82), oklch(0.96 0.10 88), oklch(0.84 0.14 82), oklch(0.92 0.18 88)) border-box` : "#05070D",
                overflow: "hidden",
                position: "relative",
                transition: "border-color 0.25s, box-shadow 0.25s"
              },
              children: avatarUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: avatarUrl,
                  alt: displayName,
                  style: {
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center top",
                    display: "block"
                  }
                }
              ) : botProfile ? /* @__PURE__ */ jsxRuntimeExports.jsx(BotAvatarSvg, { profile: botProfile }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  style: {
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: `linear-gradient(135deg, ${accentColor}28, ${accentColor}0e)`,
                    fontSize: sz.namePx,
                    fontWeight: 900,
                    color: accentColor,
                    letterSpacing: "-0.02em"
                  },
                  children: initials
                }
              )
            }
          ),
          isDealer && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              style: {
                position: "absolute",
                top: -3,
                right: -3,
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "radial-gradient(circle, #FFC857, #C99326)",
                border: "1.5px solid rgba(255,200,87,0.9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 9,
                fontWeight: 900,
                color: "#1A1206",
                boxShadow: "0 0 8px rgba(255,200,87,0.7), inset 0 1px 0 rgba(255,255,255,0.4)",
                zIndex: 2
              },
              children: "D"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            style: {
              fontSize: sz.namePx,
              fontWeight: 700,
              color: isCurrentTurn ? TURN_COLOR : "#CBD5E1",
              maxWidth: `calc(${sz.dim} + 20px)`,
              textAlign: "center",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              lineHeight: 1.2,
              textShadow: isCurrentTurn ? `0 0 10px ${TURN_COLOR}99` : "0 1px 4px rgba(0,0,0,0.95)",
              transition: "color 0.25s, text-shadow 0.25s",
              background: "var(--glass)",
              border: "1px solid var(--glass-border)",
              backdropFilter: "blur(14px) saturate(140%)",
              WebkitBackdropFilter: "blur(14px) saturate(140%)",
              padding: "2.5px 8px",
              borderRadius: 999
            },
            children: displayName.split(" ")[0]
          }
        ),
        bid !== null && bid !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            style: {
              fontSize: sz.statusPx,
              color: "#64748B",
              fontWeight: 700,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
              textShadow: "0 1px 2px rgba(0,0,0,0.8)"
            },
            children: `B${bid}·T${tricks ?? 0}`
          }
        ),
        cardCount !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            style: {
              fontSize: sz.statusPx,
              color: "#64748B",
              fontWeight: 700,
              lineHeight: 1,
              textShadow: "0 1px 2px rgba(0,0,0,0.8)"
            },
            children: [
              cardCount,
              " cards"
            ]
          }
        )
      ]
    }
  );
};
const TreyCard = ({ cardId, faceDown, selected, isLegal = true, onClick, style }) => {
  const faceUrl = faceDown ? null : cardIdToUrl(cardId);
  const suit = cardId.slice(-1).toUpperCase();
  const rank = cardId.slice(0, -1).toUpperCase();
  const isRed = suit === "H" || suit === "D";
  const SUIT_GLYPH = { S: "♠", H: "♥", D: "♦", C: "♣" };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      onClick,
      style: {
        position: "relative",
        width: 60,
        height: 86,
        borderRadius: 10,
        overflow: "hidden",
        background: faceDown ? "radial-gradient(120% 90% at 50% 0%, oklch(0.18 0.08 285) 0%, oklch(0.09 0.04 282) 55%, oklch(0.04 0.015 280) 100%)" : "linear-gradient(160deg, #0d1124 0%, #060910 100%)",
        boxShadow: selected ? "0 0 26px var(--neon-cyan), 0 0 52px oklch(0.84 0.16 215 / 0.35), 0 16px 32px rgba(0,0,0,0.75)" : "0 10px 24px -8px rgba(0,0,0,0.7), 0 2px 6px rgba(0,0,0,0.5)",
        opacity: !isLegal && !selected ? 0.45 : 1,
        cursor: onClick ? "pointer" : "default",
        transition: "opacity 0.2s",
        flexShrink: 0,
        ...style
      },
      children: [
        faceDown ? (
          // Card back with official Trey TV card-back image
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: "/assets/games/cards/trey-tv-luxury/card-back.png",
              alt: "",
              style: { width: "100%", height: "100%", objectFit: "cover", display: "block" }
            }
          )
        ) : faceUrl ? (
          // Official Trey TV luxury card face
          /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: faceUrl,
                alt: `${rank}${SUIT_GLYPH[suit] ?? suit}`,
                style: { width: "100%", height: "100%", objectFit: "cover", display: "block" }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.18) 100%)",
              pointerEvents: "none"
            } })
          ] })
        ) : (
          // Fallback: procedural card (no face image)
          /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
              position: "absolute",
              top: 4,
              left: 5,
              fontSize: 12,
              fontWeight: 700,
              lineHeight: 1,
              color: isRed ? "#e44" : "#b5c7f5",
              fontFamily: "Georgia, 'Times New Roman', serif",
              textShadow: isRed ? "0 0 6px #f44" : "0 0 6px #88aaff"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: rank }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 10, marginTop: 1 }, children: SUIT_GLYPH[suit] ?? suit })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              color: isRed ? "#e44" : "#b5c7f5",
              textShadow: isRed ? "0 0 10px #f44" : "0 0 10px #88aaff"
            }, children: SUIT_GLYPH[suit] ?? suit }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
              position: "absolute",
              bottom: 4,
              right: 5,
              transform: "rotate(180deg)",
              fontSize: 12,
              fontWeight: 700,
              lineHeight: 1,
              color: isRed ? "#e44" : "#b5c7f5",
              fontFamily: "Georgia, 'Times New Roman', serif"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: rank }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 10, marginTop: 1 }, children: SUIT_GLYPH[suit] ?? suit })
            ] })
          ] })
        ),
        selected && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "selected-card-glow", "aria-hidden": true })
      ]
    }
  );
};
const AVATAR_SEAT_NORM = {
  bottom: { x: 0.5, y: 0.9 },
  left: { x: 0.16, y: 0.4 },
  top: { x: 0.5, y: 0.12 },
  right: { x: 0.84, y: 0.4 }
};
function buildLayout(w, h) {
  const cardH = Math.min(h * 0.2, 110);
  const cardW = cardH * 0.714;
  return {
    w,
    h,
    cx: w / 2,
    cy: h / 2,
    cardW,
    cardH,
    cardRadius: cardW * 0.1
  };
}
function seatCenter(seat, layout, bottomSeat = 0) {
  const rotated = (seat - bottomSeat + 4) % 4;
  const { w, h } = layout;
  switch (rotated) {
    case 0:
      return { x: w * 0.5, y: h * 0.73 };
    // bottom hand lane, above player rail
    case 1:
      return { x: w * 0.29, y: h * 0.42 };
    // left stack tied to left seat
    case 2:
      return { x: w * 0.5, y: h * 0.25 };
    // top stack below top seat
    case 3:
      return { x: w * 0.71, y: h * 0.42 };
    // right stack tied to right seat
    default:
      return { x: w / 2, y: h / 2 };
  }
}
function fanLayout(count, cardW, maxWidth, liftBase = 0) {
  if (count === 0) return [];
  const spacing = Math.min(cardW * 0.72, maxWidth / Math.max(count, 1));
  const totalWidth = spacing * (count - 1);
  const maxRotDeg = Math.min(3.5, 28 / Math.max(count, 1));
  return Array.from({ length: count }, (_, i) => {
    const t = count > 1 ? i / (count - 1) * 2 - 1 : 0;
    return {
      dx: -totalWidth / 2 + i * spacing,
      dy: -liftBase + Math.abs(t) * liftBase * 0.4,
      rotation: t * maxRotDeg * (Math.PI / 180)
    };
  });
}
async function fetchChatMessages(roomId, sinceIso) {
  let q = supabase.from("chat_messages").select("*").eq("room_id", roomId).order("created_at", { ascending: true }).limit(200);
  if (sinceIso) q = q.gt("created_at", sinceIso);
  const { data, error } = await q;
  if (error) {
    console.warn("fetchChatMessages failed", error);
    return [];
  }
  return data || [];
}
async function sendChatMessage(opts) {
  const body = (opts.body || "").trim().slice(0, 280);
  if (!body) return null;
  const { data, error } = await supabase.from("chat_messages").insert({
    room_id: opts.roomId,
    user_id: opts.userId,
    display_name: opts.displayName,
    seat_index: opts.seatIndex,
    body,
    kind: opts.kind || "text"
  }).select().single();
  if (error) {
    console.warn("sendChatMessage failed", error);
    return null;
  }
  return data;
}
function useChat({ roomId, identity, mySeat, isOpen, pollMs = 2e3 }) {
  const [messages, setMessages] = reactExports.useState([]);
  const [unread, setUnread] = reactExports.useState(0);
  const [loading, setLoading] = reactExports.useState(true);
  const lastSeenRef = reactExports.useRef(null);
  const lastFetchedAtRef = reactExports.useRef(null);
  const cancelledRef = reactExports.useRef(false);
  const openRef = reactExports.useRef(isOpen);
  openRef.current = isOpen;
  const refresh = reactExports.useCallback(async () => {
    if (!roomId) return;
    try {
      const since = lastFetchedAtRef.current ?? void 0;
      const incoming = await fetchChatMessages(roomId, since);
      if (cancelledRef.current) return;
      if (!incoming.length) {
        setLoading(false);
        return;
      }
      setMessages((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        const merged = [...prev];
        for (const m of incoming) if (!seen.has(m.id)) merged.push(m);
        merged.sort((a, b) => a.created_at.localeCompare(b.created_at));
        return merged.slice(-200);
      });
      const newest = incoming[incoming.length - 1];
      lastFetchedAtRef.current = newest.created_at;
      if (!openRef.current && identity) {
        const others = incoming.filter((m) => m.user_id !== identity.userId);
        if (others.length) setUnread((u) => u + others.length);
      } else if (openRef.current) {
        lastSeenRef.current = newest.created_at;
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [roomId, identity]);
  reactExports.useEffect(() => {
    cancelledRef.current = false;
    setMessages([]);
    setUnread(0);
    lastSeenRef.current = null;
    lastFetchedAtRef.current = null;
    setLoading(!!roomId);
    if (!roomId) return;
    refresh();
    const t = setInterval(refresh, pollMs);
    return () => {
      cancelledRef.current = true;
      clearInterval(t);
    };
  }, [roomId, refresh, pollMs]);
  reactExports.useEffect(() => {
    if (isOpen) {
      setUnread(0);
      if (messages.length) lastSeenRef.current = messages[messages.length - 1].created_at;
    }
  }, [isOpen, messages]);
  const send = reactExports.useCallback(async (body, kind = "text") => {
    if (!roomId || !identity) return;
    const row = await sendChatMessage({
      roomId,
      userId: identity.userId,
      displayName: identity.displayName,
      seatIndex: mySeat,
      body,
      kind
    });
    if (row) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === row.id)) return prev;
        const next = [...prev, row].sort((a, b) => a.created_at.localeCompare(b.created_at));
        return next.slice(-200);
      });
      lastFetchedAtRef.current = row.created_at;
      lastSeenRef.current = row.created_at;
    }
  }, [roomId, identity, mySeat]);
  const markRead = reactExports.useCallback(() => {
    setUnread(0);
    if (messages.length) lastSeenRef.current = messages[messages.length - 1].created_at;
  }, [messages]);
  return { messages, unread, loading, send, markRead };
}
const SEAT_ACCENTS = ["#00B7FF", "#A855F7", "#FFC857", "#22C55E"];
const QUICK_PHRASES = ["Nice play", "GG", "BS!", "My bag", "One sec", "Let’s run it"];
const QUICK_EMOJI = ["👏", "🔥", "💀", "😂", "🤝", "🫡"];
function timeAgo$1(iso) {
  const t = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - t);
  const s = Math.floor(diff / 1e3);
  if (s < 5) return "now";
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}
const ChatHeaderButton = ({ unread, onClick, accent = "#00B7FF" }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  "button",
  {
    onClick,
    className: "relative w-10 h-10 rounded-lg hover:bg-white/5 transition border border-white/5 inline-flex items-center justify-center",
    "aria-label": "Open chat",
    title: "Chat",
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 16 }),
      unread > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          className: "absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[9px] font-black tabular-nums leading-none",
          style: {
            background: `linear-gradient(135deg, ${accent}, #fff2)`,
            color: "#fff",
            border: `1px solid ${accent}`,
            boxShadow: `0 0 10px ${accent}aa`
          },
          children: unread > 99 ? "99+" : unread
        }
      )
    ]
  }
);
const GameChatDrawer = ({
  open,
  onClose,
  messages,
  loading,
  myUserId,
  mySeat,
  onSend,
  accent = "#00B7FF"
}) => {
  const [draft, setDraft] = reactExports.useState("");
  const scrollRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (el) requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [open, messages.length]);
  const grouped = reactExports.useMemo(() => {
    return messages;
  }, [messages]);
  const submit = () => {
    const v = draft.trim();
    if (!v) return;
    setDraft("");
    onSend(v, "text");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        onClick: onClose,
        className: "fixed inset-0 z-40 transition-opacity",
        style: {
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(4px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none"
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "aside",
      {
        className: "fixed left-0 right-0 bottom-0 z-50 mx-auto w-full max-w-md text-white",
        style: {
          transform: open ? "translateY(0)" : "translateY(102%)",
          transition: "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)",
          paddingBottom: "env(safe-area-inset-bottom)"
        },
        "aria-hidden": !open,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "rounded-t-3xl overflow-hidden border-t border-x relative flex flex-col trey-chat-drawer",
            style: {
              borderColor: `${accent}55`,
              boxShadow: `0 -28px 60px rgba(0,0,0,0.65), 0 -8px 36px ${accent}33, inset 0 1px 0 rgba(255,255,255,0.06)`,
              maxHeight: "78dvh"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "absolute inset-x-0 top-0 h-px",
                  style: { background: `linear-gradient(90deg, transparent, ${accent}, #A855F7, transparent)` }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2 pb-1 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1 w-10 rounded-full", style: { background: "rgba(255,255,255,0.18)" } }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-2 flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "w-7 h-7 rounded-xl flex items-center justify-center",
                    style: {
                      background: `linear-gradient(135deg, ${accent}33, ${accent}11)`,
                      border: `1px solid ${accent}66`,
                      boxShadow: `0 0 14px ${accent}55, inset 0 1px 0 rgba(255,255,255,0.08)`
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 14, style: { color: accent } })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.3em] font-black", style: { color: accent }, children: "TABLE CHAT" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-slate-400 leading-tight", children: "Live · room-only" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: onClose,
                    className: "p-1.5 rounded-lg hover:bg-white/5 transition border border-white/5",
                    "aria-label": "Close chat",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 16 })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  ref: scrollRef,
                  className: "flex-1 overflow-y-auto px-3 py-2 space-y-1.5",
                  style: { minHeight: "180px", maxHeight: "48dvh" },
                  children: [
                    loading && messages.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-xs text-slate-500 py-6", children: "Loading chat…" }),
                    !loading && messages.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center text-xs text-slate-500 py-6", children: [
                      "Be the first to talk trash. Or say ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cyan-300", children: "“GG”" }),
                      "."
                    ] }),
                    grouped.map((m) => {
                      const isMine = m.user_id === myUserId;
                      const seatColor = m.seat_index != null ? SEAT_ACCENTS[m.seat_index % SEAT_ACCENTS.length] : "#94A3B8";
                      const initial = (m.display_name || "?").charAt(0).toUpperCase();
                      const isEmojiOnly = m.kind === "emoji" || m.body.length <= 4 && new RegExp("^\\p{Extended_Pictographic}+$", "u").test(m.body);
                      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-end gap-1.5 ${isMine ? "flex-row-reverse" : ""}`, children: [
                        !isMine && /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "div",
                          {
                            className: "w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black shrink-0",
                            style: {
                              background: `radial-gradient(circle at 30% 25%, ${seatColor}, ${seatColor}55 70%, #0a1228)`,
                              border: `1px solid ${seatColor}aa`,
                              color: "#fff",
                              textShadow: `0 0 6px ${seatColor}`,
                              boxShadow: `0 0 8px ${seatColor}66`
                            },
                            title: m.display_name,
                            children: initial
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `min-w-0 max-w-[78%] ${isMine ? "items-end text-right" : "items-start"}`, children: [
                          !isMine && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[9px] font-bold mb-0.5 px-1 truncate", style: { color: seatColor }, children: [
                            m.display_name,
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-slate-600 font-medium", children: [
                              " · ",
                              timeAgo$1(m.created_at)
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "div",
                            {
                              className: `inline-block px-2.5 py-1.5 rounded-2xl text-[12px] leading-snug break-words ${isEmojiOnly ? "text-2xl px-1.5 py-0.5" : ""}`,
                              style: {
                                background: isMine ? `linear-gradient(135deg, ${accent}33, ${accent}10)` : "rgba(255,255,255,0.06)",
                                border: "1px solid " + (isMine ? `${accent}55` : "rgba(255,255,255,0.08)"),
                                color: "#F8FAFC",
                                boxShadow: isMine ? `0 0 12px ${accent}22` : "0 1px 0 rgba(255,255,255,0.04) inset",
                                borderBottomRightRadius: isMine ? 6 : void 0,
                                borderBottomLeftRadius: !isMine ? 6 : void 0
                              },
                              children: m.body
                            }
                          ),
                          isMine && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] text-slate-500 mt-0.5 px-1", children: timeAgo$1(m.created_at) })
                        ] })
                      ] }, m.id);
                    })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 pt-1.5 border-t", style: { borderColor: "rgba(255,255,255,0.06)" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1.5 overflow-x-auto scrollbar-hide pb-1.5", children: QUICK_PHRASES.map((q) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => onSend(q, "quick"),
                    className: "shrink-0 px-2.5 h-7 rounded-full text-[11px] font-bold transition active:scale-95",
                    style: {
                      background: "rgba(255,255,255,0.04)",
                      border: `1px solid ${accent}44`,
                      color: "#E2E8F0",
                      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 0 8px ${accent}22`
                    },
                    children: q
                  },
                  q
                )) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 pb-1.5", children: QUICK_EMOJI.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => onSend(e, "emoji"),
                    className: "shrink-0 w-8 h-8 rounded-full text-base flex items-center justify-center transition active:scale-90",
                    style: {
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)"
                    },
                    "aria-label": `React with ${e}`,
                    children: e
                  },
                  e
                )) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "form",
                {
                  onSubmit: (ev) => {
                    ev.preventDefault();
                    submit();
                  },
                  className: "px-3 pt-1.5 pb-3 border-t flex items-center gap-2",
                  style: { borderColor: "rgba(255,255,255,0.06)" },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      {
                        className: "flex-1 flex items-center gap-1.5 rounded-full pl-3 pr-1 h-10",
                        style: {
                          background: "rgba(255,255,255,0.05)",
                          border: `1px solid ${accent}33`,
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)"
                        },
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Smile, { size: 14, className: "text-slate-500 shrink-0" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "input",
                            {
                              value: draft,
                              onChange: (e) => setDraft(e.target.value),
                              placeholder: "Message the table…",
                              maxLength: 280,
                              className: "flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500",
                              onKeyDown: (e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  submit();
                                }
                              }
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "button",
                            {
                              type: "submit",
                              disabled: !draft.trim(),
                              className: "w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-30 active:scale-95 transition",
                              style: {
                                background: draft.trim() ? `linear-gradient(135deg, ${accent}, #A855F7)` : "rgba(255,255,255,0.06)",
                                color: "#fff",
                                boxShadow: draft.trim() ? `0 0 14px ${accent}66` : "none"
                              },
                              "aria-label": "Send",
                              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { size: 13 })
                            }
                          )
                        ]
                      }
                    ),
                    mySeat != null && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      {
                        className: "text-[9px] font-black tracking-widest px-2 py-1 rounded-full shrink-0",
                        style: {
                          color: SEAT_ACCENTS[mySeat % SEAT_ACCENTS.length],
                          border: `1px solid ${SEAT_ACCENTS[mySeat % SEAT_ACCENTS.length]}55`,
                          background: "rgba(255,255,255,0.03)"
                        },
                        children: [
                          "SEAT ",
                          mySeat + 1
                        ]
                      }
                    )
                  ]
                }
              )
            ]
          }
        )
      }
    )
  ] });
};
const SUIT_MAP = { S: "♠", H: "♥", D: "♦", C: "♣" };
const BOT_BID_DELAY_MS = 1800;
const BOT_CARD_DELAY_MS = 2200;
const BOT_TRICK_CLOSE_DELAY_MS = 3e3;
const HUMAN_TURN_TIMEOUT_MS$1 = 15e3;
const DOUBLE_TAP_PLAY_MS = 450;
function spadesApplyMove(state, move) {
  switch (move.type) {
    case "bid":
      return placeBid(state, move.seat, move.payload.bid);
    case "play":
      return playCard(state, move.seat, move.payload.cardId);
    case "next-round":
      return startNextRound(state);
    default:
      return state;
  }
}
function spadesExtract(s) {
  return { currentSeat: s.currentSeat, phase: s.phase, round: s.round, ended: s.phase === "game-over" };
}
const SpadesTable = (props) => {
  if (props.roomId && props.identity) return /* @__PURE__ */ jsxRuntimeExports.jsx(ServerSpades, { ...props, roomId: props.roomId, identity: props.identity });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(LocalSpades, { ...props });
};
const LocalSpades = ({ onBack, onLegend, targetScore = 500 }) => {
  const [state, setState] = reactExports.useState(() => newSpadesGame(["You", "Aaliyah", "Marcus", "Jamal"], targetScore));
  const [selected, setSelected] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (state.phase === "bidding") {
      const seat = state.currentSeat;
      const delay = state.players[seat].isBot ? BOT_BID_DELAY_MS : HUMAN_TURN_TIMEOUT_MS$1;
      const t = setTimeout(() => setState((s) => placeBid(s, seat, botBid(s, seat))), delay);
      return () => clearTimeout(t);
    }
    if (state.phase === "playing") {
      const seat = state.currentSeat;
      const delay = state.players[seat].isBot ? state.trick.length === 3 ? BOT_TRICK_CLOSE_DELAY_MS : BOT_CARD_DELAY_MS : HUMAN_TURN_TIMEOUT_MS$1;
      const t = setTimeout(() => setState((s) => playCard(s, seat, botPlay(s, seat))), delay);
      return () => clearTimeout(t);
    }
  }, [state.phase, state.currentSeat, state.trick.length]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    SpadesView,
    {
      state,
      mySeat: 0,
      selected,
      setSelected,
      onBid: (n) => setState((s) => placeBid(s, 0, n)),
      onPlayCard: (cardId) => {
        setState((s) => playCard(s, 0, cardId));
        setSelected(null);
      },
      onPlayClick: () => {
        if (selected) {
          setState((s) => playCard(s, 0, selected));
          setSelected(null);
        }
      },
      onNextRound: () => setState(startNextRound),
      onPlayAgain: () => setState(newSpadesGame(["You", "Aaliyah", "Marcus", "Jamal"], targetScore)),
      onBack,
      onLegend,
      myAvatarUrl: null
    }
  );
};
const ServerSpades = ({ roomId, identity, onBack, onLegend }) => {
  const apply = reactExports.useCallback(spadesApplyMove, []);
  const extract = reactExports.useCallback(spadesExtract, []);
  const room = useRealtimeRoom(roomId, identity, apply, extract);
  const [selected, setSelected] = reactExports.useState(null);
  const [chatOpen, setChatOpen] = reactExports.useState(false);
  const chat = useChat({ roomId, identity, mySeat: room.mySeat, isOpen: chatOpen });
  const state = room.state;
  const mySeat = room.mySeat;
  const roomPlayersKey = room.players.map((p) => `${p.seat_index}:${p.display_name}:${p.is_bot}`).join("|");
  reactExports.useEffect(() => {
    if (!room.isHost || !state || !room.session) return;
    const activeState = syncSpadesPlayersFromRoom(state, room.players);
    if (activeState !== state) room.setHostState(activeState);
    const seatPlayer = room.players.find((p) => p.seat_index === activeState.currentSeat);
    if (activeState.phase === "bidding") {
      const seat = activeState.currentSeat;
      const delay = seatPlayer?.is_bot ? BOT_BID_DELAY_MS : HUMAN_TURN_TIMEOUT_MS$1;
      const t = setTimeout(() => room.setHostState(placeBid(activeState, seat, botBid(activeState, seat))), delay);
      return () => clearTimeout(t);
    }
    if (activeState.phase === "playing") {
      const seat = activeState.currentSeat;
      const delay = seatPlayer?.is_bot ? activeState.trick.length === 3 ? BOT_TRICK_CLOSE_DELAY_MS : BOT_CARD_DELAY_MS : HUMAN_TURN_TIMEOUT_MS$1;
      const t = setTimeout(() => room.setHostState(playCard(activeState, seat, botPlay(activeState, seat))), delay);
      return () => clearTimeout(t);
    }
  }, [room.isHost, state?.phase, state?.currentSeat, state?.trick.length, roomPlayersKey]);
  if (room.loading || !state || mySeat === null) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-[100dvh] flex items-center justify-center text-slate-400", style: { background: "#05070D" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin mr-2" }),
      " Syncing room…"
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    SpadesView,
    {
      state,
      mySeat,
      selected,
      setSelected,
      onBid: (n) => room.sendMove({ type: "bid", seat: mySeat, payload: { bid: n } }),
      onPlayCard: (cardId) => {
        room.sendMove({ type: "play", seat: mySeat, payload: { cardId } });
        setSelected(null);
      },
      onPlayClick: () => {
        if (selected) {
          room.sendMove({ type: "play", seat: mySeat, payload: { cardId: selected } });
          setSelected(null);
        }
      },
      onNextRound: () => room.sendMove({ type: "next-round", seat: mySeat }),
      onPlayAgain: onBack,
      onBack,
      onLegend,
      roomCode: room.room?.room_code,
      myAvatarUrl: identity.avatarUrl,
      myPublicProfileUid: identity.publicProfileUid,
      chatButton: /* @__PURE__ */ jsxRuntimeExports.jsx(ChatHeaderButton, { unread: chat.unread, accent: "#00B7FF", onClick: () => setChatOpen(true) }),
      chatDrawer: /* @__PURE__ */ jsxRuntimeExports.jsx(
        GameChatDrawer,
        {
          open: chatOpen,
          onClose: () => setChatOpen(false),
          messages: chat.messages,
          loading: chat.loading,
          myUserId: identity.userId,
          mySeat,
          onSend: chat.send,
          accent: "#00B7FF"
        }
      )
    }
  );
};
function EliteCard({ cardId, size = "md", selected = false, isLegal = true, style }) {
  const dims = size === "lg" ? { w: 60, h: 86, radius: 10 } : size === "sm" ? { w: 36, h: 52, radius: 7 } : { w: 46, h: 66, radius: 9 };
  const suit = cardId.slice(-1).toUpperCase();
  const neon = suit === "S" ? "var(--neon-violet)" : suit === "H" ? "var(--neon-magenta)" : suit === "D" ? "var(--neon-cyan)" : "var(--neon-lime)";
  const faceUrl = cardIdToUrl(cardId);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "relative overflow-hidden",
      style: {
        width: dims.w,
        height: dims.h,
        borderRadius: dims.radius,
        background: "linear-gradient(160deg, oklch(0.10 0.03 282) 0%, oklch(0.05 0.015 280) 100%)",
        boxShadow: selected ? `0 0 26px ${neon}, 0 0 52px color-mix(in oklch, ${neon} 35%, transparent), 0 16px 32px oklch(0 0 0 / 0.75)` : `var(--shadow-card), inset 0 0 0 1px ${neon}`,
        opacity: !isLegal && !selected ? 0.45 : 1,
        ...style
      },
      children: [
        faceUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: faceUrl, alt: cardId, className: "absolute inset-0 h-full w-full object-cover", loading: "lazy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 pointer-events-none", style: { background: "linear-gradient(180deg, oklch(1 0 0 / 0.08) 0%, transparent 30%, transparent 70%, oklch(0 0 0 / 0.18) 100%)" } }),
        selected && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "selected-card-glow", "aria-hidden": true })
      ]
    }
  );
}
function CardBack({ style }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "relative overflow-hidden",
      style: {
        width: 28,
        height: 40,
        borderRadius: 5,
        background: "radial-gradient(120% 90% at 50% 0%, oklch(0.18 0.08 285) 0%, oklch(0.09 0.04 282) 55%, oklch(0.04 0.015 280) 100%)",
        boxShadow: "inset 0 0 0 1px oklch(0.84 0.14 82 / 0.55), inset 0 0 8px oklch(0.72 0.24 300 / 0.4), 0 3px 6px oklch(0 0 0 / 0.6)",
        ...style
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-[2px] rounded-[3px] pointer-events-none", style: { border: "0.5px solid oklch(0.84 0.14 82 / 0.35)", boxShadow: "inset 0 0 6px oklch(0.72 0.24 300 / 0.35)" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "/assets/games/cards/trey-tv-luxury/card-back.png", alt: "", className: "absolute inset-0 w-full h-full object-cover" })
      ]
    }
  );
}
function FannedBacks({ count = 5, rotate = 0 }) {
  const n = Math.max(1, Math.min(count, 7));
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative", style: { width: 56, height: 50, transform: `rotate(${rotate}deg)` }, children: Array.from({ length: n }).map((_, i) => {
    const spread = 8;
    const offset = (i - (n - 1) / 2) * spread;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      CardBack,
      {
        style: {
          position: "absolute",
          top: 0,
          left: "50%",
          transform: `translateX(-50%) translateX(${offset}px) rotate(${offset * 0.6}deg)`,
          zIndex: i
        }
      },
      i
    );
  }) });
}
function GlassChip({ children, className = "", style }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className,
      style: {
        background: "var(--glass)",
        border: "1px solid var(--glass-border)",
        backdropFilter: "blur(14px) saturate(140%)",
        WebkitBackdropFilter: "blur(14px) saturate(140%)",
        boxShadow: "var(--shadow-glass)",
        ...style
      },
      children
    }
  );
}
const SpadesView = ({
  state,
  mySeat,
  selected,
  setSelected,
  onBid,
  onPlayClick,
  onNextRound,
  onPlayAgain,
  onBack,
  onLegend,
  roomCode,
  myAvatarUrl,
  myPublicProfileUid,
  chatButton,
  chatDrawer,
  onPlayCard
}) => {
  const you = state.players[mySeat];
  const isMyTurn = state.currentSeat === mySeat;
  const yourLegal = reactExports.useMemo(() => state.phase === "playing" && isMyTurn ? legalCards(state, mySeat) : [], [state, mySeat, isMyTurn]);
  const legalSet = reactExports.useMemo(() => new Set(yourLegal), [yourLegal]);
  const lastCardTap = reactExports.useRef(null);
  const [remoteBid, setRemoteBid] = reactExports.useState(1);
  const tvRemoteMode = useTvRemoteMode();
  reactExports.useEffect(() => {
    if (selected && !legalSet.has(selected)) setSelected(null);
  }, [legalSet, selected, setSelected]);
  const selectionResetKey = `${state.round}:${state.phase}:${state.currentSeat}:${state.trick.length}:${you.hand.length}`;
  const prevSelectionResetKey = reactExports.useRef(selectionResetKey);
  reactExports.useEffect(() => {
    if (prevSelectionResetKey.current !== selectionResetKey) {
      setSelected(null);
      lastCardTap.current = null;
      prevSelectionResetKey.current = selectionResetKey;
    }
  }, [selectionResetKey, setSelected]);
  const myTeam = mySeat % 2;
  const teamWeScore = state.teamScores[myTeam];
  const teamThemScore = state.teamScores[1 - myTeam];
  const [winnerFlash, setWinnerFlash] = reactExports.useState(null);
  const prevTrickLen = reactExports.useRef(state.trick.length);
  reactExports.useEffect(() => {
    if (prevTrickLen.current === 3 && state.trick.length === 0 && state.lastTrickWinner !== null) {
      setWinnerFlash(state.lastTrickWinner);
      const t = setTimeout(() => setWinnerFlash(null), 750);
      return () => clearTimeout(t);
    }
    prevTrickLen.current = state.trick.length;
  }, [state.trick.length, state.lastTrickWinner]);
  const dealerSeat = (state.round - 1 + 3) % 4;
  const seatPositions = reactExports.useMemo(() => {
    const positions = {};
    const relToPos = ["bottom", "left", "top", "right"];
    for (let s = 0; s < 4; s++) {
      const rel = (s - mySeat + 4) % 4;
      if (rel !== 0) {
        positions[s] = relToPos[rel];
      }
    }
    return positions;
  }, [mySeat]);
  const handleCardTap = reactExports.useCallback((cardId) => {
    if (!isMyTurn || !legalSet.has(cardId)) return;
    const now = Date.now();
    const lastTap = lastCardTap.current;
    const isDoubleTap = selected === cardId || lastTap?.cardId === cardId && now - lastTap.at <= DOUBLE_TAP_PLAY_MS;
    if (isDoubleTap) {
      onPlayCard(cardId);
      lastCardTap.current = null;
      return;
    }
    setSelected(cardId);
    lastCardTap.current = { cardId, at: now };
  }, [isMyTurn, legalSet, onPlayCard, selected, setSelected]);
  useTvRemoteInput((action) => {
    if (action === "BACK") {
      onBack();
      return;
    }
    if (action === "MENU") {
      onLegend();
      return;
    }
    if (state.phase === "bidding" && isMyTurn) {
      if (action === "LEFT" || action === "RIGHT") {
        setRemoteBid((bid) => (bid + (action === "LEFT" ? -1 : 1) + 14) % 14);
        return;
      }
      if (action === "SELECT") {
        onBid(remoteBid);
      }
      return;
    }
    if (state.phase === "round-end" && action === "SELECT") {
      onNextRound();
      return;
    }
    if (state.phase === "game-over" && action === "SELECT") {
      onPlayAgain();
      return;
    }
    if (state.phase !== "playing") return;
    if (action === "LEFT" || action === "RIGHT") {
      const cards = yourLegal.length ? yourLegal : you.hand;
      if (!cards.length) return;
      const currentIndex = Math.max(0, cards.indexOf(selected ?? cards[0]));
      const delta = action === "LEFT" ? -1 : 1;
      setSelected(cards[(currentIndex + delta + cards.length) % cards.length]);
      return;
    }
    if (action === "SELECT") {
      if (selected && legalSet.has(selected) && isMyTurn) onPlayCard(selected);
      else if (yourLegal[0]) setSelected(yourLegal[0]);
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "w-full text-white flex flex-col overflow-hidden relative trey-screen-enter",
      style: {
        height: "100dvh",
        background: `
          radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,183,255,0.10) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 50% 100%, rgba(168,85,247,0.10) 0%, transparent 60%),
          linear-gradient(180deg, #04060C 0%, #02030A 100%)
        `,
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "pointer-events-none absolute -top-32 -left-24 w-[360px] h-[360px] rounded-full",
            style: { background: "radial-gradient(closest-side, oklch(0.72 0.26 300 / 0.35), transparent 70%)", filter: "blur(20px)" }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "pointer-events-none absolute -top-24 -right-24 w-[320px] h-[320px] rounded-full",
            style: { background: "radial-gradient(closest-side, oklch(0.84 0.16 215 / 0.30), transparent 70%)", filter: "blur(20px)" }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "pointer-events-none absolute -bottom-20 left-1/2 -translate-x-1/2 w-[420px] h-[260px] rounded-full",
            style: { background: "radial-gradient(closest-side, oklch(0.70 0.27 0 / 0.22), transparent 70%)", filter: "blur(24px)" }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "header",
          {
            className: "shrink-0 z-20 backdrop-blur-2xl border-b relative",
            style: {
              background: "linear-gradient(180deg, rgba(8,17,31,0.92), rgba(8,17,31,0.78))",
              borderColor: "rgba(0,183,255,0.28)",
              boxShadow: "0 6px 24px rgba(0,0,0,0.4)"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-2 flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: onBack,
                    className: "w-10 h-10 inline-flex items-center justify-center rounded-lg hover:bg-white/5 transition",
                    "aria-label": "Back",
                    style: { background: "var(--glass)", border: "1px solid var(--glass-border)", backdropFilter: "blur(14px)" },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 18 })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TreyBrandMark, { size: 22, glow: true, className: "shrink-0" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-px bg-white/15 shrink-0" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Spade, { size: 13, className: "text-cyan-300 shrink-0" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-black tracking-[0.28em] truncate", children: "SPADES" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-slate-500 font-bold tabular-nums", children: [
                    "· R",
                    state.round
                  ] }),
                  roomCode && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[9px] font-mono text-amber-300 tracking-wider ml-1 truncate", children: [
                    "· ",
                    roomCode
                  ] })
                ] }),
                chatButton,
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onLegend, className: "w-10 h-10 inline-flex items-center justify-center rounded-lg hover:bg-white/5 transition border border-white/5", "aria-label": "Suit legend", title: "Suit legend", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { size: 16 }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 pb-2 grid grid-cols-2 gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ScoreCard, { label: "WE", score: teamWeScore, bid: state.teamRoundBids[myTeam], tricks: state.teamRoundTricks[myTeam], bags: state.teamBags[myTeam], color: "#00B7FF" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ScoreCard, { label: "THEM", score: teamThemScore, bid: state.teamRoundBids[1 - myTeam], tricks: state.teamRoundTricks[1 - myTeam], bags: state.teamBags[1 - myTeam], color: "#A855F7" })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 min-h-0 relative flex items-center justify-center px-2 py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            "data-game-table": true,
            className: "relative w-full h-full max-w-md mx-auto rounded-[28px] overflow-hidden ombre-border",
            style: {
              background: "radial-gradient(120% 90% at 50% 0%, oklch(0.32 0.13 280) 0%, oklch(0.20 0.10 270) 30%, oklch(0.14 0.08 255) 60%, oklch(0.10 0.06 240) 100%)",
              boxShadow: "0 0 60px oklch(0.72 0.26 300 / 0.22), 0 0 90px oklch(0.84 0.16 215 / 0.15)"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-x-0 top-0 h-1/2", style: { background: "linear-gradient(180deg, oklch(1 0 0 / 0.06) 0%, oklch(1 0 0 / 0.01) 50%, transparent 100%)" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 mix-blend-screen opacity-60", style: { background: "radial-gradient(80% 60% at 20% 110%, oklch(0.84 0.14 82 / 0.18) 0%, transparent 60%), radial-gradient(80% 60% at 90% 0%, oklch(0.84 0.16 215 / 0.16) 0%, transparent 60%)" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 opacity-[0.06]", style: { backgroundImage: "radial-gradient(oklch(1 0 0 / 0.4) 0.5px, transparent 0.6px)", backgroundSize: "3px 3px" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] rounded-full",
                  style: { background: "radial-gradient(circle, oklch(0.92 0.04 90 / 0.12) 0%, oklch(0.84 0.16 215 / 0.08) 35%, transparent 70%)", filter: "blur(4px)" }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "filigree-corner", style: { top: 6, left: 6 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "filigree-corner", style: { top: 6, right: 6, transform: "scaleX(-1)" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "filigree-corner", style: { bottom: 6, left: 6, transform: "scaleY(-1)" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "filigree-corner", style: { bottom: 6, right: 6, transform: "scale(-1,-1)" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: treyTvLogo, alt: "", className: "pointer-events-none select-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[140px] h-auto", style: { opacity: 0.28, filter: "drop-shadow(0 2px 8px oklch(0 0 0 / 0.55)) drop-shadow(0 0 18px oklch(0.84 0.14 82 / 0.35))" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[160px] h-[160px] rounded-full breathe", style: { border: "1px solid oklch(0.84 0.14 82 / 0.40)", boxShadow: "0 0 20px oklch(0.84 0.14 82 / 0.25)" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sparkle", style: { top: "18%", left: "22%", animationDelay: "0s" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sparkle", style: { top: "30%", right: "18%", animationDelay: "1.4s" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sparkle", style: { bottom: "28%", left: "30%", animationDelay: "2.6s" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sparkle", style: { bottom: "35%", right: "26%", animationDelay: "0.8s" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[160px]", children: [
                state.trick.map((t, i) => {
                  const relSeat = (t.seat - mySeat + 4) % 4;
                  const slot = relSeat === 0 ? { x: 0, y: 46, r: 0 } : relSeat === 1 ? { x: -46, y: 8, r: -14 } : relSeat === 2 ? { x: 0, y: -42, r: -6 } : { x: 46, y: 8, r: 14 };
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    EliteCard,
                    {
                      cardId: t.cardId,
                      size: "md",
                      style: { position: "absolute", left: "50%", top: "50%", transform: `translate(-50%, -50%) translate(${slot.x}px, ${slot.y}px) rotate(${slot.r}deg)`, zIndex: i + 1 }
                    },
                    `${t.seat}-${t.cardId}-${i}`
                  );
                }),
                state.trick.length < 4 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "absolute left-1/2 top-1/2 w-[46px] h-[66px] rounded-[9px]",
                    style: { transform: "translate(-50%, -50%) translateY(46px)", border: "1px dashed oklch(0.84 0.16 215 / 0.55)", background: "oklch(0.84 0.16 215 / 0.06)", boxShadow: "0 0 14px oklch(0.84 0.16 215 / 0.25)" }
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 pointer-events-none", style: { zIndex: 10 }, children: [0, 1, 2, 3].map((seat) => {
                const pos = seatPositions[seat];
                if (!pos) return null;
                const player = state.players[seat];
                const norm = AVATAR_SEAT_NORM[pos];
                const isMyTeam = seat % 2 === mySeat % 2;
                const fanDx = pos === "top" ? -0.13 : pos === "left" ? 0.12 : -0.12;
                const fanDy = pos === "top" ? 0.02 : 0;
                const fanRotate = pos === "top" ? -18 : pos === "left" ? 70 : -70;
                const cardCount = Math.min(player.hand.length, 7);
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(React__default.Fragment, { children: [
                  cardCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
                    position: "absolute",
                    top: `${(norm.y + fanDy) * 100}%`,
                    left: `${(norm.x + fanDx) * 100}%`,
                    transform: "translate(-50%, -50%)"
                  }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FannedBacks, { count: cardCount, rotate: fanRotate }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      style: {
                        position: "absolute",
                        top: `${norm.y * 100}%`,
                        left: `${norm.x * 100}%`,
                        transform: "translate(-50%, -50%)",
                        pointerEvents: "none"
                      },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        GamePlayerSeat,
                        {
                          displayName: player.name,
                          isBot: player.isBot,
                          isCurrentTurn: state.currentSeat === seat,
                          isDealer: dealerSeat === seat,
                          bid: player.bid,
                          tricks: player.tricksWon,
                          accentColor: isMyTeam ? "#00B7FF" : "#A855F7",
                          size: "sm",
                          position: pos,
                          winFlash: winnerFlash === seat
                        }
                      )
                    }
                  )
                ] }, seat);
              }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-2 bottom-2 pointer-events-none", style: { zIndex: 14 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "relative overflow-hidden rounded-[22px] border px-3 py-2 flex items-center gap-3",
                  style: {
                    minHeight: 72,
                    background: "linear-gradient(90deg, rgba(3,8,18,0.90), rgba(8,17,31,0.74))",
                    borderColor: isMyTurn ? "rgba(255,200,87,0.62)" : "rgba(0,183,255,0.30)",
                    boxShadow: isMyTurn ? "0 0 28px rgba(255,200,87,0.22), inset 0 1px 0 rgba(255,255,255,0.08)" : "0 10px 28px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
                    backdropFilter: "blur(18px)"
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-3 top-0 h-px", style: { background: "linear-gradient(90deg, transparent, rgba(0,183,255,0.65), rgba(255,200,87,0.45), transparent)" } }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      GamePlayerSeat,
                      {
                        displayName: you.name,
                        avatarUrl: myAvatarUrl,
                        publicProfileUid: myPublicProfileUid,
                        isBot: you.isBot,
                        isCurrentTurn: isMyTurn,
                        isDealer: dealerSeat === mySeat,
                        bid: you.bid,
                        tricks: you.tricksWon,
                        accentColor: "#00B7FF",
                        size: "md",
                        position: "bottom",
                        winFlash: winnerFlash === mySeat
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] tracking-[0.30em] font-black", style: { color: isMyTurn ? "#FFC857" : "#00B7FF" }, children: isMyTurn ? "ACTIVE SEAT" : "YOUR SEAT" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-black truncate mt-0.5", children: you.name }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex flex-wrap gap-1.5 text-[10px] font-bold tabular-nums", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full px-2 py-0.5 border text-cyan-200", style: { background: "rgba(0,183,255,0.10)", borderColor: "rgba(0,183,255,0.32)" }, children: [
                          "Bid ",
                          you.bid ?? "-"
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full px-2 py-0.5 border text-slate-200", style: { background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.12)" }, children: [
                          "Tricks ",
                          you.tricksWon
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full px-2 py-0.5 border text-amber-200", style: { background: "rgba(255,200,87,0.08)", borderColor: "rgba(255,200,87,0.22)" }, children: [
                          you.hand.length,
                          " cards"
                        ] })
                      ] })
                    ] })
                  ]
                }
              ) })
            ]
          }
        ) }),
        state.phase !== "game-over" && /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "shrink-0 z-20 px-2 pt-1", style: { overflow: "visible" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative flex items-end justify-center", style: { height: 120, pointerEvents: "none" }, children: (() => {
          const myHand = state.players[mySeat]?.hand ?? [];
          const total = myHand.length;
          if (total === 0) return null;
          const center = (total - 1) / 2;
          const viewportWidth = typeof window === "undefined" ? 390 : window.innerWidth;
          const handWidth = Math.min(372, Math.max(304, viewportWidth - 34));
          const spreadX = Math.min(27, (handWidth - 70) / Math.max(total - 1, 1));
          const arc = 2.4;
          return myHand.map((cardId, i) => {
            const offset = i - center;
            const isSelected = cardId === selected;
            const remoteFocused = tvRemoteMode && isSelected;
            const isLegal = state.phase !== "playing" || legalSet.has(cardId);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => {
                  if (state.phase !== "playing" || !isMyTurn || !isLegal) return;
                  handleCardTap(cardId);
                },
                className: "absolute bottom-0 transition-all duration-200 ease-out focus:outline-none",
                style: {
                  left: "50%",
                  width: 60,
                  height: 86,
                  marginLeft: -30,
                  transform: `translateX(${offset * spreadX}px) translateY(${isSelected ? -42 : Math.abs(offset) * 1.6}px) rotate(${isSelected ? 0 : offset * arc}deg) scale(${isSelected ? 1.18 : 1})`,
                  zIndex: isSelected ? 100 : i + 1,
                  pointerEvents: state.phase === "playing" && isMyTurn && isLegal ? "auto" : "none",
                  filter: remoteFocused ? "drop-shadow(0 0 18px rgba(251,191,36,0.7))" : void 0
                },
                "aria-label": cardId,
                "aria-pressed": isSelected,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TreyCard, { cardId, selected: isSelected, isLegal }),
                  remoteFocused && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-amber-300/70 bg-amber-400/20 px-2 py-0.5 text-[9px] font-black tracking-wider text-amber-100", children: "TV FOCUS" })
                ]
              },
              cardId
            );
          });
        })() }) }),
        state.phase === "bidding" && isMyTurn && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "section",
          {
            "data-game-action-panel": true,
            className: "shrink-0 z-30 backdrop-blur-2xl border-t px-3 pt-2.5 pb-3 relative overflow-hidden",
            style: {
              background: "linear-gradient(180deg, rgba(5,7,13,0.96), rgba(5,7,13,0.99))",
              borderColor: "rgba(0,183,255,0.35)",
              boxShadow: "0 -14px 36px rgba(0,183,255,0.22), inset 0 1px 0 rgba(255,255,255,0.05)"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "absolute inset-x-0 top-0 h-px",
                  style: { background: "linear-gradient(90deg, transparent, rgba(0,183,255,0.7), rgba(168,85,247,0.7), transparent)" }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] tracking-[0.3em] font-bold", style: { color: "#FFC857" }, children: "YOUR TURN" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold text-slate-200", children: "How many tricks will you take?" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => onBid(0),
                    className: `min-h-9 px-3 py-2 rounded-full font-black text-[10px] tracking-[0.18em] shrink-0 active:scale-95 transition relative overflow-hidden ${tvRemoteMode && remoteBid === 0 ? "ring-4 ring-amber-300/70" : ""}`,
                    style: {
                      background: "linear-gradient(180deg, rgba(244,63,94,0.28), rgba(244,63,94,0.10))",
                      border: "1px solid rgba(244,63,94,0.6)",
                      color: "#FCA5A5",
                      boxShadow: "0 0 16px rgba(244,63,94,0.35), inset 0 1px 0 rgba(255,255,255,0.1)"
                    },
                    children: "NIL · 0"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-7 gap-1 mb-3", children: Array.from({ length: 13 }).map((_, n) => {
                const bid = n + 1;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => onBid(bid),
                    className: `h-9 rounded-lg font-black text-sm transition-all active:scale-90 relative overflow-hidden ${tvRemoteMode && remoteBid === bid ? "ring-4 ring-amber-300/70" : ""}`,
                    style: {
                      background: "linear-gradient(180deg, rgba(0,183,255,0.22), rgba(0,183,255,0.05))",
                      border: "1px solid rgba(0,183,255,0.5)",
                      color: "#F8FAFC",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 8px rgba(0,183,255,0.18)"
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative z-10", children: bid }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          className: "absolute inset-x-1 top-0.5 h-2 rounded-full",
                          style: { background: "linear-gradient(180deg, rgba(255,255,255,0.18), transparent)" }
                        }
                      )
                    ]
                  },
                  bid
                );
              }) })
            ]
          }
        ),
        state.phase === "bidding" && !isMyTurn && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "section",
          {
            "data-game-action-panel": true,
            className: "shrink-0 z-30 backdrop-blur-2xl border-t px-3 pt-2.5 pb-3 relative overflow-hidden",
            style: { background: "rgba(5,7,13,0.94)", borderColor: "rgba(0,183,255,0.28)" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "absolute inset-x-0 top-0 h-px",
                  style: { background: "linear-gradient(90deg, transparent, rgba(0,183,255,0.5), transparent)" }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] tracking-[0.3em] font-bold text-cyan-300 text-center", children: "BIDDING PHASE" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-bold mt-0.5 mb-3 text-center", children: [
                state.players[state.currentSeat].name,
                " is deciding…"
              ] })
            ]
          }
        ),
        state.phase !== "bidding" && state.phase !== "game-over" && /* @__PURE__ */ jsxRuntimeExports.jsx("section", { "data-game-action-panel": true, className: "shrink-0 z-30 px-2 pb-2 pt-1", children: (() => {
          const selSuit = selected ? selected.slice(-1).toUpperCase() : "";
          const selNeon = selSuit === "S" ? "var(--neon-violet)" : selSuit === "H" ? "var(--neon-magenta)" : selSuit === "D" ? "var(--neon-cyan)" : "var(--neon-lime)";
          const canPlay = !!(selected && yourLegal.includes(selected) && isMyTurn);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            GlassChip,
            {
              className: "rounded-2xl px-3 py-2.5 liquid-shimmer",
              style: { boxShadow: "var(--shadow-glass), 0 -6px 24px oklch(0 0 0 / 0.5), inset 0 0 0 1px oklch(1 0 0 / 0.08), 0 0 30px oklch(0.72 0.26 300 / 0.18)" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                    isMyTurn && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: "brushed-gold text-[10px] font-extrabold tracking-[0.26em] px-2 py-0.5 rounded",
                        style: { color: "var(--night)", boxShadow: "0 0 16px var(--gold-glow), inset 0 1px 0 oklch(1 0 0 / 0.5), inset 0 -1px 0 oklch(0 0 0 / 0.3)", border: "1px solid oklch(0.62 0.14 70 / 0.7)" },
                        children: "YOUR TURN"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px]", style: { color: "oklch(0.84 0.04 260)" }, children: isMyTurn ? "Choose a card to play" : `${state.players[state.currentSeat].name} to play` })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[12px] breathe", style: { color: "var(--gold)", textShadow: "0 0 8px var(--gold-glow)" }, children: "✦" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      className: "flex items-center gap-1.5 px-3 h-11 rounded-xl text-[11px] font-semibold text-white tracking-[0.18em]",
                      style: { background: "var(--glass-strong)", border: "1px solid var(--glass-border)", backdropFilter: "blur(10px)", boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.12)" },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpDown, { className: "w-3.5 h-3.5" }),
                        "SORT"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: onPlayClick,
                      disabled: !canPlay,
                      className: "relative flex-1 h-11 rounded-xl text-[13px] font-extrabold tracking-[0.18em] text-white flex items-center justify-center gap-1.5 transition-transform active:scale-[0.98] overflow-hidden disabled:opacity-30",
                      style: {
                        background: canPlay ? "var(--gradient-cta)" : "oklch(1 0 0 / 0.05)",
                        border: `1px solid ${canPlay ? selNeon : "oklch(1 0 0 / 0.10)"}`,
                        boxShadow: canPlay ? `0 0 28px ${selNeon}, 0 8px 22px oklch(0 0 0 / 0.65), inset 0 1px 0 oklch(1 0 0 / 0.30), inset 0 -1px 0 oklch(0 0 0 / 0.35)` : "none"
                      },
                      children: [
                        canPlay && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inset-0 holo-sheen", "aria-hidden": true }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative", children: "PLAY" }),
                        selected && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "span",
                          {
                            className: "relative font-numerals text-[15px]",
                            style: { color: "white", textShadow: canPlay ? `0 0 10px ${selNeon}, 0 0 18px ${selNeon}` : void 0 },
                            children: [
                              selected.slice(0, -1),
                              SUIT_MAP[selected.slice(-1).toUpperCase()] ?? selected.slice(-1)
                            ]
                          }
                        )
                      ]
                    }
                  )
                ] })
              ]
            }
          );
        })() }),
        (state.phase === "round-end" || state.phase === "game-over") && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-md p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "w-full max-w-sm rounded-3xl p-5 border text-center trey-win-burst relative overflow-hidden",
            style: {
              background: "linear-gradient(160deg,#08111F,#05070D)",
              borderColor: "#FFC85770",
              boxShadow: "0 0 80px rgba(255,200,87,0.3), inset 0 1px 0 rgba(255,255,255,0.06)"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full blur-[100px]",
                  style: { background: "radial-gradient(circle, rgba(255,200,87,0.35) 0%, transparent 70%)" }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "inline-flex items-center gap-1.5 text-[10px] tracking-[0.35em] font-black px-3 py-1 rounded-full",
                    style: { background: "rgba(255,200,87,0.12)", border: "1px solid rgba(255,200,87,0.45)", color: "#FFC857" },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 11 }),
                      " ",
                      state.phase === "game-over" ? "GAME OVER" : `ROUND ${state.round} COMPLETE`
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl sm:text-3xl font-black mt-3 mb-4 tracking-tight", children: state.phase === "game-over" ? teamWeScore > teamThemScore ? "Team We Wins!" : "Team Them Wins!" : "Round Recap" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 mb-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl p-3 border", style: { background: "rgba(0,183,255,0.1)", borderColor: "rgba(0,183,255,0.45)" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-cyan-300 tracking-[0.25em] font-bold", children: "TEAM WE" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-black mt-1", children: teamWeScore })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl p-3 border", style: { background: "rgba(168,85,247,0.1)", borderColor: "rgba(168,85,247,0.45)" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-purple-300 tracking-[0.25em] font-bold", children: "TEAM THEM" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-black mt-1", children: teamThemScore })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                  state.phase === "round-end" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: onNextRound,
                      className: "flex-1 py-3 rounded-2xl font-black text-sm tracking-wide active:scale-95 transition",
                      style: { background: "linear-gradient(90deg,#00B7FF,#A855F7)", boxShadow: "0 0 24px rgba(0,183,255,0.45)" },
                      children: "Next Round"
                    }
                  ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: onPlayAgain,
                      className: "flex-1 py-3 rounded-2xl font-black text-sm tracking-wide flex items-center justify-center gap-2 active:scale-95 transition",
                      style: { background: "linear-gradient(90deg,#00B7FF,#A855F7)", boxShadow: "0 0 24px rgba(0,183,255,0.45)" },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCw, { size: 16 }),
                        " Play Again"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: onBack,
                      className: "flex-1 py-3 rounded-2xl font-bold text-sm border active:scale-95 transition",
                      style: { borderColor: "rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.04)" },
                      children: "Leave"
                    }
                  )
                ] })
              ] })
            ]
          }
        ) }),
        chatDrawer
      ]
    }
  );
};
function syncSpadesPlayersFromRoom(state, players) {
  let changed = false;
  const next = JSON.parse(JSON.stringify(state));
  players.forEach((player) => {
    const seat = player.seat_index;
    if (seat < 0 || seat >= next.players.length) return;
    if (next.players[seat].name !== player.display_name || next.players[seat].isBot !== player.is_bot) {
      next.players[seat].name = player.display_name;
      next.players[seat].isBot = player.is_bot;
      changed = true;
    }
  });
  return changed ? next : state;
}
const ScoreCard = ({ label, score, bid, tricks, bags, color }) => {
  const [popKey, setPopKey] = reactExports.useState(0);
  const prevScore = reactExports.useRef(score);
  reactExports.useEffect(() => {
    if (prevScore.current !== score) {
      setPopKey((k) => k + 1);
      prevScore.current = score;
    }
  }, [score]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "relative rounded-2xl px-3 py-1.5 backdrop-blur-xl overflow-hidden",
      style: {
        background: `linear-gradient(160deg, ${color}1F, ${color}05 60%, rgba(8,17,31,0.9))`,
        boxShadow: `0 4px 14px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 18px ${color}28`
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-2xl pointer-events-none", style: {
          padding: 1,
          background: `linear-gradient(135deg, ${color}aa, ${color}30 60%, ${color}88)`,
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute inset-x-2 top-0.5 h-3 rounded-full pointer-events-none",
            style: { background: "linear-gradient(180deg, rgba(255,255,255,0.12), transparent)" }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1 h-1 rounded-full", style: { background: color, boxShadow: `0 0 6px ${color}` } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] tracking-[0.32em] font-black leading-none", style: { color }, children: label })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[9px] text-slate-400 font-semibold leading-tight mt-1 tabular-nums", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-200", children: tricks }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-500", children: "/" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-300", children: bid }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-600", children: " · " }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-amber-300", children: [
                bags,
                "b"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "text-2xl font-black tracking-tight tabular-nums trey-score-pop",
                style: {
                  color: "#fff",
                  textShadow: `0 0 14px ${color}80, 0 0 2px ${color}`,
                  fontFamily: "'Cinzel', serif"
                },
                children: score
              },
              popKey
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 mt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 7, color: "oklch(0.65 0.03 250)", letterSpacing: "0.18em", fontWeight: 700 }, children: "BAGS" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-[2px]", children: Array.from({ length: Math.min(bags, 10) }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { width: 4, height: 4, borderRadius: "50%", background: color, boxShadow: `0 0 4px ${color}`, display: "inline-block" } }, i)) })
            ] })
          ] })
        ] })
      ]
    }
  );
};
const LazyBJTable = reactExports.lazy(() => import("./PixiBlackjackTable-h5Rbf-RF.mjs"));
reactExports.lazy(() => import("./PixiSpadesTable-CQXNO_0X.mjs"));
const LazyBullshitTable = reactExports.lazy(() => import("./PixiBullshitTable-CI0xffnc.mjs"));
const PixiBlackjackTableLazy = (props) => /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: null, children: /* @__PURE__ */ jsxRuntimeExports.jsx(LazyBJTable, { ...props }) });
const PixiBullshitTableLazy = (props) => /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: null, children: /* @__PURE__ */ jsxRuntimeExports.jsx(LazyBullshitTable, { ...props }) });
const CHIPS = [10, 25, 100, 250, 500, 1e3];
function bjApply(state, move) {
  switch (move.type) {
    case "bet":
      return placeBet(state, move.payload.bet);
    case "hit":
      return hit(state);
    case "stand":
      return stand(state);
    case "double":
      return doubleDown(state);
    case "next":
      return nextHand(state);
    default:
      return state;
  }
}
function bjExtract(s) {
  return { currentSeat: 0, phase: s.phase, ended: false };
}
const BlackjackTable = (props) => {
  if (props.roomId && props.identity)
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ServerBJ, { ...props, roomId: props.roomId, identity: props.identity });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(LocalBJ, { ...props });
};
const LocalBJ = ({ onBack, onLegend }) => {
  const [state, setState] = reactExports.useState(() => newBlackjackGame(2500));
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    BJView,
    {
      state,
      onBack,
      onLegend,
      onBet: (b) => setState((s) => placeBet(s, b)),
      onHit: () => setState(hit),
      onStand: () => setState(stand),
      onDouble: () => setState(doubleDown),
      onNext: () => setState(nextHand),
      playerAvatarUrl: null
    }
  );
};
const ServerBJ = ({ roomId, identity, onBack, onLegend }) => {
  const apply = reactExports.useCallback(bjApply, []);
  const extract = reactExports.useCallback(bjExtract, []);
  const room = useRealtimeRoom(roomId, identity, apply, extract);
  const [chatOpen, setChatOpen] = reactExports.useState(false);
  const chat = useChat({
    roomId,
    identity,
    mySeat: room.mySeat ?? 0,
    isOpen: chatOpen
  });
  if (room.loading || !room.state)
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-[100dvh] flex items-center justify-center text-slate-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin mr-2" }),
      " Syncing room…"
    ] });
  const send = (type, payload) => room.sendMove({ type, seat: 0, payload });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    BJView,
    {
      state: room.state,
      onBack,
      onLegend,
      roomCode: room.room?.room_code,
      onBet: (b) => send("bet", { bet: b }),
      onHit: () => send("hit"),
      onStand: () => send("stand"),
      onDouble: () => send("double"),
      onNext: () => send("next"),
      playerAvatarUrl: identity.avatarUrl,
      playerPublicProfileUid: identity.publicProfileUid,
      chatButton: /* @__PURE__ */ jsxRuntimeExports.jsx(
        ChatHeaderButton,
        {
          unread: chat.unread,
          accent: "#FFC857",
          onClick: () => setChatOpen(true)
        }
      ),
      chatDrawer: /* @__PURE__ */ jsxRuntimeExports.jsx(
        GameChatDrawer,
        {
          open: chatOpen,
          onClose: () => setChatOpen(false),
          messages: chat.messages,
          loading: chat.loading,
          myUserId: identity.userId,
          mySeat: room.mySeat ?? 0,
          onSend: chat.send,
          accent: "#FFC857"
        }
      )
    }
  );
};
const BJView = ({
  state,
  onBack,
  onLegend,
  onBet,
  onHit,
  onStand,
  onDouble,
  onNext,
  roomCode,
  playerAvatarUrl,
  playerPublicProfileUid,
  chatButton,
  chatDrawer
}) => {
  const [pendingBet, setPendingBet] = reactExports.useState(50);
  const [remoteActionIndex, setRemoteActionIndex] = reactExports.useState(0);
  const tvRemoteMode = useTvRemoteMode();
  const playerVal = state.player.length ? handValue(state.player).total : 0;
  const dealerShownVal = state.dealer.length ? state.phase === "player" ? handValue([state.dealer[0]]).total : handValue(state.dealer).total : 0;
  const isBust = state.result === "lose" && playerVal > 21;
  const isWin = state.result === "win" || state.result === "blackjack";
  const isPush = state.result === "push";
  const accent = isBust ? "#EF4444" : isWin ? "#22C55E" : "#FFC857";
  const canDouble = state.phase === "player" && state.player.length === 2 && state.balance >= state.bet;
  const pixiEventKey = `${state.phase}:${state.player.join("|")}:${state.dealer.join("|")}:${state.result ?? "none"}:${state.bet}`;
  const playerActions = [
    { label: "HIT", run: onHit, disabled: false },
    { label: "STAND", run: onStand, disabled: false },
    { label: "DOUBLE", run: onDouble, disabled: !canDouble }
  ];
  useTvRemoteInput((action) => {
    if (action === "BACK") {
      onBack();
      return;
    }
    if (action === "MENU") {
      onLegend();
      return;
    }
    if (state.phase === "betting") {
      const currentChipIndex = Math.max(0, CHIPS.indexOf(pendingBet));
      if (action === "LEFT" || action === "RIGHT") {
        const delta = action === "LEFT" ? -1 : 1;
        setPendingBet(CHIPS[(currentChipIndex + delta + CHIPS.length) % CHIPS.length]);
        return;
      }
      if (action === "SELECT" && pendingBet <= state.balance) onBet(pendingBet);
      return;
    }
    if (state.phase === "player") {
      const enabled = playerActions.filter((item) => !item.disabled);
      if (action === "LEFT" || action === "RIGHT") {
        const delta = action === "LEFT" ? -1 : 1;
        setRemoteActionIndex((index) => (index + delta + enabled.length) % enabled.length);
        return;
      }
      if (action === "SELECT") enabled[remoteActionIndex % enabled.length]?.run();
      return;
    }
    if (state.phase === "settled" && action === "SELECT") onNext();
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "w-full text-white flex flex-col overflow-hidden relative trey-screen-enter",
      style: {
        height: "100dvh",
        background: `
          radial-gradient(ellipse at 50% -10%, rgba(255,200,87,0.20) 0%, transparent 42%),
          radial-gradient(ellipse at 15% 35%, rgba(0,183,255,0.12) 0%, transparent 38%),
          radial-gradient(ellipse at 88% 72%, rgba(168,85,247,0.16) 0%, transparent 42%),
          linear-gradient(180deg, #05070D 0%, #07101f 48%, #02040a 100%)
        `,
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-events-none absolute inset-0 opacity-80", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full blur-[150px] trey-ambient-glow",
              style: {
                background: "radial-gradient(circle, rgba(255,200,87,0.18) 0%, transparent 72%)"
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "absolute bottom-10 -right-28 w-[420px] h-[420px] rounded-full blur-[130px]",
              style: {
                background: "radial-gradient(circle, rgba(168,85,247,0.16) 0%, transparent 72%)"
              }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "header",
          {
            className: "shrink-0 z-20 backdrop-blur-2xl border-b",
            style: {
              background: "rgba(5,7,13,0.78)",
              borderColor: "rgba(255,200,87,0.25)"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-2 flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: onBack,
                    className: "w-10 h-10 inline-flex items-center justify-center rounded-xl hover:bg-white/5 border border-white/5",
                    "aria-label": "Back",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 18 })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TreyBrandMark, { size: 22, glow: true, className: "shrink-0" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-5 w-px bg-white/15 shrink-0" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-300 text-base leading-none drop-shadow-[0_0_10px_rgba(255,200,87,0.75)]", children: "♦" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-black tracking-tight leading-none truncate", children: "Blackjack" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[9px] text-amber-200/70 tracking-[0.22em] font-bold leading-tight truncate", children: [
                      "PRIVATE TABLE ",
                      roomCode ? `· ${roomCode}` : "· SOLO LOUNGE"
                    ] })
                  ] })
                ] }),
                chatButton || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-slate-500 font-bold tracking-[0.18em] hidden xs:inline", children: "CHAT IN ROOMS" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: onLegend,
                    className: "w-10 h-10 inline-flex items-center justify-center rounded-xl hover:bg-white/5 border border-white/5",
                    "aria-label": "Info",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { size: 16 })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 pb-2 grid grid-cols-4 gap-1.5 text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Metric,
                  {
                    label: "BAL",
                    value: state.balance.toLocaleString(),
                    color: "#FFC857"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Metric,
                  {
                    label: "BET",
                    value: `${state.bet || pendingBet}`,
                    color: "#00B7FF"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Metric,
                  {
                    label: "DEALER",
                    value: state.dealer.length ? `${dealerShownVal}` : "—",
                    color: "#A855F7"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Metric,
                  {
                    label: "YOU",
                    value: state.player.length ? `${playerVal}` : "—",
                    color: accent
                  }
                )
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 min-h-0 px-3 py-2 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            "data-game-table": true,
            className: `relative w-full h-full max-w-md mx-auto rounded-[32px] overflow-hidden ombre-border ${isBust ? "trey-bust-shake" : ""} ${isWin ? "trey-win-burst" : ""}`,
            style: {
              background: "radial-gradient(120% 90% at 50% 0%, oklch(0.26 0.09 82) 0%, oklch(0.17 0.06 78) 30%, oklch(0.11 0.04 72) 60%, oklch(0.07 0.02 68) 100%)",
              boxShadow: `0 0 70px oklch(0.84 0.14 82 / 0.20), 0 0 100px oklch(0.72 0.24 300 / 0.12)`
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-x-0 top-0 h-1/2", style: { background: "linear-gradient(180deg, oklch(1 0 0 / 0.07) 0%, transparent 55%)", zIndex: 1 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 mix-blend-screen opacity-50 z-[1]", style: { background: "radial-gradient(80% 60% at 20% 110%, oklch(0.84 0.14 82 / 0.22) 0%, transparent 60%), radial-gradient(70% 50% at 85% 5%, oklch(0.84 0.16 215 / 0.12) 0%, transparent 60%)" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 opacity-[0.05] z-[1]", style: { backgroundImage: "radial-gradient(oklch(1 0 0 / 0.4) 0.5px, transparent 0.6px)", backgroundSize: "3px 3px" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "filigree-corner z-[2]", style: { top: 6, left: 6 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "filigree-corner z-[2]", style: { top: 6, right: 6, transform: "scaleX(-1)" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "filigree-corner z-[2]", style: { bottom: 6, left: 6, transform: "scaleY(-1)" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "filigree-corner z-[2]", style: { bottom: 6, right: 6, transform: "scale(-1,-1)" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "/assets/games/spades-elite/treytv-logo.png", alt: "", className: "pointer-events-none select-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[110px] h-auto z-[1]", style: { opacity: 0.1, filter: "drop-shadow(0 0 10px oklch(0.84 0.14 82 / 0.25))" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[150px] h-[150px] rounded-full breathe z-[1]", style: { border: "1px solid oklch(0.84 0.14 82 / 0.38)", boxShadow: "0 0 18px oklch(0.84 0.14 82 / 0.22)" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sparkle z-[2]", style: { top: "15%", left: "20%", animationDelay: "0.3s" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sparkle z-[2]", style: { top: "25%", right: "16%", animationDelay: "1.8s" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sparkle z-[2]", style: { bottom: "30%", left: "28%", animationDelay: "0s" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                PixiBlackjackTableLazy,
                {
                  dealerCards: state.dealer,
                  playerCards: state.player,
                  phase: state.phase,
                  result: state.result,
                  bet: state.bet,
                  accent,
                  eventKey: pixiEventKey
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 pointer-events-none", style: { zIndex: 10 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { position: "absolute", top: "8%", left: "50%", transform: "translate(-50%, -50%)", pointerEvents: "none" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  GamePlayerSeat,
                  {
                    displayName: "Dealer",
                    isBot: true,
                    isCurrentTurn: state.phase === "dealer",
                    accentColor: "#FFC857",
                    size: "lg",
                    position: "top"
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { position: "absolute", top: "88%", left: "50%", transform: "translate(-50%, -50%)", pointerEvents: "none" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  GamePlayerSeat,
                  {
                    displayName: "You",
                    avatarUrl: playerAvatarUrl,
                    publicProfileUid: playerPublicProfileUid,
                    isBot: false,
                    isCurrentTurn: state.phase === "player",
                    accentColor: "#00B7FF",
                    size: "md",
                    position: "bottom"
                  }
                ) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableLabel, { label: "DEALER", value: state.dealer.length > 0 ? dealerShownVal : void 0, color: "#FFC857" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableLabel, { label: "YOU", value: state.player.length > 0 ? playerVal : void 0, color: "#00B7FF" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "absolute left-1/2 top-[28%] -translate-x-1/2 -translate-y-1/2 rounded-[18px] pointer-events-none transition-opacity",
                  style: {
                    width: "min(72%, 300px)",
                    height: "clamp(82px, 18vh, 132px)",
                    border: "1px solid rgba(255,200,87,0.45)",
                    boxShadow: state.phase === "dealer" ? "0 0 28px rgba(255,200,87,0.30), inset 0 0 24px rgba(255,200,87,0.08)" : "none",
                    opacity: state.phase === "dealer" ? 1 : 0.18
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "absolute left-1/2 top-[68%] -translate-x-1/2 -translate-y-1/2 rounded-[18px] pointer-events-none transition-opacity",
                  style: {
                    width: "min(78%, 320px)",
                    height: "clamp(92px, 20vh, 144px)",
                    border: "1px solid rgba(0,183,255,0.50)",
                    boxShadow: state.phase === "player" ? "0 0 30px rgba(0,183,255,0.34), inset 0 0 24px rgba(0,183,255,0.08)" : "none",
                    opacity: state.phase === "player" ? 1 : 0.16
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none flex flex-col items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "rounded-2xl border px-3 py-1.5 text-center backdrop-blur-xl",
                    style: {
                      background: "rgba(5,7,13,0.72)",
                      borderColor: `${accent}40`,
                      boxShadow: `0 0 22px ${accent}18, inset 0 1px 0 rgba(255,255,255,0.06)`
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[8px] tracking-[0.32em] font-black", style: { color: accent }, children: "TREY TV BLACKJACK" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] text-slate-500 font-bold tracking-wide", children: "3:2 · Dealer 17 · Virtual" })
                    ]
                  }
                ),
                state.result && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "mt-1 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black trey-score-pop",
                    style: {
                      background: isWin ? "rgba(34,197,94,0.18)" : isPush ? "rgba(255,200,87,0.18)" : "rgba(239,68,68,0.18)",
                      color: accent,
                      border: `1px solid ${accent}90`,
                      boxShadow: `0 0 18px ${accent}35`
                    },
                    children: [
                      state.result.toUpperCase(),
                      " · ",
                      state.message
                    ]
                  }
                ),
                state.player.length === 0 && state.phase === "betting" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-slate-500 font-bold tracking-wide mt-1", children: "Select chips below to deal" })
              ] })
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "section",
          {
            "data-game-action-panel": true,
            className: "shrink-0 z-30 backdrop-blur-2xl border-t px-3 pt-2.5 pb-3",
            style: {
              background: "linear-gradient(180deg, rgba(8,17,31,0.90), rgba(5,7,13,0.98))",
              borderColor: `${accent}40`,
              boxShadow: `0 -14px 34px ${accent}16`
            },
            children: [
              state.phase === "betting" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2 gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.32em] font-black text-amber-300", children: "PLACE BET" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-400", children: "Choose your virtual chips" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "px-3 py-1 rounded-full text-xs font-black tabular-nums",
                      style: {
                        color: "#05070D",
                        background: "linear-gradient(90deg,#FFC857,#FFB000)",
                        boxShadow: "0 0 16px rgba(255,200,87,0.45)"
                      },
                      children: pendingBet
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-6 gap-1.5 mb-2", children: CHIPS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => setPendingBet(c),
                    className: `h-10 rounded-full font-black text-[11px] transition-all active:scale-95 trey-gold-chip ${tvRemoteMode && pendingBet === c ? "ring-4 ring-amber-300/70" : ""}`,
                    style: {
                      border: "1px solid " + (pendingBet === c ? "#FFC857" : "rgba(255,200,87,0.28)"),
                      color: pendingBet === c ? "#05070D" : "#FFE4A3",
                      opacity: pendingBet === c ? 1 : 0.72,
                      boxShadow: pendingBet === c ? "0 0 22px rgba(255,200,87,0.62), inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -5px 10px rgba(88,55,4,0.50)" : "0 5px 12px rgba(0,0,0,0.36), inset 0 1px 0 rgba(255,255,255,0.20)"
                    },
                    children: c >= 1e3 ? "1K" : c
                  },
                  c
                )) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    disabled: pendingBet > state.balance,
                    onClick: () => onBet(pendingBet),
                    className: "w-full py-3 rounded-2xl font-black text-sm disabled:opacity-40 active:scale-[0.98] transition tracking-[0.1em] trey-glass-button",
                    style: {
                      background: "linear-gradient(90deg,#FFC857,#FFB000)",
                      color: "#05070D",
                      boxShadow: "0 0 22px rgba(255,200,87,0.45)"
                    },
                    children: [
                      "DEAL HAND · BET ",
                      pendingBet
                    ]
                  }
                )
              ] }),
              state.phase === "player" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ActionBtn, { label: "HIT", onClick: onHit, remoteFocused: tvRemoteMode && remoteActionIndex % 3 === 0 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ActionBtn, { label: "STAND", onClick: onStand, primary: true, remoteFocused: tvRemoteMode && remoteActionIndex % 3 === 1 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ActionBtn,
                  {
                    label: "DOUBLE",
                    onClick: onDouble,
                    disabled: !canDouble,
                    remoteFocused: tvRemoteMode && remoteActionIndex % 3 === 2
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ActionBtn, { label: "SPLIT", onClick: () => {
                }, disabled: true })
              ] }),
              state.phase === "settled" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: onNext,
                  className: "w-full py-3 rounded-2xl font-black text-sm active:scale-[0.98] transition tracking-[0.12em] trey-glass-button",
                  style: {
                    background: isWin ? "linear-gradient(90deg,#22C55E,#00B7FF)" : "linear-gradient(90deg,#00B7FF,#A855F7)",
                    boxShadow: `0 0 22px ${accent}55`
                  },
                  children: "NEXT HAND"
                }
              )
            ]
          }
        ),
        chatDrawer
      ]
    }
  );
};
const Metric = ({
  label,
  value,
  color
}) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  "div",
  {
    className: "rounded-xl px-1.5 py-1.5 border overflow-hidden",
    style: {
      background: `${color}0f`,
      borderColor: `${color}40`,
      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 0 14px ${color}10`
    },
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[8px] tracking-[0.22em] font-black", style: { color }, children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-black text-xs tabular-nums truncate", children: value })
    ]
  }
);
const TableLabel = ({ label, value, color }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  "div",
  {
    className: "inline-flex items-center gap-2 px-3 py-1 rounded-full border backdrop-blur-xl",
    style: {
      background: "rgba(5,7,13,0.58)",
      borderColor: `${color}55`,
      boxShadow: `0 0 16px ${color}22`
    },
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] tracking-[0.28em] font-black", style: { color }, children: label }),
      value !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-black text-white/90 tabular-nums", children: value })
    ]
  }
);
const ActionBtn = ({ label, onClick, primary, disabled, remoteFocused }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "button",
  {
    onClick,
    disabled,
    className: `py-3 rounded-2xl font-black text-[11px] tracking-[0.13em] transition-all active:scale-95 trey-glass-button ${disabled ? "trey-premium-disabled" : ""} ${remoteFocused ? "ring-4 ring-amber-300/70 shadow-[0_0_24px_rgba(251,191,36,0.45)]" : ""}`,
    style: {
      background: primary ? "linear-gradient(90deg,#FFC857,#FFB000)" : "rgba(255,200,87,0.08)",
      color: primary ? "#05070D" : "#FFC857",
      border: "1px solid rgba(255,200,87,0.38)",
      boxShadow: primary ? "0 0 18px rgba(255,200,87,0.4), inset 0 1px 0 rgba(255,255,255,0.25)" : "inset 0 1px 0 rgba(255,255,255,0.05)"
    },
    children: label
  }
);
const BOT_CLAIM_DELAY_MS = 2400;
const BOT_CHALLENGE_DELAY_MS = 2600;
const REVEAL_CLEAR_DELAY_MS = 3400;
const HUMAN_TURN_TIMEOUT_MS = 15e3;
function bsApply(state, move) {
  switch (move.type) {
    case "claim":
      return makeClaim(state, move.seat, move.payload.cardIds, move.payload.rank);
    case "call":
      return callBullshit(state, move.seat);
    case "pass":
      return passChallenge(state);
    case "clear-reveal":
      return { ...state, reveal: null };
    default:
      return state;
  }
}
function bsExtract(s) {
  return { currentSeat: s.currentSeat, phase: s.phase, ended: s.phase === "game-over" };
}
const BullshitTable = (props) => {
  if (props.roomId && props.identity) return /* @__PURE__ */ jsxRuntimeExports.jsx(ServerBS, { ...props, roomId: props.roomId, identity: props.identity });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(LocalBS, { ...props });
};
const LocalBS = ({ onBack, onLegend }) => {
  const [state, setState] = reactExports.useState(() => newBullshitGame(["You", "Aaliyah", "Marcus", "Jamal"]));
  const [selected, setSelected] = reactExports.useState([]);
  reactExports.useEffect(() => {
    if (state.phase === "playing") {
      const seat = state.currentSeat;
      const t = setTimeout(() => {
        const { cardIds, rank } = botClaim(state, seat);
        setState((s) => makeClaim(s, seat, cardIds, rank));
      }, state.players[seat].isBot ? BOT_CLAIM_DELAY_MS : HUMAN_TURN_TIMEOUT_MS);
      return () => clearTimeout(t);
    }
    if (state.phase === "awaiting-challenge") {
      const callerSeats = state.players.filter((p) => p.isBot && p.seat !== state.lastClaim?.seat).map((p) => p.seat);
      const hasHumanCaller = state.players.some((p) => !p.isBot && p.seat !== state.lastClaim?.seat);
      const t = setTimeout(() => {
        const caller = callerSeats.find((s) => botShouldCall(state, s));
        if (caller !== void 0) setState((s) => callBullshit(s, caller));
        else setState(passChallenge);
      }, hasHumanCaller ? HUMAN_TURN_TIMEOUT_MS : BOT_CHALLENGE_DELAY_MS);
      return () => clearTimeout(t);
    }
  }, [state.phase, state.currentSeat, state.lastClaim?.cardIds.join(",")]);
  reactExports.useEffect(() => {
    if (state.reveal) {
      const t = setTimeout(() => setState((s) => ({ ...s, reveal: null })), REVEAL_CLEAR_DELAY_MS);
      return () => clearTimeout(t);
    }
  }, [state.reveal]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    BSView,
    {
      state,
      mySeat: 0,
      selected,
      setSelected,
      onClaim: () => {
        if (selected.length) {
          setState((s) => makeClaim(s, 0, selected, s.expectedRank));
          setSelected([]);
        }
      },
      onCall: () => setState((s) => callBullshit(s, 0)),
      onPass: () => setState(passChallenge),
      onRestart: () => {
        setState(newBullshitGame(["You", "Aaliyah", "Marcus", "Jamal"]));
        setSelected([]);
      },
      onBack,
      onLegend,
      myAvatarUrl: null
    }
  );
};
const ServerBS = ({ roomId, identity, onBack, onLegend }) => {
  const apply = reactExports.useCallback(bsApply, []);
  const extract = reactExports.useCallback(bsExtract, []);
  const room = useRealtimeRoom(roomId, identity, apply, extract);
  const [selected, setSelected] = reactExports.useState([]);
  const [chatOpen, setChatOpen] = reactExports.useState(false);
  const chat = useChat({ roomId, identity, mySeat: room.mySeat, isOpen: chatOpen });
  const state = room.state;
  const mySeat = room.mySeat;
  const roomPlayersKey = room.players.map((p) => `${p.seat_index}:${p.display_name}:${p.is_bot}`).join("|");
  reactExports.useEffect(() => {
    if (!room.isHost || !state) return;
    const activeState = syncBSPlayersFromRoom(state, room.players);
    if (activeState !== state) room.setHostState(activeState);
    if (activeState.phase === "playing") {
      const seatPlayer = room.players.find((p) => p.seat_index === activeState.currentSeat);
      const seat = activeState.currentSeat;
      const t = setTimeout(() => {
        const { cardIds, rank } = botClaim(activeState, seat);
        room.setHostState(makeClaim(activeState, seat, cardIds, rank));
      }, seatPlayer?.is_bot ? BOT_CLAIM_DELAY_MS : HUMAN_TURN_TIMEOUT_MS);
      return () => clearTimeout(t);
    }
    if (activeState.phase === "awaiting-challenge") {
      const botCallers = room.players.filter((p) => p.is_bot && p.seat_index !== activeState.lastClaim?.seat).map((p) => p.seat_index);
      const hasHumanCaller = room.players.some((p) => !p.is_bot && p.seat_index !== activeState.lastClaim?.seat);
      const t = setTimeout(() => {
        const caller = botCallers.find((s) => botShouldCall(activeState, s));
        if (caller !== void 0) room.setHostState(callBullshit(activeState, caller));
        else room.setHostState(passChallenge(activeState));
      }, hasHumanCaller ? HUMAN_TURN_TIMEOUT_MS : BOT_CHALLENGE_DELAY_MS);
      return () => clearTimeout(t);
    }
  }, [room.isHost, state?.phase, state?.currentSeat, state?.lastClaim?.cardIds.join(","), roomPlayersKey]);
  reactExports.useEffect(() => {
    if (!room.isHost || !state?.reveal) return;
    const t = setTimeout(() => room.setHostState({ ...state, reveal: null }), REVEAL_CLEAR_DELAY_MS);
    return () => clearTimeout(t);
  }, [room.isHost, state?.reveal]);
  if (room.loading || !state || mySeat === null) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-[100dvh] flex items-center justify-center text-slate-400", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin mr-2" }),
    " Syncing room…"
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    BSView,
    {
      state,
      mySeat,
      selected,
      setSelected,
      onClaim: () => {
        if (selected.length) {
          room.sendMove({ type: "claim", seat: mySeat, payload: { cardIds: selected, rank: state.expectedRank } });
          setSelected([]);
        }
      },
      onCall: () => room.sendMove({ type: "call", seat: mySeat }),
      onPass: () => room.sendMove({ type: "pass", seat: mySeat }),
      onRestart: onBack,
      onBack,
      onLegend,
      roomCode: room.room?.room_code,
      myAvatarUrl: identity.avatarUrl,
      myPublicProfileUid: identity.publicProfileUid,
      chatButton: /* @__PURE__ */ jsxRuntimeExports.jsx(ChatHeaderButton, { unread: chat.unread, accent: "#A855F7", onClick: () => setChatOpen(true) }),
      chatDrawer: /* @__PURE__ */ jsxRuntimeExports.jsx(
        GameChatDrawer,
        {
          open: chatOpen,
          onClose: () => setChatOpen(false),
          messages: chat.messages,
          loading: chat.loading,
          myUserId: identity.userId,
          mySeat,
          onSend: chat.send,
          accent: "#A855F7"
        }
      )
    }
  );
};
const BSView = ({ state, mySeat, selected, setSelected, onClaim, onCall, onPass, onRestart, onBack, onLegend, roomCode, myAvatarUrl, myPublicProfileUid, chatButton, chatDrawer }) => {
  const you = state.players[mySeat];
  const isYourTurn = state.phase === "playing" && state.currentSeat === mySeat;
  const canCall = state.phase === "awaiting-challenge" && state.lastClaim && state.lastClaim.seat !== mySeat;
  const opponents = state.players.filter((_, i) => i !== mySeat).slice(0, 3);
  const [remoteZone, setRemoteZone] = reactExports.useState("hand");
  const [remoteCardIndex, setRemoteCardIndex] = reactExports.useState(0);
  const [remoteActionIndex, setRemoteActionIndex] = reactExports.useState(0);
  const tvRemoteMode = useTvRemoteMode();
  const isCaughtBluff = state.reveal?.liar;
  const pixiEventKey = `${state.phase}:${state.lastClaim?.cardIds.join("|") ?? "none"}:${state.pile.length}:${state.reveal?.cards.join("|") ?? "none"}:${state.reveal?.liar ?? "none"}`;
  const selectionResetKey = `${state.phase}:${state.currentSeat}:${state.lastClaim?.cardIds.join("|") ?? "none"}:${state.pile.length}:${you.hand.length}`;
  reactExports.useEffect(() => {
    setSelected([]);
  }, [selectionResetKey, setSelected]);
  const toggleSelectedCard = reactExports.useCallback((cardId) => {
    if (!isYourTurn) return;
    setSelected((s) => s.includes(cardId) ? s.filter((x) => x !== cardId) : s.length < 4 ? [...s, cardId] : s);
  }, [isYourTurn, setSelected]);
  useTvRemoteInput((action) => {
    if (action === "BACK") {
      onBack();
      return;
    }
    if (action === "MENU") {
      onLegend();
      return;
    }
    if (state.phase === "game-over") {
      if (action === "SELECT") onRestart();
      return;
    }
    if (action === "UP" || action === "DOWN") {
      setRemoteZone((zone) => zone === "hand" ? "actions" : "hand");
      return;
    }
    if (remoteZone === "hand") {
      if (action === "LEFT" || action === "RIGHT") {
        const delta = action === "LEFT" ? -1 : 1;
        setRemoteCardIndex((index) => (index + delta + Math.max(you.hand.length, 1)) % Math.max(you.hand.length, 1));
        return;
      }
      if (action === "SELECT") {
        const card = you.hand[remoteCardIndex % Math.max(you.hand.length, 1)];
        if (card) toggleSelectedCard(card);
      }
      return;
    }
    const actions = canCall ? [onCall, onPass] : isYourTurn ? [onClaim] : [];
    if (action === "LEFT" || action === "RIGHT") {
      setRemoteActionIndex((index) => actions.length ? (index + (action === "LEFT" ? -1 : 1) + actions.length) % actions.length : index);
      return;
    }
    if (action === "SELECT") actions[remoteActionIndex % Math.max(actions.length, 1)]?.();
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `w-full text-white flex flex-col overflow-hidden relative ${isCaughtBluff ? "trey-bust-shake" : ""}`,
      style: {
        height: "100dvh",
        background: "radial-gradient(ellipse at top, #1a0a2a 0%, #05070D 60%)",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute -top-32 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full blur-[140px] trey-ambient-glow",
            style: { background: "radial-gradient(circle, rgba(168,85,247,0.20) 0%, transparent 70%)" }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "shrink-0 z-20 backdrop-blur-2xl border-b", style: { background: "rgba(8,17,31,0.85)", borderColor: "rgba(168,85,247,0.3)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-2 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onBack, className: "w-10 h-10 inline-flex items-center justify-center rounded-lg hover:bg-white/5 border border-white/5", "aria-label": "Back", title: "Back", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 18 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TreyBrandMark, { size: 20, glow: true, className: "shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-px bg-white/15 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { size: 14, className: "text-purple-300 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-black tracking-tight truncate", children: "Bullshit" }),
            roomCode && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[9px] font-mono text-cyan-300 tracking-wider truncate", children: [
              "· ",
              roomCode
            ] })
          ] }),
          chatButton,
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onLegend, className: "w-10 h-10 inline-flex items-center justify-center rounded-lg hover:bg-white/5 border border-white/5", "aria-label": "Suit legend", title: "Suit legend", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { size: 16 }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 min-h-0 px-3 py-2 flex items-stretch justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            "data-game-table": true,
            className: "relative w-full h-full max-w-md mx-auto rounded-[26px] overflow-hidden ombre-border",
            style: {
              background: "radial-gradient(120% 90% at 50% 0%, oklch(0.30 0.14 295) 0%, oklch(0.20 0.10 290) 30%, oklch(0.13 0.07 285) 60%, oklch(0.08 0.03 280) 100%)",
              boxShadow: "0 0 70px oklch(0.72 0.24 300 / 0.22), 0 0 100px oklch(0.84 0.16 215 / 0.12)"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-x-0 top-0 h-1/2 z-[1]", style: { background: "linear-gradient(180deg, oklch(1 0 0 / 0.06) 0%, transparent 55%)" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 mix-blend-screen opacity-50 z-[1]", style: { background: "radial-gradient(80% 60% at 15% 110%, oklch(0.84 0.14 82 / 0.16) 0%, transparent 60%), radial-gradient(70% 50% at 90% 5%, oklch(0.84 0.16 215 / 0.18) 0%, transparent 60%)" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 opacity-[0.05] z-[1]", style: { backgroundImage: "radial-gradient(oklch(1 0 0 / 0.4) 0.5px, transparent 0.6px)", backgroundSize: "3px 3px" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "filigree-corner z-[2]", style: { top: 6, left: 6 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "filigree-corner z-[2]", style: { top: 6, right: 6, transform: "scaleX(-1)" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "filigree-corner z-[2]", style: { bottom: 6, left: 6, transform: "scaleY(-1)" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "filigree-corner z-[2]", style: { bottom: 6, right: 6, transform: "scale(-1,-1)" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "/assets/games/spades-elite/treytv-logo.png", alt: "", className: "pointer-events-none select-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[110px] h-auto z-[1]", style: { opacity: 0.1, filter: "drop-shadow(0 0 10px oklch(0.72 0.26 300 / 0.3))" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[150px] h-[150px] rounded-full breathe z-[1]", style: { border: "1px solid oklch(0.84 0.14 82 / 0.35)", boxShadow: "0 0 18px oklch(0.72 0.26 300 / 0.20)" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sparkle z-[2]", style: { top: "16%", left: "22%", animationDelay: "0.5s" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sparkle z-[2]", style: { top: "28%", right: "18%", animationDelay: "2.0s" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sparkle z-[2]", style: { bottom: "32%", right: "24%", animationDelay: "1.1s" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 pointer-events-none", style: { zIndex: 10 }, children: [
                opponents.map((opp, i) => {
                  const n = opponents.length;
                  const xPct = n === 1 ? 50 : n === 2 ? [25, 75][i] : [16.7, 50, 83.3][i];
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      style: {
                        position: "absolute",
                        left: `${xPct}%`,
                        top: "8%",
                        transform: "translate(-50%, -50%)",
                        pointerEvents: "none"
                      },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        GamePlayerSeat,
                        {
                          displayName: opp.name,
                          isBot: opp.isBot,
                          isCurrentTurn: state.currentSeat === opp.seat,
                          cardCount: opp.hand.length,
                          accentColor: "#A855F7",
                          size: "sm",
                          position: "top"
                        }
                      )
                    },
                    opp.seat
                  );
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { position: "absolute", insetInline: 8, bottom: 8, pointerEvents: "none" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "relative overflow-hidden rounded-[22px] border px-3 py-2 flex items-center gap-3",
                    style: {
                      minHeight: 72,
                      background: "linear-gradient(90deg, rgba(8,6,18,0.90), rgba(18,10,31,0.76))",
                      borderColor: isYourTurn ? "rgba(255,200,87,0.60)" : "rgba(168,85,247,0.34)",
                      boxShadow: isYourTurn ? "0 0 26px rgba(255,200,87,0.20), inset 0 1px 0 rgba(255,255,255,0.08)" : "0 10px 28px rgba(0,0,0,0.34)",
                      backdropFilter: "blur(18px)"
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        GamePlayerSeat,
                        {
                          displayName: you.name,
                          avatarUrl: myAvatarUrl,
                          publicProfileUid: myPublicProfileUid,
                          isBot: you.isBot,
                          isCurrentTurn: isYourTurn,
                          cardCount: you.hand.length,
                          accentColor: "#A855F7",
                          size: "md",
                          position: "bottom"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] tracking-[0.30em] font-black", style: { color: isYourTurn ? "#FFC857" : "#C4A6FF" }, children: isYourTurn ? "ACTIVE SEAT" : "YOUR SEAT" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-black truncate mt-0.5", children: you.name }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          {
                            className: "mt-1 inline-flex rounded-full px-2 py-0.5 border text-[10px] font-bold text-purple-100",
                            style: { background: "rgba(168,85,247,0.10)", borderColor: "rgba(168,85,247,0.28)" },
                            children: [
                              you.hand.length,
                              " cards"
                            ]
                          }
                        )
                      ] })
                    ]
                  }
                ) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                PixiBullshitTableLazy,
                {
                  myHand: you.hand,
                  opponents: opponents.map((p) => ({ name: p.name, cardCount: p.hand.length })),
                  pileCount: state.pile.length,
                  revealCards: state.reveal?.cards ?? null,
                  revealLiar: state.reveal?.liar ?? null,
                  awaitingChallenge: state.phase === "awaiting-challenge",
                  selectedCards: selected,
                  isMyTurn: isYourTurn,
                  expectedRank: state.expectedRank,
                  accent: "#A855F7",
                  eventKey: pixiEventKey,
                  onCardClick: toggleSelectedCard,
                  renderHand: false
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center px-2 py-2 pointer-events-none z-10", children: [
                state.reveal ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "inline-block px-4 py-1.5 rounded-full text-[11px] font-black tracking-wider trey-glass-button",
                    style: {
                      background: state.reveal.liar ? "rgba(239,68,68,0.18)" : "rgba(34,197,94,0.18)",
                      color: state.reveal.liar ? "#EF4444" : "#22C55E",
                      border: "1px solid currentColor",
                      boxShadow: `0 0 26px ${state.reveal.liar ? "rgba(239,68,68,0.34)" : "rgba(34,197,94,0.30)"}`
                    },
                    children: state.reveal.liar ? "BLUFF CAUGHT!" : "CLAIM WAS TRUE!"
                  }
                ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "relative px-5 py-3 rounded-[24px] border backdrop-blur-xl trey-glass-panel pointer-events-none",
                    style: {
                      borderColor: "rgba(168,85,247,0.45)",
                      boxShadow: "0 0 36px rgba(168,85,247,0.18), inset 0 1px 0 rgba(255,255,255,0.09)"
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] text-purple-300 tracking-[0.3em] font-black", children: "CURRENT CLAIM" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black mt-0.5", children: state.lastClaim ? `${state.lastClaim.count} x ${state.lastClaim.rank}` : `Claim ${state.expectedRank}` }),
                      state.lastClaim && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-slate-400 mt-0.5", children: [
                        "by ",
                        state.players[state.lastClaim.seat].name
                      ] })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-slate-300 font-bold mt-2 bg-black/40 px-2 py-0.5 rounded", children: isYourTurn ? `Your turn — claim ${state.expectedRank}s` : canCall ? `Pass or call BS` : state.phase === "game-over" ? "" : `${state.players[state.currentSeat].name} is thinking…` })
              ] })
            ]
          }
        ) }),
        state.phase !== "game-over" && /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "shrink-0 z-20 px-2 pt-1", style: { overflow: "visible" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative flex items-end justify-center", style: { height: 120, pointerEvents: "none" }, children: (() => {
          const total = you.hand.length;
          if (total === 0) return null;
          const center = (total - 1) / 2;
          const viewportWidth = typeof window === "undefined" ? 390 : window.innerWidth;
          const handWidth = Math.min(372, Math.max(304, viewportWidth - 34));
          const spreadX = Math.min(27, (handWidth - 70) / Math.max(total - 1, 1));
          const arc = 2.2;
          return you.hand.map((cardId, i) => {
            const offset = i - center;
            const isSelected = selected.includes(cardId);
            const remoteFocused = tvRemoteMode && remoteZone === "hand" && remoteCardIndex % Math.max(you.hand.length, 1) === i;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => toggleSelectedCard(cardId),
                className: "absolute bottom-0 transition-all duration-200 ease-out focus:outline-none",
                style: {
                  left: "50%",
                  width: 60,
                  height: 86,
                  marginLeft: -30,
                  transform: `translateX(${offset * spreadX}px) translateY(${isSelected || remoteFocused ? -40 : Math.abs(offset) * 1.5}px) rotate(${isSelected || remoteFocused ? 0 : offset * arc}deg) scale(${isSelected || remoteFocused ? 1.16 : 1})`,
                  zIndex: isSelected ? 100 + i : i + 1,
                  pointerEvents: isYourTurn ? "auto" : "none",
                  filter: remoteFocused ? "drop-shadow(0 0 18px rgba(251,191,36,0.7))" : void 0
                },
                "aria-label": cardId,
                "aria-pressed": isSelected,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TreyCard, { cardId, selected: isSelected, isLegal: isYourTurn }),
                  remoteFocused && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-amber-300/70 bg-amber-400/20 px-2 py-0.5 text-[9px] font-black tracking-wider text-amber-100", children: "TV FOCUS" })
                ]
              },
              cardId
            );
          });
        })() }) }),
        state.phase !== "game-over" && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "section",
          {
            "data-game-action-panel": true,
            className: "shrink-0 z-30 backdrop-blur-2xl border-t pt-2 pb-2.5 px-2",
            style: { background: "rgba(8,17,31,0.96)", borderColor: "rgba(168,85,247,0.3)", boxShadow: "0 -10px 30px rgba(168,85,247,0.18)" },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-center gap-1.5 mb-2 flex-wrap", children: [
              isYourTurn && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: onClaim,
                    disabled: selected.length === 0,
                    className: `min-h-9 px-5 py-2 rounded-full font-black text-[11px] tracking-[0.15em] uppercase disabled:opacity-40 active:scale-95 transition ${tvRemoteMode && remoteZone === "actions" ? "ring-4 ring-amber-300/70" : ""}`,
                    style: {
                      background: selected.length > 0 ? "linear-gradient(90deg,#A855F7,#00B7FF)" : "rgba(255,255,255,0.06)",
                      color: "#fff",
                      boxShadow: selected.length > 0 ? "0 0 22px rgba(168,85,247,0.5)" : "none",
                      border: selected.length > 0 ? "none" : "1px solid rgba(255,255,255,0.1)"
                    },
                    children: [
                      "Play ",
                      selected.length || 0,
                      " × ",
                      state.expectedRank
                    ]
                  }
                ),
                selected.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "self-center rounded-full px-2.5 py-1 border text-[10px] font-black text-purple-100",
                    style: { background: "rgba(168,85,247,0.12)", borderColor: "rgba(168,85,247,0.36)" },
                    children: [
                      selected.length,
                      " selected"
                    ]
                  }
                )
              ] }),
              canCall && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: onCall,
                    className: `px-5 py-1.5 rounded-full font-black text-[11px] tracking-[0.15em] uppercase active:scale-95 transition ${tvRemoteMode && remoteZone === "actions" && remoteActionIndex % 2 === 0 ? "ring-4 ring-amber-300/70" : ""}`,
                    style: { background: "linear-gradient(90deg,#EF4444,#FFB000)", color: "#fff", boxShadow: "0 0 22px rgba(239,68,68,0.5)" },
                    children: "Call BS"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: onPass,
                    className: `px-5 py-1.5 rounded-full font-black text-[11px] tracking-[0.15em] uppercase border active:scale-95 transition ${tvRemoteMode && remoteZone === "actions" && remoteActionIndex % 2 === 1 ? "ring-4 ring-amber-300/70" : ""}`,
                    style: { borderColor: "rgba(255,255,255,0.2)", color: "#94A3B8" },
                    children: "Pass"
                  }
                )
              ] })
            ] })
          }
        ),
        state.phase === "game-over" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-md p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "w-full max-w-sm rounded-3xl p-5 border text-center trey-win-burst relative overflow-hidden",
            style: { background: "linear-gradient(160deg,#08111F,#05070D)", borderColor: "#A855F770", boxShadow: "0 0 60px rgba(168,85,247,0.35)" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-purple-300 tracking-[0.35em] font-black", children: "GAME OVER" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl sm:text-3xl font-black mt-2 mb-4", children: [
                state.players[state.winner].name,
                " wins!"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: onRestart,
                    className: "flex-1 py-3 rounded-2xl font-black text-sm active:scale-95 transition",
                    style: { background: "linear-gradient(90deg,#A855F7,#00B7FF)", boxShadow: "0 0 22px rgba(168,85,247,0.45)" },
                    children: "Play Again"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: onBack,
                    className: "flex-1 py-3 rounded-2xl font-bold text-sm border active:scale-95 transition",
                    style: { borderColor: "rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.04)" },
                    children: "Leave"
                  }
                )
              ] })
            ]
          }
        ) }),
        chatDrawer
      ]
    }
  );
};
function syncBSPlayersFromRoom(state, players) {
  let changed = false;
  const next = JSON.parse(JSON.stringify(state));
  players.forEach((player) => {
    const seat = player.seat_index;
    if (seat < 0 || seat >= next.players.length) return;
    if (next.players[seat].name !== player.display_name || next.players[seat].isBot !== player.is_bot) {
      next.players[seat].name = player.display_name;
      next.players[seat].isBot = player.is_bot;
      changed = true;
    }
  });
  return changed ? next : state;
}
const AdminPanel = ({ onBack }) => {
  const [rooms, setRooms] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [settings, setSettings] = reactExports.useState({
    privateRooms: true,
    bots: true,
    blackjack: true,
    bullshit: true,
    targetScore: 500,
    maxInactiveMin: 30
  });
  const load = async () => {
    setLoading(true);
    try {
      setRooms(await listActiveRooms());
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    load();
    const ch = supabase.channel("admin-rooms").on("postgres_changes", { event: "*", schema: "public", table: "game_rooms" }, () => load()).subscribe();
    const interval = setInterval(load, 3e4);
    return () => {
      supabase.removeChannel(ch);
      clearInterval(interval);
    };
  }, []);
  const toggle = (k) => setSettings((s) => ({ ...s, [k]: !s[k] }));
  const handleClose = async (id) => {
    await closeRoom(id);
    load();
  };
  const handleClearAbandoned = async () => {
    await clearAbandoned();
    load();
  };
  const minutesAgo = (iso) => {
    const diff = (Date.now() - new Date(iso).getTime()) / 1e3;
    if (diff < 60) return `${Math.round(diff)}s`;
    if (diff < 3600) return `${Math.round(diff / 60)}m`;
    return `${Math.round(diff / 3600)}h`;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full text-white pb-12", style: { background: "#05070D" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky top-0 z-20 backdrop-blur-xl border-b", style: { background: "rgba(5,7,13,0.85)", borderColor: "rgba(168,85,247,0.3)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto px-4 py-3 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onBack, className: "p-2 rounded-xl hover:bg-white/5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 20 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-purple-300 tracking-[0.2em]", children: "ADMIN" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold", children: "Game Room Monitor" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: load, className: "p-2 rounded-xl hover:bg-white/5", title: "Refresh", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 16, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 16 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] px-2 py-1 rounded-md", style: { background: "rgba(34,197,94,0.15)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.4)" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Server, { size: 11, className: "inline mr-1" }),
        " LIVE"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto px-4 pt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { size: 18 }), label: "Active", value: rooms.filter((r) => r.status === "active").length, color: "#22C55E" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 18 }), label: "Players", value: rooms.reduce((a, r) => a + r.current_players, 0), color: "#00B7FF" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 18 }), label: "Abandoned", value: rooms.filter((r) => r.status === "abandoned").length, color: "#EF4444" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Server, { size: 18 }), label: "Total", value: rooms.length, color: "#A855F7" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border", style: { background: "rgba(8,17,31,0.6)", borderColor: "rgba(0,183,255,0.2)" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b", style: { borderColor: "rgba(0,183,255,0.15)" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold", children: "Live Rooms" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handleClearAbandoned,
              disabled: !rooms.some((r) => r.status === "abandoned"),
              className: "text-xs px-3 py-1.5 rounded-lg disabled:opacity-30",
              style: { background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", color: "#EF4444" },
              children: "Clear Abandoned"
            }
          )
        ] }),
        loading && rooms.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-10 text-center text-sm text-slate-500", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 16, className: "animate-spin mx-auto mb-2" }),
          " Loading…"
        ] }) : rooms.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-10 text-center text-sm text-slate-500", children: "No rooms yet. When users create rooms they will appear here." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", style: { borderColor: "rgba(255,255,255,0.05)" }, children: rooms.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-xs px-2 py-1 rounded-md", style: { background: "rgba(0,183,255,0.12)", border: "1px solid rgba(0,183,255,0.3)" }, children: r.room_code }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-bold capitalize", children: [
              r.game_type,
              r.is_private ? " • private" : ""
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-slate-400 truncate", children: [
              "Host ",
              r.host_display_name,
              " • ",
              r.current_players,
              "/",
              r.max_players,
              " players • started ",
              minutesAgo(r.created_at),
              " ago • last active ",
              minutesAgo(r.last_activity_at),
              " ago"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: r.status }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleClose(r.id), className: "p-2 rounded-lg hover:bg-red-500/10 text-red-400", title: "Close room", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16 }) })
        ] }, r.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold mt-8 mb-3", children: "Game Settings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border divide-y", style: { background: "rgba(8,17,31,0.6)", borderColor: "rgba(0,183,255,0.2)" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Enable Private Rooms", value: settings.privateRooms, onToggle: () => toggle("privateRooms") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Enable Bot Mode", value: settings.bots, onToggle: () => toggle("bots") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Allow Blackjack", value: settings.blackjack, onToggle: () => toggle("blackjack") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRow, { label: "Allow Bullshit", value: settings.bullshit, onToggle: () => toggle("bullshit") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: "Target Spades Score" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-slate-400", children: "Default for new rooms" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "number",
              value: settings.targetScore,
              onChange: (e) => setSettings((s) => ({ ...s, targetScore: parseInt(e.target.value) || 500 })),
              className: "w-24 bg-black/40 rounded-lg px-3 py-2 text-sm border outline-none",
              style: { borderColor: "rgba(0,183,255,0.3)" }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: "Max Inactive (min)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-slate-400", children: "Auto-mark room as abandoned after this" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "number",
              value: settings.maxInactiveMin,
              onChange: (e) => setSettings((s) => ({ ...s, maxInactiveMin: parseInt(e.target.value) || 30 })),
              className: "w-24 bg-black/40 rounded-lg px-3 py-2 text-sm border outline-none",
              style: { borderColor: "rgba(0,183,255,0.3)" }
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-slate-500 mt-6 text-center", children: "Admin actions are scoped to the Game Room module and never modify other Trey TV systems." })
    ] })
  ] });
};
const StatCard = ({ icon, label, value, color }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl p-3 border", style: { background: "rgba(8,17,31,0.6)", borderColor: color + "40" }, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs", style: { color }, children: [
    icon,
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black mt-1", children: value })
] });
const StatusBadge = ({ status }) => {
  const m = {
    waiting: { c: "#00B7FF", t: "Waiting" },
    active: { c: "#22C55E", t: "Active" },
    ended: { c: "#94A3B8", t: "Ended" },
    abandoned: { c: "#EF4444", t: "Abandoned" }
  };
  const entry = m[status];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold px-2 py-1 rounded-md", style: { background: entry.c + "20", color: entry.c, border: "1px solid " + entry.c + "50" }, children: entry.t.toUpperCase() });
};
const ToggleRow = ({ label, value, onToggle }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 flex items-center justify-between", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: label }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onToggle, className: "transition-colors", style: { color: value ? "#22C55E" : "#475569" }, children: value ? /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRight, { size: 32 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleLeft, { size: 32 }) })
] });
const SuitLegendModal = ({ open, onClose }) => {
  if (!open) return null;
  const suits = ["spades", "hearts", "diamonds", "clubs"];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "relative w-full max-w-md rounded-3xl p-6 border",
      style: { background: "linear-gradient(160deg,#08111F,#05070D)", borderColor: "rgba(0,183,255,0.3)", boxShadow: "0 0 60px rgba(0,183,255,0.25)" },
      onClick: (e) => e.stopPropagation(),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "absolute top-4 right-4 text-slate-400 hover:text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-white mb-1", children: "Suit Legend" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-400 mb-5", children: "Trey TV custom suits map directly to classic gameplay." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: suits.map((s) => {
          const m = SUIT_DISPLAY[s];
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 rounded-2xl p-3 border", style: { background: "rgba(16,24,39,0.6)", borderColor: m.color + "40" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-4xl", style: { color: m.color, textShadow: `0 0 12px ${m.glow}` }, children: m.symbol }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-white font-semibold", children: m.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-400", children: m.gameplay })
            ] })
          ] }, s);
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 mt-5", children: "Blades is trump in Spades. All rules follow standard card-game logic." })
      ]
    }
  ) });
};
const CreateRoomModal = ({ open, onClose, onCreate, defaultGame = "spades" }) => {
  const [gameType, setGameType] = reactExports.useState(defaultGame);
  const [isPrivate, setIsPrivate] = reactExports.useState(true);
  const [targetScore, setTargetScore] = reactExports.useState(500);
  const [busy, setBusy] = reactExports.useState(false);
  if (!open) return null;
  const handle = async () => {
    setBusy(true);
    try {
      await onCreate({ gameType, isPrivate, targetScore });
    } finally {
      setBusy(false);
    }
  };
  const games = [
    { id: "spades", name: "Spades", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Spade, { size: 16 }), color: "#00B7FF" },
    { id: "blackjack", name: "Blackjack", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { size: 16 }), color: "#FFC857" },
    { id: "bullshit", name: "Bullshit", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 16 }), color: "#A855F7" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Backdrop, { onClose, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-cyan-300 tracking-widest", children: "CREATE ROOM" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold mb-4", children: "New Game Room" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs text-slate-400 mb-2 block", children: "Choose Game" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2 mb-5", children: games.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => setGameType(g.id),
        className: "rounded-2xl p-3 border transition-all trey-glass-button",
        style: {
          background: gameType === g.id ? g.color + "20" : "rgba(8,17,31,0.6)",
          borderColor: gameType === g.id ? g.color : "rgba(255,255,255,0.08)",
          color: gameType === g.id ? g.color : "#F8FAFC",
          boxShadow: gameType === g.id ? `0 0 18px ${g.color}40` : "none"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1.5", children: [
          g.icon,
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold", children: g.name })
        ] })
      },
      g.id
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs text-slate-400 mb-2 block", children: "Visibility" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setIsPrivate(true),
          className: "rounded-xl p-2.5 border flex items-center justify-center gap-2 text-sm trey-glass-button",
          style: {
            background: isPrivate ? "rgba(168,85,247,0.15)" : "rgba(8,17,31,0.6)",
            borderColor: isPrivate ? "#A855F7" : "rgba(255,255,255,0.08)",
            color: isPrivate ? "#C4A6FF" : "#94A3B8"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 14 }),
            " Private"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setIsPrivate(false),
          className: "rounded-xl p-2.5 border flex items-center justify-center gap-2 text-sm trey-glass-button",
          style: {
            background: !isPrivate ? "rgba(0,183,255,0.15)" : "rgba(8,17,31,0.6)",
            borderColor: !isPrivate ? "#00B7FF" : "rgba(255,255,255,0.08)",
            color: !isPrivate ? "#00B7FF" : "#94A3B8"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { size: 14 }),
            " Public"
          ]
        }
      )
    ] }),
    gameType === "spades" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs text-slate-400 mb-2 block", children: "Target Score" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 mb-5", children: [200, 300, 500].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setTargetScore(s),
          className: "flex-1 py-2 rounded-xl text-sm font-bold border trey-glass-button",
          style: {
            background: targetScore === s ? "rgba(255,200,87,0.15)" : "rgba(8,17,31,0.6)",
            borderColor: targetScore === s ? "#FFC857" : "rgba(255,255,255,0.08)",
            color: targetScore === s ? "#FFC857" : "#94A3B8"
          },
          children: s
        },
        s
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: handle,
        disabled: busy,
        className: "w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 trey-glass-button",
        style: { background: "linear-gradient(90deg,#00B7FF,#A855F7)", color: "#fff" },
        children: [
          busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 16, className: "animate-spin" }) : null,
          "Create Room"
        ]
      }
    )
  ] });
};
const JoinRoomModal = ({ open, onClose, onJoin }) => {
  const [code, setCode] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const [err, setErr] = reactExports.useState("");
  if (!open) return null;
  const handle = async () => {
    setBusy(true);
    setErr("");
    try {
      await onJoin(code.toUpperCase());
    } catch (e) {
      setErr(e.message || "Failed to join");
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Backdrop, { onClose, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-cyan-300 tracking-widest", children: "JOIN ROOM" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold mb-4", children: "Enter Room Code" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        value: code,
        onChange: (e) => setCode(e.target.value.toUpperCase().slice(0, 6)),
        placeholder: "ABC123",
        className: "w-full bg-black/40 rounded-2xl px-4 py-4 text-2xl font-bold tracking-[0.4em] text-center border outline-none focus:border-cyan-400 mb-2",
        style: { borderColor: "rgba(0,183,255,0.3)" }
      }
    ),
    err && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-red-400 mb-2", children: err }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 mb-5", children: "Ask the host for their 6-character code. Public rooms can also be joined this way." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: handle,
        disabled: busy || code.length !== 6,
        className: "w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-30 trey-glass-button",
        style: { background: "linear-gradient(90deg,#00B7FF,#A855F7)", color: "#fff" },
        children: [
          busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 16, className: "animate-spin" }) : null,
          "Join Room"
        ]
      }
    )
  ] });
};
const Backdrop = ({ onClose, children }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
  "div",
  {
    className: "relative w-full max-w-md rounded-3xl p-6 border trey-glass-panel",
    style: { background: "linear-gradient(160deg,#08111F,#05070D)", borderColor: "rgba(0,183,255,0.3)", boxShadow: "0 0 60px rgba(0,183,255,0.25)" },
    onClick: (e) => e.stopPropagation(),
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "absolute top-4 right-4 text-slate-400 hover:text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) }),
      children
    ]
  }
) });
const RoomLobby = ({ roomId, identity, onBack, onSessionStarted }) => {
  const [room, setRoom] = reactExports.useState(null);
  const [players, setPlayers] = reactExports.useState([]);
  const [copied, setCopied] = reactExports.useState(false);
  const [busy, setBusy] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const load = async () => {
    const [{ data: r }, p, s] = await Promise.all([
      supabase.from("game_rooms").select("*").eq("id", roomId).single(),
      getRoomPlayers(roomId),
      getActiveSession(roomId)
    ]);
    setRoom(r);
    setPlayers(p);
    if (s) onSessionStarted();
  };
  reactExports.useEffect(() => {
    load();
    const channel = supabase.channel(`lobby:${roomId}`).on(
      "postgres_changes",
      { event: "*", schema: "public", table: "game_room_players", filter: `room_id=eq.${roomId}` },
      async () => setPlayers(await getRoomPlayers(roomId))
    ).on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "game_sessions", filter: `room_id=eq.${roomId}` },
      () => onSessionStarted()
    ).on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "game_rooms", filter: `id=eq.${roomId}` },
      (payload) => setRoom(payload.new)
    ).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);
  const me = players.find((p) => p.user_id === identity.userId);
  const isHost = !!me?.is_host;
  const seats = room ? room.max_players : 4;
  const filledSeats = Array.from({ length: seats }).map((_, i) => players.find((p) => p.seat_index === i) || null);
  const copyCode = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.room_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const handleFillBots = async () => {
    if (!room) return;
    setBusy(true);
    try {
      await fillSeatsWithBots(roomId, room.game_type);
    } finally {
      setBusy(false);
    }
  };
  const handleStart = async () => {
    if (!room) return;
    setBusy(true);
    setError("");
    try {
      if (players.length < seats) await fillSeatsWithBots(roomId, room.game_type);
      await startGameSession(roomId, room.game_type);
      onSessionStarted();
    } catch (e) {
      setError(e.message || "Failed to start");
    } finally {
      setBusy(false);
    }
  };
  const handleLeave = async () => {
    await leaveRoom(roomId, identity.userId);
    onBack();
  };
  if (!room) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex items-center justify-center text-slate-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin mr-2" }),
      " Loading room…"
    ] });
  }
  const gameMeta = {
    spades: { name: "Spades", color: "#00B7FF" },
    blackjack: { name: "Blackjack", color: "#FFC857" },
    bullshit: { name: "Bullshit", color: "#A855F7" },
    truno: { name: "Truno", color: "#D946EF" }
  }[room.game_type];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full text-white pb-10", style: { background: "#05070D" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky top-0 z-20 backdrop-blur-xl border-b", style: { background: "rgba(5,7,13,0.85)", borderColor: gameMeta.color + "30" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto px-4 py-3 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleLeave, className: "p-2 rounded-xl hover:bg-white/5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 20 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.2em]", style: { color: gameMeta.color }, children: "ROOM LOBBY" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold", children: gameMeta.name })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-2 py-1 rounded-md font-bold tracking-widest", style: {
        background: room.is_private ? "rgba(168,85,247,0.15)" : "rgba(0,183,255,0.15)",
        color: room.is_private ? "#A855F7" : "#00B7FF",
        border: "1px solid " + (room.is_private ? "#A855F740" : "#00B7FF40")
      }, children: room.is_private ? "PRIVATE" : "PUBLIC" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto px-4 pt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "rounded-3xl p-5 border text-center mb-6 trey-queue-card",
          style: { background: "linear-gradient(135deg, rgba(8,17,31,0.95), rgba(5,7,13,0.95))", borderColor: gameMeta.color + "60", boxShadow: `0 0 40px ${gameMeta.color}20` },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-400 tracking-widest mb-2", children: "ROOM CODE" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-4xl md:text-5xl font-black tracking-[0.4em] font-mono", style: { color: gameMeta.color, textShadow: `0 0 20px ${gameMeta.color}60` }, children: room.room_code }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: copyCode, className: "p-2.5 rounded-xl border hover:bg-white/5", style: { borderColor: gameMeta.color + "40" }, children: copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 18, className: "text-green-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 18, style: { color: gameMeta.color } }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 mt-3", children: "Share this code with friends to invite them to this table." })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 16 }),
          " Players"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-slate-400", children: [
          players.length,
          " / ",
          seats
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3 mb-6", children: filledSeats.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(SeatCard, { seat: i, player: p, isYou: p?.user_id === identity.userId, accent: gameMeta.color, teamLabel: room.game_type === "spades" ? i % 2 === 0 ? "WE" : "THEM" : null }, i)) }),
      isHost ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        players.length < seats && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: handleFillBots,
            disabled: busy,
            className: "w-full py-3 rounded-2xl font-bold border flex items-center justify-center gap-2 disabled:opacity-50",
            style: { borderColor: "rgba(168,85,247,0.5)", background: "rgba(168,85,247,0.1)", color: "#C4A6FF" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { size: 16 }),
              " Fill Empty Seats With Bots"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: handleStart,
            disabled: busy,
            className: "w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50",
            style: { background: "linear-gradient(90deg,#00B7FF,#A855F7)", color: "#fff", boxShadow: "0 0 24px rgba(0,183,255,0.4)" },
            children: [
              busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 16, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 16 }),
              "Start Game"
            ]
          }
        ),
        error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-red-400 text-center", children: error })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-6 rounded-2xl border", style: { background: "rgba(8,17,31,0.6)", borderColor: "rgba(255,255,255,0.08)" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 20, className: "animate-spin mx-auto mb-2 text-cyan-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-slate-300", children: "Waiting for the host to start the game…" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-slate-500 mt-1", children: [
          "Hosted by ",
          room.host_display_name
        ] })
      ] })
    ] })
  ] });
};
const SeatCard = ({ seat, player, isYou, accent, teamLabel }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  "div",
  {
    className: "rounded-2xl p-3 border flex items-center gap-3 trey-glass-panel",
    style: {
      background: player ? "rgba(8,17,31,0.7)" : "rgba(8,17,31,0.3)",
      borderColor: isYou ? accent : player ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
      borderStyle: player ? "solid" : "dashed"
    },
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold",
          style: {
            background: player ? `linear-gradient(135deg, ${accent}40, ${accent}10)` : "rgba(255,255,255,0.05)",
            border: `1px solid ${player ? accent + "60" : "rgba(255,255,255,0.1)"}`,
            color: player ? "#fff" : "#475569"
          },
          children: player ? player.display_name.charAt(0).toUpperCase() : `${seat + 1}`
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold truncate", children: player?.display_name || "Open seat" }),
          player?.is_host && /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 12, className: "text-amber-400 shrink-0" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-slate-400 flex items-center gap-2", children: player ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          player.is_bot && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300", children: "BOT" }),
          isYou && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300", children: "YOU" }),
          teamLabel && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-1.5 py-0.5 rounded", style: { background: accent + "20", color: accent }, children: teamLabel })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Seat ",
          seat + 1
        ] }) })
      ] })
    ]
  }
);
const GAME_META$1 = {
  spades: { name: "Spades", tag: "TEAMS · 4 PLAYERS", desc: "Bidding, books, and bag pressure with a partner.", color: "#00B7FF", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Spade, { size: 16 }) },
  blackjack: { name: "Blackjack", tag: "SOLO TABLE · 1 PLAYER", desc: "Beat the dealer in the neon lounge.", color: "#FFC857", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { size: 16 }) },
  bullshit: { name: "Bullshit / Cheat", tag: "BLUFFING · 3-4 PLAYERS", desc: "Call the bluff before the table flips.", color: "#A855F7", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 16 }) },
  truno: { name: "Truno", tag: "COLOR MATCH - 2-4 PLAYERS", desc: "Match colors, fire action cards, and call TRUNO.", color: "#D946EF", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Shuffle, { size: 16 }) }
};
const QueueScreen = ({ gameType, identity, onBack, onMatched, onInviteFriends }) => {
  const meta = GAME_META$1[gameType];
  const max = MAX_PLAYERS_BY_GAME[gameType];
  const backendEnabled = isGameBackendEnabled();
  const [entry, setEntry] = reactExports.useState(null);
  const [snap, setSnap] = reactExports.useState(null);
  const [elapsed, setElapsed] = reactExports.useState(0);
  const [error, setError] = reactExports.useState(null);
  const [matchedFlash, setMatchedFlash] = reactExports.useState(null);
  const startedAtRef = reactExports.useRef(Date.now());
  reactExports.useRef(false);
  reactExports.useEffect(() => {
    {
      setError("Public queue is waiting on the Trey TV game database migration. Solo tables are available now.");
      return;
    }
  }, [backendEnabled, identity.userId, gameType]);
  reactExports.useEffect(() => {
    return;
  }, [backendEnabled, entry?.id, gameType, identity.userId]);
  reactExports.useEffect(() => {
    const i = setInterval(() => setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1e3)), 500);
    return () => clearInterval(i);
  }, []);
  const handleCancel = async () => {
    onBack();
  };
  let phase = "searching";
  if (matchedFlash) phase = "found";
  else if (snap) {
    const fullest = snap.formingRooms[0];
    if (fullest && fullest.current >= fullest.max - 1) phase = "almost";
    else if (snap.waitingInGame >= max - 1) phase = "almost";
  }
  const phaseLabel = phase === "found" ? "Match found" : phase === "almost" ? "Almost ready…" : "Looking for players…";
  const phaseColor = phase === "found" ? "#22C55E" : phase === "almost" ? "#FFC857" : meta.color;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full text-white relative overflow-hidden", style: { background: "#05070D" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-events-none absolute inset-0 opacity-70", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-40 -left-32 w-[520px] h-[520px] rounded-full blur-[140px]", style: { background: `radial-gradient(circle, ${meta.color}33 0%, transparent 70%)` } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 right-0 w-[480px] h-[480px] rounded-full blur-[140px]", style: { background: "radial-gradient(circle, rgba(168,85,247,0.22) 0%, transparent 70%)" } })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky top-0 z-30 backdrop-blur-2xl border-b", style: { background: "rgba(5,7,13,0.78)", borderColor: "rgba(0,183,255,0.18)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto px-4 py-3 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleCancel, className: "p-2 -ml-2 rounded-xl hover:bg-white/5 transition", "aria-label": "Back", title: "Back", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 18 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TreyBrandMark, { size: 28, glow: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-7 w-px bg-white/10" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.3em] font-bold", style: { color: meta.color }, children: "MATCHMAKING" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-black truncate", children: meta.name })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-3xl mx-auto px-4 py-6 md:py-10 space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "relative rounded-[32px] border overflow-hidden p-6 md:p-10 trey-queue-card",
          style: {
            background: "linear-gradient(180deg, rgba(8,17,31,0.85), rgba(5,7,13,0.95))",
            borderColor: phaseColor + "55",
            boxShadow: `0 0 80px ${phaseColor}22, inset 0 1px 0 rgba(255,255,255,0.05)`
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "inline-flex items-center gap-2 text-[10px] tracking-[0.3em] font-bold px-3 py-1.5 rounded-full backdrop-blur-md",
                style: { background: phaseColor + "18", border: "1px solid " + phaseColor + "55", color: phaseColor },
                children: [
                  phase === "found" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 12 }) : phase === "almost" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 12 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 12, className: "animate-spin" }),
                  phaseLabel.toUpperCase()
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl md:text-5xl font-black leading-tight tracking-tight mt-4", children: phase === "found" ? "You're in." : "Finding your table…" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm md:text-base text-slate-300 mt-2 max-w-xl leading-relaxed", children: phase === "found" ? "Pulling you into the lounge now. Hold tight — your seat is reserved." : meta.desc }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center my-8 md:my-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "absolute inset-0 rounded-full animate-ping opacity-40",
                  style: { background: `radial-gradient(circle, ${phaseColor}55 0%, transparent 70%)` }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "relative w-28 h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center",
                  style: {
                    background: `radial-gradient(circle at 30% 30%, ${phaseColor}40, rgba(5,7,13,0.95) 70%)`,
                    border: `1px solid ${phaseColor}80`,
                    boxShadow: `0 0 60px ${phaseColor}55, inset 0 0 30px ${phaseColor}30`
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center",
                      style: { background: "linear-gradient(135deg, rgba(255,255,255,0.08), transparent)", border: "1px solid rgba(255,255,255,0.12)" },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { color: phaseColor, transform: "scale(2.1)" }, children: meta.icon })
                    }
                  )
                }
              )
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 md:gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(StatTile, { label: "Queue Position", value: snap?.myEntry?.status === "matched" ? "Matched" : snap ? `#${snap.positionInGame || "—"}` : "—", color: meta.color, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 12 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(StatTile, { label: "Players Waiting", value: snap ? `${snap.waitingInGame}` : "—", color: "#A855F7", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 12 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(StatTile, { label: "Search Time", value: formatTime(elapsed), color: "#FFC857", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 12 }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mt-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: onInviteFriends,
                  className: "flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-black tracking-wide border transition hover:bg-white/5",
                  style: { borderColor: "rgba(0,183,255,0.45)", color: "#00B7FF", background: "rgba(0,183,255,0.08)" },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { size: 14 }),
                    " Invite Friends"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: handleCancel,
                  className: "flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold tracking-wide border transition hover:bg-white/5",
                  style: { borderColor: "rgba(248,113,113,0.4)", color: "#FCA5A5", background: "rgba(248,113,113,0.06)" },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }),
                    " Cancel Queue"
                  ]
                }
              )
            ] }),
            error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2", children: error })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "rounded-3xl border backdrop-blur-md p-5 trey-queue-card",
          style: { background: "rgba(8,17,31,0.65)", borderColor: "rgba(0,183,255,0.22)" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end justify-between mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.3em] font-bold text-slate-500", children: "ROOM FILL PRIORITY" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-black tracking-tight", children: "Rooms forming now" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-slate-500", children: "Almost-full first" })
            ] }),
            snap && snap.formingRooms.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: snap.formingRooms.slice(0, 5).map((r, idx) => {
              const need = r.max - r.current;
              const urgent = need === 1;
              const c = urgent ? "#FFC857" : need === 2 ? meta.color : "#A855F7";
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "flex items-center gap-3 rounded-2xl px-3 py-2.5 border trey-glass-panel",
                  style: { background: "rgba(5,7,13,0.6)", borderColor: c + "40" },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] font-black tracking-widest px-2 py-0.5 rounded-md", style: { background: c + "22", color: c, border: "1px solid " + c + "60" }, children: [
                      "#",
                      idx + 1
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-black", children: urgent ? "Needs ONE more" : `Needs ${need}` }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-slate-500", children: [
                        "Room ",
                        r.id.slice(0, 6).toUpperCase()
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SeatPips, { current: r.current, max: r.max, color: c })
                  ]
                },
                r.id
              );
            }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-500 px-1 py-2", children: "No rooms forming yet — you'll seed the next one." })
          ]
        }
      ),
      phase === "found" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center px-4", style: { background: "rgba(5,7,13,0.85)", backdropFilter: "blur(20px)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "relative rounded-[32px] border p-8 md:p-12 max-w-md w-full text-center",
          style: {
            background: "linear-gradient(180deg, rgba(8,17,31,0.95), rgba(5,7,13,0.98))",
            borderColor: "rgba(34,197,94,0.6)",
            boxShadow: "0 0 80px rgba(34,197,94,0.45)"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 rounded-[32px] overflow-hidden pointer-events-none", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-20 -left-20 w-60 h-60 rounded-full blur-[80px]", style: { background: "rgba(34,197,94,0.4)" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-20 -right-20 w-60 h-60 rounded-full blur-[80px]", style: { background: "rgba(0,183,255,0.4)" } })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TreyBrandMark, { size: 56, glow: true, className: "mx-auto mb-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.3em] font-bold text-emerald-300", children: "MATCH FOUND" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl md:text-4xl font-black mt-2 tracking-tight", children: "Table secured" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-slate-300 mt-2", children: [
                "Routing you to your seat at the ",
                meta.name,
                " table…"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 20, className: "animate-spin mx-auto mt-5 text-emerald-300" })
            ] })
          ]
        }
      ) })
    ] })
  ] });
};
const StatTile = ({ label, value, color, icon }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl px-3 py-3 border backdrop-blur-md trey-glass-panel", style: { borderColor: color + "40" }, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-[9px] tracking-[0.2em] font-bold", style: { color }, children: [
    icon,
    " ",
    label.toUpperCase()
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base md:text-lg font-black mt-1 truncate", children: value })
] });
const SeatPips = ({ current, max, color }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1", children: Array.from({ length: max }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "div",
  {
    className: "w-2.5 h-2.5 rounded-full",
    style: {
      background: i < current ? color : "rgba(255,255,255,0.08)",
      boxShadow: i < current ? `0 0 8px ${color}` : "none",
      border: "1px solid " + (i < current ? color + "80" : "rgba(255,255,255,0.12)")
    }
  },
  i
)) });
function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
const GAME_META = {
  spades: { name: "Spades", color: "#00B7FF", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Spade, { size: 14 }) },
  blackjack: { name: "Blackjack", color: "#FFC857", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { size: 14 }) },
  bullshit: { name: "Bullshit", color: "#A855F7", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 14 }) },
  truno: { name: "Truno", color: "#D946EF", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Shuffle, { size: 14 }) }
};
const GameRequestsInbox = ({ identity, onBack, onAccept }) => {
  const [inbox, setInbox] = reactExports.useState([]);
  const [outgoing, setOutgoing] = reactExports.useState([]);
  const [tab, setTab] = reactExports.useState("in");
  const backendEnabled = isGameBackendEnabled();
  reactExports.useEffect(() => {
    return;
  }, [backendEnabled, identity.userId]);
  const handleAccept = async (r) => {
    const updated = await acceptRequest(r.id);
    if (updated) onAccept(updated);
  };
  const handleDecline = async (r) => {
    await declineRequest(r.id);
    setInbox((prev) => prev.map((x) => x.id === r.id ? { ...x, status: "declined" } : x));
  };
  const handleCancel = async (r) => {
    await cancelOutgoingRequest(r.id);
    setOutgoing((prev) => prev.map((x) => x.id === r.id ? { ...x, status: "cancelled" } : x));
  };
  const pending = inbox.filter((r) => r.status === "pending");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full text-white relative overflow-hidden", style: { background: "#05070D" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-events-none absolute inset-0 opacity-60", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-[140px]", style: { background: "radial-gradient(circle, rgba(255,200,87,0.18) 0%, transparent 70%)" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[140px]", style: { background: "radial-gradient(circle, rgba(0,183,255,0.18) 0%, transparent 70%)" } })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky top-0 z-30 backdrop-blur-2xl border-b", style: { background: "rgba(5,7,13,0.78)", borderColor: "rgba(255,200,87,0.18)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto px-4 py-3 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onBack, className: "p-2 -ml-2 rounded-xl hover:bg-white/5 transition", "aria-label": "Back", title: "Back", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 18 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TreyBrandMark, { size: 28, glow: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-7 w-px bg-white/10" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.3em] font-bold", style: { color: "#FFC857" }, children: "INBOX" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-black truncate", children: "Game Requests" })
      ] }),
      pending.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "text-[10px] font-black px-2.5 py-1 rounded-full",
          style: { background: "rgba(255,200,87,0.18)", border: "1px solid rgba(255,200,87,0.55)", color: "#FFC857" },
          children: [
            pending.length,
            " pending"
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-3xl mx-auto px-4 py-5 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 rounded-2xl p-1 border trey-glass-panel", style: { borderColor: "rgba(255,255,255,0.08)" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabBtn, { active: tab === "in", onClick: () => setTab("in"), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Inbox, { size: 14 }), label: `Inbox (${inbox.length})`, color: "#FFC857" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabBtn, { active: tab === "out", onClick: () => setTab("out"), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { size: 14 }), label: `Sent (${outgoing.length})`, color: "#00B7FF" })
      ] }),
      tab === "in" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        inbox.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "rounded-3xl border p-8 text-center text-sm text-slate-400 backdrop-blur-md trey-queue-card",
            style: { background: "rgba(8,17,31,0.65)", borderColor: "rgba(255,255,255,0.08)" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { size: 28, className: "mx-auto mb-2 text-slate-500" }),
              "Game requests will light up here after the Trey TV game database migration is enabled."
            ]
          }
        ),
        inbox.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(RequestCard, { r, kind: "in", onAccept: () => handleAccept(r), onDecline: () => handleDecline(r) }, r.id))
      ] }),
      tab === "out" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        outgoing.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "rounded-3xl border p-8 text-center text-sm text-slate-400 backdrop-blur-md trey-queue-card",
            style: { background: "rgba(8,17,31,0.65)", borderColor: "rgba(255,255,255,0.08)" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { size: 28, className: "mx-auto mb-2 text-slate-500" }),
              "Sent invites will appear here once the game backend is enabled."
            ]
          }
        ),
        outgoing.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(RequestCard, { r, kind: "out", onCancel: () => handleCancel(r) }, r.id))
      ] })
    ] })
  ] });
};
const TabBtn = ({ active, onClick, icon, label, color }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  "button",
  {
    onClick,
    className: "flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-black transition",
    style: {
      background: active ? color + "22" : "transparent",
      color: active ? color : "#94A3B8",
      border: active ? "1px solid " + color + "60" : "1px solid transparent"
    },
    children: [
      icon,
      " ",
      label
    ]
  }
);
const RequestCard = ({ r, kind, onAccept, onDecline, onCancel }) => {
  const meta = GAME_META[r.game_type];
  const isPending = r.status === "pending";
  const statusColor = r.status === "accepted" ? "#22C55E" : r.status === "declined" || r.status === "cancelled" || r.status === "expired" ? "#FCA5A5" : meta.color;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "rounded-3xl border p-4 backdrop-blur-md trey-queue-card",
      style: {
        background: "rgba(8,17,31,0.7)",
        borderColor: meta.color + (isPending ? "60" : "25"),
        boxShadow: isPending ? `0 0 30px ${meta.color}25` : "none"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0",
              style: { background: meta.color + "20", border: "1px solid " + meta.color + "60", color: meta.color },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { transform: "scale(1.2)" }, children: meta.icon })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "text-[9px] tracking-[0.25em] font-black px-2 py-0.5 rounded-md",
                  style: { background: meta.color + "22", color: meta.color, border: "1px solid " + meta.color + "60" },
                  children: meta.name.toUpperCase()
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "text-[9px] tracking-[0.25em] font-black px-2 py-0.5 rounded-md",
                  style: { background: statusColor + "20", color: statusColor, border: "1px solid " + statusColor + "50" },
                  children: r.status.toUpperCase()
                }
              ),
              r.room_code && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] font-mono text-slate-400", children: [
                "code ",
                r.room_code
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-black mt-1.5 truncate", children: kind === "in" ? `${r.from_display_name} invited you` : `Invited ${r.to_display_name || r.to_user_id.slice(0, 8)}` }),
            r.message && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-slate-300 mt-1 line-clamp-2", children: [
              '"',
              r.message,
              '"'
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-[10px] text-slate-500 mt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 10 }),
              " ",
              timeAgo(r.created_at)
            ] })
          ] })
        ] }),
        isPending && kind === "in" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: onAccept,
              className: "flex-1 px-3 py-2.5 rounded-xl text-xs font-black inline-flex items-center justify-center gap-1.5",
              style: { background: "linear-gradient(90deg,#22C55E,#16A34A)", boxShadow: "0 0 20px rgba(34,197,94,0.4)" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 14 }),
                " Accept & Join"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: onDecline,
              className: "px-3 py-2.5 rounded-xl text-xs font-bold border inline-flex items-center justify-center gap-1.5",
              style: { borderColor: "rgba(248,113,113,0.4)", color: "#FCA5A5", background: "rgba(248,113,113,0.06)" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }),
                " Decline"
              ]
            }
          )
        ] }),
        isPending && kind === "out" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: onCancel,
            className: "px-3 py-2.5 rounded-xl text-xs font-bold border inline-flex items-center justify-center gap-1.5",
            style: { borderColor: "rgba(248,113,113,0.4)", color: "#FCA5A5", background: "rgba(248,113,113,0.06)" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }),
              " Cancel Invite"
            ]
          }
        ) })
      ]
    }
  );
};
function timeAgo(iso) {
  const t = new Date(iso).getTime();
  const s = Math.floor((Date.now() - t) / 1e3);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
const GameRoomModule = ({ initialView = "home", currentUser = null }) => {
  const [mounted, setMounted] = reactExports.useState(false);
  const [view, setView] = reactExports.useState(initialView);
  const [legendOpen, setLegendOpen] = reactExports.useState(false);
  const [createOpen, setCreateOpen] = reactExports.useState(false);
  const [createDefaultGame, setCreateDefaultGame] = reactExports.useState("spades");
  const [joinOpen, setJoinOpen] = reactExports.useState(false);
  const [identity, setIdentity] = reactExports.useState(() => currentUser ? identityFromTreyUser(currentUser) : getOrCreateIdentity());
  const [room, setRoom] = reactExports.useState(null);
  const [queueGame, setQueueGame] = reactExports.useState("spades");
  reactExports.useEffect(() => {
    setMounted(true);
  }, []);
  reactExports.useEffect(() => {
    if (currentUser) setIdentity(identityFromTreyUser(currentUser));
  }, [currentUser?.id, currentUser?.userId, currentUser?.displayName, currentUser?.username, currentUser?.publicProfileUid, currentUser?.public_profile_uid, currentUser?.site_uid, currentUser?.avatarUrl, currentUser?.avatar_url]);
  reactExports.useEffect(() => {
    if (room && view === "lobby") {
      getActiveSession(room.roomId).then((s) => {
        if (s) setView(room.gameType);
      });
    }
  }, [room, view]);
  const handleCreate = async (opts) => {
    try {
      const { room: newRoom } = await createRoom({ identity, ...opts });
      setRoom({ roomId: newRoom.id, gameType: opts.gameType });
      setCreateOpen(false);
      setView("lobby");
    } catch (err) {
      alert(`Failed to create room: ${err?.message ?? "Unknown error"}`);
    }
  };
  const handleJoin = async (code) => {
    const { room: joined } = await joinRoomByCode(code, identity);
    setRoom({ roomId: joined.id, gameType: joined.game_type });
    setJoinOpen(false);
    const s = await getActiveSession(joined.id);
    setView(s ? joined.game_type : "lobby");
  };
  const handleMatched = (roomId, gameType) => {
    setRoom({ roomId, gameType });
    setView("lobby");
  };
  const handleAcceptInbox = async (req) => {
    try {
      if (req.room_code) {
        const r = await findRoomByCode(req.room_code);
        if (r) {
          const { room: joined } = await joinRoomByCode(req.room_code, identity);
          setRoom({ roomId: joined.id, gameType: joined.game_type });
          const s = await getActiveSession(joined.id);
          setView(s ? joined.game_type : "lobby");
          return;
        }
      }
      setQueueGame(req.game_type);
      setView("queue");
    } catch {
      setQueueGame(req.game_type);
      setView("queue");
    }
  };
  const handleBackToHome = () => {
    setRoom(null);
    setView("home");
  };
  const handleEditName = () => {
    const next = prompt("Your display name:", identity.displayName);
    if (next && next.trim()) {
      setDisplayName(next);
      setIdentity({ ...identity, displayName: next.trim().slice(0, 24) });
    }
  };
  const renderGameTable = (game) => {
    const commonProps = room ? { roomId: room.roomId, identity, onBack: handleBackToHome, onLegend: () => setLegendOpen(true) } : { onBack: handleBackToHome, onLegend: () => setLegendOpen(true) };
    if (game === "spades") return /* @__PURE__ */ jsxRuntimeExports.jsx(SpadesTable, { ...commonProps });
    if (game === "blackjack") return /* @__PURE__ */ jsxRuntimeExports.jsx(BlackjackTable, { ...commonProps });
    if (game === "truno") {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        MatchScreen,
        {
          identity,
          roomId: room?.roomId,
          onNavigate: (next) => {
            if (next === "room" && room) setView("lobby");
            else handleBackToHome();
          }
        }
      );
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(BullshitTable, { ...commonProps });
  };
  if (!mounted) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "trey-game-room font-sans antialiased",
        style: { background: "#05070D", color: "#F8FAFC", minHeight: "100vh" },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen w-full flex items-center justify-center px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "rounded-3xl border px-6 py-5 text-center",
            style: {
              background: "rgba(8,17,31,0.78)",
              borderColor: "rgba(0,183,255,0.3)",
              boxShadow: "0 0 44px rgba(0,183,255,0.18), inset 0 1px 0 rgba(255,255,255,0.06)"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold tracking-[0.3em]", style: { color: "#00B7FF" }, children: "TREY TV" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-base font-black", children: "Loading Game Room" })
            ]
          }
        ) })
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "trey-game-room font-sans antialiased", style: { background: "#05070D", color: "#F8FAFC", minHeight: "100vh" }, children: [
    view === "home" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      GameRoomHome,
      {
        displayName: identity.displayName,
        userId: identity.userId,
        onEditName: handleEditName,
        onLaunchSolo: (g) => {
          setRoom(null);
          setView(g);
        },
        onCreateRoom: (g) => {
          setCreateDefaultGame(g || "spades");
          setCreateOpen(true);
        },
        onJoinRoom: () => setJoinOpen(true),
        onAdmin: () => setView("admin"),
        onLegend: () => setLegendOpen(true),
        onJoinQueue: (g) => {
          setQueueGame(g);
          setView("queue");
        },
        onOpenFriends: () => setView("friends"),
        onOpenInbox: () => setView("inbox")
      }
    ),
    view === "queue" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      QueueScreen,
      {
        gameType: queueGame,
        identity,
        onBack: handleBackToHome,
        onMatched: handleMatched,
        onInviteFriends: () => setView("friends")
      }
    ),
    view === "friends" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      FriendInviteCenter,
      {
        identity,
        defaultGame: queueGame,
        roomId: room?.roomId ?? null,
        roomCode: null,
        onBack: () => setView("home")
      }
    ),
    view === "inbox" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      GameRequestsInbox,
      {
        identity,
        onBack: () => setView("home"),
        onAccept: handleAcceptInbox
      }
    ),
    view === "lobby" && room && /* @__PURE__ */ jsxRuntimeExports.jsx(
      RoomLobby,
      {
        roomId: room.roomId,
        identity,
        onBack: handleBackToHome,
        onSessionStarted: () => setView(room.gameType)
      }
    ),
    view === "spades" && renderGameTable("spades"),
    view === "blackjack" && renderGameTable("blackjack"),
    view === "bullshit" && renderGameTable("bullshit"),
    view === "truno" && renderGameTable("truno"),
    view === "admin" && /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPanel, { onBack: handleBackToHome }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SuitLegendModal, { open: legendOpen, onClose: () => setLegendOpen(false) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CreateRoomModal, { open: createOpen, onClose: () => setCreateOpen(false), onCreate: handleCreate, defaultGame: createDefaultGame }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(JoinRoomModal, { open: joinOpen, onClose: () => setJoinOpen(false), onJoin: handleJoin })
  ] });
};
const AdminGameRoomModule = () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "trey-game-room font-sans antialiased", style: { background: "#05070D", color: "#F8FAFC", minHeight: "100vh" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPanel, { onBack: () => window.history.back() }) });
export {
  AdminGameRoomModule as A,
  GameRoomModule as G,
  loadCardBack as a,
  buildLayout as b,
  fanLayout as f,
  loadCardFaces as l,
  seatCenter as s
};

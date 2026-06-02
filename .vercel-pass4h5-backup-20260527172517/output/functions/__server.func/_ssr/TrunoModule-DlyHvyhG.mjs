import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { i as identityFromTreyUser, M as MatchScreen, c as createRoom, N as heartbeat, F as FriendInviteCenter, j as joinRoomByCode, O as TrunoCard, P as avatarFor, l as listActiveRooms, n as fillSeatsWithBots, m as leaveRoom, o as startGameSession, b as getRoomPlayers, a as getActiveSession } from "./MatchScreen-D5c34u8-.mjs";
import { a as useCurrentUser } from "./router-BtgGywEC.mjs";
import { s as supabase } from "./supabase-BQ18xbNk.mjs";
import "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { Z as Zap, a5 as Users, aO as Bot, aw as Trophy, r as ChevronRight, Y as Flame, t as Crown, i as Lock, at as UserPlus, k as Check, v as Copy, az as LoaderCircle, f as Send, s as LogOut, a4 as Play, a9 as Clock, h as Mail, P as Plus, G as Globe, cs as SquarePen, ai as Star, aY as Calendar, p as Shield, ct as Box, x as Gift, aB as RotateCw, cu as Megaphone, ae as Share2, H as House, bH as BookOpen, al as Award, cv as GripVertical } from "../_libs/lucide-react.mjs";
import "./trey-tv-logo-CG7PjBoN.mjs";
import "./useTvRemoteInput-3UKI_f2s.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
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
const sizeMap = {
  sm: "text-3xl",
  md: "text-5xl",
  lg: "text-6xl md:text-7xl",
  xl: "text-7xl md:text-8xl"
};
const TrunoLogo = ({ size = "lg", subtitle, showParent = true, className = "" }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex flex-col items-center ${className}`, children: [
    showParent && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center mb-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl font-light italic text-white tracking-tight", style: { fontFamily: "cursive" }, children: "Trey" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl font-bold italic bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent", children: "TV" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-400 text-sm", children: "✦" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] tracking-[0.3em] text-purple-300/80 font-semibold mt-0.5", children: "ORIGINAL GAME" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "h1",
      {
        className: `${sizeMap[size]} font-black tracking-tight leading-none select-none`,
        style: {
          background: "linear-gradient(90deg, #FF0080 0%, #FF3366 20%, #9D4EDD 45%, #00D9FF 75%, #00FF88 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          filter: "drop-shadow(0 0 20px rgba(255,0,128,0.5)) drop-shadow(0 0 40px rgba(157,78,221,0.4))",
          fontFamily: '"Arial Black", system-ui, sans-serif',
          letterSpacing: "-0.02em"
        },
        children: [
          "TRUNO",
          /* @__PURE__ */ jsxRuntimeExports.jsx("sup", { className: "text-xs align-super opacity-60", children: "™" })
        ]
      }
    ) }),
    subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-zinc-300/90 text-center px-4", children: subtitle })
  ] });
};
const TrunoCardFan = ({ cards, size = "md", highlightCenter = true }) => {
  const mid = Math.floor(cards.length / 2);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative flex items-end justify-center", style: { minHeight: size === "lg" ? 200 : 140 }, children: cards.map((card, i) => {
    const offset = i - mid;
    const rotate = offset * 8;
    const translateX = offset * 38;
    const translateY = Math.abs(offset) * 8;
    const isCenter = i === mid;
    const z = isCenter ? 50 : 10 - Math.abs(offset);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "absolute transition-transform",
        style: {
          transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotate}deg) ${isCenter && highlightCenter ? "scale(1.15) translateY(-20px)" : ""}`,
          zIndex: z
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(TrunoCard, { card, size, playable: isCenter && highlightCenter })
      },
      card.id
    );
  }) });
};
const heroCards$1 = [
  { id: "hc1", color: "purple", symbol: "wild_draw_four", value: 4, label: "+4" },
  { id: "hc2", color: "blue", symbol: "number", value: 7, label: "7" },
  { id: "hc3", color: "black", symbol: "wild", label: "W" },
  { id: "hc4", color: "red", symbol: "number", value: 2, label: "2" },
  { id: "hc5", color: "green", symbol: "reverse", label: "R" }
];
const modeButtons = [
  { key: "quick", label: "Quick Play", sub: "Jump in now", Icon: Zap, border: "border-fuchsia-500/40", text: "text-fuchsia-300", glow: "shadow-[0_0_20px_rgba(255,0,128,0.25)]" },
  { key: "friends", label: "Play Friends", sub: "Invite & play", Icon: Users, border: "border-amber-500/40", text: "text-amber-300", glow: "shadow-[0_0_20px_rgba(255,215,0,0.2)]" },
  { key: "ai", label: "AI Match", sub: "Play vs AI", Icon: Bot, border: "border-cyan-500/40", text: "text-cyan-300", glow: "shadow-[0_0_20px_rgba(0,217,255,0.25)]" },
  { key: "tourney", label: "Tournament", sub: "Compete & win", Icon: Trophy, border: "border-pink-500/40", text: "text-pink-300", glow: "shadow-[0_0_20px_rgba(236,72,153,0.25)]" }
];
const TAG_STYLES = {
  HOT: "bg-orange-500/30 text-orange-300 border-orange-500/50",
  NEW: "bg-emerald-500/30 text-emerald-300 border-emerald-500/50",
  TRENDING: "bg-fuchsia-500/30 text-fuchsia-300 border-fuchsia-500/50"
};
const HomeScreen = ({ onNavigate, onQuickPlay, onAiMatch, onPlayFriends }) => {
  const [tables, setTables] = reactExports.useState([]);
  const [loadingTables, setLoadingTables] = reactExports.useState(true);
  reactExports.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const rows = await listActiveRooms();
      if (!cancelled) {
        setTables(rows.filter((room) => room.game_type === "truno" && !room.is_private).slice(0, 12));
        setLoadingTables(false);
      }
    };
    load();
    const timer = setInterval(load, 5e3);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);
  const handleMode = (key) => {
    if (key === "quick") onQuickPlay();
    else if (key === "ai") onAiMatch();
    else if (key === "friends") onPlayFriends();
    else if (key === "tourney") onNavigate("tournament");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-24 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center pt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TrunoLogo, { size: "lg", subtitle: "Match colors. Play action. Own the table.", showParent: false }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 relative w-full max-w-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-72 h-72 rounded-full", style: {
          background: "radial-gradient(circle, rgba(157,78,221,0.25) 0%, rgba(0,217,255,0.1) 40%, transparent 70%)"
        } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TrunoCardFan, { cards: heroCards$1, size: "md" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: modeButtons.map(({ key, label, sub, Icon, border, text, glow }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => handleMode(key),
        className: `relative rounded-2xl border ${border} bg-zinc-950/60 backdrop-blur-xl p-4 ${glow} hover:scale-[1.02] transition-all flex flex-col items-center gap-1.5`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 26, className: text, strokeWidth: 2 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-bold text-base ${text}`, children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-zinc-500", children: sub })
        ]
      },
      key
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-bold text-white tracking-wider", children: "TONIGHT'S TABLES" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] px-2 py-0.5 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300 font-bold flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" }),
            " Live Now"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "text-xs text-zinc-400 flex items-center gap-1 hover:text-white", children: [
          "See all ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 14 })
        ] })
      ] }),
      loadingTables ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-3 overflow-x-auto pb-2 -mx-4 px-4", children: [0, 1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 w-44 h-44 rounded-2xl border border-zinc-800/80 bg-zinc-950/40 animate-pulse" }, i)) }) : tables.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/60 p-6 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-zinc-400", children: "No open tables right now." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: onPlayFriends,
            className: "mt-3 text-xs font-bold text-fuchsia-300 px-4 py-2 rounded-full border border-fuchsia-500/40 hover:bg-fuchsia-500/10",
            children: "Host a Table"
          }
        )
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x", children: tables.map((t, i) => {
        const tag = t.status === "waiting" ? "NEW" : t.status === "active" ? "HOT" : "";
        const label = t.room_code ? `Table ${t.room_code}` : `Table ${t.id.slice(0, 6).toUpperCase()}`;
        const mode = t.is_private ? "Private" : "Public";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => onNavigate("room", { roomId: t.id }),
            className: "flex-shrink-0 w-44 snap-start rounded-2xl border border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl overflow-hidden text-left hover:border-purple-500/50 transition-all",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-24 bg-gradient-to-br from-purple-900 via-fuchsia-900 to-blue-950", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0", style: {
                  background: i % 2 === 0 ? "radial-gradient(circle at 30% 50%, rgba(255,0,128,0.35), transparent 70%)" : "radial-gradient(circle at 70% 50%, rgba(0,217,255,0.3), transparent 70%)"
                } }),
                tag && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `absolute top-2 right-2 text-[9px] font-black px-2 py-0.5 rounded-full border ${TAG_STYLES[tag] || "bg-zinc-800 text-zinc-300 border-zinc-700"}`, children: [
                  tag === "HOT" && "🔥 ",
                  tag
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "absolute bottom-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm border border-emerald-500/40 text-emerald-300 flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1 h-1 rounded-full bg-emerald-400 animate-pulse" }),
                  t.current_players,
                  "/",
                  t.max_players
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-white text-sm mb-0.5 truncate", children: label }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-zinc-500 mb-2", children: [
                  mode,
                  " • ",
                  t.max_players,
                  " Players"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-[11px] text-zinc-400", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 11 }),
                    " ",
                    t.current_players
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold text-fuchsia-300 px-3 py-1 rounded-full border border-fuchsia-500/40 hover:bg-fuchsia-500/10", children: "Join" })
                ] })
              ] })
            ]
          },
          t.id
        );
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-[11px] font-bold text-zinc-400 tracking-wider mb-2", children: "FRIENDS" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-zinc-500 leading-snug", children: "Use Play Friends to create a real private table and invite your Trey TV crew." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onPlayFriends, className: "mt-2 text-[11px] font-bold text-amber-300 px-3 py-1.5 rounded-full border border-amber-500/40 hover:bg-amber-500/10", children: "Open Private Room" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/50 to-zinc-950/70 backdrop-blur-xl p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-[11px] font-bold text-amber-300 tracking-wider mb-1", children: "DAILY STREAK 🔥" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { size: 20, className: "text-orange-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-black text-white", children: "Coming Soon" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-zinc-500 mt-0.5", children: "Streak rewards are not live yet." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-lg bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center text-sm", children: "🎁" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-amber-300 font-bold mt-1", children: "Soon" })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => onNavigate("pass"),
        className: "w-full rounded-2xl border border-amber-500/40 bg-gradient-to-r from-purple-950/70 via-fuchsia-950/70 to-amber-950/50 backdrop-blur-xl p-4 hover:scale-[1.01] transition-all flex items-center justify-between text-left",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 28, className: "text-amber-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base font-black text-amber-300", children: "TRUNO PASS" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold", children: "SEASON 1" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-zinc-400 mt-0.5", children: [
                "Unlock exclusive cards, themes,",
                /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                "and epic rewards."
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-white px-4 py-2 rounded-xl border border-fuchsia-500/50 hover:bg-fuchsia-500/10", children: "View Pass" })
        ]
      }
    )
  ] });
};
const RoomScreen = ({ onNavigate, identity, roomId, roomError, suppressActiveSession = false, onJoinRoom, onRoomReady }) => {
  const currentUser = useCurrentUser();
  const [room, setRoom] = reactExports.useState(null);
  const [players, setPlayers] = reactExports.useState([]);
  const [joinCode, setJoinCode] = reactExports.useState("");
  const [rules, setRules] = reactExports.useState({ classic: true, action: true, wild: true, team: false });
  const [copied, setCopied] = reactExports.useState(false);
  const [busy, setBusy] = reactExports.useState(false);
  const [feedback, setFeedback] = reactExports.useState(roomError ?? null);
  const [showInvites, setShowInvites] = reactExports.useState(false);
  const loadRoom = async () => {
    if (!roomId) return;
    const [{ data: roomRow }, seated, session] = await Promise.all([
      supabase.from("game_rooms").select("*").eq("id", roomId).maybeSingle(),
      getRoomPlayers(roomId),
      getActiveSession(roomId)
    ]);
    const nextRoom = roomRow;
    setRoom(nextRoom);
    setPlayers(seated);
    if (session && !suppressActiveSession) onNavigate("match", { roomId });
  };
  reactExports.useEffect(() => {
    setFeedback(roomError ?? null);
  }, [roomError]);
  reactExports.useEffect(() => {
    if (!roomId) return;
    let cancelled = false;
    const load = async () => {
      if (!cancelled) await loadRoom();
    };
    load();
    const timer = setInterval(load, 2e3);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [roomId, suppressActiveSession]);
  reactExports.useEffect(() => {
    if (!roomId) return;
    heartbeat(roomId, identity.userId).catch(() => {
    });
    const timer = setInterval(() => {
      heartbeat(roomId, identity.userId).catch(() => {
      });
    }, 15e3);
    return () => clearInterval(timer);
  }, [identity.userId, roomId]);
  const seats = room?.max_players ?? 4;
  const filledSeats = reactExports.useMemo(() => Array.from({ length: seats }).map((_, seat) => players.find((p) => p.seat_index === seat) ?? null), [players, seats]);
  const me = players.find((p) => p.user_id === identity.userId);
  const isHost = !!me?.is_host;
  const copyCode = async () => {
    if (!room?.room_code) {
      setFeedback("Create a real private room before sharing a code.");
      return;
    }
    const ok = await copyTextSafely(room.room_code);
    setCopied(ok);
    setFeedback(ok ? "Room code copied." : `Copy blocked. Room code: ${room.room_code}`);
    setTimeout(() => {
      setCopied(false);
      setFeedback(null);
    }, ok ? 1600 : 5e3);
  };
  const handleInvite = async () => {
    if (!room) {
      setFeedback("Create a room first, then invite friends.");
      return;
    }
    setShowInvites(true);
  };
  const handleFillBots = async () => {
    if (!room) {
      setFeedback("Create a room before filling seats.");
      return;
    }
    setBusy(true);
    try {
      await fillSeatsWithBots(room.id, "truno");
      await loadRoom();
      setFeedback("Open seats filled with bot players.");
    } catch (e) {
      setFeedback(e?.message || "Could not fill seats.");
    } finally {
      setBusy(false);
      setTimeout(() => setFeedback(null), 2500);
    }
  };
  const handleStart = async () => {
    if (!room) return;
    setBusy(true);
    try {
      if (players.length < 2) await fillSeatsWithBots(room.id, "truno");
      await startGameSession(room.id, "truno");
      onRoomReady(room.id);
      onNavigate("match", { roomId: room.id });
    } catch (e) {
      setFeedback(e?.message || "Could not start match.");
    } finally {
      setBusy(false);
    }
  };
  const handleLeave = async () => {
    if (room) await leaveRoom(room.id, identity.userId);
    onNavigate("home");
  };
  const handleJoin = async () => {
    if (joinCode.trim().length !== 6) return;
    setBusy(true);
    setFeedback(null);
    try {
      await onJoinRoom(joinCode);
    } catch (e) {
      setFeedback(e?.message || "Could not join room.");
    } finally {
      setBusy(false);
    }
  };
  if (showInvites && room) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      FriendInviteCenter,
      {
        identity,
        defaultGame: "truno",
        roomId: room.id,
        roomCode: room.room_code,
        onBack: () => setShowInvites(false)
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 pb-32 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TrunoLogo, { size: "md", subtitle: "Match colors. Play action. Own the table.", showParent: false }) }),
    !room && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-amber-500/30 bg-zinc-950/80 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-black text-amber-300", children: "Private Room" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-zinc-400", children: "No active room is loaded. Enter a real Trey TV room code, or go back and choose Play Friends to create one." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: joinCode,
            onChange: (e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6)),
            placeholder: "ABC123",
            className: "flex-1 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm font-bold tracking-[0.25em] text-white outline-none"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleJoin, disabled: busy || joinCode.length !== 6, className: "rounded-xl px-4 py-2 text-xs font-black bg-amber-500 text-black disabled:opacity-40", children: busy ? "Joining..." : "Join" })
      ] }),
      feedback && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-fuchsia-300", children: feedback })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-xl p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 14, className: "text-amber-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-amber-300 tracking-wider", children: "PRIVATE ROOM" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-emerald-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold text-emerald-300", children: room ? "Room is open" : "Waiting for room" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold text-zinc-500 tracking-widest", children: "ROOM CODE" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-4xl md:text-5xl font-black my-2 tracking-tight", style: {
            background: "linear-gradient(90deg, #FF0080, #9D4EDD, #00D9FF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 12px rgba(157,78,221,0.5))"
          }, children: room?.room_code ?? "------" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-zinc-500 mb-3", children: room ? "Share this real room code with friends" : "Create or join a room to get a shareable code" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleInvite, disabled: !room, className: "min-h-11 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-fuchsia-500/50 bg-fuchsia-500/5 text-fuchsia-300 text-xs font-bold hover:bg-fuchsia-500/10 disabled:opacity-40 disabled:saturate-50 disabled:cursor-not-allowed", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { size: 14 }),
              " Invite Friends"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: copyCode, disabled: !room, className: "min-h-11 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-amber-500/50 bg-amber-500/5 text-amber-300 text-xs font-bold hover:bg-amber-500/10 disabled:opacity-40 disabled:saturate-50 disabled:cursor-not-allowed", children: [
              copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 14 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 14 }),
              " ",
              copied ? "Copied!" : "Copy Code"
            ] })
          ] }),
          feedback && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-fuchsia-300", children: feedback })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-bold text-zinc-300", children: [
              players.length,
              " / ",
              seats,
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-zinc-500 font-normal", children: "PLAYERS" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleFillBots, disabled: busy || !room, className: "min-h-8 flex items-center gap-1.5 px-2 py-1 rounded-lg border border-cyan-500/40 bg-cyan-500/5 text-cyan-300 text-[10px] font-bold disabled:opacity-40 disabled:saturate-50 disabled:cursor-not-allowed", children: [
              busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 12, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { size: 12 }),
              " AI Fill"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: filledSeats.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(SeatRow, { player: p, seat: i, currentUserAvatar: currentUser.avatar, currentUserName: currentUser.name, isYou: p?.user_id === identity.userId }, i)) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-square", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full", style: { background: "radial-gradient(circle, rgba(157,78,221,0.2), transparent 70%)" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-8 rounded-full border border-purple-500/30" }),
        filledSeats.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(TableSeat, { player: p, seat: i, isYou: p?.user_id === identity.userId, currentUserAvatar: currentUser.avatar }, i)),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-16 rounded-xl bg-gradient-to-br from-zinc-900 to-black border-2 border-fuchsia-500/40 shadow-[0_0_20px_rgba(157,78,221,0.6)] flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl", children: "TR" }) }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3 flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold text-white mb-2", children: "ROOM STATUS" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-4 text-center text-xs text-zinc-500", children: "Seats, invites, room codes, and bot fill are live. Chat stays quiet until backed room chat is added." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { disabled: true, placeholder: "Chat coming soon", className: "flex-1 bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-500 outline-none" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: true, className: "w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center opacity-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { size: 12, className: "text-zinc-500" }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold text-white mb-3", children: "GAME RULES" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: [
          { k: "classic", label: "Classic Mode", sub: "Match colors & numbers" },
          { k: "action", label: "Action Heavy", sub: "Skip, reverse, draw cards" },
          { k: "wild", label: "Wild Rules", sub: "Wild and +4 cards enabled" },
          { k: "team", label: "Team Play", sub: "Coming soon" }
        ].map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => r.k !== "team" && setRules({ ...rules, [r.k]: !rules[r.k] }),
            className: "w-full flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800 text-left",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold text-white", children: r.label }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-zinc-500", children: r.sub })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-9 h-5 rounded-full p-0.5 transition-colors ${rules[r.k] ? "bg-fuchsia-500" : "bg-zinc-700"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-4 h-4 rounded-full bg-white transition-transform ${rules[r.k] ? "translate-x-4" : ""}` }) })
            ]
          },
          r.k
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold text-white mb-3", children: "MATCH SETTINGS" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: [
          { label: "Seats", value: `${seats}` },
          { label: "Mode", value: room?.is_private ? "Private" : "Private" },
          { label: "Bots", value: players.some((p) => p.is_bot) ? "Enabled" : "Optional" }
        ].map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full flex items-center justify-between px-3 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-zinc-300", children: s.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-white", children: s.value }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 14, className: "text-zinc-500" })
          ] })
        ] }, i)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleLeave, className: "min-h-14 flex items-center justify-center gap-2 py-3 rounded-2xl border border-pink-500/50 text-pink-300 font-bold text-sm hover:bg-pink-500/10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { size: 14 }),
        " Leave Room"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleStart, disabled: busy || !room || !isHost && players.length > 0, className: "relative min-h-14 py-3 rounded-2xl font-black overflow-hidden disabled:opacity-50 disabled:saturate-50 disabled:cursor-not-allowed", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-blue-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-blue-600 blur-md opacity-70" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center justify-center gap-2", children: [
          busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 15, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 15 }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-white text-base", children: "Start Match" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] text-fuchsia-100", children: isHost ? "Bots can fill open seats" : "Waiting for host" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleFillBots, disabled: busy || !room, className: "min-h-14 flex items-center justify-center gap-2 py-3 rounded-2xl border border-emerald-500/50 text-emerald-300 font-bold text-xs hover:bg-emerald-500/10 disabled:opacity-40 disabled:saturate-50 disabled:cursor-not-allowed", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { size: 14 }),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "AI Fill" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] text-emerald-200/70 font-normal", children: "Fill empty seats" })
        ] })
      ] })
    ] })
  ] });
};
const SeatRow = ({
  player,
  seat,
  currentUserAvatar,
  currentUserName,
  isYou
}) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-2 px-2 py-2 rounded-xl border ${player ? "border-zinc-800 bg-zinc-900/60" : "border-dashed border-zinc-700/80 bg-zinc-950/55"}`, children: [
  player ? isYou && currentUserAvatar ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: currentUserAvatar, alt: currentUserName || player.display_name, className: "w-7 h-7 rounded-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-7 h-7 rounded-full bg-gradient-to-br ${player.is_bot ? "from-cyan-600 to-blue-800" : "from-fuchsia-500 to-purple-700"} flex items-center justify-center text-[10px] font-black text-white`, children: player.display_name[0]?.toUpperCase() }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-7 h-7 rounded-full border border-dashed border-zinc-600 bg-zinc-900/70 flex items-center justify-center text-[9px] text-zinc-500", children: seat + 1 }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-bold ${player?.is_host ? "text-fuchsia-300" : player ? "text-white" : "text-zinc-300"}`, children: player ? isYou ? currentUserName || player.display_name : player.display_name : "Open Seat" }),
      player?.is_host && /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 11, className: "text-amber-400" }),
      player?.is_bot && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-cyan-300 border border-cyan-500/30 rounded px-1", children: "BOT" }),
      isYou && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-emerald-300 border border-emerald-500/30 rounded px-1", children: "YOU" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[10px] ${player ? "text-emerald-400" : "text-zinc-500"}`, children: player ? "Ready" : `Seat ${seat + 1} available` })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(GripVertical, { size: 12, className: "text-zinc-600" })
] });
const TableSeat = ({ player, seat, isYou, currentUserAvatar }) => {
  const positions = [
    "top-2 left-1/2 -translate-x-1/2",
    "top-1/2 right-2 -translate-y-1/2",
    "bottom-8 left-1/2 -translate-x-1/2",
    "top-1/2 left-2 -translate-y-1/2"
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `absolute ${positions[seat] ?? positions[0]} flex flex-col items-center`, children: [
    player ? isYou && currentUserAvatar ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: currentUserAvatar, alt: player.display_name, className: "w-10 h-10 rounded-full object-cover ring-2 ring-fuchsia-500/50" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-10 h-10 rounded-full bg-gradient-to-br ${player.is_bot ? "from-cyan-600 to-blue-800" : "from-fuchsia-500 to-purple-700"} ring-2 ring-fuchsia-500/50 flex items-center justify-center text-xs font-black`, children: player.display_name[0]?.toUpperCase() }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full border border-dashed border-zinc-700" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[9px] font-bold mt-1 ${player ? "text-white" : "text-zinc-400"}`, children: player?.display_name || "Open Seat" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[8px] ${player?.is_bot ? "text-cyan-300" : player ? "text-emerald-400" : "text-zinc-600"}`, children: player?.is_bot ? "Bot player" : player ? "Ready" : `Seat ${seat + 1}` })
  ] });
};
async function copyTextSafely(text) {
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
}
async function listUpcomingTournaments(limit = 10) {
  return [];
}
async function joinTournament(tournamentId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in to join a tournament." };
  const { error } = await supabase.from("truno_tournament_entries").insert({
    tournament_id: tournamentId,
    user_id: user.id,
    status: "registered"
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
function formatCountdown(startsAt) {
  const diff = new Date(startsAt).getTime() - Date.now();
  if (diff <= 0) return "00:00:00";
  const totalSec = Math.floor(diff / 1e3);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor(totalSec % 3600 / 60);
  const s = totalSec % 60;
  const pad = (n) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
const heroCards = [
  { id: "c1", color: "purple", symbol: "wild_draw_four", value: 4, label: "+4" },
  { id: "c2", color: "blue", symbol: "number", value: 7, label: "7" },
  { id: "c3", color: "black", symbol: "wild", label: "W" },
  { id: "c4", color: "red", symbol: "number", value: 2, label: "2" },
  { id: "c5", color: "green", symbol: "reverse", label: "R" }
];
const TournamentScreen = ({ onNavigate }) => {
  const [tab, setTab] = reactExports.useState("bracket");
  const [tournaments, setTournaments] = reactExports.useState([]);
  const [selectedId, setSelectedId] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [joining, setJoining] = reactExports.useState(false);
  const [joinMsg, setJoinMsg] = reactExports.useState(null);
  reactExports.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const rows = await listUpcomingTournaments(10);
      if (!cancelled) {
        setTournaments(rows);
        if (!selectedId && rows.length > 0) setSelectedId(rows[0].id);
        setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);
  const selected = tournaments.find((t) => t.id === selectedId) || tournaments[0] || null;
  const handleJoin = async () => {
    if (!selected) return;
    setJoining(true);
    setJoinMsg(null);
    const res = await joinTournament(selected.id);
    setJoining(false);
    setJoinMsg(res.ok ? "Registered! See you at the table." : res.error || "Could not register.");
    setTimeout(() => setJoinMsg(null), 4e3);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 pb-32 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TrunoLogo, { size: "sm", showParent: false }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "h1",
        {
          className: "mt-2 text-4xl md:text-5xl font-black text-center",
          style: {
            background: "linear-gradient(180deg, #FFD700, #FF6B00 60%, #FF0080)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 20px rgba(255,215,0,0.5))",
            fontFamily: '"Arial Black"'
          },
          children: selected?.title?.toUpperCase() || "NIGHT CUP"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-zinc-300 mt-1", children: selected?.description || "Compete. Connect. Conquer." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 w-full max-w-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TrunoCardFan, { cards: heroCards, size: "sm" }) })
    ] }),
    tournaments.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 overflow-x-auto pb-1 -mx-3 px-3", children: tournaments.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => setSelectedId(t.id),
        className: `flex-shrink-0 px-3 py-1.5 rounded-full border text-[11px] font-bold whitespace-nowrap ${selectedId === t.id ? "border-amber-400 bg-amber-500/10 text-amber-300" : "border-zinc-800 bg-zinc-950/60 text-zinc-400"}`,
        children: [
          t.title,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1.5 text-[9px] opacity-70", children: [
            "- ",
            t.status
          ] })
        ]
      },
      t.id
    )) }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin text-fuchsia-400" }) }) : selected ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 rounded-2xl border border-amber-500/30 bg-zinc-950/80 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-[10px] text-amber-400 font-bold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { size: 11 }),
          " PRIZE POOL"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 mt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-400 text-lg", children: "*" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl font-black text-amber-300", children: selected.prize_pool.toLocaleString() })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-zinc-500", children: "TRUNO COINS" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center border-x border-zinc-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-[10px] text-zinc-400 font-bold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 11 }),
          " PLAYERS"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl font-black text-white mt-1", children: selected.registered_players.toLocaleString() }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[9px] text-zinc-500", children: [
          "Registered - max ",
          selected.max_players
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-[10px] text-zinc-400 font-bold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 11 }),
          " STARTS IN"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-baseline gap-1 mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base font-black text-amber-300 tabular-nums", children: formatCountdown(selected.starts_at) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-zinc-500", children: "HRS MIN SEC" })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/60 p-6 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-zinc-400", children: "No tournaments are scheduled right now." }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-zinc-800 bg-zinc-950/80 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-4 border-b border-zinc-800", children: ["BRACKET", "LIVE", "RULES", "PRIZES"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setTab(t.toLowerCase()),
          className: `py-3 text-xs font-black tracking-wider ${tab === t.toLowerCase() ? "text-amber-300 border-b-2 border-amber-400" : "text-zinc-500"}`,
          children: t
        },
        t
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4", children: [
        tab === "bracket" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-[10px] text-zinc-400 font-bold tracking-wider mb-3", children: "BRACKET" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-6 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { size: 34, className: "mx-auto text-amber-400/70 mb-2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-zinc-400", children: selected ? "Bracket opens when this tournament is seeded." : "No tournament bracket is available right now." })
          ] })
        ] }),
        tab === "live" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-[10px] text-zinc-400 font-bold tracking-wider mb-3", children: "LIVE MATCHES" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-6 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-zinc-400", children: "No live Truno tournament matches are running right now." }) })
        ] }),
        tab === "rules" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-xs text-zinc-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-[10px] text-zinc-400 font-bold tracking-wider mb-3", children: "RULES" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Match by color, number, or action. Wild cards set the current color. Empty your hand to win your table." })
        ] }),
        tab === "prizes" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-xs text-zinc-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-[10px] text-zinc-400 font-bold tracking-wider mb-3", children: "PRIZES" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: selected ? "Prize details come from the tournament record shown above." : "No prize pool is available until a tournament is scheduled." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold text-zinc-300", children: "LIVE MATCHES" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/60 p-6 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-zinc-400", children: "No live Truno tournament matches are running right now." }) })
    ] }),
    selected && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 items-stretch", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-amber-500/30 bg-zinc-950/80 p-3 flex flex-col items-center justify-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-amber-400 font-bold", children: "ENTRY FEE" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-400 text-base", children: "*" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-black text-amber-300", children: selected.entry_fee }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-zinc-500", children: "TRUNO COINS" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: handleJoin,
            disabled: joining,
            className: "relative rounded-xl font-black py-3 px-2 overflow-hidden disabled:opacity-60",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 blur-md opacity-60" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center justify-center gap-2 text-amber-950", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: joining ? "JOINING..." : "JOIN TOURNAMENT" }),
                !joining && /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 16 })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-emerald-500/30 bg-zinc-950/80 p-3 flex flex-col items-center justify-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-zinc-400 font-bold", children: "WINNER TAKES" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-400 text-base", children: "*" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-lg font-black text-amber-300", children: [
              "+",
              Math.floor(selected.prize_pool * 0.1).toLocaleString()
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-zinc-500 text-center", children: "Top prize (est.)" })
        ] })
      ] }),
      joinMsg && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: `text-center text-xs px-3 py-2 rounded-xl border ${joinMsg.startsWith("Registered") ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-pink-500/40 bg-pink-500/10 text-pink-300"}`,
          children: joinMsg
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4", onClick: () => onNavigate("home") })
  ] });
};
const podium = [
  { rank: 2, name: "Zay", tier: "SPECTRUM ELITE", tierColor: "text-cyan-300", score: 22410, streak: 12, color: "from-pink-500 to-red-700", ringColor: "ring-cyan-400/60" },
  { rank: 1, name: "Trey-1", tier: "SPECTRUM LEGEND", tierColor: "text-amber-300", score: 25670, streak: 15, color: "from-fuchsia-500 to-purple-700", ringColor: "ring-amber-400", isYou: true },
  { rank: 3, name: "Maya", tier: "SPECTRUM ELITE", tierColor: "text-red-300", score: 20315, streak: 9, color: "from-purple-500 to-indigo-700", ringColor: "ring-red-400/60" }
];
const rankings = [
  { rank: 4, name: "Lena", tier: "SPECTRUM MASTER", score: 18890, streak: 7, color: "from-rose-500 to-pink-700" },
  { rank: 5, name: "AceTheGreat", tier: "SPECTRUM MASTER", score: 17540, streak: 6, color: "from-blue-500 to-cyan-700" },
  { rank: 6, name: "KingNova", tier: "SPECTRUM MASTER", score: 16220, streak: 5, color: "from-purple-500 to-fuchsia-700" },
  { rank: 7, name: "ShadowPlay", tier: "SPECTRUM ELITE", score: 15030, streak: 4, color: "from-zinc-500 to-zinc-700" }
];
const LeaderboardScreen = () => {
  const [tab, setTab] = reactExports.useState("Global");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 pb-24 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TrunoLogo, { size: "md", showParent: false }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs tracking-[0.3em] font-bold text-fuchsia-300 mt-2", children: "RANKED LEADERBOARD" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-zinc-800 bg-zinc-950/80 p-1 grid grid-cols-4", children: ["Global", "Friends", "Clubs", "Weekly"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => setTab(t),
        className: `py-2 rounded-xl text-xs font-bold ${tab === t ? "bg-fuchsia-500/20 border border-fuchsia-500/50 text-fuchsia-300 shadow-[0_0_15px_rgba(255,0,128,0.25)]" : "text-zinc-500"}`,
        children: t
      },
      t
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3 flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-900 to-purple-900 flex items-center justify-center text-xl", children: "🃏" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-white", children: "Season 07" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-zinc-500", children: "18d 06h 42m" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-zinc-500", children: "Season Score" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-black text-white", children: "12,850" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 32, className: "text-amber-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-950/80 to-zinc-950/40 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2 items-end", children: podium.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex flex-col items-center ${p.rank === 1 ? "order-2" : p.rank === 2 ? "order-1" : "order-3"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        p.rank === 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 20, className: "absolute -top-5 left-1/2 -translate-x-1/2 text-amber-400", fill: "currentColor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `${p.rank === 1 ? "w-20 h-20" : "w-14 h-14"} rounded-full bg-gradient-to-br ${p.color} ring-4 ${p.ringColor} relative`, children: p.rank === 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -inset-2 rounded-full", style: { background: "radial-gradient(circle, rgba(255,215,0,0.3), transparent 70%)" } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${p.rank === 1 ? "bg-amber-500 text-amber-950" : p.rank === 2 ? "bg-cyan-500 text-white" : "bg-red-500 text-white"}`, children: p.rank })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 justify-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-black text-white", children: p.name }),
          p.isYou && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] px-1.5 py-0.5 rounded-md bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300", children: "You" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-[10px] font-black tracking-wider ${p.tierColor}`, children: p.tier }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-black text-white mt-0.5", children: p.score.toLocaleString() }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-zinc-500 flex items-center justify-center gap-1", children: [
          "Win Streak ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { size: 9, className: "text-orange-400" }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-300 font-bold", children: p.streak })
        ] })
      ] })
    ] }, p.rank)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: rankings.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-zinc-800 bg-zinc-950/80 p-2.5 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-6 text-center text-zinc-400 font-bold text-sm", children: r.rank }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-9 h-9 rounded-full bg-gradient-to-br ${r.color} ring-1 ring-white/10` }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-white text-sm truncate", children: r.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold text-purple-300", children: r.tier })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-black text-white", children: r.score.toLocaleString() }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-0.5 text-xs text-amber-300 font-bold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { size: 11, className: "text-orange-400" }),
        " ",
        r.streak
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-7 rounded-md bg-purple-500/10 border border-purple-500/30 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 11, className: "text-purple-300" }) })
    ] }, i)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border-2 border-fuchsia-500/60 bg-gradient-to-r from-fuchsia-950/40 via-purple-950/40 to-fuchsia-950/40 p-3 flex items-center gap-3 shadow-[0_0_30px_rgba(255,0,128,0.25)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] text-zinc-400", children: "Your Rank" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black text-white", children: "13" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-700 ring-2 ring-fuchsia-400/60" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-white", children: "Trey-1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] px-1.5 py-0.5 rounded-md bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300", children: "You" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-black text-amber-300", children: "SPECTRUM CHAMPION" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-black text-white", children: "12,850" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] text-zinc-400", children: "Win Streak" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-0.5 text-base font-black text-amber-300", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { size: 14, className: "text-orange-400" }),
          " 10"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3 grid grid-cols-3 gap-3 items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { size: 20, className: "text-orange-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-zinc-500", children: "Win Streak" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-black text-white", children: "10" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-zinc-400", children: "Keep it going!" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 border-x border-zinc-800 px-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { size: 20, className: "text-orange-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-zinc-500", children: "Best Streak" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-black text-white", children: "15" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-emerald-400", children: "New personal best!" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl", children: "🎁" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-zinc-500", children: "Next Reward" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-black text-amber-300", children: "★ +400" })
        ] })
      ] })
    ] })
  ] });
};
const clubs = [
  { name: "Creators Table", tag: "TRENDING", verified: true, desc: "Where creators, fans & legends play.", tags: ["Social", "Voice", "Casual"], online: "1.2K", members: 124, gradient: "from-purple-900 via-fuchsia-900 to-pink-900", action: "Enter" },
  { name: "Memphis Nights", tag: "", verified: false, desc: "Rep the 901. Vibes, music & cards.", tags: ["Music", "Voice", "Social"], online: "856", members: 87, gradient: "from-pink-900 via-red-900 to-purple-900", action: "Join" },
  { name: "Competitive Club", tag: "RANKED", verified: false, desc: "Climb the ranks. Earn. Flex.", tags: ["Ranked", "Competitive", "Voice"], online: "732", members: 64, gradient: "from-amber-900 via-orange-900 to-red-900", action: "Enter" },
  { name: "Chill & Match", tag: "", verified: false, desc: "Kick back, relax & match up.", tags: ["Casual", "Social", "Voice"], online: "1.1K", members: 103, gradient: "from-fuchsia-900 via-purple-900 to-blue-900", action: "Join" },
  { name: "Wild Card Society", tag: "TRENDING", verified: false, desc: "Wildcard rules. Unlimited fun.", tags: ["Fun", "Wild", "Social"], online: "645", members: 58, gradient: "from-purple-900 via-violet-900 to-indigo-900", action: "Join" }
];
const ClubsScreen = ({ onNavigate }) => {
  const [tab, setTab] = reactExports.useState("all");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 pb-24 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TrunoLogo, { size: "md", subtitle: "", showParent: false }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs tracking-[0.3em] font-bold text-fuchsia-300 mt-1", children: "CLUBS & COMMUNITY" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-4 gap-2", children: [
      { k: "all", label: "All Clubs", Icon: Users },
      { k: "mine", label: "My Clubs", Icon: Crown },
      { k: "invites", label: "Invites", Icon: Mail, badge: 3 },
      { k: "create", label: "Create", Icon: Plus }
    ].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => setTab(t.k),
        className: `relative px-2 py-2.5 rounded-2xl border text-[11px] font-bold flex items-center justify-center gap-1.5
              ${tab === t.k ? "border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-300 shadow-[0_0_15px_rgba(255,0,128,0.25)]" : "border-zinc-800 bg-zinc-950/60 text-zinc-400"}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(t.Icon, { size: 13 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: t.label }),
          "badge" in t && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-1 -right-1 w-4 h-4 rounded-full bg-fuchsia-500 text-[9px] font-black text-white flex items-center justify-center", children: t.badge })
        ]
      },
      t.k
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-bold text-zinc-300 tracking-wider", children: "FEATURED CLUBS" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] px-2 py-0.5 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300 font-bold flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" }),
          " Live Now"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "text-xs text-zinc-400 flex items-center gap-1", children: [
        "See all ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 12 })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: clubs.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-xl overflow-hidden flex", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative w-28 flex-shrink-0 bg-gradient-to-br ${c.gradient}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0", style: { background: "radial-gradient(circle at center, rgba(255,0,128,0.3), transparent 70%)" } }),
        c.tag && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-2 left-2 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-500/30 border border-amber-500/50 text-amber-200", children: c.tag === "TRENDING" ? "+ TRENDING" : c.tag }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center text-3xl opacity-60", children: i === 0 ? "🎬" : i === 1 ? "🏙️" : i === 2 ? "🏆" : i === 3 ? "🛋️" : "🌌" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 p-3 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-white text-sm truncate", children: c.name }),
              c.verified && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-4 rounded-full bg-cyan-500 text-[9px] text-white font-black flex items-center justify-center flex-shrink-0", children: "✓" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-zinc-400 truncate", children: c.desc })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-right flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-[10px] text-emerald-400 font-bold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-emerald-400" }),
            " ",
            c.online,
            " Online"
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1 mt-1.5 flex-wrap", children: c.tags.map((t, j) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] px-1.5 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400", children: t }, j)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center -space-x-1", children: [
            [0, 1, 2, 3, 4].map((j) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-5 h-5 rounded-full border border-zinc-900 bg-gradient-to-br ${["from-pink-500 to-rose-700", "from-purple-500 to-indigo-700", "from-fuchsia-500 to-purple-700", "from-amber-500 to-red-700", "from-cyan-500 to-blue-700"][j]}` }, j)),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-[10px] text-zinc-400", children: [
              "+",
              c.members
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => onNavigate("match"),
              className: "text-[11px] font-bold px-4 py-1.5 rounded-full border border-fuchsia-500/50 text-fuchsia-300 hover:bg-fuchsia-500/10",
              children: c.action
            }
          )
        ] })
      ] })
    ] }, i)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-fuchsia-950/40 to-purple-950/40 p-3 flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { size: 20, className: "text-amber-400 flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold text-amber-300", children: "TREY TV COMMUNITY HUB" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-zinc-400 truncate", children: "News, drops, events, & exclusive rewards." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "text-[11px] font-bold px-3 py-1.5 rounded-full border border-fuchsia-500/50 text-fuchsia-300 flex items-center gap-1 flex-shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { size: 11 }),
        " Open Hub"
      ] })
    ] })
  ] });
};
const decks = [
  { name: "Neon Inferno", count: "54 / 54", equipped: true, gradient: "from-red-700 via-orange-700 to-red-900", icon: "🔥" },
  { name: "Cosmic Surge", count: "23 / 54", equipped: false, gradient: "from-purple-700 via-blue-700 to-purple-900", icon: "🌌" },
  { name: "Electric Dreams", count: "18 / 54", equipped: false, gradient: "from-cyan-700 via-blue-700 to-indigo-900", icon: "⚡" },
  { name: "Royal Flush", count: "31 / 54", equipped: false, gradient: "from-amber-700 via-pink-700 to-rose-900", icon: "👑" },
  { name: "Midnight Wave", count: "16 / 54", equipped: false, gradient: "from-fuchsia-700 via-purple-700 to-blue-900", icon: "🌊" }
];
const badges = [
  { name: "Truno Legend", sub: "", icon: Crown, color: "text-fuchsia-300", bg: "from-fuchsia-900/40 to-purple-900/40" },
  { name: "Win Streak", sub: "10", icon: Star, color: "text-amber-300", bg: "from-amber-900/40 to-yellow-900/40" },
  { name: "Collector", sub: "100", icon: Shield, color: "text-purple-300", bg: "from-purple-900/40 to-indigo-900/40" },
  { name: "Quick Play Master", sub: "", icon: Zap, color: "text-cyan-300", bg: "from-cyan-900/40 to-blue-900/40" },
  { name: "On Fire", sub: "25", icon: Flame, color: "text-orange-300", bg: "from-orange-900/40 to-red-900/40" },
  { name: "Social Butterfly", sub: "", icon: Users, color: "text-emerald-300", bg: "from-emerald-900/40 to-teal-900/40" },
  { name: "Deck Designer", sub: "", icon: Box, color: "text-blue-300", bg: "from-blue-900/40 to-indigo-900/40" }
];
const ProfileScreen = () => {
  const [tab, setTab] = reactExports.useState("DECKS");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 pb-24 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TrunoLogo, { size: "md", subtitle: "Match colors. Play action. Own the table.", showParent: false }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-24 h-24 rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-600 to-blue-700 ring-4 ring-fuchsia-500/50 shadow-[0_0_30px_rgba(255,0,128,0.5)] flex items-center justify-center text-4xl font-black text-white", children: "T" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-black" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-black text-white", children: "Trey-1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-5 h-5 rounded-full bg-fuchsia-500 text-xs font-black text-white flex items-center justify-center", children: "✓" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-500/10 border border-purple-500/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 11, className: "text-purple-300" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold text-purple-300", children: "The Card Architect" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-md border-2 border-amber-500 bg-amber-500/10 flex items-center justify-center text-amber-300 font-black text-sm", children: "42" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 rounded-full bg-zinc-800 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-500", style: { width: "62%" } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-zinc-500 mt-0.5", children: "12,450 / 20,000 XP" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "self-start flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-900/60 text-xs text-zinc-300", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { size: 12 }),
        " Edit Profile"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3 grid grid-cols-5 gap-2 text-center", children: [
      { label: "TOTAL WINS", value: "1,248", Icon: Trophy, color: "text-amber-300" },
      { label: "WIN RATE", value: "68%", Icon: Star, color: "text-fuchsia-300" },
      { label: "FAVORITE MODE", value: "Quick", Icon: Zap, color: "text-cyan-300" },
      { label: "BEST STREAK", value: "19", Icon: Flame, color: "text-orange-400" },
      { label: "JOINED", value: "May 2024", Icon: Calendar, color: "text-zinc-300" }
    ].map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: i < 4 ? "border-r border-zinc-800" : "", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] font-bold text-zinc-500 tracking-wider", children: s.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-1 mt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(s.Icon, { size: 14, className: s.color }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-black text-white", children: s.value })
      ] })
    ] }, i)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-bold text-zinc-300 tracking-wider", children: "BADGE COLLECTION" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-[10px] text-zinc-400", children: "View All ›" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-4 md:grid-cols-7 gap-2", children: badges.map((b, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `w-12 h-14 rounded-xl bg-gradient-to-b ${b.bg} border ${b.color.replace("text", "border")}/40 flex items-center justify-center relative`,
            style: { clipPath: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(b.icon, { size: 20, className: b.color, fill: b.icon === Star ? "currentColor" : "none" }),
              b.sub && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute bottom-1 text-[8px] font-black text-white bg-black/60 px-1 rounded", children: b.sub })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] font-bold text-white mt-1 text-center leading-tight", children: b.name })
      ] }, i)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-zinc-800 bg-zinc-950/80 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex border-b border-zinc-800 overflow-x-auto", children: ["DECKS", "CARD BACKS", "WILD EFFECTS", "SPECIAL CARDS", "TABLES"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setTab(t),
          className: `px-3 py-2.5 text-[11px] font-bold whitespace-nowrap ${tab === t ? "text-amber-300 border-b-2 border-amber-400" : "text-zinc-500"}`,
          children: t
        },
        t
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-bold text-zinc-300", children: "MY DECKS" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-xs font-bold text-fuchsia-300 px-3 py-1 rounded-lg border border-zinc-700", children: "View Collection" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 overflow-x-auto pb-2", children: decks.map((d, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex-shrink-0 w-28 rounded-xl border ${d.equipped ? "border-amber-500/60 shadow-[0_0_15px_rgba(255,215,0,0.3)]" : "border-zinc-800"} bg-zinc-950/60 overflow-hidden`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `relative aspect-[3/4] bg-gradient-to-br ${d.gradient} flex items-center justify-center text-4xl`, children: d.icon }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-bold text-white", children: d.name }),
            d.equipped ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-[10px] text-emerald-400 font-bold mt-0.5", children: [
              "Equipped ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 10 })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-zinc-500", children: [
              "🃏 ",
              d.count
            ] })
          ] })
        ] }, i)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "mt-3 w-full py-2.5 rounded-xl border border-fuchsia-500/50 bg-fuchsia-500/5 text-fuchsia-300 font-bold text-sm flex items-center justify-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 14 }),
          " Equip Deck"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-bold text-zinc-400 tracking-wider mb-2", children: "COLLECTION PREVIEW" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-4 gap-2", children: [
        { name: "Card Backs", count: "27 / 72", icon: "🃏" },
        { name: "Wild Effects", count: "14 / 36", icon: "✨" },
        { name: "Special Cards", count: "22 / 52", icon: "🎴" },
        { name: "Table Skins", count: "9 / 24", icon: "🎰" }
      ].map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-zinc-800 bg-zinc-900/60 p-2 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square rounded-lg bg-gradient-to-br from-purple-900/40 to-fuchsia-900/40 mb-1.5 flex items-center justify-center text-2xl", children: c.icon }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold text-white", children: c.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] text-zinc-500", children: c.count })
      ] }, i)) })
    ] })
  ] });
};
const messages = [
  { type: "gift", Icon: Gift, color: "text-amber-300", from: "TRUNO Pass", msg: "Daily login reward: +100 ★ TRUNO Coins", time: "2m", unread: true },
  { type: "invite", Icon: Users, color: "text-fuchsia-300", from: "Zay", msg: "Invited you to room TR8N-04X2", time: "5m", unread: true },
  { type: "tourn", Icon: Trophy, color: "text-amber-300", from: "Night Cup", msg: "Registration confirmed — starts in 1h 28m", time: "12m", unread: true },
  { type: "pass", Icon: Crown, color: "text-amber-300", from: "Season 1", msg: "You leveled up to Level 23! Claim your reward.", time: "1h", unread: true },
  { type: "club", Icon: Users, color: "text-cyan-300", from: "Creators Table", msg: "New club event tonight at 10 PM CT", time: "2h", unread: true },
  { type: "gift", Icon: Gift, color: "text-emerald-300", from: "Streak Bonus", msg: "7-day streak! +250 ★ unlocked", time: "4h", unread: true },
  { type: "msg", Icon: Mail, color: "text-purple-300", from: "Maya", msg: "GG! That was a wild match 🔥", time: "6h", unread: false }
];
const InboxScreen = ({ onNavigate }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 pb-24 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TrunoLogo, { size: "md", subtitle: "Notifications. Invites. Rewards.", showParent: false }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-zinc-800 bg-zinc-950/80 overflow-hidden", children: messages.map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => onNavigate(m.type === "invite" ? "room" : m.type === "tourn" ? "tournament" : m.type === "pass" ? "pass" : "home"),
        className: `w-full flex items-center gap-3 p-3 text-left hover:bg-zinc-900/60 transition-colors ${i < messages.length - 1 ? "border-b border-zinc-800/60" : ""} ${m.unread ? "bg-fuchsia-500/[0.03]" : ""}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(m.Icon, { size: 18, className: m.color }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold text-white truncate", children: m.from }),
              m.unread && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-fuchsia-400 flex-shrink-0" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-zinc-400 truncate", children: m.msg })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-zinc-500 flex-shrink-0", children: m.time })
        ]
      },
      i
    )) })
  ] });
};
const premiumRow = [
  { level: 21, type: "CARD BACK", name: "Neon Swirl", locked: true, icon: "🌀" },
  { level: 22, type: "TABLE THEME", name: "Cosmic Lounge", locked: true, icon: "🛋️" },
  { level: 23, type: "EMOJI", name: "Flex Flame", locked: true, icon: "🔥" },
  { level: 24, type: "WILD EFFECT", name: "Neon Burst", locked: true, icon: "✨" },
  { level: 25, type: "COINS", name: "500", locked: false, icon: "★" }
];
const freeRow = [
  { level: 21, type: "COINS", name: "100", claimed: true, claim: false, locked: false, icon: "★" },
  { level: 22, type: "PROFILE FRAME", name: "Neon Pulse", claimed: true, claim: false, locked: false, icon: "⭕" },
  { level: 23, type: "CARD BACK", name: "Electric Flow", claimed: false, claim: true, locked: false, icon: "🌀" },
  { level: 24, type: "EMOJI", name: "Good Vibes", claimed: false, claim: false, locked: true, icon: "😎" },
  { level: 25, type: "TABLE THEME", name: "Midnight City", claimed: false, claim: false, locked: true, icon: "🌃" }
];
const featured = [
  { type: "EXCLUSIVE CARD BACK", name: "Galactic Crown", badge: "Season Exclusive", icon: "👑" },
  { type: "TABLE THEME", name: "Eclipse Arena", badge: "Premium Reward", icon: "🌑" },
  { type: "WILD EFFECT", name: "Stellar Storm", badge: "Premium Reward", icon: "🌪️" },
  { type: "PROFILE FRAME", name: "Neon Royalty", badge: "Season Exclusive", icon: "👑" }
];
const PassScreen = () => {
  const [tab, setTab] = reactExports.useState("rewards");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 pb-24 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end gap-3 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TrunoLogo, { size: "md", showParent: false }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 mt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-black tracking-wide", style: {
          background: "linear-gradient(180deg, #FFD700, #FFA500)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }, children: "PASS" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 20, className: "text-amber-400" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] tracking-wider font-bold text-fuchsia-300 mt-1 text-center", children: "SEASON 1: NEON ASCENSION" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-zinc-500 text-center flex items-center justify-center gap-1 mt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 10 }),
        " ENDS IN 27 DAYS"
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-fuchsia-500/30 bg-zinc-950/80 p-3 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-xl border-2 border-purple-500 bg-purple-500/10 flex items-center justify-center font-black text-purple-300 shadow-[0_0_15px_rgba(157,78,221,0.4)]", children: "23" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold text-zinc-400 tracking-wider", children: "LEVEL" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-zinc-300", children: "2,750 / 5,000 XP" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 mt-1 rounded-full bg-zinc-800 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-blue-500", style: { width: "55%" } }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-xs font-bold px-3 py-2 rounded-xl border border-amber-500/50 text-amber-300 hover:bg-amber-500/10", children: "Buy Levels" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTab("rewards"), className: `py-2.5 rounded-xl text-xs font-bold ${tab === "rewards" ? "bg-fuchsia-500/20 border border-fuchsia-500/50 text-fuchsia-300" : "bg-zinc-900 border border-zinc-800 text-zinc-400"}`, children: "REWARDS" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setTab("challenges"), className: `relative py-2.5 rounded-xl text-xs font-bold ${tab === "challenges" ? "bg-fuchsia-500/20 border border-fuchsia-500/50 text-fuchsia-300" : "bg-zinc-900 border border-zinc-800 text-zinc-400"}`, children: [
        "CHALLENGES",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-1 right-2 w-4 h-4 rounded-full bg-amber-500 text-[9px] font-black text-amber-950 flex items-center justify-center", children: "7" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-zinc-800 bg-zinc-950/80 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-20 flex-shrink-0 bg-gradient-to-b from-amber-900/40 to-amber-950/20 border-r border-amber-500/30 flex flex-col items-center justify-center p-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 20, className: "text-amber-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-black text-amber-300 mt-1", children: "PREMIUM" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "mt-2 text-[10px] font-bold text-amber-400 border border-amber-500/50 rounded-md px-2 py-0.5", children: "UPGRADE" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 p-2 min-w-max", children: premiumRow.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative w-20 rounded-xl border ${r.locked ? "border-zinc-800 bg-zinc-900/60" : "border-amber-500/50 bg-amber-500/10"} p-2 flex flex-col items-center`, children: [
          r.locked && /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 11, className: "absolute top-1 right-1 text-zinc-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl", children: r.icon }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[8px] text-zinc-500 mt-1", children: r.type }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] font-bold text-white text-center leading-tight", children: r.name }),
          !r.locked && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "mt-1 text-[9px] font-black text-amber-300 border border-amber-500/50 rounded-md px-2 py-0.5", children: "CLAIM" })
        ] }, i)) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-around py-2 bg-gradient-to-r from-transparent via-fuchsia-950/40 to-transparent border-y border-zinc-800", children: [21, 22, 23, 24, 25].map((l, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black ${l === 23 ? "border-2 border-amber-400 text-amber-300 bg-amber-500/10" : "border border-zinc-700 text-zinc-400"}`, children: l }, i)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-20 flex-shrink-0 bg-gradient-to-b from-blue-900/30 to-blue-950/20 border-r border-blue-500/30 flex flex-col items-center justify-center p-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/50 rotate-45 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { size: 12, className: "text-blue-300 -rotate-45", fill: "currentColor" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-black text-blue-300 mt-1", children: "FREE" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 p-2 min-w-max", children: freeRow.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative w-20 rounded-xl border ${r.locked ? "border-zinc-800 bg-zinc-900/60" : r.claimed ? "border-emerald-500/40 bg-emerald-500/5" : "border-fuchsia-500/50 bg-fuchsia-500/10"} p-2 flex flex-col items-center`, children: [
          r.locked && /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 11, className: "absolute top-1 right-1 text-zinc-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl", children: r.icon }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[8px] text-zinc-500 mt-1", children: r.type }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] font-bold text-white text-center leading-tight", children: r.name }),
          r.claimed && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 12, className: "text-emerald-400 mt-1" }),
          r.claim && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "mt-1 text-[9px] font-black text-fuchsia-300 border border-fuchsia-500/50 rounded-md px-2 py-0.5", children: "CLAIM" })
        ] }, i)) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold text-fuchsia-300 tracking-wider text-center mb-3", children: "FEATURED REWARDS" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-2", children: featured.map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-purple-500/30 bg-zinc-950/80 p-3 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square rounded-xl bg-gradient-to-br from-purple-900/40 to-fuchsia-900/20 mb-2 flex items-center justify-center text-4xl", children: f.icon }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] text-zinc-500 font-bold", children: f.type }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold text-white", children: f.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `text-[9px] mt-1.5 px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${f.badge.includes("Season") ? "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40" : "bg-amber-500/20 text-amber-300 border border-amber-500/40"}`, children: [
          f.badge.includes("Season") ? "◆" : /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 8 }),
          " ",
          f.badge
        ] })
      ] }, i)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-bold text-fuchsia-300 tracking-wider text-center mb-2", children: "TRUNO PASS PERKS" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-2 text-center", children: [
        { icon: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-7 h-7 rounded-lg rotate-45 bg-blue-500/20 border border-blue-500 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { size: 12, className: "text-blue-300 -rotate-45", fill: "currentColor" }) }), title: "+50%", sub: "Season XP Boost" },
        { icon: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl", children: "🪙" }), title: "Daily", sub: "Bonus Coins" },
        { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 20, className: "text-amber-400" }), title: "Exclusive", sub: "Rewards" },
        { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 20, className: "text-fuchsia-400" }), title: "Priority", sub: "Matchmaking" }
      ].map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1 p-2", children: [
        p.icon,
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-black text-white", children: p.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] text-zinc-400", children: p.sub })
      ] }, i)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "w-full rounded-2xl border border-amber-500/50 bg-gradient-to-r from-amber-950/40 via-fuchsia-950/40 to-purple-950/40 p-4 flex items-center justify-between text-left", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-amber-300 font-black text-base", children: "UNLOCK THE FULL EXPERIENCE" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-zinc-400 mt-1", children: [
          "Get exclusive rewards, faster progression,",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          "and show off your status at the table."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-black px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/60 text-amber-300 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 12 }),
        " UPGRADE TO PREMIUM"
      ] })
    ] })
  ] });
};
const tips = [
  { num: 1, label: "Match Colors", color: "fuchsia", desc: "Play a card that matches the color on the table.", Icon: () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl", children: "🃏" }) },
  { num: 2, label: "Action Cards", color: "cyan", desc: "Use action cards to change the game!", Icon: Zap },
  { num: 3, label: "Wild Cards", color: "amber", desc: "Change the color and keep the game going.", Icon: RotateCw },
  { num: 4, label: "Call TRUNO", color: "emerald", desc: "Don't forget to call TRUNO when you're down to one card!", Icon: Megaphone }
];
const exampleHand = [
  { id: "e1", color: "red", symbol: "number", value: 7, label: "7" },
  { id: "e2", color: "blue", symbol: "number", value: 2, label: "2" },
  { id: "e3", color: "green", symbol: "number", value: 5, label: "5" },
  { id: "e4", color: "purple", symbol: "wild_draw_four", value: 4, label: "+4" }
];
const practiceHand = [
  { id: "p1", color: "green", symbol: "number", value: 3, label: "3" },
  { id: "p2", color: "blue", symbol: "draw_two", value: 2, label: "+2" },
  { id: "p3", color: "black", symbol: "wild", label: "W" },
  { id: "p4", color: "yellow", symbol: "number", value: 8, label: "8" },
  { id: "p5", color: "red", symbol: "number", value: 1, label: "1" }
];
const colorMap = {
  fuchsia: "border-fuchsia-500 text-fuchsia-300",
  cyan: "border-cyan-500 text-cyan-300",
  amber: "border-amber-500 text-amber-300",
  emerald: "border-emerald-500 text-emerald-300"
};
const TutorialScreen = ({ onNavigate }) => {
  const [practice, setPractice] = reactExports.useState(true);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 pb-24 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TrunoLogo, { size: "md", subtitle: "Learn. Practice. Master. Win.", showParent: false }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-[1fr_2fr] gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold text-fuchsia-300 tracking-wider mb-4", children: "HOW TO PLAY" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-5 top-2 bottom-2 w-px bg-gradient-to-b from-fuchsia-500 via-cyan-500 via-amber-500 to-emerald-500" }),
          tips.map((t, i) => {
            const cls = colorMap[t.color];
            const textColor = cls.split(" ")[1];
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-10 h-10 rounded-full bg-zinc-950 border-2 ${cls} flex items-center justify-center font-black text-sm relative z-10`, children: t.num }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-bold ${textColor}`, children: t.label }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(t.Icon, { size: 18, className: textColor })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-zinc-400 leading-snug", children: t.desc })
              ] })
            ] }, i);
          })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-xl border border-fuchsia-500/30 bg-zinc-900/60 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold text-fuchsia-300 tracking-wider", children: "PROGRESS" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-zinc-300 mt-0.5", children: "0/4 Tips Completed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 mt-2 rounded-full bg-zinc-800 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-gradient-to-r from-fuchsia-500 to-purple-500 rounded-full", style: { width: "0%" } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl", children: "🎁" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-zinc-300", children: "Complete all tips to unlock a reward!" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold text-amber-300", children: "★ +250" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold text-fuchsia-300", children: "1. MATCH COLORS" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-zinc-400 mt-1 max-w-xs", children: "Play a card that matches the color of the top card on the table." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-700 ring-2 ring-fuchsia-500/50" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-white mt-1", children: "Zay" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-zinc-500", children: "4" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-[4/3] flex items-center justify-center my-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full", style: { background: "radial-gradient(circle, rgba(157,78,221,0.15), transparent 70%)" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute left-2 flex flex-col items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-700 ring-1 ring-pink-500/50" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-white mt-1", children: "Maya" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-zinc-500", children: "4" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-2 flex flex-col items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-700 ring-1 ring-purple-500/50" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-white mt-1", children: "Lena" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-zinc-500", children: "4" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TrunoCard, { card: { id: "d", color: "black", symbol: "wild", label: "W" }, size: "sm", faceDown: true }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TrunoCard, { card: { id: "t", color: "blue", symbol: "number", value: 7, label: "7" }, size: "sm", playable: true })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center gap-1 mt-3", children: exampleHand.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(TrunoCard, { card: c, size: "xs", playable: true }, c.id)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-xl bg-zinc-900/80 border border-cyan-500/30 p-3 flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { size: 20, className: "text-cyan-300" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-bold text-cyan-300", children: "TREY AI COACH" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-zinc-300", children: [
                "Nice! You matched the blue color.",
                /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                "That's how you keep the game going."
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-700 ring-2 ring-fuchsia-500/50 flex-shrink-0" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 mt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900/60 text-zinc-300 text-xs font-bold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 12, className: "text-cyan-300" }),
              " Watch Demo"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "flex items-center justify-center gap-2 py-2.5 rounded-xl border border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-300 text-xs font-bold", children: [
              "Next Tip ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 12 })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold text-fuchsia-300", children: "PRACTICE TABLE" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-zinc-400 font-bold tracking-wider", children: "PRACTICE MODE" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPractice(!practice), className: `w-10 h-5 rounded-full p-0.5 ${practice ? "bg-emerald-500" : "bg-zinc-700"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-4 h-4 rounded-full bg-white transition-transform ${practice ? "translate-x-5" : ""}` }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-zinc-400", children: "Practice against AI opponents and sharpen your skills." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center my-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { size: 10 }),
            " AI Easy"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-around", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { size: 20, className: "text-cyan-300" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-cyan-300 font-bold mt-1", children: "AI Easy" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-zinc-500", children: "4" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TrunoCard, { card: { id: "pd", color: "black", symbol: "wild", label: "W" }, size: "sm", faceDown: true }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TrunoCard, { card: { id: "pt", color: "red", symbol: "number", value: 2, label: "2" }, size: "sm", playable: true })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { size: 20, className: "text-cyan-300" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-cyan-300 font-bold mt-1", children: "AI Easy" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-zinc-500", children: "4" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center gap-1 mt-3", children: practiceHand.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(TrunoCard, { card: c, size: "xs", playable: true }, c.id)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => onNavigate("match"),
              className: "mt-3 w-full py-3 rounded-xl font-black relative overflow-hidden",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-purple-700" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-purple-700 blur-md opacity-60" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative text-white", children: "Practice Now" })
              ]
            }
          )
        ] })
      ] })
    ] })
  ] });
};
const finalHand = [
  { id: "f1", color: "purple", symbol: "wild_draw_four", value: 4, label: "+4" },
  { id: "f2", color: "blue", symbol: "number", value: 7, label: "7" },
  { id: "f3", color: "black", symbol: "wild", label: "W" },
  { id: "f4", color: "red", symbol: "number", value: 2, label: "2" },
  { id: "f5", color: "green", symbol: "reverse", label: "R" }
];
const standings = [
  { rank: 1, name: "Trey-1", cards: 0, points: 125, mvp: true },
  { rank: 2, name: "Zay", cards: 3, points: 75, mvp: false },
  { rank: 3, name: "Maya", cards: 5, points: 50, mvp: false },
  { rank: 4, name: "Lena", cards: 7, points: 25, mvp: false }
];
const VictoryScreen = ({ onNavigate }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 pb-24 space-y-4 relative overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 pointer-events-none", children: Array.from({ length: 20 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute", style: {
      top: `${i * 37 % 100}%`,
      left: `${i * 53 % 100}%`,
      width: "6px",
      height: "12px",
      background: ["#FF0080", "#9D4EDD", "#00D9FF", "#00FF88", "#FFD700"][i % 5],
      transform: `rotate(${i * 47 % 360}deg)`,
      opacity: 0.7
    } }, i)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex flex-col items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TrunoLogo, { size: "md", showParent: false }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-2 text-4xl md:text-5xl font-black", style: {
        background: "linear-gradient(180deg, #FFD700, #FFA500)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        filter: "drop-shadow(0 0 20px rgba(255,215,0,0.6))"
      }, children: "YOU WIN!" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-zinc-300 mt-1", children: "What a game! You came out on top." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex flex-col items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute w-64 h-64 rounded-full", style: {
        background: "radial-gradient(circle, rgba(255,0,128,0.3), rgba(157,78,221,0.2) 40%, transparent 70%)"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 32, className: "absolute -top-7 left-1/2 -translate-x-1/2 text-amber-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]", fill: "currentColor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-32 h-32 rounded-full overflow-hidden ring-4 ring-amber-400 shadow-[0_0_40px_rgba(255,215,0,0.6)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: avatarFor("Trey-1"), alt: "Trey-1", className: "w-full h-full object-cover", referrerPolicy: "no-referrer" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute -right-3 top-2 w-12 h-12 rounded-full bg-amber-500/20 border-2 border-amber-400 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(255,215,0,0.4)] backdrop-blur-sm bg-black/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 14, className: "text-amber-300" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-black text-amber-300", children: "MVP" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-3 text-2xl font-black text-white", children: "Trey-1" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 px-3 py-1 rounded-md bg-fuchsia-500/20 border border-fuchsia-500/40", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-black text-fuchsia-300 tracking-wider", children: "MATCH MVP" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative flex justify-center items-end", style: { height: 130 }, children: finalHand.map((c, i) => {
      const mid = Math.floor(finalHand.length / 2);
      const offset = i - mid;
      const isCenter = i === mid;
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute transition-transform", style: {
        transform: `translateX(${offset * 50}px) translateY(${Math.abs(offset) * 5}px) rotate(${offset * 6}deg) ${isCenter ? "translateY(-15px) scale(1.1)" : ""}`,
        zIndex: isCenter ? 50 : 10 - Math.abs(offset)
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TrunoCard, { card: c, size: "sm", playable: true }) }, c.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center -mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold text-fuchsia-300 tracking-wider px-3 py-1 rounded-md bg-fuchsia-500/10 border border-fuchsia-500/30", children: "FINAL HAND" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3 grid grid-cols-3 gap-3 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-9 rounded-md border border-fuchsia-500 bg-fuchsia-500/10 flex items-center justify-center text-[10px] font-black text-fuchsia-300", children: "XP" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-zinc-400 font-bold", children: "XP EARNED" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-base font-black text-fuchsia-300", children: [
            "+125 ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: "XP" })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-x border-zinc-800", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl", children: "🪙" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-zinc-400 font-bold", children: "COINS WON" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-black text-amber-300", children: "+250" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { size: 20, className: "text-orange-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-zinc-400 font-bold", children: "STREAK BONUS" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-base font-black text-white", children: [
            "7 ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: "DAYS" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] text-emerald-400 font-bold", children: "+50% XP & Coins" })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-zinc-800 bg-zinc-950/80 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[40px_1fr_80px_80px] gap-2 px-3 py-2 border-b border-zinc-800 text-[10px] font-bold text-zinc-500 tracking-wider", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "#" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "PLAYER" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-right", children: "CARDS LEFT" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-right", children: "POINTS" })
      ] }),
      standings.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `grid grid-cols-[40px_1fr_80px_80px] gap-2 px-3 py-2.5 items-center ${s.rank === 1 ? "bg-gradient-to-r from-amber-500/10 to-transparent border-l-2 border-amber-400" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-white font-bold", children: [
          s.rank,
          s.mvp && /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 11, className: "text-amber-400" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: avatarFor(s.name), alt: s.name, className: "w-7 h-7 rounded-full object-cover flex-shrink-0", referrerPolicy: "no-referrer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold text-white truncate", children: s.name }),
          s.mvp && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black", children: "MVP" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-right text-sm text-white font-bold", children: s.cards }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right text-sm font-black text-amber-300", children: [
          "★ +",
          s.points
        ] })
      ] }, s.rank))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { size: 28, className: "text-orange-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-black text-white", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-orange-400", children: "7" }),
            " DAY STREAK"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-zinc-400", children: "Keep it going!" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex items-center gap-1 px-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 10, className: "text-emerald-400" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-1.5 rounded-full bg-emerald-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 10, className: "text-emerald-400" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-1.5 rounded-full bg-emerald-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 10, className: "text-amber-400" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-pink-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded-md border border-amber-500 bg-amber-500/10 flex items-center justify-center text-[10px] font-black text-amber-300", children: "7" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl", children: "🎁" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] text-zinc-400 font-bold", children: "NEXT REWARD" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-black text-amber-300", children: "★ +500" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => onNavigate("match"),
          className: "py-3 rounded-2xl border border-fuchsia-500/50 bg-fuchsia-500/5 text-fuchsia-300 font-bold text-sm flex items-center justify-center gap-2 hover:bg-fuchsia-500/10",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCw, { size: 14 }),
            " REMATCH"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "py-3 rounded-2xl border border-cyan-500/50 bg-cyan-500/5 text-cyan-300 font-bold text-sm flex items-center justify-center gap-2 hover:bg-cyan-500/10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { size: 14 }),
        " SHARE WIN"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => onNavigate("home"),
          className: "py-3 rounded-2xl border border-amber-500/50 bg-amber-500/5 text-amber-300 font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-500/10",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(House, { size: 14 }),
            " BACK TO LOBBY"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center text-[11px] text-zinc-500 flex items-center justify-center gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-fuchsia-400", children: "♥" }),
      " Thanks for playing",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-black", style: {
        background: "linear-gradient(90deg, #FF0080, #9D4EDD, #00D9FF)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent"
      }, children: "TRUNO™" })
    ] })
  ] });
};
const modes = [
  { key: "quick", title: "Quick Play", desc: "Fast matchmaking, 2-4 players", Icon: Zap, view: "match", grad: "from-fuchsia-600 to-purple-700", text: "text-fuchsia-300", border: "border-fuchsia-500/40" },
  { key: "friends", title: "Play Friends", desc: "Private room with room code", Icon: Users, view: "room", grad: "from-amber-600 to-orange-700", text: "text-amber-300", border: "border-amber-500/40" },
  { key: "ai", title: "AI Match", desc: "Practice vs Easy/Normal/Smart/Savage", Icon: Bot, view: "match", grad: "from-cyan-600 to-blue-700", text: "text-cyan-300", border: "border-cyan-500/40" },
  { key: "tourney", title: "Tournament", desc: "Bracket battles & prize pools", Icon: Trophy, view: "tournament", grad: "from-pink-600 to-rose-700", text: "text-pink-300", border: "border-pink-500/40" },
  { key: "tutorial", title: "Tutorial", desc: "AI coach teaches the rules", Icon: BookOpen, view: "tutorial", grad: "from-emerald-600 to-teal-700", text: "text-emerald-300", border: "border-emerald-500/40" },
  { key: "pass", title: "TRUNO Pass", desc: "Season rewards & unlocks", Icon: Crown, view: "pass", grad: "from-amber-500 to-yellow-600", text: "text-amber-300", border: "border-amber-500/40" },
  { key: "leader", title: "Leaderboard", desc: "Climb the Spectrum tiers", Icon: Award, view: "leaderboard", grad: "from-purple-600 to-indigo-700", text: "text-purple-300", border: "border-purple-500/40" },
  { key: "victory", title: "Last Victory", desc: "Review your latest win", Icon: Trophy, view: "victory", grad: "from-amber-600 to-fuchsia-700", text: "text-amber-300", border: "border-amber-500/40" }
];
const PlayScreen = ({
  onNavigate,
  onQuickPlay,
  onAiMatch,
  onPlayFriends
}) => {
  const handleMode = (key, view) => {
    if (key === "quick") onQuickPlay();
    else if (key === "ai") onAiMatch();
    else if (key === "friends") onPlayFriends();
    else onNavigate(view);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 pb-24 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TrunoLogo, { size: "md", subtitle: "Choose your mode. Own the table.", showParent: false }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: modes.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => handleMode(m.key, m.view),
        className: `relative rounded-2xl border ${m.border} bg-zinc-950/70 backdrop-blur-xl p-4 text-left hover:scale-[1.02] transition-all overflow-hidden group`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `absolute -inset-4 bg-gradient-to-br ${m.grad} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity` }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-12 h-12 rounded-2xl bg-gradient-to-br ${m.grad} bg-opacity-20 flex items-center justify-center mb-2`, style: { background: "linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.6))" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(m.Icon, { size: 22, className: m.text, strokeWidth: 2 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: `font-black text-base ${m.text}`, children: m.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-zinc-400 mt-0.5 leading-snug", children: m.desc })
          ] })
        ]
      },
      m.key
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-bold text-cyan-300 tracking-wider mb-2", children: "QUICK AI MATCH — DIFFICULTY" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-4 gap-2", children: ["Easy", "Normal", "Smart", "Savage"].map((d, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onAiMatch,
          className: `py-2.5 rounded-xl border text-xs font-bold
                ${i === 0 ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-300" : ""}
                ${i === 1 ? "border-cyan-500/40 bg-cyan-500/5 text-cyan-300" : ""}
                ${i === 2 ? "border-fuchsia-500/40 bg-fuchsia-500/5 text-fuchsia-300" : ""}
                ${i === 3 ? "border-red-500/40 bg-red-500/5 text-red-300" : ""}
              `,
          children: d
        },
        d
      )) })
    ] })
  ] });
};
const SCREEN_BG = "min-h-screen bg-zinc-950 text-white font-sans antialiased overflow-x-hidden";
const TrunoModule = ({ initialView = "home", onExitToGames }) => {
  const currentUser = useCurrentUser();
  const identity = reactExports.useMemo(() => identityFromTreyUser({
    name: currentUser.name,
    username: currentUser.handle,
    publicProfileUid: currentUser.uid,
    avatarUrl: currentUser.avatar
  }), [currentUser.avatar, currentUser.handle, currentUser.name, currentUser.uid]);
  const [view, setView] = reactExports.useState(initialView);
  const [matchParams, setMatchParams] = reactExports.useState(null);
  const [roomId, setRoomId] = reactExports.useState(null);
  const [roomError, setRoomError] = reactExports.useState(null);
  const navigate = (nextView, params) => {
    if (nextView === "exit") {
      onExitToGames?.();
      return;
    }
    setMatchParams(params ?? null);
    setView(nextView);
  };
  const startLocalMatch = (mode = "quick") => {
    setRoomId(null);
    navigate("match", { mode });
  };
  const createPrivateRoom = async () => {
    setRoomError(null);
    try {
      const { room } = await createRoom({ identity, gameType: "truno", isPrivate: true, targetScore: 500 });
      setRoomId(room.id);
      navigate("room", { roomId: room.id });
    } catch (e) {
      setRoomError(e?.message || "Could not create a Truno room.");
      navigate("room", { unavailable: true });
    }
  };
  const joinRoom = async (code) => {
    setRoomError(null);
    const { room } = await joinRoomByCode(code, identity);
    if (room.game_type !== "truno") throw new Error("That code belongs to another Trey TV game.");
    setRoomId(room.id);
    navigate("room", { roomId: room.id });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: SCREEN_BG, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-events-none fixed inset-0 z-0 opacity-50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[160px]",
          style: { background: "radial-gradient(circle, rgba(157,78,221,0.35) 0%, transparent 70%)" }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full blur-[140px]",
          style: { background: "radial-gradient(circle, rgba(0,217,255,0.2) 0%, transparent 70%)" }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute bottom-0 left-1/2 w-[600px] h-[400px] rounded-full blur-[140px]",
          style: { background: "radial-gradient(circle, rgba(255,0,128,0.15) 0%, transparent 70%)" }
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10", children: [
      view === "home" && /* @__PURE__ */ jsxRuntimeExports.jsx(HomeScreen, { onNavigate: navigate, onQuickPlay: () => startLocalMatch("quick"), onAiMatch: () => startLocalMatch("ai"), onPlayFriends: createPrivateRoom }),
      view === "match" && /* @__PURE__ */ jsxRuntimeExports.jsx(MatchScreen, { onNavigate: navigate, identity, roomId: matchParams?.roomId ?? roomId, mode: matchParams?.mode ?? "quick" }),
      view === "room" && /* @__PURE__ */ jsxRuntimeExports.jsx(RoomScreen, { onNavigate: navigate, identity, roomId: matchParams?.roomId ?? roomId, roomError, suppressActiveSession: !!matchParams?.suppressActiveSession, onJoinRoom: joinRoom, onRoomReady: (id) => setRoomId(id) }),
      view === "tournament" && /* @__PURE__ */ jsxRuntimeExports.jsx(TournamentScreen, { onNavigate: navigate }),
      view === "leaderboard" && /* @__PURE__ */ jsxRuntimeExports.jsx(LeaderboardScreen, {}),
      view === "clubs" && /* @__PURE__ */ jsxRuntimeExports.jsx(ClubsScreen, { onNavigate: navigate }),
      view === "profile" && /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileScreen, {}),
      view === "inbox" && /* @__PURE__ */ jsxRuntimeExports.jsx(InboxScreen, { onNavigate: navigate }),
      view === "pass" && /* @__PURE__ */ jsxRuntimeExports.jsx(PassScreen, {}),
      view === "tutorial" && /* @__PURE__ */ jsxRuntimeExports.jsx(TutorialScreen, { onNavigate: navigate }),
      view === "victory" && /* @__PURE__ */ jsxRuntimeExports.jsx(VictoryScreen, { onNavigate: navigate }),
      view === "play" && /* @__PURE__ */ jsxRuntimeExports.jsx(PlayScreen, { onNavigate: navigate, onQuickPlay: () => startLocalMatch("quick"), onAiMatch: () => startLocalMatch("ai"), onPlayFriends: createPrivateRoom })
    ] })
  ] });
};
export {
  TrunoModule as default
};

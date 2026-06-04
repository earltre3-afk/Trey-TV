import React, { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Gamepad2,
  Spade,
  Layers,
  Sparkles,
  Users,
  KeyRound,
  Bot,
  ShieldCheck,
  Crown,
  Settings,
  Info,
  Heart,
  Diamond,
  Club,
  ChevronRight,
  Zap,
  Trophy,
  Wifi,
  Inbox,
  UserPlus,
  BookOpen,
  Shuffle,
} from "lucide-react";
import { GameType } from "@/features/games/lib/services/roomService";
import { InteractiveStoriesSection } from "@/components/games/InteractiveStoriesSection";
import { TreyBrandMark } from "@/features/games/components/shared/TreyBrandMark";
import { getQueueCounts } from "@/features/games/lib/services/matchmakingService";
import { getPendingInboxCount } from "@/features/games/lib/services/socialService";
import { isGameBackendEnabled } from "@/features/games/lib/gameBackend";

const TRUNO_IMG =
  "https://d64gsuwffb70l.cloudfront.net/6a05312f4c99412b68631f27_1778727630972_8f322cdb.jpg";

interface Props {
  onLaunchSolo: (game: GameType) => void;
  onCreateRoom: (game?: GameType) => void;
  onJoinRoom: () => void;
  onAdmin: () => void;
  onLegend: () => void;
  displayName?: string;
  userId?: string;
  onEditName?: () => void;
  onJoinQueue?: (game: GameType) => void;
  onOpenFriends?: () => void;
  onOpenInbox?: () => void;
}

const HERO_IMG =
  "https://d64gsuwffb70l.cloudfront.net/6a05312f4c99412b68631f27_1778727630972_8f322cdb.jpg";
const SPADES_IMG =
  "https://d64gsuwffb70l.cloudfront.net/6a05312f4c99412b68631f27_1778727649027_a4667a90.jpg";
const BLACKJACK_IMG =
  "https://d64gsuwffb70l.cloudfront.net/6a05312f4c99412b68631f27_1778727686341_bb8e9241.png";
const BULLSHIT_IMG =
  "https://d64gsuwffb70l.cloudfront.net/6a05312f4c99412b68631f27_1778727706155_8618acfd.jpg";

export const GameRoomHome: React.FC<Props> = ({
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
  onOpenInbox,
}) => {
  const navigate = useNavigate();
  const [queueCounts, setQueueCounts] = useState<Record<GameType, number>>({
    spades: 0,
    blackjack: 0,
    bullshit: 0,
    truno: 0,
  });
  const [inboxCount, setInboxCount] = useState(0);

  useEffect(() => {
    if (!isGameBackendEnabled()) return;

    const tick = async () => {
      try {
        const q = await getQueueCounts();
        setQueueCounts(q);
        if (userId) setInboxCount(await getPendingInboxCount(userId));
      } catch {
        /* noop */
      }
    };
    tick();
    const t = setInterval(tick, 3000);
    return () => clearInterval(t);
  }, [userId]);

  return (
    <div
      className="min-h-screen w-full text-white pb-20 relative overflow-hidden"
      style={{ background: "#05070D" }}
    >
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[140px]"
          style={{
            background: "radial-gradient(circle, rgba(0,183,255,0.25) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full blur-[140px]"
          style={{
            background: "radial-gradient(circle, rgba(168,85,247,0.22) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full blur-[140px]"
          style={{
            background: "radial-gradient(circle, rgba(255,200,87,0.10) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Header */}

      <div
        className="sticky top-0 z-30 backdrop-blur-2xl border-b"
        style={{ background: "rgba(5,7,13,0.75)", borderColor: "rgba(0,183,255,0.20)" }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center gap-3">
          {/* Official Trey TV brandmark (transparent — no white box) */}
          <TreyBrandMark size={34} glow className="shrink-0" />
          <div className="h-8 w-px bg-white/10 shrink-0" />
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center relative shrink-0"
            style={{
              background: "linear-gradient(135deg,#00B7FF,#A855F7)",
              boxShadow: "0 0 24px rgba(0,183,255,0.55), inset 0 1px 0 rgba(255,255,255,0.3)",
            }}
          >
            <Gamepad2 size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] tracking-[0.3em] font-bold" style={{ color: "#00B7FF" }}>
              GAME ROOM
            </div>
            <div className="text-sm md:text-base font-black leading-tight tracking-tight">
              Private Lounge
            </div>
          </div>

          {displayName && (
            <button
              onClick={onEditName}
              className="text-xs px-3 py-1.5 rounded-xl border hover:bg-white/5 hidden sm:flex items-center gap-1.5 transition"
              style={{ borderColor: "rgba(0,183,255,0.3)", color: "#94A3B8" }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {displayName}
            </button>
          )}
          {onOpenFriends && (
            <button
              onClick={onOpenFriends}
              className="p-2 rounded-xl hover:bg-white/5 transition"
              title="Friends"
            >
              <UserPlus size={18} />
            </button>
          )}
          {onOpenInbox && (
            <button
              onClick={onOpenInbox}
              className="p-2 rounded-xl hover:bg-white/5 transition relative"
              title="Game Requests"
            >
              <Inbox size={18} />
              {inboxCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-[9px] font-black px-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full"
                  style={{
                    background: "#FFC857",
                    color: "#05070D",
                    boxShadow: "0 0 10px rgba(255,200,87,0.7)",
                  }}
                >
                  {inboxCount > 9 ? "9+" : inboxCount}
                </span>
              )}
            </button>
          )}
          <button
            onClick={onLegend}
            className="p-2 rounded-xl hover:bg-white/5 transition"
            title="Suit legend"
          >
            <Info size={18} />
          </button>
          <button
            onClick={onAdmin}
            className="p-2 rounded-xl hover:bg-white/5 transition"
            title="Admin"
          >
            <Settings size={18} />
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/5"
            title="Back to Home"
          >
            <ArrowLeft size={14} /> Back to Home
          </button>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 pt-6 md:pt-8">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="mb-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black text-slate-200 backdrop-blur-md transition hover:bg-white/[0.08] sm:hidden"
        >
          <ArrowLeft size={14} /> Back to Home
        </button>
        {/* HERO */}
        <div
          className="relative rounded-[32px] overflow-hidden border trey-table-rim"
          style={{
            borderColor: "rgba(0,183,255,0.4)",
            boxShadow: "0 0 80px rgba(0,183,255,0.18), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <div className="absolute inset-0">
            <img src={HERO_IMG} alt="" className="w-full h-full object-cover" />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(5,7,13,0.4) 0%, rgba(5,7,13,0.55) 50%, rgba(5,7,13,0.92) 100%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(5,7,13,0.85) 0%, rgba(5,7,13,0.35) 50%, rgba(5,7,13,0.6) 100%)",
              }}
            />
          </div>

          <div className="absolute right-4 top-20 hidden sm:block pointer-events-none">
            <div className="relative w-40 h-44">
              {[0, 1, 2].map((i) => (
                <img
                  key={i}
                  src="/assets/games/cards/trey-tv-luxury/card-back.png"
                  alt=""
                  className="absolute w-24 rounded-xl trey-card-depth"
                  style={{
                    right: `${i * 28}px`,
                    top: `${i * 16}px`,
                    transform: `rotate(${(i - 1) * 11}deg)`,
                    opacity: 0.82,
                  }}
                  draggable={false}
                />
              ))}
            </div>
          </div>

          <div className="relative p-6 md:p-12 min-h-[440px] md:min-h-[520px] flex flex-col justify-end">
            <div
              className="inline-flex self-start items-center gap-2 text-[10px] tracking-[0.3em] font-bold mb-4 px-3 py-1.5 rounded-full backdrop-blur-md"
              style={{
                background: "rgba(0,183,255,0.12)",
                border: "1px solid rgba(0,183,255,0.4)",
                color: "#00B7FF",
              }}
            >
              <Sparkles size={12} /> CINEMATIC GAME LOUNGE
            </div>
            <h1 className="text-4xl md:text-7xl font-black leading-[0.95] tracking-tight">
              Trey TV
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg,#00B7FF 0%,#A855F7 60%,#FFC857 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Game Room
              </span>
            </h1>
            <p className="text-sm md:text-lg text-slate-300 mt-4 max-w-xl leading-relaxed">
              Classic card games with a Trey TV twist. Real engines, real scoring, live multiplayer
              rooms with the custom Trey TV deck.
            </p>
            <div className="flex flex-wrap gap-3 mt-7">
              <button
                onClick={() => onCreateRoom("spades")}
                className="px-6 py-3.5 rounded-2xl font-black text-sm tracking-wide flex items-center gap-2 transition hover:scale-[1.03] active:scale-95"
                style={{
                  background: "linear-gradient(90deg,#00B7FF,#A855F7)",
                  boxShadow: "0 0 32px rgba(0,183,255,0.5), inset 0 1px 0 rgba(255,255,255,0.25)",
                }}
              >
                <Spade size={16} /> Play Spades
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => onCreateRoom()}
                className="px-6 py-3.5 rounded-2xl font-bold text-sm tracking-wide border flex items-center gap-2 backdrop-blur-xl transition hover:bg-white/10"
                style={{
                  borderColor: "rgba(255,200,87,0.55)",
                  color: "#FFC857",
                  background: "rgba(255,200,87,0.08)",
                }}
              >
                <Users size={16} /> Create Private Room
              </button>
              <button
                onClick={onJoinRoom}
                className="px-6 py-3.5 rounded-2xl font-bold text-sm tracking-wide border flex items-center gap-2 backdrop-blur-xl transition hover:bg-white/5"
                style={{
                  borderColor: "rgba(255,255,255,0.15)",
                  color: "#F8FAFC",
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                <KeyRound size={16} /> Join by Code
              </button>
            </div>

            {/* Stat strip */}
            <div className="grid grid-cols-3 gap-3 md:gap-6 mt-8 max-w-2xl">
              <Stat icon={<Zap size={14} />} label="Live Engines" value="3 Games" color="#00B7FF" />
              <Stat
                icon={<Wifi size={14} />}
                label="Realtime Sync"
                value="Multiplayer"
                color="#A855F7"
              />
              <Stat
                icon={<Trophy size={14} />}
                label="Flagship"
                value="Spades 500"
                color="#FFC857"
              />
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-6">
          <QuickAction
            icon={<Users size={18} />}
            label="Create Private Room"
            sub="Invite friends with a 6-char code"
            color="#00B7FF"
            onClick={() => onCreateRoom()}
          />
          <QuickAction
            icon={<KeyRound size={18} />}
            label="Join by Code"
            sub="Enter a room code your friend shared"
            color="#FFC857"
            onClick={onJoinRoom}
          />
          <QuickAction
            icon={<Shuffle size={18} />}
            label="Play Truno"
            sub="Match colors. Call TRUNO. Own the table."
            color="#D946EF"
            onClick={() => navigate({ to: "/games/truno" })}
          />
          <QuickAction
            icon={<BookOpen size={18} />}
            label="Interactive Stories"
            sub="Switch Kicks and The God Ram"
            color="#D8B4FE"
            onClick={() => navigate({ to: "/games/interactive-stories" })}
          />
        </div>

        {/* Featured */}
        <SectionTitle
          icon={<Crown size={18} className="text-amber-300" />}
          label="Featured"
          sub="Flagship Game"
        />
        <div
          onClick={() => onCreateRoom("spades")}
          className="relative rounded-[28px] overflow-hidden border cursor-pointer group transition hover:-translate-y-0.5"
          style={{ borderColor: "rgba(0,183,255,0.5)", boxShadow: "0 0 60px rgba(0,183,255,0.22)" }}
        >
          <div className="absolute inset-0">
            <img
              src={SPADES_IMG}
              alt=""
              className="w-full h-full object-cover opacity-70 group-hover:opacity-85 group-hover:scale-105 transition-all duration-700"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(5,7,13,0.96) 0%, rgba(5,7,13,0.55) 55%, rgba(5,7,13,0.2) 100%)",
              }}
            />
          </div>
          <div className="relative p-6 md:p-10 min-h-[220px] md:min-h-[280px] flex flex-col justify-end">
            <div className="text-[10px] tracking-[0.3em] font-bold" style={{ color: "#00B7FF" }}>
              FLAGSHIP · 4 PLAYERS · TEAMS
            </div>
            <div className="text-4xl md:text-6xl font-black mt-2 tracking-tight">Spades</div>
            <div className="text-sm md:text-base text-slate-300 mt-2 max-w-md leading-relaxed">
              Live 4-player tables, full bidding, real bag scoring. Trump suit:{" "}
              <span className="font-bold" style={{ color: "#00B7FF" }}>
                Blades
              </span>
              .
            </div>
            <div className="flex flex-wrap gap-2 mt-5">
              <Pill>Bid · Book · Bag</Pill>
              <Pill>Teams of 2</Pill>
              <Pill>To 500 Points</Pill>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <span
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black tracking-wide"
                style={{
                  background: "linear-gradient(90deg,#00B7FF,#A855F7)",
                  boxShadow: "0 0 24px rgba(0,183,255,0.45)",
                }}
              >
                <Spade size={14} /> Create Spades Room
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLaunchSolo("spades");
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold border"
                style={{
                  borderColor: "rgba(255,255,255,0.2)",
                  color: "#F8FAFC",
                  background: "rgba(255,255,255,0.05)",
                }}
              >
                <Bot size={14} /> Solo vs Bots
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Stories — cinematic story-game mode */}
        <InteractiveStoriesSection />

        {/* All games */}
        <SectionTitle
          icon={<Layers size={18} className="text-cyan-300" />}
          label="Choose Game"
          sub="Public queue · invite friends · private room"
        />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <GameCard
            title="Spades"
            tag="TRICK-TAKING · 4P"
            desc="Team strategy. Bids, books, and pressure."
            color="#00B7FF"
            img={SPADES_IMG}
            icon={<Spade size={16} />}
            needs={4}
            waiting={queueCounts.spades}
            onJoinQueue={onJoinQueue ? () => onJoinQueue("spades") : undefined}
            onInvite={onOpenFriends}
            onCreate={() => onCreateRoom("spades")}
            onSolo={() => onLaunchSolo("spades")}
          />
          <GameCard
            title="Blackjack"
            tag="SOLO TABLE · 1P"
            desc="Beat the dealer in the neon lounge."
            color="#FFC857"
            img={BLACKJACK_IMG}
            icon={<Layers size={16} />}
            needs={1}
            waiting={queueCounts.blackjack}
            onJoinQueue={onJoinQueue ? () => onJoinQueue("blackjack") : undefined}
            onInvite={onOpenFriends}
            onCreate={() => onCreateRoom("blackjack")}
            onSolo={() => onLaunchSolo("blackjack")}
          />
          <GameCard
            title="Bullshit"
            tag="BLUFFING · 3-4P"
            desc="Call the bluff before the table flips."
            color="#A855F7"
            img={BULLSHIT_IMG}
            icon={<Sparkles size={16} />}
            needs={4}
            waiting={queueCounts.bullshit}
            onJoinQueue={onJoinQueue ? () => onJoinQueue("bullshit") : undefined}
            onInvite={onOpenFriends}
            onCreate={() => onCreateRoom("bullshit")}
            onSolo={() => onLaunchSolo("bullshit")}
          />
          <TrunoGameCard onClick={() => navigate({ to: "/games/truno" })} />
          <TreynounGameCard onClick={() => navigate({ to: "/games/treynoun" })} />
        </div>

        {/* How it works */}
        <SectionTitle
          icon={<Zap size={18} className="text-purple-300" />}
          label="How It Works"
          sub="Three steps to the table"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              n: "01",
              t: "Create or Join",
              d: "Spin up a private room or enter a friend's 6-character code.",
              c: "#00B7FF",
            },
            {
              n: "02",
              t: "Fill the Table",
              d: "Bots auto-fill empty seats so you start fast — no waiting.",
              c: "#A855F7",
            },
            {
              n: "03",
              t: "Play Live",
              d: "Realtime sync. Reconnect anytime — your seat is saved.",
              c: "#FFC857",
            },
          ].map((s) => (
            <div
              key={s.n}
              className="rounded-3xl p-5 border backdrop-blur-md transition hover:-translate-y-0.5"
              style={{
                background: "rgba(8,17,31,0.65)",
                borderColor: s.c + "30",
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 0 30px ${s.c}10`,
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="text-3xl font-black tracking-tight"
                  style={{ color: s.c, textShadow: `0 0 16px ${s.c}80` }}
                >
                  {s.n}
                </div>
                <div
                  className="h-px flex-1"
                  style={{ background: `linear-gradient(90deg, ${s.c}60, transparent)` }}
                />
              </div>
              <div className="font-black text-lg">{s.t}</div>
              <div className="text-xs text-slate-400 mt-1.5 leading-relaxed">{s.d}</div>
            </div>
          ))}
        </div>

        {/* Custom deck */}
        <SectionTitle
          icon={
            <span className="inline-flex items-center gap-1">
              <Spade size={14} className="text-cyan-300" />
              <Heart size={14} className="text-rose-400" />
              <Diamond size={14} className="text-amber-300" />
              <Club size={14} className="text-emerald-400" />
            </span>
          }
          label="Custom Trey TV Deck"
          sub="Cinematic suits, accurate rules"
        />
        <div
          className="rounded-3xl border p-5 md:p-6 backdrop-blur-md"
          style={{
            background: "rgba(8,17,31,0.65)",
            borderColor: "rgba(168,85,247,0.3)",
            boxShadow: "0 0 40px rgba(168,85,247,0.10)",
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                background: "rgba(168,85,247,0.18)",
                border: "1px solid rgba(168,85,247,0.4)",
              }}
            >
              <ShieldCheck size={20} className="text-purple-300" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-black text-base md:text-lg">Suit Identity, Reimagined</div>
              <p className="text-xs md:text-sm text-slate-300 mt-1.5 leading-relaxed">
                Spades use the <span className="font-bold text-cyan-300">Blades</span> suit, Hearts
                use <span className="font-bold text-rose-300">Soul</span>, Diamonds use{" "}
                <span className="font-bold text-amber-300">Crowns</span>, and Clubs use{" "}
                <span className="font-bold text-emerald-300">Sparks</span>. Gameplay rules stay 100%
                accurate — just the artwork is cinematic.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                <SuitChip name="Blades" plays="Spades" color="#00B7FF" />
                <SuitChip name="Soul" plays="Hearts" color="#F472B6" />
                <SuitChip name="Crowns" plays="Diamonds" color="#FFC857" />
                <SuitChip name="Sparks" plays="Clubs" color="#22C55E" />
              </div>
              <button
                onClick={onLegend}
                className="mt-5 text-xs px-4 py-2 rounded-full font-bold inline-flex items-center gap-1.5"
                style={{
                  background: "rgba(168,85,247,0.2)",
                  border: "1px solid rgba(168,85,247,0.45)",
                  color: "#C4A6FF",
                }}
              >
                View Full Legend <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 mt-10 text-center max-w-md mx-auto leading-relaxed">
          Free-play entertainment only. No real-money wagering, deposits, withdrawals, or cash
          prizes.
        </p>
      </div>
    </div>
  );
};

const Stat: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string }> = ({
  icon,
  label,
  value,
  color,
}) => (
  <div
    className="rounded-2xl p-3 backdrop-blur-md border trey-glass-panel"
    style={{ borderColor: color + "30" }}
  >
    <div
      className="flex items-center gap-1.5 text-[10px] tracking-widest font-bold"
      style={{ color }}
    >
      {icon} {label.toUpperCase()}
    </div>
    <div className="text-sm md:text-base font-black mt-1 truncate">{value}</div>
  </div>
);

const SectionTitle: React.FC<{ icon: React.ReactNode; label: string; sub: string }> = ({
  icon,
  label,
  sub,
}) => (
  <div className="mt-10 md:mt-14 mb-4 flex items-end justify-between gap-3">
    <div>
      <div className="text-[10px] tracking-[0.3em] font-bold text-slate-500">
        {sub.toUpperCase()}
      </div>
      <h2 className="text-2xl md:text-3xl font-black flex items-center gap-2 tracking-tight">
        {icon} {label}
      </h2>
    </div>
    <div
      className="h-px flex-1 max-w-xs"
      style={{
        background: "linear-gradient(90deg, transparent, rgba(0,183,255,0.4), transparent)",
      }}
    />
  </div>
);

const Pill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    className="text-[10px] tracking-wider font-bold px-2.5 py-1 rounded-full backdrop-blur-md"
    style={{
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.12)",
      color: "#CBD5E1",
    }}
  >
    {children}
  </span>
);

const SuitChip: React.FC<{ name: string; plays: string; color: string }> = ({
  name,
  plays,
  color,
}) => (
  <div
    className="rounded-xl p-2.5 border"
    style={{ background: "rgba(5,7,13,0.6)", borderColor: color + "40" }}
  >
    <div className="text-xs font-black" style={{ color }}>
      {name}
    </div>
    <div className="text-[10px] text-slate-400">plays as {plays}</div>
  </div>
);

const QuickAction: React.FC<{
  icon: React.ReactNode;
  label: string;
  sub: string;
  color: string;
  onClick: () => void;
}> = ({ icon, label, sub, color, onClick }) => (
  <button
    onClick={onClick}
    className="rounded-2xl p-4 border text-left cursor-pointer hover:bg-white/[0.04] transition-all hover:-translate-y-0.5 backdrop-blur-md group"
    style={{ borderColor: color + "35", boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04)` }}
  >
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: color + "18", border: "1px solid " + color + "40", color }}
        >
          {icon}
        </div>
        <span className="font-black text-sm">{label}</span>
      </div>
      <ChevronRight size={16} className="text-slate-500 group-hover:translate-x-0.5 transition" />
    </div>
    <div className="text-[11px] text-slate-400 mt-1.5 ml-10">{sub}</div>
  </button>
);

const GameCard: React.FC<{
  title: string;
  tag: string;
  desc: string;
  color: string;
  img: string;
  icon: React.ReactNode;
  needs: number;
  waiting: number;
  onCreate: () => void;
  onSolo: () => void;
  onJoinQueue?: () => void;
  onInvite?: () => void;
}> = ({
  title,
  tag,
  desc,
  color,
  img,
  icon,
  needs,
  waiting,
  onCreate,
  onSolo,
  onJoinQueue,
  onInvite,
}) => (
  <div
    className="rounded-[26px] overflow-hidden border transition-all hover:-translate-y-1 group backdrop-blur-md trey-game-tile-surface"
    style={{
      background: "rgba(8,17,31,0.7)",
      borderColor: color + "50",
      boxShadow: `0 0 40px ${color}20, inset 0 1px 0 rgba(255,255,255,0.05)`,
    }}
  >
    <div className="relative h-40 overflow-hidden">
      <img
        src={img}
        alt=""
        className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
      />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, transparent 0%, rgba(8,17,31,0.4) 50%, rgba(8,17,31,0.98) 100%)`,
        }}
      />
      <div
        className="absolute top-3 left-3 text-[10px] tracking-[0.25em] font-black px-2.5 py-1 rounded-md backdrop-blur-md"
        style={{ background: color + "25", color, border: "1px solid " + color + "60" }}
      >
        {tag}
      </div>
      <div
        className="absolute bottom-3 right-3 w-10 h-10 rounded-2xl flex items-center justify-center backdrop-blur-md"
        style={{
          background: color + "20",
          border: "1px solid " + color + "60",
          color,
          boxShadow: `0 0 18px ${color}40`,
        }}
      >
        {icon}
      </div>
      {/* Live queue chip */}
      <div
        className="absolute top-3 right-3 inline-flex items-center gap-1.5 text-[10px] font-black px-2 py-1 rounded-full backdrop-blur-md"
        style={{ background: "rgba(5,7,13,0.7)", border: "1px solid " + color + "55", color }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ background: color, boxShadow: `0 0 6px ${color}` }}
        />
        {waiting} waiting
      </div>
      <div className="absolute -bottom-4 left-4 h-20 w-28 pointer-events-none opacity-90 group-hover:translate-y-[-3px] transition-transform duration-500">
        {[0, 1, 2].map((i) => (
          <img
            key={i}
            src="/assets/games/cards/trey-tv-luxury/card-back.png"
            alt=""
            className="absolute h-20 rounded-lg trey-card-depth"
            style={{
              left: `${i * 18}px`,
              transform: `rotate(${(i - 1) * 9}deg)`,
              boxShadow: `0 8px 16px rgba(0,0,0,0.45), 0 0 16px ${color}22`,
            }}
            draggable={false}
          />
        ))}
      </div>
    </div>
    <div className="p-5">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-black text-2xl tracking-tight">{title}</h3>
        <div className="text-[10px] font-bold text-slate-500 mt-1.5">Needs {needs}P</div>
      </div>
      <p className="text-xs text-slate-400 mb-4 mt-1 leading-relaxed">{desc}</p>

      {onJoinQueue && (
        <button
          onClick={onJoinQueue}
          className="w-full text-xs font-black px-3 py-2.5 rounded-2xl transition hover:brightness-110 inline-flex items-center justify-center gap-2 mb-2"
          style={{
            background: `linear-gradient(90deg, ${color}, ${color}CC)`,
            color: "#05070D",
            boxShadow: `0 0 24px ${color}55`,
          }}
        >
          <Zap size={13} /> Join Queue
        </button>
      )}

      <div className="flex gap-2">
        {onInvite && (
          <button
            onClick={onInvite}
            className="flex-1 text-[11px] font-bold px-2 py-2 rounded-full border transition hover:bg-white/5 inline-flex items-center justify-center gap-1.5"
            style={{ borderColor: color + "50", color }}
          >
            <UserPlus size={11} /> Invite
          </button>
        )}
        <button
          onClick={onCreate}
          className="flex-1 text-[11px] font-bold px-2 py-2 rounded-full border transition hover:bg-white/5"
          style={{ borderColor: "rgba(255,255,255,0.15)", color: "#CBD5E1" }}
        >
          Private Room
        </button>
        <button
          onClick={onSolo}
          className="flex-1 text-[11px] font-bold px-2 py-2 rounded-full border transition hover:bg-white/5"
          style={{ borderColor: "rgba(255,255,255,0.12)", color: "#94A3B8" }}
        >
          Solo
        </button>
      </div>
    </div>
  </div>
);

const TrunoGameCard: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <div
    onClick={onClick}
    className="rounded-[26px] overflow-hidden border transition-all hover:-translate-y-1 group backdrop-blur-md cursor-pointer"
    style={{
      background: "rgba(8,17,31,0.7)",
      borderColor: "#D946EF50",
      boxShadow: "0 0 40px #D946EF20, inset 0 1px 0 rgba(255,255,255,0.05)",
    }}
  >
    <div className="relative h-40 overflow-hidden">
      <img
        src={TRUNO_IMG}
        alt="Truno"
        className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(8,17,31,0.4) 50%, rgba(8,17,31,0.98) 100%)",
        }}
      />
      <div
        className="absolute top-3 left-3 text-[10px] tracking-[0.25em] font-black px-2.5 py-1 rounded-md backdrop-blur-md"
        style={{ background: "#D946EF25", color: "#D946EF", border: "1px solid #D946EF60" }}
      >
        COLOR MATCH · 2-8P
      </div>
      <div
        className="absolute top-3 right-3 text-[10px] tracking-[0.25em] font-black px-2.5 py-1 rounded-md backdrop-blur-md"
        style={{ background: "rgba(5,7,13,0.7)", color: "#D946EF", border: "1px solid #D946EF55" }}
      >
        🆕 NEW
      </div>
      <div
        className="absolute bottom-3 right-3 w-10 h-10 rounded-2xl flex items-center justify-center backdrop-blur-md text-lg"
        style={{
          background: "#D946EF20",
          border: "1px solid #D946EF60",
          boxShadow: "0 0 18px #D946EF40",
        }}
      >
        🌀
      </div>
    </div>
    <div className="p-5">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-black text-2xl tracking-tight">Truno</h3>
        <div className="text-[10px] font-bold text-slate-500 mt-1.5">2–8 Players</div>
      </div>
      <p className="text-xs text-slate-400 mb-4 mt-1 leading-relaxed">
        Trey TV's original card game. Match colors, stack action cards, and call TRUNO when you're
        down to one.
      </p>
      <button
        className="w-full text-xs font-black px-3 py-2.5 rounded-2xl transition hover:brightness-110 inline-flex items-center justify-center gap-2"
        style={{
          background: "linear-gradient(90deg, #D946EF, #A855F7)",
          color: "#fff",
          boxShadow: "0 0 24px #D946EF55",
        }}
      >
        <Shuffle size={13} /> Play Truno
      </button>
    </div>
  </div>
);

const TreynounGameCard: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <div
    onClick={onClick}
    className="rounded-[26px] overflow-hidden border transition-all hover:-translate-y-1 group backdrop-blur-md cursor-pointer"
    style={{
      background: "rgba(8,17,31,0.7)",
      borderColor: "#A855F750",
      boxShadow: "0 0 40px #A855F720, inset 0 1px 0 rgba(255,255,255,0.05)",
    }}
  >
    <div className="relative h-40 overflow-hidden">
      <img
        src={SPADES_IMG}
        alt="Treynoun"
        className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(8,17,31,0.4) 50%, rgba(8,17,31,0.98) 100%)",
        }}
      />
      <div
        className="absolute top-3 left-3 text-[10px] tracking-[0.25em] font-black px-2.5 py-1 rounded-md backdrop-blur-md"
        style={{ background: "#A855F725", color: "#A855F7", border: "1px solid #A855F760" }}
      >
        MYSTERY CHASE · 1-8P
      </div>
      <div
        className="absolute top-3 right-3 text-[10px] tracking-[0.25em] font-black px-2.5 py-1 rounded-md backdrop-blur-md"
        style={{ background: "rgba(5,7,13,0.7)", color: "#FFC857", border: "1px solid #FFC85755" }}
      >
        🆕 NEW
      </div>
      <div
        className="absolute bottom-3 right-3 w-10 h-10 rounded-2xl flex items-center justify-center backdrop-blur-md text-lg"
        style={{
          background: "#FFC85720",
          border: "1px solid #FFC85760",
          boxShadow: "0 0 18px #FFC85740",
          color: "#FFC857",
        }}
      >
        🔍
      </div>
    </div>
    <div className="p-5">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-black text-2xl tracking-tight">Treynoun</h3>
        <div className="text-[10px] font-bold text-slate-500 mt-1.5">1-8 Players</div>
      </div>
      <p className="text-xs text-slate-400 mb-4 mt-1 leading-relaxed">
        Chase the noun. Crack the clues. Lock it in. A Trey TV original noun-based mystery chase.
      </p>
      <button
        className="w-full text-xs font-black px-3 py-2.5 rounded-2xl transition hover:brightness-110 inline-flex items-center justify-center gap-2"
        style={{
          background: "linear-gradient(90deg, #A855F7, #00B7FF)",
          color: "#fff",
          boxShadow: "0 0 24px #A855F755",
        }}
      >
        <Zap size={13} /> Play Treynoun
      </button>
    </div>
  </div>
);

import React from "react";
import { Zap, Users, Bot, Trophy, BookOpen, Crown, Award } from "lucide-react";
import TrunoLogo from "../components/TrunoLogo";

const modes = [
  {
    key: "quick",
    title: "Quick Play",
    desc: "Fast matchmaking, 2-4 players",
    Icon: Zap,
    view: "match",
    grad: "from-fuchsia-600 to-purple-700",
    text: "text-fuchsia-300",
    border: "border-fuchsia-500/40",
  },
  {
    key: "friends",
    title: "Play Friends",
    desc: "Private room with room code",
    Icon: Users,
    view: "room",
    grad: "from-amber-600 to-orange-700",
    text: "text-amber-300",
    border: "border-amber-500/40",
  },
  {
    key: "ai",
    title: "AI Match",
    desc: "Practice vs Easy/Normal/Smart/Savage",
    Icon: Bot,
    view: "match",
    grad: "from-cyan-600 to-blue-700",
    text: "text-cyan-300",
    border: "border-cyan-500/40",
  },
  {
    key: "tourney",
    title: "Tournament",
    desc: "Bracket battles & prize pools",
    Icon: Trophy,
    view: "tournament",
    grad: "from-pink-600 to-rose-700",
    text: "text-pink-300",
    border: "border-pink-500/40",
  },
  {
    key: "tutorial",
    title: "Tutorial",
    desc: "AI coach teaches the rules",
    Icon: BookOpen,
    view: "tutorial",
    grad: "from-emerald-600 to-teal-700",
    text: "text-emerald-300",
    border: "border-emerald-500/40",
  },
  {
    key: "pass",
    title: "TRUNO Pass",
    desc: "Season rewards & unlocks",
    Icon: Crown,
    view: "pass",
    grad: "from-amber-500 to-yellow-600",
    text: "text-amber-300",
    border: "border-amber-500/40",
  },
  {
    key: "leader",
    title: "Leaderboard",
    desc: "Climb the Spectrum tiers",
    Icon: Award,
    view: "leaderboard",
    grad: "from-purple-600 to-indigo-700",
    text: "text-purple-300",
    border: "border-purple-500/40",
  },
  {
    key: "victory",
    title: "Last Victory",
    desc: "Review your latest win",
    Icon: Trophy,
    view: "victory",
    grad: "from-amber-600 to-fuchsia-700",
    text: "text-amber-300",
    border: "border-amber-500/40",
  },
];

const PlayScreen: React.FC<{
  onNavigate: (v: string) => void;
  onQuickPlay: () => void;
  onAiMatch: () => void;
  onPlayFriends: () => void;
}> = ({ onNavigate, onQuickPlay, onAiMatch, onPlayFriends }) => {
  const handleMode = (key: string, view: string) => {
    if (key === "quick") onQuickPlay();
    else if (key === "ai") onAiMatch();
    else if (key === "friends") onPlayFriends();
    else onNavigate(view);
  };

  return (
    <div className="px-3 pb-24 space-y-4">
      <div className="flex flex-col items-center pt-2">
        <TrunoLogo size="md" subtitle="Choose your mode. Own the table." showParent={false} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {modes.map((m) => (
          <button
            key={m.key}
            onClick={() => handleMode(m.key, m.view)}
            className={`relative rounded-2xl border ${m.border} bg-zinc-950/40 backdrop-blur-xl p-4 text-left hover:-translate-y-1 hover:border-white/20 active:scale-95 transition-all duration-300 overflow-hidden group shadow-[0_4px_20px_rgba(0,0,0,0.4)]`}
          >
            <div
              className={`absolute -inset-4 bg-gradient-to-br ${m.grad} opacity-0 group-hover:opacity-15 blur-xl transition-opacity duration-500`}
            />
            <div className="relative">
              <div
                className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${m.grad} flex items-center justify-center mb-2.5 shadow-[inset_0_1px_3px_rgba(255,255,255,0.15)] group-hover:scale-110 transition-transform duration-300`}
                style={{ background: "linear-gradient(135deg, rgba(0,0,0,0.5), rgba(0,0,0,0.7))" }}
              >
                <m.Icon size={20} className={m.text} strokeWidth={2} />
              </div>
              <h3 className={`font-black text-base ${m.text}`}>{m.title}</h3>
              <p className="text-[11px] text-zinc-400 mt-1 leading-snug group-hover:text-zinc-300 transition-colors">
                {m.desc}
              </p>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-current opacity-0 group-hover:opacity-30 transition-opacity" />
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-850 bg-zinc-950/40 p-3 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <h3 className="text-xs font-bold text-cyan-300 tracking-wider mb-2">
          QUICK AI MATCH — DIFFICULTY
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {["Easy", "Normal", "Smart", "Savage"].map((d, i) => (
            <button
              key={d}
              onClick={onAiMatch}
              className={`py-2.5 rounded-xl border text-xs font-bold transition-all duration-200 active:scale-95
                ${i === 0 ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-400" : ""}
                ${i === 1 ? "border-cyan-500/30 bg-cyan-500/5 text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-400" : ""}
                ${i === 2 ? "border-fuchsia-500/30 bg-fuchsia-500/5 text-fuchsia-300 hover:bg-fuchsia-500/10 hover:border-fuchsia-400" : ""}
                ${i === 3 ? "border-red-500/30 bg-red-500/5 text-red-300 hover:bg-red-500/10 hover:border-red-400" : ""}
              `}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlayScreen;

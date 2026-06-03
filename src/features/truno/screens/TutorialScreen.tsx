import React, { useState } from "react";
import { Play, ChevronRight, Bot, Zap, RotateCw, Megaphone } from "lucide-react";
import TrunoLogo from "../components/TrunoLogo";
import TrunoCard from "../components/TrunoCard";
import { TrunoCard as TCard } from "../lib/cards";

type TipIcon =
  | React.ComponentType<{ size?: number; className?: string }>
  | (() => React.ReactElement);

interface Tip {
  num: number;
  label: string;
  color: string;
  desc: string;
  Icon: TipIcon;
}

const tips: Tip[] = [
  {
    num: 1,
    label: "Match Colors",
    color: "fuchsia",
    desc: "Play a card that matches the color on the table.",
    Icon: () => <div className="text-2xl">🃏</div>,
  },
  {
    num: 2,
    label: "Action Cards",
    color: "cyan",
    desc: "Use action cards to change the game!",
    Icon: Zap,
  },
  {
    num: 3,
    label: "Wild Cards",
    color: "amber",
    desc: "Change the color and keep the game going.",
    Icon: RotateCw,
  },
  {
    num: 4,
    label: "Call TRUNO",
    color: "emerald",
    desc: "Don't forget to call TRUNO when you're down to one card!",
    Icon: Megaphone,
  },
];

const exampleHand: TCard[] = [
  { id: "e1", color: "red", symbol: "number", value: 7, label: "7" },
  { id: "e2", color: "blue", symbol: "number", value: 2, label: "2" },
  { id: "e3", color: "green", symbol: "number", value: 5, label: "5" },
  { id: "e4", color: "purple", symbol: "wild_draw_four", value: 4, label: "+4" },
];

const practiceHand: TCard[] = [
  { id: "p1", color: "green", symbol: "number", value: 3, label: "3" },
  { id: "p2", color: "blue", symbol: "draw_two", value: 2, label: "+2" },
  { id: "p3", color: "black", symbol: "wild", label: "W" },
  { id: "p4", color: "yellow", symbol: "number", value: 8, label: "8" },
  { id: "p5", color: "red", symbol: "number", value: 1, label: "1" },
];

const colorMap: Record<string, string> = {
  fuchsia: "border-fuchsia-500 text-fuchsia-300",
  cyan: "border-cyan-500 text-cyan-300",
  amber: "border-amber-500 text-amber-300",
  emerald: "border-emerald-500 text-emerald-300",
};

const TutorialScreen: React.FC<{ onNavigate: (v: string) => void }> = ({ onNavigate }) => {
  const [practice, setPractice] = useState(true);

  return (
    <div className="px-3 pb-24 space-y-4">
      <div className="flex flex-col items-center">
        <TrunoLogo size="md" subtitle="Learn. Practice. Master. Win." showParent={false} />
      </div>

      <div className="grid lg:grid-cols-[1fr_2fr] gap-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
          <h3 className="text-sm font-bold text-fuchsia-300 tracking-wider mb-4">HOW TO PLAY</h3>
          <div className="space-y-4 relative">
            <div className="absolute left-5 top-2 bottom-2 w-px bg-gradient-to-b from-fuchsia-500 via-cyan-500 via-amber-500 to-emerald-500" />
            {tips.map((t, i) => {
              const cls = colorMap[t.color];
              const textColor = cls.split(" ")[1];
              return (
                <div key={i} className="flex items-start gap-3 relative">
                  <div
                    className={`w-10 h-10 rounded-full bg-zinc-950 border-2 ${cls} flex items-center justify-center font-black text-sm relative z-10`}
                  >
                    {t.num}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-bold ${textColor}`}>{t.label}</span>
                      <t.Icon size={18} className={textColor} />
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-snug">{t.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 rounded-xl border border-fuchsia-500/30 bg-zinc-900/60 p-3">
            <div className="text-[10px] font-bold text-fuchsia-300 tracking-wider">PROGRESS</div>
            <div className="text-xs text-zinc-300 mt-0.5">0/4 Tips Completed</div>
            <div className="h-1.5 mt-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-500 rounded-full"
                style={{ width: "0%" }}
              />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <div className="text-2xl">🎁</div>
              <div className="flex-1">
                <div className="text-[11px] text-zinc-300">
                  Complete all tips to unlock a reward!
                </div>
                <div className="text-xs font-bold text-amber-300">★ +250</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-sm font-bold text-fuchsia-300">1. MATCH COLORS</div>
                <p className="text-[11px] text-zinc-400 mt-1 max-w-xs">
                  Play a card that matches the color of the top card on the table.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-700 ring-2 ring-fuchsia-500/50" />
                <span className="text-[10px] text-white mt-1">Zay</span>
                <span className="text-[10px] text-zinc-500">4</span>
              </div>
            </div>

            <div className="relative aspect-[4/3] flex items-center justify-center my-3">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(157,78,221,0.15), transparent 70%)",
                }}
              />
              <div className="absolute left-2 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-700 ring-1 ring-pink-500/50" />
                <span className="text-[9px] text-white mt-1">Maya</span>
                <span className="text-[9px] text-zinc-500">4</span>
              </div>
              <div className="absolute right-2 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-700 ring-1 ring-purple-500/50" />
                <span className="text-[9px] text-white mt-1">Lena</span>
                <span className="text-[9px] text-zinc-500">4</span>
              </div>
              <div className="flex items-center gap-3">
                <TrunoCard
                  card={{ id: "d", color: "black", symbol: "wild", label: "W" }}
                  size="sm"
                  faceDown
                />
                <TrunoCard
                  card={{ id: "t", color: "blue", symbol: "number", value: 7, label: "7" }}
                  size="sm"
                  playable
                />
              </div>
            </div>

            <div className="flex justify-center gap-1 mt-3">
              {exampleHand.map((c) => (
                <TrunoCard key={c.id} card={c} size="xs" playable />
              ))}
            </div>

            <div className="mt-4 rounded-xl bg-zinc-900/80 border border-cyan-500/30 p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center">
                <Bot size={20} className="text-cyan-300" />
              </div>
              <div className="flex-1">
                <div className="text-[11px] font-bold text-cyan-300">TREY AI COACH</div>
                <p className="text-[11px] text-zinc-300">
                  Nice! You matched the blue color.
                  <br />
                  That's how you keep the game going.
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-700 ring-2 ring-fuchsia-500/50 flex-shrink-0" />
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900/60 text-zinc-300 text-xs font-bold">
                <Play size={12} className="text-cyan-300" /> Watch Demo
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-300 text-xs font-bold">
                Next Tip <ChevronRight size={12} />
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-fuchsia-300">PRACTICE TABLE</h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-400 font-bold tracking-wider">
                  PRACTICE MODE
                </span>
                <button
                  onClick={() => setPractice(!practice)}
                  className={`w-10 h-5 rounded-full p-0.5 ${practice ? "bg-emerald-500" : "bg-zinc-700"}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${practice ? "translate-x-5" : ""}`}
                  />
                </button>
              </div>
            </div>
            <p className="text-[11px] text-zinc-400">
              Practice against AI opponents and sharpen your skills.
            </p>

            <div className="flex items-center justify-center my-3">
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold flex items-center gap-1">
                <Bot size={10} /> AI Easy
              </span>
            </div>

            <div className="flex items-center justify-around">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center">
                  <Bot size={20} className="text-cyan-300" />
                </div>
                <span className="text-[10px] text-cyan-300 font-bold mt-1">AI Easy</span>
                <span className="text-[9px] text-zinc-500">4</span>
              </div>
              <div className="flex items-center gap-2">
                <TrunoCard
                  card={{ id: "pd", color: "black", symbol: "wild", label: "W" }}
                  size="sm"
                  faceDown
                />
                <TrunoCard
                  card={{ id: "pt", color: "red", symbol: "number", value: 2, label: "2" }}
                  size="sm"
                  playable
                />
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center">
                  <Bot size={20} className="text-cyan-300" />
                </div>
                <span className="text-[10px] text-cyan-300 font-bold mt-1">AI Easy</span>
                <span className="text-[9px] text-zinc-500">4</span>
              </div>
            </div>

            <div className="flex justify-center gap-1 mt-3">
              {practiceHand.map((c) => (
                <TrunoCard key={c.id} card={c} size="xs" playable />
              ))}
            </div>

            <button
              onClick={() => onNavigate("match")}
              className="mt-3 w-full py-3 rounded-xl font-black relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-purple-700" />
              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-purple-700 blur-md opacity-60" />
              <span className="relative text-white">Practice Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialScreen;

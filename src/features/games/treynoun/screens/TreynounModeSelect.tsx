import React from "react";
import { ScreenWrap, TreyHeader, TreyBottomNav } from "../components/TreyShell";
import { GameMode } from "../treynounTypes";
import {
  User,
  Users,
  Radio,
  Smartphone,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Lock,
} from "lucide-react";

interface Props {
  onPick: (m: GameMode) => void;
  onBack: () => void;
  onExit: () => void;
}

const modes = [
  {
    id: "solo",
    title: "Noun Chase Solo",
    desc: "Chase the target noun against the clock in 5 intense rounds.",
    icon: User,
    color: "#00F0FF",
    live: true,
    badge: "Solo Run",
  },
  {
    id: "pass-noun",
    title: "Pass The Noun",
    desc: "Build a secret trail of signal clues and pass the device.",
    icon: Smartphone,
    color: "#FFB800",
    live: true,
    badge: "Party Local",
  },
  {
    id: "battle",
    title: "Noun Battle",
    desc: "Race other players in teams! Lock in, steal, and trap nouns.",
    icon: Users,
    color: "#FF00E5",
    live: true,
    badge: "Hot",
  },
  {
    id: "live-room",
    title: "Live Noun Room",
    desc: "Join the party room and guess live alongside the host.",
    icon: Radio,
    color: "#2DD4BF",
    live: true,
    badge: "Live Feed",
  },
  {
    id: "daily",
    title: "Daily Noun Drop",
    desc: "One fresh target noun drops every 24 hours. Compete globally.",
    icon: CalendarClock,
    color: "#A78BFA",
    live: false,
    badge: "Locked",
  },
] as const;

const TreynounModeSelect: React.FC<Props> = ({ onPick, onBack, onExit }) => (
  <ScreenWrap>
    <TreyHeader />
    <div className="flex-1 overflow-y-auto px-4 pb-6 trey-rise">
      <div className="flex items-center gap-3 mt-6 mb-5">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center active:scale-90 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-2xl font-black text-white">Choose Your Chase</h1>
      </div>

      <div className="space-y-4">
        {modes.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => m.live && onPick(m.id as GameMode)}
              disabled={!m.live}
              className="w-full rounded-3xl border p-4 flex items-center gap-4 text-left transition-all duration-300 active:scale-[0.98] disabled:opacity-50 hover:translate-x-1.5"
              style={{
                borderColor: `${m.color}40`,
                background: `linear-gradient(135deg, ${m.color}15, transparent)`,
                boxShadow: m.live ? `0 0 15px ${m.color}11` : "none",
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300"
                style={{
                  background: `${m.color}1a`,
                  border: `2px solid ${m.color}`,
                  color: m.color,
                  boxShadow: `0 0 10px ${m.color}33`,
                }}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-black text-base flex items-center gap-2 text-white">
                  {m.title}
                  {m.badge && (
                    <span
                      className="text-[8px] px-2 py-0.5 rounded-full font-black tracking-wider uppercase border"
                      style={{
                        borderColor: `${m.color}40`,
                        background: `${m.color}10`,
                        color: m.color,
                      }}
                    >
                      {m.badge}
                    </span>
                  )}
                </div>
                <div className="text-xs text-white/50 mt-1 leading-snug">{m.desc}</div>
              </div>
              {m.live ? (
                <ChevronRight className="w-5 h-5 text-white/40 shrink-0" />
              ) : (
                <Lock className="w-4 h-4 text-white/30 shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
    <TreyBottomNav active="home" onHome={onExit} />
  </ScreenWrap>
);

export default TreynounModeSelect;

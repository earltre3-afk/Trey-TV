import React, { useState } from "react";
import { TVFrame } from "../components/TVFrame";
import { GlassPanel, RemoteHints } from "../components/Primitives";
import { decisions, IMG } from "../mockData";
import {
  Heart,
  Crown,
  Star,
  Shield,
  Handshake,
  Users,
  Scale,
  Footprints,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const meters = [
  { name: "KI", value: 72, label: "Trusted", Icon: Heart, tone: "magenta" },
  { name: "FARIUM", value: 49, label: "Neutral", Icon: Crown, tone: "gold" },
  { name: "DUKE DENNIS", value: 81, label: "Loyal", Icon: Star, tone: "fuchsia" },
  { name: "AGENT 00", value: 35, label: "Wary", Icon: Shield, tone: "cyan" },
];

const riskColor = {
  MEDIUM: "text-amber-300",
  LOW: "text-emerald-400",
  HIGH: "text-red-400",
  EXTREME: "text-purple-400",
} as const;

type StoryRisk = keyof typeof riskColor;

const decisionIcons = [Handshake, Users, Scale, Footprints];

export const StoriesScreen: React.FC = () => {
  const [sel, setSel] = useState(0);
  return (
    <TVFrame activeRail="Browse" showTopNav>
      <section className="relative -mx-8 h-[calc(100vh-130px)] overflow-hidden">
        <img src={IMG(0)} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/55 to-black/70" />

        <div className="relative grid grid-cols-[1fr_400px] gap-10 px-12 pt-8 h-full">
          {/* Left content */}
          <div>
            <div className="text-fuchsia-300 font-bold tracking-[0.3em] text-sm">
              BUILT DIFFERENT: CHAPTER 4
            </div>
            <h1 className="text-8xl font-black tracking-tight mt-2 bg-gradient-to-r from-white to-fuchsia-200 bg-clip-text text-transparent">
              CROSSROADS
            </h1>
            <p className="mt-5 text-xl text-white/85 max-w-xl leading-relaxed">
              The city is watching your every move.
              <br />
              One decision can elevate your legacy...
              <br />
              or end it.
            </p>

            <div className="mt-10">
              <div className="text-xs tracking-[0.25em] font-bold text-fuchsia-300 mb-1">
                STORY OBJECTIVE
              </div>
              <div className="text-base text-white/80 max-w-md">
                Secure the deal without compromising your crew.
              </div>
            </div>

            <div className="mt-12">
              <div className="text-xs tracking-[0.25em] font-bold text-fuchsia-300 mb-4">
                WHAT WILL TREY DO?
              </div>
              <div className="grid grid-cols-4 gap-3">
                {decisions.map((d, i) => {
                  const Icon = decisionIcons[i];
                  const isSel = i === sel;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setSel(i)}
                      className={
                        "relative p-5 rounded-2xl border bg-black/55 backdrop-blur-md outline-none text-center transition-all " +
                        (isSel
                          ? "border-fuchsia-400 shadow-[0_0_36px_rgba(255,43,214,0.85)] scale-[1.05]"
                          : "border-white/15 hover:border-white/30 focus:border-fuchsia-400 focus:shadow-[0_0_24px_rgba(255,43,214,0.5)]")
                      }
                    >
                      <div className="absolute top-2 left-2 w-7 h-7 rounded-md border border-fuchsia-400/60 flex items-center justify-center text-xs font-black text-fuchsia-300">
                        {d.id}
                      </div>
                      <Icon className="w-12 h-12 mx-auto text-fuchsia-300 mb-3" />
                      <div className="font-black tracking-wide">{d.title}</div>
                      <div className="text-xs text-white/65 mt-1.5 min-h-[40px]">{d.desc}</div>
                      <div className="mt-3 text-xs font-black">
                        <span className="text-white/60">RISK: </span>
                        <span className={riskColor[d.risk as StoryRisk]}>{d.risk}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8">
              <RemoteHints
                hints={[
                  { label: "Navigate", icon: "⊕" },
                  { label: "Select", icon: "OK" },
                  { label: "Back", icon: "↩" },
                ]}
              />
            </div>
          </div>

          {/* Right: progress + meters */}
          <div className="space-y-4">
            <GlassPanel className="p-5">
              <div className="flex justify-between items-center mb-3">
                <div className="text-xs tracking-widest font-bold text-fuchsia-300">
                  STORY PROGRESS
                </div>
                <div className="text-2xl font-black">40%</div>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => {
                  const done = n <= 2;
                  const active = n === 3;
                  return (
                    <div key={n} className="flex-1 flex flex-col items-center">
                      <div
                        className={
                          "w-9 h-9 rounded-full flex items-center justify-center border-2 " +
                          (done
                            ? "bg-fuchsia-500 border-fuchsia-300"
                            : active
                              ? "border-fuchsia-400 shadow-[0_0_18px_rgba(255,43,214,0.7)]"
                              : "border-white/20")
                        }
                      >
                        {done ? "✓" : <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-400" />}
                      </div>
                      <div className="text-[10px] font-bold mt-1 text-white/70">CH {n}</div>
                    </div>
                  );
                })}
              </div>
            </GlassPanel>

            <GlassPanel className="p-5">
              <div className="text-xs tracking-widest font-bold text-fuchsia-300 mb-4">
                RELATIONSHIPS &amp; STATS
              </div>
              <div className="space-y-3">
                {meters.map((m) => (
                  <div key={m.name} className="flex items-center gap-3">
                    <m.Icon className="w-4 h-4 text-fuchsia-400 shrink-0" />
                    <div className="text-xs font-bold w-24 truncate">{m.name}</div>
                    <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-fuchsia-400 to-purple-500"
                        style={{ width: `${m.value}%` }}
                      />
                    </div>
                    <div className="text-xs font-bold w-10 text-right">{m.value}%</div>
                    <div className="text-xs text-white/60 w-16">{m.label}</div>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </div>
        </div>

        {/* Side arrows */}
        <button className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 border border-white/20 flex items-center justify-center outline-none focus:border-fuchsia-400">
          <ChevronLeft />
        </button>
        <button className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 border border-white/20 flex items-center justify-center outline-none focus:border-fuchsia-400">
          <ChevronRight />
        </button>
      </section>
    </TVFrame>
  );
};

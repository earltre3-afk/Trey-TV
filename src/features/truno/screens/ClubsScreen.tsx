import React, { useState } from "react";
import { Users, Crown, Mail, Plus, ChevronRight, Globe } from "lucide-react";
import TrunoLogo from "../components/TrunoLogo";

const clubs = [
  {
    name: "Creators Table",
    tag: "TRENDING",
    verified: true,
    desc: "Where creators, fans & legends play.",
    tags: ["Social", "Voice", "Casual"],
    online: "1.2K",
    members: 124,
    gradient: "from-purple-900 via-fuchsia-900 to-pink-900",
    action: "Enter",
  },
  {
    name: "Memphis Nights",
    tag: "",
    verified: false,
    desc: "Rep the 901. Vibes, music & cards.",
    tags: ["Music", "Voice", "Social"],
    online: "856",
    members: 87,
    gradient: "from-pink-900 via-red-900 to-purple-900",
    action: "Join",
  },
  {
    name: "Competitive Club",
    tag: "RANKED",
    verified: false,
    desc: "Climb the ranks. Earn. Flex.",
    tags: ["Ranked", "Competitive", "Voice"],
    online: "732",
    members: 64,
    gradient: "from-amber-900 via-orange-900 to-red-900",
    action: "Enter",
  },
  {
    name: "Chill & Match",
    tag: "",
    verified: false,
    desc: "Kick back, relax & match up.",
    tags: ["Casual", "Social", "Voice"],
    online: "1.1K",
    members: 103,
    gradient: "from-fuchsia-900 via-purple-900 to-blue-900",
    action: "Join",
  },
  {
    name: "Wild Card Society",
    tag: "TRENDING",
    verified: false,
    desc: "Wildcard rules. Unlimited fun.",
    tags: ["Fun", "Wild", "Social"],
    online: "645",
    members: 58,
    gradient: "from-purple-900 via-violet-900 to-indigo-900",
    action: "Join",
  },
];

const ClubsScreen: React.FC<{ onNavigate: (v: string) => void }> = ({ onNavigate }) => {
  const [tab, setTab] = useState<"all" | "mine" | "invites" | "create">("all");

  return (
    <div className="px-3 pb-24 space-y-4">
      <div className="flex flex-col items-center">
        <TrunoLogo size="md" subtitle="" showParent={false} />
        <p className="text-xs tracking-[0.3em] font-bold text-fuchsia-300 mt-1">
          CLUBS & COMMUNITY
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[
          { k: "all", label: "All Clubs", Icon: Users },
          { k: "mine", label: "My Clubs", Icon: Crown },
          { k: "invites", label: "Invites", Icon: Mail, badge: 3 },
          { k: "create", label: "Create", Icon: Plus },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k as "all" | "mine" | "invites" | "create")}
            className={`relative px-2 py-2.5 rounded-2xl border text-[11px] font-bold flex items-center justify-center gap-1.5
              ${tab === t.k ? "border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-300 shadow-[0_0_15px_rgba(255,0,128,0.25)]" : "border-zinc-800 bg-zinc-950/60 text-zinc-400"}`}
          >
            <t.Icon size={13} />
            <span className="hidden sm:inline">{t.label}</span>
            {"badge" in t && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-fuchsia-500 text-[9px] font-black text-white flex items-center justify-center">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-zinc-300 tracking-wider">FEATURED CLUBS</h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" /> Live Now
          </span>
        </div>
        <button className="text-xs text-zinc-400 flex items-center gap-1">
          See all <ChevronRight size={12} />
        </button>
      </div>

      <div className="space-y-3">
        {clubs.map((c, i) => (
          <div
            key={i}
            className="rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-xl overflow-hidden flex"
          >
            <div className={`relative w-28 flex-shrink-0 bg-gradient-to-br ${c.gradient}`}>
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at center, rgba(255,0,128,0.3), transparent 70%)",
                }}
              />
              {c.tag && (
                <span className="absolute top-2 left-2 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-500/30 border border-amber-500/50 text-amber-200">
                  {c.tag === "TRENDING" ? "+ TRENDING" : c.tag}
                </span>
              )}
              <div className="absolute inset-0 flex items-center justify-center text-3xl opacity-60">
                {i === 0 ? "🎬" : i === 1 ? "🏙️" : i === 2 ? "🏆" : i === 3 ? "🛋️" : "🌌"}
              </div>
            </div>
            <div className="flex-1 p-3 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-white text-sm truncate">{c.name}</h3>
                    {c.verified && (
                      <div className="w-4 h-4 rounded-full bg-cyan-500 text-[9px] text-white font-black flex items-center justify-center flex-shrink-0">
                        ✓
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 truncate">{c.desc}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {c.online} Online
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                {c.tags.map((t, j) => (
                  <span
                    key={j}
                    className="text-[9px] px-1.5 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center -space-x-1">
                  {[0, 1, 2, 3, 4].map((j) => (
                    <div
                      key={j}
                      className={`w-5 h-5 rounded-full border border-zinc-900 bg-gradient-to-br ${["from-pink-500 to-rose-700", "from-purple-500 to-indigo-700", "from-fuchsia-500 to-purple-700", "from-amber-500 to-red-700", "from-cyan-500 to-blue-700"][j]}`}
                    />
                  ))}
                  <span className="ml-2 text-[10px] text-zinc-400">+{c.members}</span>
                </div>
                <button
                  onClick={() => onNavigate("match")}
                  className="text-[11px] font-bold px-4 py-1.5 rounded-full border border-fuchsia-500/50 text-fuchsia-300 hover:bg-fuchsia-500/10"
                >
                  {c.action}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-fuchsia-950/40 to-purple-950/40 p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Globe size={20} className="text-amber-400 flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-xs font-bold text-amber-300">TREY TV COMMUNITY HUB</div>
            <div className="text-[10px] text-zinc-400 truncate">
              News, drops, events, & exclusive rewards.
            </div>
          </div>
        </div>
        <button className="text-[11px] font-bold px-3 py-1.5 rounded-full border border-fuchsia-500/50 text-fuchsia-300 flex items-center gap-1 flex-shrink-0">
          <Globe size={11} /> Open Hub
        </button>
      </div>
    </div>
  );
};

export default ClubsScreen;

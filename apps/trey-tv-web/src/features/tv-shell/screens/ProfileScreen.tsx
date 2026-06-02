import React from "react";
import { TVFrame } from "../components/TVFrame";
import { GlassPanel, FocusButton } from "../components/Primitives";
import { ContentRow } from "../components/Rows";
import {
  profile,
  badges,
  stats,
  quickActions,
  continueWatching,
  musicVideos,
  IMG,
} from "../mockData";
import {
  Crown,
  User,
  Lock,
  Bell,
  Pencil,
  Upload,
  Radio,
  Film,
  BarChart3,
  MessageSquare,
  DollarSign,
  Settings as SetIcon,
  Star,
  Award,
  Shield,
  Trophy,
} from "lucide-react";
import { TV_ARTWORK } from "../artwork";

const qaIcons = [Upload, Radio, Film, BarChart3, MessageSquare, DollarSign, SetIcon];

export const ProfileScreen: React.FC = () => {
  const pct = (profile.xp / profile.xpMax) * 100;
  return (
    <TVFrame activeRail="Home">
      {/* Hero */}
      <GlassPanel className="relative overflow-hidden p-6 mb-5">
        <img
          src={TV_ARTWORK.profileCreatorLifestyle}
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/80" />
        <div className="relative grid grid-cols-[260px_1fr_360px] gap-8 items-center">
          {/* Avatar */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-fuchsia-500/40 blur-2xl" />
            <img
              src={profile.avatar}
              className="relative w-[220px] h-[220px] rounded-full object-cover border-4 border-fuchsia-400 shadow-[0_0_50px_rgba(255,43,214,0.7)]"
            />
            <button className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-fuchsia-600 border-2 border-black flex items-center justify-center outline-none focus:scale-110">
              <Pencil className="w-4 h-4" />
            </button>
          </div>

          {/* Center info */}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-6xl font-black tracking-tight">
                <span className="text-white">TREY </span>
                <span className="italic bg-gradient-to-r from-fuchsia-400 to-purple-500 bg-clip-text text-transparent">
                  TRIZZY
                </span>
              </h1>
              <Crown className="w-9 h-9 text-amber-300" />
            </div>
            <div className="mt-1 text-xl font-black tracking-wider">BUILT DIFFERENT.</div>
            <p className="text-white/75 mt-2 max-w-md">
              Exclusive content. Raw gameplay. Real life.
              <br />
              Welcome to the world of Trey Trizzy.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <FocusButton variant="primary" icon={<User className="w-4 h-4" />} autoFocus>
                Edit Profile
              </FocusButton>
              <FocusButton variant="ghost" icon={<SetIcon className="w-4 h-4" />}>
                Account
              </FocusButton>
              <FocusButton variant="ghost" icon={<Lock className="w-4 h-4" />}>
                Parental Controls
              </FocusButton>
              <FocusButton variant="ghost" icon={<Bell className="w-4 h-4" />}>
                Notifications
              </FocusButton>
            </div>
          </div>

          {/* Level card */}
          <div className="rounded-2xl border border-fuchsia-500/40 bg-black/55 p-5 text-center">
            <div className="text-xs tracking-widest text-white/60">LEVEL</div>
            <div className="flex items-center justify-center gap-4">
              <div className="text-6xl font-black">{profile.level}</div>
              <Trophy className="w-14 h-14 text-fuchsia-400 drop-shadow-[0_0_20px_rgba(255,43,214,0.7)]" />
            </div>
            <div className="text-fuchsia-300 font-black tracking-wider mt-1">{profile.rank}</div>
            <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-fuchsia-400 to-purple-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-white/60 mt-1.5">
              <span>
                {profile.xp.toLocaleString()} / {profile.xpMax.toLocaleString()} XP
              </span>
            </div>
            <div className="text-[11px] text-white/50 mt-1">
              5,750 XP to Level {profile.level + 1}
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* Three column row */}
      <div className="grid grid-cols-3 gap-5 mb-5">
        <GlassPanel className="p-5">
          <div className="flex items-end justify-between mb-3">
            <div className="text-lg font-bold">Continue Watching</div>
            <button className="text-xs text-fuchsia-300 focus:underline outline-none">
              View All
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {continueWatching.slice(0, 3).map((v) => (
              <button
                key={v.id}
                className="group relative rounded-xl overflow-hidden outline-none focus:scale-[1.05] focus:shadow-[0_0_24px_rgba(255,43,214,0.6)] transition-all"
              >
                <img src={v.image} className="w-full h-24 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                <div className="absolute bottom-1 left-1.5 right-1.5">
                  <div className="text-[11px] font-bold truncate">{v.title}</div>
                  <div className="text-[9px] text-white/60 truncate">{v.meta}</div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/15">
                  <div
                    className="h-full bg-fuchsia-400"
                    style={{ width: `${(v.progress || 0) * 100}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <div className="flex items-end justify-between mb-3">
            <div className="text-lg font-bold">Saved &amp; My List</div>
            <button className="text-xs text-fuchsia-300 focus:underline outline-none">
              View All
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {musicVideos.slice(0, 3).map((v, i) => (
              <button
                key={v.id}
                className="group relative rounded-xl overflow-hidden outline-none focus:scale-[1.05] focus:shadow-[0_0_24px_rgba(255,43,214,0.6)] transition-all"
              >
                <img src={v.image} className="w-full h-24 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                <span className="absolute top-1 left-1 px-1.5 rounded text-[9px] font-black bg-fuchsia-500">
                  NEW
                </span>
                <div className="absolute bottom-1 left-1.5 right-1.5">
                  <div className="text-[11px] font-bold truncate">{v.title}</div>
                </div>
              </button>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <div className="flex items-end justify-between mb-3">
            <div className="text-lg font-bold">Favorite Games</div>
            <button className="text-xs text-fuchsia-300 focus:underline outline-none">
              View All
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {["2K25", "WARZONE", "FORTNITE", "MINECRAFT"].map((g, i) => (
              <button
                key={g}
                className="group relative aspect-[3/4] rounded-xl overflow-hidden outline-none focus:scale-[1.07] focus:shadow-[0_0_24px_rgba(255,43,214,0.6)] transition-all"
              >
                <img src={IMG(i + 3)} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40 flex items-center justify-center">
                  <span className="text-[10px] font-black tracking-widest">{g}</span>
                </div>
              </button>
            ))}
          </div>
        </GlassPanel>
      </div>

      {/* Stats + badges + creator hub */}
      <div className="grid grid-cols-3 gap-5 mb-5">
        <GlassPanel className="p-5">
          <div className="flex items-end justify-between mb-3">
            <div className="text-lg font-bold">My Stats</div>
            <div className="text-xs text-white/60">This Month ▾</div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-black bg-gradient-to-r from-fuchsia-400 to-purple-500 bg-clip-text text-transparent">
                  {s.value}
                </div>
                <div className="text-[10px] text-white/60 tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm">
            🔥 <span className="font-bold">14 Day Streak</span>
          </div>
          <div className="text-xs text-white/55">Keep it going! Watch or play something today.</div>
          <div className="mt-3 flex justify-between items-center">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full bg-fuchsia-500 flex items-center justify-center text-[10px] font-black"
              >
                ✓
              </div>
            ))}
            {[15, 30, 60].map((n) => (
              <div key={n} className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full border border-white/20" />
                <div className="text-[10px] text-white/50 mt-1">{n}</div>
              </div>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <div className="text-lg font-bold mb-3">Recent Badges</div>
          <div className="grid grid-cols-4 gap-2">
            {badges.map((b) => {
              const tone =
                b.tone === "gold"
                  ? "from-amber-400 to-yellow-700"
                  : b.tone === "silver"
                    ? "from-slate-300 to-slate-600"
                    : "from-fuchsia-500 to-purple-700";
              const Icon = b.tone === "gold" ? Award : b.tone === "silver" ? Star : Shield;
              return (
                <div key={b.id} className="flex flex-col items-center text-center">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tone} flex items-center justify-center shadow-[0_0_20px_rgba(255,43,214,0.4)]`}
                  >
                    <Icon className="w-8 h-8 text-white drop-shadow" />
                  </div>
                  <div className="text-[10px] font-black mt-1.5">{b.name}</div>
                  <div className="text-[9px] text-white/55">{b.meta}</div>
                </div>
              );
            })}
          </div>
          <button className="mt-4 w-full py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold outline-none focus:border-fuchsia-400">
            View All Badges
          </button>
        </GlassPanel>

        <GlassPanel className="p-5 relative overflow-hidden">
          <div className="flex items-end justify-between mb-3">
            <div className="text-lg font-bold">Creator Hub</div>
            <button className="text-xs text-fuchsia-300 focus:underline outline-none">
              Go to Dashboard
            </button>
          </div>
          <div className="relative z-10">
            <div className="text-sm text-white/65">Your Channel</div>
            <div className="text-2xl font-black flex items-center gap-2">
              Trey Trizzy <Crown className="w-5 h-5 text-fuchsia-400" />
            </div>
            <div className="text-xs text-white/55">125K Subscribers</div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                ["1.2M", "Total Views"],
                ["4.8K", "Videos"],
                ["125K", "Subscribers"],
              ].map(([n, l]) => (
                <div key={l}>
                  <div className="text-lg font-black bg-gradient-to-r from-fuchsia-400 to-purple-500 bg-clip-text text-transparent">
                    {n}
                  </div>
                  <div className="text-[10px] text-white/55">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <img
            src={TV_ARTWORK.profileCreatorLifestyle}
            className="absolute right-0 bottom-0 w-44 h-32 object-cover opacity-45 rounded-tl-3xl"
          />
        </GlassPanel>
      </div>

      {/* Quick actions */}
      <GlassPanel className="p-5">
        <div className="text-lg font-bold mb-3">Quick Actions</div>
        <div className="grid grid-cols-7 gap-3">
          {quickActions.map((q, i) => {
            const Icon = qaIcons[i] || SetIcon;
            return (
              <button
                key={q}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-fuchsia-400 focus:shadow-[0_0_24px_rgba(255,43,214,0.55)] focus:scale-[1.04] transition-all"
              >
                <Icon className="w-5 h-5 text-fuchsia-300" />
                <span className="text-sm font-semibold">{q}</span>
              </button>
            );
          })}
        </div>
      </GlassPanel>

      <div className="mt-6 flex items-center justify-between text-xs text-white/45">
        <span>© 2025 Trey TV. All rights reserved.</span>
        <span>
          Press{" "}
          <span className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 font-bold">
            OK
          </span>{" "}
          to select &nbsp; Back ↩
        </span>
      </div>
    </TVFrame>
  );
};

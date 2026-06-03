import React, { useState } from "react";
import {
  Sparkles,
  Play,
  Calendar,
  RotateCcw,
  Plus,
  Radio,
  Users,
  Flame,
  ChevronRight,
  BarChart3,
  Award,
  Star,
  Trophy,
  Activity,
} from "lucide-react";
import { GlassCard, PrimaryButton, SecondaryButton, Chip, TopBar } from "../../ui";
import { MOCK_BATTLES, MOCK_REPLAYS, SONG_WAR_CATEGORIES } from "../data";
import type { SongWarRole, SongWarBattle, SongWarReplay } from "../types";
import { useTradioIdentity } from "../../auth/useTradioIdentity";
import { can } from "../../auth/roleUtils";
import { PrescriptionRail } from "../../auth/components";

interface SongWarsHubProps {
  onNavigate: (dest: {
    view: "hub" | "setup" | "stage" | "results" | "replay";
    battleId?: string;
  }) => void;
  role: SongWarRole;
  onRoleChange: (role: SongWarRole) => void;
  onBack: () => void;
}

export const SongWarsHub: React.FC<SongWarsHubProps> = ({
  onNavigate,
  role,
  onRoleChange,
  onBack,
}) => {
  const { identity } = useTradioIdentity();
  const [filter, setFilter] = useState<
    "Live" | "Upcoming" | "Replays" | "My Battles" | "Following"
  >("Live");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const roleOptions: SongWarRole[] = [
    "fan",
    "artist",
    ...(can(identity, "host-song-war") ? ["dj" as SongWarRole] : []),
    ...(can(identity, "moderate-session") ? ["moderator" as SongWarRole] : []),
    ...(can(identity, "admin-platform") ? ["admin" as SongWarRole] : []),
  ];

  const filters: ("Live" | "Upcoming" | "Replays" | "My Battles" | "Following")[] = [
    "Live",
    "Upcoming",
    "Replays",
    "My Battles",
    "Following",
  ];

  const handleBattleClick = (battle: SongWarBattle) => {
    if (battle.status === "live") {
      onNavigate({ view: "stage", battleId: battle.id });
    } else {
      onNavigate({ view: "setup", battleId: battle.id });
    }
  };

  const handleReplayClick = (replay: SongWarReplay) => {
    onNavigate({ view: "replay", battleId: replay.id });
  };

  // Render items based on filters and categories
  const renderList = () => {
    if (filter === "Live") {
      const live = MOCK_BATTLES.filter((b) => b.status === "live");
      return (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {live.map((b) => (
            <GlassCard
              key={b.id}
              glow
              className="group overflow-hidden bg-gradient-to-b from-[#1C0F2D]/90 to-[#0A0712]/95 border-[0.5px] border-white/10 hover:border-fuchsia-500/30 transition-all duration-500 hover:shadow-[0_0_50px_rgba(217,70,239,0.15)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_20px_40px_rgba(0,0,0,0.6)] rounded-3xl"
            >
              {/* Hot magenta ambient glow inside card */}
              <div className="absolute top-0 right-0 h-32 w-32 bg-fuchsia-500/10 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              <div className="p-7 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 px-3.5 py-1 text-[10px] font-black text-rose-400 animate-pulse uppercase tracking-wider shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> LIVE NOW
                  </span>
                  <span className="text-[11px] font-bold text-white/50 flex items-center gap-1.5">
                    <Activity className="h-3 w-3 text-fuchsia-400 animate-pulse" />
                    {b.listenersCount.toLocaleString()} tuned in
                  </span>
                </div>

                <h3 className="mt-5 text-2xl font-black text-white tracking-tight leading-tight group-hover:text-fuchsia-300 transition-colors">
                  {b.title}
                </h3>
                <p className="text-xs font-semibold text-purple-300/90 mt-1.5 uppercase tracking-wider">
                  {b.type}
                </p>

                {/* Split artist display (Luxury Clashing Arena) */}
                <div className="mt-6 relative flex items-center justify-between rounded-2xl bg-black/40 p-4 border border-white/5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]">
                  {/* Left Artist Panel */}
                  <div className="flex items-center gap-3.5 w-[42%]">
                    <div className="relative shrink-0">
                      <img
                        src={b.artistA.avatar}
                        alt=""
                        className="h-12 w-12 rounded-xl object-cover border border-white/10 group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-black text-white truncate">{b.artistA.name}</div>
                      <div className="text-[10px] text-fuchsia-400/80 font-bold uppercase tracking-wider truncate">
                        {b.artistA.station}
                      </div>
                    </div>
                  </div>

                  {/* VS Emblem Separator */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-fuchsia-500 to-cyan-500 text-[10px] font-black italic text-white shadow-[0_0_15px_rgba(217,70,239,0.5)] border border-white/20 z-10">
                    VS
                  </div>

                  {/* Right Artist Panel */}
                  <div className="flex items-center gap-3.5 w-[42%] flex-row-reverse text-right">
                    <div className="relative shrink-0">
                      <img
                        src={b.artistB.avatar}
                        alt=""
                        className="h-12 w-12 rounded-xl object-cover border border-white/10 group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-black text-white truncate">{b.artistB.name}</div>
                      <div className="text-[10px] text-cyan-400/80 font-bold uppercase tracking-wider truncate">
                        {b.artistB.station}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/5 pt-4">
                  <span className="text-[11px] text-white/40">
                    Hosted by <strong className="text-white/70 font-semibold">{b.hostName}</strong>
                  </span>
                  <button
                    onClick={() => handleBattleClick(b)}
                    className="inline-flex scroll-mb-56 items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-600 to-cyan-500 px-5 py-2.5 text-xs font-black uppercase text-white shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:scale-[1.03] transition-all duration-300"
                  >
                    <Play className="h-3.5 w-3.5 fill-current text-white animate-pulse" /> Enter
                    Battle Stage
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      );
    }

    if (filter === "Upcoming") {
      const upcoming = MOCK_BATTLES.filter((b) => b.status === "upcoming");
      return (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {upcoming.map((b) => (
            <GlassCard
              key={b.id}
              className="group overflow-hidden bg-gradient-to-br from-[#0F1424]/90 to-[#05060E]/95 border-[0.5px] border-white/10 hover:border-cyan-500/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(6,182,212,0.15)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-3xl"
            >
              {/* Ambient electric blue glow inside card */}
              <div className="absolute top-0 right-0 h-32 w-32 bg-cyan-500/10 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              <div className="p-7 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3.5 py-1 text-[10px] font-black text-cyan-400 uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                    <Calendar className="h-3.5 w-3.5 animate-bounce" /> UPCOMING
                  </span>
                  <span className="text-xs font-extrabold text-white/50 tracking-wider uppercase">
                    {b.scheduleDate}
                  </span>
                </div>

                <h3 className="mt-5 text-2xl font-black text-white tracking-tight leading-tight group-hover:text-cyan-300 transition-colors">
                  {b.title}
                </h3>
                <p className="text-xs font-semibold text-cyan-400/90 mt-1.5 uppercase tracking-wider">
                  {b.type}
                </p>

                {/* Artists layout */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 bg-black/30 border border-white/5 p-3.5 rounded-2xl hover:border-white/10 transition-colors">
                    <img
                      src={b.artistA.avatar}
                      alt=""
                      className="h-10 w-10 rounded-xl object-cover border border-white/10"
                    />
                    <span className="text-xs font-black text-white truncate">{b.artistA.name}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-black/30 border border-white/5 p-3.5 rounded-2xl hover:border-white/10 transition-colors">
                    <img
                      src={b.artistB.avatar}
                      alt=""
                      className="h-10 w-10 rounded-xl object-cover border border-white/10"
                    />
                    <span className="text-xs font-black text-white truncate">{b.artistB.name}</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="text-[11px] text-white/40 flex items-center gap-1">
                    Prize:{" "}
                    <strong className="text-yellow-400 font-extrabold flex items-center gap-1 ml-1">
                      <Trophy className="h-3.5 w-3.5" />
                      {b.prize}
                    </strong>
                  </span>
                  <button
                    onClick={() => handleBattleClick(b)}
                    className="scroll-mb-56 text-xs font-black uppercase text-white hover:text-cyan-300 hover:border-cyan-500/50 transition-all flex items-center gap-1.5 bg-white/5 border border-white/10 px-4.5 py-2.5 rounded-full shadow-premium"
                  >
                    View Setup <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      );
    }

    if (filter === "Replays") {
      return (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {MOCK_REPLAYS.map((r) => (
            <GlassCard
              key={r.id}
              className="group overflow-hidden bg-gradient-to-br from-[#120F1F]/90 to-[#06040A]/95 border-[0.5px] border-white/10 hover:border-purple-500/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] rounded-3xl"
            >
              <div className="flex flex-col sm:flex-row">
                <div className="relative w-full sm:w-1/3 h-36 sm:h-auto overflow-hidden">
                  <img
                    src={r.artwork}
                    alt=""
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-500 text-white shadow-premium border border-white/20 transform group-hover:scale-110 transition-transform duration-300">
                      <Play className="h-4 w-4 fill-current ml-0.5 text-white" />
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between relative z-10">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 border border-purple-500/25 px-2.5 py-0.5 text-[9px] font-black tracking-widest text-purple-400 uppercase">
                        REPLAY
                      </span>
                      <span className="text-[10px] font-bold text-white/40">{r.playedAt}</span>
                    </div>
                    <h3 className="mt-3 text-base font-black text-white leading-snug group-hover:text-purple-300 transition-colors">
                      {r.title}
                    </h3>

                    <div className="mt-3.5 flex flex-wrap gap-2 text-[10px] text-white/50 font-semibold uppercase tracking-wider">
                      <span>{(r.totalVotes / 1000).toFixed(0)}K votes cast</span>
                      <span className="text-white/20">/</span>
                      <span>{(r.peakListeners / 1000).toFixed(1)}K listeners</span>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-current animate-pulse text-emerald-400" />{" "}
                      Winner: {r.winnerName}
                    </span>
                    <button
                      onClick={() => handleReplayClick(r)}
                      className="scroll-mb-56 text-xs font-black uppercase text-white hover:text-purple-300 flex items-center gap-1 transition-colors"
                    >
                      Watch <ChevronRight className="h-3.5 w-3.5 text-purple-400" />
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      );
    }

    // Concept tabs (My Battles & Following)
    return (
      <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/[0.01] backdrop-blur-sm">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-white/40 border border-white/5 mb-4 shadow-inner">
          <Users className="h-6 w-6 text-purple-400/80 animate-pulse" />
        </div>
        <h3 className="text-base font-black text-white tracking-wide">No active listings here</h3>
        <p className="mt-2 text-xs text-white/40 max-w-sm mx-auto leading-relaxed">
          {filter === "My Battles"
            ? "You haven't hosted or participated in any Song Wars yet. Trigger 'Create Battle' to host your first cinematic music showdown!"
            : "No sessions from artists you follow are scheduled or live right now. Make sure to subscribe on artist stations."}
        </p>
        <div className="mt-8">
          <SecondaryButton
            onClick={() => can(identity, "access-studio") && onNavigate({ view: "setup" })}
            className="py-2.5 px-5 text-xs font-black uppercase tracking-wider border-white/10"
          >
            <Plus className="h-4 w-4 text-purple-400" />{" "}
            {can(identity, "access-studio") ? "Setup Custom Battle" : "Creator Access Required"}
          </SecondaryButton>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-6 lg:space-y-10">
      <TopBar showBack onBack={onBack} title="Song Wars PvP" />

      <div className="px-4 sm:px-6 lg:px-10 space-y-8 max-w-7xl mx-auto">
        {/* Local mock role switcher for Song Wars QA */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-black/60 border-[0.5px] border-white/10 p-4 rounded-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_15px_30px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div>
              <span className="block text-[10px] font-black tracking-widest text-emerald-400 uppercase">
                Mock Role View
              </span>
              <span className="hidden sm:block text-[10px] font-semibold text-white/35">
                Local-only permission preview
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 bg-black/40 border border-white/5 p-1 rounded-full">
            {roleOptions.map((r) => (
              <button
                key={r}
                onClick={() => onRoleChange(r)}
                className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                  role === r
                    ? "bg-gradient-to-r from-fuchsia-500 via-purple-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(176,38,255,0.4)]"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                {r === "dj" ? "DJ / HOST" : r}
              </button>
            ))}
          </div>
        </div>

        <PrescriptionRail
          title="Prescribe matchups"
          subtitle="Mock Song Wars prescriptions can later suggest matchups, battle songs, and fanbase-overlap rooms."
        />

        {/* Hero Header */}
        <div className="relative rounded-[2.5rem] border-[0.5px] border-white/10 bg-gradient-to-br from-[#180A2D]/55 via-[#070514]/75 to-[#05050A]/95 p-8 md:p-14 overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)]">
          {/* Dynamic double-layer glow */}
          <div className="absolute top-0 right-0 h-80 w-80 bg-fuchsia-600/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 h-60 w-60 bg-cyan-600/10 blur-[100px] rounded-full pointer-events-none" />

          {/* Cinematic Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.007)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.007)_1px,transparent_1px)] bg-[size:30px_30px] opacity-40 pointer-events-none" />

          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 border border-purple-500/20 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <Flame className="h-4 w-4 animate-pulse text-fuchsia-400" /> Live PvP Showdowns
            </div>

            <h1 className="mt-5 text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
              Song{" "}
              <span className="bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Wars
              </span>
            </h1>
            <p className="mt-4 text-sm md:text-base text-white/60 leading-relaxed font-medium">
              Artist vs Artist. Song for song. Fans decide in real time. Live music battles with
              dynamic equalizers and interactive reaction clashing.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <PrimaryButton
                onClick={() => can(identity, "access-studio") && onNavigate({ view: "setup" })}
                className="py-3 px-6 text-xs font-black uppercase tracking-wider shadow-lg"
              >
                <Plus className="h-4 w-4 text-white" />{" "}
                {can(identity, "access-studio")
                  ? "Create Custom Battle"
                  : "Creator Access Required"}
              </PrimaryButton>
              <SecondaryButton
                onClick={() => onNavigate({ view: "stage", battleId: "battle-1" })}
                className="py-3 px-6 text-xs font-black uppercase tracking-wider border-white/10 hover:border-white/20"
              >
                <Play className="h-4 w-4 fill-current text-fuchsia-400" /> Enter Live Stage
              </SecondaryButton>
            </div>
          </div>
        </div>

        {/* Battle categories */}
        <div>
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-fuchsia-400" /> Battle Genres & Categories
            </h2>
            <span className="text-xs text-white/40 uppercase font-black tracking-wider">
              PvP Configurations
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {SONG_WAR_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.title;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSelected ? null : cat.title)}
                  className={`flex flex-col justify-between items-start rounded-2xl border text-left p-5 transition-all duration-300 h-32 relative overflow-hidden group ${
                    isSelected
                      ? "border-fuchsia-500 bg-fuchsia-500/15 shadow-[0_0_25px_rgba(217,70,239,0.3)] scale-[1.04]"
                      : "border-white/5 bg-gradient-to-br from-white/[0.05] to-white/[0.01] hover:border-white/20 hover:bg-white/[0.08] hover:scale-[1.02]"
                  }`}
                >
                  <div
                    className={`rounded-xl bg-white/5 p-2.5 border border-white/5 text-purple-300 transition-all duration-300 ${isSelected ? "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30 shadow-[0_0_10px_rgba(217,70,239,0.3)]" : "group-hover:bg-purple-500/10"}`}
                  >
                    {cat.icon === "Radio" && <Radio className="h-4 w-4" />}
                    {cat.icon === "Sparkles" && <Sparkles className="h-4 w-4" />}
                    {cat.icon === "BarChart3" && <BarChart3 className="h-4 w-4" />}
                    {cat.icon === "Users" && <Users className="h-4 w-4" />}
                    {cat.icon === "UploadCloud" && <Sparkles className="h-4 w-4" />}
                    {cat.icon === "Heart" && <Flame className="h-4 w-4" />}
                  </div>
                  <div className="w-full">
                    <div className="text-xs font-black text-white truncate max-w-full group-hover:text-fuchsia-300 transition-colors">
                      {cat.title}
                    </div>
                    <div className="text-[10px] font-bold text-white/40 mt-1 uppercase tracking-wider">
                      {cat.count} battles
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Filter Tabs */}
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
            {filters.map((tabKey) => (
              <button
                key={tabKey}
                onClick={() => setFilter(tabKey)}
                className={`rounded-full px-6 py-3 text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                  filter === tabKey
                    ? "bg-gradient-to-r from-fuchsia-500 via-purple-600 to-cyan-500 text-white shadow-[0_5px_15px_rgba(176,38,255,0.3)] border-[0.5px] border-white/20"
                    : "text-white/40 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                {tabKey}
              </button>
            ))}
          </div>

          {/* Rendered active list based on filters */}
          <div className="pb-16">{renderList()}</div>
        </div>
      </div>
    </div>
  );
};

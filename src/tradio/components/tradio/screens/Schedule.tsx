import React, { useState } from "react";
import {
  BellPlus,
  CalendarDays,
  Megaphone,
  Mic2,
  Play,
  Radio,
  RotateCcw,
  Sparkles,
  Users,
} from "lucide-react";
import {
  TopBar,
  GlassCard,
  PrimaryButton,
  SecondaryButton,
  Chip,
  Waveform,
  PlayCircle,
} from "../ui";
import { SCHEDULE, TRACKS } from "../data";
import { usePlayer } from "@/tradio/contexts/PlayerContext";
import { scheduleToPlaybackItem, scheduleToPlaybackSource } from "../playbackAdapters";

const FILTERS = [
  "All",
  "Live Now",
  "Premieres",
  "DJ Shows",
  "Beat Spotlights",
  "Fan Hours",
  "Replays",
];

const typeIcon = {
  premiere: Sparkles,
  "dj-show": Mic2,
  "producer-spotlight": Radio,
  "fan-request": Users,
  replay: RotateCcw,
  sponsored: Megaphone,
  live: Radio,
  block: CalendarDays,
};

export const ScheduleScreen: React.FC<{
  onOpenSongWars?: (dest: {
    view: "hub" | "setup" | "stage" | "results" | "replay";
    battleId?: string;
  }) => void;
  onOpenBroadcastStudio?: (initialTab?: string) => void;
}> = ({ onOpenSongWars, onOpenBroadcastStudio }) => {
  const [filter, setFilter] = useState("All");
  const { playQueue, playItem } = usePlayer();
  const liveItem = SCHEDULE.find((item) => item.status === "live") || SCHEDULE[0];
  const filteredSchedule = SCHEDULE.filter((item) => {
    if (filter === "All") return true;
    if (filter === "Live Now") return item.status === "live";
    if (filter === "Premieres") return item.type === "premiere";
    if (filter === "DJ Shows") return item.type === "dj-show";
    if (filter === "Beat Spotlights") return item.type === "producer-spotlight";
    if (filter === "Fan Hours") return item.type === "fan-request";
    if (filter === "Replays") return item.type === "replay";
    return true;
  });

  return (
    <div className="space-y-8 pb-4 lg:space-y-10">
      <TopBar title="Live Schedule" />

      <div className="px-4 sm:px-6 lg:px-10">
        <GlassCard glow className="overflow-hidden">
          <div className="relative">
            <img
              src={liveItem.image}
              className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-80"
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
            <div className="relative p-5 sm:p-6">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-fuchsia-400/40 bg-fuchsia-500/15 px-2.5 py-1 text-[10px] font-bold text-fuchsia-200">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-fuchsia-400" /> LIVE NOW
              </span>
              <div className="mt-4 max-w-xl">
                <div className="text-3xl font-black tracking-tight text-white">
                  {liveItem.title}
                </div>
                <div className="mt-1 text-sm text-white/60">
                  {liveItem.station} - {liveItem.startTime} to {liveItem.endTime}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/70">{liveItem.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Chip label={liveItem.type.replace(/-/g, " ")} selected />
                  <Chip label={`${(liveItem.listeners || 0).toLocaleString()} listening`} />
                  <Chip label="reminders active" />
                </div>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {liveItem.id === "sch-songwars" && onOpenSongWars ? (
                  <PrimaryButton
                    onClick={() => onOpenSongWars({ view: "stage", battleId: "battle-1" })}
                  >
                    <Radio className="h-4 w-4" /> Enter Song Wars Live Battle
                  </PrimaryButton>
                ) : (
                  <PrimaryButton
                    onClick={() =>
                      playItem(scheduleToPlaybackItem(liveItem), {
                        source: scheduleToPlaybackSource(liveItem),
                        isLive: liveItem.status === "live",
                      })
                    }
                  >
                    <Play className="h-4 w-4 fill-white" /> Listen Live
                  </PrimaryButton>
                )}
                <SecondaryButton>
                  <BellPlus className="h-4 w-4" /> Remind Me
                </SecondaryButton>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="px-4 sm:px-6 lg:px-10 grid grid-cols-2 gap-3 animate-fade-in">
        <SecondaryButton
          onClick={() => onOpenBroadcastStudio?.("builder")}
          className="py-2.5 text-xs font-bold"
        >
          <CalendarDays className="h-3.5 w-3.5 text-purple-300" /> Create Scheduled Broadcast
        </SecondaryButton>
        <SecondaryButton
          onClick={() => onOpenBroadcastStudio?.("builder")}
          className="py-2.5 text-xs font-bold"
        >
          <Sparkles className="h-3.5 w-3.5 text-cyan-300" /> Plan New Show
        </SecondaryButton>
      </div>

      <div className="flex gap-2 overflow-x-auto px-4 sm:px-6 lg:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTERS.map((item) => (
          <Chip
            key={item}
            label={item}
            selected={filter === item}
            onClick={() => setFilter(item)}
          />
        ))}
      </div>

      <div className="px-4 sm:px-6 lg:px-10">
        <div className="relative">
          <div className="absolute bottom-4 left-[58px] top-4 w-px bg-white/10" />
          <div className="space-y-3">
            {filteredSchedule.map((item) => {
              const Icon = typeIcon[item.type];
              const isLive = item.status === "live";
              return (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="w-12 shrink-0 pt-4 text-right text-[11px] text-white/55">
                    <div>{item.startTime}</div>
                    <div>{item.endTime}</div>
                  </div>
                  <div className="relative pt-5">
                    <span
                      className={`block h-3 w-3 rounded-full border-2 ${isLive ? "border-fuchsia-400 bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.8)]" : "border-white/30 bg-[#0A0A0F]"}`}
                    />
                  </div>
                  <GlassCard
                    className={`flex-1 p-3 ${isLive ? "border-purple-400/40 shadow-[0_0_25px_-10px_rgba(176,38,255,0.6)]" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <img
                          src={item.image}
                          className="h-16 w-16 rounded-2xl object-cover"
                          alt=""
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${isLive ? "bg-fuchsia-500/15 text-fuchsia-300" : item.status === "replay" ? "bg-cyan-500/15 text-cyan-300" : "bg-white/[0.06] text-white/55"}`}
                          >
                            <Icon className="h-3 w-3" /> {item.status || "upcoming"}
                          </span>
                          <span className="text-[10px] text-white/45">
                            {item.type.replace(/-/g, " ")}
                          </span>
                        </div>
                        <div className="mt-1 text-sm font-semibold text-white">{item.title}</div>
                        <div className="text-[11px] text-white/55">
                          {item.artist || item.station}
                        </div>
                        <p className="mt-1 text-[11px] leading-relaxed text-white/65">
                          {item.description}
                        </p>
                      </div>
                      <div className="hidden text-right sm:block">
                        <div className="text-xs font-bold text-white">
                          {item.listeners ? item.listeners.toLocaleString() : "TBD"}
                        </div>
                        <div className="text-[10px] text-white/45">audience</div>
                      </div>
                      {isLive ? (
                        <Waveform className="h-6 w-8" bars={8} />
                      ) : (
                        <BellPlus className="h-5 w-5 text-purple-300" />
                      )}
                      {item.id === "sch-songwars" && onOpenSongWars ? (
                        <button
                          onClick={() =>
                            onOpenSongWars({
                              view: item.status === "live" ? "stage" : "hub",
                              battleId: "battle-1",
                            })
                          }
                          className="hidden rounded-full border border-fuchsia-400/35 bg-fuchsia-500/15 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-fuchsia-100 transition hover:bg-fuchsia-500/25 sm:inline-flex"
                        >
                          Open Song Wars
                        </button>
                      ) : (
                        <PlayCircle
                          size={36}
                          onClick={() =>
                            playQueue(
                              [scheduleToPlaybackItem(item), TRACKS.aiRadio, TRACKS.midnightVelvet],
                              0,
                              scheduleToPlaybackSource(item),
                            )
                          }
                        />
                      )}
                    </div>
                    {item.id === "sch-songwars" && onOpenSongWars && (
                      <button
                        onClick={() =>
                          onOpenSongWars({
                            view: item.status === "live" ? "stage" : "hub",
                            battleId: "battle-1",
                          })
                        }
                        className="mt-3 w-full rounded-2xl border border-fuchsia-400/30 bg-gradient-to-r from-fuchsia-500/20 to-cyan-500/15 px-3 py-2 text-xs font-black uppercase tracking-wider text-white sm:hidden"
                      >
                        Enter Song Wars Live Battle
                      </button>
                    )}
                  </GlassCard>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleScreen;

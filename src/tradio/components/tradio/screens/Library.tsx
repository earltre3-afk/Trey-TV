import React from "react";
import {
  Heart,
  Download,
  ListMusic,
  Users,
  Clock,
  ChevronRight,
  Shuffle,
  Sparkles,
  MoreHorizontal,
  Pin,
} from "lucide-react";
import { TopBar, GlassCard, PrimaryButton, PlayCircle, SectionHeader, Waveform } from "../ui";
import { IMG, COLLECTIONS, TRACKS } from "../data";
import { usePlayer } from "@/tradio/contexts/PlayerContext";
import { TradioImage } from "../NoCoverVisualizer";
import { PrescriptionRail } from "../auth/components";

const TILES = [
  {
    icon: <Heart className="h-6 w-6 text-purple-300" />,
    title: "Saved Stations",
    sub: "24 stations",
  },
  { icon: <Heart className="h-6 w-6 text-pink-400" />, title: "Liked Songs", sub: "312 songs" },
  { icon: <Download className="h-6 w-6 text-purple-300" />, title: "Downloads", sub: "89 songs" },
  {
    icon: <ListMusic className="h-6 w-6 text-purple-300" />,
    title: "Playlists",
    sub: "18 playlists",
  },
  { icon: <Users className="h-6 w-6 text-cyan-300" />, title: "Artists", sub: "128 followed" },
  {
    icon: <Clock className="h-6 w-6 text-purple-300" />,
    title: "Recently Played",
    sub: "50 tracks",
  },
];

export const LibraryScreen: React.FC = () => {
  const { playQueue, liked } = usePlayer();

  const shufflePinned = () => {
    const all = [
      TRACKS.midnightVelvet,
      TRACKS.fallingForYou,
      TRACKS.cityLights,
      TRACKS.afterHours,
      TRACKS.outOfOrbit,
      TRACKS.sixAmThoughts,
    ];
    // Fisher-Yates
    const arr = [...all];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    playQueue(arr);
  };

  return (
    <div className="space-y-8 pb-4 lg:space-y-10">
      <TopBar />
      <div className="px-4 sm:px-6 lg:px-10">
        <h1 className="text-3xl font-bold tracking-tight text-white">Library</h1>
        <p className="mt-1 text-sm text-white/60">Your music. Your vibe. Always yours.</p>
      </div>

      {/* Tiles */}
      <div className="grid grid-cols-2 gap-3 px-4 sm:px-6 lg:px-10">
        {TILES.map((t) => {
          const isLiked = t.title === "Liked Songs";
          const sub = isLiked ? `${312 + liked.size} songs` : t.sub;
          return (
            <GlassCard key={t.title} className="flex items-center gap-3 p-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                {t.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-white">{t.title}</div>
                <div className="truncate text-[11px] text-white/55">{sub}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-white/40" />
            </GlassCard>
          );
        })}
      </div>

      <div className="px-4 sm:px-6 lg:px-10">
        <PrescriptionRail
          title="Rediscover My Sound"
          subtitle="Prescribe from my library using saves, skips, station habits, and listening journeys."
        />
      </div>

      {/* Pinned collection */}
      <div className="px-4 sm:px-6 lg:px-10">
        <GlassCard glow className="overflow-hidden p-3">
          <div className="flex gap-3">
            <img src={IMG.aiSphere} alt="" className="h-32 w-32 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-bold text-white">My Frequency</div>
                  <div className="flex items-center gap-1 text-[11px] text-purple-300">
                    <Pin className="h-3 w-3" /> Pinned Collection
                  </div>
                </div>
                <button className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <MoreHorizontal className="h-4 w-4 text-white/70" />
                </button>
              </div>
              <p className="mt-2 text-xs leading-snug text-white/70">
                Your sonic fingerprint. A collection that evolves with you.
              </p>
              <PrimaryButton onClick={shufflePinned} className="mt-3 py-2 text-xs">
                <Shuffle className="h-3.5 w-3.5" /> Shuffle Play
              </PrimaryButton>
            </div>
          </div>
          <Waveform className="mt-3 h-6 w-full" bars={48} color="from-fuchsia-400 to-purple-500" />
        </GlassCard>
      </div>

      {/* Collections */}
      <div>
        <SectionHeader title="Your Collections" onSeeAll={() => {}} />
        <div className="space-y-2 px-4 sm:px-6 lg:px-10">
          {COLLECTIONS.map((c) => (
            <GlassCard key={c.title} className="flex items-center gap-3 p-2.5">
              <TradioImage
                src={c.img}
                title={c.title}
                artist={c.sub}
                isPlaying={false}
                fallbackSize="mini"
                className="h-12 w-12 rounded-lg object-cover"
                imgClassName="h-12 w-12 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-white">{c.title}</div>
                <div className="truncate text-[11px] text-white/55">{c.sub}</div>
              </div>
              <PlayCircle size={34} onClick={() => playQueue(c.tracks)} />
              <button className="flex h-8 w-8 items-center justify-center rounded-full text-white/50">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* AI banner */}
      <div className="px-4 sm:px-6 lg:px-10">
        <GlassCard className="flex items-center gap-3 p-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-purple-400/40 bg-purple-500/10">
            <Sparkles className="h-5 w-5 text-purple-300" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-white">Let AI organize your library</div>
            <div className="text-[11px] text-white/55">
              Smart albums, mood sets, and more. All personalized for you.
            </div>
          </div>
          <PrimaryButton className="px-3 py-2 text-xs">
            <Sparkles className="h-3.5 w-3.5" /> Try AI
          </PrimaryButton>
        </GlassCard>
      </div>
    </div>
  );
};

export default LibraryScreen;

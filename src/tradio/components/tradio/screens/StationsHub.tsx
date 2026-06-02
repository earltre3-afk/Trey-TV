import React from 'react';
import { CalendarDays, MessageCircle, Plus, Radio, Sparkles, Users } from 'lucide-react';
import { TopBar, GlassCard, PrimaryButton, SecondaryButton, Chip, StationCard, Waveform } from '../ui';
import { ALL_STATIONS } from '../data';
import { PrescriptionRail } from '../auth/components';

export type StationsDestination = 'build' | 'artist' | 'schedule' | 'community' | 'songwars';

const stationLaunch: {
  key: StationsDestination;
  title: string;
  sub: string;
  Icon: React.FC<{ className?: string }>;
}[] = [
  { key: 'build', title: 'Build Station', sub: 'Generate a mood, catalog, or creator-led radio lane.', Icon: Sparkles },
  { key: 'artist', title: 'Artist Stations', sub: 'Explore artist-owned channels and official rotations.', Icon: Radio },
  { key: 'schedule', title: 'Live Schedule', sub: 'Premieres, DJ shows, beat spotlights, and replays.', Icon: CalendarDays },
  { key: 'community', title: 'Station Community', sub: 'Requests, votes, chat, badges, and fan moments.', Icon: MessageCircle },
];

export const StationsHub: React.FC<{
  onOpen: (destination: StationsDestination) => void;
  onOpenBroadcastStudio?: (initialTab?: string) => void;
}> = ({ onOpen, onOpenBroadcastStudio }) => (
  <div className="space-y-8 pb-4 lg:space-y-10">
    <TopBar title="Stations" />

    <div className="px-4 sm:px-6 lg:px-10">
      <GlassCard glow className="overflow-hidden">
        <div className="relative p-5 sm:p-6">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500/10 via-fuchsia-500/5 to-cyan-500/10" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Chip label="Music Network Guide" selected icon={<Radio className="h-3.5 w-3.5" />} />
              <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">Stations are alive now</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">
                Build AI stations, enter artist-owned channels, follow live programming, and participate with the fan community.
              </p>
              {onOpenBroadcastStudio && (
                <SecondaryButton onClick={() => onOpenBroadcastStudio('builder')} className="mt-4 text-xs font-bold bg-purple-500/10 border-purple-500/25 hover:bg-purple-500/20">
                  <Radio className="h-3.5 w-3.5 text-purple-300 animate-pulse" /> Start A Radio Experience
                </SecondaryButton>
              )}
            </div>
            <div className="flex items-center gap-2 rounded-3xl border border-white/8 bg-black/20 p-4">
              <Waveform className="h-10 w-20" bars={18} />
              <div>
                <div className="text-2xl font-black text-white">18.4K</div>
                <div className="text-xs text-white/50">currently listening</div>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>

    <div className="grid gap-3 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-10">
      {stationLaunch.map(({ key, title, sub, Icon }) => (
        <button key={key} onClick={() => onOpen(key)} className="group text-left">
          <GlassCard className="h-full p-4 group-hover:border-purple-300/30 group-hover:bg-purple-500/[0.04]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-400/25 bg-purple-500/10">
              <Icon className="h-5 w-5 text-purple-200" />
            </div>
            <div className="mt-4 text-base font-bold text-white">{title}</div>
            <p className="mt-2 text-sm leading-relaxed text-white/60">{sub}</p>
          </GlassCard>
        </button>
      ))}
    </div>

    <div className="px-4 sm:px-6 lg:px-10">
      <PrescriptionRail
        title="Prescribe Me a Station"
        subtitle="Build a station from your mood, follows, station saves, and live listening habits."
      />
    </div>

    {/* Song Wars Battles Section */}
    <div className="px-4 sm:px-6 lg:px-10">
      <div className="mb-4">
        <div className="text-lg font-bold text-white">Song Wars Battles</div>
        <div className="text-xs text-white/50">Cinematic head-to-head battles and live radio voting events</div>
      </div>
      <GlassCard className="p-5 bg-gradient-to-r from-purple-950/20 via-[#0B0714] to-cyan-950/20 border-purple-500/15">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-500/15 border border-fuchsia-500/25 text-fuchsia-300">
              <Sparkles className="h-5 w-5 animate-spin" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">PVP Song Wars Hub</div>
              <div className="text-xs text-white/60">Watch Trey Trizzy, Kiana Lane and other creators clash going song-for-song.</div>
            </div>
          </div>
          <button
            onClick={() => onOpen('songwars')}
            className="rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 px-5 py-2.5 text-xs font-bold text-white hover:brightness-125 transition-all whitespace-nowrap shadow-[0_0_20px_rgba(176,38,255,0.4)]"
          >
            Enter Battle Arena
          </button>
        </div>
      </GlassCard>
    </div>

    <div>
      <div className="mb-3 flex items-center justify-between px-4 sm:px-6 lg:px-10">
        <div>
          <div className="text-lg font-bold text-white">Artist Stations</div>
          <div className="text-xs text-white/50">Official channels, premieres, and fan-led requests</div>
        </div>
        <SecondaryButton className="px-3 py-2 text-xs" onClick={() => onOpen('build')}><Plus className="h-3.5 w-3.5" /> Build</SecondaryButton>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-1 sm:px-6 lg:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ALL_STATIONS.map((station) => (
          <StationCard
            key={station.id}
            title={station.title}
            genre={station.genre}
            image={station.image}
            isPlaying={station.isLive}
            onClick={() => onOpen('artist')}
          />
        ))}
      </div>
    </div>

    <div className="grid gap-3 px-4 sm:px-6 lg:grid-cols-3 lg:px-10">
      {[
        ['Live premieres', '4', 'Artist drops and first-listen rooms'],
        ['Fan requests', '128', 'Queued across active stations'],
        ['Community votes', '2.7K', 'What plays next and poll moments'],
      ].map(([title, value, sub]) => (
        <GlassCard key={title} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-white/50">{title}</div>
              <div className="mt-1 text-2xl font-black text-white">{value}</div>
              <div className="mt-1 text-[11px] text-cyan-300">{sub}</div>
            </div>
            <Users className="h-5 w-5 text-purple-300" />
          </div>
        </GlassCard>
      ))}
    </div>

    <div className="px-4 sm:px-6 lg:px-10">
      <PrimaryButton className="w-full py-4" onClick={() => onOpen('schedule')}>
        <CalendarDays className="h-4 w-4" /> Open Live Schedule
      </PrimaryButton>
    </div>
  </div>
);

export default StationsHub;

import React, { useState } from 'react';
import { Users, ChevronRight, Swords, Music, Radio, Tv, Disc3, Rocket } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import TradioHeader from '../TradioHeader';
import TradioAIBall from '../TradioAIBall';
import HeroCard from '../HeroCard';
import SectionHeader from '../SectionHeader';
import PlaylistCard from '../PlaylistCard';
import StationCard from '../StationCard';
import { FEATURED_PLAYLISTS, LIVE_RADIO, COMMUNITY_NOW_PLAYING, SONG_WARS } from '../../../data/mockData';

interface Props {
  onPlaySpotlight: () => void;
  onOpenPlaylist: () => void;
  onBrowse: () => void;
  onPrescribe: () => void;
  onCommunity: () => void;
  onSongWars: () => void;
  onShowBuilder?: () => void;
  onSongReview?: () => void;
  onBroadcast?: () => void;
  onRelease?: () => void;
}

export default function HomeScreen({
  onPlaySpotlight,
  onOpenPlaylist,
  onBrowse,
  onPrescribe,
  onCommunity,
  onSongWars,
  onShowBuilder,
  onSongReview,
  onBroadcast,
  onRelease,
}: Props) {
  const [tab, setTab] = useState('Home');
  const activeWars = SONG_WARS.filter((w) => w.status === 'active').length;

  return (
    <>
      <TradioHeader
        tabs={['Home', 'Browse']}
        activeTab={tab}
        onTabChange={(t) => {
          setTab(t);
          if (t === 'Browse') onBrowse();
        }}
      />
      <div className="flex-1 min-h-0 overflow-y-auto pb-4 space-y-6 pt-1">
        <HeroCard onPlay={onPlaySpotlight} />

        <StudioShortcutRail
          onShowBuilder={onShowBuilder}
          onSongReview={onSongReview}
          onBroadcast={onBroadcast}
          onRelease={onRelease}
        />

        <LiveSignalStrip
          activeWars={activeWars}
          onSongWars={onSongWars}
          onPrescribe={onPrescribe}
        />

        <div>
          <SectionHeader title="Featured Playlists" onSeeAll={onBrowse} />
          <div className="flex gap-4 overflow-x-auto px-5 pb-1 no-scrollbar">
            {FEATURED_PLAYLISTS.map((p) => (
              <PlaylistCard key={p.id} {...p} onClick={onOpenPlaylist} />
            ))}
          </div>
        </div>

        <div>
          <SectionHeader title="Live Radio" onSeeAll={() => {}} />
          <div className="flex gap-4 overflow-x-auto px-5 pb-1 no-scrollbar">
            {LIVE_RADIO.map((r) => (
              <StationCard key={r.id} title={r.title} subtitle={r.subtitle} tone={r.tone} onClick={onPlaySpotlight} />
            ))}
          </div>
        </div>

        {/* Community teaser */}
        <div>
          <SectionHeader title="Community" onSeeAll={onCommunity} />
          <button
            onClick={onCommunity}
            className="mx-5 w-[calc(100%-2.5rem)] tradio-glass rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-white font-bold text-sm">See who's listening now</p>
              <p className="text-white/45 text-[12px] truncate">
                {COMMUNITY_NOW_PLAYING.length} friends in live rooms
              </p>
            </div>
            <div className="flex -space-x-2">
              {COMMUNITY_NOW_PLAYING.slice(0, 3).map((p) => (
                <img
                  key={p.id}
                  src={p.avatar}
                  alt={p.user}
                  className="w-8 h-8 rounded-full object-cover border-2 border-black"
                />
              ))}
            </div>
          </button>
        </div>
      </div>
    </>
  );
}

function StudioShortcutRail({
  onShowBuilder,
  onSongReview,
  onBroadcast,
  onRelease,
}: {
  onShowBuilder?: () => void;
  onSongReview?: () => void;
  onBroadcast?: () => void;
  onRelease?: () => void;
}) {
  const navigate = useNavigate();
  const actions = [
    {
      label: 'Music Studio',
      detail: 'Make a track',
      icon: Disc3,
      // Brighter tone so this reads as the primary entry into the full-screen DAW.
      tone: 'from-fuchsia-400/30 to-cyan-300/20',
      onClick: () => navigate({ to: '/tradio/studio' }),
    },
    {
      label: 'Release Music',
      detail: 'Drop / schedule',
      icon: Rocket,
      tone: 'from-amber-300/30 to-orange-400/15',
      onClick: onRelease,
    },
    {
      label: 'Show Builder',
      detail: 'AI rundown',
      icon: Radio,
      tone: 'from-violet-300/20 to-amber-300/10',
      onClick: onShowBuilder,
    },
    {
      label: 'Song Review',
      detail: 'A&R queue',
      icon: Music,
      tone: 'from-emerald-300/20 to-cyan-300/10',
      onClick: onSongReview,
    },
    {
      label: 'Broadcast',
      detail: 'Go live',
      icon: Tv,
      tone: 'from-cyan-300/20 to-fuchsia-300/10',
      onClick: onBroadcast,
    },
  ];

  return (
    <section className="px-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/38">Studio tools</p>
        <span className="text-[11px] font-bold text-amber-200/70">Creator ready</span>
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {actions.map(({ label, detail, icon: Icon, tone, onClick }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            className={`flex min-w-[10.5rem] items-center gap-3 rounded-2xl border border-white/[0.08] bg-gradient-to-br ${tone} px-3.5 py-3 text-left transition active:scale-[0.98]`}
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-black/35 text-white shadow-inner">
              <Icon className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-black text-white">{label}</span>
              <span className="block truncate text-[11px] font-semibold text-white/45">{detail}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function LiveSignalStrip({
  activeWars,
  onSongWars,
  onPrescribe,
}: {
  activeWars: number;
  onSongWars: () => void;
  onPrescribe: () => void;
}) {
  return (
    <section className="mx-5 overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-white/[0.035]">
      <button
        type="button"
        onClick={onSongWars}
        className="flex w-full items-center gap-3 border-b border-white/[0.06] px-4 py-3.5 text-left transition active:bg-white/[0.04]"
      >
        <span className="grid size-10 place-items-center rounded-xl bg-amber-300/12 text-amber-200">
          <Swords className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-black text-white">Song Wars is live</span>
          <span className="block truncate text-xs text-white/45">{activeWars} active arenas taking votes</span>
        </span>
        <span className="flex items-center gap-1 rounded-full bg-red-500 px-2 py-1 text-[9px] font-black text-white">
          <span className="size-1.5 rounded-full bg-white animate-pulse" />
          LIVE
        </span>
      </button>
      <button
        type="button"
        onClick={onPrescribe}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition active:bg-white/[0.04]"
      >
        <span className="relative grid size-10 place-items-center rounded-xl bg-cyan-300/10 text-cyan-100">
          <TradioAIBall size="sm" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-black text-white">Prescribe Me</span>
          <span className="block truncate text-xs text-white/45">Mood-to-music matching without leaving Tradio</span>
        </span>
        <ChevronRight className="size-4 text-white/30" />
      </button>
    </section>
  );
}

import React, { useState } from 'react';
import { ChevronRight, Swords } from 'lucide-react';
import TradioHeader from '../TradioHeader';
import SectionHeader from '../SectionHeader';
import { LIVE_FEATURED, LIVE_LIST, ALL_LIVE_STATIONS, CURATED_STREAMS } from '../../../data/mockData';

interface Props {
  onBrowse: () => void;
  onCommunity: () => void;
  onSongWars: () => void;
}

export default function LiveStationsScreen({ onBrowse, onCommunity, onSongWars }: Props) {


  const [tab, setTab] = useState('Home');

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
      <div className="flex-1 min-h-0 overflow-y-auto pb-4 space-y-7 pt-2">

        <div>
          <SectionHeader title="Live Stations" onSeeAll={() => {}} />
          <div className="px-4">
            <div className="rounded-3xl bg-gradient-to-br from-[#0a1020]/80 to-amber-900/20 border border-white/[0.07] p-3 flex gap-4">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-amber-500 via-yellow-600 to-cyan-500 flex items-center justify-center shrink-0 shadow-[0_0_30px_-6px_rgba(245,158,11,0.6)]">

                <div className="w-12 h-12 rotate-45 bg-white/30 rounded-md backdrop-blur-sm" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/55 text-xs">{LIVE_FEATURED.label}</p>
                <h3 className="text-xl font-black text-white leading-tight mb-2">{LIVE_FEATURED.title}</h3>
                <div className="flex items-end gap-[2px] h-6 mb-3">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <span
                      key={i}
                      className="w-[2px] rounded-full bg-white/70"
                      style={{ height: `${4 + ((i * 7) % 22)}px` }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-600 text-white text-[11px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
                  </span>
                  <span className="text-white/60 text-xs">{LIVE_FEATURED.listeners}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 space-y-3">
          <button
            onClick={onSongWars}
            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-amber-700/30 to-black border border-amber-400/25 active:scale-[0.98] transition tradio-amber-glow"
          >
            <div className="w-9 h-9 rounded-xl bg-black/50 border border-cyan-400/30 flex items-center justify-center shrink-0">
              <Swords className="w-4 h-4 text-cyan-300" />
            </div>
            <div className="flex-1 text-left">
              <span className="text-white font-bold text-sm block">Song Wars Live</span>
              <span className="text-amber-200/70 text-[11px]">Vote in active music battles</span>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-300/70" />
          </button>
          <button
            onClick={onCommunity}
            className="w-full flex items-center gap-3 p-3 rounded-2xl tradio-active-pill active:scale-[0.98] transition"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-amber-200 font-bold text-sm flex-1 text-left">Open Community Rooms</span>
            <ChevronRight className="w-5 h-5 text-amber-300/70" />
          </button>
        </div>


        <div className="px-4 space-y-3">

          {LIVE_LIST.map((l) => (
            <button
              key={l.id}
              className="w-full flex items-center gap-4 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] active:bg-white/[0.06]"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${l.tone} flex items-center justify-center shrink-0`}>
                <span className="text-white font-bold text-xs">{l.title.split(' ')[1]?.[0] || l.title[0]}</span>
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-white font-semibold text-sm truncate">{l.title}</p>
                <p className="text-white/45 text-xs">{l.subtitle}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/30" />
            </button>
          ))}
        </div>

        <div>
          <SectionHeader title="All Live Stations" onSeeAll={() => {}} />
          <div className="flex gap-4 overflow-x-auto px-5 pb-1 no-scrollbar">
            {ALL_LIVE_STATIONS.map((s) => (
              <button key={s.id} className="w-28 shrink-0 text-left active:scale-[0.97] transition-transform">
                <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-white/[0.06]">
                  <img src={s.image} alt={s.name} className="w-full h-full object-cover object-top" />
                  <span className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-600 text-white text-[9px] font-bold">
                    <span className="w-1 h-1 rounded-full bg-white" /> LIVE
                  </span>
                </div>
                <p className="text-white font-semibold text-xs mt-1.5 truncate">{s.name}</p>
                <p className="text-white/45 text-[11px] truncate">{s.sub}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <SectionHeader title="Curated Artist Streams" onSeeAll={() => {}} />
          <div className="flex gap-4 overflow-x-auto px-5 pb-1 no-scrollbar">
            {CURATED_STREAMS.map((s) => (
              <button key={s.id} className="w-28 shrink-0 text-left active:scale-[0.97] transition-transform">
                <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-white/[0.06]">
                  <img src={s.image} alt={s.name} className="w-full h-full object-cover object-top" />
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white font-bold text-xs truncate">{s.name}</p>
                  </div>
                </div>
                <p className="text-white/45 text-[11px] truncate mt-1.5">{s.sub}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

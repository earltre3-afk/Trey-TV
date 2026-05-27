import React, { useMemo, useState } from 'react';
import { TVFrame } from '../components/TVFrame';
import { GlassPanel, FocusButton } from '../components/Primitives';
import { guideCategories, guideChannels, guideTimes, IMG } from '../mockData';
import { useFreeTvGuide } from '../data/useFreeTvGuide';
import { Play, Filter, Calendar } from 'lucide-react';
import { useTV } from '../TVContext';

export const GuideScreen: React.FC = () => {
  const [cat, setCat] = useState('All Channels');
  const [selected, setSelected] = useState({ ch: 1, prog: 1 }); // Late Night Gaming highlighted
  const { navigate } = useTV();
  const { channels, loading, error, source } = useFreeTvGuide({ fallbackChannels: guideChannels });
  const selectedChannelIndex = Math.min(selected.ch, Math.max(channels.length - 1, 0));
  const channel = channels[selectedChannelIndex];
  const selectedProgramIndex = Math.min(selected.prog, Math.max((channel?.programs.length ?? 1) - 1, 0));
  const program = channel?.programs[selectedProgramIndex];
  const todayLabel = useMemo(() => new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date()), []);
  const previewTags = program?.genres && program.genres.length > 0 ? program.genres.slice(0, 3) : ['Gaming', 'Live', 'Multiplayer'];
  const previewImage = program?.imageUrl || channel?.logoUrl || IMG(2);

  return (
    <TVFrame activeRail="Live TV">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h1 className="text-4xl font-black">TV Guide</h1>
          <div className="flex items-center gap-3 text-white/60 text-sm mt-1">
            <span>Live & On Demand</span>
            <span className={
              'px-2 py-0.5 rounded-full border text-[10px] font-black tracking-wider ' +
              (source === 'api'
                ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-300'
                : 'border-amber-400/50 bg-amber-400/10 text-amber-300')
            }>
              {loading ? 'CONNECTING' : source === 'api' ? 'FREE TV API' : 'SHELL FALLBACK'}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 max-w-[60%]">
          {guideCategories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={
                'px-4 py-2 rounded-full text-sm font-semibold border outline-none transition-all focus:scale-105 ' +
                (cat === c
                  ? 'border-fuchsia-400 bg-fuchsia-500/20 shadow-[0_0_18px_rgba(255,43,214,0.5)]'
                  : 'border-white/10 bg-white/5 text-white/70 focus:border-fuchsia-400')
              }
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <FocusButton variant="ghost" icon={<Filter className="w-4 h-4" />}>Filter</FocusButton>
          <FocusButton variant="ghost" icon={<Calendar className="w-4 h-4" />}>Today</FocusButton>
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-2 text-xs text-amber-200">
          Free TV provider is not available in this shell yet, so Trey TV is showing fallback guide data.
        </div>
      )}

      <div className="grid grid-cols-[1fr_360px] gap-4">
        <GlassPanel className="p-4 overflow-hidden">
          {/* Time row */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] items-center text-xs text-white/60 pb-3 border-b border-white/10 relative">
            <div>Today<br /><span className="text-white/40">{todayLabel}</span></div>
            {guideTimes.map((t, i) => (
              <div key={t} className={'text-center font-semibold ' + (i === 2 ? 'text-fuchsia-300' : '')}>
                {i === 2 && (
                  <div className="inline-block px-2 py-0.5 rounded-md bg-fuchsia-500 text-white">9:17 PM</div>
                )}
                {i !== 2 && t}
              </div>
            ))}
          </div>

          <div className="relative">
            {/* Current-time vertical line */}
            <div className="absolute top-0 bottom-0 left-[calc(80px+2*((100%-80px)/7)+((100%-80px)/14))] w-px bg-fuchsia-400 shadow-[0_0_8px_rgba(255,43,214,0.8)] pointer-events-none z-10" />

            {channels.map((ch, ci) => (
              <div key={ch.id} className="grid grid-cols-[80px_repeat(3,1fr)] gap-2 py-3 border-b border-white/5 items-center">
                <div className="flex flex-col items-center">
                  <div className="text-white/40 text-xs">{ch.num}</div>
                  <div className="px-2 py-1 rounded-md bg-gradient-to-br from-fuchsia-700/30 to-purple-800/30 border border-fuchsia-500/30 text-[10px] font-black tracking-wider text-center">
                    {ch.name}
                  </div>
                </div>
                {ch.programs.map((p, pi) => {
                  const isSel = selected.ch === ci && selected.prog === pi;
                  return (
                    <button
                      key={pi}
                      onClick={() => setSelected({ ch: ci, prog: pi })}
                      className={
                        'relative text-left px-3 py-3 rounded-xl border outline-none transition-all ' +
                        (isSel
                          ? 'border-fuchsia-400 bg-fuchsia-500/10 shadow-[0_0_22px_rgba(255,43,214,0.55)] scale-[1.02]'
                          : 'border-white/10 bg-white/[0.03] hover:border-white/20 focus:border-fuchsia-400')
                      }
                    >
                      <div className="flex items-center gap-2">
                        <Play className="w-3 h-3 text-fuchsia-300" />
                        <span className="font-bold text-sm truncate">{p.title}</span>
                        {p.live && (
                          <span className="ml-auto text-[9px] font-black bg-fuchsia-500 px-1.5 rounded">LIVE</span>
                        )}
                      </div>
                      <div className="text-[11px] text-white/55 mt-0.5">{p.time}</div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </GlassPanel>

        {/* Preview panel */}
        <GlassPanel className="overflow-hidden flex flex-col">
          <div className="relative h-[200px]">
            <img src={previewImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
            <span className="absolute top-3 left-3 text-[10px] font-black bg-fuchsia-500 px-2 py-0.5 rounded">LIVE</span>
          </div>
          <div className="p-5 flex flex-col gap-3 flex-1">
            <div>
              <div className="text-xs text-white/60">{program?.time || ''}</div>
              <div className="text-2xl font-black mt-1">{program?.title || 'Select a program'}</div>
              <div className="text-sm text-white/60">{channel?.name} · Ch. {channel?.num}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {previewTags.map((t) => (
                <span key={t} className="px-2 py-1 rounded-md text-[11px] font-semibold bg-white/5 border border-white/10">{t}</span>
              ))}
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              {program?.description || 'Join Trizzy and the squad for ranked matches, chill vibes, and fan interactions.'}
            </p>
            <div className="mt-auto flex flex-col gap-2">
              <FocusButton variant="primary" icon={<Play className="w-4 h-4 fill-white" />} onClick={() => navigate('player')}>
                Watch Now
              </FocusButton>
              <FocusButton variant="ghost">More Episodes</FocusButton>
            </div>
          </div>
        </GlassPanel>
      </div>
    </TVFrame>
  );
};

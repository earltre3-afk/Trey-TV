import React from 'react';
import { Play } from 'lucide-react';
import { IMAGES } from '../../data/mockData';
import NeonButton from './NeonButton';

export default function HeroCard({ onPlay }: { onPlay?: () => void }) {
  return (
    <div className="px-4">
      <div className="relative min-h-[390px] overflow-hidden rounded-[1.75rem] border border-white/[0.08] shadow-[0_28px_80px_-32px_rgba(245,158,11,0.8)]">
        <img src={IMAGES.treyHero} alt="Trey Trizzy" className="absolute inset-0 h-full w-full object-cover object-top" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_12%,rgba(0,0,0,0.52)_56%,#030407_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(251,191,36,0.28),transparent_24rem)]" />
        <div className="absolute left-5 right-5 top-5 flex items-center justify-between">
          <span className="rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-[10px] font-black tracking-[0.18em] text-amber-200 backdrop-blur-xl">
            TRADIO SIGNAL
          </span>
          <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1.5 text-[10px] font-black tracking-[0.18em] text-emerald-100">
            LIVE
          </span>
        </div>
        <div className="absolute bottom-6 left-5 right-5">
          <p className="mb-2 text-xs font-bold tracking-[0.2em]">
            <span className="text-amber-300">SPOTLIGHT</span>{' '}
            <span className="text-white/60">CURATED FOR TREY TV</span>
          </p>
          <h1 className="tradio-display mb-1 text-5xl font-black leading-none text-white">TREY TRIZZY</h1>
          <p className="mb-5 max-w-[18rem] text-sm leading-relaxed text-white/68">
            Premium artist radio, premiere drops, and late-night discovery in one stream.
          </p>
          <div className="flex items-center gap-3">
            <NeonButton onClick={onPlay} className="px-6 py-3 text-sm">
              <Play className="w-4 h-4" fill="currentColor" />
              Play Spotlight
            </NeonButton>
            <span className="text-xs font-bold text-white/45">42 min set</span>
          </div>
        </div>
        <div className="absolute bottom-3 right-5 flex items-center gap-1.5">
          <span className="w-5 h-1 rounded-full bg-amber-400" />
          <span className="w-1 h-1 rounded-full bg-white/30" />
          <span className="w-1 h-1 rounded-full bg-white/30" />
          <span className="w-1 h-1 rounded-full bg-white/30" />
        </div>
      </div>
    </div>
  );
}

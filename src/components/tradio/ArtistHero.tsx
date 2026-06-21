import React from 'react';
import { Play, ChevronLeft } from 'lucide-react';
import { IMAGES } from '../../data/mockData';
import NeonButton from './NeonButton';

interface ArtistHeroProps {
  following: boolean;
  onFollow: () => void;
  onStartRadio?: () => void;
}

export default function ArtistHero({ following, onFollow, onStartRadio }: ArtistHeroProps) {
  return (
    <div className="px-4">
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.06]">
        <img src={IMAGES.treyHero} alt="Trey Trizzy" className="w-full h-[380px] object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/20" />
        <button className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div className="absolute left-5 right-5 bottom-5">
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-widest text-amber-300 bg-white/[0.07] border border-amber-500/20 mb-2">

            ARTIST
          </span>
          <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-1">TREY TRIZZY</h1>
          <p className="text-white/65 text-sm mb-4">The sound. The story. The movement.</p>
          <div className="flex items-center gap-3">
            <NeonButton
              onClick={onFollow}
              variant={following ? 'glass' : 'gradient'}
              className="px-7 py-2.5 text-sm"
            >
              {following ? 'Following' : 'Follow'}
            </NeonButton>
            <NeonButton onClick={onStartRadio} variant="glass" className="px-6 py-2.5 text-sm">
              <Play className="w-4 h-4" fill="currentColor" />
              Start Radio
            </NeonButton>
          </div>
        </div>
      </div>
    </div>
  );
}

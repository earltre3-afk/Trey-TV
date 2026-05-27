import React from 'react';
import { TVFrame } from '../components/TVFrame';
import { FocusButton } from '../components/Primitives';
import { ContentRow } from '../components/Rows';
import { episodes, featured, IMG } from '../mockData';
import { Play, RotateCcw, Film, Plus } from 'lucide-react';
import { useTV } from '../TVContext';

export const DetailScreen: React.FC = () => {
  const { navigate } = useTV();
  return (
    <TVFrame activeRail="Home">
      <section className="relative -mx-8 -mt-2 h-[620px] overflow-hidden">
        <img src={IMG(0)} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05050A] via-transparent to-transparent" />

        <div className="relative px-12 pt-8 max-w-3xl">
          <div className="text-fuchsia-300 font-bold tracking-[0.3em] text-sm">TREY TRIZZY</div>
          <h1 className="text-7xl font-black mt-2 leading-none">
            <span className="text-white">LIFE OF A </span>
            <span className="block bg-gradient-to-r from-fuchsia-400 to-purple-500 bg-clip-text text-transparent italic">CREATOR</span>
          </h1>
          <div className="mt-3 text-lg tracking-[0.2em] font-bold text-white/80">REAL PASSION. REAL PROCESS. REAL IMPACT.</div>

          <div className="mt-6 flex items-center gap-3 text-sm text-white/80 flex-wrap">
            <span>2024</span>
            <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/20 font-bold">TV-MA</span>
            <span>Documentary Series</span>
            <span>· 1 Season</span>
            <span className="px-2 py-0.5 rounded-md bg-amber-400 text-black font-black">4K</span>
            <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/20 font-bold">Dolby Vision</span>
          </div>

          <p className="mt-5 text-base text-white/80 max-w-xl leading-relaxed">
            Go behind the scenes with Trey Trizzy as he builds his brand, creates his music, and inspires a generation. This is more than content — it's a lifestyle.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 max-w-md">
            <FocusButton variant="primary" icon={<Play className="w-5 h-5 fill-white" />} onClick={() => navigate('player')} autoFocus>
              <div className="flex flex-col items-start leading-tight">
                <span>Resume</span>
                <span className="w-full h-1 mt-1 bg-white/30 rounded-full overflow-hidden">
                  <span className="block h-full w-2/3 bg-white" />
                </span>
              </div>
            </FocusButton>
            <FocusButton variant="ghost" icon={<RotateCcw className="w-5 h-5" />}>Play From Start</FocusButton>
            <FocusButton variant="ghost" icon={<Film className="w-5 h-5" />}>Watch Trailer</FocusButton>
            <FocusButton variant="ghost" icon={<Plus className="w-5 h-5" />}>Add to List</FocusButton>
          </div>
        </div>
      </section>

      <div className="mt-2">
        <ContentRow title="Episodes" items={episodes} size="md" onSelect={() => navigate('player')} />
        <ContentRow title="More Like This" items={featured} size="md" />
      </div>
    </TVFrame>
  );
};

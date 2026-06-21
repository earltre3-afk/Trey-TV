import React from 'react';
import { Cloud, Disc3, Swords, ChevronRight } from 'lucide-react';
import TradioHeader from '../TradioHeader';
import SectionHeader from '../SectionHeader';
import { GENRES, MOODS, DECADES, SONG_WARS, type Mood } from '../../../data/mockData';

interface Props {
  onHome: () => void;
  onSongWars: () => void;
}


function MoodCard({ mood }: { mood: Mood }) {

  return (
    <button className="text-left active:scale-[0.97] transition-transform">
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-white/[0.06]">
        {mood.image ? (
          <img src={mood.image} alt={mood.title} className="w-full h-full object-cover object-top" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${mood.tone} flex items-center justify-center`}>
            {mood.icon === 'cloud' ? (
              <Cloud className="w-10 h-10 text-white" fill="currentColor" />
            ) : (
              <Disc3 className="w-10 h-10 text-white" />
            )}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/85 to-transparent">
          <p className="text-white font-bold text-sm leading-tight">{mood.title}</p>
          <p className="text-white/50 text-[11px]">{mood.subtitle}</p>
        </div>
      </div>
    </button>
  );
}

export default function BrowseScreen({ onHome, onSongWars }: Props) {
  const wars = SONG_WARS.filter((w) => w.status === 'active');
  return (
    <>
      <TradioHeader tabs={['Home', 'Browse']} activeTab="Browse" onTabChange={(t) => t === 'Home' && onHome()} />
      <div className="flex-1 min-h-0 overflow-y-auto pb-4 space-y-7 pt-2">

        {/* Song Wars rail */}
        <div>
          <SectionHeader title="Song Wars" onSeeAll={onSongWars} />
          <div className="flex gap-3 overflow-x-auto px-5 pb-1 no-scrollbar">
            {wars.map((w) => (
              <button
                key={w.id}
                onClick={onSongWars}
                className="w-56 shrink-0 text-left rounded-2xl overflow-hidden border border-amber-400/20 bg-gradient-to-br from-[#0a1020] to-black p-3 active:scale-[0.97] transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1 text-amber-300 text-[10px] font-bold tracking-wider">
                    <Swords className="w-3 h-3" /> {w.type.toUpperCase()}
                  </span>
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-600 text-white text-[9px] font-bold">
                    <span className="w-1 h-1 rounded-full bg-white animate-pulse" /> LIVE
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <img src={w.left.image} alt={w.left.name} className="w-12 h-12 rounded-full object-cover border-2 border-amber-400/40" />
                  <span className="text-cyan-300 text-xs font-black">VS</span>
                  <img src={w.right.image} alt={w.right.name} className="w-12 h-12 rounded-full object-cover border-2 border-white/15" />
                  <ChevronRight className="w-4 h-4 text-white/30 ml-auto" />
                </div>
                <p className="text-white font-bold text-sm mt-2 truncate">{w.title}</p>
              </button>
            ))}
          </div>
        </div>


        <div>
          <SectionHeader title="Genres" onSeeAll={() => {}} />
          <div className="flex gap-3 overflow-x-auto px-5 pb-1 no-scrollbar">
            {GENRES.map((g) => (
              <button key={g.id} className="w-28 shrink-0 text-left active:scale-[0.97] transition-transform">
                <div className="relative w-28 h-36 rounded-2xl overflow-hidden border border-white/[0.06]">
                  <img src={g.image} alt={g.title} className="w-full h-full object-cover object-top" />
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/85 to-transparent">
                    <p className="text-white font-bold text-sm">{g.title}</p>
                    <p className="text-white/50 text-[11px]">{g.subtitle}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <SectionHeader title="Moods" onSeeAll={() => {}} />
          <div className="grid grid-cols-3 gap-3 px-5">
            {MOODS.map((m) => (
              <MoodCard key={m.id} mood={m} />
            ))}
          </div>
        </div>

        <div>
          <SectionHeader title="Decades" onSeeAll={() => {}} />
          <div className="flex gap-3 overflow-x-auto px-5 pb-1 no-scrollbar">
            {DECADES.map((d) => (
              <button key={d.id} className="w-28 shrink-0 text-left active:scale-[0.97] transition-transform">
                <div className={`w-28 h-24 rounded-2xl bg-gradient-to-br ${d.tone} flex items-center justify-center border border-white/[0.08]`}>
                  <span className="text-white font-black text-3xl drop-shadow">{d.big}</span>
                </div>
                <p className="text-white font-semibold text-sm mt-1.5">{d.title}</p>
                <p className="text-white/45 text-[11px]">Decades</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

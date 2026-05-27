import React from 'react';
import { FocusCard, RowHeader } from './Primitives';
import { VideoTile, Creator, Game } from '../mockData';
import { getHeroFallbackStyle, selectHeroArtwork } from '../artwork';

const ArtworkFrame: React.FC<{ item: { title: string; image?: string; posterUrl?: string; thumbnailUrl?: string; backdropUrl?: string }; className: string }> = ({
  item,
  className,
}) => {
  const artwork = selectHeroArtwork(item);
  return (
    <div className={`absolute inset-0 ${className}`} style={getHeroFallbackStyle(item.title)}>
      {artwork && <img src={artwork} alt="" className="h-full w-full object-cover" />}
    </div>
  );
};

export const ContentRow: React.FC<{
  title: string;
  items: VideoTile[];
  size?: 'sm' | 'md' | 'lg';
  onSelect?: (v: VideoTile) => void;
}> = ({ title, items, size = 'md', onSelect }) => {
  const w = { sm: 'w-[200px]', md: 'w-[280px]', lg: 'w-[320px]' }[size];
  const h = { sm: 'h-[120px]', md: 'h-[160px]', lg: 'h-[180px]' }[size];
  return (
    <section className="mb-8">
      <RowHeader title={title} viewAll />
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
        {items.map((it) => (
          <FocusCard key={it.id} onClick={() => onSelect?.(it)} className={`${w} shrink-0`}>
            <div className={`relative ${h} w-full overflow-hidden`}>
              <ArtworkFrame item={it} className="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              {it.badge && (
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-gradient-to-r from-fuchsia-600 to-purple-700">
                  {it.badge}
                </span>
              )}
              <div className="absolute bottom-2 left-3 right-3">
                <div className="font-bold text-white text-base leading-tight line-clamp-1">{it.title}</div>
                {it.meta && <div className="text-xs text-white/70 line-clamp-1">{it.meta}</div>}
              </div>
              {typeof it.progress === 'number' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/15">
                  <div
                    className="h-full bg-gradient-to-r from-fuchsia-400 to-purple-500"
                    style={{ width: `${Math.round(it.progress * 100)}%` }}
                  />
                </div>
              )}
            </div>
          </FocusCard>
        ))}
      </div>
    </section>
  );
};

export const CreatorRow: React.FC<{ title: string; items: Creator[] }> = ({ title, items }) => (
  <section className="mb-8">
    <RowHeader title={title} viewAll />
    <div className="flex gap-6">
      {items.map((c) => {
        const artwork = selectHeroArtwork({ title: c.name, image: c.image });
        return (
          <button
            key={c.id}
            className="group flex flex-col items-center gap-2 outline-none focus:scale-110 transition-all"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-700 blur-md opacity-60 group-focus:opacity-100" />
              {artwork ? (
                <img
                  src={artwork}
                  alt=""
                  className="relative w-20 h-20 rounded-full object-cover border-2 border-fuchsia-400/70 group-focus:border-fuchsia-300"
                />
              ) : (
                <span
                  className="relative grid w-20 h-20 place-items-center rounded-full border-2 border-fuchsia-400/70 bg-gradient-to-br from-[#20112d] to-[#07070d] text-xl font-black text-amber-200 group-focus:border-fuchsia-300"
                >
                  {c.name.slice(0, 1)}
                </span>
              )}
            </div>
            <div className="text-sm font-semibold text-white/90">{c.name}</div>
          </button>
        );
      })}
    </div>
  </section>
);

export const GameRow: React.FC<{ title: string; items: Game[]; onSelect?: (g: Game) => void }> = ({
  title,
  items,
  onSelect,
}) => (
  <section className="mb-8">
    <RowHeader title={title} viewAll />
    <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
      {items.map((g) => (
        <FocusCard key={g.id} onClick={() => onSelect?.(g)} className="w-[260px] shrink-0">
          <div className="relative h-[150px] w-full overflow-hidden">
            <ArtworkFrame item={g} className="" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
            <div className="absolute bottom-2 left-3 right-3">
              <div className="font-bold text-white text-base">{g.title}</div>
              <div className="flex items-center justify-between text-xs text-white/70">
                <span>{g.meta}</span>
                {g.players && <span className="text-fuchsia-300">👤 {g.players}</span>}
              </div>
            </div>
          </div>
        </FocusCard>
      ))}
    </div>
  </section>
);

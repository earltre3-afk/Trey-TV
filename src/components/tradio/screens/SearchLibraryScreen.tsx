import React, { useState } from 'react';
import { Search as SearchIcon, Mic, ChevronRight, Music, Disc3, Mic2, Music2, Radio, X, Plus } from 'lucide-react';
import TradioHeader from '../TradioHeader';
import SectionHeader from '../SectionHeader';
import SearchResultsView from '../SearchResultsView';
import { RECENT_SEARCHES, SAVED_ITEMS, LIBRARY_ROWS } from '../../../data/mockData';
import { useSaved } from '../../../contexts/SavedContext';

const ICONS: Record<string, React.ElementType> = {
  Playlists: Music,
  Albums: Disc3,
  Artists: Mic2,
  Songs: Music2,
  Radios: Radio,
};

interface Props {
  onBrowse: () => void;
}

export default function SearchLibraryScreen({ onBrowse }: Props) {
  const [tab, setTab] = useState('Home');
  const [query, setQuery] = useState('');
  const [recents, setRecents] = useState(RECENT_SEARCHES);
  const [playlistTitle, setPlaylistTitle] = useState('');
  const { savedPlaylists, createPlaylist } = useSaved();
  const hasQuery = query.trim().length > 0;
  const savedItems = [
    ...savedPlaylists.map((p) => ({
      id: p.id,
      title: p.title,
      subtitle: p.subtitle,
      image: p.image ?? SAVED_ITEMS[0]?.image,
    })),
    ...SAVED_ITEMS.filter((item) => !savedPlaylists.some((p) => p.id === item.id)),
  ];

  const onCreatePlaylist = () => {
    const title = playlistTitle.trim();
    if (!title) return;
    createPlaylist({ title, subtitle: 'Created on mobile', visibility: 'private' });
    setPlaylistTitle('');
  };

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
      <div className="flex-1 min-h-0 overflow-y-auto pb-4 space-y-6 pt-2">

        <div className="flex items-center gap-3 px-5">
          <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-full bg-white/[0.05] border border-white/[0.07] tradio-focus transition-colors">

            <SearchIcon className="w-5 h-5 text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search artists, songs, radios..."
              className="bg-transparent flex-1 text-white text-sm placeholder:text-white/40 outline-none"
            />
            {hasQuery && (
              <button onClick={() => setQuery('')} aria-label="Clear search" className="text-white/40 active:scale-90">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button className="w-12 h-12 rounded-full tradio-gold-gradient flex items-center justify-center tradio-gold-glow active:scale-90 transition-transform">

            <Mic className="w-5 h-5 text-white" />
          </button>
        </div>

        {hasQuery ? (
          <SearchResultsView query={query} />
        ) : (
          <>
            <div>
              <div className="flex items-center justify-between px-5 mb-3">
                <h2 className="text-lg font-bold text-white">Recent Searches</h2>
                <button onClick={() => setRecents([])} className="text-sm text-amber-400 font-medium">

                  Clear
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto px-5 pb-1 no-scrollbar">
                {recents.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setQuery(r.label)}
                    className="flex items-center gap-2 pl-1 pr-4 py-1 rounded-full bg-white/[0.05] border border-white/[0.07] shrink-0 active:scale-95 transition-transform"
                  >
                    <img src={r.image} alt={r.label} className="w-7 h-7 rounded-full object-cover" />
                    <span className="text-white text-sm font-medium">{r.label}</span>
                  </button>
                ))}
                {recents.length === 0 && <span className="text-white/30 text-sm">No recent searches</span>}
              </div>
            </div>

            <div>
              <SectionHeader title="My Saved Albums & Playlists" onSeeAll={() => {}} />
              <div className="mx-5 mb-3 rounded-2xl bg-white/[0.05] border border-white/[0.07] p-3">
                <p className="text-white text-sm font-bold mb-2">Create Playlist</p>
                <div className="flex items-center gap-2">
                  <input
                    value={playlistTitle}
                    onChange={(e) => setPlaylistTitle(e.target.value)}
                    placeholder="Playlist name"
                    className="min-w-0 flex-1 rounded-full bg-black/30 border border-white/10 px-4 py-2 text-sm text-white placeholder:text-white/35 outline-none focus:border-amber-400/50"
                  />
                  <button
                    onClick={onCreatePlaylist}
                    className="w-10 h-10 rounded-full tradio-gold-gradient flex items-center justify-center text-black active:scale-95 transition"
                    aria-label="Create playlist"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex gap-4 overflow-x-auto px-5 pb-1 no-scrollbar">
                {savedItems.map((s) => (
                  <button key={s.id} className="w-36 shrink-0 text-left active:scale-[0.97] transition-transform">
                    <img src={s.image} alt={s.title} className="w-36 h-44 rounded-2xl object-cover object-top border border-white/[0.06]" />
                    <p className="text-white font-semibold text-sm mt-2 truncate">{s.title}</p>
                    <p className="text-white/45 text-xs truncate">{s.subtitle}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white px-5 mb-3">Library</h2>
              <div className="mx-4 rounded-3xl bg-white/[0.04] border border-white/[0.06] overflow-hidden">
                {LIBRARY_ROWS.map((row, i) => {
                  const Icon = ICONS[row];
                  const first = i === 0;
                  return (
                    <button
                      key={row}
                      className={`w-full flex items-center gap-4 px-5 py-4 active:bg-white/[0.04] ${
                        i !== 0 ? 'border-t border-white/[0.05]' : ''
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${first ? 'text-amber-400' : 'text-white/60'}`} />
                      <span className={`flex-1 text-left font-semibold ${first ? 'text-amber-400' : 'text-white'}`}>

                        {row}
                      </span>
                      <ChevronRight className="w-5 h-5 text-white/30" />
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

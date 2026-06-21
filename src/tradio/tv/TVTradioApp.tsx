import React, { Suspense, lazy, useState } from 'react';
import TradioTopBar from '@/tradio/components/TradioTopBar';
import HomeScreen from '@/tradio/screens/HomeScreen';
import MiniPlayer from '@/tradio/components/MiniPlayer';
import AuthMenu from '@/tradio/components/AuthMenu';
import { useTradioData } from '@/tradio/useTradioData';
import { ErrorState } from '@/tradio/components/RailSkeleton';

const BrowseScreen = lazy(() => import('@/tradio/screens/BrowseScreen'));
const LiveStationsScreen = lazy(() => import('@/tradio/screens/LiveStationsScreen'));
const ArtistProfileScreen = lazy(() => import('@/tradio/screens/ArtistProfileScreen'));
const AlbumDetailScreen = lazy(() => import('@/tradio/screens/AlbumDetailScreen'));
const PlaylistDetailScreen = lazy(() => import('@/tradio/screens/PlaylistDetailScreen'));
const FullPlayerScreen = lazy(() => import('@/tradio/screens/FullPlayerScreen'));
const SearchLibraryScreen = lazy(() => import('@/tradio/screens/SearchLibraryScreen'));
const TVSongWarsScreen = lazy(() => import('./TVSongWarsScreen'));

type Screen = 'home' | 'browse' | 'stations' | 'artist' | 'album' | 'playlist' | 'player' | 'search' | 'songwars';

const TOP_ACTIVE: Record<Screen, string> = {
  home: 'Home',
  browse: 'Browse',
  stations: 'Live Stations',
  artist: 'Artist Profile',
  album: 'Browse',
  playlist: 'Library',
  player: 'Now Playing',
  search: 'Library',
  songwars: 'Song Wars',
};

const TV_TABS = ['Home', 'Browse', 'Live Stations', 'Library', 'Artist Profile', 'Song Wars', 'Now Playing'];

const AppLayout: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('home');
  const [artistId, setArtistId] = useState<string | null>(null);
  const [playlistId, setPlaylistId] = useState<string | null>(null);
  const { data, loading, error, reload } = useTradioData();

  const openArtist = (id: string) => { setArtistId(id); setScreen('artist'); };
  const openPlaylist = (id: string) => { setPlaylistId(id); setScreen('playlist'); };

  const onTopTab = (t: string) => {
    if (t === 'Home') setScreen('home');
    else if (t === 'Browse') setScreen('browse');
    else if (t === 'Live Stations') setScreen('stations');
    else if (t === 'Library') setScreen('search');
    else if (t === 'Artist Profile') setScreen('artist');
    else if (t === 'Song Wars') setScreen('songwars');
    else if (t === 'Now Playing') setScreen('player');
  };

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center">
      <div className="w-full h-screen max-w-[1920px] aspect-video relative">
        <div className="absolute inset-0 overflow-hidden bg-[#0a0a0a]">
          <div className="pointer-events-none absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-purple-700/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-cyan-600/15 blur-3xl" />

          <div className="relative h-full flex flex-col px-10 pb-24">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <TradioTopBar
                  tabs={TV_TABS}
                  active={TOP_ACTIVE[screen]}
                  onTab={onTopTab}
                />
              </div>
              <AuthMenu />
            </div>

            <div className="flex-1 overflow-y-auto py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {error ? (
                <ErrorState message={`Couldn't load Tradio: ${error}`} onRetry={reload} />
              ) : (
                <Suspense fallback={<TvScreenFallback />}>
                  {screen === 'home' && <HomeScreen data={data} loading={loading} onOpenAlbum={() => setScreen('album')} onOpenStations={() => setScreen('stations')} />}
                  {screen === 'browse' && <BrowseScreen data={data} loading={loading} onOpenArtist={openArtist} onOpenAlbum={() => setScreen('album')} />}
                  {screen === 'stations' && <LiveStationsScreen data={data} loading={loading} onOpenArtist={openArtist} />}
                  {screen === 'artist' && <ArtistProfileScreen artistId={artistId} onPlay={() => setScreen('player')} onOpenArtist={openArtist} />}
                  {screen === 'album' && <AlbumDetailScreen data={data} loading={loading} onPlay={() => setScreen('player')} />}
                  {screen === 'playlist' && <PlaylistDetailScreen playlistId={playlistId} onPlay={() => setScreen('player')} />}
                  {screen === 'player' && <FullPlayerScreen />}
                  {screen === 'search' && <SearchLibraryScreen data={data} loading={loading} onOpenAlbum={() => setScreen('album')} onOpenArtist={openArtist} onOpenPlaylist={openPlaylist} />}
                  {screen === 'songwars' && <TVSongWarsScreen />}
                </Suspense>
              )}
            </div>
          </div>

          {/* persistent now-playing bar */}
          <MiniPlayer onOpenPlayer={() => setScreen('player')} />
        </div>
      </div>
    </div>
  );
};

function TvScreenFallback() {
  return <div className="h-full w-full bg-[#0a0a0a]" aria-label="Opening Tradio TV screen" />;
}

export default AppLayout;

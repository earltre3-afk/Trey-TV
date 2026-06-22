import React, { Suspense, lazy, useState } from 'react';
import BottomNav, { NavKey } from '@/components/tradio/BottomNav';
import MiniPlayer from '@/components/tradio/MiniPlayer';
import HomeScreen from '@/components/tradio/screens/HomeScreen';
import { usePlayer } from '@/contexts/PlayerContext';
import { useSongWars } from '@/contexts/SongWarsContext';
import { useTradioDataState } from '@/contexts/TradioDataContext';

import { SPOTLIGHT_QUEUE, PLAYLIST_QUEUE, TOP_TRACK_QUEUE } from '@/data/mockData';
import type { Contestant } from '@/data/mockData';

const PlaylistDetailScreen = lazy(() => import('@/components/tradio/screens/PlaylistDetailScreen'));
const SearchLibraryScreen = lazy(() => import('@/components/tradio/screens/SearchLibraryScreen'));
const ArtistProfileScreen = lazy(() => import('@/components/tradio/screens/ArtistProfileScreen'));
const LiveStationsScreen = lazy(() => import('@/components/tradio/screens/LiveStationsScreen'));
const BrowseScreen = lazy(() => import('@/components/tradio/screens/BrowseScreen'));
import NowPlayingScreen from '@/components/tradio/screens/NowPlayingScreen';
const PrescribeMeScreen = lazy(() => import('@/components/tradio/screens/PrescribeMeScreen'));
const CommunityScreen = lazy(() => import('@/components/tradio/screens/CommunityScreen'));
const SongWarsScreen = lazy(() => import('@/components/tradio/screens/SongWarsScreen'));
const SongWarsAdminScreen = lazy(() => import('@/components/tradio/screens/SongWarsAdminScreen'));
const LiveArenaScreen = lazy(() => import('@/components/tradio/screens/LiveArenaScreen'));
const ShowBuilderScreen = lazy(() => import('@/components/tradio/screens/ShowBuilderScreen'));
const SongReviewScreen = lazy(() => import('@/components/tradio/screens/SongReviewScreen'));
const BroadcastCreatorScreen = lazy(() => import('@/components/tradio/screens/BroadcastCreatorScreen'));
const BattleSetupWizard = lazy(() => import('@/components/tradio/songwars/BattleSetupWizard'));
const ReleaseScreen = lazy(() => import('@/components/tradio/screens/ReleaseScreen'));
const MyProfileScreen = lazy(() => import('@/components/tradio/screens/MyProfileScreen'));

type Screen =
  | 'home'
  | 'playlist'
  | 'search'
  | 'artist'
  | 'live'
  | 'browse'
  | 'now'
  | 'prescribe'
  | 'community'
  | 'songwars'
  | 'songwars-admin'
  | 'arena'
  | 'showbuilder'
  | 'songreview'
  | 'broadcast'
  | 'battlesetup'
  | 'release'
  | 'myprofile';

const NAV_FOR_SCREEN: Record<Screen, NavKey> = {
  home: 'Home',
  browse: 'Explore',
  playlist: 'Explore',
  live: 'Explore',
  community: 'Explore',
  songwars: 'Explore',
  'songwars-admin': 'Explore',
  arena: 'Explore',
  battlesetup: 'Explore',
  search: 'Library',
  artist: 'Profile',
  myprofile: 'Profile',
  prescribe: 'Prescribe Me',
  showbuilder: 'Home',
  songreview: 'Home',
  broadcast: 'Home',
  release: 'Home',
  now: 'Home',
};

export default function AppLayout() {
  const [screen, setScreen] = useState<Screen>('myprofile');
  const [songWarsFocus, setSongWarsFocus] = useState<string | undefined>(undefined);
  const [arenaWarId, setArenaWarId] = useState<string | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const { playQueue, current } = usePlayer();
  const { wars } = useSongWars();
  const { releasedTracks } = useTradioDataState();

  const goPlayer = () => setScreen('now');
  const goBrowse = () => setScreen('browse');
  const goHome = () => setScreen('home');
  const goPlaylist = () => setScreen('playlist');
  const goPrescribe = () => setScreen('prescribe');
  const goCommunity = () => setScreen('community');
  const goLive = () => setScreen('live');
  const goSongWars = () => { setSongWarsFocus(undefined); setScreen('songwars'); };
  const goSongWarsAdmin = () => setScreen('songwars-admin');
  const openBattle = (warId: string) => { setSongWarsFocus(warId); setScreen('songwars'); };
  const openArena = (warId: string) => { setArenaWarId(warId); setScreen('arena'); };
  const goShowBuilder = () => setScreen('showbuilder');
  const goRelease = () => setScreen('release');
  const goSongReview = () => setScreen('songreview');
  const goBroadcast = () => setScreen('broadcast');
  const goBattleSetup = () => setScreen('battlesetup');

  const playSpotlight = () => { playQueue(SPOTLIGHT_QUEUE, 0); setScreen('now'); };
  const playPlaylistAt = (index: number, tracks?: any[]) => {
    const queue = tracks ? tracks.map(t => ({ id: t.id, title: t.title, artist: t.artist, artwork: t.artwork, src: t.src })) : PLAYLIST_QUEUE;
    playQueue(queue, index);
  };
  const playPlaylistAndOpen = (tracks?: any[]) => {
    const queue = tracks ? tracks.map(t => ({ id: t.id, title: t.title, artist: t.artist, artwork: t.artwork, src: t.src })) : PLAYLIST_QUEUE;
    playQueue(queue, 0);
    setScreen('now');
  };
  const playTopTrackAt = (index: number) => { playQueue(TOP_TRACK_QUEUE, index); setScreen('now'); };
  const startRadio = () => { playQueue(SPOTLIGHT_QUEUE, 0); setScreen('now'); };
  
  const playPrescription = (answers?: any, title?: string) => {
    let selectedMoods: string[] = [];
    let selectedEnergy: string | undefined = undefined;

    if (answers) {
      if (Array.isArray(answers.moods)) {
        selectedMoods = answers.moods;
        selectedEnergy = answers.energy;
      } else {
        // Map UserAnswers from prescribeMeService.ts
        const emotionalStateMap: Record<string, string> = {
          heavy: 'Reflective',
          restless: 'Chill',
          inspired: 'Inspired',
          numb: 'Chill',
          excited: 'Energetic',
          reflective: 'Reflective',
          confident: 'Confident',
          lonely: 'Reflective',
          focused: 'Focused',
          social: 'Feel Good',
        };
        const moodVal = emotionalStateMap[answers.emotionalState] || 'Chill';
        selectedMoods = [moodVal];

        const needEnergyMap: Record<string, string> = {
          feel_understood: 'Soft',
          turn_up: 'High',
          calm_down: 'Soft',
          focus: 'Balanced',
          discover_new: 'Balanced',
          motivation: 'High',
          process: 'Soft',
          creative_inspiration: 'Balanced',
          background_energy: 'Soft',
          live_energy: 'High',
        };
        selectedEnergy = needEnergyMap[answers.currentNeed] || 'Balanced';
      }
    }

    const allTracks = [
      ...(releasedTracks || [])
        .filter((t) => {
          const isReleased = t.releaseType === 'instant' || (t.releaseDate && new Date(t.releaseDate).getTime() <= Date.now());
          return isReleased;
        })
        .map((t) => ({
          id: t.id,
          title: t.title,
          artist: t.artistName,
          artwork: 'https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730889057_b6e69acc.png',
          src: t.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          moods: t.moods || [],
          energy: t.energy || [],
        })),
      ...SPOTLIGHT_QUEUE.map((t) => ({
        ...t,
        moods: ['Chill', 'Inspired'],
        energy: ['Balanced'],
      })),
      ...PLAYLIST_QUEUE.map((t) => ({
        ...t,
        moods: ['Reflective', 'Chill'],
        energy: ['Soft'],
      })),
    ];

    const filtered = allTracks.filter((t) => {
      const matchesMood = selectedMoods.length === 0 || t.moods.some((m: string) => selectedMoods.includes(m));
      const matchesEnergy = !selectedEnergy || selectedEnergy === 'Surprise Me' || t.energy.includes(selectedEnergy);
      return matchesMood && matchesEnergy;
    });

    const queueToPlay = filtered.length > 0 ? filtered : allTracks;

    playQueue(
      queueToPlay.map((t) => ({
        id: t.id,
        title: t.title,
        artist: t.artist ?? t.artistName ?? 'Unknown Artist',
        artwork: t.artwork ?? 'https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730889057_b6e69acc.png',
        src: t.src ?? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      })),
      0
    );

    setScreen('now');
  };
  const playContestant = (c: Contestant) => {
    playQueue([{ id: c.id, title: c.track, artist: c.name, artwork: c.image, src: c.src }], 0);
    setScreen('now');
  };

  const handleNav = (key: NavKey) => {
    switch (key) {
      case 'Home': setScreen('home'); break;
      case 'Explore': setScreen('browse'); break;
      case 'Prescribe Me': setScreen('prescribe'); break;
      case 'Library': setScreen('search'); break;
      case 'Profile': setScreen('myprofile'); break;
      default: break;
    }
  };

  const arenaWar = arenaWarId ? wars.find((w) => w.id === arenaWarId) : undefined;

  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return (
          <HomeScreen
            onPlaySpotlight={playSpotlight}
            onOpenPlaylist={goPlaylist}
            onBrowse={goBrowse}
            onPrescribe={goPrescribe}
            onCommunity={goCommunity}
            onSongWars={goSongWars}
            onShowBuilder={goShowBuilder}
            onSongReview={goSongReview}
            onBroadcast={goBroadcast}
            onRelease={goRelease}
          />
        );
      case 'playlist':
        return (
          <PlaylistDetailScreen
            currentId={current?.id}
            playlistId={selectedPlaylistId}
            onPlayTrack={playPlaylistAt}
            onPlayPlaylist={playPlaylistAndOpen}
            onBrowse={goBrowse}
          />
        );
      case 'search':
        return <SearchLibraryScreen onBrowse={goBrowse} />;
      case 'artist':
        return (
          <ArtistProfileScreen
            onPlayTrack={playTopTrackAt}
            onStartRadio={startRadio}
            onBrowse={goBrowse}
            onOpenPlaylistId={(id) => {
              setSelectedPlaylistId(id);
              setScreen('playlist');
            }}
          />
        );
      case 'live':
        return <LiveStationsScreen onBrowse={goBrowse} onCommunity={goCommunity} onSongWars={goSongWars} />;
      case 'community':
        return <CommunityScreen onClose={goLive} onJoinRoom={playSpotlight} onOpenBattle={openArena} />;
      case 'songwars':
        return (
          <SongWarsScreen
            onClose={goLive}
            onOpenAdmin={goSongWarsAdmin}
            onPlayContestant={playContestant}
            focusWarId={songWarsFocus}
            onClearFocus={() => setSongWarsFocus(undefined)}
            onEnterArena={openArena}
          />
        );
      case 'songwars-admin':
        return <SongWarsAdminScreen onClose={goSongWars} onBattleSetup={goBattleSetup} />;
      case 'arena':
        return arenaWar ? (
          <LiveArenaScreen
            war={arenaWar}
            isAdmin={isAdmin}
            onToggleAdmin={() => setIsAdmin((v) => !v)}
            onClose={goSongWars}
            onPlay={playContestant}
          />
        ) : (
          <SongWarsScreen
            onClose={goLive}
            onOpenAdmin={goSongWarsAdmin}
            onPlayContestant={playContestant}
            onEnterArena={openArena}
          />
        );
      case 'prescribe':
        return (
          <PrescribeMeScreen
            onClose={goHome}
            onPlayPrescription={playPrescription}
            onOpenBattle={openBattle}
          />
        );
      case 'showbuilder':
        return <ShowBuilderScreen onClose={goHome} />;
      case 'songreview':
        return <SongReviewScreen onClose={goHome} />;
      case 'broadcast':
        return <BroadcastCreatorScreen onClose={goHome} onShowBuilder={goShowBuilder} />;
      case 'release':
        return <ReleaseScreen onClose={goHome} />;
      case 'myprofile':
        return <MyProfileScreen onRelease={goRelease} onSongWars={goSongWars} onBrowse={goBrowse} />;
      case 'battlesetup':
        return <BattleSetupWizard onClose={goSongWarsAdmin} />;
      case 'browse':
        return <BrowseScreen onHome={goHome} onSongWars={goSongWars} />;
      default:
        return (
          <HomeScreen
            onPlaySpotlight={playSpotlight}
            onOpenPlaylist={goPlaylist}
            onBrowse={goBrowse}
            onPrescribe={goPrescribe}
            onCommunity={goCommunity}
            onSongWars={goSongWars}
            onShowBuilder={goShowBuilder}
            onSongReview={goSongReview}
            onBroadcast={goBroadcast}
            onRelease={goRelease}
          />
        );
    }
  };

  return (
    <div
      data-tradio-screen={screen}
      // NOTE: no `transition-all` here. It animated the --tradio-dock-reserve padding change
      // on every screen swap; combined with the blurred orbs + player shadows it stalled the
      // mobile compositor and froze the UI when extending the player. Snap instead.
      className="h-[100dvh] min-h-[100svh] w-full overflow-hidden bg-[#030407] flex flex-col"
      style={{
        '--tradio-nav-height': 'calc(6.5rem + env(safe-area-inset-bottom, 0px))',
        '--tradio-dock-reserve': screen === 'now'
          ? '0px'
          : current
          ? 'calc(11.75rem + env(safe-area-inset-bottom, 0px))'
          : 'calc(6.5rem + env(safe-area-inset-bottom, 0px))',
      } as React.CSSProperties}
    >
      {/* Background ambient lighting — lighter blur (150px was very expensive to composite
          on mobile GPUs and contributed to the freeze). */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-fuchsia-500/10 blur-[80px]" />
        <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[80px]" />
      </div>

      {/* Immersive Fullscreen View */}
      <div className="relative w-full flex-1 min-h-0 bg-black flex flex-col z-10 pb-[var(--tradio-dock-reserve)]">
        {/* Screen Content */}
        {screen === 'now' ? (
          <div className="flex-1 min-h-0">
            <NowPlayingScreen onClose={goHome} />
          </div>
        ) : (
          <>
            <div className="flex-1 min-h-0 flex flex-col">
              <Suspense fallback={<ScreenFallback />}>{renderScreen()}</Suspense>
            </div>
            <MiniPlayer onOpen={goPlayer} />
            <BottomNav active={NAV_FOR_SCREEN[screen]} onChange={handleNav} />
          </>
        )}
      </div>
    </div>
  );
}

function ScreenFallback() {
  return <div className="min-h-0 flex-1 bg-black" aria-label="Opening Tradio screen" />;
}

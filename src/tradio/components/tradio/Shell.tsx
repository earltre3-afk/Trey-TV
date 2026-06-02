import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BarChart3,
  CalendarDays,
  Home,
  Library,
  Plus,
  Radio,
  Route,
  Search,
  Sparkles,
  UploadCloud,
  User,
  Users,
  X,
  Lock,
  Flame,
  Zap,
  Mic2,
  Disc,
  Sliders,
  Activity,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { toast } from 'sonner';
import { hasAnyRole } from './auth/roleUtils';
import BottomNav, { TabKey } from './BottomNav';
import MiniPlayer from './MiniPlayer';
import HomeScreen from './screens/Home';
import BuildStationScreen from './screens/BuildStation';
import ArtistStationScreen from './screens/ArtistStation';
import InstantReleaseScreen from './screens/InstantRelease';
import SearchScreen from './screens/Search';
import NowPlayingScreen from './screens/NowPlaying';
import LibraryScreen from './screens/Library';
import StudioScreen from './screens/Studio';
import CommunityScreen from './screens/Community';
import ScheduleScreen from './screens/Schedule';
import StationsHub, { type StationsDestination } from './screens/StationsHub';
import ArtistHubScreen from './screens/ArtistHub';
import ProducerHubScreen from './screens/ProducerHub';
import DJStudioScreen from './screens/DJStudio';
import { TradioLiveNowBar } from './TradioLiveNowBar';
import ShowBuilderScreen from './screens/ShowBuilder';
import BroadcastStudioGateway from './screens/BroadcastStudioGateway';
import RouteMePage from '../route-me/RouteMePage';
import { ProfileScreen } from './screens/ProfileScreen';
import { RoleProfilePage } from './screens/RoleProfilePage';
import type { RoleProfileType } from './auth/roleProfile';
import aiBallCutout from '@/tradio/assets/ai-ball.png';
import { LegalCenter } from './legal/LegalCenter';
import LegalAdminDashboard from './legal/LegalAdminDashboard';
import { LegalFooterLinks } from './legal/LegalPrimitives';
import { PlayerProvider } from '@/tradio/contexts/PlayerContext';
import { AIPill, GlassCard, PrimaryButton, SecondaryButton, TradioLogo, Waveform } from './ui';
import { ModeSwitcher } from './auth/components';
import { TradioIdentityProvider, useTradioIdentity } from './auth/useTradioIdentity';
import { AccessRequestsProvider } from './auth/AccessRequestsContext';
import { MessengerBridgeProvider } from '../universe/MessengerBridgeProvider';
import { useMessengerBridge } from '../universe/MessengerBridgeContext';
import { TradioMessengerBell } from '../universe/TradioMessengerBridge';
import type { StudioDestination } from './screens/Studio';
import { SongWarsHub } from './songwars/views/SongWarsHub';
import { BattleSetupForm } from './songwars/views/BattleSetupForm';
import { BattleStage } from './songwars/views/BattleStage';
import { BattleResults } from './songwars/views/BattleResults';
import { BattleReplayScreen } from './songwars/views/BattleReplayScreen';
import type { SongWarRole } from './songwars/types';
import { MOCK_BATTLES, MOCK_REPLAYS } from './songwars/data';


const SCREEN_ICONS: Record<ScreenKey, React.ComponentType<{ className?: string }>> = {
  home: Home,
  stations: Radio,
  build: Sparkles,
  artist: Mic2,
  release: UploadCloud,
  search: Search,
  library: Library,
  studio: BarChart3,
  community: Users,
  schedule: CalendarDays,
  artistHub: Users,
  producerHub: Sliders,
  djStudio: Disc,
  showBuilder: Sparkles,
  analytics: BarChart3,
  songwars: Flame,
  routeMe: Route,
  broadcastStudio: Radio,
};

type View =
  | { kind: 'tab'; tab: TabKey }
  | { kind: 'profile'; role: 'artist' | 'producer' | 'host'; name: string }
  | { kind: 'roleProfile'; role: RoleProfileType; ownerView: boolean; lookup?: { publicProfileUid?: string; handle?: string }; editMode?: boolean }
  | { kind: 'artist' }
  | { kind: 'build' }
  | { kind: 'release' }
  | { kind: 'community' }
  | { kind: 'schedule' }
  | { kind: 'artistHub' }
  | { kind: 'producerHub' }
  | { kind: 'djStudio' }
  | { kind: 'showBuilder' }
  | { kind: 'broadcastStudio'; initialTab?: string }
  | { kind: 'routeMe' }
  | { kind: 'legal'; target?: string }
  | { kind: 'legalAdmin' }
  | { kind: 'songwars'; view: 'hub' | 'setup' | 'stage' | 'results' | 'replay'; battleId?: string };

type ScreenKey =
  | 'home'
  | 'stations'
  | 'build'
  | 'artist'
  | 'release'
  | 'search'
  | 'library'
  | 'studio'
  | 'community'
  | 'schedule'
  | 'artistHub'
  | 'producerHub'
  | 'djStudio'
  | 'showBuilder'
  | 'analytics'
  | 'songwars'
  | 'routeMe'
  | 'broadcastStudio';

const NAV_COLORS: Record<TabKey, string> = {
  home: 'text-primary',
  stations: 'text-[#00B7FF]', // Cyan
  search: 'text-[oklch(0.65_0.22_300)]', // Purple
  library: 'text-[oklch(0.7_0.25_340)]', // Red/Pink
  studio: 'text-[#D946EF]', // Magenta
  profile: 'text-primary' // Gold
};

const SCREEN_COLORS: Record<ScreenKey, string> = {
  home: 'text-primary',
  stations: 'text-[#D946EF]',
  build: 'text-primary',
  artist: 'text-[oklch(0.7_0.25_340)]',
  release: 'text-[oklch(0.82_0.15_215)]',
  search: 'text-[oklch(0.65_0.22_300)]',
  library: 'text-[oklch(0.65_0.22_300)]',
  studio: 'text-primary',
  community: 'text-[oklch(0.65_0.22_300)]',
  schedule: 'text-[oklch(0.82_0.15_215)]',
  artistHub: 'text-[oklch(0.7_0.25_340)]',
  producerHub: 'text-[#00B7FF]',
  djStudio: 'text-[#D946EF]',
  showBuilder: 'text-[#00B7FF]',
  analytics: 'text-primary',
  songwars: 'text-[oklch(0.7_0.25_340)]',
  routeMe: 'text-primary',
  broadcastStudio: 'text-[#D946EF]',
};

const PRIMARY_NAV: { key: TabKey; label: string; hint: string; Icon: React.FC<{ className?: string }> }[] = [
  { key: 'home', label: 'Home', hint: 'For You radio', Icon: Home },
  { key: 'stations', label: 'Stations', hint: 'Artist-owned channels', Icon: Radio },
  { key: 'search', label: 'Search', hint: 'Music, moods, creators', Icon: Search },
  { key: 'library', label: 'Library', hint: 'Saved stations', Icon: Library },
  { key: 'studio', label: 'Studio', hint: 'Creator control room', Icon: BarChart3 },
  { key: 'profile', label: 'My Profile', hint: 'Your creator identity', Icon: User },
];

const SCREEN_LABELS: { key: ScreenKey; label: string; group: string }[] = [
  { key: 'home', label: 'Home', group: 'Listener' },
  { key: 'build', label: 'Build Station', group: 'AI' },
  { key: 'artist', label: 'Artist Station', group: 'Artist' },
  { key: 'release', label: 'Instant Release', group: 'Artist' },
  { key: 'search', label: 'Search', group: 'Discovery' },
  { key: 'library', label: 'Library', group: 'Listener' },
  { key: 'studio', label: 'Studio', group: 'Network' },
  { key: 'artistHub', label: 'Artist Hub', group: 'Artist' },
  { key: 'producerHub', label: 'Producer Hub', group: 'Producer' },
  { key: 'djStudio', label: 'DJ Studio', group: 'DJ' },
  { key: 'showBuilder', label: 'AI Show Builder', group: 'AI' },
  { key: 'community', label: 'Community', group: 'Fan' },
  { key: 'schedule', label: 'Live Schedule', group: 'Radio' },
  { key: 'songwars', label: 'Song Wars PVP', group: 'PvP Event' },
  { key: 'routeMe', label: 'Route Me', group: 'Universe' },
];

const FEATURE_SHORTCUTS: { key: ScreenKey; label: string; sub: string; Icon: React.FC<{ className?: string }> }[] = [
  { key: 'build', label: 'Build Station', sub: 'Generate a mood-based radio lane', Icon: Sparkles },
  { key: 'release', label: 'Instant Release', sub: 'Drop directly into Tradio', Icon: UploadCloud },
  { key: 'showBuilder', label: 'AI Show Builder', sub: 'Build a full live radio plan', Icon: Sparkles },
  { key: 'routeMe', label: 'Route Me', sub: 'Prescribe a path through the Trey TV universe', Icon: Route },
  { key: 'community', label: 'Community', sub: 'Station rooms and fan reactions', Icon: Users },
  { key: 'schedule', label: 'Live Schedule', sub: 'Premieres and radio blocks', Icon: CalendarDays },
];

export const TradioShellContent: React.FC = () => {
  const { identity, currentMode, currentRoleLabel } = useTradioIdentity();
  const messengerBridge = useMessengerBridge();
  const [tab, setTab] = useState<TabKey>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('artistUid') || params.get('uid') || params.get('producerUid') || params.get('djUid')) {
        return 'studio';
      }
    }
    return 'home';
  });
  const [view, setView] = useState<View>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const artistUid = params.get('artistUid') || params.get('uid');
      const producerUid = params.get('producerUid');
      const djUid = params.get('djUid');
      if (artistUid) return { kind: 'roleProfile', role: 'artist', ownerView: false, lookup: { publicProfileUid: artistUid } };
      if (producerUid) return { kind: 'roleProfile', role: 'producer', ownerView: false, lookup: { publicProfileUid: producerUid } };
      if (djUid) return { kind: 'roleProfile', role: 'dj', ownerView: false, lookup: { publicProfileUid: djUid } };
    }
    return { kind: 'tab', tab: 'home' };
  });
  const [playerOpen, setPlayerOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [songWarRole, setSongWarRole] = useState<SongWarRole>('fan');
  const mainScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const detectDevice = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const aspect = w / h;

      // Clean previous classes
      document.body.classList.remove(
        'device-foldable-folded',
        'device-foldable-unfolded',
        'device-tablet',
        'device-tv-cinema'
      );

      let bodyClass = '';

      if (w < 340 && h > 500) {
        // Motorola Razr folded front screen or Galaxy Fold outer screen
        bodyClass = 'device-foldable-folded';
      } else if (w >= 500 && w < 920 && aspect >= 0.85 && aspect <= 1.25) {
        // Square unfolding ratio: Galaxy Fold inner, Google Duo, etc.
        bodyClass = 'device-foldable-unfolded';
      } else if (w >= 500 && w < 1024) {
        // iPads and standard Android tablets
        bodyClass = 'device-tablet';
      } else if (w >= 1800) {
        // Smart TVs, 4K monitors, ultrawides
        bodyClass = 'device-tv-cinema';
      }

      if (bodyClass) {
        document.body.classList.add(bodyClass);
      }
    };

    // Run initial check
    detectDevice();

    window.addEventListener('resize', detectDevice);
    return () => {
      window.removeEventListener('resize', detectDevice);
    };
  }, []);

  // Listen for mobile header custom events to open nav or messenger
  useEffect(() => {
    const handleOpenNav = () => setNavOpen(true);
    const handleOpenMessenger = () => messengerBridge?.openPreview();

    window.addEventListener('open-tradio-nav', handleOpenNav);
    document.addEventListener('open-tradio-nav', handleOpenNav);
    window.addEventListener('open-tradio-messenger', handleOpenMessenger);
    document.addEventListener('open-tradio-messenger', handleOpenMessenger);

    return () => {
      window.removeEventListener('open-tradio-nav', handleOpenNav);
      document.removeEventListener('open-tradio-nav', handleOpenNav);
      window.removeEventListener('open-tradio-messenger', handleOpenMessenger);
      document.removeEventListener('open-tradio-messenger', handleOpenMessenger);
    };
  }, [messengerBridge]);

  useEffect(() => {
    const resetScroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      mainScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    };

    resetScroll();
    const frame = requestAnimationFrame(resetScroll);
    const timer = window.setTimeout(resetScroll, 0);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [view]);

  const setScreen = (key: ScreenKey) => {
    const map: Record<ScreenKey, () => void> = {
      home: () => { setTab('home'); setView({ kind: 'tab', tab: 'home' }); },
      stations: () => { setTab('stations'); setView({ kind: 'tab', tab: 'stations' }); },
      build: () => { setTab('stations'); setView({ kind: 'build' }); },
      artist: () => { setTab('stations'); setView({ kind: 'artist' }); },
      release: () => { setTab('studio'); setView({ kind: 'release' }); },
      search: () => { setTab('search'); setView({ kind: 'tab', tab: 'search' }); },
      library: () => { setTab('library'); setView({ kind: 'tab', tab: 'library' }); },
      studio: () => { setTab('studio'); setView({ kind: 'tab', tab: 'studio' }); },
      community: () => { setTab('stations'); setView({ kind: 'community' }); },
      schedule: () => { setTab('stations'); setView({ kind: 'schedule' }); },
      artistHub: () => { setTab('studio'); setView({ kind: 'artistHub' }); },
      producerHub: () => { setTab('studio'); setView({ kind: 'producerHub' }); },
      djStudio: () => { setTab('studio'); setView({ kind: 'djStudio' }); },
      showBuilder: () => { setTab('studio'); setView({ kind: 'showBuilder' }); },
      analytics: () => { setTab('studio'); setView({ kind: 'tab', tab: 'studio' }); },
      songwars: () => { setTab('stations'); setView({ kind: 'songwars', view: 'hub' }); },
      routeMe: () => { setView({ kind: 'routeMe' }); },
      broadcastStudio: () => { setTab('studio'); setView({ kind: 'broadcastStudio' }); },
    };

    map[key]();
    setNavOpen(false);
  };

  const handleTab = (t: TabKey) => {
    const hasProfileAccess = hasAnyRole(identity, ['artist', 'producer', 'dj', 'admin', 'owner']);
    if (t === 'profile' && !hasProfileAccess) {
      toast.error('Only approved artists, DJs, and producers have access to a Tradio profile page.');
      return;
    }
    setTab(t);
    if (t === 'stations') setView({ kind: 'tab', tab: 'stations' });
    else setView({ kind: 'tab', tab: t });
  };

  const openStudioDestination = (destination: StudioDestination) => {
    if (destination === 'songwars') {
      setView({ kind: 'songwars', view: 'hub' });
    } else if (destination === 'songwars_setup') {
      setView({ kind: 'songwars', view: 'setup' });
    } else if (destination === 'songwars_stage') {
      setView({ kind: 'songwars', view: 'stage', battleId: 'battle-1' });
    } else if (destination === 'legalAdmin') {
      setTab('studio');
      setView({ kind: 'legalAdmin' });
    } else {
      if (destination === 'artistProfile' || destination === 'producerProfile' || destination === 'djProfile') {
        const role: RoleProfileType = destination === 'artistProfile' ? 'artist' : destination === 'producerProfile' ? 'producer' : 'dj';
        setTab('studio');
        setView({ kind: 'roleProfile', role, ownerView: true });
        return;
      }
      const map: Partial<Record<StudioDestination, ScreenKey>> = {
        artistHub: 'artistHub',
        producerHub: 'producerHub',
        djStudio: 'djStudio',
        showBuilder: 'showBuilder',
        release: 'release',
        analytics: 'analytics',
        broadcastStudio: 'broadcastStudio',
      };
      setScreen(map[destination] || 'studio');
    }
  };

  const openRoleProfile = (role: RoleProfileType, ownerView: boolean) => {
    setTab('studio');
    setView({ kind: 'roleProfile', role, ownerView });
  };

  const openLegal = useCallback((target?: string) => {
    setView({ kind: 'legal', target });
    setNavOpen(false);
  }, []);

  useEffect(() => {
    const handleOpenLegal = (event: Event) => {
      const target = (event as CustomEvent<{ target?: string }>).detail?.target;
      openLegal(target);
    };
    window.addEventListener('open-tradio-legal', handleOpenLegal);
    document.addEventListener('open-tradio-legal', handleOpenLegal);
    return () => {
      window.removeEventListener('open-tradio-legal', handleOpenLegal);
      document.removeEventListener('open-tradio-legal', handleOpenLegal);
    };
  }, [openLegal]);

  const openStationsDestination = (destination: StationsDestination) => {
    if (destination === 'songwars') {
      setView({ kind: 'songwars', view: 'hub' });
    } else {
      const map: Partial<Record<StationsDestination, ScreenKey>> = {
        build: 'build',
        artist: 'artist',
        schedule: 'schedule',
        community: 'community',
      };
      const screen = map[destination];
      if (screen) setScreen(screen);
    }
  };

  const renderScreen = () => {
    if (view.kind === 'broadcastStudio') return (
      <BroadcastStudioGateway
        onBack={() => setScreen('studio')}
        initialTab={view.initialTab}
      />
    );

    if (view.kind === 'routeMe') return <RouteMePage onBack={() => setScreen('home')} />;

    if (view.kind === 'artist') return (
      <ArtistStationScreen
        onBack={() => setScreen('home')}
        onOpenSongWars={(dest) => {
          if (dest) {
            setView({ kind: 'songwars', view: dest.view, battleId: dest.battleId });
          } else {
            setView({ kind: 'songwars', view: 'hub' });
          }
        }}
      />
    );
    if (view.kind === 'profile') return (
      <ProfileScreen
        role={view.role}
        name={view.name}
        onBack={() => setView({ kind: 'tab', tab: 'home' })}
      />
    );
    if (view.kind === 'roleProfile') return (
      <RoleProfilePage
        role={view.role}
        ownerView={view.ownerView}
        lookup={view.lookup}
        onBack={() => setScreen('studio')}
        onOpenPublicShell={(r) => setView({ kind: 'profile', role: r === 'dj' ? 'host' : r, name: r === 'producer' ? 'JAYE.' : r === 'dj' ? 'Jordan' : 'Trey Trizzy' })}
        onOpenBroadcastStudio={() => setView({ kind: 'broadcastStudio' })}
      />
    );
    if (view.kind === 'legal') return (
      <LegalCenter initialTarget={view.target} onExit={() => setScreen('home')} />
    );
    if (view.kind === 'legalAdmin') return <LegalAdminDashboard onBack={() => setScreen('studio')} />;
    if (view.kind === 'build') return <BuildStationScreen />;
    if (view.kind === 'release') return <InstantReleaseScreen />;
    if (view.kind === 'community') return <CommunityScreen />;
    if (view.kind === 'schedule') return (
      <ScheduleScreen
        onOpenSongWars={(dest) => {
          setView({ kind: 'songwars', view: dest.view, battleId: dest.battleId });
        }}
        onOpenBroadcastStudio={(initialTab) => setView({ kind: 'broadcastStudio', initialTab })}
      />
    );
    if (view.kind === 'artistHub') return <ArtistHubScreen onOpenRelease={() => setScreen('release')} onOpenSchedule={() => setScreen('schedule')} onOpenBroadcastStudio={(initialTab) => setView({ kind: 'broadcastStudio', initialTab })} onViewPublicProfile={() => openRoleProfile('artist', false)} onEditProfile={() => openRoleProfile('artist', true)} />;
    if (view.kind === 'producerHub') return <ProducerHubScreen onOpenBroadcastStudio={(initialTab) => setView({ kind: 'broadcastStudio', initialTab })} onViewPublicProfile={() => openRoleProfile('producer', false)} onEditProfile={() => openRoleProfile('producer', true)} />;
    if (view.kind === 'djStudio') return <DJStudioScreen onOpenBroadcastStudio={(initialTab) => setView({ kind: 'broadcastStudio', initialTab })} onViewPublicProfile={() => openRoleProfile('dj', false)} onEditProfile={() => openRoleProfile('dj', true)} />;
    if (view.kind === 'showBuilder') return <ShowBuilderScreen />;

    if (view.kind === 'songwars') {
      const handleNavigate = (dest: { view: 'hub' | 'setup' | 'stage' | 'results' | 'replay'; battleId?: string }) => {
        setView({ kind: 'songwars', view: dest.view, battleId: dest.battleId });
      };

      if (view.view === 'hub') {
        return (
          <SongWarsHub
            onNavigate={handleNavigate}
            role={songWarRole}
            onRoleChange={setSongWarRole}
            onBack={() => setScreen('stations')}
          />
        );
      }
      if (view.view === 'setup') {
        return (
          <BattleSetupForm
            onBack={() => setView({ kind: 'songwars', view: 'hub' })}
            onPublish={(newBattle) => {
              MOCK_BATTLES.unshift(newBattle);
              if (newBattle.status === 'live') {
                setView({ kind: 'songwars', view: 'stage', battleId: newBattle.id });
              } else {
                setView({ kind: 'songwars', view: 'hub' });
              }
            }}
          />
        );
      }
      if (view.view === 'stage') {
        return (
          <BattleStage
            battleId={view.battleId}
            role={songWarRole}
            onNavigate={handleNavigate}
            onReturnHome={() => setScreen('home')}
          />
        );
      }
      if (view.view === 'results') {
        return (
          <BattleResults
            battleId={view.battleId}
            onNavigate={handleNavigate}
            onReturnHome={() => setScreen('home')}
          />
        );
      }
      if (view.view === 'replay') {
        return (
          <BattleReplayScreen
            replayId={view.battleId}
            onNavigate={handleNavigate}
            onReturnHome={() => setScreen('home')}
          />
        );
      }
    }

    if (view.kind !== 'tab') return null;

    switch (view.tab) {
      case 'home':
        return (
          <HomeScreen
            onOpenPlayer={() => setPlayerOpen(true)}
            onOpenArtist={() => setScreen('artist')}
            onOpenBuild={() => setScreen('build')}
            onOpenProfile={(role, name) => setView({ kind: 'profile', role, name })}
            onOpenSongWars={(dest) => {
              if (dest) {
                setView({ kind: 'songwars', view: dest.view, battleId: dest.battleId });
              } else {
                setView({ kind: 'songwars', view: 'hub' });
              }
            }}
            onOpenRouteMe={() => setView({ kind: 'routeMe' })}
          />
        );
      case 'stations':
        return <StationsHub onOpen={openStationsDestination} onOpenBroadcastStudio={(initialTab) => setView({ kind: 'broadcastStudio', initialTab })} />;
      case 'search':
        return <SearchScreen onOpenRouteMe={() => setView({ kind: 'routeMe' })} />;
      case 'library':
        return <LibraryScreen />;
      case 'studio':
        return <StudioScreen onOpenRelease={() => setScreen('release')} onOpenDestination={openStudioDestination} />;
      case 'profile': {
        const isApprovedCreator = hasAnyRole(identity, ['artist', 'producer', 'dj', 'admin', 'owner']);
        if (!isApprovedCreator) {
          return (
            <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-10 flex flex-col items-center justify-center text-center animate-fade-in">
              <GlassCard glow className="max-w-md w-full p-8 space-y-6 relative border border-white/10 bg-black/60">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-black to-cyan-950/15 pointer-events-none rounded-3xl" />
                <div className="flex flex-col items-center gap-3 relative z-10">
                  <div className="h-16 w-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                    <Lock className="h-7 w-7" />
                  </div>
                  <h2 className="text-xl font-black text-white tracking-tight mt-2">Creator Profile Locked</h2>
                  <p className="text-xs text-white/55 max-w-sm leading-relaxed">
                    Tradio profile pages are exclusive to approved artists, beat producers, and radio hosts. Request access to unlock your professional creator channel, customized release portfolio, and live broadcast features.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2 relative z-10">
                  <PrimaryButton
                    className="w-full text-xs font-black uppercase tracking-widest py-3.5"
                    onClick={() => {
                      setTab('studio');
                      setView({ kind: 'tab', tab: 'studio' });
                    }}
                  >
                    Open Access Center
                  </PrimaryButton>
                  <SecondaryButton
                    className="w-full text-xs font-bold uppercase tracking-wider py-3"
                    onClick={() => {
                      setTab('home');
                      setView({ kind: 'tab', tab: 'home' });
                    }}
                  >
                    Back to Home
                  </SecondaryButton>
                </div>
              </GlassCard>
            </div>
          );
        }

        const resolvedRole = identity.active_mode === 'producer'
          ? 'producer'
          : (identity.active_mode === 'dj' || identity.active_mode === 'admin')
            ? 'dj'
            : identity.roles.some(r => r.role === 'artist')
              ? 'artist'
              : identity.roles.some(r => r.role === 'producer')
                ? 'producer'
                : 'dj';

        return (
          <RoleProfilePage
            role={resolvedRole as any}
            ownerView={true}
            onBack={() => {
              setTab('home');
              setView({ kind: 'tab', tab: 'home' });
            }}
            onOpenPublicShell={(r) => setView({ kind: 'profile', role: r === 'dj' ? 'host' : r, name: identity.display_name })}
            onOpenBroadcastStudio={() => setView({ kind: 'broadcastStudio' })}
          />
        );
      }
    }
  };

  return (
    <div className="min-h-dvh w-full overflow-x-hidden bg-gradient-to-b from-[#06050A] via-[#0E071C] to-[#06050A] text-white selection:bg-purple-500/30 selection:text-white">
        {/* Ultra-luxurious organic film noise overlay */}
        <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.022] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

        {/* Luxury ambient background with enhanced glows */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-40 top-0 h-[650px] w-[650px] rounded-full bg-purple-600/15 blur-[180px] opacity-65" />
          <div className="absolute -right-40 top-1/3 h-[600px] w-[650px] rounded-full bg-fuchsia-600/12 blur-[160px] opacity-60" />
          <div className="absolute bottom-0 left-1/2 h-[450px] w-[800px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[180px] opacity-55" />
          <div className="absolute top-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-purple-500/08 blur-[160px]" />
        </div>

        {/* Desktop sidebar */}
        <aside className="!fixed inset-y-0 left-0 z-40 hidden w-[300px] flex-col overflow-y-auto px-6 py-8 lg:flex !border-r border-white/10 shadow-lg">
          <div className="absolute inset-0 -z-10 liquid-glass" />
          <div className="mb-8 flex items-center justify-between rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.01] p-5 shadow-[0_15px_35px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)] hover:border-white/15 transition-all duration-500">
            <div>
              <TradioLogo />
              <div className="mt-1.5 text-xs text-white/55 font-medium leading-relaxed">AI music network for the Trey TV universe</div>
            </div>
            <AIPill />
          </div>

          <div className="mb-6 px-1 animate-fade-in">
            <Link
              to="/"
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.01] py-3 text-xs font-black uppercase tracking-wider text-white/80 transition-all duration-300 hover:border-fuchsia-500/25 hover:bg-white/5 hover:translate-x-1 active:scale-[0.98]"
            >
              <Home className="h-4 w-4 text-fuchsia-400" />
              Back to Trey TV
            </Link>
          </div>

          <nav className="space-y-3">
            {PRIMARY_NAV.filter(nav => nav.key !== 'profile' || hasAnyRole(identity, ['artist', 'producer', 'dj', 'admin', 'owner'])).map(({ key, label, hint, Icon }) => {
              const isActive = tab === key;
              const iconColor = NAV_COLORS[key] || 'text-primary';
              return (
                <button
                  key={key}
                  onClick={() => handleTab(key)}
                  className={`group relative flex items-center gap-3.5 pl-5 pr-3.5 py-3 rounded-2xl transition-all duration-300 w-full text-left hover:translate-x-1.5 border ${
                    isActive
                      ? 'bg-gradient-to-r from-primary/12 to-primary/4 border-primary/25 ring-1 ring-primary/15 shadow-[0_10px_25px_-5px_rgba(245,158,11,0.12)]'
                      : 'border-transparent hover:bg-white/[0.04] hover:border-white/[0.03]'
                  }`}
                >
                  {/* Active glowing indicator pill */}
                  {isActive && (
                    <div className="absolute left-1.5 top-3.5 bottom-3.5 w-[3px] rounded-full bg-primary shadow-[0_0_10px_rgba(245,158,11,0.8)] animate-pulse" />
                  )}
                  <div className={`size-10 rounded-xl grid place-items-center transition-all duration-500 group-hover:scale-105 shrink-0 ${
                    isActive
                      ? 'bg-primary/20 text-primary border border-primary/20 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                      : 'bg-white/[0.03] border border-white/[0.04] text-white/70 group-hover:bg-white/[0.07] group-hover:border-white/10 group-hover:text-white'
                  }`}>
                    <Icon className={`size-5 transition-colors duration-300 ${isActive ? 'text-primary' : 'text-white/60 group-hover:text-white'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-bold tracking-wide transition-colors duration-300 ${isActive ? 'text-primary drop-shadow-[0_0_6px_rgba(245,158,11,0.25)]' : 'text-white/80 group-hover:text-white'}`}>{label}</div>
                    <div className="text-[10px] text-white/40 group-hover:text-white/55 truncate leading-tight mt-0.5 transition-colors duration-300">{hint}</div>
                  </div>
                  {isActive ? (
                    <span className="size-2 rounded-full bg-primary shadow-[0_0_10px_var(--gold)] animate-pulse shrink-0 mr-1" />
                  ) : (
                    <ChevronRight className="size-4 text-white/30 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-white/60 shrink-0" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="group mt-5 flex items-center gap-3.5 rounded-2xl border border-white/[0.06] bg-gradient-to-r from-white/[0.04] to-transparent px-3.5 py-3.5 hover:border-fuchsia-500/20 hover:bg-fuchsia-500/[0.02] hover:shadow-[0_10px_20px_-10px_rgba(217,70,239,0.1)] transition-all duration-500">
            <TradioMessengerBell unreadCount={messengerBridge?.unreadCount ?? 0} onClick={() => messengerBridge?.openPreview()} />
            <button onClick={() => messengerBridge?.openPreview()} className="min-w-0 flex-1 text-left">
              <div className="text-xs font-bold text-white/95 group-hover:text-fuchsia-300 transition-colors duration-300">Trey TV Messenger</div>
              <div className="truncate text-[10px] text-white/40 mt-0.5 group-hover:text-white/55 transition-colors duration-300">Messages live in Trey TV · preview only</div>
            </button>
          </div>

          <div className="mt-5">
            <ModeSwitcher />
          </div>

          <div className="mt-8 space-y-3">
            <div className="px-1 text-[11px] font-bold uppercase tracking-[0.15em] text-white/40">Launch pads</div>
            {FEATURE_SHORTCUTS.map(({ key, label, sub, Icon }) => (
              <button
                key={key}
                onClick={() => setScreen(key)}
                className="group flex w-full items-start gap-3.5 rounded-2xl border border-white/[0.04] bg-gradient-to-br from-white/[0.05] via-white/[0.01] to-transparent p-3.5 text-left transition-all duration-500 hover:translate-x-1.5 hover:border-purple-500/25 hover:bg-purple-500/[0.03] hover:shadow-[0_10px_20px_-10px_rgba(168,85,247,0.15)]"
              >
                <div className="size-9 rounded-xl grid place-items-center bg-white/[0.03] border border-white/[0.04] text-purple-300/80 transition-all duration-500 group-hover:scale-105 group-hover:bg-purple-500/15 group-hover:border-purple-500/25 group-hover:text-purple-200 shrink-0">
                  <Icon className="size-4.5 transition-transform duration-500 group-hover:rotate-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-xs font-bold text-white/85 group-hover:text-purple-200 transition-colors duration-300">{label}</span>
                  <span className="block text-[10px] leading-normal text-white/40 mt-0.5 group-hover:text-white/50 transition-colors duration-300">{sub}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-auto rounded-2xl border border-[oklch(0.65_0.22_300_/_0.4)] bg-[linear-gradient(135deg,oklch(0.25_0.1_300_/_0.6),oklch(0.18_0.05_270_/_0.6))] glow-purple p-4 flex flex-col gap-2 shadow-[0_15px_30px_rgba(168,85,247,0.08)] animate-fade-in">
            <div className="flex items-center gap-2 text-xs font-bold text-[oklch(0.7_0.25_340)]">
              <Sparkles className="h-4 w-4 text-[oklch(0.7_0.25_340)] animate-pulse" /> Desktop Mode Active
            </div>
            <p className="text-[11px] leading-relaxed text-white/60">
              Wider canvas, persistent liquid navigation, and artist tools stay visible while the player remains one tap away.
            </p>
          </div>

          {/* Legal & Operations footer links */}
          <div className="mt-4 border-t border-white/[0.06] pt-4">
            <button onClick={() => openLegal()} className="mb-2 text-[11px] font-bold uppercase tracking-wider text-white/55 transition hover:text-white">Legal & Operations Center</button>
            <LegalFooterLinks onOpen={openLegal} />
          </div>
        </aside>

        {/* Desktop right utility rail */}
        <aside className="!fixed inset-y-0 right-0 z-30 hidden w-[360px] flex-col gap-5 overflow-y-auto p-6 xl:flex !border-l border-white/10 shadow-lg">
          <div className="absolute inset-0 -z-10 liquid-glass" />
          <GlassCard glow className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-white">Now on Tradio</div>
                <div className="text-[11px] text-white/50">Persistent desktop player</div>
              </div>
              <span className="rounded-full border border-pink-500/30 bg-gradient-to-r from-pink-500/15 to-pink-500/3 px-3 py-1.5 text-[10px] font-bold text-pink-300 animate-pulse shadow-[0_0_15px_rgba(236,72,153,0.2)]">LIVE</span>
            </div>
            <MiniPlayer onOpen={() => setPlayerOpen(true)} className="px-0 pb-0" />
          </GlassCard>

          <GlassCard className="p-5">
            <div className="mb-4 text-sm font-semibold text-white">Screen Map</div>
            <div className="grid grid-cols-2 gap-2.5">
              {SCREEN_LABELS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setScreen(s.key)}
                  className="rounded-2xl border border-white/[0.04] bg-gradient-to-b from-white/[0.04] to-transparent p-3.5 text-left transition-all duration-500 hover:border-purple-500/25 hover:bg-purple-500/[0.04] hover:shadow-[0_8px_20px_-8px_rgba(168,85,247,0.25)] hover:-translate-y-[1px]"
                >
                  <span className="block text-xs font-semibold text-white">{s.label}</span>
                  <span className="mt-1 block text-[10px] text-white/45">{s.group}</span>
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="overflow-hidden p-5">
            <div className="text-sm font-semibold text-white">Release Pulse</div>
            <div className="mt-5 space-y-3">
              {[
                ['Live listeners', '18.4K', '+22%'],
                ['Instant drops', '47', '+9%'],
                ['Fan saves', '92.1K', '+31%'],
              ].map(([label, value, delta]) => (
                <div key={label} className="flex items-center justify-between rounded-2xl border border-white/[0.04] bg-gradient-to-br from-white/[0.03] to-transparent p-3.5 hover:border-white/12 hover:bg-white/[0.05] hover:shadow-[0_8px_20px_rgba(0,0,0,0.25)] transition-all duration-500 hover:-translate-y-[1px]">
                  <div>
                    <div className="text-[11px] text-white/50">{label}</div>
                    <div className="text-xl font-bold text-white mt-1">{value}</div>
                  </div>
                  <div className="rounded-full bg-gradient-to-b from-emerald-500/15 to-emerald-500/2 px-3 py-1.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/10">{delta}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </aside>

        <main className="relative flex min-h-dvh w-full flex-col lg:pl-[300px] xl:pr-[360px]">
          {/* Universal Mobile Top Bar */}
          <header className="sticky top-0 z-40 flex h-14 w-full shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#06050a]/80 px-4 backdrop-blur-xl lg:hidden">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-tradio-nav'));
                  document.dispatchEvent(new CustomEvent('open-tradio-nav'));
                }}
                className="group relative flex h-8 w-8 items-center justify-center select-none active:scale-95 transition-all duration-300"
              >
                <span className="absolute inset-0 rounded-full bg-purple-500/25 blur-md animate-pulse-orb-slow" />
                <div className="relative h-8 w-8">
                  <img
                    alt="Prescription Radio"
                    className="h-full w-full object-contain pointer-events-none [filter:drop-shadow(0_0_8px_rgba(176,38,255,0.55))] transition-transform duration-700 animate-slow-spin group-hover:scale-110 group-hover:animate-orb-spin"
                    src={aiBallCutout}
                  />
                </div>
              </button>
              <span className="text-sm font-black uppercase tracking-wider bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">Tradio</span>
            </div>

            <Link
              to="/"
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white/90 active:scale-95 transition-transform"
            >
              <Home className="h-3.5 w-3.5 text-fuchsia-400" />
              Trey TV
            </Link>
          </header>

          <div ref={mainScrollRef} className="tradio-responsive-main flex-1 overflow-y-auto pb-[calc(13rem_+_env(safe-area-inset-bottom))] lg:pb-12">
            <TradioLiveNowBar />
            {renderScreen()}
          </div>

          {/* Mobile mini player + bottom nav stack */}
          <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
            {/* Deluxe tactile ambient shroud behind floating player & navigation */}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#06050A] via-[#06050A]/80 to-transparent backdrop-blur-[1px]" />
            <div className="relative">
              <MiniPlayer onOpen={() => setPlayerOpen(true)} />
              <BottomNav
              active={tab}
              onChange={handleTab}
              onOpenForge={() => setView({ kind: 'build' })}
              onOpenScreens={() => setNavOpen(true)}
              onSetScreen={(key) => setScreen(key as ScreenKey)}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              currentMode={currentMode as any}
              currentRoleLabel={currentRoleLabel}
            />
            </div>
          </div>

          {/* Now playing modal */}
          {playerOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-[#050508]/98 backdrop-blur-3xl animate-fade-in">
              <div className="w-full min-h-screen">
                <NowPlayingScreen onClose={() => setPlayerOpen(false)} />
              </div>
            </div>
          )}

          {/* Mobile nav drawer with all screens */}
          {navOpen && (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-xl lg:hidden animate-fade-in" onClick={() => setNavOpen(false)}>
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-full rounded-t-[32px] border border-white/10 liquid-glass !bg-none p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-premium-lg animate-scale-in"
              >
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <div className="text-xl font-bold bg-gradient-to-r from-fuchsia-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_6px_rgba(168,85,247,0.25)]">All Screens</div>
                    <div className="text-xs text-white/50 mt-1">Jump to any Tradio module</div>
                  </div>
                  <button onClick={() => setNavOpen(false)} aria-label="Close" className="size-9 grid place-items-center rounded-full glass shrink-0 transition-transform active:scale-95">
                    <X className="size-5 text-white" />
                  </button>
                </div>
                <div className="mb-4">
                  <Link
                    to="/"
                    onClick={() => setNavOpen(false)}
                    className="group flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300 hover:translate-x-1 hover:bg-white/5 border border-white/10 liquid-glass"
                  >
                    <div className="size-10 rounded-xl overflow-hidden grid place-items-center bg-white/5 transition-transform group-hover:scale-110">
                      <Home className="size-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white">Back to Trey TV</div>
                      <div className="text-xs text-muted-foreground truncate">Return to streaming home</div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-[50vh] overflow-y-auto pr-1">
                  {SCREEN_LABELS.map((s) => {
                    const Icon = SCREEN_ICONS[s.key] || Radio;
                    const isCurrent = tab === s.key || (view.kind === s.key) || (view.kind === 'tab' && view.tab === s.key);
                    const themeColor = SCREEN_COLORS[s.key] || 'text-white/70';
                    return (
                      <button
                        key={s.key}
                        onClick={() => setScreen(s.key)}
                        className={`group flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-300 hover:translate-x-1 text-left ${
                          isCurrent
                            ? 'bg-primary/10 ring-1 ring-primary/40 glow-gold border border-primary/20'
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className={`size-10 rounded-xl overflow-hidden grid place-items-center bg-white/5 transition-transform group-hover:scale-110 shrink-0 ${
                          isCurrent ? 'shadow-[0_0_12px_var(--gold)]' : ''
                        }`}>
                          <Icon className={`size-5 ${themeColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-semibold truncate ${isCurrent ? 'text-primary' : 'text-white'}`}>
                            {s.label}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">{s.group} Module</div>
                        </div>
                        {isCurrent ? (
                          <span className="size-2 rounded-full bg-primary shadow-[0_0_8px_var(--gold)] animate-glow-pulse" />
                        ) : (
                          <ChevronRight className="size-4 text-muted-foreground/50 transition-transform group-hover:translate-x-1" />
                        )}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => { setPlayerOpen(true); setNavOpen(false); }}
                    className="group flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-300 hover:translate-x-1 text-left border border-transparent hover:bg-white/5"
                  >
                    <div className="size-10 rounded-xl overflow-hidden grid place-items-center bg-white/5 transition-transform group-hover:scale-110 shrink-0">
                      <Disc className="size-5 text-[#D946EF] animate-slow-spin" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white">Now Playing</div>
                      <div className="text-xs text-muted-foreground truncate">Music Control</div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/50 transition-transform group-hover:translate-x-1" />
                  </button>
                  <button
                    onClick={() => openLegal()}
                    className="group flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-300 hover:translate-x-1 text-left border border-transparent hover:bg-white/5"
                  >
                    <div className="size-10 rounded-xl overflow-hidden grid place-items-center bg-white/5 transition-transform group-hover:scale-110 shrink-0">
                      <BookOpen className="size-5 text-[oklch(0.82_0.15_215)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white">Legal Center</div>
                      <div className="text-xs text-muted-foreground truncate">Policies & requests</div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/50 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
                {/* Legal footer links */}
                <div className="mt-5 border-t border-white/8 pt-4">
                  <LegalFooterLinks onOpen={openLegal} />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  };

export const TradioShell: React.FC = () => {
  return (
    <PlayerProvider>
      <TradioIdentityProvider>
        <AccessRequestsProvider>
          <MessengerBridgeProvider>
            <TradioShellContent />
          </MessengerBridgeProvider>
        </AccessRequestsProvider>
      </TradioIdentityProvider>
    </PlayerProvider>
  );
};

export default TradioShell;

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
} from 'lucide-react';
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
import ShowBuilderScreen from './screens/ShowBuilder';
import BroadcastStudioGateway from './screens/BroadcastStudioGateway';
import RouteMePage from '../route-me/RouteMePage';
import { ProfileScreen } from './screens/ProfileScreen';
import { RoleProfilePage } from './screens/RoleProfilePage';
import type { RoleProfileType } from './auth/roleProfile';
import { LegalCenter } from './legal/LegalCenter';
import LegalAdminDashboard from './legal/LegalAdminDashboard';
import { LegalFooterLinks } from './legal/LegalPrimitives';
import { PlayerProvider } from '@/tradio/contexts/PlayerContext';
import { GlassCard, TradioLogo, Waveform } from './ui';
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
  const { currentMode, currentRoleLabel } = useTradioIdentity();
  const messengerBridge = useMessengerBridge();
  const [tab, setTab] = useState<TabKey>('home');
  const [view, setView] = useState<View>({ kind: 'tab', tab: 'home' });
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
      case 'profile':
        return (
          <ProfileScreen
            role="artist"
            name="Trey Trizzy"
            onBack={() => {
              setTab('home');
              setView({ kind: 'tab', tab: 'home' });
            }}
          />
        );
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
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[300px] flex-col overflow-y-auto border-r border-white/[0.06] bg-gradient-to-b from-[#08070d]/85 via-[#0C0B14]/75 to-[#06050a]/90 px-6 py-8 backdrop-blur-[40px] lg:flex">
          <div className="mb-8 flex items-center justify-between rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.01] p-5 shadow-[0_15px_35px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)] hover:border-white/15 transition-all duration-500">
            <div>
              <TradioLogo />
              <div className="mt-1.5 text-xs text-white/55 font-medium leading-relaxed">AI music network for the Trey TV universe</div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/5 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <Waveform className="h-5 w-5" bars={5} color="from-fuchsia-400 to-cyan-400" />
            </div>
          </div>

          <nav className="space-y-3">
            {PRIMARY_NAV.map(({ key, label, hint, Icon }) => {
              const isActive = tab === key;
              return (
                <button
                  key={key}
                  onClick={() => handleTab(key)}
                  className={`relative flex w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left transition-all duration-300 group ${
                    isActive
                      ? 'border-purple-500/25 bg-gradient-to-r from-purple-500/12 via-purple-500/4 to-transparent text-white shadow-[0_8px_30px_rgba(168,85,247,0.08),inset_0_1px_0_rgba(255,255,255,0.08)]'
                      : 'border-white/[0.04] bg-gradient-to-br from-white/[0.04] to-transparent text-white/70 hover:border-white/12 hover:bg-gradient-to-br hover:from-white/[0.08] hover:to-white/[0.02] hover:text-white hover:translate-x-[2px]'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/4 bottom-1/4 w-[3px] rounded-r-full bg-gradient-to-b from-fuchsia-400 to-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
                  )}
                  <span className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-500 ${isActive ? 'bg-gradient-to-br from-purple-500/25 to-purple-500/5 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.3)] border border-purple-500/20' : 'bg-gradient-to-br from-white/8 to-white/2 text-white/60 group-hover:scale-105'}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{label}</span>
                    <span className="block truncate text-[11px] text-white/50">{hint}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
            <TradioMessengerBell unreadCount={messengerBridge?.unreadCount ?? 0} onClick={() => messengerBridge?.openPreview()} />
            <button onClick={() => messengerBridge?.openPreview()} className="min-w-0 flex-1 text-left">
              <div className="text-sm font-bold text-white">Trey TV Messenger</div>
              <div className="truncate text-[10px] text-white/45">Messages live in Trey TV · preview only</div>
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
                className="flex w-full items-start gap-3 rounded-2xl border border-white/[0.04] bg-gradient-to-br from-white/[0.04] via-white/[0.01] to-transparent p-4 text-left transition-all duration-500 hover:border-purple-500/25 hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-purple-500/2 hover:translate-x-[2px]"
              >
                <Icon className="mt-1 h-5 w-5 text-purple-300" />
                <span>
                  <span className="block text-xs font-semibold text-white">{label}</span>
                  <span className="block text-[10px] leading-snug text-white/45">{sub}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="mt-auto rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-cyan-500/3 to-transparent p-5 shadow-[0_15px_30px_rgba(6,182,212,0.05),inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
              <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" /> Desktop mode active
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-white/50">
              Wider canvas, persistent navigation, and artist controls stay visible while the player remains one tap away.
            </p>
          </div>

          {/* Legal & Operations footer links */}
          <div className="mt-4 border-t border-white/[0.06] pt-4">
            <button onClick={() => openLegal()} className="mb-2 text-[11px] font-bold uppercase tracking-wider text-white/55 transition hover:text-white">Legal & Operations Center</button>
            <LegalFooterLinks onOpen={openLegal} />
          </div>
        </aside>

        {/* Desktop right utility rail */}
        <aside className="fixed inset-y-0 right-0 z-30 hidden w-[360px] flex-col gap-5 overflow-y-auto border-l border-white/[0.06] bg-gradient-to-b from-[#08070d]/80 via-[#0C0B14]/70 to-[#06050a]/90 p-6 backdrop-blur-[40px] xl:flex">
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
            <div className="grid grid-cols-2 gap-3">
              {SCREEN_LABELS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setScreen(s.key)}
                  className="rounded-2xl border border-white/[0.05] bg-gradient-to-b from-white/[0.04] to-transparent p-4 text-left transition-all duration-500 hover:border-purple-500/25 hover:bg-gradient-to-b hover:from-purple-500/8 hover:to-transparent hover:translate-y-[-1px]"
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
                <div key={label} className="flex items-center justify-between rounded-2xl border border-white/[0.05] bg-gradient-to-b from-white/[0.04] to-transparent p-4 hover:border-white/15 transition-all duration-500 hover:translate-y-[-1px]">
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
          <div ref={mainScrollRef} className="tradio-responsive-main flex-1 overflow-y-auto pb-[calc(13rem_+_env(safe-area-inset-bottom))] lg:pb-12">
            {renderScreen()}
          </div>

          {/* Mobile mini player + bottom nav stack */}
          <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
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
                className="w-full rounded-t-[32px] border border-white/10 bg-gradient-to-b from-black/60 via-black/50 to-black/70 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] backdrop-blur-2xl shadow-premium-lg animate-scale-in"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <div className="text-xl font-bold text-white">All Screens</div>
                    <div className="text-xs text-white/50">Jump to any Tradio module</div>
                  </div>
                  <button onClick={() => setNavOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-gradient-to-br from-white/8 to-white/2 hover:border-white/20 transition-all duration-300">
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {SCREEN_LABELS.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setScreen(s.key)}
                      className="rounded-2xl border border-white/8 bg-gradient-to-br from-white/[0.06] to-white/[0.01] p-4 text-left text-sm font-semibold text-white hover:border-white/12 hover:bg-gradient-to-br hover:from-white/[0.08] hover:to-white/[0.02] transition-all duration-300"
                    >
                      <span className="block">{s.label}</span>
                      <span className="mt-1 block text-[10px] text-white/45">{s.group}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => { setPlayerOpen(true); setNavOpen(false); }}
                    className="rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-500/20 to-purple-500/5 p-4 text-left text-sm font-semibold text-purple-200 hover:border-purple-400/50 hover:bg-gradient-to-br hover:from-purple-500/30 hover:to-purple-500/10 transition-all duration-300"
                  >
                    Now Playing
                  </button>
                  <button
                    onClick={() => openLegal()}
                    className="rounded-2xl border border-cyan-400/25 bg-gradient-to-br from-cyan-500/15 to-cyan-500/5 p-4 text-left text-sm font-semibold text-cyan-100 hover:border-cyan-400/40 transition-all duration-300"
                  >
                    <span className="block">Legal Center</span>
                    <span className="mt-1 block text-[10px] text-white/45">Policies & requests</span>
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

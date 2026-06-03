import React from "react";
import { TVProvider, useTV, type Screen } from "@/features/tv-shell/TVContext";
import { HomeScreen } from "@/features/tv-shell/screens/HomeScreen";
import { ActivationScreen } from "@/features/tv-shell/screens/ActivationScreen";
import { GuideScreen } from "@/features/tv-shell/screens/GuideScreen";
import { DetailScreen } from "@/features/tv-shell/screens/DetailScreen";
import { PlayerScreen } from "@/features/tv-shell/screens/PlayerScreen";
import { GamesScreen } from "@/features/tv-shell/screens/GamesScreen";
import { SpadesScreen } from "@/features/tv-shell/screens/SpadesScreen";
import { StoriesScreen } from "@/features/tv-shell/screens/StoriesScreen";
import { CreatorScreen } from "@/features/tv-shell/screens/CreatorScreen";
import { ProfileScreen } from "@/features/tv-shell/screens/ProfileScreen";
import { SettingsScreen } from "@/features/tv-shell/screens/SettingsScreen";
import {
  BrowseScreen,
  MusicScreen,
  MyListScreen,
  PremiumScreen,
  SearchScreen,
  SourceHubScreen,
  WatchPartiesScreen,
} from "@/features/tv-shell/screens/LibraryScreens";
import { FocusManager, SpatialFocusRing } from "@/features/tv-shell/components/FocusManager";
import { FocusButton, GlassPanel } from "@/features/tv-shell/components/Primitives";

// Quick-jump dev pill: development only. It is hidden from production builds.
const DevSwitcher: React.FC = () => {
  const { screen, navigate } = useTV();
  const screens: { id: Screen; label: string }[] = [
    { id: "home", label: "Home" },
    { id: "activate", label: "Activate" },
    { id: "guide", label: "Guide" },
    { id: "detail", label: "Detail" },
    { id: "player", label: "Player" },
    { id: "games", label: "Games" },
    { id: "spades", label: "Spades" },
    { id: "stories", label: "Stories" },
    { id: "creator", label: "Creator" },
    { id: "profile", label: "Profile" },
    { id: "settings", label: "Settings" },
    { id: "search", label: "Search" },
    { id: "browse", label: "Browse" },
    { id: "my-list", label: "My List" },
    { id: "music", label: "Music" },
    { id: "premium", label: "Premium" },
  ];
  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 flex flex-wrap gap-1 px-3 py-2 rounded-full bg-black/80 backdrop-blur-md border border-fuchsia-500/30 shadow-[0_0_30px_rgba(255,43,214,0.35)]">
      {screens.map((s) => (
        <button
          key={s.id}
          onClick={() => navigate(s.id)}
          className={
            "px-3 py-1 rounded-full text-xs font-bold outline-none transition-all " +
            (screen === s.id
              ? "bg-fuchsia-500 text-white shadow-[0_0_12px_rgba(255,43,214,0.7)]"
              : "text-white/70 hover:text-white focus:bg-white/10")
          }
        >
          {s.label}
        </button>
      ))}
    </div>
  );
};

const ScreenSwitch: React.FC = () => {
  const { screen } = useTV();
  switch (screen) {
    case "home":
      return <HomeScreen />;
    case "activate":
      return <ActivationScreen />;
    case "guide":
      return <GuideScreen />;
    case "detail":
      return <DetailScreen />;
    case "player":
      return <PlayerScreen />;
    case "games":
      return <GamesScreen />;
    case "spades":
      return <SpadesScreen />;
    case "stories":
      return <StoriesScreen />;
    case "creator":
      return <CreatorScreen />;
    case "profile":
      return <ProfileScreen />;
    case "settings":
      return <SettingsScreen />;
    case "search":
      return <SearchScreen />;
    case "browse":
      return <BrowseScreen />;
    case "my-list":
      return <MyListScreen />;
    case "music":
      return <MusicScreen />;
    case "premium":
      return <PremiumScreen />;
    case "watch-parties":
      return <WatchPartiesScreen />;
    case "source-hub":
      return <SourceHubScreen />;
    default:
      return <HomeScreen />;
  }
};

type ErrorBoundaryState = { error: Error | null };

class TvShellErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("[Trey TV shell] startup/render failure", error, info.componentStack);
    }
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="dark grid min-h-screen place-items-center bg-[#05050A] p-10 text-white">
        <GlassPanel className="max-w-2xl p-8 text-center">
          <div className="text-sm font-black tracking-[0.3em] text-amber-300">SAFE MODE</div>
          <h1 className="mt-3 text-4xl font-black">Trey TV couldn't open this screen</h1>
          <p className="mt-3 text-white/65">
            The shell caught a startup error and stayed open so you can recover.
          </p>
          {import.meta.env.DEV && (
            <pre className="mt-5 max-h-40 overflow-auto rounded-xl bg-black/60 p-4 text-left text-xs text-amber-100">
              {this.state.error.message}
            </pre>
          )}
          <FocusButton
            variant="primary"
            className="mt-6"
            autoFocus
            onClick={() => this.setState({ error: null })}
          >
            Return to Trey TV
          </FocusButton>
        </GlassPanel>
      </div>
    );
  }
}

const AppLayout: React.FC = () => {
  return (
    <TVProvider>
      <TvShellErrorBoundary>
        <div className="dark min-h-screen bg-[#05050A] text-white">
          {/* Global remote / keyboard / gamepad navigation */}
          <FocusManager />
          {/* Neon spatial focus ring that tracks :focus */}
          <SpatialFocusRing />
          <ScreenSwitch />
          {import.meta.env.DEV && <DevSwitcher />}
        </div>
      </TvShellErrorBoundary>
    </TVProvider>
  );
};

export default AppLayout;

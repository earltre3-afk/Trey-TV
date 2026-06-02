import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  Search,
  Library,
  Radio,
  Sparkles,
  X,
  Sliders,
  Activity,
  Check,
  Play,
  Volume2,
  User
} from 'lucide-react';
import { usePlayer } from '@/tradio/contexts/PlayerContext';
import { useTradioIdentity } from './auth/useTradioIdentity';
import { hasAnyRole } from './auth/roleUtils';
import { TRACKS, IMG } from './data';
import aiBallCutout from '@/tradio/assets/ai-ball.png';
import { PrescriptionRadioPopover } from './prescribeMe/PrescriptionRadioPopover';
import type { TradioMode } from './prescribeMe/prescribeMeTypes';

export type TabKey = 'home' | 'stations' | 'search' | 'library' | 'studio' | 'profile';

const StudioIcon = ({ className = '' }: { className?: string }) => (
  <div className={`flex items-end gap-[2px] ${className}`}>
    {[40, 80, 100, 60, 90, 50].map((h, i) => (
      <span key={i} className="w-[2px] rounded-full bg-current" style={{ height: `${h}%` }} />
    ))}
  </div>
);

const TABS: { key: TabKey; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { key: 'home', label: 'Home', Icon: ({ className }) => <Home className={className} /> },
  { key: 'stations', label: 'Stations', Icon: ({ className }) => <Radio className={className} /> },
  { key: 'search', label: 'Search', Icon: ({ className }) => <Search className={className} /> },
  { key: 'studio', label: 'Studio', Icon: StudioIcon },
  { key: 'library', label: 'Library', Icon: ({ className }) => <Library className={className} /> },
  { key: 'profile', label: 'My Profile', Icon: ({ className }) => <User className={className} /> },
];

export const BottomNav: React.FC<{
  active: TabKey;
  onChange: (t: TabKey) => void;
  onOpenForge?: () => void;
  onOpenScreens?: () => void;
  onSetScreen?: (key: string) => void;
  currentMode?: TradioMode;
  currentRoleLabel?: string;
}> = ({
  active,
  onChange,
  onOpenForge,
  onOpenScreens,
  onSetScreen,
  currentMode = 'fan',
  currentRoleLabel = 'Listener',
}) => {
  const { playStation, currentTrack, isPlaying } = usePlayer();
  const { identity } = useTradioIdentity();

  // Luxurious Popout state
  const [showPopout, setShowPopout] = useState(false);
  
  // Long-press hold state
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);

  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isHoldingRef = useRef(false);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  // Listen for external open popout triggers
  useEffect(() => {
    const handleOpenPopout = () => setShowPopout(true);
    window.addEventListener('open-prescription-popout', handleOpenPopout);
    return () => {
      window.removeEventListener('open-prescription-popout', handleOpenPopout);
    };
  }, []);

  const startHold = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent default context menu triggers
    if (showPopout) return;

    isHoldingRef.current = true;
    setIsHolding(true);
    setHoldProgress(0);

    const startTime = Date.now();
    const duration = 650; // Deluxe deliberate hold duration

    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setHoldProgress(pct);
      if (pct >= 100) {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      }
    }, 16);

    holdTimerRef.current = setTimeout(() => {
      // Hold complete - trigger luxurious premium integrated popout menu!
      setShowPopout(true);
      setIsHolding(false);
      isHoldingRef.current = false;
      setHoldProgress(0);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

      // Vibrate if mobile supports it
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(15);
      }
    }, duration);
  };

  const endHold = (e: React.MouseEvent | React.TouchEvent, isClick: boolean) => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    if (isHoldingRef.current) {
      isHoldingRef.current = false;
      setIsHolding(false);
      setHoldProgress(0);

      if (isClick) {
        // Simple fast click/tap triggers normal live Prescription play!
        playStation({
          id: 'ai-radio-for-you',
          type: 'station',
          label: 'AI Station',
          title: 'Prescription Radio For You',
          subtitle: 'Personal live mix',
          image: IMG.aiSphere,
          isLive: true,
          listenerCount: 18400,
        });
      }
    }
  };

  const hasProfileAccess = hasAnyRole(identity, ['artist', 'producer', 'dj', 'admin', 'owner']);
  const leftTabs = TABS.slice(0, 3);
  const rightTabs = TABS.slice(3).filter((t) => t.key !== 'profile' || hasProfileAccess);

  const renderTabButton = ({ key, label, Icon }: typeof TABS[number]) => {
    const isActive = active === key;
    return (
      <button
        key={key}
        onClick={() => onChange(key)}
        className="relative flex flex-1 flex-col items-center gap-1.5 py-2 transition-all duration-300 group"
      >
        {isActive && (
          <span className="absolute -top-3 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-gradient-to-r from-fuchsia-400 via-purple-500 to-cyan-400 shadow-[0_0_20px_rgba(176,38,255,0.8)]" />
        )}
        <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
          isActive ? 'bg-gradient-to-br from-purple-500/20 to-purple-500/3 border border-purple-500/20 shadow-[0_4px_15px_rgba(168,85,247,0.15)]' : 'group-hover:bg-white/5'
        }`}>
          <Icon
            className={`h-5 w-5 transition-colors duration-300 ${
              isActive ? 'text-purple-300' : 'text-white/60 group-hover:text-white/80'
            }`}
          />
        </div>
        <span
          className={`text-[10px] font-medium transition-colors duration-300 ${
            isActive ? 'text-purple-300' : 'text-white/55 group-hover:text-white/75'
          }`}
        >
          {label}
        </span>
      </button>
    );
  };

  const isAiPlaying = isPlaying && currentTrack?.id === 'ai-radio-for-you-live-signal';

  return (
    <div className="px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4 relative">
      {/* Luxurious Popout */}
      {showPopout && (
        <PrescriptionRadioPopover
          onClose={() => setShowPopout(false)}
          currentMode={currentMode}
          currentRoleLabel={currentRoleLabel}
          onOpenForge={onOpenForge}
          onSetScreen={onSetScreen}
        />
      )}

      {/* Main Nav Bar Grid */}
      <div className="relative flex items-end justify-between rounded-3xl border border-white/[0.08] bg-[#08070d]/85 backdrop-blur-[32px] px-2 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.08)] sm:px-3 sm:py-3.5">

        {leftTabs.map(renderTabButton)}

        {/* Prescription Radio center orb tab */}
        <button
          onMouseDown={startHold}
          onMouseUp={(e) => endHold(e, true)}
          onMouseLeave={(e) => endHold(e, false)}
          onTouchStart={(e) => {
            // Keep normal scrolling but prevent zoom double tap and default click delay
            startHold(e);
          }}
          onTouchEnd={(e) => {
            endHold(e, true);
          }}
          onTouchCancel={(e) => {
            endHold(e, false);
          }}
          className="group relative flex flex-1 flex-col items-center gap-1.5 py-2 select-none transition-all duration-300"
        >
          <div className="relative flex h-10 w-10 items-center justify-center">
            {/* Soft pulsing aura */}
            <span className="absolute inset-0 rounded-full bg-purple-500/25 blur-lg animate-pulse-orb-slow" />

            {/* Expanding signal ring while live */}
            {isAiPlaying && !isHolding && (
              <span className="absolute inset-0 rounded-full border border-cyan-300/40 animate-wave-expand animate-pulse-orb z-0" />
            )}

            {/* Interactive Hold Circular Ring */}
            {isHolding && (
              <svg className="absolute h-12 w-12 -rotate-90 pointer-events-none z-20">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="2"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="url(#hold-gradient)"
                  strokeWidth="2"
                  strokeDasharray={2 * Math.PI * 20}
                  strokeDashoffset={2 * Math.PI * 20 - (holdProgress / 100) * (2 * Math.PI * 20)}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="hold-gradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#d946ef" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
              </svg>
            )}

            {/* The ball — background-removed cutout, just the glowing sphere */}
            <div className="relative h-10 w-10 z-10">
              <img
                src={aiBallCutout}
                alt="Prescription Radio"
                className={`h-full w-full object-contain pointer-events-none [filter:drop-shadow(0_0_8px_rgba(176,38,255,0.55))] transition-transform duration-700 ${
                  isHolding ? 'scale-[0.82]' : ''
                } ${
                  isAiPlaying ? 'animate-orb-spin' : 'animate-slow-spin group-hover:scale-110 group-hover:animate-orb-spin'
                }`}
              />
            </div>
          </div>
          <span className="text-[10px] font-medium text-purple-300 transition-colors group-hover:text-white">
            Prescription Radio
          </span>
        </button>

        {rightTabs.map(renderTabButton)}

      </div>
    </div>
  );
};

export default BottomNav;

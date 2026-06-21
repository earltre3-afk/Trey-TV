import React, { Suspense, lazy, useEffect } from 'react';
import { useSaved } from '@/contexts/SavedContext';
import { useTradioDataState } from '@/contexts/TradioDataContext';
import { usePlayer } from '@/tradio/PlayerContext';
import MobileTradioApp from '@/tradio/mobile/MobileTradioApp';
import { DeviceMode, DeviceModeProvider } from './DeviceModeProvider';
import { TradioProvider } from './TradioProvider';

const TVTradioApp = lazy(() => import('@/tradio/tv/TVTradioApp'));

export interface TradioPlatformProps {
  deviceMode?: DeviceMode;
}

function inferDeviceMode(): DeviceMode {
  if (typeof window === 'undefined') return 'web';
  const params = new URLSearchParams(window.location.search);
  const requested = params.get('device') ?? params.get('mode');
  if (requested === 'tv' || requested === 'mobile' || requested === 'web') return requested;

  const shellMode = (window as Window & { __TREY_TV_DEVICE_MODE__?: DeviceMode })
    .__TREY_TV_DEVICE_MODE__;
  if (shellMode === 'tv' || shellMode === 'mobile' || shellMode === 'web') return shellMode;

  const userAgent = window.navigator.userAgent;
  if (
    /Android TV|GoogleTV|SMART-TV|SmartTV|HbbTV|AFT[A-Z0-9]*|TV;/i.test(userAgent) ||
    window.location.pathname.startsWith('/tv') ||
    window.location.pathname.includes('/tradio-tv')
  ) {
    return 'tv';
  }
  return window.innerWidth < 768 ? 'mobile' : 'web';
}

function PlaybackActivityBridge() {
  const { current, activeCastDevice, isCasting } = usePlayer();
  const { recordRecentlyPlayed } = useSaved();
  const { setTvCastSession } = useTradioDataState();
  const currentTrackKey = current
    ? `${current.id}:${current.title}:${current.artist ?? ''}`
    : null;

  useEffect(() => {
    if (current) recordRecentlyPlayed(current);
  }, [currentTrackKey, recordRecentlyPlayed]);

  useEffect(() => {
    if (!isCasting || !activeCastDevice) {
      setTvCastSession(null);
      return;
    }
    setTvCastSession({
      deviceId: activeCastDevice,
      deviceName: 'Trey TV',
      status: 'connected',
      currentItemId: current?.id,
      updatedAt: new Date().toISOString(),
    });
  }, [activeCastDevice, current?.id, isCasting, setTvCastSession]);

  return null;
}

export default function TradioPlatform({ deviceMode }: TradioPlatformProps) {
  const mode = deviceMode ?? inferDeviceMode();

  return (
    <DeviceModeProvider mode={mode}>
      <TradioProvider>
        <PlaybackActivityBridge />
        {mode !== 'tv' ? <MobileTradioApp /> : (
          <Suspense
            fallback={
              <div
                className="min-h-screen bg-[radial-gradient(circle_at_top,#29104f_0%,#090713_48%,#030307_100%)]"
                aria-label="Opening Tradio TV"
              />
            }
          >
            <TVTradioApp />
          </Suspense>
        )}
      </TradioProvider>
    </DeviceModeProvider>
  );
}

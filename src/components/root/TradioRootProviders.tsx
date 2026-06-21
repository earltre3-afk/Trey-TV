import { Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth";
import { SupabaseSessionProvider } from "@/lib/supabase-session";
import { AudioDuckingProvider, useAudioDucking } from "@/tradio/contexts/AudioDuckingProvider";
import {
  MediaInterruptionProvider,
  useMediaInterruption,
} from "@/tradio/contexts/MediaInterruptionProvider";
import { PlayerProvider, usePlayer } from "@/tradio/contexts/PlayerContext";
import { setMediaInterruptionCallbacks } from "@/tradio/lib/mediaInterruptionHelper";
import { setNotificationDuckingCallbacks } from "@/tradio/lib/notificationDuckingHelper";

export function TradioRootProviders() {
  return (
    <MediaInterruptionProvider>
      <AudioDuckingProvider>
        <PlayerProvider>
          <SupabaseSessionProvider>
            <AuthProvider>
              <Outlet />
              <NotificationDuckingWirer />
              <MediaInterruptionWirer />
              <Toaster />
            </AuthProvider>
          </SupabaseSessionProvider>
        </PlayerProvider>
      </AudioDuckingProvider>
    </MediaInterruptionProvider>
  );
}

function NotificationDuckingWirer() {
  const { beginDuck, endDuck } = useAudioDucking();

  useEffect(() => {
    setNotificationDuckingCallbacks(
      () => beginDuck("notification"),
      () => endDuck("notification"),
    );
    return () => {
      setNotificationDuckingCallbacks(null, null);
    };
  }, [beginDuck, endDuck]);

  return null;
}

function MediaInterruptionWirer() {
  const { beginInterruption, endInterruption, isInterrupted } = useMediaInterruption();
  const {
    pause,
    resume,
    isPlaying,
    isMounted,
    wasAutoPausedByInterruption,
    setWasAutoPausedByInterruption,
  } = usePlayer();

  useEffect(() => {
    setMediaInterruptionCallbacks(
      (reason) => {
        if (isPlaying && !wasAutoPausedByInterruption) {
          setWasAutoPausedByInterruption(true);
          pause();
        }
        beginInterruption(reason);
      },
      (reason) => {
        endInterruption(reason);
      },
    );
    return () => {
      setMediaInterruptionCallbacks(null, null);
    };
  }, [
    beginInterruption,
    endInterruption,
    isPlaying,
    pause,
    wasAutoPausedByInterruption,
    setWasAutoPausedByInterruption,
  ]);

  useEffect(() => {
    if (!isInterrupted && wasAutoPausedByInterruption && isMounted) {
      setWasAutoPausedByInterruption(false);
      resume();
    }
  }, [isInterrupted, wasAutoPausedByInterruption, isMounted, resume, setWasAutoPausedByInterruption]);

  return null;
}

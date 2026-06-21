import { Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { TreyIWidget } from "@/components/ai/TreyIWidget";
import { CurrentUserSync } from "@/components/CurrentUserSync";
import { FoldableLayoutManager } from "@/components/foldable/FoldableLayoutManager";
import { GiftBurstHost } from "@/components/gifts/GiftBurst";
import { BottomNav } from "@/components/layout/BottomNav";
import { CreateBubbleArc } from "@/components/layout/CreateBubbleArc";
import { Toaster } from "@/components/ui/sonner";
import { useAccentColor } from "@/hooks/use-accent-color";
import { ActivityProvider } from "@/lib/activity-store";
import { AuthProvider, useAuth } from "@/lib/auth";
import { CommentsProvider } from "@/lib/comments-store";
import { CreateArcProvider } from "@/lib/create-arc-context";
import { FeedProvider } from "@/lib/feed-store";
import { FollowProvider } from "@/lib/follow-store";
import { GuideProvider } from "@/lib/guide-store";
import { MessagesProvider } from "@/lib/messages-store";
import { MusicReviewProvider } from "@/lib/music-review-store";
import { createBrowserClient } from "@/lib/supabase-browser";
import { SupabaseSessionProvider, useSupabaseSession } from "@/lib/supabase-session";
import { SubmissionsProvider } from "@/lib/submissions-store";
import { AudioDuckingProvider, useAudioDucking } from "@/tradio/contexts/AudioDuckingProvider";
import {
  MediaInterruptionProvider,
  useMediaInterruption,
} from "@/tradio/contexts/MediaInterruptionProvider";
import { PlayerProvider, usePlayer } from "@/tradio/contexts/PlayerContext";
import { setMediaInterruptionCallbacks } from "@/tradio/lib/mediaInterruptionHelper";
import { setNotificationDuckingCallbacks } from "@/tradio/lib/notificationDuckingHelper";

export type MainAppProvidersProps = {
  isImmersivePrescribeMe: boolean;
  isImmersiveGameRoom: boolean;
  isFocusedAuthSurface: boolean;
  isImmersiveTradio: boolean;
  isImmersiveTrance: boolean;
  useFoldableLayout: boolean;
};

export default function MainAppProviders(props: MainAppProvidersProps) {
  return (
    <CreateArcProvider>
      <RootContent {...props} />
    </CreateArcProvider>
  );
}

function RootContent({
  isImmersivePrescribeMe,
  isImmersiveGameRoom,
  isFocusedAuthSurface,
  isImmersiveTradio,
  isImmersiveTrance,
  useFoldableLayout,
}: MainAppProvidersProps) {
  const [foldMode, setFoldMode] = useState<string>("standard");

  useEffect(() => {
    (window as any).__treyTvHydrated = true;
    return () => {
      (window as any).__treyTvHydrated = false;
    };
  }, []);

  useEffect(() => {
    const checkFold = () => {
      const saved = sessionStorage.getItem("treytv_fold_mode");
      if (saved) {
        setFoldMode(saved);
        return;
      }
      const w = window.innerWidth;
      const h = window.innerHeight;
      const ratio = w / h;
      if (w >= 600 && w < 1024 && ratio >= 0.8 && ratio <= 1.4) {
        setFoldMode("unfolded");
      } else if (w <= 420 && h <= 450 && ratio >= 0.8 && ratio <= 1.2) {
        setFoldMode("cover");
      } else {
        setFoldMode("standard");
      }
    };
    window.addEventListener("resize", checkFold);

    const interval = setInterval(checkFold, 500);

    checkFold();
    return () => {
      window.removeEventListener("resize", checkFold);
      clearInterval(interval);
    };
  }, []);

  const hideGlobalMobileChrome =
    isImmersivePrescribeMe ||
    isImmersiveGameRoom ||
    isFocusedAuthSurface ||
    isImmersiveTradio ||
    isImmersiveTrance ||
    foldMode === "cover" ||
    foldMode === "unfolded" ||
    foldMode === "flex";

  useAccentColor();

  return (
    <MediaInterruptionProvider>
      <AudioDuckingProvider>
        <PlayerProvider>
          <SupabaseSessionProvider>
            <AuthProvider>
              <FollowProvider>
                <CurrentUserSync />
                <ActivityProvider>
                  <SubmissionsProvider>
                    <FeedProvider>
                      <CommentsProvider>
                        <MessagesProvider>
                          <GuideProvider>
                            <MusicReviewProvider>
                              <AuthGuard>
                                {useFoldableLayout ? (
                                  <FoldableLayoutManager>
                                    <Outlet />
                                  </FoldableLayoutManager>
                                ) : (
                                  <Outlet />
                                )}
                              </AuthGuard>
                              {!hideGlobalMobileChrome && <BottomNav />}
                              {!hideGlobalMobileChrome && <TreyIWidget />}
                              <GiftBurstHost />
                              <NotificationDuckingWirer />
                              <MediaInterruptionWirer />
                              <CreateBubbleArc />
                              <Toaster />
                            </MusicReviewProvider>
                          </GuideProvider>
                        </MessagesProvider>
                      </CommentsProvider>
                    </FeedProvider>
                  </SubmissionsProvider>
                </ActivityProvider>
              </FollowProvider>
            </AuthProvider>
          </SupabaseSessionProvider>
        </PlayerProvider>
      </AudioDuckingProvider>
    </MediaInterruptionProvider>
  );
}

function AuthGuard({ children }: { children: ReactNode }) {
  const { user, isGuest, authorizationStatus, authReady, authError, retryHydrate } = useAuth();
  const { loading: sessionLoading, user: supaUser } = useSupabaseSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [showRetry, setShowRetry] = useState(false);

  const publicRoutes = [
    "/login",
    "/signup",
    "/auth/callback",
    "/confirm-email",
    "/onboarding",
    "/download-tv-app",
    "/apk",
    "/legal",
    "/developers",
    "/api",
    "/.well-known",
  ];

  const isPublicRoute = publicRoutes.some(
    (route) => location.pathname === route || location.pathname.startsWith(route + "/"),
  );

  const guestAllowed = ["/", "/explore", "/guide", "/tradio", "/explore/"];
  const isAllowedGuestPage = guestAllowed.some(
    (route) =>
      location.pathname === route || (route !== "/" && location.pathname.startsWith(route)),
  );

  const onboardingRoutes = [
    "/onboarding",
    "/auth/callback",
    "/login",
    "/signup",
    "/legal",
    "/confirm-email",
  ];
  const isOnboardingRoute = onboardingRoutes.some(
    (route) => location.pathname === route || location.pathname.startsWith(route + "/"),
  );
  const canPaintDuringAuthLoad = location.pathname.startsWith("/tradio");

  const waitingForSupabaseProfile =
    !!supaUser &&
    (authorizationStatus === "checking" || authorizationStatus === "logged_out" || !authReady);
  const isAuthLoading =
    sessionLoading || authorizationStatus === "checking" || !authReady || waitingForSupabaseProfile;
  const isBlockedUser = !isAuthLoading && user && !user.onboarding_completed && !isOnboardingRoute;
  const isBlockedGuest = !isAuthLoading && isGuest && !isPublicRoute && !isAllowedGuestPage;
  const canRenderWhileAuthLoads = isPublicRoute || isAllowedGuestPage || canPaintDuringAuthLoad;
  const shouldShowAuthFallback =
    isBlockedUser || isBlockedGuest || ((loading || isAuthLoading) && !canRenderWhileAuthLoads);

  useEffect(() => {
    let cancelled = false;
    let to: ReturnType<typeof setTimeout> | null = null;

    if (isAuthLoading) {
      setShowRetry(false);
      to = setTimeout(() => setShowRetry(true), 8000);
    } else {
      setShowRetry(false);
    }

    const checkOnboarding = async () => {
      if (
        authorizationStatus === "checking" ||
        sessionLoading ||
        !authReady ||
        waitingForSupabaseProfile
      ) {
        if (!cancelled) setLoading(true);
        return;
      }

      if (authorizationStatus === "logged_out" || isGuest) {
        if (!isPublicRoute && !isAllowedGuestPage) {
          const authRedirectSearch =
            typeof location.search === "string"
              ? location.search
              : (location.search?.toString?.() ?? "");
          sessionStorage.setItem(
            "treytv_post_auth_redirect",
            location.pathname + authRedirectSearch,
          );
          navigate({ to: "/login" });
        }
        if (!cancelled) setLoading(false);
        return;
      }

      if (authorizationStatus === "needs_onboarding" && user) {
        if (!isOnboardingRoute) {
          const onboardingRedirectSearch =
            typeof location.search === "string"
              ? location.search
              : (location.search?.toString?.() ?? "");
          sessionStorage.setItem(
            "treytv_post_onboarding_redirect",
            location.pathname + onboardingRedirectSearch,
          );
          try {
            const supabase = createBrowserClient() as any;
            const { data: onboarding } = await supabase
              .from("user_onboarding")
              .select("selected_path, current_step, completed")
              .eq("user_id", user.uid)
              .maybeSingle();

            if (onboarding && !onboarding.completed && onboarding.selected_path) {
              let targetPath = "/onboarding";
              if (onboarding.selected_path === "manual") targetPath = "/onboarding/manual";
              else if (
                onboarding.selected_path === "voice" ||
                onboarding.selected_path === "trey_i"
              )
                targetPath = "/onboarding/voice";
              else if (onboarding.selected_path === "import_screenshot")
                targetPath = "/onboarding/import-screenshot";
              navigate({ to: targetPath as any });
            } else {
              navigate({ to: "/onboarding" });
            }
          } catch (e) {
            console.error("Failed to fetch onboarding state:", e);
            navigate({ to: "/onboarding" });
          }
        }
        if (!cancelled) setLoading(false);
        return;
      }

      if (authorizationStatus === "authorized" && location.pathname.startsWith("/onboarding")) {
        const redirect = sessionStorage.getItem("treytv_post_onboarding_redirect");
        if (redirect) {
          sessionStorage.removeItem("treytv_post_onboarding_redirect");
          window.location.href = redirect;
        } else {
          navigate({ to: "/" });
        }
      }

      if (!cancelled) setLoading(false);
    };

    checkOnboarding();

    return () => {
      cancelled = true;
      if (to) clearTimeout(to);
    };
  }, [
    authorizationStatus,
    user,
    isGuest,
    isAuthLoading,
    location.pathname,
    location.search,
    navigate,
    isPublicRoute,
    isAllowedGuestPage,
    isOnboardingRoute,
    canPaintDuringAuthLoad,
    sessionLoading,
    authReady,
    waitingForSupabaseProfile,
  ]);

  if (authError) {
    return <AuthFallback retryHydrate={retryHydrate} retry />;
  }

  if (shouldShowAuthFallback) {
    if (authError || showRetry) {
      return <AuthFallback retryHydrate={retryHydrate} retry />;
    }

    return <AuthFallback retryHydrate={retryHydrate} />;
  }

  return <>{children}</>;
}

function AuthFallback({
  retryHydrate,
  retry = false,
}: {
  retryHydrate: () => void;
  retry?: boolean;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05070D] text-white">
      <div className="rounded-3xl border border-white/10 bg-[#05070D]/95 px-10 py-8 text-center space-y-3 shadow-2xl">
        {retry ? (
          <>
            <p className="text-sm text-muted-foreground">
              We had trouble loading your account. Try again.
            </p>
            <div className="mt-4">
              <button
                onClick={() => retryHydrate()}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Retry
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="size-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Checking authorization...</p>
          </>
        )}
      </div>
    </div>
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


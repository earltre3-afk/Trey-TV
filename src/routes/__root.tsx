import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  useNavigate,
  useLocation,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { TreyIWidget } from "@/components/ai/TreyIWidget";
import { BottomNav } from "@/components/layout/BottomNav";
import { AuthProvider, useAuth } from "@/lib/auth";
import { SupabaseSessionProvider, useSupabaseSession } from "@/lib/supabase-session";
import { createBrowserClient } from "@/lib/supabase-browser";
import { useEffect, useState } from "react";
import { ActivityProvider } from "@/lib/activity-store";
import { SubmissionsProvider } from "@/lib/submissions-store";
import { FeedProvider } from "@/lib/feed-store";
import { CommentsProvider } from "@/lib/comments-store";
import { MessagesProvider } from "@/lib/messages-store";
import { GuideProvider } from "@/lib/guide-store";
import { MusicReviewProvider } from "@/lib/music-review-store";
import { CurrentUserSync } from "@/components/CurrentUserSync";
import { GiftBurstHost } from "@/components/gifts/GiftBurst";
import { WelcomeSplash } from "@/components/splash/WelcomeSplash";
import { useAccentColor } from "@/hooks/use-accent-color";
import { FollowProvider } from "@/lib/follow-store";
import { FoldableLayoutManager } from "@/components/foldable/FoldableLayoutManager";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "theme-color", content: "#05070D" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Trey TV" },
      { name: "description", content: "Trey TV — the premium creator entertainment platform for shows, seasons, and episodes." },
      { name: "author", content: "Trey TV" },
      { property: "og:title", content: "Trey TV" },
      { property: "og:description", content: "Trey TV — the premium creator entertainment platform for shows, seasons, and episodes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@TreyTV" },
      { name: "twitter:title", content: "Trey TV" },
      { name: "twitter:description", content: "Trey TV — the premium creator entertainment platform for shows, seasons, and episodes." },
      { property: "og:image", content: "/trey-tv-seo-logo.png" },
      { name: "twitter:image", content: "/trey-tv-seo-logo.png" },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Cinzel:wght@400;600;900&family=Raleway:wght@300;400;500&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-QV9ZERGNP4" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-QV9ZERGNP4');
            `,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const showWelcomeSplash = pathname === "/";
  const isImmersivePrescribeMe = pathname.startsWith("/prescribe-me");
  const isImmersiveGameRoom = pathname.startsWith("/games");
  const isFocusedAuthSurface = pathname.startsWith("/oauth/consent");
  const isImmersiveTradio = pathname.startsWith("/tradio");
  const isImmersiveTrance = pathname.startsWith("/trance");
  
  const [foldMode, setFoldMode] = useState<string>("standard");

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
    
    // Sync active fold mode state updates from the emulator
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

  // Apply user's profile accent color globally
  useAccentColor();

  return (
    <QueryClientProvider client={queryClient}>
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
                          {showWelcomeSplash && <WelcomeSplash onDone={() => undefined} />}
                          <AuthGuard>
                            <FoldableLayoutManager>
                              <Outlet />
                            </FoldableLayoutManager>
                          </AuthGuard>
                          {!hideGlobalMobileChrome && <BottomNav />}
                          {!hideGlobalMobileChrome && <TreyIWidget />}
                          <GiftBurstHost />
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
    </QueryClientProvider>
  );
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isGuest, authorizationStatus, authReady, authError, retryHydrate } = useAuth();
  const { loading: sessionLoading, user: supaUser } = useSupabaseSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [showRetry, setShowRetry] = useState(false);

  // 1. Define public routes
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
    "/.well-known"
  ];

  const isPublicRoute = publicRoutes.some((route) =>
    location.pathname === route || location.pathname.startsWith(route + "/")
  );

  const guestAllowed = ["/", "/explore", "/guide", "/explore/"];
  const isAllowedGuestPage = guestAllowed.some((route) =>
    location.pathname === route || (route !== "/" && location.pathname.startsWith(route))
  );

  const onboardingRoutes = [
    "/onboarding",
    "/auth/callback",
    "/login",
    "/signup",
    "/legal",
    "/confirm-email"
  ];
  const isOnboardingRoute = onboardingRoutes.some((route) =>
    location.pathname === route || location.pathname.startsWith(route + "/")
  );

  // Synchronous route protection checks to prevent layout flash/flicker
  const isBlockedUser = user && !user.onboarding_completed && !isOnboardingRoute;
  const isBlockedGuest = isGuest && !isPublicRoute && !isAllowedGuestPage;
  const isAuthLoading = sessionLoading || authorizationStatus === "checking" || !authReady;

  useEffect(() => {
    let cancelled = false;
    let to: any = null;

    // fail-safe: if auth stays loading too long, show retry UI
    if (isAuthLoading) {
      setShowRetry(false);
      to = setTimeout(() => setShowRetry(true), 8000);
    } else {
      setShowRetry(false);
    }

    const checkOnboarding = async () => {
      // While we are checking authorization, do not redirect
      if (authorizationStatus === "checking" || sessionLoading || !authReady) {
        if (!cancelled) setLoading(true);
        return;
      }

      // Guest handling
      if (authorizationStatus === "logged_out" || isGuest) {
        if (!isPublicRoute && !isAllowedGuestPage) {
          const authRedirectSearch =
            typeof location.search === "string"
              ? location.search
              : location.search?.toString?.() ?? "";
          sessionStorage.setItem(
            "treytv_post_auth_redirect",
            location.pathname + authRedirectSearch
          );
          navigate({ to: "/login" });
        }
        if (!cancelled) setLoading(false);
        return;
      }

      // Signed in user handling
      if (authorizationStatus === "needs_onboarding" && user) {
        if (!isOnboardingRoute) {
          const onboardingRedirectSearch =
            typeof location.search === "string"
              ? location.search
              : location.search?.toString?.() ?? "";
          sessionStorage.setItem(
            "treytv_post_onboarding_redirect",
            location.pathname + onboardingRedirectSearch
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
              else if (onboarding.selected_path === "voice" || onboarding.selected_path === "trey_i") targetPath = "/onboarding/voice";
              else if (onboarding.selected_path === "import_screenshot") targetPath = "/onboarding/import-screenshot";
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
  }, [authorizationStatus, user, isGuest, location.pathname, navigate, isPublicRoute, isAllowedGuestPage, isOnboardingRoute, sessionLoading, authReady]);

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05070D] text-white">
        <div className="rounded-3xl border border-white/10 bg-[#05070D]/95 px-10 py-8 text-center space-y-3 shadow-2xl">
          <p className="text-sm text-muted-foreground">We had trouble loading your account. Try again.</p>
          <div className="mt-4">
            <button onClick={() => retryHydrate()} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || isAuthLoading || isBlockedUser || isBlockedGuest) {
    // show retry UI if auth is stuck or an authError exists
    if (authError || showRetry) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#05070D] text-white">
          <div className="rounded-3xl border border-white/10 bg-[#05070D]/95 px-10 py-8 text-center space-y-3 shadow-2xl">
            <p className="text-sm text-muted-foreground">We had trouble loading your account. Try again.</p>
            <div className="mt-4">
              <button onClick={() => retryHydrate()} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Retry</button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05070D] text-white">
        <div className="rounded-3xl border border-white/10 bg-[#05070D]/95 px-10 py-8 text-center space-y-3 shadow-2xl">
          <div className="size-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Checking authorization…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

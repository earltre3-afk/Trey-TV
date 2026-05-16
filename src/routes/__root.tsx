import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { TreyIWidget } from "@/components/ai/TreyIWidget";
import { BottomNav } from "@/components/layout/BottomNav";
import { AuthProvider } from "@/lib/auth";
import { SupabaseSessionProvider } from "@/lib/supabase-session";
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
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f894de06-4f23-442e-876e-f9d0c649d867/id-preview-fe97151e--916886fa-a471-491f-be76-412367cc12b1.lovable.app-1778127002822.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f894de06-4f23-442e-876e-f9d0c649d867/id-preview-fe97151e--916886fa-a471-491f-be76-412367cc12b1.lovable.app-1778127002822.png" },
    ],
    links: [
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
  const hideGlobalMobileChrome = isImmersivePrescribeMe || isImmersiveGameRoom || isFocusedAuthSurface;

  // Apply user's profile accent color globally
  useAccentColor();

  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseSessionProvider>
        <AuthProvider>
          <CurrentUserSync />
          <ActivityProvider>
            <SubmissionsProvider>
              <FeedProvider>
                <CommentsProvider>
                  <MessagesProvider>
                    <GuideProvider>
                      <MusicReviewProvider>
                        {showWelcomeSplash && <WelcomeSplash onDone={() => undefined} />}
                        <Outlet />
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
        </AuthProvider>
      </SupabaseSessionProvider>
    </QueryClientProvider>
  );
}

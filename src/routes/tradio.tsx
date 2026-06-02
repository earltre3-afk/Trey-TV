import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import "@/tradio/tradio.css";

/**
 * Tradio — the premium music world inside Trey TV (Phase A+B mount).
 *
 * Mounted CLIENT-ONLY: the Tradio shell is a heavy, browser-state-driven app
 * (window/document/audio/layout measurement), so it is lazy-imported and only
 * rendered after mount. This keeps the Tradio module graph entirely out of SSR
 * and prevents server build/render failures.
 *
 * Phase A+B = native route mount only. No live wiring yet to parent auth,
 * Messenger, notifications, Trey-I, or Signal Test (those are Phase C+).
 */

const TradioShell = lazy(() =>
  import("@/tradio/components/tradio/Shell").then((m) => ({ default: m.TradioShell })),
);

// Proactively trigger the bundle fetch as soon as this route module is parsed by TanStack Router,
// preloading the heavy chunk to reduce perceived transition load times to virtually zero.
if (typeof window !== "undefined") {
  void import("@/tradio/components/tradio/Shell");
}

// Highly polished, premium themed loading fallback that aligns with Tradio's design language
function TradioLoadingFallback() {
  return (
    <div className="min-h-screen w-full bg-[#06050A] flex flex-col items-center justify-center relative overflow-hidden select-none">
      {/* ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[130px] animate-pulse" />
        <div className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-fuchsia-600/10 blur-[130px] animate-pulse" />
      </div>

      <div className="relative flex flex-col items-center gap-6 z-10 text-center px-4 animate-pulse">
        <div className="relative group">
          <span aria-hidden="true" className="absolute inset-0 -m-6 rounded-full bg-purple-500/15 blur-2xl animate-glow-pulse" />
          <div className="relative w-20 h-20 rounded-full border border-white/10 bg-black/45 backdrop-blur-md p-3.5 grid place-items-center shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <svg className="w-10 h-10 text-fuchsia-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.000 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-3xl font-black tracking-[0.25em] bg-gradient-to-r from-fuchsia-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent" style={{ filter: 'drop-shadow(0 0 12px rgba(217,70,239,0.4))' }}>TRADIO</div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 leading-none">TUNING TO THE MUSIC WORLD</p>
        </div>

        {/* Shimmer bar */}
        <div className="w-48 mt-4">
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden relative">
            <div className="h-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500 w-1/3 animate-pulse rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/tradio")({
  component: TradioRoute,
  head: () => ({
    meta: [
      { title: "Tradio · Trey TV" },
      { name: "description", content: "Tradio — the music world inside Trey TV." },
    ],
  }),
});

function TradioRoute() {
  const [mounted, setMounted] = useState(false);
  const { isGuest, authReady } = useAuth();
  const navigate = useNavigate();
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && authReady && isGuest) {
      navigate({ to: "/login" });
    }
  }, [mounted, authReady, isGuest, navigate]);

  // Server + first paint, while auth is resolving, render the gorgeous themed loading fallback
  if (!mounted || !authReady || isGuest) {
    return <TradioLoadingFallback />;
  }

  return (
    <div className="tradio-root min-h-screen w-full bg-[#0A0A0F] text-white antialiased">
      <Suspense fallback={<TradioLoadingFallback />}>
        <TradioShell />
      </Suspense>
    </div>
  );
}

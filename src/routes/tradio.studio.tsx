import { Link, createFileRoute } from "@tanstack/react-router";

/**
 * Full-screen Tradio Studio — the Tremix DAW mounted as an isolated iframe.
 *
 * Why an iframe: Tremix is a client-only React SPA (its own react-router, AudioContext,
 * Web Workers, localStorage). Rendering it inside this SSR/hydrated app would cause
 * hydration mismatches and router collisions. An <iframe> element renders identically on
 * server and client (no hydration mismatch), and the studio boots entirely client-side
 * inside its own document — so none of its browser-only code touches our hydration.
 *
 * The bundle lives in public/tremix/ and routes via HashRouter (#/studio) so it works
 * from this sub-path. /tradio/* is already immersive (chrome stripped), so this fills the
 * viewport.
 */
export const Route = createFileRoute("/tradio/studio")({
  component: TradioStudioRoute,
  head: () => ({
    meta: [
      { title: "Studio | Tradio" },
      { name: "description", content: "Create music in the full-screen Tradio Studio." },
    ],
  }),
});

function TradioStudioRoute() {
  return (
    <div className="fixed inset-0 z-50 bg-[#05070D]">
      <iframe
        src="/tremix/index.html#/studio"
        title="Tradio Studio"
        className="h-full w-full border-0"
        allow="microphone; autoplay; clipboard-read; clipboard-write; encrypted-media; fullscreen"
      />

      {/* Trey TV chrome: an unobtrusive way back to Tradio (the studio is otherwise full-screen) */}
      <Link
        to="/tradio"
        aria-label="Back to Tradio"
        className="absolute left-3 top-[max(0.75rem,env(safe-area-inset-top))] z-[60] inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition-colors hover:bg-black/75"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Tradio
      </Link>
    </div>
  );
}

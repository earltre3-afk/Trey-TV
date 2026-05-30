import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
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
  useEffect(() => setMounted(true), []);

  // Server + first paint: render an empty Tradio shell wrapper (no graph eval).
  if (!mounted) {
    return <div className="tradio-root min-h-screen w-full bg-[#0A0A0F]" />;
  }

  return (
    <div className="tradio-root min-h-screen w-full bg-[#0A0A0F] text-white antialiased">
      <Suspense fallback={<div className="min-h-screen w-full bg-[#0A0A0F]" />}>
        <TradioShell />
      </Suspense>
    </div>
  );
}

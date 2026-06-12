import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TradioShell } from "@/tradio/components/tradio/Shell";
import "@/tradio/tradio.css";

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
  // Render an instant splash on route entry, then mount the heavy shell
  // after the browser has painted the splash. This trades 1 frame (~16ms)
  // for a non-blank first paint — feels immediate, matches the Trance vibe.
  const [showShell, setShowShell] = useState(false);
  useEffect(() => {
    const r1 = requestAnimationFrame(() => {
      const r2 = requestAnimationFrame(() => setShowShell(true));
      return () => cancelAnimationFrame(r2);
    });
    return () => cancelAnimationFrame(r1);
  }, []);

  return (
    <div className="tradio-root min-h-screen w-full bg-[#0A0A0F] text-white antialiased">
      {showShell ? <TradioShell /> : <TradioSplash />}
    </div>
  );
}

function TradioSplash() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <div
        className="text-4xl font-black tracking-[0.3em] text-primary"
        style={{
          textShadow:
            "0 0 24px rgba(255,200,87,0.55), 0 0 60px rgba(255,200,87,0.25)",
          animation: "tradio-splash-pulse 1.6s ease-in-out infinite",
        }}
      >
        TRADIO
      </div>
      <div
        className="size-1.5 rounded-full bg-primary"
        style={{ animation: "tradio-splash-pulse 1.6s ease-in-out infinite 0.3s" }}
      />
      <style>{`
        @keyframes tradio-splash-pulse {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

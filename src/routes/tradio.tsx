import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import "@/tradio/tradio.css";

const TradioShell = lazy(() =>
  import("@/tradio/components/tradio/Shell").then((module) => ({
    default: module.TradioShell,
  })),
);

export const Route = createFileRoute("/tradio")({
  component: TradioRoute,
  head: () => ({
    meta: [
      { title: "Tradio | Trey TV" },
      { name: "description", content: "Tradio - the music world inside Trey TV." },
    ],
  }),
});

function TradioRoute() {
  const [shellReady, setShellReady] = useState(false);

  useEffect(() => {
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => setShellReady(true));
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      if (secondFrame) cancelAnimationFrame(secondFrame);
    };
  }, []);

  return (
    <div className="tradio-root min-h-screen w-full bg-[#0A0A0F] text-white antialiased">
      {shellReady ? (
        <Suspense fallback={<TradioSplash />}>
          <TradioShell />
        </Suspense>
      ) : (
        <TradioSplash />
      )}
    </div>
  );
}

function TradioSplash() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <div
        className="text-4xl font-black tracking-[0.3em] text-primary"
        style={{
          textShadow: "0 0 24px rgba(255,200,87,0.55), 0 0 60px rgba(255,200,87,0.25)",
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

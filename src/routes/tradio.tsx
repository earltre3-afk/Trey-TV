import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import "@/tradio/tradio.css";

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
  return (
    <div className="tradio-root min-h-screen w-full bg-[#0A0A0F] text-white antialiased">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <div className="size-10 rounded-full border-2 border-white/15 border-t-primary animate-spin" />
          </div>
        }
      >
        <TradioShell />
      </Suspense>
    </div>
  );
}

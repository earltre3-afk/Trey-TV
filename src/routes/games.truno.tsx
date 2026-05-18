import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const TrunoModule = lazy(() => import("@/features/truno/TrunoModule"));

export const Route = createFileRoute("/games/truno")({
  component: TrunoPage,
  head: () => ({
    meta: [
      { title: "Truno · Trey TV Games" },
      {
        name: "description",
        content:
          "Truno — Trey TV's original color-matching card game. Match colors, play action cards, and call TRUNO when you're down to one.",
      },
    ],
  }),
});

function TrunoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-950">
          <div className="text-center">
            <div className="text-[10px] font-bold tracking-[0.3em] text-fuchsia-400 mb-2">
              TRUNO
            </div>
            <div className="text-sm font-black text-white">Loading…</div>
          </div>
        </div>
      }
    >
      <TrunoModule
        initialView="home"
        onExitToGames={() => window.history.back()}
      />
    </Suspense>
  );
}

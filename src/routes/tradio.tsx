import { createFileRoute } from "@tanstack/react-router";
import { TradioShell } from "@/tradio/components/tradio/Shell";
import "@/tradio/tradio.css";

/**
 * Tradio — the premium music world inside Trey TV (Phase A+B mount).
 *
 * Phase A+B = native route mount only. No live wiring yet to parent auth,
 * Messenger, notifications, Trey-I, or Signal Test (those are Phase C+).
 */

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
      <TradioShell />
    </div>
  );
}

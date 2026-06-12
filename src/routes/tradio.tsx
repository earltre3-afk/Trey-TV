import { createFileRoute } from "@tanstack/react-router";
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
  return (
    <div className="tradio-root min-h-screen w-full bg-[#0A0A0F] text-white antialiased">
      <TradioShell />
    </div>
  );
}

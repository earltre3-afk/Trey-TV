import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { GamesPreviewSection } from "@/components/games/GamesPreviewSection";

export const Route = createFileRoute("/games")({
  component: GamesPage,
  head: () => ({
    meta: [
      { title: "Games · Trey TV" },
      { name: "description", content: "Trey TV Gaming Lounge — Spades, Blackjack, Bullshit, and more coming soon." },
    ],
  }),
});

function GamesPage() {
  return (
    <AppShell wide>
      <GamesPreviewSection />
    </AppShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { GameRoomRouteMount } from "@/features/games/GameRoomRouteMount";

export const Route = createFileRoute("/games/")({
  component: GamesHomePage,
  head: () => ({
    meta: [
      { title: "Games · Trey TV" },
      {
        name: "description",
        content: "Trey TV Gaming Lounge — Spades, Blackjack, Bullshit, and more coming soon.",
      },
    ],
  }),
});

function GamesHomePage() {
  return <GameRoomRouteMount />;
}

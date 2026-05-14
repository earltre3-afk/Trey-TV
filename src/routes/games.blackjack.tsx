import { createFileRoute } from "@tanstack/react-router";
import { GameRoomRouteMount } from "@/features/games/GameRoomRouteMount";

export const Route = createFileRoute("/games/blackjack")({
  component: BlackjackGamePage,
  head: () => ({
    meta: [
      { title: "Blackjack - Trey TV Games" },
      { name: "description", content: "Play Trey TV Blackjack with the cinematic Trey TV deck." },
    ],
  }),
});

function BlackjackGamePage() {
  return <GameRoomRouteMount initialView="blackjack" />;
}

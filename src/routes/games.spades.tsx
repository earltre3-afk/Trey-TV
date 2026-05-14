import { createFileRoute } from "@tanstack/react-router";
import { GameRoomRouteMount } from "@/features/games/GameRoomRouteMount";

export const Route = createFileRoute("/games/spades")({
  component: SpadesGamePage,
  head: () => ({
    meta: [
      { title: "Spades - Trey TV Games" },
      { name: "description", content: "Play Trey TV Spades with the cinematic Trey TV deck." },
    ],
  }),
});

function SpadesGamePage() {
  return <GameRoomRouteMount initialView="spades" />;
}

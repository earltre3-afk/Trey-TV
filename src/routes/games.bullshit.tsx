import { createFileRoute } from "@tanstack/react-router";
import { GameRoomRouteMount } from "@/features/games/GameRoomRouteMount";

export const Route = createFileRoute("/games/bullshit")({
  component: BullshitGamePage,
  head: () => ({
    meta: [
      { title: "Bullshit - Trey TV Games" },
      { name: "description", content: "Play Trey TV Bullshit with the cinematic Trey TV deck." },
    ],
  }),
});

function BullshitGamePage() {
  return <GameRoomRouteMount initialView="bullshit" />;
}

import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { GameRoomRouteMount } from "@/features/games/GameRoomRouteMount";

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
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  if (pathname !== "/games") {
    return <Outlet />;
  }

  return <GameRoomRouteMount />;
}

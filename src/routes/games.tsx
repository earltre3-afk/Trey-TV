import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/games")({
  component: () => <Outlet />,
  head: () => ({
    meta: [
      { title: "Games · Trey TV" },
      { name: "description", content: "Trey TV Gaming Lounge — Spades, Blackjack, Bullshit, and more coming soon." },
    ],
  }),
});

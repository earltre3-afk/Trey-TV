import { createFileRoute } from "@tanstack/react-router";
import TreynounGame from "@/features/games/treynoun/TreynounGame";

export const Route = createFileRoute("/games/treynoun")({
  component: TreynounPage,
  head: () => ({
    meta: [
      { title: "Treynoun · Trey TV Games" },
      {
        name: "description",
        content:
          "Treynoun — Trey TV's original noun-based mystery chase game. Chase the noun, lock in clues, avoid the trap, and claim victory.",
      },
    ],
  }),
});

function TreynounPage() {
  return <TreynounGame />;
}

import { createFileRoute } from "@tanstack/react-router";
import TrapTapGame from "@/features/games/traptap/TrapTapGame";

export const Route = createFileRoute("/games/traptap")({
  component: TrapTapPage,
  head: () => ({
    meta: [
      { title: "Trap Tap · Trey TV Games" },
      {
        name: "description",
        content:
          "Trap Tap — Trey TV's rhythm tapping game. Tap the lanes to custom Trey Trizzy tracks, chain combos, and trigger Fever Mode.",
      },
    ],
  }),
});

function TrapTapPage() {
  return <TrapTapGame />;
}

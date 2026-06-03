import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/games/interactive-stories")({
  component: () => <Outlet />,
  head: () => ({
    meta: [
      { title: "Interactive Stories · Trey TV Games" },
      {
        name: "description",
        content:
          "Play cinematic stories where every choice changes the outcome. Interactive Stories on Trey TV.",
      },
    ],
  }),
});

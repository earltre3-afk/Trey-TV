import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tradio")({
  component: () => <Outlet />,
  head: () => ({
    meta: [
      { title: "Tradio | Trey TV" },
      { name: "description", content: "Tradio - the music world inside Trey TV." },
    ],
  }),
});

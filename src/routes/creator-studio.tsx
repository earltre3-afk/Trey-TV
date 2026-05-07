import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/creator-studio")({
  component: () => <Outlet />,
});

import { Navigate, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/index")({
  component: () => <Navigate to="/" replace />,
});

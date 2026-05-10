import { createFileRoute, redirect } from "@tanstack/react-router";

// Trey TV uses a single auth page (/login) with email + Google sign-in.
// Any /signup links redirect there.
export const Route = createFileRoute("/signup")({
  beforeLoad: () => {
    throw redirect({ to: "/login" });
  },
  component: () => null,
});

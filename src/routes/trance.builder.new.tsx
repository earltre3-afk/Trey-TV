import { createFileRoute } from "@tanstack/react-router";
import BuilderScreen from "@/trance/screens/BuilderScreen";
import { AuthGate } from "@/trance/auth/TranceAccountButton";

export const Route = createFileRoute("/trance/builder/new")({
  component: () => (
    <AuthGate
      title="Choreographer Access"
      message="Sign in to build routines, map counts, upload videos, and publish sessions."
    >
      <BuilderScreen />
    </AuthGate>
  ),
});

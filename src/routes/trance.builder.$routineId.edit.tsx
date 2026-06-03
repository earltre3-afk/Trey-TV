import { createFileRoute } from "@tanstack/react-router";
import BuilderScreen from "@/trance/screens/BuilderScreen";
import { AuthGate } from "@/trance/auth/TranceAccountButton";

export const Route = createFileRoute("/trance/builder/$routineId/edit")({
  component: () => (
    <AuthGate
      title="Choreographer Access"
      message="Sign in to edit your routine drafts, update counts, or adjust cues."
    >
      <BuilderScreen />
    </AuthGate>
  ),
});

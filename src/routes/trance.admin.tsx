import { createFileRoute } from "@tanstack/react-router";
import AdminScreen from "@/trance/screens/AdminScreen";
import { AuthGate } from "@/trance/auth/TranceAccountButton";

export const Route = createFileRoute("/trance/admin")({
  component: () => (
    <AuthGate
      title="System Administration"
      message="Sign in to access system flags, moderation review queues, and choreographer approvals."
    >
      <AdminScreen />
    </AuthGate>
  ),
});

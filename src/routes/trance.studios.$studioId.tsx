import { createFileRoute } from "@tanstack/react-router";
import StudioScreen from "@/trance/screens/StudioScreen";
import { AuthGate } from "@/trance/auth/TranceAccountButton";

export const Route = createFileRoute("/trance/studios/$studioId")({
  component: () => (
    <AuthGate
      title="Studio space is private"
      message="Sign in to access team assignments, calendars, comments, and private rehearsal files."
    >
      <StudioScreen />
    </AuthGate>
  ),
});

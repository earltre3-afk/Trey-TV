import { createFileRoute } from "@tanstack/react-router";
import ProfileScreen from "@/trance/screens/ProfileScreen";

export const Route = createFileRoute("/trance/badges")({
  component: ProfileScreen,
});

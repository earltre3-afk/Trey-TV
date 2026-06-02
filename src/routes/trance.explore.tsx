import { createFileRoute } from "@tanstack/react-router";
import ExploreScreen from "@/trance/screens/ExploreScreen";

export const Route = createFileRoute("/trance/explore")({
  component: ExploreScreen,
});

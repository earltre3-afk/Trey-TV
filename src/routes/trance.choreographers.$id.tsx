import { createFileRoute } from "@tanstack/react-router";
import ChoreographerScreen from "@/trance/screens/ChoreographerScreen";

export const Route = createFileRoute("/trance/choreographers/$id")({
  component: ChoreographerScreen,
});

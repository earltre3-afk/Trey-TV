import { createFileRoute } from "@tanstack/react-router";
import HomeScreen from "@/trance/screens/HomeScreen";

export const Route = createFileRoute("/trance/")({
  component: HomeScreen,
});

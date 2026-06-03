import { createFileRoute } from "@tanstack/react-router";
import LearnModeScreen from "@/trance/screens/LearnModeScreen";

export const Route = createFileRoute("/trance/session/$routineId/performance")({
  component: LearnModeScreen,
});

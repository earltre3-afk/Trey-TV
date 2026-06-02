import { createFileRoute } from "@tanstack/react-router";
import ResultsScreen from "@/trance/screens/ResultsScreen";

export const Route = createFileRoute("/trance/session/$routineId/results/$sessionAttemptId")({
  component: ResultsScreen,
});

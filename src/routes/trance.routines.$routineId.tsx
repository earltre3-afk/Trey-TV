import { createFileRoute } from "@tanstack/react-router";
import RoutineDetailScreen from "@/trance/screens/RoutineDetailScreen";

export const Route = createFileRoute("/trance/routines/$routineId")({
  component: RoutineDetailScreen,
});

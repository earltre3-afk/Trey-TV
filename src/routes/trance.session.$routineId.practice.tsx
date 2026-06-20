import { createFileRoute } from "@tanstack/react-router";
import { CalibrationGate } from "@/trance/calibration/CalibrationGate";
import LearnModeScreen from "@/trance/screens/LearnModeScreen";

export const Route = createFileRoute("/trance/session/$routineId/practice")({
  component: PracticeRoute,
});

function PracticeRoute() {
  return (
    <CalibrationGate>
      <LearnModeScreen />
    </CalibrationGate>
  );
}

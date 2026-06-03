import { createFileRoute } from "@tanstack/react-router";
import LeaderboardScreen from "@/trance/screens/LeaderboardScreen";

export const Route = createFileRoute("/trance/leaderboard/$routineId")({
  component: LeaderboardScreen,
});

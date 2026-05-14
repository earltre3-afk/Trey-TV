import { createFileRoute } from "@tanstack/react-router";
import { AdminGameRoomModule } from "@/features/games";

export const Route = createFileRoute("/admin/games")({
  component: AdminGamesPage,
  head: () => ({
    meta: [
      { title: "Games Admin - Trey TV" },
      { name: "description", content: "Trey TV Games room monitor." },
    ],
  }),
});

function AdminGamesPage() {
  return <AdminGameRoomModule />;
}

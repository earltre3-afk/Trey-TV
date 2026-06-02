import { Outlet, createFileRoute } from "@tanstack/react-router";
import { AuthProvider } from "@/trance/auth/AuthContext";
import "@/trance/styles/trance.css";

export const Route = createFileRoute("/trance")({
  component: () => (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  ),
  head: () => ({
    meta: [
      { title: "Trance · Trey TV" },
      { name: "description", content: "TRANCE - The Dance Universe of Trey TV" },
    ],
  }),
});

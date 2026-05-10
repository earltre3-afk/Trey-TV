import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "./login";

export const Route = createFileRoute("/signup")({
  component: Signup,
  head: () => ({
    meta: [
      { title: "Sign up - Trey TV" },
      { name: "description", content: "Create your Trey TV account." },
    ],
  }),
});

function Signup() {
  return <AuthPage defaultSignUp />;
}

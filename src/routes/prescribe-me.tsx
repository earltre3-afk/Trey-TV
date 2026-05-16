import { createFileRoute } from "@tanstack/react-router";
import PrescribeMeFeature from "@/features/prescribe-me/PrescribeMeFeature";

export const Route = createFileRoute("/prescribe-me")({
  component: PrescribeMe,
  head: () => ({
    meta: [
      { title: "Prescribe Me - Trey TV" },
      {
        name: "description",
        content: "Tell Trey-I your vibe and get the perfect creators and content prescribed just for you.",
      },
    ],
  }),
});

function PrescribeMe() {
  return <PrescribeMeFeature />;
}

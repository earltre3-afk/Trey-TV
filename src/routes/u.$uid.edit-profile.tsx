import { createFileRoute } from "@tanstack/react-router";
import { EditProfile } from "./edit-profile";

export const Route = createFileRoute("/u/$uid/edit-profile")({
  component: EditProfile,
  head: ({ params }) => ({
    meta: [
      { title: `Edit Profile - ${params.uid} - Trey TV` },
      {
        name: "description",
        content: `Edit the profile for UID ${params.uid} on Trey TV.`,
      },
    ],
  }),
});

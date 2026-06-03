import { createFileRoute } from "@tanstack/react-router";
import { CreatorStudioLayout } from "@/components/layout/CreatorStudioLayout";
import { SectionHeader } from "@/components/creator/CreatorPrimitives";
import { Settings as SettingsIcon, Bell, Shield, MessageSquare, Gem, Globe } from "lucide-react";

export const Route = createFileRoute("/creator-studio/settings")({
  component: CreatorSettingsPage,
  head: () => ({ meta: [{ title: "Creator Settings — Trey TV" }] }),
});

const GROUPS = [
  { icon: Globe, title: "Channel visibility", desc: "Who can find and view your channel" },
  { icon: MessageSquare, title: "Comment controls", desc: "Allow, filter, or restrict comments" },
  { icon: Gem, title: "Gifts & support", desc: "Enable gifts, set minimums, thank-you messages" },
  { icon: Bell, title: "Notification preferences", desc: "What we tell you, and when" },
  { icon: Shield, title: "Safety & moderation", desc: "Block lists, keyword filters, mod team" },
];

function CreatorSettingsPage() {
  return (
    <CreatorStudioLayout title="Creator settings" subtitle="Fine-tune your network presence.">
      <section className="rounded-3xl glass neon-border p-2">
        <ul className="divide-y divide-white/5">
          {GROUPS.map((g, i) => (
            <li
              key={i}
              className="flex items-center gap-3 p-4 hover:bg-white/5 rounded-2xl transition"
            >
              <div className="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
                <g.icon className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{g.title}</div>
                <div className="text-xs text-muted-foreground">{g.desc}</div>
              </div>
              <button className="px-3 py-1.5 rounded-lg text-xs border border-white/15 hover:bg-white/5">
                Open
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-3xl glass neon-border p-4 md:p-5">
        <SectionHeader icon={SettingsIcon} title="Public channel URL" />
        <div className="flex items-center gap-2">
          <input
            defaultValue="trey.tv/@you"
            className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm"
          />
          <button className="px-3 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground">
            Save
          </button>
        </div>
      </section>
    </CreatorStudioLayout>
  );
}

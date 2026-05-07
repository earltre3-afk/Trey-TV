import { createFileRoute } from "@tanstack/react-router";
import { Bell, Heart, MessageCircle, UserPlus, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { creators } from "@/lib/mock-data";

export const Route = createFileRoute("/inbox")({
  component: Inbox,
  head: () => ({ meta: [{ title: "Inbox — Trey TV" }] }),
});

const items = [
  { icon: Heart, color: "text-[oklch(0.65_0.24_15)]", who: creators[0], text: "liked your latest post", time: "2m" },
  { icon: UserPlus, color: "text-primary", who: creators[1], text: "started following you", time: "12m" },
  { icon: MessageCircle, color: "text-[oklch(0.82_0.15_215)]", who: creators[2], text: "commented: 'This is fire 🔥'", time: "1h" },
  { icon: Sparkles, color: "text-[oklch(0.7_0.25_340)]", who: creators[3], text: "prescribed your post to 124 fans", time: "3h" },
];

function Inbox() {
  return (
    <AppShell>
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Bell className="size-5 text-primary" />
          <h1 className="text-xl font-bold">Inbox</h1>
        </div>
        {items.map((i, idx) => (
          <div key={idx} className="rounded-2xl glass border border-white/10 p-3 flex items-center gap-3">
            <div className="relative">
              <img src={i.who.avatar} className="size-11 rounded-full object-cover" alt="" />
              <div className="absolute -bottom-1 -right-1 size-6 rounded-full bg-background grid place-items-center border border-white/10">
                <i.icon className={`size-3.5 ${i.color}`} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm"><span className="font-semibold">{i.who.name}</span> {i.text}</div>
              <div className="text-xs text-muted-foreground">{i.time} ago</div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

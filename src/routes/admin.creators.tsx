import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/layout/AdminShell";
import { creators } from "@/lib/mock-data";
import { Crown } from "lucide-react";

export const Route = createFileRoute("/admin/creators")({
  component: () => (
    <AdminShell title="Creator Applications" subtitle="Review and approve new creators.">
      <div className="rounded-3xl glass neon-border p-4 space-y-2">
        {creators.map((c) => (
          <div key={c.id} className="flex items-center gap-3 p-3 rounded-2xl glass border border-white/10">
            <img src={c.avatar} className="size-10 rounded-full object-cover" alt="" />
            <div className="flex-1"><div className="text-sm font-semibold flex items-center gap-1">{c.name} <Crown className="size-3 text-primary" /></div><div className="text-[11px] text-muted-foreground">@{c.handle}</div></div>
            <button className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground glow-gold">Approve</button>
            <button className="px-3 py-1.5 rounded-lg text-xs font-semibold glass border border-white/10">Deny</button>
          </div>
        ))}
      </div>
    </AdminShell>
  ),
  head: () => ({ meta: [{ title: "Creator Applications — Admin" }] }),
});

import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Radio, Camera, Mic, Users, Eye, Sparkles, Settings } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { toast } from "sonner";
import { useState } from "react";
import { useGoBack } from "@/hooks/use-go-back";

export const Route = createFileRoute("/go-live")({
  component: GoLive,
  head: () => ({ meta: [{ title: "Go Live — Trey TV" }] }),
});

function GoLive() {
  const [title, setTitle] = useState("Studio Sessions Vol. 5");
  const goBack = useGoBack("/");
  return (
    <AppShell>
      <div className="space-y-5 -mt-2">
        <button
          onClick={goBack}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back
        </button>

        <div className="relative aspect-[9/16] sm:aspect-video rounded-3xl overflow-hidden border border-[oklch(0.7_0.25_340_/_0.5)] bg-[radial-gradient(ellipse_at_top,oklch(0.2_0.08_340_/_0.4),transparent_60%),radial-gradient(ellipse_at_bottom,oklch(0.18_0.06_300_/_0.5),transparent_60%)] glow-magenta">
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="size-24 mx-auto rounded-full bg-[oklch(0.7_0.25_340_/_0.15)] grid place-items-center animate-glow-pulse">
                <Camera className="size-10 text-[oklch(0.7_0.25_340)]" />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Camera preview</p>
            </div>
          </div>

          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-[oklch(0.7_0.25_340)] text-white animate-glow-pulse flex items-center gap-1">
              <Radio className="size-3" /> READY
            </span>
            <span className="px-2 py-1 rounded-full text-[10px] glass border border-white/10 flex items-center gap-1">
              <Eye className="size-3" /> 0 watching
            </span>
          </div>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl glass border border-white/10 text-sm focus:outline-none focus:border-primary/50"
          placeholder="Stream title"
        />

        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Camera, label: "Camera" },
            { icon: Mic, label: "Mic" },
            { icon: Sparkles, label: "Filters" },
            { icon: Settings, label: "Setup" },
          ].map((b) => (
            <button
              key={b.label}
              onClick={() => toast(b.label)}
              className="rounded-2xl glass border border-white/10 py-3 flex flex-col items-center gap-1 hover:bg-white/5"
            >
              <b.icon className="size-5" />
              <span className="text-[10px] text-muted-foreground">{b.label}</span>
            </button>
          ))}
        </div>

        <div className="rounded-2xl glass border border-white/10 p-4 flex items-center gap-3">
          <Users className="size-5 text-[oklch(0.82_0.15_215)]" />
          <div className="flex-1">
            <div className="text-sm font-semibold">Audience</div>
            <div className="text-xs text-muted-foreground">Public · Anyone on Trey TV</div>
          </div>
          <button onClick={() => toast("Audience settings")} className="text-xs text-primary">
            Change
          </button>
        </div>

        <button
          onClick={() => toast.success("You are LIVE — broadcasting to your audience")}
          className="w-full py-4 rounded-2xl text-base font-bold bg-[oklch(0.7_0.25_340)] text-white glow-magenta hover-lift tilt-press flex items-center justify-center gap-2"
        >
          <Radio className="size-5" /> Start Broadcast
        </button>
      </div>
    </AppShell>
  );
}

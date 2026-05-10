import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Image as ImageIcon, Wand2, Globe, Video, Music, Radio } from "lucide-react";
import { useGoBack } from "@/hooks/use-go-back";
import { AppShell } from "@/components/layout/AppShell";
import { currentUser } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/create")({
  component: Create,
  head: () => ({ meta: [{ title: "Create — Trey TV" }] }),
});

function Create() {
  const [text, setText] = useState("");
  const navigate = useNavigate();
  const goBack = useGoBack("/");

  const handlePost = () => {
    if (!text.trim()) {
      toast.error("Write something first");
      return;
    }
    toast.success("Post published to your channel");
    navigate({ to: "/" });
  };

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={goBack} className="size-9 grid place-items-center rounded-full glass">
            <ArrowLeft className="size-4" />
          </button>
          <button onClick={handlePost} className="px-4 py-2 rounded-xl text-sm font-semibold border border-primary text-primary glow-gold hover:bg-primary/10">
            Publish
          </button>
        </div>

        <div className="rounded-3xl p-4 glass border border-white/10">
          <div className="flex items-center gap-3">
            <img src={currentUser.avatar} className="size-11 rounded-full object-cover ring-neon-purple" alt="" />
            <div className="text-sm font-semibold">{currentUser.name}</div>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share something with your fans…"
            rows={6}
            className="mt-3 w-full bg-transparent text-sm focus:outline-none resize-none"
          />
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-white/5">
            {[
              { icon: ImageIcon, label: "Image", to: "/creator-studio/edit" },
              { icon: Video, label: "Video", to: "/creator-studio/edit" },
              { icon: Music, label: "Audio", to: "/creator-studio/edit" },
              { icon: Radio, label: "Go Live", to: "/go-live" },
              { icon: Wand2, label: "Trey-I", to: "/creator-studio/edit" },
              { icon: Globe, label: "Everyone", to: "/creator-studio/edit" },
            ].map((b) => (
              <button key={b.label} onClick={() => navigate({ to: b.to as any })} className="px-3 py-2 rounded-xl glass text-xs flex items-center gap-1.5 hover:bg-white/5">
                <b.icon className="size-4" /> {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

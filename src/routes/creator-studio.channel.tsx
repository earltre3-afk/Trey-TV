import { createFileRoute } from "@tanstack/react-router";
import { CreatorStudioLayout } from "@/components/layout/CreatorStudioLayout";
import { SectionHeader } from "@/components/creator/CreatorPrimitives";
import { useAuth } from "@/lib/auth";
import { Tv, Image as ImageIcon, Link2, Crown, Eye, Save, Film } from "lucide-react";

export const Route = createFileRoute("/creator-studio/channel")({
  component: ChannelPage,
  head: () => ({ meta: [{ title: "Channel — Creator Studio" }] }),
});

function ChannelPage() {
  const { user } = useAuth();
  return (
    <CreatorStudioLayout title="Channel management" subtitle="Your public face on Trey TV.">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-3xl glass neon-border p-4 md:p-5 space-y-3">
          <SectionHeader icon={Tv} title="Channel details" />
          <Field label="Channel name" defaultValue={user?.name ?? "Your channel"} />
          <Field label="Public URL" defaultValue={`trey.tv/@${user?.handle ?? "you"}`} />
          <Field label="Bio" defaultValue={user?.bio ?? ""} multiline />
          <Field label="Main genre" defaultValue="Music · Documentary" />
          <Field label="Social links" defaultValue="instagram.com/you" icon={Link2} />
          <button className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold tilt-press">
            <Save className="size-4" /> Save changes
          </button>
        </div>

        <div className="rounded-3xl glass neon-border p-4 md:p-5">
          <SectionHeader icon={Eye} title="Public preview" />
          <div className="rounded-2xl overflow-hidden ring-1 ring-white/10">
            <div className="relative h-32 bg-gradient-to-br from-[oklch(0.25_0.1_300)] via-[oklch(0.18_0.05_270)] to-[oklch(0.22_0.08_85)]">
              <button className="absolute top-2 right-2 px-2 py-1 rounded-md text-[10px] glass border border-white/15 inline-flex items-center gap-1"><ImageIcon className="size-3" /> Banner</button>
            </div>
            <div className="p-4 -mt-8 relative">
              <div className="size-16 rounded-2xl conic-ring inline-block">
                <img src={user?.avatar} className="size-16 rounded-2xl object-cover" alt="" />
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="font-bold">{user?.name ?? "Your name"}</span>
                <Crown className="size-4 text-primary" />
              </div>
              <div className="text-xs text-muted-foreground">@{user?.handle ?? "you"} · 32.7K fans</div>
              <div className="mt-3 flex gap-2">
                <button className="flex-1 px-3 py-2 rounded-lg text-xs font-bold bg-primary text-primary-foreground">Follow</button>
                <button className="px-3 py-2 rounded-lg text-xs font-semibold border border-white/15">Gift</button>
                <button className="px-3 py-2 rounded-lg text-xs font-semibold border border-[oklch(0.7_0.25_340)] text-[oklch(0.78_0.25_340)]">Subscribe</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl glass neon-border p-4 md:p-5">
        <SectionHeader icon={Film} title="Featured slots" />
        <div className="grid sm:grid-cols-3 gap-3">
          <Slot label="Channel trailer" value="Late Night S2 Trailer" />
          <Slot label="Featured show" value="Late Night with Trey" />
          <Slot label="Featured video" value="Studio Sessions E8" />
        </div>
      </section>
    </CreatorStudioLayout>
  );
}

function Field({ label, defaultValue, multiline, icon: Icon }: { label: string; defaultValue?: string; multiline?: boolean; icon?: typeof Tv }) {
  return (
    <label className="block">
      <div className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground mb-1 flex items-center gap-1.5">{Icon && <Icon className="size-3" />} {label}</div>
      {multiline ? (
        <textarea defaultValue={defaultValue} rows={3} className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40" />
      ) : (
        <input defaultValue={defaultValue} className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40" />
      )}
    </label>
  );
}

function Slot({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-3">
      <div className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold mt-1">{value}</div>
      <button className="mt-2 px-2.5 py-1 rounded-md text-[11px] border border-white/15 hover:bg-white/5">Change</button>
    </div>
  );
}

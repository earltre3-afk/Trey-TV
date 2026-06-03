import { createFileRoute } from "@tanstack/react-router";
import { CreatorStudioLayout } from "@/components/layout/CreatorStudioLayout";
import { SectionHeader } from "@/components/creator/CreatorPrimitives";
import {
  MessageSquare,
  Heart,
  Users,
  Gem,
  AtSign,
  Pin,
  Eye,
  Reply,
  Search,
  Send,
  CheckCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/creator-studio/interactions")({
  component: InteractionsPage,
  head: () => ({ meta: [{ title: "Interactions — Creator Studio" }] }),
});

const FILTERS = ["All", "Comments", "Replies", "Follows", "Gifts", "Mentions", "Admin"] as const;

type Item = {
  id: string;
  kind: string;
  who: string;
  body: string;
  ep: string;
  ago: string;
  read?: boolean;
};
const INITIAL: Item[] = [
  {
    id: "1",
    kind: "comment",
    who: "@nightowl",
    body: "Bro this episode hit different 🔥",
    ep: "Late Night S2 E14",
    ago: "5m",
  },
  {
    id: "2",
    kind: "gift",
    who: "@maya",
    body: "Sent 250 pts",
    ep: "Studio Sessions E8",
    ago: "12m",
  },
  {
    id: "3",
    kind: "follow",
    who: "@chrishorizon",
    body: "Started following your channel",
    ep: "",
    ago: "27m",
  },
  {
    id: "4",
    kind: "comment",
    who: "@zaybeats",
    body: "When does S3 drop?",
    ep: "City After Dark",
    ago: "1h",
  },
  {
    id: "5",
    kind: "admin",
    who: "Trey TV Admin",
    body: "Re-mastered audio approved. Episode is live.",
    ep: "City After Dark Trailer",
    ago: "2h",
    read: true,
  },
  {
    id: "6",
    kind: "mention",
    who: "@lena",
    body: "Y'all need to watch @trey's new ep.",
    ep: "",
    ago: "3h",
  },
];

const ICON: Record<string, typeof MessageSquare> = {
  comment: MessageSquare,
  gift: Gem,
  follow: Users,
  admin: Pin,
  mention: AtSign,
};

function InteractionsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [q, setQ] = useState("");
  const [items, setItems] = useState(INITIAL);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const matches = (it: Item) => {
    if (filter === "All") return true;
    if (filter === "Admin") return it.kind === "admin";
    return it.kind === filter.toLowerCase().slice(0, -1);
  };

  const filtered = useMemo(
    () =>
      items
        .filter(matches)
        .filter((i) => !q || `${i.who} ${i.body} ${i.ep}`.toLowerCase().includes(q.toLowerCase())),
    [items, filter, q],
  );

  const unread = items.filter((i) => !i.read).length;
  const markAllRead = () => {
    setItems((s) => s.map((x) => ({ ...x, read: true })));
    toast.success("All marked as read");
  };

  const sendReply = (id: string) => {
    if (!draft.trim()) return;
    setItems((s) => s.map((x) => (x.id === id ? { ...x, read: true } : x)));
    toast.success("Reply sent");
    setDraft("");
    setReplyTo(null);
  };

  return (
    <CreatorStudioLayout
      title="Interactions"
      subtitle={`Your creator inbox · ${unread} unread`}
      actions={
        <button
          onClick={markAllRead}
          disabled={unread === 0}
          className="px-3 py-2 rounded-xl text-xs font-semibold glass border border-white/10 inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <CheckCheck className="size-3.5" /> Mark all read
        </button>
      }
    >
      <div className="rounded-2xl glass neon-border p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search interactions…"
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
        </div>
      </div>

      <div className="rounded-2xl glass neon-border p-1.5 overflow-x-auto no-scrollbar">
        <div className="flex gap-1 min-w-max">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${filter === f ? "bg-primary/15 text-primary ring-1 ring-primary/40 glow-gold" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <section className="rounded-3xl glass neon-border p-3 md:p-4">
        <SectionHeader icon={MessageSquare} title="Recent activity" />
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No matching interactions.
          </div>
        )}
        <ul className="divide-y divide-white/5">
          {filtered.map((it) => {
            const Icon = ICON[it.kind] ?? MessageSquare;
            const isReplying = replyTo === it.id;
            return (
              <li key={it.id} className={`py-3 px-1 ${!it.read ? "bg-primary/[0.03]" : ""}`}>
                <div className="flex items-start gap-3">
                  <div
                    className={`size-10 rounded-xl bg-white/5 grid place-items-center shrink-0 ${!it.read ? "text-primary ring-1 ring-primary/40" : "text-muted-foreground"}`}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm flex items-center gap-2">
                      <span className="font-semibold">{it.who}</span>
                      {!it.read && (
                        <span className="size-1.5 rounded-full bg-primary animate-glow-pulse" />
                      )}
                      <span className="text-muted-foreground text-xs">· {it.ago}</span>
                    </div>
                    <div className="text-sm">{it.body}</div>
                    {it.ep && (
                      <div className="text-[11px] text-muted-foreground mt-0.5">on {it.ep}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toast("Liked")}
                      title="Like"
                      className="size-8 grid place-items-center rounded-lg hover:bg-white/5 text-muted-foreground hover:text-[oklch(0.78_0.25_340)]"
                    >
                      <Heart className="size-4" />
                    </button>
                    <button
                      onClick={() => setReplyTo(isReplying ? null : it.id)}
                      title="Reply"
                      className={`size-8 grid place-items-center rounded-lg hover:bg-white/5 ${isReplying ? "text-primary" : "text-muted-foreground"}`}
                    >
                      <Reply className="size-4" />
                    </button>
                    <button
                      onClick={() => toast("Opening episode")}
                      title="View"
                      className="size-8 grid place-items-center rounded-lg hover:bg-white/5 text-muted-foreground"
                    >
                      <Eye className="size-4" />
                    </button>
                  </div>
                </div>
                {isReplying && (
                  <div className="mt-2 ml-13 pl-13 flex items-center gap-2 animate-fade-in">
                    <input
                      autoFocus
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendReply(it.id)}
                      placeholder={`Reply to ${it.who}…`}
                      className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40"
                    />
                    <button
                      onClick={() => sendReply(it.id)}
                      className="size-9 grid place-items-center rounded-xl bg-primary text-primary-foreground glow-gold"
                    >
                      <Send className="size-4" />
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </CreatorStudioLayout>
  );
}

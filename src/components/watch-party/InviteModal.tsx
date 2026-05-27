// Invite modal — copy shareable link OR pick from followers.
// See spec §10 and §11.

import { useEffect, useMemo, useState } from "react";
import { Copy, Check, X, UserPlus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseSession } from "@/lib/supabase-session";
import { hostAddMember } from "@/lib/watch-party/party.server";
import { toast } from "sonner";

type Follower = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

type Props = {
  partyId: string;
  inviteToken: string;
  alreadyMemberIds: Set<string>;
  onClose: () => void;
};

export function InviteModal({ partyId, inviteToken, alreadyMemberIds, onClose }: Props) {
  const { session } = useSupabaseSession();
  const [copied, setCopied] = useState(false);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const inviteUrl = useMemo(
    () => `${typeof location !== "undefined" ? location.origin : ""}/watch-party/${partyId}?join=${inviteToken}`,
    [partyId, inviteToken],
  );

  useEffect(() => {
    if (!session?.user?.id) return;
    let cancelled = false;
    (async () => {
      // Followers = users following the host (host is the one inviting).
      const { data } = await (supabase as any)
        .from("follows")
        .select("follower_id, profiles!follows_follower_id_fkey(id, display_name, username, avatar_url)")
        .eq("following_id", session.user.id)
        .limit(100);
      if (cancelled) return;
      const list = (data ?? [])
        .map((r: any) => r.profiles)
        .filter(Boolean) as Follower[];
      setFollowers(list);
    })();
    return () => { cancelled = true; };
  }, [session?.user?.id]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return followers;
    return followers.filter(
      (f) =>
        f.display_name?.toLowerCase().includes(q) ||
        f.username?.toLowerCase().includes(q),
    );
  }, [followers, query]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success("Invite link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — copy manually");
    }
  };

  const addFollower = async (userId: string) => {
    if (!session?.access_token) return;
    setBusy(userId);
    try {
      const res = await hostAddMember({ data: { accessToken: session.access_token, partyId, targetUserId: userId } });
      if (!res.ok) {
        toast.error(res.error === "party_full" ? "Party is full" : `Couldn't add (${res.error})`);
      } else {
        toast.success("Added to party");
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0B1426] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <UserPlus className="size-4 text-primary" />
            <h2 className="font-semibold">Invite to party</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-white/60 hover:text-white">
            <X className="size-4" />
          </button>
        </header>

        <div className="p-4 space-y-4">
          <div>
            <label className="text-xs text-white/60 mb-1 block">Shareable link · up to 10 members</label>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={inviteUrl}
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/80"
              />
              <button
                onClick={copyLink}
                className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 hover:bg-primary/90"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-white/60 mb-1 block">Pick from your followers</label>
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-white/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search followers"
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm placeholder:text-white/30 focus:outline-none focus:border-primary/60"
              />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {filtered.length === 0 && (
                <div className="text-center text-xs text-white/40 py-6">
                  {followers.length === 0 ? "No followers yet" : "No matches"}
                </div>
              )}
              {filtered.map((f) => {
                const inParty = alreadyMemberIds.has(f.id);
                return (
                  <div key={f.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5">
                    <div className="size-8 rounded-full bg-white/10 overflow-hidden">
                      {f.avatar_url ? <img src={f.avatar_url} alt="" className="size-full object-cover" /> : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold truncate">
                        {f.display_name || f.username || "Follower"}
                      </div>
                      {f.username && <div className="text-[10px] text-white/40 truncate">@{f.username}</div>}
                    </div>
                    {inParty ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/50">In party</span>
                    ) : (
                      <button
                        onClick={() => addFollower(f.id)}
                        disabled={busy === f.id}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-primary text-primary-foreground font-semibold disabled:opacity-50 hover:bg-primary/90"
                      >
                        {busy === f.id ? "…" : "Add"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

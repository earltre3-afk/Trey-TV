/**
 * TopThreeEditor.tsx
 * Editor component for managing a user's Top 3 featured profiles
 * Allows searching, adding, removing, and reordering
 */

import { useState, useEffect } from "react";
import { Search, X, GripVertical, Sparkles, Users, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getMyTopThree,
  addToTopThree,
  removeFromTopThree,
  reorderTopThree,
  searchUsersForTopThree,
  type TopThreeEntry,
} from "@/lib/social-relationships";
import { createBrowserClient } from "@/lib/supabase-browser";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export function TopThreeEditor({ open, onClose, onSave }: Props) {
  const [topThree, setTopThree] = useState<TopThreeEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load current Top 3 on open
  useEffect(() => {
    if (open) {
      loadTopThree();
    }
  }, [open]);

  const loadTopThree = async () => {
    setLoading(true);
    const entries = await getMyTopThree();
    setTopThree(entries);
    setLoading(false);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    const results = await searchUsersForTopThree(query, 10);
    // Filter out users already in Top 3
    const filtered = results.filter(
      (r) => !topThree.some((t) => t.featured_user_id === r.id)
    );
    setSearchResults(filtered);
  };

  const handleAdd = async (userId: string) => {
    // Find next available position
    const nextPosition = topThree.length + 1;
    if (nextPosition > 3) {
      toast.error("Maximum 3 profiles allowed in Top 3");
      return;
    }

    const success = await addToTopThree(userId, nextPosition);
    if (success) {
      await loadTopThree();
      setSearchQuery("");
      setSearchResults([]);
      if (onSave) onSave();
    }
  };

  const handleRemove = async (userId: string) => {
    const success = await removeFromTopThree(userId);
    if (success) {
      await loadTopThree();
      if (onSave) onSave();
    }
  };

  const handleReorder = async (userId: string, newPosition: number) => {
    const success = await reorderTopThree(userId, newPosition);
    if (success) {
      await loadTopThree();
      if (onSave) onSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="size-5" />
            Edit Your Top 3
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Top 3 */}
          <div>
            <div className="text-xs tracking-[0.2em] text-muted-foreground mb-3">
              YOUR TOP 3 ({topThree.length}/3)
            </div>
            {topThree.length === 0 ? (
              <div className="text-center py-8 rounded-2xl liquid-glass border border-white/10 text-muted-foreground text-sm">
                No profiles featured yet. Add up to 3 people you follow or who follow you.
              </div>
            ) : (
              <div className="space-y-2">
                {topThree.map((entry) => (
                  <TopThreeEditorItem
                    key={entry.id}
                    entry={entry}
                    onRemove={handleRemove}
                    onReorder={handleReorder}
                    maxPosition={topThree.length}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Search to add */}
          {topThree.length < 3 && (
            <div>
              <div className="text-xs tracking-[0.2em] text-muted-foreground mb-3">
                ADD TO TOP 3
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by stage name, username, or UID..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass border border-white/10 text-sm focus:outline-none focus:border-primary/50 transition"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5 pl-1">
                Search any creator or user on Trey TV by name or their unique UID number.
              </p>

              {searchResults.length > 0 && (
                <div className="mt-3 space-y-1 max-h-48 overflow-y-auto">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleAdd(user.id)}
                      className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition text-left"
                    >
                      <img
                        src={user.avatar_url || "/default-avatar.png"}
                        alt=""
                        className="size-8 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">
                          {user.display_name || user.username}
                        </div>
                        <div className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                          <span>@{user.username}</span>
                          {user.public_profile_uid && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono">
                              UID: {user.public_profile_uid}
                            </span>
                          )}
                        </div>
                      </div>
                      <Plus className="size-4 text-primary flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TopThreeEditorItem({
  entry,
  onRemove,
  onReorder,
  maxPosition,
}: {
  entry: TopThreeEntry;
  onRemove: (userId: string) => void;
  onReorder: (userId: string, newPosition: number) => void;
  maxPosition: number;
}) {
  const displayName = entry.featured_display_name || entry.featured_username || "Unknown";
  const handle = entry.featured_username ? `@${entry.featured_username}` : "";
  const avatar = entry.featured_avatar_url || "/default-avatar.png";

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl liquid-glass border border-white/10">
      {/* Position controls */}
      <div className="flex flex-col gap-1">
        <button
          onClick={() => entry.position > 1 && onReorder(entry.featured_user_id, entry.position - 1)}
          disabled={entry.position === 1}
          className="text-xs text-muted-foreground hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ▲
        </button>
        <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
          {entry.position}
        </div>
        <button
          onClick={() => entry.position < maxPosition && onReorder(entry.featured_user_id, entry.position + 1)}
          disabled={entry.position === maxPosition}
          className="text-xs text-muted-foreground hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ▼
        </button>
      </div>

      {/* Avatar */}
      <img
        src={avatar}
        alt={displayName}
        className="size-10 rounded-full object-cover ring-2 ring-white/10"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate">{displayName}</div>
        <div className="text-xs text-muted-foreground truncate">{handle}</div>
      </div>

      {/* Remove button */}
      <button
        onClick={() => onRemove(entry.featured_user_id)}
        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

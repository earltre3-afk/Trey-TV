import React, { useEffect, useMemo, useState } from 'react';
import { Play, Share2, Pencil, Trash2, Lock, Globe, Trophy, Clock, GitBranch, ArrowLeft } from 'lucide-react';
import { Branch } from '../../lib/storyTypes';
import {
  PlaythroughMeta,
  listMeta,
  syncMetaFromBranch,
  renamePlaythrough,
  deletePlaythroughMeta,
  enableShare,
  disableShare,
  getStoryCover,
} from '../../lib/playthroughs';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

interface Props {
  branches: Branch[];
  onContinue: (branchId: string) => void;
  onReplayFrom: (branchId: string, chapter: number) => void;
  onDelete: (branchId: string) => void;
  onShareEnding: (branchId: string) => void;
}

export const PlaythroughsScreen: React.FC<Props> = ({
  branches,
  onContinue,
  onReplayFrom,
  onDelete,
  onShareEnding,
}) => {
  const { user } = useAuth();
  const userUid = user?.uid || null;
  const [metas, setMetas] = useState<PlaythroughMeta[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [replayingId, setReplayingId] = useState<string | null>(null);

  const refresh = () => {
    // Keep meta in sync with branch state.
    for (const b of branches) syncMetaFromBranch(b, userUid);
    setMetas(listMeta(userUid));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branches.length, userUid]);

  const activeCount = useMemo(() => metas.filter((m) => m.status === 'active').length, [metas]);
  const completedCount = useMemo(() => metas.filter((m) => m.status === 'completed').length, [metas]);

  const handleRename = (id: string) => {
    const m = metas.find((x) => x.id === id);
    if (!m) return;
    setEditingId(id);
    setEditName(m.playthrough_name);
  };

  const commitRename = () => {
    if (editingId && editName.trim()) {
      renamePlaythrough(editingId, editName.trim(), userUid);
      toast('Playthrough renamed.');
    }
    setEditingId(null);
  };

  const handleShareToggle = async (m: PlaythroughMeta) => {
    if (m.share_enabled) {
      await disableShare(m.id, userUid);
      toast('Sharing turned off â€” your playthrough is private again.');
    } else {
      const slug = await enableShare(m.id, userUid);
      const url = `${window.location.origin}/games/interactive-stories/share/${slug}`;
      try {
        await navigator.clipboard.writeText(url);
        toast('Share link copied to clipboard.');
      } catch {
        toast(`Share link ready: ${url}`);
      }
      onShareEnding(m.id);
    }
    refresh();
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this playthrough? This cannot be undone.')) return;
    deletePlaythroughMeta(id, userUid);
    onDelete(id);
    refresh();
  };

  return (
    <div className="min-h-screen pb-28">
      <header className="px-5 pt-10 pb-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-violet-400">My Playthroughs</div>
        <h1 className="mt-1 font-display text-4xl font-black tracking-tight text-white">Saves</h1>
        <p className="mt-1 text-sm text-white/60">
          Every path you've walked. Continue, replay from a choice, or share an ending.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/50">
              <GitBranch className="h-3 w-3" /> Active
            </div>
            <div className="mt-1 font-display text-2xl font-black text-white">{activeCount}</div>
          </div>
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-amber-300">
              <Trophy className="h-3 w-3" /> Endings
            </div>
            <div className="mt-1 font-display text-2xl font-black text-amber-200">{completedCount}</div>
          </div>
        </div>
      </header>

      {metas.length === 0 && (
        <div className="mx-5 mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/60">
          No saved playthroughs yet. Start the story to create your first save.
        </div>
      )}

      <div className="space-y-4 px-5">
        {metas.map((m) => {
          const cover = getStoryCover(m.story_id);
          const isComplete = m.status === 'completed';
          const lastChoice = m.selected_branch_path[m.selected_branch_path.length - 1];
          const topRel = Object.entries(m.relationship_stats)
            .sort((a, b) => Math.abs(b[1] - 50) - Math.abs(a[1] - 50))
            .slice(0, 3);

          return (
            <div
              key={m.id}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/80 to-black"
            >
              {/* Cover */}
              <div className="relative h-40 w-full">
                <img src={cover} alt={m.story_title} className="absolute inset-0 h-full w-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <div className="rounded-full bg-violet-600/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                    {m.story_title}
                  </div>
                  {isComplete && (
                    <div className="flex items-center gap-1 rounded-full bg-amber-500/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-black">
                      <Trophy className="h-3 w-3" /> Ending
                    </div>
                  )}
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] text-white/80 backdrop-blur">
                  <Clock className="h-3 w-3" />
                  {new Date(m.updated_at).toLocaleDateString()}
                </div>
                <div className="absolute bottom-2 left-3 right-3">
                  {editingId === m.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); }}
                        className="flex-1 rounded-lg border border-white/30 bg-black/60 px-2 py-1 text-sm text-white outline-none"
                      />
                    </div>
                  ) : (
                    <h3 className="font-display text-2xl font-black leading-tight text-white drop-shadow-lg">
                      {m.playthrough_name}
                    </h3>
                  )}
                  <div className="text-xs font-bold uppercase tracking-widest text-amber-300/90">
                    {m.branch_title}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3">
                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-white/50">
                    <span>Chapter {m.current_chapter}</span>
                    <span>{m.progress_percent}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${
                        isComplete
                          ? 'bg-gradient-to-r from-amber-400 to-amber-600'
                          : 'bg-gradient-to-r from-violet-500 to-fuchsia-500'
                      }`}
                      style={{ width: `${m.progress_percent}%` }}
                    />
                  </div>
                </div>

                {/* Last choice */}
                {lastChoice && (
                  <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <div className="text-[10px] uppercase tracking-widest text-white/50">Last Major Choice</div>
                    <div className="mt-0.5 text-sm text-white/90">Path {lastChoice}</div>
                  </div>
                )}

                {/* Relationship snapshot */}
                <div className="flex flex-wrap gap-1.5">
                  {topRel.map(([key, val]) => (
                    <span
                      key={key}
                      className="rounded-full border border-white/10 bg-black/40 px-2.5 py-0.5 text-[10px] text-white/70"
                    >
                      {key.replace(/_/g, ' ')}: <span className="font-bold text-white">{val}</span>
                    </span>
                  ))}
                </div>

                {/* Ending summary */}
                {isComplete && m.ending_summary && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
                      Final Ending
                    </div>
                    <div className="mt-1 font-display text-sm font-bold text-white">{m.ending_title}</div>
                    <div className="mt-0.5 text-xs italic text-white/70">{m.ending_summary}</div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => onContinue(m.id)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-violet-500/30"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    {isComplete ? 'Re-read' : 'Continue'}
                  </button>
                  {isComplete && (
                    <button
                      onClick={() => handleShareToggle(m)}
                      className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-widest ${
                        m.share_enabled
                          ? 'bg-emerald-600 text-white'
                          : 'border border-white/15 bg-white/5 text-white/80'
                      }`}
                    >
                      {m.share_enabled ? <Globe className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
                      {m.share_enabled ? 'Public' : 'Share Ending'}
                    </button>
                  )}
                  {!isComplete && (
                    <button
                      onClick={() => handleShareToggle(m)}
                      title={m.share_enabled ? 'Make private' : 'Share progress'}
                      className="flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-white/70"
                    >
                      {m.share_enabled ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    </button>
                  )}
                  <button
                    onClick={() => handleRename(m.id)}
                    title="Rename"
                    className="flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-white/70 hover:text-white"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setReplayingId(replayingId === m.id ? null : m.id)}
                    title="Replay from a choice"
                    className="flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-white/70 hover:text-white"
                  >
                    <GitBranch className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    title="Delete"
                    className="flex items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-red-300 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Replay chooser */}
                {replayingId === m.id && (
                  <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                        Replay from chapterâ€¦
                      </div>
                      <button
                        onClick={() => setReplayingId(null)}
                        className="text-[10px] uppercase tracking-widest text-white/40"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.from({ length: m.current_chapter }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            onReplayFrom(m.id, i + 1);
                            setReplayingId(null);
                          }}
                          className="rounded-full border border-violet-500/40 bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-200 hover:bg-violet-500/20"
                        >
                          Ch {i + 1}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-[10px] text-white/40">
                      Replaying will rewind this playthrough and discard later chapters.
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface SharedEndingScreenProps {
  slug: string;
  onBack: () => void;
}

export const SharedEndingScreen: React.FC<SharedEndingScreenProps> = ({ slug, onBack }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const mod = await import('../../lib/playthroughs');
        const result = await mod.fetchSharedBySlug(slug);
        setData(result);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  return (
    <div className="min-h-screen bg-black pb-24">
      <button
        onClick={onBack}
        className="fixed left-4 top-10 z-50 flex items-center gap-1 rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur-md"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>

      <div className="px-5 pt-24">
        {loading ? (
          <div className="text-center text-white/60">Loading shared endingâ€¦</div>
        ) : !data ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/70">
            This shared ending isn't available â€” it may have been made private.
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-zinc-900 to-black shadow-2xl shadow-amber-500/10">
            <div className="relative h-56">
              <img
                src={data.ending_card_image || data.cover_image || 'https://d64gsuwffb70l.cloudfront.net/6a0575852fdc9c6f0e9154fd_1778778646387_303e8c18.png'}
                alt={data.ending_title || data.branch_title}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-300">
                  Trey TV â€¢ Shared Ending
                </div>
                <h1 className="mt-1 font-display text-3xl font-black leading-tight text-white">
                  {data.ending_title || data.branch_title || 'A Shared Ending'}
                </h1>
              </div>
            </div>
            <div className="p-5 space-y-3">
              {data.ending_summary && (
                <p className="font-serif text-base italic text-white/85">"{data.ending_summary}"</p>
              )}
              {data.display_name && (
                <div className="text-xs text-white/50">Shared by {data.display_name}</div>
              )}
              <button
                onClick={onBack}
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white"
              >
                Start your own playthrough
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


/**
 * Tradio Broadcast Studio Pass 9B: Public Replay / Highlight Library
 * Public-facing interface for browsing and playing published clips
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Play, Calendar, Clock } from 'lucide-react';
import { createServerFn } from "@tanstack/react-start";
import {
  collectVisiblePublicApplications,
  PUBLIC_REPLAY_CLIP_COLUMNS,
  toPublicReplayClip,
  type PublicReplayClip,
} from '@/lib/trey-i/broadcastPublicReplayRules';
import type {
  PostShowApplication,
} from '@/lib/trey-i/broadcastPostShowTypes';

// Wrap server function for client-safe access
const loadPublicClipsClient = createServerFn({ method: "GET" })
  .inputValidator((input: { channelId?: string }) => input)
  .handler(async ({ data: input }): Promise<{ data: PublicReplayClip[]; error?: string }> => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    let query = (supabaseAdmin as any)
      .from('tradio_live_highlight_clips')
      .select(PUBLIC_REPLAY_CLIP_COLUMNS)
      .eq('visibility', 'public')
      .eq('clip_status', 'published');

    if (input.channelId) {
      query = query.eq('channel_id', input.channelId);
    }

    const { data, error } = await query.order('published_at', { ascending: false });
    if (error) return { data: [], error: error.message };

    const clipRows = (data || []) as Array<Record<string, unknown>>;
    const clipIds = clipRows
      .map((clip) => (typeof clip.id === 'string' ? clip.id : ''))
      .filter(Boolean);
    if (clipIds.length === 0) return { data: clipRows.map((clip) => toPublicReplayClip(clip)) };

    const { data: applicationRows } = await (supabaseAdmin as any)
      .from('tradio_post_show_applications')
      .select(
        'id, asset_id, clip_id, application_type, application_status, target_field, applied_value, applied_metadata, applied_at, updated_at',
      )
      .in('clip_id', clipIds)
      .in('application_status', ['applied', 'approved'])
      .order('updated_at', { ascending: false });

    const applicationsByClip = collectVisiblePublicApplications(
      (applicationRows || []) as PostShowApplication[],
    );

    return {
      data: clipRows.map((clip) =>
        toPublicReplayClip(
          clip,
          applicationsByClip.get(typeof clip.id === 'string' ? clip.id : '') ?? [],
        ),
      ),
    };
  });

interface PublicReplayLibraryProps {
  channelId?: string;
  onPlayClip?: (clip: PublicReplayClip) => void;
  onNavigate?: (view: string) => void;
}

export const PublicReplayLibrary: React.FC<PublicReplayLibraryProps> = ({ channelId, onPlayClip, onNavigate }) => {
  const [clips, setClips] = useState<PublicReplayClip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<Set<string>>(new Set());

  const loadPublicClips = useCallback(async () => {
    setLoading(true);
    try {
      const result = (await loadPublicClipsClient({ data: { channelId } })) as {
        data?: PublicReplayClip[];
        error?: string;
      };
      if (!result.error && result.data) {
        setClips(result.data as PublicReplayClip[]);

        // Collect all tags
        const tags = new Set<string>();
        result.data.forEach((clip: PublicReplayClip) => {
          clip.mood_tags?.forEach((tag: string) => tags.add(tag));
          clip.genre_tags?.forEach((tag: string) => tags.add(tag));
        });
        setAllTags(tags);
      }
    } catch (err) {
      console.error('Failed to load public clips:', err);
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  useEffect(() => {
    loadPublicClips();
  }, [loadPublicClips]);

  const filteredClips = filterTag
    ? clips.filter(
        (clip) =>
          clip.mood_tags?.includes(filterTag) ||
          clip.genre_tags?.includes(filterTag) ||
          clip.audience_tags?.includes(filterTag),
      )
    : clips;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <div className="size-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading highlights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-4xl font-bold text-gradient-gold">Replay Highlights</h1>
          <p className="text-muted-foreground mt-2">
            {filteredClips.length} {filteredClips.length === 1 ? 'clip' : 'clips'} available
          </p>
        </div>

        {/* Tag Filters */}
        {allTags.size > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Filter by mood</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterTag(null)}
                className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${
                  filterTag === null
                    ? 'bg-primary/20 text-primary border border-primary/50'
                    : 'bg-white/10 text-muted-foreground hover:text-foreground border border-white/20'
                }`}
              >
                All
              </button>
              {Array.from(allTags).map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                  className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${
                    filterTag === tag
                      ? 'bg-primary/20 text-primary border border-primary/50'
                      : 'bg-white/10 text-muted-foreground hover:text-foreground border border-white/20'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Clips Grid */}
      {filteredClips.length === 0 ? (
        <div className="p-12 rounded-2xl border border-dashed border-white/10 text-center">
          <p className="text-muted-foreground">No highlights available</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClips.map((clip) => (
            <div
              key={clip.id}
              className="group rounded-2xl border border-white/10 bg-white/[0.02] hover:border-primary/30 hover:bg-white/[0.05] transition-all overflow-hidden cursor-pointer"
              onClick={() => onPlayClip?.(clip)}
            >
              {/* Cover Art / Play Button */}
              <div className="relative aspect-square bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
                {clip.cover_art_url ? (
                  <img src={clip.cover_art_url} alt={clip.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <span className="text-4xl opacity-30">♫</span>
                  </div>
                )}

                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="size-16 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center">
                    <Play className="size-7 text-primary fill-current ml-1" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-foreground line-clamp-2">{clip.title}</h3>
                  {clip.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{clip.description}</p>
                  )}
                  {clip.caption && (
                    <p className="mt-2 rounded border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-white/60 line-clamp-2">
                      {clip.caption}
                    </p>
                  )}
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {clip.duration_seconds}s
                  </span>
                  {clip.published_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {new Date(clip.published_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                </div>

                {/* Tags */}
                {(clip.mood_tags?.length || 0) > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2 border-t border-white/10">
                    {clip.mood_tags?.slice(0, 2).map((tag) => (
                      <span key={tag} className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-300">
                        {tag}
                      </span>
                    ))}
                    {(clip.mood_tags?.length || 0) > 2 && (
                      <span className="px-2 py-1 rounded text-xs text-muted-foreground">
                        +{(clip.mood_tags?.length || 0) - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicReplayLibrary;

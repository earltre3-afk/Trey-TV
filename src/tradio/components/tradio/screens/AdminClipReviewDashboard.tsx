/**
 * Tradio Broadcast Studio Pass 9B: Admin Clip Review Dashboard
 * Interface for admins to review, approve, and moderate clips
 */

import React, { useEffect, useState } from 'react';
import { Check, X, Eye, Archive, AlertCircle, ChevronDown } from 'lucide-react';
import { createServerFn } from "@tanstack/react-start";
import type { HighlightClip } from '../types/broadcastArchiveTypes';

// Wrap server functions for client-safe access
const loadPendingClipsClient = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data, error } = await (supabaseAdmin as any)
      .from('tradio_live_highlight_clips')
      .select('*')
      .eq('clip_status', 'pending_review')
      .order('created_at', { ascending: true });
    return { data: data || [], error: error?.message };
  });

const approveClipClient = createServerFn({ method: "POST" })
  .inputValidator((input: { clipId: string; reviewNotes?: string }) => input)
  .handler(async ({ data: input }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { error } = await (supabaseAdmin as any)
      .from('tradio_live_highlight_clips')
      .update({
        clip_status: 'approved',
        review_notes: input.reviewNotes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.clipId);
    return { success: !error, error: error?.message };
  });

const rejectClipClient = createServerFn({ method: "POST" })
  .inputValidator((input: { clipId: string; reviewNotes?: string }) => input)
  .handler(async ({ data: input }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { error } = await (supabaseAdmin as any)
      .from('tradio_live_highlight_clips')
      .update({
        clip_status: 'rejected',
        review_notes: input.reviewNotes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.clipId);
    return { success: !error, error: error?.message };
  });

const hideClipClient = createServerFn({ method: "POST" })
  .inputValidator((input: { clipId: string; reviewNotes?: string }) => input)
  .handler(async ({ data: input }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { error } = await (supabaseAdmin as any)
      .from('tradio_live_highlight_clips')
      .update({
        clip_status: 'hidden',
        review_notes: input.reviewNotes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.clipId);
    return { success: !error, error: error?.message };
  });

interface AdminClipReviewDashboardProps {
  onNavigate?: (view: string) => void;
}

export const AdminClipReviewDashboard: React.FC<AdminClipReviewDashboardProps> = () => {
  const [pendingClips, setPendingClips] = useState<HighlightClip[]>([]);
  const [selectedClip, setSelectedClip] = useState<HighlightClip | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSnapshots, setExpandedSnapshots] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actioning, setActioning] = useState(false);

  useEffect(() => {
    loadPendingClips();
  }, []);

  const loadPendingClips = async () => {
    setLoading(true);
    try {
      const result = await loadPendingClipsClient();
      if (!result.error && result.data) {
        setPendingClips(result.data);
        if (result.data.length > 0) {
          setSelectedClip(result.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load pending clips:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedClip) return;
    setActioning(true);

    try {
      const result = await approveClipClient({ data: { clipId: selectedClip.id, reviewNotes } });

      if (result.success) {
        setPendingClips(pendingClips.filter((c) => c.id !== selectedClip.id));
        setSelectedClip(pendingClips.find((c) => c.id !== selectedClip.id) || null);
        setReviewNotes('');
      }
    } finally {
      setActioning(false);
    }
  };

  const handleReject = async () => {
    if (!selectedClip) return;
    setActioning(true);

    try {
      const result = await rejectClipClient({ data: { clipId: selectedClip.id, reviewNotes } });

      if (result.success) {
        setPendingClips(pendingClips.filter((c) => c.id !== selectedClip.id));
        setSelectedClip(pendingClips.find((c) => c.id !== selectedClip.id) || null);
        setReviewNotes('');
      }
    } finally {
      setActioning(false);
    }
  };

  const handleHide = async () => {
    if (!selectedClip) return;
    setActioning(true);

    try {
      const result = await hideClipClient({ data: { clipId: selectedClip.id, reviewNotes } });

      if (result.success) {
        setPendingClips(pendingClips.filter((c) => c.id !== selectedClip.id));
        setSelectedClip(pendingClips.find((c) => c.id !== selectedClip.id) || null);
        setReviewNotes('');
      }
    } finally {
      setActioning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <div className="size-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading pending clips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gradient-gold">Clip Review Queue</h1>
        <p className="text-muted-foreground">
          {pendingClips.length} {pendingClips.length === 1 ? 'clip' : 'clips'} awaiting review
        </p>
      </div>

      {pendingClips.length === 0 ? (
        <div className="p-8 rounded-2xl border border-dashed border-white/10 text-center">
          <Check className="size-12 text-green-400 mx-auto mb-3 opacity-50" />
          <p className="text-foreground font-semibold">All caught up!</p>
          <p className="text-sm text-muted-foreground mt-1">No pending clips to review</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Queue List */}
          <div className="space-y-2 lg:col-span-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground px-2">
              Pending Review
            </h2>
            <div className="space-y-2">
              {pendingClips.map((clip) => (
                <button
                  key={clip.id}
                  onClick={() => {
                    setSelectedClip(clip);
                    setReviewNotes('');
                  }}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    selectedClip?.id === clip.id
                      ? 'bg-primary/20 border border-primary/50'
                      : 'bg-white/5 border border-white/10 hover:border-white/20'
                  }`}
                >
                  <p className="text-sm font-semibold text-foreground line-clamp-1">{clip.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{clip.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Review Panel */}
          {selectedClip && (
            <div className="lg:col-span-2 space-y-6">
              {/* Clip Preview */}
              <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground">{selectedClip.title}</h3>
                  {selectedClip.description && (
                    <p className="text-sm text-muted-foreground mt-2">{selectedClip.description}</p>
                  )}
                </div>

                {/* Clip Details */}
                <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-white/5 text-sm">
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-semibold text-foreground">{selectedClip.duration_seconds}s</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Visibility</p>
                    <p className="font-semibold text-foreground">{selectedClip.visibility}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Creator</p>
                    <p className="font-semibold text-foreground text-xs">{selectedClip.owner_user_id.slice(0, 8)}...</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-semibold text-foreground">
                      {new Date(selectedClip.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Play Button */}
                {selectedClip.audio_url && (
                  <button className="w-full px-4 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary font-semibold transition-colors">
                    ▶ Preview Audio
                  </button>
                )}
              </div>

              {/* Snapshots */}
              <div className="space-y-3">
                {/* Consent Snapshot */}
                {selectedClip.rights_snapshot && Object.keys(selectedClip.rights_snapshot).length > 0 && (
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <button
                      onClick={() =>
                        setExpandedSnapshots(expandedSnapshots === 'consent' ? null : 'consent')
                      }
                      className="w-full flex items-center justify-between text-left"
                    >
                      <span className="text-sm font-semibold text-foreground">Consent Snapshot</span>
                      <ChevronDown
                        className={`size-4 transition-transform ${
                          expandedSnapshots === 'consent' ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {expandedSnapshots === 'consent' && (
                      <pre className="mt-2 text-xs text-muted-foreground bg-black/30 p-2 rounded overflow-auto max-h-40">
                        {JSON.stringify(selectedClip.rights_snapshot, null, 2)}
                      </pre>
                    )}
                  </div>
                )}

                {/* Engagement Snapshot */}
                {selectedClip.engagement_snapshot && Object.keys(selectedClip.engagement_snapshot).length > 0 && (
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <button
                      onClick={() =>
                        setExpandedSnapshots(expandedSnapshots === 'engagement' ? null : 'engagement')
                      }
                      className="w-full flex items-center justify-between text-left"
                    >
                      <span className="text-sm font-semibold text-foreground">Engagement Snapshot</span>
                      <ChevronDown
                        className={`size-4 transition-transform ${
                          expandedSnapshots === 'engagement' ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {expandedSnapshots === 'engagement' && (
                      <pre className="mt-2 text-xs text-muted-foreground bg-black/30 p-2 rounded overflow-auto max-h-40">
                        {JSON.stringify(selectedClip.engagement_snapshot, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>

              {/* Review Notes */}
              <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] space-y-3">
                <div>
                  <label className="text-sm font-semibold text-foreground">Review Notes</label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add notes for the creator (optional)"
                    rows={4}
                    className="w-full mt-2 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder-muted-foreground focus:border-primary/50 focus:outline-none resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleApprove}
                    disabled={actioning}
                    className="px-4 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-300 font-semibold transition-colors disabled:opacity-50"
                  >
                    <Check className="size-4 inline mr-2" />
                    Approve
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={actioning}
                    className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold transition-colors disabled:opacity-50"
                  >
                    <X className="size-4 inline mr-2" />
                    Reject
                  </button>
                  <button
                    onClick={handleHide}
                    disabled={actioning}
                    className="col-span-2 px-4 py-2 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 font-semibold transition-colors disabled:opacity-50"
                  >
                    <Eye className="size-4 inline mr-2" />
                    Hide from Public
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminClipReviewDashboard;

/**
 * Tradio Broadcast Studio Pass 9B: Creator Archive Dashboard
 * Interface for hosts to manage recordings, create clips, and publish archives
 */

import React, { useEffect, useState } from 'react';
import { Play, Plus, Clock, AlertCircle, Check, X, Edit2, Megaphone, BarChart3 } from 'lucide-react';
import { createServerFn } from "@tanstack/react-start";
import { listRecordingsForSessionServer, publishHighlightClipWithGatesServer } from '@/lib/trey-i/broadcastLiveArchive.server';
import type { LiveRecording, HighlightClip } from '../types/broadcastArchiveTypes';
import { toast } from 'sonner';
import { useTradioIdentity } from '../auth/useTradioIdentity';

// Wrap server function for client-safe access
const loadRecordingsClient = createServerFn({ method: "POST" })
  .inputValidator((input: { session_id?: string; limit?: number }) => input)
  .handler(async ({ data: input }) => {
    return await listRecordingsForSessionServer(input);
  });

interface CreatorArchiveDashboardProps {
  sessionId?: string;
  onNavigate?: (view: string) => void;
}

export const CreatorArchiveDashboard: React.FC<CreatorArchiveDashboardProps> = ({
  sessionId,
  onNavigate,
}) => {
  const { session } = useTradioIdentity();
  const [recordings, setRecordings] = useState<LiveRecording[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<LiveRecording | null>(null);
  const [clips, setClips] = useState<HighlightClip[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'recordings' | 'clips' | 'create'>('recordings');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecordings();
  }, [sessionId]);

  const loadRecordings = async () => {
    setLoading(true);
    setError(null);
      try {
      const result = await loadRecordingsClient({
        data: {
          session_id: sessionId,
          limit: 50,
        },
      });

      if (result.error) {
        setError(result.error);
      } else {
        setRecordings(result.recordings);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recordings');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishClip = async (clipId: string) => {
    try {
      if (!session?.access_token) {
        toast.error('You must be logged in to publish clips');
        return;
      }

      // Call server function with verified access token from Supabase session
      // Server verifies token using supabaseAdmin.auth.getUser(accessToken)
      // This derives verifiedUserId from the verified token (cannot be spoofed)
      // Publishing gates verify clip ownership against verifiedUserId
      const result = await publishHighlightClipWithGatesServer({
        data: {
          clip_id: clipId,
          accessToken: session.access_token,
          visibility: 'public',
        },
      });

      if (result.success) {
        toast.success('Clip published successfully!');
        // Update local clip status
        setClips(clips.map(c => c.id === clipId ? { ...c, clip_status: 'published', visibility: 'public' } : c));
      } else {
        // Show gate validation error (ownership, rendering, consent, etc.)
        toast.error(result.error || 'Failed to publish clip');
        // Show any warnings (e.g., rights need review)
        if (result.warnings && result.warnings.length > 0) {
          result.warnings.forEach((w: string) => toast.warning(w));
        }
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('authenticated')) {
        toast.error('You must be logged in to publish clips');
      } else {
        toast.error(err instanceof Error ? err.message : 'Publish failed');
      }
    }
  };

  const getRecordingStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'processing':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'recording':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30 animate-pulse';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getClipStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'pending_review':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'approved':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'rendering':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30 animate-pulse';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <div className="size-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading your archive...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gradient-gold">Archive Dashboard</h1>
          <p className="text-muted-foreground">Manage your recordings, create clips, and publish highlights</p>
        </div>
        {onNavigate && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onNavigate('campaign')}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-green-400/30 bg-green-400/10 px-3 py-2 text-sm font-semibold text-green-100 hover:bg-green-400/15"
            >
              <BarChart3 className="size-4" />
              Campaign
            </button>
            <button
              onClick={() => onNavigate('distribution')}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-400/15"
            >
              <Megaphone className="size-4" />
              Distribution Desk
            </button>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-2xl border border-red-500/30 bg-red-500/10 flex items-start gap-3">
          <AlertCircle className="size-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-300">Error</p>
            <p className="text-sm text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-white/10">
        {(['recordings', 'clips', 'create'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-semibold transition-all border-b-2 ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'recordings' && 'Recordings'}
            {tab === 'clips' && 'Clips'}
            {tab === 'create' && 'Create Clip'}
          </button>
        ))}
      </div>

      {/* Recordings Tab */}
      {activeTab === 'recordings' && (
        <div className="space-y-4">
          {recordings.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-white/10 text-center">
              <p className="text-muted-foreground">No recordings yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Enable recording during a live mic session to create your first archive
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {recordings.map((recording) => (
                <div
                  key={recording.id}
                  className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-primary/30 hover:bg-white/[0.05] transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedRecording(recording);
                    setActiveTab('create');
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {recording.recording_type === 'live_session'
                            ? 'Live Session Recording'
                            : recording.recording_type}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold border ${getRecordingStatusColor(
                            recording.recording_status,
                          )}`}
                        >
                          {recording.recording_status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="size-4" />
                          {recording.duration_seconds
                            ? `${Math.round(recording.duration_seconds / 60)}m`
                            : 'calculating...'}
                        </span>
                        <span>{new Date(recording.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRecording(recording);
                        setActiveTab('create');
                      }}
                      className="px-3 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary text-sm font-semibold transition-colors"
                    >
                      Create Clip
                    </button>
                  </div>

                  {/* Consent snapshot info */}
                  {recording.consent_snapshot && (
                    <div className="mt-3 pt-3 border-t border-white/10 text-xs text-muted-foreground">
                      <span>Recorded with consent tracking enabled</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Clips Tab */}
      {activeTab === 'clips' && (
        <div className="space-y-4">
          {clips.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-white/10 text-center">
              <p className="text-muted-foreground">No clips created yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create your first clip from a completed recording
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {clips.map((clip) => (
                <div
                  key={clip.id}
                  className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <h3 className="font-semibold text-foreground">{clip.title}</h3>
                      {clip.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{clip.description}</p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${getClipStatusColor(
                        clip.clip_status,
                      )}`}
                    >
                      {clip.clip_status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="size-4" />
                      {clip.duration_seconds}s
                    </span>
                    {clip.visibility && (
                      <span className="px-2 py-1 rounded-md bg-white/5 text-xs">{clip.visibility}</span>
                    )}
                  </div>

                  {/* Tags */}
                  {(clip.mood_tags?.length || 0) > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                      {clip.mood_tags?.map((tag) => (
                        <span key={tag} className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-white/10">
                    {onNavigate && (
                      <button
                        onClick={() => onNavigate('distribution')}
                        className="flex-1 px-3 py-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 text-sm font-semibold transition-colors"
                      >
                        <Megaphone className="size-4 inline mr-2" />
                        Draft Promo
                      </button>
                    )}
                    {clip.clip_status === 'draft' && (
                      <>
                        <button className="flex-1 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-semibold transition-colors">
                          <Edit2 className="size-4 inline mr-2" />
                          Edit
                        </button>
                        <button className="flex-1 px-3 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary text-sm font-semibold transition-colors">
                          Submit Review
                        </button>
                      </>
                    )}
                    {clip.clip_status === 'approved' && (
                      <button
                        onClick={() => handlePublishClip(clip.id)}
                        className="flex-1 px-3 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-300 text-sm font-semibold transition-colors"
                      >
                        Publish
                      </button>
                    )}
                    {clip.clip_status === 'pending_review' && (
                      <div className="flex-1 px-3 py-2 rounded-lg bg-orange-500/20 text-orange-300 text-sm font-semibold text-center">
                        Awaiting Review
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Clip Tab */}
      {activeTab === 'create' && (
        <div className="space-y-6">
          {!selectedRecording ? (
            <div className="p-8 rounded-2xl border border-dashed border-white/10 text-center">
              <p className="text-muted-foreground">Select a recording to create a clip</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Selected Recording Info */}
              <div className="p-4 rounded-2xl border border-primary/30 bg-primary/10">
                <p className="text-sm font-semibold text-primary">Selected Recording</p>
                <p className="text-sm text-foreground mt-1">
                  {selectedRecording.recording_type} •{' '}
                  {selectedRecording.duration_seconds
                    ? `${Math.round(selectedRecording.duration_seconds / 60)}m`
                    : 'calculating...'}
                </p>
              </div>

              {/* Clip Creation Form (placeholder) */}
              <div className="space-y-4 p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
                <div>
                  <label className="text-sm font-semibold text-foreground">Clip Title</label>
                  <input
                    type="text"
                    placeholder="Give your clip a title"
                    className="w-full mt-2 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder-muted-foreground focus:border-primary/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground">Description</label>
                  <textarea
                    placeholder="Optional: Describe what makes this clip special"
                    rows={3}
                    className="w-full mt-2 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder-muted-foreground focus:border-primary/50 focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-foreground">Start Time (seconds)</label>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full mt-2 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground focus:border-primary/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground">End Time (seconds)</label>
                    <input
                      type="number"
                      placeholder={String(Math.round((selectedRecording.duration_seconds || 300) / 2))}
                      className="w-full mt-2 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground focus:border-primary/50 focus:outline-none"
                    />
                  </div>
                </div>

                <button className="w-full px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-colors">
                  Create Clip
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CreatorArchiveDashboard;

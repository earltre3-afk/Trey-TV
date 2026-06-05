/**
 * Tradio Post-Show Producer Dashboard (Pass 10)
 * AI-assisted post-show asset generation and manual asset management.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Archive,
  Check,
  ChevronDown,
  Copy,
  Eye,
  Loader,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  createPostShowAssetServer,
  generatePostShowPackageServer,
  listPostShowAssetsForRecordingServer,
  listPostShowRecordingsServer,
  publishPostShowAssetServer,
  updatePostShowAssetServer,
} from '@/lib/trey-i/broadcastPostShow.server';
import type {
  PostShowAsset,
  PostShowAssetType,
  PostShowPlatform,
} from '@/lib/trey-i/broadcastPostShowTypes';

interface PostShowProducerProps {
  recording_id?: string;
  onNavigate?: (view: string) => void;
}

interface PostShowRecordingOption {
  id: string;
  recording_status?: string;
  duration_seconds?: number | null;
  created_at: string;
}

const ASSET_TYPES: PostShowAssetType[] = [
  'show_summary',
  'clip_title',
  'clip_caption',
  'social_post',
  'newsletter_blurb',
  'episode_description',
  'replay_blurb',
  'thumbnail_prompt',
  'seo_description',
  'follow_up_topic',
];

const PLATFORM_OPTIONS: PostShowPlatform[] = [
  'tradio',
  'instagram',
  'tiktok',
  'youtube',
  'newsletter',
  'website',
  'generic',
];

export const PostShowProducerDashboard: React.FC<PostShowProducerProps> = ({ recording_id }) => {
  const [activeRecordingId, setActiveRecordingId] = useState<string | null>(recording_id ?? null);
  const [recordingOptions, setRecordingOptions] = useState<PostShowRecordingOption[]>([]);
  const [loadingRecordings, setLoadingRecordings] = useState(true);
  const [assets, setAssets] = useState<PostShowAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<Set<PostShowAssetType>>(new Set(ASSET_TYPES));
  const [includeFollowUps, setIncludeFollowUps] = useState(true);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingText, setEditingText] = useState('');
  const [aiUnavailableMessage, setAiUnavailableMessage] = useState<string | null>(null);
  const [manualType, setManualType] = useState<PostShowAssetType>('show_summary');
  const [manualPlatform, setManualPlatform] = useState<PostShowPlatform>('tradio');
  const [manualTitle, setManualTitle] = useState('');
  const [manualBody, setManualBody] = useState('');
  const [savingManual, setSavingManual] = useState(false);
  const [selectedTopicIds, setSelectedTopicIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (recording_id) {
      setActiveRecordingId(recording_id);
    }
  }, [recording_id]);

  const loadRecordings = useCallback(async () => {
    setLoadingRecordings(true);
    try {
      const result = await listPostShowRecordingsServer({
        data: { limit: 25 },
      });
      if (result.error) {
        toast.error(result.error);
        setRecordingOptions([]);
      } else {
        setRecordingOptions(result.recordings);
        setActiveRecordingId((current) => current ?? result.recordings[0]?.id ?? null);
      }
    } catch {
      toast.error('Failed to load recordings');
    } finally {
      setLoadingRecordings(false);
    }
  }, []);

  useEffect(() => {
    loadRecordings();
  }, [loadRecordings]);

  const loadAssets = useCallback(async () => {
    if (!activeRecordingId) {
      setAssets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await listPostShowAssetsForRecordingServer({
        data: { recording_id: activeRecordingId },
      });
      if (!result.error) {
        setAssets(result.assets);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to load post-show assets');
    } finally {
      setLoading(false);
    }
  }, [activeRecordingId]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const followUpAssets = useMemo(
    () => assets.filter((asset) => asset.asset_type === 'follow_up_topic'),
    [assets],
  );

  const producerAssets = useMemo(
    () => assets.filter((asset) => asset.asset_type !== 'follow_up_topic'),
    [assets],
  );

  const handleGenerate = async () => {
    if (selectedTypes.size === 0) {
      toast.error('Select at least one asset type');
      return;
    }
    if (!activeRecordingId) {
      toast.error('Select a recording first');
      return;
    }

    setAiUnavailableMessage(null);
    setGenerating(true);
    try {
      const result = await generatePostShowPackageServer({
        data: {
          source_type: 'recording',
          source_id: activeRecordingId,
          asset_types: Array.from(selectedTypes),
          include_follow_ups: includeFollowUps,
        },
      });

      if (result.success) {
        toast.success('Generated private post-show drafts');
        await loadAssets();
      } else if (result.provider_unavailable) {
        setAiUnavailableMessage(
          result.error ||
            'AI provider unavailable. Continue with manual assets; no AI output was generated.',
        );
      } else {
        toast.error(result.error || 'Generation failed');
      }
    } catch {
      toast.error('Generation error');
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateManualAsset = async () => {
    if (!manualBody.trim()) {
      toast.error('Write the asset copy before saving');
      return;
    }
    if (!activeRecordingId) {
      toast.error('Select a recording first');
      return;
    }

    setSavingManual(true);
    try {
      const result = await createPostShowAssetServer({
        data: {
          recording_id: activeRecordingId,
          asset_type: manualType,
          platform: manualPlatform,
          title: manualTitle,
          body: manualBody,
        },
      });

      if (result.success) {
        toast.success('Manual asset saved as a private draft');
        setManualTitle('');
        setManualBody('');
        await loadAssets();
      } else {
        toast.error(result.error || 'Manual asset save failed');
      }
    } catch {
      toast.error('Manual asset save failed');
    } finally {
      setSavingManual(false);
    }
  };

  const handleUpdateAsset = async (assetId: string, newTitle: string, newBody: string) => {
    try {
      const result = await updatePostShowAssetServer({
        data: {
          asset_id: assetId,
          title: newTitle,
          body: newBody,
          asset_status: 'edited',
          visibility: 'private',
          edit_reason: 'Creator edit',
        },
      });

      if (result.success) {
        setAssets((current) =>
          current.map((asset) =>
            asset.id === assetId
              ? { ...asset, title: newTitle, body: newBody, asset_status: 'edited' }
              : asset,
          ),
        );
        setEditingAssetId(null);
        toast.success('Private draft updated');
      } else {
        toast.error(result.error || 'Update failed');
      }
    } catch {
      toast.error('Update failed');
    }
  };

  const handleSubmitReview = async (asset: PostShowAsset) => {
    try {
      const result = await updatePostShowAssetServer({
        data: {
          asset_id: asset.id,
          asset_status: 'pending_review',
          visibility: 'private',
          edit_reason: 'Submitted for post-show review',
        },
      });

      if (result.success) {
        toast.success('Submitted for review');
        await loadAssets();
      } else {
        toast.error(result.error || 'Submit failed');
      }
    } catch {
      toast.error('Submit failed');
    }
  };

  const handlePublish = async (asset: PostShowAsset) => {
    try {
      const result = await publishPostShowAssetServer({
        data: {
          asset_id: asset.id,
          visibility: 'public',
        },
      });

      if (result.success) {
        toast.success('Published post-show asset');
        await loadAssets();
      } else {
        toast.error(result.error || 'Publish failed');
      }
    } catch {
      toast.error('Publish failed');
    }
  };

  const handleSaveSelectedTopics = async () => {
    if (selectedTopicIds.size === 0) {
      toast.error('Select at least one follow-up topic');
      return;
    }

    try {
      await Promise.all(
        Array.from(selectedTopicIds).map((assetId) =>
          updatePostShowAssetServer({
            data: {
              asset_id: assetId,
              asset_status: 'edited',
              visibility: 'private',
              edit_reason: 'Creator saved follow-up topic',
            },
          }),
        ),
      );
      setSelectedTopicIds(new Set());
      toast.success('Selected topics saved as private drafts');
      await loadAssets();
    } catch {
      toast.error('Could not save selected topics');
    }
  };

  const toggleAssetType = (type: PostShowAssetType) => {
    setSelectedTypes((current) => {
      const next = new Set(current);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const toggleTopicSelection = (assetId: string) => {
    setSelectedTopicIds((current) => {
      const next = new Set(current);
      if (next.has(assetId)) {
        next.delete(assetId);
      } else {
        next.add(assetId);
      }
      return next;
    });
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard?.writeText(text);
    toast.success('Copied');
  };

  if (loading || loadingRecordings) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="space-y-3 text-center">
          <Loader className="mx-auto h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading post-show workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-yellow-400" />
          <h1 className="text-3xl font-bold">Post-Show Producer</h1>
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Generate private drafts, keep useful follow-up topics, submit assets for review, and
          publish only after approval.
        </p>
      </div>

      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <label className="text-sm font-semibold">Recording</label>
        <select
          value={activeRecordingId ?? ''}
          onChange={(event) => setActiveRecordingId(event.target.value || null)}
          className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-sm"
        >
          <option value="">Select a recording</option>
          {recordingOptions.map((recording) => (
            <option key={recording.id} value={recording.id}>
              {new Date(recording.created_at).toLocaleString()} - {recording.recording_status || 'recording'} -{' '}
              {formatDuration(recording.duration_seconds ?? 0)}
            </option>
          ))}
        </select>
        {!activeRecordingId && (
          <p className="mt-2 text-sm text-yellow-100/75">
            Choose a completed recording before generating or saving post-show assets.
          </p>
        )}
      </section>

      {aiUnavailableMessage && (
        <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-4">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-300" />
            <div className="space-y-1">
              <p className="font-semibold text-yellow-200">AI provider unavailable</p>
              <p className="text-sm text-yellow-100/80">{aiUnavailableMessage}</p>
              <p className="text-sm text-yellow-100/70">
                Manual creation is available below. No generated copy was saved for the failed AI
                run.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <section className="rounded-lg border border-slate-700 bg-slate-900/40 p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">Generate private drafts</h2>
              <p className="mt-1 text-xs text-slate-400">
                AI results stay private until edited, reviewed, and explicitly published.
              </p>
            </div>
            <ShieldCheck className="h-5 w-5 text-green-300" />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {ASSET_TYPES.map((type) => (
              <label
                key={type}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-2 text-sm transition hover:bg-white/[0.06]"
              >
                <input
                  type="checkbox"
                  checked={selectedTypes.has(type)}
                  onChange={() => toggleAssetType(type)}
                  className="rounded"
                />
                <span>{formatAssetType(type)}</span>
              </label>
            ))}
          </div>

          <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={includeFollowUps}
              onChange={(event) => setIncludeFollowUps(event.target.checked)}
              className="rounded"
            />
            Include follow-up topic suggestions
          </label>

          <button
            onClick={handleGenerate}
            disabled={generating || selectedTypes.size === 0 || !activeRecordingId}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-yellow-500/50 bg-yellow-500/20 px-4 py-2 font-semibold text-yellow-200 transition hover:bg-yellow-500/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Assets
              </>
            )}
          </button>
        </section>

        <section className="rounded-lg border border-cyan-500/30 bg-cyan-500/[0.06] p-5">
          <div className="mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-cyan-300" />
            <h2 className="font-semibold text-cyan-100">Manual asset</h2>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <select
                value={manualType}
                onChange={(event) => setManualType(event.target.value as PostShowAssetType)}
                className="rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-sm"
              >
                {ASSET_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {formatAssetType(type)}
                  </option>
                ))}
              </select>
              <select
                value={manualPlatform}
                onChange={(event) => setManualPlatform(event.target.value as PostShowPlatform)}
                className="rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-sm"
              >
                {PLATFORM_OPTIONS.map((platform) => (
                  <option key={platform} value={platform}>
                    {formatAssetType(platform)}
                  </option>
                ))}
              </select>
            </div>
            <input
              value={manualTitle}
              onChange={(event) => setManualTitle(event.target.value)}
              placeholder="Title"
              className="w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-sm"
            />
            <textarea
              value={manualBody}
              onChange={(event) => setManualBody(event.target.value)}
              placeholder="Write manual copy..."
              rows={6}
              className="w-full resize-none rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-sm"
            />
            <button
              onClick={handleCreateManualAsset}
              disabled={savingManual || !activeRecordingId}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-400/40 bg-cyan-400/15 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/25 disabled:opacity-50"
            >
              {savingManual ? <Loader className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Save Private Draft
            </button>
          </div>
        </section>
      </div>

      {followUpAssets.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Follow-up topics</h2>
            <button
              onClick={handleSaveSelectedTopics}
              className="rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/25"
            >
              Save Selected
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {followUpAssets.map((asset) => (
              <label
                key={asset.id}
                className="flex cursor-pointer gap-3 rounded-lg border border-emerald-500/25 bg-emerald-500/[0.06] p-4"
              >
                <input
                  type="checkbox"
                  checked={selectedTopicIds.has(asset.id)}
                  onChange={() => toggleTopicSelection(asset.id)}
                  className="mt-1 rounded"
                />
                <span className="space-y-2">
                  <span className="block font-semibold text-emerald-100">{asset.title}</span>
                  <span className="block text-sm text-emerald-50/75">{asset.body}</span>
                  <span className="block text-xs text-emerald-200/60">{asset.asset_status}</span>
                </span>
              </label>
            ))}
          </div>
        </section>
      )}

      {producerAssets.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Post-show assets</h2>
          {producerAssets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              expanded={expandedAssetId === asset.id}
              editing={editingAssetId === asset.id}
              editingTitle={editingTitle}
              editingText={editingText}
              onToggle={() => setExpandedAssetId(expandedAssetId === asset.id ? null : asset.id)}
              onCopy={() => copyToClipboard(asset.body)}
              onEdit={() => {
                setEditingAssetId(asset.id);
                setEditingTitle(asset.title || '');
                setEditingText(asset.body);
              }}
              onCancelEdit={() => setEditingAssetId(null)}
              onEditingTitle={setEditingTitle}
              onEditingText={setEditingText}
              onSave={() => handleUpdateAsset(asset.id, editingTitle, editingText)}
              onSubmitReview={() => handleSubmitReview(asset)}
              onPublish={() => handlePublish(asset)}
            />
          ))}
        </section>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-700 py-12 text-center">
          <Archive className="mx-auto mb-3 h-10 w-10 text-slate-500" />
          <p className="font-semibold text-slate-300">No post-show assets yet</p>
          <p className="mt-1 text-sm text-slate-500">Generate or create a private draft to begin.</p>
        </div>
      )}
    </div>
  );
};

function AssetCard({
  asset,
  expanded,
  editing,
  editingTitle,
  editingText,
  onToggle,
  onCopy,
  onEdit,
  onCancelEdit,
  onEditingTitle,
  onEditingText,
  onSave,
  onSubmitReview,
  onPublish,
}: {
  asset: PostShowAsset;
  expanded: boolean;
  editing: boolean;
  editingTitle: string;
  editingText: string;
  onToggle: () => void;
  onCopy: () => void;
  onEdit: () => void;
  onCancelEdit: () => void;
  onEditingTitle: (value: string) => void;
  onEditingText: (value: string) => void;
  onSave: () => void;
  onSubmitReview: () => void;
  onPublish: () => void;
}) {
  const canSubmitReview = ['draft', 'generated', 'edited'].includes(asset.asset_status);
  const canPublish = asset.asset_status === 'approved';

  return (
    <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-900/40">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 p-4 text-left transition hover:bg-slate-800/40"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">{formatAssetType(asset.asset_type)}</span>
            <StatusPill status={asset.asset_status} />
            <span className="rounded bg-white/5 px-2 py-1 text-xs text-slate-300">
              {asset.visibility}
            </span>
          </div>
          {asset.title && <p className="mt-1 truncate text-sm text-yellow-200">{asset.title}</p>}
        </div>
        <ChevronDown className={`h-5 w-5 shrink-0 transition ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-slate-700 p-4">
          {editing ? (
            <div className="space-y-3">
              <input
                value={editingTitle}
                onChange={(event) => onEditingTitle(event.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm"
              />
              <textarea
                value={editingText}
                onChange={(event) => onEditingText(event.target.value)}
                rows={7}
                className="w-full resize-none rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onSave}
                  className="rounded-lg border border-green-500/40 bg-green-500/15 px-3 py-2 text-sm font-semibold text-green-200"
                >
                  <Check className="mr-1 inline h-4 w-4" />
                  Save
                </button>
                <button
                  onClick={onCancelEdit}
                  className="rounded-lg border border-slate-600 bg-slate-700/30 px-3 py-2 text-sm font-semibold text-slate-200"
                >
                  <X className="mr-1 inline h-4 w-4" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{asset.body}</p>

              {asset.metadata && Object.keys(asset.metadata).length > 0 && (
                <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-xs text-slate-400">
                  {Object.entries(asset.metadata).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-slate-500">{key}:</span> {formatMetadataValue(value)}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={onCopy}
                  className="rounded-lg border border-blue-500/40 bg-blue-500/15 px-3 py-2 text-sm font-semibold text-blue-200"
                >
                  <Copy className="mr-1 inline h-4 w-4" />
                  Copy
                </button>
                <button
                  onClick={onEdit}
                  className="rounded-lg border border-slate-600 bg-slate-700/30 px-3 py-2 text-sm font-semibold text-slate-200"
                >
                  Edit
                </button>
                {canSubmitReview && (
                  <button
                    onClick={onSubmitReview}
                    className="rounded-lg border border-orange-500/40 bg-orange-500/15 px-3 py-2 text-sm font-semibold text-orange-200"
                  >
                    <Send className="mr-1 inline h-4 w-4" />
                    Submit Review
                  </button>
                )}
                {canPublish && (
                  <button
                    onClick={onPublish}
                    className="rounded-lg border border-green-500/40 bg-green-500/15 px-3 py-2 text-sm font-semibold text-green-200"
                  >
                    <Eye className="mr-1 inline h-4 w-4" />
                    Publish Public
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === 'published'
      ? 'bg-green-500/15 text-green-200 border-green-500/35'
      : status === 'approved'
        ? 'bg-cyan-500/15 text-cyan-200 border-cyan-500/35'
        : status === 'pending_review'
          ? 'bg-orange-500/15 text-orange-200 border-orange-500/35'
          : status === 'rejected'
            ? 'bg-red-500/15 text-red-200 border-red-500/35'
            : 'bg-slate-500/15 text-slate-200 border-slate-500/35';

  return <span className={`rounded border px-2 py-1 text-xs ${tone}`}>{status}</span>;
}

function formatAssetType(type: string): string {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatMetadataValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(', ');
  if (value && typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function formatDuration(seconds: number): string {
  if (!seconds) return '0s';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  if (minutes <= 0) return `${remainingSeconds}s`;
  return `${minutes}m ${remainingSeconds}s`;
}

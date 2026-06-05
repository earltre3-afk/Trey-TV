/**
 * Tradio Post-Show Producer admin review queue (Pass 10A).
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Archive, Check, ChevronDown, Loader, Megaphone, ShieldCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  approvePostShowAssetServer,
  archivePostShowAssetServer,
  listPendingPostShowAssetsForReviewServer,
  rejectPostShowAssetServer,
} from '@/lib/trey-i/broadcastPostShow.server';
import {
  approvePostShowApplication,
  listPendingPostShowApplicationsForReview,
  rejectPostShowApplication,
} from '@/lib/trey-i/broadcastPostShowPublisher.server';
import {
  approveDistributionDraft,
  archiveDistributionDraft,
  listPendingDistributionDraftReviews,
  rejectDistributionDraft,
} from '@/lib/trey-i/broadcastDistribution.server';
import type { DistributionDraft } from '@/lib/trey-i/broadcastDistributionTypes';
import type { PostShowApplication, PostShowAsset } from '@/lib/trey-i/broadcastPostShowTypes';
import { canAdminPlatform } from '../auth/roleUtils';
import { useTradioIdentity } from '../auth/useTradioIdentity';

interface AdminPostShowReviewDashboardProps {
  onNavigate?: (view: string) => void;
}

export const AdminPostShowReviewDashboard: React.FC<AdminPostShowReviewDashboardProps> = () => {
  const { identity } = useTradioIdentity();
  const isAdmin = canAdminPlatform(identity);
  const [assets, setAssets] = useState<PostShowAsset[]>([]);
  const [applications, setApplications] = useState<PostShowApplication[]>([]);
  const [distributionDrafts, setDistributionDrafts] = useState<DistributionDraft[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [selectedDistributionDraftId, setSelectedDistributionDraftId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const [moderationNotes, setModerationNotes] = useState('');
  const [applicationNotes, setApplicationNotes] = useState('');
  const [distributionNotes, setDistributionNotes] = useState('');
  const [expandedPanel, setExpandedPanel] = useState<
    'source' | 'moderation' | 'application-metadata' | 'distribution-metadata' | null
  >('source');

  const loadQueue = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [assetResult, applicationResult, distributionResult] = await Promise.all([
        listPendingPostShowAssetsForReviewServer(),
        listPendingPostShowApplicationsForReview(),
        listPendingDistributionDraftReviews(),
      ]);

      if (assetResult.error) {
        toast.error(assetResult.error);
        setAssets([]);
        setSelectedAssetId(null);
      } else {
        setAssets(assetResult.assets);
        setSelectedAssetId((current) => current ?? assetResult.assets[0]?.id ?? null);
      }

      if (applicationResult.error) {
        toast.error(applicationResult.error);
        setApplications([]);
        setSelectedApplicationId(null);
      } else {
        setApplications(applicationResult.applications);
        setSelectedApplicationId((current) => current ?? applicationResult.applications[0]?.id ?? null);
      }

      if (distributionResult.error) {
        toast.error(distributionResult.error);
        setDistributionDrafts([]);
        setSelectedDistributionDraftId(null);
      } else {
        setDistributionDrafts(distributionResult.drafts);
        setSelectedDistributionDraftId((current) => current ?? distributionResult.drafts[0]?.id ?? null);
      }
    } catch {
      toast.error('Failed to load post-show review queue');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const selectedAsset = useMemo(
    () => assets.find((asset) => asset.id === selectedAssetId) ?? null,
    [assets, selectedAssetId],
  );

  const selectedApplication = useMemo(
    () => applications.find((application) => application.id === selectedApplicationId) ?? null,
    [applications, selectedApplicationId],
  );

  const selectedDistributionDraft = useMemo(
    () => distributionDrafts.find((draft) => draft.id === selectedDistributionDraftId) ?? null,
    [distributionDrafts, selectedDistributionDraftId],
  );

  const removeSelected = () => {
    if (!selectedAsset) return;
    const remaining = assets.filter((asset) => asset.id !== selectedAsset.id);
    setAssets(remaining);
    setSelectedAssetId(remaining[0]?.id ?? null);
    setModerationNotes('');
  };

  const removeSelectedApplication = () => {
    if (!selectedApplication) return;
    const remaining = applications.filter((application) => application.id !== selectedApplication.id);
    setApplications(remaining);
    setSelectedApplicationId(remaining[0]?.id ?? null);
    setApplicationNotes('');
  };

  const removeSelectedDistributionDraft = () => {
    if (!selectedDistributionDraft) return;
    const remaining = distributionDrafts.filter((draft) => draft.id !== selectedDistributionDraft.id);
    setDistributionDrafts(remaining);
    setSelectedDistributionDraftId(remaining[0]?.id ?? null);
    setDistributionNotes('');
  };

  const handleApprove = async () => {
    if (!selectedAsset) return;
    setActioning(true);
    try {
      const result = await approvePostShowAssetServer({
        data: { asset_id: selectedAsset.id, moderation_notes: moderationNotes },
      });
      if (result.success) {
        toast.success('Post-show asset approved');
        removeSelected();
      } else {
        toast.error(result.error || 'Approval failed');
      }
    } finally {
      setActioning(false);
    }
  };

  const handleReject = async () => {
    if (!selectedAsset) return;
    if (!moderationNotes.trim()) {
      toast.error('Add moderation notes before rejecting');
      return;
    }

    setActioning(true);
    try {
      const result = await rejectPostShowAssetServer({
        data: { asset_id: selectedAsset.id, rejection_reason: moderationNotes },
      });
      if (result.success) {
        toast.success('Post-show asset rejected');
        removeSelected();
      } else {
        toast.error(result.error || 'Rejection failed');
      }
    } finally {
      setActioning(false);
    }
  };

  const handleArchive = async () => {
    if (!selectedAsset) return;
    setActioning(true);
    try {
      const result = await archivePostShowAssetServer({
        data: { asset_id: selectedAsset.id, moderation_notes: moderationNotes },
      });
      if (result.success) {
        toast.success('Post-show asset archived');
        removeSelected();
      } else {
        toast.error(result.error || 'Archive failed');
      }
    } finally {
      setActioning(false);
    }
  };

  const handleApproveApplication = async () => {
    if (!selectedApplication) return;
    setActioning(true);
    try {
      const result = await approvePostShowApplication({
        data: { application_id: selectedApplication.id, review_notes: applicationNotes },
      });
      if (result.success) {
        toast.success('Application approved');
        removeSelectedApplication();
      } else {
        toast.error(result.error || 'Application approval failed');
      }
    } finally {
      setActioning(false);
    }
  };

  const handleRejectApplication = async () => {
    if (!selectedApplication) return;
    if (!applicationNotes.trim()) {
      toast.error('Add notes before rejecting an application');
      return;
    }

    setActioning(true);
    try {
      const result = await rejectPostShowApplication({
        data: { application_id: selectedApplication.id, rejection_reason: applicationNotes },
      });
      if (result.success) {
        toast.success('Application rejected');
        removeSelectedApplication();
      } else {
        toast.error(result.error || 'Application rejection failed');
      }
    } finally {
      setActioning(false);
    }
  };

  const handleApproveDistributionDraft = async () => {
    if (!selectedDistributionDraft) return;
    setActioning(true);
    try {
      const result = await approveDistributionDraft({
        data: { draft_id: selectedDistributionDraft.id, review_notes: distributionNotes },
      });
      if (result.success) {
        toast.success('Distribution draft approved');
        removeSelectedDistributionDraft();
      } else {
        toast.error(result.error || 'Distribution approval failed');
      }
    } finally {
      setActioning(false);
    }
  };

  const handleRejectDistributionDraft = async () => {
    if (!selectedDistributionDraft) return;
    if (!distributionNotes.trim()) {
      toast.error('Add notes before rejecting a distribution draft');
      return;
    }
    setActioning(true);
    try {
      const result = await rejectDistributionDraft({
        data: { draft_id: selectedDistributionDraft.id, rejection_reason: distributionNotes },
      });
      if (result.success) {
        toast.success('Distribution draft rejected');
        removeSelectedDistributionDraft();
      } else {
        toast.error(result.error || 'Distribution rejection failed');
      }
    } finally {
      setActioning(false);
    }
  };

  const handleArchiveDistributionDraft = async () => {
    if (!selectedDistributionDraft) return;
    setActioning(true);
    try {
      const result = await archiveDistributionDraft({
        data: { draft_id: selectedDistributionDraft.id, review_notes: distributionNotes },
      });
      if (result.success) {
        toast.success('Distribution draft archived');
        removeSelectedDistributionDraft();
      } else {
        toast.error(result.error || 'Distribution archive failed');
      }
    } finally {
      setActioning(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
        <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-red-300" />
        <p className="font-semibold text-red-100">Admin access required</p>
        <p className="mt-1 text-sm text-red-100/70">
          Post-show review is restricted to trusted admin and owner roles.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="space-y-3 text-center">
          <Loader className="mx-auto h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading post-show review queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gradient-gold">Post-Show Review Queue</h1>
        <p className="text-sm text-muted-foreground">
          {assets.length} generated assets, {applications.length} applications, and {distributionDrafts.length}{' '}
          distribution drafts awaiting review.
        </p>
      </div>

      {assets.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/10 p-8 text-center">
          <Check className="mx-auto mb-3 h-10 w-10 text-green-300/60" />
          <p className="font-semibold">All caught up</p>
          <p className="mt-1 text-sm text-muted-foreground">No post-show assets need review.</p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-2">
            <h2 className="px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Pending Review
            </h2>
            {assets.map((asset) => (
              <button
                key={asset.id}
                onClick={() => {
                  setSelectedAssetId(asset.id);
                  setModerationNotes('');
                }}
                className={`w-full rounded-lg border p-3 text-left transition ${
                  selectedAsset?.id === asset.id
                    ? 'border-yellow-400/50 bg-yellow-400/10'
                    : 'border-white/10 bg-white/[0.04] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{formatAssetType(asset.asset_type)}</span>
                  <span className="rounded bg-black/25 px-2 py-1 text-[11px] text-white/70">
                    {asset.asset_status}
                  </span>
                </div>
                <p className="mt-1 line-clamp-1 text-xs text-yellow-100/80">
                  {asset.title || 'Untitled asset'}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-white/45">{asset.body}</p>
              </button>
            ))}
          </aside>

          {selectedAsset && (
            <section className="space-y-4">
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded border border-cyan-400/30 bg-cyan-400/10 px-2 py-1 text-xs text-cyan-100">
                    {formatAssetType(selectedAsset.asset_type)}
                  </span>
                  <span className="rounded border border-orange-400/30 bg-orange-400/10 px-2 py-1 text-xs text-orange-100">
                    {selectedAsset.asset_status}
                  </span>
                  <span className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/65">
                    {selectedAsset.visibility}
                  </span>
                </div>
                <h2 className="text-xl font-bold">{selectedAsset.title || 'Untitled asset'}</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-white/75">
                  {selectedAsset.body}
                </p>
              </div>

              <ReviewDisclosure
                title="Source Snapshot"
                expanded={expandedPanel === 'source'}
                onToggle={() => setExpandedPanel(expandedPanel === 'source' ? null : 'source')}
              >
                <pre className="max-h-64 overflow-auto rounded bg-black/30 p-3 text-xs text-white/65">
                  {JSON.stringify(selectedAsset.source_snapshot || {}, null, 2)}
                </pre>
              </ReviewDisclosure>

              <ReviewDisclosure
                title="Safety Warnings / Moderation Snapshot"
                expanded={expandedPanel === 'moderation'}
                onToggle={() =>
                  setExpandedPanel(expandedPanel === 'moderation' ? null : 'moderation')
                }
              >
                <div className="space-y-3">
                  <WarningList asset={selectedAsset} />
                  <pre className="max-h-56 overflow-auto rounded bg-black/30 p-3 text-xs text-white/65">
                    {JSON.stringify(selectedAsset.moderation_snapshot || {}, null, 2)}
                  </pre>
                </div>
              </ReviewDisclosure>

              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <label className="text-sm font-semibold">Moderation Notes</label>
                <textarea
                  value={moderationNotes}
                  onChange={(event) => setModerationNotes(event.target.value)}
                  rows={4}
                  className="mt-2 w-full resize-none rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm"
                  placeholder="Notes for approval, rejection, or archive action"
                />
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <button
                    onClick={handleApprove}
                    disabled={actioning}
                    className="rounded-lg border border-green-500/40 bg-green-500/15 px-3 py-2 text-sm font-semibold text-green-200 disabled:opacity-50"
                  >
                    <Check className="mr-1 inline h-4 w-4" />
                    Approve
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={actioning}
                    className="rounded-lg border border-red-500/40 bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-200 disabled:opacity-50"
                  >
                    <X className="mr-1 inline h-4 w-4" />
                    Reject
                  </button>
                  <button
                    onClick={handleArchive}
                    disabled={actioning}
                    className="rounded-lg border border-slate-500/40 bg-slate-500/15 px-3 py-2 text-sm font-semibold text-slate-200 disabled:opacity-50"
                  >
                    <Archive className="mr-1 inline h-4 w-4" />
                    Archive
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Publisher Applications</h2>
            <p className="text-sm text-muted-foreground">
              {applications.length} pending target applications.
            </p>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 p-6 text-center">
            <Check className="mx-auto mb-3 h-8 w-8 text-green-300/60" />
            <p className="font-semibold">No applications need review</p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
            <aside className="space-y-2">
              {applications.map((application) => (
                <button
                  key={application.id}
                  onClick={() => {
                    setSelectedApplicationId(application.id);
                    setApplicationNotes('');
                  }}
                  className={`w-full rounded-lg border p-3 text-left transition ${
                    selectedApplication?.id === application.id
                      ? 'border-cyan-400/50 bg-cyan-400/10'
                      : 'border-white/10 bg-white/[0.04] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">
                      {formatAssetType(application.application_type)}
                    </span>
                    <span className="rounded bg-black/25 px-2 py-1 text-[11px] text-white/70">
                      {application.application_status}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-white/50">
                    {application.applied_value}
                  </p>
                </button>
              ))}
            </aside>

            {selectedApplication && (
              <div className="space-y-4">
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded border border-cyan-400/30 bg-cyan-400/10 px-2 py-1 text-xs text-cyan-100">
                      {formatAssetType(selectedApplication.application_type)}
                    </span>
                    {selectedApplication.target_field && (
                      <span className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/65">
                        {selectedApplication.target_field}
                      </span>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/75">
                    {selectedApplication.applied_value}
                  </p>
                  {selectedApplication.previous_value !== null && (
                    <div className="mt-3 rounded border border-white/10 bg-black/20 p-3 text-xs text-white/55">
                      <span className="text-white/35">Previous:</span>{' '}
                      {selectedApplication.previous_value || 'Empty'}
                    </div>
                  )}
                </div>

                <ReviewDisclosure
                  title="Safe Application Metadata"
                  expanded={expandedPanel === 'moderation'}
                  onToggle={() =>
                    setExpandedPanel(expandedPanel === 'moderation' ? null : 'moderation')
                  }
                >
                  <pre className="max-h-56 overflow-auto rounded bg-black/30 p-3 text-xs text-white/65">
                    {JSON.stringify(selectedApplication.applied_metadata || {}, null, 2)}
                  </pre>
                </ReviewDisclosure>

                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <label className="text-sm font-semibold">Application Notes</label>
                  <textarea
                    value={applicationNotes}
                    onChange={(event) => setApplicationNotes(event.target.value)}
                    rows={4}
                    className="mt-2 w-full resize-none rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm"
                    placeholder="Notes for approval or rejection"
                  />
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <button
                      onClick={handleApproveApplication}
                      disabled={actioning}
                      className="rounded-lg border border-green-500/40 bg-green-500/15 px-3 py-2 text-sm font-semibold text-green-200 disabled:opacity-50"
                    >
                      <Check className="mr-1 inline h-4 w-4" />
                      Approve Application
                    </button>
                    <button
                      onClick={handleRejectApplication}
                      disabled={actioning}
                      className="rounded-lg border border-red-500/40 bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-200 disabled:opacity-50"
                    >
                      <X className="mr-1 inline h-4 w-4" />
                      Reject Application
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <Megaphone className="h-5 w-5 text-cyan-200" />
              Distribution Drafts
            </h2>
            <p className="text-sm text-muted-foreground">
              {distributionDrafts.length} pending public-facing draft reviews.
            </p>
          </div>
        </div>

        {distributionDrafts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 p-6 text-center">
            <Check className="mx-auto mb-3 h-8 w-8 text-green-300/60" />
            <p className="font-semibold">No distribution drafts need review</p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
            <aside className="space-y-2">
              {distributionDrafts.map((draft) => (
                <button
                  key={draft.id}
                  onClick={() => {
                    setSelectedDistributionDraftId(draft.id);
                    setDistributionNotes('');
                  }}
                  className={`w-full rounded-lg border p-3 text-left transition ${
                    selectedDistributionDraft?.id === draft.id
                      ? 'border-cyan-400/50 bg-cyan-400/10'
                      : 'border-white/10 bg-white/[0.04] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">{formatAssetType(draft.draft_type)}</span>
                    <span className="rounded bg-black/25 px-2 py-1 text-[11px] text-white/70">
                      {draft.platform}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-cyan-100/75">
                    {draft.title || 'Untitled draft'}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-white/50">{draft.body}</p>
                </button>
              ))}
            </aside>

            {selectedDistributionDraft && (
              <div className="space-y-4">
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded border border-cyan-400/30 bg-cyan-400/10 px-2 py-1 text-xs text-cyan-100">
                      {formatAssetType(selectedDistributionDraft.draft_type)}
                    </span>
                    <span className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/65">
                      {selectedDistributionDraft.platform}
                    </span>
                    <span className="rounded border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-xs text-amber-100">
                      {selectedDistributionDraft.draft_status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold">{selectedDistributionDraft.title || 'Untitled draft'}</h3>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-white/75">
                    {selectedDistributionDraft.body}
                  </p>
                  {selectedDistributionDraft.call_to_action && (
                    <p className="mt-3 rounded border border-white/10 bg-black/20 p-3 text-xs text-white/60">
                      CTA: {selectedDistributionDraft.call_to_action}
                    </p>
                  )}
                </div>

                <ReviewDisclosure
                  title="Safe Distribution Metadata"
                  expanded={expandedPanel === 'distribution-metadata'}
                  onToggle={() =>
                    setExpandedPanel(expandedPanel === 'distribution-metadata' ? null : 'distribution-metadata')
                  }
                >
                  <pre className="max-h-56 overflow-auto rounded bg-black/30 p-3 text-xs text-white/65">
                    {JSON.stringify(
                      {
                        source_snapshot: selectedDistributionDraft.source_snapshot,
                        moderation_snapshot: selectedDistributionDraft.moderation_snapshot,
                        metadata: selectedDistributionDraft.metadata,
                      },
                      null,
                      2,
                    )}
                  </pre>
                </ReviewDisclosure>

                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <label className="text-sm font-semibold">Distribution Notes</label>
                  <textarea
                    value={distributionNotes}
                    onChange={(event) => setDistributionNotes(event.target.value)}
                    rows={4}
                    className="mt-2 w-full resize-none rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm"
                    placeholder="Notes for distribution approval, rejection, or archive"
                  />
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <button
                      onClick={handleApproveDistributionDraft}
                      disabled={actioning}
                      className="rounded-lg border border-green-500/40 bg-green-500/15 px-3 py-2 text-sm font-semibold text-green-200 disabled:opacity-50"
                    >
                      <Check className="mr-1 inline h-4 w-4" />
                      Approve Draft
                    </button>
                    <button
                      onClick={handleRejectDistributionDraft}
                      disabled={actioning}
                      className="rounded-lg border border-red-500/40 bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-200 disabled:opacity-50"
                    >
                      <X className="mr-1 inline h-4 w-4" />
                      Reject Draft
                    </button>
                    <button
                      onClick={handleArchiveDistributionDraft}
                      disabled={actioning}
                      className="rounded-lg border border-slate-500/40 bg-slate-500/15 px-3 py-2 text-sm font-semibold text-slate-200 disabled:opacity-50"
                    >
                      <Archive className="mr-1 inline h-4 w-4" />
                      Archive Draft
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

function ReviewDisclosure({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03]">
      <button onClick={onToggle} className="flex w-full items-center justify-between p-4 text-left">
        <span className="text-sm font-semibold">{title}</span>
        <ChevronDown className={`h-4 w-4 transition ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && <div className="border-t border-white/10 p-4">{children}</div>}
    </div>
  );
}

function WarningList({ asset }: { asset: PostShowAsset }) {
  const safetyWarnings = extractSafetyWarnings(asset.metadata);

  if (safetyWarnings.length === 0) {
    return <p className="text-sm text-white/55">No safety warnings recorded.</p>;
  }

  return (
    <ul className="space-y-1 text-sm text-orange-100">
      {safetyWarnings.map((warning) => (
        <li key={warning} className="rounded bg-orange-500/10 px-2 py-1">
          {warning}
        </li>
      ))}
    </ul>
  );
}

function extractSafetyWarnings(metadata: Record<string, unknown>): string[] {
  const value = metadata?.safety_warnings;
  if (!Array.isArray(value)) return [];
  return value.map((entry) => String(entry));
}

function formatAssetType(type: string): string {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default AdminPostShowReviewDashboard;

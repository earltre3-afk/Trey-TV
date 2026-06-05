import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Archive,
  Bell,
  BellOff,
  CalendarClock,
  CheckCircle2,
  Clipboard,
  FileText,
  Megaphone,
  Pencil,
  Plus,
  RefreshCw,
  SendToBack,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  archiveDistributionDraft,
  buildPrescribeMeSignalsFromDistributionDraft,
  cancelDistributionDraftReminder,
  createDistributionDraftFromApplication,
  createDistributionDraftFromAsset,
  createDistributionDraftManually,
  incrementDistributionDraftCopyCount,
  listDistributionDrafts,
  markDistributionDraftReady,
  markDistributionDraftUsed,
  scheduleDistributionDraftReminder,
  submitDistributionDraftForReview,
  updateDistributionDraft,
} from '@/lib/trey-i/broadcastDistribution.server';
import {
  DISTRIBUTION_DRAFT_TYPES,
  DISTRIBUTION_PLATFORMS,
  distributionStatusTone,
  draftTypeForPlatform,
  formatDistributionLabel,
} from '@/lib/trey-i/broadcastDistributionService';
import { listPostShowAssetsForRecordingServer, listPostShowRecordingsServer } from '@/lib/trey-i/broadcastPostShow.server';
import { listPostShowApplications } from '@/lib/trey-i/broadcastPostShowPublisher.server';
import type {
  DistributionDraft,
  DistributionDraftType,
  DistributionPlatform,
} from '@/lib/trey-i/broadcastDistributionTypes';
import type { PostShowApplication, PostShowAsset } from '@/lib/trey-i/broadcastPostShowTypes';

interface DistributionDeskDashboardProps {
  recording_id?: string;
  onNavigate?: (view: string) => void;
}

interface RecordingOption {
  id: string;
  recording_status?: string;
  duration_seconds?: number | null;
  created_at: string;
}

type SourceMode = 'asset' | 'application' | 'manual';

const SAFE_ASSET_STATUSES = new Set(['draft', 'generated', 'edited', 'approved', 'published']);

export const DistributionDeskDashboard: React.FC<DistributionDeskDashboardProps> = ({ recording_id, onNavigate }) => {
  const [recordings, setRecordings] = useState<RecordingOption[]>([]);
  const [activeRecordingId, setActiveRecordingId] = useState<string | null>(recording_id ?? null);
  const [assets, setAssets] = useState<PostShowAsset[]>([]);
  const [applications, setApplications] = useState<PostShowApplication[]>([]);
  const [drafts, setDrafts] = useState<DistributionDraft[]>([]);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [sourceMode, setSourceMode] = useState<SourceMode>('asset');
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [selectedApplicationId, setSelectedApplicationId] = useState('');
  const [platform, setPlatform] = useState<DistributionPlatform>('instagram');
  const [draftType, setDraftType] = useState<DistributionDraftType>('instagram_caption');
  const [manualTitle, setManualTitle] = useState('');
  const [manualBody, setManualBody] = useState('');
  const [manualCta, setManualCta] = useState('');
  const [editorTitle, setEditorTitle] = useState('');
  const [editorBody, setEditorBody] = useState('');
  const [editorCta, setEditorCta] = useState('');
  const [reminderAt, setReminderAt] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [prescribeSignals, setPrescribeSignals] = useState<Array<[string, string]>>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraftType(draftTypeForPlatform(platform));
  }, [platform]);

  const selectedDraft = useMemo(
    () => drafts.find((draft) => draft.id === selectedDraftId) ?? drafts[0] ?? null,
    [drafts, selectedDraftId],
  );

  const eligibleAssets = useMemo(
    () => assets.filter((asset) => SAFE_ASSET_STATUSES.has(asset.asset_status)),
    [assets],
  );

  const pendingCount = drafts.filter((draft) => draft.draft_status === 'pending_review').length;
  const readyCount = drafts.filter((draft) => draft.draft_status === 'ready' || draft.draft_status === 'approved').length;
  const copiedTotal = drafts.reduce((sum, draft) => sum + draft.copied_count, 0);

  const loadRecordings = useCallback(async () => {
    const result = await listPostShowRecordingsServer({ data: { limit: 25 } });
    if (result.error) {
      setError(result.error);
      return;
    }
    setRecordings(result.recordings);
    setActiveRecordingId((current) => current ?? recording_id ?? result.recordings[0]?.id ?? null);
  }, [recording_id]);

  const loadSourcesAndDrafts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const draftInput = activeRecordingId ? { recording_id: activeRecordingId } : {};
      const draftResult = await listDistributionDrafts({ data: draftInput });
      if (draftResult.error) setError(draftResult.error);
      setDrafts(draftResult.drafts);
      setSelectedDraftId((current) => current ?? draftResult.drafts[0]?.id ?? null);

      if (!activeRecordingId) {
        setAssets([]);
        setApplications([]);
        return;
      }

      const [assetResult, appResult] = await Promise.all([
        listPostShowAssetsForRecordingServer({ data: { recording_id: activeRecordingId } }),
        listPostShowApplications({ data: { recording_id: activeRecordingId } }),
      ]);
      if (assetResult.error) setError(assetResult.error);
      if (appResult.error) setError(appResult.error);
      setAssets(assetResult.assets);
      setApplications(appResult.applications);
      setSelectedAssetId((current) => current || assetResult.assets[0]?.id || '');
      setSelectedApplicationId((current) => current || appResult.applications[0]?.id || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Distribution Desk failed to load');
    } finally {
      setLoading(false);
    }
  }, [activeRecordingId]);

  useEffect(() => {
    loadRecordings();
  }, [loadRecordings]);

  useEffect(() => {
    loadSourcesAndDrafts();
  }, [loadSourcesAndDrafts]);

  useEffect(() => {
    if (!selectedDraft) {
      setEditorTitle('');
      setEditorBody('');
      setEditorCta('');
      setReminderAt('');
      setReviewNotes('');
      setPrescribeSignals([]);
      return;
    }
    setEditorTitle(selectedDraft.title ?? '');
    setEditorBody(selectedDraft.body);
    setEditorCta(selectedDraft.call_to_action ?? '');
    setReminderAt(selectedDraft.scheduled_for ? toDateTimeLocal(selectedDraft.scheduled_for) : '');
    setReviewNotes(selectedDraft.review_notes ?? '');
    setPrescribeSignals(signalEntries(selectedDraft.metadata));
  }, [selectedDraft]);

  const refresh = async () => {
    await loadSourcesAndDrafts();
  };

  const createDraft = async () => {
    setBusy('create');
    try {
      const common = {
        draft_type: draftType,
        platform,
        recording_id: activeRecordingId ?? undefined,
      };
      const result =
        sourceMode === 'asset'
          ? await createDistributionDraftFromAsset({
              data: {
                ...common,
                asset_id: selectedAssetId,
              },
            })
          : sourceMode === 'application'
            ? await createDistributionDraftFromApplication({
                data: {
                  draft_type: draftType,
                  platform,
                  application_id: selectedApplicationId,
                },
              })
            : await createDistributionDraftManually({
                data: {
                  ...common,
                  title: manualTitle,
                  body: manualBody,
                  call_to_action: manualCta,
                },
              });

      if (!result.success || !result.draft) {
        toast.error(result.error || 'Draft creation failed');
        return;
      }
      toast.success('Draft queued. Nothing was sent.');
      setSelectedDraftId(result.draft.id);
      setManualTitle('');
      setManualBody('');
      setManualCta('');
      await refresh();
    } catch {
      toast.error('Draft creation failed');
    } finally {
      setBusy(null);
    }
  };

  const saveSelectedDraft = async () => {
    if (!selectedDraft) return;
    setBusy(`save:${selectedDraft.id}`);
    try {
      const result = await updateDistributionDraft({
        data: {
          draft_id: selectedDraft.id,
          title: editorTitle,
          body: editorBody,
          call_to_action: editorCta,
        },
      });
      if (!result.success || !result.draft) {
        toast.error(result.error || 'Draft save failed');
        return;
      }
      toast.success('Draft saved privately');
      await refresh();
    } finally {
      setBusy(null);
    }
  };

  const copySelectedDraft = async () => {
    if (!selectedDraft) return;
    setBusy(`copy:${selectedDraft.id}`);
    try {
      await navigator.clipboard.writeText(selectedDraft.body);
      const result = await incrementDistributionDraftCopyCount({ data: { draft_id: selectedDraft.id } });
      if (!result.success) {
        toast.error(result.error || 'Copy tracking failed');
        return;
      }
      toast.success('Copied. Usage tracked locally.');
      await refresh();
    } catch {
      toast.error('Copy failed');
    } finally {
      setBusy(null);
    }
  };

  const runDraftAction = async (
    label: string,
    action: () => Promise<{ success: boolean; draft?: DistributionDraft; error?: string }>,
  ) => {
    if (!selectedDraft) return;
    setBusy(`${label}:${selectedDraft.id}`);
    try {
      const result = await action();
      if (!result.success) {
        toast.error(result.error || `${label} failed`);
        return;
      }
      toast.success(label);
      await refresh();
    } finally {
      setBusy(null);
    }
  };

  const scheduleReminder = async () => {
    if (!selectedDraft || !reminderAt) return;
    await runDraftAction('Reminder scheduled', () =>
      scheduleDistributionDraftReminder({
        data: {
          draft_id: selectedDraft.id,
          scheduled_for: new Date(reminderAt).toISOString(),
        },
      }),
    );
  };

  const loadPrescribeSignals = async () => {
    if (!selectedDraft) return;
    const result = await buildPrescribeMeSignalsFromDistributionDraft({ data: { draft_id: selectedDraft.id } });
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setPrescribeSignals(signalEntries(result.signals));
  };

  return (
    <div className="space-y-6 pb-12 text-white">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-cyan-200/80">
            <Megaphone className="h-4 w-4" />
            Tradio Distribution Desk
          </div>
          <h1 className="text-3xl font-black text-white">Distribution Draft Queue</h1>
          <p className="max-w-2xl text-sm text-white/55">
            Drafts, copy tracking, and reminder metadata only. No social posts, emails, or push notifications are sent here.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {onNavigate && (
            <button
              onClick={() => onNavigate('post-show')}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-white/75 hover:bg-white/[0.08]"
            >
              Post-Show Producer
            </button>
          )}
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/25 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-400/15"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">{error}</div>
      )}

      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="Drafts" value={drafts.length} />
        <Metric label="Ready" value={readyCount} />
        <Metric label="Review" value={pendingCount} />
        <Metric label="Copies" value={copiedTotal} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[340px_minmax(280px,0.9fr)_minmax(360px,1.2fr)]">
        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Create Draft</h2>
              <p className="text-xs text-white/45">Private by default</p>
            </div>
            <Plus className="h-5 w-5 text-cyan-200" />
          </div>

          <Field label="Recording">
            <select
              value={activeRecordingId ?? ''}
              onChange={(event) => {
                setActiveRecordingId(event.target.value || null);
                setSelectedDraftId(null);
              }}
              className={inputClass}
            >
              <option value="">All drafts</option>
              {recordings.map((recording) => (
                <option key={recording.id} value={recording.id}>
                  {recording.recording_status || 'recording'} - {new Date(recording.created_at).toLocaleDateString()}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-3 gap-2">
            {(['asset', 'application', 'manual'] as SourceMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setSourceMode(mode)}
                className={`rounded-lg border px-2 py-2 text-xs font-bold capitalize ${
                  sourceMode === mode
                    ? 'border-cyan-300/50 bg-cyan-300/15 text-cyan-100'
                    : 'border-white/10 bg-black/20 text-white/55'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {sourceMode === 'asset' && (
            <Field label="Approved Asset">
              <select value={selectedAssetId} onChange={(event) => setSelectedAssetId(event.target.value)} className={inputClass}>
                <option value="">Select source asset</option>
                {eligibleAssets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {formatDistributionLabel(asset.asset_type)} - {asset.asset_status}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {sourceMode === 'application' && (
            <Field label="Applied Publisher Copy">
              <select
                value={selectedApplicationId}
                onChange={(event) => setSelectedApplicationId(event.target.value)}
                className={inputClass}
              >
                <option value="">Select application</option>
                {applications.map((application) => (
                  <option key={application.id} value={application.id}>
                    {formatDistributionLabel(application.application_type)} - {application.application_status}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {sourceMode === 'manual' && (
            <div className="space-y-3">
              <Field label="Manual Title">
                <input value={manualTitle} onChange={(event) => setManualTitle(event.target.value)} className={inputClass} />
              </Field>
              <Field label="Manual Body">
                <textarea
                  value={manualBody}
                  onChange={(event) => setManualBody(event.target.value)}
                  className={`${inputClass} min-h-28 resize-y`}
                />
              </Field>
              <Field label="Call To Action">
                <input value={manualCta} onChange={(event) => setManualCta(event.target.value)} className={inputClass} />
              </Field>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <Field label="Platform">
              <select value={platform} onChange={(event) => setPlatform(event.target.value as DistributionPlatform)} className={inputClass}>
                {DISTRIBUTION_PLATFORMS.map((option) => (
                  <option key={option} value={option}>
                    {formatDistributionLabel(option)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Draft Type">
              <select value={draftType} onChange={(event) => setDraftType(event.target.value as DistributionDraftType)} className={inputClass}>
                {DISTRIBUTION_DRAFT_TYPES.map((option) => (
                  <option key={option} value={option}>
                    {formatDistributionLabel(option)}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <button
            onClick={createDraft}
            disabled={
              busy === 'create' ||
              (sourceMode === 'asset' && !selectedAssetId) ||
              (sourceMode === 'application' && !selectedApplicationId) ||
              (sourceMode === 'manual' && !manualBody.trim())
            }
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Create Distribution Draft
          </button>
        </section>

        <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Queue</h2>
            <span className="rounded-full border border-white/10 px-2 py-1 text-xs text-white/45">{drafts.length}</span>
          </div>
          {loading ? (
            <div className="rounded-xl border border-white/10 p-5 text-center text-sm text-white/50">Loading drafts...</div>
          ) : drafts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 p-5 text-center text-sm text-white/50">
              No distribution drafts yet.
            </div>
          ) : (
            <div className="space-y-2">
              {drafts.map((draft) => (
                <button
                  key={draft.id}
                  onClick={() => setSelectedDraftId(draft.id)}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    selectedDraft?.id === draft.id
                      ? 'border-cyan-300/50 bg-cyan-300/10'
                      : 'border-white/10 bg-black/20 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">{draft.title || formatDistributionLabel(draft.draft_type)}</p>
                      <p className="mt-1 text-xs text-white/45">
                        {formatDistributionLabel(draft.platform)} / {formatDistributionLabel(draft.draft_type)}
                      </p>
                    </div>
                    <StatusBadge status={draft.draft_status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-white/45">
                    <span>{draft.copied_count} copies</span>
                    <span>{draft.reminder_status}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          {!selectedDraft ? (
            <div className="rounded-xl border border-dashed border-white/15 p-8 text-center text-white/50">
              Select a draft to edit.
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/45">
                    <FileText className="h-4 w-4" />
                    Draft Editor
                  </div>
                  <h2 className="mt-1 text-xl font-bold">{selectedDraft.title || formatDistributionLabel(selectedDraft.draft_type)}</h2>
                </div>
                <StatusBadge status={selectedDraft.draft_status} />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Title">
                  <input value={editorTitle} onChange={(event) => setEditorTitle(event.target.value)} className={inputClass} />
                </Field>
                <Field label="Call To Action">
                  <input value={editorCta} onChange={(event) => setEditorCta(event.target.value)} className={inputClass} />
                </Field>
              </div>
              <Field label="Draft Copy">
                <textarea
                  value={editorBody}
                  onChange={(event) => setEditorBody(event.target.value)}
                  className={`${inputClass} min-h-56 resize-y leading-relaxed`}
                />
              </Field>

              <div className="flex flex-wrap gap-2">
                <ActionButton icon={<Pencil className="h-4 w-4" />} onClick={saveSelectedDraft} disabled={!!busy}>
                  Save
                </ActionButton>
                <ActionButton icon={<Clipboard className="h-4 w-4" />} onClick={copySelectedDraft} disabled={!!busy}>
                  Copy
                </ActionButton>
                <ActionButton
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  onClick={() => runDraftAction('Draft marked ready', () => markDistributionDraftReady({ data: { draft_id: selectedDraft.id } }))}
                  disabled={!!busy}
                >
                  Ready
                </ActionButton>
                <ActionButton
                  icon={<ShieldCheck className="h-4 w-4" />}
                  onClick={() =>
                    runDraftAction('Submitted for review', () =>
                      submitDistributionDraftForReview({ data: { draft_id: selectedDraft.id, review_notes: reviewNotes } }),
                    )
                  }
                  disabled={!!busy}
                >
                  Review
                </ActionButton>
                <ActionButton
                  icon={<SendToBack className="h-4 w-4" />}
                  onClick={() =>
                    runDraftAction('Marked used', () =>
                      markDistributionDraftUsed({ data: { draft_id: selectedDraft.id, review_notes: reviewNotes } }),
                    )
                  }
                  disabled={!!busy}
                >
                  Used
                </ActionButton>
                <ActionButton
                  icon={<Archive className="h-4 w-4" />}
                  onClick={() =>
                    runDraftAction('Draft archived', () =>
                      archiveDistributionDraft({ data: { draft_id: selectedDraft.id, review_notes: reviewNotes } }),
                    )
                  }
                  disabled={!!busy}
                >
                  Archive
                </ActionButton>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <div className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-3">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <CalendarClock className="h-4 w-4 text-amber-200" />
                    Reminder Metadata
                  </div>
                  <input
                    type="datetime-local"
                    value={reminderAt}
                    onChange={(event) => setReminderAt(event.target.value)}
                    className={inputClass}
                  />
                  <div className="flex gap-2">
                    <ActionButton icon={<Bell className="h-4 w-4" />} onClick={scheduleReminder} disabled={!reminderAt || !!busy}>
                      Schedule
                    </ActionButton>
                    <ActionButton
                      icon={<BellOff className="h-4 w-4" />}
                      onClick={() =>
                        runDraftAction('Reminder canceled', () =>
                          cancelDistributionDraftReminder({ data: { draft_id: selectedDraft.id } }),
                        )
                      }
                      disabled={!!busy}
                    >
                      Cancel
                    </ActionButton>
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-3">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <Sparkles className="h-4 w-4 text-emerald-200" />
                    Prescribe Me Signals
                  </div>
                  <button
                    onClick={loadPrescribeSignals}
                    className="rounded-lg border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-xs font-bold text-emerald-100"
                  >
                    Refresh Signals
                  </button>
                  <div className="flex flex-wrap gap-1">
                    {prescribeSignals.length === 0 ? (
                      <span className="text-xs text-white/40">No safe signals yet.</span>
                    ) : (
                      prescribeSignals.map(([key, value]) => (
                        <span key={key} className="rounded bg-emerald-400/10 px-2 py-1 text-[11px] text-emerald-100/80">
                          {formatDistributionLabel(key)}: {value}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <Field label="Review Notes">
                <textarea
                  value={reviewNotes}
                  onChange={(event) => setReviewNotes(event.target.value)}
                  className={`${inputClass} min-h-20 resize-y`}
                />
              </Field>

              <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-xs text-cyan-50/75">
                Copy actions only write to clipboard and increment internal draft usage. Reminder actions store timestamps only.
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[10px] font-black uppercase tracking-widest text-white/45">{label}</span>
      {children}
    </label>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{label}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: DistributionDraft['draft_status'] }) {
  return (
    <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-bold ${distributionStatusTone(status)}`}>
      {formatDistributionLabel(status)}
    </span>
  );
}

function ActionButton({
  icon,
  children,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.055] px-3 py-2 text-xs font-bold text-white/80 hover:bg-white/[0.09] disabled:opacity-45"
    >
      {icon}
      {children}
    </button>
  );
}

function signalEntries(source: Record<string, unknown> | null | undefined): Array<[string, string]> {
  if (!source) return [];
  return ['platform', 'draft_type', 'asset_type', 'mood_tags', 'genre_tags', 'audience_tags', 'engagement_intensity', 'copied_count', 'marked_used']
    .map((key): [string, string] | null => {
      const value = source[key];
      if (Array.isArray(value) && value.length > 0) return [key, value.join(', ')];
      if (typeof value === 'string' && value.trim()) return [key, value];
      if (typeof value === 'number' || typeof value === 'boolean') return [key, String(value)];
      return null;
    })
    .filter((entry): entry is [string, string] => entry !== null)
    .slice(0, 9);
}

function toDateTimeLocal(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

const inputClass =
  'w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/45 focus:bg-black/50';

export default DistributionDeskDashboard;

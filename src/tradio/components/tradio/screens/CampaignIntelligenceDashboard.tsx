import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Gauge,
  Lightbulb,
  Loader2,
  Pencil,
  Plus,
  Radio,
  RefreshCw,
  Repeat2,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  createManualExternalMetric,
  deleteManualExternalMetric,
  listCampaignDashboard,
  updateManualExternalMetric,
} from '@/lib/trey-i/broadcastCampaign.server';
import type {
  CampaignDashboardData,
  CampaignMetric,
  CampaignMetricType,
} from '@/lib/trey-i/broadcastCampaignTypes';
import { useTradioIdentity } from '../auth/useTradioIdentity';

interface CampaignIntelligenceDashboardProps {
  channel_id?: string;
  onNavigate?: (view: string) => void;
}

type ManualTarget = 'channel' | 'clip' | 'draft';

const MANUAL_METRICS: Array<{ value: CampaignMetricType; label: string; unit: string }> = [
  { value: 'manual_views', label: 'Views', unit: 'views' },
  { value: 'manual_likes', label: 'Likes', unit: 'likes' },
  { value: 'manual_comments', label: 'Comments', unit: 'comments' },
  { value: 'manual_shares', label: 'Shares', unit: 'shares' },
  { value: 'manual_saves', label: 'Saves', unit: 'saves' },
  { value: 'manual_clicks', label: 'Clicks', unit: 'clicks' },
  { value: 'follower_gain', label: 'Follower gain', unit: 'followers' },
];

const PLATFORM_OPTIONS = [
  'instagram',
  'tiktok',
  'youtube',
  'facebook',
  'x',
  'newsletter',
  'website',
  'tradio',
  'other',
];

export const CampaignIntelligenceDashboard: React.FC<
  CampaignIntelligenceDashboardProps
> = ({ channel_id, onNavigate }) => {
  const { session } = useTradioIdentity();
  const accessToken = session?.access_token ?? '';
  const [dashboard, setDashboard] = useState<CampaignDashboardData | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState(channel_id ?? '');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingMetricId, setEditingMetricId] = useState<string | null>(null);
  const [metricType, setMetricType] = useState<CampaignMetricType>('manual_views');
  const [platform, setPlatform] = useState('instagram');
  const [metricValue, setMetricValue] = useState('');
  const [metricUnit, setMetricUnit] = useState('views');
  const [measuredAt, setMeasuredAt] = useState(toDateTimeLocal(new Date().toISOString()));
  const [note, setNote] = useState('');
  const [targetType, setTargetType] = useState<ManualTarget>('channel');
  const [targetId, setTargetId] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!accessToken) {
        setDashboard(null);
        setError('Creator sign-in is required.');
        return;
      }
      const result = await listCampaignDashboard({
        data: {
          accessToken,
          channel_id: selectedChannelId || undefined,
        },
      });
      if (result.error || !result.dashboard) {
        setDashboard(null);
        setError(result.error || 'Campaign Intelligence failed to load.');
        return;
      }
      setDashboard(result.dashboard);
      if (!selectedChannelId && channel_id) setSelectedChannelId(channel_id);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Campaign Intelligence failed to load.');
    } finally {
      setLoading(false);
    }
  }, [accessToken, channel_id, selectedChannelId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const option = MANUAL_METRICS.find((entry) => entry.value === metricType);
    if (!editingMetricId && option) setMetricUnit(option.unit);
  }, [editingMetricId, metricType]);

  useEffect(() => {
    if (targetType === 'channel') {
      setTargetId(selectedChannelId);
      return;
    }
    if (targetType === 'clip') {
      setTargetId(dashboard?.top_clips[0]?.id ?? '');
      return;
    }
    setTargetId(dashboard?.top_drafts[0]?.id ?? '');
  }, [dashboard, selectedChannelId, targetType]);

  const manualMetrics = useMemo(
    () => dashboard?.metrics.filter((entry) => entry.entered_manually) ?? [],
    [dashboard],
  );

  const resetForm = () => {
    setEditingMetricId(null);
    setMetricValue('');
    setMetricType('manual_views');
    setMetricUnit('views');
    setPlatform('instagram');
    setMeasuredAt(toDateTimeLocal(new Date().toISOString()));
    setNote('');
    setTargetType('channel');
    setTargetId(selectedChannelId);
  };

  const submitMetric = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = Number(metricValue);
    if (!Number.isFinite(value) || value < 0) {
      toast.error('Enter a non-negative metric value.');
      return;
    }

    setSaving(true);
    try {
      const target = {
        channel_id: selectedChannelId || undefined,
        clip_id: targetType === 'clip' ? targetId || undefined : undefined,
        distribution_draft_id:
          targetType === 'draft' ? targetId || undefined : undefined,
      };
      const payload = {
        accessToken,
        metric_id: editingMetricId || undefined,
        platform,
        metric_type: metricType,
        metric_value: value,
        metric_unit: metricUnit,
        measured_at: new Date(measuredAt).toISOString(),
        note,
        ...target,
      };
      const result = editingMetricId
        ? await updateManualExternalMetric({ data: payload })
        : await createManualExternalMetric({ data: payload });

      if (result.error || !result.metric) {
        toast.error(result.error || 'Manual metric could not be saved.');
        return;
      }
      toast.success(editingMetricId ? 'Manual metric updated.' : 'Manual metric recorded.');
      resetForm();
      await loadDashboard();
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : 'Manual metric could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const editMetric = (metric: CampaignMetric) => {
    setEditingMetricId(metric.id);
    setMetricType(metric.metric_type);
    setPlatform(metric.platform);
    setMetricValue(String(metric.metric_value));
    setMetricUnit(metric.metric_unit || '');
    setMeasuredAt(toDateTimeLocal(metric.measured_at));
    setNote(typeof metric.metadata.note === 'string' ? metric.metadata.note : '');
    if (metric.clip_id) {
      setTargetType('clip');
      setTargetId(metric.clip_id);
    } else if (metric.distribution_draft_id) {
      setTargetType('draft');
      setTargetId(metric.distribution_draft_id);
    } else {
      setTargetType('channel');
      setTargetId(metric.channel_id || selectedChannelId);
    }
  };

  const removeMetric = async (metricId: string) => {
    setSaving(true);
    try {
      const result = await deleteManualExternalMetric({
        data: { accessToken, metric_id: metricId },
      });
      if (!result.success) {
        toast.error(result.error || 'Manual metric could not be deleted.');
        return;
      }
      toast.success('Manual metric deleted.');
      if (editingMetricId === metricId) resetForm();
      await loadDashboard();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-white/60">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-300" />
          Loading campaign evidence
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-red-300" />
          <div>
            <h1 className="font-semibold text-red-100">Campaign Intelligence unavailable</h1>
            <p className="mt-1 text-sm text-red-100/70">{error || 'No campaign data returned.'}</p>
          </div>
        </div>
      </div>
    );
  }

  const overview = dashboard.overview;

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-cyan-300">
            <Activity className="h-4 w-4" />
            Performance feedback loop
          </div>
          <h1 className="mt-2 text-2xl font-bold text-white">Campaign Intelligence</h1>
          <p className="mt-1 text-sm text-white/55">
            Internal Tradio events and creator-entered external metrics
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedChannelId}
            onChange={(event) => setSelectedChannelId(event.target.value)}
            className="h-9 min-w-48 rounded-md border border-white/15 bg-black/40 px-3 text-sm text-white"
            aria-label="Campaign channel"
          >
            <option value="">All creator channels</option>
            {dashboard.channels.map((channel) => (
              <option key={channel.id} value={channel.id}>
                {channel.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={loadDashboard}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            title="Refresh campaign data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('distribution')}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-cyan-400/30 bg-cyan-400/10 px-3 text-sm font-semibold text-cyan-100 hover:bg-cyan-400/15"
            >
              <Radio className="h-4 w-4" />
              Distribution
            </button>
          )}
        </div>
      </header>

      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 md:grid-cols-4 xl:grid-cols-8">
        <MetricCell label="Draft copies" value={overview.draft_copies} icon={<Copy />} tone="cyan" />
        <MetricCell label="Marked used" value={overview.drafts_used} icon={<ClipboardCheck />} tone="green" />
        <MetricCell label="Clip plays" value={overview.clip_plays} icon={<Activity />} tone="blue" />
        <MetricCell label="Replay plays" value={overview.replay_plays} icon={<Repeat2 />} tone="violet" />
        <MetricCell label="Public clips" value={overview.published_clips} icon={<Radio />} tone="pink" />
        <MetricCell label="Eligible assets" value={overview.eligible_assets} icon={<Sparkles />} tone="yellow" />
        <MetricCell label="Manual entries" value={overview.manual_metrics} icon={<Pencil />} tone="orange" />
        <MetricCell label="Evidence rows" value={overview.total_metrics} icon={<Gauge />} tone="slate" />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
        <div className="space-y-6">
          <DataSection
            title="Top clips"
            icon={<TrendingUp className="h-4 w-4 text-green-300" />}
            empty={dashboard.top_clips.length === 0}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="border-b border-white/10 text-xs uppercase text-white/40">
                  <tr>
                    <th className="px-3 py-2 font-medium">Clip</th>
                    <th className="px-3 py-2 font-medium">Plays</th>
                    <th className="px-3 py-2 font-medium">Completion</th>
                    <th className="px-3 py-2 font-medium">Reactions</th>
                    <th className="px-3 py-2 font-medium">Manual</th>
                    <th className="px-3 py-2 font-medium">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {dashboard.top_clips.map((clip) => (
                    <tr key={clip.id}>
                      <td className="px-3 py-3">
                        <div className="font-medium text-white">{clip.title}</div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {[...clip.mood_tags, ...clip.genre_tags].slice(0, 3).map((tag) => (
                            <span key={tag} className="rounded border border-white/10 px-1.5 py-0.5 text-[11px] text-white/50">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-white/70">{formatNumber(clip.plays)}</td>
                      <td className="px-3 py-3 text-white/70">
                        {clip.completion_rate === null ? '-' : `${formatNumber(clip.completion_rate)}%`}
                      </td>
                      <td className="px-3 py-3 text-white/70">{formatNumber(clip.reactions)}</td>
                      <td className="px-3 py-3 text-white/70">{formatNumber(clip.manual_engagement)}</td>
                      <td className="px-3 py-3 font-semibold text-green-300">{formatNumber(clip.score)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DataSection>

          <div className="grid gap-6 lg:grid-cols-2">
            <DataSection
              title="Top drafts"
              icon={<ClipboardCheck className="h-4 w-4 text-cyan-300" />}
              empty={dashboard.top_drafts.length === 0}
            >
              <RankedList
                rows={dashboard.top_drafts.map((draft) => ({
                  id: draft.id,
                  label: draft.title,
                  detail: `${formatLabel(draft.platform)} / ${formatLabel(draft.draft_type)}`,
                  value: `${draft.copied_count} copied${draft.marked_used ? ' / used' : ''}`,
                  score: draft.score,
                }))}
              />
            </DataSection>

            <DataSection
              title="Asset types"
              icon={<BarChart3 className="h-4 w-4 text-yellow-300" />}
              empty={dashboard.top_asset_types.length === 0}
            >
              <RankedList
                rows={dashboard.top_asset_types.map((asset) => ({
                  id: asset.asset_type,
                  label: formatLabel(asset.asset_type),
                  detail: `${asset.count} eligible / ${asset.linked_drafts} linked drafts`,
                  value: `${formatNumber(asset.manual_engagement)} manual`,
                  score: asset.score,
                }))}
              />
            </DataSection>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <DataSection
              title="Platform comparison"
              icon={<Activity className="h-4 w-4 text-blue-300" />}
              empty={dashboard.platforms.length === 0}
            >
              <div className="space-y-3">
                {dashboard.platforms.map((entry) => {
                  const maxScore = Math.max(1, dashboard.platforms[0]?.score || 1);
                  return (
                    <div key={entry.platform}>
                      <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium text-white">{formatLabel(entry.platform)}</span>
                        <span className="text-xs text-white/45">
                          {entry.drafts} drafts / {entry.copies} copies / {entry.used} used
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded bg-white/5">
                        <div
                          className="h-full bg-cyan-400"
                          style={{ width: `${Math.max(4, (entry.score / maxScore) * 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </DataSection>

            <DataSection
              title="Tag performance"
              icon={<Tag className="h-4 w-4 text-pink-300" />}
              empty={dashboard.tag_insights.length === 0}
            >
              <div className="flex flex-wrap gap-2">
                {dashboard.tag_insights.map((tag) => (
                  <div key={`${tag.category}-${tag.tag}`} className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2">
                    <div className="text-sm font-medium text-white">{tag.tag}</div>
                    <div className="mt-0.5 text-[11px] uppercase text-white/40">
                      {tag.category} / {formatNumber(tag.score)} / {tag.evidence_count} signals
                    </div>
                  </div>
                ))}
              </div>
            </DataSection>
          </div>
        </div>

        <aside className="space-y-6">
          <DataSection title="Manual external metric" icon={<Plus className="h-4 w-4 text-orange-300" />}>
            <form onSubmit={submitMetric} className="space-y-3">
              <div className="rounded-md border border-orange-400/20 bg-orange-400/[0.06] px-3 py-2 text-xs text-orange-100/80">
                Manual entry
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Metric">
                  <select value={metricType} onChange={(event) => setMetricType(event.target.value as CampaignMetricType)} className={inputClass}>
                    {MANUAL_METRICS.map((entry) => (
                      <option key={entry.value} value={entry.value}>{entry.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Platform">
                  <select value={platform} onChange={(event) => setPlatform(event.target.value)} className={inputClass}>
                    {PLATFORM_OPTIONS.map((entry) => (
                      <option key={entry} value={entry}>{formatLabel(entry)}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Value">
                  <input type="number" min="0" step="any" value={metricValue} onChange={(event) => setMetricValue(event.target.value)} className={inputClass} required />
                </Field>
                <Field label="Unit">
                  <input value={metricUnit} onChange={(event) => setMetricUnit(event.target.value)} className={inputClass} />
                </Field>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Attach to">
                  <select value={targetType} onChange={(event) => setTargetType(event.target.value as ManualTarget)} className={inputClass}>
                    <option value="channel">Channel</option>
                    <option value="clip">Clip</option>
                    <option value="draft">Draft</option>
                  </select>
                </Field>
                <Field label="Target">
                  <select value={targetId} onChange={(event) => setTargetId(event.target.value)} className={inputClass} disabled={targetType === 'channel' && !selectedChannelId}>
                    {targetType === 'channel' && (
                      <>
                        <option value="">All creator work</option>
                        {dashboard.channels.map((channel) => <option key={channel.id} value={channel.id}>{channel.title}</option>)}
                      </>
                    )}
                    {targetType === 'clip' && dashboard.top_clips.map((clip) => <option key={clip.id} value={clip.id}>{clip.title}</option>)}
                    {targetType === 'draft' && dashboard.top_drafts.map((draft) => <option key={draft.id} value={draft.id}>{draft.title}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Measured at">
                <input type="datetime-local" value={measuredAt} onChange={(event) => setMeasuredAt(event.target.value)} className={inputClass} required />
              </Field>
              <Field label="Note">
                <input value={note} onChange={(event) => setNote(event.target.value)} className={inputClass} maxLength={240} placeholder="Optional source note" />
              </Field>
              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md bg-orange-400 px-3 text-sm font-semibold text-black hover:bg-orange-300 disabled:opacity-50">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingMetricId ? <CheckCircle2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {editingMetricId ? 'Update metric' : 'Record metric'}
                </button>
                {editingMetricId && (
                  <button type="button" onClick={resetForm} className="h-9 rounded-md border border-white/15 px-3 text-sm text-white/65 hover:bg-white/5">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </DataSection>

          <DataSection
            title="Recommended next actions"
            icon={<Lightbulb className="h-4 w-4 text-yellow-300" />}
            empty={dashboard.recommendations.length === 0}
          >
            <div className="space-y-3">
              {dashboard.recommendations.map((entry) => (
                <div key={entry.id} className="border-l-2 border-yellow-400/60 pl-3">
                  <div className="text-sm font-semibold text-white">{entry.title}</div>
                  <p className="mt-1 text-xs leading-relaxed text-white/60">{entry.action}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-yellow-100/60">Basis: {entry.basis}</p>
                </div>
              ))}
            </div>
          </DataSection>

          <DataSection
            title="Prescribe Me signal preview"
            icon={<Sparkles className="h-4 w-4 text-violet-300" />}
          >
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Signal label="Top platform" value={formatLabel(dashboard.prescribe_me_signals.top_platform || 'No signal')} />
              <Signal label="Draft type" value={formatLabel(dashboard.prescribe_me_signals.top_draft_type || 'No signal')} />
              <Signal label="Clip duration" value={dashboard.prescribe_me_signals.preferred_clip_duration_seconds ? `${dashboard.prescribe_me_signals.preferred_clip_duration_seconds}s` : 'No signal'} />
              <Signal label="Reaction intensity" value={formatLabel(dashboard.prescribe_me_signals.reaction_intensity)} />
              <Signal label="Tone" value={formatLabel(dashboard.prescribe_me_signals.emotional_tones[0] || 'No signal')} />
              <Signal label="Content type" value={formatLabel(dashboard.prescribe_me_signals.approved_content_categories[0] || 'No signal')} />
              <Signal label="Copies" value={String(dashboard.prescribe_me_signals.draft_copy_count)} />
              <Signal label="Used" value={String(dashboard.prescribe_me_signals.draft_marked_used_count)} />
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {dashboard.prescribe_me_signals.follow_up_topic_tags.map((tag) => (
                <span key={tag} className="rounded border border-violet-400/20 bg-violet-400/[0.06] px-2 py-1 text-[11px] text-violet-100/75">{tag}</span>
              ))}
            </div>
          </DataSection>
        </aside>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <DataSection title="Manual metric history" icon={<Pencil className="h-4 w-4 text-orange-300" />} empty={manualMetrics.length === 0}>
          <div className="space-y-2">
            {manualMetrics.slice(0, 12).map((metric) => (
              <div key={metric.id} className="flex items-center justify-between gap-3 rounded-md border border-white/10 px-3 py-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{formatLabel(metric.metric_type)}</span>
                    <span className="rounded border border-orange-400/25 px-1.5 py-0.5 text-[10px] uppercase text-orange-200">Manual</span>
                  </div>
                  <div className="mt-0.5 truncate text-xs text-white/45">
                    {formatLabel(metric.platform)} / {formatNumber(metric.metric_value)} {metric.metric_unit || ''}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button type="button" onClick={() => editMetric(metric)} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/50 hover:bg-white/5 hover:text-white" title="Edit manual metric">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => removeMetric(metric.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-300/70 hover:bg-red-500/10 hover:text-red-200" title="Delete manual metric">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </DataSection>

        <DataSection title="Reuse candidates" icon={<Repeat2 className="h-4 w-4 text-green-300" />} empty={dashboard.reusable_high_performers.length === 0}>
          <div className="space-y-3">
            {dashboard.reusable_high_performers.map((entry) => (
              <div key={`${entry.entity_type}-${entry.id}`} className="border-l-2 border-green-400/50 pl-3">
                <div className="text-sm font-medium text-white">{entry.label}</div>
                <div className="mt-0.5 text-xs text-white/45">{formatLabel(entry.entity_type)} / score {formatNumber(entry.score)}</div>
                <p className="mt-1 text-xs text-green-100/60">{entry.basis}</p>
              </div>
            ))}
          </div>
        </DataSection>

        <DataSection title="Needs attention" icon={<AlertTriangle className="h-4 w-4 text-red-300" />} empty={dashboard.underperforming_assets.length === 0}>
          <div className="space-y-3">
            {dashboard.underperforming_assets.map((entry) => (
              <div key={`${entry.entity_type}-${entry.id}`} className="border-l-2 border-red-400/50 pl-3">
                <div className="text-sm font-medium text-white">{entry.label}</div>
                <div className="mt-0.5 text-xs uppercase text-white/40">{entry.entity_type}</div>
                <p className="mt-1 text-xs text-red-100/60">{entry.basis}</p>
              </div>
            ))}
          </div>
        </DataSection>
      </div>
    </div>
  );
};

function MetricCell({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactElement<{ className?: string }>;
  tone: 'cyan' | 'green' | 'blue' | 'violet' | 'pink' | 'yellow' | 'orange' | 'slate';
}) {
  const tones = {
    cyan: 'text-cyan-300',
    green: 'text-green-300',
    blue: 'text-blue-300',
    violet: 'text-violet-300',
    pink: 'text-pink-300',
    yellow: 'text-yellow-300',
    orange: 'text-orange-300',
    slate: 'text-slate-300',
  };
  return (
    <div className="min-w-0 bg-[#0a0b0f] p-3">
      <div className={`flex items-center gap-1.5 ${tones[tone]}`}>
        {React.cloneElement(icon, { className: 'h-3.5 w-3.5' })}
        <span className="truncate text-[11px] uppercase text-white/45">{label}</span>
      </div>
      <div className="mt-2 text-xl font-semibold text-white">{formatNumber(value)}</div>
    </div>
  );
}

function DataSection({
  title,
  icon,
  empty,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  empty?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-black/20">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        {icon}
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      <div className="p-4">
        {empty ? <p className="py-5 text-center text-sm text-white/35">No evidence yet</p> : children}
      </div>
    </section>
  );
}

function RankedList({
  rows,
}: {
  rows: Array<{ id: string; label: string; detail: string; value: string; score: number }>;
}) {
  return (
    <div className="divide-y divide-white/5">
      {rows.map((row, index) => (
        <div key={row.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-white/10 text-xs font-semibold text-white/45">
            {index + 1}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-white">{row.label}</div>
            <div className="truncate text-xs text-white/40">{row.detail}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/55">{row.value}</div>
            <div className="text-xs font-semibold text-cyan-300">{formatNumber(row.score)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-xs font-medium text-white/50">{label}</span>
      {children}
    </label>
  );
}

function Signal({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.025] p-2">
      <div className="text-[10px] uppercase text-white/35">{label}</div>
      <div className="mt-1 truncate font-medium text-white/75">{value}</div>
    </div>
  );
}

const inputClass =
  'h-9 min-w-0 w-full rounded-md border border-white/15 bg-black/40 px-2.5 text-sm text-white outline-none focus:border-cyan-400/50 disabled:opacity-40';

function formatLabel(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value);
}

function toDateTimeLocal(value: string): string {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default CampaignIntelligenceDashboard;

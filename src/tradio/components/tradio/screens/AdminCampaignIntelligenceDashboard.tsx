import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { listAdminCampaignSummaries } from '@/lib/trey-i/broadcastCampaign.server';
import type { AdminCampaignSummary } from '@/lib/trey-i/broadcastCampaignTypes';
import { canAdminPlatform } from '../auth/roleUtils';
import { useTradioIdentity } from '../auth/useTradioIdentity';

export const AdminCampaignIntelligenceDashboard: React.FC = () => {
  const { identity, session } = useTradioIdentity();
  const isAdmin = canAdminPlatform(identity);
  const accessToken = session?.access_token ?? '';
  const [summaries, setSummaries] = useState<AdminCampaignSummary[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isAdmin || !accessToken) {
        setSummaries([]);
        setError('Admin sign-in is required.');
        return;
      }
      const result = await listAdminCampaignSummaries({
        data: { accessToken, search },
      });
      if (result.error) {
        setSummaries([]);
        setError(result.error);
        return;
      }
      setSummaries(result.summaries);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Admin campaign analytics failed to load.');
    } finally {
      setLoading(false);
    }
  }, [accessToken, isAdmin, search]);

  useEffect(() => {
    const timer = window.setTimeout(load, 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  const totals = useMemo(
    () =>
      summaries.reduce(
        (sum, entry) => ({
          metrics: sum.metrics + entry.total_metrics,
          manual: sum.manual + entry.manual_metrics,
          copies: sum.copies + entry.draft_copies,
          plays: sum.plays + entry.clip_plays,
        }),
        { metrics: 0, manual: 0, copies: 0, plays: 0 },
      ),
    [summaries],
  );

  if (!isAdmin) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
        <ShieldCheck className="mx-auto h-8 w-8 text-red-300" />
        <p className="mt-3 font-semibold text-red-100">Admin access required</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-amber-300">
            <ShieldCheck className="h-4 w-4" />
            Aggregate admin lane
          </div>
          <h1 className="mt-2 text-2xl font-bold text-white">Campaign Analytics</h1>
          <p className="mt-1 text-sm text-white/50">Creator and channel totals</p>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <label className="relative min-w-0 flex-1 sm:flex-none">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-white/35" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Channel or creator ID"
              className="h-9 min-w-0 w-full rounded-md border border-white/15 bg-black/40 pl-9 pr-3 text-sm text-white outline-none focus:border-amber-400/50 sm:w-64"
            />
          </label>
          <button
            type="button"
            onClick={load}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 bg-white/5 text-white/65 hover:bg-white/10 hover:text-white"
            title="Refresh admin analytics"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 md:grid-cols-5">
        <AdminMetric label="Channels" value={summaries.length} />
        <AdminMetric label="Evidence rows" value={totals.metrics} />
        <AdminMetric label="Manual entries" value={totals.manual} />
        <AdminMetric label="Draft copies" value={totals.copies} />
        <AdminMetric label="Clip plays" value={totals.plays} />
      </section>

      <section className="overflow-hidden rounded-lg border border-white/10 bg-black/20">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <BarChart3 className="h-4 w-4 text-amber-300" />
          <h2 className="text-sm font-semibold text-white">Channel summaries</h2>
        </div>
        {loading ? (
          <div className="flex min-h-56 items-center justify-center gap-2 text-sm text-white/45">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading aggregate analytics
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-red-200">{error}</div>
        ) : summaries.length === 0 ? (
          <div className="p-8 text-center text-sm text-white/35">No matching campaign summaries</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase text-white/40">
                <tr>
                  <th className="px-4 py-3 font-medium">Channel</th>
                  <th className="px-4 py-3 font-medium">Creator</th>
                  <th className="px-4 py-3 font-medium">Metrics</th>
                  <th className="px-4 py-3 font-medium">Manual</th>
                  <th className="px-4 py-3 font-medium">Copies</th>
                  <th className="px-4 py-3 font-medium">Used</th>
                  <th className="px-4 py-3 font-medium">Clips</th>
                  <th className="px-4 py-3 font-medium">Plays</th>
                  <th className="px-4 py-3 font-medium">Top platform</th>
                  <th className="px-4 py-3 font-medium">Top tag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {summaries.map((entry) => (
                  <tr key={entry.channel_id || `${entry.owner_user_id}-${entry.channel_title}`}>
                    <td className="px-4 py-3 font-medium text-white">{entry.channel_title}</td>
                    <td className="px-4 py-3 font-mono text-xs text-white/45">
                      {shortId(entry.owner_user_id)}
                    </td>
                    <td className="px-4 py-3 text-white/65">{entry.total_metrics}</td>
                    <td className="px-4 py-3 text-orange-200">{entry.manual_metrics}</td>
                    <td className="px-4 py-3 text-cyan-200">{entry.draft_copies}</td>
                    <td className="px-4 py-3 text-green-200">{entry.drafts_used}</td>
                    <td className="px-4 py-3 text-white/65">{entry.published_clips}</td>
                    <td className="px-4 py-3 text-blue-200">{entry.clip_plays}</td>
                    <td className="px-4 py-3 text-white/65">{formatLabel(entry.top_platform || '-')}</td>
                    <td className="px-4 py-3 text-white/65">{entry.top_tag || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="flex items-center gap-2 rounded-lg border border-amber-400/20 bg-amber-400/[0.05] px-4 py-3 text-xs text-amber-100/65">
        <Activity className="h-4 w-4 shrink-0" />
        Aggregate counts only. Private copy, prompts, source snapshots, storage paths, and review notes are excluded.
      </div>
    </div>
  );
};

function AdminMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[#0a0b0f] p-4">
      <div className="text-[11px] uppercase text-white/40">{label}</div>
      <div className="mt-2 text-xl font-semibold text-white">{value.toLocaleString()}</div>
    </div>
  );
}

function formatLabel(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function shortId(value: string): string {
  return value.length > 14 ? `${value.slice(0, 8)}...${value.slice(-4)}` : value;
}

export default AdminCampaignIntelligenceDashboard;

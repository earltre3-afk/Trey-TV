import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  ClipboardList,
  FileWarning,
  Gavel,
  Inbox,
  Lock,
  MessageSquarePlus,
  Scale,
  ShieldAlert,
  ShieldCheck,
  UserRoundSearch,
} from 'lucide-react';
import { AccessGate } from '../auth/components';
import { useTradioIdentity } from '../auth/useTradioIdentity';
import { Chip, GlassCard, PrimaryButton, SecondaryButton, TopBar } from '../ui';
import {
  addLegalReviewNote,
  archiveLegalRequest,
  getLegalAcceptanceAuditRecords,
  getLegalAdminDashboardStats,
  getLegalAdminRequests,
  updateLegalRequestStatus,
  type LegalAdminServiceSource,
} from './legalAdminService';
import type {
  LegalAcceptanceAuditRecord,
  LegalAdminDashboardStats,
  LegalAdminQueueFilter,
  LegalAdminRequest,
  LegalAdminRequestStatus,
  LegalRequestCategory,
  LegalRequestPriority,
} from './legalAdminTypes';

const tabs: { id: NonNullable<LegalAdminQueueFilter['tab']>; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'privacy', label: 'Privacy/Data' },
  { id: 'deletion', label: 'Deletion' },
  { id: 'copyright', label: 'Copyright/DMCA' },
  { id: 'moderation', label: 'Moderation Appeals' },
  { id: 'safety', label: 'Safety' },
  { id: 'intake', label: 'Legal Intake' },
  { id: 'acceptance', label: 'Acceptance Audit' },
];

const statusOptions: (LegalAdminRequestStatus | 'all')[] = ['all', 'new', 'open', 'pending_review', 'needs_more_info', 'escalated', 'resolved', 'rejected', 'archived'];
const priorityOptions: (LegalRequestPriority | 'all')[] = ['all', 'low', 'normal', 'high', 'urgent'];
const categoryOptions: (LegalRequestCategory | 'all')[] = ['all', 'privacy', 'data_rights', 'deletion', 'copyright', 'dmca', 'moderation', 'safety', 'impersonation', 'unauthorized_upload', 'account', 'creator', 'general'];

const emptyStats: LegalAdminDashboardStats = {
  new_requests: 0,
  urgent_requests: 0,
  deletion_requests: 0,
  copyright_dmca_reports: 0,
  unresolved_appeals: 0,
  acceptance_records_today: 0,
};

const statusTone: Record<LegalAdminRequestStatus, string> = {
  new: 'border-cyan-300/25 bg-cyan-500/10 text-cyan-200',
  open: 'border-purple-300/25 bg-purple-500/10 text-purple-200',
  pending_review: 'border-amber-300/25 bg-amber-500/10 text-amber-100',
  needs_more_info: 'border-fuchsia-300/25 bg-fuchsia-500/10 text-fuchsia-200',
  escalated: 'border-red-300/25 bg-red-500/10 text-red-200',
  resolved: 'border-emerald-300/25 bg-emerald-500/10 text-emerald-200',
  rejected: 'border-white/12 bg-white/[0.04] text-white/55',
  archived: 'border-white/10 bg-white/[0.02] text-white/40',
};

const priorityTone: Record<LegalRequestPriority, string> = {
  low: 'text-white/45',
  normal: 'text-cyan-200',
  high: 'text-amber-200',
  urgent: 'text-red-200',
};

const formatLabel = (value: string) => value.replace(/_/g, ' ');
const formatDate = (value: string) => new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

const selectClass = 'rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-xs font-bold text-white outline-none';

const StatusPill: React.FC<{ status: LegalAdminRequestStatus }> = ({ status }) => (
  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${statusTone[status]}`}>
    {formatLabel(status)}
  </span>
);

const StatCard: React.FC<{ label: string; value: number; Icon: React.FC<{ className?: string }> }> = ({ label, value, Icon }) => (
  <GlassCard className="p-4">
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">{label}</div>
        <div className="mt-2 text-2xl font-black text-white">{value}</div>
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-cyan-200">
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </GlassCard>
);

const DetailRows: React.FC<{ details: Record<string, unknown> }> = ({ details }) => {
  const entries = Object.entries(details);
  if (entries.length === 0) return <div className="text-xs text-white/45">No submitted form data attached.</div>;
  return (
    <div className="grid gap-2">
      {entries.map(([key, value]) => (
        <div key={key} className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
          <div className="text-[10px] font-black uppercase tracking-wider text-white/35">{formatLabel(key)}</div>
          <div className="mt-1 break-words text-xs leading-relaxed text-white/70">
            {Array.isArray(value) ? value.join(', ') : typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)}
          </div>
        </div>
      ))}
    </div>
  );
};

const RequestDetailPanel: React.FC<{
  request: LegalAdminRequest | null;
  note: string;
  onNoteChange: (value: string) => void;
  onAction: (action: LegalAdminRequestStatus | 'note' | 'archive') => void;
}> = ({ request, note, onNoteChange, onAction }) => {
  if (!request) {
    return (
      <GlassCard className="p-5">
        <div className="flex items-center gap-3 text-sm font-bold text-white">
          <UserRoundSearch className="h-4 w-4 text-cyan-300" /> Select a request
        </div>
        <p className="mt-2 text-xs leading-relaxed text-white/55">Open a queue item to review its request metadata, timeline, notes, and safe prototype actions.</p>
      </GlassCard>
    );
  }

  const isDeletion = request.category === 'deletion';
  const isDmca = ['dmca', 'copyright', 'unauthorized_upload'].includes(request.category);
  const deletion = isDeletion ? request as LegalAdminRequest & {
    confirmation_status?: { confirmed_delete: boolean; acknowledged_retention: boolean; identity_verified: boolean };
    retained_records_note?: string;
  } : null;

  return (
    <GlassCard glow className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/38">{request.id}</div>
          <h2 className="mt-1 text-xl font-black tracking-tight text-white">{request.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/62">{request.summary}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusPill status={request.status} />
          <span className={`rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${priorityTone[request.priority]}`}>
            {request.priority}
          </span>
        </div>
      </div>

      {(isDeletion || isDmca) && (
        <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-100/85">
          <div className="flex items-center gap-2 font-black text-amber-100">
            <AlertTriangle className="h-4 w-4" /> {isDeletion ? 'Deletion processing not wired' : 'DMCA workflow placeholder'}
          </div>
          <div className="mt-1">
            {isDeletion
              ? 'This prototype shows review readiness only. There is no irreversible delete action in this dashboard.'
              : 'This prototype does not automate takedowns, reinstatement, notices, or counter-notice handling.'}
          </div>
        </div>
      )}

      {deletion?.confirmation_status && (
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {Object.entries(deletion.confirmation_status).map(([key, value]) => (
            <div key={key} className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
              <div className="text-[10px] font-black uppercase tracking-wider text-white/35">{formatLabel(key)}</div>
              <div className={`mt-1 text-xs font-bold ${value ? 'text-emerald-200' : 'text-amber-200'}`}>{value ? 'Confirmed' : 'Pending'}</div>
            </div>
          ))}
          {deletion.retained_records_note && (
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3 sm:col-span-3">
              <div className="text-[10px] font-black uppercase tracking-wider text-white/35">Retained records note</div>
              <div className="mt-1 text-xs leading-relaxed text-white/65">{deletion.retained_records_note}</div>
            </div>
          )}
        </div>
      )}

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <div className="text-xs font-black uppercase tracking-wider text-white/38">Requester</div>
          <div className="mt-2 text-sm font-bold text-white">{request.requester.name}</div>
          <div className="mt-1 text-xs text-white/50">{request.requester.email ?? 'No email provided'}</div>
          <div className="mt-2 break-all text-[11px] text-white/40">{request.requester.user_id ?? 'No user id'} · {request.requester.public_profile_uid ?? 'No public profile uid'}</div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <div className="text-xs font-black uppercase tracking-wider text-white/38">Related</div>
          <div className="mt-2 text-xs text-white/60">Policy: {request.related_policy ?? 'Not attached'}</div>
          <div className="mt-1 break-all text-xs text-white/60">Content: {request.related_content_id ?? 'Not attached'}</div>
          <div className="mt-1 text-xs text-white/60">Submitted: {formatDate(request.submitted_at)}</div>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 text-xs font-black uppercase tracking-wider text-white/38">Submitted form data</div>
        <DetailRows details={request.details} />
      </div>

      <div className="mt-5">
        <div className="mb-2 text-xs font-black uppercase tracking-wider text-white/38">Timeline</div>
        <div className="space-y-2">
          {request.events.map((item) => (
            <div key={item.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold text-white/55">
                <span>{formatLabel(item.action)} · {item.actor}</span>
                <span>{formatDate(item.created_at)}</span>
              </div>
              <div className="mt-1 text-xs leading-relaxed text-white/68">{item.note}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <label className="text-xs font-black uppercase tracking-wider text-white/38">Reviewer note</label>
        <textarea
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder={request.reviewer_note ?? 'Add a non-public legal operations note...'}
          className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-black/30 p-3 text-sm text-white outline-none placeholder:text-white/30"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <SecondaryButton className="px-4 py-2 text-[10px]" onClick={() => onAction('open')}>Mark open</SecondaryButton>
          <SecondaryButton className="px-4 py-2 text-[10px]" onClick={() => onAction('needs_more_info')}>Needs info</SecondaryButton>
          <SecondaryButton className="px-4 py-2 text-[10px]" onClick={() => onAction('escalated')}>Escalate</SecondaryButton>
          <SecondaryButton className="px-4 py-2 text-[10px]" onClick={() => onAction('resolved')}>Resolve</SecondaryButton>
          <SecondaryButton className="px-4 py-2 text-[10px]" onClick={() => onAction('rejected')}>Reject</SecondaryButton>
          <SecondaryButton className="px-4 py-2 text-[10px]" onClick={() => onAction('archive')}><Archive className="h-3.5 w-3.5" /> Archive</SecondaryButton>
          <PrimaryButton className="px-4 py-2 text-[10px]" onClick={() => onAction('note')}><MessageSquarePlus className="h-3.5 w-3.5" /> Add note</PrimaryButton>
        </div>
      </div>
    </GlassCard>
  );
};

const AcceptanceAuditTable: React.FC<{ records: LegalAcceptanceAuditRecord[] }> = ({ records }) => (
  <GlassCard className="overflow-hidden p-4">
    <div className="mb-3 flex items-center gap-2 text-sm font-black text-white">
      <ClipboardList className="h-4 w-4 text-cyan-300" /> Legal Acceptance Audit
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-[860px] w-full text-left text-xs">
        <thead className="text-[10px] uppercase tracking-wider text-white/35">
          <tr>
            <th className="py-2 pr-3">User</th>
            <th className="py-2 pr-3">Flow</th>
            <th className="py-2 pr-3">Policy</th>
            <th className="py-2 pr-3">Accepted</th>
            <th className="py-2 pr-3">Source</th>
            <th className="py-2 pr-3">Rights</th>
            <th className="py-2 pr-3">Related</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/8 text-white/64">
          {records.map((record) => (
            <tr key={record.id}>
              <td className="py-3 pr-3 align-top">
                <div className="font-bold text-white/80">{record.user_id}</div>
                <div className="text-[11px] text-white/38">{record.public_profile_uid ?? 'No profile uid'}</div>
              </td>
              <td className="py-3 pr-3 align-top">{record.flow_id}</td>
              <td className="py-3 pr-3 align-top">{record.policy_id} v{record.policy_version}</td>
              <td className="py-3 pr-3 align-top">{formatDate(record.accepted_at)}</td>
              <td className="py-3 pr-3 align-top">{record.backend_status}</td>
              <td className="py-3 pr-3 align-top">{record.rights_confirmation_type ?? 'acknowledgement'}</td>
              <td className="py-3 pr-3 align-top">{record.related_reference_id ?? 'None'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {records.length === 0 && <div className="py-8 text-center text-xs text-white/45">No acceptance records match the current filters.</div>}
  </GlassCard>
);

export const LegalAdminDashboard: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { identity } = useTradioIdentity();
  const [tab, setTab] = useState<NonNullable<LegalAdminQueueFilter['tab']>>('all');
  const [status, setStatus] = useState<LegalAdminRequestStatus | 'all'>('all');
  const [priority, setPriority] = useState<LegalRequestPriority | 'all'>('all');
  const [category, setCategory] = useState<LegalRequestCategory | 'all'>('all');
  const [query, setQuery] = useState('');
  const [stats, setStats] = useState<LegalAdminDashboardStats>(emptyStats);
  const [requests, setRequests] = useState<LegalAdminRequest[]>([]);
  const [auditRecords, setAuditRecords] = useState<LegalAcceptanceAuditRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [source, setSource] = useState<LegalAdminServiceSource>('mock');
  const [warning, setWarning] = useState<string | null>(null);

  const filters = useMemo<LegalAdminQueueFilter>(() => ({ tab, status, priority, category, query }), [tab, status, priority, category, query]);
  const selectedRequest = requests.find((item) => item.id === selectedId) ?? null;

  const reload = useCallback(async () => {
    const [statsResult, requestsResult, auditResult] = await Promise.all([
      getLegalAdminDashboardStats(),
      getLegalAdminRequests(filters),
      getLegalAcceptanceAuditRecords(filters),
    ]);
    setStats(statsResult.data);
    setRequests(requestsResult.data);
    setAuditRecords(auditResult.data);
    setSource(requestsResult.source);
    setWarning(requestsResult.warning);
    if (requestsResult.data.length > 0 && !requestsResult.data.some((item) => item.id === selectedId)) {
      setSelectedId(requestsResult.data[0].id);
      setNote(requestsResult.data[0].reviewer_note ?? '');
    }
  }, [filters, selectedId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    setNote(selectedRequest?.reviewer_note ?? '');
  }, [selectedRequest?.id, selectedRequest?.reviewer_note]);

  const handleAction = async (action: LegalAdminRequestStatus | 'note' | 'archive') => {
    if (!selectedRequest) return;
    if (action === 'note') {
      await addLegalReviewNote(selectedRequest.id, note || 'Reviewer note added in mock dashboard.');
    } else if (action === 'archive') {
      await archiveLegalRequest(selectedRequest.id);
    } else {
      await updateLegalRequestStatus(selectedRequest.id, action, note || `Status changed to ${formatLabel(action)} in mock dashboard.`);
    }
    await reload();
  };

  return (
    <AccessGate
      capability="admin-platform"
      title="Legal Operations access required"
      message="This queue is reserved for Admin Mode, owners, and future legal reviewer grants. Request data is hidden from listener, artist, producer, and DJ modes."
    >
      <div className="space-y-6 pb-8">
        <TopBar showBack={Boolean(onBack)} onBack={onBack} title="Legal Operations" />

        <div className="px-4 sm:px-6 lg:px-10">
          <GlassCard glow className="p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Chip label="Admin access" selected icon={<ShieldCheck className="h-3.5 w-3.5" />} />
                  <Chip label={source === 'mock' ? 'Mock / Local' : 'Supabase Ready / Mock Data'} selected={source === 'mock'} icon={<Scale className="h-3.5 w-3.5" />} />
                </div>
                <h1 className="mt-4 text-3xl font-black tracking-tight text-white">Legal Operations</h1>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/62">
                  Review intake, privacy/data rights, deletion queue, copyright reports, moderation appeals, and acceptance activity. Prototype only. Not legal case management.
                </p>
              </div>
              <div className="rounded-2xl border border-amber-300/20 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-100/80 lg:max-w-xs">
                <div className="font-black text-amber-100">Non-destructive dashboard</div>
                <div className="mt-1">No legal email, takedown, reinstatement, or account deletion action is wired here.</div>
              </div>
            </div>
            {warning && <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-xs text-white/55">{warning}</div>}
            <div className="mt-3 text-[11px] text-white/40">Signed in as {identity.display_name} · {identity.public_profile_uid}</div>
          </GlassCard>
        </div>

        <div className="grid gap-3 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-6 lg:px-10">
          <StatCard label="New requests" value={stats.new_requests} Icon={Inbox} />
          <StatCard label="Urgent" value={stats.urgent_requests} Icon={ShieldAlert} />
          <StatCard label="Deletion" value={stats.deletion_requests} Icon={FileWarning} />
          <StatCard label="DMCA" value={stats.copyright_dmca_reports} Icon={Gavel} />
          <StatCard label="Appeals" value={stats.unresolved_appeals} Icon={Scale} />
          <StatCard label="Accepted today" value={stats.acceptance_records_today} Icon={CheckCircle2} />
        </div>

        <div className="px-4 sm:px-6 lg:px-10">
          <GlassCard className="p-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-wider transition ${
                    tab === item.id ? 'border-fuchsia-300/45 bg-fuchsia-500/15 text-white' : 'border-white/10 bg-white/[0.04] text-white/55 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-4">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search user, uid, request..."
                className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-xs font-bold text-white outline-none placeholder:text-white/30"
              />
              <select value={status} onChange={(event) => setStatus(event.target.value as LegalAdminRequestStatus | 'all')} className={selectClass}>
                {statusOptions.map((item) => <option key={item} value={item}>Status: {formatLabel(item)}</option>)}
              </select>
              <select value={priority} onChange={(event) => setPriority(event.target.value as LegalRequestPriority | 'all')} className={selectClass}>
                {priorityOptions.map((item) => <option key={item} value={item}>Priority: {formatLabel(item)}</option>)}
              </select>
              <select value={category} onChange={(event) => setCategory(event.target.value as LegalRequestCategory | 'all')} className={selectClass}>
                {categoryOptions.map((item) => <option key={item} value={item}>Category: {formatLabel(item)}</option>)}
              </select>
            </div>
          </GlassCard>
        </div>

        <div className="grid gap-4 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.25fr] lg:px-10">
          {tab === 'acceptance' ? (
            <div className="lg:col-span-2">
              <AcceptanceAuditTable records={auditRecords} />
            </div>
          ) : (
            <>
              <GlassCard className="p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-black text-white">
                  <ClipboardList className="h-4 w-4 text-cyan-300" /> Review Queue
                </div>
                <div className="space-y-2">
                  {requests.map((request) => (
                    <button
                      key={request.id}
                      onClick={() => setSelectedId(request.id)}
                      className={`w-full rounded-2xl border p-3 text-left transition ${
                        selectedId === request.id ? 'border-fuchsia-300/35 bg-fuchsia-500/10' : 'border-white/8 bg-white/[0.03] hover:border-white/16'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-black text-white">{request.title}</div>
                          <div className="mt-1 truncate text-xs text-white/50">{request.requester.name} · {request.requester.public_profile_uid ?? request.requester.user_id ?? 'unlinked'}</div>
                        </div>
                        <Lock className="h-3.5 w-3.5 shrink-0 text-white/28" />
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/55">{request.summary}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <StatusPill status={request.status} />
                        <span className={`text-[10px] font-black uppercase tracking-wider ${priorityTone[request.priority]}`}>{request.priority}</span>
                        <span className="text-[10px] text-white/35">{formatDate(request.submitted_at)}</span>
                      </div>
                    </button>
                  ))}
                </div>
                {requests.length === 0 && <div className="py-8 text-center text-xs text-white/45">No requests match the current filters.</div>}
              </GlassCard>
              <RequestDetailPanel request={selectedRequest} note={note} onNoteChange={setNote} onAction={handleAction} />
            </>
          )}
        </div>
      </div>
    </AccessGate>
  );
};

export default LegalAdminDashboard;

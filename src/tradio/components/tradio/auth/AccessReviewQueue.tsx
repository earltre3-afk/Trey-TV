import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, Clock, ShieldCheck, ShieldX, Slash, XCircle } from 'lucide-react';
import { GlassCard } from '../ui';
import { useAccessRequests, type AdminReviewStatus } from './AccessRequestsContext';
import { useTradioIdentity } from './useTradioIdentity';
import { REQUEST_TYPE_LABEL } from './accessRequests';
import { RequestStatusBadge, RequestEventTimeline } from './onboardingStates';
import { ROLE_LABELS } from './roleUtils';
import type { RoleAccessRequest } from './types';

const ACTIONABLE = ['submitted', 'pending', 'needs_more_info', 'restricted'];

const ReviewCard: React.FC<{ request: RoleAccessRequest }> = ({ request }) => {
  const access = useAccessRequests();
  const [note, setNote] = useState('');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!access) return null;
  const events = access.getEvents(request.id);
  const applicant = request.answers.find((a) => /name|identity/.test(a.field))?.value ?? 'Applicant';
  const isTerminal = request.status === 'approved' || request.status === 'cancelled' || request.status === 'rejected';

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try { await fn(); } finally { setBusy(false); setNote(''); }
  };

  const reviewBtn = (label: string, status: AdminReviewStatus, Icon: React.FC<{ className?: string }>, tone: string) => (
    <button
      disabled={busy}
      onClick={() => run(() => access.reviewRequest(request.id, status, note || undefined))}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold transition disabled:opacity-40 ${tone}`}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );

  return (
    <GlassCard className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-purple-400/25 bg-purple-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-purple-200">
              {REQUEST_TYPE_LABEL[request.request_type]}
            </span>
            {request.requested_role && (
              <span className="text-[11px] font-bold text-white/55">→ {ROLE_LABELS[request.requested_role]}</span>
            )}
            <RequestStatusBadge status={request.status} />
          </div>
          <div className="mt-2 truncate text-sm font-bold text-white">{applicant}</div>
        </div>
        <button onClick={() => setOpen((v) => !v)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-white/70 hover:border-white/25">
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open && (
        <div className="mt-3 space-y-3 border-t border-white/8 pt-3">
          <div>
            <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-white/40">Answers</div>
            <dl className="space-y-1">
              {request.answers.map((answer) => (
                <div key={answer.field} className="flex gap-2 text-[11px]">
                  <dt className="shrink-0 text-white/45">{answer.label}:</dt>
                  <dd className="min-w-0 text-white/75">{answer.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          {request.evidence && request.evidence.length > 0 && (
            <div>
              <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-white/40">Evidence</div>
              <dl className="space-y-1">
                {request.evidence.map((item) => (
                  <div key={item.field} className="flex gap-2 text-[11px]"><dt className="shrink-0 text-white/45">{item.label}:</dt><dd className="text-white/75">{item.value}</dd></div>
                ))}
              </dl>
            </div>
          )}
          <div>
            <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-white/40">Timeline</div>
            <RequestEventTimeline events={events} compact />
          </div>
        </div>
      )}

      {!isTerminal && (
        <div className="mt-3 space-y-2">
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Reviewer note (optional)…"
            rows={2}
            className="w-full resize-none rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-[12px] text-white outline-none placeholder:text-white/30 focus:border-fuchsia-300/40"
          />
          <div className="flex flex-wrap gap-2">
            <button
              disabled={busy}
              onClick={() => run(() => access.approveRequest(request.id, note || undefined))}
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/30 bg-emerald-500/15 px-3 py-1.5 text-[11px] font-bold text-emerald-200 transition hover:bg-emerald-500/25 disabled:opacity-40"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Approve
            </button>
            {reviewBtn('Reject', 'rejected', XCircle, 'border-red-300/30 bg-red-500/10 text-red-200 hover:bg-red-500/20')}
            {reviewBtn('Needs info', 'needs_more_info', Clock, 'border-fuchsia-300/30 bg-fuchsia-500/10 text-fuchsia-200 hover:bg-fuchsia-500/20')}
            {reviewBtn('Restrict', 'restricted', ShieldX, 'border-orange-300/30 bg-orange-500/10 text-orange-200 hover:bg-orange-500/20')}
            {reviewBtn('Archive', 'cancelled', Slash, 'border-white/12 bg-white/[0.04] text-white/55 hover:bg-white/[0.08]')}
          </div>
        </div>
      )}
    </GlassCard>
  );
};

/**
 * TRADIO PASS 4H — Admin access review prototype (NOT a full admin panel).
 * Renders only for identities that pass the `admin-platform` capability (admin/owner
 * role + admin mode). Actions call protected RPC when configured, else simulate
 * locally. Normal users never see this and there is no self-grant path.
 */
export const AccessReviewQueue: React.FC = () => {
  const { identity } = useTradioIdentity();
  const access = useAccessRequests();
  if (!access || !access.isAdmin) return null;

  const actionable = access.requests.filter((request) => ACTIONABLE.includes(request.status));
  const decided = access.requests.filter((request) => !ACTIONABLE.includes(request.status));

  return (
    <div className="rounded-2xl border border-red-300/20 bg-red-500/[0.05] p-4 sm:p-5">
      <div className="flex items-center gap-2 text-sm font-black text-red-100">
        <ShieldCheck className="h-4 w-4" /> Access Review Queue
        <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/45">
          Admin · {ROLE_LABELS[identity.roles.find((r) => r.role === 'owner') ? 'owner' : 'admin']}
        </span>
        {access.dataSource !== 'supabase' && (
          <span className="rounded-full border border-amber-300/25 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-200">Local / demo</span>
        )}
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-white/55">
        Reviewer prototype. Approvals/rejections call protected SECURITY DEFINER RPC when Supabase is wired;
        in demo mode they update local mock state and simulate the grant. Admin/owner is never self-assignable.
      </p>

      <div className="mt-4 space-y-3">
        <div className="text-[10px] font-bold uppercase tracking-wider text-white/45">Needs review ({actionable.length})</div>
        {actionable.length === 0 && <p className="text-[11px] italic text-white/40">No requests awaiting review.</p>}
        {actionable.map((request) => <ReviewCard key={request.id} request={request} />)}

        {decided.length > 0 && (
          <>
            <div className="pt-2 text-[10px] font-bold uppercase tracking-wider text-white/45">Decided ({decided.length})</div>
            {decided.map((request) => <ReviewCard key={request.id} request={request} />)}
          </>
        )}
      </div>
    </div>
  );
};

export default AccessReviewQueue;

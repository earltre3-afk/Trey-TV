import type {
  AccessRequestEvent,
  AccessRequestEventType,
  CreatorSetupState,
  RoleAccessRequest,
  RoleApplicationAnswer,
  RoleRequestStatus,
  RoleRequestType,
  TradioIdentity,
  TradioRole,
} from './types';
import { hasRole } from './roleUtils';

/**
 * TRADIO PASS 4F — Access request service (MOCK / FRONTEND-ONLY).
 *
 * Every function here is a safe stub. Nothing writes to Supabase. Elevated
 * roles (artist/producer/dj/moderator/admin/owner) are NEVER self-granted —
 * the user submits a request that stays `pending` until a future backend/RPC
 * review path (Pass 4G) processes it. Fan/listener remains the only default.
 */

/** The role a given request type would eventually grant (verification/broadcast grant no role). */
export const REQUEST_TYPE_ROLE: Partial<Record<RoleRequestType, TradioRole>> = {
  artist: 'artist',
  producer: 'producer',
  dj: 'dj',
};

export const REQUEST_TYPE_LABEL: Record<RoleRequestType, string> = {
  artist: 'Artist Access',
  producer: 'Producer Access',
  dj: 'DJ / Host Access',
  verification: 'Verification',
  broadcast: 'Broadcast Access',
};

let mockIdCounter = 100;
const nextId = () => `req-${(mockIdCounter += 1)}`;
let mockEventCounter = 1000;
const nextEventId = () => `evt-${(mockEventCounter += 1)}`;

export const makeAccessEvent = (
  event_type: AccessRequestEventType,
  opts: { from?: RoleRequestStatus; to?: RoleRequestStatus; note?: string; actor?: string; created_at?: string } = {},
): AccessRequestEvent => ({
  id: nextEventId(),
  event_type,
  from_status: opts.from,
  to_status: opts.to,
  note: opts.note,
  actor: opts.actor,
  created_at: opts.created_at ?? new Date().toISOString(),
});

/** Derives a plausible timeline (submitted → decision) for a seed request. */
const deriveSeedEvents = (request: RoleAccessRequest): AccessRequestEvent[] => {
  const events: AccessRequestEvent[] = [
    makeAccessEvent('submitted', { to: 'submitted', created_at: request.submitted_at }),
  ];
  if (request.reviewed_at && request.status !== 'pending' && request.status !== 'submitted') {
    const decisionEvent: AccessRequestEventType =
      request.status === 'approved' ? 'approved'
      : request.status === 'rejected' ? 'rejected'
      : request.status === 'restricted' ? 'restricted'
      : request.status === 'needs_more_info' ? 'needs_more_info'
      : 'note_added';
    events.push(makeAccessEvent(decisionEvent, { from: 'submitted', to: request.status, note: request.reviewer_note, actor: 'reviewer', created_at: request.reviewed_at }));
  }
  return events;
};

/**
 * Illustrative seed requests covering the lifecycle states required by Task 3.
 * These are demo records for the Access Center, not tied to a live user.
 */
export const MOCK_ROLE_ACCESS_REQUESTS: RoleAccessRequest[] = [
  {
    id: 'req-1',
    request_type: 'artist',
    requested_role: 'artist',
    status: 'pending',
    submitted_at: '2026-05-27T18:30:00Z',
    answers: [
      { field: 'artist_name', label: 'Artist / stage name', value: 'Nova Vale' },
      { field: 'genres', label: 'Genres', value: 'R&B, Alt-Soul' },
      { field: 'station_goal', label: 'Station goal', value: 'A late-night soul station with weekly premieres.' },
    ],
  },
  {
    id: 'req-2',
    request_type: 'producer',
    requested_role: 'producer',
    status: 'approved',
    submitted_at: '2026-05-20T12:00:00Z',
    reviewed_at: '2026-05-22T09:15:00Z',
    reviewer_note: 'Catalog verified. Producer tools unlocked.',
    answers: [
      { field: 'producer_name', label: 'Producer name', value: 'Darius Cole' },
      { field: 'beat_genres', label: 'Beat genres', value: 'Trap Soul, Lo-Fi' },
    ],
  },
  {
    id: 'req-3',
    request_type: 'dj',
    requested_role: 'dj',
    status: 'rejected',
    submitted_at: '2026-05-18T20:00:00Z',
    reviewed_at: '2026-05-19T15:40:00Z',
    reviewer_note: 'Need at least one sample mix or show concept before host tools can be granted.',
    answers: [
      { field: 'dj_name', label: 'Host / DJ name', value: 'DJ Echoes' },
      { field: 'show_type', label: 'Show type', value: 'Live request hour' },
    ],
  },
  {
    id: 'req-4',
    request_type: 'verification',
    status: 'pending',
    submitted_at: '2026-05-26T10:05:00Z',
    answers: [
      { field: 'verify_role', label: 'Role being verified', value: 'Artist' },
      { field: 'public_identity', label: 'Public identity', value: 'Mila Rain' },
      { field: 'reason', label: 'Reason', value: 'Verified artist badge for release premieres.' },
    ],
  },
  {
    id: 'req-5',
    request_type: 'broadcast',
    status: 'needs_more_info',
    submitted_at: '2026-05-24T14:20:00Z',
    reviewed_at: '2026-05-25T11:00:00Z',
    reviewer_note: 'Please acknowledge the moderation agreement and add a schedule intent.',
    answers: [
      { field: 'show_concept', label: 'Show concept', value: 'Midnight Soul Sessions' },
    ],
  },
  {
    id: 'req-6',
    request_type: 'artist',
    requested_role: 'artist',
    status: 'restricted',
    submitted_at: '2026-05-10T08:00:00Z',
    reviewed_at: '2026-05-12T08:00:00Z',
    reviewer_note: 'Account flagged for review. Artist tools are temporarily restricted.',
    answers: [{ field: 'artist_name', label: 'Artist / stage name', value: 'Ghostwriter' }],
  },
];

export const getRoleAccessRequestsMock = (): RoleAccessRequest[] =>
  MOCK_ROLE_ACCESS_REQUESTS.map((request) => ({ ...request, answers: [...request.answers], events: deriveSeedEvents(request) }));

/** Builds a mock RoleAccessRequest in the `pending` state from submitted answers. */
export const submitRoleAccessRequestMock = (
  type: RoleRequestType,
  answers: RoleApplicationAnswer[],
): RoleAccessRequest => {
  const submitted_at = new Date().toISOString();
  return {
    id: nextId(),
    request_type: type,
    requested_role: REQUEST_TYPE_ROLE[type],
    status: 'pending',
    submitted_at,
    answers,
    events: [makeAccessEvent('submitted', { to: 'pending', created_at: submitted_at })],
  };
};

/** Maps an admin decision status → the matching event type. */
const STATUS_EVENT: Partial<Record<RoleRequestStatus, AccessRequestEventType>> = {
  approved: 'approved',
  rejected: 'rejected',
  restricted: 'restricted',
  needs_more_info: 'needs_more_info',
  cancelled: 'cancelled',
};

/**
 * Mock admin review transition. Returns a NEW request with the updated status,
 * reviewer note, reviewed_at, and an appended timeline event. Never used by
 * normal users — only the admin review prototype calls this.
 */
export const reviewRoleAccessRequestMock = (
  request: RoleAccessRequest,
  status: RoleRequestStatus,
  note?: string,
  actor = 'admin',
): RoleAccessRequest => {
  const event = makeAccessEvent(STATUS_EVENT[status] ?? 'note_added', {
    from: request.status,
    to: status,
    note,
    actor,
  });
  return {
    ...request,
    status,
    reviewer_note: note ?? request.reviewer_note,
    reviewed_at: event.created_at,
    events: [...(request.events ?? []), event],
  };
};

export const submitVerificationRequestMock = (answers: RoleApplicationAnswer[]): RoleAccessRequest =>
  submitRoleAccessRequestMock('verification', answers);

export const submitBroadcastAccessRequestMock = (answers: RoleApplicationAnswer[]): RoleAccessRequest =>
  submitRoleAccessRequestMock('broadcast', answers);

/** Derives an aggregate, mock creator-access view from the identity + known requests. */
export const getCurrentUserAccessStateMock = (
  identity: TradioIdentity,
  requests: RoleAccessRequest[] = [],
): CreatorSetupState => {
  const approved_roles = identity.roles.filter((grant) => grant.role_status === 'active' || grant.role_status === 'approved').map((grant) => grant.role);
  const pending_requests = requests.filter((request) => request.status === 'pending' || request.status === 'submitted' || request.status === 'needs_more_info');
  return {
    user_id: identity.user_id,
    approved_roles,
    pending_requests,
    history: requests,
    verification_status: identity.verification_status === 'verified' ? 'approved' : identity.verification_status === 'pending' ? 'pending' : 'not_started',
    broadcast_access_status: identity.broadcast_access_status === 'cleared' ? 'approved' : ['submitted', 'pending', 'under_review'].includes(identity.broadcast_access_status) ? 'pending' : 'not_started',
  };
};

/**
 * Whether the user may submit a NEW request of this type. False when they
 * already hold the role / access, or a request is already in flight.
 */
export const canSubmitRoleRequest = (
  identity: TradioIdentity,
  type: RoleRequestType,
  requests: RoleAccessRequest[] = [],
): boolean => {
  const role = REQUEST_TYPE_ROLE[type];
  if (role && hasRole(identity, role)) return false;
  if (type === 'verification' && identity.verification_status === 'verified') return false;
  if (type === 'broadcast' && identity.broadcast_access_status === 'cleared') return false;

  const open = requests.find((request) => request.request_type === type);
  if (open && ['pending', 'submitted', 'restricted'].includes(open.status)) return false;
  return true;
};

export const getRequestStatusLabel = (status: RoleRequestStatus): string => {
  const labels: Record<RoleRequestStatus, string> = {
    not_started: 'Not started',
    draft: 'Draft saved',
    submitted: 'Submitted',
    pending: 'Pending review',
    approved: 'Approved',
    rejected: 'Not approved',
    restricted: 'Restricted',
    needs_more_info: 'Needs more info',
    cancelled: 'Cancelled',
  };
  return labels[status];
};

/** Human next-step copy for a given request type + its current status. */
export const getNextAccessStep = (type: RoleRequestType, status: RoleRequestStatus): string => {
  if (status === 'pending' || status === 'submitted') return `Your ${REQUEST_TYPE_LABEL[type]} request is in review. We'll notify you once it's processed.`;
  if (status === 'approved') return `${REQUEST_TYPE_LABEL[type]} is active. Switch modes to use the new tools.`;
  if (status === 'rejected') return `Update your details and resubmit your ${REQUEST_TYPE_LABEL[type]} request.`;
  if (status === 'needs_more_info') return `Add the requested details to continue your ${REQUEST_TYPE_LABEL[type]} request.`;
  if (status === 'restricted') return `${REQUEST_TYPE_LABEL[type]} is restricted. Contact support to restore access.`;
  return `Start your ${REQUEST_TYPE_LABEL[type]} request to unlock these tools.`;
};

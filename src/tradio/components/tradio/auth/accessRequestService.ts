import { isSupabaseConfigured, supabase } from '@/tradio/lib/supabaseClient';
import { handleMissingTradioTables } from './tradioProfileBootstrap';
import {
  REQUEST_TYPE_ROLE,
  getRoleAccessRequestsMock,
  submitRoleAccessRequestMock,
} from './accessRequests';
import type { RoleAccessRequest, RoleApplicationAnswer, RoleRequestStatus, RoleRequestType } from './types';

/**
 * TRADIO PASS 4G — Access request service (Supabase-or-mock PREP layer).
 *
 * This is the future integration point for the draft `tradio_role_access_requests`
 * schema + review RPC. It is intentionally NOT yet wired into AccessRequestsProvider
 * so the working mock UX (Pass 4F) is preserved. Every function:
 *   * uses Supabase RPC / tables when configured,
 *   * falls back to the mock service when not configured or the migration is
 *     not applied (missing table / RLS), and
 *   * never throws — the app must run with no Supabase env vars.
 *
 * Admin functions (`reviewAccessRequestAdmin`, `grantRoleFromRequestAdmin`) only
 * ever call protected SECURITY DEFINER RPC; there is no client path that grants
 * elevated roles.
 */

export type AccessServiceSource = 'supabase' | 'mock' | 'unavailable';

export interface AccessServiceResult<T> {
  source: AccessServiceSource;
  data: T | null;
  warning: string | null;
}

const ok = <T>(source: AccessServiceSource, data: T | null, warning: string | null = null): AccessServiceResult<T> => ({ source, data, warning });

const VALID_STATUSES: RoleRequestStatus[] = ['draft', 'submitted', 'pending', 'approved', 'rejected', 'restricted', 'needs_more_info'];
const asStatus = (value: unknown): RoleRequestStatus => (typeof value === 'string' && (VALID_STATUSES as string[]).includes(value) ? value as RoleRequestStatus : 'submitted');

type DbRow = Record<string, unknown>;

/** Maps a tradio_role_access_requests row → the frontend RoleAccessRequest shape. */
const mapRow = (row: DbRow): RoleAccessRequest => {
  const answersField = (row.answers as { fields?: RoleApplicationAnswer[] } | undefined)?.fields;
  return {
    id: String(row.id ?? ''),
    request_type: (row.request_type as RoleRequestType) ?? 'artist',
    requested_role: (row.requested_role as RoleAccessRequest['requested_role']) ?? undefined,
    status: asStatus(row.status),
    submitted_at: (row.submitted_at as string) ?? undefined,
    reviewed_at: (row.reviewed_at as string) ?? undefined,
    reviewer_note: (row.reviewer_note as string) ?? undefined,
    answers: Array.isArray(answersField) ? answersField : [],
  };
};

const packAnswers = (answers: RoleApplicationAnswer[]) => ({ fields: answers });

// ─── Self-service ────────────────────────────────────────────────────────────

export const submitAccessRequest = async (
  type: RoleRequestType,
  answers: RoleApplicationAnswer[],
): Promise<AccessServiceResult<RoleAccessRequest>> => {
  if (!isSupabaseConfigured || !supabase) return ok('mock', submitRoleAccessRequestMock(type, answers));
  try {
    const { data, error } = await supabase.rpc('tradio_submit_access_request', {
      p_request_type: type,
      p_requested_role: REQUEST_TYPE_ROLE[type] ?? null,
      p_answers: packAnswers(answers),
      p_evidence: {},
    });
    if (error) {
      const { message } = handleMissingTradioTables(error);
      return ok('mock', submitRoleAccessRequestMock(type, answers), message);
    }
    const row = Array.isArray(data) ? data[0] : data;
    return ok('supabase', row ? mapRow(row as DbRow) : submitRoleAccessRequestMock(type, answers));
  } catch (error) {
    const { message } = handleMissingTradioTables(error);
    return ok('mock', submitRoleAccessRequestMock(type, answers), message);
  }
};

export const getMyAccessRequests = async (): Promise<AccessServiceResult<RoleAccessRequest[]>> => {
  if (!isSupabaseConfigured || !supabase) return ok('mock', getRoleAccessRequestsMock());
  try {
    const { data, error } = await supabase
      .from('tradio_role_access_requests')
      .select('id,request_type,requested_role,status,answers,submitted_at,reviewed_at,reviewer_note')
      .order('submitted_at', { ascending: false });
    if (error) {
      const { message } = handleMissingTradioTables(error);
      return ok('mock', getRoleAccessRequestsMock(), message);
    }
    return ok('supabase', (Array.isArray(data) ? data : []).map((row) => mapRow(row as DbRow)));
  } catch (error) {
    const { message } = handleMissingTradioTables(error);
    return ok('mock', getRoleAccessRequestsMock(), message);
  }
};

export const updateMyAccessRequestDraft = async (
  requestId: string,
  answers: RoleApplicationAnswer[],
  resubmit = false,
): Promise<AccessServiceResult<RoleAccessRequest>> => {
  if (!isSupabaseConfigured || !supabase) return ok<RoleAccessRequest>('mock', null, 'Supabase not configured; draft kept locally.');
  try {
    const { data, error } = await supabase.rpc('tradio_update_access_request', {
      p_request_id: requestId,
      p_answers: packAnswers(answers),
      p_evidence: null,
      p_resubmit: resubmit,
    });
    if (error) return ok<RoleAccessRequest>('mock', null, handleMissingTradioTables(error).message);
    const row = Array.isArray(data) ? data[0] : data;
    return ok<RoleAccessRequest>('supabase', row ? mapRow(row as DbRow) : null);
  } catch (error) {
    return ok<RoleAccessRequest>('mock', null, handleMissingTradioTables(error).message);
  }
};

export const cancelMyAccessRequest = async (requestId: string): Promise<AccessServiceResult<RoleAccessRequest>> => {
  if (!isSupabaseConfigured || !supabase) return ok<RoleAccessRequest>('mock', null, 'Supabase not configured; cancellation kept locally.');
  try {
    const { data, error } = await supabase.rpc('tradio_cancel_access_request', { p_request_id: requestId });
    if (error) return ok<RoleAccessRequest>('mock', null, handleMissingTradioTables(error).message);
    const row = Array.isArray(data) ? data[0] : data;
    return ok<RoleAccessRequest>('supabase', row ? mapRow(row as DbRow) : null);
  } catch (error) {
    return ok<RoleAccessRequest>('mock', null, handleMissingTradioTables(error).message);
  }
};

export const getAccessRequestEvents = async (requestId: string): Promise<AccessServiceResult<DbRow[]>> => {
  if (!isSupabaseConfigured || !supabase) return ok('mock', []);
  try {
    const { data, error } = await supabase
      .from('tradio_access_request_events')
      .select('id,request_id,actor_user_id,event_type,from_status,to_status,note,created_at')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true });
    if (error) return ok('mock', [], handleMissingTradioTables(error).message);
    return ok('supabase', Array.isArray(data) ? (data as DbRow[]) : []);
  } catch (error) {
    return ok('mock', [], handleMissingTradioTables(error).message);
  }
};

// ─── Admin / reviewer (protected RPC only) ────────────────────────────────────
// These never run from an ordinary client successfully; the RPC enforces
// tradio_is_platform_admin(). When Supabase is absent they report "unavailable".

export const reviewAccessRequestAdmin = async (
  requestId: string,
  status: Extract<RoleRequestStatus, 'pending' | 'rejected' | 'restricted' | 'needs_more_info'>,
  note?: string,
): Promise<AccessServiceResult<RoleAccessRequest>> => {
  if (!isSupabaseConfigured || !supabase) return ok<RoleAccessRequest>('unavailable', null, 'Admin review requires Supabase + reviewer privileges (not wired in mock mode).');
  try {
    const { data, error } = await supabase.rpc('tradio_review_access_request', { p_request_id: requestId, p_status: status, p_note: note ?? null });
    if (error) return ok<RoleAccessRequest>('unavailable', null, handleMissingTradioTables(error).message);
    const row = Array.isArray(data) ? data[0] : data;
    return ok<RoleAccessRequest>('supabase', row ? mapRow(row as DbRow) : null);
  } catch (error) {
    return ok<RoleAccessRequest>('unavailable', null, handleMissingTradioTables(error).message);
  }
};

export const grantRoleFromRequestAdmin = async (
  requestId: string,
  note?: string,
): Promise<AccessServiceResult<RoleAccessRequest>> => {
  if (!isSupabaseConfigured || !supabase) return ok<RoleAccessRequest>('unavailable', null, 'Granting roles requires Supabase + reviewer privileges (not wired in mock mode).');
  try {
    const { data, error } = await supabase.rpc('tradio_grant_role_from_request', { p_request_id: requestId, p_note: note ?? null });
    if (error) return ok<RoleAccessRequest>('unavailable', null, handleMissingTradioTables(error).message);
    const row = Array.isArray(data) ? data[0] : data;
    return ok<RoleAccessRequest>('supabase', row ? mapRow(row as DbRow) : null);
  } catch (error) {
    return ok<RoleAccessRequest>('unavailable', null, handleMissingTradioTables(error).message);
  }
};

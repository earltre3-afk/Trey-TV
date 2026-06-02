import { isSupabaseConfigured, supabase } from '@/tradio/lib/supabaseClient';
import { handleMissingTradioTables } from '../auth/tradioProfileBootstrap';

export type LegalServiceSource = 'supabase' | 'unavailable';

export interface LegalServiceResult<T> {
  source: LegalServiceSource;
  data: T | null;
  warning: string | null;
}

const ok = <T>(source: LegalServiceSource, data: T | null, warning: string | null = null): LegalServiceResult<T> => ({ source, data, warning });

export type LegalRequestType =
  | 'contact_support'
  | 'report_content'
  | 'report_copyright'
  | 'dmca_notice'
  | 'dmca_counter_notice'
  | 'data_access'
  | 'data_correct'
  | 'data_delete'
  | 'data_export'
  | 'data_opt_out'
  | 'account_deletion'
  | 'moderation_appeal'
  | 'role_appeal'
  | 'report_safety'
  | 'report_impersonation'
  | 'report_unauthorized_music';

export type LegalRequestStatus =
  | 'new'
  | 'open'
  | 'pending_review'
  | 'escalated'
  | 'archived'
  | 'submitted'
  | 'in_review'
  | 'needs_more_info'
  | 'resolved'
  | 'rejected'
  | 'closed'
  | 'cancelled';

export interface LegalRequestRow {
  id: string;
  request_type: LegalRequestType;
  status: LegalRequestStatus;
  subject: string | null;
  contact_email: string | null;
  payload: Record<string, unknown>;
  reviewer_id?: string | null;
  reviewer_note?: string | null;
  submitted_at: string;
  reviewed_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LegalAcceptanceContext {
  flow?: string;
  details?: Record<string, unknown>;
}

const FORM_TO_REQUEST_TYPE: Record<string, LegalRequestType> = {
  'contact-support': 'contact_support',
  'report-content': 'report_content',
  'report-copyright': 'report_copyright',
  'dmca-notice': 'dmca_notice',
  'dmca-counter-notice': 'dmca_counter_notice',
  'data-rights': 'data_access',
  'moderation-appeal': 'moderation_appeal',
  'role-appeal': 'role_appeal',
  'report-safety': 'report_safety',
  'report-impersonation': 'report_impersonation',
  'report-unauthorized-music': 'report_unauthorized_music',
};

const DATA_RIGHTS_VALUE_TO_REQUEST_TYPE: Record<string, LegalRequestType> = {
  'Access my data': 'data_access',
  'Correct my data': 'data_correct',
  'Delete my data': 'data_delete',
  'Export my data': 'data_export',
  'Opt out of sale/share': 'data_opt_out',
  'Appeal a privacy decision': 'data_opt_out',
};

const normalizeRequestType = (formId: string, values: Record<string, string>): LegalRequestType => {
  if (formId === 'data-rights') {
    const requestType = values.requestType ?? '';
    return DATA_RIGHTS_VALUE_TO_REQUEST_TYPE[requestType] ?? 'data_access';
  }
  return FORM_TO_REQUEST_TYPE[formId] ?? 'contact_support';
};

const normalizePayload = (values: Record<string, string>): Record<string, unknown> => ({
  values,
  submittedAt: new Date().toISOString(),
});

const mapRow = (row: Record<string, unknown>): LegalRequestRow => ({
  id: String(row.id ?? ''),
  request_type: (row.request_type as LegalRequestType) ?? 'contact_support',
  status: (row.status as LegalRequestStatus) ?? 'submitted',
  subject: (row.subject as string) ?? null,
  contact_email: (row.contact_email as string) ?? (row.requester_email as string) ?? null,
  payload: (row.payload as Record<string, unknown>) ?? (row.details as Record<string, unknown>) ?? {},
  reviewer_id: (row.reviewer_id as string) ?? (row.assigned_reviewer_id as string) ?? null,
  reviewer_note: (row.reviewer_note as string) ?? null,
  submitted_at: (row.submitted_at as string) ?? '',
  reviewed_at: (row.reviewed_at as string) ?? null,
  created_at: (row.created_at as string) ?? undefined,
  updated_at: (row.updated_at as string) ?? undefined,
});

const maybeSupabase = () => {
  if (!isSupabaseConfigured || !supabase) return null;
  return supabase;
};

const handleRpcError = (error: unknown): string => {
  const classified = handleMissingTradioTables(error);
  const msg = classified.message;
  const lower = msg.toLowerCase();
  if (
    lower.includes('could not find the function') ||
    lower.includes('schema cache') ||
    lower.includes('does not exist') ||
    lower.includes('function')
  ) {
    return 'Broadcast acknowledgement saved locally (database function not deployed).';
  }
  return msg;
};

export const submitLegalRequest = async (
  formId: string,
  subject: string,
  values: Record<string, string>,
): Promise<LegalServiceResult<LegalRequestRow>> => {
  const client = maybeSupabase();
  if (!client) {
    return ok<LegalRequestRow>('unavailable', null, 'Supabase is not configured. The request is preserved as a UI placeholder.');
  }

  try {
    const requestType = normalizeRequestType(formId, values);
    const payload = normalizePayload(values);
    const contactEmail = values.email?.trim() || null;

    const { data, error } = await client.rpc('tradio_submit_legal_request', {
      p_request_type: requestType,
      p_subject: subject,
      p_contact_email: contactEmail,
      p_payload: payload,
    });
    if (error) return ok<LegalRequestRow>('unavailable', null, handleRpcError(error));
    const row = Array.isArray(data) ? data[0] : data;
    return ok<LegalRequestRow>('supabase', row ? mapRow(row as Record<string, unknown>) : null);
  } catch (error) {
    return ok<LegalRequestRow>('unavailable', null, handleRpcError(error));
  }
};

export const submitAccountDeletionRequest = async (
  confirmed: boolean,
  acknowledged: boolean,
): Promise<LegalServiceResult<LegalRequestRow>> => {
  const client = maybeSupabase();
  if (!client) {
    return ok<LegalRequestRow>('unavailable', null, 'Supabase is not configured. Deletion request remains a frontend placeholder.');
  }

  try {
    const { data, error } = await client.rpc('tradio_submit_legal_request', {
      p_request_type: 'account_deletion' as LegalRequestType,
      p_subject: 'Account Deletion Request',
      p_contact_email: null,
      p_payload: { confirmed, acknowledged, submittedAt: new Date().toISOString() },
    });
    if (error) return ok<LegalRequestRow>('unavailable', null, handleRpcError(error));
    const row = Array.isArray(data) ? data[0] : data;
    return ok<LegalRequestRow>('supabase', row ? mapRow(row as Record<string, unknown>) : null);
  } catch (error) {
    return ok<LegalRequestRow>('unavailable', null, handleRpcError(error));
  }
};

export const recordLegalAcceptance = async (
  documentId: string,
  documentVersion: string,
  flow?: string,
  context: LegalAcceptanceContext = {},
): Promise<LegalServiceResult<Record<string, unknown>>> => {
  const client = maybeSupabase();
  if (!client) {
    return ok<Record<string, unknown>>('unavailable', null, 'Supabase is not configured. Acceptance is not persisted.');
  }

  try {
    const { data, error } = await client.rpc('tradio_record_legal_acceptance', {
      p_document_id: documentId,
      p_document_version: documentVersion,
      p_flow: flow,
      p_context: context,
    });
    if (error) return ok<Record<string, unknown>>('unavailable', null, handleRpcError(error));
    const row = Array.isArray(data) ? data[0] : data;
    return ok('supabase', row as Record<string, unknown>);
  } catch (error) {
    return ok<Record<string, unknown>>('unavailable', null, handleRpcError(error));
  }
};

export const recordUploadRights = async (
  uploadType: 'music' | 'beat' | 'mix' | 'other',
  referenceId: string | null = null,
  confirmation: Record<string, unknown> = {},
): Promise<LegalServiceResult<Record<string, unknown>>> => {
  const client = maybeSupabase();
  if (!client) {
    return ok<Record<string, unknown>>('unavailable', null, 'Supabase is not configured. Upload rights confirmation is not persisted.');
  }

  try {
    const { data, error } = await client.rpc('tradio_record_upload_rights', {
      p_upload_type: uploadType,
      p_reference_id: referenceId,
      p_confirmation: confirmation,
    });
    if (error) return ok<Record<string, unknown>>('unavailable', null, handleRpcError(error));
    const row = Array.isArray(data) ? data[0] : data;
    return ok('supabase', row as Record<string, unknown>);
  } catch (error) {
    return ok<Record<string, unknown>>('unavailable', null, handleRpcError(error));
  }
};

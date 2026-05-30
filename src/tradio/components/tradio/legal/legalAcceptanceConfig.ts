import { recordLegalAcceptance, recordUploadRights, type LegalServiceResult } from './legalIntakeService';
import { getLegalDocument } from './legalDocuments';

export type LegalAcceptanceFlowId =
  | 'instant_release_submit'
  | 'producer_beat_publish'
  | 'dj_broadcast_schedule'
  | 'song_wars_create'
  | 'role_access_request'
  | 'creator_profile_publish'
  | 'prescribe_me_ai_notice';

export interface LegalPolicyRequirement {
  id: string;
  documentId: string;
  title: string;
  version: string;
  required: boolean;
}

export interface LegalConfirmationRequirement {
  id: string;
  label: string;
  required: boolean;
}

export interface LegalAcceptanceFlowConfig {
  id: LegalAcceptanceFlowId;
  title: string;
  description: string;
  acceptanceEventType: string;
  requiredPolicies: LegalPolicyRequirement[];
  requiredConfirmations: LegalConfirmationRequirement[];
  relatedLegalRoutes: { label: string; target: string }[];
  uploadRightsType?: 'music' | 'beat' | 'mix' | 'other';
  fallbackMessage: string;
}

export type LegalAcceptanceValues = Record<string, boolean>;

const policy = (documentId: string, required = true): LegalPolicyRequirement => {
  const doc = getLegalDocument(documentId);
  return {
    id: `policy:${documentId}`,
    documentId,
    title: doc?.title ?? documentId,
    version: doc?.version ?? '0.1.0',
    required,
  };
};

export const LEGAL_ACCEPTANCE_FLOWS: Record<LegalAcceptanceFlowId, LegalAcceptanceFlowConfig> = {
  instant_release_submit: {
    id: 'instant_release_submit',
    title: 'Release rights confirmation',
    description: 'Required before publishing or scheduling a Tradio-native music release.',
    acceptanceEventType: 'music_upload_terms_acceptance',
    requiredPolicies: [policy('music-upload-terms')],
    requiredConfirmations: [
      { id: 'own_music_rights', label: 'I confirm I own or control the rights to upload this music.', required: true },
      { id: 'unauthorized_removal', label: 'I understand unauthorized uploads may be removed.', required: true },
    ],
    relatedLegalRoutes: [
      { label: 'Music Upload Terms', target: 'music-upload-terms' },
      { label: 'Copyright Policy', target: 'copyright' },
      { label: 'DMCA Policy', target: 'dmca' },
    ],
    uploadRightsType: 'music',
    fallbackMessage: 'Will be recorded when backend legal records are ready.',
  },
  producer_beat_publish: {
    id: 'producer_beat_publish',
    title: 'Beat rights confirmation',
    description: 'Required before adding, publishing, or pitching beats from Producer Hub.',
    acceptanceEventType: 'producer_beat_terms_acceptance',
    requiredPolicies: [policy('producer-terms')],
    requiredConfirmations: [
      { id: 'own_beat_rights', label: 'I confirm I own or control the rights to this beat.', required: true },
      { id: 'samples_cleared', label: 'I understand samples/loops must be cleared where required.', required: true },
    ],
    relatedLegalRoutes: [
      { label: 'Producer / Beat Terms', target: 'producer-terms' },
      { label: 'Music Upload Terms', target: 'music-upload-terms' },
      { label: 'Copyright Policy', target: 'copyright' },
    ],
    uploadRightsType: 'beat',
    fallbackMessage: 'Beat rights confirmation will be recorded when backend legal records are ready.',
  },
  dj_broadcast_schedule: {
    id: 'dj_broadcast_schedule',
    title: 'Broadcast responsibility confirmation',
    description: 'Required before scheduling or going live with a DJ, host, or broadcast show.',
    acceptanceEventType: 'dj_broadcast_terms_acceptance',
    requiredPolicies: [policy('dj-broadcast-terms')],
    requiredConfirmations: [
      { id: 'broadcast_moderation', label: 'I understand broadcasts may be moderated, archived, or removed.', required: true },
      { id: 'authorized_show_content', label: 'I confirm I am responsible for authorized content in my show.', required: true },
    ],
    relatedLegalRoutes: [
      { label: 'DJ / Broadcast Terms', target: 'dj-broadcast-terms' },
      { label: 'Community Guidelines', target: 'community-guidelines' },
      { label: 'Copyright Policy', target: 'copyright' },
    ],
    uploadRightsType: 'mix',
    fallbackMessage: 'Broadcast acknowledgement will be recorded when backend legal records are ready.',
  },
  song_wars_create: {
    id: 'song_wars_create',
    title: 'Song Wars rules confirmation',
    description: 'Required before creating or launching a battle as an artist or host.',
    acceptanceEventType: 'song_wars_rules_acceptance',
    requiredPolicies: [policy('song-wars-rules')],
    requiredConfirmations: [
      { id: 'authorized_battle_songs', label: 'I confirm submitted songs are authorized.', required: true },
      { id: 'fair_play_acknowledged', label: 'I understand vote manipulation or abusive behavior may disqualify a battle.', required: true },
    ],
    relatedLegalRoutes: [
      { label: 'Song Wars Rules', target: 'song-wars-rules' },
      { label: 'Community Guidelines', target: 'community-guidelines' },
      { label: 'DJ / Broadcast Terms', target: 'dj-broadcast-terms' },
    ],
    uploadRightsType: 'music',
    fallbackMessage: 'Song Wars acknowledgement will be recorded when backend legal records are ready.',
  },
  role_access_request: {
    id: 'role_access_request',
    title: 'Access request acknowledgement',
    description: 'Required before submitting role, verification, or broadcast access requests.',
    acceptanceEventType: 'role_access_request_acceptance',
    requiredPolicies: [policy('terms'), policy('community-guidelines'), policy('creator-terms')],
    requiredConfirmations: [
      { id: 'accurate_information', label: 'I confirm the submitted information is accurate.', required: true },
      { id: 'access_revocable', label: 'I understand access can be denied, restricted, or revoked.', required: true },
    ],
    relatedLegalRoutes: [
      { label: 'Terms', target: 'terms' },
      { label: 'Community Guidelines', target: 'community-guidelines' },
      { label: 'Creator Terms', target: 'creator-terms' },
    ],
    fallbackMessage: 'Access acknowledgement will be recorded when backend legal records are ready.',
  },
  creator_profile_publish: {
    id: 'creator_profile_publish',
    title: 'Creator profile publish confirmation',
    description: 'Required before publishing an artist, producer, or DJ/host public profile.',
    acceptanceEventType: 'creator_profile_publish_acceptance',
    requiredPolicies: [policy('creator-terms')],
    requiredConfirmations: [
      { id: 'profile_accuracy', label: 'I agree that public profile information must be accurate.', required: true },
      { id: 'profile_asset_rights', label: 'I confirm I have the right to display linked media/profile assets.', required: true },
      { id: 'profile_review', label: 'I understand my creator profile may be reviewed or restricted.', required: true },
    ],
    relatedLegalRoutes: [
      { label: 'Creator Terms', target: 'creator-terms' },
      { label: 'Community Guidelines', target: 'community-guidelines' },
      { label: 'Privacy Policy', target: 'privacy' },
    ],
    fallbackMessage: 'Creator profile acknowledgement will be recorded when backend legal records are ready.',
  },
  prescribe_me_ai_notice: {
    id: 'prescribe_me_ai_notice',
    title: 'AI / Prescribe Me notice',
    description: 'Informational AI transparency links for recommendation and prescription surfaces.',
    acceptanceEventType: 'prescribe_me_ai_notice_view',
    requiredPolicies: [],
    requiredConfirmations: [],
    relatedLegalRoutes: [
      { label: 'AI / Prescribe Me Explanation', target: 'prescribe-me' },
      { label: 'AI Disclosure', target: 'ai-disclosure' },
      { label: 'Privacy Choices', target: 'privacy-choices' },
    ],
    fallbackMessage: 'AI notice is informational only in this pass.',
  },
};

export const createLegalAcceptanceValues = (flowId: LegalAcceptanceFlowId): LegalAcceptanceValues => {
  const flow = LEGAL_ACCEPTANCE_FLOWS[flowId];
  return [...flow.requiredPolicies, ...flow.requiredConfirmations].reduce<LegalAcceptanceValues>((acc, item) => {
    acc[item.id] = false;
    return acc;
  }, {});
};

export const isLegalFlowAccepted = (flowId: LegalAcceptanceFlowId, values: LegalAcceptanceValues): boolean => {
  const flow = LEGAL_ACCEPTANCE_FLOWS[flowId];
  return [...flow.requiredPolicies, ...flow.requiredConfirmations]
    .filter((item) => item.required)
    .every((item) => values[item.id] === true);
};

export const recordLegalFlowAcceptance = async (
  flowId: LegalAcceptanceFlowId,
  values: LegalAcceptanceValues,
  context: Record<string, unknown> = {},
): Promise<LegalServiceResult<Record<string, unknown>>> => {
  const flow = LEGAL_ACCEPTANCE_FLOWS[flowId];
  if (!isLegalFlowAccepted(flowId, values)) {
    return { source: 'unavailable', data: null, warning: 'Required legal acknowledgements are incomplete.' };
  }

  const recordedAt = new Date().toISOString();
  const policyResults = await Promise.all(flow.requiredPolicies.map((item) => recordLegalAcceptance(
    item.documentId,
    item.version,
    flow.id,
    {
      flow: flow.id,
      details: {
        acceptanceEventType: flow.acceptanceEventType,
        checked: values,
        context,
        recordedAt,
      },
    },
  )));

  const rightsResult = flow.uploadRightsType
    ? await recordUploadRights(flow.uploadRightsType, typeof context.referenceId === 'string' ? context.referenceId : null, {
      flow: flow.id,
      acceptanceEventType: flow.acceptanceEventType,
      checked: values,
      context,
      recordedAt,
    })
    : null;

  const warning = [...policyResults, rightsResult]
    .filter(Boolean)
    .map((result) => result?.warning)
    .find(Boolean) ?? null;

  const source = [...policyResults, rightsResult].some((result) => result?.source === 'supabase') ? 'supabase' : 'unavailable';
  return {
    source,
    data: {
      flowId,
      acceptanceEventType: flow.acceptanceEventType,
      checked: values,
      context,
      recordedAt,
    },
    warning: source === 'supabase' ? warning : warning ?? flow.fallbackMessage,
  };
};

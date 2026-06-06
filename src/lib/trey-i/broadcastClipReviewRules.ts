export type AdminClipReviewStatus = 'approved' | 'rejected' | 'hidden';

export type AdminClipReviewInput = {
  accessToken: string;
  clipId: string;
  reviewNotes?: string;
  status: AdminClipReviewStatus;
};

export type AdminClipReviewListInput = {
  accessToken: string;
};

export type ClipReviewResult = {
  success: boolean;
  error?: string;
};

export type AdminClipReviewClip = Record<string, any>;

type SupabaseAuthUser = {
  id: string;
};

type SupabaseError = {
  message?: string;
};

export type ClipReviewSupabaseClient = {
  auth: {
    getUser: (token: string) => Promise<{
      data?: { user?: SupabaseAuthUser | null } | null;
      error?: SupabaseError | null;
    }>;
  };
  rpc: (
    name: string,
    args: Record<string, unknown>,
  ) => Promise<{ data?: unknown; error?: SupabaseError | null }>;
  from: (table: string) => any;
};

export const ADMIN_CLIP_REVIEW_COLUMNS = [
  'id',
  'owner_user_id',
  'recording_id',
  'segment_id',
  'session_id',
  'room_id',
  'channel_id',
  'queue_id',
  'show_id',
  'episode_id',
  'title',
  'description',
  'clip_status',
  'visibility',
  'start_time_seconds',
  'end_time_seconds',
  'duration_seconds',
  'storage_path',
  'audio_url',
  'cover_art_url',
  'transcript_text',
  'caption',
  'mood_tags',
  'genre_tags',
  'audience_tags',
  'engagement_snapshot',
  'rights_snapshot',
  'review_notes',
  'published_at',
  'metadata',
  'created_at',
  'updated_at',
].join(', ');

const VALID_REVIEW_STATUSES = new Set<AdminClipReviewStatus>([
  'approved',
  'rejected',
  'hidden',
]);

export function validateAdminClipReviewInput(input: Partial<AdminClipReviewInput>): AdminClipReviewInput {
  const status = typeof input?.status === 'string' ? input.status : '';

  return {
    accessToken: typeof input?.accessToken === 'string' ? input.accessToken : '',
    clipId: typeof input?.clipId === 'string' ? input.clipId : '',
    reviewNotes: typeof input?.reviewNotes === 'string' ? input.reviewNotes : '',
    status: VALID_REVIEW_STATUSES.has(status as AdminClipReviewStatus)
      ? (status as AdminClipReviewStatus)
      : 'rejected',
  };
}

export function validateAdminClipReviewListInput(input: Partial<AdminClipReviewListInput>): AdminClipReviewListInput {
  return {
    accessToken: typeof input?.accessToken === 'string' ? input.accessToken : '',
  };
}

export async function verifyClipReviewAdmin(
  accessToken: string,
  supabase: ClipReviewSupabaseClient,
): Promise<{ userId: string }> {
  const token = accessToken.trim();
  if (!token) {
    throw new Error('Admin access required');
  }

  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  const userId = authData?.user?.id;
  if (authError || !userId) {
    throw new Error('Admin access required');
  }

  const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin', {
    _user_id: userId,
  });
  if (adminError || isAdmin !== true) {
    throw new Error('Admin access required');
  }

  return { userId };
}

export async function listPendingClipsForAdmin(
  input: AdminClipReviewListInput,
  supabase: ClipReviewSupabaseClient,
): Promise<{ data: AdminClipReviewClip[]; error?: string }> {
  await verifyClipReviewAdmin(input.accessToken, supabase);

  const { data, error } = await supabase
    .from('tradio_live_highlight_clips')
    .select(ADMIN_CLIP_REVIEW_COLUMNS)
    .eq('clip_status', 'pending_review')
    .order('created_at', { ascending: true })
    .limit(100);

  if (error) {
    return { data: [], error: error.message ?? 'Failed to load clips' };
  }

  return { data: Array.isArray(data) ? (data as AdminClipReviewClip[]) : [] };
}

export async function reviewPendingClipForAdmin(
  input: AdminClipReviewInput,
  supabase: ClipReviewSupabaseClient,
  now: () => string = () => new Date().toISOString(),
): Promise<ClipReviewResult> {
  await verifyClipReviewAdmin(input.accessToken, supabase);

  const clipId = input.clipId.trim();
  if (!clipId) {
    return { success: false, error: 'Clip not found' };
  }
  if (!VALID_REVIEW_STATUSES.has(input.status)) {
    return { success: false, error: 'Invalid review status' };
  }

  const reviewNotes = input.reviewNotes?.trim() || null;
  const { data: updatedClip, error } = await supabase
    .from('tradio_live_highlight_clips')
    .update({
      clip_status: input.status,
      review_notes: reviewNotes,
      updated_at: now(),
    })
    .eq('id', clipId)
    .eq('clip_status', 'pending_review')
    .select('id, clip_status, review_notes, updated_at')
    .maybeSingle();

  if (error) {
    return { success: false, error: error.message ?? 'Failed to review clip' };
  }
  if (!updatedClip) {
    return { success: false, error: 'Clip not found or no longer pending review' };
  }

  return { success: true };
}

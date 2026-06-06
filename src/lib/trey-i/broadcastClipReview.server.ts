import { createServerFn } from '@tanstack/react-start';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import {
  listPendingClipsForAdmin,
  reviewPendingClipForAdmin,
  validateAdminClipReviewInput,
  validateAdminClipReviewListInput,
  type ClipReviewSupabaseClient,
} from './broadcastClipReviewRules';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Clip review failed';
}

const clipReviewSupabase = supabaseAdmin as unknown as ClipReviewSupabaseClient;

export const loadPendingClipsForReviewServer = createServerFn({ method: 'POST' })
  .inputValidator(validateAdminClipReviewListInput)
  .handler(async ({ data }) => {
    try {
      return await listPendingClipsForAdmin(data, clipReviewSupabase);
    } catch (error) {
      return { data: [], error: getErrorMessage(error) };
    }
  });

export const reviewClipForAdminServer = createServerFn({ method: 'POST' })
  .inputValidator(validateAdminClipReviewInput)
  .handler(async ({ data }) => {
    try {
      return await reviewPendingClipForAdmin(data, clipReviewSupabase);
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  });

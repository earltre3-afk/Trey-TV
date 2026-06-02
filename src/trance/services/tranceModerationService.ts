import { supabase } from '@/lib/supabase';
import { ModerationStatus } from '../types';
import { assertConfigured, shouldUseFixtures } from './config';

export const tranceModerationService = {
  reportRoutine: async (
    routineId: string,
    userId: string,
    reason: string
  ): Promise<{ success: boolean; eventId?: string }> => {
    assertConfigured('ModerationService');
    if (shouldUseFixtures()) {
      console.log(`[Dev Mode] User ${userId} reported routine ${routineId} for: ${reason}`);
      return { success: true, eventId: 'evt-dev-report' };
    }

    const eventId = `mod-${Math.random().toString(36).substr(2, 9)}`;
    const { error } = await supabase
      .from('trance_moderation_events')
      .insert({
        id: eventId,
        target_type: 'routine',
        target_id: routineId,
        reporter_id: userId,
        reason,
        status: 'pending' as ModerationStatus,
      });

    if (error) {
      console.error('Failed to submit moderation report:', error);
      return { success: false };
    }
    return { success: true, eventId };
  },

  flagScoreAttempt: async (
    attemptId: string,
    reason: string
  ): Promise<void> => {
    assertConfigured('ModerationService');
    if (shouldUseFixtures()) {
      console.log(`[Dev Mode] Score attempt ${attemptId} flagged for review: ${reason}`);
      return;
    }

    const { error } = await supabase
      .from('trance_moderation_events')
      .insert({
        target_type: 'attempt',
        target_id: attemptId,
        reason,
        status: 'flagged' as ModerationStatus,
      });

    if (error) {
      console.warn('Failed to submit flag event:', error);
    }
  },

  getModerationStatus: async (
    targetType: 'routine' | 'attempt',
    targetId: string
  ): Promise<ModerationStatus> => {
    assertConfigured('ModerationService');
    if (shouldUseFixtures()) {
      return 'approved';
    }

    const { data, error } = await supabase
      .from('trance_moderation_events')
      .select('status')
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data ? (data.status as ModerationStatus) : 'approved';
  },
};

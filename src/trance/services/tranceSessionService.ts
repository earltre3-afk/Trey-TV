import { supabase } from '@/lib/supabase';
import { DanceSession, SessionAttempt, SessionMode, SessionAttemptStatus } from '../types';
import { assertConfigured, shouldUseFixtures } from './config';

export const tranceSessionService = {
  createSessionAttempt: async (routineId: string, userId: string, mode: SessionMode): Promise<SessionAttempt> => {
    assertConfigured('SessionService');
    const fallbackAttempt: SessionAttempt = {
      id: `att-${Math.random().toString(36).substr(2, 9)}`,
      routineId,
      userId,
      mode,
      status: 'draft',
      startedAt: new Date().toISOString(),
    };

    if (shouldUseFixtures()) {
      return fallbackAttempt;
    }

    const { data, error } = await supabase
      .from('trance_session_attempts')
      .insert({
        routine_id: routineId,
        user_id: userId,
        mode,
        status: 'draft',
      })
      .select('*')
      .maybeSingle();

    if (error) throw error;
    if (!data) return fallbackAttempt;

    return {
      id: data.id,
      routineId: data.routine_id,
      userId: data.user_id,
      mode: data.mode as SessionMode,
      status: data.status as SessionAttemptStatus,
      startedAt: data.created_at,
    };
  },

  updateAttemptStatus: async (attemptId: string, status: SessionAttemptStatus, videoUrl?: string): Promise<void> => {
    assertConfigured('SessionService');
    if (shouldUseFixtures()) {
      console.log(`[Dev Mode] Mock update attempt ${attemptId} status to ${status}`);
      return;
    }
    const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (videoUrl) patch.video_url = videoUrl;

    const { error } = await supabase
      .from('trance_session_attempts')
      .update(patch)
      .eq('id', attemptId);

    if (error) throw error;
  },

  getAttempt: async (attemptId: string): Promise<SessionAttempt | null> => {
    assertConfigured('SessionService');
    if (shouldUseFixtures()) {
      return {
        id: attemptId,
        routineId: 'rt001',
        userId: 'u001',
        mode: 'Learn',
        status: 'ready',
        startedAt: new Date().toISOString(),
      };
    }
    const { data, error } = await supabase
      .from('trance_session_attempts')
      .select('*')
      .eq('id', attemptId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      routineId: data.routine_id,
      userId: data.user_id,
      mode: data.mode as SessionMode,
      status: data.status as SessionAttemptStatus,
      startedAt: data.created_at,
      completedAt: data.completed_at,
      videoUrl: data.video_url,
      poseDataUrl: data.pose_data_url,
      scoreId: data.score_id,
    };
  }
};

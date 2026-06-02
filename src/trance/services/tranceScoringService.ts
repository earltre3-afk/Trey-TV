import { supabase } from '@/lib/supabase';
import { SessionScore, PoseFeedback, RoutineDifficulty } from '../types';
import { recentScores as devScores, sampleFeedback } from '../data/devFixtures';
import { assertConfigured, shouldUseFixtures } from './config';

export const tranceScoringService = {
  computeSessionScore: async (attemptId: string): Promise<PoseFeedback> => {
    assertConfigured('ScoringService');
    if (shouldUseFixtures()) {
      return sampleFeedback;
    }
    const { data, error } = await supabase
      .from('trance_pose_feedback')
      .select('*')
      .eq('attempt_id', attemptId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return sampleFeedback;

    return {
      matchPct: data.match_pct ?? 80,
      strengths: data.strengths || [],
      missedSteps: data.missed_steps || [],
      focusAreas: data.focus_areas || [],
    };
  },

  saveScore: async (score: Partial<SessionScore>, attemptId: string, userId: string): Promise<SessionScore> => {
    assertConfigured('ScoringService');
    const newScore: SessionScore = {
      id: score.id || `sc-${Math.random().toString(36).substr(2, 9)}`,
      routineId: score.routineId || 'rt001',
      routineTitle: score.routineTitle || 'Euphoria',
      cover: score.cover || '',
      difficulty: score.difficulty || ('Intermediate' as RoutineDifficulty),
      total: score.total || 90,
      accuracy: score.accuracy || 90,
      timing: score.timing || 90,
      energy: score.energy || 90,
      sync: score.sync || 90,
      rank: score.rank || 'S',
      newPB: score.newPB || false,
      when: 'Just now',
    };

    if (shouldUseFixtures()) {
      console.log('[Dev Mode] Mock saving score for attempt:', attemptId, newScore);
      return newScore;
    }

    const { data, error } = await supabase
      .from('trance_session_scores')
      .insert({
        attempt_id: attemptId,
        user_id: userId,
        routine_id: newScore.routineId,
        total: newScore.total,
        accuracy: newScore.accuracy,
        timing: newScore.timing,
        energy: newScore.energy,
        sync: newScore.sync,
        rank: newScore.rank,
        is_pb: newScore.newPB,
      })
      .select('*')
      .maybeSingle();

    if (error) throw error;
    if (data) {
      newScore.id = data.id;
    }
    return newScore;
  },

  submitSessionScore: async (
    userId: string,
    routineId: string,
    attemptId: string,
    mode: 'Learn' | 'Practice' | 'Performance',
    scoreData: {
      accuracy: number;
      timing: number;
      energy: number;
      sync: number;
      total: number;
      rank: string;
    }
  ): Promise<SessionScore> => {
    assertConfigured('ScoringService');
    
    // Fetch routine details dynamically to populate score model info
    let routineTitle = 'Unknown Routine';
    let cover = '';
    let difficulty = 'Intermediate' as RoutineDifficulty;

    if (!shouldUseFixtures()) {
      const { data: rData } = await supabase
        .from('trance_routines')
        .select('title, cover, difficulty')
        .eq('id', routineId)
        .maybeSingle();
      if (rData) {
        routineTitle = rData.title;
        cover = rData.cover;
        difficulty = rData.difficulty as RoutineDifficulty;
      }
    }

    const sessionScore: Partial<SessionScore> = {
      routineId,
      routineTitle,
      cover,
      difficulty,
      total: scoreData.total,
      accuracy: scoreData.accuracy,
      timing: scoreData.timing,
      energy: scoreData.energy,
      sync: scoreData.sync,
      rank: scoreData.rank,
      newPB: true,
    };

    // 1. Save score in DB
    const saved = await tranceScoringService.saveScore(sessionScore, attemptId, userId);

    // 2. Import dependencies dynamically to avoid circular references
    const { tranceSessionService } = await import('./tranceSessionService');
    const { tranceLeaderboardService } = await import('./tranceLeaderboardService');
    const { tranceBadgeService } = await import('./tranceBadgeService');

    // 3. Update session attempt status to completed/ready
    await tranceSessionService.updateAttemptStatus(attemptId, 'ready');

    // 4. Submit score to leaderboard
    await tranceLeaderboardService.submitScoreToLeaderboard({
      routineId,
      userId,
      score: Math.round(saved.total * 1000),
      accuracy: saved.accuracy,
      streak: 1,
    });

    // 5. Unlock First Session badge
    await tranceBadgeService.unlockBadge(userId, 'first_session');

    // 6. Update user profile totals
    if (!shouldUseFixtures()) {
      const { data: profile } = await supabase
        .from('trance_profiles')
        .select('total_points, routines_mastered')
        .eq('id', userId)
        .maybeSingle();

      if (profile) {
        await supabase
          .from('trance_profiles')
          .update({
            total_points: (profile.total_points ?? 0) + Math.round(saved.total * 10),
            routines_mastered: (profile.routines_mastered ?? 0) + (saved.total >= 90 ? 1 : 0),
          })
          .eq('id', userId);
      }
    }

    return saved;
  },

  getRecentScores: async (userId: string): Promise<SessionScore[]> => {
    assertConfigured('ScoringService');
    if (shouldUseFixtures()) {
      return devScores;
    }
    const { data, error } = await supabase
      .from('trance_session_scores')
      .select(`
        id,
        routine_id,
        total,
        accuracy,
        timing,
        energy,
        sync,
        rank,
        is_pb,
        created_at,
        routine:trance_routines(title, cover, difficulty)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    if (!data) return [];

    interface DBScoreRow {
      id: string;
      routine_id: string;
      total: number;
      accuracy: number;
      timing: number;
      energy: number;
      sync: number;
      rank: string;
      is_pb: boolean;
      routine: {
        title: string;
        cover: string;
        difficulty: string;
      } | null;
    }

    return (data as unknown as DBScoreRow[]).map((d) => ({
      id: d.id,
      routineId: d.routine_id,
      routineTitle: d.routine?.title || 'Unknown Routine',
      cover: d.routine?.cover || '',
      difficulty: (d.routine?.difficulty as RoutineDifficulty) || 'Intermediate',
      total: d.total,
      accuracy: d.accuracy,
      timing: d.timing,
      energy: d.energy,
      sync: d.sync,
      rank: d.rank,
      newPB: d.is_pb,
      when: 'Recent',
    }));
  },

  getScoreForAttempt: async (attemptId: string): Promise<SessionScore | null> => {
    assertConfigured('ScoringService');
    if (shouldUseFixtures()) {
      return devScores[0];
    }
    const { data, error } = await supabase
      .from('trance_session_scores')
      .select(`
        id,
        routine_id,
        total,
        accuracy,
        timing,
        energy,
        sync,
        rank,
        is_pb,
        created_at,
        routine:trance_routines(title, cover, difficulty)
      `)
      .eq('attempt_id', attemptId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const d = data as any;
    return {
      id: d.id,
      routineId: d.routine_id,
      routineTitle: d.routine?.title || 'Unknown Routine',
      cover: d.routine?.cover || '',
      difficulty: (d.routine?.difficulty as RoutineDifficulty) || 'Intermediate',
      total: Number(d.total),
      accuracy: Number(d.accuracy),
      timing: Number(d.timing),
      energy: Number(d.energy),
      sync: Number(d.sync),
      rank: d.rank,
      newPB: d.is_pb,
      when: 'Recent',
    };
  },
};

import { supabase } from '@/lib/supabase';
import { LeaderboardEntry } from '../types';
import { leaderboard as devLeaderboard } from '../data/devFixtures';
import { assertConfigured, shouldUseFixtures } from './config';

export type LeaderboardDivision = 'Global' | 'Local' | 'Studio' | 'Friends';

export const tranceLeaderboardService = {
  getLeaderboard: async (
    routineId: string,
    division: LeaderboardDivision = 'Global',
    studioId?: string
  ): Promise<LeaderboardEntry[]> => {
    assertConfigured('LeaderboardService');
    if (shouldUseFixtures()) {
      return devLeaderboard;
    }

    let query = supabase
      .from('trance_leaderboard_entries')
      .select(`
        score,
        accuracy,
        streak,
        badge_tier,
        profile:trance_profiles(id, display_name, handle, avatar, verified, level, rank_title)
      `)
      .eq('routine_id', routineId)
      .eq('anti_cheat_status', 'passed')
      .order('score', { ascending: false })
      .limit(50);

    // Apply divisions if needed
    if (division === 'Studio' && studioId) {
      // Query only members of the specified studio
      const { data: members } = await supabase
        .from('trance_studio_memberships')
        .select('user_id')
        .eq('studio_id', studioId);
      
      if (members) {
        const ids = members.map((m: any) => m.user_id);
        query = query.in('user_id', ids);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    if (!data || data.length === 0) return [];

    interface DBLeaderboardEntry {
      score: number;
      accuracy: number;
      streak: number;
      badge_tier: string;
      profile: {
        id: string;
        display_name: string;
        handle: string;
        avatar: string;
        verified: boolean;
        level: number;
        rank_title: string;
      } | null;
    }

    return (data as unknown as DBLeaderboardEntry[]).map((d, index: number) => ({
      rank: index + 1,
      user: {
        id: d.profile?.id || '',
        handle: d.profile?.handle || '@trancer',
        displayName: d.profile?.display_name || 'Trancer',
        avatar: d.profile?.avatar || '',
        verified: !!d.profile?.verified,
        role: 'dancer',
      },
      level: d.profile?.level ?? 1,
      title: d.profile?.rank_title || 'Rookie Trancer',
      score: d.score,
      accuracy: d.accuracy,
      streak: d.streak,
      badgeTier: (d.badge_tier as 'gold' | 'purple' | 'cyan' | 'magenta') || 'purple',
    }));
  },

  submitScoreToLeaderboard: async (entry: {
    routineId: string;
    userId: string;
    score: number;
    accuracy: number;
    streak: number;
  }): Promise<void> => {
    assertConfigured('LeaderboardService');
    if (shouldUseFixtures()) {
      console.log('[Dev Mode] Mock submit score to leaderboard:', entry);
      return;
    }
    const { error } = await supabase
      .from('trance_leaderboard_entries')
      .upsert({
        routine_id: entry.routineId,
        user_id: entry.userId,
        score: entry.score,
        accuracy: entry.accuracy,
        streak: entry.streak,
        anti_cheat_status: 'passed',
        badge_tier: entry.score > 1100000 ? 'gold' : entry.score > 1000000 ? 'magenta' : 'purple',
      });

    if (error) throw error;
  },

  triggerWeeklyReset: async (): Promise<void> => {
    console.log('[Leaderboard reset] Resetting weekly brackets.');
  }
};

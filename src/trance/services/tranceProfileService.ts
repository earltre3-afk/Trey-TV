import { supabase } from '@/lib/supabase';
import { DancerProfile, ChoreographerProfile } from '../types';
import { dancer as devDancer, choreographers as devChoreographers } from '../data/devFixtures';
import { rowToProfile } from '../auth/tranceAuthBridge';
import { assertConfigured, shouldUseFixtures } from './config';

export const tranceProfileService = {
  getDancerProfile: async (id: string): Promise<DancerProfile> => {
    assertConfigured('ProfileService');
    if (shouldUseFixtures()) {
      return devDancer.id === id ? devDancer : { ...devDancer, id, handle: `@user_${id.slice(0, 5)}` };
    }
    
    const { data, error } = await supabase
      .from('trance_profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      throw new Error(`Dancer profile not found for id: ${id}`);
    }
    return rowToProfile(data);
  },

  getTranceProfile: async (id: string): Promise<DancerProfile> => {
    return tranceProfileService.getDancerProfile(id);
  },

  getOrCreateTranceProfile: async (
    id: string,
    metadata?: { handle?: string; displayName?: string }
  ): Promise<DancerProfile> => {
    assertConfigured('ProfileService');
    if (shouldUseFixtures()) {
      return devDancer;
    }

    const { data: existing, error } = await supabase
      .from('trance_profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (existing) return rowToProfile(existing);

    const handle = metadata?.handle || '@trancer_' + id.slice(0, 5);
    const displayName = metadata?.displayName || 'Trancer ' + id.slice(0, 5);

    const insert = {
      id,
      handle,
      display_name: displayName,
      roles: ['dancer'],
      permissions: ['browse_public_routines', 'practice_routines', 'view_own_scores', 'join_studio_rooms']
    };

    const { data: created, error: insErr } = await supabase
      .from('trance_profiles')
      .insert(insert)
      .select('*')
      .maybeSingle();

    if (insErr) throw insErr;
    return created ? rowToProfile(created) : rowToProfile(insert);
  },

  getChoreographerProfile: async (id: string): Promise<ChoreographerProfile> => {
    assertConfigured('ProfileService');
    const fallback = devChoreographers.find((c) => c.id === id) || devChoreographers[0];
    if (shouldUseFixtures()) {
      return fallback;
    }

    const { data, error } = await supabase
      .from('trance_choreographer_profiles')
      .select(`
        *,
        profile:trance_profiles(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error(`Choreographer profile not found for id: ${id}`);

    return {
      id: data.id,
      handle: data.profile?.handle || '@choreo',
      displayName: data.profile?.display_name || 'Choreographer',
      avatar: data.profile?.avatar || '',
      verified: !!data.profile?.verified,
      role: 'choreographer',
      tagline: data.tagline || '',
      cover: data.cover || '',
      sessions: data.sessions_count ?? 0,
      students: data.students_count ?? 0,
      plays: data.plays_count ?? 0,
      quote: data.quote || '',
      badges: [],
    };
  },

  getFeaturedChoreographers: async (): Promise<ChoreographerProfile[]> => {
    assertConfigured('ProfileService');
    if (shouldUseFixtures()) {
      return devChoreographers;
    }

    const { data, error } = await supabase
      .from('trance_choreographer_profiles')
      .select(`
        *,
        profile:trance_profiles(*)
      `)
      .eq('moderation_status', 'approved');

    if (error) throw error;
    if (!data || data.length === 0) return [];

    interface DBChoreographer {
      id: string;
      tagline: string;
      cover: string | null;
      sessions_count: number;
      students_count: number;
      plays_count: number;
      quote: string | null;
      profile: {
        handle: string;
        display_name: string;
        avatar: string | null;
        verified: boolean;
      } | null;
    }

    return (data as unknown as DBChoreographer[]).map((d) => ({
      id: d.id,
      handle: d.profile?.handle || '@choreo',
      displayName: d.profile?.display_name || 'Choreographer',
      avatar: d.profile?.avatar || '',
      verified: !!d.profile?.verified,
      role: 'choreographer',
      tagline: d.tagline || '',
      cover: d.cover || '',
      sessions: d.sessions_count,
      students: d.students_count,
      plays: d.plays_count,
      quote: d.quote || '',
      badges: [],
    }));
  },

  updateBio: async (id: string, bio: string): Promise<void> => {
    assertConfigured('ProfileService');
    if (shouldUseFixtures()) {
      console.log(`[Dev Mode] Mock update bio for user ${id}:`, bio);
      return;
    }
    const { error } = await supabase
      .from('trance_profiles')
      .update({ bio })
      .eq('id', id);

    if (error) throw error;
  },

  followCreator: async (userId: string, creatorId: string): Promise<void> => {
    assertConfigured('ProfileService');
    if (shouldUseFixtures()) {
      console.log(`[Dev Mode] User ${userId} followed creator ${creatorId}`);
      return;
    }
    const { error } = await supabase
      .from('trance_follows')
      .insert({ follower_id: userId, choreographer_id: creatorId });

    if (error) throw error;
  },

  unfollowCreator: async (userId: string, creatorId: string): Promise<void> => {
    assertConfigured('ProfileService');
    if (shouldUseFixtures()) {
      console.log(`[Dev Mode] User ${userId} unfollowed creator ${creatorId}`);
      return;
    }
    const { error } = await supabase
      .from('trance_follows')
      .delete()
      .eq('follower_id', userId)
      .eq('choreographer_id', creatorId);

    if (error) throw error;
  }
};

// TRANCE — Service Consolidated Index Gate
// Re-exports all concrete production service wrappers.

export { tranceAuthBridge } from '../auth/tranceAuthBridge';
export { tranceSupabaseService } from './tranceSupabaseService';
export { tranceProfileService } from './tranceProfileService';
export { tranceStudioService } from './tranceStudioService';
export { tranceRoutineService } from './tranceRoutineService';
export { tranceSessionService } from './tranceSessionService';
export { trancePoseTrackingService } from './trancePoseTrackingService';
export { tranceVideoUploadService } from './tranceVideoUploadService';
export { tranceScoringService } from './tranceScoringService';
export { tranceLeaderboardService } from './tranceLeaderboardService';
export { tranceBadgeService } from './tranceBadgeService';
export { tranceModerationService } from './tranceModerationService';
export { tranceAnalyticsService } from './tranceAnalyticsService';
export { shouldUseFixtures, isSupabaseConfigured } from './config';


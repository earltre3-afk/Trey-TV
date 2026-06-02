// TRANCE — Trey TV Dance Universe
// Core TypeScript interfaces. These typed shapes are the contract that
// backend wiring (Supabase, AI pose tracking, scoring) should fulfill.

export * from './identity';

export type RoutineDifficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Elite';
export type Difficulty = RoutineDifficulty; // alias for compatibility

export type DanceStyle =
  | 'Hip-Hop'
  | 'Contemporary'
  | 'Afrobeats'
  | 'Dancehall'
  | 'Popping'
  | 'Heels'
  | 'Freestyle'
  | 'K-Pop';

export type EnergyLevel = 'Chill' | 'Medium' | 'High' | 'Explosive';
export type SessionMode = 'Learn' | 'Practice' | 'Performance';

export type RoutineVisibility = 'Public' | 'Private' | 'Studio-only' | 'Link-only';
export type Visibility = RoutineVisibility; // alias for compatibility

export type SessionAttemptStatus =
  | 'draft'
  | 'uploading'
  | 'uploaded'
  | 'processing'
  | 'needs_review'
  | 'ready'
  | 'published'
  | 'failed'
  | 'archived';

export type ModerationStatus = 'pending' | 'approved' | 'flagged' | 'rejected';

export interface TranceUser {
  id: string;
  handle: string;
  displayName: string;
  avatar: string;
  verified: boolean;
  role: 'dancer' | 'choreographer' | 'studio';
}

export interface DancerProfile extends TranceUser {
  level: number;
  xp: number;
  xpToNext: number;
  rankTitle: string;
  dayStreak: number;
  totalPoints: number;
  routinesMastered: number;
  globalRank: number;
  tranceEnergy: number; // 0-1000
  bio: string;
  cover: string;
  memberNumber?: number; // #001 pioneer
}

export interface ChoreographerProfile extends TranceUser {
  tagline: string;
  cover: string;
  sessions: number;
  students: number;
  plays: number;
  badges: Badge[];
  quote?: string;
}

export interface StudioProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  cover: string;
  bio: string;
  verified: boolean;
  ownerId: string;
  memberCount: number;
  roomCount: number;
  createdAt: string;
}

export interface StudioRoom {
  id: string;
  name: string;
  cover: string;
  locked: boolean;
  members: number;
  capacity: number;
  status: 'LIVE' | 'LOCKED' | 'OPEN';
  tagline: string;
}

export interface StudioMembership {
  id: string;
  studioId: string;
  userId: string;
  role: 'studio_owner' | 'studio_admin' | 'studio_member';
  joinedAt: string;
}

export interface MoveHint {
  id: string;
  timestamp: string; // mm:ss
  label: string;
  description: string;
}

export interface DirectionCue {
  id: string;
  timestamp: string;
  direction: 'up' | 'down' | 'left' | 'right' | 'up-right' | 'up-left';
  facing: string;
}

export interface CountSection {
  id: string;
  index: number;
  label: string;
  counts: string; // e.g. "1-8"
}

export interface ScoringRuleSet {
  timing: number;
  execution: number;
  energy: number;
  precision: number;
  creativity: number;
  scale: string; // "0 - 100 Points"
}

export interface DanceRoutine {
  id: string;
  title: string;
  tagline: string;
  cover: string;
  choreographerId: string;
  choreographerName: string;
  choreographerVerified: boolean;
  style: DanceStyle;
  difficulty: RoutineDifficulty;
  energy: EnergyLevel;
  durationSec: number;
  bpm: number;
  formation: string; // "Solo" | "Crew"
  plays: number;
  saves: number;
  students: number;
  tags: string[];
  trendingRank?: number;
  visibility: RoutineVisibility;
  countSections: CountSection[];
  moveHints: MoveHint[];
  directionCues: DirectionCue[];
  scoring: ScoringRuleSet;
}

export interface DanceSession {
  id: string;
  routineId: string;
  mode: SessionMode;
  startedAt: string;
  progress: number; // 0-1
}

export interface SessionAttempt {
  id: string;
  routineId: string;
  userId: string;
  mode: SessionMode;
  status: SessionAttemptStatus;
  startedAt: string;
  completedAt?: string;
  videoUrl?: string;
  poseDataUrl?: string;
  scoreId?: string;
}

export interface SessionScore {
  id: string;
  routineId: string;
  routineTitle: string;
  cover: string;
  difficulty: RoutineDifficulty;
  total: number;
  accuracy: number;
  timing: number;
  energy: number;
  sync: number;
  rank: string; // SSS, S, A...
  newPB: boolean;
  when: string;
}

export interface PoseFeedback {
  matchPct: number;
  strengths: string[];
  missedSteps: { time: string; move: string }[];
  focusAreas: string[];
}

export interface PoseLandmarkFrame {
  timestampMs: number;
  landmarks: { x: number; y: number; z: number; visibility?: number }[];
}

export interface PoseComparisonResult {
  frameIndex: number;
  timestampMs: number;
  overallScore: number;
  jointAngles: Record<string, number>;
  timingDeltaMs: number;
  confidence: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  tier: 'gold' | 'purple' | 'cyan' | 'magenta' | 'locked';
  icon: string; // lucide icon name
  earned: boolean;
}

export interface BadgeAward {
  id: string;
  userId: string;
  badgeId: string;
  awardedAt: string;
  txHash?: string; // Trey TV rewards transaction reference
}

export interface LeaderboardEntry {
  rank: number;
  user: TranceUser;
  level: number;
  title: string;
  score: number;
  accuracy: number;
  streak: number;
  badgeTier: 'gold' | 'purple' | 'cyan' | 'magenta';
}

export interface RehearsalAssignment {
  id: string;
  date: string; // "MAY 24"
  title: string;
  focus: string;
  due: string; // "DUE TOMORROW"
}

export interface TeacherComment {
  id: string;
  studioId: string;
  roomId: string;
  choreographerId: string;
  comment: string;
  audioUrl?: string;
  createdAt: string;
}

export interface UploadAsset {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  ownerId: string;
  createdAt: string;
}

export interface ProcessingJob {
  id: string;
  assetId: string;
  status: SessionAttemptStatus;
  progressPct: number;
  errorMsg?: string;
  createdAt: string;
  updatedAt: string;
}

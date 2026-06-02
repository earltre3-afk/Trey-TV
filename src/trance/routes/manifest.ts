// TRANCE — Route manifest. Single source of truth for navigation paths.
// Drop these into the host Trey TV router.

export const TRANCE_ROUTES = {
  home: '/trance',
  explore: '/trance/explore',
  choreographer: (id = ':id') => `/trance/choreographers/${id}`,
  studio: (studioId = ':studioId') => `/trance/studios/${studioId}`,
  studioRoom: (studioId = ':studioId', roomId = ':roomId') => `/trance/studios/${studioId}/rooms/${roomId}`,
  routine: (routineId = ':routineId') => `/trance/routines/${routineId}`,
  learn: (routineId = ':routineId') => `/trance/session/${routineId}/learn`,
  practice: (routineId = ':routineId') => `/trance/session/${routineId}/practice`,
  performance: (routineId = ':routineId') => `/trance/session/${routineId}/performance`,
  results: (routineId = ':routineId', attemptId = ':sessionAttemptId') => `/trance/session/${routineId}/results/${attemptId}`,
  leaderboard: (routineId = ':routineId') => `/trance/leaderboard/${routineId}`,
  builder: '/trance/builder/new',
  builderEdit: (routineId = ':routineId') => `/trance/builder/${routineId}/edit`,
  profile: (profileId = ':profileId') => `/trance/profile/${profileId}`,
  badges: '/trance/badges',
  rewards: '/trance/rewards',
  admin: '/trance/admin',
} as const;

export const ROUTE_PATTERNS = [
  '/trance',
  '/trance/explore',
  '/trance/choreographers/:id',
  '/trance/studios/:studioId',
  '/trance/studios/:studioId/rooms/:roomId',
  '/trance/routines/:routineId',
  '/trance/session/:routineId/learn',
  '/trance/session/:routineId/practice',
  '/trance/session/:routineId/performance',
  '/trance/session/:routineId/results/:sessionAttemptId',
  '/trance/leaderboard/:routineId',
  '/trance/builder/new',
  '/trance/builder/:routineId/edit',
  '/trance/profile/:profileId',
  '/trance/badges',
  '/trance/rewards',
  '/trance/admin',
];

export type SongWarRole = "fan" | "artist" | "dj" | "moderator" | "admin";

export interface SongWarArtist {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  followers: number;
  station: string;
  stationId: string;
}

export interface SongWarTrack {
  id: string;
  title: string;
  artist: string;
  art: string;
  coverUrl?: string;
  src: string;
}

export interface SongWarRound {
  roundNumber: number;
  trackA: SongWarTrack;
  trackB: SongWarTrack;
  votesA: number;
  votesB: number;
  winner: "A" | "B" | null;
  duration: number; // in seconds
  status: "pending" | "playing" | "voting" | "completed";
}

export interface SongWarBattle {
  id: string;
  title: string;
  type:
    | "Artist vs Artist"
    | "Producer Beat Battle"
    | "DJ Mix Battle"
    | "City vs City"
    | "New Release Battle"
    | "Fan Pick Battle";
  artistA: SongWarArtist;
  artistB: SongWarArtist;
  roundsCount: number;
  rounds: SongWarRound[];
  currentRoundIndex: number;
  duration: number; // round duration in seconds
  votingDuration: number; // voting duration in seconds
  hostId: string;
  hostName: string;
  scheduleDate: string;
  visibility: "Public" | "Private" | "Invite Only";
  moderationMode: "Auto" | "Host Controlled" | "Admin Only";
  settings: {
    allowFanChat: boolean;
    allowGIFs: boolean;
    allowEmojiReactions: boolean;
    allowAnimatedReactions: boolean;
    allowFanSongRequests: boolean;
  };
  prize: string;
  status: "live" | "upcoming" | "replay";
  listenersCount: number;
  scoreA: number;
  scoreB: number;
  winnerId: string | null; // ID of winning artist
  category: string;
  official?: boolean;
}

export interface SongWarChatMessage {
  id: string;
  author: string;
  avatar: string;
  message: string;
  timestamp: string;
  role: SongWarRole;
  badge?: string | null;
  isArtist?: boolean;
  isVerified?: boolean;
  reactions?: { emoji: string; count: number }[];
}

export interface SongWarVote {
  battleId: string;
  roundNumber: number;
  userId: string;
  votedFor: "A" | "B";
  timestamp: string;
}

export interface SongWarReaction {
  id: string;
  emoji: string;
  type: "fire" | "crown" | "lightning" | "heart" | "speaker" | "roar";
  x?: number; // relative horizontal % for floating effect
  y?: number; // relative vertical % for floating effect
}

export interface SongWarSession {
  battleId: string;
  role: SongWarRole;
  isVoteLocked: boolean;
  myVote: "A" | "B" | null;
  currentStatus: "entrance" | "battle" | "voting" | "winnerReveal" | "completed";
  animationState: SongWarAnimationState;
  chatLocked: boolean;
  slowMode: boolean;
}

export interface SongWarReplay {
  id: string;
  battleId: string;
  title: string;
  artwork: string;
  artistAName: string;
  artistBName: string;
  winnerName: string;
  scoreA: number;
  scoreB: number;
  totalVotes: number;
  peakListeners: number;
  playedAt: string;
  rounds: SongWarRound[];
}

export interface SongWarPrize {
  id: string;
  title: string;
  badgeIcon: string;
  description: string;
}

export type SongWarAnimationState =
  | "none"
  | "entrance"
  | "vsemblem-pulse"
  | "waveform-clash"
  | "winner-reveal"
  | "reaction-burst";

export interface SongWarModerationState {
  chatLocked: boolean;
  slowMode: boolean;
  reactionsDisabled: boolean;
  gifsCleared: boolean;
}

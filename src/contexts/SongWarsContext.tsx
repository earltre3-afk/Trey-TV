import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import {
  SONG_WARS,
  SEED_COMMENTS,
  APPROVED_HANDLES,
  DEFAULT_ARENA,
  type SongWar,
  type BattleStatus,
  type BattleType,
  type BattleComment,
  type ReactionKey,
  type ContestantSeed,
  type Contestant,
  type ArenaState,
  type BattleResult,
  type BattleSide,
  type LiveStatus,
} from '../data/mockData';

type Side = BattleSide;

interface VoteRecord {
  side: Side;
  left: number;
  right: number;
}

export interface NewBattleInput {
  title: string;
  type: BattleType;
  left: ContestantSeed;
  right: ContestantSeed;
  schedule: string;
  vibe?: string;
}

export interface FollowedArtist {
  contestant: Contestant;
  battles: SongWar[];
}

interface SongWarsState {
  wars: SongWar[];
  votedSide: (warId: string) => Side | undefined;
  voteCount: (warId: string, side: Side) => number;
  vote: (warId: string, side: Side) => void;
  leader: (war: SongWar) => Side | 'tie';
  totalVotes: (war: SongWar) => number;
  // comments + reactions
  commentsFor: (warId: string) => BattleComment[];
  reportedComments: BattleComment[];
  addComment: (warId: string, text: string) => void;
  reactToComment: (commentId: string, reaction: ReactionKey) => void;
  reportComment: (commentId: string) => void;
  hideComment: (commentId: string) => void;
  unhideComment: (commentId: string) => void;
  // admin actions
  setStatus: (warId: string, status: BattleStatus) => void;
  clearReports: (warId: string) => void;
  closeBattle: (warId: string) => void;
  createBattle: (input: NewBattleInput) => void;
  addWar: (war: Omit<SongWar, 'id'> & { id?: string }) => void;
  // prescribe-me matching
  matchVibeBattle: (vibe: string) => SongWar | undefined;
  // follow system
  isFollowing: (handle: string) => boolean;
  toggleFollow: (c: Contestant) => void;
  followedArtists: FollowedArtist[];
  followingCount: number;
  // results recap
  resultFor: (warId: string) => BattleResult | undefined;
  results: BattleResult[];
  // live arena
  arenaFor: (warId: string) => ArenaState;
  checkIn: (warId: string, side: Side) => void;
  setCountdownSel: (warId: string, secs: number) => void;
  startBattle: (warId: string) => void;
  startPerformance: (warId: string, side: Side) => void;
  openVoting: (warId: string) => void;
  arenaVote: (warId: string, side: Side) => void;
  closeVoting: (warId: string) => void;
  revealWinner: (warId: string) => void;
  nextRound: (warId: string) => void;
  pauseBattle: (warId: string) => void;
  resumeBattle: (warId: string) => void;
  muteArtist: (warId: string, side: Side) => void;
  flagTechnicalIssue: (warId: string) => void;
  pushAnnouncement: (warId: string, message?: string) => void;
  endBattle: (warId: string) => void;
  addArenaReaction: (warId: string, key: string, label: string) => void;
  resetArena: (warId: string) => void;
  totals: {
    active: number;
    scheduled: number;
    draft: number;
    completed: number;
    reported: number;
    allVotes: number;
    reportedComments: number;
  };
}

const SongWarsContext = createContext<SongWarsState | undefined>(undefined);

const FOLLOW_KEY = 'tradio.songwars.following';
const STATE_KEY = 'tradio.platform.songwars';

interface PersistedSongWarsState {
  wars: SongWar[];
  votes: Record<string, VoteRecord>;
  comments: BattleComment[];
  followed: string[];
  results: BattleResult[];
  arenas: Record<string, ArenaState>;
}

function loadPersistedState(): PersistedSongWarsState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STATE_KEY);
    return raw ? (JSON.parse(raw) as PersistedSongWarsState) : null;
  } catch {
    return null;
  }
}

const seedToContestant = (id: string, s: ContestantSeed): Contestant => ({
  id,
  name: s.name,
  handle: s.handle,
  role: s.role,
  image: s.image,
  track: s.track,
  src: s.src,
  votes: 0,
  wins: 0,
  losses: 0,
  approved: APPROVED_HANDLES.has(s.handle),
});

function loadFollowed(): string[] {
  try {
    const raw = localStorage.getItem(FOLLOW_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function SongWarsProvider({ children }: { children: React.ReactNode }) {
  const persisted = useRef(loadPersistedState()).current;
  const [wars, setWars] = useState<SongWar[]>(
    () => persisted?.wars ?? SONG_WARS.map((w) => ({ ...w })),
  );
  const [votes, setVotes] = useState<Record<string, VoteRecord>>(() => persisted?.votes ?? {});
  const [comments, setComments] = useState<BattleComment[]>(
    () =>
      persisted?.comments ??
      SEED_COMMENTS.map((c) => ({ ...c, reactions: { ...c.reactions } })),
  );
  const [followed, setFollowed] = useState<string[]>(
    () => persisted?.followed ?? loadFollowed(),
  );
  const [results, setResults] = useState<BattleResult[]>(() => persisted?.results ?? []);
  const [arenas, setArenas] = useState<Record<string, ArenaState>>(
    () => persisted?.arenas ?? {},
  );

  // persist followed artists
  useEffect(() => {
    try {
      localStorage.setItem(FOLLOW_KEY, JSON.stringify(followed));
    } catch {
      /* ignore */
    }
  }, [followed]);

  useEffect(() => {
    try {
      const state: PersistedSongWarsState = {
        wars,
        votes,
        comments,
        followed,
        results,
        arenas,
      };
      window.localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch {
      /* persistence is best-effort until the backend adapter is enabled */
    }
  }, [arenas, comments, followed, results, votes, wars]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STATE_KEY) return;
      const next = loadPersistedState();
      if (!next) return;
      setWars(next.wars);
      setVotes(next.votes);
      setComments(next.comments);
      setFollowed(next.followed);
      setResults(next.results);
      setArenas(next.arenas);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const voteCount = useCallback(
    (warId: string, side: Side): number => {
      const war = wars.find((w) => w.id === warId);
      if (!war) return 0;
      const base = side === 'left' ? war.left.votes : war.right.votes;
      const rec = votes[warId];
      const bonus = rec ? rec[side] : 0;
      return base + bonus;
    },
    [wars, votes],
  );

  const votedSide = (warId: string) => votes[warId]?.side;

  const vote = (warId: string, side: Side) => {
    setVotes((prev) => {
      const existing = prev[warId];
      if (existing?.side === side) return prev;
      const left = side === 'left' ? 1 : 0;
      const right = side === 'right' ? 1 : 0;
      return { ...prev, [warId]: { side, left, right } };
    });
  };

  const totalVotes = (war: SongWar) => voteCount(war.id, 'left') + voteCount(war.id, 'right');

  const leader = (war: SongWar): Side | 'tie' => {
    const l = voteCount(war.id, 'left');
    const r = voteCount(war.id, 'right');
    if (l === r) return 'tie';
    return l > r ? 'left' : 'right';
  };

  // ---- comments ----
  const commentsFor = useCallback(
    (warId: string) => comments.filter((c) => c.warId === warId && !c.hidden),
    [comments],
  );

  const reportedComments = useMemo(
    () => comments.filter((c) => c.reported && !c.hidden),
    [comments],
  );

  const addComment = (warId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const newComment: BattleComment = {
      id: `cm-${Date.now()}`,
      warId,
      user: 'You',
      avatar:
        'https://d64gsuwffb70l.cloudfront.net/6a2dc5b5ed1f99f26cee7943_1781384835247_1644ac83.jpg',
      text: trimmed,
      time: 'now',
      reactions: { fire: 0, gold: 0, wave: 0 },
      reported: false,
      hidden: false,
    };
    setComments((prev) => [newComment, ...prev]);
  };

  const reactToComment = (commentId: string, reaction: ReactionKey) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id !== commentId) return c;
        const reactions = { ...c.reactions };
        if (c.myReaction === reaction) {
          reactions[reaction] = Math.max(0, reactions[reaction] - 1);
          return { ...c, reactions, myReaction: undefined };
        }
        if (c.myReaction) reactions[c.myReaction] = Math.max(0, reactions[c.myReaction] - 1);
        reactions[reaction] += 1;
        return { ...c, reactions, myReaction: reaction };
      }),
    );
  };

  const reportComment = (commentId: string) =>
    setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, reported: true } : c)));

  const hideComment = (commentId: string) =>
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, hidden: true, reported: false } : c)),
    );

  const unhideComment = (commentId: string) =>
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, hidden: false, reported: false } : c)),
    );

  // ---- admin ----
  const setStatus = (warId: string, status: BattleStatus) =>
    setWars((prev) => prev.map((w) => (w.id === warId ? { ...w, status } : w)));

  const clearReports = (warId: string) =>
    setWars((prev) =>
      prev.map((w) => (w.id === warId ? { ...w, reports: 0, status: 'active' as BattleStatus } : w)),
    );

  // Generate a typed result recap, then mark battle completed.
  const closeBattle = useCallback(
    (warId: string) => {
      const war = wars.find((w) => w.id === warId);
      if (!war) return;
      const l = voteCount(warId, 'left');
      const r = voteCount(warId, 'right');
      const total = l + r;
      const leftPct = total ? Math.round((l / total) * 100) : 50;
      const rightPct = 100 - leftPct;
      const winnerIsLeft = l >= r;
      const winner = winnerIsLeft ? war.left : war.right;
      const loser = winnerIsLeft ? war.right : war.left;
      const top = comments
        .filter((c) => c.warId === warId && !c.hidden)
        .map((c) => ({ c, score: c.reactions.fire + c.reactions.gold + c.reactions.wave }))
        .sort((a, b) => b.score - a.score)[0]?.c;

      const recap: BattleResult = {
        warId,
        title: war.title,
        winnerName: winner.name,
        winnerImage: winner.image,
        loserName: loser.name,
        leftName: war.left.name,
        rightName: war.right.name,
        leftPct,
        rightPct,
        totalVotes: total,
        topComment: top
          ? { user: top.user, text: top.text, avatar: top.avatar }
          : undefined,
      };
      setResults((prev) => [recap, ...prev.filter((x) => x.warId !== warId)]);
      setWars((prev) =>
        prev.map((w) =>
          w.id === warId
            ? { ...w, status: 'completed', schedule: `Ended • ${winner.name} won` }
            : w,
        ),
      );
    },
    [wars, comments, voteCount],
  );

  const resultFor = useCallback(
    (warId: string) => results.find((r) => r.warId === warId),
    [results],
  );

  const createBattle = (input: NewBattleInput) => {
    const id = `sw-${Date.now()}`;
    const war: SongWar = {
      id,
      title: input.title,
      type: input.type,
      status: 'draft',
      hype: 'Unpublished draft',
      schedule: input.schedule || 'Draft • not scheduled',
      vibe: input.vibe,
      left: seedToContestant(`${id}a`, input.left),
      right: seedToContestant(`${id}b`, input.right),
    };
    setWars((prev) => [war, ...prev]);
  };

  const addWar = useCallback((war: Omit<SongWar, 'id'> & { id?: string }) => {
    const nextWar: SongWar = {
      ...war,
      id: war.id ?? `sw-${Date.now()}`,
    };
    setWars((prev) => [nextWar, ...prev.filter((item) => item.id !== nextWar.id)]);
  }, []);

  // ---- prescribe me matching ----
  const matchVibeBattle = useCallback(
    (vibe: string): SongWar | undefined => {
      const v = vibe.trim().toLowerCase();
      if (!v) return undefined;
      const pmBattles = wars.filter(
        (w) => w.type === 'Prescribe Me Battle' && (w.vibe ?? '').toLowerCase() === v,
      );
      return (
        pmBattles.find((w) => w.status === 'active') ??
        pmBattles.find((w) => w.status === 'scheduled') ??
        pmBattles[0]
      );
    },
    [wars],
  );

  // ---- follow system ----
  const isFollowing = useCallback((handle: string) => followed.includes(handle), [followed]);

  const toggleFollow = useCallback((c: Contestant) => {
    setFollowed((prev) =>
      prev.includes(c.handle) ? prev.filter((h) => h !== c.handle) : [...prev, c.handle],
    );
  }, []);

  const followedArtists = useMemo<FollowedArtist[]>(() => {
    const out: FollowedArtist[] = [];
    for (const handle of followed) {
      let contestant: Contestant | undefined;
      const battles: SongWar[] = [];
      for (const w of wars) {
        if (w.left.handle === handle) {
          contestant = contestant ?? w.left;
          if (w.status === 'active' || w.status === 'scheduled') battles.push(w);
        }
        if (w.right.handle === handle) {
          contestant = contestant ?? w.right;
          if (w.status === 'active' || w.status === 'scheduled') battles.push(w);
        }
      }
      if (contestant) out.push({ contestant, battles });
    }
    return out;
  }, [followed, wars]);

  // ---- live arena ----
  const buildArena = (patch: Partial<ArenaState> = {}): ArenaState => {
    const base = { ...DEFAULT_ARENA, roundVotes: { ...DEFAULT_ARENA.roundVotes }, userVoteByRound: { ...DEFAULT_ARENA.userVoteByRound }, roundResults: [...DEFAULT_ARENA.roundResults], reactions: [...DEFAULT_ARENA.reactions] };
    const next = { ...base, ...patch };
    next.status = next.checkLeft && next.checkRight && next.status === 'waiting_for_checkins'
      ? 'ready_to_start'
      : next.status;
    return next;
  };

  const arenaFor = useCallback(
    (warId: string): ArenaState => arenas[warId] ?? buildArena(),
    [arenas],
  );

  const patchArena = (warId: string, patch: Partial<ArenaState>) =>
    setArenas((prev) => {
      const cur = prev[warId] ?? buildArena();
      const next: ArenaState = {
        ...cur,
        ...patch,
        roundVotes: patch.roundVotes ?? cur.roundVotes,
        userVoteByRound: patch.userVoteByRound ?? cur.userVoteByRound,
        roundResults: patch.roundResults ?? cur.roundResults,
        reactions: patch.reactions ?? cur.reactions,
      };
      if (next.status === 'waiting_for_checkins' && next.checkLeft && next.checkRight) {
        next.status = 'ready_to_start';
      }
      return { ...prev, [warId]: next };
    });

  const checkIn = (warId: string, side: Side) => {
    setArenas((prev) => {
      const cur = prev[warId] ?? buildArena();
      if (!['waiting_for_checkins', 'ready_to_start'].includes(cur.status)) return prev;
      const next: ArenaState = {
        ...cur,
        checkLeft: side === 'left' ? true : cur.checkLeft,
        checkRight: side === 'right' ? true : cur.checkRight,
      };
      next.status = next.checkLeft && next.checkRight ? 'ready_to_start' : 'waiting_for_checkins';
      return { ...prev, [warId]: next };
    });
  };

  const setCountdownSel = (warId: string, secs: number) =>
    patchArena(warId, { countdownSel: secs, countdown: secs });

  const startBattle = (warId: string) => {
    setArenas((prev) => {
      const cur = prev[warId] ?? buildArena();
      if (!cur.checkLeft || !cur.checkRight) return prev;
      return {
        ...prev,
        [warId]: {
          ...cur,
          status: 'live_starting',
          countdown: cur.countdownSel,
          currentPerformer: 'left',
          artistAPerformed: false,
          artistBPerformed: false,
          votingOpen: false,
          isPaused: false,
          announcement: 'Song Wars is going live.',
        },
      };
    });
  };

  const startPerformance = (warId: string, side: Side) => {
    patchArena(warId, {
      status: side === 'left' ? 'artist_a_performing' : 'artist_b_performing',
      currentPerformer: side,
      artistAPerformed: side === 'left' ? false : arenaFor(warId).artistAPerformed,
      artistBPerformed: side === 'right' ? false : arenaFor(warId).artistBPerformed,
      votingOpen: false,
      announcement: `${side === 'left' ? 'Artist A' : 'Artist B'} is on stage.`,
    });
  };

  const openVoting = (warId: string) => {
    const cur = arenaFor(warId);
    patchArena(warId, {
      status: 'voting_open',
      votingOpen: true,
      voteSeconds: 20,
      artistAPerformed: true,
      artistBPerformed: true,
      announcement: 'Voting is open. Lock in your winner.',
      roundVotes: cur.roundVotes.left + cur.roundVotes.right > 0 ? cur.roundVotes : { left: 0, right: 0 },
    });
  };

  const arenaVote = (warId: string, side: Side) => {
    setArenas((prev) => {
      const cur = prev[warId] ?? buildArena();
      if (cur.status !== 'voting_open' || cur.userVoteByRound[cur.roundNumber]) return prev;
      const next: ArenaState = {
        ...cur,
        roundVotes: {
          ...cur.roundVotes,
          [side]: cur.roundVotes[side] + 1,
        },
        userVoteByRound: {
          ...cur.userVoteByRound,
          [cur.roundNumber]: side,
        },
      };
      return { ...prev, [warId]: next };
    });
    vote(warId, side);
  };

  const closeVoting = (warId: string) =>
    patchArena(warId, { status: 'voting_closed', votingOpen: false, voteSeconds: 0, announcement: 'Voting is closed. Results reveal soon.' });

  const revealWinner = (warId: string) => {
    setArenas((prev) => {
      const cur = prev[warId] ?? buildArena();
      const leftVotes = cur.roundVotes.left;
      const rightVotes = cur.roundVotes.right;
      const total = leftVotes + rightVotes || 1;
      const leftPct = Math.round((leftVotes / total) * 100);
      const rightPct = 100 - leftPct;
      const winner: Side | 'tie' = leftVotes === rightVotes ? 'tie' : leftVotes > rightVotes ? 'left' : 'right';
      const nextResult = { round: cur.roundNumber, winner, leftVotes, rightVotes, leftPct, rightPct };
      const filtered = cur.roundResults.filter((r) => r.round !== cur.roundNumber);
      return {
        ...prev,
        [warId]: {
          ...cur,
          status: 'winner_reveal',
          votingOpen: false,
          winner,
          roundResults: [...filtered, nextResult].sort((a, b) => a.round - b.round),
          announcement: winner === 'tie' ? 'Round ended in a tie.' : 'Round winner revealed.',
        },
      };
    });
  };

  const nextRound = (warId: string) =>
    setArenas((prev) => {
      const cur = prev[warId] ?? buildArena();
      const nextRoundNumber = Math.min(cur.totalRounds, cur.roundNumber + 1);
      const baseLeft = Math.max(120, 620 + nextRoundNumber * 51);
      const baseRight = Math.max(120, 598 + nextRoundNumber * 44);
      return {
        ...prev,
        [warId]: {
          ...cur,
          status: 'round_break',
          roundNumber: nextRoundNumber,
          currentPerformer: 'left',
          artistAPerformed: false,
          artistBPerformed: false,
          votingOpen: false,
          voteSeconds: 20,
          roundVotes: { left: baseLeft, right: baseRight },
          winner: undefined,
          announcement: `Round ${nextRoundNumber} is ready.`,
        },
      };
    });

  const pauseBattle = (warId: string) => patchArena(warId, { status: 'paused', isPaused: true, announcement: 'Battle paused by admin.' });

  const resumeBattle = (warId: string) => {
    const cur = arenaFor(warId);
    patchArena(warId, { status: cur.currentPerformer === 'right' ? 'artist_b_performing' : 'artist_a_performing', isPaused: false, announcement: 'Battle resumed.' });
  };

  const muteArtist = (warId: string, side: Side) => {
    const cur = arenaFor(warId);
    patchArena(warId, side === 'left'
      ? { mutedArtistA: !cur.mutedArtistA, announcement: !cur.mutedArtistA ? 'Artist A muted.' : 'Artist A unmuted.' }
      : { mutedArtistB: !cur.mutedArtistB, announcement: !cur.mutedArtistB ? 'Artist B muted.' : 'Artist B unmuted.' });
  };

  const flagTechnicalIssue = (warId: string) => {
    const cur = arenaFor(warId);
    patchArena(warId, { technicalIssue: !cur.technicalIssue, announcement: !cur.technicalIssue ? 'Technical issue flagged.' : 'Technical issue cleared.' });
  };

  const pushAnnouncement = (warId: string, message = 'Admin announcement pushed to the arena.') =>
    patchArena(warId, { announcement: message });

  const endBattle = (warId: string) => {
    setArenas((prev) => {
      const cur = prev[warId] ?? buildArena();
      const leftWins = cur.roundResults.filter((r) => r.winner === 'left').length;
      const rightWins = cur.roundResults.filter((r) => r.winner === 'right').length;
      const winner: Side | 'tie' = leftWins === rightWins ? 'tie' : leftWins > rightWins ? 'left' : 'right';
      return {
        ...prev,
        [warId]: {
          ...cur,
          status: 'completed',
          votingOpen: false,
          winner,
          announcement: 'Battle complete.',
        },
      };
    });
    setWars((prev) => prev.map((w) => (w.id === warId ? { ...w, status: 'completed', schedule: 'Ended • Song Wars complete' } : w)));
  };

  const addArenaReaction = (warId: string, key: string, label: string) => {
    setArenas((prev) => {
      const cur = prev[warId] ?? buildArena();
      const reaction = { id: `${key}-${Date.now()}-${Math.random().toString(16).slice(2)}`, key, label, at: Date.now() };
      return { ...prev, [warId]: { ...cur, reactions: [reaction, ...cur.reactions].slice(0, 12) } };
    });
  };

  const resetArena = (warId: string) =>
    setArenas((prev) => ({ ...prev, [warId]: buildArena() }));

  // countdown + voting tick loop
  const timerRef = useRef<number | null>(null);
  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setArenas((prev) => {
        let changed = false;
        const next: Record<string, ArenaState> = { ...prev };
        for (const [id, a] of Object.entries(prev)) {
          if (a.status === 'live_starting' && !a.isPaused) {
            changed = true;
            if (a.countdown <= 1) {
              next[id] = { ...a, status: 'artist_a_performing', countdown: 0, currentPerformer: 'left', announcement: 'Artist A is live.' };
            } else {
              next[id] = { ...a, countdown: a.countdown - 1 };
            }
          } else if (a.status === 'voting_open' && a.voteSeconds > 0 && !a.isPaused) {
            changed = true;
            const secs = a.voteSeconds - 1;
            next[id] = secs <= 0
              ? { ...a, voteSeconds: 0, votingOpen: false, status: 'voting_closed', announcement: 'Voting closed automatically.' }
              : { ...a, voteSeconds: secs };
          } else if (Date.now() % 3 === 0 && ['artist_a_performing', 'artist_b_performing', 'voting_open'].includes(a.status)) {
            changed = true;
            const bump = Math.floor(Math.random() * 3);
            next[id] = { ...a, viewers: a.viewers + bump, peakViewers: Math.max(a.peakViewers, a.viewers + bump) };
          }
        }
        return changed ? next : prev;
      });
    }, 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  const totals = useMemo(() => {
    const count = (s: BattleStatus) => wars.filter((w) => w.status === s).length;
    const allVotes = wars.reduce((sum, w) => sum + w.left.votes + w.right.votes, 0);
    return {
      active: count('active'),
      scheduled: count('scheduled'),
      draft: count('draft'),
      completed: count('completed'),
      reported: count('reported'),
      allVotes,
      reportedComments: comments.filter((c) => c.reported && !c.hidden).length,
    };
  }, [wars, comments]);

  const value: SongWarsState = {
    wars,
    votedSide,
    voteCount,
    vote,
    leader,
    totalVotes,
    commentsFor,
    reportedComments,
    addComment,
    reactToComment,
    reportComment,
    hideComment,
    unhideComment,
    setStatus,
    clearReports,
    closeBattle,
    createBattle,
    addWar,
    matchVibeBattle,
    isFollowing,
    toggleFollow,
    followedArtists,
    followingCount: followed.length,
    resultFor,
    results,
    arenaFor,
    checkIn,
    setCountdownSel,
    startBattle,
    startPerformance,
    openVoting,
    arenaVote,
    closeVoting,
    revealWinner,
    nextRound,
    pauseBattle,
    resumeBattle,
    muteArtist,
    flagTechnicalIssue,
    pushAnnouncement,
    endBattle,
    addArenaReaction,
    resetArena,
    totals,
  };

  return <SongWarsContext.Provider value={value}>{children}</SongWarsContext.Provider>;
}

export function useSongWars(): SongWarsState {
  const ctx = useContext(SongWarsContext);
  if (!ctx) throw new Error('useSongWars must be used within SongWarsProvider');
  return ctx;
}

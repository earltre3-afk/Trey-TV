 
import React, { useEffect, useState } from 'react';
import {
  ArrowLeft, UserPlus, Send, X, Check, Search, Users, Trash2,
  Spade, Layers, Crown, Sparkles, Shuffle,
} from 'lucide-react';
import { TreyBrandMark } from '@/features/games/components/shared/TreyBrandMark';
import { GameType } from '@/features/games/lib/services/roomService';
import { PlayerIdentity } from '@/features/games/lib/services/identity';
import {
  Friend, listFriends, addFriendByName, removeFriend, findUserByDisplayName,
  sendGameRequest,
} from '@/features/games/lib/services/socialService';
import { isGameBackendEnabled } from '@/features/games/lib/gameBackend';

interface Props {
  identity: PlayerIdentity;
  onBack: () => void;
  defaultGame?: GameType;
  // Optional: if invites should pin to a specific room
  roomId?: string | null;
  roomCode?: string | null;
}

const GAME_LABEL: Record<GameType, { name: string; color: string; icon: React.ReactNode }> = {
  spades:    { name: 'Spades',    color: '#00B7FF', icon: <Spade size={14} /> },
  blackjack: { name: 'Blackjack', color: '#FFC857', icon: <Layers size={14} /> },
  bullshit:  { name: 'Bullshit',  color: '#A855F7', icon: <Crown size={14} /> },
  truno:     { name: 'Truno',     color: '#D946EF', icon: <Shuffle size={14} /> },
};

export const FriendInviteCenter: React.FC<Props> = ({ identity, onBack, defaultGame = 'spades', roomId, roomCode }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [game, setGame] = useState<GameType>(defaultGame);
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState('Come join the table.');
  const [sentTo, setSentTo] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<string | null>(null);
  const backendEnabled = isGameBackendEnabled();

  useEffect(() => {
    if (!backendEnabled) return;

    let cancelled = false;
    (async () => {
      try {
        const list = await listFriends(identity.userId);
        if (!cancelled) setFriends(list);
      } catch {
        if (!cancelled) setFriends([]);
      }
    })();
    const timer = setInterval(async () => {
      try {
        const list = await listFriends(identity.userId);
        setFriends(list);
      } catch {
        setFriends([]);
      }
    }, 5000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [backendEnabled, identity.userId]);

  const filtered = friends.filter(f =>
    !search.trim() || f.friend_display_name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const handleAddFriend = async () => {
    if (!backendEnabled) {
      setFeedback('Friend search will be available after the Trey TV game database migration is enabled.');
      setTimeout(() => setFeedback(null), 2500);
      return;
    }

    const name = search.trim();
    if (!name) return;
    setAdding(true);
    try {
      const found = await findUserByDisplayName(name);
      if (!found) {
        setFeedback(`No player found named "${name}"`);
      } else if (found.user_id === identity.userId) {
        setFeedback('That\'s you 😉');
      } else {
        await addFriendByName(identity, found.user_id, found.display_name);
        setFeedback(`Added ${found.display_name} as a friend`);
        const list = await listFriends(identity.userId);
        setFriends(list);
        setSearch('');
      }
    } catch (e: any) {
      setFeedback(e?.message || 'Could not add friend');
    } finally {
      setAdding(false);
      setTimeout(() => setFeedback(null), 2500);
    }
  };

  const handleInvite = async (f: Friend) => {
    if (!backendEnabled) {
      setFeedback('Invites will be available after the Trey TV game database migration is enabled.');
      setTimeout(() => setFeedback(null), 2500);
      return;
    }

    try {
      await sendGameRequest({
        from: identity,
        toUserId: f.friend_user_id,
        toDisplayName: f.friend_display_name,
        gameType: game,
        roomId: roomId ?? null,
        roomCode: roomCode ?? null,
        message,
      });
      setSentTo(prev => new Set(prev).add(f.friend_user_id));
      setFeedback(`Invite sent to ${f.friend_display_name}`);
      setTimeout(() => setFeedback(null), 2200);
    } catch (e: any) {
      setFeedback(e?.message || 'Failed to send invite');
    }
  };

  const handleRemove = async (f: Friend) => {
    if (!backendEnabled) {
      setFeedback('Friend management will be available after the Trey TV game database migration is enabled.');
      setTimeout(() => setFeedback(null), 2500);
      return;
    }

    await removeFriend(f.id);
    setFriends(prev => prev.filter(x => x.id !== f.id));
  };

  const gm = GAME_LABEL[game];

  return (
    <div className="min-h-screen w-full text-white relative overflow-hidden" style={{ background: '#05070D' }}>
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full blur-[140px]" style={{ background: 'radial-gradient(circle, rgba(0,183,255,0.22) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[140px]" style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)' }} />
      </div>

      <div className="sticky top-0 z-30 backdrop-blur-2xl border-b" style={{ background: 'rgba(5,7,13,0.78)', borderColor: 'rgba(0,183,255,0.18)' }}>
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition" aria-label="Back" title="Back"><ArrowLeft size={18} /></button>
          <TreyBrandMark size={28} glow />
          <div className="h-7 w-px bg-white/10" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] tracking-[0.3em] font-bold" style={{ color: '#00B7FF' }}>FRIENDS</div>
            <div className="text-sm font-black truncate">Invite Center</div>
          </div>
        </div>
      </div>

      <div className="relative max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Game selector */}
        <div className="rounded-3xl border p-4 md:p-5 backdrop-blur-md trey-queue-card"
          style={{ background: 'rgba(8,17,31,0.65)', borderColor: gm.color + '40', boxShadow: `0 0 40px ${gm.color}18` }}>
          <div className="text-[10px] tracking-[0.3em] font-bold mb-3" style={{ color: gm.color }}>INVITE TO</div>
          <div className="grid grid-cols-3 gap-2">
            {(['spades','blackjack','bullshit','truno'] as GameType[]).map(g => {
              const meta = GAME_LABEL[g];
              const active = game === g;
              return (
                <button key={g} onClick={() => setGame(g)}
                  className="rounded-2xl px-3 py-3 border text-left transition"
                  style={{
                    background: active ? meta.color + '22' : 'rgba(5,7,13,0.55)',
                    borderColor: active ? meta.color + '90' : 'rgba(255,255,255,0.10)',
                    boxShadow: active ? `0 0 24px ${meta.color}50` : 'none',
                    color: active ? meta.color : '#CBD5E1',
                  }}>
                  <div className="flex items-center gap-1.5 text-[9px] tracking-[0.2em] font-bold">{meta.icon} GAME</div>
                  <div className="text-sm font-black mt-1 truncate">{meta.name}</div>
                </button>
              );
            })}
          </div>

          <div className="mt-4">
            <div className="text-[10px] tracking-[0.3em] font-bold text-slate-500 mb-1.5">MESSAGE</div>
            <input value={message} onChange={(e) => setMessage(e.target.value)} maxLength={140}
              className="w-full rounded-xl px-3 py-2.5 text-sm bg-black/40 border outline-none focus:border-cyan-400 transition"
              style={{ borderColor: 'rgba(255,255,255,0.10)' }}
              placeholder="Say something to your crew…" />
          </div>
        </div>

        {/* Add by name */}
        <div className="rounded-3xl border p-4 backdrop-blur-md trey-queue-card"
          style={{ background: 'rgba(8,17,31,0.65)', borderColor: 'rgba(0,183,255,0.25)' }}>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search friends or add by display name"
                className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm bg-black/40 border outline-none focus:border-cyan-400 transition"
                style={{ borderColor: 'rgba(255,255,255,0.10)' }} />
            </div>
            <button onClick={handleAddFriend} disabled={adding || !search.trim()}
              className="px-3 py-2.5 rounded-xl text-xs font-black inline-flex items-center gap-1.5 disabled:opacity-50"
              style={{ background: 'linear-gradient(90deg,#00B7FF,#A855F7)', boxShadow: '0 0 20px rgba(0,183,255,0.4)' }}>
              <UserPlus size={14} /> Add
            </button>
          </div>
          {feedback && (
            <div className="mt-2 text-xs text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded-xl px-3 py-2">{feedback}</div>
          )}
        </div>

        {/* Friends list */}
        <div className="rounded-3xl border backdrop-blur-md p-4 trey-queue-card"
          style={{ background: 'rgba(8,17,31,0.65)', borderColor: 'rgba(168,85,247,0.25)' }}>
          <div className="flex items-end justify-between mb-3">
            <div>
              <div className="text-[10px] tracking-[0.3em] font-bold text-slate-500">YOUR CREW</div>
              <div className="text-base font-black tracking-tight flex items-center gap-2"><Users size={14} className="text-purple-300" /> Friends ({friends.length})</div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-xs text-slate-500 py-6 text-center">
              {!backendEnabled
                ? 'Friend invites will connect after the Trey TV game database migration is enabled.'
                : friends.length === 0 ? 'No friends yet. Search a display name above to add someone you\'ve played with.' : 'No matches.'}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(f => {
                const sent = sentTo.has(f.friend_user_id);
                return (
                  <div key={f.id} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 border trey-glass-panel"
                    style={{ background: 'rgba(5,7,13,0.6)', borderColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="w-9 h-9 rounded-2xl flex items-center justify-center font-black text-sm shrink-0"
                      style={{ background: 'linear-gradient(135deg, rgba(0,183,255,0.25), rgba(168,85,247,0.25))', border: '1px solid rgba(255,255,255,0.12)' }}>
                      {f.friend_display_name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-black truncate">{f.friend_display_name}</div>
                      <div className="text-[10px] text-slate-500">Trey TV player</div>
                    </div>
                    <button onClick={() => handleInvite(f)} disabled={sent}
                      className="px-3 py-2 rounded-xl text-[11px] font-black inline-flex items-center gap-1.5 transition"
                      style={{
                        background: sent ? 'rgba(34,197,94,0.18)' : gm.color + '22',
                        color: sent ? '#86EFAC' : gm.color,
                        border: '1px solid ' + (sent ? 'rgba(34,197,94,0.5)' : gm.color + '60'),
                      }}>
                      {sent ? <><Check size={12} /> Sent</> : <><Send size={12} /> Invite</>}
                    </button>
                    <button onClick={() => handleRemove(f)} className="p-2 rounded-xl hover:bg-rose-500/10 transition" title="Remove friend">
                      <Trash2 size={13} className="text-rose-300" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <p className="text-[11px] text-slate-500 text-center max-w-md mx-auto leading-relaxed">
          Invites land in your friend's Game Requests inbox. They have 15 minutes to accept.
        </p>
      </div>
    </div>
  );
};

export default FriendInviteCenter;

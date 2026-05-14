/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import {
  ArrowLeft, Inbox, Check, X, Spade, Layers, Crown, Mail, Clock, Send,
} from 'lucide-react';
import { TreyBrandMark } from '@/features/games/components/shared/TreyBrandMark';
import { GameType } from '@/features/games/lib/services/roomService';
import { PlayerIdentity } from '@/features/games/lib/services/identity';
import {
  GameRequest, listInbox, listOutgoing, acceptRequest, declineRequest, cancelOutgoingRequest,
} from '@/features/games/lib/services/socialService';

interface Props {
  identity: PlayerIdentity;
  onBack: () => void;
  onAccept: (req: GameRequest) => void;
}

const GAME_META: Record<GameType, { name: string; color: string; icon: React.ReactNode }> = {
  spades:    { name: 'Spades',    color: '#00B7FF', icon: <Spade size={14} /> },
  blackjack: { name: 'Blackjack', color: '#FFC857', icon: <Layers size={14} /> },
  bullshit:  { name: 'Bullshit',  color: '#A855F7', icon: <Crown size={14} /> },
};

export const GameRequestsInbox: React.FC<Props> = ({ identity, onBack, onAccept }) => {
  const [inbox, setInbox] = useState<GameRequest[]>([]);
  const [outgoing, setOutgoing] = useState<GameRequest[]>([]);
  const [tab, setTab] = useState<'in' | 'out'>('in');

  useEffect(() => {
    const tick = async () => {
      const [i, o] = await Promise.all([
        listInbox(identity.userId),
        listOutgoing(identity.userId),
      ]);
      setInbox(i);
      setOutgoing(o);
    };
    tick();
    const t = setInterval(tick, 2500);
    return () => clearInterval(t);
  }, [identity.userId]);

  const handleAccept = async (r: GameRequest) => {
    const updated = await acceptRequest(r.id);
    if (updated) onAccept(updated);
  };
  const handleDecline = async (r: GameRequest) => {
    await declineRequest(r.id);
    setInbox(prev => prev.map(x => x.id === r.id ? { ...x, status: 'declined' } : x));
  };
  const handleCancel = async (r: GameRequest) => {
    await cancelOutgoingRequest(r.id);
    setOutgoing(prev => prev.map(x => x.id === r.id ? { ...x, status: 'cancelled' } : x));
  };

  const pending = inbox.filter(r => r.status === 'pending');

  return (
    <div className="min-h-screen w-full text-white relative overflow-hidden" style={{ background: '#05070D' }}>
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-[140px]" style={{ background: 'radial-gradient(circle, rgba(255,200,87,0.18) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[140px]" style={{ background: 'radial-gradient(circle, rgba(0,183,255,0.18) 0%, transparent 70%)' }} />
      </div>

      <div className="sticky top-0 z-30 backdrop-blur-2xl border-b" style={{ background: 'rgba(5,7,13,0.78)', borderColor: 'rgba(255,200,87,0.18)' }}>
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition"><ArrowLeft size={18} /></button>
          <TreyBrandMark size={28} glow />
          <div className="h-7 w-px bg-white/10" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] tracking-[0.3em] font-bold" style={{ color: '#FFC857' }}>INBOX</div>
            <div className="text-sm font-black truncate">Game Requests</div>
          </div>
          {pending.length > 0 && (
            <div className="text-[10px] font-black px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(255,200,87,0.18)', border: '1px solid rgba(255,200,87,0.55)', color: '#FFC857' }}>
              {pending.length} pending
            </div>
          )}
        </div>
      </div>

      <div className="relative max-w-3xl mx-auto px-4 py-5 space-y-4">
        {/* Tabs */}
        <div className="flex gap-2 rounded-2xl p-1 border" style={{ background: 'rgba(8,17,31,0.65)', borderColor: 'rgba(255,255,255,0.08)' }}>
          <TabBtn active={tab === 'in'} onClick={() => setTab('in')} icon={<Inbox size={14} />} label={`Inbox (${inbox.length})`} color="#FFC857" />
          <TabBtn active={tab === 'out'} onClick={() => setTab('out')} icon={<Send size={14} />} label={`Sent (${outgoing.length})`} color="#00B7FF" />
        </div>

        {tab === 'in' && (
          <div className="space-y-2">
            {inbox.length === 0 && (
              <div className="rounded-3xl border p-8 text-center text-sm text-slate-400 backdrop-blur-md"
                style={{ background: 'rgba(8,17,31,0.65)', borderColor: 'rgba(255,255,255,0.08)' }}>
                <Mail size={28} className="mx-auto mb-2 text-slate-500" />
                Your inbox is quiet. When friends invite you to a game, requests show up here.
              </div>
            )}
            {inbox.map(r => <RequestCard key={r.id} r={r} kind="in" onAccept={() => handleAccept(r)} onDecline={() => handleDecline(r)} />)}
          </div>
        )}

        {tab === 'out' && (
          <div className="space-y-2">
            {outgoing.length === 0 && (
              <div className="rounded-3xl border p-8 text-center text-sm text-slate-400 backdrop-blur-md"
                style={{ background: 'rgba(8,17,31,0.65)', borderColor: 'rgba(255,255,255,0.08)' }}>
                <Send size={28} className="mx-auto mb-2 text-slate-500" />
                You haven't sent any invites yet.
              </div>
            )}
            {outgoing.map(r => <RequestCard key={r.id} r={r} kind="out" onCancel={() => handleCancel(r)} />)}
          </div>
        )}
      </div>
    </div>
  );
};

const TabBtn: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; color: string }> =
({ active, onClick, icon, label, color }) => (
  <button onClick={onClick}
    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-black transition"
    style={{
      background: active ? color + '22' : 'transparent',
      color: active ? color : '#94A3B8',
      border: active ? '1px solid ' + color + '60' : '1px solid transparent',
    }}>
    {icon} {label}
  </button>
);

const RequestCard: React.FC<{
  r: GameRequest;
  kind: 'in' | 'out';
  onAccept?: () => void;
  onDecline?: () => void;
  onCancel?: () => void;
}> = ({ r, kind, onAccept, onDecline, onCancel }) => {
  const meta = GAME_META[r.game_type];
  const isPending = r.status === 'pending';
  const statusColor =
    r.status === 'accepted' ? '#22C55E' :
    r.status === 'declined' || r.status === 'cancelled' || r.status === 'expired' ? '#FCA5A5' :
    meta.color;

  return (
    <div className="rounded-3xl border p-4 backdrop-blur-md"
      style={{
        background: 'rgba(8,17,31,0.7)',
        borderColor: meta.color + (isPending ? '60' : '25'),
        boxShadow: isPending ? `0 0 30px ${meta.color}25` : 'none',
      }}>
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: meta.color + '20', border: '1px solid ' + meta.color + '60', color: meta.color }}>
          <div style={{ transform: 'scale(1.2)' }}>{meta.icon}</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-[9px] tracking-[0.25em] font-black px-2 py-0.5 rounded-md"
              style={{ background: meta.color + '22', color: meta.color, border: '1px solid ' + meta.color + '60' }}>
              {meta.name.toUpperCase()}
            </div>
            <div className="text-[9px] tracking-[0.25em] font-black px-2 py-0.5 rounded-md"
              style={{ background: statusColor + '20', color: statusColor, border: '1px solid ' + statusColor + '50' }}>
              {r.status.toUpperCase()}
            </div>
            {r.room_code && (
              <div className="text-[10px] font-mono text-slate-400">code {r.room_code}</div>
            )}
          </div>
          <div className="text-sm font-black mt-1.5 truncate">
            {kind === 'in' ? `${r.from_display_name} invited you` : `Invited ${r.to_display_name || r.to_user_id.slice(0, 8)}`}
          </div>
          {r.message && (
            <div className="text-xs text-slate-300 mt-1 line-clamp-2">"{r.message}"</div>
          )}
          <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
            <Clock size={10} /> {timeAgo(r.created_at)}
          </div>
        </div>
      </div>

      {isPending && kind === 'in' && (
        <div className="flex gap-2 mt-3">
          <button onClick={onAccept}
            className="flex-1 px-3 py-2.5 rounded-xl text-xs font-black inline-flex items-center justify-center gap-1.5"
            style={{ background: 'linear-gradient(90deg,#22C55E,#16A34A)', boxShadow: '0 0 20px rgba(34,197,94,0.4)' }}>
            <Check size={14} /> Accept & Join
          </button>
          <button onClick={onDecline}
            className="px-3 py-2.5 rounded-xl text-xs font-bold border inline-flex items-center justify-center gap-1.5"
            style={{ borderColor: 'rgba(248,113,113,0.4)', color: '#FCA5A5', background: 'rgba(248,113,113,0.06)' }}>
            <X size={14} /> Decline
          </button>
        </div>
      )}

      {isPending && kind === 'out' && (
        <div className="flex gap-2 mt-3">
          <button onClick={onCancel}
            className="px-3 py-2.5 rounded-xl text-xs font-bold border inline-flex items-center justify-center gap-1.5"
            style={{ borderColor: 'rgba(248,113,113,0.4)', color: '#FCA5A5', background: 'rgba(248,113,113,0.06)' }}>
            <X size={14} /> Cancel Invite
          </button>
        </div>
      )}
    </div>
  );
};

function timeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 5) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default GameRequestsInbox;

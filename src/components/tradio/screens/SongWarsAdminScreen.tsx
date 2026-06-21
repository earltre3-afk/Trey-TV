import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  Shield,
  AlertTriangle,
  Play,
  Pause,
  CheckCircle2,
  Trash2,
  Crown,
  Plus,
  MessageSquareWarning,
  EyeOff,
} from 'lucide-react';
import { useSongWars } from '../../../contexts/SongWarsContext';
import CreateBattleForm from '../songwars/CreateBattleForm';
import type { BattleStatus, SongWar, BattleComment } from '../../../data/mockData';

interface Props {
  onClose: () => void;
  onBattleSetup?: () => void;
}

const STAT_TABS: { key: BattleStatus; label: string }[] = [
  { key: 'active', label: 'Active' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'draft', label: 'Draft' },
  { key: 'completed', label: 'Completed' },
  { key: 'reported', label: 'Reported' },
];

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`;
}

export default function SongWarsAdminScreen({ onClose, onBattleSetup }: Props) {
  const {
    wars,
    totals,
    totalVotes,
    leader,
    setStatus,
    clearReports,
    closeBattle,
    reportedComments,
    hideComment,
    unhideComment,
  } = useSongWars();
  const [tab, setTab] = useState<BattleStatus>('active');
  const [showCreate, setShowCreate] = useState(false);

  const rows = useMemo(() => wars.filter((w) => w.status === tab), [wars, tab]);

  const statCards = [
    { label: 'Active', value: totals.active, tone: 'text-amber-300' },
    { label: 'Scheduled', value: totals.scheduled, tone: 'text-cyan-300' },
    { label: 'Drafts', value: totals.draft, tone: 'text-white/70' },
    { label: 'Completed', value: totals.completed, tone: 'text-emerald-300' },
    { label: 'Reported', value: totals.reported + totals.reportedComments, tone: 'text-red-400' },
    { label: 'Total Votes', value: fmt(totals.allVotes), tone: 'text-amber-300' },
  ];

  const warName = (warId: string) => wars.find((w) => w.id === warId)?.title ?? 'Battle';

  const ReportedCommentRow = ({ c }: { c: BattleComment }) => (
    <div className="tradio-glass rounded-2xl p-3.5">
      <div className="flex items-center gap-2 mb-2">
        <img src={c.avatar} alt={c.user} className="w-7 h-7 rounded-full object-cover border border-white/10" />
        <div className="min-w-0">
          <p className="text-white text-xs font-bold truncate">{c.user}</p>
          <p className="text-white/35 text-[10px] truncate">on {warName(c.warId)} • {c.time}</p>
        </div>
        <span className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-600/20 border border-red-500/40 text-red-300 text-[10px] font-bold shrink-0">
          <MessageSquareWarning className="w-3 h-3" /> Reported
        </span>
      </div>
      <p className="text-white/70 text-[13px] mb-3 break-words">{c.text}</p>
      <div className="flex gap-2">
        <button
          onClick={() => hideComment(c.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600/15 border border-red-500/40 text-red-300 text-xs font-bold active:scale-95 transition"
        >
          <EyeOff className="w-3.5 h-3.5" /> Hide
        </button>
        <button
          onClick={() => unhideComment(c.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold active:scale-95 transition"
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Dismiss
        </button>
      </div>
    </div>
  );

  const ActionRow = ({ war }: { war: SongWar }) => {
    const lead = leader(war);
    const leadName = lead === 'tie' ? 'Tie' : lead === 'left' ? war.left.name : war.right.name;
    return (
      <div className="tradio-glass rounded-2xl p-3.5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="min-w-0">
            <p className="text-white font-bold text-sm truncate">{war.title}</p>
            <p className="text-white/40 text-[11px]">{war.type} • {war.schedule}</p>
          </div>
          {war.status === 'reported' && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-600/20 border border-red-500/40 text-red-300 text-[10px] font-bold shrink-0">
              <AlertTriangle className="w-3 h-3" /> {war.reports} reports
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <img src={war.left.image} alt={war.left.name} className="w-7 h-7 rounded-full object-cover border border-white/10" />
            <span className="text-white/70 text-xs truncate">{war.left.name}</span>
          </div>
          <span className="text-cyan-300/70 text-[10px] font-bold">VS</span>
          <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
            <span className="text-white/70 text-xs truncate text-right">{war.right.name}</span>
            <img src={war.right.image} alt={war.right.name} className="w-7 h-7 rounded-full object-cover border border-white/10" />
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] mb-3">
          <span className="text-white/45">{fmt(totalVotes(war))} votes</span>
          <span className="flex items-center gap-1 text-amber-300 font-bold">
            <Crown className="w-3.5 h-3.5" fill="currentColor" /> Leader: {leadName}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {war.status === 'draft' || war.status === 'scheduled' ? (
            <button
              onClick={() => setStatus(war.id, 'active')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full tradio-gold-gradient text-black text-xs font-bold active:scale-95 transition"
            >
              <Play className="w-3.5 h-3.5" fill="currentColor" /> Publish Live
            </button>
          ) : null}
          {war.status === 'active' ? (
            <>
              <button
                onClick={() => setStatus(war.id, 'scheduled')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.08] border border-white/10 text-white text-xs font-bold active:scale-95 transition"
              >
                <Pause className="w-3.5 h-3.5" /> Pause
              </button>
              <button
                onClick={() => closeBattle(war.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold active:scale-95 transition"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Close & Recap
              </button>
            </>
          ) : null}
          {war.status === 'reported' ? (
            <>
              <button
                onClick={() => clearReports(war.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold active:scale-95 transition"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Dismiss Reports
              </button>
              <button
                onClick={() => setStatus(war.id, 'completed')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600/15 border border-red-500/40 text-red-300 text-xs font-bold active:scale-95 transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            </>
          ) : null}
          {war.status === 'completed' ? (
            <button
              onClick={() => setStatus(war.id, 'active')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.08] border border-white/10 text-white text-xs font-bold active:scale-95 transition"
            >
              <Play className="w-3.5 h-3.5" fill="currentColor" /> Reopen
            </button>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex items-center gap-3 px-5 pt-3 pb-2 shrink-0">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/[0.06] border border-amber-400/20 flex items-center justify-center text-white active:scale-95 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <Shield className="w-4 h-4 text-amber-400" />
          <span className="tradio-chrome font-bold tracking-wide text-sm">SONG WARS · ADMIN</span>
        </div>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full tradio-gold-gradient text-black text-xs font-bold active:scale-95 transition"
        >
          <Plus className="w-3.5 h-3.5" /> {showCreate ? 'Close' : 'Quick'}
        </button>
        {onBattleSetup && (
          <button
            onClick={onBattleSetup}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-black text-xs font-bold active:scale-95 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Wizard
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pb-4 pt-1">
        <div className="px-5 grid grid-cols-3 gap-2.5 mb-5">
          {statCards.map((s) => (
            <div key={s.label} className="tradio-glass rounded-2xl p-3 text-center">
              <p className={`text-2xl font-black ${s.tone}`}>{s.value}</p>
              <p className="text-white/40 text-[10px] font-semibold mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {showCreate && (
          <div className="px-5">
            <CreateBattleForm />
          </div>
        )}

        <div className="px-5 mb-4 flex gap-2 overflow-x-auto no-scrollbar">
          {STAT_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                tab === t.key
                  ? 'tradio-gold-gradient text-black'
                  : 'bg-white/[0.06] text-white/60 border border-white/10'
              }`}
            >
              {t.label}
              {t.key === 'reported' && totals.reportedComments > 0
                ? ` (${totals.reported + totals.reportedComments})`
                : ''}
            </button>
          ))}
        </div>

        <div className="px-5 space-y-3">
          {tab === 'reported' && reportedComments.length > 0 && (
            <>
              <p className="text-red-300/80 text-[11px] font-bold tracking-widest">
                REPORTED COMMENTS QUEUE
              </p>
              {reportedComments.map((c) => (
                <ReportedCommentRow key={c.id} c={c} />
              ))}
              {rows.length > 0 && (
                <p className="text-white/45 text-[11px] font-bold tracking-widest pt-2">
                  REPORTED BATTLES
                </p>
              )}
            </>
          )}

          {rows.length === 0 && !(tab === 'reported' && reportedComments.length > 0) ? (
            <p className="text-white/40 text-sm text-center py-10">No {tab} battles.</p>
          ) : (
            rows.map((war) => <ActionRow key={war.id} war={war} />)
          )}
        </div>
      </div>
    </>
  );
}

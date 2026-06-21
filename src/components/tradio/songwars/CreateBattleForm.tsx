import React, { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { useSongWars } from '../../../contexts/SongWarsContext';
import {
  BATTLE_TYPES,
  CONTESTANT_POOL,
  VIBE_TAGS,
  type BattleType,
  type ContestantSeed,
} from '../../../data/mockData';

export default function CreateBattleForm() {
  const { createBattle } = useSongWars();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<BattleType>('Artist vs Artist');
  const [leftId, setLeftId] = useState(CONTESTANT_POOL[0].id);
  const [rightId, setRightId] = useState(CONTESTANT_POOL[1].id);
  const [schedule, setSchedule] = useState('');
  const [vibe, setVibe] = useState('');
  const [done, setDone] = useState(false);

  const isPrescribe = type === 'Prescribe Me Battle';
  const valid = title.trim() && leftId !== rightId;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const left = CONTESTANT_POOL.find((c) => c.id === leftId) as ContestantSeed;
    const right = CONTESTANT_POOL.find((c) => c.id === rightId) as ContestantSeed;
    createBattle({
      title: title.trim(),
      type,
      left,
      right,
      schedule: schedule.trim(),
      vibe: isPrescribe && vibe ? vibe : undefined,
    });
    setTitle('');
    setSchedule('');
    setVibe('');
    setDone(true);
    setTimeout(() => setDone(false), 2200);
  };

  const fieldCls =
    'w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/40';
  const labelCls = 'text-white/45 text-[11px] font-bold tracking-wide mb-1.5 block';

  return (
    <div className="relative rounded-2xl overflow-hidden border border-amber-400/25 p-4 mb-5">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-700/15 via-slate-950 to-black" />
      <form onSubmit={submit} className="relative space-y-3.5">
        <div className="flex items-center gap-2">
          <Plus className="w-4 h-4 text-amber-300" />
          <span className="tradio-chrome font-bold tracking-wide text-sm">CREATE BATTLE</span>
        </div>

        <div>
          <label className={labelCls}>Battle Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Midnight Showdown"
            className={fieldCls}
          />
        </div>

        <div>
          <label className={labelCls}>Battle Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as BattleType)}
            className={fieldCls}
          >
            {BATTLE_TYPES.map((t) => (
              <option key={t} value={t} className="bg-slate-900">
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Contestant A</label>
            <select value={leftId} onChange={(e) => setLeftId(e.target.value)} className={fieldCls}>
              {CONTESTANT_POOL.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900">
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Contestant B</label>
            <select value={rightId} onChange={(e) => setRightId(e.target.value)} className={fieldCls}>
              {CONTESTANT_POOL.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900">
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {leftId === rightId && (
          <p className="text-red-300/80 text-[11px]">Pick two different contestants.</p>
        )}

        <div>
          <label className={labelCls}>Schedule</label>
          <input
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            placeholder="e.g. Starts Fri 8:00 PM"
            className={fieldCls}
          />
        </div>

        {isPrescribe && (
          <div>
            <label className={labelCls}>Prescribe Me Vibe (optional)</label>
            <select value={vibe} onChange={(e) => setVibe(e.target.value)} className={fieldCls}>
              <option value="" className="bg-slate-900">
                No vibe tag
              </option>
              {VIBE_TAGS.map((v) => (
                <option key={v} value={v} className="bg-slate-900">
                  {v}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={!valid}
          className="w-full tradio-gold-gradient text-black font-black py-3 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition disabled:opacity-40"
        >
          {done ? (
            <>
              <Check className="w-4 h-4" /> Draft Created
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" /> Create Draft Battle
            </>
          )}
        </button>
      </form>
    </div>
  );
}

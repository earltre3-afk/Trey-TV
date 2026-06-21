import React, { useState } from 'react';
import { Flame, Crown, Waves, Send, Flag, MessageCircle } from 'lucide-react';
import { useSongWars } from '../../../contexts/SongWarsContext';
import type { BattleComment, ReactionKey } from '../../../data/mockData';

const REACTIONS: { key: ReactionKey; icon: React.ElementType; color: string }[] = [
  { key: 'fire', icon: Flame, color: 'text-orange-400' },
  { key: 'gold', icon: Crown, color: 'text-amber-300' },
  { key: 'wave', icon: Waves, color: 'text-cyan-300' },
];

function CommentRow({ c }: { c: BattleComment }) {
  const { reactToComment, reportComment } = useSongWars();
  return (
    <div className="flex gap-3 py-2.5">
      <img src={c.avatar} alt={c.user} className="w-8 h-8 rounded-full object-cover border border-amber-400/20 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-white text-xs font-bold truncate">{c.user}</span>
          <span className="text-white/30 text-[10px]">{c.time}</span>
          {c.reported && (
            <span className="text-red-300/80 text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 border border-red-500/30">
              Reported
            </span>
          )}
        </div>
        <p className="text-white/70 text-[13px] leading-snug mt-0.5 break-words">{c.text}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          {REACTIONS.map(({ key, icon: Icon, color }) => {
            const active = c.myReaction === key;
            return (
              <button
                key={key}
                onClick={() => reactToComment(c.id, key)}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold transition active:scale-90 ${
                  active
                    ? 'bg-amber-400/15 border border-amber-400/40'
                    : 'bg-white/[0.05] border border-white/10 hover:border-amber-400/30'
                }`}
              >
                <Icon className={`w-3 h-3 ${active ? color : 'text-white/50'}`} />
                <span className={active ? 'text-amber-200' : 'text-white/50'}>{c.reactions[key]}</span>
              </button>
            );
          })}
          {!c.reported && (
            <button
              onClick={() => reportComment(c.id)}
              className="ml-auto flex items-center gap-1 px-2 py-1 rounded-full text-[10px] text-white/35 hover:text-red-300 transition"
            >
              <Flag className="w-3 h-3" /> Report
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommentThread({ warId }: { warId: string }) {
  const { commentsFor, addComment } = useSongWars();
  const [text, setText] = useState('');
  const list = commentsFor(warId);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    addComment(warId, text);
    setText('');
  };

  return (
    <div className="mt-4 pt-4 border-t border-white/[0.07]">
      <div className="flex items-center gap-2 mb-2">
        <MessageCircle className="w-3.5 h-3.5 text-amber-300" />
        <span className="text-amber-200/80 text-[11px] font-bold tracking-widest">
          BATTLE TALK • {list.length}
        </span>
      </div>

      <form onSubmit={submit} className="flex items-center gap-2 mb-1">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Drop your take on this battle..."
          className="flex-1 bg-white/[0.05] border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/40"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="w-9 h-9 rounded-full tradio-gold-gradient text-black flex items-center justify-center shrink-0 active:scale-90 transition disabled:opacity-40"
          aria-label="Post comment"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      <div className="divide-y divide-white/[0.05] max-h-64 overflow-y-auto no-scrollbar">
        {list.length === 0 ? (
          <p className="text-white/30 text-xs py-4 text-center">Be the first to weigh in.</p>
        ) : (
          list.map((c) => <CommentRow key={c.id} c={c} />)
        )}
      </div>
    </div>
  );
}

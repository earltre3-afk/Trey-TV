import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Send, Sparkles, Shield, Heart, Flame, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useTreyAuth } from '../../hooks/useTreyAuth';

interface ChatPanelProps {
  roomType: 'live' | 'open_mic';
  refId: string | null; // submission_id or open_mic_item_id
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ roomType, refId }) => {
  const { user } = useTreyAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [reactions, setReactions] = useState<{ like: number; fire: number; replay: number }>({ like: 0, fire: 0, replay: 0 });
  const [body, setBody] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);

  const filterCol = roomType === 'live' ? 'submission_id' : 'open_mic_item_id';

  const load = useCallback(async () => {
    if (!refId) { setComments([]); setReactions({ like: 0, fire: 0, replay: 0 }); return; }
    const { data } = await supabase.from('music_review_comments').select('*')
      .eq('room_type', roomType).eq(filterCol, refId).eq('is_hidden', false)
      .order('created_at', { ascending: true }).limit(200);
    setComments(data || []);
    const { data: r } = await supabase.from('music_review_reactions').select('reaction_type')
      .eq('room_type', roomType).eq(filterCol, refId);
    const counts = { like: 0, fire: 0, replay: 0 };
    (r || []).forEach((x: any) => {
      if (x.reaction_type === 'like') counts.like++;
      else if (x.reaction_type === 'fire') counts.fire++;
      else if (x.reaction_type === 'replay') counts.replay++;
    });
    setReactions(counts);
  }, [filterCol, refId, roomType]);

  useEffect(() => {
    load();
    if (!refId) return;
    const ch = supabase
      .channel(`chat-${roomType}-${refId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'music_review_comments' }, () => load())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'music_review_reactions' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load, roomType, refId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments.length]);

  const send = async () => {
    if (!user || !body.trim() || !refId) return;
    await supabase.from('music_review_comments').insert({
      room_type: roomType,
      [filterCol]: refId,
      user_id: user.id,
      user_name: user.name,
      body: body.trim(),
      is_admin: user.isAdmin
    });
    setBody('');
  };

  const react = async (type: 'like' | 'fire' | 'replay') => {
    if (!user || !refId) return;
    await supabase.from('music_review_reactions').insert({
      room_type: roomType,
      [filterCol]: refId,
      user_id: user.id,
      reaction_type: type
    });
  };

  const aiSpark = async () => {
    if (!user?.isAdmin || !refId) return;
    const lines = [
      'Trey-I noticed strong hook replay value.',
      'Trey-I detected mix clarity issues around the vocal.',
      'Trey-I thinks the chorus is the strongest section.',
      'Trey-I suggests tightening the intro before final release.'
    ];
    await supabase.from('music_review_comments').insert({
      room_type: roomType,
      [filterCol]: refId,
      user_id: null,
      user_name: 'Trey-I',
      body: lines[Math.floor(Math.random() * lines.length)],
      is_ai_labeled: true
    });
  };

  return (
    <div className="rounded-3xl border border-[#1a2942] bg-[#0B1426]/80 p-4 flex flex-col h-[520px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="text-[#F8FAFC] font-bold tracking-wide">LISTENING ROOM</div>
          <span className="flex items-center gap-1 text-[#00B7FF] text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00B7FF] animate-pulse" /> LIVE CHAT
          </span>
        </div>
        {user?.isAdmin && (
          <button onClick={aiSpark} className="flex items-center gap-1 text-[10px] text-[#A855F7] border border-[#A855F7]/40 rounded-lg px-2 py-1">
            <Sparkles size={10} /> AI SPARK
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {comments.length === 0 && (
          <div className="text-center text-[#94A3B8] text-sm py-8">Be the first to comment.</div>
        )}
        {comments.map((c) => (
          <div key={c.id} className={`rounded-2xl p-2.5 ${c.is_ai_labeled ? 'border border-[#A855F7]/40 bg-[#A855F7]/5' : c.is_admin ? 'border border-[#FFC857]/40 bg-[#FFC857]/5' : 'bg-[#05070D]/60'}`}>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold" style={{ color: c.is_ai_labeled ? '#A855F7' : c.is_admin ? '#FFC857' : '#00B7FF' }}>
                {c.user_name || 'User'}
              </span>
              {c.is_admin && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FFC857]/20 text-[#FFC857]">HOST</span>}
              {c.is_ai_labeled && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#A855F7]/20 text-[#A855F7] flex items-center gap-1"><Shield size={8} /> AI</span>}
              <span className="text-[#64748B] text-[10px] ml-auto">{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="text-[#F8FAFC] text-sm mt-1">{c.body}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder={user ? 'Say something…' : 'Sign in to comment'}
          disabled={!user}
          className="flex-1 px-3 py-2 rounded-xl bg-[#05070D] border border-[#1a2942] text-[#F8FAFC] text-sm outline-none focus:border-[#00B7FF] disabled:opacity-50"
        />
        <button onClick={send} disabled={!user || !body.trim()} className="w-9 h-9 rounded-xl bg-[#00B7FF] text-[#05070D] flex items-center justify-center disabled:opacity-30">
          <Send size={14} />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button onClick={() => react('like')} disabled={!user} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1a2942] text-[#F8FAFC] text-xs disabled:opacity-40">
          <Heart size={14} className="text-[#EF4444]" /> {reactions.like}
        </button>
        <button onClick={() => react('fire')} disabled={!user} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1a2942] text-[#F8FAFC] text-xs disabled:opacity-40">
          <Flame size={14} className="text-[#FFB000]" /> {reactions.fire}
        </button>
        <button onClick={() => react('replay')} disabled={!user} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1a2942] text-[#F8FAFC] text-xs disabled:opacity-40">
          <MessageSquare size={14} className="text-[#00B7FF]" /> {reactions.replay}
        </button>
      </div>
    </div>
  );
};

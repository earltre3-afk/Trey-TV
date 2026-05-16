import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SkipForward, Trash2, RotateCw, AlertTriangle, X } from 'lucide-react';
import { skipOpenMicSong, removeOpenMicSong, retryOpenMicCleanupAction } from '../../lib/adminApi';

export const AdminOpenMic: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  const load = async () => {
    const { data: q } = await supabase.from('open_mic_queue').select('*').order('submitted_at', { ascending: true }).limit(50);
    setItems(q || []);
    const { data: h } = await supabase.from('open_mic_play_history').select('*').order('created_at', { ascending: false }).limit(20);
    setHistory(h || []);
  };

  useEffect(() => {
    load();
    const ch = supabase.channel('admin-om')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'open_mic_queue' }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const clearQueue = async () => {
    for (const item of items.filter((x) => x.status === 'queued')) {
      await removeOpenMicSong(item.id);
    }
  };

  return (
    <div className="px-4 pt-4 pb-32 max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-black text-[#F8FAFC]">Open Mic Moderation</h1>

      <div className="rounded-3xl border border-[#1a2942] bg-[#0B1426] p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[#A855F7] font-bold tracking-wider">CURRENT QUEUE</div>
          <button onClick={clearQueue} className="text-xs text-[#EF4444] border border-[#EF4444]/40 rounded-lg px-2 py-1">CLEAR QUEUE</button>
        </div>
        <div className="space-y-2">
          {items.filter((x) => ['queued','playing'].includes(x.status)).map((x) => (
            <div key={x.id} className="flex items-center gap-3 p-2 rounded-2xl border border-[#1a2942] bg-[#05070D]/40">
              <div className="text-[#A855F7] text-[10px] font-bold uppercase">{x.status}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[#F8FAFC] text-sm font-semibold truncate">{x.song_title}</div>
                <div className="text-[#94A3B8] text-xs truncate">{x.user_name}</div>
              </div>
              <button title="Skip" onClick={() => skipOpenMicSong(x.id)} className="w-7 h-7 rounded-lg bg-[#FFC857]/15 border border-[#FFC857]/40 text-[#FFC857] flex items-center justify-center"><SkipForward size={12} /></button>
              <button title="Remove" onClick={() => removeOpenMicSong(x.id)} className="w-7 h-7 rounded-lg bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444] flex items-center justify-center"><Trash2 size={12} /></button>
            </div>
          ))}
          {items.filter((x) => ['queued','playing'].includes(x.status)).length === 0 && <div className="text-center text-[#94A3B8] py-6">Queue is empty.</div>}
        </div>
      </div>

      <div className="rounded-3xl border border-[#1a2942] bg-[#0B1426] p-4">
        <div className="text-[#A855F7] font-bold tracking-wider mb-3">CLEANUP STATUS</div>
        <div className="space-y-2">
          {items.filter((x) => x.cleanup_failed).map((x) => (
            <div key={x.id} className="flex items-center gap-3 p-2 rounded-2xl border border-[#EF4444]/40 bg-[#EF4444]/5">
              <AlertTriangle size={14} className="text-[#EF4444]" />
              <div className="flex-1 min-w-0">
                <div className="text-[#F8FAFC] text-sm truncate">{x.song_title}</div>
                <div className="text-[#94A3B8] text-xs">Cleanup failed</div>
              </div>
              <button onClick={() => retryOpenMicCleanupAction(x.id).then(load)} className="flex items-center gap-1 text-[#00B7FF] text-xs border border-[#00B7FF]/40 rounded-lg px-2 py-1"><RotateCw size={10} /> RETRY</button>
            </div>
          ))}
          {items.filter((x) => x.cleanup_failed).length === 0 && <div className="text-[#94A3B8] text-xs">All clean ✓</div>}
        </div>
      </div>

      <div className="rounded-3xl border border-[#1a2942] bg-[#0B1426] p-4">
        <div className="text-[#A855F7] font-bold tracking-wider mb-3">RECENTLY PLAYED (audio auto-deleted)</div>
        <div className="space-y-1.5">
          {history.map((h) => (
            <div key={h.id} className="flex items-center gap-3 text-sm">
              <div className="text-[#94A3B8] text-xs w-32 truncate">{new Date(h.created_at).toLocaleString()}</div>
              <div className="flex-1 text-[#F8FAFC] truncate">{h.song_title}</div>
              <div className="text-[10px] text-[#22C55E]">{h.storage_deleted ? 'DELETED ✓' : 'PENDING'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

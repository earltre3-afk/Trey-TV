import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Play, Trash2, ArrowUp, ArrowDown, CheckCircle2, DollarSign, Edit3 } from 'lucide-react';
import { getMusicReviewSubmissions, updateSubmissionStatus, markNowPlaying } from '../../lib/adminApi';
import { Submission } from '../../lib/types';

interface AdminQueueProps {
  onReview: (submissionId: string) => void;
}

export const AdminQueue: React.FC<AdminQueueProps> = ({ onReview }) => {
  const [subs, setSubs] = useState<Submission[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const load = async () => {
    const all = await getMusicReviewSubmissions();
    setSubs(all as any);
  };

  useEffect(() => {
    load();
    const ch = supabase.channel('admin-queue')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'music_review_submissions' }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const filtered = subs.filter((s) => {
    if (filter !== 'all' && s.status !== filter) return false;
    if (search && !(`${s.song_title} ${s.artist_name}`.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  const confirmPayment = async (id: string) => {
    const { data } = await supabase.from('music_review_payments').select('id').eq('submission_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (data) await supabase.from('music_review_payments').update({ status: 'confirmed', confirmed_by_admin: true }).eq('id', data.id);
    await supabase.from('music_review_submissions').update({ priority_paid: true }).eq('id', id);
    load();
  };

  return (
    <div className="px-4 pt-4 pb-32 max-w-6xl mx-auto space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#F8FAFC]">Queue Manager</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-2">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search song or artist…"
          className="flex-1 px-3 py-2 rounded-xl bg-[#05070D] border border-[#1a2942] text-[#F8FAFC] outline-none focus:border-[#00B7FF]" />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 rounded-xl bg-[#05070D] border border-[#1a2942] text-[#F8FAFC] outline-none">
          {['all','pending','ai_prechecked','in_queue','now_playing','under_review','review_complete','needs_revision','rejected'].map((s) => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
        </select>
      </div>

      <div className="rounded-3xl border border-[#1a2942] bg-[#0B1426] overflow-hidden">
        <div className="grid grid-cols-[40px_1fr_120px_120px_180px] gap-2 px-3 py-2 text-[10px] text-[#94A3B8] tracking-wider font-bold border-b border-[#1a2942]">
          <div>#</div><div>SONG</div><div>STATUS</div><div>PRIORITY</div><div>ACTIONS</div>
        </div>
        <div className="divide-y divide-[#1a2942]">
          {filtered.map((s) => (
            <div key={s.id} className="grid grid-cols-[40px_1fr_120px_120px_180px] gap-2 px-3 py-2 items-center text-sm hover:bg-[#101827]/40">
              <div className="text-[#00B7FF] font-bold">{s.queue_position ?? '—'}</div>
              <div className="min-w-0">
                <div className="text-[#F8FAFC] font-semibold truncate">{s.song_title}</div>
                <div className="text-[#94A3B8] text-xs truncate">{s.artist_name} • AI {s.ai_precheck_score ?? '—'}</div>
              </div>
              <div className="text-[10px] text-[#FFC857]">{s.status}</div>
              <div className="text-[10px]">
                {s.priority_tier ? (
                  <span className={s.priority_paid ? 'text-[#22C55E]' : 'text-[#FFC857]'}>
                    {s.priority_tier.toUpperCase()} {s.priority_paid ? 'PAID' : 'UNCONFIRMED'}
                  </span>
                ) : <span className="text-[#94A3B8]">—</span>}
              </div>
              <div className="flex flex-wrap items-center gap-1">
                <button title="Set Now Playing" onClick={() => markNowPlaying(s.id)} className="w-7 h-7 rounded-lg bg-[#FFC857]/15 border border-[#FFC857]/40 text-[#FFC857] flex items-center justify-center"><Play size={12} /></button>
                <button title="Open Review" onClick={() => onReview(s.id)} className="w-7 h-7 rounded-lg bg-[#00B7FF]/15 border border-[#00B7FF]/40 text-[#00B7FF] flex items-center justify-center"><Edit3 size={12} /></button>
                {s.priority_tier && !s.priority_paid && (
                  <button title="Confirm Payment" onClick={() => confirmPayment(s.id)} className="w-7 h-7 rounded-lg bg-[#22C55E]/15 border border-[#22C55E]/40 text-[#22C55E] flex items-center justify-center"><DollarSign size={12} /></button>
                )}
                <button title="Remove" onClick={() => updateSubmissionStatus(s.id, 'rejected')} className="w-7 h-7 rounded-lg bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444] flex items-center justify-center"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="py-10 text-center text-[#94A3B8] text-sm">No submissions match.</div>}
        </div>
      </div>
    </div>
  );
};

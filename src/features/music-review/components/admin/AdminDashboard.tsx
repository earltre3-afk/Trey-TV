import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Music, Clock, CheckCircle2, Zap, Mic, Activity } from 'lucide-react';

interface AdminDashboardProps {
  onQueue: () => void;
  onOpenMic: () => void;
  onSettings: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onQueue, onOpenMic, onSettings }) => {
  const [stats, setStats] = useState({
    total: 0, pending: 0, inQueue: 0, completed: 0, paid: 0, openMicActive: 0, avgScore: 0
  });

  useEffect(() => {
    const load = async () => {
      const [tot, pen, qu, comp, paid, om, scores] = await Promise.all([
        supabase.from('music_review_submissions').select('*', { count: 'exact', head: true }),
        supabase.from('music_review_submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('music_review_submissions').select('*', { count: 'exact', head: true }).in('status', ['in_queue', 'ai_prechecked']),
        supabase.from('music_review_submissions').select('*', { count: 'exact', head: true }).eq('status', 'review_complete'),
        supabase.from('music_review_payments').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
        supabase.from('open_mic_queue').select('*', { count: 'exact', head: true }).in('status', ['queued', 'playing']),
        supabase.from('music_review_scores').select('overall_score')
      ]);
      const avg = scores.data?.length ? scores.data.reduce((s: number, x: any) => s + x.overall_score, 0) / scores.data.length : 0;
      setStats({
        total: tot.count || 0, pending: pen.count || 0, inQueue: qu.count || 0,
        completed: comp.count || 0, paid: paid.count || 0, openMicActive: om.count || 0,
        avgScore: Math.round(avg)
      });
    };
    load();
    const i = setInterval(load, 5000);
    return () => clearInterval(i);
  }, []);

  const card = (label: string, value: number | string, icon: React.ReactNode, color: string) => (
    <div className="rounded-2xl border border-[#1a2942] bg-[#0B1426] p-4">
      <div className="flex items-center gap-2 text-[#94A3B8] text-[10px] tracking-wider font-bold">
        <span style={{ color }}>{icon}</span> {label}
      </div>
      <div className="text-3xl font-black mt-1" style={{ color }}>{value}</div>
    </div>
  );

  return (
    <div className="px-4 pt-4 pb-32 max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[#FFC857] text-[10px] tracking-[4px] font-bold">— ADMIN —</div>
          <h1 className="text-3xl font-black text-[#F8FAFC]">Music Review Dashboard</h1>
        </div>
        <button onClick={onSettings} className="px-3 py-2 rounded-2xl border border-[#1a2942] text-[#94A3B8] text-xs hover:border-[#00B7FF]/60">Settings</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {card('TOTAL SUBMISSIONS', stats.total, <Music size={14} />, '#00B7FF')}
        {card('PENDING', stats.pending, <Clock size={14} />, '#94A3B8')}
        {card('IN QUEUE', stats.inQueue, <Activity size={14} />, '#FFC857')}
        {card('COMPLETED', stats.completed, <CheckCircle2 size={14} />, '#22C55E')}
        {card('PAID PRIORITY', stats.paid, <Zap size={14} />, '#A855F7')}
        {card('OPEN MIC ACTIVE', stats.openMicActive, <Mic size={14} />, '#A855F7')}
        {card('AVG SCORE', stats.avgScore || '—', <Activity size={14} />, '#FFC857')}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button onClick={onQueue} className="text-left rounded-3xl border border-[#1a2942] bg-[#0B1426] p-5 hover:border-[#00B7FF]/60 transition">
          <div className="text-[#00B7FF] text-xs tracking-wider font-bold">REVIEW QUEUE MANAGER</div>
          <div className="text-[#F8FAFC] font-bold mt-1">Review, score & publish songs →</div>
        </button>
        <button onClick={onOpenMic} className="text-left rounded-3xl border border-[#1a2942] bg-[#0B1426] p-5 hover:border-[#A855F7]/60 transition">
          <div className="text-[#A855F7] text-xs tracking-wider font-bold">OPEN MIC MODERATION</div>
          <div className="text-[#F8FAFC] font-bold mt-1">Manage Open Mic queue & cleanup →</div>
        </button>
      </div>
    </div>
  );
};

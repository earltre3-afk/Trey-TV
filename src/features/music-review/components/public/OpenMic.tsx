import React, { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mic, Upload, AlertCircle, Loader2, SkipForward } from 'lucide-react';
import { useTreyAuth } from '../../hooks/useTreyAuth';
import { uploadFile, validateAudio, MAX_AUDIO_MB, useSignedAudioUrl } from '../../lib/audio/upload';
import { getDailyCount, incrementDailyCount, getActiveQueueCount, finalizeOpenMicItem, OPEN_MIC_MAX_PER_DAY, OPEN_MIC_MAX_QUEUE } from '../../lib/open-mic/openMicLib';
import { AudioPlayer } from '../shared/AudioPlayer';
import { ChatPanel } from './ChatPanel';

export const OpenMic: React.FC = () => {
  const { user } = useTreyAuth();
  const [queue, setQueue] = useState<any[]>([]);
  const [playing, setPlaying] = useState<any>(null);
  const [dailyCount, setDailyCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const finalizingRef = useRef<Set<string>>(new Set());

  const load = useCallback(async () => {
    const { data } = await supabase.from('open_mic_queue').select('*')
      .in('status', ['queued', 'playing']).order('submitted_at', { ascending: true }).limit(20);
    setQueue(data || []);
    const cur = (data || []).find((x: any) => x.status === 'playing') || null;
    setPlaying(cur);
    if (user) setDailyCount(await getDailyCount(user.id));
  }, [user]);

  useEffect(() => {
    load();
    const ch = supabase.channel('open-mic')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'open_mic_queue' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  // Auto-start next queued track if nothing is playing
  useEffect(() => {
    (async () => {
      if (playing) return;
      const next = queue.find((q) => q.status === 'queued');
      if (!next) return;
      await supabase.from('open_mic_queue').update({
        status: 'playing', started_at: new Date().toISOString()
      }).eq('id', next.id);
    })();
  }, [queue, playing]);

  const onEnded = async () => {
    if (!playing || finalizingRef.current.has(playing.id)) return;
    finalizingRef.current.add(playing.id);
    await finalizeOpenMicItem(playing.id);
  };

  const submit = async () => {
    setError(null);
    if (!user) return setError('Sign in to submit to Open Mic.');
    if (!title.trim()) return setError('Song title is required.');
    if (!file) return setError('Please upload your song.');
    const vErr = validateAudio(file); if (vErr) return setError(vErr);

    const count = await getDailyCount(user.id);
    if (count >= OPEN_MIC_MAX_PER_DAY) return setError(`Daily limit reached (${OPEN_MIC_MAX_PER_DAY}/day).`);
    const qCount = await getActiveQueueCount();
    if (qCount >= OPEN_MIC_MAX_QUEUE) return setError(`Open Mic queue is full (${OPEN_MIC_MAX_QUEUE}/${OPEN_MIC_MAX_QUEUE}). Try again soon.`);

    setSubmitting(true);
    try {
      const up = await uploadFile('open-mic-temp-audio', file, user.id);
      await supabase.from('open_mic_queue').insert({
        user_id: user.id, user_name: user.name,
        song_title: title.trim(),
        artist_name: user.name,
        audio_storage_path: up.path,
        audio_duration: up.duration,
        file_size: up.size,
        status: 'queued',
        submitted_at: new Date().toISOString()
      });
      await incrementDailyCount(user.id);
      setTitle(''); setFile(null);
    } catch (e: any) {
      setError(e.message);
    } finally { setSubmitting(false); }
  };

  const audioUrl = useSignedAudioUrl('open-mic-temp-audio', playing?.audio_storage_path);

  return (
    <div className="px-4 pt-4 pb-32 max-w-6xl mx-auto space-y-4">
      <div className="text-center">
        <div className="text-[#A855F7] text-[11px] tracking-[5px] font-bold">— OPEN MIC ROOM —</div>
        <h1 className="text-3xl font-black text-[#F8FAFC] mt-1">Play For The Community</h1>
        <p className="text-[#94A3B8] text-sm mt-1">{OPEN_MIC_MAX_QUEUE} song queue. {OPEN_MIC_MAX_PER_DAY} submissions per artist per day.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr] gap-4">
        <div className="space-y-3">
          {playing ? (
            <div className="rounded-3xl border border-[#A855F7]/40 bg-[#0B1426] p-3 shadow-[0_0_30px_-10px_rgba(168,85,247,0.6)]">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1 text-[#A855F7] text-[10px] font-bold"><span className="w-2 h-2 rounded-full bg-[#A855F7] animate-pulse" /> PLAYING</span>
                <span className="text-[#94A3B8] text-[10px]">from {playing.user_name}</span>
              </div>
              <AudioPlayer src={audioUrl} title={playing.song_title} artist={playing.artist_name} autoPlay onEnded={onEnded} compact />
            </div>
          ) : (
            <div className="rounded-3xl border border-[#1a2942] bg-[#0B1426] p-6 text-center">
              <Mic size={32} className="text-[#A855F7] mx-auto" />
              <div className="text-[#94A3B8] mt-2 text-sm">Waiting for next song…</div>
            </div>
          )}

          <div className="rounded-3xl border border-[#1a2942] bg-[#0B1426] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[#F8FAFC] font-bold tracking-wide">QUEUE</div>
              <div className="text-[#A855F7] text-xs font-bold">{queue.length}/{OPEN_MIC_MAX_QUEUE}</div>
            </div>
            <div className="space-y-2">
              {queue.filter((q) => q.status === 'queued').map((q, i) => (
                <div key={q.id} className="flex items-center gap-3 p-2 rounded-2xl border border-[#1a2942] bg-[#05070D]/40">
                  <div className="w-6 h-6 rounded-full bg-[#101827] text-[#A855F7] flex items-center justify-center text-xs font-bold">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[#F8FAFC] text-sm font-semibold truncate">{q.song_title}</div>
                    <div className="text-[#94A3B8] text-xs truncate">{q.user_name}</div>
                  </div>
                </div>
              ))}
              {queue.filter((q) => q.status === 'queued').length === 0 && (
                <div className="text-[#94A3B8] text-sm text-center py-4">Queue is open. Submit yours.</div>
              )}
            </div>
          </div>
        </div>

        {/* Submit panel */}
        <div className="rounded-3xl border border-[#A855F7]/40 bg-[#0B1426] p-4 space-y-3 h-fit">
          <div className="flex items-center justify-between">
            <div className="text-[#A855F7] font-bold tracking-wider">SUBMIT TO OPEN MIC</div>
            <div className="text-xs text-[#94A3B8]">{dailyCount}/{OPEN_MIC_MAX_PER_DAY} today</div>
          </div>
          {!user && <div className="text-[#94A3B8] text-sm">Sign in to submit.</div>}
          {user && dailyCount >= OPEN_MIC_MAX_PER_DAY && (
            <div className="text-[#FFC857] text-sm bg-[#FFC857]/10 border border-[#FFC857]/30 rounded-2xl p-3">
              You've hit your daily limit. Come back tomorrow to drop more.
            </div>
          )}
          {user && dailyCount < OPEN_MIC_MAX_PER_DAY && (
            <>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Song title" className="w-full px-3 py-2.5 rounded-xl bg-[#05070D] border border-[#1a2942] text-[#F8FAFC] outline-none focus:border-[#A855F7]" />
              <label className="block">
                <input type="file" accept="audio/*,.mp3,.wav,.m4a,.aac" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                <div className={`flex items-center gap-3 p-3 rounded-xl border-2 border-dashed cursor-pointer ${file ? 'border-[#22C55E]/60 bg-[#22C55E]/5' : 'border-[#1a2942]'}`}>
                  <Upload size={18} className="text-[#A855F7]" />
                  <span className="text-sm text-[#F8FAFC] truncate flex-1">{file ? file.name : `Upload audio (max ${MAX_AUDIO_MB}MB)`}</span>
                </div>
              </label>
              {error && <div className="flex items-center gap-2 text-[#EF4444] text-xs bg-[#EF4444]/10 rounded-xl p-2"><AlertCircle size={14} /> {error}</div>}
              <button onClick={submit} disabled={submitting} className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#A855F7] to-[#00B7FF] text-white font-black tracking-wider disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting ? <><Loader2 className="animate-spin" size={16} /> SUBMITTING</> : <><Mic size={16} /> ADD TO QUEUE</>}
              </button>
            </>
          )}
          <div className="text-[10px] text-[#64748B] leading-relaxed border-t border-[#1a2942] pt-3">
            Open Mic audio is auto-deleted after playback. A lightweight play record stays for history and moderation.
          </div>
        </div>

        <ChatPanel roomType="open_mic" refId={playing?.id || null} />
      </div>
    </div>
  );
};

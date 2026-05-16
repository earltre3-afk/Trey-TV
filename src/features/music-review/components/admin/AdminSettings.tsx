import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { updateMusicReviewSettings } from '../../lib/adminApi';
import { Save, CheckCircle2 } from 'lucide-react';

const KEYS = [
  { key: 'open_mic_max_queue', label: 'Max Open Mic queue size', type: 'number', def: 10 },
  { key: 'open_mic_max_per_day', label: 'Max Open Mic submissions per user / day', type: 'number', def: 2 },
  { key: 'max_audio_file_mb', label: 'Max audio file size (MB)', type: 'number', def: 25 },
  { key: 'max_audio_duration_sec', label: 'Max audio duration (sec)', type: 'number', def: 420 },
  { key: 'allow_anonymous_listen', label: 'Allow signed-out users to listen', type: 'bool', def: true },
  { key: 'ai_listener_enabled', label: 'AI Listener feedback enabled', type: 'bool', def: true },
  { key: 'ai_listener_public', label: 'AI feedback is public', type: 'bool', def: true }
];

export const AdminSettings: React.FC = () => {
  const [vals, setVals] = useState<Record<string, any>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('music_review_settings').select('*');
      const map: Record<string, any> = {};
      (data || []).forEach((r: any) => { map[r.key] = r.value_json; });
      KEYS.forEach((k) => { if (map[k.key] === undefined) map[k.key] = k.def; });
      setVals(map);
    })();
  }, []);

  const save = async () => {
    for (const k of KEYS) await updateMusicReviewSettings(k.key, vals[k.key]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="px-4 pt-4 pb-32 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-black text-[#F8FAFC]">Settings</h1>
      <div className="rounded-3xl border border-[#1a2942] bg-[#0B1426] p-4 space-y-3">
        {KEYS.map((k) => (
          <div key={k.key} className="flex items-center justify-between gap-3 py-2 border-b border-[#1a2942] last:border-0">
            <div>
              <div className="text-[#F8FAFC] font-semibold text-sm">{k.label}</div>
              <div className="text-[#94A3B8] text-[10px] tracking-wider">{k.key}</div>
            </div>
            {k.type === 'bool' ? (
              <input type="checkbox" checked={!!vals[k.key]} onChange={(e) => setVals({ ...vals, [k.key]: e.target.checked })} className="w-5 h-5 accent-[#00B7FF]" />
            ) : (
              <input type="number" value={vals[k.key] ?? ''} onChange={(e) => setVals({ ...vals, [k.key]: parseInt(e.target.value) || 0 })}
                className="w-24 px-3 py-1.5 rounded-xl bg-[#05070D] border border-[#1a2942] text-[#F8FAFC] text-right outline-none focus:border-[#00B7FF]" />
            )}
          </div>
        ))}
        <button onClick={save} className="w-full mt-3 py-3 rounded-2xl bg-gradient-to-r from-[#FFC857] to-[#FFB000] text-[#05070D] font-black tracking-wider flex items-center justify-center gap-2">
          {saved ? <><CheckCircle2 size={16} /> SAVED</> : <><Save size={16} /> SAVE SETTINGS</>}
        </button>
      </div>
    </div>
  );
};

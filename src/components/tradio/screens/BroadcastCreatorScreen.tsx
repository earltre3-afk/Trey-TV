import React, { useState } from 'react';
import {
  ChevronLeft,
  Radio,
  Mic,
  Headphones,
  Music,
  Users,
  Calendar,
  Clock,
  Sparkles,
  Play,
  Settings,
  Tv,
  MessageSquare,
  Star,
} from 'lucide-react';
import { LIVE_RADIO } from '@/data/mockData';

interface Props {
  onClose: () => void;
  onShowBuilder?: () => void;
}

type BroadcastStep = 'format' | 'details' | 'schedule' | 'settings' | 'review';

const FORMATS = [
  { id: 'live-dj', label: 'Live DJ Show', icon: Headphones, desc: 'Mix live on Tradio with your catalog' },
  { id: 'interview', label: 'Interview', icon: MessageSquare, desc: 'Bring guests and talk music' },
  { id: 'music-review', label: 'Music Review', icon: Star, desc: 'Review fan submissions live' },
  { id: 'radio-show', label: 'Radio Show', icon: Radio, desc: 'Full AI-generated show plan' },
  { id: 'open-mic', label: 'Open Mic', icon: Mic, desc: 'Let fans perform and compete' },
  { id: 'listening-party', label: 'Listening Party', icon: Music, desc: 'Stream your new release together' },
];

export default function BroadcastCreatorScreen({ onClose, onShowBuilder }: Props) {
  const [step, setStep] = useState<BroadcastStep>('format');
  const [format, setFormat] = useState<string | null>(null);
  const [broadcastName, setBroadcastName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [maxListeners, setMaxListeners] = useState(500);
  const [allowChat, setAllowChat] = useState(true);
  const [allowCallIns, setAllowCallIns] = useState(false);
  const [recordBroadcast, setRecordBroadcast] = useState(true);

  const back = () => {
    if (step === 'format') onClose();
    else if (step === 'details') setStep('format');
    else if (step === 'schedule') setStep('details');
    else if (step === 'settings') setStep('schedule');
    else setStep('settings');
  };

  const selectedFormat = FORMATS.find((f) => f.id === format);

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-y-auto bg-black">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-3 pb-2 shrink-0">
        <button
          onClick={back}
          className="w-9 h-9 rounded-full bg-white/[0.06] border border-amber-400/20 flex items-center justify-center text-white active:scale-95 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Tv className="w-4 h-4 text-amber-400" />
          <span className="tradio-chrome font-bold tracking-wide text-sm">BROADCAST CREATOR</span>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1.5 mx-5 mb-5 mt-1">
        {(['format', 'details', 'schedule', 'settings', 'review'] as BroadcastStep[]).map((s, i) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              (['format', 'details', 'schedule', 'settings', 'review'] as BroadcastStep[]).indexOf(step) >= i
                ? 'tradio-gold-gradient'
                : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      {/* Step: Format */}
      {step === 'format' && (
        <div className="flex-1 px-5 pb-8 space-y-5 animate-tradio-fade-in">
          <div>
            <p className="text-amber-400/70 text-xs font-semibold tracking-widest mb-2">STEP 1 OF 5</p>
            <h2 className="text-white text-2xl font-black leading-tight">Pick your format</h2>
            <p className="text-white/55 text-sm mt-1">What type of broadcast do you want to create?</p>
          </div>

          <div className="space-y-3">
            {FORMATS.map((f) => {
              const Icon = f.icon;
              const active = format === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    setFormat(f.id);
                    if (f.id === 'radio-show' && onShowBuilder) {
                      onShowBuilder();
                      return;
                    }
                  }}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition text-left active:scale-[0.99] ${
                    active
                      ? 'border-amber-400/50 bg-amber-500/10'
                      : 'border-white/10 bg-white/[0.04] hover:border-amber-400/20'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    active ? 'bg-amber-400/20 border border-amber-400/40' : 'bg-white/[0.06] border border-white/10'
                  }`}>
                    <Icon className={`w-6 h-6 ${active ? 'text-amber-400' : 'text-white/60'}`} />
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${active ? 'text-white' : 'text-white/80'}`}>{f.label}</p>
                    <p className="text-white/45 text-[11px]">{f.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => format && setStep('details')}
            disabled={!format}
            className="w-full tradio-gold-gradient text-black font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-lg shadow-amber-500/30 disabled:opacity-50"
          >
            Next: Details
          </button>
        </div>
      )}

      {/* Step: Details */}
      {step === 'details' && (
        <div className="flex-1 px-5 pb-8 space-y-5 animate-tradio-fade-in">
          <div>
            <p className="text-amber-400/70 text-xs font-semibold tracking-widest mb-2">STEP 2 OF 5</p>
            <h2 className="text-white text-2xl font-black leading-tight">Broadcast details</h2>
          </div>

          <input
            className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-white/30 text-sm font-semibold focus:border-amber-400/40 focus:outline-none transition"
            placeholder="Broadcast name"
            value={broadcastName}
            onChange={(e) => setBroadcastName(e.target.value)}
          />

          <textarea
            className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-white/30 text-sm font-semibold focus:border-amber-400/40 focus:outline-none transition resize-none h-24"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div>
            <label className="text-white/60 text-xs font-bold tracking-wide block mb-2">SELECT STATION</label>
            <div className="space-y-2">
              {LIVE_RADIO.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedStation(r.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition text-left ${
                    selectedStation === r.id
                      ? 'border-amber-400/50 bg-amber-500/10'
                      : 'border-white/10 bg-white/[0.04]'
                  }`}
                >
                  <Radio className={`w-5 h-5 ${selectedStation === r.id ? 'text-amber-400' : 'text-white/40'}`} />
                  <div>
                    <p className="text-white font-bold text-sm">{r.title}</p>
                    <p className="text-white/45 text-[11px]">{r.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep('schedule')}
            className="w-full tradio-gold-gradient text-black font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-lg shadow-amber-500/30"
          >
            Next: Schedule
          </button>
        </div>
      )}

      {/* Step: Schedule */}
      {step === 'schedule' && (
        <div className="flex-1 px-5 pb-8 space-y-5 animate-tradio-fade-in">
          <div>
            <p className="text-amber-400/70 text-xs font-semibold tracking-widest mb-2">STEP 3 OF 5</p>
            <h2 className="text-white text-2xl font-black leading-tight">When do you go live?</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/60 text-xs font-bold tracking-wide block mb-2">DATE</label>
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3.5 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <input
                  type="date"
                  className="bg-transparent text-white text-sm font-semibold flex-1 focus:outline-none"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-white/60 text-xs font-bold tracking-wide block mb-2">TIME</label>
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3.5 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <input
                  type="time"
                  className="bg-transparent text-white text-sm font-semibold flex-1 focus:outline-none"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-white/60 text-xs font-bold tracking-wide block mb-2">OR GO LIVE NOW</label>
            <button
              onClick={() => { setScheduleDate('NOW'); setScheduleTime('NOW'); }}
              className={`w-full py-3 rounded-xl border font-bold text-sm transition ${
                scheduleDate === 'NOW'
                  ? 'border-red-400/50 bg-red-500/15 text-red-300'
                  : 'border-white/10 bg-white/[0.04] text-white/60'
              }`}
            >
              🔴 Go Live Immediately
            </button>
          </div>

          <button
            onClick={() => setStep('settings')}
            className="w-full tradio-gold-gradient text-black font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-lg shadow-amber-500/30"
          >
            Next: Settings
          </button>
        </div>
      )}

      {/* Step: Settings */}
      {step === 'settings' && (
        <div className="flex-1 px-5 pb-8 space-y-5 animate-tradio-fade-in">
          <div>
            <p className="text-amber-400/70 text-xs font-semibold tracking-widest mb-2">STEP 4 OF 5</p>
            <h2 className="text-white text-2xl font-black leading-tight">Broadcast settings</h2>
          </div>

          <div>
            <label className="text-white/60 text-xs font-bold tracking-wide block mb-2">MAX LISTENERS</label>
            <div className="flex gap-2">
              {[100, 250, 500, 1000, 'Unlimited'].map((n) => (
                <button
                  key={String(n)}
                  onClick={() => setMaxListeners(typeof n === 'number' ? n : 99999)}
                  className={`flex-1 py-3 rounded-xl border text-xs font-bold transition ${
                    maxListeners === (typeof n === 'number' ? n : 99999)
                      ? 'border-amber-400/60 text-amber-100 bg-amber-500/15'
                      : 'bg-white/[0.04] border-white/10 text-white/60'
                  }`}
                >
                  {typeof n === 'number' ? n : '∞'}
                </button>
              ))}
            </div>
          </div>

          {([
            [allowChat, setAllowChat, 'Live Chat', '💬'],
            [allowCallIns, setAllowCallIns, 'Call-Ins', '📞'],
            [recordBroadcast, setRecordBroadcast, 'Record for Replay', '📹'],
          ] as [boolean, (v: boolean) => void, string, string][]).map(([val, setter, label, icon]) => (
            <button
              key={label}
              onClick={() => setter(!val)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition ${
                val
                  ? 'border-amber-400/40 bg-amber-500/10 text-white'
                  : 'border-white/10 bg-white/[0.04] text-white/50'
              }`}
            >
              <span className="text-lg">{icon}</span>
              <span className="font-bold text-sm flex-1 text-left">{label}</span>
              <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                val ? 'border-amber-400 bg-amber-400' : 'border-white/30'
              }`}>
                {val && <span className="w-2 h-2 rounded-full bg-black" />}
              </span>
            </button>
          ))}

          <button
            onClick={() => setStep('review')}
            className="w-full tradio-gold-gradient text-black font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-lg shadow-amber-500/30"
          >
            Next: Review
          </button>
        </div>
      )}

      {/* Step: Review */}
      {step === 'review' && (
        <div className="flex-1 px-5 pb-8 space-y-5 animate-tradio-fade-in">
          <div>
            <p className="text-amber-400/70 text-xs font-semibold tracking-widest mb-2">STEP 5 OF 5</p>
            <h2 className="text-white text-2xl font-black leading-tight">Review & Launch</h2>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-amber-400/30 p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600/30 via-slate-900 to-black" />
            <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="relative space-y-3">
              <SummaryRow label="Format" value={selectedFormat?.label || '—'} />
              <SummaryRow label="Name" value={broadcastName || 'Untitled Broadcast'} />
              <SummaryRow label="Station" value={LIVE_RADIO.find((r) => r.id === selectedStation)?.title || '—'} />
              <SummaryRow label="Schedule" value={scheduleDate === 'NOW' ? 'Live now' : scheduleDate && scheduleTime ? `${scheduleDate} at ${scheduleTime}` : 'Not set'} />
              <SummaryRow label="Max Listeners" value={maxListeners >= 99999 ? 'Unlimited' : String(maxListeners)} />
              <SummaryRow label="Chat" value={allowChat ? 'Enabled' : 'Disabled'} />
              <SummaryRow label="Call-Ins" value={allowCallIns ? 'Enabled' : 'Disabled'} />
              <SummaryRow label="Record" value={recordBroadcast ? 'Yes' : 'No'} />
            </div>
          </div>

          <button className="w-full tradio-gold-gradient text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-lg shadow-amber-500/30 text-lg">
            {scheduleDate === 'NOW' ? (
              <>
                <Play className="w-5 h-5" fill="currentColor" />
                Go Live Now
              </>
            ) : (
              <>
                <Calendar className="w-5 h-5" />
                Schedule Broadcast
              </>
            )}
          </button>
          <button
            onClick={() => setStep('format')}
            className="w-full py-3 rounded-2xl border border-white/10 bg-white/[0.04] text-white/80 font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition"
          >
            Start Over
          </button>
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/45 text-[11px] font-semibold tracking-wide">{label}</span>
      <span className="text-white font-bold text-sm text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}

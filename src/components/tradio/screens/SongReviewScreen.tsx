import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  Music,
  Upload,
  CheckCircle,
  Clock,
  Star,
  Shield,
  TrendingUp,
  AlertTriangle,
  Mic,
  Users,
  Zap,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  Radio,
} from 'lucide-react';
import type { AIPrecheck, SongSubmission } from '../services/songReviewTypes';
import { MOCK_SUBMISSIONS, MOCK_PRECHECK, MOCK_REVIEW_RESULT, MOCK_QUEUE } from '../services/songReviewMockData';

interface Props {
  onClose: () => void;
}

type ReviewRoute = 'home' | 'submit' | 'precheck' | 'queue' | 'live' | 'results' | 'admin';

export default function SongReviewScreen({ onClose }: Props) {
  const [route, setRoute] = useState<ReviewRoute>('home');
  const [history, setHistory] = useState<ReviewRoute[]>([]);
  const [currentSubmission, setCurrentSubmission] = useState<SongSubmission | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Simulated form state for submissions
  const [songTitle, setSongTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [genre, setGenre] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const go = (r: ReviewRoute) => {
    setHistory((h) => [...h, route]);
    setRoute(r);
  };
  const back = () => {
    if (history.length) {
      setRoute(history[history.length - 1]);
      setHistory((h) => h.slice(0, -1));
    } else {
      onClose();
    }
  };

  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setCurrentSubmission(MOCK_SUBMISSIONS[0]);
          go('precheck');
          return 100;
        }
        return p + 20;
      });
    }, 400);
  };

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
        <div className="flex items-center gap-2 flex-1">
          <Music className="w-4 h-4 text-amber-400" />
          <span className="tradio-chrome font-bold tracking-wide text-sm">SONG REVIEW</span>
        </div>
        <button
          onClick={() => { setIsAdmin(!isAdmin); go(isAdmin ? 'home' : 'admin'); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold active:scale-95 transition ${
            isAdmin
              ? 'bg-amber-500/15 border border-amber-400/40 text-amber-300'
              : 'bg-white/[0.06] border border-white/10 text-white/60'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          {isAdmin ? 'Exit Admin' : 'Admin'}
        </button>
      </div>

      {/* Home */}
      {route === 'home' && (
        <div className="flex-1 px-5 pb-8 space-y-5 animate-tradio-fade-in">
          {/* Hero */}
          <div className="relative rounded-3xl overflow-hidden border border-amber-400/30 p-6 mt-2">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600/30 via-slate-900 to-black" />
            <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="relative">
              <p className="tradio-chrome text-[11px] font-bold tracking-[0.2em] mb-1">TREY TV EXCLUSIVE</p>
              <h2 className="text-white text-2xl font-black leading-tight">Get Your Song Reviewed</h2>
              <p className="text-white/55 text-sm mt-1 mb-4">
                Submit your track, get an AI pre-check, and queue up for a live review on Tradio.
              </p>
              <button
                onClick={() => go('submit')}
                className="tradio-gold-gradient text-black font-black text-sm px-6 py-3 rounded-full tradio-gold-glow active:scale-[0.98] transition flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Submit Your Song
              </button>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-3">
            <ActionCard icon={Clock} label="View Queue" sub={`${MOCK_QUEUE.length} in line`} onClick={() => go('queue')} />
            <ActionCard icon={Mic} label="Live Room" sub="Review in progress" onClick={() => go('live')} />
            <ActionCard icon={BarChart3} label="My Results" sub="Past reviews" onClick={() => go('results')} />
            <ActionCard icon={Users} label="Open Mic" sub="Coming soon" />
          </div>

          {/* Recent reviews */}
          <div>
            <h3 className="text-white font-bold text-sm mb-3">Recent Reviews</h3>
            <div className="space-y-2">
              {MOCK_SUBMISSIONS.filter((s) => s.status === 'reviewed').map((s) => (
                <div key={s.id} className="tradio-glass rounded-2xl p-3 flex items-center gap-3">
                  {s.coverArt && (
                    <img src={s.coverArt} alt="" className="w-11 h-11 rounded-lg object-cover" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-bold text-sm truncate">{s.songTitle}</p>
                    <p className="text-white/45 text-[11px]">{s.artistName} • {s.genre}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold">
                    REVIEWED
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Submit */}
      {route === 'submit' && (
        <div className="flex-1 px-5 pb-8 space-y-5 animate-tradio-fade-in">
          <div>
            <p className="text-amber-400/70 text-xs font-semibold tracking-widest mb-2">SUBMIT YOUR TRACK</p>
            <h2 className="text-white text-2xl font-black leading-tight">Song Details</h2>
          </div>

          <input
            className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-white/30 text-sm font-semibold focus:border-amber-400/40 focus:outline-none transition"
            placeholder="Song title"
            value={songTitle}
            onChange={(e) => setSongTitle(e.target.value)}
          />
          <input
            className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-white/30 text-sm font-semibold focus:border-amber-400/40 focus:outline-none transition"
            placeholder="Artist name"
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
          />
          <div>
            <label className="text-white/60 text-xs font-bold tracking-wide block mb-2">GENRE</label>
            <div className="flex flex-wrap gap-2">
              {['Hip Hop', 'R&B', 'Trap', 'Trap Soul', 'Pop', 'Afrobeats', 'Gospel Soul'].map((g) => (
                <button
                  key={g}
                  onClick={() => setGenre(g)}
                  className={`px-4 py-2 rounded-full border text-xs font-bold transition ${
                    genre === g
                      ? 'border-amber-400/60 text-amber-100 bg-amber-500/15'
                      : 'bg-white/[0.04] border-white/10 text-white/60'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Upload area */}
          <div className="border-2 border-dashed border-amber-400/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
            {isUploading ? (
              <>
                <div className="w-16 h-16 rounded-full border-4 border-amber-400/30 border-t-amber-400 animate-spin mb-3" />
                <p className="text-white font-bold text-sm">Uploading... {uploadProgress}%</p>
                <div className="w-full h-2 bg-white/10 rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full tradio-gold-gradient rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </>
            ) : (
              <>
                <Upload className="w-10 h-10 text-amber-400/60 mb-3" />
                <p className="text-white font-bold text-sm mb-1">Drop your track here</p>
                <p className="text-white/40 text-xs">MP3, WAV, or FLAC • Max 50MB</p>
              </>
            )}
          </div>

          <button
            onClick={simulateUpload}
            disabled={isUploading}
            className="w-full tradio-gold-gradient text-black font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-lg shadow-amber-500/30 disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            Submit & Run AI Pre-Check
          </button>
        </div>
      )}

      {/* Precheck Results */}
      {route === 'precheck' && (
        <div className="flex-1 px-5 pb-8 space-y-5 animate-tradio-fade-in">
          <div>
            <p className="text-amber-400/70 text-xs font-semibold tracking-widest mb-2">AI PRE-CHECK RESULTS</p>
            <h2 className="text-white text-2xl font-black leading-tight">Analysis Complete</h2>
          </div>

          {/* Score hero */}
          <div className="relative rounded-3xl overflow-hidden border border-amber-400/30 p-6 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-700/30 via-slate-900 to-black" />
            <div className="relative">
              <div className="w-24 h-24 mx-auto rounded-full border-4 border-amber-400/50 flex items-center justify-center mb-3 tradio-amber-glow">
                <span className="text-3xl font-black text-amber-100">{MOCK_PRECHECK.overallScore}</span>
              </div>
              <p className="text-white font-bold">Overall Score</p>
              <p className="text-amber-300/70 text-xs">{MOCK_PRECHECK.genre}</p>
            </div>
          </div>

          {/* Score bars */}
          <div className="space-y-3">
            {([
              ['Mix Quality', MOCK_PRECHECK.mixQuality],
              ['Originality', MOCK_PRECHECK.originality],
              ['Vocal Presence', MOCK_PRECHECK.vocalPresence],
              ['Hit Potential', MOCK_PRECHECK.hitPotential],
            ] as [string, number][]).map(([label, score]) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/60 font-semibold">{label}</span>
                  <span className="text-white font-bold">{score}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full tradio-gold-gradient rounded-full transition-all duration-700"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="tradio-glass rounded-2xl p-4">
            <p className="text-white/80 text-sm leading-relaxed">{MOCK_PRECHECK.summary}</p>
          </div>

          {/* Strengths */}
          <div>
            <h3 className="text-emerald-300 text-xs font-bold tracking-widest mb-2">STRENGTHS</h3>
            <div className="space-y-1.5">
              {MOCK_PRECHECK.strengths.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-white/70 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Improvements */}
          <div>
            <h3 className="text-amber-300 text-xs font-bold tracking-widest mb-2">IMPROVEMENTS</h3>
            <div className="space-y-1.5">
              {MOCK_PRECHECK.improvements.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-white/70 text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  {s}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => go('queue')}
              className="w-full tradio-gold-gradient text-black font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-lg shadow-amber-500/30"
            >
              <TrendingUp className="w-4 h-4" />
              Join the Review Queue
            </button>
            <button
              onClick={() => go('submit')}
              className="w-full py-3 rounded-2xl border border-white/10 bg-white/[0.04] text-white/80 font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition"
            >
              Revise & Resubmit
            </button>
          </div>
        </div>
      )}

      {/* Queue */}
      {route === 'queue' && (
        <div className="flex-1 px-5 pb-8 space-y-5 animate-tradio-fade-in">
          <div>
            <p className="text-amber-400/70 text-xs font-semibold tracking-widest mb-2">REVIEW QUEUE</p>
            <h2 className="text-white text-2xl font-black leading-tight">
              {MOCK_QUEUE.length} songs waiting
            </h2>
          </div>

          <div className="space-y-3">
            {MOCK_QUEUE.map((item) => (
              <div key={item.submission.id} className="tradio-glass rounded-2xl p-3.5 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300 font-black text-sm">
                  {item.position}
                </span>
                {item.submission.coverArt && (
                  <img src={item.submission.coverArt} alt="" className="w-11 h-11 rounded-lg object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-white font-bold text-sm truncate">{item.submission.songTitle}</p>
                  <p className="text-white/45 text-[11px]">{item.submission.artistName}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/60 text-xs font-semibold">{item.estimatedWait}</p>
                  {item.submission.skipTheLine && (
                    <span className="text-amber-300 text-[9px] font-bold">⚡ SKIP</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button className="w-full tradio-gold-gradient text-black font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-lg shadow-amber-500/30">
            <Zap className="w-4 h-4" />
            Skip The Line
          </button>
        </div>
      )}

      {/* Live Room */}
      {route === 'live' && (
        <div className="flex-1 px-5 pb-8 flex flex-col items-center justify-center animate-tradio-fade-in">
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-full bg-red-500/20 border-2 border-red-400/50 flex items-center justify-center animate-pulse">
              <Mic className="w-10 h-10 text-red-400" />
            </div>
            <span className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-600 text-white text-[9px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
            </span>
          </div>
          <h2 className="text-white text-xl font-black text-center mb-2">Live Review In Progress</h2>
          <p className="text-white/55 text-sm text-center mb-6 max-w-xs">
            Trey Trizzy is reviewing submissions live on Tradio. Listen in and hear feedback in real-time.
          </p>
          <div className="flex items-center gap-2 text-white/40 text-xs mb-8">
            <Users className="w-4 h-4" />
            <span>342 listening now</span>
          </div>
          <button className="tradio-gold-gradient text-black font-black px-8 py-3 rounded-full tradio-gold-glow active:scale-[0.98] transition flex items-center gap-2">
            <Radio className="w-4 h-4" />
            Join Live Room
          </button>
        </div>
      )}

      {/* Results */}
      {route === 'results' && (
        <div className="flex-1 px-5 pb-8 space-y-5 animate-tradio-fade-in">
          <div>
            <p className="text-amber-400/70 text-xs font-semibold tracking-widest mb-2">YOUR REVIEW</p>
            <h2 className="text-white text-2xl font-black leading-tight">Review Results</h2>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-emerald-400/30 p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-700/20 via-slate-900 to-black" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full border-2 border-emerald-400/50 flex items-center justify-center tradio-amber-glow">
                  <span className="text-2xl font-black text-emerald-100">{MOCK_REVIEW_RESULT.rating}</span>
                </div>
                <div>
                  <p className="text-white font-black text-lg">Gold Rush</p>
                  <p className="text-white/55 text-sm">Reviewed by {MOCK_REVIEW_RESULT.reviewerName}</p>
                </div>
              </div>
              <p className="text-white/80 text-sm leading-relaxed mb-4">{MOCK_REVIEW_RESULT.feedback}</p>
              <div className="flex flex-wrap gap-2">
                {MOCK_REVIEW_RESULT.highlights.map((h, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 text-[11px] font-bold">
                    {h}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3 mt-4">
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                  MOCK_REVIEW_RESULT.verdict === 'approved'
                    ? 'bg-emerald-500/15 border border-emerald-400/30 text-emerald-300'
                    : MOCK_REVIEW_RESULT.verdict === 'needs-work'
                      ? 'bg-amber-500/15 border border-amber-400/30 text-amber-300'
                      : 'bg-red-500/15 border border-red-400/30 text-red-300'
                }`}>
                  {MOCK_REVIEW_RESULT.verdict === 'approved' ? '✅ APPROVED' : MOCK_REVIEW_RESULT.verdict === 'needs-work' ? '⚠️ NEEDS WORK' : '❌ REJECTED'}
                </span>
                {MOCK_REVIEW_RESULT.playedOnAir && (
                  <span className="px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-200 text-xs font-bold">
                    🎙️ Played On Air
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Feedback */}
          <div className="flex gap-3">
            <button className="flex-1 py-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition">
              <ThumbsUp className="w-4 h-4" /> Helpful
            </button>
            <button className="flex-1 py-3 rounded-2xl border border-white/10 bg-white/[0.04] text-white/60 font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition">
              <ThumbsDown className="w-4 h-4" /> Disagree
            </button>
          </div>
        </div>
      )}

      {/* Admin */}
      {route === 'admin' && isAdmin && (
        <div className="flex-1 px-5 pb-8 space-y-5 animate-tradio-fade-in">
          <div>
            <p className="text-amber-400/70 text-xs font-semibold tracking-widest mb-2">ADMIN DASHBOARD</p>
            <h2 className="text-white text-2xl font-black leading-tight">Song Review Admin</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard label="In Queue" value={MOCK_QUEUE.length} />
            <StatCard label="Reviewed" value={MOCK_SUBMISSIONS.filter((s) => s.status === 'reviewed').length} />
            <StatCard label="Pending" value={MOCK_SUBMISSIONS.filter((s) => s.status === 'pending').length} />
            <StatCard label="Skip Line" value={MOCK_SUBMISSIONS.filter((s) => s.skipTheLine).length} />
          </div>

          <div>
            <h3 className="text-white font-bold text-sm mb-3">Queue Management</h3>
            <div className="space-y-2">
              {MOCK_SUBMISSIONS.map((s) => (
                <div key={s.id} className="tradio-glass rounded-2xl p-3 flex items-center gap-3">
                  {s.coverArt && (
                    <img src={s.coverArt} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-bold text-sm truncate">{s.songTitle}</p>
                    <p className="text-white/45 text-[11px]">{s.artistName} • Score: {s.precheck?.overallScore ?? '—'}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    s.status === 'reviewed' ? 'bg-emerald-500/15 text-emerald-300'
                    : s.status === 'in-queue' ? 'bg-amber-500/15 text-amber-300'
                    : 'bg-white/10 text-white/60'
                  }`}>
                    {s.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionCard({ icon: Icon, label, sub, onClick }: { icon: React.ElementType; label: string; sub: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="tradio-glass rounded-2xl p-4 flex flex-col items-start gap-2 text-left active:scale-[0.98] transition"
    >
      <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
        <Icon className="w-5 h-5 text-amber-400" />
      </div>
      <p className="text-white font-bold text-sm">{label}</p>
      <p className="text-white/45 text-[11px]">{sub}</p>
    </button>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="tradio-glass rounded-2xl p-4 text-center">
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-white/45 text-xs font-semibold">{label}</p>
    </div>
  );
}

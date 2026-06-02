import React from 'react';
import { useParams, useNavigate } from '../hooks/router-compat';
import { LogOut, Pause, RotateCcw, Camera, Crosshair, Link as LinkIcon } from 'lucide-react';
import { TranceShell } from '../components/shell';
import { TranceStatRing, cn } from '../components/primitives';
import { IMG } from '../data/devFixtures';
import {
  trancePoseTrackingService,
  tranceRoutineService,
  tranceSessionService,
  tranceScoringService,
  tranceLeaderboardService,
  tranceBadgeService
} from '../services';
import { TRANCE_ROUTES } from '../routes/manifest';
import { useTranceIdentity } from '../hooks/useTranceIdentity';
import { shouldUseFixtures } from '../services/config';

const LearnModeScreen: React.FC = () => {
  const { routineId } = useParams();
  const navigate = useNavigate();
  const { identity, loading: authLoading } = useTranceIdentity();

  const [r, setR] = React.useState<any>(null);
  const [attempt, setAttempt] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;

    async function init() {
      try {
        const details = await tranceRoutineService.getRoutineDetails(routineId || 'rt001');
        if (active && details) {
          setR(details);
        }
      } catch (err) {
        console.error('Failed to load routine details:', err);
      } finally {
        if (active) setLoading(false);
      }
    }

    init();
    return () => {
      active = false;
    };
  }, [routineId]);

  // Create attempt on mount/identity ready
  React.useEffect(() => {
    let active = true;
    const userId = identity?.authUserId;
    if (authLoading || !userId || !r?.id) return;

    async function startAttempt() {
      try {
        const att = await tranceSessionService.createSessionAttempt(r.id, userId as string, 'Learn');
        if (active) {
          setAttempt(att);
        }
      } catch (err) {
        console.error('Failed to create session attempt:', err);
      }
    }

    startAttempt();
    return () => {
      active = false;
    };
  }, [authLoading, identity, r]);

  // Placeholder pose session lifecycle — wire real AI later
  React.useEffect(() => {
    trancePoseTrackingService.startPoseSession(null);
    return () => { void trancePoseTrackingService.stopPoseSession(null); };
  }, []);

  const handleComplete = async () => {
    if (shouldUseFixtures()) {
      navigate(TRANCE_ROUTES.results(r.id, 'att-mock'));
      return;
    }
    if (!attempt?.id || !identity?.authUserId) {
      navigate(TRANCE_ROUTES.home);
      return;
    }
    try {
      // Create a controlled verification test score payload
      const sessionScore = {
        routineId: r.id,
        routineTitle: r.title,
        cover: r.cover,
        difficulty: r.difficulty,
        total: 92, // overall score
        accuracy: 94,
        timing: 90,
        energy: 92,
        sync: 94,
        rank: 'S',
        newPB: true,
      };

      // Save score row in database
      const saved = await tranceScoringService.saveScore(sessionScore, attempt.id, identity.authUserId);

      // Update session attempt status
      await tranceSessionService.updateAttemptStatus(attempt.id, 'ready');

      // Submit score to choreographer leaderboard (overall score * 1000)
      await tranceLeaderboardService.submitScoreToLeaderboard({
        routineId: r.id,
        userId: identity.authUserId,
        score: Math.round(saved.total * 1000),
        accuracy: saved.accuracy,
        streak: 1,
      });

      // Unlock a badge for completing their first TRANCE session
      await tranceBadgeService.unlockBadge(identity.authUserId, 'first_session');

      // Navigate to results page with dynamic parameters
      navigate(TRANCE_ROUTES.results(r.id, attempt.id));
    } catch (err) {
      console.error('Failed to save score and complete session:', err);
      navigate(TRANCE_ROUTES.home);
    }
  };

  if (loading || authLoading || !r) {
    return (
      <TranceShell hideNav>
        <div className="min-h-screen grid place-items-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-t-fuchsia-500 border-white/10 animate-spin mx-auto mb-4" />
            <div className="text-xs text-white/50 uppercase tracking-widest">Loading Routine...</div>
          </div>
        </div>
      </TranceShell>
    );
  }

  const sections = ['INTRO', 'VERSE 1', 'PRE CHORUS'];

  return (
    <TranceShell hideNav pad={false}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4">
        <div className="flex items-center gap-2"><Crosshair className="w-5 h-5 text-cyan-300" /><div><div className="text-[9px] text-white/50 uppercase">Dance Session</div><div className="text-xs font-black text-cyan-300 uppercase">Learn Mode</div></div></div>
        <div className="font-black text-2xl tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-cyan-400">TRANCE</div>
        <div className="text-right"><div className="text-[9px] text-yellow-300 uppercase">Session Score</div><div className="text-lg font-black text-yellow-300">12,350</div></div>
      </div>

      {/* Progress timeline */}
      <div className="mx-4 mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
        <div className="flex items-center gap-3 mb-2"><img src={r.cover || IMG.r4} className="w-9 h-9 rounded-lg object-cover" alt="" /><div className="flex-1"><div className="text-sm font-black text-white uppercase">{r.title}</div><div className="text-[10px] text-white/50">{r.choreographerName} <span className="text-fuchsia-300">{r.difficulty}</span></div></div><div className="text-right"><div className="text-lg font-black text-white">01:28</div><div className="text-[8px] text-white/50 uppercase">Remaining</div></div></div>
        <div className="flex items-center justify-between text-[9px] font-bold text-white/50 uppercase mb-1">{sections.map((s, i) => <span key={s} className={i === 1 ? 'text-white' : ''}>{s}</span>)}</div>
        <div className="relative h-1.5 rounded-full bg-white/10"><div className="absolute h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500" style={{ width: '45%' }} /><div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white" style={{ left: '45%' }} /></div>
      </div>

      {/* Camera canvas placeholder */}
      <div className="relative mx-4 mt-3 rounded-2xl overflow-hidden border border-fuchsia-400/30" style={{ minHeight: 360 }}>
        <img src={IMG.maleB} className="w-full h-[360px] object-cover" alt="practice" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
        {/* Pose skeleton overlay placeholder */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <g stroke="#22d3ee" strokeWidth="0.5" fill="#22d3ee" opacity="0.8" style={{ filter: 'drop-shadow(0 0 2px #22d3ee)' }}>
            {[[50, 22], [42, 35], [58, 35], [38, 50], [62, 50], [45, 55], [55, 55], [42, 72], [58, 72], [40, 90], [60, 90]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.1" />)}
            <line x1="50" y1="22" x2="50" y2="55" /><line x1="42" y1="35" x2="58" y2="35" /><line x1="42" y1="35" x2="38" y2="50" /><line x1="58" y1="35" x2="62" y2="50" /><line x1="45" y1="55" x2="42" y2="72" /><line x1="55" y1="55" x2="58" y2="72" /><line x1="42" y1="72" x2="40" y2="90" /><line x1="58" y1="72" x2="60" y2="90" />
          </g>
        </svg>
        <span className="absolute top-2 left-2 text-[8px] bg-black/60 px-2 py-1 rounded text-cyan-300 uppercase">AI Pose Overlay · Placeholder</span>

        {/* Stat stack left */}
        <div className="absolute top-3 left-3 space-y-2 hidden sm:block">
          <div className="rounded-2xl border border-cyan-400/30 bg-black/50 backdrop-blur p-2 text-center"><div className="text-[9px] text-white/60 uppercase">Timing</div><div className="text-[10px] font-black text-cyan-300 uppercase mb-1">Perfect</div><TranceStatRing value={98} size={64} color="#22d3ee" big={<span className="text-base font-black text-white">98%</span>} /></div>
          <div className="rounded-2xl border border-teal-400/30 bg-black/50 backdrop-blur p-2 text-center"><div className="text-[9px] text-white/60 uppercase flex items-center justify-center gap-1">Sync <LinkIcon className="w-2.5 h-2.5" /></div><TranceStatRing value={94} size={56} color="#2dd4bf" big={<span className="text-sm font-black text-white">94%</span>} /></div>
          <div className="rounded-2xl border border-purple-400/30 bg-black/50 backdrop-blur p-2 text-center"><div className="text-[9px] text-white/60 uppercase">Combo</div><div className="text-2xl font-black text-purple-300">x23</div><div className="text-[8px] text-white/40">Best: x45</div></div>
        </div>

        {/* Next move ghost card right */}
        <div className="absolute bottom-3 right-3 w-32 rounded-2xl border border-fuchsia-400/40 bg-black/60 backdrop-blur p-3 text-center">
          <div className="text-[9px] font-black text-purple-300 uppercase mb-1">Next Move</div>
          <img src={IMG.maleA} className="w-full h-20 object-cover rounded-lg opacity-70" alt="ghost" />
          <div className="text-[10px] font-bold text-white uppercase mt-1">Step Right Arm Wave</div>
        </div>
      </div>

      {/* Beat countdown + next moves */}
      <div className="mx-4 mt-3 rounded-2xl border border-fuchsia-400/30 bg-fuchsia-500/5 p-3 flex items-center gap-3">
        <div className="text-center"><div className="text-[9px] font-black text-fuchsia-300 uppercase">Next Move In</div><div className="text-3xl font-black text-white leading-none">3</div><div className="text-[9px] text-fuchsia-300 uppercase">Beats</div></div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className={cn('shrink-0 w-14 rounded-xl border p-1 text-center', n === 1 ? 'border-cyan-400/60 bg-cyan-500/10' : 'border-white/10 bg-white/[0.03]')}>
              <div className={cn('w-10 h-10 mx-auto rounded-lg grid place-items-center text-xs font-black', n === 1 ? 'text-cyan-300' : 'text-white/40')}>P{n}</div>
              <div className="text-[9px] text-white/50">{n}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Beat waveform */}
      <div className="mx-4 mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 flex items-center gap-3">
        <div className="text-center shrink-0"><div className="text-[8px] text-white/50 uppercase">Beat</div><div className="text-xl font-black text-white">{r.bpm}</div><div className="text-[8px] text-white/50 uppercase">BPM</div></div>
        <div className="flex-1 flex items-center gap-0.5 h-10 overflow-hidden">
          {Array.from({ length: 60 }).map((_, i) => <div key={i} className="flex-1 rounded-full" style={{ height: `${20 + Math.abs(Math.sin(i / 3)) * 70}%`, background: i < 32 ? 'linear-gradient(to top,#d946ef,#22d3ee)' : 'rgba(255,255,255,0.15)' }} />)}
        </div>
      </div>

      {/* Controls */}
      <div className="mx-4 mt-3 mb-6 flex items-center justify-between gap-2">
        <button onClick={() => navigate(-1)} className="flex-1 rounded-2xl border border-white/10 bg-white/[0.03] py-3 flex flex-col items-center gap-1 text-white/70"><LogOut className="w-5 h-5" /><span className="text-[9px] uppercase">Exit</span></button>
        <button className="flex-1 rounded-2xl border border-white/10 bg-white/[0.03] py-3 flex flex-col items-center gap-1 text-white/70"><Pause className="w-5 h-5" /><span className="text-[9px] uppercase">Pause</span></button>
        <button onClick={handleComplete} className="w-16 h-16 rounded-full grid place-items-center bg-gradient-to-br from-fuchsia-500 via-purple-600 to-cyan-500 border-2 border-white/20 shadow-[0_0_24px_-2px_rgba(217,70,239,0.7)]"><span className="text-white font-black text-xl">T</span></button>
        <button className="flex-1 rounded-2xl border border-white/10 bg-white/[0.03] py-3 flex flex-col items-center gap-1 text-white/70"><RotateCcw className="w-5 h-5" /><span className="text-[9px] uppercase">Replay</span></button>
        <button className="flex-1 rounded-2xl border border-white/10 bg-white/[0.03] py-3 flex flex-col items-center gap-1 text-white/70"><Camera className="w-5 h-5" /><span className="text-[9px] uppercase">Camera</span></button>
      </div>
    </TranceShell>
  );
};

export default LearnModeScreen;

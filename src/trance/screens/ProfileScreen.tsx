import React from 'react';
import { useNavigate } from '../hooks/router-compat';
import { Crown, Flame, Trophy, Zap, ChevronRight, Heart, Star, Globe, ArrowUp, Share2, Settings } from 'lucide-react';
import { TranceShell, TranceTopBar, TranceLogo } from '../components/shell';
import { TranceGlassCard, TranceStatRing, TranceBadge, GradientButton, cn, VerifiedTick } from '../components/primitives';
import { badges as fixtureBadges, recentScores as fixtureScores, IMG } from '../data/devFixtures';
import { TRANCE_ROUTES } from '../routes/manifest';
import { useAuth } from '../auth/AuthContext';
import { TranceAccountButton } from '../auth/TranceAccountButton';
import { tranceBadgeService, tranceScoringService } from '../services';
import { shouldUseFixtures } from '../services/config';

const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { effectiveProfile: dancer, isAuthed } = useAuth();
  
  const [profileBadges, setProfileBadges] = React.useState<any[]>([]);
  const [profileScores, setProfileScores] = React.useState<any[]>([]);
  const [loadingDb, setLoadingDb] = React.useState(true);

  const favorites = [
    { title: 'No Limit', status: 'MASTERED', img: IMG.r2, color: 'text-cyan-300' },
    { title: 'Elevate', status: 'MASTERED', img: IMG.r4, color: 'text-cyan-300' },
    { title: 'Different Mode', status: 'IN PROGRESS', img: IMG.r3, color: 'text-yellow-300' },
  ];

  React.useEffect(() => {
    let active = true;
    if (shouldUseFixtures()) {
      setProfileBadges(fixtureBadges);
      setProfileScores(fixtureScores);
      setLoadingDb(false);
      return;
    }

    async function loadDbData() {
      if (!dancer?.id) return;
      try {
        setLoadingDb(true);
        const [userBadges, userScores] = await Promise.all([
          tranceBadgeService.getBadges(dancer.id),
          tranceScoringService.getRecentScores(dancer.id)
        ]);
        if (active) {
          setProfileBadges(userBadges);
          setProfileScores(userScores);
        }
      } catch (err) {
        console.error('Failed to load profile DB data:', err);
      } finally {
        if (active) setLoadingDb(false);
      }
    }
    loadDbData();
    return () => { active = false; };
  }, [dancer?.id]);

  return (
    <TranceShell>
      <TranceTopBar
        title={<TranceLogo size="sm" />}
        right={<div className="flex items-center gap-2"><button className="w-10 h-10 rounded-full border border-white/15 bg-white/5 grid place-items-center"><Share2 className="w-4 h-4" /></button><TranceAccountButton /></div>}
      />

      {/* Hero */}
      <TranceGlassCard glow="magenta" className="overflow-hidden mb-3">
        <div className="relative">
          <img src={dancer.cover} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
          <div className="relative p-4">
            {dancer.memberNumber === 1
              ? <div className="text-[10px] font-black text-yellow-300 uppercase tracking-widest mb-1">First signed up. First to TRANCE.</div>
              : <div className="text-[10px] font-black text-fuchsia-300 uppercase tracking-widest mb-1">{isAuthed ? 'Trey TV Verified Trancer' : 'Preview Profile · Sign in to claim yours'}</div>}
            <div className="flex items-center gap-2"><h1 className="text-4xl font-black text-white uppercase">{dancer.displayName}</h1>{dancer.verified && <VerifiedTick />}{dancer.memberNumber === 1 && <Crown className="w-5 h-5 text-yellow-300 fill-yellow-300/40" />}</div>
            <div className="text-fuchsia-400 font-bold">{dancer.handle}</div>
            <p className="text-xs text-white/60 mt-1 max-w-[220px]">{dancer.bio}</p>
          </div>
        </div>
      </TranceGlassCard>

      {/* Pioneer + level */}
      <div className="grid md:grid-cols-2 gap-3 mb-3">
        <TranceGlassCard glow="gold" className="p-3 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400/30 to-amber-600/20 border border-yellow-400/60 grid place-items-center"><Crown className="w-6 h-6 text-yellow-300" /></div>
          <div className="flex-1"><div className="font-black text-white uppercase text-sm">Trance Pioneer</div><div className="text-[10px] text-yellow-400">Badge of Honor</div></div>
          <div className="text-right"><div className="text-xl font-black text-yellow-300">#001</div><div className="text-[9px] text-white/50 uppercase">1st Member</div></div>
        </TranceGlassCard>
        <TranceGlassCard glow="purple" className="p-3 flex items-center gap-3">
          <div><div className="text-[9px] text-white/50 uppercase">Dancer Level</div><div className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-cyan-400">LV. {dancer.level}</div><div className="text-[10px] font-bold text-white uppercase">{dancer.rankTitle}</div></div>
          <div className="ml-auto"><TranceStatRing value={dancer.xp} max={dancer.xpToNext} size={80} color="#22d3ee" big={<div className="text-center"><div className="text-[8px] text-white/50">XP</div><div className="text-sm font-black text-white">{(dancer.xp / 1000).toFixed(1)}K</div></div>} /></div>
        </TranceGlassCard>
      </div>

      {/* Stat strip */}
      <TranceGlassCard className="p-3 grid grid-cols-4 divide-x divide-white/10 mb-4">
        {([[Flame, dancer.dayStreak, 'Day Streak', 'text-orange-400'], [Star, dancer.totalPoints.toLocaleString(), 'Total Points', 'text-purple-300'], [Zap, dancer.routinesMastered, 'Mastered', 'text-cyan-300'], [Trophy, `#${dancer.globalRank}`, 'Global Rank', 'text-yellow-300']] as [any, any, string, string][]).map(([Icon, v, l, c], i) => (
          <div key={i} className="flex flex-col items-center"><Icon className={cn('w-4 h-4 mb-1', c)} /><div className="text-lg font-black text-white leading-none">{v}</div><div className="text-[8px] text-white/50 uppercase">{l}</div></div>
        ))}
      </TranceGlassCard>

      {/* Badges + favorites */}
      <div className="grid md:grid-cols-2 gap-3 mb-3">
        <TranceGlassCard glow="gold" className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-yellow-300 uppercase text-sm">Badges Earned</h3>
            <span className="text-xs text-white/50 font-bold">
              {profileBadges.filter((b) => b.earned).length}/{profileBadges.length || 18}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {profileBadges.slice(0, 8).map((b) => (
              <TranceBadge key={b.id} badge={b} size="sm" />
            ))}
            {profileBadges.length === 0 && (
              <div className="col-span-4 text-center py-4 text-xs text-white/40 font-bold">No badges unlocked yet. Keep training!</div>
            )}
          </div>
          <button className="w-full text-center text-xs font-bold text-fuchsia-400 mt-3 flex items-center justify-center gap-1">VIEW ALL BADGES <ChevronRight className="w-3 h-3" /></button>
        </TranceGlassCard>

        <TranceGlassCard glow="magenta" className="p-4">
          <div className="flex items-center justify-between mb-3"><h3 className="font-black text-fuchsia-300 uppercase text-sm">Favorite Routines</h3><span className="text-xs text-white/50">VIEW ALL</span></div>
          <div className="space-y-2">{favorites.map((f) => (
            <div key={f.title} className="flex items-center gap-3 p-2 rounded-xl border border-white/10 bg-white/[0.03]">
              <img src={f.img} className="w-10 h-10 rounded-lg object-cover" alt={f.title} />
              <div className="flex-1"><div className="font-black text-white uppercase text-sm">{f.title}</div><div className="text-[10px] text-white/50">Trey Trizzy</div></div>
              <span className={cn('text-[9px] font-black uppercase', f.color)}>{f.status}</span>
              <Heart className="w-4 h-4 text-fuchsia-400 fill-fuchsia-400" />
            </div>
          ))}</div>
        </TranceGlassCard>
      </div>

      {/* Recent scores + spotlight */}
      <div className="grid md:grid-cols-2 gap-3 mb-4">
        <TranceGlassCard glow="purple" className="p-4">
          <div className="flex items-center justify-between mb-3"><h3 className="font-black text-purple-300 uppercase text-sm">Recent Session Scores</h3><span className="text-xs text-white/50">VIEW ALL</span></div>
          <div className="space-y-2">
            {profileScores.slice(0, 5).map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-2 rounded-xl border border-white/10 bg-white/[0.03]">
                <img src={s.cover || IMG.r1} className="w-9 h-9 rounded-lg object-cover" alt={s.routineTitle} />
                <div className="flex-1"><div className="font-bold text-white text-sm truncate">{s.routineTitle}</div><div className="text-[10px] text-white/50">{s.difficulty}</div></div>
                <div className="text-right"><div className="text-[8px] text-white/50 uppercase">Score</div><div className="font-black text-white">{s.total}%</div></div>
                <div className="text-right w-16"><div className="text-[10px] text-white/50 truncate">{s.when}</div>{s.newPB && <div className="text-[9px] font-black text-cyan-300">NEW PB</div>}</div>
              </div>
            ))}
            {profileScores.length === 0 && (
              <div className="text-center py-6 text-xs text-white/40 font-bold">No sessions completed yet. Let's dance!</div>
            )}
          </div>
        </TranceGlassCard>

        <TranceGlassCard glow="gold" className="p-4 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2"><Star className="w-4 h-4 text-yellow-300 fill-yellow-300/40" /><h3 className="font-black text-yellow-300 uppercase text-sm">Spotlight</h3></div>
          <h2 className="text-3xl font-black text-white">RANK UP!</h2>
          <p className="text-xs text-white/60 mb-3">You're moving different.</p>
          <div className="flex items-center justify-between">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-fuchsia-600/40 to-purple-600/20 border border-fuchsia-400/40 grid place-items-center"><Crown className="w-10 h-10 text-fuchsia-300" /></div>
            <div className="text-right"><div className="text-2xl font-black text-white/40">#108</div><div className="text-[8px] text-white/40 uppercase">Last month</div><ArrowUp className="w-5 h-5 text-fuchsia-400 ml-auto my-1" /><div className="text-3xl font-black text-fuchsia-400">#{dancer.globalRank}</div><div className="text-[8px] text-fuchsia-300 uppercase">This month</div></div>
          </div>
          <div className="text-[10px] text-white/60 flex items-center gap-1 mt-2"><Globe className="w-3 h-3" />TOP 1% OF TRANCERS WORLDWIDE</div>
        </TranceGlassCard>
      </div>

      {/* Entry points */}
      <div className="grid grid-cols-3 gap-2">
        {[['Crew', '#22d3ee'], ['Challenges', '#d946ef'], ['Rewards', '#facc15']].map(([l, c]) => (
          <button key={l} onClick={() => navigate(TRANCE_ROUTES.explore)} className="rounded-2xl border border-white/10 bg-white/[0.03] py-4 font-black uppercase text-sm" style={{ color: c }}>{l}</button>
        ))}
      </div>
    </TranceShell>
  );
};

export default ProfileScreen;

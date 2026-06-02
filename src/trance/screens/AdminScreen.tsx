import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle2, XCircle, Search, RefreshCw, Star, Ban, Music } from 'lucide-react';
import { TranceShell, TranceTopBar, TranceLogo } from '../components/shell';
import { TranceGlassCard, GradientButton, cn } from '../components/primitives';

interface ReportItem {
  id: string;
  type: 'routine' | 'cheat' | 'copyright';
  target: string;
  reporter: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
}

export const AdminScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'moderation' | 'verification' | 'cheats'>('moderation');
  const [searchQuery, setSearchQuery] = useState('');
  
  const reports: ReportItem[] = [
    { id: 'rep1', type: 'routine', target: 'Euphoria Remix', reporter: '@dancer_x', reason: 'Unsafe movement suggestion on count 8', status: 'pending' },
    { id: 'rep2', type: 'copyright', target: 'Slow Burn Heels Routine', reporter: 'Warner Music Group', reason: 'Unlicensed background audio track', status: 'pending' },
    { id: 'rep3', type: 'cheat', target: '@speedy_stepper (rt002)', reporter: 'AntiCheat AutoFlag', reason: 'Pose match score is mathematical outlier (100% precision with 0.1ms latency)', status: 'pending' },
    { id: 'rep4', type: 'routine', target: 'Code Red Solo Run', reporter: '@mod_ops', reason: 'Low lighting makes pose estimation dangerous', status: 'resolved' }
  ];

  const choreoRequests = [
    { id: 'req1', name: 'Devon Miles', handle: '@devonmoves', bio: 'Former backup dancer for TRUNO. Specializes in Popping.', status: 'pending' },
    { id: 'req2', name: 'Sarah Vance', handle: '@sarahvance', bio: 'Instructor at LA Movement Centre. Afrobeats choreographer.', status: 'pending' }
  ];

  return (
    <TranceShell>
      <TranceTopBar
        title={<div className="flex items-center gap-2 text-yellow-400"><Shield className="w-5 h-5" /><span className="font-black text-sm">TRANCE CONTROL</span></div>}
        right={<TranceLogo size="sm" />}
      />

      {/* Admin stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <TranceGlassCard glow="purple" className="p-3 text-center">
          <div className="text-xl font-black text-white">3</div>
          <div className="text-[9px] text-purple-300 uppercase">Pending Audits</div>
        </TranceGlassCard>
        <TranceGlassCard glow="magenta" className="p-3 text-center">
          <div className="text-xl font-black text-white">2</div>
          <div className="text-[9px] text-fuchsia-300 uppercase">Verify Requests</div>
        </TranceGlassCard>
        <TranceGlassCard glow="cyan" className="p-3 text-center">
          <div className="text-xl font-black text-white">99.8%</div>
          <div className="text-[9px] text-cyan-300 uppercase">System Integrity</div>
        </TranceGlassCard>
      </div>

      {/* Admin tabs */}
      <div className="flex border border-white/10 bg-white/[0.03] rounded-2xl p-1 mb-4">
        {(['moderation', 'verification', 'cheats'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={cn(
              'flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition',
              activeTab === t
                ? 'bg-gradient-to-r from-purple-500/30 to-fuchsia-500/20 border border-fuchsia-400/40 text-white'
                : 'text-white/50 hover:text-white/80'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'moderation' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-black text-white uppercase text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-fuchsia-400" /> Moderation Log
            </h3>
            <button className="text-xs text-white/50 flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Refresh</button>
          </div>
          
          {reports.map((r) => (
            <TranceGlassCard key={r.id} className={cn('p-4 border-l-4', r.status === 'resolved' ? 'border-l-emerald-500' : 'border-l-fuchsia-500')}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className={cn('text-[9px] font-black uppercase px-2 py-0.5 rounded mr-2', r.type === 'copyright' ? 'bg-yellow-500/10 text-yellow-300' : r.type === 'cheat' ? 'bg-cyan-500/10 text-cyan-300' : 'bg-fuchsia-500/10 text-fuchsia-300')}>
                    {r.type}
                  </span>
                  <span className="font-bold text-white text-sm">{r.target}</span>
                </div>
                <span className="text-[10px] text-white/40 uppercase">{r.status}</span>
              </div>
              <p className="text-xs text-white/70 mb-3">Reason: {r.reason}</p>
              <div className="flex justify-between items-center text-[10px] text-white/40">
                <span>Reported by {r.reporter}</span>
                {r.status === 'pending' && (
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button className="flex items-center gap-1 text-fuchsia-400 hover:text-fuchsia-300 font-bold">
                      <XCircle className="w-3.5 h-3.5" /> Flag / Restrict
                    </button>
                  </div>
                )}
              </div>
            </TranceGlassCard>
          ))}
        </div>
      )}

      {activeTab === 'verification' && (
        <div className="space-y-3">
          <h3 className="font-black text-white uppercase text-sm mb-2 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-300" /> Choreographer Applications
          </h3>
          {choreoRequests.map((req) => (
            <TranceGlassCard key={req.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-white">{req.name}</h4>
                  <div className="text-xs text-fuchsia-300">{req.handle}</div>
                </div>
                <div className="flex gap-2">
                  <GradientButton variant="gold" className="text-xs px-3 py-1.5">Verify</GradientButton>
                  <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10">Decline</button>
                </div>
              </div>
              <p className="text-xs text-white/70 mt-2">{req.bio}</p>
            </TranceGlassCard>
          ))}
        </div>
      )}

      {activeTab === 'cheats' && (
        <TranceGlassCard glow="cyan" className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Ban className="w-4 h-4 text-cyan-300" />
            <h3 className="font-black text-white uppercase text-sm">Anti-Cheat Performance Audits</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/50 uppercase">
                  <th className="pb-2">User</th>
                  <th className="pb-2">Routine</th>
                  <th className="pb-2">Accuracy</th>
                  <th className="pb-2">Latencies</th>
                  <th className="pb-2 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                <tr>
                  <td className="py-2 text-fuchsia-300">@speedy_stepper</td>
                  <td className="py-2">Outer Body</td>
                  <td className="py-2 text-yellow-300">100%</td>
                  <td className="py-2">Flat 0.1ms</td>
                  <td className="py-2 text-right">
                    <button className="text-fuchsia-400 font-bold hover:underline">Restrict Profile</button>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-fuchsia-300">@jaxx_double_tap</td>
                  <td className="py-2">Euphoria</td>
                  <td className="py-2 text-yellow-300">99.8%</td>
                  <td className="py-2">Variance 14ms</td>
                  <td className="py-2 text-right">
                    <button className="text-white/40 font-bold hover:underline mr-2">Dismiss</button>
                    <button className="text-fuchsia-400 font-bold hover:underline">Flag</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </TranceGlassCard>
      )}
    </TranceShell>
  );
};

export default AdminScreen;

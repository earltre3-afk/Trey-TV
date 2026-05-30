import React, { useState } from 'react';
import { Users, Headphones, Star, Calendar, Gem, MoreHorizontal, Pin, X, Music, MessageCircle, Sparkles, Plus, Smile, Image as ImgIcon } from 'lucide-react';
import { TopBar, GlassCard, Chip, VerifiedBadge, Waveform } from '../ui';
import { FAN_VOTES, IMG, LISTENER_REQUESTS, TOP_FAN_LEADERBOARD } from '../data';

const MESSAGES = [
  { user: 'Kiana Lane', badge: 'Top Fan', badgeColor: 'text-amber-300', time: '9:41 PM', msg: 'This new track hits different live 🔥🔥🔥', reactions: '24', heart: 'pink', img: IMG.kianaLane },
  { user: 'JAYE.', badge: 'OG Fan', badgeColor: 'text-cyan-300', time: '9:42 PM', msg: "Been here since the SoundCloud days. Proud of how far you've come, Trey! 🙌", reactions: '18', heart: 'orange', img: IMG.noahKade },
  { user: 'Darius Cole', badge: 'Mod', badgeColor: 'text-purple-300', time: '9:43 PM', msg: 'Y\'all already know "Falling For You" goes crazy at 2AM 🕺', reactions: '16', heart: 'pink', img: IMG.dariusCole },
  { user: 'Luna Rae', badge: 'Rising Star', badgeColor: 'text-fuchsia-300', time: '9:44 PM', msg: 'Drop that unreleased one at the end 🙏🙏', reactions: '9', heart: 'orange', img: IMG.milaRain },
];

const REACTIONS = [
  { rank: 1, emoji: '🔥', count: '1.2K' },
  { rank: 2, emoji: '❤️', count: '842' },
  { rank: 3, emoji: '💜', count: '563' },
  { rank: 4, emoji: '🙌', count: '331' },
  { rank: 5, emoji: '💯', count: '219' },
];

const POLL = [
  { label: 'Falling For You', pct: 56, lead: true },
  { label: 'Midnight Velvet', pct: 24 },
  { label: 'No Looking Back', pct: 12 },
  { label: 'Out Of Orbit', pct: 8 },
];

const PINS = [
  { icon: <Music className="h-3.5 w-3.5 text-purple-300" />, title: 'What song should open tonight?', cta: 'Vote now' },
  { icon: <MessageCircle className="h-3.5 w-3.5 text-cyan-300" />, title: 'Drop your request', cta: 'Let Trey know what you want to hear' },
];

export const CommunityScreen: React.FC = () => {
  const [tab, setTab] = useState('Chat');
  return (
    <div className="space-y-8 pb-4 lg:space-y-10">
      <TopBar />

      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-10">
        <div className="flex gap-3">
          <img src={IMG.treyTrizzy} className="h-32 w-32 rounded-xl object-cover" alt="" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 text-lg font-bold text-white">Trey Trizzy Radio Community <VerifiedBadge /></div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-white/70">
              <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> 8,745 Members</span>
              <span className="inline-flex items-center gap-1"><Headphones className="h-3.5 w-3.5" /> 236 Listening Now</span>
            </div>
            <p className="mt-2 text-xs text-white/70">Real fans. Real vibes. Real support.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Chip label="Leaderboard" icon={<Star className="h-3.5 w-3.5" />} />
              <Chip label="Events" icon={<Calendar className="h-3.5 w-3.5" />} />
              <Chip label="Perks" icon={<Gem className="h-3.5 w-3.5" />} />
              <button className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70"><MoreHorizontal className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/5 px-4 sm:px-6 lg:px-10">
        <div className="flex gap-6">
          {['Chat', 'Polls', 'Top Fans', 'About'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative py-3 text-sm ${tab === t ? 'font-semibold text-white' : 'text-white/55'}`}
            >
              {t}
              {tab === t && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-fuchsia-400 to-purple-500" />}
            </button>
          ))}
        </div>
      </div>

      {/* Pinned */}
      <div className="flex gap-3 overflow-x-auto px-4 sm:px-6 lg:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {PINS.map((p) => (
          <GlassCard key={p.title} className="w-[270px] shrink-0 p-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-1.5 text-[11px] text-purple-300">
                <Pin className="h-3 w-3" /> Pinned
              </div>
              <button className="text-white/40"><X className="h-3.5 w-3.5" /></button>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-white">
              {p.icon}{p.title}
            </div>
            <div className="mt-1 text-[11px] text-purple-300">{p.cta} →</div>
          </GlassCard>
        ))}
        <GlassCard className="w-[80px] shrink-0 p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-purple-300">
            <Sparkles className="h-3 w-3" /> P...
          </div>
        </GlassCard>
      </div>

      {/* Chat + side panels */}
      <div className="grid grid-cols-1 gap-3 px-4 sm:px-6 lg:px-10 md:grid-cols-[1fr_220px]">
        <div className="space-y-3">
          {MESSAGES.map((m, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <img src={m.img} className="h-9 w-9 rounded-full object-cover" alt="" />
              <div className="flex-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-white">{m.user}</span>
                  <span className={`inline-flex items-center gap-0.5 rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] ${m.badgeColor}`}>
                    <Star className="h-2.5 w-2.5" /> {m.badge}
                  </span>
                  <span className="ml-auto text-[10px] text-white/45">{m.time}</span>
                </div>
                <GlassCard className="mt-1 inline-block max-w-[90%] p-2.5">
                  <div className="text-xs text-white/85">{m.msg}</div>
                </GlassCard>
                <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/70">
                  <span className={m.heart === 'pink' ? 'text-pink-400' : 'text-orange-400'}>{m.heart === 'pink' ? '❤' : '🔥'}</span>
                  {m.reactions}
                </div>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2 text-[11px] text-white/50">
            <span className="flex gap-0.5">
              <span className="h-1 w-1 animate-pulse rounded-full bg-white/40" />
              <span className="h-1 w-1 animate-pulse rounded-full bg-white/40" style={{ animationDelay: '0.2s' }} />
              <span className="h-1 w-1 animate-pulse rounded-full bg-white/40" style={{ animationDelay: '0.4s' }} />
            </span>
            MemphisKid_92 is typing...
          </div>
        </div>

        <div className="space-y-3">
          <GlassCard className="p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-semibold text-white">Top Reactions</div>
              <button className="text-[10px] text-purple-300">See All</button>
            </div>
            <div className="space-y-1.5">
              {REACTIONS.map((r) => (
                <div key={r.rank} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-purple-300">{r.rank}</span>
                  <span className="text-base">{r.emoji}</span>
                  <span className="ml-auto text-white/70">{r.count}</span>
                </div>
              ))}
            </div>
          </GlassCard>
          <GlassCard className="p-3">
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className="inline-flex items-center gap-1 font-semibold text-fuchsia-300">📌 Poll</span>
              <span className="text-emerald-400">Active</span>
            </div>
            <div className="text-sm font-semibold text-white">What song should open tonight's show?</div>
            <div className="mt-2 space-y-1.5">
              {POLL.map((p) => (
                <div key={p.label} className="relative overflow-hidden rounded-lg">
                  <div className={`absolute inset-y-0 left-0 ${p.lead ? 'bg-gradient-to-r from-fuchsia-500 to-purple-500' : 'bg-white/8'}`} style={{ width: `${p.pct}%` }} />
                  <div className="relative flex items-center justify-between px-2.5 py-1.5 text-[11px]">
                    <span className="text-white">{p.label}</span>
                    <span className="font-semibold text-white">{p.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-[10px] text-white/50">842 votes - Ends in 2h 15m</div>
          </GlassCard>
        </div>
      </div>

      {/* Fan participation layer */}
      <div className="grid gap-3 px-4 sm:px-6 lg:grid-cols-3 lg:px-10">
        <GlassCard className="p-4">
          <div className="mb-3 text-sm font-semibold text-white">Request Queue</div>
          <div className="space-y-2">
            {LISTENER_REQUESTS.map((request) => (
              <div key={request.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                <div className="flex items-center gap-2">
                  <img src={request.listenerAvatar} className="h-8 w-8 rounded-full object-cover" alt="" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold text-white">{request.songTitle}</div>
                    <div className="text-[10px] text-white/50">{request.listenerName} requested {request.requestedAt}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="mb-3 text-sm font-semibold text-white">Fan Leaderboard</div>
          <div className="space-y-2">
            {TOP_FAN_LEADERBOARD.map((fan, index) => (
              <div key={fan.id} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                <div className="w-5 text-sm font-bold text-purple-300">{index + 1}</div>
                <img src={fan.avatar} className="h-9 w-9 rounded-full object-cover" alt="" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold text-white">{fan.name}</div>
                  <div className="text-[10px] text-cyan-300">{fan.badge}</div>
                </div>
                <div className="text-right text-[10px] text-white/50">{fan.points.toLocaleString()} pts</div>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="mb-3 text-sm font-semibold text-white">Vote What Plays Next</div>
          <div className="space-y-2">
            {FAN_VOTES.map((vote) => (
              <div key={vote.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                <div className="text-xs font-semibold text-white">{vote.votedFor}</div>
                <div className="mt-1 text-[10px] text-white/50">{vote.voteType} vote - {vote.timestamp}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Mini player */}
      <div className="px-4 sm:px-6 lg:px-10">
        <GlassCard className="flex items-center gap-3 p-2.5">
          <img src={IMG.treyTrizzy} className="h-12 w-12 rounded-lg object-cover" alt="" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 text-sm font-semibold text-white">Trey Trizzy Radio <VerifiedBadge /></div>
            <div className="text-[11px] text-white/65">Falling For You</div>
            <div className="flex items-center gap-1.5 text-[10px]">
              <Waveform className="h-2.5 w-8" bars={6} />
              <span className="text-white/55">Mila Rain</span>
              <span className="rounded-full border border-pink-400/40 bg-pink-500/10 px-1.5 text-[9px] font-bold text-pink-300">LIVE</span>
            </div>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-purple-400/40 bg-purple-500/10 text-white">⏮</button>
          <button className="flex h-12 w-12 items-center justify-center rounded-full border border-purple-400/40 bg-purple-500/20 text-white">⏸</button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-purple-400/40 bg-purple-500/10 text-white">⏭</button>
        </GlassCard>
      </div>

      {/* Message input */}
      <div className="flex items-center gap-2 px-4 sm:px-6 lg:px-10">
        <button className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70">
          <Plus className="h-5 w-5" />
        </button>
        <div className="flex flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5">
          <input placeholder="Message the community..." className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none" />
          <button className="text-white/55"><Smile className="h-5 w-5" /></button>
          <button className="rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] font-bold text-white/60">GIF</button>
          <button className="flex h-7 w-7 items-center justify-center rounded-full border border-purple-400/40 bg-purple-500/10">
            <Waveform className="h-3 w-3" bars={4} color="from-purple-300 to-purple-300" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityScreen;

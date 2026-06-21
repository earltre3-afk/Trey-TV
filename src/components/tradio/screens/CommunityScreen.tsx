import React, { useState } from 'react';
import { ChevronLeft, Heart, Users, Radio, UserCheck, Swords } from 'lucide-react';
import {
  COMMUNITY_NOW_PLAYING,
  COMMUNITY_FEED,
  COMMUNITY_ROOMS,
} from '../../../data/mockData';
import { useSongWars } from '../../../contexts/SongWarsContext';

interface Props {
  onClose: () => void;
  onJoinRoom: () => void;
  onOpenBattle: (warId: string) => void;
}

export default function CommunityScreen({ onClose, onJoinRoom, onOpenBattle }: Props) {
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const { followedArtists } = useSongWars();

  const toggleLike = (id: string) =>
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <>
      <div className="flex items-center gap-3 px-5 pt-3 pb-2 shrink-0">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/[0.06] border border-amber-400/20 flex items-center justify-center text-white active:scale-95 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-400" />
          <span className="tradio-chrome font-bold tracking-wide text-sm">COMMUNITY</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pb-4 space-y-7 pt-1">
        {/* Following rail */}
        {followedArtists.length > 0 && (
          <div>
            <h3 className="px-5 text-white font-black text-lg mb-3 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" /> Following
            </h3>
            <div className="flex gap-3 overflow-x-auto px-5 pb-1 no-scrollbar">
              {followedArtists.map((fa) => (
                <div
                  key={fa.contestant.handle}
                  className="w-44 shrink-0 tradio-glass rounded-2xl p-3"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={fa.contestant.image}
                      alt={fa.contestant.name}
                      className="w-10 h-10 rounded-full object-cover border border-emerald-400/30"
                    />
                    <div className="min-w-0">
                      <p className="text-white font-bold text-sm truncate">{fa.contestant.name}</p>
                      <p className="text-emerald-300/70 text-[10px]">Following</p>
                    </div>
                  </div>
                  {fa.battles.length > 0 ? (
                    <div className="space-y-1.5">
                      {fa.battles.slice(0, 2).map((b) => (
                        <button
                          key={b.id}
                          onClick={() => onOpenBattle(b.id)}
                          className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-fuchsia-600/15 border border-fuchsia-400/30 text-left active:scale-[0.98] transition"
                        >
                          <Swords className="w-3.5 h-3.5 text-fuchsia-300 shrink-0" />
                          <span className="text-white/80 text-[11px] truncate">{b.title}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/35 text-[11px]">No active battles</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends listening now */}
        <div>
          <h3 className="px-5 text-white font-black text-lg mb-3">Listening Now</h3>
          <div className="flex gap-3 overflow-x-auto px-5 pb-1 no-scrollbar">
            {COMMUNITY_NOW_PLAYING.map((p) => (
              <button
                key={p.id}
                onClick={onJoinRoom}
                className="w-32 shrink-0 text-left active:scale-[0.97] transition"
              >
                <div className="relative">
                  <img
                    src={p.avatar}
                    alt={p.user}
                    className="w-32 h-32 rounded-2xl object-cover border border-amber-400/20"
                  />
                  <span className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-cyan-300 text-[9px] font-bold tracking-wide">ON AIR</span>
                  </span>
                </div>
                <p className="text-white font-bold text-sm mt-2 truncate">{p.user}</p>
                <p className="text-white/45 text-[11px] truncate">{p.track}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Live rooms */}
        <div>
          <h3 className="px-5 text-white font-black text-lg mb-3">Community Rooms</h3>
          <div className="grid grid-cols-2 gap-3 px-5">
            {COMMUNITY_ROOMS.map((r) => (
              <button
                key={r.id}
                onClick={onJoinRoom}
                className={`relative h-28 rounded-2xl bg-gradient-to-br ${r.tone} border border-white/10 p-3 flex flex-col justify-between text-left active:scale-[0.97] transition`}
              >
                <Radio className="w-5 h-5 text-amber-300" />
                <div>
                  <p className="text-white font-bold text-sm leading-tight">{r.title}</p>
                  <p className="text-white/60 text-[11px]">{r.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Activity feed */}
        <div>
          <h3 className="px-5 text-white font-black text-lg mb-3">Activity</h3>
          <div className="space-y-2 px-5">
            {COMMUNITY_FEED.map((post) => {
              const isLiked = liked[post.id];
              return (
                <div
                  key={post.id}
                  className="flex items-center gap-3 tradio-glass rounded-2xl p-3"
                >
                  <img
                    src={post.avatar}
                    alt={post.user}
                    className="w-11 h-11 rounded-full object-cover shrink-0 border border-white/10"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm leading-snug">
                      <span className="font-bold">{post.user}</span>{' '}
                      <span className="text-white/55">{post.action}</span>{' '}
                      <span className="text-amber-400 font-semibold">{post.target}</span>
                    </p>
                    <p className="text-white/35 text-[11px]">{post.meta}</p>
                  </div>
                  <button
                    onClick={() => toggleLike(post.id)}
                    className="flex flex-col items-center gap-0.5 active:scale-90 transition shrink-0"
                  >
                    <Heart
                      className={`w-5 h-5 ${isLiked ? 'text-amber-400' : 'text-white/40'}`}
                      fill={isLiked ? 'currentColor' : 'none'}
                    />
                    <span className={`text-[10px] ${isLiked ? 'text-amber-400' : 'text-white/40'}`}>
                      {post.likes + (isLiked ? 1 : 0)}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

import React from "react";
import { TVFrame } from "../components/TVFrame";
import { FocusButton } from "../components/Primitives";
import { ContentRow, CreatorRow, GameRow } from "../components/Rows";
import {
  featured,
  continueWatching,
  newEpisodes,
  creators,
  musicVideos,
  trendingGames,
  heroFeature,
} from "../mockData";
import { useTV } from "../TVContext";
import { Play, Plus } from "lucide-react";
import { getHeroFallbackStyle, selectHeroArtwork } from "../artwork";

export const HomeScreen: React.FC = () => {
  const { navigate } = useTV();
  const heroArtwork = selectHeroArtwork(heroFeature);
  return (
    <TVFrame activeRail="Home">
      {/* Hero */}
      <section className="relative h-[460px] w-full overflow-hidden rounded-3xl border border-fuchsia-500/20 mb-8 shadow-[0_0_80px_rgba(168,85,247,0.15)]">
        <div className="absolute inset-0" style={getHeroFallbackStyle(heroFeature.title)} />
        {heroArtwork && (
          <img src={heroArtwork} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        <div className="relative h-full flex flex-col justify-center px-12 max-w-3xl">
          <div className="text-amber-300 font-bold tracking-[0.3em] text-sm mb-3">
            {heroFeature.meta}
          </div>
          <h1 className="text-7xl font-black leading-none tracking-tight text-white">
            {heroFeature.title}
          </h1>
          <p className="mt-5 text-lg text-white/85 max-w-xl">{heroFeature.description}</p>
          <div className="mt-6 flex items-center gap-3">
            <FocusButton
              variant="gold"
              icon={<Play className="w-5 h-5 fill-black" />}
              onClick={() => navigate("player")}
              autoFocus
            >
              Watch Now
            </FocusButton>
            <FocusButton variant="ghost" icon={<Plus className="w-5 h-5" />}>
              My List
            </FocusButton>
          </div>
        </div>

        <div className="absolute top-6 right-6 px-3 py-1.5 rounded-md bg-amber-400/95 text-black text-xs font-black tracking-wider">
          4K ULTRA HD
        </div>
        <div className="absolute bottom-6 right-8 flex items-center gap-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={
                "h-1.5 rounded-full transition-all " +
                (i === 0 ? "w-8 bg-fuchsia-400" : "w-1.5 bg-white/40")
              }
            />
          ))}
        </div>
      </section>

      <ContentRow title="Featured" items={featured} size="md" onSelect={() => navigate("detail")} />
      <ContentRow
        title="Continue Watching"
        items={continueWatching}
        size="lg"
        onSelect={() => navigate("player")}
      />
      <ContentRow title="New Episodes" items={newEpisodes} size="sm" />
      <CreatorRow title="Creator Channels" items={creators} />
      <ContentRow title="Music Videos" items={musicVideos} size="md" />
      <GameRow
        title="Trending Games"
        items={trendingGames}
        onSelect={(g) => (g.title === "Spades" ? navigate("spades") : navigate("games"))}
      />
    </TVFrame>
  );
};

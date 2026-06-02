import React from 'react';
import { Search, Play, Star, Music2, Crown, Users, FolderKanban, Clock, Clapperboard } from 'lucide-react';
import { TVFrame } from '../components/TVFrame';
import { FocusButton, FocusCard, GlassPanel } from '../components/Primitives';
import { ContentRow } from '../components/Rows';
import { continueWatching, featured, interactiveStories, musicVideos, newEpisodes } from '../mockData';
import { TV_ARTWORK } from '../artwork';
import { useTV } from '../TVContext';

const categories = ['Originals', 'Creator Picks', 'Live Channels', 'Music', 'Gaming', 'Late Night', 'Docuseries'];

export const SearchScreen: React.FC = () => {
  const { navigate } = useTV();
  return (
    <TVFrame activeRail="Search">
      <h1 className="text-4xl font-black mb-2">Search</h1>
      <p className="text-white/60 mb-6">Find Trey TV originals, games, music videos, and creator channels.</p>
      <GlassPanel className="p-5 mb-6">
        <div className="flex items-center gap-4 rounded-2xl border border-fuchsia-400/40 bg-black/45 px-5 py-4">
          <Search className="h-7 w-7 text-fuchsia-300" />
          <div className="flex-1 text-2xl font-bold text-white/80">Search Trey TV</div>
          <FocusButton variant="primary" autoFocus>Open Keyboard</FocusButton>
        </div>
      </GlassPanel>
      <div className="grid grid-cols-4 gap-4 mb-8">
        {['Kingmaker', 'Spades', 'Late Night Gaming', 'After Hours'].map((term) => (
          <FocusCard key={term} className="p-5 h-24" onClick={() => term === 'Spades' ? navigate('spades') : navigate('detail')}>
            <div className="text-xs text-white/45">Suggested</div>
            <div className="text-xl font-black">{term}</div>
          </FocusCard>
        ))}
      </div>
      <ContentRow title="Popular Results" items={[...featured.slice(0, 3), ...interactiveStories.slice(0, 2)]} onSelect={() => navigate('detail')} />
    </TVFrame>
  );
};

export const BrowseScreen: React.FC = () => {
  const { navigate } = useTV();
  return (
    <TVFrame activeRail="Browse">
      <h1 className="text-4xl font-black mb-2">Browse</h1>
      <p className="text-white/60 mb-6">Explore Trey TV by category, format, and mood.</p>
      <div className="grid grid-cols-4 gap-4 mb-8">
        {categories.map((category, index) => (
          <FocusCard key={category} className="h-32 p-5" glow={index % 3 === 0 ? 'gold' : 'magenta'} onClick={() => navigate(index === 4 ? 'games' : 'detail')}>
            <Clapperboard className="h-7 w-7 text-fuchsia-300 mb-4" />
            <div className="text-xl font-black">{category}</div>
            <div className="text-sm text-white/55">Browse collection</div>
          </FocusCard>
        ))}
      </div>
      <ContentRow title="Featured Collections" items={featured} onSelect={() => navigate('detail')} />
      <ContentRow title="New Episodes" items={newEpisodes} size="sm" onSelect={() => navigate('player')} />
    </TVFrame>
  );
};

export const MyListScreen: React.FC = () => {
  const { navigate } = useTV();
  return (
    <TVFrame activeRail="My List">
      <h1 className="text-4xl font-black mb-2">My List</h1>
      <p className="text-white/60 mb-6">Favorites, watch later, and progress live here.</p>
      <div className="grid grid-cols-3 gap-5 mb-8">
        {[
          { title: 'Favorites', value: '4 saved', Icon: Star },
          { title: 'Watch Later', value: '2 queued', Icon: Clock },
          { title: 'Continue Watching', value: '4 in progress', Icon: Play },
        ].map(({ title, value, Icon }) => (
          <FocusCard key={title} className="p-6 h-36" onClick={() => navigate('player')}>
            <Icon className="h-8 w-8 text-amber-300 mb-4" />
            <div className="text-2xl font-black">{title}</div>
            <div className="text-sm text-white/60">{value}</div>
          </FocusCard>
        ))}
      </div>
      <ContentRow title="Continue Watching" items={continueWatching} size="lg" onSelect={() => navigate('player')} />
      <ContentRow title="Saved for Later" items={featured.slice(0, 4)} onSelect={() => navigate('detail')} />
    </TVFrame>
  );
};

export const MusicScreen: React.FC = () => {
  const { navigate } = useTV();
  return (
    <TVFrame activeRail="Music">
      <section className="relative mb-8 h-[320px] overflow-hidden rounded-3xl border border-fuchsia-500/20">
        <img src={TV_ARTWORK.afterHoursCard} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/65 to-transparent" />
        <div className="relative flex h-full max-w-2xl flex-col justify-center px-10">
          <div className="text-fuchsia-300 font-black tracking-[0.28em]">TREY TV MUSIC</div>
          <h1 className="mt-2 text-6xl font-black">Music</h1>
          <p className="mt-3 text-white/75">Music videos, sessions, late-night performances, and creator soundtracks.</p>
          <div className="mt-5 flex gap-3">
            <FocusButton variant="primary" icon={<Play className="h-5 w-5 fill-white" />} autoFocus onClick={() => navigate('player')}>Play Featured</FocusButton>
            <FocusButton variant="ghost" icon={<Music2 className="h-5 w-5" />}>Music Channels</FocusButton>
          </div>
        </div>
      </section>
      <ContentRow title="Music Videos" items={musicVideos} onSelect={() => navigate('player')} />
      <ContentRow title="Late Night Sound" items={featured.filter((item) => item.title.includes('After') || item.title.includes('Life'))} onSelect={() => navigate('detail')} />
    </TVFrame>
  );
};

export const PremiumScreen: React.FC = () => (
  <TVFrame activeRail="PREMIUM">
    <GlassPanel className="p-8">
      <div className="flex items-start gap-5">
        <Crown className="h-12 w-12 text-amber-300" />
        <div>
          <div className="text-sm font-black tracking-[0.3em] text-amber-300">COMING SOON</div>
          <h1 className="mt-2 text-5xl font-black">Premium</h1>
          <p className="mt-3 max-w-3xl text-white/70">Membership features, early access, and premium creator experiences will appear here. No payment flow is enabled in this debug build.</p>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-3 gap-4">
        {['Early premieres', 'Premium badges', 'Creator exclusives'].map((title) => (
          <FocusCard key={title} className="p-6 h-32" glow="gold">
            <div className="text-xl font-black">{title}</div>
            <div className="text-sm text-white/55">Coming Soon</div>
          </FocusCard>
        ))}
      </div>
    </GlassPanel>
  </TVFrame>
);

export const WatchPartiesScreen: React.FC = () => (
  <TVFrame activeRail="Parties">
    <GlassPanel className="p-8">
      <Users className="h-10 w-10 text-fuchsia-300" />
      <h1 className="mt-4 text-5xl font-black">Watch Parties</h1>
      <p className="mt-3 max-w-2xl text-white/70">Coming Soon. Group watch, synced chat, and creator-hosted premieres will live here.</p>
      <FocusButton variant="primary" className="mt-6" autoFocus>Create Party</FocusButton>
    </GlassPanel>
  </TVFrame>
);

export const SourceHubScreen: React.FC = () => (
  <TVFrame activeRail="Sources">
    <GlassPanel className="p-8">
      <FolderKanban className="h-10 w-10 text-fuchsia-300" />
      <h1 className="mt-4 text-5xl font-black">Source Hub</h1>
      <p className="mt-3 max-w-2xl text-white/70">Coming Soon. Connected content sources and import status will be shown here when available.</p>
      <FocusButton variant="ghost" className="mt-6" autoFocus>Check Sources</FocusButton>
    </GlassPanel>
  </TVFrame>
);

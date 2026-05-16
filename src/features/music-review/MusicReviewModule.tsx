import React, { useState } from 'react';
import { StageBackground } from './components/shared/StageBackground';
import { Header } from './components/shared/Header';
import { BottomNav } from './components/shared/BottomNav';
import { Home } from './components/public/Home';
import { Submit } from './components/public/Submit';
import { PreCheckView } from './components/public/PreCheck';
import { Queue } from './components/public/Queue';
import { LiveRoom } from './components/public/LiveRoom';
import { SkipTheLine } from './components/public/SkipTheLine';
import { Results } from './components/public/Results';
import { Profile } from './components/public/Profile';
import { OpenMic } from './components/public/OpenMic';
import { History } from './components/public/History';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminQueue } from './components/admin/AdminQueue';
import { AdminWorkbench } from './components/admin/AdminWorkbench';
import { AdminOpenMic } from './components/admin/AdminOpenMic';
import { AdminSettings } from './components/admin/AdminSettings';
import { useTreyAuth } from './hooks/useTreyAuth';
import { AIPrecheck } from './lib/types';
import { Shield } from 'lucide-react';

export type MusicReviewModuleRoute =
  | 'home' | 'submit' | 'precheck' | 'queue' | 'live' | 'skipline' | 'results' | 'profile' | 'openmic' | 'history'
  | 'admin' | 'admin-queue' | 'admin-review' | 'admin-openmic' | 'admin-settings';

type MusicReviewModuleProps = {
  initialRoute?: MusicReviewModuleRoute;
};

export const MusicReviewModule: React.FC<MusicReviewModuleProps> = ({ initialRoute = 'home' }) => {
  const { user } = useTreyAuth();
  const [route, setRoute] = useState<MusicReviewModuleRoute>(initialRoute);
  const [history, setHistory] = useState<MusicReviewModuleRoute[]>([]);
  const [precheck, setPrecheck] = useState<{ submissionId: string; data: AIPrecheck; songTitle: string; artistName: string } | null>(null);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [submissionForReview, setSubmissionForReview] = useState<string | null>(null);

  const go = (r: MusicReviewModuleRoute) => { setHistory((h) => [...h, route]); setRoute(r); };
  const back = () => { setRoute(history[history.length - 1] || 'home'); setHistory((h) => h.slice(0, -1)); };

  const onBottomNav = (key: 'review' | 'profile' | 'submit' | 'leaderboard' | 'shop') => {
    if (key === 'review') go('home');
    if (key === 'profile') go('profile');
    if (key === 'submit') go('submit');
    if (key === 'leaderboard') go('queue');
    if (key === 'shop') go('skipline');
  };

  const isAdminRoute = route.startsWith('admin');
  const adminAllowed = Boolean(user?.isAdmin);
  const bottomKey = route === 'home' ? 'review' : route === 'profile' ? 'profile' : route === 'submit' ? 'submit' : route === 'queue' ? 'leaderboard' : route === 'skipline' ? 'shop' : 'review';

  return (
    <div className="min-h-screen text-[#F8FAFC]" style={{ background: '#05070D' }}>
      <StageBackground />
      <Header
        showBack={route !== 'home' && route !== 'admin'}
        onBack={back}
        rightSlot={
          user?.isAdmin ? (
            <button onClick={() => go(isAdminRoute ? 'home' : 'admin')} className="px-3 py-2 rounded-2xl border border-[#FFC857]/60 text-[#FFC857] text-[10px] font-bold tracking-wider flex items-center gap-1">
              <Shield size={12} /> {isAdminRoute ? 'EXIT ADMIN' : 'ADMIN'}
            </button>
          ) : null
        }
      />

      <main>
        {isAdminRoute && !adminAllowed && (
          <div className="px-4 py-12 max-w-md mx-auto text-center">
            <div className="rounded-3xl border border-[#EF4444]/40 bg-[#0B1426] p-8">
              <div className="text-[#EF4444] text-xs tracking-[4px] font-bold">ADMIN ACCESS REQUIRED</div>
              <h2 className="text-2xl font-black text-[#F8FAFC] mt-2">Music Review Admin is protected</h2>
              <p className="text-[#94A3B8] text-sm mt-2">Connect this module to Trey TV owner/admin role checks before enabling production admin actions.</p>
              <button onClick={() => go('home')} className="mt-5 px-5 py-3 rounded-2xl border border-[#00B7FF]/50 text-[#00B7FF] text-sm font-bold">Back to Review</button>
            </div>
          </div>
        )}
        {!isAdminRoute && route === 'home' && (
          <Home
            onSubmit={() => go('submit')}
            onOpenMic={() => go('openmic')}
            onQueue={() => go('queue')}
            onLive={() => go('live')}
            onProfile={() => go('profile')}
            onSkipLine={() => go('skipline')}
          />
        )}
        {!isAdminRoute && route === 'submit' && (
          <Submit
            onPrecheckReady={(submissionId, data) => {
              setPrecheck({ submissionId, data, songTitle: '', artistName: user?.name || '' });
              go('precheck');
            }}
          />
        )}
        {!isAdminRoute && route === 'precheck' && precheck && (
          <PreCheckView
            submissionId={precheck.submissionId}
            precheck={precheck.data}
            songTitle={precheck.songTitle || 'Your Song'}
            artistName={precheck.artistName}
            onSubmitToTrey={() => go('skipline')}
            onRevise={() => go('submit')}
          />
        )}
        {!isAdminRoute && route === 'queue' && (
          <Queue onLive={() => go('live')} highlightUserId={user?.id} />
        )}
        {!isAdminRoute && route === 'live' && <LiveRoom />}
        {!isAdminRoute && route === 'skipline' && (
          <SkipTheLine
            submissionId={precheck?.submissionId || null}
            onDone={() => go('queue')}
            onSkip={() => go('queue')}
          />
        )}
        {!isAdminRoute && route === 'results' && reviewId && (
          <Results reviewId={reviewId} onProfile={() => go('profile')} />
        )}
        {!isAdminRoute && route === 'profile' && (
          <Profile onSubmit={() => go('submit')} onResults={(id) => { setReviewId(id); go('results'); }} />
        )}
        {!isAdminRoute && route === 'openmic' && <OpenMic />}
        {!isAdminRoute && route === 'history' && (
          <History onResults={(id) => { setReviewId(id); go('results'); }} />
        )}

        {/* Admin */}
        {adminAllowed && route === 'admin' && (
          <AdminDashboard
            onQueue={() => go('admin-queue')}
            onOpenMic={() => go('admin-openmic')}
            onSettings={() => go('admin-settings')}
          />
        )}
        {adminAllowed && route === 'admin-queue' && (
          <AdminQueue onReview={(id) => { setSubmissionForReview(id); go('admin-review'); }} />
        )}
        {adminAllowed && route === 'admin-review' && submissionForReview && (
          <AdminWorkbench submissionId={submissionForReview} onDone={() => go('admin-queue')} />
        )}
        {adminAllowed && route === 'admin-openmic' && <AdminOpenMic />}
        {adminAllowed && route === 'admin-settings' && <AdminSettings />}
      </main>

      {!isAdminRoute && <BottomNav active={bottomKey as any} onNavigate={onBottomNav} />}
    </div>
  );
};

export default MusicReviewModule;

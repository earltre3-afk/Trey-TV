// Interactive Stories Player — main entry point for the Interactive Stories module
// inside Trey TV. Adapted from the standalone module's AppLayout.tsx.
// Uses Trey TV's `useAuth()` from `@/lib/auth` instead of standalone auth context.

import React, { useEffect, useMemo, useState } from 'react';
import { Branch, Choice, Ending, Tone, StateDelta } from '../lib/storyTypes';
import {
  loadBranches,
  loadEndings,
  createNewBranch,
  updateBranch,
  deleteBranch,
  applyDelta,
  generateNextChapter,
  pickChapterImage,
  saveEnding,
} from '../lib/storyEngine';
import { CHAPTER_1_CHOICES } from '../lib/storyData';
import { useAuth } from '@/lib/auth';
import { syncMetaFromBranch, recordChoiceEvent, replayFromChapter } from '../lib/playthroughs';
import {
  createBranchFromStoryPackage,
  ensureBundledStoryPackagesInstalled,
  findInstalledStoryPackageBySlug,
  installTreyStoryFile,
  loadInstalledStoryPackages,
  normalizeStorySlug,
  TreyStoryPackage,
} from '../lib/treyStoryPackage';

import { BottomNav, NavTab } from './BottomNav';
import { StatusPanel } from './StatusPanel';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { LibraryScreen } from './screens/LibraryScreen';
import { LandingScreen } from './screens/LandingScreen';
import { ReadingScreen } from './screens/ReadingScreen';
import { StopPointScreen } from './screens/StopPointScreen';
import { AILoadingScreen } from './screens/AILoadingScreen';
import { ContinuationScreen } from './screens/ContinuationScreen';
import { BranchMapScreen } from './screens/BranchMapScreen';
import { CharactersScreen } from './screens/CharactersScreen';
import { EndingsScreen } from './screens/EndingsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { EndingScreen } from './screens/EndingScreen';
import { ChapterArchiveScreen } from './screens/ChapterArchiveScreen';
import { PlaythroughsScreen, SharedEndingScreen } from './screens/PlaythroughsScreen';

type View =
  | 'welcome'
  | 'main'
  | 'landing'
  | 'reading'
  | 'stop'
  | 'loading'
  | 'continuation'
  | 'ending'
  | 'archive'
  | 'shared';

interface ContinuationData {
  chapterTitle: string;
  prose: string;
  delta: StateDelta;
  image?: string;
  imageFit?: 'cover' | 'contain';
  imagePosition?: string;
}

const WELCOME_KEY = 'switchkicks_welcomed_v1';

interface InteractiveStoriesPlayerProps {
  /** Pre-select a specific story by slug */
  storySlug?: string;
  /** Show the player in a specific initial view */
  initialView?: View;
  /** Open a dashboard tab first. Used by nested story routes. */
  initialTab?: NavTab;
  /** Callback to navigate back to the Games page */
  onBack?: () => void;
}

const InteractiveStoriesPlayer: React.FC<InteractiveStoriesPlayerProps> = ({
  storySlug,
  initialView,
  initialTab,
  onBack,
}) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [endings, setEndings] = useState<Ending[]>([]);
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);
  const [view, setView] = useState<View>(initialView || 'welcome');
  const [tab, setTab] = useState<NavTab>(initialTab || 'library');
  const [statusOpen, setStatusOpen] = useState(false);
  const [continuation, setContinuation] = useState<ContinuationData | null>(null);
  const [showEndings, setShowEndings] = useState(false);
  const [shareSlug, setShareSlug] = useState<string | null>(null);
  const [installedStories, setInstalledStories] = useState<TreyStoryPackage[]>([]);

  // Wire into Trey TV's auth system
  const { user, isGuest, isAdmin } = useAuth();
  const userUid = user?.uid || null;

  // Auth guard helper — prompts sign-in if guest
  const requireAuth = (action: string, callback: () => void) => {
    if (isGuest || !userUid) {
      // For now, allow play but warn about saving
      callback();
      return;
    }
    callback();
  };

  // Handle ?share=<slug> deep link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('share');
    if (slug) {
      setShareSlug(slug);
      setView('shared');
    }
  }, []);

  useEffect(() => {
    const allBranches = loadBranches();
    setBranches(allBranches);
    setEndings(loadEndings());
    setInstalledStories(loadInstalledStoryPackages());
    ensureBundledStoryPackagesInstalled()
      .then(setInstalledStories)
      .catch((error) => {
        console.error('Bundled Interactive Stories could not be loaded.', error);
      });
    // Hydrate playthrough metadata for any existing branches.
    for (const b of allBranches) syncMetaFromBranch(b, userUid);
    const welcomed = localStorage.getItem(WELCOME_KEY);
    if (welcomed && !shareSlug) setView('main');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userUid]);

  // If a specific story slug is provided, auto-open it
  useEffect(() => {
    if (storySlug && view === 'main') {
      const normalizedSlug = normalizeStorySlug(storySlug);
      if (normalizedSlug === 'switch-kicks') {
        setView('landing');
      } else {
        const pkg = findInstalledStoryPackageBySlug(normalizedSlug);
        if (pkg) {
          handleStartInstalledStory(pkg.story.id);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storySlug, installedStories.length]);

  const activeBranch = useMemo(
    () => branches.find((b) => b.id === activeBranchId) || null,
    [branches, activeBranchId]
  );

  const refresh = () => {
    const fresh = loadBranches();
    setBranches(fresh);
    setEndings(loadEndings());
    setInstalledStories(loadInstalledStoryPackages());
    for (const b of fresh) syncMetaFromBranch(b, userUid);
  };

  const enterApp = () => {
    localStorage.setItem(WELCOME_KEY, '1');
    setView('main');
    setTab('library');
  };

  const handleOpenStory = () => setView('landing');

  const handleInstallStoryFile = async (file: File) => {
    try {
      const next = await installTreyStoryFile(file);
      setInstalledStories(next);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Could not install this .ttstory file.');
    }
  };

  const handleStartInstalledStory = (storyId: string) => {
    const pkg = loadInstalledStoryPackages().find((story) => story.story.id === storyId);
    if (!pkg) {
      alert('That installed story could not be found.');
      return;
    }
    const branch = createBranchFromStoryPackage(pkg);
    updateBranch(branch);
    syncMetaFromBranch(branch, userUid);
    refresh();
    setActiveBranchId(branch.id);
    setView('reading');
  };

  const handleStartNew = () => {
    if (branches.filter((b) => !b.isComplete).length >= 5) {
      alert('You have 5 active branches. Finish or delete one to start a new path.');
      return;
    }
    const b = createNewBranch();
    syncMetaFromBranch(b, userUid);
    refresh();
    setActiveBranchId(b.id);
    setView('reading');
  };

  const handleContinueBranch = (b: Branch) => {
    setActiveBranchId(b.id);
    if (b.isComplete && b.ending) setView('ending');
    else setView('reading');
  };

  const handleContinueById = (id: string) => {
    const b = loadBranches().find((x) => x.id === id);
    if (!b) return;
    handleContinueBranch(b);
  };

  const handleReplayFrom = (id: string, chapter: number) => {
    replayFromChapter(id, chapter);
    refresh();
    const b = loadBranches().find((x) => x.id === id);
    if (b) {
      setActiveBranchId(b.id);
      setView('reading');
    }
  };

  const openReread = (b: Branch) => {
    setActiveBranchId(b.id);
    requireAuth('reread', () => setView('archive'));
  };

  const handleReadingContinue = () => {
    if (!activeBranch) return;
    if (activeBranch.isComplete && activeBranch.ending) {
      setView('ending');
      return;
    }
    if (activeBranch.pendingStopPoint) {
      setView('stop');
    } else {
      const updated: Branch = {
        ...activeBranch,
        pendingStopPoint: { prompt: 'What happens next?', choices: CHAPTER_1_CHOICES },
      };
      updateBranch(updated);
      refresh();
      setView('stop');
    }
  };

  const runChoice = async (choice: Choice | { label?: string; text: string; tone?: Tone }) => {
    if (!activeBranch) return;
    setView('loading');

    try {
      const result = await generateNextChapter(activeBranch, choice);
      const newMeters = applyDelta(activeBranch.meters, result.state.state_delta);
      const newChapterNumber = activeBranch.chapters[activeBranch.chapters.length - 1].number + 1;
      const chapterImage = result.image || pickChapterImage(result.state.tone_tag, newChapterNumber, `${result.state.chapter_title} ${result.state.chapter_summary} ${result.prose}`);

      const newChapter = {
        number: newChapterNumber,
        title: result.state.chapter_title || `Chapter ${newChapterNumber}`,
        prose: result.prose,
        image: chapterImage,
        imageFit: result.imageFit,
        imagePosition: result.imagePosition,
        sceneId: result.sceneId,
        summary: result.state.chapter_summary,
        toneTag: result.state.tone_tag,
        choiceMade: choice.tone
          ? { label: choice.label || '?', text: choice.text, tone: choice.tone }
          : { label: '✎', text: choice.text, tone: 'Bold' as Tone },
      };

      const newToneHistory: Tone[] = [...activeBranch.toneHistory, result.state.tone_tag].slice(-10);

      const updated: Branch = {
        ...activeBranch,
        chapters: [...activeBranch.chapters, newChapter],
        meters: newMeters,
        toneHistory: newToneHistory,
        pendingStopPoint: result.state.next_stop_point || undefined,
        flags: { ...activeBranch.flags, current_scene_id: result.sceneId || activeBranch.flags.current_scene_id || '' },
        isComplete: !!result.state.is_ending,
      };

      if (result.state.is_ending && result.state.ending_unlocked) {
        const ending: Ending = {
          name: result.state.ending_unlocked,
          tagline: result.state.ending_tagline || 'Your story has an ending.',
          unlockedAt: Date.now(),
          branchId: updated.id,
        };
        updated.ending = ending;
        saveEnding(ending);
      }

      updateBranch(updated);

      // Sync playthrough meta + record the choice event server-side.
      const meta = syncMetaFromBranch(updated, userUid);
      recordChoiceEvent({
        playthroughId: meta.id,
        userUid,
        chapterNumber: newChapterNumber,
        choiceLabel: choice.label,
        choiceText: choice.text,
        toneLabel: choice.tone,
        statChanges: (result.state.state_delta as unknown) as Record<string, number>,
      }).catch(() => {});

      refresh();

      setContinuation({
        chapterTitle: newChapter.title,
        prose: newChapter.prose,
        delta: result.state.state_delta,
        image: chapterImage,
        imageFit: result.imageFit,
        imagePosition: result.imagePosition,
      });
      setView('continuation');
    } catch (err) {
      console.error(err);
      alert('The AI is having a moment. Try again.');
      setView('stop');
    }
  };

  const handleChoice = (choice: Choice | { label?: string; text: string; tone?: Tone }) => {
    if (!activeBranch) return;
    if (activeBranch.chapters.length >= 2) {
      requireAuth('continue-ai', () => runChoice(choice));
    } else {
      runChoice(choice);
    }
  };

  const handleContinuationDone = () => {
    setContinuation(null);
    if (activeBranch?.isComplete && activeBranch.ending) setView('ending');
    else setView('reading');
  };

  const handleResetAll = () => {
    localStorage.removeItem('switchkicks_branches_v1');
    localStorage.removeItem('switchkicks_endings_v1');
    localStorage.removeItem('trey_playthroughs_meta_v1');
    setBranches([]);
    setEndings([]);
    setActiveBranchId(null);
    alert('All progress reset.');
  };

  const handleDeleteBranch = (id: string) => {
    deleteBranch(id);
    if (activeBranchId === id) setActiveBranchId(null);
    refresh();
  };

  const handleGoBack = () => {
    if (onBack) onBack();
    else window.history.back();
  };

  // === Render branches ===

  if (view === 'shared' && shareSlug) {
    return (
      <SharedEndingScreen
        slug={shareSlug}
        onBack={() => {
          window.history.replaceState({}, '', window.location.pathname);
          setShareSlug(null);
          setView('main');
          setTab('library');
        }}
      />
    );
  }

  if (view === 'welcome') {
    return <WelcomeScreen onEnter={enterApp} />;
  }

  if (view === 'archive' && activeBranch) {
    return (
      <>
        <ChapterArchiveScreen
          branch={activeBranch}
          onBack={() => setView('reading')}
          onJumpToCurrent={() => {
            if (activeBranch.isComplete && activeBranch.ending) setView('ending');
            else setView('reading');
          }}
        />
        <BottomNav active={tab} onChange={(t) => { setTab(t); setView('main'); }} />
      </>
    );
  }

  if (view === 'landing') {
    return (
      <>
        <LandingScreen
          onBack={() => setView('main')}
          onStartNew={handleStartNew}
          onContinue={handleContinueBranch}
          branches={branches.filter((b) => b.storyId === 'switch_kicks')}
          onReread={openReread}
        />
        <BottomNav active={tab} onChange={(t) => { setTab(t); setView('main'); }} />
        <StatusPanel branch={activeBranch} open={statusOpen} onClose={() => setStatusOpen(false)} />
      </>
    );
  }

  if (view === 'reading' && activeBranch) {
    return (
      <>
        <ReadingScreen
          branch={activeBranch}
          onBack={() => setView('landing')}
          onContinue={handleReadingContinue}
          onOpenStatus={() => setStatusOpen(true)}
          onReread={() => requireAuth('reread', () => setView('archive'))}
        />
        <BottomNav active={tab} onChange={(t) => { setTab(t); setView('main'); }} />
        <StatusPanel branch={activeBranch} open={statusOpen} onClose={() => setStatusOpen(false)} />
      </>
    );
  }

  if (view === 'stop' && activeBranch) {
    return (
      <>
        <StopPointScreen
          branch={activeBranch}
          onBack={() => setView('reading')}
          onSubmit={handleChoice}
        />
        <BottomNav active={tab} onChange={(t) => { setTab(t); setView('main'); }} />
      </>
    );
  }

  if (view === 'loading') {
    return <AILoadingScreen />;
  }

  if (view === 'continuation' && continuation) {
    return (
      <>
        <ContinuationScreen
          chapterTitle={continuation.chapterTitle}
          prose={continuation.prose}
          delta={continuation.delta}
          image={continuation.image}
          imageFit={continuation.imageFit}
          imagePosition={continuation.imagePosition}
          onContinue={handleContinuationDone}
        />
        <BottomNav active={tab} onChange={(t) => { setTab(t); setView('main'); }} />
      </>
    );
  }

  if (view === 'ending' && activeBranch?.ending) {
    return (
      <>
        <EndingScreen
          ending={activeBranch.ending}
          branch={activeBranch}
          onNewBranch={() => setView('landing')}
          onLibrary={() => { setTab('library'); setView('main'); }}
          onReread={() => requireAuth('reread', () => setView('archive'))}
        />
        <BottomNav active={tab} onChange={(t) => { setTab(t); setView('main'); }} />
      </>
    );
  }

  const lastActiveBranch = branches.find((b) => !b.isComplete) || branches[0] || null;

  // Main tabbed dashboard view
  return (
    <>
      {tab === 'library' && (
        <LibraryScreen
          onOpenStory={handleOpenStory}
          onOpenEndings={() => setShowEndings(true)}
          hasSave={branches.some((b) => !b.isComplete)}
          endingsCount={endings.length}
          installedStories={installedStories}
          onInstallStoryFile={isAdmin ? handleInstallStoryFile : undefined}
          onStartInstalledStory={handleStartInstalledStory}
        />
      )}
      {tab === 'story' && (
        <LandingScreen
          onBack={() => setTab('library')}
          onStartNew={handleStartNew}
          onContinue={handleContinueBranch}
          branches={branches.filter((b) => b.storyId === 'switch_kicks')}
          onReread={openReread}
        />
      )}
      {tab === 'saves' && (
        <PlaythroughsScreen
          branches={branches}
          onContinue={handleContinueById}
          onReplayFrom={handleReplayFrom}
          onDelete={handleDeleteBranch}
          onShareEnding={(id) => {
            const b = loadBranches().find((x) => x.id === id);
            if (b?.isComplete && b.ending) {
              setActiveBranchId(b.id);
              setView('ending');
            }
          }}
        />
      )}
      {tab === 'branches' && (
        <BranchMapScreen
          branches={branches}
          activeBranchId={activeBranchId}
          onOpenBranch={handleContinueBranch}
          onNewBranch={handleStartNew}
          onDelete={handleDeleteBranch}
        />
      )}
      {tab === 'characters' && <CharactersScreen branch={activeBranch} />}
      {tab === 'settings' && (
        <SettingsScreen
          onResetAll={handleResetAll}
          hasActiveBranch={!!lastActiveBranch}
          onOpenReread={lastActiveBranch ? () => openReread(lastActiveBranch) : undefined}
        />
      )}

      <BottomNav active={tab} onChange={setTab} />
      <StatusPanel branch={activeBranch} open={statusOpen} onClose={() => setStatusOpen(false)} />

      {showEndings && (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-black">
          <button
            onClick={() => setShowEndings(false)}
            className="fixed left-4 top-10 z-50 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-sm text-white backdrop-blur-md"
          >
            ← Back
          </button>
          <EndingsScreen endings={endings} />
        </div>
      )}
    </>
  );
};

export default InteractiveStoriesPlayer;

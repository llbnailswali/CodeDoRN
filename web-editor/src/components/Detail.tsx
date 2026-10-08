import { getPracticeHelpLevelOrDefault, stripStepComments } from '../utils/practiceHelp';
import React, { forwardRef, useState, useEffect, useLayoutEffect, useImperativeHandle, useRef, useMemo } from 'react';
import { AppTheme, UserStats } from '../types';
import { FiveStageLesson } from '../data/lessonStagesData';
import { getLessonSource } from '../utils/lessonSource';
import { soundFX } from '../utils/audio';
import { useBackClosesOverlay, closeTopOverlay, runBackGuard } from '../utils/overlayBack';
import { StorageManager } from '../utils/storage';
import { DetailedTutorialView } from './DetailedTutorialView';

// 6 Lesson Stage Components (1: Learn, 2: Explore, 3: Predict, 4: Write & Run, 5: Debug, 6: Mastered)
import { Learn } from './Learn';
import { WriteRun } from './WriteRun';
import { DebugIde } from './DebugIde';
import { Mastered } from './Mastered';
import { BossMasteredModal } from './BossMasteredModal';
import { SkipStageModal } from './SkipStageModal';
import { CODEDO_MASTER_WORLDS } from '../data/curriculum/masterCurriculumCatalog';

export type StageKey = 'learn' | 'explore' | 'predict' | 'writeRun' | 'debug' | 'mastered';

interface DetailProps {
  theme: AppTheme;
  initialLessonKey?: string;
  initialStageKey?: StageKey;
  // Opened as a standalone problem from the Practice tab's per-world list
  // (TaskListScreen), not the guided 6-stage Learn flow -- passing/failing
  // this single stage must not advance into the next stage or award lesson
  // completion/XP the normal 5-stage flow would. Purely additive: the normal
  // flow (isPracticeMode falsy) is completely unaffected.
  isPracticeMode?: boolean;
  /** Stage 2 example playground: use the selected example code and omit task UI/completion semantics. */
  tryItMode?: boolean;
  prefillCode?: string;
  // A "Surprise Me"-launched problem rather than one opened from
  // TaskListScreen's ordered per-World list -- hides the list-relative task
  // position/badge and swaps "Next Task" for "Next Random Task" (which picks
  // another random problem instead of advancing sequentially).
  isRandomPractice?: boolean;
  // Practice mode only: navigate straight into the next problem (same World +
  // mode) instead of returning to TaskListScreen. Given the next problem's
  // lesson key; the caller (App.tsx) is responsible for actually routing to
  // it. Absent/no next problem falls back to onExit. Not used when
  // isRandomPractice (see onPracticeNextRandomTask instead).
  onPracticeNextTask?: (nextLessonKey: string) => void;
  // Random-practice only: pick and open a brand new random problem instead
  // of a specific next one -- the caller (App.tsx) owns the actual
  // selection/routing.
  onPracticeNextRandomTask?: () => void;
  userStats: UserStats;
  onExit: () => void;
  onCompleteLesson: (earnedXP: number, worldId?: string) => void;
  // The React Native lesson screen shows one stage (Write & Run or Debug) from this component. Continuing from it must return to RN, which
  // owns the stages that follow, instead of moving on to the next stage here.
  onStageContinue?: () => void;
  onToggleTheme?: () => void;
  tapToRevealEnabled?: boolean;
  onToggleTapToReveal?: () => void;
}

// Lets the parent (App.tsx) drive stage-stack back navigation from the
// Android hardware back button without coupling lesson navigation to browser
// history.
export interface DetailHandle {
  goBack: () => void;
}

// The six possible stage keys, in their fixed relative order. Which ones are
// actually present for a given lesson depends on its data (see activeStages
// below) -- Learn and Mastered always run; the rest only run when the lesson
// provides that stage's data, per CODEDO_MASTER_PLAN.md's "topic-aware
// activity selection" (e.g. a purely conceptual topic may only need
// Learn -> Predict-as-MCQ -> Mastered).

const STAGE_LABELS: Record<StageKey, string> = {
  learn: 'LEARN',
  explore: 'EXPLORE',
  predict: 'PREDICT',
  writeRun: 'WRITE & RUN',
  debug: 'DEBUG',
  mastered: 'MASTERED',
};

// Title-case versions for "Continue to X" buttons, since stages can be
// skipped per-lesson (see activeStages) -- these must never be hardcoded
// in the child stage components.
const STAGE_CONTINUE_LABELS: Record<StageKey, string> = {
  learn: 'Learn',
  explore: 'Explore',
  predict: 'Predict',
  writeRun: 'Write & Run',
  debug: 'Debug',
  mastered: 'Mastered',
};

export const Detail = forwardRef<DetailHandle, DetailProps>(({
  theme,
  initialLessonKey = '',
  initialStageKey,
  isPracticeMode = false,
  tryItMode = false,
  prefillCode,
  isRandomPractice = false,
  onPracticeNextTask,
  onPracticeNextRandomTask,
  userStats,
  onExit,
  onCompleteLesson,
  onStageContinue,
  onToggleTheme,
  tapToRevealEnabled = true,
}, ref) => {
  const [currentLessonKey] = useState<string>(initialLessonKey);

  // Preserve reveal steps across stage navigation (when user clicks back/forward)
  const [learnRevealStep, setLearnRevealStep] = useState<number>(0);
  const [writeRunRevealStep, setWriteRunRevealStep] = useState<number>(0);
  const [debugRevealStep, setDebugRevealStep] = useState<number>(0);

  // Temporary developer/tester tools
  const [showSkipMenu, setShowSkipMenu] = useState<boolean>(false);
  useBackClosesOverlay(showSkipMenu, () => setShowSkipMenu(false));

  // Whether the World Boss celebration overlay is showing on top of the
  // final stage the learner just completed (see handleNextStage below).
  const [showBossCelebration, setShowBossCelebration] = useState<boolean>(false);

  // Write & Run state. No fallback lesson: an unrecognized key renders blank
  // (see the guard after the hooks below) rather than silently substituting
  // unrelated content.
  // Real lessons resolve straight from AVAILABLE_FIVE_STAGE_LESSONS; a
  // Practice-tab-only bank problem (never merged into that registry -- see
  // practiceBank/index.ts) resolves through the fallback here instead.
  const lessonData: FiveStageLesson | undefined = getLessonSource().resolveLesson(currentLessonKey);
  // Practice tasks below Beginner start from an editor with no numbered step comments.
  const writeRunData = React.useMemo(() => {
    const wr = lessonData?.writeRun;
    if (tryItMode && prefillCode !== undefined) {
      return {
        ...(wr ?? {
          challengeNumber: 1,
          totalChallenges: 1,
          xpReward: 0,
          title: 'Try this example',
          description: '',
          requirements: { name: '', params: '', returns: '' },
          fileName: 'Example.kt',
          solutionCode: prefillCode,
          sampleInput: '',
          expectedOutput: '',
          testCase: { call: '', expected: '' },
        }),
        title: 'Try this example',
        description: '',
        goal: undefined,
        fileName: 'Example.kt',
        initialCode: prefillCode,
        solutionCode: prefillCode,
        expectedOutput: '',
        sampleInput: '',
        testCase: { call: '', expected: '' },
        hardcodeCheck: undefined,
      };
    }
    if (!wr || !isPracticeMode || getPracticeHelpLevelOrDefault() === 'beginner') return wr;
    // A task with level hints keeps its numbered comments in the editor, collapsed, worded for this level. Tapping one
    // opens that hint (and unlocking a hint opens its comment), see WriteRun.
    const level = getPracticeHelpLevelOrDefault();
    const levelHints = level === 'intermediate' || level === 'experienced' ? wr.levelHints?.[level] : undefined;
    const stepCount = wr.description.split('\n\n').filter((para) => /^\d+\.\s/.test(para.trim())).length;
    if (levelHints && levelHints.comments.length === stepCount) {
      let next = 0;
      const initialCode = wr.initialCode
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map((line) => {
          const m = /^(\s*)\/\/\s*\d+\..*$/.exec(line);
          return m ? `${m[1]}${levelHints.comments[next++] ?? line.trim()}` : line;
        })
        .join('\n');
      if (next === stepCount) return { ...wr, initialCode };
    }
    const helperComments = wr.initialCode
      .replace(/\r\n/g, '\n')
      .split('\n')
      .filter((line) => /^\s*\/\/\s*\d+\./.test(line))
      .map((line) => line.trim());
    return { ...wr, initialCode: stripStepComments(wr.initialCode), helperComments };
  }, [lessonData, isPracticeMode, tryItMode, prefillCode]);
  const [userCode, setUserCode] = useState<string>(tryItMode && prefillCode !== undefined ? prefillCode : writeRunData?.initialCode ?? '');
  const [hasRunCode, setHasRunCode] = useState<boolean>(false);
  const [actualOutput, setActualOutput] = useState<string>('');

  // Detailed Tutorial state
  const [showDetailedTutorial, setShowDetailedTutorial] = useState<boolean>(false);
  const [showTutorialHint, setShowTutorialHint] = useState<boolean>(true);
  const [isHoveringTutorialBtn, setIsHoveringTutorialBtn] = useState<boolean>(false);
  const tutorialButtonRef = useRef<HTMLButtonElement>(null);
  const tutorialHintRef = useRef<HTMLDivElement>(null);

  const detailedTutorial = useMemo(() => {
    if (!lessonData) return null;
    return (
      getLessonSource().detailedTutorial(lessonData.id, lessonData) ||
      getLessonSource().detailedTutorial(currentLessonKey, lessonData) ||
      getLessonSource().detailedTutorial(lessonData.topicTitle, lessonData)
    );
  }, [lessonData, currentLessonKey]);

  useEffect(() => {
    // Show tutorial hint when entering a lesson with a tutorial
    if (detailedTutorial) {
      setShowTutorialHint(true);
    }
  }, [currentLessonKey, detailedTutorial]);

  // Click outside to dismiss tutorial hint
  useEffect(() => {
    if (!showTutorialHint) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        tutorialHintRef.current &&
        !tutorialHintRef.current.contains(target) &&
        tutorialButtonRef.current &&
        !tutorialButtonRef.current.contains(target)
      ) {
        setShowTutorialHint(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showTutorialHint]);

  useEffect(() => {
    setUserCode(tryItMode && prefillCode !== undefined ? prefillCode : writeRunData?.initialCode ?? '');
    setHasRunCode(false);
    setActualOutput('');
  }, [currentLessonKey, tryItMode, prefillCode, writeRunData?.initialCode]);

  // Which stages this specific lesson actually uses, in order. Learn and
  // Mastered always run; explore/predict/writeRun/debug only run when the
  // lesson provides that stage's data (see the FiveStageLesson comment).
  const activeStages: StageKey[] = [
    'learn',
    ...(lessonData?.writeRun || tryItMode ? (['writeRun'] as const) : []),
    ...(lessonData?.debug ? (['debug'] as const) : []),
    'mastered',
  ];

  // A World Boss's Mastered stage shows a distinct celebration overlay
  // (BossMasteredModal) instead of the ordinary inline Mastered page. Every
  // boss lesson's id ends in "boss" (e.g. "world-8-boss",
  // "world-12-generic-data-toolkit-boss") regardless of which factory
  // authored it -- see PITFALLS.md/world lesson data for the convention.
  const isBossLesson = Boolean(lessonData?.id.endsWith('boss'));
  const bossWorldEntry = lessonData
    ? CODEDO_MASTER_WORLDS.find((w) => w.id === lessonData.worldId)
    : undefined;
  const bossMasteredTopics = bossWorldEntry
    ? bossWorldEntry.lessons.filter((l) => !l.isBoss).map((l) => l.title)
    : [];
  const totalWorldsCount = CODEDO_MASTER_WORLDS.length;

  // Practice-list mode only (not random -- a random pick has no fixed
  // "position" in any one World's list): find the next problem in the same
  // World + mode list TaskListScreen shows, so "Next Task" can jump straight
  // there instead of returning to that list first. TaskListScreen only ever
  // shows practiceBank problems (never a lesson's own writeRun/debug task),
  // so this draws from the exact same bank, in the exact same order.
  const practiceMode: 'writeRun' | 'debug' | undefined =
    isPracticeMode && !isRandomPractice && (initialStageKey === 'writeRun' || initialStageKey === 'debug')
      ? initialStageKey
      : undefined;
  const practicePosition = useMemo(() => {
    if (!practiceMode || !lessonData) return undefined;
    const problems = getLessonSource().practiceProblems(practiceMode, lessonData.worldId);
    const currentIndex = problems.findIndex((p) => p.id === lessonData.id);
    if (currentIndex === -1) return undefined;
    const hasNext = currentIndex + 1 < problems.length;
    return {
      current: currentIndex + 1,
      total: problems.length,
      nextLessonKey: hasNext ? problems[currentIndex + 1].id : undefined,
    };
  }, [practiceMode, lessonData]);
  const nextPracticeLessonKey = practicePosition?.nextLessonKey;

  const handlePracticeNextTask = () => {
    if (isRandomPractice) {
      if (onPracticeNextRandomTask) {
        onPracticeNextRandomTask();
      } else {
        onExit();
      }
      return;
    }
    if (nextPracticeLessonKey && onPracticeNextTask) {
      // Match TaskListScreen's own Start/Continue click, which marks a
      // problem in_progress the moment the learner opens it -- otherwise a
      // task reached via "Next Task" would stay "not_started" until passed.
      if (practiceMode) {
        const nextFive = getLessonSource().resolveLesson(nextPracticeLessonKey);
        if (nextFive) {
          StorageManager.setPracticeProblemStatus(nextFive.id, practiceMode, 'in_progress');
        }
      }
      onPracticeNextTask(nextPracticeLessonKey);
    } else {
      onExit();
    }
  };
  // The just-cleared world's completion hasn't been persisted to userStats
  // yet at the moment this stage first renders (that happens on
  // onCompleteLesson, fired by Continue/Close below) -- so the displayed
  // "worlds mastered" count must account for this world too, not just what's
  // already saved.
  const projectedCompletedWorlds = Math.max(
    userStats.completedWorlds ?? 0,
    bossWorldEntry?.order ?? 0
  );
  // Stage navigation is an explicit stack rather than an inferred numeric
  // position. Advancing pushes the next stage; Back pops it. This preserves a
  // real visit trail when a learner jumps between stages from the stage rail.
  const [stageStack, setStageStack] = useState<StageKey[]>(() => [
    initialStageKey && activeStages.includes(initialStageKey) ? initialStageKey : activeStages[0],
  ]);
  const currentStageKey = stageStack[stageStack.length - 1];
  const stageScrollPositions = useRef<Partial<Record<StageKey, number>>>({});
  const currentStageIndex = activeStages.indexOf(currentStageKey);
  const nextStageKey = activeStages[currentStageIndex + 1];
  const nextStageLabel = nextStageKey ? STAGE_CONTINUE_LABELS[nextStageKey] : undefined;

  const saveCurrentStageScroll = () => {
    const rootEl = document.getElementById('root');
    stageScrollPositions.current[currentStageKey] = rootEl ? rootEl.scrollTop : window.scrollY;
  };

  const restoreCurrentStageScroll = () => {
    const scrollTop = stageScrollPositions.current[currentStageKey] ?? 0;
    const rootEl = document.getElementById('root');
    if (rootEl) {
      rootEl.scrollTo({ top: scrollTop, behavior: 'auto' });
    } else {
      window.scrollTo({ top: scrollTop, behavior: 'auto' });
    }
  };

  const openDetailedTutorial = () => {
    saveCurrentStageScroll();
    setShowDetailedTutorial(true);
  };

  const closeDetailedTutorial = () => {
    setShowDetailedTutorial(false);
    requestAnimationFrame(restoreCurrentStageScroll);
  };

  // A stage is a nested screen in a lesson. On Back, restore its saved
  // position; a stage visited for the first time starts at the top.
  useLayoutEffect(() => {
    restoreCurrentStageScroll();
  }, [currentStageKey]);

  const handleNextStage = () => {
    soundFX.playClick();
    if (onStageContinue) {
      onStageContinue();
      return;
    }
    if (currentStageIndex < activeStages.length - 1) {
      const upcomingStage = activeStages[currentStageIndex + 1];
      // A World Boss's celebration is an overlay shown on top of the stage
      // the learner just finished (dimmed behind it), not a separate
      // Mastered page -- so intercept the transition here instead of ever
      // pushing 'mastered' onto the stack for a boss lesson.
      if (upcomingStage === 'mastered' && isBossLesson) {
        soundFX.playSuccess();
        setShowBossCelebration(true);
        return;
      }
      saveCurrentStageScroll();
      setStageStack((previous) => [...previous, upcomingStage]);
    } else if (lessonData) {
      soundFX.playSuccess();
      onCompleteLesson(lessonData.mastered.xpEarned, lessonData.worldId);
    }
  };

  const handlePreviousStage = () => {
    soundFX.playClick();
    if (showDetailedTutorial) {
      closeDetailedTutorial();
      return;
    }
    if (stageStack.length > 1) {
      saveCurrentStageScroll();
      setStageStack((previous) => previous.slice(0, -1));
    } else {
      // A lesson may open directly on Write & Run from Practice. With no
      // earlier visited stage to pop, return to the calling screen rather
      // than inventing an unvisited stage.
      onExit();
    }
  };

  // Exposed so the app-wide hardware back-button handler (App.tsx) can step
  // back through lesson stages the same way the in-screen back arrow does.
  useImperativeHandle(ref, () => ({
    goBack: () => {
      // An open dialog / sheet / menu takes the back press first.
      if (closeTopOverlay()) return;
      // A screen with unsaved work (a changed Write & Run / Debug editor) asks before leaving.
      if (runBackGuard()) return;
      if (showDetailedTutorial) {
        closeDetailedTutorial();
        return;
      }
      handlePreviousStage();
    },
  }));

  // An unrecognized lesson key resolves to nothing -- render blank rather
  // than substituting an unrelated lesson's content.
  if (!lessonData) {
    return null;
  }

  const handleJumpToStage = (key: StageKey) => {
    soundFX.playClick();
    saveCurrentStageScroll();
    setStageStack((previous) => {
      const existingIndex = previous.lastIndexOf(key);
      // Selecting a previously visited stage behaves like Back: discard the
      // forward branch. Selecting a new stage pushes it onto the trail.
      return existingIndex >= 0 ? previous.slice(0, existingIndex + 1) : [...previous, key];
    });
  };

  const handleRunCode = () => {
    setHasRunCode(true);
  };

  const isDark = theme === 'dark';

  // The World Boss celebration overlay -- shown on top of whichever stage
  // (writeRun/debug/the shared stage container) was active when the boss's
  // final stage was completed. Each of those has its own early-return JSX
  // tree below, so this is rendered as a sibling inside every one of them
  // rather than in a single shared location.
  const bossCelebrationOverlay = showBossCelebration && (
    <BossMasteredModal
      theme={theme}
      worldTitle={bossWorldEntry?.title ?? lessonData.worldName}
      masteredTopics={bossMasteredTopics}
      completedWorlds={projectedCompletedWorlds}
      totalWorlds={totalWorldsCount}
      onContinue={() => {
        setShowBossCelebration(false);
        onCompleteLesson(lessonData.mastered.xpEarned, lessonData.worldId);
      }}
    />
  );

  // If detailed tutorial is requested, show full tutorial screen
  if (showDetailedTutorial && detailedTutorial) {
    return (
      <DetailedTutorialView
        tutorial={detailedTutorial}
        isDark={isDark}
        onBack={closeDetailedTutorial}
        onToggleTheme={onToggleTheme}
      />
    );
  }

  if (currentStageKey === 'writeRun' && writeRunData) {
    return (
      <div
        className={`fixed inset-0 z-40 w-full h-full h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col items-center justify-center p-0 select-none ${
          isDark ? 'bg-[#06080e]' : 'bg-[#0f141f]'
        }`}
      >
        <WriteRun
          data={writeRunData}
          topicTitle={lessonData.topicTitle}
          isDark={isDark}
          revealStep={writeRunRevealStep}
          setRevealStep={setWriteRunRevealStep}
          userCode={userCode}
          setUserCode={setUserCode}
          hasRunCode={hasRunCode}
          setHasRunCode={setHasRunCode}
          actualOutput={actualOutput}
          setActualOutput={setActualOutput}
          onRunCode={handleRunCode}
          onContinue={handleNextStage}
          onBack={handlePreviousStage}
          nextStageLabel={nextStageLabel}
          isPracticeMode={isPracticeMode}
          tryItMode={tryItMode}
          onToggleTheme={onToggleTheme}
          isRandomPractice={isRandomPractice}
          practicePosition={practicePosition}
          onPracticeNextTask={handlePracticeNextTask}
          onPracticeGoBack={onExit}
          onProblemPassed={() => StorageManager.setPracticeProblemStatus(lessonData.id, 'writeRun', 'completed')}
        />

        {bossCelebrationOverlay}
      </div>
    );
  }

  if (currentStageKey === 'debug' && lessonData.debug) {
    return (
      <div
        className={`fixed inset-0 z-40 w-full h-full h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col items-center justify-center p-0 select-none ${
          isDark ? 'bg-[#06080e]' : 'bg-[#0f141f]'
        }`}
      >
        <DebugIde
          data={lessonData.debug}
          topicTitle={lessonData.topicTitle}
          isDark={isDark}
          onToggleTheme={onToggleTheme}
          onContinue={handleNextStage}
          onProblemPassed={() => StorageManager.setPracticeProblemStatus(lessonData.id, 'debug', 'completed')}
          onBack={handlePreviousStage}
          nextStageLabel={nextStageLabel}
          isPracticeMode={isPracticeMode}
          isRandomPractice={isRandomPractice}
          practicePosition={practicePosition}
          onPracticeNextTask={handlePracticeNextTask}
          onPracticeGoBack={onExit}
        />

        {bossCelebrationOverlay}
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center select-none pb-2 transition-colors duration-300 ${
        isDark ? 'bg-[#0f131d] text-[#dfe2f1]' : 'bg-[#f1f4f9] text-slate-800'
      }`}
    >
      {/* ================= STICKY ELEVATED TOOLBAR (NATIVE ANDROID STYLE) ================= */}
      <header
        className={`sticky top-0 z-50 w-full pt-safe transition-colors duration-200 border-b ${
          isDark
            ? 'bg-[#0f131d]/95 backdrop-blur-md border-[#262c3d] shadow-[0_4px_16px_rgba(0,0,0,0.6)]'
            : 'bg-white/95 backdrop-blur-md border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)]'
        }`}
      >
        <div className="w-full max-w-2xl mx-auto px-2 sm:px-4 h-14 flex items-center justify-between">
          {/* Back button -- matches the shared Header's back button used on Listing */}
          <button
            aria-label="Go back"
            type="button"
            onClick={handlePreviousStage}
            className={`w-9 h-9 rounded-xl neu-raised flex items-center justify-center active:neu-pressed transition-all ${
              isDark ? 'bg-[#151b28] text-slate-200' : 'bg-[#e8eaf0] text-[#1e2433]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>

          {/* Current Step Name in Toolbar (Learn, Explore, Predict, Write & Run, Mastered) */}
          <div className="flex flex-col items-center justify-center">
            <h1
              className={`font-['Outfit'] font-bold text-base tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              {`Stage ${currentStageIndex + 1} - ${STAGE_LABELS[currentStageKey]}`}
            </h1>
          </div>

          {/* Action / Tools Area in Toolbar */}
          <div className="flex items-center gap-1.5">
            {/* Detailed Tutorial Book Button & Guidance Tooltip on Stage 1 Learn */}
            {currentStageIndex === 0 && (
              <div className="relative">
                <button
                  type="button"
                  id="stage1-tutorial-btn"
                  ref={tutorialButtonRef}
                  onClick={() => {
                    soundFX.playClick();
                    openDetailedTutorial();
                    setShowTutorialHint(false);
                  }}
                  onMouseEnter={() => setIsHoveringTutorialBtn(true)}
                  onMouseLeave={() => setIsHoveringTutorialBtn(false)}
                  className={`relative w-9 h-9 rounded-xl border flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm ${
                    isDark
                      ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25 hover:border-indigo-400/50'
                      : 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100 hover:border-indigo-300'
                  }`}
                  aria-label="Open detailed tutorial"
                  title="Detailed Tutorial"
                >
                  <span className="material-symbols-outlined text-[20px] text-indigo-600 dark:text-indigo-400">
                    auto_stories
                  </span>
                  <span className="tutorial-hint-dot" aria-hidden="true" />
                </button>

                {/* Guidance Tooltip */}
                {showTutorialHint && detailedTutorial && (
                  <div
                    ref={tutorialHintRef}
                    role="tooltip"
                    aria-live="polite"
                    className={`tutorial-hint ${
                      isDark ? 'tutorial-hint-dark text-slate-100' : 'tutorial-hint-light text-slate-900'
                    } absolute right-0 top-[calc(100%+12px)] z-50 w-72 max-w-[calc(100vw-28px)] rounded-2xl p-4`}
                  >
                    <span
                      className={`tutorial-hint-arrow ${
                        isDark ? 'tutorial-arrow-dark' : 'tutorial-arrow-light'
                      }`}
                      aria-hidden="true"
                    />

                    {/* Header with icon & close */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`flex items-center justify-center w-6 h-6 rounded-lg shrink-0 ${
                          isDark
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200/80'
                        }`}>
                          <span className="material-symbols-outlined text-[15px]">auto_stories</span>
                        </span>
                        <span className={`font-['Outfit'] font-bold text-[11px] tracking-wider uppercase truncate ${
                          isDark ? 'text-indigo-400' : 'text-slate-800'
                        }`}>
                          Detailed Tutorial
                        </span>
                      </div>

                      <button
                        type="button"
                        aria-label="Close tutorial hint"
                        onClick={(e) => {
                          e.stopPropagation();
                          soundFX.playClick();
                          setShowTutorialHint(false);
                        }}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                          isDark
                            ? 'text-slate-400 hover:text-slate-200 hover:bg-white/10'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>

                    {/* Explanatory text */}
                    <p className={`text-[12px] leading-relaxed mb-3.5 ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      Tap this{' '}
                      <span className={`inline-flex items-center gap-1 font-semibold px-1.5 py-0.5 rounded-md text-[11px] align-baseline ${
                        isDark
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-indigo-50 text-indigo-900 border border-indigo-200'
                      }`}>
                        <span className="material-symbols-outlined text-[13px] text-indigo-600 dark:text-indigo-400">auto_stories</span>
                        book icon
                      </span>{' '}
                      anytime for an in-depth guide with code breakdowns, mental models, and quick cheatsheets.
                    </p>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          openDetailedTutorial();
                          setShowTutorialHint(false);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl font-['Outfit'] text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 active:scale-[0.98] shadow-sm shadow-indigo-600/25 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">auto_stories</span>
                        <span>Open Guide</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          setShowTutorialHint(false);
                        }}
                        className={`px-3 py-2 rounded-xl font-['Outfit'] text-[11px] font-semibold border transition-all active:scale-[0.98] cursor-pointer ${
                          isDark
                            ? 'border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        Got it
                      </button>
                    </div>
                  </div>
                )}

                {/* Hover Tooltip (shows on hover after the main hint is closed) */}
                {!showTutorialHint && isHoveringTutorialBtn && (
                  <div
                    role="tooltip"
                    className={`absolute right-0 top-[calc(100%+8px)] z-50 whitespace-nowrap rounded-xl px-2.5 py-1.5 text-[11px] font-medium pointer-events-none transition-all flex items-center gap-1.5 shadow-xl ${
                      isDark
                        ? 'bg-[#151b28] text-slate-200 border border-white/10 shadow-black/60'
                        : 'bg-slate-900 text-white shadow-slate-900/25'
                    }`}
                  >
                    <span
                      className={`absolute right-[13px] -top-1 w-2 h-2 rotate-45 ${
                        isDark ? 'bg-[#151b28] border-l border-t border-white/10' : 'bg-slate-900'
                      }`}
                    />
                    <span className="material-symbols-outlined text-[14px] text-indigo-400">auto_stories</span>
                    <span>Detailed Tutorial Guide</span>
                  </div>
                )}
              </div>
            )}

            {/* Theme Toggle Button */}
            {onToggleTheme && (
              <button
                aria-label="Toggle theme"
                type="button"
                onClick={onToggleTheme}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
                  isDark
                    ? 'text-amber-400 hover:text-white hover:bg-white/10'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {isDark ? 'light_mode' : 'dark_mode'}
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="w-full max-w-2xl mx-auto px-1.5 sm:px-3 pt-2 flex flex-col">
        {/* ================= PROGRESS STRIP (SHOWS LESSON NAME + STEP PROGRESS) ================= */}
        <div className="relative mb-3">
        <section
          className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-all ${
            isDark
              ? 'bg-[#171b26] border-[#262c3d] shadow-sm'
              : 'bg-white/90 backdrop-blur-sm border-slate-200/80 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0"></span>
            <span
              className={`font-['Outfit'] font-semibold text-xs tracking-wide truncate ${
                isDark ? 'text-indigo-300' : 'text-indigo-900'
              }`}
            >
              {lessonData.topicTitle}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {activeStages.map((key, idx) => {
              const isActive = idx === currentStageIndex;
              const isPassed = idx < currentStageIndex;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleJumpToStage(key)}
                  className={`rounded-full transition-all cursor-pointer ${
                    isActive
                      ? 'w-2.5 h-2.5 bg-indigo-600 ring-2 ring-indigo-300 dark:ring-indigo-500/40'
                      : isPassed
                      ? 'w-2 h-2 bg-indigo-600'
                      : isDark
                      ? 'w-1.5 h-1.5 bg-slate-700'
                      : 'w-1.5 h-1.5 bg-slate-300'
                  }`}
                  title={`Stage ${idx + 1} - ${STAGE_LABELS[key]}`}
                />
              );
            })}
          </div>
        </section>
        </div>

        {/* ================= LEARN ================= */}
        {currentStageKey === 'learn' && (
          <Learn
            data={lessonData.learn}
            isDark={isDark}
            revealStep={learnRevealStep}
            setRevealStep={setLearnRevealStep}
            onContinue={handleNextStage}
            onSkip={() => setShowSkipMenu(true)}
            nextStageLabel={nextStageLabel}
            tapToRevealEnabled={tapToRevealEnabled}
          />
        )}

        {/* ================= MASTERED ================= */}
        {currentStageKey === 'mastered' && (
          isBossLesson ? (
            <BossMasteredModal
              theme={theme}
              worldTitle={bossWorldEntry?.title ?? lessonData.worldName}
              masteredTopics={bossMasteredTopics}
              completedWorlds={projectedCompletedWorlds}
              totalWorlds={totalWorldsCount}
              onContinue={handleNextStage}
            />
          ) : (
            <Mastered
              data={lessonData.mastered}
              stageName={lessonData.stageName}
              isDark={isDark}
              onContinue={handleNextStage}
            />
          )
        )}

        {/* Skip to Next Screen Modal (Jump to screens 2, 3, 4, 5...) */}
        <SkipStageModal
          isOpen={showSkipMenu}
          onClose={() => setShowSkipMenu(false)}
          activeStages={activeStages}
          currentStageIndex={currentStageIndex}
          onSelectStage={(targetStage) => {
            setLearnRevealStep(10);
            handleJumpToStage(targetStage);
          }}
          isDark={isDark}
        />

        {/* World Boss celebration -- an overlay shown on top of the stage the
            learner just finished (dimmed behind it via the modal's own
            backdrop), rather than a full Mastered page. */}
        {bossCelebrationOverlay}
      </div>
    </div>
  );
});

Detail.displayName = 'Detail';

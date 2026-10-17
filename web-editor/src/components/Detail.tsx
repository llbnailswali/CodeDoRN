import { getPracticeHelpLevelOrDefault, stripStepComments } from '../utils/practiceHelp';
import React, { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AppTheme } from '../types';
import { FiveStageLesson } from '../data/lessonStagesData';
import { getLessonSource } from '../utils/lessonSource';
import { soundFX } from '../utils/audio';
import { closeTopOverlay, runBackGuard } from '../utils/overlayBack';
import { StorageManager } from '../utils/storage';
import { WriteRun } from './WriteRun';
import { DebugIde } from './DebugIde';

export type StageKey = 'writeRun' | 'debug';

interface DetailProps {
  theme: AppTheme;
  initialLessonKey?: string;
  initialStageKey?: StageKey;
  isPracticeMode?: boolean;
  tryItMode?: boolean;
  prefillCode?: string;
  isRandomPractice?: boolean;
  onPracticeNextTask?: (nextLessonKey: string) => void;
  onPracticeNextRandomTask?: () => void;
  onExit: () => void;
  onCompleteLesson: (earnedXP: number, worldId?: string) => void;
  onStageContinue?: () => void;
  onToggleTheme?: () => void;
}

export interface DetailHandle {
  goBack: () => void;
}

const CONTINUE_LABELS: Record<StageKey, string> = {
  writeRun: 'Write & Run',
  debug: 'Debug',
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
  onExit,
  onCompleteLesson,
  onStageContinue,
  onToggleTheme,
}, ref) => {
  const [currentLessonKey] = useState(initialLessonKey);
  const [writeRunRevealStep, setWriteRunRevealStep] = useState(0);
  const lessonData: FiveStageLesson | undefined = getLessonSource().resolveLesson(currentLessonKey);

  const writeRunData = useMemo(() => {
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
    if (!wr || !isPracticeMode) return wr;

    const level = getPracticeHelpLevelOrDefault();
    const levelHints = level === 'intermediate' || level === 'experienced' ? wr.levelHints?.[level] : undefined;
    const stepCount = wr.description.split('\n\n').filter((para) => /^\d+\.\s/.test(para.trim())).length;
    if (levelHints && levelHints.comments.length === stepCount) {
      let next = 0;
      const initialCode = wr.initialCode
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map((line) => {
          const match = /^(\s*)\/\/\s*\d+\..*$/.exec(line);
          return match ? `${match[1]}${levelHints.comments[next++] ?? line.trim()}` : line;
        })
        .join('\n');
      if (next === stepCount) {
        return {
          ...wr,
          // No guidance is visible in a fresh Practice editor. The selected
          // level's comments are inserted only when the learner asks for one.
          initialCode: stripStepComments(initialCode),
          helperComments: levelHints.comments,
        };
      }
    }

    const helperComments = wr.initialCode
      .replace(/\r\n/g, '\n')
      .split('\n')
      .filter((line) => /^\s*\/\/\s*\d+\./.test(line))
      .map((line) => line.trim());
    return { ...wr, initialCode: stripStepComments(wr.initialCode), helperComments };
  }, [lessonData, isPracticeMode, tryItMode, prefillCode]);

  const [userCode, setUserCode] = useState(tryItMode && prefillCode !== undefined ? prefillCode : writeRunData?.initialCode ?? '');
  const [hasRunCode, setHasRunCode] = useState(false);
  const [actualOutput, setActualOutput] = useState('');

  useEffect(() => {
    setUserCode(tryItMode && prefillCode !== undefined ? prefillCode : writeRunData?.initialCode ?? '');
    setHasRunCode(false);
    setActualOutput('');
  }, [currentLessonKey, tryItMode, prefillCode, writeRunData?.initialCode]);

  const activeStages: StageKey[] = [
    ...(lessonData?.writeRun || tryItMode ? (['writeRun'] as const) : []),
    ...(lessonData?.debug ? (['debug'] as const) : []),
  ];
  const practiceMode: StageKey | undefined =
    isPracticeMode && !isRandomPractice && (initialStageKey === 'writeRun' || initialStageKey === 'debug')
      ? initialStageKey
      : undefined;
  const practicePosition = useMemo(() => {
    if (!practiceMode || !lessonData) return undefined;
    const problems = getLessonSource().practiceProblems(practiceMode, lessonData.worldId);
    const currentIndex = problems.findIndex((problem) => problem.id === lessonData.id);
    if (currentIndex === -1) return undefined;
    return {
      current: currentIndex + 1,
      total: problems.length,
      nextLessonKey: currentIndex + 1 < problems.length ? problems[currentIndex + 1].id : undefined,
    };
  }, [practiceMode, lessonData]);

  const handlePracticeNextTask = () => {
    if (isRandomPractice) {
      if (onPracticeNextRandomTask) onPracticeNextRandomTask();
      else onExit();
      return;
    }

    const nextLessonKey = practicePosition?.nextLessonKey;
    if (nextLessonKey && onPracticeNextTask) {
      if (practiceMode) {
        const nextLesson = getLessonSource().resolveLesson(nextLessonKey);
        if (nextLesson) StorageManager.setPracticeProblemStatus(nextLesson.id, practiceMode, 'in_progress');
      }
      onPracticeNextTask(nextLessonKey);
    } else {
      onExit();
    }
  };

  const [stageStack, setStageStack] = useState<StageKey[]>(() => [
    initialStageKey && activeStages.includes(initialStageKey) ? initialStageKey : activeStages[0] ?? 'writeRun',
  ]);
  const currentStageKey = stageStack[stageStack.length - 1];
  const stageScrollPositions = useRef<Partial<Record<StageKey, number>>>({});
  const currentStageIndex = activeStages.indexOf(currentStageKey);
  const nextStageKey = activeStages[currentStageIndex + 1];
  const nextStageLabel = nextStageKey ? CONTINUE_LABELS[nextStageKey] : 'Mastered';

  const saveCurrentStageScroll = () => {
    const root = document.getElementById('root');
    stageScrollPositions.current[currentStageKey] = root ? root.scrollTop : window.scrollY;
  };

  const restoreCurrentStageScroll = () => {
    const root = document.getElementById('root');
    const scrollTop = stageScrollPositions.current[currentStageKey] ?? 0;
    if (root) root.scrollTo({ top: scrollTop, behavior: 'auto' });
    else window.scrollTo({ top: scrollTop, behavior: 'auto' });
  };

  useLayoutEffect(() => {
    restoreCurrentStageScroll();
  }, [currentStageKey]);

  const handleNextStage = () => {
    soundFX.playClick();
    if (onStageContinue) {
      onStageContinue();
      return;
    }
    if (currentStageIndex >= 0 && currentStageIndex < activeStages.length - 1) {
      saveCurrentStageScroll();
      setStageStack((previous) => [...previous, activeStages[currentStageIndex + 1]]);
    } else if (lessonData) {
      soundFX.playSuccess();
      onCompleteLesson(lessonData.mastered.xpEarned, lessonData.worldId);
    }
  };

  const handlePreviousStage = () => {
    soundFX.playClick();
    if (stageStack.length > 1) {
      saveCurrentStageScroll();
      setStageStack((previous) => previous.slice(0, -1));
    } else {
      onExit();
    }
  };

  useImperativeHandle(ref, () => ({
    goBack: () => {
      if (closeTopOverlay()) return;
      if (runBackGuard()) return;
      handlePreviousStage();
    },
  }));

  if (!lessonData) return null;

  const isDark = theme === 'dark';
  if (currentStageKey === 'writeRun' && writeRunData) {
    return (
      <div className={`fixed inset-0 z-40 h-[100dvh] max-h-[100dvh] w-full overflow-hidden flex flex-col items-center justify-center p-0 select-none ${isDark ? 'bg-[#06080e]' : 'bg-[#0f141f]'}`}>
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
          onRunCode={() => setHasRunCode(true)}
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
      </div>
    );
  }

  if (currentStageKey === 'debug' && lessonData.debug) {
    return (
      <div className={`fixed inset-0 z-40 h-[100dvh] max-h-[100dvh] w-full overflow-hidden flex flex-col items-center justify-center p-0 select-none ${isDark ? 'bg-[#06080e]' : 'bg-[#0f141f]'}`}>
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
      </div>
    );
  }

  return null;
});

Detail.displayName = 'Detail';

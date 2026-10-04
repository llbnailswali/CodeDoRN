import type { FiveStageLesson } from '../lessonStagesData';
import type { PracticeWriteRunProblem, PracticeDebugProblem } from './types';

// Every bank problem needs a real FiveStageLesson behind it so the lessonKey-based routing can render it through the unchanged
// WriteRun.tsx/DebugIde.tsx components. Learn/Mastered are stubbed with short, real (non-empty) text. This file has no data imports,
// so the Write & Run / Debug stage (which loads one world's bank on its own) can use it without pulling in every world's lessons.
const stubLearn = (title: string) => ({
  title,
  subtitle: 'A Practice-tab challenge that combines a few things you already learned in this World.',
  exampleTag: 'PRACTICE',
  exampleTitle: title,
  language: 'Kotlin',
  codeSnippet: [] as string[],
  explanation: 'Solve this using the concepts from the lessons in this World -- open the Write & Run or Debug stage to begin.',
  keyIdeas: [] as { number: number; title: string; description: string }[],
  keyTakeaway: 'Practice problems mix multiple concepts from this World into one small program.',
});

const stubMastered = (title: string, xpReward: number) => ({
  topicTitle: title,
  summary: 'Nice work -- you combined multiple concepts from this World to solve a fresh problem.',
  passedCount: '1 / 1 PASSED',
  verificationItems: [{ title: 'Practice problem solved', subtitle: 'Applied multiple concepts from this World together' }],
  xpEarned: xpReward,
  streakDays: 1,
  accuracy: '100%',
});

export function wrapWriteRunAsLesson(problem: PracticeWriteRunProblem): FiveStageLesson {
  return {
    id: problem.id,
    worldId: problem.worldId,
    worldName: '',
    stageName: 'PRACTICE',
    topicTitle: problem.title,
    learn: stubLearn(problem.title),
    writeRun: problem,
    mastered: stubMastered(problem.title, problem.xpReward),
  };
}

export function wrapDebugAsLesson(problem: PracticeDebugProblem): FiveStageLesson {
  return {
    id: problem.id,
    worldId: problem.worldId,
    worldName: '',
    stageName: 'PRACTICE',
    topicTitle: problem.title,
    learn: stubLearn(problem.title),
    debug: problem,
    mastered: stubMastered(problem.title, 15),
  };
}


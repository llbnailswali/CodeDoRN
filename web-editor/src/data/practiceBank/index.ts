import { FiveStageLesson, AVAILABLE_FIVE_STAGE_LESSONS } from '../lessonStagesData';
import { PracticeWriteRunProblem, PracticeDebugProblem } from './types';
import { wrapWriteRunAsLesson, wrapDebugAsLesson } from './wrap';
import { WORLD_1_PRACTICE_WRITE_RUN, WORLD_1_PRACTICE_DEBUG } from './world1PracticeProblems';
import { WORLD_2_PRACTICE_WRITE_RUN, WORLD_2_PRACTICE_DEBUG } from './world2PracticeProblems';
import { WORLD_3_PRACTICE_WRITE_RUN, WORLD_3_PRACTICE_DEBUG } from './world3PracticeProblems';
import { WORLD_4_PRACTICE_WRITE_RUN, WORLD_4_PRACTICE_DEBUG } from './world4PracticeProblems';
import { WORLD_5_PRACTICE_WRITE_RUN, WORLD_5_PRACTICE_DEBUG } from './world5PracticeProblems';
import { WORLD_6_PRACTICE_WRITE_RUN, WORLD_6_PRACTICE_DEBUG } from './world6PracticeProblems';
import { WORLD_7_PRACTICE_WRITE_RUN, WORLD_7_PRACTICE_DEBUG } from './world7PracticeProblems';
import { WORLD_8_PRACTICE_WRITE_RUN, WORLD_8_PRACTICE_DEBUG } from './world8PracticeProblems';

// Extra Write & Run / Debug problems for the Practice tab, distinct from any
// lesson's own writeRun/debug -- keyed by worldId so TaskListScreen can
// append a world's bank entries after its lesson-derived ones. Add a new
// world's arrays here as they're authored; nothing else needs to change.
export const PRACTICE_WRITE_RUN_BANK: Record<string, PracticeWriteRunProblem[]> = {
  'world-1': WORLD_1_PRACTICE_WRITE_RUN,
  'world-2': WORLD_2_PRACTICE_WRITE_RUN,
  'world-3': WORLD_3_PRACTICE_WRITE_RUN,
  'world-4': WORLD_4_PRACTICE_WRITE_RUN,
  'world-5': WORLD_5_PRACTICE_WRITE_RUN,
  'world-6': WORLD_6_PRACTICE_WRITE_RUN,
  'world-7': WORLD_7_PRACTICE_WRITE_RUN,
  'world-8': WORLD_8_PRACTICE_WRITE_RUN,
};

export const PRACTICE_DEBUG_BANK: Record<string, PracticeDebugProblem[]> = {
  'world-1': WORLD_1_PRACTICE_DEBUG,
  'world-2': WORLD_2_PRACTICE_DEBUG,
  'world-3': WORLD_3_PRACTICE_DEBUG,
  'world-4': WORLD_4_PRACTICE_DEBUG,
  'world-5': WORLD_5_PRACTICE_DEBUG,
  'world-6': WORLD_6_PRACTICE_DEBUG,
  'world-7': WORLD_7_PRACTICE_DEBUG,
  'world-8': WORLD_8_PRACTICE_DEBUG,
};

// Deliberately kept SEPARATE from AVAILABLE_FIVE_STAGE_LESSONS (never merged
// into it) -- that registry is the canonical source of real, authored
// lessons, consulted by Learn/Listing/world-completion and progress-counting
// code that has no reason to know about Practice-tab-only bonus problems.
// Keyed by each problem's own `id`, which also doubles as the lessonKey used
// everywhere routing already expects (onOpenLesson(lessonKey, mode)).
export const PRACTICE_BANK_SYNTHETIC_LESSONS: Record<string, FiveStageLesson> = {
  ...Object.fromEntries(
    Object.values(PRACTICE_WRITE_RUN_BANK)
      .flat()
      .map((p) => [p.id, wrapWriteRunAsLesson(p)])
  ),
  ...Object.fromEntries(
    Object.values(PRACTICE_DEBUG_BANK)
      .flat()
      .map((p) => [p.id, wrapDebugAsLesson(p)])
  ),
};

// The one place these two registries are allowed to meet: resolving
// "whatever lessonKey the router was given" to its content, for a screen
// that must open EITHER a real lesson OR a bank problem (Detail.tsx) --
// checks the real lesson registry first, only falling back to the bank so a
// bank id can never accidentally shadow a real lesson's key.
export function resolveLessonOrPracticeContent(lessonKey: string): FiveStageLesson | undefined {
  return AVAILABLE_FIVE_STAGE_LESSONS[lessonKey] ?? PRACTICE_BANK_SYNTHETIC_LESSONS[lessonKey];
}

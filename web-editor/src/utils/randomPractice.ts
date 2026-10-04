/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserStats } from '../types';
import { CODEDO_MASTER_WORLDS, MasterWorldEntry } from '../data/curriculum/masterCurriculumCatalog';
import { PRACTICE_WRITE_RUN_BANK, PRACTICE_DEBUG_BANK } from '../data/practiceBank';
import { PracticeProblemMode } from './storage';

// Same "content is authored" check Listing.tsx/PracticeTab.tsx use -- a
// world only counts as practice-able once every one of its lessons has real
// five-stage data.
const hasCollectedWorldData = (world: MasterWorldEntry) =>
  world.lessons.length > 0 && world.lessons.every((l) => Boolean(l.fiveStageLessonKey));

export interface RandomPracticeTask {
  lessonKey: string;
  mode: PracticeProblemMode;
}

// "Surprise Me" / "Next Random Task": prefer a problem from a World already
// unlocked/learned so far; fall back to any World with practice content if
// none qualify yet -- there's no true per-lesson completion tracking to be
// more precise than this coarse, World-level signal (mirrors PracticeTab.tsx
// and Listing.tsx's own completedWorldsCount heuristic). Shared by
// PracticeTab.tsx's Surprise Me button and Detail.tsx's "Next Random Task"
// so both draw from the exact same candidate pool.
export function pickRandomPracticeTask(userStats: UserStats): RandomPracticeTask | null {
  const completedWorldsCount =
    (userStats.completedLessons ?? 0) > 15 ? userStats.completedWorlds ?? 0 : 0;

  const worlds = CODEDO_MASTER_WORLDS.filter(hasCollectedWorldData).map((world) => ({
    worldId: world.id,
    practiceLocked: world.order > completedWorldsCount + 1,
  }));

  const unlockedWorlds = worlds.filter((w) => !w.practiceLocked);
  const candidateWorlds = unlockedWorlds.length > 0 ? unlockedWorlds : worlds;

  // Draws only from the practiceBank -- matches TaskListScreen/PracticeTab,
  // which no longer surface a lesson's own writeRun/debug task here at all.
  const candidates: RandomPracticeTask[] = [];
  candidateWorlds.forEach(({ worldId }) => {
    (PRACTICE_WRITE_RUN_BANK[worldId] ?? []).forEach((problem) => candidates.push({ lessonKey: problem.id, mode: 'writeRun' }));
    (PRACTICE_DEBUG_BANK[worldId] ?? []).forEach((problem) => candidates.push({ lessonKey: problem.id, mode: 'debug' }));
  });
  if (candidates.length === 0) return null;

  return candidates[Math.floor(Math.random() * candidates.length)];
}

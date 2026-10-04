import type { FiveStageLesson } from '../data/lessonStagesData';
import type { DetailedTutorialData } from '../data/detailedTutorialsData';

/**
 * Where Detail (the lesson / stage screen) gets lesson content from. It does not import the lesson data itself, so the Write & Run /
 * Debug stage that the Android app opens can load just the one world it needs (data/stageLessonSource.ts) while the full web app
 * installs everything (data/fullLessonSource.ts). Install a source before rendering Detail.
 */
export interface LessonSource {
  /** A lesson (by registry key or id) or a Practice-tab bank problem (by id). */
  resolveLesson(key: string): FiveStageLesson | undefined;
  /** The Practice-tab problems of one World, in list order, for "Next Task". */
  practiceProblems(mode: 'writeRun' | 'debug', worldId: string): ReadonlyArray<{ id: string }>;
  /** The Learn stage's detailed tutorial, if the lesson has one. */
  detailedTutorial(keyOrTitle: string | undefined, lesson: FiveStageLesson): DetailedTutorialData | null;
}

let current: LessonSource | null = null;

export const setLessonSource = (source: LessonSource): void => {
  current = source;
};

export const getLessonSource = (): LessonSource => {
  if (!current) throw new Error('No lesson source installed: call setLessonSource() before rendering Detail.');
  return current;
};

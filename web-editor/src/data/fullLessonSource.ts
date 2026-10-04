import { LessonSource, setLessonSource } from '../utils/lessonSource';
import { PRACTICE_WRITE_RUN_BANK, PRACTICE_DEBUG_BANK, resolveLessonOrPracticeContent } from './practiceBank';
import { getDetailedTutorial } from './detailedTutorialsData';

/** Every lesson, every practice bank and every tutorial: what the full web app uses. Importing this pulls in all of the lesson data. */
export const fullLessonSource: LessonSource = {
  resolveLesson: (key) => resolveLessonOrPracticeContent(key),
  practiceProblems: (mode, worldId) => (mode === 'writeRun' ? PRACTICE_WRITE_RUN_BANK : PRACTICE_DEBUG_BANK)[worldId] ?? [],
  detailedTutorial: (keyOrTitle, lesson) => getDetailedTutorial(keyOrTitle, lesson),
};

export const installFullLessonSource = (): void => setLessonSource(fullLessonSource);

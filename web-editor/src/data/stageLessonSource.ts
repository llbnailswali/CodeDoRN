import type { FiveStageLesson } from './lessonStagesData';
import type { LessonSource } from '../utils/lessonSource';
import { CODEDO_MASTER_WORLDS } from './curriculum/masterCurriculumCatalog';
import { wrapWriteRunAsLesson, wrapDebugAsLesson } from './practiceBank/wrap';
import { STAGE_LESSON_KEY_TO_ID } from './stageLessonKeys';

/**
 * The lesson source for the Write & Run / Debug stage the Android app opens. The app tells the stage which lesson (or Practice task)
 * to show, so this loads only that lesson's World data (one small chunk) instead of every World's lessons, every practice bank and
 * every tutorial. A lesson it cannot find falls back to the full source, so nothing is ever unavailable, only slower.
 */
type Mod = Record<string, unknown>;

const lessonModules: Record<number, () => Promise<Mod>> = {
  1: () => import('./curriculum/world1LessonsData'),
  2: () => import('./curriculum/world2LessonsData'),
  3: () => import('./curriculum/world3LessonsData'),
  4: () => import('./curriculum/world4LessonsData'),
  5: () => import('./curriculum/world5LessonsData'),
  6: () => import('./curriculum/world6LessonsData'),
  7: () => import('./curriculum/world7LessonsData'),
  8: () => import('./curriculum/world8LessonsData'),
  9: () => import('./curriculum/world9LessonsData'),
  10: () => import('./curriculum/world10LessonsData'),
  11: () => import('./curriculum/world11LessonsData'),
  12: () => import('./curriculum/world12LessonsData'),
  13: () => import('./curriculum/world13LessonsData'),
  14: () => import('./curriculum/world14LessonsData'),
  15: () => import('./curriculum/world15LessonsData'),
  16: () => import('./curriculum/world16LessonsData'),
  17: () => import('./curriculum/world17LessonsData'),
};

const practiceModules: Record<number, () => Promise<Mod>> = {
  1: () => import('./practiceBank/world1PracticeProblems'),
  2: () => import('./practiceBank/world2PracticeProblems'),
  3: () => import('./practiceBank/world3PracticeProblems'),
  4: () => import('./practiceBank/world4PracticeProblems'),
  5: () => import('./practiceBank/world5PracticeProblems'),
  6: () => import('./practiceBank/world6PracticeProblems'),
  7: () => import('./practiceBank/world7PracticeProblems'),
  8: () => import('./practiceBank/world8PracticeProblems'),
};

const isLesson = (v: unknown): v is FiveStageLesson =>
  typeof v === 'object' && v !== null && typeof (v as FiveStageLesson).id === 'string' && typeof (v as FiveStageLesson).learn === 'object';

const worldOfLessonKey = (key: string): number | undefined => {
  const fromCatalog = CODEDO_MASTER_WORLDS.find((w) => w.lessons.some((l) => l.fiveStageLessonKey === key))?.order;
  if (fromCatalog) return fromCatalog;
  const m = key.match(/^world-(\d+)-/);
  return m ? Number(m[1]) : undefined;
};

const fullFallback = async (): Promise<LessonSource> => (await import('./fullLessonSource')).fullLessonSource;

export async function loadStageLessonSource(lessonKey: string): Promise<LessonSource> {
  const practice = lessonKey.match(/^world-(\d+)-practice-/);
  if (practice) {
    const world = Number(practice[1]);
    const load = practiceModules[world];
    if (!load) return fullFallback();
    const mod = await load();
    const writeRun = (mod[`WORLD_${world}_PRACTICE_WRITE_RUN`] ?? []) as Parameters<typeof wrapWriteRunAsLesson>[0][];
    const debug = (mod[`WORLD_${world}_PRACTICE_DEBUG`] ?? []) as Parameters<typeof wrapDebugAsLesson>[0][];
    const wrapped = new Map<string, FiveStageLesson>();
    const lookup = (id: string): FiveStageLesson | undefined => {
      if (!wrapped.has(id)) {
        const w = writeRun.find((p) => p.id === id);
        const d = debug.find((p) => p.id === id);
        if (w) wrapped.set(id, wrapWriteRunAsLesson(w));
        else if (d) wrapped.set(id, wrapDebugAsLesson(d));
      }
      return wrapped.get(id);
    };
    if (!lookup(lessonKey)) return fullFallback();
    return {
      resolveLesson: lookup,
      practiceProblems: (mode, worldId) => (worldId === `world-${world}` ? (mode === 'writeRun' ? writeRun : debug) : []),
      detailedTutorial: () => null,
    };
  }

  const world = worldOfLessonKey(lessonKey);
  const load = world ? lessonModules[world] : undefined;
  if (!world || !load) return fullFallback();
  const mod = await load();
  const byId = new Map<string, FiveStageLesson>();
  for (const value of Object.values(mod)) {
    for (const item of Array.isArray(value) ? value : [value]) if (isLesson(item)) byId.set(item.id, item);
  }
  const lookup = (key: string): FiveStageLesson | undefined => byId.get(STAGE_LESSON_KEY_TO_ID[key] ?? key);
  if (!lookup(lessonKey)) return fullFallback();
  return {
    resolveLesson: lookup,
    practiceProblems: () => [],
    detailedTutorial: () => null,
  };
}

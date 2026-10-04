import { LessonQuestion } from '../types';
import { CODEDO_MASTER_WORLDS, MasterWorldEntry } from '../data/curriculum/masterCurriculumCatalog';
import { AVAILABLE_FIVE_STAGE_LESSONS, FiveStageLesson, PredictQuestion } from '../data/lessonStagesData';

/**
 * The Quiz tab's question bank: every Predict question of every authored lesson, grouped by World. Predict questions are
 * the app's multiple-choice code-reasoning checks, so they are adapted to the `LessonQuestion` shape the drill runner
 * (`ActiveLessonView`) already plays. Nothing is duplicated or authored twice: a lesson's Predict stage and the Quiz tab read
 * the same question objects.
 */

export interface QuizWorld {
  id: string;
  order: number;
  title: string;
  questions: LessonQuestion[];
}

/** Questions answered per quiz session. */
export const QUIZ_SESSION_SIZE = 10;
const QUESTION_XP = 10;

// Same "content is authored" rule Listing.tsx and PracticeTab.tsx use: a world is playable once every lesson has real data.
const isAuthored = (world: MasterWorldEntry) =>
  world.lessons.length > 0 && world.lessons.every((lesson) => Boolean(lesson.fiveStageLessonKey));

function adapt(p: PredictQuestion, lesson: FiveStageLesson, world: MasterWorldEntry, lessonKey: string): LessonQuestion {
  return {
    // Predict ids are only unique inside a lesson (six Boss lessons reuse `boss-predict-1`), so the lesson key is part of the id.
    id: `${lessonKey}:${p.id}`,
    challengeType: 'multiple-choice',
    stepNumber: 1,
    totalSteps: 1,
    worldId: world.id,
    worldName: world.title,
    lessonId: lesson.id,
    topicTag: lesson.topicTitle,
    skill: lesson.id,
    xpReward: QUESTION_XP,
    question: p.prompt,
    codeFileName: 'Main.kt',
    languageVersion: 'Kotlin',
    codeSnippet: p.code ?? [],
    options: p.options.map((option) => ({ id: option.id, title: option.label, subtitle: '', isCorrect: option.isCorrect })),
    hint: `Look closely at ${p.explanation.codeRef}. Trace it step by step, then try again.`,
    explanation: {
      title: 'Why',
      text: p.explanation.detail,
      highlights: [p.explanation.codeRef],
    },
  };
}

let cache: QuizWorld[] | null = null;

/** Every authored World that has at least one quiz question, in curriculum order. Built once. */
export function getQuizWorlds(): QuizWorld[] {
  if (cache) return cache;
  cache = CODEDO_MASTER_WORLDS.filter(isAuthored)
    .map((world) => {
      const seen = new Set<string>();
      const questions: LessonQuestion[] = [];
      for (const meta of world.lessons) {
        const lesson = meta.fiveStageLessonKey ? AVAILABLE_FIVE_STAGE_LESSONS[meta.fiveStageLessonKey] : undefined;
        for (const p of lesson?.predict?.questions ?? []) {
          // Several lesson keys can point at one lesson object, and a question id is unique to its lesson.
          if (!lesson || !meta.fiveStageLessonKey || !p.options.some((o) => o.isCorrect)) continue;
          const key = `${meta.fiveStageLessonKey}:${p.id}`;
          if (seen.has(key)) continue;
          seen.add(key);
          questions.push(adapt(p, lesson, world, meta.fiveStageLessonKey));
        }
      }
      return { id: world.id, order: world.order, title: world.title, questions };
    })
    .filter((world) => world.questions.length > 0);
  return cache;
}

const shuffled = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

/** Numbers a session's questions ("Step 3 of 10") without changing the shared question objects. */
const numbered = (questions: LessonQuestion[]): LessonQuestion[] =>
  questions.map((q, index) => ({ ...q, stepNumber: index + 1, totalSteps: questions.length }));

export const countCorrect = (world: QuizWorld, correctIds: Set<string>) =>
  world.questions.reduce((total, q) => total + (correctIds.has(q.id) ? 1 : 0), 0);

/**
 * One World's session: the next questions in lesson order that were not answered correctly yet, so "Continue" really continues.
 * Once the whole World is answered, it becomes a random review of the same size.
 */
export function buildWorldSession(world: QuizWorld, correctIds: Set<string>, size = QUIZ_SESSION_SIZE): LessonQuestion[] {
  const remaining = world.questions.filter((q) => !correctIds.has(q.id));
  return numbered(remaining.length > 0 ? remaining.slice(0, size) : shuffled(world.questions).slice(0, size));
}

/**
 * Quick Quiz: a random mix, different on every tap, from the Worlds the learner has reached (up to `reachedOrder`), so it only asks about concepts that were
 * taught. Falls back to every World when those have fewer questions than a session needs.
 */
export function buildQuickSession(worlds: QuizWorld[], reachedOrder: number, size = QUIZ_SESSION_SIZE): LessonQuestion[] {
  const reached = worlds.filter((world) => world.order <= reachedOrder).flatMap((world) => world.questions);
  const pool = reached.length >= size ? reached : worlds.flatMap((world) => world.questions);
  return numbered(shuffled(pool).slice(0, size));
}

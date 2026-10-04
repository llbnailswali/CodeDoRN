import { CURRICULUM_WORLDS } from './curriculumData';
import { QuizQuestion } from './quizQuestions';
import { WORLD_1_QUIZ } from './world1Quiz';

// TEMPORARY: while the expanded questions are being reviewed, the Quiz offers only these lessons (Int & Long, Strings, String Templates).
// Delete this set and the filter in getQuizWorlds() to offer the whole bank again.
const REVIEW_LESSON_IDS = new Set(['world-1-int-long', 'world-1-string', 'world-1-string-templates']);

export interface QuizWorld { order: number; title: string; questions: QuizQuestion[] }
export type QuizProgress = Record<string, { correct: number; wrong: number; last: number }>;

// The lesson catalog is the single source of truth for the native quiz bank.
export function getQuizWorlds(): QuizWorld[] {
  // Only authored quiz banks belong in QuizTab. Lesson prediction questions are
  // used by the lesson flow and must not be presented as a separate quiz bank.
  const banks: Record<number, QuizQuestion[]> = { 1: WORLD_1_QUIZ.filter((q) => REVIEW_LESSON_IDS.has(q.lessonId)) };
  return CURRICULUM_WORLDS
    .filter((world) => Boolean(banks[world.order]))
    .map((world) => ({ order: world.order, title: world.title, questions: banks[world.order] }));
}

export function worldStats(world: QuizWorld, progress: QuizProgress) {
  const seen = world.questions.filter((q) => progress[q.id]).length;
  const correct = world.questions.filter((q) => (progress[q.id]?.correct ?? 0) > 0).length;
  const missed = world.questions.filter((q) => (progress[q.id]?.wrong ?? 0) > 0 && (progress[q.id]?.correct ?? 0) === 0).length;
  return { total: world.questions.length, seen, correct, missed };
}

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);
export function buildSession(worlds: QuizWorld[], order?: number, progress: QuizProgress = {}, review = false, size = 10) {
  const pool = order ? worlds.find((w) => w.order === order)?.questions ?? [] : worlds.filter((w) => w.order <= Math.max(1, ...worlds.map((w) => w.order))).flatMap((w) => w.questions);
  // A World card always starts the complete authored bank. Review is the only flow that filters to unresolved mistakes.
  const filtered = review ? pool.filter((q) => (progress[q.id]?.wrong ?? 0) > 0 && (progress[q.id]?.correct ?? 0) === 0) : pool;
  // The web runs a World bank in one go; Quick Quiz remains a short ten-question session.
  const sessionSize = order ? pool.length : size;
  return shuffle(filtered.length ? filtered : pool).slice(0, sessionSize);
}

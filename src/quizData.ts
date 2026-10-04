import { CURRICULUM_WORLDS } from './curriculumData';
import { QuizQuestion } from './quizQuestions';
import { QuizBoss, QuizSet, WORLD_1_QUIZ_BOSS, WORLD_1_QUIZ_SETS } from './quizSets';
import { WORLD_1_QUIZ } from './world1Quiz';

/** A quiz set with the questions a set quiz asks: every question of its lessons plus the set's own cross-lesson questions. */
export interface QuizSetWithQuestions extends QuizSet { questions: QuizQuestion[] }

const SETS_BY_WORLD: Record<number, QuizSet[]> = { 1: WORLD_1_QUIZ_SETS };

const DIFFICULTY_RANK: Record<string, number> = { easy: 0, medium: 1, hard: 2 };

/**
 * Sets in lesson order; inside a set, a FIXED order (nothing is shuffled, so a quiz can be left and continued): the lessons' own questions by
 * lesson and then easy to hard, and the set's cross-lesson questions last, since they need every lesson of the set.
 */
export function getQuizSets(order: number, bank: QuizQuestion[]): QuizSetWithQuestions[] {
  return (SETS_BY_WORLD[order] ?? [])
    .map((set) => {
      const own = bank
        .map((q, position) => ({ q, position }))
        .filter(({ q }) => q.setId === set.id || (!q.setId && set.lessonIds.includes(q.lessonId)));
      own.sort((a, b) => {
        const key = (x: { q: QuizQuestion; position: number }) => [x.q.setId ? 1 : 0, set.lessonIds.indexOf(x.q.lessonId), DIFFICULTY_RANK[x.q.difficulty] ?? 1, x.position];
        const ka = key(a);
        const kb = key(b);
        for (let i = 0; i < ka.length; i++) if (ka[i] !== kb[i]) return ka[i] - kb[i];
        return 0;
      });
      return { ...set, questions: own.map((x) => x.q) };
    })
    .filter((set) => set.questions.length > 0);
}

/** The boss quiz of a World: the boss lesson's questions in a fixed order (easy to hard). It is separate from the sets and from the full quiz. */
export interface QuizBossWithQuestions extends QuizBoss { questions: QuizQuestion[] }

const BOSS_BY_WORLD: Record<number, QuizBoss> = { 1: WORLD_1_QUIZ_BOSS };

export function getQuizBoss(order: number, bank: QuizQuestion[]): QuizBossWithQuestions | null {
  const boss = BOSS_BY_WORLD[order];
  if (!boss) return null;
  const questions = bank
    .map((q, position) => ({ q, position }))
    .filter(({ q }) => q.lessonId === boss.lessonId)
    .sort((a, b) => (DIFFICULTY_RANK[a.q.difficulty] ?? 1) - (DIFFICULTY_RANK[b.q.difficulty] ?? 1) || a.position - b.position)
    .map((x) => x.q);
  return questions.length ? { ...boss, questions } : null;
}

/** The full quiz: every set's questions, sets in lesson order. The boss quiz is not part of it. */
export const fullQuizQuestions = (sets: QuizSetWithQuestions[]): QuizQuestion[] => sets.flatMap((set) => set.questions);

/**
 * Where a quiz stands: nothing answered ('start'), partly answered ('continue'), everything answered but some questions still missed and
 * waiting for review ('review'), or everything answered with nothing left to review ('retake' = finished). A quiz only counts as finished
 * when every question is answered AND none is left to review; `missed` is a question answered wrong and never since answered right.
 */
export function quizPassStatus(questions: QuizQuestion[], pass: QuizPass, progress: QuizProgress = {}) {
  const answered = questions.filter((q) => pass[q.id]).length;
  const missed = questions.filter((q) => isMissedAnswer(progress[q.id])).length;
  const state: 'start' | 'continue' | 'review' | 'retake' = answered === 0 ? 'start' : answered < questions.length ? 'continue' : missed > 0 ? 'review' : 'retake';
  return { answered, total: questions.length, missed, state };
}

export interface QuizWorld { order: number; title: string; questions: QuizQuestion[] }
export type QuizProgress = Record<string, { correct: number; wrong: number; last: number; /** Whether the most recent answer was right. */ lastCorrect?: boolean }>;

/**
 * A question is "to review" when its MOST RECENT answer was wrong; answering it right clears it. (Entries saved before lastCorrect existed
 * fall back to: answered wrong and never right.) Counting "ever right" instead meant a question you had once got right could never again
 * be to review, however many times you missed it afterwards.
 */
export const isMissedAnswer = (entry: QuizProgress[string] | undefined): boolean =>
  !!entry && (entry.lastCorrect !== undefined ? entry.lastCorrect === false : entry.wrong > 0 && entry.correct === 0);
/** The questions answered in the CURRENT pass through the ordered quizzes (sets and the full quiz). Retaking a quiz clears its questions from it;
 *  QuizProgress above is the lifetime record and is never reset by a retake. */
export type QuizPass = Record<string, true>;

// The lesson catalog is the single source of truth for the native quiz bank.
/** EVERY question of a World's bank, unfiltered (the review filter below hides some lessons from the Quiz): used to reset all of a World's stats. */
export const getQuizWorldBank = (order: number): QuizQuestion[] => (order === 1 ? WORLD_1_QUIZ : []);

export function getQuizWorlds(): QuizWorld[] {
  // Only authored quiz banks belong in QuizTab. Lesson prediction questions are
  // used by the lesson flow and must not be presented as a separate quiz bank.
  const banks: Record<number, QuizQuestion[]> = { 1: WORLD_1_QUIZ };
  return CURRICULUM_WORLDS
    .filter((world) => Boolean(banks[world.order]))
    .map((world) => ({ order: world.order, title: world.title, questions: banks[world.order] }));
}

export function worldStats(world: QuizWorld, progress: QuizProgress) {
  const seen = world.questions.filter((q) => progress[q.id]).length;
  const correct = world.questions.filter((q) => (progress[q.id]?.correct ?? 0) > 0).length;
  const missed = world.questions.filter((q) => isMissedAnswer(progress[q.id])).length;
  return { total: world.questions.length, seen, correct, missed };
}

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);
export function buildSession(worlds: QuizWorld[], order?: number, progress: QuizProgress = {}, review = false, size = 10) {
  const pool = order ? worlds.find((w) => w.order === order)?.questions ?? [] : worlds.filter((w) => w.order <= Math.max(1, ...worlds.map((w) => w.order))).flatMap((w) => w.questions);
  // A World card always starts the complete authored bank. Review is the only flow that filters to unresolved mistakes.
  const filtered = review ? pool.filter((q) => isMissedAnswer(progress[q.id])) : pool;
  // The web runs a World bank in one go; Quick Quiz remains a short ten-question session.
  const sessionSize = order ? pool.length : size;
  return shuffle(filtered.length ? filtered : pool).slice(0, sessionSize);
}

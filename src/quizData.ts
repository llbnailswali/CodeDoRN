import { CURRICULUM_WORLDS } from './curriculumData';
import { QuizQuestion } from './quizQuestions';
import { QuizBoss, QuizSet, WORLD_1_QUIZ_BOSS, WORLD_1_QUIZ_SETS, WORLD_2_QUIZ_BOSS, WORLD_2_QUIZ_SETS, WORLD_3_QUIZ_BOSS, WORLD_3_QUIZ_SETS, WORLD_4_QUIZ_BOSS, WORLD_4_QUIZ_SETS, WORLD_5_QUIZ_BOSS, WORLD_5_QUIZ_SETS, WORLD_6_QUIZ_BOSS, WORLD_6_QUIZ_SETS, WORLD_7_QUIZ_BOSS, WORLD_7_QUIZ_SETS, WORLD_8_QUIZ_BOSS, WORLD_8_QUIZ_SETS, WORLD_9_QUIZ_BOSS, WORLD_9_QUIZ_SETS, WORLD_10_QUIZ_BOSS, WORLD_10_QUIZ_SETS, WORLD_11_QUIZ_BOSS, WORLD_11_QUIZ_SETS, WORLD_12_QUIZ_BOSS, WORLD_12_QUIZ_SETS, WORLD_13_QUIZ_BOSS, WORLD_13_QUIZ_SETS, WORLD_14_QUIZ_BOSS, WORLD_14_QUIZ_SETS, WORLD_15_QUIZ_BOSS, WORLD_15_QUIZ_SETS, WORLD_16_QUIZ_BOSS, WORLD_16_QUIZ_SETS } from './quizSets';
import { WORLD_1_QUIZ } from './world1Quiz';
import { WORLD_2_BOSS_QUIZ, WORLD_2_QUIZ } from './world2Quiz';
import { WORLD_3_BOSS_QUIZ, WORLD_3_QUIZ } from './world3Quiz';
import { WORLD_4_BOSS_QUIZ, WORLD_4_QUIZ } from './world4Quiz';
import { WORLD_5_BOSS_QUIZ, WORLD_5_QUIZ } from './world5Quiz';
import { WORLD_6_BOSS_QUIZ, WORLD_6_QUIZ } from './world6Quiz';
import { WORLD_7_BOSS_QUIZ, WORLD_7_QUIZ } from './world7Quiz';
import { WORLD_8_BOSS_QUIZ, WORLD_8_QUIZ } from './world8Quiz';
import { WORLD_9_BOSS_QUIZ, WORLD_9_QUIZ } from './world9Quiz';
import { WORLD_10_BOSS_QUIZ, WORLD_10_QUIZ } from './world10Quiz';
import { WORLD_11_BOSS_QUIZ, WORLD_11_QUIZ } from './world11Quiz';
import { WORLD_12_BOSS_QUIZ, WORLD_12_QUIZ } from './world12Quiz';
import { WORLD_13_BOSS_QUIZ, WORLD_13_QUIZ } from './world13Quiz';
import { WORLD_14_BOSS_QUIZ, WORLD_14_QUIZ } from './world14Quiz';
import { WORLD_15_BOSS_QUIZ, WORLD_15_QUIZ } from './world15Quiz';
import { WORLD_16_BOSS_QUIZ, WORLD_16_QUIZ } from './world16Quiz';

/** A quiz set with the questions a set quiz asks: every question of its lessons plus the set's own cross-lesson questions. */
export interface QuizSetWithQuestions extends QuizSet { questions: QuizQuestion[] }

const SETS_BY_WORLD: Record<number, QuizSet[]> = { 1: WORLD_1_QUIZ_SETS, 2: WORLD_2_QUIZ_SETS, 3: WORLD_3_QUIZ_SETS, 4: WORLD_4_QUIZ_SETS, 5: WORLD_5_QUIZ_SETS, 6: WORLD_6_QUIZ_SETS, 7: WORLD_7_QUIZ_SETS, 8: WORLD_8_QUIZ_SETS, 9: WORLD_9_QUIZ_SETS, 10: WORLD_10_QUIZ_SETS, 11: WORLD_11_QUIZ_SETS, 12: WORLD_12_QUIZ_SETS, 13: WORLD_13_QUIZ_SETS, 14: WORLD_14_QUIZ_SETS, 15: WORLD_15_QUIZ_SETS, 16: WORLD_16_QUIZ_SETS };

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

const BOSS_BY_WORLD: Record<number, QuizBoss> = { 1: WORLD_1_QUIZ_BOSS, 2: WORLD_2_QUIZ_BOSS, 3: WORLD_3_QUIZ_BOSS, 4: WORLD_4_QUIZ_BOSS, 5: WORLD_5_QUIZ_BOSS, 6: WORLD_6_QUIZ_BOSS, 7: WORLD_7_QUIZ_BOSS, 8: WORLD_8_QUIZ_BOSS, 9: WORLD_9_QUIZ_BOSS, 10: WORLD_10_QUIZ_BOSS, 11: WORLD_11_QUIZ_BOSS, 12: WORLD_12_QUIZ_BOSS, 13: WORLD_13_QUIZ_BOSS, 14: WORLD_14_QUIZ_BOSS, 15: WORLD_15_QUIZ_BOSS, 16: WORLD_16_QUIZ_BOSS };

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
export const getQuizWorldBank = (order: number): QuizQuestion[] => ({ 1: WORLD_1_QUIZ, 2: [...WORLD_2_QUIZ, ...WORLD_2_BOSS_QUIZ], 3: [...WORLD_3_QUIZ, ...WORLD_3_BOSS_QUIZ], 4: [...WORLD_4_QUIZ, ...WORLD_4_BOSS_QUIZ], 5: [...WORLD_5_QUIZ, ...WORLD_5_BOSS_QUIZ], 6: [...WORLD_6_QUIZ, ...WORLD_6_BOSS_QUIZ], 7: [...WORLD_7_QUIZ, ...WORLD_7_BOSS_QUIZ], 8: [...WORLD_8_QUIZ, ...WORLD_8_BOSS_QUIZ], 9: [...WORLD_9_QUIZ, ...WORLD_9_BOSS_QUIZ], 10: [...WORLD_10_QUIZ, ...WORLD_10_BOSS_QUIZ], 11: [...WORLD_11_QUIZ, ...WORLD_11_BOSS_QUIZ], 12: [...WORLD_12_QUIZ, ...WORLD_12_BOSS_QUIZ], 13: [...WORLD_13_QUIZ, ...WORLD_13_BOSS_QUIZ], 14: [...WORLD_14_QUIZ, ...WORLD_14_BOSS_QUIZ], 15: [...WORLD_15_QUIZ, ...WORLD_15_BOSS_QUIZ], 16: [...WORLD_16_QUIZ, ...WORLD_16_BOSS_QUIZ] }[order] ?? []);

export function getQuizWorlds(): QuizWorld[] {
  // Only authored quiz banks belong in QuizTab. Lesson prediction questions are
  // used by the lesson flow and must not be presented as a separate quiz bank.
  const banks: Record<number, QuizQuestion[]> = { 1: WORLD_1_QUIZ, 2: [...WORLD_2_QUIZ, ...WORLD_2_BOSS_QUIZ], 3: [...WORLD_3_QUIZ, ...WORLD_3_BOSS_QUIZ], 4: [...WORLD_4_QUIZ, ...WORLD_4_BOSS_QUIZ], 5: [...WORLD_5_QUIZ, ...WORLD_5_BOSS_QUIZ], 6: [...WORLD_6_QUIZ, ...WORLD_6_BOSS_QUIZ], 7: [...WORLD_7_QUIZ, ...WORLD_7_BOSS_QUIZ], 8: [...WORLD_8_QUIZ, ...WORLD_8_BOSS_QUIZ], 9: [...WORLD_9_QUIZ, ...WORLD_9_BOSS_QUIZ], 10: [...WORLD_10_QUIZ, ...WORLD_10_BOSS_QUIZ], 11: [...WORLD_11_QUIZ, ...WORLD_11_BOSS_QUIZ], 12: [...WORLD_12_QUIZ, ...WORLD_12_BOSS_QUIZ], 13: [...WORLD_13_QUIZ, ...WORLD_13_BOSS_QUIZ], 14: [...WORLD_14_QUIZ, ...WORLD_14_BOSS_QUIZ], 15: [...WORLD_15_QUIZ, ...WORLD_15_BOSS_QUIZ], 16: [...WORLD_16_QUIZ, ...WORLD_16_BOSS_QUIZ] };
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

export function quizProgressStats(progress: QuizProgress) {
  const worlds = getQuizWorlds().map((world) => {
    const stats = worldStats(world, progress);
    const correctAnswers = world.questions.reduce((sum, question) => sum + (progress[question.id]?.correct ?? 0), 0);
    const wrongAnswers = world.questions.reduce((sum, question) => sum + (progress[question.id]?.wrong ?? 0), 0);
    return { world, ...stats, correctAnswers, wrongAnswers };
  });
  const correctAnswers = worlds.reduce((sum, item) => sum + item.correctAnswers, 0);
  const wrongAnswers = worlds.reduce((sum, item) => sum + item.wrongAnswers, 0);
  const totalAnswers = correctAnswers + wrongAnswers;

  return {
    worlds,
    totalQuestions: worlds.reduce((sum, item) => sum + item.total, 0),
    answeredQuestions: worlds.reduce((sum, item) => sum + item.seen, 0),
    correctAnswers,
    wrongAnswers,
    totalAnswers,
    accuracy: totalAnswers === 0 ? null : Math.round((correctAnswers / totalAnswers) * 100),
    toReview: worlds.reduce((sum, item) => sum + item.missed, 0),
  };
}

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);
/** Which questions a Practice-by-Type card draws on: one question type, or one difficulty, across every World. */
export type QuizFilter = { type?: QuizQuestion['type']; difficulty?: QuizQuestion['difficulty'] };
export const matchesQuizFilter = (q: QuizQuestion, filter: QuizFilter) =>
  (!filter.type || q.type === filter.type) && (!filter.difficulty || q.difficulty === filter.difficulty);

/** A short session of the questions that match the filter. */
export function buildTypeSession(worlds: QuizWorld[], filter: QuizFilter, size = 10) {
  return shuffle(worlds.flatMap((w) => w.questions).filter((q) => matchesQuizFilter(q, filter))).slice(0, size);
}

/** Today's Daily Challenge: the same questions all day (a shuffle seeded by the date), different tomorrow. */
export function buildDailySession(worlds: QuizWorld[], date = new Date(), size = 10) {
  let seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const random = () => { seed = (seed + 0x6d2b79f5) | 0; let x = Math.imul(seed ^ (seed >>> 15), 1 | seed); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
  const pool = worlds.flatMap((w) => w.questions);
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool.slice(0, size);
}

/** The distinct topics (lesson names) in a session, most frequent first. */
export function sessionTopics(questions: QuizQuestion[]) {
  const counts = new Map<string, number>();
  for (const q of questions) counts.set(q.topic, (counts.get(q.topic) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([topic]) => topic);
}

export function buildSession(worlds: QuizWorld[], order?: number, progress: QuizProgress = {}, review = false, size = 10) {
  const pool = order ? worlds.find((w) => w.order === order)?.questions ?? [] : worlds.filter((w) => w.order <= Math.max(1, ...worlds.map((w) => w.order))).flatMap((w) => w.questions);
  // A World card always starts the complete authored bank. Review is the only flow that filters to unresolved mistakes.
  const filtered = review ? pool.filter((q) => isMissedAnswer(progress[q.id])) : pool;
  // The web runs a World bank in one go; Quick Quiz remains a short ten-question session.
  const sessionSize = order ? pool.length : size;
  return shuffle(filtered.length ? filtered : pool).slice(0, sessionSize);
}

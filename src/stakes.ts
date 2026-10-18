import AsyncStorage from '@react-native-async-storage/async-storage';
import type { QuizProgress, QuizWorld } from './quizData';
import type { QuizQuestion } from './quizQuestions';

/**
 * High Stakes: 8 hard questions, no timer, 100 coins to start. After picking an answer the learner bets on how sure they are, and only
 * then can check it. The payouts make honest betting pay best: Sure wins when you are right more than about 60% of the time, Think so
 * at 50-60%, Guessing below that.
 */
export const STAKES_START = 100;
export const STAKES_ROUND = 8;

export type BetId = 'sure' | 'think' | 'guess';
export const BETS: { id: BetId; emoji: string; label: string; win: number; lose: number }[] = [
  { id: 'sure', emoji: '🙂', label: 'Sure', win: 30, lose: 30 },
  { id: 'think', emoji: '🤔', label: 'Think so', win: 20, lose: 15 },
  { id: 'guess', emoji: '😬', label: 'Guessing', win: 10, lose: 5 },
];
export const betById = (id: BetId) => BETS.find((b) => b.id === id)!;
export const payout = (bet: BetId, correct: boolean) => (correct ? betById(bet).win : -betById(bet).lose);

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

/**
 * Worlds the learner has reached: every World up to the furthest one with an answered quiz question (always at least World 1).
 * The app does not save lesson progress, so quiz answers are the only record of how far they have got.
 */
export function reachedWorldOrder(worlds: QuizWorld[], progress: QuizProgress) {
  const answered = worlds.filter((w) => w.questions.some((q) => progress[q.id])).map((w) => w.order);
  return Math.max(1, ...answered);
}

/** Eight hard questions from reached Worlds; topped up with medium ones from the same Worlds if there are not enough hard ones. */
export function buildStakesRound(worlds: QuizWorld[], progress: QuizProgress): QuizQuestion[] {
  const reached = reachedWorldOrder(worlds, progress);
  const pool = worlds.filter((w) => w.order <= reached).flatMap((w) => w.questions);
  const hard = shuffle(pool.filter((q) => q.difficulty === 'hard'));
  const medium = shuffle(pool.filter((q) => q.difficulty === 'medium'));
  return [...hard, ...medium].slice(0, STAKES_ROUND);
}

/** Finished rounds, saved on the device (the last 100). */
const STAKES_HISTORY_KEY = 'codedo.stakes.v1';
export type StakesEntry = { coins: number; correct: number; attempted: number; at: number };

export async function loadStakesHistory(): Promise<StakesEntry[]> {
  try {
    const parsed = JSON.parse((await AsyncStorage.getItem(STAKES_HISTORY_KEY)) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return []; // missing or corrupt history: start fresh
  }
}

export async function saveStakesRound(entry: StakesEntry) {
  const all = await loadStakesHistory();
  await AsyncStorage.setItem(STAKES_HISTORY_KEY, JSON.stringify([...all, entry].slice(-100))).catch(() => {});
}

/** Most coins ever finished with, or null before the first round. */
export async function loadStakesBest(): Promise<number | null> {
  const all = await loadStakesHistory();
  return all.length ? Math.max(...all.map((e) => e.coins)) : null;
}

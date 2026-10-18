import AsyncStorage from '@react-native-async-storage/async-storage';
import type { QuizDifficulty, QuizQuestion } from './quizQuestions';

/**
 * Survival Ladder: no timer, three hearts. Every LEVEL_STEP correct answers climb one level, and the level sets how hard the next
 * question is (1 easy, 2 medium, 3 and up hard). A wrong answer costs a heart and does not climb; the run ends with the last heart.
 */
export const SURVIVAL_LIVES = 3;
export const SURVIVAL_LEVEL_STEP = 5;
/** Pages the pager holds for one run. Later pages are placeholders, replaced one at a time as the learner climbs. */
export const SURVIVAL_RUN_LENGTH = 150;

export const survivalLevel = (correct: number) => 1 + Math.floor(correct / SURVIVAL_LEVEL_STEP);
export const difficultyForLevel = (level: number): QuizDifficulty => (level <= 1 ? 'easy' : level === 2 ? 'medium' : 'hard');
export const DIFFICULTY_LABEL: Record<QuizDifficulty, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

/** A random unused question of the wanted difficulty; any unused question if that difficulty has run out. */
export function pickSurvivalQuestion(pool: QuizQuestion[], difficulty: QuizDifficulty, usedIds: Set<string>) {
  const fresh = pool.filter((q) => !usedIds.has(q.id));
  const matching = fresh.filter((q) => q.difficulty === difficulty);
  const from = matching.length ? matching : fresh.length ? fresh : pool;
  return from[Math.floor(Math.random() * from.length)];
}

/** The pages a run starts with: an easy first question, then placeholders that are swapped for the right level before they show. */
export function startSurvivalRun(pool: QuizQuestion[]) {
  const first = pickSurvivalQuestion(pool, 'easy', new Set());
  return [first, ...shuffle(pool.filter((q) => q.id !== first.id)).slice(0, SURVIVAL_RUN_LENGTH - 1)];
}

/** Finished runs, saved on the device (the last 100). */
const SURVIVAL_HISTORY_KEY = 'codedo.survival.v1';
export type SurvivalEntry = { correct: number; attempted: number; level: number; at: number };

export async function loadSurvivalHistory(): Promise<SurvivalEntry[]> {
  try {
    const parsed = JSON.parse((await AsyncStorage.getItem(SURVIVAL_HISTORY_KEY)) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return []; // missing or corrupt history: start fresh
  }
}

export async function saveSurvivalRun(entry: SurvivalEntry) {
  const all = await loadSurvivalHistory();
  await AsyncStorage.setItem(SURVIVAL_HISTORY_KEY, JSON.stringify([...all, entry].slice(-100))).catch(() => {});
}

/** Runs that climbed at all. A run with no correct answer is no record to beat, so it never counts as a best (older ones may be saved). */
const climbedRuns = async () => (await loadSurvivalHistory()).filter((e) => e.correct > 0);

/** Best climb so far (most correct answers in one run), or null before the first run that got an answer right. */
export async function loadSurvivalBest(): Promise<number | null> {
  const all = await climbedRuns();
  return all.length ? Math.max(...all.map((e) => e.correct)) : null;
}

/** The best run (most correct, then highest level), or null before the first run. For the card's "Best" line. */
export async function loadSurvivalBestRun(): Promise<SurvivalEntry | null> {
  const all = await climbedRuns();
  return all.reduce<SurvivalEntry | null>((best, e) => (!best || e.correct > best.correct || (e.correct === best.correct && e.level > best.level) ? e : best), null);
}

/**
 * Sharing a result earns one bonus heart for the NEXT climb (4 hearts instead of 3). It is banked on the device, at most one at a time,
 * and is spent when a climb that started with it reaches its results. Quitting a climb midway keeps it.
 */
export const SURVIVAL_BONUS_LIVES = 1;
const SURVIVAL_BONUS_KEY = 'codedo.survival.bonusHeart';

export async function loadSurvivalBonus(): Promise<number> {
  try { return (await AsyncStorage.getItem(SURVIVAL_BONUS_KEY)) === '1' ? SURVIVAL_BONUS_LIVES : 0; } catch { return 0; }
}
export const grantSurvivalBonus = () => AsyncStorage.setItem(SURVIVAL_BONUS_KEY, '1').catch(() => {});
export const spendSurvivalBonus = () => AsyncStorage.removeItem(SURVIVAL_BONUS_KEY).catch(() => {});

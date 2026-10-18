import AsyncStorage from '@react-native-async-storage/async-storage';

/** Finished Speed Rounds, saved on the device (the last 100). Personal Best is kept per round length. */
export const SPEED_ROUND_HISTORY_KEY = 'codedo.speedRounds.v1';
export type SpeedRoundEntry = { limit: number; correct: number; attempted: number; pace: number; at: number; points?: number };

// Speed Round points: +10 per correct answer, -5 per wrong one, never below 0. Shown to the user with this rule.
export const speedPoints = (correct: number, attempted: number) => Math.max(0, correct * 10 - (attempted - correct) * 5);

/** Points of a saved round; rounds saved before points existed are scored from their counts. */
export const entryPoints = (e: SpeedRoundEntry) => e.points ?? speedPoints(e.correct, e.attempted);

export async function loadSpeedHistory(): Promise<SpeedRoundEntry[]> {
  try {
    const parsed = JSON.parse((await AsyncStorage.getItem(SPEED_ROUND_HISTORY_KEY)) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return []; // missing or corrupt history: start fresh
  }
}

/** Best points per round length (seconds), for lengths that have been played. */
/** Rounds that scored. A round with no points is no record to beat, so it never counts as a best (older ones may be saved). */
const scoredRounds = async () => (await loadSpeedHistory()).filter((e) => entryPoints(e) > 0);

export async function loadSpeedBests(): Promise<Record<number, number>> {
  const bests: Record<number, number> = {};
  for (const e of await scoredRounds()) bests[e.limit] = Math.max(bests[e.limit] ?? 0, entryPoints(e));
  return bests;
}

/** The length played most recently and its best points, or null before the first round. For the card's "Best" line. */
export async function loadSpeedHeadline(): Promise<{ limit: number; best: number } | null> {
  const all = await scoredRounds();
  const last = all[all.length - 1];
  if (!last) return null;
  return { limit: last.limit, best: Math.max(...all.filter((e) => e.limit === last.limit).map(entryPoints)) };
}

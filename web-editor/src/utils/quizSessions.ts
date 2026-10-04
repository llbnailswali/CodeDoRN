import { QuizQuestion } from './quizQuestions';
import { QuestionProgress, isMastered, isMissed } from './quizProgress';

/** Default session length, for a short mixed quiz. A World quiz passes its whole bank instead. */
export const SESSION_SIZE = 10;

const shuffle = <T,>(items: T[]): T[] => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const byLastAnswered = (progress: Record<string, QuestionProgress>) => (a: QuizQuestion, b: QuizQuestion) =>
  (progress[a.id]?.last ?? 0) - (progress[b.id]?.last ?? 0);

/** Take one question from each topic in turn, so a bucket is spread across the World's lessons instead of clustered in one. */
function spreadByTopic(items: QuizQuestion[]): QuizQuestion[] {
  const lanes = new Map<string, QuizQuestion[]>();
  for (const q of items) lanes.set(q.topic, [...(lanes.get(q.topic) ?? []), q]);
  const out: QuizQuestion[] = [];
  const queues = [...lanes.values()];
  while (queues.some((l) => l.length)) for (const l of queues) if (l.length) out.push(l.shift()!);
  return out;
}

const RANK = { easy: 0, medium: 1, hard: 2 } as const;

/**
 * The next session for a World: no lessons, no topics, just the whole pool. Fills `size` questions from, in order:
 *   1. questions never seen (so every question is met once before any repeats),
 *   2. questions currently missed (oldest answer first),
 *   3. seen but not mastered yet (oldest answer first),
 *   4. mastered questions (oldest answer first), only when nothing else is left.
 * Inside each bucket the questions are spread across lessons (topic tags), so one session covers the whole World. The chosen
 * set is then shuffled and ordered easy to hard, so a session warms up before it stretches (the order inside a difficulty is random).
 */
export function buildSession(questions: QuizQuestion[], progress: Record<string, QuestionProgress>, size = SESSION_SIZE): QuizQuestion[] {
  const older = byLastAnswered(progress);
  const unseen = spreadByTopic(shuffle(questions.filter((q) => !progress[q.id])));
  const missed = questions.filter((q) => isMissed(progress[q.id])).sort(older);
  const learning = questions.filter((q) => progress[q.id] && !isMissed(progress[q.id]) && !isMastered(progress[q.id])).sort(older);
  const mastered = questions.filter((q) => isMastered(progress[q.id])).sort(older);
  const picked = shuffle([...unseen, ...missed, ...learning, ...mastered].slice(0, size));
  return picked.sort((a, b) => RANK[a.difficulty] - RANK[b.difficulty]);
}

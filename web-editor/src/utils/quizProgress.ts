import { QuizAnswer, QuizQuestion } from './quizQuestions';

/**
 * Progress of the new quiz questions, kept per QUESTION (not per round), so "22 / 40 mastered" is honest.
 *
 * A question is mastered when its current correct streak is 2 or more, or it was missed before and has now been answered
 * correctly (a successful retry). A wrong answer resets the streak, so a mastered question can fall back into the pool.
 */
export interface QuestionProgress {
  correct: number;
  wrong: number;
  /** Consecutive correct answers since the last wrong one. */
  streak: number;
  /** Time of the last answer, used to put the oldest-answered questions first in a review. */
  last: number;
  /** What the learner chose the last time they got it wrong, so a review can show "Your answer". Absent when it was not recorded. */
  lastWrong?: QuizAnswer;
}

const QUESTION_KEY = 'codedo_quiz_question_progress';

const read = <T,>(key: string): Record<string, T> => {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};
const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable: progress simply is not remembered
  }
};

export const isMastered = (p: QuestionProgress | undefined): boolean =>
  !!p && (p.streak >= 2 || (p.wrong > 0 && p.streak >= 1));

export const isMissed = (p: QuestionProgress | undefined): boolean => !!p && p.streak === 0 && p.wrong > 0;

export const loadQuestionProgress = (): Record<string, QuestionProgress> => read<QuestionProgress>(QUESTION_KEY);

export function recordAnswer(questionId: string, correct: boolean, answer?: QuizAnswer): void {
  const all = loadQuestionProgress();
  const p = all[questionId] ?? { correct: 0, wrong: 0, streak: 0, last: 0 };
  all[questionId] = {
    correct: p.correct + (correct ? 1 : 0),
    wrong: p.wrong + (correct ? 0 : 1),
    streak: correct ? p.streak + 1 : 0,
    last: Date.now(),
    lastWrong: correct ? p.lastWrong : answer,
  };
  write(QUESTION_KEY, all);
}

export interface WorldQuizStats {
  total: number;
  /** Questions answered at least once. */
  seen: number;
  mastered: number;
  missed: QuizQuestion[];
}

export function worldStats(questions: QuizQuestion[], progress: Record<string, QuestionProgress>): WorldQuizStats {
  return {
    total: questions.length,
    seen: questions.filter((q) => progress[q.id]).length,
    mastered: questions.filter((q) => isMastered(progress[q.id])).length,
    missed: questions.filter((q) => isMissed(progress[q.id])),
  };
}

export interface ConceptAccuracy {
  concept: string;
  /** Lesson name the concept belongs to. */
  topic: string;
  answered: number;
  correct: number;
  /** 0-1, from the questions of this concept answered at least once. */
  accuracy: number;
}

/**
 * Accuracy per concept over the questions answered so far, weakest first (ties: more attempts first), for messages such as
 * "You are weaker in Operator precedence". Concepts with no answered question are left out.
 */
export function conceptAccuracy(questions: QuizQuestion[], progress: Record<string, QuestionProgress>): ConceptAccuracy[] {
  const byConcept = new Map<string, ConceptAccuracy>();
  for (const q of questions) {
    const p = progress[q.id];
    if (!p) continue;
    const row = byConcept.get(q.concept) ?? { concept: q.concept, topic: q.topic, answered: 0, correct: 0, accuracy: 0 };
    row.answered += p.correct + p.wrong;
    row.correct += p.correct;
    byConcept.set(q.concept, row);
  }
  return [...byConcept.values()]
    .map((r) => ({ ...r, accuracy: r.answered ? r.correct / r.answered : 0 }))
    .sort((a, b) => a.accuracy - b.accuracy || b.answered - a.answered);
}

import { QuizQuestion } from '../../utils/quizQuestions';
import { WORLD_1_QUIZ } from './world1Quiz';

/**
 * Worlds that have an authored quiz bank in the new question format. The Quiz tab opens these in the World quiz flow; every
 * other World still plays its Predict questions in the old runner until it gets its own bank. Keyed by World id.
 */
export const NEW_QUIZ_BANKS: Record<string, QuizQuestion[]> = {
  'world-1': WORLD_1_QUIZ,
};

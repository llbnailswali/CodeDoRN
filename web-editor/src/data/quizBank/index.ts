import { QuizQuestion } from '../../utils/quizQuestions';
import { WORLD_1_QUIZ } from './world1Quiz';
import { WORLD_2_QUIZ } from './world2Quiz';
import { WORLD_3_QUIZ } from './world3Quiz';
import { WORLD_4_QUIZ } from './world4Quiz';
import { WORLD_5_QUIZ } from './world5Quiz';
import { WORLD_9_QUIZ } from './world9Quiz';
import { WORLD_10_QUIZ } from './world10Quiz';

/**
 * Worlds that have an authored quiz bank in the new question format. The Quiz tab opens these in the World quiz flow; every
 * other World still plays its Predict questions in the old runner until it gets its own bank. Keyed by World id.
 */
export const NEW_QUIZ_BANKS: Record<string, QuizQuestion[]> = {
  'world-1': WORLD_1_QUIZ,
  'world-2': WORLD_2_QUIZ,
  'world-3': WORLD_3_QUIZ,
  'world-4': WORLD_4_QUIZ,
  'world-5': WORLD_5_QUIZ,
  'world-9': WORLD_9_QUIZ,
  'world-10': WORLD_10_QUIZ,
};

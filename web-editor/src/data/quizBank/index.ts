import { QuizQuestion } from '../../utils/quizQuestions';
import { WORLD_1_QUIZ } from './world1Quiz';
import { WORLD_2_QUIZ } from './world2Quiz';
import { WORLD_3_QUIZ } from './world3Quiz';
import { WORLD_4_QUIZ } from './world4Quiz';
import { WORLD_5_QUIZ } from './world5Quiz';
import { WORLD_9_QUIZ } from './world9Quiz';
import { WORLD_10_QUIZ } from './world10Quiz';
import { WORLD_11_QUIZ } from './world11Quiz';
import { WORLD_12_QUIZ } from './world12Quiz';
import { WORLD_13_QUIZ } from './world13Quiz';
import { WORLD_14_QUIZ } from './world14Quiz';
import { WORLD_15_QUIZ } from './world15Quiz';
import { WORLD_16_QUIZ } from './world16Quiz';

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
  'world-11': WORLD_11_QUIZ,
  'world-12': WORLD_12_QUIZ,
  'world-13': WORLD_13_QUIZ,
  'world-14': WORLD_14_QUIZ,
  'world-15': WORLD_15_QUIZ,
  'world-16': WORLD_16_QUIZ,
};

import type { ImageSourcePropType } from 'react-native';

/** Static Metro asset map: the badges that have their own illustration so far (the file name is the badge id with underscores). */
const BADGE_ART_BY_ID: Record<string, ImageSourcePropType> = {
  'hello-world': require('../assets/achievements/badges/hello_world.png'),
  'all-rounder': require('../assets/achievements/badges/all_rounder.png'),
  'boss-hunter': require('../assets/achievements/badges/boss_hunter.png'),
  'boss-legend': require('../assets/achievements/badges/boss_legend.png'),
  'boss-slayer': require('../assets/achievements/badges/boss_slayer.png'),
  'bug-squasher': require('../assets/achievements/badges/bug_squasher.png'),
  'bug-hunter': require('../assets/achievements/badges/bug_hunter.png'),
  'challenge-ace': require('../assets/achievements/badges/challenge_ace.png'),
  'challenge-champion': require('../assets/achievements/badges/challenge_champion.png'),
  'code-scientist': require('../assets/achievements/badges/code_scientist.png'),
  'codedo-legend': require('../assets/achievements/badges/codedo_legend.png'),
  'comeback-kid': require('../assets/achievements/badges/comeback_kid.png'),
  'daily-challenger': require('../assets/achievements/badges/daily_challenger.png'),
  'debug-guardian': require('../assets/achievements/badges/debug_guardian.png'),
  'first-conquest': require('../assets/achievements/badges/first_conquest.png'),
  'first-strike': require('../assets/achievements/badges/first_strike.png'),
  'flawless-mind': require('../assets/achievements/badges/flawless_mind.png'),
  'kotlin-champion': require('../assets/achievements/badges/kotlin_champion.png'),
  'lesson-collector': require('../assets/achievements/badges/lesson_collector.png'),
  'perfectionist': require('../assets/achievements/badges/perfectionist.png'),
  'prediction-pro': require('../assets/achievements/badges/prediction_pro.png'),
  'problem-solver': require('../assets/achievements/badges/problem_solver.png'),
  'quiz-rookie': require('../assets/achievements/badges/quiz_rookie.png'),
  'realm-master': require('../assets/achievements/badges/realm_master.png'),
  'spark-starter': require('../assets/achievements/badges/spark_starter.png'),
  'quiz-explorer': require('../assets/achievements/badges/quiz_explorer.png'),
  'quiz-challenger': require('../assets/achievements/badges/quiz_challenger.png'),
  'quiz-warrior': require('../assets/achievements/badges/quiz_warrior.png'),
  'habit-builder': require('../assets/achievements/badges/habit_builder.png'),
  'on-fire': require('../assets/achievements/badges/on_fire.png'),
  'quiz-legend': require('../assets/achievements/badges/quiz_legend.png'),
  'quiz-master': require('../assets/achievements/badges/quiz_master.png'),
  'unstoppable': require('../assets/achievements/badges/unstoppable.png'),
  'century-coder': require('../assets/achievements/badges/century_coder.png'),
  'code-master': require('../assets/achievements/badges/code_master.png'),
  'code-ninja': require('../assets/achievements/badges/code_ninja.png'),
  'code-warrior': require('../assets/achievements/badges/code_warrior.png'),
  'bug-exterminator': require('../assets/achievements/badges/bug_exterminator.png'),
  'debug-legend': require('../assets/achievements/badges/debug_legend.png'),
  'perfect-run': require('../assets/achievements/badges/perfect_run.png'),
  'sharp-mind': require('../assets/achievements/badges/sharp_mind.png'),
  'code-initiate': require('../assets/achievements/badges/code_initiate.png'),
  'coding-veteran': require('../assets/achievements/badges/coding_veteran.png'),
  'knowledge-seeker': require('../assets/achievements/badges/knowledge_seeker.png'),
  'perfect-score': require('../assets/achievements/badges/perfect_score.png'),
  'quiz-grandmaster': require('../assets/achievements/badges/quiz_grandmaster.png'),
  'quiz-scholar': require('../assets/achievements/badges/quiz_scholar.png'),
  'sharp-thinker': require('../assets/achievements/badges/sharp_thinker.png'),
  'world-conqueror': require('../assets/achievements/badges/world_conqueror.png'),
  'world-explorer': require('../assets/achievements/badges/world_explorer.png'),
};

/** Dummy artwork (a grey hexagon with a padlock) for every badge that has no illustration yet. */
const LOCKED_PLACEHOLDER: ImageSourcePropType = require('../assets/achievements/badges/locked_placeholder.png');

export const badgeHasArt = (id: string): boolean => id in BADGE_ART_BY_ID;

export const badgeImageFor = (id: string): ImageSourcePropType => BADGE_ART_BY_ID[id] ?? LOCKED_PLACEHOLDER;

import type { ImageSourcePropType } from 'react-native';

/** Static Metro asset map: the badges that have their own illustration so far (the file name is the badge id with underscores). */
const BADGE_ART_BY_ID: Record<string, ImageSourcePropType> = {
  'hello-world': require('../assets/achievements/badges/hello_world.png'),
  'bug-squasher': require('../assets/achievements/badges/bug_squasher.png'),
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
  'bug-hunter': require('../assets/achievements/badges/bug_hunter.png'),
  'bug-exterminator': require('../assets/achievements/badges/bug_exterminator.png'),
};

/** Dummy artwork (a grey hexagon with a padlock) for every badge that has no illustration yet. */
const LOCKED_PLACEHOLDER: ImageSourcePropType = require('../assets/achievements/badges/locked_placeholder.png');

export const badgeHasArt = (id: string): boolean => id in BADGE_ART_BY_ID;

export const badgeImageFor = (id: string): ImageSourcePropType => BADGE_ART_BY_ID[id] ?? LOCKED_PLACEHOLDER;

import { badgeHasArt } from './badgeImages';
export type BadgeRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
export type BadgeCategory = 'First Steps' | 'Coding & Debugging' | 'Quiz Achievements' | 'Consistency & Streaks' | 'World & Lesson Mastery' | 'Special Achievements' | 'Long-Term';
export type BadgeDef = { id: string; emoji: string; title: string; description: string; condition: string; rarity: BadgeRarity; category: BadgeCategory };

export const RARITY_COLOR: Record<BadgeRarity, { light: string; dark: string }> = {
  Common: { light: '#6B7280', dark: '#9CA3AF' },
  Uncommon: { light: '#2E7D4F', dark: '#6EE7A0' },
  Rare: { light: '#2563EB', dark: '#7DB4FF' },
  Epic: { light: '#7C3AED', dark: '#C4A8FF' },
  Legendary: { light: '#B7791F', dark: '#F5C76B' },
};

const b = (id: string, emoji: string, title: string, description: string, condition: string, rarity: BadgeRarity, category: BadgeCategory): BadgeDef => ({ id, emoji, title, description, condition, rarity, category });

export const BADGES: BadgeDef[] = [
  b('hello-world', '🚀', 'Hello, World!', 'Your coding adventure begins.', 'Master your first lesson', 'Common', 'First Steps'),
  b('code-initiate', '⌨️', 'Code Initiate', "You've written and executed your first code.", 'Complete 1 Write & Run exercise', 'Common', 'First Steps'),
  b('bug-squasher', '🐛', 'Bug Squasher', 'Every great developer starts by fixing a bug.', 'Complete 1 Fix Code exercise', 'Common', 'First Steps'),
  b('knowledge-seeker', '📖', 'Knowledge Seeker', "You're building your programming foundation.", 'Master 5 lessons', 'Common', 'First Steps'),

  b('code-warrior', '⚔️', 'Code Warrior', "You're becoming comfortable writing code.", 'Complete 10 Write & Run exercises', 'Uncommon', 'Coding & Debugging'),
  b('code-ninja', '🥷', 'Code Ninja', 'Your coding skills are getting sharper.', 'Complete 50 Write & Run exercises', 'Rare', 'Coding & Debugging'),
  b('code-master', '💻', 'Code Master', "You've become a dedicated problem solver.", 'Complete 100 Write & Run exercises', 'Epic', 'Coding & Debugging'),
  b('bug-hunter', '🔍', 'Bug Hunter', "You've developed an eye for coding mistakes.", 'Complete 10 Fix Code exercises', 'Uncommon', 'Coding & Debugging'),
  b('bug-exterminator', '🛠️', 'Bug Exterminator', "Tricky bugs don't stand a chance against you.", 'Complete 50 Fix Code exercises', 'Rare', 'Coding & Debugging'),
  b('debug-legend', '🏆', 'Debug Legend', "You've proven your debugging expertise.", 'Complete 100 Fix Code exercises', 'Epic', 'Coding & Debugging'),
  b('perfect-run', '🎯', 'Perfect Run', 'You can solve problems correctly from the start.', 'Complete 5 exercises on the first attempt', 'Rare', 'Coding & Debugging'),
  b('sharp-mind', '🧠', 'Sharp Mind', 'Your problem-solving accuracy is exceptional.', 'Complete 25 exercises on the first attempt', 'Epic', 'Coding & Debugging'),

  b('quiz-rookie', '🧠', 'Quiz Rookie', 'Your quiz journey has begun.', 'Answer 10 quiz questions correctly', 'Common', 'Quiz Achievements'),
  b('quiz-explorer', '🧭', 'Quiz Explorer', 'You are expanding your quiz knowledge.', 'Answer 50 quiz questions correctly', 'Uncommon', 'Quiz Achievements'),
  b('quiz-challenger', '⚡', 'Quiz Challenger', 'You are ready for tougher questions.', 'Answer 100 quiz questions correctly', 'Rare', 'Quiz Achievements'),
  b('quiz-warrior', '⚔️', 'Quiz Warrior', 'You have built serious quiz momentum.', 'Answer 250 quiz questions correctly', 'Epic', 'Quiz Achievements'),
  b('quiz-master', '🏆', 'Quiz Master', 'You have mastered the quiz arena.', 'Answer 500 quiz questions correctly', 'Legendary', 'Quiz Achievements'),
  b('quiz-legend', '👑', 'Quiz Legend', 'Your quiz knowledge is exceptional.', 'Answer 1,000 quiz questions correctly', 'Legendary', 'Quiz Achievements'),
  b('first-strike', '🎯', 'First Strike', 'You get the answer right straight away.', 'Get 10 questions right on the first attempt', 'Uncommon', 'Quiz Achievements'),
  b('perfect-score', '💯', 'Perfect Score', 'A flawless quiz performance.', 'Finish an eligible 10-question quiz perfectly', 'Rare', 'Quiz Achievements'),
  b('sharp-thinker', '💡', 'Sharp Thinker', 'You consistently reason before answering.', 'Get 50 questions right on the first attempt', 'Rare', 'Quiz Achievements'),
  b('flawless-mind', '✨', 'Flawless Mind', 'Your first-attempt accuracy is remarkable.', 'Get 100 questions right on the first attempt', 'Epic', 'Quiz Achievements'),
  b('quiz-scholar', '🎓', 'Quiz Scholar', 'You have learned across many topics.', 'Meet the topic milestone in 5 quiz topics', 'Epic', 'Quiz Achievements'),
  b('quiz-grandmaster', '🌟', 'Quiz Grandmaster', 'You have reached the highest quiz milestone.', 'Answer 2,000 quiz questions correctly', 'Legendary', 'Quiz Achievements'),

  b('spark-starter', '✨', 'Spark Starter', 'A great habit begins with small steps.', '3 consecutive active learning days', 'Common', 'Consistency & Streaks'),
  b('on-fire', '🔥', 'On Fire', "You're building a consistent coding routine.", '7 consecutive active learning days', 'Uncommon', 'Consistency & Streaks'),
  b('habit-builder', '📅', 'Habit Builder', 'Coding is becoming part of your daily life.', '14 consecutive active learning days', 'Rare', 'Consistency & Streaks'),
  b('unstoppable', '🌋', 'Unstoppable', 'Your dedication to learning is remarkable.', '30 consecutive active learning days', 'Epic', 'Consistency & Streaks'),
  b('century-coder', '💯', 'Century Coder', 'One hundred days of coding consistency.', '100 consecutive active learning days', 'Legendary', 'Consistency & Streaks'),
  b('coding-veteran', '🏅', 'Coding Veteran', "You've made coding a long-term commitment.", '365 total active learning days', 'Legendary', 'Consistency & Streaks'),

  b('first-conquest', '🗺️', 'First Conquest', "You've mastered your first programming World.", 'Master every lesson in World 1', 'Uncommon', 'World & Lesson Mastery'),
  b('world-explorer', '🧭', 'World Explorer', 'New coding adventures are opening up.', 'Unlock 3 Worlds', 'Uncommon', 'World & Lesson Mastery'),
  b('world-conqueror', '👑', 'World Conqueror', "You've conquered multiple programming Worlds.", 'Master 5 Worlds', 'Epic', 'World & Lesson Mastery'),
  b('realm-master', '🌍', 'Realm Master', "You've conquered the entire learning journey.", 'Master all Worlds in the current learning path', 'Legendary', 'World & Lesson Mastery'),
  b('lesson-collector', '📚', 'Lesson Collector', 'Your programming knowledge keeps growing.', 'Master 25 lessons', 'Rare', 'World & Lesson Mastery'),
  b('knowledge-champion', '🎓', 'Knowledge Champion', "You've achieved an impressive learning milestone.", 'Master 100 lessons', 'Epic', 'World & Lesson Mastery'),
  b('boss-slayer', '⚔️', 'Boss Slayer', "You've defeated your first coding boss.", 'Defeat 1 World Boss', 'Uncommon', 'World & Lesson Mastery'),
  b('boss-hunter', '🐉', 'Boss Hunter', "You've proven yourself against multiple bosses.", 'Defeat 5 World Bosses', 'Epic', 'World & Lesson Mastery'),
  b('boss-legend', '🏆', 'Boss Legend', "You've defeated every boss in your learning journey.", 'Defeat all World Bosses in the current learning path', 'Legendary', 'World & Lesson Mastery'),

  b('comeback-kid', '🔄', 'Comeback Kid', 'Every comeback is another opportunity to grow.', 'Complete a lesson after 14 consecutive inactive days', 'Rare', 'Special Achievements'),
  b('daily-challenger', '⚡', 'Daily Challenger', "You're ready for a challenge every day.", 'Complete 7 Daily Challenges', 'Rare', 'Special Achievements'),
  b('challenge-champion', '🏆', 'Challenge Champion', "You've become a dedicated daily challenger.", 'Complete 30 Daily Challenges', 'Epic', 'Special Achievements'),
  b('all-rounder', '🔀', 'All-Rounder', "You're developing both coding and debugging skills.", 'Complete 10 Write & Run and 10 Fix Code exercises', 'Rare', 'Special Achievements'),
  b('perfectionist', '💎', 'Perfectionist', 'Your lesson performance shows exceptional accuracy.', 'Master 10 lessons with no failed attempts in any stage', 'Epic', 'Special Achievements'),
  b('kotlin-champion', '🥇', 'Kotlin Champion', "You've completed your Kotlin mastery journey.", 'Master all Kotlin lessons in the current learning path', 'Legendary', 'Special Achievements'),

  b('problem-solver', '🧩', 'Problem Solver', "You've tackled a wide range of coding problems.", 'Complete 200 unique practice exercises', 'Epic', 'Long-Term'),
  b('code-scientist', '🧪', 'Code Scientist', "You're learning through experimentation.", 'Successfully complete 50 Explore stages', 'Rare', 'Long-Term'),
  b('prediction-pro', '🔮', 'Prediction Pro', 'You can reason about code before running it.', 'Complete 25 Predict stages correctly on the first attempt', 'Rare', 'Long-Term'),
  b('debug-guardian', '🛡️', 'Debug Guardian', "You're becoming a reliable bug fixer.", 'Complete 200 unique Fix Code exercises', 'Legendary', 'Long-Term'),
  b('challenge-ace', '🏹', 'Challenge Ace', 'Your challenge-solving skills are outstanding.', 'Complete 10 Daily Challenges on the first attempt', 'Epic', 'Long-Term'),
  b('codedo-legend', '🌟', 'CodeDo Legend', "You've achieved exceptional mastery across CodeDo.", 'Master all Worlds, defeat all World Bosses, and complete 100 unique practice exercises', 'Legendary', 'Long-Term'),
];

// TEMPORARY, for testing the Achievements screen: the badges that already have their own artwork show as unlocked, and every other badge
// is locked (and cannot be opened). Replace with real unlock tracking.
export const UNLOCKED_FOR_TESTING: ReadonlySet<string> = new Set(BADGES.filter((x) => badgeHasArt(x.id)).map((x) => x.id));

// TEMPORARY, for testing: the first locked badge of each category shows progress, 68% of the way to its target (the first number in its condition).
export const BADGE_PROGRESS_FOR_TESTING: Readonly<Record<string, readonly [number, number]>> = (() => {
  const out: Record<string, readonly [number, number]> = {};
  const seen = new Set<string>();
  for (const x of BADGES) {
    if (UNLOCKED_FOR_TESTING.has(x.id) || seen.has(x.category)) continue;
    seen.add(x.category);
    const total = Number(x.condition.match(/\d+/)?.[0] ?? 5);
    out[x.id] = [Math.round(total * 0.68), total];
  }
  return out;
})();

// TEMPORARY, for testing: every unlocked badge reports this unlock date. Replace with the real date stored when a badge is earned.
export const UNLOCK_DATE_FOR_TESTING = 'May 12, 2026';

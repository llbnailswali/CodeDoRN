import { badgeHasArt } from './badgeImages';
export type BadgeRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
export type BadgeCategory = 'Accuracy' | 'Coding' | 'Quizzes' | 'Challenges' | 'Consistency' | 'Worlds' | 'Bosses';
export type BadgeDef = { id: string; emoji: string; title: string; description: string; condition: string; rarity: BadgeRarity; category: BadgeCategory };

export const RARITY_COLOR: Record<BadgeRarity, { light: string; dark: string }> = {
  Common: { light: '#6B7280', dark: '#9CA3AF' },
  Uncommon: { light: '#2E7D4F', dark: '#6EE7A0' },
  Rare: { light: '#2563EB', dark: '#7DB4FF' },
  Epic: { light: '#C026D3', dark: '#F0ABFC' },
  Legendary: { light: '#B7791F', dark: '#F5C76B' },
};

const b = (id: string, emoji: string, title: string, description: string, condition: string, rarity: BadgeRarity, category: BadgeCategory): BadgeDef => ({ id, emoji, title, description, condition, rarity, category });

export const BADGES: BadgeDef[] = [
  b('hello-world', '🚀', 'Hello, World!', 'Your coding adventure begins.', 'Master your first lesson', 'Common', 'Consistency'),
  b('code-initiate', '⌨️', 'Code Initiate', "You've written and executed your first code. Each successfully completed exercise counts once.", 'Complete 1 Write & Run exercise', 'Common', 'Coding'),
  b('bug-squasher', '🐛', 'Bug Squasher', 'Every great developer starts by fixing a bug. Each successfully completed exercise counts once.', 'Complete 1 Fix Code exercise', 'Common', 'Coding'),
  b('knowledge-seeker', '📖', 'Knowledge Seeker', "You're building your programming foundation.", 'Master 5 lessons', 'Common', 'Consistency'),

  b('code-warrior', '⚔️', 'Code Warrior', "You're becoming comfortable writing code. Each successfully completed exercise counts once.", 'Complete 10 Write & Run exercises', 'Uncommon', 'Coding'),
  b('code-ninja', '🥷', 'Code Ninja', 'Your coding skills are getting sharper. Each successfully completed exercise counts once.', 'Complete 50 Write & Run exercises', 'Rare', 'Coding'),
  b('code-master', '💻', 'Code Master', "You've become a dedicated problem solver. Each successfully completed exercise counts once.", 'Complete 100 Write & Run exercises', 'Epic', 'Coding'),
  b('bug-hunter', '🔍', 'Bug Hunter', "You've developed an eye for coding mistakes. Each successfully completed exercise counts once.", 'Complete 10 Fix Code exercises', 'Uncommon', 'Coding'),
  b('bug-exterminator', '🛠️', 'Bug Exterminator', "Tricky bugs don't stand a chance against you. Each successfully completed exercise counts once.", 'Complete 50 Fix Code exercises', 'Rare', 'Coding'),
  b('debug-legend', '🏆', 'Debug Legend', "You've proven your debugging expertise. Each successfully completed exercise counts once.", 'Complete 100 Fix Code exercises', 'Epic', 'Coding'),
  b('perfect-run', '🎯', 'Perfect Run', 'First-submission success is counted once per exercise; later retries do not change the first result.', 'Solve 5 exercises on the first try', 'Rare', 'Accuracy'),
  b('sharp-mind', '🧠', 'Sharp Mind', 'First-submission success is counted once per exercise; later retries do not change the first result.', 'Solve 25 exercises on the first try', 'Epic', 'Accuracy'),

  b('quiz-rookie', '🧠', 'Quiz Rookie', 'Your quiz journey has begun. Each distinct question counts once after a correct answer.', 'Answer 10 quiz questions correctly', 'Common', 'Quizzes'),
  b('quiz-explorer', '🧭', 'Quiz Explorer', 'You are expanding your quiz knowledge. Each distinct question counts once after a correct answer.', 'Answer 50 quiz questions correctly', 'Uncommon', 'Quizzes'),
  b('quiz-challenger', '⚡', 'Quiz Challenger', 'You are ready for tougher questions. Each distinct question counts once after a correct answer.', 'Answer 100 quiz questions correctly', 'Rare', 'Quizzes'),
  b('quiz-warrior', '⚔️', 'Quiz Warrior', 'You have built serious quiz momentum. Each distinct question counts once after a correct answer.', 'Answer 250 quiz questions correctly', 'Epic', 'Quizzes'),
  b('quiz-master', '🏆', 'Quiz Master', 'You have mastered the quiz arena. Each distinct question counts once after a correct answer.', 'Answer 500 quiz questions correctly', 'Legendary', 'Quizzes'),
  b('quiz-legend', '👑', 'Quiz Legend', 'Your quiz knowledge is exceptional. Each distinct question counts once after a correct answer.', 'Answer 1,000 quiz questions correctly', 'Legendary', 'Quizzes'),
  b('first-strike', '🎯', 'First Strike', 'First-answer success is counted once per question; retries do not change the first result.', 'Get 10 quiz questions right on the first try', 'Uncommon', 'Accuracy'),
  b('perfect-score', '💯', 'Perfect Score', 'A flawless first-try result across a designated ten-question quiz.', 'Get all 10 quiz questions right on the first try', 'Rare', 'Accuracy'),
  b('sharp-thinker', '💡', 'Sharp Thinker', 'First-answer success is counted once per question; retries do not change the first result.', 'Get 50 quiz questions right on the first try', 'Rare', 'Accuracy'),
  b('flawless-mind', '✨', 'Flawless Mind', 'First-answer success is counted once per question; retries do not change the first result.', 'Get 100 quiz questions right on the first try', 'Epic', 'Accuracy'),
  b('quiz-scholar', '🎓', 'Quiz Scholar', 'Count distinct questions within each topic.', 'Answer 10 questions in each of 5 quiz topics', 'Epic', 'Quizzes'),
  b('quiz-grandmaster', '🌟', 'Quiz Grandmaster', 'You have reached the highest quiz milestone.', 'Answer 2,000 quiz questions correctly', 'Legendary', 'Quizzes'),

  b('spark-starter', '✨', 'Spark Starter', 'A learning day is a local calendar day with a completed lesson stage, exercise, or quiz question.', '3 consecutive learning days', 'Common', 'Consistency'),
  b('on-fire', '🔥', 'On Fire', 'A learning day is a local calendar day with a completed lesson stage, exercise, or quiz question.', '7 consecutive learning days', 'Uncommon', 'Consistency'),
  b('habit-builder', '📅', 'Habit Builder', 'A learning day is a local calendar day with a completed lesson stage, exercise, or quiz question.', '14 consecutive learning days', 'Rare', 'Consistency'),
  b('unstoppable', '🌋', 'Unstoppable', 'A learning day is a local calendar day with a completed lesson stage, exercise, or quiz question.', '30 consecutive learning days', 'Epic', 'Consistency'),
  b('century-coder', '💯', 'Century Coder', 'A learning day is a local calendar day with a completed lesson stage, exercise, or quiz question.', '100 consecutive learning days', 'Legendary', 'Consistency'),
  b('coding-veteran', '🏅', 'Coding Veteran', 'Count distinct local calendar days with a completed lesson stage, exercise, or quiz question.', 'Learn on 365 days', 'Legendary', 'Consistency'),

  b('first-conquest', '🗺️', 'First Conquest', "You've mastered your first programming World. Mastery means completing every required stage in each lesson.", 'Master every lesson in World 1, including its boss lesson', 'Uncommon', 'Worlds'),
  b('world-explorer', '🧭', 'World Explorer', 'New coding adventures are opening up. Each World counts once.', 'Unlock 3 Worlds', 'Uncommon', 'Worlds'),
  b('world-conqueror', '👑', 'World Conqueror', "You've conquered multiple programming Worlds. Mastery means completing every required stage in each lesson.", 'Master 5 Worlds', 'Epic', 'Worlds'),
  b('realm-master', '🌍', 'Realm Master', "You've conquered the entire learning journey. Mastery means completing every required stage in each lesson.", 'Master every World in the learning path', 'Legendary', 'Worlds'),
  b('lesson-collector', '📚', 'Lesson Collector', 'Your programming knowledge keeps growing. A lesson counts once after all its required stages are completed.', 'Master 25 lessons', 'Rare', 'Consistency'),
  b('knowledge-champion', '🎓', 'Knowledge Champion', "You've achieved an impressive learning milestone. A lesson counts once after all its required stages are completed.", 'Master 100 lessons', 'Epic', 'Consistency'),
  b('boss-slayer', '⚔️', 'Boss Slayer', "You've defeated your first coding boss. A boss counts once after its lesson is completed.", 'Complete 1 World Boss lesson', 'Uncommon', 'Bosses'),
  b('boss-hunter', '🐉', 'Boss Hunter', "You've proven yourself against multiple bosses. Each boss counts once after its lesson is completed.", 'Complete 5 World Boss lessons', 'Epic', 'Bosses'),
  b('boss-legend', '🏆', 'Boss Legend', "You've defeated every boss in your learning journey. Each boss counts once after its lesson is completed.", 'Complete every World Boss in the learning path', 'Legendary', 'Bosses'),

  b('comeback-kid', '🔄', 'Comeback Kid', 'The break is 14 full local calendar days without a lesson stage, exercise, or quiz question completed.', 'Return after a 14-day break and master a lesson', 'Rare', 'Consistency'),
  b('daily-challenger', '⚡', 'Daily Challenger', "You're ready for a challenge every day. Each completed Daily Challenge counts once.", 'Complete 7 Daily Challenges', 'Rare', 'Challenges'),
  b('challenge-champion', '🏆', 'Challenge Champion', "You've become a dedicated daily challenger. Each completed Daily Challenge counts once.", 'Complete 30 Daily Challenges', 'Epic', 'Challenges'),
  b('all-rounder', '🔀', 'All-Rounder', "You're developing both coding and debugging skills. Count each successfully completed exercise once.", 'Complete 10 Write & Run and 10 Fix Code exercises', 'Rare', 'Coding'),
  b('perfectionist', '💎', 'Perfectionist', 'Master ten different lessons with no failed attempts in any required stage.', 'Master 10 flawless lessons', 'Epic', 'Accuracy'),
  b('kotlin-champion', '🥇', 'Kotlin Champion', "You've completed your Kotlin mastery journey.", 'Master all Kotlin lessons in the current learning path', 'Legendary', 'Worlds'),

  b('problem-solver', '🧩', 'Problem Solver', "You've tackled a wide range of coding problems. Each successfully completed exercise counts once.", 'Complete 200 unique practice exercises', 'Epic', 'Coding'),
  b('code-scientist', '🧪', 'Code Scientist', "You're learning through experimentation. Each Explore stage counts once.", 'Complete 50 Explore stages', 'Rare', 'Worlds'),
  b('prediction-pro', '🔮', 'Prediction Pro', 'A Predict stage counts when all its questions are right on their first answers.', 'Complete 25 perfect Predict stages', 'Rare', 'Challenges'),
  b('debug-guardian', '🛡️', 'Debug Guardian', "You're becoming a reliable bug fixer. Each successfully completed exercise counts once.", 'Complete 200 unique Fix Code exercises', 'Legendary', 'Coding'),
  b('challenge-ace', '🏹', 'Challenge Ace', 'Each challenge counts once; every answer must be correct on its first submission.', 'Ace 10 Daily Challenges', 'Epic', 'Challenges'),
  b('codedo-legend', '🌟', 'CodeDo Legend', "You've achieved exceptional mastery across CodeDo. Each practice exercise and boss counts once; mastery requires every lesson's required stages.", 'Master all Worlds, complete all Bosses, and finish 100 practice exercises', 'Legendary', 'Challenges'),
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

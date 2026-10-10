# World 3 Quiz — Decision Maker

World 3 covers conditional control flow. Questions are drawn from the World 3 lesson content and keep the World 1/2 rules: 20/50/30 easy–medium–hard target, clear hints and explanations, plausible misconception-based distractors, and a mix of all seven quiz interaction types.

## Bank plan

- 76 regular questions across eight lessons and three sets.
- Each lesson contributes 8 questions: 2 easy, 4 medium, 2 hard.
- Each set adds 4 cross-lesson questions: 2 medium and 2 hard.
- Regular-bank difficulty: 16 easy (21%), 38 medium (50%), 22 hard (29%).
- Boss quiz: 12 questions — 2 easy, 6 medium, 4 hard.
- Total shown for World 3, including the separate Boss quiz: 88 questions. Across the full 88, the balance is 18 easy (20%), 44 medium (50%), 26 hard (30%).

## Sets and lesson coverage

Set count is determined by the World’s lesson groupings; it is not fixed to three. World 3 has eight regular lessons, grouped by concept into 3 + 3 + 2 lessons, so this World has three sets. Other Worlds may have a different number of sets. The Boss lesson remains a separate final quiz, not a set.

| Set | Lessons | Main concepts |
| --- | --- | --- |
| Branching Basics | if; if-else; else-if | Boolean conditions; true runs / false skips; two-way branches; if expressions return a value on both paths; first matching else-if branch; ordering specific conditions before broad ones. |
| when & Ranges | when; when with ranges; when as an expression | Subject matching; comma-separated alternatives; `else`; inclusive `in a..b` and `!in`; top-to-bottom first match; exhaustive expressions that return a value. |
| Combined Conditions | Multiple conditions and nested conditions; Type checks with `is` where appropriate | `&&` / `||`; parentheses and precedence; nested checks; `is` / `!is`; type checks combined with decisions. |
| Boss: Grade & Eligibility System | World 3 boss lesson | Grade bands, boundaries and branch ordering combined with eligibility rules and type checks. |

## Question-type coverage

All seven types are represented: single choice, true/false, predict output, fill blank, find error, code comparison, and multi-select. Predict-output snippets are checked with the project Kotlin runner; structural checks validate IDs, lesson/set ownership, answer keys, hint/explanation presence, and difficulty XP.

## Source files

- Authored questions: `web-editor/src/data/quizBank/world3Quiz.ts`
- Set and Boss definitions: `web-editor/src/data/quizBank/quizSets.ts`
- Bank registration: `web-editor/src/data/quizBank/index.ts`
- Generated native copy: `src/world3Quiz.ts`

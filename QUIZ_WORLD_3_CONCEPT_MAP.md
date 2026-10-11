# World 3 Quiz — Decision Maker

World 3 covers conditional control flow. Questions are drawn from the World 3 lesson content and keep the World 1/2 rules: 20/50/30 easy–medium–hard target, clear hints and explanations, plausible misconception-based distractors, and a mix of all seven quiz interaction types.

## Bank plan

- 76 regular questions across eight lessons and three sets.
- Each lesson contributes 8 questions: 2 easy, 4 medium, 2 hard.
- Each set adds 4 cross-lesson questions: 2 medium and 2 hard.
- Regular-bank difficulty: 16 easy (21%), 38 medium (50%), 22 hard (29%).
- Boss quiz: 12 questions, 1 easy, 5 medium, 6 hard (10/40/50), ordered easy to hard.
- Total shown for World 3, including the separate Boss quiz: 88 questions. Across the full 88, the balance is 17 easy (19%), 43 medium (49%), 28 hard (32%).

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

### Boss coverage (authored)

All 12 questions use one story: the Grade & Eligibility System (scores, grade bands, who may enter or is eligible). Real kotlinc confirmed every predicted output, both compile errors and their lines, the fill-blank chips (only `&&` prints Rejected), both code_comparison programs on a truth table, and each option of the two multi_select questions.

| # | Diff | Type | Lessons combined |
| ---: | --- | --- | --- |
| 1 | easy | single_choice | if-else expression, comparison boundary (>=) |
| 2 | medium | fill_blank | if-else, `&&` combined condition |
| 3 | medium | predict_output | when with ranges, when as an expression, arithmetic, templates |
| 4 | medium | predict_output | else-if chain, `&&` in a later branch |
| 5 | medium | single_choice | else-if as a value, `&&` in the first condition |
| 6 | medium | code_comparison | Multiple conditions, `||`/`&&` grouping |
| 7 | hard | find_error | if-else expression, declared type |
| 8 | hard | predict_output | if-else expression feeding a when range, arithmetic |
| 9 | hard | multi_select | when ranges (`in`, `!in`), `is`, combined conditions |
| 10 | hard | find_error | `is` check order inside `&&` |
| 11 | hard | multi_select | when ranges overlap, first match, else |
| 12 | hard | predict_output | when range expression, nested else-if chain, `is` with `&&`, var |

Every lesson is used at least once: if (1, 5), if-else (1, 2, 7, 8), else-if (4, 5, 12), when (3, 11), when with ranges (3, 8, 9, 11, 12), when as an expression (3, 8, 12), multiple and nested conditions (2, 4, 6, 12), type checks with `is` (9, 10, 12). No loops, lists or functions are used (later worlds).

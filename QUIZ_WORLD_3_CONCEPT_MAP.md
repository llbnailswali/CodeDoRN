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

## Audit findings and evidence (content audit, 2026-10-11)

All 88 questions were read one by one (76 lesson/set questions plus the 12 Boss questions audited earlier). Every executable question (67 programs) was run through real kotlinc 2.0.21, and the fragment-style comparisons and fill-in questions (calls or conditions without declarations) were verified by hand with the declarations added, including truth tables for the AND/OR comparisons.

- **Fixed: wrong explanation.** `w3q-types-7` said `item == String` "cannot compare an Any value to the String type". It compiles; it compares `item` with the String companion object, never matches text, and prints nothing. The key (`is`) was right; the explanation is fixed.
- **Fixed: "find the error" keyed the wrong line.** `w3q-expression-7` keyed the `200 -> "OK"` branch, but kotlinc reports the non-exhaustive `when` on the `val label = when (code) {` line. The key now points there.
- **Fixed: code shown as an answer option.** `w3q-set-wh-1` listed the `when` expression itself as one of its four options. It is now a predict-the-output question with the code shown.
- **Fixed: duplicate scenarios.** `set-br-3` repeated the code of `elseif-8`; `elseif-7` repeated the "broad condition first" idea of `elseif-3`; `set-co-1` repeated `types-8`; `set-co-3` repeated `nested-8`; `set-wh-4` and `expression-8` repeated the 90/80 grade snippet used by several other questions; `expression-5` and `ranges-5` repeated facts already asked (the `else` branch, the `in` operator). Each now has its own scenario (boundary at 25 degrees, a range check inside a chain, OR with type checks, neither-String-nor-Int AND/OR, temperature bands, Int results of a `when`, comma values in a `when` expression, a range that includes 70 but not 80).
- **Fixed: easy "hard" and a trivial one.** `ifelse-8` now tests the `>` boundary (n = 5); `elseif-7` and `expression-8` need a combined condition or an extra step.
- **Fixed: true/false skew.** 7 of 8 were true. Three are now false statements (`ifelse-1`, `when-1`, `ranges-1`), so it is 4 true / 4 false.
- **Fixed: wording and explanations.** `nested-1` showed the broken chip ``using && is``; `set-co-4` had a garbled explanation ("not String and not !is Int").
- **Open (content):** 25 questions open with "What does this code print?". The "if" and "when with ranges" lessons have only 8 questions each. Predict-the-output is 45% overall.
- **Open (display):** no phone-width screenshot review has been done.

### Polish pass (2026-10-11, after the audit)

- **Added 5 questions** so the thin lessons reach the usual 2 easy / 5 medium / 3 hard: `w3q-if-9` (which values can be an `if` condition, multi-select), `w3q-if-10` (braces group the `if` body, comparison), `w3q-ranges-9` (a range with variable bounds, fill-in), `w3q-nested-9` (`&` is not logical AND, find the error), `w3q-nested-10` (precedence and negation, multi-select). Real kotlinc confirmed every option, chip and compile error. World 3 now has 94 questions (82 lesson and set, 12 Boss).
- **Converted** `w3q-elseif-6` (the final `else` of a chain) into a fill-in question, `w3q-expression-3` into a multi-select (when-expression facts) and `w3q-expression-6` into a single-choice question (valid `when` syntax), because `when-as-an-expression` was 8 of 12 predictions. Real kotlinc confirmed every option.
- **Predict-the-output share is 42%** (over the 40% soft guideline). Left as is on purpose: these lessons teach tracing decisions, and each remaining prediction covers a distinct branch, boundary or ordering case. Further conversions would repeat facts already asked by single-choice questions (for example the `else` keyword and the `->` arrow).
- **Not changed:** 25 questions still open with "What does this code print?" (style only).

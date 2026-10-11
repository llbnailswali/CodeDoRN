# World 4 Quiz — Repetition & Loops

World 4 introduces repetition, ranges and progressions, loop control, and nested loops. Questions follow the shared quiz rules: 20/50/30 easy–medium–hard target, clear hints and explanations, plausible misconception-based distractors, and coverage of all seven quiz interaction types.

## Bank plan

- 100 lesson questions across ten regular lessons: each lesson contributes 10 questions (2 easy, 5 medium, 3 hard).
- 16 cross-lesson questions: four per set (1 easy, 2 medium, 1 hard).
- Regular-bank total: 116 questions — 24 easy, 58 medium, 34 hard.
- Separate Boss quiz: 12 questions — 1 easy, 5 medium, 6 hard (10/40/50, ordered easy to hard).
- Total for World 4 including Boss: 128 questions — 25 easy, 63 medium, 40 hard.

Set count follows the lesson grouping, not a fixed number. World 4's ten regular lessons are grouped 3 + 2 + 2 + 3, giving four sets; another World may have more or fewer sets. The Boss remains a separate quiz.

## Sets and lesson coverage

| Set | Lessons | Main concepts |
| --- | --- | --- |
| Repetition Basics | `for`; `while`; `do-while` | Known-count iteration; condition-controlled repetition; pre-test vs post-test behavior; counters and accumulators; termination. |
| Ranges & Progressions | Ranges; Progressions | Inclusive `..` vs exclusive `until`; membership with `in` / `!in`; ascending progressions; endpoint behavior. |
| Direction & Step Size | `downTo`; `step` | Descending direction; positive step sizes; skipped endpoints; ascending and descending sequences. |
| Loop Control & Nesting | `break`; `continue`; Nested loops | Exit the nearest loop; skip the current iteration; nested iteration order; row/column reasoning; loop-control effects inside inner loops. |
| Boss: Pattern & Number Analyzer | World 4 Boss lesson | Combine loop forms, stepped ranges, nested iteration and loop control to trace or construct a small pattern/number task. |

## Question-type coverage and validation

The bank includes single choice, true/false, predict output, fill blank, find error, code comparison and multi-select. Structural validation checks IDs, lesson/set ownership, answer indexes, explanations, hints and XP/difficulty consistency. The lightweight project interpreter does not yet model all loop syntax and `continue` semantics, so affected World 4 execution cases are reported as engine-unverified; the authored Kotlin and expected outputs need compiler-level review when a Kotlin compiler is available.

## Audit findings and evidence

Content audit completed 2026-10-11. All 116 lesson/set questions and the 12 Boss questions were read in complete dump batches. The fact-check pass inspected every single-choice option and both Boss multi-select answers option by option. No wrong answer keys were found. The mechanical scan reports no duplicate code (including code-plus-options), no duplicate explanations, no filler options, and balanced true/false keys (7 true, 7 false).

Rewrites in `world4Quiz.ts`:

- `w4q-prog-8`: replaced a duplicate of `w4q-prog-4` with a distinct hard stepped-range accumulation trace using a variable lower bound.
- `w4q-down-10`: made the stepped countdown distinct from the set question and removed an unaccounted trailing space; answers now match `println` output exactly.
- `w4q-nested-3` and `w4q-set-ctl-2`: changed to line-based output so answer choices match exact Kotlin output (including line breaks, with no hidden trailing spaces).
- `w4q-while-8`: replaced an intentionally infinite loop with a `val` reassignment compile-error question, so no quiz requires a non-terminating program.
- `w4q-for-1`, `w4q-while-1`, `w4q-do-1`, `w4q-range-1`, `w4q-cont-1`, `w4q-set-rng-1`, `w4q-set-ctl-1`: rewrote/rebalanced the true/false statements and keyed explanations; the former `continue` statement was malformed/tautological.

Follow-up real-compiler sweep: the three misleading logic-only find-error items were rewritten as genuine compile errors (`w4q-break-7`, `w4q-cont-7`, `w4q-nested-8`), and `w4q-step-8` now explicitly says its negative step crashes at runtime. `npx tsx scripts/quiz-audit/real.ts 4` reports 91 executable cases; remaining findings are the expected runtime failure for `w4q-step-8` and comparison-fragment false alarms (call-only snippets without executable `main`). The negative-step exception is confirmed as `IllegalArgumentException: Step must be positive, was: -2.`

Validation passed: `npx tsc --noEmit`, `npm run test:quiz-bank`, `npm run audit:quiz-bank`, `npx tsx scripts/quiz-audit/std-scan.ts`, and `npm run generate:native-data`. The quality scan reports 0 type/difficulty violations and 10 soft type-mix warnings in the ten lesson banks (predict-output is 43–60% per lesson). The known `w4q-range-8` flake remains unreproduced. Phone-width/visual rendering was not checked and remains for the user.

## Source files

- Authored questions: `web-editor/src/data/quizBank/world4Quiz.ts`
- Set and Boss definitions: `web-editor/src/data/quizBank/quizSets.ts`
- Web bank registration: `web-editor/src/data/quizBank/index.ts`
- Native quiz integration: `src/quizData.ts`
- Generated native copy: `src/world4Quiz.ts`

### Boss coverage (authored)

All 12 questions are pieces of the Pattern & Number Analyzer. Real kotlinc (2.0.21) confirmed every predicted output, both compile errors (and their lines), every fill-blank chip (only `while` compiles), the keyed and unkeyed code_comparison program, and each option of the two multi_select questions and Q1.

| # | Diff | Type | Lessons combined |
| ---: | --- | --- | --- |
| 1 | easy | single_choice | Ranges, step, progressions (inclusive end versus `until`, `downTo`, negative step) |
| 2 | medium | fill_blank | do-while, counter with `+=` |
| 3 | medium | predict_output | for, `until`, ranges, `%` filter |
| 4 | medium | single_choice | Nested loops, `..` versus `until` |
| 5 | medium | code_comparison | for, `continue` versus `break` |
| 6 | medium | predict_output | while, `break`, loop condition |
| 7 | hard | find_error | for, ranges, accumulator type (Int `+=` Double) |
| 8 | hard | multi_select | Nested loops, `break` in the inner loop, ranges |
| 9 | hard | predict_output | downTo, step, progressions, `continue` |
| 10 | hard | find_error | do-while, `val` versus `var` counter |
| 11 | hard | multi_select | downTo, step, ranges (which headers visit 8, 6, 4, 2) |
| 12 | hard | predict_output | for, step, `continue`, `break`, `%`, accumulators |

Lesson usage: for (3, 5, 7, 12), while (6), do-while (2, 10), ranges (1, 3, 4), progressions (1, 9), downTo (9, 11), step (1, 9, 11, 12), break (5, 6, 8, 12), continue (5, 9, 12), nested loops (4, 8). Type counts: predict_output 4, find_error 2, multi_select 2, single_choice 2, code_comparison 1, fill_blank 1.

# World 13 quiz concept map

Status: Verified for content and integration; phone-width visual review pending  
World: 13 — Scope Masters (Scope Functions)

## Curriculum inventory

World 13 has 10 catalog-linked lessons: 9 regular lessons and one Boss lesson. The regular lessons are `let` & `run`, `apply`, `also`, `with`, `this` vs `it`, Return values of scope functions, Choosing the appropriate scope function, Scope function chaining, and Avoiding overuse and nesting. The Boss is separate from the regular quiz.

## Approved and authored allocation

Question counts vary with concept breadth, receiver/argument traps, return-value distinctions, nullable execution, and chaining risk. Cross-lesson questions combine only lessons in their own set.

| Set | Lessons | Lesson questions | Cross-lesson questions | Set total |
| --- | --- | ---: | ---: | ---: |
| Scope Foundations | `let` & `run` (10), `apply` (9), `also` (9) | 28 | 4 | 32 |
| Context and Results | `with` (9), `this` vs `it` (10), Return values of scope functions (10) | 29 | 4 | 33 |
| Design and Composition | Choosing the appropriate scope function (11), Scope function chaining (10), Avoiding overuse and nesting (10) | 31 | 4 | 35 |
| **Regular total** | **9 lessons** | **88** | **12** | **100** |

Boss: 12 questions, separate. Whole-world bank: **112 questions**.

### Difficulty guide

Regular lesson guidance is approximately 2 easy / 5–6 medium / 2–3 hard for 9–11-question lessons. This is a guide, not a quota; receiver binding, nullable execution, return-value transitions, and nested-chain reasoning take priority. The Boss uses 1 easy / 5 medium / 6 hard and should progress from simple scope behavior to a complete chained configuration pipeline.

## Concept coverage plan

| Lesson | Required concepts | Coverage basis |
| --- | --- | --- |
| `let` & `run` | nullable safe-call execution; argument-style `it`; receiver-style `this`; return of final expression; transformation | Null skipping and receiver/return distinctions are the main traps. |
| `apply` | receiver access; context-object return; configuration mutation; block result ignored; nullable/configuration use | Learners must distinguish configuration from transformation. |
| `also` | argument-style observation; side effects; same-object return; logging/validation use | The key trap is confusing observed value flow with replacement. |
| `with` | receiver block; non-extension call; return of final expression; choosing `with` for grouped access | Contrast with `run` and configuration functions. |
| `this` vs `it` | implicit receiver; implicit argument; explicit names; nested scopes; labeled `this` | Nested scope ambiguity requires multiple distinct scenarios. |
| Return values | `Unit`; context object; lambda result; chaining consequences; compile-time result type | Every scope function’s return family must be tested directly. |
| Choosing | null handling; object configuration; observation; transformation; readability and API intent | Integrates semantics with design decisions. |
| Chaining | value identity; return-type transitions; `apply`/`also`/`run`/`let` composition; execution order | Requires multi-step tracing and output/type reasoning. |
| Avoiding overuse | direct code versus unnecessary scope; nested readability; named lambda arguments; maintainability | Tests judgment and recognizes when scope functions obscure intent. |

## Boss allocation

The Boss contains exactly 12 questions: 1 easy, 5 medium, and 6 hard. Every question combines at least two World 13 lessons, all 9 regular lessons are represented, and the final question is a complete configuration-and-transformation pipeline with a return-type edge case.

Authored type mix: 4 `predict_output`, 2 `find_error`, 2 `multi_select`, 2 `single_choice`, 1 `code_comparison`, and 1 `fill_blank`; no `true_false`. Difficulty is exactly 1 easy / 5 medium / 6 hard, ordered from easy to hard.

## Boss coverage (authored)

| Boss question | World 13 lessons combined |
| --- | --- |
| 1 | `apply`; Return values; Choosing |
| 2 | `apply`; `also`; Return values |
| 3 | `let` & `run`; Choosing; Return values |
| 4 | `with`; Return values; Choosing |
| 5 | `let` & `run`; `also`; `this` vs `it` |
| 6 | `apply`; `also`; `run`; Chaining |
| 7 | `apply`; `this` vs `it` |
| 8 | `also`; `this` vs `it` |
| 9 | `apply`; `run`; Return values; Chaining |
| 10 | `let`; `also`; Choosing; Avoiding overuse |
| 11 | `let`; `also`; Chaining; Avoiding overuse |
| 12 | nullable `let`; `also`; `run`; Return values; Chaining |

All nine regular lessons are represented. Each Boss item combines at least two lessons, and the final item is a complete nullable transformation/observation/result pipeline.

## Audit findings and evidence

- Authored 88 direct lesson questions, 12 cross-lesson set questions, and a separate 12-question Boss: **112 total**. Set arithmetic is 32 / 33 / 35, matching the approved allocation.
- Final whole-bank type mix: 9 true/false, 25 single-choice, 21 multi-select, 3 fill-blank, 39 predict-output, 12 code-comparison, and 3 find-error. Regular difficulty is **20 easy / 48 medium / 32 hard**; Boss difficulty is **1 / 5 / 6**. World 13 has no type-mix or difficulty-mix warning.
- Human wording/distractor review covered all 112 questions. The initial mechanically numbered scenarios were replaced with distinct nullable, collection, builder, receiver-binding, return-transition, chaining, and readability cases. Stock distractors were replaced with lesson-specific misconceptions; multi-select claims now match code that has no scope block; true/false keys are balanced 5 true / 4 false; and comparisons ask for an objective output or compile boundary.
- Corrected four set-question type/prompt mismatches where a question asked which expression or implementation was best but its options were output literals. Set questions 3, 5, 7, 8, 9, 10, and 12 now use question types that match what they ask.
- Real Kotlin compiled/ran **78 executable variants** covering predictions, all fill chips, all find-error programs, and both sides of every comparison: **0 problems**. The teaching-runner bank test also passes.
- `scan.ts 13` reports no filler, generic true/false prompt, duplicate explanation, duplicate code/options, or duplicate code scenario. Strict scope/duplicate auditing reports no later-lesson concept or set-metadata problem.
- Web registration, set/Boss metadata, native routing, generated World 13 bank, and profile content totals are synchronized. The quiz-bank stats counter was hardened against Kotlin-style `Object.prototype.apply/also` helpers so the `apply` and `also` lesson counts print correctly.
- Automated verification passes: `test:quiz-bank`, strict `audit:quiz-bank`, `audit:quiz-standard`, web TypeScript, root TypeScript, native generation, and native generated-data check.

## Current status

World 13 is complete for content, correctness, wording/distractors, automated checks, web/native integration, and generated data. As requested, no visual check was performed; phone-width rendering remains the only open World 13 item.

## Rewrite (Claude, 2026-10-13)

The earlier bank passed every mechanical check but was generated from per-lesson templates. A full read found: 19 of 21 multi-selects
were the same four options ("The complete output is X" / "...is Y" / "completes without a compile-time error" (always correct) / "performs
an unchecked cast" (always wrong)); 18 single-choice questions used two templated prompts ("Which statement correctly describes <lesson
title>?", "Which guideline best applies to <lesson title>?") whose long, careful correct option was copied into the explanation;
predict prompts read "What does this <lesson title> example print?"; the 9 code comparisons paired the real example with an unrelated
one-liner; most explanations ended in generic boilerplate; "Avoiding overuse" predict questions contained no scope function; the Boss
repeated lesson questions and `boss-10` showed a do-nothing program; 28 hints for 112 questions.

All 112 questions were rewritten by hand (`world13Quiz.ts`): 88 lesson questions (same allocation as above), 12 set questions and a
12-question Boss that follows one configuration pipeline (`ServerConfig`: apply, also, let with a fallback, with, nullable steps,
a local variable shadowing a receiver member, final full pipeline) and repeats no lesson or set scenario. Every question has its own
misconception-based distractors, explanation and hint; comparisons differ in exactly one thing; multi-select pairs rotate position.
Lesson mix 2 easy / 4-7 medium / 3-4 hard, at least 5 types per lesson, no type above 40%. True/false 5 true / 4 false, answer
positions 17/17/16/16.

Verification: real kotlinc, 78 executable cases, 0 problems. In-app engine: 35 of 36 predictions match; `w13q-this-vs-it-6` (labeled
`this@outer`) failed until the runner learned labeled `this` (2026-10-13); it is no longer exempt and all 36 predictions now pass on the engine (see PITFALLS.md). `test:quiz-bank`, `audit:quiz-bank`,
`audit:quiz-standard` pass; `generate:native-data` regenerated the app copy. Phone-width rendering not checked.

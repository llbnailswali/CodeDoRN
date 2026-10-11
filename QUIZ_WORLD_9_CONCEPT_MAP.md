# World 9 Quiz Plan — Lambda Lab

Status: **Content audit complete; phone-width rendering pending.** The bank is collected and registered. Lesson, set, and Boss explanations have been reviewed and made specific to the answer, code, and relevant distractors. Structural/scope and executable Kotlin checks pass. No phone-width screenshot review has been performed.

World 9 has 11 regular lessons and a separate Functional Utility Engine Boss lesson. The target mix is **20% easy / 50% medium / 30% hard**. Questions may use earlier World 9 concepts, but must not require a later lesson unless they are explicitly marked as cross-lesson or Boss questions.

## Bank size and difficulty

- 11 regular lessons × 10 questions = **110 lesson questions**. Each lesson: 2 easy, 5 medium, 3 hard.
- 4 sets × 4 cross-lesson questions = **16 set questions**. Each set: 1 easy, 2 medium, 1 hard.
- Full regular quiz = **126 questions**: 26 easy, 63 medium, 37 hard.
- Separate Boss quiz = **12 questions**: 1 easy, 5 medium, 6 hard (10/40/50), per `QUIZ_QUALITY_STANDARD.md` section 10.
- World total = **138 questions**: 28 easy, 69 medium, 41 hard (**20.3% / 50.0% / 29.7%**).

The regular lessons have different Stage 2 prediction counts; those counts describe the lesson activity and do not determine the quiz-bank count.

## Sets

| Set | Lessons in curriculum order | Lesson Qs | Extra Qs | Set total | Scope |
| --- | --- | ---: | ---: | ---: | --- |
| Callable Values | Lambda expressions; Anonymous functions; Function types | 30 | 4 | **34** | Creating, storing, typing, and invoking callable values. |
| Function Composition | Higher-order functions; `it`; Function references | 30 | 4 | **34** | Passing functions, implicit parameters, and `::` references. |
| Return Control | Returning from lambdas; Local returns | 20 | 4 | **24** | Final-expression results, labelled returns, and non-local-return boundaries. |
| Inline Boundaries | Inline functions; `noinline`; `crossinline` | 30 | 4 | **34** | Inlining, retaining function values, and preventing unsafe returns. |
| **Full regular quiz** | **11 lessons** | **110** | **16** | **126** | **Four sets** |
| **Boss, separate** | Functional Utility Engine | — | — | **12** | Compose reusable operations. |

## Lesson concept map and allocation

Each regular lesson receives 10 questions: 2 easy, 5 medium, and 3 hard. The ideas below are coverage guidance, not a requirement to repeat the same example.

| Lesson | Concepts to assess | Misconception to target |
| --- | --- | --- |
| Lambda expressions (`world-9-lambda-expressions`) | `{ parameter -> expression }`; lambda values; invocation; final expression as result; multiple parameters where taught. | A lambda runs when declared; braces alone call it; the arrow or result expression is optional in every case. |
| Anonymous functions (`world-9-anonymous-functions`) | `fun(...) = ...` as a value; explicit parameter/return syntax; invocation; local returns in anonymous functions where shown. | Anonymous functions need a name; they behave exactly like lambdas for every return rule. |
| Function types (`world-9-function-types`) | Read `(Int) -> Int`; assign compatible callables; invoke a typed value; `Unit`/return-type distinction where taught. | The type describes a variable, not a function call; parameter and return positions can be swapped. |
| Higher-order functions (`world-9-higher-order-functions`) | Accept a function parameter; invoke it inside a reusable function; return or compose callable behavior where shown. | Passing a function executes it immediately; a higher-order function must return a function. |
| `it` (`world-9-it`) | Implicit single lambda parameter; use `it` in expressions and nested contexts; replace `it` with an explicit name. | `it` exists with multiple parameters; `it` refers to the collection rather than the current lambda value. |
| Function references (`world-9-function-references`) | `::function`; pass a top-level function as a value; bound and unbound member references as taught. | `::` calls the function; a reference has no function type; bound and unbound member references take the same arguments. |
| Returning from lambdas (`world-9-returning-from-lambdas`) | Final expression result; return value from a lambda passed to a function; distinguish lambda result from outer-function result. | `return` is always required; the last expression is printed automatically; a lambda result changes control flow by itself. |
| Local returns (`world-9-local-returns`) | Labelled returns such as `return@label`; exit only the intended lambda; non-local return rules for inline calls where taught. | Every return exits `main`; a label returns a value; an unlabelled return is valid from every lambda. |
| Inline functions (`world-9-inline-functions`) | `inline` higher-order declaration; conceptual call-site expansion; ordinary runtime output remains unchanged; non-local returns enabled by inline context. | `inline` changes the printed result; every function can be inlined; inline is primarily a runtime output feature. |
| `noinline` (`world-9-noinline`) | Keep a selected function parameter as a real function value inside an inline function; invoke/store/pass it. | `noinline` disables the whole function; it prevents invocation; all parameters of an inline function are automatically noinline. |
| `crossinline` (`world-9-crossinline`) | Prevent non-local returns when a lambda runs in another execution boundary; ordinary invocation still works. | `crossinline` prevents all returns; it makes a lambda asynchronous; it changes the lambda's returned value. |

## Cross-lesson question scope

Four questions per set: 1 easy, 2 medium, 1 hard. Set questions must combine at least two lessons in that set, use the set title as `topic`, use the set's final lesson as `lessonId`, and carry the set's `setId`.

| Set | Easy | Medium (2) | Hard |
| --- | --- | --- | --- |
| Callable Values | Identify a valid function type for a callable. | Compare a lambda with an anonymous function; trace assignment and invocation through a typed variable. | Diagnose a parameter/return-type mismatch and then trace a corrected callable value. |
| Function Composition | Identify which expression is a function reference rather than a call. | Trace a higher-order function using `it`; pass a named function with `::`. | Combine a function reference and a higher-order operation to predict a multi-step result. |
| Return Control | Recognize that a lambda's final expression supplies its result. | Compare a lambda result with an anonymous-function result; trace a labelled local return. | Determine which output and outer control flow remain after a labelled versus non-local return. |
| Inline Boundaries | Identify the purpose of `noinline` or `crossinline`. | Trace an inline call with one retained function value; distinguish ordinary output from compiler behavior. | Compare valid and invalid return behavior across inline, noinline, and crossinline boundaries. |

## Boss quiz — Functional Utility Engine

**12 questions: 1 easy, 5 medium, 6 hard** (authored; verified with real kotlinc). Use small independent utility scenarios: a formatter, calculator, validator, transformer, or dispatcher that accepts function values. Combine World 9 concepts with earlier collections, loops, conditions, and classes only where the lesson has already established them.

The Boss should assess choosing a function type, passing a lambda or `::` reference, applying a higher-order operation, reading `it`, and reasoning about labelled/non-local returns. Use `inline`, `noinline`, and `crossinline` primarily for compiler-rule questions rather than pretending they alter ordinary output. Keep every code sample self-contained and avoid coroutines, reflection, generics beyond previously taught collection types, and unspecified collection order.

## Authoring and verification rules

- Use all seven supported types where they fit: single choice, true/false, predict output, fill blank, find error, code comparison, and multi-select.
- Keep prompts short and plain. Use plausible distractors based on common errors: declaration versus invocation, parameter versus return type, `it` scope, `::` call/reference confusion, final-expression results, and local versus non-local returns.
- Show complete multiline Kotlin snippets with two-space indentation after formatting. Do not rely on hidden imports or omitted declarations.
- Verify ordinary lambda/function-type output with the app runner. Verify inline, `noinline`, `crossinline`, anonymous-function return behavior, and member references with a real Kotlin compiler where the lightweight runner is incomplete.
- Treat valid Kotlin rejected by the app runner as a runner limitation and record it in `KOTLIN_RUNNER_KNOWN_ISSUES.md`; do not rewrite a correct language example merely to satisfy the simulator.
- Audit IDs, answer keys, difficulty counts, XP, lesson/set ownership, duplicates, concept scope, and answer-position balance before registration.

## Expected authored files after collection

- Quiz plan: `QUIZ_WORLD_9_CONCEPT_MAP.md` (this file).
- Authored bank: `web-editor/src/data/quizBank/world9Quiz.ts`.
- Sets and Boss metadata: `web-editor/src/data/quizBank/quizSets.ts`.
- Web quiz registry: `web-editor/src/data/quizBank/index.ts`.
- React Native generated bank: `src/world9Quiz.ts` plus regenerated quiz metadata files.
- Structure test: `web-editor/scripts/test-quiz-bank.ts`.
- A dedicated compiler audit should cover function references and inline-return cases before calling the bank complete.

### Boss coverage (authored)

Real kotlinc confirmed every predicted output, every compile error and its line, each fill-in chip, both code-comparison programs, each option of the two multi-select questions, and the inline/noinline/crossinline rules.

| # | Diff | Type | Lessons combined |
| ---: | --- | --- | --- |
| 1 | easy | single_choice | Function types, parameter and return positions |
| 2 | medium | fill_blank | Function types, higher-order functions, trailing lambda, `it` |
| 3 | medium | single_choice | Lambdas, `it`, function types |
| 4 | medium | predict_output | Higher-order functions, `::` reference, trailing lambda, `it` |
| 5 | medium | code_comparison | Anonymous functions, lambdas, return rules |
| 6 | medium | predict_output | Lambdas, final-expression result, invocation |
| 7 | hard | find_error | Local returns, labels, higher-order `forEach` |
| 8 | hard | predict_output | `it`, local return, `forEach` |
| 9 | hard | multi_select | Inline, `noinline`, `crossinline`, non-local returns |
| 10 | hard | find_error | Inline, `noinline`, function types, returning a function |
| 11 | hard | multi_select | `::` references, lambdas, anonymous functions, function types |
| 12 | hard | predict_output | Function returning a function, higher-order, `it`, collections, loop |

## Audit findings and evidence

- **Resolved — explanation quality.** Replaced generic lesson explanations with concept-specific rationales for the correct answer and plausible wrong forms, kept each trace explanation tied to its code/output, authored separate explanations for all four question types in each set, and strengthened Boss rationales for distractor-specific issues. See the lesson/set builders and Boss explanations in `web-editor/src/data/quizBank/world9Quiz.ts`.
- **Fixed — `w9q-9-8` (hard, inline functions).** Its original example claimed an inline function with no function parameters would fail, but real kotlinc compiles that declaration. Replaced it with an inline higher-order function whose body returns `Int` while its declared return type is `String`; real kotlinc rejects it with a return-type mismatch. The line key remains 0 in the displayed code array.
- **Fixed — `w9q-11-8` marked line.** Real kotlinc reports the prohibited non-local `return`, not the `fun stop()` declaration. Updated the marker to the exact `return` line after the formatter expands the nested lambda.
- **Verification evidence.** `npx tsc --noEmit`, `npm run test:quiz-bank`, `npm run audit:quiz-bank`, and `npm run audit:world9-quality` pass. Real Kotlin checked 76 lesson/set/Boss snippets: 46 compile and 30 expected-rejection cases reject; all 34 `predict_output` results match their answer keys. Native data was regenerated and the check passes. These checks establish code/key correctness, not visual rendering.
- **Rendering pending.** No phone-width screenshot review has been performed for this bank; the current environment has no installed browser or screenshot automation tool. Review representative code, options, and explanation layouts on a phone before calling visual QA complete.

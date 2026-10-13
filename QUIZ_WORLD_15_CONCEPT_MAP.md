# World 15 quiz concept map

Status: Complete — authored, integrated, verified, and clarity-reviewed  
World: 15 — Error Fortress (Exceptions & Error Handling)

## Approved allocation

| Set | Lessons and direct counts | Direct | Cross-lesson | Total |
| --- | --- | ---: | ---: | ---: |
| Exception Flow | Exceptions & try (9), catch (9), finally (9) | 27 | 4 | 31 |
| Throwing & Handling | throw (9), Multiple catch blocks (10), try as an expression (9) | 28 | 4 | 32 |
| Failure Models | Custom exceptions (9), Checked vs unchecked model (9), Result (11) | 29 | 4 | 33 |
| Result Pipelines | runCatching (10), Success/failure handling (12), Error-handling patterns (11) | 33 | 4 | 37 |
| Failure Design | Avoiding swallowed errors (10), Designing meaningful failure paths (11) | 21 | 4 | 25 |
| **Regular total** | **14 lessons** | **138** | **20** | **158** |

Boss: 12 separate questions. Whole-world total: **170**.

## Difficulty plan

Each direct lesson has 2 easy questions; 9–11 question lessons have 3 hard questions and the 12-question lesson has 4. The remainder are medium. Each set contributes 1 easy, 2 medium, and 1 hard. Planned regular aggregate: **33 easy / 77 medium / 48 hard**. Boss: **1 easy / 5 medium / 6 hard**, ordered. Whole-world aggregate: **34 / 82 / 54**.

## Concept coverage

| Lesson | Required coverage |
| --- | --- |
| Exceptions & try | Interrupted control flow; successful path; risky boundary; unchecked model |
| catch | Type matching; subtype matching; exception context; recovery; propagation |
| finally | Success/failure/return cleanup order; expression result; cleanup purpose |
| throw | `Nothing`; expression position; validation; unreachable continuation; meaningful type |
| Multiple catch blocks | First matching handler; specific-before-broad ordering; distinct recovery paths |
| try as an expression | Value from try/catch; shared compatible type; finally is not the value branch |
| Custom exceptions | Extending `Exception`; message/context/cause; final/open hierarchy behavior |
| Checked vs unchecked | No catch-or-declare rule; runtime failures remain possible; `@Throws` interop boundary |
| Result | Success/failure state; accessors; fallbacks; `fold`; difference from thrown flow |
| runCatching | Capturing success/failure; receiver form; deliberate consumption; no automatic logging |
| Success/failure handling | `onSuccess`, `onFailure`, `recover`, `map`, `mapCatching`, `fold` |
| Error-handling patterns | Local recovery; propagation; abstraction-boundary translation; preserving causes |
| Avoiding swallowed errors | Empty catches; ignored `Result`; meaningful fallback/log/rethrow decisions |
| Designing meaningful failure paths | Domain-specific types; actionable context; recovery ownership; stable public contracts |

## Scope and verification constraints

- Direct questions use only their lesson and earlier material; set questions combine only lessons in that set.
- Unhandled exceptions are behavior questions, not literal-output questions. Literal-output keys are used only when execution completes normally.
- Catch ordering, subtype matching, `finally` order, `Nothing`, `Result`, and `runCatching` behavior are checked with real Kotlin.
- `@Throws` is described only as an interoperability declaration; it does not create checked exceptions for Kotlin callers.
- Empty catches and ignored failures are never presented as acceptable production handling.

## Boss plan

Theme: Reliable Order Engine. The 12 questions combine validation, domain exceptions, typed recovery, cleanup, `Result`, `runCatching`, preserving causes, and surfacing failures. Type guide: 4 predict-output, 2 find-error, 2 multi-select, 2 single-choice, 1 code-comparison, 1 fill-blank; no true/false.

## Audit findings and evidence

Authoring, integration, execution/coverage verification, quiz-bank audits,
and the human clarity/wording pass are complete. Phone-width visual review is
intentionally outside the current non-visual workflow.

### Quality repair (Claude, 2026-10-13)

Found by `scan.ts 15`, `real.ts 15` and a full read of the generator and every lesson Predict item.

- **Prompts:** about 70 lesson questions were `single_choice` with the prompt "Which statement correctly explains “<scenario>”?" but output-style options. The generator now uses the lesson's own prompt (`plainPrompt`) or an explicit per-item prompt, and throws if a generic "which answer matches this Kotlin scenario?" prompt remains.
- **Explanations:** about 30 placeholder explanations ("This checks X independently of the other scenarios.") are replaced; the generator throws if one remains.
- **Duplicate scenarios replaced** (same shape with other numbers or types): `exceptions-try` normal/interrupted path, `catch` unmatched propagation, `finally` cleanup after success, `throw` Elvis, `multiple-catch-blocks` ordering (x2), `try-as-an-expression` success/catch value, `custom-exceptions` property, `checked-vs-unchecked` no-throws, `result` getOrNull/getOrDefault, `runcatching` capture, `success-failure-handling` onSuccess/onFailure/getOrElse/fold, `error-handling-patterns` (`toInt` propagation also duplicated `checked-vs-unchecked`), `avoiding-swallowed-errors` ignored Result.
- **Code layout:** `code()` splits top-level `;`, and `tidyLine` fixes spacing (`e:Exception`, `n=try`, `a,b`) for every code field.
- **Other:** a garbage multi-select option (`['receiver form'].join('')`) in `runcatching`; the `checked-vs-unchecked-9` comparison now runs as two lines.
- **Correction to the first review:** the scan's "filler" flags for `result-7` and `success-failure-handling-8` are false positives (the pattern `\(\d\)$` matches `Success(3)` and `Result.success(0)`). The app already lays out braces and semicolons at render time (`formatQuizCodeQuestion`); only spacing needed fixing in the data.
- **Verification:** real kotlinc 92 executable cases, 0 problems (including the broad-before-specific catch order, which compiles). In-app engine: all 46 `predict_output` keys match, no distractor equals the output. Type/difficulty ranges: 0 violations. No type above 40% in any lesson that has predict questions.
- **Open (soft guideline):** `checked-vs-unchecked-exception-model`, `avoiding-swallowed-errors`, `designing-meaningful-failure-paths`, `error-handling-patterns` and `throw` stay `single_choice`-heavy (50-70%); these lessons have few output-producing programs. Boss `boss-5`/`boss-6` are short traces. Phone rendering not checked.
- **Gates (after `world16Quiz.ts` reappeared):** `tsc`, `test:quiz-bank`, `audit:quiz-bank` pass (no duplicates, no later-lesson concepts); `generate:native-data` regenerated the app copy.

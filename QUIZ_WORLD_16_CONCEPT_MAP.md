# World 16 quiz concept map

Status: Complete except visual review (explicitly excluded)  
World: 16 — Coroutine Academy

## Approved allocation

| Set | Lessons and direct counts | Direct | Cross-lesson | Total |
| --- | --- | ---: | ---: | ---: |
| Coroutine foundations | Coroutine fundamentals & builders (9), launch & async (10), await & suspending functions (10) | 29 | 4 | 33 |
| Context and execution | suspend & Coroutine context (9), Dispatchers & Jobs (10) | 19 | 4 | 23 |
| Cancellation and ownership | Cancellation & cooperative cancellation (10), Structured concurrency (10), coroutineScope (9) | 29 | 4 | 33 |
| Supervision and failure | supervisorScope (10), Exception handling in coroutines (10) | 20 | 4 | 24 |
| Coroutine design | Coroutine best practices (10) | 10 | 4 | 14 |
| **Regular total** | **11 lessons** | **107** | **20** | **127** |

Boss: 12 separate questions. Whole-world total: **139**.

## Difficulty plan

Each direct lesson begins with 2 easy questions and uses at least four question
types. The authored bank finishes at **28 easy / 59 medium / 51 hard** across
all 138 questions. Boss: **1 easy / 5 medium / 6 hard**, ordered. The additional
hard questions are deliberate misconception checks and executable traces; no
lesson falls below 9 direct questions.

## Concept coverage

| Lesson | Required coverage |
| --- | --- |
| Coroutine fundamentals & builders | `runBlocking`, `launch`, `Job`, `join`, suspension versus blocking |
| launch & async | side effects versus values, `Deferred`, `await`, lazy start, builder choice |
| await & suspending functions | `suspend`, legal call sites, sequential composition, awaiting results |
| suspend & Coroutine context | context elements, inheritance, `CoroutineName`, `withContext` overlay and restoration |
| Dispatchers & Jobs | dispatcher roles, Job lifecycle, context arguments, simulated-platform boundary |
| Cancellation & cooperative cancellation | cancellation state, `isActive`, `ensureActive`, `yield`, `delay`, cleanup |
| Structured concurrency | parent ownership, child failure, completion, cancellation propagation |
| coroutineScope | fail-as-a-unit behavior, waiting for children, scope boundary |
| supervisorScope | independent child failures, explicit `await` handling, supervision boundary |
| Exception handling in coroutines | owner-level handling, propagation, cancellation distinction, `finally` cleanup |
| Coroutine best practices | structured ownership, explicit results, cancellation cooperation, avoiding global scope |

## Scope and verification constraints

- Questions use only their lesson and earlier material; set questions combine
  only lessons in that set.
- Coroutine questions must use the verified simulator capability honestly:
  deterministic single-threaded behavior is not presented as real scheduling,
  and dispatcher tokens are not presented as real thread switching.
- Cancellation examples use deterministic cooperative checkpoints; no question
  claims that this runtime demonstrates external preemption or wall-clock timing.
- Failure questions distinguish ordinary child failure, supervision, and
  cancellation instead of treating every thrown exception as interchangeable.
- Hardcoded output is not accepted as evidence for Write & Run or Debug; quiz
  code questions must test the coroutine construct or a meaningful consequence.

## Boss plan

Theme: Concurrent Task Runner. The 12 questions combine builder choice,
awaited results, context inheritance, cancellation, structured ownership,
supervision, exception handling, and explicit failure policy. Type guide: 4
predict-output, 2 find-error, 2 multi-select, 2 single-choice, 1
code-comparison, and 1 fill-blank; no true/false.

## Audit findings

- Replaced the curriculum-derived padding generator with 106 explicitly
  authored lesson questions, 20 set questions, and a separate 12-question Boss.
- Reviewed prompts, explanations, and distractors for ownership, completion,
  cancellation, context, and failure misconceptions. Removed stock filler,
  duplicate explanations, duplicate code, and repeated set scenarios.
- Balanced true/false keys at 6 true / 5 false and choice answer positions at
  34 / 33 / 33 before native serialization.
- Boss mix is exactly 4 predict-output, 2 find-error, 2 multi-select,
  2 single-choice, 1 code-comparison, and 1 fill-blank.
- Real Kotlin audit: 62 executable cases, 0 problems. Quiz-bank tests,
  quiz-standard audit through World 16, and strict duplicate/scope audit pass.
- Native quiz data is generated from this web source and checked for drift.
- Type-mix audit exceptions are documented for lessons whose combined direct
  and set pool has 4–6 semantic-choice questions (43–46%). Each still uses at
  least four types; the choices test API/ownership distinctions while output,
  error, multi-select, and comparison items test application. The overall
  21/43/36 regular difficulty mix is intentionally harder than the guideline
  because cancellation, propagation, and scope failure questions require
  multi-step reasoning.

Phone-width visual review remains outside the current workflow by request.

## Rewrite (Claude, 2026-10-13)

The Codex version passed the mechanical checks but was still generated from per-lesson fact rows. A full read found: 11 true/false
items whose statement was a sentence fragment ("The following statement is accurate: An empty context."); 11 multi-selects whose
second correct answer was the template "The owning scope keeps the X contract observable."; stock distractors in about 55 questions
("Use a fixed delay instead." x33, "The runtime chooses without an owner." x11, "No output" x29); five sets that were one template
with the topic swapped (same correct sentence in three of four questions, identical comparisons apart from `set-N`); a Boss that
repeated lesson find-errors and join traces; repeated `launch`+`join` scenarios across lessons; one hint for all 138 questions.

The whole bank was rewritten by hand (`world16Quiz.ts`): 107 lesson questions, 20 set questions (each combining lessons of its set),
and a 12-question Boss that follows one task-runner story and repeats no lesson or set scenario. Every question has its own
misconception-based distractors, explanation and hint. Lesson mix is 2 easy / 4-5 medium / 3 hard with 5-6 types; no type above 40%
in any lesson (no type-mix warnings). True/false 6/5; answer positions 22/22/20/20; multi-select pairs rotate.

Verification: real kotlinc, 83 executable cases (predictions, find-error lines, comparisons, fill-in chips), 0 problems.
`test:quiz-bank`, `audit:quiz-bank` (no duplicates, no later-lesson concepts), `audit:quiz-standard` (no World 16 failure or warning),
`tsc` and `generate:native-data` pass.

The in-app engine disagrees with real Kotlin on 14 predictions (coroutine gaps; see PITFALLS.md, "World 16 quiz: coroutine gaps").
Those ids are listed in `REAL_KOTLIN_ONLY` in `scripts/test-quiz-bank.ts`, so the bank test reports them as checked by real
kotlinc instead of running them on the engine. Phone-width rendering not checked.

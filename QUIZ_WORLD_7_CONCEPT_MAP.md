# World 7 Quiz Plan — Null Safety Shield

Status: **Question bank collected and registered for the React Native app. Lesson and set content audit complete; phone-width rendering check remains.** It follows the 10 regular lessons listed for World 7 plus the separate Boss lesson. The target difficulty mix is **20% easy / 50% medium / 30% hard**; the actual 132-question mix is 19.7% / 49.2% / 31.1%.

## Bank size and difficulty

- 10 regular lessons × 10 questions = **100 lesson questions** (2 easy, 5 medium, 3 hard per lesson).
- 5 sets × 4 additional cross-lesson questions = **20 set questions** (1 easy, 2 medium, 1 hard per set).
- Regular quiz = **120 questions**: 25 easy, 60 medium, 35 hard (20.8% / 50.0% / 29.2%).
- Separate Boss quiz = **12 questions**: 1 easy, 5 medium, 6 hard (8.3% / 41.7% / 50.0%), per the Boss rule in `QUIZ_QUALITY_STANDARD.md` section 10.
- World total including Boss = **132 questions**: 27 easy, 66 medium, 39 hard (20.5% / 50.0% / 29.5%).

Sets are based on lesson groupings, not a fixed set count. Every regular lesson belongs to exactly one set. Each set quiz includes all lesson questions from its lessons and its own additional questions. The Boss is separate and is not part of any set or the regular full quiz.

## Sets and counts

| Set | Lessons | Lesson Qs | Set Qs | Total | Easy | Medium | Hard | Scope |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Nullable Foundations | Nullable types; Nullable variables | 20 | 4 | 24 | 5 | 12 | 7 | Nullable type markers, `null` versus ordinary values, and assigning null or non-null values to nullable variables. |
| Safe Access & Fallbacks | Safe call `?.`; Elvis operator `?:` | 20 | 4 | 24 | 5 | 12 | 7 | Safe property/method access, nullable results, Elvis fallbacks, and safe-call plus fallback combinations. |
| Assertions & Null Checks | Non-null assertion `!!`; Null checks | 20 | 4 | 24 | 5 | 12 | 7 | Assertion behavior and runtime risk; explicit null branches. |
| Smart Casts & Safe Casts | Smart casts; Safe casts `as?` | 20 | 4 | 24 | 5 | 12 | 7 | Flow-based smart casts and safe conversions that return null on a mismatch. |
| Nullable Collections & Chains | Nullable collections and values; Chaining nullable operations | 20 | 4 | 24 | 5 | 12 | 7 | Nullable collection references versus nullable elements, and chained safe calls with a fallback. |
| **Regular total** | **10 lessons** | **100** | **20** | **120** | **25** | **60** | **35** | **Five sets** |
| Boss quiz (separate) | Safe Data Processor | — | — | **12** | **1** | **5** | **6** | Combine World 7 null safety with earlier collection and loop knowledge. |
| **World total** |  |  |  | **132** | **26** | **65** | **41** | **19.7% / 49.2% / 31.1%** |

Collected-bank validation reports **132 questions**: 10 for each regular lesson, 4 additional questions per set, and 12 Boss questions. All seven supported question types are represented. Lesson and set prediction outputs, fill-blank options, find-error cases, and both code-comparison programs were checked with the real Kotlin 2.0.21 compiler. The bank validator and duplicate/later-lesson audit also pass. Phone-width rendering remains unchecked.

## Lesson concept map

Each regular lesson gets 10 questions: 2 easy, 5 medium, and 3 hard. Concepts listed here are scope boundaries and coverage guidance, not a requirement to test every bullet separately.

| Lesson | Concepts to assess | Misconception to target |
| --- | --- | --- |
| Nullable types (`world-7-nullable-types`) | `String?` and other nullable types; `null` is distinct from `""` and `0`; a nullable type can hold either null or a value. | Treating an empty string or zero as null; assuming an ordinary `String` accepts null. |
| Nullable variables (`world-7-nullable-variables`) | Declaring nullable variables; assigning and reassigning null and non-null values; `var` versus `val` where relevant to reassignment. | Assuming a nullable variable must always be null, or that `val` can be reassigned because its type is nullable. |
| Safe call `?.` (`world-7-safe-call`) | Calling a property or method only when the receiver is non-null; result becomes nullable; null receiver safely produces null. | Expecting a crash, a default value, or a non-null result from a safe call. |
| Elvis operator `?:` (`world-7-elvis-operator`) | Use the left value when non-null and the fallback when null; combine with safe calls; recognize the resulting value/type in simple examples. | Thinking the fallback always runs, or that it replaces a non-null left value. |
| Non-null assertion `!!` (`world-7-non-null-assertion`) | Convert a nullable value to a non-null value when the author guarantees it; runtime exception when the value is actually null. | Treating `!!` as a safe null check or as a compile-time-only annotation. |
| Null checks (`world-7-null-checks`) | Branch with `if (x == null)` and `if (x != null)`; understand which branch handles null and which handles a value. | Reversing the branches or assuming a null check changes the stored value. |
| Smart casts (`world-7-smart-casts`) | Use a value after a null check or guard return when Kotlin can establish it is non-null; respect the lesson's stable-value examples. | Assuming a check assigns a new value, or that every mutable/captured value is always smart-cast. |
| Safe casts `as?` (`world-7-safe-casts-as`) | Successful cast returns the converted value; incompatible or null input returns null; result is nullable. | Confusing `as?` with the throwing `as` cast, or assuming a failed cast returns the original value. |
| Nullable collections and collection values (`world-7-nullable-collections-and-collection-valu`) | Distinguish `List<String?>` (elements may be null) from `List<String>?` (the collection may be null); only combine both when explicitly shown. | Treating a nullable element as a nullable list, or assuming a nullable collection makes all its elements nullable. |
| Chaining nullable operations (`world-7-chaining-nullable-operations`) | Chain `?.` through multiple nullable steps; any null receiver short-circuits the rest to null; apply one final `?:` fallback. | Assuming later operations run after an earlier null, or applying the fallback at every step. |

## Cross-lesson question scope

Four additional questions per set: one easy, two medium, one hard. They must combine concepts from more than one lesson in that set and stay distinct from the lesson questions.

| Set | Easy | Medium (2) | Hard |
| --- | --- | --- | --- |
| Nullable Foundations | Identify which declaration can hold null. | Trace a nullable variable through null/value assignments; distinguish null from empty text and zero. | Trace reassignment and a later null test without confusing null with an ordinary value. |
| Safe Access & Fallbacks | Identify when the Elvis fallback is used. | Predict a safe-call result; combine `?.` with `?:` for a simple property or method. | Trace a two-step nullable access and determine whether the final fallback is used. |
| Assertions & Null Checks | Recognize that `!!` can fail at runtime for null. | Trace a null check; compare a guarded access with an assertion. | Compare checked and asserted access for null and non-null inputs. |
| Smart Casts & Safe Casts | Recognize that `as?` returns null for a mismatch. | Predict access after a smart cast; trace a safe cast. | Distinguish flow-based smart casts from explicit safe conversions. |
| Nullable Collections & Chains | Distinguish a nullable list from nullable elements. | Trace a safe-call chain; determine what a null collection or element does. | Trace a multi-step safe-call chain with one final fallback. |

## Boss quiz — Safe Data Processor

**12 questions: 1 easy, 5 medium, 6 hard** (authored; verified with real kotlinc). Use a small data-processing story with records that may be missing values. Combine World 7 null checks, safe calls, Elvis fallbacks, smart casts, safe casts, nullable collection values, and chaining only where appropriate. World 6 collections and earlier loops may be used because they have already been taught. Keep the program and each question self-contained; avoid introducing later-world classes, lambdas, or APIs not covered by the curriculum.

Possible Boss scenario: process a small map or list of user records where a name, score, or optional label may be null; choose a safe fallback, skip or handle missing values explicitly, and produce a short report. Avoid questions that depend on unspecified map iteration order. Do not make one answer necessary to solve a later question.

## Question types and authoring rules

- Use all seven supported types across the World where they naturally fit: single choice, true/false, predict output, fill blank, find error, code comparison, and multi-select. Do not force a type into an unsuitable lesson.
- Keep wording in simple English that an average English learner can understand. Use short prompts, plausible misconception-based distractors, one unambiguous answer, concise explanations that say why, and hints that guide without giving away the answer.
- Highlight important Kotlin terms or expressions in prompts selectively. Use one complete inline-code span for a meaningful expression; do not split a single expression across multiple highlights.
- Any program shown in a question must be formatted as a complete, readable multiline Kotlin code block with correct indentation. Learners can scroll the code panel if needed; do not compress a program into one line to make it fit.
- Check every shown program and expected output with the real Kotlin compiler where possible. `!!` null failures are runtime behavior, not compile errors. Safe-cast examples must use the correct nullable result type. Distinguish compile-time nullability errors from runtime exceptions precisely.
- Verify answer keys, distractors, lesson/set ownership, stable IDs, difficulty counts, hints, explanations, and XP using the quiz-bank validation scripts. Record any lightweight-runner limitation separately; do not call valid Kotlin invalid just because the app runner cannot execute it.

## Planned files when questions are collected

- Authored World 7 bank: `web-editor/src/data/quizBank/world7Quiz.ts`
- Set and Boss registration: `web-editor/src/data/quizBank/quizSets.ts`
- Quiz-bank test registry: `web-editor/scripts/test-quiz-bank.ts`
- React Native quiz registration: `src/quizData.ts`
- Generated React Native bank: `src/world7Quiz.ts`

### Boss coverage (authored)

All 12 questions use one story: records with missing values. Real kotlinc confirmed every predicted output, every compile error (and its line), `name!!` throwing at runtime, and each option of the two multi-select questions.

| # | Diff | Type | Lessons combined |
| ---: | --- | --- | --- |
| 1 | easy | single_choice | Nullable types, null versus empty text |
| 2 | medium | fill_blank | Nullable variables, Elvis |
| 3 | medium | single_choice | Nullable collections (`List<Int?>` versus `List<Int>?`) |
| 4 | medium | predict_output | Safe call, Elvis, nullable list, loop |
| 5 | medium | code_comparison | Nullable Int, Elvis before arithmetic |
| 6 | medium | predict_output | Map lookup, null check, smart cast, loop |
| 7 | hard | find_error | Null check with `||`, smart cast limit, nullable collection |
| 8 | hard | predict_output | Safe call chain, Elvis, absent key versus null value |
| 9 | hard | multi_select | Nullable elements, safe call result type |
| 10 | hard | find_error | Safe cast `as?`, nullable result type |
| 11 | hard | multi_select | Elvis, null checks, `!!` |
| 12 | hard | predict_output | Null check, smart cast, Elvis, Map lookup, loop |

## Lesson and set quality audit — 2026-10-11

**Status: Audit in progress** (content checks complete; phone-width rendering is pending).

| Question IDs | Severity | Evidence | Repair / state |
| --- | --- | --- | --- |
| `w7q-1-1`–`w7q-10-10` | High | Lesson bank used repeated syntax prompts, generic multi-select choices, unrelated nullable `.length` compile errors, and reused scenarios. | Replaced with lesson-specific questions, code traces, misconceptions, compile-error cases, comparisons, and edge-case selections. Reviewed answer keys and explanations against the concept map. |
| `w7q-set-1-1`–`w7q-set-5-4` | High | Set questions largely tested the same generic nullable-name/Elvis example rather than combining each set's two lesson topics. | Replaced with distinct set-specific scenarios. Removed an out-of-set `Profile.name` property and kept examples within the lessons assigned to each set. |
| All executable lesson/set questions | Medium | The simulator does not fully model Kotlin null-safety diagnostics and once treated `value ?. String` as equivalent to `value as? String`. | Checked 80 lesson/set code snippets with real kotlinc; 0 mismatches. Recorded the simulator false positive in `PITFALLS.md`. |
| All World 7 lesson/set questions | Low | `test:quiz-bank` and `audit:quiz-bank` pass; duplicate/later-lesson audit found none. | Content verification complete. Check the rendered options and code panels at phone width before changing status to Verified. |

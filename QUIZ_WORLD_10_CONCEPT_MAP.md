# World 10 Quiz Plan — Collection Wizardry

Status: **Content audit complete; visual review pending.** All 114 lesson, set, and Boss questions received a question-by-question content review. Answer keys and executable examples were checked with real Kotlin; phone-width visual review is left for the user.

World 10 has 9 regular lessons and a separate Data Transformation Engine Boss lesson. The target mix is **20% easy / 50% medium / 30% hard**. Questions may use earlier collection, loop, function, lambda, and null-safety concepts, but must not require a later World 10 operation unless explicitly marked as cross-lesson or Boss content.

## Bank size and difficulty

- 9 regular lessons × 10 questions = **90 lesson questions**. Each lesson: 2 easy, 5 medium, 3 hard.
- 3 sets × 4 cross-lesson questions = **12 set questions**. Each set: 1 easy, 2 medium, 1 hard.
- Full regular quiz = **102 questions**: 21 easy, 51 medium, 30 hard.
- Separate Boss quiz = **12 questions**: 1 easy, 5 medium, 6 hard (10/40/50), per `QUIZ_QUALITY_STANDARD.md` section 10.
- World total = **114 questions**: 22 easy, 56 medium, 36 hard (**19.3% / 49.1% / 31.6%**).

The curriculum's per-lesson `questionsCount` values describe Stage 2 prediction activities and do not determine quiz-bank counts.

## Sets

| Set | Lessons in curriculum order | Lesson Qs | Extra Qs | Set total | Scope |
| --- | --- | ---: | ---: | ---: | --- |
| Transform & Select | `map`/`mapNotNull`/`filter`; `filterNot`/`filterIsInstance`/`flatMap`; `flatten`/`reduce`/`fold` | 30 | 4 | **34** | Transform values, discard/select items, flatten nested results, and accumulate. |
| Organize & Pair | `groupBy`/`associate`/`partition`; `zip`/`chunked`/`windowed`; `distinct`/`sorted` | 30 | 4 | **34** | Build maps and pairs, batch or slide through data, deduplicate, and order. |
| Analyze & Pipeline | `sortedBy`/`min`/`max`; `sum`/`average`/`any`/`all`/`none`; `first`/`find` and collection pipelines | 30 | 4 | **34** | Select keys, calculate summaries, test predicates, find values, and chain operations. |
| **Full regular quiz** | **9 lessons** | **90** | **12** | **102** | **Three sets** |
| **Boss, separate** | Data Transformation Engine | — | — | **12** | Transform and analyze one realistic dataset. |

## Lesson concept map and allocation

Each regular lesson receives 10 questions: 2 easy, 5 medium, and 3 hard. The concepts below are coverage guidance, not a reason to repeat the same data example ten times.

| Lesson | Concepts to assess | Misconception to target |
| --- | --- | --- |
| map, mapNotNull & filter (`world-10-map-mapnotnull-filter`) | `map` preserves one output per input; `mapNotNull` drops null results; `filter` keeps matching original values; lambda result versus predicate. | `map` removes items; `filter` transforms values; `mapNotNull` keeps nulls; a filter predicate should return a transformed value. |
| filterNot, filterIsInstance & flatMap (`world-10-filternot-filterisinstance-flatmap`) | Negated predicates; selecting values by runtime type conceptually; `flatMap` transforms each item into a collection and joins the results. | `filterNot` keeps matching values; `filterIsInstance` converts values; `flatMap` leaves nested lists; `flatMap` is identical to `map`. |
| flatten, reduce & fold (`world-10-flatten-reduce-fold`) | Flatten one nesting level; `reduce` combines elements without an explicit starting value; `fold` starts from an initial accumulator. | `flatten` recursively removes every possible nesting; `reduce` works on empty collections; `reduce` and `fold` always produce the same result. |
| groupBy, associate & partition (`world-10-groupby-associate-partition`) | `groupBy` creates keys to lists; `associate` creates key/value entries; `partition` returns matching and non-matching lists. | These operations all return the same structure; `associate` preserves duplicate keys; partition returns a map. |
| zip, chunked & windowed (`world-10-zip-chunked-windowed`) | Pair values by position; batch into fixed-size groups; create overlapping sliding groups; endpoint and leftover behavior. | `zip` combines every possible pair; `chunked` overlaps; `windowed` is non-overlapping; unmatched zip elements are invented. |
| distinct & sorted (`world-10-distinct-sorted`) | Remove duplicate values while preserving first occurrence order; sort into a new list; original collection remains unchanged. | `distinct` sorts; `sorted` mutates the original; duplicates are kept; sorting changes the source reference. |
| sortedBy & min/max (`world-10-sortedby-min-max`) | Sort by a selected property/key; find smallest/largest values; empty-collection behavior where taught. | `sortedBy` sorts by the object itself rather than the key; `min` returns the index; max/min are always safe on empty collections. |
| sum/average & any/all/none (`world-10-sum-average-any-all-none`) | Numeric aggregation; average result shape; `any`, `all`, and `none` predicate truth conditions, including empty collections where taught. | `average` returns an integer by truncation; `all` means at least one; `none` means every item; empty predicate behavior is guessed from intuition. |
| first/find & collection pipelines (`world-10-first-find-collection-pipelines-and-chai`) | `first` versus `find`; nullable result and no-match behavior; left-to-right pipeline evaluation; intermediate collection types. | `first` returns null on no match; `find` throws; pipeline operations run right-to-left; every operation mutates the source. |

## Cross-lesson question scope

Four questions per set: 1 easy, 2 medium, 1 hard. Set questions must combine at least two lessons in that set, use the set title as `topic`, use the set's final lesson as `lessonId`, and carry the set's `setId`.

| Set | Easy | Medium (2) | Hard |
| --- | --- | --- | --- |
| Transform & Select | Identify which operation changes each value. | Trace `map` plus `filter`; compare `flatMap` with `flatten` or `fold` with `reduce`. | Predict a multi-stage numeric pipeline with discarded nulls and an accumulator. |
| Organize & Pair | Identify the result structure of `groupBy`, `associate`, or `partition`. | Trace `zip`/batching followed by deduplication or ordering; distinguish overlapping windows from chunks. | Determine the final grouped or paired data after several operations, with order stated explicitly. |
| Analyze & Pipeline | Match `any`, `all`, `none`, `first`, or `find` to a need. | Trace sorting by a key and a summary predicate; distinguish `first` from nullable `find`. | Predict a complete pipeline that transforms, orders, aggregates, and selects one result. |

## Boss quiz — Data Transformation Engine

**12 questions: 1 easy, 5 medium, 6 hard** (authored; verified with real kotlinc). Use small, self-contained datasets such as orders, temperatures, scores, inventory, or student records. Questions should combine `map`/filtering, grouping or pairing, aggregation, and a final pipeline decision. Use earlier lambdas, function types, collections, loops, and null safety where useful.

The Boss should test choosing the right operation, tracing intermediate collection shapes, handling nullable results, and respecting order. Every question must specify enough input and ordering information; do not depend on unspecified `Set`/`Map` iteration order or on another Boss answer. Avoid operations not taught in World 10, such as `onEach`, `scan`, sequences, coroutines, or advanced destructuring beyond the lesson content.

## Authoring and verification rules

- Use all seven supported question types where they fit: single choice, true/false, predict output, fill blank, find error, code comparison, and multi-select.
- Keep distractors tied to real mistakes: confusing transform and predicate operations, losing nesting, wrong accumulator initialization, incorrect map shape, zip truncation, chunk/window overlap, mutation assumptions, and empty-collection behavior.
- Show complete multiline Kotlin snippets with two-space indentation after formatting. State the source order whenever output depends on order.
- Verify ordinary collection outputs with the app runner. Verify `filterIsInstance`, nullable `first`/`find`, empty `reduce`/`min`/`max`, and nested collection behavior with a real Kotlin compiler where the runner is incomplete.
- Treat valid Kotlin rejected by the app runner as a runner limitation and record it in `KOTLIN_RUNNER_KNOWN_ISSUES.md`.
- Audit IDs, answer keys, difficulty counts, XP, lesson/set ownership, duplicates, intermediate result shapes, order assumptions, and answer-position balance before registration.

## Expected authored files after collection

- Quiz plan: `QUIZ_WORLD_10_CONCEPT_MAP.md` (this file).
- Authored bank: `web-editor/src/data/quizBank/world10Quiz.ts`.
- Sets and Boss metadata: `web-editor/src/data/quizBank/quizSets.ts`.
- Web quiz registry: `web-editor/src/data/quizBank/index.ts`.
- React Native generated bank: `src/world10Quiz.ts` plus regenerated quiz metadata files.
- Structure test: `web-editor/scripts/test-quiz-bank.ts`.
- Dedicated compiler audit: `web-editor/scripts/test-world10-quiz-kotlin.ts` covers predictions, comparisons, fill-blank options, and error cases.

## Plain-English review

Reviewed wording and answer/explanation accuracy across all 90 lesson questions, 12 set questions, and 12 Boss questions. Simplified technical wording (for example, “predicate” to “test” and “accumulator” to “running total”), rewrote set-identification questions, and split long Boss explanations into shorter sentences. Phone-width rendering is intentionally not included; the user will check visuals.

- `w10q-1-1`: the answer now describes what `map` does specifically; the earlier correct choice mixed the jobs of `map`, `mapNotNull`, and `filter`.
- Replaced repetitive “can this operation be used with a list?” checks with lesson-specific behavior questions; true/false items now test concrete operation facts rather than generic applicability.
- `w10q-1-3`: corrected the answer from `[4, 6, 8]` to `[4, 5, 6]`, matching the code that adds 3 to each of 1, 2, and 3.
- Set and Boss explanations: replaced dense phrasing with shorter descriptions and plain-language steps.
- Multi-select prompts now state exactly how many answers to choose. Clarified the set-3 fill-blank prompt to describe the program's printed `-1`, and corrected several explanations that omitted behavior or described it imprecisely.

### Executable audit evidence

- `npm run test:world10-quiz-kotlin`: checks all 114 records and unique IDs; validates all 28 prediction outputs, 10 code-comparison outcomes, all 16 fill-blank chips, and 11 find-error cases with real Kotlin.
- `npm run test:world10-kotlin`: the World 10 lesson reference passes 122 exact outputs with 3 expected runtime failures.
- `npm run audit:world10-quality`: curriculum quality checks pass.
- Native quiz data must be regenerated and checked after any bank edit. Overall visual sign-off remains pending the user's phone-width review.

### Boss coverage (authored)

Real kotlinc confirmed every predicted output, both compile errors and their lines, each fill-in chip, both code-comparison programs (B throws at runtime), and each option of the two multi-select questions. No question depends on Map or Set order.

| # | Diff | Type | Lessons combined |
| ---: | --- | --- | --- |
| 1 | easy | single_choice | Boolean-returning versus list-returning operations (`any`, `map`, `filter`, `sorted`) |
| 2 | medium | fill_blank | `filter`, `sum` |
| 3 | medium | single_choice | `find`, nullable result |
| 4 | medium | predict_output | `flatMap`, `filter` |
| 5 | medium | code_comparison | `fold`, `reduce`, empty list |
| 6 | medium | predict_output | `partition`, `maxOrNull`, `sorted` |
| 7 | hard | find_error | Nullable elements, `sum`, `filterNotNull` |
| 8 | hard | predict_output | `groupBy`, Map lookup, safe call, Elvis |
| 9 | hard | multi_select | `distinct`, `sorted`, `windowed`, `chunked` |
| 10 | hard | find_error | `average` result type |
| 11 | hard | multi_select | `filter`, `filterNot`, `partition`, `map`, `sum` |
| 12 | hard | predict_output | `zip`, `filter`, `sortedBy`, `map` |

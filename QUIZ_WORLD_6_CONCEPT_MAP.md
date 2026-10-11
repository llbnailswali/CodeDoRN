# World 6 Quiz — Collection Valley

Status: **Quiz content audit complete; phone-width visual review pending.** The 116 regular lesson/set questions and 12 Boss questions have passed structural, scope, answer-key, and executable checks. Visual rendering is left for the user.

## Source and lesson-count note

World 6 currently has **10 lesson titles** in `src/curriculumData.ts`, despite its `lessonCount` field saying 11. This plan follows the 10 titles and the corresponding World 6 lesson records. Correct the count metadata separately if it is confirmed to be stale; do not invent an eleventh lesson to fit it.

## Bank size and difficulty

- 10 regular lessons × 10 questions each = **100 lesson questions** (2 easy, 5 medium, 3 hard per lesson).
- 4 sets × 4 cross-lesson questions = **16 set questions** (1 easy, 2 medium, 1 hard per set).
- Regular quiz = **116 questions**: 24 easy, 58 medium, 34 hard (20.7% / 50.0% / 29.3%).
- Separate Boss quiz = **12 questions**: 1 easy, 5 medium, 6 hard (10/40/50, section 10 of the quiz standard).
- World total including Boss = **128 questions**: 21 easy, 61 medium, 46 hard.

Sets group related lessons; set count is not fixed across Worlds. Every regular lesson belongs to exactly one set. Set questions are additional and combine concepts from their set. The Boss quiz is separate and can combine the completed World 6 concepts.

## Sets

| Set | Lessons | Lesson Qs | Set Qs | Total | Scope |
| --- | --- | ---: | ---: | ---: | --- |
| Ordered and Unique Collections | Arrays; Lists; Sets | 30 | 4 | 34 | Fixed-size ordered arrays, zero-based indexing, read/replace by index, read-only lists, unique set values, and membership checks. |
| Maps and Mutability | Maps; Mutable vs read-only collections | 20 | 4 | 24 | Key-value lookup, `to` pairs, `containsKey`, read-only versus mutable factories, and the distinction between a `val` reference and a mutable collection's contents. |
| Creating, Changing, and Iterating | Creating and accessing collections; Adding/removing/updating mutable elements; Iterating over collections | 30 | 4 | 34 | `*Of` factories, `[]` and `get`, first/last access, list/set/map changes, map removal by key, iteration, and map pair destructuring. |
| Common Operations and Choosing a Type | Basic collection operations; Choosing the right collection type | 20 | 4 | 24 | Empty checks, `indexOf` and `-1`, `sorted()` returning a new list, and choosing Array/List/Set/Map for the stated need. |
| **Regular total** | **10 lessons** | **100** | **16** | **116** | **Four sets** |
| Boss (separate) | Student Records | — | — | **12** | Integrate collections in a small student-record scenario. |

Each set has 4 additional questions: **1 easy, 2 medium, 1 hard**. With its lesson questions, each set has a mix close to 20/50/30:

- Ordered and Unique Collections: 7 easy, 17 medium, 10 hard (34 total).
- Maps and Mutability: 5 easy, 12 medium, 7 hard (24 total).
- Creating, Changing, and Iterating: 7 easy, 17 medium, 10 hard (34 total).
- Common Operations and Choosing a Type: 5 easy, 12 medium, 7 hard (24 total).

## Lesson concept map

Every lesson gets 10 questions: 2 easy, 5 medium, 3 hard. Use the list below as a scope boundary and coverage guide, not a checklist that forces every detail into a question.

| Lesson | Concepts that may be assessed | Common misconception to target |
| --- | --- | --- |
| Arrays | Fixed size; ordered elements; same-kind values; zero-based indexes; read and replace an existing element; `contentToString()` for readable array output. | Index starts at 1; changing an index adds an element; printing an array directly prints its values. |
| Lists | Ordered, read-only `List`; `listOf`; index-based reads; zero-based indexing. | A read-only list can be changed with `add`; indexes start at 1. |
| Sets | No duplicate values; `setOf`; membership with `contains`; `mutableSetOf` supports changes. | A duplicate is stored twice; membership lookup returns the element rather than a Boolean. |
| Maps | Key-value pairs; `mapOf`; `to`; retrieve by key with `map[key]`; `containsKey`. | Lookup uses a positional index; a key and value can be reversed; `containsKey` returns the stored value. |
| Mutable vs read-only collections | `listOf`/`setOf`/`mapOf` versus mutable factories; add/remove on mutable collections; `val` prevents reassignment of the reference but does not freeze mutable contents. | `val` makes the collection contents immutable; read-only collections support mutation methods. |
| Creating and accessing collections | `arrayOf`, `listOf`, `setOf`, `mapOf`; `[]`; List `get(index)`; `first()` and `last()`. | `get(2)` is the second element; all collection types use positional access the same way. |
| Adding/removing/updating mutable elements | List `add`, `remove(value)`, `removeAt(index)`, indexed assignment; Set add/remove; Map add/update by key and remove by key. | `remove(value)` and `removeAt(index)` do the same thing; maps remove by value; sets/maps have list-like positions. |
| Iterating over collections | `for (item in collection)` on Array/List/Set; map entries as `(key, value)` pairs; loop order of execution; combining a loop with taught conditions/accumulators. | A map loop variable is automatically only the value; the loop skips elements; assume a Set has a particular order unless taught. |
| Basic collection operations | `isEmpty()`/`isNotEmpty()`; `indexOf` returns first position or `-1`; `sorted()` produces a new ordered List and leaves the original unchanged. | `indexOf` returns `null`; `sorted()` changes the original; empty checks return collection size. |
| Choosing the right collection type | List for order and duplicates; Set for uniqueness; Map for key lookup; Array for fixed-size or stated interoperability needs; List as the everyday default as taught. | Treat all collection types as interchangeable; choose Map for positional access; choose Set when duplicates matter. |

## Set-question scope

Set questions may combine the lessons in that set and any earlier World 6 knowledge needed to make the task understandable. Do not test a concept before its lesson in a lesson-specific question. Keep each set question distinct from its lesson questions.

Suggested cross-lesson combinations:

| Set | Easy | Medium (2) | Hard |
| --- | --- | --- | --- |
| Ordered and Unique Collections | Identify which type removes duplicates. | Compare an indexed List/Array read with Set membership; trace values where duplicate inputs are ignored by a Set. | Choose between an Array, List, and Set for a short scenario, then trace a read or membership result. |
| Maps and Mutability | Recognize the key and value in a pair. | Read/update a value by key in a mutable map; decide what can change when a mutable collection is stored in a `val`. | Trace a small record map with a mutable/read-only distinction and identify the correct lookup or attempted change. |
| Creating, Changing, and Iterating | Recognize a valid `*Of` factory or collection access. | Apply a sequence of list changes before iterating; trace a map loop that destructures key/value pairs. | Trace creation, mutation, and iteration to determine the final contents/output, using only the specified collection order. |
| Common Operations and Choosing a Type | Match one simple need to List, Set, or Map. | Use `indexOf`/empty checks before choosing a collection; explain why `sorted()` leaves the original unchanged. | Choose a suitable type for multiple data needs and trace a lookup/operation without assuming unspecified Set or Map iteration order. |

## Boss quiz — Student Records

**12 questions: 1 easy, 5 medium, 6 hard** (authored; verified with real kotlinc). The Boss can combine all World 6 lessons. Use a small, clear scenario such as a student roster, unique course names, and a map from student name to score. Test choosing appropriate types, adding a record, key lookup, safe iteration/destructuring, and a basic operation. Keep questions independent enough that one wrong answer does not make later questions impossible. Do not introduce classes, nullable values, lambdas, or other later-World concepts.

## Question types and quality checks

Across the World, use all seven supported types where they fit: single choice, true/false, predict output, fill blank, find error, code comparison, and multi-select. Do not force a type into a lesson where it does not assess the concept naturally. Use short valid Kotlin snippets, plausible misconception-based distractors, one clearly correct answer, concise explanations, and hints that guide without revealing the answer. Highlight important code terms selectively in prompts; keep code formatting legible and simple English in all question text.

Execution/authoring cautions:

- Do not rely on Set or Map iteration order unless the exact API and order guarantee are part of the taught material; avoid order-sensitive outputs for these collections.
- Distinguish arrays, read-only collections, and mutable collections precisely. In Kotlin, “read-only” does not promise deep immutability.
- Verify `contentToString()`, map destructuring, `sorted()`, and each collection operation against the actual Kotlin behavior. Mark cases not supported by the lightweight app runner for separate compiler verification; do not label valid Kotlin as invalid merely because the runner rejects it.
- Check all answer keys, output, lesson/set ownership, difficulty counts, stable IDs, and hints/explanations with the quiz-bank validation scripts before acceptance.

## Planned files when questions are collected

- Authored bank: `web-editor/src/data/quizBank/world6Quiz.ts`
- Set/Boss registration: `web-editor/src/data/quizBank/quizSets.ts`
- Quiz bank registry: `web-editor/src/data/quizBank/index.ts`
- Generated native copy: `src/world6Quiz.ts`

The World 6 bank contains 128 total questions: 100 lesson, 16 set, and 12 Boss. Standard gates verify structure, keys, answer positions, predictions, fill-blank alternatives, duplicate scenarios, and concept scope.

## Quiz audit findings and repairs

- Every multi-select prompt now states the number of correct choices. The audit found and repaired 12 prompts that were missing this count.
- Reformatted compressed semicolon-separated code-comparison snippets as readable multiline Kotlin.
- Removed two repeated lesson checks: `w6q-list-4` now tests repeated List entries rather than repeating the List factory question; `w6q-map-8` now combines two keyed lookups rather than repeating a single lookup.
- Clarified `w6q-list-7` to ask what the code prints and explain its index result. Rewrote the `w6q-set-map-3` explanation to avoid an ambiguous line number.
- Real Kotlin verifies all 10 comparison pairs and their answer keys, plus all 13 `find_error` questions (11 compile errors with marked-line checks and 2 expected out-of-range runtime failures).
- `npm run test:quiz-bank` checks all prediction answers and fill-blank alternatives. `npm run audit:quiz-bank` reports no duplicate scenarios or later-lesson concepts. `npm run lint` and native-data consistency checks pass.
- Correct-choice positions across the 85 single-choice, prediction, and comparison questions are balanced: **29 / 19 / 19 / 18**.
- Type-mix note: eight lesson-only banks keep every type at or below 40%. The mutation lesson uses 50% predictions to assess distinct change sequences; the collection-choice lesson uses 50% single-choice to assess suitable types without contrived code-tracing questions.

Visual phone-width review was not performed; it remains the user's check.

### Boss coverage (authored)

All 12 questions follow one story, Student Records (roster, score book, tags). Real kotlinc confirmed every predicted output, both compile errors and their lines, every fill_blank chip, both code_comparison programs and each option of the single_choice and multi_select questions.

| # | Diff | Type | Lessons combined |
| ---: | --- | --- | --- |
| 1 | easy | single_choice | Mutable vs read-only, Lists, Arrays, Choosing a type |
| 2 | medium | predict_output | Sets (contains), Maps, Iterating (destructuring) |
| 3 | medium | fill_blank | Maps, Adding/removing (remove by key), Mutable |
| 4 | medium | predict_output | Arrays (update, contentToString), Iterating |
| 5 | medium | single_choice | Lists, Basic operations (sorted copy), Creating |
| 6 | medium | code_comparison | Maps, Iterating (entry destructuring) |
| 7 | hard | find_error | Arrays (fixed size), Mutable vs read-only |
| 8 | hard | predict_output | Lists, Adding/removing (remove vs removeAt), Updating |
| 9 | hard | multi_select | Sets, Maps, Creating/accessing, Mutable vs read-only |
| 10 | hard | find_error | Iterating, Lists, Updating by index |
| 11 | hard | multi_select | Lists, Sets, Basic operations (indexOf, last, isNotEmpty) |
| 12 | hard | predict_output | Lists, Sets, Maps, Adding/removing, Iterating, Basic operations (indexOf -1) |

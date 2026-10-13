# CodeDo quiz quality standard

The authoritative quality rule for every quiz question in every world, including Boss quizzes. It governs quiz questions only.
`LESSON_QUALITY_STANDARD.md` governs lessons and `PRACTICE_CONTENT_PASS.md` governs Practice. Per-world evidence lives in
`QUIZ_WORLD_<N>_CONCEPT_MAP.md`; this file holds the rules, those files hold the findings. Where a lesson-standard rule about
Predict questions applies (answer key matches the question asked, misconception-based distractors, no answer-position patterns,
no duplicate scenarios), it applies here too.

The real Kotlin compiler is the authority on disputed semantics. The simulator is not.

## 0. Required first output when starting a world

Whenever a new world's quiz data gathering begins, the **first response must be a planning report** before research, question writing, or other data collection. Do not start gathering until this report has been shown to the user. This applies even if the user says “begin,” “proceed,” or “do all steps”; acknowledge the request by presenting the plan first, then continue.

The report must analyze lesson complexity and show:

- Every regular lesson, its proposed question count, and a brief reason tied to concept breadth, traps, compile/runtime boundaries, and distinct scenario needs. Counts must vary where justified; never default to 10 per lesson.
- Per-set arithmetic: lesson-question subtotal + planned cross-lesson questions = set total.
- Regular-quiz total, separate Boss count, and whole-world total. Verify every subtotal and grand total arithmetically.
- A difficulty-mix guide for lesson count bands (for example, about 2/6/4 for 12 questions, 2/6/3 for 11, 2/4/3 for 9, and 2/4/2 for 8), plus planned set and Boss mixes where useful. These are guides, not quotas; lesson complexity and question quality take priority.
- Any assumptions, curriculum uncertainties, or scope choices that could change the totals.

Use a compact table for lesson allocation and a clearly itemized set/total summary, for example:

```text
Set 1: 34 lesson questions + 4 cross-lesson questions = 38
Set 2: 29 + 4 = 33
Set 3: 32 + 4 = 36
Set 4: 45 + 4 = 49
Regular quiz: 156 questions
Boss quiz: 12 questions, separate
Whole-world bank: 168 questions
```

Those numbers are illustrative only. Calculate each new world's report from its actual curriculum and chosen set structure; do not reuse the example totals. Record the approved allocation in `QUIZ_WORLD_<N>_CONCEPT_MAP.md` before authoring, and revise the report and map if curriculum analysis later changes the plan.

## 1. Structure

- The Quiz offers **sets plus the full quiz** (and "Review mistakes"). There is no per-lesson quiz.
- Every lesson of a world belongs to exactly one set (`web-editor/src/data/quizBank/quizSets.ts`).
- A set quiz = all questions of its lessons + the set's own cross-lesson questions (`setId`; `lessonId` = the set's last lesson;
  `topic` = the set title).
- The Boss is its own card, not a set, and is locked until every set is finished (all answered, none left to review).
- Edit questions ONLY in `web-editor/src/data/quizBank/world<N>Quiz.ts`. Never edit the generated copy; run
  `npm run generate:native-data` instead.

## 2. Coverage

- Derive each lesson's question count from its concept map (`QUIZ_WORLD_<N>_CONCEPT_MAP.md`), not from a fixed quota. As a
  guide, about 8-12 per lesson, more for trap-heavy lessons and bosses.
- Every question traces to a concept-map row, and every commonly used concept of the lesson has a question.
- Changing only names or numbers does not add coverage.
- Cross-lesson combinations are set questions, never lesson questions.

## 3. Difficulty

Target mix per lesson, per set and per full-quiz session: **20% easy, 50% medium, 30% hard.** (Boss quizzes use their own mix, section 10.) Difficulty is about the thinking
needed, not the question type.

| Level | Meaning | XP |
| --- | --- | ---: |
| Easy | recall or recognise one fact | 10 |
| Medium | apply one concept to code (trace, fix, complete, pick valid) | 15 |
| Hard | multi-step reasoning, an edge case or trap, or combining concepts OF THE SAME LESSON | 20 |

## 4. Lesson purity

A question may use its own lesson's concepts and EARLIER lessons' concepts, never a later lesson's. (A Strings question must not
hinge on World 2 comparison operators.) `npm run audit:quiz-bank` enforces this.

**Set questions stay inside their set's topics.** A set question (`setId`) must test concepts taught by the lessons listed in that
set (see `quizSets.ts`), combining two or more of them; it must not introduce a concept from a lesson outside the set, and a
lesson question must not borrow from a different set's lessons except earlier ones. Its `topic` is the set title and its `lessonId`
the set's last lesson. When rewriting a question, check its lesson (or set) topic list first.

## 5. Question types

Seven types exist: `predict_output`, `single_choice`, `multi_select`, `true_false`, `find_error`, `code_comparison`,
`fill_blank`. Typed-answer questions were considered and dropped.

### 5a. Allowed difficulty per type (HARD RULE, enforced by script)

| Type | Allowed difficulty | Rules |
| --- | --- | --- |
| `true_false` | easy only | One unambiguous statement. A 50% guess rate makes it too weak for medium/hard. |
| `single_choice` | easy, medium | Recall or a concept check; one clearly correct option. |
| `fill_blank` | easy, medium | The blank is one syntax/concept piece; the answer is engine-verified. |
| `multi_select` | medium, hard | State how many answers are correct. All-or-nothing unless decided otherwise. |
| `code_comparison` | medium, hard | The two snippets differ in exactly the thing being tested. |
| `predict_output` | medium, hard | Options are the exact literal output; every answer is engine-verified. |
| `find_error` | medium, hard | The error is reproducible and is a real Kotlin compile/runtime error confirmed by real kotlinc, not a simulator quirk. |

A question outside its type's range fails the check.

### 5b. Type mix (SOFT GUIDELINE, warns, never fails)

- No single type above **40%** of a lesson's questions.
- At least **three different types** per lesson (a very small lesson may be exempt).
- Balance output prediction against recognition questions.
- A warning may be overridden with a one-line reason in the world's concept map (for example a pure-syntax lesson where
  `predict_output` makes little sense). Never write a weak question just to fill a type slot.

## 6. Question and answer quality

- Say explicitly whether the learner is predicting output, a type, compilation, or a particular step. A type question is not an
  output question.
- Exactly one unambiguous correct answer; the key matches the question actually asked.
- Distractors reflect real misconceptions. No stock or filler options repeated across questions.
- Spread the correct-answer position (`npx tsx scripts/rebalance-quiz-answers.ts`). No position dominates.
- No duplicate scenario within a lesson or across a set.
- Every question has an explanation tied to its code and to why the wrong options fail.
- A `predict_output` correct option is the bare literal output, not an explanatory sentence.
- Code in a question is properly formatted Kotlin: one statement per line, 2-space indentation, normal spacing, no
  semicolon-crammed members (see `PITFALLS.md`).

## 7. Correctness verification

- Run every executable answer through `compileAndRunKotlin` and compare with a value worked out by hand, written down BEFORE
  running. Do not trust that it ran.
- Compile-error answers: engine check plus a hand check; a disputed case is checked against real kotlinc (`npm run
  real-kotlin:serve`).
- Avoid the simulator's known blind spots (`PITFALLS.md`, `KOTLIN_RUNNER_KNOWN_ISSUES.md`): Int/Long and Float/Double type
  distinctions, Char vs String, `println(array)`, a Double inside a collection, `Unit` printing. Rewrite the question rather
  than ship one that depends on a runner gap.
- A mismatch between what a question asks (for example a count) and what the validator compares (literal output) is a
  question defect, not a runner bug.

## 8. Rendering

- Kotlin code renders through `renderKotlinCodeLines`; exact outputs through `renderVisibleWhitespace`, never word-wrapped;
  prose quoting an exact output through `renderProseWithUnbreakableQuotes`.
- Check the rendered question on a phone-width screen after content or UI changes. Data correctness is not render correctness.

### Highlighting code in prompts and explanations (World 1 set 1 is the model)

- **Mark code with explicit backticks.** The author writes `` `statically typed` ``, `` `Hello` `` or `` `fun greet(name: String)` `` in the question text; the app draws it as a code chip. The automatic highlighter (`emphasizeQuizPrompt`, Worlds 2, 3, 4, 5, 7, 8 only) never touches text inside backticks, and a world without a list (1, 6, 9, 10) shows only what the author marked.
- **What to mark:** anything a learner could type: keywords, types, operators, literals, function and variable names, exact output text (`` `Total: 5` ``), and a whole signature or expression as ONE chip (`` `List<String?>` ``, `` `x in 1..5` ``). Mark the first mention and keep the same term marked everywhere (for example `statically typed` in every question that uses it).
- **What not to mark:** ordinary English that happens to be a keyword (`in`, `is`, `if`, `step`, `open`, `data`, `class`) unless it is code in that sentence; company or product names (Kotlin, Java, JetBrains); generic prompts ("What will this code print?") and words that only describe a concept (null safety).
- **Never split an expression.** Do not leave half an expression marked (`` `List<Animal` > ``, `` `Int = n` * `2` ``). When unsure, put the whole expression in one pair of backticks.
- **The same rule applies to explanations.** The app draws an explanation one sentence per paragraph and turns backticked text into chips (`ExplainText`), on the answer screen and in the review. Mark code, operators and exact output in explanations the way you do in prompts. Hints are plain text: do not put backticks in a hint until the app supports it.
- **Options are plain text.** Backticks in an option are shown literally. To mark code in options, make the options code snippets and set `monoOptions: true` (for example `println("Hi")`, `class Box`, `fun main()`), but keep them within the lesson's concepts (the lesson-order audit applies to options too).
- **Checks:** `real.ts`/`scan.ts` do not check highlighting yet; a broken-chip check (odd number of backticks, a chip ending in `<` or `=`, a chip containing only part of an expression) is still to be added to `audit:quiz-standard`.

## 9. Gates before shipping

```sh
npm run test:quiz-bank                    # structure + engine-checked answers + type/difficulty rules
npm run audit:quiz-bank                   # duplicates + later-lesson concepts + type-mix warnings
npx tsx scripts/rebalance-quiz-answers.ts
npm run generate:native-data
npx tsc --noEmit
npm run audit:dash-collision              # when prose mentions ++ or --
```

## 10. Boss quizzes

The Boss checks that the learner can COMBINE the world's concepts, the way the boss lesson's capstone program does. It is harder
than a set quiz, but it is not hard-only: a ramp keeps it fair and keeps the result informative.

- **Size:** 12 questions.
- **Difficulty mix: 10% easy / 40% medium / 50% hard** (12 questions = 1 easy, 5 medium, 6 hard). This replaces the 20/50/30 mix of
  section 3 for Boss quizzes only. Order the questions easy to hard.
- **Every question combines concepts.** Two or more lessons of the world (or earlier worlds), never a later world's. Even the easy
  question combines two simple ideas; plain single-fact recall belongs to lesson and set quizzes.
- **One theme.** Every question looks like a piece of the boss program (a calculator, a profile, a data store) and the questions
  may follow its story in order. Each of the 12 has its own scenario: no templated copies ("Pipeline 1, 2, 3...").
- **Coverage:** every lesson of the world is used by at least one Boss question; record it in the world's concept map.
- **Types (guide for 12):** `predict_output` 4, `find_error` 2, `multi_select` 2, `single_choice` 2, `code_comparison` 1,
  `fill_blank` 1, `true_false` 0 (easy-only, too weak for a capstone). The section 5a difficulty ranges and the 40% cap still apply.
  The easy question is a `single_choice` or `fill_blank`.
- **The last question** is the hardest: a short complete program with an edge case.
- **Uniqueness:** all Boss questions are new; none repeats a lesson or set question's scenario (`audit:quiz-bank` duplicates
  check). All other rules (sections 4 to 9) apply unchanged.

## 11. Review states and records

Use the lesson standard's states: Not audited, Audit in progress, Changes required, Blocked by capability, Verified. Record
findings per world in its concept map file with question id, severity, evidence and repair. Reopen verification when questions,
runner behaviour or checks change. Add a `PITFALLS.md` entry for every new quiz bug.

### Audit procedure for one world (the approach used for Worlds 5 and 8)

1. **Scan** (`npx tsx scripts/quiz-audit/scan.ts <N>` in `web-editor/`): filler options, generic prompts, repeated explanations, hints and code, answer-position balance, multi-select answer counts, per-lesson type and difficulty mix.
2. **Read every question** (`scripts/quiz-audit/dump.ts <N> <from> <to>`, about 30 per pass). Look for: a question that does not match its code, a statement that cannot be true as worded, duplicate scenarios (same code with renamed variables), set questions that use a concept outside the set's lessons, "hard" labels on trivial traces, "find the error" lines that compile or whose compiler line differs from the keyed line, multi-select with no code but a prompt that says "this code", and broken code chips in prompts (wrap signatures in explicit backticks).
3. **Run every executable question through real kotlinc** (`scripts/quiz-audit/real.ts <N>`; compile errors are reported at code line + 4). Check predictions, find-error lines, each fill-in chip and both code-comparison programs. Code-comparison snippets that show only calls report false alarms; verify those by hand with the declaration added. Evaluate multi-select and single-choice facts with a small ad hoc script, one option at a time. If kotlinc disagrees with a key, fix the question.
4. **Human wording/distractor pass:** read every regular, set, and Boss question after answer-position rebalancing. Check that the prompt asks exactly one thing, distractors represent real misconceptions rather than filler, explanations match the displayed option order and code, hard labels require meaningful reasoning, and repeated wording does not hide duplicate scenarios. Rewrite any defect in the world's source file.
5. **Fix and verify** by re-running `scan.ts`, `real.ts`, `npx tsc --noEmit`, `npm run test:quiz-bank`, `npm run audit:quiz-bank`, `npm run audit:quiz-standard`, and `npm run generate:native-data -- --check`.
6. **Record** in the world's `QUIZ_WORLD_<N>_CONCEPT_MAP.md` under "Audit findings and evidence" (what was fixed, what stays open) and update section 12.

Limits: an audit like this checks keys, scope, duplicates, wording and display of code, but it does not re-write every explanation or judge each distractor in depth (Codex's audits of Worlds 7, 9 and 10 did more of that), and it does not check phone rendering. The scripts live in `web-editor/scripts/quiz-audit/` (new, not yet committed).

## 12. Progress log (resume here)

Last updated 2026-10-13. Update this section at the end of every quiz work session; keep it short.

**Done**
- Standard written (sections 1-11) and imported by CLAUDE.md (it is the only file loaded automatically for quiz work).
- Type/difficulty ranges (section 5a): all 10 worlds have 0 violations (45 questions rewritten to fit, difficulty kept).
- Boss quizzes (section 10): all 10 worlds rewritten to 12 questions, 1/5/6, ordered, no true/false, type guide followed, every answer
  checked with real kotlinc. Each world's `QUIZ_WORLD_<N>_CONCEPT_MAP.md` has a "Boss coverage (authored)" table. World 1 total was 145 after the Boss rewrite and is 147 after the content audit.
- Highlighting rule written (section 8, "Highlighting code in prompts and explanations"); applied to World 1 set 1 (`setstart-1`, `setstart-4`, `syntax-6` options). Other worlds' prompts have not been reviewed against it.
- Quiz code formatter bugs fixed (`formatQuizCodeQuestion`: closing-brace indent, `} else {`, `{ n ->`); see PITFALLS.md.
- `test-world8-quiz-kotlin.ts` offset fixed (+4). Simulator gaps found are listed at the end of PITFALLS.md.
- World 7 lesson/set questions rewritten and audited: 80 executable snippets checked with real kotlinc; quiz-bank tests, duplicate/later-lesson audit, and World 7 curriculum quality audit pass. Phone-width rendering remains pending; findings are recorded in `QUIZ_WORLD_7_CONCEPT_MAP.md`.
- World 9 lesson/set explanations and Boss distractor rationales audited and repaired; one false compile-error claim (`w9q-9-8`) was corrected. Typecheck, bank tests, duplicate/scope audit, and curriculum quality audit pass. Real kotlinc checked 76 lesson/set/Boss snippets (46 compile, 30 expected rejections); all 34 predicted outputs match. **World 9 content audit complete; phone-width rendering remains pending.** Findings/evidence are in `QUIZ_WORLD_9_CONCEPT_MAP.md`.
- World 10 content audit complete: all 114 items reviewed, including wording, keys, distractors, and explanations. Dedicated real-Kotlin audit covers all 28 prediction outputs, 10 code comparisons, all 16 fill-blank choices, and 11 find-error cases; see `QUIZ_WORLD_10_CONCEPT_MAP.md`. Phone-width visual review is pending and will be done by the user.
- Re-checked after Codex's Worlds 7, 9, 10 audits (Claude, 2026-10-11): `tsc`, `test:quiz-bank`, `audit:quiz-bank`, `test:world10-quiz-kotlin` pass;
  0 type-range violations, 0 type-mix warnings, 0 filler ("Not X") options in those worlds. Residuals to tidy: 11 (W9) and 9 (W10) generic
  "True or false: ..." prompts, 1-2 repeated code+options pairs per world, 103 distinct explanations of 132 in W7.
- World 8 content audit done (Claude, 2026-10-11): all 158 questions read; 12 questions rewritten (duplicates, out-of-scope enum members, trivial "hard" ones), 5 multi-selects de-patterned, `object`-vs-instance wording fixed, prompt highlighter fixed for generic types (`List<Animal>`); real kotlinc agrees with every key. Findings in `QUIZ_WORLD_8_CONCEPT_MAP.md`. Phone rendering pending.
- World 5 content audit done (Claude, 2026-10-11): all 104 questions read, 95 executable programs checked with real kotlinc; 1 wrong key (`named-10`), 1 question not matching its code (`param-5`), 2 "errors" that were not compile errors, 6 trivial "hard" ones and broken code chips fixed. Findings in `QUIZ_WORLD_5_CONCEPT_MAP.md`. Phone rendering pending.
- World 6 quiz content audit complete: all 128 questions pass structure/scope/runner checks; 12 multi-select prompts now state the answer count; comparison snippets and two repeated lesson questions were improved. Real Kotlin verifies all 10 comparison pairs and all 13 error cases. Phone-width visual review remains for the user; evidence is in `QUIZ_WORLD_6_CONCEPT_MAP.md`.
- World 4 content audit complete (2026-10-11): all 116 lesson/set questions and 12 Boss questions reviewed. Twelve quiz items rewritten: duplicate progression, three output whitespace/layout mismatches, one infinite-loop find-error changed to a real compile error, and seven T/F statements rebalanced to 7 true/7 false. Real kotlinc checked 91 executable cases; every predicted output matches, the negative-step runtime exception is confirmed, and the known `w4q-range-8` flake did not reproduce. All requested code-quality gates pass; phone-width rendering remains for the user. Evidence: `QUIZ_WORLD_4_CONCEPT_MAP.md`.
- World 2 content audit complete (2026-10-11): all 78 regular and 12 Boss questions reviewed. Fixed two duplicate scenarios, two false “find error” claims, an ambiguous prefix/postfix comparison, and a multi-select prompt missing its answer count; rebalanced true/false and answer positions. Real kotlinc: 76 lesson/set executable cases and 12 keyed Boss cases, zero mismatches. Requested quality gates pass; six soft type-mix warnings and phone-width rendering remain. Evidence: `QUIZ_WORLD_2_CONCEPT_MAP.md`.
- World 3 content audit done (Claude, 2026-10-11): all 88 questions read, 67 executable programs checked with real kotlinc; 1 wrong explanation (`types-7`), 1 find-error keyed on the wrong line (`expression-7`), 1 question with the code as an option (`set-wh-1`), 8 duplicate scenarios, 3 trivial "hard" ones and the true/false skew fixed. Polish pass added 5 questions (World 3 now 94) and converted 1; predict-the-output stays at 45% by design (override recorded in the concept map). Findings in `QUIZ_WORLD_3_CONCEPT_MAP.md`. Phone rendering pending.
- World 1 content audit done (Claude, 2026-10-11): all 147 questions read, 134 executable programs and every multi-select/single-choice fact checked with real kotlinc; 4 reversed explanations (`comments-4`, `bool-9`, `string-7`, `string-11`), 1 wrong key claim (`syntax-6`), 1 "error" that compiles (`print-9`), 3 duplicate facts and 1 trivial "hard" fixed, 2 questions added (World 1 is now 147). Findings in `QUIZ_WORLD_1_CONCEPT_MAP.md`. Phone rendering pending.
- Enforcement (Claude, 2026-10-11): `npm run audit:quiz-standard` (`web-editor/scripts/audit-quiz-standard.ts`) now fails on type/difficulty range, XP, Boss shape (12, 1/5/6, ordered, no true/false, no type above 4, 5+ types), filler options, generic "True or false:" prompts, repeated explanations and repeated question+code+options for Worlds 1-10; type mix (40%, 3 types) and the world difficulty mix are warnings (36 today). It also runs in `scripts/run-all-checks.sh`. Writing it exposed and fixed: 34 template failures in Worlds 6, 7, 9, 10 (10 true/false prompts, 20 shared explanations, 3 duplicates) and a real World 7 bug (9 of 10 `find_error` keys pointed one line above the real error; one true/false key was wrong: "A val variable can be reassigned" keyed true).
- Audit tools in `web-editor/scripts/quiz-audit/` (see the audit procedure above): `scan.ts <world>`, `dump.ts <world> <from> <to>`, `real.ts <world>`, `std-scan.ts` (all worlds).
- Gates pass: `tsc`, `test:quiz-bank`, `audit:quiz-bank`, `test:world8-quiz-kotlin`; app data regenerated (`generate:native-data`).
- Follow-up real-Kotlin sweep defects are resolved for Worlds 4, 6, 9 and 10 (details below). `real.ts` confirms no prediction mismatch in World 6, no issue in World 9, and the corrected compile-error line markers in Worlds 4 and 10. Remaining reports are documented runtime failures or comparison fragments, not incorrect keys. Typecheck, quiz-bank tests, duplicate/scope audit, standard audit, and native-data generation pass after these fixes.
- World 11 authored with complexity-based variable lesson counts (8–11 each; 135 direct questions), 16 cross-lesson questions (4 per set), and a separate 12-question Boss; 163 total. Four redundant questions were removed from Nested Classes and Object Declarations, and nine mapped coverage gaps were added across higher-risk lessons. Verification passes: 136 real-kotlinc executable cases with 0 problems, bank tests, strict scope/duplicate audit, standard audit, editor/root TypeScript checks, and generated native-data check. App routing and generated native bank are registered. See `QUIZ_WORLD_11_CONCEPT_MAP.md`; phone-width review and a human wording/distractor pass remain.
- World 12 authored with variable lesson counts (8–12 each): 137 direct, 20 cross-lesson, and 12 separate Boss questions; 169 total. Real Kotlin verifies 173 executable variants with 0 problems. Five sets and the Boss are registered in web and native quiz data. Structure, scope, type mix, and chip checks pass; see `QUIZ_WORLD_12_CONCEPT_MAP.md`. Phone-width visual review remains.
- World 11 human wording/distractor review complete (2026-10-13): all 163 questions reviewed; corrected reversed comparison explanations caused by answer-position rebalancing, one extension-property precedence explanation, and two set-question explanation mismatches. Bank tests, strict scope/duplicate audit, standard audit, TypeScript checks, and native-data synchronization pass. Phone-width visual review remains pending; see `QUIZ_WORLD_11_CONCEPT_MAP.md`.
- World 12 human wording/distractor review complete (2026-10-13): all 169 questions reviewed; corrected explanation references reversed by answer-position rebalancing across generic transforms, bounds, projections, reified checks, and type-safe API comparisons, plus clarified invariant/declaration-site set explanations. Bank tests, strict scope/duplicate audit, standard audit, TypeScript checks, and native-data synchronization pass. Phone-width visual review remains pending; see `QUIZ_WORLD_12_CONCEPT_MAP.md`.
- World 13 content and human wording/distractor review complete (2026-10-13): 88 direct, 12 set, and 12 Boss questions (112 total). Replaced mechanically numbered scenarios and stock distractors with distinct scope-function cases, corrected set prompt/type mismatches, balanced true/false and comparison answers, and added World 13 to strict scope/duplicate auditing and web/native routing. Real Kotlin verifies 78 executable variants with 0 problems; all automated and synchronization gates pass. Phone-width visual review remains pending; see `QUIZ_WORLD_13_CONCEPT_MAP.md`.
- World 14 content and human wording/distractor review complete (2026-10-13): 121 direct, 16 set, and 12 Boss questions (149 total). All questions were read after answer balancing; position-dependent explanations, one incomplete output key, duplicate comparison code, and generic source prompts were repaired. Real Kotlin verifies 109 executable variants with 0 problems; bank, strict scope/duplicate, standard, editor/native TypeScript, native synchronization, and production-build gates pass. Phone-width visual review remains pending; see `QUIZ_WORLD_14_CONCEPT_MAP.md`.

**Resolved by the follow-up real-Kotlin sweep:**
- World 6 predictions `w6q-map-8`, `w6q-change-4`, and `w6q-change-8` now compile and match their keys. Runtime-error prompts `w6q-arr-9` and `w6q-create-9` say the line crashes when run.
- World 4 `w4q-break-7`, `w4q-cont-7`, and `w4q-nested-8` now contain genuine compile errors; `w4q-step-8` clearly identifies its runtime crash. Remaining `real.ts 4` reports are expected runtime behavior and comparison-fragment limitations.
- World 9 `w9q-11-8` now marks the prohibited `return`; World 10 `w10q-1-8` now marks the `it + 1` expression. World 10 runtime-error prompts already say that the marked line may crash when run.
- The remaining reports in Worlds 4 and 6 include expected runtime-error cases and code-comparison fragments that are not standalone programs; these are documented false alarms, not unresolved answer-key defects.

**Not done (in priority order)**
1. User to complete phone-width visual reviews for completed Worlds 1–14.
2. Type-mix soft guideline (no type above 40% of a lesson, at least 3 types): Worlds 7, 9, 10 are clean; Worlds 1-5 and 8 still warn,
   mostly predict_output at 45-67% in Worlds 2-4. Scan with `npx tsx scripts/quiz-audit/std-scan.ts`.
   World 6 has two documented 50% lesson-level cases: operation tracing in mutation and type selection in choosing a collection.
3. DONE: `audit:quiz-standard` enforces the ranges, Boss mix and smells (see Enforcement above). `real.ts` has been extended to include Boss banks; continue using it as a manual audit gate.
4. Review the other worlds' prompts and explanations against the highlighting rule (section 8; Worlds 2 and 6 have almost no chips in explanations: 0 of 90 and 1 of 128) and add the broken-chip check to `audit:quiz-standard`.
5. Not rendered-checked on a phone: multi-line options, single_choice with code, and the formatter fix.
6. Worlds 6, 7 and 8 are not registered in `web-editor/src/data/quizBank/index.ts` (`NEW_QUIZ_BANKS`); confirm whether the app uses them.
7. Concept maps still list old per-lesson allocations in places; update each when its lesson questions are re-audited.
8. `w4q-range-8` printed "true.0" once in a test run (flake, not reproduced): possible state leak in the runner.

**How to resume:** Quiz content audits are complete for Worlds 1–14, including the required human wording/distractor pass. Phone-width visual reviews remain owned by the user. From now on, every new world must be completed as one uninterrupted non-visual workflow: planning/allocation, authoring and integration, scan, reading every regular/set/Boss question, real-Kotlin verification, human wording/distractor repair, all automated gates, native-data synchronization, and concept-map/progress recording. Do not hand off at an intermediate milestone. Next: World 15 unless the user chooses an open maintenance item above.

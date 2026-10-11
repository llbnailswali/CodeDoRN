# World 2 quiz: concept map and plan

Question plan and authored bank. The questions are in `web-editor/src/data/quizBank/world2Quiz.ts`; the regular 78-question bank is registered, and the separate 12-question Boss bank is exported. Target difficulty mix: **20% easy / 50% medium / 30% hard**.
Easy recalls one fact; medium applies one concept to code; hard combines concepts, requires several reasoning steps, or tests a taught boundary case.
Every tested concept must already appear in that lesson's Learn, Explore, Predict, Write & Run, or Debug content. Lesson questions may use earlier lessons' concepts, but never later lessons' concepts. Cross-lesson combinations belong to set questions.

## Quiz structure

Use three sets of two lessons each. Every lesson gets 10 questions (2 easy, 5 medium, 3 hard), exactly matching the target ratio. Each set gets six cross-lesson questions (1 easy, 3 medium, 2 hard). With whole-question counts, a 26-question set lands at 5 easy / 13 medium / 8 hard (about 19/50/31). The Boss remains separate, with 12 questions (1 easy, 5 medium, 6 hard; 10/40/50, see `QUIZ_QUALITY_STANDARD.md` section 10).

| Set | Lessons | Lesson questions | Set questions | Quiz size |
| --- | --- | ---: | ---: | ---: |
| Arithmetic & Comparisons | Arithmetic Operators; Comparison Operators | 20 | 6 | 26 |
| Logic & Assignment | Logical Operators; Assignment Operators | 20 | 6 | 26 |
| Updates & Precedence | Increment & Decrement; Operator Precedence | 20 | 6 | 26 |
| World 2 total | Lessons 1–6 | 60 | 18 | 78 |
| Boss quiz | Smart Calculator | 12 | n/a | 12 |

The regular full quiz contains 78 questions; the Boss quiz is separate and unlocks after the three sets are completed.

## Lesson 1: Arithmetic Operators (`world-2-arithmetic-operators`)

### Concepts

| ID | Concept | Taught in | Common mistake / trap |
| --- | --- | --- | --- |
| A1 | `+`, `-`, and `*` perform addition, subtraction, and multiplication | Learn, Explore 1 | Swapping the operation or operand order |
| A2 | `Int / Int` truncates the fractional part; it does not round | Learn, Explore 2, Predict 1 | Choosing a decimal or rounding to the nearest integer |
| A3 | `%` gives the remainder | Learn, Explore 3, Predict 2 and 5, Write & Run | Confusing remainder with quotient or subtraction |
| A4 | A `Double` operand makes division floating point | Learn, Explore 4, Predict 4 | Assuming an Int operand forces truncation |
| A5 | `*`, `/`, `%` run before `+`, `-` | Explore 5, Predict 3 | Evaluating strictly left to right |

Out of scope: integer overflow and negative remainder edge cases. Avoid these unless they are explicitly taught and verified in the app's runner.

### Plan: 10 questions (2 easy / 5 medium / 3 hard)

| Level | Type | Concept | Question idea |
| --- | --- | --- | --- |
| easy | single_choice | A1 | What does `*` do? |
| easy | true_false | A3 | `17 % 5` is the remainder left after division. |
| medium | predict_output | A1 | `12 - 5 * 2` -> `2` (precedence, kept to one arithmetic step after multiplication) |
| medium | predict_output | A2 | `11 / 4` -> `2` |
| medium | predict_output | A3 | `23 % 6` -> `5` |
| medium | predict_output | A4 | `9 / 2.0` -> `4.5` |
| medium | code_comparison | A2/A4 | Which expression preserves the fraction when dividing two whole-number variables? |
| hard | predict_output | A2+A3 | Compute quotient and remainder from the same pair, then print a combined one-line result. |
| hard | single_choice | A5 | Compare two parenthesized forms such as `2 + 3 * 4` and `(2 + 3) * 4`. |
| hard | predict_output | A1–A4 | Trace a short price-splitting calculation using multiplication, integer division, and `%`. |

## Lesson 2: Comparison Operators (`world-2-comparison-operators`)

### Concepts

| ID | Concept | Taught in | Common mistake / trap |
| --- | --- | --- | --- |
| C1 | `==` checks value/content equality | Learn, Explore 1 | Reading it as assignment or object identity |
| C2 | `!=` is true when values differ | Learn, Explore 2 | Reversing true and false |
| C3 | `<` and `>` are strict comparisons | Learn, Explore 3–4 | Treating equality as included |
| C4 | `<=` and `>=` include equality | Learn, Explore 5, Predict 5, Write & Run, Debug | Off-by-one boundary at the exact threshold |
| C5 | Comparisons evaluate to Boolean values | Learn, Explore, Predict | Expecting the compared number rather than `true`/`false` |
| C6 | The lesson demonstrates alphabetical ordering of Strings | Explore 6, Predict 6 | Assuming `>`/`<` only work on numbers |

String ordering appears in Explore/Predict, but test it only after confirming the Kotlin runner handles it correctly; otherwise keep quiz examples numeric until the runtime support is verified.

### Plan: 10 questions (2 easy / 5 medium / 3 hard)

| Level | Type | Concept | Question idea |
| --- | --- | --- | --- |
| easy | single_choice | C1 | Which operator checks whether two values are equal? |
| easy | true_false | C2 | `!=` is true when the two values are different. |
| medium | predict_output | C3 | `7 > 7` -> `false` |
| medium | predict_output | C4 | `18 >= 18` -> `true` |
| medium | fill_blank | C2 | Complete an expression that checks whether two scores differ. |
| medium | single_choice | C5 | What type of result does `score >= passMark` produce? |
| medium | predict_output | C1 | Compare two equal String values with `==` (only if runner support is verified). |
| hard | predict_output | C1–C5 | Compare a calculated total to a budget, then print the Boolean result. |
| hard | single_choice | C3+C4 | Choose the condition that includes exactly the boundary value but excludes values below it. |
| hard | code_comparison | C1+C4 | Distinguish equality `==` from an inclusive threshold check `>=` in a short eligibility scenario. |

## Lesson 3: Logical Operators (`world-2-logical-operators`)

### Concepts

| ID | Concept | Taught in | Common mistake / trap |
| --- | --- | --- | --- |
| L1 | `&&` is true only when both conditions are true | Learn, Explore 1, Predict 1 | Treating AND like OR |
| L2 | `||` is true when at least one condition is true | Learn, Explore 2 | Believing both sides must be true |
| L3 | `!` flips a Boolean | Explore 3, Predict 2 and 4 | Forgetting negation applies to the Boolean value |
| L4 | `&&` has higher precedence than `||` | Learn, Explore 4, Predict 3, Debug | Reading mixed logic left-to-right |
| L5 | Parentheses force the intended grouping | Learn, Explore 5, Debug | Missing grouping changes a business rule |
| L6 | `&&` and `||` short-circuit | Learn explanation, Explore 6, Predict 6 | Assuming the right side always runs |

### Plan: 10 questions (2 easy / 5 medium / 3 hard)

| Level | Type | Concept | Question idea |
| --- | --- | --- | --- |
| easy | true_false | L1 | `true && false` evaluates to `false`. |
| easy | single_choice | L3 | What does `!false` evaluate to? |
| medium | predict_output | L2 | `false || true` -> `true` |
| medium | predict_output | L1 | A short two-flag AND expression -> Boolean result |
| medium | predict_output | L3 | Negate a named Boolean variable |
| medium | code_comparison | L1+L2 | Pick AND when both conditions are required and OR when either is enough. |
| medium | predict_output | L4 | Trace `false || true && false` -> `false` |
| hard | predict_output | L4+L5 | Compare a pass/VIP/open condition with explicit parentheses and trace the result. |
| hard | single_choice | L6 | Which call is skipped when the left side of `&&` is false? |
| hard | predict_output | L1–L6 | Trace a short access rule with three flags and a side-effecting function; identify both output lines. |

## Lesson 4: Assignment Operators (`world-2-assignment-operators`)

### Concepts

| ID | Concept | Taught in | Common mistake / trap |
| --- | --- | --- | --- |
| S1 | `=` replaces the current variable value | Learn, Explore 1 | Thinking it compares values |
| S2 | `+=`, `-=`, `*=`, `/=`, `%=` apply an operation and store the result | Learn, Explore 2–6 | Treating compound assignment as a separate kind of math |
| S3 | Compound assignment requires a mutable `var` | Learn, Predict 4, Debug | Trying to update a `val` |
| S4 | Compound assignment also works for String concatenation (`+=`) | Explore 7, Predict 5 | Assuming `+=` is numeric-only |
| S5 | Compound arithmetic preserves the numeric type's behavior (including Double results) | Explore 8, Predict 6 | Dropping the decimal form or miscalculating the updated value |

### Plan: 10 questions (2 easy / 5 medium / 3 hard)

| Level | Type | Concept | Question idea |
| --- | --- | --- | --- |
| easy | single_choice | S1 | What does `score = 12` do to `score`? |
| easy | true_false | S3 | A `val` can be updated with `+=`. |
| medium | predict_output | S2 | `var coins = 40; coins += 8` -> `48` |
| medium | predict_output | S2 | `var n = 17; n %= 5` -> `2` |
| medium | find_error | S3 | Tap the compound assignment to a `val`. |
| medium | predict_output | S2 | Apply two compound updates in sequence and print the value. |
| medium | predict_output | S4 | Append a suffix to a String with `+=`. |
| hard | predict_output | S2+S5 | Trace `/=` on an Int and a Double to distinguish truncating and fractional results. |
| hard | single_choice | S1+S2 | Translate `balance -= fee` into its equivalent assignment. |
| hard | code_comparison | S2+S3 | Choose a valid update sequence that produces a target balance without reassigning a `val`. |

## Lesson 5: Increment & Decrement (`world-2-increment-decrement`)

### Concepts

| ID | Concept | Taught in | Common mistake / trap |
| --- | --- | --- | --- |
| I1 | `++` adds one; `--` subtracts one | Learn, Explore 1–4, Predict 1–5 | Treating them as arbitrary increases/decreases |
| I2 | Prefix and postfix both update the variable by one | Learn, Explore 3, Predict 3 and 5 | Thinking the final variable differs |
| I3 | In an expression, postfix yields the old value; prefix yields the updated value | Explore 5–6, Predict 6–7 | Confusing captured expression value with final variable value |
| I4 | `++` and `--` reassign, so they require `var` | Learn, Explore 7, Predict 4, Debug | Trying to increment a `val` |

### Plan: 10 questions (2 easy / 5 medium / 3 hard)

| Level | Type | Concept | Question idea |
| --- | --- | --- | --- |
| easy | single_choice | I1 | What does `lives--` do? |
| easy | true_false | I2 | `++count` and `count++` both leave the variable increased by one. |
| medium | predict_output | I1 | Increment a counter once and print it. |
| medium | predict_output | I1 | Apply two decrements to a starting value. |
| medium | find_error | I4 | Tap the attempt to increment a `val`. |
| medium | predict_output | I2 | Use prefix increment as a statement and print the variable. |
| medium | code_comparison | I2 | Select two snippets whose final variable values match. |
| hard | predict_output | I3 | Capture `old = count++`; print both `old` and `count`. |
| hard | predict_output | I3 | Capture `fresh = ++count`; print both values. |
| hard | predict_output | I1+I3 | Mix prefix/postfix expressions with a decrement and trace each captured value and final state. |

## Lesson 6: Operator Precedence (`world-2-operator-precedence`)

### Concepts

| ID | Concept | Taught in | Common mistake / trap |
| --- | --- | --- | --- |
| P1 | `*`, `/`, `%` run before `+` and `-` | Learn, Explore 1, Predict 1 | Evaluating left-to-right |
| P2 | Arithmetic runs before comparison operators | Learn, Explore 2, Predict 3 | Comparing before finishing the arithmetic expression |
| P3 | Comparisons run before `&&` and `||` | Learn, Explore 2, Predict 3 | Treating a comparison/logical expression as ungrouped text |
| P4 | `&&` runs before `||` | Learn, Explore 3, Predict 2 | Assuming equal precedence or left-to-right grouping |
| P5 | Parentheses override default precedence | Learn, Explore 4 | Assuming parentheses are optional decoration |

### Plan: 10 questions (2 easy / 5 medium / 3 hard)

| Level | Type | Concept | Question idea |
| --- | --- | --- | --- |
| easy | single_choice | P1 | Which operation is evaluated first in `2 + 3 * 4`? |
| easy | true_false | P5 | Parentheses can change which part of an expression is evaluated first. |
| medium | predict_output | P1 | `20 - 4 / 2` -> `18` |
| medium | predict_output | P2+P3 | Evaluate arithmetic before comparing, then print the Boolean. |
| medium | predict_output | P4 | Trace `false || true && false` -> `false` |
| medium | code_comparison | P1+P5 | Compare `2 + 3 * 4` with `(2 + 3) * 4`. |
| medium | single_choice | P3 | Identify which expression is evaluated before `&&`. |
| hard | predict_output | P1–P4 | Trace arithmetic, comparison, and a mixed logical expression in stages. |
| hard | code_comparison | P4+P5 | Choose grouping that enforces a requirement plus one of two allowed conditions. |
| hard | predict_output | P1–P5 | Compare a computed threshold with and without parentheses, then combine the result with `||`. |

## Cross-lesson set questions

Each set gets six questions: one easy, three medium, and two hard. The set question's `lessonId` is the final lesson in that set, and its `topic` is the set title.

### Arithmetic & Comparisons (Lessons 1–2)

| Level | Type | Concepts | Question idea |
| --- | --- | --- | --- |
| easy | single_choice | A1+C5 | Arithmetic expression results can be compared and produce a Boolean. |
| medium | predict_output | A2+C4 | Compute an integer quotient, then check whether it reaches an inclusive threshold. |
| medium | predict_output | A3+C1 | Use a remainder to compare whether a number is divisible by a chosen value. |
| medium | find_error | A1+C4 | Fix an eligibility comparison that uses `>` instead of `>=` after calculating a value. |
| hard | predict_output | A1–A5+C1–C5 | Calculate a discounted or split total and compare it to a budget. |
| hard | multi_select | A2–A4+C3–C5 | Select expressions that produce the required numeric result and Boolean boundary outcome. |

### Logic & Assignment (Lessons 3–4)

| Level | Type | Concepts | Question idea |
| --- | --- | --- | --- |
| easy | true_false | L1+S1 | A `var` changed by `+=` can be checked in a Boolean condition. |
| medium | predict_output | S2+L1 | Update a score with `+=`, then check it against a target using `&&`. |
| medium | predict_output | S2+L3 | Update a flag/value, negate a Boolean condition, and print the result. |
| medium | find_error | S3+L2 | Find a `val` mutation in a short OR-based eligibility program. |
| hard | predict_output | S2+L1+L2 | Update two mutable values, then combine conditions with both `&&` and `||`. |
| hard | code_comparison | S2–S4+L1–L3 | Choose the sequence that updates mutable state and grants access only when the combined rules hold. |

### Updates & Precedence (Lessons 5–6)

| Level | Type | Concepts | Question idea |
| --- | --- | --- | --- |
| easy | single_choice | I1+P1 | After incrementing a `var`, arithmetic can use its updated value. |
| medium | predict_output | I1+P1 | Increment, then use multiplication before addition. |
| medium | predict_output | I3+P2 | Capture a postfix value, then compare the updated variable with an arithmetic threshold. |
| medium | code_comparison | I2+P5 | Compare the outcome of a prefix update and a parenthesized arithmetic expression. |
| hard | predict_output | I1–I3+P1–P4 | Trace a changing counter through increment/decrement and a mixed logical expression. |
| hard | find_error | I4+P2–P5 | Diagnose a `val` update and a grouping mistake in a compact calculation/condition. |

## Boss quiz: Smart Calculator (`world-2-boss`)

Plan 12 questions: **1 easy / 5 medium / 6 hard** (10/40/50), ordered easy to hard. Every question combines two or more lessons; no `true_false`. Types: predict_output 4, find_error 2, multi_select 2, single_choice 2, code_comparison 1, fill_blank 1.

### Boss coverage (authored)

All 12 questions use one story: the Smart Calculator. Real kotlinc confirmed every predicted output, both compile errors (and their lines), the fill_blank chips (only `%` gives true), both code_comparison programs (11 and 15), each option of the Q8 multi_select, and the Q11 final values (a is 4, b is 9).

| # | Diff | Type | Lessons combined |
| ---: | --- | --- | --- |
| 1 | easy | fill_blank | Arithmetic (`%`), comparison (`==`) |
| 2 | medium | single_choice | Comparison (inclusive limits), logical (`&&`) |
| 3 | medium | predict_output | Assignment (`+=`, `/=`, `%=`), arithmetic, precedence |
| 4 | medium | find_error | Assignment (`*=`), arithmetic (Int times Double) |
| 5 | medium | single_choice | Arithmetic (division), precedence (grouping) |
| 6 | medium | predict_output | Decrement (prefix and postfix), arithmetic (`%`), comparison, logical (`||`) |
| 7 | hard | code_comparison | Increment, assignment (`*=` with a sum), precedence |
| 8 | hard | multi_select | Arithmetic (truncation, `%`), precedence, comparison, logical (`!`, `&&`) |
| 9 | hard | predict_output | Assignment, increment, precedence, string template |
| 10 | hard | find_error | Comparison (chained `<`), logical (`&&`) |
| 11 | hard | multi_select | Increment/decrement (postfix values), assignment (`+=`) |
| 12 | hard | predict_output | Assignment, increment, arithmetic (truncation), precedence, comparison, logical (edge case: truncated share) |

Every lesson is used at least once: Arithmetic 1, 3, 4, 5, 6, 8, 12; Comparison 1, 2, 6, 8, 10, 12; Logical 2, 6, 8, 10, 12; Assignment 3, 4, 7, 9, 11, 12; Increment & Decrement 6, 7, 9, 11, 12; Precedence 3, 5, 7, 8, 9, 12.

## Authoring and verification rules

- Use the existing World 1 quiz format and stable IDs: `w2q-<lesson-key>-<number>`; use `setId` only for cross-lesson set questions.
- Keep question code within concepts already taught at that point. A lesson question can reuse earlier World 2 concepts; cross-lesson combinations use the set's final lesson ID.
- `predict_output` answers must be a single line. For multi-line output, use `single_choice` and preserve the displayed line breaks in each option.
- Keep distractors tied to likely errors: left-to-right evaluation, rounding instead of truncation, quotient instead of remainder, strict vs inclusive boundaries, AND vs OR, omitted NOT, val reassignment, prefix/postfix captured value, and missing parentheses.
- Vary correct answer positions and keep option length/detail balanced. Avoid repeating the same values, story, code shape, or misconception across lessons and sets.
- Run every executable example through `compileAndRunKotlin`; compare output with a manual trace. Test compile-error examples against the simulator rather than assuming Kotlin diagnostics are modeled.
- Validate the bank with `npm run test:quiz-bank` and `npm run audit:quiz-bank` after implementation.

## Open review checks

1. Confirm the three two-lesson sets are the right grouping for World 2.
2. Confirm 10 questions per lesson plus six per set is the desired depth; this yields 78 regular questions and a separate 12-question Boss quiz.
3. Confirm whether String relational comparisons from Comparison Operators should be quiz-tested only after runner support is verified.
4. Before publishing, audit all question ideas against the actual lesson stages and ensure the simulator's current support covers every executable example.

## Collection status

Authored: 10 questions per lesson, 6 cross-lesson questions per set, and 12 Boss questions. The regular bank has 78 questions; the Boss bank has 12. World 2 set and Boss metadata are registered in `quizSets.ts`, and the regular bank is added to the quiz-bank registry. The current quiz flow opens a world's full regular bank; it does not yet provide a set picker or a separate Boss-quiz entry point. The planned validation scripts have not yet been run against World 2.

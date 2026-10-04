# World 1 quiz: concept map and plan for lessons 7, 11 and 12

Review draft. Nothing in the quiz bank has been changed yet. Mix target: **20% easy / 50% medium / 30% hard**.
Rubric: easy = recall one fact; medium = apply one concept to code; hard = combine concepts, multi-step reasoning, or an edge case / trap.
Everything below must be taught in the lesson itself (Learn / Explore / Predict / Write & Run / Debug). Question counts come from the
concepts, so they are planning figures, not quotas.

Existing difficulty labels below are the **proposed relabels** from the earlier review (not yet applied).

---

## Lesson 7: Int & Long (`world-1-int-long`)

### Concepts (from the lesson content)

| ID | Concept | Taught in | Common mistake / trap |
| --- | --- | --- | --- |
| C1 | A whole-number literal is an `Int` by default (`val count = 500`) | Learn, Predict "Default Inference" | Expecting `Long` or `Double` |
| C2 | `Int` range is about -2.1 billion to +2.1 billion; a literal beyond it does not fit an explicit `Int` | Learn key idea 1, explanation | `val c: Int = 3000000000` is an error |
| C3 | `Long` literals use a **capital** `L` suffix; Kotlin also infers `Long` for an oversized literal | Learn key idea 2, explanation, Explore 2 | Forgetting the suffix on a typed `Long`; lowercase `l` |
| C4 | Underscores (`1_000_000`) are only for readability and are ignored | Learn key idea 3, Predict, Explore 2 | Expecting underscores in the printed output |
| C5 | Convert with `.toLong()`; an `Int` variable is not silently widened to `Long` | Explore 3, Write & Run | `val big: Long = small` (small is an Int variable) |
| C6 | Mixing `Int` and `Long` in arithmetic gives a `Long` | Write & Run, Debug | Assuming the result is an `Int` |

Out of scope here (not taught, or simulator cannot show it): `Int` overflow wrap-around, `Int / Int` truncation (World 2).

### Plan: 12 questions, about 2 easy / 6 medium / 4 hard

Existing: `w1q-int-1` (medium), `w1q-int-2` (hard), `w1q-int-3` (hard). So 9 new: **2 easy, 5 medium, 2 hard**.

| # | Level | Type | Concept | Idea |
| --- | --- | --- | --- | --- |
| new | easy | single_choice | C1 | What type does `val count = 500` get? (Int) |
| new | easy | true_false | C3 | A `Long` literal needs a capital `L` suffix. |
| new | medium | predict_output | C4 | `println(1_500 + 500)` -> `2000` |
| new | medium | fill_blank | C3 | `val stars = 100_000_000_000___` -> `L` |
| new | medium | find_error | C5 | `val small = 100` / `val big: Long = small` -> tap the assignment |
| new | medium | code_comparison | C5 | Which code converts an Int to a Long correctly? |
| new | medium | predict_output | C6 | `val total = 40 + 2L` / `println(total)` -> `42` |
| new | hard | predict_output | C5+C6 | `val daily = 50_000` / `println(daily.toLong() * 365L)` -> `18250000` |
| new | hard | multi_select | C2 | Which values fit in an `Int`? (boundary values: 2147483647, 2147483648, -2147483648, 3_000_000_000) |

---

## Lesson 11: Strings (`world-1-string`)

### Concepts

| ID | Concept | Taught in | Common mistake / trap |
| --- | --- | --- | --- |
| S1 | A String literal uses double quotes | Learn | Single quotes (that is a Char) |
| S2 | `.length` counts every character, spaces included; an empty string has length 0 | Learn, Explore 1, Predict 1 and 3 | Not counting spaces; thinking `""` is an error |
| S3 | `+` joins Strings; a number after a String is converted (`"Level " + 5`) | Learn, Explore 2, Predict 2 | Forgetting the space between words |
| S4 | Multi-line raw string `"""..."""` and `.trimIndent()` | Learn key idea 3, Explore 3 | Expecting the leading spaces to stay |
| S5 | Strings are immutable: operations make new Strings | Learn explanation | Trying `word[0] = 'J'` |
| S6 | Comparing a length (`>` vs `>=`) at the boundary | Debug "Off-By-One Length Check" | Off by one at exactly the limit |

Out of scope: a number **before** a String (`5 + "x"` does not compile) is not taught; add it to Explore first if wanted.

### Plan: 10 questions, about 2 easy / 5 medium / 3 hard

Existing: `w1q-string-1` (easy), `w1q-string-2` (easy, relabeled), `w1q-string-3` (medium). So 7 new: **0 easy, 4 medium, 3 hard**.

| # | Level | Type | Concept | Idea |
| --- | --- | --- | --- | --- |
| new | medium | predict_output | S3 | `println("Level " + 5)` -> `Level 5` |
| new | medium | predict_output | S2 | `println("Hi there".length)` -> `8` (the space counts) |
| new | medium | fill_blank | S2 | `println(word.___)` -> `length` |
| new | medium | code_comparison | S3 | Which code prints `Kotlin Awakening` with the space? |
| new | hard | predict_output | S2+S3 | `val a = "Code"` / `val b = "Do"` / `println((a + b).length)` -> `6` |
| new | hard | single_choice | S6 | Which condition accepts a password of exactly 8 characters? (`length >= 8`) |
| new | hard | predict_output | S4 | A `"""` block with `.trimIndent()`: what lines are printed |

---

## Lesson 12: String Templates (`world-1-string-templates`)

### Concepts

| ID | Concept | Taught in | Common mistake / trap |
| --- | --- | --- | --- |
| T1 | `$name` inserts a variable's value inside double quotes | Learn key idea 1, Explore 1, Predict 1 | Writing `name` without `$` |
| T2 | `${...}` evaluates an expression (math, property, call) | Learn key idea 2, Explore 2 and 3, Predict 3 | Expecting `$` alone to do math |
| T3 | Braces are needed after the variable name for anything beyond the name | Predict 2, Debug | `"$count + 1"` prints `5 + 1`; `"$item.length"` prints `CodeDo.length` |
| T4 | `\$` prints a literal dollar sign | Learn key idea 3, Explore 4, Predict 4 | `"\$price"` printing `$price`, not the value |
| T5 | A template and `+` concatenation can give the same text | Learn code, Write & Run | Mixing both in one string |

### Plan: 10 questions, about 2 easy / 5 medium / 3 hard

Existing: `w1q-template-1` (easy), `w1q-template-2` (medium), `w1q-template-3` (medium). So 7 new: **1 easy, 3 medium, 3 hard**.

| # | Level | Type | Concept | Idea |
| --- | --- | --- | --- | --- |
| new | easy | true_false | T1 | `$name` inside double quotes inserts the value of `name`. |
| new | medium | predict_output | T3 | `val count = 5` / `println("$count + 1")` -> `5 + 1` |
| new | medium | predict_output | T4 | `val price = 25` / `println("Price: \$price")` -> `Price: $price` |
| new | medium | fill_blank | T2 | `println("Length: ${name.___}")` -> `length` |
| new | hard | predict_output | T3 | `val item = "CodeDo"` / `println("Length: $item.length")` -> `Length: CodeDo.length` |
| new | hard | predict_output | T1+T2 | `val a = 2` / `println("$a${a + 1}$a")` -> `232` |
| new | hard | multi_select | T2+T5 | With `count = 3`, `price = 10`: which print `Total: 30`? (`"Total: ${count * price}"`, `"Total: $count * $price"`, `"Total: " + count * price`, `"Total: $count*price"`) |

---

## Checks to run before writing the questions

- Run every new code snippet through `compileAndRunKotlin` and compare with the answer worked out by hand (as PITFALLS.md requires).
  Overflow questions are not planned because the runner does not model 32-bit `Int`.
- Check each answer key against the question actually asked, and each distractor against a real beginner mistake.
- Check the answer positions are not clustered, and that no question repeats another lesson's scenario.

## Questions for the reviewer

1. Are the concept lists complete and correct for what each lesson should test? Anything missing or out of scope?
2. Are the level assignments fair, especially the hard ones?
3. Is 10 to 12 questions per lesson right, or should it be fewer or more?
4. Should `5 + "x"` (number before a String) be taught first so it can be asked?


---

## Quiz sets (added)

Decision: the Quiz offers **sets + the full quiz** (and "Review mistakes"). There is no per-lesson quiz, to keep the choice small.

- Every lesson of a World belongs to exactly one set (checked by `npm run test:quiz-bank`). A set quiz = every question of its lessons + the set's own cross-lesson questions.
- A set question has `setId`; its `lessonId` is the LAST lesson of the set (where every concept it uses has been taught); its `topic` is the set title.
- Within a lesson, a question may use that lesson's concepts and those of earlier lessons, never a later one. Combinations across lessons are set questions.
- Sets are defined in `web-editor/src/data/quizBank/quizSets.ts`.

World 1 sets: Getting Started (lessons 1-4), Variables (5-6), **Numbers & Logic** (7-9), **Text** (10-12), World Boss (13).

| Set | Lessons | Cross-lesson set questions so far |
| --- | --- | --- |
| Getting Started | What is Kotlin?, Syntax & main(), Comments, print/println | none yet |
| Variables | val vs var, Type Inference | none yet |
| Numbers & Logic | Int & Long, Float & Double, Boolean | 6 (1 easy / 3 medium / 2 hard): default types, Long compared, Double compared with NOT, no automatic widening, Long + comparison + NOT, which values are Boolean |
| Text | Char, Strings, String Templates | 6 (1 easy / 3 medium / 2 hard): Char or String, String plus Char, Char in a template, length inside a template, template + Char + length, ways to build the same text |
| World Boss | Personal Profile Program | none (single lesson) |

Known open items from the review: `w1q-string-9` depends on comparison operators (World 2) and should be replaced with a Strings-only question;
`w1q-string-6`, `w1q-template-7` and `w1q-template-1` / `w1q-template-4` overlap (see the review notes).

---

## Batch 0 (done) and Batch 1: Getting Started (lessons 1 to 4)

Batch 0 applied: `string-9`, `string-6` and `template-4` replaced (`string-11` raw strings, `string-12` length precedence, `template-11` template syntax);
`template-7` kept (its overlap with `string-6` is gone); 7 relabels applied (`what-2` easy, `print-1` / `valvar-1` / `infer-3` / `char-2` medium, `boss-1` hard, `boss-3` easy).

Rule for this set: lesson 2's questions may only use `main()` and `println`; lesson 3's may use comments and `println`; `print()` appears only from lesson 4.
Questions whose output spans several lines are `single_choice` ("how many lines", "which prints last"), because a predict_output answer must be one line.

### Lesson 1: What is Kotlin? (orientation, 6 questions: 2 easy / 3 medium / 1 hard)

| ID | Concept | Taught in |
| --- | --- | --- |
| K1 | Created by JetBrains (2011) | Learn 1 |
| K2 | Official Android language (2017) | Learn 2 |
| K3 | Statically typed: types are checked before the program runs | Learn 3 |
| K4 | Null-safe: the type system helps catch null crashes early | Learn 3 |
| K5 | Runs on the JVM, JavaScript and native (Multiplatform) | Learn 4 |
| K6 | Interoperable with Java | Learn 5 |

Existing: `what-1` (easy, K1), `what-2` (easy, K6/K5). New 4:
- medium single_choice, K3: what "statically typed" means.
- medium single_choice, K4: what null safety is designed to do.
- medium single_choice, K6: a Java project can adopt Kotlin gradually because of interoperability.
- hard multi_select, K1+K3+K6: which statements about Kotlin are true (created by Google / can call Java / checks types before running / only for Android).

### Lesson 2: Kotlin Syntax & main() (6 questions: 2 easy / 3 medium / 1 hard)

| ID | Concept | Taught in |
| --- | --- | --- |
| M1 | `main()` is where every program starts | Learn 1, Explore 1 |
| M2 | Statements run top to bottom, in written order | Learn 2, Explore 3, Predict 2 |
| M3 | `{ }` mark the body of `main()`: everything between them runs | Learn 3 |
| M4 | An empty `main()` runs and prints nothing | Predict 3 |
| M5 | Missing `)` or `}` is a compile error | Debug |

Existing: `syntax-1` (easy, M1), `syntax-2` (medium, M5), `syntax-3` (easy, M1). New 3:
- medium single_choice with code, M4: what an empty `main()` prints.
- medium find_error, M3: a `println` placed outside `main()`.
- hard multi_select, M1+M3: which things a program needs to run (a `main` function, braces around its body, a `println` call, a class declaration).

Honest limit: this lesson is thin, so its hard share is 1 of 6 (17%), below the 30% target. Hard questions for the whole set come from the set's cross-lesson questions.

### Lesson 3: Comments (6 questions: 2 easy / 2 medium / 2 hard)

| ID | Concept | Taught in |
| --- | --- | --- |
| C1 | `//` runs to the end of the line | Learn 1, Explore 1 |
| C2 | `/* ... */` can span several lines | Learn 2, Explore 2, Predict 2 |
| C3 | Comments have no effect on the output | Learn 3 |
| C4 | Commenting out code | Explore 3 |
| C5 | A comment can follow code on the same line | Explore 1, Predict 1 |
| C6 | `//` inside a String is not a comment | Explore 4, Predict 3 |

Existing: `comments-1` (easy, C1), `comments-2` (easy, C2). New 4:
- medium predict_output, C5: `println("A") // println("B")` prints `A`.
- medium code_comparison, C2+C4: a closed block comment versus an unclosed one that breaks the program.
- hard single_choice, C2+C4: how many lines print when a block comment hides two `println` calls.
- hard multi_select, C1+C2+C5+C6: which lines contain a comment (the line with `//` inside a String is the trap).

### Lesson 4: print() and println() (9 questions: 2 easy / 4 medium / 3 hard)

| ID | Concept | Taught in |
| --- | --- | --- |
| P1 | `print()` stays on the same line | Learn 1, Explore 2 |
| P2 | `println()` ends the line | Learn 2, Explore 1 |
| P3 | Mixing them (`print("Count: ")` then `println(42)`) | Explore 3, Predict 1 |
| P4 | `println()` with no argument prints a blank line | Learn 3, Explore 4, Predict 3 |
| P5 | Spaces inside the Strings matter on one line | Write & Run, Debug |

Existing: `print-1` (medium, P3), `print-2` (medium, P1/P2), `print-3` (medium, P2). New 6:
- easy true_false, P2: `println()` moves to the next line after printing.
- easy single_choice, P1: which call prints and stays on the same line.
- medium predict_output, P1+P3: `print("A")`, `print("B")`, `println("C")` prints `ABC`.
- hard predict_output, P1+P5: `print("Go")`, `print(" ")`, `print("Kotlin")`, `println("!")` prints `Go Kotlin!`.
- hard single_choice, P1+P2: how many lines `print("A") println("B") print("C") println("D")` produces.
- hard find_error, P1+P2: "Total: 5 must appear on ONE line", tap the line that breaks it.

### Set questions for Getting Started (6: 1 easy / 3 medium / 2 hard)

Home lesson is the set's last lesson (`world-1-print-println`); each combines two or more of lessons 1 to 4.

| # | Level | Type | Lessons | Idea |
| --- | --- | --- | --- | --- |
| 1 | easy | code_comparison | 2, 4 | Which program prints Hello: `fun main()` versus `fun main` without the parentheses? |
| 2 | medium | predict_output | 2, 3, 4 | A commented-out `print`, then `print("B")` and `println("C")` prints `BC`. |
| 3 | medium | find_error | 2, 3 | A `/*` comment that is never closed inside `main()`. |
| 4 | medium | true_false | 1, 2 | Because Kotlin is statically typed, the compiler can reject a program before `main()` ever runs. |
| 5 | hard | predict_output | 2, 3, 4 | `print`, `print`, an inline `//`, a `/* ... */` hiding a `print`, then `println`: prints `ACF`. |
| 6 | hard | single_choice | 2, 3, 4 | How many lines print, with a comment, a blank `println()` and a block comment: 3. |

Total new for Batch 1: 4 + 3 + 4 + 6 + 6 = 23 questions. The set quiz would then have 27 lesson questions (6 + 6 + 6 + 9) plus 6 set questions = 33.


---

## World 1 final state (all lessons, sets and the Boss written)

Batches 2 to 5 are done, plus the final audit. The review filter is gone, so every set shows in the app.

| Set | Lessons | Lesson questions | Set questions | Quiz size |
| --- | --- | ---: | ---: | ---: |
| Getting Started | 1 to 4 | 27 | 6 | 33 |
| Variables | 5 to 6 | 19 | 6 | 25 |
| Numbers & Logic | 7 to 9 | 32 | 6 | 38 |
| Text | 10 to 12 | 31 | 6 | 37 |
| Boss quiz (Personal Profile Program) | 13 | 14 | n/a | 14 |

The full quiz is the four sets (133 questions); the Boss quiz is separate, unlocked when every set is finished.

Per lesson (total): What is Kotlin? 6, Syntax & main() 6, Comments 6, print/println 9, val vs var 10, Type Inference 9, Int & Long 12, Float & Double 11,
Boolean 9, Char 11, Strings 10, String Templates 10, Boss 14.

Checks that gate every change (all pass):
- `npm run test:quiz-bank`: structure, answer keys, and every predict-output / fill-in-the-blank answer through the engine.
- `npm run audit:quiz-bank`: no duplicates (same code, same question and options, same concept label in one lesson) and no use of a later lesson's concept
  (known false alarms are listed with a reason in the script).
- Answer positions are balanced (choice 20/20/20/19, code comparison 6/6, true/false 6/6) by `scripts/rebalance-quiz-answers.ts`.

Answers verified only by hand (the engine cannot reject them): `syntax-5` (a `println` outside `main()`), `infer-7`, `setvar-4` (a var keeps its type),
`print-9`/`bool-9`/`char-8` (their outputs differ rather than one failing to compile).

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

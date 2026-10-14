# Kotlin Runner Known Issues

This is the central tracking document for known correctness and feature gaps in CodeDoRN's Kotlin execution engine (`web-editor/src/utils/kotlinRunner.ts` and related interpreter utilities). The engine is a lightweight Kotlin-to-JavaScript interpreter, not `kotlinc`; a rejection or successful run is not authoritative Kotlin compiler behavior unless cross-checked with real Kotlin.

Use this register when reporting a compiler/runner bug. Record a minimal Kotlin repro, observed result, expected result from `kotlinc`, affected world/examples, and regression-test status. Keep issues here until they are fixed and covered by regression tests.

## Open issues

- **KR-008 custom class property named `size`:** The app runner rejects a valid class instance construction with
  `Runtime error: Invalid left-hand side in assignment` when the class declares `var size: Int`. The real Kotlin compiler
  accepts the program and prints `2`:

      class Box(var size: Int)
      fun main() {
        val first = Box(2)
        println(first.size)
      }

  Found while collecting World 8 quiz questions. The authored question now uses a different property name so its Run button works.
  The runner defect remains open; no focused regression test or fix has been added.
- **KR-009 user class named `Pair`:** The app runner rejects a valid user-defined `class Pair(...)` with
  `Runtime error: Identifier 'Pair' has already been declared`. The real Kotlin compiler accepts this program and prints `5`:

      class Pair(val first: Int, val second: Int)
      fun main() {
        val pair = Pair(2, 7)
        println(pair.second - pair.first)
      }

  Found while collecting World 8 quiz questions. The authored question now calls the class `NumberPair`. The runner defect
  remains open; no focused regression test or fix has been added.

KR-001 to KR-007 are fixed below. The quiz-bank validator runs the older worlds through the app runner; World 8 code questions
are checked separately against real `kotlinc` because class support in the runner is not a complete Kotlin implementation.

## Fixed (2026-10-10), each covered by regression tests in `web-editor/scripts/test-structure-rules.ts` and checked against `kotlinc` 2.0.21

Common cause of KR-001, KR-002 and KR-007: a `for`/`while` body written as ONE statement without braces (`for (n in 1..3) println(n)`)
was never translated; braced bodies always worked. The runner now adds the braces before translation, on the same line(s), so line
numbers do not move (`braceSingleStatementLoops` in `src/utils/kotlinLineMarkers.ts`).

- **KR-001 `for` over ranges:** fixed (one-line bodies, nested one-line loops, empty ranges, `until`).
- **KR-002 `step` / `downTo`:** fixed (same cause), e.g. `for (n in 10 downTo 0 step 4)` prints 10 6 2.
- **KR-003 `do-while`:** already worked when re-checked. A later regression from runtime line markers (a marker between `}` and a
  `while` on the next line) was found by this quiz bank and fixed; covered by "do-while with while on the next line".
- **KR-004 statement outside `main`:** now "Syntax error: Expecting a top level declaration" when the file has `fun main`
  (fragments without main still run as if inside main).
- **KR-005 type mismatches:** a literal of another type assigned to a variable (`var name = "Kotlin"` then `name = 5`; a Double given an
  Int literal) and an Int used as an `if`/`while` condition are now compile errors. Conservative: a name declared more than once is not
  judged.
- **KR-006 oversized Int literal:** an integer literal above Int.MAX_VALUE is now typed Long, so `val c: Int = 3000000000` is a type
  mismatch and `val c: Long = 3000000000` (previously REJECTED by the runner) is accepted.
- **KR-007 `vararg`:** the failing examples iterated the vararg with a one-line `for` body (KR-001 cause); fixed.
- Also fixed while re-checking: a range check used as a value, `println(10 in 5..10)`, was not translated.

The `engineUnverified` exemption (World 4 loops, World 5 vararg, World 4 `continue`) has been removed from `test-quiz-bank.ts`; every
quiz question is now executed and checked.

## Previous-world audit

Worlds 1–3 were checked with both the app runner and real `kotlinc` 2.0.21. All 139 `predict_output` programs produced the same output in both. Of 25 `find_error` programs, four were false accepts and are recorded above (KR-004 through KR-006); the remaining 21 agreed on accept/reject status. This audit covers those quiz-bank program snippets, not every possible Kotlin program or every code-comparison option.

## Validation policy while open

`web-editor/scripts/test-quiz-bank.ts` executes the earlier-world questions through the app runner; World 8 uses
`web-editor/scripts/test-world8-quiz-kotlin.ts` for its class-based programs. Do not change expected quiz answers to match
simulator output. For each runner issue, compare behavior with real `kotlinc` and add a focused regression test before closing it.

## Related notes

- Historical discovery and surrounding context: `PITFALLS.md`.
- World 4 quiz coverage and test caveat: `QUIZ_AND_COVERAGE_STATUS.xlsx` (the old World 4 concept map is in git history).

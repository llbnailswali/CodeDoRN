# minikotlin.run feasibility spike

Date: 2026-10-04. Status: spike only, no CodeDo source was changed.

## Question

Can the Kotlin-to-WebAssembly compiler at https://minikotlin.run/ replace or complement the JavaScript simulator
(`web-editor/src/utils/kotlinRunner.ts`) that runs learner code in CodeDo?

Note: this is **not** the JVM bytecode library `bezsahara/minikotlin` on GitHub. That one only generates bytecode from a
Kotlin DSL and cannot compile Kotlin source, so it does not fit. minikotlin.run is a separate, unrelated project that
shares the name.

## What minikotlin.run is

- A from-scratch Kotlin compiler written in C. It emits WebAssembly GC bytecode directly (no JVM, LLVM or Binaryen).
- The compiler is itself compiled to WASM (`minikotlin.wasm`, about 1.9 MB), so source goes in and a `.wasm` module comes
  out with no server.
- Runtime support is a small JS host (`host-imports.mjs`, `js-runtime.mjs`) plus two WASM helpers
  (`kotlin_math_rt.wasm`, `kotlin_char_rt.wasm`).
- It lists sealed classes, smart casts, generics and coroutines (`launch`, `delay`, `coroutineScope`, done as CPS closures).
- No license, source repository or package link was found on the site (the only repo link is JetBrains' test corpus).
  Redistribution rights are unknown.

## Method

1. Downloaded the compiler and host runtime from the site and ran them in Node 26 (outside a browser).
2. Collected every reference program from the app data: practice-bank `solutionCode` (Write & Run) and `fixedCode`
   (Debug) for Worlds 1 to 8, plus every lesson's `writeRun.solutionCode` and `debug.fixedCode` for all worlds.
   Total: **644 programs**.
3. Ran each one through (a) the current simulator (`compileAndRunKotlin`) and (b) minikotlin, and compared each result
   with the authored `expectedOutput` (trailing whitespace ignored).
4. Each minikotlin run used a **fresh compiler instance in a worker thread** with a 6 second kill timeout.

The harness lives only in the session scratchpad and is not committed.

## Results

minikotlin matched the expected output on **538 of 644 programs (84%)**.

| World | Programs | Passed | Notes |
| --- | ---: | ---: | --- |
| 1 | 52 | 50 | 2 wrong output |
| 2 | 35 | 34 | 1 wrong output |
| 3 | 43 | 43 | |
| 4 | 52 | 52 | |
| 5 | 42 | 42 | |
| 6 | 49 | 40 | 2 compile errors, 7 wrong output |
| 7 | 54 | 51 | 3 wrong output |
| 8 | 62 | 52 | 1 compile error, 2 timeouts, 7 wrong output |
| (unlabelled lesson keys) | 34 | 34 | |
| 9 | 24 | 22 | 2 compile errors |
| 10 | 20 | 20 | |
| 11 | 28 | 20 | 4 compile errors, 4 wrong output |
| 12 | 32 | 29 | |
| 13 | 20 | 11 | 9 compile errors |
| 14 | 26 | 10 | 10 compile errors, 3 timeouts, 3 wrong output |
| 15 | 27 | 19 | |
| 16 | 24 | 9 | 12 compile errors (`supervisorScope`, `Job`, `Dispatchers`) |
| 17 (Flow) | 20 | 0 | `flow`, `flowOf`, `MutableStateFlow` unsupported (the simulator also fails these) |

The simulator's own pass rate is 100% for worlds 1 to 16. That figure is circular: the expected outputs were authored and
tuned against the simulator's own tests, so it does not show the simulator is more correct.

### Findings

1. **It runs offline.** The compiler needs no server and works in Node and the browser.
2. **It gets the shapes the simulator historically got wrong.** Chained Int division (`a * 100 / b`), `a / 2.0` and a
   printed `25.0` were all correct. These correspond to the numeric entries in PITFALLS.md.
3. **Compile rejections of valid programs** (about 20 plus the compiler crashes below). Seen messages include
   `unresolved identifier` for `MutableStateFlow`, `flowOf`, `flow`, `supervisorScope`, `Job`, `Dispatchers`, `uppercase`;
   `Collection.take/drop count must be Int`; `receiver class 'MutableSet'/'IntRange' not found`.
4. **Silent wrong answers (35 programs).** The program compiles and runs and prints a plausible but wrong result. Examples:
   - `Zed's grade: null` prints `0` (nullable Int read from a map).
   - A `first -1` default prints `0`.
   - Overridden methods are ignored: `payroll`, `discount-policy`, `vehicle-fleet` print the base-class result.
   - A `sets` lesson prints `1` instead of `[Bronze, Silver, Gold]`; `maps` prints `1` instead of `{Pen=15, Book=5}`.
   - `elvis` / `UNKNOWN` fallback prints `NULL`.
   - A mutable-list copy (`read-only-copy`, `snapshot-guard`) shows the wrong order or aliasing.
   Most of the cases read by hand were minikotlin bugs, not errors in our expected outputs. Not every mismatch was
   triaged.
5. **The compiler instance is not reusable.** Reusing one instance for many compiles produced `memory access out of
   bounds` in about 415 of 644 runs (a harness artifact fixed by one fresh instance per program). A fresh instance per
   compile, or periodic re-creation, is required. Startup time and memory per instance were **not measured**.
6. **Synchronous execution.** A runaway program cannot be interrupted in the same thread; it needs a worker with a hard
   kill, as the harness used.

## Verdict

Not ready to replace the simulator. Silent wrong answers are the failure mode PITFALLS.md already warns about, and 35 such
programs plus about 50 rejections or crashes is too many for graded content. It is useful as an independent checker.

## Recommendations

1. Use it as a cross-check oracle for Worlds 1 to 5 and 10, where it matches 100%. A disagreement flags a possible
   simulator bug without needing a JVM (the repo's existing `test:*-kotlin` scripts need a local compiler).
2. Treat it as a long-term engine option only if its author fixes nullable handling, overrides and collections, and
   publishes a clear license and source. Ask the author directly.
3. If pursued later, still to check: Wasm GC and exception-handling support in the Android WebView used by
   `WebStageActivity` and on iOS; per-compile cost with a fresh instance; whether the compiler can be bundled.

## Not done

- No hardcode-check, Explore, Predict or non-reference (`brokenCode`) programs were run, only reference solutions.
- Mismatches were not all triaged against a real Kotlin compiler.
- No browser or device timing was done.

## Appendix: programs that did not match (World 17 excluded)

World 17 (20 programs) fails everywhere because Flow is unsupported in both engines. The 86 others:

### Wrong output (35)

- `world-1-practice-writerun-quiz-average` (practice-wr)
- `world-2-practice-writerun-recipe-scaler` (practice-wr)
- `world-6-practice-writerun-read-only-copy` (practice-wr)
- `world-6-practice-writerun-snapshot-guard` (practice-wr)
- `world-6-practice-writerun-class-roster` (practice-wr)
- `world-7-practice-writerun-shift-lists` (practice-wr)
- `world-7-practice-writerun-nickname-lengths` (practice-wr)
- `world-8-practice-writerun-vehicle-fleet` (practice-wr)
- `world-8-practice-writerun-payroll` (practice-wr)
- `world-8-practice-writerun-discount-policy` (practice-wr)
- `world-1-practice-debug-pass-rate` (practice-dbg-fixed)
- `world-7-practice-debug-risky-assertion` (practice-dbg-fixed)
- `world-6-sets` (lesson-wr)
- `world-6-sets` (lesson-dbg-fixed)
- `world-6-maps` (lesson-wr)
- `world-6-maps` (lesson-dbg-fixed)
- `world-8-basic-inheritance` (lesson-wr)
- `world-8-basic-inheritance` (lesson-dbg-fixed)
- `world-8-overriding-members` (lesson-wr)
- `world-8-overriding-members` (lesson-dbg-fixed)
- `world-11-data-classes-in-domain-modeling-enum-cla` (lesson-wr)
- `world-11-delegation` (lesson-wr)
- `world-11-boss` (lesson-wr)
- `world-11-boss` (lesson-dbg-fixed)
- `world-12-generic-constraints` (lesson-wr)
- `world-14-lazy-processing` (lesson-wr)
- `world-14-lazy-processing` (lesson-dbg-fixed)
- `world-14-assequence` (lesson-dbg-fixed)
- `world-15-runcatching` (lesson-wr)
- `world-15-error-handling-patterns` (lesson-dbg-fixed)
- `world-15-boss` (lesson-wr)
- `world-15-boss` (lesson-dbg-fixed)
- `world-16-coroutine-fundamentals-coroutine-builder` (lesson-wr)
- `world-16-coroutine-fundamentals-coroutine-builder` (lesson-dbg-fixed)
- `world-16-dispatchers-jobs` (lesson-dbg-fixed)

### Compile rejection (20)

- `world-6-practice-writerun-tag-merger` (practice-wr) — receiver class 'MutableSet' not found
- `world-6-practice-writerun-sensor-log` (practice-wr) — receiver class 'MutableSet' not found
- `world-12-type-safe-generic-apis` (lesson-dbg-fixed) — cannot resolve receiver class for method call
- `world-13-let-run` (lesson-dbg-fixed) — unresolved identifier 'uppercase'
- `world-13-this-vs-it` (lesson-wr) — unresolved identifier 'uppercase'
- `world-14-intermediate-operations` (lesson-wr) — receiver class 'IntRange' not found
- `world-14-short-circuiting` (lesson-dbg-fixed) — Collection.take/drop/takeLast/dropLast count must be Int
- `world-14-boss` (lesson-wr) — Collection.take/drop/takeLast/dropLast count must be Int
- `world-14-boss` (lesson-dbg-fixed) — Collection.take/drop/takeLast/dropLast count must be Int
- `world-15-success-failure-handling` (lesson-dbg-fixed) — expression kind not supported (kind=340, 'type_args')
- `world-16-await-suspending-functions` (lesson-wr) — a suspending suspend call is only supported at statement position — write `val x = f(...)`
- `world-16-suspend-coroutine-context` (lesson-wr) — unresolved identifier 'Job'
- `world-16-cancellation-cooperative-cancellation` (lesson-wr) — unresolved identifier 'Job'
- `world-16-cancellation-cooperative-cancellation` (lesson-dbg-fixed) — unresolved identifier 'Job'
- `world-16-supervisorscope` (lesson-wr) — unresolved identifier 'supervisorScope'
- `world-16-supervisorscope` (lesson-dbg-fixed) — unresolved identifier 'supervisorScope'
- `world-16-exception-handling-in-coroutines` (lesson-wr) — unresolved identifier 'supervisorScope'
- `world-16-exception-handling-in-coroutines` (lesson-dbg-fixed) — unresolved identifier 'supervisorScope'
- `world-16-coroutine-best-practices` (lesson-dbg-fixed) — unresolved identifier 'Dispatchers'
- `world-16-boss` (lesson-dbg-fixed) — unresolved identifier 'supervisorScope'

### Timeout (no result in 6 s) (5)

- `world-8-practice-writerun-notifier-channels` (practice-wr)
- `world-8-practice-writerun-animal-sounds` (practice-wr)
- `world-14-sequences-vs-collections` (lesson-wr)
- `world-14-performance-trade-offs` (lesson-dbg-fixed)
- `world-14-when-sequences-should-and-should-not-be-used` (lesson-dbg-fixed)

### Compiler crash (compile-throw) (26)

- `world-8-practice-debug-missing-currency` (practice-dbg-fixed)
- `world-9-inline-functions` (lesson-wr)
- `world-9-crossinline` (lesson-wr)
- `world-11-inheritance-abstract-classes` (lesson-dbg-fixed)
- `world-11-inner-classes` (lesson-wr)
- `world-11-inner-classes` (lesson-dbg-fixed)
- `world-11-delegation` (lesson-dbg-fixed)
- `world-12-type-parameters` (lesson-dbg-fixed)
- `world-13-also` (lesson-wr)
- `world-13-also` (lesson-dbg-fixed)
- `world-13-choosing-the-appropriate-scope-function` (lesson-dbg-fixed)
- `world-13-scope-function-chaining` (lesson-wr)
- `world-13-scope-function-chaining` (lesson-dbg-fixed)
- `world-13-boss` (lesson-wr)
- `world-13-boss` (lesson-dbg-fixed)
- `world-14-intermediate-operations` (lesson-dbg-fixed)
- `world-14-sequence-evaluation-order` (lesson-wr)
- `world-14-sequence-evaluation-order` (lesson-dbg-fixed)
- `world-14-sequences-vs-collections` (lesson-dbg-fixed)
- `world-14-performance-trade-offs` (lesson-wr)
- `world-14-when-sequences-should-and-should-not-be-used` (lesson-wr)
- `world-15-result` (lesson-wr)
- `world-15-success-failure-handling` (lesson-wr)
- `world-15-designing-meaningful-failure-paths` (lesson-wr)
- `world-16-coroutine-best-practices` (lesson-wr)
- `world-16-boss` (lesson-wr)

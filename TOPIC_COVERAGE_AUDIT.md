# Topic-level capability audit: progress and how to continue

Goal: any program a learner writes for a topic should run in the CodeDo editor and print what **real kotlinc** prints. We fix
**topics** (families of everyday operations), not single programs. Started after two long ChatGPT "all worlds" programs showed that
fixing one program at a time is the wrong unit. Last updated after the second round (Worlds 6, 7, 10, 13, 15 topics), 2026-10.

## How the audit works

- Cases: `web-editor/scripts/topic-coverage/cases.ts`. Grouped by topic (with the worlds that teach it). One case = one program body;
  the runner wraps it in `fun main() { ... }` (or runs it as-is when it declares `fun main`). **Expected output is never written by
  hand**: it comes from real kotlinc. Keep cases deterministic (no random, no hash codes of objects).
- Audit (needs `npm run kotlinc:fetch` once): `npm run audit:topic-coverage -- --topic strings,lists`. A case is **ERROR** (simulator
  failed), **WRONG** (different output), **invalid** (kotlinc itself rejects it: fix the case), or a **known limit**.
- Gate for finished topics (no kotlinc needed, runs in `npm run check:all`): `npm run test:topic-coverage`. It replays
  `scripts/topic-coverage/expected.json` for the topics in `DONE_TOPICS`.
- Finish a topic: get it to all-match, then `npm run audit:topic-coverage -- --topic <t> --write-expected`, and add `<t>` to
  `DONE_TOPICS` in `cases.ts`. Anything that must differ goes in `KNOWN_LIMITS` with a reason.
- Also run after each group of fixes: `npm run check:all`, `npm run audit:explore-tryit`, `npm run audit:explore-output`, and
  `npm run compare:errors -- --per-op=120` (kotlinc error agreement; compare with `scripts/compare-errors/baseline.json`; save a new
  baseline with `-- --update-baseline` only after a real improvement). Current agreement: **93.7%**, no false rejections.
- Remember: "it ran" is not "it is right". The first probe only checked that code ran and hid silent wrong answers.

## Scope policy (agreed with the product owner)

We cannot support everything, so: **never be wrong or confusing**.

1. **Tier 1, must work exactly:** everything a lesson teaches plus its everyday companions (a learner who learned `filter` will try
   `map`, `sortedBy`, `groupBy`, `sumOf`).
2. **Tier 2, should work:** common everyday Kotlin that is cheap to add (`removeIf`, `Triple`, `buildList`, `Map.merge`, ...).
3. **Tier 3, do not support, but say so clearly** ("X is not supported in the CodeDo editor"), never a raw JS error or a wrong value:
   real threads/timing, reflection, Java I/O/time/net, `kotlinx.serialization`, Flow, full type-system checks, exact Long beyond 2^53.
   A feature belongs in Tier 1/2 only if it passes: (1) frequency at that world's level, (2) can match kotlinc exactly, (3) cost is
   one small method, not an engine redesign.
4. A "not supported" message must come **after** the compile checks (otherwise real syntax errors are hidden; this dropped kotlinc
   agreement from 93.7% to 92.3% once).

## Status

| Topic (worlds) | Result vs kotlinc | State |
| --- | --- | --- |
| strings (1, 6) | 109/109 | DONE (in gate) |
| chars (1) | 32/34 | DONE, 2 known limits |
| numbers (1, 2) | 98/99 | DONE, 1 known limit (`Long.MAX_VALUE`) |
| ranges (4) | 57/57 | DONE |
| decisions (3) | 28/28 | DONE |
| arrays (6) | 45/45 | DONE |
| lists (6, 10) | 139/139 | DONE |
| sets (6) | 35/35 | DONE |
| maps (6, 10) | 71/71 | DONE |
| collectionsTyped (6, 10) (Doubles in collections, `+`/`-`, `in`, `==`, word count) | 13/13 | DONE |
| nulls (7) | 46/46 | DONE |
| exceptions (15) | 41/42 | DONE, 1 known limit (JDK message of a 1-element list) |
| builders (13: StringBuilder, buildString/buildList, scope functions) | 24/25 | DONE, 1 known limit (`sb[i]`) |
| functions (5) (default/named args, vararg + spread, recursion, local functions, Pair returns, overloads, higher-order basics) | 57/57 | DONE |
| classes/OOP (8, 11) (classes, ctors/secondary ctors, init, accessors with `field`, companion, data/enum (members, constant bodies, companion)/interface/abstract/sealed, `object`, anonymous objects, operator overloading, `lazy`/`observable`/`vetoable`, lateinit, generics-in-classes basics) | 90/90 | DONE (in gate) |
| generics (12), lambdas (9), sequences (14), coroutines (16) | no topic cases yet | write cases first |

885 cases in 15 topics are replayed by `npm run test:topic-coverage` (in `check:all`). kotlinc error agreement: 93.7%, no false rejections.


## Tier progress (2026-10-11)

- **Tier 1:** done for Worlds 1-8, 10, 11, 13, 15 (15 topics, 885 cases). NOT done: Worlds 9, 12, 14, 16, 17.
- **Tier 2:** no dedicated sweep; only extras that surfaced while auditing the done topics were added.
- **Tier 3 ("not supported" message):** done for Flow, Java I/O, kotlinx.serialization. Not confirmed for threads/timing, reflection, Java time/net, exact Long beyond 2^53.

## Next steps (in order)

1. Worlds 12 (generics), 9 (lambdas / higher-order), 14 (sequences), 16 (coroutines basics). Write cases first, then audit.
2. Run the two big ChatGPT-style programs again as end-to-end checks (banking and food-delivery are described in PITFALLS; the food
   program was last stopped at `toTypedArray`, which now exists, so it is worth re-running).
3. Re-check the Tier 2 list below only if a topic needs it.

## Known open problems (not in the audit yet)

- A whole Double inside a generic CLASS (type parameter `T` holding 46000.0) prints without `.0` (`Success(value=46000)` for `Success<T>(46000.0)`):
  JS has no Int/Double at runtime. Fixed statically for List/Set/Map literals and their common operations, declared Double data class
  properties, and typed println/templates; NOT for a generic class's type parameter or a collection nested in another container.
- A function with a block body and no `return` still yields `undefined` (prints `null`), not `Unit`; `println`/`print`/`assert` do return Unit.
- Int `++`/`--` and compound `+=` on an Int do not wrap at 32 bits (only `+ - *` in expressions do).

## Where the code is

- `web-editor/src/utils/kotlinStdlib.ts`: String/Char/Number/Boolean members, `maxOf`/`minOf`, `Int.MAX_VALUE`..., `kotlin.math`
  (installed only when the program mentions it), `javaDoubleToString`, `javaFloatToString`.
- `web-editor/src/utils/kotlinCollections.ts`: `KotlinList`, `KotlinRange` (+ `makeRange`, `boundValue`), `KotlinIndexedValue`,
  `KotlinSequence`.
- `web-editor/src/utils/kotlinRunner.ts`: line passes (ranges, infix ops, `;` before `else`, labels, `__kt_` renames), `when`
  parser, nested-class hoisting call, unsupported-library message.
- `web-editor/src/utils/kotlinFunctions.ts`: token lowerer and type inference (Char/Float/Int typing, chains, named arguments).
- `web-editor/src/utils/kotlinNestedClasses.ts`: nested classes moved to top level.
- `PITFALLS.md`: four entries describe this work (the last: "Worlds 8/11 classes topic") ("A Worlds 1-16 program...", "Topic-level capability audit (Worlds 1-4)", "Topic audit round 2").
- Other tests added: `npm run test:program-gaps` (`scripts/test-program-gaps.ts`, 40 cases from the two ChatGPT programs, checked
  against kotlinc with `-- --kotlinc`).

## Rules learned (read before changing the engine)

1. Never redefine a native JS method on a shared prototype: the transpiler runs in the same realm (a redefined
   `String.prototype.replace` recursed forever). Kotlin's `replace`/`startsWith`/`endsWith`/`forEach` on Maps/`split` are reached
   through `__kt_*` names in generated code only.
2. A Char and a one-letter String are the same JS string: Char arithmetic needs static types (see PITFALLS).
3. A fix to shared lowering can break an unrelated world: always run `check:all`, both Explore audits and `compare:errors`.
4. Reproduce first with the audit/kotlinc, pin the case, then fix; the real compiler is the authority.

## Uncommitted state

Nothing from these rounds is committed (large diff across `web-editor/src/utils/*`, `scripts/*`, `package.json`, `PITFALLS.md`,
this file). `android/app/src/main/java/com/codedorn/MainApplication.kt` also shows as modified; that change (debug server host
`localhost:8081`) was NOT made by this work. Decide whether to commit before starting the next round.

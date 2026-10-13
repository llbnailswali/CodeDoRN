# World 12 quiz concept map

Status: Verified — non-visual content audit complete; phone-width visual review pending  
World: 12 — Generic Realm (Generics & Type System)

## Curriculum inventory

World 12 has 15 catalog-linked lessons: 14 regular lessons and the Generic Data Toolkit Boss. The lesson curriculum has 93 Explore cards and 93 Predict activities across all 15 lessons; these are curriculum evidence, not quiz questions. The World 12 content review reports the teaching-runner Write & Run and Debug checks pass, with no capability-gated activities. Quiz answers involving Kotlin type-system semantics must still be verified with the real Kotlin compiler; the teaching runner is a separate capability gate, not the language authority.

## Approved and authored allocation

The user approved the five-set plan by asking to begin and continue authoring. Each set has three or fewer lessons and four cross-lesson questions. Counts derive from concept breadth and distinct edge cases, not from a fixed lesson quota.

| Set | Lessons | Lesson questions | Cross-lesson questions | Set total |
| --- | --- | ---: | ---: | ---: |
| Generic Foundations | Generic Classes (9), Generic Functions (9), Type Parameters (8) | 26 | 4 | 30 |
| Constraints & Consumers | Generic Constraints (10), Multiple Constraints (9), `in` Variance (10) | 29 | 4 | 33 |
| Variance Relationships | `out` Variance (10), Invariance (9), Declaration-site Variance (11) | 30 | 4 | 34 |
| Projections & Runtime Types | Use-site Variance (11), Star Projections (10), Reified Type Parameters (11) | 32 | 4 | 36 |
| Type-safe APIs | Type Aliases (8), Type-safe Generic APIs (12) | 20 | 4 | 24 |
| **Regular total** | **14 lessons** | **137** | **20** | **157** |

Boss: 12 questions, separate. **Authored full World 12 bank: 169 questions.** All lesson, set, and world totals match the allocation above.

### Planned difficulty guide

For direct lesson questions, the count-band guide was about 2/6/4 for 12, 2/6/3 for 11, 2/5/3 for 10, 2/4/3 for 9, and 2/4/2 for 8. These were guides, not quotas. The authored regular bank has **33 easy / 81 medium / 43 hard** (about 21% / 52% / 27%). Boss follows the standard **1 easy / 5 medium / 6 hard**.

## Set membership and progression

### Set 1 — Generic Foundations

1. Generic Classes
2. Generic Functions
3. Type Parameters

Combination focus: class and function type parameters, inference, explicit type arguments, and preserving relationships across inputs, stored values, and returns.

### Set 2 — Constraints & Consumers

1. Generic Constraints
2. Multiple Constraints
3. `in` Variance

Combination focus: capability bounds, `where` clauses, and consumer-side subtype relationships. Keep class-level variance distinct from constraints on a type parameter.

### Set 3 — Variance Relationships

1. `out` Variance
2. Invariance
3. Declaration-site Variance

Combination focus: producer-safe covariance, mutable invariant types, and declaration-site position rules. Avoid treating `out` as a cast or as permission to write values.

### Set 4 — Projections & Runtime Types

1. Use-site Variance
2. Star Projections
3. Reified Type Parameters

Combination focus: restricting one use of an invariant type, safe operations when an argument is unknown, and the limited runtime checks enabled by inline reified parameters. Do not imply reification restores erased nested generic arguments.

### Set 5 — Type-safe APIs

1. Type Aliases
2. Type-safe Generic APIs

Combination focus: readable type names versus genuinely distinct types; preserving relationships end-to-end and using a bound only for behavior the implementation needs.

## Lesson concept rows

| Lesson | Core concepts for quiz coverage | Complexity basis for proposed count |
| --- | --- | --- |
| Generic Classes | Class type parameters and arguments; explicit arguments and inference; generic properties/members; multiple parameters; nullable arguments; compile-time mismatch | 9: several inference forms and class/member boundaries, but the central mechanism is narrow |
| Generic Functions | Function type-parameter syntax; inference and explicit arguments; same-type relationships; independent parameters; generic extension functions where in scope | 9: compare declaration/call syntax and preserve relationships through results |
| Type Parameters | Parameter versus argument; scope and use in signatures; multiple named parameters; inference versus explicit substitution; invalid generic syntax | 8: foundational distinctions overlap with the class/function lessons, so avoid redundant drills |
| Generic Constraints | Default `Any?` upper bound; explicit upper bounds; capability-based constraints; accepted/rejected arguments; bound-required operations | 10: compile boundaries and overload/inference traps make it denser than basic declarations |
| Multiple Constraints | `where` syntax; one type satisfying multiple bounds; each capability used; invalid chained-bound syntax; compile-time rejection | 9: focused syntax plus multiple simultaneous obligations |
| `in` Variance | Contravariance; consumer-only positions; subtype assignment direction; usable argument types | 10: directionality is easy to reverse and benefits from several compile-valid/invalid contrasts |
| `out` Variance | Covariance; producer-only positions; subtype assignment direction; prohibited consuming positions | 10: parallel to `in` but must be contrasted without duplicate scenarios |
| Invariance | Invariant mutable generics; why read/write capability blocks safe widening; distinction from declaration-site variance | 9: center on the safety reason and common invalid assignments |
| Declaration-site Variance | `in`/`out` on type declarations; valid/invalid member positions; subtype relations; compiler rejection of variance violations | 11: covers both directions and declaration-body legality, with high compile-boundary risk |
| Use-site Variance | `Array<out T>` read projection; `Array<in T>` write projection; accepted source/destination types; restricted operations | 11: two projection directions plus copying/consumer scenarios and compile checks |
| Star Projections | Unknown type argument; safe read and write behavior by variance/bounds; multi-parameter stars; distinction from raw/unsafe types | 10: subtle, bound-sensitive rules and several common misconceptions |
| Reified Type Parameters | Runtime type checks/casts with `reified`; `inline` requirement; ordinary `T` erasure; call-site specialization; nested generic arguments remain erased | 11: multiple compiler-sensitive boundaries; explicitly test what reification does not recover |
| Type Aliases | Alias expansion/interchangeability; generic aliases; function-type readability; aliases do not create nominally distinct types | 8: compact concept, prioritize the important non-new-type distinction |
| Type-safe Generic APIs | Preserve input/output/storage relationships; separate type parameters for transformations; useful bounds; avoid `Any` and unchecked casts; combine variance with API roles | 12: integrative capstone lesson with the broadest API-design surface |

## Boss allocation

| Difficulty | Count |
| --- | ---: |
| Easy | 1 |
| Medium | 5 |
| Hard | 6 |
| **Total** | **12** |

Boss coverage should combine concepts from at least two regular lessons per question and represent all 14 regular lessons across the quiz. Potential theme: a typed generic data toolkit with a repository/store, transformations, constrained selection, producer/consumer interfaces, projections, aliases, and a narrowly justified reified helper. The final Boss question should be the hardest complete-program edge case.

## Verification and scope risks

- The Kotlin documentation is the authority for generic language semantics; the project teaching runner is not a substitute for kotlinc. Verify all code-backed keys and error lines with real Kotlin.
- Generic runtime type arguments are erased. `reified` permits selected checks/casts for the reified parameter in an inline function, but does not make nested generic arguments fully reified.
- Star projections are safe unknown-type views whose legal read/write behavior depends on declaration variance and bounds. Avoid one-size-fits-all claims.
- Multiple upper bounds use a `where` clause; multiple requirements must all be satisfied.
- Type aliases expand to their underlying types and do not introduce nominal type safety. Do not confuse them with value/inline classes.
- The project runner has documented targeted support/transpilation for star projections, generic supertypes, generic constructor inference, use-site projections, and a narrow reified-function shape. Keep runner compatibility and real Kotlin correctness as separate recorded checks.
- Set questions may combine only lessons in their own set. Direct lesson questions may use that lesson and earlier World 12 lessons only.

## Primary references

- [Kotlin Generics: `in`, `out`, `where`](https://kotlinlang.org/docs/generics.html) — type parameters, variance, projections, star projections, constraints, erasure, and reified parameters.
- [Kotlin Type Aliases](https://kotlinlang.org/docs/type-aliases.html) — alias substitution, scope, and the fact that aliases do not create new types.
- Project curriculum: `web-editor/src/data/curriculum/world12LessonsData.ts` and `web-editor/src/data/curriculum/masterCurriculumCatalog.ts`.
- Project runner and capability findings: `WORLD_12_CONTENT_REVIEW.md` and `web-editor/scripts/test-world12-runner.ts`.

## Boss coverage (authored)

| Boss question | World 12 lessons combined |
| --- | --- |
| 1 | Generic Classes; Type Aliases |
| 2 | Generic Classes; Generic Functions; Type Parameters; Type-safe Generic APIs |
| 3 | Generic Constraints; Multiple Constraints |
| 4 | Invariance; Declaration-site Variance; `out` Variance |
| 5 | Use-site Variance; Generic Functions |
| 6 | `in` Variance; Generic Classes |
| 7 | Star Projections; Reified Type Parameters |
| 8 | Generic Classes; Reified Type Parameters |
| 9 | `in` Variance; `out` Variance; Invariance |
| 10 | Type Aliases; Type-safe Generic APIs |
| 11 | Use-site Variance; Invariance |
| 12 | Type Aliases; Generic Classes; Generic Functions; Star Projections; Reified Type Parameters; `out` Variance |

All 14 regular lessons occur in the Boss. Its 12 questions use 2 single-choice, 4 predict-output, 2 find-error, 2 multi-select, 1 code-comparison, and 1 fill-blank item. Difficulty progresses 1/5/6, with the complete pipeline last.

## Audit findings and evidence

- The malformed draft had duplicated constraint and variance blocks and an early array close. It was repaired before adding the remaining three lesson groups, set combinations, and Boss questions.
- Real Kotlin checked all 173 executable variants: predicted outputs, compile-error lines, each fill-blank chip, and both sides of comparisons. The final audit reports **0 problems**. Repairs included ambiguous chips, an incorrect compile-prediction type, incomplete comparison scenarios, and line offsets after wrapping snippets.
- `test:quiz-bank`, `audit:quiz-standard`, strict `audit:quiz-bank`, and TypeScript checks pass. The teaching runner lacks reliable support for several World 12 generic forms, so the bank test uses the real Kotlin audit as the answer authority for this world; it still checks structure, coverage, answer indexes, and set metadata.
- Direct question counts are 9, 9, 8, 10, 9, 10, 10, 9, 11, 11, 10, 11, 8, 12 in curriculum order. All five sets have four cross-lesson questions. No duplicate code scenario or later-lesson concept was found by the strict scan. Correct answer positions and multi-select pairs are spread.
- Prompts and explanations mark Kotlin terms with code chips, while options contain no literal backticks. The World 12 standard audit checks paired and complete chips. The prose uses short, direct English.

### Human wording and distractor review

- Reviewed all 137 direct lesson questions, 20 set questions, and 12 Boss questions for wording precision, misconception-based distractors, explanation alignment, repeated scenarios, and answer-position rebalancing effects.
- Repaired explanation references reversed by answer rebalancing in generic transformations, bounded operations, invariant/read-only collections, use-site projections, reified checks, and type-safe API comparisons.
- Clarified set explanations for invariant `Box` versus mutable collections and declaration-site variance.
- Re-ran `test:quiz-bank`, strict `audit:quiz-bank`, `audit:quiz-standard`, TypeScript checking, and native-data synchronization. All pass; the only reported warnings are the 36 pre-existing type-mix warnings in Worlds 1–6 and 8.
- Visual phone-width review remains intentionally open for the user.

## Current status

The 169-question authored bank is integrated with web and native quiz registries. Compiler, structural, scope, wording, and distractor checks pass. A phone-width visual review of long code and option lines remains before marking the visual presentation verified.

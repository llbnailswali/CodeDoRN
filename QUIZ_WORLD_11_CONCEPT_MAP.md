# World 11 quiz concept map

Status: Verified — non-visual content audit complete; phone-width visual review pending
World: 11 — OOP Evolution

## Curriculum inventory

World 11 has 14 catalog-linked lessons: 13 regular lessons and one Boss lesson. Each regular lesson currently contains 8 Explore scenarios and 8 Predict questions. The Boss lesson also contains 8 Explore scenarios and 8 Predict questions. These lesson activities are curriculum evidence, not quiz questions.

## Quiz allocation

The quiz will use four sets. Every regular lesson belongs to exactly one set; the Boss lesson is separate and is not included in the full quiz.

| Set | Lessons | Lesson questions | Cross-lesson questions | Set total |
| --- | ---: | ---: | ---: | ---: |
| Inheritance & Type Contracts | 3 | 32 | 4 | 36 |
| Domain Modeling & Nested Types | 3 | 29 | 4 | 33 |
| Objects & Extension Design | 3 | 30 | 4 | 34 |
| Extensions, Delegation & API Design | 4 | 44 | 4 | 48 |
| **Regular quiz total** | **13** | **135** | **16** | **151** |

There is no fixed per-lesson quota. Counts follow mapped concept breadth, compile-time boundaries, common traps, and distinct useful scenarios; every question must add coverage rather than repeat another. Current direct-question allocation: Inheritance 11, Interfaces 11, Sealed 11, Data Classes/Enums 11, Nested Classes 8, Inner Classes 10, Objects 8, Companion Objects 11, Extension Functions 11, Extension Properties 11, Delegation 11, Delegated Properties 11, Visibility/API 11. The nested-class and object lessons have fewer questions because repeated basic construction/singleton checks were removed; higher-risk lessons receive additional checks for mapped edge cases. Cross-lesson questions are medium or hard and stay within their set's lessons.

## Set membership

### Set 1 — Inheritance & Type Contracts

1. Inheritance & Abstract Classes
2. Interfaces & Multiple Interface Implementation
3. Sealed Classes & Sealed Interfaces

Coverage combinations: abstract contracts with interface contracts; multiple implementations with sealed hierarchies; dispatch and exhaustive branching.

### Set 2 — Domain Modeling & Nested Types

1. Data Classes in Domain Modeling & Enum Classes
2. Nested Classes
3. Inner Classes

Coverage combinations: value equality with enum state; nested versus inner ownership; identity, construction and captured outer state.

### Set 3 — Objects & Extension Design

1. Object Declarations
2. Companion Objects
3. Extension Functions

Coverage combinations: singleton helpers with companion factories; extensions on interface and class types; static extension dispatch and object-based helpers.

### Set 4 — Extensions, Delegation & API Design

1. Extension Properties
2. Delegation
3. Delegated Properties
4. Visibility & API Design

Coverage combinations: computed extension views with delegated state; delegation with visibility; encapsulation and controlled mutable state.

## Lesson concept rows

These rows are the coverage source for lesson questions. The scenario names come from the authored lesson activities; quiz questions may vary the names and values, but a renamed duplicate does not count as new coverage.

| Lesson | Core concepts that require quiz coverage | Authored scenario evidence |
| --- | --- | --- |
| Inheritance & Abstract Classes | `open` versus final-by-default; abstract class and member obligations; base-reference dispatch; `super`; `final override`; inheritance versus composition | Open override; base reference dispatch; abstract function/property; constructor state; concrete abstract-class behavior; `super`; final override; unresolved abstract member |
| Interfaces & Multiple Interface Implementation | multiple capabilities; default and abstract members; one class plus many interfaces; conflicting defaults; qualified `super<Interface>`; interface-reference dispatch | Two interfaces; abstract plus default member; interface polymorphism; conflict resolution; matching abstract signatures; class plus interfaces; unresolved conflict |
| Sealed Classes & Sealed Interfaces | restricted hierarchies; direct subclass rules; exhaustive `when`; sealed interfaces; nested/direct implementations; compile-time exhaustiveness boundaries | Sealed hierarchy; exhaustive branch; missing branch; sealed interface; direct subclass boundary; type-based branch selection |
| Data Classes in Domain Modeling & Enum Classes | generated `toString`, `equals`, `hashCode`, `copy`, `componentN`; value equality; enum entries, `name`, `ordinal`; enum behavior and domain state | Value equality; copy transition; destructuring; enum name/ordinal; enum state; data-class representation; domain snapshot |
| Nested Classes | class nesting without an outer instance; qualified construction; nested type identity; access to outer-independent members | Nested construction; qualified type reference; nested helper; separate nested instances; no implicit outer state |
| Inner Classes | `inner` captures an outer instance; qualified construction through an outer object; outer member access; distinct captured instances | Inner construction; outer state access; two outer objects; identity/captured state; missing outer receiver boundary |
| Object Declarations | singleton identity; object initialization; object implementing interfaces; shared state; object as a value | Singleton reuse; object interface implementation; shared counter/state; object reference; one-instance behavior |
| Companion Objects | companion as a real singleton; class-name access; private-constructor factory; named companion; companion as interface value; no implicit instance state | Factory; constant; named companion; companion as value; explicit instance parameter; instance-state compile boundary |
| Extension Functions | external receiver syntax; parameters and return values; nullable receivers; member precedence; static resolution by compile-time type; private access boundary; top-level/import model | Basic receiver; parameter; nullable receiver; member wins; static resolution; private boundary; top-level extension |
| Extension Properties | computed getter; no backing field or stored state; nullable receiver; member-property precedence; property-versus-action design; static resolution; private access boundary | Computed getter; nullable receiver; no initializer storage; member wins; derived domain view; private boundary |
| Delegation | `by` interface delegation; forwarding behavior; wrapper customization; delegated receiver ownership; `super`/self-call behavior; delegation versus inheritance | Forwarding; wrapper override; custom behavior; delegated object; self-call nuance; composition boundary |
| Delegated Properties | `by` property delegation; `getValue`/`setValue`; `thisRef` and property metadata; lazy/observable-style behavior where taught; read-only versus mutable delegation; backing-state ownership | Read delegation; write delegation; property metadata; receiver identity; delegated state; compile/runtime boundary |
| Visibility & API Design | `private`, `protected`, `internal`, `public`; setter visibility; API surface; encapsulation; exposing read-only views; inheritance access boundaries | Private member; protected access; internal/public boundary; private setter; hidden mutable state; safe collection/API design |

Every row will receive at least one direct question. High-risk rows—dispatch, compile boundaries, identity, delegation, and visibility—will receive multiple questions and at least one medium or hard question.

## Boss allocation

The Boss quiz contains exactly 12 questions:

| Difficulty | Count |
| --- | ---: |
| Easy | 1 |
| Medium | 5 |
| Hard | 6 |
| **Total** | **12** |

Target types: 4 `predict_output`, 2 `find_error`, 2 `multi_select`, 2 `single_choice`, 1 `code_comparison`, and 1 `fill_blank`. No `true_false`. Every Boss question combines concepts from at least two World 11 regular lessons, all 13 regular lessons are represented across the Boss, and the final question is the hardest complete-program edge case.

### Boss coverage (authored)

| Question | Difficulty | Combined lesson concepts |
| --- | --- | --- |
| 1 | Easy | Data class records + enum states |
| 2 | Medium | Data-class generated representation + enum state |
| 3 | Medium | Sealed outcomes + interface dispatch |
| 4 | Medium | Nested helper + data-class copy + enum state |
| 5 | Medium | Interface delegation + extension property |
| 6 | Medium | Delegated property + setter visibility |
| 7 | Hard | Sealed hierarchy + abstract implementation |
| 8 | Hard | Data-class copy + enum state + extension function dispatch |
| 9 | Hard | Object singleton + companion factory |
| 10 | Hard | Lazy delegated property + data class + enum state |
| 11 | Hard | Inner class ownership + visibility |
| 12 | Hard | Complete domain flow combining enum, data class, sealed result, interface, object singleton, and exhaustive `when` |

Difficulty is 1 easy / 5 medium / 6 hard. The type guide is met exactly: 4 predictions, 2 error-finding, 2 multi-select, 2 single-choice, 1 comparison, 1 fill-in. The Boss covers all 13 regular lessons across its 12 questions.

## Authoring rules

- Use explicit backticks for code in prompts and explanations: keywords, types, operators, names, literals, signatures, expressions and exact output.
- Keep options plain text unless they are code snippets rendered with `monoOptions: true`.
- Use short, simple English. State whether the learner is predicting output, checking compilation, choosing code, or finding an error.
- Every question must trace to a concept-map row, have one unambiguous key, meaningful distractors, and an explanation tied to the code.
- Lesson questions may use only that lesson and earlier lessons. Set questions may use only lessons in their own set.
- Verify executable answers with the real Kotlin compiler and record findings here.

## Audit findings and evidence

### Verification results

- Authored 135 direct questions across 13 regular lessons using complexity-based counts, 16 cross-lesson set questions (4 per set), and 12 Boss questions: **163 total**. Full regular quiz has 151 questions; Boss is separate.
- Difficulty: regular bank 26 easy / 77 medium / 48 hard; Boss 1 / 5 / 6. Direct lesson counts are intentionally variable (8–11), not a fixed quota.
- `test:quiz-bank`, editor TypeScript check, and `audit:quiz-standard` pass. Standard audit reports only the existing type-mix warnings in Worlds 1–6 and 8; World 11 adds none.
- World 11 `scan.ts`: no duplicate explanations, code/options, or code-only scenarios; no generic true/false prompts; balanced answer positions (23/23/22/22); all multi-selects ask for two answers. Repeated generic output prompts are on distinct code traces.
- Real-kotlinc audit: **136 executable cases, 0 problems** after the complexity-based allocation update. This covers output predictions, every fill-in chip, error examples, and both sides of code comparisons. Declaration-only comparison fragments were compiled and their structural differences checked.
- `npm run test:quiz-bank`, editor `npm run lint`, root `npx tsc --noEmit`, `npm run audit:quiz-standard`, strict `npm run audit:quiz-bank -- --strict`, and `npx tsx scripts/generate-native-data.ts --check` pass. The standard audit has no World 11 violations; it still reports 36 pre-existing type-mix warnings for Worlds 1–6 and 8.
- The first compiler/runner pass found two weak fill-in chip sets, a misplaced nested-class error marker, a nullable extension-property formatting issue, and comparisons that did not distinguish their choices. Those were repaired and the final compiler and quiz-bank checks pass. The real-Kotlin audit now includes Boss arrays.
- The strict World 11 scope scan checks executable code for concepts first introduced later in this World; concepts previously taught in World 8 are allowed. It reports no duplicate scenarios, out-of-set concepts, or later-lesson concepts.
- **Remaining:** phone-width visual review is assigned to the user by the standard. A separate human wording/distractor pass is advisable; automated gates do not judge every conceptual option. Curriculum evidence: `web-editor/src/data/curriculum/world11LessonsData.ts` and `WORLD_11_CONTENT_REVIEW.md`.

### Human wording and distractor review

- Reviewed all 135 direct lesson questions, 16 set questions, and 12 Boss questions for prompt precision, distractor plausibility, explanation alignment, and answer-position rebalancing effects.
- Repaired reversed A/B explanation references in comparison questions, including inheritance, interface defaults, data-class copying, nested versus inner classes, delegated properties, and API visibility.
- Repaired one extension-property precedence explanation, clarified the shipment set explanation so it describes the values actually used by `text`, and corrected the shared-factory explanation to name `Product.make()` and `Registry.items` accurately.
- Re-ran `test:quiz-bank`, strict `audit:quiz-bank`, `audit:quiz-standard`, root TypeScript checking, and generated-data verification. All pass; the only reported warnings are the 36 pre-existing type-mix warnings in Worlds 1–6 and 8.
- Visual phone-width review remains intentionally open for the user.

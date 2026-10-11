# World 8 Quiz Plan — Object Kingdom

Status: **Question bank collected and registered for the React Native app.** It follows the 13 regular World 8 lessons and separate Student Grade Manager Boss lesson in `web-editor/src/data/curriculum/masterCurriculumCatalog.ts`. The target mix remains **20% easy / 50% medium / 30% hard**.

## Size and difficulty

- 13 regular lessons × 10 questions = **130 lesson questions**. Each lesson: 2 easy, 5 medium, 3 hard.
- 4 sets × 4 extra questions = **16 set questions**. Each set: 1 easy, 2 medium, 1 hard; these combine lessons within that set.
- Full regular quiz = **146 questions**: 30 easy, 73 medium, 43 hard.
- Separate Boss quiz = **12 questions**: 1 easy, 5 medium, 6 hard (10/40/50, QUIZ_QUALITY_STANDARD.md section 10).
- World total = **158 questions**: 31 easy, 78 medium, 49 hard.

The collected bank has all seven supported quiz question types. The quiz-bank validator confirms the 158-question count, IDs, ownership, answer structure, and difficulty mix. The local real Kotlin compiler checks **79 program variants** covering prediction, fill-in, find-error, and code-comparison questions. All **53 prediction programs** also produce their keyed output in the app runner. The React Native TypeScript check passes. Two valid Kotlin forms exposed app-runner bugs; they are recorded in `KOTLIN_RUNNER_KNOWN_ISSUES.md`, and the quiz examples use equivalent code the app runner can execute.

The set count follows the lessons and is not fixed across worlds. Every regular lesson belongs to one set. A set quiz contains its lessons' questions plus its four extra questions. The full quiz contains all four sets; the Boss stays separate.

## Sets

| Set | Lessons in curriculum order | Lesson Qs | Extra Qs | Set total | Easy | Medium | Hard |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Classes & State | Classes; Objects; Properties | 30 | 4 | **34** | 7 | 17 | 10 |
| Methods & Construction | Methods; Constructors; Primary constructors; `init` | 40 | 4 | **44** | 9 | 22 | 13 |
| Type Design & Access | Visibility modifiers; Data classes; Enums | 30 | 4 | **34** | 7 | 17 | 10 |
| Inheritance & Contracts | Basic inheritance; Interfaces; Overriding members | 30 | 4 | **34** | 7 | 17 | 10 |
| **Full regular quiz** | **13 lessons** | **130** | **16** | **146** | **30** | **73** | **43** |
| **Boss, separate** | Student Grade Manager | — | — | **12** | **1** | **5** | **6** |

## Lesson question scope

Each lesson has 10 distinct questions. A lesson question may use its lesson and earlier taught knowledge, but must not require a later lesson. The concepts below are coverage guidance, not a reason to repeat the same example ten times.

| Lesson and catalog ID | Assess | Misconception to target |
| --- | --- | --- |
| Classes (`world-8-classes`) | Define a class; constructor properties shown in the lesson; create separate instances; read a property and call a method. | A class and one instance are the same thing; Kotlin requires `new`; instances share their property values. |
| Objects (`world-8-objects`) | Declare a named singleton with `object`; access its members by its name; compare a singleton with separate class instances. | An `object` declaration must be constructed each time; every use creates a fresh instance. |
| Properties (`world-8-properties`) | Read properties; change a `var` property; understand that a `val` property cannot be reassigned after construction. | A `val` object reference prevents changes to every `var` property; a `val` property can be assigned again. |
| Methods (`world-8-methods`) | Method parameters, return values, reading and changing instance state, and one method calling another. | Method parameters become properties automatically; changing one instance changes all instances. |
| Constructors (`world-8-constructors`) | Constructor input parameters and explicitly declared properties assigned from them in `init`, as taught. | A plain constructor parameter is automatically a public property; an object needs a separate `new` call. |
| Primary constructors (`world-8-primary-constructors`) | `val`/`var` in the primary constructor declare properties; distinguish them from plain parameters; instantiate with matching arguments. | Every constructor parameter is a property, even without `val` or `var`. |
| `init` (`world-8-init`) | Automatic execution during construction; simple conditionals and derived properties; multiple `init` blocks run in written order. | `init` requires an explicit call; only the last block runs; it runs after later calls to methods. |
| Visibility modifiers (`world-8-visibility-modifiers`) | Default `public`, `private` members, and whether access from outside the class is allowed. | `private` means no code can access the member, including its own class; every member is private by default. |
| Data classes (`world-8-data-classes`) | `data class` syntax and the readable generated `toString()` with named properties, as taught by the lesson. | A regular class automatically prints the same named-property text; `data` changes how an instance is constructed. |
| Enums (`world-8-enums`) | `enum class`; fixed named constants; simple enum values with properties if shown in the lesson. | Enum constants can be created freely at runtime; enum names are string literals. |
| Basic inheritance (`world-8-basic-inheritance`) | `open` parent class; subclass syntax; override an open method; inherited versus changed behavior. | Classes and methods are overridable by default; a subclass loses all inherited behavior. |
| Interfaces (`world-8-interfaces`) | An interface as a shared contract and unrelated classes implementing it in their own way. | An interface is an object instance; every implementing class must behave identically. |
| Overriding members (`world-8-overriding-members`) | Override an open property or method; determine which subclass implementation runs when accessed through a parent type or loop. | The parent's implementation always wins because the variable is typed as the parent; `override` creates an unrelated new method. |

## Extra questions for each set

Four per set: 1 easy, 2 medium, 1 hard. Every extra question must combine at least two lessons in that set, have the set's `setId`, use the set title as `topic`, and use its last lesson as `lessonId`.

| Set | Easy | Medium (2) | Hard |
| --- | --- | --- | --- |
| Classes & State | Identify when a named `object` or a class instance fits a small task. | Compare state on two instances; read or update a property on a class instance while an `object` member is accessed by name. | Trace two separate instances plus a singleton without mixing their state. |
| Methods & Construction | Identify a property created by a primary constructor. | Trace a constructor argument through property assignment and a method; predict the result of an `init` action followed by a method call. | Trace construction, `init` execution, and a later state-changing method in order. |
| Type Design & Access | Pick an accessible public member rather than a private one. | Compare printed forms of regular and data class instances; read an enum value through a public method while its state is private. | Explain which member access compiles and what a valid public method returns for a data or enum value. |
| Inheritance & Contracts | Identify the implementation that fulfills an interface method. | Trace an inherited open method versus an override; call the same interface method on two implementing classes. | Predict behavior through a parent/interface reference with multiple implementing instances, using a list with a specified order. |

## Boss quiz — Student Grade Manager

Plan **12 questions: 1 easy, 5 medium, 6 hard**, ordered easy to hard. Use small, independent student and grade scenarios that combine World 8 classes, methods, constructors, properties, visibility, data classes, enums, interfaces, and overriding where relevant. Earlier worlds may supply lists, maps, loops, functions, conditions, and null safety. Do not require later-world features such as generics beyond collection types already taught, lambdas, coroutines, or advanced delegation.

Examples: construct two students with different scores, calculate a simple grade by a method, handle an optional score safely, print a data class summary, or process an ordered list of students through an interface method. Keep all data needed for each question in that question. Avoid relying on an unspecified collection iteration order or on another Boss answer.

## Authoring and verification rules

- Use simple English, short prompts, one clear answer, plausible wrong answers, concise explanations, and hints that guide without revealing the answer. Spread the seven supported quiz types across the world where they fit: single choice, true/false, predict output, fill blank, find error, code comparison, and multi-select.
- Highlight important Kotlin syntax and complete short code expressions in question text selectively. Do not split one expression into several highlighted fragments. Where a question already shows the whole code block, do not repeat that block in the prompt.
- Show programs as complete, readable multiline Kotlin code. Keep class declarations and their methods on separate lines, use blank lines before `main` where helpful, and preserve the **two-space quiz indentation** established in `formatQuizCodeQuestion`. Let the native code panel scroll horizontally for long lines.
- Check expected output and deliberate errors with a real Kotlin compiler where possible. Class, `object`, `init`, visibility, data-class, enum, and inheritance examples may be outside the lightweight app runner's supported subset. Record a runner rejection as a runner limitation until the code is checked against Kotlin; never label valid Kotlin invalid because the runner rejects it.
- Audit IDs, answer keys, type mix, counts, XP, lesson/set ownership, duplicate scenarios, answer position balance, and scope before registering the bank in React Native. The catalog's per-lesson `questionsCount: 3` describes the lesson's Stage 2 prediction activity; it does **not** set the quiz-bank question count.

## Authored and generated files

- Authored bank: `web-editor/src/data/quizBank/world8Quiz.ts`.
- Sets and Boss metadata: `web-editor/src/data/quizBank/quizSets.ts`.
- React Native registry: `src/quizData.ts`.
- Bank structure test: `web-editor/scripts/test-quiz-bank.ts`.
- Real compiler test: `web-editor/scripts/test-world8-quiz-kotlin.ts`.
- Generator: `web-editor/scripts/generate-native-data.ts`.
- Generated React Native files: `src/world8Quiz.ts`, `src/quizSets.ts`, and `src/contentStats.ts`.

### Boss coverage (authored)

All 12 questions follow one program, the Student Grade Manager, and each combines two or more World 8 lessons. Real kotlinc confirmed every predicted output, both compile errors (and their lines), each fill-in chip, both code-comparison programs, every option of both multi-select questions and every option of the interface question.

| # | Diff | Type | Lessons combined |
| ---: | --- | --- | --- |
| 1 | easy | single_choice | Classes, primary constructors, properties (`val` versus `var`) |
| 2 | medium | fill_blank | Enums, methods, classes |
| 3 | medium | predict_output | Data classes, classes, methods, properties |
| 4 | medium | single_choice | Interfaces, overriding members, methods |
| 5 | medium | code_comparison | Visibility modifiers, primary constructors, methods |
| 6 | medium | predict_output | Objects, `init`, constructors |
| 7 | hard | predict_output | Basic inheritance, overriding members, methods, primary constructors |
| 8 | hard | find_error | Visibility modifiers, basic inheritance, constructors |
| 9 | hard | multi_select | Data classes, properties (`val` reference versus `var` property) |
| 10 | hard | find_error | Interfaces, overriding members, enums |
| 11 | hard | multi_select | Constructors, primary constructors, `init`, properties |
| 12 | hard | predict_output | Interfaces, overriding, inheritance, enums, data classes (boundary score) |

Every one of the 13 lessons is used at least once. The old Boss (2/6/4) was replaced because it had two single-fact questions, a true/false and one-lesson questions.

## Audit findings and evidence (content audit, 2026-10-11)

All 158 questions were read one by one (lesson, set and Boss). Mechanical scans were clean: no filler options, no repeated explanations or hints, answer positions balanced (28/27/26/25).
`npm run test:world8-quiz-kotlin` (real kotlinc, 96 variants) and a separate probe of the single-choice and multi-select facts agreed with every key.

- **Fixed: duplicate scenarios.** `w8q-prop-7` repeated `w8q-prop-3`; `w8q-data-6` repeated `w8q-data-3`; `w8q-set-reuse-3` repeated `w8q-override-3`; `w8q-set-state-3` repeated `w8q-prop-4`; `w8q-set-construction-1` repeated `w8q-init-7`. Each now has its own scenario (Boolean toggle, two-property data class, inherited interface implementation, shared limit versus per-instance count, `init` using a constructor property).
- **Fixed: set questions outside the lesson scope.** `w8q-set-design-1` and `w8q-set-design-3` assumed an enum with a `private` member and a public method. Enum members are not taught or supported (see PITFALLS.md), so they now combine enum + data class and a data class with a private and a public property.
- **Fixed: "hard" questions that were easy.** `w8q-class-8`, `w8q-object-8`, `w8q-primary-8`, `w8q-enum-8`, `w8q-data-8` now need a trap or an extra step (two variables on one instance, an alias of a singleton, named arguments, reassigning an enum variable, two data objects in a template).
- **Fixed: guessable multi-select pattern.** 13 of 15 "Select every true statement" questions had exactly three correct answers. Five (`class`, `object`, `prop`, `method`, `ctor`) now have two.
- **Fixed: wording.** `object` (the keyword) was used for "an instance" in `w8q-method-6`, `w8q-init-2`, `w8q-init-7`, which the prompt highlighter shows as the keyword. Now "instance".
- **Fixed in shared code:** the prompt highlighter wrapped `List<Animal` and left the `>` outside (`w8q-override-7`). Generic types are now one code chip (`emphasizeQuizPrompt` in `quizQuestions.ts`).
- **Open (content):** five questions test only that a data class prints `Name(prop=value)`; the lessons do not teach `==`, `copy()` or destructuring for data classes, so there is nothing more to ask. No question uses `when` over an enum (`when` is World 3). 40 questions open with "What prints?".
- **Open (display):** no phone-width screenshot review has been done.

# World 5 Quiz — Function Forge

Status: **Question bank collected and registered; editorial/compiler review remains open.** Questions must assess only what is taught in the corresponding lesson or earlier lessons in that set. Difficulty target is **20% easy / 50% medium / 30% hard**. Easy checks one fact, medium applies one or two concepts, and hard combines concepts or requires careful multi-step tracing. Follow the shared quiz rules in `CODEDO_PROJECT_PLAN.md`, including selective inline-code emphasis in prompts.

## Bank plan

- Eight regular lessons, 10 questions each: **80 lesson questions** (2 easy, 5 medium, 3 hard per lesson).
- Three sets, four cross-lesson questions each: **12 set questions** (1 easy, 2 medium, 1 hard per set).
- Regular quiz total: **92 questions** — 19 easy, 46 medium, 27 hard (21/50/29 when rounded).
- Separate Boss quiz: **12 questions** — 2 easy, 6 medium, 4 hard.
- World 5 total, including the separate Boss quiz: **104 questions** — 21 easy, 52 medium, 31 hard (20/50/30 when rounded).

The set count follows lesson groupings, not a fixed number. Every regular lesson belongs to exactly one set. Set questions use concepts from multiple lessons in that set and are assigned the final lesson's ID. The Boss lesson is a separate quiz, not a set.

### Exact count by set

| Quiz | Lesson questions | Set questions | Total | Easy | Medium | Hard | Difficulty mix |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Function Foundations | 30 | 4 | 34 | 7 (20.6%) | 17 (50.0%) | 10 (29.4%) | 20.6 / 50.0 / 29.4% |
| Flexible & Concise Calls | 30 | 4 | 34 | 7 (20.6%) | 17 (50.0%) | 10 (29.4%) | 20.6 / 50.0 / 29.4% |
| Local & Flexible Functions | 20 | 4 | 24 | 5 (20.8%) | 12 (50.0%) | 7 (29.2%) | 20.8 / 50.0 / 29.2% |
| Regular quiz | 80 | 12 | 92 | 19 (20.7%) | 46 (50.0%) | 27 (29.3%) | 20.7 / 50.0 / 29.3% |
| Boss quiz (separate) | — | — | 12 | 2 (16.7%) | 6 (50.0%) | 4 (33.3%) | 16.7 / 50.0 / 33.3% |
| World 5 overall | 80 | 12 + 12 Boss | 104 | 21 (20.2%) | 52 (50.0%) | 31 (29.8%) | 20.2 / 50.0 / 29.8% |

Percentages are based on each row's total and rounded to one decimal. The regular quiz meets the target closely; the overall World total rounds to exactly 20/50/30. The Boss's 12-question split is necessarily coarser, so its standalone percentages differ slightly.

## Sets and lesson coverage

| Set | Lessons | Main concepts |
| --- | --- | --- |
| Function Foundations | Defining functions; Function parameters; Return values | Definition versus call; execution order; parameters versus arguments; argument-to-parameter mapping; explicit return types; `return`; using a returned value versus merely printing inside a function. |
| Flexible & Concise Calls | Default parameters; Named arguments; Single-expression functions | Omitting arguments that have defaults; supplying required arguments; named-argument labels and reordering; using a name to skip an earlier default; expression body with `=`; inferred result type and returned expression. |
| Local & Flexible Functions | Local functions; `vararg` | Local helper visibility and enclosing scope; calling a helper from its enclosing function; zero or multiple vararg arguments; iterating over vararg values; required parameters alongside vararg; spread operator only if explicitly taught in the lesson. |
| Boss: Utility Toolkit | World 5 Boss lesson | Combine focused functions, parameters, return values and applicable call features from the completed World 5 lessons to trace or construct a small utility workflow. |

## Per-lesson concept map and allocation

Each lesson has 10 questions: 2 easy, 5 medium, 3 hard. The example coverage below is a planning guide, not a requirement to force every listed idea into a separate question.

| Lesson | Concepts to assess | Coverage ideas |
| --- | --- | --- |
| Defining functions (`world-5-defining-functions`) | `fun` declaration syntax; function name and parentheses; function body; defining does not execute; a call executes the body; repeated calls repeat behavior; top-level declaration order as taught | Identify a declaration/call; predict no output when a function is never called; trace one or multiple calls and their output order. |
| Function parameters (`world-5-function-parameters`) | Parameter name and type in declaration; argument supplied at call; matching arguments to parameters by position; using parameter values; passing literals or variables; multiple parameters | Match call inputs to names; predict a greeting or calculation; find missing/mismatched arguments only where the lesson teaches the resulting compiler rule. |
| Return values (`world-5-return-values`) | Return type after `:`; `return` sends a value to caller; caller can print, store or use result; returning differs from printing; returned value has declared type | Trace a returned value through its caller; distinguish printed output from a returned result; identify missing/wrong return only when validly taught. |
| Default parameters (`world-5-default-parameters`) | Default value in declaration; omitted argument uses default; explicit argument overrides it; required versus optional parameters; defaults with multiple parameters as taught | Predict calls with omitted/overridden values; determine which arguments are required; avoid implying arbitrary positional skipping unless named arguments have been taught. |
| Named arguments (`world-5-named-arguments`) | `name = value` at call site; labels map values to declared parameters; named arguments can be reordered; names can target a later default while omitting an earlier default; positional/named mixing only within taught Kotlin rules | Compare positional and named calls; trace reordered same- and mixed-type arguments; find swapped labels/values; skip a defaulted parameter by naming a later one. |
| Single-expression functions (`world-5-single-expression-functions`) | `= expression` body syntax; expression value is the function result; inferred return type; expression body versus block body with explicit `return`; no braces/`return` in the taught expression form | Convert/recognize equivalent forms; infer a simple result type; predict a call using arithmetic or a template; distinguish a body expression from a block body. |
| Local functions (`world-5-local-functions`) | Function declared inside another function; local visibility within enclosing scope; calling the local helper; helper can use only values/rules explicitly demonstrated in the lesson | Trace a helper called within its owner; distinguish valid local use from out-of-scope use if the exact compiler behavior is taught; avoid unsupported claims about closures or recursion. |
| `vararg` (`world-5-vararg`) | `vararg` accepts zero or more arguments; individual arguments are collected for iteration; required parameter before vararg; output/order from processing supplied values; spread operator only if lesson content demonstrates it | Trace zero/one/many values; choose a valid call; predict accumulation/output; combine prefix/required input with trailing values. |

## Cross-lesson set questions

Four per set: one easy, two medium, one hard. These are additional questions, not replacements for lesson questions.

| Set | Cross-lesson combinations |
| --- | --- |
| Function Foundations | Easy: declaration versus call. Medium: parameters feeding a returned calculation; function call order with returned value printed by caller. Hard: trace two functions where one passes arguments to another and uses its return value. |
| Flexible & Concise Calls | Easy: recognize a defaulted named parameter. Medium: override one default while another remains; compare a concise expression body with an equivalent block function. Hard: named call skips a default and the returned expression is then used in another call. |
| Local & Flexible Functions | Easy: identify where a local function can be called. Medium: local helper processes multiple vararg inputs; vararg call with zero values and a required leading argument. Hard: trace a local helper that receives a required value plus vararg inputs and returns or prints the combined result, only using behavior supported by the lessons. |

## Boss quiz scope

The Boss can combine all regular World 5 concepts, but should stay within the Utility Toolkit lesson and avoid introducing new syntax. Use 12 questions (2 easy, 6 medium, 4 hard), including direct checks and multi-step traces of a small toolkit. Questions may combine parameter passing, defaults/named calls, local helpers, vararg, and returned values only where those interactions are valid and taught. Keep Boss questions distinct from the set questions and from one another.

## Question type coverage and quality checks

Across the World bank, include all seven supported quiz types: single choice, true/false, predict output, fill blank, find error, code comparison, and multi-select. Distribute types naturally; do not force an unsuitable type into a lesson. Use misconception-based distractors (for example, treating a definition as execution, confusing printing with returning, applying arguments by written order despite labels, or assuming an omitted non-default parameter is supplied automatically).

Validation performed: `npm run test:quiz-bank`, web TypeScript lint, root typecheck and `npm run check:native-data` pass. The app runner cannot reliably execute `vararg` examples, so those execution checks are marked engine-unverified and still need real Kotlin compiler verification.

Before final acceptance:

- Verify each question's concepts against its lesson/set boundary; no later-lesson knowledge in a lesson quiz.
- Check every snippet's Kotlin validity and expected output with the project runner; separately verify unsupported interpreter cases with Kotlin compiler-level evidence.
- Check answer keys against the exact prompt, and ensure distractors are plausible but unambiguously wrong.
- Ensure hints guide reasoning without giving away the answer; explanations state the relevant Kotlin behavior.
- Validate IDs, lesson/set ownership, answer indexes, type-specific fields, explanations, hints, XP and difficulty using the quiz-bank checks.
- Use inline code emphasis selectively for meaningful Kotlin tokens, expressions and exact outputs. When a prompt includes a code expression or fragment, highlight the complete expression/fragment as one inline span rather than splitting it into separate chips; do not duplicate a full code sample already shown separately. Preserve wording and render emphasis consistently in the React Native quiz and review screens.
- In prompts that ask learners to compare parameter roles, emphasize the exact parameter identifiers (for example, `greeting` and `name` in the default-parameter question), not the surrounding prose. Keep the wording unchanged apart from adding inline-code formatting.

## Source files

- Lessons: `web-editor/src/data/curriculum/world5LessonsData.ts`
- Authored quiz questions: `web-editor/src/data/quizBank/world5Quiz.ts`
- Set and Boss definitions: `web-editor/src/data/quizBank/quizSets.ts`
- Web bank registration: `web-editor/src/data/quizBank/index.ts`
- Generated native copy: `src/world5Quiz.ts`

# CodeDo visual quality standard

The rules for the "How it works" visual of the Learn stage (Stage 1). It governs the visuals and the Learn example they explain.
`LESSON_QUALITY_STANDARD.md` governs lesson content in general, `QUIZ_QUALITY_STANDARD.md` the quiz and `PRACTICE_CONTENT_PASS.md`
Practice. Where this file and the lesson standard both speak about the Learn example, the stricter rule applies.

The real Kotlin compiler is the authority on what a program prints. The simulator is not.

## 0. The principle

**Every visual is designed for its own lesson, from scratch, and explains the Learn example that the learner sees on the same screen.**

- No generic templates. A visual is never produced by filling in a pattern, and never copied from another lesson with the names changed.
  A flowchart that only has the right shape is wrong (the first `do-while` card looked like an `if`).
- A visual shows the **mechanism** of the construct, not its syntax. If a learner can understand the lesson without the picture, the picture has
  no reason to exist.
- The visual and the example are designed together. If the current example does not make the idea visible, change the example (section 3).
- A lesson that needs no picture gets none. Comments, `print`/`println` basics, and other lessons where nothing moves are skipped on purpose.
  Record the reason in the status table (section 9).

What is shared is only the drawing engine (boxes, routed arrows, label chips, notes, colours, dark mode). It decides how things look, never
what a diagram says.

## 1. The brief (written BEFORE anything is drawn)

One short brief per lesson, kept in the lesson's row of the status table (section 9) or in its own block. It answers, in order:

| # | Question | Example answer (`do-while`) |
| --- | --- | --- |
| 1 | **Teaching point.** What must the learner see? One sentence. | The body runs once BEFORE the condition is checked. |
| 2 | **Common mistake.** What do learners get wrong that the picture corrects? | They think it checks first, like `while`. |
| 3 | **Example fit.** Does the current example show the point with values you can follow? If not, the new example, side by side with the old one. | Keep `count = 5` and `while (count < 5)`: the test is false at once, yet the body ran. |
| 4 | **Diagram kind** (section 5) and why. | Flow with a back-edge: body, then test, "Yes" returns to the body, "No" exits. |
| 5 | **Parts and the code they come from.** Each box or label and the exact line or value in the example it stands for. | Body = `println(count)` and `count++`; test = `count < 5`. |
| 6 | **Walk-through.** The pass(es) the example makes, as values. | count 5: print 5, count becomes 6, `6 < 5` is false, exit. |
| 7 | **The callout.** The one note that states the point (section 4.5). | "This block runs at least once, before the condition is checked." |
| 8 | **Not shown.** What you left out on purpose. | `break` and `continue` (own lessons). |

A brief that cannot answer 1 and 2 means the lesson does not need a visual yet.

## 2. What a good visual does

1. **One teaching point.** Every box, arrow and label either carries it or is needed to read it. Remove anything that does not.
2. **Uses the example's own names and values.** Every identifier and number in the picture appears in the Learn example. No `x`, `foo`,
   or invented numbers. Where the picture shows a trace, it is the trace of the example's actual run.
3. **Reads in one pass.** Start to end, top to bottom or along one clear route, without crossing arrows. If it needs a legend, simplify it.
4. **Shows the surprising case.** Prefer the path that corrects the common mistake (a loop whose test is false at once, an `else`
   branch that is taken, a `null` that skips the call) over the path where nothing is surprising.
5. **Is true in real Kotlin.** The diagram never claims more than the language does. Check each arrow against kotlinc if you are unsure.
6. **Shows the example's own run.** The path the example takes is drawn in full colour; the path it does not take is faded and dashed. Values
   from the run may sit inside the picture where they help.
7. **Stays in scope.** It uses only concepts taught up to this lesson (section 4 of the lesson standard applies to pictures too).

## 3. The Learn example (it may change)

The example is part of the visual's design. Rules for an example that a visual explains:

- **Small.** It fits the code card without scrolling on a phone (about 10 lines at most), one statement per line, 2-space indentation.
- **Exact and short output.** It prints something a learner can check by hand. Prefer one to four short lines.
- **Traceable.** Values are small and easy to follow (a count from 1 to 3, an age of 20). No hidden state.
- **Shows the point.** The run that the visual walks through is the run that teaches (section 2.4).
- **Only taught concepts.** Nothing from a later lesson. The Explore stage may go further; the Learn example may not.
- **The same program is what "Run" executes.** The Run button runs the Learn example (`tryItCode` is derived from it, or overridden in
  `web-editor/src/data/exploreTryIt.ts`). The picture and the output must agree.

### When the example changes, change these together

1. `learn.codeSnippet` in the lesson file (`web-editor/src/data/curriculum/world<N>LessonsData.ts`, or the data file the lesson lives in).
2. `learn.explanation` and any `learn.keyIdeas` that refer to the old example's values or lines.
3. The Run override for `<lesson id>/learn` in `exploreTryIt.ts`, if the lesson has one.
4. Any check that asserts the Learn example (`audit:world<N>-quality`, `test:topic-coverage`, `audit:output-quotes`). Run them; do not edit
   their expectations to make them pass without understanding why they changed.
5. Explore and Predict of the SAME lesson: check that they do not contradict the new example (same names, same claims). Do not change
   them just for variety.
6. The new output: work it out by hand first, write it down, then run it through `compileAndRunKotlin` AND real kotlinc
   (`npm run real-kotlin:serve`, or `scripts/minikotlin/real-kotlin.ts`). They must agree with the hand value.
7. Regenerate the app data (`npm run generate:native-data`) and record the change in the status table.

List every such change in the lesson's brief (section 1, row 3), so it is kept with the picture.

## 4. Design rules

### 4.1 Size (the card is about 300 px wide on a phone)

| Limit | Rule |
| --- | --- |
| Nodes | 7 at most. A larger idea is two lessons, or a table, not a bigger graph. |
| Words in a node | 1 to 5, plain English. Verbs for actions ("Run the body"), a question for a test ("Is age >= 18?"). |
| Code in a node | One line or one short expression, copied from the example, at most about 24 characters. Longer code stays in the code card. |
| Callouts | One note per visual, two at most. 14 words at most each. |
| Chips (edge labels) | 1 to 3 words: "Yes", "No", "Repeat". |
| Height | The whole card fits on one phone screen without scrolling, including its header. |
| Text size | Nothing below 10.5 pt. If it does not fit, remove content; never shrink the text. |

### 4.2 Colour has one meaning each

| Colour | Meaning | Used for |
| --- | --- | --- |
| Purple | start, end | Start and End boxes |
| Blue | a decision or test | the diamond, the test pill |
| Green | keep going, the branch that runs | the "Yes" edge and the box it reaches |
| Red | stop, skip, exit, error | the "No" edge and the box it reaches |
| Yellow | a note | the callout and its dashed connector |
| Grey | plain step | ordinary boxes and arrows |

Never use a colour for decoration. A green box must be something that runs; a red one something that is skipped or stops.
The tokens live in `src/LessonVisual.tsx` (`palette`). Every colour has a light and a dark value; check both.

### 4.3 Shapes and arrows

- Rounded rectangle = step. Diamond = a test with a yes/no answer. Pill = a start or end. Rectangle with a yellow fill = note.
- Arrows enter and leave on a side that makes the route obvious: forward flow goes down, a repeat goes around the side, an exit goes
  to the other side. Arrows never cross a box or another arrow. If a crossing is unavoidable, redesign.
- Every arrow out of a test is labelled. A back-edge carries a "Repeat" chip. Do not label plain forward arrows.

### 4.4 Text

- Text in nodes is plain English (the language of the lessons: short, common words). Code is monospace.
- No jargon the lesson has not taught. No abbreviations.
- Backticks are not used inside the picture; code is already monospace.

### 4.5 The callout

The callout states the teaching point in one sentence, attached by a dashed line to the part it is about. It is the only prose in
the picture. If the callout needs two sentences, the picture is not doing its job.

### 4.6 Light and dark, font scale

Both themes are reviewed for every visual (section 7). The layout must survive the user's font scale: boxes grow in height, never clip.

## 5. Diagram kinds

Use the kind that fits the idea. A new kind is added to the engine only when a lesson needs it, and then documented here.

| Kind | Use it for | Status |
| --- | --- | --- |
| Flow graph (nodes on a grid, routed edges, faded path, notes) | `if`, `when`, loops, `break`/`continue`, `try`/`catch`/`finally`, null-safety chains | built (`graph` in `lessonVisuals.ts`): side edges that rejoin, faded paths, notes. Back-edges around the left are still to be added |
| Memory cells | variables, `val`/`var`, types, arrays, lists, maps, copy vs share | not built |
| Pipeline with values | `map`/`filter`/`fold`, sequences (eager vs lazy), string operations | not built |
| Class tree | inheritance, interfaces, sealed types, enums | not built |
| Timeline lanes | coroutines, `finally` order, `async`/`await` | not built |
| Number line | ranges, `step`, `downTo` | not built |
| Evaluation steps | operator precedence, expression order | not built |

## 6. Where the code lives

| What | Where |
| --- | --- |
| Content (one entry per lesson, keyed by the lesson id) | `web-editor/src/data/lessonVisuals.ts` |
| Types (the single definition, copied into the app data by the generator) | the `// <visual-types>` block of that file |
| Native drawing | `src/LessonVisual.tsx` |
| Where the card appears in the Learn reveal | `src/LessonScreenPersistent.tsx` (`learnV`) |
| Generated app data (never edit) | `src/lessonData.ts`, from `npm run generate:native-data` |
| Render test and HTML preview | `web-editor/scripts/test-lesson-visual.tsx` |

## 7. The process for one lesson

1. **Brief** (section 1). Write it before building so the teaching point and the example stay aligned.
2. **Example** (section 3). If it changes, make all the linked changes and verify the output by hand and with real kotlinc.
3. **Build** the visual in `lessonVisuals.ts`. Add a piece to the engine only if the brief needs one.
4. **Check the numbers.** Every identifier and number in the visual is in the example. Walk the picture against the example's run.
5. **Render.** `npm run test:lesson-visual -- --html /tmp/v.html <lesson id>`, then screenshot it:
   `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --window-size=760,1400 --screenshot=/tmp/v.png file:///tmp/v.html`.
   Look at light and dark. The preview draws loop arrows with typical sizes; the real position comes from measuring on the device.
6. **Review** the screenshot with the owner against sections 2 and 4. Fix, re-render.
7. **Gates** (below). Then record the lesson in the status table.
8. **Device check** (the owner): phone width, both themes, large font scale, the bottom safe area, and that the Run button output matches the picture.

## 8. Gates before shipping

```sh
cd web-editor
npm run generate:native-data           # copies the visual and the (changed) example into the app
npm run generate:native-data -- --check
npm run test:lesson-visual             # every visual renders in both themes at two widths; coordinates are finite and inside the card
npx tsc --noEmit                       # in web-editor/ and in the repo root
npm run audit:world<N>-quality         # when the Learn example changed
```

These checks catch slips (a number outside the card, a visual for a lesson id that does not exist). They do not judge whether a diagram
teaches. That judgement is the owner's and the author's, lesson by lesson (sections 2 and 7).

## 9. Records

Per lesson states, the same as the lesson standard: **Not audited, Brief written, Built, Verified**. A lesson that needs no visual is
**Skipped** with a one-line reason. Record the state, the brief, and any example change in `QUIZ_AND_COVERAGE_STATUS.xlsx` (a `Visuals`
sheet, one row per lesson) and in the commit message. Add a `PITFALLS.md` entry for every renderer bug.

## 10. Progress log (resume here)

Last updated 2026-10-16.

**Done**
- Engine v1 (`src/LessonVisual.tsx`): flows with steps, two-way and many-way decisions, a simple loop, and a chain of tests. Card position
  in the Learn reveal; the Learn screen respects the bottom safe area.
- Thirteen provisional visuals (World 3: `if`, `if/else`, `else if`, `when`, `when` with ranges, `when` as an expression, multiple conditions, type
  checks; World 4: `for`, `while`, `do-while`, `break`, `continue`). They were made from generic shapes and do NOT meet section 0. **Status:
  Changes required.** In particular `do-while` shows the wrong order (a test first) and has no back-edge; `break` and `continue` have none.

**World 3, one lesson at a time** (the owner reviews each screenshot):
- `world-3-if`: **Verified (owner approved the design, 2026-10-16).** The Learn example is unchanged (`age = 20`, four lines). Design: the diamond with `Yes` (solid) and `No` (faded, dashed) routes that leave its sides with rounded corners, a run box and a skip box, both rejoining at End.
- World 4: `world-4-for` built in the new style (repeat arrow around the left, exit on the right, note), waiting for owner approval. The Learn example is unchanged (`for (i in 1..5)`).
- Next: `if/else`, `else if`, `when`, `when` with ranges, `when` as an expression, multiple conditions, type checks. Then redo World 4 (the provisional visuals above).

**Later**
- World 5, then World 6, and so on, each lesson with its own brief and its own diagram kind (section 5).

**Open decisions (owner)**
- Which lessons get a picture at all (the skipped list).
- Whether to add a "Trace it" mode later (step through the diagram and highlight the code line).

# Practice bank: wording and help-level pass

How to rewrite one world's Practice-tab tasks (Write & Run and Debug) so they are easy to read, scale by help level,
and stay consistent. Worlds **1 to 8 are done**, and for every later
world once its bank exists. Worlds 4 and 5 are the cleanest examples to copy from.

This is a content pass. Do not redesign tasks, change what a task teaches, change Kotlin code, change expected outputs,
or change IDs, order, difficulty or tags. Only the wording changes.

## 1. Status

| World | Write & Run | Debug | Status |
| --- | ---: | ---: | --- |
| 1 | 16 | 12 | done (no rendered-screen check yet) |
| 2 | 13 | 8 | done |
| 3 | 16 | 9 | done |
| 4 | 19 | 11 | done |
| 5 | 16 | 8 | done |
| 6 | 20 | 9 | done (no rendered-screen check yet) |
| 7 | 21 | 11 | done (no rendered-screen check yet) |
| 8 | 23 | 13 | authored and worded (no rendered-screen check yet) |

`npx tsx scripts/practice-content-pass/run.ts lint` lists exactly what is left. Any task reported as
"no levelHints" still has the old wording.

Not done anywhere yet: per-level wording for **Debug** hints. Debug tasks use one set of three hints for every help level.

## 2. The rules

These come from the product owner and apply to every task. Examples are real ones from World 2.

1. **Simple, easy English.** Short sentences, common words, direct instructions, one idea per sentence. Keep Kotlin
   words the learner is meant to learn (`for`, `while`, array, function, parameter, `Int`, `%`, string template).
2. **The goal says WHAT, the steps say HOW.** Do not put method details in the goal.
   - Before: "Pull out the thousands, hundreds, tens and ones digits using division and remainder, add them up, and print the digits with their sum."
   - After: "Separate 4872 into its four digits. Then add the digits together and print the digits and their sum."
3. **Goal first, method second** in every step: `**Find the hundreds digit.** Divide `number` by `100`, then use `% 10` to get the last digit.`
4. **Split a step that holds several mental operations** into short sentences (separate lines with `\n` inside the step
   are fine). Do not remove useful detail from Beginner. Improve how it is presented.
5. **Detail depends on the help level the learner chose** (Beginner, Intermediate, Experienced), not on the world:

   | Level | Wording | Example |
   | --- | --- | --- |
   | Beginner | detailed: goal, method, expected values | Find the hundreds digit. Divide `number` by `100`, then use `% 10` to get the last digit. |
   | Intermediate | partial: goal plus the main tools | Find the hundreds digit. Use division and `%`. |
   | Experienced | directional: goal only | Extract the hundreds digit. |

   Never shorten Beginner to make the levels differ. If Intermediate comes out longer than Beginner, **enrich Beginner**.
   Experienced is never longer than Intermediate.
6. **Editor comments say exactly what the hint says**, at every level (plain text, one line). Repeating information
   between the dialog and the editor is intentional.
7. **Debug subtitles describe the program's behaviour, not facts.** Say `The program reports 0 digits for the number 0,
   but 0 has one digit.` Never `The count is 0 for the number 0.`
8. **Debug hints go Notice, then Reason, then Direction.**
   - Hint 1 helps the learner notice where the problem is, without explaining it.
   - Hint 2 explains why it happens.
   - Hint 3 points to the technique, not the code: "Switch to a `do-while` loop so the body runs once before the condition is checked."
     It must leave real work for the learner. Never write the fixed line or block in a hint. That belongs in View Solution.
9. **Do not repeat what the screen already shows.** The "You start with" box shows the starting values and the Expected
   Output panel shows the output. So drop "Given val x = ..." paragraphs and "For these values the output is exactly..." blocks.
   Keep one short note only for a fact the box cannot show (see section 4).
10. **Do not change** Kotlin code, expected outputs, IDs, order, difficulty, tags, hardcode checks, or the concept a task tests.
    Do not make tasks easier or harder. Do not use `--` as an em dash next to `++`/`--` (see `audit:dash-collision`).

## 3. How a task works on screen (what you must preserve)

A Write & Run task is a `PracticeWriteRunProblem` in `src/data/practiceBank/world<N>PracticeProblems.ts`.

| Field | Role |
| --- | --- |
| `summary` | one line on the task list card (plain text) |
| `goal` | "What you need to achieve" (plain text, no markup) |
| `description` | optional note paragraph, then the **numbered steps**, one paragraph each, separated by a blank line: `1. ...`, `2. ...` |
| `initialCode` | the starter. It must hold exactly **one single-line `// N.` comment per step**, in order |
| `levelHints` | Intermediate and Experienced versions of the same steps and comments (type in `lessonStagesData.ts`) |

What the learner sees:

- **Beginner:** the full steps are open in the task dialog. The starter keeps the detailed `// N.` comments, collapsed.
- **Intermediate and Experienced:** hints come one at a time from `levelHints` (Stuck? Show a hint). The starter keeps the
  comments, collapsed and worded for the level (`Detail.tsx` swaps them in).
- **Sync, both ways:** unlocking a hint (either "Show a hint" button) opens its comment in the editor. Tapping a collapsed
  comment unlocks its hint and all hints before it, and opens those comments. (`KotlinCodeEditor` `onHelperToggle`,
  `WriteRun.handleHelperToggle`.)
- **No gate:** every level can ask for hints at any time. Do not add a "two failed runs" rule.
- A task with no `levelHints` falls back to the detailed steps for every level and a clean editor at Intermediate and
  Experienced (the old behaviour). That is why unfinished worlds still work.

Markup in `description`, `levelHints` steps, and Debug `hints` and `explanation` (rendered by `renderTaskText` in
`src/utils/outputDisplay.tsx`):

- `**Goal sentence.**` renders bold. Use it on the first sentence of every step.
- `` `code` `` renders monospace. Use it for variable names, function signatures like `printTrip(name: String)`,
  operators (`+=`, `% 10`, `&&`), and keywords (`break`, `do-while`, `downTo`).
- A plain count such as "add 1" or "by 1" stays plain.
- Do not put markup in the `goal`, `summary`, `subtitle`, or in editor comments (the tool strips it for comments). The `goal`
  is drawn as plain text (`WriteRun.tsx`), so a backtick in it shows as a literal backtick. Worlds 6 and 7 had this until the
  simple-English goal pass removed it. Write `null`, `!!`, `order` as plain words in a goal and keep backticks for steps.

The test `test:practice-bank` enforces: step count equals comment count, levelHints have the same number of entries as the
steps, every comment equals the plain text of its step (so the comments follow the step wording at every level), and step text
never gets longer from Beginner to Intermediate to Experienced.

## 4. The "You start with" box, and when a note is needed

The box lists the declarations inside `main()` that come before the first `// N.` comment. It is **empty** when the
starter declares a function other than `main`, and it never shows top-level (outside `main`) declarations. So:

- Declarations inside `main()` before step 1: drop the "Given..." paragraph.
- A top-level `val`/`var` (World 5: `name`, `score`, `unitPrice`): keep a short note, for example
  ``The top-level `var score = 10` is shared by every function.``
- Facts the code cannot show: units, ranges, meaning of a value. Examples already used: "Month numbers go from 1 (January) to
  12 (December).", "The temperature is in degrees Celsius.", "`award` is a percentage of tuition.", "`divisor` is 0 until a
  divisor is found.", "Each value is declared as `Any`."
- Put such a note in the task's `setup` field in the data file.

## 5. Workflow for one world

All commands run from the repo root. `<N>` is the world number.

```text
# 0. What is left?
npx tsx scripts/practice-content-pass/run.ts lint <N>

# 1. Read the world as one text file (steps, starter, solution, Debug broken and fixed code)
npx tsx scripts/practice-content-pass/run.ts dump <N> /tmp/world<N>.txt

# 2. Author the content: copy the example, then rewrite every task's text
cp scripts/practice-content-pass/world2.data.ts scripts/practice-content-pass/world<N>.data.ts

# 3. Snapshot BEFORE applying (own process), then apply
npx tsx scripts/practice-content-pass/run.ts snapshot <N> /tmp/world<N>-before.json
npx tsx scripts/practice-content-pass/run.ts apply <N> --dry     # checks counts and numbering, writes nothing
npx tsx scripts/practice-content-pass/run.ts apply <N>

# 4. Prove only text changed, and lint the result (each in its own process)
npx tsx scripts/practice-content-pass/run.ts verify <N> /tmp/world<N>-before.json
npx tsx scripts/practice-content-pass/run.ts lint <N>
```

Then run the checks (all must pass), and the real-screen check in section 6:

```text
npx tsc --noEmit
npm run test:practice-bank
npm run audit:output-quotes
npm run test:apply-solution
npm run audit:world<N>-quality       # the world's own audit, if it exists
npm run test:editor-indent
npm run test:comment-folds
npm run audit:dash-collision
npx vite build
```

### The data file

`scripts/practice-content-pass/world<N>.data.ts` exports `WR_DATA` and `DBG_DATA`. Keys are the task id without the
`world-<N>-practice-writerun-` or `world-<N>-practice-debug-` prefix. One Write & Run task:

```ts
'digit-splitter': {
  summary: 'Split a four-digit number into its digits with / and %, then add the digits.',
  goal: 'Separate 4872 into its four digits. Then add the digits together and print the digits and their sum.',
  steps: [                       // BEGINNER, no "N. " prefix
    '**Find the thousands digit.** Divide `number` by `1000`.',
    '**Find the hundreds digit.** Divide `number` by `100`, then use `% 10` to get the last digit.',
    // ...
    '**Print two lines.** Use string templates:\n"Digits: 4 8 7 2"\n"Sum: 21"',
  ],
  i: ['**Find the thousands digit.** Use division.', '**Find the hundreds digit.** Use division and `%`.', /* ... */],
  e: ['**Extract the thousands digit.**', '**Extract the hundreds digit.**', /* ... */],
},
```

Add `setup: '...'` for a note (section 4). Editor comments are **not** authored: `apply` derives them from the steps.
One Debug task:

```ts
'two-test-average': {
  subtitle: 'The program should print "Average: 87.5" for the scores 85 and 90, but it prints "Average: 87".',
  hints: ['<notice>', '<reason>', '<direction, no code>'],
  explanation: '<why it fails and why the fix works, with `code` markup>',
},
```

### What `apply` does (and refuses to do)

It rewrites `summary`, `goal`, `description`, the numbered starter comments and `levelHints` for Write & Run, and `subtitle`,
`hints`, `explanation` for Debug. It refuses (and says why) when a task id is not found, the level arrays have a different
length from the steps, or the starter has no `// N.` comments (or a different number of them than the task has steps). When
all step comments sit together it rewrites that block; when code sits between them (for example a function written above
`main`, as in several World 7 starters) it replaces each single-line step comment in place. If the starter is a backtick
template literal, the tool escapes `\` and `${` in the new comment text, so a step such as "Use one `${ }` expression" is safe.
It re-indents the generated `levelHints` blocks. Re-applying the same data file is idempotent (World 2 is byte-for-byte
identical).

## 6. Check the real screen (do not skip)

Data checks do not prove the screen is right. Render the real task screen in headless Chrome for each level. A page like this
works (dev server on port 3000, `npm run dev`):

```tsx
// _harness.tsx (temporary, delete afterwards) with a matching _harness.html that loads it
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Detail } from './src/components/Detail';
import './src/index.css';                       // REQUIRED: without it no Tailwind class applies and layout checks are meaningless
const p = new URLSearchParams(location.search);
localStorage.setItem('codedo_practice_help_level', p.get('level') ?? 'beginner');
const stats = { streak: 0, stars: 0, gems: 0, hearts: 5, xp: 0, completedLessons: 0, todayLessonsCompleted: 0, todayGoal: 3 };
createRoot(document.getElementById('root')!).render(
  <Detail theme={'dark' as any} initialLessonKey={`world-${p.get('world')}-practice-writerun-${p.get('task')}`}
          initialStageKey="writeRun" isPracticeMode userStats={stats} onExit={() => {}} onCompleteLesson={() => {}} />);
setTimeout(() => {
  const ta = (document.querySelector('textarea') as HTMLTextAreaElement)?.value ?? '';
  document.getElementById('log')!.textContent = 'LOG#' + ta.split('\n').filter((l) => /\/\/ \d\./.test(l)).join('#') + '#END';
}, 2500);
```

```text
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --window-size=420,900 \
  --virtual-time-budget=14000 --dump-dom "http://localhost:3000/_harness.html?level=experienced&world=4&task=stair-steps"
```

Check three tasks per world at all three levels: Beginner shows the detailed comments, Intermediate the partial ones,
Experienced the short ones, all collapsed. Also tap a collapsed comment and press "Show a hint" once to see the sync.
Gotchas that cost time before:

- **zsh does not split an unquoted `"4 stair-steps"`** into two arguments. Pass world and task as separate variables.
- Always import `src/index.css` in the page.
- The help level is `localStorage` key `codedo_practice_help_level` (`beginner`, `intermediate`, `experienced`).
- Read the textarea value for the editor text. The collapsed comments render as `// TODO N.` markers in the DOM.

## 7. Authoring checklist and pitfalls

- [ ] Every step starts with a bold goal sentence ending in a full stop (or a colon when the step is only "Print ...:").
- [ ] `goal` says what to build and does not name operators or methods.
- [ ] No "Given ..." paragraph unless it is a note from section 4. No "For these values the output is exactly ..." block.
- [ ] A list-style step ("print each of these calls") is split into one step per item, so every item gets its own comment.
      World 5 `order-total` (2 steps, 6 comments) and `order-options` were broken this way.
- [ ] Never use a multi-line `//` comment. A second `//` line is left behind as an orphan at Intermediate and Experienced.
- [ ] Quoted output lines inside a step keep their exact spaces. They are checked against the real output by
      `audit:output-quotes`. Put each on its own line after `\n`.
- [ ] Avoid apostrophes in step text. The data files use single-quoted strings, and the tool escapes them, but they
      read badly in code terms. Write "the first trip", not "Ana's trip".
- [ ] Beginner is the longest, Experienced the shortest, per step. `lint` reports violations. `test:practice-bank` stops at
      the first one, so run `lint` to see them all.
- [ ] Debug: subtitle describes behaviour; three hints Notice, Reason, Direction; hint 3 has no code; the explanation says why
      the broken code fails and why the fix works.
- [ ] Do not tag English words as code. Words such as "first", "number", "found", "step", "until", "if" are ordinary English
      in many sentences. Wrap a word in backticks only when it names the variable or keyword.
- [ ] Do not edit `solutionCode`, `brokenCode`, `fixedCode`, expected outputs, `hardcodeCheck` or tags.

## 8. Per-world notes (Worlds 1, 6 and 7 were done last)

- **World 1 (Kotlin Awakening, 16 + 12).** Output-heavy tasks (`print`, `println`, string templates, Char, Long, Float). Many
  steps quote exact text, so run `audit:output-quotes` often. Keep the whitespace in quoted phrases exactly.
- **World 6 (Collection Valley, 20 + 9).** Lots of `listOf`, `mutableListOf`, maps. Wrap collection calls (`removeAt`,
  `getOrDefault`, `sorted()`) in backticks in the steps (never in the goal). Several starters have the collection declared inside `main()`, so the box shows it.
- **World 7 (Null Safety Shield, 21 + 11).** Some tasks have the helper classes or functions already in the starter. When the
  starter declares a function other than `main`, the "You start with" box is empty, so keep a short `setup` note for the
  given values. The Debug tasks here rely on the engine rejecting unsafe nullable access, so do not change their code.

Worlds 1 to 8 are Beginner-level worlds and later worlds are Intermediate or Experienced worlds, but the three help levels
are the **learner's** choice in every world. Apply the same three wordings everywhere.

## 8b. Simple English and the ChatGPT round trip

The wording must be simple enough for an average reader of basic English. Rules (they were applied to Worlds 6 and 7 by
hand, and to every `goal` by a ChatGPT round trip):

- Short everyday words: "find", "count", "print", "add up", "keep". Avoid "derive", "scan", "track", "exclusive",
  "membership", "parallel lists", "runner-up".
- One idea per sentence, about 20 words or fewer. Say WHAT in the goal, not HOW.
- Never change the meaning, a number, a name, a unit or a quoted text. Rephrase only. Keep Kotlin terms the task is about
  (`null`, `!!`, `?:`, `as?`, `Int`, `List`) and add no new ones.

Round trip for one text type (so far only `goal` was done; steps, hints, Debug subtitles and the task-list `summary` are
still in the older wording):

1. Generate a JSON list `{worldId, world, id, <field>}` from the bank. `PRACTICE_GOALS_FOR_CHATGPT.md` is the template: it
   holds the instruction text (with the "do not change the meaning" rule) and the data.
2. Send it to ChatGPT. Expect it to cut the answer off (the first reply held 61 of 121 items): ask it to continue, and
   check the returned file has every id once, no unknown id, and the same order.
3. Compare old and new text for every pair. Flag a lost or new number, a changed quoted phrase, a lost or new code term
   and anything that changes what the learner must do. A script only finds candidates (it flags "print"/"if" as noise);
   read every pair.
4. Apply by task id with ts-morph, then run `snapshot` before and `verify` after (only text fields changed), then `tsc`,
   `test:practice-bank`, `audit:output-quotes`, `test:apply-solution`, `check:data-indent`, `audit:dash-collision` and `lint`.

Never `git checkout` or `git restore` a practice-bank file to undo a bad write. The working copies of the banks are
uncommitted rewrites (the committed World 1 file is an older, different bank). Copy the file to the scratchpad first.

## 8c. Authoring a brand-new bank (World 8 onward)

No other file describes this. Steps: plan a concept coverage map first (LESSON_QUALITY_STANDARD.md), then create
`src/data/practiceBank/worldNPracticeProblems.ts` (same shape as World 7), register it in `practiceBank/index.ts` and add
its lesson slugs to `LESSON_SLUGS` in `scripts/test-practice-bank.ts`. Medium and hard only; the Boss is not in the bank.
Before writing a task, run its Kotlin through `compileAndRunKotlin` and compare with a value worked out by hand (an
independent plain-JS reference is best). Give every Write & Run a `hardcodeCheck` swap value that breaks the base answer
(for example `31 / 7`, not `28 / 7`). A Debug bug must change the output in this simulator, and its `fixedCode` must not be
the lesson's Write & Run solution. Fix any engine gap first, pin it in `scripts/test-numeric-semantics.ts` and add a
PITFALLS.md entry. Then run the wording pass in this file.

## 9. Definition of done for a world

1. `lint <N>` reports no findings.
2. `verify <N>` says only text fields changed.
3. Every check in section 5 passes, and `npx vite build` succeeds.
4. At least three tasks per world were checked on the real screen at all three levels (section 6), including one sync tap.
5. The text follows section 8b (simple English), and the goal has no markup.
6. The `Status` table at the top of this file is updated, and any content error found in the old text is reported
   separately from the wording changes (do not silently fix expected outputs).

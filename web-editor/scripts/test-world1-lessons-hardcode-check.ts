/** Verifies hardcodeCheck data added to World 1's 5-stage curriculum lessons'
 * writeRun stages: real solutions pass both the original and mutated-input
 * runs, and both a bare-literal cheat and a laundered-through-a-variable
 * cheat are rejected. Lessons with no hardcodeCheck (pure literal-print
 * tasks like "Print a Welcome Message", or tasks whose correct output is a
 * fixed target regardless of input, like val vs var's "update to 75") are
 * skipped -- see the writeRun's own review comment for why. */
import assert from 'node:assert/strict';
import { CODEDO_MASTER_WORLDS } from '../src/data/curriculum/masterCurriculumCatalog';
import { AVAILABLE_FIVE_STAGE_LESSONS } from '../src/data/lessonStagesData';
import { runKotlinCode } from '../src/utils/kotlinRunner';
import { applySolutionPreservingComments } from '../src/utils/applySolution';

const world = CODEDO_MASTER_WORLDS.find(w => w.id === 'world-1')!;

let withCheck = 0;
let withoutCheck = 0;

for (const entry of world.lessons) {
  const lesson = AVAILABLE_FIVE_STAGE_LESSONS[entry.fiveStageLessonKey!];
  assert.ok(lesson, `${entry.id}: missing registered lesson`);
  const write = lesson.writeRun;
  if (!write) continue;

  if (!write.hardcodeCheck) {
    withoutCheck++;
    console.log(`[SKIP] ${lesson.id}: no hardcodeCheck (not applicable)`);
    continue;
  }

  // 1. The real solution must still pass exactly as before.
  const solutionResult = await runKotlinCode(
    write.solutionCode,
    write.expectedOutput,
    write.testCase,
    write.hardcodeCheck
  );
  assert.ok(
    solutionResult.success,
    `${lesson.id}: solutionCode failed with hardcodeCheck enabled: ${JSON.stringify(solutionResult)}`
  );

  // 1b. What "View Solution" -> "Apply Solution" actually puts in the editor
  // is NOT solutionCode verbatim -- applySolutionPreservingComments()
  // re-inserts the starter's own numbered `// 1. ...` hint comment(s) right
  // after `fun main() {`. That must also still pass: a hint comment that
  // happens to textually resemble the real declaration (e.g. "// 1. Declare
  // val initial: Char = 'K' ...") sitting ABOVE the real one previously made
  // applyInputSwaps's first-match search mutate the comment instead of the
  // real code, leaving the real value untouched and falsely reporting a
  // hardcode cheat on a byte-for-byte-correct applied solution.
  const appliedSolution = applySolutionPreservingComments(write.initialCode, write.solutionCode);
  const appliedResult = await runKotlinCode(
    appliedSolution,
    write.expectedOutput,
    write.testCase,
    write.hardcodeCheck
  );
  assert.ok(
    appliedResult.success,
    `${lesson.id}: "Apply Solution"'s comment-preserving merge falsely failed hardcodeCheck: ${JSON.stringify(appliedResult)}\nApplied code was:\n${appliedSolution}`
  );

  // 2. A bare-literal cheat must be rejected.
  const cheatCode = `fun main() {\n    println(${JSON.stringify(write.expectedOutput)})\n}`;
  const cheatResult = await runKotlinCode(cheatCode, write.expectedOutput, write.testCase, write.hardcodeCheck);
  assert.equal(cheatResult.success, false, `${lesson.id}: bare-literal cheat was NOT caught`);

  // 3. A learner who keeps the given/instructed declarations (unused) but
  // launders the answer through their own variable must still be rejected --
  // but only when there's an actual inputSwap to prove it with (a lesson
  // like val-vs-var deliberately ships an empty inputSwaps, since no single
  // swap is fair to both its equally-valid solution shapes; there, laundering
  // through a variable can't be caught -- only the bare-literal case can be,
  // and case 2 above already proves that).
  if (write.hardcodeCheck.inputSwaps.length > 0) {
    // Pulled from solutionCode, not initialCode -- some lessons (e.g. Char,
    // Variables & Type Inference) give no declarations at all in the starter
    // and instruct the learner to write them from scratch.
    const declarationLines = write.solutionCode
      .split('\n')
      .filter(line => /^\s*(val|var)\b/.test(line))
      .join('\n');
    const laundered = `fun main() {\n${declarationLines}\n    val answer = ${JSON.stringify(write.expectedOutput)}\n    println(answer)\n}`;
    const launderedResult = await runKotlinCode(laundered, write.expectedOutput, write.testCase, write.hardcodeCheck);
    assert.equal(
      launderedResult.success,
      false,
      `${lesson.id}: laundered-through-a-variable cheat was NOT caught (mutation likely didn't find its target declaration)`
    );
  }

  withCheck++;
  console.log(`[OK] ${lesson.id}`);
}

console.log(
  `\nWorld 1 5-stage lessons: ${withCheck} writeRun stages verified with hardcodeCheck (solution passes, both cheats rejected), ${withoutCheck} correctly left unchecked.`
);

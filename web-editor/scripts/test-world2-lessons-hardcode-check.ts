/** Verifies hardcodeCheck data added to World 2's 5-stage curriculum lessons'
 * writeRun stages: real solutions pass both the original and mutated-input
 * runs, and both a bare-literal cheat and a laundered-through-a-variable
 * cheat are rejected. See scripts/test-world1-lessons-hardcode-check.ts for
 * the World 1 counterpart and the reasoning behind skipped lessons. */
import assert from 'node:assert/strict';
import { CODEDO_MASTER_WORLDS } from '../src/data/curriculum/masterCurriculumCatalog';
import { AVAILABLE_FIVE_STAGE_LESSONS } from '../src/data/lessonStagesData';
import { runKotlinCode } from '../src/utils/kotlinRunner';

const world = CODEDO_MASTER_WORLDS.find(w => w.id === 'world-2')!;

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

  // 2. A bare-literal cheat must be rejected.
  const cheatCode = `fun main() {\n    println(${JSON.stringify(write.expectedOutput)})\n}`;
  const cheatResult = await runKotlinCode(cheatCode, write.expectedOutput, write.testCase, write.hardcodeCheck);
  assert.equal(cheatResult.success, false, `${lesson.id}: bare-literal cheat was NOT caught`);

  // 3. A learner who keeps the given/instructed declarations (unused) but
  // launders the answer through their own variable must still be rejected --
  // only meaningful when there's an actual inputSwap to prove it with.
  if (write.hardcodeCheck.inputSwaps.length > 0) {
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
  `\nWorld 2 5-stage lessons: ${withCheck} writeRun stages verified with hardcodeCheck (solution passes, both cheats rejected), ${withoutCheck} correctly left unchecked.`
);

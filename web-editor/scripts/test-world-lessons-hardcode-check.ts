/** Generic hardcodeCheck verifier for any world's 5-stage curriculum
 * lessons' writeRun stages. Supersedes the world-specific copies
 * (test-world1-lessons-hardcode-check.ts, test-world2-lessons-hardcode-check.ts,
 * kept as-is for their existing npm scripts) with one reusable script.
 *
 * Usage: npx tsx scripts/test-world-lessons-hardcode-check.ts world-3 [world-4 ...]
 */
import assert from 'node:assert/strict';
import { CODEDO_MASTER_WORLDS } from '../src/data/curriculum/masterCurriculumCatalog';
import { AVAILABLE_FIVE_STAGE_LESSONS } from '../src/data/lessonStagesData';
import { runKotlinCode } from '../src/utils/kotlinRunner';

const worldIds = process.argv.slice(2);
if (worldIds.length === 0) {
  console.error('Usage: tsx scripts/test-world-lessons-hardcode-check.ts world-3 [world-4 ...]');
  process.exit(1);
}

let totalWithCheck = 0;
let totalWithoutCheck = 0;

for (const worldId of worldIds) {
  const world = CODEDO_MASTER_WORLDS.find(w => w.id === worldId);
  assert.ok(world, `${worldId}: not found in catalog`);

  let withCheck = 0;
  let withoutCheck = 0;

  for (const entry of world.lessons) {
    const lesson = entry.fiveStageLessonKey ? AVAILABLE_FIVE_STAGE_LESSONS[entry.fiveStageLessonKey] : undefined;
    if (!lesson) continue;
    const write = lesson.writeRun;
    if (!write) continue;

    if (!write.hardcodeCheck) {
      withoutCheck++;
      console.log(`[SKIP] ${lesson.id}: no hardcodeCheck (not applicable)`);
      continue;
    }

    const solutionResult = await runKotlinCode(write.solutionCode, write.expectedOutput, write.testCase, write.hardcodeCheck);
    assert.ok(solutionResult.success, `${lesson.id}: solutionCode failed with hardcodeCheck enabled: ${JSON.stringify(solutionResult)}`);

    const cheatCode = `fun main() {\n    println(${JSON.stringify(write.expectedOutput)})\n}`;
    const cheatResult = await runKotlinCode(cheatCode, write.expectedOutput, write.testCase, write.hardcodeCheck);
    assert.equal(cheatResult.success, false, `${lesson.id}: bare-literal cheat was NOT caught`);

    if (write.hardcodeCheck.inputSwaps.length > 0) {
      const declarationLines = write.solutionCode.split('\n').filter(l => /^\s*(val|var)\b/.test(l)).join('\n');
      const laundered = `fun main() {\n${declarationLines}\n    val answer = ${JSON.stringify(write.expectedOutput)}\n    println(answer)\n}`;
      const launderedResult = await runKotlinCode(laundered, write.expectedOutput, write.testCase, write.hardcodeCheck);
      assert.equal(launderedResult.success, false, `${lesson.id}: laundered-through-a-variable cheat was NOT caught`);
    }

    withCheck++;
    console.log(`[OK] ${lesson.id}`);
  }

  console.log(`${worldId}: ${withCheck} verified, ${withoutCheck} correctly left unchecked.\n`);
  totalWithCheck += withCheck;
  totalWithoutCheck += withoutCheck;
}

console.log(`TOTAL across ${worldIds.length} world(s): ${totalWithCheck} verified, ${totalWithoutCheck} unchecked.`);

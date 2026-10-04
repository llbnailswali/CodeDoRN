/** Verifies World 1's Practice Write & Run hardcodeCheck data: real solutions
 * pass both the original and mutated-input runs, and a bare-literal cheat
 * attempt is rejected -- either by the static hardcoded-output check or by
 * the input-variation check, whichever fires first. */
import assert from 'node:assert/strict';
import { WORLD_1_PRACTICE_WRITE_RUN } from '../src/data/practiceBank/world1PracticeProblems';
import { runKotlinCode } from '../src/utils/kotlinRunner';

let passed = 0;

for (const problem of WORLD_1_PRACTICE_WRITE_RUN) {
  assert.ok(problem.hardcodeCheck, `${problem.id}: missing hardcodeCheck`);

  // 1. The real solution must still pass exactly as before.
  const solutionResult = await runKotlinCode(
    problem.solutionCode,
    problem.expectedOutput,
    problem.testCase,
    problem.hardcodeCheck
  );
  assert.ok(
    solutionResult.success,
    `${problem.id}: solutionCode failed with hardcodeCheck enabled: ${JSON.stringify(solutionResult)}`
  );

  // 2. A learner who prints the literal expected output back (with no real
  // logic at all) must be rejected.
  const cheatCode = `fun main() {\n    println(${JSON.stringify(problem.expectedOutput)})\n}`;
  const cheatResult = await runKotlinCode(cheatCode, problem.expectedOutput, problem.testCase, problem.hardcodeCheck);
  assert.equal(cheatResult.success, false, `${problem.id}: bare-literal cheat was NOT caught`);

  // 3. A learner who KEEPS the starter's given declarations (unused) but
  // launders the literal answer through their own new variable -- this
  // defeats the static print-literal check (println(answer) references an
  // identifier, not a literal), so only the input-variation check can catch
  // it, and only because the given declaration is still present to swap.
  const declarationLines = problem.initialCode
    .split('\n')
    .filter(line => /^\s*(val|var)\b/.test(line))
    .join('\n');
  const laundered = `fun main() {\n${declarationLines}\n    val answer = ${JSON.stringify(problem.expectedOutput)}\n    println(answer)\n}`;
  const launderedResult = await runKotlinCode(laundered, problem.expectedOutput, problem.testCase, problem.hardcodeCheck);
  assert.equal(
    launderedResult.success,
    false,
    `${problem.id}: laundered-through-a-variable cheat was NOT caught (mutation likely didn't find its target declaration)`
  );

  passed++;
  console.log(`[OK] ${problem.id}`);
}

console.log(`\nAll ${passed} World 1 practice Write & Run problems: solution passes, bare-literal cheat rejected, laundered cheat rejected.`);

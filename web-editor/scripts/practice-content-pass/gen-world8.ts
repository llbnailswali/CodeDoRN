/**
 * Writes src/data/practiceBank/world8PracticeProblems.ts from world8.spec.ts (code) with placeholder wording; then run
 *   npx tsx scripts/practice-content-pass/run.ts apply 8
 * to fill in the wording from world8.data.ts. Only used to create the file the first time.
 */
import fs from 'node:fs';
import { WR_SPECS, DBG_SPECS } from './world8.spec';
import { DBG_SUMMARY } from './world8.data';

const tpl = (code: string) => '`' + code.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${') + '`';
const str = (text: string) => "'" + text.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n') + "'";
const list = (items: string[]) => '[' + items.map(str).join(', ') + ']';
const indent = (text: string, n: number) => text.split('\n').map((l, i) => (i === 0 ? l : ' '.repeat(n) + l)).join('\n');

let out = `import { PracticeWriteRunProblem, PracticeDebugProblem } from './types';

// Practice-tab problems for World 8 -- Object Kingdom (medium and hard only; the Boss is not in the tab).
// Every lesson already ends with an easy Write & Run and an easy Debug in its own 5 stages, so this bank starts at the
// World 1 Boss Write & Run bar (3+ dependent steps, a computed value feeding the output) and goes up.
//
//   medium -- 3-5 dependent steps; the class feature (object, getter, init, default argument, override ...) is named in the step.
//   hard   -- state shared between a class and an object, a value computed from properties with Int division, a polymorphic list,
//             a method that can refuse, or several features together; the step names the quantity, not the code.
//
// Every expected value was derived by hand from Kotlin's rules (see scripts/practice-content-pass/world8.spec.ts), not copied
// from the simulator, and is re-verified by scripts/test-practice-bank.ts. Debug tasks that must not compile rely on the class
// rules in src/utils/kotlinClassChecks.ts (val reassignment, private access, override and abstract-member rules).
// Limits of the runner that these tasks stay inside (see PITFALLS.md): no enum members after the constants, no secondary
// constructors, no hashCode(), no overloads that differ only by parameter count, and no generic class parameters.

export const WORLD_8_PRACTICE_WRITE_RUN: PracticeWriteRunProblem[] = [
`;
for (const t of WR_SPECS) {
  const steps = (t.starter.match(/\/\/ \d+\. TODO/g) ?? []).length;
  out += `  {
    id: 'world-8-practice-writerun-${t.id}',
    worldId: 'world-8',
    difficulty: '${t.difficulty}',
    summary: 'TODO',
    conceptTags: ${list(t.tags)},
    challengeNumber: 1,
    totalChallenges: 1,
    xpReward: ${t.difficulty === 'hard' ? 40 : 25},
    title: ${str(t.title)},
    goal: 'TODO',
    description: ${str(Array.from({ length: steps }, (_, i) => `${i + 1}. TODO`).join('\n\n'))},
    requirements: { name: 'main', params: '(none)', returns: 'Unit' },
    fileName: ${str(t.fileName)},
    initialCode: ${indent(tpl(t.starter), 0)},
    solutionCode: ${tpl(t.solution)},
    sampleInput: 'main()',
    expectedOutput: ${str(t.expected)},
    testCase: { call: '', expected: ${str(t.expected)} },
    hardcodeCheck: {
      inputSwaps: [{ variableName: ${str(t.swap.variableName)}, originalLiteral: ${str(t.swap.originalLiteral)}, alternateLiteral: ${str(t.swap.alternateLiteral)} }],
      alternateExpectedOutput: ${str(t.swap.alternateExpected)},
    },
  },
`;
}
out += `];\n\nexport const WORLD_8_PRACTICE_DEBUG: PracticeDebugProblem[] = [\n`;
for (const d of DBG_SPECS) {
  out += `  {
    id: 'world-8-practice-debug-${d.id}',
    worldId: 'world-8',
    conceptTags: ${list(d.tags)},
    summary: ${str(DBG_SUMMARY[d.id] ?? 'TODO')},
    title: ${str(d.title)},
    subtitle: 'TODO',
    challengeNumber: 1,
    totalChallenges: 1,
    difficulty: '${d.difficulty}',
    bugType: '${d.bugType}',
    bugLabel: ${str(d.bugLabel)},
    brokenCode: ${tpl(d.broken)},
    fixedCode: ${tpl(d.fixed)},
    expectedOutput: ${str(d.expected)},
    hints: ['TODO', 'TODO', 'TODO'],
    explanation: 'TODO',
  },
`;
}
out += '];\n';
fs.writeFileSync('src/data/practiceBank/world8PracticeProblems.ts', out);
console.log('wrote', WR_SPECS.length, 'W&R and', DBG_SPECS.length, 'Debug');

/**
 * Writes src/data/practiceBank/world13PracticeProblems.ts from world13.spec.ts (code) with placeholder wording; then run
 *   npx tsx scripts/practice-content-pass/run.ts apply 13
 * to fill in the wording from world13.data.ts. Only used to create the file the first time.
 */
import fs from 'node:fs';
import { WR_SPECS, DBG_SPECS } from './world13.spec';
import { DBG_SUMMARY } from './world13.data';

const tpl = (code: string) => '`' + code.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${') + '`';
const str = (text: string) => "'" + text.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n') + "'";
const list = (items: string[]) => '[' + items.map(str).join(', ') + ']';
const indent = (text: string, n: number) => text.split('\n').map((l, i) => (i === 0 ? l : ' '.repeat(n) + l)).join('\n');

let out = `import { PracticeWriteRunProblem, PracticeDebugProblem } from './types';

// Practice-tab problems for World 13 -- Scope Masters (medium and hard only; the Boss is not in the tab).
// Every lesson already ends with an easy Write & Run and an easy Debug in its own 5 stages, so this bank starts at the
// World 1 Boss Write & Run bar (3+ dependent steps, a computed value feeding the output) and goes up.
//
//   medium -- 3-5 dependent steps; the scope function (let, run, apply, also, with) is named in the step.
//   hard   -- several scope functions together, a chain, nested blocks, or a null check; the step names the quantity, not the code.
//
// Every expected value was derived by hand from Kotlin's rules (see scripts/practice-content-pass/world13.spec.ts), not copied
// from the simulator, and is re-verified by scripts/test-practice-bank.ts. Every solution, swapped solution and Debug program
// was also run through real kotlinc (scripts/practice-content-pass/world13.real.ts). Labelled this (this@Outer) is not supported
// by the simulator, so no task uses it (PITFALLS.md).

export const WORLD_13_PRACTICE_WRITE_RUN: PracticeWriteRunProblem[] = [
`;
for (const t of WR_SPECS) {
  const steps = (t.starter.match(/\/\/ \d+\. TODO/g) ?? []).length;
  out += `  {
    id: 'world-13-practice-writerun-${t.id}',
    worldId: 'world-13',
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
out += `];\n\nexport const WORLD_13_PRACTICE_DEBUG: PracticeDebugProblem[] = [\n`;
for (const d of DBG_SPECS) {
  out += `  {
    id: 'world-13-practice-debug-${d.id}',
    worldId: 'world-13',
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
fs.writeFileSync('src/data/practiceBank/world13PracticeProblems.ts', out);
console.log('wrote', WR_SPECS.length, 'W&R and', DBG_SPECS.length, 'Debug');

import assert from 'node:assert/strict';
import { PRACTICE_WRITE_RUN_BANK, PRACTICE_DEBUG_BANK } from '../src/data/practiceBank';
import { compileAndRunKotlin, runKotlinCode } from '../src/utils/kotlinRunner';

// Verifies every World 1 Practice-tab problem (world1PracticeProblems.ts).
//  Write & Run: solution output, the unfinished starter must NOT pass, a bare
//    println(expected) cheat and a laundered-through-a-variable cheat must be
//    caught by hardcodeCheck, and the solution with the swapped inputs must
//    produce alternateExpectedOutput.
//  Debug: fixedCode passes, brokenCode produces genuinely different output.


// The repo's audit:output-quotes only scans `writeRun: {...}` blocks in lesson files,
// so it never sees flat practice-bank problems. Same rule, applied here: a quoted
// phrase in the description/subtitle/starter comments that matches a real
// print()/println() literal or an expected-output line must match it EXACTLY,
// whitespace included (a missing trailing space in prose teaches the wrong thing).
function quoteMismatches(id: string, code: string, expected: string, texts: string[]): string[] {
  const literals = [...code.matchAll(/\b(?:print|println)\(\s*"((?:[^"\\]|\\.)*)"\s*\)/g)].map(m => m[1]);
  const exact = new Set<string>([...literals, expected, ...expected.split('\n')]);
  const trimmed = new Set<string>([...exact].map(x => x.trim()).filter(Boolean));
  const problems: string[] = [];
  for (const text of texts) {
    for (const m of text.matchAll(/"([^"\n]+)"/g)) {
      const phrase = m[1];
      if (exact.has(phrase)) continue;
      if (trimmed.has(phrase.trim())) problems.push(`${id}: quoted ${JSON.stringify(phrase)} differs only in whitespace from a real literal/output line`);
    }
  }
  return problems;
}

let checks = 0;

// Non-conceptual lessons per world; each needs >= 1 Write & Run and >= 1 Debug problem tagged `lesson:<slug>`.
// (World 1: a hard Char task is intentionally absent -- the simulator cannot tell Char from String.)
const LESSON_SLUGS: Record<string, string[]> = {
  'world-1': ['foundations', 'val-vs-var', 'variables-inference', 'int-long', 'float-double', 'boolean', 'char', 'string', 'string-templates'],
  'world-2': ['arithmetic', 'comparison', 'logical', 'assignment', 'incdec', 'precedence'],
  'world-3': ['if', 'if-else', 'else-if', 'when', 'when-ranges', 'when-expression', 'multiple-conditions', 'type-checks'],
  'world-4': ['for', 'while', 'do-while', 'ranges', 'progressions', 'downto', 'step', 'break', 'continue', 'nested-loops'],
  'world-5': ['defining', 'parameters', 'return', 'default', 'named', 'single-expression', 'local', 'vararg'],
  'world-6': ['arrays', 'lists', 'sets', 'maps', 'mutable-vs-read-only', 'creating-accessing', 'add-remove-update', 'iterating', 'basic-operations', 'choosing-type'],
  'world-7': ['nullable-types', 'nullable-variables', 'safe-call', 'elvis-operator', 'non-null-assertion', 'null-checks', 'smart-casts', 'safe-casts', 'nullable-collections', 'chaining'],
  'world-8': ['classes', 'objects', 'properties', 'methods', 'constructors', 'primary-constructors', 'init', 'visibility-modifiers', 'data-classes', 'enums', 'basic-inheritance', 'interfaces', 'overriding-members'],
};

const ok = (cond: unknown, msg: string) => { assert.ok(cond, msg); checks++; };

for (const worldId of Object.keys(PRACTICE_WRITE_RUN_BANK)) {
const WORLD_WRITE_RUN = PRACTICE_WRITE_RUN_BANK[worldId];
const WORLD_DEBUG = PRACTICE_DEBUG_BANK[worldId] ?? [];
for (const p of WORLD_WRITE_RUN) {
  ok(p.difficulty !== 'easy', `${p.id}: easy tasks are not allowed in this bank`);

  const quoteProblems = quoteMismatches(p.id, p.solutionCode, p.expectedOutput, [p.description, ...(p.initialCode.match(/\/\/.*$/gm) ?? [])]);
  ok(quoteProblems.length === 0, quoteProblems.join('; '));

  // Level hints: Intermediate/Experienced wording must line up with the steps one for one, and get less detailed.
  if (p.levelHints) {
    // Editor comments say exactly what the hint says (plain text, one line), at every level.
    const asComment = (step: string) => {
      const m = /^(\d+)\.\s([\s\S]*)$/.exec(step.trim())!;
      return `// ${m[1]}. ${m[2].replace(/\*\*([^*]+)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1').replace(/\s*\n\s*/g, ' ').trim()}`;
    };
    const stepsOf = p.description.split('\n\n').filter((x) => /^\d+\.\s/.test(x.trim()));
    const starterComments = p.initialCode.split('\n').filter((l) => /^\s*\/\/\s*\d+\./.test(l)).map((l) => l.replace(/^\s*`?/, '').trim());
    ok(JSON.stringify(starterComments) === JSON.stringify(stepsOf.map(asComment)), `${p.id}: the starter's editor comments must be the Beginner steps as one-line plain text`);
    for (const level of ['intermediate', 'experienced'] as const) {
      const lv = p.levelHints[level];
      if (lv) ok(JSON.stringify(lv.comments) === JSON.stringify(lv.steps.map(asComment)), `${p.id}: ${level} comments must be the ${level} steps as one-line plain text`);
    }
    const beginnerSteps = p.description.split('\n\n').filter((x) => /^\d+\.\s/.test(x.trim()));
    const plain = (t: string) => t.replace(/\*\*|`/g, '');
    let previous = beginnerSteps.map((x) => plain(x).length);
    for (const level of ['intermediate', 'experienced'] as const) {
      const lv = p.levelHints[level];
      ok(lv, `${p.id}: levelHints is missing ${level}`);
      if (!lv) continue;
      ok(lv.steps.length === beginnerSteps.length && lv.comments.length === beginnerSteps.length, `${p.id}: ${level} levelHints do not match the ${beginnerSteps.length} steps`);
      lv.steps.forEach((t, i) => ok(t.startsWith(`${i + 1}. `) && !t.includes('\n'), `${p.id}: ${level} step ${i + 1} must start "${i + 1}. " and be one line`));
      lv.comments.forEach((c, i) => ok(c.startsWith(`// ${i + 1}. `) && !c.includes('\n'), `${p.id}: ${level} comment ${i + 1} must be one line starting "// ${i + 1}. "`));
      lv.steps.forEach((t, i) => ok(plain(t).length <= previous[i], `${p.id}: ${level} step ${i + 1} is longer than the more detailed level`));
      previous = lv.steps.map((t) => plain(t).length);
    }
  }

  const sol = await compileAndRunKotlin(p.solutionCode);
  ok(sol.success && sol.output === p.expectedOutput,
    `${p.id}: solution expected ${JSON.stringify(p.expectedOutput)}, got ${JSON.stringify(sol.output)} ${sol.error?.message ?? ''}`);

  const starter = await runKotlinCode(p.initialCode, p.expectedOutput, p.testCase, p.hardcodeCheck);
  ok(!starter.success, `${p.id}: unfinished starter already passes`);

  const hc = p.hardcodeCheck;
  ok(hc, `${p.id}: missing hardcodeCheck`);
  if (!hc) continue;

  let swapped = p.solutionCode;
  for (const s of hc.inputSwaps) {
    const re = new RegExp(`(val|var)\\s+${s.variableName}\\b([^=\\n]*=\\s*)${s.originalLiteral.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
    ok(re.test(swapped), `${p.id}: swap target ${s.variableName} = ${s.originalLiteral} not found in solutionCode`);
    swapped = swapped.replace(re, `$1 ${s.variableName}$2${s.alternateLiteral.replace(/\$/g, '$$$$')}`);
  }
  const alt = await compileAndRunKotlin(swapped);
  ok(alt.success && alt.output === hc.alternateExpectedOutput,
    `${p.id}: swapped solution expected ${JSON.stringify(hc.alternateExpectedOutput)}, got ${JSON.stringify(alt.output)} ${alt.error?.message ?? ''}`);
  ok(alt.output !== p.expectedOutput, `${p.id}: swap does not change the output, so it cannot detect hardcoding`);

  const good = await runKotlinCode(p.solutionCode, p.expectedOutput, p.testCase, hc);
  ok(good.success, `${p.id}: solution fails with hardcodeCheck on: ${JSON.stringify(good)}`);

  const cheat = `fun main() {\n    println(${JSON.stringify(p.expectedOutput).replace(/\$/g, '\\$')})\n}`;
  const cheatRes = await runKotlinCode(cheat, p.expectedOutput, p.testCase, hc);
  ok(!cheatRes.success, `${p.id}: bare-literal cheat was NOT caught`);

  const stripStrings = (text: string) => text.replace(/"(?:[^"\\]|\\.)*"/g, '""');
  const decls = p.solutionCode.split('\n').filter(l => /^\s*(val|var)\b/.test(l) && !/[/*+%-]\s*\w/.test(stripStrings(l.split('=').slice(1).join('='))) || /^\s*val\s+\w+\s*=\s*("[^"]*"|\d[\d_]*L?|-?\d+\.\d+)\s*$/.test(l)).join('\n');
  const laundered = `fun main() {\n${decls}\n    val answer = ${JSON.stringify(p.expectedOutput).replace(/\$/g, '\\$')}\n    println(answer)\n}`;
  const launderedRes = await runKotlinCode(laundered, p.expectedOutput, p.testCase, hc);
  ok(!launderedRes.success, `${p.id}: laundered cheat was NOT caught`);
  console.log(`[W&R ok] ${p.id} (${p.difficulty})`);
}

for (const p of WORLD_DEBUG) {
  ok(p.difficulty !== 'easy', `${p.id}: easy tasks are not allowed in this bank`);
  const quoteProblems = quoteMismatches(p.id, p.fixedCode, p.expectedOutput, [p.subtitle ?? '']);
  ok(quoteProblems.length === 0, quoteProblems.join('; '));

  const fixed = await compileAndRunKotlin(p.fixedCode);
  ok(fixed.success && fixed.output === p.expectedOutput,
    `${p.id}: fixedCode expected ${JSON.stringify(p.expectedOutput)}, got ${JSON.stringify(fixed.output)} ${fixed.error?.message ?? ''}`);
  const broken = await compileAndRunKotlin(p.brokenCode);
  ok(broken.output !== fixed.output || broken.success !== fixed.success,
    `${p.id}: brokenCode and fixedCode produce identical output`);
  console.log(`[Debug ok] ${p.id} (${p.difficulty}) broken -> ${JSON.stringify(broken.output)}`);
}

// Coverage per world.
for (const slug of LESSON_SLUGS[worldId] ?? []) {
  const w = WORLD_WRITE_RUN.filter(p => p.conceptTags.includes(`lesson:${slug}`));
  const d = WORLD_DEBUG.filter(p => p.conceptTags.includes(`lesson:${slug}`));
  ok(w.length >= 1 && d.length >= 1, `coverage: ${worldId} lesson ${slug} has ${w.length} Write & Run and ${d.length} Debug problems`);
}
for (const p of [...WORLD_WRITE_RUN, ...WORLD_DEBUG]) {
  ok(p.worldId === worldId, `${p.id}: worldId ${p.worldId} does not match its bank ${worldId}`);
  ok(p.conceptTags.some(t => t.startsWith('lesson:')), `${p.id}: missing a lesson:<slug> tag`);
}
console.log(`${worldId}: ${WORLD_WRITE_RUN.length} Write & Run + ${WORLD_DEBUG.length} Debug`);
}

const allIds = [...Object.values(PRACTICE_WRITE_RUN_BANK), ...Object.values(PRACTICE_DEBUG_BANK)].flat().map(p => p.id);
assert.equal(new Set(allIds).size, allIds.length, 'duplicate ids across banks');
console.log(`\nPractice banks: ${allIds.length} problems, ${checks} checks passed.`);

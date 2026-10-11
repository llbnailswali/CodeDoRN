/** Real Kotlin audit for World 6 quiz compile-error cases and code comparisons. */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { delimiter, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { WORLD_6_BOSS_QUIZ, WORLD_6_QUIZ, WORLD_6_SET_QUIZ } from '../src/data/quizBank/world6Quiz';

const lib = resolve('tools/kotlinc/lib');
const compiler = process.env.KOTLIN_COMPILER_CLASSPATH ?? join(lib, '*');
const runtime = process.env.KOTLIN_RUNTIME_CLASSPATH ?? join(lib, 'kotlin-stdlib.jar');
const dir = mkdtempSync(join(tmpdir(), 'codedorn-world6-quiz-'));
const java = (args: string[]) => spawnSync('java', args, { encoding: 'utf8', timeout: 60000, maxBuffer: 8 * 1024 * 1024 });
const compile = (files: string[], jar: string) => java(['-cp', compiler, 'org.jetbrains.kotlin.cli.jvm.K2JVMCompiler', '-no-stdlib', '-no-reflect', '-classpath', runtime, ...files, '-d', jar]);
const program = (lines: string[]) => lines.some(line => /^\s*fun main\b/.test(line)) ? lines.join('\n') : `fun main() {\n${lines.map(line => `  ${line}`).join('\n')}\n}`;
const all = [...WORLD_6_QUIZ, ...WORLD_6_BOSS_QUIZ];
assert.equal(WORLD_6_QUIZ.length, 116, 'regular quiz should include lesson and set questions');
assert.equal(WORLD_6_SET_QUIZ.length, 16, 'four sets should each contribute four questions');
assert.equal(WORLD_6_BOSS_QUIZ.length, 12, 'Boss quiz should have 12 questions');
assert.ok(WORLD_6_SET_QUIZ.every(setQuestion => WORLD_6_QUIZ.some(question => question.id === setQuestion.id)), 'all set questions should be in the regular quiz');
const ids = new Set<string>();
for (const q of all) {
  assert.ok(!ids.has(q.id), `duplicate id ${q.id}`); ids.add(q.id);
  if (q.type === 'multi_select') assert.match(q.question, new RegExp(`\\b${q.answers.length}\\b`), `${q.id}: prompt must state how many answers to select`);
}

try {
  const comparisons = all.filter(q => q.type === 'code_comparison');
  const comparisonFiles: { id: string; side: string; path: string; className: string }[] = [];
  comparisons.forEach((q, index) => {
    if (q.type !== 'code_comparison') return;
    for (const side of ['a', 'b'] as const) {
      const pkg = `compare${index}${side}`;
      const fileBase = `Compare${index}${side.toUpperCase()}`;
      const className = `${fileBase}Kt`;
      const path = join(dir, `${fileBase}.kt`);
      let snippet = q[side];
      if (q.id === 'w6q-list-6') snippet = [`println(${snippet.join('\n')})`];
      if (q.id === 'w6q-set-7') snippet = [`println(${snippet.join('\n')}.size)`];
      if (q.id === 'w6q-choose-6') snippet = [...snippet, 'println(scores["Ari"])'];
      writeFileSync(path, `package ${pkg}\n${program(snippet)}\n`);
      comparisonFiles.push({ id: q.id, side: side.toUpperCase(), path, className: `${pkg}.${className}` });
    }
  });
  const comparisonResults = new Map<string, string>();
  for (const item of comparisonFiles) {
    const jar = join(dir, `${item.className.replaceAll('.', '-')}.jar`);
    const built = compile([item.path], jar);
    if (built.status !== 0) {
      comparisonResults.set(`${item.id}/${item.side}`, '<COMPILE_ERROR>');
      continue;
    }
    const ran = java(['-cp', jar + delimiter + runtime, item.className]);
    assert.equal(ran.status, 0, `${item.id}/${item.side} should run: ${ran.stderr}`);
    comparisonResults.set(`${item.id}/${item.side}`, ran.stdout.trimEnd());
  }
  const expectedComparisons: Record<string, [string, string]> = {
    'w6q-arr-7': ['6', '9'],
    'w6q-list-6': ['A', 'B'],
    'w6q-set-7': ['2', '3'],
    'w6q-map-7': ['true', '<COMPILE_ERROR>'],
    'w6q-mut-6': ['', '<COMPILE_ERROR>'],
    'w6q-create-6': ['9\n9', '7\n9'],
    'w6q-iter-6': ['A', 'A=2'],
    'w6q-op-6': ['true', 'false'],
    'w6q-choose-6': ['8', '<COMPILE_ERROR>'],
    'w6q-boss-6': ['Ari: 8\nMia: 6', 'Ari=8\nMia=6'],
  };
  for (const q of comparisons) {
    if (q.type !== 'code_comparison') continue;
    const a = comparisonResults.get(`${q.id}/A`), b = comparisonResults.get(`${q.id}/B`);
    assert.deepEqual([a, b], expectedComparisons[q.id], `${q.id}: real Kotlin outcomes`);
    assert.equal(q.answer, 0, `${q.id}: correct choice should match the hand-checked outcome`);
    assert.notEqual(a, b, `${q.id}: comparison choices must demonstrate different behavior`);
    console.log(`${q.id}: A=${JSON.stringify(a)} | B=${JSON.stringify(b)} | key=${q.answer === 0 ? 'A' : 'B'}`);
  }

  const errors = all.filter(q => q.type === 'find_error');
  for (const [index, q] of errors.entries()) {
    if (q.type !== 'find_error') continue;
    assert.ok(q.errorLine >= 0 && q.errorLine < q.code.length, `${q.id}: invalid error line`);
    const pkg = `error${index}`, className = `Error${index}Kt`;
    const path = join(dir, `${className}.kt`), jar = join(dir, `${className}.jar`);
    writeFileSync(path, `package ${pkg}\n${program(q.code)}\n`);
    const built = compile([path], jar);
    const runtimeError = q.id === 'w6q-arr-9' || q.id === 'w6q-create-9';
    if (runtimeError) {
      assert.equal(built.status, 0, `${q.id}: invalid index should compile before failing at run time`);
      const ran = java(['-cp', jar + delimiter + runtime, `${pkg}.${className}`]);
      assert.notEqual(ran.status, 0, `${q.id}: expected out-of-range access to fail at run time`);
    } else {
      assert.notEqual(built.status, 0, `${q.id}: expected a real Kotlin compile error`);
      assert.ok(built.stderr.includes(`${className}.kt:${q.errorLine + 2}:`), `${q.id}: compiler should flag the marked line; ${built.stderr}`);
    }
  }
  console.log(`World 6 real-Kotlin checks passed: ${ids.size} questions, ${comparisons.length} comparisons, ${errors.length} error cases.`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}

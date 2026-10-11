/** Real-Kotlin checks for World 10 quiz answers; the simulator is not the semantics authority. */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { delimiter, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { WORLD_10_BOSS_QUIZ, WORLD_10_QUIZ } from '../src/data/quizBank/world10Quiz';

const lib = resolve('tools/kotlinc/lib');
const compiler = process.env.KOTLIN_COMPILER_CLASSPATH ?? join(lib, '*');
const runtime = process.env.KOTLIN_RUNTIME_CLASSPATH ?? join(lib, 'kotlin-stdlib.jar');
const dir = mkdtempSync(join(tmpdir(), 'codedorn-world10-quiz-'));
const java = (args: string[]) => spawnSync('java', args, { encoding: 'utf8', timeout: 60000, maxBuffer: 8 * 1024 * 1024 });
const compile = (files: string[], jar: string) => java(['-cp', compiler, 'org.jetbrains.kotlin.cli.jvm.K2JVMCompiler', '-no-stdlib', '-no-reflect', '-classpath', runtime, ...files, '-d', jar]);
const program = (lines: string[]) => lines.some(line => /^\s*fun main\b/.test(line)) ? lines.join('\n') : `fun main() {\n${lines.map(line => `  ${line}`).join('\n')}\n}`;
const all = [...WORLD_10_QUIZ, ...WORLD_10_BOSS_QUIZ];
assert.equal(WORLD_10_QUIZ.length, 102, 'regular quiz should contain the 90 lesson and 12 set questions');
assert.equal(WORLD_10_BOSS_QUIZ.length, 12, 'Boss quiz should contain 12 questions');
const ids = new Set<string>();
for (const q of all) {
  assert.ok(!ids.has(q.id), `duplicate question id: ${q.id}`); ids.add(q.id);
  assert.ok(q.question.trim() && q.explanation.trim() && q.hint.trim(), `${q.id}: missing copy`);
  if (q.type === 'multi_select') {
    assert.equal(q.options.length, 4, `${q.id}: expected four statements`);
    assert.ok(new Set(q.answers).size === q.answers.length && q.answers.every(i => i >= 0 && i < q.options.length), `${q.id}: invalid answer keys`);
    assert.match(q.question, new RegExp(`\\b${q.answers.length}\\b`), `${q.id}: prompt must state the answer count`);
  }
  if (q.type === 'single_choice' || q.type === 'predict_output') {
    assert.equal(q.options.length, 4, `${q.id}: expected four choices`);
    assert.equal(new Set(q.options).size, 4, `${q.id}: duplicate choices`);
    assert.ok(q.answer >= 0 && q.answer < q.options.length, `${q.id}: invalid answer key`);
  }
  if (q.type === 'code_comparison') assert.ok(q.answer === 0 || q.answer === 1, `${q.id}: invalid A/B answer key`);
}

try {
  const predictions = all.filter(q => q.type === 'predict_output');
  const predFiles: string[] = [];
  for (const [i, q] of predictions.entries()) {
    const lines = (q as { type: 'predict_output'; code: string[]; options: string[]; answer: number }).code;
    const pkg = `quiz${i}`;
    const path = join(dir, `Prediction${i}.kt`);
    writeFileSync(path, `package ${pkg}\n${program(lines)}\n`);
    predFiles.push(path);
  }
  const harness = join(dir, 'Audit.kt');
  writeFileSync(harness, `fun main() {\n${predictions.map((_, i) => `println("===CASE${i}==="); quiz${i}.main()`).join('\n')}\n}`);
  const jar = join(dir, 'predictions.jar');
  const built = compile([...predFiles, harness], jar);
  assert.equal(built.status, 0, built.stderr);
  const ran = java(['-cp', jar + delimiter + runtime, 'AuditKt']);
  assert.equal(ran.status, 0, ran.stderr);
  const chunks = ran.stdout.split('===CASE').slice(1);
  assert.equal(chunks.length, predictions.length);
  for (const [i, q] of predictions.entries()) {
    const output = chunks[i].slice(chunks[i].indexOf('===\n') + 4).replace(/\n+$/, '');
    const predicted = q as { type: 'predict_output'; options: string[]; answer: number };
    assert.equal(output, predicted.options[predicted.answer], `${q.id}: output/key mismatch`);
  }

  const comparisonExpected: Record<string, { a: string; b: string }> = {
    'w10q-1-9': { a: '[2]', b: '<COMPILE_ERROR>' },
    'w10q-2-9': { a: '[[1, 1], [2, 2]]', b: '[1, 1, 2, 2]' },
    'w10q-3-9': { a: '0', b: '<RUNTIME_ERROR>' },
    'w10q-4-9': { a: '{1=3, 0=2}', b: '{1=[1, 3], 0=[2]}' },
    'w10q-5-9': { a: '[[1, 2], [2, 3], [3, 4]]', b: '[[1, 2], [3, 4]]' },
    'w10q-6-9': { a: '[1, 2, 3, 3]', b: '[3, 1, 2]' },
    'w10q-7-9': { a: '[fig, pear, apple]', b: '[apple, fig, pear]' },
    'w10q-8-9': { a: 'true', b: 'false' },
    'w10q-9-9': { a: 'null', b: '<RUNTIME_ERROR>' },
    'w10q-boss-5': { a: '<RUNTIME_ERROR>', b: '0' },
  };
  const comparisonAnswer: Record<string, 'a' | 'b'> = {
    'w10q-1-9': 'a', 'w10q-2-9': 'b', 'w10q-3-9': 'a', 'w10q-4-9': 'b', 'w10q-5-9': 'a',
    'w10q-6-9': 'b', 'w10q-7-9': 'a', 'w10q-8-9': 'b', 'w10q-9-9': 'a', 'w10q-boss-5': 'b',
  };
  const comparisons = all.filter(q => q.type === 'code_comparison');
  const comparisonFiles: string[] = [], runnable: Array<{ id: string; side: 'a' | 'b'; pkg: string; file: string }> = [];
  let comparisonIndex = 0;
  for (const q of comparisons) {
    assert.ok(comparisonExpected[q.id], `${q.id}: add hand-checked A/B outcomes`);
    assert.equal(q.answer, comparisonAnswer[q.id] === 'a' ? 0 : 1, `${q.id}: answer key does not match the hand-audited program`);
    assert.notEqual(comparisonExpected[q.id].a, comparisonExpected[q.id].b, `${q.id}: the programs must be distinguishable`);
    for (const side of ['a', 'b'] as const) {
      const lines = q[side], pkg = `compare${comparisonIndex}`, filename = `Compare${comparisonIndex}.kt`;
      const source = join(dir, filename);
      writeFileSync(source, `package ${pkg}\n${program(lines)}\n`);
      if (comparisonExpected[q.id][side] === '<COMPILE_ERROR>') {
        const rejected = compile([source], join(dir, `rejected${comparisonIndex}.jar`));
        assert.notEqual(rejected.status, 0, `${q.id}/${side}: expected a compile error`);
      } else {
        comparisonFiles.push(source); runnable.push({ id: q.id, side, pkg, file: filename });
      }
      comparisonIndex++;
    }
  }
  const comparisonHarness = join(dir, 'CompareAudit.kt');
  writeFileSync(comparisonHarness, `fun main() {\n${runnable.map((r, i) => `println("===CMP${i}==="); try { ${r.pkg}.main() } catch (_: Throwable) { println("<RUNTIME_ERROR>") }`).join('\n')}\n}`);
  const comparisonJar = join(dir, 'comparisons.jar');
  const comparisonBuild = compile([...comparisonFiles, comparisonHarness], comparisonJar);
  assert.equal(comparisonBuild.status, 0, comparisonBuild.stderr);
  const comparisonRun = java(['-cp', comparisonJar + delimiter + runtime, 'CompareAuditKt']);
  assert.equal(comparisonRun.status, 0, comparisonRun.stderr);
  const comparisonChunks = comparisonRun.stdout.split('===CMP').slice(1);
  assert.equal(comparisonChunks.length, runnable.length);
  const actualComparison = new Map<string, string>();
  runnable.forEach((r, i) => actualComparison.set(`${r.id}/${r.side}`, comparisonChunks[i].slice(comparisonChunks[i].indexOf('===\n') + 4).replace(/\n+$/, '')));
  for (const q of comparisons) {
    for (const side of ['a', 'b'] as const) {
      const expected = comparisonExpected[q.id][side];
      const actual = expected === '<COMPILE_ERROR>' ? expected : actualComparison.get(`${q.id}/${side}`);
      assert.equal(actual, expected, `${q.id}/${side}: code comparison outcome`);
    }
  }

  const blankExpected: Record<string, string> = {
    'w10q-set-1-3': '6',
    'w10q-set-2-3': '[[1, 2], [2, 3], [3, 4]]',
    'w10q-set-3-3': '-1',
    'w10q-boss-2': '32',
  };
  let blankRuns = 0;
  for (const q of all) if (q.type === 'fill_blank') {
    const expected = blankExpected[q.id]; assert.notEqual(expected, undefined, `${q.id}: add hand-checked expected output`);
    for (const chip of q.chips) {
      const lines = q.code.map(line => line.replace('___', chip));
      const pkg = `blank${blankRuns}`;
      const source = join(dir, `Blank${blankRuns}.kt`), outJar = join(dir, `Blank${blankRuns}.jar`);
      writeFileSync(source, `package ${pkg}\n${program(lines)}\n`);
      const built = compile([source], outJar);
      if (built.status !== 0) {
        assert.notEqual(chip, q.answer, `${q.id}: answer chip does not compile`);
      } else {
        const ran = java(['-cp', outJar + delimiter + runtime, `${pkg}.Blank${blankRuns}Kt`]);
        assert.equal(ran.status, 0, `${q.id}/${chip}: ${ran.stderr}`);
        if (chip === q.answer) assert.equal(ran.stdout.trimEnd(), expected, `${q.id}: answer output`);
        else assert.notEqual(ran.stdout.trimEnd(), expected, `${q.id}: distractor ${chip} gives the answer output`);
      }
      blankRuns++;
    }
  }

  const errors = all.filter(q => q.type === 'find_error');
  for (const [i, q] of errors.entries()) {
    const pkg = `error${i}`;
    const source = join(dir, `Error${i}.kt`), outJar = join(dir, `Error${i}.jar`);
    writeFileSync(source, `package ${pkg}\n${program((q as { type: 'find_error'; code: string[] }).code)}\n`);
    const built = compile([source], outJar);
    if (q.id === 'w10q-3-8' || q.id === 'w10q-9-8') {
      assert.equal(built.status, 0, `${q.id}: expected an empty-list call to compile`);
      const ran = java(['-cp', outJar + delimiter + runtime, `${pkg}.Error${i}Kt`]);
      assert.notEqual(ran.status, 0, `${q.id}: expected empty reduce to fail at runtime`);
    } else assert.notEqual(built.status, 0, `${q.id}: expected a real Kotlin compile error`);
    if (q.type === 'find_error') assert.ok(Number.isInteger(q.errorLine) && q.errorLine >= 0 && q.errorLine < q.code.length, `${q.id}: invalid marked error line`);
  }
  console.log(`World 10 quiz Kotlin checks passed: ${ids.size} questions, ${predictions.length} exact prediction outputs, ${comparisons.length} A/B comparisons, ${blankRuns} fill-blank choices, ${errors.length} error cases.`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}

/** Verify every World 8 quiz program with the local real Kotlin compiler. */
import assert from 'node:assert/strict';
import { WORLD_8_BOSS_QUIZ, WORLD_8_QUIZ } from '../src/data/quizBank/world8Quiz';
import { WORLD_8_QUIZ_SETS } from '../src/data/quizBank/quizSets';
import { runRealKotlin } from './minikotlin/real-kotlin';

const questions = [...WORLD_8_QUIZ, ...WORLD_8_BOSS_QUIZ];
assert.equal(WORLD_8_QUIZ.length, 146);
assert.equal(WORLD_8_BOSS_QUIZ.length, 12);
assert.deepEqual(['easy','medium','hard'].map((d) => questions.filter((q) => q.difficulty === d).length), [32, 79, 47]);
assert.deepEqual(WORLD_8_QUIZ_SETS.map((set) =>
  WORLD_8_QUIZ.filter((q) => q.setId === set.id || (!q.setId && set.lessonIds.includes(q.lessonId))).length
), [34, 44, 34, 34]);
const cases: { id: string; code: string; kind: 'output' | 'blank' | 'error' | 'comparison'; expected?: string; questionId: string }[] = [];
for (const q of questions) {
  if (q.type === 'predict_output') {
    assert.ok(q.code?.length, q.id + ': missing code');
    cases.push({ id: q.id, code: q.code!.join('\n'), kind: 'output', expected: q.options[q.answer], questionId: q.id });
  } else if (q.type === 'fill_blank') {
    for (const chip of q.chips) cases.push({
      id: q.id + ':' + chip, code: q.code.join('\n').replace('___', chip),
      kind: 'blank', expected: chip === q.answer ? 'correct' : 'wrong', questionId: q.id,
    });
  } else if (q.type === 'find_error') {
    cases.push({ id: q.id, code: q.code.join('\n'), kind: 'error', questionId: q.id });
  } else if (q.type === 'code_comparison') {
    cases.push({ id: q.id + ':A', code: q.a.join('\n'), kind: 'comparison', expected: q.answer === 0 ? 'correct' : 'wrong', questionId: q.id });
    cases.push({ id: q.id + ':B', code: q.b.join('\n'), kind: 'comparison', expected: q.answer === 1 ? 'correct' : 'wrong', questionId: q.id });
  }
}

const result = await runRealKotlin(cases.map(({ id, code }) => ({ id, code })));
const failures: string[] = [];
for (const test of cases) {
  const actual = result.get(test.id);
  if (!actual) { failures.push(test.id + ': no compiler result'); continue; }
  if (test.kind === 'output') {
    if (actual.stage !== 'ok' || actual.output?.trim() !== test.expected)
      failures.push(test.id + ': expected ' + JSON.stringify(test.expected) + ', got ' + actual.stage + ' ' + JSON.stringify(actual.output?.trim()) + ' ' + JSON.stringify(actual.errors));
  } else if (test.kind === 'error') {
    if (actual.stage !== 'compile') failures.push(test.id + ': intended compiler error, got ' + actual.stage);
    else {
      const question = questions.find((q) => q.id === test.questionId);
      if (!question || question.type !== 'find_error' || !actual.errors?.some((message) => message.includes('line ' + (question.errorLine + 2) + ':')))
        failures.push(test.id + ': compiler error does not point to the keyed line; got ' + JSON.stringify(actual.errors));
    }
  } else if (test.expected === 'correct') {
    if (actual.stage !== 'ok') failures.push(test.id + ': answer should compile; got ' + actual.stage + ' ' + JSON.stringify(actual.errors));
    const expectedOutput = ({ 'w8q-vis-8:A': '9', 'w8q-set-design-4:A': 'Result(points=5)' } as Record<string, string>)[test.id];
    if (expectedOutput !== undefined && actual.output?.trim() !== expectedOutput)
      failures.push(test.id + ': expected output ' + JSON.stringify(expectedOutput) + ', got ' + JSON.stringify(actual.output?.trim()));
  } else if (actual.stage === 'ok') {
    const correct = test.kind === 'blank' ? cases.find((other) => other.questionId === test.questionId && other.kind === 'blank' && other.expected === 'correct') : undefined;
    const correctOutput = correct ? result.get(correct.id)?.output?.trim() : undefined;
    if (!correct || actual.output?.trim() === correctOutput)
      failures.push(test.id + ': wrong answer also succeeds with indistinguishable output');
  } else if (test.kind === 'comparison' && actual.stage !== 'compile') {
    failures.push(test.id + ': wrong code should fail compilation; got ' + actual.stage);
  }
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('World 8 real Kotlin quiz checks passed: ' + cases.length + ' program variants.');
}

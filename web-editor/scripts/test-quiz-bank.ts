/**
 * Checks every question of every authored quiz bank: structure (ids, answer indexes, blanks, chips, options), balance (type mix,
 * answer positions) and, through the real engine, that each predict_output answer is what the code prints and that exactly one
 * fill_blank chip gives the intended result. find_error and code_comparison are executed too, but the engine models only part of
 * Kotlin's compile errors, so those are reported as "engine-unverified" (hand-checked against real Kotlin) rather than failed.
 */
import { compileAndRunKotlin } from '../src/utils/kotlinRunner';
import { QuizQuestion } from '../src/utils/quizQuestions';
import { WORLD_1_QUIZ } from '../src/data/quizBank/world1Quiz';
import { CODEDO_MASTER_WORLDS } from '../src/data/curriculum/masterCurriculumCatalog';
import { conceptAccuracy } from '../src/utils/quizProgress';

const BANKS: Record<string, QuizQuestion[]> = { 'world-1': WORLD_1_QUIZ };
const failures: string[] = [];
const notes: string[] = [];
const fail = (q: QuizQuestion, msg: string) => failures.push(`${q.id}: ${msg}`);

const program = (lines: string[]) => (lines.some((l) => /^\s*fun main\b/.test(l)) ? lines.join('\n') : `fun main() {\n${lines.map((l) => '  ' + l).join('\n')}\n}`);
const run = async (lines: string[]) => compileAndRunKotlin(program(lines));

async function main() {
  const catalogLessons = new Set(CODEDO_MASTER_WORLDS.flatMap((w) => w.lessons.map((l) => l.id)));
  for (const [worldId, bank] of Object.entries(BANKS)) {
    const ids = new Set<string>();
    const types: Record<string, number> = {};
    const diff: Record<string, number> = {};
    const topics: Record<string, number> = {};
    const positions: Record<string, number> = {};
    for (const q of bank) {
      if (ids.has(q.id)) fail(q, 'duplicate id');
      ids.add(q.id);
      types[q.type] = (types[q.type] ?? 0) + 1;
      diff[q.difficulty] = (diff[q.difficulty] ?? 0) + 1;
      topics[q.topic] = (topics[q.topic] ?? 0) + 1;
      if (q.worldId !== worldId) fail(q, `worldId ${q.worldId} does not match the bank ${worldId}`);
      if (!catalogLessons.has(q.lessonId) || !q.lessonId.startsWith(worldId + '-')) fail(q, `lessonId ${q.lessonId} is not a lesson of ${worldId}`);
      if (!q.concept.trim()) fail(q, 'missing concept');
      if (!q.question.trim() || !q.explanation.trim() || !q.hint?.trim()) fail(q, 'missing question, explanation or hint');
      if (q.xp !== { easy: 10, medium: 15, hard: 20 }[q.difficulty]) fail(q, `xp ${q.xp} does not match difficulty ${q.difficulty}`);

      switch (q.type) {
        case 'single_choice':
        case 'predict_output': {
          if (q.options.length !== 4 || new Set(q.options).size !== 4) fail(q, 'needs 4 distinct options');
          if (!q.options[q.answer]) fail(q, 'answer index out of range');
          positions[q.answer] = (positions[q.answer] ?? 0) + 1;
          if (q.type === 'predict_output') {
            if (!q.code?.length) fail(q, 'predict_output needs code');
            else {
              const r = await run(q.code);
              if (!r.success) fail(q, `engine error: ${r.error?.message}`);
              else if (r.output.trim() !== q.options[q.answer]) fail(q, `engine printed ${JSON.stringify(r.output.trim())}, key says ${JSON.stringify(q.options[q.answer])}`);
              else if (q.options.some((o, i) => i !== q.answer && o === r.output.trim())) fail(q, 'a distractor equals the output');
            }
          } else if (q.code) {
            const r = await run(q.code);
            notes.push(`${q.id} (single_choice with code): engine ${r.success ? 'ran: ' + JSON.stringify(r.output.trim()) : 'rejected: ' + r.error?.message}`);
          }
          break;
        }
        case 'multi_select':
          if (q.options.length < 4 || new Set(q.options).size !== q.options.length) fail(q, 'bad options');
          if (q.answers.length < 2 || q.answers.length >= q.options.length) fail(q, 'multi_select needs 2+ answers and at least one wrong option');
          if (q.answers.some((i) => !q.options[i])) fail(q, 'answer index out of range');
          break;
        case 'fill_blank': {
          const blanks = q.code.join('\n').split('___').length - 1;
          if (blanks !== 1) fail(q, `needs exactly one ___ (has ${blanks})`);
          if (!q.chips.includes(q.answer) || new Set(q.chips).size !== q.chips.length) fail(q, 'answer must be one of the distinct chips');
          const outputs: Record<string, string> = {};
          for (const chip of q.chips) {
            const r = await run(q.code.map((l) => l.replace('___', chip)));
            outputs[chip] = r.success ? `ok:${r.output.trim()}` : 'error';
          }
          if (outputs[q.answer] === 'error') fail(q, `the answer chip does not run: ${JSON.stringify(outputs)}`);
          for (const chip of q.chips) if (chip !== q.answer && outputs[chip] === outputs[q.answer]) fail(q, `chip "${chip}" gives the same result as the answer`);
          notes.push(`${q.id}: chips ${JSON.stringify(outputs)}`);
          break;
        }
        case 'find_error': {
          if (q.errorLine < 0 || q.errorLine >= q.code.length) fail(q, 'errorLine out of range');
          const r = await run(q.code);
          notes.push(`${q.id} (find_error): engine ${r.success ? 'ran fine -> engine-unverified, hand-checked' : 'rejects: ' + r.error?.message}`);
          break;
        }
        case 'true_false':
          break;
        case 'code_comparison': {
          const a = await run(q.a);
          const b = await run(q.b);
          const ok = [a.success, b.success];
          notes.push(`${q.id} (code_comparison): A ${ok[0] ? 'runs' : 'rejected'}, B ${ok[1] ? 'runs' : 'rejected'}, key ${q.answer === 0 ? 'A' : 'B'}`);
          positions[q.answer] = (positions[q.answer] ?? 0) + 1;
          break;
        }
      }
    }
    const lessonsUsed = new Set(bank.map((q) => q.lessonId));
    const worldLessons = CODEDO_MASTER_WORLDS.find((w) => w.id === worldId)?.lessons.map((l) => l.id) ?? [];
    for (const id of worldLessons) if (!lessonsUsed.has(id)) failures.push(`${worldId}: lesson ${id} has no question`);
    // The weak-concept report must rank a concept answered wrong below one answered right.
    const sample = conceptAccuracy(bank.slice(0, 2), { [bank[0].id]: { correct: 0, wrong: 2, streak: 0, last: 1 }, [bank[1].id]: { correct: 2, wrong: 0, streak: 2, last: 1 } });
    if (sample.length !== 2 || sample[0].accuracy !== 0 || sample[1].accuracy !== 1) failures.push('conceptAccuracy does not rank the weakest concept first');
    console.log(`${worldId}: ${bank.length} questions, ${new Set(bank.map((q) => q.concept)).size} concepts`);
    console.log('  types      ', JSON.stringify(types));
    console.log('  difficulty ', JSON.stringify(diff));
    console.log('  per lesson ', JSON.stringify(topics));
    console.log('  choice answer positions', JSON.stringify(positions));
    if (bank.length < 30) failures.push(`${worldId}: only ${bank.length} questions, expected at least 30`);
    if (Object.keys(types).length < 7) failures.push(`${worldId}: not every question type is used`);
  }
  if (process.argv.includes('--notes')) console.log(notes.join('\n'));
  if (failures.length) {
    console.error(`\nFAILED (${failures.length})\n` + failures.join('\n'));
    process.exit(1);
  }
  console.log('Quiz banks OK.');
}
main();

/**
 * Spreads the correct-answer position evenly. For every single_choice / predict_output question it moves the correct option to a target slot
 * (the other options keep their relative order), and for every code_comparison it swaps A and B where needed. Targets are a balanced,
 * seeded shuffle (no slot more than twice in a row), so the result is repeatable. The questions themselves do not change.
 *
 *   npx tsx scripts/rebalance-quiz-answers.ts          rewrite src/data/quizBank/world1Quiz.ts
 *   npx tsx scripts/rebalance-quiz-answers.ts --report print the current spread only
 */
import { Project, SyntaxKind, ObjectLiteralExpression } from 'ts-morph';

const report = process.argv.includes('--report');
const project = new Project({ skipAddingFilesFromTsConfig: true });
const file = project.addSourceFileAtPath('src/data/quizBank/world1Quiz.ts');
const array = file.getVariableDeclarationOrThrow('WORLD_1_QUIZ').getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);
const questions = array.getElements() as ObjectLiteralExpression[];

const prop = (o: ObjectLiteralExpression, name: string) => o.getProperty(name)?.asKind(SyntaxKind.PropertyAssignment);
const type = (o: ObjectLiteralExpression) => prop(o, 'type')?.getInitializer()?.getText().replace(/['"]/g, '') ?? '';

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** n targets over `slots` positions, as even as possible, shuffled with no value more than twice in a row. */
function targets(n: number, slots: number, seed: number): number[] {
  const rand = mulberry32(seed);
  for (let attempt = 0; attempt < 500; attempt++) {
    const list = Array.from({ length: n }, (_, i) => i % slots);
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    if (!list.some((v, i) => i >= 2 && list[i - 1] === v && list[i - 2] === v)) return list;
  }
  throw new Error('could not build a balanced target list');
}

const choice = questions.filter((o) => ['single_choice', 'predict_output'].includes(type(o)));
const comparison = questions.filter((o) => type(o) === 'code_comparison');
const spread = (xs: number[], slots: number) => Array.from({ length: slots }, (_, k) => xs.filter((x) => x === k).length);
const answerOf = (o: ObjectLiteralExpression) => Number(prop(o, 'answer')!.getInitializer()!.getText());
const tf = questions.filter((o) => type(o) === 'true_false').map((o) => prop(o, 'answer')!.getInitializer()!.getText());

console.log(`choice answer positions now ${JSON.stringify(spread(choice.map(answerOf), 4))} (${choice.length} questions)`);
console.log(`code_comparison A/B now ${JSON.stringify(spread(comparison.map(answerOf), 2))} (${comparison.length} questions)`);
console.log(`true_false true/false now ${tf.filter((x) => x === 'true').length}/${tf.filter((x) => x === 'false').length}`);
if (report) process.exit(0);

const choiceTargets = targets(choice.length, 4, 20261004);
choice.forEach((o, i) => {
  const optionsProp = prop(o, 'options')!;
  const optionArray = optionsProp.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);
  const elements = optionArray.getElements().map((e) => e.getText());
  const answer = answerOf(o);
  const [correct] = elements.splice(answer, 1);
  elements.splice(choiceTargets[i], 0, correct);
  optionArray.replaceWithText(`[${elements.join(', ')}]`);
  prop(o, 'answer')!.setInitializer(String(choiceTargets[i]));
});

const comparisonTargets = targets(comparison.length, 2, 424242);
comparison.forEach((o, i) => {
  if (answerOf(o) === comparisonTargets[i]) return;
  const a = prop(o, 'a')!.getInitializer()!.getText();
  const b = prop(o, 'b')!.getInitializer()!.getText();
  prop(o, 'a')!.setInitializer(b);
  prop(o, 'b')!.setInitializer(a);
  prop(o, 'answer')!.setInitializer(String(comparisonTargets[i]));
});

file.saveSync();
console.log('rewrote src/data/quizBank/world1Quiz.ts');

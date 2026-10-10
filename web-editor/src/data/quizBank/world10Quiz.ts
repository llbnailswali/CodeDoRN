import { emphasizeQuizPrompt, formatQuizCodeQuestion, QuizQuestion } from '../../utils/quizQuestions';

const W = 'world-10';
type Diff = 'easy' | 'medium' | 'hard';
const xp = { easy: 10, medium: 15, hard: 20 } as const;
const lessons = [
  ['map-mapnotnull-filter', 'map, mapNotNull & filter', 'map', 'Transform every item, drop null results, or keep matching original values.'],
  ['filternot-filterisinstance-flatmap', 'filterNot, filterIsInstance & flatMap', 'flatMap', 'Exclude matching values, select a type, or flatten one collection result per input.'],
  ['flatten-reduce-fold', 'flatten, reduce & fold', 'fold', 'Flatten nested lists and accumulate values with or without an initial value.'],
  ['groupby-associate-partition', 'groupBy, associate & partition', 'groupBy', 'Group values by keys, create key/value entries, or split into two lists.'],
  ['zip-chunked-windowed', 'zip, chunked & windowed', 'zip', 'Pair by position, batch values, or create overlapping windows.'],
  ['distinct-sorted', 'distinct & sorted', 'distinct', 'Remove duplicate values and return an ordered copy.'],
  ['sortedby-min-max', 'sortedBy & min / max', 'sortedBy', 'Order by a selected key and find extreme values.'],
  ['sum-average-any-all-none', 'sum / average & any / all / none', 'any', 'Aggregate numbers and test collection-wide predicates.'],
  ['first-find-collection-pipelines-and-chai', 'first / find & Collection pipelines', 'find', 'Find values and trace chained collection transformations.'],
] as const;
const lid = (k: string) => `world-10-${k}`;
let cursor = 0;
const choice = (right: string, wrong: string[]) => { const rest = wrong.filter(x => x !== right); while (rest.length < 3) rest.push(`Not ${right}`); const answer = cursor++ % 4; rest.splice(answer, 0, right); return { options: rest, answer }; };
const code = (body: string[]) => ['fun main() {', ...body.map(x => `  ${x}`), '}'];
const make = (id: string, lessonId: string, t: string, concept: string, difficulty: Diff, question: string, explanation: string, hint: string, type: string, data: Record<string, unknown>, setId?: string): QuizQuestion => formatQuizCodeQuestion({ id, worldId: W, lessonId, topic: t, concept, difficulty, xp: xp[difficulty], question: emphasizeQuizPrompt(W, question), explanation, hint, type, ...data, ...(setId ? { setId } : {}) } as QuizQuestion);

const lessonQuestions: QuizQuestion[] = lessons.flatMap(([key, t, syntax, rule], index) => {
  const lessonId = lid(key); const base = `w10q-${index + 1}`;
  const mk = (n: number, d: Diff, c: string, q: string, e: string, h: string, type: string, data: Record<string, unknown>) => make(`${base}-${n}`, lessonId, t, c, d, q, e, h, type, data);
  const outputs = ['[4, 6, 8]', '[2, 4, 6]', '10', '{1=[1, 3], 0=[2]}', '[[1, 2], [3, 4]]', '[1, 2, 3]', '[2, 3, 1]', 'true', '6'];
  const out = outputs[index];
  const examples = [
    ['val values = listOf(1, 2, 3)', 'println(values.map { it + 3 })'],
    ['val values: List<Any> = listOf(1, "x", 2)', 'println(values.filterIsInstance<Int>())'],
    ['val values = listOf(listOf(1, 2), listOf(3, 4))', 'println(values.flatten().sum())'],
    ['val values = listOf(1, 2, 3)', 'println(values.groupBy { it % 2 })'],
    ['val values = listOf(1, 2, 3, 4)', 'println(values.chunked(2))'],
    ['val values = listOf(2, 1, 2, 3)', 'println(values.distinct().sorted())'],
    ['val values = listOf(1, 3, 2)', 'println(values.sortedBy { -it })'],
    ['val values = listOf(2, 4, 6)', 'println(values.all { it % 2 == 0 })'],
    ['val values = listOf(2, 4, 6)', 'println(values.filter { it > 3 }.sum())'],
  ];
  return [
    mk(1, 'easy', `${t} purpose`, `What is the main purpose of ${syntax}?`, rule, 'Recall the operation’s central behavior.', 'single_choice', choice(rule, ['It always changes the source list.', 'It only works on Strings.', 'It creates a random result.'])),
    mk(2, 'easy', `${t} rule`, `True or false: ${syntax} is a collection operation.`, rule, 'Decide whether the operation belongs to this lesson.', 'true_false', { answer: true }),
    mk(3, 'medium', `${t} output`, 'What does this code print?', `The operation produces ${out}.`, 'Trace the collection after the operation.', 'predict_output', { ...choice(out, ['[]', '[0]', 'Error']), code: code(examples[index]), monoOptions: true }),
    mk(4, 'medium', `${t} syntax`, `Which operation is central to ${t.toLowerCase()}?`, `${syntax} is the key operation introduced here.`, 'Look for the operation named by the lesson.', 'single_choice', choice(syntax, ['println', 'while', '!!'])),
    mk(5, 'medium', `${t} shape`, 'What kind of result does the operation produce?', rule, 'Focus on the shape: list, map, pair, Boolean, or scalar.', 'single_choice', choice(rule, ['Always a Boolean', 'Always a single String', 'Always the original collection'])),
    mk(6, 'medium', `${t} trace`, 'What prints after this pipeline?', 'Collection operations run in the order written, and each result becomes the next input.', 'Read the pipeline from left to right.', 'predict_output', { ...choice('6', ['3', '[6]', 'Error']), code: code(['val values = listOf(1, 2, 3)','println(values.map { it * 2 }.filter { it > 3 }.sum())']), monoOptions: true }),
    mk(7, 'medium', `${t} facts`, 'Select every correct statement.', `${t} is useful for shaping or analyzing collection data.`, 'Choose statements that match collection-operation behavior.', 'multi_select', { options: [rule, 'The lambda determines how values are processed.', 'Every operation mutates the source collection.', 'The result shape matters for the next operation.'], answers: [0, 1, 3] }),
    mk(8, 'hard', `${t} error location`, 'Tap the line that does not follow the operation’s contract.', 'The marked call supplies the wrong kind of lambda or result for the operation.', 'Check the expected lambda result and collection shape.', 'find_error', { code: code(['val values = listOf(1, 2, 3)','val result = values.filter { it + 1 }','println(result)']), errorLine: 2, errorNote: 'filter needs a predicate that returns Boolean.' }),
    mk(9, 'hard', `${t} comparison`, 'Which version uses the operation correctly?', 'The first version uses a Boolean predicate and preserves the expected collection shape.', 'Compare the lambda result with the operation contract.', 'code_comparison', { a: code(['val values = listOf(1, 2, 3)','println(values.filter { it > 1 })']), b: code(['val values = listOf(1, 2, 3)','println(values.filter { it + 1 })']), answer: 0 }),
    mk(10, 'hard', `${t} pipeline`, 'Select every true statement.', 'A collection pipeline must respect each operation’s input and output shape.', 'Check transformation, selection, and ordering separately.', 'multi_select', { options: [rule, 'The next operation receives the previous result.', 'A filter changes every element into a new value.', 'The operation can be combined with other collection operations.'], answers: [0, 1, 3] }),
  ];
});

const sets = [
  ['w10-set-transform-select', 'Transform & Select', ['map-mapnotnull-filter', 'filternot-filterisinstance-flatmap', 'flatten-reduce-fold']],
  ['w10-set-organize-pair', 'Organize & Pair', ['groupby-associate-partition', 'zip-chunked-windowed', 'distinct-sorted']],
  ['w10-set-analyze-pipeline', 'Analyze & Pipeline', ['sortedby-min-max', 'sum-average-any-all-none', 'first-find-collection-pipelines-and-chai']],
] as const;
const setQuestions = sets.flatMap(([setId, title, keys], index) => {
  const last = lid(keys[keys.length - 1]); const base = `w10q-set-${index + 1}`;
  const mk = (n: number, d: Diff, c: string, q: string, e: string, h: string, type: string, data: Record<string, unknown>) => make(`${base}-${n}`, last, title, c, d, q, e, h, type, data, setId);
  return [
    mk(1, 'easy', 'Combined operation', `Which idea belongs in ${title}?`, `This set combines ${keys.join(', ')}.`, 'Recall the operations practised together.', 'single_choice', choice(title, ['Null assertions', 'Class inheritance', 'Loop control'])),
    mk(2, 'medium', 'Combined pipeline', 'What does this pipeline print?', 'The values are transformed, filtered, and then summed in order.', 'Trace each intermediate collection.', 'predict_output', { ...choice('10', ['6', '4', 'Error']), code: code(['val values = listOf(1, 2, 3, 4)','println(values.map { it * 2 }.filter { it > 4 }.sum())']), monoOptions: true }),
    mk(3, 'medium', 'Result shape', 'Complete the operation that keeps values larger than 2.', 'filter needs a predicate and returns the matching values.', 'Use the operation that selects original values.', 'fill_blank', { code: code(['val values = listOf(1, 2, 3)','println(values.___ { it > 2 })']), chips: ['filter', 'map', 'sum', 'zip'], answer: 'filter' }),
    mk(4, 'hard', 'Combined trace', 'What is the final result?', 'The pipeline removes duplicates, sorts the values, and selects the first result.', 'Trace the pipeline from left to right.', 'predict_output', { ...choice('1', ['2', '3', 'Error']), code: code(['val values = listOf(3, 1, 3, 2)','println(values.distinct().sorted().first())']), monoOptions: true }),
  ];
});

const bossQuestions: QuizQuestion[] = Array.from({ length: 12 }, (_, i) => {
  const n = i + 1; const d: Diff = n <= 2 ? 'easy' : n <= 8 ? 'medium' : 'hard'; const answer = n % 2 ? '10' : '6';
  return make(`w10q-boss-${n}`, 'world-10-boss', 'Data Transformation Engine', `Dataset pipeline ${n}`, d, 'What does this data pipeline print?', 'The pipeline transforms the values, keeps the selected results, and calculates the final sum.', 'Trace each collection operation in order.', 'predict_output', { ...choice(answer, answer === '10' ? ['6', '4', 'Error'] : ['10', '4', 'Error']), code: code(['val scores = listOf(1, 2, 3, 4)','val result = scores.map { it * 2 }.filter { it > ' + (n % 2 ? '4' : '2') + ' }.sum()','println(result)']), monoOptions: true });
});

export const WORLD_10_QUIZ: QuizQuestion[] = [...lessonQuestions, ...setQuestions];
export const WORLD_10_BOSS_QUIZ: QuizQuestion[] = bossQuestions;

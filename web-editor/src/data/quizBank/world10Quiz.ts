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
const swapAB = (text: string) => text.replace(/\bA\b/g, '__ANSWER_A__').replace(/\bB\b/g, 'A').replace(/__ANSWER_A__/g, 'B');
let cursor = 0;
const choice = (right: string, wrong: string[]) => { const rest = wrong.filter(x => x !== right); while (rest.length < 3) rest.push(`Not ${right}`); const answer = cursor++ % 4; rest.splice(answer, 0, right); return { options: rest, answer }; };
const multiPositionCounts = [0, 0, 0, 0];
const balancedMulti = (options: string[], answers: number[]) => {
  let bestRotation = 0, bestScore = Infinity;
  for (let rotation = 0; rotation < 4; rotation++) {
    const next = [...multiPositionCounts];
    for (const answer of answers) next[(answer + rotation) % 4]++;
    const score = next.reduce((sum, count) => sum + count * count, 0);
    if (score < bestScore) { bestScore = score; bestRotation = rotation; }
  }
  const reordered = Array<string>(4);
  options.forEach((option, index) => { reordered[(index + bestRotation) % 4] = option; });
  const reorderedAnswers = answers.map(answer => (answer + bestRotation) % 4);
  for (const answer of reorderedAnswers) multiPositionCounts[answer]++;
  return { options: reordered, answers: reorderedAnswers };
};
const code = (body: string[]) => ['fun main() {', ...body.map(x => `  ${x}`), '}'];
const plainEnglish = (text: string) => text
  .replaceAll('Tap the line that fails at compile time or runtime.', 'Tap the line that does not compile or crashes when run.')
  .replaceAll('the operation’s central behavior', 'what the operation does')
  .replaceAll('the operation contracts and returned values', 'what each operation does and returns')
  .replaceAll('operation’s input, output, and empty-input behavior', 'what each operation needs and returns')
  .replaceAll('Check the what', 'Check what')
  .replaceAll('its change returns null', 'the result is null')
  .replaceAll('change returns null', 'the result is null')
  .replaceAll('changeed', 'changed')
  .replaceAll('changeing', 'changing')
  .replaceAll('an collection', 'a collection')
  .replaceAll('the change overload of `zip`', 'the `zip` version that uses a lambda')
  .replaceAll('change result', 'result after the change')
  .replaceAll('These lessons cover changing, selecting, and accumulating collection values.', 'These lessons show how to change, choose, and add up collection values.')
  .replaceAll('initial accumulator', 'starting total')
  .replaceAll('fold(initial)', '`fold` with a starting value')
  .replaceAll('initial element', 'starting item')
  .replaceAll('initial-value slot', 'starting value')
  .replaceAll('at runtime', 'when run')
  .replaceAll('throws at runtime', 'crashes when run')
  .replaceAll('throws when run', 'crashes when run')
  .replaceAll('is nullable', 'can return null')
  .replaceAll('can be null', 'can return null')
  .replaceAll('nullable numbers', 'numbers that may be null')
  .replaceAll('initialize Int', 'be stored in an Int variable')
  .replaceAll('initializes Int', 'stores a value in an Int variable')
  .replaceAll('Pipelines', 'chains of operations')
  .replaceAll('transformations', 'changes')
  .replaceAll('transformation', 'change')
  .replaceAll('transformed', 'changed')
  .replaceAll('transforming', 'changing')
  .replaceAll('transform returns null', 'the result is null')
  .replaceAll('The transform overload of `zip`', 'The `zip` version that uses a lambda')
  .replaceAll('an iterable', 'a list')
  .replaceAll('transforming operation', 'operation that changes values')
  .replaceAll('truncated', 'cut off')
  .replaceAll('truncate', 'cut off')
  .replaceAll('dropping the decimal part and returning Int', 'cutting off the decimal part and returning Int')
  .replaceAll('iterable', 'collection')
  .replaceAll('runtime types', 'types of values')
  .replaceAll('nullable variants', 'versions that return null')
  .replaceAll('vacuously true for empty input', 'also true for an empty list because no item fails the test')
  .replaceAll('needs non-empty input', 'needs at least one item')
  .replaceAll('does not overlap', 'keeps groups separate')
  .replaceAll('non-overlapping', 'separate')
  .replaceAll('truncating to Int', 'dropping the decimal part and returning Int')
  .replaceAll('result shape', 'kind of result')
  .replaceAll('intermediate collection', 'collection between steps')
  .replaceAll('intermediate collections', 'collections between steps')
  .replaceAll('intermediate result', 'result between steps')
  .replaceAll('pipeline', 'chain of operations')
  .replaceAll('transform', 'change')
  .replaceAll('accumulator', 'running total')
  .replaceAll('initial value', 'starting value')
  .replaceAll('predicate', 'test')
  .replaceAll('encounter order', 'original order')
  .replaceAll('truncates at', 'stops at')
  .replaceAll('disjoint batches', 'separate groups')
  .replaceAll('selector', 'lambda')
  .replaceAll('its the result is null', 'the result is null')
  .replaceAll('The change overload of `zip`', 'The `zip` version that uses a lambda')
  .replaceAll('cut offs at', 'stops at')
  .replaceAll('Statements 1, 2, and 4 are true. ', '')
  .replaceAll('The first, second, and fourth are true. ', '')
  .replaceAll('Statements 2 and 3 are true. ', '')
  .replaceAll('The second and fourth are true. ', '')
  .replaceAll('The first two are true. ', '')
  .replaceAll('Statements 1, 3, and 4 are true. ', '')
  .replaceAll('Statements 1, 2, and 4 are correct. ', '')
  .replaceAll('`map` preserves nested results; `flatMap` joins them.', '`filterNot` keeps items that fail its test. `filterIsInstance` selects matching values without converting them. `flatMap` joins returned lists, unlike `map`.')
  .replaceAll('`flatten` removes one level. `reduce` fails on an empty list because it has no first item.', '`flatten()` removes one nesting level, not every level. `reduce` starts with the first item and needs a non-empty list; `fold(0)` can return 0 for an empty list.')
  .replaceAll('chains of operations evaluate left to right.', '`find` returns null when nothing matches; `first` throws. Each call in a chain receives the previous call’s result, from left to right.')
  .replaceAll('What does this change print?', 'What does this code print?')
  .replaceAll('What does this window chain of operations print?', 'What does this code print?')
  .replaceAll('expects each change to return', 'expects each lambda to return')
  .replaceAll('B gives `filter` an Int? instead of a Boolean.', 'B gives `filter` a number or null, but it needs true or false.')
  .replaceAll('fractional averages are preserved rather than cut off.', 'averages can keep digits after the decimal point.')
  .replaceAll('Declare Double or infer the type.', 'Use Double, or remove `Int` and let Kotlin choose the type.')
  .replaceAll('A Pair: matches first, non-matches second, preserving original order.', 'It returns two lists: matches first, then non-matches. Both keep their original order.')
  .replaceAll('`partition` returns a Pair: matches first, non-matches second, preserving original order.', '`partition` returns two lists: matches first, then non-matches. Both keep their original order.')
  .replaceAll('A Pair has `first` and `second`, not `third`; the selected key is unresolved.', 'A Pair has `first` and `second`, not `third`. Use one of those values to sort the pairs.')
  .replaceAll('changed values', 'values that are not null')
  .replaceAll('one changed result per input', 'one result for each input')
  .replaceAll('null change results', 'results that are null')
  .replaceAll('`map` changes, `mapNotNull` changes and drops nulls, and `filter` selects originals using a Boolean test.', '`map` changes each item. `mapNotNull` changes each item and skips null results. `filter` keeps items that pass a true-or-false test.')
  .replaceAll('adds values that are not null and skips null results; unlike `map`, it may return fewer items.', 'keeps values that are not null. It skips null results, so it may return fewer items than `map`.')
  .replaceAll('adds non-null values that are not null and skips null results; unlike `map`, it may return fewer items.', 'keeps values that are not null. It skips null results, so it may return fewer items than `map`.')
  .replaceAll('Int, cut off toward zero.', 'Int, without the decimal part.')
  .replaceAll('`associate` expects each lambda to return a Pair<K, V>; this returns only Int. Use `groupBy` to group by a key.', '`associate` needs each lambda to return a key and a value together. This one returns only an Int. Use `groupBy` to group by a key.')
  .replaceAll('source list', 'original list')
  .replaceAll('`filter` returns the test result for each input.', '`filter` returns true or false for each item.')
  .replaceAll('The first, second, and fourth are true. `filter` returns matching inputs; `map` is the transforming operation.', '`map` returns one result per input, while `mapNotNull` can return fewer. `filter` keeps matching original items; its test returns true or false.')
  .replaceAll('`flatMap` flattens its returned collections instead of preserving nesting.', '`filterNot` keeps items that fail its test; `filterIsInstance` selects values that already have the requested type. `flatMap` joins returned lists into one list.')
  .replaceAll('keeps values that are not null. It skips null results, so it may return fewer items than `map`.', 'keeps each non-null result from its lambda. It skips null results, so it may return fewer items than `map`.')
  .replaceAll('`map` changes each item once. `filter` only selects items; the other two can change how many items remain.', '`map` changes each item and returns one result for it. `filter` keeps matching original items; `mapNotNull` can skip null results, and `flatMap` can return several results for one item.')
  .replaceAll('`flatMap` expects a list result, but `it + 1` is Int. Use `map` for one Int per input.', '`flatMap` expects a collection of results, but `it + 1` is one Int. Use `map` for one Int per input.')
  .replaceAll('The first, second, and fourth are true. `map` preserves nested results; `flatMap` joins them.', '`filterNot` keeps items that fail its test. `filterIsInstance` selects matching values without converting them. `flatMap` joins returned lists, unlike `map`.')
  .replaceAll('The second and fourth are true. `flatten` removes one level. `reduce` fails on an empty list because it has no first item.', '`flatten()` removes one nesting level, not every level. `reduce` starts with the first item and needs a non-empty list; `fold(0)` can return 0 for an empty list.')
  .replaceAll('Statements 1, 2, and 4 are correct. Pipelines evaluate left to right.', '`find` returns null when nothing matches; `first` throws. Each call in a chain receives the previous call’s result, from left to right.')
  .replaceAll('Statements 1, 2, and 4 are correct. chains of operations evaluate left to right.', '`find` returns null when nothing matches; `first` throws. Each call in a chain receives the previous call’s result, from left to right.')
  .replaceAll('an starting value', 'a starting value')
  .replaceAll('starts from a starting value', 'uses 0 as its starting value');
const make = (id: string, lessonId: string, t: string, concept: string, difficulty: Diff, question: string, explanation: string, hint: string, type: string, data: Record<string, unknown>, setId?: string): QuizQuestion => formatQuizCodeQuestion({
  id, worldId: W, lessonId, topic: t, concept, difficulty, xp: xp[difficulty],
  question: emphasizeQuizPrompt(W, plainEnglish(question)), explanation: plainEnglish(explanation), hint: plainEnglish(hint), type,
  ...data,
  ...(Array.isArray(data.options) ? { options: data.options.map(option => typeof option === 'string' ? plainEnglish(option) : option) } : {}),
  ...(typeof data.errorNote === 'string' ? { errorNote: plainEnglish(data.errorNote) } : {}),
  ...(setId ? { setId } : {}),
} as QuizQuestion);

const lessonQuestions: QuizQuestion[] = lessons.flatMap(([key, t, syntax, rule], index) => {
  const lessonId = lid(key); const base = `w10q-${index + 1}`;
  const mk = (n: number, d: Diff, c: string, q: string, e: string, h: string, type: string, data: Record<string, unknown>) => make(`${base}-${n}`, lessonId, t, c, d, q, e, h, type, data);
const outputs = ['[4, 5, 6]', '[1, 2]', '10', '{1=[1, 3], 0=[2]}', '[[1, 2], [3, 4]]', '[1, 2, 3]', '[3, 2, 1]', 'true', '10'];
const truthStatements = [
  '`map` returns one result for each input item.',
  '`flatMap` keeps a separate nested list for each input.',
  '`reduce` can total an empty list without a starting value.',
  '`groupBy` keeps all items with the same key in a list.',
  '`zip` pairs items at matching positions and stops at the shorter list.',
  '`distinct` sorts values into ascending order.',
  '`sortedBy` orders items using the key returned by its lambda.',
  '`any` is true only when every item passes its test.',
  '`find` returns null when no item passes its test.',
];
const truthAnswers = [true, false, false, true, true, false, true, false, true];
const truthExplanations = [
  '`map` runs its lambda once for each input and returns one result each time.',
  '`flatMap` joins the lists returned by its lambda into one list.',
  '`reduce` needs a first item to start; `fold` can use a starting value on an empty list.',
  '`groupBy` puts every item with the same key into that key’s list.',
  '`zip` pairs matching positions and stops when either list runs out.',
  '`distinct` removes later repeats but keeps first-seen order. Use `sorted` to order values.',
  'The lambda result is the sort key.',
  '`any` needs just one item to pass; `all` requires every item to pass.',
  '`find` returns null when no item passes; `first` throws in that case.',
];
const focusedRecognition = [
  { question:'Which operation keeps original items only when their test is true?', right:'filter', wrong:['map','mapNotNull','flatMap'], why:'`filter` keeps matching input items. `map` changes each item, `mapNotNull` can skip null results, and `flatMap` joins returned lists.' },
  { question:'Which operation selects values that already have a requested type?', right:'filterIsInstance', wrong:['filterNot','flatMap','map'], why:'`filterIsInstance` selects values that already have that type. It does not convert values; `filterNot` checks a test and the other calls change or join results.' },
  { question:'Which operation starts from the first item and needs a non-empty list?', right:'reduce', wrong:['fold','flatten','map'], why:'`reduce` starts with the first item. `fold` uses a starting value, while `flatten` joins inner lists and `map` changes each item.' },
  { question:'Which operation returns matching items first and the rest second?', right:'partition', wrong:['groupBy','associate','zip'], why:'`partition` returns two lists: matches, then non-matches. `groupBy` returns a map of lists; `associate` returns key/value entries.' },
  { question:'Which operation pairs items from two lists by matching positions?', right:'zip', wrong:['windowed','chunked','distinct'], why:'`zip` pairs items from two lists at the same position and stops at the shorter list. `windowed` and `chunked` make groups from one list.' },
  { question:'Which operation returns a new list in ascending order?', right:'sorted', wrong:['distinct','sortedBy','map'], why:'`sorted` returns an ordered copy. `distinct` removes repeats without sorting; `sortedBy` needs a key, and `map` changes each item.' },
  { question:'Which call returns the smallest item, or null for an empty list?', right:'minOrNull', wrong:['maxOrNull','sortedBy','min'], why:'`minOrNull` returns the smallest item, or null when the list is empty. `maxOrNull` looks for the largest; `sortedBy` orders a list.' },
  { question:'Which test is true only when no item passes its condition?', right:'none', wrong:['any','all','sum'], why:'`none` is true when zero items pass. `any` needs one match; `all` checks every item, and `sum` adds numbers.' },
  { question:'Which call throws if no item passes its condition?', right:'first', wrong:['find','filter','sum'], why:'`first` throws when there is no match. `find` returns null, `filter` returns an empty list, and `sum` totals numbers.' },
];
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
  const exampleWhy = [
    'The lambda adds 3 to each of 1, 2, and 3, producing 4, 5, and 6.',
    '`filterIsInstance<Int>()` retains the existing Int elements 1 and 2; it does not convert the String "x".',
    '`flatten()` joins the two inner lists into [1, 2, 3, 4], and `sum()` totals them to 10.',
    '`groupBy` uses remainder as the key: 1 and 3 map to key 1, while 2 maps to key 0.',
    '`chunked(2)` takes consecutive non-overlapping groups of two, including both full groups.',
    '`distinct()` leaves [2, 1, 3] in first-seen order; `sorted()` then returns [1, 2, 3].',
    '`sortedBy { -it }` orders the negative keys ascending, which puts the original values in descending order: [3, 2, 1].',
    '`all` is true because every value in the list is even.',
    'The filter keeps 4 and 6; `sum()` adds them to 10.',
  ];
  const exampleWrong = [
    ['[3, 4, 5]','[1, 2, 3]','Error'], ['[1, 2, 6]','["x"]','[2, 4, 6]'], ['20','[[1, 2], [3, 4]]','Error'],
    ['{1=[1], 0=[2], 1=[3]}','[1, 2, 3]','Error'], ['[[1, 2], [3]]','[[1, 2], [2, 3], [3, 4]]','[1, 2, 3, 4]'],
    ['[1, 2, 2, 3]','[2, 1, 3]','[1, 2]'], ['[1, 2, 3]','[2, 3, 1]','Error'], ['false','[2, 4, 6]','Error'], ['6','[4, 6]','Error'],
  ];
  const focused = [
    { shapeQ:'What does `mapNotNull` do when its transform returns null?', shape:'It omits that input from the result.', shapeWrong:['It keeps the null.','It mutates the source list.','It keeps only null inputs.'], shapeWhy:'`mapNotNull` adds non-null transformed values and skips null results; unlike `map`, it may return fewer items.', traceQ:'What does this transformation print?', trace:['val labels = listOf("4", "x", "6")','println(labels.mapNotNull { it.toIntOrNull() }.sum())'], traceOut:'10', traceWrong:['4','6','Error'], traceWhy:'The parses are 4, null, and 6; `mapNotNull` drops null, then `sum()` returns 10.', facts:['`map` returns one transformed result per input.','`mapNotNull` drops null transform results.','`filter` returns the predicate result for each input.','`filter` keeps matching original elements.'], factsWhy:'`map` transforms, `mapNotNull` transforms and drops nulls, and `filter` selects originals using a Boolean predicate.', err:['val values = listOf(1, 2, 3)','val result = values.filter { it + 1 }','println(result)'], errWhy:'`filter` requires a Boolean predicate; `it + 1` is Int. Use `map` to transform numbers.', compareQ:'Which program drops failed numeric parses?', compareWhy:'A uses `mapNotNull` to discard the null parse for "x". B gives `filter` an Int? instead of a Boolean.', compareA:code(['val texts = listOf("2", "x")','println(texts.mapNotNull { it.toIntOrNull() })']), compareB:code(['val texts = listOf("2", "x")','println(texts.filter { it.toIntOrNull() })']), edge:['`map` keeps one output slot per input.','`mapNotNull` may return fewer items than it receives.','`filter` transforms every value into a new value.','A filter predicate returns true or false.'], edgeWhy:'`map` returns one result per input, while `mapNotNull` can return fewer. `filter` keeps matching original items; its test returns true or false.' },
    { shapeQ:'What does `flatMap` return when each input maps to a list?', shape:'One list containing the elements from all returned lists.', shapeWrong:['A list of nested lists.','Only the first returned list.','A map from each input to a list.'], shapeWhy:'`flatMap` maps each input to an iterable and concatenates the results into one flat list.', traceQ:'What does this pipeline print?', trace:['val batches = listOf(listOf<Any>(1, "a"), listOf<Any>("b", 2))','println(batches.flatMap { it }.filterIsInstance<String>())'], traceOut:'[a, b]', traceWrong:['[[a], [b]]','[1, 2]','Error'], traceWhy:'`flatMap` joins the inner lists; `filterIsInstance<String>()` keeps the two String values.', facts:['`filterNot { p }` keeps elements where p is false.','`filterIsInstance<T>()` selects existing T values; it does not convert.','`flatMap` preserves a nested list per input.','`flatMap` joins returned elements into one list.'], factsWhy:'Statements 1, 2, and 4 are true. `flatMap` flattens its returned iterables instead of preserving nesting.', err:['val values = listOf(1, 2, 3)','val result = values.flatMap { it + 1 }','println(result)'], errWhy:'`flatMap` expects an iterable result, but `it + 1` is Int. Use `map` for one Int per input.', compareQ:'Which version produces a flat list of repeated values?', compareWhy:'A uses `flatMap` and joins each two-element result. B uses `map`, so its result stays nested.', compareA:code(['val values = listOf(1, 2)','println(values.flatMap { listOf(it, it) })']), compareB:code(['val values = listOf(1, 2)','println(values.map { listOf(it, it) })']), edge:['`filterNot` keeps elements whose predicate is false.','`filterIsInstance<T>()` selects matching runtime types.','`flatMap` and `map` always return the same nesting.','`flatMap` can expand one input into several outputs.'], edgeWhy:'The first, second, and fourth are true. `map` preserves nested results; `flatMap` joins them.' },
    { shapeQ:'How does `fold` differ from `reduce`?', shape:'`fold` starts with the running total you provide.', shapeWrong:['`reduce` always needs a starting value.','`fold` only works on empty collections.','They always produce the same result.'], shapeWhy:'`fold` starts from your chosen value; `reduce` starts from the first item and needs at least one item.', traceQ:'What does this fold print?', trace:['val values = listOf(2, 4)','println(values.fold(10) { total, n -> total + n })'], traceOut:'16', traceWrong:['6','10','Error'], traceWhy:'The running total starts at 10, then adds 2 and 4, giving 16.', facts:['`flatten()` joins inner lists by one level.','`reduce` starts its running total from the first item.','`reduce` returns a starting value for an empty list.','`fold` can use its starting value on an empty list.'], factsWhy:'`flatten` removes one level. `reduce` starts with the first item and fails on an empty list. `fold` can use its starting value even when the list is empty.', err:['val values = emptyList<Int>()','val total = values.reduce { a, b -> a + b }','println(total)'], errWhy:'`reduce` needs a first item to start its running total. This empty list crashes when run. Use `fold(0)` if the list might be empty.', compareQ:'Which program safely totals an empty list as zero?', compareWhy:'A starts `fold` at 0, so an empty list gives 0. B calls `reduce`, which crashes because there is no first item.', compareA:code(['val values = emptyList<Int>()','println(values.fold(0) { a, b -> a + b })']), compareB:code(['val values = emptyList<Int>()','println(values.reduce { a, b -> a + b })']), edge:['`flatten()` recursively removes every nesting level.','`reduce` starts from the first item.','`reduce` is safe on an empty list.','`fold(0)` can return 0 for an empty list.'], edgeWhy:'The second and fourth are true. `flatten` removes one level. `reduce` fails on an empty list because it has no first item.' },
    { shapeQ:'What shape does `groupBy` produce?', shape:'A map from each key to a list of matching elements.', shapeWrong:['A pair of matching and non-matching lists.','One value per key, overwriting earlier matches.','A flat list of keys only.'], shapeWhy:'`groupBy` stores all values for a key in a list. `partition` returns two lists; `associate` creates key/value entries.', traceQ:'What does `partition` print?', trace:['val values = listOf(1, 2, 3, 4)','println(values.partition { it % 2 == 0 })'], traceOut:'([2, 4], [1, 3])', traceWrong:['{true=[2, 4], false=[1, 3]}','([1, 3], [2, 4])','[2, 4, 1, 3]'], traceWhy:'`partition` returns a Pair: matches first, non-matches second, preserving encounter order.', facts:['`groupBy` maps a key to all matching elements in a list.','`associate` creates key/value entries from elements.','`partition` returns a map from Boolean to lists.','`partition` returns matching and non-matching lists.'], factsWhy:'`groupBy` returns map-to-lists, `associate` makes entries, and `partition` returns two lists rather than a map.', err:['val values = listOf(1, 2, 3)','val grouped = values.associate { it % 2 }','println(grouped)'], errWhy:'`associate` expects each transform to return a Pair<K, V>; this returns only Int. Use `groupBy` to group by a key.', compareQ:'Which operation keeps all values sharing a key together?', compareWhy:'A `groupBy` stores a list for each key. B `associate` creates entries and does not group repeated keys into lists.', compareA:code(['val values = listOf(1, 3, 2)','println(values.groupBy { it % 2 })']), compareB:code(['val values = listOf(1, 3, 2)','println(values.associate { it % 2 to it })']), edge:['`groupBy` can store multiple values under one key.','`associate` keeps duplicate keys as separate map entries.','`partition` returns matching and non-matching lists.','These operations all return the same structure.'], edgeWhy:'`groupBy` returns a map of lists; `partition` returns two lists. Maps cannot retain duplicate keys as separate entries, and the shapes differ.' },
    { shapeQ:'Which operation creates overlapping groups of a fixed size?', shape:'`windowed`', shapeWrong:['`chunked`','`zip`','`distinct`'], shapeWhy:'`windowed(size)` advances one position by default, so adjacent windows overlap; `chunked` makes non-overlapping batches.', traceQ:'What does this window pipeline print?', trace:['val values = listOf(1, 2, 3, 4)','println(values.windowed(2).map { it.sum() })'], traceOut:'[3, 5, 7]', traceWrong:['[3, 7]','[[1, 2], [3, 4]]','[1, 2, 3, 4]'], traceWhy:'The windows are [1,2], [2,3], [3,4]; summing each gives 3, 5, and 7.', facts:['`zip` pairs by position and stops at the shorter input.','`chunked(2)` makes overlapping pairs.','`windowed(2)` overlaps by default.','`chunked(2)` makes non-overlapping batches.'], factsWhy:'`zip` truncates at the shorter list; `windowed` overlaps by default; `chunked` makes disjoint batches.', err:['val left = listOf(1, 2)','val right = listOf(3, 4)','println(left.zip(right) { a -> a })'], errWhy:'The transform overload of `zip` supplies two parameters, one from each list. This lambda declares only one.', compareQ:'Which call creates every overlapping pair?', compareWhy:'A `windowed(2)` returns [1,2], [2,3], [3,4]. B `chunked(2)` returns only [1,2] and [3,4].', compareA:code(['val values = listOf(1, 2, 3, 4)','println(values.windowed(2))']), compareB:code(['val values = listOf(1, 2, 3, 4)','println(values.chunked(2))']), edge:['`zip` invents values when one input is longer.','`chunked(2)` makes non-overlapping groups.','`windowed(2)` overlaps adjacent groups by default.','A final incomplete chunk is discarded by default.'], edgeWhy:'Statements 2 and 3 are true. `zip` stops at the shorter list; `chunked` keeps a final partial group by default.' },
    { shapeQ:'What does `distinct()` do?', shape:'Removes later duplicates while preserving first-occurrence order.', shapeWrong:['Sorts values and removes duplicates.','Mutates the source list in place.','Removes every occurrence of repeated values.'], shapeWhy:'`distinct()` returns a new list with the first occurrence of each value in encounter order; sorting is separate.', traceQ:'What does this expression print?', trace:['val values = listOf(3, 1, 3, 2)','println(values.distinct())'], traceOut:'[3, 1, 2]', traceWrong:['[1, 2, 3]','[3, 1, 3, 2]','[1, 2]'], traceWhy:'The second 3 is removed; the first occurrences stay in their original order.', facts:['`distinct()` keeps first occurrences in encounter order.','`sorted()` returns an ordered list without changing the source.','`distinct()` sorts values automatically.','`sorted()` mutates a read-only source list.'], factsWhy:'`distinct` removes duplicates without sorting; `sorted` returns a new ordered list and leaves the source unchanged.', err:['val values = listOf(3, 1, 2)','val ordered = values.sorted()','ordered.add(4)','println(ordered)'], errWhy:'`sorted()` returns a read-only `List`, which has no `add` method. It does not make the result mutable.', compareQ:'Which result removes duplicates but preserves first-seen order?', compareWhy:'A `distinct()` returns [3,1,2]. B sorts into ascending order and keeps the duplicate.', compareA:code(['val values = listOf(3, 1, 3, 2)','println(values.distinct())']), compareB:code(['val values = listOf(3, 1, 3, 2)','println(values.sorted())']), edge:['`distinct()` preserves first-occurrence order.','`sorted()` returns a new ordered list.','`distinct()` also sorts automatically.','`sorted()` changes a read-only source in place.'], edgeWhy:'The first two are true. Sorting and deduplication are separate, and `sorted()` returns a new list.' },
    { shapeQ:'What does `sortedBy { it.second }` use as the sort key?', shape:'Each Pair’s second value.', shapeWrong:['The list index.','Each Pair’s first value.','The Pair’s string representation.'], shapeWhy:'The selector returns the comparison key; `it.second` orders Pairs by their second component.', traceQ:'Which word is first after sorting by length?', trace:['val words = listOf("pear", "fig", "apple")','println(words.sortedBy { it.length }.first())'], traceOut:'fig', traceWrong:['pear','apple','Error'], traceWhy:'The word lengths are 4, 3, and 5, so ascending length puts `fig` first.', facts:['`sortedBy` orders by the key returned from its selector.','`minOrNull` returns an element, not its index.','`sortedBy` ignores its selector and sorts the whole object.','`maxOrNull` can return null on an empty list.'], factsWhy:'The selector supplies the sort key; min/max return elements, and nullable variants handle empty input.', err:['val pairs = listOf(1 to "a", 2 to "b")','val ordered = pairs.sortedBy { it.third }','println(ordered)'], errWhy:'A Pair has `first` and `second`, not `third`; the selected key is unresolved.', compareQ:'Which version sorts words by length rather than alphabetically?', compareWhy:'A chooses `length` as the sort key. B uses natural String order, which is alphabetical.', compareA:code(['val words = listOf("pear", "fig", "apple")','println(words.sortedBy { it.length })']), compareB:code(['val words = listOf("pear", "fig", "apple")','println(words.sorted())']), edge:['`sortedBy` uses the key returned by its selector.','`minOrNull()` returns the index of the smallest item.','`maxOrNull()` may return null on an empty list.','Sorting by a property mutates the source.'], edgeWhy:'The selector defines the key and `maxOrNull` handles empty input with null. Min returns an element, and sorting returns a new list.' },
    { shapeQ:'What type does `average()` return for an Int list?', shape:'Double', shapeWrong:['Int, truncated toward zero.','Boolean.','The original List<Int>.'], shapeWhy:'`average()` returns Double so fractional averages are preserved rather than truncated.', traceQ:'What does this average print?', trace:['val scores = listOf(2, 4, 7)','println(scores.average())'], traceOut:'4.333333333333333', traceWrong:['4','13','true'], traceWhy:'The total 13 divided by 3 is a Double, approximately 4.333333333333333.', facts:['`sum()` totals numeric elements.','`average()` returns a Double.','`all { p }` means at least one item matches p.','`none { p }` means zero items match p.'], factsWhy:'`sum` totals numbers, `average` returns Double, `all` requires every item to match, and `none` requires no matches.', err:['val scores = listOf(2, 4, 7)','val mean: Int = scores.average()','println(mean)'], errWhy:'`average()` returns Double, which cannot initialize Int. Declare Double or infer the type.', compareQ:'Which predicate is true only when every value is positive?', compareWhy:'A uses `all`, requiring every check to pass. B uses `any`, which needs just one positive value.', compareA:code(['val values = listOf(2, -4, 6)','println(values.all { it > 0 })']), compareB:code(['val values = listOf(2, -4, 6)','println(values.any { it > 0 })']), edge:['`average()` returns Double rather than truncating to Int.','`all` means at least one element matches.','For an empty list, `all { ... }` is true.','`none { p }` is true when no element matches.'], edgeWhy:'Statements 1, 3, and 4 are true. `all` means every element matches (vacuously true for empty input); “at least one” is `any`.' },
    { shapeQ:'What does `find { predicate }` return when nothing matches?', shape:'Null.', shapeWrong:['It throws like `first { predicate }`.','The last element.','An empty list.'], shapeWhy:'`find` returns the first match or null. `first(predicate)` throws when there is no match.', traceQ:'What does this pipeline print when nothing is above 10?', trace:['val values = listOf(2, 4, 6)','println(values.find { it > 10 } ?: -1)'], traceOut:'-1', traceWrong:['null','6','Error'], traceWhy:'No item matches, so `find` returns null and Elvis supplies -1.', facts:['`first()` fails on an empty list.','`find { p }` returns null if no item matches.','Pipelines are evaluated right to left.','Each operation receives the previous result.'], factsWhy:'`first` needs an element; `find` is nullable; a pipeline evaluates left to right and passes each result on.', err:['val values = emptyList<Int>()','val first = values.first()','println(first)'], errWhy:'`first()` throws because an empty list has no element. Use `firstOrNull()` or `find` when absence is expected.', compareQ:'Which call safely represents “no match” as null?', compareWhy:'A `find` returns null when no item matches. B `first(predicate)` throws for the same no-match case.', compareA:code(['val values = listOf(2, 4)','println(values.find { it > 10 })']), compareB:code(['val values = listOf(2, 4)','println(values.first { it > 10 })']), edge:['`find { p }` returns null if no item passes p.','`first { p }` throws if no item passes p.','A collection pipeline is evaluated right to left.','A later operation receives the previous result.'], edgeWhy:'Statements 1, 2, and 4 are correct. Pipelines evaluate left to right.' },
  ][index];
  const choices = [
    { purposeRight:'`map` changes every item and returns one result for each item.', purposeWrong:['`filter` keeps matching items without changing them.','`mapNotNull` skips results that are null.','`flatMap` can return several items for one input.'], purposeWhy:'`map` changes each item once. `filter` only selects items; the other two can change how many items remain.', syntaxWrong:['filter','mapNotNull','flatMap'] },
    { purposeRight:'`flatMap` can turn each item into a list, then joins those lists into one list.', purposeWrong:['`filterNot` keeps items that pass the test.','`filterIsInstance` changes each item to the requested type.','`flatMap` keeps a separate nested list for each item.'], purposeWhy:'`flatMap` joins the lists it creates. `filterNot` keeps items that fail a test, and `filterIsInstance` selects items that already have a type.', syntaxWrong:['filterIsInstance','filterNot','map'] },
    { purposeRight:'`fold` combines the items using a starting value you choose.', purposeWrong:['`flatten` removes every level of nesting.','`reduce` starts from a value you provide.','`fold` only works when the list is empty.'], purposeWhy:'`fold` starts with your chosen value. `reduce` starts with the first item, and `flatten` removes one level of nested lists.', syntaxWrong:['flatten','reduce','map'] },
    { purposeRight:'`groupBy` puts items with the same key into a list.', purposeWrong:['`associate` puts repeated keys into lists.','`partition` returns a map from keys to lists.','`groupBy` returns just two lists: matches and non-matches.'], purposeWhy:'`groupBy` makes a map of lists. `associate` makes key/value entries, while `partition` returns two lists.', syntaxWrong:['associate','partition','zip'] },
    { purposeRight:'`zip` pairs items in the same positions and stops when either list ends.', purposeWrong:['`zip` makes every possible pair, even after one list ends.','`chunked` makes overlapping groups.','`windowed` makes separate groups with no overlap.'], purposeWhy:'`zip` pairs items by position. `chunked` makes separate groups; `windowed` makes groups that overlap.', syntaxWrong:['chunked','windowed','distinct'] },
    { purposeRight:'`distinct` removes repeated values and keeps the first-seen order.', purposeWrong:['`distinct` sorts values but keeps the repeats.','`sorted` removes repeats but keeps the old order.','Both operations change the original list.'], purposeWhy:'`distinct` removes repeats and keeps the first-seen order. `sorted` puts values in order.', syntaxWrong:['sorted','sortedBy','map'] },
    { purposeRight:'`sortedBy` orders items by a value you choose; `min` and `max` find the smallest and largest.', purposeWrong:['`sortedBy` returns the position of the chosen value.','`minOrNull` returns the largest item.','`maxOrNull` crashes on an empty list.'], purposeWhy:'`sortedBy` orders by your chosen value. `min` and `max` return items; the `OrNull` versions return null when the list is empty.', syntaxWrong:['minOrNull','maxOrNull','sorted'] },
    { purposeRight:'`sum` and `average` total numbers; `any`, `all`, and `none` check whether items pass a test.', purposeWrong:['`average` drops the decimal part and returns an Int.','`all` is true when at least one item passes the test.','`none` is true when every item passes the test.'], purposeWhy:'`average` can include a decimal. `all` checks every item, while `any` checks whether at least one passes and `none` checks whether none pass.', syntaxWrong:['sum','average','all'] },
    { purposeRight:'`find` gets the first item that passes a test; a chain of collection calls passes each result to the next call.', purposeWrong:['`find` crashes when no item passes the test.','`first` returns null when no item passes the test.','A chain of collection calls runs from right to left.'], purposeWhy:'`find` returns null when nothing matches. `first` crashes, and each call in a chain runs from left to right.', syntaxWrong:['first','filter','sum'] },
  ][index];
  return [
    mk(1, 'easy', `${t} purpose`, `What is the main purpose of ${syntax}?`, choices.purposeWhy, 'What does this operation do?', 'single_choice', choice(choices.purposeRight, choices.purposeWrong)),
    mk(2, 'easy', `${t} rule`, `True or false: ${truthStatements[index]}`, truthExplanations[index], 'Check what the operation returns or how it behaves.', 'true_false', { answer: truthAnswers[index] }),
    mk(3, 'medium', `${t} output`, 'What does this code print?', exampleWhy[index], 'Trace how the operation changes the input collection.', 'predict_output', { ...choice(out, exampleWrong[index]), code: code(examples[index]), monoOptions: true }),
    mk(4, 'medium', `${t} focused concept`, focusedRecognition[index].question, focusedRecognition[index].why, 'Choose the operation that matches the described behavior.', 'single_choice', choice(focusedRecognition[index].right, focusedRecognition[index].wrong)),
    mk(5, 'medium', `${t} result shape`, focused.shapeQ, focused.shapeWhy, 'Check what the operation returns, not only its name.', 'single_choice', choice(focused.shape, focused.shapeWrong)),
    mk(6, 'medium', `${t} trace`, focused.traceQ, focused.traceWhy, 'Trace each operation in the order written.', 'predict_output', { ...choice(focused.traceOut, focused.traceWrong), code: code(focused.trace), monoOptions: true }),
    mk(7, 'medium', `${t} facts`, `Select the ${index === 5 ? 2 : 3} correct statements.`, focused.factsWhy, 'Check what each operation does and returns.', 'multi_select', balancedMulti(focused.facts, index === 4 ? [0, 2, 3] : index === 5 ? [0, 1] : [0, 1, 3])),
    mk(8, 'hard', `${t} error location`, 'Tap the line that fails at compile time or runtime.', focused.errWhy, 'Check the operation’s input, output, and empty-input behavior.', 'find_error', { code: code(focused.err), errorLine: index === 0 || index === 4 || index === 5 ? 3 : 2, errorNote: focused.errWhy }),
    mk(9, 'hard', `${t} comparison`, focused.compareQ, index % 2 === 0 ? focused.compareWhy : swapAB(focused.compareWhy), 'Compare what each program does and returns.', 'code_comparison', index % 2 === 0 ? { a: focused.compareA, b: focused.compareB, answer: 0 } : { a: focused.compareB, b: focused.compareA, answer: 1 }),
    mk(10, 'hard', `${t} edge cases`, `Select the ${index === 3 || index === 6 ? 2 : index === 4 || index === 5 ? 2 : 3} correct statements.`, focused.edgeWhy, 'Check ordering, empty input, and kind of result where relevant.', 'multi_select', balancedMulti(focused.edge, index === 3 ? [0, 2] : index === 4 ? [1, 2] : index === 5 ? [0, 1] : index === 6 ? [0, 2] : index === 7 ? [0, 2, 3] : [0, 1, 3])),
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
  const s = [
    { easyQ:'These lessons show how to change, choose, and add up list values. Which set groups them?', easyRight:'Transform & Select', easyWrong:['Organize & Pair','Analyze & Pipeline','Loop Control'], easyWhy:'This set covers changing and choosing values, joining nested lists, and adding values together. The other sets cover grouping/pairing or finding and analyzing values.', traceQ:'What does this code print?', trace:code(['val texts = listOf("2", "x", "4")','println(texts.mapNotNull { it.toIntOrNull() }.filter { it > 2 }.flatMap { listOf(it, it + 1) })']), traceOut:'[4, 5]', traceWrong:['[2, 3, 4, 5]','[4]','Error'], traceWhy:'The failed number parse is skipped. Then 2 is removed, and 4 becomes 4 and 5.', blankQ:'Complete the operation that adds up the flattened values to get 6.', blankWhy:'`fold` starts at 0 and adds each item in the flattened list. `reduce` has no starting value.', blankCode:code(['val groups = listOf(listOf(1, 2), listOf(3))','println(groups.flatten().___(0) { total, n -> total + n })']), chips:['fold','reduce','map','filter'], answer:'fold', hardQ:'What does this chain of operations return?', hardWhy:'The first item gives no values. The next items give 2, 20, 3, and 30. `fold` adds them to get 55.', hardCode:code(['val result = listOf(1, 2, 3).flatMap { if (it == 1) emptyList() else listOf(it, it * 10) }.fold(0) { a, n -> a + n }','println(result)']), hardOut:'55', hardWrong:['56','60','Error'] },
    { easyQ:'These lessons group, pair, and split values, make batches, remove repeats, and sort. Which set groups them?', easyRight:'Organize & Pair', easyWrong:['Transform & Select','Analyze & Pipeline','Null Safety'], easyWhy:'This set covers grouping, pairing, splitting, making batches, removing repeats, and sorting.', traceQ:'What does the zipped list print after sorting by the second value?', trace:code(['val names = listOf("A", "B", "C")','val ranks = listOf(3, 1, 2)','println(names.zip(ranks).sortedBy { it.second })']), traceOut:'[(B, 1), (C, 2), (A, 3)]', traceWrong:['[(A, 3), (B, 1), (C, 2)]','[(A, 1), (B, 2), (C, 3)]','Error'], traceWhy:'`zip` pairs items by position. Then `sortedBy { it.second }` puts them in rank order: 1, 2, 3.', blankQ:'Complete the call to make pairs that share one value.', blankWhy:'`windowed(2)` makes pairs that share one value. `chunked(2)` makes separate groups.', blankCode:code(['val values = listOf(1, 2, 3, 4)','println(values.___(2))']), chips:['windowed','chunked','zip','distinct'], answer:'windowed', hardQ:'What is the final list?', hardWhy:'The windows sum to 3, 4, and 5. `distinct` keeps them all, then descending sort gives [5, 4, 3].', hardCode:code(['val values = listOf(1, 2, 2, 3)','println(values.windowed(2).map { it.sum() }.distinct().sortedDescending())']), hardOut:'[5, 4, 3]', hardWrong:['[3, 4, 5]','[3, 5]','Error'] },
    { easyQ:'These lessons sort by a chosen value, check totals and conditions, and find items. Which set groups them?', easyRight:'Analyze & Pipeline', easyWrong:['Transform & Select','Organize & Pair','Class Design'], easyWhy:'This set covers sorting by a chosen value, checking totals and conditions, and finding items.', traceQ:'Which word is printed?', trace:code(['val words = listOf("pear", "fig", "apple")','println(words.sortedBy { it.length }.firstOrNull { it.startsWith("a") } ?: "none")']), traceOut:'apple', traceWrong:['fig','pear','none'], traceWhy:'After sorting by length, `firstOrNull` finds the first word starting with `a`; `apple` matches.', blankQ:'Complete the call so the program prints -1 when no value is above 3.', blankWhy:'`find` returns the first match or null. Elvis (`?:`) then supplies -1; `first` crashes when there is no match.', blankCode:code(['val values = listOf(1, 2, 3)','println(values.___ { it > 3 } ?: -1)']), chips:['find','filter','sum','zip'], answer:'find', hardQ:'What does this chain of operations print?', hardWhy:'Filtering keeps 2 and 4. Sorting by the negative value puts 4 first, so `first()` prints 4.', hardCode:code(['val values = listOf(2, 4, 1, 3)','println(values.filter { it % 2 == 0 }.sortedBy { -it }.first())']), hardOut:'4', hardWrong:['2','6','Error'] },
  ][index];
  return [
    mk(1, 'easy', 'Combined operation', s.easyQ, s.easyWhy, 'Match the operations to their set.', 'single_choice', { ...choice(s.easyRight, s.easyWrong), monoOptions: true }),
    mk(2, 'medium', 'Combined pipeline', s.traceQ, s.traceWhy, 'Trace each intermediate collection.', 'predict_output', { ...choice(s.traceOut, s.traceWrong), code: s.trace, monoOptions: true }),
    mk(3, 'medium', 'Combined result shape', s.blankQ, s.blankWhy, 'Use the operation that returns the required shape.', 'fill_blank', { code: s.blankCode, chips: s.chips, answer: s.answer }),
    mk(4, 'hard', 'Combined edge case', s.hardQ, s.hardWhy, 'Follow the values and their order through every operation.', 'predict_output', { ...choice(s.hardOut, s.hardWrong), code: s.hardCode, monoOptions: true }),
  ];
});

const BOSS_TOPIC = 'Data Transformation Engine';
const boss = (n: number, d: Diff, c: string, q: string, e: string, h: string, type: string, data: Record<string, unknown>) =>
  make(`w10q-boss-${n}`, 'world-10-boss', BOSS_TOPIC, c, d, q, e, h, type, data);

/**
 * Boss quiz: small datasets (orders, scores, names) turned into reports. 12 questions, 1 easy / 5 medium / 6 hard (10/40/50), ordered easy to hard.
 * Every question combines at least two World 10 lessons (or earlier null safety, lambdas and Maps). No question depends on Map or Set order.
 */
const bossQuestions: QuizQuestion[] = [
  boss(1, 'easy', 'Operations that return a Boolean or a list', 'Which operation returns a single true or false for a whole list, instead of a new list?',
    '`any` checks the whole list and returns one Boolean. `map`, `filter` and `sorted` all return a new list.',
    'Look for the result type: Boolean or list.', 'single_choice',
    { ...choice('any', ['map', 'filter', 'sorted']), monoOptions: true }),
  boss(2, 'medium', 'Filter then total', 'Complete the pipeline so it adds up only the prices above 10.',
    '`filter` keeps 12 and 20, the prices above 10, and `sum()` adds them: 32. `map` would give Booleans, which cannot be summed.',
    'Keep the matching prices first, then add them.', 'fill_blank',
    { code: code(['val prices = listOf(5, 12, 8, 20)', 'println(prices.___ { it > 10 }.sum())']), chips: ['filter', 'map', 'count', 'all'], answer: 'filter' }),
  boss(3, 'medium', 'find gives a nullable result', 'What is the type of `orders.find { it > 100 }`?',
    '`find` returns the first matching item, or null when nothing matches, so the type is `Int?`.',
    'What does find return when nothing matches?', 'single_choice',
    { ...choice('Int?', ['Int', 'List<Int>', 'Boolean']), code: ['val orders = listOf(40, 150, 90)'], monoOptions: true }),
  boss(4, 'medium', 'flatMap then filter', 'What does this program print?',
    '`flatMap { it }` joins the three inner lists into one list of five names. The filter keeps the names with two letters, so Ana is removed.',
    'Join the lists first, then filter.', 'predict_output',
    { ...choice('[Bo, Cy, Di, Ed]', ['[Ana, Bo, Cy, Di, Ed]', '[Ana]', '[[Bo], [Cy], [Di, Ed]]']), code: code(['val teams = listOf(listOf("Ana", "Bo"), listOf("Cy"), listOf("Di", "Ed"))', 'val names = teams.flatMap { it }.filter { it.length == 2 }', 'println(names)']), monoOptions: true }),
  boss(5, 'medium', 'fold and reduce on an empty list', 'Which program prints 0 for an empty list?',
    '`fold(0)` starts from an initial value, so an empty list gives 0. `reduce` has no starting value and throws an exception for an empty list.',
    'Which one has a starting value?', 'code_comparison',
    { a: code(['val empty = emptyList<Int>()', 'println(empty.reduce { total, n -> total + n })']), b: code(['val empty = emptyList<Int>()', 'println(empty.fold(0) { total, n -> total + n })']), answer: 1 }),
  boss(6, 'medium', 'partition, max and sorted', 'What does this program print?',
    '`partition` puts scores of 60 or more in the first list: 82, 91, and 67. The other scores are 55 and 40. The largest passing score is 91. The sorted other scores are [40, 55].',
    'First is the matching list, second is the rest.', 'predict_output',
    { ...choice('91\n[40, 55]', ['91\n[55, 40]', '82\n[40, 55]', '67\n[40, 55]']), code: code(['val scores = listOf(55, 82, 40, 91, 67)', 'val split = scores.partition { it >= 60 }', 'println(split.first.maxOrNull())', 'println(split.second.sorted())']), monoOptions: true }),
  boss(7, 'hard', 'Nullable elements cannot be summed', 'Tap the line that does not compile.',
    '`sum()` needs a list of numbers, not a list of nullable numbers. Remove the nulls first (for example with `filterNotNull()`), then sum.',
    'What is the element type of the list?', 'find_error',
    { code: code(['val scores: List<Int?> = listOf(80, null, 90)', 'val total = scores.sum()', 'println(total)']), errorLine: 2, errorNote: 'List<Int?> has no sum(); remove the nulls first.' }),
  boss(8, 'hard', 'groupBy lookup with a fallback', 'What does this program print?',
    'The names are grouped by length. The 2-letter group has Bo and Cy; the 3-letter group has Ana and Bea; the 4-letter group has Alex. There is no 5-letter group, so the lookup gives null. The `?:` fallback gives 0. The program prints 2, 1, and 0.',
    'A missing key gives null, and the fallback replaces it.', 'predict_output',
    { ...choice('2\n1\n0', ['2\n1\nnull', '3\n1\n0', '2\n1\nError']), code: code(['val names = listOf("Ana", "Bo", "Alex", "Cy", "Bea")', 'val groups = names.groupBy { it.length }', 'println(groups[2]?.size ?: 0)', 'println(groups[4]?.size ?: 0)', 'println(groups[5]?.size ?: 0)']), monoOptions: true }),
  boss(9, 'hard', 'distinct, sorted, windowed and chunked', 'Given `val nums = listOf(3, 1, 3, 2)`, select the 2 true statements.',
    '`distinct()` keeps the first copy of each value: [3, 1, 2]. `windowed(2)` makes three pairs that share values. `sorted()` returns a new list and leaves `nums` unchanged. `chunked(3)` makes two groups: [3, 1, 3] and [2].',
    'Count the windows and chunks by hand.', 'multi_select',
    { ...balancedMulti(['nums.distinct() is [3, 1, 2]', 'nums.sorted() changes nums to [1, 2, 3, 3]', 'nums.windowed(2) has 3 windows', 'nums.chunked(3) has 3 chunks'], [0, 2]), monoOptions: true }),
  boss(10, 'hard', 'average returns a Double', 'Tap the line that does not compile.',
    '`average()` returns a Double, so it cannot be stored in a variable declared as Int. Declare it as Double, or let Kotlin infer the type.',
    'What type does average return?', 'find_error',
    { code: code(['val scores = listOf(80, 90, 70)', 'val avg: Int = scores.average()', 'println(avg)']), errorLine: 2, errorNote: 'average() gives a Double, not an Int.' }),
  boss(11, 'hard', 'Several ways to total the even numbers', 'Given `val nums = listOf(1, 2, 3, 4, 5, 6)`, select the 3 expressions that total the even numbers.',
    '`filter` keeps 2, 4, and 6. `filterNot` can keep the same numbers by excluding odd ones. `partition` puts them in its first list. `map` makes true/false values, which cannot be added as numbers.',
    'Which option does not keep the numbers themselves?', 'multi_select',
    { ...balancedMulti(['nums.filter { it % 2 == 0 }.sum()', 'nums.filterNot { it % 2 != 0 }.sum()', 'nums.partition { it % 2 == 0 }.first.sum()', 'nums.map { it % 2 == 0 }.sum()'], [0, 1, 2]), monoOptions: true }),
  boss(12, 'hard', 'zip, filter, sortedBy and map in one report', 'What does this program print?',
    '`zip` stops at the shorter list, so it makes 3 pairs and leaves out Di. The filter keeps Ana (90) and Cy (72). `sortedBy` puts Cy first because 72 is less than 90. `map` returns just their names.',
    'zip stops at the shorter list; then follow the pipeline left to right.', 'predict_output',
    { ...choice('[Cy, Ana]\n3', ['[Ana, Cy]\n3', '[Cy, Ana]\n4', '[Cy, Ana, Di]\n3']), code: code(['val names = listOf("Ana", "Bo", "Cy", "Di")', 'val scores = listOf(90, 45, 72)', 'val pairs = names.zip(scores)', 'val passed = pairs.filter { it.second >= 60 }.sortedBy { it.second }.map { it.first }', 'println(passed)', 'println(pairs.size)']), monoOptions: true }),
];

export const WORLD_10_QUIZ: QuizQuestion[] = [...lessonQuestions, ...setQuestions];
export const WORLD_10_BOSS_QUIZ: QuizQuestion[] = bossQuestions;

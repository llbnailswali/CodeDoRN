/**
 * Audits the quiz bank for two things the structural test (test-quiz-bank.ts) does not check:
 *  1. Duplicates: two questions with the same code, or the same question text and options, or the same concept in one lesson.
 *  2. Lesson purity: a question may use its own lesson's concepts and EARLIER lessons', never a later lesson's. A set question counts as
 *     belonging to the last lesson of its set. Detection is a keyword scan of the question's code, text and options, so a hit is a
 *     candidate to read, not proof; known, deliberate uses are listed in ALLOWED below with a reason.
 *
 *   npm run audit:quiz-bank
 */
import { readFileSync } from 'node:fs';
import { WORLD_1_QUIZ } from '../src/data/quizBank/world1Quiz';
import { WORLD_11_QUIZ } from '../src/data/quizBank/world11Quiz';
import { WORLD_11_QUIZ_SETS } from '../src/data/quizBank/quizSets';
import { WORLD_12_QUIZ } from '../src/data/quizBank/world12Quiz';
import { WORLD_12_QUIZ_SETS } from '../src/data/quizBank/quizSets';
import { WORLD_13_QUIZ } from '../src/data/quizBank/world13Quiz';
import { WORLD_13_QUIZ_SETS } from '../src/data/quizBank/quizSets';
import { WORLD_14_QUIZ } from '../src/data/quizBank/world14Quiz';
import { WORLD_14_QUIZ_SETS } from '../src/data/quizBank/quizSets';
import { WORLD_16_QUIZ } from '../src/data/quizBank/world16Quiz';
import { WORLD_16_QUIZ_SETS } from '../src/data/quizBank/quizSets';
import { QuizQuestion } from '../src/utils/quizQuestions';

// Lesson order of World 1 (catalog ids).
const ORDER = [
  'world-1-what-is-kotlin', 'world-1-kotlin-syntax', 'world-1-comments', 'world-1-print-println', 'world-1-val-vs-var',
  'world-1-variables-type-inference', 'world-1-int-long', 'world-1-float-double', 'world-1-boolean', 'world-1-char',
  'world-1-string', 'world-1-string-templates', 'world-1-boss',
];

// The first lesson (1-based) in which a concept is taught, and how to spot it in a question's text.
const CONCEPTS: Array<{ name: string; from: number; test: RegExp }> = [
  { name: 'val/var declaration', from: 5, test: /\b(val|var)\s+[a-zA-Z_]/ },
  { name: 'explicit type annotation', from: 6, test: /:\s*(Int|String|Double|Float|Long|Char|Boolean)\b/ },
  { name: 'Long (L suffix, underscores, toLong)', from: 7, test: /\d_\d|\d+L\b|toLong|\bLong\b/ },
  { name: 'Float/Double (decimal literal, f suffix)', from: 8, test: /\d\.\d|\d+f\b|toDouble|\bDouble\b|\bFloat\b/ },
  { name: 'Boolean (true/false, comparison, !)', from: 9, test: /\btrue\b|\bfalse\b|[<>]=?\s*[\d\w(]|(^|[\s(=])!\s*[\w(]/m },
  { name: 'Char literal', from: 10, test: /'[^'\n]{1,2}'/ },
  { name: 'String members / raw strings', from: 11, test: /\.length\b|"""|trimIndent/ },
  { name: 'String template', from: 12, test: /\$\{|\$[a-zA-Z_]/ },
];

// Deliberate exceptions: "<question id>:<concept name>" -> why it is acceptable.
const ALLOWED: Record<string, string> = {
  'w1q-syntax-1:val/var declaration': 'val main is only a distractor option',
  'w1q-comments-6:val/var declaration': "the lesson's own comment-in-a-String example is a val declaration",
  'w1q-int-4:Float/Double (decimal literal, f suffix)': 'Double is only a distractor type name',
  'w1q-print-1:Boolean (true/false, comparison, !)': 'the ! is part of an option output text, not the NOT operator',
  'w1q-print-7:Boolean (true/false, comparison, !)': 'the ! is part of an option output text, not the NOT operator',
};

const lessonIndex = (q: QuizQuestion) => ORDER.indexOf(q.lessonId) + 1;
// What a learner has to READ to answer: the code and the options (not the question sentence, where words such as "true" are just English).
const text = (q: QuizQuestion) => {
  const any = q as unknown as Record<string, unknown>;
  const parts: string[] = [];
  for (const key of ['code', 'a', 'b', 'options']) if (Array.isArray(any[key])) parts.push((any[key] as string[]).join('\n'));
  return parts.join('\n');
};
const normCode = (q: QuizQuestion) => {
  const any = q as unknown as { code?: string[]; a?: string[]; b?: string[] };
  return [...(any.code ?? []), ...(any.a ?? []), '||', ...(any.b ?? [])].join('').replace(/\s+/g, '');
};

const problems: string[] = [];

// World 11 curriculum order and a lightweight later-topic scan. Each hit is a candidate for manual review.
const W11_ORDER = [
  'world-11-inheritance-abstract-classes', 'world-11-interfaces-multiple-interface-implementa', 'world-11-sealed-classes-sealed-interfaces',
  'world-11-data-classes-in-domain-modeling-enum-cla', 'world-11-nested-classes', 'world-11-inner-classes', 'world-11-object-declarations',
  'world-11-companion-objects', 'world-11-extension-functions', 'world-11-extension-properties', 'world-11-delegation',
  'world-11-delegated-properties', 'world-11-visibility-and-api-design', 'world-11-boss',
];
const W11_LATER: Array<{ name: string; from: number; test: RegExp }> = [
  { name: 'sealed hierarchy', from: 3, test: /\bsealed\b|\bwhen\s*\(/ },
  { name: 'companion object', from: 8, test: /\bcompanion object\b/ },
  { name: 'extension function', from: 9, test: /\bfun\s+[A-Z]\w*\./ },
  { name: 'extension property', from: 10, test: /\bval\s+[A-Z]\w*\./ },
  { name: 'interface delegation', from: 11, test: /:\s*\w+\s+by\s+\w+/ },
  { name: 'delegated property', from: 12, test: /\bby\s+(?:lazy|Delegates|\w+Delegate)/ },
];
const w11Index = new Map(W11_ORDER.map((id, index) => [id, index + 1]));
const w11Text = (q: QuizQuestion) => {
  const any = q as unknown as { code?: string[]; a?: string[]; b?: string[] };
  // Scan executable Kotlin only: prose and answer choices may name later concepts as distractors.
  return [...(any.code ?? []), ...(any.a ?? []), ...(any.b ?? [])].join('\n');
};
for (const set of WORLD_11_QUIZ_SETS) {
  const own = WORLD_11_QUIZ.filter((q) => q.setId === set.id);
  for (const q of own) {
    if (q.lessonId !== set.lessonIds.at(-1)) problems.push(`${q.id}: set question lessonId is not the set's last lesson`);
    if (q.topic !== set.title) problems.push(`${q.id}: set question topic is not the set title`);
    const last = Math.max(...set.lessonIds.map((id) => w11Index.get(id) ?? 0));
    for (const concept of W11_LATER) if (concept.from > last && concept.test.test(w11Text(q))) problems.push(`${q.id}: later concept candidate ${concept.name}`);
  }
}
for (const q of WORLD_11_QUIZ) {
  const index = w11Index.get(q.lessonId) ?? 0;
  if (!q.setId && !index) problems.push(`${q.id}: unknown lesson ${q.lessonId}`);
  if (q.setId && !WORLD_11_QUIZ_SETS.some((s) => s.id === q.setId)) problems.push(`${q.id}: unknown set ${q.setId}`);
  if (!index || q.setId) continue;
  for (const concept of W11_LATER) if (concept.from > index && concept.test.test(w11Text(q))) problems.push(`${q.id}: later concept candidate ${concept.name}`);
}

// 1. duplicates
const byCode = new Map<string, QuizQuestion[]>();
const byQuestion = new Map<string, QuizQuestion[]>();
const byConcept = new Map<string, QuizQuestion[]>();
for (const q of WORLD_1_QUIZ) {
  const code = normCode(q);
  if (code.length > 12) byCode.set(code, [...(byCode.get(code) ?? []), q]);
  const key = (q.question + '|' + ((q as { options?: string[] }).options ?? []).join('|')).toLowerCase();
  byQuestion.set(key, [...(byQuestion.get(key) ?? []), q]);
  const ck = q.lessonId + '|' + q.concept.toLowerCase();
  byConcept.set(ck, [...(byConcept.get(ck) ?? []), q]);
}

// World 11 duplicates are checked independently; the scope scanner above uses its lesson order.
const w11ByCode = new Map<string, string[]>();
const w11ByQuestion = new Map<string, string[]>();
const w11ByConcept = new Map<string, string[]>();
for (const q of WORLD_11_QUIZ) {
  const code = normCode(q);
  if (code.length > 12) w11ByCode.set(code, [...(w11ByCode.get(code) ?? []), q.id]);
  const options = (q as { options?: string[] }).options ?? [];
  if (options.length) {
    const key = (q.question + '|' + options.join('|')).toLowerCase();
    w11ByQuestion.set(key, [...(w11ByQuestion.get(key) ?? []), q.id]);
  }
  const concept = `${q.lessonId}|${q.concept.toLowerCase()}`;
  w11ByConcept.set(concept, [...(w11ByConcept.get(concept) ?? []), q.id]);
}
for (const [, list] of w11ByCode) if (list.length > 1) problems.push(`World 11 same code: ${list.join(', ')}`);
for (const [, list] of w11ByQuestion) if (list.length > 1) problems.push(`World 11 same question and options: ${list.join(', ')}`);
for (const [key, list] of w11ByConcept) if (list.length > 1) problems.push(`World 11 same concept in one lesson (${key.split('|')[1]}): ${list.join(', ')}`);
const w12Lessons = WORLD_12_QUIZ_SETS.flatMap((set) => set.lessonIds);
const w12Index = new Map(w12Lessons.map((id, index) => [id, index + 1]));
const w12Later: Array<{ name: string; from: number; test: RegExp }> = [
  { name: 'multiple bounds', from: 5, test: /\bwhere\s+T\s*:/ },
  { name: 'contravariant declaration', from: 6, test: /<(?:in)\s+T>/ },
  { name: 'covariant declaration', from: 7, test: /<(?:out)\s+T>/ },
  { name: 'use-site projection', from: 10, test: /Array<(?:in|out)\s+/ },
  { name: 'star projection', from: 11, test: /<\*>/ },
  { name: 'reified parameter', from: 12, test: /\breified\b/ },
  { name: 'type alias', from: 13, test: /\btypealias\b/ },
];
const w12ByCode = new Map<string, string[]>();
const w12ByQuestion = new Map<string, string[]>();
const w12ByConcept = new Map<string, string[]>();
for (const q of WORLD_12_QUIZ) {
  const set = WORLD_12_QUIZ_SETS.find((item) => item.id === q.setId);
  if (q.setId && !set) problems.push(`${q.id}: unknown World 12 set ${q.setId}`);
  if (set && (q.lessonId !== set.lessonIds.at(-1) || q.topic !== set.title)) problems.push(`${q.id}: World 12 set metadata does not match`);
  const at = w12Index.get(q.lessonId) ?? 0;
  if (!at) problems.push(`${q.id}: unknown World 12 lesson ${q.lessonId}`);
  const body = w11Text(q);
  for (const item of w12Later) if (item.from > at && item.test.test(body)) problems.push(`${q.id}: later World 12 concept candidate ${item.name}`);
  const normalized = normCode(q);
  if (normalized.length > 12) w12ByCode.set(normalized, [...(w12ByCode.get(normalized) ?? []), q.id]);
  const options = (q as { options?: string[] }).options ?? [];
  if (options.length) {
    const signature = (q.question + '|' + options.join('|')).toLowerCase();
    w12ByQuestion.set(signature, [...(w12ByQuestion.get(signature) ?? []), q.id]);
  }
  const concept = `${q.lessonId}|${q.concept.toLowerCase()}`;
  w12ByConcept.set(concept, [...(w12ByConcept.get(concept) ?? []), q.id]);
}
for (const [, list] of w12ByCode) if (list.length > 1) problems.push(`World 12 same code: ${list.join(', ')}`);
for (const [, list] of w12ByQuestion) if (list.length > 1) problems.push(`World 12 same question and options: ${list.join(', ')}`);
for (const [key, list] of w12ByConcept) if (list.length > 1) problems.push(`World 12 same concept in one lesson (${key.split('|')[1]}): ${list.join(', ')}`);

const w13Lessons = WORLD_13_QUIZ_SETS.flatMap((set) => set.lessonIds);
const w13Index = new Map(w13Lessons.map((id, index) => [id, index + 1]));
const w13Later: Array<{ name: string; from: number; test: RegExp }> = [
  { name: 'apply', from: 2, test: /\.apply\s*\{/ },
  { name: 'also', from: 3, test: /\.also\s*\{/ },
  { name: 'with', from: 4, test: /\bwith\s*\(/ },
  { name: 'nested this and it contexts', from: 5, test: /\bthis\b[^\n]*\bit\b|\bit\b[^\n]*\bthis\b/ },
];
const w13ByCode = new Map<string, string[]>();
const w13ByQuestion = new Map<string, string[]>();
const w13ByConcept = new Map<string, string[]>();
for (const q of WORLD_13_QUIZ) {
  const set = WORLD_13_QUIZ_SETS.find((item) => item.id === q.setId);
  if (q.setId && !set) problems.push(`${q.id}: unknown World 13 set ${q.setId}`);
  if (set && (q.lessonId !== set.lessonIds.at(-1) || q.topic !== set.title)) problems.push(`${q.id}: World 13 set metadata does not match`);
  const at = w13Index.get(q.lessonId) ?? 0;
  if (!at) problems.push(`${q.id}: unknown World 13 lesson ${q.lessonId}`);
  const body = w11Text(q);
  for (const item of w13Later) if (item.from > at && item.test.test(body)) problems.push(`${q.id}: later World 13 concept candidate ${item.name}`);
  const normalized = normCode(q);
  if (normalized.length > 12) w13ByCode.set(normalized, [...(w13ByCode.get(normalized) ?? []), q.id]);
  const options = (q as { options?: string[] }).options ?? [];
  if (options.length) {
    const signature = (q.question + '|' + options.join('|')).toLowerCase();
    w13ByQuestion.set(signature, [...(w13ByQuestion.get(signature) ?? []), q.id]);
  }
  const concept = `${q.lessonId}|${q.concept.toLowerCase()}`;
  w13ByConcept.set(concept, [...(w13ByConcept.get(concept) ?? []), q.id]);
}
for (const [, list] of w13ByCode) if (list.length > 1) problems.push(`World 13 same code: ${list.join(', ')}`);
for (const [, list] of w13ByQuestion) if (list.length > 1) problems.push(`World 13 same question and options: ${list.join(', ')}`);
for (const [key, list] of w13ByConcept) if (list.length > 1) problems.push(`World 13 same concept in one lesson (${key.split('|')[1]}): ${list.join(', ')}`);

const w14Lessons = WORLD_14_QUIZ_SETS.flatMap((set) => set.lessonIds);
const w14ByCode = new Map<string, string[]>();
const w14ByQuestion = new Map<string, string[]>();
for (const q of WORLD_14_QUIZ) {
  const set = WORLD_14_QUIZ_SETS.find((item) => item.id === q.setId);
  if (q.setId && !set) problems.push(`${q.id}: unknown World 14 set ${q.setId}`);
  if (set && (q.lessonId !== set.lessonIds.at(-1) || q.topic !== set.title)) problems.push(`${q.id}: World 14 set metadata does not match`);
  if (!w14Lessons.includes(q.lessonId)) problems.push(`${q.id}: unknown World 14 lesson ${q.lessonId}`);
  const normalized = normCode(q);
  if (normalized.length > 12) w14ByCode.set(normalized, [...(w14ByCode.get(normalized) ?? []), q.id]);
  const options = (q as { options?: string[] }).options ?? [];
  if (options.length) {
    const signature = (q.question + '|' + options.join('|')).toLowerCase();
    w14ByQuestion.set(signature, [...(w14ByQuestion.get(signature) ?? []), q.id]);
  }
}
for (const [, list] of w14ByCode) if (list.length > 1) problems.push(`World 14 same code: ${list.join(', ')}`);
for (const [, list] of w14ByQuestion) if (list.length > 1) problems.push(`World 14 same question and options: ${list.join(', ')}`);
const w14Source = readFileSync(new URL('../src/data/quizBank/world14Quiz.ts', import.meta.url), 'utf8');
for (const forbidden of ['WORLD_14_LESSONS', 'lesson.predict', 'while (questions.length']) {
  if (w14Source.includes(forbidden)) problems.push(`World 14 source derives or pads quiz content via ${forbidden}`);
}
const w14ForbiddenOptions = [
  'All Sequence operations execute immediately when the pipeline variable is created.',
  'A Sequence always caches every transformed value after the first use.',
  'Kotlin guarantees this pipeline is faster than the equivalent collection code.',
];
for (const option of w14ForbiddenOptions) {
  const ids = WORLD_14_QUIZ.filter((q) => 'options' in q && q.options.includes(option)).map((q) => q.id);
  if (ids.length) problems.push(`World 14 repeated stock distractor in ${ids.join(', ')}`);
}
const w14Generic = WORLD_14_QUIZ.filter((q) => /^What is the exact output of this|^Which statement correctly explains/.test(q.question));
if (w14Generic.length) problems.push(`World 14 mechanical prompt template: ${w14Generic.map((q) => q.id).join(', ')}`);
for (const lessonId of w14Lessons) {
  if (!WORLD_14_QUIZ.some((q) => q.lessonId === lessonId && !q.setId && q.type === 'find_error')) {
    problems.push(`World 14 lesson lacks direct find-error coverage: ${lessonId}`);
  }
}

const w16Lessons = WORLD_16_QUIZ_SETS.flatMap((set) => set.lessonIds);
const w16ByCode = new Map<string, string[]>();
const w16ByQuestion = new Map<string, string[]>();
const w16ByConcept = new Map<string, string[]>();
for (const q of WORLD_16_QUIZ) {
  const set = WORLD_16_QUIZ_SETS.find((item) => item.id === q.setId);
  if (q.setId && !set) problems.push(`${q.id}: unknown World 16 set ${q.setId}`);
  if (set && (q.lessonId !== set.lessonIds.at(-1) || q.topic !== set.title)) problems.push(`${q.id}: World 16 set metadata does not match`);
  if (!w16Lessons.includes(q.lessonId)) problems.push(`${q.id}: unknown World 16 lesson ${q.lessonId}`);
  const normalized = normCode(q);
  if (normalized.length > 12) w16ByCode.set(normalized, [...(w16ByCode.get(normalized) ?? []), q.id]);
  const options = (q as { options?: string[] }).options ?? [];
  if (options.length) {
    const signature = (q.question + '|' + options.join('|')).toLowerCase();
    w16ByQuestion.set(signature, [...(w16ByQuestion.get(signature) ?? []), q.id]);
  }
  const concept = `${q.lessonId}|${q.concept.toLowerCase()}`;
  w16ByConcept.set(concept, [...(w16ByConcept.get(concept) ?? []), q.id]);
}
for (const [, list] of w16ByCode) if (list.length > 1) problems.push(`World 16 same code: ${list.join(', ')}`);
for (const [, list] of w16ByQuestion) if (list.length > 1) problems.push(`World 16 same question and options: ${list.join(', ')}`);
for (const [key, list] of w16ByConcept) if (list.length > 1) problems.push(`World 16 same concept in one lesson (${key.split('|')[1]}): ${list.join(', ')}`);

for (const [, list] of byCode) if (list.length > 1) problems.push(`same code: ${list.map((q) => q.id).join(', ')}`);
for (const [, list] of byQuestion) if (list.length > 1 && (list[0] as { options?: string[] }).options) problems.push(`same question and options: ${list.map((q) => q.id).join(', ')}`);
for (const [key, list] of byConcept) if (list.length > 1) problems.push(`same concept label in one lesson (${key.split('|')[1]}): ${list.map((q) => q.id).join(', ')}`);

// 2. lesson purity
for (const q of WORLD_1_QUIZ) {
  const at = lessonIndex(q);
  if (at === 0) {
    problems.push(`${q.id}: unknown lesson ${q.lessonId}`);
    continue;
  }
  if (q.lessonId === 'world-1-boss') continue; // the boss may use everything in the World
  const body = text(q);
  for (const c of CONCEPTS) {
    if (c.from > at && c.test.test(body) && !ALLOWED[`${q.id}:${c.name}`]) problems.push(`${q.id} (lesson ${at}) uses a later lesson's concept: ${c.name} (lesson ${c.from})`);
  }
}

if (problems.length) {
  console.log(problems.join('\n'));
  console.log(`\n${problems.length} candidate(s) to read.`);
  process.exit(process.argv.includes('--strict') ? 1 : 0);
}
console.log('Quiz bank audit: no duplicates and no later-lesson concepts found.');

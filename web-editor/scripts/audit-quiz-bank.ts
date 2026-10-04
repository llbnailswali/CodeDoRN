/**
 * Audits the quiz bank for two things the structural test (test-quiz-bank.ts) does not check:
 *  1. Duplicates: two questions with the same code, or the same question text and options, or the same concept in one lesson.
 *  2. Lesson purity: a question may use its own lesson's concepts and EARLIER lessons', never a later lesson's. A set question counts as
 *     belonging to the last lesson of its set. Detection is a keyword scan of the question's code, text and options, so a hit is a
 *     candidate to read, not proof; known, deliberate uses are listed in ALLOWED below with a reason.
 *
 *   npm run audit:quiz-bank
 */
import { WORLD_1_QUIZ } from '../src/data/quizBank/world1Quiz';
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

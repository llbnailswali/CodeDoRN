/**
 * Enforces the mechanical rules of QUIZ_QUALITY_STANDARD.md on every authored quiz bank (Worlds 1-16).
 *
 *   npm run audit:quiz-standard
 *
 * HARD failures (exit 1): type vs difficulty range (section 5a), XP vs difficulty, unique ids, Boss shape (section 10: 12 questions,
 * 1 easy / 5 medium / 6 hard, ordered easy to hard, no true_false, no type above 4 of 12, at least 5 types), filler options,
 * generic "True or false:" prompts, repeated explanations, and repeated question + code + options.
 * WARNINGS (exit 0): section 5b type mix (a type above 40% of a lesson, or fewer than 3 types, for lessons with 6+ questions) and a
 * world's lesson/set difficulty mix far from 20/50/30. A warning may be overridden with a reason in TYPE_MIX_REASONS below (and in the
 * world's concept map).
 *
 * It does NOT check answer correctness, distractor quality or wording; see "Audit procedure" in the standard and scripts/quiz-audit/.
 */
import type { QuizQuestion } from '../src/utils/quizQuestions';

const RANGE: Record<string, string[]> = {
  true_false: ['easy'],
  single_choice: ['easy', 'medium'],
  fill_blank: ['easy', 'medium'],
  multi_select: ['medium', 'hard'],
  code_comparison: ['medium', 'hard'],
  predict_output: ['medium', 'hard'],
  find_error: ['medium', 'hard'],
};
const XP: Record<string, number> = { easy: 10, medium: 15, hard: 20 };
const ORDER = ['easy', 'medium', 'hard'];

/** Question ids allowed to break a HARD rule, with the reason. Keep this list empty unless a rule truly cannot apply. */
const EXCEPTIONS: Record<string, string> = {};
/** "<world>:<lesson id suffix>" -> why a type-mix WARNING is accepted (also record it in the world's concept map). */
const TYPE_MIX_REASONS: Record<string, string> = {
  '14:what-sequences-are': 'Foundational sequence identity is primarily tested through code-backed semantic recognition; forced output questions would not test deferred construction.',
  '14:eager-collection-processing': 'The lesson distinguishes execution models and stage timing, so code-backed semantic choices are the clearest fit.',
  '14:lazy-processing': 'Includes the foundation set synthesis; recognition of deferred execution and caching misconceptions is intentionally prominent.',
  '14:intermediate-operations': 'Includes creation-and-operations set synthesis; operation ordering and bounded-chain traces intentionally increase code-based questions.',
  '14:assequence': 'Conversion-boundary placement is primarily a semantic recognition skill, supported by comparison and trace questions.',
  '14:terminal-operations': 'Terminal contracts differ by result and stopping behavior; code-backed selection avoids artificial output-only variants.',
  '14:sequence-evaluation-order': 'The curriculum emphasizes trace interpretation; single-choice traces are retained instead of duplicating output programs.',
  '14:short-circuiting': 'Includes consumption-and-control set synthesis; bounded and unbounded execution traces intentionally dominate this behavior-focused lesson.',
  '14:sequences-vs-collections': 'The lesson is an abstraction comparison, so several design-choice questions are intentional.',
  '14:performance-trade-offs': 'Performance claims are judged semantically without fabricated timing outputs, making recognition questions appropriate.',
  '14:when-sequences-should-and-should-not-be-used': 'Includes design-set synthesis and intentionally emphasizes justified API-choice recognition.',
  '16:coroutine-fundamentals-coroutine-builder': 'Four semantic choices distinguish builder ownership and completion contracts; five remaining questions span true/false, output, and error diagnosis.',
  '16:await-suspending-functions': 'Direct and foundation-set synthesis uses semantic choices for legal call sites and API contracts alongside four other question types.',
  '16:suspend-coroutine-context': 'Context elements require four precise semantic distinctions; executable traces and error diagnosis cover application.',
  '16:dispatchers-jobs': 'Direct and context-set questions deliberately separate dispatcher policy from Job lifecycle through semantic choices and four applied types.',
  '16:coroutinescope': 'Direct and ownership-set questions emphasize scope contract distinctions, supported by output, error, multi-select, and comparison questions.',
  '16:supervisorscope': 'Four choices distinguish supervision from ordinary scope behavior; output, error, and set synthesis test consequences.',
  '16:exception-handling-in-coroutines': 'Direct and failure-set synthesis uses semantic choices for ownership and cancellation policy alongside four applied types.',
  '16:coroutine-best-practices': 'Direct and design-set synthesis intentionally emphasizes justified API and ownership decisions alongside four applied types.',
};

const failures: string[] = [];
const warnings: string[] = [];
const fail = (id: string, msg: string) => { if (!EXCEPTIONS[id]) failures.push(`${id}: ${msg}`); };

async function loadBank(n: number): Promise<QuizQuestion[]> {
  const mod: Record<string, unknown> = await import(`../src/data/quizBank/world${n}Quiz`);
  const seen = new Set<string>();
  const out: QuizQuestion[] = [];
  for (const value of Object.values(mod)) {
    if (!Array.isArray(value)) continue;
    for (const q of value as QuizQuestion[]) {
      if (q && typeof q === 'object' && 'id' in q && !seen.has(q.id)) { seen.add(q.id); out.push(q); }
    }
  }
  return out;
}

const rightOption = (q: QuizQuestion): string | undefined => {
  const any = q as unknown as { options?: string[]; answer?: unknown };
  return Array.isArray(any.options) && typeof any.answer === 'number' ? any.options[any.answer] : undefined;
};

function checkWorld(n: number, bank: QuizQuestion[]) {
  const worldId = `world-${n}`;
  const bossLesson = `${worldId}-boss`;
  const boss = bank.filter((q) => q.lessonId === bossLesson);
  const regular = bank.filter((q) => q.lessonId !== bossLesson);

  // Every question
  const ids = new Set<string>();
  for (const q of bank) {
    if (ids.has(q.id)) fail(q.id, 'duplicate id');
    ids.add(q.id);
    if (!RANGE[q.type]) { fail(q.id, `unknown type ${q.type}`); continue; }
    if (!RANGE[q.type].includes(q.difficulty)) fail(q.id, `${q.type} is not allowed at ${q.difficulty} difficulty (allowed: ${RANGE[q.type].join(', ')})`);
    if (q.xp !== XP[q.difficulty]) fail(q.id, `xp ${q.xp} does not match ${q.difficulty} (${XP[q.difficulty]})`);
    if (/^True or `?false`?:/i.test(q.question)) fail(q.id, 'generic "True or false:" prompt; state the claim itself');
    const right = rightOption(q);
    const options = (q as unknown as { options?: string[] }).options ?? [];
    for (const option of options) {
      if (/^Not .* \(\d\)$/.test(option) || (right !== undefined && option === `Not ${right}`)) fail(q.id, `filler option "${option}"`);
    }
    if (n === 12) {
      for (const [field, value] of [['question', q.question], ['explanation', q.explanation]] as const) {
        if (value.split('`').length % 2 === 0) fail(q.id, `unpaired code chip in ${field}`);
        for (const chip of value.match(/`[^`]*`/g) ?? []) {
          if (chip.length <= 2) fail(q.id, `empty code chip in ${field}`);
          if (/[<=]`$/.test(chip)) fail(q.id, `incomplete code chip in ${field}: ${chip}`);
        }
      }
      if (options.some((option) => option.includes('`'))) fail(q.id, 'options display backticks literally; use plain text or monoOptions');
    }
  }

  // Repeats within the world
  const byExplanation = new Map<string, string[]>();
  const bySignature = new Map<string, string[]>();
  for (const q of bank) {
    const any = q as unknown as { code?: string[]; a?: string[]; b?: string[]; options?: string[] };
    byExplanation.set(q.explanation, [...(byExplanation.get(q.explanation) ?? []), q.id]);
    const signature = JSON.stringify([q.question, any.code ?? any.a ?? null, any.b ?? null, any.options ?? null]);
    bySignature.set(signature, [...(bySignature.get(signature) ?? []), q.id]);
  }
  for (const [, group] of byExplanation) if (group.length > 1) fail(group[1], `same explanation as ${group.filter((x) => x !== group[1]).join(', ')}`);
  for (const [, group] of bySignature) if (group.length > 1) fail(group[1], `same question, code and options as ${group.filter((x) => x !== group[1]).join(', ')}`);

  // Boss shape (section 10)
  if (boss.length === 0) failures.push(`${worldId}: no Boss questions (lessonId ${bossLesson})`);
  else {
    const counts: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
    const types: Record<string, number> = {};
    for (const q of boss) { counts[q.difficulty]++; types[q.type] = (types[q.type] ?? 0) + 1; }
    if (boss.length !== 12) failures.push(`${worldId} Boss: ${boss.length} questions, expected 12`);
    if (counts.easy !== 1 || counts.medium !== 5 || counts.hard !== 6) failures.push(`${worldId} Boss: mix ${counts.easy}/${counts.medium}/${counts.hard}, expected 1/5/6`);
    const rank = boss.map((q) => ORDER.indexOf(q.difficulty));
    if (rank.some((r, i) => i > 0 && r < rank[i - 1])) failures.push(`${worldId} Boss: questions are not ordered easy to hard`);
    if (types.true_false) failures.push(`${worldId} Boss: true_false is not allowed in a Boss`);
    const max = Math.max(...Object.values(types));
    if (max > 4) failures.push(`${worldId} Boss: one type has ${max} of ${boss.length} questions (maximum 4)`);
    if (Object.keys(types).length < 5) failures.push(`${worldId} Boss: only ${Object.keys(types).length} question types (minimum 5)`);
  }

  // Soft guideline (section 5b), lesson and set questions only
  const byLesson = new Map<string, QuizQuestion[]>();
  for (const q of regular) byLesson.set(q.lessonId, [...(byLesson.get(q.lessonId) ?? []), q]);
  for (const [lesson, questions] of byLesson) {
    if (questions.length < 6) continue;
    const types: Record<string, number> = {};
    for (const q of questions) types[q.type] = (types[q.type] ?? 0) + 1;
    const max = Math.max(...Object.values(types));
    const key = `${n}:${lesson.replace(/^world-\d+-/, '')}`;
    if (TYPE_MIX_REASONS[key]) continue;
    if (max / questions.length > 0.4) warnings.push(`${key}: a type is ${Math.round((100 * max) / questions.length)}% of ${questions.length} questions (guideline: 40% at most)`);
    if (Object.keys(types).length < 3) warnings.push(`${key}: only ${Object.keys(types).length} question types in ${questions.length} questions (guideline: at least 3)`);
  }
  const mix: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
  for (const q of regular) mix[q.difficulty]++;
  const pct = (d: string) => (100 * mix[d]) / regular.length;
  if (Math.abs(pct('easy') - 20) > 5 || Math.abs(pct('medium') - 50) > 5 || Math.abs(pct('hard') - 30) > 5) {
    warnings.push(`world ${n}: lesson/set difficulty mix ${pct('easy').toFixed(0)}/${pct('medium').toFixed(0)}/${pct('hard').toFixed(0)} is far from 20/50/30`);
  }
  return { total: bank.length, boss: boss.length };
}

async function main() {
  const rows: string[] = [];
  for (let n = 1; n <= 16; n++) {
    const bank = await loadBank(n);
    const r = checkWorld(n, bank);
    rows.push(`world ${n}: ${r.total} questions (${r.boss} Boss)`);
  }
  console.log(rows.join('\n'));
  if (warnings.length) {
    const byWorld = new Map<string, string[]>();
    for (const w of warnings) { const k = /^world (\d+)/.exec(w)?.[1] ?? /^(\d+):/.exec(w)?.[1] ?? '?'; byWorld.set(k, [...(byWorld.get(k) ?? []), w]); }
    console.log(`\nWarnings (${warnings.length}, not failures; set TYPE_MIX_REASONS to accept one):`);
    for (const [k, list] of [...byWorld.entries()].sort((a, b) => Number(a[0]) - Number(b[0]))) console.log(`  world ${k}: ${list.length} (${list.slice(0, 3).map((x) => x.replace(/^\d+:/, '').split(':')[0]).join(', ')}${list.length > 3 ? ', ...' : ''})`);
    if (process.env.VERBOSE) console.log('- ' + warnings.join('\n- '));
  }
  if (failures.length) {
    console.error(`\nFAILED (${failures.length}):\n${failures.join('\n')}`);
    process.exit(1);
  }
  console.log('\nQuiz standard OK.');
}
main();

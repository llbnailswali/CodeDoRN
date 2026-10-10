// The shape-based compile checks (src/utils/kotlinStructureChecks.ts) must never fire on a VALID program. Runs them over every
// reference solution and every repaired Debug program in the lessons and the Practice bank (all known to be valid Kotlin).
import assert from 'node:assert/strict';
import { AVAILABLE_FIVE_STAGE_LESSONS } from '../src/data/lessonStagesData';
import { PRACTICE_DEBUG_BANK, PRACTICE_WRITE_RUN_BANK } from '../src/data/practiceBank';
import { checkStructureRules } from '../src/utils/kotlinStructureChecks';
import { checkKotlinSyntax, ensureKotlinSyntax } from '../src/utils/kotlinSyntaxCheck';
import { makeKotlinExampleRunnable } from '../../src/utils/kotlinExample';

const programs: { id: string; code: string }[] = [];
const add = (id: string, code?: string) => { if (code) programs.push({ id, code }); };
for (const l of Object.values(AVAILABLE_FIVE_STAGE_LESSONS)) { add(`${l.id}:solution`, l.writeRun?.solutionCode); add(`${l.id}:fixed`, l.debug?.fixedCode); }
// Explore cards and Predict questions are run as complete programs too (wrapped in main when they are fragments). Cards that teach a compile
// error on purpose are skipped, so only code the lessons expect to RUN is checked.
for (const l of Object.values(AVAILABLE_FIVE_STAGE_LESSONS)) {
  for (const c of l.explore?.cards ?? []) if (c.code?.length && c.outputKind !== 'compileError' && !/compile error|does not compile|won't compile/i.test(`${c.title} ${c.subtitle} ${c.whatChanged}`)) add(`${l.id}:explore:${c.id}`, makeKotlinExampleRunnable(c.code));
  for (const q of l.predict?.questions ?? []) if (q.code?.length && !q.options.some((o) => o.isCorrect && /^No\b/.test(o.label)) && !/compil|error|\bfails?\b|\bvalid\b/i.test(`${q.prompt} ${q.explanation.detail} ${q.options.filter((o) => o.isCorrect).map((o) => o.label).join(' ')}`)) add(`${l.id}:predict:${q.id}`, makeKotlinExampleRunnable(q.code));
}
for (const list of Object.values(PRACTICE_WRITE_RUN_BANK)) for (const p of list) add(`${p.id}:solution`, p.solutionCode);
for (const list of Object.values(PRACTICE_DEBUG_BANK)) for (const p of list) add(`${p.id}:fixed`, p.fixedCode);
// The real Kotlin grammar (kotlinSyntaxCheck.ts) must accept every one of them too.
assert.ok(await ensureKotlinSyntax(), 'the Kotlin grammar did not load');
for (const p of programs) {
  const d = checkStructureRules(p.code);
  assert.equal(d, null, `${p.id}: a valid program was flagged: ${d?.message} (line ${d?.line}: ${p.code.split('\n')[(d?.line ?? 1) - 1]?.trim()})`);
  const s = checkKotlinSyntax(p.code);
  assert.equal(s, null, `${p.id}: the Kotlin grammar rejected a valid program: ${s?.message} (line ${s?.line}: ${p.code.split('\n')[(s?.line ?? 1) - 1]?.trim()})`);
}
console.log(`structure checks and Kotlin grammar: no false positives on ${programs.length} valid reference programs`);
process.exit(0);

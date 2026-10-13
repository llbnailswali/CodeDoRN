/** World 16 coroutine baseline: runs every lesson program (learn, explore, predict, write/debug solutions) and every quiz program
 *  on the in-app engine and on real kotlinc, and lists where they differ. npx tsx scripts/quiz-audit/w16-engine-vs-real.ts [--json out] */
import { runRealKotlin } from '../minikotlin/real-kotlin';
import { compileAndRunKotlin } from '../../src/utils/kotlinRunner';
import * as L from '../../src/data/curriculum/world16LessonsData';
import { WORLD_16_QUIZ, WORLD_16_BOSS_QUIZ } from '../../src/data/quizBank/world16Quiz';
import { writeFileSync } from 'node:fs';

const wrap = (code: string) => /\bfun main\b/.test(code) ? code : `fun main() {\n${code}\n}`;
const cases: { id: string; code: string }[] = [];
for (const lesson of Object.values(L).filter((v: any) => v && typeof v === 'object' && typeof v.id === 'string' && v.learn) as any[]) {
  const add = (id: string, lines?: string[] | string) => { if (!lines) return; const code = Array.isArray(lines) ? lines.join('\n') : lines; if (code.trim()) cases.push({ id: `${lesson.id}/${id}`, code: wrap(code) }); };
  add('learn', lesson.learn?.codeSnippet);
  for (const card of lesson.explore?.cards ?? []) add(card.id, card.code);
  for (const q of lesson.predict?.questions ?? []) add(q.id, q.code);
  add('write.solution', lesson.writeRun?.solutionCode);
  add('debug.solution', lesson.debug?.solutionCode ?? lesson.debug?.fixedCode);
}
for (const q of [...WORLD_16_QUIZ, ...WORLD_16_BOSS_QUIZ] as any[]) {
  if (q.type === 'predict_output') cases.push({ id: q.id, code: q.code.join('\n') });
  if (q.type === 'code_comparison') { cases.push({ id: q.id + '::A', code: q.a.join('\n') }); cases.push({ id: q.id + '::B', code: q.b.join('\n') }); }
}
const real = await runRealKotlin(cases);
let diff = 0; const rows: any[] = [];
for (const c of cases) {
  const r: any = real.get(c.id);
  if (r?.stage === 'compile') continue; // compile-error snippets (fragments, intentional errors) are not behaviour cases
  const e = await compileAndRunKotlin(c.code);
  const realOut = (r?.output ?? '').trim();
  const engOut = (e.output ?? '').trim();
  const realOk = r?.stage === 'ok';
  const same = e.success === realOk && engOut === realOut;
  rows.push({ id: c.id, same, realOk, engOk: e.success, realOut, engOut, engErr: e.error?.message });
  if (!same) { diff++; console.log('DIFF', c.id, '| real', realOk ? 'ok' : r?.stage, JSON.stringify(realOut).slice(0, 120), '| engine', e.success ? 'ok' : 'err', JSON.stringify(engOut).slice(0, 120), e.success ? '' : (e.error?.message ?? '').slice(0, 100)); }
}
console.log('cases', rows.length, 'differences', diff);
const out = process.argv.indexOf('--json'); if (out > 0) writeFileSync(process.argv[out + 1], JSON.stringify(rows, null, 1));

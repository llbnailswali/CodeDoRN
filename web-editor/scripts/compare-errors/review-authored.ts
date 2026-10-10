/**
 * Review sheet for the authored Debug exercises where the simulator and real kotlinc disagree about the BROKEN code (from
 * outputs/real-kotlin-compare/results.json). For each: the exercise's own description of the bug, the expected output, and what real
 * kotlinc and the simulator say about brokenCode AND fixedCode. Needs `npm run real-kotlin:serve`. Usage: npx tsx scripts/compare-errors/review-authored.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { AVAILABLE_FIVE_STAGE_LESSONS } from '../../src/data/lessonStagesData';
import { PRACTICE_DEBUG_BANK } from '../../src/data/practiceBank';
import { compileAndRunKotlin } from '../../src/utils/kotlinRunner';

const results = JSON.parse(fs.readFileSync(path.resolve('..', 'outputs', 'real-kotlin-compare', 'results.json'), 'utf8')) as { id: string; op: string; verdict: string }[];
const ids = [...new Set(results.filter((r) => r.op === 'authored-broken').map((r) => r.id.replace(/:broken$/, '')))];

const exercises = new Map<string, { broken: string; fixed: string; subtitle?: string; bugType?: string; expected?: string; explanation?: string }>();
for (const l of Object.values(AVAILABLE_FIVE_STAGE_LESSONS)) if (l.debug) exercises.set(l.id, { broken: l.debug.brokenCode, fixed: l.debug.fixedCode, subtitle: l.debug.subtitle, bugType: l.debug.bugType, expected: l.debug.expectedOutput, explanation: l.debug.explanation });
for (const list of Object.values(PRACTICE_DEBUG_BANK)) for (const p of list) exercises.set(p.id, { broken: p.brokenCode, fixed: p.fixedCode, subtitle: p.subtitle, bugType: p.bugType, expected: p.expectedOutput, explanation: p.explanation });

const real = async (code: string) => (await (await fetch('http://localhost:8787/run', { method: 'POST', body: JSON.stringify({ code }) })).json()) as { stage: string; output: string; errors: { line: number; message: string }[] };
const clip = (s: string, n = 110) => s.replace(/\s+/g, ' ').slice(0, n);
const simText = async (code: string) => {
  const r = await compileAndRunKotlin(code, { timeoutMs: 1500 });
  return r.error ? `${r.error.type === 'runtime_error' ? 'RUNTIME' : 'COMPILE'} ${clip(r.error.message, 70)}${r.error.line ? ` (line ${r.error.line})` : ''}` : `ok ${JSON.stringify(clip(r.output, 50))}`;
};
const realText = async (code: string) => {
  const r = await real(code);
  return r.stage === 'compile' ? `COMPILE ${clip(r.errors[0]?.message ?? '', 70)} (line ${r.errors[0]?.line})` : r.stage === 'run' ? `RUNTIME ${clip(r.errors[0]?.message ?? '', 70)}` : `ok ${JSON.stringify(clip(r.output, 50))}`;
};

(async () => {
  let out = '';
  for (const id of ids) {
    const e = exercises.get(id);
    if (!e) continue;
    out += `### ${id}  [${e.bugType}]\n- bug: ${clip(e.subtitle ?? '', 150)}\n- expected output: ${JSON.stringify(clip(e.expected ?? '', 60))}\n`;
    out += `- BROKEN  kotlinc: ${await realText(e.broken)}\n          simulator: ${await simText(e.broken)}\n`;
    out += `- FIXED   kotlinc: ${await realText(e.fixed)}\n          simulator: ${await simText(e.fixed)}\n\n`;
  }
  fs.writeFileSync(path.resolve('..', 'outputs', 'real-kotlin-compare', 'authored-review.md'), out);
  console.log(out);
  process.exit(0);
})();

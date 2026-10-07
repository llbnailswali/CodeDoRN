/**
 * Every Explore card that has an `output` must print exactly that on the simulator.
 * (Cards without `output`, e.g. a deliberate crash, are skipped; cards listed in real-only-outputs.json were produced by real kotlinc.)
 * Run: npm run audit:explore-output   (verify the real-only cards against kotlinc: npm run explore-output -- <worlds> --real)
 */
import { AVAILABLE_FIVE_STAGE_LESSONS } from '../src/data/lessonStagesData';
import fs from 'node:fs';
import path from 'node:path';
import { compileAndRunKotlin } from '../src/utils/kotlinRunner';

// Cards whose output came from real kotlinc because the simulator cannot reproduce it (see scripts/minikotlin/real-only-outputs.json).
const realOnlyFile = path.resolve('scripts/minikotlin/real-only-outputs.json');
const realOnly: Record<string, { output: string[] }> = fs.existsSync(realOnlyFile) ? JSON.parse(fs.readFileSync(realOnlyFile, 'utf8')) : {};

const norm = (s: string) => s.replace(/\r/g, '').split('\n').map((l) => l.replace(/\s+$/, '')).join('\n').replace(/\n+$/, '');
let checked = 0, withOutput = 0, realOnlyChecked = 0;
const bad: string[] = [];
const seen = new Set<string>();
for (const lesson of Object.values(AVAILABLE_FIVE_STAGE_LESSONS)) {
  if (seen.has(lesson.id)) continue;
  seen.add(lesson.id);
  for (const c of lesson.explore?.cards ?? []) {
    checked++;
    if (!c.output) continue;
    withOutput++;
    const ro = realOnly[`${lesson.id}/${c.id}`];
    if (ro) { if (JSON.stringify(ro.output) !== JSON.stringify(c.output)) bad.push(`${lesson.id}/${c.id}: stored output differs from real-only-outputs.json`); realOnlyChecked++; continue; }
    const f = c.code.join('\n');
    const r = await compileAndRunKotlin(f.includes('fun main(') ? f : `fun main() {\n${f}\n}`);
    if (!r.success) bad.push(`${lesson.id}/${c.id}: does not run: ${r.error?.message}`);
    else if (norm(r.output) !== c.output.join('\n')) bad.push(`${lesson.id}/${c.id}: stored ${JSON.stringify(c.output.join('\n'))} but prints ${JSON.stringify(norm(r.output))}`);
  }
}
console.log(`${withOutput} of ${checked} Explore cards have a stored output (${realOnlyChecked} verified by real kotlinc only); ${bad.length} mismatches`);
for (const b of bad) console.log('  ' + b);
process.exit(bad.length ? 1 : 0);

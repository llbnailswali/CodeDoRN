/**
 * Every Explore card's (and Learn example's) "Try it" must work: run exactly the program the app would run (see src/data/exploreTryIt.ts) and require that it
 * runs, and that it prints the card's stored `output` when it has one. Cards that intentionally demonstrate a compile or runtime error
 * (`outputKind`) must fail instead. A card that cannot run must be listed in EXPLORE_TRY_IT with a `disabled` reason.
 *
 *   npm run audit:explore-tryit            check everything (exit 1 on any problem)
 *   npm run audit:explore-tryit -- --list  also print the code of every failing card (to author its override)
 */
import fs from 'node:fs';
import path from 'node:path';
import { AVAILABLE_FIVE_STAGE_LESSONS } from '../src/data/lessonStagesData';
import { EXPLORE_TRY_IT, tryItLines } from '../src/data/exploreTryIt';
import { compileAndRunKotlin } from '../src/utils/kotlinRunner';
import { makeKotlinExampleRunnable } from '../../src/utils/kotlinExample';

const realOnlyFile = path.resolve('scripts/minikotlin/real-only-outputs.json');
const realOnly: Record<string, unknown> = fs.existsSync(realOnlyFile) ? JSON.parse(fs.readFileSync(realOnlyFile, 'utf8')) : {};
const list = process.argv.includes('--list');
const norm = (s: string) => s.replace(/\r/g, '').split('\n').map((l) => l.replace(/\s+$/, '')).join('\n').replace(/\n+$/, '');

let total = 0, disabled = 0, overridden = 0, ok = 0;
const problems: string[] = [];
const unknownKeys = new Set(Object.keys(EXPLORE_TRY_IT));
const seen = new Set<string>();
for (const lesson of Object.values(AVAILABLE_FIVE_STAGE_LESSONS)) {
  if (seen.has(lesson.id)) continue;
  seen.add(lesson.id);
  // The Learn stage's example (key `<lesson id>/learn`) is checked the same way; it has no stored output to compare.
  {
    total++;
    const key = `${lesson.id}/learn`;
    unknownKeys.delete(key);
    const lines = tryItLines(lesson.id, 'learn', lesson.learn.codeSnippet);
    if (lines === null) disabled++;
    else {
      if (EXPLORE_TRY_IT[key]) overridden++;
      const r = await compileAndRunKotlin(makeKotlinExampleRunnable(lines));
      if (EXPLORE_TRY_IT[key]?.expectError) {
        if (r.success) problems.push(`${key}: marked expectError but runs fine`);
        else ok++;
      } else if (r.success) ok++;
      else problems.push(`${key}: ${r.error?.message}` + (list ? `\n${lesson.learn.codeSnippet.map((l) => '      | ' + l).join('\n')}` : ''));
    }
  }
  for (const c of lesson.explore?.cards ?? []) {
    total++;
    const key = `${lesson.id}/${c.id}`;
    unknownKeys.delete(key);
    const lines = tryItLines(lesson.id, c.id, c.code);
    if (lines === null) { disabled++; continue; }
    if (EXPLORE_TRY_IT[key]) overridden++;
    const src = makeKotlinExampleRunnable(lines);
    const r = await compileAndRunKotlin(src);
    if (c.outputKind) {
      if (r.success) problems.push(`${key}: documented as a ${c.outputKind} but runs fine`);
      else ok++;
      continue;
    }
    if (!r.success) {
      problems.push(`${key}: ${r.error?.message}` + (list ? `\n${c.code.map((l) => '      | ' + l).join('\n')}` : ''));
      continue;
    }
    if (c.output && !realOnly[key] && norm(r.output) !== c.output.join('\n')) {
      problems.push(`${key}: prints ${JSON.stringify(norm(r.output))} but the card says ${JSON.stringify(c.output.join('\n'))}`);
      continue;
    }
    ok++;
  }
}
for (const k of unknownKeys) problems.push(`${k}: listed in EXPLORE_TRY_IT but no such card`);
console.log(`${total} Explore cards: ${ok} run, ${disabled} have Try it disabled, ${overridden} use an override; ${problems.length} problems`);
for (const p of problems) console.log('  ' + p);
process.exit(problems.length ? 1 : 0);

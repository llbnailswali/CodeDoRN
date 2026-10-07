/**
 * Explore-card output generator with a second opinion.
 * Runs every Explore card of the chosen worlds on the simulator (compileAndRunKotlin) AND on the minikotlin.run oracle.
 *   agree + non-empty -> `output` (with --apply, written into the card)
 *   agree + empty     -> `output: []` (the card shows "(no output)")
 *   anything else     -> listed for manual review (never written)
 * Usage: npx tsx scripts/minikotlin/crosscheck-explore.ts 1 2 3 [--apply] [--json=report.json]
 * Needs: node scripts/minikotlin/fetch.mjs (once).
 */
import fs from 'node:fs';
import path from 'node:path';
import { Node, Project, SyntaxKind } from 'ts-morph';
import { AVAILABLE_FIVE_STAGE_LESSONS } from '../../src/data/lessonStagesData';
import { CODEDO_MASTER_WORLDS } from '../../src/data/curriculum/masterCurriculumCatalog';
import { compileAndRunKotlin } from '../../src/utils/kotlinRunner';
import { MINIKOTLIN_READY, runMiniKotlin } from './run';
import { REAL_KOTLIN_READY, runRealKotlin } from './real-kotlin';

const useReal = process.argv.includes('--real');
if (useReal ? !REAL_KOTLIN_READY : !MINIKOTLIN_READY) { console.error(useReal ? 'Run `npm run kotlinc:fetch` first.' : 'Run `node scripts/minikotlin/fetch.mjs` first.'); process.exit(1); }
const args = process.argv.slice(2);
const apply = args.includes('--apply');
const jsonOut = args.find((a) => a.startsWith('--json='))?.slice(7);
const worlds = args.filter((a) => /^\d+$/.test(a)).map(Number);
if (!worlds.length) { console.error('Give world numbers, e.g. 1 2 3'); process.exit(1); }

// Cards where minikotlin is wrong/unsupported but the simulator output was checked by hand against real Kotlin semantics.
// Accepted only while the simulator still prints exactly the output recorded here (so a later engine change forces a re-check).
const VERIFIED_FILE = path.join(path.dirname(new URL(import.meta.url).pathname), 'verified-by-hand.json');
const verified: Record<string, { reason: string; output?: string[] }> = fs.existsSync(VERIFIED_FILE) ? JSON.parse(fs.readFileSync(VERIFIED_FILE, 'utf8')) : {};

// Cards that must never get an output (nondeterministic on real Kotlin, even if a single run happens to look stable).
const EXCLUDED_FILE = path.join(path.dirname(new URL(import.meta.url).pathname), 'excluded-cards.json');
const excluded: Record<string, string> = fs.existsSync(EXCLUDED_FILE) ? JSON.parse(fs.readFileSync(EXCLUDED_FILE, 'utf8')) : {};

// Cards whose point IS an error. Only these ever get an error shown as their output (never a harness error).
const DEMOS_FILE = path.join(path.dirname(new URL(import.meta.url).pathname), 'error-demos.json');
const demos: Record<string, 'compile' | 'runtime'> = fs.existsSync(DEMOS_FILE) ? JSON.parse(fs.readFileSync(DEMOS_FILE, 'utf8')) : {};
const stripPkg = (s: string) => s.replace(/\bc\d+[./]/g, '');

const norm = (s: string) => s.replace(/\r/g, '').split('\n').map((l) => l.replace(/\s+$/, '')).join('\n').replace(/\n+$/, '');
const wrap = (frag: string) => (frag.includes('fun main(') ? frag : `fun main() {\n${frag}\n}`);

interface Row { kind?: 'runtimeError' | 'compileError'; realOnly?: boolean; lessonId: string; cardId: string; status: 'write' | 'empty' | 'review'; output?: string[]; why?: string; file?: string }
const rows: Row[] = [];

async function pool<T>(items: T[], n: number, fn: (t: T) => Promise<void>) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) await fn(items[i++]); }));
}

const jobs: { lessonId: string; cardId: string; code: string; raw: string }[] = [];
for (const w of worlds) {
  const world = CODEDO_MASTER_WORLDS.find((x) => x.id === `world-${w}`);
  if (!world) throw new Error(`no world-${w}`);
  const seen = new Set<string>();
  for (const entry of world.lessons) {
    const lesson = AVAILABLE_FIVE_STAGE_LESSONS[entry.fiveStageLessonKey!];
    if (!lesson || seen.has(lesson.id)) continue;
    seen.add(lesson.id);
    for (const c of lesson.explore?.cards ?? []) jobs.push({ lessonId: lesson.id, cardId: c.id, code: wrap(c.code.join('\n')), raw: c.code.join('\n') });
  }
}
console.log(`${jobs.length} cards in worlds ${worlds.join(', ')}`);

// --real: real kotlinc is the judge (one batch). A card is written only when the simulator prints exactly what real Kotlin prints.
const real = useReal ? await runRealKotlin(jobs.map((j) => ({ id: `${j.lessonId}/${j.cardId}`, code: j.raw }))) : undefined;

await pool(jobs, 4, async (j) => {
  if (excluded[`${j.lessonId}/${j.cardId}`]) { rows.push({ lessonId: j.lessonId, cardId: j.cardId, status: 'review', why: `EXCLUDED: ${excluded[`${j.lessonId}/${j.cardId}`]}` }); return; }
  if (real) {
    const sim = await compileAndRunKotlin(j.code);
    const rr = real.get(`${j.lessonId}/${j.cardId}`)!;
    const row: Row = { lessonId: j.lessonId, cardId: j.cardId, status: 'review' };
    const demo = demos[`${j.lessonId}/${j.cardId}`];
    if (demo === 'compile' && rr.stage === 'compile') {
      row.status = 'write'; row.realOnly = true; row.kind = 'compileError'; row.why = 'ERROR DEMO (compile)';
      row.output = [...new Set((rr.errors ?? []).map((e) => 'error: ' + stripPkg(e.replace(/^line \d+: /, ''))))].slice(0, 3);
    }
    else if (demo === 'runtime' && rr.stage === 'run' && /^Exception in thread/.test(rr.errors?.[0] ?? '')) {
      row.status = 'write'; row.realOnly = true; row.kind = 'runtimeError'; row.why = 'ERROR DEMO (runtime)';
      row.output = [...(norm(rr.output ?? '') ? norm(rr.output ?? '').split('\n') : []), stripPkg(rr.errors![0])];
    }
    else if (rr.stage === 'compile') row.why = `REAL compile error: ${(rr.errors ?? []).join('; ')}`;
    else if (rr.stage === 'run') row.why = `REAL run error: ${(rr.errors ?? []).join('; ')} (stdout ${JSON.stringify(norm(rr.output ?? ''))})`;
    else if (!sim.success || norm(sim.output) !== norm(rr.output ?? '')) {
      // The simulator cannot reproduce real Kotlin here (gap or bug). The card shows what real kotlinc printed;
      // the id is recorded in real-only-outputs.json so audit:explore-output knows not to expect the simulator to match.
      row.status = 'write'; row.output = norm(rr.output ?? '') ? norm(rr.output ?? '').split('\n') : []; row.realOnly = true;
      row.why = sim.success ? `SIM BUG (sim=${JSON.stringify(norm(sim.output))})` : `SIM GAP (${sim.error?.message})`;
    }
    else { row.status = 'write'; row.output = norm(sim.output) ? norm(sim.output).split('\n') : []; }
    rows.push(row);
    return;
  }
  const [sim, mini] = await Promise.all([compileAndRunKotlin(j.code), runMiniKotlin(j.code)]);
  const row: Row = { lessonId: j.lessonId, cardId: j.cardId, status: 'review' };
  const v = verified[`${j.lessonId}/${j.cardId}`];
  if (!sim.success) row.why = `simulator: ${sim.error?.message}`;
  else if (v && mini.stage !== 'ok' || v && norm(sim.output) !== norm(mini.output ?? '')) {
    row.status = 'write'; row.output = norm(sim.output) ? norm(sim.output).split('\n') : [];
    if (v.output && JSON.stringify(v.output) !== JSON.stringify(row.output)) { row.status = 'review'; row.why = `verified output changed: ${JSON.stringify(row.output)}`; }
  }
  else if (mini.stage !== 'ok') row.why = `minikotlin ${mini.stage}: ${(mini.errors ?? []).join('; ')}`;
  else if (norm(sim.output) !== norm(mini.output ?? '')) row.why = `DIFF sim=${JSON.stringify(norm(sim.output))} mini=${JSON.stringify(norm(mini.output ?? ''))}`;
  else { row.status = 'write'; row.output = norm(sim.output) ? norm(sim.output).split('\n') : []; }
  rows.push(row);
});
rows.sort((a, b) => (a.lessonId + a.cardId).localeCompare(b.lessonId + b.cardId));

const count = (s: Row['status']) => rows.filter((r) => r.status === s).length;
console.log({ write: count('write'), of_which_no_output: rows.filter((r) => r.status === 'write' && !r.output!.length).length, review: count('review') });

if (apply) {
  const project = new Project({ tsConfigFilePath: path.resolve('tsconfig.json'), skipAddingFilesFromTsConfig: true });
  const dir = path.resolve('src/data/curriculum');
  const files = fs.readdirSync(dir).filter((f) => /^world\d+LessonsData\.ts$/.test(f)).map((f) => project.addSourceFileAtPath(path.join(dir, f)));
  let written = 0;
  const tableFile = path.resolve('src/data/curriculum/exploreOutputsGenerated.ts');
  const generated: Record<string, string[] | { output: string[]; kind: 'runtimeError' | 'compileError' }> = {};
  if (fs.existsSync(tableFile)) for (const m of fs.readFileSync(tableFile, 'utf8').matchAll(/^ {2}'((?:[^'\\]|\\.)*)': (\[.*\]),$/gm)) generated[m[1].replace(/\\(.)/g, '$1')] = eval(m[2]);
  if (fs.existsSync(tableFile)) for (const m of fs.readFileSync(tableFile, 'utf8').matchAll(/^ {2}'((?:[^'\\]|\\.)*)': \{ output: (\[.*\]), kind: '(\w+)' \},$/gm)) generated[m[1].replace(/\\(.)/g, '$1')] = { output: eval(m[2]), kind: m[3] as 'runtimeError' | 'compileError' };
  for (const r of rows) delete generated[`${r.lessonId}/${r.cardId}`]; // rows processed in this run are re-decided below
  const textOf = (n: Node | undefined) => n?.getText().replace(/['"`]/g, '');
  const propText = (o: import('ts-morph').ObjectLiteralExpression, name: string) => { const p = o.getProperty(name); return p && Node.isPropertyAssignment(p) ? textOf(p.getInitializer()) : undefined; };
  type Obj = import('ts-morph').ObjectLiteralExpression;
  const objs = files.flatMap((sf) => sf.getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression).map((o) => ({ sf, o })));
  /** Finds the literal card object (with its own `id`) inside its lesson. Cards from factories/config arrays or built in code have none: they go to the generated table. */
  const locate = (lessonId: string, cardId: string): { sf: (typeof files)[number]; card: Obj } | undefined => {
    const nth = /-explore-(\d+)$/.exec(cardId);
    const idx = nth ? Number(nth[1]) - 1 : -1;
    const itemsOf = (o: Obj, prop: string): Obj[] | undefined => {
      const p = o.getProperty(prop);
      const init = p && Node.isPropertyAssignment(p) ? p.getInitializer() : undefined;
      return init && Node.isArrayLiteralExpression(init) ? (init.getElements().filter((e) => Node.isObjectLiteralExpression(e)) as Obj[]) : undefined;
    };
    for (const { sf, o } of objs) {
      // (1) a literal card with its own id inside the lesson's `explore.cards`
      // Card ids repeat across lessons (e.g. `boss-explore-2`), so the card must sit inside the lesson object with this id.
      if (propText(o, 'id') === cardId && o.getProperty('whatItMeans') && o.getAncestors().some((a) => Node.isObjectLiteralExpression(a) && propText(a, 'id') === lessonId)) return { sf, card: o };
    }
    return undefined;
  };
  for (const r of rows.filter((x) => x.status === 'write')) {
    const hit = locate(r.lessonId, r.cardId);
    if (!hit) {
      // Built in code (pushed by a helper): keep the output in the generated lookup table unless the card already carries it.
      generated[`${r.lessonId}/${r.cardId}`] = r.kind ? { output: r.output!, kind: r.kind } : r.output!; r.file = 'exploreOutputsGenerated.ts'; written++;
      continue;
    }
    const lit = '[' + r.output!.map((l) => `'${l.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`).join(', ') + ']';
    const existing = hit.card.getProperty('output');
    if (existing && Node.isPropertyAssignment(existing)) existing.setInitializer(lit);
    else {
      const code = hit.card.getProperty('code');
      hit.card.insertPropertyAssignment(code ? hit.card.getProperties().indexOf(code) + 1 : 0, { name: 'output', initializer: lit });
    }
    const kindProp = hit.card.getProperty('outputKind');
    if (r.kind) { if (kindProp && Node.isPropertyAssignment(kindProp)) kindProp.setInitializer(`'${r.kind}'`); else hit.card.insertPropertyAssignment(hit.card.getProperties().indexOf(hit.card.getProperty('output')!) + 1, { name: 'outputKind', initializer: `'${r.kind}'` }); }
    else if (kindProp) kindProp.remove();
    r.file = hit.sf.getBaseName(); written++;
  }
  project.saveSync();
  const q = (s: string) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  fs.writeFileSync(tableFile,
    '// GENERATED by scripts/minikotlin/crosscheck-explore.ts --apply: Explore output for cards built in code. Do not edit by hand.\n' +
    'export const EXPLORE_OUTPUTS_GENERATED: Record<string, string[] | { output: string[]; kind: \'runtimeError\' | \'compileError\' }> = {\n' +
    Object.entries(generated).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => Array.isArray(v) ? `  ${q(k)}: [${v.map(q).join(', ')}],\n` : `  ${q(k)}: { output: [${v.output.map(q).join(', ')}], kind: '${v.kind}' },\n`).join('') + '};\n');
  console.log(`wrote output into ${written} cards`);
  if (useReal) {
    const f = path.join(path.dirname(new URL(import.meta.url).pathname), 'real-only-outputs.json');
    const cur: Record<string, { output: string[]; note: string; kind?: string }> = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {};
    for (const r of rows) {
      const k = `${r.lessonId}/${r.cardId}`;
      if (r.realOnly && r.status === 'write') cur[k] = { output: r.output!, note: r.why!, ...(r.kind ? { kind: r.kind } : {}) };
      else if (r.status === 'write') delete cur[k];
    }
    fs.writeFileSync(f, JSON.stringify(cur, null, 2) + '\n');
  }
}

if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(rows, null, 2));
for (const r of rows.filter((x) => x.status === 'review')) console.log(`REVIEW ${r.lessonId}/${r.cardId}: ${r.why}`);
process.exit(0);

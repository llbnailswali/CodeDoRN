/**
 * Compares how the in-app simulator and the REAL Kotlin compiler react to programs that contain a mistake.
 *
 *   npm run compare:errors                       # all worlds, default sample
 *   npm run compare:errors -- --per-op=60        # fewer mutants per mistake type (quicker)
 *   npm run compare:errors -- --seed=7 --worlds=1,2,3
 *
 * Programs under test: (1) the authored Debug `brokenCode` programs, and (2) mutants: every valid reference program with ONE common
 * mistake injected by a rule (scripts/compare-errors/mutations.ts). Both engines run each program; the report says where they
 * disagree (compile error vs fine vs runtime error, the line, the token, the exception type, the output). No AI is involved.
 * Needs tools/kotlinc (`npm run kotlinc:fetch`). Writes <repo>/outputs/real-kotlin-compare/{report.md,results.json}.
 */
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { Worker } from 'node:worker_threads';
import { AVAILABLE_FIVE_STAGE_LESSONS } from '../../src/data/lessonStagesData';
import { PRACTICE_DEBUG_BANK, PRACTICE_WRITE_RUN_BANK } from '../../src/data/practiceBank';
import { OPERATORS, applyEdit, lineOf, maskStringsAndComments, rng } from './mutations';

const run = promisify(execFile);
const arg = (name: string, fallback: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const PER_OP = Number(arg('per-op', '120'));
const SEED = Number(arg('seed', '1'));
const WORLDS = arg('worlds', '').split(',').filter(Boolean).map(Number);
const CHUNK = Number(arg('chunk', '200'));
const OUT_DIR = path.resolve('..', 'outputs', 'real-kotlin-compare');

const TOOLS = path.resolve('tools');
const KOTLINC = path.join(TOOLS, 'kotlinc', 'bin', 'kotlinc');
const STDLIB = path.join(TOOLS, 'kotlinc', 'lib', 'kotlin-stdlib.jar');
const COROUTINES = fs.readdirSync(TOOLS).filter((f) => /^kotlinx-coroutines-core-jvm.*\.jar$/.test(f)).map((f) => path.join(TOOLS, f))[0];
if (!fs.existsSync(KOTLINC)) { console.error('tools/kotlinc is missing. Run `npm run kotlinc:fetch` first.'); process.exit(1); }

// ---------------------------------------------------------------- programs under test
interface Program { id: string; op: string; code: string; baseId: string; world: number; mutation?: { line: number; desc: string; before: string; after: string } }

function worldOf(id: string): number {
  const m = /world-(\d+)/.exec(id);
  return m ? Number(m[1]) : 0;
}

function collect() {
  const valid: { id: string; code: string }[] = [];
  const broken: { id: string; code: string }[] = [];
  const add = (list: { id: string; code: string }[], id: string, code?: string) => { if (code && /\bfun\s+main\s*\(/.test(code)) list.push({ id, code }); };
  for (const lesson of Object.values(AVAILABLE_FIVE_STAGE_LESSONS)) {
    add(valid, `${lesson.id}:solution`, lesson.writeRun?.solutionCode);
    add(valid, `${lesson.id}:fixed`, lesson.debug?.fixedCode);
    add(broken, `${lesson.id}:broken`, lesson.debug?.brokenCode);
  }
  for (const list of Object.values(PRACTICE_WRITE_RUN_BANK)) for (const p of list) add(valid, `${p.id}:solution`, p.solutionCode);
  for (const list of Object.values(PRACTICE_DEBUG_BANK)) for (const p of list) { add(valid, `${p.id}:fixed`, p.fixedCode); add(broken, `${p.id}:broken`, p.brokenCode); }
  const keep = (x: { id: string }) => !WORLDS.length || WORLDS.includes(worldOf(x.id));
  return { valid: valid.filter(keep), broken: broken.filter(keep) };
}

function buildPrograms(): Program[] {
  const { valid, broken } = collect();
  const programs: Program[] = broken.map((b) => ({ id: b.id, op: 'authored-broken', code: b.code, baseId: b.id, world: worldOf(b.id) }));
  const random = rng(SEED);
  for (const op of OPERATORS) {
    const candidates: Program[] = [];
    for (const base of valid) {
      const masked = maskStringsAndComments(base.code);
      const edits = op.edits(base.code, masked);
      // up to 2 sites per program, chosen by the seeded generator
      for (let n = 0; n < Math.min(2, edits.length); n++) {
        const e = edits.splice(Math.floor(random() * edits.length), 1)[0];
        const code = applyEdit(base.code, e);
        if (code === base.code) continue;
        const line = lineOf(base.code, e.start);
        candidates.push({ id: `${base.id}#${op.name}#${candidates.length}`, op: op.name, code, baseId: base.id, world: worldOf(base.id), mutation: { line, desc: e.desc, before: base.code.split('\n')[line - 1] ?? '', after: code.split('\n')[line - 1] ?? '' } });
      }
    }
    for (let i = candidates.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [candidates[i], candidates[j]] = [candidates[j], candidates[i]]; }
    const seen = new Set<string>();
    for (const c of candidates) { if (seen.has(c.code)) continue; seen.add(c.code); programs.push(c); if (seen.size >= PER_OP) break; }
  }
  return programs;
}

// ---------------------------------------------------------------- real kotlinc
type Kind = 'compile' | 'runtime' | 'ok' | 'timeout' | 'crash' | 'hang';
interface Outcome { kind: Kind; errors: { line: number; col: number; msg: string }[]; out: string; exc?: string; message?: string; rtLine?: number }

const USES_COROUTINES = /\b(runBlocking|launch|async|delay|coroutineScope|supervisorScope|withContext|Flow|flow|Job|Deferred|Dispatchers)\b/;

async function runWithLimit<T>(items: T[], limit: number, fn: (item: T) => Promise<void>) {
  let i = 0;
  await Promise.all(Array.from({ length: limit }, async () => { while (i < items.length) await fn(items[i++]); }));
}

async function realChunk(chunk: Program[], results: Map<string, Outcome>) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cmp-'));
  const prefixes: string[] = [];
  const files = chunk.map((p, k) => {
    const prefix = `package p${k}; ` + (USES_COROUTINES.test(p.code) && !/import kotlinx\.coroutines/.test(p.code) ? 'import kotlinx.coroutines.*; import kotlinx.coroutines.flow.*; ' : '');
    prefixes[k] = prefix;
    fs.mkdirSync(path.join(dir, `p${k}`), { recursive: true });
    const file = path.join(dir, `p${k}`, 'Main.kt');
    fs.writeFileSync(file, prefix + p.code);
    return file;
  });
  const compile = async (indexes: number[], out: string) => {
    const argFile = path.join(dir, `args-${path.basename(out)}.txt`);
    fs.writeFileSync(argFile, ['-nowarn', '-cp', COROUTINES, '-d', out, ...indexes.map((k) => files[k])].join('\n'));
    try { const r = await run(KOTLINC, ['-J-Xmx3g', `@${argFile}`], { maxBuffer: 1 << 28, timeout: 900000 }); return r.stderr; }
    catch (e: any) { return `${e.stderr ?? ''}${e.stdout ?? ''}`; }
  };
  const all = chunk.map((_, k) => k);
  const stderr = await compile(all, path.join(dir, 'out1'));
  const failing = new Set<number>();
  for (const m of stderr.matchAll(/\/p(\d+)\/Main\.kt:(\d+):(\d+): error: (.*)/g)) {
    const k = Number(m[1]);
    failing.add(k);
    const col = Number(m[3]) - 1 - (Number(m[2]) === 1 ? prefixes[k].length : 0);
    const o = results.get(chunk[k].id) ?? { kind: 'compile' as Kind, errors: [], out: '' };
    o.errors.push({ line: Number(m[2]), col: Math.max(0, col), msg: m[4].trim() });
    results.set(chunk[k].id, o);
  }
  for (const m of stderr.matchAll(/(?:exception: |File being compiled:).*?\/p(\d+)\/Main\.kt/gs)) {
    const k = Number(m[1]);
    if (!failing.has(k)) { failing.add(k); results.set(chunk[k].id, { kind: 'crash', errors: [], out: '', message: 'kotlinc internal error' }); }
  }
  const survivors = all.filter((k) => !failing.has(k));
  let out = path.join(dir, 'out1');
  if (failing.size && survivors.length) { out = path.join(dir, 'out2'); const again = await compile(survivors, out); if (/error:/.test(again)) for (const k of survivors) results.set(chunk[k].id, { kind: 'crash', errors: [], out: '', message: 'second compile failed' }); }
  await runWithLimit(survivors.filter((k) => !results.has(chunk[k].id)), 6, async (k) => {
    try {
      const r = await run('java', ['-cp', [out, STDLIB, COROUTINES].join(':'), `p${k}.MainKt`], { timeout: 4000, maxBuffer: 1 << 24 });
      results.set(chunk[k].id, { kind: 'ok', errors: [], out: r.stdout });
    } catch (e: any) {
      const text = String(e.stderr ?? '');
      if (e.killed || e.signal) results.set(chunk[k].id, { kind: 'timeout', errors: [], out: e.stdout ?? '' });
      else results.set(chunk[k].id, { kind: 'runtime', errors: [], out: e.stdout ?? '', exc: /Exception in thread "main" ([\w.$]+)/.exec(text)?.[1], message: text.split('\n')[0], rtLine: Number(/\(Main\.kt:(\d+)\)/.exec(text)?.[1] ?? 0) });
    }
  });
  fs.rmSync(dir, { recursive: true, force: true });
}

// ---------------------------------------------------------------- comparison
const normExc = (name?: string) => {
  if (!name) return 'unknown';
  const short = name.split(/[.$]/).pop()!;
  return short.replace(/^(Array|String)IndexOutOfBounds/, 'IndexOutOfBounds').replace(/^Kotlin/, '');
};

interface SimOutcome extends Outcome { span?: { start: number; end: number; line: number }; simLine?: number }

/** One reusable worker; a program that never returns gets the worker killed and replaced, and is reported as a hang. */
class SimPool {
  private worker!: Worker;
  constructor() { this.spawn(); }
  private spawn() { this.worker = new Worker(path.resolve('scripts/compare-errors/sim-worker.ts'), { execArgv: ['--import', 'tsx'] }); }
  async stop() { await this.worker.terminate(); }
  simulate(p: Program): Promise<SimOutcome> {
    return new Promise((resolve) => {
      const timer = setTimeout(() => { this.worker.terminate(); this.spawn(); resolve({ kind: 'hang', errors: [], out: '', message: 'the simulator never returned (no timeout fired)' }); }, 8000);
      this.worker.once('message', (m: { output: string; error: { message: string; line: number; type: string } | null; span: SimOutcome['span'] | null }) => {
        clearTimeout(timer);
        resolve(toOutcome(m));
      });
      this.worker.postMessage({ id: p.id, code: p.code });
    });
  }
}

function toOutcome(m: { output: string; error: { message: string; line: number; type: string } | null; span: SimOutcome['span'] | null }): SimOutcome {
  if (!m.error) return { kind: 'ok', errors: [], out: m.output };
  if (m.error.type !== 'runtime_error') {
    return { kind: 'compile', errors: [{ line: m.error.line, col: m.span?.start ?? -1, msg: m.error.message }], out: '', span: m.span ?? undefined, simLine: m.error.line };
  }
  const msg = m.error.message;
  if (/timed out|infinite loop/i.test(msg)) return { kind: 'timeout', errors: [], out: m.output };
  const exc = /\b([A-Z]\w*(?:Exception|Error))\b/.exec(msg.replace(/^Runtime error: /, ''))?.[1];
  const jsNull = /Cannot read propert(?:y|ies) of (?:null|undefined)/.test(msg);
  return { kind: 'runtime', errors: [], out: m.output, exc: jsNull ? 'NullPointerException' : exc, message: msg, rtLine: m.error.line };
}

type Verdict = 'agree' | 'simulator-hang' | 'false-accept' | 'false-reject' | 'missed-runtime' | 'extra-runtime' | 'compile-line-differs' | 'compile-token-differs' | 'exception-differs' | 'runtime-line-differs' | 'output-differs' | 'other' | 'skipped';

function compare(p: Program, real: Outcome, sim: SimOutcome): { verdict: Verdict; detail: string } {
  if (sim.kind === 'hang') return { verdict: 'simulator-hang', detail: `kotlinc: ${real.kind}${real.errors[0] ? ' ' + real.errors[0].msg : ''}` };
  if (real.kind === 'crash') return { verdict: 'skipped', detail: real.message ?? 'kotlinc crashed' };
  if (real.kind === sim.kind) {
    if (real.kind === 'compile') {
      const first = [...real.errors].sort((a, b) => a.line - b.line || a.col - b.col)[0];
      // A missing bracket or quote: both engines say "syntax error". Where they point differs by design (we mark the unclosed opener,
      // kotlinc the spot where it expected the closer), so the location is not compared for these.
      if (/^(syntax error|unclosed)/i.test(sim.errors[0].msg.replace(/^Compilation error: /, '')) && real.errors.every((e) => /^syntax error/i.test(e.msg))) return { verdict: 'agree', detail: '' };
      // The simulator says "syntax error" and kotlinc recovers differently (often reporting an unresolved reference on the next line): both reject.
      if (/^(syntax error|unclosed)/i.test(sim.errors[0].msg.replace(/^Compilation error: /, ''))) return { verdict: 'agree', detail: '' };
      const lines = new Set(real.errors.map((e) => e.line));
      if (!lines.has(sim.simLine ?? -1)) return { verdict: 'compile-line-differs', detail: `simulator line ${sim.simLine}: ${sim.errors[0].msg} | kotlinc line ${first.line}: ${first.msg}` };
      const onLine = real.errors.filter((e) => e.line === sim.simLine);
      const hit = sim.span && onLine.some((e) => e.col >= sim.span!.start - 1 && e.col <= sim.span!.end);
      if (sim.span && !hit) return { verdict: 'compile-token-differs', detail: `simulator marks columns ${sim.span.start}-${sim.span.end} (${sim.errors[0].msg}) | kotlinc column ${onLine[0].col} (${onLine[0].msg})` };
      return { verdict: 'agree', detail: '' };
    }
    if (real.kind === 'runtime') {
      if (normExc(real.exc) !== normExc(sim.exc)) return { verdict: 'exception-differs', detail: `simulator ${normExc(sim.exc)} | kotlinc ${normExc(real.exc)}` };
      // Same exception: the reported line must match the first Main.kt frame of real Kotlin's stack trace.
      if (real.rtLine && real.rtLine !== sim.rtLine) return { verdict: 'runtime-line-differs', detail: `simulator line ${sim.rtLine || 'none'} | kotlinc line ${real.rtLine} (${normExc(real.exc)})` };
      return { verdict: 'agree', detail: '' };
    }
    if (real.kind === 'ok') {
      const a = real.out.replace(/\r\n/g, '\n').trimEnd(), b = sim.out.replace(/\r\n/g, '\n').trimEnd();
      return a === b ? { verdict: 'agree', detail: '' } : { verdict: 'output-differs', detail: `simulator ${JSON.stringify(b.slice(0, 80))} | kotlinc ${JSON.stringify(a.slice(0, 80))}` };
    }
    return { verdict: 'agree', detail: '' };
  }
  if (real.kind === 'compile') return { verdict: 'false-accept', detail: `kotlinc: ${real.errors[0]?.msg} (line ${real.errors[0]?.line}) | simulator: ${sim.kind}${sim.exc ? ' ' + sim.exc : ''}` };
  if (sim.kind === 'compile') return { verdict: 'false-reject', detail: `simulator: ${sim.errors[0].msg} (line ${sim.simLine}) | kotlinc: ${real.kind}${real.exc ? ' ' + normExc(real.exc) : ''}` };
  if (real.kind === 'runtime' && sim.kind === 'ok') return { verdict: 'missed-runtime', detail: `kotlinc throws ${normExc(real.exc)}: ${real.message ?? ''}`.slice(0, 160) };
  if (real.kind === 'ok' && sim.kind === 'runtime') return { verdict: 'extra-runtime', detail: `simulator throws ${normExc(sim.exc)}: ${(sim.message ?? '').slice(0, 120)}` };
  return { verdict: 'other', detail: `kotlinc ${real.kind}${real.exc ? ' ' + normExc(real.exc) : ''} | simulator ${sim.kind}${sim.exc ? ' ' + normExc(sim.exc) : ''}` };
}

// ---------------------------------------------------------------- main
(async () => {
  const started = Date.now();
  const programs = buildPrograms();
  console.log(`${programs.length} programs (${programs.filter((p) => p.op === 'authored-broken').length} authored broken, the rest mutants). Seed ${SEED}.`);

  // The real compiler pass is the slow part, so its results are cached (keyed by the exact program set); --fresh redoes it.
  const cacheFile = path.join(OUT_DIR, `real-cache-${SEED}-${PER_OP}-${WORLDS.join('_') || 'all'}.json`);
  const real = new Map<string, Outcome>();
  if (!process.argv.includes('--fresh') && fs.existsSync(cacheFile)) {
    const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8')) as [string, Outcome][];
    if (cached.length === programs.length) { for (const [k, v] of cached) real.set(k, v); console.log(`Using cached real-kotlinc results (${cacheFile}).`); }
  }
  if (!real.size) {
    console.log('Running the real Kotlin compiler...');
    for (let i = 0; i < programs.length; i += CHUNK) {
      await realChunk(programs.slice(i, i + CHUNK), real);
      console.log(`  kotlinc ${Math.min(i + CHUNK, programs.length)}/${programs.length}`);
    }
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(cacheFile, JSON.stringify([...real]));
  }

  console.log('Running the simulator...');
  const rows: { p: Program; real: Outcome; sim: SimOutcome; verdict: Verdict; detail: string }[] = [];
  let n = 0;
  const pool = new SimPool();
  for (const p of programs) {
    const r = real.get(p.id) ?? { kind: 'crash' as Kind, errors: [], out: '', message: 'no result' };
    const s = await pool.simulate(p);
    const { verdict, detail } = compare(p, r, s);
    rows.push({ p, real: r, sim: s, verdict, detail });
    if (++n % 500 === 0) console.log(`  simulator ${n}/${programs.length}`);
  }

  await pool.stop();

  // ---- report
  const ops = ['authored-broken', ...OPERATORS.map((o) => o.name)];
  const verdicts: Verdict[] = ['agree', 'simulator-hang', 'false-accept', 'false-reject', 'missed-runtime', 'extra-runtime', 'compile-line-differs', 'compile-token-differs', 'exception-differs', 'runtime-line-differs', 'output-differs', 'other', 'skipped'];
  const count = (f: (r: (typeof rows)[number]) => boolean) => rows.filter(f).length;
  const scored = rows.filter((r) => r.verdict !== 'skipped');
  const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 1000) / 10}%` : '-');
  let md = `# Simulator vs real Kotlin on programs with a mistake\n\nGenerated ${new Date().toISOString()} · seed ${SEED} · ${rows.length} programs (${rows.length - scored.length} skipped: kotlinc crash) · ${Math.round((Date.now() - started) / 1000)}s\n\n`;
  md += `**Overall agreement: ${pct(count((r) => r.verdict === 'agree'), scored.length)}** (same kind of outcome, same line, same token or exception, same output)\n\n`;
  md += '| Verdict | Count | Meaning |\n| --- | ---: | --- |\n';
  const meaning: Record<string, string> = {
    agree: 'same result', 'simulator-hang': 'the simulator never returned on this program (would freeze the app)', 'false-accept': 'kotlinc rejects, simulator runs it (teaches wrong Kotlin)', 'false-reject': 'simulator rejects, kotlinc accepts (tells a learner correct code is wrong)',
    'missed-runtime': 'kotlinc throws at runtime, simulator does not', 'extra-runtime': 'simulator throws, kotlinc does not', 'compile-line-differs': 'both reject, but on different lines',
    'compile-token-differs': 'both reject on the same line, but we underline a different token', 'exception-differs': 'both throw, different exception type', 'runtime-line-differs': 'both throw the same exception, but report different lines', 'output-differs': 'both run, different output', other: 'other kind mismatch (e.g. timeout)', skipped: 'kotlinc crashed',
  };
  for (const v of verdicts) md += `| ${v} | ${count((r) => r.verdict === v)} | ${meaning[v]} |\n`;
  md += '\n## By mistake type\n\n| Mistake | Programs | Agree | false-accept | false-reject | missed-runtime | extra-runtime | line differs | token differs | exception differs | output differs |\n| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |\n';
  for (const op of ops) {
    const mine = scored.filter((r) => r.p.op === op);
    if (!mine.length) continue;
    const c = (v: Verdict) => mine.filter((r) => r.verdict === v).length;
    md += `| ${op} | ${mine.length} | ${pct(c('agree'), mine.length)} | ${c('false-accept')} | ${c('false-reject')} | ${c('missed-runtime')} | ${c('extra-runtime')} | ${c('compile-line-differs')} | ${c('compile-token-differs')} | ${c('exception-differs')} | ${c('output-differs')} |\n`;
  }
  md += '\n## Examples (up to 3 per mistake type and verdict)\n';
  for (const op of ops) {
    for (const v of verdicts.filter((x) => x !== 'agree' && x !== 'skipped')) {
      const mine = scored.filter((r) => r.p.op === op && r.verdict === v).slice(0, 3);
      if (!mine.length) continue;
      md += `\n### ${op} → ${v}\n`;
      for (const r of mine) {
        md += `- \`${r.p.baseId}\`${r.p.mutation ? ` line ${r.p.mutation.line}: \`${r.p.mutation.before.trim()}\` → \`${r.p.mutation.after.trim()}\` (${r.p.mutation.desc})` : ''}\n  - ${r.detail}\n`;
      }
    }
  }
  // ---- ranked gaps: disagreements grouped by what the real compiler said, so the biggest fixes come first without reading examples
  const clusterKey = (r: (typeof rows)[number]) => {
    const kotlinc = /kotlinc(?: line \d+)?: (.*?)(?: \(line \d+\))? \|/.exec(r.detail)?.[1] ?? /\| kotlinc(?: line \d+)?: (.*)$/.exec(r.detail)?.[1] ?? r.detail;
    return `${r.verdict} :: ${kotlinc.replace(/'[^']*'/g, "'_'").replace(/\b\d+\b/g, 'N').slice(0, 90)}`;
  };
  const clusters = new Map<string, number>();
  for (const r of scored) if (r.verdict !== 'agree') clusters.set(clusterKey(r), (clusters.get(clusterKey(r)) ?? 0) + 1);
  const ranked = [...clusters].sort((a, b) => b[1] - a[1]);
  md = md.replace('\n## By mistake type', '\n## Biggest gaps (disagreements grouped by the real compiler\'s message)\n\n' + ranked.slice(0, 25).map(([k, n]) => `- ${n} × ${k}`).join('\n') + '\n\n## By mistake type');

  // ---- baseline: a run can fail when a mistake type got WORSE than the saved baseline (use --update-baseline after a real improvement)
  const summary: Record<string, Record<string, number>> = {};
  for (const r of scored) { const o = (summary[r.p.op] ??= { total: 0 }); o.total++; o[r.verdict] = (o[r.verdict] ?? 0) + 1; }
  const baselineFile = path.resolve('scripts/compare-errors/baseline.json');
  let regressions = 0;
  if (fs.existsSync(baselineFile) && !process.argv.includes('--update-baseline')) {
    const base = JSON.parse(fs.readFileSync(baselineFile, 'utf8')) as typeof summary;
    md += '\n## Change since the baseline\n\n| Mistake | Agree before | Agree now | Hangs |\n| --- | ---: | ---: | ---: |\n';
    for (const op of Object.keys(summary)) {
      const before = base[op]?.agree ?? 0, now = summary[op].agree ?? 0, hang = summary[op]['simulator-hang'] ?? 0;
      if (summary[op].total === (base[op]?.total ?? summary[op].total) && (now < before || hang > (base[op]?.['simulator-hang'] ?? 0))) regressions++;
      md += `| ${op} | ${before}/${base[op]?.total ?? '-'} | ${now}/${summary[op].total}${now > before ? ' ▲' : now < before ? ' ▼ WORSE' : ''} | ${hang} |\n`;
    }
  }
  if (process.argv.includes('--update-baseline')) { fs.writeFileSync(baselineFile, JSON.stringify(summary, null, 1)); console.log(`Baseline saved to ${baselineFile}`); }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, 'report.md'), md);
  fs.writeFileSync(path.join(OUT_DIR, 'ranked-gaps.txt'), ranked.map(([k, n]) => `${n}\t${k}`).join('\n') + '\n');
  fs.writeFileSync(path.join(OUT_DIR, 'results.json'), JSON.stringify(rows.filter((r) => r.verdict !== 'agree').map((r) => ({ id: r.p.id, op: r.p.op, world: r.p.world, verdict: r.verdict, detail: r.detail, mutation: r.p.mutation, code: r.p.code })), null, 1));
  console.log(`\nOverall agreement ${pct(count((r) => r.verdict === 'agree'), scored.length)} over ${scored.length} programs`);
  for (const v of verdicts) if (v !== 'agree') console.log(`  ${v}: ${count((r) => r.verdict === v)}`);
  console.log(`Report: ${path.join(OUT_DIR, 'report.md')}`);
  console.log('Top gaps:'); for (const [k, n] of ranked.slice(0, 12)) console.log(`  ${n} x ${k}`);
  if (regressions) { console.log(`\n${regressions} mistake type(s) got WORSE than the baseline.`); process.exit(2); }
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });

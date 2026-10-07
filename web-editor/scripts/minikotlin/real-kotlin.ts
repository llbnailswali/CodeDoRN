/**
 * Real Kotlin oracle for batches of snippets (dev-only; needs tools/kotlinc and tools/kotlinx-coroutines-core-jvm-*.jar,
 * see `npm run kotlinc:fetch`). Every snippet becomes its own package so all compile in ONE kotlinc call (one JVM start).
 * Layout A: top-level declarations stay top level, loose statements go into `fun main()`.
 * Layout B (retry for A's compile failures): everything inside `fun main()` as locals, like the simulator's wrapper.
 */
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);
const TOOLS = path.resolve('tools');
const KOTLINC = path.join(TOOLS, 'kotlinc', 'bin', 'kotlinc');
const STDLIB = path.join(TOOLS, 'kotlinc', 'lib', 'kotlin-stdlib.jar');
const COROUTINES = fs.existsSync(TOOLS) ? fs.readdirSync(TOOLS).filter((f) => /^kotlinx-coroutines-core-jvm.*\.jar$/.test(f)).map((f) => path.join(TOOLS, f))[0] : undefined;
export const REAL_KOTLIN_READY = fs.existsSync(KOTLINC);

export interface RealResult { stage: 'ok' | 'compile' | 'run'; output?: string; errors?: string[]; layout?: 'A' | 'B' | 'C' }

const MODS = '(?:(?:public|private|internal|protected|open|abstract|sealed|final|inline|suspend|data|enum|annotation|inner|override|tailrec|operator|infix|value|const|lateinit)\\s+)*';
const DECL = new RegExp(`^${MODS}(?:fun|class|interface|object|typealias)\\b|^${MODS}(?:val|var)\\s+(?:<[^>]*>\\s*)?[\\w<>?,]+\\.\\w+`);
// A line continues the previous top-level chunk when it is indented, blank, or starts with a closer/continuation token.
const CONTINUES = /^(?:\s|$|[})\]]|\.|\?\.|\?:|where\b|&&|\|\|)/;

/** Layout A: split into col-0 chunks; declarations stay top level, everything else goes into `fun main()`. */
function layoutA(code: string, wrapRunBlocking = false): string {
  const hasMain = /\bfun\s+main\s*\(/.test(code);
  const chunks: string[][] = [];
  for (const line of code.split('\n')) {
    if (chunks.length && CONTINUES.test(line)) chunks[chunks.length - 1].push(line);
    else chunks.push([line]);
  }
  const imports: string[] = [], decls: string[] = [], body: string[] = [];
  for (const ch of chunks) {
    if (/^import\s/.test(ch[0])) imports.push(...ch);
    else if (hasMain || DECL.test(ch[0])) decls.push(...ch);
    else body.push(...ch);
  }
  return [...imports, ...decls, ...(hasMain ? [] : wrapRunBlocking ? ['fun main() {', '  runBlocking<Unit> {', ...body, '  }', '}'] : ['fun main() {', ...body, '}'])].join('\n');
}

function layoutB(code: string): string {
  if (/\bfun\s+main\s*\(/.test(code)) return code;
  const imports = code.split('\n').filter((l) => /^\s*import\s/.test(l));
  const rest = code.split('\n').filter((l) => !/^\s*import\s/.test(l));
  return [...imports, 'fun main() {', ...rest, '}'].join('\n');
}

async function compileLoop(dir: string, outDir: string, pkgs: Map<string, string>, errorsByPkg: Map<string, string[]>) {
  let live = [...pkgs.keys()];
  for (let round = 0; round < 8 && live.length; round++) {
    const files = live.map((p) => path.join(dir, p, 'Main.kt'));
    const cp = [COROUTINES].filter(Boolean).join(':');
    let stderr = '';
    try {
      const r = await run(KOTLINC, [...(cp ? ['-cp', cp] : []), '-nowarn', '-d', outDir, ...files], { maxBuffer: 1 << 28, timeout: 600000 });
      stderr = r.stderr;
    } catch (e: any) { stderr = (e.stderr ?? '') + (e.stdout ?? ''); if (!/error:|exception:/.test(stderr)) throw new Error('kotlinc failed: ' + String(e.code) + ' ' + stderr.slice(0, 1500)); }
    const failed = new Set<string>();
    // A compiler crash (internal exception) names the offending file: "File being compiled: ... /cN/Main.kt"
    for (const m of stderr.matchAll(/(?:exception: |File being compiled:).*?\/(c\w+)\/Main\.kt/gs)) {
      failed.add(m[1]);
      (errorsByPkg.get(m[1]) ?? errorsByPkg.set(m[1], []).get(m[1])!).push('kotlinc internal error');
    }
    for (const m of stderr.matchAll(/\/(c\w+)\/Main\.kt:(\d+):\d+: error: (.*)/g)) {
      failed.add(m[1]);
      (errorsByPkg.get(m[1]) ?? errorsByPkg.set(m[1], []).get(m[1])!).push(`line ${m[2]}: ${m[3]}`);
    }
    if (!failed.size) return live;
    live = live.filter((p) => !failed.has(p));
  }
  return live;
}

export async function runRealKotlin(items: { id: string; code: string }[]): Promise<Map<string, RealResult>> {
  if (!REAL_KOTLIN_READY) throw new Error('Run `npm run kotlinc:fetch` first.');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'realkt-'));
  const outDir = path.join(dir, 'out');
  const results = new Map<string, RealResult>();
  const pkgToItem = new Map<string, { id: string; layout: 'A' | 'B' | 'C' }>();
  const sources = new Map<string, string>();
  let n = 0;
  const add = (it: { id: string; code: string }, layout: 'A' | 'B' | 'C') => {
    const pkg = `c${n++}`;
    fs.mkdirSync(path.join(dir, pkg), { recursive: true });
    const src = layout === 'A' ? layoutA(it.code) : layout === 'C' ? layoutA(it.code, true) : layoutB(it.code);
    const imports = src.split('\n').filter((l) => /^\s*import\s/.test(l));
    const rest = src.split('\n').filter((l) => !/^\s*import\s/.test(l));
    const dflt = COROUTINES ? ['import kotlinx.coroutines.*', 'import kotlinx.coroutines.flow.*'].filter((d) => !imports.includes(d)) : [];
    fs.writeFileSync(path.join(dir, pkg, 'Main.kt'), [`package ${pkg}`, ...dflt, ...imports, ...rest].join('\n'));
    pkgToItem.set(pkg, { id: it.id, layout }); sources.set(pkg, it.id);
    return pkg;
  };
  const pkgsA = new Map(items.map((it) => [add(it, 'A'), it.id]));
  const errA = new Map<string, string[]>();
  const okA = await compileLoop(dir, outDir, pkgsA, errA);
  const failedItems = items.filter((it) => ![...okA].some((p) => pkgToItem.get(p)!.id === it.id));
  const pkgsB = new Map(failedItems.map((it) => [add(it, 'B'), it.id]));
  const errB = new Map<string, string[]>();
  const okB = pkgsB.size ? await compileLoop(dir, outDir, pkgsB, errB) : [];
  const doneIds = new Set([...okA, ...okB].map((p) => pkgToItem.get(p)!.id));
  const pkgsC = new Map(items.filter((it) => !doneIds.has(it.id)).map((it) => [add(it, 'C'), it.id]));
  const okC = pkgsC.size ? await compileLoop(dir, outDir, pkgsC, new Map()) : [];
  const compiled = [...okA, ...okB, ...okC];
  const compiledIds = new Set(compiled.map((p) => pkgToItem.get(p)!.id));
  for (const it of items) if (!compiledIds.has(it.id)) {
    const pkgA = [...pkgToItem].find(([, v]) => v.id === it.id && v.layout === 'A')![0];
    results.set(it.id, { stage: 'compile', errors: errA.get(pkgA) ?? ['compile failed'] });
  }
  const cp = [outDir, STDLIB, COROUTINES].filter(Boolean).join(':');
  let i = 0;
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (i < compiled.length) {
      const pkg = compiled[i++];
      const { id, layout } = pkgToItem.get(pkg)!;
      try {
        // Run three times: a program whose output differs between runs (threads, timing, identity hashes) is not shown.
        const r = await run('java', ['-cp', cp, `${pkg}.MainKt`], { timeout: 15000, maxBuffer: 1 << 24 });
        const r2 = await run('java', ['-cp', cp, `${pkg}.MainKt`], { timeout: 15000, maxBuffer: 1 << 24 });
        const r3 = await run('java', ['-cp', cp, `${pkg}.MainKt`], { timeout: 15000, maxBuffer: 1 << 24 });
        if (r.stdout !== r2.stdout || r.stdout !== r3.stdout || /@[0-9a-f]{6,}/.test(r.stdout)) results.set(id, { stage: 'run', output: r.stdout, errors: ['nondeterministic output (differs between runs or prints an identity hash)'], layout });
        else results.set(id, { stage: 'ok', output: r.stdout, layout });
      } catch (e: any) {
        results.set(id, { stage: 'run', output: e.stdout ?? '', errors: [String(e.stderr ?? e.message).split('\n')[0]], layout });
      }
    }
  }));
  fs.rmSync(dir, { recursive: true, force: true });
  return results;
}

/**
 * Dev-only server that compiles and runs learner code with the REAL Kotlin compiler (tools/kotlinc, see `npm run kotlinc:fetch`),
 * so the editor's "Run with Kotlin compiler" button can show true compiler errors and true program output.
 *
 *   npm run real-kotlin:serve            # listens on http://0.0.0.0:8787
 *   adb reverse tcp:8787 tcp:8787        # lets a USB-connected phone reach it as http://localhost:8787
 *
 * GET  /minikotlin/<file>  serves the local minikotlin.run compiler files (tools/minikotlin, see scripts/minikotlin/fetch.mjs) with CORS, so the
 *                           editor's "M" button can run them in a browser worker. minikotlin.run itself sends no CORS headers, and the
 *                           files are never bundled into the app (no licence was found for them).
 * POST /run  {"code": "..."}  ->  { stage: 'ok' | 'compile' | 'run', output, errors: [{ line, column, message }], stderr }
 * The code is compiled exactly as written (lines are never shifted): coroutine imports, when the code uses coroutines, are
 * prepended to the FIRST line, and the column of an error on that line is corrected for them.
 */
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);
const TOOLS = path.resolve('tools');
const KOTLINC = path.join(TOOLS, 'kotlinc', 'bin', 'kotlinc');
const STDLIB = path.join(TOOLS, 'kotlinc', 'lib', 'kotlin-stdlib.jar');
const COROUTINES = fs.existsSync(TOOLS) ? fs.readdirSync(TOOLS).filter((f) => /^kotlinx-coroutines-core-jvm.*\.jar$/.test(f)).map((f) => path.join(TOOLS, f))[0] : undefined;
const PORT = Number(process.env.PORT ?? 8787);

if (!fs.existsSync(KOTLINC)) {
  console.error('tools/kotlinc is missing. Run `npm run kotlinc:fetch` first.');
  process.exit(1);
}

interface Problem { line: number; column: number; message: string }
interface Result { stage: 'ok' | 'compile' | 'run'; output: string; errors: Problem[]; stderr: string }

const USES_COROUTINES = /\b(runBlocking|launch|async|delay|coroutineScope|supervisorScope|withContext|Flow|flow|Job|Deferred|Dispatchers)\b/;

async function compileAndRun(code: string): Promise<Result> {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'realkt-run-'));
  try {
    let prefix = '';
    if (COROUTINES && USES_COROUTINES.test(code) && !/^\s*package\b/m.test(code) && !/import kotlinx\.coroutines/.test(code)) {
      prefix = 'import kotlinx.coroutines.*; import kotlinx.coroutines.flow.*; ';
    }
    const file = path.join(dir, 'Main.kt');
    fs.writeFileSync(file, prefix + code);
    const out = path.join(dir, 'out');
    const cp = COROUTINES ? ['-cp', COROUTINES] : [];
    let stderr = '';
    try {
      const r = await run(KOTLINC, [...cp, '-nowarn', '-d', out, file], { maxBuffer: 1 << 26, timeout: 180000 });
      stderr = r.stderr;
    } catch (e: any) {
      stderr = `${e.stderr ?? ''}${e.stdout ?? ''}`;
      if (!/error:|exception:/.test(stderr)) return { stage: 'compile', output: '', errors: [{ line: 1, column: 0, message: `kotlinc failed: ${stderr.slice(0, 300) || e.message}` }], stderr };
    }
    const errors: Problem[] = [];
    for (const m of stderr.matchAll(/Main\.kt:(\d+):(\d+): error: (.*)/g)) {
      const line = Number(m[1]);
      const column = Number(m[2]) - 1 - (line === 1 ? prefix.length : 0);
      errors.push({ line, column: Math.max(0, column), message: m[3].trim() });
    }
    if (errors.length) return { stage: 'compile', output: '', errors, stderr };
    if (/exception:/.test(stderr)) return { stage: 'compile', output: '', errors: [{ line: 1, column: 0, message: 'kotlinc internal error' }], stderr };

    const classpath = [out, STDLIB, COROUTINES].filter(Boolean).join(':');
    try {
      const r = await run('java', ['-cp', classpath, 'MainKt'], { timeout: 15000, maxBuffer: 1 << 24 });
      return { stage: 'ok', output: r.stdout, errors: [], stderr: r.stderr };
    } catch (e: any) {
      const stderrText = String(e.stderr ?? e.message);
      const first = stderrText.split('\n').find((l) => l.trim()) ?? 'The program failed.';
      // "Exception in thread "main" java.lang.IllegalStateException: msg" -> keep the useful part
      return { stage: 'run', output: e.stdout ?? '', errors: [{ line: 0, column: 0, message: first.replace(/^Exception in thread "[^"]*" /, '') }], stderr: stderrText };
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  if (req.method === 'OPTIONS') { res.writeHead(204).end(); return; }
  if (req.method === 'GET' && req.url === '/health') { res.writeHead(200, { 'content-type': 'application/json' }).end('{"ok":true}'); return; }
  if (req.method === 'GET' && req.url?.startsWith('/minikotlin/')) {
    const root = path.join(TOOLS, 'minikotlin');
    const file = path.normalize(path.join(root, decodeURIComponent(req.url.slice('/minikotlin/'.length).split('?')[0])));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end(); return; }
    const type = file.endsWith('.wasm') ? 'application/wasm' : 'application/javascript';
    res.writeHead(200, { 'content-type': type, 'cache-control': 'no-cache' }).end(fs.readFileSync(file));
    return;
  }
  if (req.method !== 'POST' || req.url !== '/run') { res.writeHead(404).end(); return; }
  let body = '';
  for await (const chunk of req) { body += chunk; if (body.length > 1_000_000) { res.writeHead(413).end(); return; } }
  try {
    const { code } = JSON.parse(body) as { code?: string };
    if (typeof code !== 'string') throw new Error('code must be a string');
    const started = Date.now();
    const result = await compileAndRun(code);
    console.log(`${new Date().toLocaleTimeString()} ${result.stage} in ${Date.now() - started}ms (${code.split('\n').length} lines)`);
    res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(result));
  } catch (e: any) {
    res.writeHead(400, { 'content-type': 'application/json' }).end(JSON.stringify({ error: String(e.message ?? e) }));
  }
});
server.listen(PORT, '0.0.0.0', () => console.log(`Real Kotlin server on http://0.0.0.0:${PORT}  (phone over USB: adb reverse tcp:${PORT} tcp:${PORT})`));

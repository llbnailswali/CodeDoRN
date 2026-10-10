import type { KotlinDiagnostic, KotlinExecutionResult } from './kotlinRunner';

/**
 * Runs code with the minikotlin.run compiler (Kotlin -> WebAssembly) in a browser Worker. Dev-only comparison engine, see
 * MINIKOTLIN_WASM_FEASIBILITY.md: it is NOT the reference (it silently gets some programs wrong). The compiler files are not part
 * of the app; the worker loads them from the dev server (`npm run real-kotlin:serve` serves tools/minikotlin with CORS).
 * A fresh instance is created per run (a reused one crashes) and the worker is killed after a timeout (a runaway loop would freeze
 * the page otherwise).
 */
const DEFAULT_URL = 'http://localhost:8787';
const TIMEOUT_MS = 8000;

function serverUrl(): string {
  try {
    return localStorage.getItem('codedo_real_kotlin_url') || DEFAULT_URL;
  } catch {
    return DEFAULT_URL;
  }
}

// Adapted from scripts/minikotlin/worker.mjs: same calls, but the files come from `base` over HTTP instead of from disk.
const WORKER_SOURCE = `
self.onmessage = async (event) => {
  const { source, base } = event.data;
  try {
    importScripts(base + '/minikotlin/wasm/minikotlin.js');
    const M = await createMinikotlin({ locateFile: (p) => base + '/minikotlin/wasm/' + p });
    const compile = M.cwrap('mkc_compile_buffer', 'number', ['string', 'string', 'number', 'number', 'number']);
    const free = M.cwrap('mkc_result_free', null, ['number']);
    const errCount = M.cwrap('mkc_error_count', 'number', ['number']);
    const errMsg = M.cwrap('mkc_error_message', 'string', ['number', 'number']);
    const errLine = M.cwrap('mkc_error_line', 'number', ['number', 'number']);
    const pp = M._malloc(4), lp = M._malloc(4);
    const errors = [];
    let wasm = null;
    const result = compile(source, 'main.kt', 0, pp, lp);
    try {
      for (let i = 0; i < errCount(result); i++) errors.push({ line: errLine(result, i), message: errMsg(result, i) });
      if (!errors.length) wasm = new Uint8Array(M.HEAPU8.buffer, M.getValue(pp, '*'), M.getValue(lp, 'i32')).slice();
    } finally { M._free(pp); M._free(lp); if (result) free(result); }
    if (!wasm) { self.postMessage({ stage: 'compile', errors }); return; }

    const { makeHostEnv } = await import(base + '/minikotlin/engine/host-imports.mjs');
    const { makeMathImports } = await import(base + '/minikotlin/engine/math-runtime.mjs');
    const { makeCharImports } = await import(base + '/minikotlin/engine/char-runtime.mjs');
    const bytes = async (name) => new Uint8Array(await (await fetch(base + '/minikotlin/wasm/' + name)).arrayBuffer());
    const stdout = [];
    let memory, inst, pending = 0, resolveIdle = null;
    const env = makeHostEnv({
      getMemory: () => memory,
      write: (s) => stdout.push(s),
      getResume: () => inst && inst.exports.__co_resume,
      getJsPcb: () => { const e = inst && inst.exports; return e ? (t, v) => { const f = e['__js_pcb_' + (t | 0)]; return f ? f(v) : undefined; } : null; },
      getJsPcbu: () => { const e = inst && inst.exports; return e ? (t) => { const f = e['__js_pcbu_' + (t | 0)]; if (f) f(); } : null; },
      onTimerScheduled: () => { pending++; },
      onTimerFired: () => { if (--pending === 0 && resolveIdle) { const r = resolveIdle; resolveIdle = null; r(); } },
    });
    Object.assign(env, await makeMathImports(await bytes('kotlin_math_rt.wasm')));
    Object.assign(env, await makeCharImports(await bytes('kotlin_char_rt.wasm')));
    inst = (await WebAssembly.instantiate(wasm, { env })).instance;
    memory = inst.exports.memory;
    if (typeof inst.exports.__mk_init === 'function') inst.exports.__mk_init();
    if (typeof inst.exports.main !== 'function') { self.postMessage({ stage: 'run', errors: [{ line: 0, message: 'no main()' }], output: '' }); return; }
    try {
      const r = inst.exports.main();
      if (r !== undefined) stdout.push(String(r) + '\\n');
    } catch (e) { self.postMessage({ stage: 'run', errors: [{ line: 0, message: e.message || String(e) }], output: stdout.join('') }); return; }
    if (pending > 0) await Promise.race([new Promise((res) => { resolveIdle = res; }), new Promise((res) => setTimeout(res, 3000))]);
    self.postMessage({ stage: 'ok', output: stdout.join('') });
  } catch (e) {
    self.postMessage({ stage: 'crash', errors: [{ line: 0, message: (e && e.message) || String(e) }] });
  }
};
`;

interface WorkerResult {
  stage: 'ok' | 'compile' | 'run' | 'crash';
  output?: string;
  errors?: { line: number; message: string }[];
}

const failure = (message: string): KotlinExecutionResult => ({
  success: false,
  output: '',
  logs: [],
  error: { message, line: 0, unlocated: true, type: 'runtime_error' },
  executionTimeMs: 0,
  exitCode: 1,
});

export async function runWithMinikotlin(code: string, expectedOutput?: string): Promise<KotlinExecutionResult> {
  const started = performance.now();
  const url = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: 'application/javascript' }));
  const worker = new Worker(url);
  let data: WorkerResult;
  try {
    data = await new Promise<WorkerResult>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS);
      worker.onmessage = (event) => { clearTimeout(timer); resolve(event.data as WorkerResult); };
      worker.onerror = (event) => { clearTimeout(timer); reject(new Error(event.message || 'worker error')); };
      worker.postMessage({ source: code, base: serverUrl() });
    });
  } catch (e) {
    const reason = (e as Error).message;
    return failure(
      reason === 'timeout'
        ? 'minikotlin: no result after 8 seconds (an endless loop, or the compiler files could not be loaded).'
        : `minikotlin: could not start (${reason}). Start the dev server: npm run real-kotlin:serve (phone over USB: adb reverse tcp:8787 tcp:8787).`,
    );
  } finally {
    worker.terminate();
    URL.revokeObjectURL(url);
  }
  const elapsed = Math.round(performance.now() - started);
  if (data.stage === 'compile') {
    const first = data.errors?.[0];
    return { success: false, output: '', logs: [], error: { message: `minikotlin: ${first?.message ?? 'compile error'}`, line: first?.line ?? 0, type: 'compiler_error' } as KotlinDiagnostic, executionTimeMs: elapsed, exitCode: 1 };
  }
  const output = (data.output ?? '').replace(/\r\n/g, '\n').replace(/\n$/, '');
  if (data.stage === 'run' || data.stage === 'crash') {
    return { success: false, output, logs: output ? output.split('\n') : [], error: { message: `minikotlin: ${data.errors?.[0]?.message ?? 'The program failed.'}`, line: 0, unlocated: true, type: 'runtime_error' }, executionTimeMs: elapsed, exitCode: 1 };
  }
  const matches = expectedOutput === undefined || output.trim() === expectedOutput.trim();
  return {
    success: matches,
    output,
    logs: output ? output.split('\n') : [],
    error: matches ? undefined : { message: `minikotlin: Output mismatch: expected '${expectedOutput}', but got '${output}'`, line: 0, unlocated: true, type: 'runtime_error' },
    executionTimeMs: elapsed,
    exitCode: 0,
  };
}

// One compile + run of one Kotlin program on a FRESH minikotlin instance (reusing an instance crashes: see the feasibility note).
import { parentPort, workerData } from 'node:worker_threads';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const tools = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'tools', 'minikotlin');
const require = createRequire(import.meta.url);

async function main(source) {
  const createMinikotlin = require(join(tools, 'wasm', 'minikotlin.js'));
  const M = await createMinikotlin({ locateFile: (p) => join(tools, 'wasm', p) });
  const compile = M.cwrap('mkc_compile_buffer', 'number', ['string', 'string', 'number', 'number', 'number']);
  const free = M.cwrap('mkc_result_free', null, ['number']);
  const errCount = M.cwrap('mkc_error_count', 'number', ['number']);
  const errMsg = M.cwrap('mkc_error_message', 'string', ['number', 'number']);
  const errLine = M.cwrap('mkc_error_line', 'number', ['number', 'number']);
  const pp = M._malloc(4), lp = M._malloc(4);
  let wasm = null, errors = [];
  const result = compile(source, 'main.kt', 0, pp, lp);
  try {
    for (let i = 0; i < errCount(result); i++) errors.push(`line ${errLine(result, i)}: ${errMsg(result, i)}`);
    if (!errors.length) wasm = new Uint8Array(M.HEAPU8.buffer, M.getValue(pp, '*'), M.getValue(lp, 'i32')).slice();
  } finally { M._free(pp); M._free(lp); if (result) free(result); }
  if (!wasm) return { stage: 'compile', errors };

  const { makeHostEnv } = await import(pathToFileURL(join(tools, 'engine', 'host-imports.mjs')));
  const { makeMathImports } = await import(pathToFileURL(join(tools, 'engine', 'math-runtime.mjs')));
  const { makeCharImports } = await import(pathToFileURL(join(tools, 'engine', 'char-runtime.mjs')));
  const stdout = [];
  let memory, inst, pending = 0, resolveIdle = null;
  const env = makeHostEnv({
    getMemory: () => memory,
    write: (s) => stdout.push(s),
    getResume: () => inst && inst.exports.__co_resume,
    getJsPcb: () => { const e = inst && inst.exports; return e ? (t, v) => { const f = e[`__js_pcb_${t | 0}`]; return f ? f(v) : undefined; } : null; },
    getJsPcbu: () => { const e = inst && inst.exports; return e ? (t) => { const f = e[`__js_pcbu_${t | 0}`]; if (f) f(); } : null; },
    onTimerScheduled: () => { pending++; },
    onTimerFired: () => { if (--pending === 0 && resolveIdle) { const r = resolveIdle; resolveIdle = null; r(); } },
  });
  Object.assign(env, await makeMathImports(await readFile(join(tools, 'wasm', 'kotlin_math_rt.wasm'))));
  Object.assign(env, await makeCharImports(await readFile(join(tools, 'wasm', 'kotlin_char_rt.wasm'))));
  inst = (await WebAssembly.instantiate(wasm, { env })).instance;
  memory = inst.exports.memory;
  if (typeof inst.exports.__mk_init === 'function') inst.exports.__mk_init();
  if (typeof inst.exports.main !== 'function') return { stage: 'run', errors: ['no main()'] };
  try {
    const r = inst.exports.main();
    if (r !== undefined) stdout.push(String(r) + '\n');
  } catch (e) { return { stage: 'run', errors: [e.message || String(e)], output: stdout.join('') }; }
  if (pending > 0) await Promise.race([new Promise((res) => { resolveIdle = res; }), new Promise((res) => setTimeout(res, 3000))]);
  return { stage: 'ok', output: stdout.join('') };
}

main(workerData.source).then((r) => parentPort.postMessage(r), (e) => parentPort.postMessage({ stage: 'crash', errors: [e.message || String(e)] }));

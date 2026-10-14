/** Online fallback (src/utils/onlineKotlin.ts + compileAndRunWithFallback). The network is mocked: this test never calls JetBrains. */
import assert from 'node:assert/strict';
import { compileAndRunWithFallback } from '../src/utils/kotlinRunner';
import { interpretOnlineResponse, runWithOnlineKotlin } from '../src/utils/onlineKotlin';

// ---- pure parsing
const ok = interpretOnlineResponse({ errors: { 'File.kt': [] }, exception: null, text: '<outStream>a\nb\n</outStream>' }, 'a\nb', 5);
assert.equal(ok.success, true); assert.equal(ok.output, 'a\nb'); assert.equal(ok.engine, 'online-kotlin');
const joined = interpretOnlineResponse({ errors: {}, text: '<outStream>x</outStream><errStream>err\n</errStream><outStream>y\n</outStream>' }, undefined, 5);
assert.equal(joined.output, 'xy'); assert.equal(joined.success, true);
const mismatch = interpretOnlineResponse({ errors: {}, text: '<outStream>7\n</outStream>' }, '8', 5);
assert.equal(mismatch.success, false); assert.match(mismatch.error!.message, /Output mismatch: expected '8', but got '7'/);
const none = interpretOnlineResponse({ errors: {}, text: '' }, '8', 5);
assert.match(none.error!.message, /No output generated/);
const compile = interpretOnlineResponse({ errors: { 'File.kt': [
  { interval: { start: { line: 4, ch: 2 } }, message: 'warning only', severity: 'WARNING' },
  { interval: { start: { line: 1, ch: 15 } }, message: "Initializer type mismatch: expected 'Int', actual 'String'.", severity: 'ERROR' }] }, text: '' }, undefined, 5);
assert.equal(compile.success, false); assert.equal(compile.error!.line, 2); assert.equal(compile.error!.column, 15); assert.equal(compile.error!.type, 'compiler_error');
const warnOnly = interpretOnlineResponse({ errors: { 'File.kt': [{ interval: { start: { line: 1, ch: 1 } }, message: 'deprecated', severity: 'WARNING' }] }, text: '<outStream>ok\n</outStream>' }, 'ok', 5);
assert.equal(warnOnly.success, true, 'warnings must not fail a run');
const thrown = interpretOnlineResponse({ errors: {}, exception: { message: 'boom', fullName: 'java.lang.IllegalStateException', stackTrace: [{ fileName: null, lineNumber: -2 }, { fileName: 'File.kt', lineNumber: 4 }] }, text: '<outStream>before\n</outStream>' }, undefined, 5);
assert.equal(thrown.success, false); assert.equal(thrown.output, 'before'); assert.equal(thrown.error!.message, 'java.lang.IllegalStateException: boom'); assert.equal(thrown.error!.line, 4);
const unlocated = interpretOnlineResponse({ errors: {}, exception: { fullName: 'java.lang.StackOverflowError', stackTrace: [] }, text: '' }, undefined, 5);
assert.equal(unlocated.error!.unlocated, true); assert.equal(unlocated.error!.message, 'java.lang.StackOverflowError');

// ---- fallback decisions (fetch + window mocked)
const g = globalThis as any;
let calls: { url: string; body: any }[] = [];
let reply: () => Promise<any> = async () => ({ ok: true, json: async () => ({ errors: {}, exception: null, text: '<outStream>real\n</outStream>' }) });
g.fetch = async (url: string, init: any) => { calls.push({ url, body: JSON.parse(init.body) }); return reply(); };
const storage: Record<string, string> = {};
g.localStorage = { getItem: (k: string) => storage[k] ?? null, setItem: (k: string, v: string) => { storage[k] = v; } };
const setWindow = (on: boolean) => { if (on) g.window = {}; else delete g.window; };

const GOOD = 'fun main() {\n  println("hi")\n}';
const GAP = 'import kotlinx.coroutines.flow.*\nimport kotlinx.coroutines.*\nfun main() = runBlocking {\n  flowOf(1).collect { println(it) }\n}'; // the simulator reports Flow as unsupported

setWindow(false);
let r = await compileAndRunWithFallback(GAP);
assert.equal(calls.length, 0, 'outside a browser the network must never be touched'); assert.equal(r.success, false);

setWindow(true);
r = await compileAndRunWithFallback(GOOD);
assert.equal(calls.length, 0, 'a successful simulator run must not call the network'); assert.equal(r.engine, undefined);

r = await compileAndRunWithFallback(GAP);
assert.equal(calls.length, 1, 'a simulator failure calls the fallback once');
assert.equal(calls[0].url, 'https://api.kotlinlang.org/api/latest/compiler/run');
assert.deepEqual(calls[0].body, { args: '', confType: 'java', files: [{ name: 'File.kt', publicId: '', text: GAP }] });
assert.equal(r.engine, 'online-kotlin'); assert.equal(r.success, true); assert.equal(r.output, 'real');

calls = []; r = await compileAndRunWithFallback(GAP, { expectedOutput: 'real' });
assert.equal(r.success, true, 'a fallback run whose output matches the expected output passes');
calls = []; r = await compileAndRunWithFallback(GAP, { expectedOutput: 'other' });
assert.equal(r.success, false, 'a fallback run that prints something else fails');

calls = []; reply = async () => { throw new Error('offline'); };
r = await compileAndRunWithFallback(GAP);
assert.equal(calls.length, 1); assert.equal(r.engine, undefined, 'if the service is down the simulator result is kept'); assert.equal(r.success, false);
reply = async () => ({ ok: false, json: async () => ({}) });
r = await compileAndRunWithFallback(GAP); assert.equal(r.engine, undefined, 'an HTTP error keeps the simulator result');
reply = async () => ({ ok: true, json: async () => ({ unexpected: true }) });
r = await compileAndRunWithFallback(GAP); assert.equal(r.engine, undefined, 'an unreadable answer keeps the simulator result');
reply = async () => ({ ok: true, json: async () => ({ errors: {}, exception: null, text: '<outStream>real\n</outStream>' }) });

storage['codedo_online_fallback'] = 'off'; calls = [];
r = await compileAndRunWithFallback(GAP);
assert.equal(calls.length, 0, 'the kill switch disables the fallback'); delete storage['codedo_online_fallback'];

calls = []; await compileAndRunWithFallback('   ');
assert.equal(calls.length, 0, 'blank code never goes online');

// A function-only lesson (graded by a call) has no main(): the online run gets one that prints the call.
calls = [];
await compileAndRunWithFallback('import kotlinx.coroutines.flow.*\nfun twice(n: Int) = flowOf(n)', { testCase: { call: 'twice(2)', expected: 'real' } });
assert.equal(calls.length, 1);
assert.match(calls[0].body.files[0].text, /fun main\(\) \{\n    println\(twice\(2\)\)\n\}/);

// The explicit "J" button: always calls the API (even with the kill switch on), and reports plainly when it cannot be reached.
storage['codedo_online_fallback'] = 'off'; calls = [];
let j = await runWithOnlineKotlin(GOOD, 'real');
assert.equal(calls.length, 1, 'the J button ignores the fallback kill switch'); assert.equal(j.success, true); assert.equal(j.engine, 'online-kotlin');
delete storage['codedo_online_fallback'];
reply = async () => { throw new Error('offline'); };
j = await runWithOnlineKotlin(GOOD, 'real');
assert.equal(j.success, false); assert.match(j.error!.message, /Cannot reach the online Kotlin compiler/); assert.equal(j.engine, undefined);

console.log('Online fallback: parsing and decision tests pass (network mocked).');

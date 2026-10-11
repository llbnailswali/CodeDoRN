/**
 * Topic-level capability audit: every everyday operation in scripts/topic-coverage/cases.ts is run through REAL kotlinc (the
 * authority) and through the simulator, and the two outputs are compared. A case fails when the simulator errors ("error") or prints
 * something different ("wrong"). A case real kotlinc itself rejects is reported as "invalid" and ignored: fix the case, not the editor.
 *
 *   npm run audit:topic-coverage                      # all topics, summary + every failure
 *   npm run audit:topic-coverage -- --topic strings,ranges
 *   npm run audit:topic-coverage -- --strict          # exit 1 on any failure (once a topic is done)
 *
 * It is a worklist by default, not a gate: a topic is added to `test:topic-coverage` (strict) when its list is empty.
 */
import { compileAndRunKotlin } from '../src/utils/kotlinRunner';
import { setKotlinSyntaxAssets, ensureKotlinSyntax } from '../src/utils/kotlinSyntaxCheck';
import { nodeKotlinSyntaxAssets } from '../src/utils/kotlinSyntaxAssets.node.ts';
import { runRealKotlin, REAL_KOTLIN_READY } from './minikotlin/real-kotlin';
import fs from 'node:fs';
import { KNOWN_LIMITS, TOPICS } from './topic-coverage/cases';

if (!REAL_KOTLIN_READY) { console.error('tools/kotlinc is missing. Run `npm run kotlinc:fetch` first.'); process.exit(1); }
setKotlinSyntaxAssets(nodeKotlinSyntaxAssets());
await ensureKotlinSyntax();

const arg = (name: string) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : undefined; };
const wanted = arg('--topic')?.split(',');
const strict = process.argv.includes('--strict');
const wrap = (body: string) => (/\bfun\s+main\b/.test(body) ? body : `fun main() {\n${body}\n}`);
const norm = (text: string) => text.replace(/\s+$/, '');

const items = Object.entries(TOPICS)
  .filter(([topic]) => !wanted || wanted.includes(topic))
  .flatMap(([topic, { cases }]) => cases.map((body, i) => ({ id: `${topic}#${i}`, topic, body, code: wrap(body) })));

console.log(`Running ${items.length} cases through real kotlinc...`);
const real = await runRealKotlin(items.map(({ id, code }) => ({ id, code })));

type Row = { topic: string; body: string; kind: 'ok' | 'invalid' | 'error' | 'wrong' | 'limit'; detail: string };
const expectedOutputs: Record<string, string> = {};
const rows: Row[] = [];
for (const item of items) {
  const expected = real.get(item.id);
  if (!expected || expected.stage !== 'ok') { rows.push({ topic: item.topic, body: item.body, kind: 'invalid', detail: expected?.errors?.[0] ?? expected?.stage ?? 'no result' }); continue; }
  expectedOutputs[item.body] = norm(expected.output ?? '');
  const sim = await compileAndRunKotlin(item.code, { timeoutMs: 4000 });
  if (KNOWN_LIMITS[item.body] && (!sim.success || norm(sim.output) !== norm(expected.output ?? ''))) { rows.push({ topic: item.topic, body: item.body, kind: 'limit', detail: KNOWN_LIMITS[item.body] }); continue; }
  if (!sim.success) { rows.push({ topic: item.topic, body: item.body, kind: 'error', detail: `${sim.error?.message ?? 'failed'} (kotlinc: ${JSON.stringify(norm(expected.output ?? ''))})` }); continue; }
  const ok = norm(sim.output) === norm(expected.output ?? '');
  rows.push({ topic: item.topic, body: item.body, kind: ok ? 'ok' : 'wrong', detail: ok ? '' : `got ${JSON.stringify(norm(sim.output))}, kotlinc ${JSON.stringify(norm(expected.output ?? ''))}` });
}

for (const [topic, { worlds }] of Object.entries(TOPICS)) {
  const mine = rows.filter((r) => r.topic === topic);
  if (!mine.length) continue;
  const count = (kind: Row['kind']) => mine.filter((r) => r.kind === kind).length;
  const checked = mine.length - count('invalid');
  console.log(`\n== ${topic} (world ${worlds}): ${count('ok')}/${checked} match kotlinc` + (count('invalid') ? `  [${count('invalid')} invalid cases ignored]` : ''));
  for (const r of mine.filter((x) => x.kind === 'wrong')) console.log(`  WRONG  ${JSON.stringify(r.body.replace(/\n/g, ' ; '))}\n         ${r.detail}`);
  for (const r of mine.filter((x) => x.kind === 'error')) console.log(`  ERROR  ${JSON.stringify(r.body.replace(/\n/g, ' ; '))}\n         ${r.detail}`);
  for (const r of mine.filter((x) => x.kind === 'limit')) console.log(`  (known limit) ${JSON.stringify(r.body.replace(/\n/g, ' ; ')).slice(0, 100)}  -> ${r.detail.slice(0, 100)}`);
  for (const r of mine.filter((x) => x.kind === 'invalid')) console.log(`  (invalid case) ${JSON.stringify(r.body.replace(/\n/g, ' ; ')).slice(0, 110)}  -> ${r.detail.slice(0, 90)}`);
}
if (process.argv.includes('--write-expected')) {
  const file = new URL('./topic-coverage/expected.json', import.meta.url);
  const previous = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  fs.writeFileSync(file, JSON.stringify({ ...previous, ...expectedOutputs }, null, 1) + '\n');
  console.log(`Stored ${Object.keys(expectedOutputs).length} kotlinc outputs in scripts/topic-coverage/expected.json`);
}
const failed = rows.filter((r) => r.kind === 'wrong' || r.kind === 'error').length;
console.log(`\nTotal: ${rows.filter((r) => r.kind === 'ok').length} match, ${rows.filter((r) => r.kind === 'wrong').length} wrong output, ${rows.filter((r) => r.kind === 'error').length} errors, ${rows.filter((r) => r.kind === 'invalid').length} invalid cases.`);
if (strict && failed) process.exit(1);

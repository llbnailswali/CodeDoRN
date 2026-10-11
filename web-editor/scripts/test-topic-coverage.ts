/**
 * Replays the stored real-kotlinc outputs (scripts/topic-coverage/expected.json) for every DONE topic and fails when the simulator
 * errors or prints something different. No kotlinc needed. Refresh with `npm run audit:topic-coverage -- --write-expected`.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { compileAndRunKotlin } from '../src/utils/kotlinRunner';
import { setKotlinSyntaxAssets, ensureKotlinSyntax } from '../src/utils/kotlinSyntaxCheck';
import { nodeKotlinSyntaxAssets } from '../src/utils/kotlinSyntaxAssets.node.ts';
import { DONE_TOPICS, KNOWN_LIMITS, TOPICS } from './topic-coverage/cases';

setKotlinSyntaxAssets(nodeKotlinSyntaxAssets());
await ensureKotlinSyntax();
const expected: Record<string, string> = JSON.parse(fs.readFileSync(new URL('./topic-coverage/expected.json', import.meta.url), 'utf8'));
const wrap = (body: string) => (/\bfun\s+main\b/.test(body) ? body : `fun main() {\n${body}\n}`);
const norm = (text: string) => text.replace(/\s+$/, '');

let checked = 0;
const failures: string[] = [];
for (const topic of DONE_TOPICS) {
  for (const body of TOPICS[topic].cases) {
    if (!(body in expected) || KNOWN_LIMITS[body]) continue; // kotlinc itself rejects the case, or it is a documented limit
    checked++;
    const result = await compileAndRunKotlin(wrap(body), { timeoutMs: 4000 });
    const got = result.success ? norm(result.output) : `ERROR ${result.error?.message}`;
    if (got !== expected[body]) failures.push(`${topic}: ${JSON.stringify(body.replace(/\n/g, ' ; '))}\n   expected ${JSON.stringify(expected[body])}\n   got      ${JSON.stringify(got)}`);
  }
}
failures.forEach((f) => console.error('FAIL ' + f));
assert.equal(failures.length, 0, `${failures.length} of ${checked} topic-coverage cases differ from real kotlinc`);
console.log(`Topic coverage: ${checked} cases in ${DONE_TOPICS.length} topics match real kotlinc.`);

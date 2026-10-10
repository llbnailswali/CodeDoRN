import assert from 'node:assert/strict';
import { compileAndRunKotlin } from '../src/utils/kotlinRunner';
import { runWithRealKotlin } from '../src/utils/realKotlin';
import { suggestFix } from '../src/utils/compileFixes';

// "Apply fix" must only be offered when it really clears the error. Each case: a program with one compile error, the fix label the
// learner should see (null = no fix offered), and the program text after applying it. Simulator cases run offline; the kotlinc cases
// need `npm run real-kotlin:serve` and are skipped (with a note) when it is not running.
type Case = { name: string; code: string; label: string | null; after?: string };
const cases: Case[] = [
  { name: 'val reassigned', code: 'fun main() {\n  val age = 20\n  age = 21\n  println(age)\n}', label: 'Change "val age" to "var age"', after: 'fun main() {\n  var age = 20\n  age = 21\n  println(age)\n}' },
  { name: 'val property reassigned from outside', code: 'class A(val x: Int)\nfun main() {\n  val a = A(1)\n  a.x = 5\n  println(a.x)\n}', label: 'Change "val x" to "var x"', after: 'class A(var x: Int)\nfun main() {\n  val a = A(1)\n  a.x = 5\n  println(a.x)\n}' },
  { name: 'nullable receiver', code: 'fun main() {\n  val s: String? = null\n  println(s.length)\n}', label: 'Use ?. (safe call)', after: 'fun main() {\n  val s: String? = null\n  println(s?.length)\n}' },
  { name: 'nullable property through a list', code: 'class U(val email: String?)\nfun main() {\n  val us = listOf(U("a"), U(null))\n  for (u in us) {\n    println(u.email.length)\n  }\n}', label: 'Use ?. (safe call)', after: 'class U(val email: String?)\nfun main() {\n  val us = listOf(U("a"), U(null))\n  for (u in us) {\n    println(u.email?.length)\n  }\n}' },
  { name: 'misspelled name', code: 'fun main() {\n  val email = "a@x.com"\n  println(emial)\n}', label: 'Rename "emial" to "email"', after: 'fun main() {\n  val email = "a@x.com"\n  println(email)\n}' },
  { name: 'unknown name with no close match', code: 'fun main() {\n  val email = 1\n  println(zzzzzz)\n}', label: null },
  { name: 'two equally close names is a guess', code: 'fun main() {\n  val cat = 1\n  val car = 2\n  println(cap)\n}', label: null },
  { name: 'missing )', code: 'fun main() {\n  println("Hello"\n}', label: 'Add the missing )', after: 'fun main() {\n  println("Hello")\n}' },
  { name: 'val on a loop variable', code: 'fun main() {\n  val xs = listOf(1, 2)\n  for (val i in xs.indices) {\n    println(i)\n  }\n}', label: 'Remove "val"', after: 'fun main() {\n  val xs = listOf(1, 2)\n  for (i in xs.indices) {\n    println(i)\n  }\n}' },
  { name: 'var on a loop variable, no spaces (as typed in the report)', code: 'fun main() {\n  val xs = listOf(1, 2)\n  for(var i in xs){\n    println(i)\n  }\n}', label: 'Remove "var"', after: 'fun main() {\n  val xs = listOf(1, 2)\n  for(i in xs){\n    println(i)\n  }\n}' },
  { name: 'type mismatch has no automatic fix', code: 'fun main() {\n  val n: Int = "hi"\n  println(n)\n}', label: null },
];

const compiles = (error: { type: string } | undefined) => !error || error.type === 'runtime_error';

(async () => {
  let realUp = true;
  try { await fetch('http://localhost:8787/health'); } catch { realUp = false; }
  for (const c of cases) {
    for (const engine of realUp ? (['simulator', 'kotlinc'] as const) : (['simulator'] as const)) {
      const result = engine === 'simulator' ? await compileAndRunKotlin(c.code) : await runWithRealKotlin(c.code);
      const fix = suggestFix(c.code, result.error);
      // The two engines may offer different wording for a missing bracket, but never a wrong fix: if one is offered it must work.
      if (c.label === null) { assert.equal(fix, null, `${c.name} [${engine}]: no fix expected, got ${fix?.label}`); continue; }
      assert.ok(fix, `${c.name} [${engine}]: a fix was expected for ${JSON.stringify(result.error)}`);
      assert.equal(fix.label, c.label, `${c.name} [${engine}]: label`);
      assert.equal(fix.code, c.after, `${c.name} [${engine}]: fixed code`);
      const again = engine === 'simulator' ? await compileAndRunKotlin(fix.code) : await runWithRealKotlin(fix.code);
      assert.ok(compiles(again.error), `${c.name} [${engine}]: the fixed program still fails: ${JSON.stringify(again.error)}`);
      console.log(`ok  ${c.name} [${engine}] -> ${fix.label}`);
    }
  }
  console.log(realUp ? 'compile fixes: all cases pass on the simulator and real kotlinc' : 'compile fixes: simulator cases pass (real-kotlin server not running, kotlinc cases skipped)');
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });

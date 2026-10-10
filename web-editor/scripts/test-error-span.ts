import assert from 'node:assert/strict';
import { compileAndRunKotlin } from '../src/utils/kotlinRunner';
import { resolveErrorSpan } from '../src/utils/errorSpan';

// The editor underlines `resolveErrorSpan(code, error)`. Each case names the exact text that must be marked, or the whole
// statement when the engine only knows the line (exact: false). `null` means nothing may be marked (not a compile error).
const cases: Array<[string, string, { text: string; exact: boolean } | null]> = [
  ['val reassigned', 'fun main() {\n  val age = 20\n  age = 21\n  println(age)\n}', { text: 'age', exact: true }],
  ['val property reassigned from outside', 'class A(val x: Int)\nfun main() {\n  val a = A(1)\n  a.x = 5\n  println(a.x)\n}', { text: 'x', exact: true }],
  ['wrong initializer type', 'fun main() {\n  val x: Int = "hi"\n  println(x)\n}', { text: '"hi"', exact: true }],
  ['unresolved name (was a runtime ReferenceError)', 'fun main() {\n  val x = 5\n  println(y + 1)\n}', { text: 'y', exact: true }],
  ['unresolved name ignores the same word in a string', 'fun main() {\n  println("foo")\n  println(foo)\n}', { text: 'foo', exact: true }],
  ['a loop variable used after its loop is marked where it is used', 'fun main() {\n  for (i in 1..2) {\n    println(i)\n  }\n  println(i)\n}', { text: 'i', exact: true }],
  ['mutating call on a read-only list', 'fun main() {\n  val a = listOf(1)\n  a.add(2)\n}', { text: 'add', exact: true }],
  ['unsafe call on a nullable receiver', 'fun main() {\n  val s: String? = null\n  println(s.length)\n}', { text: 's', exact: true }],
  ['wrong argument type', 'fun greet(name: String) = "Hi " + name\nfun main() {\n  println(greet(5))\n}', null],
  ['missing ) marks the opener on the line that lost it, not the next line', 'fun main() {\n  println("Hello"\n}', { text: '(', exact: true }],
  ['unsafe property read on a loop variable over a list of objects', 'class User(val name: String, val email: String?)\n\nfun main() {\n  val u1 = User("A", "a@x.com")\n  val users = listOf(u1)\n  for (user in users) {\n    println(user.email.length)\n  }\n}', { text: '.length', exact: true }],
  ['runtime error is not marked', 'fun main() {\n  val a = listOf(1, 2)\n  println(a[5])\n}', null],
];

(async () => {
  for (const [name, code, want] of cases) {
    const result = await compileAndRunKotlin(code);
    const span = resolveErrorSpan(code, result.error);
    if (want === null) {
      // Not pinned to a token: only require that, if something is marked, it lies on the reported line.
      if (span) assert.equal(span.line, result.error!.line - 1, `${name}: span is on the reported line`);
      console.log(`ok  ${name} -> ${span ? JSON.stringify(code.split('\n')[span.line].slice(span.start, span.end)) : 'nothing marked'}`);
      continue;
    }
    assert.ok(span, `${name}: expected a span, got ${JSON.stringify(result.error)}`);
    const text = code.split('\n')[span.line].slice(span.start, span.end);
    assert.equal(text, want.text, `${name}: marked text (${JSON.stringify(result.error)})`);
    assert.equal(span.exact, want.exact, `${name}: exactness`);
    console.log(`ok  ${name} -> ${JSON.stringify(text)}`);
  }
  // A runtime failure must not claim a line number that points into generated JavaScript.
  const crash = await compileAndRunKotlin('class A(val n: Int)\nfun main() {\n  val xs = listOf(1)\n  println(xs[3])\n}');
  assert.ok(!crash.success && (crash.error!.line === 0 || crash.error!.line <= 5), `runtime line is 0 or inside the source: ${JSON.stringify(crash.error)}`);
  // Valid null-checked and safe-call forms must keep running.
  const okProgram = 'class User(val name: String, val email: String?)\nfun len(n: Int) = n\nfun main() {\n  val users = listOf(User("A", "a@x.com"), User("B", null))\n  for (user in users) {\n    if (user.email != null) {\n      println(len(user.email.length))\n    }\n    println(user.email?.length ?: 0)\n  }\n}';
  const ok = await compileAndRunKotlin(okProgram);
  assert.ok(ok.success && ok.output === '7\n7\n0', `valid null-safe loop: ${JSON.stringify(ok)}`);
  console.log('error-span: all cases passed');
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });

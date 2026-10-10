import assert from 'node:assert/strict';
import { compileAndRunKotlin } from '../src/utils/kotlinRunner';

// Int and Long `/` and `%` by zero throw java.lang.ArithmeticException: / by zero in Kotlin; Double division by zero does not (it is
// Infinity or NaN). Found by `npm run compare:errors`: the simulator printed Infinity/NaN, and one `% 0` program hung it for good.
// Every expectation was confirmed against real kotlinc (compared here too when `npm run real-kotlin:serve` is running).
const wrap = (body: string) => `fun main() {\n${body}\n}`;
const cases: Array<[string, string, 'throws' | string]> = [
  ['literal / 0', wrap('  println(10 / 0)'), 'throws'],
  ['literal % 0', wrap('  println(10 % 0)'), 'throws'],
  ['variable divisor', wrap('  val total = 12\n  val n = 0\n  println(total / n)'), 'throws'],
  ['variable divisor with %', wrap('  val total = 12\n  val n = 0\n  println(total % n)'), 'throws'],
  ['inside a template', wrap('  val n = 0\n  println("avg: ${100 / n}")'), 'throws'],
  ['chain with a zero divisor', wrap('  val a = 17\n  val b = 0\n  println(a * 100 / b)'), 'throws'],
  ['compound /=', wrap('  var stock = 10\n  val parts = 0\n  stock /= parts\n  println(stock)'), 'throws'],
  ['compound %=', wrap('  var stock = 10\n  val parts = 0\n  stock %= parts\n  println(stock)'), 'throws'],
  ['Long divisor', wrap('  val big = 100L\n  val zero = 0L\n  println(big / zero)'), 'throws'],
  ['function parameters', 'fun share(total: Int, people: Int) = total / people\nfun main() {\n  println(share(10, 0))\n}', 'throws'],
  ['remainder in a condition', wrap('  val n = 7\n  val m = 0\n  if (n % m == 0) {\n    println("even")\n  }'), 'throws'],
  ['Double divided by zero is Infinity, not an error', wrap('  println(5.0 / 0)'), 'Infinity'],
  ['Double remainder by zero is NaN, not an error', wrap('  println(5.0 % 0.0)'), 'NaN'],
  ['normal division still truncates', wrap('  println(47 / 5)\n  println(-7 / 2)'), '9\n-3'],
  ['normal remainder keeps the dividend sign', wrap('  println(17 % 5)\n  println(-7 % 3)\n  println(7 % -3)'), '2\n-1\n1'],
  ['zero dividend is fine', wrap('  println(0 / 5)\n  println(0 % 5)'), '0\n0'],
  ['lambda it % 0 (untyped operand)', wrap('  println(listOf(1, 2, 3).filter { it % 0 == 0 })'), 'throws'],
  ['range loop variable % 0', wrap('  for (i in 1..3) {\n    if (i % 0 == 0) println(i)\n  }'), 'throws'],
  ['Double variable / literal 0 is Infinity', wrap('  val d = 2.5\n  println(d / 0)'), 'Infinity'],
  ['a "/ 0" inside a string is text', wrap('  println("a / 0 and b % 0")'), 'a / 0 and b % 0'],
  ['a sum divided by a count', wrap('  val s = 10 + 20\n  val c = 4\n  println(s / c)\n  println(s % c)'), '7\n2'],
];

(async () => {
  let realUp = true;
  try { await fetch('http://localhost:8787/health'); } catch { realUp = false; }
  for (const [name, code, want] of cases) {
    const r = await compileAndRunKotlin(code, { timeoutMs: 1500 });
    if (want === 'throws') {
      assert.ok(r.error && r.error.type === 'runtime_error' && /ArithmeticException|by zero/.test(r.error.message), `${name}: expected ArithmeticException, got ${JSON.stringify(r.error ?? r.output)}`);
    } else {
      assert.ok(!r.error, `${name}: unexpected error ${JSON.stringify(r.error)}`);
      assert.equal(r.output, want, `${name}: output`);
    }
    if (realUp) {
      const real = await (await fetch('http://localhost:8787/run', { method: 'POST', body: JSON.stringify({ code }) })).json();
      if (want === 'throws') assert.ok(real.stage === 'run' && /ArithmeticException/.test(real.errors[0]?.message ?? ''), `${name}: kotlinc did not throw ArithmeticException: ${JSON.stringify(real)}`);
      else assert.equal(real.output.trimEnd(), want, `${name}: kotlinc output`);
    }
    console.log(`ok  ${name}`);
  }
  console.log(realUp ? 'int zero division: simulator and real kotlinc agree' : 'int zero division: simulator cases pass (kotlinc server not running)');
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });

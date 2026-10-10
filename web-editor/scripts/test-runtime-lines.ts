import assert from 'node:assert/strict';
import { compileAndRunKotlin } from '../src/utils/kotlinRunner';

// A runtime error must report the Kotlin line that was running (line markers, src/utils/kotlinLineMarkers.ts). Each expected line is
// the line of the first `Main.kt:N` frame in real kotlinc's stack trace (compared live when `npm run real-kotlin:serve` is running).
const cases: [string, string, number][] = [
  ['division by zero in main', 'fun main() {\n  val a = 10\n  val b = 0\n  println("start")\n  println(a / b)\n}', 5],
  ['index out of bounds', 'fun main() {\n  val xs = listOf(1, 2)\n  println(xs[0])\n  println(xs[5])\n}', 4],
  ['inside a called function', 'fun share(total: Int, people: Int): Int {\n  val each = total / people\n  return each\n}\nfun main() {\n  println(share(10, 2))\n  println(share(10, 0))\n}', 2],
  ['inside a for loop over a literal list', 'fun main() {\n  val xs = listOf(3, 0, 2)\n  for (x in xs) {\n    println(12 / x)\n  }\n}', 4],
  ['!! on null', 'fun main() {\n  val s: String? = null\n  println(s!!.length)\n}', 3],
  ['toInt on text', 'fun main() {\n  val t = "abc"\n  val n = t.toInt()\n  println(n)\n}', 3],
  ['throw inside an if', 'fun check(n: Int) {\n  if (n < 0) {\n    throw IllegalArgumentException("negative")\n  }\n}\nfun main() {\n  check(1)\n  check(-1)\n}', 3],
  ['inside a forEach lambda', 'fun main() {\n  val xs = listOf(1, 0)\n  xs.forEach {\n    println(10 / it)\n  }\n}', 4],
  ['index on a class property inside a method', 'class Box(val items: List<Int>) {\n  fun at(i: Int): Int {\n    return items[i]\n  }\n}\nfun main() {\n  println(Box(listOf(1)).at(3))\n}', 3],
  ['after an if/else and a when', 'fun main() {\n  val n = 2\n  if (n > 1) {\n    println("big")\n  } else {\n    println("small")\n  }\n  val label = when (n) {\n    1 -> "one"\n    else -> "many"\n  }\n  println(label)\n  println(n / (n - 2))\n}', 13],  ['!! on a function result, after the function returned', 'fun findUser(id: Int): String? {\n  return if (id == 1) "admin" else null\n}\n\nfun main() {\n  println(findUser(1)!!.uppercase())\n  println(findUser(2)!!.uppercase())\n}', 7],
  ['inside an expression-bodied function', 'fun withTax(price: Int, percent: Int) = price + price * 10 / percent\n\nfun main() {\n  println(withTax(100, 5))\n  println(withTax(100, 0))\n}', 1],
  ['inside a getter', 'class Sensor(val celsius: Int, val scale: Int) {\n  val ratio: Int\n    get() = celsius / scale\n}\n\nfun main() {\n  println(Sensor(20, 0).ratio)\n}', 3],
  ['inside an override method', 'open class Policy {\n  open fun apply(price: Int) = price\n}\nclass Split(val parts: Int) : Policy() {\n  override fun apply(price: Int) = price / parts\n}\n\nfun main() {\n  println(Split(0).apply(10))\n}', 5],
  ['after i++ in a loop', 'fun main() {\n  var i = 1\n  var total = 0\n  while (i <= 3) {\n    val current = i\n    i++\n    if (current % 0 == 0) {\n      continue\n    }\n    total += current\n  }\n  println(total)\n}', 7],];

(async () => {
  let realUp = true;
  try { await fetch('http://localhost:8787/health'); } catch { realUp = false; }
  for (const [name, code, want] of cases) {
    const r = await compileAndRunKotlin(code);
    assert.ok(r.error && r.error.type === 'runtime_error', `${name}: expected a runtime error, got ${JSON.stringify(r.error ?? r.output)}`);
    assert.equal(r.error.line, want, `${name}: simulator line`);
    if (realUp) {
      const real = await (await fetch('http://localhost:8787/run', { method: 'POST', body: JSON.stringify({ code }) })).json();
      assert.equal(Number(/Main\.kt:(\d+)\)/.exec(real.stderr ?? '')?.[1] ?? 0), want, `${name}: kotlinc line`);
    }
    console.log(`ok  ${name} -> line ${want}`);
  }
  console.log(realUp ? 'runtime lines: simulator and real kotlinc agree on every case' : 'runtime lines: simulator cases pass (kotlinc server not running)');
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });

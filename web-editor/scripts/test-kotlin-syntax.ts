// The real Kotlin grammar check (src/utils/kotlinSyntaxCheck.ts): what it must reject, where it must point, and the valid shapes the grammar
// itself gets wrong (each is rewritten by prepareForParse). Every "reject" case is a compile error in kotlinc 2.0.21.
import assert from 'node:assert/strict';
import { compileAndRunKotlin } from '../src/utils/kotlinRunner';
import { checkKotlinSyntax, ensureKotlinSyntax, prepareForParse } from '../src/utils/kotlinSyntaxCheck';

const main = (body: string) => `fun main() {\n${body}\n}`;

const rejected: { name: string; code: string; line: number; token?: string }[] = [
  { name: 'when branch without ->', code: main('  val s = 85\n  when (s) {\n    in 80..89 - println("B")\n    else -> println("C")\n  }'), line: 4 },
  { name: 'missing parentheses around println argument', code: main('  (println"hi")'), line: 2 },
  { name: 'type missing before ?', code: main('  val x: ? = null'), line: 2 },
  { name: 'pair with no second value', code: main('  val m = mapOf("pear" to )'), line: 2 },
  { name: 'single & is not an operator', code: main('  val a = true\n  val b = false\n  println(a & !b)'), line: 4 },
  { name: 'stray token after a call', code: main('  val a = 1\n  println("P: " + )a'), line: 3 },
  { name: 'declaration without a name', code: main('  val total = 487\n  val  = 24\n  println(total)'), line: 3 },
  { name: 'fun written twice', code: 'fun fun main() {\n  println(1)\n}', line: 1, token: 'fun' },
  { name: 'function name written twice', code: 'fun main main() {\n  println(1)\n}', line: 1, token: 'main' },
  { name: 'anonymous function as a statement', code: 'fun (main) {\n  println(1)\n}', line: 1 },
  { name: 'variable name written twice', code: main('  var counter counter = 0\n  println(counter)'), line: 2, token: 'counter' },
  { name: 'missing = in a declaration', code: main('  val hasPass  true\n  println(hasPass)'), line: 2 },
  { name: 'missing : before a type', code: main('  val second Any = "20"\n  println(second)'), line: 2 },
  { name: 'println written twice', code: main('  val x = 1\n  println println(x)'), line: 3, token: 'println' },
  { name: 'function without a body', code: 'import kotlinx.coroutines.*\nfun main()  runBlocking {\n  println(1)\n}', line: 2 },
  { name: 'String minus', code: main('  val name = "Ben"\n  val score = 4\n  println(name + ": " - score)'), line: 4, token: '-' },
  { name: 'String times', code: main('  println("ab" * 2)'), line: 2, token: '*' },
  { name: 'named argument to println (= for ==)', code: main('  val a = 1\n  val b = 1\n  println(a = b)'), line: 4 },
  { name: 'print with no argument', code: main('  print()\n  println(1)'), line: 2, token: 'print' },
  { name: 'type parameters after the function name', code: main('  fun identity<T>(value: T): T = value'), line: 2 },
];

// grammarOnly: valid Kotlin the grammar must accept, but the simulator cannot run yet (a user-declared infix extension, println by
// parameter name).
const accepted: { name: string; code: string; grammarOnly?: boolean }[] = [
  { name: 'one-line class body', code: 'class K { val x = 1 }\nobject O { fun f() {} }\nclass C {\n  companion object { const val X = 1 }\n}\n' + main('  println(K().x + C.X)') },
  { name: 'private set before the closing brace', code: 'class H { var c = 0\n  private set }\n' + main('  println(H().c)') },
  { name: 'second catch on its own line', code: main('  try {\n    throw IllegalArgumentException("bad")\n  } catch (e: IllegalArgumentException) {\n    println("a")\n  }\n  catch (e: RuntimeException) {\n    println("r")\n  }') },
  { name: 'catch on its own line at column 0', code: 'fun main() {\ntry {\nprintln(1)\n}\ncatch (e: Exception) {\nprintln(2)\n}\n}' },
  { name: 'anonymous function with untyped parameter', code: main('  val wrap: (String) -> String = fun(word) = "[" + word + "]"\n  println(wrap("sun"))') },
  { name: 'println by its parameter name', code: main('  println(message = "x")'), grammarOnly: true },
  { name: 'empty println, numeric minus', code: main('  val n = 5\n  println()\n  println(n - 1)\n  println("a" + (n - 1))\n  println("ab".length * 2)') },
  { name: 'standard and declared infix calls', code: 'infix fun Int.plus2(o: Int) = this + o\n' + main('  val p = 1 to 2\n  println(p.first plus2 3)\n  println(5 downTo 1 step 2)\n  println(true and false)'), grammarOnly: true },
  { name: 'functions without a body where allowed', code: 'interface Shape {\n  fun area(): Double\n}\nabstract class Base {\n  abstract fun name(): String\n}\nclass Sq(val s: Double) : Shape {\n  override fun area() = s * s\n}\n' + main('  println(Sq(2.0).area())') },
  { name: 'anonymous functions as values', code: main('  val a = fun(x: Int) = x + 1\n  val b: (Int) -> Int = fun(n) = n * 2\n  println(listOf(1).map(fun(v: Int): Int { return v + a(b(1)) }))') },
  { name: 'extension function and property with a dot', code: 'fun Int.twice() = this * 2\nval String.firstChar: Char\n  get() = this[0]\n' + main('  println(3.twice())\n  println("ab".firstChar)') },
  { name: 'statement that is only a parenthesized name', code: main('  listOf(1).forEach {\n    (it)\n  }\n  println(listOf(2).map { (it) })') },
  { name: 'lambda body starting with (', code: main('  println(listOf(1).map { (it + 1) * 2 })') },
  { name: 'template with nested quotes', code: main('  val b = true\n  println("a ${if (b) "x" else "y"} c")') },
];

(async () => {
  assert.ok(await ensureKotlinSyntax(), 'the Kotlin grammar did not load');
  for (const c of rejected) {
    const e = checkKotlinSyntax(c.code);
    assert.ok(e, `${c.name}: not rejected`);
    assert.equal(e.line, c.line, `${c.name}: reported line ${e.line} (${e.message})`);
    if (c.token) assert.equal(e.token, c.token, `${c.name}: marked '${e.token}' (${e.message})`);
    const r = await compileAndRunKotlin(c.code);
    assert.equal(r.success, false, `${c.name}: the runner still ran it`);
  }
  for (const c of accepted) {
    assert.equal(checkKotlinSyntax(c.code), null, `${c.name}: rejected by the grammar: ${JSON.stringify(checkKotlinSyntax(c.code))}`);
    if (c.grammarOnly) continue;
    const r = await compileAndRunKotlin(c.code);
    assert.ok(r.success, `${c.name}: the runner failed: ${r.error?.message}`);
  }
  // The rewrites never move a line, and a column after an inserted character maps back to the learner's code.
  const src = 'fun main() {\n  val f: (Int) -> Int = fun(n) = n + ) 2\n}';
  assert.equal(prepareForParse(src).text.split('\n').length, src.split('\n').length);
  const e = checkKotlinSyntax(src);
  assert.ok(e && e.line === 2 && src.split('\n')[1].slice(e.column).startsWith(e.token ?? '?'), `column mapping: ${JSON.stringify(e)}`);
  console.log(`kotlin syntax: ${rejected.length} rejected and ${accepted.length} accepted cases pass`);
  process.exit(0);
})();

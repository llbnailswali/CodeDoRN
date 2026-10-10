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
  { name: 'type parameters after the function name', code: main('  fun identity<T>(value: T): T = value'), line: 2 },
];

const accepted: { name: string; code: string }[] = [
  { name: 'one-line class body', code: 'class K { val x = 1 }\nobject O { fun f() {} }\nclass C {\n  companion object { const val X = 1 }\n}\n' + main('  println(K().x + C.X)') },
  { name: 'private set before the closing brace', code: 'class H { var c = 0\n  private set }\n' + main('  println(H().c)') },
  { name: 'second catch on its own line', code: main('  try {\n    throw IllegalArgumentException("bad")\n  } catch (e: IllegalArgumentException) {\n    println("a")\n  }\n  catch (e: RuntimeException) {\n    println("r")\n  }') },
  { name: 'catch on its own line at column 0', code: 'fun main() {\ntry {\nprintln(1)\n}\ncatch (e: Exception) {\nprintln(2)\n}\n}' },
  { name: 'anonymous function with untyped parameter', code: main('  val wrap: (String) -> String = fun(word) = "[" + word + "]"\n  println(wrap("sun"))') },
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
    const r = await compileAndRunKotlin(c.code);
    assert.equal(r.success, false, `${c.name}: the runner still ran it`);
  }
  for (const c of accepted) {
    assert.equal(checkKotlinSyntax(c.code), null, `${c.name}: rejected by the grammar: ${JSON.stringify(checkKotlinSyntax(c.code))}`);
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

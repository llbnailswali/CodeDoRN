import assert from 'node:assert/strict';
import { compileAndRunKotlin } from '../src/utils/kotlinRunner';

// Mistakes the simulator used to run although real Kotlin rejects them (found by `npm run compare:errors`), and the valid look-alikes
// that must keep running. Each expectation was confirmed with real kotlinc; they are compared here too when the dev server is up.
const wrap = (body: string) => `fun main() {\n${body}\n}`;
const cases: Array<[string, string, 'error' | 'ok']> = [
  ['String minus', wrap('  val a = "x" - 1\n  println(a)'), 'error'],
  ['String minus a variable in a template-like concat', wrap('  val n = 5\n  println("n: " - n)'), 'error'],
  ['String times', wrap('  val s = "ab" * 3\n  println(s)'), 'error'],
  ['String plus is fine', wrap('  val n = 5\n  println("n: " + n)'), 'ok'],
  ['Int minus is fine', wrap('  val n = 5\n  println(n - 2)'), 'ok'],
  ['assignment as a value in a declaration', wrap('  val a = 1\n  val b = 2\n  val same = a = b\n  println(same)'), 'error'],
  ['assignment inside if', wrap('  var a = 1\n  val b = 2\n  if (a = b) {\n    println("x")\n  }'), 'error'],
  ['== in if is fine', wrap('  val a = 1\n  if (a == 1) {\n    println("x")\n  }'), 'ok'],
  ['!= <= >= in conditions are fine', wrap('  val a = 1\n  if (a != 2 && a <= 3 && a >= 0) {\n    println("x")\n  }'), 'ok'],
  ['named argument inside a call is fine', 'fun f(a: Int = 0) = a\nfun main() {\n  val x = f(a = 2)\n  println(x)\n}', 'ok'],
  ['default parameter is fine', 'fun f(a: Int = 1, b: Int = 2) = a + b\nfun main() {\n  println(f())\n}', 'ok'],
  ['assignment inside a lambda is fine', wrap('  var total = 0\n  listOf(1, 2).forEach { total = total + it }\n  println(total)'), 'ok'],
  ['if expression without else', wrap('  val n = 3\n  val label = if (n > 2) "big"\n  println(label)'), 'error'],
  ['if expression with else', wrap('  val n = 3\n  val label = if (n > 2) "big" else "small"\n  println(label)'), 'ok'],
  ['if expression with else on the next line', wrap('  val n = 3\n  val label = if (n > 2) "big"\n    else "small"\n  println(label)'), 'ok'],
  ['block if expression without else', wrap('  val n = 3\n  val label = if (n > 2) {\n    "big"\n  }\n  println(label)'), 'error'],
  ['block if expression with else', wrap('  val n = 3\n  val label = if (n > 2) {\n    "big"\n  } else {\n    "small"\n  }\n  println(label)'), 'ok'],
  ['return if without else', 'fun f(n: Int): String {\n  return if (n > 2) "big"\n}\nfun main() {\n  println(f(3))\n}', 'error'],
  ['plain if statement without else is fine', wrap('  val n = 3\n  if (n > 2) println("big")\n  println("done")'), 'ok'],
  ['assignment of an if-else is fine', wrap('  var s = ""\n  val n = 3\n  s = if (n > 2) "big" else "small"\n  println(s)'), 'ok'],  // --- misspelled names, even where the line never runs
  ['typo in a plain use', wrap('  val quantity = 3\n  println(qauntity)'), 'error'],
  ['typo inside a template', wrap('  val quantity = 3\n  println("q: $qauntity")'), 'error'],
  ['typo inside an unexecuted branch', wrap('  val quantity = 3\n  if (quantity > 100) {\n    println(qauntity)\n  }'), 'error'],
  ['a lambda parameter near a declared name is fine', wrap('  val items = listOf(1, 2)\n  items.forEach { item -> println(item) }'), 'ok'],
  ['a for variable near a declared name is fine', wrap('  val entries = listOf(1, 2)\n  for (entry in entries) {\n    println(entry)\n  }'), 'ok'],
  ['a member after a dot is never a typo', wrap('  val value = "a"\n  println(value.length)'), 'ok'],
  // --- missing return on one path
  ['final return forgotten', 'fun f(n: Int): String {\n  if (n > 5) {\n    return "big"\n  }\n  "small"\n}\nfun main() {\n  println(f(1))\n}', 'error'],
  ['final return present', 'fun f(n: Int): String {\n  if (n > 5) {\n    return "big"\n  }\n  return "small"\n}\nfun main() {\n  println(f(1))\n}', 'ok'],
  ['if/else both return', 'fun f(n: Int): String {\n  if (n > 5) {\n    return "big"\n  } else {\n    return "small"\n  }\n}\nfun main() {\n  println(f(1))\n}', 'ok'],
  ['else branch forgets return', 'fun f(n: Int): String {\n  if (n > 5) {\n    return "big"\n  } else {\n    "small"\n  }\n}\nfun main() {\n  println(f(1))\n}', 'error'],
  ['else-if chain that ends in else', 'fun f(n: Int): String {\n  if (n > 5) {\n    return "big"\n  } else if (n > 2) {\n    return "mid"\n  } else {\n    return "small"\n  }\n}\nfun main() {\n  println(f(1))\n}', 'ok'],
  ['else-if chain with no final else', 'fun f(n: Int): String {\n  if (n > 5) {\n    return "big"\n  } else if (n > 2) {\n    return "mid"\n  }\n}\nfun main() {\n  println(f(1))\n}', 'error'],
  ['function ending in throw', 'fun f(n: Int): Int {\n  if (n > 0) return n\n  throw IllegalArgumentException("bad")\n}\nfun main() {\n  println(f(1))\n}', 'ok'],
  ['function ending in a when with returns', 'fun f(n: Int): String {\n  when (n) {\n    1 -> return "one"\n    else -> return "many"\n  }\n}\nfun main() {\n  println(f(1))\n}', 'ok'],
  ['Unit function needs no return', 'fun f(n: Int) {\n  println(n)\n}\nfun main() {\n  f(1)\n}', 'ok'],
  // --- if/else-if chains used as a value
  ['else-if chain as a value with a final else', wrap('  val n = 3\n  val label = if (n > 5) "big" else if (n > 2) "mid" else "small"\n  println(label)'), 'ok'],
  ['else-if chain as a value with no final else', wrap('  val n = 3\n  val label = if (n > 5) "big" else if (n > 2) "mid"\n  println(label)'), 'error'],
  // --- too many arguments
  ['too many arguments', 'fun add(a: Int, b: Int) = a + b\nfun main() {\n  println(add(1, 2, 3))\n}', 'error'],  // --- a val assigned again, anywhere on the line
  ['val += inside a one-line lambda', wrap('  val launches = 0\n  val record: () -> Unit = { launches += 1 }\n  record()\n  println(launches)'), 'error'],
  ['val reassigned with =', wrap('  val total = 1\n  if (total > 0) { total = 5 }\n  println(total)'), 'error'],
  ['val incremented', wrap('  val n = 1\n  n++\n  println(n)'), 'error'],
  ['var assigned in a lambda is fine', wrap('  var launches = 0\n  val record: () -> Unit = { launches += 1 }\n  record()\n  println(launches)'), 'ok'],
  ['val with deferred initialization is fine', wrap('  val total: Int\n  total = 5\n  println(total)'), 'ok'],
  ['same name in two scopes is never judged', 'fun a() {\n  val count = 1\n  println(count)\n}\nfun b() {\n  var count = 0\n  count += 1\n  println(count)\n}\nfun main() {\n  a()\n  b()\n}', 'ok'],
  ['a loop variable named like an earlier val is fine', wrap('  val i = 10\n  for (i in 1..2) {\n    println(i)\n  }'), 'ok'],
  ['a property assigned through a receiver is not a local val', 'class A(var x: Int)\nfun main() {\n  val x = 1\n  val a = A(2)\n  a.x = 3\n  println(x + a.x)\n}', 'ok'],  // --- a nullable number concatenated into a string is fine; in arithmetic it is not
  ['String + nullable Int is concatenation', wrap('  val age: Int? = null\n  println("Age: " + age)'), 'ok'],
  ['nullable Int + String is an error (Int?.plus does not exist)', wrap('  val age: Int? = null\n  println(age + " years")'), 'error'],
  ['String + other + nullable Int is concatenation', wrap('  val age: Int? = 3\n  val name = "Ana"\n  println("Name: " + name + " age: " + age)'), 'ok'],
  ['nullable Int + 1 is an error', wrap('  val age: Int? = 3\n  println(age + 1)'), 'error'],
  ['nullable Int * 2 inside a string template is an error', wrap('  val age: Int? = 3\n  println("x: ${age * 2}")'), 'error'],  // --- exhaustive when over a sealed class or an enum
  ['sealed when missing a case', 'sealed class S\nclass A : S()\nclass B : S()\nfun f(s: S): String = when (s) {\n  is A -> "a"\n}\nfun main() {\n  println(f(A()))\n}', 'error'],
  ['sealed when covering every case', 'sealed class S\nclass A : S()\nclass B : S()\nfun f(s: S): String = when (s) {\n  is A -> "a"\n  is B -> "b"\n}\nfun main() {\n  println(f(A()))\n}', 'ok'],
  ['sealed interface with an object case', 'sealed interface St\nobject Idle : St\ndata class Done(val n: Int) : St\nfun f(s: St) = when (s) {\n  is Done -> "done"\n}\nfun main() {\n  println(f(Idle))\n}', 'error'],
  ['sealed when with else', 'sealed class S\nclass A : S()\nclass B : S()\nfun f(s: S): String = when (s) {\n  is A -> "a"\n  else -> "other"\n}\nfun main() {\n  println(f(B()))\n}', 'ok'],
  ['enum when missing an entry', 'enum class Color { RED, GREEN, BLUE }\nfun f(c: Color) = when (c) {\n  Color.RED -> 1\n  Color.GREEN -> 2\n}\nfun main() {\n  println(f(Color.RED))\n}', 'error'],
  ['enum when covering every entry', 'enum class Color { RED, GREEN, BLUE }\nfun f(c: Color) = when (c) {\n  Color.RED -> 1\n  Color.GREEN, Color.BLUE -> 2\n}\nfun main() {\n  println(f(Color.RED))\n}', 'ok'],
  ['enum with constructor arguments', 'enum class Size(val ml: Int) { SMALL(250), LARGE(500) }\nfun f(s: Size) = when (s) {\n  Size.SMALL -> "s"\n}\nfun main() {\n  println(f(Size.SMALL))\n}', 'error'],
  ['when over an Int is not judged here', 'fun f(n: Int) = when (n) {\n  1 -> "one"\n  else -> "many"\n}\nfun main() {\n  println(f(1))\n}', 'ok'],
  // --- extension property with an initializer
  ['extension property with an initializer', 'class User(val first: String)\nval User.greeting: String = "hi"\nfun main() {\n  println(User("a").greeting)\n}', 'error'],
  ['extension property with a getter', 'class User(val first: String)\nval User.greeting: String get() = "hi " + first\nfun main() {\n  println(User("a").greeting)\n}', 'ok'],
  // --- casts
  ['an as cast that succeeds', wrap('  val a: Any = "text"\n  val s = a as String\n  println(s.length)'), 'ok'],  ['sealed objects compared by name, one missing', 'sealed interface St\ndata object Waiting : St\ndata object Done : St\nfun f(s: St) = when (s) {\n  Waiting -> "w"\n}\nfun main() {\n  println(f(Done))\n}', 'error'],
  ['sealed objects compared by name, all covered', 'sealed interface St\ndata object Waiting : St\ndata object Done : St\nfun f(s: St) = when (s) {\n  Waiting -> "w"\n  Done -> "d"\n}\nfun main() {\n  println(f(Done))\n}', 'ok'],
];

(async () => {
  let realUp = true;
  try { await fetch('http://localhost:8787/health'); } catch { realUp = false; }
  for (const [name, code, want] of cases) {
    const r = await compileAndRunKotlin(code, { timeoutMs: 1500 });
    const simulatorError = !!r.error && r.error.type !== 'runtime_error';
    assert.equal(simulatorError ? 'error' : 'ok', want, `${name} [simulator]: ${JSON.stringify(r.error ?? r.output)}`);
    if (realUp) {
      const real = await (await fetch('http://localhost:8787/run', { method: 'POST', body: JSON.stringify({ code }) })).json();
      assert.equal(real.stage === 'compile' ? 'error' : 'ok', want, `${name} [kotlinc]: ${JSON.stringify(real.errors?.[0] ?? real.stage)}`);
    }
    console.log(`ok  ${name} -> ${want}`);
  }
  console.log(realUp ? 'structure rules: simulator and real kotlinc agree on every case' : 'structure rules: simulator cases pass (kotlinc server not running)');
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });

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
  ['sealed objects compared by name, all covered', 'sealed interface St\ndata object Waiting : St\ndata object Done : St\nfun f(s: St) = when (s) {\n  Waiting -> "w"\n  Done -> "d"\n}\nfun main() {\n  println(f(Done))\n}', 'ok'],  // --- two interfaces give the same member a default body
  ['two interface defaults, not overridden', 'interface Light {\n  fun mode() = "light"\n}\ninterface Dark {\n  fun mode() = "dark"\n}\nclass Theme : Light, Dark\nfun main() {\n  println(Theme().mode())\n}', 'error'],
  ['two interface defaults, overridden', 'interface Light {\n  fun mode() = "light"\n}\ninterface Dark {\n  fun mode() = "dark"\n}\nclass Theme : Light, Dark {\n  override fun mode() = super<Dark>.mode()\n}\nfun main() {\n  println(Theme().mode())\n}', 'ok'],
  ['two interfaces with different members', 'interface A {\n  fun a() = 1\n}\ninterface B {\n  fun b() = 2\n}\nclass C : A, B\nfun main() {\n  println(C().a() + C().b())\n}', 'ok'],
  ['one default, one abstract, overridden', 'interface A {\n  fun f(): Int\n}\ninterface B {\n  fun f() = 2\n}\nclass C : A, B {\n  override fun f() = 3\n}\nfun main() {\n  println(C().f())\n}', 'ok'],  // --- KR-004/005/006 (KOTLIN_RUNNER_KNOWN_ISSUES.md)
  ['statement after main at the top level', 'fun main() {\n  println("A")\n}\nprintln("B")', 'error'],
  ['top-level declarations around main are fine', 'val greeting = "hi"\nfun shout(s: String) = s.uppercase()\nclass A\nfun main() {\n  println(shout(greeting))\n}', 'ok'],
  ['an Int as an if condition', wrap('  val n = 1\n  if (n) {\n    println("yes")\n  }'), 'error'],
  ['a Boolean as an if condition', wrap('  val ok = true\n  if (ok) {\n    println("yes")\n  }'), 'ok'],
  ['an Int literal as a while condition', wrap('  var i = 0\n  while (1) {\n    i++\n    if (i > 2) break\n  }'), 'error'],
  ['a String var given an Int', wrap('  var name = "Kotlin"\n  name = 5\n  println(name)'), 'error'],
  ['an Int var given a String', wrap('  var count = 3\n  count = "four"\n  println(count)'), 'error'],
  ['an Int var given an Int', wrap('  var count = 3\n  count = 4\n  println(count)'), 'ok'],
  ['a Long var given an Int literal', wrap('  var big = 5L\n  big = 7\n  println(big)'), 'ok'],
  ['a Double var given an Int literal', wrap('  var price = 2.5\n  price = 3\n  println(price)'), 'error'],
  ['an Int literal above Int.MAX_VALUE', wrap('  val c: Int = 3000000000\n  println(c)'), 'error'],
  ['the same literal as a Long', wrap('  val c: Long = 3000000000\n  println(c)'), 'ok'],
  ['a one-line for body', wrap('  for (n in 1..3) println(n)'), 'ok'],
  ['downTo with step, one-line body', wrap('  for (n in 10 downTo 0 step 4) println(n)'), 'ok'],
  ['vararg iterated with a one-line for', 'fun total(vararg xs: Int): Int {\n  var s = 0\n  for (x in xs) s += x\n  return s\n}\nfun main() {\n  println(total())\n  println(total(1, 2, 3))\n}', 'ok'],  ['do-while with while on the next line', wrap('  var n = 5\n  do {\n    print(n)\n  }\n  while (n < 2)\n  println()'), 'ok'],
  ['a range check used as a value', wrap('  println(10 in 5..10)\n  println(3 !in 5..10)'), 'ok'],  // --- widened mistake audit
  ['a method called without parentheses', wrap('  val name = "ana"\n  println(name.uppercase)'), 'error'],
  ['the same method called properly', wrap('  val name = "ana"\n  println(name.uppercase())'), 'ok'],
  ['a function reference is not a call', wrap('  val f: (String) -> String = String::uppercase\n  println(f("ana"))'), 'ok'],
  ['Pair.first is a property, not a call', wrap('  val p = Pair(1, 2)\n  println(p.first)'), 'ok'],  // --- a when branch without its arrow
  ['when branch with - instead of ->', wrap('  val score = 85\n  when (score) {\n    in 90..100 -> println("A")\n    in 80..89 - println("B")\n    else -> println("F")\n  }'), 'error'],
  ['when branch with no arrow at all', wrap('  val n = 2\n  val s = when (n) {\n    1 -> "one"\n    2 "two"\n    else -> "many"\n  }\n  println(s)'), 'error'],
  ['when branches with block bodies', wrap('  val n = 2\n  when (n) {\n    1 -> {\n      println("one")\n      println("1")\n    }\n    else -> {\n      println("other")\n    }\n  }'), 'ok'],
  ['when branch result on the next line', wrap('  val n = 2\n  when (n) {\n    1 ->\n      println("one")\n    else ->\n      println("other")\n  }'), 'ok'],
  ['when conditions split across lines', wrap('  val n = 2\n  when (n) {\n    1,\n    2 -> println("small")\n    else -> println("big")\n  }'), 'ok'],
  ['subject-less when', wrap('  val n = 2\n  when {\n    n < 0 -> println("neg")\n    n == 0 -> println("zero")\n    else -> println("pos")\n  }'), 'ok'],
  // --- if / when / try used as a value: the type of their branches (a throw branch does not count, a literal null makes it nullable)
  ['try value returned as the wrong type', 'fun p(t: String): String {\n  return try {\n    t.toInt()\n  } catch (e: NumberFormatException) {\n    0\n  }\n}\nfun main() {\n  println(p("1"))\n}', 'error'],
  ['try value of the right type', 'fun p(t: String): Int {\n  return try {\n    t.toInt()\n  } catch (e: NumberFormatException) {\n    0\n  }\n}\nfun main() {\n  println(p("x"))\n}', 'ok'],
  ['when value returned as the wrong type', 'enum class Size { S, M }\nfun label(s: Size): Int {\n  return when (s) {\n    Size.S -> "S"\n    Size.M -> "M"\n  }\n}\nfun main() {\n  println(label(Size.S))\n}', 'error'],
  ['when value with mixed branches into Any', 'fun f(n: Int): Any = when (n) {\n  1 -> "one"\n  else -> 2\n}\nfun main() {\n  println(f(1))\n}', 'ok'],
  ['if with a null branch returned as the wrong nullable type', 'fun f(i: String): String? {\n  return if (i == "tea") 30 else null\n}\nfun main() {\n  println(f("tea"))\n}', 'error'],
  ['if with a null branch of the right type', 'fun f(i: String): Int? {\n  return if (i == "tea") 30 else null\n}\nfun main() {\n  println(f("tea"))\n}', 'ok'],
  ['if with a throw branch returned as the wrong type', 'fun v(q: Int): String {\n  return if (q > 0) q else throw IllegalArgumentException("x")\n}\nfun main() {\n  println(v(1))\n}', 'error'],
  ['if with a throw branch of the right type', 'fun v(q: Int): Int {\n  return if (q > 0) q else throw IllegalArgumentException("x")\n}\nfun main() {\n  println(v(1))\n}', 'ok'],
  ['smart-cast branch is not nullable', 'fun f(x: String?): Int {\n  val s = if (x != null) x else "-"\n  return s.length\n}\nfun main() {\n  println(f(null))\n}', 'ok'],
  ['unary plus returned as a String', 'fun f(n: Int): String {\n  return + n\n}\nfun main() {\n  println(f(1))\n}', 'error'],
  ['generic type alias', 'typealias Bucket<T> = MutableList<T>\nfun main() {\n  val names: Bucket<String> = mutableListOf("A", "B")\n  println(names.size)\n}', 'ok'],
  // --- a literal of the wrong kind for a generic class's own type parameter
  ['generic method given the wrong literal', 'class Store<T> {\n  private val items = mutableListOf<T>()\n  fun add(v: T) {\n    items.add(v)\n  }\n  fun first(): T? = items.firstOrNull()\n}\nfun main() {\n  val s = Store<Int>()\n  s.add("20")\n  println(s.first())\n}', 'error'],
  ['generic method given the right literal', 'class Store<T> {\n  private val items = mutableListOf<T>()\n  fun add(v: T) {\n    items.add(v)\n  }\n  fun first(): T? = items.firstOrNull()\n}\nfun main() {\n  val s = Store<String>()\n  s.add("20")\n  println(s.first())\n}', 'ok'],
  ['generic interface typed by declaration', 'interface Logger<in T> {\n  fun log(v: T)\n}\nclass AnyLogger : Logger<Any> {\n  override fun log(v: Any) = println(v)\n}\nfun main() {\n  val l: Logger<String> = AnyLogger()\n  l.log(42)\n}', 'error'],
  ['generic interface given the right literal', 'interface Logger<in T> {\n  fun log(v: T)\n}\nclass AnyLogger : Logger<Any> {\n  override fun log(v: Any) = println(v)\n}\nfun main() {\n  val l: Logger<String> = AnyLogger()\n  l.log("hi")\n}', 'ok'],
  ['Int literal for a Long type argument', 'class Store<T> {\n  private val items = mutableListOf<T>()\n  fun add(v: T) {\n    items.add(v)\n  }\n  fun first(): T? = items.firstOrNull()\n}\nfun main() {\n  val s = Store<Long>()\n  s.add(5)\n  println(s.first())\n}', 'ok'],
  // --- the value of a coroutine scope block, and async/await
  ['withContext value of the wrong type', 'import kotlinx.coroutines.*\nsuspend fun load(): String = withContext(Dispatchers.Default) {\n  12\n}\nfun main() = runBlocking {\n  println(load())\n}', 'error'],
  ['withContext value of the right type', 'import kotlinx.coroutines.*\nsuspend fun load(): Int = withContext(Dispatchers.Default) {\n  12\n}\nfun main() = runBlocking {\n  println(load())\n}', 'ok'],
  ['awaited sum of the wrong type', 'import kotlinx.coroutines.*\nsuspend fun total(): String = coroutineScope {\n  val a = async {\n    4\n  }\n  val b = async {\n    6\n  }\n  a.await() + b.await()\n}\nfun main() = runBlocking {\n  println(total())\n}', 'error'],
  ['awaited sum of the right type', 'import kotlinx.coroutines.*\nsuspend fun total(): Int = coroutineScope {\n  val a = async {\n    4\n  }\n  val b = async {\n    6\n  }\n  a.await() + b.await()\n}\nfun main() = runBlocking {\n  println(total())\n}', 'ok'],
  ['run block value', 'fun f(): String = run {\n  val x = 2\n  "v" + x\n}\nfun main() {\n  println(f())\n}', 'ok'],
  // --- a member that is private everywhere it is declared, reached through any receiver
  ['private enum property from outside', 'enum class Move(private val dx: Int, val dy: Int) {\n  RIGHT(1, 0)\n}\nfun main() {\n  println(Move.RIGHT.dx)\n}', 'error'],
  ['private property through a nullable chain', 'class Address(private val city: String?)\nclass Customer(val address: Address?)\nfun main() {\n  val c = Customer(Address("Pune"))\n  println(c.address?.city)\n}', 'error'],
  ['same name public in another class', 'class A(private val v: Int)\nclass B(val v: Int)\nfun main() {\n  println(B(2).v)\n}', 'ok'],
  ['private property of another instance inside the class', 'class P(private val x: Int) {\n  fun same(o: P) = o.x == x\n}\nfun main() {\n  println(P(1).same(P(1)))\n}', 'ok'],
  ['repeated modifier', 'class F(private private val p: String)\nfun main() {\n  println(1)\n}', 'error'],
  // --- misspelled names that never run, and a member name one typo from the declared one
  ['misspelled println in a branch that never runs', wrap('  val ok = false\n  if (ok) {\n    printn("x")\n  }\n  println("done")'), 'error'],
  ['misspelled member', 'class Address(val city: String)\nclass User(val adrdess: Address?)\nfun main() {\n  val u = User(Address("Pune"))\n  println("City: ${u.address?.city}")\n}', 'error'],
  ['class one letter from a standard type is fine', 'class Strings(val n: Int)\nfun main() {\n  val s: String = "a"\n  println(s + Strings(2).n)\n}', 'ok'],
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

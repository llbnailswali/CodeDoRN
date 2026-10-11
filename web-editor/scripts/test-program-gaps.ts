import assert from 'node:assert/strict';
import { compileAndRunKotlin } from '../src/utils/kotlinRunner';
import { runRealKotlin } from './minikotlin/real-kotlin';

// Shapes found by running a large "Worlds 1-16" program (a banking demo) that real
// kotlinc compiles but the runner rejected or ran wrongly. Every expected value was
// produced by real kotlinc 2.0.21: `npx tsx scripts/test-program-gaps.ts --kotlinc` checks
// every expected value against the real compiler (needs `npm run kotlinc:fetch`). See PITFALLS.md, "A Worlds 1-16 program".

const main = (body: string) => `fun main() {\n${body}\n}`;
export const programGapCases: Array<[string, string, string]> = [
  // ---- `when` branches: result on the next line, `{ ... }` blocks, nesting (the result on the next line printed nothing)
  ['when: result on the line after ->', main('    val x = 1\n    when (x) {\n        1 ->\n            println("one")\n        else ->\n            println("other")\n    }\n    println("end")'), 'one\nend'],
  ['when: block branch, statement form', main('    val x = 1\n    when (x) {\n        1 -> {\n            println("one")\n            println("uno")\n        }\n        else -> println("other")\n    }'), 'one\nuno'],
  ['when: block branch, value is the last expression', main('    val x = 2\n    val s = when (x) {\n        1 -> "a"\n        else -> {\n            val y = x * 2\n            "b$y"\n        }\n    }\n    println(s)'), 'b4'],
  ['when: is-branches inside a local function', 'sealed class R\nclass Ok(val v: Int) : R()\nclass Bad(val m: String) : R()\nfun main() {\n    fun show(r: R) {\n        when (r) {\n            is Ok ->\n                println("Success: ${r.v}")\n\n            is Bad ->\n                println("Failure: ${r.m}")\n        }\n    }\n    show(Ok(3))\n    show(Bad("no"))\n}', 'Success: 3\nFailure: no'],
  ['when: if-else result split over lines', main('    val n = 7\n    val s = when {\n        n > 5 -> if (n % 2 == 0) "big even"\n            else "big odd"\n        else -> "small"\n    }\n    println(s)'), 'big odd'],
  ['when: nested when as a branch value', main('    val a = 1\n    val b = 2\n    val s = when (a) {\n        1 -> when (b) {\n            2 -> "one-two"\n            else -> "one-?"\n        }\n        else -> "?"\n    }\n    println(s)'), 'one-two'],
  ['when: as a call argument', main('    val d = 3\n    println(when (d) {\n        1, 7 -> "weekend"\n        else -> "weekday"\n    })'), 'weekday'],
  ['when: comment lines between branches', main('    val x = 5\n    when (x) {\n        // small numbers\n        in 1..3 -> println("low")\n        // everything else\n        else -> println("high")\n    }'), 'high'],
  ['when: a throw branch in an expression', main('    val code = 2\n    val name = when (code) {\n        1 -> "one"\n        2 -> "two"\n        else -> throw IllegalStateException("bad")\n    }\n    println(name)'), 'two'],
  // ---- `::class.simpleName` of a class name printed "Function"; a reified `T::class.simpleName` called inside a template did not run
  ['simpleName: a class, an instance, an exception', 'class Customer\ndata class P(val a: Int)\nfun main() {\n    println(Customer::class.simpleName)\n    val p = P(1)\n    println(p::class.simpleName)\n    try {\n        "x".toInt()\n    } catch (e: Exception) {\n        println(e::class.simpleName)\n    }\n}', 'Customer\nP\nNumberFormatException'],
  ['simpleName: reified T, body on the next line, called in a template', 'inline fun <reified T> typeName(): String =\n    T::class.simpleName ?: "Unknown"\nclass Customer\nfun main() {\n    println("Generic type: ${typeName<Customer>()}")\n    println(typeName<String>())\n}', 'Generic type: Customer\nString'],
  // ---- named arguments written one per line were rejected as `val` reassignment
  ['named args: one per line in a constructor and a call', 'data class T(val id: Int, val note: String = "")\nfun record(id: Int, note: String = ""): T {\n    val t = T(\n        id = id,\n        note = note\n    )\n    return t\n}\nfun main() {\n    val id = 4\n    println(record(\n        note = "x",\n        id = id\n    ))\n}', 'T(id=4, note=x)'],
  ['named args: a real val reassignment is still rejected', main('    val total = 5\n    total = 6\n    println(total)'), 'ERROR: Val cannot be reassigned'],
  // ---- two classes declaring a method of one name: calls were checked against the wrong signature
  ['same name: methods with different parameters in two classes', 'class Account(var balance: Int) {\n    fun deposit(amount: Int): Int {\n        balance += amount\n        return balance\n    }\n}\nclass Service(val acct: Account) {\n    fun deposit(id: Int, amount: Int): String = "acct $id -> ${acct.deposit(amount)}"\n}\nfun main() {\n    val s = Service(Account(10))\n    println(s.deposit(1, 5))\n    println(s.acct.deposit(2))\n}', 'acct 1 -> 15\n17'],
  ['same name: a wrong argument count to a single function is still rejected', 'fun add(a: Int, b: Int): Int = a + b\nfun main() {\n    println(add(1))\n}', 'ERROR: Wrong argument count'],
  // ---- in a method, `${prop.call()}` did not see the property, and a local `val r` in `$r` became `this.r` (printed null)
  ['class: property inside ${} in a method', 'class Account(var balance: Int) {\n    fun bump(amount: Int): Int = balance + amount\n}\nclass Service(val acct: Account) {\n    fun show(): String = "v ${acct.bump(1)} ${acct.balance}"\n}\nfun main() {\n    println(Service(Account(10)).show())\n}', 'v 11 10'],
  ['class: a method local used in a template', 'class Account(var balance: Int) {\n    fun bump(amount: Int): Int = balance + amount\n}\nclass Service(val acct: Account) {\n    fun show(): String {\n        val r = acct.bump(1)\n        return "v $r"\n    }\n}\nfun main() {\n    println(Service(Account(10)).show())\n}', 'v 11'],
  // ---- nested declarations (`BankingResult.Success`) and `object X : Base()` did not translate at all
  ['nested: generic data classes inside a sealed class', 'sealed class BankingResult<out T> {\n    data class Success<T>(val value: T) : BankingResult<T>()\n    data class Failure(val message: String) : BankingResult<Nothing>()\n}\nfun show(r: BankingResult<*>) {\n    when (r) {\n        is BankingResult.Success ->\n            println("Success: ${r.value}")\n        is BankingResult.Failure ->\n            println("Failure: ${r.message}")\n    }\n}\nfun main() {\n    show(BankingResult.Success(5))\n    show(BankingResult.Failure("no"))\n    println(BankingResult.Success("x"))\n}', 'Success: 5\nFailure: no\nSuccess(value=x)'],
  ['nested: object, data class and a class with a body in a sealed class', 'sealed class State {\n    object Idle : State()\n    data class Loading(val pct: Int) : State()\n    class Done(\n        val text: String\n    ) : State() {\n        fun shout() = text.uppercase()\n    }\n}\nfun describe(s: State): String = when (s) {\n    is State.Idle -> "idle"\n    is State.Loading -> "loading ${s.pct}%"\n    is State.Done -> "done ${s.shout()}"\n}\nfun main() {\n    println(describe(State.Idle))\n    println(describe(State.Loading(40)))\n    println(describe(State.Done("ok")))\n    println(State.Loading(3))\n}', 'idle\nloading 40%\ndone OK\nLoading(pct=3)'],
  ['nested: object in an object, class and enum in a class', 'object Config {\n    const val NAME = "app"\n    object Db {\n        val url = "db://local"\n    }\n}\nclass Outer {\n    class Helper {\n        fun twice(n: Int) = n * 2\n    }\n    enum class Mode { FAST, SLOW }\n}\nfun main() {\n    println(Config.NAME + " " + Config.Db.url)\n    println(Outer.Helper().twice(4))\n    println(Outer.Mode.SLOW)\n}', 'app db://local\n8\nSLOW'],
  ['nested: building one through an instance is rejected', 'class Catalog {\n  class Entry(val id: Int)\n}\nfun main() {\n  val c = Catalog()\n  val e = c.Entry(8)\n  println(e.id)\n}', 'ERROR: Unresolved reference: Entry'],
  ['nested: a nested class cannot read the outer class property', 'class Session(private val token: String) {\n  class Header {\n    fun value() = "Bearer $token"\n  }\n}\nfun main() {\n  println(Session("abc").Header().value())\n}', 'ERROR: Unresolved reference: token'],
  ['object: a top-level object extending a sealed class, checked with is', 'sealed class State\nobject Idle : State()\ndata class Loading(val pct: Int) : State()\nfun describe(s: State): String = when (s) {\n    is Idle -> "idle"\n    is Loading -> "loading ${s.pct}%"\n}\nfun main() {\n    println(describe(Idle))\n    println(describe(Loading(4)))\n    println(Idle is State)\n}', 'idle\nloading 4%\ntrue'],
  // ---- `tailrec` was not understood; `Unit` as a value was undefined; a whole Double property printed without `.0`
  ['tailrec: local and top-level functions', 'tailrec fun gcd(a: Int, b: Int): Int = if (b == 0) a else gcd(b, a % b)\nfun growth(p: Double, rate: Double, years: Int): Double {\n    tailrec fun calculate(\n        remaining: Int,\n        amount: Double\n    ): Double =\n        if (remaining == 0) amount\n        else calculate(remaining - 1, amount * (1 + rate))\n    return calculate(years, p)\n}\nfun main() {\n    println(gcd(84, 36))\n    println(growth(1000.0, 0.5, 2))\n}', '12\n2250.0'],
  ['Unit: as a value, in a template and in a data class', 'data class Box<T>(val v: T)\nfun done(): Unit {\n    return Unit\n}\nfun main() {\n    val u: Any = Unit\n    println("Success: $u")\n    println(Box(Unit))\n    println(done())\n    println(u == Unit)\n}', 'Success: kotlin.Unit\nBox(v=kotlin.Unit)\nkotlin.Unit\ntrue'],
  ['data class: a whole Double or Float property prints with .0', 'data class T(val id: Int, val amount: Double, val rate: Float?, val note: String = "")\nfun main() {\n    println(T(1, 12000.0, 2.0f, "x"))\n    println(T(2, 2.5, null))\n}', 'T(id=1, amount=12000.0, rate=2.0, note=x)\nT(id=2, amount=2.5, rate=null, note=)'],
  // ---- library: String.format, Double.isFinite, Sequence.onEach/sortedBy, destructured lambdas, Map operations, sumOf/maxBy
  ['format: Java-style conversions and HALF_UP rounding', main('    println("INR %.2f".format(14693.280768000004))\n    println("%.2f".format(1.005))\n    println("%.1f|%5d|%-5s|%05.1f|%,d".format(2.25, 42, "ab", 3.14159, 1234567))\n    println(String.format("%s has %d items (%.0f%%)", "cart", 3, 99.5))\n    println("%x %X %+d %08.3f".format(255, 255, 7, -2.5))'), 'INR 14693.28\n1.01\n2.3|   42|ab   |003.1|1,234,567\ncart has 3 items (100%)\nff FF +7 -002.500'],
  ['string: a digit and a letter inside a string stay text', main('    println("Room 5d, level 2.5f, v2.beta")'), 'Room 5d, level 2.5f, v2.beta'],
  ['isFinite: on a variable, a literal and division results', main('    val amount = 5.0\n    println(amount.isFinite())\n    println(5.0.isFinite())\n    println((1.0 / 0.0).isFinite())\n    println((0.0 / 0.0).isNaN())\n    println(4.also { println("v$it") })'), 'true\ntrue\nfalse\ntrue\nv4\n4'],
  ['sequence: onEach counts every element when a sort follows', main('    var n = 0\n    val r = listOf(3, 9, 7, 1).asSequence().onEach { n++ }.filter { it > 2 }.sortedByDescending { it }.take(2).toList()\n    println(r)\n    println(n)'), '[9, 7]\n4'],
  ['lambda: destructured Pair and Map.Entry parameters', main('    val m = mapOf("a" to 1, "b" to 2)\n    m.forEach { (k, v) -> println("$k=$v") }\n    m.forEach { k, v -> println("$k:$v") }\n    println(m.map { (k, v) -> k + v })\n    println(m.mapValues { (_, v) -> v * 10 })\n    println(listOf(Pair("x", 1)).map { (s, n) -> s + n })'), 'a=1\nb=2\na:1\nb:2\n[a1, b2]\n{a=10, b=20}\n[x1]'],
  ['map: filter, mapKeys, maxByOrNull, entries', main('    val m = mapOf("a" to 3, "b" to 7, "c" to 5)\n    println(m.filter { it.value > 4 })\n    println(m.filterValues { it < 6 }.keys)\n    println(m.mapKeys { it.key.uppercase() })\n    println(m.maxByOrNull { it.value }?.key)\n    println(m.entries)\n    println(m.count { (_, v) -> v % 2 == 1 })'), '{b=7, c=5}\n[a, c]\n{A=3, B=7, C=5}\nb\n[a=3, b=7, c=5]\n3'],
  ['list: sumOf, maxByOrNull, minBy, maxOf', 'data class T(val n: String, val a: Double)\nfun main() {\n    val ts = listOf(T("x", 5.0), T("y", 9.0), T("z", 9.0))\n    println(ts.sumOf { it.a })\n    println(ts.maxByOrNull { it.a })\n    println(ts.minBy { it.a }.n)\n    println(ts.maxOf { it.a })\n    println(listOf(1, 2, 3).sumOf { it * 2 })\n}', '23.0\nT(n=y, a=9.0)\nx\n9.0\n12'],
  // ---- a method calling a sibling method without `this.` failed; a receiver block's template read outer locals as members
  ['class: bare calls to own and inherited methods', 'open class Base {\n    fun greet(n: String) = "hi $n"\n}\nclass Kid : Base() {\n    fun total(): Int = 3\n    fun <T> wrap(f: () -> T): T = f()\n    fun show(items: List<Int>): String {\n        var s = 0\n        for (total in items) s += total\n        return greet("kid") + " " + s + " " + total() + " " + wrap { 4 }\n    }\n}\nfun main() {\n    println(Kid().show(listOf(1, 2)))\n}', 'hi kid 3 3 4'],
  ['receiver: outer locals win, member chains and method calls in templates', 'class Owner(val name: String)\nclass Acc(val id: Int, val owner: Owner) {\n    fun label() = "L$id"\n}\nfun main() {\n    val greeting = "Hi"\n    println("Kotlin".run { "$greeting $length ${greeting.length}" })\n    val a = Acc(7, Owner("Aman"))\n    println(a.run { "Account $id belongs to ${owner.name} (${label()})" })\n}', 'Hi 6 2\nAccount 7 belongs to Aman (L7)'],
  ['receiver: a member-only method called bare inside apply', 'class Repo {\n    val items = mutableListOf<String>()\n    fun save(x: String) {\n        items.add(x)\n    }\n}\nfun main() {\n    val r = Repo()\n    r.apply {\n        save("a")\n        save("b")\n    }\n    println(r.items)\n}', '[a, b]'],
  ['map: a generic mutableMapOf property written with [] inside a class', 'class Repo<T> {\n    private val data = mutableMapOf<Int, T>()\n    fun save(id: Int, item: T) {\n        data[id] = item\n    }\n    fun find(id: Int): T? = data[id]\n    fun all(): List<T> = data.values.toList()\n}\nfun main() {\n    val r = Repo<String>()\n    r.save(1, "a")\n    r.save(2, "b")\n    println(r.all())\n    println(r.find(2))\n    println(r.find(5))\n}', '[a, b]\nb\nnull'],
  ['lambda: a statement continued after a trailing && or ==', 'fun main() = run {\n    val balance = 20000.0\n    val t = "S"\n    val ok = balance >= 10000.0 &&\n        t != "C"\n    val same = t ==\n        "S"\n    println("$ok $same")\n}', 'true true'],
  // ---- coroutine library: Mutex/withLock, AtomicInteger, joinAll, catching CancellationException before Exception
  ['coroutines: Mutex, AtomicInteger, joinAll', 'import kotlinx.coroutines.*\nimport kotlinx.coroutines.sync.Mutex\nimport kotlinx.coroutines.sync.withLock\nimport java.util.concurrent.atomic.AtomicInteger\nfun main() = runBlocking {\n    val mutex = Mutex()\n    val ids = AtomicInteger(0)\n    var total = 0\n    val jobs = (1..3).map { i ->\n        launch {\n            mutex.withLock { total += i }\n            ids.incrementAndGet()\n        }\n    }\n    jobs.joinAll()\n    println("$total ${ids.get()} ${mutex.isLocked}")\n}', '6 3 false'],
  ['exceptions: CancellationException is caught before Exception', 'import kotlinx.coroutines.*\nfun classify(e: Exception): String = try {\n    throw e\n} catch (c: CancellationException) {\n    "cancel"\n} catch (x: Exception) {\n    "other"\n}\nfun main() {\n    println(classify(CancellationException("stop")))\n    println(classify(IllegalStateException("bad")))\n    println(CancellationException("x") is IllegalStateException)\n}', 'cancel\nother\ntrue'],
];

if (process.argv.includes('--kotlinc')) {
  const real = await runRealKotlin(programGapCases.map(([name, code]) => ({ id: name, code })));
  let differ = 0;
  for (const [name, , expected] of programGapCases) {
    const r = real.get(name);
    const got = r?.stage === 'ok' ? r.output?.replace(/\n$/, '') : `ERROR: ${r?.stage} ${r?.errors?.join(' | ') ?? ''}`;
    const ok = expected.startsWith('ERROR:') ? r?.stage !== 'ok' : got === expected;
    if (!ok) { differ++; console.error(`REAL KOTLIN DIFFERS ${name}\n   expected ${JSON.stringify(expected)}\n   kotlinc  ${JSON.stringify(got)}`); }
  }
  console.log(`${programGapCases.length - differ} of ${programGapCases.length} expected values confirmed by real kotlinc.`);
} else {
  let failures = 0;
  for (const [name, code, expected] of programGapCases) {
    const result = await compileAndRunKotlin(code);
    const ok = expected.startsWith('ERROR:')
      ? !result.success && (result.error?.message ?? '').includes(expected.slice(6).trim())
      : result.success && result.output === expected;
    if (!ok) {
      failures++;
      console.error(`FAIL ${name}\n   expected ${JSON.stringify(expected)}\n   got      ${JSON.stringify(result.output)} ${result.error?.message ?? ''}`);
    }
  }
  assert.equal(failures, 0, `${failures} of ${programGapCases.length} program-gap cases failed`);
  console.log(`Program gaps: ${programGapCases.length} cases match real Kotlin.`);
}

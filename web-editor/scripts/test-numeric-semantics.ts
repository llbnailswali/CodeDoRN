import assert from 'node:assert/strict';
import { compileAndRunKotlin } from '../src/utils/kotlinRunner';

// Numeric semantics the teaching runner must match real Kotlin on. Every expected
// value below is hand-derived from Kotlin's rules (Int/Long `/` truncates toward
// zero and `*`,`/`,`%` associate left to right; a Float/Double prints with `.0`
// when whole; `==` binds looser than arithmetic). See PITFALLS.md, "Chained Int
// division and integral Double text".

const main = (body: string) => `fun main() {\n${body}\n}`;
const cases: Array<[string, string, string]> = [
  // ---- Int / Long division truncation, whole left-associated chains
  ['chain: a * 100 / b', main('    val a = 17\n    val b = 24\n    println(a * 100 / b)'), '70'],
  ['chain: 100 * a / b', main('    val a = 17\n    val b = 24\n    println(100 * a / b)'), '70'],
  ['chain: a / b * 100 divides first', main('    val a = 17\n    val b = 24\n    println(a / b * 100)'), '0'],
  ['chain: a * 3 / b / 2', main('    val a = 17\n    val b = 2\n    println(a * 3 / b / 2)'), '12'],
  ['chain: a / 4 * 4 + a % 4', main('    val a = 17\n    println(a / 4 * 4 + a % 4)'), '17'],
  ['chain: additive after division', main('    val a = 17\n    val b = 24\n    println(a + 100 / b)'), '21'],
  ['chain: parenthesised numerator', main('    val a = 17\n    println((a + 3) / 2)'), '10'],
  ['chain: Long', main('    val t: Long = 100_000L\n    println(t * 2 / 7)'), '28571'],
  ['chain: Long declared by suffix', main('    val t = 100_000L\n    println(t / 3600 * 60)'), '1620'],
  ['chain: negative operands truncate toward zero', main('    val a = -7\n    println(a / 2)\n    println(-a / 2)\n    println(a * -1 / 2)'), '-3\n3\n3'],
  ['chain: Double operand keeps the fraction', main('    val a = 7\n    val d = 2.0\n    println(a / d)\n    println(d * a / 2)\n    println(2.5 * a / 2)'), '3.5\n7.0\n8.75'],
  ['chain: member operand', main('    val s = "hello"\n    println(s.length * 3 / 2)\n    println(100 / s.length)'), '7\n20'],
  ['chain: compound assignment', main('    var x = 10\n    x += 7 / 2\n    var y = 50\n    y = y * 3 / 4\n    println(x)\n    println(y)'), '13\n37'],
  ['chain: function parameters', 'fun pct(x: Int, y: Int): Int = x * 100 / y\nfun main() {\n    println(pct(17, 24))\n}', '70'],
  ['chain: inside a condition and an if-expression', main('    val w = 5\n    val r = if (w * 3 / 2 > 6) "big" else "small"\n    println(r)\n    println(w * 3 / 2 == 7)'), 'big\ntrue'],
  // ---- String.split returns a Kotlin List (was a plain JS array: `.size` printed null, `.first()` threw)
  ['split: size of the result', main('    println("a,b,c".split(",").size)\n    val parts = "x-y".split("-")\n    println(parts.size)\n    println(parts.first() + parts.last())'), '3\n2\nxy'],
  ['split: several delimiters are alternatives', main('    println("a,b c;d".split(",", " ", ";"))\n    println("a,b c".split(",", " ").size)'), '[a, b, c, d]\n3'],
  ['split: through a safe call chain', main('    val s: String? = "a,b,c"\n    val n: String? = null\n    println(s?.split(",")?.size)\n    println(n?.split(",")?.size)\n    println(n?.split(",")?.size ?: 0)\n    println(s?.split(",")?.last())'), '3\nnull\n0\nc'],
  // ---- null safety: an unguarded `.` or arithmetic on a value that may be null is a compile error (was silently run)
  ['null: .length on a nullable val', main('    val s: String? = "abc"\n    println(s.length)'), 'ERROR: Only safe (?.)'],
  ['null: .length on a nullable var', main('    var s: String? = "abc"\n    println(s.length)'), 'ERROR: Only safe (?.)'],
  ['null: .length on a nullable parameter', 'fun len(s: String?): Int {\n  return s.length\n}\nfun main() {\n  println(len("ab"))\n}', 'ERROR: Only safe (?.)'],
  ['null: .length on a nullable parameter, expression body', 'fun len(s: String?): Int = s.length\nfun main() {\n  println(len("ab"))\n}', 'ERROR: Only safe (?.)'],
  ['null: .length on a nullable call result', 'fun find(): String? = "abc"\nfun main() {\n  println(find().length)\n}', 'ERROR: Only safe (?.)'],
  ['null: a plain . after ?. (s?.trim().length)', main('    val s: String? = "abc"\n    println(s?.trim().length)'), 'ERROR: Only safe (?.)'],
  ['null: a plain . after ?. in a property chain', 'class Address(val city: String?)\nclass User(val address: Address?)\nfun main() {\n  val u: User? = User(Address("Pune"))\n  println(u?.address.city)\n}', 'ERROR: Only safe (?.)'],
  ['null: a nullable class property', 'class U(val email: String?)\nfun main() {\n  val u = U("a@b.c")\n  println(u.email.length)\n}', 'ERROR: Only safe (?.)'],
  ['null: a nullable property reached through a nullable property', 'class Address(val city: String?)\nclass User(val address: Address?)\nfun main() {\n  val u = User(Address("Pune"))\n  println(u.address.city)\n}', 'ERROR: Only safe (?.)'],
  ['null: a loop variable over List<String?>', main('    val l: List<String?> = listOf("ab", null)\n    for (s in l) {\n        println(s.length)\n    }'), 'ERROR: Only safe (?.)'],
  ['null: arithmetic on a nullable val', main('    val n: Int? = 5\n    println(n + 1)'), 'ERROR: Nullable numeric value'],
  ['null: arithmetic on a nullable parameter', 'fun inc(n: Int?): Int = n + 1\nfun main() {\n  println(inc(2))\n}', 'ERROR: Nullable numeric value'],
  ['null: += with a nullable loop variable', main('    val scores: List<Int?> = listOf(4, null, 6)\n    var total = 0\n    for (score in scores) {\n        total += score\n    }\n    println(total)'), 'ERROR: Nullable numeric value'],
  // the same shapes, properly guarded, must still run
  ['null ok: guard with return', 'fun len(s: String?): Int {\n  if (s == null) return 0\n  return s.length\n}\nfun main() {\n  println(len("ab"))\n  println(len(null))\n}', '2\n0'],
  ['null ok: elvis return', 'fun len(s: String?): Int {\n  val t = s ?: return 0\n  return t.length\n}\nfun main() {\n  println(len("ab"))\n}', '2'],
  ['null ok: || guard then use', 'fun len(s: String?): Int {\n  if (s == null || s.isEmpty()) return 0\n  return s.length\n}\nfun main() {\n  println(len("ab"))\n  println(len(""))\n}', '2\n0'],
  ['null ok: else branch after == null', 'fun label(s: String?): String {\n  if (s == null) {\n    return "none"\n  } else if (s.length > 3) {\n    return "long"\n  }\n  return "short"\n}\nfun main() {\n  println(label(null))\n  println(label("abcd"))\n  println(label("a"))\n}', 'none\nlong\nshort'],
  ['null ok: when subject-less branches', 'fun label(s: String?): String = when {\n  s == null -> "none"\n  s.length > 3 -> "long"\n  else -> "short"\n}\nfun main() {\n  println(label(null))\n  println(label("abcd"))\n}', 'none\nlong'],
  ['null ok: property smart cast after a check', 'class User(val name: String, val email: String?)\nfun main() {\n  val u = User("A", "a@x.com")\n  if (u.email != null) {\n    println(u.email.length)\n  }\n  val v = User("B", null)\n  println(v.email?.length ?: 0)\n}', '7\n0'],
  ['null ok: return with && and || guards', 'fun f(pin: String?): Boolean {\n  return pin != null && pin.length == 4\n}\nfun g(pin: String?): Boolean {\n  return pin == null || pin.length < 4\n}\nfun main() {\n  println(f("1234"))\n  println(g("12"))\n  println(g(null))\n}', 'true\ntrue\ntrue'],
  ['null ok: a typed as? cast inside a string template', main('    val third: Any = "kotlin"\n    val n: Any = 42\n    println("A: ${(third as? Int) ?: -1}")\n    println("B: ${(n as? Int) ?: -1}")'), 'A: -1\nB: 42'],
  ['null: unsafe access inside a string template', main('    val user: String? = "  bo  "\n    println("Length: ${user.trim().length}")'), 'ERROR: Only safe (?.)'],
  ['null: unsafe access on a nullable parameter inside a template', 'fun show(s: String?) {\n  println("Len: ${s.length}")\n}\nfun main() {\n  show("ab")\n}', 'ERROR: Only safe (?.)'],
  ['null ok: template after an early-return guard', 'fun show(s: String?) {\n  if (s == null) {\n    println("none")\n    return\n  }\n  println("Len: ${s.length}")\n}\nfun main() {\n  show("ab")\n  show(null)\n}', 'Len: 2\nnone'],
  ['null ok: template inside an if-not-null branch', 'fun show(s: String?) {\n  if (s != null) {\n    println("Len: ${s.length} ${s.uppercase()}")\n  }\n}\nfun main() {\n  show("ab")\n}', 'Len: 2 AB'],
  ['null ok: && guard', 'fun ok(t: String?): Boolean = t != null && t.length > 3\nfun main() {\n  println(ok(null))\n  println(ok("abcd"))\n}', 'false\ntrue'],
  ['null ok: loop variable checked before arithmetic', main('    val scores: List<Int?> = listOf(4, null, 6)\n    var total = 0\n    for (score in scores) {\n        if (score != null) {\n            total += score\n        }\n    }\n    println(total)'), '10'],
  ['null ok: arithmetic with a fallback', main('    val n: Int? = null\n    println((n ?: 0) + 5)'), '5'],
  // ---- `==` must not capture the nearest operands of a larger arithmetic expression
  ['equality: n % m == 0', main('    val n = 12\n    val m = 4\n    println(n % m == 0)'), 'true'],
  ['equality: a + b == c', main('    val a = 2\n    val b = 3\n    val c = 5\n    println(a + b == c)'), 'true'],
  ['equality: a == b + 1', main('    val a = 6\n    val b = 5\n    println(a == b + 1)'), 'true'],
  // ---- Float/Double text: whole values keep `.0` everywhere they can be printed
  ['double: template $name and ${name}', main('    val c = 25.0\n    println("c=$c")\n    println("c=${c}")'), 'c=25.0\nc=25.0'],
  ['double: template expression', main('    val a = 12.5\n    println("c=${a * 2}")\n    println("d=${a * 2.0 + 1}")'), 'c=25.0\nd=26.0'],
  ['double: template toDouble()', main('    val a = 3\n    println("r=${a.toDouble()}")'), 'r=3.0'],
  ['double: template with a user function', 'fun half(x: Int): Double = x / 2.0\nfun main() {\n    println("h=${half(6)}")\n    println("h=" + half(6))\n}', 'h=3.0\nh=3.0'],
  ['double: string concatenation', main('    val d = 25.0\n    println("d=" + d)\n    val s = "d=" + d\n    println(s)'), 'd=25.0\nd=25.0'],
  ['double: toString()', main('    val d = 25.0\n    println(d.toString())\n    println(d)'), '25.0\n25.0'],
  ['double: Float', main('    val f = 2.0f\n    println("f=$f")\n    println(f)'), 'f=2.0\n2.0'],
  ['double: Int / Double results', main('    val km = 200\n    val l = 12.5\n    println("e=${km / l}")\n    println(km / l)'), 'e=16.0\n16.0'],
  ['double: raw string template', main('    val d = 4.0\n    val s = """\n        v=$d\n    """.trimIndent()\n    println(s)'), 'v=4.0'],
  ['double: non-whole values are untouched', main('    val a = 83.5\n    println("a=$a")\n    println("a=" + a)'), 'a=83.5\na=83.5'],
  // ---- Compound assignment (`/=` truncates for Int/Long; String += Double keeps `.0`)
  ['compound: Int /= truncates', main('    var stock = 157\n    stock /= 2\n    println(stock)\n    stock %= 25\n    println(stock)'), '78\n3'],
  ['compound: Long /=', main('    var t = 100_001L\n    t /= 3600\n    println(t)'), '27'],
  ['compound: Double /= keeps the fraction', main('    var bill = 45.0\n    bill /= 4\n    println("Each pays $bill")'), 'Each pays 11.25'],
  ['compound: Int var /= Int expression', main('    var total = 90\n    val parts = 4\n    total /= parts + 1\n    println(total)'), '18'],
  ['compound: String += Double', main('    var s = "Savings: "\n    var d = 600.0\n    s += d\n    s += " | "\n    s += 2\n    println(s)'), 'Savings: 600.0 | 2'],
  ['chain: Int divided by a converted Double', main('    val a = 6\n    val b = 4\n    println(a / b.toDouble())'), '1.5'],
  // ---- ++/-- as expression values
  ['incdec: postfix and prefix values', main('    var next = 100\n    val first = next++\n    val second = next++\n    val skipped = ++next\n    next--\n    println("$first $second $skipped $next")'), '100 101 103 102'],
  ['incdec: several on one line evaluate left to right', main('    var n = 5\n    val a = n++ + ++n\n    val b = n-- - --n\n    val c = ++n * n++\n    println("a=$a b=$b c=$c n=$n")'), 'a=12 b=2 c=36 n=7'],
  // ---- `is` on numeric types: a Double is not an Int, even though both are JS numbers
  ['is: numeric type distinction on immutable Any values', main('    val a: Any = 3.5\n    val b: Any = 7\n    val c: Any = 9L\n    println(a is Int)\n    println(a is Double)\n    println(a !is Int)\n    println(b is Int)\n    println(b is Double)\n    println(c is Long)\n    println(c is Int)\n    println(b !is String)'), 'false\ntrue\ntrue\ntrue\nfalse\ntrue\nfalse\ntrue'],
  ['is: && of two numeric checks', main('    val value: Any = 3.5\n    val isNumber = value is Int || value is Double\n    val both = value is Int && value is Double\n    println("$isNumber $both")'), 'true false'],
  // ---- a when expression's result keeps its type (Int division on it must truncate)
  ['when: Int result feeds Int division', main('    val month = 7\n    val days = when (month) {\n        2 -> 28\n        4, 6, 9, 11 -> 30\n        else -> 31\n    }\n    println(days / 7)\n    println(days * 3 / 2)'), '4\n46'],
  ['when: Double result prints with .0', main('    val kind = 2\n    val rate = when (kind) {\n        1 -> 1.5\n        else -> 3.0\n    }\n    println("rate=$rate")'), 'rate=3.0'],
  ['when: String result concatenates with a Double', main('    val n = 2\n    val label = when (n) {\n        1 -> "one"\n        else -> "many"\n    }\n    val price = 5.0\n    println(label + ": " + price)'), 'many: 5.0'],
  // ---- membership with variable bounds, and variables that share a builtin's name
  ['range: in / !in with variable bounds', main('    val low = 6\n    val high = 12\n    var inside = 0\n    for (n in 1..20) {\n        if (n in low..high) {\n            inside++\n        }\n        if (n !in low..high && n == 20) {\n            inside += 100\n        }\n    }\n    println(inside)'), '107'],
  ['range: in with until and variable bounds', main('    val a = 3\n    val b = 6\n    var hits = 0\n    for (n in 1..10) {\n        if (n in a until b) {\n            hits++\n        }\n    }\n    println(hits)'), '3'],
  ['range: when branch with variable bounds', main('    val lo = 10\n    val hi = 20\n    val x = 15\n    val label = when (x) {\n        in lo..hi -> "mid"\n        else -> "out"\n    }\n    println(label)'), 'mid'],
  ['name: variables named like coroutine builtins', main('    var delay = 2\n    val run = 3\n    val repeat = 5\n    delay *= 2\n    println("delay=${delay}s run=$run repeat=${repeat}")'), 'delay=4s run=3 repeat=5'],
  // ---- `step` must be positive (Kotlin throws IllegalArgumentException, not an endless loop)
  ['step: a positive step still works in all three forms', main('    var t = 0\n    for (i in 1..10 step 3) { t += i }\n    for (i in 10 downTo 1 step 4) { t += i }\n    for (i in 0 until 10 step 5) { t += i }\n    println(t)'), '45'],
  ['step: a negative step throws IllegalArgumentException', main('    try {\n        for (i in 10 downTo 1 step -2) {\n            println(i)\n        }\n    } catch (e: IllegalArgumentException) {\n        println(e.message)\n    }'), 'Step must be positive, was: -2.'],
  ['step: a zero step throws before the first iteration', main('    try {\n        for (i in 1..10 step 0) {\n            println("body")\n        }\n    } catch (e: IllegalArgumentException) {\n        println("caught")\n    }'), 'caught'],
  ['step: nested loops keep their own step', main('    var t = 0\n    for (a in 1..4 step 2) {\n        for (b in 1..6 step 3) {\n            t += a * b\n        }\n    }\n    println(t)'), '20'],
  // ---- function declaration diagnostics (Kotlin rejects these; the simulator used to run them)
  ['func: local function used before its declaration', 'fun main() {\n    println(twice(4))\n    fun twice(n: Int) = n * 2\n}', 'ERROR: Unresolved reference: twice'],
  ['func: local function declared before use is fine', 'fun main() {\n    fun twice(n: Int) = n * 2\n    println(twice(4))\n}', '8'],
  ['func: top-level function declared after main is fine', 'fun main() {\n    println(triple(3))\n}\nfun triple(n: Int) = n * 3', '9'],
  ['func: block body with a return type but no return', 'fun double(n: Int): Int {\n    println(n * 2)\n}\nfun main() {\n    println(double(4))\n}', 'ERROR: A return expression is required'],
  ['func: TODO() and throw satisfy a return type', 'fun a(): String {\n    TODO()\n}\nfun b(): Int {\n    throw IllegalStateException("no")\n}\nfun main() {\n    println("ok")\n}', 'ok'],
  ['func: early returns are recognised', 'fun grade(s: Int): String {\n    if (s >= 90) return "A"\n    return "B"\n}\nfun main() {\n    println(grade(95) + grade(10))\n}', 'AB'],
  // ---- if used as an expression inside another expression
  ['ifexpr: as a println argument', main('    val n = 7\n    println(if (n > 5) "big" else "small")\n    println(if (n > 50) "big" else "small")'), 'big\nsmall'],
  ['ifexpr: parenthesised operands and concatenation', main('    val gift = true\n    val n = 7\n    val fee = (if (gift) 3 else 0) + (if (n > 100) 1 else 0)\n    println(fee)\n    println("size: " + (if (gift) "L" else "S"))'), '3\nsize: L'],
  ['ifexpr: inside a template placeholder', main('    val big = true\n    println("x=${if (big) 10 else 20} y=${if (!big) 1 else 2}")'), 'x=10 y=2'],
  ['ifexpr: chained else-if as an argument', main('    val n = 7\n    println(if (n > 10) "A" else if (n > 5) "B" else "C")'), 'B'],
  ['ifexpr: nested if in the then-branch and a second argument after it', main('    val a = 3\n    val b = 8\n    println(if (a > 1) (if (b > 5) "both" else "a") else "none", a + b)'), 'both 11'],
  ['ifexpr: a statement-level if is not rewritten', main('    val n = 7\n    if (n > 5) {\n        println("yes")\n    } else {\n        println("no")\n    }\n    if (n > 5) println("short")'), 'yes\nshort'],
  ['ifexpr: if text inside a string is left alone', main('    val n = 1\n    println("use (if (n > 0) a else b) here")'), 'use (if (n > 0) a else b) here'],
  // ---- collections: bounds, missing methods, membership, read-only mutation
  ['coll: list index past the end throws', main('    val a = listOf(1, 2, 3)\n    println(a[3])'), 'ERROR: Index 3 out of bounds for length 3'],
  ['coll: array index past the end throws', main('    val a = arrayOf(1, 2, 3)\n    println(a[5])'), 'ERROR: Index 5 out of bounds for length 3'],
  ['coll: negative index throws', main('    val a = listOf(1, 2, 3)\n    val i = -1\n    println(a[i])'), 'ERROR: Index -1 out of bounds for length 3'],
  ['coll: assigning past the end throws instead of growing', main('    val a = mutableListOf(1, 2, 3)\n    a[3] = 9\n    println(a)'), 'ERROR: Index 3 out of bounds for length 3'],
  ['coll: removeAt past the end throws', main('    val a = mutableListOf(1, 2, 3)\n    a.removeAt(5)'), 'ERROR: Index 5 out of bounds for length 3'],
  ['coll: OOB is catchable as IndexOutOfBoundsException', main('    val a = listOf(1)\n    try {\n        println(a[4])\n    } catch (e: IndexOutOfBoundsException) {\n        println("caught")\n    }'), 'caught'],
  ['coll: in-range reads, writes and compound writes', main('    val a = mutableListOf(1, 2, 3)\n    a[0] = 10\n    a[1] += 5\n    a[2]++\n    println(a)\n    println(a[a.size - 1])'), '[10, 7, 4]\n4'],
  ['coll: first() on an empty list', main('    val a = listOf<Int>()\n    println(a.first())'), 'ERROR: List is empty.'],
  ['coll: add to a read-only list is a compile error', main('    val a = listOf(1, 2)\n    a.add(3)'), 'ERROR: Unresolved reference: add'],
  ['coll: assigning into a read-only map is a compile error', main('    val m = mapOf("a" to 1)\n    m["b"] = 2'), 'ERROR: No set method providing array access'],
  ['coll: the same name used mutably elsewhere is not flagged', 'fun f() {\n    val items = listOf(1)\n    println(items.size)\n}\nfun g() {\n    val items = mutableListOf(1)\n    items.add(2)\n    println(items.size)\n}\nfun main() {\n    f()\n    g()\n}', '1\n2'],
  ['coll: Set.add reports whether the element was new', main('    val s = mutableSetOf(1, 2)\n    println(s.add(2))\n    println(s.add(3))\n    println(s)'), 'false\ntrue\n[1, 2, 3]'],
  ['coll: list add(index, item) inserts', main('    val a = mutableListOf(1, 3)\n    a.add(1, 2)\n    a.add(0, 0)\n    println(a)'), '[0, 1, 2, 3]'],
  ['coll: indices, lastIndex and withIndex', main('    val a = listOf("x", "y", "z")\n    for (i in a.indices) {\n        print(i)\n    }\n    println()\n    println(a.lastIndex)\n    for ((i, v) in a.withIndex()) {\n        print("$i$v ")\n    }\n    println()'), '012\n2\n0x 1y 2z '],
  ['coll: for over a call result iterates values', main('    for (n in listOf(3, 1, 2).sorted()) {\n        print(n)\n    }\n    println()\n    for (n in listOf(1, 2, 3).reversed()) {\n        print(n)\n    }\n    println()'), '123\n321'],
  ['coll: x in / !in a list, set and derived list', main('    val a = listOf(1, 2, 3)\n    val s = setOf("p", "q")\n    println(2 in a)\n    println(9 !in a)\n    println("q" in s)\n    val big = a.filter { it > 1 }\n    println(1 in big)'), 'true\ntrue\ntrue\nfalse'],
  ['coll: in inside a string is text', main('    val a = listOf(1)\n    println("item in a is fine")'), 'item in a is fine'],
  ['coll: -= on mutable collections and var read-only lists', main('    val a = mutableListOf(1, 2, 3)\n    a -= 2\n    val s = mutableSetOf("x", "y")\n    s -= "x"\n    s += "z"\n    var r = listOf(1)\n    r += 2\n    r += 3\n    r -= 1\n    println("$a $s $r")'), '[1, 3] [y, z] [2, 3]'],
  ['coll: map put / getOrDefault / getValue / keys / values / +=', main('    val m = mutableMapOf("a" to 1)\n    println(m.put("a", 5))\n    m["b"] = 2\n    m += "c" to 3\n    println(m.getOrDefault("z", 0))\n    println(m.getValue("c"))\n    println(m.keys)\n    println(m.values)\n    var t = 0\n    for (k in m.keys) {\n        t += m.getValue(k)\n    }\n    println(t)'), '1\n0\n3\n[a, b, c]\n[5, 2, 3]\n10'],
  ['coll: toSet / distinct / sum / contentToString / IntArray', main('    println(listOf(1, 1, 2).toSet())\n    println(listOf(1, 1, 2).distinct())\n    val arr = arrayOf(4, 5, 6)\n    println(arr.sum())\n    println(arr.contentToString())\n    val zeros = IntArray(3)\n    zeros[1] = 7\n    println(zeros.contentToString())'), '[1, 2]\n[1, 2]\n15\n[4, 5, 6]\n[0, 7, 0]'],
  ['coll: sort() orders numbers by value, not as text', main('    val a = mutableListOf(10, 9, 2, 33)\n    a.sort()\n    println(a)\n    a.sortDescending()\n    println(a)'), '[2, 9, 10, 33]\n[33, 10, 9, 2]'],
  // ---- string literals inside ${...}, map keys that contain brackets, if-expression types
  ['tpl: a string literal inside a placeholder', main('    val grades = mapOf("Ben" to 72)\n    println("Ben: ${grades["Ben"]} Zed: ${grades["Zed"]}")'), 'Ben: 72 Zed: null'],
  ['tpl: joinToString with a quoted separator', main('    val a = listOf(1, 2, 3)\n    println("Items: ${a.joinToString(", ")}!")'), 'Items: 1, 2, 3!'],
  ['tpl: an if-expression with string branches in a placeholder', main('    val big = true\n    println("size: ${if (big) "L" else "S"} / ${if (!big) "L" else "S"}")'), 'size: L / S'],
  ['tpl: contains with a quoted argument', main('    val a = listOf("x", "y")\n    println("has y: ${a.contains("y")}, has q: ${a.contains("q")}")'), 'has y: true, has q: false'],
  ['map: a key expression that itself uses brackets', main('    val names = listOf("pen", "ink")\n    val prices = listOf(3, 12)\n    val menu = mutableMapOf<String, Int>()\n    for (i in names.indices) {\n        menu[names[i]] = prices[i]\n    }\n    println(menu)\n    menu[names[0]] += 1\n    println(menu["pen"])'), '{pen=3, ink=12}\n4'],
  ['coll: toMutableList copies a read-only list', main('    val a = listOf(3, 1)\n    val b = a.toMutableList()\n    b.add(9)\n    println("$a $b")'), '[3, 1] [3, 1, 9]'],
  ['ifexpr: a Double branch makes the value a Double', main('    val n = 5\n    val s = listOf(1, 2, 3, 4, 5)\n    val m = if (n % 2 == 1) s[n / 2].toDouble() else (s[0] + s[1]) / 2.0\n    println(m)'), '3.0'],
  // ---- toString() typed as String (used to crash the argument check against a String parameter)
  ['toString: a String parameter receiving x.toString()', 'fun report(label :String, value :String){\n    println("$label: $value")\n}\nfun main() {\n    val width = 14\n    val perimeter = 2 * (width + 9)\n    report("Width", width.toString())\n    report("Perimeter", perimeter.toString())\n    report("Posts", (perimeter / 4).toString())\n    report("Left over", (perimeter % 4).toString())\n}', 'Width: 14\nPerimeter: 46\nPosts: 11\nLeft over: 2'],
  ['toString: on a Double, a Boolean and a call result', 'fun show(text: String) {\n    println(text)\n}\nfun half(n: Int) = n / 2.0\nfun main() {\n    val d = 25.0\n    show(d.toString())\n    show(true.toString())\n    show(half(3).toString())\n}', '25.0\ntrue\n1.5'],
  // ---- Int values must NOT gain a decimal point
  ['int: template and concatenation stay integral', main('    val n = 25\n    val t = 100_000L\n    println("n=$n t=$t")\n    println("n=" + n)\n    println("q=${n / 4}")'), 'n=25 t=100000\nn=25\nq=6'],
  ['template: escaped dollar is not an interpolation', main('    val price = 4\n    println("\\$price costs \\$$price")'), '$price costs $4'],
  ['template: division inside an expression placeholder', main('    val t = 334\n    println("avg=${t / 4}")\n    println("avg=${334 / 4}")'), 'avg=83\navg=83'],
];

let failures = 0;
for (const [name, code, expected] of cases) {
  const result = await compileAndRunKotlin(code);
  // An expected value starting with "ERROR:" asserts a compile-time rejection whose message contains that text.
  const ok = expected.startsWith('ERROR:')
    ? !result.success && (result.error?.message ?? '').includes(expected.slice(6).trim())
    : result.success && result.output === expected;
  if (!ok) {
    failures++;
    console.error(`FAIL ${name}\n   expected ${JSON.stringify(expected)}\n   got      ${JSON.stringify(result.output)} ${result.error?.message ?? ''}`);
  }
}
assert.equal(failures, 0, `${failures} of ${cases.length} numeric-semantics cases failed`);
console.log(`Numeric semantics: ${cases.length} cases match real Kotlin.`);

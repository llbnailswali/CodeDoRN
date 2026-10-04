import assert from 'node:assert/strict';
import { compileAndRunKotlin } from '../src/utils/kotlinRunner';

// Class, enum, data class, visibility and override rules the teaching runner must match real Kotlin on (World 8, Object
// Kingdom). Every expected value is hand-derived from Kotlin's rules. "ERROR: text" asserts a compile-time rejection whose
// message contains that text. The valid programs matter as much as the invalid ones: they prove the checks never reject
// correct code (see PITFALLS.md, "World 8 practice bank: class rules were never enforced").
const cases: Array<[string, string, string]> = [
  // ---- data classes: structural equality, destructuring, copy
  ['data: == and != compare by value, === by identity', 'data class P(val x: Int, val y: Int)\nfun main() {\n  val a = P(1, 2)\n  val b = P(1, 2)\n  println(P(1, 2) == P(1, 2))\n  println(a == b)\n  println(a != b)\n  println(P(1, 2) != P(1, 3))\n  println(a === b)\n}', 'true\ntrue\nfalse\ntrue\nfalse'],
  ['data: destructuring, contains and copy', 'data class P(val x: Int, val y: Int)\nfun main() {\n  val a = P(1, 2)\n  val (x, y) = a\n  println(x + y)\n  println(listOf(a).contains(P(1, 2)))\n  val c = a.copy(y = 9)\n  println(c)\n  println(a)\n}', '3\ntrue\nP(x=1, y=9)\nP(x=1, y=2)'],
  ['data: a plain class is NOT equal by value', 'class P(val x: Int)\nfun main() {\n  println(P(1) == P(1))\n}', 'false'],
  // ---- enums
  ['enum: ordinal, values, entries, valueOf, name', 'enum class Level(val min: Int) { LOW(1), MID(5), HIGH(9) }\nfun main() {\n  println(Level.MID.ordinal)\n  println(Level.values().size)\n  for (l in Level.values()) {\n    println(l.name + l.min)\n  }\n  println(Level.entries.size)\n  println(Level.valueOf("HIGH"))\n  println(Level.valueOf("HIGH").ordinal)\n}', '1\n3\nLOW1\nMID5\nHIGH9\n3\nHIGH\n2'],
  ['enum: when over the constants, and equality', 'enum class C { RED, GREEN }\nfun main() {\n  val c = C.GREEN\n  val s = when (c) {\n    C.RED -> "stop"\n    C.GREEN -> "go"\n  }\n  println(s)\n  println(c == C.GREEN)\n  println(c != C.RED)\n}', 'go\ntrue\ntrue'],
  ['enum: valueOf with a missing name fails', 'enum class C { RED }\nfun main() {\n  println(C.valueOf("BLUE"))\n}', 'ERROR: No enum constant C.BLUE'],
  // ---- properties, getters, init order
  ['getter: expression on the line below the property', 'class Box(val w: Int, val h: Int) {\n  val area: Int\n    get() = w * h\n}\nfun main() {\n  println(Box(3, 4).area)\n}', '12'],
  ['init: bare property names and an initializer that reads an earlier property', 'class Counter(val start: Int) {\n  val doubled = start * 2\n  val label = "n" + doubled\n  init {\n    println("created " + label + " " + start)\n  }\n}\nfun main() {\n  Counter(4)\n}', 'created n8 4'],
  ['init: a constructor parameter still wins over a same-named property', 'class Point(x: Int, y: Int) {\n  val x: Int\n  val y: Int\n  init {\n    this.x = x + 1\n    this.y = y + 2\n  }\n}\nfun main() {\n  val p = Point(3, 4)\n  println(p.x)\n  println(p.y)\n}', '4\n6'],
  ['init: a val assigned once in init is legal', 'class A(n: Int) {\n  val twice: Int\n  init {\n    this.twice = n * 2\n  }\n}\nfun main() {\n  println(A(5).twice)\n}', '10'],
  // ---- constructors: arguments are checked like a function call, named arguments reorder
  ['ctor: named and default arguments', 'class User(val name: String, val age: Int = 18, val admin: Boolean = false)\nfun main() {\n  val a = User(age = 30, name = "Ana")\n  val b = User("Bo", admin = true)\n  println(a.name + a.age + a.admin)\n  println(b.name + b.age + b.admin)\n}', 'Ana30false\nBo18true'],
  ['ctor: a missing argument is rejected', 'class P(val name: String, val age: Int)\nfun main() {\n  val p = P("A")\n  println(p.name)\n}', 'ERROR: Wrong argument count for P'],
  ['ctor: an extra argument is rejected', 'class P(val name: String)\nfun main() {\n  val p = P("A", 3)\n  println(p.name)\n}', 'ERROR: Wrong argument count for P'],
  ['ctor: a wrong argument type is rejected', 'class P(val name: String, val age: Int)\nfun main() {\n  val p = P("A", "x")\n  println(p.name)\n}', 'ERROR: Type mismatch'],
  ['ctor: a list argument is accepted (the class header is not a call)', 'class Bag(val xs: MutableList<Int>)\nfun main() {\n  val b = Bag(mutableListOf(1, 2))\n  println(b.xs)\n}', '[1, 2]'],
  ['ctor: a generic class parameter is not type-checked against T', 'class Box<T>(val v: T)\nfun main() {\n  println(Box("x").v)\n  println(Box(3).v)\n}', 'x\n3'],
  // ---- val properties cannot be reassigned
  ['val: assigning a val property from outside', 'class A(val n: Int)\nfun main() {\n  val a = A(1)\n  a.n = 2\n  println(a.n)\n}', 'ERROR: Val cannot be reassigned'],
  ['val: assigning a val property inside a method', 'class A(val n: Int) {\n  fun bump() {\n    this.n = this.n + 1\n  }\n}\nfun main() {\n  A(1).bump()\n  println(1)\n}', 'ERROR: Val cannot be reassigned'],
  ['val: += on a plain val property', 'class Acc(val balance: Int)\nfun main() {\n  val a = Acc(10)\n  a.balance += 5\n  println(a.balance)\n}', 'ERROR: Val cannot be reassigned'],
  ['val: a var property can change', 'class Acc(var balance: Int) {\n  fun add(k: Int) {\n    this.balance = this.balance + k\n  }\n}\nfun main() {\n  val a = Acc(10)\n  a.balance += 5\n  a.add(1)\n  println(a.balance)\n}', '16'],
  ['val: += on a val MutableList property is plusAssign (legal)', 'class Bag {\n  val items = mutableListOf<String>()\n}\nfun main() {\n  val b = Bag()\n  b.items += "a"\n  b.items.add("b")\n  println(b.items)\n}', '[a, b]'],
  // ---- visibility
  ['private: a private property outside the class', 'class A(private val pin: Int)\nfun main() {\n  val a = A(1)\n  println(a.pin)\n}', 'ERROR: Cannot access \'pin\': it is private'],
  ['private: a private property inside a string template', 'class A(private val pin: Int)\nfun main() {\n  val a = A(1)\n  println("pin=${a.pin}")\n}', 'ERROR: Cannot access \'pin\': it is private'],
  ['private: a private method outside the class', 'class A {\n  private fun secret() = 1\n}\nfun main() {\n  val a = A()\n  println(a.secret())\n}', 'ERROR: Cannot access \'secret\': it is private'],
  ['private: a private setter outside the class', 'class A {\n  var n = 0\n    private set\n}\nfun main() {\n  val a = A()\n  a.n = 5\n  println(a.n)\n}', 'ERROR: the setter is private'],
  ['private: a private setter is fine inside the class and the value is readable outside', 'class A {\n  var n = 0\n    private set\n  fun inc() {\n    this.n = this.n + 1\n  }\n}\nfun main() {\n  val a = A()\n  a.inc()\n  a.inc()\n  println(a.n)\n}', '2'],
  ['protected: access from outside the hierarchy', 'open class A {\n  protected val s = 1\n}\nfun main() {\n  val a = A()\n  println(a.s)\n}', 'ERROR: Cannot access \'s\': it is protected'],
  ['private/protected: allowed inside the class, another instance and a subclass', 'class Vault(private val code: Int, val label: String) {\n  fun matches(other: Vault) = this.code == other.code\n  fun check(guess: Int) = guess == this.code\n}\nopen class Base {\n  protected val secret = 5\n}\nclass Child : Base() {\n  fun reveal() = this.secret + 1\n}\nfun main() {\n  val a = Vault(7, "a")\n  val b = Vault(7, "b")\n  println(a.check(7))\n  println(a.matches(b))\n  println(a.label)\n  val c = Child()\n  println(c.reveal())\n}', 'true\ntrue\na\n6'],
  // ---- override rules and abstract members
  ['override: a correct override, with super', 'open class A {\n  open fun hi() = "A"\n}\nclass B : A() {\n  override fun hi() = super.hi() + "B"\n}\nfun main() {\n  val x: A = B()\n  println(x.hi())\n}', 'AB'],
  ['override: the override modifier is missing', 'open class A {\n  open fun f() = 1\n}\nclass B : A() {\n  fun f() = 2\n}\nfun main() {\n  val b = B()\n  println(b.f())\n}', 'ERROR: needs \'override\' modifier'],
  ['override: a different parameter list is an overload, not an override', 'open class A {\n  open fun f(x: Int) = x\n}\nclass B : A() {\n  fun f(x: Int, y: Int) = x + y\n}\nfun main() {\n  val b = B()\n  println(b.f(1, 2))\n}', '3'],
  ['override: overriding a member that is not open', 'open class A {\n  fun f() = 1\n}\nclass B : A() {\n  override fun f() = 2\n}\nfun main() {\n  val b = B()\n  println(b.f())\n}', 'ERROR: is final and cannot be overridden'],
  ['override: overriding nothing', 'open class A {\n  open fun f() = 1\n}\nclass B : A() {\n  override fun g() = 2\n}\nfun main() {\n  val b = B()\n  println(b.g())\n}', 'ERROR: overrides nothing'],
  ['override: toString needs no supertype member', 'class P(val n: String) {\n  override fun toString() = "P:" + this.n\n}\nfun main() {\n  println(P("x"))\n}', 'P:x'],
  ['override: an interface member that is not implemented', 'interface A {\n  fun a(): String\n}\nclass C : A {\n}\nfun main() {\n  val c = C()\n  println(c.a())\n}', 'ERROR: does not implement abstract member'],
  ['override: an interface member that is implemented', 'interface A {\n  fun a(): String\n}\nclass C : A {\n  override fun a() = "ok"\n}\nfun main() {\n  val c = C()\n  println(c.a())\n}', 'ok'],
  ['override: an object must implement the interface too', 'interface A {\n  fun a(): String\n}\nobject C : A {\n}\nfun main() {\n  println(C.a())\n}', 'ERROR: does not implement abstract member'],
  ['override: an override val declared in the constructor', 'open class A {\n  open val legs: Int = 4\n}\nclass B(override val legs: Int) : A()\nfun main() {\n  val a: A = B(2)\n  println(a.legs)\n}', '2'],
  // ---- members of a typed value
  ['member: an unknown property on a typed value', 'class P(val name: String)\nfun main() {\n  val p = P("a")\n  println(p.nme)\n}', 'ERROR: Unresolved reference: nme'],
  ['member: known members, a method, copy and toString are fine', 'data class P(val name: String) {\n  fun shout() = this.name + "!"\n}\nfun main() {\n  val p = P("a")\n  println(p.name)\n  println(p.shout())\n  println(p.copy(name = "b").toString())\n}', 'a\na!\nP(name=b)'],
  // ---- Int division inside class members (the operands are properties, constructor parameters or method results)
  ['int division: a getter on this.property truncates', 'class Sensor(var celsius: Int) {\n  val fahrenheit: Int\n    get() = this.celsius * 9 / 5 + 32\n}\nfun main() {\n  println(Sensor(28).fahrenheit)\n}', '82'],
  ['int division: constructor parameters in init truncate', 'class Price(base: Int, taxPercent: Int) {\n  val total: Int\n  init {\n    this.total = base + base * taxPercent / 100\n  }\n}\nfun main() {\n  println(Price(85, 10).total)\n}', '93'],
  ['int division: an object property operand truncates', 'object Shop {\n  val taxPercent = 10\n}\nclass Order(val amount: Int) {\n  fun total(): Int = this.amount + this.amount * Shop.taxPercent / 100\n}\nfun main() {\n  println(Order(255).total())\n}', '280'],
  ['int division: super.method() / 2 truncates', 'open class E(val base: Int) {\n  open fun pay() = this.base\n}\nclass Intern : E(505) {\n  override fun pay() = super.pay() / 2\n}\nfun main() {\n  println(Intern().pay())\n}', '252'],
  ['int division: a Double method result is not truncated', 'class A(val x: Double) {\n  fun half() = this.x / 2\n}\nfun main() {\n  println(A(5.0).half())\n}', '2.5'],
  // ---- names that look like library names
  ['name: a variable called size is not the Int property', 'enum class Size(val ml: Int) { S(1), L(5) }\nfun label(size: Size): String {\n  return if (size == Size.S) "s" else "l"\n}\nfun main() {\n  for (size in listOf(Size.S, Size.L)) {\n    println(label(size))\n  }\n}', 's\nl'],
  ['name: a member called apply wins over the scope function', 'open class D(val label: String) {\n  open fun apply(price: Int) = price\n}\nclass Flat(label: String, val amount: Int) : D(label) {\n  override fun apply(price: Int) = price - this.amount\n}\nfun main() {\n  val offers: List<D> = listOf(D("none"), Flat("coupon", 40))\n  for (o in offers) {\n    println(o.label + " " + o.apply(250))\n  }\n}', 'none 250\ncoupon 210'],
  ['string: take, drop, takeLast and dropLast', 'fun main() {\n  val s = "Server restarts"\n  println(s.take(6))\n  println(s.drop(7))\n  println(s.takeLast(6))\n  println(s.dropLast(7))\n  println(s.take(99).length)\n}', 'Server\nrestarts\nstarts\nServer r\n15'],
];

let failures = 0;
for (const [name, code, expected] of cases) {
  const result = await compileAndRunKotlin(code);
  const ok = expected.startsWith('ERROR:')
    ? !result.success && (result.error?.message ?? '').includes(expected.slice(6).trim())
    : result.success && result.output === expected;
  if (!ok) {
    failures++;
    console.error(`FAIL ${name}\n   expected ${JSON.stringify(expected)}\n   got      ${JSON.stringify(result.output)} ${result.error?.message ?? ''}`);
  }
}
assert.equal(failures, 0, `${failures} of ${cases.length} class-rule cases failed`);
console.log(`Class rules: ${cases.length} cases match real Kotlin.`);

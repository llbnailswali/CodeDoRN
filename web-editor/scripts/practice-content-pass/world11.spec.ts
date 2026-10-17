/**
 * World 11 (OOP Evolution) practice bank, CODE side: solutions, starters, expected outputs and swaps. Every expected value
 * was derived by hand from Kotlin's rules (written next to the program), NOT copied from the simulator; the bank test
 * (`npm run test:practice-bank`) then runs each program through the engine and compares, and
 * `scripts/practice-content-pass/world11.real.ts` runs every solution and Debug program through real kotlinc.
 * Wording lives in world11.data.ts. A starter holds exactly one single-line `// N. TODO` placeholder per step.
 */
import type { WRSpec, DbgSpec } from './world8.spec';

export const WR_SPECS: WRSpec[] = [
  {
    id: 'pay-grades', difficulty: 'medium', tags: ['lesson:inheritance-abstract-classes', 'open-class', 'override', 'polymorphic-list'], title: 'Pay Grades', fileName: 'PayGrades.kt',
    solution: `open class Employee(val name: String, val base: Int) {
  open fun pay(): Int {
    return base
  }
}

class Manager(name: String, base: Int, val bonus: Int) : Employee(name, base) {
  override fun pay(): Int {
    return base + bonus
  }
}

fun main() {
  val bonus = 50
  val staff = listOf(Employee("Ana", 300), Manager("Bo", 400, bonus), Employee("Cy", 250))
  var total = 0
  for (s in staff) {
    println(s.name + ": " + s.pay())
    total += s.pay()
  }
  println("Total: " + total)
}`,
    starter: `open class Employee(val name: String, val base: Int) {
  open fun pay(): Int {
    return base
  }
}

// 1. TODO

fun main() {
  val bonus = 50

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // Ana 300, Bo 400 + 50 = 450, Cy 250, total 1000. With bonus 100: Bo 500, total 1050.
    expected: 'Ana: 300\nBo: 450\nCy: 250\nTotal: 1000',
    swap: { variableName: 'bonus', originalLiteral: '50', alternateLiteral: '100', alternateExpected: 'Ana: 300\nBo: 500\nCy: 250\nTotal: 1050' },
  },
  {
    id: 'shape-areas', difficulty: 'hard', tags: ['lesson:inheritance-abstract-classes', 'abstract-class', 'abstract-member', 'override', 'largest'], title: 'Shape Areas', fileName: 'ShapeAreas.kt',
    solution: `abstract class Shape(val name: String) {
  abstract fun area(): Int

  fun describe(): String {
    return name + " area " + area()
  }
}

class Rect(val w: Int, val h: Int) : Shape("Rect") {
  override fun area(): Int {
    return w * h
  }
}

class Square(val side: Int) : Shape("Square") {
  override fun area(): Int {
    return side * side
  }
}

fun main() {
  val side = 3
  val shapes = listOf(Rect(4, 5), Square(side))
  var biggest = shapes[0]
  for (s in shapes) {
    println(s.describe())
    if (s.area() > biggest.area()) {
      biggest = s
    }
  }
  println("Largest: " + biggest.name)
}`,
    starter: `abstract class Shape(val name: String) {
  abstract fun area(): Int

  fun describe(): String {
    return name + " area " + area()
  }
}

// 1. TODO

// 2. TODO

fun main() {
  val side = 3

  // 3. TODO

  // 4. TODO

  // 5. TODO
}`,
    // Rect 4 * 5 = 20, Square 3 * 3 = 9, so Rect is largest. With side 5: Square 25 is largest.
    expected: 'Rect area 20\nSquare area 9\nLargest: Rect',
    swap: { variableName: 'side', originalLiteral: '3', alternateLiteral: '5', alternateExpected: 'Rect area 20\nSquare area 25\nLargest: Square' },
  },
  {
    id: 'animal-sounds', difficulty: 'medium', tags: ['lesson:interfaces-multiple-interface-implementa', 'interface', 'default-method', 'override', 'list-of-interface'], title: 'Animal Sounds', fileName: 'AnimalSounds.kt',
    solution: `interface Speaker {
  fun speak(): String

  fun twice(): String = speak() + " " + speak()
}

class Dog : Speaker {
  override fun speak(): String {
    return "Woof"
  }
}

class Cat(val happy: Boolean) : Speaker {
  override fun speak(): String {
    if (happy) {
      return "Purr"
    }
    return "Hiss"
  }
}

fun main() {
  val happy = true
  val speakers: List<Speaker> = listOf(Dog(), Cat(happy))
  for (s in speakers) {
    println(s.twice())
  }
}`,
    starter: `interface Speaker {
  fun speak(): String

  fun twice(): String = speak() + " " + speak()
}

// 1. TODO

// 2. TODO

fun main() {
  val happy = true

  // 3. TODO

  // 4. TODO
}`,
    // Dog says Woof twice; a happy Cat says Purr twice. With happy false the Cat says Hiss twice.
    expected: 'Woof Woof\nPurr Purr',
    swap: { variableName: 'happy', originalLiteral: 'true', alternateLiteral: 'false', alternateExpected: 'Woof Woof\nHiss Hiss' },
  },
  {
    id: 'duck-powers', difficulty: 'hard', tags: ['lesson:interfaces-multiple-interface-implementa', 'two-interfaces', 'is-check', 'override'], title: 'Duck Powers', fileName: 'DuckPowers.kt',
    solution: `interface Flyer {
  fun fly(): Int
}

interface Swimmer {
  fun swim(): Int
}

class Duck(val power: Int) : Flyer, Swimmer {
  override fun fly(): Int {
    return power * 3
  }

  override fun swim(): Int {
    return power * 2
  }
}

fun total(f: Flyer, s: Swimmer): Int {
  return f.fly() + s.swim()
}

fun main() {
  val power = 4
  val duck = Duck(power)
  println("Fly: " + duck.fly())
  println("Swim: " + duck.swim())
  println("Total: " + total(duck, duck))
  println("Duck can fly: " + (duck is Flyer))
}`,
    starter: `interface Flyer {
  fun fly(): Int
}

interface Swimmer {
  fun swim(): Int
}

fun total(f: Flyer, s: Swimmer): Int {
  return f.fly() + s.swim()
}

// 1. TODO

fun main() {
  val power = 4

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // power 4: fly 12, swim 8, total 20, and a Duck is a Flyer. With power 5: 15, 10, 25.
    expected: 'Fly: 12\nSwim: 8\nTotal: 20\nDuck can fly: true',
    swap: { variableName: 'power', originalLiteral: '4', alternateLiteral: '5', alternateExpected: 'Fly: 15\nSwim: 10\nTotal: 25\nDuck can fly: true' },
  },
  {
    id: 'payment-states', difficulty: 'medium', tags: ['lesson:sealed-classes-sealed-interfaces', 'sealed-class', 'exhaustive-when', 'smart-cast'], title: 'Payment States', fileName: 'PaymentStates.kt',
    solution: `sealed class Payment
class Paid(val amount: Int) : Payment()
class Failed(val reason: String) : Payment()
object Pending : Payment()

fun describe(p: Payment): String {
  return when (p) {
    is Paid -> "Paid " + p.amount
    is Failed -> "Failed: " + p.reason
    Pending -> "Pending"
  }
}

fun main() {
  val first = 40
  val payments = listOf(Paid(first), Failed("card"), Pending, Paid(25))
  var total = 0
  for (p in payments) {
    println(describe(p))
    if (p is Paid) {
      total += p.amount
    }
  }
  println("Total paid: " + total)
}`,
    starter: `sealed class Payment
class Paid(val amount: Int) : Payment()
class Failed(val reason: String) : Payment()
object Pending : Payment()

// 1. TODO

fun main() {
  val first = 40

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // Lines: Paid 40, Failed: card, Pending, Paid 25; paid total 40 + 25 = 65. With first 70: Paid 70 and total 95.
    expected: 'Paid 40\nFailed: card\nPending\nPaid 25\nTotal paid: 65',
    swap: { variableName: 'first', originalLiteral: '40', alternateLiteral: '70', alternateExpected: 'Paid 70\nFailed: card\nPending\nPaid 25\nTotal paid: 95' },
  },
  {
    id: 'safe-divide', difficulty: 'hard', tags: ['lesson:sealed-classes-sealed-interfaces', 'sealed-interface', 'when-statement', 'smart-cast', 'guard'], title: 'Safe Divide', fileName: 'SafeDivide.kt',
    solution: `sealed interface Outcome
class Success(val value: Int) : Outcome
class Failure(val code: Int) : Outcome

fun safeDivide(a: Int, b: Int): Outcome {
  if (b == 0) {
    return Failure(1)
  }
  return Success(a / b)
}

fun main() {
  val zero = 0
  val results = listOf(safeDivide(20, 4), safeDivide(7, zero), safeDivide(9, 2))
  var sum = 0
  var failures = 0
  for (r in results) {
    when (r) {
      is Success -> sum += r.value
      is Failure -> failures += 1
    }
  }
  println("Sum: " + sum)
  println("Failures: " + failures)
}`,
    starter: `sealed interface Outcome
class Success(val value: Int) : Outcome
class Failure(val code: Int) : Outcome

// 1. TODO

fun main() {
  val zero = 0

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // 20 / 4 = 5 and 9 / 2 = 4 give sum 9; the division by zero is 1 failure. With zero 3: 7 / 3 = 2, sum 11, no failures.
    expected: 'Sum: 9\nFailures: 1',
    swap: { variableName: 'zero', originalLiteral: '0', alternateLiteral: '3', alternateExpected: 'Sum: 11\nFailures: 0' },
  },
  {
    id: 'point-copy', difficulty: 'medium', tags: ['lesson:data-classes-in-domain-modeling-enum-cla', 'data-class', 'copy', 'equals', 'destructuring'], title: 'Point Copy', fileName: 'PointCopy.kt',
    solution: `data class Point(val x: Int, val y: Int)

fun main() {
  val shift = 3
  val p = Point(2, 5)
  val q = p.copy(y = p.y + shift)
  println(p)
  println(q)
  println(p == Point(2, 5))
  println(p == q)
  val (x, y) = q
  println("Sum: " + (x + y))
}`,
    starter: `// 1. TODO

fun main() {
  val shift = 3

  // 2. TODO

  // 3. TODO

  // 4. TODO

  // 5. TODO
}`,
    // q is p with y = 5 + 3 = 8; p equals a new Point(2, 5) but not q; destructured sum 2 + 8 = 10. With shift 1: y 6, sum 8.
    expected: 'Point(x=2, y=5)\nPoint(x=2, y=8)\ntrue\nfalse\nSum: 10',
    swap: { variableName: 'shift', originalLiteral: '3', alternateLiteral: '1', alternateExpected: 'Point(x=2, y=5)\nPoint(x=2, y=6)\ntrue\nfalse\nSum: 8' },
  },
  {
    id: 'level-enum', difficulty: 'hard', tags: ['lesson:data-classes-in-domain-modeling-enum-cla', 'enum-class', 'enum-property', 'when-ranges', 'ordinal'], title: 'Level Enum', fileName: 'LevelEnum.kt',
    solution: `enum class Level(val points: Int) {
  LOW(1),
  MEDIUM(5),
  HIGH(10)
}

fun levelFor(score: Int, highFrom: Int): Level {
  return when {
    score >= highFrom -> Level.HIGH
    score >= 40 -> Level.MEDIUM
    else -> Level.LOW
  }
}

fun main() {
  val highFrom = 70
  val scores = listOf(3, 55, 80, 20)
  var total = 0
  for (s in scores) {
    val level = levelFor(s, highFrom)
    println(s.toString() + " -> " + level.name + " (" + level.points + ")")
    total += level.points
  }
  println("Total: " + total)
  println("Index of HIGH: " + Level.HIGH.ordinal)
}`,
    starter: `// 1. TODO

// 2. TODO

fun main() {
  val highFrom = 70
  val scores = listOf(3, 55, 80, 20)

  // 3. TODO

  // 4. TODO
}`,
    // 3 LOW(1), 55 MEDIUM(5), 80 HIGH(10), 20 LOW(1): total 17; HIGH is the third constant, ordinal 2. With highFrom 50: 55 becomes HIGH, total 22.
    expected: '3 -> LOW (1)\n55 -> MEDIUM (5)\n80 -> HIGH (10)\n20 -> LOW (1)\nTotal: 17\nIndex of HIGH: 2',
    swap: { variableName: 'highFrom', originalLiteral: '70', alternateLiteral: '50', alternateExpected: '3 -> LOW (1)\n55 -> HIGH (10)\n80 -> HIGH (10)\n20 -> LOW (1)\nTotal: 22\nIndex of HIGH: 2' },
  },
  {
    id: 'order-lines', difficulty: 'medium', tags: ['lesson:nested-classes', 'nested-class', 'qualified-creation', 'no-outer-access'], title: 'Order Lines', fileName: 'OrderLines.kt',
    solution: `class Order(val id: Int) {
  class Line(val item: String, val qty: Int) {
    fun label(unit: Int): String {
      return item + " x" + qty + " = " + qty * unit
    }
  }
}

fun main() {
  val unit = 4
  val first = Order.Line("pen", 3)
  val second = Order.Line("cap", 2)
  println(first.label(unit))
  println(second.label(unit))
  println("Total: " + (first.qty + second.qty) * unit)
}`,
    starter: `class Order(val id: Int) {
  // 1. TODO
}

fun main() {
  val unit = 4

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // pen 3 * 4 = 12, cap 2 * 4 = 8, total (3 + 2) * 4 = 20. With unit 5: 15, 10, 25.
    expected: 'pen x3 = 12\ncap x2 = 8\nTotal: 20',
    swap: { variableName: 'unit', originalLiteral: '4', alternateLiteral: '5', alternateExpected: 'pen x3 = 15\ncap x2 = 10\nTotal: 25' },
  },
  {
    id: 'counter-view', difficulty: 'medium', tags: ['lesson:inner-classes', 'inner-class', 'outer-state', 'independent-outers'], title: 'Counter View', fileName: 'CounterView.kt',
    solution: `class Counter(var count: Int) {
  inner class View {
    fun show(): String {
      return "Count: " + count
    }
  }

  fun inc() {
    count += 1
  }
}

fun main() {
  val start = 10
  val c = Counter(start)
  val v = c.View()
  c.inc()
  c.inc()
  println(v.show())
  val other = Counter(0)
  println(other.View().show())
}`,
    starter: `class Counter(var count: Int) {
  // 1. TODO
}

fun main() {
  val start = 10

  // 2. TODO

  // 3. TODO

  // 4. TODO

  // 5. TODO
}`,
    // The view reads its own outer counter: 10 + 2 = 12. A second counter starts at 0 and its view shows 0. With start 20: 22.
    expected: 'Count: 12\nCount: 0',
    swap: { variableName: 'start', originalLiteral: '10', alternateLiteral: '20', alternateExpected: 'Count: 22\nCount: 0' },
  },
  {
    id: 'id-maker', difficulty: 'medium', tags: ['lesson:object-declarations', 'object-declaration', 'singleton-state'], title: 'ID Maker', fileName: 'IdMaker.kt',
    solution: `object IdMaker {
  var last = 100

  fun next(step: Int): Int {
    last += step
    return last
  }
}

fun main() {
  val step = 5
  println(IdMaker.next(step))
  println(IdMaker.next(step))
  println(IdMaker.next(step))
  println("Last: " + IdMaker.last)
}`,
    starter: `// 1. TODO

fun main() {
  val step = 5

  // 2. TODO

  // 3. TODO

  // 4. TODO

  // 5. TODO
}`,
    // last starts at 100 and grows by 5 each call: 105, 110, 115. With step 10: 110, 120, 130.
    expected: '105\n110\n115\nLast: 115',
    swap: { variableName: 'step', originalLiteral: '5', alternateLiteral: '10', alternateExpected: '110\n120\n130\nLast: 130' },
  },
  {
    id: 'shared-stats', difficulty: 'hard', tags: ['lesson:object-declarations', 'object-declaration', 'shared-state', 'integer-division'], title: 'Shared Stats', fileName: 'SharedStats.kt',
    solution: `object Stats {
  var total = 0
  var calls = 0

  fun add(n: Int) {
    total += n
    calls += 1
  }
}

fun main() {
  val rounds = 4
  for (i in 1..rounds) {
    Stats.add(i * 10)
  }
  println("Total: " + Stats.total)
  println("Calls: " + Stats.calls)
  println("Average: " + Stats.total / Stats.calls)
}`,
    starter: `// 1. TODO

fun main() {
  val rounds = 4

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // Adds 10, 20, 30, 40: total 100, 4 calls, average 25. With rounds 3: total 60, 3 calls, average 20.
    expected: 'Total: 100\nCalls: 4\nAverage: 25',
    swap: { variableName: 'rounds', originalLiteral: '4', alternateLiteral: '3', alternateExpected: 'Total: 60\nCalls: 3\nAverage: 20' },
  },
  {
    id: 'user-factory', difficulty: 'medium', tags: ['lesson:companion-objects', 'companion-object', 'const-val', 'factory-function'], title: 'User Factory', fileName: 'UserFactory.kt',
    solution: `class User(val name: String, val level: Int) {
  companion object {
    const val MAX = 5

    fun create(name: String, level: Int): User {
      if (level > MAX) {
        return User(name, MAX)
      }
      return User(name, level)
    }

    fun guest(): User {
      return User("guest", 0)
    }
  }
}

fun main() {
  val wanted = 9
  val ana = User.create("Ana", wanted)
  val guest = User.guest()
  println(ana.name + " level " + ana.level)
  println(guest.name + " level " + guest.level)
  println("Max: " + User.MAX)
}`,
    starter: `class User(val name: String, val level: Int) {
  // 1. TODO
}

fun main() {
  val wanted = 9

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // Level 9 is above MAX 5, so Ana is capped at 5; guest has level 0. With wanted 3: Ana keeps level 3.
    expected: 'Ana level 5\nguest level 0\nMax: 5',
    swap: { variableName: 'wanted', originalLiteral: '9', alternateLiteral: '3', alternateExpected: 'Ana level 3\nguest level 0\nMax: 5' },
  },
  {
    id: 'ticket-counter', difficulty: 'hard', tags: ['lesson:companion-objects', 'companion-object', 'shared-counter', 'instance-factory'], title: 'Ticket Counter', fileName: 'TicketCounter.kt',
    solution: `class Ticket(val number: Int) {
  companion object {
    var issued = 0

    fun issue(): Ticket {
      issued += 1
      return Ticket(issued)
    }
  }
}

fun main() {
  val count = 3
  for (i in 1..count) {
    val t = Ticket.issue()
    println("Ticket " + t.number)
  }
  println("Issued: " + Ticket.issued)
}`,
    starter: `class Ticket(val number: Int) {
  // 1. TODO
}

fun main() {
  val count = 3

  // 2. TODO

  // 3. TODO
}`,
    // Three tickets numbered 1, 2, 3 and the companion counter ends at 3. With count 2: tickets 1 and 2, issued 2.
    expected: 'Ticket 1\nTicket 2\nTicket 3\nIssued: 3',
    swap: { variableName: 'count', originalLiteral: '3', alternateLiteral: '2', alternateExpected: 'Ticket 1\nTicket 2\nIssued: 2' },
  },
  {
    id: 'text-helpers', difficulty: 'medium', tags: ['lesson:extension-functions', 'extension-function', 'receiver', 'this'], title: 'Text Helpers', fileName: 'TextHelpers.kt',
    solution: `fun String.shout(): String {
  return this.uppercase() + "!"
}

fun Int.squared(): Int {
  return this * this
}

fun Int.isEven(): Boolean {
  return this % 2 == 0
}

fun main() {
  val n = 7
  println("hello".shout())
  println(n.squared())
  println(n.isEven())
}`,
    starter: `// 1. TODO

// 2. TODO

// 3. TODO

fun main() {
  val n = 7

  // 4. TODO
}`,
    // "hello" shouts HELLO!; 7 squared is 49; 7 is odd. With n 8: 64 and true.
    expected: 'HELLO!\n49\nfalse',
    swap: { variableName: 'n', originalLiteral: '7', alternateLiteral: '8', alternateExpected: 'HELLO!\n64\ntrue' },
  },
  {
    id: 'list-helpers', difficulty: 'hard', tags: ['lesson:extension-functions', 'extension-function', 'list-receiver', 'accumulator', 'filter-loop'], title: 'List Helpers', fileName: 'ListHelpers.kt',
    solution: `fun List<Int>.sumOfSquares(): Int {
  var total = 0
  for (n in this) {
    total += n * n
  }
  return total
}

fun List<Int>.above(limit: Int): List<Int> {
  val result = mutableListOf<Int>()
  for (n in this) {
    if (n > limit) {
      result.add(n)
    }
  }
  return result
}

fun main() {
  val limit = 4
  val numbers = listOf(3, 4, 5, 8)
  val big = numbers.above(limit)
  println("Squares: " + numbers.sumOfSquares())
  println("Above $limit: $big")
}`,
    starter: `// 1. TODO

// 2. TODO

fun main() {
  val limit = 4
  val numbers = listOf(3, 4, 5, 8)

  // 3. TODO

  // 4. TODO
}`,
    // 9 + 16 + 25 + 64 = 114; above 4: [5, 8]. With limit 6: [8].
    expected: 'Squares: 114\nAbove 4: [5, 8]',
    swap: { variableName: 'limit', originalLiteral: '4', alternateLiteral: '6', alternateExpected: 'Squares: 114\nAbove 6: [8]' },
  },
  {
    id: 'word-props', difficulty: 'medium', tags: ['lesson:extension-properties', 'extension-property', 'getter', 'receiver'], title: 'Word Properties', fileName: 'WordProps.kt',
    solution: `val String.wordCount: Int
  get() = this.split(" ").size

val String.firstWord: String
  get() = this.split(" ")[0]

val Int.doubled: Int
  get() = this * 2

fun main() {
  val base = 21
  val sentence = "kotlin makes code short"
  println("Words: " + sentence.wordCount)
  println("First: " + sentence.firstWord)
  println("Doubled: " + base.doubled)
}`,
    starter: `// 1. TODO

// 2. TODO

// 3. TODO

fun main() {
  val base = 21
  val sentence = "kotlin makes code short"

  // 4. TODO
}`,
    // The sentence has 4 words and starts with kotlin; 21 doubled is 42. With base 30: 60.
    expected: 'Words: 4\nFirst: kotlin\nDoubled: 42',
    swap: { variableName: 'base', originalLiteral: '21', alternateLiteral: '30', alternateExpected: 'Words: 4\nFirst: kotlin\nDoubled: 60' },
  },
  {
    id: 'boosted-scorer', difficulty: 'medium', tags: ['lesson:delegation', 'class-delegation', 'by-keyword', 'extra-member'], title: 'Boosted Scorer', fileName: 'BoostedScorer.kt',
    solution: `interface Scorer {
  fun score(n: Int): Int
}

class Plain : Scorer {
  override fun score(n: Int): Int {
    return n
  }
}

class Boosted(private val base: Scorer, val extra: Int) : Scorer by base {
  fun boosted(n: Int): Int {
    return score(n) + extra
  }
}

fun main() {
  val extra = 7
  val b = Boosted(Plain(), extra)
  println(b.score(10))
  println(b.boosted(10))
}`,
    starter: `interface Scorer {
  fun score(n: Int): Int
}

class Plain : Scorer {
  override fun score(n: Int): Int {
    return n
  }
}

// 1. TODO

fun main() {
  val extra = 7

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // score is forwarded to Plain, so it gives 10; boosted adds 7 for 17. With extra 3: 13.
    expected: '10\n17',
    swap: { variableName: 'extra', originalLiteral: '7', alternateLiteral: '3', alternateExpected: '10\n13' },
  },
  {
    id: 'lazy-and-watch', difficulty: 'hard', tags: ['lesson:delegated-properties', 'lazy', 'observable', 'delegated-property'], title: 'Lazy and Watch', fileName: 'LazyAndWatch.kt',
    solution: `import kotlin.properties.Delegates

class Panel(val base: Int) {
  val total: Int by lazy {
    println("computing")
    base * 2
  }

  var score: Int by Delegates.observable(0) { _, old, new ->
    println("score " + old + " -> " + new)
  }
}

fun main() {
  val base = 21
  val p = Panel(base)
  println("Before")
  println(p.total)
  println(p.total)
  p.score = 5
  p.score = 9
}`,
    starter: `import kotlin.properties.Delegates

class Panel(val base: Int) {
  // 1. TODO

  // 2. TODO
}

fun main() {
  val base = 21
  val p = Panel(base)

  // 3. TODO

  // 4. TODO
}`,
    // The lazy block runs once, on first use: computing then 42 twice. The observer prints each change: 0 -> 5 then 5 -> 9. With base 10: 20.
    expected: 'Before\ncomputing\n42\n42\nscore 0 -> 5\nscore 5 -> 9',
    swap: { variableName: 'base', originalLiteral: '21', alternateLiteral: '10', alternateExpected: 'Before\ncomputing\n20\n20\nscore 0 -> 5\nscore 5 -> 9' },
  },
  {
    id: 'age-guard', difficulty: 'hard', tags: ['lesson:delegated-properties', 'vetoable', 'delegated-property', 'class-property'], title: 'Age Guard', fileName: 'AgeGuard.kt',
    solution: `import kotlin.properties.Delegates

class Profile(val minAge: Int) {
  var age: Int by Delegates.vetoable(18) { _, _, new ->
    new >= minAge
  }
}

fun main() {
  val minAge = 18
  val p = Profile(minAge)
  p.age = 25
  p.age = 12
  p.age = 20
  println("Age: " + p.age)
  println("Min age: " + p.minAge)
}`,
    starter: `import kotlin.properties.Delegates

class Profile(val minAge: Int) {
  // 1. TODO
}

fun main() {
  val minAge = 18
  val p = Profile(minAge)

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // 25 is accepted, 12 is refused, 20 is accepted: age 20. With minAge 22: 25 is accepted, 12 and 20 are refused, so age stays 25.
    expected: 'Age: 20\nMin age: 18',
    swap: { variableName: 'minAge', originalLiteral: '18', alternateLiteral: '22', alternateExpected: 'Age: 25\nMin age: 22' },
  },
  {
    id: 'safe-account', difficulty: 'medium', tags: ['lesson:visibility-and-api-design', 'private-property', 'public-api', 'guarded-change'], title: 'Safe Account', fileName: 'SafeAccount.kt',
    solution: `class Account(private var balance: Int) {
  fun deposit(n: Int) {
    balance += n
  }

  fun withdraw(n: Int): Boolean {
    if (n > balance) {
      return false
    }
    balance -= n
    return true
  }

  fun show(): String {
    return "Balance: " + balance
  }
}

fun main() {
  val amount = 120
  val acc = Account(0)
  acc.deposit(100)
  println("Withdraw 30: " + acc.withdraw(30))
  println("Withdraw " + amount + ": " + acc.withdraw(amount))
  println(acc.show())
}`,
    starter: `// 1. TODO

fun main() {
  val amount = 120

  // 2. TODO

  // 3. TODO

  // 4. TODO

  // 5. TODO
}`,
    // Deposit 100, withdraw 30 works (70 left), withdraw 120 is refused. With amount 60: it works and 10 is left.
    expected: 'Withdraw 30: true\nWithdraw 120: false\nBalance: 70',
    swap: { variableName: 'amount', originalLiteral: '120', alternateLiteral: '60', alternateExpected: 'Withdraw 30: true\nWithdraw 60: true\nBalance: 10' },
  },
  {
    id: 'tick-timer', difficulty: 'hard', tags: ['lesson:visibility-and-api-design', 'private-set', 'private-function', 'public-api'], title: 'Tick Timer', fileName: 'TickTimer.kt',
    solution: `class Timer {
  var ticks = 0
    private set

  fun tick() {
    ticks += 1
  }

  private fun label(): String {
    return "Timer ticks: "
  }

  fun report(): String {
    return label() + ticks
  }
}

fun main() {
  val times = 3
  val timer = Timer()
  for (i in 1..times) {
    timer.tick()
  }
  println("Ticks: " + timer.ticks)
  println(timer.report())
}`,
    starter: `class Timer {
  // 1. TODO

  // 2. TODO
}

fun main() {
  val times = 3

  // 3. TODO

  // 4. TODO
}`,
    // Three ticks: ticks is 3 and the report adds the private label. With times 5: 5.
    expected: 'Ticks: 3\nTimer ticks: 3',
    swap: { variableName: 'times', originalLiteral: '3', alternateLiteral: '5', alternateExpected: 'Ticks: 5\nTimer ticks: 5' },
  },
];

export const DBG_SPECS: DbgSpec[] = [
  {
    id: 'closed-parent', tags: ['lesson:inheritance-abstract-classes', 'final-class', 'open-modifier'], title: 'Fix the Closed Parent', bugType: 'type', bugLabel: 'Compile Error: a class must be open to be inherited', difficulty: 'medium',
    broken: `class Animal(val name: String) {
  open fun sound(): String {
    return "..."
  }
}

class Dog(name: String) : Animal(name) {
  override fun sound(): String {
    return "Woof"
  }
}

fun main() {
  val d = Dog("Rex")
  println(d.name + " says " + d.sound())
}`,
    fixed: `open class Animal(val name: String) {
  open fun sound(): String {
    return "..."
  }
}

class Dog(name: String) : Animal(name) {
  override fun sound(): String {
    return "Woof"
  }
}

fun main() {
  val d = Dog("Rex")
  println(d.name + " says " + d.sound())
}`,
    expected: 'Rex says Woof',
  },
  {
    id: 'missing-member', tags: ['lesson:interfaces-multiple-interface-implementa', 'interface-contract', 'override-required'], title: 'Fix the Missing Member', bugType: 'type', bugLabel: 'Compile Error: an interface member is not implemented', difficulty: 'medium',
    broken: `interface Greeter {
  fun greet(name: String): String
  fun farewell(name: String): String
}

class Polite : Greeter {
  override fun greet(name: String): String {
    return "Hello " + name
  }
}

fun main() {
  val g = Polite()
  println(g.greet("Ana"))
  println(g.farewell("Ana"))
}`,
    fixed: `interface Greeter {
  fun greet(name: String): String
  fun farewell(name: String): String
}

class Polite : Greeter {
  override fun greet(name: String): String {
    return "Hello " + name
  }

  override fun farewell(name: String): String {
    return "Bye " + name
  }
}

fun main() {
  val g = Polite()
  println(g.greet("Ana"))
  println(g.farewell("Ana"))
}`,
    expected: 'Hello Ana\nBye Ana',
  },
  {
    id: 'open-when', tags: ['lesson:sealed-classes-sealed-interfaces', 'exhaustive-when', 'sealed-class'], title: 'Fix the Open When', bugType: 'type', bugLabel: 'Compile Error: a when over a sealed class misses a case', difficulty: 'medium',
    broken: `sealed class Light
class Red : Light()
class Green : Light()
class Yellow : Light()

fun action(l: Light): String {
  return when (l) {
    is Red -> "stop"
    is Green -> "go"
  }
}

fun main() {
  println(action(Yellow()))
  println(action(Green()))
}`,
    fixed: `sealed class Light
class Red : Light()
class Green : Light()
class Yellow : Light()

fun action(l: Light): String {
  return when (l) {
    is Red -> "stop"
    is Green -> "go"
    is Yellow -> "slow"
  }
}

fun main() {
  println(action(Yellow()))
  println(action(Green()))
}`,
    expected: 'slow\ngo',
  },
  {
    id: 'plain-equals', tags: ['lesson:data-classes-in-domain-modeling-enum-cla', 'data-class', 'structural-equality'], title: 'Fix the Plain Equals', bugType: 'logic', bugLabel: 'Logic Error: a plain class compares by identity', difficulty: 'medium',
    broken: `class Point(val x: Int, val y: Int)

fun main() {
  val a = Point(1, 2)
  val b = Point(1, 2)
  println("Same: " + (a == b))
}`,
    fixed: `data class Point(val x: Int, val y: Int)

fun main() {
  val a = Point(1, 2)
  val b = Point(1, 2)
  println("Same: " + (a == b))
}`,
    expected: 'Same: true',
  },
  {
    id: 'nested-no-outer', tags: ['lesson:nested-classes', 'nested-vs-inner', 'outer-access'], title: 'Fix the Lost Outer', bugType: 'type', bugLabel: 'Compile Error: a nested class cannot see the outer instance', difficulty: 'hard',
    broken: `class Shop(val name: String) {
  class Cart {
    fun owner(): String {
      return "Cart of " + name
    }
  }
}

fun main() {
  val shop = Shop("Ana")
  val cart = shop.Cart()
  println(cart.owner())
}`,
    fixed: `class Shop(val name: String) {
  inner class Cart {
    fun owner(): String {
      return "Cart of " + name
    }
  }
}

fun main() {
  val shop = Shop("Ana")
  val cart = shop.Cart()
  println(cart.owner())
}`,
    expected: 'Cart of Ana',
  },
  {
    id: 'inner-no-outer', tags: ['lesson:inner-classes', 'inner-class', 'outer-instance'], title: 'Fix the Wrong Bank', bugType: 'logic', bugLabel: 'Logic Error: the account was created from the wrong outer object', difficulty: 'hard',
    broken: `class Bank(val rate: Int) {
  inner class Account(val saved: Int) {
    fun interest(): Int {
      return saved * rate / 100
    }
  }
}

fun main() {
  val bank = Bank(5)
  val other = Bank(8)
  val acc = other.Account(200)
  println(acc.interest())
}`,
    fixed: `class Bank(val rate: Int) {
  inner class Account(val saved: Int) {
    fun interest(): Int {
      return saved * rate / 100
    }
  }
}

fun main() {
  val bank = Bank(5)
  val other = Bank(8)
  val acc = bank.Account(200)
  println(acc.interest())
}`,
    expected: '10',
  },
  {
    id: 'new-object', tags: ['lesson:object-declarations', 'object-declaration', 'no-constructor'], title: 'Fix the New Object', bugType: 'type', bugLabel: 'Compile Error: an object cannot be created with ()', difficulty: 'medium',
    broken: `object Logger {
  var lines = 0

  fun log(text: String) {
    lines += 1
    println(text)
  }
}

fun main() {
  val l = Logger()
  l.log("start")
  println(l.lines)
}`,
    fixed: `object Logger {
  var lines = 0

  fun log(text: String) {
    lines += 1
    println(text)
  }
}

fun main() {
  Logger.log("start")
  println(Logger.lines)
}`,
    expected: 'start\n1',
  },
  {
    id: 'companion-via-instance', tags: ['lesson:companion-objects', 'companion-object', 'access-by-class-name'], title: 'Fix the Companion Call', bugType: 'type', bugLabel: 'Compile Error: a companion member is called on the class name', difficulty: 'medium',
    broken: `class Color(val name: String) {
  companion object {
    fun red(): Color {
      return Color("red")
    }
  }
}

fun main() {
  val c = Color("blue")
  val r = c.red()
  println(r.name)
}`,
    fixed: `class Color(val name: String) {
  companion object {
    fun red(): Color {
      return Color("red")
    }
  }
}

fun main() {
  val r = Color.red()
  println(r.name)
}`,
    expected: 'red',
  },
  {
    id: 'shadowed-extension', tags: ['lesson:extension-functions', 'member-wins', 'extension-function'], title: 'Fix the Shadowed Extension', bugType: 'logic', bugLabel: 'Logic Error: a member function hides an extension with the same name', difficulty: 'hard',
    broken: `class Box {
  fun label(): String {
    return "box"
  }
}

fun Box.label(): String {
  return "BOX"
}

fun main() {
  println(Box().label())
}`,
    fixed: `class Box {
  fun label(): String {
    return "box"
  }
}

fun Box.shout(): String {
  return "BOX"
}

fun main() {
  println(Box().shout())
}`,
    expected: 'BOX',
  },
  {
    id: 'ext-field', tags: ['lesson:extension-properties', 'extension-property', 'no-backing-field'], title: 'Fix the Extension Field', bugType: 'type', bugLabel: 'Compile Error: an extension property cannot store a value', difficulty: 'medium',
    broken: `val String.initial: String = this.substring(0, 1)

fun main() {
  println("kotlin".initial)
}`,
    fixed: `val String.initial: String
  get() = this.substring(0, 1)

fun main() {
  println("kotlin".initial)
}`,
    expected: 'k',
  },
  {
    id: 'wrong-delegate', tags: ['lesson:delegation', 'class-delegation', 'delegate-choice'], title: 'Fix the Wrong Delegate', bugType: 'logic', bugLabel: 'Logic Error: the class delegates to the wrong object', difficulty: 'hard',
    broken: `interface Scorer {
  fun score(n: Int): Int
}

class Plain : Scorer {
  override fun score(n: Int): Int {
    return n
  }
}

class Twice : Scorer {
  override fun score(n: Int): Int {
    return n * 2
  }
}

class Pair2(val first: Scorer, val second: Scorer) : Scorer by first

fun main() {
  val p = Pair2(Plain(), Twice())
  println(p.score(10))
}`,
    fixed: `interface Scorer {
  fun score(n: Int): Int
}

class Plain : Scorer {
  override fun score(n: Int): Int {
    return n
  }
}

class Twice : Scorer {
  override fun score(n: Int): Int {
    return n * 2
  }
}

class Pair2(val first: Scorer, val second: Scorer) : Scorer by second

fun main() {
  val p = Pair2(Plain(), Twice())
  println(p.score(10))
}`,
    expected: '20',
  },
  {
    id: 'recompute', tags: ['lesson:delegated-properties', 'lazy', 'getter-vs-delegate'], title: 'Fix the Repeated Work', bugType: 'logic', bugLabel: 'Logic Error: a getter runs again on every read', difficulty: 'medium',
    broken: `class Report(val base: Int) {
  val total: Int
    get() {
      println("computing")
      return base * 2
    }
}

fun main() {
  val r = Report(21)
  println(r.total)
  println(r.total)
}`,
    fixed: `class Report(val base: Int) {
  val total: Int by lazy {
    println("computing")
    base * 2
  }
}

fun main() {
  val r = Report(21)
  println(r.total)
  println(r.total)
}`,
    expected: 'computing\n42\n42',
  },
  {
    id: 'private-read', tags: ['lesson:visibility-and-api-design', 'private-member', 'public-api'], title: 'Fix the Private Read', bugType: 'type', bugLabel: 'Compile Error: a private property is read from outside', difficulty: 'medium',
    broken: `class Safe(private val code: Int) {
  fun check(guess: Int): Boolean {
    return guess == code
  }
}

fun main() {
  val s = Safe(1234)
  println("Opened: " + (s.code == 1234))
}`,
    fixed: `class Safe(private val code: Int) {
  fun check(guess: Int): Boolean {
    return guess == code
  }
}

fun main() {
  val s = Safe(1234)
  println("Opened: " + s.check(1234))
}`,
    expected: 'Opened: true',
  },
];

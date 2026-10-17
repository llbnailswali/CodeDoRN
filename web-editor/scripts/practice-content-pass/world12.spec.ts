/**
 * World 12 (Generic Realm) practice bank, CODE side: solutions, starters, expected outputs and swaps. Every expected value
 * was derived by hand from Kotlin's rules (written next to the program), NOT copied from the simulator; the bank test
 * (`npm run test:practice-bank`) then runs each program through the engine and compares, and
 * `scripts/practice-content-pass/world12.real.ts` runs every solution and Debug program through real kotlinc.
 * Wording lives in world12.data.ts. A starter holds exactly one single-line `// N. TODO` placeholder per step.
 */
import type { WRSpec, DbgSpec } from './world8.spec';

export const WR_SPECS: WRSpec[] = [
  {
    id: 'stack-box', difficulty: 'medium', tags: ['lesson:generic-classes', 'generic-class', 'type-parameter', 'nullable-result'], title: 'Stack Box', fileName: 'StackBox.kt',
    solution: `class Stack<T> {
  private val items = mutableListOf<T>()

  fun push(x: T) {
    items.add(x)
  }

  fun pop(): T? {
    if (items.isEmpty()) {
      return null
    }
    return items.removeAt(items.size - 1)
  }

  fun size(): Int {
    return items.size
  }
}

fun main() {
  val first = 10
  val s = Stack<Int>()
  s.push(first)
  s.push(first + 5)
  s.push(first + 10)
  println("Popped: " + s.pop())
  println("Size: " + s.size())
  println("Popped: " + s.pop())
  println("Popped: " + s.pop())
  println("Popped: " + s.pop())
}`,
    starter: `// 1. TODO

fun main() {
  val first = 10

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // Pushes 10, 15, 20. Pops give 20, then size 2, then 15, 10 and null for an empty stack. With first 1: 11, size 2, 6, 1, null.
    expected: 'Popped: 20\nSize: 2\nPopped: 15\nPopped: 10\nPopped: null',
    swap: { variableName: 'first', originalLiteral: '10', alternateLiteral: '1', alternateExpected: 'Popped: 11\nSize: 2\nPopped: 6\nPopped: 1\nPopped: null' },
  },
  {
    id: 'pair-swap', difficulty: 'hard', tags: ['lesson:generic-classes', 'generic-class', 'two-type-parameters', 'swapped-types'], title: 'Pair Swap', fileName: 'PairSwap.kt',
    solution: `class Pair2<A, B>(val first: A, val second: B) {
  fun swap(): Pair2<B, A> {
    return Pair2(second, first)
  }
}

fun main() {
  val n = 5
  val p = Pair2("x", n)
  val q = p.swap()
  println(p.first + " " + p.second)
  println(q.first.toString() + " " + q.second)
  val r = q.swap()
  println(r.first)
}`,
    starter: `// 1. TODO

fun main() {
  val n = 5

  // 2. TODO

  // 3. TODO

  // 4. TODO

  // 5. TODO
}`,
    // p is (x, 5); swapped q is (5, x); swapping again gives back x first. With n 8: x 8, 8 x, x.
    expected: 'x 5\n5 x\nx',
    swap: { variableName: 'n', originalLiteral: '5', alternateLiteral: '8', alternateExpected: 'x 8\n8 x\nx' },
  },
  {
    id: 'first-or', difficulty: 'medium', tags: ['lesson:generic-functions', 'generic-function', 'inferred-type', 'fallback'], title: 'First or Fallback', fileName: 'FirstOr.kt',
    solution: `fun <T> firstOr(list: List<T>, fallback: T): T {
  if (list.isEmpty()) {
    return fallback
  }
  return list[0]
}

fun <A, B> pairUp(a: A, b: B): Pair<A, B> {
  return Pair(a, b)
}

fun main() {
  val spare = 0
  println(firstOr(listOf<Int>(), spare))
  println(firstOr(listOf(4, 5), spare))
  println(firstOr(listOf<String>(), "none"))
  println(pairUp("a", spare))
}`,
    starter: `// 1. TODO

// 2. TODO

fun main() {
  val spare = 0

  // 3. TODO

  // 4. TODO

  // 5. TODO
}`,
    // An empty Int list gives the spare 0; [4, 5] gives its first item 4; an empty String list gives none; the pair prints as (a, 0). With spare 9: 9, 4, none, (a, 9).
    expected: '0\n4\nnone\n(a, 0)',
    swap: { variableName: 'spare', originalLiteral: '0', alternateLiteral: '9', alternateExpected: '9\n4\nnone\n(a, 9)' },
  },
  {
    id: 'map-all', difficulty: 'hard', tags: ['lesson:generic-functions', 'generic-function', 'two-type-parameters', 'function-parameter'], title: 'Map All', fileName: 'MapAll.kt',
    solution: `fun <T, R> mapAll(list: List<T>, f: (T) -> R): List<R> {
  val out = mutableListOf<R>()
  for (x in list) {
    out.add(f(x))
  }
  return out
}

fun main() {
  val offset = 10
  val squares = mapAll(listOf(1, 2, 3)) { it * it }
  val lengths = mapAll(listOf("a", "bb")) { it.length }
  val shifted = mapAll(listOf(1, 2, 3)) { it + offset }
  println("Squares: $squares")
  println("Lengths: $lengths")
  println("Shifted: $shifted")
}`,
    starter: `// 1. TODO

fun main() {
  val offset = 10

  // 2. TODO

  // 3. TODO

  // 4. TODO

  // 5. TODO
}`,
    // Squares 1, 4, 9; lengths of a and bb are 1 and 2; shifted by 10 gives 11, 12, 13. With offset 20: 21, 22, 23.
    expected: 'Squares: [1, 4, 9]\nLengths: [1, 2]\nShifted: [11, 12, 13]',
    swap: { variableName: 'offset', originalLiteral: '10', alternateLiteral: '20', alternateExpected: 'Squares: [1, 4, 9]\nLengths: [1, 2]\nShifted: [21, 22, 23]' },
  },
  {
    id: 'entry-describe', difficulty: 'medium', tags: ['lesson:type-parameters', 'two-type-parameters', 'generic-class', 'generic-function'], title: 'Entry Describe', fileName: 'EntryDescribe.kt',
    solution: `class Entry<K, V>(val key: K, val value: V)

fun <K, V> describe(e: Entry<K, V>): String {
  return e.key.toString() + "=" + e.value
}

fun main() {
  val qty = 3
  val pen = Entry("pen", qty)
  val seven = Entry(7, "seven")
  println(describe(pen))
  println(describe(seven))
}`,
    starter: `// 1. TODO

// 2. TODO

fun main() {
  val qty = 3

  // 3. TODO

  // 4. TODO
}`,
    // Entry("pen", 3) describes as pen=3; Entry(7, "seven") as 7=seven. With qty 8: pen=8.
    expected: 'pen=3\n7=seven',
    swap: { variableName: 'qty', originalLiteral: '3', alternateLiteral: '8', alternateExpected: 'pen=8\n7=seven' },
  },
  {
    id: 'explicit-types', difficulty: 'hard', tags: ['lesson:type-parameters', 'explicit-type-argument', 'empty-collection', 'generic-class'], title: 'Explicit Types', fileName: 'ExplicitTypes.kt',
    solution: `class Box<T>(val value: T)

fun main() {
  val start = 4
  val nums = listOf<Int>(start, start + 1)
  val names = mutableListOf<String>()
  names.add("a")
  val empty = emptyList<String>()
  val box = Box<Int>(start * 2)
  val label = Box<String>("n")
  println("Nums: $nums")
  println("Names: " + names.size)
  println("Empty: " + empty.size)
  println("Box: " + box.value)
  println("Label: " + label.value)
}`,
    starter: `class Box<T>(val value: T)

fun main() {
  val start = 4

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO

  // 5. TODO
}`,
    // nums [4, 5]; names has 1 item; empty has 0; the Int box holds 8; the String box holds n. With start 9: nums [9, 10] and box 18.
    expected: 'Nums: [4, 5]\nNames: 1\nEmpty: 0\nBox: 8\nLabel: n',
    swap: { variableName: 'start', originalLiteral: '4', alternateLiteral: '9', alternateExpected: 'Nums: [9, 10]\nNames: 1\nEmpty: 0\nBox: 18\nLabel: n' },
  },
  {
    id: 'max-of-list', difficulty: 'medium', tags: ['lesson:generic-constraints', 'comparable-bound', 'generic-function', 'int-and-string'], title: 'Biggest of a List', fileName: 'MaxOfList.kt',
    solution: `fun <T : Comparable<T>> maxOfList(list: List<T>): T {
  var best = list[0]
  for (x in list) {
    if (x > best) {
      best = x
    }
  }
  return best
}

fun main() {
  val extra = 10
  println(maxOfList(listOf(3, 9, 4)))
  println(maxOfList(listOf("kiwi", "apple", "zebra")))
  println(maxOfList(listOf(3, 9, extra)))
}`,
    starter: `// 1. TODO

fun main() {
  val extra = 10

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // The biggest of 3, 9, 4 is 9; the biggest word is zebra; with 10 added the biggest is 10. With extra 2: the last line is 9.
    expected: '9\nzebra\n10',
    swap: { variableName: 'extra', originalLiteral: '10', alternateLiteral: '2', alternateExpected: '9\nzebra\n9' },
  },
  {
    id: 'number-total', difficulty: 'medium', tags: ['lesson:generic-constraints', 'number-bound', 'generic-function', 'toInt'], title: 'Number Total', fileName: 'NumberTotal.kt',
    solution: `fun <T : Number> sumOf(list: List<T>): Int {
  var t = 0
  for (x in list) {
    t += x.toInt()
  }
  return t
}

fun main() {
  val extra = 4
  println(sumOf(listOf(1, 2, 3)))
  println(sumOf(listOf(extra, extra * 2)))
}`,
    starter: `// 1. TODO

fun main() {
  val extra = 4

  // 2. TODO

  // 3. TODO
}`,
    // 1 + 2 + 3 = 6; 4 + 8 = 12. With extra 5: 5 + 10 = 15.
    expected: '6\n12',
    swap: { variableName: 'extra', originalLiteral: '4', alternateLiteral: '5', alternateExpected: '6\n15' },
  },
  {
    id: 'crate-label', difficulty: 'medium', tags: ['lesson:multiple-constraints', 'where-clause', 'two-bounds', 'generic-function'], title: 'Crate Label', fileName: 'CrateLabel.kt',
    solution: `interface Named {
  fun label(): String
}

interface Sized {
  fun size(): Int
}

class Crate(val tag: String, val n: Int) : Named, Sized {
  override fun label(): String {
    return tag
  }

  override fun size(): Int {
    return n
  }
}

fun <T> describe(x: T): String where T : Named, T : Sized {
  return x.label() + ":" + x.size()
}

fun main() {
  val n = 4
  println(describe(Crate("box", n)))
  println(describe(Crate("bag", n * 2)))
}`,
    starter: `interface Named {
  fun label(): String
}

interface Sized {
  fun size(): Int
}

class Crate(val tag: String, val n: Int) : Named, Sized {
  override fun label(): String {
    return tag
  }

  override fun size(): Int {
    return n
  }
}

// 1. TODO

fun main() {
  val n = 4

  // 2. TODO

  // 3. TODO
}`,
    // box has size 4 and bag has size 8. With n 5: 5 and 10.
    expected: 'box:4\nbag:8',
    swap: { variableName: 'n', originalLiteral: '4', alternateLiteral: '5', alternateExpected: 'box:5\nbag:10' },
  },
  {
    id: 'cheapest-item', difficulty: 'hard', tags: ['lesson:multiple-constraints', 'where-clause', 'two-bounds', 'loop-with-bounds'], title: 'Cheapest Item', fileName: 'CheapestItem.kt',
    solution: `interface Named {
  fun label(): String
}

interface Priced {
  fun price(): Int
}

class Item(val tag: String, val cost: Int) : Named, Priced {
  override fun label(): String {
    return tag
  }

  override fun price(): Int {
    return cost
  }
}

fun <T> cheapest(items: List<T>): String where T : Named, T : Priced {
  var best = items[0]
  for (x in items) {
    if (x.price() < best.price()) {
      best = x
    }
  }
  return best.label() + " costs " + best.price()
}

fun <T : Priced> total(items: List<T>): Int {
  var t = 0
  for (x in items) {
    t += x.price()
  }
  return t
}

fun main() {
  val extra = 8
  val items = listOf(Item("pen", 12), Item("cap", extra), Item("bag", 30))
  println("Cheapest: " + cheapest(items))
  println("Total: " + total(items))
}`,
    starter: `interface Named {
  fun label(): String
}

interface Priced {
  fun price(): Int
}

class Item(val tag: String, val cost: Int) : Named, Priced {
  override fun label(): String {
    return tag
  }

  override fun price(): Int {
    return cost
  }
}

// 1. TODO

// 2. TODO

fun main() {
  val extra = 8

  // 3. TODO

  // 4. TODO
}`,
    // The cap at 8 is the cheapest; total 12 + 8 + 30 = 50. With extra 15: the pen at 12 is cheapest and the total is 57.
    expected: 'Cheapest: cap costs 8\nTotal: 50',
    swap: { variableName: 'extra', originalLiteral: '8', alternateLiteral: '15', alternateExpected: 'Cheapest: pen costs 12\nTotal: 57' },
  },
  {
    id: 'shared-sink', difficulty: 'medium', tags: ['lesson:in-variance', 'in-variance', 'consumer', 'shared-object'], title: 'Shared Sink', fileName: 'SharedSink.kt',
    solution: `interface Sink<in T> {
  fun put(x: T)
}

fun fillInts(s: Sink<Int>, n: Int) {
  for (i in 1..n) {
    s.put(i)
  }
}

fun fillWords(s: Sink<String>) {
  s.put("a")
  s.put("b")
}

class Log : Sink<Any> {
  var lines = 0
  var last: Any = ""

  override fun put(x: Any) {
    lines += 1
    last = x
  }
}

fun main() {
  val count = 3
  val log = Log()
  fillInts(log, count)
  fillWords(log)
  println("Lines: " + log.lines)
  println("Last: " + log.last)
}`,
    starter: `interface Sink<in T> {
  fun put(x: T)
}

fun fillInts(s: Sink<Int>, n: Int) {
  for (i in 1..n) {
    s.put(i)
  }
}

fun fillWords(s: Sink<String>) {
  s.put("a")
  s.put("b")
}

// 1. TODO

fun main() {
  val count = 3

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // One Log (a Sink of Any) serves both Sink<Int> and Sink<String>: 3 numbers + 2 words = 5 lines, and the last item is b. With count 1: 3 lines.
    expected: 'Lines: 5\nLast: b',
    swap: { variableName: 'count', originalLiteral: '3', alternateLiteral: '1', alternateExpected: 'Lines: 3\nLast: b' },
  },
  {
    id: 'text-checker', difficulty: 'hard', tags: ['lesson:in-variance', 'in-variance', 'consumer', 'broader-type-accepted'], title: 'Text Checker', fileName: 'TextChecker.kt',
    solution: `interface Checker<in T> {
  fun ok(x: T): Boolean
}

fun countOk(items: List<String>, c: Checker<String>): Int {
  var n = 0
  for (x in items) {
    if (c.ok(x)) {
      n += 1
    }
  }
  return n
}

class LongText(val limit: Int) : Checker<Any> {
  override fun ok(x: Any): Boolean {
    return x.toString().length > limit
  }
}

fun main() {
  val limit = 3
  val items = listOf("kiwi", "fig", "banana", "plum", "apple")
  println("Long: " + countOk(items, LongText(limit)))
  println("Very long: " + countOk(items, LongText(limit + 2)))
}`,
    starter: `interface Checker<in T> {
  fun ok(x: T): Boolean
}

fun countOk(items: List<String>, c: Checker<String>): Int {
  var n = 0
  for (x in items) {
    if (c.ok(x)) {
      n += 1
    }
  }
  return n
}

// 1. TODO

fun main() {
  val limit = 3
  val items = listOf("kiwi", "fig", "banana", "plum", "apple")

  // 2. TODO

  // 3. TODO
}`,
    // Lengths 4, 3, 6, 4, 5. Longer than 3: kiwi, banana, plum, apple (4). Longer than 5: banana (1). With limit 4: longer than 4 gives 2, longer than 6 gives 0.
    expected: 'Long: 4\nVery long: 1',
    swap: { variableName: 'limit', originalLiteral: '3', alternateLiteral: '4', alternateExpected: 'Long: 2\nVery long: 0' },
  },
  {
    id: 'counter-source', difficulty: 'medium', tags: ['lesson:out-variance', 'out-variance', 'producer', 'shared-state'], title: 'Counter Source', fileName: 'CounterSource.kt',
    solution: `interface Source<out T> {
  fun next(): T
}

fun pull(s: Source<Number>, times: Int): Int {
  var t = 0
  for (i in 1..times) {
    t += s.next().toInt()
  }
  return t
}

class Counter(var n: Int) : Source<Int> {
  override fun next(): Int {
    n += 1
    return n
  }
}

fun main() {
  val times = 3
  val c = Counter(0)
  println("Sum: " + pull(c, times))
  println("Next: " + c.next())
}`,
    starter: `interface Source<out T> {
  fun next(): T
}

fun pull(s: Source<Number>, times: Int): Int {
  var t = 0
  for (i in 1..times) {
    t += s.next().toInt()
  }
  return t
}

// 1. TODO

fun main() {
  val times = 3

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // A Source<Int> works where a Source<Number> is expected. Pulling 3 times gives 1 + 2 + 3 = 6, and the next value is 4. With times 4: sum 10, next 5.
    expected: 'Sum: 6\nNext: 4',
    swap: { variableName: 'times', originalLiteral: '3', alternateLiteral: '4', alternateExpected: 'Sum: 10\nNext: 5' },
  },
  {
    id: 'shelf-reader', difficulty: 'hard', tags: ['lesson:out-variance', 'out-variance', 'producer', 'two-implementations'], title: 'Shelf Reader', fileName: 'ShelfReader.kt',
    solution: `interface Shelf<out T> {
  fun first(): T
  fun count(): Int
}

fun describe(s: Shelf<Any>): String {
  return "first=" + s.first() + " count=" + s.count()
}

class Words(val items: List<String>) : Shelf<String> {
  override fun first(): String {
    return items[0]
  }

  override fun count(): Int {
    return items.size
  }
}

class Numbers(val items: List<Int>) : Shelf<Int> {
  override fun first(): Int {
    return items[0]
  }

  override fun count(): Int {
    return items.size
  }
}

fun main() {
  val lead = "pear"
  println(describe(Words(listOf(lead, "fig"))))
  println(describe(Numbers(listOf(1, 2, 3))))
}`,
    starter: `interface Shelf<out T> {
  fun first(): T
  fun count(): Int
}

fun describe(s: Shelf<Any>): String {
  return "first=" + s.first() + " count=" + s.count()
}

// 1. TODO

// 2. TODO

fun main() {
  val lead = "pear"

  // 3. TODO

  // 4. TODO
}`,
    // Words starts with pear and has 2 items; Numbers starts with 1 and has 3. With lead "plum": first=plum.
    expected: 'first=pear count=2\nfirst=1 count=3',
    swap: { variableName: 'lead', originalLiteral: '"pear"', alternateLiteral: '"plum"', alternateExpected: 'first=plum count=2\nfirst=1 count=3' },
  },
  {
    id: 'swap-cells', difficulty: 'medium', tags: ['lesson:invariance', 'invariance', 'generic-function', 'same-type-argument'], title: 'Swap Cells', fileName: 'SwapCells.kt',
    solution: `class Cell<T>(var value: T)

fun <T> swapValues(a: Cell<T>, b: Cell<T>) {
  val tmp = a.value
  a.value = b.value
  b.value = tmp
}

fun main() {
  val start = 3
  val a = Cell(start)
  val b = Cell(start + 4)
  swapValues(a, b)
  println("A: " + a.value)
  println("B: " + b.value)
  val x = Cell("x")
  val y = Cell("y")
  swapValues(x, y)
  println("Words: " + x.value + " " + y.value)
}`,
    starter: `class Cell<T>(var value: T)

// 1. TODO

fun main() {
  val start = 3

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // The cells hold 3 and 7; after the swap A is 7 and B is 3. The word cells x and y become y and x. With start 10: A 14, B 10.
    expected: 'A: 7\nB: 3\nWords: y x',
    swap: { variableName: 'start', originalLiteral: '3', alternateLiteral: '10', alternateExpected: 'A: 14\nB: 10\nWords: y x' },
  },
  {
    id: 'fill-list', difficulty: 'medium', tags: ['lesson:invariance', 'invariance', 'mutable-list', 'generic-function'], title: 'Fill a List', fileName: 'FillList.kt',
    solution: `fun <T> fillWith(list: MutableList<T>, x: T, n: Int) {
  for (i in 1..n) {
    list.add(x)
  }
}

fun main() {
  val times = 3
  val ints = mutableListOf(1)
  fillWith(ints, 9, times)
  val words = mutableListOf<String>()
  fillWith(words, "ab", 2)
  println("Ints: $ints")
  println("Words: $words")
}`,
    starter: `// 1. TODO

fun main() {
  val times = 3

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // The Int list gets three 9s; the String list gets two ab. With times 1: [1, 9].
    expected: 'Ints: [1, 9, 9, 9]\nWords: [ab, ab]',
    swap: { variableName: 'times', originalLiteral: '3', alternateLiteral: '1', alternateExpected: 'Ints: [1, 9]\nWords: [ab, ab]' },
  },
  {
    id: 'farm-feed', difficulty: 'medium', tags: ['lesson:declaration-site-variance', 'declaration-site-variance', 'out', 'class-hierarchy'], title: 'Farm Feed', fileName: 'FarmFeed.kt',
    solution: `open class Animal(val name: String)

class Dog : Animal("Dog")

class Cat : Animal("Cat")

interface Producer<out T> {
  fun produce(): T
}

fun feed(p: Producer<Animal>, times: Int): String {
  var s = ""
  for (i in 1..times) {
    s += p.produce().name + " "
  }
  return s.trim()
}

class DogFarm : Producer<Dog> {
  override fun produce(): Dog {
    return Dog()
  }
}

class CatFarm : Producer<Cat> {
  override fun produce(): Cat {
    return Cat()
  }
}

fun main() {
  val times = 2
  println(feed(DogFarm(), times))
  println(feed(CatFarm(), times + 1))
}`,
    starter: `open class Animal(val name: String)

class Dog : Animal("Dog")

class Cat : Animal("Cat")

interface Producer<out T> {
  fun produce(): T
}

fun feed(p: Producer<Animal>, times: Int): String {
  var s = ""
  for (i in 1..times) {
    s += p.produce().name + " "
  }
  return s.trim()
}

// 1. TODO

// 2. TODO

fun main() {
  val times = 2

  // 3. TODO

  // 4. TODO
}`,
    // Because Producer is declared with out, a Producer<Dog> is accepted as a Producer<Animal>. Two dogs, then three cats. With times 1: Dog and Cat Cat.
    expected: 'Dog Dog\nCat Cat Cat',
    swap: { variableName: 'times', originalLiteral: '2', alternateLiteral: '1', alternateExpected: 'Dog\nCat Cat' },
  },
  {
    id: 'vet-visit', difficulty: 'hard', tags: ['lesson:declaration-site-variance', 'declaration-site-variance', 'in', 'class-hierarchy'], title: 'Vet Visit', fileName: 'VetVisit.kt',
    solution: `open class Animal(val name: String)

class Dog : Animal("Dog")

class Cat : Animal("Cat")

interface Vet<in T> {
  fun treat(x: T): String
}

class AnimalVet(val fee: Int) : Vet<Animal> {
  override fun treat(x: Animal): String {
    return "Vet treats " + x.name + " for " + fee
  }
}

fun main() {
  val fee = 20
  val dogVet: Vet<Dog> = AnimalVet(fee)
  val catVet: Vet<Cat> = AnimalVet(fee + 5)
  println(dogVet.treat(Dog()))
  println(catVet.treat(Cat()))
}`,
    starter: `open class Animal(val name: String)

class Dog : Animal("Dog")

class Cat : Animal("Cat")

interface Vet<in T> {
  fun treat(x: T): String
}

// 1. TODO

fun main() {
  val fee = 20

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // Because Vet is declared with in, a Vet<Animal> is accepted as a Vet<Dog> and a Vet<Cat>. The cat vet charges 25. With fee 35: 35 and 40.
    expected: 'Vet treats Dog for 20\nVet treats Cat for 25',
    swap: { variableName: 'fee', originalLiteral: '20', alternateLiteral: '35', alternateExpected: 'Vet treats Dog for 35\nVet treats Cat for 40' },
  },
  {
    id: 'sum-out', difficulty: 'medium', tags: ['lesson:use-site-variance', 'use-site-variance', 'out-projection', 'read-only'], title: 'Sum with Out', fileName: 'SumOut.kt',
    solution: `fun sumAll(list: MutableList<out Number>): Int {
  var t = 0
  for (x in list) {
    t += x.toInt()
  }
  return t
}

fun main() {
  val extra = 10
  val ints = mutableListOf(1, 2, 3)
  val nums = mutableListOf<Number>(4, 5)
  println(sumAll(ints))
  println(sumAll(nums))
  ints.add(extra)
  println(sumAll(ints))
}`,
    starter: `// 1. TODO

fun main() {
  val extra = 10

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // The out projection lets sumAll read a list of Int or Number: 6, then 9, then 16 after adding 10. With extra 1: 7.
    expected: '6\n9\n16',
    swap: { variableName: 'extra', originalLiteral: '10', alternateLiteral: '1', alternateExpected: '6\n9\n7' },
  },
  {
    id: 'fill-in', difficulty: 'hard', tags: ['lesson:use-site-variance', 'use-site-variance', 'in-projection', 'write-only'], title: 'Fill with In', fileName: 'FillIn.kt',
    solution: `fun fillSeven(list: MutableList<in Int>, n: Int) {
  for (i in 1..n) {
    list.add(7)
  }
}

fun main() {
  val count = 2
  val ints = mutableListOf(1)
  val anys = mutableListOf<Any>("x")
  fillSeven(ints, count)
  fillSeven(anys, count)
  println("Ints: $ints")
  println("Anys: $anys")
}`,
    starter: `// 1. TODO

fun main() {
  val count = 2
  val ints = mutableListOf(1)
  val anys = mutableListOf<Any>("x")

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // The in projection lets fillSeven write to a list of Int or a list of Any: [1, 7, 7] and [x, 7, 7]. With count 1: one 7 each.
    expected: 'Ints: [1, 7, 7]\nAnys: [x, 7, 7]',
    swap: { variableName: 'count', originalLiteral: '2', alternateLiteral: '1', alternateExpected: 'Ints: [1, 7]\nAnys: [x, 7]' },
  },
  {
    id: 'size-all', difficulty: 'medium', tags: ['lesson:star-projections', 'star-projection', 'list-of-lists', 'count'], title: 'Size of All', fileName: 'SizeAll.kt',
    solution: `fun totalSize(lists: List<List<*>>): Int {
  var t = 0
  for (l in lists) {
    t += l.size
  }
  return t
}

fun bigLists(lists: List<List<*>>, min: Int): Int {
  var n = 0
  for (l in lists) {
    if (l.size >= min) {
      n += 1
    }
  }
  return n
}

fun main() {
  val min = 2
  val lists = listOf(listOf(1, 2), listOf("a"), listOf(true, false, true))
  println("Total: " + totalSize(lists))
  println("Big lists: " + bigLists(lists, min))
}`,
    starter: `// 1. TODO

// 2. TODO

fun main() {
  val min = 2
  val lists = listOf(listOf(1, 2), listOf("a"), listOf(true, false, true))

  // 3. TODO

  // 4. TODO
}`,
    // Sizes 2, 1 and 3 add up to 6; lists with at least 2 items: 2. With min 3: only 1.
    expected: 'Total: 6\nBig lists: 2',
    swap: { variableName: 'min', originalLiteral: '2', alternateLiteral: '3', alternateExpected: 'Total: 6\nBig lists: 1' },
  },
  {
    id: 'box-peek', difficulty: 'hard', tags: ['lesson:star-projections', 'star-projection', 'read-as-any', 'equality'], title: 'Box Peek', fileName: 'BoxPeek.kt',
    solution: `class Box<T>(val value: T)

fun describe(b: Box<*>): String {
  return "box " + b.value
}

fun same(a: Box<*>, b: Box<*>): Boolean {
  return a.value == b.value
}

fun main() {
  val n = 7
  println(describe(Box("a")))
  println(describe(Box(n)))
  println("Same: " + same(Box(n), Box(7)))
}`,
    starter: `class Box<T>(val value: T)

// 1. TODO

// 2. TODO

fun main() {
  val n = 7

  // 3. TODO

  // 4. TODO
}`,
    // Box<*> can be read as Any: box a, box 7, and the 7 box equals another 7 box. With n 9: box 9 and not the same.
    expected: 'box a\nbox 7\nSame: true',
    swap: { variableName: 'n', originalLiteral: '7', alternateLiteral: '9', alternateExpected: 'box a\nbox 9\nSame: false' },
  },
  {
    id: 'count-type', difficulty: 'medium', tags: ['lesson:reified-type-parameters', 'reified', 'is-check', 'inline'], title: 'Count by Type', fileName: 'CountType.kt',
    solution: `inline fun <reified T> countOf(items: List<Any>): Int = items.filter { it is T }.size

fun main() {
  val extra = 5
  val items: List<Any> = listOf(1, "a", 2, "b", "c", extra)
  println("Strings: " + countOf<String>(items))
  println("Ints: " + countOf<Int>(items))
}`,
    starter: `// 1. TODO

fun main() {
  val extra = 5
  val items: List<Any> = listOf(1, "a", 2, "b", "c", extra)

  // 2. TODO

  // 3. TODO
}`,
    // Three strings (a, b, c) and three Ints (1, 2, 5). If extra becomes the text "five": 4 strings and 2 Ints.
    expected: 'Strings: 3\nInts: 3',
    swap: { variableName: 'extra', originalLiteral: '5', alternateLiteral: '"five"', alternateExpected: 'Strings: 4\nInts: 2' },
  },
  {
    id: 'has-type', difficulty: 'hard', tags: ['lesson:reified-type-parameters', 'reified', 'any', 'is-check'], title: 'Has the Type', fileName: 'HasType.kt',
    solution: `inline fun <reified T> hasType(items: List<Any>): Boolean = items.any { it is T }

fun main() {
  val extra = 1
  val items: List<Any> = listOf(extra, "a")
  println("String: " + hasType<String>(items))
  println("Boolean: " + hasType<Boolean>(items))
  println("Int: " + hasType<Int>(items))
}`,
    starter: `// 1. TODO

fun main() {
  val extra = 1
  val items: List<Any> = listOf(extra, "a")

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // The list holds an Int and a String: String true, Boolean false, Int true. If extra becomes true: String true, Boolean true, Int false.
    expected: 'String: true\nBoolean: false\nInt: true',
    swap: { variableName: 'extra', originalLiteral: '1', alternateLiteral: 'true', alternateExpected: 'String: true\nBoolean: true\nInt: false' },
  },
  {
    id: 'alias-handler', difficulty: 'medium', tags: ['lesson:type-aliases', 'type-alias', 'function-type-alias', 'list-alias'], title: 'Alias Handler', fileName: 'AliasHandler.kt',
    solution: `typealias Handler = (Int) -> Int
typealias Names = List<String>

fun twice(h: Handler, x: Int): Int {
  return h(h(x))
}

fun main() {
  val start = 1
  println(twice({ it + 5 }, start))
  println(twice({ it * 3 }, start))
  val names: Names = listOf("a", "bb")
  println("Names: " + names.size)
}`,
    starter: `// 1. TODO

// 2. TODO

fun main() {
  val start = 1

  // 3. TODO

  // 4. TODO
}`,
    // Adding 5 twice to 1 gives 11; tripling twice gives 9; two names. With start 2: 12 and 18.
    expected: '11\n9\nNames: 2',
    swap: { variableName: 'start', originalLiteral: '1', alternateLiteral: '2', alternateExpected: '12\n18\nNames: 2' },
  },
  {
    id: 'alias-bucket', difficulty: 'hard', tags: ['lesson:type-aliases', 'type-alias', 'generic-alias', 'function-type-alias'], title: 'Alias Bucket', fileName: 'AliasBucket.kt',
    solution: `typealias Bucket<T> = MutableList<T>
typealias Predicate<T> = (T) -> Boolean

fun fill(b: Bucket<Int>, n: Int) {
  for (i in 1..n) {
    b.add(i * 10)
  }
}

fun countIf(items: List<Int>, p: Predicate<Int>): Int {
  var c = 0
  for (x in items) {
    if (p(x)) {
      c += 1
    }
  }
  return c
}

fun main() {
  val n = 4
  val b: Bucket<Int> = mutableListOf<Int>()
  fill(b, n)
  println("Bucket: $b")
  println("Big: " + countIf(b) { it > 15 })
}`,
    starter: `// 1. TODO

// 2. TODO

fun main() {
  val n = 4

  // 3. TODO

  // 4. TODO
}`,
    // Fills 10, 20, 30, 40; three of them are above 15. With n 2: [10, 20] and one big.
    expected: 'Bucket: [10, 20, 30, 40]\nBig: 3',
    swap: { variableName: 'n', originalLiteral: '4', alternateLiteral: '2', alternateExpected: 'Bucket: [10, 20]\nBig: 1' },
  },
  {
    id: 'typed-repo', difficulty: 'medium', tags: ['lesson:type-safe-generic-apis', 'generic-interface', 'generic-class', 'typed-api'], title: 'Typed Repo', fileName: 'TypedRepo.kt',
    solution: `interface Repo<T> {
  fun add(x: T)
  fun all(): List<T>
}

class MemRepo<T> : Repo<T> {
  private val items = mutableListOf<T>()

  override fun add(x: T) {
    items.add(x)
  }

  override fun all(): List<T> {
    return items
  }
}

fun main() {
  val last = "c"
  val words: Repo<String> = MemRepo()
  words.add("a")
  words.add("b")
  words.add(last)
  val numbers: Repo<Int> = MemRepo()
  numbers.add(1)
  numbers.add(2)
  val wordList = words.all()
  val numberList = numbers.all()
  println("Words: $wordList")
  println("Numbers: $numberList")
  println("Count: " + (wordList.size + numberList.size))
}`,
    starter: `interface Repo<T> {
  fun add(x: T)
  fun all(): List<T>
}

// 1. TODO

fun main() {
  val last = "c"

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // Words a, b, c and numbers 1, 2 are kept in separate typed repos; 3 + 2 = 5 items. With last "z": the words become a, b, z.
    expected: 'Words: [a, b, c]\nNumbers: [1, 2]\nCount: 5',
    swap: { variableName: 'last', originalLiteral: '"c"', alternateLiteral: '"z"', alternateExpected: 'Words: [a, b, z]\nNumbers: [1, 2]\nCount: 5' },
  },
  {
    id: 'answer-unwrap', difficulty: 'hard', tags: ['lesson:type-safe-generic-apis', 'sealed-generic', 'out-variance', 'exhaustive-when'], title: 'Answer Unwrap', fileName: 'AnswerUnwrap.kt',
    solution: `sealed class Answer<out T>

class Ok<T>(val value: T) : Answer<T>()

class Err(val msg: String) : Answer<Nothing>()

fun <T> unwrap(a: Answer<T>, fallback: T): T {
  return when (a) {
    is Ok -> a.value
    is Err -> fallback
  }
}

fun main() {
  val fallback = 0
  println(unwrap(Ok(5), fallback))
  println(unwrap(Err("bad"), fallback))
  println(unwrap(Ok("hi"), "none"))
}`,
    starter: `sealed class Answer<out T>

class Ok<T>(val value: T) : Answer<T>()

class Err(val msg: String) : Answer<Nothing>()

// 1. TODO

fun main() {
  val fallback = 0

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // Ok(5) gives 5; Err gives the fallback 0; Ok("hi") gives hi. With fallback -1: the middle line is -1.
    expected: '5\n0\nhi',
    swap: { variableName: 'fallback', originalLiteral: '0', alternateLiteral: '-1', alternateExpected: '5\n-1\nhi' },
  },
];

export const DBG_SPECS: DbgSpec[] = [
  {
    id: 'wrong-arg', tags: ['lesson:generic-classes', 'generic-class', 'type-argument'], title: 'Fix the Box Type', bugType: 'type', bugLabel: 'Compile Error: the value does not match the type argument', difficulty: 'medium',
    broken: `class Box<T>(val value: T)

fun main() {
  val b: Box<String> = Box(5)
  println(b.value)
}`,
    fixed: `class Box<T>(val value: T)

fun main() {
  val b: Box<Int> = Box(5)
  println(b.value)
}`,
    expected: '5',
  },
  {
    id: 'no-swap', tags: ['lesson:generic-functions', 'generic-function', 'swap-logic'], title: 'Fix the Swap', bugType: 'logic', bugLabel: 'Logic Error: the function returns the pair in the same order', difficulty: 'medium',
    broken: `fun <T> swapPair(p: Pair<T, T>): Pair<T, T> {
  return Pair(p.first, p.second)
}

fun main() {
  println(swapPair(Pair(1, 2)))
}`,
    fixed: `fun <T> swapPair(p: Pair<T, T>): Pair<T, T> {
  return Pair(p.second, p.first)
}

fun main() {
  println(swapPair(Pair(1, 2)))
}`,
    expected: '(2, 1)',
  },
  {
    id: 'one-type', tags: ['lesson:type-parameters', 'type-parameter', 'inferred-type'], title: 'Fix the One Type', bugType: 'type', bugLabel: 'Compile Error: T is one type, but the result is declared as another', difficulty: 'medium',
    broken: `fun <T> pick(a: T, b: T): T {
  return a
}

fun main() {
  val x: Int = pick("a", "b")
  println(x)
}`,
    fixed: `fun <T> pick(a: T, b: T): T {
  return a
}

fun main() {
  val x = pick("a", "b")
  println(x)
}`,
    expected: 'a',
  },
  {
    id: 'smallest-not-biggest', tags: ['lesson:generic-constraints', 'comparable-bound', 'comparison-direction'], title: 'Fix the Biggest', bugType: 'logic', bugLabel: 'Logic Error: the comparison picks the smallest value', difficulty: 'medium',
    broken: `fun <T : Comparable<T>> maxOfList(list: List<T>): T {
  var best = list[0]
  for (x in list) {
    if (x < best) {
      best = x
    }
  }
  return best
}

fun main() {
  println(maxOfList(listOf(3, 9, 4)))
  println(maxOfList(listOf("kiwi", "apple", "zebra")))
}`,
    fixed: `fun <T : Comparable<T>> maxOfList(list: List<T>): T {
  var best = list[0]
  for (x in list) {
    if (x > best) {
      best = x
    }
  }
  return best
}

fun main() {
  println(maxOfList(listOf(3, 9, 4)))
  println(maxOfList(listOf("kiwi", "apple", "zebra")))
}`,
    expected: '9\nzebra',
  },
  {
    id: 'priciest-pick', tags: ['lesson:multiple-constraints', 'where-clause', 'two-bounds', 'comparison-direction'], title: 'Fix the Cheapest', bugType: 'logic', bugLabel: 'Logic Error: the loop keeps the most expensive item', difficulty: 'hard',
    broken: `interface Named {
  fun label(): String
}

interface Priced {
  fun price(): Int
}

class Item(val tag: String, val cost: Int) : Named, Priced {
  override fun label(): String {
    return tag
  }

  override fun price(): Int {
    return cost
  }
}

fun <T> cheapest(items: List<T>): String where T : Named, T : Priced {
  var best = items[0]
  for (x in items) {
    if (x.price() > best.price()) {
      best = x
    }
  }
  return best.label() + " costs " + best.price()
}

fun main() {
  val items = listOf(Item("pen", 12), Item("cap", 8), Item("bag", 30))
  println(cheapest(items))
}`,
    fixed: `interface Named {
  fun label(): String
}

interface Priced {
  fun price(): Int
}

class Item(val tag: String, val cost: Int) : Named, Priced {
  override fun label(): String {
    return tag
  }

  override fun price(): Int {
    return cost
  }
}

fun <T> cheapest(items: List<T>): String where T : Named, T : Priced {
  var best = items[0]
  for (x in items) {
    if (x.price() < best.price()) {
      best = x
    }
  }
  return best.label() + " costs " + best.price()
}

fun main() {
  val items = listOf(Item("pen", 12), Item("cap", 8), Item("bag", 30))
  println(cheapest(items))
}`,
    expected: 'cap costs 8',
  },
  {
    id: 'fresh-sink', tags: ['lesson:in-variance', 'in-variance', 'shared-object'], title: 'Fix the Split Log', bugType: 'logic', bugLabel: 'Logic Error: a second Log is created instead of reusing the first', difficulty: 'hard',
    broken: `interface Sink<in T> {
  fun put(x: T)
}

class Log : Sink<Any> {
  var lines = 0

  override fun put(x: Any) {
    lines += 1
  }
}

fun main() {
  val log = Log()
  val a: Sink<Int> = log
  val b: Sink<String> = Log()
  a.put(1)
  b.put("x")
  println("Lines: " + log.lines)
}`,
    fixed: `interface Sink<in T> {
  fun put(x: T)
}

class Log : Sink<Any> {
  var lines = 0

  override fun put(x: Any) {
    lines += 1
  }
}

fun main() {
  val log = Log()
  val a: Sink<Int> = log
  val b: Sink<String> = log
  a.put(1)
  b.put("x")
  println("Lines: " + log.lines)
}`,
    expected: 'Lines: 2',
  },
  {
    id: 'fresh-source', tags: ['lesson:out-variance', 'lesson:declaration-site-variance', 'out-variance', 'declaration-site-variance', 'shared-object'], title: 'Fix the Split Counter', bugType: 'logic', bugLabel: 'Logic Error: a second Counter is created instead of reusing the first', difficulty: 'hard',
    broken: `interface Source<out T> {
  fun next(): T
}

class Counter : Source<Int> {
  var n = 0

  override fun next(): Int {
    n += 1
    return n
  }
}

fun main() {
  val c = Counter()
  val a: Source<Number> = c
  val b: Source<Any> = Counter()
  println(a.next())
  println(b.next())
  println(a.next())
}`,
    fixed: `interface Source<out T> {
  fun next(): T
}

class Counter : Source<Int> {
  var n = 0

  override fun next(): Int {
    n += 1
    return n
  }
}

fun main() {
  val c = Counter()
  val a: Source<Number> = c
  val b: Source<Any> = c
  println(a.next())
  println(b.next())
  println(a.next())
}`,
    expected: '1\n2\n3',
  },
  {
    id: 'cell-any', tags: ['lesson:invariance', 'invariance', 'generic-function'], title: 'Fix the Cell Type', bugType: 'type', bugLabel: 'Compile Error: Cell<Int> is not a Cell<Any>', difficulty: 'hard',
    broken: `class Cell<T>(val value: T)

fun show(c: Cell<Any>) {
  println(c.value)
}

fun main() {
  val c = Cell(4)
  show(c)
}`,
    fixed: `class Cell<T>(val value: T)

fun <T> show(c: Cell<T>) {
  println(c.value)
}

fun main() {
  val c = Cell(4)
  show(c)
}`,
    expected: '4',
  },
  {
    id: 'copy-list', tags: ['lesson:use-site-variance', 'use-site-variance', 'in-projection'], title: 'Fix the Copy', bugType: 'logic', bugLabel: 'Logic Error: the function fills a copy of the list', difficulty: 'medium',
    broken: `fun fill(list: MutableList<in Int>) {
  list.add(7)
}

fun main() {
  val nums = mutableListOf<Number>(1, 2)
  fill(nums.toMutableList())
  println(nums)
}`,
    fixed: `fun fill(list: MutableList<in Int>) {
  list.add(7)
}

fun main() {
  val nums = mutableListOf<Number>(1, 2)
  fill(nums)
  println(nums)
}`,
    expected: '[1, 2, 7]',
  },
  {
    id: 'typed-box', tags: ['lesson:star-projections', 'star-projection', 'type-argument'], title: 'Fix the Box Parameter', bugType: 'type', bugLabel: 'Compile Error: the parameter only accepts Box<Int>', difficulty: 'medium',
    broken: `class Box<T>(val value: T)

fun describe(b: Box<Int>): String {
  return "box " + b.value
}

fun main() {
  println(describe(Box("a")))
}`,
    fixed: `class Box<T>(val value: T)

fun describe(b: Box<*>): String {
  return "box " + b.value
}

fun main() {
  println(describe(Box("a")))
}`,
    expected: 'box a',
  },
  {
    id: 'wrong-type-arg', tags: ['lesson:reified-type-parameters', 'reified', 'type-argument'], title: 'Fix the Type Argument', bugType: 'logic', bugLabel: 'Logic Error: the call counts the wrong type', difficulty: 'medium',
    broken: `inline fun <reified T> countOf(items: List<Any>): Int = items.filter { it is T }.size

fun main() {
  val items: List<Any> = listOf(1, "a", 2, "b", "c")
  println("Strings: " + countOf<Int>(items))
}`,
    fixed: `inline fun <reified T> countOf(items: List<Any>): Int = items.filter { it is T }.size

fun main() {
  val items: List<Any> = listOf(1, "a", 2, "b", "c")
  println("Strings: " + countOf<String>(items))
}`,
    expected: 'Strings: 3',
  },
  {
    id: 'alias-mixup', tags: ['lesson:type-aliases', 'type-alias', 'no-new-type'], title: 'Fix the Mixed Units', bugType: 'logic', bugLabel: 'Logic Error: an alias does not stop a wrong unit from being passed', difficulty: 'hard',
    broken: `typealias Meters = Int
typealias Feet = Int

fun add(a: Meters, b: Meters): Meters {
  return a + b
}

fun main() {
  val room: Feet = 30
  println(add(5, room))
}`,
    fixed: `typealias Meters = Int
typealias Feet = Int

fun add(a: Meters, b: Meters): Meters {
  return a + b
}

fun main() {
  val room: Feet = 30
  val roomMeters: Meters = room / 3
  println(add(5, roomMeters))
}`,
    expected: '15',
  },
  {
    id: 'lost-type', tags: ['lesson:type-safe-generic-apis', 'typed-api', 'cast', 'generic-function'], title: 'Fix the Lost Type', bugType: 'runtime', bugLabel: 'Runtime Error: a cast fails because the type was lost', difficulty: 'hard',
    broken: `fun firstOf(list: List<Any>): String {
  return list[0] as String
}

fun main() {
  println(firstOf(listOf(1, 2)))
}`,
    fixed: `fun <T> firstOf(list: List<T>): T {
  return list[0]
}

fun main() {
  println(firstOf(listOf(1, 2)))
}`,
    expected: '1',
  },
];

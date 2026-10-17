/**
 * World 9 (Lambda Lab) practice bank, CODE side: solutions, starters, expected outputs and swaps. Every expected value was
 * derived by hand from Kotlin's rules (written next to the program), NOT copied from the simulator; the bank test
 * (`npm run test:practice-bank`) then runs each program through the engine and compares, and
 * `scripts/practice-content-pass/world9.real.ts` runs every solution and Debug program through real kotlinc.
 * Wording lives in world9.data.ts. A starter holds exactly one single-line `// N. TODO` placeholder per step, which
 * `run.ts apply 9` replaces.
 */
import type { WRSpec, DbgSpec } from './world8.spec';

export const WR_SPECS: WRSpec[] = [
  {
    id: 'tax-and-shipping', difficulty: 'medium', tags: ['lesson:lambda-expressions', 'one-parameter-lambda', 'two-parameter-lambda', 'lambda-result'], title: 'Tax and Shipping', fileName: 'TaxAndShipping.kt',
    solution: `fun main() {
  val basePrice = 80
  val kilos = 4
  val withTax = { price: Int -> price + price / 10 }
  val withShipping = { price: Int, kg: Int -> price + kg * 3 }
  val taxed = withTax(basePrice)
  val total = withShipping(taxed, kilos)
  println("Taxed: " + taxed)
  println("Total: " + total)
}`,
    starter: `fun main() {
  val basePrice = 80
  val kilos = 4

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // taxed = 80 + 80/10 = 88; total = 88 + 4*3 = 100. With basePrice 50: taxed 55, total 55 + 12 = 67.
    expected: 'Taxed: 88\nTotal: 100',
    swap: { variableName: 'basePrice', originalLiteral: '80', alternateLiteral: '50', alternateExpected: 'Taxed: 55\nTotal: 67' },
  },
  {
    id: 'click-counter', difficulty: 'hard', tags: ['lesson:lambda-expressions', 'closure', 'captured-state', 'last-expression'], title: 'Click Counter', fileName: 'ClickCounter.kt',
    solution: `fun main() {
  var clicks = 0
  val limit = 3
  var last = 0
  val onClick = {
    clicks = clicks + 1
    clicks
  }
  for (i in 1..limit) {
    last = onClick()
  }
  val reset = { clicks = 0 }
  println("Last: " + last)
  println("Clicks: " + clicks)
  reset()
  println("After reset: " + clicks)
}`,
    starter: `fun main() {
  var clicks = 0
  val limit = 3
  var last = 0

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO

  // 5. TODO
}`,
    // Three calls: clicks 1, 2, 3 and last = 3. reset sets clicks to 0. With limit 5: last 5, clicks 5.
    expected: 'Last: 3\nClicks: 3\nAfter reset: 0',
    swap: { variableName: 'limit', originalLiteral: '3', alternateLiteral: '5', alternateExpected: 'Last: 5\nClicks: 5\nAfter reset: 0' },
  },
  {
    id: 'grade-label', difficulty: 'medium', tags: ['lesson:anonymous-functions', 'anonymous-function', 'return-in-anonymous-function', 'closure'], title: 'Grade Label', fileName: 'GradeLabel.kt',
    solution: `fun main() {
  val passMark = 50
  val grade = fun(score: Int): String {
    if (score >= passMark) {
      return "Pass"
    }
    return "Fail"
  }
  val high = grade(72)
  val low = grade(41)
  val edge = grade(50)
  println("72: " + high)
  println("41: " + low)
  println("50: " + edge)
}`,
    starter: `fun main() {
  val passMark = 50

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // 72 >= 50 Pass; 41 Fail; 50 >= 50 Pass. With passMark 70: 72 Pass, 41 Fail, 50 Fail.
    expected: '72: Pass\n41: Fail\n50: Pass',
    swap: { variableName: 'passMark', originalLiteral: '50', alternateLiteral: '70', alternateExpected: '72: Pass\n41: Fail\n50: Fail' },
  },
  {
    id: 'big-numbers', difficulty: 'hard', tags: ['lesson:anonymous-functions', 'anonymous-function-argument', 'filter', 'captured-value'], title: 'Big Numbers', fileName: 'BigNumbers.kt',
    solution: `fun main() {
  val limit = 10
  val numbers = listOf(4, 15, 8, 21, 12, 7)
  val big = numbers.filter(fun(n: Int): Boolean {
    return n > limit
  })
  var sum = 0
  for (n in big) {
    sum += n
  }
  println("Big: $big")
  println("Count: " + big.size)
  println("Sum: " + sum)
}`,
    starter: `fun main() {
  val limit = 10
  val numbers = listOf(4, 15, 8, 21, 12, 7)

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // Above 10: 15, 21, 12 (count 3, sum 48). With limit 14: 15, 21 (count 2, sum 36).
    expected: 'Big: [15, 21, 12]\nCount: 3\nSum: 48',
    swap: { variableName: 'limit', originalLiteral: '10', alternateLiteral: '14', alternateExpected: 'Big: [15, 21]\nCount: 2\nSum: 36' },
  },
  {
    id: 'time-split', difficulty: 'medium', tags: ['lesson:function-types', 'explicit-function-type', 'multi-parameter-function-type', 'function-as-argument'], title: 'Time Split', fileName: 'TimeSplit.kt',
    solution: `fun main() {
  val minutes = 135
  val toHours: (Int) -> Int = { m -> m / 60 }
  val leftOver: (Int) -> Int = { m -> m % 60 }
  val label: (Int, Int) -> String = { h, m -> h.toString() + "h " + m + "m" }
  println("Hours: " + toHours(minutes))
  println("Time: " + label(toHours(minutes), leftOver(minutes)))
}`,
    starter: `fun main() {
  val minutes = 135

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // 135 / 60 = 2, 135 % 60 = 15 -> 2h 15m. With 200: 3 hours, 20 left over.
    expected: 'Hours: 2\nTime: 2h 15m',
    swap: { variableName: 'minutes', originalLiteral: '135', alternateLiteral: '200', alternateExpected: 'Hours: 3\nTime: 3h 20m' },
  },
  {
    id: 'op-switch', difficulty: 'hard', tags: ['lesson:function-types', 'function-variable-reassignment', 'nullable-function-type', 'safe-invoke'], title: 'Operation Switch', fileName: 'OpSwitch.kt',
    solution: `fun main() {
  val a = 12
  val b = 5
  var op: (Int, Int) -> Int = { x, y -> x + y }
  val first = op(a, b)
  op = { x, y -> x * y }
  val second = op(a, b)
  var bonus: ((Int) -> Int)? = null
  val plain = bonus?.invoke(second) ?: second
  bonus = { n -> n + 10 }
  val boosted = bonus?.invoke(second) ?: second
  println("Add: " + first)
  println("Multiply: " + second)
  println("No bonus: " + plain)
  println("With bonus: " + boosted)
}`,
    starter: `fun main() {
  val a = 12
  val b = 5

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO

  // 5. TODO
}`,
    // 12 + 5 = 17; 12 * 5 = 60; no bonus function yet so plain = 60; bonus adds 10 so boosted = 70.
    // With a = 9: 14, 45, 45, 55.
    expected: 'Add: 17\nMultiply: 60\nNo bonus: 60\nWith bonus: 70',
    swap: { variableName: 'a', originalLiteral: '12', alternateLiteral: '9', alternateExpected: 'Add: 14\nMultiply: 45\nNo bonus: 45\nWith bonus: 55' },
  },
  {
    id: 'apply-twice', difficulty: 'medium', tags: ['lesson:higher-order-functions', 'function-parameter', 'trailing-lambda', 'calling-a-parameter'], title: 'Apply Twice', fileName: 'ApplyTwice.kt',
    solution: `fun applyTwice(start: Int, step: (Int) -> Int): Int {
  val once = step(start)
  return step(once)
}

fun main() {
  val seed = 3
  val doubled = applyTwice(seed) { n -> n * 2 }
  val shifted = applyTwice(seed) { n -> n + 7 }
  println("Doubled twice: " + doubled)
  println("Shifted twice: " + shifted)
}`,
    starter: `// 1. TODO

fun main() {
  val seed = 3

  // 2. TODO

  // 3. TODO
}`,
    // Doubling: 3 -> 6 -> 12. Adding 7: 3 -> 10 -> 17. With seed 5: 5 -> 10 -> 20 and 5 -> 12 -> 19.
    expected: 'Doubled twice: 12\nShifted twice: 17',
    swap: { variableName: 'seed', originalLiteral: '3', alternateLiteral: '5', alternateExpected: 'Doubled twice: 20\nShifted twice: 19' },
  },
  {
    id: 'fee-factory', difficulty: 'hard', tags: ['lesson:higher-order-functions', 'returning-a-function', 'closure', 'integer-division'], title: 'Fee Factory', fileName: 'FeeFactory.kt',
    solution: `fun makeFee(percent: Int): (Int) -> Int {
  return { amount -> amount * percent / 100 }
}

fun main() {
  val payment = 1500
  val small = 240
  val standard = makeFee(2)
  val premium = makeFee(5)
  println("Standard on " + payment + ": " + standard(payment))
  println("Premium on " + payment + ": " + premium(payment))
  println("Premium on " + small + ": " + premium(small))
}`,
    starter: `// 1. TODO

fun main() {
  val payment = 1500
  val small = 240

  // 2. TODO

  // 3. TODO
}`,
    // 1500 * 2 / 100 = 30; 1500 * 5 / 100 = 75; 240 * 5 / 100 = 1200 / 100 = 12.
    // With payment 900: 900 * 2 / 100 = 18; 900 * 5 / 100 = 45; the small fee stays 12.
    expected: 'Standard on 1500: 30\nPremium on 1500: 75\nPremium on 240: 12',
    swap: { variableName: 'payment', originalLiteral: '1500', alternateLiteral: '900', alternateExpected: 'Standard on 900: 18\nPremium on 900: 45\nPremium on 240: 12' },
  },
  {
    id: 'repeat-action', difficulty: 'medium', tags: ['lesson:higher-order-functions', 'unit-callback', 'captured-state', 'trailing-lambda'], title: 'Repeat Action', fileName: 'RepeatAction.kt',
    solution: `fun repeatAction(times: Int, action: (Int) -> Unit) {
  for (i in 1..times) {
    action(i)
  }
}

fun main() {
  val rounds = 4
  var log = ""
  var total = 0
  repeatAction(rounds) { i ->
    log = log + i + " "
    total += i * i
  }
  println("Log: " + log.trim())
  println("Total: " + total)
}`,
    starter: `// 1. TODO

fun main() {
  val rounds = 4
  var log = ""
  var total = 0

  // 2. TODO

  // 3. TODO
}`,
    // Rounds 1..4: log "1 2 3 4 " (trimmed "1 2 3 4"), total 1 + 4 + 9 + 16 = 30. With rounds 3: "1 2 3" and 1 + 4 + 9 = 14.
    expected: 'Log: 1 2 3 4\nTotal: 30',
    swap: { variableName: 'rounds', originalLiteral: '4', alternateLiteral: '3', alternateExpected: 'Log: 1 2 3\nTotal: 14' },
  },
  {
    id: 'price-tags', difficulty: 'medium', tags: ['lesson:it', 'implicit-parameter', 'map', 'filter'], title: 'Price Tags', fileName: 'PriceTags.kt',
    solution: `fun main() {
  val limit = 30
  val prices = listOf(40, 15, 90, 25)
  val discounted = prices.map { it - it / 5 }
  val cheap = discounted.filter { it < limit }
  println("Discounted: $discounted")
  println("Cheap: $cheap")
}`,
    starter: `fun main() {
  val limit = 30
  val prices = listOf(40, 15, 90, 25)

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // 40 - 8 = 32, 15 - 3 = 12, 90 - 18 = 72, 25 - 5 = 20. Below 30: 12 and 20. With limit 50: 32, 12 and 20.
    expected: 'Discounted: [32, 12, 72, 20]\nCheap: [12, 20]',
    swap: { variableName: 'limit', originalLiteral: '30', alternateLiteral: '50', alternateExpected: 'Discounted: [32, 12, 72, 20]\nCheap: [32, 12, 20]' },
  },
  {
    id: 'row-counts', difficulty: 'hard', tags: ['lesson:it', 'nested-lambdas', 'named-outer-parameter', 'filter'], title: 'Row Counts', fileName: 'RowCounts.kt',
    solution: `fun main() {
  val limit = 50
  val rows = listOf(2, 3)
  val columns = listOf(10, 20, 30)
  val counts = rows.map { row ->
    val big = columns.filter { it * row > limit }
    big.size
  }
  println("Counts: $counts")
}`,
    starter: `fun main() {
  val limit = 50
  val rows = listOf(2, 3)
  val columns = listOf(10, 20, 30)

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // Row 2: 20, 40, 60 -> only 60 is above 50, count 1. Row 3: 30, 60, 90 -> 60 and 90, count 2.
    // With limit 25: row 2 keeps 40 and 60 (2); row 3 keeps 30, 60 and 90 (3).
    expected: 'Counts: [1, 2]',
    swap: { variableName: 'limit', originalLiteral: '50', alternateLiteral: '25', alternateExpected: 'Counts: [2, 3]' },
  },
  {
    id: 'square-labels', difficulty: 'medium', tags: ['lesson:function-references', 'top-level-function-reference', 'map', 'function-chain'], title: 'Square Labels', fileName: 'SquareLabels.kt',
    solution: `fun square(n: Int): Int {
  return n * n
}

fun describe(n: Int): String {
  return "n=" + n
}

fun main() {
  val start = 2
  val numbers = listOf(start, start + 3, start + 7)
  val squares = numbers.map(::square)
  val labels = squares.map(::describe)
  println("Squares: $squares")
  println("Labels: $labels")
}`,
    starter: `// 1. TODO

// 2. TODO

fun main() {
  val start = 2
  val numbers = listOf(start, start + 3, start + 7)

  // 3. TODO

  // 4. TODO

  // 5. TODO
}`,
    // numbers 2, 5, 9 -> squares 4, 25, 81. With start 3: 3, 6, 10 -> 9, 36, 100.
    expected: 'Squares: [4, 25, 81]\nLabels: [n=4, n=25, n=81]',
    swap: { variableName: 'start', originalLiteral: '2', alternateLiteral: '3', alternateExpected: 'Squares: [9, 36, 100]\nLabels: [n=9, n=36, n=100]' },
  },
  {
    id: 'bound-counter', difficulty: 'hard', tags: ['lesson:function-references', 'bound-reference', 'unbound-reference', 'object-state'], title: 'Bound Counter', fileName: 'BoundCounter.kt',
    solution: `class Counter(var value: Int) {
  fun next(): Int {
    value = value + 1
    return value
  }
}

fun main() {
  val start = 10
  val counter = Counter(start)
  val words = listOf("kotlin", "lambda", "it")
  val advance = counter::next
  val shouted = words.map(String::uppercase)
  advance()
  advance()
  val third = advance()
  println("Third: " + third)
  println("Counter: " + counter.value)
  println("Shouted: $shouted")
}`,
    starter: `class Counter(var value: Int) {
  fun next(): Int {
    value = value + 1
    return value
  }
}

fun main() {
  val start = 10
  val counter = Counter(start)
  val words = listOf("kotlin", "lambda", "it")

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO

  // 5. TODO
}`,
    // Counter starts at 10; three calls to next give 11, 12, 13, so third = 13 and counter.value = 13.
    // Upper case of kotlin, lambda, it. With start 20: third 23, counter 23.
    expected: 'Third: 13\nCounter: 13\nShouted: [KOTLIN, LAMBDA, IT]',
    swap: { variableName: 'start', originalLiteral: '10', alternateLiteral: '20', alternateExpected: 'Third: 23\nCounter: 23\nShouted: [KOTLIN, LAMBDA, IT]' },
  },
  {
    id: 'time-of-day', difficulty: 'medium', tags: ['lesson:returning-from-lambdas', 'when-as-last-expression', 'boolean-result', 'lambda-result'], title: 'Time of Day', fileName: 'TimeOfDay.kt',
    solution: `fun main() {
  val hour = 14
  val greeting = { h: Int ->
    when {
      h < 12 -> "Morning"
      h < 18 -> "Afternoon"
      else -> "Evening"
    }
  }
  val isOpen = { h: Int -> h >= 9 && h < 17 }
  println("Now: " + greeting(hour))
  println("Later: " + greeting(hour + 6))
  println("Open: " + isOpen(hour))
}`,
    starter: `fun main() {
  val hour = 14

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // Hour 14 is below 18 -> Afternoon; 20 -> Evening; 14 is within 9..16 -> open.
    // With hour 7: Morning; 13 is Afternoon; 7 is before 9 so closed.
    expected: 'Now: Afternoon\nLater: Evening\nOpen: true',
    swap: { variableName: 'hour', originalLiteral: '14', alternateLiteral: '7', alternateExpected: 'Now: Morning\nLater: Afternoon\nOpen: false' },
  },
  {
    id: 'capped-bonus', difficulty: 'hard', tags: ['lesson:returning-from-lambdas', 'multiline-lambda', 'if-as-last-expression', 'unit-ending-lambda'], title: 'Capped Bonus', fileName: 'CappedBonus.kt',
    solution: `fun main() {
  val cap = 100
  val bonusScore = { base: Int, streak: Int ->
    val bonus = streak * 5
    val total = base + bonus
    if (total > cap) cap else total
  }
  val report = { name: String, score: Int ->
    println(name + ": " + score)
  }
  report("Ana", bonusScore(60, 2))
  report("Bo", bonusScore(90, 4))
}`,
    starter: `fun main() {
  val cap = 100

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // Ana: 60 + 2*5 = 70, below the cap. Bo: 90 + 4*5 = 110, above the cap, so 100. With cap 80: Ana 70, Bo 80.
    expected: 'Ana: 70\nBo: 100',
    swap: { variableName: 'cap', originalLiteral: '100', alternateLiteral: '80', alternateExpected: 'Ana: 70\nBo: 80' },
  },
  {
    id: 'skip-zeros', difficulty: 'medium', tags: ['lesson:local-returns', 'return-at-label', 'skip-one-item', 'captured-state'], title: 'Skip the Zeros', fileName: 'SkipZeros.kt',
    solution: `fun main() {
  val ignored = 0
  val readings = listOf(12, 0, 7, 0, 20)
  var sum = 0
  var skipped = 0
  readings.forEach {
    if (it == ignored) {
      skipped += 1
      return@forEach
    }
    sum += it
  }
  println("Sum: " + sum)
  println("Skipped: " + skipped)
}`,
    starter: `fun main() {
  val ignored = 0
  val readings = listOf(12, 0, 7, 0, 20)
  var sum = 0
  var skipped = 0

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO

  // 5. TODO
}`,
    // Zeros are skipped (2 of them); the rest add up to 12 + 7 + 20 = 39.
    // With ignored 7: only the 7 is skipped (1), and the sum is 12 + 0 + 0 + 20 = 32.
    expected: 'Sum: 39\nSkipped: 2',
    swap: { variableName: 'ignored', originalLiteral: '0', alternateLiteral: '7', alternateExpected: 'Sum: 32\nSkipped: 1' },
  },
  {
    id: 'first-below', difficulty: 'hard', tags: ['lesson:local-returns', 'non-local-return', 'early-exit', 'index-counter'], title: 'First Below the Line', fileName: 'FirstBelow.kt',
    solution: `fun firstBelow(values: List<Int>, threshold: Int): Int {
  var index = 0
  values.forEach {
    if (it < threshold) {
      return index
    }
    index += 1
  }
  return -1
}

fun main() {
  val threshold = 0
  val listA = listOf(4, 9, -2, 8, -5)
  val listB = listOf(3, 1, 6)
  println("Index in A: " + firstBelow(listA, threshold))
  println("Index in B: " + firstBelow(listB, threshold))
}`,
    starter: `fun firstBelow(values: List<Int>, threshold: Int): Int {
  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO

  // 5. TODO
}

fun main() {
  val threshold = 0
  val listA = listOf(4, 9, -2, 8, -5)
  val listB = listOf(3, 1, 6)

  // 6. TODO
}`,
    // List A: 4 and 9 are not below 0 (index reaches 2), then -2 is below 0, so the answer is 2. List B has no value below 0, so -1.
    // With threshold 5: both lists start with a value below 5 (4 and 3), so both answers are 0.
    expected: 'Index in A: 2\nIndex in B: -1',
    swap: { variableName: 'threshold', originalLiteral: '0', alternateLiteral: '5', alternateExpected: 'Index in A: 0\nIndex in B: 0' },
  },
  {
    id: 'order-checks', difficulty: 'hard', tags: ['lesson:inline-functions', 'inline-function', 'non-local-return', 'early-exit'], title: 'Order Checks', fileName: 'OrderChecks.kt',
    solution: `inline fun runIf(condition: Boolean, action: () -> Unit) {
  if (condition) {
    action()
  }
}

fun process(amount: Int): String {
  runIf(amount < 0) {
    return "Invalid"
  }
  runIf(amount > 1000) {
    return "Review"
  }
  return "Accepted"
}

fun main() {
  val large = 2500
  println(process(-5))
  println(process(large))
  println(process(300))
}`,
    starter: `// 1. TODO

fun process(amount: Int): String {
  // 2. TODO

  // 3. TODO

  // 4. TODO
}

fun main() {
  val large = 2500

  // 5. TODO
}`,
    // -5 is below 0 -> Invalid. 2500 is above 1000 -> Review. 300 passes both checks -> Accepted.
    // With large 200: Invalid, Accepted, Accepted.
    expected: 'Invalid\nReview\nAccepted',
    swap: { variableName: 'large', originalLiteral: '2500', alternateLiteral: '200', alternateExpected: 'Invalid\nAccepted\nAccepted' },
  },
  {
    id: 'counted-steps', difficulty: 'medium', tags: ['lesson:inline-functions', 'inline-function', 'lambda-result', 'shared-counter'], title: 'Counted Steps', fileName: 'CountedSteps.kt',
    solution: `var calls = 0

inline fun counted(action: () -> Int): Int {
  calls += 1
  return action()
}

fun main() {
  val base = 6
  val a = counted { base * 2 }
  val b = counted { a + base }
  val c = counted { b - 1 }
  println("Result: " + c)
  println("Calls: " + calls)
}`,
    starter: `var calls = 0

// 1. TODO

fun main() {
  val base = 6

  // 2. TODO

  // 3. TODO

  // 4. TODO

  // 5. TODO
}`,
    // a = 6 * 2 = 12; b = 12 + 6 = 18; c = 18 - 1 = 17; three calls. With base 10: a 20, b 30, c 29; still three calls.
    expected: 'Result: 17\nCalls: 3',
    swap: { variableName: 'base', originalLiteral: '6', alternateLiteral: '10', alternateExpected: 'Result: 29\nCalls: 3' },
  },
  {
    id: 'swap-handler', difficulty: 'medium', tags: ['lesson:noinline', 'noinline-parameter', 'stored-callback', 'top-level-state'], title: 'Swap the Handler', fileName: 'SwapHandler.kt',
    solution: `var handler: (Int) -> String = { n -> "idle " + n }

inline fun install(noinline next: (Int) -> String) {
  handler = next
}

fun main() {
  val code = 7
  println(handler(code))
  install { n -> "ready " + n * 2 }
  println(handler(code))
  install { n -> "done " + (n + 1) }
  println(handler(code))
}`,
    starter: `var handler: (Int) -> String = { n -> "idle " + n }

// 1. TODO

fun main() {
  val code = 7

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // idle 7; then ready 7 * 2 = 14; then done 7 + 1 = 8. With code 10: idle 10, ready 20, done 11.
    expected: 'idle 7\nready 14\ndone 8',
    swap: { variableName: 'code', originalLiteral: '7', alternateLiteral: '10', alternateExpected: 'idle 10\nready 20\ndone 11' },
  },
  {
    id: 'retry-callback', difficulty: 'hard', tags: ['lesson:noinline', 'noinline-parameter', 'returned-callback', 'mixed-callbacks'], title: 'Retry Callback', fileName: 'RetryCallback.kt',
    solution: `inline fun register(onStart: () -> Unit, noinline onDone: () -> String): () -> String {
  onStart()
  return onDone
}

fun main() {
  val retries = 3
  var log = ""
  val finish = register({ log = log + "start;" }, { "Retries: " + retries })
  log = log + "registered;"
  println(log)
  println(finish())
}`,
    starter: `// 1. TODO

fun main() {
  val retries = 3
  var log = ""

  // 2. TODO

  // 3. TODO

  // 4. TODO

  // 5. TODO
}`,
    // onStart runs inside register, so log is "start;" and then "registered;" is added. finish() runs onDone later.
    // With retries 5: the second line becomes "Retries: 5".
    expected: 'start;registered;\nRetries: 3',
    swap: { variableName: 'retries', originalLiteral: '3', alternateLiteral: '5', alternateExpected: 'start;registered;\nRetries: 5' },
  },
  {
    id: 'late-label', difficulty: 'hard', tags: ['lesson:crossinline', 'crossinline-parameter', 'returned-lambda', 'captured-variable'], title: 'Late Label', fileName: 'LateLabel.kt',
    solution: `inline fun labelled(tag: String, crossinline action: () -> String): () -> String {
  val wrapper = { "[" + tag + "] " + action() }
  return wrapper
}

fun main() {
  var orderId = 42
  val receipt = labelled("ORDER") { "id=" + orderId }
  orderId = orderId + 1
  val note = labelled("NOTE") { "paid" }
  println(receipt())
  println(note())
}`,
    starter: `// 1. TODO

fun main() {
  var orderId = 42

  // 2. TODO

  // 3. TODO

  // 4. TODO

  // 5. TODO
}`,
    // receipt() runs after orderId changed, and a lambda reads the variable when it runs: id=43. The note never uses orderId.
    // With orderId 99: id=100.
    expected: '[ORDER] id=43\n[NOTE] paid',
    swap: { variableName: 'orderId', originalLiteral: '42', alternateLiteral: '99', alternateExpected: '[ORDER] id=100\n[NOTE] paid' },
  },
];

export const DBG_SPECS: DbgSpec[] = [
  {
    id: 'stale-fee', tags: ['lesson:lambda-expressions', 'closure', 'value-vs-lambda'], title: 'Fix the Stale Fee', bugType: 'logic', bugLabel: 'Logic Error: a value was computed once instead of a lambda', difficulty: 'medium',
    broken: `fun main() {
  var rate = 5
  val fee = rate * 2
  rate = 8
  println("Fee: " + fee)
}`,
    fixed: `fun main() {
  var rate = 5
  val fee = { rate * 2 }
  rate = 8
  println("Fee: " + fee())
}`,
    // Broken: fee is 5 * 2 = 10 at the moment it is declared. Fixed: the lambda reads rate when it runs, 8 * 2 = 16.
    expected: 'Fee: 16',
  },
  {
    id: 'missing-argument', tags: ['lesson:lambda-expressions', 'two-parameter-lambda', 'call-arity'], title: 'Fix the Missing Argument', bugType: 'type', bugLabel: 'Compile Error: a parameter has no value', difficulty: 'medium',
    broken: `fun main() {
  val add = { a: Int, b: Int -> a + b }
  val result = add(5)
  println("Sum: " + result)
}`,
    fixed: `fun main() {
  val add = { a: Int, b: Int -> a + b }
  val result = add(5, 3)
  println("Sum: " + result)
}`,
    expected: 'Sum: 8',
  },
  {
    id: 'return-in-lambda', tags: ['lesson:anonymous-functions', 'return-not-allowed', 'anonymous-function'], title: 'Fix the Return in the Lambda', bugType: 'syntax', bugLabel: 'Compile Error: a lambda cannot use a plain return', difficulty: 'medium',
    broken: `fun main() {
  val sign = { n: Int ->
    if (n < 0) {
      return "negative"
    }
    "not negative"
  }
  println(sign(-4))
  println(sign(9))
}`,
    fixed: `fun main() {
  val sign = fun(n: Int): String {
    if (n < 0) {
      return "negative"
    }
    return "not negative"
  }
  println(sign(-4))
  println(sign(9))
}`,
    expected: 'negative\nnot negative',
  },
  {
    id: 'wrong-arity-type', tags: ['lesson:function-types', 'parameter-count', 'explicit-function-type'], title: 'Fix the Function Type', bugType: 'type', bugLabel: 'Compile Error: the type has one parameter but the lambda has two', difficulty: 'medium',
    broken: `fun main() {
  val combine: (Int) -> Int = { a, b -> a + b }
  println("Total: " + combine(4, 6))
}`,
    fixed: `fun main() {
  val combine: (Int, Int) -> Int = { a, b -> a + b }
  println("Total: " + combine(4, 6))
}`,
    expected: 'Total: 10',
  },
  {
    id: 'restarting-steps', tags: ['lesson:higher-order-functions', 'loop-with-callback', 'running-value'], title: 'Fix the Restarting Steps', bugType: 'logic', bugLabel: 'Logic Error: every step starts again from the first value', difficulty: 'hard',
    broken: `fun repeatStep(start: Int, times: Int, step: (Int) -> Int): Int {
  var current = start
  for (i in 1..times) {
    current = step(start)
  }
  return current
}

fun main() {
  val result = repeatStep(2, 3) { n -> n * 3 }
  println("Result: " + result)
}`,
    fixed: `fun repeatStep(start: Int, times: Int, step: (Int) -> Int): Int {
  var current = start
  for (i in 1..times) {
    current = step(current)
  }
  return current
}

fun main() {
  val result = repeatStep(2, 3) { n -> n * 3 }
  println("Result: " + result)
}`,
    // Broken: step(2) = 6 every time, so 6. Fixed: 2 -> 6 -> 18 -> 54.
    expected: 'Result: 54',
  },
  {
    id: 'it-with-name', tags: ['lesson:it', 'named-parameter-vs-it', 'unresolved-reference'], title: 'Fix the Missing it', bugType: 'type', bugLabel: 'Compile Error: it does not exist when the parameter has a name', difficulty: 'medium',
    broken: `fun main() {
  val prices = listOf(20, 35, 50)
  val doubled = prices.map { price -> it * 2 }
  println("Doubled: $doubled")
}`,
    fixed: `fun main() {
  val prices = listOf(20, 35, 50)
  val doubled = prices.map { it * 2 }
  println("Doubled: $doubled")
}`,
    expected: 'Doubled: [40, 70, 100]',
  },
  {
    id: 'reference-arity', tags: ['lesson:function-references', 'reference-signature', 'function-type-match'], title: 'Fix the Function Reference', bugType: 'type', bugLabel: 'Compile Error: the function needs two arguments but the type gives one', difficulty: 'medium',
    broken: `fun label(n: Int, width: Int): String {
  return "#" + n + "/" + width
}

fun main() {
  val format: (Int) -> String = ::label
  println(format(1))
  println(format(2))
}`,
    fixed: `fun label(n: Int, width: Int): String {
  return "#" + n + "/" + width
}

fun main() {
  val format: (Int) -> String = { label(it, 3) }
  println(format(1))
  println(format(2))
}`,
    expected: '#1/3\n#2/3',
  },
  {
    id: 'no-final-value', tags: ['lesson:returning-from-lambdas', 'last-expression', 'unit-vs-int'], title: 'Fix the Missing Result', bugType: 'type', bugLabel: 'Compile Error: the lambda ends with println, so it returns Unit, not Int', difficulty: 'medium',
    broken: `fun main() {
  val area: (Int, Int) -> Int = { w, h ->
    val result = w * h
    println("Computed " + result)
  }
  println("Area: " + area(4, 6))
}`,
    fixed: `fun main() {
  val area: (Int, Int) -> Int = { w, h ->
    val result = w * h
    println("Computed " + result)
    result
  }
  println("Area: " + area(4, 6))
}`,
    expected: 'Computed 24\nArea: 24',
  },
  {
    id: 'stops-too-late', tags: ['lesson:local-returns', 'return-at-label', 'non-local-return', 'early-exit'], title: 'Fix the Late Stop', bugType: 'logic', bugLabel: 'Logic Error: the label only skips one item', difficulty: 'hard',
    broken: `fun sumBeforeNegative(values: List<Int>): Int {
  var sum = 0
  values.forEach {
    if (it < 0) {
      return@forEach
    }
    sum += it
  }
  return sum
}

fun main() {
  println("Sum: " + sumBeforeNegative(listOf(5, 8, -1, 4)))
}`,
    fixed: `fun sumBeforeNegative(values: List<Int>): Int {
  var sum = 0
  values.forEach {
    if (it < 0) {
      return sum
    }
    sum += it
  }
  return sum
}

fun main() {
  println("Sum: " + sumBeforeNegative(listOf(5, 8, -1, 4)))
}`,
    // Broken: only -1 is skipped, so 5 + 8 + 4 = 17. Fixed: stops at -1 with 5 + 8 = 13.
    expected: 'Sum: 13',
  },
  {
    id: 'early-exit-main', tags: ['lesson:inline-functions', 'non-local-return', 'return-at-label'], title: 'Fix the Early Exit', bugType: 'logic', bugLabel: 'Logic Error: return leaves main, not just the lambda', difficulty: 'hard',
    broken: `inline fun task(name: String, action: () -> Unit) {
  println("Start " + name)
  action()
  println("End " + name)
}

fun main() {
  task("export") {
    println("working")
    return
  }
  println("Done")
}`,
    fixed: `inline fun task(name: String, action: () -> Unit) {
  println("Start " + name)
  action()
  println("End " + name)
}

fun main() {
  task("export") {
    println("working")
    return@task
  }
  println("Done")
}`,
    // Broken: the plain return leaves main, so it prints only Start export and working.
    expected: 'Start export\nworking\nEnd export\nDone',
  },
  {
    id: 'unsaved-callback', tags: ['lesson:noinline', 'storing-inline-parameter', 'noinline-parameter'], title: 'Fix the Unsaved Callback', bugType: 'type', bugLabel: 'Compile Error: an inline parameter cannot be stored', difficulty: 'medium',
    broken: `var saved: () -> Unit = { }

inline fun remember(action: () -> Unit) {
  saved = action
}

fun main() {
  remember { println("Saved action ran") }
  saved()
}`,
    fixed: `var saved: () -> Unit = { }

inline fun remember(noinline action: () -> Unit) {
  saved = action
}

fun main() {
  remember { println("Saved action ran") }
  saved()
}`,
    expected: 'Saved action ran',
  },
  {
    id: 'wrapped-call', tags: ['lesson:crossinline', 'calling-inside-another-lambda', 'crossinline-parameter'], title: 'Fix the Wrapped Call', bugType: 'type', bugLabel: 'Compile Error: an inline parameter is called inside another lambda', difficulty: 'medium',
    broken: `inline fun later(action: () -> Unit): () -> Unit {
  return { action() }
}

fun main() {
  val job = later { println("Run job") }
  job()
}`,
    fixed: `inline fun later(crossinline action: () -> Unit): () -> Unit {
  return { action() }
}

fun main() {
  val job = later { println("Run job") }
  job()
}`,
    expected: 'Run job',
  },
];

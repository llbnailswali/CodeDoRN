/**
 * World 10 (Collection Wizardry) practice bank, CODE side: solutions, starters, expected outputs and swaps. Every expected value
 * was derived by hand from Kotlin's rules (written next to the program), NOT copied from the simulator; the bank test
 * (`npm run test:practice-bank`) then runs each program through the engine and compares, and
 * `scripts/practice-content-pass/world10.real.ts` runs every solution and Debug program through real kotlinc.
 * Wording lives in world10.data.ts. Collections are printed with string templates (see PITFALLS.md: `"text" + list`).
 */
import type { WRSpec, DbgSpec } from './world8.spec';

export const WR_SPECS: WRSpec[] = [
  {
    id: 'cart-totals', difficulty: 'medium', tags: ['lesson:map-mapnotnull-filter', 'map', 'filter', 'chain'], title: 'Cart Totals', fileName: 'CartTotals.kt',
    solution: `fun main() {
  val limit = 20
  val prices = listOf(12, 40, 7, 25)
  val withTax = prices.map { it + it / 10 }
  val big = withTax.filter { it > limit }
  println("With tax: $withTax")
  println("Big: $big")
}`,
    starter: `fun main() {
  val limit = 20
  val prices = listOf(12, 40, 7, 25)

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // withTax = [13, 44, 7, 27]; above 20: [44, 27]. With limit 10: [13, 44, 27].
    expected: 'With tax: [13, 44, 7, 27]\nBig: [44, 27]',
    swap: { variableName: 'limit', originalLiteral: '20', alternateLiteral: '10', alternateExpected: 'With tax: [13, 44, 7, 27]\nBig: [13, 44, 27]' },
  },
  {
    id: 'valid-ages', difficulty: 'hard', tags: ['lesson:map-mapnotnull-filter', 'mapNotNull', 'toIntOrNull', 'filter'], title: 'Valid Ages', fileName: 'ValidAges.kt',
    solution: `fun main() {
  val minAge = 18
  val raw = listOf("12", "x", "30", "", "7")
  val ages = raw.mapNotNull { it.toIntOrNull() }
  val adults = ages.filter { it >= minAge }
  val skipped = raw.size - ages.size
  println("Ages: $ages")
  println("Adults: $adults")
  println("Skipped: " + skipped)
}`,
    starter: `fun main() {
  val minAge = 18
  val raw = listOf("12", "x", "30", "", "7")

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // ages = [12, 30, 7]; adults (>= 18) = [30]; skipped = 5 - 3 = 2. With minAge 10: adults [12, 30].
    expected: 'Ages: [12, 30, 7]\nAdults: [30]\nSkipped: 2',
    swap: { variableName: 'minAge', originalLiteral: '18', alternateLiteral: '10', alternateExpected: 'Ages: [12, 30, 7]\nAdults: [12, 30]\nSkipped: 2' },
  },
  {
    id: 'mixed-bag', difficulty: 'medium', tags: ['lesson:filternot-filterisinstance-flatmap', 'filterIsInstance', 'filterNot'], title: 'Mixed Bag', fileName: 'MixedBag.kt',
    solution: `fun main() {
  val limit = 3
  val items: List<Any> = listOf("tea", true, "milk", false, "cola")
  val texts = items.filterIsInstance<String>()
  val flags = items.filterIsInstance<Boolean>()
  val short = texts.filterNot { it.length > limit }
  println("Texts: $texts")
  println("Flags: $flags")
  println("Short: $short")
}`,
    starter: `fun main() {
  val limit = 3
  val items: List<Any> = listOf("tea", true, "milk", false, "cola")

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // texts [tea, milk, cola]; flags [true, false]; filterNot (length > 3) keeps [tea]. With limit 4: all three texts stay.
    expected: 'Texts: [tea, milk, cola]\nFlags: [true, false]\nShort: [tea]',
    swap: { variableName: 'limit', originalLiteral: '3', alternateLiteral: '4', alternateExpected: 'Texts: [tea, milk, cola]\nFlags: [true, false]\nShort: [tea, milk, cola]' },
  },
  {
    id: 'split-parts', difficulty: 'hard', tags: ['lesson:filternot-filterisinstance-flatmap', 'flatMap', 'filterNot', 'split'], title: 'Split Parts', fileName: 'SplitParts.kt',
    solution: `fun main() {
  val minLen = 2
  val phrases = listOf("a bb", "ccc d", "ee")
  val parts = phrases.flatMap { it.split(" ") }
  val kept = parts.filterNot { it.length < minLen }
  println("Parts: $parts")
  println("Kept: $kept")
}`,
    starter: `fun main() {
  val minLen = 2
  val phrases = listOf("a bb", "ccc d", "ee")

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // parts = [a, bb, ccc, d, ee]; dropping lengths below 2 keeps [bb, ccc, ee]. With minLen 3: [ccc].
    expected: 'Parts: [a, bb, ccc, d, ee]\nKept: [bb, ccc, ee]',
    swap: { variableName: 'minLen', originalLiteral: '2', alternateLiteral: '3', alternateExpected: 'Parts: [a, bb, ccc, d, ee]\nKept: [ccc]' },
  },
  {
    id: 'batch-totals', difficulty: 'medium', tags: ['lesson:flatten-reduce-fold', 'flatten', 'reduce', 'fold'], title: 'Batch Totals', fileName: 'BatchTotals.kt',
    solution: `fun main() {
  val base = 100
  val batches = listOf(listOf(4, 6), listOf(10), listOf(3, 7, 5))
  val all = batches.flatten()
  val total = all.reduce { acc, n -> acc + n }
  val withBase = all.fold(base) { acc, n -> acc + n }
  println("All: $all")
  println("Total: " + total)
  println("With base: " + withBase)
}`,
    starter: `fun main() {
  val base = 100
  val batches = listOf(listOf(4, 6), listOf(10), listOf(3, 7, 5))

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // all = [4, 6, 10, 3, 7, 5]; sum 35; fold from 100 gives 135. With base 50: 85.
    expected: 'All: [4, 6, 10, 3, 7, 5]\nTotal: 35\nWith base: 135',
    swap: { variableName: 'base', originalLiteral: '100', alternateLiteral: '50', alternateExpected: 'All: [4, 6, 10, 3, 7, 5]\nTotal: 35\nWith base: 85' },
  },
  {
    id: 'score-folds', difficulty: 'hard', tags: ['lesson:flatten-reduce-fold', 'fold', 'reduce', 'accumulator'], title: 'Score Folds', fileName: 'ScoreFolds.kt',
    solution: `fun main() {
  val passMark = 65
  val scores = listOf(55, 80, 62, 91, 70)
  val passed = scores.fold(0) { count, s -> if (s >= passMark) count + 1 else count }
  val best = scores.reduce { a, b -> if (b > a) b else a }
  val text = scores.fold("") { acc, s -> acc + s + ";" }
  println("Passed: " + passed)
  println("Best: " + best)
  println("Text: " + text)
}`,
    starter: `fun main() {
  val passMark = 65
  val scores = listOf(55, 80, 62, 91, 70)

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // 80, 91 and 70 are at least 65 so passed = 3; best = 91; text = "55;80;62;91;70;". With passMark 75: passed 2.
    expected: 'Passed: 3\nBest: 91\nText: 55;80;62;91;70;',
    swap: { variableName: 'passMark', originalLiteral: '65', alternateLiteral: '75', alternateExpected: 'Passed: 2\nBest: 91\nText: 55;80;62;91;70;' },
  },
  {
    id: 'group-lengths', difficulty: 'medium', tags: ['lesson:groupby-associate-partition', 'groupBy', 'map-lookup'], title: 'Group by Length', fileName: 'GroupLengths.kt',
    solution: `fun main() {
  val key = 4
  val words = listOf("tea", "coffee", "milk", "juice", "cola", "water")
  val groups = words.groupBy { it.length }
  val found = groups[key]
  println("Groups: $groups")
  println("Length $key: $found")
}`,
    starter: `fun main() {
  val key = 4
  val words = listOf("tea", "coffee", "milk", "juice", "cola", "water")

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // Keys appear in first-seen order: 3, 6, 4, 5. Length 4 holds milk and cola. With key 5: juice and water.
    expected: 'Groups: {3=[tea], 6=[coffee], 4=[milk, cola], 5=[juice, water]}\nLength 4: [milk, cola]',
    swap: { variableName: 'key', originalLiteral: '4', alternateLiteral: '5', alternateExpected: 'Groups: {3=[tea], 6=[coffee], 4=[milk, cola], 5=[juice, water]}\nLength 5: [juice, water]' },
  },
  {
    id: 'pass-split', difficulty: 'hard', tags: ['lesson:groupby-associate-partition', 'partition', 'associate', 'destructuring'], title: 'Pass Split', fileName: 'PassSplit.kt',
    solution: `fun main() {
  val passMark = 50
  val marks = listOf(72, 45, 88, 50, 31)
  val (passed, failed) = marks.partition { it >= passMark }
  val gaps = passed.associate { it to it - passMark }
  println("Passed: $passed")
  println("Failed: $failed")
  println("Gaps: $gaps")
}`,
    starter: `fun main() {
  val passMark = 50
  val marks = listOf(72, 45, 88, 50, 31)

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // passed [72, 88, 50], failed [45, 31]; gaps 22, 38, 0. With passMark 60: passed [72, 88], failed [45, 50, 31], gaps 12, 28.
    expected: 'Passed: [72, 88, 50]\nFailed: [45, 31]\nGaps: {72=22, 88=38, 50=0}',
    swap: { variableName: 'passMark', originalLiteral: '50', alternateLiteral: '60', alternateExpected: 'Passed: [72, 88]\nFailed: [45, 50, 31]\nGaps: {72=12, 88=28}' },
  },
  {
    id: 'name-scores', difficulty: 'medium', tags: ['lesson:zip-chunked-windowed', 'zip', 'pair', 'filter'], title: 'Name Scores', fileName: 'NameScores.kt',
    solution: `fun main() {
  val cutoff = 65
  val names = listOf("Ana", "Bo", "Cy")
  val scores = listOf(70, 85, 60)
  val pairs = names.zip(scores)
  val strong = pairs.filter { it.second > cutoff }
  println("Pairs: $pairs")
  println("Strong: $strong")
}`,
    starter: `fun main() {
  val cutoff = 65
  val names = listOf("Ana", "Bo", "Cy")
  val scores = listOf(70, 85, 60)

  // 1. TODO

  // 2. TODO

  // 3. TODO
}`,
    // Pairs are (Ana, 70), (Bo, 85), (Cy, 60); above 65: Ana and Bo. With cutoff 80: only Bo.
    expected: 'Pairs: [(Ana, 70), (Bo, 85), (Cy, 60)]\nStrong: [(Ana, 70), (Bo, 85)]',
    swap: { variableName: 'cutoff', originalLiteral: '65', alternateLiteral: '80', alternateExpected: 'Pairs: [(Ana, 70), (Bo, 85), (Cy, 60)]\nStrong: [(Bo, 85)]' },
  },
  {
    id: 'chunk-window', difficulty: 'hard', tags: ['lesson:zip-chunked-windowed', 'chunked', 'windowed', 'sum'], title: 'Chunks and Windows', fileName: 'ChunkWindow.kt',
    solution: `fun main() {
  val size = 3
  val readings = listOf(2, 4, 6, 8, 10, 12, 14)
  val chunks = readings.chunked(size)
  val windows = readings.windowed(size)
  val sums = windows.map { it.sum() }
  println("Chunks: $chunks")
  println("Windows: " + windows.size)
  println("Sums: $sums")
}`,
    starter: `fun main() {
  val size = 3
  val readings = listOf(2, 4, 6, 8, 10, 12, 14)

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // Size 3: chunks [[2,4,6],[8,10,12],[14]]; 5 windows with sums 12, 18, 24, 30, 36. Size 4: chunks [[2,4,6,8],[10,12,14]]; 4 windows with sums 20, 28, 36, 44.
    expected: 'Chunks: [[2, 4, 6], [8, 10, 12], [14]]\nWindows: 5\nSums: [12, 18, 24, 30, 36]',
    swap: { variableName: 'size', originalLiteral: '3', alternateLiteral: '4', alternateExpected: 'Chunks: [[2, 4, 6, 8], [10, 12, 14]]\nWindows: 4\nSums: [20, 28, 36, 44]' },
  },
  {
    id: 'unique-tags', difficulty: 'medium', tags: ['lesson:distinct-sorted', 'distinct', 'sorted', 'sortedDescending', 'take'], title: 'Unique Tags', fileName: 'UniqueTags.kt',
    solution: `fun main() {
  val limit = 2
  val tags = listOf(5, 3, 5, 9, 3, 1)
  val unique = tags.distinct()
  val ascending = unique.sorted()
  val top = unique.sortedDescending().take(limit)
  println("Unique: $unique")
  println("Ascending: $ascending")
  println("Top: $top")
}`,
    starter: `fun main() {
  val limit = 2
  val tags = listOf(5, 3, 5, 9, 3, 1)

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // unique [5, 3, 9, 1]; ascending [1, 3, 5, 9]; top two [9, 5]. With limit 3: [9, 5, 3].
    expected: 'Unique: [5, 3, 9, 1]\nAscending: [1, 3, 5, 9]\nTop: [9, 5]',
    swap: { variableName: 'limit', originalLiteral: '2', alternateLiteral: '3', alternateExpected: 'Unique: [5, 3, 9, 1]\nAscending: [1, 3, 5, 9]\nTop: [9, 5, 3]' },
  },
  {
    id: 'sort-words', difficulty: 'hard', tags: ['lesson:distinct-sorted', 'distinctBy', 'sorted', 'take'], title: 'Sort the Words', fileName: 'SortWords.kt',
    solution: `fun main() {
  val top = 2
  val words = listOf("pear", "fig", "apple", "fig", "kiwi")
  val unique = words.distinct()
  val sortedWords = unique.sorted()
  val firstWords = sortedWords.take(top)
  val byLength = words.distinctBy { it.length }
  val repeats = words.size - unique.size
  println("Sorted: $sortedWords")
  println("First: $firstWords")
  println("By length: $byLength")
  println("Repeats: " + repeats)
}`,
    starter: `fun main() {
  val top = 2
  val words = listOf("pear", "fig", "apple", "fig", "kiwi")

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO

  // 5. TODO
}`,
    // unique [pear, fig, apple, kiwi]; sorted [apple, fig, kiwi, pear]; first two [apple, fig]; first word of each length [pear, fig, apple]; 5 - 4 = 1 repeat. With top 3: [apple, fig, kiwi].
    expected: 'Sorted: [apple, fig, kiwi, pear]\nFirst: [apple, fig]\nBy length: [pear, fig, apple]\nRepeats: 1',
    swap: { variableName: 'top', originalLiteral: '2', alternateLiteral: '3', alternateExpected: 'Sorted: [apple, fig, kiwi, pear]\nFirst: [apple, fig, kiwi]\nBy length: [pear, fig, apple]\nRepeats: 1' },
  },
  {
    id: 'budget-shelf', difficulty: 'medium', tags: ['lesson:sortedby-min-max', 'sortedBy', 'minByOrNull', 'maxByOrNull', 'class-list'], title: 'Budget Shelf', fileName: 'BudgetShelf.kt',
    solution: `class Item(val name: String, val price: Int)

fun main() {
  val budget = 35
  val items = listOf(Item("pen", 12), Item("book", 45), Item("cap", 8), Item("bag", 30))
  val byPrice = items.sortedBy { it.price }.map { it.name }
  val cheapest = items.minByOrNull { it.price }
  val priciest = items.maxByOrNull { it.price }
  val affordable = items.filter { it.price <= budget }.sortedByDescending { it.price }.map { it.name }
  println("By price: $byPrice")
  println("Cheapest: " + (cheapest?.name ?: "none"))
  println("Priciest: " + (priciest?.name ?: "none"))
  println("Affordable: $affordable")
}`,
    starter: `class Item(val name: String, val price: Int)

fun main() {
  val budget = 35
  val items = listOf(Item("pen", 12), Item("book", 45), Item("cap", 8), Item("bag", 30))

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO

  // 5. TODO
}`,
    // By price: cap 8, pen 12, bag 30, book 45. Within 35, dearest first: bag, pen, cap. With budget 15: pen, cap.
    expected: 'By price: [cap, pen, bag, book]\nCheapest: cap\nPriciest: book\nAffordable: [bag, pen, cap]',
    swap: { variableName: 'budget', originalLiteral: '35', alternateLiteral: '15', alternateExpected: 'By price: [cap, pen, bag, book]\nCheapest: cap\nPriciest: book\nAffordable: [pen, cap]' },
  },
  {
    id: 'min-max-range', difficulty: 'hard', tags: ['lesson:sortedby-min-max', 'min', 'max', 'filter', 'spread'], title: 'Min, Max and Spread', fileName: 'MinMaxRange.kt',
    solution: `fun main() {
  val threshold = 5
  val values = listOf(14, 3, 27, 9)
  val low = values.min()
  val high = values.max()
  val spread = high - low
  val above = values.filter { it > low + threshold }
  println("Low: " + low)
  println("High: " + high)
  println("Spread: " + spread)
  println("Above: $above")
}`,
    starter: `fun main() {
  val threshold = 5
  val values = listOf(14, 3, 27, 9)

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // low 3, high 27, spread 24; above 3 + 5 = 8: [14, 27, 9]. With threshold 10: above 13: [14, 27].
    expected: 'Low: 3\nHigh: 27\nSpread: 24\nAbove: [14, 27, 9]',
    swap: { variableName: 'threshold', originalLiteral: '5', alternateLiteral: '10', alternateExpected: 'Low: 3\nHigh: 27\nSpread: 24\nAbove: [14, 27]' },
  },
  {
    id: 'basket-stats', difficulty: 'medium', tags: ['lesson:sum-average-any-all-none', 'sum', 'average', 'any', 'all', 'none'], title: 'Basket Stats', fileName: 'BasketStats.kt',
    solution: `fun main() {
  val limit = 45
  val prices = listOf(20, 35, 15, 50)
  val total = prices.sum()
  val average = prices.average()
  val anyBig = prices.any { it > limit }
  val allPaid = prices.all { it >= 10 }
  val noneFree = prices.none { it == 0 }
  println("Sum: " + total)
  println("Average: " + average)
  println("Any above $limit: " + anyBig)
  println("All at least 10: " + allPaid)
  println("None free: " + noneFree)
}`,
    starter: `fun main() {
  val limit = 45
  val prices = listOf(20, 35, 15, 50)

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO

  // 5. TODO

  // 6. TODO
}`,
    // sum 120; average 120 / 4 = 30.0; 50 is above 45 so any = true; all at least 10 true; none equal 0 true. With limit 60: any above 60 is false.
    expected: 'Sum: 120\nAverage: 30.0\nAny above 45: true\nAll at least 10: true\nNone free: true',
    swap: { variableName: 'limit', originalLiteral: '45', alternateLiteral: '60', alternateExpected: 'Sum: 120\nAverage: 30.0\nAny above 60: false\nAll at least 10: true\nNone free: true' },
  },
  {
    id: 'class-checks', difficulty: 'hard', tags: ['lesson:sum-average-any-all-none', 'all', 'any', 'none', 'nested-lists', 'sum'], title: 'Class Checks', fileName: 'ClassChecks.kt',
    solution: `fun main() {
  val passMark = 60
  val classes = listOf(listOf(80, 90, 70), listOf(60, 95), listOf(88))
  val totals = classes.map { it.sum() }
  val allPass = classes.all { c -> c.all { it >= passMark } }
  val anyTop = classes.any { c -> c.any { it > 90 } }
  val noneEmpty = classes.none { it.isEmpty() }
  println("Totals: $totals")
  println("All pass: " + allPass)
  println("Any top: " + anyTop)
  println("None empty: " + noneEmpty)
}`,
    starter: `fun main() {
  val passMark = 60
  val classes = listOf(listOf(80, 90, 70), listOf(60, 95), listOf(88))

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO

  // 5. TODO
}`,
    // totals 240, 155, 88; every mark is at least 60 (60 counts) so all pass = true; 95 is above 90; no class is empty. With passMark 65 the mark 60 fails, so all pass = false.
    expected: 'Totals: [240, 155, 88]\nAll pass: true\nAny top: true\nNone empty: true',
    swap: { variableName: 'passMark', originalLiteral: '60', alternateLiteral: '65', alternateExpected: 'Totals: [240, 155, 88]\nAll pass: false\nAny top: true\nNone empty: true' },
  },
  {
    id: 'first-hit', difficulty: 'medium', tags: ['lesson:first-find-collection-pipelines-and-chai', 'first', 'find', 'last', 'elvis'], title: 'First Hit', fileName: 'FirstHit.kt',
    solution: `fun main() {
  val limit = 30
  val temps = listOf(18, 25, 31, 22, 35)
  val first = temps.first()
  val firstAbove = temps.first { it > limit }
  val far = temps.find { it > limit + 10 }
  val last = temps.last()
  println("First: " + first)
  println("First above: " + firstAbove)
  println("Far above: " + (far ?: -1))
  println("Last: " + last)
}`,
    starter: `fun main() {
  val limit = 30
  val temps = listOf(18, 25, 31, 22, 35)

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO

  // 5. TODO
}`,
    // first 18; first above 30 is 31; nothing above 40 so find gives null and the elvis uses -1; last 35. With limit 20: first above 25; first above 30 is 31.
    expected: 'First: 18\nFirst above: 31\nFar above: -1\nLast: 35',
    swap: { variableName: 'limit', originalLiteral: '30', alternateLiteral: '20', alternateExpected: 'First: 18\nFirst above: 25\nFar above: 31\nLast: 35' },
  },
  {
    id: 'top-orders', difficulty: 'hard', tags: ['lesson:first-find-collection-pipelines-and-chai', 'pipeline', 'filter', 'map', 'sortedDescending', 'take', 'sum'], title: 'Top Orders', fileName: 'TopOrders.kt',
    solution: `fun main() {
  val minOrder = 50
  val orders = listOf(120, 45, 300, 80, 210, 15)
  val discounted = orders.filter { it >= minOrder }.map { it - it / 10 }
  val top = discounted.sortedDescending().take(3)
  val total = top.sum()
  println("Discounted: $discounted")
  println("Top: $top")
  println("Total: " + total)
}`,
    starter: `fun main() {
  val minOrder = 50
  val orders = listOf(120, 45, 300, 80, 210, 15)

  // 1. TODO

  // 2. TODO

  // 3. TODO

  // 4. TODO
}`,
    // Kept 120, 300, 80, 210; after 10% off 108, 270, 72, 189; top three 270, 189, 108; total 567. With minOrder 200: kept 300, 210 -> 270, 189; total 459.
    expected: 'Discounted: [108, 270, 72, 189]\nTop: [270, 189, 108]\nTotal: 567',
    swap: { variableName: 'minOrder', originalLiteral: '50', alternateLiteral: '200', alternateExpected: 'Discounted: [270, 189]\nTop: [270, 189]\nTotal: 459' },
  },
];

export const DBG_SPECS: DbgSpec[] = [
  {
    id: 'wrong-tool', tags: ['lesson:map-mapnotnull-filter', 'map-vs-filter'], title: 'Fix the Wrong Tool', bugType: 'logic', bugLabel: 'Logic Error: map was used where filter is needed', difficulty: 'medium',
    broken: `fun main() {
  val prices = listOf(12, 40, 7, 25)
  val big = prices.map { it > 20 }
  println("Big: $big")
}`,
    fixed: `fun main() {
  val prices = listOf(12, 40, 7, 25)
  val big = prices.filter { it > 20 }
  println("Big: $big")
}`,
    expected: 'Big: [40, 25]',
  },
  {
    id: 'null-survivors', tags: ['lesson:map-mapnotnull-filter', 'mapNotNull', 'toIntOrNull'], title: 'Fix the Null Survivors', bugType: 'logic', bugLabel: 'Logic Error: null results stay in the list', difficulty: 'medium',
    broken: `fun main() {
  val raw = listOf("12", "x", "30")
  val ages = raw.map { it.toIntOrNull() }
  println("Ages: $ages")
}`,
    fixed: `fun main() {
  val raw = listOf("12", "x", "30")
  val ages = raw.mapNotNull { it.toIntOrNull() }
  println("Ages: $ages")
}`,
    expected: 'Ages: [12, 30]',
  },
  {
    id: 'negatives-kept', tags: ['lesson:filternot-filterisinstance-flatmap', 'filterNot', 'condition'], title: 'Fix the Kept Negatives', bugType: 'logic', bugLabel: 'Logic Error: filterNot keeps the wrong values', difficulty: 'medium',
    broken: `fun main() {
  val readings = listOf(4, -3, 0, -8, 9)
  val valid = readings.filterNot { it >= 0 }
  println("Valid: $valid")
}`,
    fixed: `fun main() {
  val readings = listOf(4, -3, 0, -8, 9)
  val valid = readings.filterNot { it < 0 }
  println("Valid: $valid")
}`,
    expected: 'Valid: [4, 0, 9]',
  },
  {
    id: 'nested-parts', tags: ['lesson:filternot-filterisinstance-flatmap', 'flatMap', 'nested-list'], title: 'Fix the Nested Words', bugType: 'logic', bugLabel: 'Logic Error: map leaves lists inside a list', difficulty: 'medium',
    broken: `fun main() {
  val phrases = listOf("a b", "c")
  val words = phrases.map { it.split(" ") }
  println("Words: $words")
  println("Count: " + words.size)
}`,
    fixed: `fun main() {
  val phrases = listOf("a b", "c")
  val words = phrases.flatMap { it.split(" ") }
  println("Words: $words")
  println("Count: " + words.size)
}`,
    expected: 'Words: [a, b, c]\nCount: 3',
  },
  {
    id: 'empty-reduce', tags: ['lesson:flatten-reduce-fold', 'reduce-vs-fold', 'empty-collection'], title: 'Fix the Empty Total', bugType: 'runtime', bugLabel: 'Runtime Error: reduce fails on an empty list', difficulty: 'medium',
    broken: `fun main() {
  val bonuses = listOf<Int>()
  val total = bonuses.reduce { acc, n -> acc + n }
  println("Total: " + total)
}`,
    fixed: `fun main() {
  val bonuses = listOf<Int>()
  val total = bonuses.fold(0) { acc, n -> acc + n }
  println("Total: " + total)
}`,
    expected: 'Total: 0',
  },
  {
    id: 'lost-words', tags: ['lesson:groupby-associate-partition', 'associate-vs-groupBy', 'duplicate-keys'], title: 'Fix the Lost Words', bugType: 'logic', bugLabel: 'Logic Error: associate overwrites repeated keys', difficulty: 'hard',
    broken: `fun main() {
  val words = listOf("fig", "kiwi", "plum", "pear", "tea")
  val groups = words.associate { it.length to it }
  println("Groups: $groups")
}`,
    fixed: `fun main() {
  val words = listOf("fig", "kiwi", "plum", "pear", "tea")
  val groups = words.groupBy { it.length }
  println("Groups: $groups")
}`,
    expected: 'Groups: {3=[fig, tea], 4=[kiwi, plum, pear]}',
  },
  {
    id: 'window-vs-chunk', tags: ['lesson:zip-chunked-windowed', 'windowed-vs-chunked'], title: 'Fix the Missing Changes', bugType: 'logic', bugLabel: 'Logic Error: chunked skips the overlapping pairs', difficulty: 'hard',
    broken: `fun main() {
  val temps = listOf(10, 14, 12, 20)
  val pairs = temps.chunked(2)
  val diffs = pairs.map { it[1] - it[0] }
  println("Changes: $diffs")
}`,
    fixed: `fun main() {
  val temps = listOf(10, 14, 12, 20)
  val pairs = temps.windowed(2)
  val diffs = pairs.map { it[1] - it[0] }
  println("Changes: $diffs")
}`,
    expected: 'Changes: [4, -2, 8]',
  },
  {
    id: 'sorted-ignored', tags: ['lesson:distinct-sorted', 'sorted-vs-sort', 'new-list'], title: 'Fix the Ignored Sort', bugType: 'logic', bugLabel: 'Logic Error: sorted returns a new list', difficulty: 'medium',
    broken: `fun main() {
  val scores = mutableListOf(30, 10, 20)
  scores.sorted()
  println("Scores: $scores")
}`,
    fixed: `fun main() {
  val scores = mutableListOf(30, 10, 20)
  scores.sort()
  println("Scores: $scores")
}`,
    expected: 'Scores: [10, 20, 30]',
  },
  {
    id: 'name-not-price', tags: ['lesson:sortedby-min-max', 'maxByOrNull', 'selector'], title: 'Fix the Priciest Item', bugType: 'logic', bugLabel: 'Logic Error: the selector uses the wrong property', difficulty: 'medium',
    broken: `class Item(val name: String, val price: Int)

fun main() {
  val items = listOf(Item("pen", 12), Item("book", 45), Item("cap", 8))
  val priciest = items.maxByOrNull { it.name }
  println("Priciest: " + (priciest?.name ?: "none"))
}`,
    fixed: `class Item(val name: String, val price: Int)

fun main() {
  val items = listOf(Item("pen", 12), Item("book", 45), Item("cap", 8))
  val priciest = items.maxByOrNull { it.price }
  println("Priciest: " + (priciest?.name ?: "none"))
}`,
    expected: 'Priciest: book',
  },
  {
    id: 'empty-all', tags: ['lesson:sum-average-any-all-none', 'all-on-empty', 'isNotEmpty'], title: 'Fix the Empty Class', bugType: 'logic', bugLabel: 'Logic Error: all is true for an empty list', difficulty: 'hard',
    broken: `fun main() {
  val marks = listOf<Int>()
  val everyonePassed = marks.all { it >= 50 }
  println("Everyone passed: " + everyonePassed)
}`,
    fixed: `fun main() {
  val marks = listOf<Int>()
  val everyonePassed = marks.isNotEmpty() && marks.all { it >= 50 }
  println("Everyone passed: " + everyonePassed)
}`,
    expected: 'Everyone passed: false',
  },
  {
    id: 'find-null', tags: ['lesson:first-find-collection-pipelines-and-chai', 'find', 'nullable-result', 'elvis'], title: 'Fix the Missing Match', bugType: 'logic', bugLabel: 'Logic Error: find returns null when nothing matches', difficulty: 'medium',
    broken: `fun main() {
  val temps = listOf(18, 25, 31)
  val hot = temps.find { it > 99 }
  println("Hot: " + hot)
}`,
    fixed: `fun main() {
  val temps = listOf(18, 25, 31)
  val hot = temps.find { it > 99 }
  println("Hot: " + (hot ?: "none"))
}`,
    expected: 'Hot: none',
  },
  {
    id: 'take-first', tags: ['lesson:first-find-collection-pipelines-and-chai', 'pipeline-order', 'take', 'sortedDescending'], title: 'Fix the Pipeline Order', bugType: 'logic', bugLabel: 'Logic Error: take runs before the sort', difficulty: 'hard',
    broken: `fun main() {
  val scores = listOf(40, 90, 70, 100, 20)
  val top = scores.take(2).sortedDescending()
  println("Top: $top")
}`,
    fixed: `fun main() {
  val scores = listOf(40, 90, 70, 100, 20)
  val top = scores.sortedDescending().take(2)
  println("Top: $top")
}`,
    expected: 'Top: [100, 90]',
  },
];
